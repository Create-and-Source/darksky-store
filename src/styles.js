export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg:      #04040c;
  --bg2:     #0a0a1a;
  --bg3:     #12122a;
  --gold:    #D4AF37;
  --gold-d:  #a08530;
  --gold-l:  #e0c060;
  --text:    #F0EDE6;
  --muted:   #8B8698;
  --border:  rgba(212,175,55,0.12);
  --border2: rgba(255,255,255,0.06);
  --card:    rgba(13,13,34,0.85);
  --r:       6px;
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

/* -- TYPOGRAPHY -- */
.serif    { font-family: 'Playfair Display', serif; }
.mono     { font-family: 'JetBrains Mono', monospace; }
.label    { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); }

/* -- ANNOUNCEMENT BAR -- */
.ann-bar {
  display: flex; align-items: center; justify-content: center;
  padding: 10px 24px; background: var(--gold); color: #04040c;
  font: 500 12px 'DM Sans'; letter-spacing: 0.04em;
  text-align: center; position: relative; z-index: 210;
}
.ann-bar a { color: #04040c; text-decoration: underline; margin-left: 6px; cursor: pointer; font-weight: 600; }

/* -- NAV -- */
.nav {
  position: sticky; top: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 72px;
  background: rgba(4,4,12,0.85);
  backdrop-filter: blur(32px) saturate(1.8);
  -webkit-backdrop-filter: blur(32px) saturate(1.8);
  border-bottom: 1px solid var(--border);
}
.nav.has-ann { top: 0; }
.nav-brand { display: flex; align-items: center; gap: 14px; cursor: pointer; }
.nav-mark {
  width: 42px; height: 42px; border-radius: 50%;
  background: conic-gradient(from 180deg, var(--gold), var(--gold-d), var(--gold));
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif; font-size: 16px; color: #04040c; font-weight: 700;
  box-shadow: 0 0 24px rgba(212,175,55,0.3);
  flex-shrink: 0;
}
.nav-name { font-family: 'Playfair Display', serif; font-size: 18px; line-height: 1.2; }
.nav-name small { display: block; font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.22em; color: var(--gold); margin-bottom: 3px; }
.nav-links { display: flex; gap: 32px; }
.nav-links a, .nav-links button {
  background: none; border: none; padding: 0;
  font: 500 14px 'DM Sans'; color: var(--muted); cursor: pointer;
  text-decoration: none; transition: color .25s;
  position: relative;
}
.nav-links a:hover, .nav-links button:hover { color: #fff; }
.nav-links a.active { color: #fff; }
.nav-links a.active::after {
  content: ''; position: absolute; bottom: -26px; left: 0; right: 0;
  height: 2px; background: var(--gold);
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
  font: 700 9px 'DM Sans'; width: 18px; height: 18px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.nav-btn {
  font: 500 12px 'DM Sans'; letter-spacing: 0.04em;
  padding: 10px 24px; border-radius: 100px;
  border: 1px solid var(--gold); color: var(--gold);
  background: transparent; cursor: pointer; transition: all .3s;
}
.nav-btn:hover { background: var(--gold); color: #04040c; }
.nav-ham { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 4px; }
.nav-ham span { display: block; width: 24px; height: 1.5px; background: var(--text); transition: all .3s; }
.nav-ham.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.nav-ham.open span:nth-child(2) { opacity: 0; }
.nav-ham.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* Mobile menu - full screen overlay */
.mob-menu {
  display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 195;
  background: rgba(4,4,12,0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 48px;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.mob-menu.open { display: flex; transform: translateX(0); }
.mob-menu-close {
  position: absolute; top: 24px; right: 24px;
  background: none; border: 1px solid var(--border);
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text); cursor: pointer; font-size: 20px;
  transition: border-color 0.25s, color 0.25s;
}
.mob-menu-close:hover { border-color: var(--gold); color: var(--gold); }
.mob-menu a, .mob-menu button {
  display: block; width: 100%;
  font: 400 36px/1 'Playfair Display', serif; font-style: italic;
  color: var(--text); text-decoration: none; background: none; border: none;
  cursor: pointer; transition: color .25s;
  padding: 16px 0; min-height: 48px;
  text-align: left; border-bottom: 1px solid var(--border2);
}
.mob-menu a:hover, .mob-menu button:hover { color: var(--gold); }
.mob-menu-label {
  font: 500 10px 'JetBrains Mono'; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gold);
  margin-bottom: 32px;
}

/* -- HERO -- */
.hero {
  position: relative; min-height: 100vh; height: 100vh;
  display: flex; flex-direction: column; align-items: flex-start;
  justify-content: flex-end; padding: 0 64px 100px;
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
  background: linear-gradient(to top, rgba(4,4,12,1) 0%, rgba(4,4,12,0.6) 35%, rgba(4,4,12,0.15) 100%);
}
/* Stars fallback when no video */
.hero-stars {
  position: absolute; inset: 0; z-index: 0;
  overflow: hidden;
}
.hero-content { position: relative; z-index: 2; max-width: 780px; }
.hero-label { margin-bottom: 28px; }
.hero-h1 {
  font-family: 'Playfair Display', serif;
  font-size: 72px; line-height: 0.95;
  font-weight: 400; margin-bottom: 32px; letter-spacing: -0.02em;
}
.hero-h1 em { font-style: italic; color: var(--gold); }
.hero-sub {
  font-size: 18px; line-height: 1.8; color: var(--muted);
  max-width: 520px; margin-bottom: 48px; font-weight: 300;
}
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
.btn-primary {
  font: 500 13px 'DM Sans'; letter-spacing: 0.06em;
  padding: 16px 40px; border-radius: 100px;
  background: var(--gold); color: #04040c; border: none;
  cursor: pointer; transition: all .35s;
}
.btn-primary:hover { background: var(--gold-l); box-shadow: 0 8px 40px rgba(212,175,55,0.35); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-ghost {
  font: 500 13px 'DM Sans'; letter-spacing: 0.06em;
  padding: 16px 40px; border-radius: 100px;
  background: transparent; color: var(--text);
  border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all .35s;
}
.btn-ghost:hover { border-color: rgba(255,255,255,0.5); transform: translateY(-1px); }
.btn-ghost:active { transform: translateY(0); }
.hero-scroll {
  position: absolute; bottom: 40px; right: 64px; z-index: 2;
  display: flex; align-items: center; gap: 14px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.18em;
  color: var(--muted); text-transform: uppercase;
}
.hero-scroll-line {
  width: 56px; height: 1px; background: var(--gold); opacity: 0.5;
  animation: scrollPulse 2s ease-in-out infinite;
}
@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; width: 40px; }
  50% { opacity: 0.7; width: 56px; }
}

/* -- MARQUEE -- */
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

/* -- SECTION -- */
.section { padding: 120px 64px; }
.section-sm { padding: 80px 64px; }
.section-header { margin-bottom: 64px; }
.section-label { margin-bottom: 18px; }
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(36px, 4vw, 56px); line-height: 1.05;
  font-weight: 400; letter-spacing: -0.02em;
}
.section-title em { font-style: italic; color: var(--gold); }

/* -- PRODUCT GRID -- */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }

/* -- PRODUCT CARD -- */
.pc {
  background: var(--card);
  border-radius: var(--r);
  cursor: pointer; position: relative;
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1), box-shadow 0.4s;
  overflow: hidden;
}
.pc.vis { opacity: 1; transform: translateY(0); }
.pc:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.15), 0 0 32px rgba(212,175,55,0.08);
}
.pc.vis:hover { transform: translateY(-4px) scale(1.03); }
.pc-img {
  position: relative; aspect-ratio: 3/4; overflow: hidden;
  background: #E8E4DC;
}
.pc-img img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s cubic-bezier(.16,1,.3,1);
}
.pc:hover .pc-img img { transform: scale(1.06); }
.pc-qa {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
  padding: 14px 20px; background: var(--gold); color: #04040c;
  font: 600 11px 'JetBrains Mono'; letter-spacing: 0.15em; text-transform: uppercase;
  transform: translateY(100%); transition: transform 0.32s cubic-bezier(.16,1,.3,1);
  text-align: center; cursor: pointer; border: none; width: 100%;
}
.pc:hover .pc-qa { transform: none; }
.pc-badge {
  position: absolute; top: 14px; left: 14px; z-index: 4;
  font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--gold);
  padding: 5px 12px; border: 1px solid rgba(212,175,55,0.4);
  background: rgba(4,4,12,0.85); border-radius: var(--r);
}
.pc-info { padding: 20px; }
.pc-name {
  font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; line-height: 1.4;
  color: #fff; margin-bottom: 6px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.pc-cat { font-size: 12px; color: var(--muted); margin-bottom: 14px; letter-spacing: 0.04em; }
.pc-bottom { display: flex; align-items: center; justify-content: space-between; }
.pc-price { font: 700 16px 'DM Sans'; color: var(--gold); }
.pc-orig { font-size: 12px; color: var(--muted); text-decoration: line-through; margin-left: 6px; }

/* -- CATEGORY CARDS -- */
.cat-cards-5 {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px;
}
.cat-card {
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--r);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  display: flex; flex-direction: column;
}
.cat-card:hover {
  border-color: var(--gold);
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.2);
}
.cat-card-img {
  background: #E8E4DC;
  height: 200px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: background 0.3s;
  position: relative;
}
.cat-card:hover .cat-card-img { background: #F0ECE4; }
.cat-card-img img {
  width: 80%; height: 80%; object-fit: contain;
  filter: drop-shadow(0 6px 16px rgba(0,0,0,0.2));
  transition: transform 0.5s cubic-bezier(.16,1,.3,1);
}
.cat-card:hover .cat-card-img img { transform: scale(1.08); }
.cat-card-overlay {
  position: absolute; inset: 0;
  background: rgba(212,175,55,0);
  transition: background 0.3s;
}
.cat-card:hover .cat-card-overlay { background: rgba(212,175,55,0.06); }
.cat-card-info { padding: 20px; flex: 1; }
.cat-card-label {
  font: 500 9px 'JetBrains Mono'; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 10px;
}
.cat-card-name {
  font-family: 'Playfair Display', serif; font-size: 24px;
  font-weight: 500; color: var(--text); margin-bottom: 12px; line-height: 1.1;
}
.cat-card-meta {
  display: flex; align-items: center; justify-content: space-between;
}
.cat-card-count { font: 500 13px 'DM Sans'; color: rgba(240,237,230,0.7); }
.cat-card-link { font: 500 11px 'JetBrains Mono'; letter-spacing: 0.1em; color: var(--gold); transition: color 0.2s; }
.cat-card:hover .cat-card-link { color: var(--gold-l); }

/* -- CATEGORY TABS -- */
.cat-tabs {
  display: flex; gap: 0; overflow-x: auto; scrollbar-width: none;
  border-bottom: 1px solid var(--border); padding: 0 64px;
  position: sticky; top: 72px; z-index: 100;
  background: rgba(4,4,12,0.92); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.cat-tabs::-webkit-scrollbar { display: none; }
.cat-tab {
  background: none; border: none; cursor: pointer;
  padding: 20px 28px; font: 500 13px 'DM Sans'; letter-spacing: 0.04em;
  color: var(--muted); border-bottom: 2px solid transparent;
  transition: all .25s; white-space: nowrap; margin-bottom: -1px;
}
.cat-tab:hover { color: var(--text); }
.cat-tab.active { color: var(--text); border-bottom-color: var(--gold); }
.cat-count { font-size: 10px; color: var(--gold); margin-left: 6px; }

/* -- SHOP PAGE -- */
.shop-hero {
  padding: 100px 64px 48px;
  border-bottom: 1px solid var(--border);
}
.shop-meta {
  display: flex; align-items: baseline; gap: 20px; margin-top: 16px;
}
.shop-count { font: 300 14px 'DM Sans'; color: var(--muted); }
.shop-search {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 12px 20px;
  font: 400 14px 'DM Sans';
  color: var(--text);
  outline: none;
  width: 260px;
  transition: border-color 0.25s, background 0.25s;
}
.shop-search:focus {
  border-color: var(--gold);
  background: rgba(255,255,255,0.08);
}
.shop-search::placeholder { color: var(--muted); }
.shop-sort {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 12px 16px;
  font: 400 13px 'DM Sans';
  color: var(--text);
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238B8698' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  transition: border-color 0.25s;
}
.shop-sort:focus { border-color: var(--gold); }
.shop-sort option { background: var(--bg2); color: var(--text); }
.shop-results-count {
  font: 400 13px 'DM Sans'; color: var(--muted);
  padding: 0 64px; margin-top: 24px;
}
.shop-empty {
  text-align: center; padding: 100px 40px;
}
.shop-empty-icon {
  font-size: 80px; margin-bottom: 32px; opacity: 0.3;
}
.shop-empty h3 {
  font: 400 28px 'Playfair Display', serif;
  font-style: italic; color: var(--text); margin-bottom: 16px;
}
.shop-empty p {
  font: 300 15px/1.7 'DM Sans'; color: var(--muted);
  max-width: 380px; margin: 0 auto;
}

/* -- PRODUCT DETAIL -- */
.pd { display: grid; grid-template-columns: 55% 45%; min-height: 100vh; }
.pd-gallery { position: sticky; top: 72px; height: calc(100vh - 72px); overflow: hidden; }
.pd-main-img { width: 100%; height: 75%; object-fit: cover; display: block; background: #E8E4DC; }
.pd-thumbs { display: flex; gap: 2px; height: 25%; }
.pd-thumb {
  flex: 1; overflow: hidden; cursor: pointer; opacity: 0.5; transition: opacity .25s;
  border: none; background: var(--bg3); padding: 0;
}
.pd-thumb:hover, .pd-thumb.active { opacity: 1; }
.pd-thumb img { width: 100%; height: 100%; object-fit: cover; }
.pd-info { padding: 72px 56px; overflow-y: auto; }
.pd-breadcrumb {
  display: flex; gap: 8px; align-items: center;
  font: 400 12px 'JetBrains Mono'; letter-spacing: 0.1em; color: var(--muted);
  margin-bottom: 36px;
}
.pd-breadcrumb span { color: var(--border2); }
.pd-breadcrumb a { color: var(--muted); text-decoration: none; cursor: pointer; transition: color .2s; }
.pd-breadcrumb a:hover { color: var(--gold); }
.pd-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px; line-height: 1.15;
  font-weight: 400; margin-bottom: 16px;
}
.pd-price { font: 700 28px 'DM Sans'; color: var(--gold); margin-bottom: 32px; }
.pd-divider { height: 1px; background: var(--border); margin-bottom: 32px; }
.pd-label-sm { font: 500 10px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
.pd-desc { font: 300 15px/1.85 'DM Sans'; color: var(--muted); margin-bottom: 32px; }
.pd-options { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
.pd-opt {
  padding: 10px 20px; border: 1px solid var(--border2); border-radius: var(--r);
  font: 500 13px 'DM Sans'; color: var(--muted); cursor: pointer;
  background: none; transition: all .2s;
}
.pd-opt:hover { border-color: var(--gold); color: var(--text); }
.pd-opt.sel { border-color: var(--gold); color: var(--gold); background: rgba(212,175,55,0.08); }
.pd-qty {
  display: flex; align-items: center; gap: 16px; margin-bottom: 28px;
}
.pd-qty-btn {
  width: 36px; height: 36px; background: var(--bg3); border: 1px solid var(--border2);
  color: var(--text); font-size: 18px; cursor: pointer; border-radius: var(--r);
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.pd-qty-btn:hover { border-color: var(--gold); color: var(--gold); }
.pd-qty-n { font: 500 16px 'DM Sans'; min-width: 24px; text-align: center; }
.pd-add {
  width: 100%; padding: 20px; height: 56px;
  background: var(--gold); color: #04040c;
  font: 600 12px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  border: none; border-radius: var(--r); cursor: pointer; transition: all .35s;
  margin-bottom: 16px;
  display: flex; align-items: center; justify-content: center;
}
.pd-add:hover { background: var(--gold-l); box-shadow: 0 8px 40px rgba(212,175,55,0.35); transform: translateY(-1px); }
.pd-add:active { transform: translateY(0); }
.pd-fave {
  width: 100%; padding: 16px;
  background: transparent; color: var(--muted);
  font: 500 12px 'DM Sans'; letter-spacing: 0.06em;
  border: 1px solid var(--border2); border-radius: var(--r); cursor: pointer; transition: all .25s;
}
.pd-fave:hover { color: var(--text); border-color: var(--border); }
.pd-trust { display: flex; gap: 24px; margin-top: 32px; padding-top: 32px; border-top: 1px solid var(--border); flex-wrap: wrap; }
.pd-trust-item { display: flex; align-items: center; gap: 10px; font: 400 12px 'DM Sans'; color: var(--muted); }

/* -- CART -- */
.cart-layout { display: grid; grid-template-columns: 1fr 400px; gap: 0; min-height: calc(100vh - 72px); }
.cart-items { padding: 72px 64px; border-right: 1px solid var(--border); }
.cart-title { font-family: 'Playfair Display', serif; font-size: 42px; margin-bottom: 48px; font-weight: 400; }
.cart-item {
  display: grid; grid-template-columns: 100px 1fr auto;
  gap: 24px; padding: 28px 0; border-bottom: 1px solid var(--border);
  align-items: start;
}
.cart-item-img { aspect-ratio: 1; overflow: hidden; border-radius: var(--r); background: #E8E4DC; }
.cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
.cart-item-name { font-family: 'Playfair Display', serif; font-size: 16px; margin-bottom: 6px; }
.cart-item-variant { font: 400 12px 'DM Sans'; color: var(--muted); margin-bottom: 14px; }
.cart-item-qty { display: flex; align-items: center; gap: 14px; }
.cart-qty-btn {
  width: 30px; height: 30px; background: var(--bg3); border: 1px solid var(--border2);
  color: var(--text); font-size: 16px; cursor: pointer; border-radius: var(--r); transition: all .2s;
  display: flex; align-items: center; justify-content: center;
}
.cart-qty-btn:hover { border-color: var(--gold); color: var(--gold); }
.cart-qty-n { font: 500 14px 'DM Sans'; min-width: 20px; text-align: center; }
.cart-item-price { font: 700 16px 'DM Sans'; color: var(--gold); }
.cart-item-remove { font: 400 11px 'DM Sans'; color: var(--muted); background: none; border: none; cursor: pointer; margin-top: 8px; transition: color 0.2s; }
.cart-item-remove:hover { color: var(--gold); }
.cart-right { padding: 72px 48px; background: var(--bg2); position: sticky; top: 72px; height: fit-content; }
.cart-summary-title { font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 32px; }
.cart-line { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); font: 300 14px 'DM Sans'; color: var(--muted); }
.cart-line strong { font-weight: 600; color: var(--text); }
.cart-total { display: flex; justify-content: space-between; padding: 24px 0; font: 600 20px 'DM Sans'; margin-bottom: 32px; border-bottom: 1px solid var(--border); }
.cart-total .price { color: var(--gold); }
.cart-checkout {
  width: 100%; padding: 20px; height: 56px;
  background: var(--gold); color: #04040c;
  font: 600 12px 'JetBrains Mono'; letter-spacing: 0.18em; text-transform: uppercase;
  border: none; border-radius: var(--r); cursor: pointer; transition: all .35s; margin-bottom: 12px;
  display: flex; align-items: center; justify-content: center;
}
.cart-checkout:hover { background: var(--gold-l); box-shadow: 0 8px 40px rgba(212,175,55,0.35); transform: translateY(-1px); }
.cart-checkout:active { transform: translateY(0); }
.cart-continue {
  width: 100%; padding: 16px; background: transparent;
  color: var(--muted); font: 500 13px 'DM Sans';
  border: 1px solid var(--border2); border-radius: var(--r);
  cursor: pointer; transition: all .25s;
}
.cart-continue:hover { color: var(--text); border-color: var(--border); }
.cart-empty {
  text-align: center; padding: 120px 64px;
  min-height: calc(100vh - 72px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.cart-empty-icon {
  width: 120px; height: 120px; margin-bottom: 32px;
  border: 2px solid var(--border); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 48px; color: var(--gold); opacity: 0.4;
}
.cart-empty h2 {
  font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 400; margin-bottom: 16px;
}
.cart-empty h2 em { font-style: italic; color: var(--gold); }
.cart-empty p { font: 300 16px/1.7 'DM Sans'; color: var(--muted); margin-bottom: 36px; max-width: 380px; }

/* -- TESTIMONIALS -- */
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.testimonial-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--r);
  padding: 40px 32px;
  transition: border-color 0.3s, transform 0.3s;
}
.testimonial-card:hover { border-color: rgba(212,175,55,0.3); transform: translateY(-4px); }
.testimonial-stars { color: var(--gold); font-size: 14px; letter-spacing: 4px; margin-bottom: 20px; }
.testimonial-text {
  font: 300 15px/1.8 'DM Sans'; color: var(--text);
  margin-bottom: 24px; font-style: italic;
}
.testimonial-author {
  display: flex; align-items: center; gap: 14px;
}
.testimonial-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--bg3); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font: 600 14px 'DM Sans'; color: var(--gold);
}
.testimonial-name { font: 500 14px 'DM Sans'; color: var(--text); }
.testimonial-loc { font: 300 12px 'DM Sans'; color: var(--muted); margin-top: 2px; }

/* -- NEWSLETTER -- */
.newsletter-section {
  padding: 80px 64px;
  background: radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 60%);
  text-align: center;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.newsletter-title {
  font: 400 clamp(28px, 3.5vw, 42px) 'Playfair Display', serif;
  margin-bottom: 12px;
}
.newsletter-title em { font-style: italic; color: var(--gold); }
.newsletter-sub {
  font: 300 15px/1.7 'DM Sans'; color: var(--muted);
  max-width: 460px; margin: 0 auto 32px;
}
.newsletter-form {
  display: flex; gap: 0; max-width: 480px; margin: 0 auto;
  border: 1px solid var(--border); border-radius: var(--r);
  overflow: hidden;
}
.newsletter-input {
  flex: 1; padding: 16px 20px;
  background: rgba(255,255,255,0.04);
  border: none; outline: none;
  font: 400 14px 'DM Sans'; color: var(--text);
}
.newsletter-input::placeholder { color: var(--muted); }
.newsletter-btn {
  padding: 16px 28px; background: var(--gold); color: #04040c;
  font: 600 11px 'JetBrains Mono'; letter-spacing: 0.12em; text-transform: uppercase;
  border: none; cursor: pointer; transition: background 0.3s;
  white-space: nowrap;
}
.newsletter-btn:hover { background: var(--gold-l); }

/* -- TRUST BADGES -- */
.trust-row {
  display: flex; align-items: center; justify-content: center;
  gap: 48px; padding: 48px 64px;
  flex-wrap: wrap;
}
.trust-item {
  display: flex; align-items: center; gap: 12px;
  font: 400 13px 'DM Sans'; color: var(--muted);
}
.trust-icon {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.trust-icon svg { width: 18px; height: 18px; color: var(--gold); }

/* -- MEMBERSHIP -- */
.mem-hero {
  padding: 120px 64px 100px;
  background: radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%);
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
  background: rgba(212,175,55,0.04);
  border-color: rgba(212,175,55,0.5);
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
.mem-btn-gold:hover { background: var(--gold-l); box-shadow: 0 8px 32px rgba(212,175,55,0.3); }
.mem-perks { padding: 80px 64px; background: var(--bg2); }
.mem-perks-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 0; margin-top: 56px; }
.mem-perk { padding: 40px 32px; border-left: 1px solid var(--border); }
.mem-perk-icon { font-size: 32px; margin-bottom: 20px; }
.mem-perk-title { font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 10px; }
.mem-perk-desc { font: 300 13px/1.75 'DM Sans'; color: var(--muted); }

/* -- MISSION BAND -- */
.mission {
  padding: 120px 64px;
  background: radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 60%);
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

/* -- FOOTER -- */
.footer-newsletter {
  padding: 48px 64px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  display: flex; align-items: center; justify-content: space-between;
  gap: 32px; flex-wrap: wrap;
}
.footer-newsletter-text { font: 400 20px 'Playfair Display', serif; }
.footer-newsletter-text em { font-style: italic; color: var(--gold); }
.footer-newsletter-form {
  display: flex; gap: 0;
  border: 1px solid var(--border); border-radius: var(--r);
  overflow: hidden;
}
.footer-newsletter-input {
  padding: 14px 18px; background: rgba(255,255,255,0.04);
  border: none; outline: none; font: 400 13px 'DM Sans'; color: var(--text);
  width: 260px;
}
.footer-newsletter-input::placeholder { color: var(--muted); }
.footer-newsletter-btn {
  padding: 14px 24px; background: var(--gold); color: #04040c;
  font: 600 10px 'JetBrains Mono'; letter-spacing: 0.12em; text-transform: uppercase;
  border: none; cursor: pointer; transition: background 0.3s;
}
.footer-newsletter-btn:hover { background: var(--gold-l); }
.footer {
  padding: 64px;
  display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 48px; background: #04040c;
}
.footer-brand-name {
  font-family: 'Playfair Display', serif; font-size: 28px; font-style: italic;
  color: var(--text); margin-bottom: 16px;
}
.footer-tagline { font: 300 13px/1.75 'DM Sans'; color: var(--muted); max-width: 260px; margin-bottom: 24px; }
.footer-social { display: flex; gap: 12px; }
.footer-social-link {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid var(--border); background: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color 0.25s, color 0.25s;
  color: var(--muted);
}
.footer-social-link:hover { border-color: var(--gold); color: var(--gold); }
.footer-social-link svg { width: 16px; height: 16px; }
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
  background: #04040c;
}
.footer-copy { font: 400 11px 'JetBrains Mono'; letter-spacing: 0.06em; color: var(--muted); }
.footer-powered { font: 400 10px 'DM Sans'; color: var(--muted); opacity: 0.5; }
.footer-payment { display: flex; gap: 8px; align-items: center; }
.footer-payment-icon {
  width: 32px; height: 20px; border-radius: 3px;
  background: rgba(255,255,255,0.08); border: 1px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  font: 700 7px 'DM Sans'; color: var(--muted); letter-spacing: 0.02em;
}
.footer-star { color: var(--gold); font-size: 20px; }

/* -- STARS CANVAS -- */
.stars-canvas { position: absolute; inset: 0; display: block; }

/* -- REVEAL ANIMATIONS -- */
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s, transform .7s cubic-bezier(.16,1,.3,1); }
.reveal.vis { opacity: 1; transform: none; }

/* -- CHECKOUT -- */
.checkout-layout { display: grid; grid-template-columns: 1fr 420px; gap: 0; min-height: calc(100vh - 72px); }
.checkout-form { padding: 72px 64px; }
.checkout-summary { padding: 72px 48px; background: var(--bg2); position: sticky; top: 72px; height: fit-content; }
.checkout-input {
  width: 100%; padding: 14px 18px; background: var(--bg3);
  border: 1px solid var(--border2); border-radius: var(--r);
  font: 400 14px 'DM Sans'; color: var(--text); outline: none;
  transition: border-color 0.25s;
  margin-bottom: 16px;
}
.checkout-input:focus { border-color: var(--gold); }
.checkout-input::placeholder { color: var(--muted); }
.checkout-label {
  font: 500 11px 'JetBrains Mono'; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 8px;
  display: block;
}

/* -- UTILITIES -- */
.max-w { max-width: 1320px; margin: 0 auto; }
.gold { color: var(--gold); }
.italic { font-style: italic; }
.text-muted { color: var(--muted); }

/* -- RESPONSIVE -- */
@media (max-width: 1200px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(3, 1fr); }
  .cat-cards-5 { grid-template-columns: repeat(3, 1fr); }
  .testimonials-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .mem-tiers { grid-template-columns: 1fr 1fr; }
  .mem-perks-grid { grid-template-columns: repeat(2,1fr); }
  .pd { grid-template-columns: 1fr; }
  .pd-gallery { position: relative; height: 60vw; top: 0; }
  .cart-layout { grid-template-columns: 1fr; }
  .cart-right { border-top: 1px solid var(--border); position: relative; top: 0; }
  .checkout-layout { grid-template-columns: 1fr; }
  .checkout-summary { position: relative; top: 0; }
  .footer { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .cat-cards-5 { grid-template-columns: repeat(2, 1fr); }
  .testimonials-grid { grid-template-columns: 1fr; }
  .nav { padding: 0 24px; height: 64px; }
  .nav-links, .nav-btn { display: none; }
  .nav-ham { display: flex; }
  .section { padding: 80px 24px; }
  .section-sm { padding: 60px 24px; }
  .shop-hero { padding: 64px 24px 32px; }
  .cat-tabs { padding: 0 24px; top: 64px; }
  .hero { padding: 0 24px 64px; }
  .hero-h1 { font-size: 42px; }
  .hero-sub { font-size: 16px; }
  .hero-scroll { display: none; }
  .mem-tiers { grid-template-columns: 1fr; padding: 0 24px 60px; }
  .mem-tier:not(:first-child) { border-left: 1px solid var(--border); border-top: none; }
  .mem-perks { padding: 60px 24px; }
  .mem-perks-grid { grid-template-columns: repeat(2,1fr); }
  .mem-hero { padding: 80px 24px 60px; }
  .cart-items { padding: 40px 24px; }
  .cart-right { padding: 40px 24px; }
  .pd-info { padding: 40px 24px; }
  .footer { grid-template-columns: 1fr 1fr; padding: 48px 24px; }
  .footer-newsletter { padding: 36px 24px; flex-direction: column; align-items: flex-start; }
  .footer-bottom { padding: 20px 24px; flex-direction: column; gap: 12px; text-align: center; }
  .mission { padding: 64px 24px; }
  .newsletter-section { padding: 60px 24px; }
  .trust-row { gap: 24px; padding: 36px 24px; }
  .checkout-form { padding: 40px 24px; }
  .checkout-summary { padding: 40px 24px; }
  .mob-menu { padding: 80px 32px; }
  .shop-search { width: 100%; }
  .shop-results-count { padding: 0 24px; }
}
@media (max-width: 600px) {
  .grid { grid-template-columns: 1fr; }
  .grid-4 { grid-template-columns: 1fr; }
  .cat-cards-5 { grid-template-columns: 1fr; }
  .mem-perks-grid { grid-template-columns: 1fr; }
  .cart-item { grid-template-columns: 80px 1fr; }
  .cart-item-price { grid-column: 2; }
  .footer { grid-template-columns: 1fr; }
  .trust-row { flex-direction: column; gap: 20px; align-items: flex-start; }
  .newsletter-form { flex-direction: column; }
  .newsletter-input { border-radius: var(--r); }
  .newsletter-btn { border-radius: var(--r); }
  .hero-h1 { font-size: 36px; }
  .section-title { font-size: 28px; }
}
`;
