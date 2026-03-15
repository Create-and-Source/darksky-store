import { useState, useEffect } from 'react';
import { getOrders, updateOrder, formatPrice, subscribe } from '../data/store';
import { useToast } from '../AdminLayout';
import HelpBubble from '../components/HelpBubble';
import PageTour from '../components/PageTour';

const statusClass = { Paid: 'badge-green', Processing: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-gray' };
const channelClass = { Online: 'badge-blue', POS: 'badge-gold' };
const ALL_STATUSES = ['All', 'Processing', 'Shipped', 'Delivered', 'Paid'];
const ALL_CHANNELS = ['All', 'Online', 'POS'];

export default function Orders() {
  const [, setTick] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const toast = useToast();

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  const orders = getOrders();

  const filtered = orders.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (channelFilter !== 'All' && o.channel !== channelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q) && !(o.email && o.email.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // Keep selected in sync with store
  const selectedOrder = selected ? orders.find(o => o.id === selected.id) || selected : null;

  const handleStatusChange = (id, newStatus) => {
    const changes = { status: newStatus };
    if (newStatus === 'Shipped' && trackingInput) {
      changes.tracking = trackingInput;
    }
    updateOrder(id, changes);
    const updated = getOrders().find(o => o.id === id);
    if (updated) setSelected(updated);
    setEditStatus('');
    setTrackingInput('');
    toast(`Order ${id} updated to ${newStatus}`);
  };

  const handleTrackingUpdate = (id) => {
    if (!trackingInput.trim()) {
      toast('Enter a tracking number');
      return;
    }
    updateOrder(id, { tracking: trackingInput.trim() });
    const updated = getOrders().find(o => o.id === id);
    if (updated) setSelected(updated);
    setTrackingInput('');
    toast(`Tracking number updated for ${id}`);
  };

  return (
    <>
      <PageTour storageKey="ds_tour_orders" steps={[
        { target: '#tour-orders-filters', title: 'Filters', text: 'Filter orders by status or sales channel to quickly find what you need.' },
        { target: '#tour-orders-table', title: 'Order List', text: 'All customer orders appear here. Click any row to view full details.' },
        { target: '#tour-orders-detail', title: 'Order Details', text: 'Click an order row to open a detail panel where you can update status and add tracking.' },
      ]} />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Orders
            <HelpBubble text="All customer orders — online purchases and in-store (POS) sales." />
          </h1>
          <p className="admin-page-subtitle">All customer orders from your website and gift shop. Click any order to see details.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-filters" id="tour-orders-filters">
          <div className="admin-filter-search" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <input
              className="admin-input"
              placeholder="Search by order ID, customer, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <HelpBubble text="Search by order number (like ORD-2401) or customer name." />
          </div>
          <div className="admin-filter-tabs" style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
            {ALL_STATUSES.map(s => (
              <button key={s} className={`admin-filter-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s}
              </button>
            ))}
            <HelpBubble text="Filter orders by their current status to find what needs attention." />
          </div>
          <div className="admin-filter-tabs" style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
            {ALL_CHANNELS.map(c => (
              <button key={c} className={`admin-filter-tab ${channelFilter === c ? 'active' : ''}`} onClick={() => setChannelFilter(c)}>
                {c}
              </button>
            ))}
            <HelpBubble text="Online orders come from your website. POS orders come from Square at the gift shop." />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }} id="tour-orders-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Channel</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="clickable" onClick={() => { setSelected(o); setEditStatus(''); setTrackingInput(''); }}>
                  <td className="text-white">{o.id}</td>
                  <td>{o.customer}</td>
                  <td><span className={`badge ${channelClass[o.channel]}`}>{o.channel}</span></td>
                  <td>{o.items.length} item{o.items.length > 1 ? 's' : ''}</td>
                  <td className="text-gold">{formatPrice(o.total)}</td>
                  <td><span className={`badge ${statusClass[o.status]}`}>{o.status}</span></td>
                  <td>{o.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>{orders.length === 0 ? "No orders yet. Once your store is live, online and in-store sales will appear here automatically." : "No orders match your current filters. Try adjusting the status or channel filter above."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <div id="tour-orders-detail" />
      {selectedOrder && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setSelected(null)} />
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">{selectedOrder.id}</span>
              <button className="admin-drawer-close" onClick={() => setSelected(null)}>&#10005;</button>
            </div>
            <div className="admin-drawer-body">
              <div className="admin-grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">Customer</div>
                  <p style={{ color: '#1E293B', fontSize: 15 }}>{selectedOrder.customer}</p>
                  {selectedOrder.email && <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 2 }}>{selectedOrder.email}</p>}
                </div>
                <div>
                  <div className="admin-label">Status</div>
                  <span className={`badge ${statusClass[selectedOrder.status]}`}>{selectedOrder.status}</span>
                </div>
              </div>

              <div className="admin-grid-3" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">Channel</div>
                  <span className={`badge ${channelClass[selectedOrder.channel]}`}>{selectedOrder.channel}</span>
                </div>
                <div>
                  <div className="admin-label">Date</div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{selectedOrder.date}</p>
                </div>
                <div>
                  <div className="admin-label">Payment</div>
                  <p style={{ color: '#64748B', fontSize: 14, fontFamily: 'monospace' }}>{selectedOrder.paymentId}</p>
                </div>
              </div>

              {selectedOrder.address && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Shipping Address</div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{selectedOrder.address}</p>
                </div>
              )}

              {selectedOrder.tracking && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Tracking</div>
                  <p style={{ color: '#64748B', fontSize: 14, fontFamily: 'monospace' }}>{selectedOrder.tracking}</p>
                </div>
              )}

              {/* Tracking input for shipped orders without tracking */}
              {(selectedOrder.status === 'Shipped' && !selectedOrder.tracking) && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Add Tracking Number
                    <HelpBubble text="Add the shipping tracking number so customers can track their package." />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="admin-input"
                      placeholder="Enter tracking number..."
                      value={trackingInput}
                      onChange={e => setTrackingInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button className="admin-btn admin-btn-gold" onClick={() => handleTrackingUpdate(selectedOrder.id)}>
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="admin-label" style={{ marginBottom: 8 }}>Items</div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="text-white">{item.name}</div>
                          <div style={{ fontSize: 14, color: '#94A3B8' }}>{item.variant}</div>
                        </td>
                        <td>{item.qty}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td className="text-gold">{formatPrice(item.price * item.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-panel" style={{ marginTop: 16, padding: 16 }}>
                <div className="admin-panel-row">
                  <span style={{ color: '#64748B', fontSize: 14 }}>Subtotal</span>
                  <span style={{ color: '#1E293B', fontSize: 14 }}>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="admin-panel-row">
                  <span style={{ color: '#64748B', fontSize: 14 }}>Shipping</span>
                  <span style={{ color: '#1E293B', fontSize: 14 }}>{selectedOrder.shipping === 0 ? 'Free' : formatPrice(selectedOrder.shipping)}</span>
                </div>
                <div className="admin-panel-row">
                  <span style={{ color: '#64748B', fontSize: 14 }}>Tax</span>
                  <span style={{ color: '#1E293B', fontSize: 14 }}>{formatPrice(selectedOrder.tax)}</span>
                </div>
                <div className="admin-panel-row" style={{ borderBottom: 'none', paddingTop: 16 }}>
                  <span style={{ color: '#1E293B', fontSize: 16, fontWeight: 600 }}>Total</span>
                  <span style={{ color: '#d4af37', fontSize: 18, fontWeight: 600 }}>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Update Status */}
              <div style={{ marginTop: 20 }}>
                <div className="admin-label" style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center' }}>
                  Update Status
                  <HelpBubble text="Change the order status as you process it. Customers get notified automatically." />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    className="admin-select"
                    value={editStatus || selectedOrder.status}
                    onChange={e => setEditStatus(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {['Processing', 'Shipped', 'Delivered', 'Paid'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    className="admin-btn admin-btn-gold"
                    disabled={!editStatus || editStatus === selectedOrder.status}
                    onClick={() => handleStatusChange(selectedOrder.id, editStatus)}
                  >
                    Update
                  </button>
                </div>
                {editStatus === 'Shipped' && editStatus !== selectedOrder.status && (
                  <div style={{ marginTop: 8 }}>
                    <input
                      className="admin-input"
                      placeholder="Tracking number (optional)"
                      value={trackingInput}
                      onChange={e => setTrackingInput(e.target.value)}
                    />
                    <HelpBubble text="Add the shipping tracking number so customers can track their package." />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
