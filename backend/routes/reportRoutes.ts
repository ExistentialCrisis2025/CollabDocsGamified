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
  generateWeeklyReportForUser,
} from "../services/weeklyReportService";

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

      const generated =
        await generateWeeklyReportForUser(
          userId
        );

      res.json({
        success: true,
        ...generated,
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
