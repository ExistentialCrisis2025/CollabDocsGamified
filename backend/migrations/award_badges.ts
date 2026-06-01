import pool from "../db";
import { evaluateBadges } from "../services/evaluateBadges";

async function run() {
  const users = await pool.query("SELECT id FROM users");
  for (const u of users.rows) {
    const unlocked = await evaluateBadges(u.id);
    if (unlocked.length) {
      console.log(`User ${u.id} unlocked: ${unlocked.map(b => b.name).join(", ")}`);
    }
  }
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });