import Link from 'next/link';

const steps = [
  { number: '01', label: 'LEARN', title: 'Start with a question.', description: 'Explore mentor profiles and discover different ways to approach a technical challenge.', action: 'Meet the mentors', href: '/mentors', availability: 'Profiles preview' },
  { number: '02', label: 'DEMONSTRATE', title: 'Turn insight into practice.', description: 'Use what you learn to shape your next step: clarify a concept, outline an approach, or plan a small project.', action: 'See the learning approach', href: '/', availability: 'Guidance preview' },
  { number: '03', label: 'OPPORTUNITY', title: 'Find where to go next.', description: 'Explore useful articles, developer roles, and tools from the notodoescodigo.com ecosystem when the content connection is ready.', action: 'Explore opportunities', href: '/feed', availability: 'Sources pending' },
];

export default function WelcomePage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>onlyducks</Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className="nav-link" href="/">Overview</Link>
          <Link className="nav-link" href="/mentors">Mentors</Link>
          <Link className="nav-link" href="/feed">Opportunities</Link>
        </nav>
        <span className="environment-pill"><span className="status-dot" /> Preview</span>
      </header>

      <section className="welcome-hero">
        <p className="eyebrow"><span className="eyebrow-line" /> YOUR FIRST STEPS</p>
        <h1>Welcome to a more <span className="heading-accent">connected</span> developer journey.</h1>
        <p className="hero-copy">OnlyDucks brings learning, practical progress, and relevant opportunities into one clear path. Start wherever you are; take the next useful step when you're ready.</p>
        <div className="welcome-hero-note"><span className="welcome-note-mark">i</span><p><strong>One simple idea:</strong> learning is more useful when it leads somewhere. OnlyDucks connects what you want to understand with what you can do next.</p></div>
      </section>

      <section className="welcome-path" aria-labelledby="welcome-path-title">
        <div className="section-heading">
          <div><p className="eyebrow">THE ONLYDUCKS LOOP</p><h2 id="welcome-path-title">Three steps. One continuous journey.</h2></div>
          <span className="section-note">Learn → Demonstrate → Opportunity</span>
        </div>
        <div className="welcome-steps">
          {steps.map((step) => (
            <article className="welcome-step-card" key={step.number}>
              <div className="welcome-step-top"><span className="welcome-step-number">{step.number}</span><span className="welcome-step-label">{step.label}</span></div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className="welcome-step-bottom"><span className="welcome-availability">{step.availability}</span><Link className="card-link" href={step.href}>{step.action} <span aria-hidden="true">→</span></Link></div>
            </article>
          ))}
        </div>
      </section>

      <section className="welcome-next" aria-labelledby="welcome-next-title">
        <div><p className="eyebrow">READY WHEN YOU ARE</p><h2 id="welcome-next-title">Choose a useful first step.</h2><p>There is no setup required for this preview. Explore what is available today and come back as more connections are enabled.</p></div>
        <div className="welcome-next-actions"><Link className="button button-primary" href="/mentors">Explore mentor profiles <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/">Back to overview <span aria-hidden="true">→</span></Link></div>
      </section>

      <section className="welcome-boundary" aria-label="Feature availability">
        <strong>What is available in this preview?</strong>
        <p>You can explore the product journey and mentor profile previews. Live mentor conversations, personalized progress tracking, and connected articles, jobs, or products are not enabled yet. We will make those available states explicit rather than showing sample activity as real.</p>
      </section>
      <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
    </main>
  );
}
