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

// ── Date/time formatters ──
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${String(m).padStart(2, '0')} ${ampm}`;
}
function getShortDesc(desc) {
  if (!desc) return '';
  const sentences = desc.split(/(?<=[.!?])\s+/);
  const short = sentences.slice(0, 2).join(' ');
  return short.length > 200 ? short.slice(0, 197) + '...' : short;
}
function getOneLiner(desc) {
  if (!desc) return '';
  const first = desc.split(/[.!?]/)[0];
  return first.length > 120 ? first.slice(0, 117) + '...' : first + '.';
}
function getEventHashtag(ev) {
  const t = ((ev?.title || '') + ' ' + (ev?.category || '')).toLowerCase();
  if (t.includes('star party') || t.includes('stargazing')) return 'StarParty';
  if (t.includes('photo')) return 'Astrophotography';
  if (t.includes('kids') || t.includes('camp') || t.includes('family')) return 'KidsSTEM';
  if (t.includes('pour') || t.includes('gala') || t.includes('drink')) return 'PlanetsAndPours';
  if (t.includes('planetarium')) return 'Planetarium';
  if (t.includes('workshop')) return 'AstronomyWorkshop';
  return 'DarkSkyEvent';
}
function getProductVibe(p) {
  const n = (p?.title || '').toLowerCase();
  if (n.includes('hoodie') || n.includes('jacket') || n.includes('sweat')) return 'Layer up for your next star party. Designed for nights under the Milky Way.';
  if (n.includes('tee') || n.includes('shirt') || n.includes('tank')) return 'Wear the night sky. Perfect for observatory visits and everyday adventures.';
  if (n.includes('mug') || n.includes('cup')) return 'Start every morning with a reminder to look up.';
  if (n.includes('poster') || n.includes('print') || n.includes('art')) return 'Bring the cosmos into your home.';
  if (n.includes('hat') || n.includes('beanie') || n.includes('cap')) return 'Top off your look with a piece of the night sky.';
  return 'Designed for dark sky lovers and stargazers.';
}
function getSpotsText(ev) {
  if (!ev?.capacity) return 'Limited capacity \u2014 reserve early.';
  const left = ev.capacity - (ev.ticketsSold || 0);
  if (left < 10) return `Only ${left} spots left \u2014 almost sold out!`;
  return `Only ${ev.capacity} spots available \u2014 don't miss out!`;
}

// ── Image prompt builder — reads full event data ──
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

  const desc = (sourceData.description || '').toLowerCase();
  const title = (sourceData.title || '').toLowerCase();
  const elements = [], setting = [];
  // People
  if (desc.includes('kids') || desc.includes('children') || desc.includes('ages 5') || desc.includes('ages 6')) elements.push('excited children');
  else if (desc.includes('21+') || desc.includes('adult')) elements.push('adults');
  else if (desc.includes('family')) elements.push('families');
  else elements.push('people');
  // Activities
  if (desc.includes('telescope') || desc.includes('viewing')) elements.push('looking through telescopes');
  if (desc.includes('craft') && (desc.includes('beer') || desc.includes('drink'))) elements.push('enjoying craft drinks');
  if (desc.includes('wine')) elements.push('with wine glasses');
  if (desc.includes('rocket') || desc.includes('launch')) elements.push('launching model rockets');
  if (desc.includes('planetarium')) elements.push('inside an immersive planetarium dome');
  if (desc.includes('camera') || desc.includes('photography')) elements.push('with cameras on tripods');
  if (desc.includes('blanket') || desc.includes('lie back')) elements.push('lying on blankets looking up');
  if (desc.includes('uv') || desc.includes('scorpion')) elements.push('with UV flashlights');
  // Celestial
  if (desc.includes('saturn')) elements.push("Saturn's rings visible");
  if (desc.includes('jupiter')) elements.push('Jupiter bright overhead');
  if (desc.includes('milky way')) elements.push('Milky Way arching overhead');
  if (desc.includes('meteor')) elements.push('meteors streaking across the sky');
  // Setting
  if (desc.includes('amphitheater') || desc.includes('patio')) setting.push('on an outdoor desert patio');
  else if (desc.includes('observatory') || desc.includes('deck')) setting.push('on the observatory deck');
  else if (desc.includes('classroom') || desc.includes('education center')) setting.push('in a modern science center');
  else setting.push('under the stars in the Sonoran Desert');
  // Mood
  const mood = [];
  if (desc.includes('music') || desc.includes('acoustic')) mood.push('live acoustic music');
  if (desc.includes('string light') || title.includes('pour') || desc.includes('intimate')) mood.push('warm string lights, intimate atmosphere');
  if (title.includes('kids') || title.includes('camp')) mood.push('bright and fun educational atmosphere');

  return `${elements.join(', ')} ${setting.join(', ')}, Fountain Hills Arizona${mood.length ? ', ' + mood.join(', ') : ''}`;
}

// ── Copy templates — polished, post-ready ──
function generateTemplatePosts(sourceType, sourceData, selectedPlatforms, fundraising) {
  const posts = [], ev = sourceData;
  const title = ev?.title || '', desc = ev?.description || '', price = ev?.price ? fmt(ev.price) : 'Free';
  const date = ev?.date || '', time = ev?.time || '', location = ev?.location || 'IDSDC, Fountain Hills';
  const capacity = ev?.capacity || '', category = ev?.category || '';
  const fDate = formatDate(date), fTime = formatTime(time);
  const shortD = getShortDesc(desc), oneLiner = getOneLiner(desc);
  const r = fundraising?.raised ? fundraising.raised / 100 : 0, g = fundraising?.goal ? fundraising.goal / 100 : 29000000;
  const pct = g > 0 ? Math.round((r / g) * 100) : 0;
  const raisedStr = `$${(r / 1e6).toFixed(1)}M`, goalStr = `$${(g / 1e6).toFixed(1)}M`;

  for (const platform of selectedPlatforms) {
    const p = platform.toLowerCase(); let text = '';
    if (sourceType === 'event') {
      const htag = getEventHashtag(ev);
      if (p === 'instagram') text = `${title}\n\n${shortD}\n\n${fDate}${fTime ? ' at ' + fTime : ''}\n${location}\n${price !== 'Free' ? price : 'Members: FREE'}\n\n${getSpotsText(ev)}\n\nLink in bio to reserve your spot\n\n#DarkSky #FountainHillsAZ #${htag} #Astronomy #Arizona #NightSky #DarkSkyDiscovery #STEM #Stargazing`;
      else if (p === 'facebook') text = `${title}\n\n${shortD}\n\n${fDate}\n${fTime ? fTime + '\n' : ''}${location}\n${price}${ev?.memberFree ? ' | Members: FREE' : ''}\n\n${getSpotsText(ev)}\n\nReserve your spot: darkskycenter.org/events\n\nThe International Dark Sky Discovery Center is located in Fountain Hills, AZ \u2014 one of only 13 International Dark Sky Communities in the world.`;
      else if (p === 'x') text = `${title}\n${fDate}${fTime ? ' \u00B7 ' + fTime : ''}\n${oneLiner}\nLimited spots: darkskycenter.org/events\n#DarkSky #FountainHills #${htag}`;
      else if (p === 'linkedin') text = `We're excited to announce ${title} at the International Dark Sky Discovery Center.\n\n${shortD}\n\nAs one of the last remaining dark sky communities near a major U.S. metro, Fountain Hills offers a unique setting for STEM education and public astronomy.\n\n${fDate}\nFountain Hills, AZ\n\n#DarkSky #STEM #Astronomy #Arizona #Education`;
    } else if (sourceType === 'product') {
      const vibe = getProductVibe(ev);
      if (p === 'instagram') text = `New in the gift shop\n\n${title} \u2014 ${price}\n\n${vibe}\n\nEvery purchase supports dark sky education and preservation at the International Dark Sky Discovery Center.\n\nShop link in bio\n\n#DarkSkyGiftShop #SpaceGifts #Astronomy #FountainHillsAZ #ShopWithPurpose #DarkSky #NightSky #MuseumShop`;
      else if (p === 'facebook') text = `Take the night sky home.\n\n${title} just dropped in our gift shop.\n\n${price} | ${category}\n\n${vibe}\n\nEvery purchase directly supports the International Dark Sky Discovery Center's mission to preserve the night sky and inspire future scientists.\n\nShop now: darkskycenter.org/shop`;
      else if (p === 'x') text = `${title} \u2014 ${price}\n${vibe.slice(0, 100)}\nEvery purchase supports dark sky preservation.\n#DarkSky #GiftShop`;
      else if (p === 'linkedin') text = `Our gift shop isn't just merchandise \u2014 it's mission-driven retail.\n\n${title} (${price}) is part of our growing collection of astronomy-inspired products. Every purchase supports STEM education and dark sky preservation at the International Dark Sky Discovery Center in Fountain Hills, AZ.\n\n#DarkSky #NonProfit #STEM #SocialEnterprise #Arizona`;
    } else if (sourceType === 'donation') {
      if (p === 'instagram') text = `We're ${pct}% of the way to our ${goalStr} goal.\n\n${raisedStr} raised so far \u2014 thanks to people like you who believe the night sky is worth protecting.\n\nEvery dollar brings us closer to opening the International Dark Sky Discovery Center in Fountain Hills, AZ.\n\nLink in bio to donate\n\n#DarkSky #Donate #FountainHillsAZ #Nonprofit #STEM #Astronomy #SupportScience`;
      else if (p === 'facebook') text = `We're so close.\n\n${raisedStr} of our ${goalStr} goal \u2014 ${pct}% of the way there.\n\nThe International Dark Sky Discovery Center will be a world-class STEM education facility with the largest telescope in Greater Phoenix, an immersive planetarium, and programs that connect people to the night sky.\n\nHelp us reach our goal: darkskycenter.org/donate\n\nEvery gift is tax-deductible. The night sky belongs to everyone.`;
      else if (p === 'x') text = `${raisedStr} of ${goalStr} raised.\nHelp us build the International Dark Sky Discovery Center. Every dollar protects the night sky.\n#DarkSky #Donate`;
      else if (p === 'linkedin') text = `The International Dark Sky Discovery Center has raised ${raisedStr} of our ${goalStr} capital campaign goal (${pct}%).\n\nThis world-class facility in Fountain Hills, AZ will house the largest telescope in Greater Phoenix, an immersive planetarium, and STEM programs serving 15,000+ students annually.\n\nLearn how your organization can support our mission: darkskycenter.org/donate\n\n#DarkSky #NonProfit #STEM #Astronomy #Arizona`;
    }
    posts.push({ platform: p, text });
  }
  return posts;
}

// ── Poster canvas renderer ──
const POSTER_TEMPLATES = [
  { id: 'bold', name: 'Bold', desc: 'Dark bg, centered text' },
  { id: 'minimal', name: 'Minimal', desc: 'Photo bg, overlay text' },
  { id: 'split', name: 'Split', desc: 'Text left, photo right' },
  { id: 'story', name: 'Story', desc: '9:16 vertical' },
];

const POSTER_COLORS = [
  { id: 'dark-gold', name: 'Dark & Gold', bg: '#04040c', accent: '#D4AF37', text: '#F0EDE6' },
  { id: 'night-sky', name: 'Night Sky', bg: '#0a0a2e', accent: '#8B9DC3', text: '#E8E5DF' },
  { id: 'desert', name: 'Desert Warm', bg: '#2c1810', accent: '#C5885A', text: '#F0EDE6' },
  { id: 'clean', name: 'Clean White', bg: '#FAFAF8', accent: '#D4AF37', text: '#1A1A2E' },
];

async function renderPoster(template, colors, fields, bgImageUrl) {
  const isStory = template === 'story';
  const W = 1080, H = isStory ? 1920 : 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, W, H);

  // Load bg image if provided
  if (bgImageUrl && (template === 'minimal' || template === 'split')) {
    try {
      const img = new Image(); img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = bgImageUrl; });
      if (template === 'minimal') {
        ctx.drawImage(img, 0, 0, W, H);
        ctx.fillStyle = 'rgba(4,4,12,0.65)'; ctx.fillRect(0, 0, W, H);
      } else {
        ctx.drawImage(img, W / 2, 0, W / 2, H);
      }
    } catch { /* bg image failed, solid color fallback */ }
  }

  // Accent line
  ctx.fillStyle = colors.accent;
  if (template === 'bold') { ctx.fillRect(W / 2 - 60, 200, 120, 3); }
  else if (template === 'story') { ctx.fillRect(40, 120, W - 80, 3); }

  // Text
  ctx.textAlign = template === 'split' ? 'left' : 'center';
  const tx = template === 'split' ? 80 : W / 2;

  // Title
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${isStory ? 72 : 64}px serif`;
  const titleY = template === 'bold' ? 340 : template === 'story' ? 240 : template === 'minimal' ? H / 2 - 80 : 260;
  wrapText(ctx, fields.title || '', tx, titleY, template === 'split' ? W / 2 - 120 : W - 160, isStory ? 84 : 76);

  // Date + Time
  ctx.font = `500 ${isStory ? 36 : 32}px sans-serif`;
  ctx.fillStyle = colors.accent;
  const dtY = titleY + (fields.title?.length > 30 ? 180 : 120);
  ctx.fillText(`${fields.date || ''}${fields.time ? '  \u00B7  ' + fields.time : ''}`, tx, dtY);

  // Location
  ctx.font = `400 ${isStory ? 30 : 28}px sans-serif`;
  ctx.fillStyle = colors.text + 'AA';
  ctx.fillText(fields.location || '', tx, dtY + 50);

  // Price
  if (fields.price) {
    ctx.font = `600 ${isStory ? 34 : 30}px sans-serif`;
    ctx.fillStyle = colors.accent;
    ctx.fillText(fields.price, tx, dtY + 110);
  }

  // CTA
  if (fields.cta) {
    const ctaY = isStory ? H - 300 : H - 160;
    ctx.fillStyle = colors.accent;
    const ctaW = 320, ctaH = 56;
    const ctaX = template === 'split' ? 80 : (W - ctaW) / 2;
    roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 28);
    ctx.fill();
    ctx.fillStyle = colors.bg;
    ctx.font = `700 22px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(fields.cta, ctaX + ctaW / 2, ctaY + 37);
    ctx.textAlign = template === 'split' ? 'left' : 'center';
  }

  // Branding
  ctx.fillStyle = colors.text + '66';
  ctx.font = '400 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('International Dark Sky Discovery Center', W / 2, H - 60);
  ctx.font = '400 16px sans-serif';
  ctx.fillText('Fountain Hills, AZ', W / 2, H - 32);

  return canvas.toDataURL('image/png');
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '', ly = y;
  for (const w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, ly); ly += lineH; line = w + ' ';
    } else { line = test; }
  }
  ctx.fillText(line.trim(), x, ly);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
  const [mediaMode, setMediaMode] = useState('photo'); // 'photo' | 'poster'
  const [mediaTab, setMediaTab] = useState('upload'); // 'upload' | 'generate' | 'gallery'
  const [galleryImages, setGalleryImages] = useState([]);
  const [posterTemplate, setPosterTemplate] = useState('bold');
  const [posterColors, setPosterColors] = useState(POSTER_COLORS[0]);
  const [posterBgUrl, setPosterBgUrl] = useState('');
  const [posterPreview, setPosterPreview] = useState('');
  const [posterFields, setPosterFields] = useState({ title: '', date: '', time: '', location: '', price: '', cta: '' });
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
  const goToStep2 = () => {
    if (!context.trim() && sourceType !== 'custom') { toast('Add context first', 'error'); return; }
    setImagePrompt(buildImagePrompt(sourceType, sourceData, fundraising));
    const tp = generateTemplatePosts(sourceType, sourceData, platforms, fundraising);
    setPosts(tp); if (tp.length) setActivePreviewPlatform(tp[0].platform);
    // Init poster fields from source
    const ev = sourceData;
    setPosterFields({
      title: ev?.title || sourceType || '',
      date: ev?.date ? formatDate(ev.date) : '',
      time: ev?.time ? formatTime(ev.time) : '',
      location: ev?.location || 'Dark Sky Discovery Center',
      price: ev?.price ? fmt(ev.price) + (ev?.memberFree ? ' / Members FREE' : '') : '',
      cta: sourceType === 'event' ? 'Reserve Your Spot' : sourceType === 'product' ? 'Shop Now' : sourceType === 'donation' ? 'Donate Today' : 'Learn More',
    });
    setStep(2);
  };
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
                  <h3 style={{ font: `600 15px ${FONT}`, color: C.text, margin: '0 0 10px' }}>Post Media</h3>

                  {/* Photo / Poster toggle */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <button onClick={() => setMediaMode('photo')} style={{ ...pillBase, padding: '8px 20px', fontSize: 12, flex: 1, background: mediaMode === 'photo' ? C.gold : 'transparent', color: mediaMode === 'photo' ? '#fff' : C.text2, border: mediaMode === 'photo' ? `1px solid ${C.gold}` : `1px solid ${C.border}`, fontWeight: 600 }}>Photo</button>
                    <button onClick={() => setMediaMode('poster')} style={{ ...pillBase, padding: '8px 20px', fontSize: 12, flex: 1, background: mediaMode === 'poster' ? C.gold : 'transparent', color: mediaMode === 'poster' ? '#fff' : C.text2, border: mediaMode === 'poster' ? `1px solid ${C.gold}` : `1px solid ${C.border}`, fontWeight: 600 }}>Poster</button>
                  </div>

                  {/* ── PHOTO MODE ── */}
                  {mediaMode === 'photo' && (<>
                    <div style={{ display: 'flex', gap: 0, marginBottom: 12, background: '#F0EDE8', borderRadius: 6, overflow: 'hidden' }}>
                      {[['upload', 'Upload'], ['generate', 'Generate'], ['gallery', 'Gallery']].map(([k, l]) => (
                        <button key={k} onClick={() => setMediaTab(k)} style={{ flex: 1, padding: '6px 0', background: mediaTab === k ? C.card : 'transparent', border: 'none', font: `500 10px ${FONT}`, color: mediaTab === k ? C.text : C.muted, cursor: 'pointer', borderRadius: mediaTab === k ? 6 : 0, boxShadow: mediaTab === k ? C.shadow : 'none' }}>{l}</button>
                      ))}
                    </div>
                    {mediaTab === 'upload' && (
                      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ border: `2px dashed ${dragOver ? C.gold : C.border}`, borderRadius: 8, padding: 24, textAlign: 'center', cursor: 'pointer', background: dragOver ? `${C.gold}06` : 'transparent', marginBottom: 12 }}>
                        <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                        <div style={{ font: `400 12px ${FONT}`, color: C.muted }}>Drag or click to upload</div>
                      </div>
                    )}
                    {mediaTab === 'generate' && (
                      <div style={{ marginBottom: 12 }}>
                        <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} rows={2} style={{ ...inputStyle, fontSize: 12, lineHeight: 1.4, resize: 'vertical', marginBottom: 8 }} placeholder="Describe the image..." />
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>{IMG_STYLES.map(s => <button key={s} onClick={() => setImageStyle(s)} style={{ ...pillBase, padding: '3px 8px', fontSize: 9, background: imageStyle === s ? C.gold : 'transparent', color: imageStyle === s ? '#fff' : C.text2, border: imageStyle === s ? `1px solid ${C.gold}` : `1px solid ${C.border}` }}>{s}</button>)}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => generateImage(false)} disabled={generatingImage} style={{ ...pillBase, padding: '7px 16px', background: generatingImage ? C.muted : C.gold, color: '#fff', fontSize: 11, fontWeight: 600 }}>{generatingImage ? 'Creating...' : 'Generate'}</button>
                          <button onClick={() => generateImage(true)} disabled={generatingImage} style={{ ...pillBase, padding: '7px 12px', background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, fontSize: 11 }}>Surprise</button>
                        </div>
                        {generatingImage && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}><div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${C.border}`, borderTopColor: C.gold, animation: 'smSpin 0.8s linear infinite' }} /><span style={{ font: `400 11px ${FONT}`, color: C.text2 }}>Creating...</span></div>}
                      </div>
                    )}
                    {mediaTab === 'gallery' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 12 }}>
                        {galleryImages.map(img => (
                          <button key={img.id} onClick={() => pickGallery(img)} style={{ padding: 0, border: '2px solid transparent', borderRadius: 5, overflow: 'hidden', cursor: 'pointer', background: '#f0ede8', aspectRatio: '1' }} onMouseEnter={e => e.currentTarget.style.borderColor = C.gold} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                            <img src={img.image_url || img.url || img.storage_path || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </button>
                        ))}
                        {!galleryImages.length && <p style={{ font: `400 11px ${FONT}`, color: C.muted, gridColumn: '1/-1', textAlign: 'center', padding: 16 }}>No gallery images</p>}
                      </div>
                    )}
                    {mediaUrl && (
                      <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: 12 }}>
                        {mediaType === 'video' ? <video src={mediaUrl} controls style={{ width: '100%', maxHeight: 200, display: 'block', background: '#000' }} />
                        : <img src={mediaUrl} alt="Selected" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', background: '#f0ede8', display: 'block' }} />}
                        <div style={{ padding: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                          {uploadedFile && <span style={{ font: `400 10px ${FONT}`, color: C.muted, flex: 1 }}>{uploadedFile.name}</span>}
                          <button onClick={clearMedia} style={{ ...pillBase, padding: '3px 10px', fontSize: 9, background: 'transparent', color: C.danger, border: `1px solid ${C.border}` }}>Remove</button>
                        </div>
                      </div>
                    )}
                  </>)}

                  {/* ── POSTER MODE ── */}
                  {mediaMode === 'poster' && (<>
                    {/* Template selector */}
                    <label style={labelStyle}>Template</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
                      {POSTER_TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => { setPosterTemplate(t.id); setPosterPreview(''); }} style={{
                          ...cardStyle, padding: '10px 8px', textAlign: 'center', cursor: 'pointer',
                          border: posterTemplate === t.id ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                        }}>
                          <div style={{ font: `600 11px ${FONT}`, color: posterTemplate === t.id ? C.gold : C.text, marginBottom: 2 }}>{t.name}</div>
                          <div style={{ font: `400 9px ${FONT}`, color: C.muted }}>{t.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Color scheme */}
                    <label style={labelStyle}>Color Scheme</label>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                      {POSTER_COLORS.map(c => (
                        <button key={c.id} onClick={() => { setPosterColors(c); setPosterPreview(''); }} style={{
                          ...pillBase, padding: '5px 12px', fontSize: 10,
                          background: posterColors.id === c.id ? c.bg : 'transparent',
                          color: posterColors.id === c.id ? c.text : C.text2,
                          border: posterColors.id === c.id ? `2px solid ${c.accent}` : `1px solid ${C.border}`,
                        }}>{c.name}</button>
                      ))}
                    </div>

                    {/* Background image for minimal/split */}
                    {(posterTemplate === 'minimal' || posterTemplate === 'split') && (
                      <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Background Image</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                          {galleryImages.slice(0, 10).map(img => (
                            <button key={img.id} onClick={() => { setPosterBgUrl(img.image_url || img.url || img.storage_path || ''); setPosterPreview(''); }}
                              style={{ padding: 0, border: posterBgUrl === (img.image_url || img.url || img.storage_path) ? `2px solid ${C.gold}` : '2px solid transparent', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', background: '#f0ede8', aspectRatio: '1' }}>
                              <img src={img.image_url || img.url || img.storage_path || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Editable fields */}
                    <label style={labelStyle}>Poster Text</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {[['title', 'Title'], ['date', 'Date'], ['time', 'Time'], ['location', 'Location'], ['price', 'Price'], ['cta', 'Button Text']].map(([k, l]) => (
                        <input key={k} value={posterFields[k]} onChange={e => { setPosterFields(prev => ({ ...prev, [k]: e.target.value })); setPosterPreview(''); }}
                          placeholder={l} style={{ ...inputStyle, padding: '8px 10px', fontSize: 12 }} />
                      ))}
                    </div>

                    {/* Generate poster */}
                    <button onClick={async () => {
                      try {
                        const dataUrl = await renderPoster(posterTemplate, posterColors, posterFields, posterBgUrl);
                        setPosterPreview(dataUrl);
                        setMediaUrl(dataUrl); setMediaType('image'); setUploadedFile(null);
                        toast('Poster created!');
                      } catch (err) { toast('Poster render failed', 'error'); console.error(err); }
                    }} style={{ ...pillBase, padding: '10px 24px', background: C.gold, color: '#fff', fontSize: 12, fontWeight: 600, marginBottom: 12, width: '100%' }}>
                      Generate Poster
                    </button>

                    {posterPreview && (
                      <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: 12 }}>
                        <img src={posterPreview} alt="Poster preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', background: '#1a1a2e', display: 'block' }} />
                        <div style={{ padding: 8, display: 'flex', gap: 6 }}>
                          <button onClick={() => { const a = document.createElement('a'); a.href = posterPreview; a.download = `darksky-poster-${posterTemplate}.png`; a.click(); }} style={{ ...pillBase, padding: '4px 12px', fontSize: 10, background: C.gold, color: '#fff' }}>Download Poster</button>
                          <button onClick={() => { setPosterPreview(''); clearMedia(); }} style={{ ...pillBase, padding: '4px 12px', fontSize: 10, background: 'transparent', color: C.danger, border: `1px solid ${C.border}` }}>Clear</button>
                        </div>
                      </div>
                    )}
                  </>)}
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
