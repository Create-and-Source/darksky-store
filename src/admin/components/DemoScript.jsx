import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STEPS = [
  // INTRO
  { section: 'Introduction', say: "This is MuseumOS \u2014 a complete platform for running the International Dark Sky Discovery Center. Every role gets their own dashboard, their own tools, and their own experience.", route: '/signin', target: null },
  { section: 'Introduction', say: "Let me sign in as Dr. J, the Executive Director, who sees everything. Click his card.", route: '/signin', target: '[data-role="executive_director"]' },

  // DASHBOARD
  { section: 'Dashboard', say: "This is the command center. Revenue, members, events, fundraising \u2014 everything at a glance. These numbers are live from the system.", route: '/admin', target: null, action: () => { localStorage.setItem('ds_admin_role', 'executive_director'); localStorage.setItem('ds_user_name', 'Dr. J'); localStorage.setItem('ds_user_role', 'manager'); } },
  { section: 'Dashboard', say: "Notice the announcement bar \u2014 it controls what visitors see on the public website. Changes here show up instantly on the storefront.", route: '/admin', target: null },

  // MESSAGES
  { section: 'Messages', say: "No more email chains. Everyone communicates inside the platform. Maria messaged about a field trip, Josi needs to reorder posters.", route: '/admin/messages', target: null },
  { section: 'Messages', say: "I can reply right here. Teachers can even message us from their School Portal.", route: '/admin/messages', target: null },

  // POS
  { section: 'Point of Sale', say: "This is the register. When a customer walks up to the gift shop, Josi searches or scans a barcode, and it adds to the cart instantly.", route: '/admin/pos', target: '.pos-left input[type="text"]' },
  { section: 'Point of Sale', say: "If they're a member, scan their QR code from their phone for an automatic discount. Then hit Charge \u2014 it goes through Square.", route: '/admin/pos', target: null },

  // ORDERS
  { section: 'Orders', say: "Every order \u2014 online and POS \u2014 lands here. Status tracking, customer info, line items. When someone checks out on the website, their order appears here instantly.", route: '/admin/orders', target: null },

  // INVENTORY
  { section: 'Inventory', say: "Every product across both locations \u2014 warehouse and gift shop. Yellow means low stock, red means out. Velocity shows how fast it sells. Days Left tells you when to reorder.", route: '/admin/inventory', target: null },

  // PRODUCTS
  { section: 'Products', say: "The full catalog \u2014 67 print-on-demand products from Printify plus 10 physical gift shop items. Physical products get barcodes automatically. Print them, stick them on products.", route: '/admin/products', target: null },

  // PURCHASE ORDERS
  { section: 'Purchase Orders', say: "When you need to reorder from a vendor \u2014 Printify, wholesale suppliers, local artisans \u2014 create a PO here. It tracks from Draft to Ordered to Shipped to Received.", route: '/admin/purchase-orders', target: null },

  // RECEIVE
  { section: 'Receiving', say: "When a shipment arrives, Josi uses Receive to log what came in. Pick location, scan products, enter quantities. Inventory updates automatically.", route: '/admin/receive', target: null },

  // TRANSFERS
  { section: 'Transfers', say: "Transfers move stock between the warehouse and gift shop. Create a transfer, mark it shipped, mark it received. Stock stays accurate across locations.", route: '/admin/transfers', target: null },

  // EVENTS
  { section: 'Events', say: "Create and manage all events \u2014 star parties, planetarium shows, kids programs. Set capacity, pricing, and toggle member-free. Reservations from the public website show up here.", route: '/admin/events', target: null },

  // FIELD TRIPS
  { section: 'Field Trips', say: "This is critical for Dr. J. Full field trip management \u2014 from booking inquiry to completion. Schools submit requests on the website, staff manages them here.", route: '/admin/field-trips', target: null },
  { section: 'Field Trips', say: "Click View on any trip to see contact info, status, notes. The status moves from New to Contacted to Confirmed to Completed.", route: '/admin/field-trips', target: '.admin-btn-outline' },

  // DONATIONS
  { section: 'Donations', say: "Track every donation. The fundraising thermometer on the board meeting view pulls from this data. The public Donate page on the website feeds directly into this system.", route: '/admin/donations', target: null },

  // EMAIL
  { section: 'Email', say: "Compose and send email campaigns. Pick your audience \u2014 all members, event attendees, donors. Use templates or write custom. Delivery connects to SendGrid or Mailchimp.", route: '/admin/emails', target: null },

  // TEXT BLASTS
  { section: 'Text Blasts', say: "Same thing for SMS. Clear Sky Alert tonight? One tap, goes to all members. Event reminder? Pick the audience and send. Character counter keeps you under the SMS limit.", route: '/admin/text-blasts', target: null },

  // SOCIAL MEDIA
  { section: 'Social Media', say: "Schedule social posts across Instagram, Facebook, X, and LinkedIn. Draft, schedule, publish \u2014 all from one screen.", route: '/admin/social-media', target: null },

  // DESIGN STUDIO
  { section: 'Design Studio', say: "AI-powered poster and graphic generator. Describe what you want, it creates it. Export as PNG for social media or print.", route: '/admin/design-studio', target: null },

  // VOLUNTEERS
  { section: 'Volunteers', say: "Full volunteer management. Four tabs: Roster with contact info, weekly Schedule showing who's available, Hours Log for tracking time, and Training for certification tracking.", route: '/admin/volunteers', target: null },
  { section: 'Volunteers', say: "Volunteers clock in through their own portal with geo-fencing \u2014 they have to be physically at the facility. Hours log automatically.", route: '/admin/volunteers', target: null },

  // STAFF & TIME
  { section: 'Staff & Time', say: "Staff roster and time tracking. We track hours \u2014 your payroll provider handles taxes. Export to CSV for payroll processing.", route: '/admin/payroll', target: null },

  // REPORTS
  { section: 'Reports', say: "Analytics for everything \u2014 revenue, top products, channel breakdown, inventory health, membership tiers. Each role sees only their relevant reports.", route: '/admin/reports', target: null },

  // QUICKBOOKS
  { section: 'QuickBooks', say: "Nancy exports sales, products, customers, and bills as CSV files ready for QuickBooks import. Every export is logged with timestamp and record count.", route: '/admin/quickbooks', target: null },

  // ROLE SWITCHING
  { section: 'Role Demo', say: "Now watch what happens when different people sign in. I'll switch to Josi, the Gift Shop Manager. She only sees POS, orders, inventory \u2014 no financial reports, no events.", route: '/admin', target: '.admin-topbar-avatar', action: () => { localStorage.setItem('ds_admin_role', 'shop_manager'); localStorage.setItem('ds_user_name', 'Josi'); localStorage.setItem('ds_user_role', 'manager'); } },
  { section: 'Role Demo', say: "Now Nancy the Treasurer. She sees donations, reports, QuickBooks. No inventory, no POS. Each role is completely different.", route: '/admin', target: null, action: () => { localStorage.setItem('ds_admin_role', 'treasurer'); localStorage.setItem('ds_user_name', 'Nancy'); localStorage.setItem('ds_user_role', 'manager'); } },
  { section: 'Role Demo', say: "Maria the Education Director \u2014 events, field trips, volunteers, reports. Her whole world is programs and schools.", route: '/admin', target: null, action: () => { localStorage.setItem('ds_admin_role', 'education_director'); localStorage.setItem('ds_user_name', 'Maria'); localStorage.setItem('ds_user_role', 'manager'); } },

  // BOARD MEETING
  { section: 'Board Meeting', say: "For board members \u2014 a full-screen, projector-ready view. Capital campaign progress, revenue, membership, upcoming events. One click from the dashboard.", route: '/admin/board-meeting', target: null, action: () => { localStorage.setItem('ds_admin_role', 'board'); localStorage.setItem('ds_user_name', 'Board'); localStorage.setItem('ds_user_role', 'manager'); } },

  // PORTALS
  { section: 'Portals', say: "It's not just for staff. Members, volunteers, and schools each have their own portal. Let me show you the Member Portal.", route: '/signin', target: null },
  { section: 'Portals', say: "The Member Portal shows their digital QR code for gift shop discounts, membership tier, benefits, upcoming events, and order history.", route: '/member-portal', target: null },
  { section: 'Portals', say: "Schools log in by selecting their school name. They see trip status, preparation checklists, and can message the education coordinator directly.", route: '/school-portal', target: null },
  { section: 'Portals', say: "Volunteers see their schedule, log hours, track certifications, and clock in with GPS verification \u2014 they have to be at the facility.", route: '/volunteer-portal', target: null },

  // PUBLIC WEBSITE
  { section: 'Website', say: "And the public website. Everything connects. Events from admin show here. Products from the catalog are in the shop. Membership count is live.", route: '/', target: null },
  { section: 'Website', say: "The shop is a full e-commerce experience \u2014 search, filter, sort, add to cart, checkout. Orders flow into the admin automatically.", route: '/shop', target: null },
  { section: 'Website', say: "Event reservations, membership signups, field trip bookings, donations, contact forms \u2014 everything feeds into MuseumOS.", route: '/events', target: null },

  // CLOSING
  { section: 'Summary', say: "That's MuseumOS. One platform. Every department. Every role. Every external stakeholder. The only thing left to connect is Square for payments and QuickBooks API \u2014 everything else is built and working.", route: null, target: null },
  { section: 'Summary', say: "No more spreadsheets. No more email chains. No more 'I didn't know we were out of stock.' This is how a modern museum runs.", route: null, target: null },
];

export default function DemoScript() {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const current = STEPS[step];
  const total = STEPS.length;
  const progress = ((step + 1) / total) * 100;

  const goToStep = useCallback((newStep) => {
    const s = STEPS[newStep];
    if (!s) return;
    // Stop any current speech
    window.speechSynthesis.cancel();
    // Run any action (like role switching)
    if (s.action) s.action();
    // Navigate to the route
    if (s.route && s.route !== location.pathname) {
      navigate(s.route);
    }
    setStep(newStep);
    // Read aloud with best available voice
    setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      // Priority: Premium/Enhanced voices > Siri > Google > any en-US
      const bestVoice = voices.find(v => v.name.includes('Zoe') && v.lang.startsWith('en')) ||
        voices.find(v => v.name.includes('Samantha') && v.name.includes('Enhanced')) ||
        voices.find(v => v.name.includes('Ava') && v.name.includes('Premium')) ||
        voices.find(v => v.name.includes('Allison') && v.name.includes('Premium')) ||
        voices.find(v => v.name.includes('Samantha')) ||
        voices.find(v => v.name.includes('Karen') && v.lang.startsWith('en')) ||
        voices.find(v => v.name.includes('Daniel') && v.lang.startsWith('en')) ||
        voices.find(v => v.name.includes('Google US English')) ||
        voices.find(v => v.lang === 'en-US' && v.localService) ||
        voices.find(v => v.lang.startsWith('en'));

      // Break text into sentences for more natural pacing
      const sentences = s.say.match(/[^.!?\u2014]+[.!?\u2014]*/g) || [s.say];
      let delay = 0;
      sentences.forEach((sentence, i) => {
        setTimeout(() => {
          const u = new SpeechSynthesisUtterance(sentence.trim());
          u.rate = 0.9;
          u.pitch = 1.05;
          u.volume = 1;
          if (bestVoice) u.voice = bestVoice;
          window.speechSynthesis.speak(u);
        }, delay);
        // Estimate duration: ~80ms per character + 400ms pause between sentences
        delay += sentence.trim().length * 80 + (i < sentences.length - 1 ? 400 : 0);
      });
    }, 600);
  }, [navigate, location.pathname]);

  const next = useCallback(() => goToStep(Math.min(step + 1, total - 1)), [step, total, goToStep]);
  const prev = useCallback(() => goToStep(Math.max(step - 1, 0)), [step, goToStep]);

  // Drag handlers
  const onMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  };
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      setPos({
        x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 380)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 100)),
      });
    };
    const onUp = () => setDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [dragging]);

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
    window.addEventListener('scroll', findEl);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(poll); window.removeEventListener('scroll', findEl); };
  }, [step, visible, current]);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed', ...(pos.x !== null ? { left: pos.x, top: pos.y } : { bottom: 20, right: 20 }), zIndex: 9999,
          background: 'rgba(212,175,55,0.15)', color: '#D4AF37',
          border: '1px solid rgba(212,175,55,0.3)', borderRadius: 20,
          padding: '8px 18px', cursor: 'pointer',
          font: "600 12px 'Inter', -apple-system, sans-serif",
          letterSpacing: '0.5px', textTransform: 'uppercase',
          backdropFilter: 'blur(8px)', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; }}
      >
        Demo ({step + 1}/{total})
      </button>
    );
  }

  const panelPosition = pos.x !== null
    ? { left: pos.x, top: pos.y }
    : { bottom: 20, right: 20 };

  return (
    <>
    {/* Highlight */}
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

    <div ref={panelRef} onMouseDown={onMouseDown} style={{
      position: 'fixed', ...panelPosition, zIndex: 9999,
      width: 400, maxWidth: 'calc(100vw - 32px)',
      background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(12px)',
      borderRadius: 12, borderTop: '3px solid #D4AF37',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab',
      userSelect: 'none',
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
        <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 4 }}>{'\u2715'}</button>
      </div>

      {/* SAY text */}
      <div style={{ padding: '8px 16px 16px', flex: 1 }}>
        <p style={{
          font: "400 15px/1.55 'Inter', -apple-system, sans-serif",
          color: '#F0EDE6', margin: 0,
        }}>
          "{current.say}"
        </p>
      </div>

      {/* Nav buttons */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <button onClick={prev} disabled={step === 0} style={{
          background: 'none', border: 'none', color: step === 0 ? '#3a3a5a' : '#94A3B8',
          cursor: step === 0 ? 'default' : 'pointer', font: "500 13px 'Inter', sans-serif",
          display: 'flex', alignItems: 'center', gap: 4, padding: '6px 0',
        }}>{'\u2190'} Back</button>

        <div style={{ display: 'flex', gap: 3 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 12 : 4, height: 4, borderRadius: 2,
              background: i <= step ? '#D4AF37' : '#3a3a5a',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        <button onClick={next} disabled={step === total - 1} style={{
          background: step === total - 1 ? 'none' : '#D4AF37', border: 'none',
          color: step === total - 1 ? '#3a3a5a' : '#1A1A2E',
          cursor: step === total - 1 ? 'default' : 'pointer',
          font: "600 13px 'Inter', sans-serif", borderRadius: 6,
          padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 4,
        }}>Next {'\u2192'}</button>
      </div>
    </div>
    </>
  );
}
