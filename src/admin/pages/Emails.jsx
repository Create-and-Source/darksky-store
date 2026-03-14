import { useState, useRef } from 'react';
import { useToast } from '../AdminLayout';

/* ── MOCK DATA ── */
const SENT_EMAILS = [
  { id: 'EM-012', subject: 'New Moon Star Party — This Saturday!', audience: 'All Customers', sent: '2026-03-10', recipients: 847, opened: 412, clicked: 89, status: 'Sent' },
  { id: 'EM-011', subject: 'Spring Collection Just Dropped', audience: 'All Customers', sent: '2026-03-05', recipients: 847, opened: 356, clicked: 124, status: 'Sent' },
  { id: 'EM-010', subject: 'March Member Newsletter', audience: 'Members Only', sent: '2026-03-01', recipients: 312, opened: 198, clicked: 67, status: 'Sent' },
  { id: 'EM-009', subject: 'Astrophotography Workshop — 8 Spots Left', audience: 'Star Party Attendees', sent: '2026-02-25', recipients: 234, opened: 145, clicked: 52, status: 'Sent' },
  { id: 'EM-008', subject: 'Valentine\'s Gift Guide from Dark Sky', audience: 'All Customers', sent: '2026-02-10', recipients: 831, opened: 298, clicked: 76, status: 'Sent' },
  { id: 'EM-007', subject: 'February Member Newsletter', audience: 'Members Only', sent: '2026-02-01', recipients: 305, opened: 187, clicked: 54, status: 'Sent' },
  { id: 'EM-006', subject: '20% Off Everything — Presidents\' Day Weekend', audience: 'All Customers', sent: '2026-02-14', recipients: 831, opened: 445, clicked: 198, status: 'Sent' },
];

const SUBSCRIBERS = [
  { email: 'sarah.m@email.com', name: 'Sarah Mitchell', type: 'Customer', subscribed: '2025-11-15', orders: 3 },
  { email: 'jrod@email.com', name: 'James Rodriguez', type: 'Customer', subscribed: '2025-12-02', orders: 1 },
  { email: 'echen@email.com', name: 'Emily Chen', type: 'Member', subscribed: '2025-09-20', orders: 5 },
  { email: 'dkim@email.com', name: 'David Kim', type: 'Customer', subscribed: '2026-01-08', orders: 2 },
  { email: 'lpark@email.com', name: 'Lisa Park', type: 'Member', subscribed: '2025-10-12', orders: 4 },
  { email: 'mtorres@email.com', name: 'Michael Torres', type: 'Customer', subscribed: '2026-02-15', orders: 1 },
  { email: 'afoster@email.com', name: 'Amanda Foster', type: 'Member', subscribed: '2025-08-30', orders: 7 },
  { email: 'rchang@email.com', name: 'Robert Chang', type: 'Customer', subscribed: '2026-01-22', orders: 2 },
  { email: 'mjohn@email.com', name: 'Mark Johnson', type: 'Customer', subscribed: '2026-03-01', orders: 1 },
  { email: 'rgreen@email.com', name: 'Rachel Green', type: 'Member', subscribed: '2025-07-15', orders: 6 },
  { email: 'tnguyen@email.com', name: 'Tom Nguyen', type: 'Customer', subscribed: '2026-02-28', orders: 1 },
  { email: 'slee@email.com', name: 'Sophia Lee', type: 'Member', subscribed: '2025-11-01', orders: 3 },
  { email: 'club@flagstaffastro.org', name: 'Flagstaff Astronomy Club', type: 'Customer', subscribed: '2025-06-10', orders: 0 },
  { email: 'drpatel@prescottusd.org', name: 'Dr. Patel', type: 'Customer', subscribed: '2026-01-15', orders: 0 },
  { email: 'nancy@idarksky.org', name: 'Nancy (Staff)', type: 'Member', subscribed: '2025-01-01', orders: 0 },
];

const TEMPLATES = [
  {
    id: 'new-product',
    name: 'New Product Announcement',
    icon: '🏷️',
    subject: 'Just In: [Product Name] — Now Available',
    body: 'Hi there,\n\nWe\'re excited to introduce our newest addition to the Dark Sky collection:\n\n[Product Name]\n[One sentence about what makes it special]\n\nPrice: $XX.XX\n\nThis [product type] was designed to [key benefit]. Whether you\'re [use case 1] or [use case 2], it\'s the perfect addition to your collection.\n\nShop now at our online store or visit the gift shop in person.\n\nClear skies,\nThe Dark Sky Team',
  },
  {
    id: 'event',
    name: 'Upcoming Event',
    icon: '🌙',
    subject: '[Event Name] — [Day of Week], [Date]',
    body: 'Hi there,\n\nJoin us for an unforgettable evening under the stars!\n\n[Event Name]\nDate: [Day], [Month] [Date]\nTime: [Start Time] – [End Time]\nLocation: [Location]\nPrice: $XX/person (free for members)\n\n[2-3 sentences describing the event and what guests will experience]\n\nWhat\'s included:\n• [Item 1]\n• [Item 2]\n• [Item 3]\n\nSpots are limited — reserve yours today.\n\n[Link to reserve]\n\nSee you under the stars,\nThe Dark Sky Team',
  },
  {
    id: 'newsletter',
    name: 'Member Newsletter',
    icon: '✦',
    subject: '[Month] Member Newsletter — Dark Sky Discovery Center',
    body: 'Dear Dark Sky Members,\n\nHere\'s what\'s happening this month at the Discovery Center:\n\nUPCOMING EVENTS\n• [Event 1] — [Date]\n• [Event 2] — [Date]\n• [Event 3] — [Date]\n\nNEW IN THE GIFT SHOP\n[Brief description of new products or arrivals]\n\nMEMBER SPOTLIGHT\n[Short story or feature about a member or community highlight]\n\nDARK SKY UPDATE\n[News about dark sky preservation, light pollution, or center updates]\n\nAs always, thank you for being part of our community. Your membership directly supports dark sky education and preservation.\n\nClear skies,\nThe Dark Sky Team',
  },
  {
    id: 'sale',
    name: 'Sale / Promotion',
    icon: '⭐',
    subject: '[XX]% Off [Category/Everything] — [Duration]',
    body: 'Hi there,\n\n[Exciting opening line about the sale]\n\nSave [XX]% on [what\'s on sale] now through [end date].\n\nUse code [CODE] at checkout, or mention it in the gift shop.\n\nSome favorites on sale:\n• [Product 1] — $XX (was $XX)\n• [Product 2] — $XX (was $XX)\n• [Product 3] — $XX (was $XX)\n\n[One line about why now is a great time to shop — seasonal, limited stock, etc.]\n\nShop the sale: [link]\n\nHappy stargazing,\nThe Dark Sky Team',
  },
];

const AUDIENCES = [
  { id: 'all', label: 'All Customers', count: 847, desc: 'Every subscriber on your list' },
  { id: 'members', label: 'Members Only', count: 312, desc: 'Active membership holders' },
  { id: 'starparty', label: 'Star Party Attendees', count: 234, desc: 'Anyone who\'s attended a star party' },
  { id: 'recent', label: 'Recent Purchasers', count: 156, desc: 'Customers who bought in the last 30 days' },
  { id: 'custom', label: 'Custom List', count: null, desc: 'Paste specific email addresses' },
];

/* ── TOOLBAR BUTTON ── */
function ToolBtn({ label, icon, onClick }) {
  return (
    <button onClick={onClick} title={label} style={{
      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent', border: '1px solid transparent', borderRadius: 4,
      color: '#908a84', cursor: 'pointer', fontSize: 14, transition: 'all 0.15s',
      WebkitTapHighlightColor: 'transparent',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.color = '#d4af37'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#908a84'; }}
    >{icon}</button>
  );
}

/* ── MAIN ── */
export default function Emails() {
  const [tab, setTab] = useState('dashboard');
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [customEmails, setCustomEmails] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [sending, setSending] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const [subFilter, setSubFilter] = useState('All');
  const bodyRef = useRef(null);
  const toast = useToast();

  const totalSubs = 847;
  const emailsSentMonth = 3;
  const avgOpenRate = Math.round(SENT_EMAILS.reduce((s, e) => s + (e.opened / e.recipients), 0) / SENT_EMAILS.length * 100);

  // Rich text
  const execCmd = (cmd, val) => {
    document.execCommand(cmd, false, val || null);
    bodyRef.current?.focus();
  };
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCmd('createLink', url);
  };

  // Template
  const applyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    toast(`"${tpl.name}" template loaded — edit the placeholder text`);
  };

  // Send
  const handleSend = (isTest) => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      if (isTest) {
        toast('Test email sent to your inbox');
      } else if (scheduling && scheduleDate) {
        toast(`Email scheduled for ${scheduleDate} at ${scheduleTime}`);
        resetCompose();
      } else {
        toast(`Email sent to ${AUDIENCES.find(a => a.id === audience)?.label || 'recipients'}`);
        resetCompose();
      }
    }, 1200);
  };

  const resetCompose = () => {
    setComposing(false);
    setSubject('');
    setBody('');
    setAudience('all');
    setCustomEmails('');
    setScheduling(false);
  };

  // Subscribers filter
  const filteredSubs = SUBSCRIBERS.filter(s => {
    if (subFilter !== 'All' && s.type !== subFilter) return false;
    if (subSearch) {
      const q = subSearch.toLowerCase();
      return s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    }
    return true;
  });

  const tabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'subscribers', label: 'Subscribers' },
  ];

  const canSend = subject.trim() && body.trim() && (audience !== 'custom' || customEmails.trim());

  // ═══ COMPOSE VIEW ═══
  if (composing) {
    return (
      <>
        <button onClick={() => setComposing(false)} style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
          background: 'none', border: 'none', color: '#908a84', cursor: 'pointer', font: '400 13px DM Sans',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
          Back to emails
        </button>

        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Compose Email</h1>
            <p className="admin-page-subtitle">Write your email below — keep it simple and personal</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }} className="email-compose-layout">
          {/* Main compose area */}
          <div>
            {/* Audience */}
            <div className="admin-panel">
              <label style={{ display: 'block', font: '500 11px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 12 }}>
                Send To
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                {AUDIENCES.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAudience(a.id)}
                    style={{
                      padding: '14px 16px', textAlign: 'left',
                      background: audience === a.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${audience === a.id ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div style={{ font: '500 13px DM Sans', color: audience === a.id ? '#d4af37' : '#e8e4df', marginBottom: 2 }}>
                      {a.label}
                    </div>
                    <div style={{ font: '300 11px DM Sans', color: '#5a5550' }}>
                      {a.count !== null ? `${a.count} recipients` : 'Enter emails below'}
                    </div>
                  </button>
                ))}
              </div>
              {audience === 'custom' && (
                <textarea
                  style={{
                    width: '100%', marginTop: 12, padding: '12px 14px', minHeight: 80,
                    background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6, font: '400 13px DM Sans', color: '#e8e4df',
                    outline: 'none', resize: 'vertical',
                  }}
                  placeholder="Paste email addresses, one per line or comma-separated..."
                  value={customEmails}
                  onChange={e => setCustomEmails(e.target.value)}
                />
              )}
            </div>

            {/* Subject */}
            <div className="admin-panel">
              <label style={{ display: 'block', font: '500 11px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 8 }}>
                Subject Line
              </label>
              <input
                style={{
                  width: '100%', padding: '16px 18px', background: '#0a0a1a',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
                  font: '500 17px DM Sans', color: '#e8e4df', outline: 'none',
                }}
                placeholder="What's this email about?"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
              <p style={{ font: '300 11px DM Sans', color: '#5a5550', marginTop: 4 }}>
                Keep it under 50 characters for the best open rates
              </p>
            </div>

            {/* Body */}
            <div className="admin-panel">
              <label style={{ display: 'block', font: '500 11px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 8 }}>
                Email Body
              </label>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px',
                  background: 'rgba(4,4,12,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                  flexWrap: 'wrap',
                }}>
                  <ToolBtn label="Bold" icon={<strong>B</strong>} onClick={() => execCmd('bold')} />
                  <ToolBtn label="Italic" icon={<em>I</em>} onClick={() => execCmd('italic')} />
                  <ToolBtn label="Link" icon="🔗" onClick={insertLink} />
                  <ToolBtn label="Bullet List" icon="•" onClick={() => execCmd('insertUnorderedList')} />
                  <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />
                  <ToolBtn label="Heading" icon="H" onClick={() => execCmd('formatBlock', 'h3')} />
                  <div style={{ flex: 1 }} />
                  <span style={{ font: '300 10px DM Sans', color: '#5a5550' }}>
                    Write naturally — select text to format
                  </span>
                </div>
                <div
                  ref={bodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={e => setBody(e.currentTarget.innerText)}
                  style={{
                    minHeight: 280, padding: '20px 20px', background: '#0a0a1a',
                    font: '300 14px/1.8 DM Sans', color: '#e8e4df',
                    outline: 'none', whiteSpace: 'pre-wrap',
                  }}
                  dangerouslySetInnerHTML={{ __html: body.replace(/\n/g, '<br>') }}
                />
              </div>
            </div>

            {/* Schedule / Send */}
            <div className="admin-panel">
              {/* Schedule toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: scheduling ? 16 : 0,
              }}>
                <div>
                  <div style={{ font: '500 13px DM Sans', color: '#e8e4df', marginBottom: 2 }}>Schedule for Later</div>
                  <div style={{ font: '300 11px DM Sans', color: '#5a5550' }}>
                    {scheduling ? 'Choose when to send' : 'Or send immediately'}
                  </div>
                </div>
                <button
                  onClick={() => setScheduling(s => !s)}
                  style={{
                    width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: scheduling ? '#d4af37' : 'rgba(255,255,255,0.1)',
                    position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3,
                    left: scheduling ? 27 : 3,
                    transition: 'left 0.25s cubic-bezier(.16,1,.3,1)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>

              {scheduling && (
                <div style={{ display: 'flex', gap: 12 }} className="email-schedule-row">
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', font: '500 11px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 6 }}>Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', background: '#0a0a1a',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
                        font: '400 13px DM Sans', color: '#e8e4df', outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', font: '500 11px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 6 }}>Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', background: '#0a0a1a',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
                        font: '400 13px DM Sans', color: '#e8e4df', outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <button
                className="admin-btn admin-btn-gold admin-btn-lg"
                disabled={!canSend || sending}
                onClick={() => handleSend(false)}
                style={{ minWidth: 160 }}
              >
                {sending ? <><span className="admin-spinner" style={{ marginRight: 8 }} /> Sending...</> : (scheduling ? 'Schedule Email' : 'Send Now')}
              </button>
              <button
                className="admin-btn admin-btn-outline admin-btn-lg"
                disabled={!canSend || sending}
                onClick={() => handleSend(true)}
              >
                Send Test to Myself
              </button>
              <button className="admin-btn admin-btn-ghost admin-btn-lg" onClick={() => setComposing(false)}>
                Discard
              </button>
            </div>
          </div>

          {/* Sidebar: Templates */}
          <div className="email-templates-sidebar">
            <div className="admin-panel" style={{ position: 'sticky', top: 80 }}>
              <div style={{ font: '500 11px DM Sans', letterSpacing: '1px', textTransform: 'uppercase', color: '#5a5550', marginBottom: 14 }}>
                Start from a Template
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    style={{
                      padding: '14px 14px', textAlign: 'left',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; e.currentTarget.style.background = 'rgba(212,175,55,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{tpl.icon}</span>
                      <div>
                        <div style={{ font: '500 13px DM Sans', color: '#e8e4df', marginBottom: 1 }}>{tpl.name}</div>
                        <div style={{ font: '300 10px DM Sans', color: '#5a5550' }}>Click to load template</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p style={{ font: '300 10px DM Sans', color: '#5a5550', marginTop: 12 }}>
                Templates fill in placeholder text — just edit the [brackets] with your content.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .email-compose-layout { grid-template-columns: 1fr !important; }
            .email-templates-sidebar { order: -1; }
            .email-schedule-row { flex-direction: column; }
          }
        `}</style>
      </>
    );
  }

  // ═══ MAIN VIEW ═══
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Email</h1>
          <p className="admin-page-subtitle">Send updates, promotions, and newsletters</p>
        </div>
        <button className="admin-btn admin-btn-gold admin-btn-lg" onClick={() => setComposing(true)}>
          + Compose Email
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="admin-stat">
          <div className="admin-stat-label">Total Subscribers</div>
          <div className="admin-stat-value">{totalSubs}</div>
          <div className="admin-stat-sub"><span className="up">+23</span> this month</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Emails Sent (March)</div>
          <div className="admin-stat-value">{emailsSentMonth}</div>
          <div className="admin-stat-sub">campaigns this month</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Avg. Open Rate</div>
          <div className="admin-stat-value gold">{avgOpenRate}%</div>
          <div className="admin-stat-sub">industry avg: 21%</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 24,
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden', width: 'fit-content',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', font: '500 12.5px DM Sans',
            background: tab === t.id ? 'rgba(212,175,55,0.1)' : 'transparent',
            color: tab === t.id ? '#d4af37' : '#5a5550',
            border: 'none', borderRight: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══ DASHBOARD TAB ═══ */}
      {tab === 'dashboard' && (
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title">Sent Emails</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Audience</th>
                  <th>Sent</th>
                  <th>Recipients</th>
                  <th>Opened</th>
                  <th>Open Rate</th>
                  <th>Clicked</th>
                </tr>
              </thead>
              <tbody>
                {SENT_EMAILS.map(em => {
                  const rate = Math.round((em.opened / em.recipients) * 100);
                  return (
                    <tr key={em.id}>
                      <td className="text-white" style={{ fontWeight: 500, maxWidth: 280 }}>{em.subject}</td>
                      <td><span className="badge badge-gold">{em.audience}</span></td>
                      <td>{em.sent}</td>
                      <td>{em.recipients}</td>
                      <td>{em.opened}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 48, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${rate}%`, height: '100%', background: rate > 40 ? '#4ade80' : '#d4af37', borderRadius: 2 }} />
                          </div>
                          <span style={{ color: rate > 40 ? '#4ade80' : '#d4af37', fontSize: 12, fontWeight: 500 }}>{rate}%</span>
                        </div>
                      </td>
                      <td>{em.clicked}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ SUBSCRIBERS TAB ═══ */}
      {tab === 'subscribers' && (
        <div className="admin-table-wrap">
          <div className="admin-filters">
            <div className="admin-filter-search">
              <input
                className="admin-input"
                placeholder="Search by name or email..."
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
              />
            </div>
            <div className="admin-filter-tabs">
              {['All', 'Customer', 'Member'].map(f => (
                <button key={f} className={`admin-filter-tab ${subFilter === f ? 'active' : ''}`} onClick={() => setSubFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Subscribed</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map(s => (
                  <tr key={s.email}>
                    <td className="text-white">{s.name}</td>
                    <td style={{ fontSize: 12 }}>{s.email}</td>
                    <td>
                      <span className={`badge ${s.type === 'Member' ? 'badge-gold' : 'badge-gray'}`}>{s.type}</span>
                    </td>
                    <td>{s.subscribed}</td>
                    <td>{s.orders}</td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32, color: '#5a5550' }}>No subscribers match</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
