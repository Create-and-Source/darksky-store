import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../admin/data/store';

const CATS = ['All', 'Apparel', 'Kids', 'Outerwear', 'Tanks', 'Gifts'];

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low \u2192 High' },
  { value: 'price-desc', label: 'Price: High \u2192 Low' },
  { value: 'newest', label: 'Newest' },
];

const fmt = (cents) => cents ? `$${(cents / 100).toFixed(2)}` : '$\u2014';

const TRUST = [
  { icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', icon2: 'M12 3a4 4 0 100 8 4 4 0 000-8z', label: 'Print on Demand', sub: 'Made just for you' },
  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Secure Checkout', sub: '256-bit SSL encryption' },
  { icon: 'M5 12h14M12 5l7 7-7 7', label: 'Free Shipping $50+', sub: 'Continental US orders' },
  { icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', label: 'Supports Dark Sky', sub: 'Every purchase gives back' },
];

export default function Shop({ onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const PRODUCTS = getProducts();
  const BESTSELLER_IDS = new Set(PRODUCTS.filter(p => p.images.length > 0).slice(0, 4).map(p => p.id));
  const NEW_IDS = new Set(PRODUCTS.slice(-6).map(p => p.id));
  const initialCat = searchParams.get('cat') || 'All';
  const initialSort = searchParams.get('sort') || 'default';
  const [activeCat, setActiveCat] = useState(initialCat);
  const [sortBy, setSortBy] = useState(initialSort);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(24);
  const [addedId, setAddedId] = useState(null);
  const catBarRef = useRef(null);
  const activeCatRef = useRef(null);

  useEffect(() => {
    const cat = searchParams.get('cat') || 'All';
    const sort = searchParams.get('sort') || 'default';
    setActiveCat(cat);
    setSortBy(sort);
    setVisible(24);
  }, [searchParams]);

  // Scroll active category tab into view
  useEffect(() => {
    if (activeCatRef.current && catBarRef.current) {
      const container = catBarRef.current;
      const tab = activeCatRef.current;
      const left = tab.offsetLeft - container.offsetLeft - 16;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [activeCat]);

  const filtered = useMemo(() => {
    let out = [...PRODUCTS];
    if (activeCat !== 'All') out = out.filter(p => p.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
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
    const params = {};
    if (cat !== 'All') params.cat = cat;
    if (sortBy !== 'default') params.sort = sortBy;
    setSearchParams(params);
  };

  const handleSort = (val) => {
    const params = {};
    if (activeCat !== 'All') params.cat = activeCat;
    if (val !== 'default') params.sort = val;
    setSearchParams(params);
  };

  const catCount = (cat) => cat === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length;

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  return (
    <div className="sp" data-page="shop">
      {/* ═══ HERO ═══ */}
      <div className="sp-hero" data-section="Hero">
        <img
          src="/images/darksky/desert-night-sky.png"
          alt="Desert landscape under a canopy of stars"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }}
        />
        <div className="sp-hero-glow" />
        <div className="sp-hero-label" data-editable="shop-hero-label">// The Collection</div>
        <h1 className="sp-hero-title" data-editable="shop-hero-title">
          Take the Night <em>Home</em>
        </h1>
        <p className="sp-hero-sub" data-editable="shop-hero-subtitle">
          Every purchase supports dark sky preservation
        </p>
        <div className="sp-search-wrap">
          <svg className="sp-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            className="sp-search"
            value={search}
            onChange={e => { setSearch(e.target.value); setVisible(24); }}
            placeholder="Search products..."
          />
          {search && (
            <button className="sp-search-clear" onClick={() => setSearch('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ═══ FILTER BAR ═══ */}
      <div className="sp-bar">
        <div className="sp-bar-inner">
          <div ref={catBarRef} className="sp-cats">
            {CATS.map(cat => (
              <button
                key={cat}
                ref={activeCat === cat ? activeCatRef : null}
                className={`sp-cat${activeCat === cat ? ' active' : ''}`}
                onClick={() => selectCat(cat)}
              >
                {cat}
                <span className="sp-cat-count">{catCount(cat)}</span>
              </button>
            ))}
          </div>
          <select
            className="sp-sort"
            value={sortBy}
            onChange={e => handleSort(e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══ RESULTS INFO ═══ */}
      <div className="sp-results">
        <span>
          {filtered.length === 0
            ? 'No products found'
            : `Showing ${Math.min(visible, filtered.length)} of ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`
          }
        </span>
        {(search || activeCat !== 'All') && (
          <button className="sp-clear-btn" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {/* ═══ PRODUCT GRID ═══ */}
      <div className="sp-grid-wrap">
        {filtered.length === 0 ? (
          <div className="sp-empty">
            <div className="sp-empty-star">&#10022;</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or explore a different category.</p>
            <button className="sp-empty-btn" onClick={clearFilters}>Clear All Filters</button>
          </div>
        ) : (
          <>
            <div className="sp-grid">
              {filtered.slice(0, visible).map((p) => {
                const isBestseller = BESTSELLER_IDS.has(p.id);
                const isNew = NEW_IDS.has(p.id);
                const justAdded = addedId === p.id;
                return (
                  <div
                    key={p.id}
                    className="sp-card"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <div className="sp-card-img-wrap">
                      {(isBestseller || isNew) && (
                        <div className={`sp-badge${isBestseller ? ' bestseller' : ' new'}`}>
                          {isBestseller ? 'Best Seller' : 'New'}
                        </div>
                      )}
                      {p.images[0] ? (
                        <img className="sp-card-img" src={p.images[0]} alt={p.title} loading="lazy" />
                      ) : (
                        <div className="sp-card-placeholder">&#10022;</div>
                      )}
                      <button
                        className={`sp-qa${justAdded ? ' added' : ''}`}
                        onClick={(e) => handleQuickAdd(e, p)}
                      >
                        {justAdded ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Added!
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                              <line x1="3" y1="6" x2="21" y2="6"/>
                              <path d="M16 10a4 4 0 01-8 0"/>
                            </svg>
                            Quick Add
                          </>
                        )}
                      </button>
                    </div>
                    <div className="sp-card-info">
                      <div className="sp-card-cat">{p.category}</div>
                      <div className="sp-card-name">{p.title}</div>
                      <div className="sp-card-price">{fmt(p.price)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visible < filtered.length && (
              <div className="sp-load-more">
                <button className="sp-load-btn" onClick={() => setVisible(v => v + 24)}>
                  Load More
                  <span className="sp-load-remaining">{filtered.length - visible} remaining</span>
                </button>
                <button className="sp-show-all" onClick={() => setVisible(filtered.length)}>
                  Show All
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ TRUST / HELP SECTION ═══ */}
      <div className="sp-trust-section" data-section="Trust">
        <div className="sp-trust-grid">
          {TRUST.map((t, i) => (
            <div key={i} className="sp-trust-item">
              <div className="sp-trust-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.icon}/>{t.icon2 && <path d={t.icon2}/>}
                </svg>
              </div>
              <div className="sp-trust-label" data-editable={`shop-trust-label-${i}`}>{t.label}</div>
              <div className="sp-trust-sub" data-editable={`shop-trust-sub-${i}`}>{t.sub}</div>
            </div>
          ))}
        </div>
        <div className="sp-help">
          <span>Need help choosing?</span>
          <button onClick={() => navigate('/contact')} className="sp-help-link">Get in touch &rarr;</button>
        </div>
      </div>

      <style>{SHOP_CSS}</style>
    </div>
  );
}

const SHOP_CSS = `
/* ═══════════════════════════════════════
   SHOP PAGE — Premium Collection Layout
   ═══════════════════════════════════════ */

/* ── HERO ── */
.sp-hero {
  position: relative;
  padding: 100px 64px 56px;
  text-align: center;
  overflow: hidden;
}
.sp-hero-glow {
  position: absolute;
  top: -80px; left: 50%; transform: translateX(-50%);
  width: 600px; height: 400px;
  background: radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.sp-hero-label {
  font: 500 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 20px;
  opacity: 0.8;
}
.sp-hero-title {
  font: 400 clamp(36px, 5vw, 52px)/1.1 'Playfair Display', serif;
  color: var(--text);
  margin: 0 0 16px;
  letter-spacing: -0.02em;
}
.sp-hero-title em {
  font-style: italic;
  color: var(--gold);
}
.sp-hero-sub {
  font: 300 16px/1.6 'DM Sans', sans-serif;
  color: var(--muted);
  margin: 0 auto 32px;
  max-width: 440px;
}

/* ── SEARCH ── */
.sp-search-wrap {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}
.sp-search-icon {
  position: absolute;
  left: 18px; top: 50%; transform: translateY(-50%);
  color: var(--gold);
  opacity: 0.5;
  pointer-events: none;
  transition: opacity 0.2s;
}
.sp-search-wrap:focus-within .sp-search-icon { opacity: 1; }
.sp-search {
  width: 100%;
  padding: 15px 44px 15px 50px;
  background: rgba(10,10,26,0.8);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  font: 400 15px 'DM Sans', sans-serif;
  color: var(--text);
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
  -webkit-appearance: none;
}
.sp-search:focus {
  border-color: rgba(212,175,55,0.4);
  box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
}
.sp-search::placeholder { color: rgba(255,255,255,0.2); }
.sp-search::-webkit-search-cancel-button { display: none; }
.sp-search-clear {
  position: absolute;
  right: 14px; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.06);
  border: none;
  color: var(--muted);
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.sp-search-clear:hover { background: rgba(212,175,55,0.15); color: var(--gold); }

/* ── FILTER BAR ── */
.sp-bar {
  position: sticky;
  top: 72px;
  z-index: 40;
  background: rgba(10,10,26,0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.sp-bar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 64px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.sp-cats {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 32px), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 32px), transparent);
}
.sp-cats::-webkit-scrollbar { display: none; }
.sp-cat {
  padding: 16px 20px;
  white-space: nowrap;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font: 400 13px/1 'DM Sans', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  position: relative;
}
.sp-cat:hover { color: rgba(255,255,255,0.8); }
.sp-cat.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
  font-weight: 500;
}
.sp-cat-count {
  font-size: 10px;
  opacity: 0.4;
  margin-left: 5px;
  font-weight: 400;
}
.sp-cat.active .sp-cat-count { opacity: 0.7; }
.sp-sort {
  padding: 10px 36px 10px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  font: 400 13px 'DM Sans', sans-serif;
  color: var(--muted);
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b6880' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: border-color 0.2s;
}
.sp-sort:hover { border-color: rgba(255,255,255,0.15); }
.sp-sort:focus { border-color: rgba(212,175,55,0.3); }

/* ── RESULTS LINE ── */
.sp-results {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 64px 0;
  font: 400 13px 'DM Sans', sans-serif;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 12px;
}
.sp-clear-btn {
  background: none;
  border: none;
  color: var(--gold);
  font: 400 13px 'DM Sans', sans-serif;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.sp-clear-btn:hover { opacity: 1; }

/* ── GRID ── */
.sp-grid-wrap {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 64px 80px;
}
.sp-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

/* ── PRODUCT CARD ── */
.sp-card {
  cursor: pointer;
  position: relative;
}
.sp-card-img-wrap {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: 8px;
  background: #f0ede8;
  margin-bottom: 14px;
  transition: box-shadow 0.4s cubic-bezier(.16,1,.3,1);
}
.sp-card:hover .sp-card-img-wrap {
  box-shadow: 0 12px 40px rgba(212,175,55,0.12), 0 4px 12px rgba(0,0,0,0.3);
}
.sp-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(.16,1,.3,1);
  will-change: transform;
}
.sp-card:hover .sp-card-img {
  transform: scale(1.05);
}
.sp-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e, #16162a);
  color: var(--gold);
  font-size: 48px;
  opacity: 0.25;
}

/* ── BADGE ── */
.sp-badge {
  position: absolute;
  top: 12px; left: 12px;
  z-index: 3;
  padding: 5px 10px;
  font: 600 9px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 4px;
}
.sp-badge.bestseller {
  background: var(--gold);
  color: #04040c;
}
.sp-badge.new {
  background: rgba(255,255,255,0.92);
  color: #1a1a2e;
  backdrop-filter: blur(4px);
}

/* ── QUICK ADD ── */
.sp-qa {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: rgba(4,4,12,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: none;
  color: var(--gold);
  font: 600 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(.16,1,.3,1), background 0.2s, color 0.2s;
}
.sp-card:hover .sp-qa {
  transform: translateY(0);
}
.sp-qa:hover {
  background: var(--gold);
  color: #04040c;
}
.sp-qa.added {
  background: #10B981;
  color: #fff;
  transform: translateY(0);
}

/* ── CARD INFO ── */
.sp-card-info {
  padding: 0 2px;
}
.sp-card-cat {
  font: 500 10px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 7px;
  opacity: 0.6;
}
.sp-card-name {
  font: 400 14px/1.4 'DM Sans', sans-serif;
  color: rgba(255,255,255,0.88);
  margin-bottom: 7px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sp-card-price {
  font: 600 16px/1 'DM Sans', sans-serif;
  color: var(--gold);
}

/* ── LOAD MORE ── */
.sp-load-more {
  text-align: center;
  margin-top: 56px;
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
.sp-load-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 40px;
  background: var(--gold);
  color: #04040c;
  border: none;
  border-radius: 6px;
  font: 600 13px/1 'DM Sans', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.sp-load-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(212,175,55,0.3);
}
.sp-load-remaining {
  font: 400 11px 'DM Sans', sans-serif;
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.6;
}
.sp-show-all {
  padding: 16px 32px;
  background: none;
  color: var(--muted);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  font: 500 13px/1 'DM Sans', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.sp-show-all:hover {
  border-color: var(--gold);
  color: var(--gold);
}

/* ── EMPTY STATE ── */
.sp-empty {
  text-align: center;
  padding: 80px 24px;
}
.sp-empty-star {
  font-size: 56px;
  color: var(--gold);
  opacity: 0.2;
  margin-bottom: 20px;
}
.sp-empty h3 {
  font: 400 28px/1.2 'Playfair Display', serif;
  color: var(--text);
  margin: 0 0 10px;
}
.sp-empty p {
  font: 300 15px/1.6 'DM Sans', sans-serif;
  color: var(--muted);
  margin: 0 0 28px;
}
.sp-empty-btn {
  padding: 14px 32px;
  background: none;
  color: var(--gold);
  border: 1px solid var(--gold);
  border-radius: 6px;
  font: 500 13px 'DM Sans', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.sp-empty-btn:hover {
  background: var(--gold);
  color: #04040c;
}

/* ── TRUST / HELP ── */
.sp-trust-section {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 64px;
  max-width: 1400px;
  margin: 0 auto;
}
.sp-trust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-bottom: 48px;
}
.sp-trust-item {
  text-align: center;
}
.sp-trust-icon {
  width: 48px; height: 48px;
  margin: 0 auto 14px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(212,175,55,0.06);
  color: var(--gold);
}
.sp-trust-label {
  font: 500 13px/1 'DM Sans', sans-serif;
  color: rgba(255,255,255,0.85);
  margin-bottom: 6px;
}
.sp-trust-sub {
  font: 300 12px/1.4 'DM Sans', sans-serif;
  color: var(--muted);
}
.sp-help {
  text-align: center;
  padding-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.04);
  font: 300 15px 'DM Sans', sans-serif;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.sp-help-link {
  background: none;
  border: none;
  color: var(--gold);
  font: 400 15px 'DM Sans', sans-serif;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s;
}
.sp-help-link:hover { opacity: 0.8; }

/* ═══════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════ */

@media (max-width: 1200px) {
  .sp-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .sp-hero { padding: 80px 24px 40px; }
  .sp-hero-title { font-size: clamp(32px, 8vw, 44px); }
  .sp-hero-sub { font-size: 15px; margin-bottom: 24px; }
  .sp-bar-inner { padding: 0 16px; }
  .sp-results { padding: 12px 16px 0; }
  .sp-grid-wrap { padding: 16px 16px 64px; }
  .sp-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .sp-card-img-wrap { border-radius: 6px; margin-bottom: 10px; }
  .sp-qa {
    transform: translateY(0) !important;
    height: 40px;
    font-size: 10px;
  }
  .sp-card-name { font-size: 13px; }
  .sp-card-price { font-size: 14px; }
  .sp-card-cat { font-size: 9px; margin-bottom: 5px; }
  .sp-trust-section { padding: 40px 16px; }
  .sp-trust-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .sp-load-btn { padding: 14px 32px; }
  .sp-cat { padding: 14px 16px; font-size: 12px; }
  .sp-help { flex-direction: column; gap: 4px; }
}

@media (max-width: 480px) {
  .sp-hero { padding: 72px 16px 32px; }
  .sp-grid { gap: 8px; }
  .sp-card-img-wrap { margin-bottom: 8px; }
  .sp-card-name { font-size: 12px; line-height: 1.3; }
  .sp-card-price { font-size: 13px; }
  .sp-card-cat { font-size: 8px; margin-bottom: 4px; }
  .sp-card-info { padding: 0; }
  .sp-trust-grid { gap: 16px; }
  .sp-trust-label { font-size: 12px; }
  .sp-trust-sub { font-size: 11px; }
}
`;
