import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@hiremate/database';
import { loginSchema, registerSchema } from './schemas.js';
import { signAccessToken } from './jwt.js';
import { requireAuth } from './middleware.js';

export const authRouter = Router();

function publicUser(user: {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid registration data', details: parsed.error.flatten() });
  }

  const { email, password, role, fullName, companyName } = parsed.data;

  if (role === 'RECRUITER' && !companyName) {
    return res.status(400).json({ error: 'companyName is required for recruiters' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, passwordHash, role },
    });

    if (role === 'CANDIDATE') {
      await tx.candidateProfile.create({
        data: { userId: created.id, fullName, skills: [] },
      });
    } else {
      await tx.recruiterProfile.create({
        data: { userId: created.id, fullName, companyName: companyName! },
      });
    }

    return created;
  });

  const token = signAccessToken({ userId: user.id, role: user.role });
  return res.status(201).json({ token, user: publicUser(user) });
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid login data' });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signAccessToken({ userId: user.id, role: user.role });
  return res.json({ token, user: publicUser(user) });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    include: { candidateProfile: true, recruiterProfile: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user: publicUser(user),
    profile: user.role === 'CANDIDATE' ? user.candidateProfile : user.recruiterProfile,
  });
});
