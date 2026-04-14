"use server";

import { adminDb } from "@/lib/firebase-admin";

type ActionResult = { success: true; id?: string } | { success: false; error: string };

interface EventInput {
  name: string;
  description: string;
  venue: string;
  city: string;
  date: string;
  priceCents: number;
  total_capacity: number;
  tier?: string;
}

export async function createEvent(input: EventInput): Promise<ActionResult> {
  try {
    if (!input.name || !input.venue || !input.priceCents || !input.total_capacity) {
      return { success: false, error: "Missing required fields." };
    }

    const eventRef = adminDb.collection("events").doc();
    await eventRef.set({
      ...input,
      ticketsSold: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, id: eventRef.id };
  } catch (err: unknown) {
    console.error("[createEvent]", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to create event." };
  }
}

export async function updateEvent(eventId: string, input: Partial<EventInput>): Promise<ActionResult> {
  try {
    if (!eventId) return { success: false, error: "Missing eventId." };

    const eventRef = adminDb.collection("events").doc(eventId);
    await eventRef.update({
      ...input,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("[updateEvent]", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update event." };
  }
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  try {
    if (!eventId) return { success: false, error: "Missing eventId." };

    const eventRef = adminDb.collection("events").doc(eventId);
    await eventRef.delete();

    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteEvent]", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete event." };
  }
}
