type EmbeddingResponse = { data?: Array<{ embedding?: number[] }> };

async function createEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_EMBEDDING_API_URL ?? 'https://api.openai.com/v1/embeddings';
  const model = process.env.AI_EMBEDDING_MODEL ?? 'text-embedding-3-small';
  if (!apiKey) throw new Error('AI_API_KEY is not configured');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: text.slice(0, 100_000) }),
  });
  if (!response.ok) throw new Error(`Embedding provider request failed (${response.status})`);
  const body = await response.json() as EmbeddingResponse;
  const embedding = body.data?.[0]?.embedding;
  if (!embedding?.length) throw new Error('Embedding provider returned no vector');
  return embedding;
}

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || !a.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

export async function matchResumeToJob(resumeText: string, jobText: string) {
  const [resumeEmbedding, jobEmbedding] = await Promise.all([
    createEmbedding(resumeText),
    createEmbedding(jobText),
  ]);
  const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
  return { score: Math.round(Math.max(0, Math.min(1, similarity)) * 100), similarity };
}
