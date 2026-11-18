# The switch: trykiron.com from Netlify to Vercel

**When: once Kiron 1.2.0 is out in both stores** (Taylor, 2026-11-18). The site describes 1.2: its 44 programs,
bringing your own plan, Whenever I train, adjusting a day, recovery from other apps' workouts, history from Fitbod,
Strong or Hevy. Until 1.2.0 is out, the stores hand out 1.0.2, so the site would promise what people can't download
yet. There's no hold on the release: each store publishes 1.2.0 as soon as it approves it (Taylor would rather the app
go out a little before the website than add a release step), and the site switches once both store pages show 1.2.0.

**The idea in one line:** the new site already waits on Vercel's production; on release day, the `@` and `www`
records at Namecheap move from Netlify's addresses to Vercel's, without touching the records that run email and
verification.

Until then, trykiron.com is the old site on Netlify, built from `main` of museinnovationlab/Kiron-Website.

## Done ahead (2026-11-18)

- **Domains, in Vercel** (project kiron-website, team berkeley-labs; added with `vercel api`, readable in Vercel →
  kiron-website → Settings → Domains):
  - `trykiron.com`: the main address, on Production. Verified, so no TXT record was needed.
  - `www.trykiron.com`: redirects to `trykiron.com` (308). The bare domain is the main one, **the opposite of Bearing
    and Jist**: iPhones and Android phones read the app-link files at `https://trykiron.com/.well-known/` and refuse a
    redirect there, so with the bare domain redirecting, shared links would stop opening Kiron. (Vercel's "Add domain"
    box suggests the other way round. Don't take it.)
  - `kiron-website.vercel.app`, Vercel's own address for the project: redirects to `trykiron.com` (308). Vercel's login
    guards preview and deployment addresses, but its "Standard Protection" leaves production addresses open, and this
    one had been showing the site's first build since 2026-11-14. The redirect keeps the new site off the internet
    until the switch, and afterwards keeps everything on one address.
- **A production deployment** of `dfd2215`, the site as of 2026-11-18, already attached to trykiron.com in Vercel. Nobody
  can reach it: DNS still points at Netlify, and its own address needs Vercel's login. Release day deploys again, with
  the final screenshots and prices.
- **The DNS values Vercel asked for** (`vercel api /v6/domains/trykiron.com/config`, 2026-11-18):

  | Type | Host | Value |
  |---|---|---|
  | A | `@` | `216.150.1.1` |
  | A | `@` | `216.150.16.1` |
  | CNAME | `www` | `a2e54de5df5cf4b2.vercel-dns-016.com.` |

  Read them again on the day (Settings → Domains shows them beside each domain). If they differ, use what Vercel shows.

## 1. Before the day

1. **The stores release on approval.** In App Store Connect, the 1.2.0 version's *App Store Version Release* stays
   **Automatically release this version** (the default); in Play Console, **Managed publishing** is off. Nobody has to
   click anything when they approve.
2. **Placeholders.** Real screenshots are in, or Taylor has decided to switch with the ones there
   (`docs/PLACEHOLDERS.md`). Production never shows the preview bar either way.
3. **Prices.** The site shows only what both stores sell that day. When Kiron's pricing or plans change, change four
   places together: `PRICING` and the FAQ's cost answer in `content/site.ts`, the Pricing section of `public/llms.txt`,
   and the price keys in `content/blog/kiron.json`. `npm test` checks the program count, not prices, so read them.
4. **Pick up any edits made to the old site since 2026-11-14** (the privacy policy changes with features; `main` was
   still `2059dd7` on 2026-11-18):
   ```bash
   git fetch origin && npm run import:legacy
   ```
   then `git diff content/legacy`. Commit what changed.
5. **Optional: lower the `www` TTL** (how long the internet caches an answer): Namecheap → Domain List → trykiron.com
   → Manage → Advanced DNS → the `www` CNAME → TTL **5 min**. The `@` A records, the ones that matter, were already at
   5 minutes on 2026-11-18; `www` was at 30, so without this `www` takes up to half an hour to follow (it only
   redirects to the bare domain).
6. **Vercel plan:** the berkeley-labs team is on **Pro** (read 2026-11-14). Vercel's free Hobby plan is for
   non-commercial sites only, which matters for an app that sells subscriptions; no change needed.

## 2. On the day, in this order

1. **Both store pages show 1.2.0.** Each store publishes it on approval, possibly days apart, and Apple says a release
   can take up to 24 hours to show on the App Store. Check both (each printed 1.0.2 on 2026-11-18):
   ```bash
   curl -s 'https://itunes.apple.com/lookup?id=6761926770' | jq -r '.results[0].version'
   ```
   ```bash
   curl -s -A 'Mozilla/5.0' 'https://play.google.com/store/apps/details?id=com.kiron&hl=en_US&gl=US' | grep -oE '\[\[\["1\.[0-9]+\.[0-9]+"\]\]'
   ```
2. **Deploy the final site** from this checkout. Check a preview of it first: Vercel's addresses are behind its login,
   and the short-lived token `vercel env run` hands the script opens preview deployments only.
   ```bash
   vercel deploy
   ```
   ```bash
   vercel env run -- node scripts/check-site.mjs <the preview URL it printed> --share w/<a real shared workout id>
   ```
   Then the same code to production (`trykiron.com` follows it on Vercel's side at once):
   ```bash
   vercel deploy --prod
   ```
   The token lasts 12 hours. If the check gets 302s, `vercel env pull .env.local --yes`, then
   `git checkout -- .gitignore` (the CLI adds a line to it).
3. **Change the DNS at Namecheap** (§3).
4. **Wait for the certificate, then check everything** (§4).
5. **Put the new site on GitHub** (§5). Only now: the repository is public, and the site's words and the draft posts
   describe 1.2.

## 3. Namecheap: change three values, keep the rest

Namecheap → Domain List → trykiron.com → **Manage → Advanced DNS**. The nameservers stay Namecheap's.

**Change** (these pointed at Netlify on 2026-11-18):

| Type | Host | Today (Netlify) | New (Vercel, §Done ahead) |
|---|---|---|---|
| A | `@` | `75.2.60.5` | `216.150.1.1` |
| A | `@` | `99.83.231.61` | `216.150.16.1` |
| CNAME | `www` | `apex-loadbalancer.netlify.com` | `a2e54de5df5cf4b2.vercel-dns-016.com.` |

**Delete, if it's there: a "URL Redirect Record"** for `@` or `www` (Namecheap's parking redirect). Jist's switch got
stuck on one: while it was there, the domain still answered with Namecheap's redirect and Vercel couldn't issue its
certificate. trykiron.com's `@` answered only Netlify's two addresses on 2026-11-18, so there's probably none, but look.

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

## 4. Wait for the certificate, then check everything

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

## 5. Put the new site on GitHub

1. **Stop Netlify from building `main`:** Netlify → the trykiron.com site → **Site configuration → Build & deploy →
   Continuous deployment → Build settings → Stop builds**. Otherwise the merge below makes Netlify build a Next.js app,
   using one of the month's limited deploys, and replaces the old site that is the fallback if anything goes wrong.
   This can be done any day before the merge: the site keeps serving its last deploy either way. Don't delete it yet.
2. **Before the branch's first push:** the secret scan in the Berkeley Labs boilerplate's `CREDENTIALS.md`, and a read
   of what becomes public. The repository is public: the draft posts become readable there, though not on the site.
3. **Merge and push**, in the checkout that has `main` (`origin/main` is an ancestor of this branch, so it merges
   cleanly):
   ```bash
   git switch main && git merge --no-ff claude/next-site-58a4b3 && git push origin main
   ```
4. **Connect Vercel to the repository:** Vercel → **kiron-website** → Settings → **Git** → Connect Git Repository →
   `museinnovationlab/Kiron-Website`, production branch `main`. From then on, a push to `main` deploys, like Bearing's
   site. (Or keep deploying with `vercel deploy --prod`.) The project's Framework must stay **Next.js**; there must be
   no `vercel.json` setting `framework: null` (that broke Bearing once).

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
   day it goes live; then deploy. The nine drafts (from `blog/kiron-vs`; their sources and the facts they rest on are
   in `docs/COMPARISONS.md`): `fitbod-alternative`, `stronglifts-alternative`, `runna-strength-training`,
   `ladder-app-alternative`, `hevy-vs-kiron`, `strong-app-alternative`, `workout-app-for-following-a-program` (the
   hub), `export-workout-history` (a guide), and `huberman-workout-routine` (a guide to Huberman's routine). Their
   prices come from `content/blog/kiron.json`, so check it says what both stores sell before publishing any.
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
