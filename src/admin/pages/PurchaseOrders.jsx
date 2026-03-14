import { useState } from 'react';
import { PURCHASE_ORDERS, VENDORS, INVENTORY, formatPrice } from '../data/mockData';
import { useToast } from '../AdminLayout';

const statusClass = { Draft: 'badge-gray', Ordered: 'badge-blue', 'In Production': 'badge-purple', Shipped: 'badge-gold', Received: 'badge-green' };

export default function PurchaseOrders() {
  const [pos, setPos] = useState(PURCHASE_ORDERS);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ vendor: 'printify', items: [], expectedDate: '', notes: '' });
  const [search, setSearch] = useState('');
  const toast = useToast();

  const searchResults = search.length >= 2
    ? INVENTORY.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : [];

  const addToPO = (inv) => {
    if (form.items.find(i => i.id === inv.id)) return;
    setForm(f => ({ ...f, items: [...f.items, { ...inv, orderQty: 12, unitCost: Math.round(inv.price * 0.5) }] }));
    setSearch('');
  };

  const updatePOItem = (id, field, value) => {
    setForm(f => ({ ...f, items: f.items.map(i => i.id === id ? { ...i, [field]: parseInt(value) || 0 } : i) }));
  };

  const removePOItem = (id) => {
    setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));
  };

  const submitPO = () => {
    const total = form.items.reduce((s, i) => s + i.orderQty * i.unitCost, 0);
    const newPO = {
      id: `PO-${String(46 + pos.length).padStart(4, '0')}`,
      vendor: VENDORS.find(v => v.id === form.vendor)?.name || form.vendor,
      status: 'Draft',
      items: form.items.map(i => ({ name: i.name, sku: i.sku, variant: i.variant, ordered: i.orderQty, received: 0, price: i.unitCost })),
      expectedDate: form.expectedDate || 'TBD',
      createdDate: new Date().toISOString().slice(0, 10),
      notes: form.notes,
      total,
    };
    setPos(prev => [newPO, ...prev]);
    setCreating(false);
    setForm({ vendor: 'printify', items: [], expectedDate: '', notes: '' });
    toast('Purchase order created');
  };

  const updateStatus = (id, newStatus) => {
    setPos(prev => prev.map(p => p.id === id ? { ...p, status: newStatus, ...(newStatus === 'Received' ? { receivedDate: new Date().toISOString().slice(0, 10) } : {}) } : p));
    setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    toast(`PO ${id} marked as ${newStatus}`);
  };

  const nextStatus = (current) => {
    const flow = { Draft: 'Ordered', Ordered: 'In Production', 'In Production': 'Shipped', Shipped: 'Received' };
    return flow[current];
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Purchase Orders</h1>
          <p className="admin-page-subtitle">{pos.length} purchase orders</p>
        </div>
        <button className="admin-btn admin-btn-gold" onClick={() => setCreating(true)}>
          + New Purchase Order
        </button>
      </div>

      <div className="admin-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>PO #</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Expected</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {pos.map(po => (
                <tr key={po.id} className="clickable" onClick={() => setSelected(po)}>
                  <td className="text-white">{po.id}</td>
                  <td>{po.vendor}</td>
                  <td>{po.items.length} line{po.items.length > 1 ? 's' : ''}</td>
                  <td className="text-gold">{formatPrice(po.total)}</td>
                  <td><span className={`badge ${statusClass[po.status]}`}>{po.status}</span></td>
                  <td>{po.expectedDate}</td>
                  <td>{po.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO */}
      {creating && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setCreating(false)} />
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">New Purchase Order</span>
              <button className="admin-drawer-close" onClick={() => setCreating(false)}>✕</button>
            </div>
            <div className="admin-drawer-body">
              <div style={{ marginBottom: 16 }}>
                <label className="admin-label">Vendor</label>
                <select className="admin-select" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}>
                  {VENDORS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="admin-label">Expected Delivery Date</label>
                <input className="admin-input" type="date" value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))} />
              </div>

              <label className="admin-label">Add Products</label>
              <input className="admin-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 8 }} />
              {searchResults.length > 0 && (
                <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
                  {searchResults.map(r => (
                    <button key={r.id} onClick={() => addToPO(r)} disabled={!!form.items.find(i => i.id === r.id)}
                      style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)', color: form.items.find(i => i.id === r.id) ? '#5a5550' : '#e8e4df', cursor: form.items.find(i => i.id === r.id) ? 'default' : 'pointer', font: '400 13px DM Sans', textAlign: 'left' }}
                    >{r.name} — {r.variant}</button>
                  ))}
                </div>
              )}

              {form.items.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {form.items.map(i => (
                    <div key={i.id} className="admin-receive-item" style={{ flexWrap: 'wrap', gap: 10 }}>
                      <div className="admin-receive-item-info" style={{ width: '100%' }}>
                        <div className="admin-receive-item-name">{i.name} — {i.variant}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#5a5550', marginBottom: 4 }}>QTY</div>
                          <input className="admin-receive-qty-input" type="number" min="1" value={i.orderQty} onChange={e => updatePOItem(i.id, 'orderQty', e.target.value)} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#5a5550', marginBottom: 4 }}>UNIT COST</div>
                          <input className="admin-receive-qty-input" style={{ width: 72 }} type="number" min="0" value={i.unitCost} onChange={e => updatePOItem(i.id, 'unitCost', e.target.value)} />
                        </div>
                        <div style={{ marginTop: 16 }}>
                          <button className="admin-receive-remove" onClick={() => removePOItem(i.id)}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', marginTop: 12 }}>
                    <span style={{ fontSize: 12, color: '#5a5550' }}>Total: </span>
                    <span style={{ color: '#d4af37', fontWeight: 600, fontSize: 16 }}>
                      {formatPrice(form.items.reduce((s, i) => s + i.orderQty * i.unitCost, 0))}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label className="admin-label">Notes</label>
                <textarea className="admin-textarea" placeholder="PO notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <button className="admin-btn admin-btn-gold admin-btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={form.items.length === 0} onClick={submitPO}>
                Create Purchase Order
              </button>
            </div>
          </div>
        </>
      )}

      {/* PO Detail */}
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
                  <div className="admin-label">Vendor</div>
                  <p style={{ color: '#e8e4df', fontSize: 14 }}>{selected.vendor}</p>
                </div>
                <div>
                  <div className="admin-label">Status</div>
                  <span className={`badge ${statusClass[selected.status]}`}>{selected.status}</span>
                </div>
              </div>
              <div className="admin-grid-3" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">Created</div>
                  <p style={{ color: '#908a84', fontSize: 13 }}>{selected.createdDate}</p>
                </div>
                <div>
                  <div className="admin-label">Expected</div>
                  <p style={{ color: '#908a84', fontSize: 13 }}>{selected.expectedDate}</p>
                </div>
                <div>
                  <div className="admin-label">Total</div>
                  <p style={{ color: '#d4af37', fontSize: 14, fontWeight: 600 }}>{formatPrice(selected.total)}</p>
                </div>
              </div>
              {selected.tracking && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Tracking</div>
                  <p style={{ color: '#908a84', fontSize: 13, fontFamily: 'monospace' }}>{selected.tracking}</p>
                </div>
              )}
              {selected.notes && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Notes</div>
                  <p style={{ color: '#908a84', fontSize: 13 }}>{selected.notes}</p>
                </div>
              )}

              <div className="admin-label" style={{ marginBottom: 8 }}>Line Items</div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>Ordered</th><th>Received</th><th>Unit</th></tr></thead>
                  <tbody>
                    {selected.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="text-white">{item.name}</div>
                          <div style={{ fontSize: 11, color: '#5a5550' }}>{item.variant}</div>
                        </td>
                        <td>{item.ordered}</td>
                        <td style={{ color: item.received >= item.ordered ? '#4ade80' : '#908a84' }}>{item.received}</td>
                        <td>{formatPrice(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selected.status !== 'Received' && nextStatus(selected.status) && (
                <button className="admin-btn admin-btn-gold admin-btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => updateStatus(selected.id, nextStatus(selected.status))}>
                  Mark as {nextStatus(selected.status)}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
