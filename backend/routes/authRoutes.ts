import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../db';
import redisClient from '../redisClient';

const router = Router();

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
};

type GoogleProfileResponse = {
  sub?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
};

function sanitizeBaseUsername(value: string): string {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
  return cleaned || 'commander';
}

async function buildUniqueUsername(base: string): Promise<string> {
  const root = sanitizeBaseUsername(base);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? '' : String(Math.floor(Math.random() * 1000));
    const candidate = `${root}${suffix}`;
    const exists = await pool.query('SELECT 1 FROM users WHERE username = $1', [candidate]);
    if (exists.rows.length === 0) {
      return candidate;
    }
  }

  return `${root}${Date.now().toString().slice(-4)}`;
}

async function createSessionToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await redisClient.set(`session:${token}`, String(userId), {
    EX: 86400,
  });
  return token;
}

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
      'INSERT INTO users (username, email, password, streak_tokens_seeded_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, username, email',
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

// GET /auth/google
router.get('/auth/google', async (_req: Request, res: Response): Promise<void> => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      res.status(500).json({ error: 'Google OAuth is not configured' });
      return;
    }

    const state = crypto.randomBytes(16).toString('hex');
    await redisClient.set(`oauth:state:${state}`, '1', { EX: 600 });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  } catch (err: any) {
    console.error('[authRoutes] google auth error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /auth/google/callback
router.get('/auth/google/callback', async (req: Request, res: Response): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const { code, state, error } = req.query;

    if (error) {
      res.redirect(`${frontendUrl}/login?error=oauth_denied`);
      return;
    }

    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      res.redirect(`${frontendUrl}/login?error=oauth_invalid`);
      return;
    }

    if (state.startsWith('calendar_')) {
      const realToken = state.replace('calendar_', '');
      res.redirect(`/calendar/callback?code=${code}&state=${realToken}`);
      return;
    }

    const stateKey = `oauth:state:${state}`;
    const storedState = await redisClient.get(stateKey);
    if (!storedState) {
      res.redirect(`${frontendUrl}/login?error=oauth_state`);
      return;
    }
    await redisClient.del(stateKey);

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      res.redirect(`${frontendUrl}/login?error=oauth_config`);
      return;
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const details = await tokenResponse.text();
      console.error('[authRoutes] google token error:', details);
      res.redirect(`${frontendUrl}/login?error=oauth_token`);
      return;
    }

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      res.redirect(`${frontendUrl}/login?error=oauth_token`);
      return;
    }

    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      const details = await userResponse.text();
      console.error('[authRoutes] google userinfo error:', details);
      res.redirect(`${frontendUrl}/login?error=oauth_profile`);
      return;
    }

    const profile = (await userResponse.json()) as GoogleProfileResponse;
    const googleId = profile.sub;
    const email = profile.email;
    const displayName = profile.name || email || 'commander';

    if (!googleId || !email) {
      res.redirect(`${frontendUrl}/login?error=oauth_profile`);
      return;
    }

    const userByGoogle = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    let user = userByGoogle.rows[0];

    if (!user) {
      const userByEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userByEmail.rows.length > 0) {
        await pool.query('UPDATE users SET google_id = $1 WHERE email = $2', [googleId, email]);
        user = userByEmail.rows[0];
      } else {
        const username = await buildUniqueUsername(displayName);
        const randomPassword = crypto.randomBytes(24).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        const created = await pool.query(
          'INSERT INTO users (username, email, password, google_id, streak_tokens_seeded_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
          [username, email, hashedPassword, googleId]
        );
        user = created.rows[0];
      }
    }

    const sessionToken = await createSessionToken(user.id);
    res.redirect(`${frontendUrl}/auth/callback?token=${sessionToken}`);
  } catch (err: any) {
    console.error('[authRoutes] google callback error:', err.message);
    res.redirect(`${frontendUrl}/login?error=oauth_server`);
  }
});

export default router;
