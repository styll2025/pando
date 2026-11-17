// Register interest in a welcome call / membership from January 2027.
// GET  /api/interest?id=...  (the email button)  -> records it and shows a thank-you page
// POST /api/interest {id}    (the report button) -> records it and returns JSON
import { json, html, validId } from '../../src/util.js';
import { addToBrevoList } from '../../src/email.js';
import { getSubmission, updateSubmission } from '../../src/db.js';

async function record(env, id) {
  if (!validId(id)) return false;
  try {
    const row = await getSubmission(env, id, 'id,email,name');
    if (!row) return false;
    // Keep the first time they registered; still counts as success if already registered.
    await updateSubmission(env, id, { interest: true, interest_at: new Date().toISOString() }, '&interest=eq.false');
    if (env.BREVO_LIST_ID) {
      const listed = await addToBrevoList(env, { email: row.email, name: row.name, listId: env.BREVO_LIST_ID });
      if (!listed.ok) console.error(listed.error);
    }
    return true;
  } catch (e) { console.error(e); return false; }
}

export async function onRequestPost({ request, env }) {
  let b = {}; try { b = await request.json(); } catch {}
  return (await record(env, b.id)) ? json({ ok: true }) : json({ error: 'not_found' }, 404);
}

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('id');
  const ok = await record(env, id);
  return html(`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Good Span</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#d1e6e9;font-family:'Helvetica Neue',Arial,sans-serif;color:#4d2831}
.c{max-width:520px;margin:24px;background:#fff;border:1px solid #4d2831;border-radius:32px;padding:44px 36px;text-align:center}
h1{font-weight:300;font-size:34px;line-height:1.15;margin:0 0 16px}p{font-size:17px;line-height:26px;margin:0 0 24px}
a{display:inline-block;padding:14px 28px;border-radius:999px;background:#4d2831;color:#fff2ea;text-decoration:none;font-size:13px;letter-spacing:.12em;text-transform:uppercase}
img{width:180px;margin-bottom:28px}</style></head><body><div class="c"><img src="/brand/logo-plum.svg" alt="The Good Span">
${ok ? `<h1>Thank you. You’re on the list.</h1><p>We’ll be in touch as soon as bookings with a Good Span Longevity expert open in January 2027.</p><a href="/r/${id}">Back to your report</a>`
     : `<h1>Something went wrong.</h1><p>We couldn’t find your report. Please use the link in your email again, or contact us.</p>`}
</div></body></html>`, ok ? 200 : 404);
}
