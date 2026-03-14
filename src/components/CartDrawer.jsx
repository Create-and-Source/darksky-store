import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;
const TAX_RATE = 0.086;

export default function CartDrawer({ open, onClose, cart, onUpdate, onRemove }) {
  const navigate = useNavigate();

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = subtotal >= 5000 ? 0 : 500;
  const total = subtotal + tax + shipping;

  const goCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const goShop = () => {
    onClose();
    navigate('/shop');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cd-backdrop ${open ? 'cd-backdrop--open' : ''}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`cd-drawer ${open ? 'cd-drawer--open' : ''}`}>
        {/* Header */}
        <div className="cd-header">
          <div>
            <div className="label" style={{ marginBottom: 4 }}>// Your Cart</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400 }}>
              Shopping <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Bag</em>
            </h2>
          </div>
          <button className="cd-close" onClick={onClose} aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l16 16M17 1L1 17"/>
            </svg>
          </button>
        </div>

        {cart.length === 0 ? (
          /* Empty state */
          <div className="cd-empty">
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '2px solid var(--border)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 32, color: 'var(--gold)', opacity: 0.4,
              marginBottom: 24,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>
              Your cart is <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>empty</em>
            </h3>
            <p style={{ font: '300 14px DM Sans', color: 'var(--muted)', marginBottom: 28 }}>
              Discover our curated collection of dark sky treasures.
            </p>
            <button className="btn-primary" onClick={goShop}>Start Shopping</button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="cd-items">
              {cart.map(item => (
                <div key={item.cartId} className="cd-item">
                  <div className="cd-item-img">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: 20 }}>✦</div>
                    )}
                  </div>
                  <div className="cd-item-details">
                    <div style={{ font: '500 14px Playfair Display, serif', color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>
                      {item.title}
                    </div>
                    {item.variant && (
                      <div style={{ font: '300 11px DM Sans', color: 'var(--muted)', marginBottom: 10 }}>{item.variant}</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button className="cart-qty-btn" style={{ width: 26, height: 26, fontSize: 14 }} onClick={() => onUpdate(item.cartId, item.qty - 1)}>−</button>
                      <span style={{ font: '500 13px DM Sans', minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                      <button className="cart-qty-btn" style={{ width: 26, height: 26, fontSize: 14 }} onClick={() => onUpdate(item.cartId, item.qty + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cd-item-right">
                    <div style={{ font: '600 14px DM Sans', color: 'var(--gold)', marginBottom: 8 }}>
                      {fmt(item.price * item.qty)}
                    </div>
                    <button
                      onClick={() => onRemove(item.cartId)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--muted)', transition: 'color 0.2s', padding: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#e55'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                      aria-label="Remove item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cd-summary">
              <div className="cd-sum-line">
                <span>Subtotal</span>
                <span style={{ color: 'var(--text)' }}>{fmt(subtotal)}</span>
              </div>
              <div className="cd-sum-line">
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--gold)' : 'var(--text)' }}>
                  {shipping === 0 ? 'Free' : fmt(shipping)}
                </span>
              </div>
              <div className="cd-sum-line">
                <span>Tax (8.6%)</span>
                <span style={{ color: 'var(--text)' }}>{fmt(tax)}</span>
              </div>
              <div className="cd-sum-total">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>

              <button className="cd-checkout-btn" onClick={goCheckout}>
                Proceed to Checkout
              </button>
              <button className="cd-continue" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .cd-backdrop {
          position: fixed; inset: 0; z-index: 290;
          background: rgba(0,0,0,0.6);
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .cd-backdrop--open {
          opacity: 1; pointer-events: auto;
        }
        .cd-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 420px; max-width: 100vw;
          z-index: 300;
          background: var(--bg2);
          border-left: 1px solid var(--border);
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -8px 0 40px rgba(0,0,0,0.5);
        }
        .cd-drawer--open {
          transform: translateX(0);
        }
        .cd-header {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          padding: 28px 28px 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .cd-close {
          width: 40px; height: 40px; border-radius: 50%;
          border: 1px solid var(--border);
          background: none; color: var(--muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .cd-close:hover { border-color: var(--gold); color: var(--gold); }
        .cd-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 28px; text-align: center;
        }
        .cd-items {
          flex: 1; overflow-y: auto; padding: 8px 0;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .cd-item {
          display: grid; grid-template-columns: 72px 1fr auto;
          gap: 14px; padding: 18px 28px;
          border-bottom: 1px solid var(--border);
          align-items: start;
        }
        .cd-item-img {
          width: 72px; height: 72px; border-radius: var(--r);
          overflow: hidden; background: var(--bg3);
        }
        .cd-item-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cd-item-details { min-width: 0; }
        .cd-item-right {
          display: flex; flex-direction: column;
          align-items: flex-end; flex-shrink: 0;
        }
        .cd-summary {
          flex-shrink: 0; padding: 20px 28px 28px;
          border-top: 1px solid var(--border);
          background: rgba(4,4,12,0.5);
        }
        .cd-sum-line {
          display: flex; justify-content: space-between;
          padding: 8px 0;
          font: 300 13px DM Sans; color: var(--muted);
        }
        .cd-sum-total {
          display: flex; justify-content: space-between;
          padding: 14px 0 20px;
          border-top: 1px solid var(--border);
          margin-top: 8px;
          font: 700 18px DM Sans; color: var(--gold);
        }
        .cd-checkout-btn {
          width: 100%; padding: 18px; height: 56px;
          background: var(--gold); color: #04040c;
          font: 600 12px JetBrains Mono; letter-spacing: 0.18em;
          text-transform: uppercase;
          border: none; border-radius: var(--r);
          cursor: pointer; transition: all 0.35s;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 10px;
        }
        .cd-checkout-btn:hover {
          background: var(--gold-l);
          box-shadow: 0 8px 40px rgba(212,175,55,0.35);
        }
        .cd-continue {
          width: 100%; padding: 14px;
          background: none; color: var(--muted);
          font: 500 13px DM Sans; letter-spacing: 0.04em;
          border: 1px solid var(--border2); border-radius: var(--r);
          cursor: pointer; transition: all 0.25s;
        }
        .cd-continue:hover { color: var(--text); border-color: var(--border); }
        @media (max-width: 480px) {
          .cd-drawer { width: 100vw; }
          .cd-header { padding: 20px 20px 16px; }
          .cd-item { padding: 14px 20px; gap: 12px; grid-template-columns: 60px 1fr auto; }
          .cd-item-img { width: 60px; height: 60px; }
          .cd-summary { padding: 16px 20px 24px; }
        }
      `}</style>
    </>
  );
}
