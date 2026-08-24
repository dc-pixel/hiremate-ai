import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(10000),
  location: z.string().trim().max(120).optional(),
  employmentType: z.string().trim().max(80).optional(),
  skills: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'REJECTED', 'HIRED']),
});
