/** Global scroll-reveal driver: observes every `.reveal-init` element currently
 * in the DOM, adds `.reveal-in` with staggered animationDelay when visible. */
import { useEffect } from 'react';

export function useRevealScan(deps) {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-init:not(.reveal-in)');
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const idx = parseInt(el.getAttribute('data-reveal-idx') || '0', 10);
          const stagger = (idx % 4) * 90;

          el.style.animationDelay = `${stagger}ms`;
          el.style.animationFillMode = 'backwards';
          el.classList.remove('reveal-init');
          el.classList.add('reveal-in');

          observer.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
