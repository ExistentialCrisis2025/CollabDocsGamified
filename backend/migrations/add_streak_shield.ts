import pool from "../db";

async function migrate() {

  try {

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS
      shield_used_at TIMESTAMP;
    `);

    console.log(
      "Shield migration complete"
    );

    process.exit(0);

  } catch(err) {

    console.error(err);

    process.exit(1);
  }
}

migrate();