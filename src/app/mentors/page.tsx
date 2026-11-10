import Link from 'next/link';

const mentorProfiles = [
  { slug: 'python-socratic', number: '01', name: 'Python Socratic', focus: 'Learn by reasoning', description: 'Build problem-solving skills through guided questions instead of jumping straight to an answer.', initials: 'Py', tone: 'mint' },
  { slug: 'interview-prep', number: '02', name: 'Interview Preparation', focus: 'Practise with purpose', description: 'Structure your thinking and prepare for common technical interview challenges.', initials: 'IP', tone: 'lavender' },
  { slug: 'supportive-learning', number: '03', name: 'Supportive Learning', focus: 'Take it step by step', description: 'Break unfamiliar topics into manageable explanations and practical next actions.', initials: 'SL', tone: 'peach' },
];

export default function MentorsPage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>onlyducks</Link>
        <nav className="main-nav" aria-label="Main navigation"><Link className="nav-link" href="/">Overview</Link><Link className="nav-link nav-link-active" href="/mentors" aria-current="page">Mentors</Link><Link className="nav-link" href="/feed">Opportunities</Link></nav>
        <span className="environment-pill"><span className="status-dot" /> Preview</span>
      </header>

      <section className="page-intro">
        <p className="eyebrow"><span className="eyebrow-line" /> YOUR LEARNING COMPANIONS</p>
        <div className="intro-title-row"><div><h1>Meet your <span className="heading-accent">mentors.</span></h1><p className="hero-copy">Different approaches for different challenges. Choose the style that fits how you want to learn.</p></div><span className="availability-pill"><span className="status-dot status-dot-muted" /> Conversation service pending</span></div>
      </section>

      <section className="mentor-notice" aria-live="polite"><span className="notice-icon" aria-hidden="true">i</span><p><strong>Profile preview only.</strong> These are starter mentor profiles. Live AI conversations are unavailable until the Oscar API and authenticated session service are configured.</p></section>

      <section className="section-block mentor-section" aria-labelledby="mentors-heading">
        <div className="section-heading"><div><p className="eyebrow">CHOOSE YOUR APPROACH</p><h2 id="mentors-heading">Three ways to make progress.</h2></div><span className="section-note">3 profile concepts</span></div>
        <div className="mentor-grid">
          {mentorProfiles.map((mentor) => (
            <article className="mentor-card" key={mentor.slug}>
              <div className="mentor-card-top"><span className={`mentor-avatar mentor-avatar-${mentor.tone}`}>{mentor.initials}</span><span className="module-number">{mentor.number}</span></div>
              <p className="mentor-focus">{mentor.focus}</p>
              <h3>{mentor.name}</h3>
              <p className="mentor-description">{mentor.description}</p>
              <div className="mentor-card-footer"><span className="unavailable-label">Sessions unavailable</span><span className="disabled-action" aria-disabled="true">Coming soon <span aria-hidden="true">↗</span></span></div>
            </article>
          ))}
        </div>
      </section>
      <div className="page-bottom-nav"><Link className="text-link" href="/feed">Explore opportunities <span aria-hidden="true">→</span></Link><Link className="text-link" href="/">Back to overview <span aria-hidden="true">→</span></Link></div>
      <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
    </main>
  );
}
