import {
   Router,
   Request,
   Response
} from "express";

import pool from "../db";

import {
   authenticateToken
} from "../middleware/auth";

const router = Router();

router.get(
   "/overview",
   authenticateToken,
   async (
      req: Request,
      res: Response
   ): Promise<void> => {

      try {

         const userId =
            (req as any).user.id;

         const tasks =
            await pool.query(
               `
               SELECT
                  completion_date,
                  tasks_completed
               FROM daily_completions
               WHERE user_id = $1
               ORDER BY completion_date
               `,
               [userId]
            );

         const xp =
            await pool.query(
               `
               SELECT
                  DATE(created_at) as day,
                  MAX(total_xp_after)
                     as total_xp
               FROM xp_history
               WHERE user_id = $1
               GROUP BY DATE(created_at)
               ORDER BY day
               `,
               [userId]
            );

         res.json({

            tasksPerDay:
               tasks.rows,

            xpOverTime:
               xp.rows
         });

      } catch (err: any) {

         console.error(
            "[analyticsRoutes]",
            err.message
         );

         res.status(500).json({
            error:
               "Server error"
         });
      }
   }
);

export default router;