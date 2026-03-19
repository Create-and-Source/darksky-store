const { getItem, scan } = require('/opt/nodejs/dynamo.js');
const { ok, notFound, serverError, pathParam } = require('/opt/nodejs/response.js');

const TABLE = 'products';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const id = pathParam(event, 'id');

  try {
    if (method === 'GET' && id) {
      const item = await getItem(TABLE, { id });
      if (!item) return notFound('Product not found');
      return ok(item);
    }

    if (method === 'GET') {
      const items = await scan(TABLE);
      return ok(items);
    }
  } catch (err) {
    return serverError(err);
  }
}
