import { Router } from 'express';
import { prisma } from '@hiremate/database';
import { requireAuth, requireRole } from '../auth/middleware.js';
import { answerSchema, createInterviewSchema } from './schemas.js';
import { evaluateInterviewAnswer, generateInterviewQuestions } from './ai.js';

const router = Router();

router.post('/', requireAuth, requireRole('RECRUITER'), async (req, res) => {
  const parsed = createInterviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const { candidateId, jobId, title } = parsed.data;
  const candidate = await prisma.user.findFirst({ where: { id: candidateId, role: 'CANDIDATE' }, include: { candidateProfile: true, resumes: { orderBy: { createdAt: 'desc' }, take: 1 } } });
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const job = jobId ? await prisma.job.findFirst({ where: { id: jobId, recruiterId: req.auth!.userId } }) : null;
  if (jobId && !job) return res.status(404).json({ error: 'Job not found' });

  const jobContext = job ? `${job.title}\n${job.description}\nRequired skills: ${job.skills.join(', ')}` : title;
  const candidateContext = candidate.resumes[0]?.extractedText ?? `${candidate.candidateProfile?.fullName ?? ''}\nSkills: ${candidate.candidateProfile?.skills.join(', ') ?? ''}`;

  try {
    const questions = await generateInterviewQuestions(jobContext, candidateContext);
    const interview = await prisma.interview.create({
      data: {
        candidateId,
        recruiterId: req.auth!.userId,
        jobId: job?.id,
        title,
        questions: { create: questions.map((q, index) => ({ question: q.question, type: q.type, order: index + 1 })) },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    return res.status(201).json({ interview });
  } catch (error) {
    console.error('Interview generation failed', error);
    return res.status(502).json({ error: 'AI interview generation is currently unavailable' });
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  const where = req.auth!.role === 'CANDIDATE' ? { candidateId: req.auth!.userId } : { recruiterId: req.auth!.userId };
  const interviews = await prisma.interview.findMany({ where, include: { questions: { orderBy: { order: 'asc' }, include: { answer: true } }, job: { select: { title: true } } }, orderBy: { createdAt: 'desc' } });
  return res.json({ interviews });
});

router.post('/:id/questions/:questionId/answer', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  const parsed = answerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const question = await prisma.interviewQuestion.findFirst({ where: { id: req.params.questionId, interviewId: req.params.id }, include: { interview: true } });
  if (!question || question.interview.candidateId !== req.auth!.userId) return res.status(404).json({ error: 'Interview question not found' });

  const job = question.interview.jobId ? await prisma.job.findUnique({ where: { id: question.interview.jobId } }) : null;
  const jobContext = job ? `${job.title}\n${job.description}\nSkills: ${job.skills.join(', ')}` : question.interview.title;

  try {
    const evaluation = await evaluateInterviewAnswer(question.question, parsed.data.answer, jobContext);
    const answer = await prisma.interviewAnswer.upsert({ where: { questionId: question.id }, update: { answerText: parsed.data.answer, score: evaluation.score, feedback: evaluation.feedback, strengths: evaluation.strengths, weaknesses: evaluation.weaknesses }, create: { questionId: question.id, answerText: parsed.data.answer, score: evaluation.score, feedback: evaluation.feedback, strengths: evaluation.strengths, weaknesses: evaluation.weaknesses } });

    const allQuestions = await prisma.interviewQuestion.findMany({ where: { interviewId: question.interview.id }, include: { answer: true } });
    const completed = allQuestions.every((item) => Boolean(item.answer));
    if (completed) {
      const scores = allQuestions.map((item) => item.answer!.score ?? 0);
      const score = scores.reduce((sum, value) => sum + value, 0) / scores.length;
      await prisma.interview.update({ where: { id: question.interview.id }, data: { status: 'COMPLETED', score } });
    } else {
      await prisma.interview.update({ where: { id: question.interview.id }, data: { status: 'IN_PROGRESS' } });
    }

    return res.json({ answer, completed });
  } catch (error) {
    console.error('Interview evaluation failed', error);
    return res.status(502).json({ error: 'AI answer evaluation is currently unavailable' });
  }
});

export { router as interviewsRouter };
