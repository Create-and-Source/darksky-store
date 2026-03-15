import { useState, useEffect, useCallback } from 'react';
import Barcode from 'react-barcode';
import { useToast } from '../AdminLayout';
import PageTour from '../components/PageTour';
import { getProducts, subscribe } from '../data/store';

// ── Design Tokens ──
const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const CATEGORIES = ['Apparel', 'Kids', 'Outerwear', 'Tanks', 'Gifts'];

function saveProducts(products) {
  localStorage.setItem('ds_products', JSON.stringify(products));
  window.dispatchEvent(new Event('storage'));
}

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

const emptyProduct = {
  title: '', description: '', category: 'Apparel', type: 'pod',
  price: '', images: [''], tags: '',
};

export default function Products() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('list'); // 'list' | 'form'
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'price'
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const reload = useCallback(() => setProducts(getProducts()), []);

  useEffect(() => {
    reload();
    const unsub = subscribe(reload);
    return unsub;
  }, [reload]);

  // Counts
  const podCount = products.filter(p => p.type !== 'physical').length;
  const physCount = products.filter(p => p.type === 'physical').length;

  // Filtered + sorted
  const filtered = products
    .filter(p => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== 'All' && p.category !== catFilter) return false;
      if (typeFilter === 'POD' && p.type === 'physical') return false;
      if (typeFilter === 'Physical' && p.type !== 'physical') return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      return a.title.localeCompare(b.title);
    });

  // Edit
  const startEdit = (p) => {
    setForm({
      title: p.title || '',
      description: p.description || '',
      category: p.category || 'Apparel',
      type: p.type === 'physical' ? 'physical' : 'pod',
      price: p.price ? (p.price / 100).toFixed(2) : '',
      images: p.images?.length ? [p.images[0]] : [''],
      tags: (p.tags || []).join(', '),
    });
    setEditId(p.id);
    setTab('form');
  };

  const startAdd = () => {
    setForm({ ...emptyProduct });
    setEditId(null);
    setTab('form');
  };

  // Save
  const handleSave = () => {
    if (!form.title.trim()) { toast('Product name is required', 'warning'); return; }
    const priceInCents = Math.round(parseFloat(form.price || 0) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) { toast('Enter a valid price', 'warning'); return; }

    const productData = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      type: form.type === 'physical' ? 'physical' : undefined,
      price: priceInCents,
      images: form.images.filter(u => u.trim()),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    const all = [...products];
    if (editId) {
      const idx = all.findIndex(p => p.id === editId);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...productData };
        saveProducts(all);
        toast('Product updated', 'success');
      }
    } else {
      const newId = `PROD-${Date.now().toString(36).toUpperCase()}`;
      all.unshift({ id: newId, ...productData });
      saveProducts(all);
      toast('Product added', 'success');
    }
    setProducts(all);
    setTab('list');
    setEditId(null);
  };

  // Delete
  const handleDelete = (id) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
    setProducts(updated);
    setConfirmDelete(null);
    toast('Product deleted', 'success');
  };

  const printBarcodes = () => {
    const physicals = products.filter(p => p.type === 'physical');
    if (physicals.length === 0) { toast('No physical products to print', 'warning'); return; }
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Barcode Labels — Dark Sky Gift Shop</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; padding: 20px; }
  h1 { font-size: 16px; color: #1A1A2E; margin-bottom: 4px; }
  .subtitle { font: 400 12px 'JetBrains Mono', monospace; color: #7C7B76; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .label { border: 1px dashed #D0D0D0; border-radius: 6px; padding: 14px 12px; text-align: center; break-inside: avoid; }
  .label svg { margin: 0 auto 6px; display: block; }
  .name { font: 600 11px 'Inter', sans-serif; color: #1A1A2E; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .id { font: 500 9px 'JetBrains Mono', monospace; color: #7C7B76; letter-spacing: 0.5px; }
  .price { font: 600 11px 'Inter', sans-serif; color: #C5A55A; margin-top: 2px; }
  @media print {
    body { padding: 0; }
    h1, .subtitle, .no-print { display: none; }
    .grid { gap: 0; }
    .label { border: 1px dotted #ccc; border-radius: 0; padding: 10px 8px; }
  }
</style>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
</head><body>
<h1>Barcode Labels — Dark Sky Gift Shop</h1>
<p class="subtitle">${physicals.length} labels · ${new Date().toLocaleDateString()}</p>
<button class="no-print" onclick="window.print()" style="margin-bottom:16px;padding:10px 24px;background:#C5A55A;color:#fff;border:none;border-radius:8px;font:600 14px Inter,sans-serif;cursor:pointer;">Print Labels</button>
<div class="grid">
${physicals.map(p => `<div class="label"><svg class="bc" data-value="${p.id}"></svg><div class="name">${p.title}</div><div class="id">${p.id}</div><div class="price">$${(p.price / 100).toFixed(2)}</div></div>`).join('')}
</div>
<script>document.querySelectorAll('.bc').forEach(el => { try { JsBarcode(el, el.dataset.value, { width: 1.5, height: 40, fontSize: 10, margin: 2, displayValue: true, font: 'JetBrains Mono' }); } catch(e) {} });<\/script>
</body></html>`);
    win.document.close();
  };

  return (
    <div style={{ fontFamily: FONT, padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <PageTour storageKey="ds_tour_products" steps={[
        { target: '#tour-products-table', title: 'Product List', text: 'All your products are listed here with images, categories, types, and prices.' },
        { target: '#tour-products-add', title: 'Add Product', text: 'Click here to add a new product to your catalog, or use the tabs to switch to the add/edit form.' },
      ]} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Products</h1>
          <p style={{ fontSize: 13, color: C.text2, margin: '4px 0 0', fontFamily: MONO }}>
            {products.length} products ({podCount} POD, {physCount} Physical)
          </p>
        </div>
        {tab === 'list' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={printBarcodes} style={{ ...btnStyle, background: C.card, color: C.text, border: `1px solid ${C.border}`, padding: '10px 16px', fontSize: 13 }}>
              Print Barcodes
            </button>
            <button id="tour-products-add" onClick={startAdd} style={{ ...btnStyle, background: C.gold, color: '#fff', padding: '10px 20px' }}>
              + Add Product
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
        {[['list', 'All Products'], ['form', editId ? 'Edit Product' : 'Add Product']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => { if (key === 'list') { setTab('list'); setEditId(null); } }}
            style={{
              padding: '12px 20px', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: FONT,
              background: 'transparent', color: tab === key ? C.gold : C.text2,
              borderBottom: tab === key ? `2px solid ${C.gold}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'list' ? (
        <>
          {/* Filters Row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 38, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
              <option value="All">All Types</option>
              <option value="POD">POD</option>
              <option value="Physical">Physical</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
            </select>
          </div>

          {/* Table */}
          <div id="tour-products-table" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: C.shadow }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['', 'Name', 'Category', 'Type', 'Price', 'Barcode', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                      color: C.text2, fontFamily: MONO, textTransform: 'uppercase', letterSpacing: '0.05em',
                      ...(h === '' && i === 0 ? { width: 56 } : {}),
                      ...(h === '' && i === 5 ? { width: 140, textAlign: 'right' } : {}),
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}20` }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.bg}`}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '8px 14px' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 6, background: '#f5f4f0', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: C.gold, fontSize: 16 }}>✦</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: C.text, maxWidth: 280 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 12, color: C.text2 }}>{p.category || '—'}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                        fontSize: 11, fontWeight: 600, fontFamily: MONO,
                        background: p.type === 'physical' ? 'rgba(59,130,246,0.1)' : `${C.gold}15`,
                        color: p.type === 'physical' ? '#3B82F6' : C.gold,
                      }}>
                        {p.type === 'physical' ? 'Physical' : 'POD'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: C.text, fontFamily: MONO }}>
                      {formatPrice(p.price)}
                    </td>
                    <td style={{ padding: '4px 14px' }}>
                      {p.type === 'physical' ? (
                        <Barcode value={p.id} width={1} height={30} fontSize={8} margin={0} displayValue={false} />
                      ) : (
                        <span style={{ fontSize: 10, color: C.muted }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => startEdit(p)} style={{ ...smallBtnStyle, color: C.gold, border: `1px solid ${C.gold}40` }}>
                          Edit
                        </button>
                        {confirmDelete === p.id ? (
                          <>
                            <button onClick={() => handleDelete(p.id)} style={{ ...smallBtnStyle, background: C.danger, color: '#fff', border: 'none' }}>
                              Confirm
                            </button>
                            <button onClick={() => setConfirmDelete(null)} style={{ ...smallBtnStyle, color: C.text2 }}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDelete(p.id)} style={{ ...smallBtnStyle, color: C.danger, border: `1px solid ${C.danger}40` }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>
                No products match your filters
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 10, fontFamily: MONO }}>
            Showing {filtered.length} of {products.length} products
          </div>
        </>
      ) : (
        /* ── Add/Edit Form ── */
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 28, maxWidth: 640, boxShadow: C.shadow }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 20px' }}>
            {editId ? 'Edit Product' : 'New Product'}
          </h2>

          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Name *</label>
            <input
              type="text" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Product name"
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Product description..."
              rows={3}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: FONT }}
            />
          </div>

          {/* Category + Type row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Type</label>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                {[['pod', 'Print on Demand'], ['physical', 'Physical']].map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: C.text }}>
                    <input
                      type="radio" name="type" value={val}
                      checked={form.type === val}
                      onChange={() => setForm(f => ({ ...f, type: val }))}
                      style={{ accentColor: C.gold }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Price */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Price (USD)</label>
            <div style={{ position: 'relative', maxWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 14 }}>$</span>
              <input
                type="number" step="0.01" min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                style={{ ...inputStyle, paddingLeft: 28, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Image URL */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Image URL</label>
            <input
              type="text"
              value={form.images[0] || ''}
              onChange={e => setForm(f => ({ ...f, images: [e.target.value] }))}
              placeholder="https://..."
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            />
            {form.images[0] && (
              <div style={{ marginTop: 8 }}>
                <img src={form.images[0]} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: `1px solid ${C.border}` }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="e.g. astronomy, gift, kids"
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} style={{ ...btnStyle, background: C.gold, color: '#fff', padding: '12px 28px' }}>
              {editId ? 'Save Changes' : 'Add Product'}
            </button>
            <button onClick={() => { setTab('list'); setEditId(null); }} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, padding: '12px 28px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Styles ──
const inputStyle = {
  padding: '10px 12px',
  border: '1px solid #E8E5DF',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  background: '#fff',
  color: '#1A1A2E',
  transition: 'border-color 0.15s',
};

const btnStyle = {
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 14,
  transition: 'all 0.15s',
};

const smallBtnStyle = {
  padding: '5px 12px',
  borderRadius: 6,
  border: `1px solid #E8E5DF`,
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  transition: 'all 0.15s',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#7C7B76',
  fontFamily: "'JetBrains Mono', monospace",
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 6,
};
