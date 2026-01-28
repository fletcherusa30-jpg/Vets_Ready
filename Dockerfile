# VetsReady Backend - Multi-stage Dockerfile
# Phase 3 - DevOps Implementation

# ============================================================================
# Stage 1: Base Python Image
# ============================================================================
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ============================================================================
# Stage 2: Dependencies
# ============================================================================
FROM base as dependencies

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# ============================================================================
# Stage 3: Application
# ============================================================================
FROM dependencies as application

# Copy application code
COPY backend/ ./backend/
COPY config/ ./config/
COPY uploads/ ./uploads/

# Create necessary directories
RUN mkdir -p /app/uploads/archive \
    /app/uploads/certificates \
    /app/uploads/resumes \
    /app/uploads/temp \
    /app/uploads/str/raw_uploads \
    /app/uploads/str/processing \
    /app/uploads/str/extracted \
    /app/uploads/str/failed \
    /app/uploads/str/archive

# Set permissions
RUN chmod -R 755 /app/uploads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health', timeout=5)"

# Run application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
