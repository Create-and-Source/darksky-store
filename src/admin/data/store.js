// ══════════════════════════════════════════
// DARK SKY — CENTRAL LOCALSTORAGE DATA STORE
// All pages read/write through these functions.
// Initializes from mock data on first load.
// ══════════════════════════════════════════

import { INVENTORY as MOCK_INV, ORDERS as MOCK_ORD, PURCHASE_ORDERS as MOCK_PO, TRANSFERS as MOCK_TRF, VENDORS } from './mockData';
import { PRODUCTS as MOCK_PRODUCTS } from '../../data/products';

const KEYS = {
  inventory: 'ds_inventory',
  orders: 'ds_orders',
  pos: 'ds_purchase_orders',
  transfers: 'ds_transfers',
  events: 'ds_events',
  emails: 'ds_emails',
  content: 'ds_content',
  cart: 'ds_cart',
  members: 'ds_members',
  inquiries: 'ds_inquiries',
  contacts: 'ds_contacts',
  announcement: 'ds_announcement',
  ticketReservations: 'ds_ticket_reservations',
  movementHistory: 'ds_movement_history',
  products: 'ds_products',
  donations: 'ds_donations',
  facilityBookings: 'ds_facility_bookings',
  visitors: 'ds_visitors',
  volunteers: 'ds_volunteers',
  fundraising: 'ds_fundraising',
  staff: 'ds_staff',
  timesheets: 'ds_timesheets',
  payrollHistory: 'ds_payroll_history',
  volunteerHours: 'ds_volunteer_hours',
  volunteerCheckins: 'ds_volunteer_checkins',
  heldSales: 'ds_held_sales',
};

// ── HELPERS ──
const get = (key, fallback) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; } };
const set = (key, val) => { localStorage.setItem(key, JSON.stringify(val)); notify(); };
const genId = (prefix) => `${prefix}-${String(Date.now()).slice(-6)}${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`;

// ── CROSS-COMPONENT REACTIVITY ──
// Components call store.subscribe(fn) to re-render when any data changes.
const listeners = new Set();
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const notify = () => listeners.forEach(fn => fn());

// ── INIT ──
const DATA_VERSION = '3.1';

export function initStore() {
  // Version check — clear all ds_ keys and re-seed if version mismatch
  if (localStorage.getItem('ds_data_version') !== DATA_VERSION) {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ds_')) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    // Also clear darksky_ prefixed keys (admin tour, QB sync log)
    ['darksky_admin_onboarded', 'darksky_qb_sync_log'].forEach(k => localStorage.removeItem(k));
    localStorage.setItem('ds_data_version', DATA_VERSION);
  }

  if (!localStorage.getItem(KEYS.inventory)) set(KEYS.inventory, MOCK_INV);
  if (!localStorage.getItem(KEYS.orders)) set(KEYS.orders, MOCK_ORD);
  if (!localStorage.getItem(KEYS.pos)) set(KEYS.pos, MOCK_PO);
  if (!localStorage.getItem(KEYS.transfers)) set(KEYS.transfers, MOCK_TRF);
  if (!localStorage.getItem(KEYS.events)) set(KEYS.events, DEFAULT_EVENTS);
  if (!localStorage.getItem(KEYS.emails)) set(KEYS.emails, []);
  if (!localStorage.getItem(KEYS.content)) set(KEYS.content, DEFAULT_CONTENT);
  if (!localStorage.getItem(KEYS.cart)) set(KEYS.cart, []);
  if (!localStorage.getItem(KEYS.members)) set(KEYS.members, DEFAULT_MEMBERS);
  if (!localStorage.getItem(KEYS.inquiries)) set(KEYS.inquiries, []);
  if (!localStorage.getItem(KEYS.contacts)) set(KEYS.contacts, []);
  if (!localStorage.getItem(KEYS.announcement)) set(KEYS.announcement, { text: 'International Dark Sky Discovery Center · Now Open · Fountain Hills, AZ', active: true });
  if (!localStorage.getItem(KEYS.ticketReservations)) set(KEYS.ticketReservations, []);
  if (!localStorage.getItem(KEYS.movementHistory)) set(KEYS.movementHistory, DEFAULT_MOVEMENTS);
  if (!localStorage.getItem(KEYS.products)) set(KEYS.products, MOCK_PRODUCTS);
  if (!localStorage.getItem(KEYS.donations)) set(KEYS.donations, DEFAULT_DONATIONS);
  if (!localStorage.getItem(KEYS.facilityBookings)) set(KEYS.facilityBookings, DEFAULT_FACILITY_BOOKINGS);
  if (!localStorage.getItem(KEYS.visitors)) set(KEYS.visitors, DEFAULT_VISITORS);
  if (!localStorage.getItem(KEYS.volunteers)) set(KEYS.volunteers, DEFAULT_VOLUNTEERS);
  if (!localStorage.getItem(KEYS.fundraising)) set(KEYS.fundraising, DEFAULT_FUNDRAISING);
  if (!localStorage.getItem(KEYS.staff)) set(KEYS.staff, DEFAULT_STAFF);
  if (!localStorage.getItem(KEYS.timesheets)) set(KEYS.timesheets, DEFAULT_TIMESHEETS);
  if (!localStorage.getItem(KEYS.payrollHistory)) set(KEYS.payrollHistory, DEFAULT_PAYROLL);
  if (!localStorage.getItem(KEYS.volunteerHours)) set(KEYS.volunteerHours, DEFAULT_VOLUNTEER_HOURS);
  if (!localStorage.getItem(KEYS.volunteerCheckins)) set(KEYS.volunteerCheckins, []);
  if (!localStorage.getItem(KEYS.heldSales)) set(KEYS.heldSales, []);
  // Seed physical products into ds_products
  const prods = get(KEYS.products, []);
  if (!prods.find(p => p.id === 'PHYS-001')) {
    const physicals = [
      { id: 'PHYS-001', title: 'Fountain Hills Star Map Poster', price: 2499, images: [], category: 'Gifts', tags: ['poster','star map','fountain hills'], description: 'A detailed star map of the night sky as seen from Fountain Hills, Arizona. Archival quality print on heavyweight paper.', type: 'physical' },
      { id: 'PHYS-002', title: 'Dark Sky Discovery Center Enamel Pin', price: 1299, images: [], category: 'Gifts', tags: ['pin','enamel','souvenir'], description: 'Gold and navy enamel pin featuring the IDSDC telescope dome logo. Butterfly clutch backing.', type: 'physical' },
      { id: 'PHYS-003', title: 'Night Sky Field Guide — Arizona Edition', price: 1899, images: [], category: 'Gifts', tags: ['book','field guide','arizona'], description: 'Pocket-sized guide to Arizona night sky objects, constellations, and best viewing locations.', type: 'physical' },
      { id: 'PHYS-004', title: 'Glow-in-the-Dark Constellation Stickers', price: 699, images: [], category: 'Kids', tags: ['stickers','glow','kids'], description: 'Set of 50 glow-in-the-dark star and constellation stickers for bedroom ceilings.', type: 'physical' },
      { id: 'PHYS-005', title: 'PlaneWave CDK700 Telescope Model', price: 4999, images: [], category: 'Gifts', tags: ['model','telescope','collectible'], description: '1:50 scale die-cast model of the PlaneWave CDK700 telescope. Display stand included.', type: 'physical' },
      { id: 'PHYS-006', title: 'Desert Crystal Collection Box', price: 3499, images: [], category: 'Gifts', tags: ['crystals','desert','local'], description: 'Curated box of 6 Arizona desert minerals with identification cards.', type: 'physical' },
      { id: 'PHYS-007', title: 'Scorpion UV Flashlight', price: 1599, images: [], category: 'Gifts', tags: ['uv','flashlight','scorpion'], description: 'Professional UV flashlight for finding fluorescent scorpions on desert night hikes.', type: 'physical' },
      { id: 'PHYS-008', title: 'Astronaut Ice Cream 3-Pack', price: 899, images: [], category: 'Kids', tags: ['ice cream','space','kids'], description: 'Freeze-dried ice cream in three flavors: vanilla, chocolate, and strawberry.', type: 'physical' },
      { id: 'PHYS-009', title: 'Dark Sky Coffee — Midnight Roast', price: 1699, images: [], category: 'Gifts', tags: ['coffee','local','roast'], description: 'Small-batch dark roast coffee from a Scottsdale roaster. 12oz whole bean bag.', type: 'physical' },
      { id: 'PHYS-010', title: 'Milky Way Photography Print — Signed', price: 8999, images: [], category: 'Gifts', tags: ['print','photography','signed'], description: 'Signed 16x20 print of the Milky Way over Fountain Hills by resident astrophotographer.', type: 'physical' },
    ];
    set(KEYS.products, [...prods, ...physicals]);
  }
}

// ═══════ PRODUCTS (storefront catalog) ═══════
export const getProducts = () => get(KEYS.products, []);

// ═══════ INVENTORY ═══════
export const getInventory = () => get(KEYS.inventory, []);
export const getProduct = (id) => getInventory().find(p => p.id === id);
export function updateInventory(id, changes) {
  const inv = getInventory().map(p => p.id === id ? { ...p, ...changes } : p);
  set(KEYS.inventory, inv);
  return inv;
}
export function adjustStock(id, location, delta, ref = '', note = '') {
  const inv = getInventory();
  const idx = inv.findIndex(p => p.id === id);
  if (idx === -1) return;
  inv[idx] = { ...inv[idx], [location]: Math.max(0, (inv[idx][location] || 0) + delta) };
  set(KEYS.inventory, inv);
  // Add movement history
  addMovement(id, {
    date: new Date().toISOString().slice(0,10),
    type: delta > 0 ? 'Received' : 'Sale',
    ref, location: location === 'warehouse' ? 'Warehouse' : 'Gift Shop',
    change: delta, note,
  });
}
export function receiveStock(items, locationKey, notes = '') {
  const inv = getInventory();
  items.forEach(({ id, qty }) => {
    const idx = inv.findIndex(p => p.id === id);
    if (idx !== -1) {
      inv[idx] = { ...inv[idx], [locationKey]: (inv[idx][locationKey] || 0) + qty };
      addMovement(id, {
        date: new Date().toISOString().slice(0,10),
        type: 'Received', ref: notes, location: locationKey === 'warehouse' ? 'Warehouse' : 'Gift Shop',
        change: qty, note: `Received ${qty} units`,
      });
    }
  });
  set(KEYS.inventory, inv);
}

// ═══════ MOVEMENT HISTORY ═══════
export const getMovements = (productId) => { const m = get(KEYS.movementHistory, {}); return m[productId] || []; };
export function addMovement(productId, entry) {
  const all = get(KEYS.movementHistory, {});
  if (!all[productId]) all[productId] = [];
  all[productId].unshift(entry);
  set(KEYS.movementHistory, all);
}

// ═══════ ORDERS ═══════
export const getOrders = () => get(KEYS.orders, []);
export const getOrder = (id) => getOrders().find(o => o.id === id);
export function addOrder(order) {
  const orders = getOrders();
  // Flatten nested customer/shipping objects for Orders.jsx compatibility
  const cust = order.customer || {};
  const ship = order.shipping || {};
  const customerName = typeof cust === 'string' ? cust : `${cust.firstName || ''} ${cust.lastName || ''}`.trim();
  const customerEmail = typeof cust === 'string' ? order.email : cust.email;
  const address = typeof ship === 'string' ? ship : [ship.address1, ship.address2, ship.city, ship.state, ship.zip].filter(Boolean).join(', ');
  const newOrder = {
    id: `ORD-${String(2402 + orders.filter(o => o.id.startsWith('ORD')).length).padStart(4,'0')}`,
    ...order,
    customer: customerName,
    email: customerEmail,
    address,
    shipping: order.shippingCost != null ? order.shippingCost : (typeof order.shipping === 'number' ? order.shipping : 0),
    date: new Date().toISOString().slice(0,10),
    status: 'Processing',
    channel: 'Online',
    paymentId: `pi_${Date.now()}`,
  };
  orders.unshift(newOrder);
  set(KEYS.orders, orders);
  // Decrease inventory
  (order.items || []).forEach(item => {
    const inv = getInventory();
    const prod = inv.find(p => p.name === item.name || p.sku === item.sku);
    if (prod) adjustStock(prod.id, 'giftshop', -item.qty, newOrder.id, 'Online sale');
  });
  return newOrder;
}
export function updateOrder(id, changes) {
  const orders = getOrders().map(o => o.id === id ? { ...o, ...changes } : o);
  set(KEYS.orders, orders);
}

// ═══════ PURCHASE ORDERS ═══════
export const getPurchaseOrders = () => get(KEYS.pos, []);
export const getPO = (id) => getPurchaseOrders().find(p => p.id === id);
export function addPurchaseOrder(po) {
  const pos = getPurchaseOrders();
  const newPO = {
    id: `PO-${String(46 + pos.length).padStart(4,'0')}`,
    ...po,
    createdDate: new Date().toISOString().slice(0,10),
    status: po.status || 'Draft',
  };
  pos.unshift(newPO);
  set(KEYS.pos, pos);
  return newPO;
}
export function updatePurchaseOrder(id, changes) {
  let pos = getPurchaseOrders().map(p => p.id === id ? { ...p, ...changes } : p);
  set(KEYS.pos, pos);
  // If marking as received, add stock
  if (changes.status === 'Received') {
    const po = pos.find(p => p.id === id);
    if (po) {
      po.items.forEach(item => {
        const inv = getInventory();
        const prod = inv.find(p => p.sku === item.sku);
        if (prod) adjustStock(prod.id, 'warehouse', item.ordered, id, 'PO received');
      });
    }
  }
}
export function deletePurchaseOrder(id) {
  set(KEYS.pos, getPurchaseOrders().filter(p => p.id !== id));
}

// ═══════ TRANSFERS ═══════
export const getTransfers = () => get(KEYS.transfers, []);
export function addTransfer(t) {
  const transfers = getTransfers();
  const newT = {
    id: `TRF-${String(90 + transfers.length).padStart(4,'0')}`,
    ...t,
    status: 'Pending',
    createdDate: new Date().toISOString().slice(0,10),
    shippedDate: null,
    receivedDate: null,
  };
  transfers.unshift(newT);
  set(KEYS.transfers, transfers);
  return newT;
}
export function updateTransfer(id, changes) {
  const transfers = getTransfers().map(t => {
    if (t.id !== id) return t;
    const updated = { ...t, ...changes };
    return updated;
  });
  set(KEYS.transfers, transfers);
  // If marking received, update inventory
  if (changes.status === 'Received') {
    const tr = transfers.find(t => t.id === id);
    if (tr) {
      const fromKey = tr.from.includes('Warehouse') ? 'warehouse' : 'giftshop';
      const toKey = tr.to.includes('Warehouse') ? 'warehouse' : 'giftshop';
      tr.items.forEach(item => {
        const inv = getInventory();
        const prod = inv.find(p => p.sku === item.sku);
        if (prod) {
          adjustStock(prod.id, fromKey, -item.qty, id, 'Transfer out');
          adjustStock(prod.id, toKey, item.qty, id, 'Transfer received');
        }
      });
    }
  }
}

// ═══════ EVENTS ═══════
export const getEvents = () => get(KEYS.events, []);
export const getEvent = (id) => getEvents().find(e => e.id === id);
export function addEvent(event) {
  const events = getEvents();
  const newE = { id: genId('EVT'), ...event, createdDate: new Date().toISOString().slice(0,10) };
  events.unshift(newE);
  set(KEYS.events, events);
  return newE;
}
export function updateEvent(id, changes) {
  set(KEYS.events, getEvents().map(e => e.id === id ? { ...e, ...changes } : e));
}
export function deleteEvent(id) {
  set(KEYS.events, getEvents().filter(e => e.id !== id));
}

// ═══════ TICKET RESERVATIONS ═══════
export const getReservations = () => get(KEYS.ticketReservations, []);
export function addReservation(res) {
  const all = getReservations();
  const newR = { id: genId('TKT'), ...res, date: new Date().toISOString(), checkedIn: false };
  all.unshift(newR);
  set(KEYS.ticketReservations, all);
  // Update event ticket count
  const events = getEvents();
  const ev = events.find(e => e.id === res.eventId);
  if (ev) {
    updateEvent(res.eventId, { ticketsSold: (ev.ticketsSold || 0) + (res.qty || 1) });
  }
  return newR;
}

// ═══════ EMAILS ═══════
export const getEmails = () => get(KEYS.emails, []);
export function addEmail(email) {
  const emails = getEmails();
  const newE = {
    id: genId('EML'),
    ...email,
    sentDate: new Date().toISOString(),
    status: email.status || 'Sent',
    opens: 0, clicks: 0,
  };
  emails.unshift(newE);
  set(KEYS.emails, emails);
  return newE;
}

// ═══════ CONTENT ═══════
export const getContent = () => get(KEYS.content, {});
export function updateContent(page, data) {
  const content = getContent();
  content[page] = { ...content[page], ...data };
  set(KEYS.content, content);
}

// ═══════ ANNOUNCEMENT ═══════
export const getAnnouncement = () => get(KEYS.announcement, { text: '', active: false });
export function updateAnnouncement(data) { set(KEYS.announcement, { ...getAnnouncement(), ...data }); }

// ═══════ CART ═══════
let cartIdCounter = Date.now();
export const getCart = () => get(KEYS.cart, []);
export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id && i.variant === product.variant);
  if (existing) {
    const updated = cart.map(i => (i.id === product.id && i.variant === product.variant) ? { ...i, qty: i.qty + 1 } : i);
    set(KEYS.cart, updated);
  } else {
    cart.push({ ...product, qty: 1, cartId: ++cartIdCounter });
    set(KEYS.cart, cart);
  }
}
export function updateCartQty(cartId, qty) {
  if (qty < 1) { removeFromCart(cartId); return; }
  set(KEYS.cart, getCart().map(i => i.cartId === cartId ? { ...i, qty } : i));
}
export function removeFromCart(cartId) {
  set(KEYS.cart, getCart().filter(i => i.cartId !== cartId));
}
export function clearCart() { set(KEYS.cart, []); }

// ═══════ MEMBERS ═══════
export const getMembers = () => get(KEYS.members, []);
export function addMember(member) {
  const members = getMembers();
  const newM = { id: genId('MBR'), ...member, joinDate: new Date().toISOString().slice(0,10), status: 'Active' };
  members.unshift(newM);
  set(KEYS.members, members);
  return newM;
}
export const isMember = (email) => getMembers().some(m => m.email === email && m.status === 'Active');

// ═══════ INQUIRIES ═══════
export const getInquiries = () => get(KEYS.inquiries, []);
export function addInquiry(inq) {
  const all = getInquiries();
  const newI = { id: genId('INQ'), ...inq, date: new Date().toISOString().slice(0,10), status: 'New' };
  all.unshift(newI);
  set(KEYS.inquiries, all);
  return newI;
}

// ═══════ CONTACTS ═══════
export const getContacts = () => get(KEYS.contacts, []);
export function addContact(contact) {
  const all = getContacts();
  all.unshift({ id: genId('CTT'), ...contact, date: new Date().toISOString().slice(0,10) });
  set(KEYS.contacts, all);
}

// ═══════ VENDORS ═══════
export { VENDORS };

// ═══════ HELPERS ═══════
export const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;
export const getStockStatus = (item) => {
  const total = (item.warehouse || 0) + (item.giftshop || 0);
  if (total === 0) return 'out';
  if (total <= (item.reorderPoint || 5)) return 'low';
  return 'in';
};

// ═══════ SALES VELOCITY ═══════
// Calculate weekly sales rate per inventory item from order history
export function getSalesVelocity() {
  const orders = getOrders();
  const inventory = getInventory();
  if (orders.length === 0) return {};

  // Find date range of orders
  const dates = orders.map(o => o.date).filter(Boolean).sort();
  const earliest = new Date(dates[0] + 'T00:00:00');
  const latest = new Date(dates[dates.length - 1] + 'T23:59:59');
  const weeks = Math.max(1, (latest - earliest) / (7 * 86400000));

  // Aggregate qty sold per product name+variant
  const sold = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const key = `${item.name}||${item.variant}`;
      sold[key] = (sold[key] || 0) + (item.qty || 0);
    });
  });

  // Map to inventory items
  const velocity = {};
  inventory.forEach(inv => {
    const key = `${inv.name}||${inv.variant}`;
    const totalSold = sold[key] || 0;
    const perWeek = totalSold / weeks;
    const totalStock = (inv.warehouse || 0) + (inv.giftshop || 0);
    const daysLeft = perWeek > 0 ? Math.round((totalStock / perWeek) * 7) : null;
    velocity[inv.id] = { perWeek: Math.round(perWeek * 10) / 10, totalSold, daysLeft };
  });
  return velocity;
}

// ═══════ SMART REORDER SUGGESTIONS ═══════
// Items at or below reorder point that don't have an active PO
export function getReorderSuggestions() {
  const inventory = getInventory();
  const pos = getPurchaseOrders();
  const activePOSkus = new Set();
  pos.filter(po => ['Draft', 'Ordered', 'In Production', 'Shipped'].includes(po.status))
    .forEach(po => po.items.forEach(i => activePOSkus.add(i.sku)));

  const velocity = getSalesVelocity();
  return inventory.filter(item => {
    const status = getStockStatus(item);
    return (status === 'low' || status === 'out') && !activePOSkus.has(item.sku);
  }).map(item => ({
    ...item,
    velocity: velocity[item.id] || { perWeek: 0, totalSold: 0, daysLeft: null },
    suggestedQty: Math.max(12, (item.reorderPoint || 5) * 3),
  }));
}

// ═══════ SMART TRANSFERS ═══════
// Gift shop items running low that warehouse has in stock
export function getSmartTransferSuggestions() {
  const inventory = getInventory();
  return inventory.filter(item => {
    const gsStock = item.giftshop || 0;
    const whStock = item.warehouse || 0;
    return gsStock <= Math.ceil((item.reorderPoint || 5) / 2) && whStock >= 5;
  }).map(item => ({
    ...item,
    suggestedQty: Math.min(item.warehouse, Math.max(5, (item.reorderPoint || 5))),
  }));
}

// ═══════ PREDICTIVE ALERTS ═══════
// Items predicted to run out within 14 days
export function getPredictiveAlerts() {
  const inventory = getInventory();
  const velocity = getSalesVelocity();
  return inventory.filter(item => {
    const v = velocity[item.id];
    return v && v.daysLeft !== null && v.daysLeft <= 14 && v.daysLeft > 0 && v.perWeek > 0;
  }).map(item => ({
    ...item,
    velocity: velocity[item.id],
  })).sort((a, b) => a.velocity.daysLeft - b.velocity.daysLeft);
}

// ═══════ DASHBOARD STATS ═══════
export function getDashboardStats() {
  const orders = getOrders();
  const inv = getInventory();
  const members = getMembers();
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const todayOrders = orders.filter(o => o.date === new Date().toISOString().slice(0,10));
  const lowStock = inv.filter(p => getStockStatus(p) === 'low' || getStockStatus(p) === 'out');
  return { totalRevenue, orderCount: orders.length, todayOrders: todayOrders.length, lowStockCount: lowStock.length, memberCount: members.length };
}

// ═══════ DEFAULT DATA ═══════
const DEFAULT_EVENTS = [
  { id: 'EVT-001', title: 'New Moon Star Party', category: 'Star Party', date: '2026-03-29', time: '20:00', endTime: '23:00', location: 'Observatory Deck', description: 'Join us for our monthly new moon star party — the darkest skies of the month! Our volunteer astronomers will guide you through the constellations, and you\'ll get to view deep-sky objects through our 16-inch Dobsonian telescope. Bring a blanket and a thermos.', price: 1500, capacity: 45, ticketsSold: 12, status: 'Published', featured: true, memberFree: true },
  { id: 'EVT-002', title: 'Planets & Pours — After Dark', category: 'Special Event', date: '2026-04-12', time: '19:30', endTime: '22:30', location: 'Amphitheater', description: 'A 21+ evening under the stars with local craft beer, wine, and telescope viewing. See Saturn\'s rings and Jupiter\'s moons while sipping something cold. Live acoustic music from 8-9pm. Must be 21+ with valid ID.', price: 3500, capacity: 40, ticketsSold: 8, status: 'Published', featured: true, memberFree: false },
  { id: 'EVT-003', title: 'Family Star Safari', category: 'Kids Program', date: '2026-04-19', time: '18:30', endTime: '21:00', location: 'Observatory Deck', description: 'An adventure for the whole family! Kids get a star chart and LED flashlight to navigate the constellation trail. Ends with telescope viewing of the Moon and planets. Ages 5+.', price: 1200, capacity: 60, ticketsSold: 22, status: 'Published', featured: false, memberFree: true },
  { id: 'EVT-004', title: 'Astrophotography Workshop', category: 'Workshop', date: '2026-04-26', time: '18:00', endTime: '22:00', location: 'Education Center', description: 'Learn to photograph the Milky Way with your own camera. We\'ll cover camera settings, composition, and post-processing. Bring a DSLR or mirrorless camera with manual mode. Tripods provided. Limited to 15 for hands-on instruction.', price: 4500, capacity: 15, ticketsSold: 6, status: 'Published', featured: false, memberFree: false },
  { id: 'EVT-005', title: 'Planetarium Show: Journey to Mars', category: 'Planetarium Show', date: '2026-05-03', time: '14:00', endTime: '15:00', location: 'Planetarium Theater', description: 'Experience an immersive full-dome journey to the Red Planet. Follow robotic explorers across Martian canyons and volcanoes, then blast off into orbit. Perfect for all ages. Shows run hourly.', price: 1200, capacity: 50, ticketsSold: 15, status: 'Published', featured: false, memberFree: false },
  { id: 'EVT-006', title: 'Kids Space Camp — Spring Session', category: 'Kids Program', date: '2026-05-10', time: '09:00', endTime: '15:00', location: 'Education Center', description: 'A full day of space science for kids ages 6-12. Build and launch model rockets, learn about the planets, and end the day with a planetarium show. Lunch included. Drop-off at 8:45am.', price: 6500, capacity: 25, ticketsSold: 18, status: 'Published', featured: true, memberFree: false },
];

const DEFAULT_MEMBERS = [
  { id: 'MBR-001', name: 'Sarah Mitchell', email: 'sarah.m@email.com', tier: 'Explorer', joinDate: '2026-01-15', status: 'Active' },
  { id: 'MBR-002', name: 'James Rodriguez', email: 'jrod@email.com', tier: 'Stargazer', joinDate: '2026-02-01', status: 'Active' },
  { id: 'MBR-003', name: 'Emily Chen', email: 'echen@email.com', tier: 'Guardian', joinDate: '2025-12-10', status: 'Active' },
  { id: 'MBR-004', name: 'Michael Torres', email: 'mtorres@email.com', tier: 'Explorer', joinDate: '2026-02-20', status: 'Active' },
  { id: 'MBR-005', name: 'Lisa Park', email: 'lpark@email.com', tier: 'Stargazer', joinDate: '2026-03-01', status: 'Active' },
];

const DEFAULT_CONTENT = {
  home: { title: 'Where the Cosmos Comes to Life', subtitle: 'Discover the wonders of the universe at the International Dark Sky Discovery Center', heroBtn: 'Explore the Collection' },
  about: { title: 'About the Discovery Center', body: 'The International Dark Sky Discovery Center is a world-class facility dedicated to celebrating and preserving the night sky.' },
  membership: { title: 'Join the Dark Sky Community', subtitle: 'Support our mission to protect and celebrate the night sky' },
};

// ═══════ DONATIONS ═══════
export const getDonations = () => get(KEYS.donations, []);
export const getDonation = (id) => getDonations().find(d => d.id === id);
export function addDonation(donation) {
  const all = getDonations();
  const newD = { id: genId('DON'), ...donation, createdDate: new Date().toISOString().slice(0,10) };
  all.unshift(newD);
  set(KEYS.donations, all);
  return newD;
}
export function updateDonation(id, changes) {
  set(KEYS.donations, getDonations().map(d => d.id === id ? { ...d, ...changes } : d));
}
export function deleteDonation(id) {
  set(KEYS.donations, getDonations().filter(d => d.id !== id));
}

// ═══════ FACILITY BOOKINGS ═══════
export const getFacilityBookings = () => get(KEYS.facilityBookings, []);
export const getFacilityBooking = (id) => getFacilityBookings().find(b => b.id === id);
export function addFacilityBooking(booking) {
  const all = getFacilityBookings();
  const newB = { id: genId('FBK'), ...booking, createdDate: new Date().toISOString().slice(0,10) };
  all.unshift(newB);
  set(KEYS.facilityBookings, all);
  return newB;
}
export function updateFacilityBooking(id, changes) {
  set(KEYS.facilityBookings, getFacilityBookings().map(b => b.id === id ? { ...b, ...changes } : b));
}
export function deleteFacilityBooking(id) {
  set(KEYS.facilityBookings, getFacilityBookings().filter(b => b.id !== id));
}

// ═══════ VISITORS ═══════
export const getVisitors = () => get(KEYS.visitors, []);
export function addVisitorDay(day) {
  const all = getVisitors();
  const existing = all.findIndex(v => v.date === day.date);
  if (existing >= 0) { all[existing] = { ...all[existing], ...day }; }
  else { all.unshift(day); }
  set(KEYS.visitors, all);
}
export function updateVisitorDay(date, changes) {
  const all = getVisitors();
  const idx = all.findIndex(v => v.date === date);
  if (idx >= 0) { all[idx] = { ...all[idx], ...changes }; set(KEYS.visitors, all); }
}

// ═══════ VOLUNTEERS ═══════
export const getVolunteers = () => get(KEYS.volunteers, []);
export const getVolunteer = (id) => getVolunteers().find(v => v.id === id);
export function addVolunteer(vol) {
  const all = getVolunteers();
  const newV = { id: genId('VOL'), ...vol, createdDate: new Date().toISOString().slice(0,10) };
  all.unshift(newV);
  set(KEYS.volunteers, all);
  return newV;
}
export function updateVolunteer(id, changes) {
  set(KEYS.volunteers, getVolunteers().map(v => v.id === id ? { ...v, ...changes } : v));
}
export function deleteVolunteer(id) {
  set(KEYS.volunteers, getVolunteers().filter(v => v.id !== id));
}

// ═══════ FUNDRAISING ═══════
export const getFundraising = () => get(KEYS.fundraising, DEFAULT_FUNDRAISING);
export function updateFundraising(changes) {
  set(KEYS.fundraising, { ...getFundraising(), ...changes });
}

// ═══════ IDSDC FACILITY SPACES ═══════
export const FACILITY_SPACES = [
  { id: 'observatory', name: 'Dark Sky Observatory', capacity: 30, color: '#4A7FBF' },
  { id: 'planetarium', name: 'Craig & Ruth Gimbel Planetarium', capacity: 65, color: '#7C6BAF' },
  { id: 'theater', name: 'Inspiration Theater', capacity: 150, color: '#C5A55A' },
  { id: 'exhibit-hall', name: 'Night Sky Exhibit Hall', capacity: null, color: '#3D8C6F' },
  { id: 'einstein', name: 'Einstein Exploration Station', capacity: null, color: '#D4943A' },
];

const DEFAULT_MOVEMENTS = {
  'INV013': [
    { date: '2026-03-11', type: 'Transfer', ref: 'TRF-0089', location: 'Gift Shop', change: 20, note: 'Transfer received' },
    { date: '2026-03-04', type: 'Received', ref: 'PO-0043', location: 'Warehouse', change: 100, note: 'PO received from Local Artisans' },
    { date: '2026-03-01', type: 'Sale', ref: 'ORD-2394', location: 'Gift Shop', change: -3, note: 'POS sale' },
  ],
  'INV007': [
    { date: '2026-03-11', type: 'Sale', ref: 'ORD-2399', location: 'Gift Shop', change: -1, note: 'POS sale' },
  ],
};

// ═══════ NONPROFIT SEED DATA ═══════

const DEFAULT_DONATIONS = [
  { id: 'DON-001', donor: 'Fountain Hills Community Foundation', email: 'grants@fhcf.org', amount: 500000, type: 'grant', campaign: 'Capital Campaign', date: '2026-01-15', taxDeductible: true, acknowledged: true, notes: 'Annual operating grant' },
  { id: 'DON-002', donor: 'Robert & Carol Thompson', email: 'rthompson@email.com', amount: 250000, type: 'one-time', campaign: 'Capital Campaign', date: '2026-02-01', taxDeductible: true, acknowledged: true, notes: 'Observatory naming rights contribution' },
  { id: 'DON-003', donor: 'Arizona Science Foundation', email: 'info@azscience.org', amount: 100000, type: 'grant', campaign: 'Education Fund', date: '2026-02-14', taxDeductible: true, acknowledged: true, notes: 'STEM education grant — Year 1 of 3' },
  { id: 'DON-004', donor: 'Michael & Susan Park', email: 'mpark@email.com', amount: 50000, type: 'recurring', campaign: 'General', date: '2026-02-28', taxDeductible: true, acknowledged: true, notes: 'Monthly $50,000 pledge — 2026' },
  { id: 'DON-005', donor: 'Desert Starlight LLC', email: 'info@desertstarlight.com', amount: 25000, type: 'one-time', campaign: 'Dark Sky Preservation', date: '2026-03-01', taxDeductible: true, acknowledged: false, notes: 'Corporate sponsorship — Spring Gala' },
  { id: 'DON-006', donor: 'Patricia Hernandez', email: 'phernandez@email.com', amount: 5000, type: 'one-time', campaign: 'General', date: '2026-03-05', taxDeductible: true, acknowledged: false, notes: 'Board member annual gift' },
  { id: 'DON-007', donor: 'Scottsdale Astronomy Club', email: 'treasurer@scottsdaleastro.org', amount: 2500, type: 'one-time', campaign: 'Education Fund', date: '2026-03-10', taxDeductible: true, acknowledged: false, notes: 'Club fundraiser proceeds' },
  { id: 'DON-008', donor: 'Anonymous', email: '', amount: 1000, type: 'one-time', campaign: 'General', date: '2026-03-12', taxDeductible: true, acknowledged: false, notes: 'Online donation' },
];

const DEFAULT_FUNDRAISING = {
  goal: 2900000000, // $29M in cents
  raised: 2720000000, // $27.2M in cents
};

const _today = new Date();
const _dayMs = 86400000;
const _weekday = (d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
const _dateStr = (d) => d.toISOString().slice(0,10);

const DEFAULT_FACILITY_BOOKINGS = (() => {
  const bookings = [];
  const spaces = ['observatory','planetarium','theater','exhibit-hall','einstein'];
  const names = [
    { org: 'Coconino Elementary', contact: 'Mrs. Rodriguez', type: 'field-trip', space: 'planetarium', time: '09:00', endTime: '11:00', attendees: 45 },
    { org: 'Flagstaff Middle School', contact: 'Mr. Chen', type: 'field-trip', space: 'exhibit-hall', time: '10:00', endTime: '14:00', attendees: 60 },
    { org: 'Scottsdale Astronomy Club', contact: 'Dr. Patel', type: 'community', space: 'observatory', time: '20:00', endTime: '23:00', attendees: 25 },
    { org: 'Desert Starlight LLC', contact: 'Sarah Kim', type: 'corporate', space: 'theater', time: '18:00', endTime: '21:00', attendees: 80 },
    { org: 'Martinez Wedding', contact: 'Elena Martinez', type: 'private', space: 'theater', time: '17:00', endTime: '22:00', attendees: 120 },
    { org: 'Public — Planetarium Show', contact: 'Staff', type: 'public', space: 'planetarium', time: '14:00', endTime: '15:00', attendees: 50 },
    { org: 'Prescott USD', contact: 'Dr. Patel', type: 'field-trip', space: 'einstein', time: '09:30', endTime: '12:30', attendees: 35 },
    { org: 'Public — Star Party', contact: 'Staff', type: 'public', space: 'observatory', time: '20:30', endTime: '23:30', attendees: 30 },
    { org: 'Arizona State University', contact: 'Prof. Williams', type: 'community', space: 'theater', time: '19:00', endTime: '21:00', attendees: 100 },
    { org: 'Maintenance', contact: 'Facilities', type: 'maintenance', space: 'planetarium', time: '08:00', endTime: '12:00', attendees: 0 },
    { org: 'Girl Scouts Troop 412', contact: 'Troop Leader Kim', type: 'field-trip', space: 'exhibit-hall', time: '13:00', endTime: '16:00', attendees: 20 },
    { org: 'Public — Night Hike', contact: 'Staff', type: 'public', space: 'observatory', time: '19:00', endTime: '21:00', attendees: 15 },
  ];
  names.forEach((n, i) => {
    const dayOffset = Math.floor(i / 2); // spread across this week
    const d = new Date(_today); d.setDate(d.getDate() + dayOffset);
    bookings.push({
      id: `FBK-${String(i+1).padStart(3,'0')}`,
      organization: n.org, contact: n.contact, email: `${n.contact.split(' ')[0].toLowerCase()}@email.com`,
      space: n.space, date: _dateStr(d), startTime: n.time, endTime: n.endTime,
      attendees: n.attendees, type: n.type,
      status: i < 8 ? 'Confirmed' : i < 10 ? 'Pending' : 'Tentative',
      notes: '',
    });
  });
  return bookings;
})();

const DEFAULT_VISITORS = (() => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(_today); d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const base = isWeekend ? 140 : 75;
    const total = base + Math.floor(Math.random() * 60);
    const members = Math.floor(total * (0.15 + Math.random() * 0.1));
    const children = Math.floor(total * (0.1 + Math.random() * 0.15));
    const groups = dow >= 1 && dow <= 5 ? Math.floor(Math.random() * 3) : 0;
    days.push({
      date: _dateStr(d), total, members, general: total - members - children,
      children, groups, peakHour: isWeekend ? '14:00' : '11:00',
    });
  }
  return days;
})();

const DEFAULT_VOLUNTEERS = [
  { id: 'VOL-001', name: 'Carlos Reyes', email: 'creyes@email.com', phone: '(480) 555-0101', role: 'Telescope Operator', status: 'Active', startDate: '2025-09-15', hoursThisMonth: 24, totalHours: 156, certifications: ['Telescope Operation', 'First Aid'], availability: ['Fri','Sat'], notes: 'Experienced amateur astronomer' },
  { id: 'VOL-002', name: 'Linda Foster', email: 'lfoster@email.com', phone: '(480) 555-0102', role: 'Greeter', status: 'Active', startDate: '2025-10-01', hoursThisMonth: 16, totalHours: 98, certifications: ['First Aid'], availability: ['Wed','Thu','Sat'], notes: 'Retired teacher, great with visitors' },
  { id: 'VOL-003', name: 'Kevin Nguyen', email: 'knguyen@email.com', phone: '(480) 555-0103', role: 'Education Assistant', status: 'Active', startDate: '2025-11-01', hoursThisMonth: 20, totalHours: 72, certifications: ['Background Check','CPR'], availability: ['Mon','Wed','Fri'], notes: 'ASU astronomy grad student' },
  { id: 'VOL-004', name: 'Diane Martinez', email: 'dmartinez@email.com', phone: '(480) 555-0104', role: 'Gift Shop Helper', status: 'Active', startDate: '2026-01-10', hoursThisMonth: 12, totalHours: 36, certifications: ['POS Training'], availability: ['Sat','Sun'], notes: 'Weekend availability only' },
  { id: 'VOL-005', name: 'Tom Bradley', email: 'tbradley@email.com', phone: '(480) 555-0105', role: 'Trail Guide', status: 'On Leave', startDate: '2025-10-15', hoursThisMonth: 0, totalHours: 110, certifications: ['Wilderness First Aid','Desert Ecology'], availability: ['Fri','Sat','Sun'], notes: 'On medical leave until April' },
  { id: 'VOL-006', name: 'Priya Sharma', email: 'psharma@email.com', phone: '(480) 555-0106', role: 'Event Support', status: 'Active', startDate: '2026-02-01', hoursThisMonth: 8, totalHours: 18, certifications: ['First Aid'], availability: ['Thu','Fri','Sat'], notes: 'New volunteer, eager and reliable' },
];

// ═══════ STAFF / PAYROLL SEED DATA ═══════
export const getStaff = () => get(KEYS.staff, []);
export const getTimesheets = () => get(KEYS.timesheets, []);
export const getPayrollHistory = () => get(KEYS.payrollHistory, []);
export const getVolunteerHours = () => get(KEYS.volunteerHours, []);
export const getVolunteerCheckins = () => get(KEYS.volunteerCheckins, []);
export function addVolunteerHour(entry) { const all = getVolunteerHours(); all.unshift({ id: genId('VH'), ...entry, date: entry.date || new Date().toISOString().slice(0,10) }); set(KEYS.volunteerHours, all); }
export function addVolunteerCheckin(entry) { const all = getVolunteerCheckins(); all.unshift({ id: genId('VC'), ...entry, timestamp: new Date().toISOString() }); set(KEYS.volunteerCheckins, all); }
export function updateTimesheets(data) { set(KEYS.timesheets, data); }
export function addPayrollRecord(record) { const all = getPayrollHistory(); all.unshift(record); set(KEYS.payrollHistory, all); }
export const getHeldSales = () => get(KEYS.heldSales, []);
export function addHeldSale(sale) { const all = getHeldSales(); all.unshift({ id: genId('HOLD'), ...sale, heldAt: new Date().toISOString() }); set(KEYS.heldSales, all); }
export function removeHeldSale(id) { set(KEYS.heldSales, getHeldSales().filter(s => s.id !== id)); }

const DEFAULT_STAFF = [
  { id: 'STF-001', name: 'Dr. J Herschel', role: 'Executive Director', department: 'Leadership', status: 'Active', hireDate: '2024-01-15', payType: 'Salary', payRate: null, email: 'drj@darkskycenter.org' },
  { id: 'STF-002', name: 'Tovah Marx', role: 'Gift Shop Manager', department: 'Operations', status: 'Active', hireDate: '2025-03-01', payType: 'Hourly', payRate: 1800, email: 'tovah@darkskycenter.org' },
  { id: 'STF-003', name: 'Josi Chen', role: 'Gift Shop Staff', department: 'Operations', status: 'Active', hireDate: '2025-06-15', payType: 'Hourly', payRate: 1500, email: 'josi@darkskycenter.org' },
  { id: 'STF-004', name: 'Maria Santos', role: 'Education Director', department: 'Programs', status: 'Active', hireDate: '2025-02-01', payType: 'Salary', payRate: null, email: 'maria@darkskycenter.org' },
  { id: 'STF-005', name: 'Alex Rivera', role: 'Social Media Manager', department: 'Marketing', status: 'Active', hireDate: '2025-04-01', payType: 'Hourly', payRate: 2000, email: 'alex@darkskycenter.org' },
  { id: 'STF-006', name: 'Sam Patel', role: 'Visitor Services', department: 'Front Desk', status: 'Active', hireDate: '2025-05-01', payType: 'Hourly', payRate: 1600, email: 'sam@darkskycenter.org' },
  { id: 'STF-007', name: 'Jordan Kim', role: 'Volunteer Coordinator', department: 'People', status: 'Active', hireDate: '2025-03-15', payType: 'Salary', payRate: null, email: 'jordan@darkskycenter.org' },
];

const DEFAULT_TIMESHEETS = [
  { staffId: 'STF-002', name: 'Tovah Marx', week: '2026-03-09', hours: [8,8,8,8,8,4,0], status: 'Pending' },
  { staffId: 'STF-003', name: 'Josi Chen', week: '2026-03-09', hours: [0,0,6,6,6,8,8], status: 'Pending' },
  { staffId: 'STF-005', name: 'Alex Rivera', week: '2026-03-09', hours: [8,8,8,8,0,0,0], status: 'Pending' },
  { staffId: 'STF-006', name: 'Sam Patel', week: '2026-03-09', hours: [0,8,8,8,8,8,0], status: 'Pending' },
];

const DEFAULT_PAYROLL = [
  { period: 'Mar 1-15, 2026', total: 892000, status: 'Pending', date: '2026-03-15' },
  { period: 'Feb 16-28, 2026', total: 856000, status: 'Paid', date: '2026-02-28', paidAt: '2026-03-01' },
  { period: 'Feb 1-15, 2026', total: 871000, status: 'Paid', date: '2026-02-15', paidAt: '2026-02-16' },
];

const DEFAULT_VOLUNTEER_HOURS = [
  { id: 'VH-001', volunteerId: 'VOL-001', name: 'Carlos Reyes', date: '2026-03-14', hours: 4, activity: 'Event Support', notes: 'Star Party setup and telescope operation' },
  { id: 'VH-002', volunteerId: 'VOL-002', name: 'Linda Foster', date: '2026-03-13', hours: 3, activity: 'Gift Shop', notes: 'Afternoon shift' },
  { id: 'VH-003', volunteerId: 'VOL-003', name: 'Kevin Nguyen', date: '2026-03-12', hours: 5, activity: 'Event Support', notes: 'School field trip assistance' },
  { id: 'VH-004', volunteerId: 'VOL-001', name: 'Carlos Reyes', date: '2026-03-10', hours: 4, activity: 'Event Support', notes: 'Telescope operation evening session' },
  { id: 'VH-005', volunteerId: 'VOL-004', name: 'Diane Martinez', date: '2026-03-09', hours: 6, activity: 'Gift Shop', notes: 'Weekend full shift' },
  { id: 'VH-006', volunteerId: 'VOL-006', name: 'Priya Sharma', date: '2026-03-08', hours: 4, activity: 'Setup/Teardown', notes: 'Event setup' },
  { id: 'VH-007', volunteerId: 'VOL-003', name: 'Kevin Nguyen', date: '2026-03-07', hours: 3, activity: 'Training', notes: 'Telescope certification module 3' },
  { id: 'VH-008', volunteerId: 'VOL-002', name: 'Linda Foster', date: '2026-03-06', hours: 4, activity: 'Gift Shop', notes: 'Midweek shift' },
  { id: 'VH-009', volunteerId: 'VOL-001', name: 'Carlos Reyes', date: '2026-03-05', hours: 4, activity: 'Event Support', notes: 'Astrophotography workshop' },
  { id: 'VH-010', volunteerId: 'VOL-004', name: 'Diane Martinez', date: '2026-03-02', hours: 6, activity: 'Gift Shop', notes: 'Weekend shift' },
];
