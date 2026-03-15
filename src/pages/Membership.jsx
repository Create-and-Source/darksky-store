import { useEffect, useRef, useState } from 'react';
import { getMembers, addMember } from '../admin/data/store';

const goldGradientStyle = {
  background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const TIERS = [
  {
    name: 'Explorer',
    price: '$49',
    period: 'per year',
    desc: 'For the curious stargazer beginning their journey.',
    benefits: [
      '10% discount on all store purchases',
      'Monthly dark sky newsletter',
      'Digital star map of the Sonoran sky',
      'Invitation to 2 public stargazing events',
      'Member-only product announcements',
    ],
    featured: false,
  },
  {
    name: 'Observer',
    price: '$99',
    period: 'per year',
    desc: 'For dedicated astronomers who want more of the night sky.',
    benefits: [
      '15% discount on all store purchases',
      'Free shipping on all orders',
      'Quarterly exclusive merchandise drops',
      'Invitation to 6 stargazing events + 1 private',
      'Name in the Observatory\'s Star Registry',
      'Early access to limited edition releases',
    ],
    featured: true,
    badge: 'Most Popular',
  },
  {
    name: 'Patron',
    price: '$249',
    period: 'per year',
    desc: 'For those who want to give back to the night sky.',
    benefits: [
      '20% discount on all store purchases',
      'Free expedited shipping on all orders',
      'Complimentary annual gift ($75 value)',
      'Unlimited private stargazing events',
      'Named dedication in the observatory',
      'VIP access to all special events',
      'Quarterly call with Dark Sky team',
    ],
    featured: false,
  },
];

const PERKS = [
  { icon: '✦', title: 'Exclusive Discounts', desc: 'Members enjoy year-round savings on the entire collection, from apparel to fine art prints.' },
  { icon: '✦', title: 'Stargazing Events', desc: 'Private and public events under the darkest skies in Arizona, guided by astronomers.' },
  { icon: '✦', title: 'Early Access', desc: 'First look at new arrivals, limited editions, and seasonal drops before the public.' },
  { icon: '✦', title: 'Dark Sky Impact', desc: 'Your membership funds light pollution reduction advocacy and science education programs.' },
];

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

export default function Membership() {
  const [selectedTier, setSelectedTier] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [, setTick] = useState(0);

  const memberCount = getMembers().length;
  const stats = [`${memberCount}+ Members`, '4 Events/Month', '10-20% Savings'];

  const handleJoin = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    addMember({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), tier: selectedTier.name });
    setSubmitted(true);
    setTick(t => t + 1);
    setTimeout(() => { setSelectedTier(null); setSubmitted(false); setForm({ name: '', email: '', phone: '' }); }, 2500);
  };

  return (
    <div data-page="membership">
      {/* Hero */}
      <div className="mem-hero" data-section="Hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="/images/darksky/andromeda.jpg"
          alt="Andromeda galaxy stretching across the night sky"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, zIndex: 0, pointerEvents: 'none' }}
        />
        <div className="label" style={{ marginBottom: 20, position: 'relative', zIndex: 1 }} data-editable="mem-hero-label">// Membership</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 400, marginBottom: 20, lineHeight: 1.05, position: 'relative', zIndex: 1 }} data-editable="mem-hero-title">
          Join the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Observatory</em>
        </h1>
        <p style={{ font: '300 18px/1.7 "Plus Jakarta Sans"', color: 'var(--text2)', maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }} data-editable="mem-hero-subtitle">
          Become part of a community dedicated to preserving the night sky. Members enjoy exclusive discounts, private events, and early access to our rarest pieces.
        </p>
        <div style={{ marginTop: 40, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {stats.map(stat => (
            <div key={stat} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, marginBottom: 4, fontStyle: 'italic', ...goldGradientStyle }}>{stat.split(' ')[0]}</div>
              <div style={{ font: '400 11px JetBrains Mono', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>{stat.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tiers */}
      <RevealSection>
        <div className="mem-tiers" data-section="Tiers">
          {TIERS.map((tier, i) => (
            <RevealSection key={tier.name} delay={i * 120}>
              <div className={`mem-tier ${tier.featured ? 'featured' : ''}`}>
                {tier.badge && <div className="mem-tier-badge">{tier.badge}</div>}
                <div className="mem-tier-name" data-editable={`mem-tier-name-${i}`}>{tier.name}</div>
                <div className="mem-tier-price" data-editable={`mem-tier-price-${i}`} style={{ ...goldGradientStyle, fontSize: 36 }}>{tier.price}</div>
                <div className="mem-tier-period" data-editable={`mem-tier-period-${i}`}>{tier.period}</div>
                <p data-editable={`mem-tier-desc-${i}`} style={{ font: '300 13px/1.7 "Plus Jakarta Sans"', color: 'var(--text2)', marginBottom: 24 }}>{tier.desc}</p>
                <div className="mem-tier-divider" />
                {tier.benefits.map(b => (
                  <div key={b} className="mem-benefit">
                    <span className="mem-benefit-icon">✦</span>
                    <span style={{ fontWeight: 300 }}>{b}</span>
                  </div>
                ))}
                <button
                  onClick={() => { setSelectedTier(tier); setSubmitted(false); setForm({ name: '', email: '', phone: '' }); }}
                  className={`mem-btn ${tier.featured ? 'mem-btn-gold' : 'mem-btn-ghost'}`}
                  style={tier.featured ? {
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
                    backgroundSize: '200% 200%',
                    border: '1px solid transparent',
                  } : undefined}
                >
                  Join as {tier.name}
                </button>
              </div>
            </RevealSection>
          ))}
        </div>
      </RevealSection>

      {/* Perks */}
      <RevealSection>
        <div className="mem-perks" data-section="Perks">
          <div className="label" style={{ marginBottom: 16 }} data-editable="mem-perks-label">// Member Benefits</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.1 }} data-editable="mem-perks-title">
            Why Join the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Dark Sky Family</em>
          </h2>
          <div className="mem-perks-grid">
            {PERKS.map((perk, i) => (
              <RevealSection key={perk.title} delay={i * 100}>
                <div className="mem-perk">
                  <div className="mem-perk-icon">{perk.icon}</div>
                  <div className="mem-perk-title" data-editable={`mem-perk-title-${i}`}>{perk.title}</div>
                  <p className="mem-perk-desc" data-editable={`mem-perk-desc-${i}`} style={{ fontWeight: 300, lineHeight: 1.7 }}>{perk.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* FAQ */}
      <RevealSection>
        <section className="section" data-section="FAQ" style={{ borderTop: '1px solid var(--border)', maxWidth: 800, margin: '0 auto' }}>
          <div className="label" style={{ marginBottom: 20 }} data-editable="mem-faq-label">// Common Questions</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 400, marginBottom: 48 }} data-editable="mem-faq-title">
            Frequently Asked <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Questions</em>
          </h2>
          {[
            { q: 'When does my membership start?', a: 'Membership begins immediately upon purchase. You\'ll receive a welcome email with your member benefits and discount code within minutes.' },
            { q: 'Can I upgrade my membership tier?', a: 'Yes. You can upgrade at any time and we\'ll prorate the difference. Contact us at info@darkskycenter.org to make the switch.' },
            { q: 'Are memberships tax-deductible?', a: 'A portion of your membership may be tax-deductible as the Dark Sky Discovery Center is a 501(c)(3) non-profit. We\'ll provide a receipt detailing the deductible amount.' },
            { q: 'Do memberships make great gifts?', a: 'Absolutely. Gift memberships are available and include a beautiful digital certificate — perfect for the stargazer in your life.' },
          ].map(({ q, a }) => (
            <div key={q} style={{
              padding: '28px 24px',
              marginBottom: 12,
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 'var(--r)',
              transition: 'border-color 0.3s',
            }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, marginBottom: 12 }}>{q}</div>
              <p style={{ font: '300 14px/1.8 "Plus Jakarta Sans"', color: 'var(--text2)' }}>{a}</p>
            </div>
          ))}
        </section>
      </RevealSection>

      {/* CTA */}
      <div className="mission" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="/images/darksky/milky-way.jpg"
          alt="Milky Way stretching across the dark desert sky"
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }}
        />
        <div className="label" data-editable="mem-cta-label" style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>// Join Us</div>
        <blockquote className="mission-quote" data-editable="mem-cta-quote" style={{ position: 'relative', zIndex: 1 }}>
          "The universe is under no obligation to make sense to you.<br/>
          <em>We are.</em>"
        </blockquote>
        <div className="mission-attr" data-editable="mem-cta-attr" style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>// Neil deGrasse Tyson</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button className="btn-primary" onClick={() => { setSelectedTier(TIERS[0]); setSubmitted(false); setForm({ name: '', email: '', phone: '' }); }} style={{ marginRight: 16, animation: 'breatheGlow 3s ease-in-out infinite' }}>Join as Explorer — $49/yr</button>
          <button className="btn-ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>View All Tiers</button>
        </div>
      </div>

      {/* Join Modal */}
      {selectedTier && (
        <>
          <div onClick={() => { if (!submitted) { setSelectedTier(null); } }} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'var(--bg, #04040c)', border: '1px solid var(--border)',
            borderRadius: 'var(--r, 3px)', padding: 36, width: 420, maxWidth: '90vw', zIndex: 1001,
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--gold)' }}>✦</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
                  Welcome to the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{selectedTier.name}</em> family!
                </h3>
                <p style={{ font: '300 14px "Plus Jakarta Sans"', color: 'var(--text2)' }}>
                  A confirmation has been sent to {form.email}.
                </p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, fontStyle: 'italic', color: 'var(--gold)', marginBottom: 4 }}>{selectedTier.name}</div>
                  <div style={{ font: '600 28px "Plus Jakarta Sans"', ...goldGradientStyle }}>{selectedTier.price}</div>
                  <div style={{ font: '300 13px "Plus Jakarta Sans"', color: 'var(--text2)' }}>{selectedTier.period}</div>
                </div>
                <form onSubmit={handleJoin}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Name *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" required
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(10,10,26,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--r, 3px)', font: '400 14px "Plus Jakarta Sans"', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Email *</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(10,10,26,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--r, 3px)', font: '400 14px "Plus Jakarta Sans"', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Phone <span style={{ opacity: 0.4 }}>(optional)</span></label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000"
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(10,10,26,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--r, 3px)', font: '400 14px "Plus Jakarta Sans"', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setSelectedTier(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1, opacity: (!form.name.trim() || !form.email.trim()) ? 0.5 : 1 }}>
                      Join — {selectedTier.price}/yr
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
