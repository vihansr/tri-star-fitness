/**
 * Tri-Star Admin / Owner Management Dashboard.
 * Includes:
 * - Local PIN passcode gate (default: 1234)
 * - Member Personal Details tracking (Age, Gender, Blood group, Emergency contact, Medical notes, Assigned coach)
 * - Active Plan & Package End Details tracking (Start date, End date, Days remaining countdown, Payment status)
 * - Detailed Member Dossier Modal (View & Track Profile, Renew package, Edit notes)
 * - Live attendance feed & Equipment maintenance tracker
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
  getPackageExpiryMeta,
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

  // Detailed Member Dossier Modal state
  const [selectedMember, setSelectedMember] = useState(null);
  const [tempAdminNote, setTempAdminNote] = useState('');

  // Add Member Form state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAge, setNewAge] = useState(25);
  const [newGender, setNewGender] = useState('Male');
  const [newBloodGroup, setNewBloodGroup] = useState('B+');
  const [newAddress, setNewAddress] = useState('Indore');
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');
  const [newEmergencyRelation, setNewEmergencyRelation] = useState('Family');
  const [newHealthNotes, setNewHealthNotes] = useState('Cleared for heavy barbell lifts.');
  const [newCoach, setNewCoach] = useState('Coach Mohit (Head Coach)');
  const [newPlan, setNewPlan] = useState('Quarterly Pro');
  const [newDurationMonths, setNewDurationMonths] = useState(3);
  const [newFee, setNewFee] = useState(8500);
  const [newPaymentStatus, setNewPaymentStatus] = useState('Paid');
  const [newPaymentMethod, setNewPaymentMethod] = useState('UPI');

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

  const handleOpenDossier = (member) => {
    setSelectedMember(member);
    setTempAdminNote(member.adminNotes || '');
  };

  const handleCloseDossier = () => {
    setSelectedMember(null);
  };

  const handleSaveDossierNotes = () => {
    if (!selectedMember) return;
    const updated = members.map((m) =>
      m.id === selectedMember.id ? { ...m, adminNotes: tempAdminNote } : m
    );
    setMembers(updated);
    saveStoredMembers(updated);
    setSelectedMember({ ...selectedMember, adminNotes: tempAdminNote });
  };

  const handleExtendPackage = (id, months = 1) => {
    const updated = members.map((m) => {
      if (m.id !== id) return m;
      const currentExp = new Date(m.expiryDate || m.package?.endDate || new Date());
      const baseDate = isNaN(currentExp.getTime()) ? new Date() : currentExp;
      baseDate.setMonth(baseDate.getMonth() + months);
      const newExpiryStr = baseDate.toISOString().split('T')[0];

      const updatedPackage = {
        ...(m.package || {}),
        endDate: newExpiryStr,
        durationMonths: (m.package?.durationMonths || 1) + months,
        paymentStatus: 'Paid',
      };

      const meta = getPackageExpiryMeta(newExpiryStr);

      const modified = {
        ...m,
        expiryDate: newExpiryStr,
        status: meta.status,
        package: updatedPackage,
      };

      if (selectedMember && selectedMember.id === id) {
        setSelectedMember(modified);
      }
      return modified;
    });

    setMembers(updated);
    saveStoredMembers(updated);
  };

  const handleDeleteMember = (id) => {
    if (!window.confirm('Are you sure you want to remove this member profile?')) return;
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    saveStoredMembers(updated);
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember(null);
    }
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

    const expiryStr = expiry.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const newMember = {
      id: nextId,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      age: Number(newAge),
      gender: newGender,
      bloodGroup: newBloodGroup,
      address: newAddress.trim() || 'Indore',
      emergencyContact: {
        name: newEmergencyName.trim() || 'Family Contact',
        phone: newEmergencyPhone.trim() || newPhone.trim(),
        relation: newEmergencyRelation,
      },
      healthNotes: newHealthNotes.trim() || 'No limitations specified.',
      assignedCoach: newCoach,
      plan: newPlan,
      planAccent: accent,
      joinDate: todayStr,
      expiryDate: expiryStr,
      status: 'active',
      streakDays: 1,
      avatar: newName.charAt(0).toUpperCase(),
      package: {
        tier: newPlan,
        durationMonths: Number(newDurationMonths),
        startDate: todayStr,
        endDate: expiryStr,
        fee: Number(newFee),
        paymentStatus: newPaymentStatus,
        paymentMethod: newPaymentMethod,
        invoiceNumber: `INV-IND-${Math.floor(1000 + Math.random() * 9000)}`,
        includesCoaching: newPlan !== 'Monthly Starter',
        lockerAllocated: newPlan === 'Annual Elite' ? 'VIP Locker' : 'General Locker',
      },
      adminNotes: 'Newly enrolled athlete. Goal: Strength & conditioning.',
    };

    const nextMembers = [newMember, ...members];
    setMembers(nextMembers);
    saveStoredMembers(nextMembers);

    setIsAddingMember(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewEmergencyName('');
    setNewEmergencyPhone('');
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
      m.id.toLowerCase().includes(q) ||
      (m.assignedCoach && m.assignedCoach.toLowerCase().includes(q))
    );
  });

  // Calculate quick KPIs
  const activeCount = members.filter((m) => m.status === 'active').length;
  const expiringCount = members.filter((m) => m.status === 'expiring').length;
  const expiredCount = members.filter((m) => m.status === 'expired').length;
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
            Enter your management security PIN to track member personal details, active packages, end dates, and gym health.
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
            OWNER & DESK CONSOLE
          </span>
          <h1 className="dashboard-heading">Member & Package Management</h1>
          <p className="dashboard-sub">
            Track member personal dossiers, active packages, end date counts, emergency contacts, and renewals.
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
              {members.length} Total Registered
            </span>
          </div>
          <span className="kpi-sub">Active biometric privileges</span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label">Expiring Soon (&le; 7 Days)</span>
          <div className="kpi-val-row">
            <span className="kpi-val" style={{ color: 'var(--plate-yellow)' }}>
              {expiringCount}
            </span>
            <span className="kpi-badge" style={{ background: 'var(--plate-yellow)', color: '#14161b' }}>
              Renewal Due
            </span>
          </div>
          <span className="kpi-sub">Upcoming package renewals</span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label">Expired Packages</span>
          <div className="kpi-val-row">
            <span className="kpi-val" style={{ color: 'var(--plate-red)' }}>
              {expiredCount}
            </span>
            <span className="kpi-badge" style={{ background: 'var(--plate-red)', color: '#fff' }}>
              Access Stopped
            </span>
          </div>
          <span className="kpi-sub">Requires package extension</span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label">Est. Monthly Revenue</span>
          <div className="kpi-val-row">
            <span className="kpi-val">₹{estMonthlyRev}</span>
          </div>
          <span className="kpi-sub">Sapna Sangeeta gym subscriptions</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs-nav">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Member Directory & Package Tracker ({members.length})
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

      {/* TAB 1: MEMBERS WITH TRACKING */}
      {activeTab === 'members' && (
        <div className="dashboard-card" style={{ marginTop: '1.25rem' }}>
          <div className="card-header-flex">
            <div>
              <span className="section-label">ATHLETE DIRECTORY</span>
              <h3 className="card-title">All Members, Active Plans & Package End Dates</h3>
              <p className="card-desc">
                Click <strong>"👁️ Track Profile"</strong> on any athlete to view their complete personal dossier, medical conditions, emergency contacts, and renew packages.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="dashboard-input"
                style={{ width: '240px' }}
                placeholder="Search name, phone, coach, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="btn-solid btn-red"
                onClick={() => setIsAddingMember(!isAddingMember)}
              >
                {isAddingMember ? '✕ Cancel' : '+ Enroll Member'}
              </button>
            </div>
          </div>

          {/* ADD MEMBER FORM (Comprehensive Personal & Package details) */}
          {isAddingMember && (
            <form className="workout-form-card" onSubmit={handleAddMember}>
              <div style={{ borderBottom: '2px solid var(--ink)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', color: 'var(--ink)' }}>
                  Enroll New Athlete & Assign Package
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Record member personal info, assigned coach, health checks, package start & end details.
                </p>
              </div>

              {/* Personal Details */}
              <span className="section-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                1. PERSONAL & CONTACT DETAILS
              </span>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
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
                  <label className="form-label">Phone Number *</label>
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
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    min="14"
                    max="80"
                    className="dashboard-input"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="dashboard-select"
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="dashboard-select"
                    value={newBloodGroup}
                    onChange={(e) => setNewBloodGroup(e.target.value)}
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Emergency Contact & Medical */}
              <span className="section-label" style={{ margin: '1.25rem 0 0.5rem', display: 'block' }}>
                2. EMERGENCY CONTACT & HEALTH
              </span>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    className="dashboard-input"
                    value={newEmergencyName}
                    onChange={(e) => setNewEmergencyName(e.target.value)}
                    placeholder="e.g. Rajesh Mehta (Father)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Phone</label>
                  <input
                    type="tel"
                    className="dashboard-input"
                    value={newEmergencyPhone}
                    onChange={(e) => setNewEmergencyPhone(e.target.value)}
                    placeholder="+91 98260 11002"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Coach</label>
                  <select
                    className="dashboard-select"
                    value={newCoach}
                    onChange={(e) => setNewCoach(e.target.value)}
                  >
                    <option value="Coach Mohit (Head Coach)">Coach Mohit (Head Coach)</option>
                    <option value="Coach Pooja (Functional Lead)">Coach Pooja (Functional Lead)</option>
                    <option value="Coach Rahul (Strength Specialist)">Coach Rahul (Strength Specialist)</option>
                    <option value="General Floor Supervision">General Floor Supervision</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Medical & Injury Notes</label>
                  <input
                    type="text"
                    className="dashboard-input"
                    value={newHealthNotes}
                    onChange={(e) => setNewHealthNotes(e.target.value)}
                    placeholder="e.g. Lower back stiffness, Asthmatic, or None"
                  />
                </div>
              </div>

              {/* Package & Payment Details */}
              <span className="section-label" style={{ margin: '1.25rem 0 0.5rem', display: 'block' }}>
                3. ACTIVE PACKAGE & SUBSCRIPTION END DETAILS
              </span>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Package Tier</label>
                  <select
                    className="dashboard-select"
                    value={newPlan}
                    onChange={(e) => {
                      const p = e.target.value;
                      setNewPlan(p);
                      if (p === 'Monthly Starter') {
                        setNewDurationMonths(1);
                        setNewFee(3200);
                      } else if (p === 'Quarterly Pro') {
                        setNewDurationMonths(3);
                        setNewFee(8500);
                      } else if (p === 'Annual Elite') {
                        setNewDurationMonths(12);
                        setNewFee(28000);
                      }
                    }}
                  >
                    <option value="Monthly Starter">Monthly Starter (1 Mo)</option>
                    <option value="Quarterly Pro">Quarterly Pro (3 Mos)</option>
                    <option value="Annual Elite">Annual Elite (12 Mos)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Package Duration (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    className="dashboard-input"
                    value={newDurationMonths}
                    onChange={(e) => setNewDurationMonths(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Package Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="dashboard-input"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select
                    className="dashboard-select"
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Due">Payment Due</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="dashboard-select"
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="NetBanking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn-solid btn-red">
                  Enroll & Activate Package
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
                  <th>Athlete & Personal Details</th>
                  <th>Active Package</th>
                  <th>Package End Details</th>
                  <th>Emergency Contact</th>
                  <th style={{ textAlign: 'right' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted)' }}>
                      No members matched your search query.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const expiry = m.expiryDate || m.package?.endDate;
                    const meta = getPackageExpiryMeta(expiry);
                    return (
                      <tr key={m.id}>
                        <td>
                          <code>{m.id}</code>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="table-avatar">{m.avatar || m.name.charAt(0)}</span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>
                                {m.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                                {m.gender || 'Athlete'} • {m.age ? `${m.age} yrs` : ''} • Blood: {m.bloodGroup || 'O+'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--ink)' }}>
                                📞 {m.phone}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--plate-blue)', fontWeight: 600 }}>
                                Coach: {m.assignedCoach || 'Coach Mohit'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span
                              className="badge-tag"
                              style={{
                                background: m.planAccent || 'var(--plate-blue)',
                                color: m.plan === 'Annual Elite' ? '#14161b' : '#fff',
                              }}
                            >
                              {m.plan}
                            </span>
                            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 700 }}>
                              ₹{m.package?.fee ? m.package.fee.toLocaleString('en-IN') : '8,500'}{' '}
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: m.package?.paymentStatus === 'Paid' ? 'var(--plate-green)' : 'var(--plate-red)',
                                }}
                              >
                                ({m.package?.paymentStatus || 'Paid'})
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              Joined: {m.joinDate}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                              🗓️ {expiry}
                            </div>
                            <div style={{ marginTop: '0.2rem' }}>
                              <span
                                className={`member-status-pill status-${meta.status}`}
                              >
                                {meta.label}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                              Duration: {m.package?.durationMonths || 3} Months
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem' }}>
                            <div style={{ fontWeight: 700 }}>
                              {m.emergencyContact?.name || 'Emergency Contact'}
                            </div>
                            <div style={{ color: 'var(--plate-red)', fontWeight: 600 }}>
                              📞 {m.emergencyContact?.phone || m.phone}
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-table-action"
                              style={{ background: 'var(--plate-blue)', color: '#fff', border: 'none' }}
                              title="View full personal details & package dossier"
                              onClick={() => handleOpenDossier(m)}
                            >
                              👁️ Track Profile
                            </button>
                            <button
                              type="button"
                              className="btn-table-action"
                              title="Extend package by +1 month"
                              onClick={() => handleExtendPackage(m.id, 1)}
                            >
                              +1 Mo
                            </button>
                            <button
                              type="button"
                              className="btn-table-action btn-delete-action"
                              title="Remove member"
                              onClick={() => handleDeleteMember(m.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MEMBER DOSSIER / FULL TRACKING MODAL */}
      {selectedMember && (
        <div className="dossier-modal-backdrop" onClick={handleCloseDossier}>
          <div className="dossier-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="dossier-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="member-avatar" style={{ width: '56px', height: '56px', fontSize: '1.8rem' }}>
                  {selectedMember.avatar || selectedMember.name.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--ink)' }}>
                      {selectedMember.name}
                    </h3>
                    <span
                      className={`member-status-pill status-${
                        getPackageExpiryMeta(selectedMember.expiryDate || selectedMember.package?.endDate).status
                      }`}
                    >
                      {selectedMember.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Member ID: <strong>{selectedMember.id}</strong> • Joined: {selectedMember.joinDate} • Current Streak: 🔥 {selectedMember.streakDays || 1} Days
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a
                  href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                    selectedMember.name
                  )},%20this%20is%20Tri-Star%20Fitness%20Indore.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-solid btn-green"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                >
                  💬 WhatsApp
                </a>
                <button
                  type="button"
                  className="btn-action-delete"
                  style={{ fontSize: '1.2rem', padding: '0.2rem 0.6rem' }}
                  onClick={handleCloseDossier}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="dossier-modal-body">
              {/* SECTION A: Personal & Medical Details */}
              <div className="dossier-section-card">
                <span className="section-label">ATHLETE PERSONAL & MEDICAL DOSSIER</span>
                <div className="dossier-grid">
                  <div className="dossier-item">
                    <span className="dossier-label">Age & Gender</span>
                    <span className="dossier-val">{selectedMember.age || 26} Years • {selectedMember.gender || 'Male'}</span>
                  </div>
                  <div className="dossier-item">
                    <span className="dossier-label">Blood Group</span>
                    <span className="dossier-val">{selectedMember.bloodGroup || 'B+'}</span>
                  </div>
                  <div className="dossier-item">
                    <span className="dossier-label">Phone & Email</span>
                    <span className="dossier-val">{selectedMember.phone}</span>
                    <span className="dossier-sub">{selectedMember.email}</span>
                  </div>
                  <div className="dossier-item">
                    <span className="dossier-label">Residential Address</span>
                    <span className="dossier-val">{selectedMember.address || 'Indore, MP'}</span>
                  </div>
                  <div className="dossier-item">
                    <span className="dossier-label">Emergency Contact</span>
                    <span className="dossier-val" style={{ color: 'var(--plate-red)', fontWeight: 800 }}>
                      📞 {selectedMember.emergencyContact?.phone || selectedMember.phone}
                    </span>
                    <span className="dossier-sub">{selectedMember.emergencyContact?.name || 'Primary Contact'}</span>
                  </div>
                  <div className="dossier-item">
                    <span className="dossier-label">Assigned Coach</span>
                    <span className="dossier-val" style={{ color: 'var(--plate-blue)', fontWeight: 800 }}>
                      🏋️ {selectedMember.assignedCoach || 'Coach Mohit (Head Coach)'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', background: 'var(--card)', padding: '0.75rem 1rem', border: '1px solid var(--line)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', display: 'block' }}>
                    Health & Injury Protocol
                  </span>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink)', marginTop: '0.2rem' }}>
                    {selectedMember.healthNotes || 'No cardiovascular, joint, or respiratory limitations recorded.'}
                  </p>
                </div>
              </div>

              {/* SECTION B: Active Package & Expiry Details */}
              <div className="dossier-section-card" style={{ borderColor: 'var(--plate-yellow)' }}>
                <span className="section-label" style={{ color: 'var(--plate-yellow)' }}>
                  ACTIVE PACKAGE & EXPIRATION TRACKING
                </span>

                {(() => {
                  const expiry = selectedMember.expiryDate || selectedMember.package?.endDate;
                  const meta = getPackageExpiryMeta(expiry);
                  return (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div className="package-banner-box">
                        <div>
                          <span className="badge-tag" style={{ background: selectedMember.planAccent || 'var(--plate-red)', color: '#fff' }}>
                            {selectedMember.plan}
                          </span>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginTop: '0.25rem' }}>
                            {selectedMember.package?.durationMonths || 3} Months Subscription
                          </h4>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className={`member-status-pill status-${meta.status}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                            {meta.label}
                          </span>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                            Package End Date: <strong>{expiry}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="dossier-grid" style={{ marginTop: '0.85rem' }}>
                        <div className="dossier-item">
                          <span className="dossier-label">Package Fee</span>
                          <span className="dossier-val">₹{selectedMember.package?.fee ? selectedMember.package.fee.toLocaleString('en-IN') : '8,500'}</span>
                          <span className="dossier-sub">Status: {selectedMember.package?.paymentStatus || 'Paid'}</span>
                        </div>
                        <div className="dossier-item">
                          <span className="dossier-label">Payment Mode</span>
                          <span className="dossier-val">{selectedMember.package?.paymentMethod || 'UPI (GPay)'}</span>
                          <span className="dossier-sub">{selectedMember.package?.invoiceNumber || 'INV-2026'}</span>
                        </div>
                        <div className="dossier-item">
                          <span className="dossier-label">Locker Facility</span>
                          <span className="dossier-val">{selectedMember.package?.lockerAllocated || 'Locker #14'}</span>
                        </div>
                        <div className="dossier-item">
                          <span className="dossier-label">Package Privileges</span>
                          <span className="dossier-val" style={{ color: 'var(--plate-green)', fontSize: '0.88rem' }}>
                            ✓ HYROX Turf + Free Weights + Coach Review
                          </span>
                        </div>
                      </div>

                      {/* Instant Package Extension Buttons */}
                      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--line)', paddingTop: '0.85rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
                          Extend / Renew Package:
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn-solid btn-blue"
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                            onClick={() => handleExtendPackage(selectedMember.id, 1)}
                          >
                            +1 Month (₹3,200)
                          </button>
                          <button
                            type="button"
                            className="btn-solid btn-red"
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                            onClick={() => handleExtendPackage(selectedMember.id, 3)}
                          >
                            +3 Months (Quarterly Pro)
                          </button>
                          <button
                            type="button"
                            className="btn-solid btn-outline"
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                            onClick={() => handleExtendPackage(selectedMember.id, 12)}
                          >
                            +12 Months (Annual Elite)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SECTION C: Owner / Coach Private Notes */}
              <div className="dossier-section-card">
                <span className="section-label">COACH & DESK NOTES</span>
                <textarea
                  className="dashboard-input"
                  rows="3"
                  style={{ width: '100%', marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
                  value={tempAdminNote}
                  onChange={(e) => setTempAdminNote(e.target.value)}
                  placeholder="Add goals, medical precautions, or attendance notes..."
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-solid btn-outline"
                    style={{ padding: '0.4rem 0.95rem', fontSize: '0.85rem' }}
                    onClick={handleSaveDossierNotes}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
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
