import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stars from '../components/Stars';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';

const MARQUEE_ITEMS = ['Astronomy Apparel', 'Space Gifts', 'Kids Collection', 'Observatory Merch', 'Dark Sky Membership', 'Stargazing Accessories', 'Limited Editions', 'Night Sky Prints'];

function useReveal(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('vis'); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

function RevealSection({ children, className = '' }) {
  const ref = useRef(null);
  useReveal(ref);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

export default function Home({ onAddToCart }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [heroVis, setHeroVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Featured: first 8 products, prioritizing ones with good images
  const featured = PRODUCTS.filter(p => p.images.length > 0).slice(0, 8);
  const newArrivals = PRODUCTS.slice(-4);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-stars">
          <Stars count={260} className="stars-canvas" />
        </div>
        <div className="hero-vid">
          <video
            ref={videoRef}
            autoPlay muted loop playsInline
            poster=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
          >
            <source src="/videos/hero1.mp4" type="video/mp4" />
            <source src="/videos/hero1.webm" type="video/webm" />
          </video>
        </div>

        <div className={`hero-content ${heroVis ? 'hero-vis' : ''}`} style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(30px)', transition: 'opacity 1s, transform 1s cubic-bezier(.16,1,.3,1)', transitionDelay: '0.2s' }}>
          <div className="label hero-label" style={{ transitionDelay: '0.1s' }}>
            // International Dark Sky Discovery Center
          </div>
          <h1 className="hero-h1" style={{ transitionDelay: '0.3s' }}>
            The Night<br/><em>Sky, Yours.</em>
          </h1>
          <p className="hero-sub" style={{ transitionDelay: '0.45s' }}>
            Astronomy apparel, gifts, and collectibles from the Sonoran Desert's premier dark sky sanctuary. Every purchase preserves what we hold sacred.
          </p>
          <div className="hero-actions" style={{ transitionDelay: '0.6s' }}>
            <button className="btn-primary" onClick={() => navigate('/shop')}>Explore the Collection</button>
            <button className="btn-ghost" onClick={() => navigate('/membership')}>Become a Member</button>
          </div>
        </div>

        <div className="hero-scroll">
          <div className="hero-scroll-line" />
          Scroll to Discover
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">
              {item} <span className="marquee-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED COLLECTION ── */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">01 — Collection</div>
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
          <button className="btn-ghost" onClick={() => navigate('/shop')}>View All 67 Products</button>
        </div>
      </section>

      {/* ── MISSION BAND ── */}
      <div className="mission">
        <blockquote className="mission-quote">
          "Spend time under the stars.<br/><em>Take the night sky home.</em>"
        </blockquote>
        <div className="mission-attr">// International Dark Sky Discovery Center, Sonoran Desert</div>
      </div>

      {/* ── NEW ARRIVALS ── */}
      <section className="section" style={{ background: 'var(--bg2)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">02 — New Arrivals</div>
          <h2 className="section-title">Just <em>Landed</em></h2>
        </RevealSection>
        <div className="grid grid-4">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} delay={i * 80} badge="New" />
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">03 — Shop by Category</div>
          <h2 className="section-title">Find Your <em>Constellation</em></h2>
        </RevealSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {['Apparel', 'Kids', 'Gifts', 'Outerwear', 'Tanks'].map((cat, i) => {
            const catProducts = PRODUCTS.filter(p => p.category === cat && p.images[0]);
            const heroImg = catProducts[0]?.images[0];
            const count = catProducts.length + PRODUCTS.filter(p => p.category === cat && !p.images[0]).length;
            return (
              <button
                key={cat}
                onClick={() => navigate(`/shop?cat=${cat}`)}
                style={{
                  background: '#0e0e24',
                  border: '1px solid #1e1e42',
                  borderRadius: 6,
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color .25s, transform .25s, box-shadow .25s',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,169,74,0.3)';
                  e.currentTarget.querySelector('.cat-img-wrap').style.background = '#e8e4dc';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e1e42';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.querySelector('.cat-img-wrap').style.background = '#dedad2';
                }}
              >
                {/* Image zone — warm white background so products pop */}
                <div
                  className="cat-img-wrap"
                  style={{
                    background: '#dedad2',
                    height: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    transition: 'background .25s',
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
                    <span style={{ fontSize: 48, opacity: 0.3 }}>✦</span>
                  )}
                </div>

                {/* Text zone — dark */}
                <div style={{ padding: '20px 20px 22px', flex: 1 }}>
                  <div className="label" style={{ marginBottom: 10, fontSize: 9 }}>{`0${i+1} — ${cat.toUpperCase()}`}</div>
                  <div style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 26,
                    fontWeight: 500,
                    color: 'var(--text)',
                    marginBottom: 10,
                    lineHeight: 1.1,
                  }}>{cat}</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      font: '500 13px DM Sans',
                      color: 'rgba(240,237,230,0.7)',
                    }}>{count} products</span>
                    <span style={{
                      font: '500 11px JetBrains Mono',
                      letterSpacing: '0.1em',
                      color: 'var(--gold)',
                    }}>Shop →</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── MEMBERSHIP TEASER ── */}
      <section className="section" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(201,169,74,0.08) 0%, transparent 60%), var(--bg2)', textAlign: 'center' }}>
        <RevealSection>
          <div className="label section-label" style={{ marginBottom: 24 }}>04 — Membership</div>
          <h2 className="section-title" style={{ marginBottom: 20 }}>Join the <em>Observatory</em></h2>
          <p style={{ font: '300 16px/1.8 DM Sans, sans-serif', color: 'var(--muted)', maxWidth: 480, margin: '0 auto 36px' }}>
            Members enjoy exclusive discounts, early access to limited releases, and invitations to private stargazing events under the Sonoran sky.
          </p>
          <button className="btn-primary" onClick={() => navigate('/membership')}>Explore Membership Tiers</button>
        </RevealSection>
      </section>
    </div>
  );
}
