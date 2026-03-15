// Social Media — AI-powered social post creator
// Step 1: Pick content source (event/product/custom/donation)
// Step 2: Auto-filled copy templates + image generator (Desert Vision Studio)
// Step 3: Preview + export

import { useState, useEffect } from 'react';
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
const fmtD = (v) => `$${Math.round(v).toLocaleString()}`;

function loadDrafts() { try { return JSON.parse(localStorage.getItem(DRAFTS_KEY)) || []; } catch { return []; } }
function saveDrafts(d) { localStorage.setItem(DRAFTS_KEY, JSON.stringify(d)); }

// ── Proper file download ──
async function downloadImage(url, filename) {
  try {
    const r = await fetch(url);
    const blob = await r.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'darksky-social-media.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch { window.open(url, '_blank'); }
}

// ── Smart image prompt from source ──
function extractActivities(desc) {
  const activities = [];
  if (desc.includes('rocket')) activities.push('building model rockets');
  if (desc.includes('planet')) activities.push('learning about planets');
  if (desc.includes('planetarium')) activities.push('planetarium show');
  if (desc.includes('telescope')) activities.push('looking through telescopes');
  if (desc.includes('build') || desc.includes('craft')) activities.push('hands-on science activities');
  if (desc.includes('lunch')) activities.push('outdoor lunch');
  return activities.length > 0 ? activities.join(', ') : 'hands-on space science activities';
}

function buildImagePrompt(sourceType, sourceData, fundraisingData) {
  if (sourceType === 'custom') return '';

  if (sourceType === 'product' && sourceData) {
    const name = (sourceData.title || '').toLowerCase();
    if (name.includes('hoodie') || name.includes('shirt') || name.includes('tee') || name.includes('apparel'))
      return `${sourceData.title} displayed on desert sandstone at golden hour, warm tones, product lifestyle photo, astronomy themed apparel`;
    if (name.includes('mug') || name.includes('cup'))
      return `${sourceData.title} on a wooden table with steam rising, desert sunrise through window, cozy morning astronomy vibes`;
    if (name.includes('poster') || name.includes('print') || name.includes('art'))
      return `${sourceData.title} framed on a modern wall, warm interior lighting, desert-inspired home decor`;
    return `${sourceData.title} product photo on desert sandstone at twilight, warm golden light, astronomy themed, professional product photography`;
  }

  if (sourceType === 'donation') {
    const pct = fundraisingData?.goal > 0 ? Math.round((fundraisingData.raised / fundraisingData.goal) * 100) : 94;
    return `Aerial view of a modern science center under construction at golden hour, Arizona desert landscape, progress and hope, ${pct} percent complete`;
  }

  if (sourceType !== 'event' || !sourceData) return '';

  const title = (sourceData.title || '').toLowerCase();
  const desc = (sourceData.description || '').toLowerCase();
  const combined = title + ' ' + desc;

  // Kids / camp / family events
  if (combined.includes('kids') || combined.includes('camp') || combined.includes('children') || combined.includes('youth')) {
    if (combined.includes('rocket') || combined.includes('launch'))
      return 'Excited children launching model rockets in the Arizona desert with a clear blue sky, science camp atmosphere, Sonoran Desert landscape';
    if (combined.includes('planet') && !combined.includes('planetarium'))
      return 'Children looking at colorful planet models in a science center classroom, wonder and excitement, bright educational environment';
    return `Children at a space science camp in the Arizona desert, ${extractActivities(desc)}, bright sunny day, educational and fun atmosphere, Fountain Hills Arizona`;
  }

  // Star party / stargazing
  if (combined.includes('star party') || combined.includes('stargazing') || combined.includes('new moon'))
    return 'Silhouettes of people gathered around telescopes under the Milky Way, Sonoran Desert, saguaro cactus, observatory dome in background, Fountain Hills Arizona';

  // Astrophotography
  if (combined.includes('astrophotography') || combined.includes('photography'))
    return 'Photographer with camera on tripod capturing the Milky Way over the desert, long exposure star trails, warm desert tones';

  // Meteor shower
  if (combined.includes('meteor') || combined.includes('shower'))
    return 'Bright meteors streaking across a star-filled desert sky, people lying on blankets looking up, saguaro cactus silhouettes, warm desert night';

  // Planets / viewing
  if (combined.includes('planet') || combined.includes('jupiter') || combined.includes('saturn') || combined.includes('mars'))
    return 'Jupiter and Saturn glowing bright in a dark desert sky, observatory dome open, telescope pointed skyward, Fountain Hills Arizona';

  // Planetarium
  if (combined.includes('planetarium') || combined.includes('show') || combined.includes('dome'))
    return 'Inside a planetarium dome with projected stars and galaxies, silhouetted audience looking up in wonder, immersive blue and purple lighting';

  // Workshop / class / education
  if (combined.includes('workshop') || combined.includes('class') || combined.includes('learn'))
    return 'People gathered around a table in a modern science center classroom, astronomy charts on walls, engaged learning atmosphere, warm lighting';

  // Drinks / social / pours
  if (combined.includes('drink') || combined.includes('pour') || combined.includes('wine') || combined.includes('beer') || combined.includes('cocktail'))
    return 'People enjoying craft drinks under the stars on a desert patio, warm string lights, telescope in background, intimate evening atmosphere';

  // Wildlife / nocturnal / nature
  if (combined.includes('wildlife') || combined.includes('nocturnal') || combined.includes('nature') || combined.includes('safari'))
    return 'Nocturnal desert animals under a starry sky, educational nature walk at dusk, Sonoran Desert landscape';

  // Fallback: use the actual event title
  return `${sourceData.title} at the International Dark Sky Discovery Center, Fountain Hills Arizona, desert landscape, evening atmosphere, astronomy themed`;
}

// ── Template-based copy generation ──
const HASHTAG_POOL = ['#DarkSky', '#FountainHills', '#StarParty', '#Astronomy', '#Arizona', '#NightSky', '#DarkSkyDiscovery', '#STEM', '#SonoranDesert', '#StargazingAZ', '#ArizonaNights', '#SpaceExploration', '#DarkSkyPreservation', '#ScienceEducation', '#Observatory'];

function pickHashtags(n) {
  const shuffled = [...HASHTAG_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).join(' ');
}

function generateTemplatePosts(sourceType, sourceData, selectedPlatforms, fundraising) {
  const posts = [];
  const ev = sourceData;
  const title = ev?.title || ev?.name || '';
  const desc = ev?.description || '';
  const shortDesc = desc.length > 120 ? desc.slice(0, 117) + '...' : desc;
  const price = ev?.price ? fmt(ev.price) : 'Free';
  const date = ev?.date || '';
  const time = ev?.time || '';
  const location = ev?.location || 'IDSDC, Fountain Hills';
  const capacity = ev?.capacity || '';
  const category = ev?.category || '';
  const pName = ev?.title || '';
  const pPrice = ev?.price ? fmt(ev.price) : '';

  const r = fundraising?.raised ? fundraising.raised / 100 : 0;
  const g = fundraising?.goal ? fundraising.goal / 100 : 29000000;
  const pct = g > 0 ? Math.round((r / g) * 100) : 0;
  const raisedStr = `$${(r / 1e6).toFixed(1)}M`;
  const goalStr = `$${(g / 1e6).toFixed(1)}M`;

  for (const platform of selectedPlatforms) {
    const p = platform.toLowerCase();
    let text = '';

    if (sourceType === 'event') {
      if (p === 'instagram') {
        text = `${title}\n\n${desc}\n\n${date}${time ? ' at ' + time : ''}\n${location}\n${price !== 'Free' ? price : 'Members: FREE'}\n\nSpots are limited${capacity ? ' \u2014 only ' + capacity + ' available' : ''}.\n\nLink in bio to reserve your spot.\n\n${pickHashtags(8)}`;
      } else if (p === 'facebook') {
        text = `Mark your calendars!\n\n${title} is happening ${date}${time ? ' at ' + time : ''}.\n\n${desc}\n\nTickets: ${price} | Members: FREE\n${capacity ? 'Only ' + capacity + ' spots available.\n' : ''}\nReserve your spot: darkskycenter.org/events\n\nThe International Dark Sky Discovery Center is one of only 13 dark sky communities featured in the Smithsonian. Join us under the stars.`;
      } else if (p === 'x') {
        text = `${title} \u2014 ${date}. ${shortDesc.slice(0, 100)}${capacity ? ' Limited to ' + capacity + ' spots.' : ''} #DarkSky #FountainHills #StarParty`;
      } else if (p === 'linkedin') {
        text = `We're excited to announce ${title} at the International Dark Sky Discovery Center.\n\n${desc}\n\nAs one of the last remaining dark sky communities near a major U.S. metro, Fountain Hills offers a unique setting for STEM education and public astronomy.\n\n${date}\nFountain Hills, AZ\n\n${pickHashtags(5)}`;
      }
    } else if (sourceType === 'product') {
      if (p === 'instagram') {
        text = `New in the shop\n\n${pName} \u2014 ${pPrice}\n\n${shortDesc}\n\nEvery purchase supports dark sky education and preservation.\n\nShop link in bio.\n\n${pickHashtags(7)}`;
      } else if (p === 'facebook') {
        text = `Take the night sky home.\n\n${pName} just dropped in our gift shop.\n\n${pPrice} | ${category}\n\n${desc}\n\nEvery purchase directly supports the International Dark Sky Discovery Center's mission to preserve the night sky and inspire future scientists.\n\nShop now: darkskycenter.org/shop`;
      } else if (p === 'x') {
        text = `${pName} \u2014 ${pPrice}. ${shortDesc.slice(0, 80)} Every purchase supports dark sky preservation. #DarkSky #GiftShop`;
      } else if (p === 'linkedin') {
        text = `Our gift shop isn't just merchandise \u2014 it's mission-driven retail.\n\n${pName} (${pPrice}) is part of our growing collection of astronomy-inspired products. Every purchase supports STEM education and dark sky preservation at the International Dark Sky Discovery Center in Fountain Hills, AZ.\n\n${pickHashtags(5)}`;
      }
    } else if (sourceType === 'donation') {
      if (p === 'instagram') {
        text = `We're ${pct}% of the way to our ${goalStr} goal.\n\n${raisedStr} raised so far \u2014 thanks to people like you who believe the night sky is worth protecting.\n\nEvery dollar brings us closer to opening the International Dark Sky Discovery Center in Fountain Hills, AZ.\n\nLink in bio to donate.\n\n${pickHashtags(7)}`;
      } else if (p === 'facebook') {
        text = `We're so close.\n\n${raisedStr} of our ${goalStr} goal \u2014 ${pct}% of the way there.\n\nThe International Dark Sky Discovery Center will be a world-class STEM education facility with the largest telescope in Greater Phoenix, an immersive planetarium, and programs that connect people to the night sky.\n\nHelp us reach our goal: darkskycenter.org/donate\n\nEvery gift is tax-deductible. The night sky belongs to everyone.`;
      } else if (p === 'x') {
        text = `${raisedStr} of ${goalStr} raised. Help us build the International Dark Sky Discovery Center. Every dollar protects the night sky. #DarkSky #Donate`;
      } else if (p === 'linkedin') {
        text = `The International Dark Sky Discovery Center has raised ${raisedStr} of our ${goalStr} capital campaign goal (${pct}%).\n\nThis world-class facility in Fountain Hills, AZ will house the largest telescope in Greater Phoenix, an immersive planetarium, and STEM programs serving 15,000+ students annually.\n\nLearn how your organization can support our mission: darkskycenter.org/donate\n\n${pickHashtags(5)}`;
      }
    }
    // custom: leave empty
    posts.push({ platform: p, text });
  }
  return posts;
}

const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: C.shadow };
const pillBase = { padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', font: `500 12px ${FONT}`, letterSpacing: '0.02em', transition: 'all 0.15s' };
const labelStyle = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, marginBottom: 8, display: 'block' };
const inputStyle = { width: '100%', padding: '12px 14px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, font: `400 14px ${FONT}`, color: C.text, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

export default function SocialMedia() {
  const toast = useToast();
  const [step, setStep] = useState(1);

  // Step 1
  const [sourceType, setSourceType] = useState(null);
  const [sourceId, setSourceId] = useState('');
  const [sourceData, setSourceData] = useState(null);
  const [context, setContext] = useState('');

  // Step 2 — copy
  const [platforms, setPlatforms] = useState(['Instagram', 'Facebook']);
  const [tone, setTone] = useState('Inspiring');
  const [posts, setPosts] = useState([]);

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

  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  useEffect(() => {
    gallerySupabase.from('gallery_images').select('id, image_url, url, storage_path, prompt').order('created_at', { ascending: false }).limit(12)
      .then(({ data }) => setGalleryImages(data || []));
  }, []);

  // ── Step 1 helpers ──
  const selectSource = (type) => {
    setSourceType(type);
    setSourceId('');
    setSourceData(null);
    if (type === 'custom') {
      setContext('');
    } else if (type === 'donation') {
      const r = fundraising.raised / 100;
      const g = fundraising.goal / 100;
      const pct = g > 0 ? Math.round((r / g) * 100) : 0;
      setContext(`Fundraising Campaign: $${(r/1e6).toFixed(1)}M of $${(g/1e6).toFixed(1)}M raised (${pct}% complete). Every donation supports dark sky preservation and STEM education.`);
    }
  };

  const selectEvent = (id) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    setSourceId(id);
    setSourceData(ev);
    setContext(`Event: ${ev.title}\nDate: ${ev.date}\nTime: ${ev.time || ''}\nLocation: ${ev.location || ''}\nPrice: ${ev.price ? fmt(ev.price) : 'Free'}\nCapacity: ${ev.capacity || 'Open'}\n\n${ev.description || ''}`);
  };

  const selectProduct = (id) => {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    setSourceId(id);
    setSourceData(p);
    setContext(`Product: ${p.title}\nPrice: ${fmt(p.price)}\nCategory: ${p.category}\n\n${p.description || ''}`);
  };

  // ── Transition to Step 2: auto-fill everything ──
  const goToStep2 = () => {
    if (!context.trim() && sourceType !== 'custom') { toast('Add some context first', 'error'); return; }
    // Auto-fill image prompt
    setImagePrompt(buildImagePrompt(sourceType, sourceData, fundraising));
    // Auto-fill copy from templates
    const templatePosts = generateTemplatePosts(sourceType, sourceData, platforms, fundraising);
    setPosts(templatePosts);
    if (templatePosts.length > 0) setActivePreviewPlatform(templatePosts[0].platform);
    setStep(2);
  };

  // ── Refresh copy with shuffled templates ──
  const refreshCopy = () => {
    if (platforms.length === 0) { toast('Select at least one platform', 'error'); return; }
    const refreshed = generateTemplatePosts(sourceType, sourceData, platforms, fundraising);
    setPosts(refreshed);
    toast('Copy refreshed');
  };

  // ── Regenerate posts when platforms change (in step 2) ──
  const togglePlatform = (p) => {
    const next = platforms.includes(p) ? platforms.filter(x => x !== p) : [...platforms, p];
    setPlatforms(next);
    if (step === 2 && sourceType !== 'custom') {
      const refreshed = generateTemplatePosts(sourceType, sourceData, next, fundraising);
      setPosts(refreshed);
      if (refreshed.length > 0 && !refreshed.find(r => r.platform === activePreviewPlatform)) {
        setActivePreviewPlatform(refreshed[0].platform);
      }
    }
  };

  // ── Generate image ──
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
      toast('Image generation unavailable \u2014 try picking from your gallery', 'error');
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

  // ── Save ──
  const saveDraft = (status = 'draft') => {
    const draft = {
      id: `SM-${Date.now()}`, sourceType, sourceId,
      platforms: platforms.map(p => p.toLowerCase()),
      posts, imageUrl, context: context.slice(0, 100),
      createdDate: new Date().toISOString().slice(0, 10), status,
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

  const updatePostText = (platform, text) => {
    setPosts(prev => prev.map(p => p.platform === platform ? { ...p, text } : p));
  };

  const copyAll = () => {
    const text = posts.map(p => `--- ${p.platform.toUpperCase()} ---\n${p.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast('All posts copied');
  };

  const activePost = posts.find(p => p.platform === activePreviewPlatform);

  const sourceName = sourceData?.title || sourceData?.name || sourceType || 'post';
  const dlFilename = (platform) => `darksky-${platform}-${sourceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}.png`;

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
      <span style={{ font: `400 13px ${FONT}`, color: C.muted, marginLeft: 8 }}>Step {step} of 3</span>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ font: `600 24px ${FONT}`, color: C.text, margin: '0 0 4px' }}>Social Media</h1>
        <p style={{ font: `400 14px ${FONT}`, color: C.text2, margin: 0 }}>Turn your events, products, and announcements into scroll-stopping content.</p>
      </div>
      <StepDots />

      {/* ═══ STEP 1 ═══ */}
      {step === 1 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }} className="sm-source-grid">
            {[
              { type: 'event', label: 'From an Event', desc: 'Promote an upcoming event' },
              { type: 'product', label: 'From a Product', desc: 'Feature a gift shop item' },
              { type: 'custom', label: 'Custom Post', desc: 'Write about anything' },
              { type: 'donation', label: 'Donation Campaign', desc: 'Fundraising update' },
            ].map(s => (
              <button key={s.type} onClick={() => selectSource(s.type)} style={{
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

          {sourceType === 'event' && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Select Event</label>
              <select value={sourceId} onChange={e => selectEvent(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Choose an event...</option>
                {events.filter(e => e.status === 'Published').map(e => (
                  <option key={e.id} value={e.id}>{e.title} \u2014 {e.date}</option>
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
                  <option key={p.id} value={p.id}>{p.title} \u2014 {fmt(p.price)}</option>
                ))}
              </select>
            </div>
          )}

          {sourceType && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Context {sourceType !== 'custom' ? '(auto-filled, editable)' : ''}</label>
              <textarea value={context} onChange={e => setContext(e.target.value)}
                placeholder={sourceType === 'custom' ? 'Grand opening countdown, behind-the-scenes update, dark sky preservation tip...' : 'Select an item above to auto-fill...'}
                rows={6} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          )}

          {sourceType && (
            <button onClick={goToStep2} style={{ ...pillBase, padding: '12px 32px', background: C.gold, color: '#fff', fontSize: 13, fontWeight: 600 }}>
              Next \u2014 Generate Content
            </button>
          )}
        </div>
      )}

      {/* ═══ STEP 2 ═══ */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="sm-generate-grid">
          {/* Left: Copy */}
          <div>
            <h3 style={{ font: `600 16px ${FONT}`, color: C.text, margin: '0 0 16px' }}>Post Copy</h3>

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

            <button onClick={refreshCopy} style={{
              ...pillBase, padding: '10px 24px', background: 'transparent',
              color: C.gold, border: `1px solid ${C.gold}`, fontSize: 12, fontWeight: 600, marginBottom: 20,
            }}>
              Refresh Copy
            </button>

            {posts.length === 0 && sourceType === 'custom' && (
              <p style={{ font: `400 13px ${FONT}`, color: C.muted, fontStyle: 'italic', marginBottom: 16 }}>
                Write your posts below or click Refresh Copy for template suggestions.
              </p>
            )}

            {posts.map(p => (
              <div key={p.platform} style={{ ...cardStyle, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ font: `600 12px ${MONO}`, color: C.gold, letterSpacing: 0.5, textTransform: 'uppercase' }}>{p.platform}</span>
                  <button onClick={() => { navigator.clipboard.writeText(p.text); toast(`${p.platform} copy copied`); }}
                    style={{ ...pillBase, padding: '4px 10px', fontSize: 11, background: 'transparent', color: C.text2, border: `1px solid ${C.border}` }}>Copy</button>
                </div>
                <textarea value={p.text} onChange={e => updatePostText(p.platform, e.target.value)}
                  rows={Math.min(8, Math.max(3, (p.text || '').split('\n').length + 1))}
                  style={{ ...inputStyle, fontSize: 13, lineHeight: 1.5, resize: 'vertical' }}
                  placeholder="Write your post or click Refresh Copy..."
                />
                {p.platform === 'x' && (
                  <div style={{ font: `400 11px ${FONT}`, color: (p.text || '').length > 280 ? C.danger : C.muted, marginTop: 4 }}>
                    {(p.text || '').length}/280 characters
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
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={() => generateImage(false)} disabled={generatingImage} style={{
                ...pillBase, padding: '10px 22px', background: generatingImage ? C.muted : C.gold,
                color: '#fff', fontSize: 12, fontWeight: 600,
              }}>{generatingImage ? 'Creating...' : 'Generate Image'}</button>
              <button onClick={() => generateImage(true)} disabled={generatingImage} style={{
                ...pillBase, padding: '10px 18px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 12,
              }}>Surprise Me</button>
              <button onClick={() => setShowGalleryPicker(!showGalleryPicker)} style={{
                ...pillBase, padding: '10px 18px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 12,
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
                  <button onClick={() => downloadImage(imageUrl, dlFilename('social'))} style={{ ...pillBase, padding: '6px 14px', fontSize: 11, background: C.gold, color: '#fff' }}>Download</button>
                  <button onClick={() => setImageUrl('')} style={{ ...pillBase, padding: '6px 14px', fontSize: 11, background: 'transparent', color: C.text2, border: `1px solid ${C.border}` }}>Remove</button>
                </div>
              </div>
            )}

            {showGalleryPicker && (
              <div style={{ ...cardStyle, padding: 16, marginBottom: 16 }}>
                <div style={{ font: `600 12px ${MONO}`, color: C.text2, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Recent Artwork</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {galleryImages.map(img => (
                    <button key={img.id} onClick={() => pickGalleryImage(img)} style={{
                      padding: 0, border: '2px solid transparent', borderRadius: 6, overflow: 'hidden',
                      cursor: 'pointer', background: '#f0ede8', aspectRatio: '1', transition: 'border-color 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <img src={img.image_url || img.url || img.storage_path || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </button>
                  ))}
                </div>
                {galleryImages.length === 0 && <p style={{ font: `400 13px ${FONT}`, color: C.muted, textAlign: 'center', padding: 20 }}>No gallery images found</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
          <button onClick={() => setStep(1)} style={{ ...pillBase, padding: '10px 24px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 13 }}>Back</button>
          <button onClick={() => { if (posts.length === 0) { toast('Add some copy first', 'error'); return; } if (!activePreviewPlatform && posts.length) setActivePreviewPlatform(posts[0].platform); setStep(3); }}
            style={{ ...pillBase, padding: '10px 28px', background: C.gold, color: '#fff', fontSize: 13, fontWeight: 600, opacity: posts.length === 0 ? 0.5 : 1 }}>
            Next \u2014 Preview
          </button>
        </div>
      )}

      {/* ═══ STEP 3 ═══ */}
      {step === 3 && (
        <div>
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

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{
              width: 375, maxWidth: '100%', background: '#fff', borderRadius: 32,
              border: '3px solid #1a1a2e', boxShadow: '0 16px 48px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', background: '#f8f8f8' }}>
                <span style={{ font: `600 13px ${FONT}`, color: '#1a1a2e' }}>9:41</span>
                <div style={{ width: 80, height: 4, background: '#1a1a2e', borderRadius: 2 }} />
                <span style={{ font: `400 12px ${FONT}`, color: '#1a1a2e' }}>100%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #eee' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.gold}, #8B7355)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: `700 11px ${FONT}` }}>DS</div>
                <div>
                  <div style={{ font: `600 13px ${FONT}`, color: '#1a1a2e' }}>darkskycenter</div>
                  <div style={{ font: `400 11px ${FONT}`, color: '#999' }}>Fountain Hills, AZ</div>
                </div>
              </div>
              {imageUrl ? (
                <img src={imageUrl} alt="Post" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '1', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ font: `400 14px ${FONT}`, color: C.muted }}>No image selected</span>
                </div>
              )}
              <div style={{ padding: '12px 16px 20px', maxHeight: 200, overflowY: 'auto' }}>
                <p style={{ font: `400 13px/1.5 ${FONT}`, color: '#1a1a2e', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  <strong style={{ marginRight: 4 }}>darkskycenter</strong>
                  {activePost?.text || 'No copy generated yet'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            {imageUrl && (
              <button onClick={() => downloadImage(imageUrl, dlFilename(activePreviewPlatform || 'social'))} style={{ ...pillBase, padding: '10px 22px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 13 }}>Download Image</button>
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
                  <div style={{ font: `400 12px ${FONT}`, color: C.muted }}>{d.platforms?.join(', ')} \u2014 {d.createdDate}</div>
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
