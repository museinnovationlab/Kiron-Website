/* Every word and screenshot on the home page, in one place, so a copy pass or a screenshot pass edits one file.

   WORDS (2026-11-15): written for Kiron 1.2, after Taylor saw the first preview: "the app does way more than just
   allowing you to copy and paste a workout in. so need to rephrase all of that and really show how flexible it is."
   The source is 1.2's own store text (Kiron's STORE_SUBMISSION_1.2.0.md: What's New and the listing) and the store
   screenshots' captions, whose lines some headings reuse ("… programs, or bring your own", "See your training add
   up"). Every claim was checked against the app's code on release/1.2.0; docs/PLACEHOLDERS.md says where each comes
   from. Taylor's rule: no superlatives, only specific claims someone could check in the app. Strava isn't mentioned:
   it's in 1.2, but switched off until Strava approves the app.

   SCREENSHOTS are still placeholders: the 1.2.0 App Store set (Kiron/store-screenshots/1.2.0/ios-6.9, shot Nov 11,
   before the Today redesign), downscaled to 640x1391 into public/shots/. Each is marked `placeholder: true`, which the
   preview bar shows (preview builds only) and the check script counts; a block of words can be marked the same way.
   Replace it, then delete the flag. docs/PLACEHOLDERS.md lists them all. */

export type Shot = {
  /** file in public/shots, without .png */
  file: string;
  alt: string;
  placeholder?: boolean;
};

export type Beat = {
  id?: string;
  eyebrow: string;
  heading: string;
  body: string[];
  /** ticked lines under the words, as the app ticks a set */
  ticks?: string[];
  /** a note in the margin: [words, who says so] */
  note?: [string, string];
  shot: Shot;
  placeholder?: boolean;
};

/** How many ready-made programs the app has (src/data/presets on release/1.2.0): 36 at the copy pass, 37 since the
    7-Day Longevity Protocol went out over the air on 2026-11-16. Every count on the home page is this number, and
    test/site.test.mjs checks llms.txt and the posts' content/blog/kiron.json ("program-count") say the same. */
export const PROGRAM_COUNT = 37;

/** What the preview bar says is still a placeholder. */
export const PLACEHOLDER_NOTE = {
  screens: "Screens are the 1.2.0 App Store set (Nov 11, before the Today redesign)",
  words: "some words are drafts",
};

/* ---------- hero ---------- */

export const HERO = {
  eyebrow: "Lift · Run · Recover",
  // the <em> word is drawn in the red pen
  heading: ["Train with a real program.", "Bend", "any day."] as const,
  lede:
    `Pick one of ${PROGRAM_COUNT} programs, let Kiron build one from a few answers, or bring your own from ChatGPT, Claude or a ` +
    "coach. Then shorten today, train at another gym or swap a lift, and the rest of the plan carries on.",
  secondary: { href: "#how", label: "See how it works" },
  shots: [
    { file: "02-logger", alt: "Kiron's workout screen: sets of a squat ticked off, with the rest timer running", placeholder: true },
    { file: "01-home", alt: "Kiron's home screen: today's workout, Week 1: Squat + Bench, with a Start Workout button", placeholder: true },
    { file: "05-recovery", alt: "Kiron's muscle recovery map: front and back of a body, the worked muscles in red", placeholder: true },
  ] satisfies Shot[],
  placeholder: false,
};

/* ---------- why (dark band) ---------- */

export const WHY = {
  eyebrow: "Why Kiron",
  heading: "Built for weeks that don't go to plan.",
  lede:
    "A program works over months, but a week rarely goes as written: a late meeting, a hotel gym, legs still tired " +
    "from Saturday. Kiron keeps the program and lets each day change around it.",
  cards: [
    {
      title: "Start any way",
      body:
        `Pick one of ${PROGRAM_COUNT} programs, answer a few questions and Kiron builds one, or write your own. Or paste a plan ` +
        "from ChatGPT, Claude or a coach, or take up to four photos of it.",
    },
    {
      title: "Bend the day",
      body:
        "Make today shorter or longer, swap in another gym's equipment, or add core, arms or a finisher, all with " +
        "Undo. The rest of the plan stays as written.",
    },
    {
      title: "See it add up",
      body:
        "Lifts, runs, rides, swims and rows land in one log, with recovery for each muscle, a chart for every lift " +
        "and reports for each week, month and year.",
    },
  ],
  placeholder: false,
};

/* ---------- the scroll story: seven beats, one screen each ---------- */

export const STORY = {
  id: "how",
  eyebrow: "How it works",
  heading: "Lifting, running and recovery in one app.",
  lede: "Where your program comes from, how a day can change, and what Kiron keeps track of for you.",
};

export const BEATS: Beat[] = [
  {
    id: "start",
    eyebrow: "Start any way",
    heading: `${PROGRAM_COUNT} programs, or bring your own.`,
    body: [
      "Strength with training maxes, muscle-building splits, beginner barbell, bodyweight, dumbbell, kettlebell and " +
        "band plans, and running from a first 5K to a marathon. Filter them by goal, days a week, equipment and level.",
      "Or answer a few questions and Kiron builds a program for you, or build one by hand. Already have a plan from " +
        "ChatGPT, Claude or a coach? Paste it, or take up to four photos of it. Kiron reads the sets, reps, rest and " +
        "phases, and you check what it found before you start.",
    ],
    ticks: [`${PROGRAM_COUNT} ready-made programs`, "Built from your answers", "Built by hand", "Pasted or photographed"],
    shot: {
      file: "03-programs",
      alt: "Kiron's preset programs, with filters for goal, days, equipment and level: First Month in the Gym, 30-Minute Dumbbell, Beginner 5K",
      placeholder: true,
    },
    placeholder: false,
  },
  {
    id: "week",
    eyebrow: "Today and your week",
    heading: "Your plan, one day at a time.",
    body: [
      "Today shows the workout that's due, and the week strip marks each day you trained, workouts from other apps " +
        "included. Full schedule opens the month.",
      "Missed one? Start it now, pick another day, or skip it. Want something else today? Start any workout from " +
        "your programs, a saved one, or an empty one you fill as you go. You can even run two programs at once, like " +
        "a strength plan and a 10K.",
    ],
    note: ["Nothing planned today. Recovery is part of the plan.", "Kiron, on a rest day"],
    shot: {
      file: "01-home",
      alt: "Kiron's Today screen: this week's Squat + Bench workout, 10 weeks in a row, and Start another workout",
      placeholder: true,
    },
    placeholder: false,
  },
  {
    id: "adjust",
    eyebrow: "Bend the day",
    heading: "Change today without breaking the plan.",
    body: [
      "Short on time? Make today shorter and Kiron cuts extras and accessory sets first, keeping your main lifts. " +
        "More time? It adds sets for the muscles your week is behind on.",
      "At a hotel or a friend's garage? Pick that gym and the exercises swap for what's there. Add core, arms or a " +
        "cardio finisher. Swap a lift just for today, for a while, or from now on. Each change says what it did, " +
        "with Undo.",
    ],
    ticks: ["Shorter or longer", "Another gym's equipment", "Core, arms or a finisher", "Swap a lift for today or for good"],
    note: ["I'm sore, adjust today's workout", "A button in the app, after a run or ski day"],
    shot: {
      file: "05b-sore-day-note",
      alt: "Kiron noticing that a ski day tired the legs, offering to adjust today's workout, with Adjust today's workout below",
      placeholder: true,
    },
    placeholder: false,
  },
  {
    id: "workout",
    eyebrow: "The workout screen",
    heading: "Log every set in seconds.",
    body: [
      "Each lift starts from last time's weight and reps. Warm-up sets climb to your working weight, a line under " +
        "the next set says which plates go on each side, and the rest timer starts when you tick a set.",
      "Pair exercises into supersets, keep a note on any exercise, and after the last set say how many more reps " +
        "you had in you. With three or more to spare, the next weight goes up faster.",
    ],
    ticks: ["Last time's numbers", "Warm-up sets", "Plates for each side", "A rest timer that starts itself"],
    shot: {
      file: "02-logger",
      alt: "Kiron's workout screen: warm-up and working sets ticked, plates for each side, and the rest timer",
      placeholder: true,
    },
    placeholder: false,
  },
  {
    id: "cardio",
    eyebrow: "Lifting and cardio",
    heading: "Lift and run in one plan.",
    body: [
      "Runs, rides, swims and rows sit in the same plan as your lifting, logged by time and distance. Run + Lift " +
        "mixes the two, and the 5K, 10K, half marathon, marathon, cycling and sprint triathlon plans build week by " +
        "week. A run or ride can be made shorter or longer for the day too.",
      "Recovery counts all of it. Turn it on, and it also counts the runs, rides and ski days other apps save to " +
        "Apple Health or Health Connect, read on your phone and never stored.",
    ],
    shot: {
      file: "05-recovery",
      alt: "Kiron's muscle recovery map, front and back, with cardio and readiness rings",
      placeholder: true,
    },
    placeholder: false,
  },
  {
    id: "progress",
    eyebrow: "Progress",
    heading: "Watch your lifts climb.",
    body: [
      "Every lift gets a chart of its estimated one-rep max, with your best ever and your heaviest set, over a " +
        "month, three months, a year or all time. Kiron marks a new record on the set you lift it.",
      "Body weight, body fat and lean mass come in from Apple Health or Health Connect, each with its own chart, " +
        "read when you look and never stored.",
    ],
    shot: {
      file: "04-progress",
      alt: "Kiron's progress for the squat: estimated one-rep max over three months, best ever and heaviest set",
      placeholder: true,
    },
    placeholder: false,
  },
  {
    id: "reports",
    eyebrow: "Reports, badges and streaks",
    heading: "See your training add up.",
    body: [
      "Weekly, monthly and yearly reports count workouts done against planned, time, sets and new bests. Weekly set " +
        "targets show each muscle's sets against what your program plans for it.",
      "27 badges to earn, from your first workout to a million pounds lifted, and a streak of weeks in a row.",
    ],
    note: ["A week counts when you finish at least one workout, Monday to Sunday. Rest days don't break it.", "The Badges screen"],
    shot: {
      file: "07-reports",
      alt: "Kiron's weekly report: 2 workouts, 2 of 3 planned done, time, sets, volume and new bests",
      placeholder: true,
    },
    placeholder: false,
  },
];

/* ---------- works with: switching, Health and sharing ---------- */

export const CONNECTIONS = {
  id: "connections",
  eyebrow: "Works with",
  heading: "Bring your history. Keep Health in sync.",
  lede: "Kiron fits in with the apps you already use, and moving over doesn't mean starting from zero.",
  cards: [
    {
      label: "Switching",
      title: "Fitbod, Strong or Hevy",
      body:
        "Export your workouts from the other app and choose the file in Kiron. It shows how each exercise matched " +
        "before it saves, so your charts, records and last-time numbers start full.",
    },
    {
      label: "iPhone and Android",
      title: "Apple Health and Health Connect",
      body:
        "Turn on sync and every workout you finish is saved there. With your permission, Kiron also reads other " +
        "apps' workouts, heart rate and body measurements, on your phone, and never stores them.",
    },
    {
      label: "Friends",
      title: "A workout or a gym, as a link",
      body:
        "Send a friend a workout or your gym's equipment as a link. It opens in Kiron, or shows what you sent to " +
        "anyone without Kiron, and lasts 180 days.",
    },
  ],
  shot: {
    file: "06b-workout-card",
    alt: "Kiron's share card for a finished workout: the muscles worked, minutes, sets and pounds moved",
    placeholder: true,
  } satisfies Shot,
  placeholder: false,
};

/* ---------- pricing ---------- */

export const PRICING = {
  eyebrow: "Pricing",
  heading: "Two plans, the same app.",
  lede: "Try the weekly plan free for 3 days. Cancel anytime in your App Store or Google Play account.",
  features: [
    `All ${PROGRAM_COUNT} programs`,
    "The program builder and plan import",
    "Changes to any day, with Undo",
    "Set-by-set logging",
    "Recovery, progress and reports",
  ],
  plans: [
    { name: "Weekly", price: "$4.99", per: "per week", note: "3-day free trial", hand: "3 days free", cta: "Start free trial", feature: false },
    // the app's paywall badge rounds down the same way: 1 − 49.99 / (4.99 × 52) = 80.7%
    { name: "Annual", price: "$49.99", per: "per year", note: "$0.96 a week", stamp: "Save 80%", hand: null, cta: "Get annual", feature: true },
  ],
  // the store sets the real price, trial and currency; this line stops the page promising otherwise
  finePrint: "Prices in US dollars. Your App Store or Google Play account shows the price and trial where you live.",
  placeholder: false,
};

/* ---------- get kiron ---------- */

export const GET = {
  eyebrow: "Get Kiron",
  heading: "Pick a program. Start today.",
  lede: "Kiron is on iPhone, iPad and Android. Try it free for 3 days on the weekly plan.",
  placeholder: false,
};

/* ---------- faq (also the page's FAQPage structured data) ---------- */

export const FAQ: [question: string, answer: string][] = [
  [
    "What programs does Kiron have?",
    `${PROGRAM_COUNT} ready-made programs, from 2 to 6 days a week: strength (including wave loading with training maxes and two ` +
      "beginner barbell plans), muscle-building splits, bodyweight, dumbbell, kettlebell and band plans, and " +
      "endurance plans from a first 5K to a marathon, plus cycling, rucking and a sprint triathlon. Kiron can also " +
      "build a program from a few answers, or you can build your own.",
  ],
  [
    "Can I bring a plan from ChatGPT, Claude or a coach?",
    "Yes. Paste the text, or choose up to four photos or screenshots of it. Kiron reads the exercises, sets, reps, " +
      "rest and phases, matches each exercise to its library, and shows you the program to check and edit before " +
      "you start.",
  ],
  [
    "Can I change a workout without wrecking my program?",
    "Yes. Make today shorter or longer, train with another gym's equipment, or add core, arms, shoulders, glutes, " +
      "calves, a cardio finisher or stretching. Those changes are for today only, with Undo. A swap can be for " +
      "today, for a while, or from now on.",
  ],
  [
    "Does Kiron do running and other cardio?",
    "Yes. Runs, rides, swims and rows sit in the same plan as your lifting, logged by time and distance in miles or " +
      "kilometers. Recovery counts them, and if you turn it on, it also counts workouts other apps save to Apple " +
      "Health or Health Connect.",
  ],
  [
    "I use Fitbod, Strong or Hevy. Can I bring my history?",
    "Yes. Export your workouts from the other app, then choose the file in Kiron under Settings, Import from another " +
      "app. Kiron shows how each exercise matched before it saves anything. It brings your workouts, not a program: " +
      "those exports don't include one.",
  ],
  [
    "Does Kiron use AI?",
    "Only when you ask it to read a plan or build one. Then the text or photos go to Anthropic's Claude, once you've " +
      "agreed, and you can withdraw that in Settings. The ready-made programs, logging, recovery and everything else " +
      "work without AI.",
  ],
  [
    "How much does it cost?",
    "Kiron is free to download. A subscription unlocks programs and logging: $4.99 a week with a 3-day free trial, " +
      "or $49.99 a year. Cancel anytime in your App Store or Google Play account.",
  ],
];
export const FAQ_PLACEHOLDER = false;

/* ---------- site-wide ---------- */

export const SITE = {
  url: "https://trykiron.com",
  name: "Kiron",
  title: "Kiron: Workout Programs, Gym Log and Recovery",
  description:
    `Follow one of ${PROGRAM_COUNT} workout programs, have Kiron build one, or bring a plan from ChatGPT, Claude or a coach. ` +
    "Change any day, log every set, and track recovery.",
  ogDescription:
    `${PROGRAM_COUNT} ready-made programs, or bring your own. Change any day, log every set, and see recovery and progress. On ` +
    "iPhone and Android.",
  keywords:
    "workout programs, workout tracker, gym log, strength training app, running training plan, hybrid training, " +
    "workout planner, muscle recovery",
  footerLine: "Lift. Run. Recover.",
  email: "help@trykiron.com",
};

/** What's still a placeholder on the home page: the preview bar says so, and the check script counts the page's
    data-placeholder marks the same way. */
export const PLACEHOLDERS = {
  screens: [...HERO.shots, ...BEATS.map((b) => b.shot), CONNECTIONS.shot].filter((s) => s.placeholder).length,
  words:
    [HERO, WHY, CONNECTIONS, PRICING, GET].filter((s) => s.placeholder).length +
    BEATS.filter((b) => b.placeholder).length +
    (FAQ_PLACEHOLDER ? 1 : 0),
};
export const PLACEHOLDER_COUNT = PLACEHOLDERS.screens + PLACEHOLDERS.words;
