import { useNavigate } from 'react-router-dom';

const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;
const TAX_RATE = 0.086;

export default function Cart({ cart, onUpdate, onRemove }) {
  const navigate = useNavigate();

  const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 795;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--gold)' }}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <div className="label" style={{ marginBottom: 20 }}>// Your Cart</div>
        <h2>Your cart is <em>empty</em></h2>
        <p>
          The cosmos awaits. Explore our collection of dark sky treasures and find something that speaks to you.
        </p>
        <button className="btn-primary" onClick={() => navigate('/shop')}>Explore the Shop</button>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      {/* Items */}
      <div className="cart-items">
        <div className="label" style={{ marginBottom: 16 }}>// Your Cart</div>
        <h1 className="cart-title">{cart.length} {cart.length === 1 ? 'Item' : 'Items'}</h1>

        {cart.map(item => (
          <div key={item.cartId} className="cart-item">
            <div className="cart-item-img" onClick={() => navigate(`/product/${item.id}`)} style={{ cursor: 'pointer' }}>
              {item.images[0] && <img src={item.images[0]} alt={item.title} />}
            </div>
            <div>
              <div className="cart-item-name" onClick={() => navigate(`/product/${item.id}`)} style={{ cursor: 'pointer' }}>
                {item.title}
              </div>
              <div className="cart-item-variant">{item.category}</div>
              <div className="cart-item-qty">
                <button className="cart-qty-btn" onClick={() => onUpdate(item.cartId, item.qty - 1)}>&#8722;</button>
                <span className="cart-qty-n">{item.qty}</span>
                <button className="cart-qty-btn" onClick={() => onUpdate(item.cartId, item.qty + 1)}>+</button>
              </div>
              <button className="cart-item-remove" onClick={() => onRemove(item.cartId)}>Remove</button>
            </div>
            <div className="cart-item-price">{fmt(item.price * item.qty)}</div>
          </div>
        ))}

        <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <button className="btn-ghost" onClick={() => navigate('/shop')}>&#8592; Continue Shopping</button>
        </div>
      </div>

      {/* Summary */}
      <div className="cart-right">
        <h2 className="cart-summary-title">Order Summary</h2>

        <div className="cart-line">
          <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="cart-line">
          <span>Shipping</span>
          <span>{shipping === 0 ? <span style={{ color: 'var(--gold)' }}>Free</span> : fmt(shipping)}</span>
        </div>
        {shipping > 0 && (
          <div style={{ font: '300 11px DM Sans', color: 'var(--muted)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            Free shipping on orders over $50
          </div>
        )}
        <div className="cart-line">
          <span>Tax (8.6%)</span>
          <span>{fmt(tax)}</span>
        </div>
        <div className="cart-total">
          <span>Total</span>
          <span className="price">{fmt(total)}</span>
        </div>

        <button className="cart-checkout" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
        <button className="cart-continue" onClick={() => navigate('/shop')}>Continue Shopping</button>

        <div style={{ marginTop: 32, padding: 24, border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'rgba(212,175,55,0.04)' }}>
          <div className="label" style={{ marginBottom: 12 }}>// Member Discount</div>
          <p style={{ font: '300 13px/1.7 DM Sans', color: 'var(--muted)' }}>
            Members receive 10-20% off all purchases. <button onClick={() => navigate('/membership')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', font: '500 13px DM Sans', textDecoration: 'underline' }}>Join today</button>
          </p>
        </div>

        <div style={{ marginTop: 28, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Secure Checkout' },
            { icon: 'M5 12h14M12 5l7 7-7 7', label: 'Free Returns' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                <path d={t.icon}/>
              </svg>
              <span style={{ font: '400 11px JetBrains Mono', letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
