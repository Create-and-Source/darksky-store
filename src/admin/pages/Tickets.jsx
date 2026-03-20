import { useState, useEffect } from 'react';
import { getEvents, getTicketTypes, addTicketType, updateTicketType, deleteTicketType, formatPrice, subscribe } from '../data/store';
import { useToast, useRole } from '../AdminLayout';

const C = {
  bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A',
  text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD',
  success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B',
  shadow: '0 1px 3px rgba(0,0,0,0.04)',
};
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";
const card = { background: C.card, border: '1px solid ' + C.border, borderRadius: 10, padding: 24, boxShadow: C.shadow };
const labelStyle = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, margin: 0 };

const EMPTY_TYPE = { name: 'General Admission', price: '', memberPrice: '', capacity: '', desc: '', active: true };

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Tickets() {
  const [, setTick] = useState(0);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [typeModal, setTypeModal] = useState(null); // null | { eventId, type: 'add' | ticketType }
  const [typeForm, setTypeForm] = useState({ ...EMPTY_TYPE });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const role = useRole();
  const canEdit = !['board', 'shop_staff'].includes(role);

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  const events = getEvents().filter(e => e.status === 'Published' || e.status === 'Draft');
  const allTicketTypes = getTicketTypes();

  // ── Aggregate stats ──
  const totalSold = allTicketTypes.reduce((s, t) => s + (t.sold || 0), 0);
  const totalRevenue = allTicketTypes.reduce((s, t) => s + (t.sold || 0) * (t.price || 0), 0);
  const totalCapacity = allTicketTypes.filter(t => t.capacity).reduce((s, t) => s + (t.capacity || 0), 0);

  const filtered = events.filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()));

  const openAddType = (eventId) => {
    setTypeForm({ ...EMPTY_TYPE });
    setTypeModal({ eventId, type: 'add' });
  };
  const openEditType = (tt, eventId) => {
    setTypeForm({
      name: tt.name, price: (tt.price / 100).toFixed(2),
      memberPrice: tt.memberPrice !== null && tt.memberPrice !== undefined ? (tt.memberPrice / 100).toFixed(2) : '',
      capacity: tt.capacity || '', desc: tt.desc || '', active: tt.active,
    });
    setTypeModal({ eventId, type: tt });
  };

  const saveType = (e) => {
    e.preventDefault();
    if (!typeForm.name || typeForm.price === '') { toast('Name and price are required'); return; }
    const payload = {
      eventId: typeModal.eventId,
      name: typeForm.name.trim(),
      price: Math.round(parseFloat(typeForm.price) * 100),
      memberPrice: typeForm.memberPrice !== '' ? Math.round(parseFloat(typeForm.memberPrice) * 100) : null,
      capacity: typeForm.capacity ? Number(typeForm.capacity) : null,
      desc: typeForm.desc.trim(),
      active: typeForm.active,
    };
    if (typeModal.type === 'add') {
      addTicketType(payload);
      toast('Ticket type added');
    } else {
      updateTicketType(typeModal.type.id, payload);
      toast('Ticket type updated');
    }
    setTypeModal(null);
  };

  const handleDelete = () => {
    deleteTicketType(confirmDelete.id);
    toast('Ticket type deleted');
    setConfirmDelete(null);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid ' + C.border,
    borderRadius: 8, font: `14px/1 ${FONT}`, color: C.text, background: C.bg, boxSizing: 'border-box',
  };
  const toggleStyle = (on) => ({
    width: 40, height: 22, borderRadius: 11, background: on ? C.gold : C.border,
    border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0,
  });
  const knobStyle = (on) => ({
    position: 'absolute', top: 3, left: on ? 21 : 3, width: 16, height: 16,
    borderRadius: '50%', background: '#fff', transition: 'left .2s',
  });

  return (
    <div style={{ fontFamily: FONT, color: C.text, paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="admin-page-title">Tickets</h1>
        <p className="admin-page-subtitle">Manage ticket types and pricing per event</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Sold', value: totalSold.toLocaleString() },
          { label: 'Tickets Revenue', value: formatPrice(totalRevenue) },
          { label: 'Reserved Capacity', value: totalCapacity.toLocaleString() },
        ].map(k => (
          <div key={k.label} style={{ ...card, padding: '16px 20px' }}>
            <p style={labelStyle}>{k.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '6px 0 0', color: C.text }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        placeholder="Search events…"
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ ...inputStyle, width: 300, marginBottom: 20 }}
      />

      {/* Event list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ ...card, textAlign: 'center', color: C.muted, padding: 48 }}>No events found</div>
        )}
        {filtered.map(evt => {
          const types = getTicketTypes(evt.id);
          const evtSold = types.reduce((s, t) => s + (t.sold || 0), 0);
          const evtRevenue = types.reduce((s, t) => s + (t.sold || 0) * (t.price || 0), 0);
          const evtCap = evt.capacity || types.filter(t => t.capacity).reduce((s, t) => s + t.capacity, 0);
          const isExpanded = expandedEvent === evt.id;
          const pct = evtCap > 0 ? Math.min((evtSold / evtCap) * 100, 100) : 0;

          return (
            <div key={evt.id} style={card}>
              {/* Event header row */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setExpandedEvent(isExpanded ? null : evt.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{evt.title}</h3>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>{fmtDate(evt.date)} · {evt.location}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: evt.status === 'Published' ? '#E6F4EA' : '#FEF7E0',
                      color: evt.status === 'Published' ? '#1E8E3E' : '#B8860B',
                    }}>{evt.status}</span>
                  </div>
                  {evtCap > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: C.border, maxWidth: 200 }}>
                        <div style={{ height: '100%', borderRadius: 2, background: pct >= 90 ? C.danger : pct >= 70 ? C.warning : C.success, width: pct + '%', transition: 'width .3s' }} />
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.text2 }}>{evtSold}/{evtCap} sold</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 18 }}>{formatPrice(evtRevenue)}</p>
                  <p style={{ margin: 0, fontFamily: MONO, fontSize: 11, color: C.text2 }}>{types.length} ticket type{types.length !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ fontSize: 16, color: C.text2, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</div>
              </div>

              {/* Expanded: ticket types */}
              {isExpanded && (
                <div style={{ marginTop: 20, borderTop: '1px solid ' + C.border, paddingTop: 20 }}>
                  {types.length === 0 && (
                    <p style={{ color: C.muted, fontSize: 14, margin: '0 0 16px' }}>No ticket types yet — add one below.</p>
                  )}
                  {types.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid ' + C.border }}>
                          {['Type', 'Price', 'Member Price', 'Capacity', 'Sold', 'Revenue', 'Status', ''].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, fontWeight: 500 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {types.map(tt => {
                          const cap = tt.capacity;
                          const tPct = cap > 0 ? Math.round((tt.sold / cap) * 100) : null;
                          return (
                            <tr key={tt.id} style={{ borderBottom: '1px solid ' + C.border, opacity: tt.active ? 1 : 0.55 }}>
                              <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                                {tt.name}
                                {tt.desc && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{tt.desc}</div>}
                              </td>
                              <td style={{ padding: '10px 12px', fontFamily: MONO }}>{formatPrice(tt.price)}</td>
                              <td style={{ padding: '10px 12px', fontFamily: MONO }}>
                                {tt.memberPrice === 0 ? <span style={{ color: C.success, fontSize: 12, fontWeight: 600 }}>Free</span> : tt.memberPrice != null ? formatPrice(tt.memberPrice) : '—'}
                              </td>
                              <td style={{ padding: '10px 12px', fontFamily: MONO }}>{cap || '∞'}</td>
                              <td style={{ padding: '10px 12px', fontFamily: MONO }}>
                                {tt.sold || 0}
                                {tPct !== null && <span style={{ color: C.text2, fontSize: 11, marginLeft: 4 }}>({tPct}%)</span>}
                              </td>
                              <td style={{ padding: '10px 12px', fontFamily: MONO }}>{formatPrice((tt.sold || 0) * tt.price)}</td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                  background: tt.active ? '#E6F4EA' : '#F5F5F5',
                                  color: tt.active ? '#1E8E3E' : C.muted,
                                }}>{tt.active ? 'Active' : 'Inactive'}</span>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                  {canEdit && <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditType(tt, evt.id)}>Edit</button>}
                                  {canEdit && (
                                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setConfirmDelete({ id: tt.id, name: tt.name })} style={{ color: C.danger }}>Delete</button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  {canEdit && (
                    <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openAddType(evt.id)}>+ Add Ticket Type</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── TICKET TYPE MODAL ── */}
      {typeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <form onSubmit={saveType} style={{ background: C.card, borderRadius: 12, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20 }}>{typeModal.type === 'add' ? 'Add Ticket Type' : 'Edit Ticket Type'}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <p style={labelStyle}>Type Name</p>
                <input value={typeForm.name} onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="General Admission" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={labelStyle}>Price ($)</p>
                  <input type="number" min="0" step="0.01" value={typeForm.price} onChange={e => setTypeForm(f => ({ ...f, price: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="15.00" />
                </div>
                <div>
                  <p style={labelStyle}>Member Price ($) <span style={{ textTransform: 'none', letterSpacing: 0, color: C.muted }}>(0 = free)</span></p>
                  <input type="number" min="0" step="0.01" value={typeForm.memberPrice} onChange={e => setTypeForm(f => ({ ...f, memberPrice: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="Leave blank = same" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={labelStyle}>Capacity <span style={{ textTransform: 'none', letterSpacing: 0, color: C.muted }}>(blank = unlimited)</span></p>
                  <input type="number" min="0" value={typeForm.capacity} onChange={e => setTypeForm(f => ({ ...f, capacity: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="∞" />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button type="button" onClick={() => setTypeForm(f => ({ ...f, active: !f.active }))} style={toggleStyle(typeForm.active)}>
                      <div style={knobStyle(typeForm.active)} />
                    </button>
                    <span style={{ fontSize: 13 }}>Active / on sale</span>
                  </div>
                </div>
              </div>
              <div>
                <p style={labelStyle}>Description / Note</p>
                <input value={typeForm.desc} onChange={e => setTypeForm(f => ({ ...f, desc: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="e.g. 21+ only, ages 5–12, etc." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => setTypeModal(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: C.card, borderRadius: 12, padding: 32, maxWidth: 400, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>Delete ticket type?</h3>
            <p style={{ color: C.text2, margin: '0 0 24px' }}>Remove <strong>{confirmDelete.name}</strong>? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="admin-btn admin-btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="admin-btn" onClick={handleDelete} style={{ background: C.danger, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
