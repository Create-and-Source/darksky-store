const { scan, putItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, badRequest, serverError, parseBody } = require('/opt/nodejs/response.js');

const TABLE = 'contacts';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;

  try {
    // GET /api/contacts
    if (method === 'GET') {
      const items = await scan(TABLE);
      return ok(items);
    }

    // POST /api/contacts
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('CON'),
        createdAt: new Date().toISOString(),
      };
      await putItem(TABLE, item);
      return created(item);
    }
  } catch (err) {
    return serverError(err);
  }
}
