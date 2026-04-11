"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/actions/events";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await createEvent({
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
    setIsLoading(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm border border-outline-variant/15 focus:border-gold focus:outline-none transition-colors duration-300 placeholder:text-on-surface-variant/40";

  return (
    <AuthGuard requiredRole="admin">
      <Navbar />
      <main className="min-h-screen pt-28 pb-[120px]">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-10">
            <span className="label-upper text-gold tracking-[0.12em] mb-3 block">Admin</span>
            <h1 className="headline-lg">Create Event</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-surface-container-low rounded-2xl p-8 space-y-5">
              <div>
                <label htmlFor="name" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Event Name</label>
                <input id="name" name="name" type="text" required className={inputClass} placeholder="e.g. Taylor Swift — The Eras Tour" />
              </div>

              <div>
                <label htmlFor="description" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Description</label>
                <textarea id="description" name="description" rows={4} className={`${inputClass} resize-none`} placeholder="Describe the experience..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="venue" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Venue</label>
                  <input id="venue" name="venue" type="text" required className={inputClass} placeholder="SoFi Stadium" />
                </div>
                <div>
                  <label htmlFor="city" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">City</label>
                  <input id="city" name="city" type="text" className={inputClass} placeholder="Inglewood, CA" />
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Date</label>
                <input id="date" name="date" type="text" required className={inputClass} placeholder="Nov 26, 2024 at 8:00 PM PST" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="price" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Price (USD)</label>
                  <input id="price" name="price" type="number" step="0.01" min="0" required className={inputClass} placeholder="375.00" />
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Capacity</label>
                  <input id="capacity" name="capacity" type="number" min="1" required className={inputClass} placeholder="500" />
                </div>
                <div>
                  <label htmlFor="tier" className="block text-xs text-on-surface-variant mb-1.5 tracking-wide">Tier Label</label>
                  <input id="tier" name="tier" type="text" className={inputClass} placeholder="VIP" />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-error" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold py-3.5 rounded-xl text-sm disabled:opacity-50"
              id="create-event-btn"
            >
              {isLoading ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>
      </main>
    </AuthGuard>
  );
}
