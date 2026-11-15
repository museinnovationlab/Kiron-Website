import type { MetadataRoute } from "next";
import { postCards } from "@/lib/blog";

/* The old sitemap.xml's addresses, unchanged: /blog/ with its slash, each post and the legal pages at .html. Those are
   the addresses Google has and each page's canonical link names, so the switch changes nothing it has to relearn.
   Generated, so every published post is here, old or new (content/blog, docs/POSTS.md), newest first; drafts aren't. */
const BASE = "https://trykiron.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/blog/`, changeFrequency: "weekly", priority: 0.8 },
    ...postCards().map(({ slug }) => ({
      url: `${BASE}/blog/${slug}.html`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${BASE}/support.html`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy.html`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms.html`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
