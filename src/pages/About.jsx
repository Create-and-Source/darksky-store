import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditableText, SectionWrapper } from '../components/EditMode';

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
  { name: 'Kari Carlisle', role: 'Executive Director', initials: 'KC', color: 'rgba(201,169,74,0.15)' },
  { name: 'Dr. Dania Wright', role: 'Education Director', initials: 'DW', color: 'rgba(139,92,246,0.15)' },
  { name: 'Michael Weber', role: 'Visitor Services Manager', initials: 'MW', color: 'rgba(34,211,238,0.15)' },
  { name: 'Joe Bill', role: 'Board President', initials: 'JB', color: 'rgba(251,146,60,0.15)' },
];

const COMPONENTS = [
  {
    name: 'Dark Sky Observatory',
    desc: 'Home to the largest telescope in Greater Phoenix — a 27.5-inch PlaneWave CDK700. Research-grade optics for public viewing, citizen science, and university partnerships.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/>
        <path d="M2 12h20"/>
      </svg>
    ),
  },
  {
    name: 'Hyperspace Planetarium',
    desc: '65-seat immersive dome theater with a 39-foot diameter. Full-dome digital projection for astronomy shows, live sky tours, and educational programming.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    name: 'Inspiration Theater',
    desc: '150-seat multi-use space for lectures, film screenings, community events, and visiting speakers from NASA, ASU, and international research institutions.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    name: 'Night Sky Experience',
    desc: '3,300 sq ft interactive exhibit hall exploring light pollution, celestial navigation, the electromagnetic spectrum, and humanity\'s relationship with the cosmos.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>
    ),
  },
];

const PARTNERS = [
  'Arizona State University',
  'Town of Fountain Hills',
  'McCarthy Building Companies',
  'SWABACK Architecture',
  'State of Arizona',
];

export default function About() {
  const navigate = useNavigate();
  const heroRef = useReveal();
  const storyRef = useReveal();
  const componentsRef = useReveal();
  const pillarsRef = useReveal();
  const teamRef = useReveal();
  const communityRef = useReveal();
  const partnersRef = useReveal();
  const supportRef = useReveal();

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
          <EditableText textKey="about-hero-title" defaultText="About the<br /><em style='font-style:italic;color:var(--gold)'>Discovery Center</em>" tag="h1" style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 400, lineHeight: 0.95, marginBottom: 24, letterSpacing: '-0.02em',
          }} />
          <EditableText textKey="about-hero-sub" defaultText="A 501(c)(3) nonprofit dedicated to establishing and operating a world-class STEM education center in Fountain Hills, Arizona." tag="p" style={{
            font: '300 18px/1.8 DM Sans', color: 'var(--muted)',
            maxWidth: 560, margin: '0 auto 36px',
          }} />

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

      {/* Our Story */}
      <section className="section">
        <div ref={storyRef} className="reveal" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 16 }}>// Our Story</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.15 }}>
              From Dark Skies to <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Discovery</em>
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48,
            alignItems: 'start',
          }} className="about-mission-grid">
            <div>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)', marginBottom: 20 }}>
                It started with a simple question from passionate Fountain Hills residents: "How can we protect the unique dark skies we have here?" That question sparked a movement that would transform a small Arizona community into a world-class destination for astronomy and science education.
              </p>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)' }}>
                In January 2018, Fountain Hills was certified as the world's 17th International Dark Sky Community — a recognition of the town's exceptional night skies and commitment to preserving them for future generations.
              </p>
            </div>
            <div>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)', marginBottom: 20 }}>
                Ground was broken on April 8, 2024 — during a total solar eclipse — marking the beginning of construction on a 22,000-square-foot facility that will house an observatory, planetarium, theater, and interactive exhibit hall.
              </p>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)' }}>
                When it opens in Fall 2026, the International Dark Sky Discovery Center will be the premier dark sky destination in the American Southwest, with 5 million people living within a 30-minute drive.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 0, marginTop: 56,
            borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
          }}>
            {[
              ['22,000', 'Sq Ft Facility'],
              ['27.5"', 'PlaneWave CDK700'],
              ['65', 'Seat Planetarium'],
              ['501(c)(3)', 'Nonprofit'],
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

      {/* Four Components */}
      <section style={{
        padding: '100px 64px',
        background: 'var(--bg2, #09091f)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }} className="about-team-section">
        <div ref={componentsRef} className="reveal" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="label" style={{ marginBottom: 16 }}>// The Facility</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.1 }}>
              Four Worlds of <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Discovery</em>
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0,
            borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
          }} className="about-team-grid">
            {COMPONENTS.map(comp => (
              <div key={comp.name} style={{
                padding: '40px 32px',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,74,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(201,169,74,0.08)', border: '1px solid rgba(201,169,74,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  {comp.icon}
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 400, color: 'var(--text)', marginBottom: 10 }}>
                  {comp.name}
                </div>
                <p style={{ font: '300 13px/1.75 DM Sans', color: 'var(--muted)' }}>
                  {comp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="section">
        <div ref={pillarsRef} className="reveal" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="label" style={{ marginBottom: 16 }}>// Our Mission</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.15 }}>
              Three <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Pillars</em>
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
            borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
          }} className="about-pillars-grid">
            {[
              {
                title: 'Astronomy Education',
                desc: 'K-12 STEM programs, university partnerships with ASU, public lectures, planetarium shows, and hands-on workshops that connect people of all ages with the cosmos.',
                num: '01',
              },
              {
                title: 'Research',
                desc: 'The 27.5-inch PlaneWave CDK700 — the largest telescope in Greater Phoenix — enables citizen science, university research, and real astronomical discovery.',
                num: '02',
              },
              {
                title: 'Dark Sky Preservation',
                desc: 'Advocating for responsible lighting policies that protect human health, wildlife habitats, and the sustainability of our night environment for future generations.',
                num: '03',
              },
            ].map(pillar => (
              <div key={pillar.title} style={{
                padding: '48px 32px',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,74,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ font: '600 10px JetBrains Mono', letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: 20 }}>
                  {pillar.num}
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 14 }}>
                  {pillar.title}
                </div>
                <p style={{ font: '300 14px/1.8 DM Sans', color: 'var(--muted)' }}>
                  {pillar.desc}
                </p>
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
            <div className="label" style={{ marginBottom: 16 }}>// Leadership</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.1 }}>
              The People Behind <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Dark Sky</em>
            </h2>
            <p style={{ font: '300 15px/1.7 DM Sans', color: 'var(--muted)', maxWidth: 480, margin: '16px auto 0' }}>
              A dedicated team building the premier dark sky destination in the American Southwest.
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
                  font: '400 24px Playfair Display, serif', fontStyle: 'italic',
                  color: 'var(--gold)',
                }}>
                  {person.initials}
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>
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

      {/* Community */}
      <section className="section">
        <div ref={communityRef} className="reveal" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 16 }}>// Community</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.15 }}>
              A Community of <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Stargazers</em>
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48,
          }} className="about-mission-grid">
            <div>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)', marginBottom: 20 }}>
                The Fountain Hills astronomy club has grown to over 600 members, making it one of the most active astronomy communities in Arizona. One founding member donated three telescopes to the local library — an initiative that won a national award for community outreach.
              </p>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)' }}>
                Fountain Hills is one of only 13 dark sky communities featured in the Smithsonian's "Lights Out" exhibit, recognizing communities worldwide that are leading the way in dark sky preservation.
              </p>
            </div>
            <div>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)', marginBottom: 20 }}>
                With 5 million people living within a 30-minute drive, the Discovery Center will serve as a gateway to astronomy for one of the fastest-growing metropolitan areas in the United States.
              </p>
              <p style={{ font: '300 15px/1.9 DM Sans', color: 'var(--muted)' }}>
                Our gift shop — both online and on-site — supports this mission directly. Every purchase funds dark sky preservation programs, STEM education initiatives, and the operation of our research-grade observatory.
              </p>
            </div>
          </div>

          {/* Community stats */}
          <div style={{
            display: 'flex', gap: 0, marginTop: 56,
            borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
          }}>
            {[
              ['600+', 'Club Members'],
              ['17th', 'Dark Sky Community'],
              ['5M', 'People Nearby'],
              ['2026', 'Opening Year'],
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

      {/* Partners */}
      <section style={{
        padding: '80px 64px',
        background: 'var(--bg2, #09091f)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div ref={partnersRef} className="reveal" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="label" style={{ marginBottom: 16 }}>// Our Partners</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 400, marginBottom: 40 }}>
            Building Together
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            {PARTNERS.map(p => (
              <div key={p} style={{
                padding: '14px 28px',
                border: '1px solid var(--border)',
                font: '400 13px DM Sans', color: 'var(--muted)',
                transition: 'border-color 0.3s, color 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,74,0.3)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Us */}
      <section className="section">
        <div ref={supportRef} className="reveal" style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div className="label" style={{ marginBottom: 16 }}>// Support Us</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.15, marginBottom: 20 }}>
            Help Us Preserve the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Night Sky</em>
          </h2>
          <p style={{ font: '300 16px/1.9 DM Sans', color: 'var(--muted)', marginBottom: 32, maxWidth: 520, margin: '0 auto 32px' }}>
            The IDSDC is a 501(c)(3) nonprofit. Your donation directly funds dark sky preservation, STEM education, and the construction of a world-class observatory and planetarium in Fountain Hills, Arizona.
          </p>
          <div style={{
            padding: '32px 40px',
            border: '1px solid rgba(201,169,74,0.2)',
            background: 'rgba(201,169,74,0.03)',
            marginBottom: 36,
          }}>
            <blockquote style={{
              fontFamily: 'Playfair Display, serif', fontSize: 'clamp(18px, 2vw, 24px)',
              fontWeight: 400, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.5,
              margin: 0,
            }}>
              "My hope is that the IDSDC will be an Arizona icon known around the world as a place that enables sky watchers of all ages to learn more about the <span style={{ color: 'var(--gold)' }}>observable universe</span>."
            </blockquote>
            <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 16 }}>
              // Joe Bill, Board President
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/membership')}>Become a Member</button>
            <button className="btn-ghost" onClick={() => navigate('/contact')}>Get in Touch</button>
          </div>
        </div>
      </section>

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
          .about-pillars-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .about-team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
