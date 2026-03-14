import { useState } from 'react';
import { INVENTORY, MOVEMENT_HISTORY, formatPrice, getStockStatus } from '../data/mockData';

const statusLabel = { in: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };
const statusClass = { in: 'badge-green', low: 'badge-yellow', out: 'badge-red' };

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = INVENTORY.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (locFilter === 'warehouse') return item.warehouse > 0;
    if (locFilter === 'giftshop') return item.giftshop > 0;
    return true;
  });

  const history = selected ? (MOVEMENT_HISTORY[selected.id] || []) : [];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventory</h1>
          <p className="admin-page-subtitle">{INVENTORY.length} variants across all products</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-filters">
          <div className="admin-filter-search">
            <input
              className="admin-input"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="admin-filter-tabs">
            {[['all', 'All'], ['warehouse', 'Warehouse'], ['giftshop', 'Gift Shop']].map(([val, label]) => (
              <button
                key={val}
                className={`admin-filter-tab ${locFilter === val ? 'active' : ''}`}
                onClick={() => setLocFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>Gift Shop</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const status = getStockStatus(item);
                const total = item.warehouse + item.giftshop;
                return (
                  <tr key={item.id} className="clickable" onClick={() => setSelected(item)}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-product-img">
                          {item.image ? (
                            <img src={item.image} alt="" />
                          ) : (
                            <div className="admin-product-img-placeholder">✦</div>
                          )}
                        </div>
                        <span className="text-white">{item.name}</span>
                      </div>
                    </td>
                    <td>{item.variant}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{item.sku}</td>
                    <td>{item.warehouse}</td>
                    <td>{item.giftshop}</td>
                    <td className="text-white">{total}</td>
                    <td><span className={`badge ${statusClass[status]}`}>{statusLabel[status]}</span></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32 }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setSelected(null)} />
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">{selected.name}</span>
              <button className="admin-drawer-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="admin-drawer-body">
              <div style={{ marginBottom: 20 }}>
                <div className="admin-label">Variant</div>
                <p style={{ color: '#e8e4df', fontSize: 14 }}>{selected.variant}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="admin-label">SKU</div>
                <p style={{ fontFamily: 'monospace', color: '#e8e4df', fontSize: 13 }}>{selected.sku}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="admin-label">Price</div>
                <p style={{ color: '#d4af37', fontSize: 16, fontWeight: 600 }}>{formatPrice(selected.price)}</p>
              </div>

              <div className="admin-grid-2" style={{ marginBottom: 24 }}>
                <div className="admin-stat" style={{ padding: 16 }}>
                  <div className="admin-stat-label">Warehouse</div>
                  <div className="admin-stat-value" style={{ fontSize: 22 }}>{selected.warehouse}</div>
                </div>
                <div className="admin-stat" style={{ padding: 16 }}>
                  <div className="admin-stat-label">Gift Shop</div>
                  <div className="admin-stat-value" style={{ fontSize: 22 }}>{selected.giftshop}</div>
                </div>
              </div>

              <div className="admin-label" style={{ marginBottom: 12 }}>Movement History</div>
              {history.length === 0 ? (
                <div className="admin-empty" style={{ padding: 24 }}>
                  <div className="admin-empty-text">No movement history available</div>
                </div>
              ) : (
                <div className="admin-table-wrap" style={{ marginBottom: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Ref</th>
                        <th>Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i}>
                          <td>{h.date}</td>
                          <td><span className={`badge ${h.type === 'Sale' ? 'badge-red' : h.type === 'Received' ? 'badge-green' : 'badge-blue'}`}>{h.type}</span></td>
                          <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{h.ref}</td>
                          <td style={{ color: h.change > 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                            {h.change > 0 ? '+' : ''}{h.change}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
