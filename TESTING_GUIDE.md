# Emperia — Complete Testing Guide

Follow these 12 steps in order to test the full app end-to-end.

---

## Step 1: Firebase Console Setup

### 1A. Enable Authentication Providers

1. Go to [Firebase Console](https://console.firebase.google.com/) → Select **emperia-8d4ab**
2. Navigate to **Build → Authentication → Sign-in method** tab
3. Enable **two** providers:

| Provider | How to Enable |
|---|---|
| **Email/Password** | Click it → Toggle **Enable** → Save |
| **Google** | Click it → Toggle **Enable** → Set your support email → Save |

> ⚠️ Both providers MUST be enabled or the login/register pages will throw errors.

### 1B. Create Firestore Database

1. Go to **Build → Firestore Database**
2. If not already created, click **Create database**
3. Choose **Start in test mode** (we'll tighten rules later)
4. Select the nearest region (e.g., `us-central1`)

### 1C. Set Firestore Security Rules

Go to **Firestore → Rules** tab and paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events: anyone can read, auth users can write
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users: can read/write own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tickets: auth users can read, only server (Admin SDK) writes
    match /tickets/{ticketId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click **Publish**.

> 💡 For quick testing, you can temporarily use `allow read, write: if true;` instead.

### 1D. Pre-Create Firestore Index (optional)

The **My Tickets** page queries tickets by `userId` + `createdAt`. Firestore will auto-prompt you:

- When you first visit `/tickets`, check the **browser console** (F12 → Console tab)
- If you see an index error, it will include a **clickable link** — click it to auto-create the index
- Wait ~2 minutes for the index to build

Or manually create it:
1. Go to **Firestore → Indexes → Composite**
2. Collection: `tickets`
3. Fields: `userId` (Ascending), `createdAt` (Descending)
4. Click **Create**

---

## Step 2: Start the Dev Server

Open a terminal in `c:\Users\micro\Documents\emperia`:

```bash
npm run dev
```

App will be at: **http://localhost:3000**

---

## Step 3: Register Your First Account

1. Go to **http://localhost:3000/register**
2. Options:
   - Enter Name + Email + Password (min 6 chars) → Click **Create Account**
   - OR click **Sign up with Google**
3. You'll be redirected to `/events` after success

### ✅ Verify:
- **Firebase Console → Authentication → Users** tab: Your user should appear
- **Firebase Console → Firestore → `users` collection**: A document with your UID as ID, containing `role: "customer"`

---

## Step 4: Promote Yourself to Admin

1. Go to **Firebase Console → Firestore Database**
2. Click on the **`users`** collection
3. Click on your user document (the one with your UID)
4. Find the `role` field → Click the **pencil/edit** icon
5. Change the value from `"customer"` to `"admin"`
6. Click **Update** / **Save**

```
role: "customer"  →  role: "admin"
```

7. Go back to your browser → **Hard refresh** with `Ctrl + Shift + R`
8. The navbar should now show a purple **"Admin"** link

---

## Step 5: Create Test Events

1. Click **Admin** in the navbar → **Manage Events** → **+ New Event**
2. Create 3 events using this data:

### Event 1:
| Field | Value |
|---|---|
| Event Name | `Taylor Swift — The Eras Tour` |
| Description | `An exclusive VIP experience with private suites, curated cocktails, and panoramic stage views.` |
| Venue | `SoFi Stadium` |
| City | `Inglewood, CA` |
| Date | `Nov 26, 2024 at 8:00 PM PST` |
| Price (USD) | `375.00` |
| Capacity | `500` |
| Tier Label | `VIP` |

### Event 2:
| Field | Value |
|---|---|
| Event Name | `Drake — It's All A Blur` |
| Description | `Madison Square Garden's most anticipated residency with backstage access and premium hospitality.` |
| Venue | `Madison Square Garden` |
| City | `New York City` |
| Date | `Aug 8-10, 2024 at 9:00 PM EST` |
| Price (USD) | `250.00` |
| Capacity | `300` |
| Tier Label | `PLATINUM` |

### Event 3:
| Field | Value |
|---|---|
| Event Name | `The Weeknd — After Hours Til Dawn` |
| Description | `An immersive stadium experience with exclusive Obsidian tier access and commemorative merchandise.` |
| Venue | `US Bank Stadium` |
| City | `Minneapolis, MN` |
| Date | `July 12, 2024 at 7:30 PM CST` |
| Price (USD) | `450.00` |
| Capacity | `200` |
| Tier Label | `OBSIDIAN` |

### ✅ Verify:
- Go to **http://localhost:3000/events** — you should see 3 event cards with gradient backgrounds
- Click any card to see the detail page

---

## Step 6: Start Stripe Webhook Listener

Open a **second terminal** (keep the dev server running in the first):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output something like:
```
> Ready! Your webhook signing secret is whsec_abc123...
```

### ⚠️ Important: Update the Webhook Secret

1. Copy the `whsec_...` value from the output
2. Open `.env.local` in your project
3. Update the `STRIPE_WEBHOOK_SECRET` line:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_abc123...  ← paste the new value
   ```
4. **Restart the dev server** (`Ctrl+C` in the first terminal, then `npm run dev` again)

> Keep the `stripe listen` terminal running for the entire testing session.

---

## Step 7: Make a Test Purchase

1. Go to **http://localhost:3000/events** → Click on any event
2. On the event detail page, find the **"Secure Your Spot"** card on the right
3. Click **Proceed to Payment**
4. The Stripe payment form will appear
5. Enter this test card:

| Field | Value |
|---|---|
| Card Number | `4242 4242 4242 4242` |
| Expiry | `12/34` (any future date) |
| CVC | `123` (any 3 digits) |
| Name | Anything |
| ZIP/Postal | `12345` (any 5 digits) |

6. Click **Pay Now**
7. You should be redirected to the **Payment Confirmed** page

### ✅ Verify in Stripe CLI terminal:
```
payment_intent.succeeded [evt_xxx]
[200] POST http://localhost:3000/api/webhooks/stripe
```

### ✅ Verify in Firebase Console:
- **Firestore → `tickets` collection**: New document with `status: "active"` and a `qr_uuid`
- **Firestore → `events` → your event**: `ticketsSold` should now be `1`

### Other Test Cards:

| Card Number | What Happens |
|---|---|
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 3220` | ⚠️ Requires 3D Secure popup |
| `4000 0000 0000 9995` | ❌ Payment declined |

---

## Step 8: View Your Tickets

1. Click **My Tickets** in the navbar (or go to `/tickets`)
2. Your purchased ticket should appear with:
   - Small QR code preview
   - Event name
   - Green **ACTIVE** badge
3. Click the ticket to open the full view at `/tickets/{ticketId}`:
   - Large QR code
   - Ticket tear-line design (like a physical ticket)
   - Venue, date, amount paid

---

## Step 9: Test the QR Scanner

1. Go to `/scanner` (or Admin → Dashboard → Scan Tickets)
2. You need the **QR UUID** — get it from either:
   - The ticket detail page (visible in as part of the QR data)
   - **Firebase Console → Firestore → tickets → [your ticket doc] → `qr_uuid` field**
3. Paste the UUID into the **"Manual Entry"** input
4. Click **Scan**
5. ✅ First scan: Green message → `✓ Ticket verified — Taylor Swift — The Eras Tour`
6. ❌ Scan again: Red message → `Already scanned at [timestamp]`

### ✅ Verify in Firebase Console:
- Ticket document: `status` changed from `"active"` to `"scanned"`
- `scannedAt` field is now populated with a timestamp

---

## Step 10: Check Confirmation Email

> **Note about Resend free tier:** With the default `onboarding@resend.dev` sender, emails are only delivered to the email address you used to sign up for Resend. To send to any email, you need to verify your own domain in Resend.

1. Check the inbox of your Resend account email
2. You should get an email from **"Emperia Experiences"** with:
   - Your QR UUID
   - Event name, venue, date
   - Dark-themed HTML design

### If no email arrived:
- Check [resend.com/emails](https://resend.com/emails) for delivery logs
- Look for errors in the dev server terminal output
- The email is non-blocking — payment still succeeds even if email fails

---

## Step 11: Test Auth Protection

Log out (click Sign Out in navbar) and try visiting these URLs:

| URL | Expected Behavior When Logged Out |
|---|---|
| `/` | ✅ Loads normally (public) |
| `/events` | ✅ Loads normally (public) |
| `/events/{id}` | ✅ Loads but checkout says "Sign in to purchase" |
| `/tickets` | 🔒 Redirects to `/login` |
| `/tickets/{id}` | 🔒 Redirects to `/login` |
| `/admin` | 🔒 Redirects to `/login` |
| `/admin/events` | 🔒 Redirects to `/login` |
| `/scanner` | 🔒 Redirects to `/login` |

Also test: log in as a **non-admin** user and try `/admin` — you should be redirected to `/`.

---

## Step 12: Test Mobile Menu

1. Open Chrome DevTools (`F12`) → Toggle device toolbar (`Ctrl+Shift+M`)
2. Select a mobile preset (e.g., iPhone 14 Pro)
3. The navbar should show a hamburger menu (two lines)
4. Click it → Full-screen overlay menu with staggered animation
5. Links should work and menu should close on selection

---

## Quick Troubleshooting

| Problem | Solution |
|---|---|
| White/blank page | Check browser console (F12) for errors |
| Firebase error on load | Restart dev server so `.env.local` reloads |
| "No events yet" on Events page | Create events via Admin panel first (Step 5) |
| Checkout doesn't load | Ensure Stripe CLI listener is running (Step 6) |
| Webhook returns 400 | Update `STRIPE_WEBHOOK_SECRET` in `.env.local` (Step 6) |
| Tickets page empty after purchase | Wait 2-3s for webhook, then refresh. Check Stripe CLI output |
| Admin link not in navbar | Set `role: "admin"` in Firestore, then hard-refresh (`Ctrl+Shift+R`) |
| Firestore permission denied | Check your security rules (Step 1C) |
| Email not received | Check Resend dashboard; free tier only sends to your verified email |
| Composite index error | Click the link in browser console to auto-create it |
| "Module not found" | Run `npm install` to ensure all deps are installed |
