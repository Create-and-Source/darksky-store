import { useState, useEffect } from 'react';
import { getTransfers, addTransfer, updateTransfer, getInventory, subscribe } from '../data/store';
import { useToast } from '../AdminLayout';
import HelpBubble from '../components/HelpBubble';

const LOCATIONS = [
  { id: 'warehouse', name: 'C&S Warehouse' },
  { id: 'giftshop', name: 'Dark Sky Gift Shop' },
];

const statusClass = { Pending: 'badge-yellow', 'In Transit': 'badge-blue', Received: 'badge-green' };

export default function Transfers() {
  const [, setTick] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ from: 'warehouse', to: 'giftshop', items: [], notes: '' });
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  const transfers = getTransfers();
  const inventory = getInventory();

  const searchResults = search.length >= 2
    ? inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
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
    if (form.from === form.to) {
      toast('From and To locations must be different');
      return;
    }
    if (form.items.length === 0) {
      toast('Add at least one product to transfer');
      return;
    }
    const newTransfer = {
      from: LOCATIONS.find(l => l.id === form.from)?.name,
      to: LOCATIONS.find(l => l.id === form.to)?.name,
      items: form.items.map(i => ({ name: i.name, sku: i.sku, qty: i.transferQty })),
      createdBy: 'Tovah',
      notes: form.notes,
    };
    addTransfer(newTransfer);
    setCreating(false);
    setForm({ from: 'warehouse', to: 'giftshop', items: [], notes: '' });
    setSearch('');
    toast('Transfer created successfully');
  };

  const markShipped = (id) => {
    updateTransfer(id, { status: 'In Transit', shippedDate: new Date().toISOString().slice(0, 10) });
    // Refresh selected
    const updated = getTransfers().find(t => t.id === id);
    if (updated) setSelected(updated);
    toast('Transfer marked as shipped');
  };

  const markReceived = (id) => {
    updateTransfer(id, { status: 'Received', receivedDate: new Date().toISOString().slice(0, 10), receivedBy: 'Josie' });
    // Refresh selected
    const updated = getTransfers().find(t => t.id === id);
    if (updated) setSelected(updated);
    toast('Transfer received and inventory updated');
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Transfers
            <HelpBubble text="Transfers move products between your warehouse and the gift shop." />
          </h1>
          <p className="admin-page-subtitle">Move products between your warehouse and the gift shop. Mark items shipped and received to keep stock accurate.</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <button className="admin-btn admin-btn-gold" onClick={() => setCreating(true)}>
            + New Transfer
          </button>
          <HelpBubble text="Create a transfer when you're sending products to another location." />
        </div>
      </div>

      {/* Transfer List */}
      <div className="admin-table-wrap">
        {transfers.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">&#8644;</div>
            <div className="admin-empty-text">No transfers yet</div>
            <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 4 }}>Create a transfer when you need to move products between the warehouse and gift shop.</p>
          </div>
        ) : (
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
                  <td>
                    <span className={`badge ${statusClass[t.status]}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {t.status}
                      {t.status === 'Pending' && <HelpBubble text="Waiting to be shipped." />}
                      {t.status === 'In Transit' && <HelpBubble text="On its way to the destination." />}
                      {t.status === 'Received' && <HelpBubble text="Arrived and stock has been updated." />}
                    </span>
                  </td>
                  <td>{t.createdDate}</td>
                  <td>{t.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Transfer Drawer */}
      {creating && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setCreating(false)} />
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">New Transfer</span>
              <button className="admin-drawer-close" onClick={() => setCreating(false)}>&#10005;</button>
            </div>
            <div className="admin-drawer-body">
              <div className="admin-grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <label className="admin-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    From
                    <HelpBubble text="Where the items are coming from and going to." />
                  </label>
                  <select className="admin-select" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}>
                    {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    To
                    <HelpBubble text="Where the items are coming from and going to." />
                  </label>
                  <select className="admin-select" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}>
                    {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              {form.from === form.to && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, color: '#EF4444', fontSize: 14 }}>
                  From and To locations must be different
                </div>
              )}

              <label className="admin-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Add Products
                <HelpBubble text="Search for the products you want to transfer. Click to add them." />
              </label>
              <input
                className="admin-input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              {searchResults.length > 0 && (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                  {searchResults.map(r => (
                    <button
                      key={r.id}
                      onClick={() => addToTransfer(r)}
                      disabled={!!form.items.find(i => i.id === r.id)}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', background: 'transparent',
                        border: 'none', borderBottom: '1px solid #FAFAF8',
                        color: form.items.find(i => i.id === r.id) ? '#94A3B8' : '#1E293B',
                        cursor: form.items.find(i => i.id === r.id) ? 'default' : 'pointer',
                        font: '400 15px -apple-system, BlinkMacSystemFont, sans-serif', textAlign: 'left',
                      }}
                    >
                      {r.name} &mdash; {r.variant}
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
                        <button className="admin-receive-qty-btn" onClick={() => updateTransferQty(i.id, i.transferQty - 1)}>&#8722;</button>
                        <input className="admin-receive-qty-input" type="number" min="1" value={i.transferQty} onChange={e => updateTransferQty(i.id, parseInt(e.target.value) || 1)} />
                        <button className="admin-receive-qty-btn" onClick={() => updateTransferQty(i.id, i.transferQty + 1)}>+</button>
                      </div>
                      <button className="admin-receive-remove" onClick={() => removeFromTransfer(i.id)}>&#10005;</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label className="admin-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Notes
                  <HelpBubble text="Add any notes about this transfer for your records." />
                </label>
                <textarea className="admin-textarea" placeholder="Transfer notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <button
                className="admin-btn admin-btn-gold admin-btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={form.items.length === 0 || form.from === form.to}
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
              <button className="admin-drawer-close" onClick={() => setSelected(null)}>&#10005;</button>
            </div>
            <div className="admin-drawer-body">
              <div className="admin-grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">From</div>
                  <p style={{ color: '#1E293B', fontSize: 15 }}>{selected.from}</p>
                </div>
                <div>
                  <div className="admin-label">To</div>
                  <p style={{ color: '#1E293B', fontSize: 15 }}>{selected.to}</p>
                </div>
              </div>
              <div className="admin-grid-3" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">Status</div>
                  <span className={`badge ${statusClass[selected.status]}`}>{selected.status}</span>
                </div>
                <div>
                  <div className="admin-label">Created</div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{selected.createdDate}</p>
                </div>
                <div>
                  <div className="admin-label">By</div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{selected.createdBy}</p>
                </div>
              </div>
              {selected.shippedDate && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Shipped Date</div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{selected.shippedDate}</p>
                </div>
              )}
              {selected.receivedDate && (
                <div className="admin-grid-2" style={{ marginBottom: 20 }}>
                  <div>
                    <div className="admin-label">Received Date</div>
                    <p style={{ color: '#64748B', fontSize: 14 }}>{selected.receivedDate}</p>
                  </div>
                  <div>
                    <div className="admin-label">Received By</div>
                    <p style={{ color: '#64748B', fontSize: 14 }}>{selected.receivedBy}</p>
                  </div>
                </div>
              )}
              {selected.notes && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Notes</div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{selected.notes}</p>
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
                        <td style={{ fontFamily: 'monospace', fontSize: 14 }}>{item.sku}</td>
                        <td className="text-gold">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selected.status === 'Pending' && (
                <button
                  className="admin-btn admin-btn-gold admin-btn-lg"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 16, display: 'inline-flex', alignItems: 'center' }}
                  onClick={() => markShipped(selected.id)}
                >
                  Mark as Shipped
                  <HelpBubble text="Click when items leave the sending location." />
                </button>
              )}
              {selected.status === 'In Transit' && (
                <button
                  className="admin-btn admin-btn-gold admin-btn-lg"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 16, display: 'inline-flex', alignItems: 'center' }}
                  onClick={() => markReceived(selected.id)}
                >
                  Mark as Received
                  <HelpBubble text="Click when items arrive. This updates stock counts at both locations." />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
