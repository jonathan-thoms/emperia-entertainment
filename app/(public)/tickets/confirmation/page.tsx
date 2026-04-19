"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Ticket, ArrowRight } from "lucide-react";

// ── Stripe Result Types ──────────────────────────────────────────────────────────
type PaymentStatus = "loading" | "succeeded" | "processing" | "failed";

// ── Inner component (uses useSearchParams) ───────────────────────────────────────
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const redirectStatus = searchParams.get("redirect_status");

    switch (redirectStatus) {
      case "succeeded":
        setStatus("succeeded");
        setMessage("Your tickets have been confirmed and are ready.");
        break;
      case "processing":
        setStatus("processing");
        setMessage("Your payment is being processed. Tickets will appear shortly.");
        break;
      case "requires_payment_method":
      default:
        if (redirectStatus) {
          setStatus("failed");
          setMessage("Payment was not completed. Please try again.");
        } else {
          // No redirect_status — direct navigation to this page
          setStatus("failed");
          setMessage("No payment information found.");
        }
        break;
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
        <p className="text-on-surface-variant text-sm tracking-wide">
          Confirming your payment...
        </p>
      </div>
    );
  }

  const isSuccess = status === "succeeded" || status === "processing";

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8 animate-fade-up">
      {/* ── Status Icon ───────────────────────────────────────────── */}
      <div
        className={`
          w-24 h-24 rounded-full flex items-center justify-center
          ${isSuccess
            ? "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 shadow-[0_0_60px_rgba(34,197,94,0.15)]"
            : "bg-gradient-to-br from-error/20 to-error/5 shadow-[0_0_60px_rgba(255,180,171,0.15)]"
          }
        `}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
        ) : (
          <XCircle className="w-12 h-12 text-error" strokeWidth={1.5} />
        )}
      </div>

      {/* ── Title ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-serif text-3xl text-on-surface mb-3">
          {isSuccess ? "Payment Confirmed" : "Payment Failed"}
        </h1>
        <p className="text-on-surface-variant text-sm tracking-wide max-w-md">
          {message}
        </p>
      </div>

      {/* ── Success Details ────────────────────────────────────────── */}
      {isSuccess && (
        <div className="bg-surface-container-low rounded-2xl p-6 w-full max-w-sm space-y-4 ghost-border">
          <div className="flex items-center gap-3 text-emerald-400">
            <Ticket className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">
              Ticket Issued
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Your ticket with a unique QR code has been generated. You can view it
            in &ldquo;My Tickets&rdquo; along with the scannable QR code for entry.
          </p>
          {status === "processing" && (
            <p className="text-xs text-gold/80">
              ⏳ Payment is still processing. Your ticket will appear once confirmed.
            </p>
          )}
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
        {isSuccess ? (
          <>
            <Link
              href="/tickets"
              className="flex-1 btn-gold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
              id="view-tickets-btn"
            >
              <Ticket className="w-4 h-4" />
              View My Tickets
            </Link>
            <Link
              href="/events"
              className="flex-1 py-3.5 rounded-xl text-sm text-center text-on-surface-variant hover:text-on-surface bg-surface-container-low ghost-border hover:bg-surface-container-high transition-all duration-300"
            >
              Browse More Events
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/events"
              className="flex-1 btn-gold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              Try Again
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="flex-1 py-3.5 rounded-xl text-sm text-center text-on-surface-variant hover:text-on-surface bg-surface-container-low ghost-border hover:bg-surface-container-high transition-all duration-300"
            >
              Return Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────────
// Wrapped in Suspense because useSearchParams requires it in Next.js App Router
export default function ConfirmationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg">
        {/* ── Ambient Glows ─────────────────────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-40 right-0 w-[400px] h-[400px] rounded-full bg-gold/4 blur-[120px]" />
          <div className="absolute -bottom-40 -left-20 w-[300px] h-[300px] rounded-full bg-purple-container/4 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Suspense
            fallback={
              <div className="flex flex-col items-center gap-4 py-20">
                <Loader2 className="w-10 h-10 text-gold animate-spin" />
                <p className="text-on-surface-variant text-sm">Confirming payment...</p>
              </div>
            }
          >
            <ConfirmationContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
