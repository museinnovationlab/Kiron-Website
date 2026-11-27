# Comparison posts: how they're built and kept current

These are the blog posts that compare Kiron with other workout apps: Fitbod, StrongLifts, Runna, Ladder, Hevy and Strong, a hub page, and a guide to exporting your history. Each is a JSON file in `content/blog/`, in the same shape as the old posts in `content/legacy/blog/`. Unlike those, they're written for this site and edited here.

A comparison is only as good as its facts. Prices and features on both sides change, so these posts are built to be updated in a few minutes, not rewritten.

## Kiron's own facts live in one file

`content/blog/kiron.json` holds Kiron's prices, trial, plan and platform lines. Posts never type them. They write tokens instead, and the site swaps in the values when it builds, so changing a price or adding a plan is one edit here that every post picks up. Some tokens:

- `{{kiron:price-annual}}` becomes "$49.99 a year"
- `{{kiron:cell-free-tier}}` fills Kiron's column in the tables

The site refuses to build if a post uses a token that isn't in the file.

## Marked passages

Some sentences depend on facts that will change. HTML comments mark them, invisible on the page, so grep finds each one:

| Marker | Wraps | When to revisit |
|---|---|---|
| `update:kiron-pricing` | Wording or verdicts that depend on Kiron's current plans and prices | Kiron's pricing or plans change |
| `update:prices` | Every competitor price, table or sentence | Each quarter, or when a competitor changes prices |
| `update:watch` | Statements that Kiron has no Watch app | A Watch app ships |
| `update:offline` | Statements about using Kiron without signal | Offline support ships |
| `update:importers` | Which apps Kiron imports history from | An importer is added |
| `update:export` | Statements that Kiron has no export | An export ships |
| `update:first-hand` | Empty slots for notes from using the other app | Someone tests the app |

```bash
grep -o 'update:[a-z-]*' content/blog/*.json | sort | uniq -c
```

## When something changes

**Kiron changes its pricing or plans:**

1. Edit `content/blog/kiron.json`, including `checked`.
2. Grep `update:kiron-pricing`. Reread and rewrite every passage it finds. The verdicts against apps with free plans (Hevy, Strong, the hub) change the most.
3. Grep `kiron:price` too. Every sentence that sets Kiron's price against another app's uses one of those tokens. The number updates on its own, but a comparison like "about half Fitbod's price" may stop being true.
4. Reread each post's `description`, `og`, `twitter` and list card. They can't hold markers, and some of them quote prices.
5. In each post you touched, set `dateModified` in `jsonLd` to today. Add a line to its `<p class="updated">`, for example "Updated <date>: Kiron's pricing changed."

**Quarterly price check** (February, May, August, November):

1. For each competitor, check the US App Store listing (its in-app purchase list) and the vendor's pricing page.
2. Fix every `update:prices` passage that changed.
3. Change "checked" dates only where you actually rechecked.
4. Add an update line, and set `dateModified`.

**Someone reports an error:** fix it within days, and note it in that post's update line.

## Publishing

New posts start with `"draft": true`. A draft builds at its address with `noindex`, and stays out of the blog list, the sitemap and llms.txt. To publish:

1. Make sure the post describes the Kiron version that's live in both stores.
2. Recheck its competitor prices on the day.
3. Set `draft` to false. Set `date`, `datePublished` and `dateModified` to the publish date, and do the same in its card in `content/blog/index.json`.
4. Deploy. Then submit the full sitemap URL in Search Console: `https://trykiron.com/sitemap.xml`.

## Rules the posts follow

- Every claim about another app has a source link in the post and a check date.
- Plain text names only: no logos, icons or screenshots of other apps.
- Other people's program names are trademarks. Kiron's programs go by Kiron's own names.
- We say "We make Kiron" at the top of every post, and say where each app is the better fit.
