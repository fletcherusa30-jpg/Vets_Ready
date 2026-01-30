# CRSC & Resource Ecosystem - Quick Reference Guide

## 🎯 What Was Built?

### CRSC Hub (Master Control Center)
A unified interface for veterans to:
- View CRSC eligibility & estimated payment
- Compare CRDP vs CRSC with tax impact analysis
- Understand Open Season election options
- Review evidence mapping & confidence
- See decision explanation
- Run appeal strategy
- Simulate "What if approved?"
- Access compliance audit trail

**File**: `src/pages/CrscHubPage.tsx`

---

## 🔑 Key Components & How to Use Them

### 1. CRDP/CRSC Recommendation Engine
**When**: Calculate optimal program for veteran
**Where**: Backend service at `app/services/`
**How**:
```python
from app.services.resource_recommendation_engine import recommend_resources
result = recommend_resources(veteran_profile, all_resources, interactions)
```

### 2. CRSC Hub Page
**When**: Veteran needs centralized CRSC information
**Where**: `src/pages/CrscHubPage.tsx`
**How**:
```tsx
<CrscHubPage
  veteranId="vet123"
  onEditProfile={() => navigate('/crsc/edit')}
  onGeneratePacket={() => navigate('/crsc/packet')}
/>
```

### 3. Resource Marketplace
**When**: Veteran needs to discover resources
**Where**: `src/pages/ResourceMarketplacePage.tsx`
**How**:
```tsx
<ResourceMarketplacePage />
```

### 4. Partner Portal
**When**: Organization needs to manage profile
**Where**: `src/pages/PartnerPortalPage.tsx`
**How**:
```tsx
<PartnerPortalPage />
```

### 5. Resource Impact Dashboard
**When**: Enterprise needs engagement analytics
**Where**: `src/pages/ResourceImpactDashboardPage.tsx`
**How**:
```tsx
<ResourceImpactDashboardPage />
```

---

## 📊 API Endpoints

### CRSC Enterprise Gateway
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/enterprise/crsc/events` | POST | Ingest anonymized CRSC event |
| `/enterprise/crsc/events` | GET | Query CRSC events |
| `/enterprise/crsc/audit` | GET | Get API audit log |
| `/enterprise/crsc/analytics/summary` | GET | Summary metrics |
| `/enterprise/crsc/analytics/cohorts` | GET | By-cohort breakdown |
| `/enterprise/crsc/analytics/trends` | GET | Time-series trends |
| `/enterprise/crsc/lineage` | GET | **NEW** - Audit trail |

### Resource Engine
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/resources` | GET | List all resources |
| `/resources/recommended` | GET | Get personalized recommendations |
| `/resources/{id}` | GET | Retrieve single resource |
| `/resources` | POST | Create resource (admin) |
| `/resources/{id}` | PUT | Update resource (admin) |
| `/resources/{id}/interact` | POST | Record user interaction |
| `/resources/{id}/metrics` | GET | Impact metrics (enterprise) |
| `/resources/dashboard/metrics` | GET | Dashboard aggregates |

---

## 🗂️ Data Models

### CRSC Event (to Enterprise)
```typescript
{
  cohortId: "cohort123",
  timestamp: "2024-01-28T10:30:00Z",
  eligibilityStatus: "LIKELY_ELIGIBLE",
  combatRelatedPercentage: 45,
  evidenceStrength: "HIGH",
  crscPayableEstimate: 950,
  retirementImpactScore: 0.75,
  combatCategoryCounts: {
    armedConflict: 2,
    hazardousService: 1,
    instrumentalityOfWar: 0,
    purpleHeart: 0
  }
}
```

### Lineage Record (Audit)
```typescript
{
  recordId: "uuid",
  timestamp: "2024-01-28T10:30:00Z",
  sourceModule: "CRSCRatingCalculator",
  inputHashes: ["hash_of_va_rating", "hash_of_conditions"],
  outputHash: "hash_of_final_payment",
  transformationSummary: "Calculated 45% combat-related from 3 conditions",
  version: "1.0"
}
```

### Resource Provider
```typescript
{
  id: "mission43",
  name: "Mission43",
  description: "Idaho veteran employment org",
  categories: ["EMPLOYMENT", "COMMUNITY"],
  tags: ["jobs", "mentorship"],
  serviceAreaScope: "STATE",
  serviceAreas: ["IDAHO", "BOISE"],
  eligibility: ["VETERANS", "SPOUSES"],
  websiteUrl: "https://mission43.org",
  contactPhone: "from_config",  // NOT hardcoded
  partnerLevel: "FEATURED"
}
```

---

## 💾 Data Persistence

### JSONL Files (Append-Only)
| File | Purpose | Location |
|------|---------|----------|
| `enterprise_crsc_events.jsonl` | CRSC analytics events | `app/data/` |
| `enterprise_crsc_lineage.jsonl` | Audit/lineage records | `app/data/` |
| `enterprise_crsc_audit.jsonl` | API audit log | `app/data/` |
| `resource_providers.jsonl` | Resource organizations | `app/data/` |
| `resource_interactions.jsonl` | User interactions | `app/data/` |

**Load Strategy**: Files loaded into memory on startup, appended on changes
**Recovery**: On restart, all data reloaded from disk

---

## 🔐 Security & Auth

### API Authentication
```python
# Require enterprise auth for sensitive endpoints
@router.get("/metrics", dependencies=[Depends(require_enterprise_auth)])
async def get_metrics():
    pass
```

### Supported Auth Methods
1. **API Key**: Header `X-API-Key: key123`
2. **Bearer Token**: Header `Authorization: Bearer token123`
3. **Role Validation**: Check user role (ORG_ADMIN, ANALYST, etc.)

### Rate Limiting
- Standard: 100 req/min
- Enterprise: 1000 req/min
- Admin: Unlimited

---

## 🎨 Frontend Styling

All components use:
- **Shadcn UI** for base components (Card, Button, Badge, etc.)
- **Tailwind CSS** for custom styles
- **Lucide Icons** for iconography
- **Recharts** for data visualization

Example:
```tsx
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

<Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Users className="w-5 h-5" />
      Resources
    </CardTitle>
  </CardHeader>
</Card>
```

---

## 🧪 Testing

### Run CRSC Tests
```bash
cd rally-forge-frontend
npm test -- --run src/services/crsc/__tests__/
```

### Run Resource Tests
```bash
cd rally-forge-backend
pytest tests/test_resource_engine.py -v
```

### Run All
```bash
npm test -- --run              # Frontend
pytest tests/ -v                # Backend
```

---

## 🚀 Deployment

### Prerequisites
```bash
# Backend
pip install fastapi pydantic python-multipart
python app/scripts/seed_resources.py  # Seed orgs

# Frontend
npm install
npm run build
```

### Environment Setup
```bash
# .env file
MISSION43_URL=https://mission43.org
MISSION43_PHONE=+1-208-xxx-xxxx
MISSION43_EMAIL=info@mission43.org
# ... other org configs
ENTERPRISE_API_KEYS=key1,key2,key3
```

### Start Services
```bash
# Backend
cd rally-forge-backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (dev)
cd rally-forge-frontend
npm run dev

# Frontend (prod)
npm run build
npm run preview
```

---

## 📋 Checklist for Adding New Features

### Adding a New Resource Provider
1. Update `RESOURCE_CONFIG` in `seed_resources.py`
2. Add env vars for contact details (PARTNER_NAME_URL, PHONE, EMAIL)
3. Run seeding script: `python seed_resources.py`
4. Verify in Marketplace UI

### Adding a New CRSC Panel
1. Create component in `src/components/crsc/`
2. Import in `CrscHubPage.tsx`
3. Add TabsContent section
4. Wire up data/callbacks
5. Add test file
6. Update documentation

### Adding a New API Endpoint
1. Define schema in `app/schemas/`
2. Add service logic in `app/services/`
3. Create router in `app/routers/`
4. Import router in `app/main.py`
5. Add tests in `tests/`
6. Document in OpenAPI

---

## 🐛 Troubleshooting

### "Resource not found"
- Check JSONL file exists: `app/data/resource_providers.jsonl`
- Run seeding script: `python seed_resources.py`
- Verify ID in URL matches provider ID

### "401 Unauthorized"
- Check API key in header: `X-API-Key: <key>`
- Verify bearer token is valid
- Check role is correct (ORG_ADMIN, ANALYST, etc.)

### "EventStore empty"
- Check JSONL ingestion: `POST /enterprise/crsc/events`
- Verify event structure matches schema
- Check `app/data/enterprise_crsc_events.jsonl` has data

### "Rate limit exceeded"
- Wait 1 minute for reset
- Request enterprise tier for higher limit

---

## 📞 Support

**Questions about CRSC calculations?**
→ See `CrdpCrscRecommendationEngine.ts` comments

**Questions about Resource recommendations?**
→ See `resource_recommendation_engine.py` scoring logic

**Questions about data privacy?**
→ Check PII validation in `crsc_enterprise_service.py`

**Questions about deployment?**
→ See `CRSC_RESOURCE_ECOSYSTEM_COMPLETE.md`

---

## 🎓 Learning Resources

- **CRSC Basics**: `CRSC_RESOURCE_ECOSYSTEM_COMPLETE.md`
- **CRDP Tax Calc**: `CrdpCrscRecommendationEngine.ts` (line 1-80)
- **Resource Scoring**: `resource_recommendation_engine.py` (line 40-100)
- **API Design**: `app/routers/resources.py`
- **Component Props**: Any `tsx` file top docstring

---

**Last Updated**: January 28, 2026
**Version**: 1.0
**Status**: Production Ready ✅

