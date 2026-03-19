const { scan, putItem, updateItem, deleteItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, noContent, badRequest, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'cart';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/cart
    if (method === 'GET') {
      const items = await scan(TABLE);
      return ok(items);
    }

    // POST /api/cart
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('CART'),
      };
      await putItem(TABLE, item);
      return created(item);
    }

    // PUT /api/cart/{id}
    if (method === 'PUT' && id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      await updateItem(TABLE, { id }, body);
      return ok({ id, ...body });
    }

    // DELETE /api/cart/{id} — remove single item
    if (method === 'DELETE' && id) {
      await deleteItem(TABLE, { id });
      return noContent();
    }

    // DELETE /api/cart — clear entire cart
    if (method === 'DELETE' && !id) {
      const items = await scan(TABLE);
      await Promise.all(items.map(item => deleteItem(TABLE, { id: item.id })));
      return noContent();
    }
  } catch (err) {
    return serverError(err);
  }
}
