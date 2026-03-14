import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HelpBubble from '../components/HelpBubble';
import { useToast } from '../AdminLayout';
import {
  getOrders, getInventory, getMembers, getEvents,
  getStockStatus, formatPrice, subscribe,
  getPurchaseOrders, getTransfers,
} from '../data/store';

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTodayDate() {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const then = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
}

// Icons as inline SVGs
const IconOrders = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
  </svg>
);

const IconShipment = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
    <polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
  </svg>
);

const IconStock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="1.5">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconEvent = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconReceive = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
    <polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
  </svg>
);

const IconMail = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconChart = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
);

const IconOrderSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
  </svg>
);

const IconTransferSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
    <polyline points="17,1 21,5 17,9"/>
    <path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7,23 3,19 7,15"/>
    <path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>
);

export default function Dashboard() {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const addToast = useToast();

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  const orders = getOrders();
  const inventory = getInventory();
  const members = getMembers();
  const events = getEvents();
  const purchaseOrders = getPurchaseOrders();
  const transfers = getTransfers();

  const today = new Date().toISOString().slice(0, 10);

  // Attention data
  const processingOrders = orders.filter(o => o.status === 'Processing');
  const shippedPOs = purchaseOrders.filter(po => po.status === 'Shipped');
  const lowStockItems = inventory.filter(i => {
    const s = getStockStatus(i);
    return s === 'low' || s === 'out';
  });

  // Events in next 30 days
  const thirtyDaysOut = new Date();
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);
  const thirtyDayStr = thirtyDaysOut.toISOString().slice(0, 10);
  const upcomingEvents = events.filter(e => e.date >= today && e.date <= thirtyDayStr && e.status === 'Published');
  const lowTicketEvents = upcomingEvents.filter(e => e.capacity && e.ticketsSold < e.capacity * 0.5);

  // Today's snapshot
  const todayOrders = orders.filter(o => o.date === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);
  const eventsThisWeek = events.filter(e => e.date >= weekStartStr && e.date <= weekEndStr);

  // Recent activity feed
  const activityItems = [];
  orders.slice(0, 12).forEach(o => {
    activityItems.push({
      type: 'order',
      date: o.date,
      text: `${o.channel === 'POS' ? 'POS' : 'Online'} order ${o.id} placed — ${formatPrice(o.total)}`,
      icon: 'order',
    });
  });
  transfers.slice(0, 6).forEach(t => {
    const verb = t.status === 'Received' ? 'received at' : t.status === 'In Transit' ? 'shipped to' : 'created for';
    activityItems.push({
      type: 'transfer',
      date: t.receivedDate || t.shippedDate || t.createdDate,
      text: `Transfer ${t.id} ${verb} ${t.to}`,
      icon: 'transfer',
    });
  });
  activityItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const recentActivity = activityItems.slice(0, 8);

  // Attention cards
  const attentionCards = [];
  if (processingOrders.length > 0) {
    attentionCards.push({
      color: '#3B82F6',
      icon: <IconOrders />,
      title: `${processingOrders.length} order${processingOrders.length !== 1 ? 's' : ''} need${processingOrders.length === 1 ? 's' : ''} to be checked`,
      description: `${processingOrders.map(o => o.id).join(', ')} — placed and waiting for review`,
      button: 'Review Orders',
      to: '/admin/orders',
    });
  }
  if (shippedPOs.length > 0) {
    shippedPOs.forEach(po => {
      attentionCards.push({
        color: '#10B981',
        icon: <IconShipment />,
        title: `Shipment arriving — ${po.id} from ${po.vendor}`,
        description: po.expectedDate ? `Expected ${po.expectedDate}` : 'In transit now',
        button: 'Receive Shipment',
        to: '/admin/receive',
      });
    });
  }
  if (lowStockItems.length > 0) {
    attentionCards.push({
      color: '#EAB308',
      icon: <IconStock />,
      title: `${lowStockItems.length} product${lowStockItems.length !== 1 ? 's are' : ' is'} running low`,
      description: lowStockItems.slice(0, 3).map(i => i.name).join(', ') + (lowStockItems.length > 3 ? ` and ${lowStockItems.length - 3} more` : ''),
      button: 'Restock',
      to: '/admin/inventory',
    });
  }
  if (lowTicketEvents.length > 0) {
    lowTicketEvents.forEach(e => {
      const dayName = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
      attentionCards.push({
        color: '#8B5CF6',
        icon: <IconEvent />,
        title: `${e.title} ${dayName} — ${e.ticketsSold} of ${e.capacity} tickets sold`,
        description: `${e.capacity - e.ticketsSold} spots still open`,
        button: 'View Event',
        to: '/admin/events',
      });
    });
  }
  if (upcomingEvents.length === 0) {
    attentionCards.push({
      color: '#8B5CF6',
      icon: <IconEvent />,
      title: 'No upcoming events',
      description: 'Schedule something for your community',
      button: 'Create an Event',
      to: '/admin/events',
    });
  }

  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  return (
    <>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ font: `600 28px/1.3 ${FONT}`, color: '#1E293B', margin: '0 0 4px' }}>
          {getGreeting()}, Tovah
        </h1>
        <p style={{ font: `400 16px ${FONT}`, color: '#64748B', margin: 0 }}>
          {formatTodayDate()}
        </p>
      </div>

      {/* What Needs Your Attention */}
      {attentionCards.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ font: `600 18px ${FONT}`, color: '#1E293B', margin: 0 }}>
              What Needs Your Attention
            </h2>
            <HelpBubble text="These are tasks that might need action soon. They update automatically based on your orders, inventory, and events." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {attentionCards.map((card, i) => (
              <div key={i} style={{
                ...cardStyle,
                borderLeft: `4px solid ${card.color}`,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}>
                <div style={{ flexShrink: 0 }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ font: `600 15px ${FONT}`, color: '#1E293B', marginBottom: 2 }}>
                    {card.title}
                  </div>
                  <div style={{ font: `400 14px ${FONT}`, color: '#64748B' }}>
                    {card.description}
                  </div>
                </div>
                <button
                  onClick={() => navigate(card.to)}
                  style={{
                    height: 48,
                    padding: '0 24px',
                    background: '#1E293B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    font: `600 14px ${FONT}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.target.style.background = '#334155'; }}
                  onMouseLeave={e => { e.target.style.background = '#1E293B'; }}
                >
                  {card.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ font: `600 18px ${FONT}`, color: '#1E293B', margin: 0 }}>
            Quick Actions
          </h2>
          <HelpBubble text="Shortcuts to common tasks. Click any button to jump straight to that page." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="dashboard-quick-actions">
          {[
            { icon: <IconReceive />, label: 'Receive a Shipment', to: '/admin/receive' },
            { icon: <IconCalendar />, label: 'Create an Event', to: '/admin/events' },
            { icon: <IconMail />, label: 'Send an Email', to: '/admin/emails' },
            { icon: <IconChart />, label: 'View Reports', to: '/admin/reports' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.to)}
              style={{
                ...cardStyle,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: 'pointer',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s',
                padding: 16,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#D4AF37';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(212,175,55,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              }}
            >
              {action.icon}
              <span style={{ font: `500 14px ${FONT}`, color: '#1E293B', textAlign: 'center' }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Snapshot */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ font: `600 18px ${FONT}`, color: '#1E293B', margin: 0 }}>
            Today's Snapshot
          </h2>
          <HelpBubble text="A quick look at where things stand right now. Orders and revenue update in real time." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="dashboard-snapshot">
          <div style={cardStyle}>
            <div style={{ font: `500 13px ${FONT}`, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Orders Today
            </div>
            <div style={{ font: `700 28px ${FONT}`, color: '#1E293B', marginBottom: 4 }}>
              {todayOrders.length}
            </div>
            <div style={{ font: `400 14px ${FONT}`, color: '#D4AF37' }}>
              {formatPrice(todayRevenue)} revenue
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ font: `500 13px ${FONT}`, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Total Members
            </div>
            <div style={{ font: `700 28px ${FONT}`, color: '#1E293B', marginBottom: 4 }}>
              {members.length}
            </div>
            <div style={{ font: `400 14px ${FONT}`, color: '#64748B' }}>
              active members
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ font: `500 13px ${FONT}`, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Events This Week
            </div>
            <div style={{ font: `700 28px ${FONT}`, color: '#1E293B', marginBottom: 4 }}>
              {eventsThisWeek.length}
            </div>
            <div style={{ font: `400 14px ${FONT}`, color: '#64748B' }}>
              scheduled
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ font: `500 13px ${FONT}`, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Low Stock Items
            </div>
            <div style={{ font: `700 28px ${FONT}`, color: lowStockItems.length > 0 ? '#EAB308' : '#1E293B', marginBottom: 4 }}>
              {lowStockItems.length}
            </div>
            <div style={{ font: `400 14px ${FONT}`, color: '#64748B' }}>
              {lowStockItems.filter(i => getStockStatus(i) === 'out').length} out of stock
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ font: `600 18px ${FONT}`, color: '#1E293B', margin: 0 }}>
            Recent Activity
          </h2>
          <HelpBubble text="The latest orders and transfers across your store. This updates automatically as new activity comes in." />
        </div>
        <div style={cardStyle}>
          {recentActivity.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', font: `400 14px ${FONT}` }}>
              No recent activity
            </div>
          ) : (
            recentActivity.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 0',
                borderBottom: i < recentActivity.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: item.icon === 'order' ? 'rgba(59,130,246,0.08)' : 'rgba(16,185,129,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon === 'order' ? <IconOrderSmall /> : <IconTransferSmall />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: `400 14px ${FONT}`, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.text}
                  </div>
                </div>
                <div style={{ font: `400 14px ${FONT}`, color: '#94A3B8', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {relativeTime(item.date)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-quick-actions { grid-template-columns: repeat(2, 1fr) !important; }
          .dashboard-snapshot { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          .dashboard-quick-actions { grid-template-columns: 1fr !important; }
          .dashboard-snapshot { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
