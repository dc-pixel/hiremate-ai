'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Job = {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  employmentType?: string | null;
  skills: string[];
  recruiter?: { recruiterProfile?: { companyName?: string } | null };
};

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  async function loadJobs(term = '') {
    const response = await fetch(`${API_URL}/api/jobs?search=${encodeURIComponent(term)}`);
    const body = await response.json();
    setJobs(body.jobs ?? []);
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    await loadJobs(search);
  }

  async function apply(jobId: string) {
    const token = localStorage.getItem('hiremate_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await fetch(`${API_URL}/api/jobs/${jobId}/applications`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    setMessage(response.ok ? 'Application submitted.' : body.error ?? 'Unable to apply.');
  }

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px' }}>
      <h1>Explore jobs</h1>
      <p>Find opportunities and apply through HireMate AI.</p>

      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, margin: '28px 0' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs" style={{ flex: 1, padding: 12 }} />
        <button type="submit" style={{ padding: '12px 18px' }}>Search</button>
      </form>

      {message && <p>{message}</p>}

      <div style={{ display: 'grid', gap: 16 }}>
        {jobs.map((job) => (
          <article key={job.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <h2>{job.title}</h2>
            <p>{job.recruiter?.recruiterProfile?.companyName ?? 'Company'}</p>
            <p>{job.location ?? 'Location not specified'} · {job.employmentType ?? 'Employment type not specified'}</p>
            <p>{job.description}</p>
            <p><strong>Skills:</strong> {job.skills.join(', ') || 'Not specified'}</p>
            <button onClick={() => apply(job.id)} style={{ padding: '10px 16px' }}>Apply</button>
          </article>
        ))}
      </div>
    </main>
  );
}
