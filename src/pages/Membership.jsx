import { useState, useEffect, useRef } from 'react';
import { addMember, isMember } from '../admin/data/store';

const TIERS = [
  {
    name: 'Stargazer',
    price: '$18',
    period: 'per year',
    desc: 'Start your journey under the dark skies. Perfect for regular visitors and astronomy enthusiasts.',
    benefits: [
      'Unlimited visits to the Discovery Center',
      '10% gift shop discount',
      'Monthly dark sky newsletter',
      'Invitation to member events',
    ],
    featured: false,
  },
  {
    name: 'Explorer',
    price: '$45',
    period: 'per year',
    desc: 'For the dedicated sky-watcher who wants the full dark sky experience.',
    benefits: [
      'Everything in Stargazer, plus:',
      'Free planetarium shows',
      '15% gift shop discount',
      'Early access to special events',
      '2 guest passes per year',
    ],
    featured: true,
    badge: 'Most Popular',
  },
  {
    name: 'Guardian',
    price: '$120',
    period: 'per year',
    desc: 'For those who want to protect the night sky for future generations.',
    benefits: [
      'Everything in Explorer, plus:',
      'Private star parties',
      '20% gift shop discount',
      'Behind-the-scenes facility tours',
      'Name on the donor wall',
      'Exclusive Guardian-only merch',
    ],
    featured: false,
  },
];

const PERKS = [
  { icon: '✦', title: 'Unlimited Visits', desc: 'Come as often as you\'d like. All membership tiers include unlimited admission to the International Dark Sky Discovery Center year-round.' },
  { icon: '✦', title: 'Exclusive Events', desc: 'Private star parties, planetarium shows, meteor shower viewings, and guided astronomy sessions -- experiences you won\'t find anywhere else.' },
  { icon: '✦', title: 'Gift Shop Discounts', desc: 'Save 10-20% on every purchase in the gift shop and online store. Your membership pays for itself in just a few visits.' },
  { icon: '✦', title: 'Preserve the Night Sky', desc: 'Your membership directly funds dark sky preservation, light pollution advocacy, and STEM education for the next generation of astronomers.' },
];

const FAQS = [
  { q: 'When does my membership start?', a: 'Your membership begins immediately upon purchase. You\'ll receive a welcome email with your digital membership card and discount code within minutes.' },
  { q: 'Can I upgrade my tier later?', a: 'Absolutely. You can upgrade at any time and we\'ll prorate the difference for the remainder of your membership year. Just contact us at hello@idarksky.org.' },
  { q: 'How do guest passes work?', a: 'Explorer and Guardian members receive guest passes each year. Each pass admits one guest for a full day, including all exhibits. Passes reset on your membership anniversary.' },
  { q: 'Are memberships tax-deductible?', a: 'Yes, a portion of your membership is tax-deductible as the Dark Sky Discovery Center is a 501(c)(3) non-profit organization. You\'ll receive a receipt detailing the deductible amount.' },
  { q: 'Can I gift a membership?', a: 'Gift memberships are available for all tiers. The recipient will receive a beautifully designed digital welcome kit -- perfect for the stargazer in your life.' },
  { q: 'What\'s the cancellation policy?', a: 'Memberships are annual. You can cancel auto-renewal at any time and continue to enjoy benefits through the end of your membership period. We don\'t offer partial refunds.' },
];

function useReveal(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('vis'); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '24px 0', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', gap: 16,
        }}
      >
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--text)' }}>{q}</span>
        <span style={{
          color: 'var(--gold)', fontSize: 18, flexShrink: 0,
          transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s',
        }}>+</span>
      </button>
      <div style={{
        maxHeight: open ? 200 : 0, overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(.16,1,.3,1)',
      }}>
        <p style={{ font: '300 14px/1.8 DM Sans', color: 'var(--muted)', paddingBottom: 24 }}>{a}</p>
      </div>
    </div>
  );
}

function JoinModal({ tier, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState(tier?.name || 'Explorer');
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
    setError('');

    // Check if already a member
    if (isMember(email)) {
      setAlreadyMember(true);
      return;
    }

    setJoining(true);
    setTimeout(() => {
      addMember({ name: name.trim(), email, tier: selectedTier });
      setJoining(false);
      setSuccess(true);
    }, 1000);
  };

  const tierInfo = TIERS.find(t => t.name === selectedTier);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(4,4,12,0.8)',
        zIndex: 300, animation: 'memFadeIn 0.2s',
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 460, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto',
        background: '#0a0a18', border: '1px solid rgba(201,169,74,0.2)', zIndex: 301,
        animation: 'memPop 0.3s cubic-bezier(.16,1,.3,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ font: '500 16px Playfair Display, serif', color: 'var(--text)' }}>
            {success ? "You're a Member!" : alreadyMember ? 'Already a Member' : 'Join Dark Sky'}
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
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>✦</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
                Welcome to Dark Sky!
              </h3>
              <p style={{ font: '300 14px/1.7 DM Sans', color: 'var(--muted)', marginBottom: 16 }}>
                You're now a <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{selectedTier}</span> member.
              </p>
              <div style={{
                background: 'rgba(201,169,74,0.06)', border: '1px solid rgba(201,169,74,0.15)',
                padding: 20, textAlign: 'left', marginBottom: 20,
              }}>
                <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Your Benefits</div>
                {tierInfo && tierInfo.benefits.map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', font: '300 13px DM Sans', color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--gold)', fontSize: 8 }}>✦</span>
                    {b}
                  </div>
                ))}
              </div>
              <p style={{ font: '300 12px DM Sans', color: 'var(--muted)', marginBottom: 20 }}>
                Confirmation sent to {email}
              </p>
              <button onClick={onClose} className="btn-primary">Done</button>
            </div>
          ) : alreadyMember ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(201,169,74,0.1)', color: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>✦</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
                Already a Member!
              </h3>
              <p style={{ font: '300 14px/1.7 DM Sans', color: 'var(--muted)', marginBottom: 20 }}>
                The email <span style={{ color: 'var(--gold)' }}>{email}</span> is already associated with an active membership. If you need to update your account, contact us at hello@idarksky.org.
              </p>
              <button onClick={onClose} className="btn-primary">Got It</button>
            </div>
          ) : (
            <>
              {/* Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
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

              {/* Tier selection */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                  Membership Tier
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {TIERS.map(t => (
                    <button
                      key={t.name}
                      onClick={() => setSelectedTier(t.name)}
                      style={{
                        flex: 1, padding: '12px 8px', textAlign: 'center',
                        background: selectedTier === t.name ? 'rgba(201,169,74,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${selectedTier === t.name ? 'rgba(201,169,74,0.4)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ font: '500 13px DM Sans', color: selectedTier === t.name ? 'var(--gold)' : 'var(--text)', marginBottom: 2 }}>
                        {t.name}
                      </div>
                      <div style={{ font: '600 14px DM Sans', color: selectedTier === t.name ? 'var(--gold)' : 'var(--muted)' }}>
                        {t.price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ font: '400 12px DM Sans', color: '#ef4444', marginBottom: 12 }}>{error}</div>
              )}

              <button
                onClick={handleJoin}
                disabled={joining}
                style={{
                  width: '100%', padding: 16,
                  background: joining ? 'rgba(201,169,74,0.3)' : 'var(--gold)',
                  color: '#04040c', border: 'none', borderRadius: 'var(--r, 3px)',
                  font: '600 12px JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
                  cursor: joining ? 'not-allowed' : 'pointer', transition: 'all 0.35s',
                }}
              >
                {joining ? 'Joining...' : `Join as ${selectedTier}`}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes memFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes memPop {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default function Membership() {
  const perksRef = useRef(null);
  useReveal(perksRef);
  const [joinModal, setJoinModal] = useState(null);

  return (
    <div>
      {/* Hero */}
      <div className="mem-hero" style={{ paddingBottom: 80 }}>
        <div className="label" style={{ marginBottom: 20 }}>// Membership</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 400, marginBottom: 20, lineHeight: 1.05 }}>
          More Than a <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Membership</em>
        </h1>
        <p style={{ font: '300 18px/1.8 DM Sans', color: 'var(--muted)', maxWidth: 560, margin: '0 auto' }}>
          Join a community dedicated to preserving the wonder of the night sky.
          Your membership supports dark sky education, conservation, and gives you
          exclusive access to the cosmos.
        </p>
        <div style={{ marginTop: 48, display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['300+', 'Members'],
            ['4', 'Events / Month'],
            ['10-20%', 'Store Savings'],
            ['100%', 'Dark Sky Impact'],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--gold)', marginBottom: 4, fontStyle: 'italic' }}>{num}</div>
              <div style={{ font: '400 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tiers */}
      <div className="mem-tiers">
        {TIERS.map(tier => (
          <div key={tier.name} className={`mem-tier ${tier.featured ? 'featured' : ''}`}>
            {tier.badge && <div className="mem-tier-badge">{tier.badge}</div>}
            <div className="mem-tier-name">{tier.name}</div>
            <div className="mem-tier-price">{tier.price}</div>
            <div className="mem-tier-period">{tier.period}</div>
            <p style={{ font: '300 13px/1.7 DM Sans', color: 'var(--muted)', marginBottom: 24 }}>{tier.desc}</p>
            <div className="mem-tier-divider" />
            {tier.benefits.map((b, i) => (
              <div key={b} className="mem-benefit" style={i === 0 && b.startsWith('Everything') ? { fontWeight: 500, color: 'var(--gold)', fontSize: 12, letterSpacing: '0.02em' } : {}}>
                <span className="mem-benefit-icon">{i === 0 && b.startsWith('Everything') ? '\u2191' : '✦'}</span>
                <span>{b}</span>
              </div>
            ))}
            <button
              className={`mem-btn ${tier.featured ? 'mem-btn-gold' : 'mem-btn-ghost'}`}
              onClick={() => setJoinModal(tier)}
            >
              Join Now -- {tier.price}/yr
            </button>
          </div>
        ))}
      </div>

      {/* Why Join */}
      <div className="mem-perks">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="label" style={{ marginBottom: 16 }}>// Why Join</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.1 }}>
            Benefits of <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Membership</em>
          </h2>
        </div>
        <div ref={perksRef} className="mem-perks-grid reveal">
          {PERKS.map(perk => (
            <div key={perk.title} className="mem-perk">
              <div className="mem-perk-icon" style={{ color: 'var(--gold)' }}>{perk.icon}</div>
              <div className="mem-perk-title">{perk.title}</div>
              <p className="mem-perk-desc">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 16 }}>// Common Questions</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 400 }}>
              Frequently Asked <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Questions</em>
            </h2>
          </div>
          {FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
        </div>
      </section>

      {/* CTA */}
      <div className="mission">
        <div className="label" style={{ marginBottom: 24 }}>// Protect the Night</div>
        <blockquote className="mission-quote">
          "The nitrogen in our DNA, the calcium in our teeth, the iron in our blood --
          <em>were made in the interiors of collapsing stars.</em>"
        </blockquote>
        <div className="mission-attr" style={{ marginBottom: 40 }}>// Carl Sagan</div>
        <button className="btn-primary" style={{ marginRight: 16 }} onClick={() => setJoinModal(TIERS[1])}>Join as Explorer -- $45/yr</button>
        <button className="btn-ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Compare All Tiers</button>
      </div>

      {/* Join Modal */}
      {joinModal && <JoinModal tier={joinModal} onClose={() => setJoinModal(null)} />}
    </div>
  );
}
