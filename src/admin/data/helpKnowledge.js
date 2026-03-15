// ⚠️ UPDATE THIS FILE whenever you add or change a feature.
// The help chatbot and all ? tooltips pull from this file.
// Last updated: 2026-03-14

// ═══════════════════════════════════════════════════
// DARK SKY ADMIN — SINGLE SOURCE OF TRUTH FOR HELP
// ═══════════════════════════════════════════════════
// This file powers:
//   1. The help chatbot (Dark Sky Assistant)
//   2. All HelpBubble ? tooltips across the admin
//   3. Context-aware page help
// When adding a new feature or page, add it here and
// everything updates automatically.

// ── FEATURE DEFINITIONS ──
// Each feature: name, route, description, howTo steps, tips, tooltips (for HelpBubble)
export const FEATURES = {
  dashboard: {
    name: 'Dashboard',
    route: '/admin',
    description: 'Your daily overview showing what needs attention, quick actions, today\'s stats, and recent activity.',
    howTo: [
      'The Dashboard loads automatically when you open Admin.',
      'Attention cards at the top show orders to review, incoming shipments, low stock, and event ticket status.',
      'Quick Actions let you jump to Receive, Events, Email, or Reports in one click.',
      'Today\'s Snapshot shows orders, members, events this week, and low stock count.',
      'Recent Activity shows the latest orders and transfers.',
      'Smart Transfers suggests moving stock from warehouse to gift shop when items are running low.',
      'Predictive Alerts warn you when items are projected to run out soon based on sales velocity.',
    ],
    tips: [
      'Check the Dashboard first thing each morning to see what needs your attention.',
      'The attention cards update automatically — no need to refresh.',
      'Click any attention card button to go directly to that task.',
    ],
    tooltips: {
      attention: 'These are tasks that might need action soon. They update automatically based on your orders, inventory, and events.',
      quickActions: 'Shortcuts to common tasks. Click any button to jump straight to that page.',
      snapshot: 'A quick look at where things stand right now. Orders and revenue update in real time.',
      activity: 'The latest orders and transfers across your store. This updates automatically as new activity comes in.',
      smartTransfers: 'Items running low at the gift shop but available in the warehouse. Create a one-click transfer to restock.',
      predictiveAlerts: 'Based on recent sales velocity, these items are projected to run out soon.',
    },
  },

  inventory: {
    name: 'Inventory',
    route: '/admin/inventory',
    description: 'Track stock levels at C&S Warehouse and Dark Sky Gift Shop. See what\'s in stock, what\'s low, and what\'s out.',
    howTo: [
      'Go to Inventory to see all products and their stock levels.',
      'Use the search bar to find products by name, SKU, or category.',
      'Filter by location (All, Warehouse, Gift Shop), category, or stock status.',
      'Yellow badge = Low Stock. Red badge = Out of Stock. Green = In Stock.',
      'Click any product row to open the detail drawer with full info.',
      'In the detail drawer, click "Adjust Stock" to manually correct counts.',
      'The Velocity column shows how fast each item sells per week.',
      'The Days Left column shows estimated days until out of stock — green (30+), yellow (7-30), red (<7).',
      'Click "Export CSV" to download a spreadsheet for QuickBooks or records.',
    ],
    tips: [
      'Sort by "Low Stock" filter to quickly see what needs restocking.',
      'The velocity and days left columns help you plan reorders before items run out.',
      'Use the movement history in the detail drawer to see when items were received, sold, or transferred.',
    ],
    tooltips: {
      pageTitle: 'All products currently in stock at each location. Click any row to see details.',
      search: 'Type a product name or product code to find it fast.',
      locationFilter: 'Filter to see only warehouse stock or gift shop stock.',
      exportCSV: 'Downloads a spreadsheet of all your products. Open in Excel or import into QuickBooks.',
      adjustStock: 'Use this to correct the count if something\'s wrong. Enter the new number and a reason.',
      outOfStock: 'This item has zero units. You need to receive more or order from your vendor.',
      lowStock: 'Getting low. Consider reordering before you run out.',
      movementHistory: 'This shows every time this item was received, sold, or transferred.',
    },
  },

  receive: {
    name: 'Receive Stock',
    route: '/admin/receive',
    description: 'Log incoming shipments from vendors. Search products, enter quantities, and stock updates automatically.',
    howTo: [
      'Go to Receive → select the location where the shipment arrived (Warehouse or Gift Shop).',
      'If you see an expected PO at the top, click it to pre-fill the form with those items.',
      'Otherwise, search for products by name or SKU and click to add them.',
      'Enter the quantity received for each item.',
      'Add a reference (like the PO number) and any notes.',
      'Review everything, then click "Receive Stock" to confirm.',
      'Stock counts update automatically across the system.',
    ],
    tips: [
      'Expected POs show at the top — click one to skip the search step and pre-fill everything.',
      'You can scan barcodes into the search field if you have a scanner.',
      'Always add the PO number as a reference so you can trace shipments later.',
    ],
    tooltips: {
      pageTitle: 'Use this when a shipment arrives. Search for what came in, enter how many, and confirm.',
      location: 'Pick where the shipment arrived — your warehouse or the gift shop.',
      search: 'Start typing a product name to find it. Click to add it to your receive list.',
      quantities: 'Enter how many of this item you received in the shipment.',
      reference: 'Add the PO number or any notes about this shipment for your records.',
      confirm: 'This saves everything and updates your stock counts automatically.',
    },
  },

  transfers: {
    name: 'Transfers',
    route: '/admin/transfers',
    description: 'Move stock between C&S Warehouse and Dark Sky Gift Shop. Create, ship, and confirm transfers.',
    howTo: [
      'Go to Transfers → Click "+ New Transfer".',
      'Select where stock is coming from and going to.',
      'Search and add products, then enter quantities for each.',
      'Add notes (like "Josie requested poster restock").',
      'Click "Create Transfer" to save it as Pending.',
      'When you ship the items, mark the transfer as "Shipped".',
      'When Josie receives them at the gift shop, she marks it "Received" and stock updates automatically.',
    ],
    tips: [
      'Check the Dashboard for Smart Transfer suggestions — it knows what the gift shop needs.',
      'Always add notes so Josie knows what to expect.',
      'You can view all transfer history to see what\'s been moved and when.',
    ],
    tooltips: {
      pageTitle: 'Move stock between locations. Warehouse to gift shop is the most common direction.',
      createTransfer: 'Start a new transfer to move products from one location to another.',
    },
  },

  purchaseOrders: {
    name: 'Purchase Orders',
    route: '/admin/purchase-orders',
    description: 'Track vendor orders from creation to delivery. Create POs, track status, and receive shipments.',
    howTo: [
      'Go to Purchase Orders → Click "+ New Purchase Order".',
      'Step 1: Pick your vendor (Printify, Wholesale Astronomy Goods, or Local Artisans Co-op).',
      'Step 2: Search and add products. Set quantity and unit cost for each.',
      'Step 3: Set the expected delivery date and add any notes.',
      'Step 4: Review everything, then "Submit Order" or "Save as Draft".',
      'PO status flow: Draft → Ordered → In Production → Shipped → Received.',
      'When a PO arrives, go to Receive to log the incoming stock.',
      'Smart Reorder Suggestions appear when items need restocking and don\'t have an active PO.',
    ],
    tips: [
      'Check the gold "Smart Reorder Suggestion" banner at the top — it pre-fills a PO for items that need restocking.',
      'Save as Draft if you\'re not ready to submit yet.',
      'Add tracking numbers when the vendor ships so you can track deliveries.',
      'You can delete Draft POs but not ones that have been ordered.',
    ],
    tooltips: {
      pageTitle: 'Purchase orders track what you\'re buying from vendors. Create one before placing an order.',
      vendor: 'Pick the vendor you\'re placing the order with.',
      addProducts: 'Search for products and add them to your order. Enter how many you need.',
      expectedDate: 'When do you expect this order to arrive?',
      tracking: 'Optional tracking number for the shipment.',
      smartReorder: 'These items are at or below their reorder point with no active PO. Click to create a pre-filled order.',
    },
  },

  orders: {
    name: 'Orders',
    route: '/admin/orders',
    description: 'View all online and POS (point of sale) orders. Filter by status, channel, or date.',
    howTo: [
      'Go to Orders to see all sales across online and in-store.',
      'Filter by status: Processing, Shipped, Delivered, Paid.',
      'Filter by channel: Online or POS (in-store register).',
      'Click any order to see full details including items, shipping address, and payment info.',
      'Use the search bar to find orders by order number, customer name, or email.',
    ],
    tips: [
      'Processing orders need your attention — they haven\'t been shipped yet.',
      'POS orders are automatically marked as Paid since they\'re completed at the register.',
      'Export orders data from the Reports page for accounting.',
    ],
    tooltips: {
      pageTitle: 'All sales from your online store and gift shop register.',
    },
  },

  events: {
    name: 'Events',
    route: '/admin/events',
    description: 'Create and manage star parties, planetarium shows, workshops, and kids programs.',
    howTo: [
      'Go to Events → Click "+ New Event".',
      'Fill in the event details: title, category, date, time, location, description.',
      'Set ticket price (in cents — e.g., 1500 = $15.00) and capacity.',
      'Choose whether the event is free for members.',
      'Set status to "Published" to make it visible on the website.',
      'Track ticket sales from the event card — it shows sold vs. capacity.',
      'Click any event card to edit details or check the attendee list.',
      'Use "Duplicate" to create recurring events quickly.',
    ],
    tips: [
      'Set events to "Published" to make them appear on the public website.',
      'The Dashboard will warn you if an event has low ticket sales.',
      'Use the "Duplicate" button for recurring events like monthly star parties.',
      'Member-free events still need a ticket price for non-members.',
    ],
    tooltips: {
      pageTitle: 'Manage all upcoming events. Published events appear on the website for ticket sales.',
      createEvent: 'Create a new event with the step-by-step wizard.',
    },
  },

  email: {
    name: 'Email',
    route: '/admin/emails',
    description: 'Send emails to customers and members. Choose templates, customize text, and track opens.',
    howTo: [
      'Go to Email → Click "Compose Email".',
      'Pick a template or start from scratch.',
      'Add your subject line and email body.',
      'Select recipients: All Customers, Members Only, or specific segments.',
      'IMPORTANT: Always click "Send Test" to preview in your own inbox first.',
      'When you\'re happy with it, click "Send Email" to deliver to all recipients.',
      'Track opens and clicks from the email list.',
    ],
    tips: [
      'Always send a test email to yourself before sending to customers.',
      'Use templates for consistent branding.',
      'Member-only emails are great for exclusive events and early access to new products.',
    ],
    tooltips: {
      pageTitle: 'Send professional emails to your customers and members.',
    },
  },

  content: {
    name: 'Content',
    route: '/admin/content',
    description: 'Edit website text, announcements, and page content. Changes appear on the live site immediately.',
    howTo: [
      'Go to Content to edit site-wide text like the announcement bar.',
      'Edit the announcement text and toggle it on/off.',
      'For page-specific edits, use Edit Mode: click the pencil icon on any store page.',
      'In Edit Mode, click any text on the page to edit it inline.',
      'Changes save automatically and appear on the live website.',
    ],
    tips: [
      'The announcement bar appears at the very top of every store page.',
      'Use Edit Mode (pencil icon) for editing specific text directly on the page.',
      'All content changes are instant — no need to publish or deploy.',
    ],
    tooltips: {
      pageTitle: 'Manage website text and announcements. Changes appear immediately on the live site.',
    },
  },

  reports: {
    name: 'Reports',
    route: '/admin/reports',
    description: 'View sales reports, top products, membership stats, and event attendance. Export data as CSV.',
    howTo: [
      'Go to Reports to see your sales and performance data.',
      'View total revenue, order counts, average order value, and top-selling products.',
      'Check membership growth and tier distribution.',
      'See event attendance and ticket revenue.',
      'Click "Export CSV" on any report section to download data for QuickBooks or Excel.',
    ],
    tips: [
      'Export CSV files regularly for your bookkeeper or QuickBooks.',
      'Check top products to know what to restock first.',
      'Compare week-over-week revenue to spot trends.',
    ],
    tooltips: {
      pageTitle: 'Sales, products, membership, and event performance at a glance.',
    },
  },

  quickbooks: {
    name: 'QuickBooks',
    route: '/admin/quickbooks',
    description: 'Export sales, products, customers, and bills as CSV files formatted for QuickBooks import.',
    howTo: [
      'Go to QuickBooks (under Integrations in the sidebar).',
      'Choose what to export: Sales, Products, Customers, or Bills.',
      'Click the export button to download a CSV file.',
      'Open QuickBooks → File → Import → select the CSV file.',
      'Follow QuickBooks\' import wizard to map the columns.',
    ],
    tips: [
      'Export sales weekly or monthly for accurate bookkeeping.',
      'The CSV format matches QuickBooks\' expected column layout.',
      'Keep exported files organized by date for easy reference.',
    ],
    tooltips: {
      pageTitle: 'Export your store data in QuickBooks-compatible CSV format.',
    },
  },

  editMode: {
    name: 'Edit Mode',
    route: null,
    description: 'Click the pencil icon on any store page to edit text and images directly on the live website.',
    howTo: [
      'Visit any public store page (Home, About, Contact, etc.).',
      'Click the pencil icon (usually in the bottom corner).',
      'Click any text on the page to edit it inline.',
      'Type your changes — they save automatically.',
      'Click the pencil again to exit Edit Mode.',
    ],
    tips: [
      'Edit Mode works on all public pages: Home, About, Contact, Membership, Events, Field Trips.',
      'Changes are saved in localStorage and persist across sessions.',
      'This is the fastest way to update marketing copy.',
    ],
    tooltips: {},
  },

  memberships: {
    name: 'Memberships',
    route: null,
    description: 'Three membership tiers: Stargazer ($18), Explorer ($45), Guardian ($120). Members get discounts and event access.',
    howTo: [
      'Members sign up on the public Membership page.',
      'Three tiers: Stargazer ($18/year), Explorer ($45/year), Guardian ($120/year).',
      'Stargazer: Gateway to the night sky, includes enamel pin.',
      'Explorer: For curious minds, includes star parties, patch, and 10% shop discount.',
      'Guardian: For dark sky believers, includes observatory sessions, 20% discount, tax-deductible.',
      'View all members in the admin from the Dashboard member count.',
      'Members marked as "member-free" events can attend those events at no charge.',
    ],
    tips: [
      'At $2.25 per visit, membership pays for itself quickly.',
      'Guardian members get the best value with observatory access and 20% off.',
      'Member emails can be targeted in the Email section.',
    ],
    tooltips: {},
  },

  roles: {
    name: 'Admin Roles',
    route: null,
    description: 'Three admin roles control who can see and do what: Manager (full access), Staff (day-to-day operations), and Volunteer (read-only basics).',
    howTo: [
      'Manager (Tovah/Nancy): Full access to all admin pages — dashboard, inventory, events, email, content, reports, QuickBooks, and Edit Mode.',
      'Staff (Josie): Can access Dashboard, Inventory, Receive, Transfers, and Orders (read-only). Cannot create events, send emails, edit content, or view financial reports.',
      'Volunteer: Can access Dashboard and Inventory (read-only) to help customers check stock. Cannot edit anything or see financial data.',
      'Toggle the admin role via the toggle switch in the Nav bar, or visit /admin to auto-set to Manager.',
      'The role is stored in localStorage (ds_user_role) — it\'s a demo system, not real authentication.',
    ],
    tips: [
      'The Dashboard adapts to each role — volunteers see a simplified view with quick reference info.',
      'Staff see a day-to-day operations dashboard without revenue data.',
      'Managers see the full dashboard with revenue charts, predictive alerts, and smart transfer suggestions.',
    ],
    tooltips: {},
  },
};

// ── FREQUENTLY ASKED QUESTIONS ──
export const FAQ = [
  {
    q: 'How do I receive a shipment?',
    a: 'Go to Receive → Pick the location (Warehouse or Gift Shop) → Search for the products that arrived → Enter quantities → Add a reference like the PO number → Click "Receive Stock". Your inventory updates automatically! If you have an expected PO, click it at the top to pre-fill everything.',
    keywords: ['receive', 'shipment', 'arrived', 'delivery', 'incoming'],
    feature: 'receive',
  },
  {
    q: 'How do I create a star party?',
    a: 'Go to Events → Click "+ New Event" → Set the category to "Star Party" → Fill in the date, time, location, and description → Set ticket price and capacity → Toggle "Published" to make it visible on the website. Don\'t forget to check "Member Free" if members get in free!',
    keywords: ['star party', 'event', 'create event', 'new event', 'party'],
    feature: 'events',
  },
  {
    q: 'How do I send an email to members?',
    a: 'Go to Email → Click "Compose Email" → Pick a template → Write your subject and message → Select "Members Only" as the recipient group → Click "Send Test" to preview it in your inbox first → Then "Send Email" to deliver to all members.',
    keywords: ['email', 'send', 'members', 'newsletter', 'message'],
    feature: 'email',
  },
  {
    q: 'How do I check what\'s running low?',
    a: 'Go to Inventory → Click the "Low Stock" filter tab to see only items that need attention. Yellow means running low, red means out of stock. You can also check the Dashboard — it shows a low stock count and Smart Reorder Suggestions on the Purchase Orders page.',
    keywords: ['low', 'running low', 'stock', 'reorder', 'out of stock', 'restock'],
    feature: 'inventory',
  },
  {
    q: 'How do I edit the website?',
    a: 'Go to any store page (like the Home page) → Click the pencil icon in the corner to enter Edit Mode → Click any text on the page to edit it inline → Changes save automatically. For the announcement bar, go to Admin → Content.',
    keywords: ['edit', 'website', 'text', 'change', 'update', 'content', 'announcement'],
    feature: 'content',
  },
  {
    q: 'How do I create a transfer?',
    a: 'Go to Transfers → Click "+ New Transfer" → Pick where stock is going from and to → Search and add products → Enter quantities → Add notes for Josie → Click "Create Transfer". You can also use the Smart Transfers suggestion on the Dashboard for one-click transfers!',
    keywords: ['transfer', 'move', 'warehouse', 'gift shop', 'restock gift shop'],
    feature: 'transfers',
  },
  {
    q: 'How do I create a purchase order?',
    a: 'Go to Purchase Orders → Click "+ New Purchase Order" → Pick your vendor → Search and add products with quantities → Set expected date → Review and submit. Check the gold banner at the top for Smart Reorder Suggestions that pre-fill a PO for items running low!',
    keywords: ['purchase order', 'po', 'vendor', 'order', 'buy', 'reorder', 'printify'],
    feature: 'purchaseOrders',
  },
  {
    q: 'How do I export data for QuickBooks?',
    a: 'Go to QuickBooks (under Integrations in the sidebar) → Choose what to export (Sales, Products, Customers, or Bills) → Click the export button to download a CSV. You can also export from Reports → click "Export CSV" on any section.',
    keywords: ['quickbooks', 'export', 'csv', 'accounting', 'bookkeeping'],
    feature: 'quickbooks',
  },
  {
    q: 'How do I adjust stock counts?',
    a: 'Go to Inventory → Click the product row to open its detail drawer → Click "Adjust Stock" → Pick the location (Warehouse or Gift Shop) → Enter the quantity change (+/-) → Add a reason → Click "Apply Adjustment". The count updates immediately.',
    keywords: ['adjust', 'stock', 'count', 'correct', 'fix', 'inventory count'],
    feature: 'inventory',
  },
  {
    q: 'How do membership tiers work?',
    a: 'There are three tiers: Stargazer ($18/year) includes an enamel pin, Explorer ($45/year) includes star parties and 10% shop discount, Guardian ($120/year) includes observatory sessions and 20% discount. At $2.25 per visit, membership pays for itself fast!',
    keywords: ['membership', 'tier', 'stargazer', 'explorer', 'guardian', 'member', 'discount'],
    feature: 'memberships',
  },
  {
    q: 'How do I see sales velocity?',
    a: 'Go to Inventory — the "Velocity" column shows how many units sell per week, and "Days Left" shows estimated days until out of stock. Green means 30+ days, yellow means 7-30 days, red means less than 7 days. This helps you plan reorders before items run out.',
    keywords: ['velocity', 'selling', 'sales', 'fast', 'days left', 'how fast'],
    feature: 'inventory',
  },
  {
    q: 'What do the attention cards mean?',
    a: 'Attention cards on the Dashboard highlight things that need your action: orders waiting to be reviewed, shipments arriving, low stock items, and events with low ticket sales. Each card has a button that takes you directly to the right page to handle it.',
    keywords: ['attention', 'cards', 'dashboard', 'needs attention', 'alert'],
    feature: 'dashboard',
  },
  {
    q: 'How do I mark a PO as received?',
    a: 'There are two ways: 1) Go to Purchase Orders → Click the PO → Click "Mark Received" (this updates stock automatically). 2) Go to Receive → Click the expected PO at the top → Verify quantities → Confirm receipt. Method 2 is better because you can adjust quantities if the actual shipment differs.',
    keywords: ['po received', 'mark received', 'purchase order received', 'arrived'],
    feature: 'purchaseOrders',
  },
  {
    q: 'How do I duplicate an event?',
    a: 'Go to Events → Click on the event you want to copy → Look for the "Duplicate" button → It creates a copy with all the same details. Just update the date and any other changes, then publish it!',
    keywords: ['duplicate', 'copy', 'recurring', 'repeat event', 'clone'],
    feature: 'events',
  },
  {
    q: 'Where do I see recent orders?',
    a: 'You can see recent orders in two places: 1) Dashboard → Recent Activity feed shows the latest orders and transfers. 2) Orders page → Shows all orders with full details, filters, and search.',
    keywords: ['recent orders', 'latest orders', 'new orders', 'sales today'],
    feature: 'orders',
  },
  // Volunteer-specific questions
  {
    q: 'How do I look up if something is in stock?',
    a: 'Go to Inventory → Use the search bar at the top to type the product name → Check the Gift Shop column to see how many are in stock. If a customer asks "Do you have this in size L?", search for the product and look at the variant and gift shop quantity!',
    keywords: ['in stock', 'look up', 'check stock', 'do we have', 'size', 'available'],
    feature: 'inventory',
  },
  {
    q: 'A customer wants to buy a membership — what do I tell them?',
    a: 'Great question! Direct them to darkskycenter.org/membership where they can sign up online. There are three tiers: Stargazer ($18/year), Explorer ($45/year with 10% shop discount), and Guardian ($120/year with 20% discount). At $2.25 per visit, it pays for itself quickly!',
    keywords: ['membership', 'customer', 'sign up', 'buy membership', 'join', 'member'],
    feature: 'memberships',
  },
  {
    q: 'What events are happening today?',
    a: 'Check your Dashboard — today\'s events are listed right at the top with times and registration counts. You can also check the Coming Up This Week section to see what\'s scheduled for the rest of the week.',
    keywords: ['events today', 'happening today', 'today\'s events', 'what\'s on', 'schedule'],
    feature: 'events',
  },
  {
    q: 'Who do I contact if I need help?',
    a: 'For immediate help, contact Nancy (Manager) at (928) 555-0142. For day-to-day gift shop questions, ask Josie (Staff). You can also use this chat assistant anytime — I\'m always here to help you find your way around the system!',
    keywords: ['contact', 'help', 'emergency', 'who do i call', 'phone', 'manager'],
    feature: null,
  },
  // Staff-specific questions
  {
    q: 'A customer wants to know their order status',
    a: 'Go to Orders → Use the search bar to find their order by order number, customer name, or email → Click the order to see its status (Processing, Shipped, Delivered, or Paid). You can share the status with the customer, but you can\'t modify orders.',
    keywords: ['order status', 'customer order', 'where is my order', 'tracking', 'shipped'],
    feature: 'orders',
  },
  {
    q: 'How do I confirm a transfer?',
    a: 'Go to Transfers → Find the transfer marked "In Transit" → Click on it → Click "Mark as Received" to confirm you\'ve received all the items. Stock counts at the gift shop will update automatically!',
    keywords: ['confirm transfer', 'mark received', 'transfer received', 'accept transfer'],
    feature: 'transfers',
  },
  {
    q: 'Show me this month\'s sales',
    a: 'Go to Reports → You\'ll see total revenue, order counts, and average order value at the top. Scroll down for top-selling products and sales trends. You can export any section as CSV for your records.',
    keywords: ['sales', 'this month', 'revenue', 'how much', 'total sales', 'monthly'],
    feature: 'reports',
  },
  {
    q: 'What are the different admin roles?',
    a: 'There are three roles: Manager (full access to everything), Staff (inventory, receiving, transfers, and viewing orders), and Volunteer (read-only inventory and orders to help customers). Go to the Nav bar → Toggle the admin switch to set your role. Pro tip: The dashboard adapts to each role automatically.',
    keywords: ['role', 'roles', 'permissions', 'access', 'manager', 'staff', 'volunteer', 'who can'],
    feature: 'roles',
  },
  {
    q: 'How do I view reports?',
    a: 'Go to Reports (in the sidebar under Analytics). You\'ll see sales totals, top products, membership stats, and event attendance all in one place. Pro tip: Click "Export CSV" on any section to download data for QuickBooks or Excel.',
    keywords: ['view reports', 'reports', 'analytics', 'see data', 'performance'],
    feature: 'reports',
  },
  {
    q: 'How do I check inventory?',
    a: 'Go to Inventory (in the sidebar). Use the search bar to find products by name or SKU. Filter by location (Warehouse vs Gift Shop), category, or stock status. Pro tip: Sort by "Low Stock" to quickly see what needs restocking.',
    keywords: ['check inventory', 'inventory', 'stock', 'how many', 'look up stock'],
    feature: 'inventory',
  },
  {
    q: 'How do I view orders?',
    a: 'Go to Orders (in the sidebar). You\'ll see all online and POS sales with status, customer info, and totals. Use the search bar to find orders by number, customer name, or email. Pro tip: Processing orders need your attention — they haven\'t been shipped yet.',
    keywords: ['view orders', 'see orders', 'orders page', 'order list'],
    feature: 'orders',
  },
  {
    q: 'How do I create an event?',
    a: 'Go to Events → Click "+ New Event" → Fill in the details: title, category (Star Party, Workshop, etc.), date, time, location, and description → Set ticket price and capacity → Set status to "Published" to show it on the website. Pro tip: Use "Duplicate" for recurring events like monthly star parties.',
    keywords: ['create event', 'new event', 'add event', 'make event', 'set up event'],
    feature: 'events',
  },
  {
    q: 'How do I send an email?',
    a: 'Go to Email → Click "Compose Email" → Pick a template or start blank → Write your subject and message → Select recipients (All Customers, Members Only, or a segment) → Click "Send Test" first → Then "Send Email". Pro tip: Always preview with Send Test before sending to everyone.',
    keywords: ['send email', 'compose email', 'email customers', 'send message', 'newsletter'],
    feature: 'email',
  },
];

// ── ALL ADMIN ROUTES ──
export const CURRENT_PAGES = [
  { path: '/admin', name: 'Dashboard', description: 'Daily overview with attention cards, quick actions, stats, and activity feed' },
  { path: '/admin/inventory', name: 'Inventory', description: 'Stock levels across warehouse and gift shop with velocity tracking' },
  { path: '/admin/receive', name: 'Receive', description: 'Log incoming shipments and update stock counts' },
  { path: '/admin/transfers', name: 'Transfers', description: 'Move stock between warehouse and gift shop' },
  { path: '/admin/purchase-orders', name: 'Purchase Orders', description: 'Track vendor orders from creation to delivery' },
  { path: '/admin/orders', name: 'Orders', description: 'All online and POS sales' },
  { path: '/admin/events', name: 'Events', description: 'Star parties, shows, workshops, and kids programs' },
  { path: '/admin/emails', name: 'Email', description: 'Send emails to customers and members' },
  { path: '/admin/content', name: 'Content', description: 'Edit website text and announcements' },
  { path: '/admin/reports', name: 'Reports', description: 'Sales, products, membership, and event reports with CSV export' },
  { path: '/admin/quickbooks', name: 'QuickBooks', description: 'Export data as CSV for QuickBooks import' },
];

// ── SUGGESTED QUICK QUESTIONS (by role) ──
export const QUICK_QUESTIONS = [
  'How do I receive a shipment?',
  'How do I create a star party?',
  'How do I send an email to members?',
  'How do I check what\'s running low?',
  'How do I edit the website?',
];

export const ROLE_QUICK_QUESTIONS = {
  manager: [
    'How do I create an event?',
    'How do I view reports?',
    'How do I edit the website?',
    'How do I send an email?',
  ],
  staff: [
    'How do I receive a shipment?',
    'How do I check inventory?',
    'How do I view orders?',
  ],
  volunteer: [
    'How do I look up stock?',
    'What events are today?',
    'Who do I contact for help?',
  ],
};

// ── SYNONYM MAP ──
// Maps common synonyms/alternate phrasings to canonical keywords
const SYNONYMS = {
  'ship': 'shipment', 'shipping': 'shipment', 'delivery': 'shipment', 'package': 'shipment', 'arrived': 'shipment',
  'create event': 'new event', 'add event': 'new event', 'make event': 'new event', 'schedule': 'event',
  'website': 'edit', 'site': 'edit', 'page': 'content', 'text': 'edit', 'announcement': 'content',
  'check stock': 'inventory', 'stock level': 'inventory', 'look up': 'in stock', 'find product': 'in stock',
  'low stock': 'running low', 'out of stock': 'running low', 'need to reorder': 'reorder',
  'send email': 'email', 'newsletter': 'email', 'mail': 'email', 'message': 'email',
  'move stock': 'transfer', 'restock': 'transfer', 'warehouse to gift shop': 'transfer',
  'po': 'purchase order', 'vendor order': 'purchase order', 'buy': 'purchase order', 'supplier': 'vendor',
  'report': 'reports', 'analytics': 'reports', 'data': 'reports', 'stats': 'reports',
  'accounting': 'quickbooks', 'export': 'csv', 'spreadsheet': 'csv', 'excel': 'csv',
  'member': 'membership', 'join': 'membership', 'sign up': 'membership', 'tier': 'membership',
  'roles': 'role', 'permissions': 'role', 'access': 'role', 'manager': 'role', 'staff': 'role', 'volunteer': 'role',
  'pencil': 'edit mode', 'pencil icon': 'edit mode', 'cms': 'edit mode', 'inline edit': 'edit mode',
};

// ── CONTEXT-AWARE SUGGESTIONS ──
// Given a route, return relevant follow-up suggestions
export const PAGE_SUGGESTIONS = {
  '/admin': [
    'What do the attention cards mean?',
    'How do I check what\'s running low?',
    'How do I create a transfer?',
  ],
  '/admin/inventory': [
    'How do I adjust stock counts?',
    'How do I see sales velocity?',
    'How do I create a purchase order?',
  ],
  '/admin/receive': [
    'How do I receive a shipment?',
    'How do I mark a PO as received?',
    'How do I adjust stock counts?',
  ],
  '/admin/transfers': [
    'How do I create a transfer?',
    'How do I check what\'s running low?',
    'How do I receive a shipment?',
  ],
  '/admin/purchase-orders': [
    'How do I create a purchase order?',
    'How do I mark a PO as received?',
    'How do I check what\'s running low?',
  ],
  '/admin/orders': [
    'Where do I see recent orders?',
    'How do I export data for QuickBooks?',
    'How do I send an email to members?',
  ],
  '/admin/events': [
    'How do I create a star party?',
    'How do I duplicate an event?',
    'How do membership tiers work?',
  ],
  '/admin/emails': [
    'How do I send an email to members?',
    'How do membership tiers work?',
    'How do I edit the website?',
  ],
  '/admin/content': [
    'How do I edit the website?',
    'How do I send an email to members?',
    'How do I create a star party?',
  ],
  '/admin/reports': [
    'How do I export data for QuickBooks?',
    'How do I see sales velocity?',
    'Where do I see recent orders?',
  ],
  '/admin/quickbooks': [
    'How do I export data for QuickBooks?',
    'Where do I see recent orders?',
    'How do I see sales velocity?',
  ],
};

// ── BUILD SYSTEM PROMPT ──
// Dynamically constructs the system prompt from all the pieces above
export function buildSystemPrompt(currentRoute, role) {
  const featureList = Object.values(FEATURES).map(f =>
    `- ${f.name}${f.route ? ` (${f.route})` : ''}: ${f.description}`
  ).join('\n');

  const currentPage = CURRENT_PAGES.find(p => p.path === currentRoute);
  const contextLine = currentPage
    ? `\nThe user is currently on the ${currentPage.name} page (${currentPage.path}): ${currentPage.description}. If they ask "how do I do this" or similar vague questions, assume they're asking about ${currentPage.name}.`
    : '';

  const roleLines = {
    manager: 'The current user is a Manager (Tovah/Nancy). They have full access to all features.',
    staff: `The current user is Staff (Josie). She can: receive shipments, check inventory (gift shop only), confirm transfers, view orders. She CANNOT: create events, send emails, edit content, create purchase orders, view reports, or see financial data. If she asks about a manager-only feature, warmly redirect: "That's a manager function — ask Nancy or Tovah to handle that for you. You can [suggest what they CAN do instead]."`,
    volunteer: `The current user is a Volunteer. They can: look up inventory to help customers, view orders (read-only). They CANNOT: edit anything, create events, send emails, receive shipments, create POs, or see financial data. If they ask about a restricted feature, warmly redirect: "That's handled by the managers — you can reach Nancy at (928) 555-0142, or ask Tovah or Josie. In the meantime, you can [suggest what they CAN do]." Never make them feel bad for asking.`,
  };

  return `You are the Dark Sky Discovery Center admin assistant. You help Nancy, Josie, and volunteers use the MuseumOS platform. You know everything about every feature. Answer in 1-3 sentences, plain English, no jargon. Always tell them exactly where to click. Be warm and encouraging.

${roleLines[role] || roleLines.manager}

You know about these features:
${featureList}

- Edit Mode: Click the pencil icon on any store page to edit text and images directly on the website.
- Memberships: Three tiers — Stargazer ($18), Explorer ($45), Guardian ($120). Members get discounts and free events.
${contextLine}

Always respond with the specific steps: 'Go to [page] → Click [button] → Do [action]'. If you don't know something, say 'I'm not sure about that — try clicking the ? icon next to that feature, or email saleem@createandsource.com for help.'`;
}

// ── ROLE-RESTRICTED FEATURES ──
const MANAGER_ONLY_FEATURES = ['events', 'email', 'content', 'reports', 'quickbooks', 'purchaseOrders'];
const STAFF_RESTRICTED = ['events', 'email', 'content', 'reports', 'quickbooks'];

function getRoleRedirect(feature, role) {
  if (role === 'volunteer') {
    if (feature === 'events') return "Creating events is a manager function. You can view today's events on your dashboard though! If a customer asks about upcoming events, check the Events section on the public website or ask Nancy/Tovah.";
    if (feature === 'email') return "Sending emails is handled by the managers. If you need to contact a customer, let Nancy or Tovah know and they can help.";
    if (feature === 'reports') return "Reports are available to managers. You can check inventory levels from the Inventory page to help customers find what they need!";
    if (feature === 'purchaseOrders') return "Purchase orders are created by managers. If you notice something is out of stock, let Nancy or Tovah know so they can reorder it.";
    if (feature === 'content') return "Website editing is a manager function. If you spot something that needs updating, just let Nancy or Tovah know!";
    if (feature === 'transfers') return "Creating transfers is a manager/staff function. If you think the gift shop needs restocking, let Josie or a manager know!";
    if (feature === 'receive') return "Receiving shipments is handled by staff and managers. If a delivery arrives, find Josie or call Nancy at (928) 555-0142.";
    return "That's a manager function. Ask Nancy or Tovah for help, or call (928) 555-0142.";
  }
  if (role === 'staff') {
    if (feature === 'events') return "Creating events is a manager function. Ask Nancy or Tovah to set those up. You can let them know about event ideas though!";
    if (feature === 'email') return "Sending emails is managed by Nancy and Tovah. If you want to suggest an email to customers, just let them know!";
    if (feature === 'reports') return "Reports are available to managers. You can check inventory and orders from your dashboard to see what you need day-to-day.";
    if (feature === 'purchaseOrders') return "Purchase orders are created by managers. If something needs reordering, flag it to Nancy or Tovah and they'll handle it.";
    if (feature === 'content') return "Website content is edited by managers. If you spot something that needs changing, just let Nancy or Tovah know!";
    if (feature === 'quickbooks') return "QuickBooks exports are a manager function. Nancy handles all the accounting and bookkeeping.";
    return "That's a manager function. Ask Nancy or Tovah for help with that.";
  }
  return null;
}

// ── EXPAND QUERY WITH SYNONYMS ──
function expandQuery(q) {
  let expanded = q;
  for (const [syn, canonical] of Object.entries(SYNONYMS)) {
    if (q.includes(syn) && !q.includes(canonical)) {
      expanded += ' ' + canonical;
    }
  }
  return expanded;
}

// ── SMART RESPONSE ENGINE ──
// Finds the best answer based on the user's question and current page context
export function findBestResponse(question, currentRoute, role) {
  const q = question.toLowerCase().trim();
  const qExpanded = expandQuery(q);

  // Check FAQ first — keyword matching with scoring
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of FAQ) {
    let score = 0;

    // Exact question match
    if (q === faq.q.toLowerCase()) {
      const redirect = getRoleRedirect(faq.feature, role);
      if (redirect) return { answer: redirect, feature: faq.feature, isExact: true };
      return { answer: faq.a, feature: faq.feature, isExact: true };
    }

    // Keyword scoring against expanded query (includes synonyms)
    for (const kw of faq.keywords) {
      const kwLower = kw.toLowerCase();
      if (qExpanded.includes(kwLower)) {
        score += kw.split(' ').length * 2; // multi-word keywords score higher
      }
    }

    // Also match against the FAQ question text itself
    const faqWords = faq.q.toLowerCase().split(/\s+/);
    const qWords = q.split(/\s+/);
    const overlap = qWords.filter(w => w.length > 2 && faqWords.includes(w)).length;
    score += overlap;

    // Also match against feature name and description
    if (faq.feature && FEATURES[faq.feature]) {
      const fname = FEATURES[faq.feature].name.toLowerCase();
      if (qExpanded.includes(fname)) score += 3;
    }

    // Boost score if question matches current page context
    const featureDef = FEATURES[faq.feature];
    if (featureDef && featureDef.route === currentRoute) {
      score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore >= 2) {
    const redirect = getRoleRedirect(bestMatch.feature, role);
    if (redirect) {
      return { answer: redirect, feature: bestMatch.feature, isExact: false };
    }
    return { answer: bestMatch.a, feature: bestMatch.feature, isExact: false };
  }

  // Check feature descriptions for general "what is X" or "tell me about X" questions
  for (const [key, feature] of Object.entries(FEATURES)) {
    const name = feature.name.toLowerCase();
    if (qExpanded.includes(name) || qExpanded.includes(key)) {
      const redirect = getRoleRedirect(key, role);
      if (redirect) return { answer: redirect, feature: key, isExact: false };
      const tip = feature.tips[0] ? ` Pro tip: ${feature.tips[0]}` : '';
      return {
        answer: `${feature.description} ${feature.route ? `Go to ${feature.name} in the sidebar to get started.` : feature.howTo[0]}${tip}`,
        feature: key,
        isExact: false,
      };
    }
  }

  // Context-aware fallback: if on a specific page, give that page's overview
  if (currentRoute) {
    const pageFeature = Object.values(FEATURES).find(f => f.route === currentRoute);
    if (pageFeature && (q.includes('how') || q.includes('what') || q.includes('help') || q.includes('this'))) {
      const tip = pageFeature.tips[0] ? ` Pro tip: ${pageFeature.tips[0]}` : '';
      return {
        answer: `You're on the ${pageFeature.name} page. ${pageFeature.description}${tip}`,
        feature: Object.keys(FEATURES).find(k => FEATURES[k] === pageFeature),
        isExact: false,
      };
    }
  }

  // Greeting responses
  if (q.match(/^(hi|hello|hey|howdy|good morning|good afternoon|good evening)/)) {
    return {
      answer: "Hi there! I'm your Dark Sky assistant. Ask me anything about how to use the admin — like how to receive shipments, create events, or check stock levels. What can I help you with?",
      feature: null,
      isExact: true,
    };
  }

  // Thanks responses
  if (q.match(/^(thanks|thank you|thx|ty|appreciate)/)) {
    return {
      answer: "You're welcome! Don't hesitate to ask if anything else comes up. You're doing great!",
      feature: null,
      isExact: true,
    };
  }

  // Default fallback
  return {
    answer: "I'm not sure about that. Try clicking the ? icon next to any feature for help, or check the sidebar to find what you need.",
    feature: null,
    isExact: false,
  };
}

// ── GET FOLLOW-UP SUGGESTIONS ──
// Returns 2-3 relevant follow-up questions based on the answer topic
export function getFollowUpSuggestions(feature, currentRoute) {
  if (!feature) {
    // Use page-based suggestions
    return (PAGE_SUGGESTIONS[currentRoute] || QUICK_QUESTIONS.slice(0, 3)).slice(0, 3);
  }

  // Find related questions
  const related = FAQ.filter(f => f.feature === feature).map(f => f.q);

  // Also add questions from related features
  const featureDef = FEATURES[feature];
  if (featureDef) {
    const pageSuggestions = PAGE_SUGGESTIONS[featureDef.route] || [];
    for (const s of pageSuggestions) {
      if (!related.includes(s)) related.push(s);
    }
  }

  // Return 2-3 that aren't the same as what was just asked
  return related.slice(0, 3);
}
