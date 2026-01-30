/**
 * PHASE 5: DEPLOYMENT GUIDE
 * Quick Start for Production Deployment
 */

# Phase 5 Deployment Quick Start Guide

## 📋 Pre-Deployment Checklist

### Code Quality
- [x] All unit tests passing (60+ tests)
- [x] All integration tests passing (40+ tests)
- [x] Code coverage > 85%
- [x] TypeScript compilation successful
- [x] ESLint validation passed
- [x] No critical security issues

### Configuration
- [ ] `.env.production` file created
- [ ] DATABASE_URL configured
- [ ] REDIS connection configured
- [ ] API keys configured (SendGrid, Datadog, etc.)
- [ ] Feature flags configured
- [ ] CORS origins configured

### Infrastructure
- [ ] PostgreSQL database created
- [ ] Redis cache cluster running
- [ ] SSL certificates installed
- [ ] Monitoring tools configured (Datadog/CloudWatch)
- [ ] Load balancer configured
- [ ] CDN configured (if needed)

### Data
- [ ] Database backup created
- [ ] Migration script tested in staging
- [ ] Rollback plan documented
- [ ] Audit logs backup created

---

## 🚀 Step-by-Step Deployment

### Step 1: Database Migration

```bash
# Create database backup
npm run db:backup -- --env production
# Output: backups/audit_logs_backup_2026-01-28T20-51-03.json

# Run migration
npm run db:migrate -- --env production --file 001-audit-logs-migration.ts
# Output: ✅ Database schema initialized successfully
#         🔄 Migrating XXXXX audit log records...
#         ✅ Data integrity validation passed
#         ✨ Migration completed successfully!

# Verify migration
psql -d rally_forge_prod -c "SELECT COUNT(*) FROM audit_logs;"
```

### Step 2: Build Application

```bash
# Install dependencies
npm install

# Build frontend
npm run build:frontend

# Build backend
npm run build:backend

# Build intelligence engine
npm run build:intelligence

# Verify builds
ls -la dist/
ls -la frontend/build/
```

### Step 3: Run Tests

```bash
# Run all tests
npm test -- --coverage

# Expected output:
# ✓ 60 unit tests
# ✓ 40 integration tests
# Coverage: Statements: 87%, Branches: 83%, Functions: 86%, Lines: 87%

# If any tests fail, do NOT deploy
npm test -- --verbose
```

### Step 4: Environment Setup

```bash
# Create production configuration
cat > .env.production << EOF
# Database
DATABASE_URL=postgresql://user:password@prod-db.example.com:5432/rally_forge_prod
DB_MAX_CONNECTIONS=50
DB_SSL=true

# Cache
CACHE_ENABLED=true
REDIS_HOST=prod-cache.example.com
REDIS_PORT=6379
REDIS_PASSWORD=secure_password
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# Intelligence
INTELLIGENCE_ENABLED=true
INTELLIGENCE_PARALLEL=true
INTELLIGENCE_MAX_CONCURRENT=10
INTELLIGENCE_TIMEOUT=30000

# Notifications
NOTIFICATION_ENABLED=true
NOTIFICATION_PROVIDER=sendgrid
NOTIFICATION_API_KEY=SG.xxxxxxxxxxxxx
NOTIFICATION_SENDER=no-reply@rallyforge.com

# Monitoring
MONITORING_ENABLED=true
MONITORING_PROVIDER=datadog
MONITORING_API_KEY=dxxxxxxxxxxxxxx

# Features
FEATURE_BENEFITS_PREDICTION=true
FEATURE_CLAIMS_OPTIMIZATION=true
FEATURE_RATING_PREDICTION=true
FEATURE_DOCUMENT_ANALYSIS=true
FEATURE_NOTIFICATIONS=true
FEATURE_AUDIT_LOGGING=true
FEATURE_BACKGROUND_JOBS=true

# Security
ENVIRONMENT=production
JWT_SECRET=secure_random_string_32_chars_min
API_KEY_REQUIRED=true
API_KEY=api_key_xxx

# Port
PORT=3000
NODE_ENV=production
EOF

# Verify configuration
npm run config:validate -- --env production
```

### Step 5: Start Services

```bash
# Start production server
npm start -- --env production

# Expected output:
# 🚀 Initializing Production Environment
# 📝 Initializing Audit Logger
# 💾 Initializing Cache Manager
# 📊 Initializing Monitoring
# ✅ Production environment initialized successfully
# 🎧 Server listening on port 3000

# In another terminal, monitor logs
tail -f logs/production.log
```

### Step 6: Health Checks

```bash
# Check server health
curl -s http://localhost:3000/health | jq

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-01-28T20:51:03.000Z",
#   "uptime": 5.234,
#   "services": {
#     "database": "connected",
#     "cache": "connected",
#     "intelligence": "ready"
#   }
# }

# Check intelligence engine
curl -s http://localhost:3000/api/intelligence/health | jq

# Expected response:
# {
#   "status": "ready",
#   "engines": 14,
#   "cache": "active",
#   "audit": "active"
# }

# Check database
curl -s http://localhost:3000/api/intelligence/audit-logs?limit=1 | jq

# Expected response: array of audit logs
```

### Step 7: Load Testing (Optional but Recommended)

```bash
# Simple load test with 10 concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/intelligence/analyze-profile \
    -H "Content-Type: application/json" \
    -d '{"id":"vet_'$i'","conditions":[{"name":"PTSD"}]}' &
done
wait

# Monitor response times
# Check logs for errors
grep ERROR logs/production.log | head -20

# Monitor with ab (Apache Bench)
ab -n 100 -c 10 http://localhost:3000/health
```

---

## 📊 Post-Deployment Verification

### Verify Core Functionality

```bash
# 1. Analyze profile
curl -X POST http://localhost:3000/api/intelligence/analyze-profile \
  -H "Content-Type: application/json" \
  -d '{
    "id":"vet_test_001",
    "militaryHistory":{"branch":"Army","rank":"E-5"},
    "conditions":[{"name":"PTSD","rating":50}]
  }'

# Expected: Complete analysis with all engine results

# 2. Predict benefits
curl -X POST http://localhost:3000/api/intelligence/predict-benefits \
  -H "Content-Type: application/json" \
  -d '{"id":"vet_test_001","rating":50}'

# Expected: Array of eligible benefits with amounts

# 3. Optimize claims
curl -X POST http://localhost:3000/api/intelligence/optimize-claims \
  -H "Content-Type: application/json" \
  -d '{"id":"vet_test_001","conditions":[{"name":"PTSD"}]}'

# Expected: Claims strategy with recommendations

# 4. Check audit logs
curl -s http://localhost:3000/api/intelligence/audit-logs | jq '.records | length'

# Expected: > 0
```

### Monitor Key Metrics

```bash
# Response Times
tail -f logs/production.log | grep "RESPONSE_TIME"

# Error Rates
tail -f logs/production.log | grep ERROR | wc -l

# Database Connections
psql -d rally_forge_prod -c "SELECT count(*) FROM pg_stat_activity;"

# Cache Performance
redis-cli INFO stats | grep -E "hits|misses"
```

### Check Integration Points

```bash
# Dashboard Integration (if configured)
curl http://localhost:3000/dashboard-api/intelligence

# Benefits Page (if configured)
curl http://localhost:3000/benefits-api/intelligence

# Claims Page (if configured)
curl http://localhost:3000/claims-api/intelligence

# Each should return 200 OK with relevant data
```

---

## ⚠️ Rollback Procedures

### If Deployment Fails

```bash
# Option 1: Database Rollback
npm run db:rollback -- --env production --backup backups/audit_logs_backup_2026-01-28T20-51-03.json

# Option 2: Application Rollback
git revert HEAD~1
npm run build
npm start -- --env production

# Option 3: Complete Rollback
# - Stop current deployment
# - Restore from previous deployment package
# - Run previous stable version
docker pull rally-forge:v4.9
docker run -d rally-forge:v4.9
```

### Verification After Rollback

```bash
# Confirm health
curl http://localhost:3000/health

# Check database state
psql -d rally_forge_prod -c "SELECT COUNT(*) FROM audit_logs;"

# Verify no data loss
npm run db:verify -- --backup backups/audit_logs_backup_2026-01-28T20-51-03.json
```

---

## 📈 Performance Baseline

After deployment, establish baseline metrics:

```bash
# Response Times (should be < 2s for P99)
tail -f logs/production.log | grep RESPONSE_TIME | sort -t: -k2 -n | tail -100

# Error Rate (should be < 0.1%)
echo "scale=2; $(grep ERROR logs/production.log | wc -l) / $(grep -c . logs/production.log) * 100" | bc

# Cache Hit Rate (should be > 70%)
redis-cli INFO stats | grep hit_rate

# Database Performance
psql -d rally_forge_prod -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Log to monitoring system
curl -X POST https://api.datadoghq.com/api/v1/series \
  -H "DD-API-KEY: $DATADOG_API_KEY" \
  -d '{
    "series": [{
      "metric": "rally_forge.performance.response_time",
      "points": [[1643381463, 1.234]],
      "type": "gauge"
    }]
  }'
```

---

## 🔍 Monitoring & Alerting

### Key Metrics to Monitor

```typescript
// In your monitoring dashboard, track:
Metrics = {
  // Performance
  "api.response_time.p50": < 500ms,
  "api.response_time.p95": < 1500ms,
  "api.response_time.p99": < 2000ms,

  // Errors
  "errors.rate": < 0.001,
  "errors.count": growing? -> investigate,

  // Database
  "database.connections": < 45,
  "database.query_time.avg": < 200ms,
  "database.query_time.p99": < 1000ms,

  // Cache
  "cache.hit_rate": > 0.7,
  "cache.evictions": monitor,

  // Intelligence Engine
  "intelligence.analysis_time": < 5000ms,
  "intelligence.cache_efficiency": monitor,

  // Business Metrics
  "benefits.predictions.count": increasing,
  "claims.optimizations.count": increasing,
  "users.active": monitor
}
```

### Set Up Alerts

```bash
# Alert on high error rate
# Alert if response time P99 > 3 seconds
# Alert if database connections > 40
# Alert if cache hit rate < 50%
# Alert if API is down (3 failed health checks)
```

---

## 📚 Support Resources

### Documentation
- [Phase 5 Complete Documentation](./PHASE_5_COMPLETE_DOCUMENTATION.md)
- [Architecture Guide](./PLATFORM_ARCHITECTURE_REBUILD.md)
- [Intelligence Engine Reference](./SCANNER_DEVELOPER_REFERENCE.md)

### Logs Location
- Application: `logs/production.log`
- Database: Check PostgreSQL logs
- Cache: Check Redis logs
- Monitoring: Datadog dashboard

### Emergency Contacts
- DevOps Lead: [contact]
- Database Admin: [contact]
- Backend Lead: [contact]

---

## ✅ Deployment Sign-Off

- [ ] All checks passed
- [ ] Tests successful
- [ ] Health checks passing
- [ ] Performance baseline established
- [ ] Monitoring active
- [ ] Rollback plan ready
- [ ] Team notified

**Deployed by**: _________
**Date**: ________________
**Version**: 5.0
**Status**: ✅ Production Ready

---

## 🎉 Success Indicators

After deployment, you should see:

✅ Zero deployment errors
✅ All health checks green
✅ Response times < 2s (P99)
✅ Error rate < 0.1%
✅ Cache hit rate > 70%
✅ Database healthy
✅ All 14 engines operational
✅ Audit logging active
✅ Notifications sending
✅ Users can access UI panels

**If you see all green lights, deployment is successful!** 🚀


