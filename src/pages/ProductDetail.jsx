import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';

const fmt = (cents) => cents ? `$${(cents / 100).toFixed(2)}` : 'Price on request';

export default function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => { setActiveImg(0); setQty(1); setAdded(false); }, [id]);

  if (!product) {
    return (
      <div style={{ padding: '120px 64px', textAlign: 'center' }}>
        <div className="label" style={{ marginBottom: 20 }}>// 404 — Not Found</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, marginBottom: 24, fontWeight: 400 }}>Lost in Space</h1>
        <button className="btn-primary" onClick={() => navigate('/shop')}>Return to Shop</button>
      </div>
    );
  }

  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  // Strip HTML tags from description
  const desc = product.description.replace(/<[^>]*>/g, '').trim();

  return (
    <div>
      <div className="pd">
        {/* Gallery */}
        <div className="pd-gallery">
          <div style={{ height: product.images.length > 1 ? '75%' : '100%', overflow: 'hidden', background: 'var(--bg3)' }}>
            {product.images[activeImg] ? (
              <img
                src={product.images[activeImg]}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 64 }}>✦</div>
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

        {/* Info */}
        <div className="pd-info">
          <div className="pd-breadcrumb">
            <a onClick={() => navigate('/')}>Home</a>
            <span>/</span>
            <a onClick={() => navigate('/shop')}>Shop</a>
            <span>/</span>
            <a onClick={() => navigate(`/shop?cat=${product.category}`)}>{product.category}</a>
          </div>

          <h1 className="pd-title">{product.title}</h1>
          <div className="pd-price">{fmt(product.price)}</div>

          <div className="pd-divider" />

          {desc && (
            <>
              <div className="pd-label-sm">Description</div>
              <p className="pd-desc">{desc.substring(0, 280)}{desc.length > 280 ? '...' : ''}</p>
            </>
          )}

          {product.tags.length > 0 && (
            <>
              <div className="pd-label-sm">Tags</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                {product.tags.slice(0, 6).map(tag => (
                  <span key={tag} style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: 'var(--muted)',
                    padding: '4px 10px', border: '1px solid var(--border)'
                  }}>{tag}</span>
                ))}
              </div>
            </>
          )}

          {/* Quantity */}
          <div className="pd-label-sm">Quantity</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <button className="cart-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span style={{ font: '500 16px DM Sans', minWidth: 24, textAlign: 'center' }}>{qty}</span>
            <button className="cart-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          <button
            className="pd-add"
            onClick={handleAdd}
            style={{ background: added ? '#2d6a2d' : 'var(--gold)' }}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>
          <button className="pd-fave" onClick={() => navigate('/cart')}>View Cart</button>

          <div className="pd-trust">
            <div className="pd-trust-item">
              <span style={{ color: 'var(--gold)' }}>✦</span>
              <span>Supports dark sky preservation</span>
            </div>
            <div className="pd-trust-item">
              <span style={{ color: 'var(--gold)' }}>✦</span>
              <span>Ships in 3–5 business days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
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
    </div>
  );
}
