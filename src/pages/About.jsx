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

function SectionSep() {
  return <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)' }} />;
}

const goldGradientStyle = {
  background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const OFFERINGS = [
  { icon: '🔭', title: 'Research Observatory', desc: 'Five research-grade telescopes including a 24-inch Ritchey-Chrétien reflector. Open nightly for guided viewing sessions under some of the darkest skies in the American Southwest.' },
  { icon: '🌌', title: 'Digital Planetarium', desc: 'A state-of-the-art 4K fulldome theater seating 120 guests. Immersive shows transport you from our solar system to the edge of the observable universe.' },
  { icon: '🪐', title: 'Interactive Exhibits', desc: 'Hands-on galleries exploring light pollution, celestial navigation, space exploration, and the cultural significance of the night sky across civilizations.' },
  { icon: '✦', title: 'Curated Experiences', desc: 'From stargazing dinners to astrophotography workshops, every visit is designed to create lasting connections with the cosmos.' },
];

const STATS = [
  { number: '35K+', label: 'Square Feet' },
  { number: '50M+', label: 'Dark Sky Acres Preserved' },
  { number: '200+', label: 'Annual Programs' },
  { number: '24"', label: 'Primary Telescope' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ── HERO ── */}
      <section className="about-hero">
        <RevealSection>
          <div className="section-header">
            <span className="section-label label">// About the Center</span>
            <h1 className="section-title">Connecting the Night Sky to <em>Life on Earth</em></h1>
            <p className="section-subtitle" style={{ lineHeight: 1.7 }}>
              The International Dark Sky Discovery Center is a 35,000 square foot institution dedicated to dark sky preservation, astronomy education, and the wonder of the cosmos. Opening Fall 2026 in Fountain Hills, Arizona.
            </p>
          </div>
        </RevealSection>
      </section>

      <SectionSep />

      {/* ── OFFERINGS GRID ── */}
      <section className="section">
        <div className="about-grid">
          {OFFERINGS.map((item, i) => (
            <RevealSection key={item.title} delay={i * 100}>
              <div className="about-card">
                <div className="about-card-icon">{item.icon}</div>
                <h3 className="about-card-title">{item.title}</h3>
                <p className="about-card-desc">{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <SectionSep />

      {/* ── IMPACT STATS ── */}
      <RevealSection>
        <div className="about-stats">
          {STATS.map((s, i) => (
            <RevealSection key={s.label} delay={i * 100}>
              <div className="about-stat">
                <div className="about-stat-number" style={goldGradientStyle}>{s.number}</div>
                <div className="about-stat-label">{s.label}</div>
              </div>
            </RevealSection>
          ))}
        </div>
      </RevealSection>

      <SectionSep />

      {/* ── OUR STORY ── */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <RevealSection>
          <div className="section-header">
            <span className="section-label label">// Our Story</span>
            <h2 className="section-title">Born from a <em>Mission</em></h2>
          </div>
        </RevealSection>

        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <RevealSection delay={100}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text2)', marginBottom: 40, fontWeight: 300 }}>
              The International Dark Sky Discovery Center was born from a simple observation: the night sky is disappearing. Light pollution now affects 80% of the world's population, and a generation of children is growing up without ever seeing the Milky Way.
            </p>
          </RevealSection>

          <RevealSection delay={200}>
            <blockquote style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontStyle: 'italic',
              color: 'var(--gold)',
              lineHeight: 1.6,
              margin: '48px 0',
              padding: '32px 0',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}>
              "We believe that reconnecting people with the night sky can change how they see their place in the universe."
            </blockquote>
          </RevealSection>

          <RevealSection delay={300}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text2)', fontWeight: 300 }}>
              Nestled in the Sonoran Desert outside Fountain Hills, Arizona, the Discovery Center sits beneath some of the darkest, most pristine skies in the continental United States. Our 35,000-square-foot facility will serve as a beacon for astronomy education, dark sky advocacy, and scientific research.
            </p>
          </RevealSection>
        </div>
      </section>

      <SectionSep />

      {/* ── CTA ── */}
      <RevealSection>
        <div className="mission">
          <blockquote className="mission-quote">
            "The cosmos is within us. We are made of <em>star-stuff.</em>"
          </blockquote>
          <span className="mission-attr">// Carl Sagan</span>
          <div style={{ display: 'flex', gap: 16, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/membership')}>Become a Member</button>
            <button className="btn-ghost" onClick={() => navigate('/events')}>Explore Events</button>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
