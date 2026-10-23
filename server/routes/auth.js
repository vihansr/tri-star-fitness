import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models.js';
import { JWT_SECRET, requireAuth } from '../middleware/auth.js';
import { dbState } from '../db.js';

const router = Router();

// In-memory fallback user store if MongoDB is offline
const fallbackUsers = [];

/**
 * Seed initial administrative & athlete accounts if none exist.
 */
export async function seedInitialAuthAccounts() {
  const defaultAccounts = [
    {
      name: 'Tri-Star Owner / Head Admin',
      email: 'admin@tristar.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      branch: 'combined',
      phone: '+91 98260 11000',
      memberId: 'TS-ADM-001',
      plan: 'Executive All-Access',
      status: 'active',
      streakDays: 45,
    },
    {
      name: 'Arjun Sharma',
      email: 'arjun@tristar.com',
      password: await bcrypt.hash('user123', 10),
      role: 'user',
      branch: 'sapna_sangeeta',
      phone: '+91 98260 12345',
      memberId: 'TS-IND-1042',
      age: 26,
      gender: 'Male',
      bloodGroup: 'B+',
      plan: 'Quarterly Pro',
      status: 'active',
      streakDays: 14,
      expiryDate: '2026-12-15',
    },
    {
      name: 'Priya Patel',
      email: 'priya@tristar.com',
      password: await bcrypt.hash('user123', 10),
      role: 'user',
      branch: 'manik_bagh',
      phone: '+91 98260 23456',
      memberId: 'TS-IND-1044',
      age: 24,
      gender: 'Female',
      bloodGroup: 'A+',
      plan: 'Annual Elite',
      status: 'active',
      streakDays: 28,
      expiryDate: '2027-04-10',
    },
  ];

  if (dbState.connected) {
    for (const acc of defaultAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        await User.create(acc);
      }
    }
  } else {
    for (const acc of defaultAccounts) {
      if (!fallbackUsers.some((u) => u.email === acc.email)) {
        fallbackUsers.push({ ...acc, _id: `fallback-${Date.now()}-${Math.random()}` });
      }
    }
  }
}

/**
 * Helper: Find user by email
 */
async function findUserByEmail(email) {
  const normalized = email.toLowerCase().trim();
  if (dbState.connected) {
    return await User.findOne({ email: normalized });
  }
  return fallbackUsers.find((u) => u.email.toLowerCase().trim() === normalized);
}

/**
 * Helper: Generate JWT token
 */
function createToken(user) {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      branch: user.branch || 'sapna_sangeeta',
      memberId: user.memberId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/register
 * Register a new User or Admin
 */
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'user',
      branch = 'sapna_sangeeta',
      phone,
      age,
      gender,
      bloodGroup,
      adminPin,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify admin passcode if registering as admin
    if (role === 'admin' && adminPin !== '1234' && adminPin !== 'TRISTAR2026') {
      return res.status(403).json({
        error: 'Invalid Admin Security PIN. Please provide the authorized gym admin PIN (1234).',
      });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const memberId = `TS-${role === 'admin' ? 'ADM' : 'IND'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUserPayload = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      branch: branch || 'sapna_sangeeta',
      phone: phone || '+91 98260 00000',
      age: Number(age) || 25,
      gender: gender || 'Athlete',
      bloodGroup: bloodGroup || 'B+',
      memberId,
      plan: role === 'admin' ? 'Admin / Management' : 'Quarterly Pro',
      status: 'active',
      expiryDate: '2026-12-31',
      streakDays: 1,
    };

    let savedUser;
    if (dbState.connected) {
      savedUser = await User.create(newUserPayload);
    } else {
      savedUser = { ...newUserPayload, _id: `fallback-${Date.now()}` };
      fallbackUsers.push(savedUser);
    }

    const token = createToken(savedUser);

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        branch: savedUser.branch,
        memberId: savedUser.memberId,
        plan: savedUser.plan,
        status: savedUser.status,
        streakDays: savedUser.streakDays,
        phone: savedUser.phone,
        age: savedUser.age,
        gender: savedUser.gender,
        bloodGroup: savedUser.bloodGroup,
        expiryDate: savedUser.expiryDate,
      },
    });
  } catch (err) {
    console.error('[auth] registration error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 * Log in as User or Admin
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Auto seed if empty
    await seedInitialAuthAccounts();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Role check if specific role requested
    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({
        error: `This account is registered as '${user.role.toUpperCase()}'. Please log in through the ${user.role} portal.`,
      });
    }

    const token = createToken(user);

    res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch || 'sapna_sangeeta',
        memberId: user.memberId || 'TS-IND-1000',
        plan: user.plan || 'Quarterly Pro',
        status: user.status || 'active',
        streakDays: user.streakDays || 0,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        expiryDate: user.expiryDate || '2026-12-31',
      },
    });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ error: 'Login failed. Please check your credentials.' });
  }
});

/**
 * GET /api/auth/me
 * Get currently authenticated user
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        memberId: user.memberId,
        plan: user.plan,
        status: user.status,
        streakDays: user.streakDays,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        expiryDate: user.expiryDate,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

export default router;
