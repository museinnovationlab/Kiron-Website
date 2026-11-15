/* The blog takes new posts with no code (lib/blog.ts, docs/POSTS.md): content/blog/<slug>.json plus a card in
   content/blog/index.json. These check the reader on a sample post (test/fixtures/blog, never served), and every real
   new post's shape, so a post that would break its page, the blog's list or the sitemap fails here, before a build. */
import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { legacyPosts, newPosts, published, wrapTables } from "../lib/blog.ts";

const SAMPLE = fileURLToPath(new URL("./fixtures/blog", import.meta.url));
const SITE = "https://trykiron.com";

/** Everything wrong with the new posts in a folder, as sentences; an empty list means they're all fine. */
function problems(dir) {
  const found = [];
  const say = (where, what) => found.push(`${where}: ${what}`);
  const { cards, post } = newPosts(dir);
  const files = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(".json") && f !== "index.json")
        .map((f) => f.slice(0, -5))
    : [];
  if (files.length && !existsSync(join(dir, "index.json"))) say("index.json", "missing, so the posts aren't listed");

  const listed = new Set(cards.map((c) => c.slug));
  for (const slug of files) if (!listed.has(slug)) say(`${slug}.json`, "not listed in index.json");

  const old = new Set(legacyPosts().cards.map((c) => c.slug));
  let previous = Infinity;
  for (const card of cards) {
    const { slug } = card;
    const at = `card ${slug}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug ?? "")) say(at, "slug must be lowercase words joined by hyphens");
    if (old.has(slug)) say(at, "the old site already has a post at this address");
    if (card.href !== `/blog/${slug}.html`) say(at, `href should be /blog/${slug}.html`);
    for (const field of ["title", "excerpt", "meta"]) if (!card[field]?.trim()) say(at, `no ${field}`);
    if (!card.meta?.includes("·")) say(at, 'meta should read "Month D, YYYY · Topic"');
    if (!files.includes(slug)) {
      say(at, `no ${slug}.json`);
      continue;
    }

    const p = post(slug);
    const where = `${slug}.json`;
    const canonical = `${SITE}/blog/${slug}.html`;
    if (p.slug !== slug) say(where, `slug says "${p.slug}"`);
    if (p.canonical !== canonical) say(where, `canonical should be ${canonical}`);
    for (const field of ["title", "description", "h1", "date", "body"]) if (!p[field]?.trim()) say(where, `no ${field}`);
    for (const field of ["og", "twitter"])
      if (!p[field]?.title?.trim() || !p[field]?.description?.trim()) say(where, `${field} needs a title and a description`);
    if (p.jsonLd?.["@type"] !== "Article") say(where, 'jsonLd should be an "Article"');
    if (p.jsonLd?.mainEntityOfPage !== canonical) say(where, `jsonLd.mainEntityOfPage should be ${canonical}`);
    if (Number.isNaN(published(p))) say(where, "date doesn't read as a date (jsonLd.datePublished as 2026-11-20)");
    if (card.meta?.split("·")[0].trim() !== p.date) say(at, `meta's date should be the post's date, "${p.date}"`);

    // the page draws its own h1, and the body goes into the page as it is: no scripts, styles or frames in it
    if (/<h1\b/i.test(p.body ?? "")) say(where, "body has an <h1> (the page draws the title)");
    if (/<(script|style|iframe|form)\b|\son[a-z]+\s*=/i.test(p.body ?? "")) say(where, "body has a script, style, frame, form or on…= handler");
    for (const table of (p.body ?? "").match(/<table\b[\s\S]*?<\/table>/gi) ?? [])
      if (!/<th\b/i.test(table)) say(where, "a table has no header row (<th> cells)");

    const time = published(p);
    if (time > previous) say(at, "index.json lists the posts newest first; this one is newer than the one above it");
    previous = Math.min(previous, time);
  }
  return found;
}

test("the reader takes a new post from its folder: the card, the post and its date", () => {
  const { cards, post } = newPosts(SAMPLE);
  assert.equal(cards.length, 1);
  const p = post(cards[0].slug);
  assert.equal(p.h1, "A Sample Post With a Five-Column Table");
  assert.equal(published(p), Date.parse("2026-11-15"));
  // newer than every old post, so it would head the blog's list
  const old = legacyPosts();
  for (const card of old.cards) assert.ok(published(p) > published(old.post(card.slug)), card.slug);
});

test("no content/blog folder means no new posts, not an error", () => {
  assert.deepEqual(newPosts(join(SAMPLE, "no-such-folder")).cards, []);
});

test("the sample post passes the checks every new post must pass", () => {
  assert.deepEqual(problems(SAMPLE), []);
});

test("every new post in content/blog is complete, listed once and newest first", () => {
  assert.deepEqual(problems("content/blog"), []);
});

test("the checks catch a broken post", () => {
  // a copy of the sample with five things wrong, in a folder of its own, plus a post nobody listed
  const dir = mkdtempSync(join(tmpdir(), "kiron-blog-"));
  try {
    const sample = JSON.parse(readFileSync(join(SAMPLE, "sample-post-with-a-table.json"), "utf8"));
    const broken = {
      ...sample,
      canonical: `${SITE}/blog/sample-post-with-a-table`,
      og: { title: sample.og.title },
      body: `<h1>Hi</h1><table><tr><td>no header</td></tr></table>${sample.body}`,
    };
    writeFileSync(join(dir, "sample-post-with-a-table.json"), JSON.stringify(broken));
    writeFileSync(join(dir, "forgotten.json"), JSON.stringify(sample));
    const cards = JSON.parse(readFileSync(join(SAMPLE, "index.json"), "utf8"));
    writeFileSync(join(dir, "index.json"), JSON.stringify([{ ...cards[0], meta: "November 16, 2026 · Comparisons" }]));

    const found = problems(dir).join("\n");
    for (const expected of [
      "forgotten.json: not listed",
      "canonical should be",
      "og needs a title and a description",
      "meta's date should be the post's date",
      "body has an <h1>",
      "a table has no header row",
    ])
      assert.ok(found.includes(expected), `missed "${expected}" in:\n${found}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("each table is put in a box that scrolls by itself, named by its caption", () => {
  const html = '<p>x</p><table><caption>Kiron vs "other" apps</caption><tr><th>a</th></tr></table><table><tr><th>b</th></tr></table>';
  const out = wrapTables(html);
  assert.equal(out.match(/<div class="table-scroll" role="region" tabindex="0"/g)?.length, 2);
  // the caption: shown above the box (hidden from screen readers, which read the table's own) and naming the box
  assert.match(out, /<p class="table-caption" aria-hidden="true">Kiron vs "other" apps<\/p><div class="table-scroll"/);
  assert.match(out, /aria-label="Kiron vs &quot;other&quot; apps"><table>/);
  assert.match(out, /<\/table><\/div><div class="table-scroll" role="region" tabindex="0" aria-label="Table"><table><tr><th>b<\/th><\/tr><\/table><\/div>$/);
  assert.equal(wrapTables("<p>no tables</p>"), "<p>no tables</p>");
});
