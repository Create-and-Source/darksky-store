import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ADMIN_CSS } from './AdminStyles';

// ── Toast Context ──
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

// ── SVG Icons ──
const Icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  inventory: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  receive: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  transfer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  purchase: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>,
  orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
};

const navItems = [
  { to: '/admin', icon: Icons.dashboard, label: 'Dashboard', end: true },
  { to: '/admin/inventory', icon: Icons.inventory, label: 'Inventory' },
  { to: '/admin/receive', icon: Icons.receive, label: 'Receive' },
  { to: '/admin/transfers', icon: Icons.transfer, label: 'Transfers' },
  { to: '/admin/purchase-orders', icon: Icons.purchase, label: 'Purchase Orders' },
  { to: '/admin/orders', icon: Icons.orders, label: 'Orders' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  // Inject CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = ADMIN_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Close sidebar on nav (mobile)
  const closeSidebar = () => setSidebarOpen(false);

  // Toast
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      <div className="admin">
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div className="admin-drawer-overlay" onClick={closeSidebar} style={{ zIndex: 99 }} />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-header">
            <div className="admin-sidebar-brand">
              <div className="admin-sidebar-logo">✦</div>
              <div className="admin-sidebar-title">
                <small>ADMIN</small>
                Dark Sky
              </div>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            <div className="admin-nav-section">
              <div className="admin-nav-label">Management</div>
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="admin-sidebar-footer">
            <button className="admin-nav-back" onClick={() => navigate('/')}>
              {Icons.back}
              Back to Store
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className={`admin-main ${sidebarOpen ? '' : ''}`}>
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <button className="admin-hamburger" onClick={() => setSidebarOpen(o => !o)}>
                {Icons.menu}
              </button>
              <span className="admin-topbar-title">Dark Sky Admin</span>
            </div>
            <div className="admin-topbar-user">
              <div className="admin-topbar-avatar">T</div>
              Tovah
            </div>
          </header>

          <div className="admin-content">
            <Outlet />
          </div>
        </div>

        {/* Toasts */}
        <div className="admin-toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`admin-toast ${t.type}`}>
              <span className="admin-toast-icon">
                {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
              </span>
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
