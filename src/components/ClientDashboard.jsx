/**
 * Member / Client Dashboard component.
 * Minimalist, high-performance athlete interface to:
 * - Check in daily and maintain attendance streaks
 * - Log sets, reps, weight, and RPE into personal history
 * - Track personal records (PRs) in power lifts & aerobic benchmarks
 * - View active membership tier and expiry status
 */
import { useState, useEffect } from 'react';
import { useGameState } from '../context/GameStateContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { burst } from '../lib/fx.js';
import {
  getStoredMembers,
  getActiveMember,
  setActiveMemberId,
  getStoredWorkouts,
  saveStoredWorkouts,
  getStoredPRs,
  saveStoredPRs,
  recordCheckIn,
  getPackageExpiryMeta,
} from '../lib/dashboardStorage.js';

export default function ClientDashboard({ onNavigateToWebsite }) {
  const { addXP } = useGameState();
  const { user: authUser, token: authToken, isAuthenticated, openAuthModal } = useAuth();
  const [members, setMembers] = useState(() => getStoredMembers());
  const [activeMember, setActiveMemberState] = useState(() => {
    const fallback = getActiveMember();
    return authUser ? { ...fallback, ...authUser, name: authUser.name, plan: authUser.plan || fallback.plan } : fallback;
  });
  const [workouts, setWorkouts] = useState(() => getStoredWorkouts());
  const [prs, setPRs] = useState(() => getStoredPRs());

  // Check-in state
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [streakCount, setStreakCount] = useState(authUser?.streakDays || activeMember.streakDays || 14);

  // Sync state when authenticated user updates
  useEffect(() => {
    if (authUser) {
      setActiveMemberState((prev) => ({
        ...prev,
        ...authUser,
        id: authUser.memberId || prev.id,
        name: authUser.name,
        branch: authUser.branch || prev.branch,
        plan: authUser.plan || prev.plan,
      }));
      setStreakCount(authUser.streakDays || 14);
    }
  }, [authUser]);

  // Fetch real workouts from backend if logged in
  useEffect(() => {
    if (authToken) {
      fetch('/api/dashboard/workouts', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.workouts && data.workouts.length > 0) {
            setWorkouts(data.workouts);
          }
        })
        .catch(() => {});
    }
  }, [authToken]);

  // New Workout Form state
  const [exercise, setExercise] = useState('Barbell Deadlift');
  const [customExercise, setCustomExercise] = useState('');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(6);
  const [weight, setWeight] = useState(100);
  const [rpe, setRpe] = useState(8);
  const [notes, setNotes] = useState('');
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);

  // PR edit state
  const [editingPRKey, setEditingPRKey] = useState(null);
  const [newPRValue, setNewPRValue] = useState('');

  const handleMemberChange = (id) => {
    setActiveMemberId(id);
    const selected = members.find((m) => m.id === id) || members[0];
    setActiveMemberState(selected);
    setStreakCount(selected.streakDays || 0);
  };

  const handleDailyCheckIn = (e) => {
    if (hasCheckedInToday) return;
    const btn = e.currentTarget;
    addXP(50, btn);

    const rect = btn.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);

    setHasCheckedInToday(true);
    const nextStreak = streakCount + 1;
    setStreakCount(nextStreak);

    // Update member's streak in storage
    const updated = members.map((m) =>
      m.id === activeMember.id ? { ...m, streakDays: nextStreak } : m
    );
    setMembers(updated);

    // Real backend attendance sync
    if (authToken) {
      fetch('/api/dashboard/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          memberName: activeMember.name,
          plan: activeMember.plan,
          branch: activeMember.branch === 'manik_bagh' ? 'Manik Bagh' : 'Sapna Sangeeta',
        }),
      }).catch(() => {});
    }

    recordCheckIn(activeMember.name, activeMember.plan);
  };

  const handleSaveWorkout = (e) => {
    e.preventDefault();
    const finalExercise = exercise === 'Custom' ? customExercise.trim() || 'Custom Lift' : exercise;
    const newWorkout = {
      id: `w-${Date.now()}`,
      date: 'Just now',
      exercise: finalExercise,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
      rpe: Number(rpe),
      notes: notes.trim(),
    };

    const nextWorkouts = [newWorkout, ...workouts];
    setWorkouts(nextWorkouts);
    saveStoredWorkouts(nextWorkouts);

    // Real backend workout sync
    if (authToken) {
      fetch('/api/dashboard/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newWorkout),
      }).catch(() => {});
    }

    addXP(30, e.currentTarget);
    setIsAddingWorkout(false);
    setNotes('');
  };

  const handleDeleteWorkout = (id) => {
    const next = workouts.filter((w) => w.id !== id);
    setWorkouts(next);
    saveStoredWorkouts(next);
  };

  const handleUpdatePR = (key) => {
    if (!newPRValue) {
      setEditingPRKey(null);
      return;
    }
    const updated = {
      ...prs,
      [key]: {
        ...prs[key],
        value: isNaN(newPRValue) ? newPRValue : Number(newPRValue),
        date: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      },
    };
    setPRs(updated);
    saveStoredPRs(updated);
    addXP(100);
    burst(window.innerWidth / 2, window.innerHeight / 2, 40);
    setEditingPRKey(null);
    setNewPRValue('');
  };

  const expiryMeta = getPackageExpiryMeta(activeMember.expiryDate || activeMember.package?.endDate);

  return (
    <div className="dashboard-container">
      {/* Cloud Authentication Notice */}
      {!isAuthenticated ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1.25rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span>☁️</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>
              <strong>Guest Athlete Mode</strong> — Sign in or create an account to sync your PRs & attendance to the Tri-Star cloud database.
            </span>
          </div>
          <button
            type="button"
            className="btn-solid-min"
            onClick={() => openAuthModal('login', 'user')}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
          >
            Sign In / Register
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(20, 160, 90, 0.08)',
            border: '1px solid var(--plate-green)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 1.15rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ color: 'var(--plate-green)', fontWeight: 800 }}>✓</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>
              Connected to Tri-Star Cloud as <strong>{authUser.name}</strong> ({authUser.email}) •{' '}
              <span className="branch-tag-pill" style={{ marginLeft: '0.25rem' }}>
                {authUser.branch === 'manik_bagh' ? '📍 Manik Bagh' : '📍 Sapna Sangeeta'}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="minimal-topbar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-indicator-dot"></span>
            <span className="minimal-caption">MEMBER ATHLETE PORTAL</span>
          </div>
          <h1 className="minimal-heading">Athlete Performance Dashboard</h1>
          <p className="minimal-sub">
            Track your conditioning, daily attendance check-ins, and progressive overload records at Tri-Star.
          </p>
        </div>

        <div className="minimal-top-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Athlete:
            </span>
            <select
              className="minimal-select"
              value={activeMember.id}
              onChange={(e) => handleMemberChange(e.target.value)}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.plan})
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="minimal-btn-secondary" onClick={onNavigateToWebsite}>
            ← Back to Site
          </button>
        </div>
      </div>

      {/* Member Profile Banner (Minimal) */}
      <div className="minimal-card" style={{ marginBottom: '1.5rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="minimal-avatar" style={{ width: '52px', height: '52px', fontSize: '1.5rem' }}>
              {activeMember.avatar || activeMember.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: 'var(--ink)' }}>
                  {activeMember.name}
                </h2>
                <span className={`status-pill-${expiryMeta.status}`}>
                  {activeMember.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                ID: <strong>{activeMember.id}</strong> • Coach: {activeMember.assignedCoach || 'Coach Mohit'} • Blood: {activeMember.bloodGroup || 'B+'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <div className="dossier-label-min">Active Subscription</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>{activeMember.plan}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Valid until {activeMember.expiryDate}</div>
            </div>
            <div>
              <div className="dossier-label-min">Consecutive Streak</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--plate-red)' }}>🔥 {streakCount} Days</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Daily discipline</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Daily Check-In & PR Vault */}
      <div className="minimal-two-col">
        {/* Daily Attendance Card */}
        <div className="minimal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span className="minimal-caption">FLOOR ACCESS</span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>Daily Attendance Check-In</h3>
            </div>
            <span className="trend-tag-green">🔥 {streakCount} Days Streak</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.45 }}>
            Check in each time you step on the turf. Earn +50 XP and safeguard your workout streak.
          </p>

          <div style={{ margin: '1.25rem 0' }}>
            <button
              type="button"
              className={hasCheckedInToday ? 'minimal-btn-secondary' : 'minimal-btn-primary'}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
              onClick={handleDailyCheckIn}
              disabled={hasCheckedInToday}
            >
              {hasCheckedInToday
                ? `✓ Checked In Today! (Streak: ${streakCount} Days)`
                : `⚡ Check In Today (+50 XP)`}
            </button>
          </div>

          {/* 7-Day Attendance Week Indicator */}
          <div className="attendance-week-strip">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className="attendance-day-box">
                <span className="day-name">{day}</span>
                <span
                  className={`day-circle ${
                    idx < (streakCount % 7 || 5) || hasCheckedInToday ? 'active' : ''
                  }`}
                  style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
                >
                  {idx < (streakCount % 7 || 5) || hasCheckedInToday ? '✓' : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PR Vault Card */}
        <div className="minimal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span className="minimal-caption">BENCHMARKS</span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>Personal Records (PRs)</h3>
            </div>
            <span className="tag-outline">Verified</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.45 }}>
            Your personal bests recorded on calibrated equipment under coach supervision.
          </p>

          <div className="prs-grid" style={{ marginTop: '1rem' }}>
            {Object.entries(prs).map(([key, item]) => (
              <div key={key} className="minimal-card" style={{ padding: '0.85rem 1rem', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="dossier-label-min">{item.label}</span>
                  <button
                    type="button"
                    className="minimal-btn-ghost"
                    onClick={() => {
                      setEditingPRKey(key);
                      setNewPRValue(item.value);
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.2rem 0' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 900 }}>
                    {item.value}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                    {item.unit}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Logged {item.date}</div>
              </div>
            ))}
          </div>

          {editingPRKey && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Update PR for {prs[editingPRKey]?.label}:</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                <input
                  type="text"
                  className="minimal-input"
                  style={{ width: '100px' }}
                  value={newPRValue}
                  onChange={(e) => setNewPRValue(e.target.value)}
                  placeholder="e.g. 150"
                  autoFocus
                />
                <button
                  type="button"
                  className="minimal-btn-primary"
                  onClick={() => handleUpdatePR(editingPRKey)}
                >
                  Save (+100 XP)
                </button>
                <button
                  type="button"
                  className="minimal-btn-secondary"
                  onClick={() => setEditingPRKey(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workout Logger Section */}
      <div className="minimal-card" style={{ marginTop: '1.5rem' }}>
        <div className="minimal-card-header">
          <div>
            <span className="minimal-caption">PROGRESSIVE OVERLOAD</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Training Session Log</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
              Record working volume, track load increases, and maintain progressive overload proof.
            </p>
          </div>

          <button
            type="button"
            className="minimal-btn-primary"
            onClick={() => setIsAddingWorkout(!isAddingWorkout)}
          >
            {isAddingWorkout ? '✕ Close Logger' : '+ Log Workout Reps'}
          </button>
        </div>

        {/* Workout Form Drawer */}
        {isAddingWorkout && (
          <form className="minimal-form-drawer" onSubmit={handleSaveWorkout}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              Record Set Volume
            </h4>

            <div className="minimal-form-grid">
              <div className="minimal-form-group">
                <label className="minimal-form-label">Exercise Movement</label>
                <select
                  className="minimal-select"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                >
                  <option value="Barbell Deadlift">Barbell Deadlift</option>
                  <option value="Barbell Bench Press">Barbell Bench Press</option>
                  <option value="Barbell Back Squat">Barbell Back Squat</option>
                  <option value="HYROX Sled Push">HYROX Sled Push</option>
                  <option value="Concept2 SkiErg">Concept2 SkiErg</option>
                  <option value="Weighted Pull-ups">Weighted Pull-ups</option>
                  <option value="Dumbbell Overhead Press">Dumbbell Overhead Press</option>
                  <option value="Custom">Custom Exercise...</option>
                </select>
              </div>

              {exercise === 'Custom' && (
                <div className="minimal-form-group">
                  <label className="minimal-form-label">Custom Movement</label>
                  <input
                    type="text"
                    className="minimal-input"
                    value={customExercise}
                    onChange={(e) => setCustomExercise(e.target.value)}
                    placeholder="e.g. Romanian Deadlift"
                    required
                  />
                </div>
              )}

              <div className="minimal-form-group">
                <label className="minimal-form-label">Working Sets</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="minimal-input"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  required
                />
              </div>

              <div className="minimal-form-group">
                <label className="minimal-form-label">Reps per Set</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="minimal-input"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  required
                />
              </div>

              <div className="minimal-form-group">
                <label className="minimal-form-label">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="minimal-input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>

              <div className="minimal-form-group">
                <label className="minimal-form-label">RPE Exertion (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  className="minimal-input"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="minimal-form-group" style={{ marginTop: '0.75rem' }}>
              <label className="minimal-form-label">Technique Notes (optional)</label>
              <input
                type="text"
                className="minimal-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. explosive bar speed, paused 2-sec at bottom"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="minimal-btn-primary">
                Save & Claim +30 XP
              </button>
              <button
                type="button"
                className="minimal-btn-secondary"
                onClick={() => setIsAddingWorkout(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Minimal Table */}
        <div className="table-responsive" style={{ marginTop: '0.75rem' }}>
          <table className="minimal-table">
            <thead>
              <tr>
                <th>Logged</th>
                <th>Movement</th>
                <th>Volume</th>
                <th>Load</th>
                <th>RPE</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {workouts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                    No workouts logged yet. Click "+ Log Workout Reps" above!
                  </td>
                </tr>
              ) : (
                workouts.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{w.date}</td>
                    <td><strong>{w.exercise}</strong></td>
                    <td>{w.sets} sets × {w.reps} reps</td>
                    <td><span className="tag-outline">{w.weight} kg</span></td>
                    <td><span style={{ fontSize: '0.78rem', fontWeight: 700 }}>RPE {w.rpe}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{w.notes || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="minimal-action-btn-danger"
                        onClick={() => handleDeleteWorkout(w.id)}
                        aria-label="Delete set"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
