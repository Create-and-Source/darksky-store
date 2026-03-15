import { useState, useEffect, useRef } from 'react';
import { addContact } from '../admin/data/store';

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

const SUBJECTS = ['General Inquiry', 'Gift Shop', 'Events & Programs', 'Membership', 'Field Trips & Education', 'Donations & Sponsorship'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const heroRef = useReveal();
  const formRef = useReveal();

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
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.subject) errs.subject = 'Please select a subject';
    if (!form.message.trim()) errs.message = 'Message is required';
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttempted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      addContact({
        name: form.name.trim(),
        email: form.email,
        subject: form.subject,
        message: form.message.trim(),
      });
      setSubmitting(false);
      setSuccess(true);
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
  const errorTextStyle = {
    font: '400 11px DM Sans', color: '#ef4444', marginTop: 4,
  };

  return (
    <div data-page="contact">
      {/* Hero */}
      <div style={{
        position: 'relative', padding: '120px 64px 80px', textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(201,169,74,0.06) 0%, transparent 60%)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }} className="contact-hero">
        <div ref={heroRef} className="reveal" style={{ position: 'relative', zIndex: 2 }}>
          <div className="label" data-editable="contact-hero-label" style={{ marginBottom: 20 }}>// Contact</div>
          <h1 data-editable="contact-hero-title" style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 400, lineHeight: 1, marginBottom: 20, letterSpacing: '-0.02em',
          }}>
            Get in <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Touch</em>
          </h1>
          <p data-editable="contact-hero-subtitle" style={{
            font: '300 17px/1.8 DM Sans', color: 'var(--muted)',
            maxWidth: 480, margin: '0 auto',
          }}>
            Have a question about the Discovery Center, our gift shop, or upcoming events? We'd love to hear from you.
          </p>
        </div>

        {/* Decorative stars */}
        {[...Array(15)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: Math.random() > 0.85 ? 2 : 1,
            height: Math.random() > 0.85 ? 2 : 1,
            background: Math.random() > 0.7 ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
            borderRadius: '50%',
            opacity: 0.3 + Math.random() * 0.5,
            animation: `contactTwinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Main Content */}
      <section className="section">
        <div ref={formRef} className="reveal contact-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0,
          border: '1px solid var(--border)', maxWidth: 1000, margin: '0 auto',
        }}>
          {/* Form */}
          <div style={{ padding: '48px', borderRight: '1px solid var(--border)' }} className="contact-form-side">
            {success ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, margin: '0 auto 20px',
                }}>&#10003;</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 400, marginBottom: 12 }}>
                  Message Sent
                </h3>
                <p style={{ font: '300 15px/1.7 DM Sans', color: 'var(--muted)', maxWidth: 380, margin: '0 auto 32px' }}>
                  Thank you, {form.name}! We'll get back to you at {form.email} as soon as possible.
                </p>
                <button
                  className="btn-ghost"
                  onClick={() => { setSuccess(false); setAttempted(false); setErrors({}); setForm({ name: '', email: '', subject: '', message: '' }); }}
                >Send Another Message</button>
              </div>
            ) : (
              <>
                <div className="label" data-editable="contact-form-label" style={{ marginBottom: 16 }}>// Send a Message</div>
                <h2 data-editable="contact-form-title" style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 400, marginBottom: 32 }}>
                  We'd Love to <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Hear</em> From You
                </h2>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Name</label>
                    <input
                      style={errors.name ? inputErrorStyle : inputStyle}
                      placeholder="Your full name"
                      value={form.name}
                      onChange={set('name')}
                    />
                    {errors.name && <div style={errorTextStyle}>{errors.name}</div>}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      style={errors.email ? inputErrorStyle : inputStyle}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set('email')}
                    />
                    {errors.email && <div style={errorTextStyle}>{errors.email}</div>}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Subject</label>
                    <select
                      style={errors.subject ? { ...selectStyle, borderColor: 'rgba(239,68,68,0.6)' } : selectStyle}
                      value={form.subject}
                      onChange={set('subject')}
                    >
                      <option value="">Select a subject</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.subject && <div style={errorTextStyle}>{errors.subject}</div>}
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Message</label>
                    <textarea
                      style={{ ...(errors.message ? inputErrorStyle : inputStyle), minHeight: 140, resize: 'vertical', lineHeight: 1.6 }}
                      placeholder="Tell us what's on your mind..."
                      value={form.message}
                      onChange={set('message')}
                    />
                    {errors.message && <div style={errorTextStyle}>{errors.message}</div>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: 18,
                      background: !submitting ? 'var(--gold)' : 'rgba(201,169,74,0.3)',
                      color: '#04040c', border: 'none', borderRadius: 'var(--r, 3px)',
                      font: '600 12px JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
                      cursor: !submitting ? 'pointer' : 'not-allowed',
                      transition: 'all 0.35s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}
                  >
                    {submitting && (
                      <span style={{
                        width: 16, height: 16, border: '2px solid rgba(4,4,12,0.3)',
                        borderTopColor: '#04040c', borderRadius: '50%',
                        display: 'inline-block', animation: 'contactSpin 0.6s linear infinite',
                      }} />
                    )}
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Info Side */}
          <div style={{ padding: '48px 36px', background: 'var(--bg2, #09091f)' }} className="contact-info-side">
            <div className="label" data-editable="contact-info-label" style={{ marginBottom: 24 }}>// Contact Info</div>

            {/* Opening Note */}
            <div style={{
              padding: '14px 18px', marginBottom: 28,
              background: 'rgba(201,169,74,0.06)', border: '1px solid rgba(201,169,74,0.2)',
            }}>
              <span style={{ font: '600 9px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Now Open
              </span>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, background: 'rgba(201,169,74,0.08)',
                  border: '1px solid rgba(201,169,74,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>Email</div>
              </div>
              <a href="mailto:info@darkskycenter.org" style={{ font: '400 15px DM Sans', color: 'var(--text)', textDecoration: 'none' }}>
                info@darkskycenter.org
              </a>
            </div>

            {/* Website */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, background: 'rgba(201,169,74,0.08)',
                  border: '1px solid rgba(201,169,74,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/>
                    <path d="M2 12h20"/>
                  </svg>
                </div>
                <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>Website</div>
              </div>
              <span style={{ font: '400 15px DM Sans', color: 'var(--text)' }}>
                darkskycenter.org
              </span>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, background: 'rgba(201,169,74,0.08)',
                  border: '1px solid rgba(201,169,74,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>Location</div>
              </div>
              <span style={{ font: '400 15px/1.6 DM Sans', color: 'var(--text)' }}>
                Fountain Hills, AZ
              </span>
              <div style={{ font: '300 12px/1.6 DM Sans', color: 'var(--muted)', marginTop: 4 }}>
                Town Center area, near Community Center, Library & River of Time Museum
              </div>
            </div>

            {/* Map placeholder */}
            <div style={{
              height: 200, background: 'rgba(13,13,34,0.8)',
              border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Grid lines */}
              {[...Array(6)].map((_, i) => (
                <div key={`h${i}`} style={{
                  position: 'absolute', top: `${(i + 1) * 16.6}%`, left: 0, right: 0,
                  height: 1, background: 'rgba(201,169,74,0.04)',
                }} />
              ))}
              {[...Array(8)].map((_, i) => (
                <div key={`v${i}`} style={{
                  position: 'absolute', left: `${(i + 1) * 12.5}%`, top: 0, bottom: 0,
                  width: 1, background: 'rgba(201,169,74,0.04)',
                }} />
              ))}

              {/* Pin */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(201,169,74,0.15)', border: '1px solid rgba(201,169,74,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 8, animation: 'contactBounce 2s ease-in-out infinite',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div style={{ font: '500 11px DM Sans', color: 'var(--text)', marginBottom: 2 }}>
                Fountain Hills, Arizona
              </div>
              <div style={{ font: '400 10px JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5a5550' }}>
                33.6°N · 111.7°W
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes contactTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes contactSpin { to { transform: rotate(360deg); } }
        @keyframes contactBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @media (max-width: 860px) {
          .contact-hero { padding: 80px 24px 60px !important; }
        }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-form-side { border-right: none !important; border-bottom: 1px solid var(--border); }
          .contact-form-side { padding: 32px 24px !important; }
          .contact-info-side { padding: 32px 24px !important; }
        }
        .contact-form-side input:focus,
        .contact-form-side select:focus,
        .contact-form-side textarea:focus {
          border-color: rgba(201,169,74,0.4) !important;
        }
      `}</style>
    </div>
  );
}
