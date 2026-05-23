import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes  from './routes/authRoutes';
import taskRoutes  from './routes/taskRoutes';
import userRoutes  from './routes/userRoutes';
import { startStreakCron } from './jobs/streakCron';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/',       authRoutes);   // POST /register, POST /login
app.use('/tasks',  taskRoutes);   // CRUD + status patch
app.use('/users',  userRoutes);   // GET /users/me/xp, /me/streak, /me/dashboard

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'OK' }));

// ── Background jobs ───────────────────────────────────────────────────────────
startStreakCron();

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running on port ${PORT}`);
});
