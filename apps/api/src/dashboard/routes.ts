import { Router } from 'express';
import { prisma } from '@hiremate/database';
import { requireAuth } from '../auth/middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', async (req, res) => {
  const userId = req.auth!.userId;

  if (req.auth!.role === 'RECRUITER') {
    const [jobs, applications, interviews, hired] = await Promise.all([
      prisma.job.count({ where: { recruiterId: userId } }),
      prisma.application.count({ where: { job: { recruiterId: userId } } }),
      prisma.interview.count({ where: { recruiterId: userId } }),
      prisma.application.count({ where: { job: { recruiterId: userId }, status: 'HIRED' } }),
    ]);
    return res.json({ role: 'RECRUITER', metrics: { jobs, applications, interviews, hired } });
  }

  const [applications, interviews, resumes, hired] = await Promise.all([
    prisma.application.count({ where: { candidateId: userId } }),
    prisma.interview.count({ where: { candidateId: userId } }),
    prisma.resume.count({ where: { candidateId: userId } }),
    prisma.application.count({ where: { candidateId: userId, status: 'HIRED' } }),
  ]);
  return res.json({ role: 'CANDIDATE', metrics: { applications, interviews, resumes, hired } });
});

router.get('/recent-applications', async (req, res) => {
  if (req.auth!.role === 'RECRUITER') {
    const applications = await prisma.application.findMany({
      where: { job: { recruiterId: req.auth!.userId } },
      include: { candidate: { include: { candidateProfile: true } }, job: { select: { id: true, title: true } } },
      orderBy: { appliedAt: 'desc' }, take: 10,
    });
    return res.json({ applications });
  }
  const applications = await prisma.application.findMany({
    where: { candidateId: req.auth!.userId },
    include: { job: { select: { id: true, title: true, location: true, employmentType: true } } },
    orderBy: { appliedAt: 'desc' }, take: 10,
  });
  return res.json({ applications });
});

export { router as dashboardRouter };
