---
name: Kiron Marketing Site
description: "Bearing's site, in Kiron's Soft Log: a warm stone page, white cards, and the red pen"
colors:
  paper: "#F2EDE6"      # the app's canvas
  white: "#FFFFFF"      # surface: raised cards
  sunken: "#E9E2D8"     # wells: inputs, chips
  line: "#E3DCD1"       # dividers that are only decoration
  rule: "#CCD8E3"       # the workout log's ruled lines
  margin: "#E7B3AB"     # the red margin line beside the set numbers
  line-strong: "#7F756B"
  ink: "#23201C"        # main text, and the dark band
  navy: "#33495A"       # secondary headings, ledes
  muted: "#655C54"      # captions, fine print
  accent: "#A8463A"     # the red pen: buttons, links, eyebrows
  accent-deep: "#8F3A30"
  accent-soft: "#F9E7E2"
  green: "#466A52"      # done, recovered
  green-soft: "#DDE9DF"
  night: "#141210"      # the app's dark canvas: the footer
  chalk: "#F2EDE6"      # text on the dark band
  chalk-muted: "#B7ADA3"
  ring: "#F29B88"       # the rest timer's ring: eyebrows on dark
typography:
  display: "League Gothic 400, uppercase, letter-spacing .01em"
  h1: "clamp(54px, 8.6vw, 108px) / 0.94"
  h2: "clamp(40px, 5.4vw, 68px) / 0.98"
  h3: "clamp(26px, 2.6vw, 32px) / 1.04"
  eyebrow: "IBM Plex Mono 500, 12px, .16em, uppercase, in the red pen"
  body: "the phone's own face (-apple-system, Segoe UI, Roboto), 16-18px / 1.65"
  hand: "Caveat 700, one or two words at display size only"
rounded:
  button: "999px (the app's pill)"
  card: "16-18px"
  phone: "34px bezel, 27px screen"
---

# Design: Kiron's marketing site

**What it is.** Bearing's site (`Bearing-Website`) in Kiron's colours, faces and words, the way Jist's site is
Bearing's in Jist's. Same format, same pieces: the moving icon field behind the page, the sticky nav with a menu on
narrow screens, a hero with three tilted phones, a dark band of three numbered cards, a scroll story whose phone sticks
beside the words (or pins to the bottom of a phone's screen), a band, pricing, the download section, the FAQ and a dark
footer. Bearing's health-only pieces (`/learn`, `/sources`, the doctor summary, its two-signals colour rule) are left
out: they belong to a health app.

**Where the look comes from.** The app's own "Soft Log" palette (`src/theme/palette.js` on `release/1.2.0`, merged
2026-11-10): a warm stone page with white raised cards, sunken wells, and a red pen for the hand-drawn marks (ticks,
the PR stamp, the tally streak). The main checkout's `feature/launch-polish` still has the older palette; the site
follows the release. The faces are the app's (`tailwind.config.js`): League Gothic for titles, set in capitals as the
app sets them, IBM Plex Mono for labels and numbers, Caveat for a word or two of handwriting. Body text is the phone's
own face, as in the app, so it costs no download.

## How the pieces map onto the app

| Site | From the app |
|---|---|
| Red pill button, soft red second button | "Start Workout" and "Reschedule" on Today |
| Eyebrows in Plex Mono capitals | Section labels: "SCHEDULE", "ESTIMATED ONE-REP MAX" |
| League Gothic capitals for every title | "WEEK 1: SQUAT + BENCH", "HISTORY" |
| The dark band in ink, its eyebrows in coral | The floating rest timer: an ink pill with a coral ring |
| "Best value" in a crooked red box | The PR stamp, "STRONGEST SET YET" |
| "3 days free" in Caveat | The streak caption, "10 weeks in a row" |
| A red line down the left of every page's sheet, and of a note in the story | The red margin line beside the set numbers in the log |
| Ticks in the story's lists and on the plans | A ticked set, in the app's green |

## Colour rules

- **The red pen is the brand's mark, so it's spent on actions and labels**: buttons, links, eyebrows, the stamp, the
  word "Kiron" in the headline. Not on large fills.
- **Green means done or rested**, as in the app: the ticks, the "Works with" band's wash.
- **Nothing on the page is pure black or pure white text on colour** except the buttons' white on red, which is the
  app's own pairing (`onAccent`).
- Light only, like Bearing's and Jist's sites. The app's dark palette is used for the dark band and the footer.

## The icon field (`components/glyph-field.tsx`, `components/glyphs.ts`)

A canvas fixed behind the page (and a second one in chalk on the dark band and the footer). 47 line icons: 46 of
Lucide's (ISC; Feather's successor, and the app draws Feather's icons) on Kiron's subjects (the kit, the plan, time,
ticks and records, rest), plus Bearing's runner (Tabler's `run`, MIT), which suits Kiron's runner mark.
`scripts/build-glyphs.mjs` writes `glyphs.ts` from a Lucide package; edit its list to change the set.

- At rest they're barely there: ink at 8.5% opacity.
- Within 190 px of the cursor they move away (up to 54 px), grow by up to 20%, tilt a little and warm into their
  colour family: navy for the kit and the plan, green for done and rest, the red pen for records and the runner
  (kept to about one in six).
- On touch screens (no hover) it draws once and stops, to save battery. It fades out under the nav, so the nav needs
  no backdrop blur (which flickered on Bearing's site over a canvas that repaints every frame).
- Light sections are translucent so it shows through; cards stay opaque so words never sit on it.

## The scroll story (`components/scroll-story.tsx`, `components/pick-beat.ts`)

Seven beats, one screen each (`content/site.ts`): any plan, Today and the week, the workout screen, swap or adjust,
progress and records, muscle recovery, History with the share card and Strava.

- On a computer the phone sticks in its own column and cross-fades to whichever beat owns the middle of the screen
  (`pickBeat`, tested in `test/pick-beat.test.mjs`).
- At 900 px and narrower the phone pins to the bottom of the screen, at 44% of its height on a phone (38% on a small
  tablet), only while the story is behind it, with a paper scrim so the words fade before they reach it (Bearing
  commit 775a414).
- The current screen and the pinned state are React state (Jist's lesson: classes set by hand were reset on
  re-render).

## Motion

The icon field, the phone's cross-fade (0.55 s) and the pinned phone's fade (0.35 s). Nothing loops or autoplays.
`prefers-reduced-motion` stops the field's bobbing and the phones' slide; the cross-fade stays as a short fade.

## Pages

Every page shares the nav, the field and the footer. Words pages (privacy, terms, delete-data, support, the blog)
sit on a white sheet with the log's red margin line. The share page (`/w/<id>`, `/g/<id>`) lists what was shared like
the app's preview, with Open in Kiron and both stores in a soft red box. The 404 is the hero's type, centred.
