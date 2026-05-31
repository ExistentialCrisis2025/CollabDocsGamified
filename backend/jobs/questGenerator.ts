import pool from '../db';

// ─────────────────────────────────────────────────────────────────────────────
// Quest Rule Engine
// Decides which 3 quests to give a user based on their recent activity.
// ─────────────────────────────────────────────────────────────────────────────

type QuestTemplate = {
  title: string;
  description: string;
  quest_type: string;
  target_value: number;
  bonus_xp: number;
};

/**
 * Builds a personalised set of 3 quest templates for a user
 * based on their recent task/completion history.
 *
 * Rules:
 *  1. If avg daily tasks < 3  → "Complete 2 tasks today"  (easy warm-up)
 *     If avg daily tasks >= 3 → "Complete 4 tasks today"  (push them)
 *  2. Earn XP today, scaled by user level
 *  3. If user has high-priority tasks pending → "Complete a high-priority task"
 */
async function buildQuestTemplates(
  userId: number,
  questDate: string
): Promise<QuestTemplate[]> {
  // Gather data for the rule engine
  const [avgRes, levelRes, highPriorityRes] = await Promise.all([
    // Average tasks completed per day over the last 7 days
    pool.query<{ avg_tasks: string }>(
      `SELECT COALESCE(AVG(tasks_completed), 0)::numeric(10,2) AS avg_tasks
       FROM daily_completions
       WHERE user_id = $1
         AND completion_date >= (CURRENT_DATE - INTERVAL '7 days')`,
      [userId]
    ),
    // Current level
    pool.query<{ level: number }>('SELECT level FROM users WHERE id = $1', [userId]),
    // Count of pending high-priority tasks
    pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM tasks
       WHERE user_id = $1 AND priority = 'high' AND status != 'done'`,
      [userId]
    ),
  ]);

  const avgTasks = parseFloat(avgRes.rows[0]?.avg_tasks ?? '0');
  const level = levelRes.rows[0]?.level ?? 1;
  const hasHighPriority = parseInt(highPriorityRes.rows[0]?.count ?? '0', 10) > 0;
  const xpTarget = Math.max(30, 30 + level * 15);

  const templates: QuestTemplate[] = [];

  // ── Quest 1: Task volume goal ────────────────────────────────────────────
  if (avgTasks < 3) {
    templates.push({
      title: 'Steady Progress',
      description: 'Complete 2 tasks today to build momentum.',
      quest_type: 'complete_tasks',
      target_value: 2,
      bonus_xp: 30,
    });
  } else {
    templates.push({
      title: 'High Performer',
      description: 'You\'re on a roll! Complete 4 tasks today.',
      quest_type: 'complete_tasks',
      target_value: 4,
      bonus_xp: 60,
    });
  }

  // ── Quest 2: Level-scaled XP goal ───────────────────────────────────────
  templates.push({
    title: `XP Hunter (Level ${level})`,
    description: `Earn ${xpTarget} XP today through task completions.`,
    quest_type: 'earn_xp',
    target_value: xpTarget,
    bonus_xp: 35,
  });

  // ── Quest 3: High-priority goal (only if applicable) ─────────────────────
  if (hasHighPriority) {
    templates.push({
      title: 'Priority Crusher',
      description: 'Complete at least one high-priority task today.',
      quest_type: 'complete_priority',
      target_value: 1,
      bonus_xp: 50,
    });
  }

  return templates;
}

/**
 * Generate daily quests for a single user.
 */
export async function generateQuestsForUser(
  userId: number,
  questDate: string
): Promise<void> {
  const templates = await buildQuestTemplates(userId, questDate);
  const allowedTypes = templates.map((tpl) => tpl.quest_type);

  // Remove obsolete quest types for today (e.g., streak_keep, old fallbacks)
  await pool.query(
    `DELETE FROM daily_quests
     WHERE user_id = $1 AND quest_date = $2
       AND NOT (quest_type = ANY($3::text[]))`,
    [userId, questDate, allowedTypes]
  );

  for (const tpl of templates) {
    await pool.query(
      `INSERT INTO daily_quests
         (user_id, title, description, quest_type, target_value, bonus_xp, status, quest_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
       ON CONFLICT (user_id, quest_date, quest_type)
       DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         target_value = EXCLUDED.target_value,
         bonus_xp = EXCLUDED.bonus_xp`,
      [userId, tpl.title, tpl.description, tpl.quest_type, tpl.target_value, tpl.bonus_xp, questDate]
    );
  }

  console.log(`[questGenerator] Generated ${templates.length} quests for user ${userId} on ${questDate}.`);
}

/**
 * Generate daily quests for ALL users.
 * Called by the morning cron job.
 */
export async function generateQuestsForAllUsers(questDate: string): Promise<void> {
  const usersRes = await pool.query<{ id: number }>('SELECT id FROM users');
  console.log(`[questGenerator] Generating quests for ${usersRes.rows.length} users on ${questDate}...`);

  for (const user of usersRes.rows) {
    try {
      await generateQuestsForUser(user.id, questDate);
    } catch (err: any) {
      console.error(`[questGenerator] Failed for user ${user.id}:`, err.message);
    }
  }
}
