import { useState, useEffect } from 'react';

const S = {
  wrap: { },
  progress: {
    display: 'flex', alignItems: 'center', gap: 0,
    marginBottom: 32, padding: '0 4px',
  },
  step: (active, done) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    font: `${done || active ? 500 : 400} 14px/1 -apple-system, sans-serif`,
    color: active ? '#D4AF37' : done ? '#10B981' : '#94A3B8',
    whiteSpace: 'nowrap',
  }),
  stepNum: (active, done) => ({
    width: 32, height: 32, borderRadius: '50%',
    border: `2px solid ${active ? '#D4AF37' : done ? '#10B981' : '#E2E8F0'}`,
    background: done ? 'rgba(16,185,129,0.08)' : active ? 'rgba(212,175,55,0.08)' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    font: `600 13px/1 -apple-system, sans-serif`,
    color: active ? '#D4AF37' : done ? '#10B981' : '#94A3B8',
    flexShrink: 0, transition: 'all 0.2s',
  }),
  line: {
    flex: 1, height: 2, background: '#E2E8F0',
    margin: '0 12px', minWidth: 20,
  },
  lineDone: {
    flex: 1, height: 2, background: '#10B981',
    margin: '0 12px', minWidth: 20,
  },
  body: {
    animation: 'wizardSlide 0.3s ease',
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 32, paddingTop: 24,
    borderTop: '1px solid #E2E8F0',
  },
  btnBack: {
    padding: '12px 24px', height: 48, borderRadius: 8,
    background: '#FFFFFF', border: '1px solid #E2E8F0',
    font: "500 15px/1 -apple-system, sans-serif", color: '#64748B',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  btnNext: {
    padding: '12px 28px', height: 48, borderRadius: 8,
    background: '#D4AF37', border: 'none',
    font: "600 15px/1 -apple-system, sans-serif", color: '#FFFFFF',
    cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  btnDraft: {
    padding: '12px 24px', height: 48, borderRadius: 8,
    background: '#F1F5F9', border: '1px solid #E2E8F0',
    font: "500 15px/1 -apple-system, sans-serif", color: '#64748B',
    cursor: 'pointer', transition: 'all 0.2s', marginRight: 12,
  },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
};

export default function Wizard({
  steps, // [{ label: string, content: ReactNode, validate?: () => bool }]
  onComplete, // (data) => void
  onSaveDraft, // optional
  completeBtnText = 'Complete',
  draftBtnText = 'Save as Draft',
}) {
  const [current, setCurrent] = useState(0);
  const isLast = current === steps.length - 1;
  const step = steps[current];

  const goNext = () => {
    if (step.validate && !step.validate()) return;
    if (isLast) {
      onComplete?.();
    } else {
      setCurrent(c => c + 1);
    }
  };

  const goBack = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  return (
    <div style={S.wrap}>
      {/* Progress bar */}
      <div style={S.progress}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={S.step(i === current, i < current)}>
              <span style={S.stepNum(i === current, i < current)}>
                {i < current ? '✓' : i + 1}
              </span>
              <span className="wizard-step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={i < current ? S.lineDone : S.line} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div style={S.body} key={current}>
        {step.content}
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <div>
          {current > 0 && (
            <button style={S.btnBack} onClick={goBack}>← Back</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {onSaveDraft && (
            <button style={S.btnDraft} onClick={onSaveDraft}>{draftBtnText}</button>
          )}
          <button style={S.btnNext} onClick={goNext}>
            {isLast ? completeBtnText : 'Next →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes wizardSlide { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 768px) { .wizard-step-label { display: none; } }
      `}</style>
    </div>
  );
}
