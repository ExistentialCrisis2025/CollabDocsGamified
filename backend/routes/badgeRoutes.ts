import { Router, Request, Response } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get(
  '/me',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;

      const badges = await pool.query(
        `
        SELECT
          b.*,
          ub.unlocked_at
        FROM user_badges ub
        JOIN badges b
          ON ub.badge_id = b.id
        WHERE ub.user_id = $1
        ORDER BY ub.unlocked_at DESC
        `,
        [userId]
      );

      res.json(badges.rows);

      
    } catch (err: any) {
      console.error('[badgeRoutes] error:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;