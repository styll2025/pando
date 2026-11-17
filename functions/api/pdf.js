// GET /api/pdf?id=...  ->  the person's Good Span report as a PDF file (one-click download).
// Uses Cloudflare Browser Rendering to open /r/<id>?print=1 and print it, so the PDF always matches the report page.
import { validId } from '../../src/util.js';
import { getSubmission } from '../../src/db.js';

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('id');
  if (!validId(id)) return new Response('Not found', { status: 404 });
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CF_BROWSER_TOKEN) return new Response('Not configured', { status: 503 });
  let row;
  try { row = await getSubmission(env, id, 'id,name'); } catch { return new Response('Unavailable', { status: 502 }); }
  if (!row) return new Response('Not found', { status: 404 });

  const site = env.SITE_URL || new URL(request.url).origin;
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-run/pdf`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_BROWSER_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      url: `${site}/r/${id}?print=1`,
      gotoOptions: { waitUntil: 'networkidle0', timeout: 45000 },
      pdfOptions: { format: 'a4', printBackground: true, margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' } },
    }),
  });
  if (!r.ok || !(r.headers.get('content-type') || '').includes('pdf')) {
    console.error('Browser Rendering', r.status, (await r.text()).slice(0, 300));
    return new Response('PDF unavailable', { status: 502 });
  }
  const name = `Good-Span-report${row.name ? '-' + row.name.replace(/[^A-Za-z0-9]+/g, '-') : ''}.pdf`;
  return new Response(r.body, { headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${name}"`, 'cache-control': 'private, no-store' } });
}
