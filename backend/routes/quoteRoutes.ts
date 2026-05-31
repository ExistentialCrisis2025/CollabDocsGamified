import { Router, Request, Response } from 'express';

const router = Router();

const CATEGORIES = [
  'wisdom',
  'philosophy',
  'life',
  'truth',
  'inspirational',
  'success',
  'courage',
  'happiness',
];

router.get('/random', async (_req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.QUOTES;

    if (!apiKey) {
      res.status(500).json({ error: 'Quotes API key not configured' });
      return;
    }

    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const url = `https://api.api-ninjas.com/v2/randomquotes?categories=${encodeURIComponent(category)}`;

    const response = await fetch(url, {
      headers: { 'X-Api-Key': apiKey },
    });

    if (!response.ok) {
      const details = await response.text();
      res.status(502).json({ error: 'Quotes API error', details });
      return;
    }

    const data = await response.json();
    const quote = Array.isArray(data) ? data[0] : data;

    res.json({
      quote: quote?.quote ?? '',
      author: quote?.author ?? 'Unknown',
      category: quote?.category ?? category,
    });
  } catch (error: any) {
    console.error('[quoteRoutes] random error:', error?.message ?? error);
    res.status(500).json({ error: 'Server error fetching quote' });
  }
});

export default router;
