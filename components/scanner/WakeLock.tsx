"use client";

import { useEffect, useRef } from "react";

// ── Screen Wake Lock Hook ───────────────────────────────────────────────────────
// Prevents the device screen from dimming/sleeping while the scanner is active.
// Falls back gracefully on browsers that don't support the Wake Lock API.

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function request() {
      try {
        if ("wakeLock" in navigator && !cancelled) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Silently fail — not critical for operation
      }
    }

    request();

    // Re-acquire wake lock if the document becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);
}
