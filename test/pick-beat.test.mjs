/* The scroll story's one real decision: which beat owns the middle of the screen (components/pick-beat.ts, copied
   from Bearing's site with its tests). Kiron's story has seven beats. */
import { strict as assert } from "node:assert";
import test from "node:test";
import { pickBeat } from "../components/pick-beat.ts";

const VH = 900;
const BEATS = 7;
// Seven beats stacked down a long page, each 550 tall: the real layout's shape.
const at = (scrollY) =>
  Array.from({ length: BEATS }, (_, i) => ({ top: 4000 + i * 550 - scrollY, bottom: 4000 + i * 550 + 550 - scrollY }));

test("each beat is selected when it is centred", () => {
  for (let i = 0; i < BEATS; i++) {
    const centred = 4000 + i * 550 + 275 - VH / 2;
    assert.equal(pickBeat(at(centred), VH), i, `beat ${i} should win when centred`);
  }
});

test("scrolling up selects beats in reverse, never skipping", () => {
  const seen = [];
  for (let i = BEATS - 1; i >= 0; i--) seen.push(pickBeat(at(4000 + i * 550 + 275 - VH / 2), VH));
  assert.deepEqual(seen, [6, 5, 4, 3, 2, 1, 0]);
});

test("a zero-height viewport selects nothing rather than garbage", () => {
  assert.equal(pickBeat(at(4500), 0), -1);
});

test("above and below the story nothing is in view", () => {
  assert.equal(pickBeat(at(0), VH), -1); // far above
  assert.equal(pickBeat(at(20000), VH), -1); // far below
});

test("ties resolve the same way every time, so the swap never oscillates", () => {
  // a scroll position where two adjacent beats are exactly equidistant
  const boundary = 4000 + 550 - VH / 2;
  assert.equal(pickBeat(at(boundary), VH), pickBeat(at(boundary), VH));
});

test("missing refs are ignored, not treated as position 0", () => {
  const spans = [{ top: Infinity, bottom: -Infinity }, { top: 100, bottom: 700 }];
  assert.equal(pickBeat(spans, VH), 1);
});
