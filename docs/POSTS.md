# New blog posts

The blog has the old site's five posts (`content/legacy/blog`, imported from git, never edited by hand) and takes new
ones with no code. New posts live in `content/blog/`:

| File | What it is |
|---|---|
| `content/blog/<slug>.json` | the post, in the same shape as the old posts (the `Post` type in `lib/legacy.ts`) |
| `content/blog/index.json` | the cards for the blog's list, **newest first**: a list of `{ href, slug, meta, title, excerpt }` (or `{ "posts": [...] }`, as `content/legacy/blog-index.json` has them) |
| `content/blog/kiron.json` | Kiron's own facts (prices, plans) that posts quote, so one file changes when they do |

Add the post and its card, run `npm test`, and the post is at its address, on the blog's list and in the sitemap (or,
as a draft, only at its address). `lib/blog.ts` reads them; nothing else needs to change.

**The repository is public.** Everything committed here, comments and commit messages included, can be read by
anyone, and so can a page's HTML once it's live. Write nothing about Kiron's unreleased plans, in a post or around one.

## The post

```json
{
  "draft": true,
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
  "body": "<p class=\"disclosure\">…</p><aside class=\"verdict\">…</aside><h2>…</h2>…"
}
```

- **`draft`** (optional, `true` or `false`): see [Drafts](#drafts).
- **`slug`**: lowercase words joined by hyphens, the same as the file's name. It can't be one of the old posts'.
- **`canonical`** and **`mainEntityOfPage`**: `https://trykiron.com/blog/<slug>.html`, the address Google should keep.
  `/blog/<slug>` (without `.html`) answers too, as the old posts' do.
- **`title`** is the browser tab and search result (the old posts end theirs with ` — Kiron`); **`h1`** is the heading on
  the page. The page draws the `h1` itself, so the body has none.
- **`date`** is the dateline as people read it ("November 20, 2026"). **`jsonLd.datePublished`** is the same day as
  `YYYY-MM-DD`; the blog's list is sorted by it, newest first.
- **`body`** is the post's HTML, built from the blocks below and `<p>`, `<h2>`, `<h3>`, `<ul>`/`<ol>`, `<a>`,
  `<strong>`, `<code>`. No `<script>`, `<style>`, `<iframe>`, `<form>` or `on…=` attributes: the body goes into the
  page as it is.
- Every post gets the site's link-preview card (`/opengraph-image`); there's no per-post image. A call to action links
  to `/#get`, the home page's download section.

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

## Drafts

A post with `"draft": true` is built at its address, so it can be read on a preview, but it's:

- marked `<meta name="robots" content="noindex">`, so search engines leave it out;
- left off the blog's list and the sitemap (and `llms.txt`, which lists no posts);
- marked with a **Draft** badge beside "Blog" at the top of its page.

Its card stays in `index.json`. Publishing is setting `"draft": false` (or removing it) and its dates to the day it goes
live. Posts can go live one at a time this way; each publish is a deploy. Nothing is public before the switch
(`docs/SWITCH.md`), and a draft's address answers there too, so it must be fit to be read.

## Kiron's facts: `content/blog/kiron.json`

A post quotes Kiron's own facts (prices, plans, the date they were checked) from one file, so when Kiron's pricing or
plans change, that one file changes and every post follows:

```json
{
  "price-weekly": "$4.99 a week",
  "price-annual": "$49.99 a year",
  "pricing-sentence": "Kiron is $4.99 a week with a 3-day free trial, or $49.99 a year.",
  "checked": "November 15, 2026"
}
```

- A flat object of text: each value in quotes, even a number (`"program-count": "44"`). The home page's own count
  (`PROGRAM_COUNT` in `content/site.ts`) must match `program-count`; `npm test` checks they do.
- A post writes `{{kiron:price-annual}}` wherever the fact goes: in any of its text (title, description, `h1`, `og`,
  `twitter`, the Article data, the body) and in its card. The value goes in as written, so keep it plain text.
- A key `kiron.json` doesn't have, or braces left over (`{{kiron:price-annual}`, a missing brace), stop the build with
  the file and the key named. Raw braces can't reach a page.
- The old posts don't use it.

## Passages that change with a release

Mark a passage that will need rewriting when something in Kiron changes with an HTML comment pair named for the
change, for example `kiron-pricing`:

```html
<!-- update:kiron-pricing -->
<p>{{kiron:pricing-sentence}}</p>
<!-- /update:kiron-pricing -->
```

`grep -rn 'update:kiron-pricing' content/blog` finds every one. The comments stay in the page's HTML (they're invisible
on the page but not in its source, and the repository is public), so name them for what changes, never for an
unreleased plan. The tests fail a marker that opens without closing, or the other way round.

## The blocks a post is built from

All inside the post's sheet, drawn in the app's look, light and dark (`app/globals.css`, after `.prose code`):

```html
<p class="disclosure">We make Kiron, so …</p>        <!-- the first line: small and muted -->

<aside class="verdict">                               <!-- the quick verdict near the top: one of the app's cards -->
  <h2>The short answer</h2>
  <ul><li>…</li><li>…</li></ul>                       <!-- ticked with the app's red pen check -->
  <p>…</p>
</aside>

<div class="table-wrap">                              <!-- a comparison or price table, up to 5 columns -->
  <table>
    <caption>…</caption>
    <thead><tr><th>…</th><th>…</th></tr></thead>
    <tbody><tr><th>…</th><td>…</td></tr></tbody>
  </table>
</div>

<div class="sources">                                 <!-- the end: sources, in smaller type, under a rule -->
  <h2>Sources</h2>
  <ul><li><a href="…">…</a>, read November 20, 2026</li></ul>
</div>
<p class="updated">Updated November 20, 2026: …</p>   <!-- the update log, smaller and muted -->
```

### Tables

- On a phone a table scrolls sideways inside its `table-wrap` box while the page stays still, and the first column
  stays put as the others pass under it. Up to five columns fit the article on a computer (a 5-column table is at
  least 40rem wide), so only a phone or a narrow window scrolls. A table without a `table-wrap` gets one. Write the box
  exactly as `<div class="table-wrap">`, with nothing else in its tag.
- Give every table a header row (`<thead><tr><th>…`): the tests fail a table without `<th>` cells, because screen
  readers need them to read a cell's column. A row's first cell can be a `<th>` too (the feature being compared); it's
  drawn bold.
- The `<caption>` shows as a small muted label above the box (inside, it would scroll away) and names the box for
  screen readers.
- Keep cells to a few words or a short sentence: a phone shows the first column and about one more at a time.

## Checks

- `npm test` (`test/blog.test.mjs`) checks every post in `content/blog`: the fields above, every `{{kiron:…}}` found,
  no braces left, `draft` true or false, the card's date matching the post's, the published posts newest first, no
  `<h1>` in the body, a header row in every table, update markers in pairs, and every file listed. `npm run build` runs
  the tests first.
- `scripts/check-site.mjs` reads `content/blog/index.json` from the checkout and checks each post on a deployment: a
  published one like the old ones (its `h1`, canonical address, Article data and preview image, the blog's link to it,
  its line in the sitemap); a draft the other way round (its page answers, marked noindex, and neither the blog nor the
  sitemap has it).
- The look of every block, and of a draft: `test/fixtures/blog` holds a sample post built from all of them, a sample
  draft and a sample `kiron.json` (never served). Copy the folder's files into `content/blog` to see them on
  `npm run dev` at `/blog/sample-post-with-a-table.html` and `/blog/sample-draft.html`, then take them out again.

## When posts go live

The comparison posts describe Kiron 1.2, so they go live once 1.2 is live in both stores. Nothing on this site is
public before the switch (`docs/SWITCH.md`): previews sit behind Vercel's login. The switch's checklist waits for 1.2
in both stores, and a post still marked as a draft stays off the list after it.
