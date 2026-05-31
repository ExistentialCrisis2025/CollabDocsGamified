import pool from "../db";

async function seedBadges() {

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
    )

    ON CONFLICT DO NOTHING

  `);

  console.log(
    "Badge seed successful"
  );

  process.exit(0);
}

seedBadges();