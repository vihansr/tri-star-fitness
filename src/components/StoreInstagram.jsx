/** Nutrition store + Instagram promo cards. */
import { STORE_URL, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '../lib/brand.js';

export default function StoreInstagram() {
  return (
    <section className="section-spacing" id="store-instagram" aria-labelledby="store-heading">
      <div className="container">
        <div className="store-insta-grid">
          {/* Store Card */}
          <div className="promo-card reveal-init" style={{ '--promo-accent': 'var(--plate-yellow)' }}>
            <div>
              <span className="promo-tag">In-House Nutrition</span>
              <h3 className="promo-title" id="store-heading" style={{ marginTop: '0.4rem', marginBottom: '0.75rem' }}>
                Fuel your gains
              </h3>
              <p className="promo-desc">
                Premium supplements from top Indian and international brands, available at our in-house nutrition store.
              </p>
            </div>
            <div>
              <a
                href={STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid btn-outline"
                style={{ boxShadow: '4px 4px 0 var(--plate-yellow)' }}
              >
                Visit the store
              </a>
            </div>
          </div>

          {/* Instagram Card */}
          <div className="promo-card reveal-init" style={{ '--promo-accent': 'var(--plate-red)' }}>
            <div>
              <span className="promo-tag">Social Squad</span>
              <h3 className="promo-title" style={{ marginTop: '0.4rem', marginBottom: '0.75rem' }}>
                Follow the Tri-Star community
              </h3>
              <p className="promo-desc">
                Daily workout highlights, form tutorials, PR celebrations, and athlete takeovers directly on Instagram.
              </p>
            </div>
            <div>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-solid btn-red">
                Follow {INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
