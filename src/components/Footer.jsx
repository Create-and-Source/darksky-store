import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <>
      {/* Newsletter Row */}
      <div className="footer-newsletter">
        <div className="footer-newsletter-text">
          Stay Under the <em>Stars</em>
        </div>
        <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            className="footer-newsletter-input"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="footer-newsletter-btn">
            {subscribed ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>
      </div>

      {/* 4-Column Footer */}
      <footer className="footer">
        {/* Column 1: Brand */}
        <div>
          <div className="footer-brand-name">Dark Sky</div>
          <p className="footer-tagline">
            Every purchase supports dark sky preservation and science education in the Sonoran Desert.
          </p>
          <div className="footer-social">
            <a className="footer-social-link" href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="5"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a className="footer-social-link" href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a className="footer-social-link" href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Shop */}
        <div>
          <div className="footer-col-title">Shop</div>
          <div className="footer-links">
            <button onClick={() => navigate('/shop')}>All Products</button>
            <button onClick={() => navigate('/shop?sort=newest')}>New Arrivals</button>
            <button onClick={() => navigate('/shop')}>Best Sellers</button>
            <button onClick={() => navigate('/shop')}>Gift Cards</button>
          </div>
        </div>

        {/* Column 3: About */}
        <div>
          <div className="footer-col-title">About</div>
          <div className="footer-links">
            <button onClick={() => navigate('/about')}>Our Mission</button>
            <button onClick={() => navigate('/contact')}>Visit Us</button>
            <button onClick={() => navigate('/events')}>Events</button>
            <button onClick={() => navigate('/membership')}>Membership</button>
          </div>
        </div>

        {/* Column 4: Contact */}
        <div>
          <div className="footer-col-title">Contact</div>
          <div className="footer-links">
            <a href="mailto:hello@idarksky.org">hello@idarksky.org</a>
            <a href="tel:+15205551234">(520) 555-1234</a>
            <span style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>Sonoran Desert, AZ</span>
            <span style={{ font: '300 13px DM Sans', color: 'var(--muted)' }}>Wed-Sun, 6pm-11pm</span>
          </div>
        </div>
      </footer>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <span className="footer-copy">&copy; 2026 International Dark Sky Discovery Center</span>
        <span className="footer-powered">Powered by MuseumOS</span>
        <div className="footer-payment">
          <div className="footer-payment-icon">VISA</div>
          <div className="footer-payment-icon">MC</div>
          <div className="footer-payment-icon">AMEX</div>
          <div className="footer-payment-icon">PP</div>
        </div>
      </div>
    </>
  );
}
