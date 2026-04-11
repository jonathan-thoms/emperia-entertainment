"use client";

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

interface TicketCardProps {
  ticketId: string;
  eventName: string;
  qrUuid: string;
  status: "active" | "scanned" | "refunded";
  date?: string;
  venue?: string;
}

const STATUS_STYLES = {
  active: { bg: "bg-green-500/15", border: "border-green-500/30", text: "text-green-400", label: "ACTIVE" },
  scanned: { bg: "bg-blue/15", border: "border-blue/30", text: "text-blue", label: "SCANNED" },
  refunded: { bg: "bg-error/15", border: "border-error/30", text: "text-error", label: "REFUNDED" },
};

export default function TicketCard({ ticketId, eventName, qrUuid, status, date, venue }: TicketCardProps) {
  const s = STATUS_STYLES[status];

  return (
    <Link href={`/tickets/${ticketId}`} className="group block" id={`ticket-${ticketId}`}>
      <div className="bg-surface-container-low rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-surface-container-high group-hover:shadow-luxe group-hover:-translate-y-1">
        <div className="p-6 flex flex-col sm:flex-row gap-6 items-center">
          {/* QR Code */}
          <div className="shrink-0 p-3 bg-white rounded-xl">
            <QRCodeSVG value={qrUuid} size={100} level="H" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-serif text-xl text-on-surface mb-1">{eventName}</h3>
            {venue && <p className="text-xs text-on-surface-variant tracking-wide mb-1">{venue}</p>}
            {date && <p className="text-xs text-on-surface-variant/60 tracking-wider">{date}</p>}

            <div className="mt-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${s.bg} border ${s.border} ${s.text} text-[10px] font-semibold tracking-[0.1em]`}>
                {s.label}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="shrink-0 w-8 h-8 rounded-full bg-on-surface/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
