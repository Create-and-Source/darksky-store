import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/events', label: 'Events' },
  { path: '/education', label: 'Education', dropdown: [
    { path: '/education', label: 'Programs' },
    { path: '/field-trips', label: 'Field Trips' },
  ]},
  { path: '/membership', label: 'Membership' },
  { path: '/shop', label: 'Shop' },
  { path: '/contact', label: 'Contact' },
];

const MOBILE_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/events', label: 'Events' },
  { path: '/membership', label: 'Membership' },
  { path: '/shop', label: 'Shop' },
  { path: '/education', label: 'Education' },
  { path: '/field-trips', label: 'Field Trips' },
  { path: '/contact', label: 'Contact' },
];

export default function Nav({ cartCount, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
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
      localStorage.setItem('ds_admin_role', 'admin');
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
          {NAV_LINKS.map(({ path, label, dropdown }) => (
            dropdown ? (
              <div key={path} className="nav-dropdown-wrap" onMouseEnter={() => setDropdownOpen(path)} onMouseLeave={() => setDropdownOpen(null)}>
                <a className={isActive(path)} onClick={() => go(path)}>{label}</a>
                {dropdownOpen === path && (
                  <div className="nav-dropdown">
                    {dropdown.map(d => (
                      <a key={d.path} onClick={() => { go(d.path); setDropdownOpen(null); }}>{d.label}</a>
                    ))}
                  </div>
                )}
              </div>
            ) : <a key={path} className={isActive(path)} onClick={() => go(path)}>{label}</a>
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

          <button className="nav-donate" onClick={() => go('/donate')}>Donate</button>
          <button className="nav-join" onClick={() => go('/membership')}>Join</button>
          <button className="nav-signin" onClick={() => go('/signin')}>Sign In</button>

          {/* Admin toggle — always visible */}
          <div className="nav-admin-toggle-wrap">
            {adminOn && <span className="nav-admin-badge">ADMIN</span>}
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
        {MOBILE_LINKS.map(({ path, label }, i) => (
          <button
            key={path}
            onClick={() => go(path)}
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
              transitionDelay: menuOpen ? `${i * 60}ms` : '0ms',
            }}
          >
            {label}
          </button>
        ))}

        {/* Cart */}
        <button
          onClick={() => { onCartClick(); setMenuOpen(false); }}
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
            transitionDelay: menuOpen ? `${MOBILE_LINKS.length * 60}ms` : '0ms',
          }}
        >
          Cart ({cartCount})
        </button>

        {/* Donate + Join buttons */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280,
          marginTop: 16,
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
          transitionDelay: menuOpen ? `${(MOBILE_LINKS.length + 1) * 60}ms` : '0ms',
        }}>
          <button
            onClick={() => go('/donate')}
            style={{
              padding: '14px 0', borderRadius: 100, border: '1px solid var(--gold)',
              background: 'transparent', color: 'var(--gold)',
              font: '500 14px "Plus Jakarta Sans", sans-serif', letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >Donate</button>
          <button
            onClick={() => go('/membership')}
            style={{
              padding: '14px 0', borderRadius: 100, border: '1px solid var(--gold)',
              background: 'var(--gold)', color: 'var(--bg)',
              font: '500 14px "Plus Jakarta Sans", sans-serif', letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >Join</button>
          <button
            onClick={() => go('/signin')}
            style={{
              padding: '12px 0', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: 'var(--text2)',
              font: '400 14px "Plus Jakarta Sans", sans-serif', letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >Sign In</button>
        </div>

        {/* Mobile admin toggle */}
        <div
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
            transitionDelay: menuOpen ? `${(MOBILE_LINKS.length + 2) * 60}ms` : '0ms',
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
        .nav-dropdown-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .nav-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(4,4,12,0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          padding: 6px 0;
          min-width: 140px;
          z-index: 300;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .nav-dropdown a {
          display: block;
          padding: 10px 20px;
          font: 500 11px 'Plus Jakarta Sans', sans-serif !important;
          letter-spacing: 0.12em !important;
          text-transform: uppercase;
          color: var(--text2) !important;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .nav-dropdown a:hover {
          color: var(--gold) !important;
          background: rgba(255,255,255,0.04);
        }
        .nav-dropdown a::before { display: none !important; }
        .nav-donate {
          font: 500 11px 'Plus Jakarta Sans', sans-serif;
          letter-spacing: 0.08em;
          padding: 8px 18px;
          border-radius: 100px;
          border: 1px solid var(--gold);
          color: var(--gold);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }
        .nav-donate:hover {
          background: rgba(212,175,55,0.1);
        }
        .nav-signin {
          font: 400 11px 'Plus Jakarta Sans', sans-serif;
          letter-spacing: 0.06em;
          padding: 8px 16px;
          border-radius: 100px;
          border: none;
          color: var(--text2);
          background: transparent;
          cursor: pointer;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-signin:hover { color: var(--gold); }
        @media (max-width: 1024px) {
          .nav-donate, .nav-join, .nav-signin { display: none !important; }
        }
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

        @media (max-width: 1024px) {
          .nav-admin-toggle-wrap { display: none; }
        }
      `}</style>
    </>
  );
}
