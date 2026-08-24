import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
  fullName: z.string().trim().min(2).max(100),
  companyName: z.string().trim().min(2).max(150).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
