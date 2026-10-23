import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcLevel,
  calcLevelProgress,
  calcOverloadWeight,
  calcQuizRank,
  isGymOpenAtTime,
  smoothStep,
  clamp,
  dampLerp,
  calcVelocityTilt,
  getHeartRateZone,
  ecgSamplePoint,
  EQUIPMENT_LIST,
  getNextCarouselIndex,
} from './lib/logic.js';

test('clamp restricts values properly', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});

test('Equipment list contains all 5 required items', () => {
  assert.equal(EQUIPMENT_LIST.length, 5);
  const ids = EQUIPMENT_LIST.map((e) => e.id);
  assert.ok(ids.includes('dumbbell'));
  assert.ok(ids.includes('barbell'));
  assert.ok(ids.includes('plate'));
  assert.ok(ids.includes('protein_tub'));
  assert.ok(ids.includes('protein_bar'));
});

test('Carousel index cycling wraps forward and backward', () => {
  assert.equal(getNextCarouselIndex(0, 1, 5), 1);
  assert.equal(getNextCarouselIndex(4, 1, 5), 0); // wrap forward
  assert.equal(getNextCarouselIndex(0, -1, 5), 4); // wrap backward
  assert.equal(getNextCarouselIndex(2, -1, 5), 1);
});

test('Cardiac heart rate zones', () => {
  assert.equal(getHeartRateZone(70).zone, 1);
  assert.equal(getHeartRateZone(114).zone, 1);
  assert.equal(getHeartRateZone(115).zone, 2);
  assert.equal(getHeartRateZone(139).zone, 2);
  assert.equal(getHeartRateZone(140).zone, 3);
  assert.equal(getHeartRateZone(164).zone, 3);
  assert.equal(getHeartRateZone(165).zone, 4);
  assert.equal(getHeartRateZone(185).zone, 4);
});

test('ECG sample point waveform physics', () => {
  // Baseline should be 0
  assert.equal(ecgSamplePoint(0.0), 0);
  assert.equal(ecgSamplePoint(0.8), 0);

  // R-peak should reach approximately 1.0 around phase 0.33-0.34
  const peak = ecgSamplePoint(0.335);
  assert.ok(peak > 0.9 && peak <= 1.0);

  // Q-dip should be negative
  const qDip = ecgSamplePoint(0.295);
  assert.ok(qDip < 0);

  // S-dip should be negative
  const sDip = ecgSamplePoint(0.38);
  assert.ok(sDip < 0);
});

test('dampLerp provides smooth frame-rate independent easing', () => {
  const result1 = dampLerp(0, 1, 10, 0.016);
  assert.ok(result1 > 0 && result1 < 1);

  // Larger dt should approach target faster
  const result2 = dampLerp(0, 1, 10, 0.1);
  assert.ok(result2 > result1);

  // Target reached if already at target
  assert.equal(dampLerp(1, 1, 10, 0.016), 1);
});

test('calcVelocityTilt maps scroll velocity to angular degrees within bounds', () => {
  assert.equal(calcVelocityTilt(0), 0);
  // Positive velocity creates positive tilt
  const tilt = calcVelocityTilt(0.05);
  assert.ok(tilt > 0);
  // Clamping
  assert.equal(calcVelocityTilt(1.0, 8), 8);
  assert.equal(calcVelocityTilt(-1.0, 8), -8);
});

test('smoothStep easing', () => {
  assert.equal(smoothStep(0), 0);
  assert.equal(smoothStep(1), 1);
  assert.equal(smoothStep(0.5), 0.5);
  assert.ok(smoothStep(0.2) > 0 && smoothStep(0.2) < 0.2); // S-curve start is slower
});

test('XP to Level calculations', () => {
  // floor(xp/50) + 1
  assert.equal(calcLevel(0), 1);
  assert.equal(calcLevel(49), 1);
  assert.equal(calcLevel(50), 2);
  assert.equal(calcLevel(99), 2);
  assert.equal(calcLevel(100), 3);

  const prog0 = calcLevelProgress(25);
  assert.equal(prog0.level, 1);
  assert.equal(prog0.currentInLevel, 25);
  assert.equal(prog0.progressPercent, 50);

  const prog1 = calcLevelProgress(75);
  assert.equal(prog1.level, 2);
  assert.equal(prog1.currentInLevel, 25);
  assert.equal(prog1.progressPercent, 50);
});

test('Overload plate tiers and weight', () => {
  // q < 0.20: 20kg Empty bar
  assert.deepEqual(calcOverloadWeight(0.0), { weight: 20, tier: 'Empty bar', loadedIndex: 0 });
  assert.deepEqual(calcOverloadWeight(0.19), { weight: 20, tier: 'Empty bar', loadedIndex: 0 });

  // q >= 0.20: 30kg Warm-up set (+5kg pair)
  assert.deepEqual(calcOverloadWeight(0.2), { weight: 30, tier: 'Warm-up set', loadedIndex: 1 });
  assert.deepEqual(calcOverloadWeight(0.4), { weight: 30, tier: 'Warm-up set', loadedIndex: 1 });

  // q >= 0.45: 50kg Working set (+10kg pair)
  assert.deepEqual(calcOverloadWeight(0.45), { weight: 50, tier: 'Working set', loadedIndex: 2 });

  // q >= 0.70: 70kg Heavy set (+10kg pair)
  assert.deepEqual(calcOverloadWeight(0.7), { weight: 70, tier: 'Heavy set', loadedIndex: 3 });

  // q >= 0.92: 100kg New PR! (+15kg pair)
  assert.deepEqual(calcOverloadWeight(0.92), { weight: 100, tier: 'New PR!', loadedIndex: 4 });
  assert.deepEqual(calcOverloadWeight(1.0), { weight: 100, tier: 'New PR!', loadedIndex: 4 });
});

test('Quiz ranking calculations', () => {
  assert.equal(calcQuizRank(40), 'Iron legend');
  assert.equal(calcQuizRank(30), 'Gym regular');
  assert.equal(calcQuizRank(20), 'Warm-up warrior');
  assert.equal(calcQuizRank(10), 'Fresh recruit');
  assert.equal(calcQuizRank(0), 'Fresh recruit');
});

test('Indore gym operating hours', () => {
  // Sunday closed (day = 0)
  assert.equal(isGymOpenAtTime({ day: 0, hour: 8, minute: 0 }), false);
  assert.equal(isGymOpenAtTime({ day: 0, hour: 18, minute: 0 }), false);

  // Monday morning (5:30 to 11:00)
  assert.equal(isGymOpenAtTime({ day: 1, hour: 5, minute: 29 }), false);
  assert.equal(isGymOpenAtTime({ day: 1, hour: 5, minute: 30 }), true);
  assert.equal(isGymOpenAtTime({ day: 1, hour: 10, minute: 59 }), true);
  assert.equal(isGymOpenAtTime({ day: 1, hour: 11, minute: 0 }), false);

  // Monday afternoon gap (11:00 to 16:30)
  assert.equal(isGymOpenAtTime({ day: 1, hour: 14, minute: 0 }), false);

  // Monday evening (16:30 to 22:00)
  assert.equal(isGymOpenAtTime({ day: 1, hour: 16, minute: 29 }), false);
  assert.equal(isGymOpenAtTime({ day: 1, hour: 16, minute: 30 }), true);
  assert.equal(isGymOpenAtTime({ day: 1, hour: 21, minute: 59 }), true);
  assert.equal(isGymOpenAtTime({ day: 1, hour: 22, minute: 0 }), false);

  // Saturday evening
  assert.equal(isGymOpenAtTime({ day: 6, hour: 18, minute: 0 }), true);
});
