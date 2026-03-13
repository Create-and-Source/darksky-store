import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const fmt = (cents) => cents ? `$${(cents / 100).toFixed(2)}` : '$—';

export default function ProductCard({ product, onAddToCart, delay = 0, badge }) {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('vis'); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div
      ref={ref}
      className="pc"
      style={{ transitionDelay: `${delay}ms` }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {badge && <div className="pc-badge">{badge}</div>}
      <div className="pc-img">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.title} loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 32 }}>✦</div>
        )}
        <button className="pc-qa" onClick={handleAdd}>Add to Cart</button>
      </div>
      <div className="pc-info">
        <div className="pc-name">{product.title}</div>
        <div className="pc-cat">{product.category}</div>
        <div className="pc-bottom">
          <span className="pc-price">{fmt(product.price)}</span>
        </div>
      </div>
    </div>
  );
}
