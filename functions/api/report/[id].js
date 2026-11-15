// GET /api/report/:id  ->  only what the report page needs to display (no email, no transcript).
import { json, validId } from '../../../src/util.js';
import { getSubmission } from '../../../src/db.js';

export async function onRequestGet({ params, env }) {
  if (!validId(params.id)) return json({ error: 'not_found' }, 404);
  try {
    const row = await getSubmission(env, params.id, 'name,market,flags,report,interest');
    if (!row) return json({ error: 'not_found' }, 404);
    return json({ name: row.name, market: row.market, flags: row.flags || [], report: row.report, interest: !!row.interest });
  } catch (e) { console.error(e); return json({ error: 'unavailable' }, 502); }
}
