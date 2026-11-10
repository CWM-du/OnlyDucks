import Link from 'next/link';

const mentorProfiles = [
  { slug: 'python-socratic', number: '01', name: 'Python Socratic', focus: 'Learn by reasoning', description: 'Build problem-solving skills through guided questions instead of jumping straight to an answer.', initials: 'Py', tone: 'mint', bestFor: 'Understanding a concept, debugging your own reasoning, and learning to ask better questions.', approach: 'A question-led style: clarify what you know, inspect assumptions, then work towards an answer in small steps.', prompt: 'Help me reason through a Python problem without giving me the solution immediately.' },
  { slug: 'interview-prep', number: '02', name: 'Interview Preparation', focus: 'Practise with purpose', description: 'Structure your thinking and prepare for common technical interview challenges.', initials: 'IP', tone: 'lavender', bestFor: 'Technical interview preparation, explaining trade-offs, and practising structured answers.', approach: 'A focused practice style: define the problem, communicate constraints, compare approaches, and reflect on trade-offs.', prompt: 'Give me a practice interview question and help me structure my answer.' },
  { slug: 'supportive-learning', number: '03', name: 'Supportive Learning', focus: 'Take it step by step', description: 'Break unfamiliar topics into manageable explanations and practical next actions.', initials: 'SL', tone: 'peach', bestFor: 'Starting an unfamiliar topic, rebuilding confidence, and finding a manageable first step.', approach: 'A paced explanatory style: begin with plain language, connect ideas to examples, and finish with one achievable action.', prompt: 'Explain a difficult technical topic in small steps, checking my understanding as we go.' },
];

export default function MentorsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="topbar"><Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>onlyducks</Link><nav className="main-nav" aria-label="Main navigation"><Link className="nav-link" href="/">Overview</Link><Link className="nav-link" href="/welcome">Start here</Link><Link className="nav-link nav-link-active" href="/mentors" aria-current="page">Mentors</Link><Link className="nav-link" href="/roadmap">Roadmap</Link><Link className="nav-link" href="/profile">Profile</Link><Link className="nav-link" href="/feed">Opportunities</Link></nav><span className="environment-pill"><span className="status-dot" /> Preview</span></header>
      <section className="page-intro" aria-labelledby="page-title"><p className="eyebrow"><span className="eyebrow-line" /> YOUR LEARNING COMPANIONS</p><div className="intro-title-row"><div><h1 id="page-title">Meet your <span className="heading-accent">mentors.</span></h1><p className="hero-copy">Compare three learning approaches and choose the kind of guidance that fits your challenge.</p></div><span className="availability-pill"><span className="status-dot status-dot-muted" /> Conversation service pending</span></div></section>
      <section className="mentor-notice" role="note"><span className="notice-icon" aria-hidden="true">i</span><p><strong>Concept profiles only.</strong> These descriptions and example prompts are product previews, not live AI agents. Conversations remain unavailable until the Oscar API and authenticated session service are ready.</p></section>
      <section className="section-block mentor-section" aria-labelledby="mentors-heading"><div className="section-heading"><div><p className="eyebrow">COMPARE APPROACHES</p><h2 id="mentors-heading">Three ways to make progress.</h2></div><span className="section-note">3 profile concepts</span></div>
        <div className="mentor-grid">{mentorProfiles.map((mentor) => <article className="mentor-card mentor-directory-card" key={mentor.slug}>
          <div className="mentor-card-top"><span className={`mentor-avatar mentor-avatar-${mentor.tone}`}>{mentor.initials}</span><span className="module-number">{mentor.number}</span></div><p className="mentor-focus">{mentor.focus}</p><h3>{mentor.name}</h3><p className="mentor-description">{mentor.description}</p>
          <div className="mentor-detail"><h4>Best for</h4><p>{mentor.bestFor}</p><h4>How it works</h4><p>{mentor.approach}</p><h4>Example question</h4><blockquote>{mentor.prompt}</blockquote></div>
          <div className="mentor-card-footer"><span className="unavailable-label">Sessions unavailable</span><span className="disabled-action" aria-disabled="true">Coming soon</span></div>
        </article>)}</div>
      </section>
      <div className="page-bottom-nav"><Link className="text-link" href="/roadmap">Build a learning path <span aria-hidden="true">→</span></Link><Link className="text-link" href="/profile">Create your profile <span aria-hidden="true">→</span></Link></div>
      <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
    </main>
  );
}
