import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';

const CATS = ['All', 'Apparel', 'Kids', 'Gifts', 'Outerwear', 'Tanks'];

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'alpha', label: 'A-Z' },
];

export default function Shop({ onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'All';
  const initialSort = searchParams.get('sort') || 'default';
  const [activeCat, setActiveCat] = useState(initialCat);
  const [sortBy, setSortBy] = useState(initialSort);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(24);

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
    // Sort
    switch (sortBy) {
      case 'price-asc': out.sort((a, b) => a.price - b.price); break;
      case 'price-desc': out.sort((a, b) => b.price - a.price); break;
      case 'newest': out.reverse(); break;
      case 'alpha': out.sort((a, b) => a.title.localeCompare(b.title)); break;
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

  return (
    <div>
      {/* Shop Hero */}
      <div className="shop-hero">
        <div className="label" style={{ marginBottom: 14 }}>// The Collection</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, lineHeight: 1 }}>
            {activeCat === 'All' ? <><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>All</em> Products</> : <>{activeCat}</>}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select
              className="shop-sort"
              value={sortBy}
              onChange={e => handleSort(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="search"
              className="shop-search"
              placeholder="Search the cosmos..."
              value={search}
              onChange={e => { setSearch(e.target.value); setVisible(24); }}
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

      {/* Results Count */}
      <div className="shop-results-count">
        Showing {Math.min(visible, filtered.length)} of {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
      </div>

      {/* Product Grid */}
      <div style={{ padding: '32px 64px 100px' }}>
        {filtered.length === 0 ? (
          <div className="shop-empty">
            <div className="shop-empty-icon">&#10022;</div>
            <h3>No products found in this quadrant</h3>
            <p>Try adjusting your search or explore a different category to discover dark sky treasures.</p>
          </div>
        ) : (
          <>
            <div className="grid">
              {filtered.slice(0, visible).map((p, i) => (
                <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} delay={Math.min((i % 8) * 50, 280)} />
              ))}
            </div>
            {visible < filtered.length && (
              <div style={{ textAlign: 'center', marginTop: 56 }}>
                <button
                  className="btn-ghost"
                  onClick={() => setVisible(v => v + 24)}
                >
                  Load More -- {filtered.length - visible} remaining
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
