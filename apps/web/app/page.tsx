const features = [
  ['Resume Intelligence', 'Extract structured skills and experience from PDF or DOCX resumes.'],
  ['AI Job Matching', 'Rank opportunities using skills, experience and semantic relevance.'],
  ['Interview Evaluation', 'Support structured interview workflows and consistent evaluation.'],
];

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)', color: '#0f172a' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 90 }}>
          <strong style={{ fontSize: 22 }}>HireMate AI</strong>
          <nav style={{ display: 'flex', gap: 10 }}>
            <a href="/login" style={{ padding: '10px 16px', color: '#334155', textDecoration: 'none' }}>Sign in</a>
            <a href="/register" style={{ padding: '10px 16px', borderRadius: 10, background: '#111827', color: '#fff', textDecoration: 'none' }}>Get started</a>
          </nav>
        </header>

        <section style={{ maxWidth: 850 }}>
          <p style={{ fontWeight: 800, letterSpacing: 2, color: '#4f46e5' }}>AI RECRUITMENT PLATFORM</p>
          <h1 style={{ fontSize: 'clamp(42px,7vw,76px)', lineHeight: 1.02, margin: '18px 0' }}>
            Hire better with structured, AI-assisted decisions.
          </h1>
          <p style={{ fontSize: 20, lineHeight: 1.7, color: '#475569', maxWidth: 760 }}>
            HireMate AI brings resume intelligence, job matching and interview workflows into one recruiter and candidate experience.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            <a href="/register" style={{ padding: '14px 20px', borderRadius: 10, background: '#111827', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Create account</a>
            <a href="/login" style={{ padding: '14px 20px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', textDecoration: 'none', fontWeight: 700 }}>Sign in</a>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginTop: 80 }}>
          {features.map(([title, text]) => (
            <article key={title} style={{ padding: 24, background: 'rgba(255,255,255,.8)', border: '1px solid #e2e8f0', borderRadius: 16 }}>
              <h2 style={{ fontSize: 19, marginTop: 0 }}>{title}</h2>
              <p style={{ color: '#64748b', lineHeight: 1.6 }}>{text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
