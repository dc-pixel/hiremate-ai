export default function HomePage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
      <section>
        <p style={{ fontWeight: 700, letterSpacing: 1 }}>HIREMATE AI</p>
        <h1 style={{ fontSize: 56, lineHeight: 1.05, maxWidth: 760 }}>
          Smarter recruitment. Better interviews. Stronger hiring decisions.
        </h1>
        <p style={{ fontSize: 20, lineHeight: 1.6, maxWidth: 720, color: '#475569' }}>
          A full-stack recruitment platform for candidates and recruiters, enhanced with AI-powered resume analysis, job matching, and interview evaluation.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <a href="/register" style={{ padding: '12px 20px', borderRadius: 8, background: '#111827', color: 'white', textDecoration: 'none' }}>
            Create account
          </a>
          <a href="/login" style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #cbd5e1', textDecoration: 'none' }}>
            Sign in
          </a>
        </div>
      </section>
    </main>
  );
}
