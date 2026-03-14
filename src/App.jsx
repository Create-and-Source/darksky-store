import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GLOBAL_CSS } from './styles';
import Stars from './components/Stars';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Education from './pages/Education';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Membership from './pages/Membership';

let cartIdCounter = 0;

/* ── Custom Cursor (desktop only) ── */
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);

  useEffect(() => {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const onOver = (e) => {
      const el = e.target.closest('a, button, [role="button"], .pc, .event-card, .about-card, .mem-tier, input, select, textarea');
      hovering.current = !!el;
    };

    let raf;
    const animate = () => {
      const lerp = 0.15;
      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x - 4}px, ${target.current.y - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px) scale(${hovering.current ? 1 : 0.4})`;
        ringRef.current.style.opacity = hovering.current ? '1' : '0';
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    animate();
    document.body.style.cursor = 'none';

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.body.style.cursor = '';
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, cartId: ++cartIdCounter }];
    });
  }, []);

  const updateQty = useCallback((cartId, qty) => {
    if (qty < 1) { setCart(prev => prev.filter(i => i.cartId !== cartId)); return; }
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, qty } : i));
  }, []);

  const removeItem = useCallback((cartId) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <CustomCursor />
      <Stars count={180} className="stars-fixed" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav cartCount={cartCount} onCartClick={() => navigate('/cart')} />

        <main>
          <Routes>
            <Route path="/" element={<Home onAddToCart={addToCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/education" element={<Education />} />
            <Route path="/shop" element={<Shop onAddToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} onUpdate={updateQty} onRemove={removeItem} />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="*" element={
              <div style={{ padding: '180px 64px 120px', textAlign: 'center', background: 'var(--bg)' }}>
                <div className="label" style={{ marginBottom: 24 }}>// 404</div>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 64, fontWeight: 400, marginBottom: 20, fontStyle: 'italic', color: 'var(--gold)' }}>Lost in Space</h1>
                <p style={{ font: '300 16px "Plus Jakarta Sans"', color: 'var(--text2)', marginBottom: 36 }}>This page has drifted beyond our telescope range.</p>
                <button className="btn-primary" onClick={() => navigate('/')}>Return Home</button>
              </div>
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </>
  );
}
