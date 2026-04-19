/**
 * Firestore Seed Script — Admin Dashboard Demo Data
 *
 * Populates /events, /tickets, /users, and /audit_logs with realistic
 * sample data for development. Run with:
 *
 *   npx tsx scripts/seed-admin-data.ts
 *
 * To clear seeded data before re-seeding:
 *
 *   npx tsx scripts/seed-admin-data.ts --clear
 */

import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "dotenv";
import { randomUUID } from "crypto";
import { resolve } from "path";

// ── Load env ─────────────────────────────────────────────────────────────────
config({ path: resolve(__dirname, "../.env.local") });

const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
const privateKey = rawKey.replace(/\\n/g, "\n");

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
  privateKey,
};

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// ── Seed Data ────────────────────────────────────────────────────────────────

const EVENTS = [
  {
    name: "The Weeknd — After Hours",
    description: "An exclusive evening with The Weeknd performing his iconic After Hours album live.",
    venue: "SoFi Stadium",
    city: "Los Angeles",
    date: "2026-05-15",
    priceCents: 15000,
    total_capacity: 500,
    ticketsSold: 342,
    tier: "General",
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-04-10"),
  },
  {
    name: "Drake Night — Toronto",
    description: "Drake returns home for an unforgettable night of hits and surprises.",
    venue: "Scotiabank Arena",
    city: "Toronto",
    date: "2026-05-22",
    priceCents: 22000,
    total_capacity: 400,
    ticketsSold: 287,
    tier: "VIP Suite",
    createdAt: new Date("2026-03-05"),
    updatedAt: new Date("2026-04-12"),
  },
  {
    name: "Travis Scott — Utopia Tour",
    description: "The Utopia Tour makes its way through the desert for an epic outdoor show.",
    venue: "Desert Diamond Arena",
    city: "Phoenix",
    date: "2026-04-28",
    priceCents: 12000,
    total_capacity: 600,
    ticketsSold: 598,
    tier: "General",
    createdAt: new Date("2026-02-15"),
    updatedAt: new Date("2026-04-05"),
  },
  {
    name: "Summer Gala 2026",
    description: "Emperia's annual black-tie summer gala featuring live performances and curated dining.",
    venue: "The Ritz-Carlton Ballroom",
    city: "New York",
    date: "2026-06-20",
    priceCents: 45000,
    total_capacity: 200,
    ticketsSold: 78,
    tier: "Backstage",
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-16"),
  },
  {
    name: "Billie Eilish — Intimate Sessions",
    description: "A rare, acoustic set in an intimate venue. Limited to 150 guests.",
    venue: "The Wiltern",
    city: "Los Angeles",
    date: "2026-07-10",
    priceCents: 35000,
    total_capacity: 150,
    ticketsSold: 45,
    tier: "VIP Suite",
    createdAt: new Date("2026-04-10"),
    updatedAt: new Date("2026-04-17"),
  },
  {
    name: "Kendrick Lamar — DAMN. Anniversary",
    description: "Celebrating the anniversary of DAMN. with a full album performance.",
    venue: "Crypto.com Arena",
    city: "Los Angeles",
    date: "2026-08-14",
    priceCents: 18000,
    total_capacity: 450,
    ticketsSold: 92,
    tier: "General",
    createdAt: new Date("2026-04-14"),
    updatedAt: new Date("2026-04-18"),
  },
];

const USERS = [
  { uid: "user_001", email: "james.morrison@gmail.com", displayName: "James Morrison", photoURL: null, role: "customer", createdAt: new Date("2026-01-15") },
  { uid: "user_002", email: "sarah.chen@outlook.com", displayName: "Sarah Chen", photoURL: null, role: "customer", createdAt: new Date("2026-02-03") },
  { uid: "user_003", email: "mike.johnson@yahoo.com", displayName: "Mike Johnson", photoURL: null, role: "customer", createdAt: new Date("2026-02-18") },
  { uid: "user_004", email: "emma.williams@gmail.com", displayName: "Emma Williams", photoURL: null, role: "customer", createdAt: new Date("2026-03-01") },
  { uid: "user_005", email: "david.kim@hotmail.com", displayName: "David Kim", photoURL: null, role: "customer", createdAt: new Date("2026-03-10") },
  { uid: "user_006", email: "lisa.park@gmail.com", displayName: "Lisa Park", photoURL: null, role: "customer", createdAt: new Date("2026-03-22") },
  { uid: "user_007", email: "alex.rivera@icloud.com", displayName: "Alex Rivera", photoURL: null, role: "customer", createdAt: new Date("2026-04-02") },
  { uid: "user_008", email: "nina.patel@gmail.com", displayName: "Nina Patel", photoURL: null, role: "customer", createdAt: new Date("2026-04-08") },
  { uid: "user_009", email: "admin@emperia.io", displayName: "Emperia Admin", photoURL: null, role: "admin", createdAt: new Date("2026-01-01") },
  { uid: "user_010", email: "scanner@emperia.io", displayName: "Door Scanner", photoURL: null, role: "scanner", createdAt: new Date("2026-01-01") },
];

// Tickets will reference event IDs once created
function generateTickets(eventIds: string[]) {
  const tiers = ["General", "VIP Suite", "Backstage"];
  const statuses = ["active", "scanned", "revoked", "expired"] as const;

  const ticketTemplates = [
    { userId: "user_001", buyerEmail: "james.morrison@gmail.com", buyerName: "James Morrison", eventIndex: 0, tier: "VIP Suite", status: "active" as const, priceCents: 45000 },
    { userId: "user_002", buyerEmail: "sarah.chen@outlook.com", buyerName: "Sarah Chen", eventIndex: 0, tier: "General", status: "scanned" as const, priceCents: 15000 },
    { userId: "user_003", buyerEmail: "mike.johnson@yahoo.com", buyerName: "Mike Johnson", eventIndex: 1, tier: "Backstage", status: "active" as const, priceCents: 75000 },
    { userId: "user_004", buyerEmail: "emma.williams@gmail.com", buyerName: "Emma Williams", eventIndex: 1, tier: "VIP Suite", status: "revoked" as const, priceCents: 45000 },
    { userId: "user_005", buyerEmail: "david.kim@hotmail.com", buyerName: "David Kim", eventIndex: 2, tier: "General", status: "expired" as const, priceCents: 12000 },
    { userId: "user_006", buyerEmail: "lisa.park@gmail.com", buyerName: "Lisa Park", eventIndex: 2, tier: "VIP Suite", status: "scanned" as const, priceCents: 55000 },
    { userId: "user_007", buyerEmail: "alex.rivera@icloud.com", buyerName: "Alex Rivera", eventIndex: 3, tier: "Backstage", status: "active" as const, priceCents: 85000 },
    { userId: "user_008", buyerEmail: "nina.patel@gmail.com", buyerName: "Nina Patel", eventIndex: 3, tier: "General", status: "active" as const, priceCents: 18000 },
    { userId: "user_001", buyerEmail: "james.morrison@gmail.com", buyerName: "James Morrison", eventIndex: 4, tier: "VIP Suite", status: "active" as const, priceCents: 35000 },
    { userId: "user_002", buyerEmail: "sarah.chen@outlook.com", buyerName: "Sarah Chen", eventIndex: 5, tier: "General", status: "active" as const, priceCents: 18000 },
    { userId: "user_003", buyerEmail: "mike.johnson@yahoo.com", buyerName: "Mike Johnson", eventIndex: 4, tier: "General", status: "scanned" as const, priceCents: 35000 },
    { userId: "user_006", buyerEmail: "lisa.park@gmail.com", buyerName: "Lisa Park", eventIndex: 5, tier: "VIP Suite", status: "active" as const, priceCents: 55000 },
  ];

  return ticketTemplates.map((t, i) => ({
    userId: t.userId,
    buyerEmail: t.buyerEmail,
    buyerName: t.buyerName,
    eventId: eventIds[t.eventIndex],
    eventName: EVENTS[t.eventIndex].name,
    tier: t.tier,
    status: t.status,
    priceCents: t.priceCents,
    qr_uuid: randomUUID(),
    purchasedAt: new Date(Date.now() - (12 - i) * 86400000), // stagger over 12 days
    scannedAt: t.status === "scanned" ? new Date(Date.now() - (10 - i) * 86400000) : null,
    createdAt: new Date(Date.now() - (12 - i) * 86400000),
  }));
}

const AUDIT_LOGS = [
  { adminId: "user_009", action: "EVENT_CREATED", targetId: "", timestamp: new Date("2026-04-01T10:00:00Z"), details: "Created event: Summer Gala 2026" },
  { adminId: "user_009", action: "MANUAL_STATUS_OVERRIDE", targetId: "", timestamp: new Date("2026-04-12T14:30:00Z"), details: 'Changed ticket status from "active" to "revoked" — Emma Williams, Drake Night' },
  { adminId: "user_009", action: "EVENT_CREATED", targetId: "", timestamp: new Date("2026-04-10T09:15:00Z"), details: "Created event: Billie Eilish — Intimate Sessions" },
  { adminId: "user_009", action: "ROLE_CHANGED", targetId: "user_010", timestamp: new Date("2026-04-05T11:00:00Z"), details: 'Changed user scanner@emperia.io role from "customer" to "scanner"' },
  { adminId: "user_009", action: "EVENT_CREATED", targetId: "", timestamp: new Date("2026-04-14T08:45:00Z"), details: "Created event: Kendrick Lamar — DAMN. Anniversary" },
];

// ── Seed / Clear Logic ───────────────────────────────────────────────────────
const COLLECTIONS = ["events", "tickets", "users", "audit_logs"];

async function clearCollections() {
  console.log("🗑  Clearing seeded collections...");
  for (const col of COLLECTIONS) {
    const snap = await db.collection(col).get();
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`   ✓ Cleared ${col} (${snap.size} docs)`);
  }
  console.log("✅ All collections cleared.\n");
}

async function seedData() {
  console.log("🌱 Seeding Firestore with demo data...\n");

  // 1. Seed users
  console.log("👤 Seeding users...");
  for (const user of USERS) {
    await db.collection("users").doc(user.uid).set(user);
  }
  console.log(`   ✓ ${USERS.length} users created`);

  // 2. Seed events
  console.log("🎪 Seeding events...");
  const eventIds: string[] = [];
  for (const event of EVENTS) {
    const ref = db.collection("events").doc();
    await ref.set(event);
    eventIds.push(ref.id);
  }
  console.log(`   ✓ ${EVENTS.length} events created`);

  // 3. Seed tickets (needs event IDs)
  console.log("🎫 Seeding tickets...");
  const tickets = generateTickets(eventIds);
  for (const ticket of tickets) {
    await db.collection("tickets").doc().set(ticket);
  }
  console.log(`   ✓ ${tickets.length} tickets created`);

  // 4. Seed audit logs
  console.log("📋 Seeding audit logs...");
  // Update targetIds for event-related logs
  AUDIT_LOGS[0].targetId = eventIds[3]; // Summer Gala
  AUDIT_LOGS[2].targetId = eventIds[4]; // Billie Eilish
  AUDIT_LOGS[4].targetId = eventIds[5]; // Kendrick
  for (const log of AUDIT_LOGS) {
    await db.collection("audit_logs").doc().set(log);
  }
  console.log(`   ✓ ${AUDIT_LOGS.length} audit logs created`);

  console.log("\n✅ Seed complete! Your Firestore is populated with demo data.");
  console.log("   To clear: npx tsx scripts/seed-admin-data.ts --clear");
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const shouldClear = process.argv.includes("--clear");

  if (shouldClear) {
    await clearCollections();
  } else {
    await seedData();
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
