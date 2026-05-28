import pool from '../db';

async function migrate() {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
      ON users (google_id)
      WHERE google_id IS NOT NULL;
  `);

  console.log('[migration] google oauth columns added (or already exist).');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migration] Failed:', err);
    process.exit(1);
  });
