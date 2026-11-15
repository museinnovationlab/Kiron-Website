import type { Metadata, Viewport } from "next";
import { Caveat, IBM_Plex_Mono, League_Gothic } from "next/font/google";
import "./globals.css";
import PreviewBar from "@/components/preview-bar";
import { OG_IMAGES } from "@/lib/og";
import { SITE } from "@/content/site";

/* The app's three faces (its tailwind.config.js): League Gothic for titles, IBM Plex Mono for labels and numbers,
   Caveat for a word or two of handwriting. next/font self-hosts them at build time, so there's no request to Google
   Fonts and no layout shift when they land. Body text is the phone's own face, as in the app (globals.css). */
const display = League_Gothic({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
const hand = Caveat({ subsets: ["latin"], weight: ["700"], variable: "--font-hand", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  keywords: SITE.keywords,
  openGraph: {
    title: SITE.title,
    description: SITE.ogDescription,
    url: `${SITE.url}/`,
    siteName: SITE.name,
    type: "website",
    images: OG_IMAGES,
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.ogDescription, images: OG_IMAGES },
  icons: { icon: "/favicon.png", apple: "/brand/app-icon-180.png" },
};

export const viewport: Viewport = { themeColor: "#F2EDE6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${hand.variable}`}>
      <body>
        <PreviewBar />
        {children}
      </body>
    </html>
  );
}
