import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

const CATEGORY_CARDS = [
  { name: 'Apparel', img: '/images/darksky/milky-way.jpg', alt: 'Milky Way over desert' },
  { name: 'Kids', img: '/images/darksky/nebula.jpg', alt: 'Colorful nebula' },
  { name: 'Outerwear', img: '/images/darksky/observatory-hero.jpg', alt: 'Observatory dome at night' },
  { name: 'Gifts', img: '/images/darksky/saturn.jpg', alt: 'Saturn through telescope' },
  { name: 'Tanks', img: '/images/darksky/comet-neowise.jpg', alt: 'Comet NEOWISE' },
];

const MARQUEE_ITEMS = [
  'ASTRONOMY', 'DARK SKY', 'SONORAN DESERT', 'STARGAZER APPAREL',
  'OBSERVATORY GEAR', 'NOCTURNAL WILDLIFE', 'DESERT NIGHTS', 'COSMIC GIFTS',
  'FOUNTAIN HILLS', 'CELESTIAL WEAR', 'NIGHT SKY', 'PRESERVATION'
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
          <div className="sp-card-placeholder">{'\u2726'}</div>
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
  const gridRef = useRef(null);

  const CAT_PRIORITY = { Gifts: 0, Apparel: 1, Outerwear: 2, Tanks: 3, Kids: 4 };
  const PRODUCTS = useMemo(() => {
    return [...RAW_PRODUCTS].sort((a, b) => {
      const aPhys = a.type === 'physical' ? 0 : 1;
      const bPhys = b.type === 'physical' ? 0 : 1;
      if (aPhys !== bPhys) return aPhys - bPhys;
      const aCat = CAT_PRIORITY[a.category] ?? 2;
      const bCat = CAT_PRIORITY[b.category] ?? 2;
      if (aCat !== bCat) return aCat - bCat;
      return (b.price || 0) - (a.price || 0);
    });
  }, [RAW_PRODUCTS]);

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
    // Scroll to the all-products grid
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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

  /* Derived product sets */
  const staffPicks = PRODUCTS.filter(p => p.images.length > 0 && BESTSELLER_IDS.has(p.id)).slice(0, 3);
  const newArrivals = PRODUCTS.filter(p => p.images.length > 0 && !/(infant|baby|toddler)/i.test(p.title)).slice(-4).reverse();
  const featuredCandidates = PRODUCTS.filter(p => p.images.length > 0 && !/(infant|baby|toddler)/i.test(p.title) && !BESTSELLER_IDS.has(p.id));
  const featuredProduct = featuredCandidates.length > 2 ? featuredCandidates[2] : featuredCandidates[0];

  const isFiltered = activeCat !== 'All' || search.trim();
  const displayProducts = filtered.slice(0, visible);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="sp" data-page="shop">

      {/* ═══════════════════════════════════════
          1. HERO — Cinematic full-height
      ═══════════════════════════════════════ */}
      <section className="sp-hero" data-section="Hero">
        <img
          src="/images/darksky/desert-night-sky.png"
          alt="Desert landscape under a canopy of stars"
          className="sp-hero-bg"
        />
        <div className="sp-hero-overlay" />
        <div className="sp-hero-content">
          <div className="sp-hero-label sp-hero-stagger" data-editable="shop-hero-label">// The Collection</div>
          <h1 className="sp-hero-title sp-hero-stagger" data-editable="shop-hero-title">
            The <em>Collection</em>
          </h1>
          <p className="sp-hero-sub sp-hero-stagger" data-editable="shop-hero-subtitle">
            Every purchase supports dark sky preservation
          </p>
          <button className="sp-hero-cta sp-hero-stagger" onClick={scrollToGrid}>
            Browse Collection
          </button>
        </div>
        <div className="sp-hero-scroll" onClick={scrollToGrid}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M7 10l5 5 5-5"/>
          </svg>
        </div>
        <div className="sp-hero-fade" />
      </section>

      {/* ═══════════════════════════════════════
          2. MARQUEE — Infinite scroll ticker
      ═══════════════════════════════════════ */}
      <div className="sp-marquee" data-section="Marquee">
        <div className="sp-marquee-track">
          {[0, 1].map(set => (
            <div className="sp-marquee-set" key={set} aria-hidden={set === 1}>
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={i}>
                  <span className="sp-marquee-text">{item}</span>
                  <span className="sp-marquee-dot">{'\u25C6'}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          3. NEW ARRIVALS — 4-column grid
      ═══════════════════════════════════════ */}
      <section className="sp-section" data-section="NewArrivals">
        <Reveal>
          <div className="sp-section-header">
            <span className="sp-section-label">// Just In</span>
            <h2 className="sp-section-title">New <em>Arrivals</em></h2>
          </div>
        </Reveal>
        <div className="sp-arrivals">
          {newArrivals.map((p, i) => (
            <Reveal key={p.id} delay={i * 120}>
              <ProductCard product={p} onAddToCart={handleAdd} badge="New" addedId={addedId} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. LIFESTYLE BANNER — Full-bleed parallax
      ═══════════════════════════════════════ */}
      <section className="sp-lifestyle-full" data-section="Lifestyle">
        <div className="sp-lifestyle-full-bg" />
        <div className="sp-lifestyle-full-overlay" />
        <Reveal className="sp-lifestyle-full-content">
          <span className="sp-lifestyle-full-label">// Wearable Astronomy</span>
          <h2 className="sp-lifestyle-full-title">Made for <em>Stargazers</em></h2>
          <p className="sp-lifestyle-full-sub">Curated at the International Dark Sky Discovery Center in Fountain Hills, Arizona</p>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════
          6. SHOP BY CATEGORY — Asymmetric grid
      ═══════════════════════════════════════ */}
      <section className="sp-section sp-section--cats" data-section="Categories">
        <Reveal>
          <div className="sp-section-header">
            <span className="sp-section-label">// Browse</span>
            <h2 className="sp-section-title">Shop by <em>Category</em></h2>
          </div>
        </Reveal>
        <div className="sp-cat-grid">
          {CATEGORY_CARDS.map((cat, i) => (
            <Reveal key={cat.name} delay={i * 80} className={i === 0 ? 'sp-cat-grid-hero' : ''}>
              <button
                className="sp-cat-card"
                onClick={() => selectCat(cat.name)}
              >
                <img src={cat.img} alt={cat.alt} className="sp-cat-card-img" loading="lazy" />
                <div className="sp-cat-card-overlay" />
                <div className="sp-cat-card-content">
                  <span className="sp-cat-card-name">{cat.name}</span>
                  <span className="sp-cat-card-count">{catCount(cat.name)} items</span>
                  <span className="sp-cat-card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7. STAFF PICKS / BEST SELLERS
      ═══════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════
          FEATURED SPOTLIGHT — Editorial hero product
      ═══════════════════════════════════════ */}
      {featuredProduct && (
        <section className="sp-spotlight" data-section="Featured">
          <div className="sp-spotlight-inner">
            <Reveal className="sp-spotlight-img-col">
              <div className="sp-spotlight-img-wrap" onClick={() => navigate(`/product/${featuredProduct.id}`)}>
                <img src={featuredProduct.images[0]} alt={featuredProduct.title} className="sp-spotlight-img" loading="lazy" />
                <div className="sp-spotlight-img-badge">Featured</div>
              </div>
            </Reveal>
            <Reveal className="sp-spotlight-info" delay={200}>
              <span className="sp-section-label">// Featured</span>
              <span className="sp-spotlight-cat">{featuredProduct.category}</span>
              <h2 className="sp-spotlight-name">{featuredProduct.title}</h2>
              <p className="sp-spotlight-desc">
                {featuredProduct.description?.replace(/<[^>]*>/g, '').slice(0, 180)}...
              </p>
              <div className="sp-spotlight-price">{fmt(featuredProduct.price)}</div>
              <div className="sp-spotlight-actions">
                <button className="sp-spotlight-btn" onClick={() => navigate(`/product/${featuredProduct.id}`)}>
                  Shop Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button className="sp-spotlight-add" onClick={(e) => { e.stopPropagation(); handleAdd(featuredProduct); }}>
                  {addedId === featuredProduct.id ? (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Added</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Add to Cart</>
                  )}
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          EDITORIAL MISSION
      ═══════════════════════════════════════ */}
      <section className="sp-mission" data-section="Mission">
        <div className="sp-mission-inner">
          <Reveal className="sp-mission-img-col">
            <div className="sp-mission-img-wrap">
              <img src="/images/darksky/observatory-hero.jpg" alt="Observatory dome under stars" className="sp-mission-img" loading="lazy" />
              <div className="sp-mission-accent" />
            </div>
          </Reveal>
          <Reveal className="sp-mission-text" delay={200}>
            <span className="sp-section-label">// Our Mission</span>
            <h2 className="sp-mission-title">Preserving the <em>Night Sky</em></h2>
            <p className="sp-mission-p">
              The International Dark Sky Discovery Center stands at the intersection of science, art, and conservation.
              Every item in our collection is chosen to inspire curiosity about the cosmos and connect you to the Sonoran Desert's pristine dark skies.
            </p>
            <p className="sp-mission-p">
              When you shop with us, you directly support dark sky preservation, public astronomy education, and the protection
              of nocturnal ecosystems. From stargazer apparel to cosmic gifts, each purchase helps keep the stars visible for future generations.
            </p>
            <div className="sp-mission-sig">{'\u2014'} Dark Sky Discovery Center</div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          9. ALL PRODUCTS — Filterable grid
      ═══════════════════════════════════════ */}
      <div ref={gridRef} className="sp-all-products-anchor" />

      <section className="sp-section sp-section--grid" data-section="AllProducts">
        <Reveal>
          <div className="sp-section-header">
            <span className="sp-section-label">// Full Collection</span>
            <h2 className="sp-section-title">All <em>Products</em></h2>
          </div>
        </Reveal>
      </section>

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

      <div className="sp-grid-wrap">
        {filtered.length === 0 ? (
          <div className="sp-empty">
            <div className="sp-empty-star">{'\u2726'}</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or explore a different category.</p>
            <button className="sp-empty-btn" onClick={clearFilters}>Clear All Filters</button>
          </div>
        ) : (
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
            {visible < filtered.filter(p => p.images?.[0]).length && (
              <div className="sp-load-more">
                <button className="sp-load-btn" onClick={() => setVisible(v => v + 12)}>
                  View More Products<span className="sp-load-remaining">{filtered.filter(p => p.images?.[0]).length - visible} more</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════
          10. TRUST / NEWSLETTER / HELP
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
          <button onClick={() => navigate('/contact')} className="sp-help-link">Get in touch {'\u2192'}</button>
        </div>
      </div>

      <style>{SHOP_CSS}</style>
    </div>
  );
}

const SHOP_CSS = `
/* ═══════════════════════════════════════
   SHOP PAGE — Premium Editorial Layout
   Dark Sky Discovery Center
   ═══════════════════════════════════════ */

/* ── REVEAL ── */
.sp-reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1);
}
.sp-reveal.sp-vis {
  opacity: 1;
  transform: none;
}

/* ═══════════════════════════════════════
   1. HERO
   ═══════════════════════════════════════ */
.sp-hero {
  position: relative;
  height: 75vh;
  min-height: 500px;
  max-height: 800px;
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
  filter: brightness(0.7);
}
.sp-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(4,4,12,0.3) 0%, rgba(4,4,12,0.6) 50%, rgba(4,4,12,0.9) 100%);
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
  height: 120px;
  background: linear-gradient(to top, var(--bg, #04040c), transparent);
  z-index: 2;
  pointer-events: none;
}

/* Staggered hero entrance */
.sp-hero-stagger {
  opacity: 0;
  transform: translateY(30px);
  animation: spHeroIn 0.9s cubic-bezier(.16,1,.3,1) forwards;
}
.sp-hero-stagger:nth-child(1) { animation-delay: 0.2s; }
.sp-hero-stagger:nth-child(2) { animation-delay: 0.45s; }
.sp-hero-stagger:nth-child(3) { animation-delay: 0.65s; }
.sp-hero-stagger:nth-child(4) { animation-delay: 0.85s; }
@keyframes spHeroIn {
  to { opacity: 1; transform: none; }
}

.sp-hero-label {
  font: 500 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 24px;
  opacity: 0.8;
}
.sp-hero-title {
  font: 400 clamp(44px, 7vw, 80px)/1.05 'Playfair Display', serif;
  color: var(--text);
  margin: 0 0 20px;
  letter-spacing: -0.02em;
}
.sp-hero-title em {
  font-style: italic;
  color: var(--gold);
}
.sp-hero-sub {
  font: 300 clamp(15px, 2vw, 19px)/1.6 'Plus Jakarta Sans', sans-serif;
  color: rgba(255,255,255,0.55);
  margin: 0 0 36px;
  letter-spacing: 0.04em;
}
.sp-hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 40px;
  background: transparent;
  border: 1px solid var(--gold);
  color: var(--gold);
  font: 500 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.35s cubic-bezier(.16,1,.3,1);
}
.sp-hero-cta:hover {
  background: var(--gold);
  color: #04040c;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(212,175,55,0.25);
}

/* Scroll indicator */
.sp-hero-scroll {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  animation: spScrollPulse 2s ease-in-out infinite;
  transition: color 0.2s;
}
.sp-hero-scroll:hover { color: var(--gold); }
@keyframes spScrollPulse {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.5; }
  50% { transform: translateX(-50%) translateY(8px); opacity: 1; }
}

/* ═══════════════════════════════════════
   2. MARQUEE
   ═══════════════════════════════════════ */
.sp-marquee {
  overflow: hidden;
  border-top: 1px solid rgba(212,175,55,0.12);
  border-bottom: 1px solid rgba(212,175,55,0.12);
  padding: 18px 0;
  background: rgba(212,175,55,0.02);
}
.sp-marquee-track {
  display: flex;
  width: max-content;
  animation: spMarquee 40s linear infinite;
}
.sp-marquee-set {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.sp-marquee-text {
  font: 500 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.2em;
  color: var(--gold);
  opacity: 0.5;
  white-space: nowrap;
}
.sp-marquee-dot {
  margin: 0 24px;
  font-size: 6px;
  color: var(--gold);
  opacity: 0.25;
}
@keyframes spMarquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ═══════════════════════════════════════
   3. FEATURED SPOTLIGHT
   ═══════════════════════════════════════ */
.sp-spotlight {
  padding: 100px 0;
  background: linear-gradient(180deg, var(--bg, #04040c) 0%, #080814 50%, var(--bg, #04040c) 100%);
}
.sp-spotlight-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 48px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 64px;
  align-items: center;
}
.sp-spotlight-img-wrap {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #eae7e0;
  aspect-ratio: 4/5;
}
.sp-spotlight-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(.16,1,.3,1);
}
.sp-spotlight-img-wrap:hover .sp-spotlight-img {
  transform: scale(1.04);
}
.sp-spotlight-img-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #D4AF37, #F5E6A3, #D4AF37);
  background-size: 200% 200%;
  animation: goldShimmer 3s ease infinite;
  color: #04040c;
  font: 600 9px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-radius: 2px;
}
.sp-spotlight-cat {
  display: block;
  font: 400 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 16px 0 12px;
}
.sp-spotlight-name {
  font: 400 clamp(28px, 3.5vw, 42px)/1.15 'Playfair Display', serif;
  color: var(--text);
  letter-spacing: -0.02em;
  margin: 0 0 20px;
}
.sp-spotlight-desc {
  font: 300 15px/1.7 'Plus Jakarta Sans', sans-serif;
  color: var(--muted);
  margin: 0 0 28px;
  max-width: 440px;
}
.sp-spotlight-price {
  font: 600 28px/1 'JetBrains Mono', monospace;
  color: var(--gold);
  letter-spacing: 0.02em;
  margin-bottom: 32px;
}
.sp-spotlight-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.sp-spotlight-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  background: var(--gold);
  color: #04040c;
  border: none;
  font: 600 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.3s cubic-bezier(.16,1,.3,1);
}
.sp-spotlight-btn:hover {
  background: #E5C76B;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212,175,55,0.3);
}
.sp-spotlight-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 28px;
  background: transparent;
  color: var(--gold);
  border: 1px solid rgba(212,175,55,0.3);
  font: 500 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.3s;
}
.sp-spotlight-add:hover {
  border-color: var(--gold);
  background: rgba(212,175,55,0.08);
}

/* ═══════════════════════════════════════
   4. SECTIONS (shared)
   ═══════════════════════════════════════ */
.sp-section {
  max-width: 1300px;
  margin: 0 auto;
  padding: 100px 48px 0;
}
.sp-section--cats {
  padding-bottom: 20px;
}
.sp-section--grid {
  padding-bottom: 0;
}
.sp-section-header {
  margin-bottom: 48px;
}
.sp-section-label {
  display: block;
  font: 500 10px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 16px;
  opacity: 0.7;
}
.sp-section-title {
  font: 400 clamp(30px, 4vw, 48px)/1.1 'Playfair Display', serif;
  color: var(--text);
  letter-spacing: -0.02em;
}
.sp-section-title em {
  font-style: italic;
  color: var(--gold);
}

/* ═══════════════════════════════════════
   4b. NEW ARRIVALS
   ═══════════════════════════════════════ */
.sp-arrivals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* ═══════════════════════════════════════
   5. LIFESTYLE BANNER — Full bleed
   ═══════════════════════════════════════ */
.sp-lifestyle-full {
  position: relative;
  height: 50vh;
  min-height: 360px;
  max-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-top: 100px;
}
.sp-lifestyle-full-bg {
  position: absolute;
  inset: 0;
  background: url('/images/darksky/milky-way.jpg') center/cover no-repeat;
  background-attachment: fixed;
  filter: brightness(0.55);
}
.sp-lifestyle-full-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(4,4,12,0.4) 0%, rgba(4,4,12,0.6) 100%);
}
.sp-lifestyle-full-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 24px;
  max-width: 700px;
}
.sp-lifestyle-full-label {
  display: block;
  font: 500 10px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 20px;
  opacity: 0.8;
}
.sp-lifestyle-full-title {
  font: 400 clamp(36px, 5vw, 60px)/1.1 'Playfair Display', serif;
  color: #fff;
  margin: 0 0 20px;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 30px rgba(0,0,0,0.4);
}
.sp-lifestyle-full-title em {
  font-style: italic;
  color: var(--gold);
}
.sp-lifestyle-full-sub {
  font: 300 clamp(14px, 1.8vw, 17px)/1.7 'Plus Jakarta Sans', sans-serif;
  color: rgba(255,255,255,0.6);
  margin: 0;
  letter-spacing: 0.03em;
}

/* ═══════════════════════════════════════
   6. CATEGORY GRID — Asymmetric
   ═══════════════════════════════════════ */
.sp-cat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 220px;
  gap: 16px;
}
.sp-cat-grid-hero {
  grid-column: span 2;
  grid-row: span 2;
}
.sp-cat-card {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid rgba(255,255,255,0.35);
  padding: 0;
  background: none;
  text-align: left;
  display: block;
  width: 100%;
  height: 100%;
  transition: border-color 0.4s, box-shadow 0.4s;
}
.sp-cat-card:hover {
  border-color: var(--gold);
  box-shadow: 0 0 0 1px var(--gold), 0 8px 24px rgba(212,175,55,0.12);
}
.sp-cat-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(.16,1,.3,1), filter 0.5s;
  filter: brightness(0.82);
}
.sp-cat-card:hover .sp-cat-card-img {
  transform: scale(1.06);
  filter: brightness(0.92);
}
.sp-cat-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(4,4,12,0.0) 0%, rgba(4,4,12,0.5) 100%);
  transition: background 0.4s;
}
.sp-cat-card:hover .sp-cat-card-overlay {
  background: linear-gradient(180deg, rgba(4,4,12,0.0) 0%, rgba(4,4,12,0.35) 100%);
}
.sp-cat-card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sp-cat-card-name {
  display: block;
  font: 500 clamp(18px, 2.5vw, 26px)/1.2 'Playfair Display', serif;
  color: #fff;
  font-style: italic;
}
.sp-cat-card-count {
  font: 400 10px 'JetBrains Mono', monospace;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
}
.sp-cat-card-arrow {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.4);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.4s cubic-bezier(.16,1,.3,1);
}
.sp-cat-card:hover .sp-cat-card-arrow {
  opacity: 1;
  transform: none;
  background: rgba(212,175,55,0.15);
  color: var(--gold);
}

/* ═══════════════════════════════════════
   7. STAFF PICKS / FEATURED
   ═══════════════════════════════════════ */
.sp-featured {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.sp-card--featured .sp-card-img-wrap {
  aspect-ratio: 1/1;
}

/* ═══════════════════════════════════════
   8. EDITORIAL MISSION
   ═══════════════════════════════════════ */
.sp-mission {
  padding: 120px 0;
  background: linear-gradient(180deg, var(--bg, #04040c) 0%, #07071a 50%, var(--bg, #04040c) 100%);
  margin-top: 80px;
}
.sp-mission-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: center;
}
.sp-mission-img-wrap {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 4/5;
}
.sp-mission-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(.16,1,.3,1);
}
.sp-mission-img-wrap:hover .sp-mission-img {
  transform: scale(1.03);
}
.sp-mission-accent {
  position: absolute;
  bottom: -12px;
  right: -12px;
  width: 80px;
  height: 80px;
  border: 2px solid var(--gold);
  border-radius: 2px;
  opacity: 0.3;
  pointer-events: none;
}
.sp-mission-title {
  font: 400 clamp(28px, 3.5vw, 44px)/1.15 'Playfair Display', serif;
  color: var(--text);
  letter-spacing: -0.02em;
  margin: 16px 0 28px;
}
.sp-mission-title em {
  font-style: italic;
  color: var(--gold);
}
.sp-mission-p {
  font: 300 15px/1.8 'Plus Jakarta Sans', sans-serif;
  color: rgba(255,255,255,0.55);
  margin: 0 0 20px;
  max-width: 480px;
}
.sp-mission-sig {
  font: 400 16px/1.4 'Playfair Display', serif;
  font-style: italic;
  color: var(--gold);
  margin-top: 32px;
  opacity: 0.7;
}

/* ═══════════════════════════════════════
   9. ALL PRODUCTS GRID
   ═══════════════════════════════════════ */
.sp-all-products-anchor {
  scroll-margin-top: 80px;
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
  max-width: 1300px;
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

/* Search */
.sp-search-wrap { position: relative; }
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

/* Results */
.sp-results {
  max-width: 1300px;
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

/* Grid wrap */
.sp-grid-wrap {
  max-width: 1300px;
  margin: 0 auto;
  padding: 24px 48px 100px;
}

/* Uniform grid */
.sp-grid--uniform {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* ═══════════════════════════════════════
   PRODUCT CARD
   ═══════════════════════════════════════ */
.sp-card {
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 4px;
  background: #101018;
  overflow: hidden;
  transition: all 0.45s cubic-bezier(.16,1,.3,1);
}
.sp-card:hover {
  transform: translateY(-4px);
  border-color: rgba(212,175,55,0.2);
  box-shadow: 0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,175,55,0.08);
}
.sp-card-img-wrap {
  position: relative;
  aspect-ratio: 1/1;
  overflow: hidden;
  background: #eae7e0;
}
.sp-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(.16,1,.3,1);
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

/* Card info */
.sp-card-info { padding: 16px 14px 18px; }
.sp-card-cat {
  font: 500 10px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 8px;
  opacity: 0.6;
}
.sp-card-name {
  font: 500 15px/1.35 'Playfair Display', serif;
  color: #F0EDE6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sp-card-price {
  font: 600 14px/1 'JetBrains Mono', monospace;
  color: var(--gold);
  letter-spacing: 0.02em;
}

/* Badge */
.sp-badge {
  position: absolute;
  top: 12px; left: 12px;
  z-index: 3;
  padding: 5px 12px;
  font: 600 9px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: 2px;
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

/* Quick Add */
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

/* Load more */
.sp-load-more {
  text-align: center;
  margin-top: 56px;
  display: flex;
  gap: 16px;
  justify-content: center;
}
.sp-load-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 48px;
  background: transparent;
  color: var(--gold);
  border: 1px solid var(--gold);
  border-radius: 0;
  font: 600 11px/1 'JetBrains Mono', monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(.16,1,.3,1);
}
.sp-load-btn:hover {
  background: var(--gold);
  color: #04040c;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212,175,55,0.25);
}
.sp-load-remaining {
  font: 400 10px 'Plus Jakarta Sans', sans-serif;
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.6;
}

/* Empty state */
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
  border-radius: 0;
  font: 500 11px 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.sp-empty-btn:hover { background: var(--gold); color: #04040c; }

/* ═══════════════════════════════════════
   10. TRUST / NEWSLETTER / HELP
   ═══════════════════════════════════════ */
.sp-trust-section {
  border-top: 1px solid rgba(255,255,255,0.04);
  padding: 80px 48px;
  max-width: 1300px;
  margin: 0 auto;
}
.sp-trust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-bottom: 64px;
}
.sp-trust-item { text-align: center; }
.sp-trust-icon {
  width: 52px; height: 52px;
  margin: 0 auto 14px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: rgba(212,175,55,0.04);
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
  padding: 40px 44px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 4px;
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
  border-radius: 0;
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
  border-radius: 0;
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
  .sp-arrivals { grid-template-columns: repeat(3, 1fr); }
  .sp-arrivals > *:nth-child(4) { display: none; }
  .sp-cat-grid { grid-auto-rows: 190px; }
}

@media (max-width: 1024px) {
  .sp-grid--uniform { grid-template-columns: repeat(3, 1fr); }
  .sp-spotlight-inner {
    grid-template-columns: 1fr;
    gap: 40px;
    max-width: 600px;
  }
  .sp-spotlight-img-wrap { aspect-ratio: 3/4; max-height: 500px; }
  .sp-mission-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .sp-mission-img-wrap { max-height: 400px; }
}

@media (max-width: 860px) {
  .sp-hero { height: 55vh; min-height: 400px; }
  .sp-hero-cta { padding: 14px 32px; }
  .sp-bar-inner { padding: 0 16px; }
  .sp-bar-right { display: none; }
  .sp-section { padding: 64px 20px 0; }
  .sp-results { padding: 16px 20px 0; }
  .sp-grid-wrap { padding: 16px 20px 64px; }

  .sp-arrivals { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .sp-arrivals > *:nth-child(3),
  .sp-arrivals > *:nth-child(4) { display: none; }
  .sp-featured { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .sp-featured > *:nth-child(3) { display: none; }

  .sp-cat-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 160px;
    gap: 10px;
  }
  .sp-cat-grid-hero {
    grid-column: span 2;
    grid-row: span 1;
  }

  .sp-grid--uniform { grid-template-columns: repeat(2, 1fr); gap: 12px; }

  .sp-qa {
    transform: translateY(0) !important;
    opacity: 1 !important;
    height: 36px;
    font-size: 10px;
  }
  .sp-card-name { font-size: 13px; }
  .sp-card-price { font-size: 14px; }
  .sp-card-cat { font-size: 9px; margin-bottom: 4px; }

  .sp-spotlight { padding: 64px 0; }
  .sp-spotlight-inner { padding: 0 20px; }
  .sp-mission { padding: 64px 0; margin-top: 40px; }
  .sp-mission-inner { padding: 0 20px; gap: 32px; }

  .sp-lifestyle-full { height: 40vh; min-height: 280px; margin-top: 64px; }
  .sp-lifestyle-full-bg { background-attachment: scroll; }

  .sp-trust-section { padding: 48px 20px; }
  .sp-trust-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }

  .sp-newsletter {
    flex-direction: column;
    text-align: center;
    padding: 28px 24px;
    gap: 20px;
  }
  .sp-newsletter-input { width: 100%; }

  .sp-help { flex-direction: column; gap: 4px; }
}

@media (max-width: 480px) {
  .sp-hero { height: 50vh; min-height: 340px; }
  .sp-hero-title { font-size: clamp(30px, 9vw, 48px); }
  .sp-hero-sub { font-size: 13px !important; margin-bottom: 24px; }
  .sp-hero-cta { padding: 13px 28px; font-size: 10px; }
  .sp-hero-scroll { bottom: 24px; }
  .sp-section { padding: 40px 14px 0; }
  .sp-section-title { font-size: clamp(24px, 7vw, 36px) !important; }
  .sp-section-header { margin-bottom: 28px; }
  .sp-results { padding: 10px 14px 0; }
  .sp-grid-wrap { padding: 10px 14px 48px; }
  .sp-bar-inner { padding: 0 8px; }

  .sp-cats { gap: 0; padding: 0 4px; }
  .sp-cat { padding: 14px 12px; font-size: 11px; letter-spacing: 0.04em; }

  /* Arrivals: horizontal scroll */
  .sp-arrivals {
    display: flex !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory; gap: 12px !important; padding-bottom: 8px !important;
    scrollbar-width: none;
  }
  .sp-arrivals::-webkit-scrollbar { display: none; }
  .sp-arrivals > div { min-width: 220px; max-width: 240px; flex-shrink: 0; scroll-snap-align: start; display: block !important; }
  .sp-arrivals > *:nth-child(3),
  .sp-arrivals > *:nth-child(4) { display: block !important; }

  /* Staff picks: horizontal scroll */
  .sp-featured {
    display: flex !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory; gap: 12px !important; padding-bottom: 8px !important;
    scrollbar-width: none;
  }
  .sp-featured::-webkit-scrollbar { display: none; }
  .sp-featured > div { min-width: 220px; max-width: 240px; flex-shrink: 0; scroll-snap-align: start; display: block !important; }
  .sp-featured > *:nth-child(3) { display: block !important; }

  /* Category grid: horizontal scroll */
  .sp-cat-grid {
    display: flex !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory; gap: 10px !important; padding-bottom: 8px;
    scrollbar-width: none;
  }
  .sp-cat-grid::-webkit-scrollbar { display: none; }
  .sp-cat-grid > div { min-width: 200px; max-width: 240px; flex-shrink: 0; scroll-snap-align: start; }
  .sp-cat-grid-hero { grid-column: unset; grid-row: unset; }
  .sp-cat-card { height: 200px; }

  .sp-grid--uniform { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; }
  .sp-card { max-width: none; }
  .sp-card-img-wrap { border-radius: 4px; }
  .sp-card-name { font-size: 13px; line-height: 1.3; }
  .sp-card-price { font-size: 13px; }
  .sp-card-cat { font-size: 9px; margin-bottom: 3px; }
  .sp-card-info { padding: 10px 8px 14px; }
  .sp-qa { height: 36px; font-size: 10px; gap: 4px; }

  .sp-spotlight { padding: 48px 0; }
  .sp-spotlight-inner { padding: 0 14px; gap: 28px; }
  .sp-spotlight-name { font-size: clamp(22px, 6vw, 32px); }
  .sp-spotlight-price { font-size: 22px; margin-bottom: 24px; }
  .sp-spotlight-actions { flex-direction: column; gap: 10px; }
  .sp-spotlight-btn, .sp-spotlight-add { width: 100%; justify-content: center; }

  .sp-mission { padding: 48px 0; margin-top: 20px; }
  .sp-mission-inner { padding: 0 14px; }
  .sp-mission-accent { width: 50px; height: 50px; bottom: -8px; right: -8px; }

  .sp-lifestyle-full { height: 35vh; min-height: 240px; margin-top: 40px; }
  .sp-lifestyle-full-title { font-size: clamp(26px, 7vw, 40px); }

  .sp-marquee-text { font-size: 10px; letter-spacing: 0.15em; }
  .sp-marquee-dot { margin: 0 16px; }

  .sp-trust-section { padding: 32px 14px; }
  .sp-trust-grid { gap: 12px; }
  .sp-trust-icon { width: 36px; height: 36px; margin-bottom: 8px; }
  .sp-trust-label { font-size: 11px; }
  .sp-trust-sub { font-size: 10px; }
  .sp-newsletter { padding: 24px 16px; gap: 12px; }
  .sp-newsletter-title { font-size: 15px !important; }
  .sp-help { padding: 16px 12px; font-size: 12px; }
  .sp-load-btn { padding: 14px 28px; }
}
`;
