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
 *  2. If user has a streak > 2 → "Keep your streak alive" (1 task min)
 *     Otherwise               → "Earn 50 XP today"
 *  3. If user has high-priority tasks pending → "Complete a high-priority task"
 *     Otherwise                              → "Complete 3 tasks today" (fallback)
 */
async function buildQuestTemplates(
  userId: number,
  questDate: string
): Promise<QuestTemplate[]> {
  // Gather data for the rule engine
  const [avgRes, streakRes, highPriorityRes] = await Promise.all([
    // Average tasks completed per day over the last 7 days
    pool.query<{ avg_tasks: string }>(
      `SELECT COALESCE(AVG(tasks_completed), 0)::numeric(10,2) AS avg_tasks
       FROM daily_completions
       WHERE user_id = $1
         AND completion_date >= (CURRENT_DATE - INTERVAL '7 days')`,
      [userId]
    ),
    // Current streak
    pool.query<{ current_streak: number }>(
      'SELECT current_streak FROM users WHERE id = $1',
      [userId]
    ),
    // Count of pending high-priority tasks
    pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM tasks
       WHERE user_id = $1 AND priority = 'high' AND status != 'done'`,
      [userId]
    ),
  ]);

  const avgTasks = parseFloat(avgRes.rows[0]?.avg_tasks ?? '0');
  const currentStreak = streakRes.rows[0]?.current_streak ?? 0;
  const hasHighPriority = parseInt(highPriorityRes.rows[0]?.count ?? '0', 10) > 0;

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

  // ── Quest 2: Streak/XP goal ───────────────────────────────────────────────
  if (currentStreak > 2) {
    templates.push({
      title: `Protect the Streak (${currentStreak} days)`,
      description: 'Keep your streak alive by completing at least 1 task today.',
      quest_type: 'streak_keep',
      target_value: 1,
      bonus_xp: 25,
    });
  } else {
    templates.push({
      title: 'XP Hunter',
      description: 'Earn 50 XP today through task completions.',
      quest_type: 'earn_xp',
      target_value: 50,
      bonus_xp: 35,
    });
  }

  // ── Quest 3: Priority / fallback goal ────────────────────────────────────
  if (hasHighPriority) {
    templates.push({
      title: 'Priority Crusher',
      description: 'Complete at least one high-priority task today.',
      quest_type: 'complete_priority',
      target_value: 1,
      bonus_xp: 50,
    });
  } else {
    templates.push({
      title: 'Triple Threat',
      description: 'Complete 3 tasks today.',
      quest_type: 'complete_tasks',
      target_value: 3,
      bonus_xp: 40,
    });
  }

  return templates;
}

/**
 * Generate 3 daily quests for a single user.
 * Skips if quests already exist for today.
 */
export async function generateQuestsForUser(
  userId: number,
  questDate: string
): Promise<void> {
  // Check if quests already exist for this user+date
  const existing = await pool.query(
    'SELECT COUNT(*) AS count FROM daily_quests WHERE user_id = $1 AND quest_date = $2',
    [userId, questDate]
  );
  if (parseInt(existing.rows[0].count, 10) >= 3) {
    console.log(`[questGenerator] User ${userId} already has quests for ${questDate}. Skipping.`);
    return;
  }

  const templates = await buildQuestTemplates(userId, questDate);

  for (const tpl of templates) {
    await pool.query(
      `INSERT INTO daily_quests
         (user_id, title, description, quest_type, target_value, bonus_xp, status, quest_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
       ON CONFLICT (user_id, quest_date, quest_type) DO NOTHING`,
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
