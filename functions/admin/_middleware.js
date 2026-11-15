// Everything under /admin must sit behind Cloudflare Access (see README).
// As a second safeguard, refuse any request that didn't come through Access.
import { html } from '../../src/util.js';

export async function onRequest({ request, env, next }) {
  const who = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (!who && env.ADMIN_OPEN !== 'true') return html('<p style="font-family:sans-serif">Not authorised. This page is protected by Cloudflare Access.</p>', 403);
  return next();
}
