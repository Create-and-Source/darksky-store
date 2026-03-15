import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getEvents as getStoreEvents, getFundraising, addContact } from '../admin/data/store';

/* ── Helpers ── */
function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('vis'); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function SectionSep() {
  return <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)' }} />;
}

function LazyVideo({ src, className = '', style = {}, ...props }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [srcActive, setSrcActive] = useState(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
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

/* ── Countdown timer hook ── */
function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(targetDate) - Date.now());
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return remaining;
}

/* ── Hero headline ── */
function AnimatedHeadline({ visible }) {
  const line1 = ["The", "World's", "Center", "for", "Connecting"];
  const line2 = ["the", "Night", "Sky", "to"];
  const emWords = ["Life", "on", "Earth"];
  let wordIndex = 0;
  const renderWord = (word, isEm = false) => {
    const i = wordIndex++;
    const style = { display: 'inline-block', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)', transitionDelay: `${300 + i * 120}ms`, marginRight: '0.25em' };
    return isEm ? <em key={i} style={{ ...style, fontStyle: 'italic', color: 'var(--gold)' }}>{word}</em> : <span key={i} style={style}>{word}</span>;
  };
  return (
    <h1 className="hero-h1" data-editable="home-hero-title">
      {line1.map(w => renderWord(w))}<br />
      {line2.map(w => renderWord(w))}
      {emWords.map(w => renderWord(w, true))}
    </h1>
  );
}

const goldGrad = { background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' };

/* ── Data ── */
const EVENT_IMAGES = [
  { src: '/images/darksky/milky-way.jpg', alt: 'Milky Way' },
  { src: '/images/darksky/andromeda.jpg', alt: 'Andromeda galaxy' },
  { src: '/images/darksky/comet-neowise.jpg', alt: 'Comet NEOWISE' },
];

const HARDCODED_EVENTS = [
  { day: '29', month: 'MAR', cat: 'Stargazing', title: 'New Moon Star Party', desc: 'Join us for our monthly new moon star party — the darkest skies of the month!', meta: '8:00 PM · Observatory Deck' },
  { day: '12', month: 'APR', cat: 'Special Event', title: 'Planets & Pours', desc: 'A 21+ evening under the stars with local craft beer, wine, and telescope viewing.', meta: '7:30 PM · Amphitheater' },
  { day: '26', month: 'APR', cat: 'Workshop', title: 'Astrophotography Basics', desc: 'Learn to capture the Milky Way with your camera. Tripods provided.', meta: '6:00 PM · Education Center' },
];

const FACILITY = [
  { title: 'Dark Sky Observatory', desc: 'Home to the largest telescope in Greater Phoenix — a 27.5-inch PlaneWave CDK700, fully remotely operable.', img: '/images/darksky/observatory-hero.jpg' },
  { title: 'Hyperspace Planetarium', desc: 'A 65-seat immersive dome theater with state-of-the-art laser projection on a 39-foot tilted dome.', img: '/images/darksky/nebula.jpg' },
  { title: 'Inspiration Theater', desc: 'A 150-seat multi-use space for lectures, community events, and visiting speakers.', img: '/images/darksky/milky-way.jpg' },
  { title: 'Night Sky Experience', desc: '3,300 square feet of interactive exhibits exploring the connection between dark skies and life on Earth.', img: '/images/darksky/first-light-nebula.jpg' },
];

const FACTS = [
  { stat: '80%', text: 'of Americans can no longer see the Milky Way from where they live.' },
  { stat: '2x', text: 'Light pollution is growing at twice the rate of population growth.' },
  { stat: '1 of 13', text: "Fountain Hills is one of only 13 International Dark Sky Communities in the world, featured in the Smithsonian's Lights Out exhibit." },
];

const ENDORSEMENTS = [
  { quote: 'This center will inspire Arizona\'s next generation of space scientists and cement our state as a leader in STEM education and dark sky preservation.', name: 'Katie Hobbs', title: 'Governor of Arizona' },
  { quote: 'As a former astronaut, I know the power of looking up. This center will bring world-class STEM education programs that inspire future space scientists.', name: 'Mark Kelly', title: 'U.S. Senator, Arizona' },
  { quote: 'ASU looks forward to collaborating with the Discovery Center to advance research and public engagement with the night sky.', name: 'Dr. Michael Crow', title: 'President, Arizona State University' },
  { quote: 'The IDSDC shares our mission of educating people about the importance of natural darkness and the wonder of the night sky.', name: 'Ruskin Hartley', title: 'Executive Director, DarkSky International' },
  { quote: 'Welcome to the mission of public astronomy. The world needs more places dedicated to helping people connect with the cosmos.', name: 'Mark Pine', title: 'Director, Griffith Observatory' },
  { quote: 'This is a unique regional asset for STEM education and workforce development that will attract talent and tourism to Greater Phoenix.', name: 'Chris Camacho', title: 'President, Greater Phoenix Economic Council' },
];

/* ════════════════════════════════════════════ */
export default function Home({ onAddToCart }) {
  const navigate = useNavigate();
  const PRODUCTS = getProducts();
  const [heroVis, setHeroVis] = useState(false);
  const [heroVideoLoaded, setHeroVideoLoaded] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notified, setNotified] = useState(false);
  const countdown = useCountdown('2026-11-01T00:00:00');

  useEffect(() => { setTimeout(() => setHeroVis(true), 100); }, []);

  const fundraising = getFundraising();
  const raised = fundraising.raised / 100;
  const goal = fundraising.goal / 100;
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const handleNotify = (e) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    addContact({ email: notifyEmail.trim(), source: 'homepage-countdown' });
    setNotified(true);
  };

  return (
    <div data-page="home">

      {/* ═══ 1 — HERO ═══ */}
      <section className="hero" data-section="Hero">
        <video className="hero-video-bg" src="/videos/desert-night-sky.mp4" autoPlay muted loop playsInline onLoadedData={() => setHeroVideoLoaded(true)} style={{ opacity: heroVideoLoaded ? 1 : 0 }} />
        <div className="hero-video-overlay" />
        <div className="hero-gradient" />
        <div className="hero-content">
          <div className="label hero-label" style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(16px)', transition: 'opacity 0.9s var(--ease), transform 0.9s var(--ease)', transitionDelay: '0.15s' }}>
            <span data-editable="home-hero-label">// FOUNTAIN HILLS, ARIZONA</span>
          </div>
          <AnimatedHeadline visible={heroVis} />
          <p className="hero-sub" style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(16px)', transition: 'opacity 1s var(--ease), transform 1s var(--ease)', transitionDelay: '1.8s', letterSpacing: '0.18em' }}>
            <span data-editable="home-hero-subtitle">Observatory. Planetarium. Exhibits. Experiences.</span>
          </p>
          <div className="hero-actions" style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(16px)', transition: 'opacity 1s var(--ease), transform 1s var(--ease)', transitionDelay: '2.1s' }}>
            <button className="btn-primary" style={{ animation: 'breatheGlow 3s ease-in-out infinite' }} onClick={() => navigate('/events')}>Explore Events</button>
            <button className="btn-ghost" onClick={() => navigate('/membership')}>Become a Member</button>
          </div>
        </div>
      </section>

      {/* ═══ 2 — OPENING ANNOUNCEMENT + COUNTDOWN ═══ */}
      <section style={{ background: 'var(--bg)', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }} data-section="Countdown">
        <img src="/images/darksky/big-dipper-2.png" alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08, pointerEvents: 'none' }} />
        <RevealSection>
          <div className="label" style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>FOUNTAIN HILLS, ARIZONA</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 400, color: 'var(--text)', marginBottom: 12, position: 'relative', zIndex: 1 }}>
            Opening <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Fall 2026</em>
          </h2>
          <p style={{ font: '300 16px/1.7 "Plus Jakarta Sans"', color: 'var(--text2)', maxWidth: 540, margin: '0 auto 40px', position: 'relative', zIndex: 1 }}>
            The International Dark Sky Discovery Center — where the desert meets the cosmos.
          </p>
        </RevealSection>
        <RevealSection delay={200}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 40px)', marginBottom: 40, position: 'relative', zIndex: 1 }}>
            {[['days', countdown.days], ['hours', countdown.hours], ['minutes', countdown.minutes], ['seconds', countdown.seconds]].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ font: '400 clamp(32px, 6vw, 48px) "JetBrains Mono", monospace', color: 'var(--gold)', lineHeight: 1, marginBottom: 6 }}>{String(val).padStart(2, '0')}</div>
                <div style={{ font: '500 9px "JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </RevealSection>
        <RevealSection delay={300}>
          {notified ? (
            <p style={{ font: '500 14px "Plus Jakarta Sans"', color: 'var(--gold)', position: 'relative', zIndex: 1 }}>You're on the list! We'll keep you posted.</p>
          ) : (
            <form onSubmit={handleNotify} style={{ display: 'flex', gap: 0, justifyContent: 'center', maxWidth: 420, margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <input type="email" value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} placeholder="your@email.com" required style={{ flex: 1, padding: '14px 18px', background: 'rgba(10,10,26,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRight: 'none', borderRadius: 'var(--r) 0 0 var(--r)', font: '400 14px "Plus Jakarta Sans"', color: 'var(--text)', outline: 'none' }} />
              <button type="submit" style={{ padding: '14px 24px', background: 'var(--gold)', color: '#04040c', border: 'none', borderRadius: '0 var(--r) var(--r) 0', font: '600 11px "JetBrains Mono"', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Get Notified</button>
            </form>
          )}
        </RevealSection>
      </section>

      <SectionSep />

      {/* ═══ 3 — WHAT WE'RE BUILDING ═══ */}
      <section className="section" data-section="Facility">
        <RevealSection className="section-header">
          <div className="label section-label">// The Facility</div>
          <h2 className="section-title">22,000 Square Feet Dedicated to the <em>Night Sky</em></h2>
        </RevealSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }} className="home-facility-grid">
          {FACILITY.map((f, i) => (
            <RevealSection key={f.title} delay={i * 100}>
              <div style={{ position: 'relative', minHeight: 320, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-end', transition: 'transform 0.4s var(--ease)', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <img src={f.img} alt={f.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,4,12,0.15) 0%, rgba(4,4,12,0.85) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '32px 24px', width: '100%' }}>
                  <h3 style={{ font: '500 clamp(18px, 2vw, 22px)/1.2 "Playfair Display", serif', color: '#fff', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ font: '300 17px/1.7 "Plus Jakarta Sans"', color: 'var(--gold)', margin: 0, opacity: 0.85 }}>{f.desc}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <SectionSep />

      {/* ═══ 4 — FIRST LIGHT PHOTO ═══ */}
      <section style={{ position: 'relative', overflow: 'hidden' }} data-section="FirstLight">
        <img src="/images/darksky/first-light-nebula.jpg" alt="First Light — the first photo taken by the PlaneWave CDK700 telescope" loading="lazy" style={{ width: '100%', height: 'auto', minHeight: 400, maxHeight: 600, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(4,4,12,0.8) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 64px 48px', zIndex: 1 }}>
          <RevealSection>
            <div className="label" style={{ marginBottom: 12 }}>// First Light</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, color: '#fff', marginBottom: 8, lineHeight: 1.15 }}>
              The First Photo From Our <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Telescope</em>
            </h2>
            <p style={{ font: '300 18px/1.7 "Plus Jakarta Sans"', color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: 0 }}>
              Captured by the PlaneWave CDK700 — the largest telescope in the Greater Phoenix area.
            </p>
          </RevealSection>
        </div>
      </section>

      <SectionSep />

      {/* ═══ 5 — WILDLIFE VIDEO DIVIDER (ONE) ═══ */}
      <VideoDivider
        src="/videos/darksky/gila.mp4"
        title="Where the Wild Things Wake"
        subtitle="Nocturnal wildlife thrives under dark skies"
      />

      <SectionSep />

      {/* ═══ 6 — DID YOU KNOW FACTS ═══ */}
      <section className="section" style={{ background: 'var(--bg)' }} data-section="Facts">
        <RevealSection className="section-header">
          <div className="label section-label">// Did You Know</div>
          <h2 className="section-title">The Night Sky Is <em>Disappearing</em></h2>
        </RevealSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} className="home-facts-grid">
          {FACTS.map((f, i) => (
            <RevealSection key={i} delay={i * 120}>
              <div style={{ padding: '48px 32px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ font: '400 clamp(40px, 5vw, 64px) "Playfair Display", serif', fontStyle: 'italic', marginBottom: 16, ...goldGrad }}>{f.stat}</div>
                <p style={{ font: '300 18px/1.7 "Plus Jakarta Sans"', color: 'var(--text2)', margin: 0 }}>{f.text}</p>
              </div>
            </RevealSection>
          ))}
        </div>
        <RevealSection delay={400}>
          <p style={{ font: '300 20px/1.7 "Plus Jakarta Sans"', color: 'var(--text2)', textAlign: 'center', maxWidth: 700, margin: '40px auto 0' }}>
            With nearly 5 million people just 30 minutes away, we're building something that doesn't exist anywhere else.
          </p>
        </RevealSection>
      </section>

      <SectionSep />

      {/* ═══ 7 — UPCOMING EVENTS ═══ */}
      <section className="section" style={{ background: 'var(--surface)' }} data-section="Events">
        <RevealSection className="section-header">
          <div className="label section-label">// Upcoming Events</div>
          <h2 className="section-title">Experience the <em>Night Sky</em></h2>
        </RevealSection>
        <RevealSection delay={80}>
          <div className="home-events-grid">
            {HARDCODED_EVENTS.slice(0, 3).map((ev, i) => (
              <RevealSection key={i} delay={i * 120}>
                <div onClick={() => navigate('/events')} style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--r)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.4s var(--ease)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ aspectRatio: '16/10', position: 'relative', overflow: 'hidden' }}>
                    <img src={EVENT_IMAGES[i].src} alt={EVENT_IMAGES[i].alt} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,12,0.35)', zIndex: 1 }} />
                    <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #D4AF37, #F5E6A3, #D4AF37)', color: '#04040c', padding: '10px 12px 8px', textAlign: 'center', lineHeight: 1, zIndex: 2 }}>
                      <div style={{ font: '700 22px "Plus Jakarta Sans"', marginBottom: 2 }}>{ev.day}</div>
                      <div style={{ font: '600 10px "JetBrains Mono"', letterSpacing: '0.08em' }}>{ev.month}</div>
                    </div>
                  </div>
                  <div style={{ padding: '28px 24px' }}>
                    <div style={{ font: '400 10px "JetBrains Mono"', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 12 }}>{ev.cat}</div>
                    <h3 style={{ font: '500 20px/1.3 "Playfair Display", serif', color: 'var(--text)', margin: '0 0 10px' }}>{ev.title}</h3>
                    <p style={{ font: '300 17px/1.7 "Plus Jakarta Sans"', color: 'var(--text2)', margin: '0 0 16px' }}>{ev.desc}</p>
                    <div style={{ font: '400 11px "JetBrains Mono"', color: 'var(--muted)', letterSpacing: '0.04em' }}>{ev.meta}</div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button className="btn-ghost" onClick={() => navigate('/events')}>View All Events →</button>
        </div>
      </section>

      <SectionSep />

      {/* ═══ 8 — ENDORSEMENTS ═══ */}
      <section className="section" style={{ background: 'var(--bg)' }} data-section="Endorsements">
        <RevealSection className="section-header">
          <div className="label section-label">// Endorsements</div>
          <h2 className="section-title">Backed by Arizona's <em>Leaders</em></h2>
        </RevealSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="home-endorsements-grid">
          {ENDORSEMENTS.map((e, i) => (
            <RevealSection key={i} delay={i * 80}>
              <div className="endorsement-card">
                <div className="endorsement-accent" />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="endorsement-quote-mark">{'\u201C'}</div>
                  <p className="endorsement-text">{e.quote}</p>
                  <div className="endorsement-divider" />
                  <div className="endorsement-author">
                    <div className="endorsement-initial">{e.name.charAt(0)}</div>
                    <div>
                      <div className="endorsement-name">{e.name}</div>
                      <div className="endorsement-title">{e.title}</div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <SectionSep />

      {/* ═══ 9 — SHOP CATEGORIES ═══ */}
      <section className="section" style={{ background: 'var(--bg)' }} data-section="Products">
        <RevealSection className="section-header">
          <div className="label section-label">// Gift Shop</div>
          <h2 className="section-title">Take the Night Sky <em>Home</em></h2>
        </RevealSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} className="home-shop-cats">
          {['Apparel', 'Kids', 'Outerwear', 'Gifts', 'Tanks'].map((cat, i) => {
            const catItems = PRODUCTS.filter(p => p.category === cat);
            const heroImg = catItems.find(p => p.images?.[0] && !(p.title || '').toLowerCase().includes('infant'))?.images?.[0] || catItems[0]?.images?.[0];
            return (
              <RevealSection key={cat} delay={i * 80}>
                <button onClick={() => navigate(`/shop?cat=${cat}`)} style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--r)', padding: 0,
                  cursor: 'pointer', overflow: 'hidden', transition: 'all 0.4s var(--ease)', textAlign: 'center',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ height: 180, background: '#eae7e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {heroImg && <img src={heroImg} alt={cat} loading="lazy" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
                  </div>
                  <div style={{ padding: '16px 12px 20px' }}>
                    <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{cat}</div>
                    <div style={{ font: '400 12px "JetBrains Mono", monospace', color: 'var(--gold)', letterSpacing: '0.08em' }}>{catItems.length} items</div>
                  </div>
                </button>
              </RevealSection>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button className="btn-ghost" onClick={() => navigate('/shop')}>Shop All →</button>
        </div>
      </section>

      <SectionSep />

      {/* ═══ 10 — MEMBERSHIP ═══ */}
      <section className="section" data-section="Membership" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%), var(--bg)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <img src="/images/darksky/milky-way.jpg" alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,12,0.5)', zIndex: 0, pointerEvents: 'none' }} />
        <RevealSection>
          <div className="label section-label" style={{ marginBottom: 24 }}>// Membership</div>
          <h2 className="section-title" style={{ marginBottom: 20 }}>Join the <em>Observatory</em></h2>
          <p className="section-subtitle" style={{ font: '300 16px/1.8 "Plus Jakarta Sans"', color: 'var(--text2)', maxWidth: 520, margin: '0 auto 40px' }}>
            Members enjoy exclusive discounts, early access to limited releases, and invitations to private stargazing events under the Sonoran sky.
          </p>
          <button className="btn-primary" style={{ animation: 'breatheGlow 3s ease-in-out infinite' }} onClick={() => navigate('/membership')}>Explore Membership Tiers</button>
        </RevealSection>
      </section>

      <SectionSep />

      {/* ═══ 11 — FUNDRAISING PROGRESS ═══ */}
      <section className="section" style={{ background: 'var(--bg)', textAlign: 'center' }} data-section="Fundraising">
        <RevealSection>
          <div className="label section-label" style={{ marginBottom: 16 }}>// Support the Mission</div>
          <h2 className="section-title" style={{ marginBottom: 32 }}>Help Us Reach Our <em>Goal</em></h2>
          <div style={{ ...goldGrad, font: '400 clamp(40px, 6vw, 64px) "Playfair Display", serif', fontStyle: 'italic', marginBottom: 4 }}>${(raised / 1e6).toFixed(1)}M raised</div>
          <p style={{ font: '300 16px "Plus Jakarta Sans"', color: 'var(--text2)', marginBottom: 24 }}>of our ${(goal / 1e6).toFixed(0)}M goal</p>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', maxWidth: 500, margin: '0 auto 32px' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #F5E6A3, #D4AF37)', borderRadius: 4, transition: 'width 1.5s ease' }} />
          </div>
          <button className="btn-primary" style={{ animation: 'breatheGlow 3s ease-in-out infinite' }} onClick={() => navigate('/donate')}>Donate Now</button>
          <p style={{ font: '300 12px/1.6 "Plus Jakarta Sans"', color: 'var(--muted)', maxWidth: 400, margin: '20px auto 0' }}>
            The International Dark Sky Discovery Center is a 501(c)(3) nonprofit. Every gift is tax-deductible.
          </p>
        </RevealSection>
      </section>

      {/* ═══ STYLES ═══ */}
      <style>{`
        .hero { position: relative; overflow: hidden; }
        .hero-video-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; transition: opacity 1.2s ease; }
        .hero-video-overlay { position: absolute; inset: 0; background: rgba(4,4,12,0.6); z-index: 1; }
        .hero-gradient { z-index: 2; }
        .hero-content { position: relative; z-index: 3; }
        .vid-divider { position: relative; height: 400px; overflow: hidden; }
        .vid-divider-clip { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .vid-divider-video { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
        .vid-divider-overlay-top { position: absolute; top: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to bottom, var(--bg, #04040c), transparent); z-index: 2; pointer-events: none; }
        .vid-divider-overlay-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to top, var(--bg, #04040c), transparent); z-index: 2; pointer-events: none; }
        .vid-divider-content { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 3; text-align: center; padding: 0 24px; }
        .vid-divider-box { padding: 24px 48px; }
        .vid-divider-title { font: 400 clamp(32px, 5vw, 52px)/1.1 'Playfair Display', serif; font-style: italic; color: #FFFFFF; margin: 0 0 12px; text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.8), 0 8px 40px rgba(0,0,0,0.6), 0 0 80px rgba(0,0,0,0.4); }
        .vid-divider-sub { font: 300 clamp(14px, 2vw, 18px)/1.6 'Plus Jakarta Sans', sans-serif; color: rgba(255,255,255,0.9); margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5); }
        @media (max-width: 1100px) {
          .home-facility-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .home-endorsements-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .home-shop-cats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .vid-divider { height: 250px; }
          .vid-divider-overlay-top, .vid-divider-overlay-bottom { height: 80px; }
          .vid-divider-clip { inset: 0; }
          .vid-divider-video { height: 100%; }
          .home-facility-grid { grid-template-columns: 1fr !important; }
          .home-facts-grid { grid-template-columns: 1fr !important; }
          .home-facts-grid > div > div { border-right: none !important; border-bottom: 1px solid var(--border); }
          .home-facts-grid > div:last-child > div { border-bottom: none; }
          .home-endorsements-grid { grid-template-columns: 1fr !important; }
          .home-shop-cats { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* Endorsement Cards */
        .endorsement-card {
          position: relative;
          background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(212,175,55,0.12);
          border-radius: 12px;
          padding: 36px 32px 32px;
          min-height: 240px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.4s var(--ease);
        }
        .endorsement-card:hover {
          border-color: rgba(212,175,55,0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(212,175,55,0.08), 0 0 0 1px rgba(212,175,55,0.1);
        }
        .endorsement-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.5;
        }
        .endorsement-card:hover .endorsement-accent {
          opacity: 1;
          height: 3px;
        }
        .endorsement-quote-mark {
          font: 400 56px/1 'Playfair Display', serif;
          color: var(--gold);
          opacity: 0.25;
          margin: -8px 0 4px -4px;
          pointer-events: none;
        }
        .endorsement-text {
          font: 300 15px/1.8 'Plus Jakarta Sans', sans-serif;
          color: rgba(240,237,230,0.75);
          font-style: italic;
          flex: 1;
          margin: 0 0 24px;
        }
        .endorsement-divider {
          width: 32px;
          height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin-bottom: 20px;
          opacity: 0.4;
          transition: width 0.4s var(--ease), opacity 0.4s;
        }
        .endorsement-card:hover .endorsement-divider {
          width: 56px;
          opacity: 0.7;
        }
        .endorsement-author {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .endorsement-initial {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08));
          border: 1px solid rgba(212,175,55,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font: 600 14px 'Plus Jakarta Sans', sans-serif;
          color: var(--gold);
          flex-shrink: 0;
        }
        .endorsement-name {
          font: 600 14px 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
          margin-bottom: 2px;
        }
        .endorsement-title {
          font: 400 11px 'JetBrains Mono', monospace;
          color: var(--gold);
          letter-spacing: 0.04em;
          opacity: 0.7;
        }
        @media (max-width: 768px) {
          .endorsement-card { padding: 28px 24px 24px; min-height: auto; }
          .endorsement-text { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
