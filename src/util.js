// Small shared helpers for the Pages Functions.

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

export const html = (body, status = 200) =>
  new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Unguessable ids for report links (24 characters, about 143 bits).
export function newId(len = 24) {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, b => abc[b % abc.length]).join('');
}

export const validId = id => typeof id === 'string' && /^[A-Za-z0-9]{16,64}$/.test(id);

// Session tokens: HMAC-signed, so only people who started on the welcome screen can use the chat API.
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function signSession(env, hours = 6) {
  const payload = `${Date.now() + hours * 3600e3}.${newId(12)}`;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env.SESSION_SECRET), new TextEncoder().encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function checkSession(env, token) {
  if (!env.SESSION_SECRET) return true; // not configured: allow (local development only)
  if (typeof token !== 'string') return false;
  const i = token.lastIndexOf('.'); if (i < 0) return false;
  const payload = token.slice(0, i), sig = token.slice(i + 1);
  const expected = b64url(await crypto.subtle.sign('HMAC', await hmacKey(env.SESSION_SECRET), new TextEncoder().encode(payload)));
  if (expected !== sig) return false;
  return Number(payload.split('.')[0]) > Date.now();
}
