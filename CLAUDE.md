# Dark Sky Discovery Center — Gift Shop & Admin

> International Dark Sky Discovery Center (IDSDC) in Fountain Hills, AZ.
> Opening Fall 2026. This is a demo storefront + admin system for the gift shop.

## Tech Stack

- **Framework**: React 18 + React Router DOM 7.13.1 + Vite 5.0.0
- **Hosting**: Vercel (SPA routing via `vercel.json` rewrites)
- **Styling**: CSS-in-JS (`styles.js` → injected `<style>` tag) + inline styles + component `<style>` blocks
- **State**: React hooks (useState, useContext, useCallback, useMemo) + localStorage
- **Persistence**: All data in localStorage — no backend, no database, no API
- **PWA**: Service worker (`public/sw.js`), install prompt, offline banner
- **Build**: `npm run build` → Vite production build → `dist/`

### Commands

```bash
npm run dev      # Dev server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── main.jsx                    # Entry point (BrowserRouter, SW registration)
├── App.jsx                     # Root component, routes, cart state, EditMode, initStore()
├── styles.js                   # GLOBAL_CSS string (all design tokens, animations, layouts)
├── data/
│   └── products.js             # 67 products from Printify (static seed data)
├── components/
│   ├── Nav.jsx                 # Navigation bar with admin toggle
│   ├── Footer.jsx              # Footer with newsletter, links, contact info
│   ├── Stars.jsx               # Canvas starfield with parallax + shooting stars
│   ├── StarfieldBackground.jsx # Alternate starfield (unused?)
│   ├── ProductCard.jsx         # Product card with reveal animation + Quick Add
│   ├── EditMode.jsx            # Full CMS: editable text/images, sections, publish/revisions
│   ├── CartDrawer.jsx          # Slide-in cart drawer (not currently wired in App.jsx)
│   ├── InstallPrompt.jsx       # PWA install banner
│   ├── OfflineBanner.jsx       # Offline status indicator
│   └── NotificationBell.jsx    # Admin notification dropdown (low stock, PO arrivals)
├── pages/
│   ├── Home.jsx                # Homepage with video backgrounds, products, events
│   ├── About.jsx               # About the center (offerings, stats, story)
│   ├── Events.jsx              # Public events (reads from ds_events localStorage)
│   ├── Education.jsx           # Education programs
│   ├── Shop.jsx                # Product catalog with filters, sort, search
│   ├── ProductDetail.jsx       # Single product page with gallery
│   ├── Cart.jsx                # Shopping cart
│   ├── Checkout.jsx            # Checkout form → addOrder() → admin orders
│   ├── OrderConfirmation.jsx   # Post-checkout confirmation
│   ├── Membership.jsx          # Membership tiers (reads member count from ds_members)
│   ├── Contact.jsx             # Contact form
│   └── FieldTrips.jsx          # Field trip programs + booking form
└── admin/
    ├── AdminLayout.jsx         # Admin shell: sidebar, roles, toast, keyboard shortcuts
    ├── AdminStyles.js          # Admin CSS (light theme, Inter font)
    ├── AdminTour.jsx           # Onboarding tour (role-based, 7 manager / 5 staff steps)
    ├── data/
    │   ├── store.js            # Central localStorage data store (CRUD for everything)
    │   ├── mockData.js         # Seed data (36 inventory items, 11 orders, 5 POs, 3 transfers)
    │   └── helpKnowledge.js    # Help system knowledge base (features, FAQs, suggestions)
    ├── components/
    │   ├── HelpBubble.jsx      # Tooltip help icon
    │   ├── HelpChatbot.jsx     # Floating chat assistant (draggable, context-aware)
    │   ├── UndoSystem.jsx      # Global undo/redo + trash (max 50 history)
    │   └── Wizard.jsx          # Multi-step form wizard
    └── pages/
        ├── Dashboard.jsx       # KPIs, sparklines, donut charts, quick actions, alerts
        ├── Inventory.jsx       # Inventory table with filters, stock adjust, CSV export
        ├── Receive.jsx         # Multi-step stock receiving wizard
        ├── Transfers.jsx       # Warehouse ↔ Gift Shop transfers
        ├── PurchaseOrders.jsx  # PO creation wizard, vendor management, reorder suggestions
        ├── Orders.jsx          # Order management (online + POS), status tracking
        ├── EventsAdmin.jsx     # Event CRUD, ticket tracking, check-in
        ├── Emails.jsx          # Email composer with templates, audience targeting
        ├── Content.jsx         # Page content editor, announcement bar
        ├── Reports.jsx         # Sales, inventory, membership, event analytics + CSV export
        └── QuickBooks.jsx      # QB export (CSV), sync log, auto-export settings
```

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Homepage with hero video, products, events, categories |
| `/about` | About | About the center |
| `/events` | Events | Public events (from `ds_events`, Published only) |
| `/education` | Education | Education programs |
| `/shop` | Shop | Product catalog (from `ds_products`) |
| `/product/:id` | ProductDetail | Single product page |
| `/cart` | Cart | Shopping cart |
| `/checkout` | Checkout | Order form → creates admin order |
| `/order-confirmation` | OrderConfirmation | Post-checkout success page |
| `/membership` | Membership | Membership tiers (member count from `ds_members`) |
| `/contact` | Contact | Contact form |
| `/field-trips` | FieldTrips | Field trip booking |
| `/admin` | Dashboard | Admin dashboard (lazy loaded) |
| `/admin/inventory` | Inventory | Stock management |
| `/admin/receive` | Receive | Receive shipments |
| `/admin/transfers` | Transfers | Warehouse ↔ Gift Shop |
| `/admin/purchase-orders` | PurchaseOrders | Purchase order management |
| `/admin/orders` | Orders | Order management |
| `/admin/events` | EventsAdmin | Event management |
| `/admin/emails` | Emails | Email campaigns |
| `/admin/content` | Content | CMS page editing |
| `/admin/reports` | Reports | Analytics & reports |
| `/admin/quickbooks` | QuickBooks | Accounting export |
| `*` | 404 | "Lost in Space" page |

## localStorage Keys

### Store Data (managed by `store.js`)

| Key | Type | Seeded By | Description |
|-----|------|-----------|-------------|
| `ds_inventory` | Array | mockData.js (36 items) | Product inventory with warehouse/giftshop quantities |
| `ds_orders` | Array | mockData.js (11 orders) | Customer orders (online + POS) |
| `ds_purchase_orders` | Array | mockData.js (5 POs) | Purchase orders to vendors |
| `ds_transfers` | Array | mockData.js (3 transfers) | Inter-location stock transfers |
| `ds_events` | Array | store.js (6 events) | Events with dates, capacity, tickets, status |
| `ds_emails` | Array | Empty [] | Sent email campaigns |
| `ds_content` | Object | store.js defaults | CMS page content overrides |
| `ds_cart` | Array | Empty [] | Admin POS cart (separate from storefront cart) |
| `ds_members` | Array | store.js (5 members) | Membership records |
| `ds_inquiries` | Array | Empty [] | Contact form submissions |
| `ds_contacts` | Array | Empty [] | Subscriber contacts |
| `ds_announcement` | Object | store.js default | Announcement bar text + active flag |
| `ds_ticket_reservations` | Array | Empty [] | Event ticket reservations |
| `ds_movement_history` | Object | store.js (2 products) | Stock movement audit log per product |
| `ds_products` | Array | products.js (67 products) | Storefront product catalog |

### Auth & UI State

| Key | Type | Description |
|-----|------|-------------|
| `ds_user_name` | String | Current user display name (e.g. "Nancy") |
| `ds_user_role` | String | Current role: "manager", "staff", or "volunteer" |
| `ds_admin_role` | String | Admin role (mirrors ds_user_role) |
| `darksky_admin_onboarded` | Boolean | Whether admin tour has been completed |
| `ds_help_chat_seen` | Boolean | Whether help chat has been opened |
| `ds_pwa_dismissed` | Boolean | Whether PWA install prompt was dismissed |
| `ds_notif_read` | Object | Notification IDs marked as read |
| `ds_last_order` | Object | Last checkout order (for confirmation page) |
| `darksky_qb_sync_log` | Array | QuickBooks export history (max 50) |

### Edit Mode (CMS)

| Key | Type | Description |
|-----|------|-------------|
| `ds_site_edits` | Object | Draft content changes (texts, images, section order/visibility) |
| `ds_site_published` | Object | Published content changes |
| `ds_site_revisions` | Array | Revision history (max 10) |

### Undo System

| Key | Type | Description |
|-----|------|-------------|
| `ds_undo_stack` | Array | Undo history (max 50 actions) |
| `ds_trash` | Array | Soft-deleted items |

## Design System

### Store Theme (Dark)

```
Background:     #04040c (--bg)
Surface:        #0a0a1a (--surface), #0f0f1e (--surface2)
Border:         #16162a (--border)
Gold:           #D4AF37 (--gold)
Gold hover:     #E5C76B (--gold-hover)
Gold dim:       #a08520 (--gold-dim)
Gold glow:      rgba(212,175,55,0.25)
Text:           #F0EDE6 (--text)
Text secondary: #908D9A (--text2)
Muted:          #5C5870 (--muted)
Success:        #4ADE80
Warning:        #FBBF24
Border radius:  3px (--r)
Ease:           cubic-bezier(.16,1,.3,1) (--ease)
```

### Admin Theme (Light)

```
Background:     #FAFAF8
Sidebar:        #1A1A2E (dark)
Gold accent:    #C5A55A
Text:           #1A1A2E
Font:           Inter (body), JetBrains Mono (monospace)
```

### Fonts (Google Fonts)

| Font | Usage |
|------|-------|
| Playfair Display | Headlines, product titles, section titles |
| Plus Jakarta Sans | Body text, descriptions |
| JetBrains Mono | Labels, categories, metadata, code-like elements |
| DM Sans | UI text, buttons, form labels |
| Inter | Admin interface body text |

### Key CSS Classes

- `.btn-primary` — Gold gradient button, pill shape
- `.btn-ghost` — Transparent with gold border
- `.label` — JetBrains Mono 10px uppercase, gold
- `.section` — Content section (120px 64px padding)
- `.grid` / `.grid-4` — Product grid layouts
- `.pc` — Product card (glass morphism)
- `.reveal` / `.vis` — Scroll-triggered fade-in animation
- `.nav` / `.nav.scrolled` — Navigation with glassmorphism on scroll
- `.hero` — Full viewport height hero section
- `.event-card` — Event card with date badge
- `.mem-tier` / `.mem-tier.featured` — Membership tier cards
- `.sp-*` — Shop page classes (sp-hero, sp-grid, sp-card, sp-bar, etc.)
- `.vid-divider` — Video divider section with parallax

### Animations

- `breatheGlow` — Pulsing gold box-shadow on CTAs
- `goldShimmer` — Background position shift for gradients
- `marquee` — Horizontal scroll for marquee section
- `almostFullPulse` — Event spots "almost full" indicator
- `reveal` delays — Staggered fade-in (100ms-800ms)

## Data Flow

### Store → Admin Connection

```
initStore() called in App.jsx (module level)
    ↓
Seeds localStorage with mock data if keys don't exist
    ↓
Store pages read from localStorage via getProducts(), getEvents(), getMembers()
Admin pages read/write via same store.js functions
    ↓
Changes in admin immediately visible on store pages (same localStorage)
```

### Checkout → Orders Flow

```
Customer adds to cart (App.jsx useState)
    ↓
/checkout — Checkout.jsx form validates
    ↓
addOrder(orderData) from store.js
    ↓
Order appears in /admin/orders
    ↓
adjustStock() decreases gift shop inventory
    ↓
addMovement() creates audit trail
```

### Edit Mode Flow

```
Admin toggle ON → ds_user_role = 'manager'
    ↓
EditToggleButton appears (pencil icon, bottom-left)
    ↓
Click pencil → EditBanner shows at top
    ↓
EditableText/EditableImage become contentEditable
    ↓
Changes saved to ds_site_edits (draft)
    ↓
Publish → merged into ds_site_published
    ↓
Revision saved to ds_site_revisions (max 10)
```

### Admin Roles

| Role | Access |
|------|--------|
| Manager | All admin pages, edit mode pencil on store |
| Staff | Dashboard, Inventory, Receive, Transfers, Orders (read-only) |
| Volunteer | Dashboard, Inventory (read-only), Orders (read-only) |

### Admin Toggle (Nav)

The nav bar has a small toggle switch (right side). Toggle ON sets `ds_user_role` to `manager`, shows ADMIN badge, pencil icon, and "Dashboard →" link. Toggle OFF returns to customer view. Visiting `/admin` directly auto-sets the manager role.

## Videos

Located in `public/videos/`:

| File | Size | Used In | Description |
|------|------|---------|-------------|
| `desert-night-sky.mp4` | 22MB | Home hero background | Full-screen behind hero text |
| `owl.mp4` | 5.3MB | Home divider (Products → Events) | "Where the Wild Things Wake" |
| `scorpion-uv.mp4` | 5.9MB | Home divider (Events → Mission) | "See What Others Can't" |
| `hero1-4.mp4` | ~5MB each | Unused | Earlier hero video alternatives |

All videos: autoplay, muted, loop, playsInline. Lazy loaded via IntersectionObserver. Dividers have parallax scroll effect.

## What's Real vs Mock

### Real / Connected
- Product catalog from Printify (67 products with real images and prices)
- Checkout → admin orders flow (connected via store.js)
- Events admin → public events page (connected via ds_events)
- Shop → products from localStorage (connected via ds_products)
- Membership page reads member count from localStorage
- Inventory adjustments on order placement
- CSV exports in Reports and QuickBooks pages

### Mock / Placeholder
- Payment processing (Square placeholder — "coming soon")
- Email sending (Emails page stores locally, doesn't actually send)
- QuickBooks connection (CSV export only, no live API)
- Contact form (no backend to receive submissions)
- Field trip booking form (no backend)
- Newsletter signup in footer (no backend)
- PWA service worker (minimal caching)
- Help chatbot (pattern-matching, not LLM-powered)
- Authentication (localStorage flags, no real auth)

### Hardcoded Data (not from localStorage)

| File | Data |
|------|------|
| Home.jsx | MARQUEE_ITEMS, EVENTS (3), STATS (4), CATEGORIES (5) |
| About.jsx | OFFERINGS (4), STATS (4) |
| Education.jsx | PROGRAMS (4), STATS (4) |
| FieldTrips.jsx | PROGRAMS (3 tiers), TESTIMONIALS (3), FAQS (6) |
| Contact.jsx | SUBJECTS (6), contact details |
| Membership.jsx | TIERS (3), PERKS (4), FAQ (4) |
| mockData.js | INVENTORY (36), ORDERS (11), POs (5), TRANSFERS (3), VENDORS (3) |
| store.js | DEFAULT_EVENTS (6), DEFAULT_MEMBERS (5), DEFAULT_CONTENT, DEFAULT_MOVEMENTS |

## Key Contact Info (Hardcoded)

- **Address**: 16845 E Palisades Blvd, Fountain Hills, AZ 85268
- **Hours**: Wed — Sun, 6pm — 11pm
- **Email**: hello@idsdc.org / info@darkskycenter.org / education@idarksky.org
- **Phone**: (928) 555-0142
- **Website**: darkskycenter.org
- **Coordinates**: 33.6°N · 111.7°W
- **Tax Rate**: 8.6%
- **Free Shipping**: Orders $50+
- **Organization**: 501(c)(3) non-profit

## Responsive Breakpoints

- `1200px` — Grid columns reduce (4→3)
- `1024px` — Checkout stacks, admin content adjusts
- `860px` — Nav hamburger appears
- `768px` — 2-column grids, mobile admin sidebar, shop grid 2-col, compact dashboard
- `560px` — Single column forms
- `480px` — Smallest mobile adjustments

### Mobile Dashboard Optimizations (768px and below)

- **Topbar**: 44px height (compact)
- **Content padding**: 12px sides at all breakpoints
- **Greeting**: 24px heading, date on same line (right-aligned), "Last login" hidden
- **Attention cards**: compact single-row layout — no icon circles (16px inline icon), 10px padding, title + description truncated on one line each, small right-aligned button, top border instead of left border
- **Quick Actions**: 72px height buttons (reduced from 100px)
- **Floating buttons** (help ? and chat): 44px size (down from 52-56px), positioned at bottom: 80px (above Safari chrome), stacked vertically with 8px gap, chat label hidden
- **Goal**: All "Needs Attention" items + Quick Actions visible above the fold on iPhone

## Performance Features

- Admin pages lazy loaded via `React.lazy()` + `Suspense`
- Videos lazy loaded via IntersectionObserver (200px rootMargin)
- Product images use `loading="lazy"`
- Canvas starfield pauses when tab hidden
- Custom cursor disabled on touch devices
- Code split: main bundle ~486KB gzipped ~130KB
