import { useState } from 'react';
import { ORDERS, formatPrice } from '../data/mockData';

const statusClass = { Paid: 'badge-green', Processing: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-gray' };
const channelClass = { Online: 'badge-blue', POS: 'badge-gold' };

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = ORDERS.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (channelFilter !== 'All' && o.channel !== channelFilter) return false;
    return true;
  });

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">{ORDERS.length} total orders</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-filters">
          <div className="admin-filter-tabs">
            {['All', 'Paid', 'Processing', 'Shipped', 'Delivered'].map(s => (
              <button key={s} className={`admin-filter-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="admin-filter-tabs">
            {['All', 'Online', 'POS'].map(c => (
              <button key={c} className={`admin-filter-tab ${channelFilter === c ? 'active' : ''}`} onClick={() => setChannelFilter(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
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
                <tr key={o.id} className="clickable" onClick={() => setSelected(o)}>
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
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#5a5550' }}>No orders match filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail */}
      {selected && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setSelected(null)} />
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">{selected.id}</span>
              <button className="admin-drawer-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="admin-drawer-body">
              <div className="admin-grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">Customer</div>
                  <p style={{ color: '#e8e4df', fontSize: 14 }}>{selected.customer}</p>
                  {selected.email && <p style={{ color: '#5a5550', fontSize: 12, marginTop: 2 }}>{selected.email}</p>}
                </div>
                <div>
                  <div className="admin-label">Status</div>
                  <span className={`badge ${statusClass[selected.status]}`}>{selected.status}</span>
                </div>
              </div>

              <div className="admin-grid-3" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">Channel</div>
                  <span className={`badge ${channelClass[selected.channel]}`}>{selected.channel}</span>
                </div>
                <div>
                  <div className="admin-label">Date</div>
                  <p style={{ color: '#908a84', fontSize: 13 }}>{selected.date}</p>
                </div>
                <div>
                  <div className="admin-label">Payment</div>
                  <p style={{ color: '#908a84', fontSize: 11, fontFamily: 'monospace' }}>{selected.paymentId}</p>
                </div>
              </div>

              {selected.address && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Shipping Address</div>
                  <p style={{ color: '#908a84', fontSize: 13 }}>{selected.address}</p>
                </div>
              )}

              {selected.tracking && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Tracking</div>
                  <p style={{ color: '#908a84', fontSize: 12, fontFamily: 'monospace' }}>{selected.tracking}</p>
                </div>
              )}

              <div className="admin-label" style={{ marginBottom: 8 }}>Items</div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {selected.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="text-white">{item.name}</div>
                          <div style={{ fontSize: 11, color: '#5a5550' }}>{item.variant}</div>
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
                  <span style={{ color: '#908a84', fontSize: 13 }}>Subtotal</span>
                  <span style={{ color: '#e8e4df', fontSize: 13 }}>{formatPrice(selected.subtotal)}</span>
                </div>
                <div className="admin-panel-row">
                  <span style={{ color: '#908a84', fontSize: 13 }}>Shipping</span>
                  <span style={{ color: '#e8e4df', fontSize: 13 }}>{selected.shipping === 0 ? 'Free' : formatPrice(selected.shipping)}</span>
                </div>
                <div className="admin-panel-row">
                  <span style={{ color: '#908a84', fontSize: 13 }}>Tax</span>
                  <span style={{ color: '#e8e4df', fontSize: 13 }}>{formatPrice(selected.tax)}</span>
                </div>
                <div className="admin-panel-row" style={{ borderBottom: 'none', paddingTop: 16 }}>
                  <span style={{ color: '#e8e4df', fontSize: 15, fontWeight: 600 }}>Total</span>
                  <span style={{ color: '#d4af37', fontSize: 18, fontWeight: 600 }}>{formatPrice(selected.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
