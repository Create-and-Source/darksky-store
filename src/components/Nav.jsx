import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/events', label: 'Events' },
  { path: '/membership', label: 'Membership' },
  { path: '/education', label: 'Education' },
  { path: '/shop', label: 'Shop' },
];

export default function Nav({ cartCount, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminOn, setAdminOn] = useState(() => localStorage.getItem('ds_user_role') === 'manager');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const go = (path) => { navigate(path); setMenuOpen(false); };
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' ? 'active' : '';
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const toggleAdmin = () => {
    if (adminOn) {
      localStorage.removeItem('ds_user_name');
      localStorage.removeItem('ds_user_role');
      localStorage.removeItem('ds_admin_role');
      setAdminOn(false);
    } else {
      localStorage.setItem('ds_user_name', 'Nancy');
      localStorage.setItem('ds_user_role', 'manager');
      localStorage.setItem('ds_admin_role', 'manager');
      setAdminOn(true);
    }
    window.dispatchEvent(new Event('ds-auth-change'));
  };

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-brand" onClick={() => go('/')}>
          <span className="nav-logo-star">✦</span>
          <span className="nav-logo-text">IDSDC</span>
        </div>

        <div className="nav-center">
          {NAV_LINKS.map(({ path, label }) => (
            <a key={path} className={isActive(path)} onClick={() => go(path)}>{label}</a>
          ))}
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

          <button className="nav-join" onClick={() => go('/membership')}>Join</button>

          {/* Admin toggle — subtle, right side */}
          <div className="nav-admin-toggle-wrap">
            {adminOn && (
              <span className="nav-admin-badge">ADMIN</span>
            )}
            <button
              className={`nav-admin-switch${adminOn ? ' on' : ''}`}
              onClick={toggleAdmin}
              aria-label="Toggle admin view"
              title={adminOn ? 'Switch to customer view' : 'Switch to admin view'}
            >
              <svg className="nav-admin-switch-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {adminOn ? (
                  <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>
                ) : (
                  <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></>
                )}
              </svg>
              <span className="nav-admin-switch-knob" />
            </button>
            <span className="nav-admin-label">Admin</span>
            {adminOn && (
              <a className="nav-admin-dash-link" onClick={() => go('/admin')}>
                Dashboard &rarr;
              </a>
            )}
          </div>

          <button
            className={`nav-ham ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mob-menu ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(({ path, label }, i) => (
          <button
            key={path}
            onClick={() => go(path)}
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
              transitionDelay: menuOpen ? `${i * 80}ms` : '0ms',
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => { onCartClick(); setMenuOpen(false); }}
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
            transitionDelay: menuOpen ? `${NAV_LINKS.length * 80}ms` : '0ms',
          }}
        >
          Cart ({cartCount})
        </button>
        {/* Mobile admin toggle */}
        <div
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
            transitionDelay: menuOpen ? `${(NAV_LINKS.length + 1) * 80}ms` : '0ms',
            display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
            padding: '8px 0',
          }}
        >
          <button
            className={`nav-admin-switch${adminOn ? ' on' : ''}`}
            onClick={toggleAdmin}
            style={{ position: 'relative' }}
          >
            <svg className="nav-admin-switch-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {adminOn ? (
                <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>
              ) : (
                <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></>
              )}
            </svg>
            <span className="nav-admin-switch-knob" />
          </button>
          <span style={{ font: '400 14px "DM Sans", sans-serif', color: adminOn ? 'var(--gold)' : 'var(--muted)' }}>
            Admin {adminOn ? 'On' : 'Off'}
          </span>
          {adminOn && (
            <a onClick={() => go('/admin')} style={{ font: '400 14px "DM Sans", sans-serif', color: 'var(--gold)', cursor: 'pointer' }}>
              Dashboard &rarr;
            </a>
          )}
        </div>
      </div>

      <style>{`
        .nav-admin-toggle-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 4px;
        }
        .nav-admin-badge {
          font: 600 9px/1 'JetBrains Mono', monospace;
          letter-spacing: 0.12em;
          color: var(--gold, #D4AF37);
          background: rgba(212,175,55,0.12);
          padding: 3px 6px;
          border-radius: 3px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .nav-admin-label {
          font: 400 11px 'DM Sans', sans-serif;
          color: rgba(255,255,255,0.2);
          user-select: none;
        }
        .nav-admin-switch {
          position: relative;
          width: 32px;
          height: 18px;
          border-radius: 9px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: background 0.25s, border-color 0.25s;
          padding: 0;
          flex-shrink: 0;
        }
        .nav-admin-switch:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.1);
        }
        .nav-admin-switch.on {
          background: rgba(212,175,55,0.25);
          border-color: rgba(212,175,55,0.35);
        }
        .nav-admin-switch-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          transition: transform 0.25s cubic-bezier(.16,1,.3,1), background 0.25s;
        }
        .nav-admin-switch.on .nav-admin-switch-knob {
          transform: translateX(14px);
          background: var(--gold, #D4AF37);
        }
        .nav-admin-switch-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          pointer-events: none;
        }
        .nav-admin-switch:hover .nav-admin-switch-icon {
          opacity: 0;
        }
        .nav-admin-dash-link {
          font: 400 11px 'DM Sans', sans-serif;
          color: var(--gold, #D4AF37);
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          white-space: nowrap;
          animation: fadeIn 0.2s ease;
        }
        .nav-admin-dash-link:hover { opacity: 1; }

        @media (max-width: 768px) {
          .nav-admin-toggle-wrap { display: none; }
        }
      `}</style>
    </>
  );
}
