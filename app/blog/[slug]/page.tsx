import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Article from "@/components/article";
import JsonLd from "@/components/json-ld";
import GetKiron from "@/components/get-kiron";
import { blogIndex, post, postSlugs } from "@/lib/legacy";
import { OG_IMAGES } from "@/lib/og";

/* A post. Its address is /blog/<slug>.html, as Google indexed it and the sitemap lists it: next.config.mjs rewrites
   that to this route, and /blog/<slug> serves it too (Netlify did both). The canonical link names the .html address.
   The words, dates and Article data are the old site's (content/legacy/blog). */

export const dynamicParams = false;
export const generateStaticParams = () => postSlugs().map((slug) => ({ slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!postSlugs().includes(slug)) return {};
  const p = post(slug);
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
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  if (!postSlugs().includes(slug)) notFound();
  const p = post(slug);
  const card = blogIndex().posts.find((c) => c.slug === slug);
  // "July 17, 2026 · AI Training": the date, and the post's topic from the blog's list
  const topic = card?.meta.split("·")[1]?.trim();
  return (
    <>
      {p.jsonLd && <JsonLd data={p.jsonLd} />}
      <Article
        crumbs={
          <>
            <a href="/blog/">Blog</a>
            {topic && <span>· {topic}</span>}
          </>
        }
        title={p.h1}
        dateline={p.date}
        html={p.body}
        after={
          <div className="post-end">
            <GetKiron>Try Kiron free</GetKiron>
            <a className="btn btn-ghost" href="/blog/">
              More posts
            </a>
          </div>
        }
      />
    </>
  );
}
