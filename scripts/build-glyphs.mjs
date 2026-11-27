#!/usr/bin/env node
/* Writes components/glyphs.ts: the line icons the page's moving background draws (components/glyph-field.tsx).

   Every glyph is a Lucide icon (lucide.dev, ISC; the successor to Feather, which the app draws its icons with),
   except `runner`, which is Tabler Icons' `run` (MIT), the same figure Bearing's site uses: it suits Kiron's runner
   mark. Licences are in LICENSES.md.

   The canvas strokes one Path2D per glyph, so each icon's circles, rects, lines and polylines are written out as
   path commands here, once, rather than at runtime. Run it with a Lucide package on disk, either flavour:

     npm run glyphs -- <path to lucide-react-native>   # dist/esm/icons/<name>.js (Jist's site used 0.560.0)
     npm run glyphs -- <path to lucide-static>         # icons/<name>.svg

   To change the set, edit LIST below and run it again. */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lucide = process.argv[2] || process.env.LUCIDE_DIR;
if (!lucide) {
  console.error("Usage: npm run glyphs -- <path to a lucide-react-native or lucide-static package>");
  process.exit(1);
}
const pkg = JSON.parse(readFileSync(join(lucide, "package.json"), "utf8"));

/* [Lucide name, colour family]. The family is the colour a glyph warms toward under the pointer:
     0 = navy, the app's secondary ink (the kit: equipment, the plan, time)
     1 = green, the app's "done" and "recovered" (ticks, rest, recovery)
     2 = the red pen, the app's own mark (records, streaks, the runner)
   The red pen means something in the app (the ticks, the PR stamp, the tally streak), so it's kept sparse here. */
const LIST = [
  ["dumbbell", 0],
  ["weight", 0],
  ["biceps-flexed", 0],
  ["bike", 0],
  ["footprints", 0],
  ["mountain", 0],
  ["waves", 0],
  ["timer", 0],
  ["alarm-clock", 0],
  ["hourglass", 0],
  ["calendar-days", 0],
  ["clipboard-list", 0],
  ["notebook-text", 0],
  ["camera", 0],
  ["file-text", 0],
  ["clipboard-paste", 0],
  ["share-2", 0],
  ["watch", 0],
  ["route", 0],
  ["gauge", 0],
  ["chart-line", 0],
  ["chart-no-axes-column-increasing", 0],
  ["repeat-2", 0],
  ["shuffle", 0],
  ["person-standing", 0],
  ["goal", 0],
  ["flag", 0],
  ["droplet", 0],
  ["circle-check", 1],
  ["check-check", 1],
  ["calendar-check", 1],
  ["list-checks", 1],
  ["bed", 1],
  ["moon", 1],
  ["battery-charging", 1],
  ["heart-pulse", 1],
  ["activity", 1],
  ["sun", 1],
  ["trending-up", 1],
  ["trophy", 2],
  ["medal", 2],
  ["award", 2],
  ["flame", 2],
  ["zap", 2],
  ["pencil-line", 2],
  ["notebook-pen", 2],
];

/** Tabler Icons' `run` (MIT), unmodified: Bearing's site's runner. */
const RUNNER = "M11.007 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M4 17l5 1l.75 -1.5M15 21v-4l-4 -3l1 -6M7 12v-3l5 -1l3 3l3 1";

/* The app's own hand-drawn marks (Kiron src/components/ui/HandDrawn.tsx, "Soft Log"), so the field is drawn partly in
   the app's red pen and pencil: the paths are the app's, moved and scaled from their own boxes into the 24×24 field.
   [name, family, [[app path, ...], scale x, scale y, shift x, shift y], stroke weight (× the field's 1.5)] */
const APP_RING =
  "M24.6 9.6 C 33 9.2, 38.8 15.4, 38.5 23.6 C 38.2 32.2, 31.6 38.6, 23.4 38.4 C 15 38.2, 9.4 31.8, 9.6 23.8 C 9.8 16, 15.2 10.2, 23 9.7";
const APP_TICK = "M13 25.5 C 16 27.4, 18.6 30.4, 20.6 34 C 25 24.4, 31 15.8, 40.5 8.5";
const APP_CHECK = "M2.5 8.6 C 4.2 9.6, 5.6 11.2, 6.6 13.2 C 9 8.2, 11.8 4.6, 16 2";
const APP_LOOP =
  "M33 5 C 20 1.6, 5.4 7, 4.6 20 C 3.8 33, 17 39.6, 28.4 37.6 C 40.6 35.6, 45.6 25.4, 42.4 15 C 40.2 8.4, 34 4.6, 25.8 5.2";
const APP_UNDERLINE = "M2 8.5 C 40 4.5, 84 9.8, 126 6.2 S 200 3.4, 233 6.8";
const APP_TALLY = ["M4 4.5 L4.8 26", "M11.5 3.5 L11.9 26.5", "M19 4.8 L18.6 25.8", "M26.5 3.8 L27.2 26.2", "M0.5 21 C 9 17.5, 20 12.5, 31.5 7.5"];
const PEN = [
  ["set-tick", 2, [[APP_RING, APP_TICK], 0.5, 0.5, 0, 0], 1.15], // a logged set: the pencil ring and the red tick
  ["pen-tick", 2, [[APP_TICK], 0.5, 0.5, -1.4, 1.4], 1.35],
  ["pencil-ring", 0, [[APP_RING], 0.5, 0.5, 0, 0], 1],
  ["pen-check", 1, [[APP_CHECK], 1.2, 1.2, 1.2, 2.4], 1.35], // a done day's check
  ["pen-loop", 2, [[APP_LOOP], 0.5, 0.5, 0, 1], 1.1], // the loop around today's date
  ["tally", 0, [APP_TALLY, 0.7, 0.7, 0.8, 1.5], 1.1], // five in a row, the streak
  ["pen-underline", 2, [[APP_UNDERLINE], 0.095, 1, 0.9, 5.5], 1.35],
];

/** Moves and scales a path made only of absolute commands with coordinate pairs (M, L, C, S, Q, T), as the app's are. */
function place(d, sx, sy, dx, dy) {
  return d.replace(/([MLCSQT])([^MLCSQTZz]*)/g, (_, cmd, args) => {
    const nums = (args.match(NUMBER) || []).map(Number);
    return cmd + nums.map((v, i) => fmt(i % 2 === 0 ? v * sx + dx : v * sy + dy)).join(" ");
  });
}

const NUMBER = /[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;
const n = (v) => Number(v);
const fmt = (v) => String(Math.round(v * 1000) / 1000);

/* One SVG element as path commands. A path's own d is kept, except that a leading relative moveto ("m2.5 21.5 1.4-1.4")
   becomes absolute: it's absolute as the first command of its own element, but not once it follows another shape in
   the same Path2D. Coordinates after its first pair are an implied relative lineto, so they get an explicit "l". */
function toPath(tag, a) {
  switch (tag) {
    case "path": {
      const d = a.d.trim();
      if (d[0] !== "m") return d;
      const rest = d.slice(1);
      const next = rest.search(/[a-df-zA-DF-Z]/); // the next command letter (e is an exponent)
      const args = next < 0 ? rest : rest.slice(0, next);
      const tail = next < 0 ? "" : rest.slice(next);
      const nums = args.match(NUMBER) || [];
      const [x, y, ...more] = nums;
      return `M${x} ${y}${more.length ? "l" + more.join(" ").replace(/ -/g, "-") : ""}${tail}`;
    }
    case "circle": {
      const [cx, cy, r] = [n(a.cx), n(a.cy), n(a.r)];
      return `M${fmt(cx - r)} ${fmt(cy)}a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(2 * r)} 0a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-2 * r)} 0`;
    }
    case "ellipse": {
      const [cx, cy, rx, ry] = [n(a.cx), n(a.cy), n(a.rx), n(a.ry)];
      return `M${fmt(cx - rx)} ${fmt(cy)}a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(2 * rx)} 0a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(-2 * rx)} 0`;
    }
    case "rect": {
      const [x, y, w, h] = [n(a.x ?? 0), n(a.y ?? 0), n(a.width), n(a.height)];
      const rx = Math.min(n(a.rx ?? a.ry ?? 0), w / 2);
      const ry = Math.min(n(a.ry ?? a.rx ?? 0), h / 2);
      if (!rx) return `M${fmt(x)} ${fmt(y)}h${fmt(w)}v${fmt(h)}h${fmt(-w)}Z`;
      const arc = (dx, dy) => `a${fmt(rx)} ${fmt(ry)} 0 0 1 ${fmt(dx)} ${fmt(dy)}`;
      return (
        `M${fmt(x + rx)} ${fmt(y)}h${fmt(w - 2 * rx)}${arc(rx, ry)}v${fmt(h - 2 * ry)}${arc(-rx, ry)}` +
        `h${fmt(-(w - 2 * rx))}${arc(-rx, -ry)}v${fmt(-(h - 2 * ry))}${arc(rx, -ry)}Z`
      );
    }
    case "line":
      return `M${a.x1} ${a.y1}L${a.x2} ${a.y2}`;
    case "polyline":
    case "polygon": {
      const pts = a.points.trim().match(NUMBER) || [];
      let d = "";
      for (let i = 0; i < pts.length; i += 2) d += `${i ? "L" : "M"}${pts[i]} ${pts[i + 1]}`;
      return tag === "polygon" ? d + "Z" : d;
    }
    default:
      throw new Error(`no conversion for <${tag}>`);
  }
}

/** An icon's elements as [tag, attributes], read as text (never run) from either package's file. */
function elements(name) {
  const js = join(lucide, "dist", "esm", "icons", `${name}.js`);
  const svg = join(lucide, "icons", `${name}.svg`);
  if (existsSync(js)) {
    const src = readFileSync(js, "utf8");
    return [...src.matchAll(/\[\s*"(\w+)",\s*\{([^}]*)\}\s*\]/g)].map(([, tag, body]) => [
      tag,
      Object.fromEntries([...body.matchAll(/(\w+):\s*"([^"]*)"/g)].map(([, k, v]) => [k, v])),
    ]);
  }
  if (existsSync(svg)) {
    const src = readFileSync(svg, "utf8").replace(/<svg[^>]*>/, "");
    return [...src.matchAll(/<(path|circle|ellipse|rect|line|polyline|polygon)\b([^>]*?)\/?>/g)].map(([, tag, body]) => [
      tag,
      Object.fromEntries([...body.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v])),
    ]);
  }
  throw new Error(`${name}: not in ${lucide}`);
}

const rows = LIST.map(([name, fam]) => {
  const els = elements(name).filter(([tag]) => tag !== "key");
  if (els.length === 0) throw new Error(`${name}: no shapes found`);
  return [name, fam, els.map(([tag, a]) => toPath(tag, a)).join("")];
});
rows.splice(rows.findIndex(([, fam]) => fam === 2), 0, ["runner", 2, RUNNER]);
for (const [name, fam, [paths, sx, sy, dx, dy], weight] of PEN) {
  if (/[a-z]/.test(paths.join("").replace(/e/g, ""))) throw new Error(`${name}: relative commands can't be placed`);
  rows.push([name, fam, paths.map((d) => place(d, sx, sy, dx, dy)).join(""), weight]);
}

const file = `/* Line glyphs on a 24×24 field for the page's ground (glyph-field.tsx, after Bearing's site). Their subjects are what
   Kiron touches: the kit (barbells, a bike, a stopwatch), the plan (a calendar, a clipboard, a photo, a PDF, pasted
   text), what training leaves behind (ticks, records, a streak) and rest (sleep, recovery), so a dense field never
   reads as one motif repeated.

   GENERATED by scripts/build-glyphs.mjs from ${pkg.name} ${pkg.version}; edit the list there and run it again.
   The icons are Lucide's (lucide.dev, ISC; Feather's successor, and the app draws Feather's icons) with each circle,
   rect, line and polyline written out as path commands, so one Path2D draws a glyph. \`runner\` is Tabler Icons' \`run\`
   (MIT), the figure Bearing's site uses, for Kiron's runner mark. The last few are the app's own pen and pencil marks
   (HandDrawn.tsx: a set's tick in its ring, the check, the loop round today, a tally of five, the underline), drawn a
   little bolder, so the field is partly in the app's hand. Stroked, never filled. Licences: LICENSES.md.

   \`fam\` is the colour a glyph warms toward under the pointer:
     0 = navy (the kit, the plan, time)   1 = green (done, rested, recovered)   2 = the red pen (records, the runner)
   The red pen is the app's own mark (ticks, the PR stamp, the tally streak), so it's kept sparse. */

/** [name, colour family (0 navy | 1 green | 2 red pen), 24x24 path, stroke weight (× 1.5; the pen marks are bolder)] */
export type Glyph = readonly [name: string, family: 0 | 1 | 2, path: string, weight?: number];

export const GLYPHS: readonly Glyph[] = [
${rows.map(([name, fam, d, w]) => `  [${JSON.stringify(name)}, ${fam}, ${JSON.stringify(d)}${w ? `, ${w}` : ""}],`).join("\n")}
];
`;
writeFileSync(join(root, "components", "glyphs.ts"), file);
console.log(`components/glyphs.ts: ${LIST.length} glyphs from ${pkg.name} ${pkg.version}, Tabler's runner, and ${PEN.length} of the app's pen marks`);
