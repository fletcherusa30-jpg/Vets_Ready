"""
benefits_engine/test_benefits_engine.py
Test suite for VetsReady Benefits Engine.
Covers eligibility, evidence, rating, MOS exposure, and output.
"""
import unittest
from eligibility import eligibility_summary
from evidence import evidence_checklist
from rating import rating_estimate
from mos_exposure import mos_exposure_notes
from output import generate_output

class TestBenefitsEngine(unittest.TestCase):
    def test_eligibility(self):
        data = {"service_months": 36, "character_of_service": "Honorable", "combat_zone": True}
        result = eligibility_summary(data)
        self.assertTrue(result["service"])
        self.assertTrue(result["character"])
        self.assertTrue(result["combat"])

    def test_evidence(self):
        data = {"condition": "disability"}
        result = evidence_checklist(data)
        self.assertIn("21-526EZ", result["forms"])

    def test_rating(self):
        data = {"conditions": {"hearing_loss": 1, "ptsd": 1}}
        result = rating_estimate(data)
        self.assertGreater(result["total"], 0)

    def test_mos_exposure(self):
        data = {"mos": "11B"}
        result = mos_exposure_notes(data)
        self.assertEqual(result["exposure"], "High")

    def test_output(self):
        out = generate_output({"service": True}, {"forms": []}, {"ratings": {}}, {"exposure": "High"}, "Next steps")
        self.assertIn("service", out)
        self.assertIn("exposure", out)

if __name__ == "__main__":
    unittest.main()
