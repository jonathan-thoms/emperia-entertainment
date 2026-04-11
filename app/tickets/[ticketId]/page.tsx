"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface TicketData {
  eventName: string;
  qr_uuid: string;
  status: "active" | "scanned" | "refunded";
  venue?: string;
  date?: string;
  amountPaid?: number;
  currency?: string;
}

const STATUS_STYLES = {
  active: { bg: "bg-green-500/15", border: "border-green-500/30", text: "text-green-400", label: "ACTIVE" },
  scanned: { bg: "bg-blue/15", border: "border-blue/30", text: "text-blue", label: "SCANNED" },
  refunded: { bg: "bg-error/15", border: "border-error/30", text: "text-error", label: "REFUNDED" },
};

function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDoc(doc(db, "tickets", ticketId));
        if (snap.exists()) {
          setTicket(snap.data() as TicketData);
        }
      } catch (err) {
        console.error("[TicketDetail]", err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-24">
        <p className="font-serif text-2xl text-on-surface">Ticket not found</p>
      </div>
    );
  }

  const s = STATUS_STYLES[ticket.status];

  return (
    <div className="max-w-lg mx-auto">
      {/* ── Ticket Card ─────────────────────────────────────────── */}
      <div className="bg-surface-container-low rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a0533] via-[#2d1052] to-surface-container-low p-8 text-center">
          <span className="label-upper text-gold text-[10px] tracking-[0.15em] mb-2 block">
            Emperia Experiences
          </span>
          <h2 className="font-serif text-2xl text-on-surface mb-1">{ticket.eventName}</h2>
          {ticket.venue && (
            <p className="text-sm text-on-surface-variant">{ticket.venue}</p>
          )}
          {ticket.date && (
            <p className="text-xs text-on-surface-variant/60 mt-1">{ticket.date}</p>
          )}
        </div>

        {/* Tear separator */}
        <div className="relative h-6 flex items-center">
          <div className="absolute left-0 w-3 h-6 bg-void rounded-r-full" />
          <div className="absolute right-0 w-3 h-6 bg-void rounded-l-full" />
          <div className="mx-6 flex-1 border-t border-dashed border-outline-variant/30" />
        </div>

        {/* QR Code */}
        <div className="p-8 flex flex-col items-center">
          <div className="p-4 bg-white rounded-2xl mb-6">
            <QRCodeSVG value={ticket.qr_uuid} size={200} level="H" />
          </div>

          <span className={`inline-flex items-center px-3 py-1.5 rounded-full ${s.bg} border ${s.border} ${s.text} text-xs font-semibold tracking-[0.1em] mb-4`}>
            {s.label}
          </span>

          <p className="text-[10px] text-on-surface-variant/40 tracking-widest uppercase">
            ID: {ticketId.slice(0, 8)}...
          </p>

          {ticket.amountPaid && (
            <p className="mt-4 text-sm text-on-surface-variant">
              Paid: <span className="text-gold font-medium">${(ticket.amountPaid / 100).toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-on-surface-variant/40 mt-6 tracking-wide">
        Present this QR code at the venue entrance for scanning.
      </p>
    </div>
  );
}

export default function TicketPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="min-h-screen pt-28 pb-[120px] px-6">
        <TicketDetail />
      </main>
      <Footer />
    </AuthGuard>
  );
}
