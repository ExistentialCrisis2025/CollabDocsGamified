import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.get('/lofi', async (req, res) => {
  try {
    const clientId = process.env.JAMENDO_CLIENT;
    if (!clientId) {
      return res.status(500).json({ error: 'JAMENDO_CLIENT not configured' });
    }

    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: clientId,
        format: 'json',
        limit: 20,
        tags: 'lofi'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching lofi music:', error);
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

export default router;
