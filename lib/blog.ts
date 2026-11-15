/* The blog: the old site's five posts (content/legacy/blog, imported from git by scripts/import-legacy.mjs, never
   edited by hand) and posts written for this site (content/blog). A new post needs no code, only two files:

     content/blog/<slug>.json   the post, in the old posts' shape (the Post type in lib/legacy.ts; `body` is its HTML)
     content/blog/index.json    its card for the blog's list, { href, slug, meta, title, excerpt }, newest first

   docs/POSTS.md has the details. Every post, old or new, answers at /blog/<slug>.html (its canonical address) and at
   /blog/<slug>, is listed newest first on /blog/, and is in the sitemap. Read at build time: every blog page is static.

   Only types come from other project files, so `node --test` can load this file as it is (test/blog.test.mjs). */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { BlogIndex, Post, PostCard } from "./legacy";

const CONTENT = join(process.cwd(), "content");
const read = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;

type Source = { cards: PostCard[]; post: (slug: string) => Post };

/** The old site's posts, in the old blog's order. */
export function legacyPosts(dir = join(CONTENT, "legacy")): Source {
  return {
    cards: read<BlogIndex>(join(dir, "blog-index.json")).posts,
    post: (slug) => read<Post>(join(dir, "blog", `${slug}.json`)),
  };
}

/** Posts written for this site. No content/blog folder, or no index.json in it, means none yet. The index is a list of
    cards, or { "posts": [...] } as the old blog's index has them. */
export function newPosts(dir = join(CONTENT, "blog")): Source {
  const index = join(dir, "index.json");
  const list = existsSync(index) ? read<PostCard[] | { posts: PostCard[] }>(index) : [];
  return {
    cards: Array.isArray(list) ? list : list.posts,
    post: (slug) => read<Post>(join(dir, `${slug}.json`)),
  };
}

/** When a post was published: its Article data's datePublished ("2026-07-17"), else its dateline ("July 17, 2026"). */
export function published(post: Post): number {
  const iso = post.jsonLd?.datePublished;
  return Date.parse(typeof iso === "string" ? iso : post.date);
}

/** Every post with where to read it from: the new ones first, so a tie in dates keeps them above the old. */
function everyPost() {
  return [newPosts(), legacyPosts()].flatMap((source) =>
    source.cards.map((card) => ({ card, load: () => source.post(card.slug) })),
  );
}

/** Every post's card for the blog's list, newest first. Posts from the same day keep their index's order. */
export function postCards(): PostCard[] {
  return everyPost()
    .map((entry, i) => ({ card: entry.card, i, at: published(entry.load()) }))
    .sort((a, b) => b.at - a.at || a.i - b.i)
    .map((entry) => entry.card);
}

/** Every post's slug: the address names /blog/<slug>.html serves. */
export const postSlugs = () => postCards().map((card) => card.slug);

/** A post by its slug, new or old, or undefined if there's no such post. */
export function findPost(slug: string): Post | undefined {
  return everyPost()
    .find((entry) => entry.card.slug === slug)
    ?.load();
}

/** A post's HTML with each <table> in a box that scrolls sideways by itself, so a wide comparison can't widen the page
    on a phone. The box takes keyboard focus, so it can be scrolled without a mouse, and is named by the table's
    <caption> if it has one. That caption is also shown above the box (inside, it would scroll away with the table);
    the copy is hidden from screen readers, which read the table's own. (Tables inside tables aren't expected in a post
    and aren't handled.) */
export function wrapTables(html: string): string {
  return html.replace(/<table\b[\s\S]*?<\/table>/gi, (table) => {
    const caption = /<caption[^>]*>([\s\S]*?)<\/caption>/i
      .exec(table)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const label = caption ? `<p class="table-caption" aria-hidden="true">${caption}</p>` : "";
    const name = (caption || "Table").replace(/"/g, "&quot;");
    return `${label}<div class="table-scroll" role="region" tabindex="0" aria-label="${name}">${table}</div>`;
  });
}
