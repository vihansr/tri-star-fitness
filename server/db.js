/**
 * Database connection management.
 * If MongoDB is unreachable, the server keeps running and /api/content serves
 * the built-in seed data (dbState.mode === 'fallback').
 */
import mongoose from 'mongoose';
import { isAnyCollectionPopulated, seedDatabase } from './models.js';

export const dbState = {
  mode: 'awaiting', // 'awaiting' | 'mongo' | 'fallback'
  connected: false,
  uri: null,
};

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tristar_fitness';
  dbState.uri = uri;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    dbState.connected = true;
    dbState.mode = 'mongo';

    if (!(await isAnyCollectionPopulated())) {
      console.info('[db] empty database — seeding default content');
      await seedDatabase();
    }
    console.info('[db] connected:', uri);
  } catch (err) {
    dbState.connected = false;
    dbState.mode = 'fallback';
    console.warn(`[db] MongoDB unreachable (${err.message}).`);
    console.warn('[db] API will serve built-in fallback content. Start MongoDB and restart to use the database.');
  }
}
