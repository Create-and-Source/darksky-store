import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addOrder } from '../admin/data/store';

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
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (attempted) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = 0;
  const total = subtotal + tax + shipping;

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.firstName) errs.firstName = 'First name is required';
    if (!form.lastName) errs.lastName = 'Last name is required';
    if (!form.address1) errs.address1 = 'Address is required';
    if (!form.city) errs.city = 'City is required';
    if (!form.state) errs.state = 'State is required';
    if (!form.zip) errs.zip = 'ZIP code is required';
    else if (form.zip.length < 5) errs.zip = 'Enter a valid ZIP code';
    return errs;
  };

  const isValid = form.email && /\S+@\S+\.\S+/.test(form.email) && form.firstName && form.lastName &&
    form.address1 && form.city && form.state && form.zip.length >= 5;

  const placeOrder = () => {
    setAttempted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPlacing(true);
    setTimeout(() => {
      const orderData = {
        customer: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        },
        shipping: {
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
        items: cart.map(item => ({
          name: item.title,
          sku: item.sku || '',
          qty: item.qty,
          price: item.price,
          image: item.images?.[0] || '',
          category: item.category || '',
        })),
        subtotal,
        tax,
        shippingCost: 0,
        total,
      };

      const newOrder = addOrder(orderData);

      // Store order details for confirmation page
      localStorage.setItem('ds_last_order', JSON.stringify({
        id: newOrder.id,
        total,
        subtotal,
        tax,
        shipping: 0,
        items: cart.map(item => ({
          title: item.title,
          qty: item.qty,
          price: item.price,
          image: item.images?.[0] || '',
          category: item.category || '',
        })),
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
        },
        shippingAddress: {
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
      }));

      if (onOrderComplete) onOrderComplete();
      setPlacing(false);
      navigate('/order-confirmation');
    }, 1800);
  };

  // Redirect if cart is empty
  if (cart.length === 0) {
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

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'var(--bg3, #12122a)', border: '1px solid var(--border2, rgba(255,255,255,0.06))',
    borderRadius: 'var(--r, 3px)', font: '400 14px DM Sans', color: 'var(--text)',
    outline: 'none', transition: 'border-color 0.2s',
  };
  const inputErrorStyle = {
    ...inputStyle,
    borderColor: 'rgba(239,68,68,0.6)',
  };
  const labelStyle = {
    display: 'block', font: '500 10px JetBrains Mono',
    letterSpacing: '0.15em', textTransform: 'uppercase',
    color: 'var(--muted)', marginBottom: 8,
  };
  const errorTextStyle = {
    font: '400 11px DM Sans', color: '#ef4444', marginTop: 4,
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
            <input style={errors.email ? inputErrorStyle : inputStyle} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            {errors.email && <div style={errorTextStyle}>{errors.email}</div>}
          </div>
          <div>
            <label style={labelStyle}>First Name</label>
            <input style={errors.firstName ? inputErrorStyle : inputStyle} placeholder="First name" value={form.firstName} onChange={set('firstName')} />
            {errors.firstName && <div style={errorTextStyle}>{errors.firstName}</div>}
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input style={errors.lastName ? inputErrorStyle : inputStyle} placeholder="Last name" value={form.lastName} onChange={set('lastName')} />
            {errors.lastName && <div style={errorTextStyle}>{errors.lastName}</div>}
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
            <input style={errors.address1 ? inputErrorStyle : inputStyle} placeholder="Street address" value={form.address1} onChange={set('address1')} />
            {errors.address1 && <div style={errorTextStyle}>{errors.address1}</div>}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Address Line 2 <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <input style={inputStyle} placeholder="Apt, suite, unit, etc." value={form.address2} onChange={set('address2')} />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input style={errors.city ? inputErrorStyle : inputStyle} placeholder="City" value={form.city} onChange={set('city')} />
            {errors.city && <div style={errorTextStyle}>{errors.city}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>State</label>
              <select
                style={{ ...(errors.state ? inputErrorStyle : inputStyle), cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%236b6880\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
                value={form.state} onChange={set('state')}
              >
                <option value="">--</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <div style={errorTextStyle}>{errors.state}</div>}
            </div>
            <div>
              <label style={labelStyle}>ZIP</label>
              <input style={errors.zip ? inputErrorStyle : inputStyle} placeholder="00000" value={form.zip} onChange={set('zip')} maxLength={10} />
              {errors.zip && <div style={errorTextStyle}>{errors.zip}</div>}
            </div>
          </div>
        </div>

        {/* Payment */}
        {sectionTitle('Payment')}
        <div style={{
          padding: 28, border: '1px solid var(--border)',
          background: 'rgba(201,169,74,0.03)', borderRadius: 'var(--r, 3px)',
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['Visa', 'Mastercard', 'Amex', 'Apple Pay'].map(m => (
              <span key={m} style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', font: '500 11px DM Sans', color: 'var(--muted)' }}>{m}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <input placeholder="Card number" style={{ ...inputStyle, letterSpacing: '0.1em' }} defaultValue="4242 4242 4242 4242" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input placeholder="MM / YY" style={inputStyle} defaultValue="12 / 28" />
              <input placeholder="CVC" style={inputStyle} defaultValue="123" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span style={{ font: '400 11px DM Sans', color: 'var(--gold)' }}>
              Secured by 256-bit SSL encryption
            </span>
          </div>
        </div>

        {/* Place Order button (mobile: visible here too) */}
        <div className="checkout-mobile-submit" style={{ display: 'none' }}>
          <button
            onClick={placeOrder}
            disabled={placing}
            style={{
              width: '100%', padding: 18,
              background: !placing ? 'var(--gold)' : 'rgba(201,169,74,0.3)',
              color: '#04040c', border: 'none', borderRadius: 'var(--r, 3px)',
              font: '600 12px JetBrains Mono', letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: !placing ? 'pointer' : 'not-allowed',
              transition: 'all 0.35s', marginBottom: 48,
            }}
          >
            {placing ? 'Processing...' : `Place Order -- ${fmt(total)}`}
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
                  {item.category} &middot; Qty: {item.qty}
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
          disabled={placing}
          style={{
            opacity: !placing ? 1 : 0.4,
            cursor: !placing ? 'pointer' : 'not-allowed',
          }}
        >
          {placing ? 'Processing...' : 'Place Order'}
        </button>

        {!isValid && !placing && (
          <p style={{ font: '300 11px DM Sans', color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
            Fill in all required fields to continue
          </p>
        )}

        <button className="cart-continue" onClick={() => navigate('/cart')}>&#8592; Back to Cart</button>

        <div style={{ marginTop: 24, display: 'flex', gap: 20, justifyContent: 'center' }}>
          {['Secure Checkout', 'Free Shipping'].map(t => (
            <span key={t} style={{ font: '400 10px JetBrains Mono', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>✦ {t}</span>
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
