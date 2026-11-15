// POST /api/transcribe  (multipart form with "file", header X-Session)  ->  { text }
// Turns a short voice recording into text with OpenAI. The text goes back into the message box
// so the person can check and edit it before sending; audio is not stored by The Good Span.
import { json, checkSession } from '../../src/util.js';

const PROMPT = 'A relaxed conversation about everyday health habits: nutrition, sleep, movement, mood, stress, friends and family, alcohol and health checks. Terms may include menopause, perimenopause, metformin, blood pressure, cholesterol, HbA1c, Pilates, tai chi, Samaritans.';

export async function onRequestPost({ request, env }) {
  if (!(await checkSession(env, request.headers.get('X-Session')))) return json({ error: 'session_expired' }, 401);
  if (!env.OPENAI_API_KEY) return json({ error: 'not_configured' }, 503);
  if (Number(request.headers.get('content-length') || 0) > 12_000_000) return json({ error: 'too_large' }, 413);
  let form;
  try { form = await request.formData(); } catch { return json({ error: 'bad_request' }, 400); }
  const file = form.get('file');
  if (!file || typeof file === 'string' || file.size < 400) return json({ error: 'too_short' }, 400);

  const out = new FormData();
  out.append('file', file, file.name || 'speech.webm');
  out.append('model', env.MODEL_TRANSCRIBE || 'gpt-4o-mini-transcribe');
  out.append('language', 'en');
  out.append('response_format', 'json');
  out.append('prompt', PROMPT);

  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: out });
  if (!r.ok) {
    console.error('OpenAI transcription', r.status, (await r.text()).slice(0, 300));
    return json({ error: r.status === 429 ? 'rate_limited' : 'transcription_failed' }, 502);
  }
  const d = await r.json().catch(() => ({}));
  return json({ text: String(d.text || '').trim() });
}
