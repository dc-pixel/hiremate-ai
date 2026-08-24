import { Router } from 'express';
import { prisma } from '@hiremate/database';
import { requireAuth, requireRole } from '../auth/middleware.js';
import { analyzeResume } from './resume-analyzer.js';

const router = Router();
router.use(requireAuth, requireRole('CANDIDATE'));

router.post('/resumes/:resumeId/analyze', async (req, res) => {
  const resume = await prisma.resume.findFirst({
    where: { id: req.params.resumeId, candidateId: req.auth!.userId },
  });

  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  if (!resume.extractedText?.trim()) {
    return res.status(422).json({ error: 'Resume has no extracted text to analyze' });
  }

  try {
    const analysis = await analyzeResume(resume.extractedText);
    const updated = await prisma.resume.update({
      where: { id: resume.id },
      data: {
        aiSummary: analysis.summary,
        skills: analysis.skills,
      },
      select: {
        id: true,
        fileName: true,
        aiSummary: true,
        skills: true,
        createdAt: true,
      },
    });

    return res.json({ resume: updated, analysis });
  } catch (error) {
    console.error('Resume AI analysis failed', error);
    return res.status(502).json({ error: 'AI resume analysis is currently unavailable' });
  }
});

export { router as aiRouter };
