import cron from "node-cron";

import pool from "../db";

import {
  buildPrompt
} from "../services/buildReportPrompt";

import {
  generateReport
} from "../services/reportGenerator";

export function startReportCron() {

  cron.schedule(
    "0 8 * * 1",
    async () => {

      console.log(
        "[reportCron] running"
      );

      const users =
        await pool.query(
          "SELECT * FROM users"
        );

      for (
        const user of users.rows
      ) {

        const completed =
          await pool.query(
            `
            SELECT COUNT(*)
            FROM tasks
            WHERE
              user_id = $1
              AND status='done'
            `,
            [user.id]
          );

        const prompt =
          buildPrompt({
            level:
              user.level,

            total_xp:
              user.total_xp,

            current_streak:
              user.current_streak,

            tasks_completed:
              completed.rows[0].count,
          });

        const report =
          await generateReport(
            prompt
          );

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
          [
            user.id,
            report
          ]
        );
      }
    }
  );
}