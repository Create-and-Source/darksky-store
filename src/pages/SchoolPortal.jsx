import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFieldTrips, updateFieldTrip } from '../admin/data/store';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const STATUS_CONFIG = {
  New: { color: '#64748B', border: '#CBD5E1', bg: '#F8FAFC', label: 'Submitted', desc: "We'll review your request shortly" },
  Contacted: { color: '#3B82F6', border: '#93C5FD', bg: '#EFF6FF', label: 'In Review', desc: "We've received your request and will contact you" },
  Confirmed: { color: '#059669', border: '#6EE7B7', bg: '#ECFDF5', label: 'Confirmed!', desc: 'Your trip is scheduled' },
  Completed: { color: '#7C3AED', border: '#C4B5FD', bg: '#F5F3FF', label: 'Trip Complete', desc: 'Thank you for visiting!' },
  Cancelled: { color: '#DC2626', border: '#FCA5A5', bg: '#FEF2F2', label: 'Cancelled', desc: '' },
};

const CHECKLIST = [
  { icon: '\uD83D\uDE8C', text: 'Bus parking: Lot B, 13001 N La Montana Dr' },
  { icon: '\u23F0', text: 'Arrive by: 8:45 AM for 9:00 AM start' },
  { icon: '\uD83C\uDF5E', text: 'Lunch: Bring packed lunches or pre-order ($8/student)' },
  { icon: '\uD83C\uDF1E', text: 'What to bring: Water bottles, sunscreen, comfortable shoes' },
  { icon: '\u267F', text: 'Accessibility: All indoor areas are ADA accessible' },
];

const fmtDate = (d) => {
  if (!d) return '--';
  const dt = new Date(d + 'T12:00:00');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${weekdays[dt.getDay()]}, ${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};

export default function SchoolPortal() {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ds_school_auth')); } catch { return null; }
  });
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [reviewText, setReviewText] = useState({});
  const [reviewSubmitted, setReviewSubmitted] = useState({});

  const login = (e) => {
    e.preventDefault();
    setError('');
    const trips = getFieldTrips();
    const schoolTrips = trips.filter(t => t.email && t.email.toLowerCase() === email.trim().toLowerCase());
    if (schoolTrips.length === 0) {
      setError('No trips found for this email. Contact info@darkskycenter.org');
      return;
    }
    const data = { email: email.trim().toLowerCase(), school: schoolTrips[0].school };
    localStorage.setItem('ds_school_auth', JSON.stringify(data));
    setAuth(data);
  };

  const signOut = () => {
    localStorage.removeItem('ds_school_auth');
    setAuth(null);
    setEmail('');
    setError('');
  };

  const handleReviewSubmit = (tripId) => {
    const text = reviewText[tripId];
    if (!text || !text.trim()) return;
    const trip = getFieldTrips().find(t => t.id === tripId);
    const existingNotes = trip?.notes || '';
    const newNotes = existingNotes + (existingNotes ? '\n\n' : '') + `[School Review]: ${text.trim()}`;
    updateFieldTrip(tripId, { notes: newNotes });
    setReviewSubmitted(prev => ({ ...prev, [tripId]: true }));
  };

  // Login screen
  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37, #a08520)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#fff', fontWeight: 700, marginBottom: 20,
            }}>&#10022;</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: C.text, marginBottom: 8 }}>
              School Field Trip Portal
            </h1>
            <p style={{ font: `400 15px/1.6 ${FONT}`, color: C.text2, margin: 0 }}>
              Check Your Trip Status
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={login} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            padding: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}>
            <label style={{
              display: 'block', font: `500 12px ${FONT}`, textTransform: 'uppercase',
              letterSpacing: '0.5px', color: '#94A3B8', marginBottom: 8,
            }}>School Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="contact@school.org"
              required
              style={{
                width: '100%', padding: '14px 16px', height: 48, background: '#FFFFFF',
                border: `1px solid ${error ? '#FCA5A5' : '#E2E8F0'}`, borderRadius: 10,
                font: `400 15px ${FONT}`, color: C.text, outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box', marginBottom: 8,
              }}
              onFocus={e => e.target.style.borderColor = C.gold}
              onBlur={e => e.target.style.borderColor = error ? '#FCA5A5' : '#E2E8F0'}
            />
            {error && (
              <p style={{ font: `400 13px ${FONT}`, color: '#DC2626', margin: '4px 0 12px' }}>{error}</p>
            )}
            <button type="submit" style={{
              width: '100%', padding: '14px', height: 48, marginTop: 12,
              background: `linear-gradient(135deg, ${C.gold}, #a08520)`,
              border: 'none', borderRadius: 10, cursor: 'pointer',
              font: `600 15px ${FONT}`, color: '#FFFFFF',
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.target.style.opacity = '0.9'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              Check Status
            </button>
          </form>

          {/* Footer links */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <p style={{ font: `400 14px ${FONT}`, color: C.text2, marginBottom: 8 }}>
              Need to book a field trip?{' '}
              <Link to="/field-trips" style={{ color: C.gold, textDecoration: 'none', fontWeight: 500 }}>
                Visit our Field Trips page &rarr;
              </Link>
            </p>
            <p style={{ font: `400 14px ${FONT}`, color: C.muted }}>
              <Link to="/" style={{ color: C.muted, textDecoration: 'none' }}>
                Back to website &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Portal view
  const trips = getFieldTrips().filter(
    t => t.email && t.email.toLowerCase() === auth.email.toLowerCase()
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Header */}
      <header style={{
        background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4AF37, #a08520)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>&#10022;</div>
          <span style={{ font: `600 15px ${FONT}`, color: C.text }}>School Field Trip Portal</span>
        </div>

        <div style={{ font: `500 14px ${FONT}`, color: C.text2, textAlign: 'center' }}>
          {auth.school}
        </div>

        <button onClick={signOut} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          font: `500 14px ${FONT}`, color: C.text2,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.target.style.color = C.danger}
          onMouseLeave={e => e.target.style.color = C.text2}
        >
          Sign Out
        </button>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.text, marginBottom: 4 }}>
          Your Field Trips
        </h1>
        <p style={{ font: `400 15px ${FONT}`, color: C.text2, marginBottom: 32 }}>
          {trips.length} trip{trips.length !== 1 ? 's' : ''} on file
        </p>

        {trips.length === 0 ? (
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            padding: '60px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>&#128218;</div>
            <p style={{ font: `500 16px ${FONT}`, color: C.text, marginBottom: 8 }}>No trips found</p>
            <p style={{ font: `400 14px ${FONT}`, color: C.text2 }}>
              Contact <a href="mailto:info@darkskycenter.org" style={{ color: C.gold }}>info@darkskycenter.org</a> for assistance.
            </p>
          </div>
        ) : trips.map(trip => {
          const cfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.New;
          return (
            <div key={trip.id} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
              marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              borderLeft: `4px solid ${cfg.color}`,
            }}>
              {/* Status banner */}
              <div style={{
                background: cfg.bg, padding: '18px 24px',
                borderBottom: `1px solid ${cfg.border}`,
              }}>
                <div style={{ font: `700 16px ${FONT}`, color: cfg.color, marginBottom: 2 }}>
                  {cfg.label}
                </div>
                {cfg.desc && (
                  <div style={{ font: `400 14px ${FONT}`, color: cfg.color, opacity: 0.8 }}>
                    {cfg.desc}
                  </div>
                )}
              </div>

              <div style={{ padding: '24px' }}>
                {/* Trip details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ font: `500 11px ${MONO}`, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Date</div>
                    <div style={{ font: `500 15px ${FONT}`, color: C.text }}>{fmtDate(trip.preferredDate)}</div>
                  </div>
                  <div>
                    <div style={{ font: `500 11px ${MONO}`, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Program</div>
                    <div style={{ font: `500 15px ${FONT}`, color: C.text }}>{trip.program === 'full-day' ? 'Full Day' : 'Half Day'}</div>
                  </div>
                  <div>
                    <div style={{ font: `500 11px ${MONO}`, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Grade</div>
                    <div style={{ font: `500 15px ${FONT}`, color: C.text }}>{trip.grade || '--'}</div>
                  </div>
                  <div>
                    <div style={{ font: `500 11px ${MONO}`, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Students</div>
                    <div style={{ font: `500 15px ${FONT}`, color: C.text }}>{trip.students}{trip.chaperones ? ` + ${trip.chaperones} chaperones` : ''}</div>
                  </div>
                </div>

                {/* Confirmed: show date prominently + checklist */}
                {trip.status === 'Confirmed' && (
                  <>
                    {trip.confirmedDate && (
                      <div style={{
                        background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12,
                        padding: '18px 24px', marginBottom: 20, textAlign: 'center',
                      }}>
                        <div style={{ font: `500 12px ${MONO}`, color: '#059669', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Confirmed Date</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#065F46' }}>
                          {fmtDate(trip.confirmedDate)}
                        </div>
                      </div>
                    )}
                    <div style={{
                      background: '#F8F7F4', border: `1px solid ${C.border}`, borderRadius: 12,
                      padding: 20, marginBottom: 20,
                    }}>
                      <div style={{ font: `600 14px ${FONT}`, color: C.text, marginBottom: 14 }}>Preparation Checklist</div>
                      {CHECKLIST.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          padding: '10px 0',
                          borderBottom: i < CHECKLIST.length - 1 ? `1px solid ${C.border}` : 'none',
                        }}>
                          <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{item.icon}</span>
                          <span style={{ font: `400 14px/1.6 ${FONT}`, color: C.text }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Completed: review textarea */}
                {trip.status === 'Completed' && (
                  <div style={{
                    background: '#F8F7F4', border: `1px solid ${C.border}`, borderRadius: 12,
                    padding: 20, marginBottom: 20,
                  }}>
                    <div style={{ font: `600 14px ${FONT}`, color: C.text, marginBottom: 10 }}>Leave a Review</div>
                    {reviewSubmitted[trip.id] ? (
                      <div style={{
                        font: `500 14px ${FONT}`, color: C.success,
                        padding: '16px 0', textAlign: 'center',
                      }}>
                        Thank you for your feedback!
                      </div>
                    ) : (
                      <>
                        <textarea
                          value={reviewText[trip.id] || ''}
                          onChange={e => setReviewText(prev => ({ ...prev, [trip.id]: e.target.value }))}
                          placeholder="Tell us about your experience..."
                          style={{
                            width: '100%', padding: '12px 14px', minHeight: 100, resize: 'vertical',
                            background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 8,
                            font: `400 14px/1.6 ${FONT}`, color: C.text, outline: 'none',
                            boxSizing: 'border-box', marginBottom: 12,
                          }}
                          onFocus={e => e.target.style.borderColor = C.gold}
                          onBlur={e => e.target.style.borderColor = C.border}
                        />
                        <button
                          onClick={() => handleReviewSubmit(trip.id)}
                          disabled={!reviewText[trip.id]?.trim()}
                          style={{
                            padding: '10px 24px', height: 40,
                            background: reviewText[trip.id]?.trim() ? C.gold : C.muted,
                            border: 'none', borderRadius: 8, cursor: reviewText[trip.id]?.trim() ? 'pointer' : 'default',
                            font: `600 13px ${FONT}`, color: '#FFFFFF',
                            transition: 'opacity 0.15s',
                          }}
                        >
                          Submit Review
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Contact section */}
                <div style={{
                  font: `400 13px ${FONT}`, color: C.text2, paddingTop: 16,
                  borderTop: `1px solid ${C.border}`,
                }}>
                  Questions? Contact our education coordinator at{' '}
                  <a href="mailto:info@darkskycenter.org" style={{ color: C.gold, textDecoration: 'none', fontWeight: 500 }}>info@darkskycenter.org</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 600px) {
          header > div:nth-child(2) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
