import { Router } from 'express';
import { User, Workout, Expense, Attendance } from '../models.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { dbState } from '../db.js';

const router = Router();

// In-memory fallbacks if MongoDB is unavailable
const fallbackExpenses = [
  { id: 'exp-1', name: 'Elite Trainer & Coach Payroll', category: 'Trainer Compensation', amount: 120000, type: 'payroll', branch: 'sapna_sangeeta', date: 'Oct 2026', notes: '4 Certified Strength & Conditioning Coaches' },
  { id: 'exp-2', name: 'Manik Bagh Coach Honorarium', category: 'Trainer Compensation', amount: 80000, type: 'payroll', branch: 'manik_bagh', date: 'Oct 2026', notes: '3 Trainers + Floor Specialist' },
  { id: 'exp-3', name: 'Eleiko Barbell Calibration & Cable Rig Lubrication', category: 'Equipment Maintenance', amount: 14500, type: 'maintenance', branch: 'sapna_sangeeta', date: 'Oct 2026', notes: 'Routine checkup' },
  { id: 'exp-4', name: 'Manik Bagh Dumbbell Rack Alignment & Bench Relining', category: 'Equipment Maintenance', amount: 10500, type: 'maintenance', branch: 'manik_bagh', date: 'Oct 2026', notes: 'Bi-monthly inspection' },
  { id: 'exp-5', name: 'Sapna Sangeeta Center Lease & CAM', category: 'Facility Lease', amount: 48000, type: 'rent', branch: 'sapna_sangeeta', date: 'Oct 2026', notes: 'Main flagship floor' },
  { id: 'exp-6', name: 'Manik Bagh Facility Rent', category: 'Facility Lease', amount: 36000, type: 'rent', branch: 'manik_bagh', date: 'Oct 2026', notes: 'Prime commercial block' },
  { id: 'exp-7', name: 'HVAC Airflow & Central Power Utility', category: 'Utilities & Power', amount: 26000, type: 'utilities', branch: 'sapna_sangeeta', date: 'Oct 2026', notes: 'Continuous chillers & lighting' },
  { id: 'exp-8', name: 'Manik Bagh Power & Chiller Plant', category: 'Utilities & Power', amount: 18000, type: 'utilities', branch: 'manik_bagh', date: 'Oct 2026', notes: 'Power utility bill' },
  { id: 'exp-9', name: 'Central Biometric & Member CRM Server License', category: 'Software & Technology', amount: 6500, type: 'software', branch: 'combined', date: 'Oct 2026', notes: 'Cloud sync between branches' },
];

const fallbackAttendance = [
  { id: 'att-1', time: '10:45 AM', memberName: 'Arjun Sharma', plan: 'Quarterly Pro', branch: 'Sapna Sangeeta' },
  { id: 'att-2', time: '10:32 AM', memberName: 'Priya Patel', plan: 'Annual Elite', branch: 'Manik Bagh' },
  { id: 'att-3', time: '10:15 AM', memberName: 'Vikram Choudhary', plan: 'Quarterly Pro', branch: 'Sapna Sangeeta' },
  { id: 'att-4', time: '09:50 AM', memberName: 'Sneha Jain', plan: 'Executive All-Access', branch: 'Sapna Sangeeta' },
  { id: 'att-5', time: '09:20 AM', memberName: 'Tanmay Verma', plan: 'Monthly Strength', branch: 'Manik Bagh' },
];

/**
 * GET /api/dashboard/members
 * Admin can fetch all members; regular user can fetch own info.
 */
router.get('/members', requireAuth, async (req, res) => {
  try {
    const { branch } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      // Normal athletes only see their own dossier
      query = { email: req.user.email };
    } else if (branch && branch !== 'combined') {
      query = { $or: [{ branch }, { branch: 'combined' }] };
    }

    if (dbState.connected) {
      const members = await User.find(query).sort({ createdAt: -1 }).lean();
      return res.json({ members });
    }

    res.json({ members: [] });
  } catch (err) {
    console.error('[dashboard] error fetching members:', err);
    res.status(500).json({ error: 'Failed to fetch members.' });
  }
});

/**
 * POST /api/dashboard/members
 * Admin enrolls new member
 */
router.post('/members', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      branch = 'sapna_sangeeta',
      age,
      gender,
      bloodGroup,
      address,
      emergencyName,
      emergencyPhone,
      emergencyRelation,
      healthNotes,
      coach,
      plan = 'Quarterly Pro',
      durationMonths = 3,
      fee = 8500,
      paymentStatus = 'Paid',
      paymentMethod = 'UPI',
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(durationMonths));
    const expiryStr = endDate.toISOString().split('T')[0];

    const memberId = `TS-${branch === 'manik_bagh' ? 'MB' : 'SS'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const memberData = {
      name,
      email: email.toLowerCase().trim(),
      password: '$2a$10$defaultPlaceholderHashedPassword123',
      role: 'user',
      branch,
      phone: phone || '+91 98260 00000',
      age: Number(age) || 26,
      gender: gender || 'Athlete',
      bloodGroup: bloodGroup || 'B+',
      address: address || 'Indore',
      memberId,
      plan,
      status: 'active',
      expiryDate: expiryStr,
      streakDays: 1,
      emergencyContact: {
        name: emergencyName || 'Family',
        phone: emergencyPhone || '+91 98260 99999',
        relation: emergencyRelation || 'Family',
      },
      healthNotes: healthNotes || 'Cleared for heavy barbell lifts.',
      coach: coach || 'Coach Mohit (Head Coach)',
      package: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: expiryStr,
        durationMonths: Number(durationMonths),
        fee: Number(fee),
        paymentStatus,
        paymentMethod,
        lockerAllocated: 'Standard',
      },
    };

    if (dbState.connected) {
      const created = await User.create(memberData);
      return res.status(201).json({ message: 'Member enrolled successfully', member: created });
    }

    res.status(201).json({ message: 'Member enrolled (fallback)', member: memberData });
  } catch (err) {
    console.error('[dashboard] enroll member error:', err);
    res.status(500).json({ error: 'Failed to enroll member.' });
  }
});

/**
 * PUT /api/dashboard/members/:id
 * Admin updates member details / notes / extends package
 */
router.put('/members/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (dbState.connected) {
      const updated = await User.findOneAndUpdate(
        { $or: [{ _id: id }, { memberId: id }] },
        { $set: updates },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: 'Member not found.' });
      }
      return res.json({ message: 'Member updated successfully', member: updated });
    }

    res.json({ message: 'Member updated (fallback mode)' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update member.' });
  }
});

/**
 * GET /api/dashboard/expenses
 */
router.get('/expenses', requireAdmin, async (req, res) => {
  try {
    const { branch } = req.query;
    if (dbState.connected) {
      const query = branch && branch !== 'combined' ? { branch } : {};
      const items = await Expense.find(query).sort({ createdAt: -1 }).lean();
      if (items.length > 0) {
        return res.json({ expenses: items });
      }
    }

    const filtered =
      branch && branch !== 'combined'
        ? fallbackExpenses.filter((e) => e.branch === branch || e.branch === 'combined')
        : fallbackExpenses;
    res.json({ expenses: filtered });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

/**
 * POST /api/dashboard/expenses
 */
router.post('/expenses', requireAdmin, async (req, res) => {
  try {
    const { name, category, amount, type, branch, date, notes } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ error: 'Name and amount are required.' });
    }

    const expensePayload = {
      name,
      category: category || 'Facility Maintenance',
      amount: Number(amount),
      type: type || 'maintenance',
      branch: branch || 'sapna_sangeeta',
      date: date || 'Oct 2026',
      notes: notes || '',
    };

    if (dbState.connected) {
      const created = await Expense.create(expensePayload);
      return res.status(201).json({ message: 'Expense logged', expense: created });
    }

    fallbackExpenses.unshift({ ...expensePayload, id: `exp-${Date.now()}` });
    res.status(201).json({ message: 'Expense logged (fallback)', expense: expensePayload });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record expense.' });
  }
});

/**
 * GET /api/dashboard/workouts
 * Authenticated user fetches their workout history
 */
router.get('/workouts', requireAuth, async (req, res) => {
  try {
    if (dbState.connected) {
      const workouts = await Workout.find({ userEmail: req.user.email }).sort({ createdAt: -1 }).lean();
      return res.json({ workouts });
    }
    res.json({ workouts: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workouts.' });
  }
});

/**
 * POST /api/dashboard/workouts
 * Authenticated user logs a workout
 */
router.post('/workouts', requireAuth, async (req, res) => {
  try {
    const { exercise, sets, reps, weight, rpe, notes, date } = req.body;
    if (!exercise) {
      return res.status(400).json({ error: 'Exercise name is required.' });
    }

    const workoutPayload = {
      userEmail: req.user.email,
      exercise,
      sets: Number(sets) || 3,
      reps: Number(reps) || 10,
      weight: Number(weight) || 60,
      rpe: Number(rpe) || 7,
      notes: notes || '',
      date: date || 'Today',
    };

    if (dbState.connected) {
      const saved = await Workout.create(workoutPayload);
      return res.status(201).json({ message: 'Workout recorded', workout: saved });
    }

    res.status(201).json({ message: 'Workout recorded (fallback)', workout: workoutPayload });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save workout.' });
  }
});

/**
 * POST /api/dashboard/attendance
 * Check-in endpoint
 */
router.post('/attendance', requireAuth, async (req, res) => {
  try {
    const { memberName, branch, plan } = req.body;
    const entry = {
      userEmail: req.user.email,
      memberName: memberName || req.user.name,
      branch: branch || (req.user.branch === 'manik_bagh' ? 'Manik Bagh' : 'Sapna Sangeeta'),
      plan: plan || 'Quarterly Pro',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
    };

    if (dbState.connected) {
      const recorded = await Attendance.create(entry);
      // increment streak
      await User.updateOne({ email: req.user.email }, { $inc: { streakDays: 1 } });
      return res.status(201).json({ message: 'Check-in recorded', entry: recorded });
    }

    fallbackAttendance.unshift(entry);
    res.status(201).json({ message: 'Check-in recorded (fallback)', entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record attendance.' });
  }
});

/**
 * GET /api/dashboard/attendance
 */
router.get('/attendance', requireAuth, async (req, res) => {
  try {
    if (dbState.connected) {
      const logs = await Attendance.find().sort({ createdAt: -1 }).limit(20).lean();
      if (logs.length > 0) return res.json({ attendance: logs });
    }
    res.json({ attendance: fallbackAttendance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance.' });
  }
});

export default router;
