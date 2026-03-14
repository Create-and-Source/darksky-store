import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;
const TAX_RATE = 0.086;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

export default function Checkout({ cart, onOrderComplete }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    address1: '', address2: '', city: '', state: '', zip: '',
  });
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = 0;
  const total = subtotal + tax + shipping;

  const isValid = form.email && form.firstName && form.lastName &&
    form.address1 && form.city && form.state && form.zip.length >= 5;

  const placeOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      const orderId = `ORD-${Math.floor(2500 + Math.random() * 500)}`;
      setOrder({ id: orderId, total, items: cart.length });
      if (onOrderComplete) onOrderComplete();
      setPlacing(false);
    }, 1800);
  };

  // Redirect if cart is empty and no order placed
  if (cart.length === 0 && !order) {
    return (
      <div style={{ padding: '120px 64px', textAlign: 'center' }}>
        <div className="label" style={{ marginBottom: 20 }}>// Checkout</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 400, marginBottom: 16 }}>
          Nothing to check out
        </h2>
        <p style={{ font: '300 15px DM Sans', color: 'var(--muted)', marginBottom: 32 }}>Add some items to your cart first.</p>
        <button className="btn-primary" onClick={() => navigate('/shop')}>Explore the Shop</button>
      </div>
    );
  }

  // Confirmation
  if (order) {
    return (
      <div style={{ padding: '120px 64px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(74,222,128,0.1)', color: '#4ade80',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 24px',
        }}>✓</div>
        <div className="label" style={{ marginBottom: 16 }}>// Order Confirmed</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 42, fontWeight: 400, marginBottom: 12 }}>
          Thank <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>you</em>
        </h1>
        <p style={{ font: '300 16px/1.7 DM Sans', color: 'var(--muted)', marginBottom: 32 }}>
          Your order has been placed successfully. You'll receive a confirmation email shortly.
        </p>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          padding: 32, borderRadius: 3, marginBottom: 32, textAlign: 'left',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Order Number</div>
              <span style={{ font: '600 18px DM Sans', color: 'var(--gold)' }}>{order.id}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="label" style={{ marginBottom: 6 }}>Total</div>
              <span style={{ font: '600 18px DM Sans', color: 'var(--text)' }}>{fmt(order.total)}</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div className="label" style={{ marginBottom: 6 }}>Shipping To</div>
            <p style={{ font: '300 14px DM Sans', color: 'var(--muted)' }}>
              {form.firstName} {form.lastName}<br />
              {form.address1}{form.address2 ? `, ${form.address2}` : ''}<br />
              {form.city}, {form.state} {form.zip}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
          <button className="btn-ghost" onClick={() => navigate('/')}>Return Home</button>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'var(--bg3, #12122a)', border: '1px solid var(--border2, rgba(255,255,255,0.06))',
    borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)',
    outline: 'none', transition: 'border-color 0.2s',
  };
  const labelStyle = {
    display: 'block', font: '500 10px JetBrains Mono',
    letterSpacing: '0.15em', textTransform: 'uppercase',
    color: 'var(--muted)', marginBottom: 8,
  };
  const sectionTitle = (text) => (
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 400, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>{text}</h3>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', minHeight: 'calc(100vh - 68px)' }} className="checkout-layout">
      {/* Left: Forms */}
      <div style={{ padding: '48px 64px', borderRight: '1px solid var(--border)' }} className="checkout-forms">
        <div className="label" style={{ marginBottom: 16 }}>// Checkout</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 400, marginBottom: 40 }}>
          Complete Your <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Order</em>
        </h1>

        {/* Contact */}
        {sectionTitle('Contact Information')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }} className="checkout-form-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label style={labelStyle}>First Name</label>
            <input style={inputStyle} placeholder="First name" value={form.firstName} onChange={set('firstName')} />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input style={inputStyle} placeholder="Last name" value={form.lastName} onChange={set('lastName')} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Phone <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <input style={inputStyle} type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')} />
          </div>
        </div>

        {/* Shipping */}
        {sectionTitle('Shipping Address')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }} className="checkout-form-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Address Line 1</label>
            <input style={inputStyle} placeholder="Street address" value={form.address1} onChange={set('address1')} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Address Line 2 <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <input style={inputStyle} placeholder="Apt, suite, unit, etc." value={form.address2} onChange={set('address2')} />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} placeholder="City" value={form.city} onChange={set('city')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>State</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%236b6880\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
                value={form.state} onChange={set('state')}
              >
                <option value="">—</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>ZIP</label>
              <input style={inputStyle} placeholder="00000" value={form.zip} onChange={set('zip')} maxLength={10} />
            </div>
          </div>
        </div>

        {/* Payment */}
        {sectionTitle('Payment')}
        <div style={{
          padding: 28, border: '1px solid var(--border)',
          background: 'rgba(201,169,74,0.03)', borderRadius: 'var(--r, 3px)',
          marginBottom: 32, textAlign: 'center',
        }}>
          <div style={{
            width: '100%', padding: '18px 16px', marginBottom: 16,
            background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border2, rgba(255,255,255,0.1))',
            borderRadius: 'var(--r, 3px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ font: '400 14px DM Sans', color: 'var(--muted)' }}>
                •••• •••• •••• ••••
              </span>
              <span style={{ font: '400 12px DM Sans', color: 'var(--muted)' }}>
                MM / YY &nbsp; CVC
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span style={{ font: '400 12px DM Sans', color: 'var(--gold)' }}>
              Card payment powered by Square — coming soon
            </span>
          </div>
        </div>

        {/* Place Order button (mobile: visible here too) */}
        <div className="checkout-mobile-submit" style={{ display: 'none' }}>
          <button
            onClick={placeOrder}
            disabled={!isValid || placing}
            style={{
              width: '100%', padding: 18,
              background: isValid && !placing ? 'var(--gold)' : 'rgba(201,169,74,0.3)',
              color: '#04040c', border: 'none', borderRadius: 'var(--r, 3px)',
              font: '600 12px JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: isValid && !placing ? 'pointer' : 'not-allowed',
              transition: 'all 0.35s', marginBottom: 48,
            }}
          >
            {placing ? 'Processing...' : `Place Order — ${fmt(total)}`}
          </button>
        </div>
      </div>

      {/* Right: Order Summary */}
      <div style={{ padding: '48px 40px', background: 'var(--bg2)', position: 'sticky', top: 68, height: 'fit-content', maxHeight: 'calc(100vh - 68px)', overflowY: 'auto' }} className="checkout-summary">
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, marginBottom: 28 }}>Order Summary</h2>

        {/* Cart items */}
        <div style={{ marginBottom: 24 }}>
          {cart.map(item => (
            <div key={item.cartId} style={{
              display: 'flex', gap: 14, padding: '14px 0',
              borderBottom: '1px solid var(--border)',
              alignItems: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--r, 3px)',
                overflow: 'hidden', background: 'var(--bg3, #12122a)', flexShrink: 0,
              }}>
                {item.images && item.images[0] && (
                  <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  font: '400 13px Playfair Display, serif',
                  color: 'var(--text)', marginBottom: 3,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{item.title}</div>
                <div style={{ font: '300 11px DM Sans', color: 'var(--muted)' }}>
                  {item.category} · Qty: {item.qty}
                </div>
              </div>
              <div style={{ font: '600 14px DM Sans', color: 'var(--gold)', flexShrink: 0 }}>
                {fmt(item.price * item.qty)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="cart-line">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="cart-line">
          <span>Tax (8.6%)</span>
          <span>{fmt(tax)}</span>
        </div>
        <div className="cart-line">
          <span>Shipping</span>
          <span style={{ color: 'var(--gold)' }}>Free</span>
        </div>
        <div className="cart-total">
          <span>Total</span>
          <span className="price">{fmt(total)}</span>
        </div>

        <button
          className="cart-checkout checkout-desktop-submit"
          onClick={placeOrder}
          disabled={!isValid || placing}
          style={{
            opacity: isValid && !placing ? 1 : 0.4,
            cursor: isValid && !placing ? 'pointer' : 'not-allowed',
          }}
        >
          {placing ? 'Processing...' : 'Place Order'}
        </button>

        {!isValid && (
          <p style={{ font: '300 11px DM Sans', color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
            Fill in all required fields to continue
          </p>
        )}

        <button className="cart-continue" onClick={() => navigate('/cart')}>← Back to Cart</button>

        <div style={{ marginTop: 24, display: 'flex', gap: 20, justifyContent: 'center' }}>
          {['✦ Secure Checkout', '✦ Free Shipping'].map(t => (
            <span key={t} style={{ font: '400 10px JetBrains Mono', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>{t}</span>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .checkout-layout { grid-template-columns: 1fr !important; }
          .checkout-forms { padding: 32px 24px !important; border-right: none !important; }
          .checkout-summary { position: relative !important; top: 0 !important; max-height: none !important; padding: 32px 24px !important; border-top: 1px solid var(--border); }
          .checkout-desktop-submit { display: none !important; }
          .checkout-mobile-submit { display: block !important; }
        }
        @media (max-width: 560px) {
          .checkout-form-grid { grid-template-columns: 1fr !important; }
        }
        .checkout-forms input:focus,
        .checkout-forms select:focus {
          border-color: rgba(201,169,74,0.4) !important;
        }
      `}</style>
    </div>
  );
}
