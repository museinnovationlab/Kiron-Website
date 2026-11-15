# New blog posts

The blog has the old site's five posts (`content/legacy/blog`, imported from git, never edited by hand) and takes new
ones with no code. A new post is two files in `content/blog/`:

| File | What it is |
|---|---|
| `content/blog/<slug>.json` | the post, in the same shape as the old posts (the `Post` type in `lib/legacy.ts`) |
| `content/blog/index.json` | the blog list's cards, **newest first**: a list of `{ href, slug, meta, title, excerpt }` (or `{ "posts": [...] }`, as `content/legacy/blog-index.json` has them) |

Add both, run `npm test`, and the post is on the blog's list, at its address, and in the sitemap. `lib/blog.ts` reads
them; nothing else needs to change.

## The post

```json
{
  "title": "Kiron vs Fitbod: … — Kiron",
  "description": "One or two sentences for search results (about 150 characters).",
  "canonical": "https://trykiron.com/blog/kiron-vs-fitbod.html",
  "slug": "kiron-vs-fitbod",
  "h1": "Kiron vs Fitbod: …",
  "date": "November 20, 2026",
  "og": { "title": "…", "description": "…" },
  "twitter": { "title": "…", "description": "…" },
  "jsonLd": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "…",
    "description": "…",
    "datePublished": "2026-11-20",
    "dateModified": "2026-11-20",
    "author": { "@type": "Organization", "name": "Kiron" },
    "publisher": { "@type": "Organization", "name": "Kiron", "url": "https://trykiron.com",
                   "logo": { "@type": "ImageObject", "url": "https://trykiron.com/logo.png" } },
    "mainEntityOfPage": "https://trykiron.com/blog/kiron-vs-fitbod.html"
  },
  "body": "<p>…</p><h2>…</h2>…"
}
```

- **`slug`**: lowercase words joined by hyphens, the same as the file's name. It can't be one of the old posts'.
- **`canonical`** and **`mainEntityOfPage`**: `https://trykiron.com/blog/<slug>.html`, the address Google should keep.
  `/blog/<slug>` (without `.html`) answers too, as the old posts' do.
- **`title`** is the browser tab and search result (the old posts end theirs with ` — Kiron`); **`h1`** is the heading on
  the page. The page draws the `h1` itself, so the body has none.
- **`date`** is the dateline as people read it ("November 20, 2026"). **`jsonLd.datePublished`** is the same day as
  `YYYY-MM-DD`; the blog's list is sorted by it, newest first.
- **`body`** is the post's HTML: `<p>`, `<h2>`, `<h3>`, `<ul>`/`<ol>`, `<a>`, `<strong>`, `<code>`, `<table>`. No
  `<script>`, `<style>`, `<iframe>`, `<form>` or `on…=` attributes: the body goes into the page as it is.
- Every post gets the site's link-preview card (`/opengraph-image`); there's no per-post image.

## The card

```json
{
  "href": "/blog/kiron-vs-fitbod.html",
  "slug": "kiron-vs-fitbod",
  "meta": "November 20, 2026 · Comparisons",
  "title": "Kiron vs Fitbod: …",
  "excerpt": "Two or three sentences for the blog's list."
}
```

`meta` is the post's `date`, a middle dot, and a topic: the list shows the date in mono and the topic as a badge, and
the post's page shows the topic beside "Blog" at the top. The old posts' topics are AI Training, Hybrid Training,
Recovery, Programming and Tracking (all dated July 17, 2026).

## Tables

A `<table>` can be as wide as five columns. On a phone it scrolls sideways inside its own box while the page stays
still, and the first column stays put as the others pass under it (`wrapTables` in `lib/blog.ts`, the `.prose table`
rules in `app/globals.css`).

- Give it a header row: `<thead><tr><th>…</th></tr></thead>`. The tests fail a table without `<th>` cells; screen
  readers need them to read a cell's column.
- A row's first cell can be a `<th>` too (the feature being compared); it's drawn bold.
- A `<caption>` is optional. If there is one, it shows as a small label above the table and names the scrolling box
  for screen readers.
- Keep cells to a few words or a short sentence. A 5-column table is at least 40rem wide: it fits the article on a
  computer, and a phone shows the first column and about one more at a time.

## Checks

- `npm test` (`test/blog.test.mjs`) checks every post in `content/blog`: the fields above, the card's date matching
  the post's, the list newest first, no `<h1>` in the body, a header row in every table, and every file listed.
  `npm run build` runs the tests first.
- `scripts/check-site.mjs` reads `content/blog/index.json` from the checkout and checks each new post on a
  deployment like the old ones: its `h1`, canonical address, Article data and preview image, the blog's link to it,
  and its line in the sitemap.
- The look of a post with tables: `test/fixtures/blog/sample-post-with-a-table.json` is a sample (never served).
  Copy it into `content/blog` with its card to see it at `/blog/sample-post-with-a-table.html` on `npm run dev`, then
  take it out again.

## When posts go live

The comparison posts describe Kiron 1.2, so they go live once 1.2 is live in both stores. Nothing on this site is
public before the switch (`docs/SWITCH.md`): previews sit behind Vercel's login. So adding posts here is safe at any
time; the switch is what publishes them, and its checklist waits for 1.2 in both stores.
