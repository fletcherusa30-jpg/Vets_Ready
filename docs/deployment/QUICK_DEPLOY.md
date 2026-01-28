# Vets Ready - Quick Deploy Guide

**Get your complete Vets Ready platform deployed in 30 minutes.**

---

## 🚀 Quick Start (Local Docker)

### Prerequisites
- Docker Desktop installed and running
- Git repository cloned
- 5 GB free disk space

### Deploy in 3 Commands

```powershell
# 1. Configure environment
Copy-Item .env.production.example .env.production
# Edit .env.production with your values (minimum: DB_PASSWORD, JWT_SECRET)

# 2. Build and push to Docker Hub
.\scripts\Deploy-Docker.ps1 -Version "1.0.0"

# 3. Deploy locally
docker-compose -f docker-compose.prod.yml up -d
```

**Access your app:**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🌐 Cloud Deploy (AWS/Azure/GCP)

### AWS (Recommended)

```bash
# 1. Install AWS CLI
# Download from: https://aws.amazon.com/cli/

# 2. Configure credentials
aws configure

# 3. Deploy using Docker images
aws ecs create-cluster --cluster-name vetsready

# See DEPLOYMENT_GUIDE.md for full AWS instructions
```

### Azure

```bash
# 1. Install Azure CLI
# Download from: https://aka.ms/installazurecliwindows

# 2. Login
az login

# 3. Create container instances
az container create --resource-group VetsReady \
  --name vetsready-backend \
  --image vetsready/vets-ready-backend:latest

# See DEPLOYMENT_GUIDE.md for full Azure instructions
```

---

## 📱 Mobile Apps

### Android (Google Play)

```powershell
# Build release bundle
.\scripts\Build-Android.ps1 -BuildType release -OutputFormat bundle

# Upload to Google Play Console
# https://play.google.com/console
```

### iOS (App Store) - Requires macOS

```bash
# Build IPA
chmod +x scripts/Build-iOS.sh
./scripts/Build-iOS.sh Release

# Upload to App Store Connect
# https://appstoreconnect.apple.com
```

---

## 💻 Desktop Apps

```powershell
# Windows
.\scripts\Build-Desktop.ps1 -Platform windows

# macOS (on Mac)
.\scripts\Build-Desktop.ps1 -Platform mac

# Linux
.\scripts\Build-Desktop.ps1 -Platform linux
```

Installers in: `desktop/build/`

---

## ✅ Validate Deployment

```powershell
# Run automated validation
.\scripts\Validate-Deployment.ps1 -Environment production
```

---

## 🔧 Essential Configuration

**Minimum required in `.env.production`:**

```bash
# Database
DATABASE_URL=postgresql://vetsready:YOUR_DB_PASSWORD@postgres:5432/vetsready_db
DB_PASSWORD=YOUR_DB_PASSWORD

# Security
JWT_SECRET=YOUR_64_CHAR_SECRET_HERE
JWT_ALGORITHM=HS256

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
```

**Generate secrets:**
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

## 📊 GitHub Actions (Auto-Deploy)

**Already configured!** Just push to `main` branch:

```bash
# Trigger automatic deployment
git add .
git commit -m "Deploy v1.0.0"
git tag v1.0.0
git push origin main --tags
```

GitHub Actions will:
1. Run tests
2. Build Docker images
3. Push to Docker Hub
4. Security scan

**Required GitHub Secrets:**
- Settings → Secrets → Actions → New secret
  - `DOCKER_USERNAME`: Your Docker Hub username
  - `DOCKER_PASSWORD`: Docker Hub password/token
  - `STRIPE_PUBLISHABLE_KEY`: Stripe public key

---

## 🆘 Need Help?

**Common Issues:**

1. **"Docker not running"**
   - Start Docker Desktop
   - Wait for Docker whale icon to be solid

2. **"Port already in use"**
   ```powershell
   # Stop existing containers
   docker-compose down
   ```

3. **"Database connection failed"**
   - Check `DATABASE_URL` in `.env.production`
   - Verify PostgreSQL container running: `docker ps`

4. **"Frontend can't reach API"**
   - Check CORS origins in `.env.production`
   - Verify backend health: http://localhost:8000/health

**Full documentation:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Deployment checklist:** See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🎯 Next Steps After Deploy

1. **Test payment flow** with Stripe test card: `4242 4242 4242 4242`
2. **Configure monitoring** in Sentry and PostHog
3. **Set up backups** (daily database dumps)
4. **Configure SSL** if deploying to production domain
5. **Test mobile apps** on physical devices
6. **Submit apps** to Play Store and App Store

---

**You now have a complete, production-ready Vets Ready deployment!** 🎉

**Star the repo:** https://github.com/fletcherusa30-jpg/Vets_Ready
