import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCheckout from "./EventCheckout";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

async function getEvent(eventId: string) {
  try {
    const eventRef = doc(db, "events", eventId);
    const snap = await getDoc(eventRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) return { title: "Event Not Found | Emperia" };

  const name = (event as Record<string, unknown>).name as string;
  return {
    title: `${name} | Emperia Experiences`,
    description: `Get exclusive tickets for ${name}. VIP suites, backstage access, and white-glove hospitality.`,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) notFound();

  const e = event as Record<string, unknown>;
  const name = (e.name as string) ?? "Untitled Event";
  const venue = (e.venue as string) ?? "Venue TBA";
  const city = (e.city as string) ?? "";
  const date = (e.date as string) ?? "";
  const description = (e.description as string) ?? "";
  const priceCents = (e.priceCents as number) ?? 0;
  const totalCapacity = (e.total_capacity as number) ?? 0;
  const ticketsSold = (e.ticketsSold as number) ?? 0;
  const remaining = totalCapacity > 0 ? totalCapacity - ticketsSold : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        {/* ΓöÇΓöÇ Hero ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
        <section className="relative py-[100px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-void to-void" />
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-container/10 blur-[120px] glow-pulse" />
          <div className="absolute -bottom-48 -left-48 w-[400px] h-[400px] rounded-full bg-gold/6 blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
            <span className="label-upper text-gold tracking-[0.15em] mb-4 block">{date}</span>
            <h1 className="display-lg mb-4">{name}</h1>
            <p className="text-on-surface-variant text-lg tracking-wide">
              {venue}{city ? ` ΓÇó ${city}` : ""}
            </p>
          </div>
        </section>

        {/* ΓöÇΓöÇ Content ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
        <section className="py-[80px]">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Left column ΓÇö Event details */}
            <div className="lg:col-span-3">
              <h2 className="headline-lg mb-6">About This Experience</h2>
              <p className="text-on-surface-variant text-base leading-relaxed tracking-wide mb-8">
                {description || "An exclusive Emperia experience. More details coming soon."}
              </p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface-container-low rounded-xl p-5">
                  <span className="label-upper text-gold text-[10px] mb-2 block">Date & Time</span>
                  <p className="text-on-surface text-sm">{date || "TBA"}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-5">
                  <span className="label-upper text-gold text-[10px] mb-2 block">Location</span>
                  <p className="text-on-surface text-sm">{venue}</p>
                  {city && <p className="text-on-surface-variant text-xs mt-0.5">{city}</p>}
                </div>
                <div className="bg-surface-container-low rounded-xl p-5">
                  <span className="label-upper text-gold text-[10px] mb-2 block">Price</span>
                  <p className="text-on-surface text-sm font-medium">
                    ${(priceCents / 100).toFixed(2)}
                  </p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-5">
                  <span className="label-upper text-gold text-[10px] mb-2 block">Availability</span>
                  <p className="text-on-surface text-sm">
                    {remaining !== null ? `${remaining} remaining` : "Available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column ΓÇö Checkout */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 bg-surface-container-low rounded-2xl p-8">
                <h3 className="font-serif text-xl text-on-surface mb-2">Secure Your Spot</h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  Complete your purchase to receive your digital ticket with QR code.
                </p>
                <EventCheckout eventId={eventId} priceCents={priceCents} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
