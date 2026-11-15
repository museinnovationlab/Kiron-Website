"use client";

/* The one CTA (Bearing's GetBearing). On a phone it goes straight to that phone's store: one tap, no choosing. On a
   computer you can't know which phone someone owns, so it goes to the download section, which offers both.

   Platform is read AFTER mount, never during render: guessing on the server and correcting on the client is a
   hydration mismatch, and it would flash the wrong label. Until then it renders the computer's form, which is right
   for everyone, just not the shortest path for a phone. */

import { useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_STORE_URL, detectPlatform, storeUrlFor, type Platform } from "./store";

type Props = { variant?: "primary" | "ghost"; className?: string; children?: React.ReactNode };

export default function GetKiron({ variant = "primary", className = "", children }: Props) {
  const [platform, setPlatform] = useState<Platform>("other");
  useEffect(() => setPlatform(detectPlatform()), []);

  const cls = `btn${variant === "ghost" ? " btn-ghost" : ""}${className ? ` ${className}` : ""}`;
  const label = children ?? "Get Kiron";

  const direct = storeUrlFor(platform);
  if (direct) {
    return (
      <a className={cls} href={direct}>
        {label}
      </a>
    );
  }
  // "/#get", not "#get", so the same button works from the blog, the legal pages and a share page
  if (APP_STORE_URL || PLAY_STORE_URL) {
    return (
      <a className={cls} href="/#get">
        {label}
      </a>
    );
  }
  return (
    <span className={`${cls} btn-waiting`} aria-disabled="true">
      Coming soon
    </span>
  );
}

/** Both stores side by side: the download section, and the share page. Text buttons for now; Apple's and Google's
 *  official badges (with their sizing and clear-space rules) are on the to-do list in docs/PLACEHOLDERS.md. */
export function StoreLinks() {
  if (!APP_STORE_URL && !PLAY_STORE_URL) {
    return <p className="store-note">Kiron is on its way to the App Store and Google Play.</p>;
  }
  return (
    <div className="storelinks">
      {APP_STORE_URL ? (
        <a className="btn" href={APP_STORE_URL}>
          Download on the App Store
        </a>
      ) : (
        <span className="btn btn-waiting" aria-disabled="true">
          iPhone: coming soon
        </span>
      )}
      {PLAY_STORE_URL ? (
        <a className="btn btn-ghost" href={PLAY_STORE_URL}>
          Get it on Google Play
        </a>
      ) : (
        <span className="btn btn-ghost btn-waiting" aria-disabled="true">
          Android: coming soon
        </span>
      )}
    </div>
  );
}
