# Stripe Integration Notes

Sources reviewed on 20 August 2026:

- Stripe Checkout Session creation: <https://docs.stripe.com/api/checkout/sessions/create>
- Stripe webhook handling: <https://docs.stripe.com/webhooks>

The planned integration will create a hosted Checkout Session in `payment` mode with server-derived line items, a success and cancel URL, and internal order metadata. Stripe documents `line_items` as required for payment-mode sessions.

Order payment confirmation must not trust the browser redirect. The server will validate the `Stripe-Signature` against the raw request body and a Stripe webhook endpoint signing secret. It will then handle `checkout.session.completed` (and, where appropriate, asynchronous payment success events) idempotently to mark the associated internal order as paid and confirmed. The route must respond with a 2xx status promptly after safe processing.

The required store-owner setup values are a Stripe secret API key, publishable key if Elements is ever used, and webhook signing secret. The webhook endpoint must be registered in the Stripe Dashboard against the deployed HTTPS store URL.
