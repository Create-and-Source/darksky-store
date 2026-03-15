import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getEvents, getVolunteers, getVolunteerHours, getVolunteerCheckins,
  addVolunteerHour, addVolunteerCheckin, subscribe,
} from '../admin/data/store';

const FONT = "'Playfair Display', serif";
const BODY = "'Plus Jakarta Sans', sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const TRAINING = [
  { name: 'Telescope Operation', status: 'completed', modules: '4/4' },
  { name: 'First Aid', status: 'completed', modules: '3/3' },
  { name: 'UV Scorpion Guide', status: 'in-progress', modules: '2/4' },
  { name: 'Gift Shop POS', status: 'not-started', modules: '0/3' },
  { name: 'Planetarium Ops', status: 'not-started', modules: '0/5' },
];

const STATUS_COLOR = { completed: '#4ADE80', 'in-progress': '#D4AF37', 'not-started': '#5C5870' };
const STATUS_LABEL = { completed: 'Completed', 'in-progress': 'In Progress', 'not-started': 'Not Started' };

const ACTIVITIES = ['Event Support', 'Gift Shop', 'Setup/Teardown', 'Training', 'Admin', 'Other'];

export default function VolunteerPortal() {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => subscribe(refresh), [refresh]);

  const events = getEvents();
  const hours = getVolunteerHours();
  const checkins = getVolunteerCheckins();

  const futureEvents = events
    .filter(e => e.status === 'Published' && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const hoursThisMonth = hours.filter(h => (h.date || '').startsWith(thisMonth)).reduce((s, h) => s + (h.hours || 0), 0);
  const hoursAllTime = hours.reduce((s, h) => s + (h.hours || 0), 0);

  // Log hours form
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [logHours, setLogHours] = useState('');
  const [logActivity, setLogActivity] = useState('Event Support');
  const [logNotes, setLogNotes] = useState('');

  const handleLogHours = (e) => {
    e.preventDefault();
    if (!logHours || Number(logHours) <= 0) return;
    addVolunteerHour({
      volunteerId: 'VOL-001',
      name: localStorage.getItem('ds_user_name') || 'Volunteer',
      date: logDate,
      hours: Number(logHours),
      activity: logActivity,
      notes: logNotes,
    });
    setLogHours('');
    setLogNotes('');
  };

  const handleCheckin = (eventId) => {
    addVolunteerCheckin({
      volunteerId: 'VOL-001',
      eventId,
      name: localStorage.getItem('ds_user_name') || 'Volunteer',
    });
  };

  const isCheckedIn = (eventId) => checkins.some(c => c.eventId === eventId);

  const handleSignOut = () => {
    localStorage.removeItem('ds_auth_user');
    localStorage.removeItem('ds_user_role');
    localStorage.removeItem('ds_user_name');
    localStorage.removeItem('ds_admin_role');
    navigate('/signin');
  };

  return (
    <>
      <style>{`
        .vp-page { min-height: 100vh; background: #04040c; color: #F0EDE6; padding: 0; }
        .vp-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .vp-logo { font-family: ${FONT}; font-size: 22px; color: #F0EDE6; display: flex; align-items: center; gap: 12px; }
        .vp-signout { font-family: ${BODY}; font-size: 13px; color: #908D9A; background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px 16px; cursor: pointer; transition: all 0.2s; }
        .vp-signout:hover { color: #D4AF37; border-color: #D4AF37; }
        .vp-body { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; }
        .vp-section { margin-bottom: 48px; }
        .vp-label { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; margin-bottom: 8px; }
        .vp-title { font-family: ${FONT}; font-size: 24px; font-weight: 600; margin: 0 0 20px; }
        .vp-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; transition: border-color 0.2s; }
        .vp-card:hover { border-color: rgba(255,255,255,0.1); }
        .vp-shifts { display: flex; flex-direction: column; gap: 12px; }
        .vp-shift { display: flex; align-items: center; justify-content: space-between; }
        .vp-shift-info h4 { font-family: ${BODY}; font-size: 16px; margin: 0 0 4px; font-weight: 600; }
        .vp-shift-info p { font-family: ${MONO}; font-size: 12px; color: #908D9A; margin: 0; }
        .vp-btn { font-family: ${BODY}; font-size: 13px; font-weight: 600; color: #04040c; background: linear-gradient(135deg, #D4AF37, #E5C76B); border: none; border-radius: 6px; padding: 8px 20px; cursor: pointer; transition: opacity 0.2s; }
        .vp-btn:hover { opacity: 0.85; }
        .vp-btn-done { background: #4ADE80; cursor: default; }
        .vp-stats { display: flex; gap: 16px; margin-bottom: 24px; }
        .vp-stat { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; text-align: center; }
        .vp-stat-val { font-family: ${FONT}; font-size: 32px; color: #D4AF37; font-weight: 700; }
        .vp-stat-lbl { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #908D9A; margin-top: 4px; }
        .vp-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .vp-input { font-family: ${BODY}; font-size: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px 12px; color: #F0EDE6; outline: none; width: 100%; box-sizing: border-box; }
        .vp-input:focus { border-color: #D4AF37; }
        .vp-input-full { grid-column: 1 / -1; }
        .vp-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .vp-table th { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #908D9A; text-align: left; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .vp-table td { font-family: ${BODY}; font-size: 13px; color: #F0EDE6; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .vp-training { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .vp-cert { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; text-align: center; }
        .vp-cert-name { font-family: ${BODY}; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
        .vp-cert-status { font-family: ${MONO}; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .vp-cert-modules { font-family: ${MONO}; font-size: 11px; color: #908D9A; margin-top: 4px; }
        .vp-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .vp-link-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 24px; text-align: center; text-decoration: none; color: #F0EDE6; transition: border-color 0.2s; display: block; }
        .vp-link-card:hover { border-color: #D4AF37; }
        .vp-link-icon { font-size: 28px; margin-bottom: 8px; }
        .vp-link-text { font-family: ${BODY}; font-size: 14px; font-weight: 600; }
        @media (max-width: 600px) {
          .vp-form { grid-template-columns: 1fr; }
          .vp-stats { flex-direction: column; }
          .vp-links { grid-template-columns: 1fr; }
          .vp-training { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
      <div className="vp-page">
        <div className="vp-header">
          <div className="vp-logo"><span style={{ color: '#D4AF37' }}>{'\u2726'}</span> Volunteer Portal</div>
          <button className="vp-signout" onClick={handleSignOut}>Sign Out</button>
        </div>

        <div className="vp-body">
          {/* Upcoming Shifts */}
          <div className="vp-section">
            <div className="vp-label">Schedule</div>
            <h2 className="vp-title">My Upcoming Shifts</h2>
            <div className="vp-shifts">
              {futureEvents.length === 0 && <p style={{ color: '#908D9A', fontFamily: BODY }}>No upcoming events.</p>}
              {futureEvents.map(ev => (
                <div className="vp-card" key={ev.id}>
                  <div className="vp-shift">
                    <div className="vp-shift-info">
                      <h4>{ev.title}</h4>
                      <p>{new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {'\u00B7'} {ev.time}{ev.endTime ? ` - ${ev.endTime}` : ''} {'\u00B7'} {ev.location}</p>
                    </div>
                    {isCheckedIn(ev.id) ? (
                      <button className="vp-btn vp-btn-done">Checked In</button>
                    ) : (
                      <button className="vp-btn" onClick={() => handleCheckin(ev.id)}>Check In</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Hours */}
          <div className="vp-section">
            <div className="vp-label">Hours</div>
            <h2 className="vp-title">My Hours</h2>
            <div className="vp-stats">
              <div className="vp-stat">
                <div className="vp-stat-val">{hoursThisMonth}</div>
                <div className="vp-stat-lbl">This Month</div>
              </div>
              <div className="vp-stat">
                <div className="vp-stat-val">{hoursAllTime}</div>
                <div className="vp-stat-lbl">All Time</div>
              </div>
            </div>

            <form onSubmit={handleLogHours} className="vp-form">
              <input className="vp-input" type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
              <input className="vp-input" type="number" step="0.5" min="0.5" placeholder="Hours" value={logHours} onChange={e => setLogHours(e.target.value)} />
              <select className="vp-input" value={logActivity} onChange={e => setLogActivity(e.target.value)}>
                {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <input className="vp-input" placeholder="Notes (optional)" value={logNotes} onChange={e => setLogNotes(e.target.value)} />
              <button type="submit" className="vp-btn" style={{ gridColumn: '1 / -1', padding: '12px' }}>Log Hours</button>
            </form>

            <table className="vp-table">
              <thead>
                <tr><th>Date</th><th>Hours</th><th>Activity</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {hours.slice(0, 10).map(h => (
                  <tr key={h.id}>
                    <td>{h.date}</td>
                    <td style={{ color: '#D4AF37' }}>{h.hours}</td>
                    <td>{h.activity}</td>
                    <td style={{ color: '#908D9A' }}>{h.notes}</td>
                  </tr>
                ))}
                {hours.length === 0 && <tr><td colSpan={4} style={{ color: '#5C5870' }}>No hours logged yet.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Training */}
          <div className="vp-section">
            <div className="vp-label">Certifications</div>
            <h2 className="vp-title">My Training</h2>
            <div className="vp-training">
              {TRAINING.map(t => (
                <div className="vp-cert" key={t.name} style={{ borderColor: STATUS_COLOR[t.status] + '33' }}>
                  <div className="vp-cert-name">{t.name}</div>
                  <div className="vp-cert-status" style={{ color: STATUS_COLOR[t.status] }}>{STATUS_LABEL[t.status]}</div>
                  <div className="vp-cert-modules">{t.modules} modules</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="vp-section">
            <div className="vp-label">Resources</div>
            <h2 className="vp-title">Quick Links</h2>
            <div className="vp-links">
              <a href="/events" className="vp-link-card">
                <div className="vp-link-icon">{'\u{1F39F}\uFE0F'}</div>
                <div className="vp-link-text">Upcoming Events</div>
              </a>
              <a href="/shop" className="vp-link-card">
                <div className="vp-link-icon">{'\u{1F6CD}\uFE0F'}</div>
                <div className="vp-link-text">Gift Shop</div>
              </a>
              <a href="mailto:info@darkskycenter.org" className="vp-link-card">
                <div className="vp-link-icon">{'\u2709\uFE0F'}</div>
                <div className="vp-link-text">Contact Staff</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
