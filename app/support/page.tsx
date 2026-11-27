import type { Metadata } from "next";
import Article from "@/components/article";
import { SITE } from "@/content/site";
import { pageMeta } from "@/lib/meta";

/* trykiron.com/support, and /support.html (a rewrite in next.config.mjs): the support address in App Store Connect and
   on Strava's listing of Kiron.

   The old page was a Netlify form, which only works on Netlify, so it's an email button now. The form's five topics
   become one-tap emails with the topic as the subject, so messages still arrive sorted. The address is also shown as
   text, for anyone whose browser has no mail app set up. */

export const metadata: Metadata = pageMeta({
  title: "Support — Kiron",
  description: "Get help with Kiron: email help@trykiron.com about your account, your subscription, a program or a bug.",
  canonical: `${SITE.url}/support.html`,
});

const mailto = (subject: string) => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;

// the old form's topics, in its order
const TOPICS = ["Bug report", "Feature request", "Billing / subscription", "Account issue", "General question"];

export default function Support() {
  return (
    <Article title="Get in touch" lede="We usually respond within one business day.">
      <div className="contact">
        <div className="sheet">
          <h2>Email us</h2>
          <p>
            Write to <span className="address">{SITE.email}</span> from the email address you use for Kiron, and tell us
            what happened and on which phone.
          </p>
          <a className="btn" href={mailto("Kiron support")} style={{ alignSelf: "flex-start" }}>
            Email {SITE.email}
          </a>
        </div>
        <div className="sheet">
          <h2>Or pick a topic</h2>
          <p>Each one opens an email with the topic filled in.</p>
          <div className="chips">
            {TOPICS.map((t) => (
              <a className="chip" key={t} href={mailto(t)}>
                {t}
              </a>
            ))}
          </div>
        </div>
        <div className="sheet">
          <h2>Common answers</h2>
          <p>
            Subscriptions are managed in your App Store or Google Play account. To delete your account and everything
            in it, see <a href="/delete-data">Delete your data</a>. More answers are in the <a href="/#faq">FAQ</a>.
          </p>
        </div>
      </div>
    </Article>
  );
}
