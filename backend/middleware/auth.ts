import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware: verifies the Bearer JWT from Authorization header.
 * Attaches the decoded payload to req.user on success.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied, no token provided' });
    return;
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = verified;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};
