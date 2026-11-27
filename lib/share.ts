/* A shared workout or gym (/w/<id> and /g/<id>), read from Kiron's database the way the app reads it.

   Ported from the old site's open.html (the page's script) and netlify/edge-functions/share-preview.js (the link
   preview), which both read the share from Firestore's public REST API: no key, no sign-in. The rules allow a `get`
   of shares/<id> until the share expires (180 days), and refuse an expired share and a missing one alike
   (Kiron's firestore.rules). A share holds a workout's exercises, sets, reps, times and distances (never weights), or
   a gym's equipment. It's anyone's input, so it's only ever rendered as text (React escapes it), never as HTML.

   Pure apart from fetchShare(), so test/share.test.mjs can check it in Node. */

export type Kind = "workout" | "gym";

export type Exercise = {
  name: string;
  type: "strength" | "cardio" | "timed";
  sets: number | null;
  reps: number | null;
  seconds: number | null;
  miles: number | null;
};

export type Share =
  | { kind: "workout"; name: string; exercises: Exercise[] }
  | { kind: "gym"; name: string; equipment: string[] };

export type Lookup = { status: "found"; share: Share } | { status: "gone" } | { status: "failed" };

export const PROJECT = "kiron-5422e";
export const FIRESTORE = "https://firestore.googleapis.com/v1";
/** How long the server waits for Firestore before serving the page without the share (the edge function's 1.5 s). */
export const WAIT_MS = 1500;
/** The app's share ids: Firestore's auto ids, 20 letters and digits. */
export const SHARE_ID = /^[A-Za-z0-9]{20}$/;

export const EQUIPMENT: Record<string, string> = {
  full_gym: "Full gym",
  barbell: "Barbell",
  dumbbells: "Dumbbells",
  machines: "Machines",
  kettlebells: "Kettlebells",
  bands: "Resistance bands",
  bodyweight_only: "Bodyweight only",
  cardio_machines: "Cardio machines",
};

export const kindFor = (letter: string): Kind => (letter === "g" ? "gym" : "workout");
export const shareUrl = (api: string, id: string) =>
  `${api}/projects/${PROJECT}/databases/(default)/documents/shares/${id}`;

/** Firestore's typed values ({ stringValue: "…" }) as plain ones. */
export function value(v: unknown): unknown {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, any>;
  if ("stringValue" in o) return o.stringValue;
  if ("integerValue" in o) return Number(o.integerValue);
  if ("doubleValue" in o) return Number(o.doubleValue);
  if ("booleanValue" in o) return o.booleanValue;
  if ("arrayValue" in o) return (o.arrayValue?.values || []).map(value);
  if ("mapValue" in o) return fields(o.mapValue?.fields);
  return null;
}

export function fields(f: unknown): Record<string, any> {
  const out: Record<string, any> = {};
  if (!f || typeof f !== "object") return out;
  for (const key of Object.keys(f)) out[key] = value((f as Record<string, unknown>)[key]);
  return out;
}

const text = (s: unknown, max: number) => (typeof s === "string" && s.trim() ? s.trim().slice(0, max) : null);
const count = (n: unknown) => (typeof n === "number" && isFinite(n) && n > 0 ? n : null);

/** A share document as the app would accept it, or null: the same checks the app makes (src/features/share/share.ts). */
export function readShare(doc: unknown): Share | null {
  const raw = fields((doc as { fields?: unknown } | null)?.fields);
  const name = text(raw.name, 80);
  if (raw.v !== 1 || !name) return null;
  if (raw.kind === "workout" && Array.isArray(raw.exercises)) {
    const exercises = raw.exercises
      .slice(0, 40)
      .map((e: any): Exercise | null =>
        e && text(e.name, 80) && ["strength", "cardio", "timed"].includes(e.type)
          ? {
              name: text(e.name, 80)!,
              type: e.type,
              sets: count(e.sets),
              reps: count(e.reps),
              seconds: count(e.seconds),
              miles: count(e.miles),
            }
          : null,
      )
      .filter((e: Exercise | null): e is Exercise => e !== null);
    return exercises.length ? { kind: "workout", name, exercises } : null;
  }
  if (raw.kind === "gym" && Array.isArray(raw.equipment)) {
    return { kind: "gym", name, equipment: raw.equipment.filter((e: unknown) => typeof e === "string" && EQUIPMENT[e]) };
  }
  return null;
}

/** "A, B and C", then "and 3 more" past three. */
export function listed(names: string[]): string {
  if (names.length > 3) return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** The link preview's title and description (the edge function's previewFor). */
export function previewFor(share: Share): { title: string; description: string } {
  if (share.kind === "workout") {
    const names = share.exercises.map((e) => e.name);
    const n = `${names.length} ${names.length === 1 ? "exercise" : "exercises"}`;
    return { title: share.name, description: `${n}: ${listed(names)}. Shared from Kiron.` };
  }
  const equipment = share.equipment.map((e) => EQUIPMENT[e]!);
  return {
    title: share.name,
    description: equipment.length ? `Gym setup: ${listed(equipment)}. Shared from Kiron.` : "A gym setup, shared from Kiron.",
  };
}

/** Miles where people run in miles (the US, the UK, Liberia, Myanmar), kilometres everywhere else. Takes a language
 *  tag ("en-GB") or a whole Accept-Language header ("en-GB,en;q=0.9"), whose first tag is the browser's own. */
export function usesMiles(locale: string | null | undefined): boolean {
  const first = (locale || "").split(",")[0]!.split(";")[0]!.trim() || "en-US";
  return /-(US|GB|LR|MM)$/i.test(first);
}

const round1 = (n: number) => Math.round(n * 10) / 10;
function minutes(seconds: number): string {
  const total = Math.round(seconds / 60);
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

/** "4 × 5", "20 min, 2 mi", "3 × 45 s": as the app's preview says it (exerciseLine). */
export function exerciseLine(e: Exercise, miles: boolean): string {
  if (e.type === "strength") {
    if (e.sets && e.reps) return `${e.sets} × ${e.reps}`;
    return e.sets ? `${e.sets} sets` : "";
  }
  const time = e.seconds ? (e.seconds >= 120 ? minutes(e.seconds) : `${e.seconds} s`) : null;
  const distance = e.miles ? (miles ? `${round1(e.miles)} mi` : `${round1(e.miles * 1.60934)} km`) : null;
  const both = [time, distance].filter(Boolean).join(", ");
  return e.type === "timed" && e.sets && both ? `${e.sets} × ${both}` : both;
}

/**
 * Reads a share. "gone" is what the rules say for an expired, missing or malformed share (and a share of the other
 * kind); "failed" is anything else going wrong (slow, offline, Firestore down), in which case the page still serves,
 * and the browser tries again.
 */
export async function fetchShare(
  id: string,
  kind: Kind,
  { api = FIRESTORE, timeoutMs = WAIT_MS }: { api?: string; timeoutMs?: number } = {},
): Promise<Lookup> {
  if (!SHARE_ID.test(id)) return { status: "gone" };
  try {
    const response = await fetch(shareUrl(api, id), { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
    if (response.status === 403 || response.status === 404) return { status: "gone" };
    if (!response.ok) return { status: "failed" };
    const share = readShare(await response.json());
    return share && share.kind === kind ? { status: "found", share } : { status: "gone" };
  } catch {
    return { status: "failed" };
  }
}
