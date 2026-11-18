# CLAUDE.md: Kiron's marketing site (trykiron.com)

**Next.js 16 (App Router, TypeScript)**, built from Bearing's site (`../../Bearing/Bearing-Website`) in Kiron's colours,
faces and words, as Jist's site was. It replaces the plain-HTML site that `main` still holds.

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # node --test: the story's beat picker, share reading, the fixed files, glyphs, screenshots, new posts
npm run build    # runs the tests, then builds
```

## Where it lives: two sites until the switch

- **trykiron.com is still the OLD site on Netlify**, deployed from `main` of museinnovationlab/Kiron-Website. Netlify
  limits deploys per month. **Don't push `main`** (nor merge into it) until the switch in `docs/SWITCH.md`, which
  happens once Kiron 1.2.0 is out in both stores (they release it on approval; no hold).
- **This site is on Vercel**, project `kiron-website` in the berkeley-labs team ("Tay's projects", Pro). Not connected
  to Git yet: previews deploy from a checkout with `vercel deploy` (the CLI is signed in). Preview links sit behind
  Vercel's login. Framework must be Next.js; no `vercel.json` (one with `framework: null` broke Bearing's once).
- Since 2026-11-18, trykiron.com and www are attached to the Vercel project and a production deployment waits there,
  unreachable until DNS moves. `kiron-website.vercel.app` redirects to trykiron.com because Vercel's login doesn't
  cover production addresses: so `vercel deploy --prod` publishes nothing before the switch, but check deployments
  through a preview (`docs/SWITCH.md`).
- The branch is local only: GitHub shows no Netlify statuses for any branch, so whether Netlify builds pushed
  branches couldn't be confirmed. It's pushed on release day, after Netlify's builds are stopped (SWITCH.md §5).

## The addresses that cannot move

Every address the old site answered still answers (`docs/SITEMAP.md`, checked by `scripts/check-site.mjs`):

- `/blog/` keeps its trailing slash (`skipTrailingSlashRedirect`, `proxy.ts`); posts at `/blog/<slug>.html`.
- `/privacy`, `/terms`, `/support`, `/delete-data`, each with and without `.html` (rewrites in `next.config.mjs`). The
  shipped app opens `/privacy` and `/terms` without `.html`; App Store Connect, the sitemap and Google have `.html`.
- `/w/<id>` and `/g/<id>`: share links (`components/share-page.tsx`, `lib/share.ts`); any id answers 200.
- `public/.well-known/*`: byte-identical to the old files, served as JSON, never redirected. `test/site.test.mjs` and
  the check script hold their hashes. Change them only with the app.
- The **bare domain** is the main one; www redirects to it (the opposite of Bearing and Jist).

## Words from the old site

Privacy, terms, delete-data and the blog are the old site's words, imported from git by
`npm run import:legacy` into `content/legacy/*.json` (never hand-edit those). Until the switch, edit the old site's
HTML on `main`'s side and import again. After the switch, edit the JSON's `body` (it's the page's HTML).

**New posts** need no code: `content/blog/<slug>.json` (the old posts' shape) plus a card in `content/blog/index.json`,
newest first; Kiron's prices and plans come from `content/blog/kiron.json` as `{{kiron:<key>}}`, and `"draft": true`
builds a post for review without listing it (`docs/POSTS.md`, read by `lib/blog.ts`, checked by `npm test`). They
describe Kiron 1.2, so they go live with the switch, which waits for 1.2 in both stores.

## The look is the app's

Bearing gives the format and interactivity; the app's "Soft Log" UI gives the look (Taylor, 2026-11-14). Colours are
the app's palette as CSS variables, light and dark (the site follows the visitor's setting); `content/app-palette.json`
is a copy of the app's `palette.js` and `npm test` fails if `app/globals.css` drifts from it. The hand-drawn marks in
`components/marks.tsx` are the app's own SVG paths. Mapping: `docs/DESIGN.md`.

## Placeholders

The screenshots are real since 2026-11-18 (Release builds of 1.2.0; `docs/PLACEHOLDERS.md` says what each shows
and how to reshoot one). Everything on the home page comes from `content/site.ts`; a block marked `placeholder: true`
is a stand-in until its flag is deleted. The words follow
Kiron's brand direction of 2026-11-17 (the main line, five value props, words to use and avoid): `docs/PLACEHOLDERS.md`,
held by `npm test`.

## Checking a deployment

```bash
vercel env run -- node scripts/check-site.mjs https://<preview>.vercel.app
```
`vercel env run` hands the script a short-lived token for the preview's login (never printed). At the switch:
`node scripts/check-site.mjs https://trykiron.com --www --share w/<real id>`.

## Writing to Taylor

Plain language, the why behind each step. Paths contain spaces: wrap them in single quotes in commands.
