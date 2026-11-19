/* Every word and screenshot on the home page, in one place, so a copy pass or a screenshot pass edits one file.

   WORDS (2026-11-17): Kiron's brand direction, which Taylor liked ("i really like your new branding"). The main line,
   which Taylor chose the same day ("i like your hero trainer line"), is built on Kiron's name: Chiron, the centaur who
   trained Achilles. Five value props are what the app, the store and this site all say about Kiron, in this order:
     1. Know exactly what to do today   2. A plan that moves with your week   3. Strength and cardio, one plan
     4. The right plan, in minutes       5. See it working
   How a plan gets started is sold as a convenience, not a mechanism: "design one around your goals", "bring the plan
   you already follow"; pasting, photos and AI stay out of the headings. "Strength and cardio", not "lifting and
   running". The program count and weights that go up are supporting detail, never the lead. test/site.test.mjs holds
   the page to these words.

   Every claim is something Kiron 1.2 does, checked in the app's code on release/1.2.0; docs/PLACEHOLDERS.md says where
   each is true. Taylor's rule still holds: no superlatives, only specific claims someone could check in the app.
   Strava isn't mentioned: it's in 1.2, but switched off until Strava approves the app.

   SCREENSHOTS are real (2026-11-18): Release builds of 1.2.0 on an iPhone 6.9" simulator, eight shot for the site and
   three kept from the Nov 11 App Store set, full size in assets/screenshots-full/ and 640x1391 in public/shots/.
   A screenshot or block of words can still be marked `placeholder: true`: the preview bar shows it (preview builds
   only) and the check script counts it. docs/PLACEHOLDERS.md says what each shows. */

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

/** How many ready-made programs the app has (src/data/presets on release/1.2.0): 36 at the copy pass, 37 once the
    7-Day Longevity Protocol went out over the air on 2026-11-16, 44 since seven more did on 2026-11-17 (21:36 PT).
    Every count on the home page is this number, and test/site.test.mjs checks llms.txt and the posts'
    content/blog/kiron.json ("program-count") say the same. */
export const PROGRAM_COUNT = 44;

/** What the preview bar says is still a placeholder. */
export const PLACEHOLDER_NOTE = {
  screens: "Some screens are stand-ins",
  words: "some words are drafts",
};

/* ---------- hero: the main line ---------- */

export const HERO = {
  eyebrow: "Strength · Cardio · Recovery",
  heading: "Every hero had a trainer.",
  // written under the headline in Caveat, the app's handwriting, in the red pen; the link preview draws it too
  hand: "Meet yours.",
  // a small line under the buttons: nothing public said where the name comes from before, so the story always
  // comes with this line
  story: "Named for Chiron, who trained Achilles.",
  lede:
    "Kiron has today's workout ready, weights included, and moves your plan when your week changes. Strength and " +
    "cardio in one plan: pick a program, design one around your goals, or bring the plan you already follow.",
  secondary: { href: "#how", label: "See how it works" },
  shots: [
    { file: "02-logger", alt: "Kiron's workout screen: sets of a squat ticked off, with the rest timer running", placeholder: false },
    {
      file: "today-up-next",
      alt: "Kiron's Today screen: this week's strip, up next Lower A: Quads with its exercises, a note that the quads are still recovering from a ski day, and Start workout",
      placeholder: false,
    },
    {
      file: "history-recovery",
      alt: "Kiron's History screen: 10 weeks in a row, and the muscle recovery map, front and back, with the legs still recovering after a ski day",
      placeholder: false,
    },
  ] satisfies Shot[],
  placeholder: false,
};

/* ---------- why (dark band): the five value props ---------- */

export const WHY = {
  eyebrow: "Why Kiron",
  heading: "Built for weeks that don't go to plan.",
  lede:
    "A program works over months, but a week rarely goes as written: a late meeting, a missed Monday, legs still " +
    "tired from Saturday's run. Kiron keeps the plan and moves each day around your week.",
  cards: [
    {
      title: "Know exactly what to do today",
      body:
        "Your workout is ready, with weights picked for you and a note on why. New to a lift? Say how the first set " +
        "felt and Kiron adjusts the rest.",
    },
    {
      title: "A plan that moves with your week",
      body:
        "Train on set days or whenever you can. Miss one and it moves; short on time, make today shorter and keep " +
        "your main lifts.",
    },
    {
      title: "Strength and cardio, one plan",
      body: "Lifting, runs, rides and swims together, with recovery that counts them all, even other apps' workouts.",
    },
    {
      title: "The right plan, in minutes",
      body: `Pick one of ${PROGRAM_COUNT} programs, design one around your goals, or bring the plan you already follow.`,
    },
    {
      title: "See it working",
      body: "Records marked as you set them, a chart for every lift, and a report for every week, month and year.",
    },
  ],
  placeholder: false,
};

/* ---------- the scroll story: seven beats, one screen each ---------- */

export const STORY = {
  id: "how",
  eyebrow: "How it works",
  heading: "Strength, cardio and recovery in one app.",
  lede: "Where your plan comes from, how it fits your week, and what Kiron keeps track of for you.",
};

export const BEATS: Beat[] = [
  {
    id: "start",
    eyebrow: "Your plan",
    heading: "Pick one, design one, or bring your own.",
    body: [
      "Strength with training maxes, muscle-building splits, powerbuilding, and beginner plans for 3 to 6 days a week. " +
        "Bodyweight, dumbbell, kettlebell and band plans, a four-week comeback after time away, and running from a " +
        "first 5K to a marathon. Filter them by goal, days a week, equipment and level.",
      "Or design a program around your goals, or build one by hand. Already follow a plan from a coach, another app " +
        "or ChatGPT? Bring it, and Kiron runs it, one workout at a time.",
    ],
    ticks: [`${PROGRAM_COUNT} ready-made programs`, "Designed around your goals", "Built by hand", "The plan you already follow"],
    shot: {
      file: "programs-that-fit",
      alt: "Kiron's programs that fit, for building muscle four days a week with a full gym: Upper / Lower Muscle marked best fit, PHUL, a five-day split, and Design one around your goals",
      placeholder: false,
    },
    placeholder: false,
  },
  {
    id: "week",
    eyebrow: "Your week",
    heading: "Set days, or whenever you can.",
    body: [
      "Give a program set days, or choose Whenever I train: it keeps its order, and the next workout waits for " +
        "whichever day you show up. The week strip marks each day you trained, workouts from other apps included.",
      "Missed one on a set day? Start it now, pick another day or skip it, or let Kiron move missed workouts for " +
        "you. Want something else today? Start any workout from your programs, a saved one, or an empty one. You can " +
        "even run two programs at once, like a strength plan and a 10K.",
    ],
    note: ["Nothing planned today. Recovery is part of the plan.", "Kiron, on a rest day"],
    shot: {
      file: "schedule-sheet",
      alt: "Kiron's Schedule sheet: Whenever I train or Fixed days, training days Monday, Wednesday and Friday, and Move missed workouts for me switched on",
      placeholder: false,
    },
    placeholder: false,
  },
  {
    id: "adjust",
    eyebrow: "Adjust today",
    heading: "Change today without breaking the plan.",
    body: [
      "Short on time? Make today shorter and Kiron cuts extras and accessory sets first, keeping your main lifts. " +
        "More time? It adds sets for the muscles your week is behind on.",
      "Add core, arms or a cardio finisher, or swap a lift just for today, for a while, or from now on. Training " +
        "somewhere else? Pick that gym and the exercises swap for what's there. Each change says what it did, with " +
        "Undo.",
    ],
    ticks: ["Shorter or longer", "Core, arms or a finisher", "Swap a lift for today or for good", "Another gym's equipment"],
    note: ["I'm sore, adjust today's workout", "A button in the app, after a run or ski day"],
    shot: {
      file: "adjust-today",
      alt: "Kiron's Adjust today's workout sheet: change the duration, add to today, train at a hotel gym today, or use different equipment",
      placeholder: false,
    },
    placeholder: false,
  },
  {
    id: "workout",
    eyebrow: "Today's workout",
    heading: "Your weights, picked and explained.",
    body: [
      "Each lift comes with its weight filled in: last time's, a step up when you hit every set, or, for a lift you " +
        "haven't done lately, a starting weight with a note from Kiron on how it got there. Say how the first set " +
        "felt and Kiron adjusts the sets still to do.",
      "Warm-up sets climb to your working weight, a line under the next set says which plates go on each side, and " +
        "the rest timer starts when you tick a set. Pair exercises into supersets, keep a note on any exercise, and " +
        "after the last set say how many more reps you had in you.",
    ],
    ticks: ["Weights filled in", "A note on why", "Plates for each side", "A rest timer that starts itself"],
    shot: {
      file: "first-set-check",
      alt: "Kiron's workout screen: Hack Squat with Kiron's note on how it picked 150 lb, the warm-ups and first set ticked, and How did 150 lb feel? Too easy, Just right or Too hard",
      placeholder: false,
    },
    placeholder: false,
  },
  {
    id: "cardio",
    eyebrow: "Strength and cardio",
    heading: "One plan, one recovery picture.",
    body: [
      "Runs, rides, swims and rows sit in the same plan as your strength work, logged by time and distance. Run + " +
        "Lift mixes the two, and the 5K, 10K, half marathon, marathon, cycling and sprint triathlon plans build week " +
        "by week. A run or ride can be made shorter or longer for the day too.",
      "Recovery counts all of it. Turn it on, and it also counts the runs, rides and ski days other apps save to " +
        "Apple Health or Health Connect, read on your phone and never stored.",
    ],
    shot: {
      file: "recovery-other-apps",
      alt: "Kiron's recovery screen: training load week by week, then workouts from other apps, a ski day and a run from an Apple Watch, read from Apple Health",
      placeholder: false,
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
      placeholder: false,
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
      placeholder: false,
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
    file: "import-summary",
    alt: "Kiron ready to import from Strong: 48 workouts from Aug 24 to Nov 13, 2026, all 19 exercises matched to Kiron's library, and Import 48 workouts",
    placeholder: false,
  } satisfies Shot,
  placeholder: false,
};

/* ---------- pricing ---------- */

export const PRICING = {
  eyebrow: "Pricing",
  heading: "Two plans, the same app.",
  lede: "Both plans start with 7 days free. Cancel anytime in your App Store or Google Play account.",
  // what a subscription gets you: the five value props, short
  features: [
    "Today's workout, with weights picked for you",
    "A plan that moves with your week",
    "Strength and cardio in one plan",
    "The right plan, ready in minutes",
    "Records, charts and reports",
  ],
  plans: [
    // the app's paywall names them Monthly and Yearly, both with a 7-day free trial for new subscribers
    { name: "Monthly", price: "$9.99", per: "per month", note: "7-day free trial", hand: "7 days free", cta: "Start free trial", feature: false },
    // the app's paywall badge rounds down the same way: 1 − 49.99 / (9.99 × 12) = 58.3%
    { name: "Yearly", price: "$49.99", per: "per year", note: "about $4.17 a month", stamp: "Save 58%", hand: null, cta: "Start free trial", feature: true },
  ],
  // the store sets the real price, trial and currency; this line stops the page promising otherwise
  finePrint:
    "Prices in US dollars. The free trial is for new subscribers. Your App Store or Google Play account shows the " +
    "price and trial where you live.",
  placeholder: false,
};

/* ---------- get kiron ---------- */

export const GET = {
  eyebrow: "Get Kiron",
  // the main line's own close
  heading: "Train like a hero.",
  lede: "Kiron is on iPhone, iPad and Android. Start with 7 days free.",
  placeholder: false,
};

/* ---------- faq (also the page's FAQPage structured data) ---------- */

export const FAQ: [question: string, answer: string][] = [
  [
    "What programs does Kiron have?",
    `${PROGRAM_COUNT} ready-made programs, from 2 to 6 days a week: strength (including wave loading with training maxes, two ` +
      "beginner barbell plans and powerbuilding), muscle-building splits, beginner plans for up to six days a week, " +
      "bodyweight, dumbbell, kettlebell and band plans, 20-minute dumbbell days, a four-week comeback for lifters " +
      "returning after time away, plans that mix strength and cardio, and endurance plans from a first 5K to a " +
      "marathon, plus cycling, rucking and a sprint triathlon. You can also design one around your goals, build your " +
      "own, or bring the plan you already follow.",
  ],
  [
    "Can I bring the plan I already follow?",
    "Yes, from a coach, another app, ChatGPT or Claude. Paste the text, or choose up to four photos or screenshots of " +
      "it. Kiron matches each exercise to its library and sets out the sets, reps, rest and phases as a program you " +
      "can check and edit before you start.",
  ],
  [
    "Do I have to train on set days?",
    "No. Each program runs on set days or Whenever I train. With set days, Kiron can move a missed workout to the next " +
      "free day that week for you. With Whenever I train, the program keeps its order and the next workout waits for " +
      "whichever day you show up, so nothing is ever missed.",
  ],
  [
    "How does Kiron pick my weights?",
    "From what you've lifted. A lift you did lately starts from last time's weight, or a step up when you hit every " +
      "set. One you haven't done for a month or more starts lighter, more so the longer it's been. For one you've " +
      "never done, Kiron works " +
      "from a related lift you have done, or from typical starting numbers for your sex, body weight and age, and " +
      "leaves a note saying how it got there. After the first set, tell it how the weight felt and it adjusts the rest.",
  ],
  [
    "Can I change a workout without wrecking my program?",
    "Yes. Make today shorter or longer, train with another gym's equipment, or add core, arms, shoulders, glutes, " +
      "calves, a cardio finisher or stretching. Those changes are for today only, with Undo. A swap can be for " +
      "today, for a while, or from now on.",
  ],
  [
    "Does Kiron do running and other cardio?",
    "Yes. Runs, rides, swims and rows sit in the same plan as your strength work, logged by time and distance in " +
      "miles or kilometers. Recovery counts them, and if you turn it on, it also counts workouts other apps save to " +
      "Apple Health or Health Connect.",
  ],
  [
    "Does Kiron work without signal?",
    "Yes, for your training. Workouts open, log and finish with no signal, and Today, History and your plans show " +
      "what's saved on your phone. Everything syncs once you're back online. A few things need a connection: " +
      "designing a program or reading a plan you bring, importing history, sharing a link, and changing your plan's " +
      "settings.",
  ],
  [
    "I use Fitbod, Strong or Hevy. Can I bring my history?",
    "Yes. Export your workouts from the other app, then choose the file in Kiron under Settings, Import from another " +
      "app. Kiron shows how each exercise matched before it saves anything. It brings your workouts, not a program: " +
      "those exports don't include one.",
  ],
  [
    "Does Kiron use AI?",
    "Only when you ask it to design a program or read a plan you bring. Then your answers, the text or the photos go " +
      "to Anthropic's Claude, once you've agreed, and you can withdraw that in Settings. The ready-made programs, " +
      "your weights, logging, recovery and everything else work without AI.",
  ],
  [
    "How much does it cost?",
    "Kiron is free to download. A subscription unlocks programs and logging: $9.99 a month or $49.99 a year, and new " +
      "subscribers get 7 days free on either plan. Cancel anytime in your App Store or Google Play account.",
  ],
  ["Why is it called Kiron?", "It's named for Chiron, the centaur of Greek myth who trained Achilles, Jason and Heracles."],
];
export const FAQ_PLACEHOLDER = false;

/* ---------- site-wide ---------- */

export const SITE = {
  url: "https://trykiron.com",
  name: "Kiron",
  title: "Kiron: Workout Plans for Strength and Cardio",
  description:
    "Kiron has today's workout ready, weights included, and moves your plan when your week changes. Strength and " +
    "cardio in one plan, on iPhone, iPad and Android.",
  ogDescription:
    "Know exactly what to do today, with a plan that moves with your week. Pick a program, design one around your " +
    "goals, or bring the plan you already follow.",
  keywords:
    "workout plan app, workout planner, strength and cardio, strength training app, running training plan, " +
    "hybrid training, gym log, muscle recovery",
  footerLine: "Strength and cardio, one plan.",
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
