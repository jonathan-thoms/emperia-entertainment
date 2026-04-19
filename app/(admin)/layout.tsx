"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Users,
  ScrollText,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

// ── Sidebar Nav Items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /** Check if a nav item is the active route */
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Logo / Brand ────────────────────────────────────────────── */}
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-container flex items-center justify-center shadow-glow-gold">
          <Sparkles className="w-5 h-5 text-gold-on" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wide text-on-surface">
            Emperia
          </h1>
          <p className="text-[10px] tracking-[0.12em] uppercase text-on-surface-variant">
            Admin Panel
          </p>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                ${
                  active
                    ? "bg-gold/10 text-gold shadow-[inset_0_0_20px_rgba(242,202,80,0.05)]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }
              `}
            >
              <item.icon
                className={`w-[18px] h-[18px] transition-colors duration-300 ${
                  active
                    ? "text-gold"
                    : "text-outline group-hover:text-on-surface-variant"
                }`}
              />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold shadow-glow-gold" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Section: Admin Info + Sign Out ────────────────────── */}
      <div className="px-3 pb-6 space-y-2">
        {/* Admin badge */}
        <div className="px-4 py-3 rounded-xl bg-surface-container-low">
          <p className="text-xs text-on-surface-variant truncate">
            {profile?.email ?? "Admin"}
          </p>
          <p className="text-[10px] tracking-[0.1em] uppercase text-purple-container mt-0.5">
            {profile?.role ?? "admin"}
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          className="
            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
            text-on-surface-variant hover:text-error hover:bg-error-container/10
            transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          "
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <AuthGuard requiredRole="admin">
      <div className="flex h-screen bg-void overflow-hidden">
        {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
        <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col bg-surface-container-lowest border-r border-outline-variant/15 flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* ── Mobile Sidebar Overlay ──────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />

            {/* Drawer */}
            <aside
              className="relative w-72 h-full bg-surface-container-lowest border-r border-outline-variant/15 animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-6 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <SidebarContent />
            </aside>
          </div>
        )}

        {/* ── Main Content Area ────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile top bar */}
          <header className="lg:hidden flex items-center gap-4 px-4 py-4 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/15">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-container flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold-on" />
              </div>
              <span className="text-sm font-semibold text-on-surface tracking-wide">
                Emperia Admin
              </span>
            </div>
          </header>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
