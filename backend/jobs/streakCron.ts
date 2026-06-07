import cron from "node-cron";
import pool from "../db";

export function startStreakCron(): void {
  cron.schedule("0 0 * * *", async () => {
    console.log(
      "[streakCron] Running midnight streak evaluation..."
    );

    try {
      const usersRes = await pool.query(`
        SELECT
          id,
          current_streak,
          longest_streak,
          timezone,
          streak_shields
        FROM users
      `);

      for (const user of usersRes.rows) {
        const userId: number = user.id;

        const currentStreak: number =
          user.current_streak ?? 0;

        const timezone: string =
          user.timezone || "UTC";

        const now =
          new Date();

        const yesterday =
          new Date(now);

        yesterday.setDate(
          yesterday.getDate() - 1
        );

        const yesterdayStr =
          new Intl.DateTimeFormat(
            "en-CA",
            {
              timeZone: timezone,
            }
          ).format(yesterday);

        const completionRes =
          await pool.query(
            `
            SELECT 1
            FROM daily_completions
            WHERE user_id = $1
              AND completion_date = $2
            LIMIT 1
            `,
            [
              userId,
              yesterdayStr,
            ]
          );

        const completedYesterday =
          completionRes.rows.length > 0;

        if (
          !completedYesterday &&
          currentStreak > 0
        ) {

          if ((user.streak_shields ?? 0) > 0) {

            await pool.query(
              `
              UPDATE users
              SET streak_shields =
                  GREATEST(COALESCE(streak_shields, 0) - 1, 0)
              WHERE id = $1
              `,
              [userId]
            );

            console.log(
              `[streakCron] User ${userId}: shield consumed, streak preserved`
            );

          } else {

            await pool.query(
              `
              UPDATE users
              SET current_streak = 0
              WHERE id = $1
              `,
              [userId]
            );

            console.log(
              `[streakCron] User ${userId}: streak broken (was ${currentStreak}), reset to 0`
            );
          }
        }
      }

      console.log(
        `[streakCron] Done. Processed ${usersRes.rows.length} user(s).`
      );

    } catch (err: any) {

      console.error(
        "[streakCron] Error during streak evaluation:",
        err.message
      );
    }
  });

  console.log(
    "[streakCron] Scheduled — fires daily at midnight."
  );
}
