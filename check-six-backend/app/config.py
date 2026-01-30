"""Configuration settings for Rally Forge backend"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    app_name: str = "Rally Forge"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True

    # Database
    database_url: str = "sqlite:///./instance/dev.db"

    # Security
    jwt_secret: str = "your-secret-key-change-in-production-min-32-chars"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    password_min_length: int = 8

    # CORS
    cors_origins: List[str] = [
        "http://localhost:5173",  # Vite frontend
        "http://localhost:3000",  # Mobile dev
        "http://localhost:3001",  # Desktop dev
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:5174",  # Vite fallback port
        "http://127.0.0.1:5174",
    ]

    # Stripe Payment Integration
    stripe_secret_key: str = "sk_test_placeholder"
    stripe_publishable_key: str = "pk_test_placeholder"
    stripe_webhook_secret: str = "whsec_placeholder"

    # Stripe Price IDs
    stripe_price_veteran_pro_yearly: str = "price_placeholder"
    stripe_price_veteran_family_yearly: str = "price_placeholder"
    stripe_price_veteran_lifetime: str = "price_placeholder"

    stripe_price_employer_basic: str = "price_placeholder"
    stripe_price_employer_premium: str = "price_placeholder"
    stripe_price_employer_recruiting: str = "price_placeholder"
    stripe_price_employer_enterprise: str = "price_placeholder"

    stripe_price_business_basic: str = "price_placeholder"
    stripe_price_business_featured: str = "price_placeholder"
    stripe_price_business_premium: str = "price_placeholder"
    stripe_price_business_advertising: str = "price_placeholder"

    # Enterprise API Gateway
    enterprise_api_keys: List[str] = []
    enterprise_allowed_roles: List[str] = ["ORG_ADMIN", "ANALYST", "SYSTEM"]
    enterprise_oauth_tokens: List[str] = []
    enterprise_rate_limit_per_minute: int = 120
    enterprise_rate_limit_per_hour: int = 3600

    # OCR and Document Processing
    poppler_path: str = r"C:\Dev\Rally Forge\App\poppler-25.12.0\Library\bin"  # Path to Poppler bin directory
    tesseract_path: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"  # Path to Tesseract executable
    google_vision_enabled: bool = False  # Enable Google Cloud Vision fallback
    ocr_timeout_seconds: int = 30  # Timeout for OCR operations

    # Logging
    log_level: str = "INFO"

    # Monitoring
    SENTRY_DSN: str = ""
    ENVIRONMENT: str = "development"

    # Features
    enable_ai_engine: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.environment == "development"


# Load settings from environment
settings = Settings()

