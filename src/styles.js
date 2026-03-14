export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: #04040c;
  --surface: #0a0a1a;
  --surface2: #0f0f1e;
  --border: #16162a;
  --border-hover: #252548;
  --gold: #D4AF37;
  --gold-hover: #E5C76B;
  --gold-dim: #a08520;
  --gold-glow: rgba(212,175,55,0.25);
  --text: #F0EDE6;
  --text2: #908D9A;
  --muted: #5C5870;
  --success: #4ADE80;
  --warning: #FBBF24;
  --r: 3px;
  --ease: cubic-bezier(.16,1,.3,1);
  --ease-out: cubic-bezier(.23,1,.32,1);
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
  -moz-osx-font-smoothing: grayscale;
}

/* Grain overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

#root { min-height: 100vh; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--gold); }

/* ═══ TYPOGRAPHY ═══ */
.serif { font-family: 'Playfair Display', serif; }
.mono { font-family: 'JetBrains Mono', monospace; }
.label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
}

/* ═══ BUTTONS ═══ */
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  font: 500 13px 'DM Sans'; letter-spacing: 0.06em;
  padding: 15px 38px; border-radius: 100px;
  background: var(--gold); color: var(--bg); border: none;
  cursor: pointer; transition: all 0.35s var(--ease);
  text-decoration: none;
}
.btn-primary:hover {
  background: var(--gold-hover);
  box-shadow: 0 8px 32px var(--gold-glow);
  transform: translateY(-1px);
}

.btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  font: 500 13px 'DM Sans'; letter-spacing: 0.06em;
  padding: 15px 38px; border-radius: 100px;
  background: transparent; color: var(--text);
  border: 1px solid rgba(255,255,255,0.15); cursor: pointer;
  transition: all 0.35s var(--ease); text-decoration: none;
}
.btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

.btn-outline {
  display: inline-flex; align-items: center; justify-content: center;
  font: 500 12px 'DM Sans'; letter-spacing: 0.06em;
  padding: 11px 28px; border-radius: 100px;
  background: transparent; color: var(--gold);
  border: 1px solid var(--gold); cursor: pointer;
  transition: all 0.3s var(--ease);
}
.btn-outline:hover { background: var(--gold); color: var(--bg); }

/* ═══ NAVIGATION ═══ */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 72px;
  background: transparent;
  transition: background 0.5s, border-color 0.5s, backdrop-filter 0.5s;
  border-bottom: 1px solid transparent;
}
.nav.scrolled {
  background: rgba(4,4,12,0.92);
  backdrop-filter: blur(28px) saturate(1.6);
  border-bottom-color: var(--border);
}
.nav-brand {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; text-decoration: none;
}
.nav-logo-star {
  color: var(--gold); font-size: 18px;
  filter: drop-shadow(0 0 8px var(--gold-glow));
}
.nav-logo-text {
  font: 500 12px 'JetBrains Mono'; letter-spacing: 0.15em; color: var(--text);
}
.nav-center {
  position: absolute; left: 50%; transform: translateX(-50%);
  display: flex; gap: 32px;
}
.nav-center a {
  font: 500 11px 'DM Sans'; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text2); text-decoration: none; cursor: pointer;
  transition: color 0.25s; position: relative; padding: 4px 0;
}
.nav-center a:hover { color: var(--text); }
.nav-center a.active { color: var(--text); }
.nav-center a.active::after {
  content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
  height: 2px; background: var(--gold);
  box-shadow: 0 0 8px var(--gold-glow);
}
.nav-right { display: flex; align-items: center; gap: 20px; }
.nav-cart {
  position: relative; background: none; border: none; cursor: pointer;
  color: var(--text2); transition: color 0.25s; padding: 4px;
}
.nav-cart:hover { color: var(--gold); }
.nav-cart-count {
  position: absolute; top: -5px; right: -7px;
  background: var(--gold); color: var(--bg);
  font: 700 9px 'DM Sans'; width: 17px; height: 17px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.nav-join {
  font: 500 11px 'DM Sans'; letter-spacing: 0.08em;
  padding: 9px 22px; border-radius: 100px;
  border: 1px solid var(--gold); color: var(--gold);
  background: transparent; cursor: pointer; transition: all 0.3s;
}
.nav-join:hover { background: var(--gold); color: var(--bg); }
.nav-ham {
  display: none; flex-direction: column; gap: 5px; cursor: pointer;
  background: none; border: none; padding: 4px;
}
.nav-ham span {
  display: block; width: 22px; height: 1px;
  background: var(--text); transition: all 0.3s;
}
.nav-ham.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.nav-ham.open span:nth-child(2) { opacity: 0; }
.nav-ham.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* Mobile overlay */
.mob-menu {
  display: none; position: fixed; inset: 0; z-index: 190;
  background: rgba(4,4,12,0.97);
  flex-direction: column; align-items: center; justify-content: center; gap: 32px;
}
.mob-menu.open { display: flex; }
.mob-menu a, .mob-menu button {
  font: 400 28px 'Playfair Display', serif; font-style: italic;
  color: var(--text); text-decoration: none; background: none;
  border: none; cursor: pointer; transition: color 0.25s;
}
.mob-menu a:hover, .mob-menu button:hover { color: var(--gold); }

/* ═══ HERO ═══ */
.hero {
  position: relative; min-height: 100svh;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 0 24px;
  text-align: center; overflow: hidden;
}
.hero-gradient {
  position: absolute; inset: -30%; width: 160%; height: 160%;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(26,16,64,0.6) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(18,13,48,0.45) 0%, transparent 40%),
    rgba(4,4,12,0.4);
  animation: heroShift 25s ease-in-out infinite alternate;
  z-index: 0;
}
@keyframes heroShift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(8%, -6%) scale(1.05); }
}
.hero-content { position: relative; z-index: 2; max-width: 800px; }
.hero-label { margin-bottom: 28px; }
.hero-h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(32px, 5vw, 56px); line-height: 1.15;
  font-weight: 400; margin-bottom: 24px; letter-spacing: -0.01em;
}
.hero-h1 em { font-style: italic; color: var(--gold); }
.hero-sub {
  font: 300 18px/1.6 'DM Sans'; color: var(--text2);
  letter-spacing: 0.04em; margin-bottom: 44px;
}
.hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.hero-scroll {
  position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
  z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.hero-scroll-text {
  font: 400 10px 'JetBrains Mono'; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--muted);
}
.hero-scroll-line {
  width: 1px; height: 40px;
  background: linear-gradient(to bottom, var(--gold), transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}
@keyframes scrollPulse {
  0%, 100% { opacity: 0.4; transform: scaleY(1); }
  50% { opacity: 1; transform: scaleY(1.2); }
}

/* ═══ MARQUEE ═══ */
.marquee-wrap {
  overflow: hidden;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 18px 0; background: var(--surface);
}
.marquee-track {
  display: flex; gap: 0; white-space: nowrap;
  animation: marquee 30s linear infinite;
}
.marquee-track:hover { animation-play-state: paused; }
.marquee-item {
  display: inline-flex; align-items: center; gap: 32px; padding: 0 32px;
  font: 400 10px 'JetBrains Mono'; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--muted);
}
.marquee-dot { color: var(--gold); font-size: 14px; }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* ═══ SECTIONS ═══ */
.section { padding: 120px 64px; }
.section-sm { padding: 80px 64px; }
.section-header { margin-bottom: 64px; }
.section-label { margin-bottom: 16px; }
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(36px, 4vw, 56px); line-height: 1.08;
  font-weight: 400; letter-spacing: -0.02em;
}
.section-title em { font-style: italic; color: var(--gold); }
.section-subtitle {
  font: 300 16px/1.8 'DM Sans'; color: var(--text2);
  max-width: 520px; margin-top: 20px;
}

/* ═══ PRODUCT GRID ═══ */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  border-left: 1px solid var(--border);
  border-top: 1px solid var(--border);
}
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }

/* ═══ PRODUCT CARD ═══ */
.pc {
  background: transparent;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  cursor: pointer; position: relative;
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
}
.pc.vis { opacity: 1; transform: translateY(0); }
.pc::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0;
  height: 2px; background: var(--gold);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.4s var(--ease); z-index: 5;
}
.pc:hover::before { transform: scaleX(1); }
.pc-img {
  position: relative; aspect-ratio: 1; overflow: hidden;
  background: var(--surface);
}
.pc-img img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s var(--ease), filter 0.4s;
}
.pc:hover .pc-img img { transform: scale(1.06); filter: brightness(0.85); }
.pc-qa {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
  padding: 14px 20px; background: var(--gold); color: var(--bg);
  font: 600 10px 'JetBrains Mono'; letter-spacing: 0.15em; text-transform: uppercase;
  transform: translateY(100%); transition: transform 0.32s var(--ease);
  text-align: center; cursor: pointer; border: none; width: 100%;
}
.pc:hover .pc-qa { transform: none; }
.pc-badge {
  position: absolute; top: 14px; left: 14px; z-index: 4;
  font: 500 9px 'JetBrains Mono'; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--gold);
  padding: 4px 10px; border: 1px solid rgba(212,175,55,0.4);
  background: rgba(4,4,12,0.8);
}
.pc-info { padding: 18px 20px 22px; }
.pc-name {
  font-family: 'Playfair Display', serif; font-size: 15px; line-height: 1.3;
  color: var(--text); margin-bottom: 6px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.pc-cat { font-size: 11px; color: var(--text2); margin-bottom: 14px; letter-spacing: 0.04em; }
.pc-bottom { display: flex; align-items: center; justify-content: space-between; }
.pc-price { font: 600 16px 'DM Sans'; color: var(--gold); }

/* ═══ CATEGORY TABS ═══ */
.cat-tabs {
  display: flex; gap: 0; overflow-x: auto; scrollbar-width: none;
  border-bottom: 1px solid var(--border); padding: 0 64px;
  position: sticky; top: 72px; z-index: 100;
  background: rgba(4,4,12,0.92); backdrop-filter: blur(20px);
}
.cat-tabs::-webkit-scrollbar { display: none; }
.cat-tab {
  background: none; border: none; cursor: pointer;
  padding: 18px 24px; font: 500 12px 'DM Sans'; letter-spacing: 0.06em;
  color: var(--text2); border-bottom: 2px solid transparent;
  transition: all 0.25s; white-space: nowrap; margin-bottom: -1px;
}
.cat-tab:hover { color: var(--text); }
.cat-tab.active { color: var(--text); border-bottom-color: var(--gold); }
.cat-count { font-size: 10px; color: var(--gold); margin-left: 6px; }

/* ═══ SHOP PAGE ═══ */
.shop-hero { padding: 140px 64px 48px; border-bottom: 1px solid var(--border); }

/* ═══ PRODUCT DETAIL ═══ */
.pd { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; margin-top: 72px; }
.pd-gallery { position: sticky; top: 72px; height: calc(100vh - 72px); overflow: hidden; }
.pd-thumbs { display: flex; gap: 2px; height: 25%; }
.pd-thumb {
  flex: 1; overflow: hidden; cursor: pointer; opacity: 0.5; transition: opacity 0.25s;
  border: none; background: var(--surface); padding: 0;
}
.pd-thumb:hover, .pd-thumb.active { opacity: 1; }
.pd-thumb img { width: 100%; height: 100%; object-fit: cover; }
.pd-info { padding: 72px 56px; overflow-y: auto; }
.pd-breadcrumb {
  display: flex; gap: 8px; align-items: center;
  font: 400 11px 'JetBrains Mono'; letter-spacing: 0.1em; color: var(--text2);
  margin-bottom: 36px;
}
.pd-breadcrumb span { color: var(--muted); }
.pd-breadcrumb a { color: var(--text2); text-decoration: none; cursor: pointer; transition: color 0.2s; }
.pd-breadcrumb a:hover { color: var(--gold); }
.pd-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 3vw, 42px); line-height: 1.15;
  font-weight: 400; margin-bottom: 12px;
}
.pd-price { font: 600 28px 'DM Sans'; color: var(--gold); margin-bottom: 36px; }
.pd-divider { height: 1px; background: var(--border); margin-bottom: 36px; }
.pd-label-sm {
  font: 500 10px 'JetBrains Mono'; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--text2); margin-bottom: 12px;
}
.pd-desc { font: 300 14px/1.85 'DM Sans'; color: var(--text2); margin-bottom: 36px; }
.pd-add {
  width: 100%; padding: 18px;
  background: var(--gold); color: var(--bg);
  font: 600 12px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  border: none; border-radius: var(--r); cursor: pointer; transition: all 0.35s;
  margin-bottom: 12px;
}
.pd-add:hover { background: var(--gold-hover); box-shadow: 0 8px 32px var(--gold-glow); }
.pd-fave {
  width: 100%; padding: 16px;
  background: transparent; color: var(--text2);
  font: 500 12px 'DM Sans'; letter-spacing: 0.06em;
  border: 1px solid var(--border); border-radius: var(--r);
  cursor: pointer; transition: all 0.25s;
}
.pd-fave:hover { color: var(--text); border-color: var(--border-hover); }
.pd-trust {
  display: flex; gap: 24px; margin-top: 36px; padding-top: 36px;
  border-top: 1px solid var(--border);
}
.pd-trust-item { display: flex; align-items: center; gap: 10px; font: 400 12px 'DM Sans'; color: var(--text2); }

/* ═══ CART ═══ */
.cart-layout {
  display: grid; grid-template-columns: 1fr 380px; gap: 0;
  min-height: calc(100vh - 72px); margin-top: 72px;
}
.cart-items { padding: 72px 64px; border-right: 1px solid var(--border); }
.cart-title {
  font-family: 'Playfair Display', serif; font-size: 42px;
  margin-bottom: 48px; font-weight: 400;
}
.cart-item {
  display: grid; grid-template-columns: 100px 1fr auto;
  gap: 24px; padding: 28px 0; border-bottom: 1px solid var(--border); align-items: start;
}
.cart-item-img {
  aspect-ratio: 1; overflow: hidden; border-radius: var(--r); background: var(--surface);
}
.cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
.cart-item-name {
  font-family: 'Playfair Display', serif; font-size: 16px; margin-bottom: 6px;
  cursor: pointer; transition: color 0.2s;
}
.cart-item-name:hover { color: var(--gold); }
.cart-item-variant { font: 400 12px 'DM Sans'; color: var(--text2); margin-bottom: 14px; }
.cart-item-qty { display: flex; align-items: center; gap: 14px; }
.cart-qty-btn {
  width: 28px; height: 28px; background: var(--surface); border: 1px solid var(--border);
  color: var(--text); font-size: 16px; cursor: pointer; border-radius: var(--r);
  transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.cart-qty-btn:hover { border-color: var(--gold); color: var(--gold); }
.cart-qty-n { font: 500 14px 'DM Sans'; min-width: 20px; text-align: center; }
.cart-item-price { font: 600 16px 'DM Sans'; color: var(--gold); }
.cart-item-remove {
  font: 400 11px 'DM Sans'; color: var(--muted); background: none;
  border: none; cursor: pointer; margin-top: 8px; transition: color 0.2s;
}
.cart-item-remove:hover { color: var(--text); }
.cart-right { padding: 72px 48px; background: var(--surface); }
.cart-summary-title { font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 32px; }
.cart-line {
  display: flex; justify-content: space-between; padding: 12px 0;
  border-bottom: 1px solid var(--border); font: 300 14px 'DM Sans'; color: var(--text2);
}
.cart-total {
  display: flex; justify-content: space-between; padding: 24px 0;
  font: 600 20px 'DM Sans'; margin-bottom: 36px;
}
.cart-total .price { color: var(--gold); }
.cart-checkout {
  width: 100%; padding: 18px;
  background: var(--gold); color: var(--bg);
  font: 600 12px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  border: none; border-radius: var(--r); cursor: pointer; transition: all 0.35s; margin-bottom: 12px;
}
.cart-checkout:hover { background: var(--gold-hover); box-shadow: 0 8px 32px var(--gold-glow); }
.cart-continue {
  width: 100%; padding: 14px; background: transparent;
  color: var(--text2); font: 500 12px 'DM Sans';
  border: none; cursor: pointer; transition: color 0.2s;
}
.cart-continue:hover { color: var(--text); }
.cart-empty { text-align: center; padding: 160px 64px; }

/* ═══ MEMBERSHIP ═══ */
.mem-hero {
  padding: 160px 64px 100px; text-align: center;
  background: radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%);
}
.mem-tiers { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; padding: 0 64px 120px; }
.mem-tier {
  padding: 52px 40px; border: 1px solid var(--border);
  position: relative; transition: border-color 0.3s;
}
.mem-tier:not(:first-child) { border-left: none; }
.mem-tier:hover { border-color: var(--border-hover); }
.mem-tier.featured { background: rgba(212,175,55,0.03); border-color: rgba(212,175,55,0.3); }
.mem-tier.featured:hover { border-color: var(--gold); }
.mem-tier-badge {
  position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  background: var(--gold); color: var(--bg);
  font: 600 9px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  padding: 5px 16px;
}
.mem-tier-name {
  font-family: 'Playfair Display', serif; font-size: 28px;
  font-style: italic; margin-bottom: 8px;
}
.mem-tier-price { font: 600 44px 'DM Sans'; color: var(--gold); margin-bottom: 4px; }
.mem-tier-period { font: 400 13px 'DM Sans'; color: var(--text2); margin-bottom: 32px; }
.mem-tier-divider { height: 1px; background: var(--border); margin-bottom: 28px; }
.mem-benefit {
  display: flex; align-items: flex-start; gap: 12px;
  font: 300 14px/1.6 'DM Sans'; color: var(--text2); margin-bottom: 14px;
}
.mem-benefit-icon { color: var(--gold); font-size: 12px; flex-shrink: 0; margin-top: 4px; }
.mem-btn {
  width: 100%; margin-top: 36px; padding: 16px;
  font: 600 11px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  border-radius: var(--r); cursor: pointer; transition: all 0.3s;
}
.mem-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text2); }
.mem-btn-ghost:hover { border-color: var(--gold); color: var(--gold); }
.mem-btn-gold { background: var(--gold); border: 1px solid var(--gold); color: var(--bg); }
.mem-btn-gold:hover { background: var(--gold-hover); box-shadow: 0 8px 32px var(--gold-glow); }
.mem-perks { padding: 100px 64px; background: var(--surface); }
.mem-perks-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 0; margin-top: 56px; }
.mem-perk { padding: 40px 32px; border-left: 1px solid var(--border); }
.mem-perk:first-child { border-left: none; }
.mem-perk-icon { font-size: 28px; margin-bottom: 20px; display: block; }
.mem-perk-title { font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 10px; }
.mem-perk-desc { font: 300 13px/1.75 'DM Sans'; color: var(--text2); }

/* ═══ MISSION BAND ═══ */
.mission {
  padding: 120px 64px; text-align: center;
  background: radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.05) 0%, transparent 50%);
  border-top: 1px solid var(--border);
}
.mission-quote {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 4vw, 52px); font-style: italic;
  line-height: 1.25; max-width: 900px; margin: 0 auto 32px;
}
.mission-quote em { color: var(--gold); }
.mission-attr {
  font: 400 11px 'JetBrains Mono'; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--muted);
}

/* ═══ NEWSLETTER ═══ */
.newsletter {
  padding: 80px 64px; background: var(--surface);
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; gap: 48px;
}
.newsletter-form { display: flex; gap: 0; }
.newsletter-input {
  font: 300 14px 'DM Sans'; color: var(--text);
  background: var(--bg); border: 1px solid var(--border);
  border-right: none; padding: 14px 20px; width: 320px;
  outline: none; border-radius: var(--r) 0 0 var(--r);
  transition: border-color 0.25s;
}
.newsletter-input:focus { border-color: var(--gold); }
.newsletter-input::placeholder { color: var(--muted); }
.newsletter-btn {
  font: 600 10px 'JetBrains Mono'; letter-spacing: 0.15em; text-transform: uppercase;
  background: var(--gold); color: var(--bg); border: none;
  padding: 14px 28px; cursor: pointer; transition: all 0.3s;
  border-radius: 0 var(--r) var(--r) 0;
}
.newsletter-btn:hover { background: var(--gold-hover); }

/* ═══ FOOTER ═══ */
.footer {
  padding: 80px 64px 48px; border-top: 1px solid var(--border);
  background: var(--bg);
}
.footer-grid {
  display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 48px; margin-bottom: 64px;
}
.footer-brand-name {
  font-family: 'Playfair Display', serif; font-size: 28px;
  font-style: italic; color: var(--text); margin-bottom: 16px;
}
.footer-tagline {
  font: 300 13px/1.75 'DM Sans'; color: var(--text2);
  max-width: 280px; margin-bottom: 24px;
}
.footer-social { display: flex; gap: 12px; }
.footer-social a {
  width: 34px; height: 34px; border-radius: 50%;
  border: 1px solid var(--border); display: flex;
  align-items: center; justify-content: center;
  color: var(--text2); text-decoration: none; transition: all 0.25s;
  font: 500 10px 'DM Sans'; letter-spacing: 0.05em;
}
.footer-social a:hover { border-color: var(--gold); color: var(--gold); }
.footer-col-title {
  font: 500 10px 'JetBrains Mono'; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 24px;
}
.footer-links { display: flex; flex-direction: column; gap: 14px; }
.footer-links a, .footer-links button {
  font: 300 13px 'DM Sans'; color: var(--text2); text-decoration: none;
  background: none; border: none; cursor: pointer; text-align: left;
  transition: color 0.2s; padding: 0;
}
.footer-links a:hover, .footer-links button:hover { color: var(--text); }
.footer-bottom {
  padding-top: 32px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}
.footer-copy { font: 400 11px 'DM Sans'; color: var(--muted); }
.footer-powered {
  font: 400 10px 'JetBrains Mono'; color: var(--muted);
  letter-spacing: 0.08em; opacity: 0.5;
}

/* ═══ ABOUT PAGE ═══ */
.about-hero {
  padding: 160px 64px 120px; text-align: center;
  background: radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 50%);
}
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.about-card {
  padding: 64px 48px; border: 1px solid var(--border);
  border-top: none; transition: background 0.3s;
}
.about-card:nth-child(odd) { border-right: none; }
.about-card:first-child, .about-card:nth-child(2) { border-top: 1px solid var(--border); }
.about-card:hover { background: var(--surface); }
.about-card-icon { font-size: 36px; margin-bottom: 24px; display: block; }
.about-card-title {
  font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 12px;
}
.about-card-desc { font: 300 14px/1.8 'DM Sans'; color: var(--text2); }
.about-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.about-stat {
  padding: 56px 40px; border-right: 1px solid var(--border); text-align: center;
}
.about-stat:last-child { border-right: none; }
.about-stat-number { font: 600 48px 'DM Sans'; color: var(--gold); margin-bottom: 8px; }
.about-stat-label {
  font: 400 11px 'JetBrains Mono'; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--text2);
}

/* ═══ EVENTS PAGE ═══ */
.events-hero {
  padding: 160px 64px 80px;
  background: radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 50%);
}
.event-card {
  background: var(--surface); border: 1px solid var(--border);
  overflow: hidden; transition: border-color 0.3s, transform 0.3s; cursor: pointer;
}
.event-card:hover { border-color: var(--border-hover); transform: translateY(-4px); }
.event-card-img {
  aspect-ratio: 16/9; overflow: hidden; background: var(--surface2); position: relative;
}
.event-card-img img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s var(--ease);
}
.event-card:hover .event-card-img img { transform: scale(1.05); }
.event-card-date {
  position: absolute; top: 16px; left: 16px;
  background: var(--gold); color: var(--bg);
  padding: 8px 14px; text-align: center;
}
.event-card-date-day { font: 700 24px 'DM Sans'; line-height: 1; }
.event-card-date-month {
  font: 500 9px 'JetBrains Mono'; letter-spacing: 0.15em; text-transform: uppercase;
}
.event-card-body { padding: 28px 24px; }
.event-card-category {
  font: 500 10px 'JetBrains Mono'; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 12px;
}
.event-card-title {
  font-family: 'Playfair Display', serif; font-size: 22px;
  margin-bottom: 10px; line-height: 1.25;
}
.event-card-desc { font: 300 13px/1.7 'DM Sans'; color: var(--text2); margin-bottom: 16px; }
.event-card-meta {
  font: 400 11px 'JetBrains Mono'; color: var(--muted); letter-spacing: 0.08em;
}

/* ═══ EDUCATION PAGE ═══ */
.edu-hero {
  padding: 160px 64px 100px; text-align: center;
  background: radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 50%);
}
.edu-program {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  border-top: 1px solid var(--border);
}
.edu-program:nth-child(even) { direction: rtl; }
.edu-program:nth-child(even) > * { direction: ltr; }
.edu-program-img {
  aspect-ratio: 4/3; overflow: hidden; background: var(--surface);
  display: flex; align-items: center; justify-content: center;
}
.edu-program-content {
  padding: 64px 56px; display: flex; flex-direction: column; justify-content: center;
}
.edu-program-title {
  font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 16px;
}
.edu-program-desc { font: 300 15px/1.8 'DM Sans'; color: var(--text2); margin-bottom: 28px; }

/* ═══ STARS CANVAS ═══ */
.stars-canvas { position: absolute; inset: 0; display: block; }
.stars-fixed { position: fixed; inset: 0; z-index: 0; pointer-events: none; }

/* ═══ REVEAL ANIMATIONS ═══ */
.reveal {
  opacity: 0; transform: translateY(32px);
  transition: opacity 0.8s var(--ease), transform 0.8s var(--ease);
}
.reveal.vis { opacity: 1; transform: none; }
.reveal-delay-1 { transition-delay: 100ms; }
.reveal-delay-2 { transition-delay: 200ms; }
.reveal-delay-3 { transition-delay: 300ms; }
.reveal-delay-4 { transition-delay: 400ms; }

/* ═══ UTILITIES ═══ */
.max-w { max-width: 1320px; margin: 0 auto; }
.gold { color: var(--gold); }
.italic { font-style: italic; }
.text-muted { color: var(--text2); }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 1100px) {
  .grid-4 { grid-template-columns: repeat(3,1fr); }
  .about-stats { grid-template-columns: repeat(2,1fr); }
  .about-stat:nth-child(2) { border-right: none; }
  .mem-perks-grid { grid-template-columns: repeat(2,1fr); }
  .footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 860px) {
  .nav { padding: 0 24px; }
  .nav-center, .nav-join { display: none; }
  .nav-ham { display: flex; }
  .section { padding: 80px 24px; }
  .section-sm { padding: 48px 24px; }
  .shop-hero { padding: 120px 24px 32px; }
  .cat-tabs { padding: 0 24px; top: 72px; }
  .hero { padding: 0 24px; }
  .hero-scroll { display: none; }
  .grid-4, .grid-3 { grid-template-columns: repeat(2,1fr); }
  .pd { grid-template-columns: 1fr; margin-top: 72px; }
  .pd-gallery { position: relative; height: 60vw; top: 0; }
  .pd-info { padding: 40px 24px; }
  .cart-layout { grid-template-columns: 1fr; margin-top: 72px; }
  .cart-items { padding: 40px 24px; border-right: none; }
  .cart-right { padding: 40px 24px; border-top: 1px solid var(--border); }
  .mem-tiers { grid-template-columns: 1fr; padding: 0 24px 60px; }
  .mem-tier:not(:first-child) { border-left: 1px solid var(--border); border-top: none; }
  .mem-hero { padding: 120px 24px 60px; }
  .mem-perks { padding: 60px 24px; }
  .mem-perks-grid { grid-template-columns: 1fr 1fr; }
  .about-hero { padding: 120px 24px 80px; }
  .about-grid { grid-template-columns: 1fr; }
  .about-card:nth-child(odd) { border-right: 1px solid var(--border); }
  .about-card:nth-child(2) { border-top: none; }
  .about-stats { grid-template-columns: repeat(2,1fr); }
  .events-hero { padding: 120px 24px 48px; }
  .edu-hero { padding: 120px 24px 60px; }
  .edu-program { grid-template-columns: 1fr; }
  .edu-program:nth-child(even) { direction: ltr; }
  .newsletter { flex-direction: column; padding: 48px 24px; text-align: center; }
  .newsletter-input { width: 100%; }
  .footer { padding: 48px 24px 32px; }
  .footer-grid { grid-template-columns: 1fr; gap: 36px; }
  .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
  .mission { padding: 80px 24px; }
}
@media (max-width: 560px) {
  .grid { grid-template-columns: repeat(2,1fr); }
  .mem-perks-grid { grid-template-columns: 1fr; }
  .mem-perk { border-left: none; border-top: 1px solid var(--border); padding: 32px 0; }
  .mem-perk:first-child { border-top: none; }
  .about-stats { grid-template-columns: 1fr; }
  .about-stat { border-right: none; border-bottom: 1px solid var(--border); }
  .about-stat:last-child { border-bottom: none; }
  .cart-item { grid-template-columns: 80px 1fr; }
  .cart-item-price { grid-column: 2; }
  .event-card-title { font-size: 18px; }
}
`;
