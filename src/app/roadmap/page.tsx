'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const phases = [
  { id: 'foundations', number: '01', title: 'Build your foundations', description: 'Choose a core skill and make the fundamentals feel familiar.', duration: 'Start small', tasks: ['Choose one skill to focus on', 'Write down what you already know', 'Pick one concept to practise this week'] },
  { id: 'practice', number: '02', title: 'Practise with intention', description: 'Turn passive learning into small, visible pieces of work.', duration: 'Keep a steady rhythm', tasks: ['Complete a small guided exercise', 'Explain the concept in your own words', 'Save one question to explore next'] },
  { id: 'demonstrate', number: '03', title: 'Demonstrate your skills', description: 'Create something that makes your thinking and progress tangible.', duration: 'Make it tangible', tasks: ['Choose a small project brief', 'Build and document your approach', 'Ask someone for focused feedback'] },
  { id: 'opportunity', number: '04', title: 'Connect to opportunities', description: 'Use what you have learned to decide on a meaningful next move.', duration: 'Look outward', tasks: ['Refresh your developer profile', 'Identify a role or community to explore', 'Choose your next learning goal'] },
];
const key = 'onlyducks:roadmap:v1';
const validTaskIds = new Set(phases.flatMap((phase) => phase.tasks.map((task) => phase.id + ':' + task)));

function readRoadmapProgress(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((item): item is string => typeof item === 'string' && validTaskIds.has(item)))];
  } catch {
    return [];
  }
}

export default function RoadmapPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try {
      setCompleted(readRoadmapProgress(window.localStorage.getItem(key)));
    } catch {
      setStorageAvailable(false);
    }
    setReady(true);
  }, []);
  function toggle(id: string) {
    setCompleted((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
        setStorageAvailable(true);
      } catch {
        setStorageAvailable(false);
      }
      return next;
    });
  }
  const total = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const percent = Math.round((completed.length / total) * 100);

  return (
    <>
      <a className="skip-link" href="#page-content">Skip to main content</a>
      <main className="app-shell">
      <header className="topbar"><Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>onlyducks</Link><nav className="main-nav" aria-label="Main navigation"><Link className="nav-link" href="/">Overview</Link><Link className="nav-link" href="/welcome">Start here</Link><Link className="nav-link" href="/mentors">Mentors</Link><Link className="nav-link" href="/agent">Agent</Link><Link className="nav-link nav-link-active" href="/roadmap" aria-current="page">Roadmap</Link><Link className="nav-link" href="/profile">Profile</Link><Link className="nav-link" href="/feed">Opportunities</Link></nav><span className="environment-pill"><span className="status-dot" /> Local preview</span></header>
      <section id="page-content" tabIndex={-1} className="page-intro" aria-labelledby="page-title"><p className="eyebrow"><span className="eyebrow-line" /> A PATH YOU CAN SHAPE</p><h1 id="page-title">Make progress <span className="heading-accent">visible.</span></h1><p className="hero-copy">A flexible learning path from foundations to opportunities. Use it as a guide, not a deadline.</p></section>
      <section className="roadmap-progress" aria-label="Your roadmap progress">
        <div><p className="eyebrow">YOUR CHECKLIST</p><strong aria-live="polite">{completed.length} of {total} steps completed</strong><p role="status" aria-live="polite">{storageAvailable ? 'Progress is stored in this browser only.' : "Browser storage is unavailable. Changes remain only while this page is open and will be lost when you leave or refresh."}</p></div>
        <div className="progress-meter" role="progressbar" aria-label="Roadmap completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${completed.length} of ${total} steps completed`}><span style={{ width: percent + '%' }} /></div><strong className="progress-percent">{percent}%</strong>
      </section>
      <div className="roadmap-list">
        {phases.map((phase) => {
          const done = phase.tasks.filter((task) => completed.includes(phase.id + ':' + task)).length;
          return <section className="roadmap-phase" key={phase.id} aria-labelledby={'phase-' + phase.id}>
            <div className="roadmap-phase-heading"><span className="roadmap-number">{phase.number}</span><div><p className="eyebrow">{phase.duration}</p><h2 id={'phase-' + phase.id}>{phase.title}</h2><p>{phase.description}</p></div><span className="phase-count">{done}/{phase.tasks.length}</span></div>
            <ul className="roadmap-tasks">{phase.tasks.map((task) => { const id = phase.id + ':' + task; return <li key={id}><label className="roadmap-task"><input type="checkbox" checked={completed.includes(id)} onChange={() => toggle(id)} disabled={!ready} /><span>{task}</span></label></li>; })}</ul>
          </section>;
        })}
      </div>
      <div className="roadmap-footer"><p><strong>Keep the loop going.</strong> When one phase feels complete, choose the next useful step. Your path can change as your interests do.</p><Link className="button button-primary" href="/mentors">Explore learning styles <span aria-hidden="true">→</span></Link></div>
      <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
    </main>
    </>
  );
}
