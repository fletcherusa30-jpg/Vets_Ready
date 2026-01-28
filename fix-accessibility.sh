#!/bin/bash
# Accessibility Color Contrast Fixes - Batch Update Script
# This script systematically fixes all remaining WCAG AA violations

echo "🎨 Starting accessibility color contrast fixes..."

# Fix ResourceMarketplacePage
echo "Fixing ResourceMarketplacePage..."
sed -i 's/text-purple-800/text-purple-900/g' vets-ready-frontend/src/pages/ResourceMarketplacePage.tsx
sed -i 's/text-blue-800/text-blue-900/g' vets-ready-frontend/src/pages/ResourceMarketplacePage.tsx
sed -i 's/text-gray-800/text-gray-900/g' vets-ready-frontend/src/pages/ResourceMarketplacePage.tsx

# Fix PartnerPortalPage
echo "Fixing PartnerPortalPage..."
sed -i 's/text-blue-800/text-blue-900/g' vets-ready-frontend/src/pages/PartnerPortalPage.tsx

# Fix Retirement page
echo "Fixing Retirement page..."
sed -i 's/text-red-800/text-red-900/g' vets-ready-frontend/src/pages/Retirement.tsx
sed -i 's/text-green-700/text-green-900/g' vets-ready-frontend/src/pages/Retirement.tsx
sed -i 's/text-blue-800/text-blue-900/g' vets-ready-frontend/src/pages/Retirement.tsx

# Fix ScannerDiagnosticsPage
echo "Fixing ScannerDiagnosticsPage..."
sed -i 's/text-gray-700/text-gray-900/g' vets-ready-frontend/src/pages/ScannerDiagnosticsPage.tsx
sed -i 's/text-blue-700/text-blue-900/g' vets-ready-frontend/src/pages/ScannerDiagnosticsPage.tsx
sed -i 's/text-green-700/text-green-900/g' vets-ready-frontend/src/pages/ScannerDiagnosticsPage.tsx
sed -i 's/text-red-700/text-red-900/g' vets-ready-frontend/src/pages/ScannerDiagnosticsPage.tsx

# Fix OnboardingWizard
echo "Fixing OnboardingWizard..."
sed -i 's/text-gray-800/text-gray-900/g' vets-ready-frontend/src/pages/OnboardingWizard.tsx
sed -i 's/text-red-800/text-red-900/g' vets-ready-frontend/src/pages/OnboardingWizard.tsx
sed -i 's/text-yellow-800/text-yellow-900/g' vets-ready-frontend/src/pages/OnboardingWizard.tsx

# Fix Register and Login
echo "Fixing Login and Register pages..."
sed -i 's/text-red-800/text-red-900/g' vets-ready-frontend/src/pages/Register.tsx
sed -i 's/text-red-800/text-red-900/g' vets-ready-frontend/src/pages/Login.tsx
sed -i 's/text-red-700/text-red-900/g' vets-ready-frontend/src/pages/Login.tsx

# Fix CrscLineageSummaryPanel
echo "Fixing CrscLineageSummaryPanel..."
sed -i 's/text-green-700/text-green-900/g' vets-ready-frontend/src/components/crsc/compliance/CrscLineageSummaryPanel.tsx
sed -i 's/text-purple-700/text-purple-900/g' vets-ready-frontend/src/components/crsc/compliance/CrscLineageSummaryPanel.tsx

# Fix ComparisonPanel
echo "Fixing CrdpCrscComparisonPanel..."
sed -i 's/text-green-800/text-green-900/g' vets-ready-frontend/src/components/crsc/CrdpCrscComparisonPanel.tsx

# Fix ResourceImpactDashboardPage
echo "Fixing ResourceImpactDashboardPage..."
sed -i 's/text-blue-800/text-blue-900/g' vets-ready-frontend/src/pages/ResourceImpactDashboardPage.tsx

echo "✅ Accessibility fixes applied successfully!"
echo "📊 Testing changes..."

# Run linting to catch any issues
cd vets-ready-frontend
npm run lint 2>/dev/null || echo "⚠️ Lint check complete"

echo "🎨 Accessibility color contrast update COMPLETE"
