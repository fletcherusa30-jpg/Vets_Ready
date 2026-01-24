# Development Standards & Best Practices

**Version:** 2.0 | **Last Updated:** January 23, 2026

---

## Code Quality Standards

### TypeScript/Frontend Standards

#### Code Style
```typescript
// ✅ Good: Clear, typed, following naming conventions
interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
}

const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// ❌ Bad: Implicit any, unclear naming
const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
```

#### Component Patterns
```typescript
// ✅ Good: Functional component with types
interface ClaimsListProps {
  claims: Claim[];
  onSelectClaim?: (claimId: string) => void;
  isLoading?: boolean;
}

export const ClaimsList: React.FC<ClaimsListProps> = ({
  claims,
  onSelectClaim,
  isLoading = false,
}) => {
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="claims-list">
      {claims.map((claim) => (
        <ClaimCard
          key={claim.id}
          claim={claim}
          onClick={() => onSelectClaim?.(claim.id)}
        />
      ))}
    </div>
  );
};
```

#### Naming Conventions
```
Components:        PascalCase         (UserProfile, ClaimsAnalyzer)
Functions:         camelCase          (getUserById, analyzeConditions)
Constants:         UPPER_SNAKE_CASE   (MAX_ATTEMPTS, API_TIMEOUT)
Interfaces:        PascalCase + I     (IUser, IClaimRequest) [optional]
Files:             kebab-case         (user-profile.tsx, claims-analyzer.ts)
Folders:           kebab-case         (src/components/claims-form/)
```

#### Testing
```typescript
// ✅ Good: Clear test descriptions, arrange-act-assert
describe('UserProfile Component', () => {
  it('should display user name when data loads', async () => {
    // Arrange
    const mockUser = { id: '1', fullName: 'John Doe' };
    vi.mocked(api.getUser).mockResolvedValue(mockUser);

    // Act
    render(<UserProfile userId="1" />);
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

    // Assert
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

---

### Python/Backend Standards

#### Code Style
```python
# ✅ Good: Type hints, clear docstrings, proper imports
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserCreate, UserResponse

def create_user(db: Session, user: UserCreate) -> User:
    """
    Create a new user in the database.

    Args:
        db: Database session
        user: User creation data

    Returns:
        Created user instance

    Raises:
        ValueError: If email already exists
    """
    if db.query(User).filter(User.email == user.email).first():
        raise ValueError("Email already registered")

    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ❌ Bad: No type hints, unclear logic
def create_user(db, user):
    new_user = User(**user)
    db.add(new_user)
    db.commit()
    return new_user
```

#### Naming Conventions
```
Classes:           PascalCase         (UserService, ClaimsAnalyzer)
Functions:         snake_case         (get_user_by_id, analyze_conditions)
Constants:         UPPER_SNAKE_CASE   (MAX_RETRIES, DEFAULT_TIMEOUT)
Private methods:   _snake_case        (_validate_input, _hash_password)
Files:             snake_case.py      (user_service.py, claims_analyzer.py)
Folders:           snake_case         (app/services/, app/routers/)
```

#### Testing
```python
# ✅ Good: Clear test names, fixtures, assertions
import pytest
from app.services import UserService

@pytest.mark.unit
def test_create_user_successfully(db):
    """Test creating a user with valid data."""
    service = UserService(db)
    user_data = {'email': 'test@example.com', 'name': 'John'}

    result = service.create(user_data)

    assert result.email == 'test@example.com'
    assert result.id is not None

@pytest.mark.unit
def test_create_user_duplicate_email(db, sample_user):
    """Test that duplicate emails are rejected."""
    service = UserService(db)

    with pytest.raises(ValueError, match="Email already exists"):
        service.create({'email': sample_user.email, 'name': 'Other'})
```

#### Documentation
```python
# ✅ Good: Module-level docstring, clear function docs
"""
User service module.

This module handles all user-related business logic including:
- User creation and authentication
- Profile management
- Permission checking
"""

class UserService:
    """Service for managing user operations."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db

    def create(self, user_data: dict) -> User:
        """Create new user and return created instance."""
        ...
```

---

## Git Workflow

### Branch Naming
```
feature/user-authentication        # New feature
feature/claims-analyzer            # Feature name: descriptive lowercase
bugfix/login-redirect-issue        # Bug fix
docs/api-documentation            # Documentation
chore/update-dependencies          # Maintenance
```

### Commit Messages
```
feat: add JWT authentication for API endpoints
fix: resolve database connection timeout
docs: update deployment guide with staging steps
style: reformat conditions.service.ts to match linting rules
test: add coverage for claims analysis endpoint
chore: update fastapi dependency to 0.104.1
refactor: consolidate user service methods
perf: optimize condition lookup with database index
```

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, test, chore, refactor, perf
**Scope:** (optional) area affected: auth, conditions, claims, etc.
**Subject:** 50 chars max, imperative mood, no period

### Pull Request Process

1. **Create branch** from `develop`
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes** with frequent commits
   ```bash
   git commit -m "feat: implement user registration"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

4. **PR Checklist:**
   - [ ] Tests passing locally
   - [ ] Code formatted (prettier/black)
   - [ ] No linter warnings
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No secrets or credentials

5. **Code review** - at least 1 approval required

6. **Merge to develop** after approval

7. **Release process** - merge `develop` to `main` with version tag

---

## Performance Standards

### Frontend
- **Bundle Size:** < 500KB gzipped
- **First Contentful Paint:** < 2.5s
- **Largest Contentful Paint:** < 4s
- **Cumulative Layout Shift:** < 0.1

### Backend
- **API Response Time:** p95 < 500ms
- **Database Query:** < 100ms per query
- **Concurrent Users:** Support 1000+ simultaneous
- **CPU Usage:** < 80% sustained
- **Memory:** < 1GB per instance

### Mobile
- **App Size:** < 100MB (iOS), < 50MB (Android)
- **Startup Time:** < 3 seconds
- **Frame Rate:** 60 FPS on regular hardware

---

## Security Standards

### OWASP Top 10 Compliance
- [ ] SQL Injection prevention (parameterized queries)
- [ ] Authentication & session management (JWT + refresh tokens)
- [ ] Cross-Site Scripting (XSS) prevention
- [ ] Cross-Site Request Forgery (CSRF) protection
- [ ] Sensitive data exposure (HTTPS, encryption at rest)
- [ ] Access control enforcement (role-based)
- [ ] Security misconfiguration (hardened defaults)
- [ ] Insecure deserialization (input validation)
- [ ] Using components with vulnerabilities (dependency updates)
- [ ] Insufficient logging & monitoring

### Implementation

#### Backend
```python
# ✅ Password hashing
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ✅ JWT tokens with expiration
from datetime import datetime, timedelta
from jose import jwt

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ SQL injection prevention
user = db.query(User).filter(User.email == user_email).first()
# NOT: query(f"SELECT * FROM users WHERE email = '{user_email}'")
```

#### Frontend
```typescript
// ✅ Prevent XSS with React
import DOMPurify from 'dompurify';

const ClaimDetails = ({ claim }) => {
  // React automatically escapes by default
  return <div>{claim.description}</div>;

  // If necessary to render HTML
  return <div dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(claim.htmlContent)
  }} />;
};

// ✅ Secure storage (not localStorage for sensitive data)
// Avoid: localStorage.setItem('token', token)
// Use: httpOnly cookies via backend
```

### Secrets Management
```
# ✅ Use environment variables
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=your-very-secret-key-min-32-chars

# ✅ .env files (never commit)
# .env (in .gitignore)
# .env.example (committed with template values)
```

---

## Documentation Standards

### README Structure
```markdown
# Project Name

Brief description

## Features
- Feature 1
- Feature 2

## Quick Start
Step-by-step instructions

## Technology Stack
List technologies used

## Project Structure
Directory overview

## Development
How to set up locally

## Testing
How to run tests

## Deployment
How to deploy

## Contributing
Guidelines for contributions

## License
License information
```

### API Documentation
```python
# FastAPI auto-generates from docstrings
@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """
    Get user by ID.

    - **user_id**: The unique identifier of the user

    Returns the user object with all fields.
    """
    return await db.get_user(user_id)

# Accessible at /docs (Swagger UI) and /redoc (ReDoc)
```

### Inline Comments
```python
# ✅ Good: Explains WHY, not WHAT
# Retry logic with exponential backoff to handle temporary API failures
for attempt in range(max_retries):
    try:
        return api.call()
    except Exception:
        if attempt < max_retries - 1:
            wait_time = base_delay * (2 ** attempt)
            await asyncio.sleep(wait_time)
        else:
            raise

# ❌ Bad: States obvious
# Set x to 10
x = 10
# Increment i
i += 1
```

---

## Deployment Standards

### Environment-Specific Configuration
```python
# config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    environment: str = "development"
    database_url: str
    jwt_secret: str
    debug: bool = False

    class Config:
        env_file = ".env"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

settings = Settings()
```

### Health Checks
```python
# Every service needs a health endpoint
@router.get("/health")
async def health_check():
    """Service health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "2.0.0"
    }
```

---

## Continuous Integration

### Automated Checks
- ✅ Linting (ESLint, Flake8)
- ✅ Type checking (TypeScript, mypy)
- ✅ Unit tests (Jest, pytest)
- ✅ Integration tests
- ✅ Security scanning (Snyk, Trivy)
- ✅ Code coverage (> 80%)
- ✅ Build verification

### Pre-commit Hooks (optional setup)
```bash
npm install --save-dev husky
npx husky install

# .husky/pre-commit
#!/bin/sh
npm run lint
npm run test
```

---

## Team Standards

### Code Review Checklist
- [ ] Code follows style guide
- [ ] Tests are comprehensive
- [ ] No hardcoded secrets
- [ ] Documentation updated
- [ ] Performance acceptable
- [ ] Security best practices followed
- [ ] Error handling complete
- [ ] Logging sufficient for debugging

### Documentation Responsibilities
- Every public API must be documented
- Every non-obvious algorithm must be explained
- Breaking changes must be noted
- Examples should be provided for complex features

---

## Version Control

### Semantic Versioning
```
MAJOR.MINOR.PATCH
  ↓      ↓      ↓
  2.0.1  (2.0.0 + security fix)
  2.1.0  (2.0.0 + new feature, backward compatible)
  3.0.0  (breaking changes)
```

### Changelog Entry
```markdown
## [2.0.1] - 2026-01-23

### Added
- New condition recommendation algorithm

### Changed
- Updated FastAPI to 0.104.1

### Fixed
- Fixed login redirect bug
- Corrected disability rating calculations

### Security
- Updated dependencies for security patches
```

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance
- [ ] Sufficient color contrast (4.5:1)
- [ ] Keyboard navigation support
- [ ] ARIA labels for interactive elements
- [ ] Alt text for images
- [ ] Semantic HTML structure

### Implementation
```typescript
// ✅ Good: Accessible form
<form onSubmit={handleSubmit}>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    required
  />
  <button type="submit">Submit</button>
</form>

// ❌ Bad: Not accessible
<div onClick={handleSubmit}>
  <input placeholder="Email" />
</div>
```

---

## References & Tools

- **Linting:** ESLint, Flake8
- **Formatting:** Prettier, Black
- **Testing:** Jest, pytest, Cypress
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, DataDog
- **Documentation:** Markdown, Swagger/OpenAPI
- **Security:** OWASP, Snyk, Trivy

