import Link from 'next/link';

const features = [
  ['AI Resume Analysis', 'Turn resumes into structured skills, strengths, gaps, and ATS-ready insights.'],
  ['Smart Job Matching', 'Compare candidate evidence with role requirements and explain the match.'],
  ['AI Interviews', 'Generate role-aware questions and evaluate answers with actionable feedback.'],
  ['Recruiter Workflows', 'Create jobs, review applicants, manage statuses, and run interviews.'],
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="nav">
        <Link className="brand" href="/">HireMate<span>AI</span></Link>
        <nav className="nav-links">
          <Link href="/jobs">Jobs</Link>
          <Link href="/login">Sign in</Link>
          <Link className="nav-cta" href="/register">Get started</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI-powered recruitment workspace</p>
          <h1>Hire better. Match smarter. Interview with evidence.</h1>
          <p className="hero-text">
            HireMate AI connects resumes, jobs, applications, and interviews in one workflow—then layers intelligent analysis on top.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/register">Start with HireMate</Link>
            <Link className="secondary-button" href="/jobs">Explore jobs</Link>
          </div>
          <div className="hero-trust">
            <span>Next.js</span><span>Node.js</span><span>PostgreSQL</span><span>JWT + RBAC</span><span>LLM</span>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-header"><span>Candidate intelligence</span><span className="live-dot">● LIVE</span></div>
          <div className="score-card">
            <div><span className="muted">Role match</span><strong>86%</strong></div>
            <div className="progress"><span /></div>
            <p>Strong overlap across backend engineering, REST APIs, and PostgreSQL.</p>
          </div>
          <div className="mini-grid">
            <div><span className="muted">Skills</span><strong>14</strong></div>
            <div><span className="muted">Applications</span><strong>08</strong></div>
            <div><span className="muted">Interview score</span><strong>91</strong></div>
            <div><span className="muted">Skill gaps</span><strong>03</strong></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><p className="eyebrow">One platform</p><h2>From first upload to final interview.</h2></div>
        <div className="feature-grid">
          {features.map(([title, description], index) => (
            <article className="feature-card" key={title}>
              <span className="feature-index">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow">
        <div><p className="eyebrow">Built for a real recruitment flow</p><h2>Less tab switching. More signal.</h2></div>
        <div className="workflow-steps"><span>Resume</span><b>→</b><span>Profile</span><b>→</b><span>Match</span><b>→</b><span>Interview</span><b>→</b><span>Decision</span></div>
      </section>

      <footer className="footer"><span>HireMate AI</span><span>Recruitment intelligence, built as a full-stack workflow.</span></footer>
    </main>
  );
}
