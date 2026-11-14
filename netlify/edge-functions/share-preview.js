/**
 * A share link's preview in Messages, WhatsApp or Slack: the shared workout's (or gym's) own name
 * and what's in it, instead of "Shared from Kiron" on every link. Link previews don't run the
 * page's script, so this puts the words in open.html's meta tags as the page goes out.
 *
 * It reads the share the way the page does, from Firestore's public API (a share is readable by
 * anyone with its link until it expires; firestore.rules). Anything going wrong, such as a slow
 * answer, an expired share or a share that isn't valid, serves the page exactly as it is.
 */

const SHARE_PATH = /^\/(w|g)\/([A-Za-z0-9]{20})\/?$/
const API =
  "https://firestore.googleapis.com/v1/projects/kiron-5422e/databases/(default)/documents/shares/"
const WAIT_MS = 1500

const EQUIPMENT = {
  full_gym: "Full gym",
  barbell: "Barbell",
  dumbbells: "Dumbbells",
  machines: "Machines",
  kettlebells: "Kettlebells",
  bands: "Resistance bands",
  bodyweight_only: "Bodyweight only",
  cardio_machines: "Cardio machines",
}

/** Firestore's typed values ({ stringValue: "…" }) as plain ones. */
function value(v) {
  if (!v || typeof v !== "object") return null
  if ("stringValue" in v) return v.stringValue
  if ("integerValue" in v) return Number(v.integerValue)
  if ("doubleValue" in v) return Number(v.doubleValue)
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(value)
  if ("mapValue" in v) return fields(v.mapValue.fields)
  return null
}

function fields(f) {
  const out = {}
  for (const key of Object.keys(f || {})) out[key] = value(f[key])
  return out
}

const text = (s, max) => (typeof s === "string" && s.trim() ? s.trim().slice(0, max) : null)

/** "A, B and C", then "and 3 more" past three. */
function listed(names) {
  if (names.length > 3) return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`
  if (names.length <= 1) return names.join("")
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

/** The preview's title and description for a share document, or null for anything else. */
export function previewFor(doc, kind) {
  const share = fields(doc && doc.fields)
  const name = text(share.name, 80)
  if (share.v !== 1 || share.kind !== kind || !name) return null
  if (kind === "workout") {
    const exercises = (Array.isArray(share.exercises) ? share.exercises : [])
      .map((exercise) => text(exercise && exercise.name, 80))
      .filter(Boolean)
    if (exercises.length === 0) return null
    const count = `${exercises.length} ${exercises.length === 1 ? "exercise" : "exercises"}`
    return { title: name, description: `${count}: ${listed(exercises)}. Shared from Kiron.` }
  }
  const equipment = (Array.isArray(share.equipment) ? share.equipment : [])
    .map((choice) => EQUIPMENT[choice])
    .filter(Boolean)
  return {
    title: name,
    description: equipment.length
      ? `Gym setup: ${listed(equipment)}. Shared from Kiron.`
      : "A gym setup, shared from Kiron.",
  }
}

const escape = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** open.html with the preview's words in its title and Open Graph tags. */
export function withPreview(html, { title, description }) {
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)} · Shared from Kiron</title>`)
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${escape(title)}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${escape(description)}" />`,
    )
}

export default async function sharePreview(request, context) {
  const page = await context.next()
  const match = new URL(request.url).pathname.match(SHARE_PATH)
  if (!match || page.status !== 200) return page
  try {
    const response = await fetch(API + match[2], { signal: AbortSignal.timeout(WAIT_MS) })
    if (!response.ok) return page
    const preview = previewFor(await response.json(), match[1] === "w" ? "workout" : "gym")
    if (!preview) return page
    const headers = new Headers(page.headers)
    headers.delete("content-length")
    return new Response(withPreview(await page.text(), preview), { status: 200, headers })
  } catch {
    return page
  }
}

// After _redirects has turned /w/<id> into open.html, which context.next() returns. A failure in
// here serves the page without the function.
export const config = { path: ["/w/*", "/g/*"], onError: "bypass" }
