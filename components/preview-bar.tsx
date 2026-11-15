import { PLACEHOLDER_COUNT, PLACEHOLDER_SOURCE } from "@/content/site";

/* A bar above the nav on preview builds while the home page still has placeholder screenshots or words, so nobody
   reviewing a preview mistakes them for final. Never on production (VERCEL_ENV is "production" there), whatever is
   left; the check script counts what's left instead (data-placeholder on the page). */
export default function PreviewBar() {
  if (process.env.VERCEL_ENV === "production" || PLACEHOLDER_COUNT === 0) return null;
  return (
    <div className="preview-bar" role="note">
      <b>Preview</b>
      <span className="long">{PLACEHOLDER_SOURCE} Both are placeholders.</span>
      <span className="short">Placeholder screens and words.</span>
    </div>
  );
}
