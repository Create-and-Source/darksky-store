import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../admin/data/store';

const CATS = ['All', 'Apparel', 'Kids', 'Outerwear', 'Tanks', 'Gifts'];

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest' },
];

const fmt = (cents) => cents ? `$${(cents / 100).toFixed(2)}` : '$—';

const TRUST = [
  { icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', icon2: 'M12 3a4 4 0 100 8 4 4 0 000-8z', label: 'Print on Demand', sub: 'Made just for you' },
  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Secure Checkout', sub: '256-bit SSL encryption' },
  { icon: 'M5 12h14M12 5l7 7-7 7', label: 'Free Shipping $50+', sub: 'Continental US orders' },
  { icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', label: 'Supports Dark Sky', sub: 'Every purchase gives back' },
];

const CATEGORY_CARDS = [
  { name: 'Apparel', img: '/images/darksky/milky-way.jpg', alt: 'Milky Way over desert' },
  { name: 'Kids', img: '/images/darksky/nebula.jpg', alt: 'Colorful nebula' },
  { name: 'Outerwear', img: '/images/darksky/observatory-hero.jpg', alt: 'Observatory dome at night' },
  { name: 'Gifts', img: '/images/darksky/saturn.jpg', alt: 'Saturn through telescope' },
  { name: 'Tanks', img: '/images/darksky/comet-neowise.jpg', alt: 'Comet NEOWISE' },
];

const LIFESTYLE_BANNERS = [
  { img: '/images/darksky/milky-way.jpg', text: 'Made for Stargazers', sub: 'Wearable astronomy from the Sonoran Desert' },
  { img: '/images/darksky/desert-night-sky.png', text: 'Wearable Astronomy', sub: 'Every purchase supports dark sky preservation' },
  { img: '/images/darksky/observatory-hero.jpg', text: 'Under the Darkest Skies', sub: 'Curated at the International Dark Sky Discovery Center' },
];

const FILLER_IMAGES = [
  '/images/darksky/andromeda.jpg',
  '/images/darksky/first-light-nebula.jpg',
  '/images/darksky/meteor-shower.jpg',
  '/images/darksky/bubble-nebula.jpg',
  '/images/darksky/crescent-nebula.jpg',
];

/* ── Reveal on scroll ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('sp-vis'); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '', delay = 0, style = {} }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`sp-reveal ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

/* ── Product Card ── */
function ProductCard({ product, onAddToCart, badge, size = 'normal', addedId }) {
  const navigate = useNavigate();
  const justAdded = addedId === product.id;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart(product);
  };

  return (
    <div
      className={`sp-card sp-card--${size}`}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="sp-card-img-wrap">
        {badge && <div className={`sp-badge ${badge === 'Best Seller' ? 'bestseller' : 'new'}`}>{badge}</div>}
        {product.images[0] ? (
          <img className="sp-card-img" src={product.images[0]} alt={product.title} loading="lazy" />
        ) : (
          <div className="sp-card-placeholder">✦</div>
        )}
        <button
          className={`sp-qa${justAdded ? ' added' : ''}`}
          onClick={handleQuickAdd}
        >
          {justAdded ? (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Added!</>
          ) : (
            <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Quick Add</>
          )}
        </button>
      </div>
      <div className="sp-card-info">
        <div className="sp-card-cat">{product.category}</div>
        <div className="sp-card-name">{product.title}</div>
        <div className="sp-card-price">{fmt(product.price)}</div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function Shop({ onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const RAW_PRODUCTS = getProducts();

  // Sort: physical first, then by category priority, then price high-to-low
  const CAT_PRIORITY = { Gifts: 0, Apparel: 1, Outerwear: 2, Tanks: 3, Kids: 4 };
  const PRODUCTS = useMemo(() => {
    return [...RAW_PRODUCTS].sort((a, b) => {
      // Physical inventory items first
      const aPhys = a.type === 'physical' ? 0 : 1;
      const bPhys = b.type === 'physical' ? 0 : 1;
      if (aPhys !== bPhys) return aPhys - bPhys;
      // Category priority
      const aCat = CAT_PRIORITY[a.category] ?? 2;
      const bCat = CAT_PRIORITY[b.category] ?? 2;
      if (aCat !== bCat) return aCat - bCat;
      // Price high to low
      return (b.price || 0) - (a.price || 0);
    });
  }, [RAW_PRODUCTS]);

  // Best sellers: adult products with images only (no infant/baby)
  const BESTSELLER_IDS = new Set(
    PRODUCTS.filter(p => p.images.length > 0 && !/(infant|baby|toddler)/i.test(p.title)).slice(0, 6).map(p => p.id)
  );
  const NEW_IDS = new Set(PRODUCTS.filter(p => !/(infant|baby|toddler)/i.test(p.title)).slice(-6).map(p => p.id));
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
    setActiveCat(searchParams.get('cat') || 'All');
    setSortBy(searchParams.get('sort') || 'default');
    setVisible(24);
  }, [searchParams]);

  useEffect(() => {
    if (activeCatRef.current && catBarRef.current) {
      const tab = activeCatRef.current;
      const container = catBarRef.current;
      container.scrollTo({ left: tab.offsetLeft - container.offsetLeft - 16, behavior: 'smooth' });
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

  const handleAdd = useCallback((product) => {
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }, [onAddToCart]);

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  /* Staff Picks — first 3 products with images (best sellers) */
  const staffPicks = PRODUCTS.filter(p => p.images.length > 0 && BESTSELLER_IDS.has(p.id)).slice(0, 3);

  /* Build masonry layout rows */
  const buildMasonryRows = (products) => {
    const rows = [];
    let i = 0;
    let bannerIdx = 0;
    const withImages = products.filter(p => p.images[0]);

    while (i < withImages.length) {
      // Insert lifestyle banner every ~10 products
      if (i > 0 && i % 10 === 0 && bannerIdx < LIFESTYLE_BANNERS.length) {
        rows.push({ type: 'banner', data: LIFESTYLE_BANNERS[bannerIdx++] });
      }

      const remaining = withImages.length - i;

      if (remaining >= 3) {
        // Pattern: large + medium
        rows.push({ type: 'row-lg-md', items: [withImages[i], withImages[i + 1], withImages[i + 2]] });
        i += 3;
      } else if (remaining === 2) {
        rows.push({ type: 'row-2', items: [withImages[i], withImages[i + 1]] });
        i += 2;
      } else {
        rows.push({ type: 'row-1', items: [withImages[i]] });
        i += 1;
      }

      if (i < withImages.length && remaining >= 6) {
        // 3 equal
        const threeItems = withImages.slice(i, i + 3);
        if (threeItems.length === 3) {
          rows.push({ type: 'row-3', items: threeItems });
          i += 3;
        }
      }

      if (i < withImages.length && remaining >= 9) {
        // medium + large
        const items2 = withImages.slice(i, i + 3);
        if (items2.length >= 2) {
          rows.push({ type: 'row-md-lg', items: items2.length >= 3 ? items2 : [...items2] });
          i += items2.length;
        }
      }

      if (i < withImages.length && remaining >= 12) {
        // 2 products + filler image
        const pair = withImages.slice(i, i + 2);
        if (pair.length === 2) {
          const fillerImg = FILLER_IMAGES[(i / 2) % FILLER_IMAGES.length];
          rows.push({ type: 'row-2-filler', items: pair, filler: fillerImg });
          i += 2;
        }
      }
    }
    return rows;
  };

  const isFiltered = activeCat !== 'All' || search.trim();
  const displayProducts = filtered.slice(0, visible);

  return (
    <div className="sp" data-page="shop">

      {/* ═══════════════════════════════════════
          HERO — Full width, cinematic
      ═══════════════════════════════════════ */}
      <section className="sp-hero" data-section="Hero">
        <img
          src="/images/darksky/desert-night-sky.png"
          alt="Desert landscape under a canopy of stars"
          className="sp-hero-bg"
        />
        <div className="sp-hero-overlay" />
        <div className="sp-hero-content">
          <Reveal>
            <div className="sp-hero-label" data-editable="shop-hero-label">// The Collection</div>
            <h1 className="sp-hero-title" data-editable="shop-hero-title">
              The <em>Collection</em>
            </h1>
            <p className="sp-hero-sub" data-editable="shop-hero-subtitle">
              Every purchase supports dark sky preservation
            </p>
          </Reveal>
        </div>
        <div className="sp-hero-fade" />
      </section>

      {/* ═══════════════════════════════════════
          FILTER BAR — Sticky
      ═══════════════════════════════════════ */}
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
          <div className="sp-bar-right">
            <div className="sp-search-wrap">
              <svg className="sp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                className="sp-search"
                value={search}
                onChange={e => { setSearch(e.target.value); setVisible(24); }}
                placeholder="Search..."
              />
              {search && (
                <button className="sp-search-clear" onClick={() => setSearch('')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
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
      </div>

      {/* ═══════════════════════════════════════
          STAFF PICKS — Featured collection (only when unfiltered)
      ═══════════════════════════════════════ */}
      {!isFiltered && (
        <section className="sp-section" data-section="StaffPicks">
          <Reveal>
            <div className="sp-section-header">
              <span className="sp-section-label">// Staff Picks</span>
              <h2 className="sp-section-title">Best <em>Sellers</em></h2>
            </div>
          </Reveal>
          <div className="sp-featured">
            {staffPicks.map((p, i) => (
              <Reveal key={p.id} delay={i * 100}>
                <ProductCard product={p} onAddToCart={handleAdd} badge="Best Seller" size="featured" addedId={addedId} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          CATEGORY NAVIGATION (only when unfiltered)
      ═══════════════════════════════════════ */}
      {!isFiltered && (
        <section className="sp-section sp-section--cats">
          <Reveal>
            <div className="sp-section-header">
              <span className="sp-section-label">// Browse</span>
              <h2 className="sp-section-title">Shop by <em>Category</em></h2>
            </div>
          </Reveal>
          <div className="sp-cat-cards">
            {CATEGORY_CARDS.map((cat, i) => (
              <Reveal key={cat.name} delay={i * 80}>
                <button
                  className="sp-cat-card"
                  onClick={() => selectCat(cat.name)}
                >
                  <img src={cat.img} alt={cat.alt} className="sp-cat-card-img" loading="lazy" />
                  <div className="sp-cat-card-overlay" />
                  <div className="sp-cat-card-content">
                    <span className="sp-cat-card-name">{cat.name}</span>
                    <span className="sp-cat-card-count">{catCount(cat.name)} items</span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          RESULTS INFO
      ═══════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════
          MAGAZINE MASONRY GRID (unfiltered)
      ═══════════════════════════════════════ */}
      <div className="sp-grid-wrap">
        {filtered.length === 0 ? (
          <div className="sp-empty">
            <div className="sp-empty-star">✦</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or explore a different category.</p>
            <button className="sp-empty-btn" onClick={clearFilters}>Clear All Filters</button>
          </div>
        ) : (
          /* Clean uniform grid for all views */
          <>
            <div className="sp-grid sp-grid--uniform">
              {displayProducts.filter(p => p.images?.[0]).slice(0, visible).map(p => {
                const badge = BESTSELLER_IDS.has(p.id) ? 'Best Seller' : NEW_IDS.has(p.id) ? 'New' : null;
                return (
                  <Reveal key={p.id}>
                    <ProductCard product={p} onAddToCart={handleAdd} badge={badge} addedId={addedId} />
                  </Reveal>
                );
              })}
            </div>
            {!isFiltered && visible < filtered.filter(p => p.images?.[0]).length && (
              <div className="sp-load-more">
                <button className="sp-load-btn" onClick={() => setVisible(v => v + 12)}>
                  View More Products<span className="sp-load-remaining">{filtered.filter(p => p.images?.[0]).length - visible} more</span>
                </button>
              </div>
            )}
            {isFiltered && visible < filtered.length && (
              <div className="sp-load-more">
                <button className="sp-load-btn" onClick={() => setVisible(v => v + 24)}>
                  Load More<span className="sp-load-remaining">{filtered.length - visible} remaining</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════
          TRUST / HELP / NEWSLETTER
      ═══════════════════════════════════════ */}
      <div className="sp-trust-section" data-section="Trust">
        <div className="sp-trust-grid">
          {TRUST.map((t, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="sp-trust-item">
                <div className="sp-trust-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={t.icon}/>{t.icon2 && <path d={t.icon2}/>}
                  </svg>
                </div>
                <div className="sp-trust-label" data-editable={`shop-trust-label-${i}`}>{t.label}</div>
                <div className="sp-trust-sub" data-editable={`shop-trust-sub-${i}`}>{t.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="sp-newsletter">
            <div className="sp-newsletter-text">
              <span className="sp-newsletter-label">// Stay in the Loop</span>
              <span className="sp-newsletter-title">New drops, events & dark sky stories</span>
            </div>
            <div className="sp-newsletter-form">
              <input type="email" className="sp-newsletter-input" placeholder="your@email.com" />
              <button className="sp-newsletter-btn">Subscribe</button>
            </div>
          </div>
        </Reveal>

        <div className="sp-help">
          <span>Need help choosing?</span>
          <button onClick={() => navigate('/contact')} className="sp-help-link">Get in touch →</button>
        </div>
      </div>

      <style>{SHOP_CSS}</style>
    </div>
  );
}

const SHOP_CSS = `
/* ═══════════════════════════════════════
   SHOP PAGE — Premium Editorial Layout
   ═══════════════════════════════════════ */

/* ── REVEAL ── */
.sp-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1);
}
.sp-reveal.sp-vis {
  opacity: 1;
  transform: none;
}

/* ═══ HERO ═══ */
.sp-hero {
  position: relative;
  height: 50vh;
  min-height: 380px;
  max-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.sp-hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.sp-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(4,4,12,0.55) 0%, rgba(4,4,12,0.75) 100%);
  z-index: 1;
}
.sp-hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 24px;
}
.sp-hero-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, var(--bg, #04040c), transparent);
  z-index: 2;
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
  font: 400 clamp(40px, 6vw, 72px)/1.05 'Playfair Display', serif;
  color: var(--text);
  margin: 0 0 18px;
  letter-spacing: -0.02em;
}
.sp-hero-title em {
  font-style: italic;
  color: var(--gold);
}
.sp-hero-sub {
  font: 300 clamp(15px, 2vw, 18px)/1.6 'Plus Jakarta Sans', sans-serif;
  color: rgba(255,255,255,0.6);
  margin: 0;
  letter-spacing: 0.04em;
}

/* ═══ FILTER BAR ═══ */
.sp-bar {
  position: sticky;
  top: 72px;
  z-index: 40;
  background: rgba(4,4,12,0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.sp-bar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.sp-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.sp-cats {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 24px), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 24px), transparent);
}
.sp-cats::-webkit-scrollbar { display: none; }
.sp-cat {
  padding: 16px 20px;
  white-space: nowrap;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font: 400 12px/1 'Plus Jakarta Sans', sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.sp-cat:hover { color: rgba(255,255,255,0.8); }
.sp-cat.active { color: var(--gold); border-bottom-color: var(--gold); font-weight: 600; }
.sp-cat-count { font-size: 10px; opacity: 0.4; margin-left: 5px; }
.sp-cat.active .sp-cat-count { opacity: 0.7; }

/* Search in bar */
.sp-search-wrap {
  position: relative;
}
.sp-search-icon {
  position: absolute;
  left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--muted);
  opacity: 0.5;
  pointer-events: none;
  transition: color 0.2s, opacity 0.2s;
}
.sp-search-wrap:focus-within .sp-search-icon { color: var(--gold); opacity: 1; }
.sp-search {
  width: 180px;
  padding: 9px 32px 9px 36px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  font: 400 13px 'Plus Jakarta Sans', sans-serif;
  color: var(--text);
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s, width 0.3s;
  -webkit-appearance: none;
}
.sp-search:focus {
  border-color: rgba(212,175,55,0.4);
  box-shadow: 0 0 0 3px rgba(212,175,55,0.06);
  width: 240px;
}
.sp-search::placeholder { color: rgba(255,255,255,0.2); }
.sp-search::-webkit-search-cancel-button { display: none; }
.sp-search-clear {
  position: absolute;
  right: 8px; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.08);
  border: none; color: var(--muted);
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.2s, color 0.2s;
}
.sp-search-clear:hover { background: rgba(212,175,55,0.15); color: var(--gold); }

.sp-sort {
  padding: 9px 32px 9px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  font: 400 12px 'Plus Jakarta Sans', sans-serif;
  color: var(--muted);
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b6880' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.2s;
}
.sp-sort:hover { border-color: rgba(255,255,255,0.15); }
.sp-sort:focus { border-color: rgba(212,175,55,0.3); }

/* ═══ SECTION HEADERS ═══ */
.sp-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 48px 0;
}
.sp-section--cats {
  padding-bottom: 20px;
}
.sp-section-header {
  margin-bottom: 40px;
}
.sp-section-label {
  display: block;
  font: 500 10px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 14px;
  opacity: 0.7;
}
.sp-section-title {
  font: 400 clamp(28px, 3.5vw, 42px)/1.1 'Playfair Display', serif;
  color: var(--text);
  letter-spacing: -0.02em;
}
.sp-section-title em {
  font-style: italic;
  color: var(--gold);
}

/* ═══ FEATURED / STAFF PICKS ═══ */
.sp-featured {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.sp-card--featured {
  max-width: 300px;
}
.sp-card--featured .sp-card-img-wrap {
  max-height: 280px;
}

/* ═══ CATEGORY CARDS ═══ */
.sp-cat-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.sp-cat-card {
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  text-align: left;
  display: block;
  width: 100%;
}
.sp-cat-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(.16,1,.3,1);
}
.sp-cat-card:hover .sp-cat-card-img {
  transform: scale(1.06);
}
.sp-cat-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(4,4,12,0.15) 0%, rgba(4,4,12,0.75) 100%);
  transition: background 0.3s;
}
.sp-cat-card:hover .sp-cat-card-overlay {
  background: linear-gradient(180deg, rgba(4,4,12,0.1) 0%, rgba(4,4,12,0.65) 100%);
}
.sp-cat-card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  z-index: 1;
}
.sp-cat-card-name {
  display: block;
  font: 500 clamp(16px, 2vw, 22px)/1.2 'Playfair Display', serif;
  color: #fff;
  font-style: italic;
  margin-bottom: 4px;
}
.sp-cat-card-count {
  font: 400 11px 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
}

/* ═══ RESULTS LINE ═══ */
.sp-results {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 48px 0;
  font: 400 13px 'Plus Jakarta Sans', sans-serif;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 12px;
}
.sp-clear-btn {
  background: none; border: none;
  color: var(--gold);
  font: 400 13px 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.sp-clear-btn:hover { opacity: 1; }

/* ═══ GRID WRAP ═══ */
.sp-grid-wrap {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 48px 80px;
}

/* ── Uniform grid ── */
.sp-grid--uniform {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
@media (max-width: 1024px) { .sp-grid--uniform { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .sp-grid--uniform { grid-template-columns: repeat(2, 1fr); gap: 12px; } }

/* ═══ MASONRY ROWS ═══ */
.sp-masonry-row {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
}
.sp-masonry--lg-md {
  grid-template-columns: 2fr 1fr;
}
.sp-masonry--md-lg {
  grid-template-columns: 1fr 2fr;
}
.sp-masonry--3 {
  grid-template-columns: repeat(3, 1fr);
}
.sp-masonry--2 {
  grid-template-columns: repeat(2, 1fr);
}
.sp-masonry--2-filler {
  grid-template-columns: 1fr 1fr 1fr;
}
.sp-masonry--1 {
  grid-template-columns: 1fr;
  max-width: 300px;
}
.sp-masonry-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sp-masonry-lg .sp-card-img-wrap {
  max-height: 300px;
}

/* ═══ PRODUCT CARD ═══ */
.sp-card {
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  background: var(--surface, #0a0a1a);
  overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s;
}
.sp-card:hover { transform: translateY(-2px); border-color: rgba(212,175,55,0.3); }
.sp-card-img-wrap {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: #f5f5f0;
  transition: box-shadow 0.45s cubic-bezier(.16,1,.3,1);
}
@media (max-width: 768px) { .sp-card-img-wrap { height: 220px; } }
.sp-card:hover .sp-card-img-wrap {
  box-shadow: 0 8px 28px rgba(212,175,55,0.1), 0 2px 8px rgba(0,0,0,0.3);
}
.sp-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.55s cubic-bezier(.16,1,.3,1);
  will-change: transform;
}
.sp-card:hover .sp-card-img {
  transform: scale(1.03);
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

/* Card info */
.sp-card-info { padding: 16px; }
.sp-card-cat {
  font: 600 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
  opacity: 0.7;
}
.sp-card-name {
  font: 400 15px/1.4 'Plus Jakarta Sans', sans-serif;
  color: rgba(255,255,255,0.9);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sp-card-price {
  font: 700 16px/1 'Plus Jakarta Sans', sans-serif;
  color: var(--gold);
}

/* ── Badge ── */
.sp-badge {
  position: absolute;
  top: 12px; left: 12px;
  z-index: 3;
  padding: 5px 12px;
  font: 600 9px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: 3px;
}
.sp-badge.bestseller {
  background: linear-gradient(135deg, #D4AF37, #F5E6A3, #D4AF37);
  background-size: 200% 200%;
  color: #04040c;
}
.sp-badge.new {
  background: rgba(255,255,255,0.92);
  color: #1a1a2e;
}

/* ── Quick Add ── */
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
  opacity: 0;
  transition: transform 0.35s cubic-bezier(.16,1,.3,1), opacity 0.3s, background 0.2s, color 0.2s;
}
.sp-card:hover .sp-qa {
  transform: translateY(0);
  opacity: 1;
}
.sp-qa:hover {
  background: var(--gold);
  color: #04040c;
}
.sp-qa.added {
  background: #10B981;
  color: #fff;
  transform: translateY(0);
  opacity: 1;
}

/* ═══ LIFESTYLE BANNER ═══ */
.sp-lifestyle {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sp-lifestyle-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sp-lifestyle-overlay {
  position: absolute;
  inset: 0;
  background: rgba(4,4,12,0.6);
}
.sp-lifestyle-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 24px;
}
.sp-lifestyle-title {
  font: 400 clamp(24px, 3vw, 36px)/1.15 'Playfair Display', serif;
  font-style: italic;
  color: #fff;
  margin: 0 0 8px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.4);
}
.sp-lifestyle-sub {
  font: 300 14px/1.5 'Plus Jakarta Sans', sans-serif;
  color: rgba(255,255,255,0.6);
  margin: 0;
  letter-spacing: 0.04em;
}

/* ═══ FILLER IMAGE ═══ */
.sp-filler-wrap { height: 100%; }
.sp-filler {
  position: relative;
  height: 100%;
  min-height: 280px;
  overflow: hidden;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sp-filler-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sp-filler-overlay {
  position: absolute;
  inset: 0;
  background: rgba(4,4,12,0.45);
}
.sp-filler-text {
  position: relative;
  z-index: 1;
  font: 400 18px/1.3 'Playfair Display', serif;
  font-style: italic;
  color: rgba(255,255,255,0.5);
  text-align: center;
  letter-spacing: 0.04em;
}

/* ═══ LOAD MORE ═══ */
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
  padding: 16px 48px;
  background: linear-gradient(135deg, #D4AF37, #F5E6A3, #D4AF37);
  background-size: 200% 200%;
  color: #04040c;
  border: none;
  border-radius: 100px;
  font: 600 12px/1 'Plus Jakarta Sans', sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.sp-load-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212,175,55,0.3);
}
.sp-load-remaining {
  font: 400 10px 'Plus Jakarta Sans', sans-serif;
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.6;
}
.sp-show-all {
  padding: 16px 36px;
  background: none;
  color: var(--muted);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px;
  font: 500 12px/1 'Plus Jakarta Sans', sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.sp-show-all:hover { border-color: var(--gold); color: var(--gold); }

/* ═══ EMPTY STATE ═══ */
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
  font: 300 15px/1.6 'Plus Jakarta Sans', sans-serif;
  color: var(--muted);
  margin: 0 0 28px;
}
.sp-empty-btn {
  padding: 14px 32px;
  background: none;
  color: var(--gold);
  border: 1px solid var(--gold);
  border-radius: 100px;
  font: 500 12px 'Plus Jakarta Sans', sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.sp-empty-btn:hover { background: var(--gold); color: #04040c; }

/* ═══ TRUST / NEWSLETTER / HELP ═══ */
.sp-trust-section {
  border-top: 1px solid rgba(255,255,255,0.04);
  padding: 72px 48px;
  max-width: 1400px;
  margin: 0 auto;
}
.sp-trust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-bottom: 56px;
}
.sp-trust-item { text-align: center; }
.sp-trust-icon {
  width: 52px; height: 52px;
  margin: 0 auto 14px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(212,175,55,0.06);
  border: 1px solid rgba(212,175,55,0.1);
  color: var(--gold);
}
.sp-trust-label {
  font: 500 13px/1 'Plus Jakarta Sans', sans-serif;
  color: rgba(255,255,255,0.85);
  margin-bottom: 6px;
}
.sp-trust-sub {
  font: 300 12px/1.4 'Plus Jakarta Sans', sans-serif;
  color: var(--muted);
}

/* Newsletter */
.sp-newsletter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 36px 40px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 6px;
  margin-bottom: 40px;
}
.sp-newsletter-text { flex: 1; }
.sp-newsletter-label {
  display: block;
  font: 500 10px 'JetBrains Mono', monospace;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
  opacity: 0.7;
}
.sp-newsletter-title {
  font: 400 18px/1.3 'Playfair Display', serif;
  font-style: italic;
  color: var(--text);
}
.sp-newsletter-form {
  display: flex;
  gap: 0;
  flex-shrink: 0;
}
.sp-newsletter-input {
  padding: 13px 18px;
  background: rgba(10,10,26,0.8);
  border: 1px solid rgba(255,255,255,0.08);
  border-right: none;
  border-radius: 6px 0 0 6px;
  font: 400 14px 'Plus Jakarta Sans', sans-serif;
  color: var(--text);
  outline: none;
  width: 240px;
  transition: border-color 0.2s;
}
.sp-newsletter-input:focus { border-color: rgba(212,175,55,0.4); }
.sp-newsletter-input::placeholder { color: rgba(255,255,255,0.2); }
.sp-newsletter-btn {
  padding: 13px 24px;
  background: var(--gold);
  color: #04040c;
  border: none;
  border-radius: 0 6px 6px 0;
  font: 600 11px 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.sp-newsletter-btn:hover { background: #E5C76B; }

/* Help */
.sp-help {
  text-align: center;
  padding-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.04);
  font: 300 15px 'Plus Jakarta Sans', sans-serif;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.sp-help-link {
  background: none; border: none;
  color: var(--gold);
  font: 400 15px 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  transition: opacity 0.2s;
}
.sp-help-link:hover { opacity: 0.8; }

/* ═══════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════ */

@media (max-width: 1200px) {
  .sp-grid--uniform { grid-template-columns: repeat(3, 1fr); }
  .sp-cat-cards { grid-template-columns: repeat(3, 1fr); }
  .sp-featured { gap: 16px; }
  .sp-masonry--3 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 860px) {
  .sp-hero { height: 40vh; min-height: 300px; }
  .sp-bar-inner { padding: 0 16px; }
  .sp-bar-right { display: none; }
  .sp-section { padding: 56px 20px 0; }
  .sp-results { padding: 16px 20px 0; }
  .sp-grid-wrap { padding: 16px 20px 64px; }

  .sp-featured { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .sp-featured > *:nth-child(3) { display: none; }

  .sp-cat-cards {
    grid-template-columns: repeat(5, minmax(140px, 1fr));
    overflow-x: auto;
    scrollbar-width: none;
    gap: 12px;
    padding-bottom: 4px;
  }
  .sp-cat-cards::-webkit-scrollbar { display: none; }
  .sp-cat-card { aspect-ratio: 3/4; }

  .sp-masonry-row {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .sp-masonry--1 {
    grid-template-columns: 1fr !important;
    max-width: none;
  }
  .sp-masonry--2-filler .sp-filler-wrap { display: none; }
  .sp-masonry-side {
    display: contents;
  }
  .sp-masonry-lg .sp-card-img-wrap { aspect-ratio: 3/4; }

  .sp-grid--uniform { grid-template-columns: repeat(2, 1fr); gap: 10px; }

  .sp-card { max-width: none; }
  .sp-card-img-wrap { border-radius: 6px; margin-bottom: 8px; max-height: 200px; }
  .sp-masonry-lg .sp-card-img-wrap { max-height: 200px; }
  .sp-qa {
    transform: translateY(0) !important;
    opacity: 1 !important;
    height: 36px;
    font-size: 10px;
  }
  .sp-card-name { font-size: 13px; }
  .sp-card-price { font-size: 14px; }
  .sp-card-cat { font-size: 9px; margin-bottom: 4px; }

  .sp-trust-section { padding: 48px 20px; }
  .sp-trust-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }

  .sp-newsletter {
    flex-direction: column;
    text-align: center;
    padding: 28px 24px;
    gap: 20px;
  }
  .sp-newsletter-input { width: 100%; }

  .sp-lifestyle { height: 160px; }

  .sp-help { flex-direction: column; gap: 4px; }
}

@media (max-width: 480px) {
  .sp-hero { height: 30vh; min-height: 220px; }
  .sp-hero-title { font-size: clamp(26px, 8vw, 40px); }
  .sp-hero-sub { font-size: 13px !important; }
  .sp-section { padding: 32px 12px 0; }
  .sp-section-title { font-size: clamp(22px, 6vw, 32px) !important; }
  .sp-results { padding: 10px 12px 0; }
  .sp-grid-wrap { padding: 10px 12px 48px; }
  .sp-bar-inner { padding: 0 8px; }

  .sp-cats { gap: 0; padding: 0 4px; }
  .sp-cat { padding: 14px 12px; font-size: 11px; letter-spacing: 0.04em; }

  /* All masonry rows become clean 2-column grid */
  .sp-masonry-row,
  .sp-masonry--lg-md,
  .sp-masonry--md-lg,
  .sp-masonry--3,
  .sp-masonry--2,
  .sp-masonry--2-filler,
  .sp-masonry--1 { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; margin-bottom: 8px; }
  .sp-masonry--1 { max-width: none; }
  .sp-masonry-side { flex-direction: row; gap: 8px; }
  .sp-grid--uniform { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; }
  .sp-card { max-width: none; max-height: none; }
  .sp-card-img-wrap { margin-bottom: 8px; max-height: 200px; border-radius: 6px; }
  .sp-masonry-lg .sp-card-img-wrap { max-height: 200px; }
  .sp-card-name { font-size: 13px; line-height: 1.35; }
  .sp-card-price { font-size: 14px; }
  .sp-card-cat { font-size: 9px; margin-bottom: 3px; }
  .sp-card-info { padding: 0 2px; }
  .sp-qa { height: 36px; font-size: 10px; gap: 4px; padding: 0 10px; }

  /* Staff picks: horizontal scroll */
  .sp-featured {
    display: flex !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory; gap: 12px !important; padding-bottom: 8px !important;
    scrollbar-width: none;
  }
  .sp-featured::-webkit-scrollbar { display: none; }
  .sp-featured > div { min-width: 260px; max-width: 280px; flex-shrink: 0; scroll-snap-align: start; }
  .sp-featured .sp-card { max-width: none; }
  .sp-featured .sp-card-img-wrap { max-height: 180px; }

  /* Category cards: horizontal scroll */
  .sp-cat-cards {
    display: flex !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory; gap: 8px !important; padding-bottom: 8px !important;
    scrollbar-width: none;
  }
  .sp-cat-cards::-webkit-scrollbar { display: none; }
  .sp-cat-cards > div { min-width: 140px; max-width: 160px; flex-shrink: 0; scroll-snap-align: start; }
  .sp-cat-card-name { font-size: 14px !important; }
  .sp-cat-card-count { font-size: 9px !important; }

  .sp-trust-section { padding: 32px 12px; }
  .sp-trust-grid { gap: 12px; grid-template-columns: repeat(2, 1fr) !important; }
  .sp-trust-icon { width: 36px; height: 36px; margin-bottom: 8px; }
  .sp-trust-label { font-size: 11px; }
  .sp-trust-sub { font-size: 10px; }
  .sp-lifestyle { height: 140px; border-radius: 6px; }
  .sp-lifestyle-title { font-size: 20px !important; }
  .sp-lifestyle-sub { font-size: 12px !important; }
  .sp-newsletter { padding: 24px 16px; gap: 12px; }
  .sp-newsletter-title { font-size: 15px !important; }
  .sp-help { padding: 16px 12px; font-size: 12px; }
  .sp-load-btn { padding: 14px 28px; font-size: 12px; }
  .sp-filler-wrap { display: none !important; }
}
`;
