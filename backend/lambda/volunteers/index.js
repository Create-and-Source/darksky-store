const { getItem, scan, putItem, updateItem, deleteItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, noContent, badRequest, notFound, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'volunteers';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/volunteers/{id}
    if (method === 'GET' && id) {
      const item = await getItem(TABLE, { id });
      if (!item) return notFound('Volunteer not found');
      return ok(item);
    }

    // GET /api/volunteers
    if (method === 'GET') {
      const items = await scan(TABLE);
      return ok(items);
    }

    // POST /api/volunteers
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = { ...body, id: genId('VOL') };
      await putItem(TABLE, item);
      return created(item);
    }

    // PUT /api/volunteers/{id}
    if (method === 'PUT' && id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const updated = await updateItem(TABLE, { id }, body);
      return ok(updated);
    }

    // DELETE /api/volunteers/{id}
    if (method === 'DELETE' && id) {
      await deleteItem(TABLE, { id });
      return noContent();
    }

    return badRequest('Unknown route');
  } catch (err) {
    return serverError(err);
  }
}
