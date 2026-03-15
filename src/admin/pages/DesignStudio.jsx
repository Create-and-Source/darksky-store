// Design Studio — AI image generation + gallery browser
// Connects to Desert Vision Studio (Supabase Edge Function for generation, Supabase DB for gallery)
// Gallery table: gallery_images — columns logged on first fetch (check console)

import { useState, useEffect, useRef, useCallback } from 'react';
import { gallerySupabase, GENERATE_URL, SUPABASE_ANON_KEY } from '../supabaseGallery';
import { useToast } from '../AdminLayout';
import PageTour from '../components/PageTour';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)', shadowHover: '0 8px 24px rgba(0,0,0,0.1)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const STYLES = ['Painterly', 'Realistic', 'Action Shot', 'Watercolor', 'Abstract', 'Dreamy'];

async function downloadImage(url, filename) {
  try {
    const r = await fetch(url);
    const blob = await r.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'darksky-artwork.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch { window.open(url, '_blank'); }
}
const CATEGORIES = ['All', 'Creatures', 'Dark Sky', 'Flora', 'Geology', 'Favorites'];

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'yesterday';
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getImageUrl(img) {
  return img.image_url || img.url || img.storage_path || '';
}

// ── Skeleton loader ──
function SkeletonCard() {
  return (
    <div style={{ background: C.card, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
      <div style={{ aspectRatio: '1', background: `linear-gradient(90deg, #f0ede8 25%, #e8e5df 50%, #f0ede8 75%)`, backgroundSize: '200% 100%', animation: 'dsShimmer 1.5s infinite' }} />
      <div style={{ padding: 14 }}>
        <div style={{ height: 12, background: '#eae7e0', borderRadius: 4, marginBottom: 8, width: '80%' }} />
        <div style={{ height: 10, background: '#eae7e0', borderRadius: 4, width: '50%' }} />
      </div>
    </div>
  );
}

export default function DesignStudio() {
  const toast = useToast();

  // Generator state
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Painterly');
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null); // { url, prompt, style }
  const promptRef = useRef(null);

  // Gallery state
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [modal, setModal] = useState(null); // image object

  // ── Fetch gallery ──
  const fetchGallery = useCallback(async () => {
    try {
      const { data, error } = await gallerySupabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Log columns on first fetch for debugging
      if (data && data.length > 0) {
        console.log('Gallery image columns:', Object.keys(data[0]));
        console.log('First image object:', data[0]);
      }

      setImages(data || []);
    } catch (err) {
      console.error('Gallery fetch error:', err);
      toast('Could not load gallery', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  // ── Generate image ──
  const handleGenerate = async (surprise = false) => {
    if (!surprise && !prompt.trim()) {
      toast('Enter a prompt to generate artwork', 'error');
      return;
    }

    setGenerating(true);
    setPreview(null);

    try {
      const response = await fetch(GENERATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          prompt: surprise ? '' : prompt.trim(),
          style: style.toLowerCase(),
          surprise,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        let msg = 'Generation failed';
        try { msg = JSON.parse(errBody).error || msg; } catch {}
        throw new Error(msg);
      }

      const result = await response.json();
      const imageUrl = result.image_url || result.url || result.imageUrl || '';

      if (!imageUrl) throw new Error('No image returned');

      setPreview({
        url: imageUrl,
        prompt: result.prompt || prompt.trim() || 'Surprise generation',
        style: result.style || style,
      });

      toast('Artwork generated!');

      // Refresh gallery to show the new image
      setTimeout(() => fetchGallery(), 1500);

    } catch (err) {
      console.error('Generation error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        toast('Generation service unavailable — try desert-dream-drawer.lovable.app', 'error');
      } else {
        toast(err.message || 'Generation failed', 'error');
      }
    } finally {
      setGenerating(false);
    }
  };

  // ── Toggle favorite ──
  const toggleFavorite = async (img) => {
    const newVal = !img.is_favorite;
    // Optimistic update
    setImages(prev => prev.map(i => i.id === img.id ? { ...i, is_favorite: newVal } : i));
    if (modal && modal.id === img.id) setModal({ ...modal, is_favorite: newVal });

    try {
      const { error } = await gallerySupabase
        .from('gallery_images')
        .update({ is_favorite: newVal })
        .eq('id', img.id);
      if (error) throw error;
    } catch {
      // Revert
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, is_favorite: !newVal } : i));
      toast('Could not update favorite', 'error');
    }
  };

  // ── Filter + sort gallery ──
  const filtered = images.filter(img => {
    if (filter === 'Favorites') return img.is_favorite;
    if (filter !== 'All') return (img.category || '').toLowerCase() === filter.toLowerCase();
    return true;
  }).filter(img => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (img.prompt || '').toLowerCase().includes(q) || (img.style || '').toLowerCase().includes(q);
  });

  if (sortAsc) filtered.reverse();

  const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: C.shadow };
  const labelStyle = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2 };
  const pillBase = { padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', font: `500 12px ${FONT}`, letterSpacing: '0.02em', transition: 'all 0.2s' };

  return (
    <div>
      <PageTour storageKey="ds_tour_design" steps={[
        { target: '#tour-design-prompt', title: 'Prompt', text: 'Describe the artwork you want to generate. Pick a style and click Generate.' },
        { target: '#tour-design-gallery', title: 'Gallery', text: 'Browse all your generated artwork. Filter by category, search by prompt, and favorite your best images.' },
      ]} />

      {/* ═══ GENERATOR SECTION ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, #F5F3EF 0%, #FAFAF8 100%)',
        borderBottom: `1px solid ${C.border}`,
        padding: '8px 0 24px',
        marginBottom: 24,
      }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ font: `600 24px ${FONT}`, color: C.text, margin: '0 0 6px' }}>Design Studio</h1>
          <p style={{ font: `400 14px ${FONT}`, color: C.text2, margin: 0 }}>
            Generate AI artwork for products, backgrounds, and marketing. Powered by Desert Vision Studio.
          </p>
        </div>

        {/* Prompt */}
        <div id="tour-design-prompt" style={{ marginBottom: 20 }}>
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="A rattlesnake coiled on warm sandstone beneath a lightning storm..."
            disabled={generating}
            rows={2}
            style={{
              width: '100%', padding: '12px 14px',
              background: '#FFFFFF', border: `1.5px solid ${generating ? C.muted : C.border}`,
              borderRadius: 8, font: `400 14px ${FONT}`, color: C.text,
              outline: 'none', resize: 'vertical', transition: 'border-color 0.2s, box-shadow 0.2s',
              boxSizing: 'border-box', lineHeight: 1.5,
              opacity: generating ? 0.5 : 1,
            }}
            onFocus={e => { e.target.style.borderColor = C.gold; e.target.style.boxShadow = `0 0 0 3px ${C.gold}15`; }}
            onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Style pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ ...labelStyle, alignSelf: 'center', marginRight: 4 }}>Style</span>
          {STYLES.map(s => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              disabled={generating}
              style={{
                ...pillBase,
                background: style === s ? C.gold : 'transparent',
                color: style === s ? '#fff' : C.text2,
                border: style === s ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
              }}
            >{s}</button>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleGenerate(false)}
            disabled={generating || !prompt.trim()}
            style={{
              ...pillBase,
              padding: '12px 32px',
              background: generating ? C.muted : C.gold,
              color: '#fff',
              fontSize: 13, fontWeight: 600,
              opacity: (!prompt.trim() && !generating) ? 0.5 : 1,
            }}
          >
            {generating ? 'Creating artwork...' : 'Generate'}
          </button>
          <button
            onClick={() => handleGenerate(true)}
            disabled={generating}
            style={{
              ...pillBase,
              padding: '12px 28px',
              background: 'transparent',
              color: C.text2,
              border: `1px solid ${C.border}`,
              fontSize: 13,
            }}
          >
            Surprise Me
          </button>
        </div>

        {/* Generating animation */}
        {generating && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, marginTop: 24, padding: 20,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              border: `3px solid ${C.border}`, borderTopColor: C.gold,
              animation: 'dsSpinner 0.8s linear infinite',
            }} />
            <span style={{ font: `500 14px ${FONT}`, color: C.text2 }}>Creating artwork... this may take up to 30 seconds</span>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div style={{ ...cardStyle, marginTop: 24, overflow: 'hidden' }}>
            <img
              src={preview.url}
              alt={preview.prompt}
              style={{ width: '100%', maxHeight: 500, objectFit: 'contain', background: '#f0ede8', display: 'block' }}
            />
            <div style={{ padding: '20px 24px' }}>
              <p style={{ font: `400 14px ${FONT}`, color: C.text, margin: '0 0 4px', lineHeight: 1.5 }}>
                {preview.prompt}
              </p>
              <p style={{ font: `400 12px ${MONO}`, color: C.muted, margin: '0 0 16px', letterSpacing: 0.5 }}>
                Style: {preview.style}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => downloadImage(preview.url, `darksky-${(preview.prompt || '').split(/\s+/).slice(0,3).join('-').toLowerCase().replace(/[^a-z0-9-]/g,'')}.png`)}
                  style={{ ...pillBase, padding: '8px 18px', background: C.gold, color: '#fff', fontSize: 12 }}
                >Download</button>
                <button
                  onClick={() => { navigator.clipboard.writeText(preview.url); toast('Image URL copied'); }}
                  style={{ ...pillBase, padding: '8px 18px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 12 }}
                >Use as Product Image</button>
                <button
                  onClick={() => { setPreview(null); setPrompt(''); promptRef.current?.focus(); }}
                  style={{ ...pillBase, padding: '8px 18px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 12 }}
                >Generate Another</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ GALLERY SECTION ═══ */}
      <div id="tour-design-gallery">
        {/* Gallery header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ font: `600 20px ${FONT}`, color: C.text, margin: '0 0 2px' }}>Your Artwork</h2>
            <span style={{ font: `400 13px ${FONT}`, color: C.muted }}>{images.length} image{images.length !== 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            style={{ ...pillBase, padding: '6px 14px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 12 }}
          >
            {sortAsc ? 'Oldest' : 'Newest'} first
          </button>
        </div>

        {/* Filter + search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                ...pillBase, padding: '6px 14px', fontSize: 12,
                background: filter === cat ? C.gold : 'transparent',
                color: filter === cat ? '#fff' : C.text2,
                border: filter === cat ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
              }}
            >{cat}</button>
          ))}
          <input
            type="search"
            placeholder="Search prompts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '6px 14px', background: '#fff', border: `1px solid ${C.border}`,
              borderRadius: 100, font: `400 12px ${FONT}`, color: C.text,
              outline: 'none', width: 180, marginLeft: 'auto',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = C.gold}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="ds-gallery-grid">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, color: C.muted, marginBottom: 12, opacity: 0.3 }}>&#10022;</div>
            <p style={{ font: `400 15px ${FONT}`, color: C.muted }}>
              {images.length === 0 ? 'No artwork yet. Generate your first image above!' : 'No images match your filter.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="ds-gallery-grid">
            {filtered.map(img => (
              <div
                key={img.id}
                onClick={() => setModal(img)}
                style={{
                  ...cardStyle, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = C.shadowHover; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = C.shadow; }}
              >
                <div style={{ height: 200, overflow: 'hidden', background: '#f0ede8', position: 'relative' }}>
                  <img
                    src={getImageUrl(img)}
                    alt={img.prompt || 'Generated artwork'}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  {/* Favorite heart */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite(img); }}
                    title={img.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={img.is_favorite ? C.gold : 'none'} stroke={C.gold} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                  </button>
                  {/* Category badge */}
                  {img.category && (
                    <span style={{
                      position: 'absolute', bottom: 6, left: 6,
                      padding: '2px 8px', borderRadius: 100,
                      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
                      font: `600 8px ${MONO}`, letterSpacing: 0.6, textTransform: 'uppercase',
                      color: C.gold,
                    }}>{img.category}</span>
                  )}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <p style={{
                    font: `400 12px ${FONT}`, color: C.text, margin: '0 0 4px',
                    lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {img.prompt || 'Untitled'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ font: `400 10px ${FONT}`, color: C.muted }}>{relativeTime(img.created_at)}</span>
                    {img.style && <span style={{ font: `400 9px ${MONO}`, color: C.muted, letterSpacing: 0.5 }}>{img.style}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ IMAGE MODAL ═══ */}
      {modal && (
        <>
          <div
            onClick={() => setModal(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 10000,
              animation: 'dsFadeIn 0.2s ease',
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 14, maxWidth: 800, width: '90vw',
            maxHeight: '85vh', overflowY: 'auto', zIndex: 10001,
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            animation: 'dsFadeIn 0.2s ease',
          }}>
            {/* Close */}
            <button
              onClick={() => setModal(null)}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 1,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: `400 18px ${FONT}`, color: C.text2,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            >&#10005;</button>

            <img
              src={getImageUrl(modal)}
              alt={modal.prompt || 'Generated artwork'}
              style={{ width: '100%', maxHeight: 500, objectFit: 'contain', background: '#f0ede8', display: 'block', borderRadius: '14px 14px 0 0' }}
            />
            <div style={{ padding: '24px 28px' }}>
              <p style={{ font: `400 15px/1.6 ${FONT}`, color: C.text, margin: '0 0 12px' }}>
                {modal.prompt || 'Untitled'}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                {modal.style && (
                  <span style={{ padding: '4px 12px', borderRadius: 100, background: `${C.gold}12`, border: `1px solid ${C.gold}25`, font: `500 11px ${MONO}`, color: C.gold, letterSpacing: 0.5 }}>
                    {modal.style}
                  </span>
                )}
                {modal.category && (
                  <span style={{ padding: '4px 12px', borderRadius: 100, background: '#f0ede8', font: `500 11px ${MONO}`, color: C.text2, letterSpacing: 0.5 }}>
                    {modal.category}
                  </span>
                )}
                <span style={{ font: `400 12px ${FONT}`, color: C.muted, alignSelf: 'center' }}>
                  {modal.created_at ? new Date(modal.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => downloadImage(getImageUrl(modal), `darksky-${(modal.prompt || '').split(/\s+/).slice(0,3).join('-').toLowerCase().replace(/[^a-z0-9-]/g,'')}.png`)}
                  style={{ ...pillBase, padding: '10px 22px', background: C.gold, color: '#fff', fontSize: 13, fontWeight: 600 }}
                >Download</button>
                <button
                  onClick={() => { navigator.clipboard.writeText(getImageUrl(modal)); toast('Image URL copied'); }}
                  style={{ ...pillBase, padding: '10px 22px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 13 }}
                >Copy URL</button>
                <button
                  onClick={() => toggleFavorite(modal)}
                  style={{ ...pillBase, padding: '10px 22px', background: modal.is_favorite ? `${C.gold}15` : 'transparent', color: modal.is_favorite ? C.gold : C.text2, border: `1px solid ${modal.is_favorite ? C.gold : C.border}`, fontSize: 13 }}
                >
                  {modal.is_favorite ? 'Favorited' : 'Add to Favorites'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes dsSpinner { to { transform: rotate(360deg); } }
        @keyframes dsShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes dsFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 900px) {
          .ds-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .ds-gallery-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
