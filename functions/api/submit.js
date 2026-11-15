// POST /api/submit  (header X-Session)
// Saves the person, their conversation and report in Supabase, sends the Starting Position email,
// and alerts the coach team if a red flag was raised.
import { json, newId, checkSession, esc } from '../../src/util.js';
import { reportEmail, sendEmail } from '../../src/email.js';
import { insertSubmission, getSubmission, updateSubmission } from '../../src/db.js';

const RED = ['crisis', 'crisis_keyword', 'urgent_symptoms', 'harm_from_others'];

export async function onRequestPost({ request, env }) {
  if (!(await checkSession(env, request.headers.get('X-Session')))) return json({ error: 'session_expired' }, 401);
  if (!env.SUPABASE_URL || !(env.SUPABASE_SECRET_KEY || env.SUPABASE_API_KEY)) return json({ error: 'not_configured' }, 503);
  const raw = await request.text();
  if (raw.length > 1_500_000) return json({ error: 'too_large' }, 413);
  let b;
  try { b = JSON.parse(raw); } catch { return json({ error: 'bad_request' }, 400); }
  const name = String(b.user?.name || '').slice(0, 60).trim();
  const email = String(b.user?.email || '').slice(0, 160).trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !b.user?.consent || !b.report) return json({ error: 'bad_request' }, 400);

  const flags = Array.isArray(b.flags) ? b.flags.filter(f => typeof f === 'string').slice(0, 30) : [];
  const flagLog = Array.isArray(b.flagLog) ? b.flagLog.slice(0, 60) : [];
  const level = flags.some(f => RED.includes(f)) ? 'red' : flagLog.some(f => f?.level === 'amber') ? 'amber' : flags.length ? 'green' : '';
  const site = env.SITE_URL || new URL(request.url).origin;
  const data = { profile: b.profile ?? null, flags, flag_level: level, flag_log: flagLog, screens: b.screens ?? null, transcript: b.turns ?? null, report: b.report };

  try {
    // A regenerated report for the same person updates their existing row (no second email).
    if (b.id && /^[A-Za-z0-9]{16,64}$/.test(b.id)) {
      const existing = await getSubmission(env, b.id, 'email');
      if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
        await updateSubmission(env, b.id, data);
        return json({ id: b.id, url: `${site}/r/${b.id}`, emailed: null });
      }
    }

    const id = newId();
    await insertSubmission(env, { id, name, email, consent: true, consent_text: String(b.user.consentText || '').slice(0, 600), market: String(b.market || '').slice(0, 4), ...data });

    const reportUrl = `${site}/r/${id}`;
    const msg = reportEmail({ name, reportUrl, interestUrl: `${site}/api/interest?id=${id}`, siteUrl: site });
    const sent = await sendEmail(env, { to: email, ...msg });
    await updateSubmission(env, id, { email_sent_at: sent.ok ? new Date().toISOString() : null, email_error: sent.ok ? null : sent.error });

    if (level === 'red' && env.COACH_ALERT_EMAIL) {
      await sendEmail(env, {
        to: env.COACH_ALERT_EMAIL,
        subject: 'Red flag: please follow up',
        text: `A Pando conversation raised a red flag.\n\nName: ${name}\nFlags: ${flags.join(', ')}\nCountry used: ${b.market || 'unknown'}\n\nOpen the coach view: ${site}/admin/s/${id}`,
        html: `<p>A Pando conversation raised a red flag.</p><p>Name: ${esc(name)}<br>Flags: ${esc(flags.join(', '))}<br>Country used: ${esc(b.market || 'unknown')}</p><p><a href="${site}/admin/s/${id}">Open the coach view</a></p>`,
      });
    }
    return json({ id, url: reportUrl, emailed: sent.ok, emailError: sent.ok ? undefined : sent.error });
  } catch (e) {
    console.error(e);
    return json({ error: 'save_failed' }, 502);
  }
}
