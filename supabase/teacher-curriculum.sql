-- ============================================================
-- TEACHER CURRICULUM: lesson plans with answer keys
-- (PRDs/lessonPlanLibrary.md; reference: docs/TEACHER-CURRICULUM.md)
--
-- Run in the Supabase SQL Editor AFTER setup.sql, progress.sql,
-- organizations.sql, resources.sql, curriculum.sql and catalog.sql (it uses
-- their roles, organizations and the catalog row
-- 'feature.teacher-curriculum'). Safe to run again.
--
-- The site's pages (teacher-curriculum/) are public and show each lesson's
-- overview. The complete plans (teaching timeline, worked solutions,
-- answer keys, misconceptions) live only in this table, and only teachers
-- can read them:
--   * platform admins, and direct accounts whose role is tutor or admin;
--   * owners, admins and instructors of an organization whose license
--     includes the Teacher Curriculum and has it switched on.
-- Students never can, whatever their organization.
--
-- Lessons are written to the table by `node scripts/admin.mjs
-- lessons-upload` (service role); the browser can only read, through
-- teacher_lesson(). There are no table grants for anon or authenticated.
-- ============================================================

-- 1. Lessons ------------------------------------------------------------------
create table if not exists public.teacher_lessons (
  id          text primary key check (id ~ '^[a-z0-9]+(\.[a-z0-9]+(-[a-z0-9]+)*)+$'),
  course_id   text not null,
  quarter     smallint not null check (quarter between 1 and 4),
  topic_id    text not null,
  title       text not null check (char_length(title) between 1 and 160),
  status      text not null default 'published' check (status in ('draft', 'review', 'published')),
  content     jsonb not null,                -- the full plan (format: docs/TEACHER-CURRICULUM.md)
  content_hash text not null,                -- lets lessons-upload skip lessons that haven't changed
  -- Room to grow (PRD 11): an organization's own version of a lesson.
  organization_id uuid references public.organizations (id) on delete cascade,
  updated_at  timestamptz not null default now()
);
create index if not exists teacher_lessons_topic_idx on public.teacher_lessons (topic_id);

alter table public.teacher_lessons enable row level security;
revoke all on public.teacher_lessons from anon, authenticated;
-- No policies: nobody reads the table directly. teacher_lesson() below
-- checks the caller and returns one lesson.

-- 2. Who is a teacher? -----------------------------------------------------------
create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
       public.is_platform_operator()
    or coalesce(public.my_role(), '') in ('tutor', 'admin')
    or exists (
         select 1 from public.organization_memberships m
         where m.user_id = auth.uid() and m.status = 'active'
           and m.role in ('owner', 'admin', 'instructor')
           and public.can_use_resource(m.organization_id, 'feature.teacher-curriculum')));
$$;

-- What the lesson pages need to know about the signed-in person.
create or replace function public.teacher_curriculum_access()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('signed_in', auth.uid() is not null, 'teacher', public.is_teacher());
$$;

-- 3. Reading a lesson ---------------------------------------------------------------
-- Returns {status: 'ok', lesson: {...}} for a teacher, {status: 'not_teacher'}
-- for anyone else, {status: 'missing'} when the lesson hasn't been uploaded.
-- Drafts are only for platform admins (review happens on the real page).
create or replace function public.teacher_lesson(p_id text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare r public.teacher_lessons%rowtype;
begin
  if not public.is_teacher() then return jsonb_build_object('status', 'not_teacher'); end if;
  select * into r from public.teacher_lessons t
   where t.id = p_id and t.organization_id is null
     and (t.status = 'published' or public.is_platform_operator());
  if not found then return jsonb_build_object('status', 'missing'); end if;
  return jsonb_build_object('status', 'ok', 'lesson', r.content, 'updated_at', r.updated_at, 'review', r.status <> 'published');
end;
$$;

revoke all on function public.is_teacher(), public.teacher_curriculum_access(), public.teacher_lesson(text) from public, anon;
grant execute on function public.teacher_curriculum_access(), public.teacher_lesson(text) to authenticated;
grant execute on function public.is_teacher() to authenticated;
