import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addContact } from '../admin/data/store';

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <>
      {/* Newsletter */}
      <div className="newsletter">
        <div>
          <div className="label" style={{ marginBottom: 12 }}>// Stay Connected</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 400 }}>
            Stay Under the <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Stars</em>
          </div>
          <p style={{ font: '300 14px Plus Jakarta Sans', color: 'var(--text2)', marginTop: 8 }}>
            Monthly updates on events, new arrivals, and dark sky news.
          </p>
        </div>
        <form className="newsletter-form" onSubmit={e => { e.preventDefault(); if (email.trim()) { addContact({ email: email.trim(), source: 'newsletter' }); setSubscribed(true); setEmail(''); } }}>
          {subscribed ? (
            <span style={{ font: '500 14px "Plus Jakarta Sans"', color: 'var(--gold)', padding: '14px 0' }}>Subscribed! We'll keep you posted.</span>
          ) : (<>
          <input
            type="email"
            className="newsletter-input"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="newsletter-btn">Subscribe</button>
          </>)}
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
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">X</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YT</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Visit</div>
            <div className="footer-links">
              <span>13001 N La Montana Drive</span>
              <span>Fountain Hills, AZ 85268</span>
              <span>Wed — Sun, 6pm — 11pm</span>
              <a href="mailto:info@darkskycenter.org">info@darkskycenter.org</a>
              <a href="https://maps.google.com/?q=13001+N+La+Montana+Drive+Fountain+Hills+AZ+85268" target="_blank" rel="noopener noreferrer">Get Directions →</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Explore</div>
            <div className="footer-links">
              <button onClick={() => navigate('/about')}>About Us</button>
              <button onClick={() => navigate('/events')}>Events</button>
              <button onClick={() => navigate('/education')}>Education</button>
              <button onClick={() => navigate('/field-trips')}>Field Trips</button>
              <button onClick={() => navigate('/membership')}>Membership</button>
              <button onClick={() => navigate('/contact')}>Contact</button>
              <button onClick={() => navigate('/donate')}>Donate</button>
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
