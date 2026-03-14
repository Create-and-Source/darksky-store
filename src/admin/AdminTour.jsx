import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ── TOUR CSS ──
const TOUR_CSS = `
/* ── WELCOME MODAL ── */
.tour-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: tourFadeIn 0.3s ease;
}
.tour-welcome {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 480px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: tourScaleIn 0.35s cubic-bezier(.16,1,.3,1);
}
.tour-welcome-star {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #a08520);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 24px;
  color: #FFFFFF;
}
.tour-welcome h2 {
  font: 400 28px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  margin-bottom: 12px;
}
.tour-welcome p {
  font: 300 15px/1.6 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
  margin-bottom: 32px;
}
.tour-roles {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}
.tour-role {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #FAFAF8;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.tour-role:hover {
  border-color: rgba(212,175,55,0.3);
  background: rgba(212,175,55,0.04);
}
.tour-role.selected {
  border-color: #d4af37;
  background: rgba(212,175,55,0.08);
}
.tour-role-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(212,175,55,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.tour-role-info h4 {
  font: 500 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  margin-bottom: 2px;
}
.tour-role-info p {
  font: 400 14px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
  margin: 0;
}
.tour-start-btn {
  width: 100%;
  padding: 16px 24px;
  height: 52px;
  background: #d4af37;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font: 600 15px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}
.tour-start-btn:hover {
  background: #e0bf47;
  box-shadow: 0 4px 20px rgba(212,175,55,0.3);
}
.tour-start-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.tour-skip {
  background: none;
  border: none;
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
  cursor: pointer;
  transition: color 0.2s;
}
.tour-skip:hover { color: #64748B; }

/* ── SPOTLIGHT OVERLAY ── */
.tour-spotlight-overlay {
  position: fixed;
  inset: 0;
  z-index: 8999;
  pointer-events: auto;
}
.tour-spotlight-bg {
  position: fixed;
  inset: 0;
  z-index: 8999;
}

/* ── TOOLTIP ── */
.tour-tooltip {
  position: fixed;
  z-index: 9002;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-top: 3px solid #d4af37;
  border-radius: 10px;
  padding: 22px 24px 18px;
  width: 320px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.15);
  animation: tourTooltipIn 0.3s cubic-bezier(.16,1,.3,1);
}
.tour-tooltip h3 {
  font: 600 16px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  margin-bottom: 8px;
}
.tour-tooltip p {
  font: 400 15px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
  margin-bottom: 18px;
}
.tour-tooltip-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.tour-tooltip-btns {
  display: flex;
  gap: 8px;
}
.tour-btn-back {
  padding: 10px 16px;
  height: 40px;
  background: transparent;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font: 500 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}
.tour-btn-back:hover {
  border-color: #CBD5E1;
  color: #1E293B;
}
.tour-btn-next {
  padding: 10px 18px;
  height: 40px;
  background: #d4af37;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font: 600 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}
.tour-btn-next:hover {
  background: #e0bf47;
}
.tour-counter {
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
}
.tour-dots {
  display: flex;
  gap: 5px;
  justify-content: center;
  margin-top: 14px;
}
.tour-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #E2E8F0;
  transition: all 0.2s;
}
.tour-dot.active {
  background: #d4af37;
  width: 18px;
  border-radius: 3px;
}
.tour-skip-tour {
  display: block;
  margin: 10px auto 0;
  background: none;
  border: none;
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
  cursor: pointer;
}
.tour-skip-tour:hover { color: #64748B; }

/* ── SPOTLIGHT HIGHLIGHT ── */
.tour-spotlight-ring {
  position: fixed;
  z-index: 9001;
  border: 2px solid #d4af37;
  border-radius: 8px;
  pointer-events: none;
  box-shadow: 0 0 0 4px rgba(212,175,55,0.15), 0 0 24px rgba(212,175,55,0.2);
  animation: tourPulse 2s ease-in-out infinite;
  transition: all 0.35s cubic-bezier(.16,1,.3,1);
}

/* ── HELP BUTTON ── */
.tour-help-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 8000;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #a08520);
  border: none;
  color: #FFFFFF;
  font: 700 20px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(212,175,55,0.3);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tour-help-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(212,175,55,0.4);
}

/* ── HELP MENU ── */
.tour-help-menu {
  position: fixed;
  bottom: 82px;
  right: 24px;
  z-index: 8001;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  width: 280px;
  max-width: calc(100vw - 48px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.15);
  animation: tourMenuIn 0.25s cubic-bezier(.16,1,.3,1);
  overflow: hidden;
}
.tour-help-menu-header {
  padding: 16px 18px 12px;
  border-bottom: 1px solid #E2E8F0;
}
.tour-help-menu-header h4 {
  font: 500 15px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  margin-bottom: 2px;
}
.tour-help-menu-header small {
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
}
.tour-help-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 18px;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font: 400 15px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
  cursor: pointer;
  transition: all 0.15s;
}
.tour-help-menu-item:hover {
  background: #FAFAF8;
  color: #1E293B;
}
.tour-help-menu-item svg {
  width: 16px;
  height: 16px;
  opacity: 0.6;
  flex-shrink: 0;
}
.tour-help-divider {
  height: 1px;
  background: #E2E8F0;
  margin: 4px 0;
}
.tour-help-tips {
  padding: 14px 18px;
  border-top: 1px solid #E2E8F0;
}
.tour-help-tips h5 {
  font: 600 12px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 10px;
}
.tour-help-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  font: 400 14px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
}
.tour-help-tip::before {
  content: '\\2022';
  color: #d4af37;
  flex-shrink: 0;
  margin-top: -1px;
}

/* ── ANIMATIONS ── */
@keyframes tourFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes tourScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@keyframes tourTooltipIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes tourMenuIn { from { opacity: 0; transform: translateY(8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes tourPulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(212,175,55,0.15), 0 0 24px rgba(212,175,55,0.2); }
  50% { box-shadow: 0 0 0 6px rgba(212,175,55,0.25), 0 0 32px rgba(212,175,55,0.3); }
}

/* ── COMPLETION ── */
.tour-complete {
  text-align: center;
  padding: 40px;
}
.tour-complete-check {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(16,185,129,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 28px;
  color: #10B981;
}
.tour-complete h3 {
  font: 400 22px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  margin-bottom: 8px;
}
.tour-complete p {
  font: 400 15px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
  margin-bottom: 24px;
}
`;

// ── TOUR DEFINITIONS ──
const MANAGER_TOUR = [
  {
    navTarget: '/admin',
    title: 'Dashboard',
    desc: "This is your home base. See today's orders, revenue, and anything that needs attention.",
  },
  {
    navTarget: '/admin/inventory',
    title: 'Inventory',
    desc: "Track every product across the warehouse and gift shop. See what's running low.",
  },
  {
    navTarget: '/admin/purchase-orders',
    title: 'Purchase Orders',
    desc: "Create orders for new stock. Track what's coming from vendors and when it'll arrive.",
  },
  {
    navTarget: '/admin/reports',
    title: 'Reports',
    desc: 'Pull sales reports, see top products, and track membership growth.',
  },
  {
    navTarget: '/admin/events',
    title: 'Events',
    desc: 'Create star parties, planetarium shows, and workshops. Customers buy tickets right on the website.',
  },
  {
    navTarget: '/admin/emails',
    title: 'Email',
    desc: 'Send newsletters and announcements to customers and members. Pick a template and go.',
  },
  {
    navTarget: '/admin/content',
    title: 'Content',
    desc: 'Edit the website text, announcements, and categories without calling anyone.',
  },
];

const STAFF_TOUR = [
  {
    navTarget: '/admin',
    title: 'Dashboard',
    desc: "Check what's happening today -- new orders, low stock alerts.",
  },
  {
    navTarget: '/admin/receive',
    title: 'Receive',
    desc: 'When a shipment arrives, come here. Scan or search for products, enter quantities, done.',
  },
  {
    navTarget: '/admin/inventory',
    title: 'Inventory',
    desc: "See what's in stock at the gift shop. If something looks wrong, you can adjust it.",
  },
  {
    navTarget: '/admin/transfers',
    title: 'Transfers',
    desc: 'When Tovah sends products from the warehouse, confirm what you received here.',
  },
  {
    navTarget: '/admin/orders',
    title: 'Orders',
    desc: 'See online orders and POS sales. Check status and tracking.',
  },
];

// ── QUICK TIPS PER PAGE ──
const QUICK_TIPS = {
  '/admin': [
    'The dashboard updates in real time -- refresh to see latest orders',
    'Red alerts mean something needs your attention right away',
    'Click any order row to see its full details',
  ],
  '/admin/inventory': [
    'Red means out of stock, yellow means running low',
    'Click any product to see its movement history',
    'Use the location filter to see just your gift shop stock',
  ],
  '/admin/receive': [
    'Tap the search bar and start typing a product name',
    'Enter the quantity you received for each item',
    'Always select the correct location -- Warehouse or Gift Shop',
    'Add a PO number in the notes so we can track it',
  ],
  '/admin/transfers': [
    'Create a transfer when sending stock between locations',
    "Mark items as Shipped when they leave, Received when they arrive",
    'Check the status column to see what\'s in transit',
  ],
  '/admin/purchase-orders': [
    'Create a PO before ordering from any vendor',
    'Update the status as it moves: Ordered -> Shipped -> Received',
    'When you mark Received, it automatically adds to inventory',
  ],
  '/admin/orders': [
    'Use the status filter to find orders that need fulfillment',
    'Click an order to view items and customer details',
    'POS orders sync automatically from Square',
  ],
  '/admin/events': [
    'Set ticket limits to control capacity for each event',
    'Use the Duplicate button to quickly create recurring events',
    'Check ticket sales and manage check-ins from the detail view',
  ],
  '/admin/emails': [
    'Start from a template to save time on formatting',
    'Use the audience selector to target specific customer groups',
    'Schedule emails ahead of time for optimal delivery',
  ],
  '/admin/content': [
    'Edit page content and it goes live instantly',
    'Toggle announcement bar visibility from here',
    'Drag categories to reorder how they appear in the shop',
  ],
  '/admin/reports': [
    'Switch date ranges to compare different periods',
    'Export any chart as CSV for spreadsheets',
    'The donut chart breaks down revenue by sales channel',
  ],
  '/admin/quickbooks': [
    'Use Export Center to download CSVs for QuickBooks import',
    'Sales exports match QuickBooks Online CSV format exactly',
    'Check Export History to re-download previous files',
    'Live QuickBooks connection coming soon -- use manual exports for now',
  ],
};

// ── WELCOME MODAL ──
function WelcomeModal({ onStart, onSkip }) {
  const [role, setRole] = useState(null);

  return (
    <div className="tour-overlay">
      <div className="tour-welcome">
        <div className="tour-welcome-star">&#10022;</div>
        <h2>Welcome to Dark Sky Admin</h2>
        <p>
          Your all-in-one platform for managing the gift shop, events,
          memberships, and more.
        </p>

        <div className="tour-roles">
          <button
            className={`tour-role ${role === 'manager' ? 'selected' : ''}`}
            onClick={() => setRole('manager')}
          >
            <div className="tour-role-icon">&#128105;&#8205;&#128188;</div>
            <div className="tour-role-info">
              <h4>I'm a Manager</h4>
              <p>Tovah, Nancy -- full access tour</p>
            </div>
          </button>
          <button
            className={`tour-role ${role === 'staff' ? 'selected' : ''}`}
            onClick={() => setRole('staff')}
          >
            <div className="tour-role-icon">&#127978;</div>
            <div className="tour-role-info">
              <h4>I'm Gift Shop Staff</h4>
              <p>Josie -- daily operations tour</p>
            </div>
          </button>
          <button
            className={`tour-role ${role === 'explore' ? 'selected' : ''}`}
            onClick={() => setRole('explore')}
          >
            <div className="tour-role-icon">&#128301;</div>
            <div className="tour-role-info">
              <h4>Just exploring</h4>
              <p>Skip the tour, look around</p>
            </div>
          </button>
        </div>

        <button
          className="tour-start-btn"
          disabled={!role}
          onClick={() => {
            if (role === 'explore') {
              onSkip();
            } else {
              onStart(role);
            }
          }}
        >
          {role === 'explore' ? 'Get Started' : 'Start Tour'}
        </button>
        <button className="tour-skip" onClick={onSkip}>
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ── SPOTLIGHT TOUR ──
function SpotlightTour({ steps, onComplete, onSkip }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const rafRef = useRef(null);

  const currentStep = steps[stepIndex];

  const measureTarget = useCallback(() => {
    if (!currentStep) return;
    // Find the sidebar nav link for this step
    const links = document.querySelectorAll('.admin-nav-item');
    let target = null;
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentStep.navTarget) target = link;
    });

    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      });

      // Position tooltip to the right of sidebar
      const sidebarWidth = 260;
      const tooltipWidth = 320;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let tLeft = sidebarWidth + 24;
      let tTop = rect.top - 10;

      // On mobile/iPad, position below or centered
      if (vw < 860) {
        tLeft = Math.max(16, (vw - tooltipWidth) / 2);
        tTop = rect.bottom + 16;
      }

      // Keep tooltip on screen
      if (tTop + 220 > vh) tTop = vh - 240;
      if (tTop < 16) tTop = 16;

      setTooltipPos({ top: tTop, left: tLeft });

      // Scroll nav item into view
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStep]);

  useEffect(() => {
    if (done) return;
    // Navigate to the step's page
    if (currentStep) {
      navigate(currentStep.navTarget);
      // Wait for navigation + render, then measure
      const timer = setTimeout(measureTarget, 150);
      return () => clearTimeout(timer);
    }
  }, [stepIndex, currentStep, navigate, measureTarget, done]);

  // Remeasure on resize
  useEffect(() => {
    if (done) return;
    const handler = () => measureTarget();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [measureTarget, done]);

  const goNext = () => {
    if (stepIndex >= steps.length - 1) {
      setDone(true);
    } else {
      setStepIndex(i => i + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex(i => i - 1);
  };

  if (done) {
    return (
      <div className="tour-overlay">
        <div className="tour-welcome">
          <div className="tour-complete">
            <div className="tour-complete-check">&#10003;</div>
            <h3>You're all set!</h3>
            <p>
              You can replay this tour anytime from the{' '}
              <strong style={{ color: '#d4af37' }}>?</strong> help button in the
              bottom-right corner.
            </p>
            <button className="tour-start-btn" onClick={onComplete}>
              Start Using Dark Sky Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Build SVG mask for spotlight
  const maskRect = targetRect || { top: 0, left: 0, width: 0, height: 0 };

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <svg
        className="tour-spotlight-bg"
        style={{ position: 'fixed', inset: 0, zIndex: 8999, pointerEvents: 'auto' }}
        width="100%"
        height="100%"
        onClick={(e) => e.stopPropagation()}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={maskRect.left}
              y={maskRect.top}
              width={maskRect.width}
              height={maskRect.height}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.5)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Gold ring around target */}
      {targetRect && (
        <div
          className="tour-spotlight-ring"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Tooltip */}
      {targetRect && (
        <div
          className="tour-tooltip"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          <h3>{currentStep.title}</h3>
          <p>{currentStep.desc}</p>

          <div className="tour-tooltip-nav">
            <span className="tour-counter">
              {stepIndex + 1} of {steps.length}
            </span>
            <div className="tour-tooltip-btns">
              {stepIndex > 0 && (
                <button className="tour-btn-back" onClick={goBack}>
                  Back
                </button>
              )}
              <button className="tour-btn-next" onClick={goNext}>
                {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>

          <div className="tour-dots">
            {steps.map((_, i) => (
              <div key={i} className={`tour-dot ${i === stepIndex ? 'active' : ''}`} />
            ))}
          </div>

          <button className="tour-skip-tour" onClick={onSkip}>
            Skip Tour
          </button>
        </div>
      )}
    </>
  );
}

// ── HELP BUTTON + MENU ──
function HelpButton({ onReplayTour, onTourPage }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const tips = QUICK_TIPS[location.pathname] || QUICK_TIPS['/admin'];

  // Find the page name from path
  const pageName = (() => {
    const seg = location.pathname.split('/').filter(Boolean);
    if (seg.length <= 1) return 'Dashboard';
    return seg[seg.length - 1]
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  })();

  return (
    <div ref={menuRef}>
      <button className="tour-help-btn" onClick={() => setOpen(o => !o)}>
        ?
      </button>

      {open && (
        <div className="tour-help-menu">
          <div className="tour-help-menu-header">
            <h4>Help</h4>
            <small>{pageName}</small>
          </div>

          <button
            className="tour-help-menu-item"
            onClick={() => {
              setOpen(false);
              onReplayTour();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1,4 1,10 7,10" />
              <path d="M3.51 15a9 9 0 105.64-11.36L1 10" />
            </svg>
            Replay Full Tour
          </button>

          <button
            className="tour-help-menu-item"
            onClick={() => {
              setOpen(false);
              onTourPage();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Tour This Page
          </button>

          <div className="tour-help-divider" />

          <a
            className="tour-help-menu-item"
            href="mailto:saleem@createandsource.com"
            style={{ textDecoration: 'none' }}
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Contact Support
          </a>

          {tips && tips.length > 0 && (
            <div className="tour-help-tips">
              <h5>Quick Tips</h5>
              {tips.map((tip, i) => (
                <div key={i} className="tour-help-tip">
                  {tip}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── PAGE TOUR (single-page mini tour) ──
function PageTour({ onComplete }) {
  const location = useLocation();
  const tips = QUICK_TIPS[location.pathname] || QUICK_TIPS['/admin'];

  const pageName = (() => {
    const seg = location.pathname.split('/').filter(Boolean);
    if (seg.length <= 1) return 'Dashboard';
    return seg[seg.length - 1]
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  })();

  return (
    <div className="tour-overlay" onClick={onComplete}>
      <div className="tour-welcome" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>{pageName}</h2>
        <div style={{ textAlign: 'left', marginBottom: 24 }}>
          {tips.map((tip, i) => (
            <div key={i} className="tour-help-tip" style={{ padding: '8px 0' }}>
              {tip}
            </div>
          ))}
        </div>
        <button className="tour-start-btn" onClick={onComplete}>
          Got it
        </button>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ──
const STORAGE_KEY = 'darksky_admin_onboarded';

export default function AdminTour() {
  const [phase, setPhase] = useState('idle'); // idle | welcome | touring | pageTour
  const [tourSteps, setTourSteps] = useState(MANAGER_TOUR);

  // Inject CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = TOUR_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Check first visit
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setPhase('welcome');
    }
  }, []);

  const markOnboarded = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleStart = (role) => {
    setTourSteps(role === 'staff' ? STAFF_TOUR : MANAGER_TOUR);
    setPhase('touring');
  };

  const handleSkipWelcome = () => {
    markOnboarded();
    setPhase('idle');
  };

  const handleTourComplete = () => {
    markOnboarded();
    setPhase('idle');
  };

  const handleTourSkip = () => {
    markOnboarded();
    setPhase('idle');
  };

  const handleReplayTour = () => {
    setPhase('welcome');
  };

  const handleTourPage = () => {
    setPhase('pageTour');
  };

  return (
    <>
      {phase === 'welcome' && (
        <WelcomeModal onStart={handleStart} onSkip={handleSkipWelcome} />
      )}

      {phase === 'touring' && (
        <SpotlightTour
          steps={tourSteps}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}

      {phase === 'pageTour' && (
        <PageTour onComplete={() => setPhase('idle')} />
      )}

      {phase === 'idle' && (
        <HelpButton
          onReplayTour={handleReplayTour}
          onTourPage={handleTourPage}
        />
      )}
    </>
  );
}
