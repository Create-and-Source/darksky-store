import { useState } from 'react';
import { useToast } from '../AdminLayout';

const EVENT_TYPES = ['Star Party', 'Planetarium Show', 'Workshop', 'Special Event', 'Kids Program', 'Field Trip'];
const LOCATIONS = ['Observatory Deck', 'Planetarium Theater', 'Discovery Lab', 'Outdoor Amphitheater', 'Observation Field', 'Trailhead at Visitor Center'];

const fmt = (cents) => cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;

const INITIAL_EVENTS = [
  { id: 'EVT-001', name: 'New Moon Star Party', type: 'Star Party', date: '2026-03-29', startTime: '20:00', endTime: '23:00', description: 'Experience the darkest skies of the month during our signature New Moon Star Party. Our astronomers will guide you through the constellations with high-powered telescopes, laser pointers, and star charts. Hot cocoa and blankets provided.', location: 'Observatory Deck', capacity: 80, ticketsSold: 35, price: 1500, memberPrice: 0, kidPrice: 800, freeForMembers: true, status: 'Published', image: null, createdBy: 'Nancy', createdDate: '2026-03-01' },
  { id: 'EVT-002', name: 'Planetarium Show: Journey to Mars', type: 'Planetarium Show', date: '2026-04-05', startTime: '14:00', endTime: '15:00', description: 'Travel 140 million miles in 45 minutes. Our state-of-the-art planetarium takes you on a breathtaking flyover of Olympus Mons, through the canyons of Valles Marineris, and into the thin Martian atmosphere.', location: 'Planetarium Theater', capacity: 90, ticketsSold: 28, price: 1200, memberPrice: 0, kidPrice: 800, freeForMembers: true, status: 'Published', image: null, createdBy: 'Nancy', createdDate: '2026-03-05' },
  { id: 'EVT-003', name: 'Astrophotography Workshop', type: 'Workshop', date: '2026-04-12', startTime: '18:00', endTime: '21:00', description: 'Learn to capture the Milky Way, star trails, and deep-sky objects with your own camera. Includes hands-on telescope time and post-processing techniques.', location: 'Observatory Deck', capacity: 20, ticketsSold: 12, price: 3500, memberPrice: 2800, kidPrice: 0, freeForMembers: false, status: 'Published', image: null, createdBy: 'Tovah', createdDate: '2026-03-08' },
  { id: 'EVT-004', name: 'Meteor Shower Watch Party', type: 'Special Event', date: '2026-04-22', startTime: '21:00', endTime: '01:00', description: 'The Lyrids meteor shower peaks tonight. Join us on the observation field with blankets, binoculars, and warm drinks as we count shooting stars together.', location: 'Observation Field', capacity: 200, ticketsSold: 80, price: 1000, memberPrice: 0, kidPrice: 500, freeForMembers: true, status: 'Published', image: null, createdBy: 'Nancy', createdDate: '2026-03-10' },
  { id: 'EVT-005', name: 'Kids Space Camp Saturday', type: 'Kids Program', date: '2026-04-19', startTime: '10:00', endTime: '13:00', description: 'A hands-on morning of space exploration for young astronomers ages 6–12. Build model rockets, explore the solar system in VR, paint constellations.', location: 'Discovery Lab', capacity: 24, ticketsSold: 12, price: 2500, memberPrice: 2000, kidPrice: 2500, freeForMembers: false, status: 'Published', image: null, createdBy: 'Josie', createdDate: '2026-03-06' },
  { id: 'EVT-006', name: 'Full Moon Desert Night Hike', type: 'Special Event', date: '2026-05-04', startTime: '19:30', endTime: '21:30', description: 'Hike through the moonlit Sonoran Desert on a guided 3-mile loop trail. No flashlights needed — the full moon lights the way.', location: 'Trailhead at Visitor Center', capacity: 40, ticketsSold: 12, price: 2000, memberPrice: 1500, kidPrice: 1000, freeForMembers: false, status: 'Draft', image: null, createdBy: 'Tovah', createdDate: '2026-03-12' },
  { id: 'EVT-007', name: 'February New Moon Star Party', type: 'Star Party', date: '2026-02-28', startTime: '19:30', endTime: '22:30', description: 'Monthly new moon star party. Telescopes and star charts provided.', location: 'Observatory Deck', capacity: 80, ticketsSold: 72, price: 1500, memberPrice: 0, kidPrice: 800, freeForMembers: true, status: 'Past', image: null, createdBy: 'Nancy', createdDate: '2026-02-01' },
];

const INITIAL_TICKETS = {
  'EVT-001': [
    { id: 'TK-101', name: 'Sarah Mitchell', email: 'sarah.m@email.com', qty: 2, purchaseDate: '2026-03-15', checkedIn: false, amount: 0 },
    { id: 'TK-102', name: 'James Rodriguez', email: 'jrod@email.com', qty: 4, purchaseDate: '2026-03-16', checkedIn: false, amount: 3200 },
    { id: 'TK-103', name: 'Emily Chen', email: 'echen@email.com', qty: 2, purchaseDate: '2026-03-17', checkedIn: false, amount: 0 },
    { id: 'TK-104', name: 'David Kim', email: 'dkim@email.com', qty: 3, purchaseDate: '2026-03-18', checkedIn: false, amount: 2400 },
    { id: 'TK-105', name: 'Lisa Park', email: 'lpark@email.com', qty: 1, purchaseDate: '2026-03-19', checkedIn: false, amount: 0 },
    { id: 'TK-106', name: 'Michael Torres', email: 'mtorres@email.com', qty: 5, purchaseDate: '2026-03-20', checkedIn: false, amount: 4000 },
    { id: 'TK-107', name: 'Amanda Foster', email: 'afoster@email.com', qty: 2, purchaseDate: '2026-03-20', checkedIn: false, amount: 1600 },
    { id: 'TK-108', name: 'Robert Chang', email: 'rchang@email.com', qty: 4, purchaseDate: '2026-03-21', checkedIn: false, amount: 3200 },
    { id: 'TK-109', name: 'Flagstaff Astronomy Club', email: 'club@flagstaffastro.org', qty: 12, purchaseDate: '2026-03-22', checkedIn: false, amount: 0 },
  ],
  'EVT-003': [
    { id: 'TK-201', name: 'Mark Johnson', email: 'mjohn@email.com', qty: 1, purchaseDate: '2026-03-10', checkedIn: false, amount: 3500 },
    { id: 'TK-202', name: 'Rachel Green', email: 'rgreen@email.com', qty: 1, purchaseDate: '2026-03-11', checkedIn: false, amount: 2800 },
    { id: 'TK-203', name: 'Tom Nguyen', email: 'tnguyen@email.com', qty: 2, purchaseDate: '2026-03-12', checkedIn: false, amount: 7000 },
    { id: 'TK-204', name: 'Sophia Lee', email: 'slee@email.com', qty: 1, purchaseDate: '2026-03-14', checkedIn: false, amount: 2800 },
  ],
};

const BLANK_FORM = {
  name: '', type: 'Star Party', date: '', startTime: '20:00', endTime: '23:00',
  description: '', location: 'Observatory Deck', capacity: 80,
  price: 1500, memberPrice: 0, kidPrice: 800, freeForMembers: true, image: null,
};

const statusBadge = (status) => {
  const cls = { Draft: 'badge-gray', Published: 'badge-green', 'Sold Out': 'badge-gold', Past: 'badge-purple' };
  return <span className={`badge ${cls[status] || 'badge-gray'}`}>{status}</span>;
};

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${ampm}`;
};

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[dt.getDay()]}, ${months[dt.getMonth()]} ${dt.getDate()}`;
};

export default function EventsAdmin() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [view, setView] = useState('list'); // list | form | tickets
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [ticketEvent, setTicketEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const toast = useToast();

  const set = (field) => (e) => {
    const val = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
  };

  // Open create
  const openCreate = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setView('form');
  };

  // Open edit
  const openEdit = (evt) => {
    setEditingId(evt.id);
    setForm({
      name: evt.name, type: evt.type, date: evt.date, startTime: evt.startTime, endTime: evt.endTime,
      description: evt.description, location: evt.location, capacity: evt.capacity,
      price: evt.price, memberPrice: evt.memberPrice, kidPrice: evt.kidPrice,
      freeForMembers: evt.freeForMembers, image: evt.image,
    });
    setView('form');
  };

  // Duplicate
  const duplicateEvent = (evt) => {
    setEditingId(null);
    setForm({
      name: evt.name + ' (Copy)', type: evt.type, date: '', startTime: evt.startTime, endTime: evt.endTime,
      description: evt.description, location: evt.location, capacity: evt.capacity,
      price: evt.price, memberPrice: evt.memberPrice, kidPrice: evt.kidPrice,
      freeForMembers: evt.freeForMembers, image: evt.image,
    });
    setView('form');
    toast('Event duplicated — set a new date and publish');
  };

  // Save
  const saveEvent = (publish) => {
    setSaving(true);
    setTimeout(() => {
      const status = publish ? 'Published' : 'Draft';
      if (editingId) {
        setEvents(prev => prev.map(e => e.id === editingId ? { ...e, ...form, status: publish ? 'Published' : e.status } : e));
        toast(`Event updated${publish ? ' and published' : ''}`);
      } else {
        const newEvt = {
          id: `EVT-${String(events.length + 1).padStart(3, '0')}`,
          ...form, ticketsSold: 0, status, createdBy: 'Tovah',
          createdDate: new Date().toISOString().slice(0, 10),
        };
        setEvents(prev => [newEvt, ...prev]);
        toast(`Event ${publish ? 'published' : 'saved as draft'}`);
      }
      setSaving(false);
      setView('list');
    }, 800);
  };

  // Status changes
  const unpublishEvent = (id) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'Draft' } : e));
    toast('Event unpublished');
    setView('list');
  };

  const cancelEvent = (id) => {
    if (!confirm('Are you sure you want to cancel this event? Ticket holders will need to be notified.')) return;
    setEvents(prev => prev.filter(e => e.id !== id));
    toast('Event cancelled', 'error');
    setView('list');
  };

  // Tickets
  const openTickets = (evt) => {
    setTicketEvent(evt);
    setView('tickets');
  };

  const toggleCheckIn = (evtId, tkId) => {
    setTickets(prev => ({
      ...prev,
      [evtId]: (prev[evtId] || []).map(t => t.id === tkId ? { ...t, checkedIn: !t.checkedIn } : t),
    }));
  };

  const filtered = events.filter(e => statusFilter === 'All' || e.status === statusFilter);

  const isValid = form.name && form.date && form.startTime && form.description && form.capacity > 0;

  // ═══ FORM STYLES ═══
  const inputStyle = {
    width: '100%', padding: '14px 16px', background: '#0a0a1a',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
    font: '400 14px DM Sans', color: '#e8e4df', outline: 'none',
    transition: 'border-color 0.2s', WebkitTapHighlightColor: 'transparent',
  };
  const selectStyle = {
    ...inputStyle, cursor: 'pointer', appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%23908a84\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36,
  };
  const labelStyle = {
    display: 'block', font: '500 11px DM Sans', letterSpacing: '1px',
    textTransform: 'uppercase', color: '#5a5550', marginBottom: 8,
  };

  // ═══ LIST VIEW ═══
  if (view === 'list') {
    return (
      <>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Events</h1>
            <p className="admin-page-subtitle">{events.length} events total</p>
          </div>
          <button className="admin-btn admin-btn-gold admin-btn-lg" onClick={openCreate}>
            + Create Event
          </button>
        </div>

        <div className="admin-table-wrap">
          <div className="admin-filters">
            <div className="admin-filter-tabs">
              {['All', 'Published', 'Draft', 'Past'].map(s => (
                <button key={s} className={`admin-filter-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Price</th>
                  <th>Sold</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(evt => (
                  <tr key={evt.id}>
                    <td>
                      <div className="text-white" style={{ fontWeight: 500 }}>{evt.name}</div>
                      <div style={{ fontSize: 11, color: '#5a5550', marginTop: 2 }}>{evt.type} · {evt.location}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(evt.date)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtTime(evt.startTime)}</td>
                    <td className="text-gold">{fmt(evt.price)}</td>
                    <td>
                      <span className={evt.ticketsSold >= evt.capacity ? 'text-gold' : ''}>
                        {evt.ticketsSold}
                      </span>
                    </td>
                    <td>{evt.capacity}</td>
                    <td>{statusBadge(evt.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(evt)}>Edit</button>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openTickets(evt)}>Tickets</button>
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          title="Duplicate this event"
                          onClick={() => duplicateEvent(evt)}
                          style={{ padding: '7px 10px' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: '#5a5550' }}>No events match this filter</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // ═══ TICKETS VIEW ═══
  if (view === 'tickets' && ticketEvent) {
    const evtTickets = tickets[ticketEvent.id] || [];
    const totalRevenue = evtTickets.reduce((s, t) => s + t.amount, 0);
    const totalQty = evtTickets.reduce((s, t) => s + t.qty, 0);
    const checkedInCount = evtTickets.filter(t => t.checkedIn).length;

    return (
      <>
        <button onClick={() => setView('list')} style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
          background: 'none', border: 'none', color: '#908a84', cursor: 'pointer',
          font: '400 13px DM Sans',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
          Back to events
        </button>

        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">{ticketEvent.name}</h1>
            <p className="admin-page-subtitle">{fmtDate(ticketEvent.date)} · {fmtTime(ticketEvent.startTime)} · {ticketEvent.location}</p>
          </div>
          <button className="admin-btn admin-btn-outline" onClick={() => openEdit(ticketEvent)}>Edit Event</button>
        </div>

        <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="admin-stat">
            <div className="admin-stat-label">Tickets Sold</div>
            <div className="admin-stat-value">{ticketEvent.ticketsSold}</div>
            <div className="admin-stat-sub">of {ticketEvent.capacity} capacity</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Bookings</div>
            <div className="admin-stat-value">{evtTickets.length}</div>
            <div className="admin-stat-sub">{totalQty} total guests</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Revenue</div>
            <div className="admin-stat-value gold">{fmt(totalRevenue)}</div>
            <div className="admin-stat-sub">{evtTickets.filter(t => t.amount === 0).length} free (members)</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Checked In</div>
            <div className="admin-stat-value">{checkedInCount}</div>
            <div className="admin-stat-sub">of {evtTickets.length} bookings</div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title">Ticket Holders</span>
            <span style={{ font: '400 12px DM Sans', color: '#5a5550' }}>Tap check-in to mark arrival</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Check-in</th>
                <th>Name</th>
                <th>Email</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Purchased</th>
              </tr>
            </thead>
            <tbody>
              {evtTickets.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#5a5550' }}>No tickets sold yet</td></tr>
              ) : evtTickets.map(tk => (
                <tr key={tk.id}>
                  <td>
                    <button
                      onClick={() => toggleCheckIn(ticketEvent.id, tk.id)}
                      style={{
                        width: 40, height: 40, borderRadius: 6,
                        background: tk.checkedIn ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${tk.checkedIn ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        color: tk.checkedIn ? '#4ade80' : '#5a5550',
                        cursor: 'pointer', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', WebkitTapHighlightColor: 'transparent',
                      }}
                    >{tk.checkedIn ? '✓' : ''}</button>
                  </td>
                  <td className="text-white" style={{ fontWeight: tk.checkedIn ? 400 : 500, opacity: tk.checkedIn ? 0.6 : 1 }}>
                    {tk.name}
                  </td>
                  <td style={{ fontSize: 12, opacity: tk.checkedIn ? 0.5 : 1 }}>{tk.email}</td>
                  <td>{tk.qty}</td>
                  <td className={tk.amount > 0 ? 'text-gold' : ''}>
                    {tk.amount === 0 ? <span className="badge badge-green" style={{ fontSize: 9 }}>Member</span> : fmt(tk.amount)}
                  </td>
                  <td>{tk.purchaseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // ═══ FORM VIEW (Create / Edit) ═══
  return (
    <>
      <button onClick={() => setView('list')} style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
        background: 'none', border: 'none', color: '#908a84', cursor: 'pointer',
        font: '400 13px DM Sans',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
        Back to events
      </button>

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{editingId ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="admin-page-subtitle">{editingId ? 'Update event details below' : 'Fill out the details to create a new event'}</p>
        </div>
      </div>

      <div style={{ maxWidth: 800 }}>
        {/* Event Name */}
        <div className="admin-panel">
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Event Name *</label>
            <input
              style={{ ...inputStyle, fontSize: 18, fontFamily: 'Playfair Display, serif', padding: '16px 18px' }}
              placeholder="e.g. New Moon Star Party"
              value={form.name}
              onChange={set('name')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="evt-form-grid">
            <div>
              <label style={labelStyle}>Event Type *</label>
              <select style={selectStyle} value={form.type} onChange={set('type')}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Location *</label>
              <select style={selectStyle} value={form.location} onChange={set('location')}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="admin-panel">
          <h3 style={{ font: '500 14px DM Sans', color: '#e8e4df', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(212,175,55,0.06)' }}>
            Date & Time
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }} className="evt-form-grid-3">
            <div>
              <label style={labelStyle}>Date *</label>
              <input style={inputStyle} type="date" value={form.date} onChange={set('date')} />
              {form.date && (
                <p style={{ font: '400 12px DM Sans', color: '#d4af37', marginTop: 6 }}>
                  {fmtDate(form.date)}
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Start Time *</label>
              <input style={inputStyle} type="time" value={form.startTime} onChange={set('startTime')} />
              {form.startTime && (
                <p style={{ font: '400 12px DM Sans', color: '#908a84', marginTop: 6 }}>{fmtTime(form.startTime)}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input style={inputStyle} type="time" value={form.endTime} onChange={set('endTime')} />
              {form.endTime && (
                <p style={{ font: '400 12px DM Sans', color: '#908a84', marginTop: 6 }}>{fmtTime(form.endTime)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="admin-panel">
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 140, resize: 'vertical', lineHeight: 1.7 }}
              placeholder="Describe what guests will experience. Include what's provided, what to bring, and any age restrictions..."
              value={form.description}
              onChange={set('description')}
            />
            <p style={{ font: '300 11px DM Sans', color: '#5a5550', marginTop: 4 }}>
              This text appears on the public events page. Write it for your audience — be inviting!
            </p>
          </div>

          <div>
            <label style={labelStyle}>Capacity *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                style={{ ...inputStyle, width: 120, textAlign: 'center', fontSize: 18, fontWeight: 600 }}
                type="number" min="1" max="500"
                value={form.capacity}
                onChange={set('capacity')}
              />
              <span style={{ font: '400 13px DM Sans', color: '#5a5550' }}>maximum guests</span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="admin-panel">
          <h3 style={{ font: '500 14px DM Sans', color: '#e8e4df', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(212,175,55,0.06)' }}>
            Pricing
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }} className="evt-form-grid-3">
            <div>
              <label style={labelStyle}>General Admission</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5550', font: '400 14px DM Sans' }}>$</span>
                <input
                  style={{ ...inputStyle, paddingLeft: 28, fontSize: 16, fontWeight: 600 }}
                  type="number" min="0" step="1"
                  value={(form.price / 100).toFixed(2)}
                  onChange={e => setForm(f => ({ ...f, price: Math.round(parseFloat(e.target.value || 0) * 100) }))}
                />
              </div>
              <p style={{ font: '300 11px DM Sans', color: '#5a5550', marginTop: 4 }}>Per person</p>
            </div>
            <div>
              <label style={labelStyle}>Member Price</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5550', font: '400 14px DM Sans' }}>$</span>
                <input
                  style={{ ...inputStyle, paddingLeft: 28, opacity: form.freeForMembers ? 0.3 : 1 }}
                  type="number" min="0" step="1"
                  value={(form.memberPrice / 100).toFixed(2)}
                  onChange={e => setForm(f => ({ ...f, memberPrice: Math.round(parseFloat(e.target.value || 0) * 100) }))}
                  disabled={form.freeForMembers}
                />
              </div>
              <p style={{ font: '300 11px DM Sans', color: '#5a5550', marginTop: 4 }}>
                {form.freeForMembers ? 'Overridden by free toggle' : 'Discounted rate'}
              </p>
            </div>
            <div>
              <label style={labelStyle}>Kids Price</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5550', font: '400 14px DM Sans' }}>$</span>
                <input
                  style={{ ...inputStyle, paddingLeft: 28 }}
                  type="number" min="0" step="1"
                  value={(form.kidPrice / 100).toFixed(2)}
                  onChange={e => setForm(f => ({ ...f, kidPrice: Math.round(parseFloat(e.target.value || 0) * 100) }))}
                />
              </div>
              <p style={{ font: '300 11px DM Sans', color: '#5a5550', marginTop: 4 }}>Ages 12 and under</p>
            </div>
          </div>

          {/* Free for members toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div>
              <div style={{ font: '500 13px DM Sans', color: '#e8e4df', marginBottom: 2 }}>Free for Members</div>
              <div style={{ font: '300 11px DM Sans', color: '#5a5550' }}>
                {form.freeForMembers ? 'Members attend this event at no charge' : 'Members pay the member price above'}
              </div>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, freeForMembers: !f.freeForMembers }))}
              style={{
                width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: form.freeForMembers ? '#d4af37' : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: form.freeForMembers ? 27 : 3,
                transition: 'left 0.25s cubic-bezier(.16,1,.3,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="admin-panel">
          <label style={labelStyle}>Event Image</label>
          <div style={{
            border: '2px dashed rgba(212,175,55,0.2)', borderRadius: 8,
            padding: '36px 24px', textAlign: 'center',
            background: 'rgba(212,175,55,0.02)', cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#d4af37'; }}
          onDragLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'}
          onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; toast('Image upload coming soon'); }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1" style={{ marginBottom: 10, opacity: 0.5 }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
            </svg>
            <p style={{ font: '400 14px DM Sans', color: '#908a84', marginBottom: 4 }}>
              Drag an image here, or click to browse
            </p>
            <p style={{ font: '300 11px DM Sans', color: '#5a5550' }}>
              Recommended: 1200×600px. JPG, PNG, or WebP.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
          <button
            className="admin-btn admin-btn-gold admin-btn-lg"
            disabled={!isValid || saving}
            onClick={() => saveEvent(true)}
            style={{ minWidth: 140 }}
          >
            {saving ? <><span className="admin-spinner" style={{ marginRight: 8 }} /> Saving...</> : (editingId ? 'Save & Publish' : 'Publish Event')}
          </button>
          <button
            className="admin-btn admin-btn-outline admin-btn-lg"
            disabled={!isValid || saving}
            onClick={() => saveEvent(false)}
          >
            Save as Draft
          </button>
          {editingId && (
            <>
              {events.find(e => e.id === editingId)?.status === 'Published' && (
                <button className="admin-btn admin-btn-ghost admin-btn-lg" onClick={() => unpublishEvent(editingId)}>
                  Unpublish
                </button>
              )}
              <button className="admin-btn admin-btn-danger admin-btn-lg" onClick={() => cancelEvent(editingId)}>
                Cancel Event
              </button>
            </>
          )}
          <div style={{ flex: 1 }} />
          <button className="admin-btn admin-btn-ghost admin-btn-lg" onClick={() => setView('list')}>
            Discard
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .evt-form-grid, .evt-form-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
