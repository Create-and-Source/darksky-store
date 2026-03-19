const { scan, query, putItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, badRequest, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'members';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const path = event.rawPath || '';

  try {
    // GET /api/members/check/{email}
    if (method === 'GET' && path.includes('/check/')) {
      const email = pathParam(event, 'email');
      if (!email) return badRequest('Email path parameter required');

      const results = await query(
        TABLE,
        'byEmail',
        'email = :email',
        { ':email': decodeURIComponent(email) }
      );

      const member = results && results.length > 0 ? results[0] : null;
      return ok({ isMember: !!member, member });
    }

    // GET /api/members
    if (method === 'GET') {
      const items = await scan(TABLE);
      return ok(items);
    }

    // POST /api/members
    if (method === 'POST') {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');

      const item = {
        ...body,
        id: genId('MEM'),
        joinDate: new Date().toISOString().slice(0, 10),
      };
      await putItem(TABLE, item);
      return created(item);
    }
  } catch (err) {
    return serverError(err);
  }
}
