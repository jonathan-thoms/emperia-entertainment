"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ScanState } from "./types";

// ── Props ───────────────────────────────────────────────────────────────────────
interface QrReaderProps {
  /** Called when a QR code is successfully decoded. */
  onScan: (decodedText: string) => void;
  /** Current scan state — drives the border glow color. */
  scanState: ScanState;
}

// ── QR Camera Reader ────────────────────────────────────────────────────────────
// Wraps html5-qrcode into a managed React component with start/stop lifecycle,
// scanning indicator spinner, and color-coded viewfinder border.

export default function QrReader({ onScan, scanState }: QrReaderProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);

  // ── Start camera ────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {
          // QR code not detected — ignore
        }
      );

      setCameraActive(true);
      setCameraError(null);
    } catch (err) {
      setCameraError(
        err instanceof Error ? err.message : "Camera access denied."
      );
    }
  }, [onScan]);

  // ── Stop camera ─────────────────────────────────────────────────────────────
  const stopCamera = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch {
        // Ignore stop errors
      }
      html5QrRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // ── Border glow based on scan state ─────────────────────────────────────────
  const borderClass =
    scanState === "valid"
      ? "border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
      : scanState === "invalid"
        ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
        : "border-outline-variant/20";

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-6">
      <div className="w-full max-w-sm">
        <div
          className={`relative rounded-2xl overflow-hidden border-2 transition-colors duration-300 ${borderClass}`}
        >
          {cameraActive ? (
            <div className="relative">
              <div id="qr-reader" ref={scannerRef} className="w-full" />
              {/* Scanning indicator */}
              {scanState === "scanning" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                  <div className="w-12 h-12 rounded-full border-3 border-gold border-t-transparent animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-surface-container-lowest flex flex-col items-center justify-center gap-4 p-8">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-on-surface-variant/20">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3h-3zM20 14v3h-3M14 20h3M20 20h0" />
              </svg>
              {cameraError ? (
                <p className="text-xs text-error text-center max-w-[200px]">{cameraError}</p>
              ) : (
                <p className="text-xs text-on-surface-variant/40 text-center">
                  Tap below to activate camera
                </p>
              )}
            </div>
          )}
        </div>

        {/* Camera toggle */}
        <button
          onClick={cameraActive ? stopCamera : startCamera}
          className={`w-full mt-4 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
            cameraActive
              ? "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
              : "btn-gold text-lg"
          }`}
          id="toggle-camera-btn"
        >
          {cameraActive ? "■  Stop Camera" : "▶  Start Camera"}
        </button>
      </div>
    </div>
  );
}
