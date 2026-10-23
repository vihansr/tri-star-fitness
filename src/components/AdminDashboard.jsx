/**
 * Admin Dashboard component.
 * Features:
 * - Local PIN passcode gate (default: 1234)
 * - Member management (view, search, add member, extend membership, delete)
 * - Live attendance check-in feed
 * - Equipment maintenance tracker
 * - Gym KPIs (Active members, revenue, check-in count)
 */
import { useState } from 'react';
import {
  getStoredMembers,
  saveStoredMembers,
  getAttendanceLogs,
  recordCheckIn,
  getEquipmentStatus,
  saveEquipmentStatus,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from '../lib/dashboardStorage.js';

export default function AdminDashboard({ onNavigateToWebsite }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminAuthenticated());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Data state
  const [members, setMembers] = useState(() => getStoredMembers());
  const [attendance, setAttendance] = useState(() => getAttendanceLogs());
  const [equipment, setEquipment] = useState(() => getEquipmentStatus());
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'attendance' | 'equipment'
  const [searchQuery, setSearchQuery] = useState('');

  // Add Member Form state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlan, setNewPlan] = useState('Quarterly Pro');
  const [newDurationMonths, setNewDurationMonths] = useState(3);

  // Manual Check-in state
  const [manualMemberId, setManualMemberId] = useState(members[0]?.id || '');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setAdminAuthenticated(true);
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. (Default is 1234)');
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
    setPinInput('');
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const today = new Date();
    const expiry = new Date();
    expiry.setMonth(today.getMonth() + Number(newDurationMonths));

    const nextId = `TS-${String(members.length + 1).padStart(3, '0')}`;
    const accent =
      newPlan === 'Annual Elite'
        ? 'var(--plate-yellow)'
        : newPlan === 'Quarterly Pro'
        ? 'var(--plate-red)'
        : 'var(--plate-blue)';

    const newMember = {
      id: nextId,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      plan: newPlan,
      planAccent: accent,
      joinDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      status: 'active',
      streakDays: 1,
      avatar: newName.charAt(0).toUpperCase(),
    };

    const nextMembers = [newMember, ...members];
    setMembers(nextMembers);
    saveStoredMembers(nextMembers);

    setIsAddingMember(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  const handleExtendMember = (id, months = 1) => {
    const updated = members.map((m) => {
      if (m.id !== id) return m;
      const currentExp = new Date(m.expiryDate);
      const baseDate = isNaN(currentExp.getTime()) ? new Date() : currentExp;
      baseDate.setMonth(baseDate.getMonth() + months);
      return {
        ...m,
        expiryDate: baseDate.toISOString().split('T')[0],
        status: 'active',
      };
    });
    setMembers(updated);
    saveStoredMembers(updated);
  };

  const handleDeleteMember = (id) => {
    if (!window.confirm('Are you sure you want to remove this member profile?')) return;
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    saveStoredMembers(updated);
  };

  const handleManualCheckIn = () => {
    const mem = members.find((m) => m.id === manualMemberId);
    if (!mem) return;
    const updatedLogs = recordCheckIn(mem.name, mem.plan);
    setAttendance(updatedLogs);
  };

  const handleToggleEquipment = (id) => {
    const updated = equipment.map((eq) => {
      if (eq.id !== id) return eq;
      const statuses = ['Optimal', 'Servicing Scheduled', 'Under Repair'];
      const currentIdx = statuses.indexOf(eq.status);
      const nextStatus = statuses[(currentIdx + 1) % statuses.length];
      const accent =
        nextStatus === 'Optimal'
          ? 'var(--plate-green)'
          : nextStatus === 'Servicing Scheduled'
          ? 'var(--plate-yellow)'
          : 'var(--plate-red)';
      return { ...eq, status: nextStatus, accent };
    });
    setEquipment(updated);
    saveEquipmentStatus(updated);
  };

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      m.plan.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    );
  });

  // Calculate quick KPIs
  const activeCount = members.filter((m) => m.status === 'active').length;
  const expiringCount = members.filter((m) => m.status === 'expiring').length;
  const estMonthlyRev = (activeCount * 2800).toLocaleString('en-IN');

  // If locked, render PIN Gate
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container" style={{ maxWidth: '520px', marginTop: '4rem' }}>
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div className="admin-lock-icon" aria-hidden="true">
            🛡️
          </div>
          <span className="badge-tag" style={{ background: 'var(--plate-red)', color: '#fff', margin: '0 auto 0.75rem' }}>
            SECURE ACCESS
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            Tri-Star Admin Portal
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Please enter your management security PIN to access member rosters, revenue reports, and facility tools.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                maxLength="6"
                className="dashboard-input"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4em', maxWidth: '240px', margin: '0 auto' }}
                placeholder="••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                autoFocus
              />
              {pinError && <p style={{ color: 'var(--plate-red)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{pinError}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '280px', margin: '0 auto' }}>
              <button type="submit" className="btn-solid btn-red" style={{ justifyContent: 'center' }}>
                Unlock Dashboard
              </button>
              <button
                type="button"
                className="btn-solid btn-outline"
                style={{ justifyContent: 'center', fontSize: '0.85rem' }}
                onClick={() => setPinInput('1234')}
              >
                Auto-fill default PIN: 1234
              </button>
              <button
                type="button"
                className="btn-solid btn-outline"
                style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                onClick={onNavigateToWebsite}
              >
                ← Back to Main Website
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <div className="dashboard-topbar">
        <div className="dashboard-header-title">
          <span className="badge-tag" style={{ background: 'var(--plate-red)', color: '#fff' }}>
            GYM MANAGEMENT
          </span>
          <h1 className="dashboard-heading">Tri-Star Command Center</h1>
          <p className="dashboard-sub">
            Indore Sapna Sangeeta Facility • Member Administration & Real-Time Desk
          </p>
        </div>

        <div className="dashboard-top-actions">
          <button
            type="button"
            className="btn-solid btn-outline"
            onClick={onNavigateToWebsite}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
          >
            🌐 View Website
          </button>
          <button
            type="button"
            className="btn-solid btn-red"
            onClick={handleLogout}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
          >
            🔒 Lock Admin
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <span className="kpi-label">Active Members</span>
          <div className="kpi-val-row">
            <span className="kpi-val">{activeCount}</span>
            <span className="kpi-badge" style={{ background: 'var(--plate-green)', color: '#fff' }}>
              +8 this month
            </span>
          </div>
          <span className="kpi-sub">Total registered athletes</span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label">Today's Check-Ins</span>
          <div className="kpi-val-row">
            <span className="kpi-val">{attendance.length}</span>
            <span className="kpi-badge" style={{ background: 'var(--plate-blue)', color: '#fff' }}>
              Turf peak
            </span>
          </div>
          <span className="kpi-sub">Desk & App verifications</span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label">Est. Monthly Revenue</span>
          <div className="kpi-val-row">
            <span className="kpi-val">₹{estMonthlyRev}</span>
          </div>
          <span className="kpi-sub">Pro, Starter & Elite tiers</span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label">Expiring Soon (&lt; 7 Days)</span>
          <div className="kpi-val-row">
            <span className="kpi-val" style={{ color: 'var(--plate-yellow)' }}>
              {expiringCount}
            </span>
            <span className="kpi-badge" style={{ background: 'var(--plate-yellow)', color: '#14161b' }}>
              Action needed
            </span>
          </div>
          <span className="kpi-sub">Requires renewal WhatsApp</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="admin-tabs-nav">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Member Roster ({members.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          ⏱️ Live Attendance Stream ({attendance.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          🏋️ Equipment Health ({equipment.length})
        </button>
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === 'members' && (
        <div className="dashboard-card" style={{ marginTop: '1.25rem' }}>
          <div className="card-header-flex">
            <div>
              <span className="section-label">DIRECTORY</span>
              <h3 className="card-title">Member Database</h3>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                className="dashboard-input"
                style={{ width: '220px' }}
                placeholder="Search name, phone, plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="btn-solid btn-red"
                onClick={() => setIsAddingMember(!isAddingMember)}
              >
                {isAddingMember ? '✕ Cancel' : '+ Add New Member'}
              </button>
            </div>
          </div>

          {/* Add Member Form Drawer */}
          {isAddingMember && (
            <form className="workout-form-card" onSubmit={handleAddMember}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                Enroll New Member
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="dashboard-input"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Varun Mehta"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="dashboard-input"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +91 98260 99887"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="dashboard-input"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. varun@gmail.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Membership Tier</label>
                  <select
                    className="dashboard-select"
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                  >
                    <option value="Monthly Starter">Monthly Starter</option>
                    <option value="Quarterly Pro">Quarterly Pro</option>
                    <option value="Annual Elite">Annual Elite</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Plan Duration (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    className="dashboard-input"
                    value={newDurationMonths}
                    onChange={(e) => setNewDurationMonths(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-solid btn-red">
                  Enroll & Activate Member
                </button>
                <button
                  type="button"
                  className="btn-solid btn-outline"
                  onClick={() => setIsAddingMember(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="table-responsive" style={{ marginTop: '1.25rem' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Athlete Name</th>
                  <th>Contact Info</th>
                  <th>Current Plan</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      No members matched your search.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <code>{m.id}</code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span className="table-avatar">{m.avatar || m.name.charAt(0)}</span>
                          <strong>{m.name}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <div>{m.phone}</div>
                          <div style={{ color: 'var(--muted)' }}>{m.email}</div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge-tag"
                          style={{
                            background: m.planAccent || 'var(--plate-blue)',
                            color: m.plan === 'Annual Elite' ? '#14161b' : '#fff',
                          }}
                        >
                          {m.plan}
                        </span>
                      </td>
                      <td>{m.expiryDate}</td>
                      <td>
                        <span
                          className={`member-status-pill status-${m.status}`}
                        >
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-table-action"
                            title="Extend 1 month"
                            onClick={() => handleExtendMember(m.id, 1)}
                          >
                            +1 Mo
                          </button>
                          <button
                            type="button"
                            className="btn-table-action btn-delete-action"
                            title="Delete member"
                            onClick={() => handleDeleteMember(m.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="dashboard-card" style={{ marginTop: '1.25rem' }}>
          <div className="card-header-flex">
            <div>
              <span className="section-label">FRONT DESK STREAM</span>
              <h3 className="card-title">Real-Time Check-In Stream</h3>
              <p className="card-desc" style={{ marginTop: '0.25rem' }}>
                Monitors members checking in on the floor and allows instant front desk verification.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="dashboard-select"
                value={manualMemberId}
                onChange={(e) => setManualMemberId(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.id})
                  </option>
                ))}
              </select>
              <button type="button" className="btn-solid btn-green" onClick={handleManualCheckIn}>
                + Desk Check-In
              </button>
            </div>
          </div>

          <div className="table-responsive" style={{ marginTop: '1.25rem' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Member Name</th>
                  <th>Plan Tier</th>
                  <th>Access Verification</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="log-time">{entry.time}</span>
                    </td>
                    <td>
                      <strong>{entry.memberName}</strong>
                    </td>
                    <td>
                      <span className="badge-tag" style={{ background: 'var(--plate-blue)', color: '#fff' }}>
                        {entry.plan}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--plate-green)', fontWeight: 700 }}>
                        ✓ Biometric / App Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EQUIPMENT HEALTH */}
      {activeTab === 'equipment' && (
        <div className="dashboard-card" style={{ marginTop: '1.25rem' }}>
          <div className="card-header-flex">
            <div>
              <span className="section-label">FACILITY ASSETS</span>
              <h3 className="card-title">Equipment Condition & Maintenance</h3>
              <p className="card-desc" style={{ marginTop: '0.25rem' }}>
                Click any equipment item to cycle status between Optimal, Servicing, and Repair.
              </p>
            </div>
          </div>

          <div className="equipment-status-grid" style={{ marginTop: '1.25rem' }}>
            {equipment.map((item) => (
              <div
                key={item.id}
                className="equipment-status-card"
                onClick={() => handleToggleEquipment(item.id)}
                title="Click to cycle status"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--ink)' }}>
                    {item.name}
                  </h4>
                  <span
                    className="badge-tag"
                    style={{ background: item.accent || 'var(--plate-green)', color: '#fff' }}
                  >
                    {item.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                  Click to toggle: Optimal ➜ Scheduled ➜ Repair
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
