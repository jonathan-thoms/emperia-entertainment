"use server";

import { adminDb } from "@/lib/firebase-admin";

// ── Types ────────────────────────────────────────────────────────────────────────
type ActionResult = { success: true } | { success: false; error: string };

export type TicketStatus = "active" | "scanned" | "revoked" | "expired";

// ── Override Ticket Status ───────────────────────────────────────────────────────
// Uses a Firebase batch write to atomically update the ticket AND write an
// audit log entry, ensuring data consistency per the admin-dashboard-directive.
// ─────────────────────────────────────────────────────────────────────────────────
export async function overrideTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  previousStatus: string,
  adminId: string
): Promise<ActionResult> {
  try {
    if (!ticketId || !newStatus || !adminId) {
      return { success: false, error: "Missing required fields." };
    }

    const validStatuses: TicketStatus[] = ["active", "scanned", "revoked", "expired"];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: `Invalid status: ${newStatus}` };
    }

    const batch = adminDb.batch();

    // 1. Update the ticket document
    const ticketRef = adminDb.collection("tickets").doc(ticketId);
    batch.update(ticketRef, {
      status: newStatus,
      updatedAt: new Date(),
      lastModifiedBy: adminId,
    });

    // 2. Write an audit log entry
    const auditRef = adminDb.collection("audit_logs").doc();
    batch.set(auditRef, {
      adminId,
      action: "MANUAL_STATUS_OVERRIDE",
      targetId: ticketId,
      timestamp: new Date(),
      details: `Changed ticket ${ticketId} status from "${previousStatus}" to "${newStatus}"`,
    });

    // Commit atomically
    await batch.commit();

    return { success: true };
  } catch (err: unknown) {
    console.error("[overrideTicketStatus]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to override ticket status.",
    };
  }
}
