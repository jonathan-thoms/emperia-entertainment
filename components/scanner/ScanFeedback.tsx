"use client";

import type { ScanState, ScanResult } from "./types";

// ── Props ───────────────────────────────────────────────────────────────────────
interface ScanFeedbackProps {
  scanState: ScanState;
  result: ScanResult | null;
}

// ── Full-Screen Feedback Overlay + Result Banner ────────────────────────────────
// Provides high-contrast green/red visual feedback for fast scanning in dark
// environments. Designed so staff can interpret results at a glance.

export default function ScanFeedback({ scanState, result }: ScanFeedbackProps) {
  const isActive = scanState === "valid" || scanState === "invalid";

  const overlayClass =
    scanState === "valid"
      ? "scanner-overlay-valid"
      : scanState === "invalid"
        ? "scanner-overlay-invalid"
        : "";

  return (
    <>
      {/* ── Full-screen Feedback Overlay ─────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        } ${overlayClass}`}
      />

      {/* ── Result Banner ───────────────────────────────────────────── */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          result ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-5 py-4 text-center ${
            result?.status === "success"
              ? "bg-green-500/20 border-b-2 border-green-500"
              : "bg-red-500/20 border-b-2 border-red-500"
          }`}
          id="scan-result-banner"
        >
          <p
            className={`text-2xl font-bold tracking-widest ${
              result?.status === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {result?.status === "success" ? "✓" : "✕"} {result?.message}
          </p>
          {result?.detail && (
            <p className="text-sm text-on-surface-variant mt-1 tracking-wide">{result.detail}</p>
          )}
        </div>
      </div>

      {/* ── Scoped Overlay Styles ───────────────────────────────────── */}
      <style jsx>{`
        .scanner-overlay-valid {
          background: radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
          border: 6px solid rgba(34, 197, 94, 0.6);
          box-shadow: inset 0 0 120px rgba(34, 197, 94, 0.15);
        }
        .scanner-overlay-invalid {
          background: radial-gradient(circle at center, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
          border: 6px solid rgba(239, 68, 68, 0.6);
          box-shadow: inset 0 0 120px rgba(239, 68, 68, 0.15);
        }
      `}</style>
    </>
  );
}
