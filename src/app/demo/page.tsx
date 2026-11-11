import Link from 'next/link';

const stages = [
  { number: '01', title: 'Your starting point', status: 'Browser-local preview', detail: 'Explore onboarding and a sample profile. No account or shared identity is created.', href: '/welcome', action: 'Explore onboarding' },
  { number: '02', title: 'Agent and mentor', status: 'Interactive local preview', detail: 'Describe a goal, create a blueprint, refine its steps, and approve the preview. No AI model or mentor session is called.', href: '/agent', action: 'Open agent workspace' },
  { number: '03', title: 'Learning journey', status: 'Browser-local preview', detail: 'Track a sample learning path and update progress in this browser. Progress is not synced to a server account.', href: '/roadmap', action: 'Explore roadmap' },
  { number: '04', title: 'Opportunities', status: 'Live source not connected', detail: 'Inspect the feed layout. Live articles, jobs, and products are not connected; no sample entries are presented as real.', href: '/feed', action: 'View feed preview' },
  { number: '05', title: 'Integration sandbox', status: 'Connector preview', detail: 'Review the replaceable integration boundaries and see what is local, pending, or intentionally disabled.', href: '/sandbox', action: 'Open sandbox' },
];

export default function DemoPage() {
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
            <Link className="nav-link" href="/sandbox">Sandbox</Link>
            <Link className="nav-link" href="/roadmap">Roadmap</Link>
            <Link className="nav-link" href="/profile">Profile</Link>
            <Link className="nav-link" href="/feed">Opportunities</Link>
          </nav>
          <span className="environment-pill"><span className="status-dot status-dot-muted" /> Guided demo</span>
        </header>

        <section id="page-content" tabIndex={-1} className="page-intro" aria-labelledby="page-title">
          <p className="eyebrow"><span className="eyebrow-line" /> PRODUCT WALKTHROUGH</p>
          <h1 id="page-title">A guided product tour, <span className="heading-accent">step by step.</span></h1>
          <p className="hero-copy">Use this walkthrough to demonstrate the current OnlyDucks experience without presenting preview adapters as live services.</p>
        </section>

        <section className="feed-status-panel" role="note">
          <div className="status-symbol" aria-hidden="true">i</div>
          <div className="feed-status-copy"><strong>Private preview — integrations are not yet production-connected.</strong><p>This walkthrough is safe for a product review. Do not use it to collect real user data or promise live mentor sessions, shared SSO, or real-time opportunities.</p></div>
          <span className="status-tag">Preview</span>
        </section>

        <section className="section-block" aria-labelledby="walkthrough-title">
          <div className="section-heading"><div><p className="eyebrow">DEMO FLOW</p><h2 id="walkthrough-title">The five moments to show</h2></div><span className="section-note">Current capability</span></div>
          <div className="module-grid">
            {stages.map((stage) => (
              <article className="module-card demo-stage-card" key={stage.number}>
                <div className="module-card-top"><span className="module-number">{stage.number}</span><span className="module-status">{stage.status}</span></div>
                <h3>{stage.title}</h3>
                <p>{stage.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block" aria-labelledby="actions-title">
          <div className="section-heading"><div><p className="eyebrow">START THE WALKTHROUGH</p><h2 id="actions-title">Explore the working interface</h2></div></div>
          <div className="page-bottom-nav">
            <Link className="button button-primary" href="/agent">Open agent workspace <span aria-hidden="true">→</span></Link>
            <Link className="button button-secondary" href="/sandbox">Review integration status <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href="/welcome">Start onboarding <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href="/feed">View opportunities <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
    </>
  );
}
