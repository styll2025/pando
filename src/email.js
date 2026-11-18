// The Good Span report email, as table-based HTML that works in email clients, plus a plain-text version.
import { esc } from './util.js';

const PLUM = '#4d2831', BLUE = '#d1e6e9', CREAM = '#fff2ea', ORANGE = '#fe600c', MUTED = '#6b4a51';
const SANS = "'BST Bazaine','Helvetica Neue',Helvetica,Arial,sans-serif";
const UI = "Archivo,'Helvetica Neue',Helvetica,Arial,sans-serif";

const button = (href, label, bg, fg, cls) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td class="${cls}" bgcolor="${bg}" style="border-radius:999px;background:${bg}">
<a href="${href}" style="display:inline-block;padding:16px 32px;font-family:${UI};font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:${fg};text-decoration:none;border-radius:999px">${label}</a>
</td></tr></table>`;

export function reportEmail({ name, reportUrl, interestUrl, siteUrl }) {
  const n = esc(name || 'there');
  const html = `<!doctype html>
<html lang="en-GB" style="color-scheme:light only"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>Your Good Span report is ready</title>
<style>
  :root { color-scheme: light only; supported-color-schemes: light; }
  @media (prefers-color-scheme: dark) {
    .bg { background:${BLUE} !important; background-color:${BLUE} !important; color:${PLUM} !important; }
    .card, .card td { background:#ffffff !important; background-color:#ffffff !important; color:${PLUM} !important; }
    .card h1, .card h2, .card h3, .card p, .card a { color:${PLUM} !important; }
    .card .muted, .card .muted p { color:${MUTED} !important; }
    .card .expert, .card .expert td { background:${PLUM} !important; background-color:${PLUM} !important; color:${CREAM} !important; }
    .card .expert h3, .card .expert p { color:${CREAM} !important; }
    .card .btn-plum, .card .expert .btn-plum { background:${PLUM} !important; background-color:${PLUM} !important; }
    .card .btn-plum a, .card .expert .btn-plum a { color:${CREAM} !important; }
    .card .btn-blue, .card .expert .btn-blue { background:${BLUE} !important; background-color:${BLUE} !important; }
    .card .btn-blue a, .card .expert .btn-blue a { color:${PLUM} !important; }
  }
</style></head>
<body class="bg" bgcolor="${BLUE}" style="margin:0;padding:0;background:${BLUE};color:${PLUM};color-scheme:light only">
<div style="display:none;max-height:0;overflow:hidden">Your personalised report, and what happens next.</div>
<table class="bg" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${BLUE}" style="background:${BLUE}"><tr><td class="bg" align="center" bgcolor="${BLUE}" style="padding:40px 16px;background:${BLUE}">
<table class="card" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background:#ffffff;border-radius:28px;font-family:${SANS};color:${PLUM}">

<tr><td align="center" style="padding:36px 40px 28px;border-bottom:1px solid ${PLUM}">
<img src="${siteUrl}/brand/logo-plum.png" width="200" alt="The Good Span" style="display:block;width:200px;height:auto;border:0">
</td></tr>

<tr><td align="center" style="padding:44px 40px 40px;text-align:center">
<p style="margin:0 0 18px;font-family:${UI};font-size:12px;letter-spacing:0.14em;text-transform:uppercase">The Good Span</p>
<h1 style="margin:0 0 22px;font-family:${SANS};font-weight:300;font-size:38px;line-height:1.1;color:${PLUM}">Your Good Span report is ready.</h1>
<p style="margin:0 0 14px;font-size:17px;line-height:27px">Hi ${n},</p>
<p style="margin:0 0 14px;font-size:17px;line-height:27px">Thank you for taking the time to chat with Pando.</p>
<p style="margin:0 0 28px;font-size:17px;line-height:27px">Your Good Span report is ready. It brings together a picture of where you are today across the six areas of longevity, along with personalised recommendations to help you build on your current habits and support your long-term health.</p>
<table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0"><tr><td>${button(reportUrl, 'View your report', PLUM, CREAM, 'btn-plum')}</td></tr></table>
</td></tr>

<tr><td style="padding:0 32px 8px"><h2 style="margin:0 8px 14px;font-family:${SANS};font-weight:300;font-size:28px;color:${PLUM}">Your next steps.</h2></td></tr>

<tr><td style="padding:0 32px 14px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid ${PLUM};border-radius:24px"><tr><td style="padding:26px">
<p style="margin:0 0 10px;font-family:${UI};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED}">01 · Start now</p>
<h3 style="margin:0 0 10px;font-family:${SANS};font-weight:300;font-size:24px;color:${PLUM}">Begin with one practice</h3>
<p style="margin:0;font-size:16px;line-height:25px">Choose the recommendation that feels most doable this week and start there. You don’t need to do everything at once.</p>
</td></tr></table>
</td></tr>

<tr><td style="padding:0 32px 36px">
<table class="expert" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${PLUM}" style="background:${PLUM};border-radius:24px"><tr><td class="expert" bgcolor="${PLUM}" style="padding:26px;background:${PLUM};color:${CREAM}">
<p style="margin:0 0 10px;font-family:${UI};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${CREAM}">02 &nbsp;<span style="background:${ORANGE};color:#000000;padding:4px 10px;border-radius:999px;letter-spacing:0.1em">January 2027</span></p>
<h3 style="margin:0 0 10px;font-family:${SANS};font-weight:300;font-size:24px;color:${CREAM}">Meet your Longevity expert</h3>
<p style="margin:0 0 12px;font-size:16px;line-height:25px;color:${CREAM}">From January 2027, a Good Span Longevity expert can talk through your Starting Position with you, refine your Good Span to fit your life and help you choose the membership that suits you. Register your interest and we’ll be in touch as soon as bookings open.</p>
<p style="margin:0 0 18px;font-family:${UI};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${CREAM}">20-minute welcome call · Online</p>
${button(interestUrl, 'Register interest', BLUE, PLUM, 'btn-blue')}
</td></tr></table>
</td></tr>

<tr><td style="padding:0 40px 36px;font-size:16px;line-height:25px">Warm regards,<br>The Good Span team</td></tr>

<tr><td class="muted" style="padding:24px 40px 32px;border-top:1px solid ${PLUM};font-size:12px;line-height:19px;color:${MUTED}">
<p style="margin:0 0 10px">Your report draws on your responses and The Good Span Longevity Library, which brings together 250+ scientific studies and medical sources on longevity, healthy ageing and wellbeing. It is intended to support your health and wellbeing, not replace professional medical advice.</p>
<p style="margin:0 0 12px">You’re receiving this email because you completed a conversation with Pando.</p>
<p style="margin:0;font-family:${UI};font-size:11px;letter-spacing:0.12em;text-transform:uppercase"><a href="${siteUrl}/privacy" style="color:${PLUM}">Privacy policy</a> &nbsp;·&nbsp; <a href="mailto:hello@thegoodspan.com" style="color:${PLUM}">Contact us</a></p>
</td></tr>

</table></td></tr></table></body></html>`;

  const text = `Hi ${name || 'there'},

Thank you for taking the time to chat with Pando.

Your Good Span report is ready. It brings together a picture of where you are today across the six areas of longevity, along with personalised recommendations to help you build on your current habits and support your long-term health.

View your report: ${reportUrl}

YOUR NEXT STEPS

01 Begin with one practice
Choose the recommendation that feels most doable this week and start there. You don’t need to do everything at once.

02 Meet your Longevity expert (January 2027)
From January 2027, a Good Span Longevity expert can talk through your Starting Position with you, refine your Good Span to fit your life and help you choose the membership that suits you. Register your interest and we’ll be in touch as soon as bookings open.
Register interest: ${interestUrl}

Warm regards,
The Good Span team

Your report draws on your responses and The Good Span Longevity Library, which brings together 250+ scientific studies and medical sources on longevity, healthy ageing and wellbeing. It is intended to support your health and wellbeing, not replace professional medical advice.`;

  return { subject: 'Your Good Span report is ready', html, text };
}

// Sends one email through Brevo (transactional API).
// EMAIL_FROM looks like "The Good Span <hello@thegoodspan.com>" and must be a verified Brevo sender.
export async function sendEmail(env, { to, subject, html, text }) {
  const key = String(env.BREVO_API_KEY || '').trim();
  if (!key) return { ok: false, error: 'BREVO_API_KEY not set' };
  const m = String(env.EMAIL_FROM || '').match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  const sender = m ? { name: m[1] || 'The Good Span', email: m[2] } : { name: 'The Good Span', email: env.EMAIL_FROM };
  const body = { sender, to: [{ email: to }], subject, htmlContent: html, textContent: text, tags: ['starting-position'] };
  if (env.EMAIL_REPLY_TO) body.replyTo = { email: env.EMAIL_REPLY_TO };
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (r.ok) return { ok: true };
  return { ok: false, error: `${r.status} ${(await r.text()).slice(0, 300)}` };
}

// Adds or updates a contact in a Brevo list (used for people who register interest for January 2027).
export async function addToBrevoList(env, { email, name, listId }) {
  const key = String(env.BREVO_API_KEY || '').trim();
  if (!key || !listId) return { ok: false, error: 'not configured' };
  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email, attributes: { FIRSTNAME: name || '' }, listIds: [Number(listId)], updateEnabled: true }),
  });
  return r.ok || r.status === 204 ? { ok: true } : { ok: false, error: `${r.status} ${(await r.text()).slice(0, 300)}` };
}
