import pool from '../db';

/**
 * Migration: Create the daily_quests table.
 *
 * quest_type values (rule-engine driven):
 *   - 'complete_tasks'    → Complete N tasks today
 *   - 'earn_xp'          → Earn N XP today
 *   - 'complete_priority' → Complete a task of a specific priority
 *   - 'streak_keep'      → Complete at least 1 task (keep streak alive)
 */
async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_quests (
      id              SERIAL PRIMARY KEY,
      user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title           VARCHAR(255) NOT NULL,
      description     TEXT,
      quest_type      VARCHAR(50) NOT NULL,
      target_value    INT NOT NULL DEFAULT 1,
      current_progress INT NOT NULL DEFAULT 0,
      bonus_xp        INT NOT NULL DEFAULT 25,
      status          VARCHAR(20) NOT NULL DEFAULT 'active',  -- active | completed | expired
      quest_date      DATE NOT NULL,
      completed_at    TIMESTAMP WITH TIME ZONE,
      created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, quest_date, quest_type)
    );

    CREATE INDEX IF NOT EXISTS idx_daily_quests_user_date
      ON daily_quests (user_id, quest_date);
  `);

  console.log('[migration] daily_quests table created (or already exists).');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migration] Failed:', err);
    process.exit(1);
  });
