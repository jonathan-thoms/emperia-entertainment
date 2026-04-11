# Stripe Integration Protocol (US Market Optimized)

## The 3-Step Checkout Flow
1. **Initiation (Server Action):** When a user clicks "Buy", a Next.js Server Action creates a Stripe `PaymentIntent`. 
   - You MUST pass `metadata` to the PaymentIntent including `eventId`, `userId`, and `ticketQuantity`. (This helps Stripe Radar prevent fraud).
   - Return the `client_secret` to the frontend.
2. **Capture (Client):** The frontend uses the Stripe `<Elements>` provider and the `client_secret` to render the Stripe Payment Element. The user enters their card securely.
3. **Fulfillment (Webhook):** We do NOT generate the ticket immediately after the frontend says "success". 
   - You must build a strictly typed Next.js API Route (`/api/webhooks/stripe`) to listen for the `payment_intent.succeeded` event.
   - Verify the Stripe signature.
   - Parse the `metadata`.
   - **Only then** generate the `qr_uuid`, write the ticket to Firestore, and trigger the Resend email.

## Fraud Prevention (Radar)
- Ensure the Stripe Payment Element is configured to collect zip codes (AVS matching) automatically.