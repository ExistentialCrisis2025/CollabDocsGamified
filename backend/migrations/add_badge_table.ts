import pool from "../db";

async function migrate() {
  try {

    await pool.query(`

      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,

        name VARCHAR(100) NOT NULL UNIQUE,

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

      DELETE FROM badges b
      USING badges canonical
      WHERE LOWER(b.name) = LOWER(canonical.name)
        AND b.id > canonical.id;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_name
        ON badges (name);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_lower_name
        ON badges (LOWER(name));
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
