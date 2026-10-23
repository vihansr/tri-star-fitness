/**
 * GET /api/gym-status
 * Live gym-hours check using the same shared pure logic as the client
 * (src/lib/logic.js) converted to Asia/Kolkata on the server.
 */
import { Router } from 'express';
import { getIndoreTime, isGymOpenAtTime } from '../../src/lib/logic.js';

const router = Router();

router.get('/', (_req, res) => {
  const now = getIndoreTime(new Date());
  res.json({
    open: isGymOpenAtTime(now),
    hour: now.hour,
    minute: now.minute,
    day: now.day,
  });
});

export default router;
