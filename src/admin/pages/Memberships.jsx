import { useState, useEffect } from 'react';
import {
  getMembers, addMember, updateMember, deleteMember,
  getMembershipTiers, addMembershipTier, updateMembershipTier, deleteMembershipTier,
  formatPrice, subscribe,
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
const label = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, margin: 0 };

const STATUS_COLORS = {
  Active: { bg: '#E6F4EA', color: '#1E8E3E' },
  Expired: { bg: '#FEF7E0', color: '#B8860B' },
  Cancelled: { bg: '#FCE8E6', color: '#D93025' },
};

const EMPTY_MEMBER = { name: '', email: '', phone: '', tier: 'Explorer', status: 'Active', notes: '' };
const EMPTY_TIER = { name: '', price: '', period: 'per year', desc: '', discount: '', benefits: '', featured: false, badge: '', active: true };

export default function Memberships() {
  const [, setTick] = useState(0);
  const [tab, setTab] = useState('members');
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [memberModal, setMemberModal] = useState(null); // null | 'add' | member object
  const [tierModal, setTierModal] = useState(null); // null | 'add' | tier object
  const [memberForm, setMemberForm] = useState({ ...EMPTY_MEMBER });
  const [tierForm, setTierForm] = useState({ ...EMPTY_TIER });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();
  const role = useRole();
  const canEdit = !['visitor_services', 'board', 'shop_staff'].includes(role);

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  const members = getMembers();
  const tiers = getMembershipTiers();
  const tierNames = tiers.map(t => t.name);

  // ── Member stats ──
  const active = members.filter(m => m.status === 'Active');
  const expired = members.filter(m => m.status === 'Expired' || m.status === 'Cancelled');
  const tierRevenue = active.reduce((sum, m) => {
    const t = tiers.find(t => t.name === m.tier);
    return sum + (t ? t.price : 0);
  }, 0);

  // ── Filtered member list ──
  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchTier = filterTier === 'All' || m.tier === filterTier;
    const matchStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchQ && matchTier && matchStatus;
  });

  // ── Member CRUD ──
  const openAddMember = () => {
    setMemberForm({ ...EMPTY_MEMBER, tier: tiers[0]?.name || 'Explorer' });
    setMemberModal('add');
  };
  const openEditMember = (m) => {
    setMemberForm({ name: m.name, email: m.email, phone: m.phone || '', tier: m.tier, status: m.status, notes: m.notes || '' });
    setMemberModal(m);
  };
  const saveMember = (e) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.email) { toast('Name and email are required'); return; }
    if (memberModal === 'add') {
      const renewal = new Date();
      renewal.setFullYear(renewal.getFullYear() + 1);
      addMember({ ...memberForm, renewalDate: renewal.toISOString().slice(0, 10) });
      toast('Member added');
    } else {
      updateMember(memberModal.id, memberForm);
      toast('Member updated');
    }
    setMemberModal(null);
  };

  // ── Tier CRUD ──
  const openAddTier = () => {
    setTierForm({ ...EMPTY_TIER });
    setTierModal('add');
  };
  const openEditTier = (t) => {
    setTierForm({
      name: t.name, price: (t.price / 100).toFixed(0), period: t.period,
      desc: t.desc, discount: t.discount || '', benefits: (t.benefits || []).join('\n'),
      featured: t.featured, badge: t.badge || '', active: t.active,
    });
    setTierModal(t);
  };
  const saveTier = (e) => {
    e.preventDefault();
    if (!tierForm.name || !tierForm.price) { toast('Name and price are required'); return; }
    const payload = {
      name: tierForm.name.trim(),
      price: Math.round(parseFloat(tierForm.price) * 100),
      period: tierForm.period,
      desc: tierForm.desc,
      discount: Number(tierForm.discount) || 0,
      benefits: tierForm.benefits.split('\n').map(b => b.trim()).filter(Boolean),
      featured: tierForm.featured,
      badge: tierForm.badge,
      active: tierForm.active,
    };
    if (tierModal === 'add') {
      addMembershipTier(payload);
      toast('Tier created');
    } else {
      updateMembershipTier(tierModal.id, payload);
      toast('Tier updated');
    }
    setTierModal(null);
  };

  const handleDelete = () => {
    if (confirmDelete?.type === 'member') { deleteMember(confirmDelete.id); toast('Member removed'); }
    if (confirmDelete?.type === 'tier') { deleteMembershipTier(confirmDelete.id); toast('Tier deleted'); }
    setConfirmDelete(null);
  };

  const exportCSV = () => {
    const header = 'ID,Name,Email,Phone,Tier,Join Date,Renewal Date,Status,Notes';
    const rows = filtered.map(m =>
      `${m.id},"${m.name}","${m.email}","${m.phone || ''}",${m.tier},${m.joinDate},${m.renewalDate || ''},${m.status},"${(m.notes||'').replace(/"/g,'""')}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `members-${new Date().toISOString().slice(0,10)}.csv` });
    a.click();
    toast('Members exported');
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
    <div style={{ fontFamily: FONT, color: C.text, padding: '0 0 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="admin-page-title">Memberships</h1>
          <p className="admin-page-subtitle">Manage members and membership tiers</p>
        </div>
        {canEdit && tab === 'members' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-outline" onClick={exportCSV} style={{ height: 40 }}>Export CSV</button>
            <button className="admin-btn admin-btn-primary" onClick={openAddMember} style={{ height: 40 }}>+ Add Member</button>
          </div>
        )}
        {canEdit && tab === 'tiers' && (
          <button className="admin-btn admin-btn-primary" onClick={openAddTier} style={{ height: 40 }}>+ New Tier</button>
        )}
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Members', value: members.length },
          { label: 'Active', value: active.length },
          { label: 'Expired / Cancelled', value: expired.length },
          { label: 'Annual Revenue', value: formatPrice(tierRevenue) },
        ].map(k => (
          <div key={k.label} style={{ ...card, padding: '16px 20px' }}>
            <p style={label}>{k.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '6px 0 0', color: C.text }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid ' + C.border, marginBottom: 24 }}>
        {['members', 'tiers'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: FONT, fontSize: 14, fontWeight: 500,
            color: tab === t ? C.gold : C.text2,
            borderBottom: tab === t ? `2px solid ${C.gold}` : '2px solid transparent',
            textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {/* ── MEMBERS TAB ── */}
      {tab === 'members' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <input
              placeholder="Search name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, width: 260, flex: '0 0 auto' }}
            />
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)} style={{ ...inputStyle, width: 160 }}>
              <option value="All">All Tiers</option>
              {tierNames.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 140 }}>
              <option value="All">All Statuses</option>
              <option>Active</option><option>Expired</option><option>Cancelled</option>
            </select>
          </div>

          {/* Members table */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid ' + C.border, background: C.bg }}>
                  {['Name', 'Email', 'Tier', 'Joined', 'Renewal', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: C.muted }}>No members match your filters</td></tr>
                )}
                {filtered.map(m => {
                  const sc = STATUS_COLORS[m.status] || STATUS_COLORS.Active;
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid ' + C.border }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{m.name}</td>
                      <td style={{ padding: '12px 16px', color: C.text2 }}>{m.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(197,165,90,0.12)', color: C.gold }}>{m.tier}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: C.text2, fontFamily: MONO, fontSize: 12 }}>{m.joinDate}</td>
                      <td style={{ padding: '12px 16px', color: C.text2, fontFamily: MONO, fontSize: 12 }}>{m.renewalDate || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, ...sc }}>{m.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {canEdit && <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditMember(m)}>Edit</button>}
                          {canEdit && <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setConfirmDelete({ type: 'member', id: m.id, name: m.name })} style={{ color: C.danger }}>Delete</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: C.muted, fontFamily: MONO }}>
            {filtered.length} of {members.length} members
          </p>
        </>
      )}

      {/* ── TIERS TAB ── */}
      {tab === 'tiers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {tiers.map(t => {
            const memberCount = members.filter(m => m.tier === t.name && m.status === 'Active').length;
            return (
              <div key={t.id} style={{ ...card, position: 'relative', opacity: t.active ? 1 : 0.55 }}>
                {t.badge && (
                  <div style={{ position: 'absolute', top: 16, right: 16, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(197,165,90,0.15)', color: C.gold, fontFamily: MONO, textTransform: 'uppercase', letterSpacing: 1 }}>{t.badge}</div>
                )}
                <p style={{ ...label, marginBottom: 4 }}>Tier</p>
                <h3 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>{t.name}</h3>
                <p style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, color: t.featured ? C.gold : C.text }}>{formatPrice(t.price)}<span style={{ fontSize: 14, fontWeight: 400, color: C.text2 }}> / {t.period}</span></p>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: C.text2 }}>{t.desc}</p>
                <div style={{ margin: '0 0 16px' }}>
                  {(t.benefits || []).slice(0, 4).map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ color: C.success, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: C.text2 }}>{b}</span>
                    </div>
                  ))}
                  {(t.benefits || []).length > 4 && <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>+{t.benefits.length - 4} more benefits</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid ' + C.border }}>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: C.text2 }}>{memberCount} active member{memberCount !== 1 ? 's' : ''}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {canEdit && <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditTier(t)}>Edit</button>}
                    {canEdit && (
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setConfirmDelete({ type: 'tier', id: t.id, name: t.name })} style={{ color: C.danger }}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {tiers.length === 0 && (
            <div style={{ ...card, textAlign: 'center', color: C.muted, padding: 48 }}>No tiers yet — add your first tier</div>
          )}
        </div>
      )}

      {/* ── MEMBER MODAL ── */}
      {memberModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={saveMember} style={{ background: C.card, borderRadius: 12, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20 }}>{memberModal === 'add' ? 'Add Member' : 'Edit Member'}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {[['Full Name', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel']].map(([lbl, field, type]) => (
                <div key={field}>
                  <p style={label}>{lbl}</p>
                  <input type={type} value={memberForm[field]} onChange={e => setMemberForm(f => ({ ...f, [field]: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={label}>Tier</p>
                  <select value={memberForm.tier} onChange={e => setMemberForm(f => ({ ...f, tier: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }}>
                    {tierNames.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <p style={label}>Status</p>
                  <select value={memberForm.status} onChange={e => setMemberForm(f => ({ ...f, status: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }}>
                    <option>Active</option><option>Expired</option><option>Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <p style={label}>Notes</p>
                <textarea value={memberForm.notes} onChange={e => setMemberForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical', marginTop: 4 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => setMemberModal(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary">Save Member</button>
            </div>
          </form>
        </div>
      )}

      {/* ── TIER MODAL ── */}
      {tierModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: 24 }}>
          <form onSubmit={saveTier} style={{ background: C.card, borderRadius: 12, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20 }}>{tierModal === 'add' ? 'New Tier' : 'Edit Tier'}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={label}>Tier Name</p>
                  <input value={tierForm.name} onChange={e => setTierForm(f => ({ ...f, name: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="e.g. Observer" />
                </div>
                <div>
                  <p style={label}>Price ($/year)</p>
                  <input type="number" min="0" step="0.01" value={tierForm.price} onChange={e => setTierForm(f => ({ ...f, price: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="99" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={label}>Store Discount (%)</p>
                  <input type="number" min="0" max="100" value={tierForm.discount} onChange={e => setTierForm(f => ({ ...f, discount: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="10" />
                </div>
                <div>
                  <p style={label}>Badge Label</p>
                  <input value={tierForm.badge} onChange={e => setTierForm(f => ({ ...f, badge: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="Most Popular" />
                </div>
              </div>
              <div>
                <p style={label}>Description</p>
                <input value={tierForm.desc} onChange={e => setTierForm(f => ({ ...f, desc: e.target.value }))} style={{ ...inputStyle, marginTop: 4 }} placeholder="Short tagline for this tier" />
              </div>
              <div>
                <p style={label}>Benefits (one per line)</p>
                <textarea value={tierForm.benefits} onChange={e => setTierForm(f => ({ ...f, benefits: e.target.value }))} rows={5} style={{ ...inputStyle, resize: 'vertical', marginTop: 4 }} placeholder={'10% discount on all store purchases\nMonthly dark sky newsletter'} />
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button type="button" onClick={() => setTierForm(f => ({ ...f, featured: !f.featured }))} style={toggleStyle(tierForm.featured)}>
                    <div style={knobStyle(tierForm.featured)} />
                  </button>
                  <span style={{ fontSize: 13 }}>Featured tier</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button type="button" onClick={() => setTierForm(f => ({ ...f, active: !f.active }))} style={toggleStyle(tierForm.active)}>
                    <div style={knobStyle(tierForm.active)} />
                  </button>
                  <span style={{ fontSize: 13 }}>Active (visible on site)</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => setTierModal(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary">Save Tier</button>
            </div>
          </form>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: C.card, borderRadius: 12, padding: 32, maxWidth: 400, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>Delete {confirmDelete.type}?</h3>
            <p style={{ color: C.text2, margin: '0 0 24px' }}>
              Remove <strong>{confirmDelete.name}</strong>? This cannot be undone.
            </p>
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
