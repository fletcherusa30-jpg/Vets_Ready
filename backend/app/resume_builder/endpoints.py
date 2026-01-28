"""
Resume Builder REST Endpoints
Flask/FastAPI route handlers for resume operations
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from .models import (
    Resume,
    ExperienceItem,
    MOSMapping,
    ResumeTailoringRequest,
    AchievementGeneratorRequest,
    AchievementGeneratorResponse,
)


class ResumeBuilderEndpoints:
    """Resume building API endpoints"""

    def __init__(self):
        self.resumes: Dict[str, Resume] = {}
        self.mos_mappings: Dict[str, MOSMapping] = {}

    def generate_resume(self, user_id: str, data: Dict[str, Any]) -> Resume:
        """
        POST /resume/generate
        Generate a new resume from veteran profile data
        """
        resume = Resume(
            id=f"resume_{user_id}_{datetime.now().timestamp()}",
            user_id=user_id,
            title=data.get("title", ""),
            summary=data.get("summary", ""),
            experience=self._parse_experience(data.get("experience", [])),
            education=data.get("education", []),
            skills=data.get("skills", []),
            certifications=data.get("certifications", []),
            contact_info=data.get("contact_info", {}),
        )

        self.resumes[resume.id] = resume
        return resume

    def tailor_resume(self, resume_id: str, request: ResumeTailoringRequest) -> Resume:
        """
        POST /resume/tailor
        Tailor resume for specific job posting
        """
        if resume_id not in self.resumes:
            raise ValueError(f"Resume {resume_id} not found")

        resume = self.resumes[resume_id]

        # Tailor summary to job
        tailored_summary = self._tailor_summary(
            resume.summary, request.job_description, request.target_job_title, request.keywords
        )
        resume.summary = tailored_summary

        # Reorder experience by relevance
        resume.experience = self._reorder_experience_by_relevance(
            resume.experience, request.keywords
        )

        # Update resume
        resume.updated_at = datetime.now()
        resume.version += 1
        self.resumes[resume_id] = resume

        return resume

    def generate_achievements(
        self, resume_id: str, request: AchievementGeneratorRequest
    ) -> AchievementGeneratorResponse:
        """
        POST /resume/achievements
        Generate achievement statements for an experience item
        """
        if resume_id not in self.resumes:
            raise ValueError(f"Resume {resume_id} not found")

        resume = self.resumes[resume_id]

        # Find experience item
        experience = next(
            (exp for exp in resume.experience if exp.id == request.experience_id), None
        )
        if not experience:
            raise ValueError(f"Experience {request.experience_id} not found")

        # Generate achievements
        achievements = self._generate_achievement_statements(
            request.role_description, request.key_metrics, request.impact_area
        )

        # Add to experience
        experience.achievements.extend(achievements)
        experience_updated_at = datetime.now()

        return AchievementGeneratorResponse(
            achievements=achievements,
            metrics_incorporated=request.key_metrics,
            confidence_score=0.85,
        )

    def translate_mos(self, mos_code: str) -> MOSMapping:
        """
        GET /mos/translate/{mosCode}
        Translate military MOS to civilian job titles and skills
        """
        # Check cache
        if mos_code in self.mos_mappings:
            return self.mos_mappings[mos_code]

        # Map MOS to civilian roles
        mapping = self._map_mos_to_civilian(mos_code)
        self.mos_mappings[mos_code] = mapping

        return mapping

    def get_resume(self, resume_id: str) -> Optional[Resume]:
        """Retrieve a resume by ID"""
        return self.resumes.get(resume_id)

    def list_resumes(self, user_id: str) -> List[Resume]:
        """List all resumes for a user"""
        return [r for r in self.resumes.values() if r.user_id == user_id]

    def delete_resume(self, resume_id: str) -> bool:
        """Delete a resume"""
        if resume_id in self.resumes:
            del self.resumes[resume_id]
            return True
        return False

    # Private helper methods

    def _parse_experience(self, exp_data: List[Dict]) -> List[ExperienceItem]:
        """Parse experience data into ExperienceItem objects"""
        experience = []
        for exp in exp_data:
            item = ExperienceItem(
                id=exp.get("id", f"exp_{len(experience)}"),
                title=exp.get("title", ""),
                organization=exp.get("organization", ""),
                start_date=exp.get("start_date", ""),
                end_date=exp.get("end_date"),
                current=exp.get("current", False),
                description=exp.get("description", ""),
                achievements=exp.get("achievements", []),
                skills=exp.get("skills", []),
                mos_codes=exp.get("mos_codes", []),
            )
            experience.append(item)
        return experience

    def _tailor_summary(
        self, summary: str, job_description: str, target_job: str, keywords: List[str]
    ) -> str:
        """Tailor resume summary to job posting"""
        # In production, use NLP/LLM to tailor summary
        tailored = f"{summary}\n\nTargeted for: {target_job}"
        for keyword in keywords:
            if keyword not in tailored.lower():
                tailored += f"\nSpecializing in: {keyword}"
        return tailored

    def _reorder_experience_by_relevance(
        self, experience: List[ExperienceItem], keywords: List[str]
    ) -> List[ExperienceItem]:
        """Reorder experience items by relevance to keywords"""
        # Score each experience item by keyword matches
        def relevance_score(exp: ExperienceItem) -> int:
            score = 0
            exp_text = f"{exp.title} {exp.description} {' '.join(exp.skills)}".lower()
            for keyword in keywords:
                score += exp_text.count(keyword.lower())
            return score

        return sorted(experience, key=relevance_score, reverse=True)

    def _generate_achievement_statements(
        self, role_description: str, metrics: List[str], impact_area: Optional[str]
    ) -> List[str]:
        """Generate achievement statements from role details"""
        achievements = []

        # Generate quantified achievements
        for metric in metrics:
            achievement = f"Contributed to {impact_area or 'organizational'} objectives with focus on {metric}"
            achievements.append(achievement)

        # Add role-based achievement
        achievements.append(f"Successfully executed responsibilities as {role_description}")

        return achievements

    def _map_mos_to_civilian(self, mos_code: str) -> MOSMapping:
        """Map military MOS to civilian job titles"""
        # Placeholder MOS mappings
        mos_map = {
            "11B": MOSMapping(
                mos_code="11B",
                mos_title="Infantryman",
                civilian_job_titles=["Operations Manager", "Security Officer", "Logistics Coordinator"],
                skills=["Leadership", "Tactical Planning", "Team Management", "Risk Assessment"],
                certifications=["Project Management", "Security Clearance"],
                keywords=["leadership", "team", "operations", "planning"],
            ),
            "25B": MOSMapping(
                mos_code="25B",
                mos_title="Information Technology Specialist",
                civilian_job_titles=["IT Specialist", "Network Administrator", "Systems Administrator"],
                skills=["Network Management", "System Administration", "Cybersecurity", "Technical Support"],
                certifications=["CompTIA A+", "Network+", "Security+"],
                keywords=["IT", "network", "systems", "technology"],
            ),
        }

        return mos_map.get(
            mos_code,
            MOSMapping(
                mos_code=mos_code,
                mos_title=f"Unknown MOS {mos_code}",
                civilian_job_titles=["Technical Role"],
            ),
        )
