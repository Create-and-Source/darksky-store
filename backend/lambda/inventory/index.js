const { getItem, scan, putItem, updateItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, badRequest, notFound, serverError, parseBody, pathParam, queryParam } = require('/opt/nodejs/response.js');

const TABLE = 'inventory';
const MOVEMENTS = 'movement_history';

async function addMovement(productId, delta, location, ref, note, newQty) {
  const timestamp = new Date().toISOString();
  await putItem(MOVEMENTS, { productId, timestamp, delta, location, ref: ref || null, note: note || null, newQty });
}

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const path = event.rawPath || '';
  const id = pathParam(event, 'id');

  try {
    // GET /api/inventory
    if (method === 'GET' && !id) {
      const items = await scan(TABLE);
      const productId = queryParam(event, 'productId');
      if (productId) {
        const movements = await scan(
          MOVEMENTS,
          '#pid = :pid',
          { ':pid': productId },
          { '#pid': 'productId' }
        );
        return ok({ items, movements });
      }
      return ok(items);
    }

    // PUT /api/inventory/{id}
    if (method === 'PUT' && id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      await updateItem(TABLE, { id }, body);
      return ok({ id, ...body });
    }

    // POST /api/inventory/adjust
    if (method === 'POST' && path.endsWith('/adjust')) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const { id: itemId, location, delta, ref, note } = body;
      if (!itemId || !location || delta === undefined) return badRequest('id, location, and delta are required');

      const item = await getItem(TABLE, { id: itemId });
      if (!item) return notFound('Inventory item not found');

      const current = item[location] || 0;
      const newQty = current + delta;
      item[location] = newQty;
      await putItem(TABLE, item);
      await addMovement(itemId, delta, location, ref, note, newQty);

      return ok({ id: itemId, location, newQty });
    }

    // POST /api/inventory/receive
    if (method === 'POST' && path.endsWith('/receive')) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const { items, location, notes } = body;
      if (!items || !Array.isArray(items) || !location) return badRequest('items array and location are required');

      const results = [];
      for (const { id: itemId, qty } of items) {
        const item = await getItem(TABLE, { id: itemId });
        if (!item) {
          results.push({ id: itemId, error: 'Not found' });
          continue;
        }
        const current = item[location] || 0;
        const newQty = current + qty;
        item[location] = newQty;
        await putItem(TABLE, item);
        await addMovement(itemId, qty, location, 'receive', notes || null, newQty);
        results.push({ id: itemId, newQty });
      }

      return ok({ results });
    }
  } catch (err) {
    return serverError(err);
  }
}
