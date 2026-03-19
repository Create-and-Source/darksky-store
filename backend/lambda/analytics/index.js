// ══════════════════════════════════════════
// DARK SKY — ANALYTICS LAMBDA HANDLER
// GET /api/analytics/dashboard
// GET /api/analytics/velocity
// GET /api/analytics/reorder
// ══════════════════════════════════════════

const { getItem, scan, query, genId } = require('/opt/nodejs/dynamo');
const { ok, serverError, parseBody, queryParam } = require('/opt/nodejs/response');

// Tables
const T = {
  orders:    'orders',
  inventory: 'inventory',
  events:    'events',
  members:   'members',
  donations: 'donations',
  visitors:  'visitors',
};

// ── ROUTE DISPATCH ──────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';

  try {
    if (path.endsWith('/dashboard')) return await getDashboard();
    if (path.endsWith('/velocity'))  return await getVelocity();
    if (path.endsWith('/reorder'))   return await getReorder();

    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    console.error('[analytics]', err);
    return serverError(err);
  }
};

// ── GET /api/analytics/dashboard ────────────────────────────────────────────
// Returns aggregated KPIs for the admin dashboard.

async function getDashboard() {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const [orders, members, donations, visitors, events] = await Promise.all([
    scan(T.orders),
    scan(T.members),
    scan(T.donations),
    scan(T.visitors),
    scan(T.events),
  ]);

  // Total order count
  const totalOrders = orders.length;

  // Revenue: sum order.total (stored in cents)
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Active members
  const activeMembers = members.filter((m) => m.status === 'Active').length;

  // Donation total (cents)
  const totalDonations = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // Today's visitor count — find the record whose `date` matches today
  const todayRecord = visitors.find((v) => v.date === today);
  const todayVisitors = todayRecord ? Number(todayRecord.total) || 0 : 0;

  // Upcoming published events (date string >= today)
  const upcomingEvents = events.filter(
    (e) => e.status === 'Published' && e.date >= today
  ).length;

  return ok({
    totalOrders,
    totalRevenue,
    activeMembers,
    totalDonations,
    todayVisitors,
    upcomingEvents,
  });
}

// ── GET /api/analytics/velocity ─────────────────────────────────────────────
// Returns per-product sales velocity over the last 30 days.

async function getVelocity() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffISO = cutoff.toISOString();

  const [inventoryItems, orders] = await Promise.all([
    scan(T.inventory),
    scan(T.orders),
  ]);

  // Only look at orders placed in the last 30 days
  const recentOrders = orders.filter((o) => {
    const created = o.createdAt || o.date || '';
    return created >= cutoffISO;
  });

  // Count sold units per product id
  const soldMap = {}; // productId → units sold

  for (const order of recentOrders) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const pid = item.productId || item.id;
      if (!pid) continue;
      soldMap[pid] = (soldMap[pid] || 0) + (Number(item.qty) || Number(item.quantity) || 1);
    }
  }

  // Build result array from inventory master list
  const result = inventoryItems.map((inv) => {
    const soldLast30 = soldMap[inv.id] || 0;
    const avgPerWeek = Math.round((soldLast30 / 30) * 7 * 10) / 10; // 1 decimal
    return {
      productId:   inv.id,
      name:        inv.name || inv.title || inv.id,
      soldLast30,
      avgPerWeek,
    };
  });

  // Sort descending by units sold
  result.sort((a, b) => b.soldLast30 - a.soldLast30);

  return ok(result);
}

// ── GET /api/analytics/reorder ───────────────────────────────────────────────
// Returns inventory items that need reordering (below reorder point).

async function getReorder() {
  const DEFAULT_REORDER_POINT = 10;

  const inventoryItems = await scan(T.inventory);

  const needsReorder = inventoryItems
    .map((inv) => {
      const giftshop  = Number(inv.giftshop)      || 0;
      const warehouse = Number(inv.warehouse)      || 0;
      const reorderPoint = Number(inv.reorderPoint) || DEFAULT_REORDER_POINT;
      const currentStock = giftshop + warehouse;
      const deficit = reorderPoint - currentStock;

      return {
        id:           inv.id,
        name:         inv.name || inv.title || inv.id,
        sku:          inv.sku || '',
        currentStock,
        reorderPoint,
        deficit,
      };
    })
    .filter((item) => item.deficit > 0);

  // Sort by largest deficit first
  needsReorder.sort((a, b) => b.deficit - a.deficit);

  return ok(needsReorder);
}
