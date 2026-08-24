import { z } from 'zod';

export const createInterviewSchema = z.object({
  candidateId: z.string().min(1),
  jobId: z.string().min(1).optional(),
  title: z.string().min(3).max(200),
});

export const answerSchema = z.object({
  answer: z.string().min(1).max(10_000),
});
