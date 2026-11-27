/* Where "Get Kiron" goes. The ONE place the store links live: the nav, the hero, both pricing plans, the download
   section and the share page all route through here (Bearing's components/store.ts).

   Both are live: the App Store listing (Apple's numeric id 6761926770) and Google Play (package com.kiron). A null URL
   would render a plain "coming soon" instead of a link, as Bearing's and Jist's sites did before launch. */

export const APP_STORE_URL: string | null = "https://apps.apple.com/us/app/kiron-build-train-track/id6761926770";
export const PLAY_STORE_URL: string | null = "https://play.google.com/store/apps/details?id=com.kiron";

export type Platform = "ios" | "android" | "other";

/** Best-effort platform read. Only ever used to CHOOSE a destination, never to hide content, so a wrong guess costs
 *  nothing but an extra tap. */
export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac, so touch points are the tell.
  const iPadAsMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPod|iPad/.test(ua) || iPadAsMac) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export function storeUrlFor(p: Platform): string | null {
  if (p === "ios") return APP_STORE_URL;
  if (p === "android") return PLAY_STORE_URL;
  return null;
}

export const anyStoreLive = APP_STORE_URL !== null || PLAY_STORE_URL !== null;
