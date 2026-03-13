export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg:      #04040c;
  --bg2:     #09091f;
  --bg3:     #12122a;
  --gold:    #c9a94a;
  --gold-d:  #a08530;
  --gold-l:  #e0c060;
  --text:    #f0ede6;
  --muted:   #6b6880;
  --border:  rgba(201,169,74,0.14);
  --border2: rgba(255,255,255,0.06);
  --card:    rgba(13,13,34,0.7);
  --r:       3px;
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', -apple-system, sans-serif;
  font-weight: 300;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Grain overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 999;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

#root { min-height: 100vh; }

/* ── TYPOGRAPHY ── */
.serif    { font-family: 'Playfair Display', serif; }
.mono     { font-family: 'JetBrains Mono', monospace; }
.label    { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); }

/* ── NAV ── */
.nav {
  position: sticky; top: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 68px;
  background: rgba(4,4,12,0.82);
  backdrop-filter: blur(28px) saturate(1.6);
  border-bottom: 1px solid var(--border);
}
.nav-brand { display: flex; align-items: center; gap: 14px; cursor: pointer; }
.nav-mark {
  width: 40px; height: 40px; border-radius: 50%;
  background: conic-gradient(from 180deg, #c9a94a, #7a6025, #c9a94a);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif; font-size: 15px; color: #04040c; font-weight: 700;
  box-shadow: 0 0 22px rgba(201,169,74,0.3);
  flex-shrink: 0;
}
.nav-name { font-family: 'Playfair Display', serif; font-size: 16px; line-height: 1.2; }
.nav-name small { display: block; font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.22em; color: var(--gold); margin-bottom: 3px; }
.nav-links { display: flex; gap: 32px; }
.nav-links a, .nav-links button {
  background: none; border: none; padding: 0;
  font: 500 13px 'DM Sans'; color: var(--muted); cursor: pointer;
  text-decoration: none; transition: color .25s;
  position: relative;
}
.nav-links a:hover, .nav-links button:hover { color: var(--text); }
.nav-links a.active { color: var(--text); }
.nav-links a.active::after {
  content: ''; position: absolute; bottom: -26px; left: 0; right: 0;
  height: 1px; background: var(--gold);
}
.nav-right { display: flex; align-items: center; gap: 20px; }
.nav-cart {
  position: relative; background: none; border: none; cursor: pointer;
  color: var(--muted); transition: color .25s; padding: 4px;
}
.nav-cart:hover { color: var(--gold); }
.nav-cart-count {
  position: absolute; top: -5px; right: -7px;
  background: var(--gold); color: #04040c;
  font: 700 9px 'DM Sans'; width: 17px; height: 17px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.nav-btn {
  font: 500 12px 'DM Sans'; letter-spacing: 0.04em;
  padding: 9px 22px; border-radius: 100px;
  border: 1px solid var(--gold); color: var(--gold);
  background: transparent; cursor: pointer; transition: all .3s;
}
.nav-btn:hover { background: var(--gold); color: #04040c; }
.nav-ham { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 4px; }
.nav-ham span { display: block; width: 22px; height: 1px; background: var(--text); transition: all .3s; }
.nav-ham.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.nav-ham.open span:nth-child(2) { opacity: 0; }
.nav-ham.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* Mobile menu */
.mob-menu {
  display: none; position: fixed; inset: 0; z-index: 190;
  background: rgba(4,4,12,0.97); flex-direction: column;
  align-items: center; justify-content: center; gap: 36px;
}
.mob-menu.open { display: flex; }
.mob-menu a, .mob-menu button {
  font: 400 32px/1 'Playfair Display', serif; font-style: italic;
  color: var(--text); text-decoration: none; background: none; border: none;
  cursor: pointer; transition: color .25s;
}
.mob-menu a:hover, .mob-menu button:hover { color: var(--gold); }

/* ── HERO ── */
.hero {
  position: relative; min-height: 100svh;
  display: flex; flex-direction: column; align-items: flex-start;
  justify-content: flex-end; padding: 0 64px 80px;
  overflow: hidden;
}
.hero-vid {
  position: absolute; inset: 0; z-index: 0;
  background: radial-gradient(ellipse at 50% 100%, #1a1440 0%, #04040c 70%);
}
.hero-vid video {
  width: 100%; height: 100%; object-fit: cover;
  opacity: 0.45;
}
.hero-vid::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(4,4,12,1) 0%, rgba(4,4,12,0.5) 40%, rgba(4,4,12,0.1) 100%);
}
/* Stars fallback when no video */
.hero-stars {
  position: absolute; inset: 0; z-index: 0;
  overflow: hidden;
}
.hero-content { position: relative; z-index: 2; max-width: 720px; }
.hero-label { margin-bottom: 24px; }
.hero-h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(56px, 8vw, 104px); line-height: 0.95;
  font-weight: 400; margin-bottom: 28px; letter-spacing: -0.02em;
}
.hero-h1 em { font-style: italic; color: var(--gold); }
.hero-sub {
  font-size: 16px; line-height: 1.8; color: var(--muted);
  max-width: 480px; margin-bottom: 40px; font-weight: 300;
}
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
.btn-primary {
  font: 500 13px 'DM Sans'; letter-spacing: 0.06em;
  padding: 14px 36px; border-radius: 100px;
  background: var(--gold); color: #04040c; border: none;
  cursor: pointer; transition: all .35s;
}
.btn-primary:hover { background: var(--gold-l); box-shadow: 0 8px 32px rgba(201,169,74,0.3); }
.btn-ghost {
  font: 500 13px 'DM Sans'; letter-spacing: 0.06em;
  padding: 14px 36px; border-radius: 100px;
  background: transparent; color: var(--text);
  border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all .35s;
}
.btn-ghost:hover { border-color: rgba(255,255,255,0.5); }
.hero-scroll {
  position: absolute; bottom: 32px; right: 64px; z-index: 2;
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.18em;
  color: var(--muted); text-transform: uppercase;
}
.hero-scroll-line {
  width: 48px; height: 1px; background: var(--gold); opacity: 0.4;
}

/* ── MARQUEE ── */
.marquee-wrap {
  overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 18px 0; background: var(--bg2);
}
.marquee-track {
  display: flex; gap: 0; white-space: nowrap;
  animation: marquee 28s linear infinite;
}
.marquee-track:hover { animation-play-state: paused; }
.marquee-item {
  display: inline-flex; align-items: center; gap: 32px;
  padding: 0 32px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--muted);
}
.marquee-dot { color: var(--gold); font-size: 16px; }
@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }

/* ── SECTION ── */
.section { padding: 100px 64px; }
.section-sm { padding: 60px 64px; }
.section-header { margin-bottom: 56px; }
.section-label { margin-bottom: 16px; }
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(36px, 4vw, 56px); line-height: 1.05;
  font-weight: 400; letter-spacing: -0.02em;
}
.section-title em { font-style: italic; color: var(--gold); }

/* ── PRODUCT GRID ── */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  border-left: 1px solid var(--border);
  border-top: 1px solid var(--border);
}
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }

/* ── PRODUCT CARD ── */
.pc {
  background: transparent;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  cursor: pointer; position: relative;
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1);
}
.pc.vis { opacity: 1; transform: translateY(0); }
.pc::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0;
  height: 2px; background: var(--gold);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.4s cubic-bezier(.16,1,.3,1); z-index: 5;
}
.pc:hover::before { transform: scaleX(1); }
.pc-img {
  position: relative; aspect-ratio: 1; overflow: hidden;
  background: var(--bg3);
}
.pc-img img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s cubic-bezier(.16,1,.3,1), filter 0.4s;
}
.pc:hover .pc-img img { transform: scale(1.06); filter: brightness(0.8); }
.pc-qa {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
  padding: 13px 20px; background: var(--gold); color: #04040c;
  font: 600 10px 'JetBrains Mono'; letter-spacing: 0.15em; text-transform: uppercase;
  transform: translateY(100%); transition: transform 0.32s cubic-bezier(.16,1,.3,1);
  text-align: center; cursor: pointer; border: none;
}
.pc:hover .pc-qa { transform: none; }
.pc-badge {
  position: absolute; top: 14px; left: 14px; z-index: 4;
  font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--gold);
  padding: 4px 10px; border: 1px solid rgba(201,169,74,0.4);
  background: rgba(4,4,12,0.8);
}
.pc-info { padding: 18px 20px 20px; }
.pc-name {
  font-family: 'Playfair Display', serif; font-size: 15px; line-height: 1.3;
  color: var(--text); margin-bottom: 6px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.pc-cat { font-size: 11px; color: var(--muted); margin-bottom: 14px; letter-spacing: 0.04em; }
.pc-bottom { display: flex; align-items: center; justify-content: space-between; }
.pc-price { font: 600 16px 'DM Sans'; color: var(--gold); }
.pc-orig { font-size: 12px; color: var(--muted); text-decoration: line-through; margin-left: 6px; }

/* ── CATEGORY TABS ── */
.cat-tabs {
  display: flex; gap: 0; overflow-x: auto; scrollbar-width: none;
  border-bottom: 1px solid var(--border); padding: 0 64px;
  position: sticky; top: 68px; z-index: 100;
  background: rgba(4,4,12,0.9); backdrop-filter: blur(20px);
}
.cat-tabs::-webkit-scrollbar { display: none; }
.cat-tab {
  background: none; border: none; cursor: pointer;
  padding: 18px 24px; font: 500 12px 'DM Sans'; letter-spacing: 0.06em;
  color: var(--muted); border-bottom: 2px solid transparent;
  transition: all .25s; white-space: nowrap; margin-bottom: -1px;
}
.cat-tab:hover { color: var(--text); }
.cat-tab.active { color: var(--text); border-bottom-color: var(--gold); }
.cat-count { font-size: 10px; color: var(--gold); margin-left: 6px; }

/* ── SHOP PAGE ── */
.shop-hero {
  padding: 80px 64px 48px;
  border-bottom: 1px solid var(--border);
}
.shop-meta {
  display: flex; align-items: baseline; gap: 20px; margin-top: 16px;
}
.shop-count { font: 300 14px 'DM Sans'; color: var(--muted); }

/* ── PRODUCT DETAIL ── */
.pd { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
.pd-gallery { position: sticky; top: 68px; height: calc(100vh - 68px); overflow: hidden; }
.pd-main-img { width: 100%; height: 75%; object-fit: cover; display: block; }
.pd-thumbs { display: flex; gap: 2px; height: 25%; }
.pd-thumb {
  flex: 1; overflow: hidden; cursor: pointer; opacity: 0.5; transition: opacity .25s;
  border: none; background: var(--bg3); padding: 0;
}
.pd-thumb:hover, .pd-thumb.active { opacity: 1; }
.pd-thumb img { width: 100%; height: 100%; object-fit: cover; }
.pd-info { padding: 64px 56px; overflow-y: auto; }
.pd-breadcrumb {
  display: flex; gap: 8px; align-items: center;
  font: 400 12px 'JetBrains Mono'; letter-spacing: 0.1em; color: var(--muted);
  margin-bottom: 32px;
}
.pd-breadcrumb span { color: var(--border2); }
.pd-breadcrumb a { color: var(--muted); text-decoration: none; cursor: pointer; transition: color .2s; }
.pd-breadcrumb a:hover { color: var(--gold); }
.pd-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 3vw, 42px); line-height: 1.15;
  font-weight: 400; margin-bottom: 12px;
}
.pd-price { font: 600 28px 'DM Sans'; color: var(--gold); margin-bottom: 32px; }
.pd-divider { height: 1px; background: var(--border); margin-bottom: 32px; }
.pd-label-sm { font: 500 10px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
.pd-desc { font: 300 14px/1.85 'DM Sans'; color: var(--muted); margin-bottom: 32px; }
.pd-options { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
.pd-opt {
  padding: 9px 18px; border: 1px solid var(--border2); border-radius: var(--r);
  font: 500 12px 'DM Sans'; color: var(--muted); cursor: pointer;
  background: none; transition: all .2s;
}
.pd-opt:hover { border-color: var(--gold); color: var(--text); }
.pd-opt.sel { border-color: var(--gold); color: var(--gold); background: rgba(201,169,74,0.08); }
.pd-add {
  width: 100%; padding: 18px;
  background: var(--gold); color: #04040c;
  font: 600 12px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  border: none; border-radius: var(--r); cursor: pointer; transition: all .35s;
  margin-bottom: 16px;
}
.pd-add:hover { background: var(--gold-l); box-shadow: 0 8px 32px rgba(201,169,74,0.3); }
.pd-fave {
  width: 100%; padding: 16px;
  background: transparent; color: var(--muted);
  font: 500 12px 'DM Sans'; letter-spacing: 0.06em;
  border: 1px solid var(--border2); border-radius: var(--r); cursor: pointer; transition: all .25s;
}
.pd-fave:hover { color: var(--text); border-color: var(--border); }
.pd-trust { display: flex; gap: 24px; margin-top: 32px; padding-top: 32px; border-top: 1px solid var(--border); }
.pd-trust-item { display: flex; align-items: center; gap: 10px; font: 400 12px 'DM Sans'; color: var(--muted); }

/* ── CART ── */
.cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 0; min-height: calc(100vh - 68px); }
.cart-items { padding: 64px; border-right: 1px solid var(--border); }
.cart-title { font-family: 'Playfair Display', serif; font-size: 42px; margin-bottom: 48px; font-weight: 400; }
.cart-item {
  display: grid; grid-template-columns: 100px 1fr auto;
  gap: 24px; padding: 28px 0; border-bottom: 1px solid var(--border);
  align-items: start;
}
.cart-item-img { aspect-ratio: 1; overflow: hidden; border-radius: var(--r); background: var(--bg3); }
.cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
.cart-item-name { font-family: 'Playfair Display', serif; font-size: 16px; margin-bottom: 6px; }
.cart-item-variant { font: 400 12px 'DM Sans'; color: var(--muted); margin-bottom: 14px; }
.cart-item-qty { display: flex; align-items: center; gap: 14px; }
.cart-qty-btn {
  width: 28px; height: 28px; background: var(--bg3); border: 1px solid var(--border2);
  color: var(--text); font-size: 16px; cursor: pointer; border-radius: var(--r); transition: all .2s;
}
.cart-qty-btn:hover { border-color: var(--gold); color: var(--gold); }
.cart-qty-n { font: 500 14px 'DM Sans'; min-width: 20px; text-align: center; }
.cart-item-price { font: 600 16px 'DM Sans'; color: var(--gold); }
.cart-item-remove { font: 400 11px 'DM Sans'; color: var(--muted); background: none; border: none; cursor: pointer; margin-top: 8px; }
.cart-item-remove:hover { color: var(--text); }
.cart-right { padding: 64px 48px; background: var(--bg2); }
.cart-summary-title { font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 32px; }
.cart-line { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); font: 300 14px 'DM Sans'; }
.cart-line strong { font-weight: 600; color: var(--text); }
.cart-total { display: flex; justify-content: space-between; padding: 20px 0; font: 600 18px 'DM Sans'; margin-bottom: 32px; }
.cart-total .price { color: var(--gold); }
.cart-checkout {
  width: 100%; padding: 18px;
  background: var(--gold); color: #04040c;
  font: 600 12px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  border: none; border-radius: var(--r); cursor: pointer; transition: all .35s; margin-bottom: 12px;
}
.cart-checkout:hover { background: var(--gold-l); box-shadow: 0 8px 32px rgba(201,169,74,0.3); }
.cart-continue {
  width: 100%; padding: 14px; background: transparent;
  color: var(--muted); font: 500 12px 'DM Sans';
  border: none; cursor: pointer; transition: color .2s;
}
.cart-continue:hover { color: var(--text); }
.cart-empty {
  text-align: center; padding: 120px 64px;
  font-family: 'Playfair Display', serif; font-size: 28px; font-style: italic;
}
.cart-empty p { font: 300 16px 'DM Sans'; color: var(--muted); margin-top: 16px; }

/* ── MEMBERSHIP ── */
.mem-hero {
  padding: 120px 64px 100px;
  background: radial-gradient(ellipse at 50% 0%, rgba(201,169,74,0.08) 0%, transparent 70%);
  text-align: center;
}
.mem-hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(48px,6vw,80px); font-weight: 400; margin-bottom: 20px; }
.mem-hero p { font: 300 18px/1.8 'DM Sans'; color: var(--muted); max-width: 520px; margin: 0 auto; }
.mem-tiers { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; padding: 0 64px 100px; }
.mem-tier {
  padding: 48px 40px; border: 1px solid var(--border);
  position: relative; transition: border-color .3s;
}
.mem-tier:not(:first-child) { border-left: none; }
.mem-tier:hover { border-color: var(--gold); }
.mem-tier.featured {
  background: rgba(201,169,74,0.04);
  border-color: rgba(201,169,74,0.5);
}
.mem-tier.featured:hover { border-color: var(--gold); }
.mem-tier-badge {
  position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  background: var(--gold); color: #04040c;
  font: 600 9px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  padding: 5px 16px;
}
.mem-tier-name {
  font-family: 'Playfair Display', serif; font-size: 28px; font-style: italic;
  margin-bottom: 8px; color: var(--text);
}
.mem-tier-price { font: 600 42px 'DM Sans'; color: var(--gold); margin-bottom: 4px; }
.mem-tier-period { font: 400 13px 'DM Sans'; color: var(--muted); margin-bottom: 32px; }
.mem-tier-divider { height: 1px; background: var(--border); margin-bottom: 28px; }
.mem-benefit {
  display: flex; align-items: flex-start; gap: 12px;
  font: 300 14px/1.6 'DM Sans'; color: var(--muted); margin-bottom: 14px;
}
.mem-benefit-icon { color: var(--gold); font-size: 14px; flex-shrink: 0; margin-top: 2px; }
.mem-btn {
  width: 100%; margin-top: 36px; padding: 14px;
  font: 600 11px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  border-radius: var(--r); cursor: pointer; transition: all .3s;
}
.mem-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); }
.mem-btn-ghost:hover { border-color: var(--gold); color: var(--gold); }
.mem-btn-gold { background: var(--gold); border: 1px solid var(--gold); color: #04040c; }
.mem-btn-gold:hover { background: var(--gold-l); box-shadow: 0 8px 32px rgba(201,169,74,0.3); }
.mem-perks { padding: 80px 64px; background: var(--bg2); }
.mem-perks-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 0; margin-top: 56px; }
.mem-perk { padding: 40px 32px; border-left: 1px solid var(--border); }
.mem-perk-icon { font-size: 32px; margin-bottom: 20px; }
.mem-perk-title { font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 10px; }
.mem-perk-desc { font: 300 13px/1.75 'DM Sans'; color: var(--muted); }

/* ── MISSION BAND ── */
.mission {
  padding: 100px 64px;
  background: radial-gradient(ellipse at 50% 50%, rgba(201,169,74,0.06) 0%, transparent 60%);
  text-align: center;
  border-top: 1px solid var(--border);
}
.mission-quote {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 4vw, 52px); font-style: italic;
  line-height: 1.25; max-width: 900px; margin: 0 auto 32px;
  color: var(--text);
}
.mission-quote em { color: var(--gold); }
.mission-attr { font: 400 11px 'JetBrains Mono'; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }

/* ── FOOTER ── */
.footer {
  padding: 64px; border-top: 1px solid var(--border);
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 48px; background: var(--bg2);
}
.footer-brand-name {
  font-family: 'Playfair Display', serif; font-size: 32px; font-style: italic;
  opacity: 0.35; margin-bottom: 16px;
}
.footer-tagline { font: 300 13px/1.75 'DM Sans'; color: var(--muted); max-width: 260px; }
.footer-col-title { font: 500 10px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 20px; }
.footer-links { display: flex; flex-direction: column; gap: 12px; }
.footer-links a, .footer-links button {
  font: 300 13px 'DM Sans'; color: var(--muted); text-decoration: none;
  background: none; border: none; cursor: pointer; text-align: left; transition: color .2s;
}
.footer-links a:hover, .footer-links button:hover { color: var(--text); }
.footer-bottom {
  padding: 24px 64px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}
.footer-copy { font: 400 11px 'JetBrains Mono'; letter-spacing: 0.1em; color: var(--muted); }
.footer-star { color: var(--gold); font-size: 20px; }

/* ── STARS CANVAS ── */
.stars-canvas { position: absolute; inset: 0; display: block; }

/* ── REVEAL ANIMATIONS ── */
.reveal { opacity: 0; transform: translateY(32px); transition: opacity .7s, transform .7s cubic-bezier(.16,1,.3,1); }
.reveal.vis { opacity: 1; transform: none; }

/* ── UTILITIES ── */
.max-w { max-width: 1320px; margin: 0 auto; }
.gold { color: var(--gold); }
.italic { font-style: italic; }
.text-muted { color: var(--muted); }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(3,1fr); }
  .mem-tiers { grid-template-columns: 1fr 1fr; }
  .mem-perks-grid { grid-template-columns: repeat(2,1fr); }
  .pd { grid-template-columns: 1fr; }
  .pd-gallery { position: relative; height: 60vw; top: 0; }
  .cart-layout { grid-template-columns: 1fr; }
  .cart-right { border-top: 1px solid var(--border); }
  .footer { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 1100px) {
  .cat-cards-5 { grid-template-columns: repeat(3, 1fr) !important; }
}
@media (max-width: 860px) {
  .nav { padding: 0 24px; }
  .nav-links, .nav-btn { display: none; }
  .nav-ham { display: flex; }
  .section, .section-sm { padding: 64px 24px; }
  .shop-hero { padding: 48px 24px 32px; }
  .cat-tabs { padding: 0 24px; }
  .hero { padding: 0 24px 64px; }
  .hero-scroll { display: none; }
  .grid-4 { grid-template-columns: repeat(2,1fr); }
  .grid-3 { grid-template-columns: repeat(2,1fr); }
  .mem-tiers { grid-template-columns: 1fr; padding: 0 24px 60px; }
  .mem-tier:not(:first-child) { border-left: 1px solid var(--border); border-top: none; }
  .mem-perks { padding: 60px 24px; }
  .mem-perks-grid { grid-template-columns: repeat(2,1fr); }
  .mem-hero { padding: 80px 24px 60px; }
  .cart-items { padding: 40px 24px; }
  .cart-right { padding: 40px 24px; }
  .pd-info { padding: 40px 24px; }
  .footer { grid-template-columns: 1fr; padding: 48px 24px; }
  .footer-bottom { padding: 20px 24px; flex-direction: column; gap: 12px; text-align: center; }
  .mission { padding: 64px 24px; }
}
@media (max-width: 560px) {
  .grid { grid-template-columns: repeat(2,1fr); }
  .mem-perks-grid { grid-template-columns: 1fr; }
  .cart-item { grid-template-columns: 80px 1fr; }
  .cart-item-price { grid-column: 2; }
}
`;
