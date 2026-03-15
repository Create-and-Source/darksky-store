// Social Media — AI-powered social post creator with connected accounts, media uploads, publish simulation
// Step 1: Pick content source | Step 2: Copy + media | Step 3: Preview + publish
// Drafts & History tab for managing saved posts

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../AdminLayout';
import { getEvents, getProducts, getFundraising, subscribe } from '../data/store';
import { gallerySupabase, GENERATE_URL, SUPABASE_ANON_KEY } from '../supabaseGallery';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";
const POSTS_KEY = 'ds_social_posts';
const CONN_KEY = 'ds_social_connections';

const PLATFORMS = ['Instagram', 'Facebook', 'X', 'LinkedIn'];
const TONES = ['Inspiring', 'Playful', 'Urgent', 'Educational', 'Community'];
const IMG_STYLES = ['Painterly', 'Realistic', 'Action Shot', 'Watercolor', 'Abstract', 'Dreamy'];

const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;

// ── Persistence helpers ──
function loadPosts() { try { return JSON.parse(localStorage.getItem(POSTS_KEY)) || []; } catch { return []; } }
function savePosts(d) { localStorage.setItem(POSTS_KEY, JSON.stringify(d)); }
function loadConns() { try { return JSON.parse(localStorage.getItem(CONN_KEY)) || { instagram: true, facebook: true, x: false, linkedin: true }; } catch { return { instagram: true, facebook: true, x: false, linkedin: true }; } }
function saveConns(c) { localStorage.setItem(CONN_KEY, JSON.stringify(c)); }

// Seed posts on first load
function initSeedPosts() {
  if (localStorage.getItem(POSTS_KEY)) return;
  const now = new Date();
  const twoDaysAgo = new Date(now); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const nextFri = new Date(now); nextFri.setDate(nextFri.getDate() + ((5 - nextFri.getDay() + 7) % 7 || 7)); nextFri.setHours(10, 0, 0, 0);
  savePosts([
    { id: 'SP-001', source: { type: 'event', title: 'New Moon Star Party' }, platforms: ['instagram', 'facebook'], posts: [{ platform: 'instagram', text: 'New Moon Star Party\n\nJoin us for our monthly new moon star party! Our volunteer astronomers will guide you through the constellations.\n\nLink in bio.\n\n#DarkSky #FountainHills #StarParty' }, { platform: 'facebook', text: 'Mark your calendars! New Moon Star Party is coming up. The darkest skies of the month!' }], mediaUrl: '/images/darksky/milky-way.jpg', mediaType: 'image', status: 'published', publishedAt: twoDaysAgo.toISOString(), createdAt: twoDaysAgo.toISOString() },
    { id: 'SP-002', source: { type: 'product', title: 'Dark Sky Hoodie' }, platforms: ['instagram'], posts: [{ platform: 'instagram', text: 'New in the shop\n\nDark Sky Hoodie\n\nEvery purchase supports dark sky education.\n\n#DarkSkyGiftShop #SpaceGifts' }], mediaUrl: null, mediaType: null, status: 'scheduled', scheduledAt: nextFri.toISOString(), createdAt: now.toISOString() },
    { id: 'SP-003', source: { type: 'donation', title: 'Fundraising Update' }, platforms: ['facebook', 'linkedin'], posts: [{ platform: 'facebook', text: 'We are so close to our $29M goal. Help us build the International Dark Sky Discovery Center.' }, { platform: 'linkedin', text: 'The IDSDC has raised $27.2M of our $29M capital campaign goal.' }], mediaUrl: null, mediaType: null, status: 'draft', createdAt: now.toISOString() },
  ]);
}

async function downloadImage(url, filename) {
  try { const r = await fetch(url); const blob = await r.blob(); const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = filename || 'darksky.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); } catch { window.open(url, '_blank'); }
}

// ── Image prompt builder (unchanged) ──
function extractActivities(desc) {
  const a = [];
  if (desc.includes('rocket')) a.push('building model rockets');
  if (desc.includes('planet')) a.push('learning about planets');
  if (desc.includes('planetarium')) a.push('planetarium show');
  if (desc.includes('telescope')) a.push('looking through telescopes');
  if (desc.includes('build') || desc.includes('craft')) a.push('hands-on science activities');
  if (desc.includes('lunch')) a.push('outdoor lunch');
  return a.length > 0 ? a.join(', ') : 'hands-on space science activities';
}

function buildImagePrompt(sourceType, sourceData, fundraisingData) {
  if (sourceType === 'custom') return '';
  if (sourceType === 'product' && sourceData) {
    const n = (sourceData.title || '').toLowerCase();
    if (n.includes('hoodie') || n.includes('shirt') || n.includes('tee')) return `${sourceData.title} displayed on desert sandstone at golden hour, warm tones, product lifestyle photo`;
    if (n.includes('mug') || n.includes('cup')) return `${sourceData.title} on a wooden table with steam rising, desert sunrise`;
    return `${sourceData.title} product photo on desert sandstone at twilight, warm golden light, astronomy themed`;
  }
  if (sourceType === 'donation') { const p = fundraisingData?.goal > 0 ? Math.round((fundraisingData.raised / fundraisingData.goal) * 100) : 94; return `Aerial view of a modern science center under construction at golden hour, Arizona desert, ${p} percent complete`; }
  if (sourceType !== 'event' || !sourceData) return '';
  const title = (sourceData.title || '').toLowerCase(), desc = (sourceData.description || '').toLowerCase(), c = title + ' ' + desc;
  if (c.includes('kids') || c.includes('camp') || c.includes('children')) { if (c.includes('rocket')) return 'Children launching model rockets in the Arizona desert, science camp, blue sky'; return `Children at a space science camp, ${extractActivities(desc)}, bright sunny day, Fountain Hills Arizona`; }
  if (c.includes('star party') || c.includes('stargazing') || c.includes('new moon')) return 'Silhouettes around telescopes under the Milky Way, Sonoran Desert, observatory dome, Fountain Hills';
  if (c.includes('astrophotography') || c.includes('photography')) return 'Photographer with camera on tripod capturing the Milky Way, long exposure, desert';
  if (c.includes('meteor') || c.includes('shower')) return 'Meteors streaking across a desert sky, people on blankets, saguaro silhouettes';
  if (c.includes('planet') || c.includes('jupiter') || c.includes('saturn')) return 'Jupiter and Saturn in a dark desert sky, observatory dome, telescope pointed skyward';
  if (c.includes('planetarium') || c.includes('show') || c.includes('dome')) return 'Inside a planetarium dome, projected stars, silhouetted audience, blue-purple lighting';
  if (c.includes('workshop') || c.includes('class') || c.includes('learn')) return 'People in a modern science classroom, astronomy charts, warm lighting';
  if (c.includes('drink') || c.includes('pour') || c.includes('wine') || c.includes('beer')) return 'People with craft drinks under stars on a desert patio, string lights, telescope';
  if (c.includes('wildlife') || c.includes('nocturnal')) return 'Nocturnal desert animals under a starry sky, nature walk at dusk';
  return `${sourceData.title} at the International Dark Sky Discovery Center, Fountain Hills Arizona, desert, evening, astronomy`;
}

// ── Copy templates (unchanged) ──
const HASHTAG_POOL = ['#DarkSky', '#FountainHills', '#StarParty', '#Astronomy', '#Arizona', '#NightSky', '#DarkSkyDiscovery', '#STEM', '#SonoranDesert', '#StargazingAZ', '#ArizonaNights', '#DarkSkyPreservation', '#ScienceEducation', '#Observatory'];
function pickHashtags(n) { return [...HASHTAG_POOL].sort(() => Math.random() - 0.5).slice(0, n).join(' '); }

function generateTemplatePosts(sourceType, sourceData, selectedPlatforms, fundraising) {
  const posts = [], ev = sourceData, title = ev?.title || '', desc = ev?.description || '', shortDesc = desc.length > 120 ? desc.slice(0, 117) + '...' : desc;
  const price = ev?.price ? fmt(ev.price) : 'Free', date = ev?.date || '', time = ev?.time || '', location = ev?.location || 'IDSDC, Fountain Hills', capacity = ev?.capacity || '', category = ev?.category || '';
  const r = fundraising?.raised ? fundraising.raised / 100 : 0, g = fundraising?.goal ? fundraising.goal / 100 : 29000000, pct = g > 0 ? Math.round((r / g) * 100) : 0;
  const raisedStr = `$${(r / 1e6).toFixed(1)}M`, goalStr = `$${(g / 1e6).toFixed(1)}M`;
  for (const platform of selectedPlatforms) {
    const p = platform.toLowerCase(); let text = '';
    if (sourceType === 'event') {
      if (p === 'instagram') text = `${title}\n\n${desc}\n\n${date}${time ? ' at ' + time : ''}\n${location}\n${price !== 'Free' ? price : 'Members: FREE'}\n\nSpots are limited${capacity ? ' \u2014 only ' + capacity + ' available' : ''}.\n\nLink in bio to reserve your spot.\n\n${pickHashtags(8)}`;
      else if (p === 'facebook') text = `Mark your calendars!\n\n${title} is happening ${date}${time ? ' at ' + time : ''}.\n\n${desc}\n\nTickets: ${price} | Members: FREE\n${capacity ? 'Only ' + capacity + ' spots available.\n' : ''}\nReserve: darkskycenter.org/events`;
      else if (p === 'x') text = `${title} \u2014 ${date}. ${shortDesc.slice(0, 100)}${capacity ? ' Limited to ' + capacity + ' spots.' : ''} #DarkSky #FountainHills #StarParty`;
      else if (p === 'linkedin') text = `We're excited to announce ${title} at the International Dark Sky Discovery Center.\n\n${desc}\n\n${date}\nFountain Hills, AZ\n\n${pickHashtags(5)}`;
    } else if (sourceType === 'product') {
      if (p === 'instagram') text = `New in the shop\n\n${title} \u2014 ${price}\n\n${shortDesc}\n\nEvery purchase supports dark sky education.\n\nShop link in bio.\n\n${pickHashtags(7)}`;
      else if (p === 'facebook') text = `Take the night sky home.\n\n${title} just dropped.\n\n${price} | ${category}\n\n${desc}\n\nShop: darkskycenter.org/shop`;
      else if (p === 'x') text = `${title} \u2014 ${price}. ${shortDesc.slice(0, 80)} #DarkSky #GiftShop`;
      else if (p === 'linkedin') text = `Mission-driven retail: ${title} (${price}). Every purchase supports STEM education at the IDSDC.\n\n${pickHashtags(5)}`;
    } else if (sourceType === 'donation') {
      if (p === 'instagram') text = `We're ${pct}% of the way to our ${goalStr} goal.\n\n${raisedStr} raised so far.\n\nLink in bio to donate.\n\n${pickHashtags(7)}`;
      else if (p === 'facebook') text = `${raisedStr} of our ${goalStr} goal \u2014 ${pct}%.\n\nHelp us reach our goal: darkskycenter.org/donate\n\nEvery gift is tax-deductible.`;
      else if (p === 'x') text = `${raisedStr} of ${goalStr} raised. Help us build the IDSDC. #DarkSky #Donate`;
      else if (p === 'linkedin') text = `The IDSDC has raised ${raisedStr} of our ${goalStr} campaign (${pct}%). Learn how to support: darkskycenter.org/donate\n\n${pickHashtags(5)}`;
    }
    posts.push({ platform: p, text });
  }
  return posts;
}

const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: C.shadow };
const pillBase = { padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', font: `500 12px ${FONT}`, letterSpacing: '0.02em', transition: 'all 0.15s' };
const labelStyle = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, marginBottom: 8, display: 'block' };
const inputStyle = { width: '100%', padding: '12px 14px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, font: `400 14px ${FONT}`, color: C.text, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

const PLATFORM_ICONS = {
  instagram: { color: '#E1306C', label: '@darkskydiscovery' },
  facebook: { color: '#1877F2', label: 'Dark Sky Discovery Center' },
  x: { color: '#000', label: '@darkskycenter' },
  linkedin: { color: '#0A66C2', label: 'Dark Sky Discovery Center' },
};

// ════════════════════════════════════════
export default function SocialMedia() {
  const toast = useToast();
  const [tab, setTab] = useState('create'); // 'create' | 'history'

  // Connected accounts
  const [connections, setConnections] = useState(loadConns);
  const toggleConn = (p) => { const next = { ...connections, [p]: !connections[p] }; setConnections(next); saveConns(next); toast(next[p] ? `${p} connected` : `${p} disconnected`); };

  // Wizard state
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState(null);
  const [sourceId, setSourceId] = useState('');
  const [sourceData, setSourceData] = useState(null);
  const [context, setContext] = useState('');
  const [platforms, setPlatforms] = useState(['Instagram', 'Facebook']);
  const [tone, setTone] = useState('Inspiring');
  const [posts, setPosts] = useState([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('Painterly');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [uploadedFile, setUploadedFile] = useState(null); // { name, size, type, objectUrl, dataUrl }
  const [mediaTab, setMediaTab] = useState('upload'); // 'upload' | 'generate' | 'gallery'
  const [galleryImages, setGalleryImages] = useState([]);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState('');
  const [publishedPlatforms, setPublishedPlatforms] = useState(new Set());
  const [publishing, setPublishing] = useState(null); // platform name or 'all'
  const [scheduleDate, setScheduleDate] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [allPosts, setAllPosts] = useState(loadPosts);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const events = getEvents();
  const products = getProducts();
  const fundraising = getFundraising();
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(t => t + 1)), []);
  useEffect(() => { initSeedPosts(); setAllPosts(loadPosts()); }, []);
  useEffect(() => {
    gallerySupabase.from('gallery_images').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        console.log('SocialMedia gallery fetch:', data?.length, 'images', error);
        if (data && data.length > 0) console.log('SM gallery first image keys:', Object.keys(data[0]));
        setGalleryImages(data || []);
      });
  }, []);

  // ── Step 1 helpers ──
  const selectSource = (type) => { setSourceType(type); setSourceId(''); setSourceData(null); if (type === 'custom') setContext(''); else if (type === 'donation') { const r = fundraising.raised / 100, g = fundraising.goal / 100, pct = g > 0 ? Math.round((r / g) * 100) : 0; setContext(`Fundraising: $${(r/1e6).toFixed(1)}M of $${(g/1e6).toFixed(1)}M (${pct}%).`); } };
  const selectEvent = (id) => { const ev = events.find(e => e.id === id); if (!ev) return; setSourceId(id); setSourceData(ev); setContext(`Event: ${ev.title}\nDate: ${ev.date}\nTime: ${ev.time || ''}\nLocation: ${ev.location || ''}\nPrice: ${ev.price ? fmt(ev.price) : 'Free'}\n\n${ev.description || ''}`); };
  const selectProduct = (id) => { const p = products.find(pr => pr.id === id); if (!p) return; setSourceId(id); setSourceData(p); setContext(`Product: ${p.title}\nPrice: ${fmt(p.price)}\nCategory: ${p.category}\n\n${p.description || ''}`); };
  const goToStep2 = () => { if (!context.trim() && sourceType !== 'custom') { toast('Add context first', 'error'); return; } setImagePrompt(buildImagePrompt(sourceType, sourceData, fundraising)); const tp = generateTemplatePosts(sourceType, sourceData, platforms, fundraising); setPosts(tp); if (tp.length) setActivePreviewPlatform(tp[0].platform); setStep(2); };
  const refreshCopy = () => { if (!platforms.length) { toast('Select a platform', 'error'); return; } setPosts(generateTemplatePosts(sourceType, sourceData, platforms, fundraising)); toast('Copy refreshed'); };
  const togglePlatform = (p) => { const next = platforms.includes(p) ? platforms.filter(x => x !== p) : [...platforms, p]; setPlatforms(next); if (step === 2 && sourceType !== 'custom') { const r = generateTemplatePosts(sourceType, sourceData, next, fundraising); setPosts(r); if (r.length && !r.find(x => x.platform === activePreviewPlatform)) setActivePreviewPlatform(r[0].platform); } };
  const updatePostText = (platform, text) => setPosts(prev => prev.map(p => p.platform === platform ? { ...p, text } : p));
  const copyAll = () => { navigator.clipboard.writeText(posts.map(p => `--- ${p.platform.toUpperCase()} ---\n${p.text}`).join('\n\n')); toast('All copied'); };

  // ── Media ──
  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) toast('File is over 25MB — Instagram recommends smaller files', 'warning');
    const objectUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');
    setMediaType(isVideo ? 'video' : 'image');
    setMediaUrl(objectUrl);
    // For draft saving, convert small files to dataUrl
    if (file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => setUploadedFile({ name: file.name, size: file.size, type: file.type, objectUrl, dataUrl: reader.result });
      reader.readAsDataURL(file);
    } else {
      setUploadedFile({ name: file.name, size: file.size, type: file.type, objectUrl, dataUrl: null });
      toast('Large file — media won\'t persist in drafts', 'warning');
    }
  };
  const clearMedia = () => { if (uploadedFile?.objectUrl) URL.revokeObjectURL(uploadedFile.objectUrl); setMediaUrl(''); setUploadedFile(null); setMediaType('image'); };
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); };

  const generateImage = async (surprise = false) => {
    if (!surprise && !imagePrompt.trim()) { toast('Enter a prompt', 'error'); return; }
    setGeneratingImage(true);
    try {
      const r = await fetch(GENERATE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }, body: JSON.stringify({ prompt: surprise ? '' : imagePrompt.trim(), style: imageStyle.toLowerCase(), surprise }) });
      if (!r.ok) throw new Error('Failed');
      const res = await r.json(); const url = res.image_url || res.url || res.imageUrl || '';
      if (!url) throw new Error('No image');
      setMediaUrl(url); setMediaType('image'); setUploadedFile(null); toast('Image generated!');
    } catch { toast('Generation unavailable — pick from gallery', 'error'); setMediaTab('gallery'); } finally { setGeneratingImage(false); }
  };

  const pickGallery = (img) => { const url = img.image_url || img.url || img.storage_path || ''; setMediaUrl(url); setMediaType('image'); setUploadedFile(null); toast('Image selected'); };

  // ── Publish simulation ──
  const publishTo = async (platform) => {
    setPublishing(platform);
    await new Promise(r => setTimeout(r, 2000));
    setPublishedPlatforms(prev => new Set([...prev, platform]));
    setPublishing(null);
    toast(`Published to ${platform}!`);
  };

  const publishAll = async () => {
    const connected = posts.filter(p => connections[p.platform]).map(p => p.platform);
    for (const p of connected) { await publishTo(p); }
    savePost('published');
  };

  // ── Save ──
  const savePost = (status = 'draft', scheduledAt = null) => {
    const post = {
      id: `SP-${Date.now()}`,
      source: { type: sourceType, id: sourceId, title: sourceData?.title || sourceType || 'Custom' },
      platforms: platforms.map(p => p.toLowerCase()), posts,
      mediaUrl: uploadedFile?.dataUrl || (mediaUrl && !mediaUrl.startsWith('blob:') ? mediaUrl : null),
      mediaType: mediaUrl ? mediaType : null, status, scheduledAt,
      publishedAt: status === 'published' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    };
    const all = loadPosts(); all.unshift(post); savePosts(all); setAllPosts(all);
    toast(status === 'published' ? 'Published!' : status === 'scheduled' ? `Scheduled for ${new Date(scheduledAt).toLocaleDateString()}` : 'Draft saved!');
    if (status !== 'draft') setTab('history');
  };

  const loadDraftIntoWizard = (draft) => {
    setPosts(draft.posts || []); setMediaUrl(draft.mediaUrl || ''); setMediaType(draft.mediaType || 'image');
    setPlatforms(draft.platforms?.map(p => p.charAt(0).toUpperCase() + p.slice(1)) || ['Instagram']);
    setActivePreviewPlatform(draft.posts?.[0]?.platform || ''); setPublishedPlatforms(new Set());
    setSourceType(draft.source?.type || 'custom'); setTab('create'); setStep(3);
  };

  const deleteDraft = (id) => { const all = loadPosts().filter(p => p.id !== id); savePosts(all); setAllPosts(all); toast('Deleted'); };
  const duplicateDraft = (draft) => { const copy = { ...draft, id: `SP-${Date.now()}`, status: 'draft', createdAt: new Date().toISOString(), publishedAt: null, scheduledAt: null }; const all = loadPosts(); all.unshift(copy); savePosts(all); setAllPosts(all); toast('Duplicated'); };

  const activePost = posts.find(p => p.platform === activePreviewPlatform);
  const sourceName = sourceData?.title || sourceType || 'post';
  const dlFilename = (p) => `darksky-${p}-${sourceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}.png`;

  // ── Drafts filter ──
  const [historyFilter, setHistoryFilter] = useState('all');
  const filteredPosts = allPosts.filter(p => historyFilter === 'all' || p.status === historyFilter);
  const countByStatus = (s) => allPosts.filter(p => p.status === s).length;

  const StepDots = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
      {[1, 2, 3].map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div onClick={() => { if (s < step) setStep(s); }} style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step >= s ? C.gold : C.border, color: step >= s ? '#fff' : C.muted, font: `600 11px ${FONT}`, cursor: s < step ? 'pointer' : 'default' }}>{s}</div>
          {s < 3 && <div style={{ width: 28, height: 2, background: step > s ? C.gold : C.border, borderRadius: 1 }} />}
        </div>
      ))}
      <span style={{ font: `400 12px ${FONT}`, color: C.muted, marginLeft: 6 }}>Step {step} of 3</span>
    </div>
  );

  return (
    <div>
      {/* Page header + tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ font: `600 24px ${FONT}`, color: C.text, margin: '0 0 4px' }}>Social Media</h1>
          <p style={{ font: `400 13px ${FONT}`, color: C.text2, margin: 0 }}>Create, schedule, and publish posts across platforms.</p>
        </div>
        <div style={{ display: 'flex', gap: 0, background: '#F0EDE8', borderRadius: 8, overflow: 'hidden' }}>
          {[['create', 'Create Post'], ['history', 'Drafts & History']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: '8px 18px', background: tab === k ? C.card : 'transparent', border: 'none', font: `500 12px ${FONT}`, color: tab === k ? C.text : C.muted, cursor: 'pointer', borderRadius: tab === k ? 8 : 0, boxShadow: tab === k ? C.shadow : 'none' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ═══ CONNECTED ACCOUNTS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }} className="sm-conn-grid">
        {PLATFORMS.map(p => {
          const key = p.toLowerCase();
          const info = PLATFORM_ICONS[key];
          const connected = connections[key];
          return (
            <div key={p} style={{ ...cardStyle, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${info.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ font: `700 12px ${FONT}`, color: info.color }}>{p.charAt(0)}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: `600 12px ${FONT}`, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p}</div>
                <div style={{ font: `400 10px ${FONT}`, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{connected ? info.label : 'Not connected'}</div>
              </div>
              {connected ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} />
                  <button onClick={() => toggleConn(key)} style={{ background: 'none', border: 'none', font: `400 10px ${FONT}`, color: C.muted, cursor: 'pointer', textDecoration: 'underline' }}>Disconnect</button>
                </div>
              ) : (
                <button onClick={() => toggleConn(key)} style={{ ...pillBase, padding: '4px 12px', fontSize: 10, background: 'transparent', color: C.gold, border: `1px solid ${C.gold}` }}>Connect</button>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ CREATE TAB ═══ */}
      {tab === 'create' && (
        <>
          <StepDots />

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }} className="sm-source-grid">
                {[{ type: 'event', label: 'From an Event', desc: 'Promote an upcoming event' }, { type: 'product', label: 'From a Product', desc: 'Feature a gift shop item' }, { type: 'custom', label: 'Custom Post', desc: 'Write about anything' }, { type: 'donation', label: 'Donation Campaign', desc: 'Fundraising update' }].map(s => (
                  <button key={s.type} onClick={() => selectSource(s.type)} style={{ ...cardStyle, padding: '18px 20px', textAlign: 'left', cursor: 'pointer', borderLeft: sourceType === s.type ? `3px solid ${C.gold}` : '3px solid transparent' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'} onMouseLeave={e => e.currentTarget.style.boxShadow = C.shadow}>
                    <div style={{ font: `600 14px ${FONT}`, color: sourceType === s.type ? C.gold : C.text, marginBottom: 3 }}>{s.label}</div>
                    <div style={{ font: `400 12px ${FONT}`, color: C.muted }}>{s.desc}</div>
                  </button>
                ))}
              </div>
              {sourceType === 'event' && <div style={{ marginBottom: 16 }}><label style={labelStyle}>Select Event</label><select value={sourceId} onChange={e => selectEvent(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">Choose...</option>{events.filter(e => e.status === 'Published').map(e => <option key={e.id} value={e.id}>{e.title} — {e.date}</option>)}</select></div>}
              {sourceType === 'product' && <div style={{ marginBottom: 16 }}><label style={labelStyle}>Select Product</label><select value={sourceId} onChange={e => selectProduct(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">Choose...</option>{products.slice(0, 30).map(p => <option key={p.id} value={p.id}>{p.title} — {fmt(p.price)}</option>)}</select></div>}
              {sourceType && <div style={{ marginBottom: 16 }}><label style={labelStyle}>Context</label><textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Describe what to post about..." rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} /></div>}
              {sourceType && <button onClick={goToStep2} style={{ ...pillBase, padding: '11px 28px', background: C.gold, color: '#fff', fontSize: 13, fontWeight: 600 }}>Next — Generate Content</button>}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="sm-generate-grid">
                {/* Left: Copy */}
                <div>
                  <h3 style={{ font: `600 15px ${FONT}`, color: C.text, margin: '0 0 14px' }}>Post Copy</h3>
                  <div style={{ marginBottom: 14 }}><label style={labelStyle}>Platforms</label><div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{PLATFORMS.map(p => <button key={p} onClick={() => togglePlatform(p)} style={{ ...pillBase, padding: '5px 12px', fontSize: 11, background: platforms.includes(p) ? C.gold : 'transparent', color: platforms.includes(p) ? '#fff' : C.text2, border: platforms.includes(p) ? `1px solid ${C.gold}` : `1px solid ${C.border}` }}>{p}</button>)}</div></div>
                  <div style={{ marginBottom: 14 }}><label style={labelStyle}>Tone</label><div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{TONES.map(t => <button key={t} onClick={() => setTone(t)} style={{ ...pillBase, padding: '5px 12px', fontSize: 11, background: tone === t ? C.gold : 'transparent', color: tone === t ? '#fff' : C.text2, border: tone === t ? `1px solid ${C.gold}` : `1px solid ${C.border}` }}>{t}</button>)}</div></div>
                  <button onClick={refreshCopy} style={{ ...pillBase, padding: '8px 20px', background: 'transparent', color: C.gold, border: `1px solid ${C.gold}`, fontSize: 11, fontWeight: 600, marginBottom: 16 }}>Refresh Copy</button>
                  {posts.map(p => (
                    <div key={p.platform} style={{ ...cardStyle, padding: 14, marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ font: `600 11px ${MONO}`, color: C.gold, textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.platform}</span>
                        <button onClick={() => { navigator.clipboard.writeText(p.text); toast(`${p.platform} copied`); }} style={{ ...pillBase, padding: '3px 8px', fontSize: 10, background: 'transparent', color: C.text2, border: `1px solid ${C.border}` }}>Copy</button>
                      </div>
                      <textarea value={p.text} onChange={e => updatePostText(p.platform, e.target.value)} rows={Math.min(7, Math.max(3, (p.text || '').split('\n').length + 1))} style={{ ...inputStyle, fontSize: 12, lineHeight: 1.5, resize: 'vertical' }} />
                      {p.platform === 'x' && <div style={{ font: `400 10px ${FONT}`, color: (p.text || '').length > 280 ? C.danger : C.muted, marginTop: 3 }}>{(p.text || '').length}/280</div>}
                    </div>
                  ))}
                </div>

                {/* Right: Media */}
                <div>
                  <h3 style={{ font: `600 15px ${FONT}`, color: C.text, margin: '0 0 14px' }}>Post Media</h3>
                  {/* Media tabs */}
                  <div style={{ display: 'flex', gap: 0, marginBottom: 14, background: '#F0EDE8', borderRadius: 6, overflow: 'hidden' }}>
                    {[['upload', 'Upload'], ['generate', 'Generate'], ['gallery', 'Gallery']].map(([k, l]) => (
                      <button key={k} onClick={() => setMediaTab(k)} style={{ flex: 1, padding: '7px 0', background: mediaTab === k ? C.card : 'transparent', border: 'none', font: `500 11px ${FONT}`, color: mediaTab === k ? C.text : C.muted, cursor: 'pointer', borderRadius: mediaTab === k ? 6 : 0, boxShadow: mediaTab === k ? C.shadow : 'none' }}>{l}</button>
                    ))}
                  </div>

                  {/* Upload */}
                  {mediaTab === 'upload' && (
                    <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ border: `2px dashed ${dragOver ? C.gold : C.border}`, borderRadius: 10, padding: 32, textAlign: 'center', cursor: 'pointer', background: dragOver ? `${C.gold}06` : 'transparent', transition: 'all 0.2s', marginBottom: 14 }}>
                      <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                      <div style={{ font: `400 13px ${FONT}`, color: C.muted }}>Drag photos or videos here, or click to browse</div>
                    </div>
                  )}

                  {/* Generate */}
                  {mediaTab === 'generate' && (
                    <div style={{ marginBottom: 14 }}>
                      <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} rows={3} style={{ ...inputStyle, fontSize: 12, lineHeight: 1.5, resize: 'vertical', marginBottom: 10 }} placeholder="Describe the image..." />
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>{IMG_STYLES.map(s => <button key={s} onClick={() => setImageStyle(s)} style={{ ...pillBase, padding: '4px 10px', fontSize: 10, background: imageStyle === s ? C.gold : 'transparent', color: imageStyle === s ? '#fff' : C.text2, border: imageStyle === s ? `1px solid ${C.gold}` : `1px solid ${C.border}` }}>{s}</button>)}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => generateImage(false)} disabled={generatingImage} style={{ ...pillBase, padding: '8px 18px', background: generatingImage ? C.muted : C.gold, color: '#fff', fontSize: 11, fontWeight: 600 }}>{generatingImage ? 'Creating...' : 'Generate'}</button>
                        <button onClick={() => generateImage(true)} disabled={generatingImage} style={{ ...pillBase, padding: '8px 14px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 11 }}>Surprise Me</button>
                      </div>
                      {generatingImage && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}><div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${C.border}`, borderTopColor: C.gold, animation: 'smSpin 0.8s linear infinite' }} /><span style={{ font: `400 12px ${FONT}`, color: C.text2 }}>Creating artwork...</span></div>}
                    </div>
                  )}

                  {/* Gallery */}
                  {mediaTab === 'gallery' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
                      {galleryImages.map(img => (
                        <button key={img.id} onClick={() => pickGallery(img)} style={{ padding: 0, border: '2px solid transparent', borderRadius: 6, overflow: 'hidden', cursor: 'pointer', background: '#f0ede8', aspectRatio: '1' }} onMouseEnter={e => e.currentTarget.style.borderColor = C.gold} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                          <img src={img.image_url || img.url || img.storage_path || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </button>
                      ))}
                      {!galleryImages.length && <p style={{ font: `400 12px ${FONT}`, color: C.muted, gridColumn: '1/-1', textAlign: 'center', padding: 20 }}>No gallery images</p>}
                    </div>
                  )}

                  {/* Media preview */}
                  {mediaUrl && (
                    <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: 14 }}>
                      {mediaType === 'video' ? (
                        <video src={mediaUrl} controls style={{ width: '100%', maxHeight: 250, display: 'block', background: '#000' }} />
                      ) : (
                        <img src={mediaUrl} alt="Selected" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', background: '#f0ede8', display: 'block' }} />
                      )}
                      <div style={{ padding: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                        {uploadedFile && <span style={{ font: `400 11px ${FONT}`, color: C.muted, flex: 1 }}>{uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(1)}MB)</span>}
                        <button onClick={clearMedia} style={{ ...pillBase, padding: '4px 12px', fontSize: 10, background: 'transparent', color: C.danger, border: `1px solid ${C.border}` }}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <button onClick={() => setStep(1)} style={{ ...pillBase, padding: '9px 20px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 12 }}>Back</button>
                <button onClick={() => { if (!posts.length) { toast('Add copy first', 'error'); return; } if (!activePreviewPlatform && posts.length) setActivePreviewPlatform(posts[0].platform); setPublishedPlatforms(new Set()); setStep(3); }} style={{ ...pillBase, padding: '9px 24px', background: C.gold, color: '#fff', fontSize: 12, fontWeight: 600, opacity: posts.length ? 1 : 0.5 }}>Next — Preview</button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
                {posts.map(p => <button key={p.platform} onClick={() => setActivePreviewPlatform(p.platform)} style={{ ...pillBase, padding: '6px 14px', fontSize: 11, background: activePreviewPlatform === p.platform ? C.gold : 'transparent', color: activePreviewPlatform === p.platform ? '#fff' : C.text2, border: activePreviewPlatform === p.platform ? `1px solid ${C.gold}` : `1px solid ${C.border}` }}>{p.platform}</button>)}
              </div>

              {/* Phone mockup */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 340, maxWidth: '100%', background: '#fff', borderRadius: 28, border: '3px solid #1a1a2e', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 16px', background: '#f8f8f8', fontSize: 12, fontFamily: FONT, color: '#1a1a2e' }}><span style={{ fontWeight: 600 }}>9:41</span><div style={{ width: 60, height: 3, background: '#1a1a2e', borderRadius: 2, alignSelf: 'center' }} /><span>100%</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid #eee' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.gold}, #8B7355)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: `700 10px ${FONT}` }}>DS</div>
                    <div><div style={{ font: `600 12px ${FONT}`, color: '#1a1a2e' }}>darkskycenter</div><div style={{ font: `400 10px ${FONT}`, color: '#999' }}>Fountain Hills, AZ</div></div>
                  </div>
                  {mediaUrl ? (
                    mediaType === 'video' ? <video src={mediaUrl} controls style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', background: '#000' }} />
                    : <img src={mediaUrl} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                  ) : <div style={{ width: '100%', aspectRatio: '1', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `400 13px ${FONT}`, color: C.muted }}>No media</div>}
                  <div style={{ padding: '10px 14px 16px', maxHeight: 160, overflowY: 'auto' }}>
                    <p style={{ font: `400 12px/1.5 ${FONT}`, color: '#1a1a2e', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}><strong>darkskycenter </strong>{activePost?.text || ''}</p>
                  </div>
                </div>
              </div>

              {/* Publish buttons per platform */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                {posts.map(p => {
                  const key = p.platform;
                  const conn = connections[key];
                  const published = publishedPlatforms.has(key);
                  const busy = publishing === key;
                  return (
                    <button key={key} disabled={!conn || published || !!publishing}
                      onClick={() => publishTo(key)}
                      title={!conn ? 'Connect account first' : ''}
                      style={{
                        ...pillBase, padding: '9px 20px', fontSize: 12, fontWeight: 600, minWidth: 140,
                        background: published ? C.success : !conn ? '#E8E5DF' : C.gold,
                        color: published ? '#fff' : !conn ? C.muted : '#fff',
                        opacity: !conn ? 0.5 : 1, cursor: !conn || published || publishing ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}>
                      {busy && <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'smSpin 0.8s linear infinite' }} />}
                      {published ? `Published to ${key}` : `Publish to ${key}`}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
                <button onClick={publishAll} disabled={!!publishing || posts.every(p => !connections[p.platform])} style={{ ...pillBase, padding: '10px 24px', background: C.gold, color: '#fff', fontSize: 12, fontWeight: 600, opacity: posts.some(p => connections[p.platform]) ? 1 : 0.5 }}>Publish All</button>
                <button onClick={() => setShowSchedule(!showSchedule)} style={{ ...pillBase, padding: '10px 20px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 12 }}>Schedule</button>
                <button onClick={() => savePost('draft')} style={{ ...pillBase, padding: '10px 20px', background: 'transparent', color: C.gold, border: `1px solid ${C.gold}`, fontSize: 12 }}>Save Draft</button>
                {mediaUrl && <button onClick={() => downloadImage(mediaUrl, dlFilename(activePreviewPlatform || 'social'))} style={{ ...pillBase, padding: '10px 16px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 11 }}>Download Media</button>}
                <button onClick={() => { if (activePost) { navigator.clipboard.writeText(activePost.text); toast('Copied'); } }} style={{ ...pillBase, padding: '10px 16px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 11 }}>Copy Caption</button>
                <button onClick={copyAll} style={{ ...pillBase, padding: '10px 16px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 11 }}>Copy All</button>
              </div>

              {showSchedule && (
                <div style={{ ...cardStyle, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <label style={{ ...labelStyle, margin: 0 }}>Schedule for</label>
                  <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ ...inputStyle, width: 'auto', flex: 1 }} />
                  <button onClick={() => { if (!scheduleDate) { toast('Pick a date', 'error'); return; } savePost('scheduled', scheduleDate); setShowSchedule(false); }} style={{ ...pillBase, padding: '8px 18px', background: C.gold, color: '#fff', fontSize: 12, fontWeight: 600 }}>Confirm Schedule</button>
                </div>
              )}

              <button onClick={() => setStep(2)} style={{ ...pillBase, padding: '9px 20px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 12 }}>Back to Editor</button>
            </div>
          )}
        </>
      )}

      {/* ═══ HISTORY TAB ═══ */}
      {tab === 'history' && (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {[['all', 'All', allPosts.length], ['draft', 'Drafts', countByStatus('draft')], ['scheduled', 'Scheduled', countByStatus('scheduled')], ['published', 'Published', countByStatus('published')]].map(([k, l, n]) => (
              <button key={k} onClick={() => setHistoryFilter(k)} style={{ ...pillBase, padding: '6px 14px', fontSize: 11, background: historyFilter === k ? C.gold : 'transparent', color: historyFilter === k ? '#fff' : C.text2, border: historyFilter === k ? `1px solid ${C.gold}` : `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 5 }}>
                {l}<span style={{ font: `600 10px ${FONT}`, opacity: 0.7 }}>{n}</span>
              </button>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div style={{ fontSize: 32, color: C.muted, opacity: 0.3, marginBottom: 8 }}>&#10022;</div><p style={{ font: `400 14px ${FONT}`, color: C.muted }}>No posts yet. Create your first social media post above!</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredPosts.map(d => {
                const statusColors = { draft: { bg: '#F0EDE8', color: C.text2, border: C.border }, scheduled: { bg: `${C.gold}12`, color: C.gold, border: C.gold }, published: { bg: `${C.success}12`, color: C.success, border: C.success } };
                const sc = statusColors[d.status] || statusColors.draft;
                return (
                  <div key={d.id} style={{ ...cardStyle, padding: '14px 16px', borderLeft: `3px solid ${sc.border}`, display: 'flex', gap: 14, alignItems: 'center' }}>
                    {/* Thumbnail */}
                    <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', background: '#f0ede8', flexShrink: 0 }}>
                      {d.mediaUrl ? <img src={d.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `400 20px ${FONT}`, color: C.muted, opacity: 0.3 }}>&#10022;</div>}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: `500 13px ${FONT}`, color: C.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.source?.title || 'Untitled'}</div>
                      <div style={{ font: `400 11px ${FONT}`, color: C.muted, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {d.platforms?.map(p => <span key={p} style={{ font: `600 9px ${MONO}`, textTransform: 'uppercase', color: PLATFORM_ICONS[p]?.color || C.muted, letterSpacing: 0.5 }}>{p}</span>)}
                        <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    {/* Status */}
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                      {d.status}{d.status === 'scheduled' && d.scheduledAt ? ` ${new Date(d.scheduledAt).toLocaleDateString()}` : ''}
                    </span>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => loadDraftIntoWizard(d)} style={{ ...pillBase, padding: '4px 10px', fontSize: 10, background: 'transparent', color: C.text2, border: `1px solid ${C.border}` }}>Edit</button>
                      <button onClick={() => duplicateDraft(d)} style={{ ...pillBase, padding: '4px 10px', fontSize: 10, background: 'transparent', color: C.text2, border: `1px solid ${C.border}` }}>Dup</button>
                      <button onClick={() => { if (confirm('Delete this post?')) deleteDraft(d.id); }} style={{ ...pillBase, padding: '4px 10px', fontSize: 10, background: 'transparent', color: C.danger, border: `1px solid ${C.border}` }}>Del</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes smSpin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .sm-generate-grid { grid-template-columns: 1fr !important; }
          .sm-source-grid { grid-template-columns: 1fr !important; }
          .sm-conn-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .sm-conn-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
