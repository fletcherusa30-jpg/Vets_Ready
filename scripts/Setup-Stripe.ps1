#Requires -Version 5.1
<#
.SYNOPSIS
    Stripe configuration automation helper

.DESCRIPTION
    Helps automate Stripe setup by:
    - Validating Stripe CLI installation
    - Creating products and prices via Stripe CLI
    - Configuring webhook endpoints
    - Testing webhook events
    - Generating .env configuration

.EXAMPLE
    .\Setup-Stripe.ps1
    .\Setup-Stripe.ps1 -TestMode
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$TestMode = $true,

    [Parameter(Mandatory=$false)]
    [switch]$CreateProducts,

    [Parameter(Mandatory=$false)]
    [switch]$ConfigureWebhook
)

$ErrorActionPreference = 'Stop'
$RootPath = Split-Path -Parent $PSScriptRoot

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           VETS READY - STRIPE SETUP HELPER                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check for Stripe CLI
Write-Host "🔍 Checking for Stripe CLI..." -ForegroundColor Cyan
$stripeCLI = Get-Command stripe -ErrorAction SilentlyContinue

if (-not $stripeCLI) {
    Write-Host "  ℹ️  Stripe CLI not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📥 Install Stripe CLI:" -ForegroundColor Cyan
    Write-Host "   Option 1: Scoop (Windows)" -ForegroundColor White
    Write-Host "     scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git" -ForegroundColor Gray
    Write-Host "     scoop install stripe" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Option 2: Direct Download" -ForegroundColor White
    Write-Host "     https://github.com/stripe/stripe-cli/releases" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   After installation, run: stripe login" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "  ✓ Stripe CLI found: $($stripeCLI.Source)" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    SETUP INSTRUCTIONS                       " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Product Definitions
$products = @{
    veteran = @(
        @{name="Vets Ready - Pro (Yearly)"; price=2000; interval="year"; tier="PRO"}
        @{name="Vets Ready - Family (Yearly)"; price=3500; interval="year"; tier="FAMILY"}
        @{name="Vets Ready - Lifetime"; price=20000; interval="one_time"; tier="LIFETIME"}
    )
    employer = @(
        @{name="Employer - Basic"; price=29900; interval="month"; tier="BASIC"}
        @{name="Employer - Premium"; price=59900; interval="month"; tier="PREMIUM"}
        @{name="Employer - Recruiting"; price=249900; interval="month"; tier="RECRUITING"}
        @{name="Employer - Enterprise"; price=999900; interval="month"; tier="ENTERPRISE"}
    )
    business = @(
        @{name="Business Listing - Basic"; price=9900; interval="month"; tier="BASIC"}
        @{name="Business Listing - Featured"; price=29900; interval="month"; tier="FEATURED"}
        @{name="Business Listing - Premium"; price=99900; interval="month"; tier="PREMIUM"}
        @{name="Business Listing - Advertising"; price=299900; interval="month"; tier="ADVERTISING"}
    )
}

Write-Host "📋 STEP 1: Create Stripe Account & Login" -ForegroundColor Cyan
Write-Host "   1. Go to https://dashboard.stripe.com" -ForegroundColor White
Write-Host "   2. Create an account (or login)" -ForegroundColor White
Write-Host "   3. Switch to Test Mode (toggle in top-right)" -ForegroundColor Yellow
Write-Host "   4. Run: stripe login" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter when ready to continue"

Write-Host ""
Write-Host "📦 STEP 2: Create Products in Stripe Dashboard" -ForegroundColor Cyan
Write-Host ""

Write-Host "   VETERAN SUBSCRIPTIONS (3 products):" -ForegroundColor Green
foreach ($product in $products.veteran) {
    $displayPrice = if ($product.interval -eq "one_time") { "`$$($product.price/100)" } else { "`$$($product.price/100)/$($product.interval)" }
    Write-Host "   • $($product.name): $displayPrice" -ForegroundColor White
}

Write-Host ""
Write-Host "   EMPLOYER SUBSCRIPTIONS (4 products):" -ForegroundColor Green
foreach ($product in $products.employer) {
    Write-Host "   • $($product.name): `$$($product.price/100)/$($product.interval)" -ForegroundColor White
}

Write-Host ""
Write-Host "   BUSINESS SUBSCRIPTIONS (4 products):" -ForegroundColor Green
foreach ($product in $products.business) {
    Write-Host "   • $($product.name): `$$($product.price/100)/$($product.interval)" -ForegroundColor White
}

Write-Host ""
Write-Host "   📝 For each product:" -ForegroundColor Yellow
Write-Host "      1. Go to https://dashboard.stripe.com/test/products" -ForegroundColor White
Write-Host "      2. Click '+ Add product'" -ForegroundColor White
Write-Host "      3. Enter name and price" -ForegroundColor White
Write-Host "      4. Set billing period (one-time or recurring)" -ForegroundColor White
Write-Host "      5. Click 'Save product'" -ForegroundColor White
Write-Host "      6. Copy the Price ID (starts with 'price_')" -ForegroundColor Yellow
Write-Host ""

if ($stripeCLI -and $CreateProducts) {
    Write-Host "   🚀 Auto-creating products with Stripe CLI..." -ForegroundColor Cyan

    $envUpdates = @()

    foreach ($category in $products.Keys) {
        Write-Host "   Creating $category products..." -ForegroundColor Yellow

        foreach ($product in $products[$category]) {
            try {
                # Create product
                $productCmd = "stripe products create --name='$($product.name)' --description='Vets Ready - $($product.tier)'"
                $productResult = Invoke-Expression $productCmd | ConvertFrom-Json

                # Create price
                if ($product.interval -eq "one_time") {
                    $priceCmd = "stripe prices create --product=$($productResult.id) --unit-amount=$($product.price) --currency=usd"
                } else {
                    $priceCmd = "stripe prices create --product=$($productResult.id) --unit-amount=$($product.price) --currency=usd --recurring[interval]=$($product.interval)"
                }
                $priceResult = Invoke-Expression $priceCmd | ConvertFrom-Json

                Write-Host "   ✓ Created: $($product.name) → $($priceResult.id)" -ForegroundColor Green

                # Store for .env update
                $varName = "STRIPE_PRICE_" + $category.ToUpper() + "_" + $product.tier.ToUpper()
                if ($category -eq "veteran" -and $product.interval -eq "year") {
                    $varName += "_YEARLY"
                }
                $envUpdates += "$varName=$($priceResult.id)"

            } catch {
                Write-Host "   ✗ Failed: $($product.name) - $_" -ForegroundColor Red
            }
        }
    }

    Write-Host ""
    Write-Host "   📝 Add these to your .env file:" -ForegroundColor Yellow
    foreach ($update in $envUpdates) {
        Write-Host "      $update" -ForegroundColor White
    }
}

Read-Host "Press Enter when all products are created"

Write-Host ""
Write-Host "🔑 STEP 3: Get API Keys" -ForegroundColor Cyan
Write-Host "   1. Go to https://dashboard.stripe.com/test/apikeys" -ForegroundColor White
Write-Host "   2. Copy 'Publishable key' (starts with 'pk_test_')" -ForegroundColor White
Write-Host "   3. Reveal and copy 'Secret key' (starts with 'sk_test_')" -ForegroundColor White
Write-Host ""

Write-Host "   Add to .env file:" -ForegroundColor Yellow
Write-Host "      STRIPE_SECRET_KEY=sk_test_..." -ForegroundColor White
Write-Host "      STRIPE_PUBLISHABLE_KEY=pk_test_..." -ForegroundColor White
Write-Host ""
Read-Host "Press Enter when API keys are added to .env"

Write-Host ""
Write-Host "🔗 STEP 4: Configure Webhook" -ForegroundColor Cyan
Write-Host "   1. Go to https://dashboard.stripe.com/test/webhooks" -ForegroundColor White
Write-Host "   2. Click '+ Add endpoint'" -ForegroundColor White
Write-Host "   3. Endpoint URL: https://your-domain.com/stripe/webhook" -ForegroundColor Yellow
Write-Host "      (For local testing, use ngrok: https://ngrok.io)" -ForegroundColor Gray
Write-Host "   4. Select events to listen to:" -ForegroundColor White
Write-Host "      • customer.subscription.created" -ForegroundColor White
Write-Host "      • customer.subscription.updated" -ForegroundColor White
Write-Host "      • customer.subscription.deleted" -ForegroundColor White
Write-Host "      • invoice.paid" -ForegroundColor White
Write-Host "      • invoice.payment_failed" -ForegroundColor White
Write-Host "      • payment_intent.succeeded" -ForegroundColor White
Write-Host "      • payment_intent.payment_failed" -ForegroundColor White
Write-Host "   5. Click 'Add endpoint'" -ForegroundColor White
Write-Host "   6. Copy 'Signing secret' (starts with 'whsec_')" -ForegroundColor Yellow
Write-Host ""

Write-Host "   Add to .env file:" -ForegroundColor Yellow
Write-Host "      STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor White
Write-Host ""

if ($stripeCLI -and $ConfigureWebhook) {
    Write-Host "   🚀 Starting local webhook listener..." -ForegroundColor Cyan
    Write-Host "   This will forward Stripe events to http://localhost:8000/stripe/webhook" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Keep this running in a separate terminal:" -ForegroundColor Yellow
    Write-Host "      stripe listen --forward-to localhost:8000/stripe/webhook" -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter when webhook is configured"

Write-Host ""
Write-Host "✅ STEP 5: Verify Configuration" -ForegroundColor Cyan

# Check .env file
$envFile = Join-Path $RootPath '.env'
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw

    $checks = @{
        "STRIPE_SECRET_KEY" = $envContent -match "STRIPE_SECRET_KEY=sk_"
        "STRIPE_PUBLISHABLE_KEY" = $envContent -match "STRIPE_PUBLISHABLE_KEY=pk_"
        "STRIPE_WEBHOOK_SECRET" = $envContent -match "STRIPE_WEBHOOK_SECRET=whsec_"
        "Veteran Pro Price" = $envContent -match "STRIPE_PRICE_VETERAN_PRO_YEARLY=price_"
        "Employer Basic Price" = $envContent -match "STRIPE_PRICE_EMPLOYER_BASIC=price_"
        "Business Basic Price" = $envContent -match "STRIPE_PRICE_BUSINESS_BASIC=price_"
    }

    Write-Host "   Configuration Status:" -ForegroundColor White
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "   ✓ $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $($check.Key)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ⚠ .env file not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "                    SETUP COMPLETE! 🎉                       " -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run deployment: .\scripts\Deploy-VetsReady.ps1" -ForegroundColor White
Write-Host "   2. Test payment flow at http://localhost:3000" -ForegroundColor White
Write-Host "   3. Monitor webhooks in Stripe Dashboard" -ForegroundColor White
Write-Host ""

Write-Host "💡 Testing Tips:" -ForegroundColor Cyan
Write-Host "   • Use test card: 4242 4242 4242 4242" -ForegroundColor White
Write-Host "   • Any future expiry date" -ForegroundColor White
Write-Host "   • Any 3-digit CVC" -ForegroundColor White
Write-Host "   • Trigger events: stripe trigger payment_intent.succeeded" -ForegroundColor White
Write-Host ""
