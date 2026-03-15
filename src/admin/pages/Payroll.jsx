import { useState, useEffect, useCallback } from 'react';
import { useToast, useRole } from '../AdminLayout';
import {
  getStaff, getTimesheets, getPayrollHistory,
  updateTimesheets, addPayrollRecord, formatPrice, subscribe,
} from '../data/store';

// ── Design Tokens ──
const C = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  border: '#E8E5DF',
  gold: '#C5A55A',
  text: '#1A1A2E',
  text2: '#7C7B76',
  muted: '#B5B3AD',
  success: '#3D8C6F',
  warning: '#D4943A',
  danger: '#C45B5B',
  shadow: '0 1px 3px rgba(0,0,0,0.04)',
  shadowHover: '0 4px 12px rgba(0,0,0,0.07)',
};

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TABS = ['Staff Roster', 'Time Sheets', 'Export to Payroll', 'Documents'];

const DOCUMENTS = [
  { name: 'Employee Handbook (2026)', type: 'PDF', date: '2026-01-15' },
  { name: 'W-4 Template', type: 'PDF', date: '2025-12-01' },
  { name: 'Direct Deposit Form', type: 'PDF', date: '2025-11-20' },
  { name: 'I-9 Employment Eligibility', type: 'PDF', date: '2025-10-01' },
];

export default function Payroll() {
  const toast = useToast();
  const role = useRole();
  const [tab, setTab] = useState(0);
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);
  const [expandedStaff, setExpandedStaff] = useState(null);

  useEffect(() => subscribe(refresh), [refresh]);

  const staff = getStaff();
  const timesheets = getTimesheets();
  const payrollHistory = getPayrollHistory();

  const hourlyStaff = staff.filter(s => s.payType === 'Hourly');

  const handleApproveAll = () => {
    const updated = timesheets.map(ts => ({ ...ts, status: 'Approved' }));
    updateTimesheets(updated);
    toast('All timesheets approved');
  };

  const handleExportCSV = () => {
    const rows = [['Staff', 'Role', 'Pay Period', 'Hours', 'Rate']];
    timesheets.forEach(ts => {
      const s = staff.find(st => st.id === ts.staffId);
      const totalH = ts.hours.reduce((a, b) => a + b, 0);
      rows.push([ts.name, s?.role || '', 'Mar 1-15 2026', totalH, s?.payRate ? formatPrice(s.payRate) : 'Salary']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'payroll-export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported');
  };

  const handleSubmitToPayroll = () => {
    const totalH = timesheets.reduce((s, ts) => s + ts.hours.reduce((a, b) => a + b, 0), 0);
    addPayrollRecord({
      period: 'Mar 1-15, 2026',
      totalHours: totalH,
      staffCount: timesheets.length,
      status: 'Submitted',
      date: new Date().toISOString().slice(0, 10),
      submittedAt: new Date().toISOString().slice(0, 10),
    });
    toast('Hours submitted to payroll provider');
  };

  const cardStyle = {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: 24, boxShadow: C.shadow,
  };

  const thStyle = {
    fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1,
    color: C.text2, textAlign: 'left', padding: '10px 12px', borderBottom: `1px solid ${C.border}`,
  };

  const tdStyle = {
    fontFamily: FONT, fontSize: 13, color: C.text, padding: '12px 12px', borderBottom: `1px solid ${C.border}`,
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Staff & Time</h1>
        <p style={{ fontSize: 14, color: C.text2, margin: 0 }}>Staff roster, timesheets, and hours export. Syncs with your payroll provider.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            fontFamily: FONT, fontSize: 13, fontWeight: tab === i ? 600 : 400,
            color: tab === i ? C.gold : C.text2, background: 'none', border: 'none',
            borderBottom: tab === i ? `2px solid ${C.gold}` : '2px solid transparent',
            padding: '10px 20px', cursor: 'pointer', transition: 'all 0.2s',
          }}>{t}</button>
        ))}
      </div>

      {/* Tab 0: Staff Roster */}
      {tab === 0 && (
        <div style={cardStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Hire Date</th>
                <th style={thStyle}>Pay Rate</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <>
                  <tr key={s.id} onClick={() => setExpandedStaff(expandedStaff === s.id ? null : s.id)}
                    style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{s.name}</td>
                    <td style={tdStyle}>{s.role}</td>
                    <td style={tdStyle}>{s.department}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontFamily: MONO, fontSize: 11, padding: '3px 8px', borderRadius: 4,
                        background: s.status === 'Active' ? '#E8F5E9' : '#FFF3E0',
                        color: s.status === 'Active' ? C.success : C.warning,
                      }}>{s.status}</span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: MONO, fontSize: 12 }}>{s.hireDate}</td>
                    <td style={tdStyle}>
                      {s.payType === 'Salary' ? (
                        <span style={{ fontFamily: MONO, fontSize: 12, color: C.text2 }}>Salary</span>
                      ) : (
                        <span style={{ fontFamily: MONO, fontSize: 12 }}>{formatPrice(s.payRate)}/hr</span>
                      )}
                    </td>
                  </tr>
                  {expandedStaff === s.id && (
                    <tr key={s.id + '-detail'}>
                      <td colSpan={6} style={{ padding: '12px 12px 16px', background: '#FAFAF8', borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', gap: 32, fontSize: 13 }}>
                          <div><span style={{ fontFamily: MONO, fontSize: 10, color: C.text2, textTransform: 'uppercase', letterSpacing: 1 }}>Email</span><br />{s.email}</div>
                          <div><span style={{ fontFamily: MONO, fontSize: 10, color: C.text2, textTransform: 'uppercase', letterSpacing: 1 }}>Pay Type</span><br />{s.payType}</div>
                          <div><span style={{ fontFamily: MONO, fontSize: 10, color: C.text2, textTransform: 'uppercase', letterSpacing: 1 }}>ID</span><br />{s.id}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 1: Time Sheets */}
      {tab === 1 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.text2, textTransform: 'uppercase', letterSpacing: 1 }}>Week of March 9, 2026</span>
            </div>
            <button onClick={handleApproveAll} style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#fff',
              background: C.gold, border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer',
            }}>Approve All</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Staff</th>
                {DAYS.map(d => <th key={d} style={{ ...thStyle, textAlign: 'center', minWidth: 48 }}>{d}</th>)}
                <th style={{ ...thStyle, textAlign: 'center' }}>Total</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map(ts => {
                const total = ts.hours.reduce((a, b) => a + b, 0);
                return (
                  <tr key={ts.staffId}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{ts.name}</td>
                    {ts.hours.map((h, i) => (
                      <td key={i} style={{ ...tdStyle, textAlign: 'center', color: h === 0 ? C.muted : C.text }}>{h}</td>
                    ))}
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: C.gold }}>{total}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        fontFamily: MONO, fontSize: 11, padding: '3px 8px', borderRadius: 4,
                        background: ts.status === 'Approved' ? '#E8F5E9' : '#FFF8E1',
                        color: ts.status === 'Approved' ? C.success : C.warning,
                      }}>{ts.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Export to Payroll */}
      {tab === 2 && (
        <>
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '12px 16px', background: '#F8F7F4', borderRadius: 6, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 18 }}>&#128279;</span>
              <span style={{ fontFamily: FONT, fontSize: 13, color: C.text2 }}>Approved hours export to your payroll provider (QuickBooks Payroll, Gusto, ADP, or similar). We track time — they handle taxes, withholdings, and payments.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.text2, textTransform: 'uppercase', letterSpacing: 1 }}>Pay Period: March 1-15, 2026</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleExportCSV} style={{
                  fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.text,
                  background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
                }}>Download CSV</button>
                <button onClick={handleSubmitToPayroll} style={{
                  fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#fff',
                  background: C.gold, border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
                }}>Submit to Payroll Provider</button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Staff</th>
                  <th style={thStyle}>Role</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Hours</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Rate</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map(ts => {
                  const s = staff.find(st => st.id === ts.staffId);
                  const totalH = ts.hours.reduce((a, b) => a + b, 0);
                  return (
                    <tr key={ts.staffId}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{ts.name}</td>
                      <td style={{ ...tdStyle, color: C.text2 }}>{s?.role || ''}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.gold }}>{totalH}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: MONO, fontSize: 12 }}>{s?.payRate ? formatPrice(s.payRate) + '/hr' : 'Salary'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span style={{ fontFamily: MONO, fontSize: 11, padding: '3px 8px', borderRadius: 4, background: ts.status === 'Approved' ? '#E8F5E9' : '#FFF8E1', color: ts.status === 'Approved' ? C.success : C.warning }}>{ts.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ ...tdStyle, fontWeight: 700, borderTop: `2px solid ${C.border}` }} colSpan={2}>Total Hours</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.gold, borderTop: `2px solid ${C.border}` }}>
                    {timesheets.reduce((s, ts) => s + ts.hours.reduce((a, b) => a + b, 0), 0)}
                  </td>
                  <td style={{ ...tdStyle, borderTop: `2px solid ${C.border}` }} colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Submission History */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Submission History</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Period</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {payrollHistory.map((p, i) => (
                  <tr key={i}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{p.period}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontFamily: MONO, fontSize: 11, padding: '3px 8px', borderRadius: 4,
                        background: (p.status === 'Paid' || p.status === 'Submitted') ? '#E8F5E9' : '#FFF8E1',
                        color: (p.status === 'Paid' || p.status === 'Submitted') ? C.success : C.warning,
                      }}>{p.status === 'Paid' ? 'Submitted' : p.status}</span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: MONO, fontSize: 12, color: C.text2 }}>{p.paidAt || p.submittedAt || '\u2014'}</td>
                  </tr>
                ))}
                {payrollHistory.length === 0 && (
                  <tr><td colSpan={3} style={{ ...tdStyle, color: C.muted, textAlign: 'center' }}>No submissions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab 3: Documents */}
      {tab === 3 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>HR Documents</h3>
            <label style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#fff',
              background: C.gold, borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
            }}>
              Upload
              <input type="file" style={{ display: 'none' }} onChange={() => toast('Upload feature coming soon')} />
            </label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DOCUMENTS.map(doc => (
              <div key={doc.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', border: `1px solid ${C.border}`, borderRadius: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 6, background: '#FEF3E2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: MONO, fontSize: 10, color: C.warning, fontWeight: 700,
                  }}>{doc.type}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: C.text2 }}>Added {doc.date}</div>
                  </div>
                </div>
                <button onClick={() => toast('Document viewer coming soon')} style={{
                  fontFamily: FONT, fontSize: 12, color: C.gold, background: 'none',
                  border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 12px', cursor: 'pointer',
                }}>View</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
