import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../AdminLayout';
import PageTour from '../components/PageTour';
import {
  getProducts, getMembers, addOrder, adjustStock, addMovement,
  getHeldSales, addHeldSale, removeHeldSale, formatPrice, subscribe,
} from '../data/store';

// ── Design Tokens ──
const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const TAX_RATE = 0.086;
const CATEGORIES = ['All', 'Apparel', 'Kids', 'Outerwear', 'Tanks', 'Gifts'];
const MEMBER_DISCOUNTS = { Explorer: 0.10, Stargazer: 0.15, Guardian: 0.20 };

export default function POS() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState('current'); // 'current' | 'held'
  const [heldSales, setHeldSales] = useState([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [member, setMember] = useState(null);
  const [memberLookupDone, setMemberLookupDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [success, setSuccess] = useState(null); // {orderId, total} after charge
  const searchRef = useRef(null);

  const reload = useCallback(() => {
    setProducts(getProducts());
    setHeldSales(getHeldSales());
  }, []);

  useEffect(() => {
    reload();
    const unsub = subscribe(reload);
    return unsub;
  }, [reload]);

  useEffect(() => {
    if (searchRef.current) searchRef.current.focus();
  }, []);

  // Filter products
  const filtered = products.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  // Cart helpers
  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, title: p.title, price: p.price, qty: 1, image: p.images?.[0] || null }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newQty = i.qty + delta;
      return newQty < 1 ? null : { ...i, qty: newQty };
    }).filter(Boolean));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  // Totals
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountRate = member ? (MEMBER_DISCOUNTS[member.tier] || 0) : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const afterDiscount = subtotal - discountAmount;
  const tax = Math.round(afterDiscount * TAX_RATE);
  const total = afterDiscount + tax;

  // Member lookup — supports email, member ID, or QR code scan
  const lookupMember = (input) => {
    const q = (input || memberEmail).trim().toLowerCase();
    if (!q) return;
    const members = getMembers();
    // Try email match, then ID match, then name match
    const found = members.find(m => m.status === 'Active' && (
      m.email.toLowerCase() === q ||
      (m.id || '').toLowerCase() === q ||
      q.includes(m.id?.toLowerCase() || '') ||
      m.name.toLowerCase().includes(q)
    ));
    setMember(found || null);
    setMemberLookupDone(true);
    if (found) toast(`Member found: ${found.name} (${found.tier})`, 'success');
    else toast('No member found — try email, name, or scan QR', 'warning');
  };

  // Scan QR/barcode via camera
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const startScan = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      // Auto-stop after 10 seconds
      setTimeout(() => stopScan(), 10000);
    } catch { toast('Camera not available', 'error'); setScanning(false); }
  };
  const stopScan = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };
  const simulateScan = () => {
    // Demo: simulate scanning a member QR code
    stopScan();
    const members = getMembers();
    if (members.length > 0) {
      const m = members[0];
      setMemberEmail(m.id);
      lookupMember(m.id);
    }
  };

  // Charge
  const handleCharge = () => {
    if (cart.length === 0) return;
    const order = addOrder({
      items: cart.map(i => ({ name: i.title, sku: i.id, qty: i.qty, price: i.price })),
      total,
      tax,
      subtotal: afterDiscount,
      discount: discountAmount,
      channel: 'POS',
      paymentMethod,
      customer: member ? member.name : 'Walk-in',
      email: member ? member.email : '',
    });
    setSuccess({ orderId: order.id, total });
    setCart([]);
    setMember(null);
    setMemberEmail('');
    setMemberLookupDone(false);
  };

  // Hold sale
  const handleHold = () => {
    if (cart.length === 0) return;
    addHeldSale({ items: cart, subtotal, member: member ? { name: member.name, email: member.email, tier: member.tier } : null });
    toast('Sale held', 'success');
    setCart([]);
    setMember(null);
    setMemberEmail('');
    setMemberLookupDone(false);
  };

  // Resume held sale
  const resumeSale = (held) => {
    setCart(held.items);
    if (held.member) {
      setMember(held.member);
      setMemberEmail(held.member.email);
      setMemberLookupDone(true);
    }
    removeHeldSale(held.id);
    setTab('current');
    toast('Sale resumed', 'success');
  };

  // New sale (after success)
  const newSale = () => {
    setSuccess(null);
    setCart([]);
    setPaymentMethod('card');
  };

  // ── Success Screen ──
  if (success) {
    return (
      <div style={{ fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${C.success}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Sale Complete</h1>
          <p style={{ fontSize: 14, color: C.text2, margin: '0 0 4px' }}>Order {success.orderId}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: C.gold, margin: '0 0 32px' }}>{formatPrice(success.total)}</p>
          <button onClick={newSale} style={{ ...btnStyle, background: C.gold, color: '#fff', padding: '14px 48px', fontSize: 16 }}>
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <PageTour storageKey="ds_tour_pos" steps={[
        { target: '#tour-pos-products', title: 'Product Grid', text: 'Browse and tap products to add them to the current sale.' },
        { target: '#tour-pos-cart', title: 'Cart', text: 'Items you add appear here. Adjust quantities, apply member discounts, and choose a payment method.' },
        { target: '#tour-pos-checkout', title: 'Checkout', text: 'When ready, tap the Charge button to complete the sale.' },
      ]} />

      {/* ── LEFT: Products ── */}
      <div id="tour-pos-products" style={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {/* Search + Filters */}
        <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border}`, background: C.card }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search or scan barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 38, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontFamily: MONO, fontWeight: 600, letterSpacing: '0.02em',
                  background: category === c ? C.gold : `${C.border}80`,
                  color: category === c ? '#fff' : C.text2,
                  transition: 'all 0.15s',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                style={{
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
                  boxShadow: C.shadow, transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', minHeight: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = C.gold; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = C.shadow; e.currentTarget.style.borderColor = C.border; }}
              >
                <div style={{
                  width: '100%', paddingTop: '75%', position: 'relative', background: '#f5f4f0',
                }}>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" loading="lazy" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold, fontSize: 28 }}>
                      ✦
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: C.text, lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    minHeight: 34,
                  }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginTop: 4, fontFamily: MONO }}>
                    {formatPrice(p.price)}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: C.muted, fontSize: 14 }}>
              No products found
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart ── */}
      <div id="tour-pos-cart" style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', background: C.card, overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
          {[['current', 'Current Sale'], ['held', `Held Sales${heldSales.length ? ` (${heldSales.length})` : ''}`]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '14px 16px', border: 'none', cursor: 'pointer',
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

        {tab === 'current' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Cart Items */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px', color: C.muted }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" style={{ marginBottom: 12 }}>
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                  </svg>
                  <div style={{ fontSize: 13 }}>Tap a product to start</div>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}20` }}>
                    {/* Thumbnail */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 6, background: '#f5f4f0', flexShrink: 0, overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.image ? (
                        <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: C.gold, fontSize: 14 }}>✦</span>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 12, color: C.text2, fontFamily: MONO }}>{formatPrice(item.price)}</div>
                    </div>
                    {/* Qty Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={qtyBtnStyle}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text, width: 24, textAlign: 'center', fontFamily: MONO }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={qtyBtnStyle}>+</button>
                    </div>
                    {/* Line Total */}
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: MONO, width: 60, textAlign: 'right' }}>
                      {formatPrice(item.price * item.qty)}
                    </div>
                    {/* Remove */}
                    <button onClick={() => removeItem(item.id)} style={{ ...qtyBtnStyle, color: C.danger, background: `${C.danger}10` }}>
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Section */}
            <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 16px', background: C.bg }}>
              {/* Member Lookup */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.text2, fontFamily: MONO, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>
                  Member Discount
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Email, name, or scan QR..."
                    value={memberEmail}
                    onChange={e => { setMemberEmail(e.target.value); setMemberLookupDone(false); setMember(null); }}
                    onKeyDown={e => e.key === 'Enter' && lookupMember()}
                    style={{ ...inputStyle, flex: 1, fontSize: 13 }}
                  />
                  <button onClick={() => lookupMember()} style={{ ...btnStyle, background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '8px 14px', fontSize: 12 }}>
                    Lookup
                  </button>
                  <button onClick={scanning ? simulateScan : startScan} style={{ ...btnStyle, background: scanning ? C.success : C.gold, border: 'none', color: '#fff', padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>
                    {scanning ? 'Tap to Scan' : 'Scan'}
                  </button>
                </div>
                {scanning && (
                  <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#000' }}>
                    <video ref={videoRef} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '60%', height: 2, background: C.gold, opacity: 0.8, animation: 'posScanLine 2s ease-in-out infinite' }} />
                    </div>
                    <button onClick={simulateScan} style={{ position: 'absolute', bottom: 8, right: 8, padding: '4px 12px', background: C.gold, color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Simulate Scan</button>
                  </div>
                )}
                {memberLookupDone && member && (
                  <div style={{ marginTop: 6, padding: '6px 10px', background: `${C.success}10`, borderRadius: 6, fontSize: 12, color: C.success, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
                    {member.name} — {member.tier} ({Math.round(MEMBER_DISCOUNTS[member.tier] * 100)}% off)
                  </div>
                )}
                {memberLookupDone && !member && (
                  <div style={{ marginTop: 6, fontSize: 12, color: C.warning }}>No active member found</div>
                )}
              </div>

              {/* Payment Method */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['card', 'cash'].map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 6, border: `1px solid ${paymentMethod === m ? C.gold : C.border}`,
                      background: paymentMethod === m ? `${C.gold}10` : 'transparent',
                      color: paymentMethod === m ? C.gold : C.text2, cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, fontFamily: FONT, transition: 'all 0.15s',
                    }}
                  >
                    {m === 'card' ? '💳 Card' : '💵 Cash'}
                  </button>
                ))}
              </div>

              {/* Totals */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.text2, marginBottom: 4 }}>
                  <span>Subtotal</span>
                  <span style={{ fontFamily: MONO }}>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.success, marginBottom: 4 }}>
                    <span>Member Discount ({Math.round(discountRate * 100)}%)</span>
                    <span style={{ fontFamily: MONO }}>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.text2, marginBottom: 8 }}>
                  <span>Tax (8.6%)</span>
                  <span style={{ fontFamily: MONO }}>{formatPrice(tax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, color: C.gold, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                  <span>Total</span>
                  <span style={{ fontFamily: MONO }}>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                id="tour-pos-checkout"
                onClick={handleCharge}
                disabled={cart.length === 0}
                style={{
                  ...btnStyle,
                  width: '100%', padding: '16px 24px', fontSize: 16, fontWeight: 700,
                  background: cart.length === 0 ? C.muted : C.gold, color: '#fff',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  marginBottom: 8,
                }}
              >
                Charge {formatPrice(total)}
              </button>
              <button
                onClick={handleHold}
                disabled={cart.length === 0}
                style={{
                  ...btnStyle,
                  width: '100%', padding: '12px 24px', fontSize: 13,
                  background: 'transparent', border: `1px solid ${C.border}`,
                  color: cart.length === 0 ? C.muted : C.text2,
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Hold Sale
              </button>
            </div>
          </div>
        ) : (
          /* ── Held Sales Tab ── */
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
            {heldSales.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: C.muted, fontSize: 13 }}>
                No held sales
              </div>
            ) : (
              heldSales.map(h => (
                <div key={h.id} style={{
                  padding: '14px 16px', background: C.bg, borderRadius: 8, marginBottom: 8,
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                        {h.items.length} item{h.items.length !== 1 ? 's' : ''}
                      </span>
                      {h.member && (
                        <span style={{ fontSize: 12, color: C.success, marginLeft: 8 }}>{h.member.name}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.gold, fontFamily: MONO }}>
                      {formatPrice(h.subtotal)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                    {h.heldAt ? new Date(h.heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    {' — '}
                    {h.items.map(i => i.title).join(', ').slice(0, 60)}
                    {h.items.map(i => i.title).join(', ').length > 60 ? '...' : ''}
                  </div>
                  <button
                    onClick={() => resumeSale(h)}
                    style={{ ...btnStyle, background: C.gold, color: '#fff', padding: '8px 20px', fontSize: 12 }}
                  >
                    Resume
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes posScanLine { 0%, 100% { transform: translateY(-20px); opacity: 0.3; } 50% { transform: translateY(20px); opacity: 1; } }`}</style>
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
  transition: 'all 0.15s',
};

const qtyBtnStyle = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: `1px solid #E8E5DF`,
  background: '#FAFAF8',
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 600,
  color: '#1A1A2E',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Inter', sans-serif",
  padding: 0,
  lineHeight: 1,
};
