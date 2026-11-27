import type { Metadata } from "next";
import Article from "@/components/article";
import { legalPage } from "@/lib/legacy";
import { pageMeta } from "@/lib/meta";

/* trykiron.com/terms, and /terms.html (a rewrite in next.config.mjs). The shipped app opens /terms without .html
   (its paywall and Settings), and App Store Connect lists it.
   The words are the old site's, imported by scripts/import-legacy.mjs:
   until the switch, edit the old site and import again. */
const page = legalPage("terms");

export const metadata: Metadata = pageMeta(page);

export default function Terms() {
  return <Article title={page.h1} dateline={page.date} html={page.body} />;
}
