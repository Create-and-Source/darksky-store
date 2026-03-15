import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/events', label: 'Events' },
  { path: '/membership', label: 'Membership' },
  { path: '/education', label: 'Education' },
  { path: '/shop', label: 'Shop' },
];

const STAFF_ACCOUNTS = [
  { email: 'nancy@darkskycenter.org', password: 'darksky', name: 'Nancy', role: 'manager' },
  { email: 'josie@darkskycenter.org', password: 'darksky', name: 'Josie', role: 'staff' },
  { email: 'volunteer@darkskycenter.org', password: 'darksky', name: 'Volunteer', role: 'volunteer' },
];

export default function Nav({ cartCount, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [signInError, setSignInError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from localStorage on mount
  useEffect(() => {
    const name = localStorage.getItem('ds_user_name');
    const role = localStorage.getItem('ds_user_role');
    if (name && role) setUser({ name, role });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  const go = (path) => { navigate(path); setMenuOpen(false); };
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' ? 'active' : '';
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    const account = STAFF_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
    );
    if (!account) {
      setSignInError('Invalid email or password');
      return;
    }
    localStorage.setItem('ds_user_name', account.name);
    localStorage.setItem('ds_user_role', account.role);
    localStorage.setItem('ds_admin_role', account.role);
    setUser({ name: account.name, role: account.role });
    setShowSignIn(false);
    setEmail('');
    setPassword('');
    setSignInError('');
  };

  const handleSignOut = () => {
    localStorage.removeItem('ds_user_name');
    localStorage.removeItem('ds_user_role');
    localStorage.removeItem('ds_admin_role');
    setUser(null);
    setShowUserMenu(false);
    // Force EditToggleButton to hide
    window.dispatchEvent(new Event('ds-auth-change'));
  };

  const initials = user ? user.name.charAt(0).toUpperCase() : '';

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
          {user && (
            <a className="nav-admin-link" onClick={() => go('/admin')}>Admin</a>
          )}
          <button className="nav-cart" onClick={onCartClick} aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}
          </button>

          {user ? (
            <div className="nav-user-wrap" ref={userMenuRef}>
              <button className="nav-user-btn" onClick={() => setShowUserMenu(v => !v)}>
                <span className="nav-avatar">{initials}</span>
                <span className="nav-user-name">{user.name}</span>
              </button>
              {showUserMenu && (
                <div className="nav-user-dropdown">
                  <div className="nav-user-dropdown-info">
                    <div className="nav-user-dropdown-name">{user.name}</div>
                    <div className="nav-user-dropdown-role">{user.role}</div>
                  </div>
                  <button onClick={() => { go('/admin'); setShowUserMenu(false); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    Admin Dashboard
                  </button>
                  <button onClick={handleSignOut}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-signin" onClick={() => setShowSignIn(true)}>Sign In</button>
          )}

          <button className="nav-join" onClick={() => go('/membership')}>Join</button>
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
        {user && (
          <button
            onClick={() => go('/admin')}
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
              transitionDelay: menuOpen ? `${NAV_LINKS.length * 80}ms` : '0ms',
              color: 'var(--gold)',
            }}
          >
            Admin
          </button>
        )}
        <button
          onClick={() => { onCartClick(); setMenuOpen(false); }}
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
            transitionDelay: menuOpen ? `${(NAV_LINKS.length + (user ? 1 : 0)) * 80}ms` : '0ms',
          }}
        >
          Cart ({cartCount})
        </button>
        {user ? (
          <button
            onClick={() => { handleSignOut(); setMenuOpen(false); }}
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
              transitionDelay: menuOpen ? `${(NAV_LINKS.length + 2) * 80}ms` : '0ms',
              color: 'var(--muted)',
              fontSize: 14,
            }}
          >
            Sign Out ({user.name})
          </button>
        ) : (
          <button
            onClick={() => { setShowSignIn(true); setMenuOpen(false); }}
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)',
              transitionDelay: menuOpen ? `${(NAV_LINKS.length + 1) * 80}ms` : '0ms',
              color: 'var(--muted)',
              fontSize: 14,
            }}
          >
            Sign In
          </button>
        )}
      </div>

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="signin-overlay" onClick={() => setShowSignIn(false)}>
          <div className="signin-modal" onClick={e => e.stopPropagation()}>
            <button className="signin-close" onClick={() => setShowSignIn(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="signin-star">✦</div>
            <h2 className="signin-title">Staff Sign In</h2>
            <p className="signin-sub">Access admin tools and edit mode</p>
            <form onSubmit={handleSignIn}>
              <label className="signin-label">Email</label>
              <input
                className="signin-input"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setSignInError(''); }}
                placeholder="you@darkskycenter.org"
                autoFocus
                required
              />
              <label className="signin-label">Password</label>
              <input
                className="signin-input"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setSignInError(''); }}
                placeholder="Enter password"
                required
              />
              {signInError && <div className="signin-error">{signInError}</div>}
              <button type="submit" className="signin-submit">Sign In</button>
            </form>
            <div className="signin-hint">
              <div className="signin-hint-title">Demo accounts:</div>
              <div>nancy@darkskycenter.org (Manager)</div>
              <div>josie@darkskycenter.org (Staff)</div>
              <div>volunteer@darkskycenter.org</div>
              <div style={{ marginTop: 4, opacity: 0.6 }}>Password: darksky</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nav-signin {
          background: none;
          border: none;
          color: var(--muted, #6b6880);
          font: 400 13px 'DM Sans', sans-serif;
          cursor: pointer;
          padding: 6px 12px;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-signin:hover { color: var(--text, #f0f0f0); }

        .nav-admin-link {
          font: 500 12px 'JetBrains Mono', monospace;
          color: var(--gold, #D4AF37);
          cursor: pointer;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .nav-admin-link:hover { opacity: 1; }

        .nav-user-wrap { position: relative; }
        .nav-user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          transition: opacity 0.2s;
        }
        .nav-user-btn:hover { opacity: 0.85; }
        .nav-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: rgba(212,175,55,0.15);
          color: var(--gold, #D4AF37);
          display: flex; align-items: center; justify-content: center;
          font: 600 13px 'DM Sans', sans-serif;
          flex-shrink: 0;
        }
        .nav-user-name {
          font: 400 13px 'DM Sans', sans-serif;
          color: var(--text, #f0f0f0);
        }
        .nav-user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: rgba(10,10,26,0.97);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 4px;
          min-width: 200px;
          z-index: 200;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-user-dropdown-info {
          padding: 12px 14px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 4px;
        }
        .nav-user-dropdown-name {
          font: 500 14px 'DM Sans', sans-serif;
          color: var(--text, #f0f0f0);
        }
        .nav-user-dropdown-role {
          font: 500 10px 'JetBrains Mono', monospace;
          color: var(--gold, #D4AF37);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 2px;
        }
        .nav-user-dropdown button {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          color: var(--text, #f0f0f0);
          font: 400 13px 'DM Sans', sans-serif;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.15s;
          text-align: left;
        }
        .nav-user-dropdown button:hover {
          background: rgba(212,175,55,0.08);
        }
        .nav-user-dropdown button svg { opacity: 0.5; }

        /* Sign In Modal */
        .signin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .signin-modal {
          background: rgba(10,10,26,0.98);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 40px 36px 32px;
          width: 380px;
          max-width: 92vw;
          position: relative;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          animation: scaleIn 0.25s cubic-bezier(.16,1,.3,1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .signin-close {
          position: absolute;
          top: 16px; right: 16px;
          background: none; border: none;
          color: var(--muted, #6b6880);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }
        .signin-close:hover { color: var(--text, #f0f0f0); }
        .signin-star {
          text-align: center;
          font-size: 28px;
          color: var(--gold, #D4AF37);
          margin-bottom: 16px;
        }
        .signin-title {
          text-align: center;
          font: 400 24px 'Playfair Display', serif;
          color: var(--text, #f0f0f0);
          margin: 0 0 6px;
        }
        .signin-sub {
          text-align: center;
          font: 300 14px 'DM Sans', sans-serif;
          color: var(--muted, #6b6880);
          margin: 0 0 28px;
        }
        .signin-label {
          display: block;
          font: 500 11px 'JetBrains Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted, #6b6880);
          margin-bottom: 6px;
        }
        .signin-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          font: 400 15px 'DM Sans', sans-serif;
          color: var(--text, #f0f0f0);
          outline: none;
          margin-bottom: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .signin-input:focus {
          border-color: rgba(212,175,55,0.4);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
        }
        .signin-input::placeholder { color: rgba(255,255,255,0.15); }
        .signin-error {
          font: 400 13px 'DM Sans', sans-serif;
          color: #EF4444;
          margin: -8px 0 16px;
        }
        .signin-submit {
          width: 100%;
          padding: 14px;
          background: var(--gold, #D4AF37);
          color: #04040c;
          border: none;
          border-radius: 8px;
          font: 600 14px 'DM Sans', sans-serif;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .signin-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(212,175,55,0.3);
        }
        .signin-hint {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          font: 300 12px 'DM Sans', sans-serif;
          color: var(--muted, #6b6880);
          line-height: 1.6;
          text-align: center;
        }
        .signin-hint-title {
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .nav-user-name { display: none; }
          .nav-admin-link { display: none; }
          .nav-signin { padding: 4px 8px; font-size: 12px; }
        }
      `}</style>
    </>
  );
}
