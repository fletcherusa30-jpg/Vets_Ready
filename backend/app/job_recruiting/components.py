"""
Job Recruiting Platform Frontend Components - TypeScript/React
Components for job matching, profile management, and employer browsing
"""

# Component template documentation

COMPONENTS = [
    "MOSSelector",
    "JobListingCard",
    "VeteranProfileCard",
    "JobMatchResults",
    "EmployerBrowser",
    "CertificationPathwayView",
]

def get_component_specs(component_name: str) -> dict:
    """Get component specifications"""
    specs = {
        "MOSSelector": {
            "description": "MOS code selector with civilian translation",
            "props": ["onSelect", "selectedMOS", "serviceHistory"],
            "features": [
                "Search/autocomplete",
                "Civilian job title translation",
                "Skills mapping",
                "Career pathway suggestions",
            ],
        },
        "JobListingCard": {
            "description": "Individual job listing card with match score",
            "props": ["job", "matchScore", "onApply"],
            "features": [
                "Job details display",
                "Match score visualization",
                "Skill gap analysis",
                "Apply button",
                "Share/save options",
            ],
        },
        "VeteranProfileCard": {
            "description": "Veteran candidate profile card for employers",
            "props": ["profile", "onContact", "onViewDetails"],
            "features": [
                "Profile summary",
                "Service history",
                "Skills showcase",
                "Certifications",
                "Contact options",
            ],
        },
        "JobMatchResults": {
            "description": "Search results with match scoring",
            "props": ["matches", "onFilter", "loading"],
            "features": [
                "List/grid view toggle",
                "Sorting by match score",
                "Filtering by job type",
                "Pagination",
            ],
        },
        "EmployerBrowser": {
            "description": "Browse veteran-friendly employers",
            "props": ["employers", "filters", "onSelectEmployer"],
            "features": [
                "Employer profiles",
                "Hiring programs",
                "Employee reviews",
                "Job openings",
            ],
        },
        "CertificationPathwayView": {
            "description": "Display certification pathway recommendations",
            "props": ["pathway", "currentCerts", "onStart"],
            "features": [
                "Course recommendations",
                "Cost and duration",
                "Prerequisites",
                "Career impact",
                "Enroll button",
            ],
        },
    }

    return specs.get(component_name, {})


# Data types for frontend integration
TYPES = {
    "JobMatchScore": {
        "fields": [
            "job_id: string",
            "match_score: number (0-100)",
            "skill_match: number",
            "experience_match: number",
            "cultural_match: number",
        ]
    },
    "VeteranProfileData": {
        "fields": [
            "name: string",
            "service_branch: string",
            "separation_rank: string",
            "years_service: number",
            "mos_codes: string[]",
            "skills: string[]",
            "certifications: string[]",
        ]
    },
    "JobDetails": {
        "fields": [
            "title: string",
            "company: string",
            "location: string",
            "salary_range: {min: number, max: number}",
            "employment_type: string",
            "remote_friendly: boolean",
            "veteran_friendly: boolean",
        ]
    },
}


if __name__ == "__main__":
    print("Job Recruiting Platform Components")
    print("=" * 60)
    for comp in COMPONENTS:
        spec = get_component_specs(comp)
        print(f"\n{comp}")
        print(f"Description: {spec.get('description', 'N/A')}")
        print(f"Props: {', '.join(spec.get('props', []))}")
        print(f"Features:")
        for feature in spec.get('features', []):
            print(f"  - {feature}")
