import { Router, Request, Response } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /users/me/xp — current XP, level, and next level threshold
router.get('/me/xp', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const userRes = await pool.query(
      'SELECT total_xp, level FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { total_xp, level } = userRes.rows[0];

    const nextLevelRes = await pool.query(
      'SELECT xp_threshold FROM levels WHERE level = $1',
      [level + 1]
    );
    const next_level_xp = nextLevelRes.rows.length > 0
      ? nextLevelRes.rows[0].xp_threshold
      : null;

    res.json({ total_xp, level, next_level_xp });
  } catch (err: any) {
    console.error('[userRoutes] xp error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /users/me/streak — current streak, longest streak, today's completion status
router.get('/me/streak', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const userRes = await pool.query(
      'SELECT current_streak, longest_streak FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const todayCheck = await pool.query(
      'SELECT tasks_completed FROM daily_completions WHERE user_id = $1 AND completion_date = $2',
      [userId, today]
    );

    res.json({
      current_streak: userRes.rows[0].current_streak,
      longest_streak: userRes.rows[0].longest_streak,
      completed_today: todayCheck.rows.length > 0,
      tasks_completed_today: todayCheck.rows.length > 0 ? todayCheck.rows[0].tasks_completed : 0,
    });
  } catch (err: any) {
    console.error('[userRoutes] streak error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /users/me/dashboard — all data the dashboard needs in one call
router.get('/me/dashboard', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // User core stats
    const userRes = await pool.query(
      'SELECT id, username, email, total_xp, level, current_streak, longest_streak,timezone FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const user = userRes.rows[0];

    // Next level threshold
    const nextLevelRes = await pool.query(
      'SELECT xp_threshold FROM levels WHERE level = $1',
      [user.level + 1]
    );
    const next_level_xp = nextLevelRes.rows.length > 0
      ? nextLevelRes.rows[0].xp_threshold
      : null;

    // Today's tasks
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = await pool.query(
      `SELECT * FROM tasks
       WHERE user_id = $1
         AND DATE(created_at AT TIME ZONE 'UTC') = $2
       ORDER BY created_at DESC`,
      [userId, today]
    );

    // Today's completion record
    const todayCompletion = await pool.query(
      'SELECT tasks_completed FROM daily_completions WHERE user_id = $1 AND completion_date = $2',
      [userId, today]
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        total_xp: user.total_xp,
        level: user.level,
        next_level_xp,
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
      },
      completed_today: todayCompletion.rows.length > 0,
      tasks_completed_today:
        todayCompletion.rows.length > 0 ? todayCompletion.rows[0].tasks_completed : 0,
      todays_tasks: todayTasks.rows,
    });
  } catch (err: any) {
    console.error('[userRoutes] dashboard error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  "/use-shield",
  authenticateToken,
  async (
    req: Request,
    res: Response
  ): Promise<void> => {

    try {

      const userId =
        (req as any).user.id;

      await pool.query(
        `
        UPDATE users
        SET shield_used_at =
            CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [userId]
      );

      res.json({
        success: true,
      });

    } catch(err:any) {

      res.status(500).json({
        error:
          "Failed to use shield"
      });
    }
  }
);

router.get(
  "/me/shield",
  authenticateToken,
  async (
    req: Request,
    res: Response
  ): Promise<void> => {

    const userId =
      (req as any).user.id;

    const result =
      await pool.query(
        `
        SELECT shield_used_at
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

    res.json({
      shield_used_at:
        result.rows[0]
          .shield_used_at
    });
  }
);

router.patch(
  "/me/timezone",
  authenticateToken,
  async (
    req: Request,
    res: Response
  ): Promise<void> => {

    const userId =
      (req as any).user.id;

    const {
      timezone
    } = req.body;

    await pool.query(
      `
      UPDATE users
      SET timezone = $1
      WHERE id = $2
      `,
      [
        timezone,
        userId
      ]
    );

    res.json({
      success: true
    });
  }
);

export default router;
