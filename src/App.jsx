import { useState, useEffect } from 'react';
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

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, cartId: ++cartIdCounter }];
    });
  };

  const updateQty = (cartId, qty) => {
    if (qty < 1) { removeItem(cartId); return; }
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, qty } : i));
  };

  const removeItem = (cartId) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <Stars count={150} className="stars-fixed" />
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
                <p style={{ font: '300 16px DM Sans', color: 'var(--text2)', marginBottom: 36 }}>This page has drifted beyond our telescope range.</p>
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
