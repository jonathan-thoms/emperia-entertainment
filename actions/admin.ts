"use server";

import { adminDb } from "@/lib/firebase-admin";

// ── Types ────────────────────────────────────────────────────────────────────────
export interface DashboardMetrics {
  totalRevenue: number;       // in cents
  ticketsSold: number;
  activeEvents: number;
  scanRate: number;           // percentage
  occupancy: { scanned: number; total: number };
  chartData: { day: string; tickets: number; revenue: number }[];
  recentActivity: {
    id: string;
    action: string;
    detail: string;
    time: string;
    type: "purchase" | "scan" | "override" | "event";
  }[];
}

export interface TicketRecord {
  id: string;
  buyerEmail: string;
  buyerName: string;
  eventName: string;
  eventId: string;
  tier: string;
  status: "active" | "scanned" | "revoked" | "expired";
  purchasedAt: string;
  priceCents: number;
}

// ── Fetch Dashboard Metrics ──────────────────────────────────────────────────────
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    // Fetch all events
    const eventsSnap = await adminDb.collection("events").get();
    const events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Fetch all tickets
    const ticketsSnap = await adminDb.collection("tickets").get();
    const tickets = ticketsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Fetch recent audit logs
    const logsSnap = await adminDb
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    // ── Compute metrics ──────────────────────────────────────────────────────
    const totalRevenue = tickets.reduce(
      (sum, t) => sum + ((t as Record<string, unknown>).priceCents as number || 0),
      0
    );

    const ticketsSold = tickets.length;

    // Active events = events with dates in the future
    const now = new Date();
    const activeEvents = events.filter((e) => {
      const dateStr = (e as Record<string, unknown>).date as string;
      return dateStr ? new Date(dateStr) >= now : false;
    }).length;

    // Scan rate
    const scannedTickets = tickets.filter(
      (t) => (t as Record<string, unknown>).status === "scanned"
    ).length;
    const scanRate = ticketsSold > 0 ? Math.round((scannedTickets / ticketsSold) * 100) : 0;

    // Occupancy
    const occupancy = { scanned: scannedTickets, total: ticketsSold };

    // ── Chart data (last 7 days) ─────────────────────────────────────────────
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartData: { day: string; tickets: number; revenue: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayTickets = tickets.filter((t) => {
        const rec = t as Record<string, unknown>;
        const purchased = rec.purchasedAt;
        if (!purchased) return false;

        // Handle both Firestore Timestamp and Date
        let purchaseDate: Date;
        if (purchased && typeof purchased === "object" && "toDate" in (purchased as object)) {
          purchaseDate = (purchased as { toDate: () => Date }).toDate();
        } else if (purchased instanceof Date) {
          purchaseDate = purchased;
        } else {
          purchaseDate = new Date(purchased as string);
        }

        return purchaseDate >= d && purchaseDate < nextD;
      });

      const dayRevenue = dayTickets.reduce(
        (sum, t) => sum + ((t as Record<string, unknown>).priceCents as number || 0),
        0
      );

      chartData.push({
        day: days[d.getDay()],
        tickets: dayTickets.length,
        revenue: Math.round(dayRevenue / 100),
      });
    }

    // ── Recent activity (from audit logs + recent tickets) ───────────────────
    const recentActivity = logsSnap.docs.map((doc) => {
      const data = doc.data();
      const action = data.action as string;
      const timestamp = data.timestamp;

      let timeStr = "";
      if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
        timeStr = formatRelativeTime(timestamp.toDate());
      } else if (timestamp instanceof Date) {
        timeStr = formatRelativeTime(timestamp);
      }

      let type: "purchase" | "scan" | "override" | "event" = "event";
      if (action === "MANUAL_STATUS_OVERRIDE") type = "override";
      else if (action === "ROLE_CHANGED") type = "override";
      else if (action === "EVENT_CREATED") type = "event";

      return {
        id: doc.id,
        action: formatActionLabel(action),
        detail: (data.details as string) || "",
        time: timeStr,
        type,
      };
    });

    return {
      totalRevenue,
      ticketsSold,
      activeEvents,
      scanRate,
      occupancy,
      chartData,
      recentActivity,
    };
  } catch (err) {
    console.error("[fetchDashboardMetrics]", err);
    // Return safe defaults on error
    return {
      totalRevenue: 0,
      ticketsSold: 0,
      activeEvents: 0,
      scanRate: 0,
      occupancy: { scanned: 0, total: 0 },
      chartData: [],
      recentActivity: [],
    };
  }
}

// ── Fetch All Tickets ────────────────────────────────────────────────────────────
export async function fetchAllTickets(): Promise<TicketRecord[]> {
  try {
    const snap = await adminDb
      .collection("tickets")
      .orderBy("createdAt", "desc")
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();

      // Handle purchasedAt timestamp
      let purchasedAt = "";
      if (data.purchasedAt) {
        if (typeof data.purchasedAt === "object" && "toDate" in data.purchasedAt) {
          purchasedAt = data.purchasedAt.toDate().toISOString();
        } else if (data.purchasedAt instanceof Date) {
          purchasedAt = data.purchasedAt.toISOString();
        } else {
          purchasedAt = String(data.purchasedAt);
        }
      }

      return {
        id: doc.id,
        buyerEmail: (data.buyerEmail as string) || "",
        buyerName: (data.buyerName as string) || "Unknown",
        eventName: (data.eventName as string) || "Unknown Event",
        eventId: (data.eventId as string) || "",
        tier: (data.tier as string) || "General",
        status: (data.status as TicketRecord["status"]) || "active",
        purchasedAt,
        priceCents: (data.priceCents as number) || 0,
      };
    });
  } catch (err) {
    console.error("[fetchAllTickets]", err);
    return [];
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────────
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatActionLabel(action: string): string {
  const map: Record<string, string> = {
    MANUAL_STATUS_OVERRIDE: "Status override",
    ROLE_CHANGED: "Role changed",
    EVENT_CREATED: "Event created",
  };
  return map[action] || action;
}
