import pool from "../db";

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

      UPDATE tasks
      SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP)
      WHERE updated_at IS NULL;

      ALTER TABLE tasks
      ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

      CREATE INDEX IF NOT EXISTS idx_tasks_user_status_updated_at
      ON tasks(user_id, status, updated_at);
    `);

    console.log(
      "Task updated_at column and weekly report index added"
    );

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
