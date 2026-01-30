"""Legal reference service for VA regulations (M21-1, 38 CFR Parts 3 & 4)"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session


class LegalReferenceService:
    """Service for VA regulations and legal reference materials"""

    def __init__(self, db: Session):
        self.db = db

    # ===== M21-1 (RATING SCHEDULE) =====

    def get_m21_1_reference(self, condition_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Get M21-1 Rating Schedule references

        M21-1: VA Schedule for Rating Disabilities
        Contains disability ratings for all compensable conditions
        """
        if condition_code:
            return self._get_condition_rating(condition_code)

        return {
            "document": "M21-1",
            "full_name": "VA Schedule for Rating Disabilities",
            "version": "2024",
            "description": "The VA rating schedule is used to determine what percentage to rate your service-connected disabilities",
            "structure": {
                "diagnostic_codes": "38 CFR 4.1-4.150",
                "rating_percentages": [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                "effective_date": "January 1, 2024",
            },
            "key_sections": {
                "part_1": {
                    "title": "The General Rating Formula",
                    "description": "How VA ratings work and how they're combined",
                    "topics": [
                        "Individual ratings (10%-100%)",
                        "Combined rating methodology",
                        "Effective dates",
                        "Rating conversions",
                    ],
                },
                "part_2": {
                    "title": "Body System Ratings",
                    "systems": [
                        "Musculoskeletal",
                        "Neurological",
                        "Mental Disorders",
                        "Respiratory",
                        "Cardiovascular",
                        "Gastrointestinal",
                        "Genitourinary",
                        "Gynecological",
                        "Endocrine",
                        "Hemic & Lymphatic",
                        "Infectious Diseases",
                        "Dental",
                        "Skin",
                        "Eye",
                        "Ear",
                    ],
                },
            },
            "how_to_use": [
                "Find your condition's diagnostic code",
                "Look up the rating criteria",
                "Match your symptoms to the criteria",
                "Determine the appropriate percentage",
                "Use combined rating table for multiple conditions",
            ],
            "official_source": "https://www.va.gov/disability/about-disability-ratings/",
            "pdf_download": "https://www.va.gov/WARMS/docs/regs/pdfsite/schedule.pdf",
        }

    def _get_condition_rating(self, condition_code: str) -> Dict[str, Any]:
        """Get specific condition rating criteria from M21-1"""
        conditions = {
            "F4310": {
                "condition": "Post-Traumatic Stress Disorder (PTSD)",
                "diagnostic_code": "F4310",
                "rating_criteria": {
                    "10": "Mild, occasional symptoms; minimal functional impairment",
                    "30": "Moderate symptoms; some functional impairment; sleep disturbance",
                    "50": "Frequent severe symptoms; frequent impairment; social withdrawal",
                    "70": "Severe symptoms; frequent panic attacks; severe social withdrawal",
                    "100": "Severe symptoms; unable to work; severe functional impairment",
                },
                "examination_factors": [
                    "Nightmares and sleep disturbance",
                    "Flashbacks and intrusive thoughts",
                    "Avoidance behaviors",
                    "Hyperarousal (startle response)",
                    "Social dysfunction",
                    "Occupational dysfunction",
                ],
                "medical_evidence": [
                    "VA medical examination",
                    "Private medical records",
                    "Buddy statements",
                    "Stressor documentation",
                ],
                "appeal_considerations": "Must establish in-service stressor event",
            },
            "S06": {
                "condition": "Traumatic Brain Injury (TBI)",
                "diagnostic_code": "S06",
                "rating_criteria": {
                    "10": "Mild TBI; minimal cognitive symptoms",
                    "20": "Mild-moderate TBI; some memory/concentration issues",
                    "30": "Moderate TBI; significant cognitive dysfunction",
                    "40": "Moderate-severe TBI; notable impairment",
                    "50": "Severe TBI; significant functional impairment",
                    "60": "Severe TBI; marked functional limitations",
                    "70": "Very severe TBI; severe functional limitations",
                    "100": "Complete incapacitation",
                },
                "examination_factors": [
                    "Cognitive testing results",
                    "Memory assessment",
                    "Concentration and processing speed",
                    "Balance and coordination",
                    "Headaches and neurological symptoms",
                ],
                "medical_evidence": [
                    "CT/MRI imaging",
                    "Neuropsychological testing",
                    "VA neurology evaluation",
                    "Loss of consciousness documentation",
                ],
                "appeal_considerations": "Recent VA changes favor veterans with evidence of TBI",
            },
            "H9311": {
                "condition": "Tinnitus",
                "diagnostic_code": "H9311",
                "rating_criteria": {
                    "10": "Service-connected tinnitus is rated at 10% minimum",
                },
                "rating_note": "Tinnitus can only be rated at 10% once service-connected is established",
                "examination_factors": [
                    "Audiological testing",
                    "Onset timing (in-service vs. post-service)",
                    "Service-connection establishment",
                ],
                "medical_evidence": [
                    "Audiometry results",
                    "Military medical records",
                    "Statement in support of claim",
                ],
                "appeal_considerations": "Often combined with hearing loss for higher ratings",
            },
        }

        if condition_code in conditions:
            return {
                "condition": conditions[condition_code],
                "reference": "M21-1 Rating Schedule",
                "note": "Ratings are guidelines; VA will evaluate based on your specific medical evidence",
            }

        return {
            "message": f"Condition code {condition_code} not found in database",
            "suggestion": "Check condition code format or consult VA medical professional",
        }

    # ===== 38 CFR PART 3 (ADJUDICATION) =====

    def get_38_cfr_part_3(self, section: Optional[str] = None) -> Dict[str, Any]:
        """
        Get 38 CFR Part 3 - Adjudication references

        38 CFR Part 3: Adjudication
        Defines rules for establishing eligibility and granting benefits
        """
        if section:
            return self._get_cfr_3_section(section)

        return {
            "regulation": "38 CFR Part 3",
            "title": "Adjudication",
            "purpose": "Rules and procedures for establishing veteran eligibility and granting VA benefits",
            "key_subparts": {
                "subpart_a": {
                    "title": "Decisions and Effective Dates",
                    "sections": {
                        "3_1": "Decisions - what they mean and how they're made",
                        "3_2": "Effective dates of decisions",
                        "3_3": "Reopening and revising decisions",
                        "3_4": "Appeals and judicial review",
                    },
                },
                "subpart_b": {
                    "title": "Eligibility",
                    "sections": {
                        "3_12": "Period of service",
                        "3_13": "Active duty service",
                        "3_14": "Discharge requirements",
                        "3_15": "Survivors and dependents",
                    },
                },
                "subpart_c": {
                    "title": "Evidence",
                    "sections": {
                        "3_26": "Timing of evidence",
                        "3_27": "Application of service connection",
                        "3_28": "Effective dates of evidence",
                    },
                },
                "subpart_d": {
                    "title": "Benefits",
                    "sections": {
                        "3_39": "Conditions to be rated",
                        "3_40": "Disability ratings",
                        "3_41": "Combined ratings",
                    },
                },
            },
            "critical_concepts": {
                "service_connection": {
                    "definition": "Presumptive relationship between in-service event and current disability",
                    "requirements": [
                        "Current medical diagnosis",
                        "Evidence of in-service incident/illness",
                        "Nexus (medical link) between the two",
                    ],
                    "reference": "38 CFR 3.303",
                },
                "presumptive_conditions": {
                    "definition": "Conditions VA automatically connects to service",
                    "examples": [
                        "Vietnam service + Agent Orange exposure → specified conditions",
                        "Gulf War service → Gulf War syndrome conditions",
                        "Radiation exposure → specified cancers",
                    ],
                    "reference": "38 CFR 3.309",
                },
                "secondary_service_connection": {
                    "definition": "Disability caused by or aggravated by service-connected condition",
                    "example": "Service-connected knee injury → depression from chronic pain",
                    "requirement": "Medical evidence showing causal relationship",
                    "reference": "38 CFR 3.310",
                },
            },
            "important_sections": {
                "3_103": {
                    "title": "Duty to Assist",
                    "description": "VA must help veterans obtain necessary evidence",
                    "your_right": "VA should request military records and conduct exams",
                },
                "3_156": {
                    "title": "Standard of Evidence",
                    "description": "Preponderance of evidence standard (more likely than not)",
                    "meaning": "Evidence favoring you needs to outweigh evidence against",
                },
                "3_160": {
                    "title": "Benefit of the Doubt",
                    "description": "When evidence is equal, veteran gets benefit",
                    "your_advantage": "Ambiguity must be resolved in your favor",
                },
            },
            "official_source": "https://www.ecfr.gov/current/title-38/part-3/",
            "pdf_download": "https://www.va.gov/WARMS/docs/regs/cfr/38CFR3.pdf",
        }

    def _get_cfr_3_section(self, section: str) -> Dict[str, Any]:
        """Get specific 38 CFR Part 3 section"""
        sections = {
            "3_303": {
                "title": "Establishing Service Connection",
                "summary": "How to prove service connection",
                "requirements": [
                    "Current medical diagnosis",
                    "Evidence of in-service event",
                    "Medical nexus (link) between service and current condition",
                ],
                "key_points": [
                    "Doesn't need to be rated in-service to be service-connected",
                    "Can file up to the effective date of discharge",
                    "Nexus can be established by VA examination",
                ],
            },
            "3_309": {
                "title": "Presumptive Service Connection",
                "summary": "VA-presumed conditions that don't need nexus",
                "presumptive_categories": [
                    "Vietnam-era herbicide exposure (Agent Orange)",
                    "Gulf War service",
                    "Radiation exposure",
                    "Combat PTSD",
                    "Transition-related medical conditions",
                ],
                "benefit": "Presumed = lower burden of proof",
            },
            "3_310": {
                "title": "Secondary Service Connection",
                "summary": "Conditions caused by service-connected disabilities",
                "requirement": "Show causal relationship to service-connected condition",
                "examples": [
                    "Depression from chronic pain (service-connected back injury)",
                    "Hearing loss from tinnitus aggravation",
                    "Medication side effects from service-connected condition treatment",
                ],
            },
        }

        if section in sections:
            return {
                "section": section,
                "regulation": "38 CFR Part 3",
                "content": sections[section],
                "official_source": f"https://www.ecfr.gov/current/title-38/part-3/section-{section.replace('_', '-')}/",
            }

        return {"message": f"Section {section} not found"}

    # ===== 38 CFR PART 4 (RATING SCHEDULE) =====

    def get_38_cfr_part_4(self, diagnostic_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Get 38 CFR Part 4 - Disability Rating Schedule

        38 CFR Part 4: Schedule for Rating Disabilities
        Contains the actual rating percentages for each condition
        """
        if diagnostic_code:
            return self._get_diagnostic_code_details(diagnostic_code)

        return {
            "regulation": "38 CFR Part 4",
            "title": "Schedule for Rating Disabilities",
            "purpose": "Disability rating criteria for compensable conditions",
            "key_sections": {
                "4_1_4_150": {
                    "title": "Diagnostic Codes and Rating Criteria",
                    "structure": "Organized by body system with multiple diagnostic codes",
                    "rating_range": "10% to 100%",
                },
            },
            "body_systems": {
                "musculoskeletal": {
                    "description": "Bones, joints, muscles, ligaments",
                    "examples": ["Back pain", "Arthritis", "Joint replacement"],
                    "rating_factors": [
                        "Range of motion limitations",
                        "Pain severity",
                        "Functional impairment",
                    ],
                },
                "neurological": {
                    "description": "Brain, spinal cord, nerves",
                    "examples": ["TBI", "PTSD", "Migraines", "Residual paralysis"],
                    "rating_factors": [
                        "Cognitive impairment",
                        "Headaches",
                        "Neurological deficits",
                    ],
                },
                "mental_health": {
                    "description": "Mental disorders",
                    "examples": ["PTSD", "Depression", "Anxiety", "Sleep disorders"],
                    "rating_factors": [
                        "Occupational impairment",
                        "Social impairment",
                        "Symptom severity",
                    ],
                },
                "respiratory": {
                    "description": "Lungs and airways",
                    "examples": ["Asthma", "Sleep apnea", "COPD"],
                    "rating_factors": [
                        "FEV1 measurements",
                        "Dyspnea (shortness of breath)",
                        "Exercise limitations",
                    ],
                },
                "cardiovascular": {
                    "description": "Heart and blood vessels",
                    "examples": ["Heart disease", "Hypertension", "Arrhythmias"],
                    "rating_factors": [
                        "Ejection fraction",
                        "Functional capacity",
                        "Medication requirements",
                    ],
                },
            },
            "rating_methodology": {
                "individual_ratings": "Each condition rated 10%, 20%, 30%, ..., 100%",
                "combined_ratings": "Multiple conditions combined using VA formula",
                "effective_dates": "Ratings effective from decision date",
            },
            "special_ratings": {
                "total_disability": {
                    "abbreviation": "TDIU",
                    "description": "Rated as 100% if unable to work",
                    "requirement": "Single 60%+ or multiple conditions totaling 70%+",
                },
                "housebound": {
                    "abbreviation": "Aid & Attendance",
                    "description": "Additional benefit for requiring assistance",
                    "adds_to_rating": "Special monthly compensation on top of rating",
                },
                "smc": {
                    "abbreviation": "Special Monthly Compensation",
                    "description": "Additional benefit for specific conditions",
                    "examples": [
                        "Loss of use of limbs",
                        "Blindness",
                        "Deafness",
                        "Need for assistance and attendant care",
                    ],
                },
            },
            "official_source": "https://www.ecfr.gov/current/title-38/part-4/",
            "quick_reference": "https://www.va.gov/disability/about-disability-ratings/",
        }

    def _get_diagnostic_code_details(self, diagnostic_code: str) -> Dict[str, Any]:
        """Get rating criteria for specific diagnostic code"""
        codes = {
            "5299-5301": {
                "condition": "Arthritis (various types)",
                "body_system": "Musculoskeletal",
                "rating_range": "10% - 60%",
                "key_factors": [
                    "Range of motion",
                    "Pain",
                    "Swelling and heat",
                    "Functional impact",
                ],
            },
            "6522": {
                "condition": "Sleep Apnea",
                "body_system": "Respiratory",
                "rating_range": "0% - 100%",
                "key_factors": [
                    "Apnea hypopnea index (AHI) score",
                    "Oxygen saturation drops",
                    "Daytime sleepiness",
                    "CPAP dependency",
                ],
            },
            "F4310": {
                "condition": "PTSD",
                "body_system": "Mental Health",
                "rating_range": "10% - 100%",
                "key_factors": [
                    "Occupational impairment",
                    "Social impairment",
                    "Frequency of symptoms",
                    "Severity of symptoms",
                ],
            },
        }

        if diagnostic_code in codes:
            return {
                "diagnostic_code": diagnostic_code,
                "regulation": "38 CFR Part 4",
                "details": codes[diagnostic_code],
            }

        return {"message": f"Diagnostic code {diagnostic_code} not found in quick reference"}

    # ===== INTEGRATED CLAIM GUIDANCE =====

    def get_claim_guidance(self, condition_codes: List[str]) -> Dict[str, Any]:
        """
        Integrated guidance for claim submission
        Combines M21-1 and 38 CFR references
        """
        guidance = {
            "claim_preparation": {
                "step_1": {
                    "title": "Gather Service Connection Evidence",
                    "references": ["38 CFR 3.303", "38 CFR 3.309"],
                    "checklist": [
                        "Service medical records (DD 214, medical discharge papers)",
                        "In-service incident documentation",
                        "Medical evidence from private providers",
                        "Buddy statements about in-service event",
                    ],
                },
                "step_2": {
                    "title": "Get Current Medical Evidence",
                    "references": ["38 CFR 3.156"],
                    "checklist": [
                        "Current VA medical examination",
                        "Private medical records",
                        "Specialist evaluations",
                        "Test results (imaging, labs, etc.)",
                    ],
                },
                "step_3": {
                    "title": "Establish Medical Nexus",
                    "references": ["38 CFR 3.303", "38 CFR 3.310"],
                    "explanation": "Show link between service and current condition",
                    "documentation": [
                        "Medical provider statement",
                        "VA examination findings",
                        "Scientific/medical literature",
                    ],
                },
                "step_4": {
                    "title": "Reference Rating Criteria",
                    "references": ["M21-1", "38 CFR Part 4"],
                    "action": "Review rating criteria for your condition",
                    "resources": [
                        "M21-1 Rating Schedule",
                        "38 CFR Part 4",
                        "VA rating formula calculator",
                    ],
                },
            },
            "legal_standards": {
                "preponderance_of_evidence": {
                    "reference": "38 CFR 3.156",
                    "meaning": "More likely than not (>50% probability)",
                    "your_benefit": "Evidence supporting your case must outweigh opposing evidence",
                },
                "benefit_of_doubt": {
                    "reference": "38 CFR 3.160",
                    "meaning": "When evidence is equal, veteran wins",
                    "your_benefit": "Ambiguity resolved in your favor",
                },
                "duty_to_assist": {
                    "reference": "38 CFR 3.103",
                    "meaning": "VA must help obtain evidence",
                    "your_benefit": "VA will request records and order exams",
                },
            },
            "appeal_basis": {
                "reference": "38 CFR 3.4",
                "grounds": [
                    "New and relevant evidence (reopen old decisions)",
                    "Disagreement with rating percentage",
                    "Disagreement with effective date",
                    "Claim denied (service connection not established)",
                ],
                "process": [
                    "File VA Form 21-0958 (Notice of Disagreement)",
                    "Provide new evidence or argument",
                    "Request hearing if desired",
                    "BVA makes final decision",
                ],
            },
        }

        return guidance

    # ===== QUICK REFERENCE TOOLS =====

    def combined_rating_calculator(self, individual_ratings: List[int]) -> Dict[str, Any]:
        """
        Calculate combined disability rating per VA formula

        Formula: Highest + (100 - Highest) × Sum(Others) / 100
        Rounded to nearest 10%

        Reference: 38 CFR 4.25
        """
        if not individual_ratings or all(r == 0 for r in individual_ratings):
            return {"combined_rating": 0, "reference": "38 CFR 4.25"}

        sorted_ratings = sorted([r for r in individual_ratings if r > 0], reverse=True)
        combined = sorted_ratings[0]

        for rating in sorted_ratings[1:]:
            combined = combined + (100 - combined) * rating // 100

        # Round to nearest 10
        combined_rounded = round(combined / 10) * 10

        return {
            "individual_ratings": individual_ratings,
            "combined_rating": min(combined_rounded, 100),
            "calculation_steps": [
                f"Highest: {sorted_ratings[0]}%",
                f"Apply formula: {sorted_ratings[0]} + (100-{sorted_ratings[0]}) × combined_others / 100",
                f"Round to nearest 10: {combined_rounded}%",
            ],
            "reference": "38 CFR 4.25",
            "note": "Rounded to nearest 10% per VA rating schedule",
        }

    def get_presumptive_conditions(self, service_period: str) -> List[Dict[str, Any]]:
        """Get presumptive conditions for service period"""
        presumptive_map = {
            "vietnam": [
                {
                    "condition": "Agent Orange related diseases",
                    "examples": ["Diabetes", "COPD", "Certain cancers", "Ischemic heart disease"],
                    "reference": "38 CFR 3.309(d)",
                    "stressor_required": False,
                },
                {
                    "condition": "Combat PTSD",
                    "examples": ["PTSD"],
                    "reference": "38 CFR 3.309(e)",
                    "stressor_required": False,
                    "note": "Only if fear or imminent personal peril",
                },
            ],
            "gulf_war": [
                {
                    "condition": "Gulf War Illness",
                    "examples": [
                        "Unexplained symptoms",
                        "Chronic pain",
                        "Respiratory symptoms",
                        "Neurological symptoms",
                    ],
                    "reference": "38 CFR 3.309(e)",
                    "stressor_required": False,
                },
            ],
        }

        return presumptive_map.get(service_period, [])
