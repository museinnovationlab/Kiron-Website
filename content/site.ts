/* Every word and screenshot on the home page, in one place, so the copy pass and the screenshot pass edit one file.

   PLACEHOLDERS (2026-11-14). Taylor decided on real screenshots and on copy in their own voice, both once the app's
   screens are final. Until then:
   - the screenshots are the 1.2.0 App Store set (Kiron/store-screenshots/1.2.0/ios-6.9, shot Nov 11, before the Today
     redesign), downscaled to 640x1391 into public/shots/;
   - the words are today's trykiron.com, moved into this layout. Where today's site says nothing about a feature (the
     swap, recovery, sharing, Strava), the line is a plain description of what the app does, from the app's own screens.
   Anything still marked `placeholder: true` shows in the preview bar (preview builds only) and is counted by the check
   script. Replace it, then delete the flag. docs/PLACEHOLDERS.md lists them all. */

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

export const PLACEHOLDER_SOURCE =
  "Screens are the 1.2.0 App Store set (Nov 11, before the Today redesign); words are today's trykiron.com.";

/* ---------- hero ---------- */

export const HERO = {
  eyebrow: "Build · Train · Track",
  // the <em> word is drawn in the red pen
  heading: ["Your AI wrote the workout.", "Kiron", "runs it."] as const,
  lede:
    "AI chatbots can generate a workout plan in seconds. But they can't track your workouts. Paste your plan into " +
    "Kiron and you're ready to train — no templates, no manual setup.",
  secondary: { href: "#how", label: "See how it works" },
  shots: [
    { file: "02-logger", alt: "Kiron's workout screen: sets of a squat ticked off, with the rest timer running", placeholder: true },
    { file: "01-home", alt: "Kiron's home screen: today's workout, Week 1: Squat + Bench, with a Start Workout button", placeholder: true },
    { file: "05-recovery", alt: "Kiron's muscle recovery map: front and back of a body, the worked muscles in red", placeholder: true },
  ] satisfies Shot[],
  placeholder: true,
};

/* ---------- why (dark band) ---------- */

export const WHY = {
  eyebrow: "How it works",
  heading: "Three steps. Zero setup.",
  lede:
    "Whether your workout plan came from an AI chatbot, a coach, or online — Kiron acts as your workout planner and " +
    "gym tracker, turning any program into a trackable training schedule.",
  cards: [
    {
      title: "Ask any AI",
      body: "Ask ChatGPT, Claude, or any AI chatbot to write your workout program. Tell it your goals, schedule, and equipment.",
    },
    {
      title: "Paste into Kiron",
      body: "Copy the AI's response and paste it into Kiron. The app reads the plan and automatically creates your full program.",
    },
    {
      title: "Train & track",
      body: "Follow your schedule day by day. Log sets, weights, and reps. Kiron tracks every session and your progress over time.",
    },
  ],
  placeholder: true,
};

/* ---------- the scroll story: seven beats, one screen each ---------- */

export const STORY = {
  id: "how",
  eyebrow: "Inside Kiron",
  heading: "Everything your training needs.",
  lede: "Built around how real lifters actually train — not generic fitness app templates.",
};

export const BEATS: Beat[] = [
  {
    id: "import",
    eyebrow: "Any plan",
    heading: "Bring the plan you already have.",
    body: [
      "Ask ChatGPT, Claude, or any AI chatbot to write your program. Paste the result into Kiron — it maps every " +
        "exercise, set, and rep automatically.",
      "A photo of a printed plan works too. Or start from one of Kiron's ready-made programs.",
    ],
    ticks: ["Pasted text", "A photo of a printed plan", "Ready-made programs"],
    shot: { file: "03-programs", alt: "Kiron's preset programs: First Month in the Gym, 30-Minute Dumbbell, Beginner 5K", placeholder: true },
    placeholder: true,
  },
  {
    id: "today",
    eyebrow: "Today and your week",
    heading: "Know what to train next.",
    body: [
      "Kiron organizes your workout schedule automatically and shows you exactly what to train next. No guessing, no " +
        "rebuilding your training plan each week.",
    ],
    note: ["Multi-phase programs, rest days, and deload weeks, all handled on your calendar.", "From today's trykiron.com"],
    shot: { file: "01-home", alt: "Kiron's home screen: today's workout and the streak of weeks in a row", placeholder: true },
    placeholder: true,
  },
  {
    id: "workout",
    eyebrow: "The workout screen",
    heading: "Built for the gym floor.",
    body: [
      "Log sets, reps, and weight with a simple, fast workout log. Kiron shows the plates for each side of the bar, " +
        "and the rest timer starts when you tick a set.",
    ],
    ticks: ["Set-by-set logging", "Plates for each side", "A rest timer that starts itself"],
    shot: { file: "02-logger", alt: "Kiron's workout screen: warm-up and working sets, plates per side, and the rest timer", placeholder: true },
    placeholder: true,
  },
  {
    id: "adjust",
    eyebrow: "Swap or adjust",
    heading: "Change today without breaking the plan.",
    body: [
      "Sore from yesterday? Kiron can lighten today's workout for the muscles still recovering. Swap an exercise or " +
        "adjust today without touching the rest of your plan.",
    ],
    note: ["I'm sore, adjust today's workout", "A button in the app"],
    shot: { file: "05b-sore-day-note", alt: "Kiron noticing the muscles still recovering and offering to adjust today's workout", placeholder: true },
    placeholder: true,
  },
  {
    id: "progress",
    eyebrow: "Progress and records",
    heading: "See every lift go up.",
    body: [
      "See your workout history, volume trends, and personal records — all in one place. Kiron marks a new record the " +
        "set you lift it.",
    ],
    shot: { file: "04-progress", alt: "Kiron's progress for the squat: estimated one-rep max over three months", placeholder: true },
    placeholder: true,
  },
  {
    id: "recovery",
    eyebrow: "Muscle recovery",
    heading: "Know what's ready to train.",
    body: [
      "Every workout you log lands on a map of your muscles, so you can see what's recovered and what still needs a " +
        "day — before you plan the next session.",
    ],
    shot: { file: "05-recovery", alt: "Kiron's muscle recovery map, front and back, with cardio and readiness rings", placeholder: true },
    placeholder: true,
  },
  {
    id: "share",
    eyebrow: "History, sharing and Strava",
    heading: "Every session, kept.",
    body: [
      "Your workout history is always available. Share a finished workout as a card, send a friend the workout itself " +
        "as a link, or post it to Strava.",
    ],
    shot: { file: "06b-workout-card", alt: "Kiron's workout card: the week's squat and bench session as a picture to share", placeholder: true },
    placeholder: true,
  },
];

/* ---------- connections band ---------- */

export const CONNECTIONS = {
  id: "connections",
  eyebrow: "Works with",
  heading: "One Kiron, wherever your training lives.",
  lede: "Completed workouts sync automatically to Apple Health and Google Health Connect.",
  cards: [
    { label: "iPhone", title: "Apple Health", body: "When you complete a workout, Kiron automatically writes it to Apple Health." },
    { label: "Android", title: "Health Connect", body: "On Android, finished workouts go to Google Health Connect — no extra steps needed." },
    { label: "Anywhere", title: "Strava", body: "Connect Strava and your finished workouts can post there too." },
  ],
  shot: { file: "06-finish", alt: "Kiron's finish screen: minutes, exercises and new personal records", placeholder: true } satisfies Shot,
  placeholder: true,
};

/* ---------- pricing ---------- */

export const PRICING = {
  eyebrow: "Pricing",
  heading: "Simple pricing.",
  lede: "Try free for 3 days. Cancel anytime.",
  features: ["Full app access", "Unlimited programs", "Exercise library", "Health sync"],
  plans: [
    { name: "Weekly", price: "$4.99", per: "per week", note: "3-day free trial", hand: "3 days free", cta: "Start free trial", feature: false },
    { name: "Annual", price: "$49.99", per: "per year", note: "Save ~80% vs weekly", hand: null, cta: "Get annual", feature: true },
  ],
  // the store sets the real price, trial and currency; this line stops the page promising otherwise
  finePrint: "Prices in US dollars. Your App Store or Google Play account shows the price and trial where you live.",
  placeholder: true,
};

/* ---------- get kiron ---------- */

export const GET = {
  eyebrow: "Get Kiron",
  heading: "Stop building programs in spreadsheets.",
  lede: "Ask ChatGPT to write your plan. Paste it into Kiron. Start free today.",
  placeholder: true,
};

/* ---------- faq (also the page's FAQPage structured data) ---------- */

export const FAQ: [question: string, answer: string][] = [
  [
    "Can I use any AI to build my plan?",
    "Yes — ChatGPT, Claude, Gemini, or any AI that can output a structured workout plan. Just ask it to write your program and paste the result into Kiron.",
  ],
  [
    "What if my plan isn't formatted perfectly?",
    "Kiron's parser is designed to handle real AI output — messy formatting, varied terminology, and all. It maps exercises, sets, reps, and rest periods automatically.",
  ],
  [
    "Does Kiron support cardio and non-lifting workouts?",
    "Yes. The exercise library covers strength, cardio, carries, timed holds, and bodyweight movements. Anything your AI plan includes, Kiron can track.",
  ],
  [
    "How does Apple Health sync work?",
    "When you complete a workout, Kiron automatically writes it to Apple Health (and Google Health Connect on Android) — no extra steps needed.",
  ],
  [
    "Is there a free trial?",
    "Yes — 3 days free on the weekly plan. Cancel in your App Store or Google Play account before it ends and you won't be charged.",
  ],
];
export const FAQ_PLACEHOLDER = true;

/* ---------- site-wide ---------- */

export const SITE = {
  url: "https://trykiron.com",
  name: "Kiron",
  title: "Kiron — AI Workout Tracker for iOS & Android",
  description:
    "Kiron is an AI workout tracker that turns any AI-generated fitness plan into a structured training program. Ask ChatGPT or Claude to write your plan, paste it in, and start training.",
  ogDescription:
    "Ask ChatGPT or Claude to write your workout plan. Paste it into Kiron and you're ready to train — no manual setup, no spreadsheets.",
  keywords:
    "AI workout tracker, AI fitness program, workout plan app, gym workout logger, strength training app, AI personal trainer",
  footerLine: "Build. Train. Track.",
  email: "help@trykiron.com",
};

/** Whether anything on the home page is still a placeholder (the preview bar and the check script use this). */
export const PLACEHOLDER_COUNT =
  [HERO, WHY, CONNECTIONS, PRICING, GET].filter((s) => s.placeholder).length +
  BEATS.filter((b) => b.placeholder).length +
  (FAQ_PLACEHOLDER ? 1 : 0);
