"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";

interface EventCheckoutProps {
  eventId: string;
  priceCents: number;
}

export default function EventCheckout({ eventId, priceCents }: EventCheckoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-on-surface-variant mb-4">
          Sign in to purchase tickets
        </p>
        <button
          onClick={() => router.push("/login")}
          className="btn-gold px-6 py-3 rounded-xl text-sm w-full"
          id="login-to-buy-btn"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/15">
        <span className="text-sm text-on-surface-variant">Total</span>
        <span className="font-serif text-2xl text-gold">
          ${(priceCents / 100).toFixed(2)}
        </span>
      </div>
      <CheckoutForm
        eventId={eventId}
        userId={user.uid}
        onSuccess={() => router.push("/tickets/confirmation")}
      />
    </div>
  );
}
