'use client';

import { useEffect, useState } from 'react';

const storageKey = 'onlyducks:first-visit-tour:v1';
const steps = [
  { title: 'Welcome to OnlyDucks', body: 'OnlyDucks brings learning guidance, practical planning and professional opportunities into one place. This short tour shows you where to begin.' },
  { title: 'Explore mentors and guidance', body: 'Compare learning approaches in Mentors and use the Agent preview to shape a goal into a practical plan. Live mentor conversations are not connected in this preview.' },
  { title: 'Build a learning path', body: 'Use the Roadmap to break a goal into small steps and track progress in this browser.' },
  { title: 'Find your next opportunity', body: 'Visit Opportunities to see the content areas planned for articles, roles and developer tools. Live sources are still being connected.' },
];

export function FirstVisitTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey) !== 'completed') setOpen(true);
    } catch {
      // The tour remains available through its launch button when storage is disabled.
    }
  }, []);

  function closeTour() {
    setOpen(false);
    try {
      window.localStorage.setItem(storageKey, 'completed');
    } catch {
      // Dismissal applies to the current page session only when storage is unavailable.
    }
  }

  return (
    <>
      <button className="od-tour-launch" type="button" onClick={() => { setStep(0); setOpen(true); }}>Take the tour</button>
      {open && (
        <div className="od-tour-backdrop">
          <section className="od-tour-dialog" role="dialog" aria-modal="true" aria-labelledby="od-tour-title" aria-describedby="od-tour-description">
            <p className="od-tour-count">FIRST STEPS · {step + 1} OF {steps.length}</p>
            <h2 id="od-tour-title">{steps[step].title}</h2>
            <p id="od-tour-description">{steps[step].body}</p>
            <div className="od-tour-actions">
              <button className="od-tour-skip" type="button" onClick={closeTour}>Skip tour</button>
              <div>
                <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</button>
                {step === steps.length - 1
                  ? <button type="button" onClick={closeTour}>Finish</button>
                  : <button type="button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>Next</button>}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
