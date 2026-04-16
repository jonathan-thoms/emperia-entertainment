"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateEvent } from "@/actions/events";
import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

interface EventData {
  name: string;
  description: string;
  venue: string;
  city: string;
  date: string;
  priceCents: number;
  total_capacity: number;
  tier?: string;
}

function EditEventForm() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDoc(doc(db, "events", eventId));
        if (snap.exists()) setEvent(snap.data() as EventData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const result = await updateEvent(eventId, {
      name: form.get("name") as string,
      description: form.get("description") as string,
      venue: form.get("venue") as string,
      city: form.get("city") as string,
      date: form.get("date") as string,
      priceCents: Math.round(parseFloat(form.get("price") as string) * 100),
      total_capacity: parseInt(form.get("capacity") as string, 10),
      tier: (form.get("tier") as string) || undefined,
    });

    if (result.success) {
      router.push("/admin/events");
    } else {
      setError(result.error);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="py-24 text-center"><div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" /></div>;
  }
  if (!event) {
    return <div className="text-center py-24"><p className="font-serif text-xl text-on-surface">Event not found</p></div>;
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/15 focus:border-gold focus:outline-none transition-colors duration-300";

  return (
    <div>
      <div className="mb-10">
        <span className="label-upper text-gold tracking-[0.12em] mb-3 block">Admin</span>
        <h1 className="headline-lg">Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-container-low rounded-2xl p-8 space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Event Name</label>
            <input id="name" name="name" type="text" required defaultValue={event.name} className={inputClass} />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Description</label>
            <textarea id="description" name="description" rows={4} defaultValue={event.description} className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="venue" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Venue</label>
              <input id="venue" name="venue" type="text" required defaultValue={event.venue} className={inputClass} />
            </div>
            <div>
              <label htmlFor="city" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">City</label>
              <input id="city" name="city" type="text" defaultValue={event.city} className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="date" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Date</label>
            <input id="date" name="date" type="text" required defaultValue={event.date} className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Price (USD)</label>
              <input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={(event.priceCents / 100).toFixed(2)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Capacity</label>
              <input id="capacity" name="capacity" type="number" min="1" required defaultValue={event.total_capacity} className={inputClass} />
            </div>
            <div>
              <label htmlFor="tier" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Tier Label</label>
              <input id="tier" name="tier" type="text" defaultValue={event.tier ?? ""} className={inputClass} />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-error" role="alert">{error}</p>}

        <button type="submit" disabled={saving} className="w-full btn-gold py-3.5 rounded-xl text-sm disabled:opacity-50" id="save-event-btn">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default function EditEventPage() {
  return (
    <AuthGuard requiredRole="admin">
      <Navbar />
      <main className="min-h-screen pt-28 pb-[120px]">
        <div className="mx-auto max-w-2xl px-6">
          <EditEventForm />
        </div>
      </main>
    </AuthGuard>
  );
}
