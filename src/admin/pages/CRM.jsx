import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMembers, getOrders, getDonations, getReservations, getFieldTrips, getVolunteers, getMessages, getContacts, getEvents, subscribe } from '../data/store';
import { useToast, useRole } from '../AdminLayout';
import PageTour from '../components/PageTour';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const TAG_COLORS = {
  Member: { bg: '#FEF7E0', text: '#B8860B' },
  Donor: { bg: '#E6F4EA', text: '#1E8E3E' },
  'Event Attendee': { bg: '#E8F0FE', text: '#1A73E8' },
  Volunteer: { bg: '#F3E8FF', text: '#7C3AED' },
  School: { bg: '#FFF0E6', text: '#C2590A' },
  Newsletter: { bg: '#E8E5DF', text: '#5C5870' },
  Customer: { bg: '#E0F2FE', text: '#0369A1' },
};

const FILTERS = ['All', 'Members', 'Donors', 'Attendees', 'Volunteers', 'Schools', 'Newsletter'];
const SORT_OPTIONS = ['Name', 'Last Activity', 'Total Spent'];

const CRM_NOTES_KEY = 'ds_crm_notes';
const CRM_CONTACTS_KEY = 'ds_crm_manual_contacts';

function getNotes() { try { return JSON.parse(localStorage.getItem(CRM_NOTES_KEY)) || {}; } catch { return {}; } }
function saveNotes(notes) { localStorage.setItem(CRM_NOTES_KEY, JSON.stringify(notes)); }
function getManualContacts() { try { return JSON.parse(localStorage.getItem(CRM_CONTACTS_KEY)) || []; } catch { return []; } }
function saveManualContacts(c) { localStorage.setItem(CRM_CONTACTS_KEY, JSON.stringify(c)); }

function safeStr(val) {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object') {
    if (val.name) return String(val.name).trim();
    if (val.email) return String(val.email).trim();
    if (val.firstName) return `${val.firstName} ${val.lastName || ''}`.trim();
  }
  return String(val).trim();
}
function normalizeEmail(e) { return safeStr(e).toLowerCase(); }
function normalizeName(n) { return safeStr(n).toLowerCase().replace(/\s+/g, ' '); }

function buildContacts() {
  try {
  const members = getMembers();
  const orders = getOrders();
  const donations = getDonations();
  const reservations = getReservations();
  const fieldTrips = getFieldTrips();
  const volunteers = getVolunteers();
  const messages = getMessages();
  const newsletter = getContacts();
  const events = getEvents();
  const manualContacts = getManualContacts();
  const notes = getNotes();

  const map = new Map(); // email -> contact

  const getOrCreate = (rawEmail, rawName) => {
    const email = safeStr(rawEmail);
    const name = safeStr(rawName);
    const key = normalizeEmail(email) || `name:${normalizeName(name)}`;
    if (!key || key === 'name:') return null;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: name,
        email: email,
        phone: '',
        tags: [],
        memberTier: null,
        memberStatus: null,
        totalSpent: 0,
        totalDonated: 0,
        eventsAttended: 0,
        orderCount: 0,
        lastActivity: null,
        notes: [],
        source: '',
        timeline: [],
      });
    }
    const c = map.get(key);
    if (name && (!c.name || c.name.length < name.length)) c.name = name;
    if (email && !c.email) c.email = email;
    return c;
  };

  const updateActivity = (c, date) => {
    if (!date) return;
    const d = typeof date === 'string' ? date : new Date(date).toISOString().slice(0, 10);
    if (!c.lastActivity || d > c.lastActivity) c.lastActivity = d;
  };

  const addTag = (c, tag) => { if (!c.tags.includes(tag)) c.tags.push(tag); };

  // Members
  members.forEach(m => {
    const c = getOrCreate(m.email, m.name);
    if (!c) return;
    addTag(c, 'Member');
    c.memberTier = m.tier || m.level || null;
    c.memberStatus = m.status || 'Active';
    if (m.phone) c.phone = m.phone;
    if (!c.source) c.source = 'Membership';
    updateActivity(c, m.joinDate || m.date);
    c.timeline.push({ type: 'membership', desc: `Joined as ${m.tier || 'member'}`, date: m.joinDate || m.date || '', icon: 'star' });
  });

  // Orders
  orders.forEach(o => {
    const name = safeStr(o.customer || o.customer_name || o.customerName || '');
    const email = safeStr(o.email || o.customer_email || o.customerEmail || '');
    const c = getOrCreate(email, name);
    if (!c) return;
    addTag(c, 'Customer');
    c.orderCount++;
    const total = o.total || (o.items || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
    c.totalSpent += total;
    if (!c.source) c.source = 'Online Store';
    updateActivity(c, o.date);
    c.timeline.push({ type: 'order', desc: `Order ${o.id} — $${(total / 100).toFixed(2)}`, date: o.date || '', icon: 'cart' });
  });

  // Donations
  donations.forEach(d => {
    const c = getOrCreate(safeStr(d.email), safeStr(d.donor || d.name));
    if (!c) return;
    addTag(c, 'Donor');
    c.totalDonated += d.amount || 0;
    if (!c.source) c.source = 'Donation';
    updateActivity(c, d.date);
    c.timeline.push({ type: 'donation', desc: `Donated $${((d.amount || 0) / 100).toFixed(2)}${d.campaign ? ` — ${d.campaign}` : ''}`, date: d.date || '', icon: 'heart' });
  });

  // Reservations / Event attendees
  const eventMap = {};
  events.forEach(e => { eventMap[e.id] = e; });
  reservations.forEach(r => {
    const c = getOrCreate(r.email, r.name);
    if (!c) return;
    addTag(c, 'Event Attendee');
    c.eventsAttended += r.qty || 1;
    if (!c.source) c.source = 'Event';
    const eventTitle = r.eventTitle || (eventMap[r.eventId] || {}).title || 'Event';
    updateActivity(c, r.date || r.createdAt);
    c.timeline.push({ type: 'event', desc: `Attended: ${eventTitle}`, date: r.date || r.createdAt || '', icon: 'calendar' });
  });

  // Field Trips
  fieldTrips.forEach(ft => {
    const c = getOrCreate(safeStr(ft.email || ft.contactEmail), safeStr(ft.contact || ft.contactName || ft.teacher || ft.name));
    if (!c) return;
    addTag(c, 'School');
    if (ft.phone || ft.contactPhone) c.phone = ft.phone || ft.contactPhone;
    if (!c.source) c.source = 'Field Trip';
    updateActivity(c, ft.date || ft.createdAt);
    c.timeline.push({ type: 'fieldtrip', desc: `Field trip: ${ft.school || ft.organization || 'School visit'}`, date: ft.date || ft.createdAt || '', icon: 'school' });
  });

  // Volunteers
  volunteers.forEach(v => {
    const c = getOrCreate(v.email, v.name);
    if (!c) return;
    addTag(c, 'Volunteer');
    if (v.phone) c.phone = v.phone;
    if (!c.source) c.source = 'Volunteer';
    updateActivity(c, v.startDate || v.joinDate || v.date);
    c.timeline.push({ type: 'volunteer', desc: `Volunteer: ${v.role || v.program || 'General'}`, date: v.startDate || v.joinDate || v.date || '', icon: 'hand' });
  });

  // Messages
  messages.forEach(msg => {
    const c = getOrCreate(msg.email || msg.from, msg.name || msg.sender);
    if (!c) return;
    updateActivity(c, msg.date || msg.createdAt);
    c.timeline.push({ type: 'message', desc: `Message: ${(msg.subject || msg.text || '').slice(0, 60)}`, date: msg.date || msg.createdAt || '', icon: 'mail' });
  });

  // Newsletter subscribers
  newsletter.forEach(n => {
    const c = getOrCreate(n.email, n.name);
    if (!c) return;
    addTag(c, 'Newsletter');
    if (!c.source) c.source = 'Newsletter';
    updateActivity(c, n.date || n.subscribedAt);
  });

  // Manual contacts
  manualContacts.forEach(mc => {
    const c = getOrCreate(mc.email, mc.name);
    if (!c) return;
    if (mc.phone) c.phone = mc.phone;
    (mc.tags || []).forEach(t => addTag(c, t));
    if (!c.source) c.source = 'Manual';
  });

  // Apply notes
  Object.entries(notes).forEach(([key, noteList]) => {
    if (map.has(key)) map.get(key).notes = noteList;
  });

  // Sort timelines
  const contacts = Array.from(map.values());
  contacts.forEach(c => {
    c.timeline.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  });

  return contacts;
  } catch (e) { console.error('CRM buildContacts error:', e); return []; }
}

const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: C.shadow };
const btnStyle = { fontFamily: FONT, fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.15s' };
const btnPrimary = { ...btnStyle, background: C.gold, color: '#fff' };
const btnGhost = { ...btnStyle, background: 'transparent', border: `1px solid ${C.border}`, color: C.text };
const labelStyle = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, margin: 0 };
const inputStyle = { fontFamily: FONT, fontSize: 14, padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, width: '100%', boxSizing: 'border-box', outline: 'none', color: C.text };

const TOUR_STEPS = [
  { target: '[data-tour="crm-stats"]', title: 'Contact Overview', text: 'See total contacts across all sources — members, donors, event attendees, and more.' },
  { target: '[data-tour="crm-list"]', title: 'Contact List', text: 'Search, filter, and sort your contacts. Click any contact to view their full profile.' },
  { target: '[data-tour="crm-profile"]', title: 'Contact Profile', text: 'View a unified timeline of all interactions, add notes, and take quick actions.' },
];

const TIMELINE_ICONS = {
  cart: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
  ),
  heart: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  ),
  school: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5"/></svg>
  ),
  hand: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
  ),
};

function TagBadge({ tag }) {
  const colors = TAG_COLORS[tag] || { bg: '#E8E5DF', text: '#5C5870' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 12,
      fontSize: 11, fontWeight: 500, fontFamily: MONO,
      background: colors.bg, color: colors.text, letterSpacing: '0.3px',
    }}>{tag}</span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ ...cardStyle, padding: '20px 24px', flex: 1, minWidth: 140 }}>
      <p style={labelStyle}>{label}</p>
      <div style={{ fontSize: 28, fontWeight: 600, fontFamily: FONT, color: C.text, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function CRM() {
  const [, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Name');
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', tags: [] });
  const [noteText, setNoteText] = useState('');
  const [editingTags, setEditingTags] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const role = useRole();
  const listRef = useRef(null);

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  // Listen for escape
  useEffect(() => {
    const handler = () => { setMobileProfileOpen(false); setShowAddModal(false); };
    document.addEventListener('admin-escape', handler);
    return () => document.removeEventListener('admin-escape', handler);
  }, []);

  const contacts = useMemo(() => buildContacts(), [setTick]);

  const filtered = useMemo(() => {
    let list = contacts;

    // Filter
    if (filter === 'Members') list = list.filter(c => c.tags.includes('Member'));
    else if (filter === 'Donors') list = list.filter(c => c.tags.includes('Donor'));
    else if (filter === 'Attendees') list = list.filter(c => c.tags.includes('Event Attendee'));
    else if (filter === 'Volunteers') list = list.filter(c => c.tags.includes('Volunteer'));
    else if (filter === 'Schools') list = list.filter(c => c.tags.includes('School'));
    else if (filter === 'Newsletter') list = list.filter(c => c.tags.includes('Newsletter'));

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'Name') list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (sortBy === 'Last Activity') list = [...list].sort((a, b) => (b.lastActivity || '').localeCompare(a.lastActivity || ''));
    else if (sortBy === 'Total Spent') list = [...list].sort((a, b) => b.totalSpent - a.totalSpent);

    return list;
  }, [contacts, filter, search, sortBy]);

  const selected = useMemo(() => {
    if (!selectedId) return filtered[0] || null;
    return contacts.find(c => c.id === selectedId) || filtered[0] || null;
  }, [contacts, filtered, selectedId]);

  // Summary stats
  const stats = useMemo(() => ({
    total: contacts.length,
    members: contacts.filter(c => c.tags.includes('Member')).length,
    donors: contacts.filter(c => c.tags.includes('Donor')).length,
    attendees: contacts.filter(c => c.tags.includes('Event Attendee')).length,
    newsletter: contacts.filter(c => c.tags.includes('Newsletter')).length,
  }), [contacts]);

  const handleSelectContact = useCallback((c) => {
    setSelectedId(c.id);
    setNoteText('');
    setEditingTags(false);
    setMobileProfileOpen(true);
  }, []);

  const handleAddNote = () => {
    if (!noteText.trim() || !selected) return;
    const notes = getNotes();
    if (!notes[selected.id]) notes[selected.id] = [];
    notes[selected.id].unshift({ text: noteText.trim(), date: new Date().toISOString().slice(0, 10), author: localStorage.getItem('ds_user_name') || 'Admin' });
    saveNotes(notes);
    setNoteText('');
    setTick(t => t + 1);
    toast('Note added');
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!addForm.name && !addForm.email) { toast('Name or email is required', 'error'); return; }
    const manual = getManualContacts();
    manual.push({ ...addForm, addedAt: new Date().toISOString() });
    saveManualContacts(manual);
    setAddForm({ name: '', email: '', phone: '', tags: [] });
    setShowAddModal(false);
    setTick(t => t + 1);
    toast('Contact added');
  };

  const handleExportCSV = () => {
    const header = 'Name,Email,Phone,Tags,Member Tier,Total Spent,Total Donated,Events Attended,Orders,Last Activity,Source';
    const rows = filtered.map(c =>
      `"${c.name}","${c.email}","${c.phone}","${c.tags.join('; ')}","${c.memberTier || ''}",${(c.totalSpent / 100).toFixed(2)},${(c.totalDonated / 100).toFixed(2)},${c.eventsAttended},${c.orderCount},"${c.lastActivity || ''}","${c.source}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `crm-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast('Contacts exported');
  };

  const handleToggleTag = (tag) => {
    if (!selected) return;
    const manual = getManualContacts();
    const existing = manual.find(mc => normalizeEmail(mc.email) === normalizeEmail(selected.email) && normalizeName(mc.name) === normalizeName(selected.name));
    if (existing) {
      if (existing.tags.includes(tag)) existing.tags = existing.tags.filter(t => t !== tag);
      else existing.tags.push(tag);
    } else {
      manual.push({ name: selected.name, email: selected.email, phone: selected.phone, tags: [tag], addedAt: new Date().toISOString() });
    }
    saveManualContacts(manual);
    setTick(t => t + 1);
  };

  const initials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      <PageTour storageKey="ds_tour_crm" steps={TOUR_STEPS} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: C.text }}>Contacts</h1>
          <p style={{ fontSize: 13, color: C.text2, margin: '4px 0 0' }}>Unified CRM across all data sources</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} style={btnGhost}>
            <span style={{ marginRight: 6 }}>&#8595;</span>Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)} style={btnPrimary}>+ Add Contact</button>
        </div>
      </div>

      {/* Summary Stats */}
      <div data-tour="crm-stats" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Total Contacts" value={stats.total} />
        <StatCard label="Members" value={stats.members} />
        <StatCard label="Donors" value={stats.donors} />
        <StatCard label="Event Attendees" value={stats.attendees} />
        <StatCard label="Newsletter" value={stats.newsletter} />
      </div>

      {/* Main Layout: List + Profile */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative' }}>

        {/* Contact List */}
        <div data-tour="crm-list" ref={listRef} style={{ ...cardStyle, width: 360, minWidth: 320, maxWidth: 400, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 260px)' }}>
          {/* Search */}
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ position: 'absolute', left: 10, top: 11 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text" placeholder="Search contacts..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 32, fontSize: 13 }}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                ...btnStyle, padding: '4px 12px', fontSize: 11, fontFamily: MONO,
                background: filter === f ? C.gold : 'transparent',
                color: filter === f ? '#fff' : C.text2,
                border: `1px solid ${filter === f ? C.gold : C.border}`,
                borderRadius: 16,
              }}>{f}</button>
            ))}
          </div>

          {/* Sort + Count */}
          <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: C.text2 }}>{filtered.length} contacts</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontSize: 11, fontFamily: MONO, border: 'none', background: 'transparent', color: C.text2, cursor: 'pointer', outline: 'none' }}>
              {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Contact Cards */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
            {filtered.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 13 }}>No contacts found</div>
            )}
            {filtered.map(c => {
              const isActive = selected && selected.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectContact(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: isActive ? '#F5F0E8' : 'transparent',
                    textAlign: 'left', transition: 'background 0.1s', marginBottom: 2,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8F7F4'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C.gold}, #8B7320)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0,
                    fontFamily: FONT,
                  }}>{initials(c.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name || c.email}</div>
                    <div style={{ fontSize: 12, color: C.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      {c.tags.slice(0, 3).map(t => <TagBadge key={t} tag={t} />)}
                      {c.tags.length > 3 && <span style={{ fontSize: 11, color: C.muted }}>+{c.tags.length - 3}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Profile */}
        <div data-tour="crm-profile" style={{ ...cardStyle, flex: 1, minWidth: 0, padding: 0, overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ padding: 60, textAlign: 'center', color: C.muted }}>
              <p style={{ fontSize: 15 }}>Select a contact to view their profile</p>
            </div>
          ) : (
            <div>
              {/* Profile Header */}
              <div style={{ padding: '28px 28px 20px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C.gold}, #8B7320)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 20, fontWeight: 600, flexShrink: 0,
                  }}>{initials(selected.name)}</div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: C.text }}>{selected.name || 'Unknown'}</h2>
                    {selected.email && <div style={{ fontSize: 14, color: C.text2, marginTop: 2 }}>{selected.email}</div>}
                    {selected.phone && <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{selected.phone}</div>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {selected.tags.map(t => <TagBadge key={t} tag={t} />)}
                      {selected.memberTier && (
                        <span style={{ fontSize: 11, fontFamily: MONO, color: C.gold, padding: '2px 8px', borderRadius: 12, background: 'rgba(197,165,90,0.1)' }}>{selected.memberTier}</span>
                      )}
                      <button onClick={() => setEditingTags(!editingTags)} style={{ ...btnStyle, padding: '2px 8px', fontSize: 11, color: C.text2, background: 'transparent', border: `1px solid ${C.border}` }}>
                        {editingTags ? 'Done' : 'Edit Tags'}
                      </button>
                    </div>
                    {editingTags && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {Object.keys(TAG_COLORS).map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleToggleTag(tag)}
                            style={{
                              ...btnStyle, padding: '3px 10px', fontSize: 11, borderRadius: 12,
                              background: selected.tags.includes(tag) ? TAG_COLORS[tag].bg : '#F8F7F4',
                              color: selected.tags.includes(tag) ? TAG_COLORS[tag].text : C.muted,
                              border: `1px solid ${selected.tags.includes(tag) ? TAG_COLORS[tag].text + '40' : C.border}`,
                            }}
                          >{tag}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Total Spent', value: `$${(selected.totalSpent / 100).toFixed(2)}` },
                    { label: 'Donated', value: `$${(selected.totalDonated / 100).toFixed(2)}` },
                    { label: 'Events', value: selected.eventsAttended },
                    { label: 'Orders', value: selected.orderCount },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ ...labelStyle, fontSize: 10 }}>{s.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {/* Timeline */}
                <div style={{ flex: 1, minWidth: 280, padding: 28, borderRight: `1px solid ${C.border}` }}>
                  <h3 style={{ ...labelStyle, marginBottom: 16 }}>Activity Timeline</h3>
                  {selected.timeline.length === 0 && (
                    <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 13 }}>No activity recorded</div>
                  )}
                  <div style={{ position: 'relative' }}>
                    {selected.timeline.length > 0 && (
                      <div style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom, ${C.gold}, ${C.border})`, borderRadius: 1 }} />
                    )}
                    {selected.timeline.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, position: 'relative' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: C.card, border: `2px solid ${C.gold}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: C.gold, zIndex: 1,
                        }}>
                          {TIMELINE_ICONS[item.icon] || TIMELINE_ICONS.star}
                        </div>
                        <div style={{ flex: 1, paddingTop: 4 }}>
                          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{item.desc}</div>
                          <div style={{ fontSize: 11, fontFamily: MONO, color: C.muted, marginTop: 2 }}>{item.date || 'Unknown date'}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {selected.notes && selected.notes.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <h3 style={{ ...labelStyle, marginBottom: 12 }}>Notes</h3>
                      {selected.notes.map((n, i) => (
                        <div key={i} style={{ padding: 12, background: '#FEFDF8', border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8 }}>
                          <div style={{ fontSize: 13, color: C.text }}>{n.text}</div>
                          <div style={{ fontSize: 11, fontFamily: MONO, color: C.muted, marginTop: 6 }}>{n.author} &middot; {n.date}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div style={{ width: 240, padding: 28, flexShrink: 0 }}>
                  <h3 style={{ ...labelStyle, marginBottom: 16 }}>Quick Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={() => navigate('/admin/messages')} style={{ ...btnGhost, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                      Send Message
                    </button>
                    <button onClick={() => navigate('/admin/emails')} style={{ ...btnGhost, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      Send Email
                    </button>
                    <button onClick={() => navigate('/admin/orders')} style={{ ...btnGhost, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                      View Orders
                    </button>
                  </div>

                  {/* Add Note */}
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ ...labelStyle, marginBottom: 8 }}>Add Note</h3>
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Type a note..."
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', fontSize: 13 }}
                    />
                    <button onClick={handleAddNote} disabled={!noteText.trim()} style={{ ...btnPrimary, marginTop: 8, width: '100%', opacity: noteText.trim() ? 1 : 0.5 }}>
                      Save Note
                    </button>
                  </div>

                  {/* Meta */}
                  <div style={{ marginTop: 24, padding: 16, background: '#F8F7F4', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontFamily: MONO, color: C.muted, marginBottom: 6 }}>SOURCE</div>
                    <div style={{ fontSize: 13, color: C.text }}>{selected.source || 'Unknown'}</div>
                    {selected.lastActivity && (
                      <>
                        <div style={{ fontSize: 11, fontFamily: MONO, color: C.muted, marginTop: 12, marginBottom: 6 }}>LAST ACTIVITY</div>
                        <div style={{ fontSize: 13, color: C.text }}>{selected.lastActivity}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Profile Drawer Overlay */}
      {mobileProfileOpen && selected && (
        <div className="crm-mobile-overlay" style={{ display: 'none' }}>
          <div onClick={() => setMobileProfileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '90vw', maxWidth: 480, background: C.card, zIndex: 9999, overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)' }}>
            <button onClick={() => setMobileProfileOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.text2, zIndex: 1 }}>&times;</button>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${C.gold}, #8B7320)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 600 }}>{initials(selected.name)}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{selected.name || 'Unknown'}</h3>
                  <div style={{ fontSize: 13, color: C.text2 }}>{selected.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {selected.tags.map(t => <TagBadge key={t} tag={t} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Spent', value: `$${(selected.totalSpent / 100).toFixed(2)}` },
                  { label: 'Donated', value: `$${(selected.totalDonated / 100).toFixed(2)}` },
                  { label: 'Events', value: selected.eventsAttended },
                  { label: 'Orders', value: selected.orderCount },
                ].map(s => (
                  <div key={s.label} style={{ padding: 12, background: '#F8F7F4', borderRadius: 8 }}>
                    <div style={{ ...labelStyle, fontSize: 10 }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <h4 style={{ ...labelStyle, marginBottom: 12 }}>Timeline</h4>
              {selected.timeline.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.card, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold, flexShrink: 0 }}>
                    {TIMELINE_ICONS[item.icon] || TIMELINE_ICONS.star}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: C.text }}>{item.desc}</div>
                    <div style={{ fontSize: 11, fontFamily: MONO, color: C.muted }}>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <>
          <div onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10000, backdropFilter: 'blur(2px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 440, maxWidth: 'calc(100vw - 32px)', background: C.card,
            borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 10001,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Add Contact</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.text2 }}>&times;</button>
            </div>
            <form onSubmit={handleAddContact} style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Name</label>
                <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Full name" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="email@example.com" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Phone</label>
                <input value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="(555) 123-4567" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Tags</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.keys(TAG_COLORS).map(tag => (
                    <button
                      key={tag} type="button"
                      onClick={() => setAddForm(f => ({
                        ...f,
                        tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
                      }))}
                      style={{
                        ...btnStyle, padding: '4px 12px', fontSize: 11, borderRadius: 16,
                        background: addForm.tags.includes(tag) ? TAG_COLORS[tag].bg : '#F8F7F4',
                        color: addForm.tags.includes(tag) ? TAG_COLORS[tag].text : C.muted,
                        border: `1px solid ${addForm.tags.includes(tag) ? TAG_COLORS[tag].text + '40' : C.border}`,
                      }}
                    >{tag}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={btnGhost}>Cancel</button>
                <button type="submit" style={btnPrimary}>Add Contact</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) {
          [data-tour="crm-list"] { width: 100% !important; max-width: none !important; max-height: 60vh !important; }
          [data-tour="crm-profile"] { display: none !important; }
          .crm-mobile-overlay { display: block !important; }
        }
        @media (max-width: 600px) {
          [data-tour="crm-stats"] { flex-direction: column; }
          [data-tour="crm-stats"] > div { min-width: auto !important; }
        }
      `}</style>
    </div>
  );
}
