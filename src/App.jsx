import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GLOBAL_CSS } from './styles';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Membership from './pages/Membership';
import Events from './pages/Events';
import FieldTrips from './pages/FieldTrips';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Inventory from './admin/pages/Inventory';
import Receive from './admin/pages/Receive';
import Transfers from './admin/pages/Transfers';
import PurchaseOrders from './admin/pages/PurchaseOrders';
import Orders from './admin/pages/Orders';
import Content from './admin/pages/Content';
import EventsAdmin from './admin/pages/EventsAdmin';
import Emails from './admin/pages/Emails';
import Reports from './admin/pages/Reports';
import QuickBooks from './admin/pages/QuickBooks';
import {
  initStore,
  getCart,
  addToCart as storeAddToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  subscribe,
} from './admin/data/store';

export default function App() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize store on mount
  useEffect(() => {
    initStore();
    setCart(getCart());
  }, []);

  // Subscribe to store changes for cart reactivity
  useEffect(() => {
    const unsub = subscribe(() => {
      setCart(getCart());
    });
    return unsub;
  }, []);

  // Inject global CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const addToCart = (product) => {
    storeAddToCart(product);
  };

  const updateQty = (cartId, qty) => {
    updateCartQty(cartId, qty);
  };

  const removeItem = (cartId) => {
    removeFromCart(cartId);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isAdmin = location.pathname.startsWith('/admin');

  return isAdmin ? (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="receive" element={<Receive />} />
        <Route path="transfers" element={<Transfers />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="orders" element={<Orders />} />
        <Route path="events" element={<EventsAdmin />} />
        <Route path="emails" element={<Emails />} />
        <Route path="content" element={<Content />} />
        <Route path="reports" element={<Reports />} />
        <Route path="quickbooks" element={<QuickBooks />} />
      </Route>
    </Routes>
  ) : (
    <div className="ds-root">
      <Nav cartCount={cartCount} onCartClick={() => navigate('/cart')} />

      <main>
        <Routes>
          <Route path="/" element={<Home onAddToCart={addToCart} />} />
          <Route path="/shop" element={<Shop onAddToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} onUpdate={updateQty} onRemove={removeItem} />} />
          <Route path="/checkout" element={<Checkout cart={cart} onOrderComplete={() => clearCart()} />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/events" element={<Events />} />
          <Route path="/field-trips" element={<FieldTrips />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={
            <div style={{ padding: '120px 64px', textAlign: 'center' }}>
              <div className="label" style={{ marginBottom: 24 }}>// 404</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 64, fontWeight: 400, marginBottom: 20, fontStyle: 'italic', color: 'var(--gold)' }}>Lost in Space</h1>
              <p style={{ font: '300 16px DM Sans', color: 'var(--muted)', marginBottom: 36 }}>This page has drifted beyond our telescope range.</p>
              <button className="btn-primary" onClick={() => navigate('/')}>Return Home</button>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
