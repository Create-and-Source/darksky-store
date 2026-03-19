const { getItem, scan, putItem, updateItem, deleteItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, noContent, badRequest, notFound, serverError, parseBody, pathParam, queryParam } = require('/opt/nodejs/response.js');

const TABLE = 'events';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/events
    if (method === 'GET' && !id) {
      let items = await scan(TABLE);
      const status = queryParam(event, 'status');
      if (status) {
        items = items.filter(e => e.status === status);
      }
      items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      return ok(items);
    }

    // GET /api/events/{id}
    if (method === 'GET' && id) {
      const item = await getItem(TABLE, { id });
      if (!item) return notFound('Event not found');
      return ok(item);
    }

    // POST /api/events
    if (method === 'POST' && !id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('EVT'),
        createdAt: new Date().toISOString(),
      };
      await putItem(TABLE, item);
      return created(item);
    }

    // PUT /api/events/{id}
    if (method === 'PUT' && id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      await updateItem(TABLE, { id }, body);
      return ok({ id, ...body });
    }

    // DELETE /api/events/{id}
    if (method === 'DELETE' && id) {
      await deleteItem(TABLE, { id });
      return noContent();
    }
  } catch (err) {
    return serverError(err);
  }
}
