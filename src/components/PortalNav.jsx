import { useLocation, useNavigate } from 'react-router-dom';

const PORTAL_TABS = {
  '/member-portal': [
    { icon: '\u2726', label: 'Home', path: '/member-portal' },
    { icon: '\uD83D\uDED2', label: 'Shop', path: '/shop' },
    { icon: '\uD83C\uDFAB', label: 'Events', path: '/events' },
    { icon: '\uD83C\uDF81', label: 'Donate', path: '/donate' },
    { icon: '\uD83D\uDC64', label: 'Sign In', path: '/signin' },
  ],
  '/volunteer-portal': [
    { icon: '\u2726', label: 'Home', path: '/volunteer-portal' },
    { icon: '\uD83C\uDFAB', label: 'Events', path: '/events' },
    { icon: '\uD83D\uDCDE', label: 'Contact', path: '/contact' },
    { icon: '\uD83D\uDC64', label: 'Sign In', path: '/signin' },
  ],
  '/school-portal': [
    { icon: '\u2726', label: 'Home', path: '/school-portal' },
    { icon: '\uD83C\uDF93', label: 'Programs', path: '/education' },
    { icon: '\uD83D\uDCDE', label: 'Contact', path: '/contact' },
    { icon: '\uD83D\uDC64', label: 'Sign In', path: '/signin' },
  ],
};

export default function PortalNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Find which portal we're in
  const portalPath = Object.keys(PORTAL_TABS).find(p => location.pathname === p);
  if (!portalPath) return null;

  const tabs = PORTAL_TABS[portalPath];

  return (
    <>
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: '#FFFFFF', borderTop: '1px solid #E8E5DF',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '6px 0 env(safe-area-inset-bottom, 8px)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}>
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '8px 12px', minWidth: 60,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 20, opacity: active ? 1 : 0.5 }}>{tab.icon}</span>
              <span style={{
                font: `${active ? 600 : 400} 10px 'Inter', -apple-system, sans-serif`,
                color: active ? '#C5A55A' : '#94A3B8',
                letterSpacing: '0.3px',
              }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Spacer so content doesn't hide behind the nav */}
      <div style={{ height: 72 }} />
    </>
  );
}
