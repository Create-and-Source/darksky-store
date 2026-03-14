import { useState } from 'react';
import { TRANSFERS, INVENTORY, LOCATIONS } from '../data/mockData';
import { useToast } from '../AdminLayout';

const statusClass = { Pending: 'badge-yellow', 'In Transit': 'badge-blue', Received: 'badge-green' };

export default function Transfers() {
  const [transfers, setTransfers] = useState(TRANSFERS);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ from: 'warehouse', to: 'giftshop', items: [], notes: '' });
  const [search, setSearch] = useState('');
  const toast = useToast();

  const searchResults = search.length >= 2
    ? INVENTORY.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : [];

  const addToTransfer = (inv) => {
    if (form.items.find(i => i.id === inv.id)) return;
    setForm(f => ({ ...f, items: [...f.items, { ...inv, transferQty: 1 }] }));
    setSearch('');
  };

  const updateTransferQty = (id, qty) => {
    if (qty < 1) qty = 1;
    setForm(f => ({ ...f, items: f.items.map(i => i.id === id ? { ...i, transferQty: qty } : i) }));
  };

  const removeFromTransfer = (id) => {
    setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));
  };

  const submitTransfer = () => {
    const newTransfer = {
      id: `TRF-${String(90 + transfers.length).padStart(4, '0')}`,
      from: LOCATIONS.find(l => l.id === form.from)?.name,
      to: LOCATIONS.find(l => l.id === form.to)?.name,
      status: 'Pending',
      items: form.items.map(i => ({ name: i.name, sku: i.sku, qty: i.transferQty })),
      createdDate: new Date().toISOString().slice(0, 10),
      shippedDate: null,
      receivedDate: null,
      createdBy: 'Tovah',
      receivedBy: null,
      notes: form.notes,
    };
    setTransfers(prev => [newTransfer, ...prev]);
    setCreating(false);
    setForm({ from: 'warehouse', to: 'giftshop', items: [], notes: '' });
    toast('Transfer created successfully');
  };

  const markShipped = (id) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'In Transit', shippedDate: new Date().toISOString().slice(0, 10) } : t));
    setSelected(prev => prev ? { ...prev, status: 'In Transit', shippedDate: new Date().toISOString().slice(0, 10) } : null);
    toast('Transfer marked as shipped');
  };

  const markReceived = (id) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'Received', receivedDate: new Date().toISOString().slice(0, 10), receivedBy: 'Josie' } : t));
    setSelected(prev => prev ? { ...prev, status: 'Received', receivedDate: new Date().toISOString().slice(0, 10), receivedBy: 'Josie' } : null);
    toast('Transfer received and inventory updated');
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Transfers</h1>
          <p className="admin-page-subtitle">Move stock between locations</p>
        </div>
        <button className="admin-btn admin-btn-gold" onClick={() => setCreating(true)}>
          + New Transfer
        </button>
      </div>

      {/* Transfer List */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>From</th>
              <th>To</th>
              <th>Items</th>
              <th>Status</th>
              <th>Created</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id} className="clickable" onClick={() => setSelected(t)}>
                <td className="text-white">{t.id}</td>
                <td>{t.from}</td>
                <td>{t.to}</td>
                <td>{t.items.length} product{t.items.length > 1 ? 's' : ''}</td>
                <td><span className={`badge ${statusClass[t.status]}`}>{t.status}</span></td>
                <td>{t.createdDate}</td>
                <td>{t.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Transfer Modal */}
      {creating && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setCreating(false)} />
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">New Transfer</span>
              <button className="admin-drawer-close" onClick={() => setCreating(false)}>✕</button>
            </div>
            <div className="admin-drawer-body">
              <div className="admin-grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <label className="admin-label">From</label>
                  <select className="admin-select" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}>
                    {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">To</label>
                  <select className="admin-select" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}>
                    {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              <label className="admin-label">Add Products</label>
              <input
                className="admin-input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              {searchResults.length > 0 && (
                <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
                  {searchResults.map(r => (
                    <button
                      key={r.id}
                      onClick={() => addToTransfer(r)}
                      disabled={!!form.items.find(i => i.id === r.id)}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', background: 'transparent',
                        border: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)',
                        color: form.items.find(i => i.id === r.id) ? '#5a5550' : '#e8e4df',
                        cursor: form.items.find(i => i.id === r.id) ? 'default' : 'pointer',
                        font: '400 13px DM Sans', textAlign: 'left',
                      }}
                    >
                      {r.name} — {r.variant}
                    </button>
                  ))}
                </div>
              )}

              {form.items.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {form.items.map(i => (
                    <div key={i.id} className="admin-receive-item">
                      <div className="admin-receive-item-info">
                        <div className="admin-receive-item-name">{i.name}</div>
                        <div className="admin-receive-item-sku">{i.variant}</div>
                      </div>
                      <div className="admin-receive-qty">
                        <button className="admin-receive-qty-btn" onClick={() => updateTransferQty(i.id, i.transferQty - 1)}>−</button>
                        <input className="admin-receive-qty-input" type="number" min="1" value={i.transferQty} onChange={e => updateTransferQty(i.id, parseInt(e.target.value) || 1)} />
                        <button className="admin-receive-qty-btn" onClick={() => updateTransferQty(i.id, i.transferQty + 1)}>+</button>
                      </div>
                      <button className="admin-receive-remove" onClick={() => removeFromTransfer(i.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label className="admin-label">Notes</label>
                <textarea className="admin-textarea" placeholder="Transfer notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <button
                className="admin-btn admin-btn-gold admin-btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={form.items.length === 0}
                onClick={submitTransfer}
              >
                Create Transfer
              </button>
            </div>
          </div>
        </>
      )}

      {/* Transfer Detail */}
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
                  <div className="admin-label">From</div>
                  <p style={{ color: '#e8e4df', fontSize: 14 }}>{selected.from}</p>
                </div>
                <div>
                  <div className="admin-label">To</div>
                  <p style={{ color: '#e8e4df', fontSize: 14 }}>{selected.to}</p>
                </div>
              </div>
              <div className="admin-grid-3" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">Status</div>
                  <span className={`badge ${statusClass[selected.status]}`}>{selected.status}</span>
                </div>
                <div>
                  <div className="admin-label">Created</div>
                  <p style={{ color: '#908a84', fontSize: 13 }}>{selected.createdDate}</p>
                </div>
                <div>
                  <div className="admin-label">By</div>
                  <p style={{ color: '#908a84', fontSize: 13 }}>{selected.createdBy}</p>
                </div>
              </div>
              {selected.notes && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Notes</div>
                  <p style={{ color: '#908a84', fontSize: 13 }}>{selected.notes}</p>
                </div>
              )}

              <div className="admin-label" style={{ marginBottom: 8 }}>Items</div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>SKU</th><th>Qty</th></tr></thead>
                  <tbody>
                    {selected.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-white">{item.name}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{item.sku}</td>
                        <td className="text-gold">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selected.status === 'Pending' && (
                <button className="admin-btn admin-btn-gold admin-btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => markShipped(selected.id)}>
                  Mark as Shipped
                </button>
              )}
              {selected.status === 'In Transit' && (
                <button className="admin-btn admin-btn-gold admin-btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => markReceived(selected.id)}>
                  Mark as Received
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
