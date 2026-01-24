# Vets Ready - Complete Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: v18+ (LTS recommended)
- **PostgreSQL**: v14+
- **npm**: v9+ or yarn v3+
- **Git**: Latest version

### Environment
- Linux, macOS, or Windows (with WSL2 recommended)
- 2GB RAM minimum
- 500MB disk space

## Project Structure

```
PhoneApp/
├── src/
│   ├── budget/
│   │   ├── types/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── store/
│   ├── retirement/
│   │   ├── types/
│   │   ├── services/
│   │   ├── charts/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── store/
│   ├── transition/
│   │   ├── types/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── store/
│   ├── jobboard/
│   │   ├── types/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── store/
│   ├── outreach/
│   │   ├── types/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── store/
│   ├── shared/
│   │   ├── constants/
│   │   └── utils/
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── models/
│   ├── db/
│   ├── middleware/
│   ├── server.ts
│   └── package.json
├── data/
│   └── schema.sql
├── tests/
├── docs/
├── config/
├── scripts/
└── package.json
```

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/vets-ready.git
cd PhoneApp
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

Key packages:
- React 18+
- TypeScript
- Zustand (state management)
- Zod (validation)
- Recharts (charts)
- React Query (data fetching)
- Vite (build tool)

#### Backend Dependencies
```bash
cd backend
npm install
```

Key packages:
- Fastify (server framework)
- Zod (validation)
- pg (PostgreSQL client)
- @fastify/cors
- @fastify/helmet

### 3. Verify Installation
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
psql --version  # Should be v14+
```

## Configuration

### 1. Environment Variables

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENVIRONMENT=development
```

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgres://user:password@localhost:5432/vetsready_dev
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=vetsready_dev

# Server
PORT=4000
HOST=0.0.0.0
NODE_ENV=development

# API Keys (for future integrations)
FACEBOOK_APP_ID=your_app_id
LINKEDIN_API_KEY=your_api_key
TWITTER_API_KEY=your_api_key
```

### 2. Create Environment Files

**Frontend:**
```bash
cp .env.example .env.local
```

**Backend:**
```bash
cd backend
cp .env.example .env
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql console:
CREATE DATABASE vetsready_dev;
CREATE USER vetsready_user WITH PASSWORD 'secure_password';
ALTER ROLE vetsready_user SET client_encoding TO 'utf8';
ALTER ROLE vetsready_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE vetsready_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE vetsready_dev TO vetsready_user;
\q
```

### 2. Run Schema Migration

```bash
# From backend directory
psql -U veterans1st_user -d veterans1st_dev -f ../data/schema.sql
```

### 3. Verify Database

```bash
psql -U veterans1st_user -d veterans1st_dev

# In psql console:
\dt  # List tables
SELECT COUNT(*) FROM public_pages;  # Should return 0
\q
```

### 4. Load Sample Data (Optional)

```bash
# From backend directory
npm run seed  # Seeds database with sample data
```

## Running the Application

### 1. Development Mode

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
# With hot reload enabled
```

#### Terminal 2 - Frontend Development
```bash
npm run dev
# Runs on http://localhost:5173
# Vite dev server with hot module replacement
```

#### Terminal 3 - Database (Optional)
```bash
# Monitor database connections
psql -U veterans1st_user -d veterans1st_dev
# SELECT * FROM pg_stat_activity;
```

### 2. Production Build

```bash
# Frontend build
npm run build
# Output: dist/

# Backend build (if using TypeScript compilation)
cd backend
npm run build
```

### 3. Production Start

```bash
# Set environment
export NODE_ENV=production
export DATABASE_URL=postgres://user:pass@prod-db:5432/vetsready

# Start backend
cd backend
npm start

# Serve frontend (use static server)
npx serve dist
```

## API Documentation

### Base URL
`http://localhost:4000/api`

### Budget Module
```
POST   /api/budget/calculate     - Calculate budget
GET    /api/budget/scenarios/:id - Get budget scenario
POST   /api/budget/scenarios     - Create scenario
PUT    /api/budget/scenarios/:id - Update scenario
```

### Retirement Module
```
POST   /api/retirement/calculate - Calculate retirement plan
GET    /api/retirement/scenarios/:id - Get retirement scenario
POST   /api/retirement/scenarios - Create scenario
GET    /api/retirement/withdrawal - Calculate withdrawal strategy
POST   /api/retirement/scenario-analysis - Run scenario analysis
```

### Job Board
```
GET    /api/jobboard/postings          - List job postings
GET    /api/jobboard/postings/:id      - Get job details
POST   /api/jobboard/apply             - Submit application
GET    /api/jobboard/match             - Find matching jobs
GET    /api/jobboard/profile           - Get veteran profile
```

### Transition Services
```
GET    /api/transition/mos/:code       - Translate MOS
GET    /api/transition/va-benefits     - Get VA benefits info
GET    /api/transition/timeline        - Get separation timeline
POST   /api/transition/resume-build    - Build resume
GET    /api/transition/checklist/:id   - Get checklist
```

### Outreach & Community
```
GET    /api/outreach/pages                    - Search pages
GET    /api/outreach/pages/category/:cat      - Pages by category
GET    /api/outreach/pages/trending           - Trending pages
POST   /api/outreach/submissions              - Submit page
GET    /api/outreach/businesses               - Search businesses
GET    /api/outreach/nonprofits               - Search nonprofits
POST   /api/outreach/scan-keywords            - Scan text
GET    /api/outreach/stats                    - Get statistics
```

### Full API Spec
See [API Documentation](./API.md) for detailed endpoint specs with request/response examples.

## Troubleshooting

### Common Issues

#### 1. PostgreSQL Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Verify connection
psql -U postgres
```

#### 2. Port Already in Use
```
Error: listen EADDRINUSE :::4000
```

**Solution:**
```bash
# Find process using port
lsof -i :4000
# Kill process
kill -9 <PID>

# Or use different port
PORT=4001 npm run dev
```

#### 3. Database Migration Failed
```
Error: relation "users" does not exist
```

**Solution:**
```bash
# Recreate database
dropdb veterans1st_dev
createdb veterans1st_dev

# Re-run migration
psql -U veterans1st_user -d veterans1st_dev -f ../data/schema.sql
```

#### 4. Frontend Can't Connect to Backend
```
Error: Failed to fetch (CORS error)
```

**Solution:**
1. Verify backend is running on `http://localhost:4000`
2. Check CORS settings in `backend/server.ts`
3. Verify `REACT_APP_API_URL` in `.env.local`

#### 5. Out of Memory During Build
```
Error: JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node heap size
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Debug Mode

#### Frontend Debug
```bash
# In .env.local
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug

# Browser DevTools
# - Open F12
# - Check Console for detailed logs
# - Use React DevTools extension
```

#### Backend Debug
```bash
# Enable Fastify logging
export LOG_LEVEL=debug

# Start with Node debugger
node --inspect backend/server.ts

# Connect Chrome DevTools to chrome://inspect
```

#### Database Debug
```bash
# Enable PostgreSQL query logging
# In postgresql.conf: log_statement = 'all'

# View logs
tail -f /var/log/postgresql/postgresql.log
```

### Performance Issues

#### Slow Frontend
1. Check React DevTools for unnecessary re-renders
2. Verify React Query cache settings
3. Use Network tab in DevTools to identify slow API calls

#### Slow API
```bash
# Check slow queries
EXPLAIN ANALYZE SELECT * FROM public_pages WHERE category = 'veteran-resource';

# Verify indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'public_pages';
```

#### High Memory Usage
```bash
# Check Node process
ps aux | grep node

# Profile with clinic.js
npm install -g clinic
clinic doctor -- node backend/server.ts
```

## Next Steps

1. **Read Module Documentation**
   - [Budget Module](./docs/BUDGET.md)
   - [Retirement Module](./docs/RETIREMENT.md)
   - [Transition Toolkit](./docs/TRANSITION.md)
   - [Job Board](./docs/JOBBOARD.md)
   - [Outreach System](./docs/OUTREACH_SYSTEM.md)

2. **Configure for Your Environment**
   - Update database credentials
   - Set up OAuth providers (for social login)
   - Configure email service (for notifications)

3. **Deploy to Production**
   - See [Deployment Guide](./docs/DEPLOYMENT.md)
   - Configure CI/CD pipeline
   - Set up monitoring and alerts

4. **Customize Sample Data**
   - Update outreach directories
   - Adjust financial constants
   - Configure job categories

## Support & Contributing

- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/Veterans1st/issues)
- **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Code of Conduct**: See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## License

Veterans1st is licensed under the [MIT License](./LICENSE)

## Acknowledgments

Built with ❤️ for our veterans.

---

**Last Updated**: January 2024
**Version**: 1.0.0
