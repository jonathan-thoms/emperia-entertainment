# Project Name: Neon Ticketing Engine
# Goal: Build a high-performance, serverless event booking platform with a dedicated QR scanning app.

## Tech Stack & Constraints
- **Frontend Framework:** Next.js 14+ (Strictly use the App Router `/app`, NOT Pages router).
- **Styling:** Tailwind CSS + shadcn/ui for components.
- **Backend & Database:** Firebase (Firestore, Firebase Auth) + Next.js Server Actions.
- **Payments:** Stripe (Payment Element + Node.js SDK).
- **Emails:** Resend (Node.js SDK).
- **Venue Scanner:** Capacitor (wrapping a dedicated `/scanner` route).
- **Language:** TypeScript (Strict mode enabled).

## Core Database Schema (Firestore)
1. `/users/{userId}`: User profiles, roles (admin vs customer).
2. `/events/{eventId}`: Event details, date, venue, ticket tiers, total_capacity, price_id.
3. `/tickets/{ticketId}`: 
   - `eventId` (reference)
   - `userId` (reference)
   - `stripePaymentIntentId` (string, for auditing/refunds)
   - `qr_uuid` (string, cryptographically secure UUIDv4)
   - `status` (string: 'active', 'scanned', 'refunded')
   - `scannedAt` (timestamp, nullable)

## Architectural Rules
1. **Database Writes:** All sensitive database writes (creating tickets) MUST happen entirely server-side.
2. **Server Actions:** Use Next.js Server Actions for all data mutations (e.g., initiating checkout) rather than creating separate `/api` routes, except for the Stripe Webhook.
3. **QR Generation:** The `qr_uuid` must be generated using Node's `crypto.randomUUID()` on the server. Never generate this on the client.