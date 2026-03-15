import { useState, useEffect } from 'react';
import { getDonations, addDonation, updateDonation, deleteDonation, getFundraising, formatPrice, subscribe } from '../data/store';
import { useToast, useRole } from '../AdminLayout';
import HelpBubble from '../components/HelpBubble';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const CAMPAIGNS = ['General', 'Capital Campaign', 'Education Fund', 'Dark Sky Preservation'];
const TYPES = ['one-time', 'recurring', 'grant'];

const typePill = {
  'one-time': { bg: '#E8F0FE', color: '#1A73E8' },
  'recurring': { bg: '#E6F4EA', color: '#1E8E3E' },
  'grant': { bg: '#FEF7E0', color: '#B8860B' },
};

const cardStyle = { background: C.card, border: '1px solid ' + C.border, borderRadius: 10, padding: 24, boxShadow: C.shadow };
const labelStyle = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, margin: 0 };

const emptyForm = { donor: '', email: '', amount: '', type: 'one-time', campaign: 'General', notes: '', date: new Date().toISOString().slice(0, 10) };

export default function Donations() {
  const [, setTick] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const toast = useToast();
  const role = useRole();
  const isReadOnly = role === 'board_member';

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  const donations = getDonations();
  const fundraising = getFundraising();

  // Summary calculations
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const ytdDonations = donations.filter(d => d.date >= yearStart);
  const totalYTD = ytdDonations.reduce((s, d) => s + (d.amount || 0), 0);
  const monthDonations = donations.filter(d => d.date >= monthStart);
  const totalMonth = monthDonations.reduce((s, d) => s + (d.amount || 0), 0);
  const avgGift = ytdDonations.length ? Math.round(totalYTD / ytdDonations.length) : 0;
  const uniqueDonors = new Set(ytdDonations.map(d => d.donor)).size;

  const raised = fundraising.raised / 100;
  const goal = fundraising.goal / 100;
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  const sorted = [...donations].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.donor || !form.amount) { toast('Please fill in donor name and amount'); return; }
    addDonation({ ...form, amount: Number(form.amount), taxDeductible: true, acknowledged: false });
    toast('Donation recorded successfully');
    setForm({ ...emptyForm });
    setShowModal(false);
  };

  const handleThankYou = (id) => {
    updateDonation(id, { acknowledged: true });
    toast('Thank you sent — donation acknowledged');
  };

  const exportCSV = () => {
    const header = 'Date,Donor,Email,Amount,Type,Campaign,Acknowledged,Notes';
    const rows = sorted.map(d =>
      `${d.date},"${d.donor}","${d.email || ''}",${d.amount},${d.type},${d.campaign},${d.acknowledged ? 'Yes' : 'No'},"${(d.notes || '').replace(/"/g, '""')}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported');
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Donations</h1>
          <HelpBubble text="Track donor contributions, grants, and fundraising progress for the IDSDC." />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV} style={{ padding: '8px 16px', border: '1px solid ' + C.border, borderRadius: 8, background: C.card, cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: C.text2 }}>
            Export CSV
          </button>
          {!isReadOnly && (
            <button onClick={() => setShowModal(true)} style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: C.gold, color: '#fff', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600 }}>
              + Record Donation
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Donations YTD', value: `$${totalYTD.toLocaleString()}` },
          { label: 'This Month', value: `$${totalMonth.toLocaleString()}` },
          { label: 'Average Gift', value: `$${avgGift.toLocaleString()}` },
          { label: 'Donor Count', value: uniqueDonors },
        ].map((c, i) => (
          <div key={i} style={cardStyle}>
            <p style={labelStyle}>{c.label}</p>
            <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Fundraising Progress */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={labelStyle}>Fundraising Progress</p>
          <span style={{ fontFamily: MONO, fontSize: 13, color: C.text2 }}>{pct.toFixed(1)}%</span>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700 }}>
          ${(raised / 1000000).toFixed(1)}M <span style={{ fontSize: 14, fontWeight: 400, color: C.text2 }}>of ${(goal / 1000000).toFixed(0)}M</span>
        </p>
        <div style={{ height: 10, background: C.border, borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: pct + '%', background: `linear-gradient(90deg, ${C.gold}, #D4C07A)`, borderRadius: 5, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Donation Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid ' + C.border }}>
              {['Date', 'Donor', 'Amount', 'Type', 'Campaign', 'Acknowledged', ''].map((h, i) => (
                <th key={i} style={{ ...labelStyle, padding: '14px 16px', textAlign: 'left', borderBottom: '1px solid ' + C.border }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid ' + C.border }}>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{d.date}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                  {d.donor}
                  {d.email && <span style={{ display: 'block', fontSize: 11, color: C.text2 }}>{d.email}</span>}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: MONO, fontWeight: 600 }}>${(d.amount || 0).toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                    background: (typePill[d.type] || typePill['one-time']).bg,
                    color: (typePill[d.type] || typePill['one-time']).color,
                  }}>
                    {d.type}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: C.text2 }}>{d.campaign}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {d.acknowledged ? <span style={{ color: C.success, fontSize: 18 }}>&#10003;</span> : <span style={{ color: C.muted }}>—</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {!isReadOnly && !d.acknowledged && (
                    <button onClick={() => handleThankYou(d.id)} style={{ padding: '4px 12px', border: '1px solid ' + C.border, borderRadius: 6, background: C.card, cursor: 'pointer', fontSize: 12, fontFamily: FONT, color: C.text2, whiteSpace: 'nowrap' }}>
                      Send Thank You
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No donations recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Donation Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ ...cardStyle, width: 480, maxHeight: '90vh', overflowY: 'auto', padding: 32 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>Record Donation</h2>
            <form onSubmit={handleSubmit}>
              {/* Donor Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Donor Name *</label>
                <input value={form.donor} onChange={e => setForm({ ...form, donor: e.target.value })} style={inputStyle} placeholder="Full name or organization" />
              </div>
              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" style={inputStyle} placeholder="donor@email.com" />
              </div>
              {/* Amount */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Amount ($) *</label>
                <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} type="number" min="1" style={inputStyle} placeholder="0" />
              </div>
              {/* Type */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {/* Campaign */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Campaign</label>
                <select value={form.campaign} onChange={e => setForm({ ...form, campaign: e.target.value })} style={inputStyle}>
                  {CAMPAIGNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Date */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Date</label>
                <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} type="date" style={inputStyle} />
              </div>
              {/* Notes */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional notes..." />
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid ' + C.border, borderRadius: 8, background: C.card, cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: C.text2 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: C.gold, color: '#fff', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600 }}>Save Donation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: 'block', width: '100%', padding: '8px 12px', marginTop: 4,
  border: '1px solid #E8E5DF', borderRadius: 8, fontSize: 14,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  color: '#1A1A2E', background: '#fff', outline: 'none', boxSizing: 'border-box',
};
