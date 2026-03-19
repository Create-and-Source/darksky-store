const { getItem, scan, putItem, updateItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, badRequest, notFound, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'orders';
const INVENTORY = 'inventory';
const MOVEMENTS = 'movement_history';

async function adjustStock(productId, delta, ref) {
  const item = await getItem(INVENTORY, { id: productId });
  if (!item) return;
  const current = item.giftshop || 0;
  const newQty = Math.max(0, current + delta);
  item.giftshop = newQty;
  await putItem(INVENTORY, item);
  const timestamp = new Date().toISOString();
  await putItem(MOVEMENTS, {
    productId,
    timestamp,
    delta,
    location: 'giftshop',
    ref: ref || null,
    note: 'order fulfillment',
    newQty,
  });
}

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/orders
    if (method === 'GET' && !id) {
      const items = await scan(TABLE);
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return ok(items);
    }

    // GET /api/orders/{id}
    if (method === 'GET' && id) {
      const item = await getItem(TABLE, { id });
      if (!item) return notFound('Order not found');
      return ok(item);
    }

    // POST /api/orders
    if (method === 'POST' && !id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');

      const orderId = genId('ORD');
      const order = {
        ...body,
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      if (Array.isArray(order.items)) {
        for (const lineItem of order.items) {
          if (lineItem.productId && lineItem.qty) {
            await adjustStock(lineItem.productId, -lineItem.qty, orderId);
          }
        }
      }

      await putItem(TABLE, order);
      return created(order);
    }

    // PUT /api/orders/{id}
    if (method === 'PUT' && id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      await updateItem(TABLE, { id }, body);
      return ok({ id, ...body });
    }
  } catch (err) {
    return serverError(err);
  }
}
