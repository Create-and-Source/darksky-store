import { useState, useRef, useEffect } from 'react';
import { INVENTORY, LOCATIONS } from '../data/mockData';
import { useToast } from '../AdminLayout';

export default function Receive() {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState('');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const searchRef = useRef(null);
  const toast = useToast();

  // Auto-focus search (barcode scanner)
  useEffect(() => {
    if (step === 2 && searchRef.current) searchRef.current.focus();
  }, [step]);

  const searchResults = search.length >= 2
    ? INVENTORY.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  const addItem = (inv) => {
    if (items.find(i => i.id === inv.id)) return;
    setItems(prev => [...prev, { ...inv, receiveQty: 1 }]);
    setSearch('');
  };

  const updateQty = (id, qty) => {
    if (qty < 1) qty = 1;
    setItems(prev => prev.map(i => i.id === id ? { ...i, receiveQty: qty } : i));
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      toast(`Received ${items.reduce((s, i) => s + i.receiveQty, 0)} items at ${LOCATIONS.find(l => l.id === location)?.name}`);
    }, 1200);
  };

  const reset = () => {
    setStep(1);
    setLocation('');
    setItems([]);
    setSearch('');
    setNotes('');
    setReference('');
    setDone(false);
  };

  const stepLabels = ['Location', 'Add Products', 'Quantities', 'Details', 'Confirm'];
  const canProceed = () => {
    if (step === 1) return !!location;
    if (step === 2) return items.length > 0;
    if (step === 3) return items.every(i => i.receiveQty > 0);
    if (step === 4) return true;
    return false;
  };

  if (done) {
    const locName = LOCATIONS.find(l => l.id === location)?.name;
    return (
      <div className="admin-confirm">
        <div className="admin-confirm-icon">✓</div>
        <h2 className="admin-confirm-title">Stock Received Successfully</h2>
        <p className="admin-confirm-sub">
          {items.reduce((s, i) => s + i.receiveQty, 0)} items received at {locName}
          {reference && <><br />Reference: {reference}</>}
        </p>
        <div className="admin-table-wrap" style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto 24px' }}>
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Variant</th><th>Qty</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td className="text-white">{i.name}</td>
                  <td>{i.variant}</td>
                  <td className="text-gold">+{i.receiveQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="admin-btn admin-btn-gold admin-btn-lg" onClick={reset}>
          Receive More Stock
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Receive Stock</h1>
          <p className="admin-page-subtitle">Record incoming shipments</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="admin-stepper">
        {stepLabels.map((label, i) => {
          const n = i + 1;
          const cls = n < step ? 'done' : n === step ? 'active' : '';
          return (
            <span key={n} style={{ display: 'contents' }}>
              <div className={`admin-step ${cls}`}>
                <span className="admin-step-num">{n < step ? '✓' : n}</span>
                {label}
              </div>
              {n < 5 && <div className="admin-step-line" />}
            </span>
          );
        })}
      </div>

      <div className="admin-panel" style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Step 1: Location */}
        {step === 1 && (
          <>
            <div className="admin-panel-title">Select Receiving Location</div>
            <div className="admin-grid-2" style={{ gap: 12 }}>
              {LOCATIONS.map(loc => (
                <button
                  key={loc.id}
                  className={`admin-btn admin-btn-lg ${location === loc.id ? 'admin-btn-gold' : 'admin-btn-ghost'}`}
                  style={{ justifyContent: 'center', padding: 24, fontSize: 15 }}
                  onClick={() => setLocation(loc.id)}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Scan/Search */}
        {step === 2 && (
          <>
            <div className="admin-panel-title">Scan or Search Products</div>
            <input
              ref={searchRef}
              className="admin-input admin-input-lg"
              placeholder="Scan barcode or type product name / SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            {searchResults.length > 0 && (
              <div style={{ marginTop: 8, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
                {searchResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => addItem(r)}
                    disabled={!!items.find(i => i.id === r.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', padding: '12px 14px', background: 'transparent',
                      border: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)',
                      color: items.find(i => i.id === r.id) ? '#5a5550' : '#e8e4df',
                      cursor: items.find(i => i.id === r.id) ? 'default' : 'pointer',
                      font: '400 13px DM Sans', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!items.find(i => i.id === r.id)) e.target.style.background = 'rgba(212,175,55,0.04)'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                  >
                    <span style={{ flex: 1 }}>{r.name} — {r.variant}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#5a5550' }}>{r.sku}</span>
                    {items.find(i => i.id === r.id) && <span style={{ color: '#4ade80', fontSize: 11 }}>Added</span>}
                  </button>
                ))}
              </div>
            )}
            {items.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div className="admin-label" style={{ marginBottom: 8 }}>{items.length} item{items.length > 1 ? 's' : ''} added</div>
                {items.map(i => (
                  <div key={i.id} className="admin-receive-item">
                    <div className="admin-receive-item-info">
                      <div className="admin-receive-item-name">{i.name}</div>
                      <div className="admin-receive-item-sku">{i.variant} · {i.sku}</div>
                    </div>
                    <button className="admin-receive-remove" onClick={() => removeItem(i.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 3: Quantities */}
        {step === 3 && (
          <>
            <div className="admin-panel-title">Enter Quantities</div>
            {items.map(i => (
              <div key={i.id} className="admin-receive-item">
                <div className="admin-receive-item-info">
                  <div className="admin-receive-item-name">{i.name}</div>
                  <div className="admin-receive-item-sku">{i.variant} · {i.sku}</div>
                </div>
                <div className="admin-receive-qty">
                  <button className="admin-receive-qty-btn" onClick={() => updateQty(i.id, i.receiveQty - 1)}>−</button>
                  <input
                    className="admin-receive-qty-input"
                    type="number"
                    min="1"
                    value={i.receiveQty}
                    onChange={e => updateQty(i.id, parseInt(e.target.value) || 1)}
                  />
                  <button className="admin-receive-qty-btn" onClick={() => updateQty(i.id, i.receiveQty + 1)}>+</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <>
            <div className="admin-panel-title">Add Details</div>
            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Reference (PO Number or Supplier)</label>
              <input className="admin-input" placeholder="e.g. PO-0045 or Printify" value={reference} onChange={e => setReference(e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Notes</label>
              <textarea className="admin-textarea" placeholder="Any notes about this shipment..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <>
            <div className="admin-panel-title">Review & Submit</div>
            <div style={{ marginBottom: 16 }}>
              <div className="admin-label">Location</div>
              <p style={{ color: '#e8e4df', fontSize: 14 }}>{LOCATIONS.find(l => l.id === location)?.name}</p>
            </div>
            {reference && (
              <div style={{ marginBottom: 16 }}>
                <div className="admin-label">Reference</div>
                <p style={{ color: '#e8e4df', fontSize: 14 }}>{reference}</p>
              </div>
            )}
            <div className="admin-label" style={{ marginBottom: 8 }}>Items ({items.reduce((s, i) => s + i.receiveQty, 0)} total)</div>
            {items.map(i => (
              <div key={i.id} className="admin-receive-item">
                <div className="admin-receive-item-info">
                  <div className="admin-receive-item-name">{i.name}</div>
                  <div className="admin-receive-item-sku">{i.variant}</div>
                </div>
                <span style={{ color: '#d4af37', fontWeight: 600, fontSize: 15 }}>×{i.receiveQty}</span>
              </div>
            ))}
          </>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
          {step > 1 ? (
            <button className="admin-btn admin-btn-ghost" onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          ) : <div />}
          {step < 5 ? (
            <button className="admin-btn admin-btn-gold admin-btn-lg" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
              Continue
            </button>
          ) : (
            <button className="admin-btn admin-btn-gold admin-btn-lg" disabled={submitting} onClick={handleSubmit}>
              {submitting ? <><span className="admin-spinner" /> Receiving...</> : 'Receive Stock'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
