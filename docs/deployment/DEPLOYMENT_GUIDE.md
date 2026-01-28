# ====================================================
# VETS READY - COMPLETE DEPLOYMENT GUIDE
# ====================================================

## 🎯 QUICK START - LOCAL TESTING

### 1. Build Docker Images Locally
```powershell
# Backend
docker build -t vetsready/vets-ready-backend:latest ./vets-ready-backend

# Frontend
docker build -t vetsready/vets-ready-frontend:latest ./vets-ready-frontend --build-arg VITE_API_URL=http://localhost:8000

# Verify images
docker images | Select-String "vetsready"
```

### 2. Run with Docker Compose
```powershell
# Create .env file (see .env.example)
cp .env.example .env

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 3. Stop Services
```powershell
docker-compose -f docker-compose.prod.yml down
# Or with data cleanup:
docker-compose -f docker-compose.prod.yml down -v
```

---

## 🐳 DOCKER HUB DEPLOYMENT

### Step 1: Login to Docker Hub
```powershell
docker login
# Username: vetsready
# Password: [your Docker Hub password]
```

### Step 2: Build and Tag Images
```powershell
# Backend
docker build -t vetsready/vets-ready-backend:latest -t vetsready/vets-ready-backend:1.0.0 ./vets-ready-backend

# Frontend
docker build -t vetsready/vets-ready-frontend:latest -t vetsready/vets-ready-frontend:1.0.0 ./vets-ready-frontend --build-arg VITE_API_URL=https://api.vetsready.com
```

### Step 3: Push to Docker Hub
```powershell
# Push backend
docker push vetsready/vets-ready-backend:latest
docker push vetsready/vets-ready-backend:1.0.0

# Push frontend
docker push vetsready/vets-ready-frontend:latest
docker push vetsready/vets-ready-frontend:1.0.0
```

### Step 4: Verify on Docker Hub
Visit: https://hub.docker.com/r/vetsready/vets-ready-backend

---

## 📱 MOBILE DEPLOYMENT

### Android APK/AAB Build

#### Prerequisites
```powershell
# Install Android Studio and Android SDK
# Set ANDROID_HOME environment variable
# Install Java JDK 17+
```

#### Build Commands
```powershell
cd vets-ready-mobile

# Install dependencies
npm install

# Sync Capacitor
npx cap sync android

# Build APK (Debug)
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# Build AAB (Production)
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab

# Sign APK (for release)
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore my-release-key.keystore app-release.aab alias_name
```

#### Google Play Store Upload
1. Go to https://play.google.com/console
2. Create new application
3. Upload AAB file
4. Complete store listing
5. Submit for review

### iOS IPA Build (macOS Required)

#### Prerequisites
```bash
# Install Xcode from App Store
# Install CocoaPods
sudo gem install cocoapods
```

#### Build Commands
```bash
cd vets-ready-mobile

# Sync Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select "Any iOS Device" as destination
# 2. Product > Archive
# 3. Distribute App > App Store Connect
# 4. Upload to TestFlight
```

#### App Store Upload
1. Upload via Xcode or Transporter app
2. Go to https://appstoreconnect.apple.com
3. Complete app information
4. Submit for review

---

## 🖥️ DESKTOP DEPLOYMENT

### Electron Build

#### Prerequisites
```powershell
cd desktop
npm install
```

#### Build Windows Installer
```powershell
npm run build:win
# Output: desktop/dist/Vets Ready Setup 1.0.0.exe
```

#### Build macOS Installer
```bash
npm run build:mac
# Output: desktop/dist/Vets Ready-1.0.0.dmg
```

#### Build Linux AppImage
```bash
npm run build:linux
# Output: desktop/dist/Vets Ready-1.0.0.AppImage
```

#### Distribution
- **Windows**: Upload .exe to website or Microsoft Store
- **macOS**: Upload .dmg to website or Mac App Store (requires notarization)
- **Linux**: Upload .AppImage to website or Snap Store

---

## 🚀 PRODUCTION DEPLOYMENT

### Cloud Deployment Options

#### Option 1: AWS EC2 + Docker
```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install docker.io docker-compose -y

# Clone repository
git clone https://github.com/fletcherusa30-jpg/Vets_Ready.git
cd Vets_Ready

# Set environment variables
nano .env

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: Azure Container Instances
```powershell
# Login to Azure
az login

# Create resource group
az group create --name VetsReadyRG --location eastus

# Deploy backend
az container create `
  --resource-group VetsReadyRG `
  --name vetsready-backend `
  --image vetsready/vets-ready-backend:latest `
  --dns-name-label vetsready-api `
  --ports 8000

# Deploy frontend
az container create `
  --resource-group VetsReadyRG `
  --name vetsready-frontend `
  --image vetsready/vets-ready-frontend:latest `
  --dns-name-label vetsready-app `
  --ports 80
```

#### Option 3: DigitalOcean App Platform
1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository: fletcherusa30-jpg/Vets_Ready
4. Select components:
   - **Backend**: vets-ready-backend (Python)
   - **Frontend**: vets-ready-frontend (Node.js)
   - **Database**: PostgreSQL managed database
5. Set environment variables
6. Deploy

#### Option 4: Heroku
```powershell
# Install Heroku CLI
# Login
heroku login

# Create apps
heroku create vetsready-api
heroku create vetsready-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a vetsready-api

# Deploy backend
git subtree push --prefix vets-ready-backend heroku main

# Set environment variables
heroku config:set JWT_SECRET=your-secret -a vetsready-api
```

---

## ⚙️ ENVIRONMENT VARIABLES

### Production .env Template
```env
# Environment
ENVIRONMENT=production
DEBUG=False

# Database (PostgreSQL)
DATABASE_URL=postgresql://vetsready:CHANGE_ME@postgres:5432/vetsready_db
DB_PASSWORD=CHANGE_THIS_PASSWORD

# Security (GENERATE NEW SECRETS!)
JWT_SECRET=GENERATE_STRONG_SECRET_KEY_MINIMUM_64_CHARACTERS
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# API URLs
API_BASE_URL=https://api.vetsready.com
FRONTEND_URL=https://vetsready.com

# Redis (optional)
REDIS_URL=redis://redis:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Sentry (optional)
SENTRY_DSN=https://your-sentry-dsn

# PostHog (optional)
POSTHOG_API_KEY=your-posthog-key
```

---

## 🧪 TESTING & VALIDATION

### Backend Health Check
```powershell
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### Frontend Build Test
```powershell
cd vets-ready-frontend
npm run build
# Should complete without errors
```

### Database Connection Test
```powershell
docker exec -it vetsready_postgres psql -U vetsready -d vetsready_db -c "SELECT version();"
```

### Full Stack Integration Test
```powershell
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Wait for health checks
Start-Sleep -Seconds 30

# Test backend API
Invoke-WebRequest http://localhost:8000/docs

# Test frontend
Invoke-WebRequest http://localhost:3000

# Check logs
docker-compose -f docker-compose.prod.yml logs backend
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All environment variables set in .env
- [ ] Database credentials changed from defaults
- [ ] JWT secret generated (64+ characters)
- [ ] Stripe keys configured (live, not test)
- [ ] CORS origins updated for production domain
- [ ] SSL/TLS certificates obtained (Let's Encrypt)
- [ ] DNS records configured
- [ ] Firewall rules configured (ports 80, 443)

### Docker Hub
- [ ] Images built successfully
- [ ] Images tagged with version numbers
- [ ] Images pushed to vetsready/vets-ready-backend
- [ ] Images pushed to vetsready/vets-ready-frontend
- [ ] Repository visibility set (public/private)

### GitHub Actions
- [ ] Secrets configured in GitHub (DOCKER_USERNAME, DOCKER_PASSWORD)
- [ ] CI/CD pipeline runs successfully
- [ ] Tests pass on all platforms
- [ ] Auto-deploy enabled (optional)

### Mobile Apps
- [ ] Android APK built and tested
- [ ] Android AAB signed and uploaded to Play Store
- [ ] iOS IPA built (macOS)
- [ ] iOS app uploaded to App Store Connect
- [ ] App store listings completed
- [ ] Privacy policy and terms of service published

### Desktop Apps
- [ ] Windows installer built and tested
- [ ] macOS installer built and notarized (if distributing)
- [ ] Linux AppImage built
- [ ] Download links published on website

### Production Server
- [ ] Server provisioned (AWS/Azure/DigitalOcean/Heroku)
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] Database initialized with migrations
- [ ] Services running and healthy
- [ ] Monitoring configured (Sentry/PostHog)
- [ ] Backups configured
- [ ] Logs rotation configured

### Post-Deployment
- [ ] Health endpoints responding
- [ ] Frontend accessible at domain
- [ ] API docs accessible at /docs
- [ ] Database connections working
- [ ] Payment processing tested (Stripe)
- [ ] Email notifications working
- [ ] SSL certificate valid
- [ ] Performance monitoring active
- [ ] Error tracking active

---

## 🔧 TROUBLESHOOTING

### Docker Build Fails
```powershell
# Clear Docker cache
docker builder prune -a

# Rebuild with no cache
docker build --no-cache -t vetsready/vets-ready-backend:latest ./vets-ready-backend
```

### Database Connection Fails
```powershell
# Check if PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check logs
docker-compose -f docker-compose.prod.yml logs postgres

# Verify connection string
docker exec -it vetsready_backend env | Select-String DATABASE_URL
```

### Port Already in Use
```powershell
# Find process using port 8000
netstat -ano | Select-String ":8000"

# Kill process (replace PID)
Stop-Process -Id <PID> -Force
```

### Container Won't Start
```powershell
# Check container logs
docker logs vetsready_backend

# Check container status
docker inspect vetsready_backend

# Restart container
docker restart vetsready_backend
```

---

## 📞 SUPPORT & RESOURCES

- **Documentation**: https://github.com/fletcherusa30-jpg/Vets_Ready/tree/main/docs
- **API Docs**: http://localhost:8000/docs (when running)
- **Docker Hub**: https://hub.docker.com/u/vetsready
- **Issues**: https://github.com/fletcherusa30-jpg/Vets_Ready/issues

---

## 🎉 SUCCESS VERIFICATION

Your deployment is successful when:
1. ✅ Backend API responds at /health endpoint
2. ✅ Frontend loads in browser
3. ✅ User can create account and login
4. ✅ Database stores user data
5. ✅ Stripe test payment succeeds
6. ✅ Mobile apps install and run
7. ✅ Desktop apps install and run
8. ✅ All health checks pass
9. ✅ No errors in logs
10. ✅ Monitoring dashboards show data

**Congratulations! Your Vets Ready platform is fully deployed! 🚀**
