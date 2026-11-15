import type { Metadata } from "next";
import { OG_IMAGES } from "./og";

/* A page's metadata with its own link preview. Next replaces `openGraph` wholesale rather than merging it, so a page
   that sets nothing shows the home page's title and address when it's shared; this gives every page its own. */
export function pageMeta({
  title,
  description,
  canonical,
}: {
  title: string;
  description?: string | null;
  canonical?: string | null;
}): Metadata {
  return {
    title,
    description: description ?? undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description: description ?? undefined,
      url: canonical ?? undefined,
      siteName: "Kiron",
      type: "website",
      images: OG_IMAGES,
    },
  };
}
