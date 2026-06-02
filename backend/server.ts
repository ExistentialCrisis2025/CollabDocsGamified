import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes  from './routes/authRoutes';
import taskRoutes  from './routes/taskRoutes';
import userRoutes  from './routes/userRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import questRoutes from './routes/questRoutes';
import quoteRoutes from './routes/quoteRoutes';
import { startStreakCron } from './jobs/streakCron';
import { startQuestCron } from './jobs/questCron';
import badgeRoutes from './routes/badgeRoutes';
import analyticsRoutes from './routes/analyticsRoute'
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/',            authRoutes);         // POST /register, POST /login
app.use('/tasks',       taskRoutes);         // CRUD + status patch
app.use('/users',       userRoutes);         // GET /users/me/xp, /me/streak, /me/dashboard
app.use('/leaderboard', leaderboardRoutes);  // GET /leaderboard/weekly
app.use('/quests',      questRoutes);        // GET /quests/today, POST /quests/:id/complete
app.use('/quotes',      quoteRoutes);        // GET /quotes/random
app.use('/analytics',analyticsRoutes)

app.use('/badges',badgeRoutes);
// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'OK' }));

// ── Background jobs ───────────────────────────────────────────────────────────
startStreakCron();
startQuestCron();

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running on port ${PORT}`);
});
