import { useState, useEffect } from 'react';
import { getVisitors, addVisitorDay, subscribe } from '../data/store';
import { useToast, useRole } from '../AdminLayout';
import HelpBubble from '../components/HelpBubble';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B', shadow: '0 1px 3px rgba(0,0,0,0.04)' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const cardStyle = { background: C.card, border: '1px solid ' + C.border, borderRadius: 10, padding: 24, boxShadow: C.shadow };
const labelStyle = { fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, margin: 0 };

const today = () => new Date().toISOString().slice(0, 10);

export default function Visitors() {
  const [, setTick] = useState(0);
  const toast = useToast();

  const todayStr = today();
  const visitors = getVisitors();
  const todayData = visitors.find(v => v.date === todayStr);

  const [form, setForm] = useState({
    total: todayData?.total || '',
    members: todayData?.members || '',
    general: todayData?.general || '',
    children: todayData?.children || '',
    groups: todayData?.groups || '',
  });

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  // Re-sync form if today's data changes externally
  useEffect(() => {
    const td = getVisitors().find(v => v.date === todayStr);
    if (td) setForm({ total: td.total, members: td.members, general: td.general, children: td.children, groups: td.groups });
  }, [todayStr]);

  const handleSave = () => {
    const data = {
      date: todayStr,
      total: Number(form.total) || 0,
      members: Number(form.members) || 0,
      general: Number(form.general) || 0,
      children: Number(form.children) || 0,
      groups: Number(form.groups) || 0,
      peakHour: todayData?.peakHour || new Date().getHours() + ':00',
    };
    addVisitorDay(data);
    toast('Visitor data saved');
  };

  // Summary calculations
  const now = new Date();
  const todayVisitors = todayData?.total || 0;

  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 6);
  const weekStr = weekAgo.toISOString().slice(0, 10);
  const weekDays = visitors.filter(v => v.date >= weekStr);
  const weekTotal = weekDays.reduce((s, v) => s + (v.total || 0), 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthDays = visitors.filter(v => v.date >= monthStart);
  const monthAvg = monthDays.length ? Math.round(monthDays.reduce((s, v) => s + (v.total || 0), 0) / monthDays.length) : 0;

  const peakDay = monthDays.length ? monthDays.reduce((best, v) => v.total > best.total ? v : best, monthDays[0]) : null;

  // Chart data — last 30 days sorted by date
  const sorted = [...visitors].sort((a, b) => a.date.localeCompare(b.date));
  const last30 = sorted.slice(-30);

  // SVG chart dimensions
  const chartW = 720;
  const chartH = 180;
  const padX = 40;
  const padY = 20;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padY * 2;

  const maxVal = last30.length ? Math.max(...last30.map(d => d.total), 1) : 1;
  const points = last30.map((d, i) => {
    const x = padX + (last30.length > 1 ? (i / (last30.length - 1)) * plotW : plotW / 2);
    const y = padY + plotH - (d.total / maxVal) * plotH;
    return { x, y, ...d };
  });
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `M${points[0].x},${padY + plotH} ${points.map(p => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},${padY + plotH} Z`
    : '';

  // Table — last 14 days, most recent first
  const recent14 = [...visitors].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);

  const formatDate = (d) => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Visitor Tracking</h1>
        <HelpBubble text="Track daily visitor counts by category. Data is stored locally." />
      </div>

      {/* Today's Entry */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <p style={{ ...labelStyle, marginBottom: 12 }}>Today&apos;s Entry &mdash; {formatDate(todayStr)}</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {[
            { key: 'total', label: 'Total' },
            { key: 'members', label: 'Members' },
            { key: 'general', label: 'General' },
            { key: 'children', label: 'Children' },
            { key: 'groups', label: 'Groups' },
          ].map(f => (
            <div key={f.key} style={{ flex: '1 1 100px' }}>
              <label style={{ ...labelStyle, fontSize: 10 }}>{f.label}</label>
              <input
                type="number" min="0"
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid ' + C.border, borderRadius: 8, fontSize: 16, fontFamily: MONO, color: C.text, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <button onClick={handleSave} style={{ padding: '10px 24px', border: 'none', borderRadius: 8, background: C.gold, color: '#fff', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            Save
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: "Today's Visitors", value: todayVisitors },
          { label: 'This Week Total', value: weekTotal.toLocaleString() },
          { label: 'Monthly Average', value: monthAvg },
          { label: 'Peak Day This Month', value: peakDay ? `${peakDay.total} — ${formatDate(peakDay.date)}` : '—' },
        ].map((c, i) => (
          <div key={i} style={cardStyle}>
            <p style={labelStyle}>{c.label}</p>
            <p style={{ margin: '8px 0 0', fontSize: i === 3 ? 18 : 28, fontWeight: 700 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* 30-Day Trend Chart */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <p style={{ ...labelStyle, marginBottom: 12 }}>30-Day Visitor Trend</p>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 200 }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const y = padY + plotH - f * plotH;
            return (
              <g key={f}>
                <line x1={padX} y1={y} x2={padX + plotW} y2={y} stroke={C.border} strokeWidth={0.5} />
                <text x={padX - 6} y={y + 4} textAnchor="end" fill={C.muted} fontSize="9" fontFamily={MONO}>
                  {Math.round(maxVal * f)}
                </text>
              </g>
            );
          })}
          {/* Area fill */}
          {points.length > 1 && <path d={areaPath} fill={C.gold} opacity={0.08} />}
          {/* Line */}
          {points.length > 1 && <polyline points={polyline} fill="none" stroke={C.gold} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={C.gold} />
          ))}
          {/* X-axis labels — show every 5th */}
          {points.filter((_, i) => i % 5 === 0 || i === points.length - 1).map((p, i) => (
            <text key={i} x={p.x} y={chartH - 2} textAnchor="middle" fill={C.muted} fontSize="8" fontFamily={MONO}>
              {p.date.slice(5)}
            </text>
          ))}
        </svg>
      </div>

      {/* Daily Log Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 0' }}>
          <p style={labelStyle}>Daily Log — Last 14 Days</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, fontSize: 13, marginTop: 8 }}>
          <thead>
            <tr>
              {['Date', 'Total', 'Members', 'General', 'Children', 'Groups', 'Peak Hour'].map((h, i) => (
                <th key={i} style={{ ...labelStyle, padding: '10px 16px', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid ' + C.border }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent14.map(v => (
              <tr key={v.date} style={{ borderBottom: '1px solid ' + C.border }}>
                <td style={{ padding: '10px 16px', fontWeight: v.date === todayStr ? 600 : 400 }}>
                  {formatDate(v.date)}
                  {v.date === todayStr && <span style={{ marginLeft: 6, fontSize: 10, color: C.gold, fontWeight: 600 }}>TODAY</span>}
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: MONO, fontWeight: 600 }}>{v.total}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: MONO }}>{v.members}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: MONO }}>{v.general}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: MONO }}>{v.children}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: MONO }}>{v.groups}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: C.text2 }}>{v.peakHour || '—'}</td>
              </tr>
            ))}
            {recent14.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No visitor data recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
