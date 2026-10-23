/**
 * Express API server (MERN "E").
 * - Dev:  API only on PORT (default 3001); the Vite dev client (3000) proxies /api here.
 * - Prod: also statically serves the built SPA from /dist with an HTML fallback.
 */
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB, dbState } from './db.js';
import contentRouter from './routes/content.js';
import gymStatusRouter from './routes/gymStatus.js';
import authRouter, { seedInitialAuthAccounts } from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);

const app = express();
app.disable('x-powered-by');

// Dev-friendly CORS; lock CLIENT_ORIGIN down in production environments.
app.use(cors({ origin: true }));
app.use(express.json());

// ---- API ------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: dbState.mode, uptime: Math.round(process.uptime()) });
});
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/content', contentRouter);
app.use('/api/gym-status', gymStatusRouter);

// ---- Built SPA (production) -----------------------------------------------
const distDir = path.resolve(__dirname, '../dist');
const indexHtml = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtml)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Unknown API route' });
    }
    return res.sendFile(indexHtml);
  });
}

// Unknown /api/* routes → JSON 404 (matches both router-misses above)
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Unknown API route' });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
});

// ---- Boot -----------------------------------------------------------------
await connectDB();
await seedInitialAuthAccounts();

app.listen(PORT, () => {
  console.log(`[server] API ready on http://localhost:${PORT} (db: ${dbState.mode})`);
  if (fs.existsSync(indexHtml)) {
    console.log(`[server] serving built SPA from dist/`);
  }
});

process.on('SIGINT', async () => {
  await mongoose.connection.close().catch(() => {});
  process.exit(0);
});
