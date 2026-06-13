import express from 'express';
import { google } from 'googleapis';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';
import redisClient from '../redisClient';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Helper function to check redis token
async function verifyToken(token: string): Promise<number | null> {
  if (!token) return null;
  const userId = await redisClient.get(`session:${token}`);
  return userId ? parseInt(userId.toString(), 10) : null;
}

// 1. GET /calendar/auth
// Expects ?token=... in the query string to pass in the state
router.get('/auth', async (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    return res.status(401).send('Missing token');
  }

  const userId = await verifyToken(token);
  if (!userId) {
    return res.status(401).send('Invalid token');
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force to get refresh token
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: `calendar_${token}` // Pass the token in the state to get it back in callback
  });

  res.redirect(url);
});

// 2. GET /calendar/callback
router.get('/callback', async (req, res) => {
  const code = req.query.code as string;
  const token = req.query.state as string;

  if (!code || !token) {
    return res.status(400).send('Missing code or state');
  }

  const userId = await verifyToken(token);
  if (!userId) {
    return res.status(401).send('Invalid token state');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save to DB
    await pool.query(
      `UPDATE users 
       SET google_access_token = $1, 
           google_refresh_token = COALESCE($2, google_refresh_token), 
           google_token_expiry = $3 
       WHERE id = $4`,
      [tokens.access_token, tokens.refresh_token || null, tokens.expiry_date, userId]
    );

    // Redirect to frontend (e.g., to the dashboard or close a popup)
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendarConnected=true`);
  } catch (error) {
    console.error('Error getting Google OAuth tokens:', error);
    res.status(500).send('Failed to authenticate with Google');
  }
});

// 3. GET /calendar/status
router.get('/status', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const result = await pool.query(
      'SELECT google_refresh_token, google_access_token FROM users WHERE id = $1',
      [userId]
    );
    const hasToken = !!result.rows[0]?.google_refresh_token || !!result.rows[0]?.google_access_token;
    res.json({ connected: hasToken });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// 4. POST /calendar/events
router.post('/events', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const { title, description, date } = req.body;

  try {
    // Get user's tokens
    const result = await pool.query(
      'SELECT google_access_token, google_refresh_token, google_token_expiry FROM users WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { google_access_token, google_refresh_token, google_token_expiry } = result.rows[0];

    if (!google_refresh_token && !google_access_token) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials({
      access_token: google_access_token,
      refresh_token: google_refresh_token,
      expiry_date: Number(google_token_expiry),
    });

    // Check if access token needs refresh (googleapis handles this automatically if refresh_token is set, but just in case we get a new access token, we can save it. However googleapis handles the refresh and updates credentials)
    // To be safe and capture refreshed tokens:
    oauth2Client.on('tokens', async (tokens) => {
      await pool.query(
        `UPDATE users 
         SET google_access_token = $1, 
             google_refresh_token = COALESCE($2, google_refresh_token), 
             google_token_expiry = $3 
         WHERE id = $4`,
        [tokens.access_token, tokens.refresh_token, tokens.expiry_date, userId]
      );
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Determine event time (10:00 PM on the given date, or today if no date)
    const eventDate = date ? new Date(date) : new Date();
    eventDate.setHours(22, 0, 0, 0); // 10 PM
    
    const endDate = new Date(eventDate);
    endDate.setHours(23, 0, 0, 0); // 11 PM

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: eventDate.toISOString(),
        timeZone: 'UTC', // Using UTC, or we could use user's timezone if available
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    res.json({ success: true, eventLink: response.data.htmlLink });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
