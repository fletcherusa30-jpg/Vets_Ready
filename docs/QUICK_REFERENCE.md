# Vets Ready - Developer Quick Reference

## 🚀 Quick Start (30 seconds)

```bash
# 1. Clone & install
git clone <repo> && cd "Vets Ready"
npm install && cd backend && npm install && cd ..

# 2. Setup database
createdb veterans1st_dev
psql -U postgres -d veterans1st_dev -f data/schema.sql

# 3. Configure
echo "REACT_APP_API_URL=http://localhost:4000" > .env.local
echo "DATABASE_URL=postgres://postgres@localhost/veterans1st_dev" > backend/.env

# 4. Run
npm run dev              # Terminal 1
cd backend && npm run dev # Terminal 2

# Visit http://localhost:5173
```

---

## 📋 Module Quick Reference

| Module | Route | Store | Key File |
|--------|-------|-------|----------|
| **Budget** | `/budget` | `useBudgetStore()` | `budgetService.ts` |
| **Retirement** | `/retirement` | `useRetirementStore()` | `retirementEngine.ts` |
| **Transition** | `/transition` | `useTransitionStore()` | `mosTranslator.ts` |
| **Job Board** | `/jobs` | `useJobboardStore()` | `jobMatcher.ts` |
| **Outreach** | `/outreach` | `useOutreachStore()` | `keywordEngine.ts` |

---

## 🔌 API Quick Reference

```
# Budget
POST   /api/budget/calculate                    # Calculate budget

# Retirement
POST   /api/retirement/calculate               # Calculate retirement plan
POST   /api/retirement/scenario-analysis       # Compare scenarios

# Transition
GET    /api/transition/mos/:code               # Translate MOS
GET    /api/transition/timeline                # Get timeline

# Job Board
GET    /api/jobboard/postings                  # List jobs
GET    /api/jobboard/match?user_id=uuid        # Find matching jobs

# Outreach
GET    /api/outreach/pages?keyword=X           # Search communities
POST   /api/outreach/submissions               # Submit page
GET    /api/outreach/stats                     # Get statistics
```

---

## 📁 Common File Paths

```
Frontend Components:
- src/budget/components/BudgetForm.tsx
- src/retirement/components/RetirementPlanner.tsx
- src/transition/components/TransitionChecklist.tsx
- src/jobboard/components/JobBoard.tsx
- src/outreach/components/PageFinder.tsx

Backend Controllers:
- backend/controllers/budgetController.ts
- backend/controllers/retirementController.ts
- backend/controllers/transitionController.ts
- backend/controllers/jobBoardController.ts
- backend/controllers/outreachController.ts

Services:
- backend/services/budgetService.ts
- backend/services/retirementService.ts
- backend/services/jobBoardService.ts
- backend/services/outreachService.ts

Database:
- data/schema.sql              # Full schema
- backend/db/index.ts          # Connection

Configuration:
- .env.local                   # Frontend env
- backend/.env                 # Backend env
- package.json                 # Frontend deps
- backend/package.json         # Backend deps
```

---

## 🔑 Key Concepts

### Zustand Store Pattern
```typescript
// Create store
const useStore = create((set) => ({
  state: value,
  setState: (newValue) => set({ state: newValue })
}))

// Use in component
const { state, setState } = useStore()
```

### Zod Validation
```typescript
const schema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(18)
})

const result = schema.safeParse(data)
if (!result.success) {
  console.log(result.error.issues)
}
```

### React Query Hook
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['budget'],
  queryFn: async () => {
    const res = await fetch('/api/budget/calculate')
    return res.json()
  }
})
```

### Fastify Endpoint
```typescript
app.post('/api/endpoint', async (request, reply) => {
  try {
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error })
    }
    // Process...
    return reply.send({ success: true, data: result })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Server error' })
  }
})
```

---

## 🧮 Important Math Functions

**Location**: `src/shared/utils/math.ts`

```typescript
// Compound monthly return
compoundMonthly(annualRate, months)

// Adjust for inflation
adjustForInflation(value, inflationRate, years)

// Real return (returns - inflation)
realReturn(nominalReturn, inflationRate)

// Weighted portfolio return
weightedReturn(returns[], weights[])

// Safe withdrawal rate
safeWithdrawal(portfolio, withdrawalRate)

// Guardrail thresholds
guardrailWithdrawal(portfolio, lower%, upper%)
```

---

## 🗄️ Database Quick Reference

**Connect to database:**
```bash
psql -U postgres -d veterans1st_dev
```

**Common queries:**
```sql
-- Tables
\dt                          # List all tables
SELECT * FROM users;        # View users

-- Check schema
\d public_pages              # View table structure
\di                          # List indexes

-- Sample data
SELECT COUNT(*) FROM users;
SELECT * FROM public_pages LIMIT 5;
```

---

## 🔍 Debugging Tips

### Frontend Debugging
```bash
# Check TypeScript errors
npm run type-check

# Check linting
npm run lint

# Run in verbose mode
VITE_DEBUG=1 npm run dev
```

### Backend Debugging
```bash
# Check logs
# Fastify logs to console with Pino

# Test endpoint
curl -X GET http://localhost:4000/api/outreach/stats

# Query database
psql -d vetsready_dev -c "SELECT COUNT(*) FROM vetsready_users;"
```

### React Debugging
```javascript
// In browser console
console.log('State:', useStore.getState())

// Using React DevTools extension
// Components tab → Select component → Look at hooks
```

---

## 📊 Performance Checklist

- [ ] Run `npm run type-check` (no errors)
- [ ] Run `npm run build` (production build succeeds)
- [ ] Database indexes created (`\di` in psql)
- [ ] React Query cache TTL set appropriately
- [ ] Zustand store selectors used (avoid re-renders)
- [ ] API endpoints respond < 500ms
- [ ] Database queries use indexes

---

## 🔐 Security Checklist

- [ ] No hardcoded credentials
- [ ] Environment variables used
- [ ] Input validation with Zod
- [ ] Parameterized queries only
- [ ] Error messages don't leak PII
- [ ] CORS configured correctly
- [ ] Helmet security headers enabled
- [ ] TypeScript strict mode

---

## 📝 Common Tasks

### Add New Feature
1. Create types: `src/module/types/moduleTypes.ts`
2. Create service: `src/module/services/moduleService.ts`
3. Create hook: `src/module/hooks/useModule.ts`
4. Create component: `src/module/components/Module.tsx`
5. Create store: `src/module/store/moduleStore.ts`
6. Add backend: controller → routes → service

### Update Database
1. Edit `data/schema.sql`
2. Drop & recreate database:
   ```bash
   dropdb veterans1st_dev
   createdb veterans1st_dev
   psql -U postgres -d veterans1st_dev -f data/schema.sql
   ```

### Deploy Frontend
```bash
npm run build
# Use build tool (Vercel, S3, etc.)
```

### Deploy Backend
```bash
cd backend
npm run build
# Use host (Heroku, AWS, etc.)
```

---

## 🆘 Emergency Debug

**Nothing works?**
```bash
# Clear everything and restart
rm -rf node_modules package-lock.json
npm install
cd backend && npm install && cd ..
npm run dev
cd backend && npm run dev
```

**Database corrupted?**
```bash
dropdb vetsready_dev
createdb vetsready_dev
psql -U postgres -d vetsready_dev -f data/schema.sql
```

**Port conflict?**
```bash
# Find process using port
lsof -i :5173
lsof -i :4000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5174 npm run dev
PORT=4001 npm run dev (backend)
```

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Master index of all docs |
| [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Installation & setup |
| [API.md](docs/API.md) | Complete API reference |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment |
| [OUTREACH_SYSTEM.md](docs/OUTREACH_SYSTEM.md) | Outreach module details |
| [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md) | What was built |

---

## 🔗 Useful Links

- **React Docs**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Zustand**: https://github.com/pmndrs/zustand
- **Zod**: https://zod.dev
- **Fastify**: https://www.fastify.io
- **PostgreSQL**: https://www.postgresql.org
- **Vite**: https://vitejs.dev

---

## 💡 Pro Tips

1. **Use TypeScript strict mode** - Catches bugs early
2. **Validate with Zod** - Runtime type safety
3. **Test in DB first** - Complex queries
4. **Use indexes** - Query performance
5. **Reuse stores** - Avoid prop drilling
6. **Structure routes** - Keep code organized
7. **Document APIs** - Future-proof code

---

**Happy Coding! 🎖️**

For detailed help, see [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
