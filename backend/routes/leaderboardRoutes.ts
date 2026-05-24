import { Router, Request, Response } from 'express';
import pool from '../db';
import redisClient from '../redisClient';

const router = Router();

// GET /leaderboard/weekly
router.get('/weekly', async (req: Request, res: Response): Promise<void> => {
  try {
    // Determine the user from token if available, to find their rank
    let currentUserId: string | null = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const redisRank = await redisClient.get(`session:${token}`);
      currentUserId = redisRank ? redisRank.toString() : null;
    }

    // Get top 10 from Redis
    const topUsersRaw = await redisClient.zRangeWithScores('leaderboard_weekly', 0, 9, { REV: true });
    
    // Fetch usernames for these top users from postgres
    const leaderboard = [];
    for (const entry of topUsersRaw) {
      const userRes = await pool.query('SELECT username FROM users WHERE id = $1', [parseInt(entry.value.toString(), 10)]);
      leaderboard.push({
        id: entry.value,
        username: userRes.rows.length > 0 ? userRes.rows[0].username : 'Unknown',
        total_xp: entry.score
      });
    }

    // Attempt to get the current user's rank
    let currentUserRank = null;
    if (currentUserId) {
      const rank = await redisClient.zRevRank('leaderboard_weekly', currentUserId);
      if (rank !== null) currentUserRank = Number(rank) + 1; // 1-based indexing for display
    }

    res.json({
      leaderboard,
      currentUserRank
    });
  } catch (err: any) {
    console.error('[leaderboardRoutes] error:', err.message);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});

export default router;
