"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = profile?.role === "admin";

  return (
    <>
      <nav
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "glass-strong py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between">
          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-container flex items-center justify-center">
              <span className="text-gold-on font-serif font-bold text-sm">E</span>
            </div>
            <span className="font-serif text-lg tracking-tight text-on-surface group-hover:text-gold transition-colors duration-300">
              Emperia
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              href="/events"
              className="text-sm font-medium tracking-wide text-on-surface-variant hover:text-gold transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              Explore
            </Link>
            {user && (
              <Link
                href="/tickets"
                className="text-sm font-medium tracking-wide text-on-surface-variant hover:text-gold transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                My Tickets
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium tracking-wide text-purple hover:text-purple-container transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-purple hover:after:w-full after:transition-all after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                Admin
              </Link>
            )}
          </div>

          {/* ── CTA / Profile ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-xs text-on-surface-variant tracking-wide">
                  {profile?.displayName || user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-on-surface-variant hover:text-error transition-colors duration-300"
                  id="nav-signout"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-on-surface-variant hover:text-on-surface transition-colors duration-300"
                  id="nav-login"
                >
                  Sign In
                </Link>
                <Link
                  href="/events"
                  className="btn-gold px-5 py-2 rounded-full text-xs"
                  id="nav-cta"
                >
                  Get Tickets
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Toggle ─────────────────────────────────────────── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            id="nav-mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            <span
              className={`block w-5 h-[1.5px] bg-on-surface transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-[4px]" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-on-surface transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ─────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-void/90 backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
          <Link href="/events" onClick={() => setMobileOpen(false)} className="font-serif text-3xl text-on-surface hover:text-gold transition-colors duration-300">
            Explore
          </Link>
          {user && (
            <Link href="/tickets" onClick={() => setMobileOpen(false)} className="font-serif text-3xl text-on-surface hover:text-gold transition-colors duration-300">
              My Tickets
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="font-serif text-3xl text-purple hover:text-purple-container transition-colors duration-300">
              Admin
            </Link>
          )}

          {user ? (
            <button
              onClick={() => { signOut(); setMobileOpen(false); }}
              className="btn-ghost px-8 py-3 rounded-full text-sm mt-4"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="font-serif text-3xl text-on-surface hover:text-gold transition-colors duration-300">
                Sign In
              </Link>
              <Link
                href="/events"
                onClick={() => setMobileOpen(false)}
                className="btn-gold px-8 py-3 rounded-full text-sm mt-4"
              >
                Get Tickets
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
