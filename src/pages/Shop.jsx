import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';

const CATS = ['All', 'Apparel', 'Kids', 'Gifts', 'Outerwear', 'Tanks'];

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest' },
];

const fmt = (cents) => cents ? `$${(cents / 100).toFixed(2)}` : '$--';

// Mark some products as bestsellers / new
const BESTSELLER_IDS = new Set(PRODUCTS.filter(p => p.images.length > 0).slice(0, 4).map(p => p.id));
const NEW_IDS = new Set(PRODUCTS.slice(-6).map(p => p.id));

export default function Shop({ onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCat = searchParams.get('cat') || 'All';
  const initialSort = searchParams.get('sort') || 'default';
  const [activeCat, setActiveCat] = useState(initialCat);
  const [sortBy, setSortBy] = useState(initialSort);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(24);
  const catBarRef = useRef(null);

  useEffect(() => {
    const cat = searchParams.get('cat') || 'All';
    const sort = searchParams.get('sort') || 'default';
    setActiveCat(cat);
    setSortBy(sort);
    setVisible(24);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let out = [...PRODUCTS];
    if (activeCat !== 'All') out = out.filter(p => p.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    switch (sortBy) {
      case 'price-asc': out.sort((a, b) => a.price - b.price); break;
      case 'price-desc': out.sort((a, b) => b.price - a.price); break;
      case 'newest': out.reverse(); break;
      default: break;
    }
    return out;
  }, [activeCat, search, sortBy]);

  const selectCat = (cat) => {
    setActiveCat(cat);
    setVisible(24);
    const params = {};
    if (cat !== 'All') params.cat = cat;
    if (sortBy !== 'default') params.sort = sortBy;
    setSearchParams(params);
  };

  const handleSort = (val) => {
    setSortBy(val);
    setVisible(24);
    const params = {};
    if (activeCat !== 'All') params.cat = activeCat;
    if (val !== 'default') params.sort = val;
    setSearchParams(params);
  };

  const catCount = (cat) => cat === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length;

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div>
      {/* ═══ SHOP HERO ═══ */}
      <div style={{
        position: 'relative', padding: '120px 64px 80px', textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(201,169,74,0.06) 0%, transparent 60%)',
        borderBottom: '1px solid var(--border)',
      }} className="shop-hero-new">
        <div className="label" style={{ marginBottom: 20 }}>// The Gift Shop</div>
        <h1 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 'clamp(44px, 6vw, 80px)',
          fontWeight: 400, lineHeight: 1.05, marginBottom: 20, letterSpacing: '-0.02em',
        }}>
          The Gift <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Shop</em>
        </h1>
        <p style={{
          font: '300 17px/1.7 DM Sans', color: 'var(--muted)',
          maxWidth: 520, margin: '0 auto 36px',
        }}>
          Take a piece of the night sky home. Every purchase supports dark sky preservation.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setVisible(24); }}
            placeholder="Search products..."
            style={{
              width: '100%', padding: '14px 16px 14px 44px',
              background: 'rgba(13,13,34,0.7)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r, 3px)',
              font: '400 15px DM Sans', color: 'var(--text)', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,74,0.4)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* ═══ CATEGORY & SORT BAR ═══ */}
      <div style={{
        position: 'sticky', top: 72, zIndex: 40,
        background: 'rgba(4,4,12,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }} className="shop-filter-bar">
        <div
          ref={catBarRef}
          style={{
            display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch', flex: 1,
          }}
          className="shop-cat-scroll"
        >
          {CATS.map(cat => (
            <button
              key={cat}
              onClick={() => selectCat(cat)}
              style={{
                padding: '14px 18px', whiteSpace: 'nowrap',
                background: activeCat === cat ? 'rgba(201,169,74,0.12)' : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeCat === cat ? 'var(--gold)' : 'transparent'}`,
                font: `${activeCat === cat ? '500' : '400'} 13px DM Sans`,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                color: activeCat === cat ? 'var(--gold)' : 'var(--muted)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {cat} <span style={{ opacity: 0.5, fontSize: 11, marginLeft: 4 }}>{catCount(cat)}</span>
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => handleSort(e.target.value)}
          style={{
            padding: '10px 32px 10px 12px', flexShrink: 0,
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 'var(--r, 3px)',
            font: '400 13px DM Sans', color: 'var(--muted)', cursor: 'pointer',
            appearance: 'none', outline: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%236b6880\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
          }}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div style={{
        padding: '16px 64px 0', font: '400 13px DM Sans', color: 'var(--muted)',
      }} className="shop-results-count">
        Showing {Math.min(visible, filtered.length)} of {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
      </div>

      {/* ═══ PRODUCT GRID ═══ */}
      <div style={{ padding: '24px 64px 100px' }} className="shop-grid-container">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, opacity: 0.3, color: 'var(--gold)', marginBottom: 16 }}>&#10022;</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, marginBottom: 8, color: 'var(--text)' }}>
              No products found
            </h3>
            <p style={{ font: '300 14px DM Sans', color: 'var(--muted)' }}>Try adjusting your search or explore a different category.</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
            }} className="shop-product-grid">
              {filtered.slice(0, visible).map((p) => {
                const isBestseller = BESTSELLER_IDS.has(p.id);
                const isNew = NEW_IDS.has(p.id);
                return (
                  <div
                    key={p.id}
                    className="shop-card"
                    onClick={() => navigate(`/product/${p.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="shop-card-img">
                      {(isBestseller || isNew) && (
                        <div className="shop-card-badge" style={{
                          position: 'absolute', top: 12, left: 12, zIndex: 2,
                          padding: '5px 10px',
                          background: isBestseller ? 'var(--gold)' : 'rgba(255,255,255,0.9)',
                          color: isBestseller ? '#04040c' : '#1a1a2e',
                          font: '600 9px/1 JetBrains Mono', letterSpacing: '0.1em', textTransform: 'uppercase',
                          borderRadius: 2,
                        }}>
                          {isBestseller ? 'Best Seller' : 'New'}
                        </div>
                      )}
                      {p.images[0] ? (
                        <img src={p.images[0]} alt={p.title} loading="lazy" />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          background: 'rgba(30,30,50,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--gold)', fontSize: 48, opacity: 0.3,
                        }}>&#10022;</div>
                      )}
                      <button
                        className="shop-card-qa"
                        onClick={(e) => handleQuickAdd(e, p)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        Quick Add
                      </button>
                    </div>
                    <div className="shop-card-info">
                      <div className="shop-card-cat">{p.category}</div>
                      <div className="shop-card-name">{p.title}</div>
                      <div className="shop-card-price">{fmt(p.price)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {visible < filtered.length && (
              <div style={{ textAlign: 'center', marginTop: 56, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={() => setVisible(v => v + 24)}
                >
                  Load More — {filtered.length - visible} remaining
                </button>
                {visible < filtered.length && (
                  <button
                    className="btn-ghost"
                    onClick={() => setVisible(filtered.length)}
                  >
                    Show All
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .shop-cat-scroll::-webkit-scrollbar { display: none; }
        .shop-card {
          position: relative;
          transition: transform 0.35s cubic-bezier(.16,1,.3,1);
        }
        .shop-card:hover {
          transform: scale(1.03);
        }
        .shop-card:hover .shop-card-img {
          box-shadow: 0 8px 32px rgba(212,175,55,0.15);
        }
        .shop-card-img {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: rgba(20,20,40,0.4);
          border-radius: var(--r, 3px);
          margin-bottom: 14px;
          transition: box-shadow 0.35s;
        }
        .shop-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(.16,1,.3,1);
        }
        .shop-card:hover .shop-card-img img {
          transform: scale(1.05);
        }
        .shop-card-qa {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 14px;
          background: rgba(4,4,12,0.9);
          backdrop-filter: blur(8px);
          border: none;
          color: var(--gold);
          font: 600 11px/1 JetBrains Mono;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(.16,1,.3,1);
        }
        .shop-card:hover .shop-card-qa {
          transform: translateY(0);
        }
        .shop-card-qa:hover {
          background: var(--gold);
          color: #04040c;
        }
        .shop-card-info {
          padding: 0 4px;
        }
        .shop-card-cat {
          font: 500 9px/1 JetBrains Mono;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 6px;
          opacity: 0.7;
        }
        .shop-card-name {
          font: 400 15px/1.35 DM Sans;
          color: var(--text);
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .shop-card-price {
          font: 500 15px/1 DM Sans;
          color: var(--gold);
        }
        @media (max-width: 1024px) {
          .shop-product-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .shop-hero-new { padding: 80px 24px 48px !important; }
          .shop-filter-bar { padding: 0 16px !important; }
          .shop-grid-container { padding: 16px 16px 80px !important; }
          .shop-product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .shop-results-count { padding: 12px 16px 0 !important; }
          .shop-card-qa { transform: translateY(0) !important; }
        }
        @media (max-width: 480px) {
          .shop-card-name { font-size: 13px; }
          .shop-card-price { font-size: 14px; }
          .shop-card-img { margin-bottom: 10px; }
        }
      `}</style>
    </div>
  );
}
