// GET /api/health  -> which settings are present. Values are never returned.
import { json } from '../../src/util.js';

const NAMES = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'RESEND_API_KEY', 'SESSION_SECRET', 'TURNSTILE_SECRET', 'SITE_URL', 'EMAIL_FROM'];

export function onRequestGet({ env }) {
  return json({
    present: Object.fromEntries(NAMES.map(name => [name, Boolean(env[name])])),
    names: Object.keys(env).filter(name => name !== 'ASSETS').sort(),
  });
}
