import { useState, useRef, useEffect } from 'react';
import { FEATURES } from '../data/helpKnowledge';

// ── TOOLTIP LOOKUP ──
// Pull tooltip text from helpKnowledge.js by feature.tooltipKey
// Usage: <HelpBubble feature="inventory" tooltipKey="search" />
// Falls back to inline `text` prop if feature/key not found
function resolveTooltipText(text, feature, tooltipKey) {
  if (feature && tooltipKey && FEATURES[feature]?.tooltips?.[tooltipKey]) {
    return FEATURES[feature].tooltips[tooltipKey];
  }
  return text || '';
}

const S = {
  wrap: { position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 6 },
  btn: {
    width: 20, height: 20, borderRadius: '50%',
    background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)',
    color: '#D4AF37', font: "700 11px/1 -apple-system, sans-serif",
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s', flexShrink: 0, padding: 0,
  },
  btnHover: { background: 'rgba(212,175,55,0.2)', borderColor: '#D4AF37' },
  tooltip: (pos) => ({
    position: 'absolute',
    [pos === 'above' ? 'bottom' : 'top']: 'calc(100% + 10px)',
    left: '50%', transform: 'translateX(-50%)',
    width: 280, maxWidth: 'calc(100vw - 48px)',
    background: '#FFFFFF', border: '1px solid #E2E8F0',
    borderRadius: 10, padding: '16px 18px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    zIndex: 1000, animation: 'helpFadeIn 0.2s ease',
  }),
  arrow: (pos) => ({
    position: 'absolute',
    [pos === 'above' ? 'bottom' : 'top']: -6,
    left: '50%', transform: 'translateX(-50%) rotate(45deg)',
    width: 10, height: 10, background: '#FFFFFF',
    border: pos === 'above' ? 'none' : '1px solid #E2E8F0',
    borderTop: pos === 'above' ? '1px solid #E2E8F0' : 'none',
    borderLeft: pos === 'above' ? '1px solid #E2E8F0' : 'none',
    borderRight: pos === 'above' ? 'none' : 'none',
    borderBottom: pos === 'above' ? 'none' : '1px solid #E2E8F0',
  }),
  text: { font: "400 14px/1.5 -apple-system, sans-serif", color: '#475569', margin: 0 },
  dismiss: {
    marginTop: 10, background: 'none', border: 'none',
    font: "500 13px -apple-system, sans-serif", color: '#D4AF37',
    cursor: 'pointer', padding: 0,
  },
};

export default function HelpBubble({ text, feature, tooltipKey, pos = 'below' }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef(null);

  const resolvedText = resolveTooltipText(text, feature, tooltipKey);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!resolvedText) return null;

  return (
    <span style={S.wrap} ref={ref}>
      <button
        style={{ ...S.btn, ...(hover ? S.btnHover : {}) }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        type="button"
        aria-label="Help"
      >?</button>
      {open && (
        <div style={S.tooltip(pos)}>
          <div style={S.arrow(pos)} />
          <p style={S.text}>{resolvedText}</p>
          <button style={S.dismiss} onClick={() => setOpen(false)}>Got it</button>
        </div>
      )}
      <style>{`@keyframes helpFadeIn { from { opacity:0; transform: translateX(-50%) translateY(4px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
    </span>
  );
}

// Convenience: label with help
export function LabelWithHelp({ children, help, feature, tooltipKey, htmlFor, style = {} }) {
  const resolvedHelp = resolveTooltipText(help, feature, tooltipKey);
  return (
    <label htmlFor={htmlFor} style={{ display: 'flex', alignItems: 'center', ...style }}>
      {children}
      {resolvedHelp && <HelpBubble text={resolvedHelp} />}
    </label>
  );
}
