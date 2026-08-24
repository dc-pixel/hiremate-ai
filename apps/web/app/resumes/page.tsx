'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Resume = { id: string; fileName: string; fileUrl: string; extractedText?: string; createdAt: string };

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const token = localStorage.getItem('hiremate_token');
    if (!token) return router.replace('/login');
    const response = await fetch(`${API_URL}/api/resumes`, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401 || response.status === 403) return router.replace('/login');
    const body = await response.json();
    setResumes(body.resumes ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function upload() {
    if (!file) return;
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('hiremate_token');
    const form = new FormData();
    form.append('resume', file);
    const response = await fetch(`${API_URL}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) return setMessage(body.error ?? 'Upload failed');
    setFile(null);
    setMessage('Resume uploaded and text extracted successfully.');
    await load();
  }

  async function remove(id: string) {
    const token = localStorage.getItem('hiremate_token');
    const response = await fetch(`${API_URL}/api/resumes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) setResumes((items) => items.filter((item) => item.id !== id));
  }

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 24px' }}>
      <button onClick={() => router.push('/dashboard')}>← Dashboard</button>
      <h1>My resumes</h1>
      <p>Upload a PDF or DOCX resume. Maximum size: 5 MB.</p>
      <section style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 12, marginTop: 24 }}>
        <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button disabled={!file || loading} onClick={() => void upload()} style={{ marginLeft: 12, padding: '10px 16px' }}>
          {loading ? 'Processing…' : 'Upload resume'}
        </button>
        {message && <p>{message}</p>}
      </section>
      <section style={{ marginTop: 32 }}>
        {resumes.length === 0 ? <p>No resumes uploaded yet.</p> : resumes.map((resume) => (
          <article key={resume.id} style={{ padding: 20, border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 12 }}>
            <strong>{resume.fileName}</strong>
            <p>Uploaded {new Date(resume.createdAt).toLocaleString()}</p>
            <button onClick={() => void remove(resume.id)} style={{ padding: '8px 12px' }}>Delete</button>
            <details style={{ marginTop: 12 }}>
              <summary>View extracted text</summary>
              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>{resume.extractedText ?? 'No text extracted.'}</pre>
            </details>
          </article>
        ))}
      </section>
    </main>
  );
}
