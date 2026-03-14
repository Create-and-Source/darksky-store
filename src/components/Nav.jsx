import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Nav({ cartCount, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const eduRef = useRef(null);
  const eduTimeout = useRef(null);

  const go = (path) => { navigate(path); setMenuOpen(false); setEduOpen(false); };
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const isEduActive = location.pathname.startsWith('/field-trips') || location.pathname.startsWith('/education');

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (eduRef.current && !eduRef.current.contains(e.target)) setEduOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openEdu = () => { clearTimeout(eduTimeout.current); setEduOpen(true); };
  const closeEdu = () => { eduTimeout.current = setTimeout(() => setEduOpen(false), 150); };

  return (
    <>
      <nav className="nav">
        <div className="nav-brand" onClick={() => go('/')}>
          <div className="nav-mark">✦</div>
          <div className="nav-name">
            <small>IDSDC Gift Shop</small>
            Dark Sky
          </div>
        </div>

        <div className="nav-links">
          <a className={isActive('/')} onClick={() => go('/')}>Home</a>
          <a className={isActive('/shop')} onClick={() => go('/shop')}>Shop</a>
          <a className={isActive('/events')} onClick={() => go('/events')}>Events</a>

          {/* Education dropdown */}
          <div ref={eduRef} style={{ position: 'relative' }} onMouseEnter={openEdu} onMouseLeave={closeEdu}>
            <a
              className={isEduActive ? 'active' : ''}
              onClick={() => go('/field-trips')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              Education
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ marginTop: 1, opacity: 0.5 }}>
                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </a>
            {eduOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                marginTop: 20, minWidth: 200,
                background: 'rgba(8,8,15,0.97)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--border)', padding: '8px 0',
                zIndex: 300, animation: 'eduFade 0.15s ease-out',
              }}>
                <button onClick={() => go('/field-trips')} style={{
                  display: 'block', width: '100%', padding: '12px 20px',
                  background: 'none', border: 'none', textAlign: 'left',
                  font: '400 13px DM Sans', color: 'var(--muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.background = 'rgba(201,169,74,0.06)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--muted)'; e.target.style.background = 'none'; }}
                >
                  <div style={{ marginBottom: 2 }}>School Field Trips</div>
                  <div style={{ font: '300 10px DM Sans', opacity: 0.6 }}>K–12 STEM programs</div>
                </button>
              </div>
            )}
          </div>

          <a className={isActive('/membership')} onClick={() => go('/membership')}>Membership</a>
        </div>

        <div className="nav-right">
          <button className="nav-cart" onClick={onCartClick} aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}
          </button>
          <button className="nav-btn" onClick={() => go('/membership')}>Become a Member</button>
          <button
            className={`nav-ham ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      <div className={`mob-menu ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => go('/')}>Home</button>
        <button onClick={() => go('/shop')}>Shop</button>
        <button onClick={() => go('/events')}>Events</button>
        <button onClick={() => go('/field-trips')}>Field Trips</button>
        <button onClick={() => go('/membership')}>Membership</button>
        <button onClick={() => { onCartClick(); setMenuOpen(false); }}>Cart ({cartCount})</button>
      </div>

      <style>{`
        @keyframes eduFade {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
