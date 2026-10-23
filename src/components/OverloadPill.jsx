import { useEffect, useRef } from 'react';
import { useGameState } from '../context/GameStateContext.jsx';
import { calcOverloadWeight, clamp } from '../lib/logic.js';
import { burst } from '../lib/fx.js';
import { XP_RULES } from '../lib/brand.js';

function PlateRef() {
  return useRef(null);
}

/**
 * Progressive overload barbell pill (fixed bottom): adds plates as you scroll
 * past the hero, one-time 100 kg PR bonus stored in game state.
 */
export default function OverloadPill() {
  const { addXP, overload100kgUnlocked, awardOverloadPR } = useGameState();

  const pillRef = useRef(null);
  const weightNumRef = useRef(null);
  const tierLabelRef = useRef(null);
  const barbellRigRef = useRef(null);
  const overloadPRRef = useRef(overload100kgUnlocked);
  overloadPRRef.current = overload100kgUnlocked;

  // [null, plate-l-1 .. plate-l-4]
  const leftPlates = [null, PlateRef(), PlateRef(), PlateRef(), PlateRef()];
  const rightPlates = [null, PlateRef(), PlateRef(), PlateRef(), PlateRef()];

  useEffect(() => {
    const pill = pillRef.current;
    // NOTE: the hero section is rendered by a sibling component (<Hero />),
    // so it is resolved from the DOM here (the committed tree already contains
    // it when this sibling's effect runs) — a local ref can never reach it.
    const heroSection = document.getElementById('hero');
    if (!pill || !heroSection) return undefined;

    let shownWeight = 20;
    let targetWeight = 20;
    let currentTier = 'Empty bar';
    let previousLoadedIndex = 0;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const heroRect = heroSection.getBoundingClientRect();
      const heroBottom = heroRect.bottom;
      const innerHeight = window.innerHeight;

      // Pill visibility: slides up once hero bottom < 60% of viewport
      if (heroBottom < innerHeight * 0.6) pill.classList.add('visible');
      else pill.classList.remove('visible');

      // Progress q across post-hero scroll range
      const heroHeight = heroSection.offsetHeight;
      const heroEnd = heroHeight - innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollRemaining = docHeight - innerHeight - heroEnd;
      const q = clamp((scrollY - heroEnd) / (scrollRemaining > 0 ? scrollRemaining : 1), 0, 1);

      const overloadState = calcOverloadWeight(q);
      targetWeight = overloadState.weight;
      currentTier = overloadState.tier;
      const loadedIndex = overloadState.loadedIndex;

      if (loadedIndex !== previousLoadedIndex) {
        // Trigger clank when adding plates
        if (loadedIndex > previousLoadedIndex && barbellRigRef.current) {
          const rig = barbellRigRef.current;
          rig.classList.remove('clank');
          void rig.offsetWidth; // retrigger reflow
          rig.classList.add('clank');
        }

        // Update plate classes via refs
        for (let i = 1; i <= 4; i++) {
          const lp = leftPlates[i].current;
          const rp = rightPlates[i].current;
          for (const el of [lp, rp]) {
            if (!el) continue;
            if (i <= loadedIndex) {
              el.classList.remove('off');
              el.classList.add('loaded');
            } else {
              el.classList.remove('loaded');
              el.classList.add('off');
            }
          }
        }

        // One-time 100 kg PR bonus
        if (loadedIndex === 4 && !overloadPRRef.current) {
          overloadPRRef.current = true;
          awardOverloadPR();
          addXP(XP_RULES.OVERLOAD_100KG, pill);
          const rect = pill.getBoundingClientRect();
          burst(rect.left + rect.width / 2, rect.top, 30);
        }

        previousLoadedIndex = loadedIndex;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Smooth weight readout easing loop
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    function updateWeightReadout() {
      if (reduced) shownWeight = targetWeight;
      else shownWeight += (targetWeight - shownWeight) * 0.15;
      if (weightNumRef.current) weightNumRef.current.textContent = `${Math.round(shownWeight)} kg`;
      if (tierLabelRef.current) tierLabelRef.current.textContent = currentTier;
      rafId = requestAnimationFrame(updateWeightReadout);
    }
    rafId = requestAnimationFrame(updateWeightReadout);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
    // leftPlates/rightPlates hold stable ref objects; omitting the (recreated
    // per-render) arrays avoids re-binding the scroll listener on every XP change.
  }, [addXP, awardOverloadPR]);

  return (
    <aside className="overload-pill" id="overload-pill" aria-hidden="true" ref={pillRef}>
      <div className="barbell-rig" id="barbell-rig" ref={barbellRigRef}>
        {/* Left plates group (outward to inward: 15kg red, 10kg yellow, 10kg green, 5kg white) */}
        <div className="barbell-plates-group barbell-plates-left">
          <div ref={leftPlates[4]} className="plate-elem plate-left plate-15kg off" id="plate-l-4"></div>
          <div ref={leftPlates[3]} className="plate-elem plate-left plate-10kg-y off" id="plate-l-3"></div>
          <div ref={leftPlates[2]} className="plate-elem plate-left plate-10kg-g off" id="plate-l-2"></div>
          <div ref={leftPlates[1]} className="plate-elem plate-left plate-5kg off" id="plate-l-1"></div>
        </div>
        {/* Bar shaft */}
        <div className="barbell-shaft"></div>
        {/* Right plates group (inward to outward: 5kg white, 10kg green, 10kg yellow, 15kg red) */}
        <div className="barbell-plates-group barbell-plates-right">
          <div ref={rightPlates[1]} className="plate-elem plate-right plate-5kg off" id="plate-r-1"></div>
          <div ref={rightPlates[2]} className="plate-elem plate-right plate-10kg-g off" id="plate-r-2"></div>
          <div ref={rightPlates[3]} className="plate-elem plate-right plate-10kg-y off" id="plate-r-3"></div>
          <div ref={rightPlates[4]} className="plate-elem plate-right plate-15kg off" id="plate-r-4"></div>
        </div>
      </div>

      <div className="overload-readout">
        <div className="overload-weight-num" id="overload-weight-num" ref={weightNumRef}>20 kg</div>
        <div className="overload-tier-label" id="overload-tier-label" ref={tierLabelRef}>Empty bar</div>
      </div>
    </aside>
  );
}
