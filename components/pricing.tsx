import GetKiron from "./get-kiron";
import { PRICING } from "@/content/site";

/* Two plans side by side, as today's site has them (Bearing's pricing section, without its monthly/yearly switch:
   Kiron's two plans are the two choices). The figures are today's site's; the stores set the real ones. The annual
   plan wears the app's PR stamp instead of a pill. */
export default function Pricing() {
  return (
    <section className="band-white" id="pricing" data-placeholder={PRICING.placeholder ? "copy" : undefined}>
      <div className="wrap" style={{ textAlign: "center" }}>
        <p className="eyebrow">{PRICING.eyebrow}</p>
        <h2>{PRICING.heading}</h2>
        <p className="lede" style={{ margin: "20px auto 0" }}>
          {PRICING.lede}
        </p>

        <div className="plans">
          {PRICING.plans.map((plan) => (
            <div className={`plan${plan.feature ? " feature" : ""}`} key={plan.name}>
              {plan.feature && <span className="stamp">Best value</span>}
              <div className="name">{plan.name}</div>
              <div className="price">
                {plan.price}
                <small> {plan.per}</small>
              </div>
              <div className="sub">{plan.note}</div>
              {plan.hand && <span className="hand">{plan.hand}</span>}
              <ul>
                {PRICING.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="foot">
                <GetKiron variant={plan.feature ? "primary" : "ghost"}>{plan.cta}</GetKiron>
              </div>
            </div>
          ))}
        </div>
        <p className="fine-print">{PRICING.finePrint}</p>
      </div>
    </section>
  );
}
