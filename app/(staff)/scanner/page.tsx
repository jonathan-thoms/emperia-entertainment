"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { validateAndScanTicket } from "@/actions/scanner";
import AuthGuard from "@/components/AuthGuard";
import QrReader from "@/components/scanner/QrReader";
import ScanFeedback from "@/components/scanner/ScanFeedback";
import ManualEntry from "@/components/scanner/ManualEntry";
import { useWakeLock } from "@/components/scanner/WakeLock";
import type { ScanState, ScanResult } from "@/components/scanner/types";

// ── Haptic helper ──────────────────────────────────────────────────────────────
function vibrate(pattern: number | number[]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Web Scanner Page — Universal App (works on desktop browsers & Capacitor)
// ═══════════════════════════════════════════════════════════════════════════════
export default function ScannerPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScannedRef = useRef<string>("");

  // ── Keep screen awake while scanning ────────────────────────────────────────
  useWakeLock();

  // ── Process a scanned ticket ───────────────────────────────────────────────
  const processTicket = useCallback(async (code: string) => {
    // Debounce: prevent re-scanning the same code within 3 seconds
    if (code === lastScannedRef.current) return;
    if (isProcessing) return;

    lastScannedRef.current = code;
    setIsProcessing(true);
    setScanState("scanning");
    setResult(null);

    // Clear any existing feedback timeout
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    try {
      const res = await validateAndScanTicket(code);

      if (res.success) {
        const ticket = res.ticket as Record<string, unknown>;
        setScanState("valid");
        setResult({
          status: "success",
          message: "ENTRY GRANTED",
          detail: `${ticket?.eventName ?? "Event"} — Ticket #${String(ticket?.id ?? "").slice(0, 8)}`,
        });
        vibrate(200); // Single vibrate = success
      } else {
        setScanState("invalid");
        setResult({
          status: "error",
          message: "ENTRY DENIED",
          detail: res.error,
        });
        vibrate([100, 50, 100, 50, 100]); // Triple pulse = error
      }
    } catch {
      setScanState("invalid");
      setResult({
        status: "error",
        message: "SCAN ERROR",
        detail: "Network error. Please try again.",
      });
      vibrate([100, 50, 100, 50, 100]);
    }

    setIsProcessing(false);

    // Auto-reset after 3 seconds
    feedbackTimeoutRef.current = setTimeout(() => {
      setScanState("idle");
      setResult(null);
      lastScannedRef.current = "";
    }, 3000);
  }, [isProcessing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  return (
    <AuthGuard requiredRole="scanner">
      {/* ── Full-screen Feedback ────────────────────────────────────── */}
      <ScanFeedback scanState={scanState} result={result} />

      <main className="min-h-screen bg-void flex flex-col" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 pt-safe-top py-4 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-container flex items-center justify-center">
              <span className="text-gold-on font-serif font-bold text-xs">E</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-on-surface tracking-wide">TICKET SCANNER</h1>
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">Entry Gate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-on-surface-variant/50 tracking-wider uppercase hidden sm:inline">
              Web Mode
            </span>
            <div className={`w-3 h-3 rounded-full ${scanState !== "idle" ? "bg-gold animate-pulse" : "bg-outline-variant/40"}`} />
          </div>
        </header>

        {/* ── Camera Viewfinder ────────────────────────────────────────── */}
        <QrReader onScan={processTicket} scanState={scanState} />

        {/* ── Manual Entry ─────────────────────────────────────────────── */}
        <ManualEntry onSubmit={processTicket} isProcessing={isProcessing} />
      </main>
    </AuthGuard>
  );
}
