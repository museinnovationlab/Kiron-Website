"use client";

/* A field of training glyphs as the page's ground: Bearing's GlyphField (Bearing-Website/components/glyph-field.tsx)
   in Kiron's colours, as Jist's site has it in Jist's.

   Glyphs hold a jittered grid (so it never reads as a repeating tile), part away from the pointer, grow a little and
   warm toward their own colour family as it approaches. Stable structure, local reaction: alive under the cursor,
   completely calm when it is still.

   Canvas 2D + Path2D rather than DOM nodes: a few hundred stroked paths a frame is cheap, where the same number of
   elements each taking a transform every frame is not.

   Two themes, because the page has a dark band and a dark footer: `light` strokes ink on paper, `dark` strokes chalk
   on ink. */

import { useEffect, useRef } from "react";
import { GLYPHS } from "./glyphs";

// navy, green, the red pen (the app's navy #33495A, success #466A52, accent #A8463A): the colour a glyph warms toward
// under the pointer. On the dark bands, the app's dark-mode versions of the same three (#C3D1DB, #92CCA2, #F29B88).
type RGB = readonly [number, number, number];
const FAMILY: Record<"light" | "dark", readonly RGB[]> = {
  light: [
    [51, 73, 90],
    [70, 106, 82],
    [168, 70, 58],
  ],
  dark: [
    [195, 209, 219],
    [146, 204, 162],
    [242, 155, 136],
  ],
};

type Inst = {
  i: number;
  fam: number;
  x: number;
  y: number;
  k: number;
  rot: number;
  ph: number;
  ox: number;
  oy: number;
  glow: number;
};

export default function GlyphField({
  className = "",
  theme = "light",
  cell = 96,
}: {
  className?: string;
  theme?: "light" | "dark";
  cell?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dark = theme === "dark";
    // Rest state: barely there. The field is ground, not content. Ink is the app's #23201C; chalk is its #F2EDE6.
    const restRGB: RGB = dark ? [242, 237, 230] : [35, 32, 28];
    const restA = dark ? 0.09 : 0.085;
    const peakA = dark ? 0.62 : 0.55;
    const families = FAMILY[dark ? "dark" : "light"];

    const paths = GLYPHS.map((g) => new Path2D(g[2]));
    const fams = GLYPHS.map((g) => g[1]);
    const N = paths.length;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* Touch devices have no cursor for the glyphs to react to. Repainting a full-viewport canvas every frame there
       costs battery and fights the compositor during scroll, so on touch we draw once and stop. Standing still it
       looks identical. */
    const still = matchMedia("(hover: none)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let inst: Inst[] = [];
    const ptr = { x: -9999, y: -9999 };

    const layout = () => {
      inst = [];
      const cols = Math.ceil(w / cell) + 1;
      const rows = Math.ceil(h / cell) + 1;
      // Track the last glyph used per column so neighbours never repeat.
      const above: number[] = new Array(cols).fill(-1);
      let left = -1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let pick = 0;
          for (let t = 0; t < 12; t++) {
            pick = Math.floor(Math.random() * N);
            if (pick !== left && pick !== above[c]) break;
          }
          left = pick;
          above[c] = pick;
          inst.push({
            i: pick,
            fam: fams[pick] ?? 0,
            x: c * cell + (Math.random() - 0.5) * cell * 0.55,
            y: r * cell + (Math.random() - 0.5) * cell * 0.55,
            k: (19 + Math.random() * 14) / 24,
            rot: (Math.random() - 0.5) * 0.5,
            ph: Math.random() * Math.PI * 2,
            ox: 0,
            oy: 0,
            glow: 0,
          });
        }
      }
    };

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      layout();
    };

    resize();

    /* Only a WIDTH change rebuilds. Mobile browsers fire resize on every frame of the toolbar hiding and showing, and
       rebuilding a full-viewport bitmap that often stalled the main thread on Bearing's site. Letting the bitmap
       stretch over a few pixels of height costs nothing anyone can see. */
    let lastW = canvas.clientWidth;
    const onResize = () => {
      if (canvas.clientWidth === lastW) return;
      lastW = canvas.clientWidth;
      resize();
      if (still) requestAnimationFrame(draw);
    };

    /* A canvas can mount at zero size (a backgrounded tab, a layout that hasn't settled). The window's resize event
       never fires for those, so without this the field could stay blank for good. */
    const ro =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            if (!canvas.clientWidth || !canvas.clientHeight) return;
            if (canvas.clientWidth === lastW && canvas.width) return;
            lastW = canvas.clientWidth;
            resize();
            if (still) requestAnimationFrame(draw);
          })
        : null;
    ro?.observe(canvas);

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
    };
    const leave = () => {
      ptr.x = -9999;
      ptr.y = -9999;
    };

    addEventListener("resize", onResize);
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
    });
    io.observe(canvas);

    const R = 190; // reaction radius
    const PUSH = 54; // how far a glyph parts at the centre
    const start = performance.now();
    let raf = 0;

    function draw(now: number) {
      if (!still) raf = requestAnimationFrame(draw);
      if ((!visible && !still) || !w || !h || !ctx) return;
      const t = (now - start) / 1000;

      ctx.clearRect(0, 0, w, h);

      for (const s of inst) {
        const dx = s.x - ptr.x;
        const dy = s.y - ptr.y;
        const d = Math.hypot(dx, dy);

        let tx = 0;
        let ty = 0;
        let tg = 0;
        if (d < R) {
          const f = 1 - d / R;
          const p = f * f * PUSH;
          const inv = 1 / (d || 1);
          tx = dx * inv * p;
          ty = dy * inv * p;
          tg = f;
        }

        // Ease toward the target so motion trails the cursor instead of snapping to it: most of what makes it feel
        // physical.
        s.ox += (tx - s.ox) * 0.13;
        s.oy += (ty - s.oy) * 0.13;
        s.glow += (tg - s.glow) * 0.11;

        const bob = reduced || still ? 0 : Math.sin(t * 0.45 + s.ph) * 1.5;
        const g = s.glow;
        const fam = families[s.fam] ?? families[0]!;

        const a = restA + g * (peakA - restA);
        const cr = Math.round(restRGB[0] + (fam[0] - restRGB[0]) * g);
        const cg = Math.round(restRGB[1] + (fam[1] - restRGB[1]) * g);
        const cb = Math.round(restRGB[2] + (fam[2] - restRGB[2]) * g);

        ctx.save();
        ctx.translate(s.x + s.ox, s.y + s.oy + bob);
        ctx.rotate(s.rot + g * 0.14);
        const k = s.k * (1 + g * 0.2);
        ctx.scale(k, k);
        ctx.translate(-12, -12);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
        ctx.lineWidth = 1.5;
        ctx.stroke(paths[s.i]!);
        ctx.restore();
      }
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro?.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [theme, cell]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
