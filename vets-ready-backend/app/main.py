"""
Vets Ready - Main FastAPI Application

The Ultimate Veteran-First Platform with:
- User authentication (JWT)
- Claims analysis with disability rating calculation
- Retirement planning and financial tools
- Veteran business directory
- Legal references (M21-1, 38 CFR)
- Job board (B2B revenue - employers pay, veterans free)
- Business directory listings (B2B revenue)
- Subscription management (veteran tiers)
- AI engine integration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

from app.database import init_db, engine, Base
from app.routers import (
    auth,
    conditions,
    claims,
    badges,
    theme,
    retirement,
    business,
    legal,
    subscriptions,
    employers,
    business_directory,
    payments,
    # referrals,  # Temporarily disabled due to import errors
    user_data,
    ai,  # New AI router
    scanners,  # Scanner service
    dd214,  # DD-214 extraction service
    revenue,  # ARDE revenue engine
    documents,  # Document upload MVP
    crsc_enterprise,  # CRSC Enterprise API Gateway
)
from app.routes import entitlement
from app.config import settings
from app.core.sentry import init_sentry
from app.middleware.rate_limit import rate_limit_middleware, cleanup_rate_limiter

# Configure logging
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

# Initialize Sentry
init_sentry()

# Initialize database tables (disabled for now - run migrations manually if needed)
# Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Vets Ready API",
    description="The Ultimate Veteran-First Platform - Benefits, Claims, Jobs, Business Directory",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Include routers - veteran features
app.include_router(auth.router)
app.include_router(ai.router)  # AI-powered claim assistance
app.include_router(scanners.router)  # Scanner service (STR, BOM, forensic, project)
app.include_router(dd214.router)  # DD-214 document extraction
app.include_router(conditions.router)
app.include_router(claims.router)
app.include_router(badges.router)
app.include_router(theme.router)
app.include_router(retirement.router)
app.include_router(business.router)
app.include_router(legal.router)

# Include routers - monetization (B2B)
app.include_router(subscriptions.router)
app.include_router(employers.router)
app.include_router(business_directory.router)
app.include_router(payments.router)

# Include routers - new features
# app.include_router(referrals.router)  # Temporarily disabled
app.include_router(user_data.router)
app.include_router(entitlement.router)  # Entitlement theory generator
app.include_router(ai.router)  # AI engine
app.include_router(scanners.router)  # Scanner service
app.include_router(dd214.router)  # DD-214 extraction
app.include_router(revenue.router)  # ARDE revenue engine
app.include_router(documents.router)  # Document upload MVP
app.include_router(crsc_enterprise.router)  # CRSC Enterprise API Gateway

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("Starting Vets Ready backend v1.0.0")
    # init_db()  # Temporarily disabled - DB not required for DD-214 scanner testing


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Vets Ready backend")


@app.get("/health", tags=["Health"])
async def health_check():
    """Service health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": settings.environment,
        "services": [
            "authentication",
            "claims-analysis",
            "retirement-planning",
            "veteran-business-directory",
            "legal-references",
            "badge-system",
            "theme-customization",
            "subscriptions",
            "employer-job-board",
            "business-directory-listings",
        ],
    }


@app.get("/", tags=["Root"])
async def root():
    """API root endpoint"""
    return {
        "message": "Vets Ready Backend API - The Ultimate Veteran-First Platform",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "features": {
            "benefits": "VBA and state benefits navigator",
            "claims": "Claim readiness and education",
            "business_directory": "Veteran-owned business directory (VOSB/SDVOSB)",
            "legal_references": "VA regulations (M21-1, 38 CFR Parts 3 & 4)",
            "organization_search": "Veteran support organizations database",
        },
        "main_endpoints": {
            "claims": "/api/claims/*",
            "retirement": "/api/retirement/*",
            "business": "/api/business/*",
            "legal": "/api/legal/*",
            "auth": "/api/auth/*",
        },
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
