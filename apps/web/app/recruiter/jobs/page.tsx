'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Job = { id: string; title: string; description: string; location?: string | null; employmentType?: string | null; skills: string[]; _count?: { applications: number } };
type Applicant = { id: string; status: string; candidate: { email: string; candidateProfile?: { fullName?: string; skills?: string[] } | null } };

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [form, setForm] = useState({ title: '', description: '', location: '', employmentType: 'Full-time', skills: '' });
  const [message, setMessage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('hiremate_token') : null;

  async function loadJobs() {
    if (!token) return router.replace('/login');
    const response = await fetch(`${API_URL}/api/jobs/mine`, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 403) return router.replace('/dashboard');
    const body = await response.json();
    setJobs(body.jobs ?? []);
  }

  useEffect(() => { void loadJobs(); }, []);

  async function createJob(event: FormEvent) {
    event.preventDefault();
    if (!token) return router.replace('/login');
    const response = await fetch(`${API_URL}/api/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }),
    });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error ?? 'Unable to create job.');
    setMessage('Job created successfully.');
    setForm({ title: '', description: '', location: '', employmentType: 'Full-time', skills: '' });
    await loadJobs();
  }

  async function viewApplicants(jobId: string) {
    if (!token) return router.replace('/login');
    setSelectedJob(jobId);
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/applications`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json();
    setApplicants(body.applications ?? []);
  }

  async function updateStatus(applicationId: string, status: string) {
    if (!token) return;
    const response = await fetch(`${API_URL}/api/jobs/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok && selectedJob) await viewApplicants(selectedJob);
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px' }}>
      <h1>Recruiter jobs</h1>
      <p>Create jobs, review applicants, and update application stages.</p>

      <form onSubmit={createJob} style={{ display: 'grid', gap: 10, margin: '28px 0', padding: 20, border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <h2>Create a job</h2>
        <input required placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea required placeholder="Job description" rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Employment type" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} />
        <input placeholder="Skills, comma separated" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        <button type="submit" style={{ padding: 12 }}>Publish job</button>
      </form>

      {message && <p>{message}</p>}

      <section style={{ display: 'grid', gap: 12 }}>
        {jobs.map((job) => (
          <article key={job.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
            <h2>{job.title}</h2>
            <p>{job.location ?? 'Remote/location not specified'} · {job.employmentType ?? 'Not specified'}</p>
            <p>{job._count?.applications ?? 0} application(s)</p>
            <button onClick={() => viewApplicants(job.id)} style={{ padding: '10px 16px' }}>View applicants</button>
          </article>
        ))}
      </section>

      {selectedJob && (
        <section style={{ marginTop: 32 }}>
          <h2>Applicants</h2>
          {applicants.length === 0 && <p>No applications yet.</p>}
          {applicants.map((application) => (
            <article key={application.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '14px 0' }}>
              <strong>{application.candidate.candidateProfile?.fullName ?? application.candidate.email}</strong>
              <p>{application.candidate.email}</p>
              <p>Status: {application.status}</p>
              <select value={application.status} onChange={(e) => updateStatus(application.id, e.target.value)}>
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interview</option>
                <option value="REJECTED">Rejected</option>
                <option value="HIRED">Hired</option>
              </select>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
