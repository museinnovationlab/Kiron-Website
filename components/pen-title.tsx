"use client";

/* A title in the app's display type with its red pencil line under it: Kiron's SectionHeader with `underline`
   (src/components/ui/SectionHeader.tsx, PencilUnderline in HandDrawn.tsx, underlineWidth in underline.ts).

   As in the app, the line is as long as the title's widest line, measured once it's laid out (and again when it wraps
   differently, or when League Gothic arrives and the words change width), never shorter than 48 px. Until then it
   draws nothing but keeps its height, so nothing below it moves. */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { UNDERLINE } from "./marks";

/** The shortest the line gets, so a short title's line still reads as a pen stroke (MIN_UNDERLINE_WIDTH). */
const MIN_WIDTH = 48;

export default function PenTitle({
  as: Tag = "h2",
  children,
  id,
  style,
  align = "start",
}: {
  as?: "h1" | "h2";
  children: ReactNode;
  id?: string;
  style?: CSSProperties;
  align?: "start" | "center";
}) {
  const words = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = words.current;
    if (!el) return;
    const measure = () => {
      // one rect per line of the title; the line under it is as wide as the widest
      const widest = Math.max(0, ...Array.from(el.getClientRects(), (r) => r.width));
      setWidth(widest > 0 ? Math.max(MIN_WIDTH, Math.ceil(widest)) : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.parentElement ?? el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`pen-title${align === "center" ? " pen-center" : ""}`}>
      <Tag id={id} style={style}>
        <span ref={words}>{children}</span>
      </Tag>
      <svg
        className="pen-underline"
        data-pen=""
        style={{ width: width ?? 0 }}
        viewBox="0 0 236 12"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {width ? <path className="pen-stroke" pathLength={100} d={UNDERLINE} strokeWidth={3} /> : null}
      </svg>
    </div>
  );
}
