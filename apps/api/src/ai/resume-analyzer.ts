import { resumeAnalysisSchema, type ResumeAnalysis } from './schemas.js';

const SYSTEM_PROMPT = `You are a recruitment resume-analysis assistant. Analyze only information explicitly present in the supplied resume text. Do not invent employers, degrees, dates, skills, projects, or experience. Return JSON matching the requested schema. Keep observations factual and concise. skillGaps should represent skills that appear absent or insufficiently evidenced, not claims about the person's ability.`;

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1];
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_API_URL ?? 'https://api.openai.com/v1/chat/completions';
  const model = process.env.AI_MODEL ?? 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this resume and return structured JSON with keys: summary, skills, experienceYears, education, projects, strengths, skillGaps, atsObservations.\n\nRESUME:\n${resumeText.slice(0, 100_000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI provider request failed (${response.status}): ${body.slice(0, 500)}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI provider returned no analysis');

  const parsed = resumeAnalysisSchema.safeParse(JSON.parse(extractJson(content)));
  if (!parsed.success) {
    throw new Error(`AI response failed schema validation: ${parsed.error.message}`);
  }

  return parsed.data;
}
