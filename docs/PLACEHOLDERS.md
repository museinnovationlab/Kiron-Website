# Placeholders: what's still to replace

Taylor decided (2026-11-14) on **real screenshots** and on **copy in their own voice**, both once the app's screens
are final. Until then the page carries placeholders, and every one is marked three ways:

- in `content/site.ts`, `placeholder: true` on the block or the screenshot (the only file to edit);
- on preview builds, a bar above the nav says so (never on production; `components/preview-bar.tsx`);
- on the page, a `data-placeholder` attribute on each, which `scripts/check-site.mjs` counts ("Placeholders still on
  the home page: 24").

When a block is replaced, delete its flag. When none are left, the bar disappears on its own.

## Screenshots (the 1.2.0 App Store set, shot Nov 11, before the Today redesign)

Source: `Kiron/store-screenshots/1.2.0/ios-6.9` (1320×2868), downscaled to 640×1391 into `public/shots/`.

| Where | Placeholder | The real one should show |
|---|---|---|
| Hero, left | `02-logger` | the workout screen mid-session: sets ticked, plates line, rest timer |
| Hero, centre (the main one) | `01-home` | Today after the redesign: today's workout and the week strip |
| Hero, right | `05-recovery` | the muscle recovery map |
| Story 1, any plan | `03-programs` | **the import itself**: a pasted or photographed plan becoming a program |
| Story 2, Today and your week | `01-home` | Today and the week (the new week strip, Full schedule) |
| Story 3, the workout screen | `02-logger` | sets, the plates line, the rest timer |
| Story 4, swap or adjust | `05b-sore-day-note` | the swap sheet ("just today, for a while, or from now on") or the sore-day note |
| Story 5, progress and records | `04-progress` | a lift's progress with a record |
| Story 6, muscle recovery | `05-recovery` | the recovery map |
| Story 7, History, sharing, Strava | `06b-workout-card` | History, the share card, or a Strava post |
| "Works with" band | `06-finish` | the finish screen with the Strava and Health send |

**How to shoot them** (what Bearing learned, `Bearing-Website/assets/screenshots-full/NOTES.md`):

1. A **Release** build on the iOS simulator (a development build shows the dev-client's floating gear), iPhone at
   6.9" (1320×2868) to match the store set, the status bar at 9:41 with full bars and battery (`xcrun simctl
   status_bar <device> override --time 9:41 ...`).
2. A **demo account with believable data**: a real program imported, a few weeks of logged sessions, records, a
   streak. Jist found that made-up-looking content doesn't convince; a real-looking history does. No real person's
   name on screen.
3. Reach each screen **in the app**, not by a deep link (iOS shows a "◀ Safari" breadcrumb after a link opens it).
4. Save the full-size originals in `assets/screenshots-full/` with a NOTES.md like Bearing's (what each shows, how it
   was reached), and 640×1391 Lanczos copies in `public/shots/` (Python: `Image.resize((640, 1391), Image.LANCZOS)`).
   Use **new file names** rather than overwriting, so no browser or CDN serves the old image.
5. Point `content/site.ts` at the new names and delete each `placeholder: true`. `npm test` checks every named
   screenshot exists.

## Words (today's trykiron.com, moved into this layout)

Every block in `content/site.ts` is today's site's words, except where today's site says nothing about a feature. Those
lines describe what the app does, from its own screens and code (checked against `release/1.2.0`):

- Story 1: "A photo of a printed plan works too. Or start from one of Kiron's ready-made programs." **Note:** the brief
  for this beat said "photo, PDF or pasted text", but no branch of the app reads PDFs (searched 2026-11-14), so the
  placeholder doesn't promise one. Confirm before the copy pass.
- Story 3: "Kiron shows the plates for each side of the bar, and the rest timer starts when you tick a set." (both in
  1.2.0: `platesLine`, and `rest.start` on a ticked set)
- Story 4: "Sore from yesterday? Kiron can lighten today's workout for the muscles still recovering. Swap an exercise
  or adjust today without touching the rest of your plan."
- Story 5: "Kiron marks a new record the set you lift it." (the STRONGEST SET YET stamp)
- Story 6: the recovery map line.
- Story 7: "Share a finished workout as a card, send a friend the workout itself as a link, or post it to Strava."
- "Works with": Apple Health and Health Connect are today's site's words; the Strava card is new.
- Pricing fine print: "Prices in US dollars. Your App Store or Google Play account shows the price and trial where
  you live." (the stores set the real prices; the page shouldn't promise otherwise)
- Support page: "Write to help@trykiron.com from the email address you use for Kiron, and tell us what happened and
  on which phone." and the "Common answers" box.

**Pricing figures** ($4.99 a week with a 3-day trial, $49.99 a year) are today's site's. The app reads the real ones
from the stores, so check them against App Store Connect and Play Console in the copy pass.

## Also before launch

- **Store badges.** The download buttons are text ("Download on the App Store", "Get it on Google Play"). Apple and
  Google both publish official badge artwork with sizing and clear-space rules (Apple Marketing Resources, Google
  Play brand guidelines); swap them into `StoreLinks` in `components/get-kiron.tsx`. Bearing's site has the same
  to-do.
- **Strava.** If the page shows Strava's logo, Strava's brand guidelines apply ("Compatible with Strava"); the
  placeholder uses only the name.
- **llms.txt** still describes the old site (and links `.html` legal pages, which still work). Refresh it with the copy.
