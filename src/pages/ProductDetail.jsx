import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';

const fmt = (cents) => cents ? `$${(cents / 100).toFixed(2)}` : 'Price on request';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const KIDS_SIZES = ['6M', '12M', '18M', '2T', '3T', '4T', '5T'];
const COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Navy', hex: '#1a1a3e' },
  { name: 'Charcoal', hex: '#333' },
  { name: 'Forest', hex: '#1a3a2a' },
  { name: 'White', hex: '#f0ede6' },
];

export default function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
    setAdded(false);
    setSelectedSize('');
    setSelectedColor('');
  }, [id]);

  if (!product) {
    return (
      <div style={{ padding: '120px 64px', textAlign: 'center' }}>
        <div className="label" style={{ marginBottom: 20 }}>// 404 — Not Found</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, marginBottom: 24, fontWeight: 400 }}>
          Lost in <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Space</em>
        </h1>
        <p style={{ font: '300 15px DM Sans', color: 'var(--muted)', marginBottom: 32 }}>This product has drifted beyond our telescope range.</p>
        <button className="btn-primary" onClick={() => navigate('/shop')}>Return to Shop</button>
      </div>
    );
  }

  const isKids = product.category === 'Kids';
  const isApparel = ['Apparel', 'Kids', 'Outerwear', 'Tanks'].includes(product.category);
  const sizes = isKids ? KIDS_SIZES : SIZES;
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id)
    .sort(() => 0.5 - Math.random()).slice(0, 4);

  const handleAdd = () => {
    const variant = [selectedSize, selectedColor].filter(Boolean).join(' / ') || undefined;
    onAddToCart({ ...product, variant });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const desc = product.description.replace(/<[^>]*>/g, '').trim();

  return (
    <div>
      {/* Back link */}
      <div style={{ padding: '20px 64px 0' }} className="pd-back-wrap">
        <button
          onClick={() => navigate('/shop')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            font: '400 13px DM Sans', color: 'var(--muted)',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Shop
        </button>
      </div>

      <div className="pd">
        {/* Gallery — 60% width */}
        <div className="pd-gallery">
          <div style={{ height: product.images.length > 1 ? '75%' : '100%', overflow: 'hidden', background: 'var(--bg3)', position: 'relative' }}>
            {product.images[activeImg] ? (
              <img
                src={product.images[activeImg]}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 64 }}>✦</div>
            )}
            {/* Image counter */}
            {product.images.length > 1 && (
              <div style={{
                position: 'absolute', bottom: 16, right: 16,
                background: 'rgba(4,4,12,0.7)', backdropFilter: 'blur(8px)',
                padding: '6px 12px', borderRadius: 'var(--r)',
                font: '500 11px JetBrains Mono', color: 'var(--text)',
                letterSpacing: '0.1em',
              }}>
                {activeImg + 1} / {product.images.length}
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="pd-thumbs">
              {product.images.slice(0, 4).map((img, i) => (
                <button key={i} className={`pd-thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info — 40% width */}
        <div className="pd-info">
          <div className="pd-breadcrumb">
            <a onClick={() => navigate('/')}>Home</a>
            <span>/</span>
            <a onClick={() => navigate('/shop')}>Shop</a>
            <span>/</span>
            <a onClick={() => navigate(`/shop?cat=${product.category}`)}>{product.category}</a>
          </div>

          {/* Category badge */}
          <span style={{
            display: 'inline-block', padding: '4px 12px',
            border: '1px solid rgba(212,175,55,0.25)',
            font: '600 9px JetBrains Mono', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--gold)',
            background: 'rgba(212,175,55,0.06)', marginBottom: 16,
          }}>{product.category}</span>

          <h1 className="pd-title">{product.title}</h1>
          <div className="pd-price">{fmt(product.price)}</div>

          <div className="pd-divider" />

          {/* Size selector */}
          {isApparel && (
            <>
              <div className="pd-label-sm">Size</div>
              <div className="pd-options">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`pd-opt ${selectedSize === size ? 'sel' : ''}`}
                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Color selector */}
          {isApparel && (
            <>
              <div className="pd-label-sm">
                Color{selectedColor && <span style={{ color: 'var(--text)', fontFamily: 'DM Sans', textTransform: 'none', letterSpacing: 0, fontSize: 11, marginLeft: 8 }}>— {selectedColor}</span>}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                {COLORS.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(selectedColor === color.name ? '' : color.name)}
                    title={color.name}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: color.hex,
                      border: selectedColor === color.name ? '2px solid var(--gold)' : '2px solid var(--border2)',
                      boxShadow: selectedColor === color.name ? '0 0 0 2px rgba(212,175,55,0.3)' : 'none',
                      cursor: 'pointer', transition: 'all 0.2s',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quantity */}
          <div className="pd-label-sm">Quantity</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <button className="cart-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, fontSize: 18 }}>−</button>
            <span style={{ font: '500 18px DM Sans', minWidth: 32, textAlign: 'center' }}>{qty}</span>
            <button className="cart-qty-btn" onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 40, fontSize: 18 }}>+</button>
          </div>

          {/* Add to Cart — 56px tall with press animation */}
          <button
            className={`pd-add ${added ? 'pd-add--success' : ''}`}
            onClick={handleAdd}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>

          {/* Free shipping note */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 24, marginTop: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span style={{ font: '400 12px DM Sans', color: 'var(--muted)' }}>
              Free shipping on orders over $50
            </span>
          </div>

          <button className="pd-fave" onClick={() => navigate('/cart')}>View Cart</button>

          {/* Description */}
          {desc && (
            <>
              <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                <div className="pd-label-sm">Description</div>
                <p className="pd-desc">{desc}</p>
              </div>
            </>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <>
              <div className="pd-label-sm">Tags</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                {product.tags.slice(0, 6).map(tag => (
                  <span key={tag} style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: 'var(--muted)',
                    padding: '4px 10px', border: '1px solid var(--border)',
                  }}>{tag}</span>
                ))}
              </div>
            </>
          )}

          {/* Trust badges */}
          <div className="pd-trust">
            <div className="pd-trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Supports dark sky preservation</span>
            </div>
            <div className="pd-trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <span>Ships in 3–5 business days</span>
            </div>
            <div className="pd-trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              <span>Free returns within 30 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky add to cart bar */}
      <div className="pd-mobile-bar">
        <div>
          <div style={{ font: '500 14px Playfair Display, serif', color: 'var(--text)', marginBottom: 2 }}>
            {product.title.length > 30 ? product.title.slice(0, 30) + '...' : product.title}
          </div>
          <div style={{ font: '600 16px DM Sans', color: 'var(--gold)' }}>{fmt(product.price)}</div>
        </div>
        <button
          onClick={handleAdd}
          style={{
            padding: '12px 24px', background: added ? '#2d6a2d' : 'var(--gold)',
            color: '#04040c', border: 'none', borderRadius: 'var(--r)',
            font: '600 11px JetBrains Mono', letterSpacing: '0.15em',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
            whiteSpace: 'nowrap',
          }}
        >
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>

      {/* You Might Also Like */}
      {related.length > 0 && (
        <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 14 }}>// You Might Also Like</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 400 }}>
              More from <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{product.category}</em>
            </h2>
          </div>
          <div className="grid grid-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} delay={i * 80} />
            ))}
          </div>
        </section>
      )}

      <style>{`
        .pd-add--success {
          background: #2d6a2d !important;
          box-shadow: none !important;
        }
        .pd-add:active {
          transform: scale(0.97) !important;
          transition: transform 0.1s !important;
        }
        .pd-mobile-bar {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(4,4,12,0.95); backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border);
          padding: 12px 24px;
          z-index: 150;
          align-items: center; justify-content: space-between; gap: 16;
        }
        @media (max-width: 1024px) {
          .pd-mobile-bar { display: flex; }
          .pd-back-wrap { padding: 16px 24px 0 !important; }
        }
      `}</style>
    </div>
  );
}
