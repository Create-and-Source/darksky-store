import { useEffect, useRef } from 'react';

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

const TEAM = [
  { name: 'Saleem', role: 'Director', initials: 'S', color: 'rgba(201,169,74,0.15)' },
  { name: 'Tovah', role: 'Gift Shop Manager', initials: 'T', color: 'rgba(139,92,246,0.15)' },
  { name: 'Nancy', role: 'Events Coordinator', initials: 'N', color: 'rgba(34,211,238,0.15)' },
  { name: 'Josie', role: 'Gift Shop Associate', initials: 'J', color: 'rgba(251,146,60,0.15)' },
];

export default function About() {
  const heroRef = useReveal();
  const missionRef = useReveal();
  const teamRef = useReveal();
  const visionRef = useReveal();
  const locationRef = useReveal();

  return (
    <div>
      {/* Hero */}
      <div style={{
        position: 'relative', padding: '120px 64px 100px', textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(201,169,74,0.06) 0%, transparent 60%)',
        overflow: 'hidden', minHeight: 420, borderBottom: '1px solid var(--border)',
      }} className="about-hero">
        <div ref={heroRef} className="reveal" style={{ position: 'relative', zIndex: 2 }}>
          <div className="label" style={{ marginBottom: 20 }}>// About Us</div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 400, lineHeight: 0.95, marginBottom: 24, letterSpacing: '-0.02em',
          }}>
            About the<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Discovery Center</em>
          </h1>
          <p style={{
            font: '300 18px/1.8 DM Sans', color: 'var(--muted)',
            maxWidth: 560, margin: '0 auto 36px',
          }}>
            A world-class facility dedicated to celebrating, studying, and preserving the night sky for future generations.
          </p>

          {/* Opening badge */}
          <div style={{
            display: 'inline-block', padding: '14px 36px',
            background: 'rgba(201,169,74,0.08)', border: '1px solid rgba(201,169,74,0.3)',
            animation: 'aboutPulse 3s ease-in-out infinite',
          }}>
            <span style={{ font: '600 11px JetBrains Mono', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Opening Fall 2026
            </span>
          </div>
        </div>

        {/* Decorative stars */}
        {[...Array(25)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: Math.random() > 0.85 ? 2 : 1,
            height: Math.random() > 0.85 ? 2 : 1,
            background: Math.random() > 0.7 ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
            borderRadius: '50%',
            opacity: 0.3 + Math.random() * 0.5,
            animation: `aboutTwinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Mission */}
      <section className="section">
        <div ref={missionRef} className="reveal" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 16 }}>// Our Mission</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.15 }}>
              Preserving the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Night Sky</em>
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48,
            alignItems: 'start',
          }} className="about-mission-grid">
            <div>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)', marginBottom: 20 }}>
                The International Dark Sky Discovery Center is a nonprofit institution located in the heart of the Sonoran Desert, Arizona -- one of the last remaining regions in North America with truly pristine dark skies.
              </p>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)' }}>
                Our mission is to inspire wonder, advance scientific understanding, and protect the natural darkness that is essential to both human health and ecological balance. Through immersive exhibits, educational programs, and community engagement, we connect people with the cosmos.
              </p>
            </div>
            <div>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)', marginBottom: 20 }}>
                Light pollution affects more than 80% of the world's population. We believe that access to the night sky is a fundamental right -- one that enriches our culture, inspires scientific discovery, and reminds us of our place in the universe.
              </p>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)' }}>
                Every visit, every membership, and every purchase at our gift shop directly supports dark sky preservation, light pollution advocacy, and STEM education for the next generation of astronomers and environmental stewards.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 0, marginTop: 56,
            borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
          }}>
            {[
              ['40,000+', 'Sq Ft Facility'],
              ['16"', 'Research Telescope'],
              ['K-12', 'Education Programs'],
              ['501(c)(3)', 'Nonprofit Status'],
            ].map(([num, label]) => (
              <div key={label} style={{
                flex: 1, padding: '32px 24px', textAlign: 'center',
                borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--gold)', fontStyle: 'italic', marginBottom: 6 }}>{num}</div>
                <div style={{ font: '400 10px JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{
        padding: '100px 64px',
        background: 'var(--bg2, #09091f)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }} className="about-team-section">
        <div ref={teamRef} className="reveal" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="label" style={{ marginBottom: 16 }}>// Our Team</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.1 }}>
              The People Behind <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Dark Sky</em>
            </h2>
            <p style={{ font: '300 15px/1.7 DM Sans', color: 'var(--muted)', maxWidth: 480, margin: '16px auto 0' }}>
              A small, passionate team dedicated to bringing the cosmos closer to everyone.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
            borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
          }} className="about-team-grid">
            {TEAM.map(person => (
              <div key={person.name} style={{
                padding: '48px 32px', textAlign: 'center',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,74,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: person.color, border: '1px solid rgba(201,169,74,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  font: '400 28px Playfair Display, serif', fontStyle: 'italic',
                  color: 'var(--gold)',
                }}>
                  {person.initials}
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>
                  {person.name}
                </div>
                <div style={{ font: '400 11px JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  {person.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section">
        <div ref={locationRef} className="reveal" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 16 }}>// Location</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.1 }}>
              Sonoran <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Desert</em>, Arizona
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
            border: '1px solid var(--border)',
          }} className="about-location-grid">
            {/* Map placeholder */}
            <div style={{
              padding: '64px 48px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              background: 'rgba(201,169,74,0.02)',
              borderRight: '1px solid var(--border)',
              position: 'relative',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(201,169,74,0.1)', border: '1px solid rgba(201,169,74,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
                Sonoran Desert Observatory
              </div>
              <div style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>
                Southern Arizona, USA
              </div>
              <div style={{ font: '300 12px DM Sans', color: '#5a5550', marginTop: 4 }}>
                Bortle Class 1 Dark Sky
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '48px' }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Hours</div>
                <p style={{ font: '400 14px/1.8 DM Sans', color: 'var(--text)' }}>
                  Wednesday -- Sunday<br />
                  6:00 PM -- 11:00 PM
                </p>
              </div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Contact</div>
                <p style={{ font: '400 14px/1.8 DM Sans', color: 'var(--text)' }}>
                  hello@idarksky.org<br />
                  (520) 555-0142
                </p>
              </div>
              <div>
                <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Admission</div>
                <p style={{ font: '400 14px/1.8 DM Sans', color: 'var(--text)' }}>
                  Adults: $15<br />
                  Children (6-17): $8<br />
                  Members: Free
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section style={{
        padding: '100px 64px',
        background: 'var(--bg2, #09091f)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }} className="about-vision-section">
        <div ref={visionRef} className="reveal" style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div className="label" style={{ marginBottom: 16 }}>// Our Vision</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.15, marginBottom: 32 }}>
            A World Where Everyone Can See the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Stars</em>
          </h2>
          <p style={{ font: '300 16px/1.9 DM Sans', color: 'var(--muted)', marginBottom: 24 }}>
            We envision a future where dark sky preservation is woven into urban planning, environmental policy, and public consciousness. Where children grow up knowing the Milky Way not from photographs, but from their own backyards.
          </p>
          <p style={{ font: '300 16px/1.9 DM Sans', color: 'var(--muted)', marginBottom: 32 }}>
            Through partnerships with the International Dark-Sky Association, local communities, and educational institutions, we are working to reclaim the night -- one sky at a time.
          </p>

          <div style={{
            padding: '32px 40px',
            border: '1px solid rgba(201,169,74,0.2)',
            background: 'rgba(201,169,74,0.03)',
          }}>
            <blockquote style={{
              fontFamily: 'Playfair Display, serif', fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 400, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.5,
              margin: 0,
            }}>
              "The cosmos is within us. We are made of <span style={{ color: 'var(--gold)' }}>star-stuff</span>. We are a way for the universe to know itself."
            </blockquote>
            <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 16 }}>
              // Carl Sagan
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="mission">
        <div className="label" style={{ marginBottom: 24 }}>// Join the Movement</div>
        <blockquote className="mission-quote" style={{ fontSize: 'clamp(22px, 3vw, 40px)' }}>
          Support dark sky preservation. <em>Become a member today.</em>
        </blockquote>
        <div style={{ marginTop: 32 }}>
          <a href="/membership" className="btn-primary" style={{ textDecoration: 'none', marginRight: 16 }}>Become a Member</a>
          <a href="/contact" className="btn-ghost" style={{ textDecoration: 'none' }}>Get in Touch</a>
        </div>
      </div>

      <style>{`
        @keyframes aboutTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes aboutPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,74,0); }
          50% { box-shadow: 0 0 20px 4px rgba(201,169,74,0.08); }
        }
        @media (max-width: 860px) {
          .about-hero { padding: 80px 24px 64px !important; min-height: auto !important; }
          .about-mission-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .about-team-section { padding: 64px 24px !important; }
          .about-team-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .about-location-grid { grid-template-columns: 1fr !important; }
          .about-location-grid > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); }
          .about-vision-section { padding: 64px 24px !important; }
        }
        @media (max-width: 560px) {
          .about-team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
