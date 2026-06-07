import cron from "node-cron";

import pool from "../db";

import {
  generateWeeklyReportForUser
} from "../services/weeklyReportService";

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

        await generateWeeklyReportForUser(
          user.id
        );
      }
    }
  );
}
