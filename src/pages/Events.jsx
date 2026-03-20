import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, addReservation, getTicketTypes, addTicketOrder, lookupMemberByEmail, getMemberTicketPrice, getMembers } from '../admin/data/store';

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

function LazyVideo({ src, className = '', style = {}, ...props }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [srcActive, setSrcActive] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSrcActive(src); obs.disconnect(); } }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [src]);
  return <video ref={ref} className={className} style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease' }} src={srcActive} onLoadedData={() => setLoaded(true)} {...props} />;
}

function VideoDivider({ src, title, subtitle }) {
  return (
    <div className="vid-divider">
      <div className="vid-divider-clip"><LazyVideo src={src} className="vid-divider-video" autoPlay muted loop playsInline /></div>
      <div className="vid-divider-overlay-top" /><div className="vid-divider-overlay-bottom" />
      <div className="vid-divider-content"><div className="vid-divider-box"><h2 className="vid-divider-title">{title}</h2><p className="vid-divider-sub">{subtitle}</p></div></div>
    </div>
  );
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
  const [resForm, setResForm] = useState(() => {
    // Pre-fill from logged-in member/user
    try {
      const auth = JSON.parse(localStorage.getItem('ds_auth_user') || '{}');
      const members = JSON.parse(localStorage.getItem('ds_members') || '[]');
      const member = members.find(m => m.status === 'Active');
      if (auth.role === 'member' && member) {
        return { name: member.name || '', email: member.email || '', qty: 1 };
      }
    } catch {}
    return { name: '', email: '', qty: 1 };
  });
  const [resTickets, setResTickets] = useState({}); // { ticketTypeId: qty }
  const [memberLookup, setMemberLookup] = useState({ email: '', member: null, checked: false, loading: false });
  const [resSuccess, setResSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [, setTick] = useState(0);

  const handleMemberLookup = () => {
    if (!memberLookup.email.trim()) return;
    setMemberLookup(prev => ({ ...prev, loading: true }));
    const found = lookupMemberByEmail(memberLookup.email.trim());
    setMemberLookup(prev => ({ ...prev, member: found, checked: true, loading: false }));
    if (found) {
      setResForm(f => ({ ...f, name: found.name || f.name, email: found.email || f.email }));
    }
  };

  const getTicketTotal = (eventId) => {
    const types = getTicketTypes(eventId).filter(t => t.active);
    let subtotal = 0;
    Object.entries(resTickets).forEach(([typeId, qty]) => {
      if (qty <= 0) return;
      const tt = types.find(t => t.id === typeId);
      if (!tt) return;
      const price = memberLookup.member ? getMemberTicketPrice(tt, memberLookup.member) : tt.price;
      subtotal += price * qty;
    });
    return subtotal;
  };

  const getTotalQty = () => Object.values(resTickets).reduce((s, q) => s + (q || 0), 0);

  const handlePurchase = () => {
    if (!resForm.name.trim() || !resForm.email.trim()) return;
    if (!reserveEvent) return;
    const eventId = reserveEvent.id;
    const types = getTicketTypes(eventId).filter(t => t.active);
    const totalQty = getTotalQty();
    if (totalQty === 0) return;

    const items = [];
    Object.entries(resTickets).forEach(([typeId, qty]) => {
      if (qty <= 0) return;
      const tt = types.find(t => t.id === typeId);
      if (!tt) return;
      const price = memberLookup.member ? getMemberTicketPrice(tt, memberLookup.member) : tt.price;
      items.push({ productId: typeId, name: tt.name, qty, price, total: price * qty });
    });

    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const discount = memberLookup.member ? items.reduce((s, i) => {
      const orig = types.find(t => t.id === i.productId);
      return s + ((orig ? orig.price : i.price) * i.qty - i.total);
    }, 0) : 0;

    if (subtotal === 0) {
      // Free event — use reservation fallback
      addReservation({
        eventId,
        eventTitle: reserveEvent.title,
        name: resForm.name.trim(),
        email: resForm.email.trim(),
        qty: totalQty,
      });
      setConfirmationCode('FREE');
      setResSuccess(true);
      setTick(t => t + 1);
      return;
    }

    // Paid ticket order
    const adminEvent = adminEvents.find(e => e.id === eventId);
    const visitDate = adminEvent ? adminEvent.date : '';
    const result = addTicketOrder({
      type: 'event',
      channel: 'online',
      eventId,
      eventTitle: reserveEvent.title,
      visitDate,
      items,
      subtotal,
      discount,
      tax: 0,
      total: subtotal,
      customer: resForm.name.trim(),
      email: resForm.email.trim(),
      memberId: memberLookup.member ? memberLookup.member.id : null,
      memberTier: memberLookup.member ? memberLookup.member.tier : null,
      paymentMethod: 'card',
    });
    setConfirmationCode(result.confirmationCode || '');
    setResSuccess(true);
    setTick(t => t + 1);
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
        <LazyVideo
          src="/videos/darksky/meteor.mp4"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }}
          autoPlay muted loop playsInline
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
          scrollbarWidth: 'none',
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
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,12,0.35)', zIndex: 1 }} />
                    <div className="event-card-date" style={{ position: 'relative', zIndex: 2, left: '50%', transform: 'translateX(-50%)' }}>
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
                        onClick={(e) => { e.stopPropagation(); setReserveEvent(event); setResForm({ name: '', email: '', qty: 1 }); setResTickets({}); setMemberLookup({ email: '', member: null, checked: false, loading: false }); setResSuccess(false); setConfirmationCode(''); }}
                        style={{ marginTop: 16, width: '100%', padding: '12px 24px', fontSize: 11 }}
                      >
                        Get Tickets
                      </button>
                    )}
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        )}
      </section>

      {/* ── VIDEO DIVIDER ── */}
      <VideoDivider
        src="/videos/darksky/rattlesnake.mp4"
        title="The Desert After Dark"
        subtitle="Over 350 species call this landscape home. Experience them under the stars."
      />

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

      {/* ── Video divider styles ── */}
      <style>{`
        .vid-divider { position: relative; height: 400px; overflow: hidden; }
        .vid-divider-clip { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .vid-divider-video { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
        .vid-divider-overlay-top { position: absolute; top: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to bottom, var(--bg, #04040c), transparent); z-index: 2; pointer-events: none; }
        .vid-divider-overlay-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to top, var(--bg, #04040c), transparent); z-index: 2; pointer-events: none; }
        .vid-divider-content { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 3; text-align: center; padding: 0 24px; }
        .vid-divider-box { padding: 24px 48px; }
        .vid-divider-title { font: 400 clamp(32px, 5vw, 52px)/1.1 'Playfair Display', serif; font-style: italic; color: #FFFFFF; margin: 0 0 12px; text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.8), 0 8px 40px rgba(0,0,0,0.6), 0 0 80px rgba(0,0,0,0.4); }
        .vid-divider-sub { font: 300 clamp(14px, 2vw, 18px)/1.6 'Plus Jakarta Sans', sans-serif; color: rgba(255,255,255,0.9); margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5); }
        @media (max-width: 768px) { .vid-divider { height: 250px; } .vid-divider-overlay-top, .vid-divider-overlay-bottom { height: 80px; } .vid-divider-clip { inset: 0; } .vid-divider-video { height: 100%; } }
        @media (max-width: 480px) {
          .vid-divider { height: 200px; }
          .events-grid { gap: 14px !important; }
        }
      `}</style>

      {/* Ticket Purchase Modal */}
      {reserveEvent && (() => {
        const eventId = reserveEvent.id;
        const ticketTypes = getTicketTypes(eventId).filter(t => t.active && ((t.capacity || 999) - (t.sold || 0)) > 0);
        const total = getTicketTotal(eventId);
        const totalQty = getTotalQty();

        return (
          <>
            <div onClick={() => { setReserveEvent(null); setResSuccess(false); setConfirmationCode(''); }} style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            }} />
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'var(--bg2, #0a0a1a)', border: '1px solid var(--border)',
              borderRadius: 'var(--r, 3px)', padding: 'clamp(20px, 5vw, 36px)', width: 460, maxWidth: '90vw', zIndex: 1001,
              maxHeight: '90vh', overflowY: 'auto',
            }}>
              {resSuccess ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>
                    Tickets Confirmed!
                  </h3>
                  {confirmationCode && confirmationCode !== 'FREE' && (
                    <div style={{
                      font: '600 24px "JetBrains Mono", monospace',
                      letterSpacing: '0.15em',
                      color: 'var(--gold)',
                      margin: '16px 0',
                      padding: '16px',
                      background: 'rgba(212,175,55,0.08)',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 'var(--r, 3px)',
                    }}>
                      {confirmationCode}
                    </div>
                  )}
                  <p style={{ font: '300 14px "Plus Jakarta Sans"', color: 'var(--text2)', marginBottom: 4 }}>
                    {reserveEvent.title}
                  </p>
                  <p style={{ font: '300 13px "Plus Jakarta Sans"', color: 'var(--muted)' }}>
                    {reserveEvent.month} {reserveEvent.day} &middot; {reserveEvent.meta}
                  </p>
                  <button
                    className="btn-ghost"
                    onClick={() => { setReserveEvent(null); setResSuccess(false); setConfirmationCode(''); }}
                    style={{ marginTop: 24 }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* Event Header */}
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, marginBottom: 4 }}>
                    Get Tickets
                  </h3>
                  <p style={{ font: '300 13px "Plus Jakarta Sans"', color: 'var(--text2)', marginBottom: 4 }}>
                    {reserveEvent.title}
                  </p>
                  <p style={{ font: '400 11px "JetBrains Mono", monospace', color: 'var(--muted)', letterSpacing: '0.08em', marginBottom: 24 }}>
                    {reserveEvent.month} {reserveEvent.day} &middot; {reserveEvent.meta}
                  </p>

                  {/* Ticket Types */}
                  {ticketTypes.length > 0 ? (
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Select Tickets</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {ticketTypes.map(tt => {
                          const remaining = (tt.capacity || 999) - (tt.sold || 0);
                          const qty = resTickets[tt.id] || 0;
                          const displayPrice = memberLookup.member ? getMemberTicketPrice(tt, memberLookup.member) : tt.price;
                          const originalPrice = tt.price;
                          const hasMemberDiscount = memberLookup.member && displayPrice < originalPrice;
                          return (
                            <div key={tt.id} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 14px',
                              background: 'var(--bg3, #12122a)',
                              border: '1px solid var(--border2, rgba(255,255,255,0.06))',
                              borderRadius: 'var(--r, 3px)',
                            }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ font: '500 14px "Plus Jakarta Sans", sans-serif', color: 'var(--text)', marginBottom: 2 }}>{tt.name}</div>
                                <div style={{ font: '400 12px "Plus Jakarta Sans", sans-serif', color: 'var(--muted)' }}>
                                  {hasMemberDiscount ? (
                                    <>
                                      <span style={{ textDecoration: 'line-through', marginRight: 6 }}>${originalPrice.toFixed(2)}</span>
                                      <span style={{ color: 'var(--gold)', fontWeight: 600 }}>${displayPrice.toFixed(2)}</span>
                                      <span style={{ font: '400 10px "JetBrains Mono", monospace', color: 'var(--gold)', marginLeft: 6 }}>MEMBER</span>
                                    </>
                                  ) : displayPrice === 0 ? (
                                    <span style={{ color: 'var(--gold)' }}>Free</span>
                                  ) : (
                                    <span>${displayPrice.toFixed(2)}</span>
                                  )}
                                  {remaining <= 20 && <span style={{ color: '#FF6B6B', marginLeft: 8, font: '400 10px "JetBrains Mono", monospace' }}>{remaining} left</span>}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button
                                  onClick={() => setResTickets(prev => ({ ...prev, [tt.id]: Math.max(0, (prev[tt.id] || 0) - 1) }))}
                                  disabled={qty === 0}
                                  style={{
                                    width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border2, rgba(255,255,255,0.1))',
                                    background: 'transparent', color: qty === 0 ? 'var(--muted)' : 'var(--text)', cursor: qty === 0 ? 'default' : 'pointer',
                                    font: '500 16px "Plus Jakarta Sans"', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >-</button>
                                <span style={{ font: '500 14px "JetBrains Mono", monospace', color: 'var(--text)', width: 20, textAlign: 'center' }}>{qty}</span>
                                <button
                                  onClick={() => setResTickets(prev => ({ ...prev, [tt.id]: Math.min(remaining, Math.min(10, (prev[tt.id] || 0) + 1)) }))}
                                  disabled={qty >= remaining || qty >= 10}
                                  style={{
                                    width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border2, rgba(255,255,255,0.1))',
                                    background: 'transparent', color: (qty >= remaining || qty >= 10) ? 'var(--muted)' : 'var(--text)', cursor: (qty >= remaining || qty >= 10) ? 'default' : 'pointer',
                                    font: '500 16px "Plus Jakarta Sans"', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p style={{ font: '300 13px "Plus Jakarta Sans"', color: 'var(--muted)', marginBottom: 20 }}>
                      No ticket types available for this event.
                    </p>
                  )}

                  {/* Member Lookup */}
                  <div style={{ marginBottom: 20, padding: '14px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: 'var(--r, 3px)' }}>
                    <label style={{ display: 'block', font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Member?</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={memberLookup.email}
                        onChange={e => setMemberLookup(prev => ({ ...prev, email: e.target.value, checked: false, member: null }))}
                        onKeyDown={e => e.key === 'Enter' && handleMemberLookup()}
                        placeholder="Enter member email"
                        type="email"
                        style={{ flex: 1, padding: '10px 12px', background: 'var(--bg3, #12122a)', border: '1px solid var(--border2, rgba(255,255,255,0.06))', borderRadius: 'var(--r, 3px)', font: '400 13px "DM Sans"', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={handleMemberLookup}
                        disabled={!memberLookup.email.trim() || memberLookup.loading}
                        style={{
                          padding: '10px 16px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                          borderRadius: 'var(--r, 3px)', font: '500 11px "JetBrains Mono", monospace', color: 'var(--gold)',
                          cursor: !memberLookup.email.trim() ? 'default' : 'pointer', letterSpacing: '0.05em',
                          opacity: !memberLookup.email.trim() ? 0.4 : 1,
                        }}
                      >
                        {memberLookup.loading ? '...' : 'Look Up'}
                      </button>
                    </div>
                    {memberLookup.checked && memberLookup.member && (
                      <div style={{ marginTop: 8, font: '400 12px "Plus Jakarta Sans"', color: 'var(--gold)' }}>
                        ✦ Member found: {memberLookup.member.name} ({memberLookup.member.tier})
                      </div>
                    )}
                    {memberLookup.checked && !memberLookup.member && (
                      <div style={{ marginTop: 8, font: '400 12px "Plus Jakarta Sans"', color: 'var(--muted)' }}>
                        No active membership found for this email.
                      </div>
                    )}
                  </div>

                  {/* Running Total */}
                  {totalQty > 0 && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 14px', marginBottom: 20,
                      background: 'var(--bg3, #12122a)', border: '1px solid var(--border2, rgba(255,255,255,0.06))',
                      borderRadius: 'var(--r, 3px)',
                    }}>
                      <span style={{ font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                        Total ({totalQty} {totalQty === 1 ? 'ticket' : 'tickets'})
                      </span>
                      <span style={{ font: '600 18px "Playfair Display", serif', color: total === 0 ? 'var(--gold)' : 'var(--text)' }}>
                        {total === 0 ? 'Free' : `$${total.toFixed(2)}`}
                      </span>
                    </div>
                  )}

                  {/* Customer Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Name</label>
                      <input
                        value={resForm.name} onChange={e => setResForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your name"
                        style={{ width: '100%', padding: '12px 14px', background: 'var(--bg3, #12122a)', border: '1px solid var(--border2, rgba(255,255,255,0.06))', borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Email</label>
                      <input
                        value={resForm.email} onChange={e => setResForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@example.com" type="email"
                        style={{ width: '100%', padding: '12px 14px', background: 'var(--bg3, #12122a)', border: '1px solid var(--border2, rgba(255,255,255,0.06))', borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-ghost" onClick={() => { setReserveEvent(null); setResSuccess(false); setConfirmationCode(''); }} style={{ flex: 1 }}>Cancel</button>
                    <button
                      className="btn-primary"
                      onClick={handlePurchase}
                      disabled={!resForm.name.trim() || !resForm.email.trim() || totalQty === 0}
                      style={{ flex: 1, opacity: (!resForm.name.trim() || !resForm.email.trim() || totalQty === 0) ? 0.4 : 1 }}
                    >
                      {total === 0 && totalQty > 0 ? 'Reserve Free' : totalQty === 0 ? 'Select Tickets' : 'Purchase Tickets'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}
