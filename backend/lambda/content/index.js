const { scan, putItem } = require('/opt/nodejs/dynamo.js');
const { ok, badRequest, serverError, parseBody, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'content';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const page = pathParam(event, 'page');

  try {
    // GET /api/content — return all pages as an object keyed by page name
    if (method === 'GET') {
      const items = await scan(TABLE);
      const result = {};
      for (const item of items) {
        const { page: pageName, ...rest } = item;
        result[pageName] = rest;
      }
      return ok(result);
    }

    // PUT /api/content/{page}
    if (method === 'PUT' && page) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = { ...body, page };
      await putItem(TABLE, item);
      return ok(item);
    }
  } catch (err) {
    return serverError(err);
  }
}
