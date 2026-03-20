import { useState, useEffect, useRef, useCallback } from 'react';
import {
  subscribe, getInventory, getPurchaseOrders, getOrders, getEvents,
  getFieldTrips, getMembers, getDonations, getVolunteers, getTimesheets, getMessages, getTasks,
} from '../admin/data/store';

// Generate notifications based on role
function generateNotifications(role) {
  const notifs = [];
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const userName = localStorage.getItem('ds_user_name') || 'Team';

  // ── EXECUTIVE DIRECTOR: sees everything important ──
  if (!role || role === 'executive_director' || role === 'admin') {
    const orders = getOrders();
    const processing = orders.filter(o => o.status === 'Processing');
    if (processing.length > 0) notifs.push({ id: 'ord-proc', type: 'info', title: 'Orders to Process', message: `${processing.length} order${processing.length > 1 ? 's' : ''} awaiting fulfillment`, time: now - 600000 });

    const donations = getDonations();
    const recentDonations = donations.filter(d => d.date >= today);
    if (recentDonations.length > 0) notifs.push({ id: 'don-today', type: 'success', title: 'Donations Today', message: `${recentDonations.length} donation${recentDonations.length > 1 ? 's' : ''} received today`, time: now - 1200000 });

    const members = getMembers();
    notifs.push({ id: 'members', type: 'info', title: 'Active Members', message: `${members.length} members across all tiers`, time: now - 3600000 });

    const messages = getMessages();
    const unread = messages.filter(m => !m.read && m.to.name === userName);
    if (unread.length > 0) notifs.push({ id: 'msg-unread', type: 'warning', title: 'Unread Messages', message: `${unread.length} message${unread.length > 1 ? 's' : ''} waiting for you`, time: now - 300000 });
  }

  // ── TREASURER: financial notifications ──
  if (role === 'treasurer') {
    const orders = getOrders();
    const revenue30d = orders.filter(o => { const d = new Date(o.date); return (now - d) < 30 * 86400000; }).reduce((s, o) => s + (o.total || 0), 0);
    notifs.push({ id: 'rev-30', type: 'info', title: 'Revenue (30 days)', message: `$${(revenue30d / 100).toLocaleString()} in sales`, time: now - 1800000 });

    const donations = getDonations();
    if (donations.length > 0) notifs.push({ id: 'don-latest', type: 'success', title: 'Latest Donation', message: `$${donations[0].amount.toLocaleString()} from ${donations[0].donor}`, time: now - 900000 });

    const messages = getMessages();
    const unread = messages.filter(m => !m.read && m.to.name === userName);
    if (unread.length > 0) notifs.push({ id: 'msg-unread', type: 'warning', title: 'Unread Messages', message: `${unread.length} new message${unread.length > 1 ? 's' : ''}`, time: now - 300000 });
  }

  // ── SHOP MANAGER / SHOP STAFF: inventory & orders ──
  if (role === 'shop_manager' || role === 'shop_staff') {
    const inventory = getInventory();
    const lowStock = inventory.filter(i => { const qty = (i.giftshop ?? i.quantity ?? 0); return qty > 0 && qty <= (i.reorderPoint || 5); });
    const outOfStock = inventory.filter(i => (i.giftshop ?? i.quantity ?? 0) === 0);
    if (lowStock.length > 0) notifs.push({ id: 'low-stock', type: 'warning', title: 'Low Stock Alert', message: `${lowStock.length} product${lowStock.length > 1 ? 's' : ''} running low in gift shop`, time: now - 600000 });
    if (outOfStock.length > 0) notifs.push({ id: 'out-stock', type: 'error', title: 'Out of Stock', message: `${outOfStock.length} product${outOfStock.length > 1 ? 's' : ''} out of stock`, time: now - 300000 });

    const pos = getPurchaseOrders();
    const shipped = pos.filter(p => p.status === 'Shipped');
    if (shipped.length > 0) notifs.push({ id: 'po-ship', type: 'info', title: 'Shipments En Route', message: `${shipped.length} PO${shipped.length > 1 ? 's' : ''} shipped — check receiving`, time: now - 1800000 });

    const orders = getOrders();
    const todayOrders = orders.filter(o => o.date === today);
    if (todayOrders.length > 0) notifs.push({ id: 'ord-today', type: 'info', title: "Today's Orders", message: `${todayOrders.length} order${todayOrders.length > 1 ? 's' : ''} today`, time: now - 900000 });

    const messages = getMessages();
    const unread = messages.filter(m => !m.read && m.to.name === userName);
    if (unread.length > 0) notifs.push({ id: 'msg-unread', type: 'warning', title: 'Unread Messages', message: `${unread.length} new message${unread.length > 1 ? 's' : ''}`, time: now - 200000 });
  }

  // ── EDUCATION DIRECTOR: field trips & events ──
  if (role === 'education_director') {
    const trips = getFieldTrips();
    const newTrips = trips.filter(t => t.status === 'New');
    if (newTrips.length > 0) notifs.push({ id: 'ft-new', type: 'warning', title: 'New Trip Requests', message: `${newTrips.length} school${newTrips.length > 1 ? 's' : ''} waiting for response`, time: now - 300000 });

    const confirmed = trips.filter(t => t.status === 'Confirmed');
    if (confirmed.length > 0) notifs.push({ id: 'ft-conf', type: 'success', title: 'Confirmed Trips', message: `${confirmed.length} trip${confirmed.length > 1 ? 's' : ''} confirmed and scheduled`, time: now - 1800000 });

    const events = getEvents();
    const upcoming = events.filter(e => e.date >= today && e.status === 'Published');
    if (upcoming.length > 0) notifs.push({ id: 'evt-up', type: 'info', title: 'Upcoming Events', message: `${upcoming.length} event${upcoming.length > 1 ? 's' : ''} scheduled`, time: now - 3600000 });

    const messages = getMessages();
    const unread = messages.filter(m => !m.read && m.to.name === userName);
    if (unread.length > 0) notifs.push({ id: 'msg-unread', type: 'warning', title: 'Unread Messages', message: `${unread.length} new message${unread.length > 1 ? 's' : ''}`, time: now - 200000 });
  }

  // ── VISITOR SERVICES: today's activity ──
  if (role === 'visitor_services') {
    const events = getEvents();
    const todayEvents = events.filter(e => e.date === today && e.status === 'Published');
    notifs.push({ id: 'evt-today', type: 'info', title: "Today's Events", message: todayEvents.length > 0 ? `${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} today` : 'No events scheduled today', time: now - 600000 });
  }

  // ── VOLUNTEER COORDINATOR: volunteer activity ──
  if (role === 'volunteer_coordinator') {
    const volunteers = getVolunteers();
    const active = volunteers.filter(v => v.status === 'Active');
    notifs.push({ id: 'vol-active', type: 'info', title: 'Active Volunteers', message: `${active.length} volunteer${active.length > 1 ? 's' : ''} on the roster`, time: now - 1800000 });

    const onLeave = volunteers.filter(v => v.status === 'On Leave');
    if (onLeave.length > 0) notifs.push({ id: 'vol-leave', type: 'warning', title: 'On Leave', message: `${onLeave.length} volunteer${onLeave.length > 1 ? 's' : ''} currently on leave`, time: now - 3600000 });

    const messages = getMessages();
    const unread = messages.filter(m => !m.read && m.to.name === userName);
    if (unread.length > 0) notifs.push({ id: 'msg-unread', type: 'warning', title: 'Unread Messages', message: `${unread.length} new message${unread.length > 1 ? 's' : ''}`, time: now - 200000 });
  }

  // ── SOCIAL MEDIA: posts & accounts ──
  if (role === 'social_media') {
    notifs.push({ id: 'social-tip', type: 'info', title: 'Content Tip', message: 'Clear skies tonight — great time for a stargazing post!', time: now - 1200000 });

    const messages = getMessages();
    const unread = messages.filter(m => !m.read && m.to.name === userName);
    if (unread.length > 0) notifs.push({ id: 'msg-unread', type: 'warning', title: 'Unread Messages', message: `${unread.length} new message${unread.length > 1 ? 's' : ''}`, time: now - 200000 });
  }

  // ── PAYROLL: timesheets ──
  if (role === 'payroll') {
    const timesheets = getTimesheets();
    const pending = timesheets.filter(t => t.status === 'Pending');
    if (pending.length > 0) notifs.push({ id: 'ts-pending', type: 'warning', title: 'Pending Timesheets', message: `${pending.length} timesheet${pending.length > 1 ? 's' : ''} awaiting approval`, time: now - 600000 });

    const messages = getMessages();
    const unread = messages.filter(m => !m.read && m.to.name === userName);
    if (unread.length > 0) notifs.push({ id: 'msg-unread', type: 'warning', title: 'Unread Messages', message: `${unread.length} new message${unread.length > 1 ? 's' : ''}`, time: now - 200000 });
  }

  // ── BOARD: high-level only ──
  if (role === 'board') {
    const members = getMembers();
    notifs.push({ id: 'bd-members', type: 'info', title: 'Membership', message: `${members.length} active members`, time: now - 3600000 });

    const events = getEvents();
    const upcoming = events.filter(e => e.date >= today && e.status === 'Published');
    if (upcoming.length > 0) notifs.push({ id: 'bd-events', type: 'info', title: 'Upcoming Events', message: `${upcoming.length} events scheduled`, time: now - 7200000 });
  }

  // ── TASK NOTIFICATIONS (for roles with task access) ──
  const taskRoles = ['executive_director', 'admin', 'treasurer', 'shop_manager', 'education_director', 'volunteer_coordinator'];
  if (taskRoles.includes(role)) {
    const allTasks = getTasks();
    const todayDate = new Date().toISOString().slice(0, 10);
    // For exec/admin show all, for others only their assigned tasks
    const isExec = !role || role === 'executive_director' || role === 'admin';
    const myTasks = isExec ? allTasks : allTasks.filter(t => t.assignedTo === userName);

    const overdue = myTasks.filter(t => t.dueDate && t.dueDate < todayDate && t.status !== 'completed' && t.status !== 'cancelled');
    if (overdue.length > 0) notifs.push({ id: 'tsk-overdue', type: 'error', title: 'Overdue Tasks', message: `${overdue.length} task${overdue.length > 1 ? 's' : ''} past due`, time: now - 180000 });

    const dueToday = myTasks.filter(t => t.dueDate === todayDate && t.status !== 'completed' && t.status !== 'cancelled');
    if (dueToday.length > 0) notifs.push({ id: 'tsk-today', type: 'warning', title: 'Tasks Due Today', message: `${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today`, time: now - 240000 });
  }

  // Sort newest first, merge read state
  notifs.sort((a, b) => b.time - a.time);
  const readState = JSON.parse(localStorage.getItem('ds_notif_read') || '{}');
  notifs.forEach(n => { if (readState[n.id]) n.read = true; });
  return notifs.slice(0, 10);
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const S = {
  wrap: { position: 'relative' },
  btn: {
    background: 'none', border: 'none', color: '#94A3B8',
    cursor: 'pointer', padding: 8, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute', top: 4, right: 4,
    width: 8, height: 8, borderRadius: '50%',
    background: '#EF4444', border: '2px solid #FFFFFF',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    width: 340, maxHeight: 420, overflowY: 'auto',
    background: '#FFFFFF', border: '1px solid #E2E8F0',
    borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    zIndex: 1000,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', borderBottom: '1px solid #E2E8F0',
  },
  headerTitle: {
    font: "600 15px -apple-system, sans-serif", color: '#1E293B', margin: 0,
  },
  markAll: {
    font: "500 12px -apple-system, sans-serif", color: '#D4AF37',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  },
  item: (read) => ({
    display: 'flex', gap: 10, padding: '12px 16px',
    background: read ? 'transparent' : 'rgba(212,175,55,0.04)',
    borderBottom: '1px solid #F1F5F9', cursor: 'pointer',
    transition: 'background 0.15s',
  }),
  dot: (type) => ({
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
    background: type === 'warning' ? '#F59E0B' : type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6',
  }),
  itemTitle: { font: "500 13px -apple-system, sans-serif", color: '#1E293B', margin: 0 },
  itemMsg: { font: "400 12px -apple-system, sans-serif", color: '#64748B', margin: '2px 0 0' },
  itemTime: { font: "400 11px -apple-system, sans-serif", color: '#94A3B8', marginTop: 4 },
  empty: {
    padding: '32px 16px', textAlign: 'center',
    font: "400 14px -apple-system, sans-serif", color: '#94A3B8',
  },
};

const BellIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const ref = useRef(null);

  const refresh = useCallback(() => {
    const role = localStorage.getItem('ds_admin_role') || 'executive_director';
    setNotifs(generateNotifications(role));
  }, []);

  useEffect(() => {
    refresh();
    const unsub = subscribe(refresh);
    // Also refresh when role changes
    const poll = setInterval(refresh, 2000);
    return () => { unsub(); clearInterval(poll); };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (id) => {
    const readState = JSON.parse(localStorage.getItem('ds_notif_read') || '{}');
    readState[id] = true;
    localStorage.setItem('ds_notif_read', JSON.stringify(readState));
    refresh();
  };

  const markAllRead = () => {
    const readState = JSON.parse(localStorage.getItem('ds_notif_read') || '{}');
    notifs.forEach(n => { readState[n.id] = true; });
    localStorage.setItem('ds_notif_read', JSON.stringify(readState));
    refresh();
  };

  return (
    <div style={S.wrap} ref={ref}>
      <button style={S.btn} onClick={() => setOpen(o => !o)} title="Notifications">
        {BellIcon}
        {unreadCount > 0 && <span style={S.badge} />}
      </button>

      {open && (
        <div style={S.dropdown}>
          <div style={S.header}>
            <p style={S.headerTitle}>Notifications</p>
            {unreadCount > 0 && (
              <button style={S.markAll} onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          {notifs.length === 0 ? (
            <div style={S.empty}>No notifications</div>
          ) : (
            notifs.map(n => (
              <div
                key={n.id}
                style={S.item(n.read)}
                onClick={() => markRead(n.id)}
                onMouseEnter={e => e.currentTarget.style.background = '#F8F7F4'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(212,175,55,0.04)'}
              >
                <div style={S.dot(n.type)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={S.itemTitle}>{n.title}</p>
                  <p style={S.itemMsg}>{n.message}</p>
                  <p style={S.itemTime}>{timeAgo(n.time)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
