import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('vis'); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const PROGRAMS = [
  { icon: '🔭', label: '01 — Field Trips', title: 'School Field Trips', desc: 'Standards-aligned programs for K-12 students. Planetarium shows, telescope viewing, and hands-on labs. We work with teachers to customize each visit to their curriculum. Free bus subsidies available for Title I schools.', cta: 'Book a Field Trip' },
  { icon: '🌠', label: '02 — Workshops', title: 'Public Workshops', desc: 'Weekend and evening workshops for astronomy enthusiasts of all levels. From beginner stargazing to advanced astrophotography, telescope building, and celestial navigation. All materials included.', cta: 'View Schedule' },
  { icon: '📚', label: '03 — Professional Development', title: 'Teacher Training', desc: 'Multi-day institutes for educators looking to bring astronomy into their classrooms. Earn continuing education credits while learning to teach with real astronomical data and NASA resources.', cta: 'Apply Now' },
  { icon: '🌍', label: '04 — Community', title: 'Community Outreach', desc: 'Telescope lending library, dark sky advocacy toolkit, and mobile planetarium visits to underserved communities. We believe everyone deserves access to the night sky.', cta: 'Get Involved' },
];

const STATS = [
  { number: '15,000+', label: 'Students Annually' },
  { number: '200+', label: 'Partner Schools' },
  { number: '50', label: 'Telescopes Loaned' },
  { number: '12', label: 'Mobile Planetarium Visits/Month' },
];

export default function Education() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ── HERO ── */}
      <section className="edu-hero">
        <RevealSection>
          <div className="section-header">
            <span className="section-label label">// Education &amp; Outreach</span>
            <h1 className="section-title">Inspiring the Next Generation of <em>Stargazers</em></h1>
            <p className="section-subtitle">
              From field trips to professional development, our education programs connect learners of all ages with the science and wonder of the night sky.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ── PROGRAMS ── */}
      <section className="section">
        {PROGRAMS.map((program, i) => (
          <RevealSection key={program.title} delay={i * 100}>
            <div className="edu-program" style={i % 2 === 1 ? { direction: 'rtl' } : undefined}>
              <div className="edu-program-img" style={{
                background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 16,
                direction: 'ltr',
              }}>
                <span style={{ fontSize: 64, opacity: 0.6 }}>{program.icon}</span>
                <span className="label" style={{ opacity: 0.4 }}>{program.label}</span>
              </div>
              <div className="edu-program-content" style={i % 2 === 1 ? { direction: 'ltr' } : undefined}>
                <span className="label">{program.label}</span>
                <h3 className="edu-program-title">{program.title}</h3>
                <p className="edu-program-desc">{program.desc}</p>
                <button className="btn-outline" style={{ marginTop: 24, alignSelf: 'flex-start' }}>{program.cta}</button>
              </div>
            </div>
          </RevealSection>
        ))}
      </section>

      {/* ── IMPACT STATS ── */}
      <RevealSection>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: 56,
              textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 48,
                fontWeight: 300,
                color: 'var(--gold)',
                lineHeight: 1,
                marginBottom: 12,
              }}>
                {s.number}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text2)',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ── CTA ── */}
      <RevealSection>
        <div className="mission">
          <blockquote className="mission-quote">
            "Every child should see the <em>Milky Way.</em>"
          </blockquote>
          <span className="mission-attr">// Our founding principle</span>
          <div style={{ display: 'flex', gap: 16, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/membership')}>Support Our Mission</button>
            <button className="btn-ghost" onClick={() => navigate('/membership')}>Become a Member</button>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
