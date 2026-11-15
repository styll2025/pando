// Minimal Supabase client using the REST API (no npm packages needed in Pages Functions).
// Uses the secret (service role) key, which must only ever live in Cloudflare secrets.

function headers(env, extra = {}) {
  const key = env.SUPABASE_SECRET_KEY;
  const h = { apikey: key, 'content-type': 'application/json', ...extra };
  if (!key.startsWith('sb_')) h.Authorization = `Bearer ${key}`; // legacy service_role JWT keys also need this
  return h;
}
const base = env => `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/submissions`;

async function check(r) {
  if (r.ok) return r;
  throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 300)}`);
}

export async function insertSubmission(env, row) {
  await check(await fetch(base(env), { method: 'POST', headers: headers(env, { Prefer: 'return=minimal' }), body: JSON.stringify(row) }));
}

export async function getSubmission(env, id, select = '*') {
  const r = await check(await fetch(`${base(env)}?id=eq.${encodeURIComponent(id)}&select=${select}&limit=1`, { headers: headers(env) }));
  const rows = await r.json();
  return rows[0] || null;
}

// Returns the number of rows changed.
export async function updateSubmission(env, id, patch, extraFilter = '') {
  const r = await check(await fetch(`${base(env)}?id=eq.${encodeURIComponent(id)}${extraFilter}`, { method: 'PATCH', headers: headers(env, { Prefer: 'return=representation' }), body: JSON.stringify(patch) }));
  return (await r.json()).length;
}

export async function listSubmissions(env, { flag, interest, q } = {}) {
  const p = new URLSearchParams({ select: 'id,created_at,name,email,market,flags,flag_level,interest,email_sent_at,email_error', order: 'created_at.desc', limit: '500' });
  if (flag === 'red' || flag === 'amber') p.set('flag_level', `eq.${flag}`);
  if (interest) p.set('interest', 'eq.true');
  if (q) { const s = q.replace(/[(),*]/g, ' ').trim(); p.set('or', `(name.ilike.*${s}*,email.ilike.*${s}*)`); }
  const r = await check(await fetch(`${base(env)}?${p}`, { headers: headers(env) }));
  return r.json();
}
