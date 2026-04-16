"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteEvent } from "@/actions/events";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  venue: string;
  date: string;
  priceCents: number;
  total_capacity: number;
  ticketsSold: number;
}

function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setEvents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Event, "id">) })));
    } catch (err) {
      console.error("[Admin Events]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const result = await deleteEvent(eventId);
    if (result.success) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="label-upper text-gold tracking-[0.12em] mb-3 block">Admin</span>
          <h1 className="headline-lg">Manage Events</h1>
        </div>
        <Link href="/admin/events/new" className="btn-gold px-6 py-3 rounded-xl text-xs" id="new-event-btn">
          + New Event
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl shimmer" />)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-xl text-on-surface mb-2">No events created yet</p>
          <p className="text-sm text-on-surface-variant">Click &quot;+ New Event&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between gap-4 hover:bg-surface-container-high transition-colors duration-300">
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-base text-on-surface truncate">{e.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant/60">
                  <span>{e.venue}</span>
                  <span>·</span>
                  <span>{e.date}</span>
                  <span>·</span>
                  <span className="text-gold">${(e.priceCents / 100).toFixed(0)}</span>
                  <span>·</span>
                  <span>{e.ticketsSold ?? 0}/{e.total_capacity} sold</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/events/${e.id}/edit`}
                  className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-gold hover:bg-surface-container transition-colors duration-300"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <Navbar />
      <main className="min-h-screen pt-28 pb-[120px]">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <EventsManager />
        </div>
      </main>
    </AuthGuard>
  );
}
