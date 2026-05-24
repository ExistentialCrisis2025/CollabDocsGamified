import { Request, Response, NextFunction } from 'express';
import redisClient from '../redisClient';

/**
 * Middleware: verifies the Bearer session token from Authorization header.
 * Attaches the decoded payload (user id) to req.user on success.
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied, no token provided' });
    return;
  }

  try {
    const userId = await redisClient.get(`session:${token}`);
    
    if (!userId) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    (req as any).user = { id: parseInt(userId.toString(), 10) };
    next();
  } catch (err: any) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
