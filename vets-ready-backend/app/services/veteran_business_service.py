"""Veteran-owned business directory and management service"""

from datetime import datetime
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from app.models.user import User


class VeteranBusinessService:
    """Service for managing veteran-owned businesses and matching"""

    def __init__(self, db: Session):
        self.db = db

    # ===== BUSINESS DIRECTORY =====

    def search_veteran_businesses(
        self,
        search_query: str = "",
        category: str = "",
        state: str = "",
        certification: str = "",
        skip: int = 0,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        Search veteran-owned businesses with filters

        Certifications:
        - VOSB (Verified Veteran-Owned Small Business)
        - VetCert
        - SBA 8(a)
        - HUBZone
        - SDVOSB (Service-Disabled Veteran-Owned Small Business)
        """
        # In production, would query business database
        # This is the structure and logic

        businesses = {
            "results": self._get_mock_businesses(category, state),
            "total": 150,
            "filters_applied": {
                "search_query": search_query,
                "category": category,
                "state": state,
                "certification": certification,
            },
            "pagination": {
                "skip": skip,
                "limit": limit,
                "total_pages": 8,
                "current_page": (skip // limit) + 1,
            },
        }

        return businesses

    def _get_mock_businesses(self, category: str = "", state: str = "") -> List[Dict[str, Any]]:
        """Get mock veteran businesses for demonstration"""
        businesses = [
            {
                "id": "vb_001",
                "name": "TacticalTech Solutions",
                "category": "IT Services",
                "description": "Cybersecurity and IT consulting for federal contractors",
                "state": "Virginia",
                "certification": "VOSB",
                "founded_year": 2015,
                "employees": 45,
                "annual_revenue": "$2.5M - $5M",
                "specialties": ["Cybersecurity", "Cloud Services", "Consulting"],
                "federal_contractor": True,
                "clearance_friendly": True,
                "contact_info": {"phone": "(703) 555-0101", "email": "info@tacticaltech.com"},
                "website": "https://tacticaltech.example.com",
                "rating": 4.8,
                "reviews": 24,
            },
            {
                "id": "vb_002",
                "name": "Valor Manufacturing",
                "category": "Manufacturing",
                "description": "Precision manufacturing and aerospace components",
                "state": "Texas",
                "certification": "SDVOSB",
                "founded_year": 2012,
                "employees": 78,
                "annual_revenue": "$5M - $10M",
                "specialties": ["Aerospace", "Manufacturing", "Precision Parts"],
                "federal_contractor": True,
                "clearance_friendly": False,
                "contact_info": {"phone": "(214) 555-0202", "email": "sales@valor.com"},
                "website": "https://valormfg.example.com",
                "rating": 4.6,
                "reviews": 18,
            },
            {
                "id": "vb_003",
                "name": "ServiceVet Consulting",
                "category": "Consulting",
                "description": "Business and management consulting for government agencies",
                "state": "California",
                "certification": "VOSB",
                "founded_year": 2018,
                "employees": 23,
                "annual_revenue": "$1M - $2.5M",
                "specialties": ["Management Consulting", "Process Improvement", "Training"],
                "federal_contractor": True,
                "clearance_friendly": True,
                "contact_info": {"phone": "(408) 555-0303", "email": "hello@servicevetconsulting.com"},
                "website": "https://servicevetconsulting.example.com",
                "rating": 4.9,
                "reviews": 32,
            },
        ]

        return businesses

    def get_business_details(self, business_id: str) -> Dict[str, Any]:
        """Get detailed information about a veteran business"""
        return {
            "business": self._get_mock_businesses()[0],  # Simplified
            "certifications": [
                {
                    "type": "VOSB",
                    "issuer": "Veterans Affairs",
                    "verified_date": "2023-06-15",
                    "expiration_date": "2026-06-15",
                },
                {
                    "type": "SBA 8(a)",
                    "issuer": "SBA",
                    "verified_date": "2023-01-20",
                    "expiration_date": "2025-01-20",
                },
            ],
            "contracts": [
                {"agency": "Department of Defense", "value": "$500K", "status": "Active"},
                {"agency": "General Services Administration", "value": "$250K", "status": "Active"},
            ],
            "team": [
                {
                    "name": "John Smith",
                    "role": "CEO & Founder",
                    "military_background": "Army, 20 years (Retired, Colonel)",
                    "bio": "Led IT operations for regional military commands",
                },
            ],
            "testimonials": [
                {
                    "author": "Federal Agency",
                    "rating": 5,
                    "text": "Outstanding service quality and veteran-focused team",
                },
            ],
        }

    # ===== VBA INFORMATION =====

    def get_vba_programs(self) -> Dict[str, Any]:
        """Get comprehensive VBA program information"""
        return {
            "overview": {
                "agency": "Veterans Business Administration (VBA)",
                "parent": "SBA - Small Business Administration",
                "mission": "Ensure that veterans and service-disabled veterans are aware of the benefits available to them and can access those benefits",
                "established": 1999,
            },
            "certification_programs": {
                "vosb": {
                    "name": "Verified Veteran-Owned Small Business",
                    "acronym": "VOSB",
                    "description": "Certification for small businesses that are at least 51% owned, operated, and controlled by one or more veterans",
                    "eligibility": [
                        "Be a United States citizen",
                        "Own and operate a small business",
                        "Be at least 51% owner/operator",
                        "Demonstrate business experience",
                    ],
                    "benefits": [
                        "VA contracting preference",
                        "Access to federal contracting opportunities",
                        "Marketing support",
                        "Networking opportunities",
                    ],
                    "cost": "Free",
                    "processing_time": "4-8 weeks",
                    "renewal": "Annually",
                    "website": "https://vetbiz.sba.gov/",
                },
                "sdvosb": {
                    "name": "Service-Disabled Veteran-Owned Small Business",
                    "acronym": "SDVOSB",
                    "description": "Certification for small businesses owned and controlled by service-disabled veterans",
                    "eligibility": [
                        "Be a service-disabled veteran",
                        "Own at least 51% of the business",
                        "Control and operate the business",
                        "Meet size standards for your industry",
                    ],
                    "benefits": [
                        "5% contracting set-aside",
                        "Enhanced VA contracting preference",
                        "Access to SDVOSB-specific contracts",
                        "SBA loan programs",
                    ],
                    "cost": "Free",
                    "processing_time": "4-8 weeks",
                    "renewal": "Annually",
                    "website": "https://vetbiz.sba.gov/",
                },
            },
            "funding_programs": {
                "sba_loans": {
                    "name": "SBA 7(a) Loan Program",
                    "description": "General purpose business loans for veterans",
                    "loan_amount": "$5,000 to $5 million",
                    "interest_rate": "Prime + 2.25% to Prime + 2.75%",
                    "term": "Up to 10 years",
                    "benefits": ["Lower rates for veterans", "Extended terms", "Reduced fees"],
                    "contact": "SBA Field Office",
                },
                "microloan": {
                    "name": "SBA Microloan Program",
                    "description": "Smaller loans for startup/growing businesses",
                    "loan_amount": "$500 to $50,000",
                    "interest_rate": "Varies by lender",
                    "term": "Up to 6 years",
                    "benefits": ["Quick approval", "Flexible terms", "Training support"],
                    "contact": "SBA Microloan Intermediary",
                },
            },
            "support_services": {
                "sbdc": {
                    "name": "Small Business Development Centers (SBDC)",
                    "description": "Free business consulting and training",
                    "services": ["Business planning", "Financial analysis", "Marketing", "Legal consultation"],
                    "cost": "Free",
                    "locations": "All 50 states",
                },
                "score": {
                    "name": "SCORE Mentoring",
                    "description": "Free mentoring from experienced business executives",
                    "services": ["Business mentoring", "Workshop training", "Online resources"],
                    "cost": "Free",
                    "locations": "Nationwide",
                },
                "vosb_training": {
                    "name": "Veterans Business Outreach Center (VBOC)",
                    "description": "Training and resources specifically for veteran entrepreneurs",
                    "services": ["Business training", "Mentoring", "Resource referrals"],
                    "cost": "Free or low-cost",
                    "locations": "Multiple locations",
                },
            },
            "contracts_opportunities": {
                "va_contracting": {
                    "name": "VA Contracting Preference",
                    "description": "VA gives contracting preference to veteran and SDVOSB-owned businesses",
                    "how_it_works": "VA sets aside certain contracts exclusively for VOSB/SDVOSB",
                    "opportunities": "Billions in annual contracts",
                    "database": "https://vaosb.va.gov/",
                },
                "sam_gov": {
                    "name": "SAM.gov (System for Award Management)",
                    "description": "Federal contracting opportunities database",
                    "opportunities": "All federal agencies post opportunities here",
                    "cost": "Free registration",
                    "website": "https://sam.gov/",
                },
            },
        }

    def get_state_veteran_resources(self, state: str) -> Dict[str, Any]:
        """Get state-specific veteran business resources"""
        state_resources = {
            "California": {
                "state_vosb_program": {
                    "name": "California VOSB Program",
                    "contact": "Department of General Services",
                    "phone": "(916) 555-0100",
                    "website": "https://www.dgs.ca.gov/",
                    "set_aside": "3% for VOSB in state contracts",
                },
                "state_benefits": [
                    "State contracting preference",
                    "Bonding assistance program",
                    "Tax incentives",
                ],
                "local_resources": [
                    "California Disabled Veterans Business Program",
                    "Regional Small Business Development Centers",
                ],
            },
            "Texas": {
                "state_vosb_program": {
                    "name": "Texas Veteran-Owned Business Commission",
                    "contact": "Texas General Land Office",
                    "phone": "(512) 555-0200",
                    "website": "https://www.glo.texas.gov/",
                    "set_aside": "2% for VOSB in state contracts",
                },
                "state_benefits": [
                    "State contracting set-aside",
                    "Veteran business networking",
                    "Training programs",
                ],
            },
            "Virginia": {
                "state_vosb_program": {
                    "name": "Virginia VOSB Certification",
                    "contact": "Virginia Department of General Services",
                    "phone": "(804) 555-0300",
                    "website": "https://www.dgs.virginia.gov/",
                    "set_aside": "5% for VOSB in state contracts",
                },
                "state_benefits": [
                    "Highest state set-aside percentage",
                    "Priority consideration",
                    "Grants and loans",
                ],
            },
        }

        return state_resources.get(state, {"message": f"State resources for {state} being developed"})

    # ===== NONPROFIT & ORGANIZATIONS =====

    def get_veteran_organizations(self, category: str = "") -> List[Dict[str, Any]]:
        """Get list of veteran support organizations"""
        organizations = [
            {
                "id": "org_001",
                "name": "Team Red White & Blue",
                "type": "Nonprofit",
                "mission": "Veteran community, fitness, and purpose",
                "focus_areas": ["Community", "Physical Wellness", "Mental Health"],
                "programs": [
                    "Local chapters for fitness and camaraderie",
                    "Transition support",
                    "Peer mentoring",
                ],
                "phone": "1-877-868-2383",
                "website": "https://teamrwb.org/",
                "rating": 4.9,
            },
            {
                "id": "org_002",
                "name": "Wounded Warrior Project",
                "type": "Nonprofit",
                "mission": "Honor and empower wounded warriors",
                "focus_areas": ["Mental Health", "Benefits", "Job Training"],
                "programs": [
                    "Mental health and wellness",
                    "Benefits navigation",
                    "Career training",
                    "Peer support",
                ],
                "phone": "1-888-882-6838",
                "website": "https://www.woundedwarriorproject.org/",
                "rating": 4.7,
            },
            {
                "id": "org_003",
                "name": "Veterans of Foreign Wars (VFW)",
                "type": "Membership Organization",
                "mission": "Honor the dead by helping the living",
                "focus_areas": ["Advocacy", "Community Service", "Veterans Support"],
                "programs": [
                    "Legislative advocacy",
                    "Disaster relief",
                    "Scholarship programs",
                    "Community service",
                ],
                "phone": "1-816-968-1117",
                "website": "https://www.vfw.org/",
                "rating": 4.6,
            },
            {
                "id": "org_004",
                "name": "The American Legion",
                "type": "Membership Organization",
                "mission": "Veteran service, veterans affairs, and national security",
                "focus_areas": ["Benefits", "Community", "Advocacy"],
                "programs": [
                    "Benefits advocacy",
                    "Employment programs",
                    "Youth programs",
                    "Community service",
                ],
                "phone": "1-317-630-1200",
                "website": "https://www.legion.org/",
                "rating": 4.7,
            },
            {
                "id": "org_005",
                "name": "Veterans Crisis Line",
                "type": "Federal Program",
                "mission": "24/7 crisis support for veterans",
                "focus_areas": ["Mental Health Crisis", "Suicide Prevention"],
                "programs": [
                    "Crisis counseling",
                    "Suicide prevention",
                    "Referral services",
                    "All 50 states support",
                ],
                "phone": "988 then press 1",
                "website": "https://www.veteranscrisisline.net/",
                "rating": 4.9,
            },
        ]

        return organizations

    def get_federal_veteran_benefits(self) -> Dict[str, Any]:
        """Get comprehensive federal veteran benefits information"""
        return {
            "disability_compensation": {
                "name": "VA Disability Compensation",
                "description": "Monthly payments for service-connected disabilities",
                "eligibility": "Service-connected disability rated 10% or higher",
                "max_benefit": "$4,332/month (100% rating, 2024)",
                "application": "VA Form 21-526-EZ",
                "learn_more": "https://www.va.gov/disability/",
            },
            "education_benefits": {
                "name": "GI Bill & Education Benefits",
                "description": "Education and training support",
                "programs": [
                    {
                        "name": "Post-9/11 GI Bill",
                        "coverage": "Up to 100% tuition + $2,000/month BAH",
                        "eligibility": "Recent service members",
                    },
                    {
                        "name": "Dependents Education Assistance",
                        "coverage": "Up to $30,000 lifetime",
                        "eligibility": "Dependents of disabled/deceased veterans",
                    },
                ],
                "learn_more": "https://www.va.gov/education/",
            },
            "health_care": {
                "name": "VA Health Care",
                "description": "Comprehensive health care system",
                "coverage": [
                    "Primary care",
                    "Mental health",
                    "Dental (service-connected)",
                    "Prescriptions",
                    "Surgical care",
                ],
                "cost": "Priority groups may have copays",
                "facilities": "1,300+ locations nationwide",
                "learn_more": "https://www.va.gov/health-care/",
            },
            "home_loans": {
                "name": "VA Home Loan Program",
                "description": "Zero-down-payment home loans",
                "benefits": [
                    "No down payment",
                    "No PMI",
                    "Competitive rates",
                    "Flexible credit",
                ],
                "learn_more": "https://www.va.gov/housing-assistance/",
            },
            "life_insurance": {
                "name": "Veterans Group Life Insurance (VGLI)",
                "description": "Affordable life insurance for veterans",
                "max_coverage": "$400,000",
                "conversion": "Can convert from SGLI",
                "learn_more": "https://www.insurance.va.gov/",
            },
        }

    def search_organizations(
        self,
        search_query: str = "",
        category: str = "",
        skip: int = 0,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """Search veteran organizations"""
        return {
            "results": self.get_veteran_organizations(category),
            "total": len(self.get_veteran_organizations(category)),
            "filters": {
                "search_query": search_query,
                "category": category,
            },
            "pagination": {
                "skip": skip,
                "limit": limit,
                "total_pages": 1,
            },
        }
