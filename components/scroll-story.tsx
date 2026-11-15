"use client";

/* The scroll theatre (Bearing's ScrollStory). On a computer the phone sticks in its own column; on a phone or a small
   tablet (900 px and narrower) it pins to the bottom of the screen, just under half its height, with the words
   scrolling above it, and only while the story is on screen. Either way the phone shows whichever beat owns the
   middle of the viewport, cross-fading between screens.

   Which screen shows, and whether the phone is pinned, are React state, as Jist's site has them: Bearing's set classes
   by hand, and Jist found a re-render puts hand-set classes back to the first screen.

   sync() is the single source of truth and is safe to call at any time; scroll, resize and IntersectionObserver are
   just triggers for it. It also runs once on mount, so a link to #recovery opens on the right screen instead of
   waiting for the first scroll. */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { pickBeat, type Span } from "./pick-beat";
import { BEATS, STORY } from "@/content/site";

export default function ScrollStory() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const beatEls = useRef<(HTMLDivElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [pinned, setPinned] = useState(false);

  const sync = useCallback(() => {
    const spans: Span[] = beatEls.current.map((el) => {
      if (!el) return { top: Infinity, bottom: -Infinity };
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    });
    const best = pickBeat(spans, innerHeight);
    if (best >= 0) setCurrent(best);

    // On a phone the stage is fixed to the bottom of the screen, so it shows only while the story is being read,
    // or a phone would hover over the hero and the pricing too. A computer keeps its sticky column.
    const s = stage.current;
    const sec = section.current;
    if (!s || !sec) return;
    if (!matchMedia("(max-width: 900px)").matches) {
      setPinned(false);
      return;
    }
    // Pinned only while nothing but the story is behind the phone and the scrim above it, measured from the stage
    // itself so it follows the phone's size (Bearing 775a414): not over the dark band above the story, and not under
    // the section after it.
    const r = sec.getBoundingClientRect();
    const phoneTop = innerHeight - s.offsetHeight;
    const scrim = -parseFloat(getComputedStyle(s, "::before").top) || 0;
    setPinned(r.top < phoneTop - scrim && r.bottom > phoneTop);
  }, []);

  useEffect(() => {
    let queued = false;
    const request = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        sync();
      });
    };

    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request);
    // a beat or the section crossing into view (a link to #how, a jump) syncs too, not only a scroll
    const obs = new IntersectionObserver(request, { threshold: [0, 0.5, 1] });
    beatEls.current.forEach((el) => el && obs.observe(el));
    if (section.current) obs.observe(section.current);
    sync();

    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
      obs.disconnect();
    };
  }, [sync]);

  return (
    <section id={STORY.id} ref={section} aria-labelledby="story-title">
      <div className="wrap story-head">
        <p className="eyebrow">{STORY.eyebrow}</p>
        <h2 id="story-title" style={{ maxWidth: "14ch" }}>
          {STORY.heading}
        </h2>
        <p className="lede" style={{ marginTop: 18 }}>
          {STORY.lede}
        </p>
      </div>
      <div className="wrap story-inner">
        <div className="story-copy">
          {BEATS.map((b, i) => (
            <div
              className="beat"
              key={b.shot.file + i}
              id={b.id}
              data-placeholder={b.placeholder ? "copy" : undefined}
              ref={(el) => {
                beatEls.current[i] = el;
              }}
            >
              <p className="step">{`${String(i + 1).padStart(2, "0")} / ${String(BEATS.length).padStart(2, "0")}`}</p>
              <p className="eyebrow">{b.eyebrow}</p>
              <h2>{b.heading}</h2>
              {b.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {b.ticks && (
                <ul>
                  {b.ticks.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              {b.note && (
                <div className="quote">
                  <p>{b.note[0]}</p>
                  <div className="who">{b.note[1]}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`story-stage${pinned ? " pinned" : ""}`} ref={stage}>
          <div className="stage-phone">
            {BEATS.map((b, i) => (
              <div
                className={`phone${i === current ? " on" : ""}`}
                key={b.shot.file + i}
                aria-hidden={i !== current}
                data-placeholder={b.shot.placeholder ? "screenshot" : undefined}
              >
                <Image
                  src={`/shots/${b.shot.file}.png`}
                  alt={b.shot.alt}
                  width={640}
                  height={1391}
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
