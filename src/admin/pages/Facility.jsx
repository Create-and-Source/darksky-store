import { useState, useEffect, useCallback } from 'react';
import { useToast, useRole } from '../AdminLayout';
import HelpBubble from '../components/HelpBubble';
import {
  getFacilityBookings, addFacilityBooking, updateFacilityBooking,
  deleteFacilityBooking, FACILITY_SPACES, subscribe,
} from '../data/store';

// ── Design Tokens ──
const C = {
  bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A',
  text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F',
  warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)',
};
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const TYPE_COLORS = {
  public: '#4A7FBF',
  'field-trip': '#3D8C6F',
  private: '#C5A55A',
  corporate: '#C5A55A',
  maintenance: '#999',
  community: '#7C6BAF',
};

const BOOKING_TYPES = ['field-trip', 'corporate', 'private', 'public', 'community', 'maintenance'];

const BLANK_BOOKING = {
  organization: '', contact: '', email: '', space: 'observatory',
  date: '', startTime: '09:00', endTime: '11:00', attendees: '',
  type: 'public', notes: '',
};

const fmtTime12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${ampm}`;
};

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[dt.getMonth()]} ${dt.getDate()}`;
};

const fmtDateFull = (d) => {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

function getWeekDates(weekOffset) {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday start
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const isThisWeek = (dateStr, weekDates) => weekDates.includes(dateStr);
const isToday = (dateStr) => dateStr === new Date().toISOString().slice(0, 10);

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

export default function Facility() {
  const toast = useToast();
  const role = useRole();
  const [bookings, setBookings] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK_BOOKING });
  const [selectedBooking, setSelectedBooking] = useState(null);

  const reload = useCallback(() => setBookings(getFacilityBookings()), []);

  useEffect(() => {
    reload();
    return subscribe(reload);
  }, [reload]);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date().toISOString().slice(0, 10);

  // ── Summary stats ──
  const thisWeekBookings = bookings.filter(b => weekDates.includes(b.date));
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const spacesToday = new Set(bookings.filter(b => b.date === today).map(b => b.space)).size;
  const upcomingFieldTrips = bookings.filter(b => b.type === 'field-trip' && b.date >= today).length;

  // ── Handlers ──
  const openNew = (space, date) => {
    setForm({ ...BLANK_BOOKING, space: space || 'observatory', date: date || '' });
    setSelectedBooking(null);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.organization || !form.date || !form.startTime || !form.endTime) {
      toast('Please fill in required fields', 'error');
      return;
    }
    const booking = {
      ...form,
      attendees: Number(form.attendees) || 0,
      status: 'Pending',
    };
    addFacilityBooking(booking);
    toast('Booking created', 'success');
    setShowForm(false);
    setForm({ ...BLANK_BOOKING });
  };

  const handleStatusChange = (id, status) => {
    updateFacilityBooking(id, { status });
    toast(`Booking ${status.toLowerCase()}`, 'success');
    setSelectedBooking(null);
  };

  const handleDelete = (id) => {
    deleteFacilityBooking(id);
    toast('Booking deleted', 'success');
    setSelectedBooking(null);
  };

  const weekLabel = (() => {
    const start = new Date(weekDates[0] + 'T12:00:00');
    const end = new Date(weekDates[6] + 'T12:00:00');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if (start.getMonth() === end.getMonth()) {
      return `${months[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  })();

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ font: `600 24px ${FONT}`, margin: 0 }}>Facility Calendar</h1>
          <HelpBubble text="Manage space bookings across all IDSDC facilities. Click an empty cell to create a booking, or click an existing booking for details." />
        </div>
        <button style={btnPrimary} onClick={() => openNew(null, null)}>+ New Booking</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={summaryCard}>
          <div style={summaryLabel}>This Week's Bookings</div>
          <div style={summaryNum}>{thisWeekBookings.length}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Pending Approvals</div>
          <div style={{ ...summaryNum, color: pendingCount > 0 ? C.warning : C.text }}>{pendingCount}</div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Spaces in Use Today</div>
          <div style={summaryNum}>{spacesToday}<span style={{ font: `400 14px ${FONT}`, color: C.text2 }}> / {FACILITY_SPACES.length}</span></div>
        </div>
        <div style={summaryCard}>
          <div style={summaryLabel}>Upcoming Field Trips</div>
          <div style={{ ...summaryNum, color: C.success }}>{upcomingFieldTrips}</div>
        </div>
      </div>

      {/* Week Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={btnSmall} onClick={() => setWeekOffset(w => w - 1)}>&larr; Prev</button>
          <button style={{ ...btnSmall, ...(weekOffset === 0 ? { background: C.gold, color: '#fff', borderColor: C.gold } : {}) }}
            onClick={() => setWeekOffset(0)}>This Week</button>
          <button style={btnSmall} onClick={() => setWeekOffset(w => w + 1)}>Next &rarr;</button>
        </div>
        <div style={{ font: `500 15px ${FONT}`, color: C.text2 }}>{weekLabel}</div>
      </div>

      {/* Weekly Calendar Grid */}
      <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, boxShadow: C.shadow }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
          <thead>
            <tr>
              <th style={{ width: 180, padding: '12px 16px', textAlign: 'left', font: `600 12px ${MONO}`, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${C.border}`, background: '#FAFAF8' }}>
                Space
              </th>
              {weekDates.map((date, i) => (
                <th key={date} style={{
                  minWidth: 120, padding: '12px 8px', textAlign: 'center',
                  font: `500 12px ${MONO}`, color: isToday(date) ? C.gold : C.text2,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: `1px solid ${C.border}`, borderLeft: `1px solid ${C.border}`,
                  background: isToday(date) ? 'rgba(197,165,90,0.06)' : '#FAFAF8',
                }}>
                  <div>{DAY_NAMES[i]}</div>
                  <div style={{ font: `600 16px ${FONT}`, color: isToday(date) ? C.gold : C.text, marginTop: 2 }}>
                    {new Date(date + 'T12:00:00').getDate()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FACILITY_SPACES.map((space, si) => (
              <tr key={space.id}>
                <td style={{
                  padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
                  background: si % 2 === 0 ? '#fff' : '#FCFCFA',
                  verticalAlign: 'top',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: space.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ font: `500 13px ${FONT}`, color: C.text, lineHeight: 1.3 }}>{space.name}</div>
                      {space.capacity && (
                        <div style={{ font: `400 11px ${MONO}`, color: C.muted, marginTop: 2 }}>Cap: {space.capacity}</div>
                      )}
                    </div>
                  </div>
                </td>
                {weekDates.map((date) => {
                  const cellBookings = bookings.filter(b => b.space === space.id && b.date === date);
                  return (
                    <td
                      key={date}
                      style={{
                        padding: 4, borderBottom: `1px solid ${C.border}`,
                        borderLeft: `1px solid ${C.border}`, verticalAlign: 'top',
                        background: isToday(date)
                          ? (si % 2 === 0 ? 'rgba(197,165,90,0.04)' : 'rgba(197,165,90,0.06)')
                          : (si % 2 === 0 ? '#fff' : '#FCFCFA'),
                        cursor: 'pointer', minHeight: 60,
                      }}
                      onClick={() => {
                        if (cellBookings.length === 0) openNew(space.id, date);
                      }}
                    >
                      {cellBookings.map(b => (
                        <div
                          key={b.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                          style={{
                            padding: '4px 6px', marginBottom: 3, borderRadius: 5,
                            background: `${TYPE_COLORS[b.type] || '#999'}18`,
                            borderLeft: `3px solid ${TYPE_COLORS[b.type] || '#999'}`,
                            cursor: 'pointer', transition: 'opacity 0.15s',
                            opacity: b.status === 'Pending' ? 0.7 : 1,
                          }}
                        >
                          <div style={{ font: `500 10px ${MONO}`, color: TYPE_COLORS[b.type] || '#999' }}>
                            {fmtTime12(b.startTime)}
                          </div>
                          <div style={{
                            font: `500 11px ${FONT}`, color: C.text, marginTop: 1,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            maxWidth: 110,
                          }}>
                            {b.organization}
                          </div>
                        </div>
                      ))}
                      {cellBookings.length === 0 && (
                        <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ font: `400 16px ${FONT}`, color: C.border }}>+</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Type Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ font: `400 12px ${FONT}`, color: C.text2, textTransform: 'capitalize' }}>
              {type.replace('-', ' ')}
            </span>
          </div>
        ))}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div style={overlay} onClick={() => setSelectedBooking(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ font: `600 20px ${FONT}`, margin: 0 }}>{selectedBooking.organization}</h2>
                <div style={{ font: `400 13px ${FONT}`, color: C.text2, marginTop: 4 }}>
                  {FACILITY_SPACES.find(s => s.id === selectedBooking.space)?.name}
                </div>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 20, font: `500 12px ${FONT}`,
                background: selectedBooking.status === 'Confirmed' ? `${C.success}18` : selectedBooking.status === 'Pending' ? `${C.warning}18` : `${C.muted}18`,
                color: selectedBooking.status === 'Confirmed' ? C.success : selectedBooking.status === 'Pending' ? C.warning : C.text2,
              }}>
                {selectedBooking.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 24 }}>
              <div>
                <div style={labelStyle}>Date</div>
                <div style={{ font: `400 14px ${FONT}` }}>{fmtDateFull(selectedBooking.date)}</div>
              </div>
              <div>
                <div style={labelStyle}>Time</div>
                <div style={{ font: `400 14px ${FONT}` }}>{fmtTime12(selectedBooking.startTime)} – {fmtTime12(selectedBooking.endTime)}</div>
              </div>
              <div>
                <div style={labelStyle}>Contact</div>
                <div style={{ font: `400 14px ${FONT}` }}>{selectedBooking.contact}</div>
              </div>
              <div>
                <div style={labelStyle}>Email</div>
                <div style={{ font: `400 14px ${FONT}` }}>{selectedBooking.email}</div>
              </div>
              <div>
                <div style={labelStyle}>Attendees</div>
                <div style={{ font: `400 14px ${FONT}` }}>{selectedBooking.attendees}</div>
              </div>
              <div>
                <div style={labelStyle}>Type</div>
                <div style={{ font: `400 14px ${FONT}`, textTransform: 'capitalize' }}>{selectedBooking.type.replace('-', ' ')}</div>
              </div>
            </div>

            {selectedBooking.notes && (
              <div style={{ marginBottom: 24 }}>
                <div style={labelStyle}>Notes</div>
                <div style={{ font: `400 14px ${FONT}`, color: C.text2 }}>{selectedBooking.notes}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {selectedBooking.status === 'Pending' && (
                <button style={{ ...btnPrimary, background: C.success }} onClick={() => handleStatusChange(selectedBooking.id, 'Confirmed')}>
                  Confirm
                </button>
              )}
              {selectedBooking.status !== 'Completed' && (
                <button style={btnOutline} onClick={() => handleStatusChange(selectedBooking.id, 'Completed')}>
                  Complete
                </button>
              )}
              <button style={{ ...btnOutline, color: C.danger, borderColor: C.danger }} onClick={() => handleDelete(selectedBooking.id)}>
                Delete
              </button>
              <button style={btnSmall} onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {showForm && (
        <div style={overlay} onClick={() => setShowForm(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ font: `600 20px ${FONT}`, margin: '0 0 24px' }}>New Booking</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Organization *</label>
                  <input style={inputStyle} value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} placeholder="Organization name" />
                </div>
                <div>
                  <label style={labelStyle}>Contact</label>
                  <input style={inputStyle} value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Contact person" />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Space</label>
                  <select style={inputStyle} value={form.space} onChange={e => setForm(f => ({ ...f, space: e.target.value }))}>
                    {FACILITY_SPACES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.capacity ? ` (cap: ${s.capacity})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input style={inputStyle} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Attendees</label>
                  <input style={inputStyle} type="number" min="0" value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Start Time *</label>
                  <input style={inputStyle} type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>End Time *</label>
                  <input style={inputStyle} type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select style={inputStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {BOOKING_TYPES.map(t => (
                      <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>&nbsp;</label>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" style={btnSmall} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={btnPrimary}>Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
