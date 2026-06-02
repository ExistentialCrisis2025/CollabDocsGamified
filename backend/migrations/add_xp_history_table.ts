import dotenv from 'dotenv';
dotenv.config()

import pool from "../db";
async function migrate() {
   try {
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_PASSWORD =", process.env.DB_PASSWORD);
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_PORT =", process.env.DB_PORT);
      await pool.query(`
         CREATE TABLE IF NOT EXISTS xp_history (

            id SERIAL PRIMARY KEY,

            user_id INT NOT NULL
               REFERENCES users(id)
               ON DELETE CASCADE,

            xp_amount INT NOT NULL,

            total_xp_after INT NOT NULL,

            created_at TIMESTAMP
               DEFAULT CURRENT_TIMESTAMP
         );
      `);

      console.log(
         "XP history migration successful"
      );

      process.exit(0);

   } catch (err) {

      console.error(err);

      process.exit(1);
   }
}

migrate();