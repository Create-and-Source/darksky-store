import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';

/* ── Reveal-on-scroll wrapper ── */
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
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Section separator ── */
function SectionSep() {
  return <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)' }} />;
}

/* ── Marquee items ── */
const MARQUEE_ITEMS = [
  'Observatory', 'Planetarium', 'Dark Sky Preserve', 'Telescope Park',
  'Science Education', 'Gift Shop', 'Stargazing Events', 'Membership',
];

/* ── Events data ── */
const EVENTS = [
  { day: '22', month: 'MAR', cat: 'Stargazing', title: 'Full Moon Observatory Night', desc: 'Guided telescope viewing of the March full moon and spring constellations.', meta: '8:00 PM · Observatory Deck' },
  { day: '05', month: 'APR', cat: 'Workshop', title: 'Astrophotography Basics', desc: 'Learn to capture the Milky Way with your camera. Tripods provided.', meta: '7:30 PM · Education Center' },
  { day: '18', month: 'APR', cat: 'Special Event', title: 'Dark Sky Gala 2026', desc: 'Annual fundraiser under the stars. Dinner, drinks, and a private planetarium show.', meta: '6:00 PM · Main Pavilion' },
];

/* ── Stats data ── */
const STATS = [
  { value: '35,000+', label: 'Square Feet' },
  { value: '200+', label: 'Programs per Year' },
  { value: '5', label: 'Research Telescopes' },
  { value: '1', label: 'Mission' },
];

/* ── Category data ── */
const CATEGORIES = ['Apparel', 'Kids', 'Gifts', 'Outerwear', 'Tanks'];

/* ── Hero headline word-by-word animation ── */
function AnimatedHeadline({ visible }) {
  const line1 = ["The", "World's", "Center", "for", "Connecting"];
  const line2 = ["the", "Night", "Sky", "to"];
  const emWords = ["Life", "on", "Earth"];

  let wordIndex = 0;

  const renderWord = (word, isEm = false) => {
    const i = wordIndex++;
    const style = {
      display: 'inline-block',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(20px)',
      transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
      transitionDelay: `${300 + i * 120}ms`,
      marginRight: '0.25em',
    };
    if (isEm) {
      return <em key={i} style={{ ...style, fontStyle: 'italic', color: 'var(--gold)' }}>{word}</em>;
    }
    return <span key={i} style={style}>{word}</span>;
  };

  return (
    <h1 className="hero-h1">
      {line1.map(w => renderWord(w))}
      <br />
      {line2.map(w => renderWord(w))}
      {emWords.map(w => renderWord(w, true))}
    </h1>
  );
}

/* ── Gold gradient text style ── */
const goldGradientStyle = {
  background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

/* ────────────────────────────────────────── */
export default function Home({ onAddToCart }) {
  const navigate = useNavigate();
  const [heroVis, setHeroVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 100);
    return () => clearTimeout(t);
  }, []);

  const featured = PRODUCTS.filter(p => p.images.length > 0).slice(0, 8);

  return (
    <div>

      {/* ══════════════════════════════════════
          1 — HERO
      ══════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-gradient" />

        <div className="hero-content">
          <div
            className="label hero-label"
            style={{
              opacity: heroVis ? 1 : 0,
              transform: heroVis ? 'none' : 'translateY(16px)',
              transition: 'opacity 0.9s var(--ease), transform 0.9s var(--ease)',
              transitionDelay: '0.15s',
            }}
          >
            // OPENING FALL 2026 · FOUNTAIN HILLS, ARIZONA
          </div>

          <AnimatedHeadline visible={heroVis} />

          <p
            className="hero-sub"
            style={{
              opacity: heroVis ? 1 : 0,
              transform: heroVis ? 'none' : 'translateY(16px)',
              transition: 'opacity 1s var(--ease), transform 1s var(--ease)',
              transitionDelay: '1.8s',
              letterSpacing: '0.18em',
            }}
          >
            Observatory. Planetarium. Exhibits. Experiences.
          </p>

          <div
            className="hero-actions"
            style={{
              opacity: heroVis ? 1 : 0,
              transform: heroVis ? 'none' : 'translateY(16px)',
              transition: 'opacity 1s var(--ease), transform 1s var(--ease)',
              transitionDelay: '2.1s',
            }}
          >
            <button className="btn-primary" style={{ animation: 'breatheGlow 3s ease-in-out infinite' }} onClick={() => navigate('/events')}>Explore Events</button>
            <button className="btn-ghost" onClick={() => navigate('/membership')}>Become a Member</button>
          </div>
        </div>

        <div className="hero-scroll">
          <span className="hero-scroll-text">Scroll to Discover</span>
          <span className="hero-scroll-line" />
        </div>
      </section>

      <SectionSep />

      {/* ══════════════════════════════════════
          2 — MARQUEE
      ══════════════════════════════════════ */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">
              {item} <span className="marquee-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      <SectionSep />

      {/* ══════════════════════════════════════
          3 — DISCOVER THE CENTER
      ══════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">01 — Discover</div>
          <h2 className="section-title">A Sanctuary for the <em>Night Sky</em></h2>
        </RevealSection>

        <RevealSection delay={120}>
          <div className="home-stats-grid">
            {STATS.map((s, i) => (
              <RevealSection key={i} delay={200 + i * 100}>
                <div
                  style={{
                    padding: '48px 32px',
                    textAlign: 'center',
                    borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{
                    font: '300 44px "Plus Jakarta Sans", sans-serif',
                    lineHeight: 1,
                    marginBottom: 12,
                    ...goldGradientStyle,
                  }}>
                    {s.value}
                  </div>
                  <div style={{ font: '400 11px "JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text2)' }}>
                    {s.label}
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      <SectionSep />

      {/* ══════════════════════════════════════
          4 — FEATURED PRODUCTS
      ══════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">02 — Collection</div>
          <h2 className="section-title">Curated for the <em>Curious</em></h2>
        </RevealSection>

        <div className="grid">
          {featured.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              delay={Math.min(i * 60, 300)}
              badge={i === 0 ? 'Bestseller' : i === 3 ? 'Staff Pick' : null}
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button className="btn-ghost" onClick={() => navigate('/shop')}>View All Products</button>
        </div>
      </section>

      <SectionSep />

      {/* ══════════════════════════════════════
          5 — UPCOMING EVENTS
      ══════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">03 — Events</div>
          <h2 className="section-title">Under the <em>Stars</em></h2>
        </RevealSection>

        <RevealSection delay={80}>
          <div className="home-events-grid">
            {EVENTS.map((ev, i) => (
              <RevealSection key={i} delay={i * 120}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--r)',
                    overflow: 'hidden',
                    transition: 'all 0.4s var(--ease)',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 16px 48px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)';
                  }}
                >
                  {/* Gradient placeholder */}
                  <div
                    style={{
                      aspectRatio: '16/10',
                      background: 'linear-gradient(135deg, #0c0c2a 0%, #1a1040 50%, #0e0e28 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: 28, color: 'var(--gold)', opacity: 0.4 }}>✦</span>

                    {/* Date badge — gold gradient, sharp edges */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
                        color: '#04040c',
                        padding: '10px 12px 8px',
                        textAlign: 'center',
                        lineHeight: 1,
                      }}
                    >
                      <div style={{ font: '700 22px "Plus Jakarta Sans", sans-serif', marginBottom: 2 }}>{ev.day}</div>
                      <div style={{ font: '600 10px "JetBrains Mono", monospace', letterSpacing: '0.08em' }}>{ev.month}</div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '28px 24px' }}>
                    <div style={{ font: '400 10px "JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 12 }}>
                      {ev.cat}
                    </div>
                    <h3 style={{ font: '500 20px/1.3 "Playfair Display", serif', color: 'var(--text)', margin: '0 0 10px' }}>
                      {ev.title}
                    </h3>
                    <p style={{ font: '300 13px/1.7 "Plus Jakarta Sans", sans-serif', color: 'var(--text2)', margin: '0 0 16px' }}>
                      {ev.desc}
                    </p>
                    <div style={{ font: '400 11px "JetBrains Mono", monospace', color: 'var(--muted)', letterSpacing: '0.04em' }}>
                      {ev.meta}
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button className="btn-ghost" onClick={() => navigate('/events')}>View All Events</button>
        </div>
      </section>

      <SectionSep />

      {/* ══════════════════════════════════════
          6 — MISSION QUOTE BAND
      ══════════════════════════════════════ */}
      <div className="mission">
        <blockquote className="mission-quote">
          "Spend time under the stars.<br /><em>Take the night sky home.</em>"
        </blockquote>
        <div className="mission-attr">// International Dark Sky Discovery Center, Sonoran Desert</div>
      </div>

      <SectionSep />

      {/* ══════════════════════════════════════
          7 — SHOP BY CATEGORY
      ══════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">04 — Shop</div>
          <h2 className="section-title">Find Your <em>Constellation</em></h2>
        </RevealSection>

        <RevealSection delay={100}>
          <div className="home-cats-grid">
            {CATEGORIES.map((cat, i) => {
              const catProducts = PRODUCTS.filter(p => p.category === cat && p.images[0]);
              const heroImg = catProducts[0]?.images[0];
              const count = PRODUCTS.filter(p => p.category === cat).length;

              return (
                <RevealSection key={cat} delay={i * 100}>
                  <button
                    onClick={() => navigate(`/shop?cat=${cat}`)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 6,
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.4s var(--ease)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                      width: '100%',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)';
                    }}
                  >
                    {/* Image zone */}
                    <div
                      style={{
                        background: '#dedad2',
                        height: 180,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        transition: 'background 0.3s var(--ease)',
                      }}
                    >
                      {heroImg ? (
                        <img
                          src={heroImg}
                          alt={cat}
                          style={{
                            width: '85%',
                            height: '85%',
                            objectFit: 'contain',
                            display: 'block',
                            filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.25))',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 48, opacity: 0.3, color: 'var(--muted)' }}>✦</span>
                      )}
                    </div>

                    {/* Text zone */}
                    <div style={{ padding: '20px 20px 22px', flex: 1 }}>
                      <div className="label" style={{ marginBottom: 10, fontSize: 9 }}>
                        {`0${i + 1} — ${cat.toUpperCase()}`}
                      </div>
                      <div style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: 26,
                        fontWeight: 500,
                        color: 'var(--text)',
                        marginBottom: 10,
                        lineHeight: 1.1,
                      }}>
                        {cat}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <span style={{ font: '300 13px "Plus Jakarta Sans", sans-serif', color: 'var(--text2)' }}>
                          {count} products
                        </span>
                        <span style={{ font: '500 11px "JetBrains Mono", monospace', letterSpacing: '0.1em', color: 'var(--gold)' }}>
                          Shop →
                        </span>
                      </div>
                    </div>
                  </button>
                </RevealSection>
              );
            })}
          </div>
        </RevealSection>
      </section>

      <SectionSep />

      {/* ══════════════════════════════════════
          8 — MEMBERSHIP TEASER
      ══════════════════════════════════════ */}
      <section
        className="section"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%), var(--bg)',
          textAlign: 'center',
        }}
      >
        <RevealSection>
          <div className="label section-label" style={{ marginBottom: 24 }}>05 — Membership</div>
          <h2 className="section-title" style={{ marginBottom: 20 }}>Join the <em>Observatory</em></h2>
          <p className="section-subtitle" style={{
            font: '300 16px/1.8 "Plus Jakarta Sans", sans-serif',
            color: 'var(--text2)',
            maxWidth: 520,
            margin: '0 auto 40px',
          }}>
            Members enjoy exclusive discounts, early access to limited releases,
            and invitations to private stargazing events under the Sonoran sky.
          </p>
          <button
            className="btn-primary"
            style={{ animation: 'breatheGlow 3s ease-in-out infinite' }}
            onClick={() => navigate('/membership')}
          >
            Explore Membership Tiers
          </button>
        </RevealSection>
      </section>

    </div>
  );
}
