// ══════════════════════════════════════════════════════════════════════════════
// DARK SKY — FRONTEND API CLIENT
// Mirrors the store.js interface but calls the AWS API instead of localStorage.
// Drop-in replacement: same function names, same signatures, all async.
// ══════════════════════════════════════════════════════════════════════════════

const API = import.meta.env.VITE_API_URL || '';

// ── CORE REQUEST ─────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = localStorage.getItem('ds_auth_token');
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const get  = (path)        => request(path);
const post = (path, body)  => request(path, { method: 'POST',   body: JSON.stringify(body) });
const put  = (path, body)  => request(path, { method: 'PUT',    body: JSON.stringify(body) });
const del  = (path)        => request(path, { method: 'DELETE' });

// ── INIT / SUBSCRIBE (no-ops — backend handles seeding) ──────────────────────

/** No-op: the backend handles data seeding. */
export async function initStore() {}

/**
 * No-op subscribe: returns an unsubscribe function.
 * The frontend should re-fetch data as needed rather than relying on
 * localStorage reactivity.
 */
export const subscribe = (_fn) => () => {};

// ── PRODUCTS ──────────────────────────────────────────────────────────────────

export const getProducts = () => get('/api/products');

// ── INVENTORY ─────────────────────────────────────────────────────────────────

export const getInventory    = ()                              => get('/api/inventory');
export const getProduct      = (id)                            => get(`/api/inventory/${id}`);
export const updateInventory = (id, changes)                   => put(`/api/inventory/${id}`, changes);
export const adjustStock     = (id, location, delta, ref, note) =>
  post('/api/inventory/adjust', { id, location, delta, ref, note });
export const receiveStock    = (items, location, notes)        =>
  post('/api/inventory/receive', { items, location, notes });

// ── MOVEMENT HISTORY ──────────────────────────────────────────────────────────
// Query param: /api/inventory/movements?productId=X

export const getMovements = (productId) =>
  get(`/api/inventory/movements?productId=${encodeURIComponent(productId)}`);

// ── ORDERS ────────────────────────────────────────────────────────────────────

export const getOrders  = ()           => get('/api/orders');
export const getOrder   = (id)         => get(`/api/orders/${id}`);
export const addOrder   = (order)      => post('/api/orders', order);
export const updateOrder = (id, changes) => put(`/api/orders/${id}`, changes);

// ── PURCHASE ORDERS ───────────────────────────────────────────────────────────

export const getPurchaseOrders    = ()           => get('/api/purchase-orders');
export const getPO                = (id)         => get(`/api/purchase-orders/${id}`);
export const addPurchaseOrder     = (po)         => post('/api/purchase-orders', po);
export const updatePurchaseOrder  = (id, changes) => put(`/api/purchase-orders/${id}`, changes);
export const deletePurchaseOrder  = (id)         => del(`/api/purchase-orders/${id}`);

// ── TRANSFERS ─────────────────────────────────────────────────────────────────

export const getTransfers  = ()              => get('/api/transfers');
export const addTransfer   = (transfer)      => post('/api/transfers', transfer);
export const updateTransfer = (id, changes)  => put(`/api/transfers/${id}`, changes);

// ── EVENTS ────────────────────────────────────────────────────────────────────

export const getEvents  = ()              => get('/api/events');
export const getEvent   = (id)            => get(`/api/events/${id}`);
export const addEvent   = (event)         => post('/api/events', event);
export const updateEvent = (id, changes)  => put(`/api/events/${id}`, changes);
export const deleteEvent = (id)           => del(`/api/events/${id}`);

// ── RESERVATIONS ──────────────────────────────────────────────────────────────

export const getReservations = ()    => get('/api/reservations');
export const addReservation  = (res) => post('/api/reservations', res);

// ── EMAILS ────────────────────────────────────────────────────────────────────

export const getEmails = ()      => get('/api/emails');
export const addEmail  = (email) => post('/api/emails', email);

// ── CONTENT (CMS) ─────────────────────────────────────────────────────────────

export const getContent    = ()            => get('/api/content');
export const updateContent = (page, data)  => put('/api/content', { page, data });

// ── ANNOUNCEMENT BAR ──────────────────────────────────────────────────────────

export const getAnnouncement    = ()     => get('/api/announcement');
export const updateAnnouncement = (data) => put('/api/announcement', data);

// ── POS CART ──────────────────────────────────────────────────────────────────

export const getCart        = ()                 => get('/api/cart');
export const addToCart      = (product)          => post('/api/cart', product);
export const updateCartQty  = (cartId, qty)      => put(`/api/cart/${cartId}`, { qty });
export const removeFromCart = (cartId)           => del(`/api/cart/${cartId}`);
export const clearCart      = ()                 => del('/api/cart');

// ── MEMBERS ───────────────────────────────────────────────────────────────────

export const getMembers = ()       => get('/api/members');
export const addMember  = (member) => post('/api/members', member);
export const isMember   = async (email) => {
  const members = await getMembers();
  return Array.isArray(members)
    ? members.some((m) => m.email === email && m.status === 'Active')
    : false;
};

// ── INQUIRIES ─────────────────────────────────────────────────────────────────

export const getInquiries = ()    => get('/api/inquiries');
export const addInquiry   = (inq) => post('/api/inquiries', inq);

// ── CONTACTS ──────────────────────────────────────────────────────────────────

export const getContacts = ()         => get('/api/contacts');
export const addContact  = (contact)  => post('/api/contacts', contact);

// ── DONATIONS ─────────────────────────────────────────────────────────────────

export const getDonations  = ()              => get('/api/donations');
export const getDonation   = (id)            => get(`/api/donations/${id}`);
export const addDonation   = (donation)      => post('/api/donations', donation);
export const updateDonation = (id, changes)  => put(`/api/donations/${id}`, changes);
export const deleteDonation = (id)           => del(`/api/donations/${id}`);

// ── FACILITY BOOKINGS ─────────────────────────────────────────────────────────

export const getFacilityBookings    = ()              => get('/api/facility');
export const getFacilityBooking     = (id)            => get(`/api/facility/${id}`);
export const addFacilityBooking     = (booking)       => post('/api/facility', booking);
export const updateFacilityBooking  = (id, changes)   => put(`/api/facility/${id}`, changes);
export const deleteFacilityBooking  = (id)            => del(`/api/facility/${id}`);

// ── VISITORS ──────────────────────────────────────────────────────────────────

export const getVisitors    = ()              => get('/api/visitors');
export const addVisitorDay  = (day)           => post('/api/visitors', day);
export const updateVisitorDay = (date, changes) =>
  put(`/api/visitors/${encodeURIComponent(date)}`, changes);

// ── VOLUNTEERS ────────────────────────────────────────────────────────────────

export const getVolunteers    = ()              => get('/api/volunteers');
export const getVolunteer     = (id)            => get(`/api/volunteers/${id}`);
export const addVolunteer     = (vol)           => post('/api/volunteers', vol);
export const updateVolunteer  = (id, changes)   => put(`/api/volunteers/${id}`, changes);
export const deleteVolunteer  = (id)            => del(`/api/volunteers/${id}`);

// ── FUNDRAISING ───────────────────────────────────────────────────────────────

export const getFundraising    = ()       => get('/api/fundraising');
export const updateFundraising = (changes) => put('/api/fundraising', changes);

// ── STAFF / PAYROLL ───────────────────────────────────────────────────────────

export const getStaff          = ()         => get('/api/staff');
export const getTimesheets     = ()         => get('/api/timesheets');
export const getPayrollHistory = ()         => get('/api/payroll');
export const updateTimesheets  = (data)     => post('/api/timesheets', data);
export const addPayrollRecord  = (record)   => post('/api/payroll', record);

// ── FIELD TRIPS ───────────────────────────────────────────────────────────────

export const getFieldTrips    = ()              => get('/api/field-trips');
export const addFieldTrip     = (trip)          => post('/api/field-trips', trip);
export const updateFieldTrip  = (id, changes)   => put(`/api/field-trips/${id}`, changes);
export const deleteFieldTrip  = (id)            => del(`/api/field-trips/${id}`);

// ── MESSAGES ──────────────────────────────────────────────────────────────────

export const getMessages = ()    => get('/api/messages');
export const addMessage  = (msg) => post('/api/messages', msg);

// ── HELD SALES (POS) ──────────────────────────────────────────────────────────

export const getHeldSales   = ()     => get('/api/held-sales');
export const addHeldSale    = (sale) => post('/api/held-sales', sale);
export const removeHeldSale = (id)   => del(`/api/held-sales/${id}`);

// ── ANALYTICS ─────────────────────────────────────────────────────────────────

export const getDashboardStats     = () => get('/api/analytics/dashboard');
export const getSalesVelocity      = () => get('/api/analytics/velocity');
export const getReorderSuggestions = () => get('/api/analytics/reorder');

// ── CLIENT-SIDE HELPERS ───────────────────────────────────────────────────────

/** Format cents as a dollar string: 1999 → "$19.99" */
export const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;
