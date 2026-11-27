import GetKiron from "./get-kiron";
import PenTitle from "./pen-title";
import { CheckList, Stamp } from "./marks";
import { PRICING } from "@/content/site";

/* Two plans side by side, drawn as the app's paywall draws its packages: cards, the chosen one with the red outline a
   chosen card gets in the app (PressableCard `selected`), and the annual plan wearing the PR stamp with what it
   saves, which lands as it comes into view. The figures are the App Store's (checked 2026-11-15); the stores set the
   real ones where each visitor lives, as the fine print says. */
export default function Pricing() {
  return (
    <section className="band-white" id="pricing" data-placeholder={PRICING.placeholder ? "copy" : undefined}>
      <div className="wrap" style={{ textAlign: "center" }}>
        <p className="eyebrow">{PRICING.eyebrow}</p>
        <PenTitle align="center">{PRICING.heading}</PenTitle>
        <p className="lede" style={{ margin: "20px auto 0" }}>
          {PRICING.lede}
        </p>

        <div className="plans">
          {PRICING.plans.map((plan) => (
            <div className={`card plan${plan.feature ? " feature" : ""}`} key={plan.name}>
              {plan.stamp && <Stamp label={plan.stamp} />}
              <div className="name">{plan.name}</div>
              <div className="price">
                {plan.price}
                <small> {plan.per}</small>
              </div>
              <div className="sub">
                <span className={`badge${plan.feature ? "" : " badge-success"}`}>{plan.note}</span>
                {plan.hand && <span className="hand">{plan.hand}</span>}
              </div>
              <CheckList items={PRICING.features} />
              <div className="foot">
                <GetKiron variant={plan.feature ? "primary" : "soft"}>{plan.cta}</GetKiron>
              </div>
            </div>
          ))}
        </div>
        <p className="fine-print">{PRICING.finePrint}</p>
      </div>
    </section>
  );
}
