import { useState, useEffect } from 'react';
import { getInventory, getMovements, adjustStock, formatPrice, getStockStatus, subscribe, getSalesVelocity } from '../data/store';
import { useToast } from '../AdminLayout';
import PageTour from '../components/PageTour';

const statusLabel = { in: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };
const statusClass = { in: 'badge-green', low: 'badge-yellow', out: 'badge-red' };

export default function Inventory() {
  const [, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [adjusting, setAdjusting] = useState(false);
  const [adjLocation, setAdjLocation] = useState('warehouse');
  const [adjDelta, setAdjDelta] = useState(0);
  const [adjNote, setAdjNote] = useState('');
  const toast = useToast();

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  const inventory = getInventory();
  const velocity = getSalesVelocity();
  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filtered = inventory.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || (item.category && item.category.toLowerCase().includes(q)) || (item.variant && item.variant.toLowerCase().includes(q));
    if (!matchSearch) return false;
    if (locFilter === 'warehouse') return (item.warehouse || 0) > 0;
    if (locFilter === 'giftshop') return (item.giftshop || 0) > 0;
    if (catFilter !== 'All' && item.category !== catFilter) return false;
    if (stockFilter !== 'All') {
      const s = getStockStatus(item);
      if (stockFilter === 'In Stock' && s !== 'in') return false;
      if (stockFilter === 'Low Stock' && s !== 'low') return false;
      if (stockFilter === 'Out of Stock' && s !== 'out') return false;
    }
    return true;
  });

  // Keep selected in sync with store data
  const selectedItem = selected ? inventory.find(p => p.id === selected.id) || selected : null;
  const history = selectedItem ? getMovements(selectedItem.id) : [];

  const handleAdjust = () => {
    if (adjDelta === 0) {
      toast('Quantity change cannot be zero');
      return;
    }
    adjustStock(selectedItem.id, adjLocation, adjDelta, '', adjNote || 'Manual adjustment');
    toast(`Stock adjusted: ${adjDelta > 0 ? '+' : ''}${adjDelta} ${adjLocation === 'warehouse' ? 'Warehouse' : 'Gift Shop'}`);
    setAdjusting(false);
    setAdjDelta(0);
    setAdjNote('');
    // Update selected to reflect changes
    const updated = getInventory().find(p => p.id === selectedItem.id);
    if (updated) setSelected(updated);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Variant', 'Category', 'Price', 'Warehouse', 'Gift Shop', 'Total', 'Status'];
    const rows = inventory.map(item => {
      const total = (item.warehouse || 0) + (item.giftshop || 0);
      const status = statusLabel[getStockStatus(item)];
      return [
        item.id,
        `"${item.name}"`,
        item.sku,
        `"${item.variant}"`,
        item.category,
        (item.price / 100).toFixed(2),
        item.warehouse || 0,
        item.giftshop || 0,
        total,
        status,
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported successfully');
  };

  return (
    <>
      <PageTour storageKey="ds_tour_inventory" steps={[
        { target: '#tour-inventory-search', title: 'Search & Filter', text: 'Search by product name, SKU, or category. Use the tabs to filter by location or stock status.' },
        { target: '#tour-inventory-table', title: 'Stock Overview', text: 'View all products with warehouse and gift shop quantities, sales velocity, and days of stock remaining.' },
        { target: '#tour-inventory-status', title: 'Stock Status', text: 'Yellow badges mean stock is low. Red badges mean out of stock. Click a row for details.' },
      ]} />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Inventory
            
          </h1>
          <p className="admin-page-subtitle">See what's in stock at every location. Yellow means running low. Red means out of stock.</p>
        </div>
        <button className="admin-btn admin-btn-ghost" onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center' }}>
          Export CSV
          
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-filters" id="tour-inventory-search">
          <div className="admin-filter-search" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <input
              className="admin-input"
              placeholder="Search by name, SKU, or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            
          </div>
          <div className="admin-filter-tabs" style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
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
          <div className="admin-filter-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`admin-filter-tab ${catFilter === cat ? 'active' : ''}`}
                onClick={() => setCatFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="admin-filter-tabs">
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(s => (
              <button
                key={s}
                className={`admin-filter-tab ${stockFilter === s ? 'active' : ''}`}
                onClick={() => setStockFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }} id="tour-inventory-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>Gift Shop</th>
                <th>Total</th>
                <th>Velocity</th>
                <th>Days Left</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const status = getStockStatus(item);
                const total = (item.warehouse || 0) + (item.giftshop || 0);
                const v = velocity[item.id] || { perWeek: 0, daysLeft: null };
                const daysColor = v.daysLeft === null ? '#94A3B8' : v.daysLeft > 30 ? '#10B981' : v.daysLeft > 7 ? '#EAB308' : '#EF4444';
                return (
                  <tr key={item.id} className="clickable" onClick={() => { setSelected(item); setAdjusting(false); }}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-product-img">
                          {item.image ? (
                            <img src={item.image} alt="" />
                          ) : (
                            <div className="admin-product-img-placeholder">&#10022;</div>
                          )}
                        </div>
                        <span className="text-white">{item.name}</span>
                      </div>
                    </td>
                    <td>{item.variant}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 14 }}>{item.sku}</td>
                    <td>{item.warehouse || 0}</td>
                    <td>{item.giftshop || 0}</td>
                    <td className="text-white">{total}</td>
                    <td>
                      {v.perWeek > 0 ? (
                        <span style={{ fontSize: 13, color: '#64748B' }}>{v.perWeek}/wk</span>
                      ) : (
                        <span style={{ fontSize: 13, color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td>
                      {v.daysLeft !== null ? (
                        <span style={{ fontSize: 13, fontWeight: 600, color: daysColor }}>~{v.daysLeft}d</span>
                      ) : (
                        <span style={{ fontSize: 13, color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td id="tour-inventory-status">
                      <span className={`badge ${statusClass[status]}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {statusLabel[status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 32 }}>No products match your search. Try a different name, SKU, or filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedItem && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setSelected(null)} />
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">{selectedItem.name}</span>
              <button className="admin-drawer-close" onClick={() => setSelected(null)}>&#10005;</button>
            </div>
            <div className="admin-drawer-body">
              <div style={{ marginBottom: 20 }}>
                <div className="admin-label">Variant</div>
                <p style={{ color: '#1E293B', fontSize: 15 }}>{selectedItem.variant}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="admin-label">SKU</div>
                <p style={{ fontFamily: 'monospace', color: '#1E293B', fontSize: 14 }}>{selectedItem.sku}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="admin-label">Category</div>
                <p style={{ color: '#1E293B', fontSize: 15 }}>{selectedItem.category}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="admin-label">Price</div>
                <p style={{ color: '#d4af37', fontSize: 16, fontWeight: 600 }}>{formatPrice(selectedItem.price)}</p>
              </div>

              <div className="admin-grid-2" style={{ marginBottom: 24 }}>
                <div className="admin-stat" style={{ padding: 16 }}>
                  <div className="admin-stat-label">Warehouse</div>
                  <div className="admin-stat-value" style={{ fontSize: 22 }}>{selectedItem.warehouse || 0}</div>
                </div>
                <div className="admin-stat" style={{ padding: 16 }}>
                  <div className="admin-stat-label">Gift Shop</div>
                  <div className="admin-stat-value" style={{ fontSize: 22 }}>{selectedItem.giftshop || 0}</div>
                </div>
              </div>

              {/* Adjust Stock */}
              {!adjusting ? (
                <button
                  className="admin-btn admin-btn-gold"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 24, display: 'inline-flex', alignItems: 'center' }}
                  onClick={() => setAdjusting(true)}
                >
                  Adjust Stock
                  
                </button>
              ) : (
                <div className="admin-panel" style={{ padding: 16, marginBottom: 24 }}>
                  <div className="admin-panel-title" style={{ fontSize: 15, marginBottom: 12, display: 'inline-flex', alignItems: 'center' }}>
                    Adjust Stock
                    
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="admin-label">Location</label>
                    <select className="admin-select" value={adjLocation} onChange={e => setAdjLocation(e.target.value)}>
                      <option value="warehouse">Warehouse</option>
                      <option value="giftshop">Gift Shop</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="admin-label">Quantity Change (+/-)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className="admin-receive-qty-btn" onClick={() => setAdjDelta(d => d - 1)}>&#8722;</button>
                      <input
                        className="admin-receive-qty-input"
                        type="number"
                        value={adjDelta}
                        onChange={e => setAdjDelta(parseInt(e.target.value) || 0)}
                        style={{ textAlign: 'center', width: 80 }}
                      />
                      <button className="admin-receive-qty-btn" onClick={() => setAdjDelta(d => d + 1)}>+</button>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="admin-label">Reason / Note</label>
                    <input
                      className="admin-input"
                      placeholder="e.g. Damaged, Recount, Sample..."
                      value={adjNote}
                      onChange={e => setAdjNote(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="admin-btn admin-btn-ghost" onClick={() => { setAdjusting(false); setAdjDelta(0); setAdjNote(''); }}>
                      Cancel
                    </button>
                    <button className="admin-btn admin-btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAdjust}>
                      Apply Adjustment
                    </button>
                  </div>
                </div>
              )}

              <div className="admin-label" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center' }}>
                Movement History
                
              </div>
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
                        <th>Location</th>
                        <th>Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i}>
                          <td>{h.date}</td>
                          <td><span className={`badge ${h.type === 'Sale' ? 'badge-red' : h.type === 'Received' ? 'badge-green' : 'badge-blue'}`}>{h.type}</span></td>
                          <td style={{ fontFamily: 'monospace', fontSize: 14 }}>{h.ref}</td>
                          <td style={{ fontSize: 14 }}>{h.location}</td>
                          <td style={{ color: h.change > 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
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
