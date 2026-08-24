import { z } from 'zod';

export const resumeAnalysisSchema = z.object({
  summary: z.string().max(2000),
  skills: z.array(z.string().max(100)).max(100),
  experienceYears: z.number().min(0).max(80).nullable(),
  education: z.array(z.object({
    degree: z.string().max(200),
    institution: z.string().max(300).optional(),
    field: z.string().max(200).optional(),
  })).max(20),
  projects: z.array(z.object({
    name: z.string().max(200),
    description: z.string().max(1000),
    technologies: z.array(z.string().max(100)).max(30),
  })).max(30),
  strengths: z.array(z.string().max(300)).max(20),
  skillGaps: z.array(z.string().max(300)).max(20),
  atsObservations: z.array(z.string().max(500)).max(20),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
