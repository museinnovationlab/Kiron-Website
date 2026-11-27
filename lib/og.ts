/* The link-preview card (app/opengraph-image.tsx, drawn at build time).

   Exported because Next does NOT deep-merge `openGraph`: a page that declares its own openGraph block replaces the
   parent's entirely, image included (Bearing's lib/og.ts). Every page that sets openGraph spreads this in. The legacy
   /og-image.png still serves, shrunk, for anything that saved its address. */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Kiron: your AI wrote the workout. Kiron runs it.",
} as const;

export const OG_IMAGES = [OG_IMAGE];
