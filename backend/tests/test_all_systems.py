"""
Comprehensive Test Suite for VetsReady Systems
Tests for Scanner Engine, Resume Builder, Job Recruiting, and Financial Tools
"""

import unittest
from datetime import datetime
from unittest.mock import Mock, patch

# Import modules to test
import sys
sys.path.insert(0, "C:\\Dev\\Vets Ready\\backend\\app")

from scanner.models import DocumentType, ProcessingStatus, DocumentInput, ValidationResult
from scanner.pipeline import ScannerPipeline
from scanner.error_handling import ErrorHandler, ErrorType, ErrorSeverity

from resume_builder.models import Resume, ExperienceItem
from resume_builder.endpoints import ResumeBuilderEndpoints

from job_recruiting.models import Job, VeteranProfile, EmploymentType
from job_recruiting.endpoints import JobRecruitingEndpoints

from financial_tools.models import Budget, RetirementInputs
from financial_tools.endpoints import FinancialToolsEndpoints


class TestScannerEngine(unittest.TestCase):
    """Tests for Scanner Engine"""

    def setUp(self):
        self.pipeline = ScannerPipeline()

    def test_pipeline_initialization(self):
        """Test pipeline initializes with all stages"""
        self.assertIsNotNone(self.pipeline.intake)
        self.assertIsNotNone(self.pipeline.preprocessing)
        self.assertIsNotNone(self.pipeline.ocr)
        self.assertIsNotNone(self.pipeline.classification)
        self.assertIsNotNone(self.pipeline.validation)
        self.assertIsNotNone(self.pipeline.normalization)

    def test_error_handler(self):
        """Test error handling"""
        handler = ErrorHandler()

        # Create error
        error = handler.create_error(
            error_type=ErrorType.FILE_NOT_FOUND,
            message="Test file not found",
            severity=ErrorSeverity.HIGH,
            stage="intake",
            document_id="test_doc",
        )

        # Handle error
        result = handler.handle_error(error)
        self.assertTrue(result)
        self.assertEqual(handler.error_count, 1)

    def test_document_input_creation(self):
        """Test document input creation"""
        doc_input = DocumentInput(
            id="test_123",
            file_path="/test/path.pdf",
            file_name="test.pdf",
            file_type=".pdf",
            source="upload",
        )

        self.assertEqual(doc_input.id, "test_123")
        self.assertEqual(doc_input.file_name, "test.pdf")
        self.assertEqual(doc_input.file_type, ".pdf")


class TestResumeBuilder(unittest.TestCase):
    """Tests for Resume Builder"""

    def setUp(self):
        self.endpoints = ResumeBuilderEndpoints()

    def test_generate_resume(self):
        """Test resume generation"""
        data = {
            "title": "Military to Civilian Transition",
            "summary": "Experienced military professional",
            "experience": [
                {
                    "id": "exp_1",
                    "title": "Platoon Sergeant",
                    "organization": "US Army",
                    "start_date": "2015-01-01",
                    "end_date": "2021-01-01",
                }
            ],
            "skills": ["Leadership", "Operations Planning"],
            "contact_info": {"email": "test@test.com"},
        }

        resume = self.endpoints.generate_resume("user_123", data)

        self.assertIsNotNone(resume)
        self.assertEqual(resume.user_id, "user_123")
        self.assertEqual(resume.title, "Military to Civilian Transition")
        self.assertEqual(len(resume.experience), 1)

    def test_translate_mos(self):
        """Test MOS translation"""
        mos = self.endpoints.translate_mos("11B")

        self.assertEqual(mos.mos_code, "11B")
        self.assertEqual(mos.mos_title, "Infantryman")
        self.assertTrue(len(mos.civilian_job_titles) > 0)

    def test_get_resume(self):
        """Test retrieving resume"""
        data = {"title": "Test Resume", "summary": "Test"}
        resume = self.endpoints.generate_resume("user_123", data)

        retrieved = self.endpoints.get_resume(resume.id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.id, resume.id)


class TestJobRecruiting(unittest.TestCase):
    """Tests for Job Recruiting Platform"""

    def setUp(self):
        self.endpoints = JobRecruitingEndpoints()

    def test_create_veteran_profile(self):
        """Test veteran profile creation"""
        profile_data = {
            "name": "John Smith",
            "service_branch": "Army",
            "separation_rank": "Captain",
            "mos_codes": ["11B", "25B"],
            "years_service": 10.0,
            "skills": ["Leadership", "Project Management"],
        }

        profile = self.endpoints.create_profile("user_123", profile_data)

        self.assertEqual(profile.user_id, "user_123")
        self.assertEqual(profile.name, "John Smith")
        self.assertEqual(profile.years_service, 10.0)

    def test_add_job_posting(self):
        """Test job posting creation"""
        job_data = {
            "title": "Operations Manager",
            "company": "Tech Corp",
            "description": "Seeking experienced operations manager",
            "location": "New York, NY",
            "employment_type": "full_time",
            "required_skills": ["Leadership", "Operations"],
            "veteran_friendly": True,
        }

        job = self.endpoints.add_job(job_data)

        self.assertIsNotNone(job)
        self.assertEqual(job.title, "Operations Manager")
        self.assertTrue(job.veteran_friendly)

    def test_job_matching(self):
        """Test job matching algorithm"""
        # Create profile
        profile_data = {
            "name": "Test Veteran",
            "service_branch": "Army",
            "separation_rank": "Captain",
            "years_service": 10.0,
            "skills": ["Leadership", "Operations Planning"],
        }
        profile = self.endpoints.create_profile("user_123", profile_data)

        # Create job
        job_data = {
            "title": "Operations Manager",
            "company": "Test Corp",
            "description": "Test",
            "location": "NYC",
            "required_skills": ["Leadership"],
            "veteran_friendly": True,
        }
        job = self.endpoints.add_job(job_data)

        # Perform search
        matches = self.endpoints.search_jobs("user_123")

        self.assertTrue(len(matches) > 0)
        self.assertTrue(matches[0].match_score > 0)

    def test_certification_pathway(self):
        """Test certification pathway"""
        pathway = self.endpoints.get_certification_pathway("CompTIA A+")

        self.assertEqual(pathway.certification_name, "CompTIA A+")
        self.assertGreater(pathway.estimated_hours, 0)
        self.assertGreater(pathway.cost, 0)


class TestFinancialTools(unittest.TestCase):
    """Tests for Financial Tools"""

    def setUp(self):
        self.endpoints = FinancialToolsEndpoints()

    def test_create_budget(self):
        """Test budget creation"""
        budget_data = {
            "name": "Monthly Budget 2026",
            "period": "monthly",
            "income": [
                {"source": "employment", "amount": 5000, "frequency": "monthly"}
            ],
            "expenses": [
                {"category": "housing", "amount": 1500, "frequency": "monthly"},
                {"category": "food", "amount": 500, "frequency": "monthly"},
            ],
        }

        budget = self.endpoints.create_budget("user_123", budget_data)

        self.assertEqual(budget.user_id, "user_123")
        self.assertEqual(budget.total_income, 5000)
        self.assertEqual(budget.total_expenses, 2000)
        self.assertEqual(budget.net_income, 3000)

    def test_analyze_spending(self):
        """Test spending analysis"""
        budget_data = {
            "name": "Test Budget",
            "period": "monthly",
            "income": [
                {"source": "employment", "amount": 5000, "frequency": "monthly"}
            ],
            "expenses": [
                {"category": "housing", "amount": 1500, "frequency": "monthly"},
                {"category": "food", "amount": 500, "frequency": "monthly"},
                {"category": "entertainment", "amount": 200, "frequency": "monthly"},
            ],
        }

        budget = self.endpoints.create_budget("user_123", budget_data)
        analysis = self.endpoints.analyze_spending(budget.id)

        self.assertIsNotNone(analysis)
        self.assertEqual(analysis["total_income"], 5000)
        self.assertEqual(analysis["total_expenses"], 2200)
        self.assertGreater(len(analysis["recommendations"]), 0)

    def test_savings_goal_calculation(self):
        """Test savings goal calculation"""
        result = self.endpoints.calculate_savings_goal(
            target_amount=100000,
            years=10,
            current_savings=10000,
            annual_return=0.07,
        )

        self.assertIsNotNone(result)
        self.assertGreater(result["monthly_contribution"], 0)
        self.assertEqual(result["target_amount"], 100000)

    def test_retirement_planning(self):
        """Test retirement projection"""
        inputs_data = {
            "current_age": 40,
            "retirement_age": 65,
            "life_expectancy": 90,
            "current_savings": 100000,
            "annual_contribution": 10000,
            "expected_return_rate": 0.07,
            "current_income": 80000,
            "va_disability_income": 2000,
            "lifestyle_expenses": 50000,
        }

        inputs = self.endpoints.create_retirement_plan("user_123", inputs_data)
        projection = self.endpoints.get_retirement_projection(inputs.id)

        self.assertIsNotNone(projection)
        self.assertGreater(projection.projected_savings_at_retirement, 0)
        self.assertGreater(len(projection.recommendations), 0)


class TestDataIntegration(unittest.TestCase):
    """Integration tests across systems"""

    def test_veteran_to_resume_flow(self):
        """Test flow from job recruiting to resume building"""
        # Create veteran profile
        job_endpoints = JobRecruitingEndpoints()
        profile_data = {
            "name": "John Smith",
            "service_branch": "Army",
            "separation_rank": "Major",
            "mos_codes": ["11B"],
            "years_service": 15.0,
            "skills": ["Leadership", "Strategy"],
        }
        profile = job_endpoints.create_profile("user_123", profile_data)

        # Create resume from profile
        resume_endpoints = ResumeBuilderEndpoints()
        resume_data = {
            "title": f"{profile.name} - {profile.separation_rank}",
            "summary": f"Experienced {profile.service_branch} officer",
            "skills": profile.skills,
        }
        resume = resume_endpoints.generate_resume("user_123", resume_data)

        self.assertIsNotNone(profile)
        self.assertIsNotNone(resume)
        self.assertEqual(resume.user_id, profile.user_id)

    def test_budget_to_retirement_flow(self):
        """Test flow from budgeting to retirement planning"""
        financial_endpoints = FinancialToolsEndpoints()

        # Create budget
        budget_data = {
            "name": "2026 Budget",
            "income": [
                {"source": "employment", "amount": 6000, "frequency": "monthly"}
            ],
            "expenses": [
                {"category": "housing", "amount": 1500, "frequency": "monthly"},
            ],
        }
        budget = financial_endpoints.create_budget("user_456", budget_data)

        # Create retirement plan
        retirement_data = {
            "current_age": 45,
            "retirement_age": 65,
            "current_savings": 150000,
            "annual_contribution": 6000,  # 50% of monthly surplus
            "current_income": 72000,
            "lifestyle_expenses": 50000,
        }
        retirement = financial_endpoints.create_retirement_plan("user_456", retirement_data)

        self.assertIsNotNone(budget)
        self.assertIsNotNone(retirement)
        self.assertEqual(retirement.user_id, budget.user_id)


def run_all_tests():
    """Run all tests"""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestScannerEngine))
    suite.addTests(loader.loadTestsFromTestCase(TestResumeBuilder))
    suite.addTests(loader.loadTestsFromTestCase(TestJobRecruiting))
    suite.addTests(loader.loadTestsFromTestCase(TestFinancialTools))
    suite.addTests(loader.loadTestsFromTestCase(TestDataIntegration))

    runner = unittest.TextTestRunner(verbosity=2)
    return runner.run(suite)


if __name__ == "__main__":
    result = run_all_tests()
    exit(0 if result.wasSuccessful() else 1)
