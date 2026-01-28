# VetsReady Platform Architecture

## System Overview

VetsReady is a modular, service-oriented architecture designed to support veterans across ten critical life domains. The system is organized into distinct layers that communicate through well-defined interfaces.

---

## Architecture Layers

### 1. **UI Layer**
- **Web App** (React + TypeScript)
- **Mobile App** (React Native)
- **Admin Portal** (React + TypeScript)

Responsibilities:
- Render user interfaces
- Handle user input and interactions
- Communicate with the service layer via APIs
- Manage application state

### 2. **Domain Services Layer**
Ten specialized domain services:
- Benefits
- Disabilities (Educational)
- Employment & Careers
- Education & Training
- Wellness
- Finances
- Community & Mentorship
- Entrepreneurship
- Legal Rights (Educational)
- Housing & Family Support

Responsibilities:
- Implement domain-specific business logic
- Provide interfaces for domain operations
- Collaborate with core services
- Integrate with external systems

### 3. **Core Services Layer**
Five foundational services:
- **Identity**: Authentication & Authorization
- **Profile**: Veteran profile management & aggregation
- **Rules Engine**: Config-driven eligibility & recommendations
- **Notifications**: Event-based notifications
- **Analytics**: Event logging & metrics

Responsibilities:
- Provide cross-cutting functionality
- Enable communication between domains
- Manage shared data concerns
- Implement platform policies

### 4. **Integration Layer**
External system adapters:
- MOS Engine (Military job intelligence)
- Benefits Engine (VA/state benefits)
- Disability System (Rating information)
- Employment System (Career matching)
- External APIs (Jobs, training, state benefits)

Responsibilities:
- Abstract external dependencies
- Provide standardized interfaces
- Handle API communication
- Transform external data formats

### 5. **Data Layer**
- Core data models
- Data warehouse (aggregation)
- Seed data & fixtures

---

## Data Flow

```
User Interface
    ↓
    → API Gateway/Routes
    ↓
Domain Service
    ↓
    → Core Services (Profile, Rules, Notifications, Analytics)
    ↓
    → Integration Layer (External Systems)
    ↓
Database / External APIs
```

---

## Module Dependencies

### Core Services
```
┌─────────────────────────────────┐
│       Identity Service          │
│  (Auth & Authorization)         │
└────────────────┬────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│                  Profile Service                         │
│  (Veteran Profile & Aggregation)                         │
├──────────────────────────────────────────────────────────┤
│ Manages: VeteranProfile, DisabilityProfile,              │
│          BenefitsProfile, EmploymentProfile, etc.        │
└────────────────┬──────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬─────────────────────┐
    │            │            │                     │
    ↓            ↓            ↓                     ↓
Rules Engine  Analytics   Notifications       Integration
    │            │            │                     │
    └────────────┴────────────┴─────────────────────┘
                        ↓
              Domain Services (10)
                        ↓
              Data Models & Database
```

---

## Service Interfaces

### Identity Service
```typescript
interface IIdentityService {
  login(credentials: AuthCredentials): Promise<AuthToken>;
  logout(token: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  refreshToken(refreshToken: string): Promise<AuthToken>;
  register(email: string, password: string): Promise<User>;
  resetPassword(email: string): Promise<void>;
  hasPermission(userId: string, permission: Permission): Promise<boolean>;
  getCurrentUser(token: string): Promise<User>;
}
```

### Profile Service
```typescript
interface IProfileService {
  createProfile(data: VeteranProfile): Promise<VeteranProfile>;
  getProfile(id: string): Promise<VeteranProfile | null>;
  updateProfile(id: string, data: Partial<VeteranProfile>): Promise<VeteranProfile>;
  getFullProfile(veteranId: string): Promise<AggregatedProfile | null>;
  getProfileSummary(veteranId: string): Promise<ProfileSummary | null>;
  addGoal(veteranId: string, goal: Goal): Promise<Goal>;
}
```

### Rules Engine
```typescript
interface IRulesEngine {
  evaluateEligibility(veteranId: string, rule: Rule): Promise<EligibilityResult>;
  evaluateMultipleRules(veteranId: string, rules: Rule[]): Promise<EligibilityResult[]>;
  generateRecommendations(veteranId: string, domain?: string): Promise<Recommendation[]>;
  evaluateNudges(veteranId: string): Promise<Nudge[]>;
}
```

### Notifications Service
```typescript
interface INotificationService {
  sendInAppNotification(userId: string, notification: Notification): Promise<void>;
  subscribe(event: string, handler: EventHandler): void;
  publish(event: string, payload: any): Promise<void>;
  sendEmailNotification(userId: string, subject: string, body: string): Promise<void>;
  getPreferences(userId: string): Promise<NotificationPreferences>;
}
```

### Analytics Service
```typescript
interface IAnalyticsService {
  logEvent(event: AnalyticsEvent): Promise<void>;
  logPageView(event: PageViewEvent): Promise<void>;
  logUserAction(event: UserActionEvent): Promise<void>;
  getUserMetrics(userId: string): Promise<UserMetrics>;
  getMetrics(filter: MetricsFilter): Promise<AggregatedMetrics>;
  generateDailyReport(): Promise<DailyReport>;
}
```

---

## Domain Service Patterns

Each domain service follows a standard pattern:

```
domains/[domain]/
  ├── index.ts           # Interfaces and types
  ├── service.ts         # Service implementation
  ├── controller.ts      # Route handlers
  ├── utils.ts           # Helper functions
  ├── README.md          # Domain documentation
  └── tests/
      └── service.test.ts
```

### Example: Benefits Service Pattern

**Interfaces** (index.ts):
- `IBenefitsService` - Main service interface
- `BenefitOpportunity` - Data model
- `BenefitMaximizationPlan` - Business object

**Implementation** (service.ts):
- Benefits discovery & search
- Eligibility checking
- Benefit comparison
- Plan creation
- What-if analysis

**Controller** (controller.ts):
- Route handlers
- Request validation
- Response formatting

---

## Integration Points

### MOS Engine Integration
```typescript
interface IMOSEngineIntegration {
  getMOS(mosCode: string): Promise<MOS>;
  searchMOS(query: string): Promise<MOS[]>;
  getCivilianiEquivalents(mosCode: string): Promise<string[]>;
}
```
**Used by**: Employment Service, Profile Service

### Benefits Engine Integration
```typescript
interface BenefitsEngineIntegration {
  queryVABenefits(veteranProfile: any): Promise<string[]>;
  queryStateBenefits(state: string, veteranProfile: any): Promise<string[]>;
  calculateBenefitAmount(benefitType: string, parameters: any): Promise<number>;
}
```
**Used by**: Benefits Service, Rules Engine

---

## Data Model Relationships

```
VeteranProfile
  ├── ServiceHistory[] (military service records)
  ├── Goal[] (veteran's goals)
  ├── DisabilityProfile (disabilities & ratings)
  ├── BenefitsProfile (VA & state benefits)
  ├── EmploymentProfile (jobs & skills)
  ├── EducationProfile (training & GI Bill)
  ├── WellnessProfile (wellness tracking)
  ├── FinancialProfile (finances & budgeting)
  ├── FamilyProfile (family & dependents)
  └── CommunityProfile (mentors & groups)
```

---

## API Communication Pattern

### Request Flow
1. UI sends request to API endpoint
2. Route handler validates request
3. Domain service processes business logic
4. Core services provide support (rules, notifications, analytics)
5. Integration layer queries external systems if needed
6. Response formatted and returned to UI

### Example: Benefits Discovery
```
GET /api/benefits/discover

→ BenefitsController.discoverBenefits()
  → BenefitsService.discoverAvailableBenefits()
    → BenefitsEngineIntegration.queryVABenefits()
    → BenefitsEngineIntegration.queryStateBenefits()
    → RulesEngine.generateRecommendations()
    → AnalyticsService.logUserAction()
  → NotificationService.publish("benefits:discovered")

← [BenefitOpportunity[]]
```

---

## Security & Authorization

### Role-Based Access Control (RBAC)
- **Veteran**: Read own profile, access all services
- **Caregiver**: Read veteran profile with permission
- **Representative**: Manage claims/benefits with authorization
- **Admin**: Full platform access
- **Moderator**: Content moderation

### Permission Model
```
User
  ├── Role (veteran, caregiver, representative, admin, moderator)
  └── Permissions[] (read_own_profile, update_own_profile, etc.)
```

---

## Scalability Considerations

### Horizontal Scaling
- Stateless domain services
- Message-based notifications
- Distributed rules engine evaluation
- External integration caching

### Caching Strategy
- User profile caching (30 minutes)
- Rules & recommendations caching (1 hour)
- External API response caching (varies)

### Database Optimization
- Index on veteranId, createdAt, status fields
- Partition user data by creation date
- Archive old analytics events

---

## Error Handling

### Standard Error Response
```typescript
{
  status: 'error',
  code: 'RULE_EVALUATION_FAILED',
  message: 'User did not meet eligibility criteria',
  details: {
    reason: 'Missing discharge documentation'
  },
  timestamp: '2026-01-27T...'
}
```

---

## Future Enhancements

- [ ] Machine learning for recommendation personalization
- [ ] Real-time data sync across services
- [ ] Advanced analytics dashboard
- [ ] Mobile offline mode
- [ ] Voice assistance integration
- [ ] Payment processing integration
- [ ] Third-party Single Sign-On (SSO)
- [ ] API rate limiting & quotas

---

## References

- [Data Models](../data_model.md)
- [UX Flows](../ux_flows.md)
- [Roadmap](../roadmap.md)
- [Legal Disclaimer](../legal_disclaimer.md)
