'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Role = 'CANDIDATE' | 'RECRUITER';

type ApiResponse = { token?: string; error?: string; details?: unknown };

async function readApiResponse(response: Response): Promise<ApiResponse> {
  const contentType = response.headers.get('content-type') ?? '';
  const raw = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw) as ApiResponse;
    } catch {
      return { error: `The API returned invalid JSON (HTTP ${response.status}).` };
    }
  }

  if (raw.trimStart().startsWith('<!DOCTYPE') || raw.trimStart().startsWith('<html')) {
    return {
      error: `HireMate API returned an HTML page instead of JSON (HTTP ${response.status}). Check that the API is running at ${API_URL}.`,
    };
  }

  return { error: raw.slice(0, 300) || `Request failed (HTTP ${response.status}).` };
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('CANDIDATE');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response: Response;
      try {
        response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role, fullName, companyName: role === 'RECRUITER' ? companyName : undefined }),
        });
      } catch {
        throw new Error(`Unable to connect to HireMate API at ${API_URL}. Start the backend with "pnpm --filter @hiremate/api dev".`);
      }

      const data = await readApiResponse(response);
      if (!response.ok || !data.token) {
        throw new Error(data.error ?? `Registration failed (HTTP ${response.status}).`);
      }

      localStorage.setItem('hiremate_token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '64px 24px' }}>
      <h1>Create your HireMate AI account</h1>
      <p>Choose the workspace that matches your role.</p>
      <div style={{ display: 'flex', gap: 8, margin: '24px 0' }}>
        {(['CANDIDATE', 'RECRUITER'] as Role[]).map((option) => (
          <button key={option} type="button" onClick={() => setRole(option)} style={{ padding: 10, fontWeight: role === option ? 700 : 400 }}>
            {option === 'CANDIDATE' ? 'Candidate' : 'Recruiter'}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ display: 'block', width: '100%', padding: 12, marginTop: 6 }} /></label>
        {role === 'RECRUITER' && <label>Company<input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ display: 'block', width: '100%', padding: 12, marginTop: 6 }} /></label>}
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ display: 'block', width: '100%', padding: 12, marginTop: 6 }} /></label>
        <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required style={{ display: 'block', width: '100%', padding: 12, marginTop: 6 }} /></label>
        {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
        <button disabled={loading} type="submit" style={{ padding: 12 }}>{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p style={{ marginTop: 20 }}><a href="/login">Already have an account?</a></p>
    </main>
  );
}
