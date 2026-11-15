// GET /admin  -> list of submissions with flags and interest. ?flag=red|amber  ?interest=1  ?q=search
import { html, esc } from '../../src/util.js';
import { page } from '../../src/adminLayout.js';
import { listSubmissions } from '../../src/db.js';

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const flag = u.searchParams.get('flag'), interest = u.searchParams.get('interest'), q = (u.searchParams.get('q') || '').trim();
  const results = await listSubmissions(env, { flag, interest: interest === '1', q });
  const f = (label, href, on) => `<a href="${href}" class="${on ? 'on' : ''}">${label}</a>`;
  const rows = results.map(r => `<tr>
    <td>${esc(String(r.created_at).slice(0, 16).replace('T', ' '))}</td>
    <td><a href="/admin/s/${r.id}">${esc(r.name)}</a></td>
    <td>${esc(r.email)}</td><td>${esc(r.market || '')}</td>
    <td>${r.flag_level ? `<span class="pill ${r.flag_level}">${r.flag_level}</span> ` : ''}<span class="muted">${esc((r.flags || []).join(', '))}</span></td>
    <td>${r.interest ? 'Yes' : ''}</td>
    <td>${r.email_sent_at ? 'Sent' : `<span class="muted">${esc(r.email_error || 'Not sent')}</span>`}</td>
    <td><a href="/r/${r.id}" target="_blank" rel="noopener">Report</a></td></tr>`).join('');
  return html(page('Coach view', `<h1>Starting Positions</h1>
  <div class="filters">${f('All', '/admin', !flag && !interest)}${f('Red flags', '/admin?flag=red', flag === 'red')}${f('Amber flags', '/admin?flag=amber', flag === 'amber')}${f('Registered interest', '/admin?interest=1', interest === '1')}
  <form method="get" action="/admin"><input name="q" value="${esc(q)}" placeholder="Search name or email" style="padding:6px 12px;border-radius:999px;border:1px solid #4d2831"></form></div>
  <div class="tw"><table><thead><tr><th>Date (UTC)</th><th>Name</th><th>Email</th><th>Country</th><th>Flags</th><th>Interest</th><th>Email</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="8" class="muted">No submissions yet.</td></tr>'}</tbody></table></div>
  <p class="muted">Showing up to 500, newest first. Export everything from the Supabase table editor.</p>`));
}
