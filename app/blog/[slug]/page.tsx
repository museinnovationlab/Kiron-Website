import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Article from "@/components/article";
import JsonLd from "@/components/json-ld";
import GetKiron from "@/components/get-kiron";
import { findPost, postCard, postSlugs, wrapTables } from "@/lib/blog";
import { OG_IMAGES } from "@/lib/og";

/* A post. Its address is /blog/<slug>.html, as Google indexed it and the sitemap lists it: next.config.mjs rewrites
   that to this route, and /blog/<slug> serves it too (Netlify did both). The canonical link names the .html address.
   The words, dates and Article data are the post's own: the old site's (content/legacy/blog) or a new post's
   (content/blog, docs/POSTS.md), with Kiron's facts filled in. Any table in it scrolls sideways inside its own box
   (lib/blog.ts, wrapTables).

   A draft is built here too, so it can be read on a preview: marked noindex, with a Draft badge by its crumbs, and left
   off the blog's list and the sitemap until its "draft" is false. */

export const dynamicParams = false;
export const generateStaticParams = () => postSlugs().map((slug) => ({ slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = findPost(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.canonical },
    openGraph: {
      title: p.og.title,
      description: p.og.description,
      url: p.canonical,
      siteName: "Kiron",
      type: "article",
      images: OG_IMAGES,
    },
    twitter: { card: "summary_large_image", title: p.twitter.title, description: p.twitter.description, images: OG_IMAGES },
    // <meta name="robots" content="noindex">: a draft can be read at its address, but search engines leave it out
    ...(p.draft ? { robots: { index: false } } : {}),
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const p = findPost(slug);
  if (!p) notFound();
  const card = postCard(slug);
  // "July 17, 2026 · AI Training": the date, and the post's topic from its card
  const topic = card?.meta.split("·")[1]?.trim();
  return (
    <>
      {p.jsonLd && <JsonLd data={p.jsonLd} />}
      <Article
        crumbs={
          <>
            <a href="/blog/">Blog</a>
            {topic && <span>· {topic}</span>}
            {p.draft && <span className="badge badge-accent">Draft</span>}
          </>
        }
        title={p.h1}
        dateline={p.date}
        html={wrapTables(p.body)}
        after={
          <div className="post-end">
            <GetKiron>Try Kiron free</GetKiron>
            <a className="btn btn-soft" href="/blog/">
              More posts
            </a>
          </div>
        }
      />
    </>
  );
}
