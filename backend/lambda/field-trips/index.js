const { getItem, scan, putItem, updateItem, deleteItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, noContent, badRequest, notFound, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'field_trips';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/field-trips
    if (method === 'GET' && !id) {
      const items = await scan(TABLE);
      items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      return ok(items);
    }

    // GET /api/field-trips/{id}
    if (method === 'GET' && id) {
      const item = await getItem(TABLE, { id });
      if (!item) return notFound('Field trip not found');
      return ok(item);
    }

    // POST /api/field-trips
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('FT'),
        createdAt: new Date().toISOString(),
      };
      await putItem(TABLE, item);
      return created(item);
    }

    // PUT /api/field-trips/{id}
    if (method === 'PUT' && id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      await updateItem(TABLE, { id }, body);
      return ok({ id, ...body });
    }

    // DELETE /api/field-trips/{id}
    if (method === 'DELETE' && id) {
      await deleteItem(TABLE, { id });
      return noContent();
    }
  } catch (err) {
    return serverError(err);
  }
}
