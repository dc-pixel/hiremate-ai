'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Role = 'CANDIDATE' | 'RECRUITER';

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
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, fullName, companyName: role === 'RECRUITER' ? companyName : undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Registration failed');

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
