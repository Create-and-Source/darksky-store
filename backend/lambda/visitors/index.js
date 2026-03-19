const { scan, putItem, updateItem } = require('/opt/nodejs/dynamo.js');
const { ok, created, badRequest, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'visitors';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const date = pathParam(event, 'date');

  try {
    // GET /api/visitors
    if (method === 'GET') {
      const items = await scan(TABLE);
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      return ok(items);
    }

    // POST /api/visitors
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      if (!body.date) return badRequest('date is required');
      const item = {
        date: body.date,
        total: body.total ?? 0,
        members: body.members ?? 0,
        children: body.children ?? 0,
        groups: body.groups ?? 0,
      };
      await putItem(TABLE, item);
      return created(item);
    }

    // PUT /api/visitors/{date}
    if (method === 'PUT' && date) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const updated = await updateItem(TABLE, { date }, body);
      return ok(updated);
    }

    return badRequest('Unknown route');
  } catch (err) {
    return serverError(err);
  }
}
