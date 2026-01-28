"""
enterprise_licensing/test_enterprise_licensing.py
Test suite for VetsReady Enterprise Licensing system.
"""
import unittest
from tiers import get_tier_info
from features import list_features
from contracts import get_contract_elements

class TestEnterpriseLicensing(unittest.TestCase):
    def test_tier_info(self):
        info = get_tier_info("agency_basic")
        self.assertEqual(info["price"], 10000)
        self.assertIn("scanner_access", info["features"])

    def test_features(self):
        features = list_features()
        self.assertIn("admin_dashboard", features)

    def test_contract_elements(self):
        elements = get_contract_elements()
        self.assertEqual(elements["sla"], "99.9% uptime")
        self.assertTrue(elements["training_package"])

if __name__ == "__main__":
    unittest.main()
