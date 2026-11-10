import Link from 'next/link';

const categories = [
  { number: '01', title: 'Articles', description: 'Ideas, tutorials, and practical guides to deepen your skills.', tag: 'Learning', icon: 'Aa' },
  { number: '02', title: 'Job opportunities', description: 'Roles and career openings from the notodoescodigo.com ecosystem.', tag: 'Careers', icon: '↗' },
  { number: '03', title: 'Developer products', description: 'Tools and resources selected to support your work.', tag: 'Tools', icon: '＋' },
];

export default function FeedPage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>onlyducks</Link>
        <nav className="main-nav" aria-label="Main navigation"><Link className="nav-link" href="/">Overview</Link><Link className="nav-link" href="/mentors">Mentors</Link><Link className="nav-link nav-link-active" href="/feed">Opportunities</Link></nav>
        <span className="environment-pill"><span className="status-dot" /> Preview</span>
      </header>

      <section className="page-intro">
        <p className="eyebrow"><span className="eyebrow-line" /> DISCOVER WHAT'S NEXT</p>
        <div className="intro-title-row"><div><h1>Opportunity <span className="heading-accent">feed.</span></h1><p className="hero-copy">Useful knowledge, career moves, and tools for your developer journey.</p></div><span className="availability-pill"><span className="status-dot status-dot-muted" /> Content integration pending</span></div>
      </section>

      <section className="feed-status-panel" aria-live="polite">
        <div className="status-symbol" aria-hidden="true">⌁</div>
        <div className="feed-status-copy"><strong>Your feed is being connected.</strong><p>Live articles, job listings, and products will appear here once the approved notodoescodigo.com content source is configured. Nothing below is presented as live content.</p></div>
        <span className="status-tag">Not connected</span>
      </section>

      <section className="section-block feed-section" aria-labelledby="categories-heading">
        <div className="section-heading"><div><p className="eyebrow">EXPLORE BY TYPE</p><h2 id="categories-heading">What are you looking for?</h2></div><span className="section-note">3 content areas</span></div>
        <div className="module-grid">
          {categories.map((category) => (
            <article className="module-card feed-category-card" key={category.number}>
              <div className="module-card-top"><span className="category-icon" aria-hidden="true">{category.icon}</span><span className="module-status">{category.tag}</span></div>
              <span className="module-number">{category.number}</span>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <span className="unavailable-label">Coming when source is connected</span>
            </article>
          ))}
        </div>
      </section>
      <div className="page-bottom-nav"><Link className="text-link" href="/mentors">Explore Ducky Mentors <span aria-hidden="true">→</span></Link><Link className="text-link" href="/">Back to overview <span aria-hidden="true">→</span></Link></div>
      <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
    </main>
  );
}
