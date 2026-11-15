/* The blog: the old site's five posts (content/legacy/blog, imported from git by scripts/import-legacy.mjs, never
   edited by hand) and posts written for this site (content/blog). A new post needs no code, only files:

     content/blog/<slug>.json   the post, in the old posts' shape (the Post type in lib/legacy.ts; `body` is its HTML)
     content/blog/index.json    its card for the blog's list, { href, slug, meta, title, excerpt }, newest first
     content/blog/kiron.json    Kiron's own facts (prices, plans), which a new post writes as {{kiron:<key>}}

   docs/POSTS.md has the details. Every post, old or new, answers at /blog/<slug>.html (its canonical address) and at
   /blog/<slug>. A published one is listed newest first on /blog/ and is in the sitemap; a draft ("draft": true) is
   built at its address for review, marked noindex, and listed nowhere. Read at build time: every blog page is static.

   Only types come from other project files, so `node --test` can load this file as it is (test/blog.test.mjs). */
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { BlogIndex, Post, PostCard } from "./legacy";

const CONTENT = join(process.cwd(), "content");
const read = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;
/** a file's name for an error message: content/blog/x.json, not the whole path */
const named = (file: string) => relative(process.cwd(), file) || file;

export type Source = { cards: PostCard[]; post: (slug: string) => Post };

/** The old site's posts, in the old blog's order. They're never drafts and never use Kiron's facts. */
export function legacyPosts(dir = join(CONTENT, "legacy")): Source {
  return {
    cards: read<BlogIndex>(join(dir, "blog-index.json")).posts,
    post: (slug) => read<Post>(join(dir, "blog", `${slug}.json`)),
  };
}

/** Posts written for this site, with Kiron's facts filled in. No content/blog folder, or no index.json in it, means
    none yet. The index is a list of cards, or { "posts": [...] } as the old blog's index has them. */
export function newPosts(dir = join(CONTENT, "blog")): Source {
  const index = join(dir, "index.json");
  const list = existsSync(index) ? read<PostCard[] | { posts: PostCard[] }>(index) : [];
  const facts = readFacts(dir);
  return {
    cards: (Array.isArray(list) ? list : list.posts).map((card) =>
      fillFacts(card, facts, `${named(index)} (the card for ${card.slug})`),
    ),
    post: (slug) => {
      const file = join(dir, `${slug}.json`);
      return fillFacts(read<Post>(file), facts, named(file));
    },
  };
}

/* ---------- Kiron's facts ---------- */

/** Kiron's own facts for new posts (content/blog/kiron.json), a flat object of text: { "price-annual": "$49.99 a
    year", ... }. A post writes {{kiron:price-annual}} wherever the fact goes, so when Kiron's pricing or plans change,
    that one file changes and every post follows. */
export type Facts = Record<string, string>;

const FACT = /\{\{\s*kiron:([\w.-]+)\s*\}\}/g;

/** The facts file in a folder, or null if there isn't one. Throws if it isn't an object of text values. */
export function readFacts(dir: string): Facts | null {
  const file = join(dir, "kiron.json");
  if (!existsSync(file)) return null;
  const facts = read<unknown>(file);
  if (!facts || typeof facts !== "object" || Array.isArray(facts))
    throw new Error(`${named(file)} should be an object of "key": "text" pairs`);
  for (const [key, value] of Object.entries(facts))
    if (typeof value !== "string") throw new Error(`${named(file)}: "${key}" should be text, in quotes`);
  return facts as Facts;
}

/** Every string inside a value, however deep (a post's title, its og and twitter text, its Article data, its body). */
function* texts(value: unknown): Generator<string> {
  if (typeof value === "string") yield value;
  else if (Array.isArray(value)) for (const item of value) yield* texts(item);
  else if (value && typeof value === "object") for (const item of Object.values(value)) yield* texts(item);
}

/** A post or card with each {{kiron:<key>}} in any of its text replaced by that fact, as written. Throws on a key the
    facts file doesn't have, and on braces left over afterwards ("{{kiron:price-annual}", a missing brace), so neither
    can reach a page. HTML comments in a body (the <!-- update:… --> markers) stay as they are. */
export function fillFacts<T>(value: T, facts: Facts | null, where: string): T {
  // through JSON, so the facts land in nested text too (the Article data), each escaped as a JSON string
  const filled = JSON.parse(
    JSON.stringify(value).replace(FACT, (_, key: string) => {
      if (!facts) throw new Error(`${where} uses {{kiron:${key}}}, but there's no kiron.json beside it`);
      if (!Object.hasOwn(facts, key)) throw new Error(`${where} uses {{kiron:${key}}}, which kiron.json doesn't have`);
      return JSON.stringify(facts[key]).slice(1, -1);
    }),
  ) as T;
  for (const text of texts(filled)) {
    const left = /\{\{|\}\}|\{\s*kiron:/i.exec(text);
    if (left)
      throw new Error(
        `${where} still has braces after Kiron's facts were filled in: "…${text.slice(Math.max(0, left.index - 24), left.index + 32)}…" (a typo in a {{kiron:…}}?)`,
      );
  }
  return filled;
}

/* ---------- the blog as a whole ---------- */

/** When a post was published: its Article data's datePublished ("2026-07-17"), else its dateline ("July 17, 2026"). */
export function published(post: Post): number {
  const iso = post.jsonLd?.datePublished;
  return Date.parse(typeof iso === "string" ? iso : post.date);
}

const SOURCES = () => [newPosts(), legacyPosts()];

/** Every post, drafts too, with where to read it from: the new ones first, so a tie in dates keeps them above. */
function everyPost(sources: Source[]) {
  return sources.flatMap((source) => source.cards.map((card) => ({ card, load: () => source.post(card.slug) })));
}

/** The published posts' cards for the blog's list and the sitemap, newest first. Posts from the same day keep their
    index's order. Drafts aren't here. */
export function postCards(sources = SOURCES()): PostCard[] {
  return everyPost(sources)
    .map((entry, i) => ({ card: entry.card, i, post: entry.load() }))
    .filter((entry) => !entry.post.draft)
    .map((entry) => ({ ...entry, at: published(entry.post) }))
    .sort((a, b) => b.at - a.at || a.i - b.i)
    .map((entry) => entry.card);
}

/** Every post's slug, drafts too: the addresses /blog/<slug>.html serves. */
export const postSlugs = (sources = SOURCES()) => everyPost(sources).map((entry) => entry.card.slug);

/** A post by its slug, new or old, draft or not, or undefined if there's no such post. */
export function findPost(slug: string, sources = SOURCES()): Post | undefined {
  return everyPost(sources)
    .find((entry) => entry.card.slug === slug)
    ?.load();
}

/** A post's card by its slug (for the topic in its page's crumbs), draft or not. */
export function postCard(slug: string, sources = SOURCES()): PostCard | undefined {
  return everyPost(sources).find((entry) => entry.card.slug === slug)?.card;
}

/* ---------- tables ---------- */

/** A post's HTML with each <table> in a box that scrolls sideways by itself, so a wide comparison can't widen the page
    on a phone. Posts write the box themselves (<div class="table-wrap"><table>…</table></div>); a table without one
    gets one. The box takes keyboard focus, so it can be scrolled without a mouse, and is named by the table's
    <caption>. The caption is also shown above the box (inside, it would scroll away with the table); that copy is
    hidden from screen readers, which read the table's own. (Tables inside tables aren't expected and aren't handled.) */
export function wrapTables(html: string): string {
  return html.replace(
    /(<div class="table-wrap">\s*)?(<table\b[\s\S]*?<\/table>)(\s*<\/div>)?/gi,
    (_, open: string | undefined, table: string, close: string | undefined) => {
      const caption = /<caption[^>]*>([\s\S]*?)<\/caption>/i
        .exec(table)?.[1]
        ?.replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const label = caption ? `<p class="table-caption" aria-hidden="true">${caption}</p>` : "";
      const name = (caption || "Table").replace(/"/g, "&quot;");
      const box = `${label}<div class="table-wrap" role="region" tabindex="0" aria-label="${name}">${table}</div>`;
      // the post's own box becomes this one; a stray half (a closing </div> that belongs to something else) stays
      return open && close ? box : `${open ?? ""}${box}${close ?? ""}`;
    },
  );
}
