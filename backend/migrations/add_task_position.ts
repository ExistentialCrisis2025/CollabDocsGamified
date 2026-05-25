import pool from '../db';

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
    `);

    console.log('✅  Task position migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('❌  Task position migration failed:', err);
    process.exit(1);
  }
}

migrate();
