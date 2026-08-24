import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { authRouter } from './auth/routes.js';
import { jobsRouter } from './jobs/routes.js';
import { resumeRouter } from './resumes/routes.js';
import { aiRouter } from './ai/routes.js';
import { matchRouter } from './ai/match-routes.js';

export const app = express();

app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hiremate-api' });
});

app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR ?? './uploads')));
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ai', aiRouter);
app.use('/api/match', matchRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});
