"use server";

import { adminDb } from "@/lib/firebase-admin";

type ActionResult =
  | { success: true; ticket?: Record<string, unknown> }
  | { success: false; error: string };

export async function validateAndScanTicket(qrUuid: string): Promise<ActionResult> {
  try {
    if (!qrUuid) return { success: false, error: "No QR code provided." };

    // Look up ticket by qr_uuid
    const ticketsRef = adminDb.collection("tickets");
    const snap = await ticketsRef.where("qr_uuid", "==", qrUuid).limit(1).get();

    if (snap.empty) {
      return { success: false, error: "Invalid ticket. No matching QR code found." };
    }

    const ticketDoc = snap.docs[0];
    const ticket = ticketDoc.data();

    // Check status
    if (ticket.status === "scanned") {
      return {
        success: false,
        error: `Already scanned${ticket.scannedAt ? ` at ${ticket.scannedAt.toDate().toLocaleString()}` : ""}.`,
      };
    }

    if (ticket.status === "refunded") {
      return { success: false, error: "This ticket has been refunded and is no longer valid." };
    }

    if (ticket.status !== "active") {
      return { success: false, error: `Invalid ticket status: ${ticket.status}` };
    }

    // Mark as scanned
    await ticketDoc.ref.update({
      status: "scanned",
      scannedAt: new Date(),
    });

    return {
      success: true,
      ticket: {
        id: ticketDoc.id,
        eventName: ticket.eventName,
        userId: ticket.userId,
        status: "scanned",
      },
    };
  } catch (err: unknown) {
    console.error("[validateAndScanTicket]", err);
    return { success: false, error: err instanceof Error ? err.message : "Scan failed." };
  }
}
