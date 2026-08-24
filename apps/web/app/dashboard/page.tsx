'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Data = { user: { id: string; email: string; role: string }; profile: { fullName?: string; companyName?: string } | null };
type Metrics = Record<string, number>;
type Application = { id: string; status: string; appliedAt: string; job: { id: string; title: string; location?: string | null; employmentType?: string | null } };

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({});
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('hiremate_token');
    if (!token) return void router.replace('/login');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/auth/me`, { headers }),
      fetch(`${API_URL}/api/dashboard/summary`, { headers }),
      fetch(`${API_URL}/api/dashboard/recent-applications`, { headers }),
    ]).then(async ([me, summary, recent]) => {
      if (!me.ok || !summary.ok || !recent.ok) throw new Error('Session expired');
      const [meBody, summaryBody, recentBody] = await Promise.all([me.json(), summary.json(), recent.json()]);
      setData(meBody); setMetrics(summaryBody.metrics ?? {}); setApplications(recentBody.applications ?? []);
    }).catch(() => { localStorage.removeItem('hiremate_token'); setError('Your session is invalid or expired.'); router.replace('/login'); });
  }, [router]);

  function logout() { localStorage.removeItem('hiremate_token'); router.replace('/login'); }
  if (error) return <main style={{ padding: 40 }}>{error}</main>;
  if (!data) return <main style={{ padding: 40 }}>Loading dashboard…</main>;

  const candidate = data.user.role === 'CANDIDATE';
  const cards = candidate
    ? [['Applications', metrics.applications], ['Interviews', metrics.interviews], ['Resumes', metrics.resumes], ['Hired', metrics.hired]]
    : [['Jobs', metrics.jobs], ['Applicants', metrics.applications], ['Interviews', metrics.interviews], ['Hired', metrics.hired]];

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><p style={{ fontWeight: 700, letterSpacing: 1 }}>HIREMATE AI</p><h1>Welcome, {data.profile?.fullName ?? data.user.email}</h1><p>{candidate ? 'Candidate workspace' : `${data.profile?.companyName ?? 'Recruiter'} workspace`}</p></div>
        <button onClick={logout}>Log out</button>
      </header>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginTop: 32 }}>
        {cards.map(([label, value]) => <div key={label as string} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}><div>{label}</div><strong style={{ fontSize: 30 }}>{value ?? 0}</strong></div>)}
      </section>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '28px 0' }}>
        {candidate ? <><button onClick={() => router.push('/jobs')}>Explore jobs</button><button onClick={() => router.push('/applications')}>Applications</button><button onClick={() => router.push('/resumes')}>Resumes</button><button onClick={() => router.push('/interviews')}>Interviews</button></> : <><button onClick={() => router.push('/recruiter/jobs')}>Manage jobs</button><button onClick={() => router.push('/interviews')}>Interviews</button></>}
      </nav>
      <section style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <h2>Recent applications</h2>
        {applications.length === 0 ? <p>No applications yet.</p> : <div>{applications.map((item) => <article key={item.id} style={{ padding: '14px 0', borderBottom: '1px solid #e2e8f0' }}><strong>{item.job.title}</strong><div>{item.job.location ?? 'Location not specified'} · {item.status}</div><small>{new Date(item.appliedAt).toLocaleDateString()}</small></article>)}</div>}
      </section>
    </main>
  );
}
