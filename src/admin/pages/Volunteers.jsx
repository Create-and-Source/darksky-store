import { useState, useEffect, useCallback } from 'react';
import { useToast, useRole } from '../AdminLayout';
import {
  getVolunteers, addVolunteer, updateVolunteer, deleteVolunteer, subscribe,
} from '../data/store';

// ── Design Tokens ──
const C = {
  bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A',
  text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F',
  warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)',
};
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BLANK_VOLUNTEER = {
  name: '', email: '', phone: '', role: '', availability: [],
  certifications: '', notes: '',
};

// ── Styles ──
const summaryCard = {
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
  padding: 24, flex: '1 1 200px', minWidth: 180,
  boxShadow: C.shadow,
};

const summaryNum = {
  font: `600 28px ${FONT}`, color: C.text, margin: '8px 0 4px',
};

const summaryLabel = {
  font: `500 12px ${MONO}`, color: C.text2, textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const btnPrimary = {
  padding: '10px 20px', background: C.gold, color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', font: `600 14px ${FONT}`,
  transition: 'opacity 0.2s',
};

const btnOutline = {
  padding: '8px 16px', background: 'transparent', color: C.gold,
  border: `1px solid ${C.gold}`, borderRadius: 8, cursor: 'pointer',
  font: `500 13px ${FONT}`, transition: 'all 0.2s',
};

const btnSmall = {
  padding: '6px 12px', background: 'transparent', border: `1px solid ${C.border}`,
  borderRadius: 6, cursor: 'pointer', font: `500 12px ${FONT}`, color: C.text2,
};

const inputStyle = {
  width: '100%', padding: '10px 14px', background: '#fff',
  border: `1px solid ${C.border}`, borderRadius: 8,
  font: `400 14px ${FONT}`, color: C.text, outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  font: `500 12px ${MONO}`, color: C.text2, textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: 6, display: 'block',
};

const overlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

const modal = {
  background: '#fff', borderRadius: 14, padding: 32, width: '90%',
  maxWidth: 520, maxHeight: '85vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
};

const pill = (bg, color) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: 20,
  font: `500 11px ${FONT}`, background: bg, color,
  marginRight: 4, marginBottom: 4,
});

export default function Volunteers() {
  const toast = useToast();
  const role = useRole();
  const [volunteers, setVolunteers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLogHours, setShowLogHours] = useState(false);
  const [form, setForm] = useState({ ...BLANK_VOLUNTEER });
  const [logForm, setLogForm] = useState({ volunteerId: '', date: new Date().toISOString().slice(0, 10), hours: '' });

  const reload = useCallback(() => setVolunteers(getVolunteers()), []);

  useEffect(() => {
    reload();
    return subscribe(reload);
  }, [reload]);

  // ── Summary stats ──
  const active = volunteers.filter(v => v.status === 'Active');
  const activeCount = active.length;
  const totalHoursMonth = volunteers.reduce((sum, v) => sum + (v.hoursThisMonth || 0), 0);
  const avgHours = activeCount > 0 ? (active.reduce((sum, v) => sum + (v.hoursThisMonth || 0), 0) / activeCount).toFixed(1) : '0';
  const allCerts = new Set(volunteers.flatMap(v => v.certifications || []));
  const uniqueCerts = allCerts.size;

  // ── Handlers ──
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast('Please fill in name and email', 'error');
      return;
    }
    const vol = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      status: 'Active',
      startDate: new Date().toISOString().slice(0, 10),
      hoursThisMonth: 0,
      totalHours: 0,
      certifications: form.certifications
        ? form.certifications.split(',').map(c => c.trim()).filter(Boolean)
        : [],
      availability: form.availability,
      notes: form.notes,
    };
    addVolunteer(vol);
    toast('Volunteer added', 'success');
    setShowAddForm(false);
    setForm({ ...BLANK_VOLUNTEER });
  };

  const handleLogHours = (e) => {
    e.preventDefault();
    const hours = Number(logForm.hours);
    if (!logForm.volunteerId || !hours || hours <= 0) {
      toast('Please select a volunteer and enter hours', 'error');
      return;
    }
    const vol = volunteers.find(v => v.id === logForm.volunteerId);
    if (!vol) return;
    updateVolunteer(vol.id, {
      hoursThisMonth: (vol.hoursThisMonth || 0) + hours,
      totalHours: (vol.totalHours || 0) + hours,
    });
    toast(`Logged ${hours}h for ${vol.name}`, 'success');
    setShowLogHours(false);
    setLogForm({ volunteerId: '', date: new Date().toISOString().slice(0, 10), hours: '' });
  };

  const toggleStatus = (vol) => {
    const newStatus = vol.status === 'Active' ? 'On Leave' : 'Active';
    updateVolunteer(vol.id, { status: newStatus });
    toast(`${vol.name} set to ${newStatus}`, 'success');
  };

  const handleDelete = (vol) => {
    deleteVolunteer(vol.id);
    toast(`${vol.name} removed`, 'success');
  };

  const toggleAvailability = (day) => {
    setForm(f => ({
      ...f,
      availability: f.availability.includes(day)
        ? f.availability.filter(d => d !== day)
        : [...f.availability, day],
    }));
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ font: `600 24px ${FONT}`, margin: 0 }}>Volunteer Management</h1>
          
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnOutline} onClick={() => setShowLogHours(true)}>Log Hours</button>
          <button style={btnPrimary} onClick={() => setShowAddForm(true)}>+ Add Volunteer</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={summaryCard}>
          <div style={summaryLabel}>Active Volunteers</div>
          <div style={{ ...summaryNum, color: C.success }}>{activeCount}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Total Hours This Month</div>
          <div style={summaryNum}>{totalHoursMonth}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Avg Hours / Volunteer</div>
          <div style={summaryNum}>{avgHours}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Unique Certifications</div>
          <div style={summaryNum}>{uniqueCerts}</div>
        </div>
      </div>

      {/* Volunteer Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {volunteers.map((vol, i) => (
          <div key={vol.id} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 24, boxShadow: C.shadow, position: 'relative',
          }}>
            {/* Status badge */}
            <span style={pill(
              vol.status === 'Active' ? `${C.success}18` : `${C.warning}18`,
              vol.status === 'Active' ? C.success : C.warning,
            )}>
              {vol.status}
            </span>

            <div style={{ marginTop: 12 }}>
              <h3 style={{ font: `600 17px ${FONT}`, margin: 0 }}>{vol.name}</h3>
              <div style={{ font: `400 13px ${FONT}`, color: C.text2, marginTop: 4 }}>{vol.role}</div>
            </div>

            {/* Hours */}
            <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <div>
                <div style={{ font: `500 11px ${MONO}`, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>This Month</div>
                <div style={{ font: `600 20px ${FONT}`, color: C.text, marginTop: 4 }}>{vol.hoursThisMonth || 0}<span style={{ font: `400 13px ${FONT}`, color: C.muted }}>h</span></div>
              </div>
              <div>
                <div style={{ font: `500 11px ${MONO}`, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                <div style={{ font: `600 20px ${FONT}`, color: C.text, marginTop: 4 }}>{vol.totalHours || 0}<span style={{ font: `400 13px ${FONT}`, color: C.muted }}>h</span></div>
              </div>
            </div>

            {/* Certifications */}
            {vol.certifications && vol.certifications.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ font: `500 10px ${MONO}`, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Certifications</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {vol.certifications.map(cert => (
                    <span key={cert} style={pill('#F0EEED', C.text2)}>{cert}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {vol.availability && vol.availability.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ font: `500 10px ${MONO}`, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Available</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {ALL_DAYS.map(d => (
                    <span key={d} style={{
                      width: 32, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 4, font: `500 10px ${MONO}`,
                      background: vol.availability.includes(d) ? `${C.gold}18` : '#F5F5F3',
                      color: vol.availability.includes(d) ? C.gold : C.muted,
                      border: vol.availability.includes(d) ? `1px solid ${C.gold}40` : '1px solid transparent',
                    }}>
                      {d.slice(0, 2)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <button style={{ ...btnOutline, padding: '6px 12px', font: `500 12px ${FONT}` }}
                onClick={() => { setLogForm({ volunteerId: vol.id, date: new Date().toISOString().slice(0, 10), hours: '' }); setShowLogHours(true); }}>
                Log Hours
              </button>
              <button style={{ ...btnSmall, fontSize: 11 }} onClick={() => toggleStatus(vol)}>
                {vol.status === 'Active' ? 'Set On Leave' : 'Set Active'}
              </button>
              <button style={{ ...btnSmall, fontSize: 11, color: C.danger, borderColor: `${C.danger}60` }}
                onClick={() => handleDelete(vol)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {volunteers.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
          <div style={{ font: `400 15px ${FONT}` }}>No volunteers yet. Click "Add Volunteer" to get started.</div>
        </div>
      )}

      {/* Log Hours Modal */}
      {showLogHours && (
        <div style={overlay} onClick={() => setShowLogHours(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ font: `600 20px ${FONT}`, margin: '0 0 24px' }}>Log Volunteer Hours</h2>
            <form onSubmit={handleLogHours}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Volunteer *</label>
                <select style={inputStyle} value={logForm.volunteerId} onChange={e => setLogForm(f => ({ ...f, volunteerId: e.target.value }))}>
                  <option value="">Select volunteer...</option>
                  {volunteers.filter(v => v.status === 'Active').map(v => (
                    <option key={v.id} value={v.id}>{v.name} — {v.role}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input style={inputStyle} type="date" value={logForm.date} onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Hours *</label>
                  <input style={inputStyle} type="number" min="0.5" step="0.5" value={logForm.hours} onChange={e => setLogForm(f => ({ ...f, hours: e.target.value }))} placeholder="0" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" style={btnSmall} onClick={() => setShowLogHours(false)}>Cancel</button>
                <button type="submit" style={btnPrimary}>Log Hours</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Volunteer Modal */}
      {showAddForm && (
        <div style={overlay} onClick={() => setShowAddForm(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ font: `600 20px ${FONT}`, margin: '0 0 24px' }}>Add Volunteer</h2>
            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Name *</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(480) 555-0100" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Role</label>
                  <input style={inputStyle} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Telescope Operator, Greeter" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Availability</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ALL_DAYS.map(d => (
                      <button
                        key={d} type="button"
                        onClick={() => toggleAvailability(d)}
                        style={{
                          padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
                          font: `500 13px ${FONT}`, transition: 'all 0.15s',
                          background: form.availability.includes(d) ? C.gold : '#F5F5F3',
                          color: form.availability.includes(d) ? '#fff' : C.text2,
                          border: form.availability.includes(d) ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Certifications</label>
                  <input style={inputStyle} value={form.certifications} onChange={e => setForm(f => ({ ...f, certifications: e.target.value }))} placeholder="First Aid, CPR, Telescope Operation (comma-separated)" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" style={btnSmall} onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" style={btnPrimary}>Add Volunteer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
