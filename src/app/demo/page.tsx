'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const stages = [
  { number: '01', title: 'Your starting point', status: 'Browser-local preview', detail: 'Explore onboarding and a sample profile. No account or shared identity is created.', href: '/welcome', action: 'Explore onboarding' },
  { number: '02', title: 'Agent and mentor', status: 'Interactive local preview', detail: 'Describe a goal, create a blueprint, refine its steps, and approve the preview. No AI model or mentor session is called.', href: '/agent', action: 'Open agent workspace' },
  { number: '03', title: 'Learning journey', status: 'Browser-local preview', detail: 'Track a sample learning path and update progress in this browser. Progress is not synced to a server account.', href: '/roadmap', action: 'Explore roadmap' },
  { number: '04', title: 'Opportunities', status: 'Live source not connected', detail: 'Inspect the feed layout. Live articles, jobs, and products are not connected; no sample entries are presented as real.', href: '/feed', action: 'View feed preview' },
  { number: '05', title: 'Integration sandbox', status: 'Connector preview', detail: 'Review the replaceable integration boundaries and see what is local, pending, or intentionally disabled.', href: '/sandbox', action: 'Open sandbox' },
];

export default function DemoPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const progress = useMemo(() => Math.round((completed.length / stages.length) * 100), [completed.length]);

  function toggleStage(number: string) {
    setCompleted((current) => current.includes(number)
      ? current.filter((item) => item !== number)
      : [...current, number]);
  }

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
          <p className="hero-copy">A self-guided tour of the current OnlyDucks experience. Open each area, try its interactions, then mark the stage as explored.</p>
        </section>

        <section className="feed-status-panel" role="note">
          <div className="status-symbol" aria-hidden="true">i</div>
          <div className="feed-status-copy"><strong>Private product preview — integrations are not production-connected.</strong><p>This walkthrough does not create accounts, call live mentor services, load real-time opportunities, or emit production analytics.</p></div>
          <span className="status-tag">Preview</span>
        </section>

        <section className="demo-progress-panel" aria-labelledby="demo-progress-title">
          <div className="demo-progress-heading">
            <div><p className="eyebrow">YOUR WALKTHROUGH</p><h2 id="demo-progress-title">Tour progress</h2></div>
            <strong aria-live="polite">{completed.length} of {stages.length} explored</strong>
          </div>
          <div className="demo-progress-track" role="progressbar" aria-label="Demo walkthrough progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${progress}% explored`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="demo-progress-footer">
            <p>{progress === 100 ? 'Walkthrough complete. You have explored every available preview area.' : 'Mark each stage after exploring it. Your progress stays in this page only.'}</p>
            <button type="button" className="agent-reset-button" onClick={() => setCompleted([])} disabled={completed.length === 0}>Reset tour</button>
          </div>
        </section>

        <section className="section-block" aria-labelledby="walkthrough-title">
          <div className="section-heading"><div><p className="eyebrow">DEMO FLOW</p><h2 id="walkthrough-title">The five moments to show</h2></div><span className="section-note">Current capability</span></div>
          <div className="module-grid">
            {stages.map((stage) => {
              const isComplete = completed.includes(stage.number);
              return (
                <article className={isComplete ? 'module-card demo-stage-card is-explored' : 'module-card demo-stage-card'} key={stage.number}>
                  <div className="module-card-top"><span className="module-number">{stage.number}</span><span className="module-status">{isComplete ? 'Explored' : stage.status}</span></div>
                  <h3>{stage.title}</h3>
                  <p>{stage.detail}</p>
                  <div className="demo-stage-actions">
                    <Link className="text-link demo-stage-link" href={stage.href}>{stage.action} <span aria-hidden="true">→</span></Link>
                    <label className="demo-stage-check"><input type="checkbox" checked={isComplete} onChange={() => toggleStage(stage.number)} /> Explored</label>
                  </div>
                </article>
              );
            })}
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
        <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
      </main>
    </>
  );
}
