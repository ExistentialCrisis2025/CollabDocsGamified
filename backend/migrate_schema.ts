import pool from './db';

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;

      CREATE TABLE IF NOT EXISTS xp_events (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
          xp_amount INT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS levels (
          level INT PRIMARY KEY,
          xp_threshold INT NOT NULL
      );

      INSERT INTO levels (level, xp_threshold) VALUES
      (1, 0), (2, 100), (3, 300), (4, 600), (5, 1000),
      (6, 1500), (7, 2100), (8, 2800), (9, 3600), (10, 4500)
      ON CONFLICT (level) DO NOTHING;
    `);
    console.log("Migration successful!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();