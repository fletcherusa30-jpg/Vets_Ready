# Rally Forge Platform - Quick Start Guide

This file was moved from the repository root to improve organization. The content below remains unchanged.


# Rally Forge Platform - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### 1. Install Dependencies

**Frontend:**
```bash
cd c:/Dev/PhoneApp
npm install
```

**Backend:**
```bash
cd c:/Dev/PhoneApp/backend
npm install
```

### 2. Set Up Database

**Create PostgreSQL database:**
```bash
createdb rallyforge_platform
```

**Run schema:**
```bash
psql rallyforge_platform < "c:/Dev/Rally Forge/data/schema.sql"
```

### 3. Configure Environment

**Backend `.env` file:**
```bash
cd c:/Dev/PhoneApp/backend
cat > .env << EOF
PORT=4000
HOST=0.0.0.0
DATABASE_URL=postgresql://user:password@localhost:5432/rallyforge_platform
NODE_ENV=development
EOF
```

**Frontend `.env` file:**
```bash
cd c:/Dev/PhoneApp
cat > .env << EOF
VITE_API_URL=http://localhost:4000
EOF
```

### 4. Start the Platform

**Terminal 1 - Frontend:**
```bash
cd c:/Dev/PhoneApp
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd c:/Dev/PhoneApp/backend
npm run dev
# Runs on http://localhost:4000
```

### 5. Open in Browser

Navigate to http://localhost:5173 and explore all 8 pages!

---

## 📁 Project Structure

```
Frontend (React + TypeScript)
├── src/
│   ├── pages/ (7 main pages)
│   ├── components/layout/ (Nav, Footer, Layout)
│   ├── hooks/ (5 React Query modules)
│   ├── types/ (Zod schemas)
│   └── App.tsx (Router)

Backend (Fastify + Node.js)
├── controllers/ (5 controllers)
├── services/ (5 services)
├── routes/ (5 route files)
├── server.ts (Main server)
└── database.ts (DB connection)

Database (PostgreSQL)
└── data/schema.sql (20+ tables)
```

---

## 🔌 API Endpoints

All endpoints prefixed with `/api/rallyforge/`

### Benefits
- `GET /benefits/federal` - Federal VA benefits
- `GET /benefits/state/:state` - State benefits (e.g., /benefits/state/CA)
- `GET /benefits/:id` - Single benefit

### Claims
- `GET /claims` - User's claims
- `POST /claims` - Create claim
- `PUT /claims/:id` - Update claim
- `DELETE /claims/:id` - Delete claim

### Finance
- `GET /finance/budgets` - User budgets
- `POST /finance/budget` - Create budget
- `POST /finance/retirement/calculate` - Calculate retirement
- `GET /finance/retirement/scenarios` - Retirement scenarios

### Resources
- `GET /resources` - All resources
- `GET /resources/category/:category` - By category
- `GET /resources/:id` - Single resource

### Partners
- `GET /partners` - All partners
- `POST /partners` - Create partner
- `GET /partners/:id` - Single partner
- `GET /partners/:partnerId/jobs` - Partner's jobs

---

## 🧪 Testing

### Test Benefits Endpoint
```bash
curl http://localhost:4000/api/rallyforge/benefits/federal
```

### Test Frontend Integration
1. Open http://localhost:5173
2. Go to Benefits page
3. Check browser console for API calls
4. Verify data displays

---

## 📦 Build for Production

**Frontend:**
```bash
cd c:/Dev/PhoneApp
npm run build
# Output: dist/
```

**Backend:**
```bash
cd c:/Dev/PhoneApp/backend
npm run build
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Query, Zustand
- **Backend**: Fastify, Node.js, TypeScript
- **Database**: PostgreSQL
- **Validation**: Zod
- **HTTP**: REST API

---

## 📚 Features

### Pages
- **Home** - Landing page with hero & feature cards
- **Benefits** - Federal/state benefits navigator
- **Claims** - Claims readiness education
- **Transition** - Transition planning tools
- **Finance** - Budget & retirement calculators
- **Jobs & Business** - Job board & veteran businesses
- **Resources** - Resource hub with links
- **Partners** - Partnership engine (B2B)

### Core Features
- ✅ Full-stack TypeScript
- ✅ React Router (8 routes)
- ✅ React Query (client-side caching)
- ✅ Zod validation
- ✅ PostgreSQL persistence
- ✅ Responsive design
- ✅ Professional UI

---

## 🚀 Deployment

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN cd backend && npm install
EXPOSE 4000 5173
CMD ["npm", "run", "dev"]
```

### Environment Variables
Set in production hosting:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to "production"
- `PORT` - Backend port
- `VITE_API_URL` - API base URL

---

## 📖 Documentation

See [rally_forge_COMPLETE.md](rally_forge_COMPLETE.md) for full project status.

---

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change port in .env
PORT=5000
```

**Database connection error:**
```bash
# Check PostgreSQL is running
psql -l
```

**Frontend can't reach API:**
- Check `VITE_API_URL` in `.env`
- Verify backend is running on port 4000
- Check CORS is enabled (it is, in server.ts)

---

## ❓ FAQ

**Q: Where do I edit the database schema?**
A: Edit `data/schema.sql` and re-run it in PostgreSQL.

**Q: How do I add a new page?**
A: Create a new file in `src/pages/`, add a route in `App.tsx`.

**Q: How do I add a new API endpoint?**
A: Create controller + service + route file in backend, register in `server.ts`.

**Q: How do I seed data?**
A: Write INSERT statements in SQL file or create seeding scripts in backend.

---

**Status**: ✅ **All core components complete and ready for development.**

Next: Data seeding → Authentication → Deployment

---

Built with ❤️ for veterans.


