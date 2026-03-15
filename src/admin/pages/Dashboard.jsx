import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HelpBubble from '../components/HelpBubble';
import { useToast, useRole } from '../AdminLayout';
import {
  getOrders, getInventory, getMembers, getEvents,
  getStockStatus, formatPrice, subscribe,
  getPurchaseOrders, getTransfers,
  getSmartTransferSuggestions, getPredictiveAlerts, addTransfer, addPurchaseOrder,
} from '../data/store';

// ── Design Tokens ──
const C = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  border: '#E8E5DF',
  sidebar: '#1A1A2E',
  gold: '#C5A55A',
  text: '#1A1A2E',
  text2: '#7C7B76',
  muted: '#B5B3AD',
  success: '#3D8C6F',
  warning: '#D4943A',
  danger: '#C45B5B',
  shadow: '0 1px 3px rgba(0,0,0,0.04)',
  shadowHover: '0 4px 12px rgba(0,0,0,0.07)',
};

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";

// ── Helpers ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTodayDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const then = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

// ── Count-Up Animation Hook ──
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current);
    const start = performance.now();
    const from = 0;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);

  return value;
}

// ── Sparkline Component ──
function Sparkline({ data, color = C.gold, width = 64, height = 28 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const fillPoints = `0,${height} ${points.join(' ')} ${width},${height}`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polygon points={fillPoints} fill={color} fillOpacity="0.08" />
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Mini Donut Chart ──
function DonutChart({ segments, size = 120, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dashLength = pct * circumference;
        const currentOffset = offset;
        offset += dashLength;
        return (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={seg.color} strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease, stroke-dashoffset 1s ease' }}
          />
        );
      })}
    </svg>
  );
}

// ── Revenue Line Chart ──
function RevenueChart({ data, period }) {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const chartH = 220;
  const padX = 48;
  const padY = 24;

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth;
    canvas.width = w * dpr;
    canvas.height = chartH * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = chartH + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, chartH);

    const values = data.map(d => d.value);
    const max = Math.max(...values, 1);
    const plotW = w - padX * 2;
    const plotH = chartH - padY * 2;

    // Grid lines
    ctx.strokeStyle = '#F0EEEA';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padY + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(w - padX, y);
      ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = C.muted;
    ctx.font = `11px ${FONT}`;
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = max - (max / 4) * i;
      const y = padY + (plotH / 4) * i;
      ctx.fillText('$' + Math.round(val / 100), padX - 8, y + 4);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    const labelStep = Math.max(1, Math.floor(data.length / 6));
    data.forEach((d, idx) => {
      if (idx % labelStep === 0 || idx === data.length - 1) {
        const x = padX + (idx / (data.length - 1)) * plotW;
        ctx.fillText(d.label, x, chartH - 4);
      }
    });

    // Line + fill
    const getPoint = (idx) => ({
      x: padX + (idx / (data.length - 1)) * plotW,
      y: padY + plotH - (values[idx] / max) * plotH,
    });

    // Fill gradient
    const grad = ctx.createLinearGradient(0, padY, 0, padY + plotH);
    grad.addColorStop(0, 'rgba(197, 165, 90, 0.12)');
    grad.addColorStop(1, 'rgba(197, 165, 90, 0)');

    ctx.beginPath();
    ctx.moveTo(getPoint(0).x, padY + plotH);
    for (let i = 0; i < data.length; i++) {
      const p = getPoint(i);
      if (i === 0) { ctx.lineTo(p.x, p.y); continue; }
      const prev = getPoint(i - 1);
      const cpx1 = prev.x + (p.x - prev.x) * 0.4;
      const cpx2 = prev.x + (p.x - prev.x) * 0.6;
      ctx.bezierCurveTo(cpx1, prev.y, cpx2, p.y, p.x, p.y);
    }
    ctx.lineTo(getPoint(data.length - 1).x, padY + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const p = getPoint(i);
      if (i === 0) { ctx.moveTo(p.x, p.y); continue; }
      const prev = getPoint(i - 1);
      const cpx1 = prev.x + (p.x - prev.x) * 0.4;
      const cpx2 = prev.x + (p.x - prev.x) * 0.6;
      ctx.bezierCurveTo(cpx1, prev.y, cpx2, p.y, p.x, p.y);
    }
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [data, period]);

  const handleMouseMove = useCallback((e) => {
    if (!data.length) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const plotW = rect.width - padX * 2;
    const idx = Math.round(((mx - padX) / plotW) * (data.length - 1));
    if (idx >= 0 && idx < data.length) {
      setTooltip({ x: padX + (idx / (data.length - 1)) * plotW, label: data[idx].label, value: data[idx].value });
    }
  }, [data]);

  return (
    <div style={{ position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: chartH, display: 'block' }} />
      {tooltip && (
        <>
          <div style={{
            position: 'absolute', top: padY, left: tooltip.x, width: 1, height: chartH - padY * 2,
            background: C.border, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: 8, left: tooltip.x, transform: 'translateX(-50%)',
            background: C.sidebar, color: '#fff', padding: '6px 12px', borderRadius: 8,
            font: `500 12px ${FONT}`, whiteSpace: 'nowrap', pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            {tooltip.label}: {formatPrice(tooltip.value)}
          </div>
        </>
      )}
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, value, detail, detailColor, sparkData, prefix = '', suffix = '', isCurrency = false, delay = 0 }) {
  const displayVal = useCountUp(typeof value === 'number' ? value : 0, 800);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const formattedVal = isCurrency ? formatPrice(displayVal) : `${prefix}${displayVal.toLocaleString()}${suffix}`;

  return (
    <div className="ds-stat-card" style={{
      ...cardBase,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={labelStyle}>{label}</div>
          <div style={{
            fontFamily: FONT, fontSize: 32, fontWeight: 600, color: C.text,
            letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"',
            lineHeight: 1.1, marginTop: 8,
          }}>
            {formattedVal}
          </div>
          {detail && (
            <div style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 400, color: detailColor || C.text2,
              marginTop: 6,
            }}>
              {detail}
            </div>
          )}
        </div>
        {sparkData && (
          <div style={{ marginTop: 4 }}>
            <Sparkline data={sparkData} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared Styles ──
const cardBase = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: 20,
  boxShadow: C.shadow,
};

const labelStyle = {
  fontFamily: FONT,
  fontSize: 12,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: C.text2,
};

// ── Icons (Lucide-inspired, clean line) ──
const Icon = {
  receive: (c = C.text2) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  calendar: (c = C.text2) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  mail: (c = C.text2) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>,
  chart: (c = C.text2) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  cart: (c = C.text2) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  transfer: (c = C.text2) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  package: (c = C.text2) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  user: (c = C.text2) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  alert: (c = C.warning) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  clock: (c = C.text2) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  phone: (c = C.danger) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  wifi: (c = C.success) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  inventory: (c = C.text2) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  zap: (c = C.warning) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
};

// ── Attention Card (redesigned) ──
function AttentionCard({ card, navigate, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const colorMap = {
    gold: C.gold, amber: C.warning, red: C.danger, blue: '#4A7FBF', green: C.success, purple: '#7C6BAF',
  };
  const borderColor = colorMap[card.urgency] || card.color || C.gold;

  return (
    <div className="ds-attention-card" style={{
      ...cardBase,
      borderLeft: `3px solid ${borderColor}`,
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(6px)',
      transition: 'all 0.4s ease, box-shadow 0.2s ease, transform 0.2s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = C.shadowHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = C.shadow; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: borderColor + '10',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} className="ds-attention-icon">
        {card.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ds-attention-title" style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 1 }}>{card.title}</div>
        <div className="ds-attention-desc" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.text2, wordBreak: 'break-word' }}>{card.description}</div>
      </div>
      <button
        className="ds-attention-btn"
        onClick={() => navigate(card.to)}
        style={{
          height: 34, padding: '0 16px', background: borderColor + '12',
          color: borderColor, border: `1px solid ${borderColor}30`,
          borderRadius: 7, fontFamily: FONT, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.target.style.background = borderColor + '22'; }}
        onMouseLeave={e => { e.target.style.background = borderColor + '12'; }}
      >
        {card.button}
      </button>
    </div>
  );
}

// ── Quick Action Button ──
function QuickAction({ icon, label, onClick, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardBase,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 10, cursor: 'pointer',
        height: 100,
        transition: 'all 0.2s ease',
        transform: visible
          ? hovered ? 'translateY(-2px) scale(1)' : 'translateY(0) scale(1)'
          : 'translateY(8px) scale(0.98)',
        opacity: visible ? 1 : 0,
        boxShadow: hovered ? C.shadowHover : C.shadow,
        borderColor: hovered ? C.gold : C.border,
        borderBottom: hovered ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
      }}
    >
      <div style={{ color: hovered ? C.gold : C.text2, transition: 'color 0.2s' }}>
        {typeof icon === 'function' ? icon(hovered ? C.gold : C.text2) : icon}
      </div>
      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: C.text }}>{label}</span>
    </button>
  );
}

// ── Period Tab Switcher ──
function PeriodTabs({ tabs, active, onChange }) {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef({});

  useEffect(() => {
    const el = tabRefs.current[active];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [active]);

  return (
    <div style={{ display: 'flex', position: 'relative', gap: 0, background: '#F5F4F0', borderRadius: 8, padding: 3 }}>
      <div style={{
        position: 'absolute', top: 3, height: 'calc(100% - 6px)',
        background: C.card, borderRadius: 6,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...indicatorStyle,
      }} />
      {tabs.map(tab => (
        <button
          key={tab.value}
          ref={el => { tabRefs.current[tab.value] = el; }}
          onClick={() => onChange(tab.value)}
          style={{
            position: 'relative', zIndex: 1,
            padding: '6px 14px', background: 'transparent', border: 'none',
            fontFamily: FONT, fontSize: 12, fontWeight: active === tab.value ? 600 : 400,
            color: active === tab.value ? C.text : C.text2,
            cursor: 'pointer', transition: 'color 0.2s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Generate revenue chart data from orders ──
function generateRevenueData(orders, days) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter(o => o.date === dateStr);
    const revenue = dayOrders.reduce((s, o) => s + (o.total || 0), 0);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    result.push({ label, value: revenue, date: dateStr });
  }
  return result;
}

// ════════════════════════════════════════════
// VOLUNTEER DASHBOARD
// ════════════════════════════════════════════
function VolunteerDashboard() {
  const navigate = useNavigate();
  const events = getEvents();
  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter(e => e.date === today && e.status === 'Published');
  const inventory = getInventory();
  const totalItems = inventory.reduce((s, i) => (i.giftshop || 0) + (i.warehouse || 0) + s, 0);

  const [greetVisible, setGreetVisible] = useState(false);
  useEffect(() => { setTimeout(() => setGreetVisible(true), 50); }, []);

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Greeting */}
      <div style={{
        paddingTop: 8, marginBottom: 32,
        opacity: greetVisible ? 1 : 0,
        transform: greetVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
      }}>
        <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, color: C.text, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          Welcome! Here's what you need to know today
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.text2, margin: 0 }}>
          {formatTodayDate()}
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 32 }}>
        <div style={labelStyle}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 12 }} className="ds-quick-actions">
          <QuickAction icon={Icon.inventory} label="Check Inventory" onClick={() => navigate('/admin/inventory')} delay={200} />
          <QuickAction icon={Icon.calendar} label="View Events" onClick={() => document.getElementById('vol-events')?.scrollIntoView({ behavior: 'smooth' })} delay={300} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }} className="ds-stats">
        <StatCard label="Events Today" value={todayEvents.length} detail={todayEvents.length > 0 ? todayEvents[0].title : 'No events scheduled'} delay={300} />
        <StatCard label="Gift Shop Status" value={totalItems} suffix=" items" detail="Total inventory in stock" delay={400} />
      </div>

      {/* Today's Events */}
      <div id="vol-events" style={{ marginBottom: 32 }}>
        <div style={labelStyle}>Today's Events</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {todayEvents.length === 0 ? (
            <div style={{ ...cardBase, textAlign: 'center', color: C.muted, fontFamily: FONT, fontSize: 14, padding: 32 }}>
              No events scheduled for today
            </div>
          ) : todayEvents.map(e => (
            <div key={e.id} style={{
              ...cardBase, borderLeft: `3px solid #7C6BAF`,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                background: 'rgba(124,107,175,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: 12, fontWeight: 600, color: '#7C6BAF',
              }}>
                {e.time || '7pm'}
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.text }}>{e.title}</div>
                <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 400, color: C.text2 }}>
                  {e.capacity ? `${e.ticketsSold || 0}/${e.capacity} registered` : 'Open attendance'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Reference */}
      <div style={{ marginBottom: 32 }}>
        <div style={labelStyle}>Quick Reference</div>
        <div style={{ ...cardBase, marginTop: 12, padding: 0 }}>
          {[
            { icon: Icon.clock(C.gold), label: 'Gift Shop Hours', value: '10:00 AM – 6:00 PM, Mon – Sat' },
            { icon: Icon.user('#7C6BAF'), label: 'Membership Questions', value: 'Direct to darkskycenter.org/membership' },
            { icon: Icon.phone(), label: 'Emergency Contact', value: 'Nancy (Manager) — (928) 555-0142' },
            { icon: Icon.wifi(), label: 'WiFi Password', value: <span>IDSDC-Guest / <span style={{ fontFamily: MONO, fontSize: 12 }}>DarkSky2026!</span></span> },
          ].map((item, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: C.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</div>
                <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 400, color: C.text2 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Prompt */}
      <div style={{
        ...cardBase, marginBottom: 32,
        background: `linear-gradient(135deg, ${C.gold}08, ${C.gold}03)`,
        border: `1px solid ${C.gold}25`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: `${C.gold}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT, fontSize: 20, fontWeight: 600, color: C.gold,
        }}>?</div>
        <div>
          <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 2 }}>
            Need help with anything?
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.text2 }}>
            Click the gold chat bubble in the bottom-right corner to ask the Dark Sky Assistant.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ds-quick-actions { grid-template-columns: 1fr !important; }
          .ds-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════
// STAFF DASHBOARD (Josie)
// ════════════════════════════════════════════
function StaffDashboard() {
  const navigate = useNavigate();
  const orders = getOrders();
  const inventory = getInventory();
  const purchaseOrders = getPurchaseOrders();
  const transfers = getTransfers();
  const today = new Date().toISOString().slice(0, 10);

  const processingOrders = orders.filter(o => o.status === 'Processing');
  const shippedPOs = purchaseOrders.filter(po => po.status === 'Shipped');
  const pendingTransfers = transfers.filter(t => t.status === 'In Transit' || t.status === 'Pending');

  const lowStockGiftShop = inventory.filter(i => {
    const gsQty = i.giftshop ?? 0;
    return gsQty > 0 && gsQty <= (i.reorderPoint || 5);
  });

  const [greetVisible, setGreetVisible] = useState(false);
  useEffect(() => { setTimeout(() => setGreetVisible(true), 50); }, []);

  // Attention cards — no revenue info
  const attentionCards = [];
  if (processingOrders.length > 0) {
    attentionCards.push({
      color: '#4A7FBF', urgency: 'blue',
      icon: Icon.cart('#4A7FBF'),
      title: `${processingOrders.length} order${processingOrders.length !== 1 ? 's' : ''} to review`,
      description: processingOrders.map(o => o.id).join(', '),
      button: 'Review', to: '/admin/orders',
    });
  }
  shippedPOs.forEach(po => {
    attentionCards.push({
      color: C.success, urgency: 'green',
      icon: Icon.package(C.success),
      title: `Shipment ${po.expectedDate === today ? 'arriving today' : 'en route'} — ${po.id}`,
      description: po.expectedDate ? `Expected ${po.expectedDate}` : 'In transit',
      button: 'Receive', to: '/admin/receive',
    });
  });

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Greeting */}
      <div style={{
        paddingTop: 8, marginBottom: 32,
        opacity: greetVisible ? 1 : 0, transform: greetVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
      }}>
        <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          {getGreeting()}, Josie — here's your day
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.text2, margin: 0 }}>
          {formatTodayDate()}
        </p>
      </div>

      {/* Attention */}
      {attentionCards.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>Needs Attention</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {attentionCards.map((card, i) => <AttentionCard key={i} card={card} navigate={navigate} delay={100 + i * 100} />)}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="ds-quick-actions">
          <QuickAction icon={Icon.receive} label="Receive Shipment" onClick={() => navigate('/admin/receive')} delay={200} />
          <QuickAction icon={Icon.inventory} label="Check Inventory" onClick={() => navigate('/admin/inventory')} delay={300} />
          <QuickAction icon={(c) => Icon.cart(c)} label="View Orders" onClick={() => navigate('/admin/orders')} delay={400} />
        </div>
      </div>

      {/* Stats — no revenue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }} className="ds-stats">
        <StatCard label="Orders Today" value={orders.filter(o => o.date === today).length} detail="order count only" delay={300} />
        <StatCard label="Low Stock Items" value={lowStockGiftShop.length} detail={`${lowStockGiftShop.filter(i => (i.giftshop ?? 0) === 0).length} out of stock`} detailColor={lowStockGiftShop.length > 0 ? C.warning : undefined} delay={400} />
        <StatCard label="Pending Transfers" value={pendingTransfers.length} detail="in transit or pending" delay={500} />
      </div>

      {/* Today's Checklist */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>Today's Checklist</div>
        <div style={{ ...cardBase, padding: 0 }}>
          {[
            { num: '1', label: 'Open register' },
            { num: '2', label: 'Check low stock alerts' },
            { num: '3', label: 'Review online orders for pickup' },
            { num: '4', label: 'Restock displays from back' },
          ].map((task, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
              borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: `${C.gold}12`, border: `1px solid ${C.gold}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: 11, fontWeight: 600, color: C.gold,
              }}>
                {task.num}
              </div>
              <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.text }}>{task.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock */}
      {lowStockGiftShop.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={labelStyle}>Low Stock — Gift Shop</div>
            <HelpBubble text="These items are running low on the gift shop floor. Let a manager know if you need a transfer from the warehouse." />
          </div>
          <div style={{ ...cardBase, padding: 0 }}>
            {lowStockGiftShop.slice(0, 6).map((item, i, arr) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                borderBottom: i < Math.min(arr.length, 6) - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: (item.giftshop ?? 0) === 0 ? C.danger : C.warning,
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.text }}>{item.name}</span>
                  {item.variant && <span style={{ fontFamily: FONT, fontSize: 13, color: C.muted, marginLeft: 8 }}>{item.variant}</span>}
                </div>
                <span style={{
                  fontFamily: MONO, fontSize: 13, fontWeight: 600,
                  color: (item.giftshop ?? 0) === 0 ? C.danger : C.warning,
                }}>
                  {(item.giftshop ?? 0) === 0 ? 'Out' : `${item.giftshop} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .ds-quick-actions { grid-template-columns: repeat(2, 1fr) !important; }
          .ds-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════
// MANAGER DASHBOARD (full access)
// ════════════════════════════════════════════
function ManagerDashboard() {
  const navigate = useNavigate();
  const addToast = useToast();
  const orders = getOrders();
  const inventory = getInventory();
  const members = getMembers();
  const events = getEvents();
  const purchaseOrders = getPurchaseOrders();
  const transfers = getTransfers();

  const today = new Date().toISOString().slice(0, 10);
  const [chartPeriod, setChartPeriod] = useState(30);
  const [showAllAttention, setShowAllAttention] = useState(false);
  const [greetVisible, setGreetVisible] = useState(false);
  useEffect(() => { setTimeout(() => setGreetVisible(true), 50); }, []);

  // ── Computed Data ──
  const processingOrders = orders.filter(o => o.status === 'Processing');
  const shippedPOs = purchaseOrders.filter(po => po.status === 'Shipped');
  const lowStockItems = inventory.filter(i => {
    const s = getStockStatus(i);
    return s === 'low' || s === 'out';
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDayStr = thirtyDaysAgo.toISOString().slice(0, 10);
  const last30Orders = orders.filter(o => o.date >= thirtyDayStr);
  const revenue30 = last30Orders.reduce((s, o) => s + (o.total || 0), 0);
  const avgOrderValue = last30Orders.length > 0 ? Math.round(revenue30 / last30Orders.length) : 0;

  const upcomingEvents = events.filter(e => e.date >= today && e.status === 'Published');
  const nextEvent = upcomingEvents.sort((a, b) => a.date.localeCompare(b.date))[0];
  const lowTicketEvents = upcomingEvents.filter(e => e.capacity && e.ticketsSold < e.capacity * 0.5);

  const totalInventory = inventory.reduce((s, i) => (i.giftshop || 0) + (i.warehouse || 0) + s, 0);

  // Revenue by channel
  const onlineRevenue = last30Orders.filter(o => o.channel !== 'POS').reduce((s, o) => s + (o.total || 0), 0);
  const posRevenue = last30Orders.filter(o => o.channel === 'POS').reduce((s, o) => s + (o.total || 0), 0);
  const eventRevenue = Math.round(revenue30 * 0.17); // approximate

  // Sparkline data (daily revenue last 14 days)
  const sparkDays = 14;
  const sparkData = [];
  for (let i = sparkDays - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    sparkData.push(orders.filter(o => o.date === ds).reduce((s, o) => s + (o.total || 0), 0));
  }

  // Top products
  const productSales = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const key = item.name || item.title || 'Unknown';
      if (!productSales[key]) productSales[key] = { name: key, units: 0, revenue: 0 };
      productSales[key].units += item.qty || 1;
      productSales[key].revenue += (item.price || 0) * (item.qty || 1);
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxProductRevenue = topProducts.length > 0 ? topProducts[0].revenue : 1;

  // Activity feed
  const activityItems = [];
  orders.slice(0, 12).forEach(o => {
    activityItems.push({
      type: 'order', date: o.date,
      text: `${o.channel === 'POS' ? 'POS' : 'Online'} order ${o.id} — ${formatPrice(o.total)}`,
      icon: 'order',
    });
  });
  transfers.slice(0, 6).forEach(t => {
    const verb = t.status === 'Received' ? 'received at' : t.status === 'In Transit' ? 'shipped to' : 'created for';
    activityItems.push({ type: 'transfer', date: t.receivedDate || t.shippedDate || t.createdDate, text: `Transfer ${t.id} ${verb} ${t.to}`, icon: 'transfer' });
  });
  events.filter(e => e.date >= today).slice(0, 3).forEach(e => {
    activityItems.push({ type: 'event', date: e.date, text: `${e.title} — ${e.ticketsSold || 0} tickets sold`, icon: 'event' });
  });
  members.slice(0, 3).forEach(m => {
    activityItems.push({ type: 'member', date: m.joinDate, text: `${m.name} joined as ${m.tier} member`, icon: 'member' });
  });
  activityItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const recentActivity = activityItems.slice(0, 8);

  // Attention cards
  const attentionCards = [];
  if (processingOrders.length > 0) {
    attentionCards.push({
      urgency: 'blue', icon: Icon.cart('#4A7FBF'),
      title: `${processingOrders.length} order${processingOrders.length !== 1 ? 's' : ''} waiting for review`,
      description: processingOrders.map(o => o.id).join(', '),
      button: 'Review Orders', to: '/admin/orders',
    });
  }
  shippedPOs.forEach(po => {
    attentionCards.push({
      urgency: 'amber', icon: Icon.package(C.warning),
      title: `Shipment arriving — ${po.id}`,
      description: po.expectedDate ? `Expected ${po.expectedDate} from ${po.vendor}` : 'In transit',
      button: 'Receive', to: '/admin/receive',
    });
  });
  if (lowStockItems.length > 0) {
    attentionCards.push({
      urgency: 'red', icon: Icon.alert(),
      title: `${lowStockItems.length} product${lowStockItems.length !== 1 ? 's' : ''} running low`,
      description: lowStockItems.slice(0, 3).map(i => i.name).join(', ') + (lowStockItems.length > 3 ? ` +${lowStockItems.length - 3} more` : ''),
      button: 'Restock', to: '/admin/inventory',
    });
  }
  lowTicketEvents.forEach(e => {
    attentionCards.push({
      urgency: 'gold', icon: Icon.calendar(C.gold),
      title: `${e.title} — ${e.ticketsSold}/${e.capacity} tickets`,
      description: `${e.capacity - e.ticketsSold} spots still open`,
      button: 'View Event', to: '/admin/events',
    });
  });

  const transferSuggestions = getSmartTransferSuggestions();
  const predictiveAlerts = getPredictiveAlerts();
  const chartData = generateRevenueData(orders, chartPeriod);

  // Channel donut
  const channelSegments = [
    { label: 'Online', value: onlineRevenue, color: C.gold },
    { label: 'POS', value: posRevenue, color: C.sidebar },
    { label: 'Events', value: eventRevenue, color: C.success },
  ];
  const channelTotal = channelSegments.reduce((s, seg) => s + seg.value, 0);

  const visibleAttention = showAllAttention ? attentionCards : attentionCards.slice(0, 4);

  // Member tier breakdown
  const tierCounts = {};
  members.forEach(m => { tierCounts[m.tier] = (tierCounts[m.tier] || 0) + 1; });

  return (
    <div>
      {/* Greeting */}
      <div className="ds-greeting" style={{
        paddingTop: 8, marginBottom: 32,
        opacity: greetVisible ? 1 : 0, transform: greetVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
          <h1 className="ds-greeting-heading" style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, color: C.text, letterSpacing: '-0.02em', margin: 0, flex: 1, minWidth: 0 }}>
            {getGreeting()}, Tovah
          </h1>
          <span className="ds-greeting-date" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.text2, whiteSpace: 'nowrap' }}>
            {formatTodayDate()}
          </span>
        </div>
        <div className="ds-greeting-login" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: C.muted, marginTop: 4 }}>
          Last login: 2 hours ago
        </div>
      </div>

      {/* Attention Cards */}
      {attentionCards.length > 0 && (
        <div className="ds-attention-section" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={labelStyle}>Needs Attention</div>
            <HelpBubble text="Tasks that may need action soon. Updates automatically based on orders, inventory, and events." />
          </div>
          <div className="ds-attention-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visibleAttention.map((card, i) => <AttentionCard key={i} card={card} navigate={navigate} delay={100 + i * 100} />)}
          </div>
          {attentionCards.length > 4 && (
            <button
              onClick={() => setShowAllAttention(!showAllAttention)}
              style={{
                marginTop: 8, background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: FONT, fontSize: 13, fontWeight: 500, color: C.gold,
                padding: '4px 0',
              }}
            >
              {showAllAttention ? 'Show less' : `Show ${attentionCards.length - 4} more`}
            </button>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="ds-section" style={{ marginBottom: 32 }}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="ds-quick-actions">
          <QuickAction icon={Icon.receive} label="Receive Shipment" onClick={() => navigate('/admin/receive')} delay={200} />
          <QuickAction icon={Icon.calendar} label="Create Event" onClick={() => navigate('/admin/events')} delay={300} />
          <QuickAction icon={Icon.mail} label="Send Email" onClick={() => navigate('/admin/emails')} delay={400} />
          <QuickAction icon={Icon.chart} label="View Reports" onClick={() => navigate('/admin/reports')} delay={500} />
        </div>
      </div>

      {/* Stats Grid — single grid so mobile 2-col has no orphans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }} className="ds-stats">
        <StatCard label="Revenue (30 days)" value={revenue30} isCurrency sparkData={sparkData} delay={200} />
        <StatCard label="Orders (30 days)" value={last30Orders.length} detail={`${orders.filter(o => o.date === today).length} today`} sparkData={sparkData.map((v, i) => sparkData.length - i)} delay={300} />
        <StatCard label="Avg. Order Value" value={avgOrderValue} isCurrency delay={400} />
        <StatCard
          label="Active Members"
          value={members.length}
          detail={Object.entries(tierCounts).map(([t, c]) => `${c} ${t}`).join(' · ')}
          delay={500}
        />
        <StatCard
          label="Events This Month"
          value={upcomingEvents.length}
          detail={nextEvent ? `Next: ${nextEvent.title}` : 'None scheduled'}
          delay={600}
        />
        <StatCard
          label="Gift Shop Inventory"
          value={totalInventory}
          suffix=" items"
          detail={lowStockItems.length > 0 ? `${lowStockItems.length} low stock` : 'All stocked'}
          detailColor={lowStockItems.length > 0 ? C.warning : C.success}
          delay={700}
        />
      </div>

      {/* Revenue Chart */}
      <div style={{ ...cardBase, marginBottom: 32, padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderBottom: `1px solid ${C.border}`, gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.text }}>Revenue Overview</span>
          <PeriodTabs
            tabs={[
              { label: '7D', value: 7 },
              { label: '30D', value: 30 },
              { label: '90D', value: 90 },
            ]}
            active={chartPeriod}
            onChange={setChartPeriod}
          />
        </div>
        <div style={{ padding: '16px 0 8px' }}>
          <RevenueChart data={chartData} period={chartPeriod} />
        </div>
        <div style={{
          display: 'flex', gap: 20, padding: '12px 20px 16px', borderTop: `1px solid ${C.border}`,
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Online', value: onlineRevenue, color: C.gold },
            { label: 'POS', value: posRevenue, color: C.sidebar },
            { label: 'Events', value: eventRevenue, color: C.success },
          ].map(ch => (
            <div key={ch.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ch.color }} />
              <span style={{ fontFamily: FONT, fontSize: 13, color: C.text2 }}>
                {ch.label}: {formatPrice(ch.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products + Channel Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, marginBottom: 32 }} className="ds-products-channels">
        {/* Top Products */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.text }}>Top Products</span>
          </div>
          {topProducts.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', fontFamily: FONT, fontSize: 14, color: C.muted }}>No sales data yet</div>
          ) : (
            topProducts.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                borderBottom: i < topProducts.length - 1 ? `1px solid ${C.border}` : 'none',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Bar background */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${(p.revenue / maxProductRevenue) * 100}%`,
                  background: `${C.gold}08`,
                  transition: 'width 1s ease',
                }} />
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.muted, width: 20, textAlign: 'right', position: 'relative' }}>
                  {i + 1}
                </span>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.text, flex: 1, position: 'relative' }}>
                  {p.name}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.text2, position: 'relative' }}>
                  {p.units} sold
                </span>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.text, position: 'relative', minWidth: 60, textAlign: 'right' }}>
                  {formatPrice(p.revenue)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Channel Breakdown */}
        <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.text, alignSelf: 'flex-start' }}>Sales by Channel</span>
          <div style={{ position: 'relative' }}>
            <DonutChart segments={channelSegments} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(0deg)',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: C.text, fontFeatureSettings: '"tnum"' }}>
                {formatPrice(channelTotal)}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: C.muted }}>total</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            {channelSegments.map(seg => (
              <div key={seg.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
                  <span style={{ fontFamily: FONT, fontSize: 13, color: C.text2 }}>{seg.label}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.text }}>
                  {channelTotal > 0 ? Math.round((seg.value / channelTotal) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div style={{ ...cardBase, marginBottom: 32, padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.text }}>Recent Activity</span>
          <button
            onClick={() => navigate('/admin/orders')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: FONT, fontSize: 13, fontWeight: 500, color: C.gold,
            }}
          >
            View All
          </button>
        </div>
        {recentActivity.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', fontFamily: FONT, fontSize: 14, color: C.muted }}>No recent activity</div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute', left: 35, top: 24, bottom: 24, width: 1,
              background: C.border,
            }} />
            {recentActivity.map((item, i) => {
              const dotColors = { order: '#4A7FBF', transfer: C.success, event: '#7C6BAF', member: C.gold };
              const icons = {
                order: Icon.cart(dotColors.order),
                transfer: Icon.transfer(dotColors.transfer),
                event: Icon.calendar(dotColors.event),
                member: Icon.user(dotColors.member),
              };
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                  background: i % 2 === 0 ? 'transparent' : C.bg,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${C.gold}06`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : C.bg; }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: C.card, border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', zIndex: 1,
                  }}>
                    {icons[item.icon] || icons.order}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.text,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                    }}>
                      {item.text}
                    </span>
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: C.muted, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {relativeTime(item.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div style={{ ...cardBase, marginBottom: 32, padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
          }}>
            {Icon.alert(C.warning)}
            <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.text }}>Low Stock Alert</span>
          </div>
          <div style={{ display: 'flex', gap: 10, padding: '14px 16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {lowStockItems.slice(0, 8).map(item => (
              <div key={item.id} style={{
                minWidth: 160, padding: '12px 16px',
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                flexShrink: 0,
              }}>
                <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, color: C.warning, marginBottom: 8 }}>
                  {((item.giftshop || 0) + (item.warehouse || 0))} left total
                </div>
                <button
                  onClick={() => navigate('/admin/inventory')}
                  style={{
                    width: '100%', padding: '6px 0',
                    background: `${C.warning}12`, color: C.warning,
                    border: `1px solid ${C.warning}30`, borderRadius: 6,
                    fontFamily: FONT, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictive Alerts */}
      {predictiveAlerts.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={labelStyle}>Predictive Alerts</div>
            {Icon.zap()}
            <HelpBubble text="Based on recent sales velocity, these items are projected to run out soon." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {predictiveAlerts.slice(0, 3).map(item => (
              <div key={item.id} style={{
                ...cardBase, borderLeft: `3px solid ${C.warning}`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: `${C.warning}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {Icon.zap()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 1 }}>
                    {item.name} {item.variant ? `(${item.variant})` : ''}
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: C.text2 }}>
                    ~{item.velocity.daysLeft} days left at {item.velocity.perWeek}/week · {(item.warehouse || 0) + (item.giftshop || 0)} remaining
                  </div>
                </div>
                <button
                  onClick={() => {
                    addPurchaseOrder({
                      vendor: 'Printify', status: 'Draft',
                      items: [{ name: item.name, sku: item.sku, variant: item.variant, ordered: item.suggestedQty || 24, received: 0, price: Math.round(item.price * 0.5) }],
                      expectedDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                      notes: `Auto-draft: ${item.name} predicted out of stock in ${item.velocity.daysLeft} days`,
                      total: (item.suggestedQty || 24) * Math.round(item.price * 0.5),
                    });
                    addToast('Draft PO created for ' + item.name);
                  }}
                  style={{
                    height: 34, padding: '0 14px',
                    background: `${C.warning}12`, color: C.warning,
                    border: `1px solid ${C.warning}30`, borderRadius: 7,
                    fontFamily: FONT, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  Draft PO
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Transfer Suggestions */}
      {transferSuggestions.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={labelStyle}>Smart Transfers</div>
            <HelpBubble text="Items running low at the gift shop that are available in the warehouse." />
          </div>
          <div style={{
            ...cardBase, borderLeft: `3px solid ${C.success}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: `${C.success}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {Icon.transfer(C.success)}
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text }}>
                  {transferSuggestions.length} item{transferSuggestions.length !== 1 ? 's' : ''} can be restocked from warehouse
                </div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: C.text2 }}>Create a transfer to restock the gift shop</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {transferSuggestions.slice(0, 6).map(s => (
                <span key={s.id} style={{
                  display: 'inline-block', padding: '4px 10px', borderRadius: 6,
                  background: `${C.success}08`, border: `1px solid ${C.success}18`,
                  fontFamily: FONT, fontSize: 13, color: C.text,
                }}>
                  {s.name} — GS:{s.giftshop} WH:{s.warehouse}
                </span>
              ))}
            </div>
            <button
              onClick={() => {
                addTransfer({
                  from: 'C&S Warehouse', to: 'Dark Sky Gift Shop',
                  items: transferSuggestions.slice(0, 10).map(s => ({ name: s.name, sku: s.sku, qty: s.suggestedQty })),
                  createdBy: 'Tovah',
                  notes: 'Auto-suggested transfer for low gift shop stock',
                });
                addToast(`Transfer created with ${Math.min(transferSuggestions.length, 10)} items`);
              }}
              style={{
                height: 36, padding: '0 20px',
                background: C.sidebar, color: '#fff',
                border: 'none', borderRadius: 8,
                fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.target.style.background = '#2a2a42'; }}
              onMouseLeave={e => { e.target.style.background = C.sidebar; }}
            >
              Create Transfer
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .ds-quick-actions { grid-template-columns: repeat(2, 1fr) !important; }
          .ds-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .ds-products-channels { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          /* ── Greeting: compact ── */
          .ds-greeting { padding-top: 4px !important; margin-bottom: 16px !important; }
          .ds-greeting-heading { font-size: 24px !important; }
          .ds-greeting-date { font-size: 12px !important; }
          .ds-greeting-login { display: none !important; }

          /* ── Sections: tighter margins ── */
          .ds-attention-section { margin-bottom: 16px !important; }
          .ds-attention-list { gap: 6px !important; }

          /* ── Attention cards: compact single-line ── */
          .ds-attention-card {
            padding: 10px 12px !important;
            border-left: none !important;
            border-top: 2px solid var(--attn-color, #C5A55A) !important;
            border-radius: 8px !important;
            gap: 8px !important;
            align-items: center !important;
            flex-wrap: nowrap !important;
          }
          .ds-attention-icon {
            width: 20px !important;
            height: 20px !important;
            min-width: 20px !important;
            border-radius: 4px !important;
            background: transparent !important;
          }
          .ds-attention-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
          .ds-attention-title {
            font-size: 13px !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .ds-attention-desc {
            font-size: 12px !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .ds-attention-btn {
            height: 28px !important;
            padding: 0 10px !important;
            font-size: 11px !important;
            flex-shrink: 0 !important;
          }

          /* ── Section margins ── */
          .ds-section { margin-bottom: 16px !important; }

          /* ── Quick actions & stats ── */
          .ds-quick-actions { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .ds-quick-actions > button { height: 72px !important; min-height: 0 !important; gap: 6px !important; }
          .ds-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .ds-products-channels { grid-template-columns: 1fr !important; gap: 10px !important; }
          .ds-stat-card {
            padding: 14px !important;
          }
          .ds-stats > .ds-stat-card:last-child:nth-child(odd) {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 375px) {
          .ds-quick-actions { gap: 6px !important; }
          .ds-stats { gap: 6px !important; }
        }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN DASHBOARD — switches by role
// ════════════════════════════════════════════
export default function Dashboard() {
  const [, setTick] = useState(0);
  const role = useRole();

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  if (role === 'volunteer') return <VolunteerDashboard />;
  if (role === 'staff') return <StaffDashboard />;
  return <ManagerDashboard />;
}
