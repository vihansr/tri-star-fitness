/**
 * Mongoose models — one collection per content type.
 * Each collection has a natural unique key used by the upsert-based seeder.
 */
import mongoose from 'mongoose';
import seedData from './seedData.js';

const { Schema, model } = mongoose;

const OfferSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  desc: String,
  accent: String,
  badge: String,
  svgIcon: String,
});

const PlanSchema = new Schema({
  name: { type: String, required: true, unique: true },
  accent: String,
  features: [String],
  buttonText: String,
  popular: Boolean,
});

const StatSchema = new Schema({
  label: { type: String, required: true, unique: true },
  value: Number,
  isDecimal: Boolean,
  suffix: String,
});

const GameIdeaSchema = new Schema({
  title: { type: String, required: true, unique: true },
  desc: String,
  accent: String,
});

const TestimonialSchema = new Schema({
  author: { type: String, required: true, unique: true },
  initial: String,
  quote: String,
});

const BadgeSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  description: String,
  icon: String,
});

const QuizQuestionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  question: String,
  correct: String,
  wrong: [String],
  explanation: String,
});

const EquipmentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  tag: String,
  category: String,
  weight: String,
  spec: String,
  material: String,
  description: String,
  accent: String,
});

export const Offer = model('Offer', OfferSchema);
export const Plan = model('Plan', PlanSchema);
export const Stat = model('Stat', StatSchema);
export const GameIdea = model('GameIdea', GameIdeaSchema);
export const Testimonial = model('Testimonial', TestimonialSchema);
export const Badge = model('Badge', BadgeSchema);
export const QuizQuestion = model('QuizQuestion', QuizQuestionSchema);
export const Equipment = model('Equipment', EquipmentSchema);

/* --- User / Member Schema (Real Backend Authentication & Dossier) --- */
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  branch: { type: String, enum: ['sapna_sangeeta', 'manik_bagh', 'combined'], default: 'sapna_sangeeta' },
  phone: { type: String, default: '+91 98260 00000' },
  age: { type: Number, default: 26 },
  gender: { type: String, default: 'Athlete' },
  bloodGroup: { type: String, default: 'B+' },
  address: { type: String, default: 'Indore, MP' },
  plan: { type: String, default: 'Quarterly Pro' },
  status: { type: String, default: 'active' },
  expiryDate: { type: String, default: '2026-12-31' },
  memberId: { type: String, unique: true },
  streakDays: { type: Number, default: 0 },
  emergencyContact: {
    name: { type: String, default: 'Family Contact' },
    phone: { type: String, default: '+91 98260 99999' },
    relation: { type: String, default: 'Family' },
  },
  healthNotes: { type: String, default: 'Cleared for high-intensity barbell training.' },
  coach: { type: String, default: 'Coach Mohit (Head Coach)' },
  adminNotes: { type: String, default: '' },
  package: {
    startDate: { type: String, default: '2026-09-01' },
    endDate: { type: String, default: '2026-12-31' },
    durationMonths: { type: Number, default: 3 },
    fee: { type: Number, default: 8500 },
    paymentStatus: { type: String, default: 'Paid' },
    paymentMethod: { type: String, default: 'UPI' },
    lockerAllocated: { type: String, default: 'Standard' },
  },
  createdAt: { type: Date, default: Date.now },
});

/* --- Workout Log Schema --- */
const WorkoutSchema = new Schema({
  userEmail: { type: String, required: true, index: true },
  exercise: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  weight: { type: Number, default: 60 },
  rpe: { type: Number, default: 7 },
  notes: { type: String, default: '' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  createdAt: { type: Date, default: Date.now },
});

/* --- Operational Expense Schema --- */
const ExpenseSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, default: 'maintenance' },
  branch: { type: String, enum: ['sapna_sangeeta', 'manik_bagh', 'combined'], default: 'sapna_sangeeta' },
  date: { type: String, default: 'Oct 2026' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

/* --- Attendance Check-in Schema --- */
const AttendanceSchema = new Schema({
  userEmail: { type: String, default: '' },
  memberName: { type: String, required: true },
  branch: { type: String, default: 'Sapna Sangeeta' },
  plan: { type: String, default: 'Quarterly Pro' },
  time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  createdAt: { type: Date, default: Date.now },
});

export const User = model('User', UserSchema);
export const Workout = model('Workout', WorkoutSchema);
export const Expense = model('Expense', ExpenseSchema);
export const Attendance = model('Attendance', AttendanceSchema);

/** Collection registry: model + natural key + seed items */
export const COLLECTIONS = [
  { model: Offer, key: 'id', items: seedData.offers },
  { model: Plan, key: 'name', items: seedData.plans },
  { model: Stat, key: 'label', items: seedData.stats },
  { model: GameIdea, key: 'title', items: seedData.gameIdeas },
  { model: Testimonial, key: 'author', items: seedData.testimonials },
  { model: Badge, key: 'id', items: seedData.badges },
  { model: QuizQuestion, key: 'id', items: seedData.questions },
  { model: Equipment, key: 'id', items: seedData.equipment },
];

export function isAnyCollectionPopulated() {
  return Promise.all(COLLECTIONS.map(({ model }) => model.countDocuments())).then(
    (counts) => counts.some((c) => c > 0)
  );
}

/** Upsert seed data into every collection (safe to run repeatedly). */
export async function seedDatabase() {
  for (const { model, key, items } of COLLECTIONS) {
    for (const item of items) {
      await model.updateOne({ [key]: item[key] }, { $set: { ...item } }, { upsert: true });
    }
  }
}

/** Delete every seeded document (used by `npm run seed -- --reset`). */
export async function dropContentCollections() {
  await Promise.all(COLLECTIONS.map(({ model }) => model.deleteMany({})));
}

