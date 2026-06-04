import pool from "../db";

async function migrate() {

  try {

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS
      timezone VARCHAR(100)
      DEFAULT 'UTC';
    `);

    console.log(
      "Timezone migration complete"
    );

    process.exit(0);

  } catch(err) {

    console.error(err);

    process.exit(1);
  }
}

migrate();