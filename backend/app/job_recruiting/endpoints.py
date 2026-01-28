"""
Job Recruiting Platform REST Endpoints
Flask/FastAPI route handlers for job matching and recruiting
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from .models import (
    Job,
    VeteranProfile,
    JobMatch,
    CertificationPathway,
    EmployerProfile,
    ExperienceLevel,
)


class JobRecruitingEndpoints:
    """Job recruiting API endpoints"""

    def __init__(self):
        self.jobs: Dict[str, Job] = {}
        self.profiles: Dict[str, VeteranProfile] = {}
        self.matches: Dict[str, List[JobMatch]] = {}
        self.pathways: Dict[str, CertificationPathway] = {}
        self.employers: Dict[str, EmployerProfile] = {}

    def search_jobs(
        self,
        user_id: str,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 20,
    ) -> List[JobMatch]:
        """
        POST /jobs/search
        Search for jobs with intelligent matching
        """
        if user_id not in self.profiles:
            raise ValueError(f"Profile {user_id} not found")

        profile = self.profiles[user_id]
        all_matches = []

        # Match against all jobs
        for job in self.jobs.values():
            # Skip if filters don't match
            if filters:
                if filters.get("location") and job.location != filters["location"]:
                    continue
                if filters.get("employment_type") and job.employment_type != filters["employment_type"]:
                    continue
                if filters.get("min_salary") and job.salary_range.get("min", 0) < filters["min_salary"]:
                    continue

            # Calculate match score
            match = self._calculate_job_match(profile, job)
            if match.match_score > 0:
                all_matches.append(match)

        # Sort by match score and limit results
        all_matches.sort(key=lambda m: m.match_score, reverse=True)
        self.matches[user_id] = all_matches[:limit]

        return all_matches[:limit]

    def search_employers(
        self,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 20,
    ) -> List[EmployerProfile]:
        """
        POST /employers/search
        Search for veteran-friendly employers
        """
        matching_employers = []

        for employer in self.employers.values():
            # Filter by veteran-friendly status
            if filters and filters.get("veteran_friendly") and not employer.veteran_hiring_program:
                continue

            # Filter by benefits
            if filters and filters.get("remote") and not employer.remote_jobs_available:
                continue

            if filters and filters.get("military_spouse_friendly") and not employer.military_spouse_friendly:
                continue

            matching_employers.append(employer)

        return matching_employers[:limit]

    def get_certification_pathway(self, cert_name: str) -> CertificationPathway:
        """
        GET /certifications/pathway/{certName}
        Get certification pathway recommendations
        """
        if cert_name in self.pathways:
            return self.pathways[cert_name]

        # Create pathway
        pathway = self._create_certification_pathway(cert_name)
        self.pathways[cert_name] = pathway

        return pathway

    def create_profile(self, user_id: str, profile_data: Dict[str, Any]) -> VeteranProfile:
        """Create a veteran profile"""
        profile = VeteranProfile(
            id=f"profile_{user_id}_{datetime.now().timestamp()}",
            user_id=user_id,
            name=profile_data.get("name", ""),
            service_branch=profile_data.get("service_branch", ""),
            separation_rank=profile_data.get("separation_rank", ""),
            mos_codes=profile_data.get("mos_codes", []),
            years_service=profile_data.get("years_service", 0.0),
            skills=profile_data.get("skills", []),
            certifications=profile_data.get("certifications", []),
            geographic_preference=profile_data.get("geographic_preference"),
            remote_preference=profile_data.get("remote_preference", False),
            employment_type_preference=profile_data.get("employment_type_preference", []),
            salary_expectation=profile_data.get("salary_expectation", {}),
        )

        self.profiles[user_id] = profile
        return profile

    def get_profile(self, user_id: str) -> Optional[VeteranProfile]:
        """Get veteran profile"""
        return self.profiles.get(user_id)

    def add_job(self, job_data: Dict[str, Any]) -> Job:
        """Add a new job posting"""
        job = Job(
            id=f"job_{datetime.now().timestamp()}",
            title=job_data.get("title", ""),
            company=job_data.get("company", ""),
            description=job_data.get("description", ""),
            location=job_data.get("location", ""),
            salary_range=job_data.get("salary_range", {}),
            employment_type=job_data.get("employment_type", "full_time"),
            experience_level=job_data.get("experience_level", "mid"),
            required_skills=job_data.get("required_skills", []),
            preferred_skills=job_data.get("preferred_skills", []),
            certifications_required=job_data.get("certifications_required", []),
            related_mos_codes=job_data.get("related_mos_codes", []),
            remote_friendly=job_data.get("remote_friendly", False),
            relocation_assistance=job_data.get("relocation_assistance", False),
            veteran_friendly=job_data.get("veteran_friendly", False),
        )

        self.jobs[job.id] = job
        return job

    def add_employer(self, employer_data: Dict[str, Any]) -> EmployerProfile:
        """Add employer profile"""
        employer = EmployerProfile(
            id=f"employer_{datetime.now().timestamp()}",
            name=employer_data.get("name", ""),
            industry=employer_data.get("industry", ""),
            size=employer_data.get("size", ""),
            veteran_hiring_program=employer_data.get("veteran_hiring_program", False),
            military_spouse_friendly=employer_data.get("military_spouse_friendly", False),
            disability_inclusion=employer_data.get("disability_inclusion", False),
            remote_jobs_available=employer_data.get("remote_jobs_available", False),
            headquarters_location=employer_data.get("headquarters_location", ""),
            website=employer_data.get("website"),
            contact_email=employer_data.get("contact_email"),
        )

        self.employers[employer.id] = employer
        return employer

    # Private helper methods

    def _calculate_job_match(self, profile: VeteranProfile, job: Job) -> JobMatch:
        """Calculate match score between veteran profile and job"""
        skill_match = self._calculate_skill_match(profile.skills, job.required_skills, job.preferred_skills)
        experience_match = self._calculate_experience_match(profile.years_service, job.experience_level)
        cultural_match = self._calculate_cultural_match(profile, job)

        # Weighted average
        match_score = (
            skill_match * 0.4 + experience_match * 0.3 + cultural_match * 0.3
        ) * 100

        # Find matched and missing skills
        matched_skills = [s for s in profile.skills if s in job.required_skills or s in job.preferred_skills]
        missing_skills = [s for s in job.required_skills if s not in profile.skills]

        return JobMatch(
            job_id=job.id,
            candidate_id=profile.id,
            match_score=match_score,
            skill_match=skill_match * 100,
            experience_match=experience_match * 100,
            cultural_match=cultural_match * 100,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
        )

    def _calculate_skill_match(self, candidate_skills: List[str], required: List[str], preferred: List[str]) -> float:
        """Calculate skill match percentage"""
        if not required:
            return 0.5

        required_matches = sum(1 for s in required if s in candidate_skills)
        preferred_matches = sum(1 for s in preferred if s in candidate_skills)

        required_score = required_matches / len(required) if required else 0
        preferred_score = preferred_matches / len(preferred) if preferred else 0

        return (required_score * 0.7) + (preferred_score * 0.3)

    def _calculate_experience_match(self, years_service: float, experience_level: ExperienceLevel) -> float:
        """Calculate experience level match"""
        level_years = {
            ExperienceLevel.ENTRY: (0, 2),
            ExperienceLevel.MID: (2, 6),
            ExperienceLevel.SENIOR: (6, 12),
            ExperienceLevel.LEAD: (12, 20),
            ExperienceLevel.EXECUTIVE: (20, 100),
        }

        min_years, max_years = level_years.get(experience_level, (0, 100))
        if min_years <= years_service <= max_years:
            return 1.0
        elif years_service > max_years:
            return 0.8
        else:
            return 0.5

    def _calculate_cultural_match(self, profile: VeteranProfile, job: Job) -> float:
        """Calculate cultural fit match"""
        score = 0.5

        # Veteran-friendly bonus
        if job.veteran_friendly:
            score += 0.2

        # Location match
        if profile.geographic_preference and job.location == profile.geographic_preference:
            score += 0.1

        # Remote preference match
        if profile.remote_preference and job.remote_friendly:
            score += 0.1

        # Relocation assistance needed
        if profile.transportation_assistance_needed and job.relocation_assistance:
            score += 0.1

        return min(score, 1.0)

    def _create_certification_pathway(self, cert_name: str) -> CertificationPathway:
        """Create certification pathway"""
        cert_paths = {
            "CompTIA A+": CertificationPathway(
                id="cert_a_plus",
                certification_name="CompTIA A+",
                difficulty_level="beginner",
                estimated_hours=120,
                cost=230.0,
                career_impact="Entry-level IT support and help desk roles",
                prerequisites=["High School Diploma"],
                resources=[
                    {"type": "course", "name": "CompTIA A+ Exam Prep"},
                    {"type": "exam", "name": "220-1001 and 220-1002"},
                ],
            ),
            "Security+": CertificationPathway(
                id="cert_security_plus",
                certification_name="CompTIA Security+",
                mos_codes_required=["25B", "25D"],
                difficulty_level="intermediate",
                estimated_hours=200,
                cost=350.0,
                career_impact="Cybersecurity specialist and network security roles",
                prerequisites=["CompTIA Network+ or equivalent experience"],
            ),
        }

        return cert_paths.get(
            cert_name,
            CertificationPathway(
                id=f"cert_{cert_name.lower().replace(' ', '_')}",
                certification_name=cert_name,
            ),
        )
