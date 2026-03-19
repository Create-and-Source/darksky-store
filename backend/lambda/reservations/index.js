const { getItem, scan, query, putItem, updateItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, badRequest, notFound, serverError, parseBody, queryParam } = require('/opt/nodejs/response.js');

const TABLE = 'reservations';
const EVENTS = 'events';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;

  try {
    // GET /api/reservations
    if (method === 'GET') {
      const eventId = queryParam(event, 'eventId');
      if (eventId) {
        const items = await query(
          TABLE,
          'byEvent',
          'eventId = :eid',
          { ':eid': eventId }
        );
        return ok(items);
      }
      const items = await scan(TABLE);
      return ok(items);
    }

    // POST /api/reservations
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const { eventId, eventTitle, name, email, qty } = body;
      if (!eventId || !name || !email || !qty) return badRequest('eventId, name, email, and qty are required');

      const reservation = {
        id: genId('RES'),
        eventId,
        eventTitle: eventTitle || null,
        name,
        email,
        qty,
        createdAt: new Date().toISOString(),
      };
      await putItem(TABLE, reservation);

      const evt = await getItem(EVENTS, { id: eventId });
      if (evt) {
        const newTicketsSold = (evt.ticketsSold || 0) + qty;
        await updateItem(EVENTS, { id: eventId }, { ticketsSold: newTicketsSold });
      }

      return created(reservation);
    }
  } catch (err) {
    return serverError(err);
  }
}
