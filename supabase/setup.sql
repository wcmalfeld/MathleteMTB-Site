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
