/** Membership plans grid with WhatsApp deep links. */
import { WHATSAPP_NUMBER } from '../lib/brand.js';

export default function Plans({ plans }) {
  return (
    <section className="section-spacing" id="plans" aria-labelledby="plans-heading">
      <div className="container">
        <div className="text-center" style={{ textAlign: 'center' }}>
          <span className="section-label">Transparent investment</span>
          <h2 className="section-title" id="plans-heading">Membership plans</h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Pick the plan that fits your goals. No hidden fees, no contracts.
          </p>
        </div>

        <div className="plans-grid">
          {plans.map((plan, idx) => {
            const waText = encodeURIComponent(`Hi Tri-Star, I’m interested in the ${plan.name} plan.`);
            const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
            return (
              <div
                key={plan.name}
                className="plan-card reveal-init"
                style={{ '--plan-accent': plan.accent }}
                data-reveal-idx={idx}
              >
                {plan.popular ? <div className="plan-badge-popular">Most popular</div> : null}
                <div className="plan-top">
                  <h3 className="plan-title">{plan.name}</h3>
                  <div className="plan-price-label">Contact for pricing</div>
                </div>

                <ul className="plan-features-list">
                  {plan.features.map((f) => (
                    <li key={f} className="plan-feature-item">
                      <span className="plan-feature-dot" aria-hidden="true"></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn-solid ${plan.popular ? 'btn-red' : 'btn-outline'}`}
                    style={{ width: '100%' }}
                  >
                    {plan.buttonText}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
