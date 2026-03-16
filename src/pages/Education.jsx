import { useRef, useEffect, useState } from 'react';
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

function LazyVideo({ src, className = '', style = {}, ...props }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [srcActive, setSrcActive] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSrcActive(src); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);
  return (
    <video ref={ref} className={className} style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease' }}
      src={srcActive} onLoadedData={() => setLoaded(true)} {...props} />
  );
}

function VideoDivider({ src, title, subtitle, titleEditable, subtitleEditable }) {
  return (
    <div className="vid-divider">
      <div className="vid-divider-clip">
        <LazyVideo src={src} className="vid-divider-video" autoPlay muted loop playsInline />
      </div>
      <div className="vid-divider-overlay-top" />
      <div className="vid-divider-overlay-bottom" />
      <div className="vid-divider-content">
        <div className="vid-divider-box">
          <h2 className="vid-divider-title" {...(titleEditable ? {'data-editable': titleEditable} : {})}>{title}</h2>
          <p className="vid-divider-sub" {...(subtitleEditable ? {'data-editable': subtitleEditable} : {})}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

const goldGradientStyle = {
  background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const PROGRAMS = [
  { icon: '✦', img: '/images/darksky/observatory-hero.jpg', label: '01 — Field Trips', title: 'School Field Trips', desc: 'Standards-aligned programs for K-12 students. Planetarium shows, telescope viewing, and hands-on labs. We work with teachers to customize each visit to their curriculum. Free bus subsidies available for Title I schools.', cta: 'Book a Field Trip' },
  { icon: '✦', img: '/images/darksky/nebula.jpg', label: '02 — Workshops', title: 'Public Workshops', desc: 'Weekend and evening workshops for astronomy enthusiasts of all levels. From beginner stargazing to advanced astrophotography, telescope building, and celestial navigation. All materials included.', cta: 'View Schedule' },
  { icon: '✦', img: '/images/darksky/milky-way.jpg', label: '03 — Professional Development', title: 'Teacher Training', desc: 'Multi-day institutes for educators looking to bring astronomy into their classrooms. Earn continuing education credits while learning to teach with real astronomical data and NASA resources.', cta: 'Apply Now' },
  { icon: '✦', img: '/images/darksky/gila-monster.png', label: '04 — Community', title: 'Community Outreach', desc: 'Telescope lending library, dark sky advocacy toolkit, and mobile planetarium visits to underserved communities. We believe everyone deserves access to the night sky.', cta: 'Get Involved' },
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
    <div data-page="education">
      {/* ── HERO ── */}
      <section className="edu-hero" data-section="Hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="/images/darksky/meteor-shower.jpg"
          alt="Meteor shower streaking across the desert sky"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }}
        />
        <RevealSection>
          <div className="section-header" style={{ position: 'relative', zIndex: 1 }}>
            <span className="section-label label" data-editable="edu-hero-label">// Education &amp; Outreach</span>
            <h1 className="section-title" data-editable="edu-hero-title">Inspiring the Next Generation of <em>Stargazers</em></h1>
            <p className="section-subtitle" data-editable="edu-hero-subtitle" style={{ lineHeight: 1.7 }}>
              From field trips to professional development, our education programs connect learners of all ages with the science and wonder of the night sky.
            </p>
          </div>
        </RevealSection>
      </section>

      <SectionSep />

      {/* ── PROGRAMS ── */}
      <section className="section">
        {PROGRAMS.map((program, i) => (
          <div key={program.title}>
            <RevealSection delay={i * 100}>
              <div className="edu-program" style={i % 2 === 1 ? { direction: 'rtl' } : undefined}>
                <div className="edu-program-img" style={{
                  background: `linear-gradient(135deg, var(--surface) 0%, #0c0c2a 50%, var(--bg) 100%)`,
                  backgroundSize: '200% 200%',
                  animation: 'heroShift 15s ease-in-out infinite alternate',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 16,
                  direction: 'ltr',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <img
                    src={program.img}
                    alt={`${program.title} backdrop`}
                    loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,12,0.5)', zIndex: 1 }} />
                  <span className="label" style={{ opacity: 0.5, position: 'relative', zIndex: 2, fontSize: 11 }}>{program.label}</span>
                </div>
                <div className="edu-program-content" style={i % 2 === 1 ? { direction: 'ltr' } : undefined}>
                  <span className="label" data-editable={`edu-prog-label-${i}`}>{program.label}</span>
                  <h3 className="edu-program-title" data-editable={`edu-prog-title-${i}`}>{program.title}</h3>
                  <p className="edu-program-desc" data-editable={`edu-prog-desc-${i}`} style={{ lineHeight: 1.7 }}>{program.desc}</p>
                  <button className="btn-outline" onClick={() => navigate(i === 0 ? '/field-trips' : i === 1 ? '/events' : '/contact')} style={{ marginTop: 24, alignSelf: 'flex-start' }}>{program.cta}</button>
                </div>
              </div>
            </RevealSection>
            {i < PROGRAMS.length - 1 && <SectionSep />}
          </div>
        ))}
      </section>

      <SectionSep />

      <VideoDivider
        src="/videos/darksky/scorpion.mp4"
        title="Science You Can See"
        subtitle="From UV-glowing scorpions to migrating birds, dark skies reveal what daylight hides."
      />

      <SectionSep />

      {/* ── IMPACT STATS ── */}
      <RevealSection>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          {STATS.map((s, i) => (
            <RevealSection key={s.label} delay={i * 100}>
              <div style={{
                padding: 56,
                textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div data-editable={`edu-stat-number-${i}`} style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 48,
                  fontWeight: 300,
                  lineHeight: 1,
                  marginBottom: 12,
                  ...goldGradientStyle,
                }}>
                  {s.number}
                </div>
                <div data-editable={`edu-stat-label-${i}`} style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--text2)',
                }}>
                  {s.label}
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </RevealSection>

      <SectionSep />

      {/* ── VIDEO DIVIDER ── */}
      <VideoDivider
        src="https://ssdozdtdcrkaoayzhrsa.supabase.co/storage/v1/object/public/videos/education-hero.mp4"
        title="Learning Under the Stars"
        subtitle="Education programs for every age and background"
        titleEditable="edu-vid-title"
        subtitleEditable="edu-vid-subtitle"
      />

      <SectionSep />

      <VideoDivider
        src="/videos/darksky/tarantula.mp4"
        title="The Desert Comes Alive"
        subtitle="After sunset, a hidden world emerges. Our programs bring students face-to-face with it."
      />

      <SectionSep />

      {/* ── CTA ── */}
      <RevealSection>
        <div className="mission" style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="/images/darksky/first-light-nebula.jpg"
            alt="First Light Nebula glowing in deep space"
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }}
          />
          <blockquote className="mission-quote" data-editable="edu-cta-quote" style={{ position: 'relative', zIndex: 1 }}>
            "Every child should see the <em>Milky Way.</em>"
          </blockquote>
          <span className="mission-attr" data-editable="edu-cta-attr" style={{ position: 'relative', zIndex: 1 }}>// Our founding principle</span>
          <div style={{ display: 'flex', gap: 16, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <button className="btn-primary" onClick={() => navigate('/membership')}>Support Our Mission</button>
            <button className="btn-ghost" onClick={() => navigate('/membership')}>Become a Member</button>
          </div>
        </div>
      </RevealSection>

      {/* ── Video divider styles ── */}
      <style>{`
        .vid-divider { position: relative; height: 400px; overflow: hidden; }
        .vid-divider-clip { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .vid-divider-video { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.8s ease; pointer-events: none; }
        .vid-divider-overlay-top { position: absolute; top: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to bottom, var(--bg, #04040c), transparent); z-index: 2; pointer-events: none; }
        .vid-divider-overlay-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to top, var(--bg, #04040c), transparent); z-index: 2; pointer-events: none; }
        .vid-divider-content { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 3; text-align: center; padding: 0 24px; }
        .vid-divider-box { padding: 24px 48px; }
        .vid-divider-title { font: 400 clamp(32px, 5vw, 52px)/1.1 'Playfair Display', serif; font-style: italic; color: #FFFFFF; margin: 0 0 12px; text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.8), 0 8px 40px rgba(0,0,0,0.6), 0 0 80px rgba(0,0,0,0.4); }
        .vid-divider-sub { font: 300 clamp(14px, 2vw, 18px)/1.6 'Plus Jakarta Sans', sans-serif; color: rgba(255,255,255,0.9); margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5); letter-spacing: 0.02em; }
        @media (max-width: 768px) {
          .vid-divider { height: 250px; }
          .vid-divider-overlay-top, .vid-divider-overlay-bottom { height: 80px; }
          .vid-divider-clip { inset: 0; }
          .vid-divider-video { height: 100%; }
        }
        @media (max-width: 480px) {
          .vid-divider { height: 200px; }
          .vid-divider-overlay-top, .vid-divider-overlay-bottom { height: 60px; }
        }
      `}</style>
    </div>
  );
}
