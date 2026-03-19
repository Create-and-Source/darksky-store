const { getItem, scan, putItem, updateItem, deleteItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, noContent, badRequest, notFound, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const DONATIONS_TABLE = 'donations';
const FUNDRAISING_TABLE = 'fundraising';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    // GET /api/donations/{id}
    if (method === 'GET' && id) {
      const item = await getItem(DONATIONS_TABLE, { id });
      if (!item) return notFound('Donation not found');
      return ok(item);
    }

    // GET /api/donations
    if (method === 'GET') {
      const [donations, fundraising] = await Promise.all([
        scan(DONATIONS_TABLE),
        getItem(FUNDRAISING_TABLE, { id: 'main' }),
      ]);
      donations.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return ok({ donations, fundraising: fundraising || null });
    }

    // POST /api/donations
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const donation = {
        ...body,
        id: genId('DON'),
        createdAt: new Date().toISOString(),
      };
      await putItem(DONATIONS_TABLE, donation);

      const fundraising = await getItem(FUNDRAISING_TABLE, { id: 'main' });
      const currentRaised = fundraising?.raised || 0;
      const amountCents = Number(donation.amount) || 0;
      await updateItem(FUNDRAISING_TABLE, { id: 'main' }, { raised: currentRaised + amountCents });

      return created(donation);
    }

    // PUT /api/donations/{id}
    if (method === 'PUT' && id) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const updated = await updateItem(DONATIONS_TABLE, { id }, body);
      return ok(updated);
    }

    // DELETE /api/donations/{id}
    if (method === 'DELETE' && id) {
      await deleteItem(DONATIONS_TABLE, { id });
      return noContent();
    }

    return badRequest('Unknown route');
  } catch (err) {
    return serverError(err);
  }
}
