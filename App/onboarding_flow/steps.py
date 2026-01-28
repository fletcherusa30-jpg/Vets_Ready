"""
onboarding_flow/steps.py
Defines onboarding steps for VetsReady Onboarding Flow.
"""
ONBOARDING_STEPS = [
    "welcome_screen",
    "identity_setup",
    "document_intake",
    "profile_personalization",
    "tier_explanation",
    "feature_activation",
    "dashboard_launch"
]

def get_steps():
    return ONBOARDING_STEPS
