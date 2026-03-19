const { scan, putItem, genId } = require('/opt/nodejs/dynamo.js');
const { ok, created, badRequest, serverError, parseBody } = require('/opt/nodejs/response.js');

const STAFF_TABLE = 'staff';
const TIMESHEETS_TABLE = 'timesheets';
const PAYROLL_TABLE = 'payroll_history';

module.exports.handler = async function handler(event) {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path || '';

  try {
    // POST /api/staff/timesheet
    if (method === 'POST' && path.includes('/timesheet')) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('TS'),
        createdAt: new Date().toISOString(),
      };
      await putItem(TIMESHEETS_TABLE, item);
      return created(item);
    }

    // POST /api/staff/payroll
    if (method === 'POST' && path.includes('/payroll')) {
      const body = parseBody(event);
      if (!body) return badRequest('Request body required');
      const item = {
        ...body,
        id: genId('PAY'),
        createdAt: new Date().toISOString(),
      };
      await putItem(PAYROLL_TABLE, item);
      return created(item);
    }

    // GET /api/staff
    if (method === 'GET') {
      const [staff, timesheets, payroll] = await Promise.all([
        scan(STAFF_TABLE),
        scan(TIMESHEETS_TABLE),
        scan(PAYROLL_TABLE),
      ]);
      return ok({ staff, timesheets, payroll });
    }

    return badRequest('Unknown route');
  } catch (err) {
    return serverError(err);
  }
}
