// GET /r/:id  -> serves the Pando page, which detects the /r/ path and shows that person's report.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  url.pathname = '/';
  const res = await env.ASSETS.fetch(new Request(url.toString(), request));
  return new Response(res.body, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}
