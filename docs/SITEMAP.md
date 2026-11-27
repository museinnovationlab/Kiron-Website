# Every address, and why it exists

trykiron.com was plain HTML files on Netlify, with Netlify's "pretty URLs" (so `/privacy` and `/privacy.html` both
worked, and Netlify rewrote the blog's links to drop `.html`). Apps, stores, Google and other sites have saved those
addresses, so the new site answers every one of them, the same way. `scripts/check-site.mjs` checks each against a
deployment; run it before and after the switch.

| Address | Answers | Why it can't move |
|---|---|---|
| `/` and `/index.html` | the home page | |
| `/blog/` | the blog's list, **with its trailing slash** | Google has it with the slash; the sitemap lists it so |
| `/blog` | 308 → `/blog/` | Netlify sent it there (301); `proxy.ts` does it here |
| `/blog/<slug>.html` (5 posts) | the post | Google indexed them at `.html`; each page's canonical link and the sitemap name them |
| `/blog/<slug>` | the same post | Netlify served it, and its own rewritten links pointed there |
| `/privacy`, `/terms` | the page | the shipped app opens them **without** `.html` (its paywall and Settings) |
| `/privacy.html`, `/terms.html` | the same page | App Store Connect and the sitemap |
| `/support`, `/support.html` | the support page | App Store Connect's support address; Strava's listing of Kiron uses `/support` |
| `/delete-data`, `/delete-data.html` | the page | the web page for deleting an account, reachable without the app (Google Play) |
| `/<page>/` (any trailing slash but the blog's) | 308 → without it | as Netlify did (301) |
| `/w/<id>`, `/g/<id>` | a shared workout or gym, 200 for any id | the app makes these links; iOS and Android open them in Kiron when it's installed |
| `/.well-known/apple-app-site-association` | JSON, byte-identical, no redirect | iOS reads it to open `/w/` and `/g/` links in Kiron |
| `/.well-known/assetlinks.json` | JSON, byte-identical, no redirect | Android's equivalent |
| `/sitemap.xml` | the same 10 addresses as before | generated (`app/sitemap.ts`) |
| `/robots.txt` | unchanged, AI crawlers allowed | |
| `/llms.txt` | unchanged | |
| `/og-image.png`, `/logo.png`, `/runner.png`, `/favicon.png` | same files, shrunk (5.2 MB → 324 KB, 1.7 MB → 41 KB, 949 KB → 23 KB) | other sites and old link previews may have saved them; `logo.png` is the Organization logo in the structured data |
| `/opengraph-image` | the new link-preview card, 1200×630, drawn at build | every page's `og:image` |
| anything else | the 404 page, status 404 | |

**Dropped:** `/screenshots/apple-*.png` (the old home page's 11 MB of store images), `/styles.css` and `/open.html`
(the old share page's file; `/w/` and `/g/` still work). Only the old pages used them.

**The bare domain stays the main one.** Apple and Android read the app-link files at `https://trykiron.com/.well-known/`
and refuse a redirect there, so `trykiron.com` is the address and `www.trykiron.com` redirects to it. That's the
opposite of Bearing's and Jist's sites (their bare domains redirect to www): see `docs/SWITCH.md`.

## Structured data (JSON-LD), as the old site had it

- `/`: `SoftwareApplication` (with both plans as offers), `Organization` (logo, support email), `FAQPage`.
- Each post: its `Article`, copied from the old page.

## Share links

`app/w/[id]` and `app/g/[id]` render per request (`components/share-page.tsx`). The server reads the share from
Firestore's public REST API with a 1.5 s limit (`lib/share.ts`), so the link preview in Messages, WhatsApp or Slack
names the workout ("Upper A · 6 exercises: …"), and the page arrives with the workout on it. Anything going wrong
(slow, expired, missing, malformed) serves the page anyway: an expired or made-up link says "This link has expired",
and if Firestore was only slow, the browser reads the share itself, as the old page always did. That replaces the old
site's `open.html` and its Netlify edge function.
