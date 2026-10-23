/**
 * Storage & seed manager for Tri-Star Local Client and Admin Dashboards.
 * Multi-center support:
 * - Sapna Sangeeta (Flagship Center)
 * - Manik Bagh (South Indore Center)
 * - Combined (All Centers Aggregated)
 */

export const BRANCHES = [
  { id: 'combined', name: 'Combined (All Centers)', shortName: 'Combined', icon: '🌐' },
  { id: 'sapna_sangeeta', name: 'Sapna Sangeeta Flagship', shortName: 'Sapna Sangeeta', icon: '📍' },
  { id: 'manik_bagh', name: 'Manik Bagh Center', shortName: 'Manik Bagh', icon: '📍' },
];

const STORAGE_KEYS = {
  ADMIN_AUTH: 'tristar_admin_auth',
  ACTIVE_MEMBER_ID: 'tristar_active_member_id',
  MEMBERS: 'tristar_members_list_v3',
  WORKOUT_LOGS: 'tristar_workout_logs',
  MEMBER_PRS: 'tristar_member_prs',
  ATTENDANCE: 'tristar_attendance_logs',
  EQUIPMENT_STATUS: 'tristar_equipment_status',
  EXPENSES: 'tristar_expenses_list_v3',
  REVENUE_STREAMS: 'tristar_revenue_streams_v3',
  ACTIVE_BRANCH: 'tristar_active_branch_v1',
};

// Seed members distributed across Sapna Sangeeta, Manik Bagh, and Combined All-Access
const DEFAULT_MEMBERS = [
  {
    id: 'TS-001',
    name: 'Arjun Patel',
    phone: '+91 98260 11223',
    email: 'arjun.patel@gmail.com',
    age: 27,
    gender: 'Male',
    bloodGroup: 'B+',
    branch: 'sapna_sangeeta',
    branchLabel: 'Sapna Sangeeta',
    address: 'Vijay Nagar, Indore',
    emergencyContact: {
      name: 'Ramesh Patel (Father)',
      phone: '+91 98260 99110',
      relation: 'Father',
    },
    healthNotes: 'No cardiovascular or joint issues. Cleared for high-intensity barbell training.',
    assignedCoach: 'Coach Mohit (Head Coach)',
    plan: 'Quarterly Pro',
    planAccent: 'var(--plate-red)',
    joinDate: '2026-08-15',
    expiryDate: '2026-11-15',
    status: 'active',
    streakDays: 14,
    avatar: 'A',
    package: {
      tier: 'Quarterly Pro',
      durationMonths: 3,
      startDate: '2026-08-15',
      endDate: '2026-11-15',
      fee: 8500,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI / PhonePe',
      invoiceNumber: 'INV-IND-8401',
      includesCoaching: true,
      lockerAllocated: 'Locker #14',
    },
    adminNotes: 'Preparing for HYROX Open Mumbai 2027. Training split: Push-Pull-Legs + 2x Aerobic Engine.',
  },
  {
    id: 'TS-002',
    name: 'Sneha Joshi',
    phone: '+91 97550 44556',
    email: 'sneha.j@outlook.com',
    age: 24,
    gender: 'Female',
    bloodGroup: 'O+',
    branch: 'combined',
    branchLabel: 'All-Access (Combined)',
    address: 'Old Palasia, Indore',
    emergencyContact: {
      name: 'Sunita Joshi (Mother)',
      phone: '+91 97550 11229',
      relation: 'Mother',
    },
    healthNotes: 'Past ankle sprain (rehabilitated in 2025). Prefers dynamic calf & ankle warm-ups.',
    assignedCoach: 'Coach Pooja (Functional Lead)',
    plan: 'Annual Elite',
    planAccent: 'var(--plate-yellow)',
    joinDate: '2026-01-10',
    expiryDate: '2027-01-10',
    status: 'active',
    streakDays: 28,
    avatar: 'S',
    package: {
      tier: 'Annual Elite',
      durationMonths: 12,
      startDate: '2026-01-10',
      endDate: '2027-01-10',
      fee: 28000,
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card (HDFC)',
      invoiceNumber: 'INV-IND-7910',
      includesCoaching: true,
      lockerAllocated: 'Locker #03 (VIP)',
    },
    adminNotes: 'Elite dual-center access pass. Works out in Sapna Sangeeta weekdays, Manik Bagh weekends.',
  },
  {
    id: 'TS-003',
    name: 'Vikram Singh',
    phone: '+91 94250 88990',
    email: 'vikram.singh@yahoo.in',
    age: 32,
    gender: 'Male',
    bloodGroup: 'A+',
    branch: 'sapna_sangeeta',
    branchLabel: 'Sapna Sangeeta',
    address: 'Sapna Sangeeta Main Road, Indore',
    emergencyContact: {
      name: 'Anjali Singh (Spouse)',
      phone: '+91 94250 33441',
      relation: 'Spouse',
    },
    healthNotes: 'Mild lower lumbar stiffness when deadlifting over 160kg. Requires coach form checks.',
    assignedCoach: 'Coach Rahul (Strength Specialist)',
    plan: 'Quarterly Pro',
    planAccent: 'var(--plate-red)',
    joinDate: '2026-07-28',
    expiryDate: '2026-10-28',
    status: 'expiring',
    streakDays: 9,
    avatar: 'V',
    package: {
      tier: 'Quarterly Pro',
      durationMonths: 3,
      startDate: '2026-07-28',
      endDate: '2026-10-28',
      fee: 8500,
      paymentStatus: 'Paid',
      paymentMethod: 'Cash',
      invoiceNumber: 'INV-IND-8224',
      includesCoaching: true,
      lockerAllocated: 'Locker #22',
    },
    adminNotes: 'Package expiring this week. Sent renewal WhatsApp reminder with 10% loyalty discount.',
  },
  {
    id: 'TS-004',
    name: 'Priya Sharma',
    phone: '+91 98930 77112',
    email: 'priya.sharma@indore.co',
    age: 29,
    gender: 'Female',
    bloodGroup: 'B-',
    branch: 'manik_bagh',
    branchLabel: 'Manik Bagh',
    address: 'Manik Bagh Road, Indore',
    emergencyContact: {
      name: 'Kavita Sharma (Sister)',
      phone: '+91 98930 44551',
      relation: 'Sister',
    },
    healthNotes: 'Asthmatic, keeps inhaler in gym bag. Avoid excessive unmonitored cold-room HIIT.',
    assignedCoach: 'Coach Mohit (Head Coach)',
    plan: 'Monthly Starter',
    planAccent: 'var(--plate-blue)',
    joinDate: '2026-09-12',
    expiryDate: '2026-10-12',
    status: 'expired',
    streakDays: 0,
    avatar: 'P',
    package: {
      tier: 'Monthly Starter',
      durationMonths: 1,
      startDate: '2026-09-12',
      endDate: '2026-10-12',
      fee: 3200,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI / GPay',
      invoiceNumber: 'INV-IND-8610',
      includesCoaching: false,
      lockerAllocated: 'General Day Locker',
    },
    adminNotes: 'Manik Bagh regular. Traveled out of town, expected to renew on return.',
  },
  {
    id: 'TS-005',
    name: 'Rohit Malviya',
    phone: '+91 91110 33221',
    email: 'rohit.m@gmail.com',
    age: 35,
    gender: 'Male',
    bloodGroup: 'O-',
    branch: 'combined',
    branchLabel: 'All-Access (Combined)',
    address: 'Geeta Bhawan, Indore',
    emergencyContact: {
      name: 'Deepak Malviya (Brother)',
      phone: '+91 91110 88776',
      relation: 'Brother',
    },
    healthNotes: 'None. Former state powerlifter. Working on 200kg deadlift milestone.',
    assignedCoach: 'Coach Rahul (Strength Specialist)',
    plan: 'Annual Elite',
    planAccent: 'var(--plate-yellow)',
    joinDate: '2026-03-01',
    expiryDate: '2027-03-01',
    status: 'active',
    streakDays: 41,
    avatar: 'R',
    package: {
      tier: 'Annual Elite',
      durationMonths: 12,
      startDate: '2026-03-01',
      endDate: '2027-03-01',
      fee: 28000,
      paymentStatus: 'Paid',
      paymentMethod: 'Bank Transfer (NEFT)',
      invoiceNumber: 'INV-IND-7602',
      includesCoaching: true,
      lockerAllocated: 'Locker #07',
    },
    adminNotes: 'Combined multi-club access holder. Top attendance streak.',
  },
  {
    id: 'TS-006',
    name: 'Tanmay Verma',
    phone: '+91 98270 55112',
    email: 'tanmay.v@gmail.com',
    age: 26,
    gender: 'Male',
    bloodGroup: 'A+',
    branch: 'manik_bagh',
    branchLabel: 'Manik Bagh',
    address: 'Khatiwala Tank, Manik Bagh, Indore',
    emergencyContact: {
      name: 'Suresh Verma (Father)',
      phone: '+91 98270 99002',
      relation: 'Father',
    },
    healthNotes: 'Fit for progressive overload. Training for HYROX relay division.',
    assignedCoach: 'Coach Pooja (Functional Lead)',
    plan: 'Annual Elite',
    planAccent: 'var(--plate-yellow)',
    joinDate: '2026-04-15',
    expiryDate: '2027-04-15',
    status: 'active',
    streakDays: 22,
    avatar: 'T',
    package: {
      tier: 'Annual Elite',
      durationMonths: 12,
      startDate: '2026-04-15',
      endDate: '2027-04-15',
      fee: 28000,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      invoiceNumber: 'INV-IND-9021',
      includesCoaching: true,
      lockerAllocated: 'Locker #11 (Manik Bagh)',
    },
    adminNotes: 'Manik Bagh prime lifter. Focus on dumbbell snatches and SkiErg pacing.',
  },
  {
    id: 'TS-007',
    name: 'Pooja Choudhary',
    phone: '+91 97520 66334',
    email: 'pooja.c@gmail.com',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    branch: 'manik_bagh',
    branchLabel: 'Manik Bagh',
    address: 'Sindhi Colony, Manik Bagh, Indore',
    emergencyContact: {
      name: 'Anil Choudhary (Spouse)',
      phone: '+91 97520 11998',
      relation: 'Spouse',
    },
    healthNotes: 'Past wrist strain. Uses wrist wraps for heavy bench presses.',
    assignedCoach: 'Coach Rahul (Strength Specialist)',
    plan: 'Quarterly Pro',
    planAccent: 'var(--plate-red)',
    joinDate: '2026-08-01',
    expiryDate: '2026-11-01',
    status: 'active',
    streakDays: 16,
    avatar: 'P',
    package: {
      tier: 'Quarterly Pro',
      durationMonths: 3,
      startDate: '2026-08-01',
      endDate: '2026-11-01',
      fee: 8500,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      invoiceNumber: 'INV-IND-8742',
      includesCoaching: true,
      lockerAllocated: 'Locker #05 (Manik Bagh)',
    },
    adminNotes: 'Consistent evening trainee at Manik Bagh arena.',
  },
];

// Operating Expenses categorized by Branch
const DEFAULT_EXPENSES = [
  // Sapna Sangeeta Branch
  {
    id: 'exp-ss-1',
    branch: 'sapna_sangeeta',
    branchLabel: 'Sapna Sangeeta',
    category: 'Trainer & Coach Payroll',
    name: 'Head Coach Mohit & Sapna Sangeeta Floor Trainers',
    amount: 44000,
    date: 'Oct 2026',
    type: 'recurring',
    notes: 'Head coach + floor strength specialists',
  },
  {
    id: 'exp-ss-2',
    branch: 'sapna_sangeeta',
    branchLabel: 'Sapna Sangeeta',
    category: 'Facility Rent & Lease',
    name: 'Sapna Sangeeta Prime Commercial Arena',
    amount: 32000,
    date: 'Oct 2026',
    type: 'recurring',
    notes: 'Main flagship arena floor lease',
  },
  {
    id: 'exp-ss-3',
    branch: 'sapna_sangeeta',
    branchLabel: 'Sapna Sangeeta',
    category: 'Commercial Utilities & Power',
    name: 'MPPKVVCL Power & Solar Hybrid Grid',
    amount: 9500,
    date: 'Oct 2026',
    type: 'recurring',
    notes: 'Solar subsidized central AC operations',
  },
  {
    id: 'exp-ss-4',
    branch: 'sapna_sangeeta',
    branchLabel: 'Sapna Sangeeta',
    category: 'Equipment Maintenance',
    name: 'Eleiko Barbells & Turf Sled Bearing Servicing',
    amount: 4500,
    date: 'Oct 2026',
    type: 'maintenance',
    notes: 'Flagship turf maintenance',
  },

  // Manik Bagh Branch
  {
    id: 'exp-mb-1',
    branch: 'manik_bagh',
    branchLabel: 'Manik Bagh',
    category: 'Trainer & Coach Payroll',
    name: 'Coach Pooja, Rahul & Manik Bagh Supervisors',
    amount: 32000,
    date: 'Oct 2026',
    type: 'recurring',
    notes: 'Manik Bagh functional coaching staff',
  },
  {
    id: 'exp-mb-2',
    branch: 'manik_bagh',
    branchLabel: 'Manik Bagh',
    category: 'Facility Rent & Lease',
    name: 'Manik Bagh High-Street Commercial Space',
    amount: 24000,
    date: 'Oct 2026',
    type: 'recurring',
    notes: 'Manik Bagh facility lease',
  },
  {
    id: 'exp-mb-3',
    branch: 'manik_bagh',
    branchLabel: 'Manik Bagh',
    category: 'Commercial Utilities & Power',
    name: 'Manik Bagh Commercial Electricity & AC',
    amount: 7500,
    date: 'Oct 2026',
    type: 'recurring',
    notes: 'Power backup and inverter servicing',
  },
  {
    id: 'exp-mb-4',
    branch: 'manik_bagh',
    branchLabel: 'Manik Bagh',
    category: 'Equipment Maintenance',
    name: 'Dumbbell Rack & Cable Pulley Tuning',
    amount: 3500,
    date: 'Oct 2026',
    type: 'maintenance',
    notes: 'Manik Bagh cable tower tuning',
  },

  // Combined Operations (HQ / Shared)
  {
    id: 'exp-hq-1',
    branch: 'combined',
    branchLabel: 'Combined (HQ / Shared)',
    category: 'Nutrition Inventory Restock',
    name: 'Bulk Factory Direct Whey & Fuel Bars (Both Centers)',
    amount: 14000,
    date: 'Oct 2026',
    type: 'inventory',
    notes: 'Centrally warehoused inventory distributed to both locations',
  },
  {
    id: 'exp-hq-2',
    branch: 'combined',
    branchLabel: 'Combined (HQ / Shared)',
    category: 'Sanitization & Facility Upkeep',
    name: 'Hospital-Grade Concentrate & Towels (Both Centers)',
    amount: 5500,
    date: 'Oct 2026',
    type: 'recurring',
    notes: 'Shared cleaning protocols',
  },
  {
    id: 'exp-hq-3',
    branch: 'combined',
    branchLabel: 'Combined (HQ / Shared)',
    category: 'Software & Marketing',
    name: 'Multi-Branch Biometrics, WhatsApp CRM & Ads',
    amount: 4000,
    date: 'Oct 2026',
    type: 'recurring',
    notes: 'Unified membership tracking software for all locations',
  },
];

// Revenue Streams categorized by Branch
const DEFAULT_REVENUE_STREAMS = [
  // Sapna Sangeeta Inflows
  { id: 'rev-ss-pt', branch: 'sapna_sangeeta', name: '1-on-1 PT Coaching (Sapna Sangeeta)', amount: 115000, month: 'Oct 2026' },
  { id: 'rev-ss-store', branch: 'sapna_sangeeta', name: 'Whey & Nutrition Store (Sapna Sangeeta)', amount: 68000, month: 'Oct 2026' },
  { id: 'rev-ss-camp', branch: 'sapna_sangeeta', name: 'Weekend HYROX Arena Drop-ins', amount: 32000, month: 'Oct 2026' },

  // Manik Bagh Inflows
  { id: 'rev-mb-pt', branch: 'manik_bagh', name: '1-on-1 PT Coaching (Manik Bagh)', amount: 80000, month: 'Oct 2026' },
  { id: 'rev-mb-store', branch: 'manik_bagh', name: 'Fuel & Nutrition Kiosk (Manik Bagh)', amount: 44000, month: 'Oct 2026' },
  { id: 'rev-mb-drop', branch: 'manik_bagh', name: 'South Indore Day Passes & Trials', amount: 16000, month: 'Oct 2026' },

  // Combined Pass / Corporate Contracts
  { id: 'rev-corp', branch: 'combined', name: 'Corporate Multi-Club All-Access Contracts', amount: 75000, month: 'Oct 2026' },
];

const DEFAULT_WORKOUTS = [
  {
    id: 'w-1',
    date: 'Today, 7:15 AM',
    exercise: 'Barbell Deadlift',
    sets: 4,
    reps: 6,
    weight: 140,
    rpe: 8,
    notes: 'Heavy triple, zero lower back fatigue. Great form.',
  },
  {
    id: 'w-2',
    date: 'Yesterday, 6:30 PM',
    exercise: 'Barbell Bench Press',
    sets: 5,
    reps: 5,
    weight: 95,
    rpe: 8.5,
    notes: 'Paused at chest, solid explosive lockout.',
  },
  {
    id: 'w-3',
    date: '2 days ago',
    exercise: 'HYROX Sled Push',
    sets: 6,
    reps: 25,
    weight: 125,
    rpe: 9,
    notes: '50m turf pushes with 90s rest intervals.',
  },
];

const DEFAULT_PRS = {
  bench: { label: 'Bench Press', value: 105, unit: 'kg', date: 'Oct 2026' },
  deadlift: { label: 'Deadlift', value: 165, unit: 'kg', date: 'Oct 2026' },
  squat: { label: 'Back Squat', value: 135, unit: 'kg', date: 'Sep 2026' },
  skierg: { label: '1km SkiErg', value: '3:42', unit: 'min', date: 'Oct 2026' },
};

const DEFAULT_EQUIPMENT = [
  { id: 'eq-1', name: 'Eleiko Olympic Barbell 20kg (Sapna Sangeeta)', branch: 'sapna_sangeeta', status: 'Optimal', accent: 'var(--plate-green)' },
  { id: 'eq-2', name: 'Competition Calibrated Bumpers 1000kg (Sapna Sangeeta)', branch: 'sapna_sangeeta', status: 'Optimal', accent: 'var(--plate-green)' },
  { id: 'eq-3', name: 'Concept2 SkiErg Station #1 (Sapna Sangeeta)', branch: 'sapna_sangeeta', status: 'Optimal', accent: 'var(--plate-green)' },
  { id: 'eq-4', name: 'Turf Sleds & Harnesses (Sapna Sangeeta)', branch: 'sapna_sangeeta', status: 'Servicing Scheduled', accent: 'var(--plate-yellow)' },
  { id: 'eq-5', name: 'Olympic Barbells & Bumper Set (Manik Bagh)', branch: 'manik_bagh', status: 'Optimal', accent: 'var(--plate-green)' },
  { id: 'eq-6', name: 'Cable Crossover & Pulley Tower (Manik Bagh)', branch: 'manik_bagh', status: 'Optimal', accent: 'var(--plate-green)' },
  { id: 'eq-7', name: 'Concept2 Rower & SkiErg Station (Manik Bagh)', branch: 'manik_bagh', status: 'Optimal', accent: 'var(--plate-green)' },
];

/**
 * Calculates days remaining, status tier, and human-readable label for any package end date.
 */
export function getPackageExpiryMeta(endDateStr) {
  if (!endDateStr) {
    return { daysLeft: 0, status: 'unknown', label: 'No end date', badgeColor: 'var(--plate-grey)' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    const expiredDays = Math.abs(daysLeft);
    return {
      daysLeft,
      status: 'expired',
      label: `Expired ${expiredDays} day${expiredDays === 1 ? '' : 's'} ago`,
      badgeColor: 'var(--plate-red)',
      isExpiringSoon: false,
      isExpired: true,
    };
  }

  if (daysLeft <= 7) {
    return {
      daysLeft,
      status: 'expiring',
      label: daysLeft === 0 ? 'Expires today!' : `Ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      badgeColor: 'var(--plate-yellow)',
      isExpiringSoon: true,
      isExpired: false,
    };
  }

  return {
    daysLeft,
    status: 'active',
    label: `${daysLeft} days remaining`,
    badgeColor: 'var(--plate-green)',
    isExpiringSoon: false,
    isExpired: false,
  };
}

export function getStoredMembers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
      return DEFAULT_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    return parsed.map((m) => {
      const expiry = m.expiryDate || (m.package && m.package.endDate) || '2026-12-31';
      const meta = getPackageExpiryMeta(expiry);
      return {
        ...m,
        branch: m.branch || 'sapna_sangeeta',
        branchLabel: m.branchLabel || (m.branch === 'manik_bagh' ? 'Manik Bagh' : m.branch === 'combined' ? 'Combined (All-Access)' : 'Sapna Sangeeta'),
        expiryDate: expiry,
        status: meta.status,
        package: m.package || {
          tier: m.plan || 'Quarterly Pro',
          durationMonths: 3,
          startDate: m.joinDate || '2026-08-01',
          endDate: expiry,
          fee: 8500,
          paymentStatus: 'Paid',
          paymentMethod: 'UPI',
          invoiceNumber: `INV-${m.id}`,
        },
      };
    });
  } catch {
    return DEFAULT_MEMBERS;
  }
}

export function saveStoredMembers(members) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save members:', err);
  }
}

export function getActiveMember() {
  const members = getStoredMembers();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_MEMBER_ID) || 'TS-001';
  return members.find((m) => m.id === activeId) || members[0] || DEFAULT_MEMBERS[0];
}

export function setActiveMemberId(id) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID, id);
  } catch (err) {
    console.error('Failed to set active member id:', err);
  }
}

// Branch Selection Management
export function getActiveBranch() {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH) || 'combined';
}

export function setActiveBranch(branchId) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH, branchId);
  } catch (err) {
    console.error('Failed to set active branch:', err);
  }
}

// Expenses Management
export function getStoredExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
      return DEFAULT_EXPENSES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EXPENSES;
  }
}

export function saveStoredExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save expenses:', err);
  }
}

// Revenue Streams Management
export function getStoredRevenueStreams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVENUE_STREAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REVENUE_STREAMS, JSON.stringify(DEFAULT_REVENUE_STREAMS));
      return DEFAULT_REVENUE_STREAMS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REVENUE_STREAMS;
  }
}

export function saveStoredRevenueStreams(streams) {
  try {
    localStorage.setItem(STORAGE_KEYS.REVENUE_STREAMS, JSON.stringify(streams));
  } catch (err) {
    console.error('Failed to save revenue streams:', err);
  }
}

export function getStoredWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(DEFAULT_WORKOUTS));
      return DEFAULT_WORKOUTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WORKOUTS;
  }
}

export function saveStoredWorkouts(workouts) {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(workouts));
  } catch (err) {
    console.error('Failed to save workouts:', err);
  }
}

export function getStoredPRs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBER_PRS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEMBER_PRS, JSON.stringify(DEFAULT_PRS));
      return DEFAULT_PRS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRS;
  }
}

export function saveStoredPRs(prs) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBER_PRS, JSON.stringify(prs));
  } catch (err) {
    console.error('Failed to save PRs:', err);
  }
}

export function getAttendanceLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      const today = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const initial = [
        { id: 'att-1', memberName: 'Arjun Patel', branch: 'Sapna Sangeeta', plan: 'Quarterly Pro', time: `${today}, 06:15 AM` },
        { id: 'att-2', memberName: 'Sneha Joshi', branch: 'Sapna Sangeeta', plan: 'Annual Elite', time: `${today}, 06:45 AM` },
        { id: 'att-3', memberName: 'Tanmay Verma', branch: 'Manik Bagh', plan: 'Annual Elite', time: `${today}, 07:05 AM` },
        { id: 'att-4', memberName: 'Rohit Malviya', branch: 'Sapna Sangeeta', plan: 'Annual Elite', time: `${today}, 07:20 AM` },
        { id: 'att-5', memberName: 'Pooja Choudhary', branch: 'Manik Bagh', plan: 'Quarterly Pro', time: `${today}, 07:45 AM` },
      ];
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordCheckIn(memberName, plan, branch = 'Sapna Sangeeta') {
  const logs = getAttendanceLogs();
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const today = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  const newEntry = {
    id: `att-${Date.now()}`,
    memberName,
    branch,
    plan,
    time: `${today}, ${time}`,
  };
  const updated = [newEntry, ...logs.slice(0, 24)];
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
  return updated;
}

export function getEquipmentStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EQUIPMENT_STATUS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT_STATUS, JSON.stringify(DEFAULT_EQUIPMENT));
      return DEFAULT_EQUIPMENT;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EQUIPMENT;
  }
}

export function saveEquipmentStatus(items) {
  try {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT_STATUS, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function isAdminAuthenticated() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function setAdminAuthenticated(val) {
  if (val) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }
}
