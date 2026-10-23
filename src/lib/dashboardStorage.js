/**
 * Storage & seed manager for Tri-Star Local Client and Admin Dashboards.
 * Persists in localStorage so data survives page refreshes and offline testing.
 */

const STORAGE_KEYS = {
  ADMIN_AUTH: 'tristar_admin_auth',
  ACTIVE_MEMBER_ID: 'tristar_active_member_id',
  MEMBERS: 'tristar_members_list_v2', // v2 with comprehensive personal & package details
  WORKOUT_LOGS: 'tristar_workout_logs',
  MEMBER_PRS: 'tristar_member_prs',
  ATTENDANCE: 'tristar_attendance_logs',
  EQUIPMENT_STATUS: 'tristar_equipment_status',
};

// Realistic seed members with comprehensive personal, medical, and package end tracking
const DEFAULT_MEMBERS = [
  {
    id: 'TS-001',
    name: 'Arjun Patel',
    phone: '+91 98260 11223',
    email: 'arjun.patel@gmail.com',
    age: 27,
    gender: 'Male',
    bloodGroup: 'B+',
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
    adminNotes: 'Elite annual membership. VIP locker access, free nutrition bar perks each month.',
  },
  {
    id: 'TS-003',
    name: 'Vikram Singh',
    phone: '+91 94250 88990',
    email: 'vikram.singh@yahoo.in',
    age: 32,
    gender: 'Male',
    bloodGroup: 'A+',
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
    expiryDate: '2026-10-28', // Expiring in < 5 days!
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
    address: 'Bhawarkua, Indore',
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
    expiryDate: '2026-10-12', // Expired 11 days ago
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
    adminNotes: 'Membership lapsed. Called on Oct 16—traveling out of town, will renew upon return.',
  },
  {
    id: 'TS-005',
    name: 'Rohit Malviya',
    phone: '+91 91110 33221',
    email: 'rohit.m@gmail.com',
    age: 35,
    gender: 'Male',
    bloodGroup: 'O-',
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
    adminNotes: 'Club veteran and top streak holder (41 days consecutive). Eligible for free gym apparel kit.',
  },
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
  { id: 'eq-1', name: 'Eleiko Olympic Barbell 20kg (x4)', status: 'Optimal', accent: 'var(--plate-green)' },
  { id: 'eq-2', name: 'Competition Calibrated Bumpers (1000kg)', status: 'Optimal', accent: 'var(--plate-green)' },
  { id: 'eq-3', name: 'Concept2 SkiErg Station #1', status: 'Optimal', accent: 'var(--plate-green)' },
  { id: 'eq-4', name: 'Heavy Turf Sleds & Harnesses', status: 'Servicing Scheduled', accent: 'var(--plate-yellow)' },
  { id: 'eq-5', name: 'Cable Crossover Stack', status: 'Cable Re-tensioned', accent: 'var(--plate-blue)' },
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
    // Ensure backwards compatibility if any old member misses new package metadata
    return parsed.map((m) => {
      const expiry = m.expiryDate || (m.package && m.package.endDate) || '2026-12-31';
      const meta = getPackageExpiryMeta(expiry);
      return {
        ...m,
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
        { id: 'att-1', memberName: 'Arjun Patel', plan: 'Quarterly Pro', time: `${today}, 06:15 AM` },
        { id: 'att-2', memberName: 'Sneha Joshi', plan: 'Annual Elite', time: `${today}, 06:45 AM` },
        { id: 'att-3', memberName: 'Rohit Malviya', plan: 'Annual Elite', time: `${today}, 07:10 AM` },
      ];
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordCheckIn(memberName, plan) {
  const logs = getAttendanceLogs();
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const today = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  const newEntry = {
    id: `att-${Date.now()}`,
    memberName,
    plan,
    time: `${today}, ${time}`,
  };
  const updated = [newEntry, ...logs.slice(0, 19)];
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
