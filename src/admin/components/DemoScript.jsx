import { useState, useEffect, useCallback, useRef } from 'react';

const STEPS = [
  // INTRO
  { section: 'Introduction', say: "This is MuseumOS \u2014 a complete platform for running the International Dark Sky Discovery Center. Every role gets their own dashboard, their own tools, and their own experience.", click: null, target: null, see: "Sign In page with Admin roles on left, Portals on right" },
  { section: 'Introduction', say: "Let me sign in as Dr. J, the Executive Director, who sees everything.", click: "Executive Director card", target: null, see: "Full executive dashboard loads" },

  // DASHBOARD
  { section: 'Dashboard', say: "This is the command center. Revenue, members, events, fundraising \u2014 everything at a glance. These numbers are live from the system.", click: null, target: null, see: "KPIs, revenue chart, activity feed, calendar" },
  { section: 'Dashboard', say: "The announcement bar up top controls what visitors see on the website. Let me update it.", click: "Announcement bar text or toggle", target: null, see: "Announcement updates \u2014 point to storefront window to show it changed" },

  // MESSAGES
  { section: 'Messages', say: "No more email chains. Everyone communicates inside the platform. Maria messaged about a field trip, Josi needs to reorder posters.", click: "Messages in sidebar", target: 'a[href="/admin/messages"]', see: "Conversation list with unread badges" },
  { section: 'Messages', say: "I can reply right here. Teachers can even message us from their school portal.", click: "Type a reply and send", target: null, see: "Message appears in chat" },

  // POS
  { section: 'Point of Sale', say: "This is the register. When a customer walks up to the gift shop, this is what Josi sees.", click: "POS in sidebar", target: 'a[href="/admin/pos"]', see: "Split-screen POS with products and cart" },
  { section: 'Point of Sale', say: "Search for a product or scan a barcode \u2014 it adds to cart instantly. Let me ring up a sale.", click: "Type 'star map' in search", target: '.pos-left input[type="text"]', see: "Product added to cart" },
  { section: 'Point of Sale', say: "If they're a member, scan their QR code for an automatic discount. Hit charge and it goes through Square.", click: "Charge button", target: '#tour-pos-checkout', see: "Sale completes, order created" },
  { section: 'Point of Sale', say: "That order just appeared in the system. Let me show you.", click: "Orders in sidebar", target: 'a[href="/admin/orders"]', see: "New order at top of list" },

  // ORDERS
  { section: 'Orders', say: "Every order \u2014 online and in-person \u2014 lands here. Status tracking, customer info, line items. The order we just created is right here.", click: null, target: null, see: "Order list with the POS order at top" },
  { section: 'Orders', say: "Online orders come from the website checkout. Let me show that connection.", click: "Go to storefront /shop, add item, checkout", target: null, see: "New order appears in admin" },

  // INVENTORY
  { section: 'Inventory', say: "Every product across both locations \u2014 the warehouse and the gift shop. Yellow means low stock, red means out.", click: "Inventory in sidebar", target: 'a[href="/admin/inventory"]', see: "Inventory table with status badges" },
  { section: 'Inventory', say: "Velocity tells you how fast it's selling. Days Left tells you when to reorder. No guessing.", click: "Click any product row", target: '.admin-table tbody tr', see: "Product detail with movement history" },

  // PRODUCTS & BARCODES
  { section: 'Products', say: "Here's our full catalog \u2014 67 print-on-demand products from Printify plus 10 physical gift shop items.", click: "Products in sidebar", target: 'a[href="/admin/products"]', see: "Product table with barcode column" },
  { section: 'Products', say: "Physical products get barcodes automatically. Hit Print Barcodes, stick them on products, and the POS scanner reads them.", click: "Print Barcodes button", target: null, see: "Print-ready barcode sheet opens" },

  // PURCHASE ORDERS
  { section: 'Purchase Orders', say: "When you need to reorder from a vendor \u2014 Printify, wholesale suppliers, local artisans \u2014 you create a PO here.", click: "Purchase Orders in sidebar", target: 'a[href="/admin/purchase-orders"]', see: "PO list with status flow" },
  { section: 'Purchase Orders', say: "It tracks from Draft to Ordered to Shipped to Received. When items arrive, inventory updates automatically.", click: "Click a PO to see detail", target: '.admin-table tbody tr', see: "PO detail with status progression" },

  // RECEIVE & TRANSFERS
  { section: 'Receiving', say: "When a shipment arrives, Josi uses Receive to log what came in. Step by step \u2014 pick location, scan products, enter quantities.", click: "Receive in sidebar", target: 'a[href="/admin/receive"]', see: "Step-by-step receiving wizard" },
  { section: 'Transfers', say: "Transfers move stock between the warehouse and gift shop. Create a transfer, mark it shipped, mark it received.", click: "Transfers in sidebar", target: 'a[href="/admin/transfers"]', see: "Transfer list with status tracking" },

  // EVENTS
  { section: 'Events', say: "Create and manage all events \u2014 star parties, planetarium shows, kids programs. Set capacity, pricing, member-free toggle.", click: "Events in sidebar", target: 'a[href="/admin/events"]', see: "Event list with tickets sold" },
  { section: 'Events', say: "When someone reserves a spot on the website, it shows up here with their info. Ticket counts update live.", click: "Go to storefront /events, click Reserve Spot", target: null, see: "Reservation appears in admin" },

  // FIELD TRIPS
  { section: 'Field Trips', say: "Dr. J is the superintendent of Fountain Hills schools. This is critical. Full field trip management \u2014 from booking inquiry to completion.", click: "Field Trips in sidebar", target: 'a[href="/admin/field-trips"]', see: "Field trip table with status workflow" },
  { section: 'Field Trips', say: "Schools can check their trip status through the School Portal. They pick their school from a dropdown, see dates, checklists, and can message Maria directly.", click: "Click View on a trip", target: '.admin-btn-outline', see: "Trip detail drawer with contact, status, notes" },

  // DONATIONS
  { section: 'Donations', say: "Track every donation \u2014 one-time and recurring. The fundraising thermometer on the board meeting view pulls from this.", click: "Donations in sidebar", target: 'a[href="/admin/donations"]', see: "Donation list with totals" },
  { section: 'Donations', say: "The public Donate page on the website feeds directly into this system.", click: "Go to storefront /donate", target: null, see: "Donate form connected to admin" },

  // COMMUNICATIONS
  { section: 'Email', say: "Compose and send email campaigns. Pick your audience \u2014 all members, event attendees, donors. Use templates or write custom.", click: "Email in sidebar", target: 'a[href="/admin/emails"]', see: "Email composer with templates" },
  { section: 'Text Blasts', say: "Same thing for SMS. Clear Sky Alert \u2014 clear skies tonight, observatory is open. One tap, goes to all members.", click: "Text Blasts in sidebar", target: 'a[href="/admin/text-blasts"]', see: "Text composer with phone preview" },
  { section: 'Social Media', say: "Schedule social posts across Instagram, Facebook, X, and LinkedIn. Draft, schedule, publish.", click: "Social Media in sidebar", target: 'a[href="/admin/social-media"]', see: "Social media manager" },

  // DESIGN STUDIO
  { section: 'Design Studio', say: "AI-powered poster and graphic generator. Describe what you want, it creates it. Export as PNG for social or print.", click: "Design Studio in sidebar", target: 'a[href="/admin/design-studio"]', see: "AI image generation interface" },

  // VOLUNTEERS
  { section: 'Volunteers', say: "Full volunteer management. Roster, weekly schedule, hour tracking, and a certification matrix.", click: "Volunteers in sidebar", target: 'a[href="/admin/volunteers"]', see: "4-tab volunteer system" },
  { section: 'Volunteers', say: "The Schedule tab shows who's available each day. Training tracks certifications \u2014 First Aid, CPR, Telescope Ops.", click: "Click Schedule tab, then Training tab", target: null, see: "Weekly calendar, then certification matrix" },
  { section: 'Volunteers', say: "Volunteers clock in through their portal with geo-fencing \u2014 they have to be at the facility. Hours log automatically.", click: null, target: null, see: "Reference volunteer portal" },

  // STAFF & TIME
  { section: 'Staff & Time', say: "Staff roster and time tracking. We track hours \u2014 your payroll provider handles taxes. Export to CSV for payroll processing.", click: "Staff & Time in sidebar", target: 'a[href="/admin/payroll"]', see: "Staff roster, timesheets, export" },

  // REPORTS
  { section: 'Reports', say: "Analytics for everything \u2014 revenue, top products, channel breakdown, inventory health, membership tiers. Each role sees only their relevant data.", click: "Reports in sidebar", target: 'a[href="/admin/reports"]', see: "Full analytics dashboard" },
  { section: 'Reports', say: "Export any report as CSV. Drag it into Excel or QuickBooks.", click: "Click a CSV export button", target: '#tour-reports-export', see: "CSV downloads" },

  // QUICKBOOKS
  { section: 'QuickBooks', say: "Nancy exports sales, products, customers, and bills as CSV files ready for QuickBooks import. Every export is logged.", click: "QuickBooks in sidebar", target: 'a[href="/admin/quickbooks"]', see: "Export cards with sync history" },

  // BOARD MEETING
  { section: 'Board Meeting', say: "One more thing for Dr. J \u2014 the board meeting view. Full-screen, projector-ready. Capital campaign progress, revenue, membership, upcoming events.", click: "Switch to Board role, then click Open Board Meeting View", target: null, see: "Full-screen presentation mode" },

  // ROLE SWITCHING
  { section: 'Role Demo', say: "Now watch what happens when different people sign in. Every role sees a completely different dashboard and different tools.", click: "Role dropdown in top-right", target: '.admin-topbar-avatar', see: "Dashboard changes, sidebar changes" },
  { section: 'Role Demo', say: "Josi only sees what she needs \u2014 POS, orders, inventory, products. No financial reports, no QuickBooks, no events.", click: null, target: null, see: "Josi's simplified dashboard" },
  { section: 'Role Demo', say: "Switch to Nancy the Treasurer \u2014 she sees donations, reports, QuickBooks. No inventory, no POS.", click: "Switch to Treasurer in dropdown", target: '.admin-topbar-avatar', see: "Nancy's finance-focused dashboard" },
  { section: 'Role Demo', say: "Maria the Education Director \u2014 events, field trips, reports. Her whole world is programs.", click: "Switch to Education Director", target: '.admin-topbar-avatar', see: "Maria's education dashboard with field trip stats" },

  // PORTALS
  { section: 'Portals', say: "It's not just for staff. Members, volunteers, and schools each have their own portal.", click: "Go to /signin", target: '.admin-nav-back', see: "Sign in page with Portals section" },
  { section: 'Portals', say: "The Member Portal shows their QR code, membership tier, benefits, upcoming events, and order history.", click: "Click Member Portal", target: null, see: "Member portal with QR code" },
  { section: 'Portals', say: "Schools log in by selecting their school name. They see trip status, preparation checklists, and can message the education coordinator.", click: "Go back, click School Portal", target: null, see: "School portal with trip status" },
  { section: 'Portals', say: "Volunteers see their schedule, log hours, track certifications, and clock in with geo-verification.", click: "Click Volunteer Portal", target: null, see: "Volunteer portal with time clock" },

  // PUBLIC WEBSITE
  { section: 'Website', say: "And of course, the public website. Everything connects. Events from admin show here. Products from the catalog show in the shop. Membership count is live.", click: "Scroll through storefront homepage", target: null, see: "Homepage with video, events, endorsements" },
  { section: 'Website', say: "The shop is a full e-commerce experience \u2014 search, filter, sort, add to cart, checkout. Orders flow into the admin automatically.", click: "Navigate to /shop on storefront", target: null, see: "Shop page with products" },
  { section: 'Website', say: "Event reservations, membership signups, field trip bookings, donations, contact forms \u2014 everything feeds into MuseumOS.", click: null, target: null, see: "Reference various storefront pages" },

  // CLOSING
  { section: 'Summary', say: "That's MuseumOS. One platform. Every department. Every role. Every external stakeholder. The only thing left to connect is Square for payments and QuickBooks API \u2014 everything else is built and working.", click: null, target: null, see: null },
  { section: 'Summary', say: "No more spreadsheets. No more email chains. No more 'I didn't know we were out of stock.' This is how a modern museum runs.", click: null, target: null, see: null },
];

export default function DemoScript() {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState({ x: null, y: null }); // null = default position
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);

  const current = STEPS[step];
  const total = STEPS.length;
  const progress = ((step + 1) / total) * 100;

  const next = useCallback(() => setStep(s => Math.min(s + 1, total - 1)), [total]);
  const prev = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);

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

  useEffect(() => {
    const handle = (e) => {
      // Don't capture if user is typing in an input
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
    // Try multiple times in case page is still rendering
    findEl();
    const t1 = setTimeout(findEl, 200);
    const t2 = setTimeout(findEl, 600);
    const t3 = setTimeout(findEl, 1200);
    // Keep updating position
    const poll = setInterval(findEl, 1000);
    window.addEventListener('scroll', findEl);
    window.addEventListener('resize', findEl);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(poll); window.removeEventListener('scroll', findEl); window.removeEventListener('resize', findEl); };
  }, [step, visible, current]);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed', ...(pos.x !== null ? { left: pos.x, top: pos.y } : { bottom: 140, right: 20 }), zIndex: 9999,
          background: 'rgba(212,175,55,0.15)', color: '#D4AF37',
          border: '1px solid rgba(212,175,55,0.3)', borderRadius: 20,
          padding: '6px 14px', cursor: 'pointer',
          font: "600 11px 'Inter', -apple-system, sans-serif",
          letterSpacing: '0.5px', textTransform: 'uppercase',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; }}
      >
        Demo
      </button>
    );
  }

  // Render click text with gold highlighting
  const renderClick = (text) => {
    if (!text) return null;
    return (
      <div style={{ marginTop: 8 }}>
        <span style={{
          font: "600 10px 'JetBrains Mono', monospace",
          color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px',
        }}>CLICK: </span>
        <span style={{
          font: "600 13px 'Inter', -apple-system, sans-serif",
          color: '#D4AF37',
        }}>{text}</span>
      </div>
    );
  };

  const panelPosition = pos.x !== null
    ? { left: pos.x, top: pos.y }
    : { bottom: 140, right: 20 };

  return (
    <>
    {/* Highlight overlay on target element */}
    {highlightRect && (
      <div style={{
        position: 'fixed',
        top: highlightRect.top - 4, left: highlightRect.left - 4,
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
      width: 380, maxHeight: 280,
      background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(12px)',
      borderRadius: 10, borderTop: '2px solid #D4AF37',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #D4AF37, #E5C76B)',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            font: "600 10px 'JetBrains Mono', monospace",
            color: '#D4AF37', letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>{current.section}</span>
          <span style={{
            font: "400 11px 'JetBrains Mono', monospace",
            color: '#64748B',
          }}>Step {step + 1} of {total}</span>
        </div>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
            fontSize: 14, lineHeight: 1, padding: '2px 4px',
          }}
          title="Hide teleprompter"
        >{'\u2715'}</button>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, padding: '12px 14px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {/* SAY */}
        <div style={{
          font: "italic 15px/1.5 'Inter', -apple-system, sans-serif",
          color: '#F0EDE6',
        }}>
          {'\u201C'}{current.say}{'\u201D'}
        </div>

        {/* CLICK */}
        {current.click && renderClick(current.click)}

        {/* SEE */}
        {current.see && (
          <div style={{ marginTop: 6 }}>
            <span style={{
              font: "600 10px 'JetBrains Mono', monospace",
              color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px',
            }}>SEE: </span>
            <span style={{
              font: "400 12px 'Inter', -apple-system, sans-serif",
              color: '#94A3B8',
            }}>{current.see}</span>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={prev}
          disabled={step === 0}
          style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', color: step === 0 ? '#3a3a5a' : '#94A3B8',
            borderRadius: 6, padding: '5px 12px', cursor: step === 0 ? 'default' : 'pointer',
            font: "500 12px 'Inter', sans-serif",
          }}
        >{'\u2190'} Prev</button>
        <span style={{
          font: "400 10px 'JetBrains Mono', monospace",
          color: '#64748B',
        }}>{'\u2190\u2192'} arrow keys</span>
        <button
          onClick={next}
          disabled={step === total - 1}
          style={{
            background: step === total - 1 ? 'rgba(255,255,255,0.06)' : 'rgba(212,175,55,0.15)',
            border: 'none', color: step === total - 1 ? '#3a3a5a' : '#D4AF37',
            borderRadius: 6, padding: '5px 12px', cursor: step === total - 1 ? 'default' : 'pointer',
            font: "500 12px 'Inter', sans-serif",
          }}
        >Next {'\u2192'}</button>
      </div>
    </div>
    </>
  );
}
