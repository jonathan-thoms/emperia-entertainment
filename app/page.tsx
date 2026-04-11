import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Static event data (will be replaced by Firestore) ──────────────────────── */
const FEATURED_EVENTS = [
  {
    id: "taylor-swift-eras",
    artist: "Taylor Swift",
    tour: "The Eras Tour",
    venue: "US Bank Stadium",
    city: "Minneapolis, MN",
    date: "July 12–14",
    tier: "PLATINUM",
    gradient: "from-[#1a0533] via-[#2d1052] to-[#0e0e0e]",
    accent: "purple",
  },
  {
    id: "drake-msg",
    artist: "Drake",
    tour: "It's All A Blur",
    venue: "Madison Square Garden",
    city: "New York City",
    date: "Aug 8–10",
    tier: "VIP",
    gradient: "from-[#1a1005] via-[#2a1a08] to-[#0e0e0e]",
    accent: "gold",
  },
  {
    id: "weeknd-sofi",
    artist: "The Weeknd",
    tour: "After Hours Til Dawn",
    venue: "SoFi Stadium",
    city: "Inglewood, CA",
    date: "Nov 26",
    tier: "OBSIDIAN",
    gradient: "from-[#0a0a1a] via-[#15152d] to-[#0e0e0e]",
    accent: "blue",
  },
];

const STATS = [
  { value: "12K+", label: "Guests Hosted" },
  { value: "96%", label: "VIP Satisfaction" },
  { value: "150+", label: "Curated Events" },
  { value: "$2M+", label: "Exclusive Access" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ═══════════════════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* ── Ambient Background Layers ─────────────────────────────── */}
          <div className="absolute inset-0">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0515] via-void to-void" />

            {/* Purple orb — top right */}
            <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-purple-container/10 blur-[120px] glow-pulse" />

            {/* Gold orb — bottom left */}
            <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-gold/8 blur-[100px] glow-pulse" style={{ animationDelay: "2s" }} />

            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(229,226,225,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(229,226,225,0.1) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
              }}
            />
          </div>

          {/* ── Hero Content ──────────────────────────────────────────── */}
          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center pt-32 pb-24">
            {/* Eyebrow */}
            <div className="animate-fade-up mb-6">
              <span className="label-upper text-gold tracking-[0.15em]">
                Elevate Your Attendance
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="display-lg animate-fade-up-delay-1 mb-8">
              <span className="block">Unforgettable Nights.</span>
              <span className="block mt-1">
                <em className="text-gold not-italic">Curated</em> Experiences.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-up-delay-2 text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto leading-relaxed tracking-wide mb-12">
              Access the inaccessible. We provide exclusive suites, backstage
              access, and white-glove hospitality at the world&apos;s most
              anticipated performances.
            </p>

            {/* CTA Group */}
            <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/events"
                className="btn-gold px-8 py-3.5 rounded-full text-sm"
                id="hero-cta-primary"
              >
                Explore Experiences
              </Link>
              <Link
                href="#featured"
                className="btn-ghost px-8 py-3.5 rounded-full text-sm"
                id="hero-cta-secondary"
              >
                View Headliners
              </Link>
            </div>

            {/* Scroll indicator */}
            <div className="animate-fade-up-delay-5 mt-20 flex flex-col items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-on-surface-variant/40">
                Scroll
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-on-surface-variant/30 to-transparent" />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            HEADLINERS SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="featured" className="relative py-[120px]">
          {/* ── Section Header ────────────────────────────────────────── */}
          <div className="mx-auto max-w-7xl px-6 lg:px-10 mb-16">
            <span className="label-upper text-purple-container tracking-[0.12em] mb-3 block">
              Current Headliners
            </span>
            <h2 className="headline-lg max-w-xl">
              The World&apos;s Most Anticipated Performances
            </h2>
          </div>

          {/* ── Event Cards Grid ──────────────────────────────────────── */}
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Featured large card */}
              <div className="lg:col-span-7 group">
                <Link href={`/events/${FEATURED_EVENTS[0].id}`} id="event-card-featured">
                  <div
                    className={`relative h-[500px] lg:h-[580px] rounded-2xl overflow-hidden bg-gradient-to-br ${FEATURED_EVENTS[0].gradient} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:shadow-luxe`}
                  >
                    {/* Ambient inner glow */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-purple-container/10 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-10">
                      {/* Tier badge */}
                      <span className="inline-flex items-center self-start mb-4 px-3 py-1 rounded-full bg-purple-container/20 border border-purple-container/30 text-purple text-[10px] font-semibold tracking-[0.12em] uppercase">
                        {FEATURED_EVENTS[0].tier}
                      </span>

                      <h3 className="font-serif text-4xl lg:text-5xl font-normal mb-2 text-on-surface tracking-tight">
                        {FEATURED_EVENTS[0].artist}
                      </h3>
                      <p className="text-on-surface-variant text-sm mb-4 tracking-wide">
                        {FEATURED_EVENTS[0].tour}
                      </p>

                      <div className="flex items-center gap-6 text-xs text-on-surface-variant/70 tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-purple-container" />
                          {FEATURED_EVENTS[0].venue}
                        </span>
                        <span>{FEATURED_EVENTS[0].date}</span>
                      </div>
                    </div>

                    {/* Hover reveal arrow */}
                    <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-on-surface/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Stacked smaller cards */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {FEATURED_EVENTS.slice(1).map((event, i) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group/card"
                    id={`event-card-${i + 1}`}
                  >
                    <div
                      className={`relative h-[270px] rounded-2xl overflow-hidden bg-gradient-to-br ${event.gradient} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:-translate-y-1 group-hover/card:shadow-luxe`}
                    >
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                        <span
                          className={`inline-flex items-center self-start mb-3 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.12em] uppercase ${
                            event.accent === "gold"
                              ? "bg-gold/15 border border-gold/25 text-gold"
                              : "bg-blue/15 border border-blue/25 text-blue"
                          }`}
                        >
                          {event.tier}
                        </span>

                        <h3 className="font-serif text-2xl font-normal mb-1 text-on-surface">
                          {event.artist}
                        </h3>
                        <p className="text-on-surface-variant text-xs mb-3 tracking-wide">
                          {event.tour}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-on-surface-variant/60 tracking-wider">
                          <span>{event.venue}</span>
                          <span className="text-on-surface-variant/30">·</span>
                          <span>{event.date}</span>
                        </div>
                      </div>

                      {/* Hover reveal arrow */}
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-on-surface/10 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            OBSIDIAN SUITE — VIP SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="vip" className="relative py-[120px]">
          {/* Ambient separator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent" />

          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* ── Text Column ────────────────────────────────────────── */}
              <div>
                <span className="label-upper text-gold tracking-[0.12em] mb-4 block">
                  The Obsidian Suite
                </span>
                <h2 className="headline-lg mb-6">
                  A Private World Within the Show
                </h2>
                <p className="text-on-surface-variant text-base leading-relaxed tracking-wide mb-8">
                  Our private lounge network offers panoramic views, curated
                  cocktail service, and private entry to bypass the crowds.
                  Every detail is considered, every moment is elevated.
                </p>

                {/* Feature list */}
                <ul className="space-y-4 mb-10">
                  {[
                    "Panoramic Stage Views",
                    "Curated Cocktail Service",
                    "Private VIP Entry",
                    "Commemorative Merchandise",
                    "Valet Parking & Concierge",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-gold to-gold-container shrink-0" />
                      <span className="text-sm text-on-surface-variant tracking-wide">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/events"
                  className="btn-ghost px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
                  id="vip-cta"
                >
                  View Amenities
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* ── Visual Column ──────────────────────────────────────── */}
              <div className="relative">
                {/* Main card — atmospheric gradient */}
                <div className="relative h-[440px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#110822] to-surface-container-lowest">
                  {/* Inner ambient glows */}
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-purple-container/15 blur-[80px]" />
                  <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-gold/10 blur-[60px]" />

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-container flex items-center justify-center mb-6">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-on">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <p className="font-serif text-2xl text-on-surface mb-2">
                      The Obsidian Experience
                    </p>
                    <p className="text-xs text-on-surface-variant/60 tracking-[0.15em] uppercase">
                      By Invitation Only
                    </p>
                  </div>
                </div>

                {/* Floating editorial offset card */}
                <div className="absolute -bottom-6 -right-4 lg:-right-8 glass rounded-xl px-5 py-4 max-w-[220px]">
                  <p className="text-[11px] text-gold tracking-[0.1em] uppercase mb-1">
                    Guest Rating
                  </p>
                  <p className="font-serif text-2xl text-on-surface">
                    4.97
                    <span className="text-sm text-on-surface-variant ml-1">/ 5</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            STATS SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="stats" className="relative py-[100px]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />

          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-serif text-3xl md:text-4xl text-gold mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-on-surface-variant/60 tracking-[0.1em] uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="about" className="relative py-[120px]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent" />

          {/* Ambient purple glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-purple-container/5 blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
            <span className="label-upper text-purple tracking-[0.12em] mb-4 block">
              Your Invitation Awaits
            </span>
            <h2 className="display-lg mb-6">
              Stop Attending.{" "}
              <em className="text-gold not-italic">Start Experiencing.</em>
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed tracking-wide mb-10 max-w-xl mx-auto">
              Join a community of discerning guests who refuse to settle for
              ordinary. Your next unforgettable night is one click away.
            </p>
            <Link
              href="/events"
              className="btn-gold px-10 py-4 rounded-full text-sm inline-block"
              id="final-cta"
            >
              Browse All Experiences
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
