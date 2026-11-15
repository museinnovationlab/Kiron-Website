import type { Metadata } from "next";
import Image from "next/image";
import GlyphField from "@/components/glyph-field";
import SiteNav from "@/components/site-nav";
import ScrollStory from "@/components/scroll-story";
import Pricing from "@/components/pricing";
import GetKiron, { StoreLinks } from "@/components/get-kiron";
import SiteFooter from "@/components/site-footer";
import JsonLd from "@/components/json-ld";
import { CONNECTIONS, FAQ, FAQ_PLACEHOLDER, GET, HERO, PRICING, SITE, WHY } from "@/content/site";

/* The home page, in Bearing's order: the glyph field, the sticky nav, the hero with three phones, the dark "why"
   band, the scroll story, one band on where workouts go, pricing, the download section, the FAQ and the footer.
   Every word and screenshot comes from content/site.ts. */

export const metadata: Metadata = { alternates: { canonical: `${SITE.url}/` } };

const price = (s: string) => s.replace(/[^0-9.]/g, "");

/* The old home page's structured data, kept: the app, the company, and the FAQ. */
const STRUCTURED = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Kiron",
      description: SITE.description,
      url: SITE.url,
      applicationCategory: "HealthApplication",
      operatingSystem: ["iOS", "Android"],
      offers: PRICING.plans.map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: price(p.price),
        priceCurrency: "USD",
        description: p.feature ? "Full app access, best value" : "Full app access with 3-day free trial",
      })),
      featureList: [
        "AI workout plan parser",
        "Automatic workout scheduling",
        "Gym workout logger",
        "Exercise library with muscle targeting",
        "Strength progress and PR tracking",
        "Apple Health sync",
        "Google Health Connect sync",
      ],
      publisher: { "@type": "Organization", name: "Berkeley Labs LLC", url: SITE.url },
    },
    {
      "@type": "Organization",
      name: "Kiron",
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/logo.png` },
      contactPoint: { "@type": "ContactPoint", email: SITE.email, contactType: "customer support" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={STRUCTURED} />
      <GlyphField className="field" theme="light" cell={96} />
      <SiteNav />

      {/* ============ HERO ============ */}
      <header className="hero" id="top" data-placeholder={HERO.placeholder ? "copy" : undefined}>
        <div className="wrap">
          <p className="eyebrow">{HERO.eyebrow}</p>
          <h1>
            {HERO.heading[0]} <em>{HERO.heading[1]}</em> {HERO.heading[2]}
          </h1>
          <p className="lede">{HERO.lede}</p>
          <div className="hero-cta">
            <GetKiron />
            <a className="btn btn-ghost" href={HERO.secondary.href}>
              {HERO.secondary.label}
            </a>
          </div>
        </div>
        <div className="trio">
          {HERO.shots.map((shot, i) => (
            <div className="phone" key={shot.file} data-placeholder={shot.placeholder ? "screenshot" : undefined}>
              <Image src={`/shots/${shot.file}.png`} alt={shot.alt} width={640} height={1391} priority={i === 1} />
            </div>
          ))}
        </div>
      </header>

      {/* ============ WHY (dark) ============ */}
      <section className="band-dark" id="why" data-placeholder={WHY.placeholder ? "copy" : undefined}>
        <GlyphField className="band-field" theme="dark" cell={104} />
        <div className="wrap">
          <p className="eyebrow">{WHY.eyebrow}</p>
          <h2 style={{ maxWidth: "16ch" }}>{WHY.heading}</h2>
          <p className="lede" style={{ marginTop: 20 }}>
            {WHY.lede}
          </p>
          <div className="problem-grid">
            {WHY.cards.map((c, i) => (
              <div className="pcard" key={c.title}>
                <div className="n">{String(i + 1).padStart(2, "0")}</div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ScrollStory />

      {/* ============ WHERE WORKOUTS GO ============ */}
      <section className="band-green" id={CONNECTIONS.id} data-placeholder={CONNECTIONS.placeholder ? "copy" : undefined}>
        <div className="wrap sync">
          <div>
            <p className="eyebrow">{CONNECTIONS.eyebrow}</p>
            <h2 style={{ maxWidth: "15ch" }}>{CONNECTIONS.heading}</h2>
            <p className="lede" style={{ marginTop: 20 }}>
              {CONNECTIONS.lede}
            </p>
            <div className="sync-list" style={{ marginTop: 30 }}>
              {CONNECTIONS.cards.map((c) => (
                <div className="sync-card" key={c.title}>
                  <p className="eyebrow">{c.label}</p>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              className="phone"
              style={{ width: "min(76vw, 300px)" }}
              data-placeholder={CONNECTIONS.shot.placeholder ? "screenshot" : undefined}
            >
              <Image src={`/shots/${CONNECTIONS.shot.file}.png`} alt={CONNECTIONS.shot.alt} width={640} height={1391} />
            </div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* ============ GET KIRON ============ */}
      <section className="band-red" id="get" data-placeholder={GET.placeholder ? "copy" : undefined}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="eyebrow">{GET.eyebrow}</p>
          <h2 style={{ maxWidth: "18ch", margin: "0 auto" }}>{GET.heading}</h2>
          <p className="lede" style={{ margin: "18px auto 28px" }}>
            {GET.lede}
          </p>
          <StoreLinks />
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" data-placeholder={FAQ_PLACEHOLDER ? "copy" : undefined}>
        <div className="wrap">
          <p className="eyebrow" style={{ textAlign: "center" }}>
            FAQ
          </p>
          <h2 style={{ textAlign: "center" }}>Common questions.</h2>
          <div className="faq">
            {FAQ.map(([q, a], i) => (
              <details key={q} open={i === 0}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
