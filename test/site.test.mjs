/* The site's fixed points, checked without a browser or a server: the files Apple and Android read, the old site's
   words, the glyphs and the screenshots. `npm run build` runs these first. */
import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { GLYPHS } from "../components/glyphs.ts";
import { BEATS, CONNECTIONS, FAQ, GET, HERO, PLACEHOLDERS, PRICING, SITE, STORY, WHY } from "../content/site.ts";

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

test("the preview bar counts what's left: every placeholder screenshot, no placeholder words", () => {
  const shots = [...HERO.shots, ...BEATS.map((b) => b.shot), CONNECTIONS.shot];
  assert.equal(PLACEHOLDERS.screens, shots.filter((s) => s.placeholder).length);
  assert.equal(PLACEHOLDERS.words, 0);
});
