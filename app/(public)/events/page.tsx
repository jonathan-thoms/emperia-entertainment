import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";

const GRADIENT_POOL = ["purple", "gold", "blue", "teal", "rose"];

async function getEvents() {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("date", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("[Events] Failed to fetch events:", err);
    return [];
  }
}

export const metadata = {
  title: "Explore Experiences | Emperia",
  description: "Browse our curated selection of exclusive events, concerts, and VIP experiences.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-[120px]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="mb-16">
            <span className="label-upper text-purple-container tracking-[0.12em] mb-3 block">
              All Experiences
            </span>
            <h1 className="display-lg mb-4">Explore Events</h1>
            <p className="text-on-surface-variant text-base max-w-xl tracking-wide">
              From front-row concert seats to private galas — discover your next
              unforgettable night.
            </p>
          </div>

          {/* ── Events Grid ─────────────────────────────────────────── */}
          {events.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif text-2xl text-on-surface mb-3">No events yet</p>
              <p className="text-sm text-on-surface-variant">
                Events will appear here once they are created by an admin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: Record<string, unknown>, i: number) => (
                <EventCard
                  key={event.id as string}
                  id={event.id as string}
                  name={(event.name as string) ?? "Untitled Event"}
                  venue={(event.venue as string) ?? "TBA"}
                  city={(event.city as string) ?? ""}
                  date={(event.date as string) ?? ""}
                  tier={(event.tier as string) ?? undefined}
                  priceCents={(event.priceCents as number) ?? 0}
                  gradient={GRADIENT_POOL[i % GRADIENT_POOL.length]}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
