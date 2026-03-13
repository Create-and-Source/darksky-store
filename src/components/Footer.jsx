import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <>
      <footer className="footer">
        <div>
          <div className="footer-brand-name">Dark Sky</div>
          <p className="footer-tagline">Every purchase supports dark sky preservation and science education in the Sonoran Desert.</p>
        </div>
        <div>
          <div className="footer-col-title">// Navigate</div>
          <div className="footer-links">
            <button onClick={() => navigate('/')}>Home</button>
            <button onClick={() => navigate('/shop')}>Shop All</button>
            <button onClick={() => navigate('/membership')}>Membership</button>
            <button onClick={() => navigate('/cart')}>Cart</button>
          </div>
        </div>
        <div>
          <div className="footer-col-title">// Visit</div>
          <div className="footer-links">
            <a href="mailto:hello@idarksky.org">hello@idarksky.org</a>
            <a>Sonoran Desert, AZ</a>
            <a>Wed–Sun, 6pm–11pm</a>
            <a>Open for Stargazing</a>
          </div>
        </div>
      </footer>
      <div className="footer-bottom">
        <span className="footer-copy">© 2025 International Dark Sky Discovery Center · Powered by MuseumOS</span>
        <span className="footer-star">✦</span>
        <span className="footer-copy">Preserving the night sky for future generations</span>
      </div>
    </>
  );
}
