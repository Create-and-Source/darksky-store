import { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   STYLESHEET
   ═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}

:root{
  --bg-primary:#04040c;
  --bg-secondary:#080814;
  --bg-card:#0a0a1a;
  --text-primary:#e8e4df;
  --text-secondary:#908a84;
  --text-muted:#5a5550;
  --accent:#d4af37;
  --accent-hover:#e0bf47;
  --accent-dim:#a08520;
  --border:#14142a;
  --border-light:#222244;
  --ease:cubic-bezier(.16,1,.3,1);
  --ease-out:cubic-bezier(.23,1,.32,1);
}

.ds-root{
  background:var(--bg-primary);
  color:var(--text-primary);
  font-family:'DM Sans',-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  min-height:100vh;
  position:relative;
  overflow-x:clip;
}

/* grain overlay */
.ds-root::before{
  content:'';
  position:fixed;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
  pointer-events:none;z-index:1000;opacity:.55;
}

::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border-light);border-radius:2px}

/* ─── ANNOUNCEMENT BAR ─── */
.ann{
  width:100%;background:var(--accent);color:#04040c;
  text-align:center;padding:11px 20px;
  font:600 11px/1 'DM Sans',sans-serif;
  letter-spacing:2.5px;text-transform:uppercase;
  position:relative;z-index:101;
}

/* ─── NAVIGATION ─── */
.nv{
  position:sticky;top:0;z-index:100;
  height:72px;padding:0 48px;
  display:flex;align-items:center;
  justify-content:space-between;
  background:rgba(4,4,12,.95);
  backdrop-filter:blur(24px) saturate(1.8);
  border-bottom:1px solid var(--border);
}
.nv-b{display:flex;align-items:center;gap:14px;z-index:1}
.nv-logo{
  width:44px;height:44px;border-radius:50%;
  background:linear-gradient(135deg,var(--accent),var(--accent-dim));
  display:flex;align-items:center;justify-content:center;
  font:700 17px/1 'Playfair Display',serif;color:#04040c;
  flex-shrink:0;box-shadow:0 0 20px rgba(212,175,55,.2);
}
.nv-txt{font:400 16px/1.2 'Playfair Display',serif;letter-spacing:.2px}
.nv-txt small{
  display:block;font:600 8px/1 'DM Sans',sans-serif;
  letter-spacing:4px;color:var(--accent);
  margin-bottom:4px;text-transform:uppercase;
}
.nv-ctr{
  position:absolute;left:50%;transform:translateX(-50%);
  display:flex;gap:36px;align-items:center;z-index:0;
}
.nv-ctr a{
  color:var(--text-secondary);text-decoration:none;
  font:500 11px/1 'DM Sans';letter-spacing:1.5px;
  text-transform:uppercase;cursor:pointer;
  position:relative;transition:color .3s;
  padding-bottom:4px;white-space:nowrap;
}
.nv-ctr a::after{
  content:'';position:absolute;bottom:0;left:0;
  width:0;height:1px;background:var(--accent);
  transition:width .35s var(--ease);
}
.nv-ctr a:hover{color:var(--text-primary)}
.nv-ctr a:hover::after,.nv-ctr .nv-ac::after{width:100%}
.nv-ctr .nv-ac{color:var(--text-primary)}
.nv-r{display:flex;align-items:center;gap:10px;z-index:1}
.nv-cart{
  width:38px;height:38px;border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;background:none;
  color:var(--text-secondary);transition:all .3s;
  position:relative;flex-shrink:0;
}
.nv-cart:hover{border-color:var(--accent);color:var(--accent)}
.nv-badge{
  position:absolute;top:-8px;right:-8px;
  background:var(--accent);color:#04040c;
  font:700 10px/1 'DM Sans';width:18px;height:18px;
  border-radius:50%;display:flex;
  align-items:center;justify-content:center;
}
.nv-hbg{
  display:none;background:none;border:none;
  cursor:pointer;padding:8px;
  color:var(--text-primary);
  flex-direction:column;gap:5px;
}
.nv-hbg span{
  display:block;width:22px;height:1.5px;
  background:currentColor;transition:all .3s;border-radius:1px;
}
.nv-hbg.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
.nv-hbg.open span:nth-child(2){opacity:0;transform:scaleX(0)}
.nv-hbg.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}

/* ─── MOBILE MENU ─── */
.nv-mob{
  position:fixed;inset:0;z-index:99;
  background:rgba(4,4,12,.98);
  backdrop-filter:blur(24px);
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  gap:36px;opacity:0;pointer-events:none;
  transition:opacity .4s var(--ease);
}
.nv-mob.open{opacity:1;pointer-events:all}
.nv-mob a{
  font:300 38px/1 'Playfair Display',serif;
  color:var(--text-secondary);text-decoration:none;
  cursor:pointer;transition:color .3s;letter-spacing:.5px;
}
.nv-mob a:hover,.nv-mob .nv-ac{color:var(--text-primary)}
.nv-mob-btn{
  margin-top:8px;background:var(--accent);color:#04040c;
  border:none;padding:14px 44px;
  font:700 11px 'DM Sans';letter-spacing:2.5px;
  text-transform:uppercase;cursor:pointer;transition:background .3s;
}
.nv-mob-btn:hover{background:var(--accent-hover)}

/* ─── HERO ─── */
.hero{
  position:relative;width:100%;
  height:90vh;min-height:600px;
  overflow:hidden;
  display:flex;align-items:center;justify-content:center;
}
.hero-vids{position:absolute;inset:0;z-index:0}
.hero-vid{
  position:absolute;inset:0;width:100%;height:100%;
  object-fit:cover;opacity:0;transition:opacity 1.5s ease;
}
.hero-vid.on{opacity:1}
.hero-grad{
  position:absolute;inset:0;z-index:1;
  background:
    linear-gradient(to bottom,
      rgba(4,4,12,.28) 0%,
      rgba(4,4,12,.44) 40%,
      rgba(4,4,12,.96) 100%),
    radial-gradient(ellipse at 30% 40%,
      rgba(212,175,55,.07) 0%,
      transparent 60%);
}
.hero-ctn{
  position:relative;z-index:2;
  max-width:860px;width:100%;
  padding:0 24px;text-align:center;
}
.hero-ctn>*{
  opacity:0;transform:translateY(28px);
  transition:opacity .9s,transform .9s var(--ease);
}
.hero-vis .hero-tag{opacity:1;transform:none;transition-delay:.1s}
.hero-vis .hero-ttl{opacity:1;transform:none;transition-delay:.28s}
.hero-vis .hero-sub{opacity:1;transform:none;transition-delay:.44s}
.hero-vis .hero-btns{opacity:1;transform:none;transition-delay:.58s}
.hero-tag{
  font:600 11px/1 'DM Sans',sans-serif;
  letter-spacing:5px;text-transform:uppercase;
  color:var(--accent);margin-bottom:28px;
}
.hero-ttl{
  font:400 clamp(42px,6.5vw,82px)/1.05 'Playfair Display',serif;
  color:var(--text-primary);margin-bottom:24px;
}
.hero-sub{
  font:300 16px/1.9 'DM Sans',sans-serif;
  color:var(--text-secondary);
  max-width:500px;margin:0 auto 44px;
}
.hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-primary{
  padding:16px 42px;
  font:600 11px/1 'DM Sans';
  letter-spacing:2.5px;text-transform:uppercase;
  cursor:pointer;border:none;
  background:var(--accent);color:#04040c;
  transition:all .3s;white-space:nowrap;
}
.btn-primary:hover{
  background:var(--accent-hover);
  transform:translateY(-2px);
  box-shadow:0 8px 32px rgba(212,175,55,.28);
}
.btn-outline{
  padding:16px 42px;
  font:600 11px/1 'DM Sans';
  letter-spacing:2.5px;text-transform:uppercase;
  cursor:pointer;
  background:transparent;color:var(--text-primary);
  border:1px solid rgba(255,255,255,.22);
  transition:all .3s;white-space:nowrap;
}
.btn-outline:hover{border-color:rgba(255,255,255,.6);transform:translateY(-2px)}
.hero-scroll{
  position:absolute;bottom:36px;left:50%;
  transform:translateX(-50%);z-index:2;
  display:flex;flex-direction:column;align-items:center;gap:12px;
  opacity:0;animation:sfade 1s .9s forwards;
}
.hero-scroll span{font:300 10px/1 'DM Sans';letter-spacing:3px;text-transform:uppercase;color:var(--text-muted)}
.hero-scroll-line{
  width:1px;height:44px;
  background:linear-gradient(to bottom,var(--text-muted),transparent);
  animation:pline 2s ease-in-out infinite;
}
@keyframes sfade{to{opacity:1}}
@keyframes pline{0%,100%{opacity:.3}50%{opacity:1}}

/* ─── BRAND MARQUEE ─── */
.mq{
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  background:var(--bg-secondary);
  padding:18px 0;overflow:hidden;
  position:relative;z-index:1;
}
.mq-track{display:flex;width:max-content;animation:marquee 40s linear infinite}
.mq-item{
  font:400 16px/1 'Bebas Neue',sans-serif;
  letter-spacing:4px;color:var(--text-muted);
  padding:0 28px;white-space:nowrap;
}
.mq-sep{color:var(--accent);padding:0;letter-spacing:0;font-size:11px}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ─── SECTION UTILITIES ─── */
.sec-tag{
  font:600 10px/1 'DM Sans';
  letter-spacing:4px;text-transform:uppercase;
  color:var(--accent);margin-bottom:14px;display:block;
}
.sec-ttl{
  font:400 38px/1.1 'Playfair Display',serif;
  color:var(--text-primary);
}
.sec-hdr{
  display:flex;align-items:flex-end;
  justify-content:space-between;
  margin-bottom:48px;gap:20px;
}
.sec-link{
  font:500 11px/1 'DM Sans';letter-spacing:2px;
  text-transform:uppercase;color:var(--text-secondary);
  text-decoration:none;cursor:pointer;
  border-bottom:1px solid var(--border-light);
  padding-bottom:3px;
  transition:all .3s;white-space:nowrap;flex-shrink:0;
}
.sec-link:hover{color:var(--accent);border-bottom-color:var(--accent)}
.fu{
  opacity:0;transform:translateY(30px);
  transition:opacity .8s var(--ease),transform .8s var(--ease);
}
.fu-v{opacity:1;transform:translateY(0)}

/* ─── CATEGORY COLLECTIONS ─── */
.cats-sec{padding:100px 60px;position:relative;z-index:1}
.cat-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  grid-template-rows:auto auto;
  gap:16px;
}
.cat-card{
  position:relative;overflow:hidden;cursor:pointer;
  border:1px solid var(--border);
  opacity:0;transform:translateY(30px);
  transition:opacity .7s var(--ease),transform .7s var(--ease),border-color .35s;
}
.cat-card-v{opacity:1;transform:translateY(0)}
.cat-card:hover{border-color:var(--accent)}
.cat-big{grid-column:1/3;grid-row:1/3;min-height:440px}
.cat-sm{min-height:218px}
.cat-img{
  position:absolute;inset:0;
  width:100%;height:100%;object-fit:cover;
  filter:brightness(.4) saturate(.65);
  transition:filter .5s,transform .65s var(--ease);
}
.cat-card:hover .cat-img{filter:brightness(.54) saturate(.85);transform:scale(1.04)}
.cat-ov{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(4,4,12,.92) 0%,transparent 55%);
  z-index:1;
}
.cat-ctn{position:absolute;bottom:0;left:0;right:0;z-index:2;padding:24px}
.cat-count{
  font:600 10px/1 'DM Sans';letter-spacing:2px;
  text-transform:uppercase;color:var(--accent);
  margin-bottom:8px;display:block;
}
.cat-name{
  font:400 22px/1.1 'Playfair Display',serif;
  color:var(--text-primary);margin-bottom:5px;
}
.cat-big .cat-name{font-size:32px}
.cat-sub{font:400 12px/1 'DM Sans';color:var(--text-muted)}
.cat-arr{
  position:absolute;top:16px;right:16px;z-index:3;
  width:36px;height:36px;
  border:1px solid rgba(255,255,255,.12);
  display:flex;align-items:center;justify-content:center;
  color:var(--text-muted);font-size:15px;
  transition:all .3s;
}
.cat-card:hover .cat-arr{border-color:var(--accent);color:var(--accent)}

/* ─── FEATURED PRODUCT SPOTLIGHT ─── */
.feat-sec{
  padding:80px 60px;
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  background:var(--bg-secondary);
  position:relative;z-index:1;
}
.feat-grid{
  display:grid;grid-template-columns:1.1fr 1fr;
  gap:80px;max-width:1200px;margin:0 auto;align-items:start;
}
.feat-img-w{
  position:relative;border:1px solid var(--border);
  overflow:hidden;aspect-ratio:1;
}
.feat-img-w img{
  width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .65s var(--ease);
}
.feat-img-w:hover img{transform:scale(1.03)}
.feat-badge{
  position:absolute;top:16px;left:16px;z-index:2;
  background:var(--accent);color:#04040c;
  font:700 9px/1 'DM Sans';letter-spacing:1.5px;
  text-transform:uppercase;padding:6px 14px;
}
.feat-details{padding-top:8px}
.feat-brand{
  font:600 10px/1 'DM Sans';letter-spacing:3px;
  text-transform:uppercase;color:var(--accent);
  margin-bottom:16px;display:block;
}
.feat-name{
  font:400 36px/1.1 'Playfair Display',serif;
  color:var(--text-primary);margin-bottom:20px;
}
.feat-desc{
  font:300 14px/1.85 'DM Sans';
  color:var(--text-secondary);margin-bottom:28px;
}
.feat-price{
  font:400 34px/1 'Bebas Neue',sans-serif;
  letter-spacing:2px;color:var(--accent);
  margin-bottom:32px;display:block;
}
.feat-specs{
  display:grid;grid-template-columns:1fr 1fr;
  gap:1px;background:var(--border);
  border:1px solid var(--border);margin-bottom:32px;
}
.feat-spec{background:var(--bg-card);padding:14px 18px}
.feat-spec-lbl{
  font:600 9px/1 'DM Sans';letter-spacing:2px;
  text-transform:uppercase;color:var(--text-muted);
  margin-bottom:6px;display:block;
}
.feat-spec-val{font:500 14px/1 'DM Sans';color:var(--text-primary)}

/* ─── VIDEO DIVIDER ─── */
.vdiv{position:relative;z-index:1;width:100%;height:50vh;min-height:340px;overflow:hidden}
.vdiv video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.vdiv-ov{
  position:absolute;inset:0;z-index:1;
  background:linear-gradient(to bottom,
    rgba(4,4,12,.88) 0%,
    rgba(4,4,12,.22) 50%,
    rgba(4,4,12,.88) 100%);
}
.vdiv-ctn{
  position:absolute;inset:0;z-index:2;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;gap:18px;
}
.vdiv-tag{font:600 10px/1 'DM Sans';letter-spacing:4px;text-transform:uppercase;color:var(--accent)}
.vdiv-ttl{
  font:400 clamp(26px,4vw,40px)/1.1 'Playfair Display',serif;
  color:var(--text-primary);
}
.vdiv-ttl em{font-style:italic;color:var(--accent)}

/* ─── PRODUCT GRID ─── */
.prod-sec{padding:100px 60px;position:relative;z-index:1}
.prod-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:48px}
.pc{
  border:1px solid var(--border);cursor:pointer;
  background:var(--bg-card);
  opacity:0;transform:translateY(30px);
  transition:
    opacity .7s var(--ease),
    transform .7s var(--ease),
    border-color .3s,
    box-shadow .3s;
}
.pc-v{opacity:1;transform:translateY(0)}
.pc-v:hover{
  border-color:var(--border-light);
  transform:translateY(-3px);
  box-shadow:0 14px 44px rgba(0,0,0,.55);
}
.pc-img{position:relative;aspect-ratio:1;overflow:hidden;background:var(--bg-card)}
.pc-img img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease)}
.pc:hover .pc-img img{transform:scale(1.06)}
.pc-badge{
  position:absolute;top:14px;left:14px;z-index:2;
  background:var(--accent);color:#04040c;
  font:700 9px/1 'DM Sans';letter-spacing:1.5px;
  text-transform:uppercase;padding:5px 12px;
}
.pc-info{border-top:1px solid var(--border);padding:20px}
.pc-cat{
  font:600 9px/1 'DM Sans';letter-spacing:2.5px;
  text-transform:uppercase;color:var(--accent);
  margin-bottom:8px;display:block;
}
.pc-name{
  font:400 16px/1.3 'Playfair Display',serif;
  color:var(--text-primary);margin-bottom:4px;
}
.pc-sub{
  font:400 12px/1 'DM Sans';color:var(--text-muted);
  margin-bottom:14px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.pc-bot{display:flex;align-items:center;justify-content:space-between}
.pc-price{font:600 15px/1 'DM Sans';color:var(--text-primary)}
.pc-cl{font:400 11px/1 'DM Sans';color:var(--text-muted)}
.load-more-w{text-align:center}
.load-more{
  padding:14px 52px;
  font:600 11px/1 'DM Sans';letter-spacing:2.5px;
  text-transform:uppercase;cursor:pointer;
  background:transparent;color:var(--text-secondary);
  border:1px solid var(--border-light);transition:all .3s;
}
.load-more:hover{border-color:var(--accent);color:var(--accent)}

/* ─── NEWSLETTER ─── */
.nl-sec{
  padding:80px 60px;border-top:1px solid var(--border);
  background:var(--bg-secondary);position:relative;z-index:1;text-align:center;
}
.nl-inner{max-width:560px;margin:0 auto}
.nl-desc{font:300 14px/1.85 'DM Sans';color:var(--text-secondary);margin-bottom:36px}
.nl-form{display:flex;gap:0;max-width:480px;margin:0 auto}
.nl-input{
  flex:1;padding:15px 20px;
  background:rgba(255,255,255,.04);
  border:1px solid var(--border);border-right:none;
  color:var(--text-primary);font:400 14px/1 'DM Sans';
  outline:none;transition:border-color .3s;
}
.nl-input::placeholder{color:var(--text-muted)}
.nl-input:focus{border-color:var(--accent)}
.nl-btn{
  padding:15px 28px;background:var(--accent);color:#04040c;
  border:none;font:700 11px/1 'DM Sans';letter-spacing:2px;
  text-transform:uppercase;cursor:pointer;
  transition:background .3s;white-space:nowrap;flex-shrink:0;
}
.nl-btn:hover{background:var(--accent-hover)}

/* ─── TRUST BADGES ─── */
.trust-sec{border-top:1px solid var(--border);padding:64px 60px;position:relative;z-index:1}
.trust-grid{
  display:grid;grid-template-columns:repeat(4,1fr);
  gap:24px;max-width:900px;margin:0 auto;
}
.trust-item{text-align:center}
.trust-icon{
  width:52px;height:52px;border-radius:50%;
  border:1px solid var(--border-light);
  display:flex;align-items:center;justify-content:center;
  font-size:22px;margin:0 auto 16px;background:var(--bg-card);
}
.trust-lbl{font:600 13px/1 'DM Sans';color:var(--text-primary);margin-bottom:6px}
.trust-desc{font:400 12px/1.6 'DM Sans';color:var(--text-muted)}

/* ─── FOOTER ─── */
.foot{
  border-top:1px solid var(--border);
  padding:72px 60px 36px;
  background:var(--bg-primary);position:relative;z-index:1;
}
.foot-grid{
  display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;
  gap:48px;margin-bottom:56px;
}
.foot-logo{
  font:400 32px/1 'Bebas Neue',sans-serif;
  letter-spacing:3px;color:var(--accent);
  margin-bottom:14px;display:block;
}
.foot-tagline{font:300 13px/1.75 'DM Sans';color:var(--text-muted);margin-bottom:20px;max-width:280px}
.foot-contact{font:400 12px/1.8 'DM Sans';color:var(--text-muted)}
.foot-contact a{color:var(--accent);text-decoration:none}
.foot-hd{
  font:600 10px/1 'DM Sans';letter-spacing:3px;
  text-transform:uppercase;color:var(--text-secondary);
  margin-bottom:20px;display:block;
}
.foot-links{list-style:none;display:flex;flex-direction:column;gap:10px}
.foot-links li a{
  font:400 13px/1 'DM Sans';color:var(--text-muted);
  text-decoration:none;transition:color .3s;cursor:pointer;
}
.foot-links li a:hover{color:var(--accent)}
.foot-bar{
  border-top:1px solid var(--border);padding-top:28px;
  display:flex;justify-content:space-between;align-items:center;
  font:400 12px/1 'DM Sans';color:var(--text-muted);
  flex-wrap:wrap;gap:12px;
}
.foot-bar a{color:var(--text-secondary);text-decoration:none;transition:color .3s}
.foot-bar a:hover{color:var(--accent)}

/* ─── PRODUCT MODAL ─── */
.m-bg{
  position:fixed;inset:0;z-index:200;
  background:rgba(0,0,0,.9);backdrop-filter:blur(16px);
  display:flex;align-items:center;justify-content:center;
  animation:fi .2s ease;padding:20px;
}
.mdl{
  background:var(--bg-card);border:1px solid var(--border);
  max-width:860px;width:100%;max-height:90vh;overflow-y:auto;
  display:grid;grid-template-columns:1fr 1fr;
  animation:mi .35s var(--ease);position:relative;
}
.m-x{
  position:absolute;top:14px;right:14px;z-index:5;
  background:rgba(255,255,255,.06);
  border:1px solid var(--border);
  color:var(--text-primary);width:36px;height:36px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:18px;transition:all .3s;
}
.m-x:hover{background:rgba(255,255,255,.14);border-color:var(--border-light)}
.m-img{overflow:hidden}
.m-img img{width:100%;height:100%;object-fit:cover;aspect-ratio:1;display:block}
.m-body{padding:40px;display:flex;flex-direction:column;gap:18px}
.m-cat{font:600 9px/1 'DM Sans';letter-spacing:3px;text-transform:uppercase;color:var(--accent)}
.m-nm{font:400 26px/1.2 'Playfair Display',serif;color:var(--text-primary)}
.m-sb{font:400 13px/1 'DM Sans';color:var(--text-secondary);margin-top:-8px}
.m-pr{font:400 32px/1 'Bebas Neue',sans-serif;letter-spacing:2px;color:var(--accent)}
.m-grp label{
  display:block;font:600 9px/1 'DM Sans';
  letter-spacing:2px;text-transform:uppercase;
  color:var(--text-muted);margin-bottom:10px;
}
.m-opts{display:flex;gap:6px;flex-wrap:wrap}
.m-opts button{
  background:transparent;border:1px solid var(--border);
  color:var(--text-secondary);
  padding:8px 14px;font:400 12px/1 'DM Sans';
  cursor:pointer;transition:all .25s;
}
.m-opts button:hover{border-color:var(--border-light);color:var(--text-primary)}
.m-sel{border-color:var(--accent)!important;color:var(--accent)!important;background:rgba(212,175,55,.08)!important}
.m-add{
  width:100%;padding:16px;margin-top:auto;
  background:var(--accent);color:#04040c;
  border:none;font:700 11px/1 'DM Sans';
  letter-spacing:2.5px;text-transform:uppercase;
  cursor:pointer;transition:all .3s;
}
.m-add:hover{background:var(--accent-hover);transform:translateY(-1px);box-shadow:0 6px 24px rgba(212,175,55,.25)}
.m-ok{background:#2ecc71!important;color:#fff!important}
.m-ok:hover{background:#27ae60!important}

/* ─── CART DRAWER ─── */
.dr-bg{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.65);animation:fi .2s}
.dr{
  position:fixed;top:0;right:0;
  width:400px;max-width:100vw;height:100vh;
  background:var(--bg-secondary);
  border-left:1px solid var(--border);
  z-index:301;display:flex;flex-direction:column;
  animation:si .35s var(--ease);
}
.dr-hd{
  padding:24px 28px 20px;border-bottom:1px solid var(--border);
  display:flex;justify-content:space-between;align-items:center;
}
.dr-hd h2{font:400 24px/1 'Playfair Display',serif}
.dr-hd h2 span{font:400 13px/1 'DM Sans';color:var(--text-muted)}
.dr-hd-x{
  background:none;border:1px solid var(--border);
  color:var(--text-secondary);cursor:pointer;
  width:34px;height:34px;font-size:18px;
  display:flex;align-items:center;justify-content:center;transition:all .2s;
}
.dr-hd-x:hover{border-color:var(--accent);color:var(--accent)}
.dr-bd{flex:1;overflow-y:auto;padding:16px 28px}
.dr-mt{text-align:center;padding:60px 16px;color:var(--text-muted)}
.dr-mi{font-size:44px;margin-bottom:16px;opacity:.2}
.ci{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid var(--border)}
.ci-im{width:64px;height:64px;overflow:hidden;flex-shrink:0;border:1px solid var(--border)}
.ci-im img{width:100%;height:100%;object-fit:cover}
.ci-in{flex:1;min-width:0}
.ci-nm{font:500 13px/1 'DM Sans';color:var(--text-primary);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ci-vr{font:400 11px/1 'DM Sans';color:var(--text-muted);margin-bottom:8px}
.ci-ac{display:flex;align-items:center;gap:8px}
.ci-ac button{
  width:26px;height:26px;border:1px solid var(--border);
  background:transparent;color:var(--text-primary);
  font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .2s;
}
.ci-ac button:hover{border-color:var(--accent);color:var(--accent)}
.ci-ac span{font:600 13px/1 'DM Sans';min-width:20px;text-align:center}
.ci-rm{border:none!important;color:var(--text-muted)!important;font-size:11px!important;width:auto!important;padding:0 6px!important}
.ci-rm:hover{color:#e74c3c!important}
.ci-pr{font:600 14px/1 'DM Sans';color:var(--text-primary);white-space:nowrap;align-self:center}
.dr-ft{padding:20px 28px;border-top:1px solid var(--border);background:var(--bg-card)}
.dr-tl{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.dr-tl span:first-child{font:500 11px/1 'DM Sans';letter-spacing:2px;text-transform:uppercase;color:var(--text-secondary)}
.dr-tl span:last-child{font:400 26px/1 'Bebas Neue',sans-serif;letter-spacing:2px;color:var(--accent)}
.dr-co{
  width:100%;padding:16px;background:var(--accent);color:#04040c;
  border:none;font:700 11px/1 'DM Sans';
  letter-spacing:2.5px;text-transform:uppercase;cursor:pointer;transition:all .3s;
}
.dr-co:hover{background:var(--accent-hover)}
.dr-nt{text-align:center;font:400 11px/1 'DM Sans';color:var(--text-muted);margin-top:10px}

/* ─── TOAST ─── */
.tst{
  position:fixed;bottom:28px;left:50%;
  transform:translateX(-50%) translateY(100px);
  background:var(--bg-card);border:1px solid var(--accent);
  color:var(--text-primary);padding:14px 28px;
  font:500 13px/1 'DM Sans';z-index:500;
  transition:transform .4s var(--ease);
  box-shadow:0 12px 44px rgba(0,0,0,.7),0 0 24px rgba(212,175,55,.08);
  white-space:nowrap;
}
.tst-s{transform:translateX(-50%) translateY(0)}

/* ─── KEYFRAMES ─── */
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes mi{from{opacity:0;transform:scale(.96) translateY(20px)}to{opacity:1;transform:none}}
@keyframes si{from{transform:translateX(100%)}to{transform:none}}

/* ─── RESPONSIVE 1024px ─── */
@media(max-width:1100px){
  .nv{padding:0 24px}
  .nv-ctr{display:none}
  .nv-hbg{display:flex}
}
@media(max-width:1024px){
  .cats-sec,.prod-sec,.nl-sec,.trust-sec,.feat-sec,.foot{padding-left:28px;padding-right:28px}
  .feat-grid{grid-template-columns:1fr;gap:40px}
  .prod-grid{grid-template-columns:repeat(2,1fr)}
  .trust-grid{grid-template-columns:repeat(2,1fr)}
  .foot-grid{grid-template-columns:1fr 1fr;gap:32px}
  .cats-sec{padding-top:72px;padding-bottom:72px}
  .prod-sec{padding-top:72px;padding-bottom:72px}
}
@media(max-width:768px){
  .cat-grid{grid-template-columns:repeat(2,1fr);grid-template-rows:auto}
  .cat-big{grid-column:1/3;min-height:260px}
  .cat-sm{min-height:160px}
  .prod-grid{grid-template-columns:repeat(2,1fr);gap:12px}
  .sec-hdr{flex-direction:column;align-items:flex-start}
}
@media(max-width:640px){
  .hero{height:75vh}
  .hero-btns{flex-direction:column;align-items:center}
  .cats-sec,.prod-sec,.nl-sec,.trust-sec,.feat-sec{padding:60px 20px}
  .cat-grid{grid-template-columns:1fr 1fr}
  .prod-grid{grid-template-columns:1fr}
  .trust-grid{grid-template-columns:1fr 1fr}
  .foot{padding:48px 20px 24px}
  .foot-grid{grid-template-columns:1fr;gap:28px}
  .nl-form{flex-direction:column}
  .nl-input{border-right:1px solid var(--border);border-bottom:none}
  .dr{width:100vw}
}
@media(max-width:700px){
  .mdl{grid-template-columns:1fr;max-height:100vh;height:100%}
  .m-bg{padding:0;align-items:flex-end}
  .m-img img{aspect-ratio:16/9!important;height:auto}
}
`;

/* ═══════════════════════════════════════════════════════════
   PRODUCT DATA
   ═══════════════════════════════════════════════════════════ */
const P = [
  {id:"6993320a1b150aae4b05dac3",n:"Alien UFO Cat Abduction Tee",s:"Cute Space Cats Graphic T-Shirt",p:14.12,mx:16,c:"tees",b:"Popular",img:"https://images.printify.com/mockup/6993320a1b150aae4b05dac3/42830/97992/alien-ufo-cat-abduction-tee-cute-space-cats-graphic-t-shirt.jpg?camera_label=front",cl:["White","Natural","Sport Grey","Heather Navy","Light Blue"],sz:["S","M","L","XL","2XL"]},
  {id:"698ec4a4022d8585b006ec78",n:"Astronaut Cowboy T-Shirt",s:"Space Rider Graphic Tee",p:14.12,mx:17.60,c:"tees",b:null,img:"https://images.printify.com/mockup/698ec4a4022d8585b006ec78/38194/97992/astronaut-cowboy-tshirt-space-rider-graphic-tee.jpg?camera_label=front",cl:["Dark Heather","Red","Dark Chocolate","Military Green","Navy"],sz:["S","M","L","XL","2XL","3XL"]},
  {id:"698ef1b9e6f166ad2404a451",n:"Astronaut Eating Planet Ice Cream",s:"Kids Space Graphic Tee",p:15.10,mx:null,c:"tees",b:null,img:"https://images.printify.com/mockup/698ef1b9e6f166ad2404a451/35001/266/astronaut-eating-planet-ice-cream.jpg?camera_label=front",cl:["Light Blue"],sz:["XS","S","M","L","XL"]},
  {id:"699329afcec1eb89690701fa",n:"Astronomy Club Telescope T-Shirt",s:"Dark Sky Stargazing Retro Tee",p:15.27,mx:24.88,c:"tees",b:"Best Seller",img:"https://images.printify.com/mockup/699329afcec1eb89690701fa/100496/95837/astronomy-club-telescope-t-shirt-dark-sky-stargazing-retro-tee.jpg?camera_label=front",cl:["Heather Columbia Blue","CVC Purple Rush","CVC Cardinal","CVC Ice Blue","Heather Mauve"],sz:["XS","S","M","L","XL","2XL","3XL","4XL"]},
  {id:"699255712911a7a5e8045909",n:"My Telescope Is Calling Tee",s:"...and I Must Go",p:15.27,mx:24.88,c:"tees",b:null,img:"https://images.printify.com/mockup/699255712911a7a5e8045909/100280/95837/astronomy-t-shirt-my-telescope-is-calling-and-i-must-go-tee-for-stargazers.jpg?camera_label=front",cl:["CVC Teal","CVC Cream","CVC Kelly Green","CVC Ice Blue","CVC Banana Cream"],sz:["XS","S","M","L","XL","2XL","3XL","4XL"]},
  {id:"69932bf4ded8329cc20b2780",n:"Vintage Telescope Patent T-Shirt",s:"Blueprint Astronomy Tee",p:14.12,mx:17.60,c:"tees",b:"New",img:"https://images.printify.com/mockup/69932bf4ded8329cc20b2780/38186/97992/vintage-telescope-patent-t-shirt-blueprint-astronomy-tee.jpg?camera_label=front",cl:["Navy"],sz:["S","M","L","XL","2XL","3XL"]},
  {id:"698ec8ada54a77338c03d248",n:"Cowboy & UFO Desert T-Shirt",s:"Retro Western Alien Graphic Tee",p:14.12,mx:17.60,c:"tees",b:null,img:"https://images.printify.com/mockup/698ec8ada54a77338c03d248/63303/97992/cowboy-ufo-desert-t-shirt-retro-western-alien-graphic-tee.jpg?camera_label=front",cl:["Red","Military Green","Natural","Sport Grey"],sz:["S","M","L","XL","2XL","3XL"]},
  {id:"698eaacb2c44862f0707fcd2",n:"Desert Highway Graphic T-Shirt",s:"Vintage Road Trip Tee",p:13.18,mx:16.67,c:"tees",b:null,img:"https://images.printify.com/mockup/698eaacb2c44862f0707fcd2/38192/97992/desert-highway-graphic-tshirt-on-a-dark-desert-highway-vintage-road-trip-tee.jpg?camera_label=front",cl:["Red","Military Green","White","Navy","Natural","Black"],sz:["S","M","L","XL","2XL","3XL"]},
  {id:"698ea6865747b568e200e9f8",n:"Solar System Alignment T-Shirt",s:"You Are Here Planetary Graphic",p:15.27,mx:24.88,c:"tees",b:null,img:"https://images.printify.com/mockup/698ea6865747b568e200e9f8/100376/95837/solar-system-alignment-tshirt-you-are-here-planetary-graphic-tee.jpg?camera_label=front",cl:["CVC Royal"],sz:["XS","S","M","L","XL","2XL","3XL","4XL"]},
  {id:"698ee6022c44862f07080a70",n:"Pluto Never Forget Tee",s:"Retro Planet Tribute 1930–2006",p:33.87,mx:39.70,c:"tees",b:null,img:"https://images.printify.com/mockup/698ee6022c44862f07080a70/40705/109464/pluto-never-forget-tee-retro-planet-tribute-t-shirt-1930-2006.jpg?camera_label=front",cl:["Black Heather","Green TriBlend","Navy TriBlend","Orange TriBlend","Red TriBlend"],sz:["S","M","L","XL","2XL"]},
  {id:"699235c60cffac1ee006d908",n:"Unisex Triblend Tee",s:"Premium Soft Space Tee",p:33.62,mx:39.45,c:"tees",b:"Premium",img:"https://images.printify.com/mockup/699235c60cffac1ee006d908/40711/109464/unisex-triblend-tee.jpg?camera_label=front",cl:["Red TriBlend","True Royal TriBlend"],sz:["S","M","L","XL","2XL"]},
  {id:"698455452ec1aca18f004d90",n:"Astronaut Graphic Hoodie",s:"Dark Sky Discovery Center Sweatshirt",p:20.62,mx:23.53,c:"hoodies",b:"Best Seller",img:"https://images.printify.com/mockup/698455452ec1aca18f004d90/32920/100682/astronaut-graphic-hoodie-dark-sky-discovery-center-space-sweatshirt.jpg?camera_label=person-4-back",cl:["Black","Dark Heather","Red","Sand","Navy","Royal"],sz:["S","M","L","XL","2XL","3XL","4XL","5XL"]},
  {id:"698ee636437d0b0f2c035525",n:"Pluto Never Forget Long Sleeve",s:"Retro Planet Tribute Shirt",p:21.78,mx:25.12,c:"longsleeve",b:null,img:"https://images.printify.com/mockup/698ee636437d0b0f2c035525/25076/103304/pluto-never-forget-long-sleeve-tee-retro-planet-tribute-shirt.jpg?camera_label=front",cl:["Black Heather","Heather Navy","True Royal","Red","White","Cardinal"],sz:["XS","S","M","L","XL","2XL"]},
  {id:"698eece53a2519c47c085552",n:"Astronomer Telescope Tank Top",s:"Science Lover Stargazing Tee",p:19.35,mx:22.37,c:"tanks",b:null,img:"https://images.printify.com/mockup/698eece53a2519c47c085552/24870/101889/astronomer-telescope-tank-top-science-lover-stargazing-tee.jpg?camera_label=front",cl:["Black","Navy","Red","Leaf","True Royal"],sz:["XS","S","M","L","XL","2XL"]},
  {id:"698458c2f242ef6d160392f3",n:"Women's Ideal Racerback Tank",s:"Discovery Center Series",p:9.93,mx:11.53,c:"tanks",b:null,img:"https://images.printify.com/mockup/698458c2f242ef6d160392f3/19334/111806/womens-ideal-racerback-tank.jpg?camera_label=front-2",cl:["Heather Grey","Solid Black","Solid Royal","Solid Red","Solid Midnight Navy","Solid Mint"],sz:["XS","S","M","L","XL","2XL"]},
  {id:"699331f0fb693388a30a9a04",n:"Youth UFO Abduction Cats Tee",s:"Cute Space Cats Graphic",p:15.45,mx:null,c:"youth",b:null,img:"https://images.printify.com/mockup/699331f0fb693388a30a9a04/61551/94623/youth-tee-cute-ufo-abduction-cats-graphic-t-shirt.jpg?camera_label=front",cl:["Natural","Dark Heather Grey","Pink","Heather Columbia Blue","Ash"],sz:["S","M","L","XL"]},
  {id:"6992656ba0b737bc6802cc8e",n:"Youth Rocket Rainbow Tee",s:"Kids Space Adventure Shirt",p:15.45,mx:null,c:"youth",b:"New",img:"https://images.printify.com/mockup/6992656ba0b737bc6802cc8e/64370/94623/youth-rocket-rainbow-tee-kids-space-adventure-short-sleeve-shirt.jpg?camera_label=front",cl:["Natural","Pink","Heather Columbia Blue","Ash","Berry","Gold"],sz:["S","M","L","XL"]},
  {id:"698eed5ce6f166ad2404a366",n:"Youth Astronomer Tee",s:"Stargazing Telescope Kids Shirt",p:15.45,mx:null,c:"youth",b:null,img:"https://images.printify.com/mockup/698eed5ce6f166ad2404a366/71283/94623/youth-astronomer-tee-stargazing-telescope-kids-shirt.jpg?camera_label=front",cl:["Natural","Pink","Heather Columbia Blue","Berry","Heather True Royal","Gold"],sz:["S","M","L","XL"]},
  {id:"6992325e2911a7a5e8045010",n:"Laika First Dog in Space Kids Tee",s:"Retro Space Dog Graphic",p:12.13,mx:null,c:"youth",b:null,img:"https://images.printify.com/mockup/6992325e2911a7a5e8045010/42772/105377/laika-first-dog-in-space-kids-tee-retro-space-dog-graphic-shirt.jpg?camera_label=front",cl:["Light Blue","White","Light Pink","Old Gold","Daisy"],sz:["XS","S","M","L","XL"]},
  {id:"698eee0b95ea998bfa0ab854",n:"Toddler Astronomer Tee",s:"Cute Space Telescope Kids Shirt",p:13.07,mx:null,c:"toddler",b:null,img:"https://images.printify.com/mockup/698eee0b95ea998bfa0ab854/79252/99201/toddler-astronomer-tee-cute-space-telescope-kids-shirt.jpg?camera_label=front",cl:["Heather Red","Pink","Yellow","Heather Mauve","Kelly"],sz:["2T","3T","4T","5T"]},
  {id:"69a7590bdec16f958407bd89",n:"Toddler Space Puppy Astronauts Tee",s:"Cute Space Pattern",p:13.07,mx:null,c:"toddler",b:"New",img:"https://images.printify.com/mockup/69a7590bdec16f958407bd89/74428/99201/copy-of-toddler-tee-cute-space-puppy-astronauts-pattern.jpg?camera_label=front",cl:["Black"],sz:["2T","3T","4T","5T"]},
  {id:"69a87ee86c3524ae5a094f79",n:"Infant Explore the Night Tee",s:"Baby Space Graphic",p:20.99,mx:null,c:"infant",b:null,img:"https://images.printify.com/mockup/69a87ee86c3524ae5a094f79/21660/102828/infant-tee-astronomy-explore-the-night-baby-space-graphic.jpg?camera_label=front",cl:["Red","White","Natural","Pink"],sz:["6M","12M","18M","24M"]},
  {id:"69a87dfe88ee39dcf2077fed",n:"Infant I Love You to the Moon Tee",s:"Telescope Baby Shirt",p:20.99,mx:null,c:"infant",b:"New",img:"https://images.printify.com/mockup/69a87dfe88ee39dcf2077fed/21660/102828/infant-tee-i-love-you-to-the-moon-telescope-baby-shirt.jpg?camera_label=front",cl:["Red","White","Butter","Mauvelous","Apple"],sz:["6M","12M","18M","24M"]},
  {id:"69839b7a2ec1aca18f002fc9",n:"Embroidered Crescent Arc Beanie",s:"Minimal Night Sky Knit Hat",p:13.93,mx:null,c:"accessories",b:null,img:"https://images.printify.com/mockup/69839b7a2ec1aca18f002fc9/116433/109382/embroidered-crescent-arc-cuffed-beanie-minimal-night-sky-knit-hat.jpg?camera_label=front",cl:["Black","Gold","Navy","Red","Royal","White"],sz:["One Size"]},
  {id:"699fa5591d09f9e64d0d2084",n:"Space Discovery EVA Foam Clogs",s:"Dark Sky Center Graphic Slip-Ons",p:11.04,mx:12.43,c:"accessories",b:null,img:"https://images.printify.com/mockup/699fa5591d09f9e64d0d2084/106592/102975/copy-of-space-discovery-eva-foam-clogs-dark-sky-center-graphic-slip-on-shoes.jpg?camera_label=front",cl:["Black","White"],sz:["US 6","US 7","US 8","US 9","US 10","US 11"]},
  {id:"69825ff40c4f7923f304b41b",n:"Galaxy Coconut Apricot Candle",s:"Scented Candle 4oz / 9oz",p:8.38,mx:null,c:"home",b:null,img:"https://images.printify.com/mockup/69825ff40c4f7923f304b41b/107587/104467/galaxy-coconut-apricot-scented-candle-4oz9oz.jpg?camera_label=context-3",cl:["Clear","Amber"],sz:["4oz","9oz"]},
  {id:"697f87d637ee881b0a06d739",n:"Desert Night Sky Fine Art Print",s:"Passepartout Paper Frame",p:7.09,mx:9.45,c:"prints",b:null,img:"https://images.printify.com/mockup/697f87d637ee881b0a06d739/78277/29344/desert-night-sky-fine-art-print-passepartout-paper-frame.jpg?camera_label=front",cl:["White"],sz:["11x14","14x11","20x16"]},
];

const CAT_DEFS = [
  {
    id:"apparel",label:"Apparel",subtitle:"Tees · Hoodies · Long Sleeves",count:28,big:true,
    img:"https://images.printify.com/mockup/699329afcec1eb89690701fa/100496/95837/astronomy-club-telescope-t-shirt-dark-sky-stargazing-retro-tee.jpg?camera_label=front",
    cats:["tees","hoodies","longsleeve"],
  },
  {
    id:"kids",label:"Kids & Family",subtitle:"Youth · Toddler · Infant",count:17,big:false,
    img:"https://images.printify.com/mockup/6992656ba0b737bc6802cc8e/64370/94623/youth-rocket-rainbow-tee-kids-space-adventure-short-sleeve-shirt.jpg?camera_label=front",
    cats:["youth","toddler","infant"],
  },
  {
    id:"gifts",label:"Gifts",subtitle:"Candles · Art Prints · Accessories",count:15,big:false,
    img:"https://images.printify.com/mockup/69825ff40c4f7923f304b41b/107587/104467/galaxy-coconut-apricot-scented-candle-4oz9oz.jpg?camera_label=context-3",
    cats:["home","prints","accessories"],
  },
  {
    id:"outerwear",label:"Outerwear",subtitle:"Hoodies · Sweatshirts · Fleece",count:5,big:false,
    img:"https://images.printify.com/mockup/698455452ec1aca18f004d90/32920/100682/astronaut-graphic-hoodie-dark-sky-discovery-center-space-sweatshirt.jpg?camera_label=person-4-back",
    cats:["hoodies"],
  },
  {
    id:"tanks",label:"Tanks",subtitle:"Performance · Racerback",count:2,big:false,
    img:"https://images.printify.com/mockup/698eece53a2519c47c085552/24870/101889/astronomer-telescope-tank-top-science-lover-stargazing-tee.jpg?camera_label=front",
    cats:["tanks"],
  },
];

const FEATURED = P.find(x => x.id === "698455452ec1aca18f004d90");
const MARQUEE_ITEMS = ["PRINTIFY","SQUARE","DARK SKY","ASTRONOMY","STARGAZING","OBSERVATORY","DESERT NIGHTS","MILKY WAY"];

/* ═══════════════════════════════════════════════════════════
   HOOK — useOnScreen
   ═══════════════════════════════════════════════════════════ */
function useOnScreen(ref, threshold = 0.08) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return vis;
}

/* ═══════════════════════════════════════════════════════════
   STARFIELD CANVAS
   ═══════════════════════════════════════════════════════════ */
function Stars() {
  const ref = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const stars = useRef([]);
  const shoots = useRef([]);
  const raf = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = 0, h = 0;
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    stars.current = Array.from({ length: 180 }, () => ({
      x: Math.random() * (w || window.innerWidth),
      y: Math.random() * (h || window.innerHeight),
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.45 + 0.15,
      sp: Math.random() * 0.3 + 0.05,
      ph: Math.random() * Math.PI * 2,
      dp: Math.random() * 3 + 1,
    }));

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const mx = (mouse.current.x - 0.5) * 16;
      const my = (mouse.current.y - 0.5) * 9;
      const t = Date.now() * 0.001;
      for (const s of stars.current) {
        const px = ((s.x + mx * s.dp) % w + w) % w;
        const py = ((s.y + my * s.dp) % h + h) % h;
        const tw = Math.sin(t * s.sp + s.ph) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,208,230,${s.a * tw})`;
        ctx.fill();
      }
      if (Math.random() < 0.004 && shoots.current.length < 2) {
        shoots.current.push({
          x: Math.random() * w * 0.8,
          y: Math.random() * h * 0.3,
          len: Math.random() * 70 + 40,
          sp: Math.random() * 7 + 5,
          ang: Math.PI / 4 + Math.random() * 0.3,
          life: 1,
        });
      }
      shoots.current = shoots.current.filter(ss => {
        ss.x += Math.cos(ss.ang) * ss.sp;
        ss.y += Math.sin(ss.ang) * ss.sp;
        ss.life -= 0.018;
        if (ss.life <= 0) return false;
        const g = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - Math.cos(ss.ang) * ss.len,
          ss.y - Math.sin(ss.ang) * ss.len
        );
        g.addColorStop(0, `rgba(255,255,255,${ss.life})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - Math.cos(ss.ang) * ss.len, ss.y - Math.sin(ss.ang) * ss.len);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        return true;
      });
      raf.current = requestAnimationFrame(draw);
    }
    draw();

    let timer;
    const onM = (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        mouse.current.x = e.clientX / (w || 1);
        mouse.current.y = e.clientY / (h || 1);
      }, 16);
    };
    window.addEventListener("mousemove", onM);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onM);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100%",
        zIndex: 0, pointerEvents: "none",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   FADE-UP WRAPPER
   ═══════════════════════════════════════════════════════════ */
function FU({ children, delay = 0, className = "", style }) {
  const ref = useRef(null);
  const vis = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={`fu${vis ? " fu-v" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CATEGORY CARD
   ═══════════════════════════════════════════════════════════ */
function CatCard({ def, idx, onSelect }) {
  const ref = useRef(null);
  const vis = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={`cat-card ${def.big ? "cat-big" : "cat-sm"}${vis ? " cat-card-v" : ""}`}
      style={{ transitionDelay: `${idx * 90}ms` }}
      onClick={() => onSelect(def)}
    >
      <img className="cat-img" src={def.img} alt={def.label} loading="lazy" />
      <div className="cat-ov" />
      <div className="cat-ctn">
        <span className="cat-count">{def.count} Items</span>
        <div className="cat-name">{def.label}</div>
        <div className="cat-sub">{def.subtitle}</div>
      </div>
      <div className="cat-arr">&#8594;</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD
   ═══════════════════════════════════════════════════════════ */
function PCard({ p, i, onOpen }) {
  const ref = useRef(null);
  const vis = useOnScreen(ref);
  const pr = p.mx && p.mx !== p.p
    ? `$${p.p.toFixed(2)} – $${p.mx.toFixed(2)}`
    : `$${p.p.toFixed(2)}`;

  return (
    <div
      ref={ref}
      className={`pc${vis ? " pc-v" : ""}`}
      style={{ transitionDelay: `${(i % 4) * 80}ms` }}
      onClick={() => onOpen(p)}
    >
      <div className="pc-img">
        {p.b && <div className="pc-badge">{p.b}</div>}
        <img src={p.img} alt={p.n} loading="lazy" />
      </div>
      <div className="pc-info">
        <span className="pc-cat">{p.c}</span>
        <div className="pc-name">{p.n}</div>
        <div className="pc-sub">{p.s}</div>
        <div className="pc-bot">
          <span className="pc-price">{pr}</span>
          {p.cl.length > 1 && <span className="pc-cl">{p.cl.length} colors</span>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function DarkSkyStore() {
  const [cart, setCart]           = useState([]);
  const [cartOpen, setCartOpen]   = useState(false);
  const [sel, setSel]             = useState(null);
  const [sz, setSz]               = useState(null);
  const [cl, setCl]               = useState(null);
  const [added, setAdded]         = useState(false);
  const [toast, setToast]         = useState(null);
  const [mobOpen, setMobOpen]     = useState(false);
  const [activeVid, setActiveVid] = useState(0);
  const [showAll, setShowAll]     = useState(false);
  const [email, setEmail]         = useState("");

  const heroRef = useRef(null);
  const heroVis = useOnScreen(heroRef, 0.01);
  const vidRefs = useRef([null, null, null, null]);

  // Video cycling
  useEffect(() => {
    vidRefs.current.forEach(v => { if (v) v.play().catch(() => {}); });
    const id = setInterval(() => setActiveVid(v => (v + 1) % 4), 8000);
    return () => clearInterval(id);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = (sel || cartOpen || mobOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sel, cartOpen, mobOpen]);

  const cc = cart.reduce((a, i) => a + i.qty, 0);
  const ct = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const displayedProducts = showAll ? P : P.slice(0, 8);

  const show = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const add = (p, size, color) => {
    const k = `${p.id}-${size}-${color}`;
    setCart(prev => {
      const ex = prev.find(i => i.key === k);
      if (ex) return prev.map(i => i.key === k ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { key: k, name: p.n, img: p.img, price: p.mx || p.p, size, color, qty: 1 }];
    });
    show(`${p.n} added to cart`);
  };

  const openP = (p) => { setSel(p); setSz(p.sz[0]); setCl(p.cl[0]); setAdded(false); };
  const fP = (p) => p.mx && p.mx !== p.p
    ? `$${p.p.toFixed(2)} – $${p.mx.toFixed(2)}`
    : `$${p.p.toFixed(2)}`;

  const handleCatSelect = () => {
    setMobOpen(false);
    document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { show("You're on the list — welcome!"); setEmail(""); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ds-root">
        <Stars />

        {/* ── ANNOUNCEMENT BAR ── */}
        <div className="ann">
          International Dark Sky Discovery Center &nbsp;·&nbsp; Opening Fall 2026 &nbsp;·&nbsp; Shop Now
        </div>

        {/* ── NAV ── */}
        <nav className="nv">
          <div className="nv-b">
            <div className="nv-logo">DS</div>
            <div className="nv-txt">
              <small>International</small>
              Dark Sky Discovery Center
            </div>
          </div>

          <div className="nv-ctr">
            {["About","Exhibits","Events","Membership","Gallery"].map(l => (
              <a key={l}>{l}</a>
            ))}
            <a className="nv-ac">Shop</a>
          </div>

          <div className="nv-r">
            <button className="nv-cart" onClick={() => setCartOpen(true)} aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cc > 0 && <span className="nv-badge">{cc}</span>}
            </button>
            <button
              className={`nv-hbg${mobOpen ? " open" : ""}`}
              onClick={() => setMobOpen(v => !v)}
              aria-label="Menu"
            >
              <span/><span/><span/>
            </button>
          </div>
        </nav>

        {/* ── MOBILE MENU ── */}
        <div className={`nv-mob${mobOpen ? " open" : ""}`}>
          {["About","Exhibits","Events","Membership","Gallery"].map(l => (
            <a key={l} onClick={() => setMobOpen(false)}>{l}</a>
          ))}
          <a className="nv-ac" onClick={() => setMobOpen(false)}>Shop</a>
          <button className="nv-mob-btn" onClick={() => { setMobOpen(false); setCartOpen(true); }}>
            View Cart
          </button>
        </div>

        {/* ── HERO ── */}
        <section className="hero" ref={heroRef}>
          <div className="hero-vids">
            {[1,2,3,4].map((n, i) => (
              <video
                key={n}
                ref={el => vidRefs.current[i] = el}
                className={`hero-vid${activeVid === i ? " on" : ""}`}
                src={`/videos/hero${n}.mp4`}
                autoPlay muted loop playsInline preload="metadata"
              />
            ))}
          </div>
          <div className="hero-grad" />
          <div className={`hero-ctn${heroVis ? " hero-vis" : ""}`}>
            <p className="hero-tag">Take the Night Home &nbsp;·&nbsp; Gift Shop</p>
            <h1 className="hero-ttl">
              A Piece of the Night Sky,<br />Wherever You Are
            </h1>
            <p className="hero-sub">
              Wearable astronomy and cosmic gifts, handcrafted for stargazers.
              Every purchase supports dark sky preservation.
            </p>
            <div className="hero-btns">
              <button
                className="btn-primary"
                onClick={() => document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" })}
              >
                Shop the Collection
              </button>
              <button className="btn-outline">Become a Member</button>
            </div>
          </div>
          <div className="hero-scroll">
            <span>Scroll</span>
            <div className="hero-scroll-line" />
          </div>
        </section>

        {/* ── BRAND MARQUEE ── */}
        <div className="mq">
          <div className="mq-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="mq-item">
                {item}
                {(i + 1) % MARQUEE_ITEMS.length !== 0 && (
                  <span className="mq-sep"> ✦ </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* ── CATEGORY COLLECTIONS ── */}
        <section className="cats-sec" id="categories">
          <FU>
            <div className="sec-hdr">
              <div>
                <span className="sec-tag">Browse by Category</span>
                <h2 className="sec-ttl">The Collection</h2>
              </div>
              <a
                className="sec-link"
                onClick={() => document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" })}
              >
                View All &nbsp;&#8594;
              </a>
            </div>
          </FU>
          <div className="cat-grid">
            {CAT_DEFS.map((def, i) => (
              <CatCard key={def.id} def={def} idx={i} onSelect={handleCatSelect} />
            ))}
          </div>
        </section>

        {/* ── FEATURED PRODUCT SPOTLIGHT ── */}
        {FEATURED && (
          <section className="feat-sec">
            <FU style={{ marginBottom: 52 }}>
              <span className="sec-tag">Spotlight</span>
              <h2 className="sec-ttl">Featured Piece</h2>
            </FU>
            <div className="feat-grid">
              <FU delay={100}>
                <div className="feat-img-w">
                  <div className="feat-badge">Best Seller</div>
                  <img src={FEATURED.img} alt={FEATURED.n} />
                </div>
              </FU>
              <FU delay={200} className="feat-details">
                <span className="feat-brand">Dark Sky Discovery Center</span>
                <h3 className="feat-name">{FEATURED.n}</h3>
                <p className="feat-desc">
                  The official sweatshirt of the International Dark Sky Discovery Center.
                  Heavyweight cotton-poly blend with a relaxed unisex fit — perfect for
                  cool desert nights under the stars.
                </p>
                <span className="feat-price">{fP(FEATURED)}</span>
                <div className="feat-specs">
                  {[
                    ["Material","Cotton/Poly Blend"],
                    ["Fit","Unisex Relaxed"],
                    ["Sizes","S to 5XL"],
                    ["Colors",`${FEATURED.cl.length} Options`],
                  ].map(([lbl, val]) => (
                    <div className="feat-spec" key={lbl}>
                      <span className="feat-spec-lbl">{lbl}</span>
                      <span className="feat-spec-val">{val}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => openP(FEATURED)}>
                  Add to Cart
                </button>
              </FU>
            </div>
          </section>
        )}

        {/* ── VIDEO DIVIDER ── */}
        <div className="vdiv">
          <video autoPlay muted loop playsInline preload="metadata">
            <source src="/videos/hero3.mp4" type="video/mp4" />
          </video>
          <div className="vdiv-ov" />
          <div className="vdiv-ctn">
            <FU><span className="vdiv-tag">Our Mission</span></FU>
            <FU delay={120}>
              <h2 className="vdiv-ttl">Preserve the <em>Darkness</em></h2>
            </FU>
          </div>
        </div>

        {/* ── NEW ARRIVALS GRID ── */}
        <section className="prod-sec" id="new-arrivals">
          <FU>
            <div className="sec-hdr">
              <div>
                <span className="sec-tag">Recently Added</span>
                <h2 className="sec-ttl">New Arrivals</h2>
              </div>
              <a className="sec-link" onClick={() => setShowAll(true)}>
                Shop All &nbsp;&#8594;
              </a>
            </div>
          </FU>
          <div className="prod-grid">
            {displayedProducts.map((p, i) => (
              <PCard key={p.id} p={p} i={i} onOpen={openP} />
            ))}
          </div>
          {!showAll && P.length > 8 && (
            <div className="load-more-w">
              <button className="load-more" onClick={() => setShowAll(true)}>
                Load More — {P.length - 8} Items
              </button>
            </div>
          )}
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="nl-sec">
          <FU className="nl-inner">
            <span className="sec-tag">Stay in the Loop</span>
            <h2 className="sec-ttl" style={{ marginBottom: 20 }}>
              New Gear, Straight to Your Inbox
            </h2>
            <p className="nl-desc">
              Be first to know when new collections drop, member events are announced,
              and the observatory opens its doors.
            </p>
            <form className="nl-form" onSubmit={handleSubscribe}>
              <input
                className="nl-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button className="nl-btn" type="submit">Subscribe</button>
            </form>
          </FU>
        </section>

        {/* ── TRUST BADGES ── */}
        <section className="trust-sec">
          <FU>
            <div className="trust-grid">
              {[
                { icon:"🔭", label:"Observatory Quality", desc:"Curated by astronomers, designed for stargazers" },
                { icon:"📦", label:"Ships Nationwide", desc:"Free shipping on orders over $75" },
                { icon:"🌙", label:"Dark Sky Certified", desc:"Supporting IDA-recognized preservation efforts" },
                { icon:"🤝", label:"Member Discounts", desc:"Members save 15% on every order, every time" },
              ].map(({ icon, label, desc }) => (
                <div className="trust-item" key={label}>
                  <div className="trust-icon">{icon}</div>
                  <div className="trust-lbl">{label}</div>
                  <p className="trust-desc">{desc}</p>
                </div>
              ))}
            </div>
          </FU>
        </section>

        {/* ── FOOTER ── */}
        <footer className="foot">
          <FU>
            <div className="foot-grid">
              <div>
                <span className="foot-logo">Dark Sky</span>
                <p className="foot-tagline">
                  The official gift shop of the International Dark Sky Discovery Center,
                  opening Fall 2026 in the Sonoran Desert.
                </p>
                <p className="foot-contact">
                  Questions?{" "}
                  <a href="mailto:hello@createandsource.com">hello@createandsource.com</a>
                </p>
              </div>
              <div>
                <span className="foot-hd">Shop</span>
                <ul className="foot-links">
                  {["All Products","Tees & Hoodies","Kids & Family","Accessories","Home & Gifts","New Arrivals"].map(l => (
                    <li key={l}><a>{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="foot-hd">Categories</span>
                <ul className="foot-links">
                  {["Apparel","Tanks","Long Sleeve","Youth","Toddler","Infant"].map(l => (
                    <li key={l}><a>{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="foot-hd">Company</span>
                <ul className="foot-links">
                  {["About Us","Membership","Observatory","Dark Sky Preservation","Contact","FAQ"].map(l => (
                    <li key={l}><a>{l}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="foot-bar">
              <span>&copy; 2026 International Dark Sky Discovery Center. All rights reserved.</span>
              <span>
                <a href="https://createandsource.com" target="_blank" rel="noreferrer">
                  Powered by MuseumOS by Create &amp; Source
                </a>
                &nbsp;&nbsp;·&nbsp;&nbsp;Secured by Square&nbsp;&nbsp;·&nbsp;&nbsp;Fulfilled by Printify
              </span>
            </div>
          </FU>
        </footer>

        {/* ── PRODUCT MODAL ── */}
        {sel && (
          <div className="m-bg" onClick={() => setSel(null)}>
            <div className="mdl" onClick={e => e.stopPropagation()}>
              <button className="m-x" onClick={() => setSel(null)}>&#x2715;</button>
              <div className="m-img">
                <img src={sel.img} alt={sel.n} />
              </div>
              <div className="m-body">
                <span className="m-cat">{sel.c}</span>
                <h2 className="m-nm">{sel.n}</h2>
                <p className="m-sb">{sel.s}</p>
                <p className="m-pr">{fP(sel)}</p>
                <div className="m-grp">
                  <label>Size</label>
                  <div className="m-opts">
                    {sel.sz.map(s => (
                      <button key={s} className={sz === s ? "m-sel" : ""} onClick={() => setSz(s)}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="m-grp">
                  <label>Color</label>
                  <div className="m-opts">
                    {sel.cl.map(c => (
                      <button key={c} className={cl === c ? "m-sel" : ""} onClick={() => setCl(c)}>{c}</button>
                    ))}
                  </div>
                </div>
                <button
                  className={`m-add${added ? " m-ok" : ""}`}
                  onClick={() => {
                    if (sel && sz && cl) {
                      add(sel, sz, cl);
                      setAdded(true);
                      setTimeout(() => setAdded(false), 1500);
                    }
                  }}
                >
                  {added ? "✓ Added to Cart" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CART DRAWER ── */}
        {cartOpen && (
          <>
            <div className="dr-bg" onClick={() => setCartOpen(false)} />
            <div className="dr">
              <div className="dr-hd">
                <h2>Your Cart <span>({cc})</span></h2>
                <button className="dr-hd-x" onClick={() => setCartOpen(false)}>&#x2715;</button>
              </div>
              <div className="dr-bd">
                {cart.length === 0 ? (
                  <div className="dr-mt">
                    <div className="dr-mi">&#9790;</div>
                    <p>Your cart is empty</p>
                    <p style={{ fontSize: 12, marginTop: 8, opacity: .5 }}>
                      Take a piece of the night sky home
                    </p>
                  </div>
                ) : cart.map(item => (
                  <div key={item.key} className="ci">
                    <div className="ci-im"><img src={item.img} alt={item.name} /></div>
                    <div className="ci-in">
                      <div className="ci-nm">{item.name}</div>
                      <div className="ci-vr">{item.size} &middot; {item.color}</div>
                      <div className="ci-ac">
                        <button onClick={() => setCart(pr => pr.map(x => x.key === item.key ? { ...x, qty: x.qty - 1 } : x).filter(x => x.qty > 0))}>&minus;</button>
                        <span>{item.qty}</span>
                        <button onClick={() => setCart(pr => pr.map(x => x.key === item.key ? { ...x, qty: x.qty + 1 } : x))}>+</button>
                        <button className="ci-rm" onClick={() => setCart(pr => pr.filter(x => x.key !== item.key))}>Remove</button>
                      </div>
                    </div>
                    <div className="ci-pr">${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="dr-ft">
                  <div className="dr-tl">
                    <span>Order Total</span>
                    <span>${ct.toFixed(2)}</span>
                  </div>
                  <button className="dr-co">Proceed to Checkout &nbsp;&#8594;</button>
                  <p className="dr-nt">Members receive 15% off every order</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TOAST ── */}
        <div className={`tst${toast ? " tst-s" : ""}`}>{toast || ""}</div>
      </div>
    </>
  );
}
