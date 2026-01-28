"""
DD-214 PARSER

Extracts structured data from DD Form 214 (Certificate of Release or Discharge from Active Duty).

EXTRACTS:
- Personal Information (Name, Branch, Service Number)
- Service Dates (Entry, Separation)
- Character of Service
- Military Occupational Specialty (MOS)
- Decorations, Medals, and Awards
- Deployment History
- Separation Reason and Code
- Narrative Reason for Separation
- Reentry Code
- Type of Separation

OUTPUT:
- Structured JSON with all DD-214 fields
- Validation and confidence scoring
"""

import re
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

from app.services.ocr_extraction import get_ocr_engine

logger = logging.getLogger(__name__)


class DD214Parser:
    """Parser for DD-214 forms"""

    def __init__(self):
        self.ocr_engine = get_ocr_engine()

        # DD-214 field patterns (supports multiple formats/versions)
        self.patterns = {
            # Personal Information
            'name': r'(?:Name|Full Name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            'ssn': r'(?:SSN|Social Security Number)[:\s]+([\dX\-]+)',
            'grade_rank': r'(?:Grade|Rank|Pay Grade)[:\s]+([A-Z0-9\-]+)',
            'branch': r'(?:Branch|Service)[:\s]+(Army|Navy|Air Force|Marine Corps|Marines|Coast Guard|Space Force)',

            # Dates
            'date_entered': r'(?:Date Entered|Entry Date|PEBD)[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            'date_separated': r'(?:Date (?:of )?Separation|Release Date|Separation Date)[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            'net_active_service': r'(?:Net Active Service|Time in Service)[:\s]+(\d+\s+Years?,?\s+\d+\s+Months?,?\s+\d+\s+Days?)',

            # Service Details
            'mos': r'(?:MOS|AFSC|Rating|NEC|Primary Specialty)[:\s]+([A-Z0-9]{2,6})',
            'character_of_service': r'(?:Character of Service|Type of Separation)[:\s]+(Honorable|General|Under Honorable Conditions|Other Than Honorable|Dishonorable|Bad Conduct|Entry Level Separation)',

            # Decorations and Awards
            'decorations': r'(?:Decorations|Medals|Awards|Ribbons)[:\s]+([^\n]+)',

            # Separation
            'separation_code': r'(?:Separation Code|SPN Code|SPD Code)[:\s]+([A-Z0-9]{2,4})',
            'narrative_reason': r'(?:Narrative Reason|Reason for Separation)[:\s]+([^\n]+)',
            'authority': r'(?:Authority|Separation Authority)[:\s]+([^\n]+)',
            'reentry_code': r'(?:Reentry Code|RE Code|Reenlistment Code)[:\s]+([A-Z0-9]{1,2})',

            # Deployment
            'deployment': r'(?:Foreign Service|Overseas|Deployment|Combat|Iraq|Afghanistan|Vietnam|Korea|OIF|OEF|OND)',

            # Type of Separation
            'type_separation': r'(?:Type of Separation)[:\s]+(Honorable|General|Medical|Retirement|ETS|Convenience of Government|Hardship)',
        }

        # Known decorations/awards
        self.known_awards = [
            'Purple Heart', 'Bronze Star', 'Silver Star', 'Medal of Honor',
            'Distinguished Service Cross', 'Navy Cross', 'Air Force Cross',
            'Combat Action Badge', 'Combat Action Ribbon', 'Combat Infantryman Badge',
            'Army Commendation Medal', 'Navy Achievement Medal', 'Air Medal',
            'Good Conduct Medal', 'National Defense Service Medal',
            'Iraq Campaign Medal', 'Afghanistan Campaign Medal',
            'Global War on Terrorism Service Medal', 'Armed Forces Service Medal'
        ]

    async def parse_file(self, file_path: str) -> Dict[str, Any]:
        """
        Parse a DD-214 document.

        Returns:
            {
                'success': bool,
                'name': Optional[str],
                'ssn': Optional[str],
                'branch': Optional[str],
                'grade_rank': Optional[str],
                'mos': Optional[str],
                'date_entered': Optional[str],
                'date_separated': Optional[str],
                'net_active_service': Optional[str],
                'character_of_service': Optional[str],
                'decorations': List[str],
                'deployment_history': List[str],
                'separation_code': Optional[str],
                'narrative_reason': Optional[str],
                'reentry_code': Optional[str],
                'type_separation': Optional[str],
                'authority': Optional[str],
                'fields_extracted': int,
                'confidence': float,
                'error': Optional[str]
            }
        """
        logger.info(f"Parsing DD-214: {file_path}")

        try:
            # Extract text using OCR engine
            extraction_result = await self.ocr_engine.extract_text(file_path)

            if not extraction_result['success']:
                return self._error_result(f"Text extraction failed: {extraction_result['error']}")

            text = extraction_result['text']

            # Validate it looks like a DD-214
            if not self._validate_dd214(text):
                return self._error_result("Document does not appear to be a DD-214")

            # Extract all fields
            result = {
                'success': True,
                'name': self._extract_field('name', text),
                'ssn': self._extract_field('ssn', text),
                'branch': self._extract_field('branch', text),
                'grade_rank': self._extract_field('grade_rank', text),
                'mos': self._extract_field('mos', text),
                'date_entered': self._normalize_date(self._extract_field('date_entered', text)),
                'date_separated': self._normalize_date(self._extract_field('date_separated', text)),
                'net_active_service': self._extract_field('net_active_service', text),
                'character_of_service': self._extract_field('character_of_service', text),
                'decorations': self._extract_decorations(text),
                'deployment_history': self._extract_deployment_history(text),
                'separation_code': self._extract_field('separation_code', text),
                'narrative_reason': self._extract_field('narrative_reason', text),
                'reentry_code': self._extract_field('reentry_code', text),
                'type_separation': self._extract_field('type_separation', text),
                'authority': self._extract_field('authority', text),
                'raw_text_sample': text[:500],
                'extraction_method': extraction_result['method'],
                'character_count': extraction_result['character_count'],
                'error': None
            }

            # Count fields extracted
            fields_extracted = sum(1 for k, v in result.items()
                                  if k not in ['success', 'raw_text_sample', 'extraction_method', 'character_count', 'error', 'fields_extracted', 'confidence']
                                  and v)

            result['fields_extracted'] = fields_extracted

            # Calculate confidence
            result['confidence'] = self._calculate_confidence(
                extraction_result['confidence'],
                fields_extracted,
                result['character_of_service'] is not None
            )

            # Validation
            if fields_extracted == 0:
                return self._error_result("No DD-214 fields could be extracted")

            if fields_extracted < 3:
                logger.warning(f"Low field extraction count: {fields_extracted}")

            logger.info(f"DD-214 parsed: {fields_extracted} fields extracted, {result['confidence']:.2f} confidence")

            return result

        except Exception as e:
            logger.error(f"DD-214 parsing failed: {e}")
            return self._error_result(str(e))

    def _validate_dd214(self, text: str) -> bool:
        """Validate that document appears to be a DD-214"""
        # Check for DD-214 indicators
        indicators = [
            r'DD\s*214',
            r'Certificate of Release',
            r'Discharge from Active Duty',
            r'Department of Defense',
            r'DD Form 214'
        ]

        matches = sum(1 for pattern in indicators if re.search(pattern, text, re.IGNORECASE))

        return matches >= 2

    def _extract_field(self, field_name: str, text: str) -> Optional[str]:
        """Extract a specific field using its pattern"""
        pattern = self.patterns.get(field_name)
        if not pattern:
            return None

        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            # Return the first capture group
            return match.group(1).strip()

        return None

    def _extract_decorations(self, text: str) -> List[str]:
        """Extract all decorations, medals, and awards"""
        decorations = []

        # Try pattern-based extraction first
        match = re.search(self.patterns['decorations'], text, re.IGNORECASE)
        if match:
            decoration_text = match.group(1)

            # Split by common separators
            potential_awards = re.split(r'[,;]\s*|\s+and\s+|\n', decoration_text)

            for award in potential_awards:
                award = award.strip()
                if len(award) > 3:
                    decorations.append(award)

        # Also search for known awards throughout the document
        for known_award in self.known_awards:
            if re.search(re.escape(known_award), text, re.IGNORECASE):
                if known_award not in decorations:
                    decorations.append(known_award)

        return decorations

    def _extract_deployment_history(self, text: str) -> List[str]:
        """Extract deployment/foreign service history"""
        deployments = []

        # Find deployment-related text
        for match in re.finditer(self.patterns['deployment'], text, re.IGNORECASE):
            # Get context around the match
            start = max(0, match.start() - 100)
            end = min(len(text), match.end() + 100)
            context = text[start:end].strip()

            # Look for dates in context
            date_matches = re.findall(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', context)

            deployment_entry = match.group(0)
            if date_matches:
                deployment_entry += f" ({', '.join(date_matches[:2])})"

            if deployment_entry not in deployments:
                deployments.append(deployment_entry)

        return deployments

    def _normalize_date(self, date_str: Optional[str]) -> Optional[str]:
        """Normalize date to YYYY-MM-DD format"""
        if not date_str:
            return None

        # Try multiple date formats
        formats = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',  # MM/DD/YYYY
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{2})',  # MM/DD/YY
            r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY/MM/DD
        ]

        for fmt in formats:
            match = re.search(fmt, date_str)
            if match:
                parts = match.groups()

                if len(parts[0]) == 4:  # YYYY-MM-DD format
                    year, month, day = parts
                    return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                else:  # MM-DD-YYYY or MM-DD-YY
                    month, day, year = parts
                    if len(year) == 2:
                        # Assume 20XX for years < 50, 19XX for years >= 50
                        year = f"20{year}" if int(year) < 50 else f"19{year}"
                    return f"{year}-{month.zfill(2)}-{day.zfill(2)}"

        return date_str  # Return as-is if can't parse

    def _calculate_confidence(
        self,
        ocr_confidence: float,
        fields_extracted: int,
        has_character_of_service: bool
    ) -> float:
        """Calculate overall parsing confidence"""
        confidence = ocr_confidence * 0.3  # 30% from OCR quality

        # 50% from number of fields extracted (max at 10 fields)
        field_confidence = min(fields_extracted / 10.0, 1.0) * 0.5
        confidence += field_confidence

        # 20% bonus if character of service found (critical field)
        if has_character_of_service:
            confidence += 0.2

        return min(1.0, confidence)

    def _error_result(self, error: str) -> Dict[str, Any]:
        """Create standardized error result"""
        return {
            'success': False,
            'error': error,
            'name': None,
            'ssn': None,
            'branch': None,
            'grade_rank': None,
            'mos': None,
            'date_entered': None,
            'date_separated': None,
            'net_active_service': None,
            'character_of_service': None,
            'decorations': [],
            'deployment_history': [],
            'separation_code': None,
            'narrative_reason': None,
            'reentry_code': None,
            'type_separation': None,
            'authority': None,
            'fields_extracted': 0,
            'confidence': 0.0
        }


# Common DD-214 interpretations for reference
DD214_SEPARATION_CODES = {
    'JBK': 'Completion of required active service',
    'JFF': 'Retirement',
    'JFV': 'Voluntary retirement',
    'JFT': 'Non-disability retirement',
    'JGA': 'Early release - Reduction in Force',
    'KBD': 'Completion of Active Duty Service Commitment',
}

DD214_REENTRY_CODES = {
    'RE-1': 'Eligible for reenlistment',
    'RE-2': 'Eligible for reenlistment, but some restrictions apply',
    'RE-3': 'Normally not eligible for reenlistment, but may be waived',
    'RE-4': 'Not eligible for reenlistment',
}

DD214_CHARACTER_DESCRIPTIONS = {
    'Honorable': 'Service member met or exceeded standards of acceptable conduct and performance',
    'General (Under Honorable Conditions)': 'Service member\'s conduct was satisfactory but not exemplary',
    'Other Than Honorable': 'Serious misconduct, but not severe enough for dishonorable discharge',
    'Bad Conduct': 'Punitive discharge from court-martial',
    'Dishonorable': 'Most severe discharge, reserved for serious crimes',
}
