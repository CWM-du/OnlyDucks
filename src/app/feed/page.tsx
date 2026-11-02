import Link from 'next/link';

export default function FeedPage() {
  return (
    <main className="page-shell">
      <header className="site-header"><Link className="brand" href="/">OnlyDucks</Link><Link href="/mentors">Ducky Mentors</Link></header>
      <section className="hero">
        <p className="eyebrow">OPPORTUNITY FEED</p>
        <h1>Relevant resources, in one place.</h1>
        <p className="hero-copy">The content-source integration has not yet been configured. Do not treat this placeholder as live articles, jobs, or products.</p>
      </section>
      <section className="feature-grid">
        {['Articles', 'Job offers', 'Products'].map((category) => (
          <article className="feature-card" key={category}>
            <h2>{category}</h2>
            <p>Connect an approved source API or controlled feed to populate this category.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
