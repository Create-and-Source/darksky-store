import { useState, useEffect, useRef, useMemo } from 'react';
import { getMessages, addMessage, subscribe } from '../data/store';

const C = { bg: '#FAFAF8', card: '#FFFFFF', border: '#E8E5DF', gold: '#C5A55A', goldHover: '#b8993f', text: '#1A1A2E', text2: '#7C7B76', muted: '#B5B3AD', success: '#3D8C6F', danger: '#C45B5B' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

const STAFF_CONTACTS = [
  { name: 'Dr. J', role: 'executive_director', label: 'Executive Director' },
  { name: 'Maria', role: 'education_director', label: 'Education Director' },
  { name: 'Josi', role: 'shop_manager', label: 'Gift Shop Manager' },
  { name: 'Nancy', role: 'treasurer', label: 'Treasurer' },
  { name: 'Jordan', role: 'volunteer_coordinator', label: 'Volunteer Coordinator' },
  { name: 'Sam', role: 'visitor_services', label: 'Visitor Services' },
  { name: 'Alex', role: 'social_media', label: 'Social Media Manager' },
  { name: 'Mrs. Rodriguez', role: 'school', label: 'School Contact' },
];

const ROLE_LABELS = {
  executive_director: 'Executive Director', treasurer: 'Treasurer', board: 'Board Member',
  shop_manager: 'Gift Shop Manager', shop_staff: 'Gift Shop Staff', visitor_services: 'Visitor Services',
  education_director: 'Education Director', social_media: 'Social Media Manager',
  volunteer_coordinator: 'Volunteer Coordinator', payroll: 'Payroll / HR', admin: 'Admin',
  school: 'School Contact',
};

function getInitial(name) {
  return (name || '?').charAt(0).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6', '#6366F1', '#EF4444'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(ts) {
  const now = new Date();
  const d = new Date(ts);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateHeader(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getConversationId(name1, role1, name2, role2) {
  const a = `${name1}-${role1}`;
  const b = `${name2}-${role2}`;
  return a < b ? `CONV-${a}-${b}` : `CONV-${b}-${a}`;
}

// ── Page Tour Steps ──
const TOUR_STEPS = [
  { target: '[data-tour="msg-sidebar"]', title: 'Conversations', text: 'All your conversations appear here. Unread messages show a blue badge.' },
  { target: '[data-tour="msg-compose"]', title: 'New Message', text: 'Start a new conversation with any staff member or school contact.' },
  { target: '[data-tour="msg-search"]', title: 'Search', text: 'Filter conversations by name or message content.' },
  { target: '[data-tour="msg-chat"]', title: 'Chat Area', text: 'Messages appear here. Your messages are gold, others are gray.' },
  { target: '[data-tour="msg-input"]', title: 'Send Messages', text: 'Type a message and press Enter or click Send.' },
];

export default function Messages() {
  const [messages, setMessages] = useState(getMessages);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [newMsgTo, setNewMsgTo] = useState('');
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentUser = localStorage.getItem('ds_user_name') || 'Dr. J';
  const currentRole = localStorage.getItem('ds_admin_role') || 'executive_director';

  // Subscribe to store changes
  useEffect(() => {
    const unsub = subscribe(() => setMessages(getMessages()));
    return unsub;
  }, []);

  // Build conversations from messages — only include conversations where the current user is a participant
  const conversations = useMemo(() => {
    const convMap = {};
    messages.forEach(msg => {
      const isFromMe = msg.from.name === currentUser && msg.from.role === currentRole;
      const isToMe = msg.to.name === currentUser && msg.to.role === currentRole;

      // Skip messages that don't involve the current user
      if (!isFromMe && !isToMe) return;

      const other = isFromMe ? msg.to : msg.from;
      // Build a stable conversation key using both participants
      const convKey = getConversationId(msg.from.name, msg.from.role, msg.to.name, msg.to.role);

      if (!convMap[convKey]) {
        convMap[convKey] = {
          id: convKey,
          other,
          messages: [],
          lastMessage: null,
          lastTimestamp: '',
          unread: 0,
        };
      }
      convMap[convKey].messages.push(msg);
      if (!convMap[convKey].lastTimestamp || msg.timestamp > convMap[convKey].lastTimestamp) {
        convMap[convKey].lastTimestamp = msg.timestamp;
        convMap[convKey].lastMessage = msg;
      }
      if (!msg.read && !isFromMe) {
        convMap[convKey].unread++;
      }
    });

    return Object.values(convMap).sort((a, b) => b.lastTimestamp.localeCompare(a.lastTimestamp));
  }, [messages, currentUser, currentRole]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c =>
      c.other.name.toLowerCase().includes(q) ||
      c.messages.some(m => m.text.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  // Get selected conversation
  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const selectedMessages = selectedConv ? selectedConv.messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp)) : [];

  // Auto-select first conversation, or reset if current selection is no longer visible
  useEffect(() => {
    if (selectedConvId && !conversations.find(c => c.id === selectedConvId)) {
      setSelectedConvId(conversations.length > 0 ? conversations[0].id : null);
    } else if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessages.length]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (!selectedConv) return;
    const all = getMessages();
    let changed = false;
    const updated = all.map(m => {
      if (!m.read && !(m.from.name === currentUser && m.from.role === currentRole)) {
        const convKey = getConversationId(m.from.name, m.from.role, m.to.name, m.to.role);
        if (convKey === selectedConvId) {
          changed = true;
          return { ...m, read: true };
        }
      }
      return m;
    });
    if (changed) {
      localStorage.setItem('ds_messages', JSON.stringify(updated));
      setMessages(updated);
    }
  }, [selectedConvId, selectedConv, currentUser]);

  // Check if tour has been seen
  useEffect(() => {
    if (!localStorage.getItem('ds_messages_tour_seen')) {
      setShowTour(true);
    }
  }, []);

  const dismissTour = () => {
    setShowTour(false);
    localStorage.setItem('ds_messages_tour_seen', '1');
  };

  const sendMessage = () => {
    if (!inputText.trim() || !selectedConv) return;
    addMessage({
      conversationId: selectedConvId,
      from: { name: currentUser, role: currentRole },
      to: selectedConv.other,
      text: inputText.trim(),
      read: false,
    });
    setInputText('');
    setMessages(getMessages());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const startNewConversation = () => {
    if (!newMsgTo) return;
    const contact = STAFF_CONTACTS.find(c => c.name === newMsgTo);
    if (!contact) return;
    const convKey = getConversationId(currentUser, currentRole, contact.name, contact.role);
    // Check if conversation already exists
    const existing = conversations.find(c => c.id === convKey);
    if (existing) {
      setSelectedConvId(existing.id);
    } else {
      setSelectedConvId(convKey);
    }
    setShowNewMsg(false);
    setNewMsgTo('');
    setMobileShowChat(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = '';
    selectedMessages.forEach(msg => {
      const dateStr = new Date(msg.timestamp).toDateString();
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ type: 'date', date: msg.timestamp });
      }
      groups.push({ type: 'message', msg });
    });
    return groups;
  }, [selectedMessages]);

  return (
    <div style={{ height: 'calc(100vh - 57px)', display: 'flex', background: C.bg, overflow: 'hidden' }}>
      <style>{`
        .msg-conv-item { transition: background 0.15s; cursor: pointer; }
        .msg-conv-item:hover { background: #F0EDE6 !important; }
        .msg-conv-item.active { background: #EDE8D8 !important; }
        .msg-bubble { animation: msgFadeIn 0.2s ease; }
        @keyframes msgFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .msg-send-btn { transition: all 0.15s; }
        .msg-send-btn:hover:not(:disabled) { background: ${C.goldHover} !important; transform: scale(1.03); }
        .msg-input:focus { border-color: ${C.gold} !important; box-shadow: 0 0 0 3px rgba(197,165,90,0.12); }
        @media (max-width: 768px) {
          .msg-sidebar { ${''} }
          .msg-chat-panel { ${''} }
        }
        .msg-new-btn { transition: all 0.15s; }
        .msg-new-btn:hover { background: ${C.goldHover} !important; }
        .msg-tour-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .msg-tour-card { background: #fff; border-radius: 12px; padding: 28px; max-width: 380px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
      `}</style>

      {/* ── Left Sidebar ── */}
      <div
        className="msg-sidebar"
        data-tour="msg-sidebar"
        style={{
          width: 320, minWidth: 320, borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', background: C.card,
          ...(mobileShowChat ? { display: window.innerWidth <= 768 ? 'none' : 'flex' } : {}),
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ font: `600 18px ${FONT}`, color: C.text, margin: 0 }}>
              Messages
              {totalUnread > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 20, height: 20, borderRadius: 10, background: '#3B82F6', color: '#fff',
                  font: `600 11px ${FONT}`, padding: '0 6px', marginLeft: 8, verticalAlign: 'middle',
                }}>{totalUnread}</span>
              )}
            </h2>
            <button
              data-tour="msg-compose"
              className="msg-new-btn"
              onClick={() => setShowNewMsg(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: C.gold, border: 'none', cursor: 'pointer',
                font: `600 12px ${FONT}`, color: '#fff',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New
            </button>
          </div>

          {/* Search */}
          <div data-tour="msg-search" style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="msg-input"
              style={{
                width: '100%', padding: '8px 10px 8px 32px', height: 36,
                border: `1px solid ${C.border}`, borderRadius: 8, boxSizing: 'border-box',
                font: `400 13px ${FONT}`, color: C.text, background: C.bg, outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', font: `400 13px ${FONT}`, color: C.muted }}>
              {search ? 'No conversations match your search' : 'No conversations yet'}
            </div>
          )}
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              className={`msg-conv-item${selectedConvId === conv.id ? ' active' : ''}`}
              onClick={() => { setSelectedConvId(conv.id); setMobileShowChat(true); }}
              style={{
                padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
                borderBottom: `1px solid ${C.border}`,
                background: selectedConvId === conv.id ? '#EDE8D8' : 'transparent',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: getAvatarColor(conv.other.name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: `600 15px ${FONT}`, color: '#fff',
              }}>
                {getInitial(conv.other.name)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{
                    font: `${conv.unread > 0 ? '600' : '500'} 14px ${FONT}`, color: C.text,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {conv.other.name}
                  </span>
                  <span style={{ font: `400 11px ${MONO}`, color: C.muted, flexShrink: 0, marginLeft: 8 }}>
                    {timeAgo(conv.lastTimestamp)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    font: `400 13px ${FONT}`, color: conv.unread > 0 ? C.text : C.text2,
                    fontWeight: conv.unread > 0 ? 500 : 400,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  }}>
                    {conv.lastMessage?.from.name === currentUser && conv.lastMessage?.from.role === currentRole ? 'You: ' : ''}
                    {conv.lastMessage?.text || ''}
                  </span>
                  {conv.unread > 0 && (
                    <span style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: 18, height: 18, borderRadius: 9, background: '#3B82F6',
                      font: `600 10px ${FONT}`, color: '#fff', padding: '0 5px', marginLeft: 8, flexShrink: 0,
                    }}>{conv.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Chat Panel ── */}
      <div
        className="msg-chat-panel"
        data-tour="msg-chat"
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', background: C.bg,
          ...((!mobileShowChat && window.innerWidth <= 768) ? { display: 'none' } : {}),
        }}
      >
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: C.card,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {/* Mobile back button */}
              <button
                onClick={() => setMobileShowChat(false)}
                style={{
                  display: window.innerWidth <= 768 ? 'flex' : 'none',
                  alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
                  padding: 4, color: C.text2,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
              </button>

              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: getAvatarColor(selectedConv.other.name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: `600 14px ${FONT}`, color: '#fff', flexShrink: 0,
              }}>
                {getInitial(selectedConv.other.name)}
              </div>
              <div>
                <div style={{ font: `600 15px ${FONT}`, color: C.text }}>{selectedConv.other.name}</div>
                <div style={{ font: `400 11px ${MONO}`, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {ROLE_LABELS[selectedConv.other.role] || selectedConv.other.role}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {groupedMessages.map((item, i) => {
                if (item.type === 'date') {
                  return (
                    <div key={`date-${i}`} style={{
                      textAlign: 'center', margin: '20px 0 12px',
                    }}>
                      <span style={{
                        display: 'inline-block', padding: '4px 14px', borderRadius: 12,
                        background: '#EDE8D8', font: `500 11px ${MONO}`, color: C.text2,
                        letterSpacing: '0.3px',
                      }}>
                        {formatDateHeader(item.date)}
                      </span>
                    </div>
                  );
                }

                const msg = item.msg;
                const isMe = msg.from.name === currentUser && msg.from.role === currentRole;
                return (
                  <div key={msg.id} className="msg-bubble" style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: 10,
                  }}>
                    {!isMe && (
                      <span style={{
                        font: `500 11px ${FONT}`, color: C.text2, marginBottom: 3, paddingLeft: 4,
                      }}>
                        {msg.from.name}
                      </span>
                    )}
                    <div style={{
                      maxWidth: '72%', padding: '10px 14px', borderRadius: 14,
                      background: isMe
                        ? 'linear-gradient(135deg, #C5A55A, #a08520)'
                        : C.card,
                      color: isMe ? '#fff' : C.text,
                      border: isMe ? 'none' : `1px solid ${C.border}`,
                      font: `400 14px/1.5 ${FONT}`,
                      borderBottomRightRadius: isMe ? 4 : 14,
                      borderBottomLeftRadius: isMe ? 14 : 4,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      {msg.text}
                    </div>
                    <span style={{
                      font: `400 10px ${MONO}`, color: C.muted, marginTop: 3,
                      padding: isMe ? '0 4px 0 0' : '0 0 0 4px',
                    }}>
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div data-tour="msg-input" style={{
              padding: '12px 20px', borderTop: `1px solid ${C.border}`, background: C.card,
              display: 'flex', gap: 10, alignItems: 'flex-end',
            }}>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="msg-input"
                style={{
                  flex: 1, padding: '10px 14px', minHeight: 40, maxHeight: 120,
                  border: `1px solid ${C.border}`, borderRadius: 12, resize: 'none',
                  font: `400 14px ${FONT}`, color: C.text, background: C.bg,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <button
                className="msg-send-btn"
                onClick={sendMessage}
                disabled={!inputText.trim()}
                style={{
                  padding: '10px 18px', height: 40, borderRadius: 10,
                  background: inputText.trim() ? C.gold : C.muted,
                  border: 'none', cursor: inputText.trim() ? 'pointer' : 'default',
                  font: `600 13px ${FONT}`, color: '#fff',
                  display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  opacity: inputText.trim() ? 1 : 0.6,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
                Send
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: C.muted,
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <p style={{ font: `500 16px ${FONT}`, color: C.text2, marginTop: 16 }}>Select a conversation</p>
            <p style={{ font: `400 13px ${FONT}`, color: C.muted }}>or start a new one</p>
          </div>
        )}
      </div>

      {/* ── New Message Modal ── */}
      {showNewMsg && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowNewMsg(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.card, borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <h3 style={{ font: `600 17px ${FONT}`, color: C.text, margin: '0 0 20px' }}>New Message</h3>

            <label style={{
              display: 'block', font: `500 11px ${MONO}`, color: C.muted,
              textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6,
            }}>To</label>
            <select
              value={newMsgTo}
              onChange={e => setNewMsgTo(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', height: 42,
                border: `1px solid ${C.border}`, borderRadius: 8,
                font: `400 14px ${FONT}`, color: newMsgTo ? C.text : C.muted,
                background: C.bg, outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              <option value="">Select a contact...</option>
              {STAFF_CONTACTS.filter(c => c.name !== currentUser).map(c => (
                <option key={c.name} value={c.name}>{c.name} — {c.label}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowNewMsg(false); setNewMsgTo(''); }}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: `1px solid ${C.border}`,
                  background: 'transparent', cursor: 'pointer',
                  font: `500 13px ${FONT}`, color: C.text2,
                }}
              >Cancel</button>
              <button
                onClick={startNewConversation}
                disabled={!newMsgTo}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: newMsgTo ? C.gold : C.muted, cursor: newMsgTo ? 'pointer' : 'default',
                  font: `600 13px ${FONT}`, color: '#fff', opacity: newMsgTo ? 1 : 0.6,
                }}
              >Start Conversation</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Tour ── */}
      {showTour && (
        <div className="msg-tour-overlay" onClick={dismissTour}>
          <div className="msg-tour-card" onClick={e => e.stopPropagation()}>
            <div style={{ font: `500 11px ${MONO}`, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              {tourStep + 1} of {TOUR_STEPS.length}
            </div>
            <h3 style={{ font: `600 18px ${FONT}`, color: C.text, margin: '0 0 8px' }}>
              {TOUR_STEPS[tourStep].title}
            </h3>
            <p style={{ font: `400 14px/1.6 ${FONT}`, color: C.text2, margin: '0 0 24px' }}>
              {TOUR_STEPS[tourStep].text}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={dismissTour} style={{
                padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`,
                background: 'transparent', cursor: 'pointer', font: `500 13px ${FONT}`, color: C.text2,
              }}>Skip</button>
              <button
                onClick={() => tourStep < TOUR_STEPS.length - 1 ? setTourStep(tourStep + 1) : dismissTour()}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: C.gold, cursor: 'pointer', font: `600 13px ${FONT}`, color: '#fff',
                }}
              >
                {tourStep < TOUR_STEPS.length - 1 ? 'Next' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
