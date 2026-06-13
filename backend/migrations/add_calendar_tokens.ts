import pool from '../db';

async function migrate() {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_token_expiry BIGINT;
  `);

  console.log('[migration] google calendar tokens columns added.');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migration] Failed:', err);
    process.exit(1);
  });
