/**
 * Express router for Tri-Star Fitness Admin operations:
 * - Branch occupancy tracking & simulation
 * - Membership risk queue & retention workflows
 * - Non-cash incentives management
 * - Strict backend access control with 90-minute cooldown & expiry enforcement
 */
import { Router } from 'express';

const router = Router();

// In-memory operational store (with persistent baseline)
const branches = {
  branch_a: {
    id: 'branch_a',
    name: 'Location A — Sapna Sangeeta (Flagship)',
    address: 'Sapna Sangeeta Road, Next to Lotus Electronic, Indore',
    currentMembers: 84,
    maxCapacity: 110,
    recentEntries: 18,
    recentExits: 9,
    lastUpdated: new Date().toISOString(),
    isSimulated: true,
  },
  branch_b: {
    id: 'branch_b',
    name: 'Location B — Vijay Nagar (Performance Hub)',
    address: 'Scheme 54, Near Meghdoot Garden, Vijay Nagar, Indore',
    currentMembers: 42,
    maxCapacity: 120,
    recentEntries: 7,
    recentExits: 11,
    lastUpdated: new Date().toISOString(),
    isSimulated: true,
  },
};

const riskQueue = [
  {
    id: 'RQ-101',
    memberId: 'TS-003',
    name: 'Vikram Singh',
    branch: 'Location A (Sapna Sangeeta)',
    status: 'Contact Pending',
    riskReason: 'Package Expiring in 5 Days',
    requestDate: '2026-10-21',
    assignedStaff: 'Coach Mohit',
    lastContact: '2026-10-22',
    nextFollowUp: '2026-10-24',
    notes: 'Member reported high workload; offered HYROX flex morning slot.',
  },
  {
    id: 'RQ-102',
    memberId: 'TS-004',
    name: 'Priya Sharma',
    branch: 'Location A (Sapna Sangeeta)',
    status: 'New',
    riskReason: 'Cancellation Inquired (Relocation)',
    requestDate: '2026-10-22',
    assignedStaff: 'Desk Team',
    lastContact: 'None',
    nextFollowUp: 'Today',
    notes: 'Inquired about membership pause due to temporary travel.',
  },
  {
    id: 'RQ-103',
    memberId: 'TS-008',
    name: 'Karan Mehra',
    branch: 'Location B (Vijay Nagar)',
    status: 'Follow-up Scheduled',
    riskReason: 'Refund Requested (Unused Month)',
    requestDate: '2026-10-19',
    assignedStaff: 'Manager Anita',
    lastContact: '2026-10-20',
    nextFollowUp: '2026-10-25',
    notes: 'Informed strict no-refund policy; предложил transfer to buddy pass or training hold.',
  },
  {
    id: 'RQ-104',
    memberId: 'TS-012',
    name: 'Devansh Verma',
    branch: 'Location B (Vijay Nagar)',
    status: 'Contacted',
    riskReason: 'Low Attendance (<2 visits in 30 days)',
    requestDate: '2026-10-18',
    assignedStaff: 'Coach Rahul',
    lastContact: '2026-10-22',
    nextFollowUp: '2026-10-29',
    notes: 'Booked 1-on-1 form check session to rebuild habit.',
  },
  {
    id: 'RQ-105',
    memberId: 'TS-015',
    name: 'Neha Agrawal',
    branch: 'Location A (Sapna Sangeeta)',
    status: 'Escalated',
    riskReason: 'Dispute Over Equipment Wait Times',
    requestDate: '2026-10-15',
    assignedStaff: 'Director Mohit',
    lastContact: '2026-10-21',
    nextFollowUp: 'Tomorrow',
    notes: 'Offered off-peak priority booking or complimentary orientation.',
  },
];

const incentives = [
  {
    id: 'inc-1',
    title: 'Off-Peak Protein Smoothie Perk',
    type: 'Smoothie Voucher',
    description: 'Complimentary high-protein recovery shake when checking in before 5 PM at Location B.',
    costPoints: 150,
    issued: 142,
    redeemed: 98,
    active: true,
  },
  {
    id: 'inc-2',
    title: 'Supervised Barbell Orientation',
    type: 'Coaching Session',
    description: '30-minute private deadlift & squat biomechanics evaluation with a senior coach.',
    costPoints: 300,
    issued: 48,
    redeemed: 41,
    active: true,
  },
  {
    id: 'inc-3',
    title: 'Priority SkiErg Station Access',
    type: 'Equipment Priority',
    description: 'Reserved 20-minute slot during peak hours for uninterrupted HYROX benchmark training.',
    costPoints: 200,
    issued: 85,
    redeemed: 72,
    active: true,
  },
  {
    id: 'inc-4',
    title: '30-Day Streak Loyalty Star',
    type: 'Loyalty Points',
    description: '500 bonus Tri-Star community points redeemable for premium gym merch and shaker bottles.',
    costPoints: 0,
    issued: 35,
    redeemed: 35,
    active: true,
  },
];

// Access control logs with cooldown tracking
const accessLogs = [
  {
    id: 'acc-1',
    memberId: 'TS-001',
    name: 'Arjun Patel',
    branch: 'Location A (Sapna Sangeeta)',
    type: 'CHECK_IN',
    status: 'GRANTED',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    details: 'Valid Quarterly Pro QR scanned',
  },
  {
    id: 'acc-2',
    memberId: 'TS-002',
    name: 'Sneha Joshi',
    branch: 'Location B (Vijay Nagar)',
    type: 'CHECK_IN',
    status: 'GRANTED',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    details: 'Valid Annual Elite biometric',
  },
  {
    id: 'acc-3',
    memberId: 'TS-004',
    name: 'Priya Sharma',
    branch: 'Location A (Sapna Sangeeta)',
    type: 'CHECK_IN',
    status: 'REJECTED',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    details: 'Membership expired on 2026-10-12',
    reason: 'EXPIRED_MEMBERSHIP',
  },
  {
    id: 'acc-4',
    memberId: 'TS-001',
    name: 'Arjun Patel',
    branch: 'Location A (Sapna Sangeeta)',
    type: 'CHECK_IN',
    status: 'REJECTED',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    details: 'Entry attempt 20 mins after last check-in',
    reason: 'COOLDOWN_ACTIVE (70 mins remaining)',
  },
];

// Known members for access verification
const memberDatabase = {
  'TS-001': { name: 'Arjun Patel', plan: 'Quarterly Pro', expires: '2026-11-15', active: true },
  'TS-002': { name: 'Sneha Joshi', plan: 'Annual Elite', expires: '2027-01-10', active: true },
  'TS-003': { name: 'Vikram Singh', plan: 'Quarterly Pro', expires: '2026-10-28', active: true },
  'TS-004': { name: 'Priya Sharma', plan: 'Monthly Starter', expires: '2026-10-12', active: false }, // Expired
  'TS-005': { name: 'Rohit Malviya', plan: 'Annual Elite', expires: '2027-03-01', active: true },
};

// 1. Overview stats
router.get('/overview', (_req, res) => {
  const totalActive = 126;
  const occupancyA = Math.round((branches.branch_a.currentMembers / branches.branch_a.maxCapacity) * 100);
  const occupancyB = Math.round((branches.branch_b.currentMembers / branches.branch_b.maxCapacity) * 100);

  const atRiskCount = riskQueue.filter((r) => r.status !== 'Contacted').length;
  const expiringSoonCount = 4;
  const incentivesIssued = incentives.reduce((acc, i) => acc + i.issued, 0);
  const incentivesRedeemed = incentives.reduce((acc, i) => acc + i.redeemed, 0);

  res.json({
    totalActiveMembers: totalActive,
    occupancy: {
      branch_a: { ...branches.branch_a, percentage: occupancyA },
      branch_b: { ...branches.branch_b, percentage: occupancyB },
    },
    membersAtRisk: atRiskCount,
    membershipsExpiringSoon: expiringSoonCount,
    incentives: {
      issued: incentivesIssued,
      redeemed: incentivesRedeemed,
      redemptionRate: Math.round((incentivesRedeemed / (incentivesIssued || 1)) * 100),
    },
    hourlyTrend: [
      { hour: '06:00', branchA: 35, branchB: 20 },
      { hour: '07:30', branchA: 78, branchB: 45 },
      { hour: '09:00', branchA: 92, branchB: 50 },
      { hour: '11:00', branchA: 30, branchB: 25 },
      { hour: '14:00', branchA: 22, branchB: 18 },
      { hour: '17:00', branchA: 85, branchB: 42 },
      { hour: '19:00', branchA: 95, branchB: 58 },
      { hour: '21:00', branchA: 60, branchB: 35 },
    ],
    lastUpdated: new Date().toISOString(),
    dataSource: 'simulated_demo',
  });
});

// 2. Branch Occupancy
router.get('/occupancy', (_req, res) => {
  res.json({
    branches: Object.values(branches).map((b) => ({
      ...b,
      occupancyPercentage: Math.round((b.currentMembers / b.maxCapacity) * 100),
      status:
        b.currentMembers / b.maxCapacity > 0.75
          ? 'Busy'
          : b.currentMembers / b.maxCapacity >= 0.4
          ? 'Optimal'
          : 'Quiet',
    })),
    timestamp: new Date().toISOString(),
    isSimulated: true,
  });
});

router.post('/occupancy/:branchId/adjust', (req, res) => {
  const { branchId } = req.params;
  const { delta, action } = req.body; // delta: +1 or -1, action: 'checkin' | 'checkout' | 'manual'
  const branch = branches[branchId];

  if (!branch) {
    return res.status(404).json({ error: 'Branch not found' });
  }

  const change = Number(delta) || (action === 'checkout' ? -1 : 1);
  branch.currentMembers = Math.max(0, Math.min(branch.maxCapacity, branch.currentMembers + change));
  if (action === 'checkin') branch.recentEntries += 1;
  if (action === 'checkout') branch.recentExits += 1;
  branch.lastUpdated = new Date().toISOString();

  res.json({
    success: true,
    branch: {
      ...branch,
      occupancyPercentage: Math.round((branch.currentMembers / branch.maxCapacity) * 100),
      status:
        branch.currentMembers / branch.maxCapacity > 0.75
          ? 'Busy'
          : branch.currentMembers / branch.maxCapacity >= 0.4
          ? 'Optimal'
          : 'Quiet',
    },
  });
});

// 3. Smart Recommendations
router.get('/recommendations', (_req, res) => {
  const isABusy = branches.branch_a.currentMembers / branches.branch_a.maxCapacity > 0.75;
  const hasBCapacity = branches.branch_b.currentMembers / branches.branch_b.maxCapacity < 0.65;

  const recommendation = {
    active: isABusy && hasBCapacity,
    sourceBranch: branches.branch_a.name,
    destBranch: branches.branch_b.name,
    currentOccupancySource: `${Math.round((branches.branch_a.currentMembers / branches.branch_a.maxCapacity) * 100)}% (Peak congestion)`,
    predictedOccupancyDest: `${Math.round((branches.branch_b.currentMembers / branches.branch_b.maxCapacity) * 100)}% (Open turf & racks)`,
    distanceKm: 8.2,
    travelTimeEst: '18–22 mins via AB Road bypass',
    reason: 'Location A is currently above 75% capacity with barbell rack wait times. Location B has immediate lifting platform availability.',
    suggestedPerk: 'Complimentary Post-Workout Protein Smoothie Voucher (+100 XP) upon verified check-in at Vijay Nagar.',
    alternativeQuietTime: 'Today 11:30 AM to 04:30 PM (Projected < 35% occupancy).',
    verifiedMovesCount: 14,
  };

  res.json(recommendation);
});

// 4. Membership Risk Queue
router.get('/risk-queue', (_req, res) => {
  res.json({ queue: riskQueue });
});

router.patch('/risk-queue/:id', (req, res) => {
  const { id } = req.params;
  const { status, assignedStaff, notes } = req.body;
  const item = riskQueue.find((r) => r.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Risk item not found' });
  }

  if (status) item.status = status;
  if (assignedStaff) item.assignedStaff = assignedStaff;
  if (notes) item.notes = notes;
  item.lastContact = new Date().toISOString().split('T')[0];

  res.json({ success: true, item });
});

// 5. Retention & Incentives
router.get('/incentives', (_req, res) => {
  res.json({ incentives });
});

router.patch('/incentives/:id', (req, res) => {
  const { id } = req.params;
  const { active, costPoints } = req.body;
  const item = incentives.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Incentive not found' });
  }

  if (typeof active === 'boolean') item.active = active;
  if (typeof costPoints === 'number') item.costPoints = costPoints;

  res.json({ success: true, item });
});

// 6. Access Control with 90-minute cooldown & expiry enforcement
router.get('/access/logs', (_req, res) => {
  res.json({ logs: accessLogs });
});

router.post('/access/validate', (req, res) => {
  const { memberId, branchId } = req.body;
  const cleanId = String(memberId || '').trim().toUpperCase();
  const member = memberDatabase[cleanId];

  // 1. Unknown Member
  if (!member) {
    const rejectedLog = {
      id: `acc-${Date.now()}`,
      memberId: cleanId || 'UNKNOWN',
      name: 'Unrecognized Badge',
      branch: branchId === 'branch_b' ? 'Location B (Vijay Nagar)' : 'Location A (Sapna Sangeeta)',
      type: 'CHECK_IN',
      status: 'REJECTED',
      timestamp: new Date().toISOString(),
      details: 'Member ID not found in database',
      reason: 'INVALID_CREDENTIALS',
    };
    accessLogs.unshift(rejectedLog);
    return res.status(403).json({
      granted: false,
      reason: 'Member credentials invalid or unrecognized',
      code: 'INVALID_CREDENTIALS',
      log: rejectedLog,
    });
  }

  // 2. Check Expiry
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(member.expires);
  expiryDate.setHours(0, 0, 0, 0);

  if (!member.active || expiryDate < today) {
    const rejectedLog = {
      id: `acc-${Date.now()}`,
      memberId: cleanId,
      name: member.name,
      branch: branchId === 'branch_b' ? 'Location B (Vijay Nagar)' : 'Location A (Sapna Sangeeta)',
      type: 'CHECK_IN',
      status: 'REJECTED',
      timestamp: new Date().toISOString(),
      details: `Membership expired on ${member.expires}`,
      reason: 'EXPIRED_MEMBERSHIP',
    };
    accessLogs.unshift(rejectedLog);
    return res.status(403).json({
      granted: false,
      reason: `Membership expired on ${member.expires}. Please renew at front desk.`,
      code: 'EXPIRED_MEMBERSHIP',
      log: rejectedLog,
    });
  }

  // 3. Strict 90-Minute Cooldown Enforcement
  const recentSuccessful = accessLogs.find(
    (l) => l.memberId === cleanId && l.status === 'GRANTED' && l.type === 'CHECK_IN'
  );

  if (recentSuccessful) {
    const lastCheckInTime = new Date(recentSuccessful.timestamp).getTime();
    const elapsedMinutes = Math.floor((Date.now() - lastCheckInTime) / (1000 * 60));
    const COOLDOWN_MINUTES = 90;

    if (elapsedMinutes < COOLDOWN_MINUTES) {
      const remaining = COOLDOWN_MINUTES - elapsedMinutes;
      const rejectedLog = {
        id: `acc-${Date.now()}`,
        memberId: cleanId,
        name: member.name,
        branch: branchId === 'branch_b' ? 'Location B (Vijay Nagar)' : 'Location A (Sapna Sangeeta)',
        type: 'CHECK_IN',
        status: 'REJECTED',
        timestamp: new Date().toISOString(),
        details: `Check-in denied: ${remaining} mins remaining in 90-minute cooldown window`,
        reason: `COOLDOWN_ACTIVE (${remaining}m remaining)`,
      };
      accessLogs.unshift(rejectedLog);
      return res.status(429).json({
        granted: false,
        reason: `Entry cooldown active. Last checked in ${elapsedMinutes} mins ago. Required wait: ${remaining} more minutes.`,
        code: 'COOLDOWN_ACTIVE',
        remainingMinutes: remaining,
        log: rejectedLog,
      });
    }
  }

  // 4. Access Granted
  const grantedLog = {
    id: `acc-${Date.now()}`,
    memberId: cleanId,
    name: member.name,
    branch: branchId === 'branch_b' ? 'Location B (Vijay Nagar)' : 'Location A (Sapna Sangeeta)',
    type: 'CHECK_IN',
    status: 'GRANTED',
    timestamp: new Date().toISOString(),
    details: `Authorized: Valid ${member.plan} package (expires ${member.expires})`,
    reason: 'AUTHORIZED',
  };
  accessLogs.unshift(grantedLog);

  // Auto-increment branch occupancy
  const targetBranch = branchId === 'branch_b' ? branches.branch_b : branches.branch_a;
  targetBranch.currentMembers = Math.min(targetBranch.maxCapacity, targetBranch.currentMembers + 1);
  targetBranch.recentEntries += 1;
  targetBranch.lastUpdated = new Date().toISOString();

  res.json({
    granted: true,
    member: {
      id: cleanId,
      name: member.name,
      plan: member.plan,
      expires: member.expires,
    },
    log: grantedLog,
  });
});

export default router;
