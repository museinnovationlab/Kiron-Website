# Kiron: marketing site

trykiron.com, rebuilt in Next.js 16 in the style of Berkeley Labs' Bearing and Jist sites: a moving icon field behind
the page, three phones in the hero, and a scroll story of the app's screens (a small phone pinned to the bottom of the
screen on mobile).

```bash
npm install
npm run dev      # http://localhost:3000
npm test
npm run build    # tests, then the build
```

| Path | What |
|---|---|
| `app/page.tsx` | the home page; its words and screenshots come from `content/site.ts` |
| `app/blog` | the blog: the old site's posts (`content/legacy`) and new ones (`content/blog`, `docs/POSTS.md`) |
| `app/privacy`, `app/terms`, `app/delete-data` | the old site's pages, from `content/legacy` |
| `app/support` | email support (was a Netlify form) |
| `app/w/[id]`, `app/g/[id]` | share links, read from Firestore for the link preview |
| `components/glyph-field.tsx`, `glyphs.ts` | the icon field (Lucide icons, `scripts/build-glyphs.mjs`) |
| `components/scroll-story.tsx`, `pick-beat.ts` | the scroll story |
| `components/store.ts` | the App Store and Google Play links, in one place |
| `scripts/check-site.mjs` | checks every address of a deployment |
| `scripts/import-legacy.mjs` | copies the old pages' words from git |
| `docs/` | design, every address, placeholders, new posts, and the switch from Netlify |

Deploys to Vercel (`kiron-website`). trykiron.com itself still serves the old site from Netlify until the switch in
`docs/SWITCH.md`.
