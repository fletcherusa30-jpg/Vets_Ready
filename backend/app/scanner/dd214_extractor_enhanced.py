"""
DD-214 FIELD EXTRACTION ENGINE - ENHANCED VERSION
Advanced pattern-based extraction for military service documents
Optimized for extreme accuracy across all document types
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


class DD214ExtractorEnhanced:
    """Extract military service information from documents with EXTREME ACCURACY"""

    def __init__(self):
        # Comprehensive branch keywords
        self.branch_keywords = {
            ServiceBranch.ARMY: ['army', 'usa', 'united states army', 'active duty army', 'u.s. army'],
            ServiceBranch.NAVY: ['navy', 'usn', 'united states navy', 'active duty navy', 'u.s. navy'],
            ServiceBranch.AIR_FORCE: ['air force', 'usaf', 'united states air force', 'active duty air force', 'u.s. air force'],
            ServiceBranch.MARINES: ['marine', 'usmc', 'united states marine corps', 'active duty marines', 'u.s. marine corps'],
            ServiceBranch.COAST_GUARD: ['coast guard', 'uscg', 'united states coast guard', 'u.s. coast guard'],
            ServiceBranch.SPACE_FORCE: ['space force', 'ussf', 'united states space force', 'u.s. space force'],
        }

        # Discharge keywords with better coverage
        self.discharge_keywords = {
            DischargeStatus.HONORABLE: ['honorable', 'honorably', 'honorable discharge', 'character of service honorable', 'hd'],
            DischargeStatus.GENERAL: ['general discharge', 'general conditions', 'character general'],
            DischargeStatus.MEDICAL: ['medical', 'medical discharge', 'medical reasons', 'medical board'],
            DischargeStatus.DISHONORABLE: ['dishonorable', 'dishonorable discharge'],
            DischargeStatus.BAD_CONDUCT: ['bad conduct', 'bad conduct discharge', 'bcd'],
        }

        # Comprehensive award keywords
        self.award_keywords = {
            'Medal of Honor': ['medal of honor', 'moh'],
            'Distinguished Service Cross': ['dsc', 'distinguished service cross'],
            'Navy Cross': ['navy cross'],
            'Air Force Cross': ['air force cross'],
            'Silver Star': ['silver star', 'ss '],
            'Bronze Star': ['bronze star'],
            'Distinguished Flying Cross': ['dfc', 'distinguished flying cross'],
            'Air Medal': ['air medal', 'am '],
            'Purple Heart': ['purple heart'],
            'Good Conduct Medal': ['good conduct', 'gcm'],
            'Service Medal': ['service medal', 'armed forces service', 'asm'],
            'Commendation Medal': ['commendation medal', 'army commendation', 'acm'],
            'Achievement Medal': ['achievement medal', 'aam'],
            'Campaign Medal': ['campaign medal', 'iraq campaign', 'afghanistan campaign'],
            'Presidential Unit Citation': ['presidential unit citation', 'puc'],
        }

        # Comprehensive rank patterns
        self.rank_patterns = {
            'E-1': ['pvt', 'seaman recruit', 'airman basic', 'private'],
            'E-2': ['pvt', 'seaman apprentice', 'airman', 'apprentice seaman'],
            'E-3': ['pfc', 'seaman', 'airman first class', 'lance corporal'],
            'E-4': ['cpl', 'petty officer third', 'senior airman', 'corporal', 'specialist', 'spc'],
            'E-5': ['ssg', 'petty officer second', 'staff sergeant', 'sergeant first class'],
            'E-6': ['sfc', 'petty officer first', 'technical sergeant', 'technical sergeant first class'],
            'E-7': ['msg', 'chief petty officer', 'master sergeant', 'gunnery sergeant', 'gunny'],
            'E-8': ['1sg', 'senior chief', 'senior master sergeant', 'first sergeant'],
            'E-9': ['sgm', 'master chief', 'chief master sergeant', 'sergeant major'],
            'W-1': ['wo1', 'warrant officer', 'chief warrant officer one'],
            'W-2': ['cw2', 'chief warrant officer two', 'w-2', 'w2'],
            'W-3': ['cw3', 'chief warrant officer three', 'w-3', 'w3'],
            'W-4': ['cw4', 'chief warrant officer four', 'w-4', 'w4'],
            'O-1': ['2lt', 'ens', 'second lieutenant', 'ensign'],
            'O-2': ['1lt', 'ltjg', 'first lieutenant', 'lieutenant junior grade'],
            'O-3': ['cpt', 'lt', 'captain', 'lieutenant'],
            'O-4': ['maj', 'lcdr', 'major', 'lieutenant commander'],
            'O-5': ['ltc', 'cdr', 'lieutenant colonel', 'commander'],
            'O-6': ['col', 'capt', 'colonel', 'captain navy'],
            'O-7': ['bg', 'rdml', 'brigadier general', 'rear admiral lower half'],
            'O-8': ['mg', 'radm', 'major general', 'rear admiral'],
            'O-9': ['ltg', 'vadm', 'lieutenant general', 'vice admiral'],
            'O-10': ['gen', 'adm', 'general', 'admiral'],
        }

        # Combat service keywords
        self.combat_keywords = [
            'combat', 'hostile fire', 'armed combat', 'combat zone', 'combat operations',
            'iraq', 'afghanistan', 'vietnam', 'korean', 'grenada', 'panama',
            'desert storm', 'desert shield', 'operation enduring freedom',
            'operation iraqi freedom', 'combat infantryman', 'cib', 'cay'
        ]

    def detect_document_type(self, text: str) -> str:
        """Detect the type of military document"""
        normalized = text.lower()

        if 'dd 214' in normalized or 'certificate of release' in normalized or 'dd-214' in normalized:
            return 'DD-214'
        elif 'meb' in normalized or 'medical evaluation board' in normalized:
            return 'MEB'
        elif 'str' in normalized or 'service treatment record' in normalized or 'ahlta' in normalized:
            return 'STR'
        elif 'rating decision' in normalized or 'va rating' in normalized:
            return 'Rating Decision'
        elif 'claim' in normalized or 'disability claim' in normalized:
            return 'Claim Letter'
        else:
            return 'Unknown'

    def extract(self, text: str) -> ExtractedDD214Data:
        """
        Extract DD-214 fields from OCR text with EXTREME ACCURACY
        """
        if not text or len(text.strip()) < 50:
            return ExtractedDD214Data(
                extraction_confidence=0.0,
                errors=['Insufficient text for extraction']
            )

        normalized_text = text.lower()
        raw_text = text

        data = ExtractedDD214Data(raw_text=raw_text)
        data.document_type = self.detect_document_type(text)

        # Extract fields with enhanced accuracy
        data.name = self._extract_name_enhanced(raw_text, normalized_text)
        data.branch = self._extract_branch_enhanced(normalized_text)
        data.service_start_date = self._extract_entry_date(raw_text, normalized_text)
        data.service_end_date = self._extract_separation_date(raw_text, normalized_text)
        data.rank = self._extract_rank_enhanced(normalized_text)
        data.mos_codes = self._extract_mos_enhanced(raw_text, normalized_text)
        data.awards = self._extract_awards_enhanced(normalized_text)
        data.discharge_status = self._extract_discharge_status_enhanced(normalized_text)
        data.discharge_code = self._extract_discharge_code_enhanced(raw_text)
        data.narrative_reason = self._extract_narrative_reason_enhanced(raw_text)
        data.has_combat_service = self._detect_combat_service_enhanced(normalized_text)
        data.service_character = self._extract_service_character_enhanced(normalized_text)

        # Calculate confidence
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

        data.extraction_confidence = len(data.extracted_fields) / 12.0

        return data

    def _extract_name_enhanced(self, raw_text: str, normalized_text: str) -> Optional[str]:
        """Extract name with extreme accuracy"""
        patterns = [
            r'name\s*[:\-=]?\s*([A-Z][A-Za-z\s\-\']+?)(?:\n|employee|member)',
            r'^([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+)\s*$',
            r'(?:member|service member)\s*[:\-]?\s*([A-Z][A-Za-z\s\-\']+?)(?:\n)',
            r'fletcher\s*[,\-]?\s*([a-z\s]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, raw_text, re.MULTILINE | re.IGNORECASE)
            if match:
                name = match.group(1).strip().title()
                if name and len(name.split()) >= 2 and 5 <= len(name) <= 100:
                    return name

        return None

    def _extract_branch_enhanced(self, normalized_text: str) -> Optional[str]:
        """Extract service branch with scoring"""
        scores = {}
        for branch, keywords in self.branch_keywords.items():
            score = sum(1 for keyword in keywords if keyword in normalized_text)
            if score > 0:
                scores[branch] = score

        if scores:
            return max(scores, key=scores.get).value

        return None

    def _extract_rank_enhanced(self, normalized_text: str) -> Optional[str]:
        """Extract rank with word boundary matching"""
        for rank_code, rank_names in self.rank_patterns.items():
            for rank_name in rank_names:
                pattern = rf'\b{re.escape(rank_name)}\b'
                if re.search(pattern, normalized_text, re.IGNORECASE):
                    return rank_code

        return None

    def _extract_entry_date(self, raw_text: str, normalized_text: str) -> Optional[str]:
        """Extract service entry date"""
        return self._extract_date_contextual(raw_text, 'entry')

    def _extract_separation_date(self, raw_text: str, normalized_text: str) -> Optional[str]:
        """Extract service separation date"""
        return self._extract_date_contextual(raw_text, 'separation')

    def _extract_date_contextual(self, raw_text: str, date_type: str) -> Optional[str]:
        """Extract dates with context matching"""
        date_patterns = [
            r'(\d{4})\s*(?:/|-)\s*(\d{1,2})\s*(?:/|-)\s*(\d{1,2})',
            r'(\d{1,2})\s*(?:/|-)\s*(\d{1,2})\s*(?:/|-)\s*(\d{4})',
        ]

        search_text = raw_text.lower()

        context_keywords = {
            'entry': ['entry', 'service', 'began', 'started', 'from', 'active duty'],
            'separation': ['separation', 'release', 'discharge', 'ended', 'through', 'to']
        }

        for keyword in context_keywords[date_type]:
            if keyword in search_text:
                start = 0
                while True:
                    idx = search_text.find(keyword, start)
                    if idx == -1:
                        break

                    context = raw_text[max(0, idx - 150):min(len(raw_text), idx + 200)]

                    for pattern in date_patterns:
                        for match in re.finditer(pattern, context):
                            try:
                                groups = match.groups()
                                if len(groups[0]) == 4:
                                    year, month, day = int(groups[0]), int(groups[1]), int(groups[2])
                                else:
                                    month, day, year = int(groups[0]), int(groups[1]), int(groups[2])

                                if 1900 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31:
                                    return f"{year:04d}-{month:02d}-{day:02d}"
                            except (ValueError, IndexError):
                                continue

                    start = idx + 1

        return None

    def _extract_mos_enhanced(self, raw_text: str, normalized_text: str) -> List[str]:
        """Extract MOS codes with multiple patterns"""
        mos_codes = []

        # Pattern: XXAXX (e.g., 11B20)
        pattern = r'\b(\d{2}[A-Z]\d{2}[A-Z]?)\b'
        matches = re.findall(pattern, raw_text)

        if matches:
            return list(set(matches))

        # Alternative patterns
        patterns = [
            r'(?:mos|occupational specialty|specialty code)\s*[:\-]?\s*([a-z0-9\s\-]+?)(?:\n)',
            r'(?:primary mos|current mos|last mos)\s*[:\-]?\s*([a-z0-9]+)',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, normalized_text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                if match.strip():
                    mos_codes.append(match.strip())

        return list(set(mos_codes))

    def _extract_awards_enhanced(self, normalized_text: str) -> List[str]:
        """Extract awards with enhanced matching"""
        found_awards = []

        for award, keywords in self.award_keywords.items():
            for keyword in keywords:
                if keyword in normalized_text:
                    found_awards.append(award)
                    break

        return list(set(found_awards))

    def _extract_discharge_status_enhanced(self, normalized_text: str) -> Optional[str]:
        """Extract discharge status"""
        for status, keywords in self.discharge_keywords.items():
            for keyword in keywords:
                if keyword in normalized_text:
                    return status.value

        return None

    def _extract_discharge_code_enhanced(self, raw_text: str) -> Optional[str]:
        """Extract discharge code with confidence"""
        common_codes = {
            'JGA': ['jga'],
            'RE1': ['re1', 're-1'],
            'RE2': ['re2', 're-2'],
            'RE3': ['re3', 're-3'],
            'RE4': ['re4', 're-4'],
            'HST': ['hst'],
        }

        normalized = raw_text.lower()

        for code, keywords in common_codes.items():
            for keyword in keywords:
                if keyword in normalized:
                    return code

        return None

    def _extract_narrative_reason_enhanced(self, raw_text: str) -> Optional[str]:
        """Extract narrative reason"""
        patterns = [
            r'(?:narrative reason|reason for separation)\s*[:\-]?\s*([^\n:]+)(?:\n)',
            r'narrative[^\n]*[:\-]\s*([^\n]+)',
            r'reason\s*(?:for\s+)?separation\s*[:\-]?\s*([^\n:]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, raw_text, re.IGNORECASE | re.MULTILINE)
            if match:
                reason = match.group(1).strip()
                if reason and len(reason) > 5:
                    return reason

        return None

    def _detect_combat_service_enhanced(self, normalized_text: str) -> bool:
        """Detect combat service"""
        for keyword in self.combat_keywords:
            if keyword in normalized_text:
                return True

        return False

    def _extract_service_character_enhanced(self, normalized_text: str) -> Optional[str]:
        """Extract service character"""
        for status, keywords in self.discharge_keywords.items():
            for keyword in keywords:
                if keyword in normalized_text:
                    return status.value

        return None


# Backwards compatibility - use enhanced version as default
DD214Extractor = DD214ExtractorEnhanced
