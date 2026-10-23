/**
 * CLI seeder:  npm run seed [-- --reset]
 * Connects to MongoDB, optionally wipes collections (--reset) and upserts seed data.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, dbState } from './db.js';
import { dropContentCollections } from './models.js';

const wantsReset = process.argv.includes('--reset');

await connectDB();

if (dbState.connected && wantsReset) {
  console.info('[seed] --reset: wiping content collections before seeding');
  await dropContentCollections();
  await mongoose.connection.db.admin().ping();
  // connectDB() only seeds empty DBs; force-seed after a wipe
  const { seedDatabase } = await import('./models.js');
  await seedDatabase();
}

if (dbState.connected) {
  const counts = await Promise.all(
    mongoose.modelNames().map(async (name) => ({
      name,
      count: await mongoose.model(name).countDocuments(),
    }))
  );
  console.table(counts);
  await mongoose.connection.close();
  console.info('[seed] done.');
} else {
  console.error('[seed] MongoDB is not available — nothing was seeded.');
  console.error('[seed] The site still works using client/API fallback content.');
  process.exitCode = 1;
}
