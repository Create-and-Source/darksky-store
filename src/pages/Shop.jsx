import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';

const CATS = ['All', 'Apparel', 'Kids', 'Gifts', 'Outerwear', 'Tanks'];

export default function Shop({ onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'All';
  const [activeCat, setActiveCat] = useState(initialCat);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(24);

  useEffect(() => {
    const cat = searchParams.get('cat') || 'All';
    setActiveCat(cat);
    setVisible(24);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let out = PRODUCTS;
    if (activeCat !== 'All') out = out.filter(p => p.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    return out;
  }, [activeCat, search]);

  const selectCat = (cat) => {
    setActiveCat(cat);
    setVisible(24);
    if (cat === 'All') setSearchParams({});
    else setSearchParams({ cat });
  };

  const catCount = (cat) => cat === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length;

  return (
    <div>
      {/* Shop Hero */}
      <div className="shop-hero">
        <div className="label" style={{ marginBottom: 14 }}>// The Collection</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, lineHeight: 1 }}>
            {activeCat === 'All' ? <><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>All</em> Products</> : <>{activeCat}</>}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ font: '400 12px DM Sans', color: 'var(--muted)' }}>{filtered.length} items</span>
            <input
              type="search"
              placeholder="Search the cosmos..."
              value={search}
              onChange={e => { setSearch(e.target.value); setVisible(24); }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: 3, padding: '9px 16px', font: '400 13px DM Sans',
                color: 'var(--text)', outline: 'none', width: 220,
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="cat-tabs">
        {CATS.map(cat => (
          <button
            key={cat}
            className={`cat-tab ${activeCat === cat ? 'active' : ''}`}
            onClick={() => selectCat(cat)}
          >
            {cat}
            <span className="cat-count">{catCount(cat)}</span>
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div style={{ padding: '48px 64px 80px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', fontFamily: 'Playfair Display, serif', fontSize: 24, fontStyle: 'italic' }}>
            No products found in this quadrant.
          </div>
        ) : (
          <>
            <div className="grid">
              {filtered.slice(0, visible).map((p, i) => (
                <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} delay={Math.min((i % 8) * 50, 280)} />
              ))}
            </div>
            {visible < filtered.length && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <button
                  className="btn-ghost"
                  onClick={() => setVisible(v => v + 24)}
                >
                  Load More — {filtered.length - visible} remaining
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
