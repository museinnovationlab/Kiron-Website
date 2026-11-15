/* The blog takes new posts with no code (lib/blog.ts, docs/POSTS.md): content/blog/<slug>.json plus a card in
   content/blog/index.json, with Kiron's facts from content/blog/kiron.json. These check the reader on samples
   (test/fixtures/blog, never served: a post built from every block, and a draft), and every real new post, so a post
   that would break its page, the blog's list or the sitemap, or show raw {{braces}}, fails here, before a build. */
import { strict as assert } from "node:assert";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { fillFacts, findPost, legacyPosts, newPosts, postCard, postCards, postSlugs, published, wrapTables } from "../lib/blog.ts";

const SAMPLE = fileURLToPath(new URL("./fixtures/blog", import.meta.url));
const SITE = "https://trykiron.com";
const NOT_POSTS = new Set(["index.json", "kiron.json"]);

/** Everything wrong with the new posts in a folder, as sentences; an empty list means they're all fine. */
function problems(dir) {
  const found = [];
  const say = (where, what) => found.push(`${where}: ${what}`);
  let source;
  try {
    source = newPosts(dir); // reads the index and kiron.json, and fills the facts into every card
  } catch (error) {
    return [error.message];
  }
  const { cards, post } = source;
  const files = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(".json") && !NOT_POSTS.has(f))
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

    let p;
    try {
      p = post(slug); // Kiron's facts filled in: throws on an unknown key or braces left over
    } catch (error) {
      say(`${slug}.json`, error.message);
      continue;
    }
    const where = `${slug}.json`;
    const canonical = `${SITE}/blog/${slug}.html`;
    if (p.slug !== slug) say(where, `slug says "${p.slug}"`);
    if (p.canonical !== canonical) say(where, `canonical should be ${canonical}`);
    if ("draft" in p && typeof p.draft !== "boolean") say(where, '"draft" should be true or false, without quotes');
    for (const field of ["title", "description", "h1", "date", "body"]) if (!p[field]?.trim()) say(where, `no ${field}`);
    for (const field of ["og", "twitter"])
      if (!p[field]?.title?.trim() || !p[field]?.description?.trim()) say(where, `${field} needs a title and a description`);
    if (p.jsonLd?.["@type"] !== "Article") say(where, 'jsonLd should be an "Article"');
    if (p.jsonLd?.mainEntityOfPage !== canonical) say(where, `jsonLd.mainEntityOfPage should be ${canonical}`);
    if (Number.isNaN(published(p))) say(where, "date doesn't read as a date (jsonLd.datePublished as 2026-11-20)");
    if (card.meta?.split("·")[0].trim() !== p.date) say(at, `meta's date should be the post's date, "${p.date}"`);

    // the page draws its own h1, and the body goes into the page as it is: no scripts, styles or frames in it
    const body = p.body ?? "";
    if (/<h1\b/i.test(body)) say(where, "body has an <h1> (the page draws the title)");
    if (/<(script|style|iframe|form)\b|\son[a-z]+\s*=/i.test(body)) say(where, "body has a script, style, frame, form or on…= handler");
    for (const table of body.match(/<table\b[\s\S]*?<\/table>/gi) ?? [])
      if (!/<th\b/i.test(table)) say(where, "a table has no header row (<th> cells)");
    // passages marked to change with a future release open and close in pairs, so a later edit finds both ends
    const marks = (re) => [...body.matchAll(re)].map((m) => m[1]);
    const opens = marks(/<!--\s*update:([\w-]+)\s*-->/g);
    const closes = marks(/<!--\s*\/update:([\w-]+)\s*-->/g);
    for (const name of new Set([...opens, ...closes])) {
      const [o, c] = [opens.filter((n) => n === name).length, closes.filter((n) => n === name).length];
      if (o !== c) say(where, `<!-- update:${name} --> opens ${o} time(s) and closes ${c}`);
    }

    // newest first, among the published ones (a draft's place in the index doesn't matter until it's published)
    if (!p.draft) {
      const time = published(p);
      if (time > previous) say(at, "index.json lists the posts newest first; this one is newer than the one above it");
      previous = Math.min(previous, time);
    }
  }
  return found;
}

/** A copy of the samples in a folder of their own, with some files replaced, for the checks to find fault with. */
function withSamples(change, run) {
  const dir = mkdtempSync(join(tmpdir(), "kiron-blog-"));
  try {
    cpSync(SAMPLE, dir, { recursive: true });
    change(dir);
    return run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const readJson = (dir, name) => JSON.parse(readFileSync(join(dir, name), "utf8"));
const writeJson = (dir, name, value) => writeFileSync(join(dir, name), JSON.stringify(value));

test("the reader takes new posts from their folder, with Kiron's facts filled into all their text", () => {
  const { cards, post } = newPosts(SAMPLE);
  assert.deepEqual(
    cards.map((c) => c.slug),
    ["sample-draft", "sample-post-with-a-table"],
  );
  const p = post("sample-post-with-a-table");
  assert.equal(p.h1, "A Sample Post With a Five-Column Table");
  assert.equal(published(p), Date.parse("2026-11-15"));
  // no braces anywhere, and each fact where its {{kiron:…}} was: body, description, og, twitter, Article data, card
  assert.doesNotMatch(JSON.stringify(p), /\{\{|kiron:/);
  assert.match(p.body, /<td>\$4\.99 a week or \$49\.99 a year<\/td>/);
  assert.match(p.body, /<p>Prices checked November 15, 2026\.<\/p>/);
  assert.equal(p.description.endsWith("Kiron is $49.99 a year."), true);
  assert.equal(p.og.description, "The test suite's sample post. Kiron is $4.99 a week or $49.99 a year.");
  assert.equal(p.twitter.description, "The test suite's sample post. Kiron is $49.99 a year.");
  assert.match(p.jsonLd.description, /Kiron is \$4\.99 a week with a 3-day free trial, or \$49\.99 a year\.$/);
  assert.match(cards[1].excerpt, /Kiron is \$49\.99 a year\.$/);
  // the markers for passages that change with a release are HTML comments, kept as they are (invisible on the page)
  assert.match(p.body, /<!-- update:kiron-pricing -->\n<p>Kiron is \$4\.99 a week[\s\S]*<!-- \/update:kiron-pricing -->/);
  // newer than every old post, so it would head the blog's list
  const old = legacyPosts();
  for (const card of old.cards) assert.ok(published(p) > published(old.post(card.slug)), card.slug);
});

test("a draft is built at its address but left off the blog's list", () => {
  const sources = [newPosts(SAMPLE), legacyPosts()];
  const listed = postCards(sources).map((c) => c.slug);
  assert.equal(listed[0], "sample-post-with-a-table", "the newest published post heads the list");
  assert.ok(!listed.includes("sample-draft"), "the draft isn't listed (nor in the sitemap, which uses this list)");
  assert.equal(listed.length, 6);
  assert.ok(postSlugs(sources).includes("sample-draft"), "but its page is built");
  assert.equal(findPost("sample-draft", sources)?.draft, true);
  assert.equal(postCard("sample-draft", sources)?.meta, "November 20, 2026 · Comparisons");
});

test("no content/blog folder means no new posts, not an error", () => {
  assert.deepEqual(newPosts(join(SAMPLE, "no-such-folder")).cards, []);
});

test("the samples pass the checks every new post must pass", () => {
  assert.deepEqual(problems(SAMPLE), []);
});

test("every new post in content/blog is complete, listed once and newest first, with every fact found", () => {
  assert.deepEqual(problems("content/blog"), []);
});

test("the checks catch a broken post", () => {
  // the sample with six things wrong, and a post nobody listed
  const found = withSamples(
    (dir) => {
      const sample = readJson(dir, "sample-post-with-a-table.json");
      writeJson(dir, "sample-post-with-a-table.json", {
        ...sample,
        canonical: `${SITE}/blog/sample-post-with-a-table`,
        og: { title: sample.og.title },
        body: `<h1>Hi</h1><table><tr><td>no header</td></tr></table><!-- update:kiron-pricing --><p>open, never closed</p>${sample.body}`,
      });
      writeJson(dir, "forgotten.json", sample);
      const cards = readJson(dir, "index.json");
      cards[1].meta = "November 16, 2026 · Comparisons";
      writeJson(dir, "index.json", cards);
    },
    (dir) => problems(dir).join("\n"),
  );
  for (const expected of [
    "forgotten.json: not listed",
    "canonical should be",
    "og needs a title and a description",
    "meta's date should be the post's date",
    "body has an <h1>",
    "a table has no header row",
    "<!-- update:kiron-pricing --> opens 2 time(s) and closes 1",
  ])
    assert.ok(found.includes(expected), `missed "${expected}" in:\n${found}`);
});

test("a fact kiron.json doesn't have, or braces left over, fail with the file and the key named", () => {
  const draftWith = (text) => (dir) => {
    const draft = readJson(dir, "sample-draft.json");
    writeJson(dir, "sample-draft.json", { ...draft, body: `${draft.body}<p>${text}</p>` });
  };
  const unknown = withSamples(draftWith("{{kiron:price-monthly}}"), problems).join("\n");
  assert.match(unknown, /sample-draft\.json uses \{\{kiron:price-monthly\}\}, which kiron\.json doesn't have/);
  for (const typo of ["{{kiron:price-weekly}", "{kiron:price-weekly}}", "{kiron:price-weekly}", "{{price-weekly}}"]) {
    const left = withSamples(draftWith(typo), problems).join("\n");
    assert.match(left, /sample-draft\.json still has braces after Kiron's facts were filled in/, typo);
  }
  // a fact that isn't text, or a post using facts with no kiron.json at all
  const notText = withSamples((dir) => writeJson(dir, "kiron.json", { "price-weekly": 4.99 }), problems).join("\n");
  assert.match(notText, /kiron\.json: "price-weekly" should be text, in quotes/);
  const noFacts = withSamples((dir) => rmSync(join(dir, "kiron.json")), problems).join("\n");
  assert.match(noFacts, /uses \{\{kiron:price-annual\}\}, but there's no kiron\.json beside it/);
  // a draft's "draft" must be true or false
  const quoted = withSamples((dir) => writeJson(dir, "sample-draft.json", { ...readJson(dir, "sample-draft.json"), draft: "yes" }), problems);
  assert.ok(quoted.join("\n").includes('"draft" should be true or false'), quoted.join("\n"));
});

test("a fact lands as written, quotes and all, in the HTML and in the Article data", () => {
  const facts = { odd: 'a "quoted" word, a back\\slash and <b>bold</b>' };
  const out = fillFacts({ body: "<p>{{kiron:odd}}</p>", jsonLd: { description: "x {{kiron:odd}}" } }, facts, "test");
  assert.equal(out.body, '<p>a "quoted" word, a back\\slash and <b>bold</b></p>');
  assert.equal(out.jsonLd.description, 'x a "quoted" word, a back\\slash and <b>bold</b>');
  // keys from Object's prototype aren't facts
  assert.throws(() => fillFacts({ body: "{{kiron:toString}}" }, facts, "test"), /doesn't have/);
});

test("each table is in a box that scrolls by itself, named by its caption, whether the post wrote the box or not", () => {
  const caption = '<caption>Kiron vs "other" apps</caption>';
  // a post's own box gets the box's attributes, with no second box inside
  const own = wrapTables(`<div class="table-wrap"><table>${caption}<tr><th>a</th></tr></table></div>`);
  assert.equal(own.match(/class="table-wrap"/g)?.length, 1);
  assert.equal(
    own,
    `<p class="table-caption" aria-hidden="true">Kiron vs "other" apps</p><div class="table-wrap" role="region" tabindex="0" aria-label="Kiron vs &quot;other&quot; apps"><table>${caption}<tr><th>a</th></tr></table></div>`,
  );
  // a bare table gets a box; a closing </div> after it that belongs to something else stays
  const bare = wrapTables('<div class="sources"><table><tr><th>b</th></tr></table></div>');
  assert.equal(
    bare,
    '<div class="sources"><div class="table-wrap" role="region" tabindex="0" aria-label="Table"><table><tr><th>b</th></tr></table></div></div>',
  );
  assert.equal(wrapTables("<p>no tables</p>"), "<p>no tables</p>");
});
