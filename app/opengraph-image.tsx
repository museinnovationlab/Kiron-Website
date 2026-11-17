import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { HERO } from "@/content/site";

/* The link preview (Open Graph, 1200×630), drawn at build time as Jist's is: the runner and the wordmark, the hero's
   headline with its handwritten second line in the red pen, and the hero's three words, on the app's paper, so the
   card always says what the page says. The faces are copies of the app's own (assets/fonts, from its
   @expo-google-fonts packages, OFL licences beside them), since this renderer can't read next/font's files. */
export const alt = `Kiron: ${HERO.heading} ${HERO.hand}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F2EDE6";
const INK = "#23201C";
const RED = "#A8463A";
const MUTED = "#655C54";
// a longer headline gets smaller type, so it stays within three lines above the handwriting and the tagline
const HEADLINE_SIZE = HERO.heading.length > 28 ? 96 : 112;

export default async function OpengraphImage() {
  // literal paths, so the build traces these four files and not the whole project
  const [display, mono, hand, runner] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/LeagueGothic_400Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/IBMPlexMono_500Medium.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Caveat_700Bold.ttf")),
    readFile(join(process.cwd(), "assets/brand/runner.png")),
  ]);
  const runnerSrc = `data:image/png;base64,${runner.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, padding: "64px 72px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontFamily: "League Gothic", fontSize: 64, letterSpacing: 4, color: INK }}>KIRON</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* balanced lines, as the page's headline is ("EVERY HERO / HAD A TRAINER.", not "… HAD A / TRAINER.") */}
            <div style={{ fontFamily: "League Gothic", fontSize: HEADLINE_SIZE, lineHeight: 0.95, color: INK, display: "flex", maxWidth: 760, textWrap: "balance" }}>
              {HERO.heading.toUpperCase()}
            </div>
            <div style={{ fontFamily: "Caveat", fontSize: 78, lineHeight: 1, color: RED, marginTop: 10, transform: "rotate(-2deg)", transformOrigin: "left center" }}>
              {HERO.hand}
            </div>
            <div style={{ marginTop: 30, fontFamily: "Plex Mono", fontSize: 26, letterSpacing: 5, color: MUTED }}>
              {HERO.eyebrow.toUpperCase()}
            </div>
          </div>
        </div>
        <img src={runnerSrc} width={314} height={452} style={{ alignSelf: "center", marginLeft: 24 }} alt="" />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "League Gothic", data: display, weight: 400, style: "normal" },
        { name: "Plex Mono", data: mono, weight: 500, style: "normal" },
        { name: "Caveat", data: hand, weight: 700, style: "normal" },
      ],
    },
  );
}
