const { getItem, updateItem } = require('/opt/nodejs/dynamo.js');
const { ok, badRequest, serverError, parseBody } = require('/opt/nodejs/response.js');

const TABLE = 'announcement';
const PK = { id: 'main' };
const DEFAULT = { id: 'main', text: '', active: false };

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;

  try {
    // GET /api/announcement
    if (method === 'GET') {
      const item = await getItem(TABLE, PK);
      return ok(item || DEFAULT);
    }

    // PUT /api/announcement
    if (method === 'PUT') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      await updateItem(TABLE, PK, body);
      return ok({ ...PK, ...body });
    }
  } catch (err) {
    return serverError(err);
  }
}
