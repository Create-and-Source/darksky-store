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
        .vp-page { min-height: 100vh; background: #FAFAF8; color: #1A1A2E; padding: 0; }
        .vp-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px; border-bottom: 1px solid #E8E5DF; background: #FFFFFF; }
        .vp-logo { font-family: ${FONT}; font-size: 22px; color: #1A1A2E; display: flex; align-items: center; gap: 12px; }
        .vp-signout { font-family: ${BODY}; font-size: 13px; color: #7C7B76; background: none; border: 1px solid #E8E5DF; border-radius: 6px; padding: 6px 16px; cursor: pointer; transition: all 0.2s; }
        .vp-signout:hover { color: #C5A55A; border-color: #C5A55A; }
        .vp-body { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; }
        .vp-section { margin-bottom: 48px; }
        .vp-label { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #C5A55A; margin-bottom: 8px; }
        .vp-title { font-family: ${FONT}; font-size: 24px; font-weight: 600; margin: 0 0 20px; color: #1A1A2E; }
        .vp-card { background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 10px; padding: 20px; transition: border-color 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .vp-card:hover { border-color: #D4D0C8; }
        .vp-shifts { display: flex; flex-direction: column; gap: 12px; }
        .vp-shift { display: flex; align-items: center; justify-content: space-between; }
        .vp-shift-info h4 { font-family: ${BODY}; font-size: 16px; margin: 0 0 4px; font-weight: 600; color: #1A1A2E; }
        .vp-shift-info p { font-family: ${MONO}; font-size: 12px; color: #7C7B76; margin: 0; }
        .vp-btn { font-family: ${BODY}; font-size: 13px; font-weight: 600; color: #FFFFFF; background: #C5A55A; border: none; border-radius: 6px; padding: 8px 20px; cursor: pointer; transition: opacity 0.2s; }
        .vp-btn:hover { opacity: 0.85; }
        .vp-btn-done { background: #3D8C6F; cursor: default; color: #FFFFFF; }
        .vp-stats { display: flex; gap: 16px; margin-bottom: 24px; }
        .vp-stat { flex: 1; background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 10px; padding: 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .vp-stat-val { font-family: ${FONT}; font-size: 32px; color: #C5A55A; font-weight: 700; }
        .vp-stat-lbl { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #7C7B76; margin-top: 4px; }
        .vp-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .vp-input { font-family: ${BODY}; font-size: 14px; background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 6px; padding: 10px 12px; color: #1A1A2E; outline: none; width: 100%; box-sizing: border-box; }
        .vp-input:focus { border-color: #C5A55A; }
        .vp-input-full { grid-column: 1 / -1; }
        .vp-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .vp-table th { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #7C7B76; text-align: left; padding: 8px 0; border-bottom: 1px solid #E8E5DF; }
        .vp-table td { font-family: ${BODY}; font-size: 13px; color: #1A1A2E; padding: 10px 0; border-bottom: 1px solid #F0EDE8; }
        .vp-training { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .vp-cert { background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 10px; padding: 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .vp-cert-name { font-family: ${BODY}; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #1A1A2E; }
        .vp-cert-status { font-family: ${MONO}; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .vp-cert-modules { font-family: ${MONO}; font-size: 11px; color: #7C7B76; margin-top: 4px; }
        .vp-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .vp-link-card { background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 10px; padding: 24px; text-align: center; text-decoration: none; color: #1A1A2E; transition: border-color 0.2s; display: block; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .vp-link-card:hover { border-color: #C5A55A; }
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
