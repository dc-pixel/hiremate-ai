import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

export type AuthToken = {
  userId: string;
  role: Role;
};

export function signAccessToken(payload: AuthToken): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyAccessToken(token: string): AuthToken {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.userId !== 'string' ||
    typeof decoded.role !== 'string'
  ) {
    throw new Error('Invalid access token');
  }

  return { userId: decoded.userId, role: decoded.role as Role };
}
