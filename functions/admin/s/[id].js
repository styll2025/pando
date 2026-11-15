// GET /admin/s/:id  -> one person's profile, flags, screening results and full conversation.
import { html, esc, validId } from '../../../src/util.js';
import { page } from '../../../src/adminLayout.js';
import { getSubmission } from '../../../src/db.js';

export async function onRequestGet({ params, env }) {
  if (!validId(params.id)) return html(page('Not found', '<p>Not found.</p>'), 404);
  const r = await getSubmission(env, params.id);
  if (!r) return html(page('Not found', '<p>Not found.</p>'), 404);
  const P = v => v ?? null;
  const profile = P(r.profile) || {}, log = P(r.flag_log) || [], screens = P(r.screens) || {}, turns = P(r.transcript) || [];
  const strip = t => String(t).split('@@META')[0].trim();
  const conv = turns.filter(t => !t.hidden).map(t => `<div class="msg ${t.role === 'user' ? 'p' : ''}">${esc(t.role === 'user' ? (t.display ?? t.content) : strip(t.content))}</div>`).join('');
  const flags = log.length ? `<div class="tw"><table><thead><tr><th>Flag</th><th>Level</th><th>Trigger</th><th>Time (UTC)</th><th>Country</th></tr></thead><tbody>${log.map(f => `<tr><td>${esc(f.flag)}</td><td><span class="pill ${esc(f.level)}">${esc(f.level)}</span></td><td>${esc(f.trigger)}</td><td>${esc(String(f.at || '').slice(0, 16).replace('T', ' '))}</td><td>${esc(f.market || '')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No flags.</p>';
  return html(page(r.name, `<p><a href="/admin">← All Starting Positions</a></p>
  <h1>${esc(r.name)}</h1>
  <p>${esc(r.email)} · ${esc(String(r.created_at).slice(0, 16).replace('T', ' '))} UTC · Country: ${esc(r.market || 'unknown')} · Interest: ${r.interest ? 'Yes, ' + esc(String(r.interest_at || '').slice(0, 10)) : 'No'} · <a href="/r/${r.id}" target="_blank" rel="noopener">Open report</a></p>
  <h2>Profile</h2><p>${esc(Object.entries(profile).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ') || 'Not recorded')}</p>
  <h2>Screening</h2><p>${esc(JSON.stringify(screens))}</p>
  <h2>Flags</h2>${flags}
  <h2>Conversation</h2>${conv}
  <p class="muted">Consent: ${esc(r.consent_text || 'Given')}</p>`));
}
