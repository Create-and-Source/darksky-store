import { useState, useEffect, useRef } from 'react';
import { getEvents, addReservation, formatPrice, subscribe } from '../admin/data/store';
import { EditableText } from '../components/EditMode';

const CATEGORIES = ['All', 'Star Party', 'Special Event', 'Kids Program', 'Workshop', 'Planetarium Show'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return {
    day: DAYS[d.getDay()],
    fullDay: FULL_DAYS[d.getDay()],
    month: MONTHS[d.getMonth()].toUpperCase(),
    date: d.getDate(),
    full: `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()].toUpperCase()} ${d.getDate()}`,
  };
}

function useCountdown(targetDateStr) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, mins: 0 });
  useEffect(() => {
    if (!targetDateStr) return;
    const update = () => {
      const target = new Date(targetDateStr + 'T12:00:00');
      const now = new Date();
      const diff = Math.max(0, target - now);
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
      });
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [targetDateStr]);
  return remaining;
}

function EventDetail({ event, onClose, onReserve }) {
  if (!event) return null;
  const dt = fmtDate(event.date);
  const spotsLeft = (event.capacity || 0) - (event.ticketsSold || 0);
  const soldOut = spotsLeft <= 0;
  const almostFull = !soldOut && spotsLeft / (event.capacity || 1) < 0.2;
  const pct = Math.round(((event.ticketsSold || 0) / (event.capacity || 1)) * 100);
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
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{
              font: '600 9px/1 JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '5px 12px', background: 'rgba(201,169,74,0.08)',
              border: '1px solid rgba(201,169,74,0.2)', color: 'var(--gold)',
            }}>{event.category}</span>
            {event.memberFree && (
              <span style={{
                font: '600 9px/1 JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '5px 12px', background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37',
              }}>&#10022; Free for Members</span>
            )}
          </div>

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

          <h2 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 400,
            lineHeight: 1.2, marginTop: 20, marginBottom: 12, color: 'var(--text)',
          }}>{event.title}</h2>

          <p style={{ font: '300 14px/1.8 DM Sans', color: 'var(--muted)', marginBottom: 24 }}>
            {event.description}
          </p>

          <div style={{ marginBottom: 20 }}>
            <div style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5550', marginBottom: 6 }}>Location</div>
            <p style={{ font: '400 14px/1 DM Sans', color: 'var(--text)' }}>{event.location}</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5550', marginBottom: 6 }}>Price</div>
            <p style={{ font: '600 18px/1 DM Sans', color: 'var(--gold)' }}>{priceDisplay}</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5550' }}>Availability</span>
              <span style={{ font: '400 12px/1 DM Sans', color: soldOut ? '#ef4444' : almostFull ? '#D4AF37' : 'var(--muted)' }}>
                {soldOut ? 'Sold out' : `${spotsLeft} of ${event.capacity} spots left`}
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: 2,
                background: soldOut ? '#ef4444' : almostFull ? '#D4AF37' : 'var(--gold)',
                transition: 'width 0.5s cubic-bezier(.16,1,.3,1)',
              }} />
            </div>
          </div>

          {soldOut ? (
            <button style={{
              width: '100%', padding: 18, background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)', color: 'var(--muted)',
              font: '600 12px/1 JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 'var(--r, 3px)', marginBottom: 12,
            }}>Join Waitlist</button>
          ) : (
            <button
              onClick={() => onReserve(event)}
              style={{
                width: '100%', padding: 18, background: 'var(--gold)', color: '#04040c',
                font: '600 12px/1 JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', transition: 'all 0.35s',
                borderRadius: 'var(--r, 3px)', marginBottom: 12,
              }}
              onMouseEnter={e => { e.target.style.background = '#e0c060'; e.target.style.boxShadow = '0 8px 32px rgba(201,169,74,0.3)'; }}
              onMouseLeave={e => { e.target.style.background = 'var(--gold)'; e.target.style.boxShadow = 'none'; }}
            >Get Tickets</button>
          )}
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
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>You're in!</h3>
              <p style={{ font: '300 14px/1.7 DM Sans', color: 'var(--muted)', marginBottom: 4 }}>
                {qty} ticket{qty > 1 ? 's' : ''} reserved for
              </p>
              <p style={{ font: '500 16px DM Sans', color: 'var(--gold)', marginBottom: 16 }}>{event.title}</p>
              <p style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>Confirmation sent to {email}</p>
              <button onClick={onClose} className="btn-primary" style={{ marginTop: 24 }}>Done</button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>{event.title}</h3>
                <div style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>
                  {fmtDate(event.date).full} &middot; {event.time} &middot; {event.location}
                </div>
                <div style={{ font: '600 14px DM Sans', color: 'var(--gold)', marginTop: 8 }}>
                  {priceDisplay}{event.price > 0 ? ' / person' : ''}
                </div>
                {event.memberFree && (
                  <div style={{ font: '400 11px DM Sans', color: '#D4AF37', marginTop: 4 }}>&#10022; Free for members</div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Your Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(13,13,34,0.7)', border: '1px solid rgba(255,255,255,0.06)',
                  font: '400 14px DM Sans', color: 'var(--text)', outline: 'none',
                }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(13,13,34,0.7)', border: '1px solid rgba(255,255,255,0.06)',
                  font: '400 14px DM Sans', color: 'var(--text)', outline: 'none',
                }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                    width: 40, height: 40, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border)', color: 'var(--text)',
                    cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>-</button>
                  <span style={{ font: '600 18px DM Sans', color: 'var(--text)', minWidth: 32, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(spotsLeft, q + 1))} style={{
                    width: 40, height: 40, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border)', color: 'var(--text)',
                    cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>+</button>
                  <span style={{ font: '300 12px DM Sans', color: 'var(--muted)' }}>{spotsLeft} spots available</span>
                </div>
              </div>

              {event.price > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)', marginBottom: 16 }}>
                  <span style={{ font: '400 14px DM Sans', color: 'var(--muted)' }}>Total</span>
                  <span style={{ font: '600 18px DM Sans', color: 'var(--gold)' }}>{formatPrice(totalPrice)}</span>
                </div>
              )}

              {error && <div style={{ font: '400 12px DM Sans', color: '#ef4444', marginBottom: 12 }}>{error}</div>}

              <button onClick={handleReserve} disabled={reserving} style={{
                width: '100%', padding: 16, background: reserving ? 'rgba(201,169,74,0.3)' : 'var(--gold)',
                color: '#04040c', border: 'none',
                font: '600 12px JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
                cursor: reserving ? 'not-allowed' : 'pointer', transition: 'all 0.35s',
              }}>{reserving ? 'Reserving...' : 'Reserve'}</button>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes confPop { 0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}

export default function Events() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [ticketEvent, setTicketEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const load = () => {
      const allEvents = getEvents()
        .filter(e => e.status === 'Published')
        .filter(e => e.title && !e.title.match(/^[a-z]{3,}$/i) && e.title.length > 3) // Filter garbage test data
        .sort((a, b) => a.date.localeCompare(b.date));
      setEvents(allEvents);
    };
    load();
    return subscribe(() => { load(); setTick(t => t + 1); });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events.filter(e => e.date >= today);
  const nextEvent = upcomingEvents[0];
  const countdown = useCountdown(nextEvent?.date);

  const handleReserve = (event) => {
    setSelected(null);
    setTicketEvent(event);
  };

  const handleTicketClose = () => {
    setTicketEvent(null);
    // Refresh
    const allEvents = getEvents()
      .filter(e => e.status === 'Published')
      .filter(e => e.title && !e.title.match(/^[a-z]{3,}$/i) && e.title.length > 3)
      .sort((a, b) => a.date.localeCompare(b.date));
    setEvents(allEvents);
  };

  // Featured: first upcoming event
  const featured = upcomingEvents.find(e => e.featured) || upcomingEvents[0];
  const filtered = (category === 'All' ? upcomingEvents : upcomingEvents.filter(e => e.category === category))
    .filter(e => !featured || e.id !== featured.id || category !== 'All');

  const featuredDt = featured ? fmtDate(featured.date) : null;
  const featuredSpotsLeft = featured ? (featured.capacity || 0) - (featured.ticketsSold || 0) : 0;
  const featuredSoldOut = featuredSpotsLeft <= 0;
  const featuredAlmostFull = !featuredSoldOut && featuredSpotsLeft / (featured?.capacity || 1) < 0.2;
  const featuredPct = featured ? Math.round(((featured.ticketsSold || 0) / (featured.capacity || 1)) * 100) : 0;

  return (
    <div>
      {/* ── HERO ── */}
      <div style={{
        position: 'relative', padding: '120px 64px 80px', textAlign: 'center',
        overflow: 'hidden', minHeight: 380,
      }} className="evt-hero">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="label" style={{ marginBottom: 20 }}>// Events & Programs</div>
          <EditableText textKey="events-hero-title" defaultText="Experience the<br /><em style='font-style:italic;color:var(--gold)'>Night Sky</em>" tag="h1" style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(44px, 7vw, 88px)',
            fontWeight: 400, lineHeight: 0.95, marginBottom: 24, letterSpacing: '-0.02em',
          }} />
          <EditableText textKey="events-hero-sub" defaultText="Star parties, planetarium shows, workshops, and celestial events — all under some of the darkest skies in North America." tag="p" style={{
            font: '300 17px/1.8 DM Sans', color: 'var(--muted)',
            maxWidth: 520, margin: '0 auto',
          }} />

          {/* Countdown */}
          {nextEvent && (
            <div style={{
              marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 16,
              padding: '14px 28px',
              background: 'rgba(212,175,55,0.06)',
              border: '1px solid rgba(212,175,55,0.2)',
            }}>
              <span style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Next {nextEvent.category}
              </span>
              <div style={{ width: 1, height: 20, background: 'rgba(212,175,55,0.2)' }} />
              <span style={{ font: '400 14px DM Sans', color: 'var(--text)' }}>
                {countdown.days > 0 && <><strong style={{ color: 'var(--gold)' }}>{countdown.days}</strong> day{countdown.days !== 1 ? 's' : ''}, </>}
                <strong style={{ color: 'var(--gold)' }}>{countdown.hours}</strong> hour{countdown.hours !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── FEATURED EVENT ── */}
      {featured && category === 'All' && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 48 }}>
          <div className="label" style={{ marginBottom: 20 }}>// Featured Event</div>
          <div
            onClick={() => setSelected(featured)}
            className="evt-featured"
            style={{
              position: 'relative', cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.04) 0%, rgba(10,10,26,0.95) 60%)',
              border: '1px solid rgba(212,175,55,0.2)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
              e.currentTarget.style.boxShadow = '0 8px 40px rgba(212,175,55,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Gradient overlay image area */}
            <div className="evt-featured-visual" style={{
              padding: '60px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'radial-gradient(circle at 30% 40%, rgba(212,175,55,0.08) 0%, transparent 60%)',
              minHeight: 200,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  marginBottom: 24, padding: '24px 32px',
                  border: '1px solid rgba(212,175,55,0.2)',
                  background: 'rgba(212,175,55,0.04)',
                  display: 'inline-block',
                }}>
                  <div style={{ font: '600 10px/1 JetBrains Mono', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 6 }}>
                    {featuredDt.day} &middot; {featuredDt.month}
                  </div>
                  <div style={{ font: '400 72px/1 Playfair Display, serif', color: 'var(--text)', fontStyle: 'italic' }}>
                    {featuredDt.date}
                  </div>
                </div>
                <div style={{ font: '400 16px/1 DM Sans', color: 'var(--muted)', marginTop: 12 }}>{featured.time}{featured.endTime ? ` - ${featured.endTime}` : ''}</div>
                <div style={{ font: '400 13px/1 DM Sans', color: '#5a5550', marginTop: 4 }}>{featured.location}</div>
              </div>
            </div>

            {/* Info area */}
            <div className="evt-featured-info" style={{ padding: '40px 48px' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{
                  font: '600 9px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase',
                  padding: '5px 12px', background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.25)', color: 'var(--gold)',
                }}>Featured</span>
                {featured.memberFree && (
                  <span style={{
                    font: '600 9px/1 JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '5px 12px', background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37',
                  }}>&#10022; Free for Members</span>
                )}
              </div>

              <h2 style={{
                fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 400, lineHeight: 1.1, marginBottom: 16, color: 'var(--text)',
              }}>{featured.title}</h2>

              <p style={{ font: '300 15px/1.75 DM Sans', color: 'var(--muted)', marginBottom: 28, maxWidth: 520 }}>
                {featured.description}
              </p>

              {/* Spots progress bar */}
              <div style={{ marginBottom: 24, maxWidth: 400 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ font: '400 12px DM Sans', color: 'var(--muted)' }}>
                    {featuredSoldOut ? 'Sold out' : featuredAlmostFull ? `Only ${featuredSpotsLeft} spots left!` : `${featured.ticketsSold || 0} of ${featured.capacity} reserved`}
                  </span>
                  <span style={{ font: '500 12px DM Sans', color: 'var(--gold)' }}>{featuredPct}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${featuredPct}%`, borderRadius: 3,
                    background: featuredSoldOut ? '#ef4444' : 'linear-gradient(90deg, var(--gold), #e0c060)',
                    transition: 'width 0.8s cubic-bezier(.16,1,.3,1)',
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ font: '600 24px/1 DM Sans', color: 'var(--gold)' }}>
                    {featured.price === 0 ? 'Free' : formatPrice(featured.price)}
                  </div>
                  <div style={{ font: '400 11px DM Sans', color: '#5a5550', marginTop: 4 }}>per person</div>
                </div>
                <button
                  className="btn-primary"
                  style={{ padding: '16px 36px', fontSize: 13 }}
                  onClick={e => { e.stopPropagation(); handleReserve(featured); }}
                >{featuredSoldOut ? 'Join Waitlist' : 'Get Tickets'}</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORY FILTER ── */}
      <div className="cat-tabs" style={{ top: 68, position: 'sticky', zIndex: 10, background: 'var(--bg)' }}>
        {CATEGORIES.map(cat => {
          const count = cat === 'All' ? upcomingEvents.length : upcomingEvents.filter(e => e.category === cat).length;
          if (count === 0 && cat !== 'All') return null;
          return (
            <button key={cat} className={`cat-tab ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
              {cat}
              <span className="cat-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── EVENT LIST ── */}
      <section className="section" style={{ paddingTop: 32 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {filtered.map(event => {
            const dt = fmtDate(event.date);
            const spotsLeft = (event.capacity || 0) - (event.ticketsSold || 0);
            const soldOut = spotsLeft <= 0;
            const almostFull = !soldOut && spotsLeft / (event.capacity || 1) < 0.2;
            const priceDisplay = event.price === 0 ? 'Free' : formatPrice(event.price);

            return (
              <div
                key={event.id}
                onClick={() => setSelected(event)}
                className="evt-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: 24, padding: '20px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                  opacity: soldOut ? 0.5 : 1,
                }}
              >
                {/* Date block */}
                <div style={{
                  width: 72, flexShrink: 0, textAlign: 'center',
                  padding: '12px 8px',
                  borderLeft: '3px solid transparent',
                  transition: 'border-color 0.2s',
                }} className="evt-row-date">
                  <div style={{ font: '600 9px/1 JetBrains Mono', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: 4 }}>
                    {dt.month}
                  </div>
                  <div style={{ font: '600 28px/1 DM Sans', color: 'var(--text)', marginBottom: 2 }}>
                    {dt.date}
                  </div>
                  <div style={{ font: '500 9px/1 JetBrains Mono', letterSpacing: '0.1em', color: '#5a5550' }}>
                    {dt.day}
                  </div>
                </div>

                {/* Center info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h3 style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: 17, fontWeight: 600,
                      color: 'var(--text)', margin: 0, lineHeight: 1.3,
                    }}>{event.title}</h3>
                    <span style={{
                      font: '600 8px/1 JetBrains Mono', letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '3px 8px', background: 'rgba(212,175,55,0.06)',
                      border: '1px solid rgba(212,175,55,0.15)', color: 'var(--gold)',
                    }}>{event.category}</span>
                    {event.memberFree && (
                      <span style={{
                        font: '600 8px/1 JetBrains Mono', letterSpacing: '0.1em',
                        padding: '3px 8px', background: 'rgba(212,175,55,0.06)',
                        border: '1px solid rgba(212,175,55,0.15)', color: '#D4AF37',
                      }}>&#10022; Members Free</span>
                    )}
                  </div>
                  <div style={{ font: '300 13px/1.5 DM Sans', color: 'var(--muted)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.description?.slice(0, 100)}{event.description?.length > 100 ? '...' : ''}
                  </div>
                  <div style={{ font: '400 12px DM Sans', color: '#5a5550' }}>
                    {event.time}{event.endTime ? ` - ${event.endTime}` : ''} &middot; {event.location}
                  </div>
                </div>

                {/* Right: price + action */}
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 120 }} className="evt-row-right">
                  <div style={{ font: '600 16px DM Sans', color: 'var(--gold)', marginBottom: 4 }}>
                    {priceDisplay}
                  </div>
                  <div style={{
                    font: '400 11px DM Sans', marginBottom: 10,
                    color: soldOut ? '#ef4444' : almostFull ? '#D4AF37' : 'var(--muted)',
                  }}>
                    {soldOut ? 'Sold Out' : almostFull ? `Only ${spotsLeft} spots left!` : `${spotsLeft} spots left`}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); soldOut ? null : handleReserve(event); }}
                    style={{
                      padding: '8px 18px',
                      background: soldOut ? 'transparent' : 'transparent',
                      border: `1px solid ${soldOut ? 'rgba(255,255,255,0.08)' : 'rgba(212,175,55,0.35)'}`,
                      color: soldOut ? '#5a5550' : 'var(--gold)',
                      font: '500 10px/1 JetBrains Mono', letterSpacing: '0.1em', textTransform: 'uppercase',
                      cursor: soldOut ? 'default' : 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!soldOut) { e.target.style.background = 'var(--gold)'; e.target.style.color = '#04040c'; } }}
                    onMouseLeave={e => { if (!soldOut) { e.target.style.background = 'transparent'; e.target.style.color = 'var(--gold)'; } }}
                  >{soldOut ? 'Waitlist' : 'Reserve'}</button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.4 }}>&#10022;</div>
            <p style={{ font: '300 16px/1.6 DM Sans', color: 'var(--muted)' }}>
              No upcoming events in this category. Check back soon.
            </p>
          </div>
        )}
      </section>

      {/* ── NEWSLETTER CTA ── */}
      <div className="mission">
        <div className="label" style={{ marginBottom: 24 }}>// Never Miss an Event</div>
        <blockquote className="mission-quote" style={{ fontSize: 'clamp(24px, 3.5vw, 44px)' }}>
          Join our newsletter for <em>early access</em> to events, member-only gatherings, and celestial happenings.
        </blockquote>
        <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 480, margin: '36px auto 0' }}>
          <input type="email" placeholder="your@email.com" style={{
            flex: 1, minWidth: 200, padding: '14px 20px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 100, font: '400 14px DM Sans', color: 'var(--text)', outline: 'none',
          }} />
          <button className="btn-primary" style={{ borderRadius: 100 }}>Subscribe</button>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && <EventDetail event={selected} onClose={() => setSelected(null)} onReserve={handleReserve} />}

      {/* Ticket Modal */}
      {ticketEvent && <TicketModal event={ticketEvent} onClose={handleTicketClose} />}

      {/* Responsive & hover styles */}
      <style>{`
        .evt-row:hover .evt-row-date {
          border-left-color: var(--gold) !important;
        }
        .evt-row:hover {
          background: rgba(212,175,55,0.02);
        }
        @media (max-width: 860px) {
          .evt-hero { padding: 80px 24px 64px !important; min-height: auto !important; }
          .evt-featured { display: block !important; }
          .evt-featured-visual { min-height: 160px !important; padding: 32px 24px !important; }
          .evt-featured-info { padding: 28px 24px !important; }
        }
        @media (max-width: 640px) {
          .evt-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 20px 0 !important;
          }
          .evt-row-date {
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
            align-items: center !important;
            width: auto !important;
            padding: 0 !important;
            border-left: 3px solid var(--gold) !important;
            padding-left: 12px !important;
          }
          .evt-row-right {
            text-align: left !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
