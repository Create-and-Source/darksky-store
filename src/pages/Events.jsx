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

const CATEGORIES = ['All', 'Stargazing', 'Workshops', 'Kids & Family', 'Special Events'];

const EVENTS = [
  { day: '22', month: 'MAR', cat: 'Stargazing', title: 'Full Moon Observatory Night', desc: 'Guided telescope viewing of the March full moon and spring constellations with our resident astronomers.', meta: '8:00 PM · Observatory Deck' },
  { day: '29', month: 'MAR', cat: 'Kids & Family', title: 'Junior Astronomer Saturday', desc: 'Hands-on activities for ages 5-12. Build a constellation viewer and learn to navigate by the stars.', meta: '10:00 AM · Education Wing' },
  { day: '05', month: 'APR', cat: 'Workshops', title: 'Astrophotography Basics', desc: 'Capture the Milky Way with your camera. All skill levels welcome. Tripods and star trackers provided.', meta: '7:30 PM · Education Center' },
  { day: '12', month: 'APR', cat: 'Stargazing', title: 'Messier Marathon', desc: 'Attempt to observe all 110 Messier objects in a single night. Hot cocoa and blankets provided.', meta: '7:00 PM · Telescope Park' },
  { day: '18', month: 'APR', cat: 'Special Events', title: 'Dark Sky Gala 2026', desc: 'Annual fundraiser under the stars. Dinner, drinks, and a private planetarium show.', meta: '6:00 PM · Main Pavilion' },
  { day: '26', month: 'APR', cat: 'Workshops', title: 'Telescope Building Workshop', desc: 'Build your own 6-inch Dobsonian telescope from scratch. Take it home and start observing.', meta: '9:00 AM · Workshop Bay' },
];

export default function Events() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? EVENTS
    : EVENTS.filter(e => e.cat === activeCategory);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="events-hero">
        <RevealSection>
          <div className="section-header">
            <span className="section-label label">// Events &amp; Programs</span>
            <h1 className="section-title">Experience the <em>Night Sky</em></h1>
            <p className="section-subtitle">
              From guided telescope sessions to exclusive galas, every event at the Discovery Center is designed to inspire wonder.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ── CATEGORY FILTERS ── */}
      <RevealSection>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          flexWrap: 'wrap',
          padding: '0 64px 48px',
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '10px 24px',
                borderRadius: 100,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 12,
                border: `1px solid ${activeCategory === cat ? 'var(--gold)' : 'var(--border)'}`,
                background: activeCategory === cat ? 'var(--gold)' : 'transparent',
                color: activeCategory === cat ? 'var(--bg)' : 'var(--text2)',
                cursor: 'pointer',
                transition: 'all 0.3s var(--ease)',
                letterSpacing: '0.02em',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </RevealSection>

      {/* ── EVENTS GRID ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        {filtered.length === 0 ? (
          <RevealSection>
            <div style={{
              textAlign: 'center',
              padding: '80px 0',
              color: 'var(--text2)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
            }}>
              No events found in this category. Check back soon.
            </div>
          </RevealSection>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}>
            {filtered.map((event, i) => (
              <RevealSection key={event.title} delay={i * 80}>
                <div className="event-card">
                  <div className="event-card-img" style={{
                    background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 32, color: 'var(--gold)', opacity: 0.3 }}>✦</span>
                    <div className="event-card-date">
                      <div className="event-card-date-day">{event.day}</div>
                      <div className="event-card-date-month">{event.month}</div>
                    </div>
                  </div>
                  <div className="event-card-body">
                    <span className="event-card-category">{event.cat}</span>
                    <h3 className="event-card-title">{event.title}</h3>
                    <p className="event-card-desc">{event.desc}</p>
                    <span className="event-card-meta">{event.meta}</span>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <RevealSection>
        <div className="mission">
          <blockquote className="mission-quote">
            "The universe is under no obligation to make sense to you. <em>We make it accessible.</em>"
          </blockquote>
          <span className="mission-attr">// Dark Sky Discovery Center</span>
          <div style={{ display: 'flex', gap: 16, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/membership')}>Become a Member</button>
            <button className="btn-ghost" onClick={() => navigate('/shop')}>Visit the Shop</button>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
