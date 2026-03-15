// PageTour — Reusable guided tour component for any admin page
// Usage: <PageTour steps={[{ target: '#element-id', title: 'Title', text: 'Description' }, ...]} />
// Each step highlights a DOM element with a spotlight and shows a speech bubble.

import { useState, useEffect, useCallback, useRef } from 'react';

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', monospace";

export default function PageTour({ steps = [], storageKey }) {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState(null);
  const bubbleRef = useRef(null);

  const key = storageKey || 'ds_tour_' + (steps[0]?.target || 'default');
  const dismissed = localStorage.getItem(key) === 'done';

  const current = steps[stepIdx];

  const measureTarget = useCallback(() => {
    if (!current?.target) { setRect(null); return; }
    const el = document.querySelector(current.target);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top + window.scrollY, left: r.left, width: r.width, height: r.height });
    // Scroll so the target top is near the top of viewport (leaving room for bubble below)
    const targetTop = r.top + window.scrollY;
    const scrollTo = Math.max(0, targetTop - 100); // 100px from top of viewport
    if (r.top < 80 || r.top > window.innerHeight - 250) {
      window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      setTimeout(() => {
        const r2 = el.getBoundingClientRect();
        setRect({ top: r2.top + window.scrollY, left: r2.left, width: r2.width, height: r2.height });
      }, 400);
    }
  }, [current]);

  useEffect(() => {
    if (active && current) {
      measureTarget();
      window.addEventListener('resize', measureTarget);
      return () => window.removeEventListener('resize', measureTarget);
    }
  }, [active, stepIdx, measureTarget]);

  const start = () => { setStepIdx(0); setActive(true); };
  const next = () => {
    if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
    else { setActive(false); localStorage.setItem(key, 'done'); }
  };
  const prev = () => { if (stepIdx > 0) setStepIdx(stepIdx - 1); };
  const close = () => { setActive(false); };

  if (steps.length === 0) return null;

  // "Teach me" button
  if (!active) {
    return (
      <button onClick={start} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 100,
        background: 'rgba(197,165,90,0.08)', border: '1px solid rgba(197,165,90,0.2)',
        color: '#C5A55A', font: `500 12px ${FONT}`, cursor: 'pointer',
        transition: 'all 0.2s', letterSpacing: '0.02em',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(197,165,90,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(197,165,90,0.08)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Teach me this page
      </button>
    );
  }

  // Bubble position — FIXED to viewport so it's always visible
  let bubbleStyle = { position: 'fixed', zIndex: 10002 };
  if (rect) {
    const viewRect = {
      top: rect.top - window.scrollY,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
    const below = viewRect.top + viewRect.height + 16;
    const centerX = viewRect.left + viewRect.width / 2;
    // Default: below the element
    if (below + 220 < window.innerHeight) {
      bubbleStyle.top = below;
    } else {
      // Put above if no room below
      bubbleStyle.top = Math.max(16, viewRect.top - 16);
      bubbleStyle.transform = 'translateY(-100%)';
    }
    bubbleStyle.left = Math.max(16, Math.min(centerX - 180, window.innerWidth - 376));
  } else {
    bubbleStyle.top = '40%';
    bubbleStyle.left = '50%';
    bubbleStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - 6} y={rect.top - window.scrollY - 6}
                  width={rect.width + 12} height={rect.height + 12}
                  rx="8" fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#tour-mask)" />
        </svg>
      </div>

      {/* Highlight border around target */}
      {rect && (
        <div style={{
          position: 'fixed',
          top: rect.top - window.scrollY - 6, left: rect.left - 6,
          width: rect.width + 12, height: rect.height + 12,
          border: '2px solid #C5A55A', borderRadius: 8,
          zIndex: 10001, pointerEvents: 'none',
          boxShadow: '0 0 0 4px rgba(197,165,90,0.2), 0 0 20px rgba(197,165,90,0.15)',
          transition: 'all 0.3s ease',
        }} />
      )}

      {/* Click overlay to prevent interaction outside bubble */}
      <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 10001, cursor: 'default' }} />

      {/* Speech bubble */}
      <div ref={bubbleRef} style={{
        ...bubbleStyle,
        width: 360, maxWidth: 'calc(100vw - 32px)',
        background: '#FFFFFF', borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
        padding: '24px 24px 20px', pointerEvents: 'auto',
      }} onClick={e => e.stopPropagation()}>
        {/* Step counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ font: `600 10px ${MONO}`, letterSpacing: 1, textTransform: 'uppercase', color: '#C5A55A' }}>
            Step {stepIdx + 1} of {steps.length}
          </span>
          <button onClick={close} style={{ background: 'none', border: 'none', color: '#B5B3AD', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>&#10005;</button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === stepIdx ? 20 : 6, height: 6, borderRadius: 3,
              background: i <= stepIdx ? '#C5A55A' : '#E8E5DF',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Content */}
        <h3 style={{ font: `600 17px ${FONT}`, color: '#1A1A2E', margin: '0 0 8px' }}>{current?.title || ''}</h3>
        <p style={{ font: `400 14px/1.6 ${FONT}`, color: '#7C7B76', margin: '0 0 20px' }}>{current?.text || ''}</p>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={prev}
            disabled={stepIdx === 0}
            style={{
              font: `500 13px ${FONT}`, color: stepIdx === 0 ? '#B5B3AD' : '#7C7B76',
              background: 'none', border: 'none', cursor: stepIdx === 0 ? 'default' : 'pointer',
              padding: '8px 0',
            }}
          >Back</button>
          <button onClick={next} style={{
            font: `600 13px ${FONT}`, color: '#fff',
            background: '#C5A55A', border: 'none', borderRadius: 6,
            padding: '10px 24px', cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            {stepIdx === steps.length - 1 ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}
