---
name: Kiron Marketing Site
description: "Bearing's format and interactivity, drawn in the app's own UI: Soft Log"
source: "Kiron src/theme and src/components/ui on release/1.2.0 (fd2fabc, 2026-11-14); copy: content/app-palette.json"
---

# Design: Kiron's marketing site

**Taylor's direction (2026-11-14):** "The new site should leverage the new ui format and colors etc and styling."
So the site has two parents:

- **Bearing's site gives the format and the interactivity**: the page's order, the moving icon field, the scroll
  story whose phone sticks beside the words on a computer and pins to the bottom of a phone's screen, the dark band,
  pricing, download, FAQ, footer. (Jist's site was built the same way.) Bearing's health-only pieces (`/learn`,
  `/sources`, the doctor summary) are left out.
- **Kiron's app gives the look: its "Soft Log" UI**, not only its colours but how it draws things. The tokens, the
  shadows, the radii, the type, the kit (card, button, chip, badge, section header) and the hand-drawn marks (the red
  pen and the pencil) are the app's, from `release/1.2.0`, which has the newest UI. The main Kiron checkout's
  `feature/launch-polish` branch still has the older palette; the site follows the release.

Light and dark follow the visitor's system setting, as the app follows the phone's.

## Tokens: app → site

Every colour is a CSS variable in `app/globals.css`: light in `:root`, dark in the `prefers-color-scheme: dark`
block. `content/app-palette.json` is a copy of the app's `palette.js`, and `test/tokens.test.mjs` fails if a variable
stops matching it, or if a rule writes out a colour the palette doesn't have.

| App (`palette.js`) | Site variable | Light | Dark | Used for on the site |
|---|---|---|---|---|
| `canvas` | `--canvas` | #F2EDE6 | #141210 | the page, the nav |
| `surface` | `--surface` | #FFFFFF | #2C2824 | cards, sheets, the stamp's ground |
| `sunken` | `--sunken` | #E9E2D8 | #211E1B | chips, neutral buttons, badges, the burger |
| `line` | `--line` | #E3DCD1 | #36312C | row dividers in cards (FAQ, share list, menu) |
| `rule` | `--rule` | #CCD8E3 | #3B414A | (kept for the log's ruled lines) |
| `margin` | `--margin` | #E7B3AB | #6A3E37 | the red margin line down a sheet and a note |
| `lineStrong` | `--line-strong` | #7F756B | #8F857A | the pencil: a set tick's ring, tally marks |
| `ink` | `--ink` | #23201C | #F2EDE6 | text, titles |
| `navy` | `--navy` | #33495A | #C3D1DB | ledes, secondary text, nav links |
| `muted` | `--muted` | #655C54 | #B7ADA3 | mono labels (eyebrows), dates, fine print |
| `accent` | `--accent` | #A8463A | #F29B88 | the red pen, primary buttons, links |
| `accentDark` | `--accent-dark` | #8F3A30 | #EC8873 | a primary button, pressed or hovered |
| `accentSoft` | `--accent-soft` | #F9E7E2 | #43261F | secondary buttons, the share page's box, nav hover |
| `onAccent` | `--on-accent` | #FFFFFF | #1F0E0A | text on a primary button |
| `success` | `--success` | #466A52 | #92CCA2 | success badges |
| `successSoft` | `--success-soft` | #DDE9DF | #213A2B | success badges, the "Works with" band |
| `pill` | `--pill` | #23201C | #3A3530 | the preview bar (the rest timer's pill) |
| `onPill` | `--on-pill` | #F2EDE6 | #F2EDE6 | text on it |
| `ring` | `--ring` | #F29B88 | #F29B88 | the red pen on the dark band (the rest timer's ring) |

| App | Site | Value |
|---|---|---|
| `elevation.ts` `card` | `--shadow-card` | light: 0 1px 2px / 0 8px 22px rgba(35,32,28,.06/.08); dark: a 1px top highlight |
| `elevation.ts` `button` | `--shadow-button` | light: the red glow 0 6px 14px rgba(168,70,58,.28); dark: a top highlight |
| `elevation.ts` `float` | `--shadow-float` | the mobile menu (a floating sheet) |
| `rounded-card` 22 | `--r-card` | cards |
| `rounded-sheet` 28 | `--r-sheet` | the words pages' sheet |
| `rounded` 12 | `--r-well` | the story's notes |
| buttons and chips `rounded-full` | `border-radius:999px` | every button and chip |
| `typography.ts`, `tailwind.config.js` | `--display`, `--mono`, `--hand`, `--sans` | League Gothic, IBM Plex Mono 400/500, Caveat 700 (next/font); body in the phone's own face |

Site-only tokens, derived from the app's: `--band` (the dark band: the rest pill's ink in light, deeper than the page
in dark), `--band-card` (its cards: the app's dark surface), `--footer` (the app's dark canvas), `--bezel` (the phone
frame). The icon field's colours are the same tokens as RGB in `components/glyph-field.tsx`: navy, success and accent,
light and dark.

## The kit: app component → site

| App (`src/components/ui`) | Site | Notes |
|---|---|---|
| `Card` | `.card` | white (dark: lighter surface), radius 22, the card shadow, **no border** |
| `PressableCard` `selected` | `.plan.feature`, `.post-card:hover` | the 2px red outline a chosen card gets |
| `Button` primary / secondary / neutral | `.btn`, `.btn-soft`, `.btn-neutral` | pills, 56 tall (48 for `.btn-sm`), semibold 17, shrink to .97 when pressed; primary has the red glow (in dark mode: salmon with dark text) |
| `Chip` | `.chip` | a sunken pill, ink text; a chosen one fills red with a pen check |
| `Badge` | `.badge`, `.badge-success`, `.badge-accent`, `.badge-info` | a soft pill, Plex Mono capitals |
| `SectionHeader` + `PencilUnderline` | `PenTitle` (`components/pen-title.tsx`) | League Gothic capitals; the red pencil line as long as the title's widest line, min 48 px (`underlineWidth`) |
| labels ("THIS WEEK", "2 OF 4 DONE") | `.eyebrow` | Plex Mono 500 capitals, muted |
| `SetTick` (`PencilRing` + `PenTick`) | `SetTick`, `TickList` | each beat's "03 / 07" and the story's lists: the pencil ring, ticked in red pen |
| `PenCheck` | `PenCheck`, `CheckList` | what's included in a plan |
| `TallyMarks` | `TallyMarks` | counting the five value props on the dark band (the fifth strikes through the four) |
| `Stamp` | `Stamp` | "Save 80%" on the annual plan: double border, -3°, League Gothic |
| `Highlighter`, `PenCircle`, `PencilDot`, `DayMarks`, `RecoveryRing` | not on the page | the loop and the dot are in the icon field; the rest belong to screens the screenshots show |
| `Caveat` (the streak caption, Kiron's notes) | `.hand`, `.pen-hand` | a few words at display size, never body text: "3 days free", and the hero's second line ("Meet yours.", `PenTitle`'s `hand`), which the link preview draws too (`assets/fonts/Caveat_700Bold.ttf`) |

The marks' paths are the app's own, copied verbatim into `components/marks.tsx`, coloured by the tokens (`.pen-stroke`
is the red pen, `.pencil-stroke` the pencil).

## How it moves

- **The pen draws in**, as the app draws a set's tick when it's logged: a mark below the screen when the page loads
  (a section's underline, a list's ticks, the tally, the stamp) draws itself in as it scrolls into view
  (`components/pen-ink.tsx`); one already on screen is simply there. Without JavaScript every mark is drawn.
- **The story ticks its beats**: the tick by "03 / 07" draws when the story reaches that beat, and the phone
  cross-fades (0.55 s) to its screen.
- **The stamp lands** with a little bounce, as the PR stamp does.
- **The icon field** parts, grows and warms within 190 px of the cursor; on touch screens it draws once and stops.
- `prefers-reduced-motion`: nothing draws in or lands, the field doesn't bob, the phones only fade.

## The icon field (`components/glyph-field.tsx`, `components/glyphs.ts`)

A canvas fixed behind the page, and one in chalk on the dark band and the footer. 54 marks: 46 Lucide icons (ISC;
Feather's successor, the icons the app draws) on Kiron's subjects, Bearing's runner (Tabler's `run`, MIT), and **7 of
the app's own pen and pencil marks** (a set's tick in its ring, the tick, the ring, the check, the loop round today, a
tally of five, the underline), drawn a little bolder, so the field is partly in the app's hand.
`scripts/build-glyphs.mjs` writes `glyphs.ts`.

- At rest: ink (chalk in dark mode) at about 9% opacity.
- Near the cursor they move away (up to 54 px), grow up to 20% and warm into their family: navy for the kit and the
  plan, green for done and rest, the red pen for records, the runner and the pen marks (about one in five).
- The page's own field follows the visitor's light or dark setting (`theme="auto"`).

## The page, section by section

- **Nav**: the app's launch runner (its dark-mode copy in dark mode) and the wordmark; links get the soft red pill on
  hover, as the tab bar marks its tab; the burger is the app's round sunken icon button; the menu a floating sheet.
- **Hero**: a mono label, the League Gothic headline with the pencil line under it and its second line handwritten
  in the red pen (Caveat, tilted -2°, as the app writes a note), the primary and soft buttons, a small muted line
  saying where the name comes from, three phones (Bearing's tilt and fade). Screen readers and search read the
  headline and its handwritten line as one heading.
- **Dark band**: the rest timer's ink (light) with the app's dark-mode cards, one per value prop: three across and
  two wider below on a computer, two across on a tablet, one on a phone; the pen turns coral (the ring) on it.
- **Story**: seven beats, each with its set tick and "0N / 07 · TOPIC" label; lists ticked like sets; notes on a
  card behind the log's red margin line.
- **Works with**: a successSoft wash, cards with success badges.
- **Pricing**: the paywall's two packages as cards; the annual one chosen (red outline) and stamped with what it saves.
- **Get Kiron**: an accentSoft wash, both stores.
- **FAQ**: one card of the app's sheet rows.
- **Words pages** (privacy, terms, delete-data, the blog, support): a raised sheet with the red margin line.
- **Blog posts** add a muted disclosure line, a verdict card on the app's paper with pen-checked points, comparison
  tables that scroll inside their own box on a phone, and a sources list in smaller type (`docs/POSTS.md`).
- **Share page**: the shared workout's rows on a card, like the app's plan page; Open in Kiron in an accentSoft box.

## Not yet

- **Dark screenshots.** The screenshots are the light app in both modes. The app has a dark mode, so the real
  screenshot pass could shoot both and swap them with `<picture media="(prefers-color-scheme: dark)">`.
- **A manual light/dark switch.** The app has one in Settings; the site follows the system only.
- The link-preview card (`app/opengraph-image.tsx`) is light only, as it should be.
