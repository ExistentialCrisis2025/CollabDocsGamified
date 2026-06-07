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

CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    rarity VARCHAR(20) DEFAULT 'common',
    rule JSONB NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_lower_name
    ON badges (LOWER(name));

CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_name
    ON badges (name);

CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    badge_id INT REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

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

CREATE TABLE IF NOT EXISTS daily_completions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    tasks_completed INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_completions_user_date
    ON daily_completions (user_id, completion_date);
