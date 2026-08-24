import { Router } from 'express';
import { prisma } from '@hiremate/database';
import { requireAuth, requireRole } from '../auth/middleware.js';
import { createJobSchema, updateApplicationStatusSchema } from './schemas.js';

export const jobsRouter = Router();

// Public job discovery.
jobsRouter.get('/', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const jobs = await prisma.job.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      recruiter: { select: { recruiterProfile: { select: { companyName: true } } } },
      _count: { select: { applications: true } },
    },
  });

  return res.json({ jobs });
});

// Recruiter creates a job.
jobsRouter.post('/', requireAuth, requireRole('RECRUITER'), async (req, res) => {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid job data', details: parsed.error.flatten() });
  }

  const job = await prisma.job.create({
    data: {
      ...parsed.data,
      recruiterId: req.auth!.userId,
    },
  });

  return res.status(201).json({ job });
});

// Recruiter views jobs they created.
jobsRouter.get('/mine', requireAuth, requireRole('RECRUITER'), async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { recruiterId: req.auth!.userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applications: true } } },
  });

  return res.json({ jobs });
});

// Candidate applies to a job.
jobsRouter.post('/:jobId/applications', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
  if (!job) return res.status(404).json({ error: 'Job not found' });

  try {
    const application = await prisma.application.create({
      data: {
        candidateId: req.auth!.userId,
        jobId: job.id,
      },
      include: { job: true },
    });
    return res.status(201).json({ application });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }
    throw error;
  }
});

// Candidate views their applications.
jobsRouter.get('/applications/mine', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { candidateId: req.auth!.userId },
    orderBy: { appliedAt: 'desc' },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          employmentType: true,
          recruiter: { select: { recruiterProfile: { select: { companyName: true } } } },
        },
      },
    },
  });

  return res.json({ applications });
});

// Recruiter views applicants for one of their jobs.
jobsRouter.get('/:jobId/applications', requireAuth, requireRole('RECRUITER'), async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.recruiterId !== req.auth!.userId) return res.status(403).json({ error: 'You do not own this job' });

  const applications = await prisma.application.findMany({
    where: { jobId: job.id },
    orderBy: { appliedAt: 'desc' },
    include: {
      candidate: { select: { id: true, email: true, candidateProfile: true, resumes: true } },
    },
  });

  return res.json({ applications });
});

// Recruiter advances or rejects an application.
jobsRouter.patch('/applications/:applicationId/status', requireAuth, requireRole('RECRUITER'), async (req, res) => {
  const parsed = updateApplicationStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid application status' });

  const application = await prisma.application.findUnique({
    where: { id: req.params.applicationId },
    include: { job: true },
  });

  if (!application) return res.status(404).json({ error: 'Application not found' });
  if (application.job.recruiterId !== req.auth!.userId) return res.status(403).json({ error: 'You do not own this application' });

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { status: parsed.data.status },
  });

  return res.json({ application: updated });
});
