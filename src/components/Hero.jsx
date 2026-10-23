/**
 * HERO: scroll-driven "lift the barbell" section.
 * A single requestAnimationFrame loop (decoupled from scroll events) computes
 * smoothed progress and drives all transforms — identical math to the vanilla engine.
 */
import { useEffect, useRef } from 'react';
import { useGameState } from '../context/GameStateContext.jsx';
import { clamp, calcVelocityTilt, smoothStep } from '../lib/logic.js';
import { burst } from '../lib/fx.js';
import { XP_RULES } from '../lib/brand.js';

const HERO_SMOOTHING_FACTOR = 0.12;

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f2be00" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function Hero() {
  const { addXP, unlockBadge } = useGameState();

  const heroRef = useRef(null);
  const dumbbellRef = useRef(null);
  const floorShadowRef = useRef(null);
  const wordFillRef = useRef(null);
  const introRef = useRef(null);
  const hintRef = useRef(null);
  const meterCaptionRef = useRef(null);
  const meterPercentRef = useRef(null);
  const meterFillRef = useRef(null);

  const reducedMotionRef = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const heroSection = heroRef.current;
    const dumbbellContainer = dumbbellRef.current;
    if (!heroSection || !dumbbellContainer) return undefined;

    let currentP = 0;
    let hasAwardedFirstRep = false;
    let rafId = requestAnimationFrame(frame);

    function frame() {
      // 1. Stage progress from layout geometry
      const rect = heroSection.getBoundingClientRect();
      const heroHeight = heroSection.offsetHeight;
      const scrollableDist = heroHeight - window.innerHeight;
      const targetP = clamp(-rect.top / (scrollableDist > 0 ? scrollableDist : 1), 0, 1);

      // 2. Exponential smoothing (snaps when reduced motion is preferred)
      if (reducedMotionRef.current) currentP = targetP;
      else currentP += (targetP - currentP) * HERO_SMOOTHING_FACTOR;

      const p = currentP;
      const e = smoothStep(p);

      // 3. Dumbbell transform: harmonic wobble + scroll-velocity tilt
      const scrollDelta = targetP - currentP;
      const baseWobble = Math.sin(p * 20) * (1 - p) * 2.8;
      const velocityTilt = calcVelocityTilt(scrollDelta, 6.5) * (1 - p * 0.35);
      const rotation = (baseWobble + velocityTilt).toFixed(2);
      const translateY = ((1 - 2 * e) * 30).toFixed(2);
      const scale = (1 + 0.12 * e).toFixed(3);
      dumbbellContainer.style.transform = `translate3d(0, ${translateY}vh, 0) scale(${scale}) rotate(${rotation}deg)`;

      // 4. STRONGER text reveal (clip-path from bottom) + red glow ramp p 0.7→1
      if (wordFillRef.current) {
        const clipBottom = ((1 - p) * 100).toFixed(2);
        wordFillRef.current.style.clipPath = `inset(${clipBottom}% 0 0 0)`;

        if (p >= 0.7) {
          const glowP = (p - 0.7) / 0.3;
          wordFillRef.current.style.filter = `drop-shadow(0 0 ${(glowP * 28).toFixed(1)}px rgba(230, 48, 39, ${(glowP * 0.85).toFixed(2)}))`;
        } else {
          wordFillRef.current.style.filter = 'none';
        }
      }

      // 5. Floor shadow shrink/fade
      if (floorShadowRef.current) {
        floorShadowRef.current.style.transform = `scale(${Math.max(0.2, 1 - 0.75 * e).toFixed(3)})`;
        floorShadowRef.current.style.opacity = Math.max(0, 0.75 - p * 0.85).toFixed(3);
      }

      // 6. Intro + hint fade out past p > 0.08
      if (introRef.current) {
        const introOpacity = p > 0.08 ? clamp(1 - (p - 0.08) * 10, 0, 1).toFixed(2) : '1';
        introRef.current.style.opacity = introOpacity;
        introRef.current.style.pointerEvents = parseFloat(introOpacity) < 0.1 ? 'none' : 'auto';
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = p > 0.08 ? clamp(1 - (p - 0.08) * 12, 0, 1).toFixed(2) : '1';
      }

      // 7. Lift meter + caption
      const percentInt = Math.round(p * 100);
      if (meterFillRef.current) meterFillRef.current.style.width = `${(p * 100).toFixed(1)}%`;
      if (meterPercentRef.current) meterPercentRef.current.textContent = `${percentInt}%`;
      if (meterCaptionRef.current) {
        if (p < 0.05) meterCaptionRef.current.textContent = 'Scroll to lift';
        else if (p < 0.97) meterCaptionRef.current.textContent = `Lifting… ${percentInt}%`;
        else meterCaptionRef.current.textContent = 'Rep complete';
      }

      // 8. First-rep reward (once, at 97%+)
      if (p > 0.97 && !hasAwardedFirstRep) {
        hasAwardedFirstRep = true;
        addXP(XP_RULES.FIRST_REP, dumbbellContainer);
        unlockBadge('first_rep');
        const rectDumbbell = dumbbellContainer.getBoundingClientRect();
        burst(rectDumbbell.left + rectDumbbell.width / 2, rectDumbbell.top + rectDumbbell.height / 2, 36);
      }

      rafId = requestAnimationFrame(frame);
    }

    return () => cancelAnimationFrame(rafId);
  }, [addXP, unlockBadge]);

  return (
    <section className="hero-scroll-track" id="hero" ref={heroRef} aria-label="Interactive Hero Lift Section">
      <div className="hero-stage" id="hero-stage">
        {/* Intro message & Google rating badge */}
        <div className="hero-intro" id="hero-intro" ref={introRef}>
          <span className="section-label">Indore’s Benchmark Training Arena</span>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2rem, 5.5vw, 3.8rem)', lineHeight: 0.95, marginBottom: '0.5rem' }}>
            The bar is on the floor. Scroll to pick it up.
          </h1>
          <p className="hero-subline">
            <span className="hero-stars" aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <Star /><Star /><Star /><Star /><Star />
            </span>
            <span>Rated 5.0 on Google by 51 members. Sapna Sangeeta Road, Indore.</span>
          </p>
        </div>

        {/* Giant STRONGER text in background */}
        <div className="hero-word-wrap" aria-hidden="true">
          <div className="hero-word hero-word-outline">STRONGER</div>
          <div className="hero-word hero-word-fill" id="hero-word-fill" ref={wordFillRef}>STRONGER</div>
        </div>

        {/* Centered Dumbbell & Floor Shadow */}
        <div className="hero-dumbbell-container" id="hero-dumbbell-container" ref={dumbbellRef}>
          <svg className="hero-dumbbell-svg" viewBox="0 0 520 220" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Heavy Olympic Dumbbell">
            {/* Steel Bar & Textured Grip */}
            <rect x="110" y="98" width="300" height="24" rx="4" fill="url(#metalGrad)" stroke="#14161b" strokeWidth="3" />
            <line x1="200" y1="99" x2="200" y2="121" stroke="#374151" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="220" y1="99" x2="220" y2="121" stroke="#374151" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="240" y1="99" x2="240" y2="121" stroke="#374151" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="260" y1="99" x2="260" y2="121" stroke="#374151" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="280" y1="99" x2="280" y2="121" stroke="#374151" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="300" y1="99" x2="300" y2="121" stroke="#374151" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="320" y1="99" x2="320" y2="121" stroke="#374151" strokeWidth="2" strokeDasharray="3 2" />

            {/* Inner Collars */}
            <rect x="145" y="86" width="12" height="48" rx="2" fill="#374151" stroke="#14161b" strokeWidth="2.5" />
            <rect x="363" y="86" width="12" height="48" rx="2" fill="#374151" stroke="#14161b" strokeWidth="2.5" />

            {/* Left Side Small Plates (Yellow) */}
            <rect x="116" y="52" width="26" height="116" rx="4" fill="#f2be00" stroke="#14161b" strokeWidth="3" />
            <rect x="122" y="58" width="14" height="104" rx="2" stroke="#14161b" strokeWidth="1.5" strokeDasharray="4 2" />

            {/* Left Side Big Plates (Red) */}
            <rect x="52" y="18" width="34" height="184" rx="6" fill="#e63027" stroke="#14161b" strokeWidth="3.5" />
            <rect x="86" y="18" width="28" height="184" rx="5" fill="#e63027" stroke="#14161b" strokeWidth="3.5" />
            <rect x="62" y="28" width="14" height="164" rx="3" stroke="#ffffff" strokeWidth="2" opacity="0.75" />

            {/* Right Side Small Plates (Yellow) */}
            <rect x="378" y="52" width="26" height="116" rx="4" fill="#f2be00" stroke="#14161b" strokeWidth="3" />
            <rect x="384" y="58" width="14" height="104" rx="2" stroke="#14161b" strokeWidth="1.5" strokeDasharray="4 2" />

            {/* Right Side Big Plates (Red) */}
            <rect x="406" y="18" width="28" height="184" rx="5" fill="#e63027" stroke="#14161b" strokeWidth="3.5" />
            <rect x="434" y="18" width="34" height="184" rx="6" fill="#e63027" stroke="#14161b" strokeWidth="3.5" />
            <rect x="444" y="28" width="14" height="164" rx="3" stroke="#ffffff" strokeWidth="2" opacity="0.75" />

            {/* End Cap Bolts */}
            <circle cx="48" cy="110" r="8" fill="#14161b" />
            <circle cx="472" cy="110" r="8" fill="#14161b" />

            <defs>
              <linearGradient id="metalGrad" x1="110" y1="98" x2="110" y2="122" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9ca3af" />
                <stop offset="0.5" stopColor="#e5e7eb" />
                <stop offset="1" stopColor="#6b7280" />
              </linearGradient>
            </defs>
          </svg>
          <div className="hero-floor-shadow" id="hero-floor-shadow" ref={floorShadowRef}></div>
        </div>

        {/* Scroll Hint Arrow */}
        <div className="hero-scroll-hint" id="hero-scroll-hint" ref={hintRef}>
          <span>Scroll down to lift</span>
          <svg className="hero-arrow-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M19 12l-7 7-7-7"></path>
          </svg>
        </div>

        {/* Bottom Lift Meter & Status Caption */}
        <div className="hero-bottom-meter" role="region" aria-label="Lift Progress Status">
          <div className="hero-meter-header">
            <span className="hero-meter-caption" id="hero-meter-caption" ref={meterCaptionRef}>Scroll to lift</span>
            <span className="hero-meter-percent" id="hero-meter-percent" ref={meterPercentRef}>0%</span>
          </div>
          <div className="hero-meter-track" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}>
            <div className="hero-meter-fill" id="hero-meter-fill" ref={meterFillRef} style={{ width: '0%' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
