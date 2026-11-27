import { PLACEHOLDER_COUNT, PLACEHOLDER_NOTE, PLACEHOLDERS } from "@/content/site";

/* A bar above the nav on preview builds while the home page still has placeholder screenshots or words, so nobody
   reviewing a preview mistakes them for final. It names only what's left (screens, words, or both). Never on
   production (VERCEL_ENV is "production" there), whatever is left; the check script counts what's left instead
   (data-placeholder on the page). */
export default function PreviewBar() {
  if (process.env.VERCEL_ENV === "production" || PLACEHOLDER_COUNT === 0) return null;
  const { screens, words } = PLACEHOLDERS;
  const long =
    screens && words
      ? `${PLACEHOLDER_NOTE.screens}, and ${PLACEHOLDER_NOTE.words}. Both are placeholders.`
      : screens
        ? `${PLACEHOLDER_NOTE.screens}: placeholders until the real screenshots are in.`
        : `Some words are placeholders.`;
  const short = screens && words ? "Placeholder screens and words." : screens ? "Placeholder screens." : "Placeholder words.";
  return (
    <div className="preview-bar" role="note">
      <b>Preview</b>
      <span className="long">{long}</span>
      <span className="short">{short}</span>
    </div>
  );
}
