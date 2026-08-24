import { Router } from 'express';
import { prisma } from '@hiremate/database';
import { requireAuth, requireRole } from '../auth/middleware.js';
import { matchResumeToJob } from './matching.js';
import { explainJobMatch } from './job-matcher.js';

const router = Router();
router.use(requireAuth, requireRole('CANDIDATE'));

router.post('/jobs/:jobId/match', async (req, res) => {
  const [job, resume] = await Promise.all([
    prisma.job.findUnique({ where: { id: req.params.jobId } }),
    prisma.resume.findFirst({ where: { candidateId: req.auth!.userId }, orderBy: { createdAt: 'desc' } }),
  ]);

  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (!resume?.extractedText) return res.status(422).json({ error: 'Upload a resume before matching' });

  const jobText = [job.title, job.description, job.location, job.employmentType, ...job.skills].filter(Boolean).join('\n');

  try {
    const { score } = await matchResumeToJob(resume.extractedText, jobText);
    const explanation = await explainJobMatch(resume.extractedText, jobText, score);

    return res.json({
      jobId: job.id,
      resumeId: resume.id,
      score,
      ...explanation,
    });
  } catch (error) {
    console.error('Job matching failed', error);
    return res.status(502).json({ error: 'AI job matching is currently unavailable' });
  }
});

export { router as matchRouter };
