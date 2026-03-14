import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ADMIN_CSS } from './AdminStyles';
import AdminTour from './AdminTour';
import HelpChatbot from './components/HelpChatbot';
import NotificationBell from '../components/NotificationBell';
import OfflineBanner from '../components/OfflineBanner';
import { executeUndo } from './components/UndoSystem';
import { subscribe, initStore } from './data/store';

// Initialize store with seed data on first load
initStore();

// ── Toast Context ──
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

// ── Role Context ──
const RoleContext = createContext('manager');
export const useRole = () => useContext(RoleContext);

const ROLE_NAMES = { manager: 'Tovah', staff: 'Josie', volunteer: 'Volunteer' };
const ROLE_AVATARS = { manager: 'T', staff: 'J', volunteer: 'V' };
const ROLE_BADGE_COLORS = {
  manager: { bg: 'rgba(212,175,55,0.12)', text: '#D4AF37' },
  staff: { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
  volunteer: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
};

// Routes each role can access (path suffixes after /admin)
const ROLE_ALLOWED_ROUTES = {
  manager: null, // all
  staff: ['', '/inventory', '/receive', '/transfers', '/orders'],
  volunteer: ['', '/inventory', '/orders'],
};

// ── SVG Icons ──
const Icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  inventory: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  receive: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  transfer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  purchase: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>,
  orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  events: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
  email: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  content: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  reports: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  quickbooks: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  help: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  chevronDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9"/></svg>,
};

const navItems = [
  { to: '/admin', icon: Icons.dashboard, label: 'Dashboard', end: true },
  { to: '/admin/inventory', icon: Icons.inventory, label: 'Inventory' },
  { to: '/admin/receive', icon: Icons.receive, label: 'Receive' },
  { to: '/admin/transfers', icon: Icons.transfer, label: 'Transfers' },
  { to: '/admin/purchase-orders', icon: Icons.purchase, label: 'Purchase Orders' },
  { to: '/admin/orders', icon: Icons.orders, label: 'Orders' },
  { to: '/admin/events', icon: Icons.events, label: 'Events' },
  { to: '/admin/emails', icon: Icons.email, label: 'Email' },
  { to: '/admin/content', icon: Icons.content, label: 'Content' },
  { to: '/admin/reports', icon: Icons.reports, label: 'Reports' },
];

// Role-based nav filtering
const ROLE_NAV = {
  manager: null, // null means ALL pages
  staff: ['Dashboard', 'Inventory', 'Receive', 'Transfers', 'Orders'],
  volunteer: ['Dashboard', 'Inventory', 'Orders'],
};
const READONLY_LABELS = {
  staff: ['Orders'],
  volunteer: ['Inventory', 'Orders'],
};

// Breadcrumb labels
const breadcrumbMap = {
  '/admin': 'Dashboard',
  '/admin/inventory': 'Inventory',
  '/admin/receive': 'Receive',
  '/admin/transfers': 'Transfers',
  '/admin/purchase-orders': 'Purchase Orders',
  '/admin/orders': 'Orders',
  '/admin/events': 'Events',
  '/admin/emails': 'Email',
  '/admin/content': 'Content',
  '/admin/reports': 'Reports',
  '/admin/quickbooks': 'QuickBooks',
};

const ROLE_LABELS = { manager: 'Manager', staff: 'Staff', volunteer: 'Volunteer' };

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem('ds_admin_role') || 'manager');
  const navigate = useNavigate();
  const location = useLocation();
  const quickSearchInputRef = useRef(null);
  const userDropdownRef = useRef(null);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      // Cmd+K or Ctrl+K: quick search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickSearchOpen(prev => !prev);
        setQuickSearchQuery('');
      }

      // Escape: close modals/drawers
      if (e.key === 'Escape') {
        if (quickSearchOpen) {
          setQuickSearchOpen(false);
          setQuickSearchQuery('');
        }
        if (userDropdownOpen) {
          setUserDropdownOpen(false);
        }
        // Dispatch custom event so child components can close their drawers
        document.dispatchEvent(new CustomEvent('admin-escape'));
      }

      // Cmd+Z or Ctrl+Z: undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        // Only intercept if not in a text input
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.contentEditable === 'true') return;
        e.preventDefault();
        const undone = executeUndo();
        if (undone) {
          // Notify store subscribers to refresh
          subscribe(() => {})(); // trigger a subscribe/unsubscribe to poke listeners
          // Actually we need to dispatch a storage event or just notify
          window.dispatchEvent(new Event('storage'));
          addToast(`Undone: ${undone.description}`, 'success');
        } else {
          addToast('Nothing to undo', 'info');
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [quickSearchOpen, userDropdownOpen, addToast]);

  // Focus quick search input when modal opens
  useEffect(() => {
    if (quickSearchOpen && quickSearchInputRef.current) {
      setTimeout(() => quickSearchInputRef.current?.focus(), 50);
    }
  }, [quickSearchOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handler = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userDropdownOpen]);

  // Route protection — redirect if not allowed
  useEffect(() => {
    const allowed = ROLE_ALLOWED_ROUTES[role];
    if (!allowed) return; // manager can access all
    const suffix = location.pathname.replace('/admin', '') || '';
    if (!allowed.includes(suffix)) {
      navigate('/admin', { replace: true });
      addToast("You don't have access to that page", 'error');
    }
  }, [location.pathname, role, navigate, addToast]);

  // Role switching
  const switchRole = (newRole) => {
    localStorage.setItem('ds_admin_role', newRole);
    setRole(newRole);
    setUserDropdownOpen(false);
    // Navigate to dashboard when switching to avoid landing on unauthorized page
    navigate('/admin', { replace: true });
    addToast(`Switched to ${ROLE_LABELS[newRole]} view`);
  };

  // Filter navItems based on role
  const allowedLabels = ROLE_NAV[role];
  const filteredNavItems = allowedLabels
    ? navItems.filter(item => allowedLabels.includes(item.label))
    : navItems;

  // Quick search: filter by role
  const allPages = [
    ...filteredNavItems.map(item => ({ label: item.label, to: item.to })),
    ...(role === 'manager' ? [{ label: 'QuickBooks', to: '/admin/quickbooks' }] : []),
  ];
  const quickSearchResults = quickSearchQuery.trim()
    ? allPages.filter(p => p.label.toLowerCase().includes(quickSearchQuery.toLowerCase()))
    : allPages;

  const handleQuickSearchSelect = (to) => {
    setQuickSearchOpen(false);
    setQuickSearchQuery('');
    navigate(to);
  };

  const handleQuickSearchKeyDown = (e) => {
    if (e.key === 'Enter' && quickSearchResults.length > 0) {
      handleQuickSearchSelect(quickSearchResults[0].to);
    }
    if (e.key === 'Escape') {
      setQuickSearchOpen(false);
      setQuickSearchQuery('');
    }
  };

  const currentPage = breadcrumbMap[location.pathname] || 'Admin';

  return (
    <RoleContext.Provider value={role}>
    <ToastContext.Provider value={addToast}>
      <div className="admin">
        <OfflineBanner />
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div className="admin-drawer-overlay" onClick={closeSidebar} style={{ zIndex: 99 }} />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-header">
            <div className="admin-sidebar-brand" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="admin-sidebar-logo">&#10022;</div>
                <div className="admin-sidebar-title">
                  <small>ADMIN</small>
                  Dark Sky
                </div>
              </div>
              {/* Mobile close button */}
              <button
                className="admin-sidebar-close-btn"
                onClick={closeSidebar}
                style={{
                  display: 'none', background: 'none', border: 'none',
                  color: '#94A3B8', cursor: 'pointer', padding: 8,
                  fontSize: 20, lineHeight: 1,
                }}
              >&#10005;</button>
            </div>
            {/* Mobile search inside sidebar */}
            <div className="admin-sidebar-search" style={{ display: 'none', marginTop: 12 }}>
              <button
                onClick={() => { setQuickSearchOpen(true); setQuickSearchQuery(''); closeSidebar(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
                  color: '#94A3B8', cursor: 'pointer',
                  font: "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                {Icons.search}
                Search pages...
              </button>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            <div className="admin-nav-section">
              <div className="admin-nav-label">Management</div>
              {filteredNavItems.map(item => {
                const isReadOnly = (READONLY_LABELS[role] || []).includes(item.label);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                    title={item.label}
                  >
                    {item.icon}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isReadOnly && (
                      <span style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(100,116,139,0.1)', color: '#64748B',
                        fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase',
                      }}>View</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
            {/* Only show integrations for manager */}
            {role === 'manager' && (
              <div className="admin-nav-section">
                <div className="admin-nav-label">Integrations</div>
                <NavLink
                  to="/admin/quickbooks"
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  {Icons.quickbooks}
                  QuickBooks
                  <span className="admin-nav-badge" style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37', fontSize: 12, padding: '2px 7px' }}>New</span>
                </NavLink>
              </div>
            )}
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
              {/* Mobile: small DS logo + page title */}
              <div className="admin-topbar-brand-mobile" style={{ display: 'none' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4af37, #a08520)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0,
                }}>&#10022;</div>
                <span className="admin-topbar-title">{currentPage}</span>
              </div>
              {/* Desktop: breadcrumb */}
              <div className="admin-topbar-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#94A3B8', fontSize: 14 }}>Admin</span>
                <span style={{ color: '#CBD5E1', fontSize: 14 }}>/</span>
                <span className="admin-topbar-title">{currentPage}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Quick search trigger — hidden on mobile via CSS */}
              <button
                className="admin-topbar-search"
                onClick={() => { setQuickSearchOpen(true); setQuickSearchQuery(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#F8F7F4', border: '1px solid #E2E8F0',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  font: "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  color: '#94A3B8', transition: 'border-color 0.15s',
                }}
                title="Quick search (Cmd+K)"
              >
                {Icons.search}
                <span>Search...</span>
                <span style={{
                  fontSize: 11, padding: '1px 5px', borderRadius: 4,
                  background: '#E2E8F0', color: '#64748B', fontFamily: 'monospace',
                  marginLeft: 4,
                }}>&#8984;K</span>
              </button>

              <NotificationBell />

              {/* Mobile-only: compact role badge */}
              <button
                className="admin-topbar-role-mobile"
                onClick={() => setUserDropdownOpen(o => !o)}
                style={{
                  display: 'none', alignItems: 'center', gap: 0,
                  background: ROLE_BADGE_COLORS[role].bg, border: 'none', cursor: 'pointer',
                  padding: '4px 10px', borderRadius: 6,
                }}
              >
                <span style={{
                  font: "500 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  color: ROLE_BADGE_COLORS[role].text,
                  letterSpacing: '0.02em',
                }}>{ROLE_LABELS[role]}</span>
              </button>

              {/* Desktop: User area with dropdown */}
              <div style={{ position: 'relative' }} ref={userDropdownRef}>
                <button
                  className="admin-topbar-role-badge-full"
                  onClick={() => setUserDropdownOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                    borderRadius: 8, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div className="admin-topbar-avatar">{ROLE_AVATARS[role]}</div>
                  <div className="admin-topbar-user-name" style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                    <span style={{ color: '#1E293B', fontWeight: 500, fontSize: 14 }}>{ROLE_NAMES[role]}</span>
                    <span className="admin-topbar-user-role" style={{ color: '#94A3B8', fontSize: 12 }}>{ROLE_LABELS[role]}</span>
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                    background: ROLE_BADGE_COLORS[role].bg,
                    color: ROLE_BADGE_COLORS[role].text,
                  }}>
                    {ROLE_LABELS[role]}
                  </span>
                  {Icons.chevronDown}
                </button>

                {/* User/role dropdown */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    width: 200, background: '#FFFFFF', border: '1px solid #E2E8F0',
                    borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    zIndex: 1000, overflow: 'hidden',
                  }}>
                    <div style={{
                      padding: '10px 14px', borderBottom: '1px solid #E2E8F0',
                      font: "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px',
                    }}>Switch Role</div>
                    {['manager', 'staff', 'volunteer'].map(r => (
                      <button
                        key={r}
                        onClick={() => switchRole(r)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '12px 14px', minHeight: 44,
                          background: role === r ? '#F8F7F4' : 'transparent',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                          font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          color: role === r ? '#D4AF37' : '#1E293B',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (role !== r) e.currentTarget.style.background = '#F8F7F4'; }}
                        onMouseLeave={e => { if (role !== r) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: role === r ? ROLE_BADGE_COLORS[r].text : '#E2E8F0',
                        }} />
                        {ROLE_LABELS[r]}
                        {role === r && <span style={{ marginLeft: 'auto', fontSize: 12, color: ROLE_BADGE_COLORS[r].text }}>&#10003;</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="admin-content">
            <Outlet />
          </div>
        </div>

        {/* Tour / Onboarding */}
        <AdminTour />

        {/* Help Chatbot */}
        <HelpChatbot />

        {/* Quick Search Modal */}
        {quickSearchOpen && (
          <>
            <div
              onClick={() => { setQuickSearchOpen(false); setQuickSearchQuery(''); }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                zIndex: 10000, backdropFilter: 'blur(2px)',
              }}
            />
            <div style={{
              position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
              width: 480, maxWidth: 'calc(100vw - 32px)',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              zIndex: 10001, overflow: 'hidden',
              animation: 'helpFadeIn 0.15s ease',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 18px', borderBottom: '1px solid #E2E8F0',
              }}>
                {Icons.search}
                <input
                  ref={quickSearchInputRef}
                  type="text"
                  placeholder="Search admin pages..."
                  value={quickSearchQuery}
                  onChange={e => setQuickSearchQuery(e.target.value)}
                  onKeyDown={handleQuickSearchKeyDown}
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    font: "400 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    color: '#1E293B',
                  }}
                />
                <span style={{
                  fontSize: 11, padding: '2px 6px', borderRadius: 4,
                  background: '#E2E8F0', color: '#64748B', fontFamily: 'monospace',
                }}>ESC</span>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto', padding: '6px 0' }}>
                {quickSearchResults.length === 0 ? (
                  <div style={{
                    padding: '24px 18px', textAlign: 'center',
                    font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    color: '#94A3B8',
                  }}>No pages found</div>
                ) : (
                  quickSearchResults.map(page => (
                    <button
                      key={page.to}
                      onClick={() => handleQuickSearchSelect(page.to)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '10px 18px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        font: "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        color: '#1E293B', textAlign: 'left', transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8F7F4'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ flex: 1 }}>{page.label}</span>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>{page.to}</span>
                    </button>
                  ))
                )}
              </div>
              <div style={{
                padding: '10px 18px', borderTop: '1px solid #E2E8F0',
                display: 'flex', gap: 16,
                font: "400 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: '#94A3B8',
              }}>
                <span>&#8629; to select</span>
                <span>&#8593;&#8595; to navigate</span>
                <span>esc to close</span>
              </div>
            </div>
          </>
        )}

        {/* Toasts */}
        <div className="admin-toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`admin-toast ${t.type}`}>
              <span className="admin-toast-icon">
                {t.type === 'success' ? '\u2713' : t.type === 'error' ? '\u2715' : '\u2139'}
              </span>
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
    </RoleContext.Provider>
  );
}
