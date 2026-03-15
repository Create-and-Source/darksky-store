import { useState, useEffect } from 'react';
import { useToast } from '../AdminLayout';
import HelpBubble from '../components/HelpBubble';
import {
  getOrders, getInventory, getMembers, getEvents,
  formatPrice, getStockStatus, subscribe,
} from '../data/store';

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const RANGES = [
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
];

const fmt = (cents) => {
  if (cents >= 100000) return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${(cents / 100).toFixed(2)}`;
};

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};

function downloadCSV(filename, headers, rows) {
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
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

/* ---- PLAIN ENGLISH SUMMARY CARD ---- */
function SummaryCard({ children }) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderLeft: '4px solid #D4AF37',
      borderRadius: 8,
      padding: '16px 20px',
      marginBottom: 16,
      font: `400 16px/1.6 ${FONT}`,
      color: '#475569',
    }}>
      {children}
    </div>
  );
}

/* ---- SVG BAR CHART (horizontal) ---- */
function BarList({ items, maxVal }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ font: `500 14px ${FONT}`, color: '#94A3B8', width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ font: `400 14px ${FONT}`, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
              <span style={{ font: `500 14px ${FONT}`, color: '#D4AF37', flexShrink: 0, marginLeft: 8 }}>{item.qty} sold</span>
            </div>
            <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(item.revenue / maxVal) * 100}%`,
                background: 'linear-gradient(90deg, #D4AF37, #a08520)',
                borderRadius: 2,
                transition: 'width 0.8s cubic-bezier(.16,1,.3,1)',
              }} />
            </div>
          </div>
          <span style={{ font: `400 14px ${FONT}`, color: '#64748B', flexShrink: 0, width: 65, textAlign: 'right' }}>{fmt(item.revenue)}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- DONUT CHART ---- */
function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ color: '#94A3B8', font: `400 14px ${FONT}` }}>No data</div>;
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
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#1E293B" style={{ font: `600 22px ${FONT}` }}>
          {fmt(total)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#94A3B8" style={{ font: `400 14px ${FONT}` }}>
          total
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {data.map(d => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ font: `400 14px ${FONT}`, color: '#1E293B' }}>{d.label}</div>
              </div>
              <span style={{ font: `500 14px ${FONT}`, color: d.color }}>{pct}%</span>
              <span style={{ font: `400 14px ${FONT}`, color: '#94A3B8', width: 60, textAlign: 'right' }}>{fmt(d.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- MAIN COMPONENT ---- */
export default function Reports() {
  const [, setTick] = useState(0);
  const [range, setRange] = useState('30d');
  const toast = useToast();

  useEffect(() => {
    const unsub = subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const allOrders = getOrders();
  const inventory = getInventory();
  const members = getMembers();
  const events = getEvents();

  const days = RANGES.find(r => r.id === range)?.days || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoff = cutoffDate.toISOString().slice(0, 10);

  // Previous period for comparison
  const prevCutoffDate = new Date();
  prevCutoffDate.setDate(prevCutoffDate.getDate() - days * 2);
  const prevCutoff = prevCutoffDate.toISOString().slice(0, 10);

  const filteredOrders = allOrders.filter(o => o.date >= cutoff);
  const prevPeriodOrders = allOrders.filter(o => o.date >= prevCutoff && o.date < cutoff);

  // Stats
  const totalRevenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0);
  const prevRevenue = prevPeriodOrders.reduce((s, o) => s + (o.total || 0), 0);
  const onlineOrders = filteredOrders.filter(o => o.channel === 'Online');
  const posOrders = filteredOrders.filter(o => o.channel === 'POS');
  const memberCount = members.length;
  const eventTickets = events.reduce((s, e) => s + (e.ticketsSold || 0), 0);
  const avgOrderValue = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;

  // Revenue change %
  const revenueChangePct = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : null;

  // Top products by revenue
  const productMap = {};
  filteredOrders.forEach(o => {
    (o.items || []).forEach(item => {
      const key = item.name || item.sku || 'Unknown';
      if (!productMap[key]) productMap[key] = { name: key, qty: 0, revenue: 0 };
      productMap[key].qty += (item.qty || 1);
      productMap[key].revenue += (item.price || 0) * (item.qty || 1);
    });
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const maxRevenue = topProducts.length > 0 ? topProducts[0].revenue : 1;

  // Channel breakdown
  const channelMap = {};
  filteredOrders.forEach(o => {
    const ch = o.channel || 'Other';
    if (!channelMap[ch]) channelMap[ch] = 0;
    channelMap[ch] += (o.total || 0);
  });
  const channelColors = { 'Online': '#D4AF37', 'POS': '#a78bfa', 'Events': '#60a5fa', 'Other': '#10B981' };
  const channelData = Object.entries(channelMap).map(([label, value]) => ({
    label, value, color: channelColors[label] || '#64748B',
  }));

  // Inventory health
  const lowStockItems = inventory.filter(p => {
    const status = getStockStatus(p);
    return status === 'low' || status === 'out';
  });
  const overstockItems = inventory.filter(p => {
    const total = (p.warehouse || 0) + (p.giftshop || 0);
    return total > (p.reorderPoint || 5) * 3;
  });

  // Find the lowest stock item
  const lowestItem = lowStockItems.length > 0
    ? lowStockItems.reduce((min, item) => {
        const total = (item.warehouse || 0) + (item.giftshop || 0);
        const minTotal = (min.warehouse || 0) + (min.giftshop || 0);
        return total < minTotal ? item : min;
      })
    : null;

  // Membership tier breakdown
  const tierMap = {};
  members.forEach(m => {
    const tier = m.tier || 'Unknown';
    if (!tierMap[tier]) tierMap[tier] = 0;
    tierMap[tier]++;
  });
  const tierColors = { 'Explorer': '#D4AF37', 'Stargazer': '#64748B', 'Guardian': '#e0c060' };
  const tiers = Object.entries(tierMap).map(([name, count]) => ({
    name, count, color: tierColors[name] || '#94A3B8',
  }));
  const topTier = tiers.length > 0 ? tiers.reduce((a, b) => b.count > a.count ? b : a) : null;

  // New members this month
  const thisMonth = new Date().toISOString().slice(0, 7);
  const newMembersThisMonth = members.filter(m => m.joinDate && m.joinDate.startsWith(thisMonth)).length;

  // Revenue summary text
  const rangeLabel = range === '7d' ? 'last week' : range === '30d' ? 'last month' : 'last 90 days';
  let revenueSummaryText = `You made ${fmt(totalRevenue)} ${rangeLabel} from ${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}.`;
  if (revenueChangePct !== null) {
    const direction = revenueChangePct >= 0 ? 'more' : 'less';
    revenueSummaryText += ` That's ${Math.abs(revenueChangePct)}% ${direction} than the previous period.`;
    if (revenueChangePct >= 10) {
      revenueSummaryText += ' Nice work!';
    } else if (revenueChangePct >= 0) {
      revenueSummaryText += ' Keep it up!';
    } else {
      revenueSummaryText += ' Keep it up!';
    }
  }

  // Top products summary text
  let topProductSummaryText = '';
  if (topProducts.length >= 2) {
    topProductSummaryText = `Your ${topProducts[0].name} is the bestseller — ${topProducts[0].qty} sold this period. ${topProducts[1].name} is picking up too.`;
  } else if (topProducts.length === 1) {
    topProductSummaryText = `Your ${topProducts[0].name} is the bestseller — ${topProducts[0].qty} sold this period.`;
  } else {
    topProductSummaryText = 'No product sales in this period yet.';
  }

  // Membership summary text
  let membershipSummaryText = `You have ${memberCount} member${memberCount !== 1 ? 's' : ''} right now.`;
  if (newMembersThisMonth > 0) {
    membershipSummaryText += ` ${newMembersThisMonth} joined this month.`;
  }
  if (topTier) {
    membershipSummaryText += ` ${topTier.name} is the most popular tier.`;
  }

  // Inventory summary text
  let inventorySummaryText = '';
  if (lowStockItems.length > 0 && lowestItem) {
    const lowestTotal = (lowestItem.warehouse || 0) + (lowestItem.giftshop || 0);
    inventorySummaryText = `Heads up — ${lowStockItems.length} item${lowStockItems.length !== 1 ? 's are' : ' is'} running low. ${lowestItem.name} only has ${lowestTotal} left at the gift shop.`;
  } else {
    inventorySummaryText = 'All items are well stocked right now. No action needed.';
  }

  // CSV exports
  const exportRevenue = () => {
    const headers = ['Date', 'Order ID', 'Customer', 'Channel', 'Total'];
    const rows = filteredOrders.map(o => [o.date, o.id, o.customer || '', o.channel || '', (o.total / 100).toFixed(2)]);
    downloadCSV(`darksky-revenue-${range}.csv`, headers, rows);
    toast('Revenue CSV downloaded');
  };

  const exportTopProducts = () => {
    const headers = ['Product', 'Quantity Sold', 'Revenue'];
    const rows = topProducts.map(p => [p.name, p.qty, (p.revenue / 100).toFixed(2)]);
    downloadCSV(`darksky-top-products-${range}.csv`, headers, rows);
    toast('Top products CSV downloaded');
  };

  const exportInventory = () => {
    const headers = ['Product', 'SKU', 'Warehouse', 'Gift Shop', 'Total', 'Status'];
    const rows = inventory.map(p => [p.name + (p.variant ? ` - ${p.variant}` : ''), p.sku, p.warehouse || 0, p.giftshop || 0, (p.warehouse || 0) + (p.giftshop || 0), getStockStatus(p)]);
    downloadCSV('darksky-inventory-health.csv', headers, rows);
    toast('Inventory CSV downloaded');
  };

  const exportMembership = () => {
    const headers = ['Name', 'Email', 'Tier', 'Join Date', 'Status'];
    const rows = members.map(m => [m.name, m.email, m.tier, m.joinDate, m.status]);
    downloadCSV('darksky-members.csv', headers, rows);
    toast('Membership CSV downloaded');
  };

  const csvBtn = (onClick) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button onClick={onClick} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '6px 12px' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        CSV
      </button>
      <HelpBubble text="Downloads a spreadsheet file you can open in Excel or import into QuickBooks." />
    </div>
  );

  const panelStyle = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ color: '#1E293B' }}>Reports</h1>
          <p className="admin-page-subtitle" style={{ color: '#64748B' }}>Business overview — calculated from real data</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 0, border: '1px solid #E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
            {RANGES.map(r => (
              <button key={r.id} onClick={() => setRange(r.id)} style={{
                padding: '10px 16px', font: `500 14px ${FONT}`,
                background: range === r.id ? 'rgba(212,175,55,0.1)' : '#FFFFFF',
                color: range === r.id ? '#D4AF37' : '#64748B',
                border: 'none', borderRight: '1px solid #E2E8F0',
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>{r.label}</button>
            ))}
          </div>
          <HelpBubble text="Change the time period to see different data. This affects all charts below." />
        </div>
      </div>

      {/* Revenue Summary */}
      <SummaryCard>
        {revenueChangePct !== null && revenueChangePct >= 0 ? '+ ' : ''}
        {revenueSummaryText}
      </SummaryCard>

      {/* TOP STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }} className="reports-stats-6">
        <div style={panelStyle}>
          <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>Total Revenue</div>
          <div style={{ font: `600 22px ${FONT}`, color: '#D4AF37' }}>{fmt(totalRevenue)}</div>
          <div style={{ font: `400 14px ${FONT}`, color: '#94A3B8', marginTop: 4 }}>{filteredOrders.length} orders</div>
        </div>
        <div style={panelStyle}>
          <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>Online Orders</div>
          <div style={{ font: `600 22px ${FONT}`, color: '#1E293B' }}>{onlineOrders.length}</div>
          <div style={{ font: `400 14px ${FONT}`, color: '#94A3B8', marginTop: 4 }}>{fmt(onlineOrders.reduce((s, o) => s + (o.total || 0), 0))} revenue</div>
        </div>
        <div style={panelStyle}>
          <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>POS Sales</div>
          <div style={{ font: `600 22px ${FONT}`, color: '#1E293B' }}>{posOrders.length}</div>
          <div style={{ font: `400 14px ${FONT}`, color: '#94A3B8', marginTop: 4 }}>{fmt(posOrders.reduce((s, o) => s + (o.total || 0), 0))} revenue</div>
        </div>
        <div style={panelStyle}>
          <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>Members</div>
          <div style={{ font: `600 22px ${FONT}`, color: '#1E293B' }}>{memberCount}</div>
          <div style={{ font: `400 14px ${FONT}`, color: '#94A3B8', marginTop: 4 }}>{tiers.length} tier{tiers.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={panelStyle}>
          <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>Event Tickets</div>
          <div style={{ font: `600 22px ${FONT}`, color: '#1E293B' }}>{eventTickets}</div>
          <div style={{ font: `400 14px ${FONT}`, color: '#94A3B8', marginTop: 4 }}>sold total</div>
        </div>
        <div style={panelStyle}>
          <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>Avg. Order</div>
          <div style={{ font: `600 22px ${FONT}`, color: '#D4AF37' }}>{fmt(avgOrderValue)}</div>
          <div style={{ font: `400 14px ${FONT}`, color: '#94A3B8', marginTop: 4 }}>per transaction</div>
        </div>
      </div>

      {/* TWO COLUMN: Top Products + Channel Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="reports-grid-2">
        {/* Top Products */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ font: `500 15px ${FONT}`, color: '#1E293B', margin: 0 }}>Top Products</h3>
              <HelpBubble text="Your best-selling products ranked by revenue. This shows what customers are buying most." />
            </div>
            {csvBtn(exportTopProducts)}
          </div>
          <SummaryCard>
            {topProductSummaryText}
          </SummaryCard>
          {topProducts.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', font: `400 14px ${FONT}` }}>No product sales in this period</div>
          ) : (
            <BarList items={topProducts} maxVal={maxRevenue} />
          )}
        </div>

        {/* Sales by Channel */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ font: `500 15px ${FONT}`, color: '#1E293B', margin: 0 }}>Sales by Channel</h3>
              <HelpBubble text="Shows how revenue breaks down between your online store and in-person POS sales at the gift shop." />
            </div>
            {csvBtn(exportRevenue)}
          </div>
          {channelData.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', font: `400 14px ${FONT}` }}>No sales in this period</div>
          ) : (
            <DonutChart data={channelData} />
          )}
        </div>
      </div>

      {/* TWO COLUMN: Inventory Health + Membership */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="reports-grid-2">
        {/* Inventory Health */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ font: `500 15px ${FONT}`, color: '#1E293B', margin: 0 }}>Inventory Health</h3>
              <HelpBubble text="A snapshot of your inventory across both the warehouse and the gift shop. Low stock items need restocking soon." />
            </div>
            {csvBtn(exportInventory)}
          </div>
          <SummaryCard>
            {inventorySummaryText}
          </SummaryCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 14, background: '#FAFAF8', border: '1px solid #E2E8F0', borderRadius: 6 }}>
              <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>Active SKUs</div>
              <div style={{ font: `600 20px ${FONT}`, color: '#1E293B' }}>{inventory.length}</div>
            </div>
            <div style={{ padding: 14, background: '#FAFAF8', border: '1px solid #E2E8F0', borderRadius: 6 }}>
              <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>Total Value</div>
              <div style={{ font: `600 20px ${FONT}`, color: '#D4AF37' }}>
                {fmt(inventory.reduce((s, p) => s + ((p.warehouse || 0) + (p.giftshop || 0)) * (p.price || 0), 0))}
              </div>
            </div>
          </div>

          {/* Low stock */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#EF4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
              Low Stock ({lowStockItems.length})
            </div>
            {lowStockItems.length === 0 ? (
              <div style={{ font: `400 14px ${FONT}`, color: '#94A3B8', padding: '8px 0' }}>All items well stocked</div>
            ) : lowStockItems.slice(0, 5).map(item => {
              const total = (item.warehouse || 0) + (item.giftshop || 0);
              return (
                <div key={item.id || item.sku} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ font: `400 14px ${FONT}`, color: '#1E293B' }}>{item.name}{item.variant ? ` - ${item.variant}` : ''}</div>
                    <div style={{ font: `400 13px monospace`, color: '#94A3B8' }}>{item.sku}</div>
                  </div>
                  <span style={{ font: `600 14px ${FONT}`, color: total === 0 ? '#EF4444' : '#EAB308' }}>
                    {total === 0 ? 'OUT' : total}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Overstock */}
          {overstockItems.length > 0 && (
            <div>
              <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
                Overstock ({overstockItems.length})
              </div>
              {overstockItems.slice(0, 3).map(item => {
                const total = (item.warehouse || 0) + (item.giftshop || 0);
                return (
                  <div key={item.id || item.sku} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ font: `400 14px ${FONT}`, color: '#1E293B' }}>{item.name}{item.variant ? ` - ${item.variant}` : ''}</div>
                      <div style={{ font: `400 13px monospace`, color: '#94A3B8' }}>{item.sku}</div>
                    </div>
                    <span style={{ font: `600 14px ${FONT}`, color: '#60a5fa' }}>{total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Membership Stats */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ font: `500 15px ${FONT}`, color: '#1E293B', margin: 0 }}>Membership</h3>
              <HelpBubble text="Your community membership breakdown by tier. Members get special perks and discounts." />
            </div>
            {csvBtn(exportMembership)}
          </div>
          <SummaryCard>
            {membershipSummaryText}
          </SummaryCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: 14, background: '#FAFAF8', border: '1px solid #E2E8F0', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ font: `600 24px ${FONT}`, color: '#D4AF37', marginBottom: 2 }}>{memberCount}</div>
              <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8' }}>Total Members</div>
            </div>
            <div style={{ padding: 14, background: '#FAFAF8', border: '1px solid #E2E8F0', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ font: `600 24px ${FONT}`, color: '#1E293B', marginBottom: 2 }}>{tiers.length}</div>
              <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8' }}>Tiers</div>
            </div>
          </div>

          {/* Tier breakdown */}
          <div style={{ font: `500 13px ${FONT}`, letterSpacing: '1px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 12 }}>
            Members by Tier
          </div>

          {memberCount > 0 && (
            <div style={{ height: 28, display: 'flex', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
              {tiers.map(tier => (
                <div key={tier.name} style={{
                  flex: tier.count,
                  background: tier.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font: `600 14px ${FONT}`, color: '#FFFFFF', letterSpacing: '0.5px',
                  transition: 'flex 0.6s',
                }}>
                  {tier.count > 20 && tier.name}
                </div>
              ))}
            </div>
          )}

          {tiers.map(tier => {
            const pct = memberCount > 0 ? Math.round((tier.count / memberCount) * 100) : 0;
            return (
              <div key={tier.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: tier.color, flexShrink: 0 }} />
                <span style={{ font: `400 14px ${FONT}`, color: '#1E293B', flex: 1 }}>{tier.name}</span>
                <span style={{ font: `500 14px ${FONT}`, color: tier.color }}>{tier.count}</span>
                <span style={{ font: `400 14px ${FONT}`, color: '#94A3B8', width: 35, textAlign: 'right' }}>{pct}%</span>
              </div>
            );
          })}

          {tiers.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: '#94A3B8', font: `400 14px ${FONT}` }}>No members yet</div>
          )}
        </div>
      </div>

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
