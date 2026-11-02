import Link from 'next/link';

const mentorProfiles = [
  { slug: 'python-socratic', name: 'Python Socratic', description: 'Guided questions to build problem-solving skills.' },
  { slug: 'interview-prep', name: 'Interview Preparation', description: 'Structured practice for technical interviews.' },
  { slug: 'supportive-learning', name: 'Supportive Learning', description: 'Step-by-step explanations and next actions.' },
];

export default function MentorsPage() {
  return (
    <main className="page-shell">
      <header className="site-header"><Link className="brand" href="/">OnlyDucks</Link><Link href="/feed">Opportunity feed</Link></header>
      <section className="hero">
        <p className="eyebrow">DUCKY MENTORS</p>
        <h1>Choose a learning approach.</h1>
        <p className="hero-copy">These are starter profile definitions for UI development. Oscar API calls and authenticated session creation are not implemented yet.</p>
      </section>
      <section className="feature-grid">
        {mentorProfiles.map((mentor) => (
          <article className="feature-card" key={mentor.slug}>
            <h2>{mentor.name}</h2>
            <p>{mentor.description}</p>
            <p><code>{mentor.slug}</code></p>
          </article>
        ))}
      </section>
    </main>
  );
}
