"use server";

import { adminDb } from "@/lib/firebase-admin";

// ── Types ────────────────────────────────────────────────────────────────────────
type ActionResult = { success: true } | { success: false; error: string };

export type UserRole = "customer" | "admin" | "scanner";

export interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
}

// ── Fetch All Users ──────────────────────────────────────────────────────────────
export async function fetchAllUsers(): Promise<UserRecord[]> {
  try {
    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();

    return snap.docs.map((doc) => {
      const data = doc.data();

      let createdAt = "";
      if (data.createdAt) {
        if (typeof data.createdAt === "object" && "toDate" in data.createdAt) {
          createdAt = data.createdAt.toDate().toISOString();
        } else if (data.createdAt instanceof Date) {
          createdAt = data.createdAt.toISOString();
        } else {
          createdAt = String(data.createdAt);
        }
      }

      return {
        uid: doc.id,
        email: (data.email as string) || "",
        displayName: (data.displayName as string) || "Unknown",
        photoURL: (data.photoURL as string) || null,
        role: (data.role as UserRole) || "customer",
        createdAt,
      };
    });
  } catch (err) {
    console.error("[fetchAllUsers]", err);
    return [];
  }
}

// ── Change User Role ─────────────────────────────────────────────────────────────
// Uses a Firebase batch write to atomically update the user's role AND write
// an audit log entry, per the admin-dashboard-directive.
// ─────────────────────────────────────────────────────────────────────────────────
export async function changeUserRole(
  targetUserId: string,
  newRole: UserRole,
  previousRole: string,
  adminId: string
): Promise<ActionResult> {
  try {
    if (!targetUserId || !newRole || !adminId) {
      return { success: false, error: "Missing required fields." };
    }

    const validRoles: UserRole[] = ["customer", "admin", "scanner"];
    if (!validRoles.includes(newRole)) {
      return { success: false, error: `Invalid role: ${newRole}` };
    }

    if (targetUserId === adminId) {
      return { success: false, error: "You cannot change your own role." };
    }

    const batch = adminDb.batch();

    // 1. Update the user document
    const userRef = adminDb.collection("users").doc(targetUserId);
    batch.update(userRef, {
      role: newRole,
      updatedAt: new Date(),
    });

    // 2. Write an audit log entry
    const auditRef = adminDb.collection("audit_logs").doc();
    batch.set(auditRef, {
      adminId,
      action: "ROLE_CHANGED",
      targetId: targetUserId,
      timestamp: new Date(),
      details: `Changed user ${targetUserId} role from "${previousRole}" to "${newRole}"`,
    });

    await batch.commit();

    return { success: true };
  } catch (err: unknown) {
    console.error("[changeUserRole]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to change user role.",
    };
  }
}
