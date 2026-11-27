#!/usr/bin/env node
/* Copies the words of the old static site's pages into content/legacy/*.json, for the new pages to render.

   The old site (plain HTML on Netlify) is what trykiron.com serves until the switch, and other sessions still edit
   it there: the privacy policy changes whenever a feature does. So the words are read from git, not retyped, and
   this can be run again right before the switch to pick up anything that changed since:

     npm run import:legacy               # reads origin/main (git fetch first)
     npm run import:legacy -- <ref>      # any branch, tag or commit that still has the old files

   Then read `git diff content/legacy`: it is the list of what changed on the old site.

   Every old page has the same shape: its words sit in <div class="legal"> between the nav and the footer, and its
   <head> carries the title, description, canonical address, Open Graph tags and (posts) an Article's JSON-LD. Those
   are what this keeps. Inline style attributes are dropped: the new stylesheet styles the same elements. */

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "content", "legacy");
const ref = process.argv[2] || "origin/main";

const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 32 << 20 });
const commit = git("rev-parse", "--short", `${ref}^{commit}`).trim();
const read = (path) => git("show", `${ref}:${path}`);

/** HTML entities the old pages use, as characters, for text that goes into <head> tags again. */
function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&bull;/g, "•")
    .replace(/&rsquo;/g, "’")
    .replace(/&mdash;/g, "—");
}

function one(html, re, what, file) {
  const m = html.match(re);
  if (!m) throw new Error(`${file}: no ${what}`);
  return decode(m[1].trim());
}

const meta = (html, attr, name, file) =>
  one(html, new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`), `${attr}=${name}`, file);

/** The words between <div class="legal"> (or "blog-list") and the footer, without the two closing </div>s. */
function body(html, file, cls = "legal") {
  const start = html.indexOf(`<div class="${cls}">`);
  const end = html.indexOf("<footer>");
  if (start < 0 || end < 0) throw new Error(`${file}: no .${cls} block`);
  const inner = html.slice(start + `<div class="${cls}">`.length, end);
  const trimmed = inner.replace(/\s*<\/div>\s*<\/div>\s*$/, "");
  if (trimmed === inner) throw new Error(`${file}: .${cls} block doesn't end as expected`);
  return trimmed.replace(/ style="[^"]*"/g, "");
}

function jsonLd(html, file) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  return m ? JSON.parse(m[1]) : null;
}

function head(html, file) {
  return {
    title: one(html, /<title>([^<]*)<\/title>/, "title", file),
    description: html.includes('name="description"') ? meta(html, "name", "description", file) : null,
    canonical: html.includes('rel="canonical"')
      ? one(html, /<link rel="canonical" href="([^"]*)"/, "canonical", file)
      : null,
  };
}

function legalPage(file) {
  const html = read(file);
  let text = body(html, file);
  const h1 = one(text, /<h1>([\s\S]*?)<\/h1>/, "h1", file);
  const date = one(text, /<p class="legal-date">([^<]*)<\/p>/, "date line", file);
  text = text.replace(/\s*<h1>[\s\S]*?<\/h1>/, "").replace(/\s*<p class="legal-date">[^<]*<\/p>/, "");
  return { ...head(html, file), h1, date, body: dedent(text) };
}

function post(file) {
  const html = read(file);
  let text = body(html, file);
  const h1 = one(text, /<h1>([\s\S]*?)<\/h1>/, "h1", file);
  // "July 17, 2026 · <a href="/blog/">← All posts</a>": the date, then a link the new page draws itself
  const date = one(text, /<p class="legal-date">([^<·]*)·/, "date line", file);
  text = text.replace(/\s*<h1>[\s\S]*?<\/h1>/, "").replace(/\s*<p class="legal-date">[\s\S]*?<\/p>/, "");
  return {
    ...head(html, file),
    slug: file.replace(/^blog\//, "").replace(/\.html$/, ""),
    h1,
    date,
    og: {
      title: meta(html, "property", "og:title", file),
      description: meta(html, "property", "og:description", file),
    },
    twitter: {
      title: meta(html, "name", "twitter:title", file),
      description: meta(html, "name", "twitter:description", file),
    },
    jsonLd: jsonLd(html, file),
    body: dedent(text),
  };
}

function blogIndex(file) {
  const html = read(file);
  const text = body(html, file, "blog-list");
  const intro = one(text, /<p class="blog-intro">([\s\S]*?)<\/p>/, "intro", file);
  const cards = [...text.matchAll(/<a class="post-card" href="([^"]+)">([\s\S]*?)<\/a>/g)].map(([, href, card]) => ({
    href,
    slug: href.replace(/^\/blog\//, "").replace(/\.html$/, ""),
    meta: one(card, /<span class="post-meta">([^<]*)<\/span>/, "post meta", file),
    title: one(card, /<h2>([\s\S]*?)<\/h2>/, "post title", file),
    excerpt: one(card, /<p>([\s\S]*?)<\/p>/, "post excerpt", file),
  }));
  if (cards.length === 0) throw new Error(`${file}: no post cards`);
  return { ...head(html, file), og: { description: meta(html, "property", "og:description", file) }, intro, posts: cards };
}

/** The old files indent their body six spaces deep; the JSON reads better without it. */
function dedent(s) {
  return s
    .split("\n")
    .map((line) => line.replace(/^ {6}/, ""))
    .join("\n")
    .trim();
}

function save(name, data) {
  const file = join(out, `${name}.json`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ importedFrom: `${ref} (${commit})`, ...data }, null, 2) + "\n");
  console.log(`  ${name}.json`);
}

console.log(`Reading the old site from ${ref} (${commit}):`);
for (const page of ["privacy", "terms", "delete-data"]) save(page, legalPage(`${page}.html`));
const index = blogIndex("blog/index.html");
save("blog-index", index);
for (const { slug } of index.posts) save(`blog/${slug}`, post(`blog/${slug}.html`));
console.log("Done. `git diff content/legacy` shows what changed since the last import.");
