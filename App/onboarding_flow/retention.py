"""
onboarding_flow/retention.py
Defines retention triggers for VetsReady Onboarding Flow.
"""
RETENTION_TRIGGERS = [
    "daily_tasks",
    "weekly_missions",
    "document_reminders",
    "job_alerts",
    "benefit_updates"
]

def get_triggers():
    return RETENTION_TRIGGERS
