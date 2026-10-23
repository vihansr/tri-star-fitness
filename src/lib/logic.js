/**
 * Pure functions and game calculations for TRI-STAR ★ FITNESS.
 * Framework-free and DOM-free: also imported by the Express server
 * (server/routes/gymStatus.js) for the gym-hours API.
 */

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function smoothStep(p) {
  const c = clamp(p, 0, 1);
  return c * c * (3 - 2 * c);
}

export function dampLerp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function calcVelocityTilt(velocity, maxTilt = 8) {
  return clamp(velocity * 80, -maxTilt, maxTilt);
}

export const EQUIPMENT_LIST = [
  {
    id: 'dumbbell',
    name: 'Pro Olympic Dumbbell',
    tag: 'Free weights',
    category: 'Hypertrophy & Strength',
    weight: '25 kg (Adjustable)',
    spec: '32mm diamond knurl handle • Urethane bumper heads',
    material: 'Hard chrome alloy steel & high-density polyurethane',
    description: 'Competition-grade dumbbell balanced for heavy presses, lunges, and unilateral hypertrophy drills.',
    accent: 'var(--plate-red)',
  },
  {
    id: 'barbell',
    name: 'Competition Bar Rod',
    tag: 'Barbell zone',
    category: 'Powerlifting & Olympic',
    weight: '20 kg • 2200mm',
    spec: '28mm shaft diameter • 190,000 PSI tensile strength • 8 needle bearings',
    material: 'Blued zinc shaft with brushed chrome rotating sleeves',
    description: 'Precision whip and zero-friction sleeve spin engineered for deadlifts, squats, and Olympic cleans.',
    accent: 'var(--plate-blue)',
  },
  {
    id: 'plate',
    name: '10kg Competition Bumper Plate',
    tag: 'Olympic plate',
    category: 'Progressive Overload',
    weight: '10 kg (±10g tolerance)',
    spec: '450mm diameter (IWF spec) • 34mm collar width • 50.4mm center bore',
    material: 'High-rebound virgin rubber with forged stainless steel hub',
    description: 'Dead-bounce bumper plate engineered to protect bars and platforms during high-velocity drops.',
    accent: 'var(--plate-green)',
  },
  {
    id: 'protein_tub',
    name: '100% Whey Isolate Tub',
    tag: 'Nutrition store',
    category: 'Performance Nutrition',
    weight: '2 kg (66 Servings)',
    spec: '27g Protein per scoop • 5.5g BCAA • 0g Added Sugar',
    material: 'Cross-flow micro-filtered whey isolate with digestive enzymes',
    description: 'Rapid-absorbing post-workout protein formulated for accelerated myofibrillar repair and recovery.',
    accent: 'var(--plate-yellow)',
  },
  {
    id: 'protein_bar',
    name: 'Tri-Star Crunch Protein Bar',
    tag: 'Fuel & Go',
    category: 'On-the-go Nutrition',
    weight: '64 grams',
    spec: '20g Protein • 3g Net Carbs • Enrobed dark chocolate crisp',
    material: 'Multi-layer whey crisp blend with roasted peanut swirl',
    description: 'Zero-guilt energy booster for sustained glycogen replenishment before intense HYROX circuits.',
    accent: 'var(--plate-red)',
  },
];

export function getNextCarouselIndex(current, direction, total) {
  if (total <= 0) return 0;
  return (current + direction + total) % total;
}

export function getHeartRateZone(bpm) {
  if (bpm < 115) {
    return {
      zone: 1,
      label: 'Zone 1: Active recovery',
      description: 'Promotes blood circulation, joint mobility, and lactic acid clearance.',
      color: 'var(--plate-blue)',
    };
  } else if (bpm < 140) {
    return {
      zone: 2,
      label: 'Zone 2: Aerobic engine',
      description: 'Maximizes mitochondrial biogenesis and fat oxidation for long training sessions.',
      color: 'var(--plate-green)',
    };
  } else if (bpm < 165) {
    return {
      zone: 3,
      label: 'Zone 3: HYROX tempo',
      description: 'Builds stamina for continuous ski erg, sled push, and wall ball circuits.',
      color: 'var(--plate-yellow)',
    };
  } else {
    return {
      zone: 4,
      label: 'Zone 4: Peak VO2 max',
      description: 'Maximum anaerobic threshold work, sprint finishes, and cardiovascular resilience.',
      color: 'var(--plate-red)',
    };
  }
}

/**
 * Returns the normalized ECG waveform amplitude at normalized beat phase [0, 1)
 */
export function ecgSamplePoint(phase) {
  const p = ((phase % 1) + 1) % 1;

  // P-wave
  if (p >= 0.12 && p < 0.22) {
    return 0.15 * Math.sin(((p - 0.12) / 0.1) * Math.PI);
  }
  // Q-dip
  if (p >= 0.28 && p < 0.31) {
    return -0.15 * Math.sin(((p - 0.28) / 0.03) * Math.PI);
  }
  // R-peak (sharp QRS spike)
  if (p >= 0.31 && p < 0.36) {
    return 1.0 * Math.sin(((p - 0.31) / 0.05) * Math.PI);
  }
  // S-dip
  if (p >= 0.36 && p < 0.4) {
    return -0.28 * Math.sin(((p - 0.36) / 0.04) * Math.PI);
  }
  // T-wave
  if (p >= 0.48 && p < 0.65) {
    return 0.32 * Math.sin(((p - 0.48) / 0.17) * Math.PI);
  }
  // Baseline isoelectric line
  return 0;
}

export function calcLevel(xp) {
  return Math.floor(Math.max(0, xp) / 50) + 1;
}

export function calcLevelProgress(xp) {
  const safeXP = Math.max(0, xp);
  const level = Math.floor(safeXP / 50) + 1;
  const currentInLevel = safeXP % 50;
  const progressPercent = (currentInLevel / 50) * 100;
  return {
    level,
    currentInLevel,
    nextLevelXP: 50,
    progressPercent,
  };
}

export function calcOverloadWeight(q) {
  const clampedQ = clamp(q, 0, 1);

  if (clampedQ >= 0.92) {
    return { weight: 100, tier: 'New PR!', loadedIndex: 4 };
  } else if (clampedQ >= 0.7) {
    return { weight: 70, tier: 'Heavy set', loadedIndex: 3 };
  } else if (clampedQ >= 0.45) {
    return { weight: 50, tier: 'Working set', loadedIndex: 2 };
  } else if (clampedQ >= 0.2) {
    return { weight: 30, tier: 'Warm-up set', loadedIndex: 1 };
  } else {
    return { weight: 20, tier: 'Empty bar', loadedIndex: 0 };
  }
}

export function calcQuizRank(score) {
  if (score >= 40) return 'Iron legend';
  if (score >= 30) return 'Gym regular';
  if (score >= 20) return 'Warm-up warrior';
  return 'Fresh recruit';
}

export function isGymOpenAtTime(time) {
  // Sunday closed
  if (time.day === 0) return false;

  const currentMin = time.hour * 60 + time.minute;
  const morningStart = 5 * 60 + 30; // 5:30 AM = 330 min
  const morningEnd = 11 * 60; // 11:00 AM = 660 min
  const eveningStart = 16 * 60 + 30; // 4:30 PM = 990 min
  const eveningEnd = 22 * 60; // 10:00 PM = 1320 min

  const inMorning = currentMin >= morningStart && currentMin < morningEnd;
  const inEvening = currentMin >= eveningStart && currentMin < eveningEnd;

  return inMorning || inEvening;
}

export function getIndoreTime(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  let weekdayStr = '';
  let hour = 0;
  let minute = 0;

  for (const part of parts) {
    if (part.type === 'weekday') weekdayStr = part.value;
    if (part.type === 'hour') hour = parseInt(part.value, 10);
    if (part.type === 'minute') minute = parseInt(part.value, 10);
  }

  const daysMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    day: daysMap[weekdayStr] ?? now.getDay(),
    hour,
    minute,
  };
}
