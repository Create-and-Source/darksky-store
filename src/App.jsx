import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { GLOBAL_CSS } from './styles';
import Stars from './components/Stars';
import Nav from './components/Nav';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { EditModeProvider, EditToggleButton, EditBanner } from './components/EditMode';
import { initStore } from './admin/data/store';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Education from './pages/Education';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Membership from './pages/Membership';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Contact from './pages/Contact';
import FieldTrips from './pages/FieldTrips';
import Donate from './pages/Donate';
import SignIn from './pages/SignIn';
import VolunteerPortal from './pages/VolunteerPortal';
import MemberPortal from './pages/MemberPortal';

// Admin (lazy loaded)
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/pages/Dashboard'));
const Inventory = lazy(() => import('./admin/pages/Inventory'));
const Receive = lazy(() => import('./admin/pages/Receive'));
const Transfers = lazy(() => import('./admin/pages/Transfers'));
const Orders = lazy(() => import('./admin/pages/Orders'));
const EventsAdmin = lazy(() => import('./admin/pages/EventsAdmin'));
const Emails = lazy(() => import('./admin/pages/Emails'));
const Reports = lazy(() => import('./admin/pages/Reports'));
const Donations = lazy(() => import('./admin/pages/Donations'));
const DesignStudio = lazy(() => import('./admin/pages/DesignStudio'));
const SocialMedia = lazy(() => import('./admin/pages/SocialMedia'));
const BoardMeeting = lazy(() => import('./admin/pages/BoardMeeting'));
const Payroll = lazy(() => import('./admin/pages/Payroll'));
const QuickBooks = lazy(() => import('./admin/pages/QuickBooks'));
const POS = lazy(() => import('./admin/pages/POS'));
const Products = lazy(() => import('./admin/pages/Products'));

const CART_KEY = 'ds_store_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

let cartIdCounter = (() => {
  const saved = loadCart();
  return saved.reduce((max, i) => Math.max(max, i.cartId || 0), 0);
})();

/* ── Announcement Bar (store-facing) ── */
function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [ann, setAnn] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ds_announcement')) || { text: '', active: false }; } catch { return { text: '', active: false }; }
  });

  // Re-read on focus (catches admin changes in another tab or same session)
  useEffect(() => {
    const read = () => {
      try { setAnn(JSON.parse(localStorage.getItem('ds_announcement')) || { text: '', active: false }); } catch {}
    };
    window.addEventListener('focus', read);
    window.addEventListener('storage', read);
    // Also poll every 2s for same-tab admin changes
    const interval = setInterval(read, 2000);
    return () => { window.removeEventListener('focus', read); window.removeEventListener('storage', read); clearInterval(interval); };
  }, []);

  const visible = ann.active && ann.text && !dismissed;

  useEffect(() => {
    document.body.classList.toggle('has-announcement', visible);
    return () => document.body.classList.remove('has-announcement');
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 250,
      background: '#D4AF37', color: '#04040c',
      padding: '8px 40px 8px 16px', textAlign: 'center',
      font: "500 11px 'JetBrains Mono', monospace",
      letterSpacing: '1px', textTransform: 'uppercase',
    }}>
      {ann.text}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: '#04040c', cursor: 'pointer',
          fontSize: 16, lineHeight: 1, padding: 4, opacity: 0.6,
        }}
      >&#10005;</button>
    </div>
  );
}

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

// Seed localStorage with demo data on first load (before any page reads it)
initStore();

export default function App() {
  const [cart, setCart] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync cart to localStorage on every change
  useEffect(() => { saveCart(cart); }, [cart]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  // Close drawer on navigation
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

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

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const isAdmin = location.pathname.startsWith('/admin');

  // Auto-set admin role when visiting /admin directly (if not signed in)
  useEffect(() => {
    if (isAdmin && !localStorage.getItem('ds_admin_role')) {
      localStorage.setItem('ds_user_name', 'Executive Director');
      localStorage.setItem('ds_user_role', 'manager');
      localStorage.setItem('ds_admin_role', 'executive_director');
      window.dispatchEvent(new Event('ds-auth-change'));
    }
  }, [isAdmin]);

  return (
    <EditModeProvider>
      {!isAdmin && <CustomCursor />}
      {!isAdmin && <Stars count={180} className="stars-fixed" />}
      {!isAdmin && <EditToggleButton />}
      {!isAdmin && <EditBanner />}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {!isAdmin && <AnnouncementBar />}
        {!isAdmin && <Nav cartCount={cartCount} onCartClick={() => setDrawerOpen(true)} />}
        {!isAdmin && <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} cart={cart} onUpdate={updateQty} onRemove={removeItem} />}

        <main>
          <Routes>
            <Route path="/" element={<Home onAddToCart={addToCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/education" element={<Education />} />
            <Route path="/shop" element={<Shop onAddToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} onUpdate={updateQty} onRemove={removeItem} />} />
            <Route path="/checkout" element={<Checkout cart={cart} onOrderComplete={clearCart} />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/field-trips" element={<FieldTrips />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/volunteer-portal" element={<VolunteerPortal />} />
            <Route path="/member-portal" element={<MemberPortal />} />
            <Route path="/admin/board-meeting" element={<Suspense fallback={<div style={{ padding: '120px 64px', textAlign: 'center' }}>Loading...</div>}><BoardMeeting /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<div style={{ padding: '120px 64px', textAlign: 'center' }}>Loading admin...</div>}><AdminLayout /></Suspense>}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="receive" element={<Receive />} />
              <Route path="transfers" element={<Transfers />} />
              <Route path="purchase-orders" element={<Navigate to="/admin" replace />} />
              <Route path="orders" element={<Orders />} />
              <Route path="events" element={<EventsAdmin />} />
              <Route path="emails" element={<Emails />} />
              <Route path="content" element={<Navigate to="/admin" replace />} />
              <Route path="reports" element={<Reports />} />
              <Route path="quickbooks" element={<QuickBooks />} />
              <Route path="donations" element={<Donations />} />
              <Route path="design-studio" element={<DesignStudio />} />
              <Route path="social-media" element={<SocialMedia />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="pos" element={<POS />} />
              <Route path="products" element={<Products />} />
              <Route path="facility" element={<Navigate to="/admin" replace />} />
              <Route path="visitors" element={<Navigate to="/admin" replace />} />
              <Route path="volunteers" element={<Navigate to="/admin" replace />} />
            </Route>
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

        {!isAdmin && <Footer />}
      </div>
    </EditModeProvider>
  );
}
