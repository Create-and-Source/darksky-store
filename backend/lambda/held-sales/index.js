const { scan, putItem, deleteItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, noContent, badRequest, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'held_sales';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/held-sales
    if (method === 'GET') {
      const items = await scan(TABLE);
      return ok(items);
    }

    // POST /api/held-sales
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('HOLD'),
        createdAt: new Date().toISOString(),
      };
      await putItem(TABLE, item);
      return created(item);
    }

    // DELETE /api/held-sales/{id}
    if (method === 'DELETE' && id) {
      await deleteItem(TABLE, { id });
      return noContent();
    }
  } catch (err) {
    return serverError(err);
  }
}
