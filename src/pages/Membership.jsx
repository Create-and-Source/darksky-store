import { useEffect, useRef } from 'react';

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

export default function Membership() {
  const perksRef = useRef(null);
  useReveal(perksRef);

  return (
    <div>
      {/* Hero */}
      <div className="mem-hero">
        <div className="label" style={{ marginBottom: 20 }}>// Membership</div>
        <h1 className="mem-hero h1" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 400, marginBottom: 20, lineHeight: 1.05 }}>
          Join the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Observatory</em>
        </h1>
        <p style={{ font: '300 18px/1.8 DM Sans', color: 'var(--muted)', maxWidth: 520, margin: '0 auto' }}>
          Become part of a community dedicated to preserving the night sky. Members enjoy exclusive discounts, private events, and early access to our rarest pieces.
        </p>
        <div style={{ marginTop: 40, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['300+ Members', '4 Events/Month', '10–20% Savings'].map(stat => (
            <div key={stat} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--gold)', marginBottom: 4, fontStyle: 'italic' }}>{stat.split(' ')[0]}</div>
              <div style={{ font: '400 11px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>{stat.split(' ').slice(1).join(' ')}</div>
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
            {tier.benefits.map(b => (
              <div key={b} className="mem-benefit">
                <span className="mem-benefit-icon">✦</span>
                <span>{b}</span>
              </div>
            ))}
            <button className={`mem-btn ${tier.featured ? 'mem-btn-gold' : 'mem-btn-ghost'}`}>
              Join as {tier.name}
            </button>
          </div>
        ))}
      </div>

      {/* Perks */}
      <div className="mem-perks">
        <div className="label" style={{ marginBottom: 16 }}>// Member Benefits</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.1 }}>
          Why Join the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Dark Sky Family</em>
        </h2>
        <div ref={perksRef} className="mem-perks-grid reveal">
          {PERKS.map(perk => (
            <div key={perk.title} className="mem-perk">
              <div className="mem-perk-icon">{perk.icon}</div>
              <div className="mem-perk-title">{perk.title}</div>
              <p className="mem-perk-desc">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <section className="section" style={{ borderTop: '1px solid var(--border)', maxWidth: 800, margin: '0 auto' }}>
        <div className="label" style={{ marginBottom: 20 }}>// Common Questions</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 400, marginBottom: 48 }}>
          Frequently Asked <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Questions</em>
        </h2>
        {[
          { q: 'When does my membership start?', a: 'Membership begins immediately upon purchase. You\'ll receive a welcome email with your member benefits and discount code within minutes.' },
          { q: 'Can I upgrade my membership tier?', a: 'Yes. You can upgrade at any time and we\'ll prorate the difference. Contact us at hello@idarksky.org to make the switch.' },
          { q: 'Are memberships tax-deductible?', a: 'A portion of your membership may be tax-deductible as the Dark Sky Discovery Center is a 501(c)(3) non-profit. We\'ll provide a receipt detailing the deductible amount.' },
          { q: 'Do memberships make great gifts?', a: 'Absolutely. Gift memberships are available and include a beautiful digital certificate — perfect for the stargazer in your life.' },
        ].map(({ q, a }) => (
          <div key={q} style={{ padding: '28px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, marginBottom: 12 }}>{q}</div>
            <p style={{ font: '300 14px/1.8 DM Sans', color: 'var(--muted)' }}>{a}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <div className="mission">
        <div className="label" style={{ marginBottom: 24 }}>// Join Us</div>
        <blockquote className="mission-quote">
          "The universe is under no obligation to make sense to you.<br/>
          <em>We are.</em>"
        </blockquote>
        <div className="mission-attr" style={{ marginBottom: 40 }}>// Neil deGrasse Tyson</div>
        <button className="btn-primary" style={{ marginRight: 16 }}>Join as Explorer — $49/yr</button>
        <button className="btn-ghost">View All Tiers</button>
      </div>
    </div>
  );
}
