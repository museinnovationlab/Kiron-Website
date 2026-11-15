import GlyphField from "./glyph-field";
import { SITE } from "@/content/site";

/* Shared footer, on the app's dark ground with its own glyph field in chalk. The legal links use the addresses the
   shipped app and the store listings use: /privacy and /terms (the app's paywall and Settings open them without
   .html), /support, and /delete-data, which Google Play lists as the web page for deleting an account. */
export default function SiteFooter() {
  return (
    <footer>
      <GlyphField className="band-field" theme="dark" cell={104} />
      <div className="wrap">
        <div className="fgrid">
          <div>
            <div className="fbrand">Kiron</div>
            <p style={{ fontSize: 14, marginTop: 10 }}>{SITE.footerLine}</p>
          </div>
          <div className="fnav">
            <a href="/#how">How it works</a>
            <a href="/#pricing">Pricing</a>
            <a href="/blog/">Blog</a>
            <a href="/support">Support</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/delete-data">Delete your data</a>
          </div>
        </div>
        <p className="fine">
          © {new Date().getFullYear()} Berkeley Labs LLC. All rights reserved. Questions:{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
      </div>
    </footer>
  );
}
