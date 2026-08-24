'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
type Question = { id: string; question: string; order: number; answer?: { answerText: string; score?: number | null; feedback?: string | null } | null };
type Interview = { id: string; title: string; status: string; score?: number | null; job?: { title: string } | null; questions: Question[] };

export default function InterviewsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Interview[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  async function load() {
    const token = localStorage.getItem('hiremate_token');
    if (!token) return router.replace('/login');
    const response = await fetch(`${API_URL}/api/interviews/mine`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return router.replace('/login');
    const body = await response.json(); setItems(body.interviews ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function submit(interviewId: string, questionId: string) {
    const token = localStorage.getItem('hiremate_token');
    const response = await fetch(`${API_URL}/api/interviews/${interviewId}/questions/${questionId}/answer`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ answer: answers[questionId] ?? '' }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(body.error ?? 'Could not submit answer');
    setMessage('Answer evaluated successfully.'); await load();
  }

  return <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
    <button onClick={() => router.push('/dashboard')}>← Dashboard</button><h1>AI Interviews</h1><p>{message}</p>
    {items.length === 0 ? <p>No interviews assigned yet.</p> : items.map((interview) => <section key={interview.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginTop: 20 }}>
      <h2>{interview.title}</h2><p>Status: {interview.status} {interview.score != null ? `· Overall score: ${Math.round(interview.score)}/100` : ''}</p>
      {interview.questions.map((q) => <article key={q.id} style={{ borderTop: '1px solid #e2e8f0', padding: '18px 0' }}><strong>{q.order}. {q.question}</strong>{q.answer ? <><p><strong>Your answer:</strong> {q.answer.answerText}</p><p><strong>Score:</strong> {q.answer.score ?? 0}/100</p><p>{q.answer.feedback}</p></> : <><textarea value={answers[q.id] ?? ''} onChange={(e) => setAnswers((v) => ({ ...v, [q.id]: e.target.value }))} rows={5} placeholder="Type your answer…" style={{ width: '100%', marginTop: 12, padding: 10 }} /><button disabled={!answers[q.id]?.trim()} onClick={() => void submit(interview.id, q.id)} style={{ marginTop: 8 }}>Submit answer</button></>}</article>)}
    </section>)}
  </main>;
}
