import Link from 'next/link';

const modules = [
  { number: '01', title: 'Learn with a mentor', description: 'Explore different ways to approach a technical challenge.', href: '/mentors', action: 'Explore mentors', status: 'Profiles preview' },
  { number: '02', title: 'Find your next opportunity', description: 'A single place for useful articles, roles, and developer products.', href: '/feed', action: 'Explore the feed', status: 'Sources pending' },
  { number: '03', title: 'Turn learning into action', description: 'Move from a new concept to a practical next step.', href: '/mentors', action: 'See learning paths', status: 'In development' },
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>onlyducks</Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className="nav-link nav-link-active" href="/" aria-current="page">Overview</Link>
          <Link className="nav-link" href="/mentors">Mentors</Link>
          <Link className="nav-link" href="/feed">Opportunities</Link>
        </nav>
        <span className="environment-pill"><span className="status-dot" /> Preview</span>
      </header>

      <section className="home-hero">
        <div className="hero-content">
          <p className="eyebrow"><span className="eyebrow-line" /> LEARN · DEMONSTRATE · DISCOVER</p>
          <h1>Make your next<br /><span className="heading-accent">move count.</span></h1>
          <p className="hero-copy">Build confidence with focused AI mentoring, discover relevant developer resources, and turn what you learn into your next opportunity.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/mentors">Explore mentors <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" href="/feed">Browse opportunities <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href="/welcome">How OnlyDucks works <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <aside className="hero-aside" aria-label="Product approach">
          <div className="orbit orbit-outer" /><div className="orbit orbit-inner" />
          <div className="orbit-core"><span>OD</span></div>
          <div className="orbit-label orbit-label-top">LEARN</div>
          <div className="orbit-label orbit-label-right">BUILD</div>
          <div className="orbit-label orbit-label-bottom">MOVE</div>
          <p className="orbit-caption">Small steps.<br /><strong>Real momentum.</strong></p>
        </aside>
      </section>

      <section className="section-block" aria-labelledby="path-heading">
        <div className="section-heading">
          <div><p className="eyebrow">YOUR WORKSPACE</p><h2 id="path-heading">From curiosity to opportunity.</h2></div>
          <span className="section-note">The OnlyDucks journey</span>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <article className="module-card" key={module.number}>
              <div className="module-card-top"><span className="module-number">{module.number}</span><span className="module-status">{module.status}</span></div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <Link className="card-link" href={module.href}>{module.action} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="notice-panel" aria-label="Preview environment notice">
        <span className="notice-icon" aria-hidden="true">i</span>
        <div><strong>You're viewing an early product preview.</strong><p>Mentor conversations, shared sign-in, and live content sources are not available yet. We’ll label each feature clearly until its integration is ready.</p></div>
      </section>
      <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
    </main>
  );
}
