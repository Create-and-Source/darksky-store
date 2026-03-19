const { getItem, scan, query, putItem, updateItem, deleteItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, noContent, badRequest, notFound, serverError, parseBody, pathParam, queryParam } = require('/opt/nodejs/response.js');

const TABLE = 'facility_bookings';
const BY_SPACE_INDEX = 'bySpace';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/facility/{id}
    if (method === 'GET' && id) {
      const item = await getItem(TABLE, { id });
      if (!item) return notFound('Booking not found');
      return ok(item);
    }

    // GET /api/facility
    if (method === 'GET') {
      const space = queryParam(event, 'space');
      let items;
      if (space) {
        items = await query(
          TABLE,
          BY_SPACE_INDEX,
          'space = :space',
          { ':space': space }
        );
      } else {
        items = await scan(TABLE);
      }
      items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      return ok(items);
    }

    // POST /api/facility
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('FB'),
        createdAt: new Date().toISOString(),
      };
      await putItem(TABLE, item);
      return created(item);
    }

    // PUT /api/facility/{id}
    if (method === 'PUT' && id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const updated = await updateItem(TABLE, { id }, body);
      return ok(updated);
    }

    // DELETE /api/facility/{id}
    if (method === 'DELETE' && id) {
      await deleteItem(TABLE, { id });
      return noContent();
    }

    return badRequest('Unknown route');
  } catch (err) {
    return serverError(err);
  }
}
