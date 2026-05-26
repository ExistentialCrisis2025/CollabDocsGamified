import { Router, Request, Response } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';
import redisClient from '../redisClient';
import { refreshQuestProgress } from './questRoutes';

const router = Router();

// POST /tasks — create a task
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { title, description, priority, due_date, xp_reward, status, position } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const newTask = await pool.query(
      `INSERT INTO tasks (user_id, title, description, priority, due_date, xp_reward, status, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, title, description, priority || 'medium', due_date, xp_reward || 0, status || 'todo', position || 0]
    );

    res.status(201).json(newTask.rows[0]);
  } catch (err: any) {
    console.error('[taskRoutes] create error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /tasks — list tasks for the authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const tasks = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY position ASC, created_at DESC',
      [userId]
    );
    res.json(tasks.rows);
  } catch (err: any) {
    console.error('[taskRoutes] list error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /tasks/:id — full update
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
    const { title, description, priority, due_date, xp_reward, status } = req.body;

    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );
    if (taskCheck.rows.length === 0) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }

    const updatedTask = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, priority=$3, due_date=$4,
       xp_reward=$5, status=$6 WHERE id=$7 AND user_id=$8 RETURNING *`,
      [title, description, priority, due_date, xp_reward, status, taskId, userId]
    );

    res.json(updatedTask.rows[0]);
  } catch (err: any) {
    console.error('[taskRoutes] update error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /tasks/reorder — batch update tasks positions and statuses
router.patch('/reorder', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const userId = (req as any).user.id;
    const { tasks } = req.body; // array of { id, status, position }

    if (!tasks || !Array.isArray(tasks)) {
      res.status(400).json({ error: 'Tasks array is required' });
      return;
    }

    await client.query('BEGIN');

    for (const task of tasks) {
      await client.query(
        'UPDATE tasks SET status = $1, position = $2 WHERE id = $3 AND user_id = $4',
        [task.status, task.position, task.id, userId]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Tasks reordered successfully' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[taskRoutes] reorder error:', err.message);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// PATCH /tasks/:id/status — update status + award/revoke XP + record daily completion
router.patch('/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );
    if (taskCheck.rows.length === 0) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }

    const task = taskCheck.rows[0];
    const oldStatus = task.status;
    const xpReward = task.xp_reward || 0;

    const updatedTask = await pool.query(
      'UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING *',
      [status, taskId, userId]
    );

    let xpAssigned = 0;

    if (oldStatus !== 'done' && status === 'done') {
      xpAssigned = xpReward;
      await pool.query(
        'INSERT INTO xp_events (user_id, task_id, xp_amount) VALUES ($1, $2, $3)',
        [userId, taskId, xpReward]
      );

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      // Check if this is the first task completed today
      const checkToday = await pool.query(
        'SELECT 1 FROM daily_completions WHERE user_id = $1 AND completion_date = $2',
        [userId, today]
      );
      const isFirstOfToday = checkToday.rows.length === 0;

      // Record daily completion (idempotent — one row per user per day)
      await pool.query(
        `INSERT INTO daily_completions (user_id, completion_date, tasks_completed)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, completion_date)
         DO UPDATE SET tasks_completed = daily_completions.tasks_completed + 1`,
        [userId, today]
      );

      if (isFirstOfToday) {
        // Immediate streak increment
        await pool.query(
          `UPDATE users 
           SET current_streak = COALESCE(current_streak, 0) + 1,
               longest_streak = GREATEST(COALESCE(longest_streak, 0), COALESCE(current_streak, 0) + 1)
           WHERE id = $1`,
          [userId]
        );
      }
    } else if (oldStatus === 'done' && status !== 'done') {
      xpAssigned = -xpReward;
      await pool.query(
        'INSERT INTO xp_events (user_id, task_id, xp_amount) VALUES ($1, $2, $3)',
        [userId, taskId, -xpReward]
      );
    }

    if (xpAssigned !== 0) {
      const userRes = await pool.query(
        'UPDATE users SET total_xp = total_xp + $1 WHERE id = $2 RETURNING total_xp',
        [xpAssigned, userId]
      );
      const newTotalXp = userRes.rows[0].total_xp;

      // Update Redis Leaderboard (Sorted Set)
      await redisClient.zAdd('leaderboard_weekly', {
        score: newTotalXp,
        value: String(userId)
      });

      const levelRes = await pool.query(
        'SELECT level FROM levels WHERE xp_threshold <= $1 ORDER BY level DESC LIMIT 1',
        [newTotalXp]
      );
      const newLevel = levelRes.rows.length > 0 ? levelRes.rows[0].level : 1;
      await pool.query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, userId]);

      // Refresh quest progress after any XP-awarding task change
      const today = new Date().toISOString().slice(0, 10);
      await refreshQuestProgress(userId, today);
    }

    res.json(updatedTask.rows[0]);
  } catch (err: any) {
    console.error('[taskRoutes] status update error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /tasks/:id
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;

    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );
    if (taskCheck.rows.length === 0) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }

    await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err: any) {
    console.error('[taskRoutes] delete error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
