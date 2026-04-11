"use server";

import { db } from "@/lib/firebase";
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

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

    const eventRef = doc(collection(db, "events"));
    await setDoc(eventRef, {
      ...input,
      ticketsSold: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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

    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      ...input,
      updatedAt: serverTimestamp(),
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

    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);

    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteEvent]", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete event." };
  }
}
