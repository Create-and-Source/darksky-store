import { useState, useRef, useMemo, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   CSS — all styles scoped inside .ds-root
   ═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}

:root{
  --g:#d4af37;--gdim:rgba(212,175,55,.12);--gbdr:rgba(212,175,55,.28);
  --bg:#04040c;--card:#0a0a1a;--card2:#0e0e24;
  --bdr:#16162a;--bdr2:#252548;
  --txt:#f0ede6;--mut:#908d9a;--dim:#5c5870;
  --ease:cubic-bezier(.16,1,.3,1);
}

.ds-root{background:var(--bg);color:var(--txt);font-family:'DM Sans',-apple-system,sans-serif;min-height:100vh;position:relative;overflow-x:hidden}

::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:3px}

/* ── NAV ── */
.nv{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 48px;
  background:rgba(4,4,12,.45);
  backdrop-filter:blur(24px) saturate(1.8);
  border-bottom:1px solid rgba(255,255,255,.04);
  transition:background .5s,border-color .5s;
}
.nv.scrolled{background:rgba(4,4,12,.94);border-bottom-color:rgba(255,255,255,.06)}
.nv-b{display:flex;align-items:center;gap:14px}
.nv-logo{
  width:44px;height:44px;border-radius:50%;
  background:linear-gradient(135deg,#d4af37,#8b6914);
  display:flex;align-items:center;justify-content:center;
  font:700 17px/1 'Playfair Display',serif;color:#04040c;
  box-shadow:0 0 20px rgba(212,175,55,.3);flex-shrink:0;
}
.nv-txt{font:500 17px/1.2 'Playfair Display',serif;letter-spacing:.3px}
.nv-txt small{display:block;font:500 8px/1 'DM Sans',sans-serif;letter-spacing:4px;color:var(--g);margin-bottom:4px}
.nv-lnk{display:flex;gap:28px}
.nv-lnk a{
  color:var(--mut);text-decoration:none;font:500 13px 'DM Sans';
  cursor:pointer;transition:color .3s;position:relative;white-space:nowrap;
}
.nv-lnk a:hover{color:var(--txt)}
.nv-ac{color:var(--g)!important}
.nv-ac::after{
  content:'';position:absolute;bottom:-6px;left:0;right:0;
  height:2px;background:var(--g);border-radius:1px;
}
.nv-r{display:flex;align-items:center;gap:18px}
.nv-cart{
  position:relative;background:none;border:none;cursor:pointer;
  padding:8px;color:var(--mut);transition:all .3s;
}
.nv-cart:hover{color:var(--g)}
.nv-badge{
  position:absolute;top:0;right:0;background:var(--g);color:#04040c;
  font:700 10px 'DM Sans';width:19px;height:19px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
}
.nv-cta{
  background:transparent;color:var(--g);border:1px solid var(--g);
  padding:10px 24px;border-radius:100px;font:600 12px 'DM Sans';
  letter-spacing:.5px;cursor:pointer;transition:all .4s var(--ease);white-space:nowrap;
}
.nv-cta:hover{background:var(--g);color:#04040c;box-shadow:0 0 30px rgba(212,175,55,.35)}
.nv-hbg{
  display:none;background:none;border:none;cursor:pointer;
  padding:8px;color:var(--txt);flex-direction:column;gap:5px;z-index:101;
}
.nv-hbg span{
  display:block;width:22px;height:2px;background:currentColor;
  transition:all .3s var(--ease);border-radius:1px;
}
.nv-hbg.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.nv-hbg.open span:nth-child(2){opacity:0;transform:scaleX(0)}
.nv-hbg.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.nv-mob{
  position:fixed;inset:0;z-index:99;
  background:rgba(4,4,12,.97);backdrop-filter:blur(24px);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:36px;opacity:0;pointer-events:none;
  transition:opacity .4s var(--ease);
}
.nv-mob.open{opacity:1;pointer-events:all}
.nv-mob a{
  font:300 38px/1 'Playfair Display',serif;color:var(--mut);
  text-decoration:none;cursor:pointer;transition:color .3s;letter-spacing:1px;
}
.nv-mob a:hover{color:var(--txt)}
.nv-mob .nv-ac{color:var(--g)!important}
.nv-mob-cta{
  margin-top:8px;background:var(--g);color:#04040c;
  border:none;padding:14px 44px;border-radius:100px;font:700 14px 'DM Sans';
  cursor:pointer;letter-spacing:.5px;transition:all .3s var(--ease);
}
.nv-mob-cta:hover{background:var(--txt)}

/* ── HERO ── */
.hero{
  position:relative;width:100%;height:100vh;min-height:600px;
  overflow:hidden;display:flex;align-items:center;justify-content:center;
}
.hero-vids{position:absolute;inset:0;z-index:0}
.hero-vid{
  position:absolute;inset:0;width:100%;height:100%;
  object-fit:cover;opacity:0;transition:opacity 1.5s ease;
}
.hero-vid.on{opacity:1}
.hero-ov{
  position:absolute;inset:0;z-index:1;
  background:linear-gradient(to bottom,rgba(4,4,12,.55) 0%,rgba(4,4,12,.6) 50%,rgba(4,4,12,.92) 100%);
}
.hero-in{
  position:relative;z-index:2;text-align:center;
  padding:0 24px;max-width:800px;width:100%;
}
.hero-in>*{opacity:0;transform:translateY(30px);transition:opacity .8s,transform .8s var(--ease)}
.hero-vis .hero-tag{opacity:1;transform:translateY(0);transition-delay:.1s}
.hero-vis .hero-h1{opacity:1;transform:translateY(0);transition-delay:.25s}
.hero-vis .hero-sub{opacity:1;transform:translateY(0);transition-delay:.4s}
.hero-vis .hero-pill{opacity:1;transform:translateY(0);transition-delay:.55s}
.hero-tag{font:600 11px/1 'DM Sans';letter-spacing:6px;color:var(--g);text-transform:uppercase;margin-bottom:24px}
.hero-h1{
  font:300 clamp(52px,8vw,96px)/1 'Playfair Display',serif;margin-bottom:24px;
  background:linear-gradient(180deg,#f0ede6 30%,#5c5870);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.hero-sub{font:400 17px/1.8 'DM Sans';color:var(--mut);max-width:440px;margin:0 auto 36px}
.hero-pill{
  display:inline-flex;align-items:center;gap:10px;font:500 13px 'DM Sans';
  color:var(--g);background:var(--gdim);padding:12px 28px;
  border-radius:100px;border:1px solid rgba(212,175,55,.18);
}
.hero-scroll{
  position:absolute;bottom:36px;left:50%;transform:translateX(-50%);
  z-index:2;display:flex;flex-direction:column;align-items:center;gap:10px;
  opacity:0;animation:sfade 1s .9s forwards;
}
.hero-scroll-arr{
  width:20px;height:20px;
  border-right:1.5px solid rgba(212,175,55,.5);border-bottom:1.5px solid rgba(212,175,55,.5);
  transform:rotate(45deg);animation:sbounce 2s ease-in-out infinite;
}
@keyframes sfade{to{opacity:1}}
@keyframes sbounce{
  0%,100%{transform:rotate(45deg) translate(0,0);opacity:.4}
  50%{transform:rotate(45deg) translate(4px,4px);opacity:1}
}

/* ── FADE-UP UTIL ── */
.fu{opacity:0;transform:translateY(40px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.fu-v{opacity:1;transform:translateY(0)}

/* ── SECTION HEADER ── */
.sec-hd{text-align:center;padding:88px 48px 52px}
.sec-lbl{font:600 10px 'DM Sans';letter-spacing:5px;text-transform:uppercase;color:var(--g);margin-bottom:20px}
.sec-ttl{font:300 clamp(32px,4vw,52px)/1.1 'Playfair Display',serif;color:var(--txt)}
.sec-ttl em{font-style:italic;color:var(--g)}
.sec-ln{width:48px;height:1px;background:linear-gradient(to right,transparent,var(--g),transparent);margin:24px auto 0}

/* ── CATEGORY CARDS ── */
.cats-w{position:relative;z-index:1;padding:0 48px 88px;max-width:1360px;margin:0 auto}
.cats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.cc{
  background:var(--card2);border:1px solid var(--bdr);border-radius:16px;
  overflow:hidden;cursor:pointer;display:grid;grid-template-columns:1fr 1fr;
  min-height:172px;
  opacity:0;transform:translateY(40px);
  transition:opacity .7s var(--ease),transform .7s var(--ease),border-color .4s,box-shadow .4s;
}
.cc-v{opacity:1;transform:translateY(0)}
.cc-v:hover{
  border-color:var(--gbdr);
  box-shadow:0 8px 40px rgba(0,0,0,.55),0 0 60px rgba(212,175,55,.07);
  transform:translateY(-8px)!important;
}
.cc-info{padding:28px 24px;display:flex;flex-direction:column;justify-content:space-between}
.cc-name{font:600 18px/1.2 'Playfair Display',serif;color:var(--txt);margin-bottom:6px}
.cc-cnt{font:400 12px 'DM Sans';color:var(--mut);margin-bottom:16px}
.cc-arr{
  width:32px;height:32px;border-radius:50%;
  border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;
  color:var(--mut);font-size:16px;transition:all .3s var(--ease);flex-shrink:0;
}
.cc-v:hover .cc-arr{border-color:var(--g);color:var(--g);background:var(--gdim)}
.cc-img{overflow:hidden;position:relative}
.cc-img img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease)}
.cc-v:hover .cc-img img{transform:scale(1.05)}
.cc-img-fade{
  position:absolute;left:0;top:0;bottom:0;width:55%;
  background:linear-gradient(to right,var(--card2),transparent);
  z-index:1;pointer-events:none;
}

/* ── VIDEO DIVIDER ── */
.vdiv{
  position:relative;z-index:1;width:100%;height:56vh;
  min-height:360px;overflow:hidden;
}
.vdiv video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.vdiv-ov{
  position:absolute;inset:0;z-index:1;
  background:linear-gradient(to bottom,rgba(4,4,12,.88) 0%,rgba(4,4,12,.3) 50%,rgba(4,4,12,.88) 100%);
}
.vdiv-txt{
  position:absolute;inset:0;z-index:2;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;gap:18px;
}
.vdiv-lbl{font:600 10px 'DM Sans';letter-spacing:5px;text-transform:uppercase;color:var(--g)}
.vdiv-ttl{font:300 clamp(28px,4vw,52px)/1.1 'Playfair Display',serif;color:var(--txt)}
.vdiv-ttl em{font-style:italic;color:var(--g)}

/* ── COLLECTION HEADER ── */
.col-hd{text-align:center;padding:88px 48px 52px;position:relative;z-index:1}
.col-ln{
  width:48px;height:1px;
  background:linear-gradient(to right,transparent,var(--g),transparent);
  margin:0 auto 24px;
}
.col-ttl{font:300 clamp(32px,4vw,52px)/1.1 'Playfair Display',serif;color:var(--txt)}
.col-sub{font:400 15px 'DM Sans';color:var(--mut);margin-top:14px}

/* ── FILTER PILLS ── */
.flt{
  position:relative;z-index:1;
  display:flex;justify-content:center;gap:8px;padding:0 48px 44px;flex-wrap:wrap;
}
.fb{
  background:transparent;border:1px solid var(--bdr);color:var(--mut);
  padding:9px 20px;border-radius:100px;font:500 12px 'DM Sans';
  cursor:pointer;transition:all .35s var(--ease);
  display:flex;align-items:center;gap:7px;white-space:nowrap;min-height:44px;
}
.fb:hover{border-color:var(--bdr2);color:var(--txt);transform:translateY(-1px)}
.fb-a{
  background:var(--g)!important;border-color:var(--g)!important;
  color:#04040c!important;box-shadow:0 4px 20px rgba(212,175,55,.28);
}
.fb-n{font-size:10px;font-weight:600;opacity:.6}

/* ── PRODUCT GRID ── */
.grd{
  position:relative;z-index:1;
  display:grid;grid-template-columns:repeat(4,1fr);
  gap:20px;padding:0 48px 88px;max-width:1400px;margin:0 auto;
}
.pc{
  background:var(--card);border:1px solid var(--bdr);border-radius:16px;
  overflow:hidden;cursor:pointer;position:relative;
  opacity:0;transform:translateY(40px);
  transition:opacity .7s var(--ease),transform .7s var(--ease),box-shadow .4s,border-color .4s;
}
.pc-v{opacity:1;transform:translateY(0)}
.pc:hover{border-color:var(--bdr2);box-shadow:0 20px 60px rgba(0,0,0,.55),0 0 40px rgba(212,175,55,.09)}
.pc-badge{
  position:absolute;top:16px;left:16px;z-index:3;
  background:var(--g);color:#04040c;font:700 9px/1 'DM Sans';
  letter-spacing:1.2px;text-transform:uppercase;padding:5px 12px;border-radius:6px;
}
.pc-img{position:relative;aspect-ratio:1;overflow:hidden;background:#080814}
.pc-img img{
  width:100%;height:100%;object-fit:cover;
  transition:transform .6s var(--ease);
}
.pc:hover .pc-img img{transform:scale(1.06)}
.pc-glow{
  position:absolute;bottom:0;left:0;right:0;height:30%;
  background:linear-gradient(to top,var(--card),transparent);
  pointer-events:none;z-index:1;
}
.pc-ov{
  position:absolute;inset:0;z-index:2;
  display:flex;align-items:flex-end;justify-content:center;
  padding-bottom:20px;opacity:0;transition:opacity .3s;
}
.pc:hover .pc-ov{opacity:1}
.pc-qa{
  background:var(--g);color:#04040c;border:none;
  padding:12px 28px;border-radius:100px;font:600 13px 'DM Sans';
  cursor:pointer;transform:translateY(14px);
  transition:all .35s var(--ease);box-shadow:0 4px 20px rgba(212,175,55,.3);
}
.pc:hover .pc-qa{transform:translateY(0)}
.pc-qa:hover{background:var(--txt)}
.pc-info{padding:18px 20px}
.pc-name{
  font:600 15px/1.3 'DM Sans';color:var(--txt);margin-bottom:4px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.pc-sub{
  font:400 12px 'DM Sans';color:var(--dim);margin-bottom:14px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.pc-bot{display:flex;align-items:center;justify-content:space-between}
.pc-pr{font:700 18px 'DM Sans';color:var(--g)}
.pc-cl{font:500 11px 'DM Sans';color:var(--dim)}

/* ── FOOTER ── */
.foot{
  position:relative;z-index:1;
  text-align:center;padding:64px 48px 72px;
  border-top:1px solid rgba(255,255,255,.03);
}
.foot-ln{
  width:60px;height:1px;
  background:linear-gradient(to right,transparent,var(--g),transparent);
  margin:0 auto 44px;
}
.foot-b{font:300 22px 'Playfair Display',serif;color:var(--mut);margin-bottom:12px;letter-spacing:.3px}
.foot-s{font:400 13px 'DM Sans';color:var(--dim);margin-bottom:6px}
.foot-t{font:400 11px 'DM Sans';color:var(--dim);opacity:.5}

/* ── MODAL ── */
.m-bg{
  position:fixed;inset:0;z-index:200;
  background:rgba(0,0,0,.88);backdrop-filter:blur(16px);
  display:flex;align-items:center;justify-content:center;
  animation:fi .25s ease;padding:20px;
}
.mdl{
  background:var(--card);border:1px solid var(--bdr);border-radius:20px;
  max-width:860px;width:100%;max-height:90vh;overflow-y:auto;
  display:grid;grid-template-columns:1fr 1fr;
  animation:mi .4s var(--ease);position:relative;
}
.m-x{
  position:absolute;top:16px;right:16px;z-index:5;
  background:rgba(255,255,255,.08);backdrop-filter:blur(8px);
  border:none;color:var(--txt);width:40px;height:40px;
  border-radius:50%;cursor:pointer;font-size:20px;
  display:flex;align-items:center;justify-content:center;transition:background .3s;
  min-height:44px;min-width:44px;
}
.m-x:hover{background:rgba(255,255,255,.16)}
.m-img{overflow:hidden;border-radius:20px 0 0 20px}
.m-img img{width:100%;height:100%;object-fit:cover;aspect-ratio:1;display:block}
.m-body{padding:40px;display:flex;flex-direction:column;gap:20px}
.m-cat{font:600 10px 'DM Sans';letter-spacing:4px;text-transform:uppercase;color:var(--g)}
.m-nm{font:400 30px/1.2 'Playfair Display',serif;color:var(--txt)}
.m-sb{font:400 14px 'DM Sans';color:var(--mut);margin-top:-10px}
.m-pr{font:700 28px 'DM Sans';color:var(--g)}
.m-grp label{
  display:block;font:600 10px 'DM Sans';
  letter-spacing:1.5px;text-transform:uppercase;color:var(--mut);margin-bottom:10px;
}
.m-opts{display:flex;gap:7px;flex-wrap:wrap}
.m-opts button{
  background:transparent;border:1px solid var(--bdr);color:var(--mut);
  padding:9px 16px;border-radius:10px;font:400 13px 'DM Sans';
  cursor:pointer;transition:all .25s;min-height:44px;
}
.m-opts button:hover{border-color:var(--bdr2);color:var(--txt)}
.m-sel{border-color:var(--g)!important;color:var(--g)!important;background:var(--gdim)!important}
.m-add{
  width:100%;padding:16px;margin-top:auto;
  background:var(--g);color:#04040c;border:none;border-radius:14px;
  font:700 15px 'DM Sans';cursor:pointer;transition:all .35s var(--ease);letter-spacing:.3px;min-height:56px;
}
.m-add:hover{background:var(--txt);transform:translateY(-2px);box-shadow:0 8px 30px rgba(212,175,55,.28)}
.m-ok{background:#2ecc71!important;color:#fff!important}
.m-ok:hover{background:#27ae60!important;box-shadow:0 8px 30px rgba(46,204,113,.28)!important}

/* ── CART DRAWER ── */
.dr-bg{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.62);animation:fi .2s}
.dr{
  position:fixed;top:0;right:0;width:420px;max-width:100vw;height:100vh;
  background:#080814;border-left:1px solid rgba(212,175,55,.14);
  z-index:301;display:flex;flex-direction:column;
  animation:si .35s var(--ease);
  box-shadow:-24px 0 80px rgba(0,0,0,.7);
}
.dr-hd{
  padding:28px 28px 20px;border-bottom:1px solid var(--bdr);
  display:flex;justify-content:space-between;align-items:center;
}
.dr-hd h2{font:400 26px 'Playfair Display',serif}
.dr-hd h2 span{font:400 16px 'DM Sans';color:var(--dim)}
.dr-hd button{
  background:none;border:none;color:var(--mut);cursor:pointer;
  font-size:24px;transition:color .2s;
  min-height:44px;min-width:44px;display:flex;align-items:center;justify-content:center;
}
.dr-hd button:hover{color:var(--txt)}
.dr-bd{flex:1;overflow-y:auto;padding:16px 28px}
.dr-mt{text-align:center;padding:60px 16px;color:var(--dim)}
.dr-mi{font-size:48px;margin-bottom:16px;opacity:.2}
.ci{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--bdr)}
.ci-im{width:68px;height:68px;border-radius:10px;overflow:hidden;flex-shrink:0}
.ci-im img{width:100%;height:100%;object-fit:cover}
.ci-in{flex:1;min-width:0}
.ci-nm{
  font:600 13px 'DM Sans';color:var(--txt);margin-bottom:3px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.ci-vr{font:400 11px 'DM Sans';color:var(--dim);margin-bottom:10px}
.ci-ac{display:flex;align-items:center;gap:10px}
.ci-ac button{
  width:28px;height:28px;border-radius:8px;border:1px solid var(--bdr);
  background:transparent;color:var(--txt);font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .2s;
}
.ci-ac button:hover{border-color:var(--g);color:var(--g)}
.ci-ac span{font:600 13px 'DM Sans';min-width:20px;text-align:center}
.ci-rm{
  width:auto!important;padding:0 8px!important;font-size:11px!important;
  color:var(--dim)!important;border:none!important;
}
.ci-rm:hover{color:#e74c3c!important}
.ci-pr{font:700 15px 'DM Sans';color:var(--g);white-space:nowrap;align-self:center}
.dr-ft{padding:24px 28px;border-top:1px solid var(--bdr);background:var(--card)}
.dr-tl{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.dr-tl span:first-child{font:500 13px 'DM Sans';color:var(--mut);text-transform:uppercase;letter-spacing:1.5px}
.dr-tl span:last-child{font:700 24px 'DM Sans';color:var(--g)}
.dr-co{
  width:100%;padding:16px;background:var(--g);color:#04040c;
  border:none;border-radius:14px;font:700 14px 'DM Sans';
  cursor:pointer;transition:all .35s;min-height:56px;
}
.dr-co:hover{background:var(--txt);transform:translateY(-2px);box-shadow:0 8px 30px rgba(212,175,55,.28)}
.dr-nt{text-align:center;font:400 11px 'DM Sans';color:var(--dim);margin-top:12px}

/* ── TOAST ── */
.tst{
  position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(100px);
  background:#0a0a1a;border:1px solid var(--g);color:var(--txt);
  padding:14px 32px;border-radius:14px;font:500 14px 'DM Sans';
  z-index:500;transition:transform .4s var(--ease);
  box-shadow:0 12px 40px rgba(0,0,0,.65),0 0 30px rgba(212,175,55,.1);
  backdrop-filter:blur(12px);white-space:nowrap;
}
.tst-s{transform:translateX(-50%) translateY(0)}

/* ── KEYFRAMES ── */
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes mi{from{opacity:0;transform:scale(.95) translateY(20px)}to{opacity:1;transform:none}}
@keyframes si{from{transform:translateX(100%)}to{transform:none}}

/* ── RESPONSIVE ── */
@media(max-width:1100px){.grd{grid-template-columns:repeat(3,1fr)}}
@media(max-width:900px){.cats-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){
  .nv{padding:14px 20px}
  .nv-lnk{display:none}
  .nv-cta{display:none}
  .nv-hbg{display:flex}
  .sec-hd{padding:60px 24px 36px}
  .cats-w{padding:0 20px 60px}
  .grd{grid-template-columns:repeat(2,1fr);padding:0 20px 60px;gap:14px}
  .flt{flex-wrap:nowrap;overflow-x:auto;justify-content:flex-start;padding:0 20px 36px;scrollbar-width:none}
  .flt::-webkit-scrollbar{display:none}
  .foot{padding:48px 24px 56px}
  .col-hd{padding:60px 24px 36px}
  .dr{width:100vw}
}
@media(max-width:700px){
  .mdl{grid-template-columns:1fr;max-height:100vh;height:100%;border-radius:0}
  .m-bg{padding:0;align-items:flex-end}
  .m-img{border-radius:0}
  .m-img img{aspect-ratio:16/9!important;height:auto}
}
@media(max-width:540px){
  .cats-grid{grid-template-columns:1fr}
  .grd{grid-template-columns:1fr}
}
`;

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */
const P = [
  { id:"6993320a1b150aae4b05dac3",n:"Alien UFO Cat Abduction Tee",s:"Cute Space Cats Graphic T-Shirt",p:14.12,mx:16,c:"tees",b:"Popular",img:"https://images.printify.com/mockup/6993320a1b150aae4b05dac3/42830/97992/alien-ufo-cat-abduction-tee-cute-space-cats-graphic-t-shirt.jpg?camera_label=front",cl:["White","Natural","Sport Grey","Heather Navy","Light Blue"],sz:["S","M","L","XL","2XL"]},
  { id:"698ec4a4022d8585b006ec78",n:"Astronaut Cowboy T-Shirt",s:"Space Rider Graphic Tee",p:14.12,mx:17.60,c:"tees",b:null,img:"https://images.printify.com/mockup/698ec4a4022d8585b006ec78/38194/97992/astronaut-cowboy-tshirt-space-rider-graphic-tee.jpg?camera_label=front",cl:["Dark Heather","Red","Dark Chocolate","Military Green","Navy"],sz:["S","M","L","XL","2XL","3XL"]},
  { id:"698ef1b9e6f166ad2404a451",n:"Astronaut Eating Planet Ice Cream",s:"Kids Space Graphic Tee",p:15.10,mx:null,c:"tees",b:null,img:"https://images.printify.com/mockup/698ef1b9e6f166ad2404a451/35001/266/astronaut-eating-planet-ice-cream.jpg?camera_label=front",cl:["Light Blue"],sz:["XS","S","M","L","XL"]},
  { id:"699329afcec1eb89690701fa",n:"Astronomy Club Telescope T-Shirt",s:"Dark Sky Stargazing Retro Tee",p:15.27,mx:24.88,c:"tees",b:"Best Seller",img:"https://images.printify.com/mockup/699329afcec1eb89690701fa/100496/95837/astronomy-club-telescope-t-shirt-dark-sky-stargazing-retro-tee.jpg?camera_label=front",cl:["Heather Columbia Blue","CVC Purple Rush","CVC Cardinal","CVC Ice Blue","Heather Mauve"],sz:["XS","S","M","L","XL","2XL","3XL","4XL"]},
  { id:"699255712911a7a5e8045909",n:"My Telescope Is Calling Tee",s:"...and I Must Go",p:15.27,mx:24.88,c:"tees",b:null,img:"https://images.printify.com/mockup/699255712911a7a5e8045909/100280/95837/astronomy-t-shirt-my-telescope-is-calling-and-i-must-go-tee-for-stargazers.jpg?camera_label=front",cl:["CVC Teal","CVC Cream","CVC Kelly Green","CVC Ice Blue","CVC Banana Cream"],sz:["XS","S","M","L","XL","2XL","3XL","4XL"]},
  { id:"69932bf4ded8329cc20b2780",n:"Vintage Telescope Patent T-Shirt",s:"Blueprint Astronomy Tee",p:14.12,mx:17.60,c:"tees",b:"New",img:"https://images.printify.com/mockup/69932bf4ded8329cc20b2780/38186/97992/vintage-telescope-patent-t-shirt-blueprint-astronomy-tee.jpg?camera_label=front",cl:["Navy"],sz:["S","M","L","XL","2XL","3XL"]},
  { id:"698ec8ada54a77338c03d248",n:"Cowboy & UFO Desert T-Shirt",s:"Retro Western Alien Graphic Tee",p:14.12,mx:17.60,c:"tees",b:null,img:"https://images.printify.com/mockup/698ec8ada54a77338c03d248/63303/97992/cowboy-ufo-desert-t-shirt-retro-western-alien-graphic-tee.jpg?camera_label=front",cl:["Red","Military Green","Natural","Sport Grey"],sz:["S","M","L","XL","2XL","3XL"]},
  { id:"698eaacb2c44862f0707fcd2",n:"Desert Highway Graphic T-Shirt",s:"Vintage Road Trip Tee",p:13.18,mx:16.67,c:"tees",b:null,img:"https://images.printify.com/mockup/698eaacb2c44862f0707fcd2/38192/97992/desert-highway-graphic-tshirt-on-a-dark-desert-highway-vintage-road-trip-tee.jpg?camera_label=front",cl:["Red","Military Green","White","Navy","Natural","Black"],sz:["S","M","L","XL","2XL","3XL"]},
  { id:"698ea6865747b568e200e9f8",n:"Solar System Alignment T-Shirt",s:"You Are Here Planetary Graphic",p:15.27,mx:24.88,c:"tees",b:null,img:"https://images.printify.com/mockup/698ea6865747b568e200e9f8/100376/95837/solar-system-alignment-tshirt-you-are-here-planetary-graphic-tee.jpg?camera_label=front",cl:["CVC Royal"],sz:["XS","S","M","L","XL","2XL","3XL","4XL"]},
  { id:"698ee6022c44862f07080a70",n:"Pluto Never Forget Tee",s:"Retro Planet Tribute 1930–2006",p:33.87,mx:39.70,c:"tees",b:null,img:"https://images.printify.com/mockup/698ee6022c44862f07080a70/40705/109464/pluto-never-forget-tee-retro-planet-tribute-t-shirt-1930-2006.jpg?camera_label=front",cl:["Black Heather","Green TriBlend","Navy TriBlend","Orange TriBlend","Red TriBlend"],sz:["S","M","L","XL","2XL"]},
  { id:"699235c60cffac1ee006d908",n:"Unisex Triblend Tee",s:"Premium Soft Space Tee",p:33.62,mx:39.45,c:"tees",b:"Premium",img:"https://images.printify.com/mockup/699235c60cffac1ee006d908/40711/109464/unisex-triblend-tee.jpg?camera_label=front",cl:["Red TriBlend","True Royal TriBlend"],sz:["S","M","L","XL","2XL"]},
  { id:"698455452ec1aca18f004d90",n:"Astronaut Graphic Hoodie",s:"Dark Sky Discovery Center Sweatshirt",p:20.62,mx:23.53,c:"hoodies",b:"Best Seller",img:"https://images.printify.com/mockup/698455452ec1aca18f004d90/32920/100682/astronaut-graphic-hoodie-dark-sky-discovery-center-space-sweatshirt.jpg?camera_label=person-4-back",cl:["Black","Dark Heather","Red","Sand","Navy","Royal"],sz:["S","M","L","XL","2XL","3XL","4XL","5XL"]},
  { id:"698ee636437d0b0f2c035525",n:"Pluto Never Forget Long Sleeve",s:"Retro Planet Tribute Shirt",p:21.78,mx:25.12,c:"longsleeve",b:null,img:"https://images.printify.com/mockup/698ee636437d0b0f2c035525/25076/103304/pluto-never-forget-long-sleeve-tee-retro-planet-tribute-shirt.jpg?camera_label=front",cl:["Black Heather","Heather Navy","True Royal","Red","White","Cardinal"],sz:["XS","S","M","L","XL","2XL"]},
  { id:"698eece53a2519c47c085552",n:"Astronomer Telescope Tank Top",s:"Science Lover Stargazing Tee",p:19.35,mx:22.37,c:"tanks",b:null,img:"https://images.printify.com/mockup/698eece53a2519c47c085552/24870/101889/astronomer-telescope-tank-top-science-lover-stargazing-tee.jpg?camera_label=front",cl:["Black","Navy","Red","Leaf","True Royal"],sz:["XS","S","M","L","XL","2XL"]},
  { id:"698458c2f242ef6d160392f3",n:"Women's Ideal Racerback Tank",s:"Discovery Center Series",p:9.93,mx:11.53,c:"tanks",b:null,img:"https://images.printify.com/mockup/698458c2f242ef6d160392f3/19334/111806/womens-ideal-racerback-tank.jpg?camera_label=front-2",cl:["Heather Grey","Solid Black","Solid Royal","Solid Red","Solid Midnight Navy","Solid Mint"],sz:["XS","S","M","L","XL","2XL"]},
  { id:"699331f0fb693388a30a9a04",n:"Youth UFO Abduction Cats Tee",s:"Cute Space Cats Graphic",p:15.45,mx:null,c:"youth",b:null,img:"https://images.printify.com/mockup/699331f0fb693388a30a9a04/61551/94623/youth-tee-cute-ufo-abduction-cats-graphic-t-shirt.jpg?camera_label=front",cl:["Natural","Dark Heather Grey","Pink","Heather Columbia Blue","Ash"],sz:["S","M","L","XL"]},
  { id:"6992656ba0b737bc6802cc8e",n:"Youth Rocket Rainbow Tee",s:"Kids Space Adventure Shirt",p:15.45,mx:null,c:"youth",b:"New",img:"https://images.printify.com/mockup/6992656ba0b737bc6802cc8e/64370/94623/youth-rocket-rainbow-tee-kids-space-adventure-short-sleeve-shirt.jpg?camera_label=front",cl:["Natural","Pink","Heather Columbia Blue","Ash","Berry","Gold"],sz:["S","M","L","XL"]},
  { id:"698eed5ce6f166ad2404a366",n:"Youth Astronomer Tee",s:"Stargazing Telescope Kids Shirt",p:15.45,mx:null,c:"youth",b:null,img:"https://images.printify.com/mockup/698eed5ce6f166ad2404a366/71283/94623/youth-astronomer-tee-stargazing-telescope-kids-shirt.jpg?camera_label=front",cl:["Natural","Pink","Heather Columbia Blue","Berry","Heather True Royal","Gold"],sz:["S","M","L","XL"]},
  { id:"6992325e2911a7a5e8045010",n:"Laika First Dog in Space Kids Tee",s:"Retro Space Dog Graphic",p:12.13,mx:null,c:"youth",b:null,img:"https://images.printify.com/mockup/6992325e2911a7a5e8045010/42772/105377/laika-first-dog-in-space-kids-tee-retro-space-dog-graphic-shirt.jpg?camera_label=front",cl:["Light Blue","White","Light Pink","Old Gold","Daisy"],sz:["XS","S","M","L","XL"]},
  { id:"698eee0b95ea998bfa0ab854",n:"Toddler Astronomer Tee",s:"Cute Space Telescope Kids Shirt",p:13.07,mx:null,c:"toddler",b:null,img:"https://images.printify.com/mockup/698eee0b95ea998bfa0ab854/79252/99201/toddler-astronomer-tee-cute-space-telescope-kids-shirt.jpg?camera_label=front",cl:["Heather Red","Pink","Yellow","Heather Mauve","Kelly"],sz:["2T","3T","4T","5T"]},
  { id:"69a7590bdec16f958407bd89",n:"Toddler Space Puppy Astronauts Tee",s:"Cute Space Pattern",p:13.07,mx:null,c:"toddler",b:"New",img:"https://images.printify.com/mockup/69a7590bdec16f958407bd89/74428/99201/copy-of-toddler-tee-cute-space-puppy-astronauts-pattern.jpg?camera_label=front",cl:["Black"],sz:["2T","3T","4T","5T"]},
  { id:"69a87ee86c3524ae5a094f79",n:"Infant Explore the Night Tee",s:"Baby Space Graphic",p:20.99,mx:null,c:"infant",b:null,img:"https://images.printify.com/mockup/69a87ee86c3524ae5a094f79/21660/102828/infant-tee-astronomy-explore-the-night-baby-space-graphic.jpg?camera_label=front",cl:["Red","White","Natural","Pink"],sz:["6M","12M","18M","24M"]},
  { id:"69a87dfe88ee39dcf2077fed",n:"Infant I Love You to the Moon Tee",s:"Telescope Baby Shirt",p:20.99,mx:null,c:"infant",b:"New",img:"https://images.printify.com/mockup/69a87dfe88ee39dcf2077fed/21660/102828/infant-tee-i-love-you-to-the-moon-telescope-baby-shirt.jpg?camera_label=front",cl:["Red","White","Butter","Mauvelous","Apple"],sz:["6M","12M","18M","24M"]},
  { id:"69839b7a2ec1aca18f002fc9",n:"Embroidered Crescent Arc Beanie",s:"Minimal Night Sky Knit Hat",p:13.93,mx:null,c:"accessories",b:null,img:"https://images.printify.com/mockup/69839b7a2ec1aca18f002fc9/116433/109382/embroidered-crescent-arc-cuffed-beanie-minimal-night-sky-knit-hat.jpg?camera_label=front",cl:["Black","Gold","Navy","Red","Royal","White"],sz:["One Size"]},
  { id:"699fa5591d09f9e64d0d2084",n:"Space Discovery EVA Foam Clogs",s:"Dark Sky Center Graphic Slip-Ons",p:11.04,mx:12.43,c:"accessories",b:null,img:"https://images.printify.com/mockup/699fa5591d09f9e64d0d2084/106592/102975/copy-of-space-discovery-eva-foam-clogs-dark-sky-center-graphic-slip-on-shoes.jpg?camera_label=front",cl:["Black","White"],sz:["US 6","US 7","US 8","US 9","US 10","US 11"]},
  { id:"69825ff40c4f7923f304b41b",n:"Galaxy Coconut Apricot Candle",s:"Scented Candle 4oz / 9oz",p:8.38,mx:null,c:"home",b:null,img:"https://images.printify.com/mockup/69825ff40c4f7923f304b41b/107587/104467/galaxy-coconut-apricot-scented-candle-4oz9oz.jpg?camera_label=context-3",cl:["Clear","Amber"],sz:["4oz","9oz"]},
  { id:"697f87d637ee881b0a06d739",n:"Desert Night Sky Fine Art Print",s:"Passepartout Paper Frame",p:7.09,mx:9.45,c:"prints",b:null,img:"https://images.printify.com/mockup/697f87d637ee881b0a06d739/78277/29344/desert-night-sky-fine-art-print-passepartout-paper-frame.jpg?camera_label=front",cl:["White"],sz:["11x14","14x11","20x16"]},
];

const CATS = [
  {id:"all",l:"All Items"},
  {id:"tees",l:"Tees"},
  {id:"hoodies",l:"Hoodies"},
  {id:"longsleeve",l:"Long Sleeve"},
  {id:"tanks",l:"Tanks"},
  {id:"youth",l:"Youth"},
  {id:"toddler",l:"Toddler"},
  {id:"infant",l:"Infant"},
  {id:"accessories",l:"Accessories"},
  {id:"home",l:"Home"},
  {id:"prints",l:"Prints"},
];

const CAT_CARDS = [
  { id:"tees",       label:"Graphic Tees",    desc:"Wear the cosmos",       count:11, img:"https://images.printify.com/mockup/699329afcec1eb89690701fa/100496/95837/astronomy-club-telescope-t-shirt-dark-sky-stargazing-retro-tee.jpg?camera_label=front" },
  { id:"hoodies",    label:"Hoodies & Fleece", desc:"Cozy darkness",         count:1,  img:"https://images.printify.com/mockup/698455452ec1aca18f004d90/32920/100682/astronaut-graphic-hoodie-dark-sky-discovery-center-space-sweatshirt.jpg?camera_label=person-4-back" },
  { id:"accessories",label:"Accessories",      desc:"Complete the look",     count:2,  img:"https://images.printify.com/mockup/69839b7a2ec1aca18f002fc9/116433/109382/embroidered-crescent-arc-cuffed-beanie-minimal-night-sky-knit-hat.jpg?camera_label=front" },
  { id:"home",       label:"Home & Gifts",     desc:"Ambient astronomy",     count:1,  img:"https://images.printify.com/mockup/69825ff40c4f7923f304b41b/107587/104467/galaxy-coconut-apricot-scented-candle-4oz9oz.jpg?camera_label=context-3" },
  { id:"prints",     label:"Fine Art Prints",  desc:"Gallery-worthy",        count:1,  img:"https://images.printify.com/mockup/697f87d637ee881b0a06d739/78277/29344/desert-night-sky-fine-art-print-passepartout-paper-frame.jpg?camera_label=front" },
  { id:"youth",      label:"Kids & Family",    desc:"Future astronomers",    count:6,  img:"https://images.printify.com/mockup/6992656ba0b737bc6802cc8e/64370/94623/youth-rocket-rainbow-tee-kids-space-adventure-short-sleeve-shirt.jpg?camera_label=front" },
];

/* ═══════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════ */
function useOnScreen(ref, threshold = 0.08) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVis(true); obs.unobserve(el); } },
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
      r: Math.random() * 1.6 + 0.3,
      a: Math.random() * 0.5 + 0.2,
      sp: Math.random() * 0.3 + 0.05,
      ph: Math.random() * Math.PI * 2,
      dp: Math.random() * 3 + 1,
    }));

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const mx = (mouse.current.x - 0.5) * 18;
      const my = (mouse.current.y - 0.5) * 10;
      const t = Date.now() * 0.001;
      for (const s of stars.current) {
        const px = ((s.x + mx * s.dp) % w + w) % w;
        const py = ((s.y + my * s.dp) % h + h) % h;
        const tw = Math.sin(t * s.sp + s.ph) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,215,240,${s.a * tw})`;
        ctx.fill();
      }
      if (Math.random() < 0.004 && shoots.current.length < 2) {
        shoots.current.push({
          x: Math.random() * w * 0.8, y: Math.random() * h * 0.3,
          len: Math.random() * 70 + 40, sp: Math.random() * 7 + 5,
          ang: Math.PI / 4 + Math.random() * 0.3, life: 1,
        });
      }
      shoots.current = shoots.current.filter(ss => {
        ss.x += Math.cos(ss.ang) * ss.sp;
        ss.y += Math.sin(ss.ang) * ss.sp;
        ss.life -= 0.018;
        if (ss.life <= 0) return false;
        const g = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - Math.cos(ss.ang) * ss.len, ss.y - Math.sin(ss.ang) * ss.len
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
      style={{ position:"fixed", inset:0, width:"100%", height:"100%", zIndex:0, pointerEvents:"none" }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   FADE-UP WRAPPER
   ═══════════════════════════════════════════════════════════ */
function FU({ children, delay = 0, style, className = "" }) {
  const ref = useRef(null);
  const vis = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={`fu ${vis ? "fu-v" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CATEGORY CARD
   ═══════════════════════════════════════════════════════════ */
function CatCard({ card, idx, onSelect }) {
  const ref = useRef(null);
  const vis = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={`cc ${vis ? "cc-v" : ""}`}
      style={{ transitionDelay: `${idx * 100}ms` }}
      onClick={() => onSelect(card.id)}
    >
      <div className="cc-info">
        <div>
          <div className="cc-name">{card.label}</div>
          <div className="cc-cnt">{card.count} items</div>
        </div>
        <div className="cc-arr">&#8594;</div>
      </div>
      <div className="cc-img">
        <img src={card.img} alt={card.label} loading="lazy" />
        <div className="cc-img-fade" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD
   ═══════════════════════════════════════════════════════════ */
function Card({ p, i, onOpen, onQA }) {
  const ref = useRef(null);
  const vis = useOnScreen(ref);
  const pr = p.mx && p.mx !== p.p
    ? `$${p.p.toFixed(2)} – $${p.mx.toFixed(2)}`
    : `$${p.p.toFixed(2)}`;

  return (
    <div
      ref={ref}
      className={`pc ${vis ? "pc-v" : ""}`}
      style={{ transitionDelay: `${(i % 4) * 80}ms` }}
      onClick={() => onOpen(p)}
    >
      {p.b && <div className="pc-badge">{p.b}</div>}
      <div className="pc-img">
        <img src={p.img} alt={p.n} loading="lazy" />
        <div className="pc-glow" />
        <div className="pc-ov">
          <button className="pc-qa" onClick={(e) => { e.stopPropagation(); onQA(p); }}>
            Quick Add
          </button>
        </div>
      </div>
      <div className="pc-info">
        <div className="pc-name">{p.n}</div>
        <div className="pc-sub">{p.s}</div>
        <div className="pc-bot">
          <div className="pc-pr">{pr}</div>
          {p.cl.length > 1 && <div className="pc-cl">{p.cl.length} colors</div>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN STORE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function DarkSkyStore() {
  const [cat, setCat]         = useState("all");
  const [cart, setCart]       = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sel, setSel]         = useState(null);
  const [sz, setSz]           = useState(null);
  const [cl, setCl]           = useState(null);
  const [added, setAdded]     = useState(false);
  const [toast, setToast]     = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen]   = useState(false);
  const [activeVid, setActiveVid] = useState(0);

  const heroRef = useRef(null);
  const heroVis = useOnScreen(heroRef, 0.01);
  const vidRefs = useRef([null, null, null, null]);

  // Scroll listener for nav
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Video cycling every 8s
  useEffect(() => {
    vidRefs.current.forEach(v => { if (v) v.play().catch(() => {}); });
    const id = setInterval(() => setActiveVid(v => (v + 1) % 4), 8000);
    return () => clearInterval(id);
  }, []);

  // Lock scroll when modals are open
  useEffect(() => {
    document.body.style.overflow = (sel || cartOpen || mobOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sel, cartOpen, mobOpen]);

  const filtered = cat === "all" ? P : P.filter(x => x.c === cat);
  const cc = cart.reduce((a, i) => a + i.qty, 0);
  const ct = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const counts = useMemo(() => {
    const r = { all: P.length };
    P.forEach(x => { r[x.c] = (r[x.c] || 0) + 1; });
    return r;
  }, []);

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

  const handleCatSelect = (id) => {
    setCat(id);
    setMobOpen(false);
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ds-root">
        <Stars />

        {/* ── NAV ── */}
        <nav className={`nv${scrolled ? " scrolled" : ""}`}>
          <div className="nv-b">
            <div className="nv-logo">DS</div>
            <div className="nv-txt">
              <small>INTERNATIONAL</small>
              Dark Sky Discovery Center
            </div>
          </div>
          <div className="nv-lnk">
            {["About","Exhibits","Events","Membership","Gallery"].map(l => (
              <a key={l}>{l}</a>
            ))}
            <a className="nv-ac">Shop</a>
          </div>
          <div className="nv-r">
            <button className="nv-cart" onClick={() => setCartOpen(true)} aria-label="Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cc > 0 && <span className="nv-badge">{cc}</span>}
            </button>
            <button className="nv-cta">Get Tickets</button>
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
          <button className="nv-mob-cta" onClick={() => setMobOpen(false)}>Get Tickets</button>
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
          <div className="hero-ov" />
          <div className={`hero-in${heroVis ? " hero-vis" : ""}`}>
            <p className="hero-tag">Take the Night Home</p>
            <h1 className="hero-h1">Gift Shop</h1>
            <p className="hero-sub">A piece of the night sky, wherever you are</p>
            <div className="hero-pill">
              <span style={{fontSize:14}}>✦</span>
              Members enjoy exclusive discounts
            </div>
          </div>
          <div className="hero-scroll">
            <div className="hero-scroll-arr" />
          </div>
        </section>

        {/* ── CATEGORY SECTION ── */}
        <section style={{ position:"relative", zIndex:1 }}>
          <FU style={{ textAlign:"center", padding:"88px 48px 52px" }}>
            <p className="sec-lbl">Explore the Collection</p>
            <h2 className="sec-ttl">Find Your <em>Constellation</em></h2>
            <div className="sec-ln" />
          </FU>
          <div className="cats-w">
            <div className="cats-grid">
              {CAT_CARDS.map((card, i) => (
                <CatCard key={card.id} card={card} idx={i} onSelect={handleCatSelect} />
              ))}
            </div>
          </div>
        </section>

        {/* ── VIDEO DIVIDER ── */}
        <div className="vdiv">
          <video autoPlay muted loop playsInline preload="metadata">
            <source src="/videos/hero2.mp4" type="video/mp4" />
          </video>
          <div className="vdiv-ov" />
          <div className="vdiv-txt">
            <FU delay={0}>
              <p className="vdiv-lbl">Preserve the Darkness</p>
            </FU>
            <FU delay={120}>
              <h2 className="vdiv-ttl">Explore the <em>Night</em></h2>
            </FU>
          </div>
        </div>

        {/* ── COLLECTION SECTION ── */}
        <div id="collection">
          <FU style={{ textAlign:"center", padding:"88px 48px 52px" }}>
            <div className="col-ln" />
            <h2 className="col-ttl">The Collection</h2>
            <p className="col-sub">Every purchase supports dark sky preservation</p>
          </FU>

          {/* Filter pills */}
          <div className="flt">
            {CATS.map(x => (
              <button
                key={x.id}
                className={`fb${cat === x.id ? " fb-a" : ""}`}
                onClick={() => setCat(x.id)}
              >
                {x.l}
                <span className="fb-n">{counts[x.id] || 0}</span>
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grd">
            {filtered.map((p, i) => (
              <Card
                key={p.id}
                p={p}
                i={i}
                onOpen={openP}
                onQA={(p) => add(p, p.sz[0], p.cl[0])}
              />
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <FU>
          <footer className="foot">
            <div className="foot-ln" />
            <p className="foot-b">International Dark Sky Discovery Center</p>
            <p className="foot-s">Powered by MuseumOS by Create &amp; Source</p>
            <p className="foot-t">Secured by Square &middot; Fulfilled by Printify</p>
          </footer>
        </FU>

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
                      <button
                        key={s}
                        className={sz === s ? "m-sel" : ""}
                        onClick={() => setSz(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="m-grp">
                  <label>Color</label>
                  <div className="m-opts">
                    {sel.cl.map(c => (
                      <button
                        key={c}
                        className={cl === c ? "m-sel" : ""}
                        onClick={() => setCl(c)}
                      >
                        {c}
                      </button>
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
                <button onClick={() => setCartOpen(false)}>&#x2715;</button>
              </div>
              <div className="dr-bd">
                {cart.length === 0 ? (
                  <div className="dr-mt">
                    <div className="dr-mi">&#9790;</div>
                    <p>Your cart is empty</p>
                    <p style={{ fontSize:12, marginTop:8, opacity:.5 }}>
                      Take a piece of the night sky home
                    </p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.key} className="ci">
                      <div className="ci-im">
                        <img src={item.img} alt={item.name} />
                      </div>
                      <div className="ci-in">
                        <div className="ci-nm">{item.name}</div>
                        <div className="ci-vr">{item.size} &middot; {item.color}</div>
                        <div className="ci-ac">
                          <button onClick={() => setCart(pr => pr.map(x => x.key === item.key ? { ...x, qty: x.qty - 1 } : x).filter(x => x.qty > 0))}>
                            &minus;
                          </button>
                          <span>{item.qty}</span>
                          <button onClick={() => setCart(pr => pr.map(x => x.key === item.key ? { ...x, qty: x.qty + 1 } : x))}>
                            +
                          </button>
                          <button className="ci-rm" onClick={() => setCart(pr => pr.filter(x => x.key !== item.key))}>
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="ci-pr">${(item.price * item.qty).toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="dr-ft">
                  <div className="dr-tl">
                    <span>Total</span>
                    <span>${ct.toFixed(2)}</span>
                  </div>
                  <button className="dr-co">Proceed to Checkout &rarr;</button>
                  <p className="dr-nt">Sign in to apply member discount</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TOAST ── */}
        <div className={`tst${toast ? " tst-s" : ""}`}>{toast}</div>
      </div>
    </>
  );
}
