"use server";

import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// ── Stripe SDK (server-side only) ──────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

// ── Standardised response shape (per coding-skills §3) ────────────────────────
type ActionResult =
  | { success: true; clientSecret: string }
  | { success: false; error: string };

/**
 * createCheckoutSession
 *
 * Called when a user clicks "Buy Ticket".
 *  1. Fetches the event doc from Firestore to read the price.
 *  2. Creates a Stripe PaymentIntent with the amount + metadata.
 *  3. Returns the client_secret so the frontend can render the Payment Element.
 *
 * @param eventId  – Firestore document ID of the event
 * @param userId   – Authenticated user's UID
 * @param quantity – Number of tickets (defaults to 1)
 */
export async function createCheckoutSession(
  eventId: string,
  userId: string,
  quantity: number = 1
): Promise<ActionResult> {
  try {
    // ── 1. Validate inputs ───────────────────────────────────────────────────
    if (!eventId || !userId) {
      return { success: false, error: "Missing eventId or userId." };
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return { success: false, error: "Quantity must be a positive integer." };
    }

    // ── 2. Look up event in Firestore ────────────────────────────────────────
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return { success: false, error: "Event not found." };
    }

    const eventData = eventSnap.data();

    // Ensure the event has a valid price (stored in cents)
    const unitPriceCents: number | undefined = eventData.priceCents;
    if (typeof unitPriceCents !== "number" || unitPriceCents <= 0) {
      return { success: false, error: "Event does not have a valid price." };
    }

    // Capacity guard – prevent over-selling
    const totalCapacity: number | undefined = eventData.total_capacity;
    const ticketsSold: number = eventData.ticketsSold ?? 0;

    if (
      typeof totalCapacity === "number" &&
      ticketsSold + quantity > totalCapacity
    ) {
      return {
        success: false,
        error: "Not enough tickets remaining for this event.",
      };
    }

    // ── 3. Create Stripe PaymentIntent ───────────────────────────────────────
    const totalAmountCents = unitPriceCents * quantity;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        eventId,
        userId,
        ticketQuantity: String(quantity),
        eventName: (eventData.name as string) ?? "Unknown Event",
      },
    });

    if (!paymentIntent.client_secret) {
      return {
        success: false,
        error: "Stripe did not return a client secret.",
      };
    }

    // ── 4. Return the client_secret to the frontend ──────────────────────────
    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (err: unknown) {
    console.error("[createCheckoutSession] Error:", err);

    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
