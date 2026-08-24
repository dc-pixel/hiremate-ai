import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifyAccessToken } from './jwt.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.auth = verifyAccessToken(header.slice('Bearer '.length));
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return next();
  };
}
