/* Which beat owns the middle of the screen.

   Pulled out of the scroll-story component as a pure function so it can be
   tested without a browser. The DOM wiring around it (listeners, rAF
   coalescing, class toggling) is thin enough to read; this is the part with
   actual logic in it, and it is the part that decides which screen you see. */

export type Span = { top: number; bottom: number };

/**
 * Returns the index of the beat whose midpoint is closest to the middle of the
 * viewport, considering only beats that actually intersect it. Returns -1 when
 * nothing qualifies — including when `viewportHeight` is 0, which a hidden or
 * backgrounded tab reports and which would otherwise reject every beat and
 * silently leave the stage on whatever it last showed.
 */
export function pickBeat(spans: readonly Span[], viewportHeight: number): number {
  if (!viewportHeight) return -1;
  const mid = viewportHeight / 2;
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < spans.length; i++) {
    const { top, bottom } = spans[i]!;
    if (bottom < 0 || top > viewportHeight) continue;
    const d = Math.abs((top + bottom) / 2 - mid);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}
