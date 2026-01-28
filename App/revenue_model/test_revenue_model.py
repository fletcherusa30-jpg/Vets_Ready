"""
revenue_model/test_revenue_model.py
Test suite for VetsReady Revenue Model.
"""
import unittest
from tiers import VETERAN_TIERS, ENTERPRISE_TIERS
from affiliate import AFFILIATE_PARTNERS, COMMISSION_RANGE
from marketplace import MARKETPLACE_COMMISSION
from sponsored import SPONSORED_LISTINGS
from api_access import API_ACCESS_PRICING
from projection import PROJECTIONS

class TestRevenueModel(unittest.TestCase):
    def test_veteran_tiers(self):
        self.assertEqual(VETERAN_TIERS["free"], 0)
        self.assertTrue(VETERAN_TIERS["top_lifetime"] > 0)

    def test_enterprise_tiers(self):
        self.assertEqual(ENTERPRISE_TIERS["agency_basic"], 10000)

    def test_affiliate(self):
        self.assertIn("certifications", AFFILIATE_PARTNERS)
        self.assertTrue(50 <= COMMISSION_RANGE[0] <= 500)

    def test_marketplace(self):
        self.assertTrue(5 <= MARKETPLACE_COMMISSION[0] <= 10)

    def test_sponsored(self):
        self.assertIn("veteran_friendly_employers", SPONSORED_LISTINGS)

    def test_api_access(self):
        self.assertTrue(500 <= API_ACCESS_PRICING[0] <= 5000)

    def test_projection(self):
        self.assertTrue(PROJECTIONS["year_1"][0] < PROJECTIONS["year_1"][1])

if __name__ == "__main__":
    unittest.main()
