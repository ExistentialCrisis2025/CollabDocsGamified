import pool from "../db";

async function seedBadges() {

  await pool.query(`
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

    WITH canonical_badges AS (
      SELECT
        id,
        MIN(id) OVER (PARTITION BY LOWER(name)) AS canonical_id
      FROM badges
    )
    DELETE FROM badges b
    USING canonical_badges cb
    WHERE b.id = cb.id
      AND cb.id <> cb.canonical_id;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_name
      ON badges (name);
  `);

  await pool.query(`

    INSERT INTO badges
    (name, description, rarity, rule)

    VALUES

    (
      'First Task',
      'Complete your first task',
      'common',
      '{"tasks_completed":1}'
    ),

    (
      'Task Master',
      'Complete 50 tasks',
      'rare',
      '{"tasks_completed":50}'
    ),

    (
      'Level 5',
      'Reach Level 5',
      'epic',
      '{"level":5}'
    ),

    (
      '10 Day Streak',
      'Maintain a 10 day streak',
      'rare',
      '{"current_streak":10}'
    ),

    (
      '50 Day Streak',
      'Maintain a 50 day streak',
      'epic',
      '{"current_streak":50}'
    ),

    (
      '100 Day Streak',
      'Maintain a 100 day streak',
      'legendary',
      '{"current_streak":100}'
    )

    ON CONFLICT (name) DO UPDATE
    SET description = EXCLUDED.description,
        rarity = EXCLUDED.rarity,
        rule = EXCLUDED.rule

  `);

  console.log(
    "Badge seed successful"
  );

  process.exit(0);
}

seedBadges();
