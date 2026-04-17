import type { Metadata } from "next";
import { Noto_Serif, Manrope, Geist } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Emperia Experiences — Curated Luxury Events",
  description:
    "Access the inaccessible. Emperia curates exclusive suites, backstage access, and white-glove hospitality at the world's most anticipated performances.",
  keywords: ["luxury events", "VIP tickets", "exclusive experiences", "concert tickets", "emperia"],
  openGraph: {
    title: "Emperia Experiences",
    description: "Unforgettable Nights. Curated Experiences.",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", notoSerif.variable, manrope.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-void text-on-surface font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
