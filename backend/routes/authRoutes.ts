import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../db';
import redisClient from '../redisClient';

const router = Router();

// POST /register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const token = crypto.randomBytes(32).toString('hex');
    await redisClient.set(`session:${token}`, String(newUser.rows[0].id), {
      EX: 86400, // 24 hours
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser.rows[0],
    });
  } catch (err: any) {
    console.error('[authRoutes] register error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const usernameInput = req.body.username || req.body.email;
    const { password } = req.body;

    if (!usernameInput || !password) {
      res.status(400).json({ error: 'Username/Email and password are required' });
      return;
    }

    const userQuery = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [usernameInput]
    );
    if (userQuery.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = userQuery.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    await redisClient.set(`session:${token}`, String(user.id), {
      EX: 86400, // 24 hours
    });

    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err: any) {
    console.error('[authRoutes] login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
