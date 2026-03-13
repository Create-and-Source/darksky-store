import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Nav({ cartCount, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path) => { navigate(path); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path ? 'active' : '';

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
        <button onClick={() => go('/membership')}>Membership</button>
        <button onClick={() => { onCartClick(); setMenuOpen(false); }}>Cart ({cartCount})</button>
      </div>
    </>
  );
}
