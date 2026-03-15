import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../AdminLayout';
import {
  getInventory, getOrders, getPurchaseOrders, getMembers,
  formatPrice, subscribe,
} from '../data/store';
import PageTour from '../components/PageTour';

// ---- Helpers ----
const today = () => {
  const d = new Date();
  return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
};
const fileDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const fmtDate = (iso) => {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${m}/${d}/${y}`;
};
const centsToStr = (c) => (c / 100).toFixed(2);
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0,10);
};

const STORAGE_KEY = 'darksky_qb_sync_log';
const getSyncLog = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const addSyncLog = (entry) => {
  const log = getSyncLog();
  log.unshift({ ...entry, id: Date.now(), date: new Date().toISOString() });
  if (log.length > 50) log.length = 50;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  return log;
};

// ---- CSV Download ----
function downloadCSV(filename, headers, rows) {
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s;
  };
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- Styles ----
const S = {
  page: { maxWidth: 1100 },
  connCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: '28px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  connLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  connLogo: {
    width: 48, height: 48, borderRadius: 10,
    background: 'linear-gradient(135deg, #2CA01C, #1B7A12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 20,
  },
  connTitle: { font: "500 16px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B', marginBottom: 4 },
  connStatus: (connected) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    font: "500 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: connected ? '#10B981' : '#64748B',
  }),
  connDot: (connected) => ({
    width: 7, height: 7, borderRadius: '50%',
    background: connected ? '#10B981' : '#94A3B8',
  }),
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20, marginBottom: 36,
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: 24,
    display: 'flex', flexDirection: 'column', gap: 16,
    transition: 'border-color 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: 8,
    background: 'rgba(212,175,55,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { font: "500 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B' },
  cardDesc: { font: "400 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8', margin: 0 },
  rangeRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  rangeBtn: (active) => ({
    padding: '6px 12px', borderRadius: 5, border: 'none',
    font: "500 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: 'pointer',
    background: active ? 'rgba(212,175,55,0.12)' : '#F1F5F9',
    color: active ? '#d4af37' : '#64748B',
    transition: 'all 0.15s',
  }),
  exportBtn: (exporting, done) => ({
    width: '100%', padding: '12px 16px', borderRadius: 7, border: 'none',
    font: "600 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: exporting ? 'default' : 'pointer',
    background: done ? 'rgba(16,185,129,0.12)' : exporting ? 'rgba(212,175,55,0.3)' : '#d4af37',
    color: done ? '#10B981' : exporting ? '#d4af37' : '#04040c',
    transition: 'all 0.25s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 'auto',
  }),
  sectionTitle: {
    font: "500 18px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#1E293B', marginBottom: 20,
  },
  logTh: {
    padding: '12px 14px', font: "500 13px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    letterSpacing: 1.5, textTransform: 'uppercase', color: '#94A3B8',
    textAlign: 'left', borderBottom: '1px solid #E2E8F0',
    background: '#FAFAF8',
  },
  logTd: {
    padding: '13px 14px', font: "400 14px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#64748B',
    borderBottom: '1px solid #F1F5F9',
  },
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
  },
  modalCard: {
    background: '#FFFFFF', border: '1px solid #E2E8F0',
    borderRadius: 12, padding: 36, maxWidth: 440, width: '90%', textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  },
};

// ---- Spinner SVG ----
const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.6s linear infinite' }}>
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
  </svg>
);
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,8.5 6.5,12 13,4" />
  </svg>
);

// ---- Export Card Component ----
function ExportCard({ icon, title, desc, ranges, onExport }) {
  const [range, setRange] = useState(ranges ? ranges[0].value : null);
  const [state, setState] = useState('idle');

  const handleExport = async () => {
    setState('exporting');
    await new Promise(r => setTimeout(r, 1200));
    onExport(range);
    setState('done');
    setTimeout(() => setState('idle'), 2500);
  };

  return (
    <div style={S.card} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'}
         onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={S.cardIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5">{icon}</svg>
        </div>
        <div>
          <div style={S.cardTitle}>{title}</div>
        </div>
      </div>
      <p style={S.cardDesc}>{desc}</p>
      {ranges && (
        <div style={S.rangeRow}>
          {ranges.map(r => (
            <button key={r.value} style={S.rangeBtn(range === r.value)}
                    onClick={() => setRange(r.value)}>{r.label}</button>
          ))}
        </div>
      )}
      <button style={S.exportBtn(state === 'exporting', state === 'done')}
              onClick={handleExport} disabled={state === 'exporting'}>
        {state === 'exporting' ? <><Spinner /> Generating...</> :
         state === 'done' ? <><Check /> Downloaded</> :
         <>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
           </svg>
           Export CSV
         </>}
      </button>
    </div>
  );
}

// ---- Main Component ----
export default function QuickBooks() {
  const [, setTick] = useState(0);
  const addToast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [syncLog, setSyncLog] = useState(getSyncLog);
  const [autoWeekly, setAutoWeekly] = useState(false);
  const [autoEmail, setAutoEmail] = useState(false);
  const [emailAddr, setEmailAddr] = useState('');

  useEffect(() => {
    const unsub = subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const dateRanges = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
  ];

  // ---- Export: Sales ----
  const exportSales = useCallback((days) => {
    const cutoff = daysAgo(days);
    const orders = getOrders();
    const headers = ['Date', 'Transaction Type', 'Customer Name', 'Item', 'Quantity', 'Amount', 'Payment Method', 'Reference'];
    const rows = [];
    orders.forEach(ord => {
      if (ord.date < cutoff) return;
      (ord.items || []).forEach(item => {
        rows.push([
          fmtDate(ord.date), 'Sale', ord.customer || '', item.name + (item.variant ? ` (${item.variant})` : ''),
          item.qty || 1, centsToStr((item.price || 0) * (item.qty || 1)),
          ord.channel === 'POS' ? 'Square POS' : 'Square Online', ord.id,
        ]);
      });
    });
    downloadCSV(`darksky-sales-${fileDate()}.csv`, headers, rows);
    const log = addSyncLog({ type: 'Sales', records: rows.length, status: 'Exported', range: `${days} days` });
    setSyncLog(log);
    addToast(`Exported ${rows.length} sales records`);
  }, [addToast]);

  // ---- Export: Products ----
  const exportProducts = useCallback(() => {
    const inventory = getInventory();
    const headers = ['Item Name', 'SKU', 'Type', 'Description', 'Sales Price', 'Purchase Cost', 'Quantity On Hand', 'Reorder Point', 'Category'];
    const rows = inventory.map(p => [
      p.name + (p.variant ? ` - ${p.variant}` : ''), p.sku,
      p.productId ? 'Non-Inventory' : 'Inventory',
      `${p.category || ''} - ${p.variant || ''}`.trim(),
      centsToStr(p.price || 0), centsToStr(Math.round((p.price || 0) * 0.45)),
      (p.warehouse || 0) + (p.giftshop || 0), p.reorderPoint || 5, p.category || '',
    ]);
    downloadCSV(`darksky-products-${fileDate()}.csv`, headers, rows);
    const log = addSyncLog({ type: 'Products', records: rows.length, status: 'Exported' });
    setSyncLog(log);
    addToast(`Exported ${rows.length} products`);
  }, [addToast]);

  // ---- Export: Customers ----
  const exportCustomers = useCallback(() => {
    const orders = getOrders();
    const members = getMembers();
    const headers = ['Customer Name', 'Email', 'Phone', 'First Purchase Date', 'Total Spent', 'Member Status'];
    const custMap = {};
    orders.forEach(ord => {
      if (!ord.email) return;
      if (!custMap[ord.email]) {
        custMap[ord.email] = { name: ord.customer || '', email: ord.email, firstDate: ord.date, total: 0 };
      }
      custMap[ord.email].total += (ord.total || 0);
      if (ord.date < custMap[ord.email].firstDate) custMap[ord.email].firstDate = ord.date;
    });
    // Add members not in orders
    members.forEach(m => {
      if (!custMap[m.email]) {
        custMap[m.email] = { name: m.name, email: m.email, firstDate: m.joinDate, total: 0 };
      }
      custMap[m.email].isMember = true;
    });
    const rows = Object.values(custMap).map(c => [
      c.name, c.email, '', fmtDate(c.firstDate), centsToStr(c.total),
      c.isMember ? 'Active Member' : '',
    ]);
    downloadCSV(`darksky-customers-${fileDate()}.csv`, headers, rows);
    const log = addSyncLog({ type: 'Customers', records: rows.length, status: 'Exported' });
    setSyncLog(log);
    addToast(`Exported ${rows.length} customers`);
  }, [addToast]);

  // ---- Export: Bills (POs) ----
  const exportBills = useCallback(() => {
    const purchaseOrders = getPurchaseOrders();
    const headers = ['Vendor', 'Date', 'Due Date', 'Item', 'Quantity', 'Amount', 'Memo'];
    const rows = [];
    purchaseOrders.forEach(po => {
      (po.items || []).forEach(item => {
        rows.push([
          po.vendor || '', fmtDate(po.createdDate),
          fmtDate(po.expectedDate || po.createdDate),
          item.name + (item.variant ? ` (${item.variant})` : ''),
          item.ordered || 0, centsToStr((item.price || 0) * (item.ordered || 0)), po.id,
        ]);
      });
    });
    downloadCSV(`darksky-bills-${fileDate()}.csv`, headers, rows);
    const log = addSyncLog({ type: 'Bills/POs', records: rows.length, status: 'Exported' });
    setSyncLog(log);
    addToast(`Exported ${rows.length} bill line items`);
  }, [addToast]);

  // ---- Re-download from log ----
  const redownload = useCallback((type) => {
    if (type === 'Sales') exportSales(30);
    else if (type === 'Products') exportProducts();
    else if (type === 'Customers') exportCustomers();
    else if (type.includes('Bill')) exportBills();
  }, [exportSales, exportProducts, exportCustomers, exportBills]);

  return (
    <div style={S.page}>
      <PageTour storageKey="ds_tour_quickbooks" steps={[
        { target: '.admin-page-title', title: 'QuickBooks Integration', text: 'Export your sales, inventory, and customer data as CSV files ready for QuickBooks import.' },
        { target: '#tour-qb-exports', title: 'Export Cards', text: 'Each card exports a different data type. Choose a date range and click Export — the CSV downloads instantly.' },
        { target: '#tour-qb-log', title: 'Sync History', text: 'Every export is logged here so you always know when data was last synced.' },
      ]} />

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">QuickBooks Integration</div>
          <div className="admin-page-subtitle">Export data for Nancy's bookkeeping</div>
        </div>
      </div>

      {/* Connection Status */}
      <div id="tour-qb-exports" style={S.connCard}>
        <div style={S.connLeft}>
          <div style={S.connLogo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
          </div>
          <div>
            <div style={S.connTitle}>QuickBooks Online</div>
            <div style={S.connStatus(false)}>
              <span style={S.connDot(false)} />
              Not Connected
            </div>
          </div>
        </div>
        <button className="admin-btn admin-btn-gold" onClick={() => setShowModal(true)}>
          Connect to QuickBooks
        </button>
      </div>

      {/* Export Center */}
      <div style={S.sectionTitle}>Export Center</div>
      <div style={S.grid}>
        {/* Sales */}
        <ExportCard
          icon={<><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></>}
          title="Sales Report"
          desc="Export all sales transactions in QuickBooks CSV format. Includes order details, payment method, and customer info."
          ranges={dateRanges}
          onExport={exportSales}
        />

        {/* Products */}
        <ExportCard
          icon={<><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>}
          title="Products & Inventory"
          desc="Export product catalog with SKUs, pricing, stock levels, and item types for QuickBooks inventory tracking."
          onExport={exportProducts}
        />

        {/* Customers */}
        <ExportCard
          icon={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>}
          title="Customer List"
          desc="Export customer records with purchase history and membership status for QuickBooks contacts."
          onExport={exportCustomers}
        />

        {/* Bills */}
        <ExportCard
          icon={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}
          title="Purchase Orders as Bills"
          desc="Convert purchase orders into QuickBooks Bill format. Tracks vendor expenses and amounts owed."
          onExport={exportBills}
        />
      </div>

      {/* Auto-Export Settings */}
      <div style={S.sectionTitle}>Auto-Export Settings</div>
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 10, padding: 24, marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ font: "500 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B', marginBottom: 3 }}>
              Auto-export sales weekly
            </div>
            <div style={{ font: "400 14px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8' }}>
              Every Monday, generate a sales CSV for the previous week
            </div>
          </div>
          <button style={{
            width: 44, height: 24, borderRadius: 12,
            background: autoWeekly ? '#d4af37' : '#E2E8F0',
            border: 'none', cursor: 'pointer', position: 'relative',
            transition: 'background 0.2s', flexShrink: 0,
          }} onClick={() => setAutoWeekly(v => !v)}>
            <span style={{
              position: 'absolute', top: 3, left: autoWeekly ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%',
              background: autoWeekly ? '#FFFFFF' : '#94A3B8',
              transition: 'all 0.2s',
            }} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ font: "500 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B', marginBottom: 3 }}>
              Email export to accountant
            </div>
            <div style={{ font: "400 14px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8' }}>
              Automatically send CSVs to your accountant
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {autoEmail && (
              <input
                className="admin-input"
                placeholder="accountant@email.com"
                value={emailAddr}
                onChange={e => setEmailAddr(e.target.value)}
                style={{ width: 200, fontSize: 14, padding: '8px 12px' }}
              />
            )}
            <button style={{
              width: 44, height: 24, borderRadius: 12,
              background: autoEmail ? '#d4af37' : '#E2E8F0',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s', flexShrink: 0,
            }} onClick={() => setAutoEmail(v => !v)}>
              <span style={{
                position: 'absolute', top: 3, left: autoEmail ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: autoEmail ? '#FFFFFF' : '#94A3B8',
                transition: 'all 0.2s',
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Log */}
      <div id="tour-qb-log" style={S.sectionTitle}>Export History</div>
      <div className="admin-table-wrap">
        {syncLog.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', font: "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            No exports yet. Use the cards above to generate your first CSV.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={S.logTh}>Date</th>
                <th style={S.logTh}>Type</th>
                <th style={S.logTh}>Records</th>
                <th style={S.logTh}>Status</th>
                <th style={S.logTh}></th>
              </tr>
            </thead>
            <tbody>
              {syncLog.slice(0, 15).map(entry => (
                <tr key={entry.id}>
                  <td style={S.logTd}>
                    <span style={{ color: '#1E293B' }}>
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ marginLeft: 8, font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8' }}>
                      {new Date(entry.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </td>
                  <td style={S.logTd}>
                    <span className={`badge ${
                      entry.type === 'Sales' ? 'badge-green' :
                      entry.type === 'Products' ? 'badge-blue' :
                      entry.type === 'Customers' ? 'badge-purple' :
                      'badge-gold'
                    }`}>{entry.type}</span>
                  </td>
                  <td style={S.logTd}>{entry.records} records{entry.range ? ` (${entry.range})` : ''}</td>
                  <td style={S.logTd}>
                    <span style={{ color: '#10B981' }}>OK {entry.status}</span>
                  </td>
                  <td style={{ ...S.logTd, textAlign: 'right' }}>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => redownload(entry.type)}>
                      Re-download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Connection Modal */}
      {showModal && (
        <div style={S.modal} onClick={() => setShowModal(false)}>
          <div style={S.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <h3 style={{ font: "400 20px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B', marginBottom: 12 }}>
              Live Connection Coming Soon
            </h3>
            <p style={{ font: "400 15px/1.6 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#64748B', marginBottom: 28 }}>
              Saleem will set up the live QuickBooks Online connection so data syncs automatically.
              <br /><br />
              In the meantime, use the <strong style={{ color: '#d4af37' }}>Export Center</strong> below to download CSVs and import them into QuickBooks manually.
            </p>
            <button className="admin-btn admin-btn-gold" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setShowModal(false)}>
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
