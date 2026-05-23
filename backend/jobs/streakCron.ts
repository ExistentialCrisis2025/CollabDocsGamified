import cron from 'node-cron';
import pool from '../db';

/**
 * Streak cron — runs at 00:00:00 server-local time every day.
 *
 * Logic per user:
 *  - If the user did NOT complete any task yesterday → reset current_streak to 0.
 *
 * Note: Streak increments are now handled immediately inside taskRoutes
 * when the first task of the day is marked as 'done'.
 */
export function startStreakCron(): void {
  cron.schedule('0 0 * * *', async () => {
    console.log('[streakCron] Running midnight streak evaluation...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10); // YYYY-MM-DD

    try {
      // Fetch all users
      const usersRes = await pool.query(
        'SELECT id, current_streak, longest_streak FROM users'
      );

      for (const user of usersRes.rows) {
        const userId: number = user.id;
        const currentStreak: number = user.current_streak ?? 0;
        const longestStreak: number = user.longest_streak ?? 0;

        // Did this user complete a task yesterday?
        const completionRes = await pool.query(
          `SELECT 1 FROM daily_completions
           WHERE user_id = $1 AND completion_date = $2
           LIMIT 1`,
          [userId, yesterdayStr]
        );

        const completedYesterday = completionRes.rows.length > 0;

        if (!completedYesterday && currentStreak > 0) {
          // No completion yesterday — reset streak
          await pool.query(
            `UPDATE users SET current_streak = 0 WHERE id = $1`,
            [userId]
          );
          console.log(`[streakCron] User ${userId}: streak broken (was ${currentStreak}), reset to 0`);
        }
      }

      console.log(`[streakCron] Done. Processed ${usersRes.rows.length} user(s).`);
    } catch (err: any) {
      console.error('[streakCron] Error during streak evaluation:', err.message);
    }
  });

  console.log('[streakCron] Scheduled — fires daily at midnight.');
}
