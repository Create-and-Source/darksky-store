import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribe, getInventory, getPurchaseOrders } from '../admin/data/store';

// Generate notifications from store state
function generateNotifications(inventory, pos) {
  const notifs = [];
  const now = Date.now();

  // Low stock alerts
  inventory.forEach(item => {
    const giftShopQty = item.giftshop ?? item.quantity ?? 0;
    if (giftShopQty > 0 && giftShopQty <= (item.reorderPoint || 5)) {
      notifs.push({
        id: `low-${item.id}`,
        type: 'warning',
        title: 'Low Stock',
        message: `${item.name} has only ${giftShopQty} left in gift shop`,
        time: now - Math.random() * 3600000,
        read: false,
      });
    }
  });

  // PO arrivals
  pos.forEach(po => {
    if (po.status === 'Shipped') {
      notifs.push({
        id: `po-${po.id}`,
        type: 'info',
        title: 'Shipment En Route',
        message: `${po.id} is shipped — expected ${po.expectedDate || 'soon'}`,
        time: now - Math.random() * 7200000,
        read: false,
      });
    }
  });

  // Sort by time, newest first
  notifs.sort((a, b) => b.time - a.time);

  // Merge with stored read state
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
    background: type === 'warning' ? '#F59E0B' : type === 'error' ? '#EF4444' : '#3B82F6',
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
    const inv = getInventory();
    const pos = getPurchaseOrders();
    setNotifs(generateNotifications(inv, pos));
  }, []);

  useEffect(() => {
    refresh();
    const unsub = subscribe(refresh);
    return unsub;
  }, [refresh]);

  // Close on outside click
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
