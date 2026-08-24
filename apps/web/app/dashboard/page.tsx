'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type MeResponse = {
  user: { id: string; email: string; role: string };
  profile: { fullName?: string; companyName?: string } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<MeResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('hiremate_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? 'Session expired');
        return body as MeResponse;
      })
      .then(setData)
      .catch(() => {
        localStorage.removeItem('hiremate_token');
        setError('Your session is invalid or expired.');
        router.replace('/login');
      });
  }, [router]);

  function logout() {
    localStorage.removeItem('hiremate_token');
    router.replace('/login');
  }

  if (error) return <main style={{ padding: 40 }}>{error}</main>;
  if (!data) return <main style={{ padding: 40 }}>Loading dashboard…</main>;

  const candidate = data.user.role === 'CANDIDATE';

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontWeight: 700, letterSpacing: 1 }}>HIREMATE AI</p>
          <h1>Welcome, {data.profile?.fullName ?? data.user.email}</h1>
        </div>
        <button onClick={logout} style={{ padding: '10px 16px' }}>Log out</button>
      </div>
      <section style={{ marginTop: 40, padding: 24, border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <h2>{candidate ? 'Candidate workspace' : 'Recruiter workspace'}</h2>
        <p>Email: {data.user.email}</p>
        <p>Role: {data.user.role}</p>
        {data.profile?.companyName && <p>Company: {data.profile.companyName}</p>}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
          {candidate ? (
            <>
              <button onClick={() => router.push('/jobs')} style={{ padding: '10px 16px' }}>Explore jobs</button>
              <button onClick={() => router.push('/applications')} style={{ padding: '10px 16px' }}>My applications</button>
            </>
          ) : (
            <button onClick={() => router.push('/recruiter/jobs')} style={{ padding: '10px 16px' }}>Manage jobs & applicants</button>
          )}
        </div>
      </section>
    </main>
  );
}
