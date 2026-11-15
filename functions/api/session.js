// POST /api/session  { turnstileToken }  ->  { session }
// Called when someone starts the chat. Verifies Cloudflare Turnstile (if configured) and returns a signed session token.
import { json, signSession } from '../../src/util.js';

export async function onRequestPost({ request, env }) {
  let body = {};
  try { body = await request.json(); } catch {}
  if (env.TURNSTILE_SECRET) {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', body.turnstileToken || '');
    form.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const out = await r.json().catch(() => ({}));
    if (!out.success) return json({ error: 'verification_failed' }, 403);
  }
  if (!env.SESSION_SECRET) return json({ session: 'dev' });
  return json({ session: await signSession(env) });
}
