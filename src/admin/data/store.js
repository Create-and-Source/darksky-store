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
export function initStore() {
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
