"""
DD-214 Document Processing Router

Handles DD-214 upload, OCR extraction, field parsing, and validation.
All processing happens server-side with comprehensive error logging.

Legal Compliance:
- Non-destructive: does not file claims or transmit data
- Educational and preparatory only
- All extractions require veteran review/confirmation
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from pathlib import Path
from datetime import datetime
import json
import logging
import uuid
import re
import os
import shutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/dd214", tags=["dd214"])

# Configuration
PROJECT_ROOT = Path(r"C:\Dev\Rally Forge")
UPLOAD_DIR = PROJECT_ROOT / "Data" / "Documents"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DD214_LOGS_DIR = PROJECT_ROOT / "logs" / "dd214"
DD214_LOGS_DIR.mkdir(parents=True, exist_ok=True)

# In-memory job storage (use Redis/database in production)
extraction_jobs: Dict[str, Dict[str, Any]] = {}


class DD214ExtractedData(BaseModel):
    """DD-214 extraction result model"""
    # Core Service Information
    branch: str = ""
    entryDate: str = ""
    separationDate: str = ""
    characterOfService: str = ""

    # Separation Details
    separationCode: str = ""
    narrativeReasonForSeparation: str = ""

    # Rank & Pay
    payGrade: str = ""
    rank: str = ""

    # Awards & Decorations
    awards: List[str] = []

    # Combat Indicators
    combatIndicators: List[str] = []
    hasCombatService: bool = False
    deploymentLocations: List[str] = []

    # Military Occupational Specialty (MOS)
    mosCode: str = ""
    mosTitle: str = ""
    specialties: List[str] = []
    skillIdentifiers: List[str] = []

    # Job Placement Data
    suggestedCivilianJobs: List[str] = []
    matchedSkills: List[str] = []
    certificationRecommendations: List[str] = []

    # Extraction Metadata
    extractionConfidence: str = "low"  # high, medium, low
    extractedFields: List[str] = []
    extractionLog: List[str] = []
    requiresReview: bool = True

    # File metadata
    fileSize: int = 0
    filePath: str = ""
    fileName: str = ""
    mimeType: str = ""
    textLength: int = 0
    ocrAttempted: bool = False
    uploadTimestamp: str = ""


class ExtractionJob(BaseModel):
    """Job status model"""
    job_id: str
    status: str  # pending, processing, completed, failed
    progress: int
    message: str
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error: Optional[str] = None
    result: Optional[DD214ExtractedData] = None


def log_extraction_event(
    job_id: str,
    event_type: str,
    message: str,
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Log DD-214 extraction events to file with full context

    Critical for debugging extraction failures
    """
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "job_id": job_id,
        "event_type": event_type,
        "message": message,
        "metadata": metadata or {}
    }

    log_file = DD214_LOGS_DIR / f"dd214_extraction_{datetime.now().strftime('%Y%m%d')}.log"

    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        logger.error(f"Failed to write extraction log: {e}")

    logger.info(f"[{event_type}] {message}")


def extract_text_from_pdf(file_path: Path) -> tuple[str, bool]:
    """
    Extract text from PDF file

    Returns:
        (extracted_text, ocr_was_used)
    """
    try:
        # Try text-based extraction first (faster)
        import PyPDF2

        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

        # If we got meaningful text, return it
        if len(text.strip()) > 100:
            return text, False

        # Text extraction failed - try OCR
        logger.info(f"Text extraction yielded {len(text)} chars, attempting OCR")
        return extract_text_with_ocr(file_path), True

    except ImportError:
        logger.warning("PyPDF2 not installed, attempting OCR directly")
        return extract_text_with_ocr(file_path), True
    except Exception as e:
        logger.error(f"PDF text extraction failed: {e}")
        # Fall back to OCR
        return extract_text_with_ocr(file_path), True


def extract_text_with_ocr(file_path: Path) -> str:
    """
    Extract text using OCR (Tesseract via pytesseract)
    """
    try:
        from PIL import Image
        import pytesseract
        from pdf2image import convert_from_path

        # Convert PDF to images
        images = convert_from_path(str(file_path), dpi=300)

        text = ""
        for i, image in enumerate(images):
            logger.info(f"Running OCR on page {i+1}/{len(images)}")
            page_text = pytesseract.image_to_string(image)
            text += page_text + "\n"

        return text

    except ImportError as e:
        error_msg = f"OCR dependencies not installed: {e}. Install: pip install pytesseract pdf2image pillow"
        logger.error(error_msg)
        raise HTTPException(
            status_code=500,
            detail=f"OCR not available. {error_msg}"
        )
    except Exception as e:
        error_msg = f"OCR extraction failed: {e}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )


def extract_text_from_image(file_path: Path) -> str:
    """Extract text from image file (JPG, PNG, TIFF, etc.)"""
    try:
        from PIL import Image
        import pytesseract

        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text

    except ImportError as e:
        error_msg = f"OCR dependencies not installed: {e}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Image OCR failed: {e}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


def extract_branch(text: str) -> str:
    """Extract branch of service from text"""
    text_lower = text.lower()

    patterns = {
        'Army': ['army', 'usa', 'united states army'],
        'Navy': ['navy', 'usn', 'united states navy'],
        'Air Force': ['air force', 'usaf', 'united states air force'],
        'Marine Corps': ['marine', 'usmc', 'united states marine corps'],
        'Coast Guard': ['coast guard', 'uscg', 'united states coast guard'],
        'Space Force': ['space force', 'ussf', 'united states space force']
    }

    for branch, keywords in patterns.items():
        if any(keyword in text_lower for keyword in keywords):
            return branch

    return ""


def extract_service_dates(text: str) -> Dict[str, str]:
    """Extract entry and separation dates"""
    dates = {"entry": "", "separation": ""}

    # Look for date patterns: MM/DD/YYYY, YYYY-MM-DD, DD MMM YYYY
    date_patterns = [
        r'\d{2}/\d{2}/\d{4}',
        r'\d{4}-\d{2}-\d{2}',
        r'\d{2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{4}'
    ]

    found_dates = []
    for pattern in date_patterns:
        found_dates.extend(re.findall(pattern, text, re.IGNORECASE))

    # Heuristic: first date is likely entry, last date is likely separation
    if len(found_dates) >= 2:
        dates["entry"] = found_dates[0]
        dates["separation"] = found_dates[-1]
    elif len(found_dates) == 1:
        dates["separation"] = found_dates[0]

    return dates


def extract_character_of_service(text: str) -> str:
    """Extract character of service/discharge"""
    text_lower = text.lower()

    patterns = {
        'Honorable': ['honorable', 'hon discharge'],
        'General (Under Honorable Conditions)': ['general under honorable', 'general discharge'],
        'Other Than Honorable': ['other than honorable', 'oth'],
        'Bad Conduct': ['bad conduct', 'bcd'],
        'Dishonorable': ['dishonorable']
    }

    for character, keywords in patterns.items():
        if any(keyword in text_lower for keyword in keywords):
            return character

    return ""


def extract_rank_info(text: str) -> Dict[str, str]:
    """Extract rank and pay grade"""
    rank_info = {"rank": "", "payGrade": ""}

    # Look for pay grade patterns (E-1 through E-9, O-1 through O-10, W-1 through W-5)
    pay_grade_match = re.search(r'\b([EOW]-\d{1,2})\b', text, re.IGNORECASE)
    if pay_grade_match:
        rank_info["payGrade"] = pay_grade_match.group(1).upper()

    # Common ranks to look for
    ranks = [
        'Private', 'Specialist', 'Corporal', 'Sergeant', 'Staff Sergeant',
        'Lieutenant', 'Captain', 'Major', 'Colonel', 'General',
        'Seaman', 'Petty Officer', 'Chief', 'Ensign', 'Admiral',
        'Airman', 'Senior Airman', 'Technical Sergeant', 'Master Sergeant'
    ]

    text_lower = text.lower()
    for rank in ranks:
        if rank.lower() in text_lower:
            rank_info["rank"] = rank
            break

    return rank_info


def extract_awards(text: str) -> List[str]:
    """Extract military awards and decorations"""
    awards_found = []

    # Common awards to look for
    award_patterns = [
        'Purple Heart', 'Bronze Star', 'Silver Star', 'Medal of Honor',
        'Distinguished Service', 'Navy Cross', 'Air Force Cross',
        'Combat Action', 'Meritorious Service', 'Commendation Medal',
        'Achievement Medal', 'Good Conduct Medal', 'National Defense'
    ]

    text_lower = text.lower()
    for award in award_patterns:
        if award.lower() in text_lower:
            awards_found.append(award)

    return awards_found


def extract_mos_code(text: str, branch: str) -> Dict[str, Any]:
    """
    Extract Military Occupational Specialty (MOS) code and related information
    Supports all military branches with comprehensive pattern matching
    """
    mos_data = {
        "code": "",
        "title": "",
        "specialties": [],
        "skill_identifiers": []
    }

    # Branch-specific MOS patterns
    patterns = {
        "Army": [
            # Army MOS: 2 digits + letter (11B, 25B, 68W, etc.)
            r'\b(\d{2}[A-Z])\b',
            r'MOS[:\s]*(\d{2}[A-Z])'
        ],
        "Marines": [
            # USMC MOS: 4 digits (0311, 2311, 6842, etc.)
            r'\b(\d{4})\b',
            r'MOS[:\s]*(\d{4})'
        ],
        "Navy": [
            # Navy Rating: Letters followed by dash and number (IT-2, HM-3, etc.)
            r'\b([A-Z]{2,3})-?(\d)\b',
            r'Rating[:\s]*([A-Z]{2,3})'
        ],
        "Air Force": [
            # AFSC: 1 digit, letter, 2 digits, letter (1N031, 2A631, etc.)
            r'\b(\d[A-Z]\d{3}[A-Z]?)\b',
            r'AFSC[:\s]*(\d[A-Z]\d{3}[A-Z]?)'
        ],
        "Coast Guard": [
            # USCG Rating: 2-3 letter code (BM, ME, OS, etc.)
            r'\b([A-Z]{2,3})\b',
            r'Rating[:\s]*([A-Z]{2,3})'
        ],
        "Space Force": [
            # Similar to Air Force
            r'\b(\d[A-Z]\d{3}[A-Z]?)\b',
            r'SFSC[:\s]*(\d[A-Z]\d{3}[A-Z]?)'
        ]
    }

    # Common MOS titles for context
    mos_titles = {
        "11B": "Infantryman",
        "25B": "Information Technology Specialist",
        "68W": "Combat Medic Specialist",
        "88M": "Motor Transport Operator",
        "92Y": "Unit Supply Specialist",
        "0311": "Rifleman (USMC)",
        "2311": "Ammunition Technician (USMC)",
        "6842": "Meteorological and Oceanographic (METOC) Analyst (USMC)",
        "IT": "Information Systems Technician (Navy)",
        "HM": "Hospital Corpsman (Navy)",
        "BM": "Boatswain's Mate (Navy/USCG)",
        "1N031": "All-Source Intelligence Analyst (USAF)",
        "2A631": "Aerospace Propulsion (USAF)"
    }

    # Extract MOS code based on branch
    if branch in patterns:
        for pattern in patterns[branch]:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Get first match (most likely to be primary MOS)
                mos_code = matches[0] if isinstance(matches[0], str) else matches[0][0]
                mos_data["code"] = mos_code.upper()

                # Look up title if known
                if mos_code.upper() in mos_titles:
                    mos_data["title"] = mos_titles[mos_code.upper()]

                break

    # Extract additional skill identifiers (ASI, SQI for Army)
    skill_patterns = [
        r'ASI[:\s]*([A-Z0-9]{1,2})',  # Additional Skill Identifier
        r'SQI[:\s]*([A-Z0-9])',  # Special Qualification Identifier
        r'Skill[:\s]*([A-Z0-9]{1,3})'
    ]

    for pattern in skill_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        mos_data["skill_identifiers"].extend(matches)

    # Extract specialty keywords
    specialty_keywords = [
        'infantry', 'intelligence', 'medical', 'logistics', 'aviation',
        'combat', 'communications', 'cyber', 'maintenance', 'special forces',
        'engineer', 'artillery', 'armor', 'reconnaissance', 'supply'
    ]

    text_lower = text.lower()
    for keyword in specialty_keywords:
        if keyword in text_lower:
            mos_data["specialties"].append(keyword.title())

    return mos_data


def extract_deployment_info(text: str) -> List[str]:
    """
    Extract deployment locations and combat zones
    Critical for benefits eligibility and job placement
    """
    deployments = []

    # Comprehensive list of deployment locations
    deployment_zones = {
        'Iraq': ['iraq', 'operation iraqi freedom', 'oif', 'baghdad', 'mosul', 'fallujah'],
        'Afghanistan': ['afghanistan', 'operation enduring freedom', 'oef', 'kabul', 'kandahar', 'bagram'],
        'Kuwait': ['kuwait', 'operation desert storm', 'operation desert shield'],
        'Vietnam': ['vietnam', 'saigon', 'da nang'],
        'Korea': ['korea', 'dmz', 'korean peninsula'],
        'Kosovo': ['kosovo', 'operation allied force'],
        'Somalia': ['somalia', 'mogadishu', 'operation restore hope'],
        'Gulf War': ['persian gulf', 'operation desert storm', 'desert shield'],
        'Balkans': ['balkans', 'bosnia', 'herzegovina'],
        'Syria': ['syria', 'operation inherent resolve'],
        'Libya': ['libya', 'operation odyssey dawn'],
        'Philippines': ['philippines', 'operation enduring freedom - philippines'],
        'Africa': ['horn of africa', 'djibouti', 'camp lemonnier'],
        'Middle East': ['middle east', 'centcom', 'bahrain']
    }

    text_lower = text.lower()

    for location, keywords in deployment_zones.items():
        if any(keyword in text_lower for keyword in keywords):
            if location not in deployments:
                deployments.append(location)

    # Check for campaign ribbons (indicates deployment)
    campaign_ribbons = [
        'iraq campaign', 'afghanistan campaign', 'global war on terrorism',
        'gwot', 'southwest asia service', 'kosovo campaign'
    ]

    for ribbon in campaign_ribbons:
        if ribbon in text_lower and not deployments:
            deployments.append('Deployed (campaign ribbon found)')
            break

    return deployments


def map_mos_to_civilian_jobs(mos_code: str, branch: str, specialties: List[str]) -> Dict[str, List[str]]:
    """
    Map military MOS to civilian job opportunities
    Returns suggested jobs, skills, and certifications
    """
    job_mapping = {
        "suggested_jobs": [],
        "matched_skills": [],
        "certifications": []
    }

    # Army MOS mappings
    army_mappings = {
        "11B": {
            "jobs": ["Law Enforcement Officer", "Security Manager", "Emergency Management Specialist", "Protective Service Officer"],
            "skills": ["Leadership", "Tactical Operations", "Weapons Proficiency", "Team Coordination"],
            "certs": ["Security+", "CPR/First Aid", "State Law Enforcement Certification"]
        },
        "25B": {
            "jobs": ["IT Support Specialist", "Network Administrator", "Systems Administrator", "Cybersecurity Analyst"],
            "skills": ["Network Administration", "Troubleshooting", "Windows/Linux", "Hardware Maintenance"],
            "certs": ["CompTIA A+", "Network+", "Security+", "CCNA", "Microsoft Certified"]
        },
        "68W": {
            "jobs": ["Paramedic", "Emergency Room Technician", "Nurse", "EMS Coordinator"],
            "skills": ["Emergency Medical Care", "Trauma Response", "Patient Assessment", "Medical Documentation"],
            "certs": ["EMT-B", "EMT-P", "ACLS", "PALS", "NREMT", "State Paramedic License"]
        },
        "88M": {
            "jobs": ["Commercial Truck Driver", "Logistics Coordinator", "Transportation Manager", "Fleet Manager"],
            "skills": ["Vehicle Operation", "Route Planning", "Safety Compliance", "Vehicle Maintenance"],
            "certs": ["CDL Class A/B", "Hazmat Endorsement", "Tanker Endorsement"]
        },
        "92Y": {
            "jobs": ["Supply Chain Manager", "Inventory Specialist", "Warehouse Manager", "Logistics Analyst"],
            "skills": ["Inventory Management", "Supply Chain Operations", "Data Analysis", "Vendor Relations"],
            "certs": ["APICS CPIM", "Six Sigma", "Supply Chain Professional Certification"]
        }
    }

    # USMC MOS mappings
    usmc_mappings = {
        "0311": army_mappings["11B"],  # Similar to Army Infantry
        "2311": {
            "jobs": ["Explosives Handler", "Safety Specialist", "Munitions Manager", "Quality Control Inspector"],
            "skills": ["Safety Procedures", "Hazardous Materials", "Inventory Control", "Quality Assurance"],
            "certs": ["OSHA Safety Certification", "Hazmat Certification", "Quality Management"]
        }
    }

    # Check mappings
    if branch == "Army" and mos_code in army_mappings:
        mapping = army_mappings[mos_code]
        job_mapping["suggested_jobs"] = mapping["jobs"]
        job_mapping["matched_skills"] = mapping["skills"]
        job_mapping["certifications"] = mapping["certs"]
    elif branch == "Marine Corps" and mos_code in usmc_mappings:
        mapping = usmc_mappings[mos_code]
        job_mapping["suggested_jobs"] = mapping["jobs"]
        job_mapping["matched_skills"] = mapping["skills"]
        job_mapping["certifications"] = mapping["certs"]
    else:
        # Generic mapping based on specialties
        if "medical" in [s.lower() for s in specialties]:
            job_mapping["suggested_jobs"] = ["Healthcare Technician", "Medical Assistant", "Patient Care Coordinator"]
            job_mapping["matched_skills"] = ["Patient Care", "Medical Procedures", "Healthcare Compliance"]
            job_mapping["certifications"] = ["BLS", "First Aid", "Medical Assistant Certification"]
        elif "intelligence" in [s.lower() for s in specialties]:
            job_mapping["suggested_jobs"] = ["Intelligence Analyst", "Data Analyst", "Security Analyst"]
            job_mapping["matched_skills"] = ["Data Analysis", "Critical Thinking", "Report Writing"]
            job_mapping["certifications"] = ["Security Clearance", "Analytical Certifications"]
        elif "communications" in [s.lower() for s in specialties] or "cyber" in [s.lower() for s in specialties]:
            job_mapping["suggested_jobs"] = ["IT Specialist", "Network Technician", "Communications Engineer"]
            job_mapping["matched_skills"] = ["Technical Support", "Network Operations", "System Administration"]
            job_mapping["certifications"] = ["CompTIA Network+", "Security+", "Cisco CCNA"]

    return job_mapping


def detect_combat_indicators(text: str, awards: List[str]) -> List[str]:
    """Detect combat service indicators"""
    indicators = []

    text_lower = text.lower()

    # Combat-related keywords
    if 'combat' in text_lower:
        indicators.append('Combat keyword found')

    if 'hostile' in text_lower or 'hostile fire' in text_lower:
        indicators.append('Hostile fire reference')

    if 'imminent danger' in text_lower:
        indicators.append('Imminent danger pay')

    # Combat awards
    combat_awards = ['Purple Heart', 'Bronze Star', 'Combat Action', 'Silver Star']
    for award in awards:
        if any(combat_award in award for combat_award in combat_awards):
            indicators.append(f'Combat award: {award}')

    # Deployment locations
    combat_zones = ['iraq', 'afghanistan', 'vietnam', 'korea', 'kuwait', 'persian gulf']
    for zone in combat_zones:
        if zone in text_lower:
            indicators.append(f'Combat zone: {zone.title()}')

    return indicators


def calculate_confidence(extracted_fields_count: int, text_length: int) -> str:
    """
    Calculate extraction confidence level

    Minimum thresholds:
    - text_length must be >= 200 characters
    - extracted_fields_count must be >= 3
    """
    if text_length < 200:
        return "low"

    if extracted_fields_count >= 6:
        return "high"
    elif extracted_fields_count >= 3:
        return "medium"
    else:
        return "low"


async def process_dd214_extraction(job_id: str, file_path: Path, file_metadata: Dict[str, Any]):
    """
    Background task to process DD-214 extraction

    This is where the actual OCR and field extraction happens
    """
    try:
        # Update job status
        extraction_jobs[job_id]["status"] = "processing"
        extraction_jobs[job_id]["started_at"] = datetime.now().isoformat()
        extraction_jobs[job_id]["progress"] = 10
        extraction_jobs[job_id]["message"] = "Verifying file..."

        log_extraction_event(
            job_id,
            "START",
            "Starting DD-214 extraction",
            {
                "file_path": str(file_path),
                "file_size": file_metadata["size"],
                "mime_type": file_metadata["mime_type"]
            }
        )

        # VERIFY FILE EXISTS AND HAS CONTENT
        if not file_path.exists():
            raise FileNotFoundError(f"File does not exist at path: {file_path}")

        file_size = file_path.stat().st_size
        if file_size == 0:
            raise ValueError(f"File is empty (0 bytes): {file_path}")

        log_extraction_event(
            job_id,
            "FILE_VERIFIED",
            f"File verified: {file_size} bytes",
            {"file_size": file_size}
        )

        # Initialize result
        result = DD214ExtractedData(
            fileName=file_metadata["name"],
            filePath=str(file_path),
            fileSize=file_size,
            mimeType=file_metadata["mime_type"],
            uploadTimestamp=file_metadata["timestamp"]
        )

        extraction_log = []
        extraction_log.append(f"File: {file_metadata['name']}")
        extraction_log.append(f"Size: {file_size} bytes")
        extraction_log.append(f"Type: {file_metadata['mime_type']}")

        # UPDATE PROGRESS
        extraction_jobs[job_id]["progress"] = 30
        extraction_jobs[job_id]["message"] = "Extracting text from document..."

        # EXTRACT TEXT
        text = ""
        ocr_used = False

        if file_metadata["mime_type"] == "application/pdf":
            extraction_log.append("Detected PDF file")
            text, ocr_used = extract_text_from_pdf(file_path)
        else:
            # Image file (JPG, PNG, TIFF, etc.)
            extraction_log.append("Detected image file, using OCR")
            text = extract_text_from_image(file_path)
            ocr_used = True

        result.ocrAttempted = ocr_used
        result.textLength = len(text)

        extraction_log.append(f"Text extracted: {len(text)} characters")
        extraction_log.append(f"OCR used: {ocr_used}")

        # Log first 500 characters for debugging
        log_extraction_event(
            job_id,
            "TEXT_EXTRACTED",
            f"Extracted {len(text)} characters (OCR: {ocr_used})",
            {
                "text_length": len(text),
                "ocr_used": ocr_used,
                "text_preview": text[:500] if text else ""
            }
        )

        # MINIMUM VALUE CHECK
        if len(text) < 200:
            error_msg = f"Extraction failed: Only {len(text)} characters extracted (minimum 200 required)"
            extraction_log.append(f"❌ {error_msg}")

            log_extraction_event(
                job_id,
                "EXTRACTION_FAILED",
                error_msg,
                {
                    "text_length": len(text),
                    "minimum_required": 200,
                    "file_size": file_size,
                    "ocr_attempted": ocr_used
                }
            )

            raise ValueError(error_msg)

        # UPDATE PROGRESS
        extraction_jobs[job_id]["progress"] = 50
        extraction_jobs[job_id]["message"] = "Parsing DD-214 fields..."

        # EXTRACT FIELDS
        extracted_fields = []

        # Branch
        branch = extract_branch(text)
        if branch:
            result.branch = branch
            extracted_fields.append("branch")
            extraction_log.append(f"✓ Branch: {branch}")

        # Dates
        dates = extract_service_dates(text)
        if dates["entry"]:
            result.entryDate = dates["entry"]
            extracted_fields.append("entryDate")
            extraction_log.append(f"✓ Entry Date: {dates['entry']}")
        if dates["separation"]:
            result.separationDate = dates["separation"]
            extracted_fields.append("separationDate")
            extraction_log.append(f"✓ Separation Date: {dates['separation']}")

        # Character of Service
        character = extract_character_of_service(text)
        if character:
            result.characterOfService = character
            extracted_fields.append("characterOfService")
            extraction_log.append(f"✓ Character: {character}")

        # Rank Info
        rank_info = extract_rank_info(text)
        if rank_info["payGrade"]:
            result.payGrade = rank_info["payGrade"]
            extracted_fields.append("payGrade")
            extraction_log.append(f"✓ Pay Grade: {rank_info['payGrade']}")
        if rank_info["rank"]:
            result.rank = rank_info["rank"]
            extracted_fields.append("rank")
            extraction_log.append(f"✓ Rank: {rank_info['rank']}")

        # Awards
        awards = extract_awards(text)
        if awards:
            result.awards = awards
            extracted_fields.append("awards")
            extraction_log.append(f"✓ Awards: {len(awards)} found - {', '.join(awards)}")

        # Combat Indicators
        combat_indicators = detect_combat_indicators(text, awards)
        if combat_indicators:
            result.combatIndicators = combat_indicators
            result.hasCombatService = True
            extracted_fields.append("combatIndicators")
            extraction_log.append(f"✓ Combat Indicators: {', '.join(combat_indicators)}")

        # Deployment Locations
        deployments = extract_deployment_info(text)
        if deployments:
            result.deploymentLocations = deployments
            extracted_fields.append("deploymentLocations")
            extraction_log.append(f"✓ Deployments: {', '.join(deployments)}")

        # MOS Extraction (Critical for HR and Job Placement)
        if branch:  # Only extract MOS if we know the branch
            mos_data = extract_mos_code(text, branch)
            if mos_data["code"]:
                result.mosCode = mos_data["code"]
                result.mosTitle = mos_data["title"]
                result.specialties = mos_data["specialties"]
                result.skillIdentifiers = mos_data["skill_identifiers"]
                extracted_fields.append("mosCode")

                extraction_log.append(f"✓ MOS Code: {mos_data['code']}")
                if mos_data["title"]:
                    extraction_log.append(f"  MOS Title: {mos_data['title']}")
                if mos_data["specialties"]:
                    extraction_log.append(f"  Specialties: {', '.join(mos_data['specialties'])}")

                # Job Placement Mapping
                job_mapping = map_mos_to_civilian_jobs(
                    mos_data["code"],
                    branch,
                    mos_data["specialties"]
                )

                result.suggestedCivilianJobs = job_mapping["suggested_jobs"]
                result.matchedSkills = job_mapping["matched_skills"]
                result.certificationRecommendations = job_mapping["certifications"]

                if job_mapping["suggested_jobs"]:
                    extracted_fields.append("jobPlacement")
                    extraction_log.append(f"✓ Job Suggestions: {', '.join(job_mapping['suggested_jobs'][:3])}...")
                    extraction_log.append(f"  Matched Skills: {', '.join(job_mapping['matched_skills'][:3])}")
                    extraction_log.append(f"  Recommended Certs: {', '.join(job_mapping['certifications'][:3])}")

        result.extractedFields = extracted_fields
        result.extractionLog = extraction_log

        # CALCULATE CONFIDENCE
        confidence = calculate_confidence(len(extracted_fields), len(text))
        result.extractionConfidence = confidence

        extraction_log.append(f"Confidence: {confidence}")
        extraction_log.append(f"Fields extracted: {len(extracted_fields)}")

        # MINIMUM FIELDS CHECK
        if len(extracted_fields) == 0:
            error_msg = "Extraction failed: No recognizable DD-214 fields found"
            extraction_log.append(f"❌ {error_msg}")

            log_extraction_event(
                job_id,
                "NO_FIELDS_FOUND",
                error_msg,
                {
                    "text_length": len(text),
                    "fields_found": 0
                }
            )

            raise ValueError(error_msg)

        # SUCCESS
        extraction_jobs[job_id]["status"] = "completed"
        extraction_jobs[job_id]["progress"] = 100
        extraction_jobs[job_id]["message"] = f"Extraction complete: {len(extracted_fields)} fields found"
        extraction_jobs[job_id]["completed_at"] = datetime.now().isoformat()
        extraction_jobs[job_id]["result"] = result

        log_extraction_event(
            job_id,
            "COMPLETED",
            f"Extraction successful: {len(extracted_fields)} fields extracted",
            {
                "fields_count": len(extracted_fields),
                "confidence": confidence,
                "text_length": len(text)
            }
        )

    except Exception as e:
        error_msg = str(e)
        extraction_jobs[job_id]["status"] = "failed"
        extraction_jobs[job_id]["error"] = error_msg
        extraction_jobs[job_id]["message"] = f"Extraction failed: {error_msg}"
        extraction_jobs[job_id]["completed_at"] = datetime.now().isoformat()

        log_extraction_event(
            job_id,
            "ERROR",
            f"Extraction failed: {error_msg}",
            {
                "error": error_msg,
                "error_type": type(e).__name__,
                "file_path": str(file_path)
            }
        )


@router.post("/upload")
async def upload_dd214(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None
):
    """
    Upload DD-214 file for extraction

    Accepts PDF or image files (JPG, PNG, TIFF)
    Returns job_id for tracking extraction progress
    """
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/tiff",
            "image/bmp"
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Allowed: PDF, JPG, PNG, TIFF"
            )

        # Create job ID
        job_id = str(uuid.uuid4())
        filename = file.filename or "uploaded_document"

        # Create storage path: /Data/Documents/{veteran_id or 'anonymous'}/{timestamp}/
        veteran_folder = veteran_id if veteran_id else "anonymous"
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        storage_path = UPLOAD_DIR / veteran_folder / timestamp
        storage_path.mkdir(parents=True, exist_ok=True)

        # Save file
        file_path = storage_path / filename

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        file_size = len(content)

        # Verify file was saved
        if not file_path.exists():
            raise HTTPException(
                status_code=500,
                detail=f"File upload failed: could not save to {file_path}"
            )

        if file_size == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty (0 bytes)"
            )

        # Log upload success
        logger.info(f"DD-214 uploaded: {filename} ({file_size} bytes) -> {file_path}")

        # Create job entry
        extraction_jobs[job_id] = {
            "job_id": job_id,
            "status": "pending",
            "progress": 0,
            "message": "Upload complete, queued for processing",
            "created_at": datetime.now().isoformat(),
            "started_at": None,
            "completed_at": None,
            "error": None,
            "result": None
        }

        # Start background extraction
        file_metadata = {
            "name": filename,
            "size": file_size,
            "mime_type": file.content_type,
            "timestamp": timestamp
        }

        background_tasks.add_task(
            process_dd214_extraction,
            job_id,
            file_path,
            file_metadata
        )

        return JSONResponse({
            "job_id": job_id,
            "status": "pending",
            "message": "Upload successful. Extraction started.",
            "file_path": str(file_path),
            "file_size": file_size,
            "mime_type": file.content_type
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"DD-214 upload error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/status/{job_id}")
async def get_extraction_status(job_id: str):
    """Get extraction job status"""
    if job_id not in extraction_jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    return extraction_jobs[job_id]


@router.get("/result/{job_id}")
async def get_extraction_result(job_id: str):
    """Get extraction result (only available when completed)"""
    if job_id not in extraction_jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = extraction_jobs[job_id]

    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Extraction not complete. Current status: {job['status']}"
        )

    return job["result"]


@router.get("/export/hr/{job_id}")
async def export_hr_summary(job_id: str):
    """
    Export HR-friendly summary of veteran service and qualifications

    Provides comprehensive employment data for Human Resources including:
    - Service history summary
    - MOS/job code with civilian translation
    - Skills and certifications
    - Deployment history
    - Suggested job placements
    """
    if job_id not in extraction_jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = extraction_jobs[job_id]

    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not complete. Current status: {job['status']}"
        )

    result: DD214ExtractedData = job["result"]

    # Calculate years of service
    def calc_years(entry: str, sep: str) -> str:
        if not entry or not sep:
            return "Unknown"
        try:
            e_year = int(entry.split("/")[-1]) if "/" in entry else int(entry[:4])
            s_year = int(sep.split("/")[-1]) if "/" in sep else int(sep[:4])
            return f"{s_year - e_year} years (approximate)"
        except:
            return "Unable to calculate"

    # Build HR-friendly summary
    hr_summary = {
        "veteran_profile": {
            "branch_of_service": result.branch or "Not extracted",
            "rank": result.rank or "Not extracted",
            "pay_grade": result.payGrade or "Not extracted",
            "years_of_service": calc_years(result.entryDate, result.separationDate),
            "character_of_discharge": result.characterOfService or "Not extracted",
            "separation_date": result.separationDate or "Not extracted"
        },
        "military_occupation": {
            "mos_code": result.mosCode or "Not extracted",
            "mos_title": result.mosTitle or "Not extracted",
            "specialties": result.specialties or [],
            "skill_identifiers": result.skillIdentifiers or [],
            "civilian_equivalent": result.mosTitle or "See suggested jobs below"
        },
        "deployment_history": {
            "has_combat_service": result.hasCombatService,
            "deployment_locations": result.deploymentLocations or [],
            "combat_indicators": result.combatIndicators or [],
            "awards_and_decorations": result.awards or []
        },
        "job_placement_recommendations": {
            "suggested_civilian_jobs": result.suggestedCivilianJobs or [],
            "transferable_skills": result.matchedSkills or [],
            "recommended_certifications": result.certificationRecommendations or [],
            "skills_ready_for_immediate_employment": len(result.matchedSkills) > 0 if result.matchedSkills else False
        },
        "hiring_advantages": {
            "leadership_experience": (
                result.payGrade.startswith("E-") and
                int(result.payGrade.split("-")[1]) >= 5
            ) if result.payGrade and "-" in result.payGrade else False,
            "security_clearance_likely": (
                result.hasCombatService or
                any("intelligence" in s.lower() for s in result.specialties) if result.specialties else False
            ),
            "team_oriented": True,
            "adaptable_to_high_pressure": result.hasCombatService,
            "proven_technical_skills": len(result.matchedSkills) > 0 if result.matchedSkills else False
        },
        "additional_notes": {
            "confidence_level": result.extractionConfidence,
            "extraction_timestamp": result.uploadTimestamp,
            "data_verified": False,
            "contact_veteran_for": "Verification of all extracted data before making hiring decisions",
            "notes": "This data was extracted from DD-214. Always confirm with veteran and request original documents."
        }
    }

    return hr_summary


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check if OCR dependencies are available
    ocr_available = False
    try:
        import pytesseract
        import pdf2image
        ocr_available = True
    except ImportError:
        pass

    pdf_extraction_available = False
    try:
        import PyPDF2
        pdf_extraction_available = True
    except ImportError:
        pass

    return {
        "status": "healthy",
        "service": "dd214",
        "upload_dir": str(UPLOAD_DIR),
        "upload_dir_exists": UPLOAD_DIR.exists(),
        "logs_dir": str(DD214_LOGS_DIR),
        "active_jobs": len([j for j in extraction_jobs.values() if j["status"] in ["pending", "processing"]]),
        "total_jobs": len(extraction_jobs),
        "ocr_available": ocr_available,
        "pdf_extraction_available": pdf_extraction_available
    }

