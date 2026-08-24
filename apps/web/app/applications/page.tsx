'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  matchScore?: number | null;
  job: { id: string; title: string; location?: string | null; employmentType?: string | null; recruiter?: { recruiterProfile?: { companyName?: string } | null } };
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('hiremate_token');
    if (!token) return router.replace('/login');
    fetch(`${API_URL}/api/jobs/applications/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((body) => setApplications(body.applications ?? []))
      .catch(() => router.replace('/dashboard'));
  }, [router]);

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px' }}>
      <h1>My applications</h1>
      <p>Track every application and its current recruitment stage.</p>
      <div style={{ display: 'grid', gap: 14, marginTop: 28 }}>
        {applications.map((application) => (
          <article key={application.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
            <h2>{application.job.title}</h2>
            <p>{application.job.recruiter?.recruiterProfile?.companyName ?? 'Company'}</p>
            <p>{application.job.location ?? 'Location not specified'} · {application.job.employmentType ?? 'Employment type not specified'}</p>
            <p><strong>Status:</strong> {application.status}</p>
            <p>Applied: {new Date(application.appliedAt).toLocaleDateString()}</p>
            {application.matchScore !== null && application.matchScore !== undefined && <p>AI match score: {Math.round(application.matchScore)}%</p>}
          </article>
        ))}
        {applications.length === 0 && <p>You have not applied to any jobs yet.</p>}
      </div>
    </main>
  );
}
