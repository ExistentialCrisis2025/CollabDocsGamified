import pool from '../db';

/**
 * Migration: Adds updated_at column to tasks table.
 * Needed for quest progress tracking (high-priority tasks completed today).
 */
async function migrate() {
  await pool.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  `);

  console.log('[migration] updated_at column added to tasks (or already exists).');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migration] Failed:', err);
    process.exit(1);
  });
