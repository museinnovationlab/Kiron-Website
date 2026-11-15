# The switch: trykiron.com from Netlify to Vercel

Nothing here has been done. Until these steps, trykiron.com is the old site on Netlify (built from `main` of
museinnovationlab/Kiron-Website), and this site lives only on Vercel preview links behind Vercel's login.

**The idea in one line:** get the new site live on Vercel at trykiron.com, then move two DNS records at Namecheap from
Netlify's addresses to Vercel's, without touching the records that run email and verification.

## 0. Before the day

1. **Kiron 1.2 is live in both stores.** The home page (rewritten for 1.2 on 2026-11-15) and the comparison posts
   (`docs/POSTS.md`) describe 1.2: its 36 programs, photo import, adjusting a day, recovery from other apps' workouts,
   history from Fitbod, Strong or Hevy. Before 1.2 is in the App Store and on Google Play, they'd promise what people
   can't download yet. Check both store pages show version 1.2.
2. **Placeholders.** Real screenshots are in, or Taylor has decided to switch with placeholders
   (`docs/PLACEHOLDERS.md`). Production never shows the preview bar either way.
3. **Pick up any edits made to the old site since 2026-11-14** (the privacy policy changes with features):
   ```bash
   git fetch origin && npm run import:legacy
   ```
   then `git diff content/legacy`. Commit what changed.
4. **Vercel plan:** the berkeley-labs team ("Tay's projects") is on **Pro** (read 2026-11-14). Vercel's free Hobby
   plan is for non-commercial sites only, so this matters for an app that sells subscriptions; no change needed.
5. **Lower the TTL** (how long the internet caches an answer) on the two records that will change, a day ahead:
   Namecheap → Domain List → trykiron.com → Manage → Advanced DNS → the `@` A records and the `www` CNAME → TTL
   **1 min** (or 5 min). Then a mistake undoes itself in minutes, not hours.

## 1. Stop Netlify from building `main`

Merging this branch puts a Next.js app on `main`. Netlify would try to build it, using one of the month's limited
deploys, and could replace the old site while DNS still points there.

Netlify → the trykiron.com site → **Site configuration → Build & deploy → Continuous deployment → Build settings →
Stop builds**. The site keeps serving its last deploy, which is the fallback if anything goes wrong. Don't delete the
site yet.

## 2. Put the new site on `main`, and on Vercel's production

```bash
git switch main && git merge --no-ff claude/next-site-58a4b3 && git push origin main
```

Then in Vercel → **kiron-website** → Settings → **Git** → Connect Git Repository → `museinnovationlab/Kiron-Website`,
production branch `main`. From then on, a push to `main` deploys, like Bearing's site. (Or, without connecting Git:
`vercel deploy --prod` from the repo.) The project's Framework must stay **Next.js**; there must be no `vercel.json`
setting `framework: null` (that broke Bearing once).

Check the same code before any DNS changes. Vercel's own addresses are behind its login, and the short-lived token
`vercel env run` hands the script opens preview deployments only, so check a preview of the merged commit:

```bash
vercel deploy
```
```bash
vercel env run -- node scripts/check-site.mjs <the preview URL it printed>
```

## 3. Add the domains in Vercel: the bare domain is the main one

Vercel → kiron-website → Settings → **Domains**:

1. Add **`trykiron.com`**, connected to Production.
2. Add **`www.trykiron.com`** and set it to **Redirect to `trykiron.com`** (308).

**This is the opposite of Bearing and Jist**, and Vercel's "Add domain" box suggests their way round (redirect the bare
domain to www). Don't take it: iPhones and Android phones read the app-link files at `https://trykiron.com/.well-known/`
and refuse a redirect there. With the bare domain redirecting, shared links would stop opening Kiron.

Vercel then shows the records it wants. For Bearing and Jist that was an **A record `216.198.79.1`** for the bare domain
and a **CNAME to a project-specific `….vercel-dns-017.com`** for www. Use exactly what Vercel shows for Kiron.

## 4. Namecheap: change two records, keep the rest

Namecheap → Domain List → trykiron.com → **Manage → Advanced DNS**. The nameservers stay Namecheap's.

**Change** (these point at Netlify today, read 2026-11-14):

| Type | Host | Today (Netlify) | New (Vercel) |
|---|---|---|---|
| A | `@` | `75.2.60.5` and `99.83.231.61` (two records) | Vercel's A record (one record; delete the second Netlify one) |
| CNAME | `www` | `apex-loadbalancer.netlify.com` | Vercel's CNAME for www |

**Delete, if it's there: a "URL Redirect Record"** for `@` or `www` (Namecheap's parking redirect). Jist's switch got
stuck on one: while it was there, the domain still answered with Namecheap's redirect and Vercel couldn't issue its
certificate. trykiron.com's `@` answered only Netlify's two addresses on 2026-11-14, so there's probably none, but look.

**Keep, untouched** (each one runs something):

| Type | Host | Value | What it does |
|---|---|---|---|
| MX ×5 | `@` | `eforward1`–`eforward5.registrar-servers.com` | Namecheap's email forwarding: **help@trykiron.com** (support, the stores, Strava). In Namecheap this sits under Mail Settings → Email Forwarding; leave it on |
| TXT | `@` | `v=spf1 include:spf.efwd.registrar-servers.com include:_spf.firebasemail.com ~all` | lets forwarded mail and Firebase's sign-in emails pass spam checks |
| TXT | `@` | `google-site-verification=q3LGLum…` | Google Search Console owns the domain |
| TXT | `@` | `firebase=kiron-5422e` | Firebase's check that Kiron owns the domain (its emails come from it) |
| CNAME | `firebase1._domainkey`, `firebase2._domainkey` | `mail-trykiron-com.dkim1/2._domainkey.firebasemail.com` | Firebase's email signatures |
| TXT | `@` | `brevo-code:ff4e97…` | Brevo's check that Kiron owns the domain |
| CNAME | `brevo1._domainkey`, `brevo2._domainkey` | `b1/b2.trykiron-com.dkim.brevo.com` | Brevo's email signatures |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | the email policy Brevo reports on |

## 5. Wait for the certificate, then check everything

Vercel's Domains page turns both domains green within minutes of DNS updating (it issues the HTTPS certificate
itself). Then:

```bash
node scripts/check-site.mjs https://trykiron.com --www --share w/<a real shared workout id>
```

All lines PASS, including `www redirects to the bare domain` and the real share's preview naming the workout. A real
share id: share any workout from History → Share this workout in Kiron 1.2, and take the 20 letters after `/w/`.

Then the app links themselves:

- **iPhone:** Apple fetches the file through its own cache. `https://app-site-association.cdn-apple.com/a/v1/trykiron.com`
  should show the same JSON (it's byte-identical, so nothing changes). Tap a `trykiron.com/w/…` link in Notes: it opens
  Kiron.
- **Android:** `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://trykiron.com&relation=delegate_permission/common.handle_all_urls`
  lists `com.kiron`. Tap a link in Messages: it opens Kiron.
- **The app's own links:** Settings → Privacy and Terms, and the paywall's links, open the new pages.
- **Email:** send a test to help@trykiron.com; it still arrives (the MX records were kept).

## 6. Afterwards

- Google Search Console (already verified by the TXT record) → Sitemaps → resubmit `https://trykiron.com/sitemap.xml`;
  watch Pages for a week. The addresses didn't change, so nothing should drop.
- **Undo, if needed:** point `@` back at `75.2.60.5` + `99.83.231.61` and `www` at `apex-loadbalancer.netlify.com`.
  Netlify still has the old site's last deploy (builds are only stopped). With a short TTL it's back in minutes.
- After a couple of quiet weeks: in Netlify, remove trykiron.com from the site's domains, then delete the site.
  Raise the TTLs back to Automatic.

## 7. After the switch: the blog

The old posts' words are now edited in their JSON here (`content/legacy/blog/<slug>.json`, the `body` is the page's
HTML), since `main` no longer holds the old site. Their addresses don't change.

1. **Publish the comparison posts one at a time**, only once Kiron 1.2 is live in both stores, and each only after
   Taylor's final read of it on a preview. Publishing a post is setting its `"draft"` to `false` and its dates
   (`date`, `jsonLd.datePublished`, `jsonLd.dateModified`, and the card's `meta` in `content/blog/index.json`) to the
   day it goes live; then deploy. The eight drafts (from `blog/kiron-vs`, `dd40da3`; their sources and the facts they
   rest on are in `docs/COMPARISONS.md`): `fitbod-alternative`, `stronglifts-alternative`, `runna-strength-training`,
   `ladder-app-alternative`, `hevy-vs-kiron`, `strong-app-alternative`, `workout-app-for-following-a-program` (the
   hub), `export-workout-history` (a guide).
2. **Link the old posts to the new ones**, each link only once its new post is published (a link to a draft leads to
   a page search engines are told to skip):

   | Old post | Link to |
   |---|---|
   | `chatgpt-workout-plan-into-app` | `fitbod-alternative`, `hevy-vs-kiron` |
   | `running-and-lifting-same-week` | `runna-strength-training` |
   | `muscle-recovery-time-between-workouts` | `fitbod-alternative`, `runna-strength-training` |
   | `multi-phase-training-plan-without-coach` | `runna-strength-training`, `stronglifts-alternative` |
   | `workout-spreadsheet-vs-app` | `stronglifts-alternative`, `strong-app-alternative` |

3. **Correct `chatgpt-workout-plan-into-app`.** Its option 3 describes HevyGPT, which Hevy has replaced with a ChatGPT
   app (you type @hevy in ChatGPT; https://www.hevyapp.com/features/hevy-chatgpt/). Rewrite that paragraph, and
   bump the post's `jsonLd.dateModified`.
4. After each change, `npm test` and `node scripts/check-site.mjs https://trykiron.com`: a published post must show
   on the blog's list and in the sitemap; a draft must not.
