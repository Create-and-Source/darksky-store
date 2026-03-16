import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STEPS = [
  { section: 'Introduction', say: "This is MuseumOS \u2014 a complete platform for running the International Dark Sky Discovery Center. Every role gets their own dashboard, their own tools, and their own experience.", route: '/signin', target: null },
  { section: 'Introduction', say: "Let me sign in as Dr. J, the Executive Director, who sees everything. Click his card.", route: '/signin', target: '[data-role="executive_director"]' },
  { section: 'Dashboard', say: "This is the command center. Revenue, members, events, fundraising \u2014 everything at a glance. These numbers are live from the system.", route: '/admin', target: null, action: () => { localStorage.setItem('ds_admin_role', 'executive_director'); localStorage.setItem('ds_user_name', 'Dr. J'); localStorage.setItem('ds_user_role', 'manager'); } },
  { section: 'Dashboard', say: "Notice the announcement bar \u2014 it controls what visitors see on the public website. Changes here show up instantly on the storefront.", route: '/admin', target: null },
  { section: 'Messages', say: "No more email chains. Everyone communicates inside the platform. Maria messaged about a field trip, Josi needs to reorder posters.", route: '/admin/messages', target: null },
  { section: 'Messages', say: "I can reply right here. Teachers can even message us from their School Portal.", route: '/admin/messages', target: null },
  { section: 'Point of Sale', say: "This is the register. When a customer walks up to the gift shop, Josi searches or scans a barcode, and it adds to the cart instantly.", route: '/admin/pos', target: '.pos-left input[type="text"]' },
  { section: 'Point of Sale', say: "If they're a member, scan their QR code from their phone for an automatic discount. Then hit Charge \u2014 it goes through Square.", route: '/admin/pos', target: null },
  { section: 'Orders', say: "Every order \u2014 online and POS \u2014 lands here. Status tracking, customer info, line items. When someone checks out on the website, their order appears here instantly.", route: '/admin/orders', target: null },
  { section: 'Inventory', say: "Every product across both locations \u2014 warehouse and gift shop. Yellow means low stock, red means out. Velocity shows how fast it sells. Days Left tells you when to reorder.", route: '/admin/inventory', target: null },
  { section: 'Products', say: "The full catalog \u2014 67 print-on-demand products from Printify plus 10 physical gift shop items. Physical products get barcodes automatically. Print them, stick them on products.", route: '/admin/products', target: null },
  { section: 'Purchase Orders', say: "When you need to reorder from a vendor \u2014 Printify, wholesale suppliers, local artisans \u2014 create a PO here. It tracks from Draft to Ordered to Shipped to Received.", route: '/admin/purchase-orders', target: null },
  { section: 'Receiving', say: "When a shipment arrives, Josi uses Receive to log what came in. Pick location, scan products, enter quantities. Inventory updates automatically.", route: '/admin/receive', target: null },
  { section: 'Transfers', say: "Transfers move stock between the warehouse and gift shop. Create a transfer, mark it shipped, mark it received. Stock stays accurate across locations.", route: '/admin/transfers', target: null },
  { section: 'Events', say: "Create and manage all events \u2014 star parties, planetarium shows, kids programs. Set capacity, pricing, and toggle member-free. Reservations from the public website show up here.", route: '/admin/events', target: null },
  { section: 'Field Trips', say: "This is critical for Dr. J. Full field trip management \u2014 from booking inquiry to completion. Schools submit requests on the website, staff manages them here.", route: '/admin/field-trips', target: null },
  { section: 'Field Trips', say: "Click View on any trip to see contact info, status, notes. The status moves from New to Contacted to Confirmed to Completed.", route: '/admin/field-trips', target: '.admin-btn-outline' },
  { section: 'CRM', say: "Every contact in one place \u2014 members, donors, event attendees, volunteers, schools. Pulled automatically from every part of the system. No data entry needed.", route: '/admin/crm', target: null },
  { section: 'Donations', say: "Track every donation. The fundraising thermometer on the board meeting view pulls from this data. The public Donate page on the website feeds directly into this system.", route: '/admin/donations', target: null },
  { section: 'Email', say: "Compose and send email campaigns. Pick your audience \u2014 all members, event attendees, donors. Use templates or write custom. Delivery connects to SendGrid or Mailchimp.", route: '/admin/emails', target: null },
  { section: 'Text Blasts', say: "Same thing for SMS. Clear Sky Alert tonight? One tap, goes to all members. Event reminder? Pick the audience and send.", route: '/admin/text-blasts', target: null },
  { section: 'Social Media', say: "Schedule social posts across Instagram, Facebook, X, and LinkedIn. Draft, schedule, publish \u2014 all from one screen.", route: '/admin/social-media', target: null },
  { section: 'Design Studio', say: "AI-powered poster and graphic generator. Describe what you want, it creates it. Export as PNG for social media or print.", route: '/admin/design-studio', target: null },
  { section: 'Volunteers', say: "Full volunteer management. Four tabs: Roster with contact info, weekly Schedule showing who's available, Hours Log for tracking time, and Training for certification tracking.", route: '/admin/volunteers', target: null },
  { section: 'Staff & Time', say: "Staff roster and time tracking. We track hours \u2014 your payroll provider handles taxes. Export to CSV for payroll processing.", route: '/admin/payroll', target: null },
  { section: 'Reports', say: "Analytics for everything \u2014 revenue, top products, channel breakdown, inventory health, membership tiers. Each role sees only their relevant reports.", route: '/admin/reports', target: null },
  { section: 'QuickBooks', say: "Nancy exports sales, products, customers, and bills as CSV files ready for QuickBooks import. Every export is logged with timestamp and record count.", route: '/admin/quickbooks', target: null },
  { section: 'Role Demo', say: "Now watch what happens when different people sign in. Josi the Gift Shop Manager \u2014 she only sees POS, orders, inventory. No financial reports, no events.", route: '/admin', target: null, action: () => { localStorage.setItem('ds_admin_role', 'shop_manager'); localStorage.setItem('ds_user_name', 'Josi'); localStorage.setItem('ds_user_role', 'manager'); } },
  { section: 'Role Demo', say: "Nancy the Treasurer. She sees donations, reports, QuickBooks. No inventory, no POS. Each role is completely different.", route: '/admin', target: null, action: () => { localStorage.setItem('ds_admin_role', 'treasurer'); localStorage.setItem('ds_user_name', 'Nancy'); localStorage.setItem('ds_user_role', 'manager'); } },
  { section: 'Role Demo', say: "Maria the Education Director \u2014 events, field trips, volunteers, reports. Her whole world is programs and schools.", route: '/admin', target: null, action: () => { localStorage.setItem('ds_admin_role', 'education_director'); localStorage.setItem('ds_user_name', 'Maria'); localStorage.setItem('ds_user_role', 'manager'); } },
  { section: 'Board Meeting', say: "For board members \u2014 a full-screen, projector-ready view. Capital campaign progress, revenue, membership, upcoming events.", route: '/admin/board-meeting', target: null, action: () => { localStorage.setItem('ds_admin_role', 'board'); localStorage.setItem('ds_user_name', 'Board'); localStorage.setItem('ds_user_role', 'manager'); } },
  { section: 'Portals', say: "Members, volunteers, and schools each have their own portal. The Member Portal has a scannable QR code, events, and donate \u2014 all without leaving the portal.", route: '/member-portal', target: null },
  { section: 'Portals', say: "Schools log in by selecting their school name. They see trip status, preparation checklists, and can message the education coordinator.", route: '/school-portal', target: null },
  { section: 'Portals', say: "Volunteers see their schedule, log hours, track certifications, and clock in with GPS verification.", route: '/volunteer-portal', target: null },
  { section: 'Website', say: "The public website. Everything connects. Events from admin show here. Products from the catalog are in the shop. Membership count is live.", route: '/', target: null },
  { section: 'Website', say: "The shop, event reservations, membership signups, field trip bookings, donations, contact forms \u2014 everything feeds into MuseumOS.", route: '/shop', target: null },
  { section: 'Summary', say: "That's MuseumOS. One platform. Every department. Every role. Every external stakeholder. The only thing left to connect is Square for payments and QuickBooks API \u2014 everything else is built and working.", route: null, target: null },
  { section: 'Summary', say: "No more spreadsheets. No more email chains. No more 'I didn't know we were out of stock.' This is how a modern museum runs.", route: null, target: null },
];

export default function DemoScript() {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const current = STEPS[step];
  const total = STEPS.length;
  const progress = ((step + 1) / total) * 100;

  const goToStep = useCallback((newStep) => {
    const s = STEPS[newStep];
    if (!s) return;
    if (s.action) s.action();
    if (s.route && s.route !== location.pathname) {
      navigate(s.route);
    }
    setStep(newStep);
  }, [navigate, location.pathname]);

  const next = useCallback(() => goToStep(Math.min(step + 1, total - 1)), [step, total, goToStep]);
  const prev = useCallback(() => goToStep(Math.max(step - 1, 0)), [step, goToStep]);

  // Keyboard navigation
  useEffect(() => {
    const handle = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.contentEditable === 'true') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [next, prev]);

  // Highlight target element
  const [highlightRect, setHighlightRect] = useState(null);
  useEffect(() => {
    if (!visible || !current?.target) { setHighlightRect(null); return; }
    const findEl = () => {
      const el = document.querySelector(current.target);
      if (!el) { setHighlightRect(null); return; }
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) { setHighlightRect(null); return; }
      setHighlightRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    findEl();
    const t1 = setTimeout(findEl, 300);
    const t2 = setTimeout(findEl, 800);
    const poll = setInterval(findEl, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(poll); };
  }, [step, visible, current]);

  // Check if current page matches the demo step
  const onCorrectPage = !current?.route || current.route === location.pathname;

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed', bottom: 90, right: 20, zIndex: 9999,
          background: 'rgba(26,26,46,0.9)', color: '#D4AF37',
          border: '1px solid rgba(212,175,55,0.3)', borderRadius: 10,
          padding: '10px 16px', cursor: 'pointer',
          font: "600 12px 'Inter', -apple-system, sans-serif",
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{ fontSize: 14 }}>{'\u2726'}</span> Demo {step + 1}/{total}
      </button>
    );
  }

  return (
    <>
    {highlightRect && (
      <div style={{
        position: 'fixed', top: highlightRect.top - 4, left: highlightRect.left - 4,
        width: highlightRect.width + 8, height: highlightRect.height + 8,
        border: '2px solid #D4AF37', borderRadius: 6,
        boxShadow: '0 0 0 3px rgba(212,175,55,0.2), 0 0 20px rgba(212,175,55,0.15)',
        zIndex: 9998, pointerEvents: 'none',
        animation: 'demoPulse 1.5s ease-in-out infinite',
      }} />
    )}
    <style>{`@keyframes demoPulse { 0%, 100% { box-shadow: 0 0 0 3px rgba(212,175,55,0.2), 0 0 20px rgba(212,175,55,0.15); } 50% { box-shadow: 0 0 0 6px rgba(212,175,55,0.3), 0 0 30px rgba(212,175,55,0.25); } }`}</style>

    <div style={{
      position: 'fixed', bottom: 90, right: 20, zIndex: 9999,
      width: 380, maxWidth: 'calc(100vw - 32px)',
      background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(12px)',
      borderRadius: 12, borderTop: '3px solid #D4AF37',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: '#2a2a4a' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#D4AF37', transition: 'width 0.3s ease' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: "600 10px 'JetBrains Mono', monospace", letterSpacing: 1, textTransform: 'uppercase', color: '#D4AF37' }}>
            {current.section}
          </span>
          <span style={{ font: "400 10px 'JetBrains Mono', monospace", color: '#64748B' }}>
            {step + 1}/{total}
          </span>
        </div>
        <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 4 }}>{'\u2715'}</button>
      </div>

      {/* Content */}
      <div style={{ padding: '6px 16px 14px' }}>
        {!onCorrectPage ? (
          <div>
            <p style={{ font: "400 13px/1.5 'Inter', sans-serif", color: '#94A3B8', margin: '0 0 10px' }}>
              You navigated away from the demo page.
            </p>
            <button
              onClick={() => { if (current.route) navigate(current.route); }}
              style={{
                background: '#D4AF37', border: 'none', color: '#1A1A2E', borderRadius: 6,
                padding: '8px 16px', font: "600 12px 'Inter', sans-serif", cursor: 'pointer',
              }}
            >
              Go to {current.section} {'\u2192'}
            </button>
          </div>
        ) : (
          <p style={{ font: "400 14px/1.55 'Inter', sans-serif", color: '#F0EDE6', margin: 0 }}>
            "{current.say}"
          </p>
        )}
      </div>

      {/* Nav buttons */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px 10px', borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <button onClick={prev} disabled={step === 0} style={{
          background: 'none', border: 'none', color: step === 0 ? '#3a3a5a' : '#94A3B8',
          cursor: step === 0 ? 'default' : 'pointer', font: "500 13px 'Inter', sans-serif",
          padding: '6px 0',
        }}>{'\u2190'} Back</button>

        <button onClick={next} disabled={step === total - 1} style={{
          background: step === total - 1 ? 'none' : '#D4AF37', border: 'none',
          color: step === total - 1 ? '#3a3a5a' : '#1A1A2E',
          cursor: step === total - 1 ? 'default' : 'pointer',
          font: "600 13px 'Inter', sans-serif", borderRadius: 6,
          padding: '6px 16px',
        }}>Next {'\u2192'}</button>
      </div>
    </div>
    </>
  );
}
