import type { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";
import GlyphField from "./glyph-field";
import SiteNav from "./site-nav";
import SiteFooter from "./site-footer";
import ShareView from "./share-view";
import { OG_IMAGES } from "@/lib/og";
import { SITE } from "@/content/site";
import { FIRESTORE, SHARE_ID, fetchShare, kindFor, previewFor, usesMiles } from "@/lib/share";

/* /w/<id> and /g/<id>: a shared workout or gym. Rendered on each request, because the link preview (Messages,
   WhatsApp, Slack) should name the workout: those apps read the page's meta tags and never run its script, so the
   server reads the share first, as the old site's edge function did, and gives up after 1.5 s. Any failure serves the
   page with the generic title, and the browser reads the share itself.

   React's cache() makes the metadata and the page share one read per request. KIRON_SHARE_API points the server at a
   Firestore emulator for local tests (e.g. http://127.0.0.1:8080/v1); unset, it's the real database. */

type Props = { params: Promise<{ id: string }> };

const lookup = cache((letter: "w" | "g", id: string) =>
  fetchShare(id, kindFor(letter), { api: process.env.KIRON_SHARE_API || FIRESTORE }),
);

export function sharePage(letter: "w" | "g") {
  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const result = await lookup(letter, id);
    const preview = result.status === "found" ? previewFor(result.share) : null;
    const title = preview?.title ?? "Shared from Kiron";
    const description = preview?.description ?? "A workout or gym setup, ready to add in Kiron.";
    return {
      title: preview ? `${preview.title} · Shared from Kiron` : "Shared from Kiron",
      description,
      robots: { index: false },
      openGraph: { title, description, url: SHARE_ID.test(id) ? `${SITE.url}/${letter}/${id}` : undefined, siteName: "Kiron", type: "website", images: OG_IMAGES },
      twitter: { card: "summary_large_image", title, description, images: OG_IMAGES },
    };
  }

  async function Page({ params }: Props) {
    const { id } = await params;
    const [result, h] = await Promise.all([lookup(letter, id), headers()]);
    return (
      <>
        <GlyphField className="field" theme="light" cell={96} />
        <SiteNav />
        <main className="page">
          <div className="wrap">
            <ShareView
              letter={letter}
              kind={kindFor(letter)}
              id={id}
              initial={result}
              miles={usesMiles(h.get("accept-language"))}
            />
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return { generateMetadata, Page };
}
