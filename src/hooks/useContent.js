/** Fetches site content from /api/content; begins rendering with built-in
 * seed fallback so the page is never empty, then swaps in DB data when it arrives. */
import { useEffect, useState } from 'react';
import seedData from '../../server/seedData.js';

const FALLBACK = {
  offers: seedData.offers,
  stats: seedData.stats,
  plans: seedData.plans,
  gameIdeas: seedData.gameIdeas,
  testimonials: seedData.testimonials,
  questions: seedData.questions,
  badges: seedData.badges,
  equipment: seedData.equipment,
};

export function useContent() {
  const [data, setData] = useState(FALLBACK);
  const [source, setSource] = useState('seed');

  useEffect(() => {
    let alive = true;
    fetch('/api/content')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(({ source: src, data: payload }) => {
        if (!alive) return;
        setData(payload);
        setSource(src);
      })
      .catch(() => {
        /* offline / API down: keep fallback data */
      });
    return () => {
      alive = false;
    };
  }, []);

  return { data, source };
}
