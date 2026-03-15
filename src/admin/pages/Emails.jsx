import { useState, useEffect, useRef } from 'react';
import { useToast } from '../AdminLayout';
import Wizard from '../components/Wizard';
import PageTour from '../components/PageTour';
import {
  getEmails, addEmail, getMembers, getOrders, getEvents, getReservations, subscribe,
} from '../data/store';

const TEMPLATES = {
  newsletter: {
    name: 'Newsletter',
    icon: '\u2B50',
    desc: 'Weekly updates and product highlights',
    subject: 'March Newsletter -- Dark Sky Discovery Center',
    body: 'Dear Dark Sky Community,\n\nHere is what is happening this month at the Discovery Center:\n\nUPCOMING EVENTS\n- [Event 1] -- [Date]\n- [Event 2] -- [Date]\n\nNEW IN THE GIFT SHOP\n[Brief description of new products or arrivals]\n\nDARK SKY UPDATE\n[News about dark sky preservation or center updates]\n\nThank you for being part of our community.\n\nClear skies,\nThe Dark Sky Team',
  },
  event: {
    name: 'Event Announcement',
    icon: '\uD83D\uDCC5',
    desc: 'Promote an upcoming event',
    subject: '[Event Name] -- This Saturday!',
    body: 'Hi there,\n\nJoin us for an unforgettable evening under the stars!\n\n[Event Name]\nDate: [Day], [Month] [Date]\nTime: [Start Time] - [End Time]\nLocation: [Location]\nPrice: $XX/person (free for members)\n\n[2-3 sentences describing the event]\n\nSpots are limited -- reserve yours today.\n\nSee you under the stars,\nThe Dark Sky Team',
  },
  sale: {
    name: 'Sale/Promotion',
    icon: '\uD83C\uDFF7\uFE0F',
    desc: 'Announce a sale or discount',
    subject: '[XX]% Off Everything -- This Weekend Only',
    body: 'Hi there,\n\nWe are running a special sale!\n\nSave [XX]% on [what is on sale] now through [end date].\n\nUse code [CODE] at checkout, or mention it in the gift shop.\n\nSome favorites on sale:\n- [Product 1] -- $XX (was $XX)\n- [Product 2] -- $XX (was $XX)\n- [Product 3] -- $XX (was $XX)\n\nHappy stargazing,\nThe Dark Sky Team',
  },
  welcome: {
    name: 'Membership Welcome',
    icon: '\u2764\uFE0F',
    desc: 'Welcome new members',
    subject: 'Welcome to the Dark Sky Community!',
    body: 'Welcome to the Dark Sky Discovery Center family!\n\nThank you for becoming a member. Your support directly funds dark sky education, light pollution advocacy, and STEM programming.\n\nHere is what you get as a member:\n- Free admission to select events\n- 10% off all gift shop purchases\n- Monthly member newsletter\n- Early access to new events\n\nWe are so glad to have you. See you under the stars!\n\nThe Dark Sky Team',
  },
  blank: {
    name: 'Start from Scratch',
    icon: '\uD83D\uDCC4',
    desc: 'Empty template',
    subject: '',
    body: '',
  },
};

const AUDIENCES = [
  { id: 'all', name: 'Everyone', icon: '\uD83D\uDC65', desc: 'All subscribers on your list' },
  { id: 'members', name: 'Members Only', icon: '\u2B50', desc: 'Active membership holders' },
  { id: 'attendees', name: 'Event Attendees', icon: '\uD83C\uDFAB', desc: 'People who registered for events' },
  { id: 'recent', name: 'Recent Customers', icon: '\uD83D\uDED2', desc: 'Purchased in the last 30 days' },
];

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};

const inputStyle = {
  width: '100%', padding: '14px 16px', height: 48, background: '#FFFFFF',
  border: '1px solid #E2E8F0', borderRadius: 12,
  font: '400 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'flex', alignItems: 'center',
  font: '500 13px -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '1px',
  textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8,
};

const cardSelectorStyle = (selected) => ({
  padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
  background: '#FFFFFF',
  border: `2px solid ${selected ? '#D4AF37' : '#E2E8F0'}`,
  borderRadius: 12, transition: 'all 0.2s',
  boxShadow: selected ? '0 0 0 3px rgba(212,175,55,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
  width: '100%',
});

function ToolBtn({ label, icon, onClick }) {
  return (
    <button onClick={onClick} title={label} type="button" style={{
      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent', border: '1px solid transparent', borderRadius: 4,
      color: '#64748B', cursor: 'pointer', fontSize: 14, transition: 'all 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.color = '#D4AF37'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
    >{icon}</button>
  );
}

export default function Emails() {
  const [, setTick] = useState(0);
  const [tab, setTab] = useState('compose');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [template, setTemplate] = useState(null);
  const [sending, setSending] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const [subFilter, setSubFilter] = useState('All');
  const [confirmModal, setConfirmModal] = useState(false);
  const bodyRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const unsub = subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const emails = getEmails();
  const members = getMembers();
  const orders = getOrders();
  const events = getEvents();
  const allReservations = getReservations();

  // Build subscriber list
  const subscriberMap = {};
  members.forEach(m => {
    subscriberMap[m.email] = { name: m.name, email: m.email, source: 'Member', since: m.joinDate };
  });
  orders.forEach(o => {
    if (o.email && !subscriberMap[o.email]) {
      subscriberMap[o.email] = { name: o.customer || o.email, email: o.email, source: 'Customer', since: o.date };
    }
  });
  const allSubscribers = Object.values(subscriberMap);

  const getAudienceCount = (aud) => {
    const a = aud || audience;
    if (a === 'all') return allSubscribers.length;
    if (a === 'members') return members.length;
    if (a === 'attendees') {
      const attendeeEmails = new Set();
      allReservations.forEach(r => { if (r.email) attendeeEmails.add(r.email); });
      return attendeeEmails.size;
    }
    if (a === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);
      const recent = new Set();
      orders.forEach(o => { if (o.date >= cutoff && o.email) recent.add(o.email); });
      return recent.size;
    }
    return 0;
  };

  const audienceLabel = {
    all: 'Everyone',
    members: 'Members Only',
    attendees: 'Event Attendees',
    recent: 'Recent Customers',
  }[audience] || 'Everyone';

  // Rich text helpers
  const wrapText = (marker) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.slice(start, end);
    const newBody = body.slice(0, start) + marker + selected + marker + body.slice(end);
    setBody(newBody);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + marker.length;
      ta.selectionEnd = end + marker.length;
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (!url) return;
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const linkText = body.slice(start, end) || 'link text';
    const newBody = body.slice(0, start) + `[${linkText}](${url})` + body.slice(end);
    setBody(newBody);
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      addEmail({
        subject,
        body,
        audience: audienceLabel,
        status: 'Sent',
        recipientCount: getAudienceCount(),
      });
      setSending(false);
      setConfirmModal(false);
      setSubject('');
      setBody('');
      setTemplate(null);
      toast(`Email sent to ${audienceLabel} (${getAudienceCount()} recipients)`);
      setTab('sent');
    }, 1000);
  };

  const handleSendTest = () => {
    const email = prompt('Enter your email address for the test:');
    if (email) {
      toast(`Test email sent to ${email}`);
    }
  };

  const canSend = subject.trim() && body.trim();
  const sentEmails = emails.filter(e => e.status === 'Sent');

  // Subscribers filter
  const filteredSubs = allSubscribers.filter(s => {
    if (subFilter !== 'All' && s.source !== subFilter) return false;
    if (subSearch) {
      const q = subSearch.toLowerCase();
      return s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    }
    return true;
  });

  const tabs = [
    { id: 'compose', label: 'Compose' },
    { id: 'sent', label: 'Sent' },
    { id: 'subscribers', label: 'Subscribers' },
  ];

  // ---- WIZARD STEPS for Compose ----
  const wizardSteps = [
    {
      label: 'Audience',
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            Who's this for?
          </h2>
          <LabelWithHelp help="Choose who receives this email." style={labelStyle}>
            Audience
          </LabelWithHelp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {AUDIENCES.map(a => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAudience(a.id)}
                style={cardSelectorStyle(audience === a.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <span style={{ font: '600 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>{a.name}</span>
                </div>
                <div style={{ font: '400 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 4 }}>{a.desc}</div>
                <div style={{ font: '600 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37' }}>
                  {getAudienceCount(a.id)} {getAudienceCount(a.id) === 1 ? 'person' : 'people'}
                </div>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Template',
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            Pick a starting point
          </h2>
          <LabelWithHelp help="Templates save time. Pick one and customize it." style={labelStyle}>
            Template
          </LabelWithHelp>
          <div id="tour-emails-templates" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {Object.entries(TEMPLATES).map(([key, tpl]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTemplate(key);
                  setSubject(tpl.subject);
                  setBody(tpl.body);
                }}
                style={cardSelectorStyle(template === key)}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{tpl.icon}</div>
                <div style={{ font: '600 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 4 }}>{tpl.name}</div>
                <div style={{ font: '400 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>{tpl.desc}</div>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Write',
      validate: () => {
        if (!subject.trim()) { toast('Please enter a subject line'); return false; }
        if (!body.trim()) { toast('Please write your email body'); return false; }
        return true;
      },
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            Write your message
          </h2>

          <div style={{ marginBottom: 24 }}>
            <LabelWithHelp help="This is the first thing people see. Keep it short and interesting." style={labelStyle}>
              Subject Line
            </LabelWithHelp>
            <input
              style={{ ...inputStyle, fontSize: 18, padding: '16px 18px', height: 56 }}
              placeholder="What's this email about?"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div>
            <LabelWithHelp help="Write the content of your email. Use the toolbar to format text." style={labelStyle}>
              Email Body
            </LabelWithHelp>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 2, padding: '8px 10px',
                background: '#F8F7F4', borderBottom: '1px solid #E2E8F0',
              }}>
                <ToolBtn label="Bold" icon={<strong>B</strong>} onClick={() => wrapText('**')} />
                <ToolBtn label="Italic" icon={<em>I</em>} onClick={() => wrapText('_')} />
                <ToolBtn label="Link" icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                } onClick={insertLink} />
                <div style={{ flex: 1 }} />
                <span style={{ font: '400 13px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>Select text, then format</span>
              </div>
              <textarea
                ref={bodyRef}
                style={{
                  width: '100%', minHeight: 280, padding: '20px', background: '#FFFFFF',
                  font: '400 15px/1.8 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B',
                  outline: 'none', border: 'none', resize: 'vertical', boxSizing: 'border-box',
                }}
                placeholder="Write your email here..."
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Preview',
      content: (
        <div>
          <h2 style={{ font: '600 22px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 24 }}>
            Preview and Send
            
          </h2>

          {/* Email preview */}
          <div style={{
            background: '#F1F5F9', borderRadius: 12, padding: 24, marginBottom: 24,
          }}>
            <div style={{
              background: '#FFFFFF', borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              maxWidth: 560, margin: '0 auto',
            }}>
              {/* Email header */}
              <div style={{
                background: '#0F172A', padding: '24px 28px', textAlign: 'center',
              }}>
                <div style={{ font: '700 18px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37', marginBottom: 4 }}>
                  Dark Sky Discovery Center
                </div>
                <div style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>
                  Gift Shop & Observatory
                </div>
              </div>

              {/* Email body */}
              <div style={{ padding: '28px 28px' }}>
                <h2 style={{ font: '600 20px/1.3 -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B', marginBottom: 16 }}>
                  {subject || '(No subject)'}
                </h2>
                <div style={{ font: '400 14px/1.8 -apple-system, BlinkMacSystemFont, sans-serif', color: '#475569', whiteSpace: 'pre-wrap' }}>
                  {body || '(No content)'}
                </div>
              </div>

              {/* Email footer */}
              <div style={{
                background: '#F8F7F4', padding: '20px 28px', textAlign: 'center',
                borderTop: '1px solid #E2E8F0',
              }}>
                <div style={{ font: '400 12px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8', marginBottom: 4 }}>
                  Dark Sky Discovery Center | 123 Observatory Road
                </div>
                <div style={{ font: '400 11px -apple-system, BlinkMacSystemFont, sans-serif', color: '#CBD5E1' }}>
                  You received this because you subscribed to our updates.
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
            padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ font: '500 15px -apple-system, BlinkMacSystemFont, sans-serif', color: '#1E293B' }}>Recipients</div>
                <div style={{ font: '400 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#94A3B8' }}>
                  {audienceLabel} -- {getAudienceCount()} {getAudienceCount() === 1 ? 'person' : 'people'}
                </div>
              </div>
              <button
                className="admin-btn admin-btn-outline"
                style={{ height: 40 }}
                onClick={handleSendTest}
              >
                Send Test to Me
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageTour storageKey="ds_tour_emails" steps={[
        { target: '#tour-emails-compose', title: 'Compose', text: 'Use the step-by-step wizard to pick an audience, choose a template, and write your email.' },
        { target: '#tour-emails-templates', title: 'Templates', text: 'Pick a pre-written template to get started quickly, or start from scratch.' },
      ]} />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center' }}>
            Email
            
          </h1>
          <p className="admin-page-subtitle">Send newsletters, promotions, and announcements to your customers and members.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 24,
        border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: 'fit-content',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', font: "500 14px -apple-system, BlinkMacSystemFont, sans-serif",
            background: tab === t.id ? 'rgba(212,175,55,0.1)' : 'transparent',
            color: tab === t.id ? '#D4AF37' : '#64748B',
            border: 'none', borderRight: '1px solid #E2E8F0',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{t.label}{t.id === 'sent' && sentEmails.length > 0 ? ` (${sentEmails.length})` : ''}</button>
        ))}
      </div>

      {/* COMPOSE TAB */}
      {tab === 'compose' && (
        <div id="tour-emails-compose" style={{ maxWidth: 800 }}>
          <Wizard
            steps={wizardSteps}
            onComplete={() => setConfirmModal(true)}
            completeBtnText={`Send to ${getAudienceCount()} people`}
          />
        </div>
      )}

      {/* SENT TAB */}
      {tab === 'sent' && (
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title" style={{ display: 'flex', alignItems: 'center' }}>
              Sent Emails
              
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Audience</th>
                  <th>Sent Date</th>
                  <th>Opens</th>
                  <th>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {sentEmails.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No emails sent yet. Compose your first email to get started.</td></tr>
                ) : sentEmails.map(em => {
                  const mockOpenRate = Math.round(20 + Math.random() * 45);
                  const mockClickRate = Math.round(5 + Math.random() * 20);
                  return (
                    <tr key={em.id}>
                      <td style={{ fontWeight: 500, color: '#1E293B', maxWidth: 300 }}>{em.subject}</td>
                      <td><span className="badge badge-gold">{em.audience}</span></td>
                      <td>{fmtDate(em.sentDate)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 48, height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${mockOpenRate}%`, height: '100%', background: mockOpenRate > 40 ? '#10B981' : '#D4AF37', borderRadius: 2 }} />
                          </div>
                          <span style={{ color: mockOpenRate > 40 ? '#10B981' : '#D4AF37', fontSize: 14, fontWeight: 500 }}>{mockOpenRate}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>{mockClickRate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBSCRIBERS TAB */}
      {tab === 'subscribers' && (
        <div className="admin-table-wrap">
          <div className="admin-filters">
            <div className="admin-filter-search">
              <input
                style={inputStyle}
                placeholder="Search by name or email..."
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
              />
            </div>
            <div className="admin-filter-tabs">
              {['All', 'Member', 'Customer'].map(f => (
                <button key={f} className={`admin-filter-tab ${subFilter === f ? 'active' : ''}`} onClick={() => setSubFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center' }}>
            <span style={{ font: '500 14px -apple-system, BlinkMacSystemFont, sans-serif', color: '#D4AF37' }}>
              {allSubscribers.length} total subscribers
            </span>
            
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Since</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>No subscribers match</td></tr>
                ) : filteredSubs.map(s => (
                  <tr key={s.email}>
                    <td style={{ color: '#1E293B', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ fontSize: 14, color: '#64748B' }}>{s.email}</td>
                    <td>
                      <span className={`badge ${s.source === 'Member' ? 'badge-gold' : 'badge-gray'}`}>{s.source}</span>
                    </td>
                    <td>{fmtDate(s.since)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Send Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
        }} onClick={() => setConfirmModal(false)}>
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: 36, maxWidth: 440, width: '90%', textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>
              {'\u2709\uFE0F'}
            </div>
            <h3 style={{ font: "500 18px/1.3 -apple-system, BlinkMacSystemFont, sans-serif", color: '#1E293B', marginBottom: 8 }}>Send Email?</h3>
            <p style={{ font: "400 15px/1.6 -apple-system, BlinkMacSystemFont, sans-serif", color: '#64748B', marginBottom: 8 }}>
              <strong style={{ color: '#1E293B' }}>{subject}</strong>
            </p>
            <p style={{ font: "400 15px/1.6 -apple-system, BlinkMacSystemFont, sans-serif", color: '#64748B', marginBottom: 24 }}>
              This will send to <strong style={{ color: '#D4AF37' }}>{audienceLabel}</strong> ({getAudienceCount()} recipients).
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="admin-btn admin-btn-ghost admin-btn-lg" onClick={() => setConfirmModal(false)} style={{ height: 48 }}>Cancel</button>
              <button className="admin-btn admin-btn-gold admin-btn-lg" disabled={sending} onClick={handleSend} style={{ height: 48, minWidth: 140 }}>
                {sending ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .email-compose-layout { grid-template-columns: 1fr !important; }
          .email-templates-sidebar { order: -1; }
        }
      `}</style>
    </>
  );
}
