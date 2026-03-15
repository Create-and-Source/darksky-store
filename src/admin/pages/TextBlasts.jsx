import { useState, useEffect } from 'react';
import { useToast } from '../AdminLayout';
import PageTour from '../components/PageTour';
import { getMembers, getEvents, subscribe } from '../data/store';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', warning: '#D4943A', danger: '#C45B5B' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const AUDIENCES = [
  { id: 'all', label: 'All Contacts', icon: '\uD83D\uDCF1', desc: 'Everyone who has opted in to text updates' },
  { id: 'members', label: 'Members Only', icon: '\u2B50', desc: 'Active members at all tiers' },
  { id: 'event-attendees', label: 'Event Attendees', icon: '\uD83C\uDFAB', desc: 'People who have attended or reserved for events' },
  { id: 'donors', label: 'Donors', icon: '\uD83D\uDC9B', desc: 'People who have made donations' },
];

const TEMPLATES = [
  { id: 'event', label: 'Event Reminder', icon: '\uD83D\uDCC5', msg: 'Reminder: [Event Name] is this [day] at [time]! Spots still available. Reserve yours at darkskycenter.org/events' },
  { id: 'promo', label: 'Gift Shop Promo', icon: '\uD83D\uDED2', msg: '20% off everything in the Dark Sky Gift Shop this weekend! Use code STARS20 online or mention it in store. darkskycenter.org/shop' },
  { id: 'announcement', label: 'Announcement', icon: '\uD83D\uDCE2', msg: 'Big news from the Dark Sky Discovery Center! [Your announcement here]. Learn more at darkskycenter.org' },
  { id: 'member', label: 'Member Exclusive', icon: '\u2728', msg: 'Members-only: Private telescope viewing session this Friday 8-10pm. Limited to 15 guests. Reply YES to RSVP.' },
  { id: 'weather', label: 'Clear Sky Alert', icon: '\uD83C\uDF1F', msg: 'Clear skies tonight! The observatory is open 6-11pm. Come see Saturn and Jupiter through our PlaneWave CDK700. Walk-ins welcome.' },
  { id: 'custom', label: 'Custom Message', icon: '\u270D\uFE0F', msg: '' },
];

const MAX_SMS = 160;

function getTexts() {
  try { return JSON.parse(localStorage.getItem('ds_text_blasts')) || []; } catch { return []; }
}
function saveText(t) {
  const all = getTexts();
  all.unshift({ ...t, id: `TXT-${Date.now()}`, sentAt: new Date().toISOString() });
  localStorage.setItem('ds_text_blasts', JSON.stringify(all));
  window.dispatchEvent(new Event('storage'));
}

export default function TextBlasts() {
  const [, setTick] = useState(0);
  const toast = useToast();
  const [tab, setTab] = useState('compose'); // compose | history
  const [audience, setAudience] = useState('all');
  const [template, setTemplate] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { return subscribe(() => setTick(t => t + 1)); }, []);

  const texts = getTexts();
  const members = getMembers();
  const events = getEvents();

  const recipientCount = audience === 'members' ? members.length
    : audience === 'event-attendees' ? Math.max(events.reduce((s, e) => s + (e.ticketsSold || 0), 0), 12)
    : audience === 'donors' ? 8
    : members.length + 24;

  const selectTemplate = (t) => {
    setTemplate(t.id);
    setMessage(t.msg);
  };

  const handleSend = () => {
    if (!message.trim()) { toast('Write a message first', 'warning'); return; }
    setSending(true);
    setTimeout(() => {
      saveText({
        message: message.trim(),
        audience: AUDIENCES.find(a => a.id === audience)?.label || audience,
        recipientCount,
        template: template || 'custom',
      });
      setSending(false);
      setConfirm(false);
      setMessage('');
      setTemplate(null);
      toast(`Text sent to ${recipientCount} recipients`, 'success');
      setTab('history');
    }, 1500);
  };

  const charCount = message.length;
  const segments = Math.ceil(charCount / MAX_SMS) || 1;

  const labelStyle = { font: `500 11px ${MONO}`, letterSpacing: 1, textTransform: 'uppercase', color: C.text2, marginBottom: 10, display: 'block' };
  const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' };

  return (
    <div style={{ fontFamily: FONT }}>
      <PageTour storageKey="ds_tour_texts" steps={[
        { target: '.admin-page-title', title: 'Text Blasts', text: 'Send SMS messages to members, event attendees, donors, or all contacts.' },
        { target: '.text-audience', title: 'Pick Your Audience', text: 'Choose who receives the text. Each audience is auto-populated from your data.' },
        { target: '.text-compose', title: 'Compose & Send', text: 'Write your message or pick a template. Keep it under 160 characters for a single SMS.' },
      ]} />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Text Blasts</h1>
          <p className="admin-page-subtitle">Send SMS updates to members, event attendees, and donors.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
        {[['compose', 'Compose'], ['history', `Sent (${texts.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '12px 20px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: 'transparent', color: tab === key ? C.gold : C.text2,
            borderBottom: tab === key ? `2px solid ${C.gold}` : '2px solid transparent',
            transition: 'all 0.15s', fontFamily: FONT,
          }}>{label}</button>
        ))}
      </div>

      {tab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }} className="text-compose-grid">
          {/* Left — compose */}
          <div>
            {/* Audience */}
            <div className="text-audience" style={{ marginBottom: 24 }}>
              <div style={labelStyle}>Audience</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {AUDIENCES.map(a => (
                  <button key={a.id} onClick={() => setAudience(a.id)} style={{
                    ...cardStyle, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${audience === a.id ? C.gold : C.border}`,
                    background: audience === a.id ? 'rgba(212,175,55,0.04)' : C.card,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{a.icon}</span>
                      <div>
                        <div style={{ font: `600 13px ${FONT}`, color: C.text }}>{a.label}</div>
                        <div style={{ font: `400 11px ${FONT}`, color: C.text2 }}>{a.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div style={{ marginBottom: 24 }}>
              <div style={labelStyle}>Quick Templates</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => selectTemplate(t)} style={{
                    padding: '8px 14px', borderRadius: 100, cursor: 'pointer',
                    border: `1px solid ${template === t.id ? C.gold : C.border}`,
                    background: template === t.id ? 'rgba(212,175,55,0.08)' : C.card,
                    color: template === t.id ? C.gold : C.text2,
                    font: `500 12px ${FONT}`, transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="text-compose" style={{ marginBottom: 24 }}>
              <div style={labelStyle}>Message</div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  width: '100%', minHeight: 120, padding: '14px 16px', resize: 'vertical',
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                  font: `400 15px/1.6 ${FONT}`, color: C.text, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ font: `400 12px ${MONO}`, color: charCount > MAX_SMS ? C.warning : C.text2 }}>
                  {charCount}/{MAX_SMS} characters {segments > 1 ? `(${segments} segments)` : ''}
                </span>
                <span style={{ font: `400 12px ${MONO}`, color: C.text2 }}>
                  {recipientCount} recipients
                </span>
              </div>
            </div>

            {/* Send */}
            <button
              onClick={() => setConfirm(true)}
              disabled={!message.trim() || sending}
              style={{
                padding: '14px 32px', borderRadius: 10, border: 'none', cursor: message.trim() ? 'pointer' : 'default',
                background: message.trim() ? C.gold : C.muted, color: '#fff',
                font: `600 15px ${FONT}`, transition: 'all 0.2s',
                boxShadow: message.trim() ? '0 4px 14px rgba(212,175,55,0.3)' : 'none',
              }}
            >
              Send to {recipientCount} people
            </button>
          </div>

          {/* Right — phone preview */}
          <div>
            <div style={labelStyle}>Preview</div>
            <div style={{
              background: '#1A1A2E', borderRadius: 24, padding: '48px 16px 32px',
              maxWidth: 300, margin: '0 auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}>
              {/* Status bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 16px', font: `500 11px ${FONT}`, color: 'rgba(255,255,255,0.5)' }}>
                <span>9:41 AM</span>
                <span>Dark Sky Center</span>
                <span>5G</span>
              </div>
              {/* Message bubble */}
              <div style={{
                background: 'rgba(212,175,55,0.15)', borderRadius: '16px 16px 16px 4px',
                padding: '14px 16px', margin: '0 8px',
              }}>
                <p style={{ font: `400 14px/1.5 ${FONT}`, color: '#F0EDE6', margin: 0, wordBreak: 'break-word' }}>
                  {message || 'Your message will appear here...'}
                </p>
                <div style={{ font: `400 10px ${FONT}`, color: 'rgba(255,255,255,0.35)', marginTop: 8, textAlign: 'right' }}>
                  Just now
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div>
          {texts.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 32px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{'\uD83D\uDCF1'}</div>
              <p style={{ font: `500 16px ${FONT}`, color: C.text, marginBottom: 4 }}>No texts sent yet</p>
              <p style={{ font: `400 14px ${FONT}`, color: C.text2 }}>Compose your first text blast above.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Date', 'Audience', 'Recipients', 'Message', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, fontFamily: MONO, color: C.text2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {texts.map(t => (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 14px', font: `400 13px ${MONO}`, color: C.text2, whiteSpace: 'nowrap' }}>
                        {new Date(t.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 14px', font: `500 13px ${FONT}`, color: C.text }}>{t.audience}</td>
                      <td style={{ padding: '12px 14px', font: `600 13px ${FONT}`, color: C.gold }}>{t.recipientCount}</td>
                      <td style={{ padding: '12px 14px', font: `400 13px ${FONT}`, color: C.text2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.message}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge badge-green">Delivered</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <>
          <div onClick={() => setConfirm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: C.card, borderRadius: 16, padding: 32, width: 420, maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 1001,
          }}>
            <h3 style={{ font: `600 18px ${FONT}`, color: C.text, marginBottom: 8 }}>Send Text Blast?</h3>
            <p style={{ font: `400 14px/1.6 ${FONT}`, color: C.text2, marginBottom: 8 }}>
              This will send an SMS to <strong>{recipientCount}</strong> {AUDIENCES.find(a => a.id === audience)?.label.toLowerCase() || 'contacts'}.
            </p>
            <div style={{
              background: '#F8F7F4', borderRadius: 8, padding: '12px 16px', marginBottom: 20,
              font: `400 13px/1.5 ${FONT}`, color: C.text,
            }}>
              "{message.length > 120 ? message.slice(0, 120) + '...' : message}"
            </div>
            <div style={{
              background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ font: `400 12px ${FONT}`, color: C.gold }}>Demo Mode — In production, Twilio handles SMS delivery.</span>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(false)} style={{
                padding: '10px 20px', borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.card, color: C.text, font: `500 13px ${FONT}`, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleSend} disabled={sending} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: C.gold, color: '#fff', font: `600 13px ${FONT}`, cursor: 'pointer',
                opacity: sending ? 0.7 : 1,
              }}>{sending ? 'Sending...' : 'Send Now'}</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .text-compose-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
