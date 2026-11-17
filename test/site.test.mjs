/* The site's fixed points, checked without a browser or a server: the files Apple and Android read, the old site's
   words, the glyphs and the screenshots. `npm run build` runs these first. */
import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { GLYPHS } from "../components/glyphs.ts";
import { BEATS, CONNECTIONS, FAQ, GET, HERO, PLACEHOLDERS, PRICING, PROGRAM_COUNT, SITE, STORY, WHY } from "../content/site.ts";

const sha = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

/* Byte-identical to the files trykiron.com serves today (Kiron-Website main 2059dd7). Apple and Android read these
   from the bare domain to let Kiron open /w/ and /g/ links. Change them only on purpose, together with the app, and
   update the hashes here AND in scripts/check-site.mjs. */
test("the app-link files are unchanged", () => {
  assert.equal(
    sha("public/.well-known/apple-app-site-association"),
    "1cd940301fb536d286f6165e47eab763c6954ccac5d9d054df363f4a1b8e218a",
  );
  assert.equal(sha("public/.well-known/assetlinks.json"), "20ac20e92432e57a5b1e396b19477680240447de793f84f8d0b0c3f2c8f936a8");
});

test("the old site's pages were imported whole", () => {
  for (const name of ["privacy", "terms", "delete-data"]) {
    const page = JSON.parse(readFileSync(`content/legacy/${name}.json`, "utf8"));
    assert.ok(page.title && page.h1 && page.date && page.body.length > 500, name);
    assert.ok(!page.body.includes("<footer") && !page.body.includes("<nav"), `${name}: only the words`);
  }
  const index = JSON.parse(readFileSync("content/legacy/blog-index.json", "utf8"));
  assert.equal(index.posts.length, 5);
  for (const { slug, href } of index.posts) {
    assert.equal(href, `/blog/${slug}.html`);
    const post = JSON.parse(readFileSync(`content/legacy/blog/${slug}.json`, "utf8"));
    assert.equal(post.canonical, `https://trykiron.com/blog/${slug}.html`);
    assert.equal(post.jsonLd["@type"], "Article");
    assert.ok(post.body.length > 1000 && !post.body.includes("<h1"), slug);
  }
});

test("every glyph is a path the canvas can stroke", () => {
  assert.ok(GLYPHS.length >= 40);
  const names = new Set();
  for (const [name, fam, d] of GLYPHS) {
    assert.ok(!names.has(name), `${name} twice`);
    names.add(name);
    assert.ok([0, 1, 2].includes(fam), name);
    assert.match(d, /^M/, `${name} starts with an absolute moveto`);
    assert.match(d, /^[MmLlHhVvCcSsQqTtAaZz0-9.,\-\s]+$/, `${name} has only path commands`);
    // a relative moveto after another shape would draw in the wrong place (build-glyphs.mjs makes them absolute)
    assert.doesNotMatch(d, /[0-9zZ]m/, `${name} has a relative moveto mid-path`);
  }
  assert.ok(names.has("runner"));
  // the red pen is the app's mark, kept sparse
  assert.ok(GLYPHS.filter((g) => g[1] === 2).length <= GLYPHS.length / 4);
});

test("every screenshot the page names is in public/shots", () => {
  const shots = [...HERO.shots, ...BEATS.map((b) => b.shot), CONNECTIONS.shot];
  for (const { file } of shots) assert.ok(existsSync(`public/shots/${file}.png`), file);
  assert.equal(BEATS.length, 7);
});

/* Strava is in Kiron 1.2 but switched off (the PostHog flag `strava`) until Strava approves the app, so the site
   mustn't promise it yet: not in the home page's words, nor in llms.txt. When the flag is on for everyone, take this
   test out with the words that add it (docs/PLACEHOLDERS.md). */
test("the site doesn't promise Strava before it's switched on", () => {
  const words = JSON.stringify({ HERO, WHY, STORY, BEATS, CONNECTIONS, PRICING, GET, FAQ, SITE });
  assert.doesNotMatch(words, /strava/i);
  assert.doesNotMatch(readFileSync("public/llms.txt", "utf8"), /strava/i);
});

/* Kiron's words since 2026-11-17 (content/site.ts, docs/PLACEHOLDERS.md): "strength and cardio", not "lifting and
   running"; a plan is designed around your goals or brought in, never "built from your answers"; "bend any day" is
   gone; pasting, photos, AI and the program count stay out of the headings; and the hero's story of the name always
   comes with the line saying where the name is from, since nothing else public says so. */
test("the home page keeps to Kiron's words", () => {
  const words = JSON.stringify({ HERO, WHY, STORY, BEATS, CONNECTIONS, PRICING, GET, FAQ, SITE });
  for (const avoid of [/\bbend\b/i, /from (?:your|a few) answers/i, /lifting and running|lift · run/i]) {
    assert.doesNotMatch(words, avoid);
  }
  const headings = [
    HERO.eyebrow,
    HERO.heading,
    HERO.hand,
    WHY.heading,
    ...WHY.cards.map((c) => c.title),
    STORY.heading,
    ...BEATS.flatMap((b) => [b.eyebrow, b.heading]),
    CONNECTIONS.heading,
    PRICING.heading,
    GET.heading,
    SITE.title,
  ];
  for (const h of headings) assert.doesNotMatch(h, /\bAI\b|photo|paste|\d+ (?:ready-made )?programs/i, h);
  assert.match(HERO.story, /Chiron/, "the hero says where the name is from");
  assert.equal(WHY.cards.length, 5, "the five value props");
});

test("the preview bar counts what's left: every placeholder screenshot, no placeholder words", () => {
  const shots = [...HERO.shots, ...BEATS.map((b) => b.shot), CONNECTIONS.shot];
  assert.equal(PLACEHOLDERS.screens, shots.filter((s) => s.placeholder).length);
  assert.equal(PLACEHOLDERS.words, 0);
});

/* How many ready-made programs Kiron has is said on the home page, in llms.txt and in the posts (content/blog/kiron.json,
   "program-count"). The home page's count is one number, PROGRAM_COUNT in content/site.ts; this keeps the three in step,
   so a new program in the app changes them together. */
test("the home page, llms.txt and the posts agree on how many programs Kiron has", () => {
  const n = String(PROGRAM_COUNT);
  const words = JSON.stringify({ HERO, WHY, STORY, BEATS, CONNECTIONS, PRICING, GET, FAQ, SITE });
  const said = [...words.matchAll(/(\d+) (?:ready-made |workout )?programs/g)].map(([, count]) => count);
  // supporting detail since the 2026-11-17 words, so only a few places say it
  assert.ok(said.length >= 1, "the home page names its program count");
  for (const count of said) assert.equal(count, n, `the home page says ${count} programs`);
  const llms = readFileSync("public/llms.txt", "utf8");
  const inLlms = [...llms.matchAll(/(\d+) ready-made programs/g)].map(([, count]) => count);
  assert.ok(inLlms.length >= 1, "llms.txt names the program count");
  for (const count of inLlms) assert.equal(count, n, `llms.txt says ${count} programs`);
  if (existsSync("content/blog/kiron.json")) {
    const facts = JSON.parse(readFileSync("content/blog/kiron.json", "utf8"));
    if ("program-count" in facts) assert.equal(facts["program-count"], n, "content/blog/kiron.json's program-count");
  }
});
