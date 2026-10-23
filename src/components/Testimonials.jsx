/** Member testimonials grid. */
export default function Testimonials({ testimonials }) {
  return (
    <section className="section-spacing" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="text-center" style={{ textAlign: 'center' }}>
          <span className="section-label">Community voices</span>
          <h2 className="section-title" id="testimonials-heading">What members say</h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Real transformations from people who show up, put in the work, and raise their standards every single week.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <article key={t.author} className="testimonial-card reveal-init" data-reveal-idx={idx}>
              <p className="testimonial-quote">{t.quote}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" aria-hidden="true">{t.initial}</div>
                <div className="testimonial-name">{t.author}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
