/**
 * Global game state: XP, unlocked badges, theme, overload PR flag.
 * Persisted to localStorage (same keys as the vanilla version).
 * Badges are stored as plain ID arrays in state; membership = unlocked.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { calcLevelProgress } from '../lib/logic.js';
import { burst, showFloatingXP } from '../lib/fx.js';

const GameStateContext = createContext(null);

const LS_KEYS = {
  xp: 'tristar_xp',
  badges: 'tristar_badges',
  pr100: 'tristar_pr100',
  theme: 'tristar_theme',
};

function readStoredXP() {
  const raw = localStorage.getItem(LS_KEYS.xp);
  const n = raw === null ? NaN : parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function readStoredBadges() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LS_KEYS.badges) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredTheme() {
  return localStorage.getItem(LS_KEYS.theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

export function GameStateProvider({ children }) {
  const [xp, setXp] = useState(readStoredXP);
  const [badges, setBadges] = useState(readStoredBadges);
  const [theme, setTheme] = useState(readStoredTheme);
  const [overload100kgUnlocked, setOverload100kgUnlocked] = useState(() => localStorage.getItem(LS_KEYS.pr100) === 'true');
  const justUnlockedRef = useRef(null); // last newly unlocked badge id (for burst animation)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Listen for reduced-motion changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Persist all four keys on any change (mirrors vanilla AppState.save())
  useEffect(() => {
    localStorage.setItem(LS_KEYS.xp, xp.toString());
    localStorage.setItem(LS_KEYS.badges, JSON.stringify(badges));
    localStorage.setItem(LS_KEYS.theme, theme);
    localStorage.setItem(LS_KEYS.pr100, overload100kgUnlocked ? 'true' : 'false');
  }, [xp, badges, theme, overload100kgUnlocked]);

  // Apply theme to <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Burst confetti on the badge wall tile of the newest unlocked badge
  useEffect(() => {
    const id = justUnlockedRef.current;
    if (!id) return undefined;

    const raf = requestAnimationFrame(() => {
      const badgeEl = document.querySelector(`[data-badge-id="${id}"]`);
      if (badgeEl) {
        badgeEl.classList.add('unlocked', 'just-unlocked');
        badgeEl.classList.remove('locked');
        const rect = badgeEl.getBoundingClientRect();
        burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [badges]);

  const addXP = useCallback((amount, originEl = null) => {
    setXp((prev) => prev + amount);

    if (originEl && originEl.getBoundingClientRect) {
      const rect = originEl.getBoundingClientRect();
      showFloatingXP(amount, rect.left + rect.width / 2, rect.top);
    } else {
      showFloatingXP(amount);
    }
  }, []);

  /** Returns true when this call newly unlocked the badge. */
  const unlockBadge = useCallback((badgeId) => {
    let newlyUnlocked = false;
    setBadges((prev) => {
      if (prev.includes(badgeId)) return prev;
      newlyUnlocked = true;
      justUnlockedRef.current = badgeId;
      return [...prev, badgeId];
    });
    return newlyUnlocked;
  }, []);

  const awardOverloadPR = useCallback(() => {
    setOverload100kgUnlocked(true);
  }, []);

  const toggleTheme = useCallback((originEl = null) => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    if (originEl && originEl.getBoundingClientRect) {
      const rect = originEl.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
    }
  }, []);

  const levelInfo = useMemo(() => calcLevelProgress(xp), [xp]);

  const value = useMemo(
    () => ({
      xp,
      badges,
      theme,
      prefersReducedMotion,
      overload100kgUnlocked,
      level: levelInfo.level,
      progress: levelInfo,
      addXP,
      unlockBadge,
      toggleTheme,
      awardOverloadPR,
    }),
    [xp, badges, theme, prefersReducedMotion, overload100kgUnlocked, levelInfo, addXP, unlockBadge, toggleTheme, awardOverloadPR]
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used inside <GameStateProvider>');
  return ctx;
}
