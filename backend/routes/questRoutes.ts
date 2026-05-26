import { Router, Request, Response } from 'express';
import pool from '../db';
import redisClient from '../redisClient';
import { authenticateToken } from '../middleware/auth';
import { generateQuestsForUser } from '../jobs/questGenerator';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: recalculate and update the progress for all of a user's active quests.
// Called after any task completion to keep quest progress in sync.
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshQuestProgress(
  userId: number,
  today: string
): Promise<void> {
  const activeQuests = await pool.query(
    `SELECT * FROM daily_quests
     WHERE user_id = $1 AND quest_date = $2 AND status = 'active'`,
    [userId, today]
  );

  if (activeQuests.rows.length === 0) return;

  // Gather live data for all quest types at once
  const [tasksCompletedRes, xpEarnedRes, highPriorityDoneRes] = await Promise.all([
    // Total tasks completed today
    pool.query<{ tasks_completed: number }>(
      `SELECT COALESCE(tasks_completed, 0) AS tasks_completed
       FROM daily_completions WHERE user_id = $1 AND completion_date = $2`,
      [userId, today]
    ),
    // Total XP earned today (from xp_events)
    pool.query<{ total_xp: string }>(
      `SELECT COALESCE(SUM(xp_amount), 0) AS total_xp
       FROM xp_events
       WHERE user_id = $1 AND xp_amount > 0
         AND DATE(created_at AT TIME ZONE 'UTC') = $2`,
      [userId, today]
    ),
    // High-priority tasks completed today
    pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM tasks
       WHERE user_id = $1 AND priority = 'high' AND status = 'done'
         AND DATE(updated_at AT TIME ZONE 'UTC') = $2`,
      [userId, today]
    ),
  ]);

  const tasksCompletedToday = tasksCompletedRes.rows[0]?.tasks_completed ?? 0;
  const xpEarnedToday = parseInt(xpEarnedRes.rows[0]?.total_xp ?? '0', 10);
  const highPriorityDoneToday = parseInt(highPriorityDoneRes.rows[0]?.count ?? '0', 10);

  for (const quest of activeQuests.rows) {
    let newProgress = 0;

    switch (quest.quest_type) {
      case 'complete_tasks':
        newProgress = tasksCompletedToday;
        break;
      case 'earn_xp':
        newProgress = xpEarnedToday;
        break;
      case 'complete_priority':
        newProgress = highPriorityDoneToday;
        break;
      case 'streak_keep':
        newProgress = tasksCompletedToday >= 1 ? 1 : 0;
        break;
      default:
        newProgress = quest.current_progress;
    }

    newProgress = Math.min(newProgress, quest.target_value);

    await pool.query(
      `UPDATE daily_quests SET current_progress = $1 WHERE id = $2`,
      [newProgress, quest.id]
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /quests/today — get the current user's quests for today
// Also auto-generates quests if none exist yet (useful on first login of the day)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/today', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const today = new Date().toISOString().slice(0, 10);

    // Auto-generate quests if none exist for today yet
    await generateQuestsForUser(userId, today);

    // Refresh progress before returning
    await refreshQuestProgress(userId, today);

    const quests = await pool.query(
      `SELECT * FROM daily_quests
       WHERE user_id = $1 AND quest_date = $2
       ORDER BY id ASC`,
      [userId, today]
    );

    res.json({ quests: quests.rows, date: today });
  } catch (err: any) {
    console.error('[questRoutes] today error:', err.message);
    res.status(500).json({ error: 'Server error fetching quests' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /quests/:id/complete — manually award bonus XP for a completed quest
// Only succeeds if the quest's current_progress >= target_value
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/complete', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const questId = req.params.id;
    const today = new Date().toISOString().slice(0, 10);

    // Fetch the quest
    const questRes = await pool.query(
      `SELECT * FROM daily_quests WHERE id = $1 AND user_id = $2`,
      [questId, userId]
    );

    if (questRes.rows.length === 0) {
      res.status(404).json({ error: 'Quest not found or unauthorized' });
      return;
    }

    const quest = questRes.rows[0];

    if (quest.status === 'completed') {
      res.status(409).json({ error: 'Quest already completed' });
      return;
    }

    if (quest.status === 'expired') {
      res.status(409).json({ error: 'Quest has expired' });
      return;
    }

    // Refresh progress first so we have the latest value
    await refreshQuestProgress(userId, today);

    const refreshedRes = await pool.query(
      'SELECT current_progress, target_value FROM daily_quests WHERE id = $1',
      [questId]
    );
    const refreshed = refreshedRes.rows[0];

    if (refreshed.current_progress < refreshed.target_value) {
      res.status(400).json({
        error: 'Quest objective not yet met',
        progress: refreshed.current_progress,
        target: refreshed.target_value,
      });
      return;
    }

    // Mark quest as completed
    await pool.query(
      `UPDATE daily_quests
       SET status = 'completed', completed_at = NOW(), current_progress = $1
       WHERE id = $2`,
      [refreshed.target_value, questId]
    );

    // Award bonus XP to user
    const bonusXp = quest.bonus_xp;
    const userRes = await pool.query(
      'UPDATE users SET total_xp = total_xp + $1 WHERE id = $2 RETURNING total_xp',
      [bonusXp, userId]
    );
    const newTotalXp = userRes.rows[0].total_xp;

    // Log XP event (task_id is NULL for quest rewards)
    await pool.query(
      'INSERT INTO xp_events (user_id, task_id, xp_amount) VALUES ($1, NULL, $2)',
      [userId, bonusXp]
    );

    // Update Redis leaderboard
    await redisClient.zAdd('leaderboard_weekly', {
      score: newTotalXp,
      value: String(userId),
    });

    // Update level
    const levelRes = await pool.query(
      'SELECT level FROM levels WHERE xp_threshold <= $1 ORDER BY level DESC LIMIT 1',
      [newTotalXp]
    );
    const newLevel = levelRes.rows.length > 0 ? levelRes.rows[0].level : 1;
    await pool.query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, userId]);

    res.json({
      message: 'Quest completed! Bonus XP awarded.',
      bonus_xp: bonusXp,
      total_xp: newTotalXp,
      level: newLevel,
    });
  } catch (err: any) {
    console.error('[questRoutes] complete error:', err.message);
    res.status(500).json({ error: 'Server error completing quest' });
  }
});

export default router;
