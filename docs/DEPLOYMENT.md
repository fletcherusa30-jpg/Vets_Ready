# Deployment Guide

**Version:** 2.0 | **Last Updated:** January 23, 2026

---

## Deployment Environments

### Development
- **Location:** Local machine or dev server
- **Database:** SQLite
- **Servers:** All modules run independently
- **Frontend:** Vite dev server (hot reload)
- **Backend:** uvicorn (auto-reload)

### Staging
- **Location:** Cloud staging environment (AWS/Azure)
- **Database:** PostgreSQL (managed service)
- **Frontend:** CDN with staging domain
- **Backend:** Docker container with load balancing
- **Testing:** Full smoke tests, UAT ready

### Production
- **Location:** Cloud production environment (AWS/Azure)
- **Database:** PostgreSQL (managed service with backups)
- **Frontend:** CDN with production domain (CDN)
- **Backend:** Multi-container deployment with auto-scaling
- **Monitoring:** Full observability stack

---

## Pre-Deployment Checklist

### Code
- [ ] All tests passing locally
- [ ] Code reviewed & approved
- [ ] No linter warnings
- [ ] Secrets NOT in code (use environment variables)
- [ ] Database migrations ready

### Frontend
- [ ] Build passes without errors
- [ ] No console warnings/errors in production build
- [ ] Bundle size acceptable (<500KB gzip)
- [ ] Assets optimized (images, fonts)
- [ ] Service worker configured (if PWA)

### Backend
- [ ] API tests passing (pytest)
- [ ] Load testing results acceptable
- [ ] Database migrations validated
- [ ] Error handling implemented
- [ ] Rate limiting configured

### Mobile
- [ ] Debug build tested on real devices
- [ ] Release build signed with correct certificate
- [ ] App Store/Google Play metadata ready
- [ ] Privacy policy & terms of service ready

### Desktop
- [ ] Cross-platform build (Windows, Mac, Linux)
- [ ] Code signed & notarized (Mac)
- [ ] Auto-update configuration tested
- [ ] Installer tested on clean machine

---

## Deployment Procedures

### Frontend Deployment

#### Build
```bash
cd frontend
npm ci
npm run build
```

#### Upload to CDN
```bash
# AWS S3
aws s3 sync dist/ s3://phoneapp-prod/
aws cloudfront create-invalidation --distribution-id E1234 --paths "/*"

# Azure Blob Storage
az storage blob upload-batch -d '$web' -s dist/ --account-name veteranapp
```

#### Verify
- Check domain resolves to CDN
- Test in incognito mode (no cache)
- Verify all assets load
- Test on mobile browsers

### Backend Deployment

#### Build Docker Image
```bash
cd backend
docker build -t phoneapp-backend:v1.0.0 .
docker tag phoneapp-backend:v1.0.0 <registry>/phoneapp-backend:v1.0.0
docker push <registry>/phoneapp-backend:v1.0.0
```

#### Deploy to ECS/Container Instances
```bash
# AWS ECS
aws ecs update-service --cluster phoneapp --service backend \
  --force-new-deployment

# Azure Container Instances
az container create --resource-group phoneapp \
  --name backend --image <registry>/phoneapp-backend:v1.0.0
```

#### Database Migrations
```bash
# Run migrations before deploying
cd backend
alembic upgrade head
```

#### Health Checks
```bash
# Verify API is responsive
curl https://api.veteranapp.com/health
# Expected: 200 OK with {"status": "healthy"}
```

### Mobile Deployment

#### Android
```bash
# Build signed APK
cd android
./gradlew assembleRelease

# Upload to Google Play
fastlane supply --apk android/app/build/outputs/apk/release/app-release.apk
```

#### iOS
```bash
# Build archive
cd mobile
xcode-build -scheme App -configuration Release -archivePath build.xcarchive

# Upload to App Store
xcrun altool --upload-app --file build.ipa
```

### Desktop Deployment

#### Windows & Mac
```bash
cd desktop
npm run build

# Auto-update server will serve these binaries
```

#### Linux
```bash
cd desktop
npm run build:linux

# Upload to releases server
```

---

## Rollback Procedures

### Frontend Rollback
```bash
# Revert CloudFront to previous version
aws cloudfront create-invalidation --distribution-id E1234 --paths "/*"
# Point to previous S3 version
aws s3 cp s3://phoneapp-prod-backups/v1.0.0/index.html s3://phoneapp-prod/
```

### Backend Rollback
```bash
# AWS ECS - roll back to previous task definition
aws ecs update-service --cluster phoneapp --service backend \
  --task-definition phoneapp-backend:2

# Azure - roll back container
az container create --resource-group phoneapp \
  --name backend --image <registry>/phoneapp-backend:v0.9.9
```

### Database Rollback
```bash
# Only if migration failed - BACKUP FIRST!
cd backend
alembic downgrade -1  # Undo last migration
# Verify data integrity after rollback
```

---

## Monitoring Post-Deployment

### Key Metrics to Watch
1. **Error Rate** - Should be < 0.1%
2. **Response Time** - 95th percentile < 500ms
3. **CPU/Memory** - < 80% sustained
4. **Database Connections** - < 90% pool capacity
5. **Failed Logins** - Detect brute force attacks

### Alerts to Set Up
- [ ] High error rate (> 1% in 5 min)
- [ ] High response time (p95 > 1s)
- [ ] High memory usage (> 85%)
- [ ] Database connection pool exhausted
- [ ] SSL certificate expiry (30 days warning)

### Monitoring Tools
- **Application Logs:** ELK Stack, CloudWatch, Azure Monitor
- **Performance:** DataDog, New Relic, or AppDynamics
- **Error Tracking:** Sentry, Rollbar
- **Uptime:** UptimeRobot, Statuspage.io

---

## Automated Deployment Pipeline

### GitHub Actions Workflow
See `.github/workflows/ci-cd.yml`

**Pipeline Stages:**
1. **Lint & Test** - All modules
2. **Security Scan** - Trivy, SAST tools
3. **Docker Build** - Backend image
4. **Deploy to Staging** - On develop branch
5. **Deploy to Production** - On main branch (manual approval)

**Triggers:**
- Push to `develop` → Deploy to staging
- Push to `main` → Manual approval required → Deploy to production
- Pull requests → Run tests only

---

## Infrastructure as Code (IaC)

### Terraform (AWS Example)
```hcl
# main.tf
terraform {
  backend "s3" {
    bucket         = "phoneapp-terraform"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# ECS Cluster
resource "aws_ecs_cluster" "phoneapp" {
  name = "phoneapp-prod"
}

# RDS Database
resource "aws_db_instance" "postgres" {
  identifier     = "phoneapp-postgres"
  engine         = "postgres"
  instance_class = "db.t3.micro"
  allocated_storage = 100
  skip_final_snapshot = false
  backup_retention_period = 30
}

# S3 for Frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "phoneapp-frontend-prod"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-frontend"
  }
  # ... distribution config
}
```

---

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/veteranapp
# Security
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
# CORS
CORS_ORIGINS=https://veteranapp.com,https://app.veteranapp.com
# Logging
LOG_LEVEL=INFO
# Features
ENABLE_AI_ENGINE=true
MAX_UPLOAD_SIZE=104857600  # 100MB
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://api.veteranapp.com
VITE_APP_VERSION=1.0.0
VITE_SENTRY_DSN=https://...
```

---

## Disaster Recovery

### Backup Strategy
- **Database:** Daily automated backups, 30-day retention
- **Frontend Assets:** Versioned S3 buckets with 90-day retention
- **Secrets:** Encrypted in AWS Secrets Manager with audit logging
- **Configuration:** Version controlled in separate private repo

### Recovery Time Objectives (RTO)
- **Database Corruption:** < 1 hour
- **API Service Down:** < 15 minutes
- **Frontend CDN Down:** < 5 minutes
- **Data Loss:** < 24 hours (from daily backup)

### Recovery Procedures
1. **Database Recovery:** Use RDS backup restore
2. **API Recovery:** Redeploy from Docker image
3. **Frontend Recovery:** Deploy from S3 version
4. **Complete Outage:** Failover to standby region

---

## Security Checklist for Deployment

- [ ] HTTPS/TLS enabled on all endpoints
- [ ] SSL certificate valid and up-to-date
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting enabled on auth endpoints
- [ ] CORS configured for known domains only
- [ ] Secrets not in logs or error messages
- [ ] Database encryption enabled
- [ ] VPN/WAF protecting backend
- [ ] DDoS protection enabled
- [ ] Security scanning in CI/CD

---

## Post-Deployment Communication

### Team Notification
```
✅ Deployment Complete

Version: v1.0.0
Environment: Production
Deployed by: [Name]
Timestamp: [ISO 8601]

Changes:
- Feature X implemented
- Bug Y fixed
- Database migration Z

Monitoring: All metrics nominal
Status: Healthy
```

### User Communication
- Post to status page
- Send email notification (opt-in)
- Update release notes / changelog

---

## Troubleshooting Common Issues

### Frontend Not Loading
- Check CDN distribution is enabled
- Verify DNS points to CloudFront
- Check browser cache (Ctrl+Shift+Delete)
- Verify JavaScript files loaded (DevTools Network)

### API Errors
- Check backend logs in CloudWatch
- Verify database connection
- Test endpoint directly: `curl https://api.veteranapp.com/health`
- Check rate limiting not triggered

### Database Issues
- Check RDS instance status
- Verify security group allows connection
- Check disk space not full
- Run `ANALYZE` to update query planner stats

### Mobile App Issues
- Verify app version matches API version
- Check app permissions (Settings)
- Clear app cache (uninstall/reinstall if needed)
- Check Android/iOS logs

