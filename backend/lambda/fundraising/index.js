const { getItem, updateItem } = require('/opt/nodejs/dynamo.js');
const { ok, badRequest, notFound, serverError, parseBody } = require('/opt/nodejs/response.js');

const TABLE = 'fundraising';
const MAIN_KEY = { id: 'main' };

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;

  try {
    // GET /api/fundraising
    if (method === 'GET') {
      const item = await getItem(TABLE, MAIN_KEY);
      if (!item) return notFound('Fundraising record not found');
      return ok(item);
    }

    // PUT /api/fundraising
    if (method === 'PUT') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const updated = await updateItem(TABLE, MAIN_KEY, body);
      return ok(updated);
    }

    return badRequest('Unknown route');
  } catch (err) {
    return serverError(err);
  }
}
