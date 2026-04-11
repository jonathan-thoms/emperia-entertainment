"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TicketCard from "@/components/TicketCard";

interface Ticket {
  id: string;
  eventName: string;
  qr_uuid: string;
  status: "active" | "scanned" | "refunded";
  venue?: string;
  date?: string;
}

function TicketsContent() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchTickets() {
      try {
        const q = query(
          collection(db, "tickets"),
          where("userId", "==", user!.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setTickets(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Ticket, "id">),
          }))
        );
      } catch (err) {
        console.error("[Tickets] Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-full bg-surface-container mx-auto mb-6 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface-variant">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        </div>
        <p className="font-serif text-2xl text-on-surface mb-2">No tickets yet</p>
        <p className="text-sm text-on-surface-variant">
          Your purchased tickets will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((t) => (
        <TicketCard
          key={t.id}
          ticketId={t.id}
          eventName={t.eventName}
          qrUuid={t.qr_uuid}
          status={t.status}
          venue={t.venue}
          date={t.date}
        />
      ))}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="min-h-screen pt-28 pb-[120px]">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="mb-12">
            <span className="label-upper text-gold tracking-[0.12em] mb-3 block">Your Collection</span>
            <h1 className="display-lg">My Tickets</h1>
          </div>
          <TicketsContent />
        </div>
      </main>
      <Footer />
    </AuthGuard>
  );
}
