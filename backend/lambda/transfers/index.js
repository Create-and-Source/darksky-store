const { scan, putItem, updateItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, badRequest, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'transfers';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/transfers
    if (method === 'GET') {
      const items = await scan(TABLE);
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return ok(items);
    }

    // POST /api/transfers
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('TRF'),
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      await putItem(TABLE, item);
      return created(item);
    }

    // PUT /api/transfers/{id}
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
