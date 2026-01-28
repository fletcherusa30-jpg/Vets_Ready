"""
enterprise_licensing/contracts.py
Defines contract elements for VetsReady Enterprise Licensing.
"""
CONTRACT_ELEMENTS = {
    "sla": "99.9% uptime",
    "data_privacy": "public-source only",
    "support_tiers": ["basic", "priority", "dedicated"],
    "renewal_terms": "annual",
    "training_package": True
}

def get_contract_elements():
    return CONTRACT_ELEMENTS
