import React, { useState, useEffect } from 'react';
import {
  getEvents, getTicketTypes, addTicketType, updateTicketType, deleteTicketType,
  getAdmissionProducts, addAdmissionProduct, updateAdmissionProduct, deleteAdmissionProduct,
  getTicketOrders, addTicketOrder, updateTicketOrder, cancelTicketOrder,
  formatPrice, subscribe, generateConfirmationCode, lookupMemberByEmail, getMemberTicketPrice,
} from '../data/store';
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

const TABS = ['Admission Products', 'Event Tickets', 'Orders', 'Check-In'];
const EMPTY_ADMISSION = { name: '', price: '', memberPrice: '', category: 'standard', ageRange: '', desc: '', taxable: false, active: true, sortOrder: 0 };
const EMPTY_TYPE = { name: 'General Admission', price: '', memberPrice: '', capacity: '', desc: '', active: true };
const CATEGORIES = ['standard', 'addon', 'group'];

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return '';
  const dt = new Date(iso);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

export default function Tickets() {
  const [, setTick] = useState(0);
  const [tab, setTab] = useState(0);
  const toast = useToast();
  const role = useRole();
  const canEdit = !['board', 'shop_staff'].includes(role);

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

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
  const selectStyle = { ...inputStyle, appearance: 'none', WebkitAppearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M3 5l3 3 3-3\' fill=\'none\' stroke=\'%237C7B76\' stroke-width=\'1.5\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 };

  const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 };
  const modalBox = { background: C.card, borderRadius: 12, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', maxHeight: '90vh', overflowY: 'auto' };

  const categoryBadge = (cat) => {
    const colors = { standard: { bg: '#E6F4EA', color: '#1E8E3E' }, addon: { bg: '#E8EAF6', color: '#3949AB' }, group: { bg: '#FFF3E0', color: '#E65100' } };
    const c = colors[cat] || colors.standard;
    return { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, textTransform: 'capitalize' };
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text, paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="admin-page-title">Admissions & Tickets</h1>
        <p className="admin-page-subtitle">Manage admission products, event tickets, orders, and check-ins</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid ' + C.border, marginBottom: 24 }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: FONT, fontSize: 14, fontWeight: tab === i ? 600 : 400,
              color: tab === i ? C.gold : C.text2,
              borderBottom: tab === i ? `2px solid ${C.gold}` : '2px solid transparent',
              marginBottom: -1, transition: 'all .15s',
            }}
          >{t}</button>
        ))}
      </div>

      {tab === 0 && <AdmissionProductsTab canEdit={canEdit} toast={toast} inputStyle={inputStyle} toggleStyle={toggleStyle} knobStyle={knobStyle} selectStyle={selectStyle} modalOverlay={modalOverlay} modalBox={modalBox} categoryBadge={categoryBadge} />}
      {tab === 1 && <EventTicketsTab canEdit={canEdit} toast={toast} inputStyle={inputStyle} toggleStyle={toggleStyle} knobStyle={knobStyle} modalOverlay={modalOverlay} modalBox={modalBox} />}
      {tab === 2 && <OrdersTab canEdit={canEdit} toast={toast} inputStyle={inputStyle} selectStyle={selectStyle} modalOverlay={modalOverlay} modalBox={modalBox} categoryBadge={categoryBadge} />}
      {tab === 3 && <CheckInTab toast={toast} inputStyle={inputStyle} />}
    </div>
  );
}


// ══════════════════════════════════════
// TAB 1: ADMISSION PRODUCTS
// ══════════════════════════════════════
function AdmissionProductsTab({ canEdit, toast, inputStyle, toggleStyle, knobStyle, selectStyle, modalOverlay, modalBox, categoryBadge }) {
  const [modal, setModal] = useState(null); // null | 'add' | product
  const [form, setForm] = useState({ ...EMPTY_ADMISSION });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const products = getAdmissionProducts().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const orders = getTicketOrders();
  const today = todayStr();

  // KPIs
  const todayAdmissionOrders = orders.filter(o => o.type === 'admission' && o.visitDate === today && o.status !== 'cancelled');
  const soldToday = todayAdmissionOrders.reduce((s, o) => s + (o.items || []).reduce((ss, i) => ss + (i.qty || 0), 0), 0);
  const revenueToday = todayAdmissionOrders.reduce((s, o) => s + (o.total || 0), 0);
  const activeCount = products.filter(p => p.active).length;

  const openAdd = () => { setForm({ ...EMPTY_ADMISSION, sortOrder: products.length }); setModal('add'); };
  const openEdit = (p) => {
    setForm({
      name: p.name, price: (p.price / 100).toFixed(2),
      memberPrice: p.memberPrice !== null && p.memberPrice !== undefined ? (p.memberPrice / 100).toFixed(2) : '',
      category: p.category || 'standard', ageRange: p.ageRange || '', desc: p.desc || '',
      taxable: !!p.taxable, active: p.active, sortOrder: p.sortOrder || 0,
    });
    setModal(p);
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.name || form.price === '') { toast('Name and price are required'); return; }
    const payload = {
      name: form.name.trim(),
      price: Math.round(parseFloat(form.price) * 100),
      memberPrice: form.memberPrice !== '' ? Math.round(parseFloat(form.memberPrice) * 100) : null,
      category: form.category, ageRange: form.ageRange.trim(), desc: form.desc.trim(),
      taxable: form.taxable, active: form.active, sortOrder: Number(form.sortOrder) || 0,
    };
    if (modal === 'add') {
      addAdmissionProduct(payload);
      toast('Admission product added');
    } else {
      updateAdmissionProduct(modal.id, payload);
      toast('Admission product updated');
    }
    setModal(null);
  };

  const handleDelete = () => {
    deleteAdmissionProduct(confirmDelete.id);
    toast('Admission product deleted');
    setConfirmDelete(null);
  };

  return (
    <>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Admission Sold Today', value: soldToday.toLocaleString() },
          { label: 'Revenue Today', value: formatPrice(revenueToday) },
          { label: 'Active Products', value: activeCount.toLocaleString() },
        ].map(k => (
          <div key={k.label} style={{ ...card, padding: '16px 20px' }}>
            <p style={labelStyle}>{k.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '6px 0 0', color: C.text }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Add button */}
      {canEdit && (
        <div style={{ marginBottom: 20 }}>
          <button className="admin-btn admin-btn-gold" onClick={openAdd}>+ Add Admission Product</button>
        </div>
      )}

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {products.map(p => (
          <div key={p.id} style={{ ...card, opacity: p.active ? 1 : 0.55, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{p.name}</h3>
              <span style={categoryBadge(p.category)}>{p.category}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <div>
                <p style={{ ...labelStyle, fontSize: 10 }}>Price</p>
                <p style={{ margin: '2px 0 0', fontFamily: MONO, fontSize: 18, fontWeight: 700, color: C.text }}>
                  {p.price === 0 ? 'Free' : formatPrice(p.price)}
                </p>
              </div>
              {p.memberPrice !== null && p.memberPrice !== undefined && (
                <div>
                  <p style={{ ...labelStyle, fontSize: 10 }}>Member</p>
                  <p style={{ margin: '2px 0 0', fontFamily: MONO, fontSize: 14, color: C.success, fontWeight: 600 }}>
                    {p.memberPrice === 0 ? 'Free' : formatPrice(p.memberPrice)}
                  </p>
                </div>
              )}
            </div>
            {p.ageRange && <p style={{ margin: '0 0 4px', fontSize: 12, color: C.text2 }}>Ages: {p.ageRange}</p>}
            {p.desc && <p style={{ margin: '0 0 8px', fontSize: 12, color: C.muted }}>{p.desc}</p>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{
                padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: p.active ? '#E6F4EA' : '#F5F5F5', color: p.active ? '#1E8E3E' : C.muted,
              }}>{p.active ? 'Active' : 'Inactive'}</span>
              {canEdit && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setConfirmDelete(p)} style={{ color: C.danger }}>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: C.muted, padding: 48 }}>No admission products yet</div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div style={modalOverlay}>
          <form onSubmit={save} style={modalBox}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20 }}>{modal === 'add' ? 'Add Admission Product' : 'Edit Admission Product'}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <p style={labelStyle}>Name</p>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="Adult (13-64)" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={labelStyle}>Price ($)</p>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="25.00" />
                </div>
                <div>
                  <p style={labelStyle}>Member Price ($) <span style={{ textTransform: 'none', letterSpacing: 0, color: C.muted }}>(0 = free)</span></p>
                  <input type="number" min="0" step="0.01" value={form.memberPrice} onChange={e => setForm(f => ({ ...f, memberPrice: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="Leave blank = same" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={labelStyle}>Category</p>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...selectStyle, marginTop: 4 }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <p style={labelStyle}>Age Range</p>
                  <input value={form.ageRange} onChange={e => setForm(f => ({ ...f, ageRange: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="e.g. 13-64" />
                </div>
              </div>
              <div>
                <p style={labelStyle}>Description</p>
                <input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="General admission for adults" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button type="button" onClick={() => setForm(f => ({ ...f, taxable: !f.taxable }))} style={toggleStyle(form.taxable)}>
                    <div style={knobStyle(form.taxable)} />
                  </button>
                  <span style={{ fontSize: 13 }}>Taxable</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))} style={toggleStyle(form.active)}>
                    <div style={knobStyle(form.active)} />
                  </button>
                  <span style={{ fontSize: 13 }}>Active</span>
                </div>
                <div>
                  <p style={labelStyle}>Sort Order</p>
                  <input type="number" min="0" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} style={{ ...inputStyle, marginTop: 4, width: 80 }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div style={modalOverlay}>
          <div style={{ background: C.card, borderRadius: 12, padding: 32, maxWidth: 400, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>Delete admission product?</h3>
            <p style={{ color: C.text2, margin: '0 0 24px' }}>Remove <strong>{confirmDelete.name}</strong>? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="admin-btn admin-btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="admin-btn" onClick={handleDelete} style={{ background: C.danger, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// ══════════════════════════════════════
// TAB 2: EVENT TICKETS (existing logic)
// ══════════════════════════════════════
function EventTicketsTab({ canEdit, toast, inputStyle, toggleStyle, knobStyle, modalOverlay, modalBox }) {
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [typeModal, setTypeModal] = useState(null);
  const [typeForm, setTypeForm] = useState({ ...EMPTY_TYPE });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');

  const events = getEvents().filter(e => e.status === 'Published' || e.status === 'Draft');
  const allTicketTypes = getTicketTypes();

  const totalSold = allTicketTypes.reduce((s, t) => s + (t.sold || 0), 0);
  const totalRevenue = allTicketTypes.reduce((s, t) => s + (t.sold || 0) * (t.price || 0), 0);
  const totalCapacity = allTicketTypes.filter(t => t.capacity).reduce((s, t) => s + (t.capacity || 0), 0);

  const filtered = events.filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()));

  const openAddType = (eventId) => { setTypeForm({ ...EMPTY_TYPE }); setTypeModal({ eventId, type: 'add' }); };
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

  return (
    <>
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
        placeholder="Search events..."
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
                <div style={{ fontSize: 16, color: C.text2, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>&#x25BE;</div>
              </div>

              {/* Expanded: ticket types */}
              {isExpanded && (
                <div style={{ marginTop: 20, borderTop: '1px solid ' + C.border, paddingTop: 20 }}>
                  {types.length === 0 && (
                    <p style={{ color: C.muted, fontSize: 14, margin: '0 0 16px' }}>No ticket types yet -- add one below.</p>
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
                                {tt.memberPrice === 0 ? <span style={{ color: C.success, fontSize: 12, fontWeight: 600 }}>Free</span> : tt.memberPrice != null ? formatPrice(tt.memberPrice) : '\u2014'}
                              </td>
                              <td style={{ padding: '10px 12px', fontFamily: MONO }}>{cap || '\u221E'}</td>
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

      {/* Ticket Type Modal */}
      {typeModal && (
        <div style={modalOverlay}>
          <form onSubmit={saveType} style={modalBox}>
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
                  <input type="number" min="0" value={typeForm.capacity} onChange={e => setTypeForm(f => ({ ...f, capacity: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="\u221E" />
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
                <input value={typeForm.desc} onChange={e => setTypeForm(f => ({ ...f, desc: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="e.g. 21+ only, ages 5-12, etc." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => setTypeModal(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div style={{ ...modalOverlay, zIndex: 1001 }}>
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
    </>
  );
}


// ══════════════════════════════════════
// TAB 3: ORDERS
// ══════════════════════════════════════
function OrdersTab({ canEdit, toast, inputStyle, selectStyle, modalOverlay, modalBox, categoryBadge }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [compModal, setCompModal] = useState(false);
  const [compForm, setCompForm] = useState({ customer: '', email: '', type: 'admission', visitDate: todayStr(), items: [{ name: '', qty: 1 }], notes: '' });

  const allOrders = getTicketOrders();
  const orders = allOrders
    .filter(o => typeFilter === 'all' || o.type === typeFilter)
    .filter(o => channelFilter === 'all' || o.channel === channelFilter)
    .filter(o => statusFilter === 'all' || o.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pillStyle = (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: '1px solid ' + (active ? C.gold : C.border),
    background: active ? C.gold + '18' : 'transparent',
    color: active ? C.gold : C.text2,
    fontFamily: FONT,
  });

  const typeBadge = (type) => ({
    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: type === 'admission' ? '#E8EAF6' : '#FFF3E0',
    color: type === 'admission' ? '#3949AB' : '#E65100',
    textTransform: 'capitalize',
  });

  const channelBadge = (ch) => ({
    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: ch === 'online' ? '#E6F4EA' : '#FEF7E0',
    color: ch === 'online' ? '#1E8E3E' : '#B8860B',
    textTransform: 'uppercase',
  });

  const statusBadge = (s) => {
    const map = {
      confirmed: { bg: '#E6F4EA', color: '#1E8E3E' },
      cancelled: { bg: '#FDEAEA', color: C.danger },
      pending: { bg: '#FEF7E0', color: '#B8860B' },
    };
    const c = map[s] || map.confirmed;
    return { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, textTransform: 'capitalize' };
  };

  const handleCancel = (id) => {
    cancelTicketOrder(id);
    toast('Order cancelled');
  };

  const handleCheckIn = (order) => {
    updateTicketOrder(order.id, { checkedIn: true, checkedInAt: new Date().toISOString() });
    toast('Checked in!');
  };

  const issueComp = (e) => {
    e.preventDefault();
    if (!compForm.customer) { toast('Customer name is required'); return; }
    if (!compForm.notes.trim()) { toast('Notes are required for comp tickets'); return; }
    const items = compForm.items.filter(i => i.name).map(i => ({
      productId: null, name: i.name, qty: Number(i.qty) || 1, unitPrice: 0, lineTotal: 0,
    }));
    if (items.length === 0) { toast('Add at least one item'); return; }
    addTicketOrder({
      type: compForm.type,
      channel: 'pos',
      eventId: null, eventTitle: null,
      visitDate: compForm.visitDate,
      items,
      subtotal: 0, discount: 0, tax: 0, total: 0,
      customer: compForm.customer.trim(),
      email: compForm.email.trim(),
      phone: '', memberId: null, memberTier: null,
      paymentMethod: 'comp',
      notes: compForm.notes.trim(),
    });
    toast('Comp ticket issued');
    setCompModal(false);
    setCompForm({ customer: '', email: '', type: 'admission', visitDate: todayStr(), items: [{ name: '', qty: 1 }], notes: '' });
  };

  return (
    <>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Type filters */}
          {[['all', 'All'], ['admission', 'Admission'], ['event', 'Events']].map(([v, l]) => (
            <button key={v} onClick={() => setTypeFilter(v)} style={pillStyle(typeFilter === v)}>{l}</button>
          ))}
          <span style={{ color: C.border, margin: '0 4px' }}>|</span>
          {/* Channel filters */}
          {[['all', 'All Channels'], ['online', 'Online'], ['pos', 'POS']].map(([v, l]) => (
            <button key={v} onClick={() => setChannelFilter(v)} style={pillStyle(channelFilter === v)}>{l}</button>
          ))}
          <span style={{ color: C.border, margin: '0 4px' }}>|</span>
          {/* Status filters */}
          {[['all', 'All Status'], ['confirmed', 'Confirmed'], ['cancelled', 'Cancelled']].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)} style={pillStyle(statusFilter === v)}>{l}</button>
          ))}
        </div>
        {canEdit && (
          <button className="admin-btn admin-btn-gold" onClick={() => setCompModal(true)}>+ Issue Comp</button>
        )}
      </div>

      {/* Orders table */}
      <div style={card}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.muted, padding: 32 }}>No orders match filters</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid ' + C.border }}>
                {['Confirmation', 'Customer', 'Type', 'Items', 'Total', 'Channel', 'Check-In', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const isExpanded = expandedOrder === o.id;
                const firstItem = (o.items || [])[0];
                const itemSummary = firstItem ? `${firstItem.name} x${firstItem.qty}${o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}` : '--';
                return (
                  <React.Fragment key={o.id}>
                    <tr
                      style={{ borderBottom: '1px solid ' + C.border, cursor: 'pointer', background: isExpanded ? C.bg : 'transparent' }}
                      onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                    >
                      <td style={{ padding: '10px', fontFamily: MONO, fontWeight: 600, fontSize: 12, color: C.gold }}>{o.confirmationCode}</td>
                      <td style={{ padding: '10px', fontWeight: 500 }}>
                        {o.customer}
                        {o.paymentMethod === 'comp' && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: '#F3E8FF', color: '#7C3AED' }}>COMP</span>}
                      </td>
                      <td style={{ padding: '10px' }}><span style={typeBadge(o.type)}>{o.type}</span></td>
                      <td style={{ padding: '10px', fontSize: 12, color: C.text2, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itemSummary}</td>
                      <td style={{ padding: '10px', fontFamily: MONO, fontWeight: 600 }}>{o.total === 0 ? 'Free' : formatPrice(o.total)}</td>
                      <td style={{ padding: '10px' }}><span style={channelBadge(o.channel)}>{o.channel}</span></td>
                      <td style={{ padding: '10px' }}>
                        {o.checkedIn ? (
                          <span style={{ color: C.success, fontSize: 12, fontWeight: 600 }}>Checked In</span>
                        ) : (
                          <span style={{ color: C.muted, fontSize: 12 }}>--</span>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}><span style={statusBadge(o.status)}>{o.status}</span></td>
                      <td style={{ padding: '10px', textAlign: 'right', color: C.text2, fontSize: 14 }}>{isExpanded ? '\u25B4' : '\u25BE'}</td>
                    </tr>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} style={{ padding: '0 10px 16px', background: C.bg }}>
                          <div style={{ padding: '16px', background: C.card, borderRadius: 8, border: '1px solid ' + C.border, marginTop: 4 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                              <div>
                                <p style={labelStyle}>Customer</p>
                                <p style={{ margin: '4px 0 0', fontSize: 14 }}>{o.customer}</p>
                                {o.email && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.text2 }}>{o.email}</p>}
                                {o.phone && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.text2 }}>{o.phone}</p>}
                              </div>
                              <div>
                                <p style={labelStyle}>Visit Date</p>
                                <p style={{ margin: '4px 0 0', fontSize: 14 }}>{fmtDate(o.visitDate)}</p>
                                {o.eventTitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.text2 }}>{o.eventTitle}</p>}
                              </div>
                              <div>
                                <p style={labelStyle}>Created</p>
                                <p style={{ margin: '4px 0 0', fontSize: 14 }}>{fmtDateTime(o.createdAt)}</p>
                                {o.memberTier && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.gold, fontWeight: 600 }}>{o.memberTier} Member</p>}
                              </div>
                            </div>

                            {/* Line items */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid ' + C.border }}>
                                  {['Item', 'Qty', 'Unit Price', 'Line Total'].map(h => (
                                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, fontWeight: 500 }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(o.items || []).map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid ' + C.border }}>
                                    <td style={{ padding: '6px 8px' }}>{item.name}</td>
                                    <td style={{ padding: '6px 8px', fontFamily: MONO }}>{item.qty}</td>
                                    <td style={{ padding: '6px 8px', fontFamily: MONO }}>{item.unitPrice === 0 ? 'Free' : formatPrice(item.unitPrice)}</td>
                                    <td style={{ padding: '6px 8px', fontFamily: MONO }}>{item.lineTotal === 0 ? 'Free' : formatPrice(item.lineTotal)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.text2 }}>
                                {o.discount > 0 && <span>Discount: -{formatPrice(o.discount)}</span>}
                                {o.notes && <span style={{ fontStyle: 'italic' }}>Note: {o.notes}</span>}
                              </div>
                              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700 }}>
                                Total: {o.total === 0 ? 'Free' : formatPrice(o.total)}
                              </div>
                            </div>

                            {/* Action buttons */}
                            {canEdit && o.status !== 'cancelled' && (
                              <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 12, borderTop: '1px solid ' + C.border }}>
                                {!o.checkedIn && (
                                  <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={(e) => { e.stopPropagation(); handleCheckIn(o); }}>Check In</button>
                                )}
                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(o.id); }} style={{ color: C.danger }}>Cancel Order</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Comp Modal */}
      {compModal && (
        <div style={modalOverlay}>
          <form onSubmit={issueComp} style={modalBox}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20 }}>Issue Comp Ticket</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={labelStyle}>Customer Name *</p>
                  <input value={compForm.customer} onChange={e => setCompForm(f => ({ ...f, customer: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="Name" />
                </div>
                <div>
                  <p style={labelStyle}>Email</p>
                  <input value={compForm.email} onChange={e => setCompForm(f => ({ ...f, email: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="email@example.com" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={labelStyle}>Type</p>
                  <select value={compForm.type} onChange={e => setCompForm(f => ({ ...f, type: e.target.value }))} style={{ ...selectStyle, marginTop: 4 }}>
                    <option value="admission">Admission</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <div>
                  <p style={labelStyle}>Visit Date</p>
                  <input type="date" value={compForm.visitDate} onChange={e => setCompForm(f => ({ ...f, visitDate: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} />
                </div>
              </div>

              {/* Items */}
              <div>
                <p style={labelStyle}>Items</p>
                {compForm.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                    <input
                      value={item.name}
                      onChange={e => {
                        const items = [...compForm.items];
                        items[idx] = { ...items[idx], name: e.target.value };
                        setCompForm(f => ({ ...f, items }));
                      }}
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="e.g. Adult Admission"
                    />
                    <input
                      type="number" min="1"
                      value={item.qty}
                      onChange={e => {
                        const items = [...compForm.items];
                        items[idx] = { ...items[idx], qty: e.target.value };
                        setCompForm(f => ({ ...f, items }));
                      }}
                      style={{ ...inputStyle, width: 60 }}
                    />
                    {compForm.items.length > 1 && (
                      <button type="button" onClick={() => setCompForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', fontSize: 16 }}>&times;</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setCompForm(f => ({ ...f, items: [...f.items, { name: '', qty: 1 }] }))} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ marginTop: 8 }}>+ Add Item</button>
              </div>

              <div>
                <p style={labelStyle}>Notes * <span style={{ textTransform: 'none', letterSpacing: 0, color: C.muted }}>(required for comps)</span></p>
                <textarea
                  value={compForm.notes}
                  onChange={e => setCompForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ ...inputStyle, marginTop: 4, minHeight: 60, resize: 'vertical', font: `14px/1.4 ${FONT}` }}
                  placeholder="Reason for comp..."
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => setCompModal(false)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary">Issue Comp</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}


// ══════════════════════════════════════
// TAB 4: CHECK-IN
// ══════════════════════════════════════
function CheckInTab({ toast, inputStyle }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(todayStr());

  const allOrders = getTicketOrders();
  const today = todayStr();

  // Filter by date
  const dateOrders = allOrders.filter(o => o.visitDate === dateFilter && o.status !== 'cancelled');

  // Filter by search
  const filtered = dateOrders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (o.confirmationCode || '').toLowerCase().includes(q) ||
      (o.customer || '').toLowerCase().includes(q) ||
      (o.email || '').toLowerCase().includes(q)
    );
  });

  // Stats
  const checkedInCount = dateOrders.filter(o => o.checkedIn).length;
  const totalCount = dateOrders.length;

  const handleCheckIn = (order) => {
    updateTicketOrder(order.id, { checkedIn: true, checkedInAt: new Date().toISOString() });
    toast('Checked in!');
  };

  return (
    <>
      {/* Stats bar */}
      <div style={{ ...card, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: MONO, fontSize: 13, color: C.text2 }}>
            <strong style={{ color: C.text, fontSize: 20 }}>{checkedInCount}</strong> of <strong style={{ color: C.text, fontSize: 20 }}>{totalCount}</strong> checked in {dateFilter === today ? 'today' : 'on ' + fmtDate(dateFilter)}
          </span>
          {totalCount > 0 && (
            <div style={{ width: 120, height: 6, borderRadius: 3, background: C.border }}>
              <div style={{ height: '100%', borderRadius: 3, background: C.success, width: Math.round((checkedInCount / totalCount) * 100) + '%', transition: 'width .3s' }} />
            </div>
          )}
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ ...inputStyle, width: 160 }}
        />
      </div>

      {/* Search */}
      <input
        placeholder="Search by confirmation code, name, or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          ...inputStyle,
          width: '100%',
          marginBottom: 24,
          fontSize: 16,
          padding: '14px 16px',
          borderRadius: 12,
          border: '2px solid ' + C.border,
        }}
      />

      {/* Order cards */}
      {filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: C.muted, padding: 48 }}>
          {search ? 'No matching orders found' : dateOrders.length === 0 ? 'No orders for this date' : 'No results'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(o => {
          const totalQty = (o.items || []).reduce((s, i) => s + (i.qty || 0), 0);
          return (
            <div key={o.id} style={{
              ...card,
              borderLeft: `4px solid ${o.checkedIn ? C.success : C.gold}`,
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: C.gold }}>{o.confirmationCode}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: o.type === 'admission' ? '#E8EAF6' : '#FFF3E0',
                    color: o.type === 'admission' ? '#3949AB' : '#E65100',
                    textTransform: 'capitalize',
                  }}>{o.type}</span>
                  {o.paymentMethod === 'comp' && (
                    <span style={{ padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: '#F3E8FF', color: '#7C3AED' }}>COMP</span>
                  )}
                </div>
                <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 600 }}>{o.customer}</p>
                {o.email && <p style={{ margin: '0 0 2px', fontSize: 12, color: C.text2 }}>{o.email}</p>}
                <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text2 }}>
                  {(o.items || []).map(i => `${i.name} x${i.qty}`).join(', ')} &middot; {totalQty} ticket{totalQty !== 1 ? 's' : ''}
                  {o.total > 0 && <> &middot; {formatPrice(o.total)}</>}
                </p>
                {o.memberTier && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.gold, fontWeight: 600 }}>{o.memberTier} Member</p>}
              </div>

              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                {o.checkedIn ? (
                  <div>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', background: '#E6F4EA',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 6px', fontSize: 22, color: C.success,
                    }}>&#10003;</div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.success }}>Checked In</p>
                    {o.checkedInAt && <p style={{ margin: '2px 0 0', fontSize: 10, color: C.text2 }}>{fmtDateTime(o.checkedInAt)}</p>}
                  </div>
                ) : (
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => handleCheckIn(o)}
                    style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10 }}
                  >
                    Check In
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
