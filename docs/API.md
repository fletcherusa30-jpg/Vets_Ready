# Vets Ready API Documentation

## Base URL
`http://localhost:4000/api` (Development)

## Authentication
Currently using user ID in request headers for demo. Production should implement JWT or OAuth2.

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "error": "Error message (if success: false)"
}
```

---

## Budget Module

### Calculate Budget
**Endpoint:** `POST /api/budget/calculate`

**Request Body:**
```json
{
  "monthly_income": 5000,
  "expenses": {
    "housing": 1500,
    "utilities": 200,
    "food": 400,
    "transportation": 300,
    "insurance": 150,
    "debt_payments": 200,
    "other": 250
  },
  "goal_savings_rate": 0.2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthly_income": 5000,
    "total_expenses": 3000,
    "monthly_surplus": 2000,
    "savings_rate": 0.4,
    "categories": [...],
    "recommendations": [...]
  }
}
```

### Create Budget Scenario
**Endpoint:** `POST /api/budget/scenarios`

**Request Body:**
```json
{
  "user_id": "uuid",
  "name": "Aggressive Saving Plan",
  "monthly_income": 5000,
  "total_expenses": 3000,
  "savings_rate": 0.4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Aggressive Saving Plan",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get Budget Scenario
**Endpoint:** `GET /api/budget/scenarios/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Aggressive Saving Plan",
    "monthly_income": 5000,
    "total_expenses": 3000,
    "savings_rate": 0.4,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Update Budget Scenario
**Endpoint:** `PUT /api/budget/scenarios/:id`

**Request Body:**
```json
{
  "name": "Updated Plan",
  "monthly_income": 5500
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated scenario */ }
}
```

---

## Retirement Module

### Calculate Retirement Plan
**Endpoint:** `POST /api/retirement/calculate`

**Request Body:**
```json
{
  "current_age": 45,
  "retirement_age": 60,
  "life_expectancy": 90,
  "current_savings": 250000,
  "monthly_contribution": 2000,
  "tsp": {
    "balance": 180000,
    "monthly_contribution": 1500,
    "allocation": {
      "c_fund": 0.3,
      "s_fund": 0.2,
      "i_fund": 0.2,
      "f_fund": 0.2,
      "g_fund": 0.1
    }
  },
  "pension": {
    "monthly_amount": 3500,
    "cola_applicable": true
  },
  "va_disability": {
    "monthly_amount": 1200,
    "rating": 30
  },
  "social_security": {
    "monthly_amount": 2800,
    "start_age": 67
  },
  "inflation_rate": 0.03,
  "investment_return": 0.07
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projection": {
      "age": 60,
      "tsp_balance": 450000,
      "total_portfolio": 700000,
      "monthly_income": 7500
    },
    "longevity_analysis": {
      "age_85": 150000,
      "age_90": 25000,
      "age_95": -100000
    },
    "readiness_score": 0.95,
    "recommendations": [...]
  }
}
```

### Get Retirement Scenario
**Endpoint:** `GET /api/retirement/scenarios/:id`

**Response:**
```json
{
  "success": true,
  "data": { /* retirement scenario details */ }
}
```

### Calculate Withdrawal Strategy
**Endpoint:** `POST /api/retirement/withdrawal`

**Request Body:**
```json
{
  "portfolio_balance": 700000,
  "monthly_expenses": 5000,
  "life_expectancy": 90,
  "current_age": 60,
  "annual_return": 0.07,
  "inflation_rate": 0.03,
  "strategy": "guardrail"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "annual_withdrawal": 28000,
    "safe_withdrawal_rate": 0.04,
    "guardrail_upper": 840000,
    "guardrail_lower": 560000,
    "success_probability": 0.95,
    "schedule": [...]
  }
}
```

### Scenario Analysis
**Endpoint:** `POST /api/retirement/scenario-analysis`

**Request Body:**
```json
{
  "base_scenario": { /* retirement params */ },
  "scenarios": [
    {
      "name": "Optimistic",
      "investment_return": 0.08,
      "inflation_rate": 0.025
    },
    {
      "name": "Conservative",
      "investment_return": 0.05,
      "inflation_rate": 0.035
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "name": "Optimistic",
        "age_85_balance": 250000,
        "success_rate": 0.98
      },
      {
        "name": "Conservative",
        "age_85_balance": 50000,
        "success_rate": 0.85
      }
    ]
  }
}
```

---

## Job Board

### List Job Postings
**Endpoint:** `GET /api/jobboard/postings?skip=0&limit=20&search=&mos=`

**Query Parameters:**
- `skip` (int): Pagination offset
- `limit` (int): Results per page
- `search` (string): Search in title/description
- `mos` (string): Filter by required MOS

**Response:**
```json
{
  "success": true,
  "data": {
    "postings": [
      {
        "id": "uuid",
        "title": "Senior Software Engineer",
        "employer": "Tech Corp",
        "description": "Looking for experienced engineers...",
        "required_mos": "25B",
        "salary_range": "120000-150000",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 120
  }
}
```

### Get Job Details
**Endpoint:** `GET /api/jobboard/postings/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Senior Software Engineer",
    "employer": { /* employer details */ },
    "description": "...",
    "requirements": [...],
    "salary_range": "120000-150000",
    "benefits": [...],
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Submit Job Application
**Endpoint:** `POST /api/jobboard/apply`

**Request Body:**
```json
{
  "user_id": "uuid",
  "job_posting_id": "uuid",
  "cover_letter": "I am interested in this position..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "job_posting_id": "uuid",
    "match_score": 0.92,
    "applied_at": "2024-01-15T10:30:00Z"
  }
}
```

### Find Matching Jobs
**Endpoint:** `GET /api/jobboard/match?user_id=`

**Query Parameters:**
- `user_id` (uuid): Veteran's user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "job_id": "uuid",
        "title": "Senior Software Engineer",
        "match_score": 0.95,
        "match_reasons": ["MOS match", "Skills match", "Experience level"]
      }
    ]
  }
}
```

### Get Veteran Profile
**Endpoint:** `GET /api/jobboard/profile/:user_id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "mos": "25B",
    "rank": "SFC",
    "years_experience": 12,
    "skills": ["Python", "AWS", "Leadership"],
    "certifications": ["AWS Solutions Architect", "CISSP"],
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

## Transition Services

### Translate MOS
**Endpoint:** `GET /api/transition/mos/:code`

**Response:**
```json
{
  "success": true,
  "data": {
    "mos_code": "25B",
    "military_title": "Information Technology Specialist",
    "civilian_equivalent": ["Systems Administrator", "IT Support Specialist", "Junior Software Developer"],
    "certifications": ["CompTIA A+", "CompTIA Network+", "CompTIA Security+"],
    "career_paths": [
      {
        "title": "DevOps Engineer",
        "salary_range": "100000-150000",
        "required_skills": ["Linux", "CI/CD", "Cloud"]
      }
    ]
  }
}
```

### Get VA Benefits Info
**Endpoint:** `GET /api/transition/va-benefits?disability_rating=&separation_date=`

**Query Parameters:**
- `disability_rating` (int): 0-100
- `separation_date` (string): YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "benefits": [
      {
        "name": "Disability Compensation",
        "monthly_amount": 1200,
        "rating": 30
      },
      {
        "name": "GI Bill",
        "monthly_amount": 2000,
        "entitlement_months": 36
      }
    ],
    "healthcare": {
      "tricare_eligibility": true,
      "va_healthcare": true
    }
  }
}
```

### Get Separation Timeline
**Endpoint:** `GET /api/transition/timeline?separation_date=`

**Query Parameters:**
- `separation_date` (string): YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "months_before": 12,
        "task": "File DD Form 1172-2 (DEERS)",
        "category": "Administrative",
        "priority": "high"
      },
      {
        "months_before": 6,
        "task": "Update resume and LinkedIn profile",
        "category": "Employment",
        "priority": "high"
      }
    ],
    "total_tasks": 45,
    "categories": ["Finance", "Healthcare", "Employment", "Education", "Housing", "Legal"]
  }
}
```

### Build Resume
**Endpoint:** `POST /api/transition/resume-build`

**Request Body:**
```json
{
  "user_id": "uuid",
  "mos": "25B",
  "rank": "SFC",
  "military_bullets": [
    "Led team of 8 IT specialists managing 500+ systems",
    "Implemented new network infrastructure reducing downtime by 40%"
  ],
  "civilian_job_title": "Systems Administrator"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "civilian_bullets": [
      "Directed team of IT professionals to maintain critical infrastructure for 500+ workstations",
      "Architected and deployed network modernization initiative, achieving 40% reduction in system outages"
    ],
    "resume_preview": "..."
  }
}
```

### Get Checklist
**Endpoint:** `GET /api/transition/checklist/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "separation_date": "2024-12-31",
    "items": [
      {
        "id": "uuid",
        "category": "Finance",
        "task": "Review pension documents",
        "completed": false,
        "due_date": "2024-09-30"
      }
    ],
    "progress": {
      "completed": 12,
      "total": 45,
      "percentage": 0.267
    }
  }
}
```

---

## Outreach & Community Discovery

### Search Public Pages
**Endpoint:** `GET /api/outreach/pages?keyword=&category=&minFollowers=`

**Query Parameters:**
- `keyword` (string): Search term
- `category` (string): Filter by category
- `minFollowers` (int): Minimum follower count

**Response:**
```json
{
  "success": true,
  "data": {
    "curated": [
      {
        "id": "uuid",
        "name": "American Legion",
        "platform": "facebook",
        "url": "https://facebook.com/americanlegion",
        "category": "veteran-service-org",
        "followers_count": 250000,
        "confidence_score": 0.99,
        "status": "active"
      }
    ],
    "community": [
      /* user-submitted pages that were approved */
    ],
    "total": 15
  }
}
```

### Get Pages by Category
**Endpoint:** `GET /api/outreach/pages/category/:category`

**Response:**
```json
{
  "success": true,
  "data": [
    { /* page objects */ }
  ]
}
```

### Get Trending Pages
**Endpoint:** `GET /api/outreach/pages/trending`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Wounded Warrior Project",
      "platform": "instagram",
      "followers_count": 180000,
      "confidence_score": 0.95
    }
  ]
}
```

### Submit Page
**Endpoint:** `POST /api/outreach/submissions`

**Request Body:**
```json
{
  "submitted_by": "uuid",
  "platform": "facebook",
  "page_name": "My Veteran Community Group",
  "page_url": "https://facebook.com/groups/mygroup",
  "category": "support-group",
  "description": "A community for veterans to support each other"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "submitted_by": "uuid",
    "platform": "facebook",
    "page_name": "My Veteran Community Group",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Search Businesses
**Endpoint:** `GET /api/outreach/businesses?keyword=&category=&location=`

**Query Parameters:**
- `keyword` (string): Search term
- `category` (string): Industry filter
- `location` (string): Location filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Veteran's Tactical Gear",
      "description": "Tactical equipment for outdoor enthusiasts",
      "industry": "Retail",
      "location": "Denver, CO",
      "website": "https://veteranstactical.com",
      "veteran_owner_name": "John Smith",
      "service_branch": "Army",
      "certifications": ["Veteran-Owned Business"]
    }
  ]
}
```

### Search Nonprofits
**Endpoint:** `GET /api/outreach/nonprofits?keyword=&mission=`

**Query Parameters:**
- `keyword` (string): Search term
- `mission` (string): Mission area filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Team Rubicon",
      "description": "Veteran-led organization providing disaster relief",
      "mission": "Disaster relief and community recovery",
      "ein": "27-3278407",
      "website": "https://teamrubicon.org",
      "headquarters_location": "Los Angeles, CA",
      "mission_areas": ["disaster-relief", "community-service"],
      "donation_url": "https://teamrubicon.org/donate"
    }
  ]
}
```

### Scan Keywords
**Endpoint:** `POST /api/outreach/scan-keywords`

**Request Body:**
```json
{
  "text": "This is a great PTSD support group for Vietnam veterans and their families"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "keywords": ["PTSD support", "support", "veteran"],
    "categories": ["support-group", "support-group", "veteran-resource"],
    "confidence": 0.90,
    "matches": [
      {
        "keyword": "PTSD support",
        "category": "support-group",
        "confidence": 0.85
      }
    ]
  }
}
```

### Get Directory Statistics
**Endpoint:** `GET /api/outreach/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPages": 425,
    "totalBusinesses": 189,
    "totalNonprofits": 127,
    "submissions": {
      "pending": 23,
      "approved": 89,
      "rejected": 12
    }
  }
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": "Invalid input",
  "issues": [
    {
      "code": "too_small",
      "minimum": 18,
      "type": "number",
      "path": ["age"],
      "message": "Number must be greater than or equal to 18"
    }
  ]
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

Recommended implementation (not yet active):
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests
- Burst allowance: 150 requests

---

## Pagination

For list endpoints, use:
- `skip` (int): Offset (default: 0)
- `limit` (int): Results per page (default: 20, max: 100)

Example: `/api/jobboard/postings?skip=20&limit=20` gets results 21-40

---

## Versioning

Current API version: **v1**

Future versions will be available at `/api/v2`, `/api/v3`, etc.

---

**Last Updated**: January 2024
**Version**: 1.0.0
