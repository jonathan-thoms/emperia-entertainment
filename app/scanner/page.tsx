"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { validateAndScanTicket } from "@/actions/scanner";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

type ScanResult = {
  status: "success" | "error";
  message: string;
  ticket?: Record<string, unknown>;
};

export default function ScannerPage() {
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // ── Manual scan ────────────────────────────────────────────────────────────
  const handleManualScan = async () => {
    if (!manualCode.trim()) return;
    setScanning(true);
    setResult(null);

    const res = await validateAndScanTicket(manualCode.trim());
    if (res.success) {
      setResult({
        status: "success",
        message: `✓ Ticket verified — ${(res.ticket as Record<string, unknown>)?.eventName}`,
        ticket: res.ticket as Record<string, unknown>,
      });
    } else {
      setResult({ status: "error", message: res.error });
    }
    setManualCode("");
    setScanning(false);
  };

  // ── Camera scanner ─────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCameraError(null);
    } catch (err) {
      setCameraError(
        err instanceof Error ? err.message : "Camera access denied."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Note: A full BarcodeDetector / js-based QR scanner would go here.
  // For now the camera feed is shown and tickets can be manually entered.

  return (
    <AuthGuard requiredRole="admin">
      <Navbar />
      <main className="min-h-screen pt-28 pb-[120px]">
        <div className="mx-auto max-w-lg px-6">
          <div className="mb-10 text-center">
            <span className="label-upper text-purple tracking-[0.12em] mb-3 block">
              Entry Gate
            </span>
            <h1 className="headline-lg">Ticket Scanner</h1>
          </div>

          {/* ── Camera Feed ──────────────────────────────────────── */}
          <div className="bg-surface-container-low rounded-2xl overflow-hidden mb-6">
            <div className="aspect-square relative bg-surface-container-lowest flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-gold/50 rounded-xl">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold rounded-br-lg" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-on-surface-variant/30 mx-auto mb-4">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <path d="M14 14h3v3h-3zM20 14v3h-3M14 20h3M20 20h0" />
                  </svg>
                  {cameraError ? (
                    <p className="text-xs text-error">{cameraError}</p>
                  ) : (
                    <p className="text-xs text-on-surface-variant/40">Camera feed will appear here</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 flex justify-center">
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                  cameraActive
                    ? "bg-error-container/30 text-error hover:bg-error-container/50"
                    : "btn-gold"
                }`}
                id="toggle-camera-btn"
              >
                {cameraActive ? "Stop Camera" : "Start Camera"}
              </button>
            </div>
          </div>

          {/* ── Manual Entry ─────────────────────────────────────── */}
          <div className="bg-surface-container-low rounded-2xl p-6">
            <h3 className="text-sm text-on-surface-variant mb-4 tracking-wide">Manual Entry</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Paste QR UUID..."
                className="flex-1 px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/15 focus:border-gold focus:outline-none transition-colors duration-300 placeholder:text-on-surface-variant/40"
                id="manual-qr-input"
                onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
              />
              <button
                onClick={handleManualScan}
                disabled={scanning || !manualCode.trim()}
                className="btn-gold px-6 py-3 rounded-xl text-xs disabled:opacity-50"
                id="manual-scan-btn"
              >
                {scanning ? "..." : "Scan"}
              </button>
            </div>
          </div>

          {/* ── Result ───────────────────────────────────────────── */}
          {result && (
            <div
              className={`mt-6 rounded-2xl p-6 text-center ${
                result.status === "success"
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-error/10 border border-error/20"
              }`}
            >
              <p className={`text-sm font-medium ${result.status === "success" ? "text-green-400" : "text-error"}`}>
                {result.message}
              </p>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
