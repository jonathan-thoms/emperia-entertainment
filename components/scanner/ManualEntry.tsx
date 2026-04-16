"use client";

import { useState } from "react";

// ── Props ───────────────────────────────────────────────────────────────────────
interface ManualEntryProps {
  onSubmit: (code: string) => void;
  isProcessing: boolean;
}

// ── Manual Ticket Entry ─────────────────────────────────────────────────────────
// Fallback input for when camera scanning is impractical. Staff can paste or
// type a ticket UUID directly.

export default function ManualEntry({ onSubmit, isProcessing }: ManualEntryProps) {
  const [code, setCode] = useState("");

  const handleSubmit = () => {
    if (!code.trim()) return;
    onSubmit(code.trim());
    setCode("");
  };

  return (
    <div className="px-5 pb-6">
      <div className="bg-surface-container-low rounded-2xl p-5">
        <h3 className="text-xs text-on-surface-variant mb-3 tracking-widest uppercase font-semibold">
          Manual Entry
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste ticket UUID..."
            className="flex-1 px-4 py-3.5 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/15 focus:border-gold focus:outline-none transition-colors duration-300 placeholder:text-on-surface-variant/40"
            id="manual-qr-input"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !code.trim()}
            className="btn-gold px-6 py-3.5 rounded-xl text-xs font-bold tracking-wider disabled:opacity-50"
            id="manual-scan-btn"
          >
            {isProcessing ? "..." : "SCAN"}
          </button>
        </div>
      </div>
    </div>
  );
}
