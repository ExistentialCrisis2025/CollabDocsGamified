import pool from './db';

async function runMigrations() {
  console.log('[migrate] Running migrations...');
  
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS shield_used_at TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

    CREATE TABLE IF NOT EXISTS xp_events (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
      xp_amount INT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS xp_history (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      xp_amount INT NOT NULL,
      total_xp_after INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS levels (
      level INT PRIMARY KEY,
      xp_threshold INT NOT NULL
    );

    INSERT INTO levels (level, xp_threshold) VALUES
    (1,0),(2,100),(3,300),(4,600),(5,1000),
    (6,1500),(7,2100),(8,2800),(9,3600),(10,4500)
    ON CONFLICT (level) DO NOTHING;

    CREATE TABLE IF NOT EXISTS daily_completions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      completion_date DATE NOT NULL,
      tasks_completed INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, completion_date)
    );

    CREATE TABLE IF NOT EXISTS daily_quests (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      quest_type VARCHAR(50) NOT NULL,
      target_value INT NOT NULL DEFAULT 1,
      current_progress INT NOT NULL DEFAULT 0,
      bonus_xp INT NOT NULL DEFAULT 25,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      quest_date DATE NOT NULL,
      completed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, quest_date, quest_type)
    );

    CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      rarity VARCHAR(20) DEFAULT 'common',
      rule JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      badge_id INT REFERENCES badges(id) ON DELETE CASCADE,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS weekly_reports (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      report_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
      ON users (google_id)
      WHERE google_id IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_daily_completions_user_date
      ON daily_completions (user_id, completion_date);

    CREATE INDEX IF NOT EXISTS idx_daily_quests_user_date
      ON daily_quests (user_id, quest_date);

    INSERT INTO badges (name, description, rarity, rule) VALUES
    ('First Task', 'Complete your first task', 'common', '{"tasks_completed":1}'),
    ('Task Master', 'Complete 50 tasks', 'rare', '{"tasks_completed":50}'),
    ('Level 5', 'Reach Level 5', 'epic', '{"level":5}')
    ON CONFLICT DO NOTHING;
  `);

  console.log('[migrate] Done.');
  await pool.end();
}

runMigrations().catch(err => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});