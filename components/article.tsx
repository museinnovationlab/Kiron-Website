import GlyphField from "./glyph-field";
import SiteNav from "./site-nav";
import SiteFooter from "./site-footer";
import PenTitle from "./pen-title";

/* A page of words (the legal pages, a blog post, support) on a sheet of the app's paper, between the nav and the
   footer. `html` is the old site's own markup for the page (content/legacy), ours to trust. */
export default function Article({
  crumbs,
  title,
  dateline,
  lede,
  html,
  children,
  after,
}: {
  crumbs?: React.ReactNode;
  title: string;
  dateline?: string;
  lede?: string;
  html?: string;
  children?: React.ReactNode;
  after?: React.ReactNode;
}) {
  return (
    <>
      <GlyphField className="field" theme="auto" cell={96} />
      <SiteNav />
      <main className="page">
        <div className="wrap">
          {crumbs && <p className="crumbs">{crumbs}</p>}
          <PenTitle as="h1">{title}</PenTitle>
          {dateline && <p className="dateline">{dateline}</p>}
          {lede && <p className="lede">{lede}</p>}
          {html !== undefined && (
            <article className="sheet prose" dangerouslySetInnerHTML={{ __html: html }} />
          )}
          {children}
          {after}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
