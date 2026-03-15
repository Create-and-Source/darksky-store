import { useState, useEffect } from 'react';
import { useToast, useRole } from '../AdminLayout';
import PageTour from '../components/PageTour';
import {
  getFieldTrips, addFieldTrip, updateFieldTrip, formatPrice, subscribe,
} from '../data/store';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const STATUS_COLORS = {
  New: { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
  Contacted: { bg: '#EFF6FF', text: '#3B82F6', border: '#BFDBFE' },
  Confirmed: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  Completed: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  Cancelled: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

const STATUSES = ['All', 'New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'];

const fmtDate = (d) => {
  if (!d) return '--';
  const dt = new Date(d + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};

const BLANK_FORM = {
  school: '', district: '', contact: '', email: '', phone: '',
  grade: '', students: '', chaperones: '', program: 'half-day',
  preferredDate: '', notes: '',
};

const inputStyle = {
  width: '100%', padding: '10px 14px', height: 42, background: '#FFFFFF',
  border: '1px solid #E2E8F0', borderRadius: 8,
  font: `400 14px ${FONT}`, color: C.text, outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', font: `500 12px ${FONT}`, letterSpacing: '0.5px',
  textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6,
};

export default function FieldTripsAdmin() {
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [editingNotes, setEditingNotes] = useState(null);
  const toast = useToast();
  const role = useRole();

  useEffect(() => {
    const unsub = subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const trips = getFieldTrips();

  const statusCounts = {};
  STATUSES.forEach(s => { statusCounts[s] = s === 'All' ? trips.length : trips.filter(t => t.status === s).length; });

  const confirmedOrCompleted = trips.filter(t => t.status === 'Confirmed' || t.status === 'Completed');
  const totalStudents = confirmedOrCompleted.reduce((s, t) => s + (t.students || 0), 0);
  const uniqueSchools = new Set(confirmedOrCompleted.map(t => t.school)).size;

  const filtered = filter === 'All' ? trips : trips.filter(t => t.status === filter);

  const selected = selectedId ? trips.find(t => t.id === selectedId) : null;

  const handleStatusChange = (id, newStatus, extra = {}) => {
    updateFieldTrip(id, { status: newStatus, ...extra });
    toast(`Trip marked as ${newStatus}`);
  };

  const handleNotesBlur = (id, notes) => {
    updateFieldTrip(id, { notes });
    setEditingNotes(null);
    toast('Notes saved');
  };

  const handleAddTrip = () => {
    if (!form.school.trim() || !form.contact.trim() || !form.email.trim()) {
      toast('Please fill in school, contact name, and email', 'error');
      return;
    }
    addFieldTrip({
      school: form.school, district: form.district, contact: form.contact,
      email: form.email, phone: form.phone, grade: form.grade,
      students: parseInt(form.students) || 0, chaperones: parseInt(form.chaperones) || 0,
      program: form.program, preferredDate: form.preferredDate,
      notes: form.notes, confirmedDate: null,
    });
    toast('Field trip request added');
    setForm(BLANK_FORM);
    setShowAddModal(false);
  };

  const getLoginCode = (trip) => {
    if (!trip.email || !trip.school) return '--';
    const emailPrefix = trip.email.split('@')[0];
    const schoolPart = trip.school.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3);
    return `${emailPrefix}-${schoolPart}`;
  };

  // Summary cards
  const summaryCards = [
    { label: 'Total Requests', value: trips.length, color: C.text },
    { label: 'Confirmed', value: statusCounts.Confirmed, color: C.success },
    { label: 'Students This Year', value: totalStudents, color: C.gold },
    { label: 'Schools Served', value: uniqueSchools, color: '#3B82F6' },
  ];

  return (
    <>
      <PageTour storageKey="ds_tour_field_trips" steps={[
        { target: '#tour-ft-summary', title: 'Field Trip Overview', text: 'See a snapshot of all field trip requests, confirmed trips, student counts, and schools served.' },
        { target: '#tour-ft-table', title: 'Trip Requests', text: 'View and manage all field trip requests here. Click View to see full details and update status.' },
        { target: '#tour-ft-filter', title: 'Filter by Status', text: 'Filter trips by their current status: New, Contacted, Confirmed, Completed, or Cancelled.' },
      ]} />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Field Trips</h1>
          <p className="admin-page-subtitle">Manage school field trip requests, confirmations, and scheduling.</p>
        </div>
        <button className="admin-btn admin-btn-gold admin-btn-lg" onClick={() => setShowAddModal(true)} style={{ height: 48 }}>
          + Add Field Trip
        </button>
      </div>

      {/* Summary Cards */}
      <div id="tour-ft-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {summaryCards.map(card => (
          <div key={card.label} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '20px 24px', boxShadow: C.shadow,
          }}>
            <div style={{ font: `400 12px ${MONO}`, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              {card.label}
            </div>
            <div style={{ font: `600 28px ${FONT}`, color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Status Filter Tabs */}
      <div id="tour-ft-filter" style={{ display: 'flex', gap: 0, marginBottom: 24, border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: 'fit-content', flexWrap: 'wrap' }}>
        {STATUSES.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)} style={{
            padding: '10px 18px', font: `500 13px ${FONT}`,
            background: filter === tab ? 'rgba(197,165,90,0.12)' : 'transparent',
            color: filter === tab ? C.gold : '#64748B',
            border: 'none', borderRight: '1px solid #E2E8F0',
            cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            {tab}{tab !== 'All' ? ` (${statusCounts[tab]})` : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      <div id="tour-ft-table" className="admin-table-wrap">
        <table className="admin-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>School</th>
              <th>District</th>
              <th>Grade</th>
              <th>Students</th>
              <th>Program</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 48, color: '#94A3B8' }}>
                No field trips match this filter.
              </td></tr>
            ) : filtered.map(trip => {
              const sc = STATUS_COLORS[trip.status] || STATUS_COLORS.New;
              return (
                <tr key={trip.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedId(selectedId === trip.id ? null : trip.id)}>
                  <td style={{ fontWeight: 600, color: C.text }}>{trip.school}</td>
                  <td style={{ color: C.text2 }}>{trip.district || '--'}</td>
                  <td>{trip.grade || '--'}</td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{trip.students}</span>
                    <span style={{ color: C.text2, fontSize: 13 }}> + {trip.chaperones || 0} chaperones</span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: trip.program === 'full-day' ? 'rgba(197,165,90,0.12)' : 'rgba(59,130,246,0.1)',
                      color: trip.program === 'full-day' ? C.gold : '#3B82F6',
                    }}>
                      {trip.program === 'full-day' ? 'Full Day' : 'Half Day'}
                    </span>
                  </td>
                  <td>{fmtDate(trip.preferredDate)}</td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                    }}>
                      {trip.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-btn admin-btn-outline admin-btn-sm"
                      style={{ height: 32 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedId(selectedId === trip.id ? null : trip.id); }}
                    >
                      {selectedId === trip.id ? 'Close' : 'View'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 28, marginTop: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          animation: 'helpFadeIn 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h2 style={{ font: `600 20px ${FONT}`, color: C.text, margin: 0, marginBottom: 4 }}>{selected.school}</h2>
              <p style={{ font: `400 14px ${FONT}`, color: C.text2, margin: 0 }}>{selected.district}</p>
            </div>
            <span style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: (STATUS_COLORS[selected.status] || STATUS_COLORS.New).bg,
              color: (STATUS_COLORS[selected.status] || STATUS_COLORS.New).text,
              border: `1px solid ${(STATUS_COLORS[selected.status] || STATUS_COLORS.New).border}`,
            }}>
              {selected.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div>
              <div style={labelStyle}>Contact</div>
              <div style={{ font: `500 15px ${FONT}`, color: C.text }}>{selected.contact}</div>
            </div>
            <div>
              <div style={labelStyle}>Email</div>
              <a href={`mailto:${selected.email}`} style={{ font: `500 14px ${FONT}`, color: '#3B82F6', textDecoration: 'none' }}>{selected.email}</a>
            </div>
            <div>
              <div style={labelStyle}>Phone</div>
              <div style={{ font: `500 14px ${FONT}`, color: C.text }}>{selected.phone || '--'}</div>
            </div>
            <div>
              <div style={labelStyle}>Grade</div>
              <div style={{ font: `500 14px ${FONT}`, color: C.text }}>{selected.grade || '--'}</div>
            </div>
            <div>
              <div style={labelStyle}>Students</div>
              <div style={{ font: `500 14px ${FONT}`, color: C.text }}>{selected.students} students + {selected.chaperones || 0} chaperones</div>
            </div>
            <div>
              <div style={labelStyle}>Program</div>
              <div style={{ font: `500 14px ${FONT}`, color: C.text }}>{selected.program === 'full-day' ? 'Full Day' : 'Half Day'}</div>
            </div>
            <div>
              <div style={labelStyle}>Preferred Date</div>
              <div style={{ font: `500 14px ${FONT}`, color: C.text }}>{fmtDate(selected.preferredDate)}</div>
            </div>
            {selected.confirmedDate && (
              <div>
                <div style={labelStyle}>Confirmed Date</div>
                <div style={{ font: `600 14px ${FONT}`, color: C.success }}>{fmtDate(selected.confirmedDate)}</div>
              </div>
            )}
          </div>

          {/* School Login Code */}
          <div style={{
            background: '#F8F7F4', border: '1px solid #E2E8F0', borderRadius: 8,
            padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ font: `500 12px ${MONO}`, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              School Login Code
            </div>
            <code style={{
              font: `600 15px ${MONO}`, color: C.gold, background: 'rgba(197,165,90,0.1)',
              padding: '4px 12px', borderRadius: 6,
            }}>
              {getLoginCode(selected)}
            </code>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <div style={labelStyle}>Notes</div>
            <textarea
              style={{
                ...inputStyle, height: 'auto', minHeight: 80, resize: 'vertical',
                lineHeight: 1.6, font: `400 14px ${FONT}`,
              }}
              defaultValue={selected.notes || ''}
              onFocus={() => setEditingNotes(selected.id)}
              onBlur={(e) => handleNotesBlur(selected.id, e.target.value)}
              placeholder="Add notes about this trip..."
            />
          </div>

          {/* Status Workflow Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            {selected.status === 'New' && (
              <button className="admin-btn admin-btn-lg" style={{ background: '#3B82F6', color: '#fff', height: 42 }}
                onClick={() => handleStatusChange(selected.id, 'Contacted')}>
                Mark as Contacted
              </button>
            )}
            {selected.status === 'Contacted' && (
              <button className="admin-btn admin-btn-lg" style={{ background: C.success, color: '#fff', height: 42 }}
                onClick={() => handleStatusChange(selected.id, 'Confirmed', { confirmedDate: selected.preferredDate })}>
                Confirm Trip
              </button>
            )}
            {selected.status === 'Confirmed' && (
              <button className="admin-btn admin-btn-lg" style={{ background: '#7C3AED', color: '#fff', height: 42 }}
                onClick={() => handleStatusChange(selected.id, 'Completed')}>
                Mark Complete
              </button>
            )}
            {selected.status !== 'Cancelled' && selected.status !== 'Completed' && (
              <button className="admin-btn admin-btn-outline admin-btn-lg" style={{ height: 42, color: C.danger, borderColor: C.danger }}
                onClick={() => handleStatusChange(selected.id, 'Cancelled')}>
                Cancel Trip
              </button>
            )}
            <button className="admin-btn admin-btn-ghost admin-btn-lg" style={{ height: 42, marginLeft: 'auto' }}
              onClick={() => setSelectedId(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Field Trip Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            background: C.card, borderRadius: 16, padding: 32, width: '90%', maxWidth: 600,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ font: `600 20px ${FONT}`, color: C.text, marginBottom: 24, marginTop: 0 }}>Add Field Trip Request</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>School Name *</label>
                <input style={inputStyle} value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} placeholder="e.g. Four Peaks Elementary" />
              </div>
              <div>
                <label style={labelStyle}>District</label>
                <input style={inputStyle} value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="e.g. Fountain Hills USD" />
              </div>
              <div>
                <label style={labelStyle}>Contact Name *</label>
                <input style={inputStyle} value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="e.g. Mrs. Rodriguez" />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@school.org" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(480) 555-0000" />
              </div>
              <div>
                <label style={labelStyle}>Grade Level</label>
                <input style={inputStyle} value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="e.g. 4th Grade" />
              </div>
              <div>
                <label style={labelStyle}>Number of Students</label>
                <input style={inputStyle} type="number" min="1" value={form.students} onChange={e => setForm(f => ({ ...f, students: e.target.value }))} placeholder="45" />
              </div>
              <div>
                <label style={labelStyle}>Chaperones</label>
                <input style={inputStyle} type="number" min="0" value={form.chaperones} onChange={e => setForm(f => ({ ...f, chaperones: e.target.value }))} placeholder="5" />
              </div>
              <div>
                <label style={labelStyle}>Program</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['half-day', 'full-day'].map(p => (
                    <label key={p} style={{
                      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      padding: '10px 18px', borderRadius: 8, flex: 1,
                      border: `2px solid ${form.program === p ? C.gold : '#E2E8F0'}`,
                      background: form.program === p ? 'rgba(197,165,90,0.06)' : 'transparent',
                      transition: 'all 0.15s',
                    }}>
                      <input type="radio" name="program" value={p} checked={form.program === p}
                        onChange={() => setForm(f => ({ ...f, program: p }))}
                        style={{ display: 'none' }} />
                      <span style={{ font: `500 14px ${FONT}`, color: form.program === p ? C.gold : C.text }}>
                        {p === 'half-day' ? 'Half Day' : 'Full Day'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Preferred Date</label>
                <input style={inputStyle} type="date" value={form.preferredDate} onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notes</label>
                <textarea style={{ ...inputStyle, height: 'auto', minHeight: 80, resize: 'vertical', lineHeight: 1.6 }}
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Special needs, accommodations, interests..." />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
              <button className="admin-btn admin-btn-ghost admin-btn-lg" onClick={() => setShowAddModal(false)} style={{ height: 42 }}>Cancel</button>
              <button className="admin-btn admin-btn-gold admin-btn-lg" onClick={handleAddTrip} style={{ height: 42 }}>Add Trip Request</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          #tour-ft-summary { grid-template-columns: 1fr 1fr !important; }
          .admin-table { font-size: 13px; }
        }
        @media (max-width: 560px) {
          #tour-ft-summary { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
