'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Profile = { displayName: string; role: string; level: string; interests: string; goal: string; bio: string };
const emptyProfile: Profile = { displayName: '', role: '', level: 'Exploring', interests: '', goal: '', bio: '' };
const storageKey = 'onlyducks:developer-profile:v1';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setProfile({ ...emptyProfile, ...JSON.parse(stored) });
    } catch { /* Keep the editable defaults if local storage is unavailable. */ }
    setReady(true);
  }, []);

  function update(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(profile));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <main id="main-content" className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>onlyducks</Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className="nav-link" href="/">Overview</Link><Link className="nav-link" href="/welcome">Start here</Link><Link className="nav-link" href="/mentors">Mentors</Link><Link className="nav-link" href="/roadmap">Roadmap</Link><Link className="nav-link nav-link-active" href="/profile" aria-current="page">Profile</Link><Link className="nav-link" href="/feed">Opportunities</Link>
        </nav>
        <span className="environment-pill"><span className="status-dot" /> Local preview</span>
      </header>

      <section className="page-intro">
        <p className="eyebrow"><span className="eyebrow-line" /> YOUR DEVELOPER SPACE</p>
        <h1>Make it <span className="heading-accent">yours.</span></h1>
        <p className="hero-copy">Create a lightweight snapshot of what you do, what you are learning, and where you want to go next.</p>
      </section>

      <div className="local-data-note" role="note"><strong>Private preview:</strong> this profile is saved only in this browser. It is not connected to your account or shared with mentors.</div>
      <div className="profile-layout">
        <form className="profile-form" onSubmit={saveProfile}>
          <div className="section-heading"><div><p className="eyebrow">YOUR DETAILS</p><h2>Developer profile</h2></div><span className="section-note">Optional fields</span></div>
          <label className="field-label" htmlFor="displayName">Display name</label>
          <input id="displayName" className="form-control" value={profile.displayName} onChange={(e) => update('displayName', e.target.value)} maxLength={60} placeholder="How should we call you?" />
          <label className="field-label" htmlFor="role">Current role or focus</label>
          <input id="role" className="form-control" value={profile.role} onChange={(e) => update('role', e.target.value)} maxLength={80} placeholder="e.g. Frontend developer, student, career changer" />
          <label className="field-label" htmlFor="level">Experience level</label>
          <select id="level" className="form-control" value={profile.level} onChange={(e) => update('level', e.target.value)}><option>Exploring</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Experienced professional</option></select>
          <label className="field-label" htmlFor="interests">Technologies and interests</label>
          <input id="interests" className="form-control" value={profile.interests} onChange={(e) => update('interests', e.target.value)} maxLength={180} placeholder="e.g. TypeScript, Python, UX, cloud" />
          <label className="field-label" htmlFor="goal">A goal you are working towards</label>
          <input id="goal" className="form-control" value={profile.goal} onChange={(e) => update('goal', e.target.value)} maxLength={120} placeholder="e.g. Ship my first full-stack project" />
          <label className="field-label" htmlFor="bio">A little about you</label>
          <textarea id="bio" className="form-control form-textarea" value={profile.bio} onChange={(e) => update('bio', e.target.value)} maxLength={360} rows={4} placeholder="What motivates you to build and learn?" />
          <div className="form-actions"><button className="button button-primary" type="submit" disabled={!ready}>Save on this device</button><button className="button button-secondary" type="button" onClick={() => { setProfile(emptyProfile); setSaved(false); window.localStorage.removeItem(storageKey); }}>Clear profile</button></div>
          <p className="form-feedback" role="status" aria-live="polite">{saved ? 'Saved in this browser.' : 'Changes are not saved until you choose Save.'}</p>
        </form>

        <aside className="profile-preview" aria-label="Live profile preview">
          <p className="eyebrow">LIVE PREVIEW</p><div className="profile-avatar" aria-hidden="true">{profile.displayName.trim() ? profile.displayName.trim().slice(0, 2).toUpperCase() : 'OD'}</div>
          <h2>{profile.displayName.trim() || 'Your name here'}</h2><p className="profile-role">{profile.role || 'Your role or current focus'}</p>
          <span className="profile-level">{profile.level}</span>
          <div className="preview-divider" /><h3>Interested in</h3><p>{profile.interests || 'Your technologies and interests will appear here.'}</p>
          <h3>Next goal</h3><p>{profile.goal || 'Add a goal to give your learning direction.'}</p>
          {profile.bio && <><h3>About</h3><p>{profile.bio}</p></>}
          <span className="preview-footnote">Preview only · Not publicly visible</span>
        </aside>
      </div>
      <footer className="site-footer"><Link className="footer-brand" href="/">onlyducks</Link><span>Learning, with a next step in mind.</span><span>Early preview</span></footer>
    </main>
  );
}
