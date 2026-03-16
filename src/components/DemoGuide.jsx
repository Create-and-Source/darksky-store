import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GUIDE = [
  { path: '/signin', say: "This is MuseumOS. Every person on the team logs in and sees exactly what they need. Admin roles on the left, portals on the right.", do: "Click Executive Director." },
  { path: '/admin', say: "This is what Dr. J sees every morning. How much money came in, how many members, what events are coming up, fundraising progress. All here, no digging.", do: "Look around, then click Messages.", exact: true, action: () => { localStorage.setItem('ds_admin_role', 'executive_director'); localStorage.setItem('ds_user_name', 'Dr. J'); localStorage.setItem('ds_user_role', 'manager'); } },
  { path: '/admin/messages', say: "This replaces email for the whole team. Maria sent a message about a field trip. Josi is asking about posters. Teachers can message from the School Portal too.", do: "Click POS in the sidebar." },
  { path: '/admin/pos', say: "This is the cash register. Search for a product or scan a barcode. If they're a member, scan their QR code and the discount kicks in automatically. Hit Charge.", do: "Click Orders in the sidebar." },
  { path: '/admin/orders', say: "Every sale — at the register or on the website — shows up here. Who bought what, when, how much.", do: "Click Inventory." },
  { path: '/admin/inventory', say: "Everything in the gift shop and warehouse. Yellow means running low. Red means out. You can see how fast things sell and when you'll run out.", do: "Click Products." },
  { path: '/admin/products', say: "Every product we sell. Physical items get barcodes — print them on sticker sheets and put them on the products. The scanner reads them at checkout.", do: "Click Purchase Orders." },
  { path: '/admin/purchase-orders', say: "When something is running low, create a purchase order. Pick the vendor, pick the products, say how many. It tracks ordered, shipped, received.", do: "Click Receive." },
  { path: '/admin/receive', say: "When a box shows up, log what's inside step by step. Pick the location, scan each item, type how many. Inventory updates right away.", do: "Click Transfers." },
  { path: '/admin/transfers', say: "This moves products between the warehouse and gift shop. Both locations stay accurate.", do: "Click Events." },
  { path: '/admin/events', say: "Create events — star parties, shows, workshops. Set the date, capacity, price, whether members get in free. When someone reserves on the website, it shows up here.", do: "Click Field Trips." },
  { path: '/admin/field-trips', say: "Every school field trip tracked from first contact to completion. Click View on any trip to see the full picture. Schools check their own status through the School Portal.", do: "Click Contacts under CRM." },
  { path: '/admin/crm', say: "Every person who has ever interacted with the center — members, buyers, donors, volunteers, schools. Pulled in automatically. No typing. This replaces Argenta.", do: "Click Donations." },
  { path: '/admin/donations', say: "Every donation tracked. When someone donates on the website, it shows up here instantly. The board meeting view updates by itself.", do: "Click Email." },
  { path: '/admin/emails', say: "Send email blasts. Pick who gets it — members, event attendees, donors. There are templates so you don't start from scratch.", do: "Click Text Blasts." },
  { path: '/admin/text-blasts', say: "Text messages. Clear skies tonight? Pick the template, pick the audience, send. They all get a text.", do: "Click Social Media." },
  { path: '/admin/social-media', say: "Write a post once, publish to Instagram, Facebook, X, and LinkedIn at the same time.", do: "Click Design Studio." },
  { path: '/admin/design-studio', say: "Need a flyer? Type what you want and AI makes it. Save it and post it.", do: "Click Volunteers." },
  { path: '/admin/volunteers', say: "Every volunteer — their schedule, hours, certifications. They clock in on their phone with GPS. Click through the tabs: Roster, Schedule, Hours, Training.", do: "Click Staff & Time." },
  { path: '/admin/payroll', say: "Paid staff hours and timesheets. Export to CSV for your payroll company. We track time, they handle taxes.", do: "Click Reports." },
  { path: '/admin/reports', say: "How the business is doing. Each person only sees the reports that matter to them. Export anything as a spreadsheet.", do: "Click QuickBooks." },
  { path: '/admin/quickbooks', say: "Nancy's favorite. One click downloads everything she needs for QuickBooks. No more typing receipts by hand.", do: "Now switch roles — click the name in the top right, switch to Gift Shop Manager." },
  { path: '/admin', say: "See how everything changed? Josi only sees gift shop stuff. No financials, no events. Now switch to Treasurer.", do: "Switch to Treasurer in the dropdown.", roleCheck: 'shop_manager' },
  { path: '/admin', say: "Nancy sees donations, reports, QuickBooks. No gift shop. Now switch to Education Director.", do: "Switch to Education Director.", roleCheck: 'treasurer' },
  { path: '/admin', say: "Maria sees field trips, events, volunteers. Her whole world is programs. Now let's see the Board Meeting view.", do: "Switch to Board Member, then click Open Board Meeting View.", roleCheck: 'education_director' },
  { path: '/admin/board-meeting', say: "This goes on the projector. Fundraising progress, revenue, membership, events. Big and clean for the boardroom.", do: "Click Exit, then go to the Sign In page." },
  { path: '/signin', say: "Now the portals. Members, volunteers, and schools each get their own view. Click Member Portal.", do: "Click Member Portal on the right.", secondVisit: true },
  { path: '/member-portal', say: "This is what a member sees. Their QR code for the gift shop discount. They can reserve event tickets and donate right here without leaving.", do: "Go back to Sign In. Click School Portal." },
  { path: '/school-portal', say: "Teachers pick their school, see their trip status, a checklist of what to bring, and can message Maria directly. No email needed.", do: "Go back to Sign In. Click Volunteer Portal." },
  { path: '/volunteer-portal', say: "Volunteers clock in with GPS — they have to be at the building. They see their schedule, log hours, and track training.", do: "Now switch to the website — go to the homepage." },
  { path: '/', say: "The public website. Everything connects. Events, products, membership — it all feeds into the admin. People can shop, reserve tickets, donate, book field trips.", do: "Scroll through the page. That's the full tour.", isStorefront: true },
];

export default function DemoGuide() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(() => localStorage.getItem('ds_demo_guide') === 'true');
  const [stepOverride, setStepOverride] = useState(null);

  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setActive(prev => {
          const next = !prev;
          localStorage.setItem('ds_demo_guide', String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  if (!active) return null;

  const role = localStorage.getItem('ds_admin_role') || '';

  // Find current step
  let currentIdx = stepOverride;
  if (currentIdx === null) {
    currentIdx = GUIDE.findIndex((g, i) => {
      if (g.exact && location.pathname !== g.path) return false;
      if (!g.exact && !location.pathname.startsWith(g.path)) return false;
      if (location.pathname !== g.path && g.path !== '/admin') return false;
      if (g.path === '/admin' && location.pathname !== '/admin') return false;
      if (g.roleCheck && role !== g.roleCheck) return false;
      if (g.secondVisit && i < 20) return false; // portal visits are later in the tour
      return true;
    });
  }

  // Fallback: find by path match only
  if (currentIdx === -1) {
    currentIdx = GUIDE.findIndex(g => {
      if (g.exact) return location.pathname === g.path;
      return location.pathname === g.path;
    });
  }

  const step = GUIDE[currentIdx] || null;
  if (!step) return null;

  const goNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= GUIDE.length) return;
    const next = GUIDE[nextIdx];
    if (next.action) next.action();
    if (next.path !== location.pathname) navigate(next.path);
    setStepOverride(nextIdx);
  };

  const goPrev = () => {
    if (currentIdx <= 0) return;
    const prevIdx = currentIdx - 1;
    const prev = GUIDE[prevIdx];
    if (prev.action) prev.action();
    if (prev.path !== location.pathname) navigate(prev.path);
    setStepOverride(prevIdx);
  };

  // Reset override when location changes manually
  useEffect(() => { setStepOverride(null); }, [location.pathname]);

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div style={{
      position: 'fixed',
      top: isAdmin ? 70 : 80,
      right: isAdmin ? 16 : 16,
      zIndex: 9999,
      width: 300,
      background: 'rgba(26,26,46,0.95)',
      backdropFilter: 'blur(12px)',
      borderRadius: 12,
      borderLeft: '3px solid #D4AF37',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ font: "600 10px 'JetBrains Mono', monospace", letterSpacing: 1, textTransform: 'uppercase', color: '#D4AF37' }}>
          Say This
        </span>
        <span style={{ font: "400 10px 'JetBrains Mono', monospace", color: '#64748B' }}>
          {currentIdx + 1}/{GUIDE.length}
        </span>
      </div>

      {/* Say text */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{ font: "400 14px/1.55 'Inter'", color: '#F0EDE6', margin: 0 }}>
          {step.say}
        </p>
      </div>

      {/* Do this */}
      {step.do && (
        <div style={{ padding: '0 14px 12px' }}>
          <div style={{
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 8, padding: '10px 12px',
          }}>
            <div style={{ font: "600 9px 'JetBrains Mono', monospace", letterSpacing: 1, textTransform: 'uppercase', color: '#D4AF37', marginBottom: 4 }}>Then Do</div>
            <div style={{ font: "500 13px 'Inter'", color: '#D4AF37' }}>{step.do}</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 14px 10px',
        borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)',
      }}>
        <button onClick={goPrev} disabled={currentIdx <= 0} style={{
          font: "500 12px 'Inter'", color: currentIdx <= 0 ? '#3a3a5a' : '#94A3B8',
          background: 'none', border: 'none', cursor: currentIdx <= 0 ? 'default' : 'pointer', padding: '6px 0',
        }}>{'\u2190'} Back</button>
        <div style={{ flex: 1 }} />
        <button onClick={goNext} disabled={currentIdx >= GUIDE.length - 1} style={{
          font: "600 12px 'Inter'", background: '#D4AF37', color: '#1A1A2E',
          border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
        }}>Next {'\u2192'}</button>
      </div>
    </div>
  );
}
