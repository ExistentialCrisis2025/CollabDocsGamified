import pool from "../db";
import { buildPrompt } from "./buildReportPrompt";
import { generateReport } from "./reportGenerator";

const reportWindowSql = `
  SELECT
    NOW() - INTERVAL '7 days' AS week_start,
    NOW() AS week_end
`;

export async function generateWeeklyReportForUser(userId: number) {
  const user = await pool.query(
    `
    SELECT *
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (user.rows.length === 0) {
    throw new Error("User not found");
  }

  const window = await pool.query(reportWindowSql);
  const { week_start, week_end } = window.rows[0];

  const completed = await pool.query(
    `
    SELECT COUNT(*)
    FROM tasks
    WHERE
      user_id = $1
      AND status = 'done'
      AND updated_at >= $2
      AND updated_at < $3
    `,
    [userId, week_start, week_end]
  );

  const xp = await pool.query(
    `
    SELECT COALESCE(SUM(xp_amount), 0) AS weekly_xp
    FROM xp_events
    WHERE
      user_id = $1
      AND created_at >= $2
      AND created_at < $3
    `,
    [userId, week_start, week_end]
  );

  const prompt = buildPrompt({
    current_streak: user.rows[0].current_streak,
    tasks_completed: completed.rows[0].count,
    weekly_xp: xp.rows[0].weekly_xp,
    week_start,
    week_end,
  });

  const report = await generateReport(prompt);

  await pool.query(
    `
    INSERT INTO weekly_reports
    (
      user_id,
      report_text
    )
    VALUES
    ($1,$2)
    `,
    [userId, report]
  );

  return {
    report,
    week_start,
    week_end,
  };
}
