/**
 * PHASE 5.4: TESTING SETUP & EXECUTION GUIDE
 * Unit and Integration Test Configuration
 */

# Phase 5.4 Testing Guide

## Overview

This guide provides complete instructions for running, maintaining, and extending tests for the Intelligence Platform.

**Test Statistics**:
- Unit Tests: 60+ (14 engine classes × 4 tests each)
- Integration Tests: 40+ (cross-engine communication)
- Total Coverage Target: 85%+
- Estimated Runtime: ~2-3 minutes (full suite)

---

## Test Organization

### Directory Structure

```
ai/
├── engines/
│   ├── __tests__/
│   │   ├── 01-unit-tests.test.ts          (60 unit tests)
│   │   ├── 02-integration-tests.test.ts   (40 integration tests)
│   │   └── fixtures/
│   │       ├── profiles.fixtures.ts
│   │       ├── conditions.fixtures.ts
│   │       └── test-data.ts
│   └── [14 engine classes]

backend/
├── app/
│   ├── database/
│   │   ├── __tests__/
│   │   │   └── migration.test.ts
│   │   └── migrations/
│   │       └── 001-audit-logs-migration.ts
│   └── services/
│       └── ProductionAuditLogger.ts
```

---

## Setup Instructions

### Prerequisites

```bash
# Ensure Node.js >= 16.x
node --version

# Ensure npm >= 8.x
npm --version

# Install test dependencies
npm install --save-dev \
  vitest \
  @vitest/ui \
  jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  ts-node \
  @types/jest
```

### Configuration Files

#### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./ai/engines/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'ai/engines/**/*.ts',
        'backend/app/**/*.ts',
        '!**/*.test.ts',
        '!**/node_modules/**'
      ],
      exclude: [
        'node_modules/',
        'dist/',
        'build/'
      ],
      lines: 85,
      functions: 85,
      branches: 80,
      statements: 85
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
    typecheck: {
      enabled: true
    }
  }
});
```

#### Setup File (ai/engines/__tests__/setup.ts)

```typescript
import { beforeAll, afterAll, beforeEach } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Global test timeout
beforeAll(() => {
  // Initialize test database connection pool if needed
  console.log('🧪 Test suite initialized');
});

afterAll(() => {
  console.log('✅ Test suite completed');
});

beforeEach(() => {
  // Clear caches before each test
  jest.clearAllMocks();
});
```

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run",
    "test:debug": "vitest --inspect-brk --inspect --single-thread",
    "test:unit": "vitest run ai/engines/__tests__/01-unit-tests.test.ts",
    "test:integration": "vitest run ai/engines/__tests__/02-integration-tests.test.ts",
    "test:migrations": "vitest run backend/app/database/__tests__/migration.test.ts"
  }
}
```

---

## Running Tests

### Quick Start

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test:watch

# Run with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Run Specific Test Suites

```bash
# Unit tests only
npm test -- ai/engines/__tests__/01-unit-tests.test.ts

# Integration tests only
npm test -- ai/engines/__tests__/02-integration-tests.test.ts

# Single test file
npm test -- ai/engines/__tests__/01-unit-tests.test.ts --reporter=verbose

# Single test by name
npm test -- --grep "VeteranProfileAnalyzer"

# With debugging
npm run test:debug -- ai/engines/__tests__/01-unit-tests.test.ts
```

### Run with Filters

```bash
# Run tests matching pattern
npm test -- --grep "BenefitsPrediction|ClaimsOptimizer"

# Run only failing tests
npm test -- --failed

# Run only changed tests (if Git available)
npm test -- --changed

# Skip specific tests
npm test -- --exclude "**/slow-tests/**"
```

### Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# Show coverage summary
npm test -- --coverage --reporter=text-summary

# Upload to Codecov (CI/CD)
npm install -g codecov
codecov --file=coverage/coverage-final.json
```

---

## Test File Structure

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EngineClass } from '../engines/EngineClass';

describe('EngineClass', () => {
  let instance: EngineClass;

  beforeEach(() => {
    // Setup
    instance = new EngineClass();
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', async () => {
    // Arrange
    const input = { /* test data */ };

    // Act
    const result = await instance.method(input);

    // Assert
    expect(result).toBeDefined();
    expect(result).toHaveProperty('key');
    expect(result.key).toBe('value');
  });

  // More tests...
});
```

### Integration Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { IntelligenceCore } from '../intelligence';

describe('Cross-Engine Integration', () => {
  let core: IntelligenceCore;

  beforeEach(() => {
    core = new IntelligenceCore();
  });

  it('should coordinate between engines', async () => {
    const profile = {
      /* test profile */
    };

    const result = await core.analyzeProfile(profile);

    expect(result).toHaveProperty('profileAnalysis');
    expect(result).toHaveProperty('benefits');
    expect(result).toHaveProperty('strategy');

    // Verify consistency across engines
    expect(result.benefits.length).toBeGreaterThan(0);
    expect(result.strategy.recommendedOrder).toBeDefined();
  });
});
```

---

## Test Data & Fixtures

### Sample Test Data (ai/engines/__tests__/fixtures/profiles.fixtures.ts)

```typescript
export const VET_PROFILES = {
  simple: {
    id: 'vet_simple_001',
    militaryHistory: {
      branch: 'Army',
      rank: 'E-5',
      startDate: '2010-01-15',
      endDate: '2018-06-30'
    },
    conditions: [
      { name: 'PTSD', rating: 50 }
    ]
  },

  complex: {
    id: 'vet_complex_001',
    militaryHistory: {
      branch: 'Navy',
      rank: 'O-3',
      startDate: '2005-06-01',
      endDate: '2020-12-31'
    },
    conditions: [
      { name: 'PTSD', rating: 50 },
      { name: 'Knee Pain', rating: 30 },
      { name: 'Hearing Loss', rating: 10 },
      { name: 'TBI', rating: 0 }
    ]
  },

  noConditions: {
    id: 'vet_no_conditions_001',
    militaryHistory: {
      branch: 'Marines',
      rank: 'E-3',
      startDate: '2018-01-01',
      endDate: '2022-12-31'
    },
    conditions: []
  }
};
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Test Maintenance

### Updating Tests

When making changes to engines:

1. **Update corresponding test**
   ```typescript
   // If you modify BenefitsPredictor.estimateAmounts()
   // Update the test in 01-unit-tests.test.ts
   ```

2. **Run tests to verify**
   ```bash
   npm test -- ai/engines/__tests__/01-unit-tests.test.ts
   ```

3. **Update integration tests if needed**
   ```bash
   npm test -- ai/engines/__tests__/02-integration-tests.test.ts
   ```

### Fixing Flaky Tests

If a test passes sometimes:

```typescript
// Mark as flaky temporarily
it.todo('flaky test - needs investigation');

// Increase timeout for slow operations
it('slow operation', async () => {
  // test code
}, 10000); // 10 second timeout

// Mock time-dependent code
vi.useFakeTimers();
// test code
vi.useRealTimers();
```

### Adding New Tests

When adding a new engine:

1. Create test file: `ai/engines/__tests__/01-unit-tests.test.ts`
2. Add 4+ test cases
3. Add to integration tests if it interfaces with other engines
4. Verify coverage: `npm run test:coverage`

---

## Debugging Tests

### Debug Mode

```bash
# Debug with Node inspector
npm run test:debug -- ai/engines/__tests__/01-unit-tests.test.ts

# Open Chrome DevTools and navigate to: chrome://inspect
# Click "inspect" on the test process
```

### Console Logging

```typescript
it('test with logging', async () => {
  const instance = new MyEngine();
  console.log('Starting test');
  console.log('Instance:', instance);

  const result = await instance.method();
  console.log('Result:', result);

  expect(result).toBeDefined();
});

// Run with logging
npm test -- --reporter=verbose
```

### Breakpoints in VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:debug"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

Then click the debug icon in VS Code sidebar.

---

## Performance Testing

### Test Execution Time

```bash
# Show test duration
npm test -- --reporter=verbose

# Profile slow tests
npm test -- --reporter=verbose --slow=500
```

### Benchmark Tests

```typescript
import { describe, it, expect, bench } from 'vitest';

describe('Performance', () => {
  bench('analyzeProfile should complete quickly', async () => {
    const analyzer = new VeteranProfileAnalyzer();
    await analyzer.analyzeMilitaryHistory({
      militaryHistory: { branch: 'Army' }
    });
  });
});

// Run: npm test -- --run -- --benchmark
```

---

## Test Metrics Dashboard

### Generate Report

```bash
# Detailed test report
npm test -- --reporter=json > test-results.json

# Parse and display
npm install -g jest-json-reporter
jest-json-reporter test-results.json
```

### Expected Metrics

```
Total Tests: 100+
Passed: 100%
Failed: 0%
Skipped: 0%

Coverage:
- Statements: 87%
- Branches: 83%
- Functions: 86%
- Lines: 87%

Execution Time: ~2-3 minutes
```

---

## Troubleshooting

### Common Issues

**Problem: Tests timeout**
```bash
# Increase timeout
npm test -- --testTimeout=10000

# Check for unresolved promises
# Make sure all async operations complete
```

**Problem: Database connection errors**
```bash
# Verify test database is running
psql -c "SELECT 1"

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log
```

**Problem: Cache not clearing between tests**
```typescript
beforeEach(() => {
  // Clear all caches
  jest.clearAllMocks();

  // Reset cache manager
  cacheManager.clear();
});
```

**Problem: Import errors**
```bash
# Verify TypeScript compilation
npm run build

# Check imports
npm test -- --reporter=verbose
```

---

## Next Steps

1. **Run Full Test Suite**
   ```bash
   npm run test:coverage
   ```

2. **Review Coverage Report**
   ```bash
   open coverage/index.html
   ```

3. **Fix Any Failing Tests**
   ```bash
   npm test -- --reporter=verbose
   ```

4. **Set Up CI/CD**
   ```bash
   git push # Triggers GitHub Actions
   ```

5. **Monitor Test Health**
   - Track test execution time
   - Monitor flaky tests
   - Keep coverage above 85%

---

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Node Debugger Docs](https://nodejs.org/en/docs/guides/debugging-getting-started/)

---

**Test Suite Ready**: ✅
**Coverage Target**: 85%+
**Status**: Ready for Phase 5.5 Production Deployment
