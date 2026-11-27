#!/usr/bin/env node
/* Checks that a deployment of the site answers every address trykiron.com has ever answered, the way it answered it:
   the status, the content type and the content that matters, for each one. Run it against a preview before the
   switch, and against trykiron.com right after it.

     node scripts/check-site.mjs <base-url> [--share w/<id>] [--share g/<id>] [--www] [--json]

     --share w/<id>   also check a REAL shared workout (or g/<id>, a gym): its link preview must name it
     --www            also check www.<host> redirects to the bare domain (run this at the switch)
     --json           print the results as JSON

   A Vercel preview sits behind Vercel's login. Run the script through the Vercel CLI, which hands it a short-lived
   token for the linked project (never printed):

     vercel env run -- node scripts/check-site.mjs https://<preview>.vercel.app

   It also sends VERCEL_AUTOMATION_BYPASS_SECRET as Vercel's bypass header if that is set. Plain Node 18+, no
   packages, so it runs anywhere. Exits 1 if anything fails. Nothing in it changes anything: it only reads. */

import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const base = args.find((a) => /^https?:\/\//.test(a))?.replace(/\/+$/, "");
if (!base) {
  console.error("Usage: node scripts/check-site.mjs <base-url> [--share w/<id>] [--www] [--json]");
  process.exit(2);
}
const shares = args.flatMap((a, i) => (a === "--share" && args[i + 1] ? [args[i + 1]] : []));
const checkWww = args.includes("--www");
const asJson = args.includes("--json");
const host = new URL(base).host;
const isLive = host === "trykiron.com";
// A preview build (a *.vercel.app address) lists drafts on /blog/, each with a Draft badge, so they can be read there
// before they're published; the live site and any other build lists none. No sitemap ever has them.
const draftsListed = host.endsWith(".vercel.app");

const headers = { "user-agent": "kiron-site-check/1 (+https://trykiron.com)" };
if (process.env.VERCEL_OIDC_TOKEN) headers["x-vercel-trusted-oidc-idp-token"] = process.env.VERCEL_OIDC_TOKEN;
if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET)
  headers["x-vercel-protection-bypass"] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/* ---------------------------------------------------------------- what trykiron.com has always answered ------ */

const ORIGIN = "https://trykiron.com";
const POSTS = {
  "chatgpt-workout-plan-into-app": "How to Turn a ChatGPT Workout Plan Into a Program You Can Actually Track",
  "running-and-lifting-same-week": "Running and Lifting in the Same Week: A Schedule That Actually Works",
  "muscle-recovery-time-between-workouts": "How Long Should Muscles Recover Between Workouts? A Guide by Muscle Group",
  "multi-phase-training-plan-without-coach": "How to Follow a Multi-Phase Training Plan (Base, Build, Peak) Without a Coach",
  "workout-spreadsheet-vs-app": "Workout Spreadsheet vs. App: An Honest Comparison From People Who Sell the App",
};
// Posts written for this site (content/blog, docs/POSTS.md), read from this checkout: the site it builds must serve
// them as it serves the old ones. None yet is fine. (Against the old site, these are the ones it doesn't have.) A
// draft is checked the other way round: its page answers, marked noindex, the sitemap doesn't have it, and the blog
// lists it only on a preview (draftsListed, above).
const { listed: NEW_POSTS, drafts: DRAFTS } = newPostsInCheckout();
const ALL_POSTS = { ...NEW_POSTS, ...POSTS };
const SITEMAP = [
  `${ORIGIN}/`,
  `${ORIGIN}/blog/`,
  ...Object.keys(ALL_POSTS).map((s) => `${ORIGIN}/blog/${s}.html`),
  `${ORIGIN}/support.html`,
  `${ORIGIN}/privacy.html`,
  `${ORIGIN}/terms.html`,
];
// Byte-identical to the files trykiron.com served from Netlify (Kiron-Website main 2059dd7). Also in test/site.test.mjs.
const APP_LINK_FILES = {
  "/.well-known/apple-app-site-association": "1cd940301fb536d286f6165e47eab763c6954ccac5d9d054df363f4a1b8e218a",
  "/.well-known/assetlinks.json": "20ac20e92432e57a5b1e396b19477680240447de793f84f8d0b0c3f2c8f936a8",
};
// A share id the app could have made (20 letters and digits) that no share has: the "expired" page.
const MADE_UP = "Zz" + randomBytes(9).toString("hex");

/* ---------------------------------------------------------------- helpers ------------------------------------ */

async function get(path, { absolute = false } = {}) {
  const url = absolute ? path : base + path;
  const started = Date.now();
  const res = await fetch(url, { redirect: "manual", headers, signal: AbortSignal.timeout(20000) });
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    status: res.status,
    type: res.headers.get("content-type") || "",
    location: res.headers.get("location"),
    robots: res.headers.get("x-robots-tag"),
    buf,
    text: buf.toString("utf8"),
    ms: Date.now() - started,
  };
}

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const head = (html) => html.split("</head>")[0] || "";
const metaContent = (html, attr, name) => {
  const m = head(html).match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`));
  return m ? decode(m[1]) : null;
};
const titleOf = (html) => decode(head(html).match(/<title>([^<]*)<\/title>/)?.[1] || "");
const canonicalOf = (html) => head(html).match(/<link rel="canonical" href="([^"]*)"/)?.[1] || null;
const ldTypes = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(([, json]) => {
    try {
      const data = JSON.parse(json);
      return (data["@graph"] || [data]).map((d) => d["@type"]);
    } catch {
      return ["(invalid JSON)"];
    }
  });
/** canonical links may drop the slash of a bare origin ("https://trykiron.com" is "https://trykiron.com/") */
const sameUrl = (a, b) => (a || "").replace(/^(https:\/\/[^/]+)\/?$/, "$1/") === b.replace(/^(https:\/\/[^/]+)\/?$/, "$1/");
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const html = /^text\/html/;

const results = [];
function record(name, path, ok, detail, r) {
  results.push({ name, path, ok, detail, status: r?.status ?? null, type: r?.type ?? null, ms: r?.ms ?? null });
}

/** One address: fetch it (no redirects followed) and run its checks. Each check returns null (fine) or a problem. */
async function check(name, path, expect, opts) {
  let r;
  try {
    r = await get(path, opts);
  } catch (e) {
    record(name, path, false, `no answer: ${e.cause?.code || e.name}: ${e.message}`);
    return null;
  }
  const problems = [];
  if (expect.status !== undefined && r.status !== expect.status) {
    problems.push(`status ${r.status}, wanted ${expect.status}${r.location ? ` (redirects to ${r.location})` : ""}`);
  }
  if (expect.redirect !== undefined) {
    const to = r.location && new URL(r.location, base + path).toString();
    const want = new URL(expect.redirect, base + path).toString();
    if (![301, 302, 307, 308].includes(r.status)) problems.push(`status ${r.status}, wanted a redirect to ${expect.redirect}`);
    else if (to !== want) problems.push(`redirects to ${to}, wanted ${want}`);
  }
  if (expect.type && !expect.type.test(r.type)) problems.push(`content-type "${r.type}"`);
  if (!problems.length && expect.body) {
    for (const test of expect.body) {
      const problem = test(r);
      if (problem) problems.push(problem);
    }
  }
  record(name, path, problems.length === 0, problems.join("; ") || expect.ok || "", r);
  return r;
}

const has = (...needles) => (r) => {
  const missing = needles.filter((n) => !r.text.includes(n));
  return missing.length ? `missing: ${missing.map((m) => JSON.stringify(m.slice(0, 60))).join(", ")}` : null;
};
const hasNot = (...needles) => (r) => {
  const found = needles.filter((n) => r.text.includes(n));
  return found.length ? `still has: ${found.map((m) => JSON.stringify(m)).join(", ")}` : null;
};
const canonical = (want) => (r) => (sameUrl(canonicalOf(r.text), want) ? null : `canonical ${canonicalOf(r.text)}, wanted ${want}`);
const ld = (...types) => (r) => {
  const got = ldTypes(r.text);
  const missing = types.filter((t) => !got.includes(t));
  return missing.length ? `JSON-LD missing ${missing.join(", ")} (has ${got.join(", ") || "none"})` : null;
};
const title = (re) => (r) => (re.test(titleOf(r.text)) ? null : `title "${titleOf(r.text)}"`);
/** an <h1> whose text is exactly this, however it's wrapped inside (the underline's measuring span, say) */
const h1Is = (text) => (r) => {
  const found = [...r.text.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(([, inner]) => decode(inner.replace(/<[^>]+>/g, "")).trim());
  return found.includes(text) ? null : `no <h1> reading "${text.slice(0, 50)}" (found: ${found.map((f) => `"${f.slice(0, 40)}"`).join(", ") || "none"})`;
};
/** an element whose class list includes this class */
const hasClass = (cls) => (r) => (new RegExp(`class="[^"]*\\b${cls}\\b`).test(r.text) ? null : `no element with class ${cls}`);
/** exactly this many Draft badges on the blog's list */
const draftBadges = (n) => (r) => {
  const found = (r.text.match(/class="badge badge-accent">Draft</g) || []).length;
  return found === n ? null : `${found} Draft badges on the list, expected ${n}`;
};
const ogImage = () => (r) => (metaContent(r.text, "property", "og:image") ? null : "no og:image");
const isNoindex = () => (r) =>
  /<meta name="robots" content="[^"]*noindex/.test(head(r.text)) ? null : "not marked noindex (a draft would reach search engines)";
const notNoindex = () => (r) =>
  /noindex/i.test(r.robots || "") || /<meta name="robots" content="[^"]*noindex/.test(head(r.text))
    ? "marked noindex (search engines would drop it)"
    : null;

/** content/blog's posts from this checkout, { listed: { slug: h1 }, drafts: { slug: h1 } }, each h1 with Kiron's facts
    (content/blog/kiron.json) filled in as the site fills them. The index is a list of cards, or { posts: [...] }. */
function newPostsInCheckout() {
  const dir = new URL("../content/blog/", import.meta.url);
  const json = (name) => JSON.parse(readFileSync(new URL(name, dir), "utf8"));
  let index;
  try {
    index = json("index.json");
  } catch {
    return { listed: {}, drafts: {} };
  }
  let facts = {};
  try {
    facts = json("kiron.json");
  } catch {}
  const fill = (text) => text.replace(/\{\{\s*kiron:([\w.-]+)\s*\}\}/g, (all, key) => facts[key] ?? all);
  const posts = { listed: {}, drafts: {} };
  for (const { slug } of Array.isArray(index) ? index : (index.posts ?? [])) {
    const post = json(`${slug}.json`);
    posts[post.draft ? "drafts" : "listed"][slug] = fill(post.h1);
  }
  return posts;
}

/* ---------------------------------------------------------------- the checks --------------------------------- */

const startedAt = new Date();

// The home page, at / and /index.html
const homeChecks = [
  title(/Kiron/),
  canonical(`${ORIGIN}/`),
  ld("SoftwareApplication", "Organization", "FAQPage"),
  ogImage(),
  has('class="field"', "story-stage", 'id="pricing"', 'id="faq"', "apps.apple.com", "play.google.com"),
  ...(isLive ? [notNoindex()] : []),
];
const home = await check("home", "/", { status: 200, type: html, body: homeChecks, ok: "title, canonical, JSON-LD, og:image, the icon field and the story" });
await check("home (old file name)", "/index.html", { status: 200, type: html, body: [title(/Kiron/), canonical(`${ORIGIN}/`)] });

// The blog: /blog/ keeps its slash, /blog goes there, every post at /blog/<slug>.html (and without .html)
const postCount = Object.keys(ALL_POSTS).length;
await check("blog", "/blog/", {
  status: 200,
  type: html,
  body: [
    canonical(`${ORIGIN}/blog/`),
    has(...Object.keys(ALL_POSTS).map((s) => `/blog/${s}.html`)),
    ...(draftsListed
      ? [has(...Object.keys(DRAFTS).map((s) => `/blog/${s}.html`)), draftBadges(Object.keys(DRAFTS).length)]
      : [hasNot(...Object.keys(DRAFTS).map((s) => `/blog/${s}.html`)), draftBadges(0)]),
  ],
  ok: `canonical /blog/, links all ${postCount} posts${
    Object.keys(DRAFTS).length
      ? draftsListed
        ? ` and the ${Object.keys(DRAFTS).length} drafts, each marked Draft (a preview)`
        : `, none of the ${Object.keys(DRAFTS).length} drafts`
      : ""
  }`,
});
await check("blog without its slash", "/blog", { redirect: "/blog/" });
await check("blog (old file name)", "/blog/index.html", { status: 200, type: html, body: [canonical(`${ORIGIN}/blog/`)] });
for (const [slug, h1] of Object.entries(ALL_POSTS)) {
  await check(`${slug in NEW_POSTS ? "new post" : "post"} ${slug}`, `/blog/${slug}.html`, {
    status: 200,
    type: html,
    body: [h1Is(h1), canonical(`${ORIGIN}/blog/${slug}.html`), ld("Article"), ogImage()],
    ok: "its h1, canonical, Article JSON-LD",
  });
}
for (const [slug, h1] of Object.entries(DRAFTS)) {
  await check(`draft ${slug}`, `/blog/${slug}.html`, {
    status: 200,
    type: html,
    body: [h1Is(h1), canonical(`${ORIGIN}/blog/${slug}.html`), isNoindex()],
    ok: "a draft: its h1, canonical, noindex",
  });
}
await check("post without .html", `/blog/${Object.keys(POSTS)[0]}`, {
  status: 200,
  type: html,
  body: [canonical(`${ORIGIN}/blog/${Object.keys(POSTS)[0]}.html`)],
});

// The pages the app, the stores and Strava open: with and without .html
const LEGAL = {
  privacy: ["Privacy Policy", "mailto:help@trykiron.com", "Health Data"],
  terms: ["Terms of Service", "Berkeley Labs LLC"],
  support: ['href="mailto:help@trykiron.com', "help@trykiron.com"],
  "delete-data": ["Delete Your Data", "Delete account", "mailto:help@trykiron.com"],
};
for (const [page, needles] of Object.entries(LEGAL)) {
  const body = [has(...needles), ...(page === "support" ? [hasNot("data-netlify", "<form")] : [])];
  await check(page, `/${page}`, { status: 200, type: html, body, ok: needles.join(" · ") });
  await check(`${page}.html`, `/${page}.html`, { status: 200, type: html, body });
}
await check("a page with a trailing slash", "/privacy/", { redirect: "/privacy" });

// Files for machines
await check("sitemap.xml", "/sitemap.xml", {
  status: 200,
  type: /xml/,
  body: [has(...SITEMAP.map((u) => `<loc>${u}</loc>`)), hasNot(...Object.keys(DRAFTS).map((s) => `/blog/${s}.html`))],
  ok: `all ${SITEMAP.length} addresses${Object.keys(DRAFTS).length ? ", no drafts" : ""}`,
});
await check("robots.txt", "/robots.txt", {
  status: 200,
  type: /^text\/plain/,
  body: [
    has("User-agent: GPTBot", "User-agent: ClaudeBot", "User-agent: PerplexityBot", "Sitemap: https://trykiron.com/sitemap.xml"),
    hasNot("Disallow: /\n"),
  ],
  ok: "AI crawlers allowed, sitemap named",
});
await check("llms.txt", "/llms.txt", {
  status: 200,
  type: /^text\/plain/,
  body: [(r) => (r.text.startsWith("# Kiron") ? null : "doesn't start with # Kiron")],
});

// Apple's and Android's app-link files: byte for byte, as JSON, never a redirect
for (const [path, want] of Object.entries(APP_LINK_FILES)) {
  await check(path.split("/").pop(), path, {
    status: 200,
    type: /^application\/json/,
    body: [(r) => (sha256(r.buf) === want ? null : `bytes differ from the old site's file (sha256 ${sha256(r.buf).slice(0, 12)}…)`)],
    ok: "byte-identical, application/json, no redirect",
  });
}

// The screen recording app reviewers are pointed at. Nothing on the site links to it, so nothing else here would notice
// it going missing: the same bytes as this checkout's, as a video, and not for search engines.
await check("review recording", "/review/health-connect.mp4", {
  status: 200,
  type: /^video\/mp4/,
  body: [
    (r) =>
      sha256(r.buf) === sha256(readFileSync(new URL("../public/review/health-connect.mp4", import.meta.url)))
        ? null
        : `bytes differ from public/review/health-connect.mp4 (${r.buf.length} bytes)`,
    (r) => (/noindex/i.test(r.robots || "") ? null : "not marked noindex"),
  ],
  ok: "byte-identical, video/mp4, noindex",
});

// Share links. Any id answers 200; an id with no share says it has expired.
for (const [letter, kind] of [
  ["w", "workout"],
  ["g", "gym"],
]) {
  await check(`made-up ${kind} link`, `/${letter}/${MADE_UP}`, {
    status: 200,
    type: html,
    body: [
      has(">This link has expired<"),
      (r) => (metaContent(r.text, "property", "og:title") === "Shared from Kiron" ? null : "og:title isn't the generic one"),
      (r) => (/<meta name="robots" content="noindex/.test(head(r.text)) ? null : "not noindex"),
    ],
    ok: "200, expired message, generic preview, noindex",
  });
}
await check("malformed share link", "/w/abc", { status: 200, type: html, body: [has(">This link has expired<")] });
for (const share of shares) {
  const [letter, id] = share.split("/");
  const r = await check(`real share ${share}`, `/${letter}/${id}`, {
    status: 200,
    type: html,
    body: [
      (r) => {
        const t = metaContent(r.text, "property", "og:title");
        return t && t !== "Shared from Kiron" ? null : `og:title is "${t}": the preview didn't read the share`;
      },
      (r) => {
        const d = metaContent(r.text, "property", "og:description") || "";
        return /Shared from Kiron\.$/.test(d) ? null : `og:description "${d}"`;
      },
      has(`kiron://${letter}/${id}`),
      hasClass("share-list"),
      hasNot(">This link has expired<"),
    ],
    ok: "the preview names it, the page lists it, Open in Kiron",
  });
  const last = results[results.length - 1];
  if (r && last.ok) {
    last.detail += `: "${metaContent(r.text, "property", "og:title")}", ${metaContent(r.text, "property", "og:description")}`;
  }
}

// Images other sites may have saved, shrunk but at the same addresses, and the generated link-preview image
const IMAGES = { "/og-image.png": 600_000, "/logo.png": 300_000, "/favicon.png": 50_000, "/runner.png": 200_000 };
for (const [path, max] of Object.entries(IMAGES)) {
  const r = await check(path.slice(1), path, {
    status: 200,
    type: /^image\/png/,
    body: [(r) => (r.buf.length <= max ? null : `${Math.round(r.buf.length / 1024)} KB, over ${Math.round(max / 1024)} KB`)],
  });
  const last = results[results.length - 1];
  if (r && last.ok) last.detail = `${Math.round(r.buf.length / 1024)} KB`;
}
if (home) {
  const og = metaContent(home.text, "property", "og:image");
  if (og) {
    const url = og.startsWith(ORIGIN) ? base + og.slice(ORIGIN.length) : og;
    await check("link-preview image", url, { status: 200, type: /^image\/png/, ok: og }, { absolute: true });
  }
}

// Anything else is a 404, not a soft 200
await check("an address that doesn't exist", `/no-such-page-${MADE_UP}`, { status: 404, type: html, body: [has("This page isn")] });

// The www address, at the switch: it must send everyone to the bare domain, where Apple and Android look
if (checkWww) {
  const www = `https://www.${host.replace(/^www\./, "")}`;
  await check("www redirects to the bare domain", `${www}/`, { redirect: `https://${host.replace(/^www\./, "")}/` }, { absolute: true });
}

/* ---------------------------------------------------------------- report ------------------------------------- */

const placeholders = home ? (home.text.match(/ data-placeholder="/g) || []).length : null;
const failed = results.filter((r) => !r.ok);
if (asJson) {
  console.log(JSON.stringify({ base, at: startedAt.toISOString(), results, placeholders }, null, 2));
} else {
  console.log(`Checking ${base}  (${startedAt.toISOString().replace("T", " ").slice(0, 16)} UTC)\n`);
  const w = Math.max(...results.map((r) => r.path.length));
  for (const r of results) {
    const mark = r.ok ? "PASS" : "FAIL";
    const st = r.status === null ? "---" : String(r.status);
    const type = (r.type || "").split(";")[0].padEnd(16);
    console.log(`  ${mark}  ${st}  ${type}  ${r.path.padEnd(w)}  ${r.detail}`);
  }
  console.log(`\n${results.length - failed.length} passed, ${failed.length} failed.`);
  if (!shares.length) console.log("Not checked: a real share link (add --share w/<id> with a link someone really shared).");
  if (!checkWww) console.log("Not checked: www (add --www at the switch, once www.trykiron.com points here).");
  if (placeholders) console.log(`Placeholders still on the home page: ${placeholders} (docs/PLACEHOLDERS.md).`);
}
process.exit(failed.length ? 1 : 0);
