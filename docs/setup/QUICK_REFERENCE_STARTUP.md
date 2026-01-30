# Rally Forge - Quick Reference

## 🚀 One Command to Rule Them All

```powershell
.\Start-rallyforge.ps1
```

That's it! Everything else is handled automatically.

---

## 📋 Common Commands

### Development
```powershell
# Start everything (first time)
.\Start-rallyforge.ps1

# Start everything (subsequent runs, faster)
.\Start-rallyforge.ps1 -SkipDeps

# Fresh installation (clean slate)
.\Start-rallyforge.ps1 -Fresh

# Stop servers
# Press Ctrl+C in the terminal
```

### Docker
```powershell
# Start with Docker (production-like)
.\Start-rallyforge.ps1 -Mode docker

# View Docker logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop Docker services
docker-compose -f docker-compose.prod.yml down
```

---

## 🌐 Access Points

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | http://localhost:5173 | Development mode |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Interactive Swagger UI |
| **Alternative Docs** | http://localhost:8000/redoc | ReDoc UI |

---

## 📁 Project Structure (Key Files)

```
rally-forge-frontend/
  ├── src/main.tsx           ← App entry point
  ├── App.tsx                ← Main React component
  ├── package.json           ← Dependencies
  └── .env                   ← Frontend config

rally-forge-backend/
  ├── app/main.py            ← API entry point
  ├── requirements.txt       ← Python dependencies
  └── .env                   ← Backend config

Start-rallyforge.ps1          ← One-click startup
docker-compose.prod.yml      ← Docker orchestration
```

---

## 🔧 Quick Fixes

### Frontend won't start?
```powershell
cd rally-forge-frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Backend won't start?
```powershell
cd rally-forge-backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Database issues?
```powershell
cd rally-forge-backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
```

### Port already in use?
```powershell
# Find what's using port 5173 (frontend)
netstat -ano | findstr :5173

# Find what's using port 8000 (backend)
netstat -ano | findstr :8000

# Kill process (replace <PID>)
taskkill /PID <PID> /F
```

---

## 🧪 Testing

```powershell
# Frontend tests
cd rally-forge-frontend
npm run test

# Backend tests
cd rally-forge-backend
.\.venv\Scripts\Activate.ps1
pytest
```

---

## 📦 Key Dependencies

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **Zustand** - State management

### Backend
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **Alembic** - Migrations
- **PostgreSQL** - Database
- **Redis** - Cache
- **Pydantic** - Validation
- **JWT** - Authentication
- **Stripe** - Payments

---

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```env
DATABASE_URL=postgresql://rallyforge:rallyforge123@localhost:5432/rallyforge_db
JWT_SECRET=your-secret-key-here
REDIS_URL=redis://localhost:6379/0
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| PostgreSQL not running | `Start-Service postgresql*` |
| Redis not running (WSL) | `wsl sudo service redis-server start` |
| Dependencies out of sync | Run with `-Fresh` flag |
| Port conflicts | Kill conflicting process |
| Database migration fails | Check PostgreSQL is running |

---

## 📚 Full Documentation

- **Startup Guide**: `STARTUP_GUIDE.md` (detailed instructions)
- **Architecture**: `docs/PRODUCTION_ARCHITECTURE.md`
- **Deployment**: `docs/DEPLOYMENT.md`
- **API Reference**: http://localhost:8000/docs (when running)

---

## 🎯 Development Workflow

1. **Start**: `.\Start-rallyforge.ps1`
2. **Code**: Edit files (auto-reload enabled)
3. **Test**: Visit http://localhost:5173
4. **Commit**: Save your changes
5. **Stop**: Press Ctrl+C

---

## ⚡ Power User Tips

### Background Execution
```powershell
# Run in background (keep terminal free)
Start-Process powershell -ArgumentList "-File Start-rallyforge.ps1"
```

### Quick Restart
```powershell
# After first run, always use -SkipDeps for 10x faster startup
.\Start-rallyforge.ps1 -SkipDeps
```

### View Logs
```powershell
# Latest startup log
Get-Content (Get-ChildItem logs\startup-*.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName -Tail 50
```

### Database Quick Commands
```powershell
# Connect to database
psql -U rallyforge -d rallyforge_db

# Backup database
pg_dump -U rallyforge rallyforge_db > backup.sql

# Restore database
psql -U rallyforge -d rallyforge_db < backup.sql
```

---

## 🔐 Default Credentials (Development Only)

**PostgreSQL:**
- Username: `rallyforge`
- Password: `rallyforge123`
- Database: `rallyforge_db`

**Application:**
- Test users created by seed data (if loaded)
- Check `seed-data.sql` for details

---

## 📞 Need Help?

1. ✅ Check `STARTUP_GUIDE.md` for detailed instructions
2. ✅ Review logs at `logs/startup-*.log`
3. ✅ Check API docs at http://localhost:8000/docs
4. ✅ Verify all prerequisites are installed

---

**Pro Tip**: Bookmark this file for quick reference! 📌


