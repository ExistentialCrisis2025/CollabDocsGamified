import {
  Router,
  Request,
  Response,
} from "express";

import pool from "../db";

import {
  authenticateToken,
} from "../middleware/auth";

import {
  buildPrompt,
} from "../services/buildReportPrompt";

import {
  generateReport,
} from "../services/reportGenerator";

const router = Router();

router.get(
  "/history",
  authenticateToken,
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {

      const userId =
        (req as any).user.id;

      const reports =
        await pool.query(
          `
          SELECT *
          FROM weekly_reports
          WHERE user_id = $1
          ORDER BY created_at DESC
          `,
          [userId]
        );

      res.json(reports.rows);

    } catch (err: any) {

      console.error(
        "[reportRoutes]",
        err.message
      );

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);

router.post(
  "/generate-test",
  authenticateToken,
  async (
    req: Request,
    res: Response
  ): Promise<void> => {

    try {

      const userId =
        (req as any).user.id;

      const user =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE id = $1
          `,
          [userId]
        );

      const completed =
        await pool.query(
          `
          SELECT COUNT(*)
          FROM tasks
          WHERE
             user_id = $1
             AND status='done'
          `,
          [userId]
        );

      const prompt =
        buildPrompt({
          level:
            user.rows[0].level,

          total_xp:
            user.rows[0].total_xp,

          current_streak:
            user.rows[0].current_streak,

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
          userId,
          report,
        ]
      );

      res.json({
        success: true,
        report,
      });

    } catch (err: any) {

      console.error(
        "[generate-test]",
        err.message
      );

      res.status(500).json({
        error:
          "Failed to generate report",
      });
    }
  }
);

export default router;