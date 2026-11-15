/* The site's colours are the app's (docs/DESIGN.md). content/app-palette.json is a copy of the app's palette.js
   (release/1.2.0); this checks every app token is in app/globals.css under its site name, light in :root and dark in
   the prefers-color-scheme block, so the two can't drift apart unnoticed. When the app's palette changes, update the
   JSON from palette.js and the variables in globals.css together. */
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("app/globals.css", "utf8");
const palette = JSON.parse(readFileSync("content/app-palette.json", "utf8"));

// app token name → CSS variable (lineStrong → --line-strong)
const variable = (name) => `--${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

/** The variables declared in the first `:root{…}` block that follows `marker` (or the first one of all). */
function block(marker) {
  const from = marker ? css.indexOf(marker) : 0;
  assert.ok(from >= 0, `no ${marker} in globals.css`);
  const start = css.indexOf(":root{", from);
  const end = css.indexOf("}", start);
  return Object.fromEntries([...css.slice(start, end).matchAll(/(--[a-z-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]));
}

const light = block(null);
const dark = block("@media (prefers-color-scheme: dark)");

test("every app colour is a site variable, light", () => {
  for (const [name, hex] of Object.entries(palette.light)) {
    assert.equal(light[variable(name)]?.toUpperCase(), hex.toUpperCase(), `${name} (${variable(name)})`);
  }
});

test("every app colour is a site variable, dark", () => {
  for (const [name, hex] of Object.entries(palette.dark)) {
    assert.equal(dark[variable(name)]?.toUpperCase(), hex.toUpperCase(), `${name} (${variable(name)}) in dark`);
  }
});

test("nothing below the tokens names a colour the palette doesn't have", () => {
  // after the two token blocks, every hex colour written out must be one of the app's (rules use the variables)
  const rules = css.slice(css.indexOf("*{box-sizing"));
  const known = new Set([...Object.values(palette.light), ...Object.values(palette.dark)].map((h) => h.toUpperCase()));
  const strays = [...rules.matchAll(/#[0-9A-Fa-f]{6}\b/g)].map(([h]) => h.toUpperCase()).filter((h) => !known.has(h));
  assert.deepEqual(strays, [], `colours not in the app's palette: ${strays.join(", ")}`);
});
