import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { randomUUID } from "crypto";

// ── Stripe SDK (server-side) ─────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ── Disable Next.js body parsing – Stripe needs the raw body for sig check ──
export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/stripe
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Read raw body & verify Stripe signature ─────────────────────────────
  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("[Stripe Webhook] Missing stripe-signature header.");
      return NextResponse.json(
        { error: "Missing stripe-signature header." },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // ── 2. Handle relevant events ──────────────────────────────────────────────
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
    }

    // Add more event types here as needed (e.g. refunds, disputes)
    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  // Stripe expects a 200 to mark the event as delivered
  return NextResponse.json({ received: true }, { status: 200 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Fulfillment: payment_intent.succeeded
// ─────────────────────────────────────────────────────────────────────────────
async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    const { metadata } = paymentIntent;

    // ── Validate required metadata ───────────────────────────────────────────
    const eventId = metadata?.eventId;
    const userId = metadata?.userId;
    const ticketQuantity = parseInt(metadata?.ticketQuantity ?? "1", 10);
    const eventName = metadata?.eventName ?? "Unknown Event";

    if (!eventId || !userId) {
      console.error(
        "[Stripe Webhook] PaymentIntent missing required metadata (eventId or userId).",
        { paymentIntentId: paymentIntent.id, metadata }
      );
      return;
    }

    // ── Idempotency guard: check if we already fulfilled this PI ─────────────
    const existingTickets = await adminDb
      .collection("tickets")
      .where("stripePaymentIntentId", "==", paymentIntent.id)
      .limit(1)
      .get();

    if (!existingTickets.empty) {
      console.log(
        `[Stripe Webhook] Ticket(s) already created for PI ${paymentIntent.id}. Skipping.`
      );
      return;
    }

    // ── Fetch event details for the email ────────────────────────────────────
    const eventDoc = await adminDb.collection("events").doc(eventId).get();
    const eventData = eventDoc.data() ?? {};
    const venue = (eventData.venue as string) ?? "Venue TBA";
    const date = (eventData.date as string) ?? "";

    // ── Create ticket documents ──────────────────────────────────────────────
    const batch = adminDb.batch();
    const ticketIds: string[] = [];
    const qrUuids: string[] = [];

    for (let i = 0; i < ticketQuantity; i++) {
      const ticketRef = adminDb.collection("tickets").doc();
      const qrUuid = randomUUID(); // Cryptographically secure UUIDv4

      batch.set(ticketRef, {
        eventId,
        userId,
        eventName,
        venue,
        date,
        stripePaymentIntentId: paymentIntent.id,
        qr_uuid: qrUuid,
        status: "active",
        scannedAt: null,
        createdAt: new Date(),
        amountPaid: paymentIntent.amount,
        currency: paymentIntent.currency,
      });

      ticketIds.push(ticketRef.id);
      qrUuids.push(qrUuid);
    }

    // ── Update the event's sold count ────────────────────────────────────────
    const eventRef = adminDb.collection("events").doc(eventId);
    const { FieldValue } = await import("firebase-admin/firestore");
    batch.update(eventRef, {
      ticketsSold: FieldValue.increment(ticketQuantity),
    });

    await batch.commit();

    console.log(
      `[Stripe Webhook] Fulfilled PI ${paymentIntent.id} → ${ticketIds.length} ticket(s) created:`,
      ticketIds
    );

    // ── Send confirmation email via Resend ──────────────────────────────────
    try {
      const userEmail = paymentIntent.receipt_email ?? metadata?.userEmail;

      if (userEmail) {
        const { sendTicketConfirmation } = await import("@/lib/resend");

        // Send one email per ticket (in case of multi-ticket purchases)
        for (let i = 0; i < ticketIds.length; i++) {
          await sendTicketConfirmation({
            to: userEmail,
            eventName,
            venue,
            date,
            qrUuid: qrUuids[i],
            ticketId: ticketIds[i],
          });
        }

        console.log(`[Stripe Webhook] Confirmation email sent to ${userEmail}`);
      } else {
        console.warn("[Stripe Webhook] No email found — skipping confirmation email.");
      }
    } catch (emailErr) {
      // Don't fail the whole webhook if email fails
      console.error("[Stripe Webhook] Email send error:", emailErr);
    }

  } catch (err: unknown) {
    console.error(
      "[Stripe Webhook] Error during fulfillment:",
      err instanceof Error ? err.message : err,
      { paymentIntentId: paymentIntent.id }
    );
    throw err;
  }
}
