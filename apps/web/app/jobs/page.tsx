'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Job = { id: string; title: string; description: string; location?: string | null; employmentType?: string | null; skills: string[]; recruiter?: { recruiterProfile?: { companyName?: string } | null } };
type Match = { score: number; explanation: string; matchedSkills: string[]; missingSkills: string[]; evidence: string[] };

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [matches, setMatches] = useState<Record<string, Match>>({});
  const [matching, setMatching] = useState<string | null>(null);

  async function loadJobs(term = '') {
    const response = await fetch(`${API_URL}/api/jobs?search=${encodeURIComponent(term)}`);
    const body = await response.json();
    setJobs(body.jobs ?? []);
  }
  useEffect(() => { void loadJobs(); }, []);

  async function onSearch(event: FormEvent) { event.preventDefault(); await loadJobs(search); }

  async function apply(jobId: string) {
    const token = localStorage.getItem('hiremate_token');
    if (!token) return router.push('/login');
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/applications`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json();
    setMessage(response.ok ? 'Application submitted.' : body.error ?? 'Unable to apply.');
  }

  async function match(jobId: string) {
    const token = localStorage.getItem('hiremate_token');
    if (!token) return router.push('/login');
    setMatching(jobId);
    setMessage('Calculating semantic match and generating evidence-based explanation…');
    const response = await fetch(`${API_URL}/api/match/jobs/${jobId}/match`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json().catch(() => ({}));
    setMatching(null);
    if (!response.ok) return setMessage(body.error ?? 'Unable to calculate match.');
    setMatches((current) => ({ ...current, [jobId]: body }));
    setMessage('Match analysis completed.');
  }

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px' }}>
      <h1>Explore jobs</h1>
      <p>Find opportunities and use AI to evaluate how your latest resume matches each role.</p>
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, margin: '28px 0' }}><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs" style={{ flex: 1, padding: 12 }} /><button type="submit" style={{ padding: '12px 18px' }}>Search</button></form>
      {message && <p>{message}</p>}
      <div style={{ display: 'grid', gap: 16 }}>
        {jobs.map((job) => {
          const result = matches[job.id];
          return <article key={job.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <h2>{job.title}</h2><p>{job.recruiter?.recruiterProfile?.companyName ?? 'Company'}</p>
            <p>{job.location ?? 'Location not specified'} · {job.employmentType ?? 'Employment type not specified'}</p><p>{job.description}</p>
            <p><strong>Skills:</strong> {job.skills.join(', ') || 'Not specified'}</p>
            <button onClick={() => void match(job.id)} disabled={matching === job.id} style={{ padding: '10px 16px', marginRight: 8 }}>{matching === job.id ? 'Analyzing…' : 'AI match'}</button>
            <button onClick={() => void apply(job.id)} style={{ padding: '10px 16px' }}>Apply</button>
            {result && <section style={{ marginTop: 18, padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <h3>AI match: {result.score}/100</h3><p>{result.explanation}</p>
              <p><strong>Matched:</strong> {result.matchedSkills.join(', ') || 'None evidenced'}</p>
              <p><strong>Missing/not evidenced:</strong> {result.missingSkills.join(', ') || 'None identified'}</p>
              <details><summary>Evidence</summary><ul>{result.evidence.map((item) => <li key={item}>{item}</li>)}</ul></details>
            </section>}
          </article>;
        })}
      </div>
    </main>
  );
}
