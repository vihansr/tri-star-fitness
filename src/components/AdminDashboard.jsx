/**
 * Tri-Star Admin / Owner Management Dashboard.
 * Multi-Center Operations:
 * - 🌐 Combined (All Centers)
 * - 📍 Sapna Sangeeta (Flagship Center)
 * - 📍 Manik Bagh (South Indore Center)
 *
 * Minimalist, high-performance UI featuring:
 * - Multi-Branch Revenue Model (Subscriptions, 1-on-1 PT Coaching, Nutrition Store)
 * - Operating Expenses Ledger tagged by branch (Trainer Payroll, Rent, Equipment Maintenance, Power/AC)
 * - Net Profit & Margin Analytics by Branch & Combined
 * - Member Personal Details Tracking & Package Expiry Countdown
 * - Member Dossier Modal (Track, WhatsApp, Renew)
 * - Attendance Feed & Equipment Health Monitor
 */
import { useState } from 'react';
import {
  BRANCHES,
  getActiveBranch,
  setActiveBranch,
  getStoredMembers,
  saveStoredMembers,
  getStoredExpenses,
  saveStoredExpenses,
  getStoredRevenueStreams,
  saveStoredRevenueStreams,
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

  // Branch Selection State: 'combined' | 'sapna_sangeeta' | 'manik_bagh'
  const [selectedBranch, setSelectedBranchState] = useState(() => getActiveBranch());

  // Core Data State
  const [members, setMembers] = useState(() => getStoredMembers());
  const [expenses, setExpenses] = useState(() => getStoredExpenses());
  const [revenueStreams, setRevenueStreams] = useState(() => getStoredRevenueStreams());
  const [attendance, setAttendance] = useState(() => getAttendanceLogs());
  const [equipment, setEquipment] = useState(() => getEquipmentStatus());

  // Active Tab
  const [activeTab, setActiveTab] = useState('financials'); // 'financials' | 'members' | 'expenses' | 'attendance' | 'equipment'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form States
  const [selectedMember, setSelectedMember] = useState(null);
  const [tempAdminNote, setTempAdminNote] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // New Expense Form State
  const [expCategory, setExpCategory] = useState('Equipment Maintenance');
  const [expBranch, setExpBranch] = useState('sapna_sangeeta');
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expType, setExpType] = useState('maintenance');
  const [expNotes, setExpNotes] = useState('');

  // New Member Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBranch, setNewBranch] = useState('sapna_sangeeta');
  const [newAge, setNewAge] = useState(26);
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

  // Manual Check-in State
  const [manualMemberId, setManualMemberId] = useState(members[0]?.id || '');

  const handleBranchChange = (branchId) => {
    setSelectedBranchState(branchId);
    setActiveBranch(branchId);
  };

  // Auth Handling
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

  // Dossier Modal
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

  // Package Extension
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

  // Expense Handlers
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expName.trim() || !expAmount) return;

    const branchLabel =
      expBranch === 'sapna_sangeeta'
        ? 'Sapna Sangeeta'
        : expBranch === 'manik_bagh'
        ? 'Manik Bagh'
        : 'Combined (HQ / Shared)';

    const newExp = {
      id: `exp-${Date.now()}`,
      branch: expBranch,
      branchLabel,
      category: expCategory,
      name: expName.trim(),
      amount: Number(expAmount),
      date: 'Oct 2026',
      type: expType,
      notes: expNotes.trim() || 'Logged via Admin Console',
    };

    const nextExpenses = [newExp, ...expenses];
    setExpenses(nextExpenses);
    saveStoredExpenses(nextExpenses);

    setIsAddingExpense(false);
    setExpName('');
    setExpAmount('');
    setExpNotes('');
  };

  const handleDeleteExpense = (id) => {
    const nextExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(nextExpenses);
    saveStoredExpenses(nextExpenses);
  };

  // Member Enrollment
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

    const branchLabel =
      newBranch === 'sapna_sangeeta'
        ? 'Sapna Sangeeta'
        : newBranch === 'manik_bagh'
        ? 'Manik Bagh'
        : 'All-Access (Combined)';

    const newMember = {
      id: nextId,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      age: Number(newAge),
      gender: newGender,
      bloodGroup: newBloodGroup,
      branch: newBranch,
      branchLabel,
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
    const branchName =
      selectedBranch === 'manik_bagh' ? 'Manik Bagh' : 'Sapna Sangeeta';
    const updatedLogs = recordCheckIn(mem.name, mem.plan, branchName);
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

  // --------------------------------------------------------------------------
  // BRANCH FILTERING LOGIC
  // --------------------------------------------------------------------------
  const branchMembers = members.filter((m) => {
    if (selectedBranch === 'combined') return true;
    return m.branch === selectedBranch || m.branch === 'combined';
  });

  const branchExpenses = expenses.filter((e) => {
    if (selectedBranch === 'combined') return true;
    return e.branch === selectedBranch || e.branch === 'combined';
  });

  const branchRevenueStreams = revenueStreams.filter((r) => {
    if (selectedBranch === 'combined') return true;
    return r.branch === selectedBranch || r.branch === 'combined';
  });

  const branchAttendance = attendance.filter((a) => {
    if (selectedBranch === 'combined') return true;
    const targetLabel = selectedBranch === 'manik_bagh' ? 'Manik Bagh' : 'Sapna Sangeeta';
    return !a.branch || a.branch === targetLabel;
  });

  const branchEquipment = equipment.filter((eq) => {
    if (selectedBranch === 'combined') return true;
    return eq.branch === selectedBranch;
  });

  // Filter Members with search query
  const filteredMembers = branchMembers.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      m.plan.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      (m.assignedCoach && m.assignedCoach.toLowerCase().includes(q))
    );
  });

  // Financial Calculations by Selected Branch
  const activeCount = branchMembers.filter((m) => m.status === 'active').length;
  const expiringCount = branchMembers.filter((m) => m.status === 'expiring').length;
  const expiredCount = branchMembers.filter((m) => m.status === 'expired').length;

  // Scale factor based on center
  const memberScaleMultiplier =
    selectedBranch === 'sapna_sangeeta'
      ? 28 // Sapna Sangeeta base (~85 members)
      : selectedBranch === 'manik_bagh'
      ? 18 // Manik Bagh base (~55 members)
      : 46; // Combined (140+ members)

  const membershipMonthlyRevenue = Math.round(
    branchMembers.reduce((sum, m) => {
      const fee = m.package?.fee || 8500;
      const duration = m.package?.durationMonths || 3;
      return sum + fee / duration;
    }, 0) * memberScaleMultiplier
  );

  const additionalRevenue = branchRevenueStreams.reduce((sum, r) => sum + r.amount, 0);
  const totalGrossRevenue = membershipMonthlyRevenue + additionalRevenue;

  // Expenses Calculation
  const totalMonthlyExpenses = branchExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Profit & Margin
  const netProfit = totalGrossRevenue - totalMonthlyExpenses;
  const profitMargin = totalGrossRevenue > 0 ? ((netProfit / totalGrossRevenue) * 100).toFixed(1) : 0;

  // Expenses grouped by category for breakdown
  const expensesByCategory = branchExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  // If locked, render Minimal PIN Gate
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container" style={{ maxWidth: '440px', marginTop: '5rem' }}>
        <div className="minimal-card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>🛡️</div>
          <span className="minimal-badge-red">ADMIN SECURITY</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', margin: '0.5rem 0 0.25rem' }}>
            Tri-Star Console
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
            Enter your management PIN to access facility finances, operating expenses, and multi-center records.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <input
                type="password"
                maxLength="6"
                className="minimal-input"
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.35em', maxWidth: '180px', margin: '0 auto' }}
                placeholder="••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                autoFocus
              />
              {pinError && <p style={{ color: 'var(--plate-red)', fontSize: '0.82rem', marginTop: '0.4rem' }}>{pinError}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button type="submit" className="minimal-btn-primary" style={{ width: '100%' }}>
                Unlock Console
              </button>
              <button
                type="button"
                className="minimal-btn-ghost"
                onClick={() => setPinInput('1234')}
                style={{ fontSize: '0.8rem' }}
              >
                Use default PIN: 1234
              </button>
              <button
                type="button"
                className="minimal-btn-secondary"
                onClick={onNavigateToWebsite}
                style={{ marginTop: '0.5rem' }}
              >
                ← Back to Website
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Minimal Top Header */}
      <div className="minimal-topbar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-indicator-dot"></span>
            <span className="minimal-caption">MULTI-CENTER OPERATIONS</span>
          </div>
          <h1 className="minimal-heading">Management Command Hub</h1>
          <p className="minimal-sub">
            Tri-Star Fitness Indore • Sapna Sangeeta & Manik Bagh Centers • Financial Ledger & Member Tracker
          </p>
        </div>

        <div className="minimal-top-actions">
          <button type="button" className="minimal-btn-secondary" onClick={onNavigateToWebsite}>
            🌐 View Site
          </button>
          <button type="button" className="minimal-btn-danger" onClick={handleLogout}>
            🔒 Lock Console
          </button>
        </div>
      </div>

      {/* BRANCH SELECTOR SEGMENTED CONTROL */}
      <div className="branch-selector-wrapper">
        <span className="branch-selector-label">SELECT CENTER:</span>
        <div className="branch-segmented-pills" role="tablist" aria-label="Gym Center Switcher">
          {BRANCHES.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`branch-pill-btn ${selectedBranch === b.id ? 'active' : ''}`}
              onClick={() => handleBranchChange(b.id)}
              role="tab"
              aria-selected={selectedBranch === b.id}
            >
              <span>{b.icon}</span>
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* High-Level Financial & Operational KPI Row (Filtered by Center) */}
      <div className="minimal-kpi-row">
        {/* Gross Revenue */}
        <div className="minimal-kpi-card">
          <span className="minimal-kpi-label">
            Gross Revenue ({selectedBranch === 'combined' ? 'Both Centers' : selectedBranch === 'sapna_sangeeta' ? 'Sapna Sangeeta' : 'Manik Bagh'})
          </span>
          <div className="minimal-kpi-val" style={{ color: 'var(--ink)' }}>
            ₹{totalGrossRevenue.toLocaleString('en-IN')}
          </div>
          <div className="minimal-kpi-footer">
            <span className="trend-tag-green">▲ Active Subscriptions</span>
            <span className="minimal-muted-text">{branchRevenueStreams.length + 1} Inflow channels</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="minimal-kpi-card">
          <span className="minimal-kpi-label">Operating Expenses</span>
          <div className="minimal-kpi-val" style={{ color: 'var(--plate-red)' }}>
            ₹{totalMonthlyExpenses.toLocaleString('en-IN')}
          </div>
          <div className="minimal-kpi-footer">
            <span className="trend-tag-muted">Payroll, Rent & Equipment</span>
            <span className="minimal-muted-text">{branchExpenses.length} Expense line items</span>
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="minimal-kpi-card">
          <span className="minimal-kpi-label">Net Operating Profit</span>
          <div className="minimal-kpi-val" style={{ color: 'var(--plate-green)' }}>
            ₹{netProfit.toLocaleString('en-IN')}
          </div>
          <div className="minimal-kpi-footer">
            <span className="trend-tag-green">💎 {profitMargin}% Net Margin</span>
            <span className="minimal-muted-text">High liquidity</span>
          </div>
        </div>

        {/* Member Expiry Status */}
        <div className="minimal-kpi-card">
          <span className="minimal-kpi-label">Active Athlete Roster</span>
          <div className="minimal-kpi-val">
            {activeCount} <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--muted)' }}>/ {branchMembers.length}</span>
          </div>
          <div className="minimal-kpi-footer">
            <span className="trend-tag-yellow">⚠️ {expiringCount} Renewal Due</span>
            <span className="minimal-muted-text">{expiredCount} Lapsed</span>
          </div>
        </div>
      </div>

      {/* Minimal Tabs Navigation */}
      <div className="minimal-tabs-bar">
        <button
          type="button"
          className={`minimal-tab-item ${activeTab === 'financials' ? 'active' : ''}`}
          onClick={() => setActiveTab('financials')}
        >
          💰 Revenue & Expense Model
        </button>
        <button
          type="button"
          className={`minimal-tab-item ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Members & Packages ({branchMembers.length})
        </button>
        <button
          type="button"
          className={`minimal-tab-item ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          📉 Operating Expenses Ledger ({branchExpenses.length})
        </button>
        <button
          type="button"
          className={`minimal-tab-item ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          ⏱️ Attendance Feed ({branchAttendance.length})
        </button>
        <button
          type="button"
          className={`minimal-tab-item ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          🏋️ Equipment Health ({branchEquipment.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: REVENUE MODEL & FINANCIAL OVERVIEW (FILTERED BY BRANCH)
          ========================================================================= */}
      {activeTab === 'financials' && (
        <div className="minimal-section">
          {/* Comparison Progress Bar */}
          <div className="minimal-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <span className="minimal-caption">P&L BREAKDOWN</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
                  {selectedBranch === 'combined'
                    ? 'Combined Cashflow Ratio (Both Centers)'
                    : selectedBranch === 'sapna_sangeeta'
                    ? 'Sapna Sangeeta Center Cashflow Ratio'
                    : 'Manik Bagh Center Cashflow Ratio'}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                <span>Inflow: <strong style={{ color: 'var(--ink)' }}>₹{totalGrossRevenue.toLocaleString('en-IN')}</strong></span>
                <span>Outflow: <strong style={{ color: 'var(--plate-red)' }}>₹{totalMonthlyExpenses.toLocaleString('en-IN')}</strong></span>
                <span>Profit: <strong style={{ color: 'var(--plate-green)' }}>+₹{netProfit.toLocaleString('en-IN')} ({profitMargin}%)</strong></span>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="financial-progress-track">
              <div
                className="financial-progress-fill-expense"
                style={{ width: `${Math.min((totalMonthlyExpenses / totalGrossRevenue) * 100, 100)}%` }}
                title={`Operating Expenses: ₹${totalMonthlyExpenses.toLocaleString('en-IN')}`}
              ></div>
              <div
                className="financial-progress-fill-profit"
                style={{ width: `${Math.max(100 - (totalMonthlyExpenses / totalGrossRevenue) * 100, 0)}%` }}
                title={`Net Profit: ₹${netProfit.toLocaleString('en-IN')}`}
              ></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
              <span>■ Operating Costs ({((totalMonthlyExpenses / totalGrossRevenue) * 100).toFixed(0)}%)</span>
              <span style={{ color: 'var(--plate-green)', fontWeight: 700 }}>■ Retained Net Profit ({profitMargin}%)</span>
            </div>
          </div>

          {/* Two-Column Streams */}
          <div className="minimal-two-col">
            {/* Inflow Channels */}
            <div className="minimal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span className="minimal-caption" style={{ color: 'var(--plate-blue)' }}>INFLOW CHANNELS</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>Revenue Model</h3>
                </div>
                <span className="trend-tag-green">₹{totalGrossRevenue.toLocaleString('en-IN')} Total</span>
              </div>

              <div className="financial-list">
                {/* Subscriptions */}
                <div className="financial-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div className="financial-item-title">Member Subscriptions</div>
                      <div className="financial-item-sub">Quarterly, Annual & Monthly Packages</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="financial-item-amount">₹{membershipMonthlyRevenue.toLocaleString('en-IN')}</div>
                      <div className="financial-item-percent">{((membershipMonthlyRevenue / totalGrossRevenue) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="stream-bar-bg">
                    <div className="stream-bar-fill" style={{ width: `${(membershipMonthlyRevenue / totalGrossRevenue) * 100}%`, background: 'var(--plate-blue)' }}></div>
                  </div>
                </div>

                {/* Additional Streams */}
                {branchRevenueStreams.map((rev) => (
                  <div key={rev.id} className="financial-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div className="financial-item-title">{rev.name}</div>
                        <div className="financial-item-sub">Coaching, Nutrition Fuel & Corporate</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="financial-item-amount">₹{rev.amount.toLocaleString('en-IN')}</div>
                        <div className="financial-item-percent">{((rev.amount / totalGrossRevenue) * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="stream-bar-bg">
                      <div className="stream-bar-fill" style={{ width: `${(rev.amount / totalGrossRevenue) * 100}%`, background: 'var(--plate-green)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outflow Costs */}
            <div className="minimal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span className="minimal-caption" style={{ color: 'var(--plate-red)' }}>OUTFLOW COSTS</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>Operating Expenses</h3>
                </div>
                <span className="trend-tag-red">₹{totalMonthlyExpenses.toLocaleString('en-IN')} Total</span>
              </div>

              <div className="financial-list">
                {Object.entries(expensesByCategory).map(([category, amount]) => {
                  const percent = ((amount / totalMonthlyExpenses) * 100).toFixed(0);
                  return (
                    <div key={category} className="financial-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div className="financial-item-title">{category}</div>
                          <div className="financial-item-sub">Budget allocation</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="financial-item-amount" style={{ color: 'var(--plate-red)' }}>
                            ₹{amount.toLocaleString('en-IN')}
                          </div>
                          <div className="financial-item-percent">{percent}%</div>
                        </div>
                      </div>
                      <div className="stream-bar-bg">
                        <div className="stream-bar-fill" style={{ width: `${percent}%`, background: 'var(--plate-red)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--line)', textAlign: 'right' }}>
                <button
                  type="button"
                  className="minimal-btn-primary"
                  onClick={() => setActiveTab('expenses')}
                  style={{ fontSize: '0.85rem' }}
                >
                  Manage Branch Expenses Ledger →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MEMBER ROSTER WITH BRANCH TAGS
          ========================================================================= */}
      {activeTab === 'members' && (
        <div className="minimal-section">
          <div className="minimal-card">
            <div className="minimal-card-header">
              <div>
                <span className="minimal-caption">
                  {selectedBranch === 'combined'
                    ? 'ALL CENTERS ROSTER'
                    : selectedBranch === 'sapna_sangeeta'
                    ? 'SAPNA SANGEETA ROSTER'
                    : 'MANIK BAGH ROSTER'}
                </span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
                  Member Directory & Package Tracking
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="minimal-input"
                  style={{ width: '220px' }}
                  placeholder="Search athlete, phone, coach..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="minimal-btn-primary"
                  onClick={() => setIsAddingMember(!isAddingMember)}
                >
                  {isAddingMember ? '✕ Cancel' : '+ Enroll Member'}
                </button>
              </div>
            </div>

            {/* ENROLL MEMBER DRAWER */}
            {isAddingMember && (
              <form className="minimal-form-drawer" onSubmit={handleAddMember}>
                <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Enroll Athlete & Assign Center</h4>
                </div>

                <div className="minimal-form-grid">
                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Full Name *</label>
                    <input
                      type="text"
                      className="minimal-input"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Varun Mehta"
                      required
                    />
                  </div>
                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="minimal-input"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98260 99887"
                      required
                    />
                  </div>
                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Primary Gym Center *</label>
                    <select
                      className="minimal-select"
                      value={newBranch}
                      onChange={(e) => setNewBranch(e.target.value)}
                    >
                      <option value="sapna_sangeeta">📍 Sapna Sangeeta Center</option>
                      <option value="manik_bagh">📍 Manik Bagh Center</option>
                      <option value="combined">🌐 All-Access (Both Centers)</option>
                    </select>
                  </div>
                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Age & Gender</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        className="minimal-input"
                        style={{ width: '70px' }}
                        value={newAge}
                        onChange={(e) => setNewAge(e.target.value)}
                      />
                      <select
                        className="minimal-select"
                        value={newGender}
                        onChange={(e) => setNewGender(e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Blood Group</label>
                    <select
                      className="minimal-select"
                      value={newBloodGroup}
                      onChange={(e) => setNewBloodGroup(e.target.value)}
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                    </select>
                  </div>
                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Assigned Coach</label>
                    <select
                      className="minimal-select"
                      value={newCoach}
                      onChange={(e) => setNewCoach(e.target.value)}
                    >
                      <option value="Coach Mohit (Head Coach)">Coach Mohit (Head Coach)</option>
                      <option value="Coach Pooja (Functional Lead)">Coach Pooja (Functional Lead)</option>
                      <option value="Coach Rahul (Strength Specialist)">Coach Rahul (Strength Specialist)</option>
                    </select>
                  </div>
                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Package Tier</label>
                    <select
                      className="minimal-select"
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
                      <option value="Monthly Starter">Monthly Starter</option>
                      <option value="Quarterly Pro">Quarterly Pro</option>
                      <option value="Annual Elite">Annual Elite</option>
                    </select>
                  </div>
                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Fee Amount (₹)</label>
                    <input
                      type="number"
                      className="minimal-input"
                      value={newFee}
                      onChange={(e) => setNewFee(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="minimal-btn-primary">
                    Enroll Member
                  </button>
                  <button
                    type="button"
                    className="minimal-btn-secondary"
                    onClick={() => setIsAddingMember(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Minimal Member Table */}
            <div className="table-responsive" style={{ marginTop: '0.75rem' }}>
              <table className="minimal-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Athlete & Contact</th>
                    <th>Center</th>
                    <th>Package Plan</th>
                    <th>Package End Details</th>
                    <th>Coach</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => {
                    const expiry = m.expiryDate || m.package?.endDate;
                    const meta = getPackageExpiryMeta(expiry);
                    return (
                      <tr key={m.id}>
                        <td><code>{m.id}</code></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span className="minimal-avatar">{m.avatar || m.name.charAt(0)}</span>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{m.name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                                {m.phone} • {m.bloodGroup || 'B+'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="branch-tag-pill">
                            {m.branch === 'manik_bagh'
                              ? '📍 Manik Bagh'
                              : m.branch === 'combined'
                              ? '🌐 All-Access'
                              : '📍 Sapna Sangeeta'}
                          </span>
                        </td>
                        <td>
                          <span className="tag-outline">{m.plan}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                            ₹{m.package?.fee ? m.package.fee.toLocaleString('en-IN') : '8,500'} ({m.package?.paymentStatus || 'Paid'})
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{expiry}</div>
                          <span className={`status-pill-${meta.status}`}>{meta.label}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
                            {m.assignedCoach || 'Coach Mohit'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="minimal-action-btn"
                              onClick={() => handleOpenDossier(m)}
                              title="View full personal details & package dossier"
                            >
                              👁️ Track
                            </button>
                            <button
                              type="button"
                              className="minimal-action-btn"
                              onClick={() => handleExtendPackage(m.id, 1)}
                              title="Extend package +1 month"
                            >
                              +1 Mo
                            </button>
                            <button
                              type="button"
                              className="minimal-action-btn-danger"
                              onClick={() => handleDeleteMember(m.id)}
                              title="Delete member"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: OPERATING EXPENSES LEDGER WITH BRANCH FILTERING
          ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="minimal-section">
          <div className="minimal-card">
            <div className="minimal-card-header">
              <div>
                <span className="minimal-caption">
                  {selectedBranch === 'combined'
                    ? 'COMBINED OUTFLOW LEDGER'
                    : selectedBranch === 'sapna_sangeeta'
                    ? 'SAPNA SANGEETA EXPENSES'
                    : 'MANIK BAGH EXPENSES'}
                </span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
                  Facility Operating Expenses
                </h3>
              </div>

              <button
                type="button"
                className="minimal-btn-primary"
                onClick={() => setIsAddingExpense(!isAddingExpense)}
              >
                {isAddingExpense ? '✕ Cancel' : '+ Log New Expense'}
              </button>
            </div>

            {/* Add Expense Form Drawer */}
            {isAddingExpense && (
              <form className="minimal-form-drawer" onSubmit={handleAddExpense}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.75rem' }}>
                  Record Operating Expense
                </h4>

                <div className="minimal-form-grid">
                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Gym Center *</label>
                    <select
                      className="minimal-select"
                      value={expBranch}
                      onChange={(e) => setExpBranch(e.target.value)}
                    >
                      <option value="sapna_sangeeta">📍 Sapna Sangeeta Center</option>
                      <option value="manik_bagh">📍 Manik Bagh Center</option>
                      <option value="combined">🌐 Shared / Both Centers</option>
                    </select>
                  </div>

                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Expense Category</label>
                    <select
                      className="minimal-select"
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                    >
                      <option value="Trainer & Coach Payroll">Trainer & Coach Payroll</option>
                      <option value="Facility Rent & Lease">Facility Rent & Lease</option>
                      <option value="Equipment Maintenance">Equipment Maintenance</option>
                      <option value="Commercial Utilities & Power">Commercial Utilities & Power</option>
                      <option value="Nutrition Inventory Restock">Nutrition Inventory Restock</option>
                      <option value="Sanitization & Facility Upkeep">Sanitization & Facility Upkeep</option>
                      <option value="Software & Marketing">Software & Marketing</option>
                    </select>
                  </div>

                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Expense Description *</label>
                    <input
                      type="text"
                      className="minimal-input"
                      value={expName}
                      onChange={(e) => setExpName(e.target.value)}
                      placeholder="e.g. SkiErg Drive Cord Replacement"
                      required
                    />
                  </div>

                  <div className="minimal-form-group">
                    <label className="minimal-form-label">Amount (₹) *</label>
                    <input
                      type="number"
                      className="minimal-input"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      placeholder="e.g. 7500"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="minimal-btn-primary">
                    Save Expense
                  </button>
                  <button
                    type="button"
                    className="minimal-btn-secondary"
                    onClick={() => setIsAddingExpense(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Expenses Table */}
            <div className="table-responsive" style={{ marginTop: '0.75rem' }}>
              <table className="minimal-table">
                <thead>
                  <tr>
                    <th>Center</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Month</th>
                    <th>Amount (₹)</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {branchExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <span className="branch-tag-pill">
                          {exp.branch === 'manik_bagh'
                            ? '📍 Manik Bagh'
                            : exp.branch === 'combined'
                            ? '🌐 Shared'
                            : '📍 Sapna Sangeeta'}
                        </span>
                      </td>
                      <td><span className="category-pill">{exp.category}</span></td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{exp.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{exp.notes || '—'}</div>
                      </td>
                      <td>{exp.date || 'Oct 2026'}</td>
                      <td>
                        <strong style={{ color: 'var(--plate-red)', fontSize: '0.95rem' }}>
                          ₹{exp.amount.toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="minimal-action-btn-danger"
                          onClick={() => handleDeleteExpense(exp.id)}
                          title="Delete expense"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ATTENDANCE STREAM
          ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="minimal-section">
          <div className="minimal-card">
            <div className="minimal-card-header">
              <div>
                <span className="minimal-caption">REAL-TIME ACCESS</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
                  Floor Check-In Stream ({selectedBranch === 'combined' ? 'Both Centers' : selectedBranch === 'sapna_sangeeta' ? 'Sapna Sangeeta' : 'Manik Bagh'})
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  className="minimal-select"
                  value={manualMemberId}
                  onChange={(e) => setManualMemberId(e.target.value)}
                >
                  {branchMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                </select>
                <button type="button" className="minimal-btn-primary" onClick={handleManualCheckIn}>
                  + Desk Check-In
                </button>
              </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '0.75rem' }}>
              <table className="minimal-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Center</th>
                    <th>Member Name</th>
                    <th>Plan Tier</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {branchAttendance.map((entry) => (
                    <tr key={entry.id}>
                      <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{entry.time}</td>
                      <td><span className="branch-tag-pill">{entry.branch || 'Sapna Sangeeta'}</span></td>
                      <td><strong>{entry.memberName}</strong></td>
                      <td><span className="tag-outline">{entry.plan}</span></td>
                      <td style={{ color: 'var(--plate-green)', fontWeight: 700 }}>✓ Biometric Verified</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: EQUIPMENT HEALTH
          ========================================================================= */}
      {activeTab === 'equipment' && (
        <div className="minimal-section">
          <div className="minimal-card">
            <div className="minimal-card-header">
              <div>
                <span className="minimal-caption">ASSET MONITORING</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
                  Gym Equipment Condition ({selectedBranch === 'combined' ? 'Both Centers' : selectedBranch === 'sapna_sangeeta' ? 'Sapna Sangeeta' : 'Manik Bagh'})
                </h3>
              </div>
            </div>

            <div className="minimal-equipment-grid" style={{ marginTop: '1rem' }}>
              {branchEquipment.map((item) => (
                <div
                  key={item.id}
                  className="minimal-equipment-item"
                  onClick={() => handleToggleEquipment(item.id)}
                  title="Click to toggle status"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>{item.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {item.branch === 'manik_bagh' ? '📍 Manik Bagh Center' : '📍 Sapna Sangeeta Center'}
                      </span>
                    </div>
                    <span className="minimal-badge-outline" style={{ borderColor: item.accent, color: item.accent }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                    Click to toggle condition status
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MEMBER DOSSIER MODAL
          ========================================================================= */}
      {selectedMember && (
        <div className="dossier-modal-backdrop" onClick={handleCloseDossier}>
          <div className="minimal-dossier-card" onClick={(e) => e.stopPropagation()}>
            <div className="minimal-dossier-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span className="minimal-avatar" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>
                  {selectedMember.avatar || selectedMember.name.charAt(0)}
                </span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--ink)' }}>
                    {selectedMember.name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {selectedMember.id} • Center: <strong>{selectedMember.branchLabel || 'Sapna Sangeeta'}</strong> • Blood: {selectedMember.bloodGroup || 'B+'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a
                  href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(selectedMember.name)},%20this%20is%20Tri-Star%20Fitness.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="minimal-btn-whatsapp"
                >
                  💬 WhatsApp
                </a>
                <button type="button" className="minimal-btn-secondary" onClick={handleCloseDossier}>
                  ✕
                </button>
              </div>
            </div>

            <div className="minimal-dossier-body">
              <div className="minimal-dossier-section">
                <span className="minimal-caption">PERSONAL & MEDICAL DOSSIER</span>
                <div className="minimal-dossier-grid">
                  <div>
                    <div className="dossier-label-min">Contact Phone</div>
                    <div className="dossier-val-min">{selectedMember.phone}</div>
                  </div>
                  <div>
                    <div className="dossier-label-min">Email Address</div>
                    <div className="dossier-val-min">{selectedMember.email}</div>
                  </div>
                  <div>
                    <div className="dossier-label-min">Emergency Contact</div>
                    <div className="dossier-val-min" style={{ color: 'var(--plate-red)' }}>
                      {selectedMember.emergencyContact?.name} ({selectedMember.emergencyContact?.phone})
                    </div>
                  </div>
                  <div>
                    <div className="dossier-label-min">Assigned Coach</div>
                    <div className="dossier-val-min" style={{ color: 'var(--plate-blue)' }}>
                      {selectedMember.assignedCoach || 'Coach Mohit'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.65rem', padding: '0.65rem', background: 'var(--bg)', borderRadius: '6px', fontSize: '0.82rem' }}>
                  <strong style={{ color: 'var(--muted)' }}>Medical Protocol: </strong>
                  {selectedMember.healthNotes || 'No cardiovascular, joint, or respiratory limitations.'}
                </div>
              </div>

              <div className="minimal-dossier-section">
                <span className="minimal-caption">ACTIVE PACKAGE & END DETAILS</span>
                {(() => {
                  const expiry = selectedMember.expiryDate || selectedMember.package?.endDate;
                  const meta = getPackageExpiryMeta(expiry);
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0' }}>
                        <div>
                          <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                            {selectedMember.plan}
                          </strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Center: {selectedMember.branchLabel || 'Sapna Sangeeta'} • Locker: {selectedMember.package?.lockerAllocated || 'Standard'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className={`status-pill-${meta.status}`}>{meta.label}</span>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                            Ends: {expiry}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="minimal-btn-secondary"
                          onClick={() => handleExtendPackage(selectedMember.id, 1)}
                        >
                          +1 Month Renewal
                        </button>
                        <button
                          type="button"
                          className="minimal-btn-secondary"
                          onClick={() => handleExtendPackage(selectedMember.id, 3)}
                        >
                          +3 Months (Quarterly)
                        </button>
                        <button
                          type="button"
                          className="minimal-btn-secondary"
                          onClick={() => handleExtendPackage(selectedMember.id, 12)}
                        >
                          +12 Months (Annual)
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="minimal-dossier-section">
                <span className="minimal-caption">COACH & DESK NOTES</span>
                <textarea
                  className="minimal-input"
                  rows="2"
                  style={{ width: '100%', marginTop: '0.35rem', fontSize: '0.85rem' }}
                  value={tempAdminNote}
                  onChange={(e) => setTempAdminNote(e.target.value)}
                  placeholder="Add notes about athlete progress, diet, or preferences..."
                />
                <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                  <button type="button" className="minimal-btn-primary" onClick={handleSaveDossierNotes}>
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
