"use client";

/* Sticky header (Bearing's): the runner and the wordmark, four links, and the one CTA. The mobile menu is small on
   purpose, but it does what a keyboard or screen-reader user needs: labelled state, Escape closes it and returns
   focus, and it closes on navigation, on an outside tap, and if the window grows past the width where the burger
   exists at all. */

import { useEffect, useRef, useState } from "react";
import GetKiron from "./get-kiron";

// "/#…", not "#…": the same links work from the blog, the legal pages, a share page and the 404 (on the home page they
// only scroll). /blog/ keeps its trailing slash: that's its address.
const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog/", label: "Blog" },
  { href: "/support", label: "Support" },
];

export default function SiteNav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setStuck(scrollY > 12);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !burger.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        burger.current?.focus();
      }
    };
    // Rotating to landscape can cross the breakpoint with the panel still open, leaving it stuck behind a burger that
    // no longer renders.
    const desk = matchMedia("(min-width: 881px)");
    const onWide = (e: MediaQueryListEvent) => e.matches && setOpen(false);

    document.addEventListener("click", onDown);
    addEventListener("keydown", onKey);
    desk.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("click", onDown);
      removeEventListener("keydown", onKey);
      desk.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <nav className={`nav${stuck ? " stuck" : ""}`} aria-label="Main">
      <div className="wrap inner">
        <a className="brand" href="/#top" aria-label="Kiron, home">
          {/* the app's launch runner; in dark mode its dark-mode copy, which carries a faint light edge */}
          <picture>
            <source srcSet="/brand/runner-mark-dark.png" media="(prefers-color-scheme: dark)" />
            <img src="/brand/runner-mark.png" alt="" width={92} height={132} />
          </picture>
          <span>Kiron</span>
        </a>
        <div className="navlinks">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <GetKiron />
          <button
            ref={burger}
            className="burger"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobilemenu"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <div ref={menu} className={`mobilemenu${open ? " open" : ""}`} id="mobilemenu">
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/#faq" onClick={() => setOpen(false)}>
              Questions
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
