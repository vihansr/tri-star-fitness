/**
 * Member / Client Dashboard component.
 * Allows gym members to track workouts, check in daily, view attendance streak,
 * manage PR records, and view their active membership plan.
 */
import { useState } from 'react';
import { useGameState } from '../context/GameStateContext.jsx';
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
} from '../lib/dashboardStorage.js';

export default function ClientDashboard({ onNavigateToWebsite }) {
  const { addXP } = useGameState();
  const [members, setMembers] = useState(() => getStoredMembers());
  const [activeMember, setActiveMemberState] = useState(() => getActiveMember());
  const [workouts, setWorkouts] = useState(() => getStoredWorkouts());
  const [prs, setPRs] = useState(() => getStoredPRs());

  // Check-in state
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [streakCount, setStreakCount] = useState(activeMember.streakDays || 14);

  // New Workout Form state
  const [exercise, setExercise] = useState('Barbell Deadlift');
  const [customExercise, setCustomExercise] = useState('');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(6);
  const [weight, setWeight] = useState(100);
  const [rpe, setRpe] = useState(8);
  const [notes, setNotes] = useState('');
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);

  // PR edit modal / state
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

  return (
    <div className="dashboard-container">
      {/* Top Banner / Breadcrumb */}
      <div className="dashboard-topbar">
        <div className="dashboard-header-title">
          <span className="badge-tag" style={{ background: 'var(--plate-blue)', color: '#fff' }}>
            MEMBER PORTAL
          </span>
          <h1 className="dashboard-heading">Athlete Dashboard</h1>
          <p className="dashboard-sub">
            Track your conditioning, daily attendance, and progressive overload records at Tri-Star.
          </p>
        </div>

        <div className="dashboard-top-actions">
          <div className="member-switcher">
            <label htmlFor="member-select" className="switcher-label">Active Member:</label>
            <select
              id="member-select"
              className="dashboard-select"
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

          <button
            type="button"
            className="btn-solid btn-outline"
            onClick={onNavigateToWebsite}
            style={{ padding: '0.45rem 1rem', fontSize: '0.9rem' }}
          >
            ← Back to Website
          </button>
        </div>
      </div>

      {/* Member Profile Card & Active Plan */}
      <div className="dashboard-hero-card">
        <div className="member-profile-info">
          <div className="member-avatar">{activeMember.avatar || 'A'}</div>
          <div>
            <div className="member-badge-row">
              <h2 className="member-name">{activeMember.name}</h2>
              <span className="status-badge-active">
                {activeMember.status.toUpperCase()}
              </span>
            </div>
            <p className="member-meta">
              Member ID: <strong>{activeMember.id}</strong> • Phone: {activeMember.phone} • Plan:{' '}
              <span style={{ color: activeMember.planAccent || 'var(--plate-red)', fontWeight: 700 }}>
                {activeMember.plan}
              </span>
            </p>
          </div>
        </div>

        <div className="member-stats-strip">
          <div className="member-stat-box">
            <span className="stat-label">Valid Until</span>
            <span className="stat-val">{activeMember.expiryDate}</span>
            <span className="stat-sub">Sapna Sangeeta Branch</span>
          </div>

          <div className="member-stat-box">
            <span className="stat-label">Training Discipline</span>
            <span className="stat-val">HYROX + Strength</span>
            <span className="stat-sub">Coach Monitored</span>
          </div>

          <div className="member-stat-box">
            <span className="stat-label">Gym Streak</span>
            <span className="stat-val" style={{ color: 'var(--plate-red)' }}>
              🔥 {streakCount} Days
            </span>
            <span className="stat-sub">Active habit</span>
          </div>
        </div>
      </div>

      {/* Grid: Daily Check-in & PR Vault */}
      <div className="dashboard-two-col">
        {/* Daily Attendance Check-In */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <span className="section-label">DAILY ATTENDANCE</span>
              <h3 className="card-title">Gym Check-In</h3>
            </div>
            <span className="streak-pill">🔥 {streakCount} Days Streak</span>
          </div>

          <p className="card-desc">
            Check in whenever you step on the turf. Earn +50 XP and protect your consecutive daily streak.
          </p>

          <div style={{ margin: '1.25rem 0' }}>
            <button
              type="button"
              className={`btn-solid ${hasCheckedInToday ? 'btn-green' : 'btn-red btn-pulse'}`}
              style={{ width: '100%', padding: '0.85rem 1.25rem', fontSize: '1.05rem', justifyContent: 'center' }}
              onClick={handleDailyCheckIn}
              disabled={hasCheckedInToday}
            >
              {hasCheckedInToday
                ? `✓ Checked In Today! (Streak: ${streakCount} Days)`
                : `⚡ Check In Today (+50 XP)`}
            </button>
          </div>

          <div className="attendance-week-strip">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className="attendance-day-box">
                <span className="day-name">{day}</span>
                <span
                  className={`day-circle ${
                    idx < (streakCount % 7 || 5) || hasCheckedInToday ? 'active' : ''
                  }`}
                >
                  {idx < (streakCount % 7 || 5) || hasCheckedInToday ? '✓' : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PR Records Vault */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <span className="section-label">MAX PERFORMANCE</span>
              <h3 className="card-title">Personal Records (PRs)</h3>
            </div>
            <span className="badge-tag" style={{ background: 'var(--plate-yellow)', color: '#14161b' }}>
              Level 1 PRs
            </span>
          </div>

          <p className="card-desc">
            Your personal benchmarks recorded under Tri-Star coaches.
          </p>

          <div className="prs-grid">
            {Object.entries(prs).map(([key, item]) => (
              <div key={key} className="pr-box">
                <div className="pr-header">
                  <span className="pr-label">{item.label}</span>
                  <button
                    type="button"
                    className="pr-edit-link"
                    onClick={() => {
                      setEditingPRKey(key);
                      setNewPRValue(item.value);
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div className="pr-value-row">
                  <span className="pr-num">{item.value}</span>
                  <span className="pr-unit">{item.unit}</span>
                </div>
                <span className="pr-date">Updated {item.date}</span>
              </div>
            ))}
          </div>

          {editingPRKey && (
            <div className="pr-inline-editor">
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Update PR for {prs[editingPRKey]?.label}:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                <input
                  type="text"
                  className="dashboard-input"
                  style={{ width: '120px' }}
                  value={newPRValue}
                  onChange={(e) => setNewPRValue(e.target.value)}
                  placeholder="e.g. 150"
                  autoFocus
                />
                <button
                  type="button"
                  className="btn-solid btn-red"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => handleUpdatePR(editingPRKey)}
                >
                  Save (+100 XP)
                </button>
                <button
                  type="button"
                  className="btn-solid btn-outline"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
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
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header-flex">
          <div>
            <span className="section-label">PROGRESSIVE OVERLOAD</span>
            <h3 className="card-title">Training & Rep Log</h3>
            <p className="card-desc" style={{ marginTop: '0.25rem' }}>
              Record heavy sets, track working volume, and build proof of consistency.
            </p>
          </div>

          <button
            type="button"
            className="btn-solid btn-blue"
            onClick={() => setIsAddingWorkout(!isAddingWorkout)}
          >
            {isAddingWorkout ? '✕ Close Logger' : '+ Log Workout Reps'}
          </button>
        </div>

        {/* Add Workout Form Drawer */}
        {isAddingWorkout && (
          <form className="workout-form-card" onSubmit={handleSaveWorkout}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              Add Set Log
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Exercise Movement</label>
                <select
                  className="dashboard-select"
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
                <div className="form-group">
                  <label className="form-label">Custom Movement Name</label>
                  <input
                    type="text"
                    className="dashboard-input"
                    value={customExercise}
                    onChange={(e) => setCustomExercise(e.target.value)}
                    placeholder="e.g. Bulgarian Split Squat"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Working Sets</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="dashboard-input"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reps per Set</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="dashboard-input"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="dashboard-input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">RPE (Exertion 1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  className="dashboard-input"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.85rem' }}>
              <label className="form-label">Technique Notes (optional)</label>
              <input
                type="text"
                className="dashboard-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. strict lockout, 2-sec eccentric pause on chest"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-solid btn-red">
                Save & Claim +30 XP
              </button>
              <button
                type="button"
                className="btn-solid btn-outline"
                onClick={() => setIsAddingWorkout(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Workout History Table */}
        <div className="table-responsive" style={{ marginTop: '1.25rem' }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Logged When</th>
                <th>Movement</th>
                <th>Volume</th>
                <th>Weight</th>
                <th>RPE</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {workouts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                    No workouts logged yet. Click "+ Log Workout Reps" above to record your first set!
                  </td>
                </tr>
              ) : (
                workouts.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <span className="log-time">{w.date}</span>
                    </td>
                    <td>
                      <strong>{w.exercise}</strong>
                    </td>
                    <td>
                      {w.sets} sets × {w.reps} reps
                    </td>
                    <td>
                      <span className="badge-tag" style={{ background: 'var(--plate-yellow)', color: '#14161b' }}>
                        {w.weight} kg
                      </span>
                    </td>
                    <td>
                      <span className="rpe-pill">RPE {w.rpe}</span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {w.notes || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-action-delete"
                        onClick={() => handleDeleteWorkout(w.id)}
                        aria-label={`Delete workout ${w.exercise}`}
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
