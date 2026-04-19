"use server";

import { adminDb } from "@/lib/firebase-admin";

// ── Types ────────────────────────────────────────────────────────────────────────
export interface AuditLogRecord {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  actionLabel: string;
  targetId: string;
  timestamp: string;
  details: string;
}

// ── Action Label Map ─────────────────────────────────────────────────────────────
const ACTION_LABELS: Record<string, string> = {
  MANUAL_STATUS_OVERRIDE: "Ticket Status Override",
  ROLE_CHANGED: "User Role Changed",
  EVENT_CREATED: "Event Created",
  EVENT_UPDATED: "Event Updated",
  EVENT_DELETED: "Event Deleted",
};

// ── Fetch All Audit Logs ─────────────────────────────────────────────────────────
export async function fetchAuditLogs(): Promise<AuditLogRecord[]> {
  try {
    const snap = await adminDb
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(200)
      .get();

    // Build a set of unique admin IDs to resolve emails
    const adminIds = new Set<string>();
    snap.docs.forEach((doc) => {
      const adminId = doc.data().adminId as string;
      if (adminId) adminIds.add(adminId);
    });

    // Batch-fetch admin user docs for email resolution
    const adminMap = new Map<string, string>();
    for (const uid of adminIds) {
      try {
        const userDoc = await adminDb.collection("users").doc(uid).get();
        if (userDoc.exists) {
          adminMap.set(uid, (userDoc.data()?.email as string) || uid);
        }
      } catch {
        // If user doc doesn't exist, we'll just show the UID
      }
    }

    return snap.docs.map((doc) => {
      const data = doc.data();

      let timestamp = "";
      if (data.timestamp) {
        if (typeof data.timestamp === "object" && "toDate" in data.timestamp) {
          timestamp = data.timestamp.toDate().toISOString();
        } else if (data.timestamp instanceof Date) {
          timestamp = data.timestamp.toISOString();
        } else {
          timestamp = String(data.timestamp);
        }
      }

      const action = (data.action as string) || "";

      return {
        id: doc.id,
        adminId: (data.adminId as string) || "",
        adminEmail: adminMap.get(data.adminId as string) || (data.adminId as string) || "Unknown",
        action,
        actionLabel: ACTION_LABELS[action] || action,
        targetId: (data.targetId as string) || "",
        timestamp,
        details: (data.details as string) || "",
      };
    });
  } catch (err) {
    console.error("[fetchAuditLogs]", err);
    return [];
  }
}
