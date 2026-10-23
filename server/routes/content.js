/**
 * GET /api/content
 * Returns all site content. Per-collection fallback: if a collection is empty
 * or a query fails, the built-in seed data is used for that array only.
 */
import { Router } from 'express';
import { dbState } from '../db.js';
import {
  Offer, Plan, Stat, GameIdea, Testimonial, Badge, QuizQuestion, Equipment,
} from '../models.js';
import seedData from '../seedData.js';

const router = Router();

async function fetchCollection(model) {
  const rows = await model.find({}).sort({ _id: 1 }).lean();
  return rows;
}

router.get('/', async (_req, res) => {
  if (!dbState.connected) {
    return res.json({ source: 'fallback', data: seedData });
  }

  try {
    const [offers, plans, stats, gameIdeas, testimonials, badges, questions, equipment] =
      await Promise.all([
        fetchCollection(Offer),
        fetchCollection(Plan),
        fetchCollection(Stat),
        fetchCollection(GameIdea),
        fetchCollection(Testimonial),
        fetchCollection(Badge),
        fetchCollection(QuizQuestion),
        fetchCollection(Equipment),
      ]);

    const source =
      offers.length && plans.length && stats.length && gameIdeas.length &&
      testimonials.length && badges.length && questions.length && equipment.length
        ? 'database'
        : 'database+fallback';

    return res.json({
      source,
      data: {
        offers: offers.length ? offers : seedData.offers,
        plans: plans.length ? plans : seedData.plans,
        stats: stats.length ? stats : seedData.stats,
        gameIdeas: gameIdeas.length ? gameIdeas : seedData.gameIdeas,
        testimonials: testimonials.length ? testimonials : seedData.testimonials,
        badges: badges.length ? badges : seedData.badges,
        questions: questions.length ? questions : seedData.questions,
        equipment: equipment.length ? equipment : seedData.equipment,
      },
    });
  } catch (err) {
    console.error('[api] /api/content failed, serving fallback:', err.message);
    return res.json({ source: 'fallback', data: seedData });
  }
});

export default router;
