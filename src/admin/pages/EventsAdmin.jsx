import { useState, useEffect } from 'react';
import { useToast } from '../AdminLayout';
import Wizard from '../components/Wizard';
import PageTour from '../components/PageTour';
import { undoable } from '../components/UndoSystem';
import {
  getEvents, addEvent, updateEvent, deleteEvent,
  getReservations, updateReservation, subscribe, formatPrice,
} from '../data/store';

const EVENT_TYPES = [
  { id: 'Star Party', icon: '\u2B50', desc: 'Outdoor stargazing under dark skies' },
  { id: 'Planetarium Show', icon: '\uD83C\uDF0C', desc: 'Indoor dome theater presentations' },
  { id: 'Workshop', icon: '\uD83D\uDD2D', desc: 'Hands-on learning experiences' },
  { id: 'Special Event', icon: '\uD83C\uDF1F', desc: 'Unique one-time happenings' },
  { id: 'Kids Program', icon: '\uD83D\uDE80', desc: 'Activities designed for young explorers' },
];

const LOCATION_OPTIONS = [
  { id: 'Observatory Deck', icon: '\uD83C\uDFDB\uFE0F', desc: 'Open-air viewing platform' },
  { id: 'Planetarium Theater', icon: '\uD83C\uDFA6', desc: 'Domed immersive theater' },
  { id: 'Education Center', icon: '\uD83D\uDCDA', desc: 'Indoor classroom space' },
  { id: 'Outdoor Area', icon: '\uD83C\uDF32', desc: 'Open field and trails' },
];

const fmt = (cents) => cents === 0 ? 'Free' : formatPrice(cents);

const BLANK_FORM = {
  title: '', category: 'Star Party', date: '', time: '', endTime: '',
  description: '', location: 'Observatory Deck', capacity: 30,
  price: '', memberFree: false, featured: false,
};

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};

const fmtTime12 = (t) => {
  if (!t) return '';
  const parts = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (parts && parts[3]) return t;
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${ampm}`;
};

const addHours = (timeStr, hours) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const newH = (h + hours) % 24;
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const inputStyle = {
  width: '100%', padding: '14px 16px', height: 48, background: '#FFFFFF',
  border: '1px solid #E2E8F0', borderRadius: 12,
  font: '400 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'flex', alignItems: 'center',
  font: '500 13px -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '1px',
  textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8,
};

const cardSelectorStyle = (selected) => ({
  padding: '16px 18px', textAlign: 'left', cursor: 'pointer',
  background: '#FFFFFF',
  border: `2px solid ${selected ? '#D4AF37' : '#E2E8F0'}`,
  borderRadius: 12, transition: 'all 0.2s',
  boxShadow: selected ? '0 0 0 3px rgba(212,175,55,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
});

const toggleStyle = (active) => ({
  width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
  background: active ? '#D4AF37' : '#E2E8F0',
  position: 'relative', transition: 'background 0.25s', flexShrink: 0,
});

const toggleKnob = (active) => ({
  width: 22, height: 22, borderRadius: '50%', background: '#fff',
  position: 'absolute', top: 3,
  left: active ? 27 : 3,
  transition: 'left 0.25s cubic-bezier(.16,1,.3,1)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
});

export default function EventsAdmin() {
  const [, setTick] = useState(0);
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [ticketEvent, setTicketEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterTab, setFilterTab] = useState('Upcoming');
  const [deleteModal, setDeleteModal] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const unsub = subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const events = getEvents();
  const reservations = getReservations();

  const set = (field) => (e) => {
    const val = e.target.type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value;
    setForm(f => {
      const updated = { ...f, [field]: val };
      if (field === 'time' && !f.endTime && val) {
        updated.endTime = addHours(val, 2);
      }
      return updated;
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setView('wizard');
  };

  const openEdit = (evt) => {
    setEditingId(evt.id);
    setForm({
      title: evt.title,
      category: evt.category,
      date: evt.date,
      time: evt.time || '',
      endTime: evt.endTime || '',
      description: evt.description || '',
      location: evt.location || 'Observatory Deck',
      capacity: evt.capacity || 30,
      price: evt.price != null ? (evt.price / 100).toFixed(2) : '',
      memberFree: evt.memberFree || false,
      featured: evt.featured || false,
    });
    setView('wizard');
  };

  const duplicateEvent = (evt) => {
    setEditingId(null);
    setForm({
      title: 'Copy of ' + evt.title,
      category: evt.category,
      date: '',
      time: evt.time || '',
      endTime: evt.endTime || '',
      description: evt.description || '',
      location: evt.location || 'Observatory Deck',
      capacity: evt.capacity || 30,
      price: evt.price != null ? (evt.price / 100).toFixed(2) : '',
      memberFree: evt.memberFree || false,
      featured: evt.featured || false,
    });
    setView('wizard');
    toast('Event duplicated -- set a new date and publish');
  };

  const saveEvent = (publish) => {
    if (!form.title.trim()) return;
    setSaving(true);
    const priceCents = Math.round((parseFloat(form.price) || 0) * 100);
    const status = publish ? 'Published' : 'Draft';

    setTimeout(() => {
      if (editingId) {
        updateEvent(editingId, {
          title: form.title,
          category: form.category,
          date: form.date,
          time: form.time,
          endTime: form.endTime,
          description: form.description,
          location: form.location,
          capacity: parseInt(form.capacity) || 30,
          price: priceCents,
          memberFree: form.memberFree,
          featured: form.featured,
          ...(publish ? { status: 'Published' } : {}),
        });
        toast(`Event updated${publish ? ' and published' : ''}`);
      } else {
        addEvent({
          title: form.title,
          category: form.category,
          date: form.date,
          time: form.time,
          endTime: form.endTime,
          description: form.description,
          location: form.location,
          capacity: parseInt(form.capacity) || 30,
          price: priceCents,
          memberFree: form.memberFree,
          featured: form.featured,
          ticketsSold: 0,
          status,
        });
        toast(`Event ${publish ? 'published' : 'saved as draft'}`);
      }
      setSaving(false);
      setView('list');
    }, 600);
  };

  const handleDelete = (id) => {
    undoable('Event deleted', 'ds_events', () => deleteEvent(id));
    toast('Event deleted. You can undo from the notification.');
    setDeleteModal(null);
    setView('list');
  };

  const handleCheckIn = (resId) => {
    updateReservation(resId, { checkedIn: true, checkedInAt: new Date().toISOString() });
    toast('Guest checked in');
  };

  const openTickets = (evt) => {
    setTicketEvent(evt);
    setView('tickets');
  };

  const today = new Date().toISOString().slice(0, 10);
  const filtered = events.filter(e => {
    if (filterTab === 'Upcoming') return e.status === 'Published' && e.date >= today;
    if (filterTab === 'Past') return e.date < today && e.status === 'Published';
    if (filterTab === 'Drafts') return e.status === 'Draft';
    return true;
  });

  // ---- DELETE MODAL ----
  const deleteModalEl = deleteModal && (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
    }} onClick={() => setDeleteModal(null)}>
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 12, padding: 36, maxWidth: 420, width: '90%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#EF4444', fontSize: 22 }}>
          !
        </div>
        <h3 style={{ font: "500 18px/1.3 -apple-system, BlinkMacSystemFont, sans-serif", color: '#1E293B', marginBottom: 8 }}>Delete Event?</h3>
        <p style={{ font: '400 15px/1.6 -apple-system, BlinkMacSystemFont, sans-serif', color: '#64748B', marginBottom: 24 }}>
          This will remove the event and all associated data. You can undo this action.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="admin-btn admin-btn-ghost admin-btn-lg" onClick={() => setDeleteModal(null)}>Cancel</button>
          <button className="admin-btn admin-btn-lg" style={{ background: '#EF4444', color: '#fff' }} onClick={() => handleDelete(deleteModal)}>Delete Event</button>
        </div>
      </div>
    </div>
  );

  // ---- LIST VIEW ----
  if (view === 'list') {
    return (
      <>
        <PageTour storageKey="ds_tour_events" steps={[
          { target: '#tour-events-list', title: 'Event List', text: 'All your events are shown here as cards. Click Edit to modify or View Tickets to check reservations.' },
          { target: '#tour-events-create', title: 'Create Event', text: 'Click this button to create a new event using a step-by-step wizard.' },
          { target: '#tour-events-tickets', title: 'Ticket Tracking', text: 'Each event card shows a progress bar with tickets sold vs. capacity.' },
        ]} />

        <div className="admin-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div>
              <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center' }}>
                Events
                
              </h1>
              <p className="admin-page-subtitle">Create and manage your star parties, shows, and workshops. Published events appear on your website.</p>
            </div>
          </div>
          <button id="tour-events-create" className="admin-btn admin-btn-gold admin-btn-lg" onClick={openCreate} style={{ height: 48 }}>
            + New Event
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: 'fit-content' }}>
          {['Upcoming', 'Past', 'Drafts'].map(tab => (
            <button key={tab} onClick={() => setFilterTab(tab)} style={{
              padding: '10px 20px', font: "500 14px -apple-system, BlinkMacSystemFont, sans-serif",
              background: filterTab === tab ? 'rgba(212,175,55,0.1)' : 'transparent',
              color: filterTab === tab ? '#D4AF37' : '#64748B',
              border: 'none', borderRight: '1px solid #E2E8F0',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{tab}</button>
          ))}
        </div>

        {/* Event cards */}
        {filtered.length === 0 ? (
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
            padding: '60px 40px', textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83C\uDF1F'}</div>
            <div style={{ font: '500 18px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 8 }}>
              {events.length === 0 ? 'No events yet' : 'No events match this filter'}
            </div>
            <p style={{ font: '400 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 24 }}>
              {events.length === 0 ? "You haven't created any events yet. Click '+ New Event' to get started — we'll walk you through it step by step." : 'Try a different filter to see your events.'}
            </p>
            {events.length === 0 && (
              <button className="admin-btn admin-btn-gold admin-btn-lg" onClick={openCreate} style={{ height: 48 }}>
                + Create First Event
              </button>
            )}
          </div>
        ) : (
          <div id="tour-events-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {filtered.map(evt => {
              const sold = evt.ticketsSold || 0;
              const cap = evt.capacity || 30;
              const pct = Math.min(100, Math.round((sold / cap) * 100));
              return (
                <div key={evt.id} style={{
                  background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
                  padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.2s',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {evt.featured && <span style={{ color: '#D4AF37', fontSize: 14 }}>{'\u2B50'}</span>}
                        <h3 style={{ font: '600 16px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {evt.title}
                        </h3>
                      </div>
                      <p style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', margin: 0 }}>
                        {evt.category}
                      </p>
                    </div>
                    <span className={`badge ${evt.status === 'Published' ? 'badge-green' : 'badge-gray'}`}>
                      {evt.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 16 }}>
                    <div>
                      <div style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 2 }}>Date</div>
                      <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>{fmtDate(evt.date)}</div>
                    </div>
                    <div>
                      <div style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 2 }}>Time</div>
                      <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>
                        {fmtTime12(evt.time)}{evt.endTime ? ` - ${fmtTime12(evt.endTime)}` : ''}
                      </div>
                    </div>
                    <div>
                      <div style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 2 }}>Location</div>
                      <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>{evt.location}</div>
                    </div>
                    <div>
                      <div style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 2 }}>Price</div>
                      <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37' }}>
                        {evt.memberFree ? 'Free (members)' : fmt(evt.price)}
                      </div>
                    </div>
                  </div>

                  {/* Ticket progress */}
                  <div id="tour-events-tickets" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ font: '400 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#64748B' }}>
                        {sold} / {cap} tickets sold
                      </span>
                      <span style={{ font: '500 13px -apple-system, BlinkMacSystemFont, sans-serif', color: pct >= 90 ? '#EF4444' : pct >= 70 ? '#D4AF37' : '#10B981' }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: 3,
                        background: pct >= 90 ? '#EF4444' : pct >= 70 ? '#D4AF37' : '#10B981',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
                    <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(evt)} style={{ height: 36 }}>Edit</button>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => duplicateEvent(evt)} style={{ height: 36 }}>Duplicate</button>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openTickets(evt)} style={{ height: 36 }}>View Tickets</button>
                    <div style={{ flex: 1 }} />
                    <button
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      title="Delete event"
                      onClick={() => setDeleteModal(evt.id)}
                      style={{ height: 36, padding: '0 10px', color: '#EF4444' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {deleteModalEl}
      </>
    );
  }

  // ---- TICKETS VIEW (Drawer-style) ----
  if (view === 'tickets' && ticketEvent) {
    const evtReservations = reservations.filter(r => r.eventId === ticketEvent.id);
    const totalQty = evtReservations.reduce((s, r) => s + (r.qty || 1), 0);
    const checkedInCount = evtReservations.filter(r => r.checkedIn).length;

    return (
      <>
        <button onClick={() => setView('list')} style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
          background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
          font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
          Back to events
        </button>

        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">{ticketEvent.title}</h1>
            <p className="admin-page-subtitle">{fmtDate(ticketEvent.date)} {fmtTime12(ticketEvent.time)} {ticketEvent.location}</p>
          </div>
          <button className="admin-btn admin-btn-outline" onClick={() => openEdit(ticketEvent)} style={{ height: 48 }}>Edit Event</button>
        </div>

        <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="admin-stat">
            <div className="admin-stat-label">Tickets Sold</div>
            <div className="admin-stat-value">{ticketEvent.ticketsSold || 0}</div>
            <div className="admin-stat-sub">of {ticketEvent.capacity} capacity</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Reservations</div>
            <div className="admin-stat-value">{evtReservations.length}</div>
            <div className="admin-stat-sub">{totalQty} total guests</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Checked In</div>
            <div className="admin-stat-value">{checkedInCount}</div>
            <div className="admin-stat-sub">of {evtReservations.length} reservations</div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title">Reservations</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Qty</th>
                <th>Date Reserved</th>
                <th>Check-in</th>
              </tr>
            </thead>
            <tbody>
              {evtReservations.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No reservations yet for this event</td></tr>
              ) : evtReservations.map(r => {
                const isChecked = r.checkedIn;
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500, color: '#1E293B' }}>{r.name || 'Guest'}</td>
                    <td style={{ fontSize: 14, color: '#64748B' }}>{r.email || '--'}</td>
                    <td>{r.qty || 1}</td>
                    <td>{r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}</td>
                    <td>
                      {isChecked ? (
                        <span className="badge badge-green">Checked In</span>
                      ) : (
                        <button
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          style={{ height: 32 }}
                          onClick={() => handleCheckIn(r.id)}
                        >Check In</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // ---- WIZARD VIEW ----
  const wizardSteps = [
    {
      label: 'Name',
      validate: () => {
        if (!form.title.trim()) { toast('Please enter an event name'); return false; }
        return true;
      },
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            What's your event called?
          </h2>

          <div style={{ marginBottom: 28 }}>
            <div style={labelStyle}>
              Event Name
            </div>
            <input
              style={{ ...inputStyle, fontSize: 20, padding: '16px 18px', height: 56 }}
              placeholder="e.g. Friday Night Star Party"
              value={form.title}
              onChange={set('title')}
            />
          </div>

          <div>
            <div style={labelStyle}>
              Event Type
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {EVENT_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: t.id }))}
                  style={cardSelectorStyle(form.category === t.id)}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ font: '600 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 2 }}>{t.id}</div>
                  <div style={{ font: '400 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'When',
      validate: () => {
        if (!form.date) { toast('Please pick a date'); return false; }
        return true;
      },
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            When is it happening?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }} className="evt-form-grid-3">
            <div>
              <div style={labelStyle}>
                Date
              </div>
              <input style={{ ...inputStyle, fontSize: 16 }} type="date" value={form.date} onChange={set('date')} />
              {form.date && <p style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37', marginTop: 6 }}>{fmtDate(form.date)}</p>}
            </div>
            <div>
              <div style={labelStyle}>
                Start Time
              </div>
              <input style={{ ...inputStyle, fontSize: 16 }} type="time" value={form.time} onChange={set('time')} />
              {form.time && <p style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#64748B', marginTop: 6 }}>{fmtTime12(form.time)}</p>}
            </div>
            <div>
              <div style={labelStyle}>
                End Time
              </div>
              <input style={{ ...inputStyle, fontSize: 16 }} type="time" value={form.endTime} onChange={set('endTime')} />
              {form.endTime && <p style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#64748B', marginTop: 6 }}>{fmtTime12(form.endTime)}</p>}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Where',
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            Where and how many?
          </h2>

          <div style={{ marginBottom: 28 }}>
            <div style={labelStyle}>
              Location
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {LOCATION_OPTIONS.map(loc => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, location: loc.id }))}
                  style={cardSelectorStyle(form.location === loc.id)}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{loc.icon}</div>
                  <div style={{ font: '600 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 2 }}>{loc.id}</div>
                  <div style={{ font: '400 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>{loc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={labelStyle}>
              Capacity
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                style={{ ...inputStyle, width: 140, textAlign: 'center', fontSize: 20, fontWeight: 600 }}
                type="number" min="1" max="500"
                value={form.capacity}
                onChange={set('capacity')}
              />
              <span style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>maximum guests</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Price',
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            How much?
          </h2>

          <div style={{ marginBottom: 28 }}>
            <div style={labelStyle}>
              Price (dollars)
            </div>
            <div style={{ position: 'relative', maxWidth: 220 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', font: '400 18px -apple-system, BlinkMacSystemFont, sans-serif' }}>$</span>
              <input
                style={{ ...inputStyle, paddingLeft: 32, fontSize: 20, fontWeight: 600 }}
                type="number" min="0" step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={set('price')}
              />
            </div>
            <p style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginTop: 6 }}>Enter 0 for free events</p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 12,
          }}>
            <div>
              <div style={labelStyle}>
                Free for Members?
              </div>
              <div style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>
                {form.memberFree ? 'Members attend this event at no charge' : 'Members pay the regular price'}
              </div>
            </div>
            <button onClick={() => setForm(f => ({ ...f, memberFree: !f.memberFree }))} style={toggleStyle(form.memberFree)} type="button">
              <div style={toggleKnob(form.memberFree)} />
            </button>
          </div>
        </div>
      ),
    },
    {
      label: 'Details',
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            Tell people about it
          </h2>

          <div style={{ marginBottom: 28 }}>
            <div style={labelStyle}>
              Description
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: 160, resize: 'vertical', lineHeight: 1.7, height: 'auto' }}
              placeholder="Describe what guests will experience..."
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 12,
          }}>
            <div>
              <div style={labelStyle}>
                Featured Event
              </div>
              <div style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>
                {form.featured ? 'This event is highlighted on the homepage' : 'Standard listing'}
              </div>
            </div>
            <button onClick={() => setForm(f => ({ ...f, featured: !f.featured }))} style={toggleStyle(form.featured)} type="button">
              <div style={toggleKnob(form.featured)} />
            </button>
          </div>
        </div>
      ),
    },
    {
      label: 'Review',
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            Review and Publish
          </h2>

          {/* Dark-themed preview card */}
          <div style={{ marginBottom: 28 }}>
            <div style={labelStyle}>Website Preview</div>
            <div style={{
              background: '#0F172A', borderRadius: 12, padding: 28, color: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  {form.featured && <span style={{ font: '500 11px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Featured Event</span>}
                  <h3 style={{ font: '700 20px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#FFFFFF', margin: 0, marginBottom: 4 }}>
                    {form.title || 'Event Name'}
                  </h3>
                  <p style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', margin: 0 }}>{form.category}</p>
                </div>
                <div style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                  <div style={{ font: '700 20px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37' }}>
                    {form.price ? `$${parseFloat(form.price).toFixed(2)}` : 'Free'}
                  </div>
                  <div style={{ font: '400 11px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>per ticket</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ font: '400 11px -apple-system, BlinkMacSystemFont, sans-serif', color: '#64748B', marginBottom: 2 }}>Date</div>
                  <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#E2E8F0' }}>{fmtDate(form.date) || 'TBD'}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ font: '400 11px -apple-system, BlinkMacSystemFont, sans-serif', color: '#64748B', marginBottom: 2 }}>Time</div>
                  <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#E2E8F0' }}>
                    {fmtTime12(form.time) || 'TBD'}{form.endTime ? ` - ${fmtTime12(form.endTime)}` : ''}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ font: '400 11px -apple-system, BlinkMacSystemFont, sans-serif', color: '#64748B', marginBottom: 2 }}>Location</div>
                  <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#E2E8F0' }}>{form.location}</div>
                </div>
              </div>

              {form.description && (
                <p style={{ font: '400 14px/1.7 -apple-system, BlinkMacSystemFont, sans-serif', color: '#CBD5E1', margin: '0 0 16px' }}>
                  {form.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ font: '400 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#64748B' }}>
                  {form.capacity} spots available {form.memberFree ? ' | Free for members' : ''}
                </span>
                <div style={{ background: '#D4AF37', borderRadius: 8, padding: '10px 20px', font: '600 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#0F172A' }}>
                  Get Tickets
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
            <h4 style={{ font: '600 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 16 }}>Event Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 16px', font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif' }}>
              <span style={{ color: '#94A3B8' }}>Name</span>
              <span style={{ color: '#1E293B', fontWeight: 500 }}>{form.title || '--'}</span>
              <span style={{ color: '#94A3B8' }}>Type</span>
              <span style={{ color: '#1E293B' }}>{form.category}</span>
              <span style={{ color: '#94A3B8' }}>Date</span>
              <span style={{ color: '#1E293B' }}>{fmtDate(form.date) || '--'}</span>
              <span style={{ color: '#94A3B8' }}>Time</span>
              <span style={{ color: '#1E293B' }}>{fmtTime12(form.time) || '--'}{form.endTime ? ` - ${fmtTime12(form.endTime)}` : ''}</span>
              <span style={{ color: '#94A3B8' }}>Location</span>
              <span style={{ color: '#1E293B' }}>{form.location}</span>
              <span style={{ color: '#94A3B8' }}>Capacity</span>
              <span style={{ color: '#1E293B' }}>{form.capacity} people</span>
              <span style={{ color: '#94A3B8' }}>Price</span>
              <span style={{ color: '#D4AF37', fontWeight: 500 }}>{form.price ? `$${parseFloat(form.price).toFixed(2)}` : 'Free'}{form.memberFree ? ' (free for members)' : ''}</span>
              <span style={{ color: '#94A3B8' }}>Featured</span>
              <span style={{ color: '#1E293B' }}>{form.featured ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <button onClick={() => setView('list')} style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
        background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
        font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
        Back to events
      </button>

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{editingId ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="admin-page-subtitle">{editingId ? 'Update event details below' : 'Follow the steps to create a new event'}</p>
        </div>
        {editingId && (
          <button className="admin-btn admin-btn-lg" style={{ background: '#EF4444', color: '#fff', height: 48 }} onClick={() => setDeleteModal(editingId)}>
            Delete Event
          </button>
        )}
      </div>

      <div style={{ maxWidth: 800 }}>
        <Wizard
          steps={wizardSteps}
          onComplete={() => saveEvent(true)}
          onSaveDraft={() => saveEvent(false)}
          completeBtnText={saving ? 'Publishing...' : 'Publish Event'}
          draftBtnText="Save as Draft"
        />
      </div>

      {deleteModalEl}

      <style>{`
        @media (max-width: 860px) {
          .evt-form-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
