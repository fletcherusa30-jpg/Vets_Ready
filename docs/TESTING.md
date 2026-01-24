# Testing Setup & Guide

**Version:** 2.0 | **Last Updated:** January 23, 2026

---

## Testing Strategy

### Testing Pyramid
```
        ▲
       /|\
      / | \
     /  |  \  E2E Tests (10%)
    /───┼───\
   /    |    \
  /     |     \ Integration Tests (30%)
 /──────┼──────\
/       |       \
──────────────────  Unit Tests (60%)
```

---

## Frontend Testing

### Setup
```bash
cd frontend
npm install
```

### Technologies
- **Unit/Component:** Jest + React Testing Library
- **E2E:** Cypress or Playwright
- **Visual Regression:** Percy or Chromatic

### Unit Tests
```bash
npm test
# Watch mode
npm test -- --watch
# Coverage
npm test -- --coverage
```

**Example Test:**
```typescript
// src/components/ClaimsAnalyzer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ClaimsAnalyzer from './ClaimsAnalyzer';

describe('ClaimsAnalyzer', () => {
  it('renders form inputs', () => {
    render(<ClaimsAnalyzer />);
    expect(screen.getByLabelText(/conditions/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<ClaimsAnalyzer onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/conditions/i), {
      target: { value: 'PTSD' }
    });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    expect(onSubmit).toHaveBeenCalled();
  });
});
```

### Integration Tests
```bash
npm run test:integration
```

**Example:**
```typescript
describe('Claims Analysis Flow', () => {
  it('fetches recommendations from API', async () => {
    render(<ClaimsAnalyzer />);

    // User fills form
    fireEvent.change(screen.getByLabelText(/conditions/i), {
      target: { value: 'PTSD, TBI' }
    });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    // Wait for API response
    await waitFor(() => {
      expect(screen.getByText(/recommendations/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Cypress)
```bash
npm run test:e2e
```

**Example:**
```javascript
describe('End-to-End: Claims Analysis', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('veteran@example.com', 'password');
  });

  it('analyzes claims and displays recommendations', () => {
    cy.get('[data-cy=condition-input]').type('PTSD');
    cy.get('[data-cy=analyze-btn]').click();
    cy.get('[data-cy=recommendations]').should('be.visible');
    cy.get('[data-cy=smc-amount]').should('contain', '$');
  });
});
```

### Coverage Targets
- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

---

## Mobile Testing

### Unit Tests (Jest)
```bash
cd mobile
npm test
```

### E2E Tests (Detox)
```bash
# Build for testing
detox build-framework-cache
detox build-app --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug --cleanup
```

**Example:**
```javascript
describe('Mobile Claims Analysis', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should navigate to claims analyzer', async () => {
    await element(by.id('home-tab')).multiTap();
    await element(by.text('Analyze Claims')).tap();
    await expect(element(by.id('condition-input'))).toBeVisible();
  });

  it('should submit form and show results', async () => {
    await element(by.id('condition-input')).typeText('PTSD');
    await element(by.id('analyze-btn')).multiTap();
    await expect(element(by.id('results'))).toBeVisible();
  });
});
```

### Device Testing
- **Android:** Android emulator, real devices (Firebase Test Lab)
- **iOS:** iPhone simulator, TestFlight for real devices
- **Cross-version:** Test on min version (Android 8+, iOS 14+)

---

## Backend Testing

### Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Unit Tests (pytest)
```bash
pytest
# Verbose output
pytest -v
# Specific test file
pytest tests/test_conditions.py
# Coverage
pytest --cov=app --cov-report=html
```

**Example Test:**
```python
# tests/test_conditions.py
import pytest
from app.services.conditions import ConditionsService
from app.schemas.conditions import ConditionCreate

@pytest.fixture
def conditions_service(db):
    return ConditionsService(db)

def test_create_condition(conditions_service):
    data = ConditionCreate(
        name="PTSD",
        code="F4310",
        disability_percent=30
    )
    condition = conditions_service.create(data)
    assert condition.name == "PTSD"
    assert condition.disability_percent == 30

def test_list_conditions(conditions_service, sample_conditions):
    conditions = conditions_service.list()
    assert len(conditions) == len(sample_conditions)

@pytest.mark.asyncio
async def test_analyze_claims(conditions_service):
    result = await conditions_service.analyze({
        'conditions': ['PTSD', 'TBI'],
        'evidence': {...}
    })
    assert 'recommendations' in result
    assert 'smc' in result
```

### Integration Tests
```bash
pytest tests/integration/
```

**Example:**
```python
def test_claims_api_endpoint(client, auth_token):
    response = client.post(
        '/api/claims/analyze',
        headers={'Authorization': f'Bearer {auth_token}'},
        json={
            'conditions': ['PTSD'],
            'medical_evidence': {...}
        }
    )
    assert response.status_code == 200
    assert 'recommendations' in response.json()
```

### Load Testing (Locust)
```bash
pip install locust
locust -f tests/load/locustfile.py
```

**Example:**
```python
from locust import HttpUser, task, between

class ClaimsUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        self.client.post('/api/auth/login', json={
            'email': 'user@example.com',
            'password': 'password'
        })

    @task(3)
    def analyze_claims(self):
        self.client.post('/api/claims/analyze', json={
            'conditions': ['PTSD', 'TBI'],
            'evidence': {...}
        })

    @task(1)
    def list_conditions(self):
        self.client.get('/api/conditions')
```

**Run Load Test:**
```bash
locust -f tests/load/locustfile.py --host=http://localhost:8000
# Open http://localhost:8089 in browser
# Set users to 100, spawn rate 10
```

### Coverage Targets
- **Statements:** > 85%
- **Branches:** > 80%
- **Functions:** > 85%
- **Lines:** > 85%

---

## Android Testing

### Unit Tests
```bash
cd android
./gradlew test
```

### Instrumented Tests (UI)
```bash
./gradlew connectedAndroidTest
```

### Firebase Test Lab
```bash
gcloud firebase test android run \
  --app=app/build/outputs/apk/debug/app-debug.apk \
  --test=app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
```

---

## Desktop Testing

### Unit Tests
```bash
cd desktop
npm test
```

### E2E Tests (Spectron)
```bash
npm run test:e2e
```

---

## CI/CD Testing

### Automated Testing Pipeline
See `.github/workflows/ci-cd.yml`

**On Every Push:**
1. ✅ Frontend: Lint + Unit + Integration
2. ✅ Backend: Lint + Unit + Integration
3. ✅ Mobile: Lint + Unit
4. ✅ Desktop: Lint + Build
5. 🔒 Security: SAST, dependency scan, secrets detection
6. 📊 Coverage: Report to Codecov

**On Release:**
1. ✅ All tests (as above)
2. ✅ Load testing
3. ✅ Security scanning (Trivy)
4. ✅ Deploy to staging
5. ✅ Smoke tests on staging
6. ✅ Manual approval
7. ✅ Deploy to production

---

## Test Data & Mocking

### Mock Data
```json
{
  "conditions": [
    {
      "id": 1,
      "name": "PTSD",
      "code": "F4310",
      "disability_percent": 30
    },
    {
      "id": 2,
      "name": "TBI",
      "code": "G89.29",
      "disability_percent": 20
    }
  ]
}
```

### Mock API (json-server)
```bash
npm install -g json-server
json-server --watch db.json --port 3001
```

### Fixtures (pytest)
```python
@pytest.fixture
def sample_conditions(db):
    return [
        Condition(name="PTSD", code="F4310", disability_percent=30),
        Condition(name="TBI", code="G89.29", disability_percent=20)
    ]
```

---

## Test Reporting

### Coverage Reports
- **Frontend:** `frontend/coverage/` (open in browser)
- **Backend:** `backend/htmlcov/index.html`

### CI/CD Reports
- **Codecov:** codecov.io/github/yourorg/phoneapp
- **GitHub Actions:** Workflow logs visible in PR
- **Snyk:** Dependency vulnerabilities at snyk.io

---

## Troubleshooting Tests

### Frontend Tests Failing
```bash
# Clear cache
npm test -- --clearCache
# Run single file
npm test -- ClaimsAnalyzer.test.tsx
# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Backend Tests Failing
```bash
# Run with verbose output
pytest -vv
# Show print statements
pytest -s
# Drop to debugger on failure
pytest --pdb
```

### E2E Tests Timing Out
```bash
# Increase timeout
cypress run --config defaultCommandTimeout=10000
# Run with video recording
cypress run --record
```

---

## Test Maintenance

- **Monthly:** Review & update test data
- **Quarterly:** Refactor flaky tests, improve coverage gaps
- **Annually:** Major framework/library upgrade testing

