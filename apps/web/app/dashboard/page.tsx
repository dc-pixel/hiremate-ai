'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Data = { user: { id: string; email: string; role: string }; profile: { fullName?: string; companyName?: string } | null };
type Metrics = Record<string, number>;
type Application = { id: string; status: string; appliedAt: string; job: { id: string; title: string; location?: string | null; employmentType?: string | null } };

const nav = (candidate: boolean) => candidate
  ? [['/dashboard', 'Overview'], ['/jobs', 'Find jobs'], ['/applications', 'Applications'], ['/resumes', 'Resumes'], ['/interviews', 'Interviews']]
  : [['/dashboard', 'Overview'], ['/recruiter/jobs', 'Jobs'], ['/applications', 'Applicants'], ['/interviews', 'Interviews']];

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

  if (error) return <main className="shell"><div className="notice">{error}</div></main>;
  if (!data) return <main className="shell"><div className="loading"><span className="pulse" /> Loading your workspace…</div></main>;

  const candidate = data.user.role === 'CANDIDATE';
  const cards = candidate
    ? [['Applications', metrics.applications, 'Track your active opportunities'], ['Interviews', metrics.interviews, 'Upcoming interview sessions'], ['Resumes', metrics.resumes, 'Documents in your profile'], ['Hired', metrics.hired, 'Successful placements']]
    : [['Jobs', metrics.jobs, 'Open roles you're managing'], ['Applicants', metrics.applications, 'Candidates in your pipeline'], ['Interviews', metrics.interviews, 'Scheduled sessions'], ['Hired', metrics.hired, 'Successful hires']];

  function logout() { localStorage.removeItem('hiremate_token'); router.replace('/login'); }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">H</span><div><strong>HireMate</strong><small>AI RECRUITMENT</small></div></div>
        <nav className="side-nav">{nav(candidate).map(([href, label]) => <button key={href} className={href === '/dashboard' ? 'active' : ''} onClick={() => router.push(href)}><span>{label === 'Overview' ? '⌂' : label === 'Find jobs' || label === 'Jobs' ? '⌕' : label === 'Applications' || label === 'Applicants' ? '▤' : label === 'Resumes' ? '▧' : '◷'}</span>{label}</button>)}</nav>
        <div className="sidebar-bottom"><div className="secure">✦ AI-assisted workspace</div><button className="logout" onClick={logout}>↪ Sign out</button></div>
      </aside>

      <section className="content">
        <header className="topbar"><div><span className="eyebrow">{candidate ? 'CANDIDATE WORKSPACE' : 'RECRUITER WORKSPACE'}</span><h1>Good to see you, {data.profile?.fullName?.split(' ')[0] ?? 'there'}.</h1><p>{candidate ? 'Your job search, applications and interviews at a glance.' : 'Manage your hiring pipeline with AI-assisted insights.'}</p></div><div className="avatar">{(data.profile?.fullName ?? data.user.email).slice(0,1).toUpperCase()}</div></header>

        <section className="metrics">{cards.map(([label, value, description]) => <article className="metric" key={label as string}><div className="metric-top"><span>{label}</span><span className="metric-icon">✦</span></div><strong>{value ?? 0}</strong><small>{description}</small></article>)}</section>

        <section className="workspace-grid">
          <div className="panel applications"><div className="panel-head"><div><span className="eyebrow">ACTIVITY</span><h2>Recent applications</h2></div><button className="text-btn" onClick={() => router.push(candidate ? '/applications' : '/recruiter/jobs')}>View all →</button></div>
            {applications.length === 0 ? <div className="empty"><div className="empty-icon">✦</div><strong>{candidate ? 'Your application journey starts here.' : 'Your hiring pipeline is ready.'}</strong><p>{candidate ? 'Explore matching roles and submit your first application.' : 'Create a job to start receiving and reviewing candidates.'}</p><button onClick={() => router.push(candidate ? '/jobs' : '/recruiter/jobs')}>{candidate ? 'Explore jobs' : 'Manage jobs'} →</button></div> : <div className="application-list">{applications.map(item => <article key={item.id} className="application-row"><div className="job-avatar">{item.job.title.slice(0,1).toUpperCase()}</div><div className="job-info"><strong>{item.job.title}</strong><span>{item.job.location ?? 'Location not specified'} · {item.job.employmentType ?? 'Role'}</span></div><span className={`status ${item.status.toLowerCase()}`}>{item.status}</span><small>{new Date(item.appliedAt).toLocaleDateString()}</small></article>)}</div>}
          </div>
          <aside className="panel insight"><span className="eyebrow">HIREMATE AI</span><div className="ai-orb">✦</div><h2>Make smarter hiring decisions.</h2><p>Use resume intelligence, semantic job matching and structured interview evaluation to turn candidate data into useful signals.</p><div className="insight-points"><span>✓ Resume intelligence</span><span>✓ Semantic matching</span><span>✓ Interview insights</span></div></aside>
        </section>
      </section>
      <style jsx>{` .app-shell{min-height:100vh;display:flex;background:#f6f7fb;color:#111827}.sidebar{width:250px;background:#0b1020;color:#fff;padding:26px 18px;display:flex;flex-direction:column;box-sizing:border-box}.brand{display:flex;align-items:center;gap:11px;padding:0 8px 34px}.brand-mark{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:#fff;color:#111827;font-weight:900}.brand strong{display:block;font-size:17px}.brand small{display:block;color:#7f8aa5;font-size:8px;letter-spacing:1.5px;margin-top:2px}.side-nav{display:grid;gap:6px}.side-nav button,.logout{border:0;background:transparent;color:#9ca7bd;text-align:left;padding:12px;border-radius:10px;font:inherit;cursor:pointer}.side-nav button span{display:inline-block;width:25px;color:#76829b}.side-nav button.active,.side-nav button:hover{background:#1b2338;color:#fff}.sidebar-bottom{margin-top:auto}.secure{font-size:11px;color:#66728a;padding:12px}.logout{width:100%;border-top:1px solid #20283b;border-radius:0;padding-top:18px}.content{flex:1;min-width:0;padding:40px clamp(24px,5vw,65px)}.topbar{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.eyebrow{font-size:10px;font-weight:800;letter-spacing:1.8px;color:#65708a}.topbar h1{font-size:34px;letter-spacing:-1px;margin:8px 0 5px}.topbar p{margin:0;color:#69758b}.avatar{width:42px;height:42px;border-radius:50%;background:#111827;color:white;display:grid;place-items:center;font-weight:800}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:34px 0}.metric,.panel{background:#fff;border:1px solid #e7e9ef;border-radius:16px;box-shadow:0 5px 20px #11182708}.metric{padding:20px}.metric-top{display:flex;justify-content:space-between;color:#69758b;font-size:13px}.metric-icon{color:#6366f1}.metric strong{display:block;font-size:34px;letter-spacing:-1px;margin:14px 0 5px}.metric small{color:#8a93a6}.workspace-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(260px,.8fr);gap:18px}.panel{padding:24px}.panel-head{display:flex;justify-content:space-between;align-items:center}.panel h2{font-size:19px;margin:7px 0 0}.text-btn{border:0;background:transparent;color:#4f46e5;font-weight:700;cursor:pointer}.empty{text-align:center;padding:55px 20px;color:#68758b}.empty-icon{margin:auto auto 14px;width:45px;height:45px;border-radius:14px;background:#eef0ff;color:#4f46e5;display:grid;place-items:center}.empty strong{display:block;color:#182033}.empty p{max-width:360px;margin:8px auto 20px;line-height:1.5}.empty button{border:0;border-radius:9px;background:#111827;color:#fff;padding:11px 17px;font-weight:700;cursor:pointer}.application-list{margin-top:20px}.application-row{display:grid;grid-template-columns:42px 1fr auto auto;align-items:center;gap:12px;padding:14px 0;border-top:1px solid #edf0f4}.job-avatar{width:40px;height:40px;border-radius:11px;background:#eef0ff;color:#4f46e5;display:grid;place-items:center;font-weight:800}.job-info strong,.job-info span{display:block}.job-info span{font-size:12px;color:#7b8495;margin-top:4px}.status{font-size:11px;font-weight:800;padding:6px 9px;border-radius:20px;background:#eef0f4;color:#596276}.status.hired{background:#e8f7ee;color:#16834d}.status.rejected{background:#fff0f0;color:#c33b3b}.application-row small{color:#9299a8}.insight{background:#111827;color:white;position:relative;overflow:hidden}.insight .eyebrow{color:#818ba3}.ai-orb{width:62px;height:62px;border-radius:20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:grid;place-items:center;font-size:25px;margin:25px 0 20px;box-shadow:0 15px 40px #6366f155}.insight h2{font-size:23px;line-height:1.15;margin:0 0 10px}.insight p{color:#aab2c3;line-height:1.6;font-size:13px}.insight-points{display:grid;gap:9px;margin-top:22px;color:#d8ddff;font-size:12px}@media(max-width:900px){.sidebar{width:74px;padding:20px 10px}.brand div,.side-nav button:not(.active){font-size:0}.brand{justify-content:center}.side-nav button{font-size:0}.side-nav button span{font-size:16px;width:auto}.sidebar-bottom{display:none}.metrics{grid-template-columns:repeat(2,1fr)}.workspace-grid{grid-template-columns:1fr}}@media(max-width:600px){.content{padding:25px 16px}.metrics{grid-template-columns:1fr 1fr}.metric{padding:15px}.metric strong{font-size:27px}.topbar h1{font-size:27px}.application-row{grid-template-columns:38px 1fr auto}.application-row small{display:none}.status{grid-column:2}} `}</style>
    </main>
  );
}
