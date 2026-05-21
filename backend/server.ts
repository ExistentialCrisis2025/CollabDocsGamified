import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from './db';
import { userInfo } from 'os';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth Middleware
export const authenticateToken = (req: Request, res: Response, next: express.NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied, no token provided' });
    return;
  }

  try {
    console.log(req.headers.authorization);
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Register Route
app.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      user: newUser.rows[0] 
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Route
app.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const usernameInput = req.body.username || req.body.email;
    const password = req.body.password;

    if (!usernameInput || !password) {
      res.status(400).json({ error: 'Username/Email and password are required' });
      return;
    }

    // Find user
    const userQuery = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [usernameInput]);
    if (userQuery.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = userQuery.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res.json({ 
      message: 'Logged in successfully',
      token, 
      user: { id: user.id, username: user.username } 
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Task Routes ---

// Create Task
app.post('/tasks', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(authenticateToken);
    const userId = (req as any).user.id;
    const { title, description, priority, due_date, xp_reward, status } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const newTask = await pool.query(
      'INSERT INTO tasks (user_id, title, description, priority, due_date, xp_reward, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, title, description, priority || 'medium', due_date, xp_reward || 0, status || 'todo']
    );

    res.status(201).json(newTask.rows[0]);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Tasks
app.get('/tasks', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(tasks.rows);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Task
app.put('/tasks/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
    const { title, description, priority, due_date, xp_reward, status } = req.body;

    const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    if (taskCheck.rows.length === 0) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }

    const updatedTask = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, priority = $3, due_date = $4, xp_reward = $5, status = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [title, description, priority, due_date, xp_reward, status, taskId, userId]
    );

    res.json(updatedTask.rows[0]);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Task Status
app.patch('/tasks/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    if (taskCheck.rows.length === 0) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }

    const task = taskCheck.rows[0];
    const oldStatus = task.status;
    const xpReward = task.xp_reward || 0;

    const updatedTask = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, taskId, userId]
    );

    let xpAssigned = 0;

    // XP Logic
    if (oldStatus !== 'done' && status === 'done') {
      xpAssigned = xpReward;
      await pool.query('INSERT INTO xp_events (user_id, task_id, xp_amount) VALUES ($1, $2, $3)', [userId, taskId, xpReward]);
    } else if (oldStatus === 'done' && status !== 'done') {
      xpAssigned = -xpReward;
      await pool.query('INSERT INTO xp_events (user_id, task_id, xp_amount) VALUES ($1, $2, $3)', [userId, taskId, -xpReward]);
    }

    if (xpAssigned !== 0) {
      // Update user total_xp
      const userRes = await pool.query('UPDATE users SET total_xp = total_xp + $1 WHERE id = $2 RETURNING total_xp', [xpAssigned, userId]);
      const newTotalXp = userRes.rows[0].total_xp;

      // Recalculate level
      const levelRes = await pool.query('SELECT level FROM levels WHERE xp_threshold <= $1 ORDER BY level DESC LIMIT 1', [newTotalXp]);
      const newLevel = levelRes.rows.length > 0 ? levelRes.rows[0].level : 1;

      await pool.query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, userId]);
    }

    res.json(updatedTask.rows[0]);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get User XP and Level
app.get('/users/me/xp', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const userRes = await pool.query('SELECT total_xp, level FROM users WHERE id = $1', [userId]);
    
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    const currentLevel = userRes.rows[0].level;
    const nextLevelRes = await pool.query('SELECT xp_threshold FROM levels WHERE level = $1', [currentLevel + 1]);
    const nextLevelXp = nextLevelRes.rows.length > 0 ? nextLevelRes.rows[0].xp_threshold : null;
    
    res.json({
      total_xp: userRes.rows[0].total_xp,
      level: currentLevel,
      next_level_xp: nextLevelXp
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Task
app.delete('/tasks/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;

    const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    if (taskCheck.rows.length === 0) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }

    await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
