import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <>
      {/* Newsletter */}
      <div className="newsletter">
        <div>
          <div className="label" style={{ marginBottom: 12 }}>// Stay Connected</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 400 }}>
            Stay Under the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Stars</em>
          </div>
          <p style={{ font: '300 14px DM Sans', color: 'var(--text2)', marginTop: 8 }}>
            Monthly updates on events, new arrivals, and dark sky news.
          </p>
        </div>
        <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
          <input
            type="email"
            className="newsletter-input"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="newsletter-btn">Subscribe</button>
        </form>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">Dark Sky</div>
            <p className="footer-tagline">
              The International Dark Sky Discovery Center — connecting the night sky
              to life on Earth through education, preservation, and wonder.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="Twitter">X</a>
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="YouTube">YT</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Visit</div>
            <div className="footer-links">
              <a>16845 E Palisades Blvd</a>
              <a>Fountain Hills, AZ 85268</a>
              <a>Wed — Sun, 6pm — 11pm</a>
              <a href="mailto:hello@idsdc.org">hello@idsdc.org</a>
              <a>Get Directions →</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Programs</div>
            <div className="footer-links">
              <button onClick={() => navigate('/events')}>Upcoming Events</button>
              <button onClick={() => navigate('/membership')}>Membership</button>
              <button onClick={() => navigate('/education')}>Field Trips</button>
              <button onClick={() => navigate('/education')}>Workshops</button>
              <button onClick={() => navigate('/about')}>About Us</button>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Shop</div>
            <div className="footer-links">
              <button onClick={() => navigate('/shop')}>All Products</button>
              <button onClick={() => navigate('/shop?cat=Apparel')}>Apparel</button>
              <button onClick={() => navigate('/shop?cat=Kids')}>Kids</button>
              <button onClick={() => navigate('/shop?cat=Gifts')}>Gifts</button>
              <button onClick={() => navigate('/membership')}>Gift Cards</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 International Dark Sky Discovery Center · 501(c)(3)</span>
          <span className="footer-powered">Powered by MuseumOS</span>
        </div>
      </footer>
    </>
  );
}
