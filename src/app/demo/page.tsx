'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type Identity = { externalUserId: string; issuer: string };
type MentorSession = {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  mentor: { slug: string; name: string; technology: string; teachingStyle: string };
};
type Health = {
  status: string;
  service: string;
  integrations?: Record<string, string>;
};
type ApiError = { error?: string };

const mentors = [
  { slug: 'python-socratic', name: 'Python Socratic', focus: 'Reason through a problem step by step' },
  { slug: 'interview-prep', name: 'Interview Preparation', focus: 'Practise explaining technical decisions' },
  { slug: 'supportive-learning', name: 'Supportive Learning', focus: 'Break a new topic into manageable steps' },
];

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => ({})) as ApiError;
  return body.error || fallback;
}

export default function DemoPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [session, setSession] = useState<MentorSession | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [selectedMentor, setSelectedMentor] = useState(mentors[0].slug);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');

  const refreshSession = useCallback(async () => {
    const response = await fetch('/api/mentor-sessions', { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error(await readError(response, 'Unable to load the current mentor session.'));
    const data = await response.json() as { activeSession: MentorSession | null };
    setSession(data.activeSession);
  }, []);

  const refreshIdentity = useCallback(async () => {
    const response = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) {
      setIdentity(null);
      setSession(null);
      return;
    }
    const data = await response.json() as { authenticated: boolean; identity: Identity };
    setIdentity(data.identity);
    await refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    let alive = true;
    async function initialise() {
      try {
        const [healthResponse, identityResponse] = await Promise.all([
          fetch('/api/health', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store', credentials: 'same-origin' }),
        ]);
        if (!alive) return;
        if (healthResponse.ok) setHealth(await healthResponse.json() as Health);
        if (identityResponse.ok) {
          const data = await identityResponse.json() as { identity: Identity };
          if (!alive) return;
          setIdentity(data.identity);
          await refreshSession();
        }
      } catch {
        if (alive) setMessage('The demo services could not be reached. Check the server and database configuration.');
      } finally {
        if (alive) setChecking(false);
      }
    }
    void initialise();
    return () => { alive = false; };
  }, [refreshSession]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error(await readError(response, 'Sign-in failed. Check your demo credentials.'));
      setPassword('');
      await refreshIdentity();
      setMessage('Signed in. Your browser now has an authenticated demo session.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error(await readError(response, 'Sign-out failed.'));
      setIdentity(null);
      setSession(null);
      setMessage('You have signed out.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign-out failed.');
    } finally {
      setBusy(false);
    }
  }

  async function startSession() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/mentor-sessions', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorSlug: selectedMentor }),
      });
      if (!response.ok) throw new Error(await readError(response, 'Could not start a mentor session.'));
      const data = await response.json() as MentorSession;
      setSession(data);
      setMessage('Mentor session created and persisted. The AI conversation is not connected yet.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not start a mentor session.');
      await refreshSession().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  async function completeSession() {
    if (!session) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/mentor-sessions/${encodeURIComponent(session.id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (!response.ok) throw new Error(await readError(response, 'Could not complete the mentor session.'));
      setSession(null);
      setMessage('Mentor session completed and persisted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not complete the mentor session.');
    } finally {
      setBusy(false);
    }
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
            <Link className="nav-link nav-link-active" href="/demo" aria-current="page">Live demo</Link>
            <Link className="nav-link" href="/roadmap">Roadmap</Link>
            <Link className="nav-link" href="/profile">Profile</Link>
            <Link className="nav-link" href="/feed">Opportunities</Link>
          </nav>
          <span className="environment-pill"><span className="status-dot" /> Connected demo</span>
        </header>

        <section id="page-content" tabIndex={-1} className="demo-page" aria-labelledby="page-title">
          <p className="eyebrow"><span className="eyebrow-line" /> GUIDED PRODUCT WALKTHROUGH</p>
          <h1 id="page-title">A real session.<br /><span className="heading-accent">A clear next step.</span></h1>
          <p className="hero-copy">This walkthrough uses the application's existing authentication and mentor-session APIs. It creates real database records; it does not pretend the external SSO or Oscar conversation service is connected.</p>

          <div className="demo-status-strip" aria-label="Service status">
            <span className={health?.status === 'ok' ? 'demo-status-dot is-online' : 'demo-status-dot'} />
            <strong>{health?.status === 'ok' ? 'Application API reachable' : checking ? 'Checking application API…' : 'Application API unavailable'}</strong>
            <span>{health?.service ?? 'OnlyDucks'}</span>
          </div>

          {message && <p className="demo-feedback" role="status" aria-live="polite">{message}</p>}

          <div className="demo-flow">
            <section className="demo-step-card" aria-labelledby="demo-auth-title">
              <div className="demo-step-heading"><span>01</span><div><p className="eyebrow">IDENTITY</p><h2 id="demo-auth-title">Sign in to the demo</h2></div></div>
              {identity ? (
                <div className="demo-authenticated">
                  <span className="demo-connected-label">Authenticated</span>
                  <strong>{identity.externalUserId}</strong>
                  <p>Issuer: {identity.issuer}. This is the configured local demo identity provider, not shared SSO.</p>
                  <button className="button button-secondary" type="button" onClick={signOut} disabled={busy}>Sign out</button>
                </div>
              ) : (
                <form className="demo-login-form" onSubmit={signIn}>
                  <label htmlFor="demo-username">Demo username</label>
                  <input id="demo-username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={64} />
                  <label htmlFor="demo-password">Demo password</label>
                  <input id="demo-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={1024} />
                  <button className="button button-primary" type="submit" disabled={busy || checking}>{busy ? 'Please wait…' : 'Sign in'} <span aria-hidden="true">→</span></button>
                  <p className="demo-help">Use an account provisioned by the deployment operator. No public registration or default credentials are provided.</p>
                </form>
              )}
            </section>

            <section className="demo-step-card" aria-labelledby="demo-session-title">
              <div className="demo-step-heading"><span>02</span><div><p className="eyebrow">PERSISTENCE</p><h2 id="demo-session-title">Create a mentor session</h2></div></div>
              {!identity ? (
                <p className="demo-muted">Sign in first. Session creation is available only to authenticated users.</p>
              ) : session ? (
                <div className="demo-session-card">
                  <span className="demo-connected-label">Persisted session · {session.status}</span>
                  <h3>{session.mentor.name}</h3>
                  <p>{session.mentor.technology} · {session.mentor.teachingStyle}</p>
                  <small>Session ID: {session.id}</small>
                  <button className="button button-secondary" type="button" onClick={completeSession} disabled={busy}>Complete session</button>
                </div>
              ) : (
                <div className="demo-session-form">
                  <label htmlFor="demo-mentor">Choose a mentor profile</label>
                  <select id="demo-mentor" value={selectedMentor} onChange={(event) => setSelectedMentor(event.target.value)}>
                    {mentors.map((mentor) => <option key={mentor.slug} value={mentor.slug}>{mentor.name} — {mentor.focus}</option>)}
                  </select>
                  <button className="button button-primary" type="button" onClick={startSession} disabled={busy}>{busy ? 'Creating…' : 'Create database session'} <span aria-hidden="true">→</span></button>
                  <p className="demo-help">This calls the authenticated session API and stores the session in PostgreSQL. One active session per user is enforced by the backend.</p>
                </div>
              )}
            </section>

            <section className="demo-step-card demo-agent-step" aria-labelledby="demo-agent-title">
              <div className="demo-step-heading"><span>03</span><div><p className="eyebrow">AI INTERACTION</p><h2 id="demo-agent-title">Continue with the agent</h2></div></div>
              <p className="demo-muted">The agent workspace is ready for interaction design and blueprint review. Live model responses require the Oscar API contract and credentials; this step remains in clearly labelled local preview mode.</p>
              <Link className="button button-secondary" href="/agent">Open agent workspace <span aria-hidden="true">→</span></Link>
            </section>
          </div>

          <section className="demo-boundary" aria-labelledby="demo-boundary-title">
            <h2 id="demo-boundary-title">What is genuinely connected?</h2>
            <ul>
              <li><strong>Application API:</strong> health endpoint and same-origin requests.</li>
              <li><strong>Authentication:</strong> local demo login, HTTP-only session cookie, and identity check when the local provider is configured.</li>
              <li><strong>Database:</strong> mentor-session create, read, and complete operations through the existing API.</li>
              <li><strong>Not connected:</strong> shared SSO, Oscar AI messages, live opportunity feed, and production analytics.</li>
            </ul>
          </section>
        </section>
      </main>
    </>
  );
}
