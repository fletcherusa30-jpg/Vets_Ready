from fastapi import Header, HTTPException, status, Depends
from app.config import settings
from app.middleware.rate_limit import rate_limiter
from typing import Optional, List
import os, json

# Simple audit log (PII-free) with JSONL durability
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'enterprise_api_audit.jsonl')
api_audit_log: List[dict] = []


def _ensure_dir():
    folder = os.path.dirname(DATA_FILE)
    os.makedirs(folder, exist_ok=True)


def _append_audit(entry: dict):
    _ensure_dir()
    api_audit_log.append(entry)
    with open(DATA_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(entry) + "\n")


def _load_audit():
    _ensure_dir()
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    api_audit_log.append(json.loads(line.strip()))
                except Exception:
                    continue


_load_audit()

async def require_enterprise_auth(
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
    x_org_role: str = Header(..., alias="X-Org-Role"),
    x_org_id: str | None = Header(default=None, alias="X-Org-Id"),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
):
    token_valid = False
    if authorization and authorization.lower().startswith("bearer "):
        bearer = authorization.split(" ")[1]
        token_valid = bearer in settings.enterprise_oauth_tokens

    if not token_valid:
        if not x_api_key or x_api_key not in settings.enterprise_api_keys:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key or token",
            )
    if x_org_role not in settings.enterprise_allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient role",
        )

    # Apply per-organization rate limiting using org or key
    rate_key = f"enterprise:{x_org_id or x_api_key}"
    minute_allowed = await rate_limiter.is_allowed(rate_key + ":minute", settings.enterprise_rate_limit_per_minute, 60)
    hour_allowed = await rate_limiter.is_allowed(rate_key + ":hour", settings.enterprise_rate_limit_per_hour, 3600)
    if not minute_allowed or not hour_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded for enterprise consumer",
        )

    _append_audit(
        {
            "event": "ENTERPRISE_GATEWAY_ACCESS",
            "role": x_org_role,
            "orgId": x_org_id,
            "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
        }
    )

    return {
        "org_role": x_org_role,
        "org_id": x_org_id,
        "api_key": x_api_key,
    }


async def get_api_audit_log(limit: int = 200):
    return api_audit_log[-limit:]
