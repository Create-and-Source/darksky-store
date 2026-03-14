import { ORDERS, INVENTORY, PURCHASE_ORDERS, formatPrice, getStockStatus } from '../data/mockData';

const recentOrders = ORDERS.slice(0, 10);
const lowStockItems = INVENTORY.filter(i => {
  const s = getStockStatus(i);
  return s === 'low' || s === 'out';
});
const pendingPOs = PURCHASE_ORDERS.filter(p => p.status !== 'Received');
const thirtyDayOrders = ORDERS; // mock: all are within 30 days
const revenue = thirtyDayOrders.reduce((s, o) => s + o.total, 0);

const statusBadge = (status) => {
  const map = { Paid: 'badge-green', Processing: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-gray' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function Dashboard() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Overview of your store activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-label">Orders (30 days)</div>
          <div className="admin-stat-value">{thirtyDayOrders.length}</div>
          <div className="admin-stat-sub"><span className="up">+18%</span> vs last month</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Revenue (30 days)</div>
          <div className="admin-stat-value gold">{formatPrice(revenue)}</div>
          <div className="admin-stat-sub"><span className="up">+12%</span> vs last month</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Low Stock Items</div>
          <div className="admin-stat-value">{lowStockItems.length}</div>
          <div className="admin-stat-sub">{lowStockItems.filter(i => getStockStatus(i) === 'out').length} out of stock</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Pending POs</div>
          <div className="admin-stat-value">{pendingPOs.length}</div>
          <div className="admin-stat-sub">{pendingPOs.filter(p => p.status === 'Shipped').length} shipped, en route</div>
        </div>
      </div>

      <div className="admin-grid-2">
        {/* Recent Orders */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title">Recent Orders</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td className="text-white">{o.id}</td>
                  <td>{o.customer}</td>
                  <td className="text-gold">{formatPrice(o.total)}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title">Low Stock Alerts</span>
          </div>
          <div style={{ padding: '8px 20px 16px' }}>
            {lowStockItems.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">✓</div>
                <div className="admin-empty-text">All items are well stocked</div>
              </div>
            ) : (
              lowStockItems.map(item => {
                const total = item.warehouse + item.giftshop;
                const isOut = total === 0;
                return (
                  <div key={item.id} className="admin-alert-row">
                    <div className={`admin-alert-dot ${isOut ? 'red' : 'yellow'}`} />
                    <div className="admin-alert-info">
                      <div className="admin-alert-name">{item.name}</div>
                      <div className="admin-alert-meta">
                        {item.variant} · {total} total ({item.warehouse} warehouse, {item.giftshop} gift shop) · Reorder at {item.reorderPoint}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
