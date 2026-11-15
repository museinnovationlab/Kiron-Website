/* The old site's words (content/legacy/*.json, made by scripts/import-legacy.mjs from the old HTML files), for the
   pages that keep the old site's text: privacy, terms, delete-data and the blog's title and introduction. Read at
   build time: every page that uses them is static. The posts themselves, old and new, are read by lib/blog.ts. */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "content", "legacy");
const load = <T>(name: string): T => JSON.parse(readFileSync(join(dir, `${name}.json`), "utf8")) as T;

export type LegalPage = {
  title: string;
  description: string | null;
  canonical: string | null;
  h1: string;
  date: string;
  body: string;
};

/** A post's card on the blog's list. `meta` is "July 17, 2026 · AI Training": the date, then the topic. */
export type PostCard = { href: string; slug: string; meta: string; title: string; excerpt: string };
export type BlogIndex = {
  title: string;
  description: string;
  canonical: string;
  og: { description: string };
  intro: string;
  posts: PostCard[];
};

/** A post, old or new (content/legacy/blog/<slug>.json, content/blog/<slug>.json). `body` is its HTML, without an h1. */
export type Post = {
  title: string;
  description: string;
  canonical: string;
  slug: string;
  h1: string;
  date: string;
  og: { title: string; description: string };
  twitter: { title: string; description: string };
  jsonLd: Record<string, unknown> | null;
  body: string;
};

export const legalPage = (name: "privacy" | "terms" | "delete-data") => load<LegalPage>(name);
export const blogIndex = () => load<BlogIndex>("blog-index");
