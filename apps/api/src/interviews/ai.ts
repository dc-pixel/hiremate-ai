import { z } from 'zod';

const questionsSchema = z.object({
  questions: z.array(z.object({
    question: z.string().min(1).max(1000),
    type: z.enum(['TECHNICAL', 'BEHAVIORAL', 'SITUATIONAL']),
  })).min(1).max(15),
});

const evaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().max(2000),
  strengths: z.array(z.string().max(300)).max(10),
  weaknesses: z.array(z.string().max(300)).max(10),
});

async function callModel(system: string, user: string) {
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error('AI_API_KEY is not configured');
  const response = await fetch(process.env.AI_API_URL ?? 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.AI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI provider returned no content');
  return JSON.parse(content) as unknown;
}

export async function generateInterviewQuestions(jobContext: string, candidateContext: string) {
  const raw = await callModel(
    'Generate fair, job-relevant interview questions. Do not infer protected or sensitive traits. Return JSON only.',
    `Create 6 to 10 questions based only on this job and candidate context. Balance technical, behavioral, and situational questions.\nJOB:\n${jobContext.slice(0, 20_000)}\nCANDIDATE:\n${candidateContext.slice(0, 20_000)}`,
  );
  return questionsSchema.parse(raw).questions;
}

export async function evaluateInterviewAnswer(question: string, answer: string, jobContext: string) {
  const raw = await callModel(
    'Evaluate an interview answer against the question and job context. Focus on evidence, relevance, correctness, communication, and reasoning. Do not infer protected or sensitive traits. Return JSON only.',
    `QUESTION:\n${question}\n\nANSWER:\n${answer}\n\nJOB CONTEXT:\n${jobContext.slice(0, 20_000)}`,
  );
  return evaluationSchema.parse(raw);
}
