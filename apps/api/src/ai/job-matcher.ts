import { z } from 'zod';

const explanationSchema = z.object({
  explanation: z.string().max(3000),
  matchedSkills: z.array(z.string().max(100)).max(50),
  missingSkills: z.array(z.string().max(100)).max(50),
  evidence: z.array(z.string().max(500)).max(20),
});

const SYSTEM_PROMPT = `You are a recruitment matching assistant. Use only the supplied resume and job description as evidence. Do not invent candidate experience or qualifications. Explain the match score, identify explicitly evidenced matched skills, identify important job skills not evidenced in the resume, and quote no more than short phrases. Return JSON with explanation, matchedSkills, missingSkills, evidence.`;

export async function explainJobMatch(resumeText: string, jobText: string, score: number) {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_API_URL ?? 'https://api.openai.com/v1/chat/completions';
  const model = process.env.AI_MODEL ?? 'gpt-4o-mini';
  if (!apiKey) throw new Error('AI_API_KEY is not configured');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `MATCH SCORE: ${score}/100\n\nRESUME:\n${resumeText.slice(0, 80_000)}\n\nJOB DESCRIPTION:\n${jobText.slice(0, 50_000)}` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI explanation request failed (${response.status})`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI provider returned no match explanation');
  return explanationSchema.parse(JSON.parse(content));
}
