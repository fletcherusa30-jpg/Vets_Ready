"""
STR (SERVICE TREATMENT RECORDS) PARSER

Extracts medical data from Service Treatment Records to identify:
- Medical encounters and timeline
- Symptoms, diagnoses, and treatments
- Service connection indicators
- Chronicity patterns
- MOS-related injuries
- Deployment-related conditions

OUTPUT:
- Medical event timeline
- Condition clusters
- Service connection indicators
- Symptom progression analysis
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from collections import defaultdict
from pathlib import Path

from app.services.ocr_extraction import get_ocr_engine

logger = logging.getLogger(__name__)


class STRParser:
    """Parser for Service Treatment Records (STR)"""

    def __init__(self):
        self.ocr_engine = get_ocr_engine()

        # Medical terminology patterns
        self.patterns = {
            'date': r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            'encounter_type': r'(?:Sick Call|Clinic Visit|Emergency|Hospitalization|Physical Exam)',
            'chief_complaint': r'(?:Chief Complaint|CC|C/C)[:\s]+([^\n.]+)',
            'diagnosis': r'(?:Diagnosis|Dx|Assessment)[:\s]+([^\n.]+)',
            'symptoms': r'(?:Symptoms?|Complaints?|Reports?)[:\s]+([^\n.]+)',
            'treatment': r'(?:Treatment|Rx|Plan)[:\s]+([^\n.]+)',
            'medication': r'(?:Prescribed|Medication|Rx)[:\s]+([^\n.]+)',
            'injury': r'(?:Injury|Injured|Trauma|Accident)[:\s]+([^\n.]+)',
            'surgery': r'(?:Surgery|Surgical|Operation|Procedure)[:\s]+([^\n.]+)',
            'deployment': r'(?:Deployment|Deployed|Iraq|Afghanistan|OIF|OEF|Combat)',
            'mos': r'(?:MOS|Military Occupational Specialty)[:\s]+(\d{3,5}[A-Z]?)',
            'exposure': r'(?:Exposure|Exposed to|Agent Orange|Burn Pit|Radiation|Chemical)',
            'chronic': r'(?:Chronic|Long[- ]term|Ongoing|Persistent|Recurrent)',
            'service_related': r'(?:Service[- ]related|In[- ]service|Line of duty|LOD)',
        }

        # Common service-connected conditions
        self.common_conditions = {
            'musculoskeletal': ['back pain', 'knee pain', 'shoulder pain', 'neck pain', 'arthritis', 'joint pain'],
            'mental_health': ['ptsd', 'depression', 'anxiety', 'sleep disorder', 'insomnia'],
            'hearing': ['tinnitus', 'hearing loss', 'acoustic trauma'],
            'respiratory': ['asthma', 'copd', 'bronchitis', 'sinusitis'],
            'neurological': ['headache', 'migraine', 'tbi', 'traumatic brain injury', 'seizure'],
            'cardiovascular': ['hypertension', 'heart disease', 'coronary'],
            'dermatological': ['skin condition', 'rash', 'psoriasis', 'eczema']
        }

    async def parse_file(self, file_path: str) -> Dict[str, Any]:
        """
        Parse Service Treatment Records.

        Returns:
            {
                'success': bool,
                'timeline': List[dict],  # Chronological medical events
                'condition_clusters': Dict[str, List],  # Grouped by condition type
                'symptoms': List[dict],
                'diagnoses': List[dict],
                'treatments': List[dict],
                'injuries': List[str],
                'surgeries': List[str],
                'medications': List[str],
                'deployment_related': List[str],
                'mos_patterns': List[str],
                'exposures': List[str],
                'chronic_conditions': List[str],
                'service_connection_indicators': List[dict],
                'symptom_progression': List[dict],
                'confidence': float,
                'error': Optional[str]
            }
        """
        logger.info(f"Parsing STR: {file_path}")

        try:
            # Extract text using OCR engine
            extraction_result = await self.ocr_engine.extract_text(file_path)

            if not extraction_result['success']:
                return self._error_result(f"Text extraction failed: {extraction_result['error']}")

            text = extraction_result['text']

            # Parse all components
            timeline = self._build_timeline(text)
            symptoms = self._extract_symptoms(text)
            diagnoses = self._extract_diagnoses(text)
            treatments = self._extract_treatments(text)
            injuries = self._extract_injuries(text)
            surgeries = self._extract_surgeries(text)
            medications = self._extract_medications(text)
            deployment_related = self._extract_deployment_related(text)
            mos_patterns = self._extract_mos_patterns(text)
            exposures = self._extract_exposures(text)
            chronic_conditions = self._identify_chronic_conditions(text, timeline)

            # Advanced analysis
            condition_clusters = self._cluster_conditions(diagnoses, symptoms)
            service_connection_indicators = self._identify_service_connection(
                text, timeline, deployment_related, mos_patterns, exposures, injuries
            )
            symptom_progression = self._analyze_symptom_progression(timeline, symptoms)

            # Calculate confidence
            confidence = self._calculate_confidence(
                extraction_result['confidence'],
                len(timeline),
                len(diagnoses),
                len(symptoms)
            )

            result = {
                'success': True,
                'timeline': timeline,
                'condition_clusters': condition_clusters,
                'symptoms': symptoms,
                'diagnoses': diagnoses,
                'treatments': treatments,
                'injuries': injuries,
                'surgeries': surgeries,
                'medications': medications,
                'deployment_related': deployment_related,
                'mos_patterns': mos_patterns,
                'exposures': exposures,
                'chronic_conditions': chronic_conditions,
                'service_connection_indicators': service_connection_indicators,
                'symptom_progression': symptom_progression,
                'raw_text_sample': text[:1000],
                'confidence': confidence,
                'extraction_method': extraction_result['method'],
                'character_count': extraction_result['character_count'],
                'error': None
            }

            logger.info(f"STR parsed: {len(timeline)} events, {len(diagnoses)} diagnoses, {len(service_connection_indicators)} SC indicators")

            return result

        except Exception as e:
            logger.error(f"STR parsing failed: {e}")
            return self._error_result(str(e))

    def _build_timeline(self, text: str) -> List[Dict[str, Any]]:
        """Build chronological timeline of medical events"""
        events = []

        # Split text into sections (by date or encounter)
        lines = text.split('\n')
        current_date = None
        current_event = None

        for line in lines:
            # Look for dates
            date_match = re.search(self.patterns['date'], line)
            if date_match:
                # Save previous event
                if current_event:
                    events.append(current_event)

                # Start new event
                current_date = self._normalize_date(date_match.group(1))
                current_event = {
                    'date': current_date,
                    'type': self._identify_encounter_type(line),
                    'content': line,
                    'symptoms': [],
                    'diagnoses': [],
                    'treatments': []
                }
            elif current_event:
                # Add to current event
                current_event['content'] += ' ' + line

                # Extract components
                if re.search(r'symptom|complaint|reports?', line, re.IGNORECASE):
                    current_event['symptoms'].append(line.strip())
                if re.search(r'diagnos|assessment', line, re.IGNORECASE):
                    current_event['diagnoses'].append(line.strip())
                if re.search(r'treatment|plan|rx', line, re.IGNORECASE):
                    current_event['treatments'].append(line.strip())

        # Add last event
        if current_event:
            events.append(current_event)

        # Sort by date
        events.sort(key=lambda x: x['date'] if x['date'] else '9999-12-31')

        return events

    def _extract_symptoms(self, text: str) -> List[Dict[str, Any]]:
        """Extract all symptoms mentioned"""
        symptoms = []

        matches = re.finditer(self.patterns['symptoms'], text, re.IGNORECASE)
        for match in matches:
            symptom_text = match.group(1).strip()

            # Get date context
            context_start = max(0, match.start() - 200)
            context = text[context_start:match.start()]
            date = self._find_nearest_date(context)

            symptoms.append({
                'symptom': symptom_text,
                'date': date,
                'context': symptom_text
            })

        return symptoms

    def _extract_diagnoses(self, text: str) -> List[Dict[str, Any]]:
        """Extract all diagnoses"""
        diagnoses = []

        matches = re.finditer(self.patterns['diagnosis'], text, re.IGNORECASE)
        for match in matches:
            diagnosis_text = match.group(1).strip()

            # Get date context
            context_start = max(0, match.start() - 200)
            context = text[context_start:match.start()]
            date = self._find_nearest_date(context)

            diagnoses.append({
                'diagnosis': diagnosis_text,
                'date': date,
                'category': self._categorize_condition(diagnosis_text)
            })

        return diagnoses

    def _extract_treatments(self, text: str) -> List[Dict[str, Any]]:
        """Extract all treatments"""
        treatments = []

        matches = re.finditer(self.patterns['treatment'], text, re.IGNORECASE)
        for match in matches:
            treatment_text = match.group(1).strip()

            context_start = max(0, match.start() - 200)
            context = text[context_start:match.start()]
            date = self._find_nearest_date(context)

            treatments.append({
                'treatment': treatment_text,
                'date': date
            })

        return treatments

    def _extract_injuries(self, text: str) -> List[str]:
        """Extract injury references"""
        injuries = []

        matches = re.finditer(self.patterns['injury'], text, re.IGNORECASE)
        for match in matches:
            injury = match.group(1).strip()
            if injury and len(injury) > 5:
                injuries.append(injury)

        return injuries

    def _extract_surgeries(self, text: str) -> List[str]:
        """Extract surgical procedures"""
        surgeries = []

        matches = re.finditer(self.patterns['surgery'], text, re.IGNORECASE)
        for match in matches:
            surgery = match.group(1).strip()
            if surgery and len(surgery) > 5:
                surgeries.append(surgery)

        return surgeries

    def _extract_medications(self, text: str) -> List[str]:
        """Extract medications"""
        medications = []

        matches = re.finditer(self.patterns['medication'], text, re.IGNORECASE)
        for match in matches:
            med = match.group(1).strip()
            if med and len(med) > 3:
                medications.append(med)

        return medications

    def _extract_deployment_related(self, text: str) -> List[str]:
        """Extract deployment-related references"""
        deployment_refs = []

        for match in re.finditer(self.patterns['deployment'], text, re.IGNORECASE):
            start = max(0, match.start() - 100)
            end = min(len(text), match.end() + 100)
            context = text[start:end].strip()
            deployment_refs.append(context)

        return deployment_refs

    def _extract_mos_patterns(self, text: str) -> List[str]:
        """Extract MOS references and related injuries"""
        mos_refs = []

        matches = re.finditer(self.patterns['mos'], text, re.IGNORECASE)
        for match in matches:
            mos_code = match.group(1)
            start = max(0, match.start() - 100)
            end = min(len(text), match.end() + 100)
            context = text[start:end].strip()
            mos_refs.append(f"MOS {mos_code}: {context}")

        return mos_refs

    def _extract_exposures(self, text: str) -> List[str]:
        """Extract exposure references (Agent Orange, burn pits, etc.)"""
        exposures = []

        for match in re.finditer(self.patterns['exposure'], text, re.IGNORECASE):
            start = max(0, match.start() - 50)
            end = min(len(text), match.end() + 100)
            context = text[start:end].strip()
            exposures.append(context)

        return exposures

    def _identify_chronic_conditions(self, text: str, timeline: List[Dict]) -> List[str]:
        """Identify chronic/recurring conditions"""
        chronic = []

        # Pattern 1: Explicit "chronic" mentions
        for match in re.finditer(self.patterns['chronic'], text, re.IGNORECASE):
            start = max(0, match.start() - 50)
            end = min(len(text), match.end() + 50)
            context = text[start:end].strip()
            chronic.append(context)

        # Pattern 2: Conditions appearing multiple times in timeline
        condition_counts = defaultdict(int)
        for event in timeline:
            for diagnosis in event.get('diagnoses', []):
                condition_counts[diagnosis.lower()] += 1

        for condition, count in condition_counts.items():
            if count >= 3 and condition not in [c.lower() for c in chronic]:
                chronic.append(f"{condition} (appears {count} times)")

        return chronic

    def _cluster_conditions(self, diagnoses: List[Dict], symptoms: List[Dict]) -> Dict[str, List]:
        """Group conditions by category"""
        clusters = defaultdict(list)

        for diagnosis in diagnoses:
            category = diagnosis.get('category', 'other')
            clusters[category].append(diagnosis['diagnosis'])

        return dict(clusters)

    def _identify_service_connection(
        self,
        text: str,
        timeline: List[Dict],
        deployment_refs: List[str],
        mos_refs: List[str],
        exposures: List[str],
        injuries: List[str]
    ) -> List[Dict[str, Any]]:
        """Identify indicators of service connection"""
        indicators = []

        # Direct service-related mentions
        for match in re.finditer(self.patterns['service_related'], text, re.IGNORECASE):
            start = max(0, match.start() - 100)
            end = min(len(text), match.end() + 100)
            context = text[start:end].strip()
            indicators.append({
                'type': 'Direct Service Reference',
                'indicator': context,
                'strength': 'high'
            })

        # Deployment-related injuries
        if deployment_refs:
            indicators.append({
                'type': 'Deployment-Related',
                'indicator': f"{len(deployment_refs)} deployment references found",
                'strength': 'high',
                'details': deployment_refs[:3]
            })

        # MOS-related patterns
        if mos_refs:
            indicators.append({
                'type': 'MOS-Related',
                'indicator': f"{len(mos_refs)} MOS references found",
                'strength': 'medium',
                'details': mos_refs[:3]
            })

        # Environmental exposures
        if exposures:
            indicators.append({
                'type': 'Environmental Exposure',
                'indicator': f"{len(exposures)} exposure references found",
                'strength': 'high',
                'details': exposures[:3]
            })

        # Injuries during service
        if injuries:
            indicators.append({
                'type': 'Service Injuries',
                'indicator': f"{len(injuries)} injury references found",
                'strength': 'high',
                'details': injuries[:3]
            })

        # Chronicity (condition started in service and continues)
        if len(timeline) > 5:
            indicators.append({
                'type': 'Chronicity',
                'indicator': f'Extensive medical history with {len(timeline)} encounters',
                'strength': 'medium'
            })

        return indicators

    def _analyze_symptom_progression(self, timeline: List[Dict], symptoms: List[Dict]) -> List[Dict]:
        """Analyze how symptoms progress over time"""
        progression = []

        # Group symptoms by type
        symptom_groups = defaultdict(list)

        for event in timeline:
            date = event.get('date')
            for symptom in event.get('symptoms', []):
                # Extract key symptom words
                key_words = self._extract_key_words(symptom)
                for word in key_words:
                    symptom_groups[word].append({
                        'date': date,
                        'description': symptom
                    })

        # Analyze progression for each symptom type
        for symptom_type, occurrences in symptom_groups.items():
            if len(occurrences) >= 2:
                progression.append({
                    'symptom': symptom_type,
                    'first_occurrence': occurrences[0]['date'],
                    'latest_occurrence': occurrences[-1]['date'],
                    'frequency': len(occurrences),
                    'pattern': 'recurring' if len(occurrences) >= 3 else 'intermittent'
                })

        return progression

    def _categorize_condition(self, condition: str) -> str:
        """Categorize a condition by body system"""
        condition_lower = condition.lower()

        for category, keywords in self.common_conditions.items():
            for keyword in keywords:
                if keyword in condition_lower:
                    return category

        return 'other'

    def _identify_encounter_type(self, text: str) -> str:
        """Identify type of medical encounter"""
        match = re.search(self.patterns['encounter_type'], text, re.IGNORECASE)
        return match.group(0) if match else 'Unknown'

    def _find_nearest_date(self, context: str) -> Optional[str]:
        """Find the nearest date in context"""
        matches = list(re.finditer(self.patterns['date'], context))
        if matches:
            return self._normalize_date(matches[-1].group(1))
        return None

    def _normalize_date(self, date_str: str) -> str:
        """Normalize date to YYYY-MM-DD"""
        # Try multiple formats
        formats = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{2})',
        ]

        for fmt in formats:
            match = re.search(fmt, date_str)
            if match:
                month, day, year = match.groups()
                if len(year) == 2:
                    year = f"20{year}"
                return f"{year}-{month:0>2}-{day:0>2}"

        return date_str

    def _extract_key_words(self, text: str) -> List[str]:
        """Extract key medical words from text"""
        # Remove common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'}
        words = re.findall(r'\b\w+\b', text.lower())
        key_words = [w for w in words if w not in stop_words and len(w) > 3]
        return key_words[:5]  # Top 5 key words

    def _calculate_confidence(
        self,
        ocr_confidence: float,
        num_events: int,
        num_diagnoses: int,
        num_symptoms: int
    ) -> float:
        """Calculate parsing confidence"""
        confidence = ocr_confidence * 0.3

        if num_events > 0:
            confidence += 0.3
        if num_diagnoses > 0:
            confidence += 0.2
        if num_symptoms > 0:
            confidence += 0.2

        return min(1.0, confidence)

    def _error_result(self, error: str) -> Dict[str, Any]:
        """Create error result"""
        return {
            'success': False,
            'error': error,
            'timeline': [],
            'condition_clusters': {},
            'symptoms': [],
            'diagnoses': [],
            'treatments': [],
            'injuries': [],
            'surgeries': [],
            'medications': [],
            'deployment_related': [],
            'mos_patterns': [],
            'exposures': [],
            'chronic_conditions': [],
            'service_connection_indicators': [],
            'symptom_progression': []
        }
