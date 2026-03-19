const { getItem, scan, putItem, updateItem, deleteItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, noContent, badRequest, notFound, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'purchase_orders';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/purchase-orders
    if (method === 'GET' && !id) {
      const items = await scan(TABLE);
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return ok(items);
    }

    // GET /api/purchase-orders/{id}
    if (method === 'GET' && id) {
      const item = await getItem(TABLE, { id });
      if (!item) return notFound('Purchase order not found');
      return ok(item);
    }

    // POST /api/purchase-orders
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('PO'),
        createdAt: new Date().toISOString(),
        status: 'draft',
      };
      await putItem(TABLE, item);
      return created(item);
    }

    // PUT /api/purchase-orders/{id}
    if (method === 'PUT' && id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      await updateItem(TABLE, { id }, body);
      return ok({ id, ...body });
    }

    // DELETE /api/purchase-orders/{id}
    if (method === 'DELETE' && id) {
      await deleteItem(TABLE, { id });
      return noContent();
    }
  } catch (err) {
    return serverError(err);
  }
}
