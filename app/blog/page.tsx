import type { Metadata } from "next";
import Article from "@/components/article";
import { blogIndex } from "@/lib/legacy";
import { OG_IMAGES } from "@/lib/og";

/* trykiron.com/blog/, WITH its trailing slash: that's the address Google has and the sitemap lists. next.config.mjs
   turns off Next's own slash-stripping redirect for it, and sends /blog to /blog/, as Netlify did. */
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
        {index.posts.map((p) => (
          <a className="post-card" href={p.href} key={p.slug}>
            <span className="meta">{p.meta}</span>
            <h2>{p.title}</h2>
            <p>{p.excerpt}</p>
          </a>
        ))}
      </div>
    </Article>
  );
}
