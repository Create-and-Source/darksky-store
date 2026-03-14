import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { QUICK_QUESTIONS, ROLE_QUICK_QUESTIONS, findBestResponse, getFollowUpSuggestions } from '../data/helpKnowledge';
import { useRole } from '../AdminLayout';

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const CHAT_STORAGE_KEY = 'ds_help_chat_history';
const CHAT_SEEN_KEY = 'ds_help_chat_seen';

function getChatHistory() {
  try { return JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY)) || []; } catch { return []; }
}
function saveChatHistory(msgs) {
  sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
}

export default function HelpChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(getChatHistory);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [firstVisit, setFirstVisit] = useState(() => !localStorage.getItem(CHAT_SEEN_KEY));
  const [panelSize, setPanelSize] = useState({ w: 400, h: 520 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(null); // null = default bottom-right
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const headerRef = useRef(null);
  const location = useLocation();
  const currentRoute = location.pathname;
  const role = useRole();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Persist messages
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
      localStorage.setItem(CHAT_SEEN_KEY, '1');
      setFirstVisit(false);
      // Set initial suggestions based on role
      if (messages.length === 0) {
        setSuggestions(ROLE_QUICK_QUESTIONS[role] || QUICK_QUESTIONS);
      }
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Dragging
  const handleDragStart = useCallback((e) => {
    if (window.innerWidth <= 600) return; // no drag on mobile
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      setPosition({
        left: Math.max(0, Math.min(x, window.innerWidth - panelSize.w)),
        top: Math.max(0, Math.min(y, window.innerHeight - panelSize.h)),
      });
    };
    const handleUp = () => setDragging(false);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, dragOffset, panelSize]);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text.trim(), time: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setSuggestions([]);

    // Simulate response delay for natural feel
    const delay = 400 + Math.random() * 600;
    setTimeout(() => {
      const result = findBestResponse(text, currentRoute, role);
      const botMsg = { role: 'assistant', content: result.answer, time: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);

      // Get follow-up suggestions
      const followUps = getFollowUpSuggestions(result.feature, currentRoute);
      // Filter out the question that was just asked
      setSuggestions(followUps.filter(q => q.toLowerCase() !== text.toLowerCase()).slice(0, 3));
    }, delay);
  }, [currentRoute, role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  // Panel positioning
  const panelStyle = isMobile
    ? {
        position: 'fixed', inset: 0, zIndex: 10002,
        display: 'flex', flexDirection: 'column',
        background: '#FFFFFF',
        animation: 'chatSlideUp 0.3s cubic-bezier(.16,1,.3,1)',
      }
    : {
        position: 'fixed',
        zIndex: 10002,
        width: panelSize.w,
        height: panelSize.h,
        ...(position
          ? { left: position.left, top: position.top }
          : { right: 24, bottom: 24 }
        ),
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: position ? 'none' : 'chatSlideUp 0.3s cubic-bezier(.16,1,.3,1)',
      };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          className="ds-chat-btn"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 16, right: 16, zIndex: 10001,
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8941E 100%)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: firstVisit ? 'chatPulse 2s ease-in-out infinite' : 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(212,175,55,0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,175,55,0.35)';
          }}
          title="Ask for help"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </button>
      )}

      {/* Label under button */}
      {!open && (
        <div className="ds-chat-label" style={{
          position: 'fixed', bottom: 0, right: 16, zIndex: 10001,
          width: 52, textAlign: 'center',
          font: `500 9px ${FONT}`, color: '#94A3B8',
          pointerEvents: 'none',
        }}>
          Ask for help
        </div>
      )}

      {/* Chat Panel */}
      {open && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <div
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10001 }}
            />
          )}

          <div ref={panelRef} style={panelStyle}>
            {/* Header */}
            <div
              ref={headerRef}
              onMouseDown={handleDragStart}
              style={{
                padding: '16px 18px',
                background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: isMobile ? 'default' : 'move',
                flexShrink: 0,
                borderRadius: isMobile ? 0 : '16px 16px 0 0',
                userSelect: 'none',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8941E 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: '#FFFFFF',
              }}>
                &#10022;
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ font: `600 15px ${FONT}`, color: '#FFFFFF' }}>
                  Dark Sky Assistant
                </div>
                <div style={{ font: `400 12px ${FONT}`, color: 'rgba(255,255,255,0.6)' }}>
                  Always here to help
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                &#10005;
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: 16,
              display: 'flex', flexDirection: 'column', gap: 12,
              background: '#FAFAF8',
            }}>
              {/* Welcome message if no history */}
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 8px' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>&#10022;</div>
                  <div style={{ font: `600 16px ${FONT}`, color: '#1E293B', marginBottom: 6 }}>
                    Welcome to Dark Sky Help
                  </div>
                  <div style={{ font: `400 14px ${FONT}`, color: '#64748B', marginBottom: 20 }}>
                    Ask me anything about the admin system. Here are some common questions:
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 8,
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #D4AF37, #B8941E)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#FFFFFF', marginTop: 2,
                    }}>
                      &#10022;
                    </div>
                  )}
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? '#D4AF37' : '#F8F7F4',
                    color: msg.role === 'user' ? '#FFFFFF' : '#1E293B',
                    font: `400 14px/1.6 ${FONT}`,
                    border: msg.role === 'user' ? 'none' : '1px solid #E8E5DE',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #D4AF37, #B8941E)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#FFFFFF',
                  }}>
                    &#10022;
                  </div>
                  <div style={{
                    padding: '12px 16px', borderRadius: '14px 14px 14px 4px',
                    background: '#F8F7F4', border: '1px solid #E8E5DE',
                    display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    <span className="chat-typing-dot" style={{ animationDelay: '0s' }} />
                    <span className="chat-typing-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="chat-typing-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}

              {/* Suggestion chips */}
              {suggestions.length > 0 && !typing && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 6,
                  padding: '4px 0',
                }}>
                  {suggestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      style={{
                        padding: '7px 14px', borderRadius: 20,
                        background: 'transparent',
                        border: '1px solid rgba(212,175,55,0.4)',
                        color: '#B8941E', cursor: 'pointer',
                        font: `400 13px ${FONT}`,
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                        e.currentTarget.style.borderColor = '#D4AF37';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: '12px 14px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex', gap: 8,
                background: '#FFFFFF',
                flexShrink: 0,
                borderRadius: isMobile ? 0 : '0 0 16px 16px',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything about your admin..."
                style={{
                  flex: 1, height: 44, padding: '0 14px',
                  border: '1px solid #E2E8F0', borderRadius: 10,
                  font: `400 14px ${FONT}`, color: '#1E293B',
                  outline: 'none', background: '#FAFAF8',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#D4AF37'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                style={{
                  width: 44, height: 44, borderRadius: 10, border: 'none',
                  background: input.trim() && !typing
                    ? 'linear-gradient(135deg, #D4AF37 0%, #B8941E 100%)'
                    : '#E2E8F0',
                  color: input.trim() && !typing ? '#FFFFFF' : '#94A3B8',
                  cursor: input.trim() && !typing ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22,2 15,22 11,13 2,9"/>
                </svg>
              </button>
            </form>

            {/* Resize handle (desktop only) */}
            {!isMobile && (
              <div
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: 14, height: 14, cursor: 'nw-resize',
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startW = panelSize.w;
                  const startH = panelSize.h;
                  const rect = panelRef.current?.getBoundingClientRect();
                  const startRight = rect ? rect.right : window.innerWidth - 24;
                  const startBottom = rect ? rect.bottom : window.innerHeight - 24;

                  const onMove = (ev) => {
                    const newW = Math.max(320, Math.min(600, startW + (startX - ev.clientX)));
                    const newH = Math.max(400, Math.min(700, startH + (startY - ev.clientY)));
                    setPanelSize({ w: newW, h: newH });
                    if (!position) {
                      // Keep anchored to bottom-right
                    } else {
                      setPosition({
                        left: startRight - newW,
                        top: startBottom - newH,
                      });
                    }
                  };
                  const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                  };
                  document.addEventListener('mousemove', onMove);
                  document.addEventListener('mouseup', onUp);
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Styles */}
      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(212,175,55,0.35); }
          50% { box-shadow: 0 4px 30px rgba(212,175,55,0.6), 0 0 0 8px rgba(212,175,55,0.12); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatDotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .chat-typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #D4AF37;
          display: inline-block;
          animation: chatDotBounce 1.2s ease-in-out infinite;
        }
        @media (max-width: 600px) {
          /* Ensure input stays above keyboard on mobile */
          .chat-panel-mobile-input {
            position: sticky;
            bottom: 0;
          }
        }
      `}</style>
    </>
  );
}
