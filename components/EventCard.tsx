import Link from "next/link";

// ── Gradient backgrounds for event cards (placeholder for images) ────────────
const GRADIENTS: Record<string, string> = {
  purple: "from-[#1a0533] via-[#2d1052] to-[#0e0e0e]",
  gold: "from-[#1a1005] via-[#2a1a08] to-[#0e0e0e]",
  blue: "from-[#0a0a1a] via-[#15152d] to-[#0e0e0e]",
  teal: "from-[#0a1a1a] via-[#0d2d2d] to-[#0e0e0e]",
  rose: "from-[#1a0a0f] via-[#2d1020] to-[#0e0e0e]",
};

interface EventCardProps {
  id: string;
  name: string;
  venue: string;
  city: string;
  date: string;
  tier?: string;
  priceCents: number;
  gradient?: string;
  large?: boolean;
}

export default function EventCard({
  id,
  name,
  venue,
  city,
  date,
  tier,
  priceCents,
  gradient = "purple",
  large = false,
}: EventCardProps) {
  const gradientClasses = GRADIENTS[gradient] ?? GRADIENTS.purple;

  return (
    <Link href={`/events/${id}`} className="group block" id={`event-card-${id}`}>
      <div
        className={`relative ${
          large ? "h-[500px] lg:h-[580px]" : "h-[270px]"
        } rounded-2xl overflow-hidden bg-gradient-to-br ${gradientClasses} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:shadow-luxe`}
      >
        {/* Ambient top glow */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.03] to-transparent" />

        {/* Content */}
        <div className={`absolute inset-0 flex flex-col justify-end ${large ? "p-8 lg:p-10" : "p-6 lg:p-8"}`}>
          {tier && (
            <span className="inline-flex items-center self-start mb-3 px-3 py-1 rounded-full bg-gold/15 border border-gold/25 text-gold text-[10px] font-semibold tracking-[0.12em] uppercase">
              {tier}
            </span>
          )}

          <h3
            className={`font-serif font-normal text-on-surface tracking-tight ${
              large ? "text-4xl lg:text-5xl mb-2" : "text-2xl mb-1"
            }`}
          >
            {name}
          </h3>

          <p className={`text-on-surface-variant tracking-wide ${large ? "text-sm mb-4" : "text-xs mb-3"}`}>
            {venue} • {city}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11px] text-on-surface-variant/60 tracking-wider">
              <span>{date}</span>
            </div>
            <span className="text-sm font-medium text-gold">
              ${(priceCents / 100).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Hover arrow */}
        <div className={`absolute ${large ? "top-6 right-6 w-10 h-10" : "top-4 right-4 w-8 h-8"} rounded-full bg-on-surface/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
          <svg width={large ? 16 : 14} height={large ? 16 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
