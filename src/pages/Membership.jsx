import { useEffect, useRef, useState } from 'react';
import { getMembers } from '../admin/data/store';

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
  { icon: '🌟', title: 'Exclusive Discounts', desc: 'Members enjoy year-round savings on the entire collection, from apparel to fine art prints.' },
  { icon: '🔭', title: 'Stargazing Events', desc: 'Private and public events under the darkest skies in Arizona, guided by astronomers.' },
  { icon: '📦', title: 'Early Access', desc: 'First look at new arrivals, limited editions, and seasonal drops before the public.' },
  { icon: '🌙', title: 'Dark Sky Impact', desc: 'Your membership funds light pollution reduction advocacy and science education programs.' },
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
  const memberCount = getMembers().length;
  const stats = [`${memberCount}+ Members`, '4 Events/Month', '10-20% Savings'];

  return (
    <div>
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
        <div className="mem-tiers">
          {TIERS.map((tier, i) => (
            <RevealSection key={tier.name} delay={i * 120}>
              <div className={`mem-tier ${tier.featured ? 'featured' : ''}`}>
                {tier.badge && <div className="mem-tier-badge">{tier.badge}</div>}
                <div className="mem-tier-name">{tier.name}</div>
                <div className="mem-tier-price" style={{ ...goldGradientStyle, fontSize: 36 }}>{tier.price}</div>
                <div className="mem-tier-period">{tier.period}</div>
                <p style={{ font: '300 13px/1.7 "Plus Jakarta Sans"', color: 'var(--text2)', marginBottom: 24 }}>{tier.desc}</p>
                <div className="mem-tier-divider" />
                {tier.benefits.map(b => (
                  <div key={b} className="mem-benefit">
                    <span className="mem-benefit-icon">✦</span>
                    <span style={{ fontWeight: 300 }}>{b}</span>
                  </div>
                ))}
                <button
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
                  <div className="mem-perk-title">{perk.title}</div>
                  <p className="mem-perk-desc" style={{ fontWeight: 300, lineHeight: 1.7 }}>{perk.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* FAQ */}
      <RevealSection>
        <section className="section" style={{ borderTop: '1px solid var(--border)', maxWidth: 800, margin: '0 auto' }}>
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
        <div className="label" style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>// Join Us</div>
        <blockquote className="mission-quote" style={{ position: 'relative', zIndex: 1 }}>
          "The universe is under no obligation to make sense to you.<br/>
          <em>We are.</em>"
        </blockquote>
        <div className="mission-attr" style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>// Neil deGrasse Tyson</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button className="btn-primary" style={{ marginRight: 16, animation: 'breatheGlow 3s ease-in-out infinite' }}>Join as Explorer — $49/yr</button>
          <button className="btn-ghost">View All Tiers</button>
        </div>
      </div>
    </div>
  );
}
