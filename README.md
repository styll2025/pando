# The Good Span: Pando

Pando is The Good Span's conversational assessment. People chat with Pando for about 15–20 minutes and receive their personalised Starting Position by email, with a private link to their report.

The site and server code run on Cloudflare Pages. Submissions are stored in Supabase. Emails are sent with Brevo. Pando thinks with the Anthropic API.

## How it fits together

| Part | Where | What it does |
| --- | --- | --- |
| `public/index.html` | Cloudflare Pages | The welcome screen, the chat with Pando, and the report. Also shows each person's report at `/r/<id>`. |
| `functions/api/session.js` | Pages Functions | Starts a session (checks Turnstile if set up) and returns a signed token. |
| `functions/api/chat.js` | Pages Functions | Passes Pando's messages to the Anthropic API. The key stays on the server. |
| `functions/api/transcribe.js` | Pages Functions | Turns a short voice recording into text with OpenAI. The text goes back into the message box; the audio is not stored. |
| `functions/api/submit.js` | Pages Functions | Saves name, email, consent, conversation, flags and report to Supabase, sends the email, alerts coaches about red flags. |
| `functions/api/report/[id].js` | Pages Functions | Returns a report for its private link. No email or conversation is ever sent to the browser. |
| `functions/api/interest.js` | Pages Functions | Records "Register interest" from the report or the email. |
| `functions/admin/` | Pages Functions + Cloudflare Access | The coach view: all Starting Positions, flags, interest, and each conversation. |
| `src/email.js` | — | The Starting Position email (HTML and plain text). |
| `src/db.js` | — | A small Supabase client (REST API, no packages). |
| `supabase/migrations/…_submissions.sql` | Supabase | The `submissions` table, locked down with row level security. |

## One-time setup (about an hour)

You need: your Cloudflare account (domain already on Cloudflare), this repo on GitHub, an Anthropic API key, and a Brevo account.

### 1. Create the table in Supabase

Check your Supabase project is in an EU region (Project Settings → General). Then either:

- **SQL editor (simplest):** Supabase → SQL Editor → paste the contents of `supabase/migrations/20261115120000_submissions.sql` → Run.
- **Or via GitHub:** if your Supabase GitHub integration runs migrations, merging this repo applies the file automatically.

The table has row level security on and no policies, so the public key can't read anything. Only the server, using the secret key, can.

Then, in Supabase → **Project Settings → API**:
- copy the **Project URL** into `SUPABASE_URL` in `wrangler.toml`;
- copy the **secret key** (`sb_secret_…`, or the legacy `service_role` key) for step 4. Never put it in code or share it.

### 2. Create the Pages project from GitHub

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → choose this repo.

- Framework preset: **None**
- Build command: *(leave empty)*
- Build output directory: `public`

Every push to `main` now deploys automatically. Pull requests get their own preview link.

### 3. Add your domain

In the Pages project → **Custom domains** → add e.g. `pando.thegoodspan.com`. Then set `SITE_URL` in `wrangler.toml` to the same address and push.

### 4. Add secrets

Pages project → **Settings** → **Variables and secrets** → add these as **Secret** for Production (and Preview if you want previews to work):

| Name | Value |
| --- | --- |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `OPENAI_API_KEY` | Your OpenAI API key, for the microphone (optional: without it, people type) |
| `SUPABASE_API_KEY` | Supabase secret key from step 1 (`sb_secret_…`, or the legacy service role key) |
| `BREVO_API_KEY` | Your Brevo API key |
| `SESSION_SECRET` | Any long random string (e.g. from a password manager) |
| `TURNSTILE_SECRET` | From step 6 (optional but recommended) |

The other settings (`EMAIL_FROM`, models, `COACH_ALERT_EMAIL`) live in `wrangler.toml`.

### 5. Set up email sending (Brevo)

In Brevo → **Senders & Domains** → verify `thegoodspan.com`, and make sure `pando@thegoodspan.com` is an allowed sender. Once verified, emails send from `EMAIL_FROM` in `wrangler.toml`.

### 6. Protect the chat from bots (Turnstile, recommended)

Cloudflare dashboard → **Turnstile** → **Add widget** for your Pando domain. Put the **site key** in `public/index.html` (`window.GS_CONFIG = { turnstileSiteKey: "…" }`) and the **secret key** in the `TURNSTILE_SECRET` secret. This stops people using your Anthropic key through the chat.

Also worth adding: **Security** → **WAF** → **Rate limiting rules** → limit `/api/*` to, say, 60 requests per minute per IP.

### 7. Protect the coach view (Cloudflare Access)

Cloudflare dashboard → **Zero Trust** → **Access** → **Applications** → **Add** → **Self-hosted**.

- Application domain: `pando.thegoodspan.com`, path `admin`
- Policy: **Allow**, include **Emails** → your coaches' email addresses

Coaches then sign in with a one-time code sent to their email. Free for up to 50 users. The coach view also refuses any request that didn't pass through Access.

Set `COACH_ALERT_EMAIL` in `wrangler.toml` if you want an email whenever a red flag is raised.

## Day to day

- **Coach view:** `https://pando.thegoodspan.com/admin`, filters for red flags, amber flags and registered interest. Click a name to see their profile, flags and full conversation.
- **Everyone who registered interest:** filter "Registered interest" in the coach view.
- **Data view for admins:** Supabase → Table Editor → `submissions` lets admins browse, filter and export to CSV. Coaches should use the coach view instead, so they don't need Supabase access.
- **Change the AI models:** edit `MODEL_CHAT` / `MODEL_REPORT` in `wrangler.toml`.

## Local development (in Cursor)

```bash
npm install
cp .dev.vars.example .dev.vars   # add your keys
npm run dev                      # http://localhost:8788
```

`ADMIN_OPEN=true` in `.dev.vars` lets you open `/admin` locally without Access. Never set it in production. Local development uses your real Supabase project, so consider a separate Supabase project for testing.

## Before going live

- [ ] BST Bazaine files in `public/fonts` are **trial** fonts. License them for web use, or swap them for licensed files with the same names.
- [ ] Link the real privacy policy (`#privacy-policy` placeholders in `public/index.html`, `/privacy` in `src/email.js`).
- [ ] Check the support phone numbers in `public/index.html` (`LINES`) against official sources.
- [ ] Turnstile and the rate-limiting rule are on.
- [ ] Cloudflare Access protects `/admin`.
- [ ] Decide how long you keep submissions, and add it to the privacy policy.

## Notes

- Data saved (in Supabase): name, email, the consent wording they agreed to, country used for support numbers, profile, flags (with triggers), screening results, the full conversation and the report. A row is saved when the report is created; abandoned conversations are not saved.
- Report links are long random ids, not guessable. The report page shows only the name and the report.
- If someone regenerates their report, the same row is updated and no second email is sent.
- The email deliberately contains no health details, only the link and next steps.
