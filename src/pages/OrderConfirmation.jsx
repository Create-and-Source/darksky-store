import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem('ds_last_order');
      if (data) {
        setOrder(JSON.parse(data));
      } else {
        navigate('/shop');
      }
    } catch {
      navigate('/shop');
    }
  }, [navigate]);

  if (!order) return null;

  return (
    <div style={{ padding: '120px 64px 80px', maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '80vh' }}>
      {/* Falling stars animation */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {[...Array(40)].map((_, i) => (
          <div key={i} className="conf-star" style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `-${10 + Math.random() * 20}px`,
            width: Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1,
            height: Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1,
            borderRadius: '50%',
            background: Math.random() > 0.5 ? 'var(--gold)' : 'rgba(255,255,255,0.7)',
            animation: `confFall ${4 + Math.random() * 6}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.3 + Math.random() * 0.6,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Success icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(74,222,128,0.1)', color: '#4ade80',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 28px',
          animation: 'confPop 0.5s cubic-bezier(.16,1,.3,1)',
        }}>&#10003;</div>

        <div className="label" style={{ marginBottom: 16 }}>// Order Confirmed</div>

        <h1 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 400, marginBottom: 12, lineHeight: 1.1,
        }}>
          Thank <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>you</em> for your order!
        </h1>

        <p style={{ font: '300 16px/1.7 DM Sans', color: 'var(--muted)', marginBottom: 40 }}>
          Your order has been placed successfully. You'll receive a confirmation email shortly.
        </p>

        {/* Order number */}
        <div style={{
          display: 'inline-block', padding: '12px 28px',
          background: 'rgba(201,169,74,0.08)', border: '1px solid rgba(201,169,74,0.25)',
          marginBottom: 36,
        }}>
          <span style={{ font: '500 10px JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: 12 }}>
            Order
          </span>
          <span style={{ font: '600 20px DM Sans', color: 'var(--gold)' }}>{order.id}</span>
        </div>

        {/* Order summary card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          padding: 32, textAlign: 'left', marginBottom: 36,
        }}>
          {/* Items */}
          <div style={{ marginBottom: 20 }}>
            <div className="label" style={{ marginBottom: 12 }}>Items</div>
            {order.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 0',
                borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 48, height: 48, background: 'var(--bg3, #12122a)',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {item.image && (
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ font: '400 14px Playfair Display, serif', color: 'var(--text)' }}>{item.title}</div>
                  <div style={{ font: '300 11px DM Sans', color: 'var(--muted)' }}>
                    {item.category && `${item.category} \u00B7 `}Qty: {item.qty}
                  </div>
                </div>
                <div style={{ font: '600 14px DM Sans', color: 'var(--gold)', flexShrink: 0 }}>
                  {fmt(item.price * item.qty)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>Subtotal</span>
              <span style={{ font: '400 13px DM Sans', color: 'var(--text)' }}>{fmt(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>Tax (8.6%)</span>
              <span style={{ font: '400 13px DM Sans', color: 'var(--text)' }}>{fmt(order.tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>Shipping</span>
              <span style={{ font: '400 13px DM Sans', color: 'var(--gold)' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ font: '600 15px DM Sans', color: 'var(--text)' }}>Total</span>
              <span style={{ font: '600 18px DM Sans', color: 'var(--gold)' }}>{fmt(order.total)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div className="label" style={{ marginBottom: 6 }}>Shipping To</div>
              <p style={{ font: '300 14px DM Sans', color: 'var(--muted)' }}>
                {order.customer.firstName} {order.customer.lastName}<br />
                {order.shippingAddress.address1}{order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ''}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
          <button className="btn-ghost" onClick={() => navigate('/')}>Track Your Order</button>
        </div>

        {/* Membership CTA */}
        <div style={{
          marginTop: 48, padding: '32px 28px',
          background: 'rgba(212,175,55,0.04)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 'var(--r)',
          textAlign: 'center',
        }}>
          <div style={{
            font: '500 10px JetBrains Mono', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12,
          }}>// Members Save More</div>
          <h3 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400,
            marginBottom: 10,
          }}>
            Become a <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>member</em>
          </h3>
          <p style={{ font: '300 14px/1.7 DM Sans', color: 'var(--muted)', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
            Get 10–20% off every purchase, early access to events, and support dark sky preservation.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate('/membership')}
            style={{ padding: '12px 32px' }}
          >
            Learn About Membership
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes confPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 640px) {
          .conf-page { padding: 80px 24px 60px !important; }
        }
      `}</style>
    </div>
  );
}
