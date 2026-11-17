// POST /api/resend  { id }  (header X-Session)
// Sends the Starting Position email again when the first attempt did not.
import { json, checkSession, validId } from '../../src/util.js';
import { reportEmail, sendEmail } from '../../src/email.js';
import { getSubmission, updateSubmission } from '../../src/db.js';

export async function onRequestPost({ request, env }) {
  if (!(await checkSession(env, request.headers.get('X-Session')))) return json({ error: 'session_expired' }, 401);
  let b = {};
  try { b = await request.json(); } catch {}
  if (!validId(b.id)) return json({ error: 'bad_request' }, 400);
  let row;
  try { row = await getSubmission(env, b.id, 'id,name,email'); } catch { return json({ error: 'unavailable' }, 502); }
  if (!row?.email) return json({ error: 'not_found' }, 404);
  const site = env.SITE_URL || new URL(request.url).origin;
  const reportUrl = `${site}/r/${row.id}`;
  const msg = reportEmail({ name: row.name, reportUrl, interestUrl: `${site}/api/interest?id=${row.id}`, siteUrl: site });
  const sent = await sendEmail(env, { to: row.email, ...msg });
  try { await updateSubmission(env, row.id, { email_sent_at: sent.ok ? new Date().toISOString() : null, email_error: sent.ok ? null : sent.error }); } catch {}
  return json({ emailed: sent.ok });
}
