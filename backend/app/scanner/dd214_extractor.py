"""
DD-214 FIELD EXTRACTION ENGINE
Advanced pattern-based extraction for military service documents
Enhanced for accuracy with multiple document types and formats
"""

import re
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class ServiceBranch(str, Enum):
    """Military service branches"""
    ARMY = "Army"
    NAVY = "Navy"
    AIR_FORCE = "Air Force"
    MARINES = "Marines"
    COAST_GUARD = "Coast Guard"
    SPACE_FORCE = "Space Force"


class DischargeStatus(str, Enum):
    """Discharge status codes"""
    HONORABLE = "Honorable"
    GENERAL = "General"
    MEDICAL = "Medical"
    DISHONORABLE = "Dishonorable"
    BAD_CONDUCT = "Bad Conduct"


@dataclass
class ExtractedDD214Data:
    """Extracted DD-214 fields"""
    name: Optional[str] = None
    branch: Optional[str] = None
    service_start_date: Optional[str] = None  # YYYY-MM-DD
    service_end_date: Optional[str] = None  # YYYY-MM-DD
    rank: Optional[str] = None
    mos_codes: List[str] = field(default_factory=list)  # Military Occupational Specialty
    awards: List[str] = field(default_factory=list)
    discharge_status: Optional[str] = None
    discharge_code: Optional[str] = None
    narrative_reason: Optional[str] = None
    has_combat_service: bool = False
    service_character: Optional[str] = None  # Character of service
    extraction_confidence: float = 0.0
    extracted_fields: List[str] = field(default_factory=list)
    raw_text: Optional[str] = None
    errors: List[str] = field(default_factory=list)
    document_type: Optional[str] = None  # DD-214, MEB, STR, Rating Decision, Claim Letter


class DD214Extractor:
    """Extract military service information from DD-214 documents"""

    def __init__(self):
        self.branch_keywords = {
            ServiceBranch.ARMY: ['army', 'usa', 'united states army'],
            ServiceBranch.NAVY: ['navy', 'usn', 'united states navy'],
            ServiceBranch.AIR_FORCE: ['air force', 'usaf', 'united states air force'],
            ServiceBranch.MARINES: ['marine', 'usmc', 'united states marine corps'],
            ServiceBranch.COAST_GUARD: ['coast guard', 'uscg', 'united states coast guard'],
            ServiceBranch.SPACE_FORCE: ['space force', 'ussf', 'united states space force'],
        }

        self.discharge_keywords = {
            DischargeStatus.HONORABLE: ['honorable', 'honorably', 'honorable discharge'],
            DischargeStatus.GENERAL: ['general', 'general discharge'],
            DischargeStatus.MEDICAL: ['medical', 'medical discharge'],
            DischargeStatus.DISHONORABLE: ['dishonorable', 'dishonorable discharge'],
            DischargeStatus.BAD_CONDUCT: ['bad conduct', 'bad conduct discharge'],
        }

        self.award_keywords = {
            'Medal of Honor': ['medal of honor'],
            'Distinguished Service Cross': ['dsc', 'distinguished service cross'],
            'Navy Cross': ['navy cross'],
            'Air Force Cross': ['air force cross'],
            'Silver Star': ['silver star'],
            'Bronze Star': ['bronze star'],
            'Distinguished Flying Cross': ['dfc', 'distinguished flying cross'],
            'Air Medal': ['air medal'],
            'Purple Heart': ['purple heart'],
            'Good Conduct Medal': ['good conduct', 'gcm'],
            'Service Medal': ['service medal'],
            'Commendation Medal': ['commendation medal'],
            'Achievement Medal': ['achievement medal'],
            'Campaign Medal': ['campaign medal'],
            'Presidential Unit Citation': ['presidential unit citation'],
        }

        # Rank patterns
        self.rank_patterns = {
            'E-1': ['PVT', 'SEAMAN RECRUIT', 'AIRMAN BASIC'],
            'E-2': ['PFC', 'SEAMAN APPRENTICE', 'AIRMAN'],
            'E-3': ['CPL', 'SEAMAN', 'AIRMAN FIRST CLASS'],
            'E-4': ['SGT', 'PETTY OFFICER THIRD', 'SENIOR AIRMAN'],
            'E-5': ['SSG', 'PETTY OFFICER SECOND', 'STAFF SERGEANT'],
            'E-6': ['SFC', 'PETTY OFFICER FIRST', 'TECHNICAL SERGEANT'],
            'E-7': ['MSG', 'CHIEF PETTY OFFICER', 'MASTER SERGEANT'],
            'E-8': ['1SG', 'SENIOR CHIEF', 'SENIOR MASTER SERGEANT'],
            'E-9': ['SGM', 'MASTER CHIEF', 'CHIEF MASTER SERGEANT'],
            'W-1': ['WO1', 'WARRANT OFFICER'],
            'W-2': ['CW2', 'CHIEF WARRANT'],
            'W-3': ['CW3'],
            'W-4': ['CW4'],
            'O-1': ['2LT', 'ENS', 'SECOND LIEUTENANT'],
            'O-2': ['1LT', 'LTJG'],
            'O-3': ['CPT', 'LT'],
            'O-4': ['MAJ', 'LCDR'],
            'O-5': ['LTC', 'CDR'],
            'O-6': ['COL', 'CAPT'],
            'O-7': ['BG', 'RDML'],
            'O-8': ['MG', 'RADM'],
            'O-9': ['LTG', 'VADM'],
            'O-10': ['GEN', 'ADM'],
        }

        self.combat_keywords = ['combat', 'hostile fire', 'armed combat', 'combat zone', 'iraq', 'afghanistan', 'vietnam', 'korean']

    def extract(self, text: str) -> ExtractedDD214Data:
        """
        Extract DD-214 fields from OCR text
        """
        if not text:
            return ExtractedDD214Data(
                extraction_confidence=0.0,
                errors=['No text provided for extraction']
            )

        normalized_text = text.lower()
        raw_text = text

        data = ExtractedDD214Data(raw_text=raw_text)

        # Extract each field
        data.name = self._extract_name(raw_text, normalized_text)
        data.branch = self._extract_branch(normalized_text)
        data.service_start_date = self._extract_date(raw_text, 'entry')
        data.service_end_date = self._extract_date(raw_text, 'separation')
        data.rank = self._extract_rank(normalized_text)
        data.mos_codes = self._extract_mos(raw_text, normalized_text)
        data.awards = self._extract_awards(normalized_text)
        data.discharge_status = self._extract_discharge_status(normalized_text)
        data.discharge_code = self._extract_discharge_code(raw_text)
        data.narrative_reason = self._extract_narrative_reason(raw_text)
        data.has_combat_service = self._detect_combat_service(normalized_text)
        data.service_character = self._extract_service_character(normalized_text)

        # Calculate confidence and extracted fields
        data.extracted_fields = [f for f in [
            'name' if data.name else None,
            'branch' if data.branch else None,
            'service_start_date' if data.service_start_date else None,
            'service_end_date' if data.service_end_date else None,
            'rank' if data.rank else None,
            'mos_codes' if data.mos_codes else None,
            'awards' if data.awards else None,
            'discharge_status' if data.discharge_status else None,
            'discharge_code' if data.discharge_code else None,
            'narrative_reason' if data.narrative_reason else None,
            'combat_service' if data.has_combat_service else None,
            'service_character' if data.service_character else None,
        ] if f]

        data.extraction_confidence = len(data.extracted_fields) / 12.0  # 12 key fields

        return data

    def _extract_name(self, raw_text: str, normalized_text: str) -> Optional[str]:
        """Extract service member's name"""
        # Pattern: "NAME OF MEMBER" or similar
        patterns = [
            r"(?:name|member)\s*(?:of|:)?\s*([a-z\s\-\']+?)(?:\n|$)",
            r"^\s*([a-z]+(?:\s+[a-z]+)+)\s*\n",
        ]

        for pattern in patterns:
            match = re.search(pattern, normalized_text, re.MULTILINE)
            if match:
                name = match.group(1).strip().title()
                if name and len(name.split()) >= 2:
                    return name

        return None

    def _extract_branch(self, normalized_text: str) -> Optional[str]:
        """Extract service branch"""
        for branch, keywords in self.branch_keywords.items():
            for keyword in keywords:
                if keyword in normalized_text:
                    return branch.value

        return None

    def _extract_rank(self, normalized_text: str) -> Optional[str]:
        """Extract service rank"""
        for rank_code, rank_names in self.rank_patterns.items():
            for rank_name in rank_names:
                if rank_name.lower() in normalized_text:
                    return rank_code

        return None

    def _extract_date(self, raw_text: str, date_type: str) -> Optional[str]:
        """Extract service dates (entry/separation)"""
        # Patterns for dates
        date_patterns = [
            r'(\d{1,2})\s*(?:/|-)\s*(\d{1,2})\s*(?:/|-)\s*(\d{4})',  # MM/DD/YYYY or MM-DD-YYYY
            r'(\d{4})\s*(?:/|-)\s*(\d{1,2})\s*(?:/|-)\s*(\d{1,2})',  # YYYY/MM/DD
            r'(?:january|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{1,2}),?\s*(\d{4})',
        ]

        search_text = raw_text.lower()

        # Look for context
        if date_type == 'entry':
            context_keywords = ['entry', 'service', 'began', 'started', 'from']
        else:  # separation
            context_keywords = ['separation', 'release', 'discharge', 'ended', 'through']

        # Search near keywords
        for keyword in context_keywords:
            if keyword in search_text:
                idx = search_text.find(keyword)
                context = raw_text[max(0, idx - 100):min(len(raw_text), idx + 200)]

                for pattern in date_patterns:
                    match = re.search(pattern, context, re.IGNORECASE)
                    if match:
                        try:
                            groups = match.groups()
                            if len(groups) == 3:
                                # Try MM/DD/YYYY format
                                if len(groups[2]) == 4:
                                    month, day, year = int(groups[0]), int(groups[1]), int(groups[2])
                                else:
                                    year, month, day = int(groups[0]), int(groups[1]), int(groups[2])

                                if 1 <= month <= 12 and 1 <= day <= 31:
                                    return f"{year:04d}-{month:02d}-{day:02d}"
                        except (ValueError, IndexError):
                            continue

        return None

    def _extract_mos(self, raw_text: str, normalized_text: str) -> List[str]:
        """Extract Military Occupational Specialty codes"""
        # MOS codes are typically 5 digits
        mos_pattern = r'\b(\d{2}[A-Z]\d{2}[A-Z]?)\b'
        mos_matches = re.findall(mos_pattern, raw_text)

        if mos_matches:
            return list(set(mos_matches))

        # Alternative: look for "MOS:" or "SPECIALTY:" patterns
        specialty_patterns = [
            r'(?:mos|occupational specialty).*?:\s*([a-z0-9\s\-]+?)(?:\n|$)',
            r'specialty.*?:\s*([a-z0-9\s\-]+?)(?:\n|$)',
        ]

        for pattern in specialty_patterns:
            matches = re.findall(pattern, normalized_text, re.MULTILINE)
            if matches:
                return [m.strip() for m in matches]

        return []

    def _extract_awards(self, normalized_text: str) -> List[str]:
        """Extract military decorations and awards"""
        found_awards = []

        for award, keywords in self.award_keywords.items():
            for keyword in keywords:
                if keyword in normalized_text:
                    found_awards.append(award)
                    break

        return list(set(found_awards))

    def _extract_discharge_status(self, normalized_text: str) -> Optional[str]:
        """Extract character of discharge"""
        for status, keywords in self.discharge_keywords.items():
            for keyword in keywords:
                if keyword in normalized_text:
                    return status.value

        return None

    def _extract_discharge_code(self, raw_text: str) -> Optional[str]:
        """Extract discharge code (JGA, RE, HST, etc.)"""
        # Discharge codes are typically 3 letters
        code_pattern = r'\b([A-Z]{3})\b'
        codes = re.findall(code_pattern, raw_text)

        # Filter for common discharge codes
        discharge_codes = {'JGA', 'RE1', 'RE2', 'RE3', 'RE4', 'HST', 'HD', 'HGO'}
        for code in codes:
            if code in discharge_codes:
                return code

        return None

    def _extract_narrative_reason(self, raw_text: str) -> Optional[str]:
        """Extract narrative reason for separation"""
        patterns = [
            r'(?:narrative|reason).*?:\s*([^:\n]+)(?:\n|$)',
            r'narrative.*?separation.*?:\s*([^:\n]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, raw_text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1).strip()

        return None

    def _detect_combat_service(self, normalized_text: str) -> bool:
        """Detect if service member had combat service"""
        for keyword in self.combat_keywords:
            if keyword in normalized_text:
                return True

        return False

    def _extract_service_character(self, normalized_text: str) -> Optional[str]:
        """Extract character of service (honorable, general, etc.)"""
        for status, keywords in self.discharge_keywords.items():
            for keyword in keywords:
                if keyword in normalized_text:
                    return status.value

        return None
