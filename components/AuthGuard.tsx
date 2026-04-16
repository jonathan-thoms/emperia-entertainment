"use client";

import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  /** The minimum role required to view this page. */
  requiredRole?: UserRole;
}

/**
 * Client-side RBAC guard.
 *
 * - `requiredRole="admin"` → only admins
 * - `requiredRole="scanner"` → scanners AND admins
 * - `requiredRole="customer"` or omitted → any authenticated user
 */
export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in — go to login
    if (!user) {
      router.replace("/login");
      return;
    }

    if (!profile) return; // still resolving profile

    const role = profile.role;

    // Admin-only pages
    if (requiredRole === "admin" && role !== "admin") {
      router.replace(role === "scanner" ? "/scanner" : "/");
      return;
    }

    // Scanner pages — allow scanner + admin
    if (requiredRole === "scanner" && role !== "scanner" && role !== "admin") {
      router.replace("/");
      return;
    }
  }, [user, profile, loading, requiredRole, router]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <span className="text-sm text-on-surface-variant tracking-wider">Loading...</span>
        </div>
      </div>
    );
  }

  // ── Gate rendering ─────────────────────────────────────────────────────────
  if (!user) return null;
  if (!profile) return null;

  const role = profile.role;
  if (requiredRole === "admin" && role !== "admin") return null;
  if (requiredRole === "scanner" && role !== "scanner" && role !== "admin") return null;

  return <>{children}</>;
}
