import pool from "../db";

async function migrate() {
  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS weekly_reports (

        id SERIAL PRIMARY KEY,

        user_id INT
          REFERENCES users(id)
          ON DELETE CASCADE,

        report_text TEXT NOT NULL,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(
      "Weekly reports table created"
    );

    process.exit(0);

  } catch(err) {

    console.error(err);

    process.exit(1);
  }
}

migrate();