import { useState, useEffect, useRef } from 'react';
import { addInquiry } from '../admin/data/store';

/* -- REVEAL HOOK -- */
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

/* -- FAQ ACCORDION -- */
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
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: 'var(--text)' }}>{q}</span>
        <span style={{
          color: 'var(--gold)', fontSize: 18, flexShrink: 0,
          transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s',
        }}>+</span>
      </button>
      <div style={{
        maxHeight: open ? 300 : 0, overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(.16,1,.3,1)',
      }}>
        <p style={{ font: '300 14px/1.8 DM Sans', color: 'var(--muted)', paddingBottom: 24 }}>{a}</p>
      </div>
    </div>
  );
}

/* -- DATA -- */
const INCLUDES = [
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
    title: 'Planetarium Show',
    desc: 'A 30-minute immersive show in our full-dome theater. Curriculum-aligned content available for all grade levels -- solar system, constellations, space exploration, and more.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    title: 'Guided Exhibits',
    desc: 'Docent-led tours through interactive exhibits on light pollution, nocturnal ecosystems, astronomical instruments, and Indigenous sky knowledge. Hands-on stations at every stop.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    title: 'Outdoor Activities',
    desc: 'Weather permitting, students participate in sundial building, solar telescope viewing, nature walks identifying desert ecology, and sky observation with analog instruments.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    title: 'Take-Home Materials',
    desc: 'Every student receives a printed activity packet, star chart, and dark sky pledge card. Teachers receive a digital resource kit with lesson extensions aligned to NGSS and state standards.',
  },
];

const PROGRAMS = [
  {
    name: 'Half Day',
    duration: '2 Hours',
    price: '$12',
    unit: 'per student',
    groupSize: '10-60 students',
    featured: false,
    items: [
      'Planetarium show (30 min)',
      '1 guided exhibit tour',
      'Activity packet for each student',
      'Teacher resource kit',
    ],
    note: 'Ideal for a focused morning or afternoon visit. Perfect for younger students or schools with limited travel time.',
  },
  {
    name: 'Full Day',
    duration: '4 Hours',
    price: '$20',
    unit: 'per student',
    groupSize: '10-120 students',
    featured: true,
    badge: 'Most Popular',
    items: [
      'Planetarium show (30 min)',
      'All guided exhibit tours',
      'Outdoor activity session',
      'Lunch break (bring your own or pre-order)',
      'Activity packet + star chart',
      'Teacher resource kit + lesson extensions',
    ],
    note: 'Our most popular option. A complete STEM day out of the classroom with time for outdoor exploration and discovery.',
  },
  {
    name: 'Overnight Camp',
    duration: 'Coming Soon',
    price: 'TBD',
    unit: '',
    groupSize: '20-40 students',
    featured: false,
    comingSoon: true,
    items: [
      'Full day program included',
      'Evening star party with telescopes',
      'Campfire storytelling & sky myths',
      'Sunrise desert hike',
      'Overnight accommodations',
    ],
    note: 'An immersive overnight experience under the darkest skies in Arizona. Interested? Contact us for early details.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Our 4th graders talked about this trip for weeks. The planetarium show connected perfectly to our solar system unit, and the hands-on activities kept every student engaged. Already booking again for next year.',
    author: 'Mrs. Rodriguez',
    school: '4th Grade, Coconino Elementary',
  },
  {
    quote: 'As a science teacher, I\'m always looking for field trips that go beyond entertainment. Dark Sky delivered real learning -- my students came back with genuine questions about astronomy that drove our next unit.',
    author: 'Mr. Chen',
    school: '7th Grade Science, Flagstaff Middle School',
  },
  {
    quote: 'The staff was incredibly organized and accommodating. They adjusted the content for our mixed-age group and even provided sensory-friendly options for students who needed them. Truly inclusive.',
    author: 'Dr. Patel',
    school: 'Special Education Coordinator, Prescott USD',
  },
];

const FAQS = [
  { q: 'How far in advance should we book?', a: 'We recommend booking at least 4-6 weeks in advance, especially for spring dates which fill quickly. Fall availability is generally more open. We can sometimes accommodate shorter notice requests -- contact us and we\'ll do our best.' },
  { q: 'What is the chaperone-to-student ratio?', a: 'We require a minimum of 1 adult chaperone per 10 students. Chaperones are admitted free of charge. Additional chaperones beyond the minimum are also free. Teachers and aides are always free.' },
  { q: 'Is lunch available?', a: 'For full-day programs, we have a covered outdoor lunch area where students can eat packed lunches. We also partner with a local catering service for pre-ordered boxed lunches ($8/student). Lunch orders must be placed at least 1 week before your visit.' },
  { q: 'Is the facility wheelchair accessible?', a: 'Yes. All indoor exhibits, the planetarium, and restrooms are fully ADA accessible. Outdoor activity areas include paved paths. We can provide sensory-friendly accommodations, sign language interpreters, or large-print materials with advance notice.' },
  { q: 'Where do buses park?', a: 'We have a dedicated bus parking lot that accommodates up to 6 full-size school buses. Bus drivers receive a complimentary coffee and pastry voucher for our cafe. The parking lot is a 1-minute walk from the main entrance.' },
  { q: 'Do you align with state science standards?', a: 'Absolutely. All programs are aligned with Arizona Science Standards and the Next Generation Science Standards (NGSS). We provide teachers with a standards alignment document upon booking so you can integrate the visit into your curriculum.' },
];

const GRADE_LEVELS = [
  'K-2nd Grade',
  '3rd-5th Grade',
  '6th-8th Grade',
  '9th-12th Grade',
  'Mixed / Multi-grade',
];

/* -- COMPONENT -- */
export default function FieldTrips() {
  const [form, setForm] = useState({
    school: '', contact: '', email: '', phone: '',
    grade: '', students: '', date: '', program: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const heroRef = useReveal();
  const includesRef = useReveal();
  const testimonialsRef = useReveal();

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (attempted) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.school.trim()) errs.school = 'School name is required';
    if (!form.contact.trim()) errs.contact = 'Contact person is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.grade) errs.grade = 'Grade level is required';
    if (!form.students) errs.students = 'Number of students is required';
    else if (parseInt(form.students) < 10) errs.students = 'Minimum 10 students';
    if (!form.program) errs.program = 'Please select a program';
    return errs;
  };

  const isValid = form.school && form.contact && form.email && form.grade && form.students && form.program;

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttempted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      addInquiry({
        type: 'field-trip',
        school: form.school,
        contact: form.contact,
        email: form.email,
        phone: form.phone,
        grade: form.grade,
        students: form.students,
        preferredDate: form.date,
        program: form.program,
        notes: form.notes,
      });
      setSubmitting(false);
      setSubmitted(true);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    }, 1000);
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(13,13,34,0.7)', border: '1px solid var(--border2, rgba(255,255,255,0.06))',
    borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)',
    outline: 'none', transition: 'border-color 0.2s',
  };
  const inputErrorStyle = {
    ...inputStyle,
    borderColor: 'rgba(239,68,68,0.6)',
  };
  const labelStyle = {
    display: 'block', font: '500 10px JetBrains Mono',
    letterSpacing: '0.15em', textTransform: 'uppercase',
    color: 'var(--muted)', marginBottom: 8,
  };
  const selectStyle = {
    ...inputStyle, cursor: 'pointer', appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%236b6880\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36,
  };
  const selectErrorStyle = {
    ...selectStyle,
    borderColor: 'rgba(239,68,68,0.6)',
  };
  const errorTextStyle = {
    font: '400 11px DM Sans', color: '#ef4444', marginTop: 4,
  };

  return (
    <div>
      {/* Success Toast */}
      {successToast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          padding: '14px 28px', background: 'rgba(74,222,128,0.15)',
          border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80',
          font: '500 13px DM Sans', zIndex: 500,
          animation: 'ftToast 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>&#10003;</span>
          Inquiry submitted successfully!
        </div>
      )}

      {/* Hero */}
      <div style={{
        position: 'relative', padding: '120px 64px 100px', textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(201,169,74,0.05) 0%, transparent 60%)',
        borderBottom: '1px solid var(--border)',
      }} className="ft-hero">
        <div ref={heroRef} className="reveal" style={{ position: 'relative', zIndex: 2 }}>
          <div className="label" style={{ marginBottom: 20 }}>// Education Programs</div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 400, lineHeight: 1, marginBottom: 24, letterSpacing: '-0.02em',
          }}>
            Inspiring the Next <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Generation</em>
          </h1>
          <p style={{
            font: '300 18px/1.8 DM Sans', color: 'var(--muted)',
            maxWidth: 580, margin: '0 auto 40px',
          }}>
            STEM-aligned programs for K-12 students under the darkest skies near a major American city.
          </p>
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              ['2,400+', 'Students / Year'],
              ['K-12', 'Grade Levels'],
              ['NGSS', 'Standards Aligned'],
              ['4.9\u2605', 'Teacher Rating'],
            ].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--gold)', fontStyle: 'italic', marginBottom: 4 }}>{num}</div>
                <div style={{ font: '400 10px JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What's Included */}
      <section className="section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="label" style={{ marginBottom: 16 }}>// What's Included</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.1 }}>
            A Complete <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Learning Experience</em>
          </h2>
        </div>
        <div ref={includesRef} className="reveal ft-includes-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
        }}>
          {INCLUDES.map(item => (
            <div key={item.title} style={{
              padding: '40px 32px',
              borderRight: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              transition: 'background 0.3s',
            }}
            className="ft-include-card"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,74,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ marginBottom: 20 }}>{item.icon}</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, fontWeight: 400, marginBottom: 12, color: 'var(--text)' }}>{item.title}</h3>
              <p style={{ font: '300 13px/1.75 DM Sans', color: 'var(--muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Program Tiers */}
      <section style={{
        padding: '100px 64px',
        background: 'var(--bg2, #09091f)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }} className="ft-programs-section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="label" style={{ marginBottom: 16 }}>// Programs</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.1 }}>
            Choose Your <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Program</em>
          </h2>
          <p style={{ font: '300 15px/1.7 DM Sans', color: 'var(--muted)', maxWidth: 480, margin: '16px auto 0' }}>
            Flexible options for every schedule and group size.
          </p>
        </div>

        <div className="mem-tiers" style={{ padding: 0 }}>
          {PROGRAMS.map(prog => (
            <div key={prog.name} className={`mem-tier ${prog.featured ? 'featured' : ''}`}
              style={prog.comingSoon ? { opacity: 0.7 } : {}}
            >
              {prog.badge && <div className="mem-tier-badge">{prog.badge}</div>}
              <div style={{
                font: '600 10px/1 JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: 8,
              }}>{prog.duration}</div>
              <div className="mem-tier-name">{prog.name}</div>
              {prog.comingSoon ? (
                <div style={{ font: '400 16px/1 DM Sans', color: 'var(--muted)', marginBottom: 4 }}>Coming Soon</div>
              ) : (
                <>
                  <div className="mem-tier-price">{prog.price}</div>
                  <div className="mem-tier-period">{prog.unit}</div>
                </>
              )}
              <div style={{ font: '300 12px/1 DM Sans', color: 'var(--muted)', marginBottom: 24 }}>
                Groups of {prog.groupSize}
              </div>
              <div className="mem-tier-divider" />
              {prog.items.map(item => (
                <div key={item} className="mem-benefit">
                  <span className="mem-benefit-icon">✦</span>
                  <span>{item}</span>
                </div>
              ))}
              <p style={{ font: '300 12px/1.65 DM Sans', color: 'var(--muted)', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {prog.note}
              </p>
              {prog.comingSoon ? (
                <a href="#inquiry" className="mem-btn mem-btn-ghost" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 24 }}>
                  Contact Us
                </a>
              ) : (
                <a href="#inquiry" className={`mem-btn ${prog.featured ? 'mem-btn-gold' : 'mem-btn-ghost'}`}
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 24 }}>
                  Book This Program
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="label" style={{ marginBottom: 16 }}>// What Teachers Say</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.1 }}>
            Trusted by <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Educators</em>
          </h2>
        </div>

        <div ref={testimonialsRef} className="reveal ft-testimonials-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
        }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              padding: '40px 32px',
              borderRight: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ color: 'var(--gold)', fontSize: 32, fontFamily: 'Playfair Display, serif', marginBottom: 16, lineHeight: 1 }}>"</div>
              <p style={{ font: '300 14px/1.8 DM Sans', color: 'var(--muted)', flex: 1, marginBottom: 24 }}>
                {t.quote}
              </p>
              <div>
                <div style={{ font: '500 14px/1 DM Sans', color: 'var(--text)', marginBottom: 4 }}>{t.author}</div>
                <div style={{ font: '400 12px/1 DM Sans', color: 'var(--gold)' }}>{t.school}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Inquiry Form */}
      <section id="inquiry" style={{
        padding: '100px 64px',
        background: 'var(--bg2, #09091f)',
        borderTop: '1px solid var(--border)',
      }} className="ft-inquiry-section">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 16 }}>// Book a Visit</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 12 }}>
              Booking <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Inquiry</em>
            </h2>
            <p style={{ font: '300 15px/1.7 DM Sans', color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
              Fill out the form below and our education coordinator will respond within 2 business days with available dates and a customized proposal.
            </p>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 20px',
              }}>&#10003;</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 400, marginBottom: 12 }}>
                Inquiry Submitted
              </h3>
              <p style={{ font: '300 15px/1.7 DM Sans', color: 'var(--muted)', maxWidth: 420, margin: '0 auto 32px' }}>
                Thank you, {form.contact}! Our education coordinator will review your request and respond to {form.email} within 2 business days.
              </p>
              <button
                className="btn-ghost"
                onClick={() => { setSubmitted(false); setAttempted(false); setErrors({}); setForm({ school: '', contact: '', email: '', phone: '', grade: '', students: '', date: '', program: '', notes: '' }); }}
              >Submit Another Inquiry</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{
                background: 'rgba(13,13,34,0.5)', border: '1px solid var(--border)',
                padding: '40px 36px', marginBottom: 24,
              }} className="ft-form-card">
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 400, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  School Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="ft-form-grid">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>School Name *</label>
                    <input style={errors.school ? inputErrorStyle : inputStyle} placeholder="e.g. Flagstaff Elementary" value={form.school} onChange={set('school')} />
                    {errors.school && <div style={errorTextStyle}>{errors.school}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Contact Person *</label>
                    <input style={errors.contact ? inputErrorStyle : inputStyle} placeholder="Teacher or coordinator name" value={form.contact} onChange={set('contact')} />
                    {errors.contact && <div style={errorTextStyle}>{errors.contact}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input style={errors.email ? inputErrorStyle : inputStyle} type="email" placeholder="you@school.edu" value={form.email} onChange={set('email')} />
                    {errors.email && <div style={errorTextStyle}>{errors.email}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input style={inputStyle} type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Grade Level *</label>
                    <select style={errors.grade ? selectErrorStyle : selectStyle} value={form.grade} onChange={set('grade')}>
                      <option value="">Select grade level</option>
                      {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {errors.grade && <div style={errorTextStyle}>{errors.grade}</div>}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(13,13,34,0.5)', border: '1px solid var(--border)',
                padding: '40px 36px', marginBottom: 24,
              }} className="ft-form-card">
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 400, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  Trip Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="ft-form-grid">
                  <div>
                    <label style={labelStyle}>Number of Students *</label>
                    <input style={errors.students ? inputErrorStyle : inputStyle} type="number" min="10" max="120" placeholder="e.g. 45" value={form.students} onChange={set('students')} />
                    {errors.students && <div style={errorTextStyle}>{errors.students}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Preferred Date</label>
                    <input style={inputStyle} type="date" value={form.date} onChange={set('date')} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Program *</label>
                    <select style={errors.program ? selectErrorStyle : selectStyle} value={form.program} onChange={set('program')}>
                      <option value="">Select a program</option>
                      <option value="half-day">Half Day -- 2 Hours ($12/student)</option>
                      <option value="full-day">Full Day -- 4 Hours ($20/student)</option>
                      <option value="overnight">Overnight Camp -- Contact for Details</option>
                    </select>
                    {errors.program && <div style={errorTextStyle}>{errors.program}</div>}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Special Needs or Notes</label>
                    <textarea
                      style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.6 }}
                      placeholder="Accessibility requirements, dietary needs, curriculum focus areas, or any other information that would help us prepare..."
                      value={form.notes}
                      onChange={set('notes')}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: 18,
                  background: !submitting ? 'var(--gold)' : 'rgba(201,169,74,0.3)',
                  color: '#04040c', border: 'none', borderRadius: 'var(--r, 3px)',
                  font: '600 12px/1 JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
                  cursor: !submitting ? 'pointer' : 'not-allowed',
                  transition: 'all 0.35s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
              >
                {submitting && (
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(4,4,12,0.3)',
                    borderTopColor: '#04040c', borderRadius: '50%',
                    display: 'inline-block', animation: 'ftSpin 0.6s linear infinite',
                  }} />
                )}
                {submitting ? 'Submitting...' : 'Submit Booking Inquiry'}
              </button>
              <p style={{ font: '300 11px/1.6 DM Sans', color: 'var(--muted)', textAlign: 'center', marginTop: 12 }}>
                This is an inquiry, not a confirmed booking. Our coordinator will follow up with availability and next steps.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 16 }}>// Planning Your Visit</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 400 }}>
              Frequently Asked <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Questions</em>
            </h2>
          </div>
          {FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
        </div>
      </section>

      {/* CTA */}
      <div className="mission">
        <div className="label" style={{ marginBottom: 24 }}>// Get in Touch</div>
        <blockquote className="mission-quote" style={{ fontSize: 'clamp(22px, 3vw, 40px)' }}>
          Questions? Reach our education coordinator directly at<br />
          <em>education@idarksky.org</em> <span style={{ color: 'var(--muted)' }}>or</span> <em>(928) 555-0142</em>
        </blockquote>
        <div style={{ marginTop: 32 }}>
          <a href="#inquiry" className="btn-primary" style={{ textDecoration: 'none', marginRight: 16 }}>Book a Field Trip</a>
          <button className="btn-ghost">Download Info Packet</button>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @keyframes ftSpin { to { transform: rotate(360deg); } }
        @keyframes ftToast {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .ft-hero { padding: 120px 64px 100px; }
        @media (max-width: 1024px) {
          .ft-include-card, .ft-include-card + .ft-include-card { break-inside: avoid; }
        }
        @media (max-width: 860px) {
          .ft-hero { padding: 80px 24px 60px !important; }
          .ft-programs-section { padding: 64px 24px !important; }
          .ft-inquiry-section { padding: 64px 24px !important; }
          .ft-form-card { padding: 28px 20px !important; }
          .ft-form-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 1024px) {
          .ft-includes, [class*="ft-includes"] { grid-template-columns: repeat(2, 1fr) !important; }
          .ft-testimonials, [class*="ft-testimonials"] { grid-template-columns: 1fr !important; }
        }
        .ft-inquiry-section input:focus,
        .ft-inquiry-section select:focus,
        .ft-inquiry-section textarea:focus {
          border-color: rgba(201,169,74,0.4) !important;
        }
      `}</style>
    </div>
  );
}
