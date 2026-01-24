"""Stripe payment integration service"""

import stripe
from typing import Dict, Optional, List
from datetime import datetime
from decimal import Decimal

from app.config import settings

# Initialize Stripe with API key
stripe.api_key = settings.stripe_secret_key


class StripeService:
    """Service for handling Stripe payment operations"""

    @staticmethod
    def create_customer(email: str, name: str, metadata: Dict = None) -> stripe.Customer:
        """Create a Stripe customer"""
        return stripe.Customer.create(
            email=email,
            name=name,
            metadata=metadata or {}
        )

    @staticmethod
    def create_veteran_subscription(
        customer_id: str,
        price_id: str,
        metadata: Dict = None
    ) -> stripe.Subscription:
        """Create a veteran subscription (Pro, Family, or Lifetime)"""
        return stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
            metadata=metadata or {},
            payment_behavior="default_incomplete",
            payment_settings={"save_default_payment_method": "on_subscription"},
            expand=["latest_invoice.payment_intent"]
        )

    @staticmethod
    def create_lifetime_payment(
        customer_id: str,
        amount: int,  # Amount in cents
        metadata: Dict = None
    ) -> stripe.PaymentIntent:
        """Create a one-time payment for lifetime subscription"""
        return stripe.PaymentIntent.create(
            customer=customer_id,
            amount=amount,
            currency="usd",
            payment_method_types=["card"],
            metadata=metadata or {},
            description="Vets Ready Lifetime Subscription"
        )

    @staticmethod
    def create_employer_subscription(
        customer_id: str,
        price_id: str,
        quantity: int = 1,
        metadata: Dict = None
    ) -> stripe.Subscription:
        """Create an employer subscription (Basic, Premium, Recruiting, Enterprise)"""
        return stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id, "quantity": quantity}],
            metadata=metadata or {},
            payment_behavior="default_incomplete",
            payment_settings={"save_default_payment_method": "on_subscription"},
            expand=["latest_invoice.payment_intent"]
        )

    @staticmethod
    def create_business_subscription(
        customer_id: str,
        price_id: str,
        metadata: Dict = None
    ) -> stripe.Subscription:
        """Create a business directory subscription"""
        return stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
            metadata=metadata or {},
            payment_behavior="default_incomplete",
            payment_settings={"save_default_payment_method": "on_subscription"},
            expand=["latest_invoice.payment_intent"]
        )

    @staticmethod
    def cancel_subscription(subscription_id: str, at_period_end: bool = True) -> stripe.Subscription:
        """Cancel a subscription"""
        if at_period_end:
            return stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
        else:
            return stripe.Subscription.cancel(subscription_id)

    @staticmethod
    def update_subscription(
        subscription_id: str,
        new_price_id: str,
        proration_behavior: str = "create_prorations"
    ) -> stripe.Subscription:
        """Update a subscription to a new price tier"""
        subscription = stripe.Subscription.retrieve(subscription_id)

        return stripe.Subscription.modify(
            subscription_id,
            items=[{
                "id": subscription["items"]["data"][0].id,
                "price": new_price_id,
            }],
            proration_behavior=proration_behavior
        )

    @staticmethod
    def create_invoice(
        customer_id: str,
        items: List[Dict],
        description: str = None,
        metadata: Dict = None
    ) -> stripe.Invoice:
        """Create a one-time invoice"""
        # Add invoice items
        for item in items:
            stripe.InvoiceItem.create(
                customer=customer_id,
                amount=item["amount"],
                currency="usd",
                description=item.get("description", "")
            )

        # Create and finalize invoice
        invoice = stripe.Invoice.create(
            customer=customer_id,
            description=description,
            metadata=metadata or {},
            auto_advance=True
        )

        invoice.finalize_invoice()
        return invoice

    @staticmethod
    def retrieve_subscription(subscription_id: str) -> stripe.Subscription:
        """Retrieve subscription details"""
        return stripe.Subscription.retrieve(subscription_id)

    @staticmethod
    def retrieve_customer(customer_id: str) -> stripe.Customer:
        """Retrieve customer details"""
        return stripe.Customer.retrieve(customer_id)

    @staticmethod
    def list_customer_subscriptions(customer_id: str) -> List[stripe.Subscription]:
        """List all subscriptions for a customer"""
        subscriptions = stripe.Subscription.list(customer=customer_id)
        return subscriptions.data

    @staticmethod
    def create_payment_method(
        card_number: str,
        exp_month: int,
        exp_year: int,
        cvc: str
    ) -> stripe.PaymentMethod:
        """Create a payment method (for testing/development)"""
        return stripe.PaymentMethod.create(
            type="card",
            card={
                "number": card_number,
                "exp_month": exp_month,
                "exp_year": exp_year,
                "cvc": cvc,
            },
        )

    @staticmethod
    def attach_payment_method(
        payment_method_id: str,
        customer_id: str
    ) -> stripe.PaymentMethod:
        """Attach a payment method to a customer"""
        payment_method = stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer_id
        )

        # Set as default payment method
        stripe.Customer.modify(
            customer_id,
            invoice_settings={"default_payment_method": payment_method_id}
        )

        return payment_method

    @staticmethod
    def verify_webhook_signature(
        payload: bytes,
        signature: str,
        webhook_secret: str
    ) -> stripe.Event:
        """Verify and parse webhook event"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
            return event
        except ValueError:
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid signature")

    @staticmethod
    def handle_webhook_event(event: stripe.Event) -> Dict:
        """Process webhook events from Stripe"""
        event_type = event["type"]
        data = event["data"]["object"]

        handlers = {
            "customer.subscription.created": StripeService._handle_subscription_created,
            "customer.subscription.updated": StripeService._handle_subscription_updated,
            "customer.subscription.deleted": StripeService._handle_subscription_deleted,
            "invoice.paid": StripeService._handle_invoice_paid,
            "invoice.payment_failed": StripeService._handle_invoice_payment_failed,
            "payment_intent.succeeded": StripeService._handle_payment_succeeded,
            "payment_intent.payment_failed": StripeService._handle_payment_failed,
        }

        handler = handlers.get(event_type)
        if handler:
            return handler(data)

        return {"status": "unhandled", "event_type": event_type}

    @staticmethod
    def _handle_subscription_created(subscription: Dict) -> Dict:
        """Handle subscription creation"""
        return {
            "status": "subscription_created",
            "subscription_id": subscription["id"],
            "customer_id": subscription["customer"],
            "status_value": subscription["status"]
        }

    @staticmethod
    def _handle_subscription_updated(subscription: Dict) -> Dict:
        """Handle subscription update"""
        return {
            "status": "subscription_updated",
            "subscription_id": subscription["id"],
            "customer_id": subscription["customer"],
            "status_value": subscription["status"]
        }

    @staticmethod
    def _handle_subscription_deleted(subscription: Dict) -> Dict:
        """Handle subscription cancellation"""
        return {
            "status": "subscription_deleted",
            "subscription_id": subscription["id"],
            "customer_id": subscription["customer"]
        }

    @staticmethod
    def _handle_invoice_paid(invoice: Dict) -> Dict:
        """Handle successful invoice payment"""
        return {
            "status": "invoice_paid",
            "invoice_id": invoice["id"],
            "customer_id": invoice["customer"],
            "amount_paid": invoice["amount_paid"]
        }

    @staticmethod
    def _handle_invoice_payment_failed(invoice: Dict) -> Dict:
        """Handle failed invoice payment"""
        return {
            "status": "invoice_payment_failed",
            "invoice_id": invoice["id"],
            "customer_id": invoice["customer"],
            "amount_due": invoice["amount_due"]
        }

    @staticmethod
    def _handle_payment_succeeded(payment_intent: Dict) -> Dict:
        """Handle successful payment"""
        return {
            "status": "payment_succeeded",
            "payment_intent_id": payment_intent["id"],
            "customer_id": payment_intent.get("customer"),
            "amount": payment_intent["amount"]
        }

    @staticmethod
    def _handle_payment_failed(payment_intent: Dict) -> Dict:
        """Handle failed payment"""
        return {
            "status": "payment_failed",
            "payment_intent_id": payment_intent["id"],
            "customer_id": payment_intent.get("customer"),
            "error": payment_intent.get("last_payment_error", {}).get("message")
        }


# Pricing constants (map to Stripe Price IDs from settings)
VETERAN_PRICES = {
    "PRO": settings.stripe_price_veteran_pro_yearly,
    "FAMILY": settings.stripe_price_veteran_family_yearly,
    "LIFETIME": 20000,  # $200.00 in cents
}

EMPLOYER_PRICES = {
    "BASIC": settings.stripe_price_employer_basic,
    "PREMIUM": settings.stripe_price_employer_premium,
    "RECRUITING": settings.stripe_price_employer_recruiting,
    "ENTERPRISE": settings.stripe_price_employer_enterprise,
}

BUSINESS_PRICES = {
    "BASIC": settings.stripe_price_business_basic,
    "FEATURED": settings.stripe_price_business_featured,
    "PREMIUM": settings.stripe_price_business_premium,
    "ADVERTISING": settings.stripe_price_business_advertising,
}
