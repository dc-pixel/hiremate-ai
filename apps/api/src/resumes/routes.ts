import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { prisma } from '@hiremate/database';
import { requireAuth, requireRole } from '../auth/middleware.js';
import { extractResumeText, safeResumeFileName } from './parser.js';

const router = Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
const allowedTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    callback(null, allowedTypes.has(file.mimetype));
  },
});

router.use(requireAuth, requireRole('CANDIDATE'));

router.get('/', async (req, res) => {
  const resumes = await prisma.resume.findMany({
    where: { candidateId: req.auth!.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      aiSummary: true,
      skills: true,
      createdAt: true,
    },
  });

  return res.json({ resumes });
});

router.post('/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Upload a PDF or DOCX resume under 5 MB' });
  }

  const finalName = `${randomUUID()}-${safeResumeFileName(req.file.originalname)}`;
  const finalPath = path.join(uploadDir, finalName);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.rename(req.file.path, finalPath);
    const extractedText = await extractResumeText(finalPath, req.file.mimetype);

    const resume = await prisma.resume.create({
      data: {
        candidateId: req.auth!.userId,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${finalName}`,
        extractedText: extractedText.slice(0, 100_000),
        skills: [],
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        extractedText: true,
        skills: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ resume });
  } catch (error) {
    await fs.rm(req.file.path, { force: true }).catch(() => undefined);
    await fs.rm(finalPath, { force: true }).catch(() => undefined);
    console.error('Resume processing failed', error);
    return res.status(422).json({ error: 'Resume could not be processed. Ensure it is a valid PDF or DOCX file.' });
  }
});

router.delete('/:id', async (req, res) => {
  const resume = await prisma.resume.findFirst({
    where: { id: req.params.id, candidateId: req.auth!.userId },
  });

  if (!resume) return res.status(404).json({ error: 'Resume not found' });

  const fileName = path.basename(resume.fileUrl);
  await fs.rm(path.join(uploadDir, fileName), { force: true }).catch(() => undefined);
  await prisma.resume.delete({ where: { id: resume.id } });

  return res.status(204).send();
});

export { router as resumeRouter };
