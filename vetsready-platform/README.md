# VetsReady Platform - One-Stop Veteran Support System

## Overview

VetsReady is a comprehensive, modular platform designed to support veterans across ten critical life domains:

- **Benefits**: VA and state benefit exploration and maximization
- **VA Disabilities**: Educational information on ratings and conditions
- **Employment & Careers**: Job matching, resume tools, career discovery
- **Education & Training**: GI Bill planning, training program matching
- **Wellness**: Non-clinical wellness resources, habits, and routines
- **Finances**: Budget planning, income tracking, financial scenarios
- **Community & Mentorship**: Mentor matching, local resource discovery
- **Entrepreneurship**: Business planning, funding discovery, compliance guidance
- **Legal Rights**: Educational content on workplace rights, USERRA, ADA
- **Housing & Family Support**: Housing programs, family benefits, caregiver resources

---

## 🚨 Legal & Ethical Framework

**VetsReady provides EDUCATIONAL, INFORMATIONAL, and ORGANIZATIONAL resources ONLY.**

### What We Don't Do:
- ❌ Provide legal advice or representation before the VA
- ❌ Provide medical advice, diagnoses, or treatment recommendations
- ❌ Represent veterans in VA claims
- ❌ Diagnose disabilities or medical conditions

### What We Do:
- ✅ Organize information to help veterans make informed decisions
- ✅ Educate veterans on eligibility, programs, and resources
- ✅ Connect veterans to accredited representatives, attorneys, and healthcare professionals
- ✅ Help veterans understand their rights and options

**Always encourage veterans to consult:**
- VA-accredited representatives for claims
- Licensed attorneys for legal matters
- Healthcare professionals for medical concerns

---

## Architecture

### Layers

```
┌─────────────────────────────────────────────────┐
│                   UI Layer                      │
│  (Web, Mobile, Admin Portal)                   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Domain Services Layer                │
│  (Benefits, Employment, Education, Wellness)   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Core Services Layer                  │
│  (Profile, Rules Engine, Notifications)        │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│        Integration Layer                        │
│  (MOS Engine, Benefits Engine, External APIs)  │
└─────────────────────────────────────────────────┘
```

### Folder Structure

```
vetsready-platform/
├── docs/                          # Documentation
│   ├── overview.md               # Platform overview
│   ├── architecture.md           # Architecture details
│   ├── data_model.md             # Core data entities
│   ├── ux_flows.md               # User experience flows
│   ├── roadmap.md                # Development roadmap
│   └── legal_disclaimer.md       # Legal disclaimers
│
├── core/                         # Core platform services
│   ├── identity/                 # Authentication & authorization
│   ├── profile/                  # Veteran profile management
│   ├── rules_engine/             # Eligibility & recommendation rules
│   ├── notifications/            # Event-based notifications
│   └── analytics/                # Event logging & analytics
│
├── domains/                      # Domain-specific business logic
│   ├── benefits/                 # Benefits exploration & maximization
│   ├── disabilities/             # Disability information (educational)
│   ├── employment/               # Employment & career services
│   ├── education/                # Education & training planning
│   ├── wellness/                 # Non-clinical wellness tools
│   ├── finances/                 # Financial planning & tracking
│   ├── community/                # Community & mentorship
│   ├── entrepreneurship/         # Business & startup support
│   ├── legal_rights/             # Educational legal content
│   ├── housing/                  # Housing & family support
│   └── family_support/           # Family-centered services
│
├── integrations/                 # External system integrations
│   ├── mos_engine/              # Military job intelligence
│   ├── benefits_engine/         # VA/state benefits integration
│   ├── disability_system/       # Disability rating system
│   ├── employment_system/       # Employment matching
│   ├── external_jobs/           # External job APIs
│   ├── external_training/       # Training program APIs
│   └── state_benefits/          # State benefits APIs
│
├── ui/                          # User interface layers
│   ├── web_app/                 # React web application
│   ├── mobile_app/              # React Native mobile app
│   └── admin_portal/            # Admin dashboard
│
├── data/                        # Data models & warehouse
│   ├── models/                  # Core TypeScript data models
│   ├── warehouse/               # Data aggregation & analytics
│   └── seed/                    # Sample data & fixtures
│
└── tests/                       # Test suites
```

---

## Core Data Model

### VeteranProfile
```typescript
- id: UUID
- name: string
- dob: Date
- contactInfo: { email, phone, address }
- location: { city, state, country }
- branchHistory: ServiceHistory[]
- dischargeType: "honorable" | "general" | "other"
- goals: Goal[]
```

### ServiceHistory
```typescript
- branch: string
- mosOrAfscOrRating: string
- title: string
- startDate: Date
- endDate: Date
- deployments: { location, startDate, endDate }[]
- rankAtSeparation: string
```

### DisabilityProfile (Educational)
```typescript
- conditions: string[]
- symptoms: string[]
- ratings: { condition, rating, effective_date }[]
- functionalImpact: string[]
- claimHistory: { date, status, result }[]
```

### BenefitsProfile
```typescript
- vaBenefits: { type, status, amount }[]
- stateBenefits: { type, status, amount }[]
- otherBenefits: { type, source }[]
- eligibilityFlags: string[]
- utilizationStatus: { benefit, usage }[]
```

---

## Core Services

### Identity Service
Manages authentication and authorization. Future support for SSO integration.

```typescript
interface IAuthService {
  login(email: string, password: string): Promise<AuthToken>
  logout(token: string): Promise<void>
  validateToken(token: string): Promise<boolean>
  refreshToken(token: string): Promise<AuthToken>
}
```

### Profile Service
CRUD operations for veteran profiles and sub-profiles.

```typescript
interface IProfileService {
  createProfile(data: VeteranProfile): Promise<VeteranProfile>
  getProfile(id: string): Promise<VeteranProfile>
  updateProfile(id: string, data: Partial<VeteranProfile>): Promise<VeteranProfile>
  deleteProfile(id: string): Promise<void>
}
```

### Rules Engine
Config-driven engine for evaluating eligibility and generating recommendations.

```typescript
interface IRulesEngine {
  evaluateEligibility(veteranId: string, rule: Rule): Promise<boolean>
  generateRecommendations(veteranId: string): Promise<Recommendation[]>
  evaluateNudges(veteranId: string): Promise<Nudge[]>
}
```

### Notifications Service
Event-based notification abstraction with future SMS/email hooks.

```typescript
interface INotificationService {
  subscribe(event: string, handler: EventHandler): void
  publish(event: string, payload: any): void
  sendInAppNotification(userId: string, notification: Notification): Promise<void>
}
```

### Analytics Service
Event logging without PII for usage and outcomes tracking.

```typescript
interface IAnalyticsService {
  logEvent(event: AnalyticsEvent): Promise<void>
  trackUserFlow(userId: string, flow: string): Promise<void>
  getMetrics(filter: MetricsFilter): Promise<Metrics>
}
```

---

## Development Roadmap

### Phase 1: Core & Profile (Weeks 1-4)
- [x] Folder structure and configuration
- [ ] Authentication & identity service
- [ ] Profile CRUD operations
- [ ] Database schema
- [ ] Basic UI scaffolding

### Phase 2: Benefits & Disabilities (Weeks 5-8)
- [ ] Benefits eligibility explorer
- [ ] Benefit maximization planner
- [ ] Disability information system (educational)
- [ ] Rating explainer (plain language)
- [ ] Benefits domain UI

### Phase 3: Employment & Education (Weeks 9-12)
- [ ] Employment system integration
- [ ] Career discovery flow
- [ ] Resume tools & templates
- [ ] GI Bill planner
- [ ] Training program matcher

### Phase 4: Finances, Wellness & Community (Weeks 13-16)
- [ ] Budget planner
- [ ] Financial scenario modeling
- [ ] Wellness tools & resources
- [ ] Mentor matching system
- [ ] Local resource discovery

### Phase 5: Advanced Features (Weeks 17-20)
- [ ] Entrepreneurship tools
- [ ] Housing program explorer
- [ ] Family support resources
- [ ] Legal rights education
- [ ] Advanced analytics

### Phase 6: Integration & Scale (Weeks 21-24)
- [ ] Full MOS engine integration
- [ ] Benefits engine integration
- [ ] External job API integration
- [ ] Multi-state support
- [ ] Performance optimization

---

## Getting Started

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/vetsready-platform.git
cd vetsready-platform

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Local Development
```bash
# Start the development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Format and lint code
npm run format
npm run lint
```

---

## Contributing

We welcome contributions! Please:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

### Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Ensure all tests pass before submitting PR
- Always include a clear problem statement and solution

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Disclaimer

**VetsReady is an educational and informational platform. It does not constitute legal advice, medical advice, or representation before the VA.**

For official information, veterans should consult:
- VA.gov for official VA benefits
- VA-accredited representatives for claims assistance
- Licensed attorneys for legal matters
- Healthcare professionals for medical concerns

---

## Support

- 📧 Email: support@vetsready.com
- 💬 Discord: [Join our community](https://discord.gg/vetsready)
- 📚 Documentation: [VetsReady Docs](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/vetsready-platform/issues)

---

**VetsReady: Supporting Veterans on Every Path Forward** 🇺🇸
