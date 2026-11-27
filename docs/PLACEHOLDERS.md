# Placeholders: what's still to replace

**Nothing, since 2026-11-18.** Taylor decided (2026-11-14) on real screenshots once the app's screens were final, and
they are in. The mechanism stays for anything that needs a stand-in later. A placeholder is marked three ways:

- in `content/site.ts`, `placeholder: true` on the screenshot or block of words (the only file to edit);
- on preview builds, a bar above the nav says so (never on production; `components/preview-bar.tsx`);
- on the page, a `data-placeholder` attribute on each, which `scripts/check-site.mjs` counts ("Placeholders still on
  the home page: 0").

When one is replaced, delete its flag. When none are left, the bar disappears on its own.

## Screenshots (real, 2026-11-18)

Release builds of Kiron 1.2.0 (`release/1.2.0` at `cf2abc1`, the code that went to review) on an iPhone 6.9" simulator,
1320×2868, status bar at 9:41, every screen reached by tapping in the app. Two demo accounts on a local Firebase
emulator: no real person, no production data, Strava hidden. Eight were shot for the site on 2026-11-18. Three are
kept from the Nov 11 App Store set because those screens haven't changed (a code check on 2026-11-18 compared each
screen at the Nov 11 build with `release/1.2.0`). Full size in `assets/screenshots-full/` (its `NOTES.md` says how each
was reached), 640×1391 Lanczos copies in `public/shots/`.

| Where | File | What it shows |
|---|---|---|
| Hero, left | `02-logger` (Nov 11) | the workout screen mid-session: sets ticked, a record stamp, the plates line, the rest timer |
| Hero, centre (the main one) | `today-up-next` | Today in Whenever I train: this week's strip, up next Lower A: Quads, the recovery line, Start workout |
| Hero, right | `history-recovery` | History: 10 weeks in a row, and the muscle recovery map after a ski day |
| Story 1, your plan | `programs-that-fit` | programs that fit a new user's answers, best fit first, then Design one around your goals |
| Story 2, your week | `schedule-sheet` | the Schedule sheet: Whenever I train or Fixed days, training days, Move missed workouts for me |
| Story 3, adjust today | `adjust-today` | the "Adjust today's workout" sheet: duration, Add to today, another gym, different equipment |
| Story 4, today's workout | `first-set-check` | Hack Squat with Kiron's note on its weight, and "How did 150 lb feel?" after the first set |
| Story 5, strength and cardio | `recovery-other-apps` | training load, and workouts from other apps: a ski day and an Apple Watch run |
| Story 6, progress | `04-progress` (Nov 11) | the squat's chart, best ever and heaviest set |
| Story 7, reports, badges and streaks | `07-reports` (Nov 11) | a week's report: workouts against planned, time, sets, new bests |
| "Works with" band | `import-summary` | ready to import 48 workouts from Strong, all 19 exercises matched |

Shot the same day but not used (in `Kiron/store-screenshots/1.2.0/website/`): a program's page with Kiron's note and
the body-map week, the same program once started, a lift's starting weight before the first set, Your first week, and
the import's exercise matches.

**How to reshoot one** (what Bearing learned, `Bearing-Website/assets/screenshots-full/NOTES.md`):

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

## Words (Kiron's brand direction, 2026-11-17)

Taylor liked Kiron's new brand direction on 2026-11-17 ("i really like your new branding") and asked for the site to
follow it. It keeps what the 2026-11-15 rewrite fixed (Taylor: "the app does way more than just allowing you to copy
and paste a workout in") and adds a main line and five value props. The rules, which `npm test` holds the home page to
("the home page keeps to Kiron's words"):

- **The main line** is built on Kiron's name: Kiron is named for Chiron, the centaur who trained Achilles, Jason and
  Heracles. "Every hero had a trainer." with "Meet yours." handwritten under it, and a small line saying where the name
  comes from ("Named for Chiron, who trained Achilles."), since nothing public said so before; the closing band says
  "Train like a hero." Taylor chose this line on 2026-11-17 ("i like your hero trainer line"). Keep the Chiron story
  away from the back, knee and joint-friendly plans: Chiron also taught medicine, and there it could read as a medical
  claim.
- **Five value props**, in this order, wherever Kiron describes itself: Know exactly what to do today · A plan that
  moves with your week · Strength and cardio, one plan · The right plan, in minutes · See it working. They're the dark
  band's five cards and the pricing cards' list, and the story's seven beats show them screen by screen.
- **Sell the convenience of starting a plan, not the mechanism:** "design one around your goals", "bring the plan you
  already follow". Pasting, photos and AI stay out of the headings (the FAQ says how it works), and the builder is a
  program builder, never an AI trainer or coach.
- **"Strength and cardio"**, not "lifting and running".
- **Supporting detail, never the lead:** the program count, weights that go up, another gym's equipment.
- **Gone:** "bend any day" (nobody knew what it meant) and "built from your answers".

The facts underneath are 1.2's: its store text (Kiron `STORE_SUBMISSION_1.2.0.md`, section 1 What's New and section 7
the listing), the store screenshots' captions (two headings reuse them: "Watch your lifts climb", "See your training
add up") and `KIRON_ROADMAP.md` Part 1. Every claim was checked in the app's code on `release/1.2.0` (`09e5e3b` on
2026-11-15; the 2026-11-17 claims on `b4ca40a`; the 44 programs and the weights' new rules on `1568d6a`):

| Claim on the page | Where it is in the app |
|---|---|
| Today's workout ready, each lift's weight filled in: last time's, a step up when every set was hit, or a starting weight with a note from Kiron on how it got there; say how the first set felt and it adjusts the sets still to do | `startingWeights.ts` and the KIRON note (live over the air since 2026-11-16); "You hit every set, so we added 5 lb" (`exerciseHistory.ts`); "How did 35 lb feel?" Too easy / Just right / Too hard (`firstSetFeel.ts`) |
| How the weights are picked (the FAQ): done lately, last time's or a step up (two to four weeks away holds last time's, since the 20:49 PT update on 2026-11-17); a month or more, lighter, more so the longer it's been; never done, a related lift, or starting numbers for sex, body weight and age | `startingWeights.ts`'s order of evidence, `liftLoads.ts`; the app's `docs/STARTING_WEIGHTS.md` |
| Set days or Whenever I train, for each program; on set days missed workouts can move themselves to the next free day that week; with Whenever I train nothing is missed | `scheduleMode.ts` ("Fixed days", "Whenever I train"), the Schedule sheet's "Move missed workouts for me" (`auto_reschedule`, off until switched on); live over the air since 2026-11-16 |
| 44 programs, 2 to 6 days a week; strength, muscle, endurance and general goals; filters by goal, days, equipment, level | `src/data/presets` (44 files since seven new programs went out over the air on 2026-11-17 at 21:36 PT, `RELEASES.md`; one number, `PROGRAM_COUNT` in `content/site.ts`), `days_per_week` 2 (Two Days a Week) to 6 (Push / Pull / Legs, Beginner Push / Pull / Legs, Daily 20, the Longevity Protocol) |
| Training maxes; two beginner barbell plans; powerbuilding; beginner plans for 3 to 6 days a week; 20-minute dumbbell days; a four-week comeback; plans that mix strength and cardio; Run + Lift; 5K, 10K, half, marathon, cycling, sprint triathlon, rucking | Wave Loading Strength, Beginner 5×5, Novice Linear Progression, `powerbuilding.ts` (advanced), `beginner-upper-lower.ts` (4), `beginner-push-pull-legs.ts` (6), `daily-20.ts` (dumbbells, five or six days), `back-in-the-gym.ts` (4 weeks), `hybrid-starter.ts`, `strength-and-conditioning.ts`, `run-and-lift.ts` and the endurance presets |
| Designed around your goals (goal, experience, days a week, session length, equipment); built by hand; the plan you already follow, pasted or up to four photos (the FAQ); checked before it starts | the program builder (`app/plans/create.tsx`, "Build one with Kiron"), Start from scratch, `MAX_PLAN_PHOTOS = 4`, `app/plans/review.tsx` |
| Missed on a set day: Start now, Pick a day, Skip; several: push the plan back | `MissedCard`, `MissedBanner` ("Push plan back") |
| Start any workout: any program's, a saved one, an empty one; two programs at once | Start another workout (today-plans); "Replace or run both?" (`otherPrograms.ts`) |
| The week strip marks workouts from other apps | `fix/day-marks-polish` |
| "Nothing planned today. Recovery is part of the plan." | `WorkoutCards.tsx`, the rest-day card |
| Shorter cuts extras and accessory sets first, keeps the main lifts; longer adds sets for the muscles behind this week | Change the duration (`feature/adjust-time`) |
| Another gym's equipment; a hotel or a friend's garage | Other gyms, "At ⟨gym⟩ today" |
| Add core, arms, shoulders, glutes, calves, a cardio finisher or stretching | `addToToday.ts` `ADD_KINDS` |
| Swap for today, for a while, or from now on; every change with Undo | `feature/workout-screen` (Just today / For a while / From now on), the adjust notes |
| Warm-up sets, plates for each side, rest timer on a ticked set, supersets, notes, reps in reserve | the workout screen; "3 or more to spare" raises the next weight ~5% |
| Runs, rides, swims and rows in the plan; shorter or longer for the day | cardio logging; `feature/cardio-time` |
| Other apps' runs, rides and ski days count toward recovery, read on the phone, never stored; it's a switch | `feature/outside-workouts` ("Count workouts from other apps") |
| Whether you're getting stronger: the average change across your lifts, and for each muscle group | Progress's Strength and By muscle cards (`app/progress.tsx`, `summarizeProgress` and `progressByGroup`, on `release/1.2.0`); stretches and warm-up drills are left out since `ccd9386` |
| A chart per lift: estimated one-rep max, best ever, heaviest set, 1M/3M/1Y/All; a record marked on the set | Progress (`feature/progress-charts`), the STRONGEST SET YET stamp |
| Body weight, body fat, lean mass from Health | `feature/health-body` (waist too on iPhone; not claimed on the page) |
| A report for every week, month and year; set targets per muscle; 27 badges up to a million pounds; streak of weeks | `app/reports.tsx` (Week / Month / Year), `feature/set-targets`, `feature/badges`; the Badges screen's own sentence is quoted |
| History from Fitbod, Strong or Hevy, matched before saving; workouts, not programs | `app/import-history.tsx`, Settings → Import from another app |
| A workout or a gym as a link that opens in Kiron, 180 days | share links (STORE_SUBMISSION section 2) |
| AI only to design a program or read a plan, sent to Anthropic's Claude after consent, withdrawable in Settings; the weights Kiron picks use no AI | STORE_SUBMISSION section 2, the privacy policy; `startingWeights.ts` is rules, not a model |
| iPhone, iPad and Android | the store sets (iPad 13-inch included) |

**Left out on purpose:**

- **Strava.** It's in 1.2, but switched off by the PostHog flag `strava` until Strava approves the app, and capped at 10
  athletes before that. `npm test` fails if the home page's words or `llms.txt` mention it. Add it back when the flag
  is on for everyone, using Strava's brand guidelines ("Compatible with Strava") if its logo appears.
- **"A recap every week."** The value prop's wording became "a report for every week, month and year": the app has
  those reports on its Reports screen, but nothing it sends or calls a recap.
- **PDFs.** No branch of the app reads a PDF (searched 2026-11-14): plans come in as text or photos.
- **Superlatives** (Taylor's rule): no "best", "smartest" or "most", and no reviews or user counts. The annual plan's
  stamp says what it saves ("Save 80%", which is how the app's paywall rounds 80.7%), not "Best value".
- **Anything that isn't live.** The repository is public, so nothing about features or prices still on their way goes
  here, in the words or around them.

**Prices** are set for the switch (2026-11-18): Monthly $9.99 and Yearly $49.99, each with a 7-day free trial for new
subscribers, as the app's 1.2 paywall names them. Google Play has sold both with their trials since 2026-11-18; the App
Store's Yearly trial started 2026-11-17, and its Monthly plan goes on sale once Apple approves it with 1.2.0. The weekly
plan isn't offered to new subscribers in either store. In 1.2 a subscription unlocks programs and logging. The old
site on `main` shows only the yearly plan until then (`eb74577`). **Before the switch**, check them
against what's live in both stores that day (the app's `RELEASES.md` records every change): the pricing section, the
closing band's line, the FAQ's answer, `llms.txt` and the posts' `content/blog/kiron.json`. A price or trial goes on
the site only once it's live in both stores.

## Also before launch

- **Store badges.** The download buttons are text ("Download on the App Store", "Get it on Google Play"). Apple and
  Google both publish official badge artwork with sizing and clear-space rules (Apple Marketing Resources, Google
  Play brand guidelines); swap them into `StoreLinks` in `components/get-kiron.tsx`. Bearing's site has the same
  to-do.
