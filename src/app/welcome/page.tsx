'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const items = [
  { id: 'orientation', title: 'Understand the OnlyDucks journey', detail: 'See how learning, practice and opportunity connect.', href: '/welcome', action: 'Review the journey' },
  { id: 'mentor', title: 'Choose a learning style', detail: 'Compare mentor approaches and find one that suits your question.', href: '/mentors', action: 'Explore mentors' },
  { id: 'profile', title: 'Create your developer snapshot', detail: 'Capture your interests and the direction you want to explore.', href: '/profile', action: 'Build your profile' },
  { id: 'roadmap', title: 'Choose a first milestone', detail: 'Turn a broad goal into a small, practical next step.', href: '/roadmap', action: 'Open your roadmap' },
];
const key = 'onlyducks:onboarding:v1';
const validItemIds = new Set(items.map((item) => item.id));

function readOnboardingProgress(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((item): item is string => typeof item === 'string' && validItemIds.has(item)))];
  } catch {
    return [];
  }
}

export default function WelcomePage() {
  const [done, setDone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try {
      setDone(readOnboardingProgress(window.localStorage.getItem(key)));
    } catch {
      setStorageAvailable(false);
    }
    setReady(true);
  }, []);
  function toggle(id: string) {
    setDone((current) => {
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
  const percent = Math.round(done.length / items.length * 100);
  return (
    <>
      <a className="skip-link" href="#page-content">Skip to main content</a>
      <main className="app-shell">
      <header className="topbar"><Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>onlyducks</Link><nav className="main-nav" aria-label="Main navigation"><Link className="nav-link" href="/">Overview</Link><Link className="nav-link nav-link-active" href="/welcome" aria-current="page">Start here</Link><Link className="nav-link" href="/mentors">Mentors</Link><Link className="nav-link" href="/agent">Agent</Link><Link className="nav-link" href="/roadmap">Roadmap</Link><Link className="nav-link" href="/profile">Profile</Link><Link className="nav-link" href="/feed">Opportunities</Link></nav><span className="environment-pill"><span className="status-dot" /> Preview</span></header>
      <section id="page-content" tabIndex={-1} className="welcome-hero" aria-labelledby="page-title"><p className="eyebrow"><span className="eyebrow-line" /> YOUR FIRST STEPS</p><h1 id="page-title">Welcome to a more <span className="heading-accent">connected</span> developer journey.</h1><p className="hero-copy">OnlyDucks connects what you want to understand with what you can do next. Start with one small action; there is no setup required for this preview.</p><div className="welcome-hero-note"><span className="welcome-note-mark">i</span><p><strong>Learn → Demonstrate → Opportunity.</strong> Explore a learning approach, turn insight into practice, and use that momentum to decide what comes next.</p></div></section>
      <section className="onboarding-checklist" aria-labelledby="checklist-title">
        <div className="section-heading"><div><p className="eyebrow">YOUR STARTING CHECKLIST</p><h2 id="checklist-title">Make this space yours.</h2></div><span className="section-note" aria-live="polite">{done.length} of {items.length} completed</span></div>
        <div className="onboarding-progress"><div className="progress-meter" role="progressbar" aria-label="Onboarding progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${done.length} of ${items.length} steps completed`}><span style={{ width: percent + '%' }} /></div><strong>{percent}%</strong></div>
        <div className="onboarding-list">{items.map((item, index) => <article className={'onboarding-item' + (done.includes(item.id) ? ' onboarding-item-done' : '')} key={item.id}><label className="onboarding-check"><input type="checkbox" checked={done.includes(item.id)} onChange={() => toggle(item.id)} disabled={!ready} /><span className="onboarding-item-copy"><span className="onboarding-index">STEP 0{index + 1}</span><strong>{item.title}</strong><span>{item.detail}</span></span></label><Link className="card-link" href={item.href}>{item.action} <span aria-hidden="true">→</span></Link></article>)}</div>
        <p className="local-data-note" role="status" aria-live="polite">{storageAvailable ? 'Checklist progress is stored in this browser only. It is not synced to an account.' : "Browser storage is unavailable. Changes remain only while this page is open and will be lost when you leave or refresh."}</p>
      </section>
      <section className="welcome-boundary"><strong>What is live in this preview?</strong><p>You can explore the interface, save a local profile and track a personal checklist. Mentor conversations, account sync, personalized recommendations and connected articles, jobs or products are not enabled yet.</p></section>
      <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
    </main>
    </>
  );
}
