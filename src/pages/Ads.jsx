// MuseumOS Ad Studio — Hidden internal page for generating Facebook & Instagram ad creatives
// Route: /ads (not in any navigation)

import { useState, useRef, useCallback } from 'react';

const FONT = "'Playfair Display', serif";
const BODY = "'DM Sans', -apple-system, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const C = {
  bg: '#04040c',
  surface: '#0a0a1a',
  surface2: '#0f0f1e',
  border: '#16162a',
  gold: '#D4AF37',
  goldHover: '#E5C76B',
  goldDim: '#a08520',
  text: '#F0EDE6',
  text2: '#908D9A',
  muted: '#5C5870',
};

// ── Ad Data ──
const ADS = [
  {
    id: 'dashboard',
    headline: 'Your museum.\nOne dashboard.',
    body: 'KPIs, inventory, events, donations, volunteers — everything your team needs, one login away.',
    cta: 'See the Demo',
    platforms: ['instagram', 'facebook'],
    icon: '📊',
    features: ['Real-time KPIs', 'Staff alerts', 'Quick actions'],
    bgImage: '/images/darksky/observatory-hero.jpg',
    gradient: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a2e 50%, #0a1a2e 100%)',
    accentColor: '#7C6BAF',
    fb: {
      primary: "Running a museum shouldn't mean running 12 different tools.\n\nMuseumOS brings your entire operation into one beautiful dashboard — gift shop sales, event check-ins, donation tracking, volunteer hours, and more.\n\nBuilt by museum people, for museum people.",
      headline: 'Your Museum. One Dashboard.',
      description: 'The all-in-one platform for museums, science centers & cultural institutions.',
      ctaButton: 'Learn More',
    },
  },
  {
    id: 'pos',
    headline: 'A point-of-sale\nbuilt for museum\ngift shops.',
    body: 'Tablet-optimized. Member QR scanning. Inventory syncs in real time. No more workarounds.',
    cta: 'Book a Demo',
    platforms: ['instagram', 'facebook'],
    icon: '🏪',
    features: ['Member scanning', 'Real-time sync', 'Tablet-ready'],
    bgImage: '/images/darksky/desert-night-sky.png',
    gradient: 'linear-gradient(135deg, #0a1a0a 0%, #0a0a1a 50%, #1a1a0a 100%)',
    accentColor: '#3D8C6F',
    fb: {
      primary: "Your gift shop POS shouldn't fight you.\n\nMuseumOS POS was designed for museum gift shops from day one. Scan member cards for discounts. Ring up admission + merch in one transaction. See inventory levels before you sell the last one.\n\nTablet-optimized. Zero learning curve.",
      headline: 'POS Built for Museum Gift Shops',
      description: 'Member scanning, inventory sync, and a register your staff will actually love.',
      ctaButton: 'Book a Demo',
    },
  },
  {
    id: 'events',
    headline: 'Sell tickets.\nTrack check-ins.\nFill seats.',
    body: 'Create events, manage capacity, sell tickets online, and check guests in at the door.',
    cta: 'See How It Works',
    platforms: ['instagram', 'facebook'],
    icon: '🎟️',
    features: ['Online tickets', 'Live check-in', 'Capacity alerts'],
    bgImage: '/images/darksky/meteor-shower.jpg',
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #0a0a1a 50%, #0a0a2e 100%)',
    accentColor: '#C45B5B',
    fb: {
      primary: "Star parties. Planetarium shows. Fundraising galas. Field trips.\n\nMuseumOS handles it all — create events, sell tickets on your website, track capacity in real time, and check guests in with a tap.\n\nNo more spreadsheets. No more headcounts at the door.",
      headline: 'Events Made Effortless',
      description: 'From ticket sales to check-in — event management built for cultural institutions.',
      ctaButton: 'See How It Works',
    },
  },
  {
    id: 'ecommerce',
    headline: 'Your gift shop\ndeserves an\nonline store.',
    body: 'Beautiful storefront. Print-on-demand. Cart, checkout, and order tracking — all built in.',
    cta: 'Start Selling Online',
    platforms: ['instagram', 'facebook'],
    icon: '🛍️',
    features: ['Print-on-demand', 'Beautiful storefront', 'Order tracking'],
    bgImage: '/images/darksky/nebula.jpg',
    gradient: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a1e 50%, #2a0a1e 100%)',
    accentColor: '#D4AF37',
    fb: {
      primary: "Your gift shop is a revenue engine. Why limit it to foot traffic?\n\nMuseumOS gives you a gorgeous online store that matches your brand. Connect print-on-demand suppliers. Manage physical inventory. Let visitors buy that hoodie they saw in the gift shop — from home.\n\nEvery purchase supports your mission.",
      headline: 'Your Gift Shop, Online',
      description: 'E-commerce built for museum shops — print-on-demand, inventory sync, beautiful storefront.',
      ctaButton: 'Start Selling',
    },
  },
  {
    id: 'donations',
    headline: 'Track every dollar.\nThank every donor.',
    body: 'Donation pages, fundraising goals, donor management, and acknowledgment workflows.',
    cta: 'Learn More',
    platforms: ['instagram', 'facebook'],
    icon: '💛',
    features: ['Fundraising goals', 'Donor CRM', 'Tax receipts'],
    bgImage: '/images/darksky/milky-way.jpg',
    gradient: 'linear-gradient(135deg, #1a1a0a 0%, #0a0a1a 50%, #0a1a1a 100%)',
    accentColor: '#D4943A',
    fb: {
      primary: "Your donors believe in your mission. Show them you're a good steward.\n\nMuseumOS tracks every donation, automates acknowledgments, and gives your board a real-time view of fundraising progress.\n\nFrom $5 memberships to $1M capital campaigns — one system for all of it.",
      headline: 'Donations & Fundraising, Simplified',
      description: 'Track gifts, manage donors, and hit your fundraising goals — all in one place.',
      ctaButton: 'Learn More',
    },
  },
  {
    id: 'allinone',
    headline: 'Stop juggling\n12 different tools.',
    body: 'POS · E-commerce · Events · CRM · Email · Donations · Reports · Volunteers — one platform.',
    cta: 'Get Started',
    platforms: ['instagram', 'facebook'],
    icon: '⚡',
    features: ['POS + E-commerce', 'Events + CRM', 'Email + Reports'],
    bgImage: '/images/darksky/andromeda.jpg',
    gradient: 'linear-gradient(135deg, #0a0a1a 0%, #0a0a2e 50%, #1a0a2e 100%)',
    accentColor: '#D4AF37',
    fb: {
      primary: "Square for the register. Shopify for the website. Eventbrite for tickets. Mailchimp for emails. A spreadsheet for volunteers. Another spreadsheet for donors.\n\nSound familiar?\n\nMuseumOS replaces all of it. One platform. One login. One monthly price.\n\n$3,500/mo for everything your museum needs.",
      headline: 'One Platform. Everything You Need.',
      description: 'POS, e-commerce, events, CRM, email, donations, reports — $3,500/mo.',
      ctaButton: 'Get Started',
    },
  },
  {
    id: 'nonprofit',
    headline: 'Software that\nunderstands\nyour mission.',
    body: '501(c)(3) friendly. Donor management. Board reporting. Built for organizations that exist to inspire.',
    cta: 'Book a Call',
    platforms: ['instagram', 'facebook'],
    icon: '🏛️',
    features: ['Nonprofit-first', 'Board reports', 'Grant tracking'],
    bgImage: '/images/darksky/first-light-nebula.jpg',
    gradient: 'linear-gradient(135deg, #0a1a1a 0%, #0a0a1a 50%, #0a0a2e 100%)',
    accentColor: '#7C6BAF',
    fb: {
      primary: "Most software was built for retail. Or restaurants. Or SaaS companies.\n\nMuseumOS was built for you — the science center director, the gift shop manager, the volunteer coordinator, the education team.\n\nWe understand that your bottom line is impact, not just revenue. And we built every feature around that.",
      headline: 'Built for Nonprofits. Built for You.',
      description: 'Museum management software designed for cultural institutions and 501(c)(3) orgs.',
      ctaButton: 'Book a Call',
    },
  },
  {
    id: 'casestudy',
    headline: 'How one discovery\ncenter runs everything\non MuseumOS.',
    body: '67 products. 6 event series. 5 facility spaces. 1 platform. See how the International Dark Sky Discovery Center does it.',
    cta: 'Read the Story',
    platforms: ['instagram', 'facebook'],
    icon: '🔭',
    features: ['67 products', '5 spaces', 'Full case study'],
    bgImage: '/images/darksky/comet-neowise.jpg',
    gradient: 'linear-gradient(135deg, #1a1a0a 0%, #0a0a1a 50%, #1a0a1a 100%)',
    accentColor: '#D4AF37',
    fb: {
      primary: "The International Dark Sky Discovery Center in Fountain Hills, AZ opens in 2026 — a 22,000 sq ft center dedicated to dark sky education.\n\nThey chose MuseumOS to run everything: gift shop POS, online store with 67 products, event ticketing, facility booking across 5 spaces, donation tracking for their $29M capital campaign, volunteer management, and more.\n\nOne platform. Zero compromises.",
      headline: 'Case Study: Dark Sky Discovery Center',
      description: 'See how a 22,000 sq ft discovery center runs on MuseumOS.',
      ctaButton: 'Read the Story',
    },
  },
];

// ── Canvas Download ──
function renderAdToCanvas(ad, platform) {
  return new Promise((resolve) => {
    const W = 1080;
    const H = platform === 'instagram' ? 1080 : 1200;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, '#04040c');
    grd.addColorStop(0.5, '#0a0a2e');
    grd.addColorStop(1, '#04040c');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Try loading bg image, fall back to gradient-only
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.globalAlpha = 0.15;
      ctx.drawImage(img, 0, 0, W, H);
      ctx.globalAlpha = 1;
      finishRender(ctx, W, H, ad, resolve, canvas);
    };
    img.onerror = () => {
      finishRender(ctx, W, H, ad, resolve, canvas);
    };
    img.src = ad.bgImage;
  });
}

function finishRender(ctx, W, H, ad, resolve, canvas) {
  // Dark overlay
  const overlay = ctx.createLinearGradient(0, 0, 0, H);
  overlay.addColorStop(0, 'rgba(4,4,12,0.5)');
  overlay.addColorStop(0.4, 'rgba(4,4,12,0.7)');
  overlay.addColorStop(1, 'rgba(4,4,12,0.9)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  // Gold accent line
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(80, 160, 60, 4);

  // "MuseumOS" label
  ctx.font = '600 28px "JetBrains Mono", monospace';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('MuseumOS', 80, 140);

  // Headline
  ctx.font = '700 72px "Playfair Display", Georgia, serif';
  ctx.fillStyle = '#F0EDE6';
  const lines = ad.headline.split('\n');
  let y = 280;
  lines.forEach(line => {
    ctx.fillText(line, 80, y);
    y += 90;
  });

  // Body
  ctx.font = '400 32px "DM Sans", -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(240,237,230,0.7)';
  const bodyLines = wrapText(ctx, ad.body, W - 160, 32);
  bodyLines.forEach(line => {
    ctx.fillText(line, 80, y + 40);
    y += 44;
  });

  // Feature pills
  y += 60;
  let pillX = 80;
  ctx.font = '500 24px "DM Sans", sans-serif';
  (ad.features || []).forEach(f => {
    const tw = ctx.measureText(f).width;
    const pw = tw + 40;
    ctx.fillStyle = 'rgba(212,175,55,0.12)';
    roundRect(ctx, pillX, y, pw, 48, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,175,55,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, pillX, y, pw, 48, 24);
    ctx.stroke();
    ctx.fillStyle = '#D4AF37';
    ctx.fillText(f, pillX + 20, y + 33);
    pillX += pw + 16;
  });

  // CTA button
  const ctaY = H - 160;
  ctx.font = '600 30px "DM Sans", sans-serif';
  const ctaW = ctx.measureText(ad.cta).width + 80;
  ctx.fillStyle = '#D4AF37';
  roundRect(ctx, 80, ctaY, ctaW, 64, 32);
  ctx.fill();
  ctx.fillStyle = '#04040c';
  ctx.fillText(ad.cta, 120, ctaY + 43);

  // Bottom bar
  ctx.fillStyle = 'rgba(240,237,230,0.15)';
  ctx.fillRect(0, H - 60, W, 1);
  ctx.font = '400 22px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(240,237,230,0.4)';
  ctx.fillText('museumOS.com', 80, H - 28);

  resolve(canvas);
}

function wrapText(ctx, text, maxW, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  words.forEach(word => {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxW) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ── Ad Card Component ──
function AdCard({ ad, onCopy }) {
  const [platform, setPlatform] = useState('instagram');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = await renderAdToCanvas(ad, platform);
      const link = document.createElement('a');
      link.download = `museumOS-${ad.id}-${platform}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    }
    setDownloading(false);
  }, [ad, platform]);

  const handleCopy = useCallback(() => {
    const text = `${ad.fb.primary}\n\n---\nHeadline: ${ad.fb.headline}\nDescription: ${ad.fb.description}\nCTA: ${ad.fb.ctaButton}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopy?.(ad.headline.split('\n')[0]);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [ad, onCopy]);

  const isSquare = platform === 'instagram';

  return (
    <div ref={cardRef} style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      transition: 'transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 60px rgba(212,175,55,0.08)`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Ad Preview */}
      <div style={{
        position: 'relative',
        aspectRatio: isSquare ? '1/1' : '9/11.2',
        background: ad.gradient,
        overflow: 'hidden',
        cursor: 'default',
      }}>
        {/* BG image */}
        <img src={ad.bgImage} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.12, filter: 'saturate(0.6)',
        }} loading="lazy" />

        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(4,4,12,0.4) 0%, rgba(4,4,12,0.65) 40%, rgba(4,4,12,0.88) 100%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '32px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* MuseumOS label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: C.gold }}> MuseumOS</span>
          </div>
          <div style={{ width: 32, height: 2, background: C.gold, marginBottom: 24, borderRadius: 1 }} />

          {/* Headline */}
          <h3 style={{
            fontFamily: FONT, fontSize: 28, fontWeight: 700, lineHeight: 1.15,
            color: C.text, margin: 0, whiteSpace: 'pre-line', flex: '0 0 auto',
          }}>
            {ad.headline}
          </h3>

          {/* Body */}
          <p style={{
            fontFamily: BODY, fontSize: 13, lineHeight: 1.6, color: 'rgba(240,237,230,0.6)',
            margin: '16px 0 0', flex: '1 1 auto',
          }}>
            {ad.body}
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '16px 0' }}>
            {ad.features.map(f => (
              <span key={f} style={{
                fontFamily: BODY, fontSize: 10, fontWeight: 500, color: C.gold,
                background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: 20, padding: '4px 12px', letterSpacing: 0.3,
              }}>{f}</span>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            fontFamily: BODY, fontSize: 13, fontWeight: 600, color: C.bg,
            background: C.gold, borderRadius: 20, padding: '8px 24px',
            alignSelf: 'flex-start', letterSpacing: 0.3,
          }}>
            {ad.cta}
          </div>

          {/* Bottom bar */}
          <div style={{
            marginTop: 'auto', paddingTop: 12,
            borderTop: '1px solid rgba(240,237,230,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: BODY, fontSize: 10, color: 'rgba(240,237,230,0.3)', letterSpacing: 0.5 }}>museumOS.com</span>
            <span style={{ fontSize: 16 }}>{ad.icon}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
        {/* Platform toggle */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: C.bg, borderRadius: 8, padding: 3 }}>
          {['instagram', 'facebook'].map(p => (
            <button key={p} onClick={() => setPlatform(p)} style={{
              flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
              fontFamily: MONO, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
              background: platform === p ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: platform === p ? C.gold : C.muted,
              transition: 'all 0.2s ease',
            }}>
              {p === 'instagram' ? '◻ IG 1:1' : '▭ FB 9:11'}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} style={{
            flex: 1, padding: '10px 0', border: `1px solid ${C.border}`, borderRadius: 8,
            background: copied ? 'rgba(212,175,55,0.12)' : 'transparent', cursor: 'pointer',
            fontFamily: BODY, fontSize: 12, fontWeight: 500, letterSpacing: 0.3,
            color: copied ? C.gold : C.text2, transition: 'all 0.2s ease',
          }}>
            {copied ? '✓ Copied' : 'Copy Text'}
          </button>
          <button onClick={handleDownload} disabled={downloading} style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
            background: C.gold, cursor: downloading ? 'wait' : 'pointer',
            fontFamily: BODY, fontSize: 12, fontWeight: 600, color: C.bg,
            opacity: downloading ? 0.6 : 1, transition: 'all 0.2s ease',
          }}>
            {downloading ? 'Rendering...' : '↓ Download PNG'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Copy Panel Component ──
function CopyPanel({ ad }) {
  const [copiedField, setCopiedField] = useState(null);

  const copyField = (key, value) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const fields = [
    { key: 'primary', label: 'Primary Text', value: ad.fb.primary },
    { key: 'headline', label: 'Headline', value: ad.fb.headline },
    { key: 'description', label: 'Description', value: ad.fb.description },
    { key: 'cta', label: 'CTA Button', value: ad.fb.ctaButton },
  ];

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{ad.icon}</span>
        <h4 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>
          {ad.headline.split('\n')[0]}
        </h4>
      </div>

      {fields.map(f => (
        <div key={f.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.gold }}>{f.label}</span>
            <button onClick={() => copyField(f.key, f.value)} style={{
              border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: BODY, fontSize: 11, color: copiedField === f.key ? C.gold : C.muted,
              padding: '2px 8px', borderRadius: 4, transition: 'color 0.2s',
            }}>
              {copiedField === f.key ? '✓ copied' : 'copy'}
            </button>
          </div>
          <div style={{
            fontFamily: BODY, fontSize: 13, lineHeight: 1.6, color: C.text2,
            background: C.bg, borderRadius: 8, padding: '12px 14px',
            border: `1px solid ${C.border}`, whiteSpace: 'pre-line',
          }}>
            {f.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Toast ──
function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      background: C.gold, color: C.bg, fontFamily: BODY, fontSize: 13, fontWeight: 600,
      padding: '10px 24px', borderRadius: 24, opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(.16,1,.3,1)', zIndex: 9999,
      boxShadow: '0 8px 32px rgba(212,175,55,0.3)',
    }}>
      ✓ {message}
    </div>
  );
}

// ── Main Page ──
export default function Ads() {
  const [toast, setToast] = useState({ message: '', visible: false });
  const [downloadingAll, setDownloadingAll] = useState(false);

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  }, []);

  const handleCopyAll = useCallback(() => {
    const all = ADS.map(ad =>
      `═══ ${ad.headline.split('\n').join(' ')} ═══\n\nPrimary Text:\n${ad.fb.primary}\n\nHeadline: ${ad.fb.headline}\nDescription: ${ad.fb.description}\nCTA: ${ad.fb.ctaButton}`
    ).join('\n\n\n');
    navigator.clipboard.writeText(all).then(() => showToast('All ad copy copied'));
  }, [showToast]);

  const handleDownloadAll = useCallback(async () => {
    setDownloadingAll(true);
    for (const ad of ADS) {
      for (const platform of ['instagram', 'facebook']) {
        const canvas = await renderAdToCanvas(ad, platform);
        const link = document.createElement('a');
        link.download = `museumOS-${ad.id}-${platform}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise(r => setTimeout(r, 300));
      }
    }
    setDownloadingAll(false);
    showToast('All ads downloaded');
  }, [showToast]);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .ads-page * { box-sizing: border-box; }
        .ads-page ::-webkit-scrollbar { width: 6px; }
        .ads-page ::-webkit-scrollbar-track { background: transparent; }
        .ads-page ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

        @keyframes adsFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes adsShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes adsPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .ad-card-enter { animation: adsFadeUp 0.5s cubic-bezier(.16,1,.3,1) both; }

        .ads-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 1400px) { .ads-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .ads-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .ads-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; } }

        .copy-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) { .copy-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="ads-page" style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px 80px' }}>
        {/* Header */}
        <header style={{
          padding: '60px 0 48px', borderBottom: `1px solid ${C.border}`, marginBottom: 48,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: C.gold,
              boxShadow: '0 0 12px rgba(212,175,55,0.5)',
              animation: 'adsPulse 3s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
              color: C.gold,
            }}>
              Internal Tool
            </span>
          </div>

          <h1 style={{
            fontFamily: FONT, fontSize: 52, fontWeight: 700, margin: '0 0 12px',
            color: C.text, lineHeight: 1.1,
          }}>
            <span style={{ color: C.gold }}>MuseumOS</span> Ad Studio
          </h1>
          <p style={{
            fontFamily: BODY, fontSize: 17, color: C.text2, margin: 0, maxWidth: 520,
          }}>
            Pre-built ad creatives for Facebook and Instagram. Download PNGs, copy ad text, ship campaigns.
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
            {[
              { n: ADS.length, l: 'Ad variations' },
              { n: ADS.length * 2, l: 'Downloadable PNGs' },
              { n: '2', l: 'Platforms' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.text }}>{s.n}</span>
                <span style={{ fontFamily: BODY, fontSize: 12, color: C.muted, letterSpacing: 0.3 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Section: Ad Creatives */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.gold, marginBottom: 6 }}>
                Ad Creatives
              </div>
              <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, color: C.text, margin: 0 }}>
                Campaign Library
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCopyAll} style={{
                padding: '10px 20px', border: `1px solid ${C.border}`, borderRadius: 8,
                background: 'transparent', cursor: 'pointer',
                fontFamily: BODY, fontSize: 12, fontWeight: 500, color: C.text2,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}
              >
                Copy All Text
              </button>
              <button onClick={handleDownloadAll} disabled={downloadingAll} style={{
                padding: '10px 20px', border: 'none', borderRadius: 8,
                background: C.gold, cursor: downloadingAll ? 'wait' : 'pointer',
                fontFamily: BODY, fontSize: 12, fontWeight: 600, color: C.bg,
                opacity: downloadingAll ? 0.6 : 1, transition: 'all 0.2s ease',
              }}>
                {downloadingAll ? 'Downloading...' : `↓ Download All (${ADS.length * 2} PNGs)`}
              </button>
            </div>
          </div>

          <div className="ads-grid">
            {ADS.map((ad, i) => (
              <div key={ad.id} className="ad-card-enter" style={{ animationDelay: `${i * 80}ms` }}>
                <AdCard ad={ad} onCopy={(title) => showToast(`Copied: ${title}`)} />
              </div>
            ))}
          </div>
        </section>

        {/* Section: Ad Copy */}
        <section style={{ marginTop: 80 }}>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 48, marginBottom: 32 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.gold, marginBottom: 6 }}>
              Ready to Paste
            </div>
            <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, color: C.text, margin: 0 }}>
              Facebook Ad Copy
            </h2>
            <p style={{ fontFamily: BODY, fontSize: 14, color: C.text2, marginTop: 8 }}>
              Primary text, headline, description, and CTA for each ad — click to copy individual fields.
            </p>
          </div>

          <div className="copy-grid">
            {ADS.map(ad => (
              <CopyPanel key={ad.id} ad={ad} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: 80, paddingTop: 32, borderTop: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: BODY, fontSize: 12, color: C.muted }}>
            MuseumOS Ad Studio — Internal use only
          </span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, letterSpacing: 1 }}>
            {ADS.length} ADS · {ADS.length * 2} PNGS · 2 PLATFORMS
          </span>
        </footer>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
