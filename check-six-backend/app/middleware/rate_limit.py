"""Rate limiting middleware for API protection"""
from typing import Callable
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
import asyncio

class RateLimiter:
    """Simple in-memory rate limiter (use Redis in production)"""

    def __init__(self):
        self.requests = defaultdict(list)
        self.lock = asyncio.Lock()

    async def is_allowed(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> bool:
        """Check if request is allowed under rate limit"""
        async with self.lock:
            now = time.time()
            window_start = now - window_seconds

            # Remove old requests
            self.requests[key] = [
                req_time for req_time in self.requests[key]
                if req_time > window_start
            ]

            # Check if under limit
            if len(self.requests[key]) >= max_requests:
                return False

            # Add current request
            self.requests[key].append(now)
            return True

    async def cleanup_old_keys(self, max_age_seconds: int = 3600):
        """Periodically clean up old keys to prevent memory leak"""
        async with self.lock:
            now = time.time()
            keys_to_delete = [
                key for key, requests in self.requests.items()
                if not requests or max(requests) < now - max_age_seconds
            ]
            for key in keys_to_delete:
                del self.requests[key]


# Global rate limiter instance
rate_limiter = RateLimiter()


# Rate limit tiers
RATE_LIMITS = {
    "anonymous": {
        "requests_per_minute": 10,
        "requests_per_hour": 100,
    },
    "free": {
        "requests_per_minute": 30,
        "requests_per_hour": 500,
    },
    "pro": {
        "requests_per_minute": 60,
        "requests_per_hour": 2000,
    },
    "premium": {
        "requests_per_minute": 120,
        "requests_per_hour": 5000,
    },
}


async def rate_limit_middleware(request: Request, call_next: Callable):
    """Rate limiting middleware"""

    # Get client identifier (IP or user ID)
    client_ip = request.client.host if request.client else "unknown"
    user_id = None
    tier = "anonymous"

    # Extract user from token if authenticated
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            # Import here to avoid circular dependency
            from app.utils.security import verify_token as decode_access_token
            token = auth_header.split("Bearer ")[1]
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            tier = payload.get("tier", "free")
        except:
            pass

    # Use user ID if authenticated, otherwise IP
    rate_key = f"user:{user_id}" if user_id else f"ip:{client_ip}"

    # Get rate limits for tier
    limits = RATE_LIMITS.get(tier, RATE_LIMITS["anonymous"])

    # Check minute limit
    minute_key = f"{rate_key}:minute"
    if not await rate_limiter.is_allowed(
        minute_key,
        limits["requests_per_minute"],
        60
    ):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "Rate limit exceeded. Too many requests per minute.",
                "retry_after": 60
            },
            headers={"Retry-After": "60"}
        )

    # Check hour limit
    hour_key = f"{rate_key}:hour"
    if not await rate_limiter.is_allowed(
        hour_key,
        limits["requests_per_hour"],
        3600
    ):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "Rate limit exceeded. Too many requests per hour.",
                "retry_after": 3600
            },
            headers={"Retry-After": "3600"}
        )

    # Add rate limit headers
    response = await call_next(request)
    response.headers["X-RateLimit-Limit-Minute"] = str(limits["requests_per_minute"])
    response.headers["X-RateLimit-Limit-Hour"] = str(limits["requests_per_hour"])
    response.headers["X-RateLimit-Remaining-Minute"] = str(
        limits["requests_per_minute"] - len(rate_limiter.requests.get(minute_key, []))
    )

    return response


# Background task to cleanup old rate limit keys
async def cleanup_rate_limiter():
    """Background task to prevent memory leaks"""
    while True:
        await asyncio.sleep(3600)  # Run every hour
        await rate_limiter.cleanup_old_keys()
