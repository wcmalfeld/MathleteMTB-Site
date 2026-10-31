-- ============================================================
-- Mathlete MTB: member access (run once in Supabase -> SQL Editor).
-- Safe to re-run: every statement is idempotent.
--
-- Who gets in is decided HERE, on the server:
--   * public.members        - one row per person you have given access.
--   * has_tool_access()     - true only for a signed-in user with an
--                             active, unexpired members row, who is not
--                             banned, and whose session still exists
--                             (so logging out or revoking takes effect
--                             immediately, not when the token expires).
--   * private-tools bucket  - private Storage bucket holding the private
--                             tools; files are served only when
--                             has_tool_access() is true.
-- Nobody can add themselves: there are no insert/update/delete
-- policies, so only you (dashboard / service role) can change members.
-- ============================================================

-- 1. Members ---------------------------------------------------
create table if not exists public.members (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  active     boolean not null default true,
  -- Room for paid or time-limited access later without a rewrite:
  plan       text not null default 'invited',
  expires_at timestamptz,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

drop policy if exists "Members can read their own row" on public.members;
create policy "Members can read their own row"
  on public.members for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.members from anon;
revoke insert, update, delete, truncate on public.members from authenticated;
grant select on public.members to authenticated;

-- 2. The access check --------------------------------------------
create or replace function public.has_tool_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    auth.uid() is not null
    and exists (
      select 1 from public.members m
      where m.user_id = auth.uid()
        and m.active
        and (m.expires_at is null or m.expires_at > now())
    )
    and not exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and u.banned_until is not null
        and u.banned_until > now()
    )
    and exists (
      select 1 from auth.sessions s
      where s.id = nullif(auth.jwt() ->> 'session_id', '')::uuid
        and s.user_id = auth.uid()
        and (s.not_after is null or s.not_after > now())
    );
$$;

revoke all on function public.has_tool_access() from public;
revoke all on function public.has_tool_access() from anon;
grant execute on function public.has_tool_access() to authenticated;

-- 3. Private tools bucket ----------------------------------------
insert into storage.buckets (id, name, public)
values ('private-tools', 'private-tools', false)
on conflict (id) do update set public = false;

drop policy if exists "Members can read private tools" on storage.objects;
create policy "Members can read private tools"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'private-tools' and public.has_tool_access());

-- No insert/update/delete policies on this bucket: only you can upload,
-- via the dashboard or `node scripts/admin.mjs upload`.

-- 4. College & Beyond inquiries ----------------------------------
-- The inquiry form on college-beyond.html writes here. Visitors can
-- add a row but can never read, change or delete one; only you can
-- (dashboard, or `node scripts/admin.mjs inquiries`). The checks
-- below reject anything the form wouldn't send.
create table if not exists public.inquiries (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  service            text not null default 'college-beyond'
                       check (service in ('college-beyond')),
  name               text not null check (char_length(btrim(name)) between 1 and 120),
  email              text not null check (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  reaching_out_as    text not null check (reaching_out_as in ('parent', 'student', 'other')),
  grade              text not null check (grade in ('9', '10', '11', '12', 'graduated-other')),
  help_with          text[] not null check (
                       cardinality(help_with) between 1 and 8
                       and help_with <@ array['direction', 'shortlist', 'applications', 'affordability',
                                              'test-math', 'organization', 'life-after', 'not-sure']),
  student_first_name text check (student_first_name is null or char_length(student_first_name) <= 60),
  timeline           text check (timeline is null or timeline in ('exploring', 'within-3', '3-6', '6-12')),
  message            text check (message is null or char_length(message) <= 2000),
  consent            boolean not null check (consent),
  source_page        text check (source_page is null or char_length(source_page) <= 200),
  handled            boolean not null default false
);

alter table public.inquiries enable row level security;

drop policy if exists "Anyone can send an inquiry" on public.inquiries;
create policy "Anyone can send an inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

-- Insert only, and only the form's own columns (not id, created_at or handled).
revoke all on public.inquiries from anon, authenticated;
grant insert (service, name, email, reaching_out_as, grade, help_with,
              student_first_name, timeline, message, consent, source_page)
  on public.inquiries to anon, authenticated;

-- Basic flood protection: at most 20 inquiries per 10 minutes site-wide.
create or replace function public.inquiries_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.inquiries
      where created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'Too many inquiries right now. Please try again later.';
  end if;
  return new;
end;
$$;

revoke all on function public.inquiries_rate_limit() from public;

drop trigger if exists inquiries_rate_limit on public.inquiries;
create trigger inquiries_rate_limit
  before insert on public.inquiries
  for each row execute function public.inquiries_rate_limit();
