"""Stripe webhook handler router"""

from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
import logging

from app.config import settings
from app.services.stripe_service import StripeService

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature")
):
    """
    Handle Stripe webhook events

    This endpoint receives events from Stripe for:
    - Subscription changes (created, updated, deleted)
    - Payment confirmations
    - Invoice updates
    - Payment failures

    Stripe will send events to this webhook URL which must be:
    1. Configured in Stripe Dashboard
    2. Publicly accessible (use ngrok for local testing)
    3. Respond within 5 seconds
    """
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")

    # Get raw request body
    payload = await request.body()

    try:
        # Verify webhook signature
        event = StripeService.verify_webhook_signature(
            payload=payload,
            signature=stripe_signature,
            webhook_secret=settings.stripe_webhook_secret
        )

        logger.info(f"Received Stripe webhook event: {event['type']}")

        # Handle the event
        result = StripeService.handle_webhook_event(event)

        logger.info(f"Webhook processed: {result}")

        # TODO: Update database based on event type
        # - Update subscription status in rallyforge_veteran_subscriptions
        # - Update employer_accounts subscription status
        # - Create payment records in rallyforge_payments
        # - Update invoice status in rallyforge_invoices

        return {"received": True, "event_type": event["type"], "result": result}

    except ValueError as e:
        logger.error(f"Webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    """
    Create a Stripe Checkout session for subscription purchase

    Example request body:
    {
        "price_id": "price_xxx",
        "success_url": "https://app.rallyforge.com/success",
        "cancel_url": "https://app.rallyforge.com/cancel",
        "customer_email": "veteran@example.com",
        "metadata": {"user_id": "xxx", "tier": "PRO"}
    }
    """
    import stripe

    data = await request.json()

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": data["price_id"],
                "quantity": 1,
            }],
            mode="subscription" if data.get("mode") != "payment" else "payment",
            success_url=data["success_url"],
            cancel_url=data["cancel_url"],
            customer_email=data.get("customer_email"),
            metadata=data.get("metadata", {}),
            allow_promotion_codes=True,
        )

        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}

    except Exception as e:
        logger.error(f"Checkout session creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pricing/config")
async def get_pricing_config():
    """
    Get Stripe pricing configuration for frontend

    Returns publishable key and price IDs for all tiers
    """
    return {
        "publishable_key": settings.stripe_publishable_key,
        "veteran_prices": {
            "pro": settings.stripe_price_veteran_pro_yearly,
            "family": settings.stripe_price_veteran_family_yearly,
            "lifetime": settings.stripe_price_veteran_lifetime,
        },
        "employer_prices": {
            "basic": settings.stripe_price_employer_basic,
            "premium": settings.stripe_price_employer_premium,
            "recruiting": settings.stripe_price_employer_recruiting,
            "enterprise": settings.stripe_price_employer_enterprise,
        },
        "business_prices": {
            "basic": settings.stripe_price_business_basic,
            "featured": settings.stripe_price_business_featured,
            "premium": settings.stripe_price_business_premium,
            "advertising": settings.stripe_price_business_advertising,
        }
    }

