import type { Metadata } from "next";
import GlyphField from "@/components/glyph-field";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import GetKiron from "@/components/get-kiron";
import PenTitle from "@/components/pen-title";

/* Any address the site doesn't have (an old link, a typo), as Jist's site does it: the hero's type, centred, with two
   ways on. A 404 status, so search engines drop dead addresses. */
export const metadata: Metadata = { title: "Page not found — Kiron", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <GlyphField className="field" theme="auto" cell={96} />
      <SiteNav />
      <main className="nf">
        <div className="wrap">
          <p className="eyebrow">Page not found</p>
          <PenTitle as="h1" align="center">
            This page isn&rsquo;t here.
          </PenTitle>
          <p className="lede">It may have moved, or the link may be mistyped.</p>
          <div className="hero-cta">
            <a className="btn" href="/">
              Go to the home page
            </a>
            <GetKiron variant="soft" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
