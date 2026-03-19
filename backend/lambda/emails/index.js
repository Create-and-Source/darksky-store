const { scan, putItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, badRequest, serverError, parseBody } = require('/opt/nodejs/response.js');

const TABLE = 'emails';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;

  try {
    // GET /api/emails
    if (method === 'GET') {
      const items = await scan(TABLE);
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return ok(items);
    }

    // POST /api/emails
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('EML'),
        createdAt: new Date().toISOString(),
        status: 'sent',
      };
      await putItem(TABLE, item);
      return created(item);
    }
  } catch (err) {
    return serverError(err);
  }
}
