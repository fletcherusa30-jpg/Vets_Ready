"""
onboarding_flow/test_onboarding_flow.py
Test suite for VetsReady Onboarding Flow.
"""
import unittest
from steps import get_steps
from retention import get_triggers

class TestOnboardingFlow(unittest.TestCase):
    def test_steps(self):
        steps = get_steps()
        self.assertIn("welcome_screen", steps)
        self.assertIn("dashboard_launch", steps)

    def test_triggers(self):
        triggers = get_triggers()
        self.assertIn("daily_tasks", triggers)
        self.assertIn("benefit_updates", triggers)

if __name__ == "__main__":
    unittest.main()
