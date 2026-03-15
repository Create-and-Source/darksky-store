# Dark Sky Discovery Center — Gift Shop & Admin

> International Dark Sky Discovery Center (IDSDC) in Fountain Hills, AZ.
> Phase One opened Fall 2025; full facility opening mid-2026. This is a demo storefront + admin system for the gift shop.

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
│   ├── CartDrawer.jsx          # Slide-in cart drawer (wired in App.jsx, opens on cart icon click)
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

### Storefront Cart (managed by `App.jsx`)

| Key | Type | Description |
|-----|------|-------------|
| `ds_store_cart` | Array | Customer shopping cart — persists across page reloads, cleared on checkout |

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

### Cart → Checkout → Orders Flow

```
Customer clicks "Add to Cart" (Shop, ProductDetail, Home)
    ↓
addToCart() in App.jsx → updates useState + syncs to ds_store_cart in localStorage
    ↓
Cart icon in Nav opens CartDrawer slide-out (shows items, qty, totals)
    ↓
"Proceed to Checkout" → navigates to /checkout with cart data
    ↓
/checkout — Checkout.jsx form validates
    ↓
addOrder(orderData) from store.js — flattens nested customer/shipping objects to strings
    ↓
clearCart() removes ds_store_cart from localStorage
    ↓
Order appears in /admin/orders
    ↓
adjustStock() decreases gift shop inventory
    ↓
addMovement() creates audit trail
```

### Event Reservation Flow

```
Customer clicks "Reserve Spot" on event card (Events.jsx)
    ↓
Modal: name, email, ticket qty
    ↓
addReservation({ eventId, eventTitle, name, email, qty }) from store.js
    ↓
Reservation saved to ds_ticket_reservations
    ↓
updateEvent() increments ticketsSold → spots remaining bar updates
    ↓
Reservation visible in /admin/events (EventsAdmin.jsx)
```

### Edit Mode Flow

```
Admin toggle ON → ds_user_role = 'manager'
    ↓
EditToggleButton appears (pencil icon, bottom-left)
    ↓
Click pencil → EditBanner shows at top, body gets 'edit-mode-active' class
    ↓
DOM-based editing: [data-editable] elements get gold dashed hover borders
    ↓
Click any [data-editable] element → contentEditable=true, solid gold border
    ↓
Type new text → click away (blur) → innerHTML saved to ds_site_edits, "Saved" toast
    ↓
Section controls: [data-section] elements get hover overlay with visibility toggle
    ↓
Publish → ds_site_edits merged into ds_site_published, revision saved, exits edit mode
    ↓
Discard → ds_site_edits cleared, page reloads
    ↓
On every page load: MutationObserver applies published text from ds_site_published
    to matching [data-editable] elements
```

#### How it works (EditModeDOM component)

1. `edit-mode-active` class toggled on `document.body` when editing
2. CSS in EditMode.jsx styles `[data-editable]` elements: dashed gold outline on hover, solid gold on editing
3. Capture-phase click handler on document finds `[data-editable]` elements, sets `contentEditable=true`
4. Blur handler saves `innerHTML` to draft changes via `setText()`, shows "Saved" toast
5. MutationObserver applies published text from `ds_site_published` to matching elements on page load/navigation
6. `[data-section]` elements get injected control bars for visibility toggling
7. All pages have `data-page` attribute on root div for section scoping

#### Editable elements (data-editable keys)

| Page | Key Pattern | Elements |
|------|-------------|----------|
| Home | home-hero-label, home-hero-title, home-hero-subtitle | Hero text |
| Home | home-discover-label, home-discover-title | Discover section |
| Home | home-collection-label, home-collection-title | Products section |
| Home | home-events-label, home-events-title | Events section |
| Home | home-shop-label, home-shop-title | Categories section |
| Home | home-membership-label, home-membership-title, home-membership-subtitle | Membership section |
| Home | home-mission-quote, home-mission-attr | Mission quote band |
| Home | home-stat-value-{i}, home-stat-label-{i} | Stats (4 each) |
| Home | home-event-cat-{i}, home-event-title-{i}, home-event-desc-{i}, home-event-meta-{i} | Event cards (3 each) |
| Home | home-vid1-title, home-vid1-subtitle, home-vid2-*, home-vid3-* | Video divider text |
| About | about-hero-label, about-hero-title, about-hero-subtitle | Hero |
| About | about-story-label, about-story-title, about-story-p1, about-story-p2, about-story-quote | Our Story |
| About | about-offering-title-{i}, about-offering-desc-{i} | Offering cards (4 each) |
| About | about-stat-number-{i}, about-stat-label-{i} | Stats (4 each) |
| About | about-vid-title, about-vid-subtitle | Video divider text |
| About | about-cta-quote, about-cta-attr | CTA section |
| Events | events-hero-label, events-hero-title, events-hero-subtitle | Hero |
| Events | events-cta-quote, events-cta-attr | CTA section |
| Membership | mem-hero-label, mem-hero-title, mem-hero-subtitle | Hero |
| Membership | mem-tier-name-{i}, mem-tier-price-{i}, mem-tier-period-{i}, mem-tier-desc-{i} | Tier cards (3 each) |
| Membership | mem-perks-label, mem-perks-title | Perks section |
| Membership | mem-perk-title-{i}, mem-perk-desc-{i} | Perk cards (4 each) |
| Membership | mem-faq-label, mem-faq-title | FAQ section |
| Membership | mem-cta-label, mem-cta-quote, mem-cta-attr | CTA section |
| Shop | shop-hero-label, shop-hero-title, shop-hero-subtitle | Hero |
| Shop | shop-trust-label-{i}, shop-trust-sub-{i} | Trust items (4 each) |
| Education | edu-hero-label, edu-hero-title, edu-hero-subtitle | Hero |
| Education | edu-prog-label-{i}, edu-prog-title-{i}, edu-prog-desc-{i} | Programs (4 each) |
| Education | edu-stat-number-{i}, edu-stat-label-{i} | Stats (4 each) |
| Education | edu-vid-title, edu-vid-subtitle | Video divider text |
| Education | edu-cta-quote, edu-cta-attr | CTA section |
| FieldTrips | ft-hero-label, ft-hero-title, ft-hero-subtitle | Hero |
| FieldTrips | ft-includes-label, ft-includes-title | What's Included |
| FieldTrips | ft-programs-label, ft-programs-title, ft-programs-subtitle | Programs |
| FieldTrips | ft-testimonials-label, ft-testimonials-title | Testimonials |
| FieldTrips | ft-booking-label, ft-booking-title | Booking form |
| FieldTrips | ft-faq-label, ft-faq-title | FAQ |
| FieldTrips | ft-cta-label, ft-cta-quote | CTA section |
| Contact | contact-hero-label, contact-hero-title, contact-hero-subtitle | Hero |
| Contact | contact-form-label, contact-form-title | Form section |
| Contact | contact-info-label | Info sidebar |

#### Video divider editability

VideoDivider components (Home, About, Education) accept `titleEditable` and `subtitleEditable` props that add `data-editable` to the title/subtitle elements. The `.vid-divider-video` and `.vid-divider-clip` elements have `pointer-events: none` so clicks pass through to the text overlay.

### Admin Roles

| Role | Access |
|------|--------|
| Manager | All admin pages, edit mode pencil on store |
| Staff | Dashboard, Inventory, Receive, Transfers, Orders (read-only) |
| Volunteer | Dashboard, Inventory (read-only), Orders (read-only) |

### Admin Toggle (Nav)

The nav bar has a small toggle switch (right side). Toggle ON sets `ds_user_role` to `manager`, shows ADMIN badge, pencil icon, and "Dashboard →" link. Toggle OFF returns to customer view. Visiting `/admin` directly auto-sets the manager role.

## Images

Located in `public/images/darksky/` (20 images from the Create-and-Source/darksky repo):

| File | Used In | Description |
|------|---------|-------------|
| `andromeda.jpg` | Home events, About CTA, Membership hero | Andromeda galaxy |
| `milky-way.jpg` | Home events/membership, About offerings, Education programs, Membership CTA | Milky Way |
| `nebula.jpg` | Home products, About offerings, Education programs, Events cards | Nebula |
| `observatory-hero.jpg` | About hero/offerings, Education programs | Observatory dome |
| `meteor-shower.jpg` | Events hero, Education hero | Meteor shower |
| `comet-neowise.jpg` | Home events/mission, Events cards | Comet NEOWISE |
| `desert-night-sky.png` | Shop hero, Education programs | Desert landscape |
| `first-light-nebula.jpg` | About story, Education CTA | Nebula |
| `bubble-nebula.jpg` | Events cards | Bubble nebula |
| `crescent-nebula.jpg` | Events cards | Crescent nebula |
| `saturn.jpg` | About offerings | Saturn |
| `planet-hero.png` | Home hero | Planet |
| `logo-white.png` | — | White logo |
| `kit-fox.jpg`, `scorpion-uv.jpg`, `owl.jpg`, `ringtail.jpg`, `bats.jpg` | — | Wildlife |
| `planet-gas-giant.png`, `planet-mars.png` | — | Planets |

Image layering pattern: `position: absolute`, low opacity (0.06–0.15), dark overlay `rgba(4,4,12,0.4–0.5)`, `objectFit: 'cover'`, `loading="lazy"`.

## Videos

Located in `public/videos/`:

| File | Size | Used In | Description |
|------|------|---------|-------------|
| `desert-night-sky.mp4` | 22MB | Home hero background | Full-screen behind hero text |
| `hero-space.mp4` | 22MB | Unused | Earlier hero video alternative |
| `hero1-4.mp4` | ~5MB each | Unused | Earlier hero video alternatives |

### Supabase Videos (streamed from `https://ssdozdtdcrkaoayzhrsa.supabase.co/storage/v1/object/public/videos/`)

| File | Used In | Description |
|------|---------|-------------|
| `owl.mp4` | Home divider | "Where the Wild Things Wake" |
| `scorpion-uv.mp4` | Home divider | "See What Others Can't" |
| `milky-way.mp4` | Home divider | "The Universe in Motion" |
| `observatory-hero.mp4` | About divider | "22,000 Square Feet of Wonder" |
| `education-hero.mp4` | Education divider | "Learning Under the Stars" |
| Other available: `andromeda.mp4`, `bubble-nebula.mp4`, `comet-neowise.mp4`, `crescent-nebula.mp4`, `desert-night-sky.mp4`, `first-light-nebula.mp4`, `meteor-shower.mp4`, `nebula.mp4`, `saturn.mp4`, `kit-fox.mp4`, `bats.mp4`, `ringtail.mp4`, `education-fieldtrip.mp4`, `education-workshop.mp4`, `education-outreach.mp4` | — | Available in Supabase |

All videos: autoplay, muted, loop, playsInline. Lazy loaded via IntersectionObserver (LazyVideo component). Dividers have parallax scroll effect (VideoDivider component).

## What's Real vs Mock

### Real / Connected
- Product catalog from Printify (67 products with real images and prices)
- Cart persists in localStorage (`ds_store_cart`) — survives page reload
- CartDrawer slide-out opens on cart icon click (Nav), shows items/totals
- Checkout → admin orders flow (connected via store.js)
- Cart clears from localStorage after successful checkout
- Events admin → public events page (connected via ds_events)
- Event reservations: store Events page "Reserve Spot" → addReservation() → ds_ticket_reservations → admin EventsAdmin
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
- Help chatbot (keyword-matching from helpKnowledge.js, no AI API — instant responses with synonym expansion, role-aware suggestions, "Related:" follow-up links)
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

- **Address**: 13001 N La Montana Drive, Fountain Hills, AZ 85268
- **Hours**: Wed — Sun, 6pm — 11pm
- **Email**: info@darkskycenter.org
- **Phone**: (contact via website)
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
