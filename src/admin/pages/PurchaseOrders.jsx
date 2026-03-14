import { useState, useEffect } from 'react';
import { getPurchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, getInventory, VENDORS, formatPrice, subscribe } from '../data/store';
import { useToast } from '../AdminLayout';
import Wizard from '../components/Wizard';
import HelpBubble, { LabelWithHelp } from '../components/HelpBubble';
import { undoable } from '../components/UndoSystem';

const statusClass = { Draft: 'badge-gray', Ordered: 'badge-blue', 'In Production': 'badge-purple', Shipped: 'badge-gold', Received: 'badge-green' };
const STATUS_FLOW = ['Draft', 'Ordered', 'In Production', 'Shipped', 'Received'];

const VENDOR_INFO = {
  printify: { name: 'Printify', desc: 'Print-on-demand products and apparel', icon: '\uD83D\uDDA8\uFE0F' },
  wholesale: { name: 'Wholesale Astronomy Goods', desc: 'Telescopes, star charts, and science gear', icon: '\uD83D\uDD2D' },
  local: { name: 'Local Artisans Co-op', desc: 'Handmade local art and crafts', icon: '\uD83C\uDFA8' },
};

const inputStyle = {
  width: '100%', padding: '14px 16px', height: 48, background: '#FFFFFF',
  border: '1px solid #E2E8F0', borderRadius: 12,
  font: '400 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'flex', alignItems: 'center',
  font: '500 13px -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '1px',
  textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8,
};

const cardSelectorStyle = (selected) => ({
  padding: '20px', textAlign: 'left', cursor: 'pointer',
  background: '#FFFFFF',
  border: `2px solid ${selected ? '#D4AF37' : '#E2E8F0'}`,
  borderRadius: 12, transition: 'all 0.2s',
  boxShadow: selected ? '0 0 0 3px rgba(212,175,55,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
  width: '100%',
});

export default function PurchaseOrders() {
  const [, setTick] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ vendor: 'printify', items: [], expectedDate: '', notes: '' });
  const [search, setSearch] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  const pos = getPurchaseOrders();
  const inventory = getInventory();

  const searchResults = search.length >= 2
    ? inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
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

  const resetForm = () => {
    setForm({ vendor: 'printify', items: [], expectedDate: '', notes: '' });
    setSearch('');
  };

  const submitPO = (status) => {
    if (form.items.length === 0) {
      toast('Add at least one product');
      return;
    }
    const total = form.items.reduce((s, i) => s + i.orderQty * i.unitCost, 0);
    const newPO = {
      vendor: VENDORS.find(v => v.id === form.vendor)?.name || form.vendor,
      status,
      items: form.items.map(i => ({ name: i.name, sku: i.sku, variant: i.variant, ordered: i.orderQty, received: 0, price: i.unitCost })),
      expectedDate: form.expectedDate || 'TBD',
      notes: form.notes,
      total,
    };
    addPurchaseOrder(newPO);
    setCreating(false);
    resetForm();
    toast(`Purchase order created as ${status}`);
  };

  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const nextStatusLabel = (current) => {
    const labels = { Draft: 'Mark Ordered', Ordered: 'Mark In Production', 'In Production': 'Mark Shipped', Shipped: 'Mark Received' };
    return labels[current];
  };

  const handleStatusUpdate = (id, newStatus) => {
    undoable(`PO status changed to ${newStatus}`, 'ds_purchase_orders', () => {
      const changes = { status: newStatus };
      if (newStatus === 'Received') changes.receivedDate = new Date().toISOString().slice(0, 10);
      if (newStatus === 'Shipped' && trackingInput) changes.tracking = trackingInput;
      updatePurchaseOrder(id, changes);
    });
    const updated = getPurchaseOrders().find(p => p.id === id);
    if (updated) setSelected(updated);
    setTrackingInput('');
    toast(`PO ${id} marked as ${newStatus}`);
  };

  const handleDelete = (id) => {
    undoable('Purchase order deleted', 'ds_purchase_orders', () => deletePurchaseOrder(id));
    setSelected(null);
    setConfirmDelete(null);
    toast('Purchase order deleted. You can undo from the notification.');
  };

  const runningTotal = form.items.reduce((s, i) => s + i.orderQty * i.unitCost, 0);

  const wizardSteps = [
    {
      label: 'Vendor',
      validate: () => {
        if (!form.vendor) { toast('Please select a vendor'); return false; }
        return true;
      },
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            Who are you ordering from?
          </h2>
          <LabelWithHelp help="Pick the vendor you're placing the order with." style={labelStyle}>
            Vendor
          </LabelWithHelp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {VENDORS.map(v => {
              const info = VENDOR_INFO[v.id] || { name: v.name, desc: '', icon: '\uD83D\uDCE6' };
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, vendor: v.id }))}
                  style={cardSelectorStyle(form.vendor === v.id)}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{info.icon}</div>
                  <div style={{ font: '600 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 4 }}>{v.name}</div>
                  <div style={{ font: '400 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>{info.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      label: 'Products',
      validate: () => {
        if (form.items.length === 0) { toast('Add at least one product'); return false; }
        return true;
      },
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            What do you need?
          </h2>

          <LabelWithHelp help="Search for products and add them to your order. Enter how many you need." style={labelStyle}>
            Add Products
          </LabelWithHelp>
          <input
            style={{ ...inputStyle, marginBottom: 8 }}
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 20, background: '#FFFFFF' }}>
              {searchResults.map(r => (
                <button key={r.id} onClick={() => addToPO(r)} disabled={!!form.items.find(i => i.id === r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '12px 16px', background: 'transparent', border: 'none',
                    borderBottom: '1px solid #F1F5F9',
                    color: form.items.find(i => i.id === r.id) ? '#94A3B8' : '#1E293B',
                    cursor: form.items.find(i => i.id === r.id) ? 'default' : 'pointer',
                    font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ flex: 1 }}>{r.name} -- {r.variant}</span>
                  {form.items.find(i => i.id === r.id)
                    ? <span style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>Already added</span>
                    : <span style={{ font: '500 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37' }}>+ Add</span>
                  }
                </button>
              ))}
            </div>
          )}

          {form.items.length > 0 && (
            <div>
              <div style={{ font: '500 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Order Items ({form.items.length})
              </div>
              {form.items.map(i => (
                <div key={i.id} style={{
                  background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
                  padding: 16, marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
                }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>{i.name}</div>
                    <div style={{ font: '400 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>{i.variant}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div>
                      <div style={{ font: '500 11px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Qty</div>
                      <input
                        style={{ ...inputStyle, width: 80, textAlign: 'center', height: 40 }}
                        type="number" min="1" value={i.orderQty}
                        onChange={e => updatePOItem(i.id, 'orderQty', e.target.value)}
                      />
                    </div>
                    <div>
                      <div style={{ font: '500 11px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Unit Cost</div>
                      <input
                        style={{ ...inputStyle, width: 90, textAlign: 'center', height: 40 }}
                        type="number" min="0" value={i.unitCost}
                        onChange={e => updatePOItem(i.id, 'unitCost', e.target.value)}
                      />
                    </div>
                    <div style={{ font: '600 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37', minWidth: 70, textAlign: 'right' }}>
                      {formatPrice(i.orderQty * i.unitCost)}
                    </div>
                    <button onClick={() => removePOItem(i.id)} style={{
                      width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0',
                      background: 'transparent', color: '#EF4444', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>{'\u2715'}</button>
                  </div>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12,
                padding: '16px 0', borderTop: '2px solid #E2E8F0', marginTop: 8,
              }}>
                <span style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#64748B' }}>Running Total:</span>
                <span style={{ font: '700 18px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37' }}>{formatPrice(runningTotal)}</span>
              </div>
            </div>
          )}

          {form.items.length === 0 && (
            <div style={{
              background: '#FFFFFF', border: '1px dashed #E2E8F0', borderRadius: 12,
              padding: '40px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{'\uD83D\uDCE6'}</div>
              <p style={{ font: '400 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>
                Search for products above to add them to this order.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'Details',
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            When and notes
          </h2>

          <div style={{ marginBottom: 24 }}>
            <LabelWithHelp help="When do you expect this order to arrive?" style={labelStyle}>
              Expected Delivery Date
            </LabelWithHelp>
            <input
              style={{ ...inputStyle, maxWidth: 300 }}
              type="date"
              value={form.expectedDate}
              onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))}
            />
          </div>

          <div>
            <LabelWithHelp help="Any additional notes about this purchase order." style={labelStyle}>
              Notes
            </LabelWithHelp>
            <textarea
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.7, height: 'auto' }}
              placeholder="PO notes, special instructions, etc..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
      ),
    },
    {
      label: 'Review',
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            Review your order
          </h2>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 16px', font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', marginBottom: 20 }}>
              <span style={{ color: '#94A3B8' }}>Vendor</span>
              <span style={{ color: '#1E293B', fontWeight: 500 }}>{VENDORS.find(v => v.id === form.vendor)?.name || form.vendor}</span>
              <span style={{ color: '#94A3B8' }}>Expected</span>
              <span style={{ color: '#1E293B' }}>{form.expectedDate || 'TBD'}</span>
              {form.notes && (
                <>
                  <span style={{ color: '#94A3B8' }}>Notes</span>
                  <span style={{ color: '#1E293B' }}>{form.notes}</span>
                </>
              )}
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
              <div style={{ font: '500 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Line Items
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 12px', font: '500 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #E2E8F0' }}>Product</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', font: '500 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #E2E8F0' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', font: '500 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #E2E8F0' }}>Unit</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', font: '500 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #E2E8F0' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map(i => (
                    <tr key={i.id}>
                      <td style={{ padding: '10px 12px', font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>{i.name}<br/><span style={{ fontSize: 12, color: '#94A3B8' }}>{i.variant}</span></td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1E293B' }}>{i.orderQty}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B' }}>{formatPrice(i.unitCost)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1E293B', fontWeight: 500 }}>{formatPrice(i.orderQty * i.unitCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{
                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12,
                padding: '16px 12px 0', borderTop: '2px solid #E2E8F0', marginTop: 4,
              }}>
                <span style={{ font: '600 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>Total:</span>
                <span style={{ font: '700 20px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37' }}>{formatPrice(runningTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center' }}>
            Purchase Orders
            <HelpBubble text="Purchase orders track what you're buying from vendors. Create one before placing an order." />
          </h1>
          <p className="admin-page-subtitle">{pos.length} purchase orders</p>
        </div>
        <button className="admin-btn admin-btn-gold admin-btn-lg" style={{ height: 48 }} onClick={() => setCreating(true)}>
          + New Purchase Order
        </button>
      </div>

      {/* PO Cards / Table */}
      {pos.length === 0 ? (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
          padding: '60px 40px', textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDCE6'}</div>
          <div style={{ font: '500 18px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 8 }}>
            No purchase orders yet
          </div>
          <p style={{ font: '400 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 24 }}>
            Create a purchase order to restock inventory
          </p>
          <button className="admin-btn admin-btn-gold admin-btn-lg" onClick={() => setCreating(true)} style={{ height: 48 }}>
            + Create First PO
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {pos.map(po => (
            <div key={po.id} onClick={() => { setSelected(po); setTrackingInput(''); setConfirmDelete(null); }} style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
              padding: 24, cursor: 'pointer', transition: 'box-shadow 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ font: '600 16px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 4 }}>{po.id}</div>
                  <div style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>{po.vendor}</div>
                </div>
                <span className={`badge ${statusClass[po.status]}`}>{po.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 0 }}>
                <div>
                  <div style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 2 }}>Items</div>
                  <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>{po.items.length} line{po.items.length > 1 ? 's' : ''}</div>
                </div>
                <div>
                  <div style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 2 }}>Total</div>
                  <div style={{ font: '600 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37' }}>{formatPrice(po.total)}</div>
                </div>
                <div>
                  <div style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 2 }}>Expected</div>
                  <div style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>{po.expectedDate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create PO Wizard Drawer */}
      {creating && (
        <>
          <div className="admin-drawer-overlay" onClick={() => { setCreating(false); resetForm(); }} />
          <div className="admin-drawer" style={{ maxWidth: 680 }}>
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">New Purchase Order</span>
              <button className="admin-drawer-close" onClick={() => { setCreating(false); resetForm(); }}>{'\u2715'}</button>
            </div>
            <div className="admin-drawer-body">
              <Wizard
                steps={wizardSteps}
                onComplete={() => submitPO('Ordered')}
                onSaveDraft={() => submitPO('Draft')}
                completeBtnText="Submit Order"
                draftBtnText="Save as Draft"
              />
            </div>
          </div>
        </>
      )}

      {/* PO Detail Drawer */}
      {selected && (
        <>
          <div className="admin-drawer-overlay" onClick={() => { setSelected(null); setConfirmDelete(null); }} />
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">{selected.id}</span>
              <button className="admin-drawer-close" onClick={() => { setSelected(null); setConfirmDelete(null); }}>{'\u2715'}</button>
            </div>
            <div className="admin-drawer-body">
              <div className="admin-grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">Vendor</div>
                  <p style={{ color: '#1E293B', fontSize: 15 }}>{selected.vendor}</p>
                </div>
                <div>
                  <div className="admin-label">Status</div>
                  <span className={`badge ${statusClass[selected.status]}`}>{selected.status}</span>
                </div>
              </div>

              {/* Status progression */}
              <div style={{ marginBottom: 20 }}>
                <div className="admin-label" style={{ marginBottom: 10 }}>Status Progression</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {STATUS_FLOW.map((s, idx) => {
                    const currentIdx = STATUS_FLOW.indexOf(selected.status);
                    const done = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', flex: idx < STATUS_FLOW.length - 1 ? 1 : 'none' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: done ? (isCurrent ? '#D4AF37' : '#10B981') : '#F1F5F9',
                          border: `2px solid ${done ? (isCurrent ? '#D4AF37' : '#10B981') : '#E2E8F0'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          font: '600 10px -apple-system, BlinkMacSystemFont, sans-serif',
                          color: done ? '#FFFFFF' : '#94A3B8',
                        }}>
                          {done && !isCurrent ? '\u2713' : (idx + 1)}
                        </div>
                        {idx < STATUS_FLOW.length - 1 && (
                          <div style={{ flex: 1, height: 2, background: idx < currentIdx ? '#10B981' : '#E2E8F0', margin: '0 6px', minWidth: 12 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  {STATUS_FLOW.map(s => (
                    <span key={s} style={{ font: '400 10px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', textAlign: 'center', flex: 1 }}>{s}</span>
                  ))}
                </div>
              </div>

              <div className="admin-grid-3" style={{ marginBottom: 20 }}>
                <div>
                  <div className="admin-label">Created</div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{selected.createdDate}</p>
                </div>
                <div>
                  <div className="admin-label">Expected</div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{selected.expectedDate}</p>
                </div>
                <div>
                  <div className="admin-label">Total</div>
                  <p style={{ color: '#D4AF37', fontSize: 15, fontWeight: 600 }}>{formatPrice(selected.total)}</p>
                </div>
              </div>
              {selected.tracking && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Tracking</div>
                  <p style={{ color: '#64748B', fontSize: 14, fontFamily: 'monospace' }}>{selected.tracking}</p>
                </div>
              )}
              {selected.notes && (
                <div style={{ marginBottom: 20 }}>
                  <div className="admin-label">Notes</div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{selected.notes}</p>
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
                          <div style={{ color: '#1E293B', fontWeight: 500 }}>{item.name}</div>
                          <div style={{ fontSize: 14, color: '#94A3B8' }}>{item.variant}</div>
                        </td>
                        <td>{item.ordered}</td>
                        <td style={{ color: item.received >= item.ordered ? '#10B981' : '#64748B' }}>{item.received}</td>
                        <td>{formatPrice(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tracking input for In Production -> Shipped */}
              {selected.status === 'In Production' && (
                <div style={{ marginTop: 16, marginBottom: 8 }}>
                  <LabelWithHelp help="Optional tracking number for the shipment." style={labelStyle}>
                    Tracking Number (optional)
                  </LabelWithHelp>
                  <input
                    style={inputStyle}
                    placeholder="Enter tracking number..."
                    value={trackingInput}
                    onChange={e => setTrackingInput(e.target.value)}
                  />
                </div>
              )}

              {selected.status !== 'Received' && nextStatus(selected.status) && (
                <button className="admin-btn admin-btn-gold admin-btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 16, height: 48 }} onClick={() => handleStatusUpdate(selected.id, nextStatus(selected.status))}>
                  {nextStatusLabel(selected.status)}
                </button>
              )}

              {/* Delete button for Draft POs */}
              {selected.status === 'Draft' && (
                <>
                  {confirmDelete === selected.id ? (
                    <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: 16 }}>
                      <p style={{ color: '#EF4444', fontSize: 14, marginBottom: 12 }}>Are you sure you want to delete {selected.id}? You can undo this action.</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="admin-btn admin-btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                        <button
                          className="admin-btn admin-btn-lg"
                          style={{ flex: 1, justifyContent: 'center', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                          onClick={() => handleDelete(selected.id)}
                        >
                          Delete Purchase Order
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="admin-btn admin-btn-ghost admin-btn-lg"
                      style={{ width: '100%', justifyContent: 'center', marginTop: 8, color: '#EF4444', height: 48 }}
                      onClick={() => setConfirmDelete(selected.id)}
                    >
                      Delete Draft
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
