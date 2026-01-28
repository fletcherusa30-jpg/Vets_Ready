# VetsReady API Quick Reference

## Base URL
```
Development: http://localhost:8000
Production: https://api.vetsready.app
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

Obtain token via:
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "veteran@example.com",
  "password": "password123"
}
```

---

## Business Directory API

### Search Businesses
```
POST /api/business/search
Content-Type: application/json

{
  "query": "IT",                    # Optional: search name/specialty
  "category": "IT Services",        # Optional: category filter
  "state": "CA",                    # Optional: state code
  "certification": "VOSB"           # Optional: VOSB, SDVOSB, SBA 8(a), HUBZone
}

Response: 200 OK
[
  {
    "id": "biz-1",
    "name": "TacticalTech Solutions",
    "category": "IT Services",
    "state": "VA",
    "certification": ["VOSB", "SDVOSB"],
    "rating": 4.8,
    "employees": 45,
    "specialties": ["Cloud Solutions", "Cybersecurity"],
    "federal_contractor": true
  }
]
```

### Get Business Details
```
GET /api/business/{business_id}

Response: 200 OK
{
  "id": "biz-1",
  "name": "TacticalTech Solutions",
  "description": "Enterprise IT solutions for federal agencies",
  "category": "IT Services",
  "state": "VA",
  "certification": ["VOSB", "SDVOSB"],
  "revenue_range": "$10M - $50M",
  "employees": 45,
  "specialties": ["Cloud Solutions", "Cybersecurity"],
  "federal_contractor": true,
  "contract_types": ["GSA Schedule", "IDIQ"],
  "team_size": 45,
  "rating": 4.8,
  "website": "www.tacticaltechsolutions.com",
  "contact": {
    "email": "info@tacticaltechsolutions.com",
    "phone": "703-555-0100",
    "address": "Arlington, VA"
  }
}
```

### Get Available Categories
```
GET /api/business/categories/list

Response: 200 OK
{
  "categories": [
    "IT Services",
    "Manufacturing",
    "Construction",
    "Professional Services",
    "Engineering",
    "Healthcare",
    "Logistics",
    "Energy",
    "Software Development",
    "Consulting"
  ]
}
```

### Get Certifications Info
```
GET /api/business/certifications/list

Response: 200 OK
{
  "VOSB": {
    "full_name": "Veteran-Owned Small Business",
    "description": "51% owned and operated by veterans",
    "requirement": "51% veteran ownership, active management",
    "benefits": [
      "Federal contracting preference",
      "SBA funding programs",
      "Networking opportunities"
    ]
  },
  "SDVOSB": { ... }
}
```

### Save Favorite Business
```
POST /api/business/{business_id}/favorite

Response: 200 OK
{
  "status": "success",
  "business_id": "biz-1",
  "favorited": true,
  "message": "Business added to your favorites"
}
```

---

## VBA Programs API

### Get All VBA Programs
```
GET /api/vba/programs

Response: 200 OK
[
  {
    "program": "Veteran-Owned Small Business",
    "description": "Businesses 51% owned by veterans",
    "eligibility": [
      "At least 51% owned by veteran(s)",
      "Veteran actively manages the business"
    ],
    "benefits": [
      "Federal contracting preferences",
      "SBA loan programs"
    ],
    "requirements": [
      "Proof of veteran status (DD-214)",
      "Business ownership documentation"
    ]
  }
]
```

### Get Specific VBA Program
```
GET /api/vba/programs/{program_type}
# program_type: VOSB, SDVOSB, etc.

Response: 200 OK
{
  "program": "Service-Disabled Veteran-Owned Small Business",
  "description": "51% owned by service-disabled veterans",
  "eligibility": [
    "51% owned by service-disabled veteran(s)",
    "Veteran has VA disability rating"
  ],
  "benefits": [
    "Enhanced federal contracting preference",
    "Priority SBA lending programs"
  ],
  "requirements": [
    "Service-disability documentation (VA letter)",
    "DD-214 military discharge"
  ]
}
```

### Get State Resources
```
GET /api/vba/state/{state_code}
# state_code: CA, TX, VA, etc.

Response: 200 OK
{
  "state": "CA",
  "programs": [
    {
      "name": "California Veterans Business Enterprise (VBE)",
      "description": "State certification for veteran businesses",
      "website": "www.veterans.ca.gov"
    }
  ],
  "resources": [
    {
      "name": "California Veteran Business Portal",
      "url": "portal.veterans.ca.gov",
      "description": "Central hub for veteran business resources"
    }
  ]
}
```

### Get Federal Veteran Benefits
```
GET /api/vba/benefits/federal

Response: 200 OK
{
  "disability_compensation": {
    "description": "Monthly stipend for service-connected disabilities",
    "min_rating": "10%",
    "max_amount": "$4,000+"
  },
  "education_benefits": {
    "description": "GI Bill and other education programs",
    "programs": ["Post-9/11 GI Bill", "Montgomery GI Bill"]
  },
  "health_care": {
    "description": "VA health care benefits",
    "coverage": "Comprehensive medical services"
  },
  "home_loans": {
    "description": "VA-guaranteed home loans",
    "guarantee": "Up to $647,200"
  },
  "insurance": {
    "description": "Life and disability insurance programs",
    "programs": ["SGLI", "VGLI"]
  }
}
```

---

## Veteran Organizations API

### Search Organizations
```
GET /api/organizations/search?query=veteran+support&org_type=support

Query Parameters:
- query: Search by name or focus area
- org_type: Organization type (support, advocacy, etc.)

Response: 200 OK
[
  {
    "id": "org-1",
    "name": "Red White & Blue",
    "organization_type": "Support",
    "mission": "Support veterans through community and health",
    "focus_areas": ["Mental Health", "Community", "Fitness"],
    "programs": ["Wellness Programs", "Peer Support"],
    "website": "www.redwhiteblue.org",
    "phone": "1-800-555-0100",
    "rating": 4.9
  }
]
```

### Get Organization Details
```
GET /api/organizations/{org_id}

Response: 200 OK
{
  "id": "org-1",
  "name": "Red White & Blue",
  "organization_type": "Support",
  "mission": "Provide health and wellness services to veterans",
  "focus_areas": ["Mental Health", "Community", "Fitness"],
  "programs": [
    "Wellness Programs",
    "Peer Support Groups",
    "Fitness Classes"
  ],
  "website": "www.redwhiteblue.org",
  "phone": "1-800-555-0100",
  "rating": 4.9
}
```

---

## Legal Reference API

### M21-1 Rating Schedule

#### Get Overview
```
GET /api/legal/m21-1/overview

Response: 200 OK
{
  "document": "M21-1",
  "full_name": "VA Schedule for Rating Disabilities",
  "version": "2024",
  "structure": {
    "diagnostic_codes": "38 CFR 4.1-4.150",
    "rating_percentages": [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  },
  "key_sections": { ... }
}
```

#### Get Condition Rating
```
GET /api/legal/m21-1/condition/{condition_code}
# condition_code: F4310 (PTSD), S06 (TBI), H9311 (Tinnitus)

Response: 200 OK
{
  "condition": {
    "condition": "Post-Traumatic Stress Disorder (PTSD)",
    "diagnostic_code": "F4310",
    "rating_criteria": {
      "10": "Mild, occasional symptoms; minimal functional impairment",
      "30": "Moderate symptoms; some functional impairment",
      "50": "Frequent severe symptoms; frequent impairment",
      "70": "Severe symptoms; frequent panic attacks",
      "100": "Severe symptoms; unable to work"
    },
    "examination_factors": [
      "Nightmares and sleep disturbance",
      "Flashbacks and intrusive thoughts",
      "Social dysfunction"
    ],
    "medical_evidence": [
      "VA medical examination",
      "Private medical records",
      "Buddy statements"
    ]
  }
}
```

#### List Common Conditions
```
GET /api/legal/m21-1/conditions/list

Response: 200 OK
{
  "conditions": {
    "F4310": "Post-Traumatic Stress Disorder (PTSD)",
    "S06": "Traumatic Brain Injury (TBI)",
    "H9311": "Tinnitus",
    "5299-5301": "Arthritis (various types)",
    "6522": "Sleep Apnea"
  }
}
```

### 38 CFR Part 3 (Adjudication)

#### Get Overview
```
GET /api/legal/cfr-3/overview

Response: 200 OK
{
  "regulation": "38 CFR Part 3",
  "title": "Adjudication",
  "purpose": "Rules for establishing veteran eligibility and granting benefits",
  "critical_concepts": {
    "service_connection": {
      "definition": "Relationship between in-service event and current disability",
      "requirements": [
        "Current medical diagnosis",
        "Evidence of in-service incident/illness",
        "Nexus (medical link)"
      ]
    }
  }
}
```

#### Get Specific Section
```
GET /api/legal/cfr-3/section/{section}
# section: 3_303, 3_309, 3_310

Response: 200 OK
{
  "section": "3_303",
  "regulation": "38 CFR Part 3",
  "content": {
    "title": "Establishing Service Connection",
    "summary": "How to prove service connection",
    "requirements": [ ... ]
  }
}
```

#### Service Connection Info
```
GET /api/legal/cfr-3/service-connection

Response: 200 OK
{
  "regulation": "38 CFR 3.303",
  "title": "Establishing Service Connection",
  "requirements": [
    {
      "requirement": "Current Medical Diagnosis",
      "description": "You must have a current medical condition",
      "evidence": ["VA examination", "Private medical records"]
    },
    {
      "requirement": "In-Service Event or Illness",
      "description": "Something must have happened during service",
      "evidence": ["Military medical records", "Incident reports"]
    },
    {
      "requirement": "Medical Nexus",
      "description": "Medical evidence linking service to current condition",
      "evidence": ["VA examination report", "Private physician statement"]
    }
  ]
}
```

#### Presumptive Conditions
```
GET /api/legal/cfr-3/presumptive?service_period=vietnam

Query Parameters:
- service_period: vietnam, gulf_war, etc.

Response: 200 OK
{
  "service_period": "vietnam",
  "presumptive_conditions": [
    {
      "condition": "Agent Orange related diseases",
      "examples": ["Diabetes", "COPD", "Certain cancers"],
      "reference": "38 CFR 3.309(d)",
      "stressor_required": false
    }
  ],
  "benefit": "Presumed = No nexus required"
}
```

### 38 CFR Part 4 (Rating Schedule)

#### Get Overview
```
GET /api/legal/cfr-4/overview

Response: 200 OK
{
  "regulation": "38 CFR Part 4",
  "title": "Schedule for Rating Disabilities",
  "rating_methodology": {
    "individual_ratings": "Each condition rated 10%-100%",
    "combined_ratings": "Multiple conditions combined using VA formula",
    "effective_dates": "Ratings effective from decision date"
  }
}
```

#### Get Diagnostic Code Details
```
GET /api/legal/cfr-4/diagnostic-code/{diagnostic_code}

Response: 200 OK
{
  "diagnostic_code": "5299-5301",
  "condition": "Arthritis (various types)",
  "body_system": "Musculoskeletal",
  "rating_range": "10% - 60%",
  "key_factors": [
    "Range of motion",
    "Pain",
    "Swelling and heat"
  ]
}
```

#### Get Body Systems
```
GET /api/legal/cfr-4/body-systems

Response: 200 OK
{
  "body_systems": {
    "musculoskeletal": "Bones, joints, muscles, ligaments",
    "neurological": "Brain, spinal cord, nerves",
    "mental_health": "Mental disorders and trauma",
    "respiratory": "Lungs and airways",
    "cardiovascular": "Heart and blood vessels"
  }
}
```

#### Get Special Ratings
```
GET /api/legal/cfr-4/special-ratings

Response: 200 OK
{
  "special_ratings": {
    "tdiu": {
      "name": "Total Disability Individual Unemployability",
      "description": "Rated as 100% if unable to work",
      "eligibility": [
        "Single condition 60%+ OR",
        "Multiple totaling 70%+ with one at 40%+"
      ]
    },
    "smc": {
      "name": "Special Monthly Compensation",
      "conditions": [
        "Loss of use of limbs",
        "Blindness",
        "Deafness"
      ]
    }
  }
}
```

### Combined Rating Calculator

#### Calculate Combined Rating
```
POST /api/legal/calculator/combined-rating
Content-Type: application/json

{
  "individual_ratings": [30, 20, 10]
}

Response: 200 OK
{
  "individual_ratings": [30, 20, 10],
  "combined_rating": 50,
  "calculation_steps": [
    "Highest: 30%",
    "Apply formula: 30 + (100-30) × combined_others / 100",
    "Round to nearest 10: 50%"
  ],
  "reference": "38 CFR 4.25"
}
```

### Integrated Claim Guidance

#### Get Claim Guidance
```
POST /api/legal/claim-guidance
Content-Type: application/json

{
  "condition_codes": ["F4310", "S06"]
}

Response: 200 OK
{
  "claim_preparation": {
    "step_1": {
      "title": "Gather Service Connection Evidence",
      "references": ["38 CFR 3.303", "38 CFR 3.309"],
      "checklist": [
        "Service medical records (DD 214)",
        "In-service incident documentation"
      ]
    },
    ...
  },
  "legal_standards": { ... },
  "appeal_basis": { ... }
}
```

---

## Retirement Planning API

### Check Eligibility
```
POST /api/retirement/eligibility
Content-Type: application/json

{
  "years_of_service": 20,
  "rank": "E-6",
  "branch": "Army"
}

Response: 200 OK
{
  "eligible": true,
  "years_of_service": 20,
  "message": "You meet the 20-year requirement for military retirement"
}
```

### Calculate Monthly Pension
```
POST /api/retirement/pension
Content-Type: application/json

{
  "years_of_service": 20,
  "base_pay": 3500,
  "branch": "Army"
}

Response: 200 OK
{
  "monthly_pension": 1750,
  "annual_pension": 21000,
  "calculation": "3500 × (20 × 2.5%) / 100 = 1750",
  "formula": "Monthly_Pension = Base_Pay × (Years × 2.5%) / 100"
}
```

### Calculate Monthly Budget
```
POST /api/retirement/budget
Content-Type: application/json

{
  "monthly_income": 3500,
  "expenses": {
    "housing": 1200,
    "food": 400,
    "utilities": 150,
    "transportation": 300,
    "healthcare": 200,
    "insurance": 250,
    "debt": 100,
    "entertainment": 150,
    "savings": 200,
    "other": 50
  }
}

Response: 200 OK
{
  "monthly_income": 3500,
  "total_expenses": 3600,
  "monthly_surplus_or_deficit": -100,
  "savings_rate": "5.7%",
  "ai_recommendations": [
    "Your expenses exceed income by $100/month",
    "Housing at 34% is slightly above recommended 30%",
    "Savings rate is healthy at 5.7%"
  ]
}
```

### Get Retirement Guide
```
POST /api/retirement/guide
Content-Type: application/json

{
  "years_of_service": 20,
  "disability_rating": 30,
  "monthly_income": 1750,
  "monthly_expenses": 2000
}

Response: 200 OK
{
  "readiness_score": 75,
  "readiness_level": "Good",
  "summary": "You are in good financial condition for retirement",
  "recommendations": [...]
}
```

---

## Error Responses

All endpoints return consistent error format:

```
401 Unauthorized
{
  "detail": "Invalid or expired token"
}

404 Not Found
{
  "detail": "Resource not found"
}

422 Validation Error
{
  "detail": [
    {
      "loc": ["body", "query"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}

500 Internal Server Error
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

- **Standard Limits**: 100 requests per minute per user
- **Search Endpoints**: 50 requests per minute
- **Calculator Endpoints**: 1000 requests per minute

Headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Pagination (Future)

Large result sets will support pagination:
```
GET /api/business/search?page=1&limit=20

{
  "items": [...],
  "total": 250,
  "page": 1,
  "limit": 20,
  "pages": 13
}
```

---

## Webhooks (Future)

Subscribe to events:
```
POST /api/webhooks/subscribe
Content-Type: application/json

{
  "event": "claim.updated",
  "url": "https://yourapp.com/webhook"
}
```

---

**Last Updated**: January 2025
**API Version**: 2.1
**Status**: Production Ready
