import { useState, useEffect, useRef } from 'react';
import { useToast } from '../AdminLayout';

/* ═══════════════════════════════════════════
   MOCK DATA GENERATOR
   ═══════════════════════════════════════════ */

const today = new Date('2026-03-13');
const dayMs = 86400000;

function genDailyRevenue(days) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today - i * dayMs);
    const dow = d.getDay();
    const base = dow === 0 || dow === 6 ? 420 : 280;
    const online = Math.round(base + Math.random() * 200);
    const pos = dow === 0 || dow === 6 ? Math.round(180 + Math.random() * 150) : Math.round(60 + Math.random() * 100);
    data.push({
      date: d.toISOString().slice(0, 10),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      online: online * 100,
      pos: pos * 100,
      total: (online + pos) * 100,
    });
  }
  return data;
}

const DAILY_90 = genDailyRevenue(90);

const TOP_PRODUCTS = [
  { name: 'Telescope Enamel Pin', sku: 'DS-PIN-TELE', sold: 87, revenue: 113013 },
  { name: 'Observatory Hoodie', sku: 'DS-HOOD-OBS', sold: 52, revenue: 259948 },
  { name: 'Constellation Tote Bag', sku: 'DS-TOTE-CONST', sold: 48, revenue: 119952 },
  { name: 'Dark Sky Star Map Poster', sku: 'DS-POST-STAR', sold: 44, revenue: 154000 },
  { name: 'Night Sky Field Guide', sku: 'DS-BOOK-GUIDE', sold: 41, revenue: 102459 },
  { name: 'Milky Way Galaxy Mug', sku: 'DS-MUG-MILKY', sold: 38, revenue: 72162 },
  { name: 'Infant Tee — Astronomy', sku: 'DS-INF-ASTRO', sold: 35, revenue: 73465 },
  { name: 'Aurora Borealis Scarf', sku: 'DS-SCARF-AURORA', sold: 28, revenue: 97972 },
  { name: 'Space Pattern Polo', sku: 'DS-POLO-SPACE', sold: 24, revenue: 126240 },
  { name: 'Solar System Mobile', sku: 'DS-MOB-SOLAR', sold: 18, revenue: 71982 },
];

const CHANNEL_DATA = [
  { label: 'Online Store', value: 48200, pct: 52, color: '#d4af37' },
  { label: 'Gift Shop (POS)', value: 28400, pct: 31, color: '#a78bfa' },
  { label: 'Events', value: 9800, pct: 11, color: '#60a5fa' },
  { label: 'Memberships', value: 5600, pct: 6, color: '#4ade80' },
];

const INVENTORY_HEALTH = {
  lowStock: [
    { name: 'Milky Way Galaxy Mug — 11oz', sku: 'DS-MUG-MILKY-11', total: 3, reorder: 12 },
    { name: 'Milky Way Galaxy Mug — 15oz', sku: 'DS-MUG-MILKY-15', total: 2, reorder: 12 },
    { name: 'Space Pattern Polo — L', sku: 'DS-POLO-SPACE-L', total: 3, reorder: 8 },
    { name: 'Solar System Mobile', sku: 'DS-MOB-SOLAR', total: 0, reorder: 5 },
    { name: 'Space Pattern Polo — M', sku: 'DS-POLO-SPACE-M', total: 8, reorder: 8 },
  ],
  overstock: [
    { name: 'Telescope Enamel Pin', sku: 'DS-PIN-TELE', total: 135, reorder: 20 },
    { name: 'Constellation Tote Bag', sku: 'DS-TOTE-CONST', total: 65, reorder: 10 },
    { name: 'Dark Sky Star Map Poster', sku: 'DS-POST-STAR-24', total: 65, reorder: 15 },
  ],
  totalValue: 4285000,
  totalSKUs: 16,
};

const MEMBERSHIP_STATS = {
  tiers: [
    { name: 'Stargazer', count: 184, color: '#908a84' },
    { name: 'Explorer', count: 98, color: '#d4af37' },
    { name: 'Guardian', count: 30, color: '#e0c060' },
  ],
  totalMembers: 312,
  newThisMonth: 14,
  renewalRate: 78,
  monthlyRevenue: 560000,
};

const fmt = (cents) => {
  if (cents >= 100000) return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${(cents / 100).toFixed(2)}`;
};

const RANGES = [
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
];

/* ═══════════════════════════════════════════
   SVG LINE CHART
   ═══════════════════════════════════════════ */
function LineChart({ data, dataKey, color, height = 200 }) {
  if (!data.length) return null;
  const values = data.map(d => d[dataKey]);
  const max = Math.max(...values) * 1.1;
  const min = 0;
  const w = 100;
  const h = 100;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  });
  const areaPoints = `0,${h} ${points.join(' ')} ${w},${h}`;

  // Y-axis labels
  const ySteps = 4;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => Math.round((max / ySteps) * i));

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {/* Y labels */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 20, width: 52, display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between' }}>
        {yLabels.map((v, i) => (
          <span key={i} style={{ font: '400 9px DM Sans', color: '#5a5550', textAlign: 'right', paddingRight: 8 }}>
            ${Math.round(v / 100)}
          </span>
        ))}
      </div>
      {/* Chart */}
      <div style={{ marginLeft: 52, height: height - 20 }}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* Grid lines */}
          {Array.from({ length: ySteps + 1 }, (_, i) => (
            <line key={i} x1="0" y1={h - (i / ySteps) * h} x2={w} y2={h - (i / ySteps) * h}
              stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
          ))}
          {/* Area fill */}
          <polygon points={areaPoints} fill={`url(#grad-${dataKey})`} />
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Line */}
          <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="0.6" strokeLinejoin="round" />
        </svg>
      </div>
      {/* X labels */}
      <div style={{ marginLeft: 52, display: 'flex', justifyContent: 'space-between', height: 20 }}>
        {data.filter((_, i) => {
          const step = Math.max(1, Math.floor(data.length / 7));
          return i % step === 0 || i === data.length - 1;
        }).map((d, i) => (
          <span key={i} style={{ font: '400 9px DM Sans', color: '#5a5550' }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BAR CHART (horizontal)
   ═══════════════════════════════════════════ */
function BarList({ items, maxVal, valueKey = 'sold', labelKey = 'name' }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <span style={{ font: '500 11px DM Sans', color: '#5a5550', width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ font: '400 13px DM Sans', color: '#e8e4df', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item[labelKey]}</span>
              <span style={{ font: '500 12px DM Sans', color: '#d4af37', flexShrink: 0, marginLeft: 8 }}>{item[valueKey]} sold</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${(item[valueKey] / maxVal) * 100}%`,
                background: 'linear-gradient(90deg, #d4af37, #a08520)',
                borderRadius: 2, transition: 'width 0.6s cubic-bezier(.16,1,.3,1)',
              }} />
            </div>
          </div>
          <span style={{ font: '400 11px DM Sans', color: '#908a84', flexShrink: 0, width: 65, textAlign: 'right' }}>{fmt(item.revenue)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DONUT CHART
   ═══════════════════════════════════════════ */
function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
        {data.map((d, i) => {
          const pct = d.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const seg = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={d.color} strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.6s' }}
            />
          );
          offset += dash;
          return seg;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#e8e4df" style={{ font: '600 22px DM Sans' }}>
          {fmt(total * 100)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#5a5550" style={{ font: '400 10px DM Sans' }}>
          total
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: '400 13px DM Sans', color: '#e8e4df' }}>{d.label}</div>
            </div>
            <span style={{ font: '500 12px DM Sans', color: d.color }}>{d.pct}%</span>
            <span style={{ font: '400 11px DM Sans', color: '#5a5550', width: 60, textAlign: 'right' }}>{fmt(d.value * 100)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function Reports() {
  const [range, setRange] = useState('30d');
  const [chartMode, setChartMode] = useState('total');
  const toast = useToast();

  const days = RANGES.find(r => r.id === range)?.days || 30;
  const data = DAILY_90.slice(-days);

  const totalRevenue = data.reduce((s, d) => s + d.total, 0);
  const onlineRevenue = data.reduce((s, d) => s + d.online, 0);
  const posRevenue = data.reduce((s, d) => s + d.pos, 0);
  const onlineOrders = Math.round(onlineRevenue / 6800);
  const posOrders = Math.round(posRevenue / 4200);
  const totalOrders = onlineOrders + posOrders;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const eventTickets = Math.round(days * 3.2);

  const exportCSV = (name) => {
    toast(`Exporting ${name} to CSV...`);
    setTimeout(() => toast(`${name}.csv downloaded`), 800);
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reports</h1>
          <p className="admin-page-subtitle">Business overview — updated in real time</p>
        </div>
        {/* Date range picker */}
        <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
          {RANGES.map(r => (
            <button key={r.id} onClick={() => setRange(r.id)} style={{
              padding: '10px 16px', font: '500 12px DM Sans',
              background: range === r.id ? 'rgba(212,175,55,0.1)' : 'transparent',
              color: range === r.id ? '#d4af37' : '#5a5550',
              border: 'none', borderRight: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>{r.label}</button>
          ))}
        </div>
      </div>

      {/* ── TOP STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }} className="reports-stats-6">
        <div className="admin-stat">
          <div className="admin-stat-label">Total Revenue</div>
          <div className="admin-stat-value gold" style={{ fontSize: 22 }}>{fmt(totalRevenue)}</div>
          <div className="admin-stat-sub"><span className="up">+12%</span> vs prev</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Online Orders</div>
          <div className="admin-stat-value" style={{ fontSize: 22 }}>{onlineOrders}</div>
          <div className="admin-stat-sub">{fmt(onlineRevenue)} revenue</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">POS Sales</div>
          <div className="admin-stat-value" style={{ fontSize: 22 }}>{posOrders}</div>
          <div className="admin-stat-sub">{fmt(posRevenue)} revenue</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Members</div>
          <div className="admin-stat-value" style={{ fontSize: 22 }}>{MEMBERSHIP_STATS.totalMembers}</div>
          <div className="admin-stat-sub"><span className="up">+{MEMBERSHIP_STATS.newThisMonth}</span> this month</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Event Tickets</div>
          <div className="admin-stat-value" style={{ fontSize: 22 }}>{eventTickets}</div>
          <div className="admin-stat-sub">sold this period</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Avg. Order</div>
          <div className="admin-stat-value gold" style={{ fontSize: 22 }}>{fmt(avgOrderValue)}</div>
          <div className="admin-stat-sub">per transaction</div>
        </div>
      </div>

      {/* ── REVENUE CHART ── */}
      <div className="admin-panel" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ font: '500 15px DM Sans', color: '#e8e4df' }}>Revenue</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
              {[['total', 'Combined'], ['online', 'Online'], ['pos', 'POS']].map(([key, label]) => (
                <button key={key} onClick={() => setChartMode(key)} style={{
                  padding: '6px 14px', font: '500 11px DM Sans',
                  background: chartMode === key ? 'rgba(212,175,55,0.1)' : 'transparent',
                  color: chartMode === key ? '#d4af37' : '#5a5550',
                  border: 'none', borderRight: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{label}</button>
              ))}
            </div>
            <button onClick={() => exportCSV('revenue')} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '6px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
          </div>
        </div>
        <LineChart
          data={data}
          dataKey={chartMode}
          color={chartMode === 'pos' ? '#a78bfa' : '#d4af37'}
          height={220}
        />
      </div>

      {/* ── TWO COLUMN: Top Products + Channel Breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="reports-grid-2">
        {/* Top Products */}
        <div className="admin-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ font: '500 15px DM Sans', color: '#e8e4df' }}>Top Products</h3>
            <button onClick={() => exportCSV('top-products')} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '6px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
          </div>
          <BarList items={TOP_PRODUCTS} maxVal={TOP_PRODUCTS[0].sold} />
        </div>

        {/* Sales by Channel */}
        <div className="admin-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ font: '500 15px DM Sans', color: '#e8e4df' }}>Sales by Channel</h3>
            <button onClick={() => exportCSV('channel-breakdown')} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '6px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
          </div>
          <DonutChart data={CHANNEL_DATA} />
        </div>
      </div>

      {/* ── TWO COLUMN: Inventory Health + Membership ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="reports-grid-2">
        {/* Inventory Health */}
        <div className="admin-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ font: '500 15px DM Sans', color: '#e8e4df' }}>Inventory Health</h3>
            <button onClick={() => exportCSV('inventory')} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '6px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6 }}>
              <div style={{ font: '500 10px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 6 }}>Total Value</div>
              <div style={{ font: '600 20px DM Sans', color: '#d4af37' }}>{fmt(INVENTORY_HEALTH.totalValue)}</div>
            </div>
            <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6 }}>
              <div style={{ font: '500 10px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 6 }}>Active SKUs</div>
              <div style={{ font: '600 20px DM Sans', color: '#e8e4df' }}>{INVENTORY_HEALTH.totalSKUs}</div>
            </div>
          </div>

          {/* Low stock */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ font: '500 11px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#f87171', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171' }} />
              Low Stock ({INVENTORY_HEALTH.lowStock.length})
            </div>
            {INVENTORY_HEALTH.lowStock.map(item => (
              <div key={item.sku} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ font: '400 12px DM Sans', color: '#e8e4df' }}>{item.name}</div>
                  <div style={{ font: '400 10px DM Sans', color: '#5a5550', fontFamily: 'monospace' }}>{item.sku}</div>
                </div>
                <span style={{ font: '600 12px DM Sans', color: item.total === 0 ? '#f87171' : '#facc15' }}>
                  {item.total === 0 ? 'OUT' : item.total}
                </span>
              </div>
            ))}
          </div>

          {/* Overstock */}
          <div>
            <div style={{ font: '500 11px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
              Overstock ({INVENTORY_HEALTH.overstock.length})
            </div>
            {INVENTORY_HEALTH.overstock.map(item => (
              <div key={item.sku} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ font: '400 12px DM Sans', color: '#e8e4df' }}>{item.name}</div>
                  <div style={{ font: '400 10px DM Sans', color: '#5a5550', fontFamily: 'monospace' }}>{item.sku}</div>
                </div>
                <span style={{ font: '600 12px DM Sans', color: '#60a5fa' }}>{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Stats */}
        <div className="admin-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ font: '500 15px DM Sans', color: '#e8e4df' }}>Membership</h3>
            <button onClick={() => exportCSV('membership')} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '6px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ font: '600 24px DM Sans', color: '#d4af37', marginBottom: 2 }}>{MEMBERSHIP_STATS.totalMembers}</div>
              <div style={{ font: '500 9px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550' }}>Total</div>
            </div>
            <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ font: '600 24px DM Sans', color: '#4ade80', marginBottom: 2 }}>+{MEMBERSHIP_STATS.newThisMonth}</div>
              <div style={{ font: '500 9px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550' }}>This Month</div>
            </div>
            <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ font: '600 24px DM Sans', color: '#e8e4df', marginBottom: 2 }}>{MEMBERSHIP_STATS.renewalRate}%</div>
              <div style={{ font: '500 9px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550' }}>Renewal</div>
            </div>
          </div>

          {/* Tier breakdown */}
          <div style={{ font: '500 11px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 12 }}>
            Members by Tier
          </div>

          {/* Stacked bar */}
          <div style={{ height: 28, display: 'flex', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
            {MEMBERSHIP_STATS.tiers.map(tier => (
              <div key={tier.name} style={{
                flex: tier.count,
                background: tier.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '600 9px DM Sans', color: '#04040c', letterSpacing: '0.5px',
                transition: 'flex 0.6s',
              }}>
                {tier.count > 40 && tier.name}
              </div>
            ))}
          </div>

          {MEMBERSHIP_STATS.tiers.map(tier => {
            const pct = Math.round((tier.count / MEMBERSHIP_STATS.totalMembers) * 100);
            return (
              <div key={tier.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: tier.color, flexShrink: 0 }} />
                <span style={{ font: '400 13px DM Sans', color: '#e8e4df', flex: 1 }}>{tier.name}</span>
                <span style={{ font: '500 13px DM Sans', color: tier.color }}>{tier.count}</span>
                <span style={{ font: '400 11px DM Sans', color: '#5a5550', width: 35, textAlign: 'right' }}>{pct}%</span>
              </div>
            );
          })}

          <div style={{ padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: 8 }}>
            <div style={{ font: '500 10px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 6 }}>Monthly Membership Revenue</div>
            <div style={{ font: '600 22px DM Sans', color: '#d4af37' }}>{fmt(MEMBERSHIP_STATS.monthlyRevenue)}</div>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 1024px) {
          .reports-stats-6 { grid-template-columns: repeat(3, 1fr) !important; }
          .reports-grid-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .reports-stats-6 { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
