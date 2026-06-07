import pool from './db';

async function runMigrations() {
  console.log('[migrate] Running migrations...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255) NOT NULL,
      total_xp INT DEFAULT 0,
      streak_tokens INT DEFAULT 0,
      streak_shields INT DEFAULT 0,
      streak_tokens_seeded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      level INT DEFAULT 1,
      current_streak INT DEFAULT 0,
      longest_streak INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      priority VARCHAR(50) DEFAULT 'medium',
      due_date TIMESTAMP WITH TIME ZONE,
      xp_reward INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'todo',
      position INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_tokens INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_shields INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_tokens_seeded_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE users ALTER COLUMN streak_tokens_seeded_at SET DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS shield_used_at TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

    UPDATE users
    SET streak_tokens = COALESCE(total_xp, 0),
        streak_tokens_seeded_at = CURRENT_TIMESTAMP
    WHERE streak_tokens_seeded_at IS NULL;

    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

    UPDATE tasks
    SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP)
    WHERE updated_at IS NULL;

    ALTER TABLE tasks ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

    CREATE INDEX IF NOT EXISTS idx_tasks_user_status_updated_at
    ON tasks(user_id, status, updated_at);

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
      name VARCHAR(100) NOT NULL UNIQUE,
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

    WITH canonical_badges AS (
      SELECT
        id,
        MIN(id) OVER (PARTITION BY LOWER(name)) AS canonical_id
      FROM badges
    )
    DELETE FROM user_badges ub
    USING canonical_badges cb
    WHERE ub.badge_id = cb.id
      AND cb.id <> cb.canonical_id
      AND EXISTS (
        SELECT 1
        FROM user_badges existing
        WHERE existing.user_id = ub.user_id
          AND existing.badge_id = cb.canonical_id
      );

    WITH canonical_badges AS (
      SELECT
        id,
        MIN(id) OVER (PARTITION BY LOWER(name)) AS canonical_id
      FROM badges
    )
    UPDATE user_badges ub
    SET badge_id = cb.canonical_id
    FROM canonical_badges cb
    WHERE ub.badge_id = cb.id
      AND cb.id <> cb.canonical_id;

    DELETE FROM user_badges a
    USING user_badges b
    WHERE a.id > b.id
      AND a.user_id = b.user_id
      AND a.badge_id = b.badge_id;

    DELETE FROM badges b
    USING badges canonical
    WHERE LOWER(b.name) = LOWER(canonical.name)
      AND b.id > canonical.id;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_name
      ON badges (name);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_lower_name
      ON badges (LOWER(name));

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
    ('Level 5', 'Reach Level 5', 'epic', '{"level":5}'),
    ('10 Day Streak', 'Maintain a 10 day streak', 'rare', '{"current_streak":10}'),
    ('50 Day Streak', 'Maintain a 50 day streak', 'epic', '{"current_streak":50}'),
    ('100 Day Streak', 'Maintain a 100 day streak', 'legendary', '{"current_streak":100}')
    ON CONFLICT (name) DO UPDATE
    SET description = EXCLUDED.description,
        rarity = EXCLUDED.rarity,
        rule = EXCLUDED.rule;
  `);

  console.log('[migrate] Done.');
  await pool.end();
}
runMigrations().catch(err => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});
