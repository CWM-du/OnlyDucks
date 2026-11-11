import Link from 'next/link';
import { previewIntegrationCards } from '../../lib/platform/preview-adapters';

export default function SandboxPage() {
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
            <Link className="nav-link" href="/agent">Agent</Link>
            <Link className="nav-link" href="/sandbox" aria-current="page">Sandbox</Link>
            <Link className="nav-link" href="/roadmap">Roadmap</Link>
            <Link className="nav-link" href="/profile">Profile</Link>
            <Link className="nav-link" href="/feed">Opportunities</Link>
          </nav>
          <span className="environment-pill"><span className="status-dot status-dot-muted" /> Replaceable preview</span>
        </header>

        <section id="page-content" tabIndex={-1} className="sandbox-page" aria-labelledby="page-title">
          <p className="eyebrow"><span className="eyebrow-line" /> P0 INTEGRATION ENVIRONMENT</p>
          <h1 id="page-title">A safe place to <span className="heading-accent">connect the pieces.</span></h1>
          <p className="hero-copy">This replaceable environment lets the team develop and review the product experience while production integrations are still being completed. Each adapter has a defined replacement point.</p>

          <div className="sandbox-notice" role="note">
            <strong>Preview boundary</strong>
            <span>No authentication is simulated, no mentor session is created, no fake content is displayed, and no production analytics are emitted. All unavailable capabilities remain visibly unavailable.</span>
          </div>

          <div className="sandbox-grid">
            {previewIntegrationCards.map((item) => (
              <article className="sandbox-card" key={item.id}>
                <div className="sandbox-card-top">
                  <span className="sandbox-owner">{item.owner}</span>
                  <span className={item.availability === 'demo' ? 'sandbox-status sandbox-status-demo' : 'sandbox-status'}>{item.availability === 'demo' ? 'Local demo' : 'Not connected'}</span>
                </div>
                <h2>{item.name}</h2>
                <p>{item.explanation}</p>
                <div className="sandbox-replacement"><strong>Replacement point</strong><span>{item.replacement}</span></div>
                {item.id === 'agent' ? <Link className="card-link" href="/agent">Open agent workspace <span aria-hidden="true">→</span></Link> : <span className="sandbox-disabled">Waiting for approved integration</span>}
              </article>
            ))}
          </div>
          <div className="sandbox-footer-actions">
            <Link className="button button-primary" href="/agent">Try the agent preview <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href="/roadmap">View the learning roadmap <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
    </>
  );
}
