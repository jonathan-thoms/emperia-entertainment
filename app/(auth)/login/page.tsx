"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signInWithEmail(email, password);
    if (result.success) {
      router.push("/events");
    } else {
      setError(result.error ?? "Invalid credentials.");
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    const result = await signInWithGoogle();
    if (result.success) {
      router.push("/events");
    } else {
      setError(result.error ?? "Google sign-in failed.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-void px-4">
      {/* ── Ambient Glows ──────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-container/8 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-container flex items-center justify-center">
              <span className="text-gold-on font-serif font-bold text-base">E</span>
            </div>
          </Link>
          <h1 className="font-serif text-3xl text-on-surface mt-6 mb-2">Welcome Back</h1>
          <p className="text-sm text-on-surface-variant tracking-wide">
            Sign in to access your experiences
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────────────── */}
        <div className="bg-surface-container-low rounded-2xl p-8">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-glow-purple disabled:opacity-50"
            id="google-login-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-xs text-on-surface-variant/60 tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/15 focus:border-gold focus:outline-none transition-colors duration-300 placeholder:text-on-surface-variant/40"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/15 focus:border-gold focus:outline-none transition-colors duration-300 placeholder:text-on-surface-variant/40"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold py-3 rounded-xl text-sm disabled:opacity-50"
              id="email-login-btn"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* ── Footer link ──────────────────────────────────────────── */}
        <p className="text-center mt-6 text-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-gold hover:text-gold-container transition-colors duration-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
