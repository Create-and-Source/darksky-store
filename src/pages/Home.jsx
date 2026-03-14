import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stars from '../components/Stars';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import { getEvents } from '../admin/data/store';

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

const VENUES = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
    title: 'Dark Sky Observatory',
    desc: 'Home to the largest public telescope in Greater Phoenix. See Saturn\'s rings, Jupiter\'s moons, and deep-sky objects with your own eyes.',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
        <circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    title: 'Hyperspace Planetarium',
    desc: 'A 65-seat immersive dome theater with 8K projection. Daily shows transport you across the universe without leaving your seat.',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: 'Inspiration Theater',
    desc: 'A 150-seat venue for lectures, film screenings, and live events featuring leading astronomers, scientists, and storytellers.',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: 'Night Sky Experience',
    desc: '3,300 sq ft of interactive exhibits on light pollution, nocturnal ecosystems, Indigenous sky knowledge, and the story of our universe.',
  },
];

const COMMUNITY_STATS = [
  { value: '17th', label: 'Dark Sky Community in the World' },
  { value: '600+', label: 'Astronomy Club Members' },
  { value: 'Smithsonian', label: 'Featured in "Lights Out" Exhibit' },
  { value: '5M', label: 'People Within 30 Minutes' },
];

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return { day: days[d.getDay()], month: months[d.getMonth()], date: d.getDate() };
}

export default function Home({ onAddToCart }) {
  const navigate = useNavigate();
  const [heroVis, setHeroVis] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 100);
    return () => clearTimeout(t);
  }, []);

  const featured = PRODUCTS.filter(p => p.images.length > 0).slice(0, 8);
  const events = getEvents()
    .filter(e => e.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* ═══ 1. HERO ═══ */}
      <section className="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="hero-stars">
          <Stars count={260} className="stars-canvas" />
        </div>
        <div className={`hero-content ${heroVis ? 'hero-vis' : ''}`} style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(30px)', transition: 'opacity 1s, transform 1s cubic-bezier(.16,1,.3,1)', transitionDelay: '0.2s' }}>
          <div className="label hero-label" style={{ transitionDelay: '0.1s' }}>// International Dark Sky Discovery Center</div>
          <h1 className="hero-h1" style={{ transitionDelay: '0.3s', maxWidth: 800, margin: '0 auto 24px' }}>
            The World's Center for Connecting the Night Sky to <em>Life on Earth</em>
          </h1>
          <p className="hero-sub" style={{ transitionDelay: '0.45s', maxWidth: 520 }}>
            Opening Fall 2026 in Fountain Hills, Arizona.
          </p>
          <div className="hero-actions" style={{ transitionDelay: '0.6s' }}>
            <button className="btn-primary" onClick={() => navigate('/events')}>Explore Events</button>
            <button className="btn-ghost" onClick={() => navigate('/membership')}>Become a Member</button>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="hero-scroll-line" />
          Scroll to Discover
        </div>
      </section>

      {/* ═══ 2. WHAT'S COMING ═══ */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">01 -- What's Coming</div>
          <h2 className="section-title">Four Destinations, One <em>Mission</em></h2>
        </RevealSection>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
        }} className="home-venues-grid">
          {VENUES.map(v => (
            <div key={v.title} className="home-venue-card" style={{
              padding: '44px 32px',
              borderRight: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              transition: 'background 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,74,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ marginBottom: 24 }}>{v.icon}</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 400, marginBottom: 12, color: 'var(--text)' }}>{v.title}</h3>
              <p style={{ font: '300 14px/1.75 DM Sans', color: 'var(--muted)' }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 3. UPCOMING EVENTS ═══ */}
      <section className="section" style={{ background: 'var(--bg2)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">02 -- Events</div>
          <h2 className="section-title">Experience the <em>Night Sky</em></h2>
        </RevealSection>
        {events.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 960, margin: '0 auto' }} className="home-events-grid">
            {events.map(ev => {
              const d = formatEventDate(ev.date);
              return (
                <div key={ev.id} onClick={() => navigate('/events')} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r, 3px)', padding: '28px 24px', cursor: 'pointer',
                  transition: 'border-color 0.3s, background 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,74,0.3)'; e.currentTarget.style.background = 'rgba(201,169,74,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ textAlign: 'center', minWidth: 48 }}>
                      <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 2 }}>{d.month}</div>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text)', lineHeight: 1 }}>{d.date}</div>
                      <div style={{ font: '400 10px DM Sans', color: 'var(--muted)', marginTop: 2 }}>{d.day}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>{ev.category}</div>
                      <div style={{ font: '400 16px/1.4 Playfair Display, serif', color: 'var(--text)', marginBottom: 8 }}>{ev.title}</div>
                      {ev.time && <div style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>{ev.time}{ev.location ? ` · ${ev.location}` : ''}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', font: '300 15px DM Sans', color: 'var(--muted)' }}>Events coming soon — check back for our opening schedule.</p>
        )}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button className="btn-ghost" onClick={() => navigate('/events')}>View All Events</button>
        </div>
      </section>

      {/* ═══ 4. MEMBERSHIP CTA ═══ */}
      <section className="section" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%), var(--bg)', textAlign: 'center' }}>
        <RevealSection>
          <div className="label section-label" style={{ marginBottom: 24 }}>03 -- Membership</div>
          <h2 className="section-title" style={{ marginBottom: 20 }}>Join the <em>Movement</em></h2>
          <p style={{ font: '300 16px/1.8 DM Sans, sans-serif', color: 'var(--muted)', maxWidth: 520, margin: '0 auto 16px' }}>
            Members get free star parties, gift shop discounts, and exclusive access to the observatory. Three tiers designed for every level of stargazer.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            {[
              ['Stargazer', '$18/yr', '10% shop discount'],
              ['Explorer', '$45/yr', 'Free planetarium + events'],
              ['Guardian', '$120/yr', 'Private observatory sessions'],
            ].map(([name, price, perk]) => (
              <div key={name} style={{
                padding: '20px 24px', minWidth: 160, textAlign: 'center',
                background: name === 'Explorer' ? 'rgba(201,169,74,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${name === 'Explorer' ? 'rgba(201,169,74,0.25)' : 'var(--border)'}`,
                borderRadius: 'var(--r, 3px)',
              }}>
                <div style={{ font: '500 14px DM Sans', color: name === 'Explorer' ? 'var(--gold)' : 'var(--text)', marginBottom: 4 }}>{name}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: name === 'Explorer' ? 'var(--gold)' : 'var(--text)', fontStyle: 'italic', marginBottom: 6 }}>{price}</div>
                <div style={{ font: '300 12px DM Sans', color: 'var(--muted)' }}>{perk}</div>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => navigate('/membership')}>Become a Member</button>
        </RevealSection>
      </section>

      {/* ═══ 5. FROM THE GIFT SHOP ═══ */}
      <section className="section" style={{ background: 'var(--bg2)' }}>
        <RevealSection className="section-header">
          <div className="label section-label">04 -- Gift Shop</div>
          <h2 className="section-title">Take the Night <em>Home</em></h2>
          <p style={{ font: '300 15px/1.7 DM Sans', color: 'var(--muted)', maxWidth: 480, margin: '12px auto 0' }}>
            Every purchase supports dark sky preservation and STEM education.
          </p>
        </RevealSection>
        <div style={{ position: 'relative' }}>
          <div
            ref={carouselRef}
            className="home-product-carousel"
            style={{
              display: 'flex', gap: 20, overflowX: 'auto', scrollSnapType: 'x mandatory',
              paddingBottom: 16, scrollbarWidth: 'none',
            }}
          >
            {featured.map((p, i) => (
              <div key={p.id} style={{ flex: '0 0 260px', scrollSnapAlign: 'start' }}>
                <ProductCard
                  product={p}
                  onAddToCart={onAddToCart}
                  delay={Math.min(i * 60, 300)}
                  badge={i === 0 ? 'Bestseller' : i === 2 ? 'Staff Pick' : null}
                />
              </div>
            ))}
          </div>
          <button onClick={() => scrollCarousel(-1)} className="carousel-arrow carousel-arrow-left" aria-label="Scroll left" style={{
            position: 'absolute', left: -20, top: '40%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(4,4,12,0.8)', border: '1px solid var(--border)',
            color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, backdropFilter: 'blur(8px)', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >&#8592;</button>
          <button onClick={() => scrollCarousel(1)} className="carousel-arrow carousel-arrow-right" aria-label="Scroll right" style={{
            position: 'absolute', right: -20, top: '40%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(4,4,12,0.8)', border: '1px solid var(--border)',
            color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, backdropFilter: 'blur(8px)', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >&#8594;</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button className="btn-ghost" onClick={() => navigate('/shop')}>Shop All Products</button>
        </div>
      </section>

      {/* ═══ 6. COMMUNITY ═══ */}
      <div className="mission" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="label" style={{ marginBottom: 24 }}>05 -- Community</div>
        <blockquote className="mission-quote">
          "My hope is that the IDSDC will be an Arizona icon known around the world as a place that enables sky watchers of all ages to learn more about the <em>observable universe.</em>"
        </blockquote>
        <div className="mission-attr">// Joe Bill, Board President</div>
        <div style={{
          display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap',
          marginTop: 56, paddingTop: 48, borderTop: '1px solid var(--border)',
        }} className="home-community-stats">
          {COMMUNITY_STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center', maxWidth: 180 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--gold)', fontStyle: 'italic', marginBottom: 6, lineHeight: 1 }}>{s.value}</div>
              <div style={{ font: '400 11px/1.5 DM Sans', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 7. NEWSLETTER ═══ */}
      <div className="newsletter-section">
        <RevealSection>
          <h3 className="newsletter-title">Stay Under the <em>Stars</em></h3>
          <p className="newsletter-sub">Events, discoveries, and dark sky updates — straight to your inbox. No spam, just starlight.</p>
          <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
            <input type="email" className="newsletter-input" placeholder="Your email address" />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </RevealSection>
      </div>

      {/* Carousel hide scrollbar */}
      <style>{`
        .home-product-carousel::-webkit-scrollbar { display: none; }
        @media (max-width: 1024px) {
          .home-venues-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .home-events-grid { grid-template-columns: 1fr !important; max-width: 560px !important; }
          .home-community-stats { gap: 32px !important; }
        }
        @media (max-width: 600px) {
          .home-venues-grid { grid-template-columns: 1fr !important; }
          .home-venue-card { padding: 32px 24px !important; }
          .carousel-arrow { display: none !important; }
          .home-community-stats { gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}
