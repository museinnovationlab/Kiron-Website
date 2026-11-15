import type { Metadata } from "next";
import Article from "@/components/article";
import { blogIndex } from "@/lib/legacy";
import { postCards } from "@/lib/blog";
import { OG_IMAGES } from "@/lib/og";

/* trykiron.com/blog/, WITH its trailing slash: that's the address Google has and the sitemap lists. next.config.mjs
   turns off Next's own slash-stripping redirect for it, and sends /blog to /blog/, as Netlify did. The title and the
   introduction are the old blog's; the list is every post, old and new, newest first (lib/blog.ts). */
const index = blogIndex();

export const metadata: Metadata = {
  title: index.title,
  description: index.description,
  alternates: { canonical: index.canonical },
  openGraph: {
    title: index.title,
    description: index.og.description,
    url: index.canonical,
    siteName: "Kiron",
    type: "website",
    images: OG_IMAGES,
  },
};

export default function Blog() {
  return (
    <Article title="Blog" lede={index.intro}>
      <div className="posts">
        {postCards().map((p) => (
          <a className="card post-card" href={p.href} key={p.slug}>
            {/* "July 17, 2026 · AI Training": the date, and the topic as one of the app's badges */}
            <span className="meta">
              <span className="date">{p.meta.split("·")[0]!.trim()}</span>
              {p.meta.includes("·") && <span className="badge badge-info">{p.meta.split("·")[1]!.trim()}</span>}
            </span>
            <h2>{p.title}</h2>
            <p>{p.excerpt}</p>
          </a>
        ))}
      </div>
    </Article>
  );
}
