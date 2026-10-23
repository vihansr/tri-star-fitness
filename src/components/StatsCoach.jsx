/** Stats grid with count-up animation + head coach block. */
import { useEffect, useRef } from 'react';

function animateCounter(el, stat) {
  const { value: target, isDecimal = false, suffix = '' } = stat;
  const duration = 1300;
  const startTime = performance.now();

  function updateCount(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = eased * target;

    el.textContent = `${isDecimal ? current.toFixed(1) : Math.round(current)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.textContent = `${isDecimal ? target.toFixed(1) : target}${suffix}`;
    }
  }

  requestAnimationFrame(updateCount);
}

function StatCard({ stat, idx }) {
  const numRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();
        animateCounter(el, stat);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat]);

  return (
    <div className="stat-card reveal-init" data-reveal-idx={idx}>
      <div className="stat-number" ref={numRef}>0{stat.suffix || ''}</div>
      <div className="stat-label">{stat.label}</div>
    </div>
  );
}

export default function StatsCoach({ stats }) {
  return (
    <section className="section-spacing" id="stats-coach" aria-labelledby="stats-heading">
      <div className="container">
        <div className="text-center" style={{ textAlign: 'center' }}>
          <span className="section-label">Proven track record</span>
          <h2 className="section-title" id="stats-heading">Numbers that speak</h2>
        </div>

        {/* 4 Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <StatCard key={stat.label} stat={stat} idx={idx} />
          ))}
        </div>

        {/* Coach Block */}
        <div className="coach-card reveal-init" id="coach-block">
          <div className="coach-monogram-wrap">
            <div className="coach-monogram" aria-hidden="true">MS</div>
            <div className="coach-ring" aria-hidden="true"></div>
          </div>
          <div className="coach-info">
            <span className="badge-tag">Head Coach</span>
            <h3 className="coach-heading">Meet your coach</h3>
            <p className="coach-desc">
              Mohit Sen, head coach. Strength and conditioning, HYROX specialist, dedicated to your fitness journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
