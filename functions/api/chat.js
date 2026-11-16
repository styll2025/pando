// POST /api/chat  { messages, tier: 'quick'|'default', stream }  (header X-Session)
// Proxies Pando's messages to the Anthropic API. The API key never reaches the browser,
// and the model and token limits are fixed here, not by the client.
import { json, checkSession } from '../../src/util.js';

const LIMITS = { quick: 900, default: 8000 };

export async function onRequestPost({ request, env }) {
  if (!(await checkSession(env, request.headers.get('X-Session')))) return json({ error: 'session_expired' }, 401);
  const raw = await request.text();
  if (raw.length > 400_000) return json({ error: 'prompt_too_large' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: 'bad_request' }, 400); }
  const tier = body.tier === 'default' ? 'default' : 'quick';
  const model = tier === 'quick' ? (env.MODEL_CHAT || 'claude-haiku-5-5') : (env.MODEL_REPORT || 'claude-sonnet-5-5');

  // Normalise: strings only, alternate roles (merge consecutive turns), start with the user.
  const msgs = [];
  for (const m of Array.isArray(body.messages) ? body.messages.slice(-140) : []) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || !m.content.trim()) continue;
    const last = msgs[msgs.length - 1];
    if (last && last.role === m.role) last.content += '\n\n' + m.content; else msgs.push({ role: m.role, content: m.content });
  }
  if (!msgs.length || msgs[0].role !== 'user') return json({ error: 'bad_request' }, 400);
  if (msgs[msgs.length - 1].role !== 'user') msgs.pop();

  const stream = body.stream !== false;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: LIMITS[tier], messages: msgs, stream }),
  });
  if (!r.ok) {
    const code = r.status === 429 || r.status === 529 ? 'rate_limited' : r.status === 400 ? 'refused' : 'upstream_error';
    return json({ error: code, status: r.status }, r.status === 429 || r.status === 529 ? 429 : 502);
  }
  if (!stream) {
    const out = await r.json();
    const blocks = out.content || [];
    const text = blocks.filter(b => b.type === 'text').map(b => b.text).join('');
    if (!text) return json({ text, stop: out.stop_reason || '', types: blocks.map(b => b.type) });
    return json({ text });
  }

  // Turn Anthropic's event stream into a plain text stream for the page.
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter(), enc = new TextEncoder(), dec = new TextDecoder();
  (async () => {
    const reader = r.body.getReader();
    let buf = '';
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const evt = buf.slice(0, i); buf = buf.slice(i + 2);
          const line = evt.split('\n').find(l => l.startsWith('data: '));
          if (!line) continue;
          try {
            const d = JSON.parse(line.slice(6));
            if (d.type === 'content_block_delta' && d.delta?.type === 'text_delta') await writer.write(enc.encode(d.delta.text));
          } catch {}
        }
      }
    } finally { await writer.close(); }
  })();
  return new Response(readable, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
}
