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

const file = `/* Line glyphs on a 24×24 field for the page's ground (glyph-field.tsx, after Bearing's site). Their subjects are what
   Kiron touches: the kit (barbells, a bike, a stopwatch), the plan (a calendar, a clipboard, a photo, a PDF, pasted
   text), what training leaves behind (ticks, records, a streak) and rest (sleep, recovery), so a dense field never
   reads as one motif repeated.

   GENERATED by scripts/build-glyphs.mjs from ${pkg.name} ${pkg.version}; edit the list there and run it again.
   Every shape is Lucide's (lucide.dev, ISC; Feather's successor, and the app draws Feather's icons) with each circle,
   rect, line and polyline written out as path commands, so one Path2D draws a glyph. \`runner\` is Tabler Icons' \`run\`
   (MIT), the figure Bearing's site uses, for Kiron's runner mark. Stroked, never filled. Licences: LICENSES.md.

   \`fam\` is the colour a glyph warms toward under the pointer:
     0 = navy (the kit, the plan, time)   1 = green (done, rested, recovered)   2 = the red pen (records, the runner)
   The red pen is the app's own mark (ticks, the PR stamp, the tally streak), so it's kept sparse. */

/** [name, colour family (0 navy | 1 green | 2 red pen), 24x24 path] */
export type Glyph = readonly [name: string, family: 0 | 1 | 2, path: string];

export const GLYPHS: readonly Glyph[] = [
${rows.map(([name, fam, d]) => `  [${JSON.stringify(name)}, ${fam}, ${JSON.stringify(d)}],`).join("\n")}
];
`;
writeFileSync(join(root, "components", "glyphs.ts"), file);
console.log(`components/glyphs.ts: ${LIST.length} glyphs from ${pkg.name} ${pkg.version}, and Tabler's runner`);
