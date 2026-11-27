"use client";

/* Draws the pen marks in as they come into view, the way the app draws a set's tick in when it's logged (PenTick's
   `animate`, the Stamp landing). Mounted once, in the layout.

   Anything marked data-pen that is BELOW the screen when the page loads gets data-ink="wait" (its strokes hidden, see
   globals.css), and loses it when it scrolls into view, so the strokes draw. Anything already on screen stays drawn:
   no flash, and without JavaScript every mark is simply there. data-ink is an attribute React never renders, so a
   re-render can't put it back (Jist's lesson about classes set by hand). Nothing moves when the visitor asks for less
   motion. */

import { useEffect } from "react";

export default function PenInk() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.removeAttribute("data-ink");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.5 },
    );
    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll("[data-pen]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.getBoundingClientRect().top < innerHeight) return; // on screen, or above it: leave it drawn
        el.setAttribute("data-ink", "wait");
        io.observe(el);
      });
    };
    scan();
    // marks that appear later (a title's line once measured, a page section rendered on the client)
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
