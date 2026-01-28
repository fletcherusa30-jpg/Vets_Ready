"""
VetsReady Integration Example
Demonstrates how all systems work together in a real-world scenario
"""

from backend.app.scanner import ScannerPipeline
from backend.app.resume_builder import ResumeBuilderEndpoints
from backend.app.job_recruiting import JobRecruitingEndpoints
from backend.app.financial_tools import FinancialToolsEndpoints


def veteran_onboarding_flow():
    """
    Complete flow: Veteran uploads DD214 → Profile created → Resume generated →
    Jobs matched → Budget planned → Retirement projected
    """

    # Step 1: Upload and scan DD214
    print("=" * 70)
    print("STEP 1: Scanner Engine - Process DD214")
    print("=" * 70)

    scanner = ScannerPipeline()
    dd214_path = "/documents/john_smith_dd214.pdf"

    result = scanner.process_document(
        file_path=dd214_path,
        source="veteran_upload",
        metadata={"veteran_id": "VET_001"}
    )

    if result:
        print(f"✓ Document processed: {result.document_id}")
        print(f"  - Document Type: {result.document_type}")
        print(f"  - Status: {result.processing_status.value}")
        print(f"  - Processing Time: {result.processing_time_ms:.2f}ms")
        print(f"  - Extracted Fields:")
        for field, value in result.standardized_fields.items():
            if value:
                print(f"    - {field}: {value}")

    # Step 2: Create veteran profile for job matching
    print("\n" + "=" * 70)
    print("STEP 2: Job Recruiting - Create Veteran Profile")
    print("=" * 70)

    job_recruiting = JobRecruitingEndpoints()

    profile_data = {
        "name": "John Smith",
        "service_branch": "Army",
        "separation_rank": "Captain",
        "mos_codes": ["11B", "12A"],
        "years_service": 12.0,
        "skills": [
            "Leadership",
            "Operations Planning",
            "Strategic Management",
            "Team Development",
            "Risk Assessment"
        ],
        "certifications": ["PMP", "Six Sigma Green Belt"],
        "geographic_preference": "New York, NY",
        "remote_preference": False,
        "salary_expectation": {"min": 80000, "max": 120000}
    }

    profile = job_recruiting.create_profile("veteran_001", profile_data)
    print(f"✓ Veteran profile created: {profile.id}")
    print(f"  - Name: {profile.name} ({profile.separation_rank})")
    print(f"  - Service: {profile.service_branch} ({profile.years_service} years)")
    print(f"  - Skills: {', '.join(profile.skills)}")

    # Step 3: Translate MOS to civilian roles
    print("\n" + "=" * 70)
    print("STEP 3: Resume Builder - MOS Translation")
    print("=" * 70)

    resume_builder = ResumeBuilderEndpoints()

    for mos_code in profile.mos_codes:
        mos_mapping = resume_builder.translate_mos(mos_code)
        print(f"✓ MOS {mos_code}: {mos_mapping.mos_title}")
        print(f"  - Civilian Roles: {', '.join(mos_mapping.civilian_job_titles)}")
        print(f"  - Transferable Skills: {', '.join(mos_mapping.skills[:3])}")

    # Step 4: Generate resume
    print("\n" + "=" * 70)
    print("STEP 4: Resume Builder - Generate Resume")
    print("=" * 70)

    resume_data = {
        "title": "Operations Manager",
        "summary": "Experienced military leader transitioning to civilian sector",
        "experience": [
            {
                "id": "exp_1",
                "title": "Company Commander",
                "organization": "US Army",
                "start_date": "2018-01-01",
                "end_date": "2024-01-01",
                "description": "Led team of 150+ personnel",
                "mos_codes": ["11B"],
            },
            {
                "id": "exp_2",
                "title": "Platoon Sergeant",
                "organization": "US Army",
                "start_date": "2014-01-01",
                "end_date": "2018-01-01",
                "mos_codes": ["11B"],
            }
        ],
        "skills": profile.skills,
        "contact_info": {
            "email": "john.smith@email.com",
            "phone": "+1-555-0123",
            "location": "New York, NY"
        }
    }

    resume = resume_builder.generate_resume("veteran_001", resume_data)
    print(f"✓ Resume generated: {resume.id}")
    print(f"  - Title: {resume.title}")
    print(f"  - Experience Items: {len(resume.experience)}")
    print(f"  - Skills: {', '.join(resume.skills)}")

    # Step 5: Search for matching jobs
    print("\n" + "=" * 70)
    print("STEP 5: Job Recruiting - Search and Match Jobs")
    print("=" * 70)

    # Add sample jobs
    jobs_to_post = [
        {
            "title": "Operations Manager",
            "company": "Tech Corp",
            "location": "New York, NY",
            "description": "Seeking experienced operations manager",
            "required_skills": ["Leadership", "Operations Planning"],
            "preferred_skills": ["Strategic Management", "Project Management"],
            "salary_range": {"min": 85000, "max": 120000},
            "employment_type": "full_time",
            "veteran_friendly": True,
            "remote_friendly": False,
        },
        {
            "title": "Program Director",
            "company": "Defense Contractor",
            "location": "New York, NY",
            "description": "Managing large-scale programs",
            "required_skills": ["Leadership", "Risk Assessment"],
            "salary_range": {"min": 95000, "max": 130000},
            "employment_type": "full_time",
            "veteran_friendly": True,
        }
    ]

    for job_data in jobs_to_post:
        job_recruiting.add_job(job_data)

    # Search jobs
    matches = job_recruiting.search_jobs("veteran_001", limit=5)
    print(f"✓ Found {len(matches)} matching jobs:")
    for match in matches:
        print(f"  - Match Score: {match.match_score:.1f}%")
        print(f"    Skill Match: {match.skill_match:.1f}%")
        print(f"    Matched Skills: {', '.join(match.matched_skills)}")

    # Step 6: Check certification pathways
    print("\n" + "=" * 70)
    print("STEP 6: Career Development - Certification Pathways")
    print("=" * 70)

    pathway = job_recruiting.get_certification_pathway("CompTIA Security+")
    print(f"✓ Certification Pathway: {pathway.certification_name}")
    print(f"  - Difficulty: {pathway.difficulty_level}")
    print(f"  - Duration: {pathway.estimated_hours} hours")
    print(f"  - Cost: ${pathway.cost}")
    print(f"  - Impact: {pathway.career_impact}")

    # Step 7: Create budget and financial plan
    print("\n" + "=" * 70)
    print("STEP 7: Financial Tools - Budget Planning")
    print("=" * 70)

    financial_tools = FinancialToolsEndpoints()

    budget_data = {
        "name": "2026 Monthly Budget",
        "period": "monthly",
        "income": [
            {
                "source": "employment",
                "amount": 8000,
                "frequency": "monthly",
                "notes": "New job salary"
            },
            {
                "source": "va_disability",
                "amount": 500,
                "frequency": "monthly",
            }
        ],
        "expenses": [
            {"category": "housing", "amount": 2000, "frequency": "monthly"},
            {"category": "utilities", "amount": 200, "frequency": "monthly"},
            {"category": "transportation", "amount": 400, "frequency": "monthly"},
            {"category": "food", "amount": 800, "frequency": "monthly"},
            {"category": "insurance", "amount": 300, "frequency": "monthly"},
            {"category": "savings", "amount": 1500, "frequency": "monthly"},
        ]
    }

    budget = financial_tools.create_budget("veteran_001", budget_data)
    print(f"✓ Budget created: {budget.id}")
    print(f"  - Monthly Income: ${budget.total_income:,.0f}")
    print(f"  - Monthly Expenses: ${budget.total_expenses:,.0f}")
    print(f"  - Net Income: ${budget.net_income:,.0f}")

    # Analyze spending
    analysis = financial_tools.analyze_spending(budget.id)
    print(f"  - Savings Rate: {analysis['savings_rate']:.1f}%")
    print(f"  - Recommendations:")
    for rec in analysis['recommendations']:
        print(f"    • {rec}")

    # Step 8: Retirement projection
    print("\n" + "=" * 70)
    print("STEP 8: Financial Tools - Retirement Planning")
    print("=" * 70)

    retirement_data = {
        "current_age": 40,
        "retirement_age": 65,
        "life_expectancy": 90,
        "current_savings": 200000,
        "annual_contribution": 18000,  # From budget surplus
        "expected_return_rate": 0.07,
        "current_income": 96000,  # Annual from job + VA
        "va_disability_income": 6000,  # Annual VA disability
        "military_retirement_income": 0,
        "lifestyle_expenses": 60000,  # Annual
        "healthcare_expenses": 5000,
    }

    retirement_inputs = financial_tools.create_retirement_plan("veteran_001", retirement_data)
    projection = financial_tools.get_retirement_projection(retirement_inputs.id)

    print(f"✓ Retirement Plan created: {retirement_inputs.id}")
    print(f"  - Retirement Age: {projection.retirement_age}")
    print(f"  - Projected Savings: ${projection.projected_savings_at_retirement:,.0f}")
    print(f"  - Annual Income at Retirement: ${projection.annual_income_at_retirement:,.0f}")
    print(f"  - Annual Expenses at Retirement: ${projection.annual_expenses_at_retirement:,.0f}")
    print(f"  - Surplus/Shortfall: ${projection.shortfall_or_surplus:,.0f}")
    print(f"  - Confidence Level: {projection.confidence_level}")
    print(f"  - Recommendations:")
    for rec in projection.recommendations:
        print(f"    • {rec}")

    # Summary
    print("\n" + "=" * 70)
    print("COMPLETE VETERAN ONBOARDING - SUMMARY")
    print("=" * 70)
    print(f"""
Veteran: {profile.name}
Status: Successfully onboarded to VetsReady platform

Completed Tasks:
✓ DD214 scanned and processed
✓ Veteran profile created
✓ Military skills translated to civilian roles
✓ Resume generated and ready
✓ Job matches found ({len(matches)} opportunities)
✓ Career development pathways identified
✓ Monthly budget created (${budget.net_income:,.0f}/month savings)
✓ Retirement plan projected ({projection.confidence_level} confidence)

Next Steps:
→ Apply to top 3 matched jobs
→ Enroll in certification pathway
→ Set up automatic retirement savings
→ Schedule career coaching session
    """)


if __name__ == "__main__":
    print("\nVetsReady Complete Integration Example")
    print("Demonstrating all 5 systems working together\n")
    veteran_onboarding_flow()
