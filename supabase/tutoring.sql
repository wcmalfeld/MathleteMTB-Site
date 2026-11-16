-- ============================================================
-- Tutoring inquiries (tutors/inquire/, js/tutors.js)
--
-- Run in the Supabase SQL Editor after setup.sql. Safe to run again.
-- Visitors can add a row but can never read, change or delete one;
-- only you can (dashboard, or `node scripts/admin.mjs inquiries`).
-- The checks reject anything the form wouldn't send.
--
-- Subject and tutor are checked for their shape only, so adding a tutor
-- or a subject in content/tutors/ never needs this file re-run. Levels
-- and formats are fixed lists: keep them in step with
-- content/tutors/taxonomy.mjs.
-- ============================================================

create table if not exists public.tutoring_inquiries (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  name             text not null check (char_length(btrim(name)) between 1 and 120),
  email            text not null check (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  student_level    text not null check (student_level in ('elementary', 'middle-school', 'high-school', 'college', 'other')),
  subject          text not null check (subject ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(subject) <= 40),
  preferred_tutor  text not null default 'no-preference'
                     check (preferred_tutor ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(preferred_tutor) <= 60),
  help_with        text not null check (char_length(btrim(help_with)) between 1 and 2000),
  format           text not null default 'no-preference' check (format in ('virtual', 'in-person', 'no-preference')),
  additional_info  text check (additional_info is null or char_length(additional_info) <= 2000),
  consent          boolean not null check (consent),
  source_page      text check (source_page is null or char_length(source_page) <= 200),
  handled          boolean not null default false
);

alter table public.tutoring_inquiries enable row level security;

drop policy if exists "Anyone can send a tutoring inquiry" on public.tutoring_inquiries;
create policy "Anyone can send a tutoring inquiry"
  on public.tutoring_inquiries for insert
  to anon, authenticated
  with check (true);

-- Insert only, and only the form's own columns (not id, created_at or handled).
revoke all on public.tutoring_inquiries from anon, authenticated;
grant insert (name, email, student_level, subject, preferred_tutor, help_with,
              format, additional_info, consent, source_page)
  on public.tutoring_inquiries to anon, authenticated;

-- Basic flood protection: at most 20 tutoring inquiries per 10 minutes site-wide.
create or replace function public.tutoring_inquiries_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.tutoring_inquiries
      where created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'Too many inquiries right now. Please try again later.';
  end if;
  return new;
end;
$$;

revoke all on function public.tutoring_inquiries_rate_limit() from public;

drop trigger if exists tutoring_inquiries_rate_limit on public.tutoring_inquiries;
create trigger tutoring_inquiries_rate_limit
  before insert on public.tutoring_inquiries
  for each row execute function public.tutoring_inquiries_rate_limit();
