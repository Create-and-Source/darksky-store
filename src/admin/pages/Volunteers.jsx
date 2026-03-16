import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast, useRole } from '../AdminLayout';
import {
  getVolunteers, addVolunteer, updateVolunteer, deleteVolunteer,
  getVolunteerHours, addVolunteerHour, subscribe,
} from '../data/store';

// ── Design Tokens ──
const C = {
  bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A',
  goldLight: 'rgba(197,165,90,0.08)', goldBorder: 'rgba(197,165,90,0.25)',
  text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F',
  successBg: 'rgba(61,140,111,0.08)', warning: '#D4943A', warningBg: 'rgba(212,148,58,0.08)',
  danger: '#C45B5B', dangerBg: 'rgba(196,91,91,0.08)',
  shadow: '0 1px 3px rgba(0,0,0,0.04)', shadowMd: '0 4px 12px rgba(0,0,0,0.06)',
};
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ALL_CERTS = ['First Aid', 'CPR', 'Telescope Operations', 'Gift Shop Training', 'Dark Sky Ambassador'];
const ACTIVITY_TYPES = ['Event Support', 'Gift Shop', 'Setup/Teardown', 'Training', 'Admin', 'Other'];

const BLANK_VOLUNTEER = {
  name: '', email: '', phone: '', role: '', availability: [],
  certifications: [], notes: '',
};

// ── Reusable Styles ──
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
const btnDanger = {
  ...btnSmall, color: C.danger, borderColor: `${C.danger}60`,
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
  maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
};
const pill = (bg, color) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: 20,
  font: `500 11px ${FONT}`, background: bg, color,
  marginRight: 4, marginBottom: 4,
});
const summaryCard = {
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
  padding: 24, flex: '1 1 200px', minWidth: 170, boxShadow: C.shadow,
};
const summaryNum = { font: `600 28px ${FONT}`, color: C.text, margin: '8px 0 4px' };
const summaryLabel = {
  font: `500 11px ${MONO}`, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.5px',
};

// ── Tab Button ──
function TabBtn({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 20px', background: active ? C.gold : 'transparent',
      color: active ? '#fff' : C.text2, border: active ? 'none' : `1px solid ${C.border}`,
      borderRadius: 8, cursor: 'pointer', font: `500 14px ${FONT}`,
      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {label}
      {count !== undefined && (
        <span style={{
          padding: '2px 8px', borderRadius: 10, font: `600 11px ${FONT}`,
          background: active ? 'rgba(255,255,255,0.25)' : C.goldLight,
          color: active ? '#fff' : C.gold,
        }}>{count}</span>
      )}
    </button>
  );
}

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export default function Volunteers() {
  const toast = useToast();
  const role = useRole();
  const [volunteers, setVolunteers] = useState([]);
  const [hoursLog, setHoursLog] = useState([]);
  const [tab, setTab] = useState('roster');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLogHours, setShowLogHours] = useState(false);
  const [editingVol, setEditingVol] = useState(null);
  const [showCertModal, setShowCertModal] = useState(null); // volunteer id
  const [form, setForm] = useState({ ...BLANK_VOLUNTEER });
  const [logForm, setLogForm] = useState({
    volunteerId: '', date: new Date().toISOString().slice(0, 10),
    hours: '', activity: 'Event Support', notes: '',
  });

  const reload = useCallback(() => {
    setVolunteers(getVolunteers());
    setHoursLog(getVolunteerHours());
  }, []);

  useEffect(() => { reload(); return subscribe(reload); }, [reload]);

  // ── Summary stats ──
  const active = volunteers.filter(v => v.status === 'Active');
  const activeCount = active.length;
  const totalHoursMonth = volunteers.reduce((sum, v) => sum + (v.hoursThisMonth || 0), 0);
  const avgHours = activeCount > 0 ? (active.reduce((sum, v) => sum + (v.hoursThisMonth || 0), 0) / activeCount).toFixed(1) : '0';
  const allCerts = new Set(volunteers.flatMap(v => (Array.isArray(v.certifications) ? v.certifications : [])));
  const uniqueCerts = allCerts.size;

  // ── Handlers ──
  const openAdd = () => {
    setForm({ ...BLANK_VOLUNTEER });
    setEditingVol(null);
    setShowAddForm(true);
  };
  const openEdit = (vol) => {
    setForm({
      name: vol.name, email: vol.email, phone: vol.phone || '',
      role: vol.role || '', availability: vol.availability || [],
      certifications: vol.certifications || [], notes: vol.notes || '',
    });
    setEditingVol(vol);
    setShowAddForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast('Please fill in name and email', 'error'); return; }
    const certs = Array.isArray(form.certifications) ? form.certifications : [];
    if (editingVol) {
      updateVolunteer(editingVol.id, {
        name: form.name, email: form.email, phone: form.phone,
        role: form.role, availability: form.availability,
        certifications: certs, notes: form.notes,
      });
      toast(`${form.name} updated`, 'success');
    } else {
      addVolunteer({
        name: form.name, email: form.email, phone: form.phone,
        role: form.role, status: 'Active',
        startDate: new Date().toISOString().slice(0, 10),
        hoursThisMonth: 0, totalHours: 0,
        certifications: certs,
        availability: form.availability, notes: form.notes,
      });
      toast('Volunteer added', 'success');
    }
    setShowAddForm(false);
    setForm({ ...BLANK_VOLUNTEER });
    setEditingVol(null);
  };

  const handleLogHours = (e) => {
    e.preventDefault();
    const hours = Number(logForm.hours);
    if (!logForm.volunteerId || !hours || hours <= 0) {
      toast('Please select a volunteer and enter hours', 'error'); return;
    }
    const vol = volunteers.find(v => v.id === logForm.volunteerId);
    if (!vol) return;
    addVolunteerHour({
      volunteerId: vol.id, name: vol.name,
      date: logForm.date, hours, activity: logForm.activity,
      notes: logForm.notes,
    });
    updateVolunteer(vol.id, {
      hoursThisMonth: (vol.hoursThisMonth || 0) + hours,
      totalHours: (vol.totalHours || 0) + hours,
    });
    toast(`Logged ${hours}h for ${vol.name}`, 'success');
    setShowLogHours(false);
    setLogForm({ volunteerId: '', date: new Date().toISOString().slice(0, 10), hours: '', activity: 'Event Support', notes: '' });
  };

  const toggleStatus = (vol) => {
    const newStatus = vol.status === 'Active' ? 'On Leave' : 'Active';
    updateVolunteer(vol.id, { status: newStatus });
    toast(`${vol.name} set to ${newStatus}`, 'success');
  };

  const handleDelete = (vol) => {
    if (!confirm(`Remove ${vol.name} from volunteer roster?`)) return;
    deleteVolunteer(vol.id);
    toast(`${vol.name} removed`, 'success');
  };

  const toggleAvailability = (day) => {
    setForm(f => ({
      ...f,
      availability: f.availability.includes(day)
        ? f.availability.filter(d => d !== day) : [...f.availability, day],
    }));
  };

  const toggleCertInForm = (cert) => {
    setForm(f => {
      const certs = Array.isArray(f.certifications) ? f.certifications : [];
      return {
        ...f,
        certifications: certs.includes(cert) ? certs.filter(c => c !== cert) : [...certs, cert],
      };
    });
  };

  const handleUpdateCerts = (volId, cert, add) => {
    const vol = volunteers.find(v => v.id === volId);
    if (!vol) return;
    const certs = Array.isArray(vol.certifications) ? [...vol.certifications] : [];
    if (add && !certs.includes(cert)) certs.push(cert);
    if (!add) { const idx = certs.indexOf(cert); if (idx >= 0) certs.splice(idx, 1); }
    updateVolunteer(volId, { certifications: certs });
    toast(`Updated ${vol.name}'s certifications`, 'success');
  };

  // ── Week dates for Schedule ──
  const weekDates = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    return ALL_DAYS.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, []);

  const weekRangeStr = weekDates.length > 0
    ? `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : '';

  // ── Sorted hours log ──
  const sortedHours = useMemo(() => [...hoursLog].sort((a, b) => b.date.localeCompare(a.date)), [hoursLog]);
  const totalLoggedHours = hoursLog.reduce((s, h) => s + (h.hours || 0), 0);

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ font: `600 24px ${FONT}`, margin: 0 }}>Volunteer Management</h1>
          <p style={{ font: `400 14px ${FONT}`, color: C.text2, margin: '4px 0 0' }}>
            {activeCount} active volunteers &middot; {totalHoursMonth} hours this month
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnOutline} onClick={() => setShowLogHours(true)}>Log Hours</button>
          <button style={btnPrimary} onClick={openAdd}>+ Add Volunteer</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={summaryCard}>
          <div style={summaryLabel}>Active Volunteers</div>
          <div style={{ ...summaryNum, color: C.success }}>{activeCount}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Hours This Month</div>
          <div style={summaryNum}>{totalHoursMonth}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Avg Hours / Volunteer</div>
          <div style={summaryNum}>{avgHours}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Certifications Tracked</div>
          <div style={summaryNum}>{uniqueCerts}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <TabBtn label="Roster" active={tab === 'roster'} onClick={() => setTab('roster')} count={volunteers.length} />
        <TabBtn label="Schedule" active={tab === 'schedule'} onClick={() => setTab('schedule')} />
        <TabBtn label="Hours Log" active={tab === 'hours'} onClick={() => setTab('hours')} count={hoursLog.length} />
        <TabBtn label="Training" active={tab === 'training'} onClick={() => setTab('training')} />
      </div>

      {/* ═══════════════ TAB: ROSTER ═══════════════ */}
      {tab === 'roster' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {volunteers.map(vol => {
              const certs = Array.isArray(vol.certifications) ? vol.certifications : [];
              return (
                <div key={vol.id} style={{
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: 24, boxShadow: C.shadow, position: 'relative',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = C.shadowMd}
                onMouseLeave={e => e.currentTarget.style.boxShadow = C.shadow}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={pill(
                        vol.status === 'Active' ? C.successBg : C.warningBg,
                        vol.status === 'Active' ? C.success : C.warning,
                      )}>{vol.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ ...btnSmall, padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(vol)} title="Edit">Edit</button>
                      <button style={{ ...btnDanger, padding: '4px 10px', fontSize: 11 }} onClick={() => handleDelete(vol)} title="Remove">Remove</button>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <h3 style={{ font: `600 17px ${FONT}`, margin: 0 }}>{vol.name}</h3>
                    <div style={{ font: `400 13px ${FONT}`, color: C.text2, marginTop: 4 }}>{vol.role}</div>
                  </div>

                  {/* Contact */}
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ font: `400 13px ${FONT}`, color: C.text2 }}>{vol.email}</div>
                    {vol.phone && <div style={{ font: `400 13px ${FONT}`, color: C.text2 }}>{vol.phone}</div>}
                  </div>

                  {/* Hours */}
                  <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ font: `500 10px ${MONO}`, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>This Month</div>
                      <div style={{ font: `600 20px ${FONT}`, color: C.text, marginTop: 4 }}>
                        {vol.hoursThisMonth || 0}<span style={{ font: `400 13px ${FONT}`, color: C.muted }}>h</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ font: `500 10px ${MONO}`, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                      <div style={{ font: `600 20px ${FONT}`, color: C.text, marginTop: 4 }}>
                        {vol.totalHours || 0}<span style={{ font: `400 13px ${FONT}`, color: C.muted }}>h</span>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {certs.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ font: `500 10px ${MONO}`, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Certifications</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {certs.map(cert => (
                          <span key={cert} style={pill(C.goldLight, C.gold)}>{cert}</span>
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
                            background: vol.availability.includes(d) ? C.goldLight : '#F5F5F3',
                            color: vol.availability.includes(d) ? C.gold : C.muted,
                            border: vol.availability.includes(d) ? `1px solid ${C.goldBorder}` : '1px solid transparent',
                          }}>
                            {d.slice(0, 2)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    <button style={{ ...btnOutline, padding: '6px 12px', font: `500 12px ${FONT}` }}
                      onClick={() => { setLogForm(f => ({ ...f, volunteerId: vol.id })); setShowLogHours(true); }}>
                      Log Hours
                    </button>
                    <button style={{ ...btnSmall, fontSize: 11 }} onClick={() => toggleStatus(vol)}>
                      {vol.status === 'Active' ? 'Set On Leave' : 'Set Active'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {volunteers.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>+</div>
              <div style={{ font: `400 15px ${FONT}` }}>No volunteers yet. Click "Add Volunteer" to get started.</div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ TAB: SCHEDULE ═══════════════ */}
      {tab === 'schedule' && (
        <div>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            boxShadow: C.shadow, overflow: 'hidden',
          }}>
            {/* Week header */}
            <div style={{
              padding: '16px 24px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ font: `600 16px ${FONT}`, margin: 0 }}>This Week</h3>
                <div style={{ font: `400 13px ${FONT}`, color: C.text2, marginTop: 2 }}>{weekRangeStr}</div>
              </div>
              <div style={{ font: `500 12px ${MONO}`, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Shift Calendar
              </div>
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 300 }}>
              {ALL_DAYS.map((day, di) => {
                const date = weekDates[di];
                const isToday = date && new Date().toDateString() === date.toDateString();
                const availableVols = volunteers.filter(v =>
                  v.status === 'Active' && v.availability && v.availability.includes(day)
                );
                return (
                  <div key={day} style={{
                    borderRight: di < 6 ? `1px solid ${C.border}` : 'none',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    {/* Day header */}
                    <div style={{
                      padding: '12px 8px', textAlign: 'center',
                      borderBottom: `1px solid ${C.border}`,
                      background: isToday ? C.goldLight : '#FAFAF8',
                    }}>
                      <div style={{ font: `600 12px ${MONO}`, color: isToday ? C.gold : C.text2, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {day}
                      </div>
                      {date && (
                        <div style={{
                          font: `500 18px ${FONT}`, color: isToday ? C.gold : C.text, marginTop: 4,
                        }}>
                          {date.getDate()}
                        </div>
                      )}
                    </div>
                    {/* Volunteer names */}
                    <div style={{ padding: 8, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {availableVols.length === 0 && (
                        <div style={{ font: `400 11px ${FONT}`, color: C.muted, textAlign: 'center', padding: '12px 0' }}>
                          No one
                        </div>
                      )}
                      {availableVols.map(v => (
                        <div key={v.id} style={{
                          padding: '6px 10px', borderRadius: 6,
                          background: C.goldLight, border: `1px solid ${C.goldBorder}`,
                          font: `500 12px ${FONT}`, color: C.text,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }} title={`${v.name} - ${v.role}`}>
                          <div style={{ font: `500 12px ${FONT}`, color: C.text }}>{v.name}</div>
                          <div style={{ font: `400 10px ${FONT}`, color: C.text2, marginTop: 2 }}>{v.role}</div>
                        </div>
                      ))}
                    </div>
                    {/* Count footer */}
                    <div style={{
                      padding: '8px', borderTop: `1px solid ${C.border}`, textAlign: 'center',
                      font: `500 11px ${MONO}`, color: availableVols.length > 0 ? C.success : C.muted,
                    }}>
                      {availableVols.length} volunteer{availableVols.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coverage summary */}
          <div style={{
            marginTop: 16, background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: 20, boxShadow: C.shadow,
          }}>
            <h4 style={{ font: `600 14px ${FONT}`, margin: '0 0 12px' }}>Weekly Coverage Summary</h4>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {ALL_DAYS.map(day => {
                const count = volunteers.filter(v =>
                  v.status === 'Active' && v.availability && v.availability.includes(day)
                ).length;
                const color = count >= 3 ? C.success : count >= 1 ? C.warning : C.danger;
                const bg = count >= 3 ? C.successBg : count >= 1 ? C.warningBg : C.dangerBg;
                return (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', background: color,
                    }} />
                    <span style={{ font: `500 13px ${FONT}`, color: C.text }}>{day}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, font: `600 11px ${FONT}`,
                      background: bg, color,
                    }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: HOURS LOG ═══════════════ */}
      {tab === 'hours' && (
        <div>
          {/* Total summary */}
          <div style={{
            display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap',
          }}>
            <div style={{ ...summaryCard, flex: '0 0 auto' }}>
              <div style={summaryLabel}>Total Entries</div>
              <div style={summaryNum}>{hoursLog.length}</div>
            </div>
            <div style={{ ...summaryCard, flex: '0 0 auto' }}>
              <div style={summaryLabel}>Total Hours Logged</div>
              <div style={{ ...summaryNum, color: C.gold }}>{totalLoggedHours}</div>
            </div>
          </div>

          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            boxShadow: C.shadow, overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '110px 1fr 140px 70px 1fr',
              padding: '12px 20px', borderBottom: `2px solid ${C.border}`,
              background: '#FAFAF8',
            }}>
              {['Date', 'Volunteer', 'Activity', 'Hours', 'Notes'].map(h => (
                <div key={h} style={{
                  font: `600 11px ${MONO}`, color: C.text2, textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>{h}</div>
              ))}
            </div>
            {/* Table rows */}
            {sortedHours.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: C.muted, font: `400 14px ${FONT}` }}>
                No hours logged yet. Click "Log Hours" to get started.
              </div>
            )}
            {sortedHours.map((entry, i) => (
              <div key={entry.id || i} style={{
                display: 'grid', gridTemplateColumns: '110px 1fr 140px 70px 1fr',
                padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
                alignItems: 'center',
                background: i % 2 === 0 ? '#fff' : '#FAFAF8',
              }}>
                <div style={{ font: `400 13px ${MONO}`, color: C.text2 }}>{entry.date}</div>
                <div style={{ font: `500 14px ${FONT}`, color: C.text }}>{entry.name || 'Unknown'}</div>
                <div>
                  <span style={pill(C.goldLight, C.gold)}>{entry.activity || 'General'}</span>
                </div>
                <div style={{ font: `600 14px ${FONT}`, color: C.text }}>{entry.hours}h</div>
                <div style={{ font: `400 13px ${FONT}`, color: C.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.notes || '--'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: TRAINING ═══════════════ */}
      {tab === 'training' && (
        <div>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            boxShadow: C.shadow, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 24px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ font: `600 16px ${FONT}`, margin: 0 }}>Training & Certification Matrix</h3>
                <div style={{ font: `400 13px ${FONT}`, color: C.text2, marginTop: 2 }}>
                  Track required certifications for each volunteer
                </div>
              </div>
            </div>

            {/* Matrix table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', font: `400 14px ${FONT}` }}>
                <thead>
                  <tr style={{ background: '#FAFAF8' }}>
                    <th style={{
                      padding: '12px 20px', textAlign: 'left', position: 'sticky', left: 0, background: '#FAFAF8',
                      font: `600 11px ${MONO}`, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: `2px solid ${C.border}`,
                    }}>Volunteer</th>
                    {ALL_CERTS.map(cert => (
                      <th key={cert} style={{
                        padding: '12px 16px', textAlign: 'center', minWidth: 120,
                        font: `600 11px ${MONO}`, color: C.text2, textTransform: 'uppercase',
                        letterSpacing: '0.5px', borderBottom: `2px solid ${C.border}`,
                      }}>{cert}</th>
                    ))}
                    <th style={{
                      padding: '12px 16px', textAlign: 'center',
                      font: `600 11px ${MONO}`, color: C.text2, textTransform: 'uppercase',
                      letterSpacing: '0.5px', borderBottom: `2px solid ${C.border}`,
                    }}>Complete</th>
                    <th style={{
                      padding: '12px 16px', textAlign: 'center',
                      font: `600 11px ${MONO}`, color: C.text2, textTransform: 'uppercase',
                      letterSpacing: '0.5px', borderBottom: `2px solid ${C.border}`,
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((vol, vi) => {
                    const certs = Array.isArray(vol.certifications) ? vol.certifications : [];
                    const hasCert = (c) => certs.some(vc =>
                      vc.toLowerCase().replace(/\s+/g, '') === c.toLowerCase().replace(/\s+/g, '') ||
                      (c === 'Telescope Operations' && vc.toLowerCase().includes('telescope'))
                    );
                    const certCount = ALL_CERTS.filter(c => hasCert(c)).length;
                    const pct = Math.round((certCount / ALL_CERTS.length) * 100);
                    return (
                      <tr key={vol.id} style={{
                        background: vi % 2 === 0 ? '#fff' : '#FAFAF8',
                        borderBottom: `1px solid ${C.border}`,
                      }}>
                        <td style={{
                          padding: '14px 20px', position: 'sticky', left: 0,
                          background: vi % 2 === 0 ? '#fff' : '#FAFAF8',
                          font: `500 14px ${FONT}`, whiteSpace: 'nowrap',
                        }}>
                          <div>{vol.name}</div>
                          <div style={{ font: `400 12px ${FONT}`, color: C.text2 }}>{vol.role}</div>
                        </td>
                        {ALL_CERTS.map(cert => {
                          const has = hasCert(cert);
                          return (
                            <td key={cert} style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleUpdateCerts(vol.id, cert, !has)}
                                style={{
                                  width: 32, height: 32, borderRadius: '50%', border: 'none',
                                  cursor: 'pointer', font: `500 14px ${FONT}`,
                                  background: has ? C.successBg : '#F5F5F3',
                                  color: has ? C.success : '#D0D0D0',
                                  transition: 'all 0.2s',
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                }}
                                title={has ? `Remove ${cert}` : `Add ${cert}`}
                              >
                                {has ? '\u2713' : '\u2715'}
                              </button>
                            </td>
                          );
                        })}
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{
                            font: `600 14px ${FONT}`,
                            color: pct >= 80 ? C.success : pct >= 40 ? C.warning : C.danger,
                          }}>{pct}%</div>
                          <div style={{
                            width: 60, height: 4, borderRadius: 2, background: '#ECECEC',
                            margin: '6px auto 0', overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${pct}%`, height: '100%', borderRadius: 2,
                              background: pct >= 80 ? C.success : pct >= 40 ? C.warning : C.danger,
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            style={{ ...btnSmall, fontSize: 11 }}
                            onClick={() => {
                              setShowCertModal(vol.id);
                            }}
                          >Update</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {volunteers.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: C.muted, font: `400 14px ${FONT}` }}>
                No volunteers to show. Add volunteers first.
              </div>
            )}
          </div>

          {/* Cert legend */}
          <div style={{
            marginTop: 16, background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: 20, boxShadow: C.shadow,
          }}>
            <h4 style={{ font: `600 14px ${FONT}`, margin: '0 0 12px' }}>Required Certifications</h4>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {ALL_CERTS.map(cert => {
                const count = volunteers.filter(v => {
                  const c = Array.isArray(v.certifications) ? v.certifications : [];
                  return c.some(vc => vc.toLowerCase().replace(/\s+/g, '') === cert.toLowerCase().replace(/\s+/g, '') ||
                    (cert === 'Telescope Operations' && vc.toLowerCase().includes('telescope')));
                }).length;
                return (
                  <div key={cert} style={{
                    padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`,
                    background: '#fff', display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ font: `500 13px ${FONT}`, color: C.text }}>{cert}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, font: `600 11px ${FONT}`,
                      background: count > 0 ? C.successBg : C.dangerBg,
                      color: count > 0 ? C.success : C.danger,
                    }}>{count}/{volunteers.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: Update Certifications ═══════════════ */}
      {showCertModal && (() => {
        const vol = volunteers.find(v => v.id === showCertModal);
        if (!vol) return null;
        const certs = Array.isArray(vol.certifications) ? vol.certifications : [];
        return (
          <div style={overlay} onClick={() => setShowCertModal(null)}>
            <div style={modal} onClick={e => e.stopPropagation()}>
              <h2 style={{ font: `600 20px ${FONT}`, margin: '0 0 8px' }}>Update Certifications</h2>
              <p style={{ font: `400 14px ${FONT}`, color: C.text2, margin: '0 0 24px' }}>
                {vol.name} &mdash; {vol.role}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ALL_CERTS.map(cert => {
                  const has = certs.some(vc =>
                    vc.toLowerCase().replace(/\s+/g, '') === cert.toLowerCase().replace(/\s+/g, '') ||
                    (cert === 'Telescope Operations' && vc.toLowerCase().includes('telescope'))
                  );
                  return (
                    <label key={cert} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderRadius: 8, border: `1px solid ${has ? C.goldBorder : C.border}`,
                      background: has ? C.goldLight : '#fff', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}>
                      <input
                        type="checkbox" checked={has}
                        onChange={() => handleUpdateCerts(vol.id, cert, !has)}
                        style={{ width: 18, height: 18, accentColor: C.gold }}
                      />
                      <span style={{ font: `500 14px ${FONT}`, color: C.text }}>{cert}</span>
                    </label>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button style={btnPrimary} onClick={() => setShowCertModal(null)}>Done</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══════════════ MODAL: Log Hours ═══════════════ */}
      {showLogHours && (
        <div style={overlay} onClick={() => setShowLogHours(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ font: `600 20px ${FONT}`, margin: '0 0 24px' }}>Log Volunteer Hours</h2>
            <form onSubmit={handleLogHours}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Volunteer *</label>
                <select style={inputStyle} value={logForm.volunteerId}
                  onChange={e => setLogForm(f => ({ ...f, volunteerId: e.target.value }))}>
                  <option value="">Select volunteer...</option>
                  {volunteers.filter(v => v.status === 'Active').map(v => (
                    <option key={v.id} value={v.id}>{v.name} -- {v.role}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input style={inputStyle} type="date" value={logForm.date}
                    onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Hours *</label>
                  <input style={inputStyle} type="number" min="0.5" step="0.5"
                    value={logForm.hours} placeholder="0"
                    onChange={e => setLogForm(f => ({ ...f, hours: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Activity Type</label>
                <select style={inputStyle} value={logForm.activity}
                  onChange={e => setLogForm(f => ({ ...f, activity: e.target.value }))}>
                  {ACTIVITY_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                  value={logForm.notes} placeholder="Optional notes..."
                  onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" style={btnSmall} onClick={() => setShowLogHours(false)}>Cancel</button>
                <button type="submit" style={btnPrimary}>Log Hours</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: Add / Edit Volunteer ═══════════════ */}
      {showAddForm && (
        <div style={overlay} onClick={() => { setShowAddForm(false); setEditingVol(null); }}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ font: `600 20px ${FONT}`, margin: '0 0 24px' }}>
              {editingVol ? 'Edit Volunteer' : 'Add Volunteer'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Name *</label>
                  <input style={inputStyle} value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name" />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email" />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="(480) 555-0100" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Role</label>
                  <input style={inputStyle} value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. Telescope Operator, Greeter" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Availability</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ALL_DAYS.map(d => (
                      <button key={d} type="button" onClick={() => toggleAvailability(d)}
                        style={{
                          padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
                          font: `500 13px ${FONT}`, transition: 'all 0.15s',
                          background: form.availability.includes(d) ? C.gold : '#F5F5F3',
                          color: form.availability.includes(d) ? '#fff' : C.text2,
                          border: form.availability.includes(d) ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                        }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Certifications</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ALL_CERTS.map(cert => {
                      const certs = Array.isArray(form.certifications) ? form.certifications : [];
                      const has = certs.includes(cert);
                      return (
                        <button key={cert} type="button" onClick={() => toggleCertInForm(cert)}
                          style={{
                            padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                            font: `500 12px ${FONT}`, transition: 'all 0.15s',
                            background: has ? C.gold : '#F5F5F3',
                            color: has ? '#fff' : C.text2,
                            border: has ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                          }}>
                          {has ? '\u2713 ' : ''}{cert}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Additional notes..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" style={btnSmall}
                  onClick={() => { setShowAddForm(false); setEditingVol(null); }}>Cancel</button>
                <button type="submit" style={btnPrimary}>
                  {editingVol ? 'Save Changes' : 'Add Volunteer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
