import pool from "../db";

export async function evaluateBadges(
   userId: number
) {

   const userRes = await pool.query(
      `
      SELECT
         level,
         total_xp,
         current_streak
      FROM users
      WHERE id = $1
      `,
      [userId]
   );

   const user =
      userRes.rows[0];

   const completedRes =
      await pool.query(
         `
         SELECT COUNT(*)
         FROM tasks
         WHERE
           user_id = $1
           AND status = 'done'
         `,
         [userId]
      );

   const tasksCompleted =
      Number(
         completedRes.rows[0].count
      );

   const badgesRes =
      await pool.query(
         `
         SELECT DISTINCT ON (LOWER(name)) *
         FROM badges
         ORDER BY LOWER(name), id ASC
         `
      );

   const unlocked = [];

   for (
      const badge of badgesRes.rows
   ) {

      const rule = badge.rule;

      let qualifies = false;

      if (
         rule.tasks_completed &&
         tasksCompleted >=
            rule.tasks_completed
      ) {
         qualifies = true;
      }

      if (
         rule.level &&
         user.level >= rule.level
      ) {
         qualifies = true;
      }

      if (
         rule.current_streak &&
         user.current_streak >= rule.current_streak
      ) {
         qualifies = true;
      }

      if (!qualifies) continue;

      const exists =
         await pool.query(
            `
            SELECT *
            FROM user_badges
            WHERE
              user_id=$1
              AND badge_id=$2
            `,
            [
               userId,
               badge.id,
            ]
         );

      if (
         exists.rows.length === 0
      ) {

         await pool.query(
            `
            INSERT INTO user_badges
            (
               user_id,
               badge_id
            )
            VALUES
            ($1,$2)
            `,
            [
               userId,
               badge.id,
            ]
         );

         unlocked.push(
            badge
         );
      }
   }

   return unlocked;
}
