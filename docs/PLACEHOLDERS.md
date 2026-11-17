# Placeholders: what's still to replace

Taylor decided (2026-11-14) on **real screenshots** once the app's screens are final. Until then the screenshots are
placeholders, and each is marked three ways:

- in `content/site.ts`, `placeholder: true` on the screenshot (the only file to edit);
- on preview builds, a bar above the nav says so (never on production; `components/preview-bar.tsx`);
- on the page, a `data-placeholder` attribute on each, which `scripts/check-site.mjs` counts ("Placeholders still on
  the home page: 11").

When one is replaced, delete its flag. When none are left, the bar disappears on its own. A block of words can be
flagged the same way (`placeholder: true` on the block); none is now.

## Screenshots (the 1.2.0 App Store set, shot Nov 11, before the Today redesign)

Source: `Kiron/store-screenshots/1.2.0/ios-6.9` (1320×2868), downscaled to 640×1391 into `public/shots/`.

| Where | Placeholder | The real one should show |
|---|---|---|
| Hero, left | `02-logger` | the workout screen mid-session: sets ticked, plates line, rest timer |
| Hero, centre (the main one) | `01-home` | Today after the redesign: today's workout and the week strip |
| Hero, right | `05-recovery` | the muscle recovery map |
| Story 1, start any way | `03-programs` | the preset list, or **a pasted or photographed plan becoming a program** (the review screen) |
| Story 2, today and your week | `01-home` | Today with the new week strip and Full schedule, or the missed-workout card |
| Story 3, bend the day | `05b-sore-day-note` | the "Adjust today's workout" sheet (Change the duration, Different equipment, At ⟨gym⟩ today, Add to today), or a change's note with Undo |
| Story 4, the workout screen | `02-logger` | sets, the plates line, the rest timer; ideally a superset or the reps-in-reserve question |
| Story 5, lifting and cardio | `05-recovery` | a run in the workout screen, or a week mixing runs and lifts (Run + Lift), or recovery with another app's run |
| Story 6, progress | `04-progress` | a lift's chart with a record |
| Story 7, reports, badges and streaks | `07-reports` | a week's report with set targets, or the Badges screen |
| "Works with" band | `06b-workout-card` | the "Import from another app" summary (how exercises matched), or a shared workout's link page |

**How to shoot them** (what Bearing learned, `Bearing-Website/assets/screenshots-full/NOTES.md`):

1. A **Release** build on the iOS simulator (a development build shows the dev-client's floating gear), iPhone at
   6.9" (1320×2868) to match the store set, the status bar at 9:41 with full bars and battery (`xcrun simctl
   status_bar <device> override --time 9:41 ...`).
2. A **demo account with believable data**: a real program, a few weeks of logged sessions, records, a streak. Jist
   found that made-up-looking content doesn't convince; a real-looking history does. No real person's name on screen.
3. Reach each screen **in the app**, not by a deep link (iOS shows a "◀ Safari" breadcrumb after a link opens it).
4. Save the full-size originals in `assets/screenshots-full/` with a NOTES.md like Bearing's (what each shows, how it
   was reached), and 640×1391 Lanczos copies in `public/shots/` (Python: `Image.resize((640, 1391), Image.LANCZOS)`).
   Use **new file names** rather than overwriting, so no browser or CDN serves the old image.
5. Point `content/site.ts` at the new names and delete each `placeholder: true`. `npm test` checks every named
   screenshot exists. **Don't show Strava** in a screenshot until the `strava` flag is on for everyone.

## Words (rewritten for 1.2 on 2026-11-15)

Taylor, on the first preview: "the app does way more than just allowing you to copy and paste a workout in. so need to
rephrase all of that and really show how flexible it is." The home page now leads with that flexibility: start any way,
bend any day, lift and run in one plan, logging, progress, switching apps.

**Sources.** 1.2's own store text (Kiron `STORE_SUBMISSION_1.2.0.md`, section 1 What's New and section 7 the listing),
the store screenshots' captions (some headings reuse them: "37 programs, or bring your own" (the caption says 36), "Log every set in
seconds", "Watch your lifts climb", "See your training add up", "Your plan, one day at a time"), and
`KIRON_ROADMAP.md` Part 1 for the detail. Every claim was then checked in the app's code on `release/1.2.0`
(`09e5e3b`):

| Claim on the page | Where it is in the app |
|---|---|
| 37 programs, 2 to 6 days a week; strength, muscle, endurance and general goals; filters by goal, days, equipment, level | `src/data/presets` (37 files since the 7-Day Longevity Protocol went out over the air on 2026-11-16; one number, `PROGRAM_COUNT` in `content/site.ts`), `days_per_week` 2 (Two Days a Week) to 6 (Push / Pull / Legs, the Longevity Protocol) |
| Training maxes; two beginner barbell plans; Run + Lift; 5K, 10K, half, marathon, cycling, sprint triathlon, rucking | Wave Loading Strength, Beginner 5×5, Novice Linear Progression, `run-and-lift.ts` and the endurance presets |
| Built from a few answers; built by hand; pasted or up to four photos; checked before it starts | the AI builder, Start from scratch, `MAX_PLAN_PHOTOS = 4`, `app/plans/review.tsx` |
| Missed: Start now, Pick a day, Skip; several: push the plan back | `MissedCard`, `MissedBanner` ("Push plan back") |
| Start any workout: any program's, a saved one, an empty one; two programs at once | Start another workout (today-plans); "Replace or run both?" (`otherPrograms.ts`) |
| The week strip marks workouts from other apps; Full schedule opens the month | `fix/day-marks-polish`, `FullScheduleSheet` |
| "Nothing planned today. Recovery is part of the plan." | `WorkoutCards.tsx`, the rest-day card |
| Shorter cuts extras and accessory sets first, keeps the main lifts; longer adds sets for the muscles behind this week | Change the duration (`feature/adjust-time`) |
| Another gym's equipment; a hotel or a friend's garage | Other gyms, "At ⟨gym⟩ today" |
| Add core, arms, shoulders, glutes, calves, a cardio finisher or stretching | `addToToday.ts` `ADD_KINDS` |
| Swap for today, for a while, or from now on; every change with Undo | `feature/workout-screen` (Just today / For a while / From now on), the adjust notes |
| Last time's numbers, warm-up sets, plates for each side, rest timer on a ticked set, supersets, notes, reps in reserve | the workout screen; "3 or more to spare" raises the next weight ~5% |
| Runs, rides, swims and rows in the plan; shorter or longer for the day | cardio logging; `feature/cardio-time` |
| Other apps' runs, rides and ski days count toward recovery, read on the phone, never stored; it's a switch | `feature/outside-workouts` ("Count workouts from other apps") |
| A chart per lift: estimated one-rep max, best ever, heaviest set, 1M/3M/1Y/All; a record marked on the set | Progress (`feature/progress-charts`), the STRONGEST SET YET stamp |
| Body weight, body fat, lean mass from Health | `feature/health-body` (waist too on iPhone; not claimed on the page) |
| Weekly, monthly, yearly reports; set targets per muscle; 27 badges up to a million pounds; streak of weeks | `feature/reports`, `feature/set-targets`, `feature/badges`; the Badges screen's own sentence is quoted |
| History from Fitbod, Strong or Hevy, matched before saving; workouts, not programs | `app/import-history.tsx`, Settings → Import from another app |
| A workout or a gym as a link that opens in Kiron, 180 days | share links (STORE_SUBMISSION section 2) |
| AI only to read or build a plan, sent to Anthropic's Claude after consent, withdrawable in Settings | STORE_SUBMISSION section 2, the privacy policy |
| iPhone, iPad and Android | the store sets (iPad 13-inch included) |

**Left out on purpose:**

- **Strava.** It's in 1.2, but switched off by the PostHog flag `strava` until Strava approves the app, and capped at 10
  athletes before that. `npm test` fails if the home page's words or `llms.txt` mention it. Add it back when the flag
  is on for everyone, using Strava's brand guidelines ("Compatible with Strava") if its logo appears.
- **PDFs.** No branch of the app reads a PDF (searched 2026-11-14): plans come in as text or photos.
- **Superlatives** (Taylor's rule): no "best", "smartest" or "most". The annual plan's stamp says what it saves ("Save
  80%", which is how the app's paywall rounds 80.7%), not "Best value".
- Anything that isn't in 1.2.

**Prices** are the App Store's (Kiron Weekly $4.99, Kiron Annual $49.99, read 2026-11-15). The 3-day trial is on the
weekly plan: `RELEASES.md` records Google Play's as 3 days (read live 2026-11-06), and the app's paywall shows
whatever trial the store reports. The App Store's trial length isn't written down anywhere this checkout can read;
confirm it in App Store Connect. In 1.2 a subscription unlocks programs and logging.

## Also before launch

- **Store badges.** The download buttons are text ("Download on the App Store", "Get it on Google Play"). Apple and
  Google both publish official badge artwork with sizing and clear-space rules (Apple Marketing Resources, Google
  Play brand guidelines); swap them into `StoreLinks` in `components/get-kiron.tsx`. Bearing's site has the same
  to-do.
