/** Fixed top bar: logo, anchor nav, role switcher, level pill + theme toggle. */
import { useGameState } from '../context/GameStateContext.jsx';

const MOON_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const SUN_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

export default function Hud({ currentView = 'public', onSelectView = () => {} }) {
  const { level, progress, theme, toggleTheme } = useGameState();

  return (
    <header className="hud-bar" role="banner">
      <div className="hud-inner">
        <div className="hud-left">
          <button
            type="button"
            className="hud-logo-btn"
            onClick={() => onSelectView('public')}
            aria-label="Tri-Star Fitness Home"
          >
            TRI-STAR<span className="star">★</span>
          </button>

          {currentView === 'public' ? (
            <nav className="hud-nav" aria-label="Main Navigation">
              <a href="#offer" className="hud-nav-link">What we offer</a>
              <a href="#equipment" className="hud-nav-link">3D Gear</a>
              <a href="#cardiac" className="hud-nav-link">Cardiac health</a>
              <a href="#plans" className="hud-nav-link">Plans</a>
              <a href="#contact" className="hud-nav-link">Contact</a>
            </nav>
          ) : (
            <div className="hud-portal-indicator">
              <span className="portal-crumb">
                {currentView === 'admin' ? '🛡️ Management Portal' : '🏋️ Athlete / Member Portal'}
              </span>
            </div>
          )}
        </div>

        <div className="hud-right">
          {/* Mode Switcher: Website / Member / Admin */}
          <div className="hud-view-switcher" role="group" aria-label="Portal switcher">
            <button
              type="button"
              className={`hud-view-btn ${currentView === 'public' ? 'active' : ''}`}
              onClick={() => onSelectView('public')}
              title="Public Gym Website"
            >
              🌐 Site
            </button>
            <button
              type="button"
              className={`hud-view-btn ${currentView === 'client' ? 'active' : ''}`}
              onClick={() => onSelectView('client')}
              title="Member Workout & Attendance Portal"
            >
              🏋️ Member
            </button>
            <button
              type="button"
              className={`hud-view-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => onSelectView('admin')}
              title="Gym Admin & Management Console"
            >
              🛡️ Admin
            </button>
          </div>

          <div className="hud-level-pill" aria-label="Player Level and XP">
            <span className="hud-level-badge">Level {level}</span>
            <div className="hud-xp-container">
              <div
                className="hud-xp-track"
                role="progressbar"
                aria-valuenow={progress.currentInLevel}
                aria-valuemin={0}
                aria-valuemax={50}
                aria-label="XP progress to next level"
              >
                <div className="hud-xp-fill" style={{ width: `${progress.progressPercent}%` }}></div>
              </div>
              <span className="hud-xp-text">
                {progress.currentInLevel} / {progress.nextLevelXP} XP
              </span>
            </div>
          </div>

          <button
            type="button"
            className="theme-toggle-btn"
            aria-label="Switch between light and dark theme"
            onClick={(e) => toggleTheme(e.currentTarget)}
          >
            {theme === 'dark' ? SUN_ICON : MOON_ICON}
          </button>
        </div>
      </div>
    </header>
  );
}
