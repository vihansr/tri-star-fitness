/** "What we offer" cards (data-driven from /api/content). */
export default function Offers({ offers }) {
  return (
    <section className="section-spacing" id="offer" aria-labelledby="offer-heading">
      <div className="container">
        <div>
          <span className="section-label">Built for results</span>
          <h2 className="section-title" id="offer-heading">What we offer</h2>
          <p className="section-desc">
            From heavy compound lifts to official HYROX stations and science-backed body transformations,
            our floor is tuned for peak human performance.
          </p>
        </div>

        <div className="offer-grid">
          {offers.map((offer, idx) => (
            <article
              key={offer.id || offer.title}
              className="offer-card reveal-init"
              style={{ '--card-accent': offer.accent }}
              data-reveal-idx={idx}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="offer-card-icon" dangerouslySetInnerHTML={{ __html: offer.svgIcon }} />
                <span className="badge-tag">{offer.badge}</span>
              </div>
              <div>
                <h3 className="offer-card-title">{offer.title}</h3>
                <p className="offer-card-desc">{offer.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
