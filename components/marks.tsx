/* The app's hand-drawn marks, for the web: a red pen and a pencil (Kiron's src/components/ui/HandDrawn.tsx on
   release/1.2.0, "Soft Log"). The paths are the app's own, copied verbatim, so a tick on the site is the tick in the
   app. They're SVG strokes, never a handwriting font, and their colours come from the CSS tokens (globals.css:
   .pen-stroke is the red pen, .pencil-stroke the pencil), so they follow light and dark like everything else.

   Each stroke has pathLength 100, so CSS can draw it in by animating stroke-dashoffset from 100 to 0, the way the app
   draws a set's tick in. Something marked data-pen draws itself in when it scrolls into view (components/pen-ink.tsx);
   a set tick in the story draws when its beat is reached (scroll-story.tsx). */

const RING =
  "M24.6 9.6 C 33 9.2, 38.8 15.4, 38.5 23.6 C 38.2 32.2, 31.6 38.6, 23.4 38.4 C 15 38.2, 9.4 31.8, 9.6 23.8 C 9.8 16, 15.2 10.2, 23 9.7";
const TICK = "M13 25.5 C 16 27.4, 18.6 30.4, 20.6 34 C 25 24.4, 31 15.8, 40.5 8.5";
const CHECK = "M2.5 8.6 C 4.2 9.6, 5.6 11.2, 6.6 13.2 C 9 8.2, 11.8 4.6, 16 2";
const LOOP =
  "M33 5 C 20 1.6, 5.4 7, 4.6 20 C 3.8 33, 17 39.6, 28.4 37.6 C 40.6 35.6, 45.6 25.4, 42.4 15 C 40.2 8.4, 34 4.6, 25.8 5.2";
export const UNDERLINE = "M2 8.5 C 40 4.5, 84 9.8, 126 6.2 S 200 3.4, 233 6.8";
const TALLY = ["M4 4.5 L4.8 26", "M11.5 3.5 L11.9 26.5", "M19 4.8 L18.6 25.8", "M26.5 3.8 L27.2 26.2"];
const STRIKE = "M0.5 21 C 9 17.5, 20 12.5, 31.5 7.5";
const GROUP_WIDTH = 41;
const MARK_ENDS = [6, 13, 20, 28];

type Size = { size?: number; className?: string };

/** A set's done box: the pencil ring, and the red-pen tick in it (SetTick, PencilRing + PenTick). */
export function SetTick({ size = 28, className = "" }: Size) {
  return (
    <svg className={`mark set-tick ${className}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path className="pencil-stroke" d={RING} strokeWidth={2} />
      <path className="pen-stroke" pathLength={100} d={TICK} strokeWidth={3.4} />
    </svg>
  );
}

/** A small quick check, as on a chosen chip (PenCheck). */
export function PenCheck({ size = 16, className = "" }: Size) {
  return (
    <svg className={`mark pen-check ${className}`} width={size * 1.125} height={size} viewBox="0 0 18 16" aria-hidden="true">
      <path className="pen-stroke" pathLength={100} d={CHECK} strokeWidth={2.4} />
    </svg>
  );
}

/** The red-pen loop the app draws around today's date (PenCircle), here around a word or a number. */
export function PenLoop({ className = "" }: { className?: string }) {
  return (
    <svg className={`mark pen-loop ${className}`} viewBox="0 0 48 44" preserveAspectRatio="none" aria-hidden="true">
      <path className="pen-stroke" pathLength={100} d={LOOP} strokeWidth={2.2} />
    </svg>
  );
}

/** Tally marks in fives, the fifth striking through the four before it (TallyMarks). */
export function TallyMarks({ count, className = "" }: { count: number; className?: string }) {
  const full = Math.floor(count / 5);
  const rest = count % 5;
  const width = rest > 0 ? full * GROUP_WIDTH + MARK_ENDS[rest - 1]! : (full - 1) * GROUP_WIDTH + 33;
  let n = 0;
  const stroke = (d: string) => (
    <path key={n} className="pencil-stroke tally-stroke" pathLength={100} d={d} strokeWidth={2.2} style={{ ["--i" as string]: n++ }} />
  );
  return (
    <svg className={`mark tally ${className}`} width={width} height={30} viewBox={`0 0 ${width} 30`} aria-hidden="true">
      {Array.from({ length: full }, (_, g) => (
        <g key={`g${g}`} transform={`translate(${g * GROUP_WIDTH}, 0)`}>
          {TALLY.map(stroke)}
          {stroke(STRIKE)}
        </g>
      ))}
      {rest > 0 && <g transform={`translate(${full * GROUP_WIDTH}, 0)`}>{TALLY.slice(0, rest).map(stroke)}</g>}
    </svg>
  );
}

/** The PR stamp: a rubber stamp in red pen, pressed in at a slight angle, words in plain type (Stamp). */
export function Stamp({ label, detail, className = "" }: { label: string; detail?: string; className?: string }) {
  return (
    <span className={`stamp ${className}`} data-pen="">
      <span className="stamp-inner">
        <span className="stamp-label">{label}</span>
        {detail && <span className="stamp-detail">{detail}</span>}
      </span>
    </span>
  );
}

/** A list whose items are ticked like logged sets; the ticks draw in one after another as it comes into view. */
export function TickList({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`ticks ${className}`} data-pen="">
      {items.map((item, i) => (
        <li key={item} style={{ ["--i" as string]: i }}>
          <SetTick size={30} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** A list with the small pen check, for what's included. */
export function CheckList({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`checks ${className}`} data-pen="">
      {items.map((item, i) => (
        <li key={item} style={{ ["--i" as string]: i }}>
          <PenCheck size={15} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
