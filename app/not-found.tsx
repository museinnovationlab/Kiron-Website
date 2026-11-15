import type { Metadata } from "next";
import GlyphField from "@/components/glyph-field";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import GetKiron from "@/components/get-kiron";

/* Any address the site doesn't have (an old link, a typo), as Jist's site does it: the hero's type, centred, with two
   ways on. A 404 status, so search engines drop dead addresses. */
export const metadata: Metadata = { title: "Page not found — Kiron", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <GlyphField className="field" theme="light" cell={96} />
      <SiteNav />
      <main className="nf">
        <div className="wrap">
          <p className="eyebrow">Page not found</p>
          <h1>This page isn&rsquo;t here.</h1>
          <p className="lede">It may have moved, or the link may be mistyped.</p>
          <div className="hero-cta">
            <a className="btn" href="/">
              Go to the home page
            </a>
            <GetKiron variant="ghost" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
