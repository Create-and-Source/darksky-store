import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, addReservation } from '../admin/data/store';

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

// Map admin event categories to storefront filter categories
const CAT_MAP = {
  'Star Party': 'Stargazing',
  'Special Event': 'Special Events',
  'Kids Program': 'Kids & Family',
  'Workshop': 'Workshops',
  'Planetarium Show': 'Special Events',
};

const CATEGORIES = ['All', 'Stargazing', 'Workshops', 'Kids & Family', 'Special Events'];

function mapAdminEvent(e) {
  const d = new Date(e.date + 'T00:00:00');
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const spotsLeft = e.capacity ? Math.max(0, Math.round(((e.capacity - (e.ticketsSold || 0)) / e.capacity) * 100)) : null;
  return {
    id: e.id,
    day: String(d.getDate()).padStart(2, '0'),
    month: months[d.getMonth()],
    cat: CAT_MAP[e.category] || e.category,
    title: e.title,
    desc: e.description,
    meta: `${e.time ? formatTime(e.time) : ''} · ${e.location || ''}`.replace(/^ · /, ''),
    spots: spotsLeft,
    almostFull: spotsLeft !== null && spotsLeft <= 20,
    capacity: e.capacity,
    ticketsSold: e.ticketsSold || 0,
  };
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function Events() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [reserveEvent, setReserveEvent] = useState(null);
  const [resForm, setResForm] = useState({ name: '', email: '', qty: 1 });
  const [resSuccess, setResSuccess] = useState(false);
  const [, setTick] = useState(0);

  const handleReserve = () => {
    if (!resForm.name.trim() || !resForm.email.trim()) return;
    addReservation({
      eventId: reserveEvent.id,
      eventTitle: reserveEvent.title,
      name: resForm.name.trim(),
      email: resForm.email.trim(),
      qty: resForm.qty,
    });
    setResSuccess(true);
    setTick(t => t + 1); // re-render to update spots
    setTimeout(() => {
      setReserveEvent(null);
      setResSuccess(false);
      setResForm({ name: '', email: '', qty: 1 });
    }, 2000);
  };

  const adminEvents = getEvents().filter(e => e.status === 'Published');
  const EVENTS = adminEvents.map(mapAdminEvent);

  const filtered = activeCategory === 'All'
    ? EVENTS
    : EVENTS.filter(e => e.cat === activeCategory);

  return (
    <div data-page="events">
      {/* ── HERO ── */}
      <section className="events-hero" data-section="Hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="/images/darksky/meteor-shower.jpg"
          alt="Meteor shower streaking across a dark desert sky"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }}
        />
        <RevealSection>
          <div className="section-header" style={{ position: 'relative', zIndex: 1 }}>
            <span className="section-label label" data-editable="events-hero-label">// Events &amp; Programs</span>
            <h1 className="section-title" data-editable="events-hero-title">Experience the <em>Night Sky</em></h1>
            <p className="section-subtitle" data-editable="events-hero-subtitle" style={{ lineHeight: 1.7 }}>
              From guided telescope sessions to exclusive galas, every event at the Discovery Center is designed to inspire wonder.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ── CATEGORY FILTERS ── */}
      <RevealSection>
        <div className="events-filters" style={{
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
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'all 0.3s var(--ease)',
                ...(activeCategory === cat ? {
                  background: 'linear-gradient(135deg, #D4AF37, #F5E6A3, #D4AF37)',
                  backgroundSize: '200% 200%',
                  border: '1px solid transparent',
                  color: '#04040c',
                } : {
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--text2)',
                }),
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </RevealSection>

      {/* ── EVENTS GRID ── */}
      <section className="section" data-section="EventsGrid" style={{ paddingTop: 0 }}>
        {filtered.length === 0 ? (
          <RevealSection>
            <div style={{
              textAlign: 'center',
              padding: '80px 0',
              color: 'var(--text2)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 15,
            }}>
              No events found in this category. Check back soon.
            </div>
          </RevealSection>
        ) : (
          <div className="events-grid" style={{
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
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={['/images/darksky/milky-way.jpg', '/images/darksky/andromeda.jpg', '/images/darksky/nebula.jpg', '/images/darksky/comet-neowise.jpg', '/images/darksky/bubble-nebula.jpg', '/images/darksky/crescent-nebula.jpg'][i % 6]}
                      alt={`Night sky backdrop for ${event.title}`}
                      loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,12,0.4)', zIndex: 1 }} />
                    <span style={{ fontSize: 32, color: 'var(--gold)', opacity: 0.3, position: 'relative', zIndex: 2 }}>✦</span>
                    <div className="event-card-date" style={{ position: 'relative', zIndex: 2 }}>
                      <div className="event-card-date-day">{event.day}</div>
                      <div className="event-card-date-month">{event.month}</div>
                    </div>
                  </div>
                  <div className="event-card-body">
                    <span className="event-card-category">{event.cat}</span>
                    <h3 className="event-card-title">{event.title}</h3>
                    <p className="event-card-desc">{event.desc}</p>
                    <span className="event-card-meta">{event.meta}</span>

                    {/* Spots remaining progress bar */}
                    {event.spots !== null && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                            Spots Remaining
                          </span>
                          {event.almostFull && (
                            <span style={{
                              font: '500 10px "JetBrains Mono", monospace',
                              letterSpacing: '0.1em',
                              color: '#FF6B6B',
                              animation: 'almostFullPulse 2s ease-in-out infinite',
                            }}>
                              Almost Full
                            </span>
                          )}
                        </div>
                        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            width: `${event.spots}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #D4AF37, #F5E6A3)',
                            borderRadius: 2,
                            transition: 'width 1.2s var(--ease)',
                          }} />
                        </div>
                      </div>
                    )}

                    {event.spots !== null && event.spots > 0 && (
                      <button
                        className="btn-primary"
                        onClick={(e) => { e.stopPropagation(); setReserveEvent(event); setResForm({ name: '', email: '', qty: 1 }); setResSuccess(false); }}
                        style={{ marginTop: 16, width: '100%', padding: '12px 24px', fontSize: 11 }}
                      >
                        Reserve Spot
                      </button>
                    )}
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
          <blockquote className="mission-quote" data-editable="events-cta-quote">
            "The universe is under no obligation to make sense to you. <em>We make it accessible.</em>"
          </blockquote>
          <span className="mission-attr" data-editable="events-cta-attr">// Dark Sky Discovery Center</span>
          <div style={{ display: 'flex', gap: 16, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/membership')}>Become a Member</button>
            <button className="btn-ghost" onClick={() => navigate('/shop')}>Visit the Shop</button>
          </div>
        </div>
      </RevealSection>

      {/* Reservation Modal */}
      {reserveEvent && (
        <>
          <div onClick={() => { setReserveEvent(null); setResSuccess(false); }} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'var(--bg2, #0a0a1a)', border: '1px solid var(--border)',
            borderRadius: 'var(--r, 3px)', padding: 36, width: 400, maxWidth: '90vw', zIndex: 1001,
          }}>
            {resSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>
                  Reserved!
                </h3>
                <p style={{ font: '300 14px "Plus Jakarta Sans"', color: 'var(--text2)' }}>
                  Your spot for {reserveEvent.title} is confirmed.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, marginBottom: 4 }}>
                  Reserve a Spot
                </h3>
                <p style={{ font: '300 13px "Plus Jakarta Sans"', color: 'var(--text2)', marginBottom: 24 }}>
                  {reserveEvent.title} &middot; {reserveEvent.month} {reserveEvent.day}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Name</label>
                    <input
                      value={resForm.name} onChange={e => setResForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg3, #12122a)', border: '1px solid var(--border2, rgba(255,255,255,0.06))', borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Email</label>
                    <input
                      value={resForm.email} onChange={e => setResForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com" type="email"
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg3, #12122a)', border: '1px solid var(--border2, rgba(255,255,255,0.06))', borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Tickets</label>
                    <select
                      value={resForm.qty} onChange={e => setResForm(f => ({ ...f, qty: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '12px 14px', background: 'var(--bg3, #12122a)', border: '1px solid var(--border2, rgba(255,255,255,0.06))', borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button className="btn-ghost" onClick={() => { setReserveEvent(null); setResSuccess(false); }} style={{ flex: 1 }}>Cancel</button>
                    <button
                      className="btn-primary"
                      onClick={handleReserve}
                      disabled={!resForm.name.trim() || !resForm.email.trim()}
                      style={{ flex: 1, opacity: (!resForm.name.trim() || !resForm.email.trim()) ? 0.4 : 1 }}
                    >
                      Confirm Reservation
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
