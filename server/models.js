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
