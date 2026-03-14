import { useNavigate } from 'react-router-dom';

const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;

const goldGradientStyle = {
  background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

export default function Cart({ cart, onUpdate, onRemove }) {
  const navigate = useNavigate();

  const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 795;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="label" style={{ marginBottom: 20 }}>// Your Cart</div>
        <div style={{ fontSize: 64, marginBottom: 24 }}>✦</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 400, marginBottom: 16 }}>
          Your cart is <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>empty</em>
        </h2>
        <p style={{ font: '300 15px/1.7 "Plus Jakarta Sans"', color: 'var(--text2)', maxWidth: 340, margin: '0 auto 36px' }}>
          The cosmos awaits. Explore our collection of dark sky treasures.
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
                <button className="cart-qty-btn" onClick={() => onUpdate(item.cartId, item.qty - 1)}>−</button>
                <span className="cart-qty-n">{item.qty}</span>
                <button className="cart-qty-btn" onClick={() => onUpdate(item.cartId, item.qty + 1)}>+</button>
              </div>
              <button className="cart-item-remove" onClick={() => onRemove(item.cartId)}>Remove</button>
            </div>
            <div className="cart-item-price" style={goldGradientStyle}>{fmt(item.price * item.qty)}</div>
          </div>
        ))}

        <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <button className="btn-ghost" onClick={() => navigate('/shop')}>← Continue Shopping</button>
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
          <div style={{ font: '300 11px "Plus Jakarta Sans"', color: 'var(--text2)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            Free shipping on orders over $50
          </div>
        )}
        <div className="cart-total">
          <span>Total</span>
          <span className="price" style={goldGradientStyle}>{fmt(total)}</span>
        </div>

        <button className="cart-checkout" style={{
          background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
          backgroundSize: '200% 200%',
        }}>
          Proceed to Checkout
        </button>
        <button className="cart-continue" onClick={() => navigate('/shop')}>Continue Shopping</button>

        <div style={{
          marginTop: 32,
          padding: 24,
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          <div className="label" style={{ marginBottom: 12 }}>// Member Discount</div>
          <p style={{ font: '300 13px/1.7 "Plus Jakarta Sans"', color: 'var(--text2)' }}>
            Members receive 10-20% off all purchases. <button onClick={() => navigate('/membership')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', font: '500 13px "Plus Jakarta Sans"', textDecoration: 'underline' }}>Join today</button>
          </p>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 20, justifyContent: 'center' }}>
          {['✦ Secure Checkout', '✦ Free Returns'].map(t => (
            <span key={t} style={{ font: '400 11px JetBrains Mono', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
