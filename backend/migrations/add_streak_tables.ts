import pool from '../db';

/**
 * Migration: Day 4 — Streak System
 *
 * Adds to `users` table:
 *   - current_streak  INT DEFAULT 0
 *   - longest_streak  INT DEFAULT 0
 *
 * Creates `daily_completions` table:
 *   - Tracks how many tasks a user completed per calendar day.
 *   - Unique constraint (user_id, completion_date) lets us upsert safely.
 */
async function migrateStreak() {
  try {
    await pool.query(`
      -- Streak columns on users
      ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;

      -- Daily completion tracker
      CREATE TABLE IF NOT EXISTS daily_completions (
        id               SERIAL PRIMARY KEY,
        user_id          INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        completion_date  DATE NOT NULL,
        tasks_completed  INT NOT NULL DEFAULT 1,
        created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, completion_date)
      );

      CREATE INDEX IF NOT EXISTS idx_daily_completions_user_date
        ON daily_completions (user_id, completion_date);
    `);

    console.log('✅  Streak migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('❌  Streak migration failed:', err);
    process.exit(1);
  }
}

migrateStreak();
