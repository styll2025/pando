-- One row per completed Starting Position.
create table if not exists public.submissions (
  id             text primary key,                 -- unguessable id used in the report link
  created_at     timestamptz not null default now(),
  name           text not null,
  email          text not null,
  consent        boolean not null default false,
  consent_text   text,                             -- the exact wording they agreed to
  market         text,                             -- country used for support numbers
  profile        jsonb,                            -- age band, sex, work, conditions, focus…
  flags          jsonb not null default '[]'::jsonb,
  flag_level     text not null default '',         -- red | amber | green | ''
  flag_log       jsonb,                            -- each flag with level, trigger, time, country
  screens        jsonb,                            -- PHQ-4 and AUDIT-C results
  transcript     jsonb,                            -- the full conversation
  report         jsonb,                            -- the generated report
  email_sent_at  timestamptz,
  email_error    text,
  interest       boolean not null default false,   -- registered interest for January 2027
  interest_at    timestamptz
);

create index if not exists submissions_created_idx  on public.submissions (created_at desc);
create index if not exists submissions_flag_idx     on public.submissions (flag_level);
create index if not exists submissions_interest_idx on public.submissions (interest);

-- Lock the table down: with row level security on and no policies, the public (anon) key
-- can't read or write anything. Only the server, using the secret key, can.
alter table public.submissions enable row level security;
revoke all on public.submissions from anon, authenticated;
