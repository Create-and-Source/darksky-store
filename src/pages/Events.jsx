import { useState, useEffect, useRef } from 'react';
import { getEvents, addReservation, formatPrice } from '../admin/data/store';
import { EditableText } from '../components/EditMode';

const CATEGORIES = ['All', 'Star Party', 'Planetarium', 'Workshop', 'Special Event'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return {
    day: DAYS[d.getDay()],
    month: MONTHS[d.getMonth()].toUpperCase(),
    date: d.getDate(),
    full: `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()].toUpperCase()} ${d.getDate()}`,
  };
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('vis'); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function EventCard({ event, onSelect, onReserve }) {
  const dt = fmtDate(event.date);
  const spotsLeft = (event.capacity || 0) - (event.ticketsSold || 0);
  const spotsLow = spotsLeft <= 10;
  const ref = useReveal();
  const priceDisplay = event.price === 0 ? 'Free' : formatPrice(event.price);

  return (
    <div ref={ref} className="reveal" onClick={() => onSelect(event)} style={{
      background: 'var(--card, rgba(13,13,34,0.7))',
      border: '1px solid var(--border)',
      cursor: 'pointer',
      transition: 'border-color 0.3s, transform 0.3s',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,74,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Member free badge */}
      {event.memberFree && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '4px 10px', background: 'rgba(74,222,128,0.1)',
          border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80',
          font: '600 8px JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase',
          zIndex: 2,
        }}>Free for Members</div>
      )}

      {/* Date stripe */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52, background: 'rgba(201,169,74,0.08)',
            border: '1px solid rgba(201,169,74,0.2)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ font: '600 8px/1 JetBrains Mono', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: 2 }}>{dt.month}</span>
            <span style={{ font: '600 22px/1 DM Sans', color: 'var(--text)' }}>{dt.date}</span>
          </div>
          <div>
            <div style={{ font: '500 9px/1 JetBrains Mono', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: 4 }}>{dt.day}</div>
            <div style={{ font: '400 13px/1 DM Sans', color: 'var(--muted)' }}>{event.time}</div>
          </div>
        </div>
        <span style={{
          font: '600 9px/1 JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '4px 10px', border: '1px solid rgba(201,169,74,0.25)',
          color: 'var(--gold)', background: 'rgba(201,169,74,0.06)',
        }}>{event.category}</span>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 24px 24px' }}>
        <h3 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 19, fontWeight: 400,
          color: 'var(--text)', marginBottom: 8, lineHeight: 1.25,
        }}>{event.title}</h3>
        <p style={{ font: '300 13px/1.65 DM Sans', color: 'var(--muted)', marginBottom: 20 }}>
          {event.description && event.description.slice(0, 120)}{event.description && event.description.length > 120 ? '...' : ''}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ font: '600 15px/1 DM Sans', color: 'var(--gold)', marginBottom: 4 }}>{priceDisplay}</div>
            <div style={{
              font: '400 11px/1 DM Sans',
              color: spotsLow ? '#facc15' : 'var(--muted)',
            }}>
              {spotsLow ? `Only ${spotsLeft} spots left` : `${spotsLeft} spots remaining`}
            </div>
          </div>
          <button style={{
            padding: '10px 20px', background: 'transparent',
            border: '1px solid rgba(201,169,74,0.35)', color: 'var(--gold)',
            font: '500 11px/1 JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.25s',
          }}
          onMouseEnter={e => { e.target.style.background = 'var(--gold)'; e.target.style.color = '#04040c'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--gold)'; }}
          onClick={e => { e.stopPropagation(); onReserve(event); }}
          >Reserve Spot</button>
        </div>
      </div>
    </div>
  );
}

function EventDetail({ event, onClose, onReserve }) {
  if (!event) return null;
  const dt = fmtDate(event.date);
  const spotsLeft = (event.capacity || 0) - (event.ticketsSold || 0);
  const spotsLow = spotsLeft <= 10;
  const pct = Math.round((1 - spotsLeft / (event.capacity || 1)) * 100);
  const priceDisplay = event.price === 0 ? 'Free' : formatPrice(event.price);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(4,4,12,0.75)',
        zIndex: 200, animation: 'fadeIn 0.2s',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, maxWidth: '100vw',
        background: '#08080f', borderLeft: '1px solid rgba(201,169,74,0.1)',
        zIndex: 201, overflowY: 'auto', animation: 'slideIn 0.3s cubic-bezier(.16,1,.3,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid rgba(201,169,74,0.08)',
          position: 'sticky', top: 0, background: '#08080f', zIndex: 1,
        }}>
          <span style={{ font: '500 16px/1 Playfair Display, serif' }}>Event Details</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#5a5550',
            cursor: 'pointer', fontSize: 22, padding: 4,
          }}>&#10005;</button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Member free badge */}
          {event.memberFree && (
            <div style={{
              display: 'inline-block', padding: '5px 14px',
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
              color: '#4ade80', font: '600 9px JetBrains Mono', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 16,
            }}>Free for Members</div>
          )}

          {/* Date badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', background: 'rgba(201,169,74,0.06)',
            border: '1px solid rgba(201,169,74,0.15)', marginBottom: 20,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ font: '600 8px/1 JetBrains Mono', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: 2 }}>{dt.month}</div>
              <div style={{ font: '600 24px/1 DM Sans', color: 'var(--text)' }}>{dt.date}</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(201,169,74,0.2)' }} />
            <div>
              <div style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: 3 }}>{dt.day}</div>
              <div style={{ font: '400 14px/1 DM Sans', color: 'var(--text)' }}>{event.time}{event.endTime ? ` - ${event.endTime}` : ''}</div>
            </div>
          </div>

          <span style={{
            display: 'inline-block', marginLeft: 12, font: '600 9px/1 JetBrains Mono',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '5px 12px', background: 'rgba(201,169,74,0.08)',
            border: '1px solid rgba(201,169,74,0.2)', color: 'var(--gold)',
          }}>{event.category}</span>

          <h2 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 400,
            lineHeight: 1.2, marginTop: 20, marginBottom: 12, color: 'var(--text)',
          }}>{event.title}</h2>

          <p style={{ font: '300 14px/1.8 DM Sans', color: 'var(--muted)', marginBottom: 24 }}>
            {event.description}
          </p>

          {/* Location */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5550', marginBottom: 6 }}>Location</div>
            <p style={{ font: '400 14px/1 DM Sans', color: 'var(--text)' }}>{event.location}</p>
          </div>

          {/* Price */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5550', marginBottom: 6 }}>Price</div>
            <p style={{ font: '600 18px/1 DM Sans', color: 'var(--gold)' }}>{priceDisplay}</p>
          </div>

          {/* Spots bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5550' }}>Availability</span>
              <span style={{ font: '400 12px/1 DM Sans', color: spotsLow ? '#facc15' : 'var(--muted)' }}>
                {spotsLeft} of {event.capacity} spots left
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: 2,
                background: spotsLow ? '#facc15' : 'var(--gold)',
                transition: 'width 0.5s cubic-bezier(.16,1,.3,1)',
              }} />
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => onReserve(event)}
            style={{
              width: '100%', padding: 18, background: 'var(--gold)', color: '#04040c',
              font: '600 12px/1 JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
              border: 'none', cursor: 'pointer', transition: 'all 0.35s',
              borderRadius: 'var(--r, 3px)', marginBottom: 12,
            }}
            onMouseEnter={e => { e.target.style.background = 'var(--gold-l, #e0c060)'; e.target.style.boxShadow = '0 8px 32px rgba(201,169,74,0.3)'; }}
            onMouseLeave={e => { e.target.style.background = 'var(--gold)'; e.target.style.boxShadow = 'none'; }}
          >Get Tickets</button>
          <p style={{ font: '300 11px/1.5 DM Sans', color: '#5a5550', textAlign: 'center' }}>
            Members receive priority booking and discounts
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}

function TicketModal({ event, onClose }) {
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [reserving, setReserving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!event) return null;

  const spotsLeft = (event.capacity || 0) - (event.ticketsSold || 0);
  const priceDisplay = event.price === 0 ? 'Free' : formatPrice(event.price);
  const totalPrice = event.price * qty;

  const handleReserve = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (qty > spotsLeft) { setError(`Only ${spotsLeft} spots available`); return; }
    setError('');
    setReserving(true);
    setTimeout(() => {
      addReservation({ eventId: event.id, email, qty, name: name.trim() });
      setReserving(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(4,4,12,0.8)',
        zIndex: 300, animation: 'fadeIn 0.2s',
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 440, maxWidth: '90vw', background: '#0a0a18',
        border: '1px solid rgba(201,169,74,0.2)', zIndex: 301,
        animation: 'confPop 0.3s cubic-bezier(.16,1,.3,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ font: '500 16px Playfair Display, serif', color: 'var(--text)' }}>
            {success ? 'Reservation Confirmed' : 'Reserve Tickets'}
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#5a5550',
            cursor: 'pointer', fontSize: 20, padding: 4,
          }}>&#10005;</button>
        </div>

        <div style={{ padding: 24 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>&#10003;</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>
                You're in!
              </h3>
              <p style={{ font: '300 14px/1.7 DM Sans', color: 'var(--muted)', marginBottom: 4 }}>
                {qty} ticket{qty > 1 ? 's' : ''} reserved for
              </p>
              <p style={{ font: '500 16px DM Sans', color: 'var(--gold)', marginBottom: 16 }}>
                {event.title}
              </p>
              <p style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>
                Confirmation sent to {email}
              </p>
              <button onClick={onClose} className="btn-primary" style={{ marginTop: 24 }}>Done</button>
            </div>
          ) : (
            <>
              {/* Event info */}
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>
                  {event.title}
                </h3>
                <div style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>
                  {fmtDate(event.date).full} &middot; {event.time} &middot; {event.location}
                </div>
                <div style={{ font: '600 14px DM Sans', color: 'var(--gold)', marginTop: 8 }}>
                  {priceDisplay}{event.price > 0 ? ' / person' : ''}
                </div>
                {event.memberFree && (
                  <div style={{ font: '400 11px DM Sans', color: '#4ade80', marginTop: 4 }}>
                    Free for members
                  </div>
                )}
              </div>

              {/* Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                  Your Name
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full name"
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'rgba(13,13,34,0.7)', border: '1px solid var(--border2, rgba(255,255,255,0.06))',
                    borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)', outline: 'none',
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'rgba(13,13,34,0.7)', border: '1px solid var(--border2, rgba(255,255,255,0.06))',
                    borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)', outline: 'none',
                  }}
                />
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                  Quantity
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{
                      width: 40, height: 40, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)', color: 'var(--text)',
                      cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >-</button>
                  <span style={{ font: '600 18px DM Sans', color: 'var(--text)', minWidth: 32, textAlign: 'center' }}>{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(spotsLeft, q + 1))}
                    style={{
                      width: 40, height: 40, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)', color: 'var(--text)',
                      cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                  <span style={{ font: '300 12px DM Sans', color: 'var(--muted)' }}>
                    {spotsLeft} spots available
                  </span>
                </div>
              </div>

              {/* Total */}
              {event.price > 0 && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                  borderTop: '1px solid var(--border)', marginBottom: 16,
                }}>
                  <span style={{ font: '400 14px DM Sans', color: 'var(--muted)' }}>Total</span>
                  <span style={{ font: '600 18px DM Sans', color: 'var(--gold)' }}>{formatPrice(totalPrice)}</span>
                </div>
              )}

              {error && (
                <div style={{ font: '400 12px DM Sans', color: '#ef4444', marginBottom: 12 }}>{error}</div>
              )}

              <button
                onClick={handleReserve}
                disabled={reserving}
                style={{
                  width: '100%', padding: 16, background: reserving ? 'rgba(201,169,74,0.3)' : 'var(--gold)',
                  color: '#04040c', border: 'none', borderRadius: 'var(--r, 3px)',
                  font: '600 12px JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
                  cursor: reserving ? 'not-allowed' : 'pointer', transition: 'all 0.35s',
                }}
              >
                {reserving ? 'Reserving...' : 'Reserve'}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes confPop {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default function Events() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [ticketEvent, setTicketEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const heroRef = useReveal();

  useEffect(() => {
    const allEvents = getEvents().filter(e => e.status === 'Published');
    setEvents(allEvents);
  }, []);

  // Refresh events when ticket modal closes (to reflect updated ticketsSold)
  const refreshEvents = () => {
    const allEvents = getEvents().filter(e => e.status === 'Published');
    setEvents(allEvents);
  };

  const handleReserve = (event) => {
    setSelected(null);
    setTicketEvent(event);
  };

  const handleTicketClose = () => {
    setTicketEvent(null);
    refreshEvents();
  };

  const featured = events.find(e => e.featured);
  const filtered = events.filter(e => {
    if (category === 'All') return true;
    return e.category === category;
  });
  const upcoming = filtered.filter(e => !e.featured || category !== 'All');

  const featuredDt = featured ? fmtDate(featured.date) : null;
  const featuredSpotsLeft = featured ? (featured.capacity || 0) - (featured.ticketsSold || 0) : 0;
  const featuredPrice = featured ? (featured.price === 0 ? 'Free' : formatPrice(featured.price)) : '';

  return (
    <div>
      {/* Hero */}
      <div style={{
        position: 'relative', padding: '120px 64px 100px', textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(201,169,74,0.06) 0%, transparent 60%)',
        overflow: 'hidden', minHeight: 420,
      }} className="evt-hero">
        <div ref={heroRef} className="reveal" style={{ position: 'relative', zIndex: 2 }}>
          <div className="label" style={{ marginBottom: 20 }}>// Events & Programs</div>
          <EditableText textKey="events-hero-title" defaultText="Experience the<br /><em style='font-style:italic;color:var(--gold)'>Night Sky</em>" tag="h1" style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(44px, 7vw, 88px)',
            fontWeight: 400, lineHeight: 0.95, marginBottom: 24, letterSpacing: '-0.02em',
          }} />
          <EditableText textKey="events-hero-sub" defaultText="Star parties, planetarium shows, workshops, and celestial events -- all under some of the darkest skies in North America." tag="p" style={{
            font: '300 17px/1.8 DM Sans', color: 'var(--muted)',
            maxWidth: 520, margin: '0 auto',
          }} />
        </div>

        {/* Decorative stars */}
        {[...Array(30)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: Math.random() > 0.85 ? 2 : 1,
            height: Math.random() > 0.85 ? 2 : 1,
            background: Math.random() > 0.7 ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
            borderRadius: '50%',
            opacity: 0.3 + Math.random() * 0.5,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>

      {/* Featured Event */}
      {featured && category === 'All' && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 60 }}>
          <div className="label" style={{ marginBottom: 20 }}>// Featured Event</div>
          <div
            onClick={() => setSelected(featured)}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              border: '1px solid rgba(201,169,74,0.25)', cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(201,169,74,0.04) 0%, transparent 60%)',
              transition: 'border-color 0.3s, transform 0.3s',
              position: 'relative', overflow: 'hidden',
            }}
            className="evt-featured"
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,74,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,169,74,0.25)'; e.currentTarget.style.transform = 'none'; }}
          >
            {/* Left: Visual */}
            <div style={{
              padding: '56px 48px', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', textAlign: 'center',
              borderRight: '1px solid rgba(201,169,74,0.12)',
              background: 'radial-gradient(circle at 50% 50%, rgba(201,169,74,0.06) 0%, transparent 70%)',
              position: 'relative',
            }} className="evt-featured-left">
              {/* Large date */}
              <div style={{
                marginBottom: 24,
                padding: '20px 28px',
                border: '1px solid rgba(201,169,74,0.2)',
                background: 'rgba(201,169,74,0.04)',
              }}>
                <div style={{ font: '600 10px/1 JetBrains Mono', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 6 }}>
                  {featuredDt.day} &middot; {featuredDt.month}
                </div>
                <div style={{ font: '400 64px/1 Playfair Display, serif', color: 'var(--text)', fontStyle: 'italic' }}>
                  {featuredDt.date}
                </div>
              </div>
              <div style={{ font: '400 16px/1 DM Sans', color: 'var(--muted)' }}>{featured.time}</div>
              <div style={{ font: '400 12px/1 DM Sans', color: '#5a5550', marginTop: 4 }}>{featured.location}</div>
            </div>

            {/* Right: Info */}
            <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="evt-featured-right">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{
                  display: 'inline-block', width: 'fit-content',
                  font: '600 9px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase',
                  padding: '5px 12px', background: 'rgba(201,169,74,0.1)',
                  border: '1px solid rgba(201,169,74,0.25)', color: 'var(--gold)',
                }}>Featured</span>
                {featured.memberFree && (
                  <span style={{
                    display: 'inline-block', width: 'fit-content',
                    font: '600 9px/1 JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '5px 12px', background: 'rgba(74,222,128,0.1)',
                    border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80',
                  }}>Free for Members</span>
                )}
              </div>
              <h2 style={{
                fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 3vw, 40px)',
                fontWeight: 400, lineHeight: 1.15, marginBottom: 16, color: 'var(--text)',
              }}>{featured.title}</h2>
              <p style={{ font: '300 14px/1.75 DM Sans', color: 'var(--muted)', marginBottom: 24 }}>
                {featured.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ font: '600 20px/1 DM Sans', color: 'var(--gold)' }}>{featuredPrice}</div>
                  <div style={{ font: '400 11px/1 DM Sans', color: '#5a5550', marginTop: 4 }}>
                    {featuredSpotsLeft} spots remaining
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={e => { e.stopPropagation(); handleReserve(featured); }}
                >Get Tickets</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <div className="cat-tabs" style={{ top: 68 }}>
        {CATEGORIES.map(cat => {
          const count = cat === 'All' ? events.length : events.filter(e => e.category === cat).length;
          return (
            <button
              key={cat}
              className={`cat-tab ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
              <span className="cat-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      <section className="section" style={{ paddingTop: 48 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 0,
          borderLeft: '1px solid var(--border)',
          borderTop: '1px solid var(--border)',
        }} className="evt-grid">
          {upcoming.map(event => (
            <div key={event.id} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <EventCard event={event} onSelect={setSelected} onReserve={handleReserve} />
            </div>
          ))}
        </div>

        {upcoming.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.4 }}>✦</div>
            <p style={{ font: '300 16px/1.6 DM Sans', color: 'var(--muted)' }}>
              No upcoming events in this category. Check back soon.
            </p>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <div className="mission">
        <div className="label" style={{ marginBottom: 24 }}>// Never Miss an Event</div>
        <blockquote className="mission-quote" style={{ fontSize: 'clamp(24px, 3.5vw, 44px)' }}>
          Join our newsletter for <em>early access</em> to events, member-only gatherings, and celestial happenings.
        </blockquote>
        <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 480, margin: '36px auto 0' }}>
          <input
            type="email"
            placeholder="your@email.com"
            style={{
              flex: 1, minWidth: 200, padding: '14px 20px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border2, rgba(255,255,255,0.06))',
              borderRadius: 100, font: '400 14px DM Sans', color: 'var(--text)', outline: 'none',
            }}
          />
          <button className="btn-primary" style={{ borderRadius: 100 }}>Subscribe</button>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && <EventDetail event={selected} onClose={() => setSelected(null)} onReserve={handleReserve} />}

      {/* Ticket Modal */}
      {ticketEvent && <TicketModal event={ticketEvent} onClose={handleTicketClose} />}

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 860px) {
          .evt-hero { padding: 80px 24px 64px !important; min-height: auto !important; }
          .evt-featured { grid-template-columns: 1fr !important; }
          .evt-featured-left { padding: 32px 24px !important; border-right: none !important; border-bottom: 1px solid rgba(201,169,74,0.12); }
          .evt-featured-right { padding: 32px 24px !important; }
          .evt-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
