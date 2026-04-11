"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ConfirmationPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-void px-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[150px]" />
        </div>

        <div className="relative z-10 text-center max-w-md animate-fade-up">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-container mx-auto mb-8 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-on">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h1 className="font-serif text-4xl text-on-surface mb-3">Payment Confirmed</h1>
          <p className="text-on-surface-variant text-base leading-relaxed tracking-wide mb-10">
            Your tickets have been secured. A confirmation email with your QR code
            will arrive shortly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tickets"
              className="btn-gold px-8 py-3.5 rounded-full text-sm"
              id="view-tickets-btn"
            >
              View My Tickets
            </Link>
            <Link
              href="/events"
              className="btn-ghost px-8 py-3.5 rounded-full text-sm"
              id="browse-more-btn"
            >
              Browse More Events
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
