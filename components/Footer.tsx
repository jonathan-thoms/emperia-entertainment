import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-auto" id="site-footer">
      {/* ── Ambient glow line ────────────────────────────────────────── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-outline-variant to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* ── Brand ─────────────────────────────────────────────────── */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-gold-container flex items-center justify-center">
                <span className="text-gold-on font-serif font-bold text-xs">E</span>
              </div>
              <span className="font-serif text-base text-on-surface">Emperia</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed tracking-wide max-w-[240px]">
              Curating unforgettable experiences at the world&apos;s most sought-after events.
            </p>
          </div>

          {/* ── Navigation ────────────────────────────────────────────── */}
          <div>
            <h4 className="label-upper mb-4 text-gold">Experiences</h4>
            <ul className="space-y-3">
              {["Concerts", "Galas", "Sporting Events", "Residencies"].map((item) => (
                <li key={item}>
                  <Link
                    href="/events"
                    className="text-sm text-on-surface-variant hover:text-on-surface transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="label-upper mb-4 text-gold">Company</h4>
            <ul className="space-y-3">
              {["About Us", "Careers", "Press Enquiries", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-on-surface-variant hover:text-on-surface transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="label-upper mb-4 text-gold">Legal</h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-on-surface-variant hover:text-on-surface transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────── */}
        <div className="mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-outline-variant/30 to-transparent hidden sm:block" />
          <p className="text-xs text-on-surface-variant/60 tracking-wider shrink-0">
            © {new Date().getFullYear()} Emperia Experiences. All rights reserved.
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-outline-variant/30 to-transparent hidden sm:block" />
        </div>
      </div>
    </footer>
  );
}
