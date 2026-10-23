/** CTA banner + contact cards (visit / touch / live gym hours). */
import { useGameState } from '../context/GameStateContext.jsx';
import { useGymStatus } from '../hooks/useGymStatus.js';
import { burst } from '../lib/fx.js';
import { WHATSAPP_NUMBER, PHONE_NUMBER_DISPLAY, PHONE_NUMBER_TEL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/brand.js';

export default function Contact() {
    const { addXP } = useGameState();
    const { open, timeText } = useGymStatus();

    const handleFreeTrial = (e) => {
        const trialBtn = e.currentTarget;
        addXP(100, trialBtn);
        const rect = trialBtn.getBoundingClientRect();
        burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 34);

        const message = encodeURIComponent(
            'Hi Tri-Star, I’d like to book my free trial week! Looking forward to starting my streak.'
        );
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
        setTimeout(() => {
            window.open(url, '_blank', 'noopener,noreferrer');
        }, 350);
    };

    return (
        <section className="section-spacing" id="contact" aria-labelledby="contact-heading">
            <div className="container">
                {/* CTA Banner */}
                <div className="cta-banner reveal-init">
                    <span className="section-label">Start your streak today</span>
                    <h2 className="section-title" id="contact-heading" style={{ marginBottom: '0.75rem' }}>
                        Your first rep is free
                    </h2>
                    <p className="section-desc" style={{ margin: '0 auto', maxWidth: '580px' }}>
                        Book a free trial week. Walk in, pick up the bar, and start your streak.
                    </p>
                    <div className="cta-actions">
                        <button type="button" className="btn-solid btn-red btn-pulse" onClick={handleFreeTrial}>
                            Book my free trial
                        </button>
                        <a href={`tel:${PHONE_NUMBER_TEL}`} className="btn-solid btn-blue">
                            Call {PHONE_NUMBER_DISPLAY}
                        </a>
                    </div>
                </div>

                {/* 3 Info Cards */}
                <div className="contact-cards-grid">
                    {/* Visit Us */}
                    <div className="contact-info-card reveal-init">
                        <h3 className="contact-card-title">Visit us</h3>
                        <p className="contact-card-body">
                            Sapna Sangeeta Road, next to Lotus Electronic, Indore, Madhya Pradesh.
                        </p>
                        <a
                            href="https://maps.google.com/?q=Tri-Star+Fitness+Sapna+Sangeeta+Road+Indore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-solid btn-outline"
                            style={{ alignSelf: 'flex-start', marginTop: '0.5rem', padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                        >
                            Open in Maps
                        </a>
                    </div>

                    {/* Get in touch */}
                    <div className="contact-info-card reveal-init">
                        <h3 className="contact-card-title">Get in touch</h3>
                        <p className="contact-card-body">
                            Phone: <a href={`tel:${PHONE_NUMBER_TEL}`} style={{ fontWeight: 700, color: 'var(--ink)' }}>{PHONE_NUMBER_DISPLAY}</a><br />
                            Instagram: <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'var(--plate-red)' }}>{INSTAGRAM_HANDLE}</a>
                        </p>
                        <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-solid btn-outline"
                            style={{ alignSelf: 'flex-start', marginTop: '0.5rem', padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                        >
                            Chat on WhatsApp
                        </a>
                    </div>

                    {/* Gym hours with live Asia/Kolkata status */}
                    <div className="contact-info-card reveal-init">
                        <h3 className="contact-card-title">Gym hours</h3>
                        <p className="contact-card-body">
                            Morning: 5:30 AM to 11:00 AM<br />
                            Evening: 4:30 PM to 10:00 PM<br />
                            Monday to Saturday (Sunday closed)
                        </p>
                        <div className="live-status-pill" aria-live="polite">
                            <span className={`status-dot ${open ? 'open' : 'closed'}`}></span>
                            <span>{open ? `Open now (${timeText})` : `Closed right now (${timeText})`}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
