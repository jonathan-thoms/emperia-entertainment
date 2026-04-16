"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getRedirectForRole } from "@/lib/auth-context";

// ═══════════════════════════════════════════════════════════════════════════════
// Staff Login — Dedicated entry point for door staff / scanner operators.
// No Google sign-in, no registration link. Staff accounts are provisioned
// by admins in Firestore with role: "scanner".
// ═══════════════════════════════════════════════════════════════════════════════
export default function StaffLoginPage() {
  const { signInWithEmail, user, profile, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Redirect if already logged in ──────────────────────────────────────────
  useEffect(() => {
    if (!loading && user && profile) {
      router.replace(getRedirectForRole(profile.role));
    }
  }, [loading, user, profile, router]);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signInWithEmail(email, password);
    if (!result.success) {
      setError(result.error ?? "Invalid credentials.");
    }
    // Redirect is handled by the useEffect above once profile loads
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-void px-4">
      {/* ── Ambient Glows ──────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold/6 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] rounded-full bg-purple-container/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* ── Logo & Header ─────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-container flex items-center justify-center">
              <span className="text-gold-on font-serif font-bold text-lg">E</span>
            </div>
          </div>
          <h1 className="font-serif text-2xl text-on-surface mt-6 mb-2">Staff Portal</h1>
          <p className="text-sm text-on-surface-variant tracking-wide">
            Sign in to access the ticket scanner
          </p>
        </div>

        {/* ── Login Card ────────────────────────────────────────────── */}
        <div className="bg-surface-container-low rounded-2xl p-8">
          {/* Staff badge */}
          <div className="flex items-center justify-center gap-2 mb-6 py-2 rounded-lg bg-surface-container border border-outline-variant/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[11px] text-on-surface-variant tracking-[0.1em] uppercase font-semibold">
              Authorized Personnel Only
            </span>
          </div>

          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label htmlFor="staff-email" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">
                Email
              </label>
              <input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/15 focus:border-gold focus:outline-none transition-colors duration-300 placeholder:text-on-surface-variant/40"
                placeholder="staff@emperia.com"
              />
            </div>

            <div>
              <label htmlFor="staff-password" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">
                Password
              </label>
              <input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/15 focus:border-gold focus:outline-none transition-colors duration-300 placeholder:text-on-surface-variant/40"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-error" role="alert" id="staff-login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold py-3.5 rounded-xl text-sm disabled:opacity-50"
              id="staff-login-btn"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <p className="text-center mt-6 text-xs text-on-surface-variant/40 tracking-wide">
          Contact your administrator for access
        </p>
      </div>
    </div>
  );
}
