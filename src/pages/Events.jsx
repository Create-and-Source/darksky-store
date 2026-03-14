import { useState, useEffect, useRef } from 'react';

const EVENTS = [
  {
    id: 'evt-001',
    title: 'New Moon Star Party',
    category: 'Star Parties',
    date: '2026-03-29',
    time: '8:00 PM',
    price: '$15/person',
    spotsLeft: 45,
    totalSpots: 80,
    featured: true,
    description: 'Experience the darkest skies of the month during our signature New Moon Star Party. Our astronomers will guide you through the constellations with high-powered telescopes, laser pointers, and star charts. Hot cocoa and blankets provided. This is the stargazing experience the Sonoran Desert was made for.',
    shortDesc: 'Guided stargazing under the darkest skies of the month. Telescopes, star charts, and hot cocoa provided.',
    location: 'Observatory Deck',
    includes: ['Telescope access', 'Star charts', 'Hot cocoa & snacks', 'Red-light headlamp'],
  },
  {
    id: 'evt-002',
    title: 'Planetarium Show: Journey to Mars',
    category: 'Planetarium Shows',
    date: '2026-04-05',
    time: '2:00 PM & 7:00 PM',
    price: '$12 adults / $8 kids',
    spotsLeft: 62,
    totalSpots: 90,
    featured: false,
    description: 'Travel 140 million miles in 45 minutes. Our state-of-the-art planetarium takes you on a breathtaking flyover of Olympus Mons, through the canyons of Valles Marineris, and into the thin Martian atmosphere.',
    shortDesc: 'A 45-minute immersive journey through the Martian landscape in our state-of-the-art planetarium.',
    location: 'Planetarium Theater',
    includes: ['45-minute show', 'Q&A with astronomer'],
  },
  {
    id: 'evt-003',
    title: 'Astrophotography Workshop',
    category: 'Workshops',
    date: '2026-04-12',
    time: '6:00 PM',
    price: '$35/person',
    spotsLeft: 8,
    totalSpots: 20,
    featured: false,
    description: 'Learn to capture the Milky Way, star trails, and deep-sky objects with your own camera. Includes hands-on telescope time and post-processing techniques. All skill levels welcome — bring a DSLR or mirrorless camera with a tripod.',
    shortDesc: 'Capture the Milky Way with hands-on instruction. Includes telescope time. All skill levels.',
    location: 'Observatory Deck & Lab',
    includes: ['3-hour session', 'Telescope time', 'Editing tutorial', 'Digital handouts'],
  },
  {
    id: 'evt-004',
    title: 'Meteor Shower Watch Party',
    category: 'Special Events',
    date: '2026-04-22',
    time: '9:00 PM',
    price: 'Free for members / $10 general',
    spotsLeft: 120,
    totalSpots: 200,
    featured: false,
    description: 'The Lyrids meteor shower peaks tonight. Join us on the observation field with blankets, binoculars, and warm drinks as we count shooting stars together. Our astronomers will share the science behind these ancient dust trails.',
    shortDesc: 'Watch the Lyrids meteor shower from our dark sky observation field. Blankets and binoculars provided.',
    location: 'Observation Field',
    includes: ['Blankets & chairs', 'Binoculars', 'Warm drinks', 'Meteor counting guide'],
  },
  {
    id: 'evt-005',
    title: 'Kids Space Camp Saturday',
    category: 'Workshops',
    date: '2026-04-19',
    time: '10:00 AM',
    price: '$25/child',
    spotsLeft: 12,
    totalSpots: 24,
    featured: false,
    description: 'A hands-on morning of space exploration for young astronomers ages 6–12. Build model rockets, explore the solar system in VR, paint constellations, and meet a real astronomer. Snacks and a take-home space kit included.',
    shortDesc: 'Hands-on space exploration for ages 6–12. Build rockets, explore VR, paint constellations.',
    location: 'Discovery Lab',
    includes: ['Rocket building', 'VR solar system', 'Snacks', 'Take-home space kit'],
  },
  {
    id: 'evt-006',
    title: 'Full Moon Desert Night Hike',
    category: 'Special Events',
    date: '2026-05-04',
    time: '7:30 PM',
    price: '$20/person',
    spotsLeft: 28,
    totalSpots: 40,
    featured: false,
    description: 'Hike through the moonlit Sonoran Desert on a guided 3-mile loop trail. No flashlights needed — the full moon lights the way. Learn about nocturnal wildlife, desert ecology, and how moonlight affects the natural world.',
    shortDesc: 'A moonlit 3-mile desert hike — no flashlights needed. Nocturnal wildlife and desert ecology.',
    location: 'Trailhead at Visitor Center',
    includes: ['Guided 3-mile hike', 'Wildlife spotting', 'Water bottle', 'Trail snacks'],
  },
];

const CATEGORIES = ['All', 'Star Parties', 'Planetarium Shows', 'Workshops', 'Special Events'];

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

function EventCard({ event, onSelect }) {
  const dt = fmtDate(event.date);
  const spotsLow = event.spotsLeft <= 15;
  const ref = useReveal();

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
          {event.shortDesc}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ font: '600 15px/1 DM Sans', color: 'var(--gold)', marginBottom: 4 }}>{event.price}</div>
            <div style={{
              font: '400 11px/1 DM Sans',
              color: spotsLow ? '#facc15' : 'var(--muted)',
            }}>
              {spotsLow ? `Only ${event.spotsLeft} spots left` : `${event.spotsLeft} spots remaining`}
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
          onClick={e => { e.stopPropagation(); onSelect(event); }}
          >Reserve Spot</button>
        </div>
      </div>
    </div>
  );
}

function EventDetail({ event, onClose }) {
  if (!event) return null;
  const dt = fmtDate(event.date);
  const spotsLow = event.spotsLeft <= 15;
  const pct = Math.round((1 - event.spotsLeft / event.totalSpots) * 100);

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
          }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>
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
              <div style={{ font: '400 14px/1 DM Sans', color: 'var(--text)' }}>{event.time}</div>
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
            <p style={{ font: '600 18px/1 DM Sans', color: 'var(--gold)' }}>{event.price}</p>
          </div>

          {/* Spots bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5550' }}>Availability</span>
              <span style={{ font: '400 12px/1 DM Sans', color: spotsLow ? '#facc15' : 'var(--muted)' }}>
                {event.spotsLeft} of {event.totalSpots} spots left
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

          {/* Includes */}
          {event.includes && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ font: '500 10px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5550', marginBottom: 12 }}>What's Included</div>
              {event.includes.map(item => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', font: '300 13px/1.4 DM Sans', color: 'var(--muted)',
                }}>
                  <span style={{ color: 'var(--gold)', fontSize: 10 }}>✦</span>
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <button style={{
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

export default function Events() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const heroRef = useReveal();

  const featured = EVENTS.find(e => e.featured);
  const filtered = EVENTS.filter(e => {
    if (category === 'All') return true;
    return e.category === category;
  });
  const upcoming = filtered.filter(e => !e.featured || category !== 'All');

  const featuredDt = featured ? fmtDate(featured.date) : null;

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
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(44px, 7vw, 88px)',
            fontWeight: 400, lineHeight: 0.95, marginBottom: 24, letterSpacing: '-0.02em',
          }}>
            Experience the<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Night Sky</em>
          </h1>
          <p style={{
            font: '300 17px/1.8 DM Sans', color: 'var(--muted)',
            maxWidth: 520, margin: '0 auto',
          }}>
            Star parties, planetarium shows, workshops, and celestial events — all under some of the darkest skies in North America.
          </p>
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
                  {featuredDt.day} · {featuredDt.month}
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
              <span style={{
                display: 'inline-block', width: 'fit-content',
                font: '600 9px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '5px 12px', background: 'rgba(201,169,74,0.1)',
                border: '1px solid rgba(201,169,74,0.25)', color: 'var(--gold)',
                marginBottom: 16,
              }}>Featured</span>
              <h2 style={{
                fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 3vw, 40px)',
                fontWeight: 400, lineHeight: 1.15, marginBottom: 16, color: 'var(--text)',
              }}>{featured.title}</h2>
              <p style={{ font: '300 14px/1.75 DM Sans', color: 'var(--muted)', marginBottom: 24 }}>
                {featured.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ font: '600 20px/1 DM Sans', color: 'var(--gold)' }}>{featured.price}</div>
                  <div style={{ font: '400 11px/1 DM Sans', color: '#5a5550', marginTop: 4 }}>
                    {featured.spotsLeft} spots remaining
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={e => { e.stopPropagation(); setSelected(featured); }}
                >Get Tickets</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <div className="cat-tabs" style={{ top: 68 }}>
        {CATEGORIES.map(cat => {
          const count = cat === 'All' ? EVENTS.length : EVENTS.filter(e => e.category === cat).length;
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
              <EventCard event={event} onSelect={setSelected} />
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
      {selected && <EventDetail event={selected} onClose={() => setSelected(null)} />}

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
