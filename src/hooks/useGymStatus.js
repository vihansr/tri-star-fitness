/** Live gym-hours status: polls /api/gym-status every 60s, falls back to
 * the same client-side India/Kolkata logic if the API is unreachable. */
import { useEffect, useState } from 'react';
import { getIndoreTime, isGymOpenAtTime } from '../lib/logic.js';

function computeLocalStatus() {
  const now = getIndoreTime(new Date());
  return { open: isGymOpenAtTime(now), hour: now.hour, minute: now.minute };
}

function formatIST(hour, minute) {
  const hourFmt = hour % 12 || 12;
  const min = minute.toString().padStart(2, '0');
  return `${hourFmt}:${min} ${hour >= 12 ? 'PM' : 'AM'} IST`;
}

export function useGymStatus() {
  const [status, setStatus] = useState(computeLocalStatus);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/gym-status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) setStatus({ open: data.open, hour: data.hour, minute: data.minute });
      } catch {
        if (alive) setStatus(computeLocalStatus());
      }
    };
    const timer = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return {
    open: status.open,
    timeText: formatIST(status.hour, status.minute),
  };
}
