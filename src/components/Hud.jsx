/** Fixed top bar: logo, anchor nav, role switcher, level pill, auth status, theme toggle + nearest branch. */
import { useState, useRef, useEffect } from 'react';
import { useGameState } from '../context/GameStateContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNearestGym } from '../hooks/useNearestGym.js';
import { GYMS } from '../lib/brand.js';

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

const PIN_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export default function Hud({ currentView = 'public', onSelectView = () => {} }) {
  const { theme, toggleTheme } = useGameState();
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { status: geoStatus, result: geoResult, errorMsg: geoError, locate, reset } = useNearestGym();
  const [popOpen, setPopOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    if (!popOpen) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setPopOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popOpen]);

  const handlePinClick = () => {
    setPopOpen((prev) => !prev);
    // Auto-trigger location fetch on first open if still idle
    if (!popOpen && geoStatus === 'idle') locate();
  };

  const handleReset = () => { reset(); };

  const handleMemberClick = () => {
    if (isAuthenticated) {
      onSelectView('client');
    } else {
      openAuthModal('login', 'user');
    }
  };

  const handleAdminClick = () => {
    if (isAuthenticated && isAdmin) {
      onSelectView('admin');
    } else {
      openAuthModal('login', 'admin');
    }
  };

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
              onClick={handleMemberClick}
              title="Member Workout & Attendance Portal"
            >
              🏋️ Member
            </button>
            <button
              type="button"
              className={`hud-view-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={handleAdminClick}
              title="Gym Admin & Management Console"
            >
              🛡️ Admin
            </button>
          </div>

          {/* User Auth Pill / Login Button */}
          {isAuthenticated ? (
            <div className="hud-user-pill" title={`Logged in as ${user?.name} (${user?.role})`}>
              <span className="hud-user-avatar">
                {user?.role === 'admin' ? '🛡️' : '👤'}
              </span>
              <span className="hud-user-name">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <span className="hud-user-tag">
                {user?.branch === 'manik_bagh' ? 'MB' : user?.branch === 'combined' ? 'ALL' : 'SS'}
              </span>
              <button
                type="button"
                className="hud-logout-btn"
                onClick={() => {
                  logout();
                  onSelectView('public');
                }}
                title="Sign out of account"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="hud-auth-btn"
              onClick={() => openAuthModal('login', 'user')}
              title="Sign In or Create Account"
            >
              Sign In
            </button>
          )}

          {/* Nearest Branch Pin Button + Popover */}
          <div className="hud-nearest-wrap" ref={wrapRef}>
            <button
              type="button"
              className={`theme-toggle-btn hud-pin-btn ${popOpen ? 'active' : ''}`}
              aria-label="Find nearest Tri-Star branch"
              title="Find nearest branch"
              onClick={handlePinClick}
            >
              {PIN_ICON}
            </button>

            {popOpen && (
              <div className="hud-nearest-popover" role="dialog" aria-label="Nearest branch">
                <p className="hud-nearest-title">📍 Nearest branch</p>

                {geoStatus === 'loading' && (
                  <p className="hud-nearest-body">
                    <span className="hud-nearest-spinner" />
                    Locating you…
                  </p>
                )}

                {geoStatus === 'success' && geoResult && (
                  <>
                    <p className="hud-nearest-body">
                      <strong style={{ color: 'var(--plate-red)' }}>{geoResult.gym.name}</strong>
                      {' — '}{geoResult.distanceKm.toFixed(1)} km away<br />
                      <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{geoResult.gym.address}</span>
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <a
                        href={geoResult.gym.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hud-nearest-action-btn"
                      >
                        Open in Maps
                      </a>
                      <button type="button" className="hud-nearest-action-btn" onClick={handleReset}>
                        Reset
                      </button>
                    </div>
                  </>
                )}

                {geoStatus === 'error' && (
                  <>
                    <p className="hud-nearest-body" style={{ color: 'var(--muted)' }}>{geoError}</p>
                    {GYMS.map((g) => (
                      <a
                        key={g.id}
                        href={g.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hud-nearest-action-btn"
                        style={{ display: 'block', marginBottom: '0.3rem' }}
                      >
                        📍 {g.name}
                      </a>
                    ))}
                  </>
                )}
              </div>
            )}
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
