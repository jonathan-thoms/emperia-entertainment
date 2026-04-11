"use client";

import { useState, useCallback } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { createCheckoutSession } from "@/actions/stripe";

// ── Stripe.js singleton (client-side only) ─────────────────────────────────────
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ─────────────────────────────────────────────────────────────────────────────
// Inner form – must live inside <Elements> so hooks resolve correctly
// ─────────────────────────────────────────────────────────────────────────────
function PaymentForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!stripe || !elements) return;

      setIsProcessing(true);
      setErrorMessage(null);

      try {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/tickets/confirmation`,
          },
        });

        if (error) {
          const msg =
            error.type === "card_error" || error.type === "validation_error"
              ? error.message ?? "Payment failed."
              : "An unexpected error occurred. Please try again.";
          setErrorMessage(msg);
        } else {
          onSuccess?.();
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setErrorMessage(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe, elements, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        id="payment-element"
        options={{ layout: "tabs" }}
      />

      {errorMessage && (
        <p className="text-sm text-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full btn-gold py-3 rounded-xl text-sm disabled:opacity-50"
        id="submit-payment-btn"
      >
        {isProcessing ? "Processing…" : "Pay Now"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Outer wrapper – fetches the client_secret then mounts <Elements>
// ─────────────────────────────────────────────────────────────────────────────
interface CheckoutFormProps {
  eventId: string;
  userId: string;
  quantity?: number;
  onSuccess?: () => void;
}

export default function CheckoutForm({
  eventId,
  userId,
  quantity = 1,
  onSuccess,
}: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const initiateCheckout = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);

    try {
      const result = await createCheckoutSession(eventId, userId, quantity);

      if (!result.success) {
        setFetchError(result.error);
        return;
      }

      setClientSecret(result.clientSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start checkout.";
      setFetchError(msg);
    } finally {
      setIsFetching(false);
    }
  }, [eventId, userId, quantity]);

  // ── State: not yet initiated ───────────────────────────────────────────────
  if (!clientSecret && !isFetching && !fetchError) {
    return (
      <button
        onClick={initiateCheckout}
        className="w-full btn-gold py-3 rounded-xl text-sm"
        id="initiate-checkout-btn"
      >
        Proceed to Payment
      </button>
    );
  }

  // ── State: fetching client_secret ──────────────────────────────────────────
  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-8 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <span className="text-sm text-on-surface-variant">
          Preparing checkout…
        </span>
      </div>
    );
  }

  // ── State: error fetching ──────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-error" role="alert">
          {fetchError}
        </p>
        <button
          onClick={initiateCheckout}
          className="btn-ghost px-6 py-2.5 rounded-xl text-sm"
          id="retry-checkout-btn"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── State: ready – render Stripe Elements ──────────────────────────────────
  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret!,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#F2CA50",
        colorBackground: "#201f1f",
        colorText: "#E5E2E1",
        colorDanger: "#FFB4AB",
        fontFamily: "Manrope, system-ui, sans-serif",
        borderRadius: "12px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm onSuccess={onSuccess} />
    </Elements>
  );
}
