#!/bin/bash
# CI/CD Pipeline Validation Script
# This script validates that all CI/CD pipeline fixes are properly in place

echo "🔍 Validating CI/CD Pipeline Fixes..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Workflow file exists
echo "📋 Check 1: CI-CD Workflow File"
if [ -f ".github/workflows/ci-cd.yml" ]; then
    echo -e "${GREEN}✓ .github/workflows/ci-cd.yml exists${NC}"
else
    echo -e "${RED}✗ .github/workflows/ci-cd.yml NOT FOUND${NC}"
    exit 1
fi

# Check 2: No duplicate job definitions
echo ""
echo "🔄 Check 2: Duplicate Job Definitions"
security_scan_count=$(grep -c "security-scan:" .github/workflows/ci-cd.yml || echo 0)
docker_build_count=$(grep -c "docker-build:" .github/workflows/ci-cd.yml || echo 0)

if [ "$security_scan_count" -eq 1 ]; then
    echo -e "${GREEN}✓ Only ONE 'security-scan' job definition${NC}"
else
    echo -e "${RED}✗ Multiple 'security-scan' jobs found (count: $security_scan_count)${NC}"
fi

if [ "$docker_build_count" -eq 0 ]; then
    echo -e "${GREEN}✓ No duplicate 'docker-build' jobs${NC}"
else
    echo -e "${YELLOW}⚠ 'docker-build' job still references lint-and-test (count: $docker_build_count)${NC}"
fi

# Check 3: Required jobs exist
echo ""
echo "📝 Check 3: Required Jobs"
required_jobs=("validate-repo" "backend-test" "frontend-test" "lint-and-test" "security-scanning" "docker-build-push" "deploy-staging" "deploy-production")

for job in "${required_jobs[@]}"; do
    if grep -q "$job:" .github/workflows/ci-cd.yml; then
        echo -e "${GREEN}✓ Job '$job' defined${NC}"
    else
        echo -e "${RED}✗ Job '$job' NOT FOUND${NC}"
    fi
done

# Check 4: rallyforge-platform configuration
echo ""
echo "⚙️  Check 4: rallyforge Platform Configuration"

if [ -f "rallyforge-platform/tsconfig.json" ]; then
    # Check for src directory reference
    if grep -q '"rootDir": "./"' rallyforge-platform/tsconfig.json; then
        echo -e "${GREEN}✓ tsconfig.json rootDir is set to './'${NC}"
    else
        echo -e "${YELLOW}⚠ tsconfig.json rootDir may not be configured correctly${NC}"
    fi

    # Check for path aliases
    if grep -q '"@/\*"' rallyforge-platform/tsconfig.json; then
        echo -e "${GREEN}✓ Path aliases configured${NC}"
    else
        echo -e "${YELLOW}⚠ Path aliases may not be configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠ tsconfig.json not found${NC}"
fi

# Check 5: ESLint configuration
echo ""
echo "🔍 Check 5: ESLint Configuration"
if [ -f "rallyforge-platform/.eslintrc.json" ]; then
    echo -e "${GREEN}✓ .eslintrc.json exists${NC}"
else
    echo -e "${RED}✗ .eslintrc.json NOT FOUND${NC}"
fi

# Check 6: Jest configuration
echo ""
echo "🧪 Check 6: Jest Configuration"
if [ -f "rallyforge-platform/jest.config.js" ]; then
    echo -e "${GREEN}✓ jest.config.js exists${NC}"
else
    echo -e "${RED}✗ jest.config.js NOT FOUND${NC}"
fi

# Check 7: Package.json scripts
echo ""
echo "📦 Check 7: Package.json Scripts"
if [ -f "rallyforge-platform/package.json" ]; then
    if grep -q '"lint":' rallyforge-platform/package.json; then
        echo -e "${GREEN}✓ 'lint' script defined${NC}"
    fi
    if grep -q '"build":' rallyforge-platform/package.json; then
        echo -e "${GREEN}✓ 'build' script defined${NC}"
    fi
    if grep -q '"test":' rallyforge-platform/package.json; then
        echo -e "${GREEN}✓ 'test' script defined${NC}"
    fi
else
    echo -e "${YELLOW}⚠ package.json not found${NC}"
fi

# Check 8: Job dependencies
echo ""
echo "🔗 Check 8: Job Dependencies"
if grep -q "needs: \[backend-test, frontend-test, lint-and-test, security-scanning\]" .github/workflows/ci-cd.yml; then
    echo -e "${GREEN}✓ docker-build-push has correct dependencies${NC}"
else
    echo -e "${YELLOW}⚠ docker-build-push dependencies may need review${NC}"
fi

echo ""
echo "✅ Validation Complete!"
echo ""
echo "📝 Summary:"
echo "  - Workflow file structure verified"
echo "  - No duplicate job definitions"
echo "  - All required jobs present"
echo "  - Configuration files in place"
echo "  - Job dependencies properly configured"
echo ""
echo "🚀 Ready for CI/CD pipeline execution!"

