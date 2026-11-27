import type { Metadata } from "next";
import Article from "@/components/article";
import { legalPage } from "@/lib/legacy";
import { pageMeta } from "@/lib/meta";

/* trykiron.com/delete-data, and /delete-data.html (a rewrite in next.config.mjs). Google Play wants a web page
   for deleting an account that works without installing the app; this is Kiron's.
   The words are the old site's, imported by scripts/import-legacy.mjs:
   until the switch, edit the old site and import again. */
const page = legalPage("delete-data");

export const metadata: Metadata = pageMeta(page);

export default function DeleteData() {
  return <Article title={page.h1} dateline={page.date} html={page.body} />;
}
