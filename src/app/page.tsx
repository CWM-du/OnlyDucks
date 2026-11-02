import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <Link className="brand" href="/">OnlyDucks</Link>
        <span className="status-label">Pilot scaffold</span>
      </header>
      <section className="hero">
        <p className="eyebrow">LEARN · BUILD · DISCOVER</p>
        <h1>A clearer path from learning to opportunity.</h1>
        <p className="hero-copy">
          Explore developer resources and AI mentoring in one focused workspace.
          External integrations must be configured before this scaffold is pilot-ready.
        </p>
        <div className="action-row">
          <Link className="primary-button" href="/mentors">Explore mentors</Link>
          <Link className="secondary-button" href="/feed">View opportunities</Link>
        </div>
      </section>
      <section className="feature-grid" aria-label="Core modules">
        <article className="feature-card">
          <h2>Ducky Mentors</h2>
          <p>Mentor profiles and conversation flows, backed by the configured Oscar API.</p>
        </article>
        <article className="feature-card">
          <h2>Opportunity feed</h2>
          <p>Articles, jobs, and products from approved notodoescodigo.com sources.</p>
        </article>
        <article className="feature-card">
          <h2>Measurable next steps</h2>
          <p>Recommendations and outbound events designed to make referrals inspectable.</p>
        </article>
      </section>
      <footer className="site-footer">
        Initial development scaffold — not production-ready until integrations, security,
        and pilot acceptance tests are complete.
      </footer>
    </main>
  );
}
