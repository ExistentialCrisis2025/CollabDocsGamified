import pool from "../db";

async function migrate() {
  try {

    await pool.query(`

      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,

        name VARCHAR(100) NOT NULL,

        description TEXT,

        rarity VARCHAR(20) DEFAULT 'common',

        rule JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_badges (

        id SERIAL PRIMARY KEY,

        user_id INT REFERENCES users(id)
          ON DELETE CASCADE,

        badge_id INT REFERENCES badges(id)
          ON DELETE CASCADE,

        unlocked_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(user_id, badge_id)
      );

    `);

    console.log(
      "Badge migration successful"
    );

    process.exit(0);

  } catch (err) {

    console.error(err);

    process.exit(1);
  }
}

migrate();