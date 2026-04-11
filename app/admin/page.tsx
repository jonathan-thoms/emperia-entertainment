"use client";

import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const ADMIN_LINKS = [
  {
    href: "/admin/events",
    label: "Manage Events",
    description: "Create, edit, and delete events",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
        <path d="M16 2v4M8 2v4" />
      </svg>
    ),
  },
  {
    href: "/scanner",
    label: "Scan Tickets",
    description: "Scan QR codes at the venue",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <path d="M14 14h3v3h-3zM20 14v3h-3M14 20h3M20 20h0" />
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  return (
    <AuthGuard requiredRole="admin">
      <Navbar />
      <main className="min-h-screen pt-28 pb-[120px]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <div className="mb-12">
            <span className="label-upper text-purple-container tracking-[0.12em] mb-3 block">Admin Panel</span>
            <h1 className="display-lg">Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-surface-container-low rounded-2xl p-8 hover:bg-surface-container-high transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-luxe"
              >
                <div className="mb-4">{link.icon}</div>
                <h2 className="font-serif text-xl text-on-surface mb-2">{link.label}</h2>
                <p className="text-sm text-on-surface-variant tracking-wide">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
