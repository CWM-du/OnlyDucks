'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { demoAgentAdapter } from '../../lib/agent/demo-adapter';
import type { AgentBlueprint, AgentMode } from '../../lib/agent/types';

const examples = [
  'Help me prepare for a junior frontend interview',
  'Create a practical plan to learn TypeScript',
  'Turn my project idea into a portfolio case study',
];

export default function AgentPage() {
  const [mode, setMode] = useState<AgentMode>('chat');
  const [prompt, setPrompt] = useState('');
  const [refinement, setRefinement] = useState('');
  const [blueprint, setBlueprint] = useState<AgentBlueprint | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState('Tell me what you want to learn or achieve. I’ll turn it into a plan you can review and refine before taking action.');

  function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setBlueprint(demoAgentAdapter.createBlueprint(prompt));
    setCompleted([]);
    setApproved(false);
    setMessage(mode === 'chat'
      ? 'I’ve drafted a blueprint. Review the steps on the right, then tell me what you’d like to adjust.'
      : 'Build preview created. Review the blueprint before approving the next step.');
  }

  function refinePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!blueprint || !refinement.trim()) return;
    setBlueprint(demoAgentAdapter.refineBlueprint(blueprint, refinement));
    setMessage('I’ve applied that direction to the draft. You can keep refining it or approve this preview.');
    setRefinement('');
    setApproved(false);
  }

  function resetWorkspace() {
    setPrompt('');
    setRefinement('');
    setBlueprint(null);
    setCompleted([]);
    setApproved(false);
    setMessage('Tell me what you want to learn or achieve. I’ll turn it into a plan you can review and refine before taking action.');
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
            <Link className="nav-link" href="/agent" aria-current="page">Agent</Link><Link className="nav-link" href="/sandbox">Sandbox</Link>
            <Link className="nav-link" href="/roadmap">Roadmap</Link>
            <Link className="nav-link" href="/profile">Profile</Link>
            <Link className="nav-link" href="/feed">Opportunities</Link>
          </nav>
          <span className="environment-pill"><span className="status-dot status-dot-muted" /> Demo workspace</span>
        </header>

        <section id="page-content" tabIndex={-1} className="agent-page" aria-labelledby="page-title">
          <div className="agent-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" /> YOUR AI LEARNING PARTNER</p>
              <h1 id="page-title">Make a plan.<br /><span className="heading-accent">Make progress.</span></h1>
              <p className="hero-copy">Describe the outcome you want. The agent drafts a blueprint, works through revisions with you, and keeps the next steps visible.</p>
            </div>
            <div className="agent-mode-switch" role="group" aria-label="Agent mode">
              <button type="button" className={mode === 'chat' ? 'agent-mode active' : 'agent-mode'} onClick={() => setMode('chat')}>Chat to plan</button>
              <button type="button" className={mode === 'build' ? 'agent-mode active' : 'agent-mode'} onClick={() => setMode('build')}>Build preview</button>
            </div>
          </div>

          <div className="agent-workspace">
            <section className="agent-chat-panel" aria-labelledby="agent-chat-title">
              <div className="agent-panel-heading">
                <div className="agent-avatar" aria-hidden="true">OD</div>
                <div><h2 id="agent-chat-title">OnlyDucks Agent</h2><p>Planning assistant · Demo mode</p></div>
                <span className="agent-live-indicator">Preview</span>
              </div>
              <div className="agent-conversation" aria-live="polite">
                <div className="agent-message agent-message-assistant">
                  <span className="agent-message-label">AGENT</span>
                  <p>{message}</p>
                </div>
                {blueprint && (
                  <div className="agent-message agent-message-user">
                    <span className="agent-message-label">YOU</span>
                    <p>{prompt}</p>
                  </div>
                )}
              </div>
              <form className="agent-prompt-form" onSubmit={createPlan}>
                <label htmlFor="agent-prompt">What would you like to achieve?</label>
                <textarea id="agent-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="e.g. Help me build a portfolio project that demonstrates my React skills…" rows={4} maxLength={600} />
                <div className="agent-prompt-footer">
                  <span>{prompt.length}/600</span>
                  <button className="button button-primary" type="submit" disabled={!prompt.trim()}>Create blueprint <span aria-hidden="true">→</span></button>
                </div>
              </form>
              <div className="agent-examples">
                <p>Need a starting point?</p>
                {examples.map((example) => <button type="button" key={example} onClick={() => setPrompt(example)}>{example}</button>)}
              </div>
              {blueprint && (
                <form className="agent-refine-form" onSubmit={refinePlan}>
                  <label htmlFor="agent-refinement">Refine the blueprint</label>
                  <div className="agent-refine-row">
                    <input id="agent-refinement" value={refinement} onChange={(event) => setRefinement(event.target.value)} placeholder="Make it more hands-on, shorter…" maxLength={240} />
                    <button className="button button-secondary" type="submit" disabled={!refinement.trim()}>Apply</button>
                  </div>
                </form>
              )}
            </section>

            <aside className="agent-blueprint-panel" aria-labelledby="blueprint-title">
              <div className="agent-blueprint-header">
                <div><p className="eyebrow">WORKSPACE PREVIEW</p><h2 id="blueprint-title">Blueprint</h2></div>
                <button type="button" className="agent-reset-button" onClick={resetWorkspace} disabled={!blueprint}>Reset</button>
              </div>
              {!blueprint ? (
                <div className="agent-empty-blueprint">
                  <div className="agent-empty-icon" aria-hidden="true">✳</div>
                  <h3>Your plan will appear here</h3>
                  <p>Start with a goal. The agent will break it into clear steps and tangible outputs before anything is approved.</p>
                </div>
              ) : (
                <>
                  <div className="blueprint-summary">
                    <span className="blueprint-status">{approved ? 'Preview approved' : 'Draft · awaiting approval'}</span>
                    <h3>{blueprint.title}</h3>
                    <p>{blueprint.objective}</p>
                    <div className="blueprint-meta"><span>{blueprint.audience}</span><span>{blueprint.estimatedTime}</span></div>
                  </div>
                  <div className="blueprint-steps">
                    {blueprint.steps.map((step, index) => (
                      <article className={completed.includes(step.id) ? 'blueprint-step is-complete' : 'blueprint-step'} key={step.id}>
                        <label className="blueprint-step-check">
                          <input type="checkbox" checked={completed.includes(step.id)} onChange={(event) => setCompleted((current) => event.target.checked ? [...current, step.id] : current.filter((id) => id !== step.id))} />
                          <span>{String(index + 1).padStart(2, '0')}</span>
                        </label>
                        <div><h4>{step.title}</h4><p>{step.description}</p><small>OUTPUT · {step.output}</small></div>
                      </article>
                    ))}
                  </div>
                  <div className="blueprint-actions">
                    <button type="button" className="button button-primary" onClick={() => setApproved(true)} disabled={approved}>Approve preview <span aria-hidden="true">✓</span></button>
                    <p>{approved ? 'Approved in this browser preview only. No session or roadmap has been saved.' : 'Approval only changes this local preview. Live execution is not connected.'}</p>
                  </div>
                </>
              )}
            </aside>
          </div>

          <div className="agent-demo-notice" role="note">
            <strong>Replaceable demo environment.</strong>
            <span>This workspace uses a local deterministic adapter. It does not call an AI model, create a mentor session, write to the database, or sync with your account. The adapter can be replaced when Oscar API, SSO, and session services are ready.</span>
          </div>
        </section>
      </main>
    </>
  );
}
