import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDonation, getFundraising, updateFundraising } from '../admin/data/store';

const AMOUNTS = [25, 50, 100, 250, 500, 1000];

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

function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('vis'); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export default function Donate() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', honorOf: '', note: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [donationId, setDonationId] = useState('');

  const fundraising = getFundraising();
  const raised = fundraising.raised / 100;
  const goal = fundraising.goal / 100;
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const fmtM = (v) => `$${(v / 1000000).toFixed(1)}M`;

  const donationAmount = useCustom ? Number(customAmount) || 0 : selectedAmount;

  const handleAmountClick = (amt) => {
    setSelectedAmount(amt);
    setUseCustom(false);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setUseCustom(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || donationAmount < 1) return;

    setSubmitting(true);
    setTimeout(() => {
      const notes = [
        form.honorOf ? `In honor of: ${form.honorOf}` : '',
        form.note || '',
      ].filter(Boolean).join(' — ');

      const donation = addDonation({
        donor: form.name.trim(),
        email: form.email.trim(),
        amount: donationAmount,
        type: 'one-time',
        campaign: 'General',
        date: new Date().toISOString().slice(0, 10),
        taxDeductible: true,
        acknowledged: false,
        notes: notes || 'Online donation',
      });

      // Increment fundraising total
      updateFundraising({ raised: fundraising.raised + donationAmount * 100 });

      setDonationId(donation.id);
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(10,10,26,0.6)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--r, 3px)', font: '400 15px "Plus Jakarta Sans", sans-serif',
    color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  if (submitted) {
    return (
      <div className="donate-conf" style={{ padding: '120px 64px 80px', maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '80vh' }}>
        {/* Falling stars */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          {[...Array(40)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `-${10 + Math.random() * 20}px`,
              width: Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1,
              height: Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1,
              borderRadius: '50%',
              background: Math.random() > 0.5 ? 'var(--gold)' : 'rgba(255,255,255,0.7)',
              animation: `donateFall ${4 + Math.random() * 6}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3 + Math.random() * 0.6,
            }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(74,222,128,0.1)', color: '#4ade80',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 28px',
            animation: 'donatePop 0.5s cubic-bezier(.16,1,.3,1)',
          }}>&#10003;</div>

          <div className="label" style={{ marginBottom: 16 }}>// Donation Received</div>

          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 52px)',
            fontWeight: 400, marginBottom: 12, lineHeight: 1.1,
          }}>
            Thank <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>you</em>, {form.name.split(' ')[0]}!
          </h1>

          <p style={{ font: '300 16px/1.7 "Plus Jakarta Sans", sans-serif', color: 'var(--muted)', marginBottom: 40, maxWidth: 460, margin: '0 auto 40px' }}>
            Your generous gift of <strong style={{ color: 'var(--gold)' }}>${donationAmount.toLocaleString()}</strong> helps protect and celebrate the night sky for future generations.
          </p>

          <div style={{
            display: 'inline-block', padding: '12px 28px',
            background: 'rgba(201,169,74,0.08)', border: '1px solid rgba(201,169,74,0.25)',
            marginBottom: 36,
          }}>
            <span style={{ font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: 12 }}>
              Confirmation
            </span>
            <span style={{ font: '600 20px "Plus Jakarta Sans", sans-serif', color: 'var(--gold)' }}>{donationId}</span>
          </div>

          {form.honorOf && (
            <p style={{ font: '300 18px/1.7 "Plus Jakarta Sans", sans-serif', color: 'var(--text2)', marginBottom: 24 }}>
              Your gift was made in honor of <em style={{ color: 'var(--text)' }}>{form.honorOf}</em>.
            </p>
          )}

          <p style={{ font: '300 17px/1.7 "Plus Jakarta Sans", sans-serif', color: 'var(--muted)', marginBottom: 40 }}>
            A tax receipt will be sent to {form.email}. The International Dark Sky Discovery Center is a 501(c)(3) nonprofit organization.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/')}>Return Home</button>
            <button className="btn-ghost" onClick={() => navigate('/events')}>Explore Events</button>
          </div>
        </div>

        <style>{`
          @keyframes donateFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 0.6; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes donatePop {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div data-page="donate">
      {/* ── HERO ── */}
      <section style={{
        position: 'relative', padding: '160px 64px 100px', textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 50%)',
        overflow: 'hidden',
      }}>
        <img
          src="/images/darksky/milky-way.jpg"
          alt="Milky Way over the Sonoran Desert"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, zIndex: 0, pointerEvents: 'none' }}
        />
        <RevealSection>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="section-label label">// Give</span>
            <h1 className="section-title" style={{ marginBottom: 20 }}>
              Support the <em>Night Sky</em>
            </h1>
            <p className="section-subtitle" style={{ lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
              Your donation funds dark sky education, preservation, and world-class astronomy programs in the Sonoran Desert.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ── FUNDRAISING PROGRESS ── */}
      <RevealSection>
        <div style={{
          maxWidth: 680, margin: '-40px auto 0', position: 'relative', zIndex: 2,
          padding: '32px 36px', textAlign: 'center',
          background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="label" style={{ marginBottom: 12 }}>// Capital Campaign</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{
              fontFamily: 'Playfair Display, serif', fontSize: 36, fontStyle: 'italic', color: 'var(--gold)',
            }}>{fmtM(raised)}</span>
            <span style={{ font: '300 16px "Plus Jakarta Sans", sans-serif', color: 'var(--muted)' }}>
              of {fmtM(goal)} raised
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', maxWidth: 480, margin: '0 auto 8px' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: 'linear-gradient(90deg, #D4AF37, #F5E6A3, #D4AF37)',
              backgroundSize: '200% 100%',
              borderRadius: 3,
              transition: 'width 1.2s cubic-bezier(.16,1,.3,1)',
            }} />
          </div>
          <span style={{ font: '500 12px "JetBrains Mono", monospace', letterSpacing: '0.1em', color: 'var(--gold)', opacity: 0.7 }}>
            {pct}% Complete
          </span>
        </div>
      </RevealSection>

      {/* ── VIDEO DIVIDER ── */}
      <VideoDivider
        src="/videos/darksky/aurora.mp4"
        title="Every Dollar Preserves the Night"
        subtitle="Help us protect one of Earth's most endangered natural resources."
      />

      {/* ── DONATION FORM ── */}
      <section className="section" style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px 120px' }}>
        <RevealSection>
          <form onSubmit={handleSubmit}>
            {/* Amount selection */}
            <div style={{ marginBottom: 36 }}>
              <div className="label" style={{ marginBottom: 16 }}>// Select Amount</div>
              <div className="donate-amounts" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountClick(amt)}
                    style={{
                      padding: '16px 8px',
                      background: !useCustom && selectedAmount === amt ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                      color: !useCustom && selectedAmount === amt ? '#04040c' : 'var(--text)',
                      border: !useCustom && selectedAmount === amt ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 'var(--r, 3px)',
                      font: '600 18px "Plus Jakarta Sans", sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  font: '600 18px "Plus Jakarta Sans", sans-serif', color: useCustom ? 'var(--gold)' : 'var(--muted)',
                  pointerEvents: 'none',
                }}>$</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={handleCustomChange}
                  onFocus={() => setUseCustom(true)}
                  min="1"
                  style={{
                    ...inputStyle,
                    paddingLeft: 32,
                    fontSize: 18,
                    fontWeight: 600,
                    borderColor: useCustom ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)',
                    boxShadow: useCustom ? '0 0 0 3px rgba(212,175,55,0.08)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Donor info */}
            <div style={{ marginBottom: 36 }}>
              <div className="label" style={{ marginBottom: 16 }}>// Your Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                    Name *
                  </label>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    style={inputStyle}
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                    In Honor Of <span style={{ opacity: 0.4 }}>(optional)</span>
                  </label>
                  <input
                    style={inputStyle}
                    value={form.honorOf}
                    onChange={set('honorOf')}
                    placeholder="Dedicate this gift to someone"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', font: '500 10px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                    Note <span style={{ opacity: 0.4 }}>(optional)</span>
                  </label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.6 }}
                    value={form.note}
                    onChange={set('note')}
                    placeholder="Add a personal message..."
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || donationAmount < 1 || !form.name.trim() || !form.email.trim()}
              style={{
                width: '100%', padding: 18,
                background: submitting ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
                backgroundSize: '200% 200%',
                color: '#04040c', border: 'none', borderRadius: 'var(--r, 3px)',
                font: '600 13px "JetBrains Mono", monospace', letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.35s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                animation: !submitting && donationAmount > 0 ? 'breatheGlow 3s ease-in-out infinite' : 'none',
                opacity: (!form.name.trim() || !form.email.trim() || donationAmount < 1) ? 0.5 : 1,
              }}
            >
              {submitting ? 'Processing...' : `Donate $${donationAmount.toLocaleString()}`}
            </button>
          </form>

          {/* 501(c)(3) note */}
          <div style={{
            marginTop: 48, padding: '28px 24px', textAlign: 'center',
            background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.12)',
            borderRadius: 'var(--r, 3px)',
          }}>
            <p style={{ font: '300 13px/1.8 "Plus Jakarta Sans", sans-serif', color: 'var(--muted)', margin: 0 }}>
              Your donation supports dark sky education, preservation, and research. The International Dark Sky Discovery Center is a <strong style={{ color: 'var(--text2)' }}>501(c)(3) nonprofit organization</strong>. All contributions are tax-deductible to the extent allowed by law.
            </p>
          </div>
        </RevealSection>
      </section>

      <style>{`
        @media (max-width: 640px) {
          [data-page="donate"] .section { padding: 48px 16px 80px !important; }
          [data-page="donate"] section:first-child { padding: 120px 24px 60px !important; }
          .donate-conf { padding: 80px 24px 60px !important; }
        }
        @media (max-width: 480px) {
          [data-page="donate"] .donate-amounts { grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; }
          [data-page="donate"] .donate-amounts button { padding: 14px 4px !important; font-size: 16px !important; }
        }
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
      `}</style>
    </div>
  );
}
