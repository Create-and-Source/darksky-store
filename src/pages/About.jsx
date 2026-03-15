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

/* ── Lazy Video — only loads when near viewport ── */
function LazyVideo({ src, className = '', style = {}, ...props }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [srcActive, setSrcActive] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSrcActive(src);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease' }}
      src={srcActive}
      onLoadedData={() => setLoaded(true)}
      {...props}
    />
  );
}

/* ── Video Divider Section ── */
function VideoDivider({ src, title, subtitle, titleEditable, subtitleEditable }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        setOffset((center - viewCenter) * 0.15);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} className="vid-divider">
      <div className="vid-divider-clip">
        <LazyVideo
          src={src}
          className="vid-divider-video"
          style={{ transform: `translateY(${offset}px)` }}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      <div className="vid-divider-overlay-top" />
      <div className="vid-divider-overlay-bottom" />
      <div className="vid-divider-content">
        <RevealSection>
          <h2 className="vid-divider-title" {...(titleEditable ? {'data-editable': titleEditable} : {})}>{title}</h2>
          <p className="vid-divider-sub" {...(subtitleEditable ? {'data-editable': subtitleEditable} : {})}>{subtitle}</p>
        </RevealSection>
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

const OFFERINGS = [
  { icon: '/images/darksky/observatory-hero.jpg', title: 'Dark Sky Observatory', desc: 'Home to a 27.5-inch PlaneWave CDK700 — the largest telescope in Greater Phoenix. Open nightly for guided viewing sessions under some of the darkest skies in the American Southwest.' },
  { icon: '/images/darksky/nebula.jpg', title: 'Hyperspace Planetarium', desc: 'A state-of-the-art tilted-dome theater seating 65 guests. Immersive shows transport you from our solar system to the edge of the observable universe.' },
  { icon: '/images/darksky/saturn.jpg', title: 'Interactive Exhibits', desc: 'Hands-on galleries exploring light pollution, celestial navigation, space exploration, and the cultural significance of the night sky across civilizations.' },
  { icon: '/images/darksky/milky-way.jpg', title: 'Curated Experiences', desc: 'From stargazing dinners to astrophotography workshops, every visit is designed to create lasting connections with the cosmos.' },
];

const STATS = [
  { number: '22K+', label: 'Square Feet' },
  { number: '27.5"', label: 'PlaneWave CDK700' },
  { number: '200+', label: 'Annual Programs' },
  { number: '65', label: 'Planetarium Seats' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div data-page="about">
      {/* ── HERO ── */}
      <section className="about-hero" data-section="Hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="/images/darksky/observatory-hero.jpg"
          alt="Observatory dome silhouetted against a star-filled desert sky"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.15,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <RevealSection>
          <div className="section-header" style={{ position: 'relative', zIndex: 1 }}>
            <span className="section-label label" data-editable="about-hero-label">// About the Center</span>
            <h1 className="section-title" data-editable="about-hero-title">Connecting the Night Sky to <em>Life on Earth</em></h1>
            <p className="section-subtitle" data-editable="about-hero-subtitle" style={{ lineHeight: 1.7 }}>
              The International Dark Sky Discovery Center is a 22,000 square foot institution dedicated to dark sky preservation, astronomy education, and the wonder of the cosmos. Now open in Fountain Hills, Arizona.
            </p>
          </div>
        </RevealSection>
      </section>

      <SectionSep />

      {/* ── OFFERINGS GRID — Full-bleed photo cards ── */}
      <section className="section" style={{ padding: '0 0' }}>
        <div className="about-offerings">
          {OFFERINGS.map((item, i) => (
            <RevealSection key={item.title} delay={i * 120}>
              <div className="about-offer">
                <img
                  src={item.icon}
                  alt={item.title}
                  loading="lazy"
                  className="about-offer-img"
                />
                <div className="about-offer-overlay" />
                <div className="about-offer-content">
                  <h3 className="about-offer-title" data-editable={`about-offering-title-${i}`}>{item.title}</h3>
                  <p className="about-offer-desc" data-editable={`about-offering-desc-${i}`}>{item.desc}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <SectionSep />

      {/* ── VIDEO DIVIDER ── */}
      <VideoDivider
        src="https://ssdozdtdcrkaoayzhrsa.supabase.co/storage/v1/object/public/videos/observatory-hero.mp4"
        title="22,000 Square Feet of Wonder"
        subtitle="Now open in Fountain Hills, Arizona"
        titleEditable="about-vid-title"
        subtitleEditable="about-vid-subtitle"
      />

      <SectionSep />

      {/* ── IMPACT STATS ── */}
      <RevealSection>
        <div className="about-stats">
          {STATS.map((s, i) => (
            <RevealSection key={s.label} delay={i * 100}>
              <div className="about-stat">
                <div className="about-stat-number" data-editable={`about-stat-number-${i}`} style={goldGradientStyle}>{s.number}</div>
                <div className="about-stat-label" data-editable={`about-stat-label-${i}`}>{s.label}</div>
              </div>
            </RevealSection>
          ))}
        </div>
      </RevealSection>

      <SectionSep />

      {/* ── OUR STORY ── */}
      <section className="section" style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }} data-section="Story">
        <img
          src="/images/darksky/desert-night-sky.png"
          alt="Desert landscape under a canopy of stars"
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.06,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <RevealSection>
          <div className="section-header" style={{ position: 'relative', zIndex: 1 }}>
            <span className="section-label label" data-editable="about-story-label">// Our Story</span>
            <h2 className="section-title" data-editable="about-story-title">Born from a <em>Mission</em></h2>
          </div>
        </RevealSection>

        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <RevealSection delay={100}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text2)', marginBottom: 40, fontWeight: 300 }} data-editable="about-story-p1">
              The International Dark Sky Discovery Center was born from a simple observation: the night sky is disappearing. Light pollution now affects 80% of the world's population, and a generation of children is growing up without ever seeing the Milky Way.
            </p>
          </RevealSection>

          <RevealSection delay={200}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src="/images/darksky/first-light-nebula.jpg"
                alt="First Light Nebula glowing in deep space"
                loading="lazy"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.08,
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
              />
              <blockquote data-editable="about-story-quote" style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 24,
                fontStyle: 'italic',
                color: 'var(--gold)',
                lineHeight: 1.6,
                margin: '48px 0',
                padding: '32px 0',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                position: 'relative',
                zIndex: 1,
              }}>
                "We believe that reconnecting people with the night sky can change how they see their place in the universe."
              </blockquote>
            </div>
          </RevealSection>

          <RevealSection delay={300}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text2)', fontWeight: 300 }} data-editable="about-story-p2">
              Nestled in the Sonoran Desert outside Fountain Hills, Arizona, the Discovery Center sits beneath some of the darkest, most pristine skies in the continental United States. Our 22,000-square-foot facility serves as a beacon for astronomy education, dark sky advocacy, and scientific research.
            </p>
          </RevealSection>
        </div>
      </section>

      <SectionSep />

      {/* ── CTA ── */}
      <RevealSection>
        <div className="mission" style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="/images/darksky/andromeda.jpg"
            alt="Andromeda galaxy in stunning detail against the dark cosmos"
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.1,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(4,4,12,0.5)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          <blockquote className="mission-quote" data-editable="about-cta-quote" style={{ position: 'relative', zIndex: 1 }}>
            "The cosmos is within us. We are made of <em>star-stuff.</em>"
          </blockquote>
          <span className="mission-attr" data-editable="about-cta-attr" style={{ position: 'relative', zIndex: 1 }}>// Carl Sagan</span>
          <div style={{ display: 'flex', gap: 16, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <button className="btn-primary" onClick={() => navigate('/membership')}>Become a Member</button>
            <button className="btn-ghost" onClick={() => navigate('/events')}>Explore Events</button>
          </div>
        </div>
      </RevealSection>

      {/* ── Offering cards + Video divider styles ── */}
      <style>{`
        /* ── Offering Cards ── */
        .about-offerings {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .about-offer {
          position: relative;
          min-height: 340px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          border: 1px solid rgba(255,255,255,0.04);
          cursor: default;
        }
        .about-offer-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(.16,1,.3,1);
        }
        .about-offer:hover .about-offer-img {
          transform: scale(1.04);
        }
        .about-offer-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(4,4,12,0.1) 0%,
            rgba(4,4,12,0.35) 40%,
            rgba(4,4,12,0.85) 100%
          );
          transition: background 0.4s;
        }
        .about-offer:hover .about-offer-overlay {
          background: linear-gradient(
            180deg,
            rgba(4,4,12,0.05) 0%,
            rgba(4,4,12,0.3) 40%,
            rgba(4,4,12,0.8) 100%
          );
        }
        .about-offer-content {
          position: relative;
          z-index: 1;
          padding: 40px 36px;
          width: 100%;
        }
        .about-offer-title {
          font: 500 clamp(22px, 2.5vw, 30px)/1.2 'Playfair Display', serif;
          color: #fff;
          margin: 0 0 12px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .about-offer-desc {
          font: 300 14px/1.75 'Plus Jakarta Sans', sans-serif;
          color: rgba(255,255,255,0.72);
          margin: 0;
          max-width: 420px;
        }

        @media (max-width: 860px) {
          .about-offerings { grid-template-columns: 1fr; }
          .about-offer { min-height: 280px; }
          .about-offer-content { padding: 32px 24px; }
        }

        .vid-divider {
          position: relative;
          height: 400px;
          overflow: hidden;
        }
        .vid-divider-clip {
          position: absolute;
          inset: -60px 0;
          overflow: hidden;
          pointer-events: none;
        }
        .vid-divider-video {
          width: 100%;
          height: calc(100% + 120px);
          object-fit: cover;
          transition: opacity 0.8s ease;
          pointer-events: none;
        }
        .vid-divider-overlay-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 120px;
          background: linear-gradient(to bottom, var(--bg, #04040c), transparent);
          z-index: 2;
          pointer-events: none;
        }
        .vid-divider-overlay-bottom {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 120px;
          background: linear-gradient(to top, var(--bg, #04040c), transparent);
          z-index: 2;
          pointer-events: none;
        }
        .vid-divider-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          text-align: center;
          padding: 0 24px;
        }
        .vid-divider-title {
          font: 400 clamp(32px, 5vw, 52px)/1.1 'Playfair Display', serif;
          font-style: italic;
          color: #fff;
          margin: 0 0 12px;
          text-shadow: 0 2px 24px rgba(0,0,0,0.6);
        }
        .vid-divider-sub {
          font: 300 clamp(14px, 2vw, 18px)/1.6 'Plus Jakarta Sans', sans-serif;
          color: rgba(255,255,255,0.7);
          margin: 0;
          text-shadow: 0 1px 12px rgba(0,0,0,0.5);
          letter-spacing: 0.02em;
        }

        @media (max-width: 768px) {
          .vid-divider { height: 250px; }
          .vid-divider-overlay-top,
          .vid-divider-overlay-bottom { height: 80px; }
          .vid-divider-clip { inset: -40px 0; }
          .vid-divider-video { height: calc(100% + 80px); }
        }

        @media (max-width: 480px) {
          .vid-divider { height: 200px; }
          .vid-divider-overlay-top,
          .vid-divider-overlay-bottom { height: 60px; }
        }
      `}</style>
    </div>
  );
}
