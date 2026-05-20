import pool from './db';

const setupDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(50) DEFAULT 'medium',
        due_date TIMESTAMP WITH TIME ZONE,
        xp_reward INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'todo',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tasks table created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tasks table:', err);
    process.exit(1);
  }
};

setupDb();
