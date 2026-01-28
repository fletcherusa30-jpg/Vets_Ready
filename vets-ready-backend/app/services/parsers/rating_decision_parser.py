"""
VA RATING DECISION PARSER

Extracts structured data from VA Rating Decision documents.

EXTRACTS:
- All service-connected conditions
- All percentage ratings
- All effective dates
- All diagnostic codes
- Bilateral factors
- Combined rating calculations
- Evidence references
- Favorable/unfavorable findings

OUTPUT:
- Structured JSON with all extracted data
- Confidence scores per field
- Timeline of rating changes
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from pathlib import Path

from app.services.ocr_extraction import get_ocr_engine

logger = logging.getLogger(__name__)


class RatingDecisionParser:
    """Parser for VA Rating Decision documents"""

    def __init__(self):
        self.ocr_engine = get_ocr_engine()

        # Common patterns in rating decisions
        self.patterns = {
            'condition': r'(?:Service[- ]Connected|SC)[\s:]+([A-Za-z0-9\s,\-\(\)]+?)(?:\s+\d+%|\s+Diagnostic)',
            'percentage': r'(\d+)%',
            'diagnostic_code': r'Diagnostic Code[:\s]+(\d+)',
            'effective_date': r'Effective Date[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            'bilateral': r'bilateral',
            'combined_rating': r'Combined(?:\s+Service[- ]Connected)?\s+Rating[:\s]+(\d+)%',
            'evidence': r'(?:Based on|Pursuant to|Evidence of|Medical evidence shows?)[:\s]+([^\n.]+)',
            'favorable': r'(?:granted|approved|favorable|service[- ]connected)[:\s]+([^\n.]+)',
            'unfavorable': r'(?:denied|not service[- ]connected|unfavorable)[:\s]+([^\n.]+)'
        }

    async def parse_file(self, file_path: str) -> Dict[str, Any]:
        """
        Parse a VA Rating Decision document.

        Returns:
            {
                'success': bool,
                'conditions': List[dict],
                'ratings': List[dict],
                'effective_dates': List[str],
                'diagnostic_codes': List[str],
                'bilateral_conditions': List[str],
                'combined_rating': Optional[int],
                'evidence': List[str],
                'favorable_findings': List[str],
                'unfavorable_findings': List[str],
                'raw_text': str,
                'confidence': float,
                'extraction_method': str,
                'error': Optional[str]
            }
        """
        logger.info(f"Parsing VA Rating Decision: {file_path}")

        try:
            # Extract text using OCR engine
            extraction_result = await self.ocr_engine.extract_text(file_path)

            if not extraction_result['success']:
                return {
                    'success': False,
                    'error': f"Text extraction failed: {extraction_result['error']}",
                    'conditions': [],
                    'ratings': [],
                    'effective_dates': [],
                    'diagnostic_codes': [],
                    'bilateral_conditions': [],
                    'combined_rating': None,
                    'evidence': [],
                    'favorable_findings': [],
                    'unfavorable_findings': []
                }

            text = extraction_result['text']

            # Parse all components
            conditions = self._extract_conditions(text)
            ratings = self._extract_ratings(text)
            effective_dates = self._extract_effective_dates(text)
            diagnostic_codes = self._extract_diagnostic_codes(text)
            bilateral_conditions = self._extract_bilateral_conditions(text)
            combined_rating = self._extract_combined_rating(text)
            evidence = self._extract_evidence(text)
            favorable_findings = self._extract_favorable_findings(text)
            unfavorable_findings = self._extract_unfavorable_findings(text)

            # Match conditions with ratings and codes
            structured_conditions = self._match_conditions_with_details(
                conditions, ratings, diagnostic_codes, effective_dates, bilateral_conditions
            )

            # Calculate confidence
            confidence = self._calculate_confidence(
                extraction_result['confidence'],
                len(structured_conditions),
                len(ratings),
                combined_rating is not None
            )

            result = {
                'success': True,
                'conditions': structured_conditions,
                'ratings': ratings,
                'effective_dates': effective_dates,
                'diagnostic_codes': diagnostic_codes,
                'bilateral_conditions': bilateral_conditions,
                'combined_rating': combined_rating,
                'evidence': evidence,
                'favorable_findings': favorable_findings,
                'unfavorable_findings': unfavorable_findings,
                'raw_text': text[:1000],  # First 1000 chars for reference
                'confidence': confidence,
                'extraction_method': extraction_result['method'],
                'character_count': extraction_result['character_count'],
                'error': None
            }

            logger.info(f"Rating Decision parsed: {len(structured_conditions)} conditions, {combined_rating}% combined rating")

            return result

        except Exception as e:
            logger.error(f"Rating Decision parsing failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'conditions': [],
                'ratings': [],
                'effective_dates': [],
                'diagnostic_codes': [],
                'bilateral_conditions': [],
                'combined_rating': None,
                'evidence': [],
                'favorable_findings': [],
                'unfavorable_findings': []
            }

    def _extract_conditions(self, text: str) -> List[str]:
        """Extract all service-connected conditions"""
        conditions = []

        # Pattern 1: "Service Connected: Condition Name"
        matches = re.finditer(self.patterns['condition'], text, re.IGNORECASE)
        for match in matches:
            condition = match.group(1).strip()
            if condition and len(condition) > 3:
                conditions.append(self._clean_condition_name(condition))

        # Pattern 2: Look for condition names followed by percentage
        percentage_pattern = r'([A-Za-z\s,\-\(\)]+?)\s+(\d+)%'
        matches = re.finditer(percentage_pattern, text)
        for match in matches:
            condition = match.group(1).strip()
            if condition and len(condition) > 5 and not re.search(r'combined|total|rating', condition, re.IGNORECASE):
                cleaned = self._clean_condition_name(condition)
                if cleaned not in conditions:
                    conditions.append(cleaned)

        return list(set(conditions))

    def _extract_ratings(self, text: str) -> List[Dict[str, Any]]:
        """Extract all percentage ratings"""
        ratings = []

        # Find all percentage values
        matches = re.finditer(self.patterns['percentage'], text)
        for match in matches:
            percentage = int(match.group(1))

            # Get context around the percentage
            start = max(0, match.start() - 100)
            end = min(len(text), match.end() + 100)
            context = text[start:end]

            # Skip combined ratings
            if re.search(r'combined|total', context, re.IGNORECASE):
                continue

            # Try to find condition name
            condition_match = re.search(r'([A-Za-z\s,\-\(\)]+?)\s+' + str(percentage) + r'%', context)
            condition = condition_match.group(1).strip() if condition_match else None

            ratings.append({
                'percentage': percentage,
                'condition': self._clean_condition_name(condition) if condition else None,
                'context': context.strip()
            })

        return ratings

    def _extract_effective_dates(self, text: str) -> List[str]:
        """Extract all effective dates"""
        dates = []

        matches = re.finditer(self.patterns['effective_date'], text, re.IGNORECASE)
        for match in matches:
            date_str = match.group(1)
            # Normalize date format
            normalized = self._normalize_date(date_str)
            if normalized and normalized not in dates:
                dates.append(normalized)

        return dates

    def _extract_diagnostic_codes(self, text: str) -> List[str]:
        """Extract all VA diagnostic codes"""
        codes = []

        matches = re.finditer(self.patterns['diagnostic_code'], text, re.IGNORECASE)
        for match in matches:
            code = match.group(1)
            if code not in codes:
                codes.append(code)

        # Also look for standalone 4-digit codes that might be diagnostic codes
        standalone_pattern = r'\b(\d{4})\b'
        matches = re.finditer(standalone_pattern, text)
        for match in matches:
            code = match.group(1)
            # Only include if in reasonable range for diagnostic codes (5000-9999)
            if 5000 <= int(code) <= 9999 and code not in codes:
                codes.append(code)

        return codes

    def _extract_bilateral_conditions(self, text: str) -> List[str]:
        """Extract conditions marked as bilateral"""
        bilateral = []

        # Find instances of "bilateral" and get context
        for match in re.finditer(self.patterns['bilateral'], text, re.IGNORECASE):
            start = max(0, match.start() - 100)
            end = min(len(text), match.end() + 100)
            context = text[start:end]

            # Try to find condition name near "bilateral"
            condition_match = re.search(r'([A-Za-z\s,\-\(\)]+?)\s+bilateral', context, re.IGNORECASE)
            if condition_match:
                condition = self._clean_condition_name(condition_match.group(1))
                if condition not in bilateral:
                    bilateral.append(condition)

        return bilateral

    def _extract_combined_rating(self, text: str) -> Optional[int]:
        """Extract the combined disability rating"""
        match = re.search(self.patterns['combined_rating'], text, re.IGNORECASE)
        if match:
            return int(match.group(1))

        # Alternative pattern
        alt_pattern = r'Total(?:\s+Disability)?\s+Rating[:\s]+(\d+)%'
        match = re.search(alt_pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))

        return None

    def _extract_evidence(self, text: str) -> List[str]:
        """Extract evidence references"""
        evidence = []

        matches = re.finditer(self.patterns['evidence'], text, re.IGNORECASE)
        for match in matches:
            evidence_text = match.group(1).strip()
            if evidence_text and len(evidence_text) > 10:
                evidence.append(evidence_text)

        return evidence[:20]  # Limit to 20 most relevant

    def _extract_favorable_findings(self, text: str) -> List[str]:
        """Extract favorable findings"""
        findings = []

        matches = re.finditer(self.patterns['favorable'], text, re.IGNORECASE)
        for match in matches:
            finding = match.group(1).strip()
            if finding and len(finding) > 10:
                findings.append(finding)

        return findings[:20]

    def _extract_unfavorable_findings(self, text: str) -> List[str]:
        """Extract unfavorable findings"""
        findings = []

        matches = re.finditer(self.patterns['unfavorable'], text, re.IGNORECASE)
        for match in matches:
            finding = match.group(1).strip()
            if finding and len(finding) > 10:
                findings.append(finding)

        return findings[:20]

    def _match_conditions_with_details(
        self,
        conditions: List[str],
        ratings: List[Dict[str, Any]],
        diagnostic_codes: List[str],
        effective_dates: List[str],
        bilateral_conditions: List[str]
    ) -> List[Dict[str, Any]]:
        """Match conditions with their ratings, codes, and dates"""
        structured = []

        # Create a mapping of ratings to conditions
        rating_map = {}
        for rating in ratings:
            if rating['condition']:
                rating_map[rating['condition']] = rating['percentage']

        for condition in conditions:
            # Try to find matching rating
            percentage = None
            for cond_name, pct in rating_map.items():
                if self._conditions_match(condition, cond_name):
                    percentage = pct
                    break

            # Check if bilateral
            is_bilateral = any(self._conditions_match(condition, bc) for bc in bilateral_conditions)

            structured.append({
                'condition': condition,
                'percentage': percentage,
                'diagnostic_code': None,  # Would need more sophisticated matching
                'effective_date': effective_dates[0] if effective_dates else None,
                'bilateral': is_bilateral,
                'confidence': 0.8 if percentage else 0.6
            })

        return structured

    def _clean_condition_name(self, condition: Optional[str]) -> str:
        """Clean and normalize condition names"""
        if not condition:
            return ""

        # Remove extra whitespace
        cleaned = re.sub(r'\s+', ' ', condition.strip())

        # Remove common artifacts
        cleaned = re.sub(r'\bDiagnostic Code\b.*', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\bEffective Date\b.*', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\d+%', '', cleaned)

        # Capitalize properly
        cleaned = cleaned.strip()

        return cleaned

    def _normalize_date(self, date_str: str) -> Optional[str]:
        """Normalize date to YYYY-MM-DD format"""
        # Try multiple date formats
        formats = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{2})',
            r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})'
        ]

        for fmt in formats:
            match = re.search(fmt, date_str)
            if match:
                parts = match.groups()
                if len(parts[0]) == 4:  # YYYY-MM-DD
                    return f"{parts[0]}-{parts[1]:0>2}-{parts[2]:0>2}"
                else:  # MM-DD-YYYY or MM-DD-YY
                    year = parts[2] if len(parts[2]) == 4 else f"20{parts[2]}"
                    return f"{year}-{parts[0]:0>2}-{parts[1]:0>2}"

        return None

    def _conditions_match(self, cond1: str, cond2: str) -> bool:
        """Check if two condition names match (fuzzy)"""
        cond1_lower = cond1.lower().strip()
        cond2_lower = cond2.lower().strip()

        # Exact match
        if cond1_lower == cond2_lower:
            return True

        # One contains the other
        if cond1_lower in cond2_lower or cond2_lower in cond1_lower:
            return True

        # Similar (simple word matching)
        words1 = set(cond1_lower.split())
        words2 = set(cond2_lower.split())
        common = words1 & words2

        # If at least 60% of words match
        if len(common) >= 0.6 * min(len(words1), len(words2)):
            return True

        return False

    def _calculate_confidence(
        self,
        ocr_confidence: float,
        num_conditions: int,
        num_ratings: int,
        has_combined_rating: bool
    ) -> float:
        """Calculate overall parsing confidence"""
        confidence = ocr_confidence * 0.4  # 40% from OCR quality

        # 30% from finding conditions
        if num_conditions > 0:
            confidence += 0.3

        # 20% from finding ratings
        if num_ratings > 0:
            confidence += 0.2

        # 10% from finding combined rating
        if has_combined_rating:
            confidence += 0.1

        return min(1.0, confidence)
