// Social Media — AI-powered social post creator
// Step 1: Pick content source (event/product/custom/donation)
// Step 2: Generate copy (Anthropic) + image (Desert Vision Studio)
// Step 3: Preview + export

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../AdminLayout';
import { getEvents, getProducts, getFundraising, subscribe } from '../data/store';
import { gallerySupabase, GENERATE_URL, SUPABASE_ANON_KEY } from '../supabaseGallery';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";
const DRAFTS_KEY = 'ds_social_drafts';

const PLATFORMS = ['Instagram', 'Facebook', 'X', 'LinkedIn'];
const TONES = ['Inspiring', 'Playful', 'Urgent', 'Educational', 'Community'];
const STYLES = ['Painterly', 'Realistic', 'Action Shot', 'Watercolor', 'Abstract', 'Dreamy'];

const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;

function loadDrafts() { try { return JSON.parse(localStorage.getItem(DRAFTS_KEY)) || []; } catch { return []; } }
function saveDrafts(d) { localStorage.setItem(DRAFTS_KEY, JSON.stringify(d)); }

const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: C.shadow };
const pillBase = { padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', font: `500 12px ${FONT}`, letterSpacing: '0.02em', transition: 'all 0.15s' };
const labelStyle = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, marginBottom: 8, display: 'block' };
const inputStyle = { width: '100%', padding: '12px 14px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, font: `400 14px ${FONT}`, color: C.text, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

function suggestImagePrompt(sourceType, context) {
  if (sourceType === 'event') return `People stargazing under a clear desert night sky, Milky Way visible overhead, warm tones, Fountain Hills Arizona observatory`;
  if (sourceType === 'product') return `A lifestyle product photo on a desert sandstone surface at twilight, warm golden light, astronomy themed`;
  if (sourceType === 'donation') return `Inspiring desert landscape at sunset with observatory dome silhouette, community gathering, warm hopeful tones`;
  return '';
}

export default function SocialMedia() {
  const toast = useToast();
  const [step, setStep] = useState(1);

  // Step 1
  const [sourceType, setSourceType] = useState(null); // 'event' | 'product' | 'custom' | 'donation'
  const [sourceId, setSourceId] = useState('');
  const [context, setContext] = useState('');

  // Step 2 — copy
  const [platforms, setPlatforms] = useState(['Instagram', 'Facebook']);
  const [tone, setTone] = useState('Inspiring');
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [posts, setPosts] = useState([]); // [{ platform, text }]

  // Step 2 — image
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('Painterly');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);

  // Step 3
  const [activePreviewPlatform, setActivePreviewPlatform] = useState('');
  const [drafts, setDrafts] = useState(loadDrafts);

  const events = getEvents();
  const products = getProducts();
  const fundraising = getFundraising();

  // Subscribe to store changes
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  // Fetch gallery thumbnails
  useEffect(() => {
    gallerySupabase.from('gallery_images').select('id, image_url, url, storage_path, prompt').order('created_at', { ascending: false }).limit(12)
      .then(({ data }) => setGalleryImages(data || []));
  }, []);

  // ── Step 1 helpers ──
  const selectSource = (type) => {
    setSourceType(type);
    setSourceId('');
    if (type === 'custom') {
      setContext('');
    } else if (type === 'donation') {
      const r = fundraising.raised / 100;
      const g = fundraising.goal / 100;
      const pct = g > 0 ? Math.round((r / g) * 100) : 0;
      setContext(`Fundraising Campaign: $${(r/1e6).toFixed(1)}M of $${(g/1e6).toFixed(1)}M raised (${pct}% complete). The International Dark Sky Discovery Center is building a world-class observatory and education center in Fountain Hills, Arizona. Every donation supports dark sky preservation and STEM education.`);
    }
  };

  const selectEvent = (id) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    setSourceId(id);
    setContext(`Event: ${ev.title}\nDate: ${ev.date}\nTime: ${ev.time || ''}\nLocation: ${ev.location || ''}\nPrice: ${ev.price ? fmt(ev.price) : 'Free'}\nCapacity: ${ev.capacity || 'Open'}\nTickets Sold: ${ev.ticketsSold || 0}\n\n${ev.description || ''}`);
  };

  const selectProduct = (id) => {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    setSourceId(id);
    setContext(`Product: ${p.title}\nPrice: ${fmt(p.price)}\nCategory: ${p.category}\n\n${p.description || ''}`);
  };

  const goToStep2 = () => {
    if (!context.trim()) { toast('Add some context first', 'error'); return; }
    setImagePrompt(suggestImagePrompt(sourceType, context));
    setStep(2);
  };

  // ── Step 2: Generate copy ──
  const generateCopy = async () => {
    if (platforms.length === 0) { toast('Select at least one platform', 'error'); return; }
    setGeneratingCopy(true);
    setPosts([]);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a social media manager for the International Dark Sky Discovery Center, a 501(c)(3) nonprofit and STEM education center in Fountain Hills, Arizona. They have an observatory with the largest telescope in Greater Phoenix, a planetarium, and host star parties and astronomy events.

Write social media posts for the following platforms: ${platforms.join(', ')}.
Tone: ${tone}.

Content to promote:
${context}

For each platform, write the post with appropriate length, hashtags, and formatting:
- Instagram: visual-first caption, 5-10 relevant hashtags at the end, line breaks for readability
- Facebook: longer narrative, community-focused, include a call to action
- X: under 280 characters, punchy, 2-3 hashtags max
- LinkedIn: professional but passionate, thought-leadership angle, 3-5 hashtags

Return ONLY valid JSON (no markdown, no backticks) in this format:
{"posts": [{"platform": "instagram", "text": "..."}, {"platform": "facebook", "text": "..."}]}`
          }]
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const textBlock = result.content?.find(b => b.type === 'text');
      if (!textBlock) throw new Error('No text in response');

      // Strip markdown code fences if present
      let raw = textBlock.text.trim();
      if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

      const parsed = JSON.parse(raw);
      setPosts(parsed.posts || []);
      if (!activePreviewPlatform && parsed.posts?.length) setActivePreviewPlatform(parsed.posts[0].platform);
    } catch (err) {
      console.error('Copy generation error:', err);
      toast(err.message || 'Failed to generate copy', 'error');
    } finally {
      setGeneratingCopy(false);
    }
  };

  // ── Step 2: Generate image ──
  const generateImage = async (surprise = false) => {
    if (!surprise && !imagePrompt.trim()) { toast('Enter an image prompt', 'error'); return; }
    setGeneratingImage(true);
    try {
      const response = await fetch(GENERATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ prompt: surprise ? '' : imagePrompt.trim(), style: imageStyle.toLowerCase(), surprise }),
      });
      if (!response.ok) throw new Error('Generation failed');
      const result = await response.json();
      const url = result.image_url || result.url || result.imageUrl || '';
      if (!url) throw new Error('No image returned');
      setImageUrl(url);
      toast('Image generated!');
    } catch (err) {
      console.error('Image generation error:', err);
      toast('Image generation unavailable — try picking from your gallery', 'error');
      setShowGalleryPicker(true);
    } finally {
      setGeneratingImage(false);
    }
  };

  const pickGalleryImage = (img) => {
    setImageUrl(img.image_url || img.url || img.storage_path || '');
    setShowGalleryPicker(false);
    toast('Image selected');
  };

  // ── Step 3: Save ──
  const saveDraft = (status = 'draft') => {
    const draft = {
      id: `SM-${Date.now()}`,
      sourceType, sourceId, platforms: platforms.map(p => p.toLowerCase()),
      posts, imageUrl, context: context.slice(0, 100),
      createdDate: new Date().toISOString().slice(0, 10),
      status,
      ...(status === 'posted' ? { postedAt: new Date().toISOString() } : {}),
    };
    const all = loadDrafts();
    all.unshift(draft);
    saveDrafts(all);
    setDrafts(all);
    toast(status === 'posted' ? 'Marked as posted!' : 'Draft saved!');
  };

  const loadDraft = (draft) => {
    setPosts(draft.posts || []);
    setImageUrl(draft.imageUrl || '');
    setActivePreviewPlatform(draft.posts?.[0]?.platform || '');
    setPlatforms(draft.platforms?.map(p => p.charAt(0).toUpperCase() + p.slice(1)) || ['Instagram']);
    setStep(3);
  };

  const togglePlatform = (p) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const updatePostText = (platform, text) => {
    setPosts(prev => prev.map(p => p.platform === platform ? { ...p, text } : p));
  };

  const copyAll = () => {
    const text = posts.map(p => `--- ${p.platform.toUpperCase()} ---\n${p.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast('All posts copied');
  };

  const activePost = posts.find(p => p.platform === activePreviewPlatform);

  // ── Step dots ──
  const StepDots = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
      {[1, 2, 3].map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            onClick={() => { if (s < step) setStep(s); }}
            style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= s ? C.gold : C.border, color: step >= s ? '#fff' : C.muted,
              font: `600 12px ${FONT}`, cursor: s < step ? 'pointer' : 'default', transition: 'all 0.2s',
            }}
          >{s}</div>
          {s < 3 && <div style={{ width: 32, height: 2, background: step > s ? C.gold : C.border, borderRadius: 1, transition: 'background 0.3s' }} />}
        </div>
      ))}
      <span style={{ font: `400 13px ${FONT}`, color: C.muted, marginLeft: 8 }}>
        Step {step} of 3
      </span>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ font: `600 24px ${FONT}`, color: C.text, margin: '0 0 4px' }}>Social Media</h1>
        <p style={{ font: `400 14px ${FONT}`, color: C.text2, margin: 0 }}>Turn your events, products, and announcements into scroll-stopping content.</p>
      </div>

      <StepDots />

      {/* ═══ STEP 1: PICK SOURCE ═══ */}
      {step === 1 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }} className="sm-source-grid">
            {[
              { type: 'event', label: 'From an Event', desc: 'Promote an upcoming event', icon: '/' },
              { type: 'product', label: 'From a Product', desc: 'Feature a gift shop item', icon: '/' },
              { type: 'custom', label: 'Custom Post', desc: 'Write about anything', icon: '/' },
              { type: 'donation', label: 'Donation Campaign', desc: 'Fundraising update', icon: '/' },
            ].map(s => (
              <button
                key={s.type}
                onClick={() => selectSource(s.type)}
                style={{
                  ...cardStyle, padding: '20px 24px', textAlign: 'left', cursor: 'pointer',
                  borderLeft: sourceType === s.type ? `3px solid ${C.gold}` : `3px solid transparent`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = C.shadow}
              >
                <div style={{ font: `600 15px ${FONT}`, color: sourceType === s.type ? C.gold : C.text, marginBottom: 4 }}>{s.label}</div>
                <div style={{ font: `400 13px ${FONT}`, color: C.muted }}>{s.desc}</div>
              </button>
            ))}
          </div>

          {/* Source-specific selector */}
          {sourceType === 'event' && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Select Event</label>
              <select value={sourceId} onChange={e => selectEvent(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Choose an event...</option>
                {events.filter(e => e.status === 'Published').map(e => (
                  <option key={e.id} value={e.id}>{e.title} — {e.date}</option>
                ))}
              </select>
            </div>
          )}

          {sourceType === 'product' && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Select Product</label>
              <select value={sourceId} onChange={e => selectProduct(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Choose a product...</option>
                {products.slice(0, 30).map(p => (
                  <option key={p.id} value={p.id}>{p.title} — {fmt(p.price)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Context preview/editor */}
          {sourceType && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Context {sourceType !== 'custom' ? '(auto-filled, editable)' : ''}</label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder={sourceType === 'custom' ? 'Grand opening countdown, behind-the-scenes construction update, dark sky preservation tip...' : 'Select an item above to auto-fill...'}
                rows={6}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          )}

          {sourceType && (
            <button onClick={goToStep2} style={{ ...pillBase, padding: '12px 32px', background: C.gold, color: '#fff', fontSize: 13, fontWeight: 600 }}>
              Next — Generate Content
            </button>
          )}
        </div>
      )}

      {/* ═══ STEP 2: GENERATE ═══ */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="sm-generate-grid">
          {/* Left: Copy */}
          <div>
            <h3 style={{ font: `600 16px ${FONT}`, color: C.text, margin: '0 0 16px' }}>AI Copy</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Platforms</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => togglePlatform(p)} style={{
                    ...pillBase, padding: '6px 14px', fontSize: 12,
                    background: platforms.includes(p) ? C.gold : 'transparent',
                    color: platforms.includes(p) ? '#fff' : C.text2,
                    border: platforms.includes(p) ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                  }}>{p}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tone</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TONES.map(t => (
                  <button key={t} onClick={() => setTone(t)} style={{
                    ...pillBase, padding: '6px 14px', fontSize: 12,
                    background: tone === t ? C.gold : 'transparent',
                    color: tone === t ? '#fff' : C.text2,
                    border: tone === t ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <button onClick={generateCopy} disabled={generatingCopy} style={{
              ...pillBase, padding: '12px 28px', background: generatingCopy ? C.muted : C.gold,
              color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 20,
            }}>
              {generatingCopy ? 'Writing posts...' : 'Generate Copy'}
            </button>

            {generatingCopy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${C.border}`, borderTopColor: C.gold, animation: 'smSpin 0.8s linear infinite' }} />
                <span style={{ font: `400 13px ${FONT}`, color: C.text2 }}>Writing your posts...</span>
              </div>
            )}

            {/* Generated posts */}
            {posts.map(p => (
              <div key={p.platform} style={{ ...cardStyle, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ font: `600 12px ${MONO}`, color: C.gold, letterSpacing: 0.5, textTransform: 'uppercase' }}>{p.platform}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { navigator.clipboard.writeText(p.text); toast(`${p.platform} copy copied`); }}
                      style={{ ...pillBase, padding: '4px 10px', fontSize: 11, background: 'transparent', color: C.text2, border: `1px solid ${C.border}` }}>Copy</button>
                  </div>
                </div>
                <textarea
                  value={p.text}
                  onChange={e => updatePostText(p.platform, e.target.value)}
                  rows={Math.min(8, Math.max(3, p.text.split('\n').length + 1))}
                  style={{ ...inputStyle, fontSize: 13, lineHeight: 1.5, resize: 'vertical' }}
                />
                {p.platform === 'x' && (
                  <div style={{ font: `400 11px ${FONT}`, color: p.text.length > 280 ? C.danger : C.muted, marginTop: 4 }}>
                    {p.text.length}/280 characters
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: Image */}
          <div>
            <h3 style={{ font: `600 16px ${FONT}`, color: C.text, margin: '0 0 16px' }}>Post Image</h3>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Image Prompt</label>
              <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} rows={3}
                style={{ ...inputStyle, fontSize: 13, lineHeight: 1.5, resize: 'vertical' }}
                placeholder="Describe the image you want..."
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setImageStyle(s)} style={{
                  ...pillBase, padding: '5px 12px', fontSize: 11,
                  background: imageStyle === s ? C.gold : 'transparent',
                  color: imageStyle === s ? '#fff' : C.text2,
                  border: imageStyle === s ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                }}>{s}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={() => generateImage(false)} disabled={generatingImage} style={{
                ...pillBase, padding: '10px 22px', background: generatingImage ? C.muted : C.gold,
                color: '#fff', fontSize: 12, fontWeight: 600,
              }}>{generatingImage ? 'Creating...' : 'Generate Image'}</button>
              <button onClick={() => generateImage(true)} disabled={generatingImage} style={{
                ...pillBase, padding: '10px 18px', background: 'transparent', color: C.text2,
                border: `1px solid ${C.border}`, fontSize: 12,
              }}>Surprise Me</button>
              <button onClick={() => setShowGalleryPicker(!showGalleryPicker)} style={{
                ...pillBase, padding: '10px 18px', background: 'transparent', color: C.text2,
                border: `1px solid ${C.border}`, fontSize: 12,
              }}>Pick from Gallery</button>
            </div>

            {generatingImage && (
              <div style={{ ...cardStyle, padding: 40, textAlign: 'center', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.gold, animation: 'smSpin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <span style={{ font: `500 14px ${FONT}`, color: C.text2 }}>Creating artwork...</span>
              </div>
            )}

            {imageUrl && !generatingImage && (
              <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: 16 }}>
                <img src={imageUrl} alt="Generated" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', background: '#f0ede8', display: 'block' }} />
                <div style={{ padding: 12, display: 'flex', gap: 6 }}>
                  <button onClick={() => window.open(imageUrl, '_blank')} style={{ ...pillBase, padding: '6px 14px', fontSize: 11, background: C.gold, color: '#fff' }}>Download</button>
                  <button onClick={() => { setImageUrl(''); }} style={{ ...pillBase, padding: '6px 14px', fontSize: 11, background: 'transparent', color: C.text2, border: `1px solid ${C.border}` }}>Remove</button>
                </div>
              </div>
            )}

            {/* Gallery picker */}
            {showGalleryPicker && (
              <div style={{ ...cardStyle, padding: 16, marginBottom: 16 }}>
                <div style={{ font: `600 12px ${MONO}`, color: C.text2, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Recent Artwork</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {galleryImages.map(img => (
                    <button key={img.id} onClick={() => pickGalleryImage(img)} style={{
                      padding: 0, border: `2px solid transparent`, borderRadius: 6, overflow: 'hidden',
                      cursor: 'pointer', background: '#f0ede8', aspectRatio: '1', transition: 'border-color 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <img src={img.image_url || img.url || img.storage_path || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </button>
                  ))}
                </div>
                {galleryImages.length === 0 && (
                  <p style={{ font: `400 13px ${FONT}`, color: C.muted, textAlign: 'center', padding: 20 }}>No gallery images found</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation for step 2 */}
      {step === 2 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
          <button onClick={() => setStep(1)} style={{ ...pillBase, padding: '10px 24px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 13 }}>Back</button>
          <button onClick={() => { if (posts.length === 0) { toast('Generate copy first', 'error'); return; } if (!activePreviewPlatform) setActivePreviewPlatform(posts[0]?.platform || ''); setStep(3); }}
            style={{ ...pillBase, padding: '10px 28px', background: C.gold, color: '#fff', fontSize: 13, fontWeight: 600, opacity: posts.length === 0 ? 0.5 : 1 }}>
            Next — Preview
          </button>
        </div>
      )}

      {/* ═══ STEP 3: PREVIEW ═══ */}
      {step === 3 && (
        <div>
          {/* Platform tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {posts.map(p => (
              <button key={p.platform} onClick={() => setActivePreviewPlatform(p.platform)} style={{
                ...pillBase, padding: '8px 18px', fontSize: 12,
                background: activePreviewPlatform === p.platform ? C.gold : 'transparent',
                color: activePreviewPlatform === p.platform ? '#fff' : C.text2,
                border: activePreviewPlatform === p.platform ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
              }}>{p.platform}</button>
            ))}
          </div>

          {/* Phone mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{
              width: 375, maxWidth: '100%',
              background: '#fff', borderRadius: 32, border: '3px solid #1a1a2e',
              boxShadow: '0 16px 48px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}>
              {/* Phone status bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', background: '#f8f8f8' }}>
                <span style={{ font: `600 13px ${FONT}`, color: '#1a1a2e' }}>9:41</span>
                <div style={{ width: 80, height: 4, background: '#1a1a2e', borderRadius: 2 }} />
                <span style={{ font: `400 12px ${FONT}`, color: '#1a1a2e' }}>100%</span>
              </div>

              {/* Post header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #eee' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.gold}, #8B7355)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: `700 11px ${FONT}` }}>DS</div>
                <div>
                  <div style={{ font: `600 13px ${FONT}`, color: '#1a1a2e' }}>darkskycenter</div>
                  <div style={{ font: `400 11px ${FONT}`, color: '#999' }}>Fountain Hills, AZ</div>
                </div>
              </div>

              {/* Image */}
              {imageUrl ? (
                <img src={imageUrl} alt="Post" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '1', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ font: `400 14px ${FONT}`, color: C.muted }}>No image selected</span>
                </div>
              )}

              {/* Post text */}
              <div style={{ padding: '12px 16px 20px', maxHeight: 200, overflowY: 'auto' }}>
                <p style={{ font: `400 13px/1.5 ${FONT}`, color: '#1a1a2e', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  <strong style={{ marginRight: 4 }}>darkskycenter</strong>
                  {activePost?.text || 'No copy generated yet'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            {imageUrl && (
              <button onClick={() => window.open(imageUrl, '_blank')} style={{ ...pillBase, padding: '10px 22px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 13 }}>Download Image</button>
            )}
            <button onClick={() => { if (activePost) { navigator.clipboard.writeText(activePost.text); toast('Caption copied'); } }}
              style={{ ...pillBase, padding: '10px 22px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 13 }}>Copy Caption</button>
            <button onClick={copyAll} style={{ ...pillBase, padding: '10px 22px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 13 }}>Copy All</button>
            <button onClick={() => saveDraft('draft')} style={{ ...pillBase, padding: '10px 22px', background: 'transparent', color: C.gold, border: `1px solid ${C.gold}`, fontSize: 13 }}>Save Draft</button>
            <button onClick={() => saveDraft('posted')} style={{ ...pillBase, padding: '10px 22px', background: C.gold, color: '#fff', fontSize: 13, fontWeight: 600 }}>Mark as Posted</button>
          </div>

          <button onClick={() => setStep(2)} style={{ ...pillBase, padding: '10px 24px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 13 }}>Back to Editor</button>
        </div>
      )}

      {/* ═══ DRAFTS & HISTORY ═══ */}
      {drafts.length > 0 && (
        <div style={{ marginTop: 40, borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
          <h3 style={{ font: `600 16px ${FONT}`, color: C.text, margin: '0 0 16px' }}>Drafts & History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {drafts.slice(0, 10).map(d => (
              <button key={d.id} onClick={() => loadDraft(d)} style={{
                ...cardStyle, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = C.shadow}
              >
                <div>
                  <div style={{ font: `500 14px ${FONT}`, color: C.text, marginBottom: 2 }}>{d.context || 'Untitled'}</div>
                  <div style={{ font: `400 12px ${FONT}`, color: C.muted }}>{d.platforms?.join(', ')} — {d.createdDate}</div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                  background: d.status === 'posted' ? `${C.success}12` : `${C.warning}12`,
                  color: d.status === 'posted' ? C.success : C.warning,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{d.status}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes smSpin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .sm-generate-grid { grid-template-columns: 1fr !important; }
          .sm-source-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
