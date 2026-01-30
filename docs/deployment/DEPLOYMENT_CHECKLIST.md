# Rally Forge - Complete Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Configure database password (32+ characters)
- [ ] Add Stripe live API keys (secret and publishable)
- [ ] Add Stripe webhook secret
- [ ] Configure SMTP settings for email
- [ ] Add Sentry DSN for error tracking
- [ ] Add PostHog API key for analytics
- [ ] Set correct CORS origins
- [ ] Configure AWS S3 credentials (if using)
- [ ] Set production API and frontend URLs

### 2. GitHub Configuration
- [ ] Repository pushed to GitHub: `github.com/fletcherusa30-jpg/rally_forge`
- [ ] Configure GitHub Secrets:
  - [ ] `DOCKER_USERNAME` - Docker Hub username
  - [ ] `DOCKER_PASSWORD` - Docker Hub password/token
  - [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- [ ] Review `.gitignore` to ensure secrets not committed
- [ ] Enable GitHub Actions workflows

### 3. Docker Hub Configuration
- [ ] Docker Hub repository created: `rallyforge/rally-forge`
- [ ] Docker Hub authentication configured locally
- [ ] Test Docker Hub push access

### 4. Code Signing (Optional but Recommended)
- [ ] Android app signing keystore generated
- [ ] iOS provisioning profiles configured
- [ ] macOS code signing certificate obtained
- [ ] Windows code signing certificate obtained (for desktop)

### 5. Third-Party Services
- [ ] Stripe account in production mode
- [ ] Stripe webhooks configured
- [ ] Sentry project created
- [ ] PostHog project created
- [ ] SMTP provider configured
- [ ] Domain DNS configured (if deploying to cloud)

---

## 🚀 Deployment Steps

### Option A: Local Docker Deployment

1. **Build Docker Images**
   ```powershell
   # Build and push to Docker Hub
   .\scripts\Deploy-Docker.ps1 -Version "1.0.0" -Environment production

   # Or skip tests
   .\scripts\Deploy-Docker.ps1 -Version "1.0.0" -SkipTests
   ```

2. **Deploy with Docker Compose**
   ```powershell
   # Start all services
   docker-compose -f docker-compose.prod.yml up -d

   # View logs
   docker-compose -f docker-compose.prod.yml logs -f

   # Check status
   docker-compose -f docker-compose.prod.yml ps
   ```

3. **Validate Deployment**
   ```powershell
   .\scripts\Validate-Deployment.ps1 -Environment local
   ```

### Option B: Cloud Deployment (AWS Example)

1. **Provision Infrastructure**
   ```bash
   # Install AWS CLI and configure
   aws configure

   # Create RDS PostgreSQL database
   aws rds create-db-instance \
     --db-instance-identifier rallyforge-db \
     --db-instance-class db.t3.small \
     --engine postgres \
     --master-username rallyforge \
     --master-user-password YOUR_PASSWORD \
     --allocated-storage 20

   # Create Elastic Container Service cluster
   aws ecs create-cluster --cluster-name rallyforge-cluster
   ```

2. **Deploy Backend to ECS**
   ```bash
   # Create task definition (see DEPLOYMENT_GUIDE.md for full JSON)
   aws ecs register-task-definition --cli-input-json file://ecs-task-backend.json

   # Create service
   aws ecs create-service \
     --cluster rallyforge-cluster \
     --service-name rallyforge-backend \
     --task-definition rallyforge-backend \
     --desired-count 2 \
     --launch-type FARGATE
   ```

3. **Deploy Frontend to S3 + CloudFront**
   ```bash
   # Build frontend
   cd rally-forge-frontend
   npm run build

   # Create S3 bucket
   aws s3 mb s3://rallyforge-frontend

   # Upload build
   aws s3 sync dist/ s3://rallyforge-frontend --delete

   # Create CloudFront distribution
   aws cloudfront create-distribution --origin-domain-name rallyforge-frontend.s3.amazonaws.com
   ```

### Option C: Mobile App Deployment

1. **Build Android APK/Bundle**
   ```powershell
   # Build release bundle for Google Play
   .\scripts\Build-Android.ps1 -BuildType release -OutputFormat bundle

   # Upload to Google Play Console
   # Manual upload via https://play.google.com/console
   ```

2. **Build iOS IPA**
   ```bash
   # On macOS
   chmod +x scripts/Build-iOS.sh
   ./scripts/Build-iOS.sh Release

   # Upload to App Store Connect
   xcrun altool --upload-app --type ios \
     --file ios/App/build/App.ipa \
     --username YOUR_APPLE_ID \
     --password YOUR_APP_SPECIFIC_PASSWORD
   ```

### Option D: Desktop App Deployment

1. **Build Desktop Installers**
   ```powershell
   # Build for Windows
   .\scripts\Build-Desktop.ps1 -Platform windows -Architecture x64

   # Build for all platforms (on appropriate OS)
   .\scripts\Build-Desktop.ps1 -Platform all -Architecture all
   ```

2. **Distribute**
   - Upload installers to website download page
   - Or publish to Microsoft Store / Mac App Store

---

## 🧪 Post-Deployment Validation

### 1. Health Checks
```powershell
# Run full validation
.\scripts\Validate-Deployment.ps1 -Environment production -ApiUrl "https://api.rallyforge.com"
```

### 2. Manual Testing
- [ ] Access frontend at production URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test password reset
- [ ] Test Stripe payment flow (with test card)
- [ ] Test file upload functionality
- [ ] Test mobile app (Android/iOS)
- [ ] Test desktop app (Windows/macOS)
- [ ] Test PWA installation
- [ ] Verify email notifications
- [ ] Check error tracking in Sentry
- [ ] Verify analytics in PostHog

### 3. Performance Testing
- [ ] Run load test with Azure Load Testing
- [ ] Verify API response times < 200ms
- [ ] Check database query performance
- [ ] Verify caching (Redis) working
- [ ] Test CDN asset delivery

### 4. Security Validation
- [ ] SSL/TLS certificates valid
- [ ] CORS origins restrictive
- [ ] JWT tokens expiring correctly
- [ ] Rate limiting active
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] Secrets not exposed in client code

---

## 📊 Monitoring Setup

### 1. Application Monitoring
- [ ] Sentry error tracking active
- [ ] PostHog analytics tracking users
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure log aggregation (e.g., CloudWatch, Datadog)

### 2. Infrastructure Monitoring
- [ ] Database metrics monitored
- [ ] Container health checks configured
- [ ] Disk space alerts set up
- [ ] CPU/memory alerts configured
- [ ] Network traffic monitored

### 3. Alerts Configuration
- [ ] API downtime alerts
- [ ] Database connection alerts
- [ ] Payment failure alerts
- [ ] High error rate alerts
- [ ] Security incident alerts

---

## 🔄 Continuous Deployment

### GitHub Actions Workflow (Already Configured)
The `.github/workflows/ci-cd.yml` pipeline automatically:
- ✅ Runs tests on every push
- ✅ Validates repository integrity
- ✅ Builds Docker images
- ✅ Pushes to Docker Hub on main branch
- ✅ Scans for security vulnerabilities
- ✅ Creates deployments on version tags

**To trigger deployment:**
```bash
# Tag a new version
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# GitHub Actions will automatically build and push
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Docker build fails**
```powershell
# Clear Docker cache
docker system prune -a --volumes
# Rebuild
.\scripts\Deploy-Docker.ps1 -Version latest
```

**Issue: Database connection fails**
```powershell
# Check PostgreSQL container
docker logs postgres_container_name
# Verify environment variables
docker exec backend_container env | grep DATABASE
```

**Issue: Frontend can't reach API**
```powershell
# Check CORS configuration in backend
# Verify VITE_API_URL in frontend build
# Check nginx proxy configuration
```

**Issue: Mobile app crashes on startup**
```bash
# View Android logs
adb logcat | grep rallyforge
# View iOS logs
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "rallyforge"'
```

---

## 📞 Support Resources

- **Documentation**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **API Reference**: https://api.rallyforge.com/docs
- **GitHub Issues**: https://github.com/fletcherusa30-jpg/rally_forge/issues
- **Docker Hub**: https://hub.docker.com/r/rallyforge/rally-forge

---

## ✅ Final Checklist

Before going live:
- [ ] All environment variables configured with production values
- [ ] SSL certificates installed and valid
- [ ] Database backups configured (daily minimum)
- [ ] Monitoring and alerts active
- [ ] Error tracking operational
- [ ] Load testing passed
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Team trained on deployment process
- [ ] Rollback plan documented
- [ ] Support contacts established

**Deployment Sign-Off:**
- Date: _______________
- Deployed By: _______________
- Version: _______________
- Environment: _______________
- Validation Status: [ ] Passed [ ] Failed

---

**Ready to Deploy? 🚀**

Run the complete deployment:
```powershell
# 1. Build and push Docker images
.\scripts\Deploy-Docker.ps1 -Version "1.0.0" -Environment production

# 2. Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# 3. Validate deployment
.\scripts\Validate-Deployment.ps1 -Environment production

# 4. Build mobile apps
.\scripts\Build-Android.ps1 -BuildType release -OutputFormat bundle
# (On macOS) ./scripts/Build-iOS.sh Release

# 5. Build desktop apps
.\scripts\Build-Desktop.ps1 -Platform all
```

**Your Rally Forge platform is now fully deployable across all platforms!** 🎉


