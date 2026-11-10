import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <a className="skip-link" href="#page-content">Skip to main content</a>
      <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>onlyducks</Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className="nav-link" href="/">Overview</Link>
          <Link className="nav-link" href="/welcome">Start here</Link>
          <Link className="nav-link" href="/mentors">Mentors</Link>
          <Link className="nav-link" href="/roadmap">Roadmap</Link>
          <Link className="nav-link" href="/profile">Profile</Link>
          <Link className="nav-link" href="/feed">Opportunities</Link>
        </nav>
        <span className="environment-pill"><span className="status-dot" /> Preview</span>
      </header>
      <section id="page-content" tabIndex={-1} className="not-found-panel" aria-labelledby="page-title">
        <p className="eyebrow"><span className="eyebrow-line" /> PAGE NOT FOUND</p>
        <p className="not-found-code" aria-hidden="true">404</p>
        <h1 id="page-title">This page is <span className="heading-accent">off the map.</span></h1>
        <p className="hero-copy">The address may have changed, or the page may not be part of this preview yet.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/">Back to overview <span aria-hidden="true">→</span></Link><Link className="text-link" href="/welcome">Start with the guide</Link></div>
      </section>
      <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
    </main>
    </>
  );
}
