-- ============================================================
-- Mathlete MTB: Coaching & Progression Lab (run in Supabase -> SQL Editor,
-- after setup.sql). Safe to re-run: every statement is idempotent.
--
-- How it fits together
--   * Content lives in coach_* tables: skills, lessons, drills, mistakes,
--     media, pathways (these go through review), plus disciplines,
--     competencies and people (admin-managed, no review step).
--   * Each reviewed item has a WORKING COPY (the row you edit) and
--     PUBLISHED SNAPSHOTS in coach_versions. The public site only ever
--     reads published snapshots, so editing never changes what riders see
--     until the new version is reviewed and published. Rollback points the
--     live site back at an older snapshot.
--   * Review workflow: draft -> submitted -> approved -> published -> archived.
--     Any edit to a submitted, approved or published item sends its working
--     copy back to draft, so an approval always covers the exact content.
--   * Advanced and Class 3 (high-consequence) content can only be approved
--     by a specialist reviewer who didn't make the last edit.
--   * Nothing containing "SPECIALIST AUTHORING REQUIRED", or with open
--     specialist-authoring items, can be published. Class 3 lessons also need
--     a verified coach credited as reviewer.
--   * Lessons cite the sources they draw on (coach_sources, with the access
--     labels from the Advanced Performance Lesson Pack) as further learning.
--   * Nobody touches the tables directly: there are no table grants for
--     anon or authenticated. Everything goes through the coach_* functions
--     below, which check the caller's role in coach_editors.
--
-- Give someone CMS access (Table Editor -> coach_editors, or SQL):
--   insert into public.coach_editors (user_id, email, role, specialist)
--   select id, email, 'admin', true from auth.users where email = 'you@example.com'
--   on conflict (user_id) do update set role = excluded.role, specialist = excluded.specialist, active = true;
-- Roles: contributor (write drafts), reviewer (approve), admin (everything,
-- including publishing). "specialist" lets a reviewer approve advanced and
-- Class 3 content.
-- ============================================================

-- 0. Types ---------------------------------------------------------
do $$ begin
  create type public.coach_status as enum ('draft', 'submitted', 'approved', 'published', 'archived');
exception when duplicate_object then null; end $$;

-- 1. People with CMS access ---------------------------------------
create table if not exists public.coach_editors (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       text not null check (role in ('contributor', 'reviewer', 'admin')),
  specialist boolean not null default false,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Admin-managed reference content -------------------------------
create table if not exists public.coach_people (
  id          text primary key,
  name        text not null default '',
  bio         text not null default '',
  credentials text not null default '',
  specialties text[] not null default '{}',
  photo       text not null default '',
  verified    boolean not null default false,
  published   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create table if not exists public.coach_disciplines (
  id             text primary key,
  name           text not null default '',
  summary        text not null default '',
  description    text not null default '',
  image          text not null default '',
  display_order  int not null default 100,
  planned_topics text[] not null default '{}',
  published      boolean not null default true,
  updated_at     timestamptz not null default now()
);

create table if not exists public.coach_competencies (
  id            text primary key,
  name          text not null default '',
  description   text not null default '',
  display_order int not null default 100,
  updated_at    timestamptz not null default now()
);

-- Public sources lessons draw on and link to as "further learning".
-- access uses the content labels from the Advanced Performance Lesson Pack.
-- verification records what Mathlete could actually check on the page.
create table if not exists public.coach_sources (
  id           text primary key,
  title        text not null default '',
  creator      text not null default '',
  publisher    text not null default '',
  url          text not null default '' check (url = '' or url ~ '^https://'),
  access       text not null default 'public_reference_index' check (access in
                 ('public_free_instruction', 'public_outline_paid_lesson', 'public_coaching_framework',
                  'public_reference_index', 'expert_demonstration', 'mathlete_original')),
  kind         text not null default '',   -- instruction, athlete demonstration, editorial, course outline, index, standard
  published_on text not null default '',
  accessed_on  text not null default '',
  verification text not null default 'not_checked' check (verification in
                 ('text_reviewed', 'video_only', 'not_reachable', 'not_checked')),
  summary      text not null default '',   -- Mathlete's own notes of what the page verifiably covers
  limitations  text not null default '',
  topics       text[] not null default '{}',
  published    boolean not null default true,
  updated_at   timestamptz not null default now()
);

-- 3. Reviewed content (working copies) -----------------------------
-- Content columns all have defaults so drafts can be incomplete; what a
-- published item must contain is checked by coach_validate().

create table if not exists public.coach_media (
  id                text primary key,
  kind              text not null default 'instruction' check (kind in
                      ('instruction', 'demonstration', 'slow-motion', 'angle', 'mistake',
                       'drill', 'physics', 'analysis', 'commentary')),
  title             text not null default '',
  description       text not null default '',
  provider          text not null default 'youtube' check (provider in ('youtube', 'vimeo', 'hls', 'file')),
  ref               text not null default '',   -- YouTube/Vimeo id, or an https URL (HLS .m3u8 / MP4)
  thumbnail         text not null default '',
  duration_s        int check (duration_s is null or duration_s >= 0),
  captions_url      text not null default '',
  platform_captions boolean not null default false,  -- captions provided on YouTube/Vimeo itself
  chapters          jsonb not null default '[]',      -- [{ "t": seconds, "label": "..." }]
  license_status    text not null default 'unknown' check (license_status in ('original', 'licensed', 'permission', 'unknown')),
  creator           text not null default '',
  status            public.coach_status not null default 'draft',
  version           int not null default 0,
  published_version int,
  created_by        uuid, updated_by uuid, submitted_by uuid, approved_by uuid,
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.coach_drills (
  id                text primary key,
  name              text not null default '',
  objective         text not null default '',
  description       text not null default '',
  steps             text[] not null default '{}',
  equipment         text[] not null default '{}',
  environment       text not null default '',
  duration_min      int check (duration_min is null or duration_min between 1 and 240),
  reps              text not null default '',
  level             text not null default '' check (level in ('', 'beginner', 'intermediate', 'advanced', 'expert')),
  safety            text[] not null default '{}',
  success           text[] not null default '{}',
  common_errors     text[] not null default '{}',
  next_drill_id     text references public.coach_drills (id) on delete set null,
  media_id          text references public.coach_media (id) on delete set null,
  status            public.coach_status not null default 'draft',
  version           int not null default 0,
  published_version int,
  created_by        uuid, updated_by uuid, submitted_by uuid, approved_by uuid,
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (next_drill_id is null or next_drill_id <> id)
);

create table if not exists public.coach_mistakes (
  id                text primary key,
  name              text not null default '',
  description       text not null default '',
  looks_like        text not null default '',
  cause             text not null default '',
  correction        text not null default '',
  drill_id          text references public.coach_drills (id) on delete set null,
  media_id          text references public.coach_media (id) on delete set null,
  status            public.coach_status not null default 'draft',
  version           int not null default 0,
  published_version int,
  created_by        uuid, updated_by uuid, submitted_by uuid, approved_by uuid,
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.coach_skills (
  id                  text primary key,
  name                text not null default '',
  summary             text not null default '',
  difficulty          text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced', 'expert')),
  safety_class        smallint not null default 1 check (safety_class between 1 and 3),
  bike_types          text[] not null default '{}',
  environment         text not null default '',
  learning_commitment text not null default '',
  why_it_matters      text not null default '',
  keywords            text[] not null default '{}',
  featured            boolean not null default false,
  status              public.coach_status not null default 'draft',
  version             int not null default 0,
  published_version   int,
  created_by          uuid, updated_by uuid, submitted_by uuid, approved_by uuid,
  approved_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.coach_skill_disciplines (
  skill_id      text not null references public.coach_skills (id) on delete cascade,
  discipline_id text not null references public.coach_disciplines (id) on delete restrict,
  is_primary    boolean not null default false,
  primary key (skill_id, discipline_id)
);

create table if not exists public.coach_skill_competencies (
  skill_id      text not null references public.coach_skills (id) on delete cascade,
  competency_id text not null references public.coach_competencies (id) on delete restrict,
  importance    text not null default 'primary' check (importance in ('primary', 'supporting')),
  primary key (skill_id, competency_id)
);

create table if not exists public.coach_prerequisites (
  skill_id  text not null references public.coach_skills (id) on delete cascade,
  prereq_id text not null references public.coach_skills (id) on delete restrict,
  kind      text not null default 'required' check (kind in ('required', 'recommended', 'optional')),
  sort      int not null default 0,
  primary key (skill_id, prereq_id),
  check (skill_id <> prereq_id)
);

create table if not exists public.coach_related_skills (
  skill_id   text not null references public.coach_skills (id) on delete cascade,
  related_id text not null references public.coach_skills (id) on delete cascade,
  primary key (skill_id, related_id),
  check (skill_id <> related_id)
);

create table if not exists public.coach_lessons (
  id                text primary key,
  skill_id          text references public.coach_skills (id) on delete restrict,
  title             text not null default '',
  is_primary        boolean not null default true,
  introduction      text not null default '',
  objectives        text[] not null default '{}',
  -- { "summary": "", "concepts": [""], "blocks": [{ "heading": "", "body": "", "demo": "" }] }
  physics           jsonb not null default '{}',
  -- [{ "title", "result", "movement", "interaction", "cues": [], "errors": [], "media_id" }]
  technique         jsonb not null default '[]',
  -- { "equipment": [], "protective": [], "environments": [], "conditions": [],
  --   "supervision": false, "stop_conditions": [], "warnings": [] }
  safety            jsonb not null default '{}',
  status            public.coach_status not null default 'draft',
  version           int not null default 0,
  published_version int,
  created_by        uuid, updated_by uuid, submitted_by uuid, approved_by uuid,
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.coach_lesson_drills (
  lesson_id text not null references public.coach_lessons (id) on delete cascade,
  drill_id  text not null references public.coach_drills (id) on delete restrict,
  sort      int not null default 0,
  primary key (lesson_id, drill_id)
);

create table if not exists public.coach_lesson_mistakes (
  lesson_id  text not null references public.coach_lessons (id) on delete cascade,
  mistake_id text not null references public.coach_mistakes (id) on delete restrict,
  sort       int not null default 0,
  primary key (lesson_id, mistake_id)
);

create table if not exists public.coach_lesson_media (
  lesson_id text not null references public.coach_lessons (id) on delete cascade,
  media_id  text not null references public.coach_media (id) on delete restrict,
  sort      int not null default 0,
  primary key (lesson_id, media_id)
);

create table if not exists public.coach_lesson_contributors (
  lesson_id text not null references public.coach_lessons (id) on delete cascade,
  person_id text not null references public.coach_people (id) on delete restrict,
  role      text not null default 'author' check (role in ('author', 'reviewer', 'demo-rider', 'coach')),
  sort      int not null default 0,
  primary key (lesson_id, person_id, role)
);

-- Performance lesson sections (Advanced Performance Lesson Pack, section 5).
alter table public.coach_lessons add column if not exists lesson_type text not null default 'foundation';
alter table public.coach_lessons add column if not exists audience text not null default '';
alter table public.coach_lessons add column if not exists performance_outcome text not null default '';
-- { "setting": "", "focus": "", "feedback": "", "stop": [], "notes": "" }
alter table public.coach_lessons add column if not exists practice jsonb not null default '{}';
alter table public.coach_lessons add column if not exists rubric text[] not null default '{}';      -- video-analysis observations
alter table public.coach_lessons add column if not exists readiness text[] not null default '{}';   -- progression gates (not certification)
alter table public.coach_lessons add column if not exists review_level text not null default '';   -- expertise the reviewer needs
-- [{ "section": "technique", "needs": "What the specialist must supply" }]
alter table public.coach_lessons add column if not exists specialist_required jsonb not null default '[]';

create table if not exists public.coach_lesson_sources (
  lesson_id text not null references public.coach_lessons (id) on delete cascade,
  source_id text not null references public.coach_sources (id) on delete restrict,
  role      text not null default 'primary' check (role in ('primary', 'comparison', 'further')),
  note      text not null default '',
  sort      int not null default 0,
  primary key (lesson_id, source_id)
);

create table if not exists public.coach_pathways (
  id                text primary key,
  name              text not null default '',
  target_skill_id   text references public.coach_skills (id) on delete restrict,
  description       text not null default '',
  status            public.coach_status not null default 'draft',
  version           int not null default 0,
  published_version int,
  created_by        uuid, updated_by uuid, submitted_by uuid, approved_by uuid,
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Stage kinds cover the PRD's progression types: a pathway is linear when
-- every stage is 'required' with mode 'all'; mode 'any' makes a branching
-- stage (any one of its lessons); 'optional' is supporting material;
-- 'assessment' needs a demonstrated competency; supervision = coach-supervised.
create table if not exists public.coach_pathway_stages (
  pathway_id  text not null references public.coach_pathways (id) on delete cascade,
  stage_order int not null check (stage_order >= 1),
  title       text not null default '',
  description text not null default '',
  kind        text not null default 'required' check (kind in ('required', 'optional', 'assessment')),
  mode        text not null default 'all' check (mode in ('all', 'any')),
  practical   boolean not null default false,  -- involves riding, not just learning
  supervision boolean not null default false,  -- needs a qualified coach present
  readiness   text[] not null default '{}',
  primary key (pathway_id, stage_order)
);

create table if not exists public.coach_stage_lessons (
  pathway_id  text not null,
  stage_order int not null,
  lesson_id   text not null references public.coach_lessons (id) on delete restrict,
  sort        int not null default 0,
  primary key (pathway_id, stage_order, lesson_id),
  foreign key (pathway_id, stage_order) references public.coach_pathway_stages (pathway_id, stage_order) on delete cascade
);

-- 4. Published snapshots and the activity log ----------------------
create table if not exists public.coach_versions (
  type         text not null,
  id           text not null,
  version      int not null,
  snapshot     jsonb not null,
  published_at timestamptz not null default now(),
  published_by uuid,
  note         text not null default '',
  primary key (type, id, version)
);

alter table public.coach_versions add column if not exists approved_by uuid;

create table if not exists public.coach_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor       uuid,
  type        text not null,
  item_id     text not null,
  action      text not null,
  from_status text,
  to_status   text,
  version     int,
  note        text not null default ''
);
create index if not exists coach_log_at on public.coach_log (at desc);
create index if not exists coach_log_actor_at on public.coach_log (actor, at desc);

-- Row level security on, and no policies or grants: the tables are
-- reachable only through the functions below.
do $$
declare t text;
begin
  foreach t in array array['coach_editors', 'coach_people', 'coach_disciplines', 'coach_competencies', 'coach_sources', 'coach_lesson_sources',
    'coach_media', 'coach_drills', 'coach_mistakes', 'coach_skills', 'coach_skill_disciplines',
    'coach_skill_competencies', 'coach_prerequisites', 'coach_related_skills', 'coach_lessons',
    'coach_lesson_drills', 'coach_lesson_mistakes', 'coach_lesson_media', 'coach_lesson_contributors',
    'coach_pathways', 'coach_pathway_stages', 'coach_stage_lessons', 'coach_versions', 'coach_log']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- 5. No circular prerequisites ---------------------------------------
create or replace function public.coach__no_prereq_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    with recursive chain(id) as (
      select new.prereq_id
      union
      select p.prereq_id from public.coach_prerequisites p join chain c on p.skill_id = c.id
    )
    select 1 from chain where id = new.skill_id
  ) then
    raise exception 'Circular prerequisite: "%" already depends on "%"', new.prereq_id, new.skill_id
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists coach_no_prereq_cycle on public.coach_prerequisites;
create trigger coach_no_prereq_cycle
  after insert or update on public.coach_prerequisites
  for each row execute function public.coach__no_prereq_cycle();

-- 6. Internal helpers (not callable from the website) ----------------
create or replace function public.coach__tbl(p_type text)
returns text language sql immutable set search_path = '' as $$
  select case p_type
    when 'skill' then 'coach_skills'       when 'lesson' then 'coach_lessons'
    when 'drill' then 'coach_drills'       when 'mistake' then 'coach_mistakes'
    when 'media' then 'coach_media'        when 'pathway' then 'coach_pathways'
    when 'discipline' then 'coach_disciplines' when 'competency' then 'coach_competencies'
    when 'person' then 'coach_people'      when 'source' then 'coach_sources'
  end;
$$;

create or replace function public.coach__reviewed(p_type text)
returns boolean language sql immutable set search_path = '' as $$
  select p_type in ('skill', 'lesson', 'drill', 'mistake', 'media', 'pathway');
$$;

create or replace function public.coach__meta_cols()
returns text[] language sql immutable set search_path = '' as $$
  select array['status', 'version', 'published_version', 'created_by', 'updated_by', 'submitted_by',
               'approved_by', 'approved_at', 'created_at', 'updated_at'];
$$;

create or replace function public.coach__check_type(p_type text)
returns text language plpgsql immutable set search_path = '' as $$
begin
  if public.coach__tbl(p_type) is null then
    raise exception 'Unknown content type "%"', coalesce(p_type, '') using errcode = '22023';
  end if;
  return public.coach__tbl(p_type);
end;
$$;

-- The item as one JSON object, relationships included. Same shape the
-- website reads, the CMS edits, and content/coaching/seed.json uses.
create or replace function public.coach__snapshot(p_type text, p_id text)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  base jsonb;
begin
  execute format('select to_jsonb(t) - $2::text[] from public.%I t where t.id = $1', public.coach__check_type(p_type))
    into base using p_id, public.coach__meta_cols() || array['published'];
  if base is null then return null; end if;
  if p_type in ('discipline', 'person', 'source') then
    execute format('select to_jsonb(t) - ''updated_at'' from public.%I t where t.id = $1', public.coach__tbl(p_type))
      into base using p_id;
  elsif p_type = 'competency' then
    base := base - 'updated_at';
  elsif p_type = 'skill' then
    base := base || jsonb_build_object(
      'disciplines', coalesce((select jsonb_agg(jsonb_build_object('id', d.discipline_id, 'primary', d.is_primary)
                                 order by d.is_primary desc, d.discipline_id)
                               from public.coach_skill_disciplines d where d.skill_id = p_id), '[]'::jsonb),
      'competencies', coalesce((select jsonb_agg(jsonb_build_object('id', c.competency_id, 'importance', c.importance)
                                  order by c.importance desc, c.competency_id)
                                from public.coach_skill_competencies c where c.skill_id = p_id), '[]'::jsonb),
      'prerequisites', coalesce((select jsonb_agg(jsonb_build_object('id', p.prereq_id, 'kind', p.kind)
                                   order by p.sort, p.prereq_id)
                                 from public.coach_prerequisites p where p.skill_id = p_id), '[]'::jsonb),
      'related', coalesce((select jsonb_agg(r.related_id order by r.related_id)
                           from public.coach_related_skills r where r.skill_id = p_id), '[]'::jsonb));
  elsif p_type = 'lesson' then
    base := base || jsonb_build_object(
      'drills', coalesce((select jsonb_agg(x.drill_id order by x.sort, x.drill_id)
                          from public.coach_lesson_drills x where x.lesson_id = p_id), '[]'::jsonb),
      'mistakes', coalesce((select jsonb_agg(x.mistake_id order by x.sort, x.mistake_id)
                            from public.coach_lesson_mistakes x where x.lesson_id = p_id), '[]'::jsonb),
      'media', coalesce((select jsonb_agg(x.media_id order by x.sort, x.media_id)
                         from public.coach_lesson_media x where x.lesson_id = p_id), '[]'::jsonb),
      'contributors', coalesce((select jsonb_agg(jsonb_build_object('id', x.person_id, 'role', x.role)
                                  order by x.sort, x.person_id, x.role)
                                from public.coach_lesson_contributors x where x.lesson_id = p_id), '[]'::jsonb),
      'sources', coalesce((select jsonb_agg(jsonb_build_object('id', x.source_id, 'role', x.role, 'note', x.note)
                             order by x.sort, x.source_id)
                           from public.coach_lesson_sources x where x.lesson_id = p_id), '[]'::jsonb));
  elsif p_type = 'pathway' then
    base := base || jsonb_build_object(
      'stages', coalesce((select jsonb_agg(jsonb_build_object(
                  'title', s.title, 'description', s.description, 'kind', s.kind, 'mode', s.mode,
                  'practical', s.practical, 'supervision', s.supervision, 'readiness', to_jsonb(s.readiness),
                  'lessons', coalesce((select jsonb_agg(l.lesson_id order by l.sort, l.lesson_id)
                                       from public.coach_stage_lessons l
                                       where l.pathway_id = s.pathway_id and l.stage_order = s.stage_order), '[]'::jsonb))
                  order by s.stage_order)
                from public.coach_pathway_stages s where s.pathway_id = p_id), '[]'::jsonb));
  end if;
  return base;
end;
$$;

-- Everything an item points at, as (type, id) pairs.
create or replace function public.coach__refs(p_type text, s jsonb)
returns table (ref_type text, ref_id text)
language sql immutable set search_path = ''
as $$
  select t, i from (
    select 'discipline' t, x #>> '{}' i from jsonb_path_query(s, '$.disciplines[*].id') x where p_type = 'skill'
    union all select 'competency', x #>> '{}' from jsonb_path_query(s, '$.competencies[*].id') x where p_type = 'skill'
    union all select 'skill', x #>> '{}' from jsonb_path_query(s, '$.prerequisites[*].id') x where p_type = 'skill'
    union all select 'skill', x #>> '{}' from jsonb_path_query(s, '$.related[*]') x where p_type = 'skill'
    union all select 'skill', s ->> 'skill_id' where p_type = 'lesson'
    union all select 'drill', x #>> '{}' from jsonb_path_query(s, '$.drills[*]') x where p_type = 'lesson'
    union all select 'mistake', x #>> '{}' from jsonb_path_query(s, '$.mistakes[*]') x where p_type = 'lesson'
    union all select 'media', x #>> '{}' from jsonb_path_query(s, '$.media[*]') x where p_type = 'lesson'
    union all select 'media', x #>> '{}' from jsonb_path_query(s, '$.technique[*].media_id') x where p_type = 'lesson'
    union all select 'person', x #>> '{}' from jsonb_path_query(s, '$.contributors[*].id') x where p_type = 'lesson'
    union all select 'source', x #>> '{}' from jsonb_path_query(s, '$.sources[*].id') x where p_type = 'lesson'
    union all select 'drill', s ->> 'next_drill_id' where p_type = 'drill'
    union all select 'media', s ->> 'media_id' where p_type in ('drill', 'mistake')
    union all select 'drill', s ->> 'drill_id' where p_type = 'mistake'
    union all select 'skill', s ->> 'target_skill_id' where p_type = 'pathway'
    union all select 'lesson', x #>> '{}' from jsonb_path_query(s, '$.stages[*].lessons[*]') x where p_type = 'pathway'
  ) r where i is not null and i <> '';
$$;

-- Is this item on the live site?
create or replace function public.coach__live(p_type text, p_id text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare ok boolean;
begin
  if p_type = 'competency' then
    return exists (select 1 from public.coach_competencies where id = p_id);
  elsif p_type in ('discipline', 'person', 'source') then
    execute format('select published from public.%I where id = $1', public.coach__tbl(p_type)) into ok using p_id;
  else
    execute format('select published_version is not null and status <> ''archived'' from public.%I where id = $1',
                   public.coach__check_type(p_type)) into ok using p_id;
  end if;
  return coalesce(ok, false);
end;
$$;

-- Live (published) snapshot of every reviewed item.
create or replace view public.coach_live as
  select v.type, v.id, v.version, v.snapshot, v.published_at, v.approved_by from public.coach_versions v
  join (
    select 'skill' type, id, published_version, status from public.coach_skills
    union all select 'lesson', id, published_version, status from public.coach_lessons
    union all select 'drill', id, published_version, status from public.coach_drills
    union all select 'mistake', id, published_version, status from public.coach_mistakes
    union all select 'media', id, published_version, status from public.coach_media
    union all select 'pathway', id, published_version, status from public.coach_pathways
  ) w on w.type = v.type and w.id = v.id and w.published_version = v.version and w.status <> 'archived';
revoke all on public.coach_live from anon, authenticated;

-- Live items that point at this one (they would break if it went away).
create or replace function public.coach__dependents(p_type text, p_id text)
returns text[] language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(distinct l.type || ':' || l.id order by l.type || ':' || l.id), '{}')
  from public.coach_live l, public.coach__refs(l.type, l.snapshot) r
  where r.ref_type = p_type and r.ref_id = p_id and not (l.type = p_type and l.id = p_id);
$$;

-- Does this item need a specialist reviewer? Advanced/expert or Class 3
-- skills, and everything taught for them (lessons, pathways, and drills
-- and mistakes used by those lessons).
create or replace function public.coach__needs_specialist(p_type text, p_id text)
returns boolean language sql stable security definer set search_path = '' as $$
  with hard as (
    select id from public.coach_skills where safety_class = 3 or difficulty in ('advanced', 'expert')
  ), hard_lessons as (
    select id from public.coach_lessons where skill_id in (select id from hard)
  )
  select case p_type
    when 'skill' then exists (select 1 from hard where id = p_id)
    when 'lesson' then exists (select 1 from hard_lessons where id = p_id)
    when 'pathway' then exists (select 1 from public.coach_pathways where id = p_id and target_skill_id in (select id from hard))
    when 'drill' then exists (select 1 from public.coach_lesson_drills where drill_id = p_id and lesson_id in (select id from hard_lessons))
    when 'mistake' then exists (select 1 from public.coach_lesson_mistakes where mistake_id = p_id and lesson_id in (select id from hard_lessons))
    else false end;
$$;

create or replace function public.coach__arr_len(j jsonb)
returns int language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(j) = 'array' then jsonb_array_length(j) else 0 end;
$$;

create or replace function public.coach__blank(t text)
returns boolean language sql immutable set search_path = '' as $$
  select t is null or btrim(t) = '';
$$;

-- What's missing before this item can be submitted ("content") or
-- published ("links": everything it points at must already be live).
create or replace function public.coach__validate(p_type text, p_id text)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  s jsonb := public.coach__snapshot(p_type, p_id);
  c text[] := '{}';
  links text[] := '{}';
  cls int;
  sk jsonb;
  st jsonb;
  n int := 0;
  r record;
  pub text[] := '{}';
  tech_pending boolean := false;
begin
  if s is null then raise exception 'No % "%"', p_type, p_id using errcode = 'P0002'; end if;

  if p_type = 'skill' then
    if public.coach__blank(s->>'name') then c := array_append(c, 'Name is required'); end if;
    if public.coach__blank(s->>'summary') then c := array_append(c, 'Short description is required'); end if;
    if public.coach__blank(s->>'why_it_matters') then c := array_append(c, '"Why this skill matters" is required'); end if;
    if public.coach__blank(s->>'environment') then c := array_append(c, 'Required riding environment is required'); end if;
    if public.coach__arr_len(s->'disciplines') = 0 then c := array_append(c, 'Choose at least one discipline'); end if;
    if public.coach__arr_len(s->'competencies') = 0 then c := array_append(c, 'Connect at least one foundational competency'); end if;

  elsif p_type = 'lesson' then
    select safety_class into cls from public.coach_skills where id = s->>'skill_id';
    if s->>'skill_id' is null then c := array_append(c, 'Choose the skill this lesson teaches'); end if;
    if public.coach__blank(s->>'title') then c := array_append(c, 'Title is required'); end if;
    if public.coach__blank(s->>'introduction') then c := array_append(c, 'Introduction is required'); end if;
    if public.coach__arr_len(s->'objectives') = 0 then c := array_append(c, 'Add at least one learning objective'); end if;
    if public.coach__arr_len(s->'physics'->'blocks') = 0 then c := array_append(c, 'Add a physics or biomechanics explanation'); end if;
    -- Technique a specialist still has to write is listed in specialist_required
    -- instead; publishing stays blocked until it's supplied.
    tech_pending := exists (select 1 from jsonb_path_query(s, '$.specialist_required[*] ? (@.section == "technique")'));
    if public.coach__arr_len(s->'technique') = 0 and not tech_pending then c := array_append(c, 'Add at least one technique stage'); end if;
    for st in select * from jsonb_array_elements(case when jsonb_typeof(s->'technique') = 'array' then s->'technique' else '[]' end) loop
      n := n + 1;
      if public.coach__blank(st->>'title') then c := array_append(c, ('Technique stage ' || n || ' needs a title')); end if;
      if public.coach__arr_len(st->'cues') = 0 and not tech_pending then c := array_append(c, ('Technique stage ' || n || ' needs at least one coaching cue')); end if;
    end loop;
    if public.coach__blank(s->>'performance_outcome') then c := array_append(c, 'Describe the performance outcome'); end if;
    if public.coach__blank(s->>'audience') then c := array_append(c, 'Say who this lesson is for'); end if;
    if public.coach__arr_len(s->'rubric') = 0 then c := array_append(c, 'Add at least one video-analysis observation'); end if;
    if public.coach__arr_len(s->'sources') = 0 then c := array_append(c, 'Cite at least one source'); end if;
    if public.coach__arr_len(s->'mistakes') = 0 then c := array_append(c, 'Add at least one common mistake'); end if;
    if public.coach__arr_len(s->'drills') = 0 then c := array_append(c, 'Add at least one practice drill'); end if;
    if public.coach__arr_len(s->'safety'->'protective') = 0 then c := array_append(c, 'Safety: list protective equipment'); end if;
    if public.coach__arr_len(s->'safety'->'stop_conditions') = 0 then c := array_append(c, 'Safety: list stop conditions'); end if;
    if coalesce(cls, 1) >= 2 and public.coach__arr_len(s->'safety'->'environments') = 0 then
      c := array_append(c, 'Safety: Class 2 and 3 lessons must name suitable training environments');
    end if;
    if cls = 3 and coalesce((s->'safety'->>'supervision')::boolean, false) is not true then
      c := array_append(c, 'Safety: Class 3 lessons must require coach supervision');
    end if;
    if not exists (select 1 from jsonb_path_query(s, '$.contributors[*] ? (@.role == "author")')) then
      c := array_append(c, 'Credit at least one author');
    end if;

  elsif p_type = 'drill' then
    if public.coach__blank(s->>'name') then c := array_append(c, 'Name is required'); end if;
    if public.coach__blank(s->>'objective') then c := array_append(c, 'Objective is required'); end if;
    if public.coach__arr_len(s->'steps') = 0 then c := array_append(c, 'Add at least one step'); end if;
    if public.coach__blank(s->>'environment') then c := array_append(c, 'Required environment is required'); end if;
    if public.coach__blank(s->>'level') then c := array_append(c, 'Ability level is required'); end if;
    if public.coach__arr_len(s->'safety') = 0 then c := array_append(c, 'Add at least one safety condition'); end if;
    if public.coach__arr_len(s->'success') = 0 then c := array_append(c, 'Add at least one success indicator'); end if;
    if s->>'duration_min' is null and public.coach__blank(s->>'reps') then c := array_append(c, 'Give a duration or repetitions'); end if;

  elsif p_type = 'mistake' then
    if public.coach__blank(s->>'name') then c := array_append(c, 'Name is required'); end if;
    if public.coach__blank(s->>'description') then c := array_append(c, 'Description is required'); end if;
    if public.coach__blank(s->>'correction') then c := array_append(c, 'Coaching correction is required'); end if;

  elsif p_type = 'media' then
    if public.coach__blank(s->>'title') then c := array_append(c, 'Title is required'); end if;
    if public.coach__blank(s->>'ref') then c := array_append(c, 'Video ID or URL is required'); end if;
    if s->>'provider' in ('hls', 'file') and (s->>'ref') !~ '^https://' then c := array_append(c, 'Video URL must start with https://'); end if;
    if s->>'license_status' = 'unknown' then c := array_append(c, 'Confirm the copyright/licensing status'); end if;
    if public.coach__blank(s->>'captions_url') and coalesce((s->>'platform_captions')::boolean, false) is not true then
      c := array_append(c, 'Add captions (a .vtt file, or confirm captions on YouTube/Vimeo)');
    end if;

  elsif p_type = 'pathway' then
    select safety_class into cls from public.coach_skills where id = s->>'target_skill_id';
    if public.coach__blank(s->>'name') then c := array_append(c, 'Name is required'); end if;
    if s->>'target_skill_id' is null then c := array_append(c, 'Choose the target skill'); end if;
    if public.coach__arr_len(s->'stages') = 0 then c := array_append(c, 'Add at least one stage'); end if;
    n := 0;
    for st in select * from jsonb_array_elements(case when jsonb_typeof(s->'stages') = 'array' then s->'stages' else '[]' end) loop
      n := n + 1;
      if public.coach__blank(st->>'title') then c := array_append(c, ('Stage ' || n || ' needs a title')); end if;
      if public.coach__arr_len(st->'lessons') = 0 then c := array_append(c, ('Stage ' || n || ' needs at least one lesson')); end if;
      if coalesce((st->>'practical')::boolean, false) and coalesce(cls, 1) >= 2 and public.coach__arr_len(st->'readiness') = 0 then
        c := array_append(c, ('Stage ' || n || ': practical stages for Class 2 and 3 skills need readiness criteria'));
      end if;
      if coalesce((st->>'practical')::boolean, false) and cls = 3 and coalesce((st->>'supervision')::boolean, false) is not true then
        c := array_append(c, ('Stage ' || n || ': practical stages for Class 3 skills must require coach supervision'));
      end if;
      if st->>'kind' = 'assessment' and public.coach__arr_len(st->'readiness') = 0 then
        c := array_append(c, ('Stage ' || n || ': assessment stages need readiness criteria'));
      end if;
    end loop;
  end if;

  for r in select distinct ref_type, ref_id from public.coach__refs(p_type, s) loop
    if not public.coach__live(r.ref_type, r.ref_id) then
      links := links || format('%s "%s" is not published yet', initcap(r.ref_type), r.ref_id);
    end if;
  end loop;

  -- Only checked when publishing: what a specialist still has to supply.
  if s::text ilike '%SPECIALIST AUTHORING REQUIRED%' then
    pub := array_append(pub, 'Parts are still marked SPECIALIST AUTHORING REQUIRED');
  end if;
  if p_type = 'lesson' then
    for st in select * from jsonb_array_elements(case when jsonb_typeof(s->'specialist_required') = 'array' then s->'specialist_required' else '[]' end) loop
      pub := array_append(pub, format('Specialist must supply (%s): %s', coalesce(st->>'section', 'lesson'), coalesce(st->>'needs', '')));
    end loop;
    if cls = 3 and not exists (
      select 1 from public.coach_lesson_contributors x join public.coach_people p on p.id = x.person_id
      where x.lesson_id = p_id and x.role = 'reviewer' and p.verified and p.published) then
      pub := array_append(pub, 'Class 3: credit a verified specialist coach as reviewer');
    end if;
  end if;

  return jsonb_build_object('content', to_jsonb(c), 'links', to_jsonb(links), 'publish', to_jsonb(pub));
end;
$$;

-- Write an item and its relationships from JSON. Missing keys are left as
-- they are; relationship keys present in the payload replace the old set.
-- Any change to a reviewed item's content sends it back to draft.
create or replace function public.coach__write(p_type text, p_payload jsonb, p_actor uuid)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  tbl text := public.coach__check_type(p_type);
  v_id text := p_payload->>'id';
  before jsonb;
  after jsonb;
  cols text;
  rcols text;
  nulls text[];
  e jsonb;
  st jsonb;
  i int;
  k int;
begin
  if v_id is null or v_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(v_id) > 64 then
    raise exception 'Invalid id "%": use 1-64 lowercase letters, numbers and single hyphens', coalesce(v_id, '')
      using errcode = '22023';
  end if;

  before := public.coach__snapshot(p_type, v_id);
  if before is null then
    execute format('insert into public.%I (id) values ($1)', tbl) using v_id;
  end if;

  -- JSON null for a not-null column means "leave it"; for a nullable
  -- column (links, durations) it clears the value.
  select array_agg(column_name::text) into nulls
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = tbl and c.is_nullable = 'NO'
    and p_payload ? c.column_name::text and jsonb_typeof(p_payload -> c.column_name::text) = 'null';
  p_payload := p_payload - coalesce(nulls, '{}');

  select string_agg(quote_ident(column_name), ', ' order by ordinal_position),
         string_agg('r.' || quote_ident(column_name), ', ' order by ordinal_position)
    into cols, rcols
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = tbl
    and c.column_name::text <> all (public.coach__meta_cols() || array['id'])
    and p_payload ? c.column_name::text;

  if cols is not null then
    execute format('update public.%I t set (%s) = (select %s from jsonb_populate_record(t, $1) r) where t.id = $2',
                   tbl, cols, rcols) using p_payload, v_id;
  end if;

  if p_type = 'skill' then
    if p_payload ? 'disciplines' then
      delete from public.coach_skill_disciplines where skill_id = v_id;
      insert into public.coach_skill_disciplines (skill_id, discipline_id, is_primary)
        select v_id, x->>'id', coalesce((x->>'primary')::boolean, false)
        from jsonb_array_elements(p_payload->'disciplines') x;
    end if;
    if p_payload ? 'competencies' then
      delete from public.coach_skill_competencies where skill_id = v_id;
      insert into public.coach_skill_competencies (skill_id, competency_id, importance)
        select v_id, x->>'id', coalesce(x->>'importance', 'primary')
        from jsonb_array_elements(p_payload->'competencies') x;
    end if;
    if p_payload ? 'prerequisites' then
      delete from public.coach_prerequisites where skill_id = v_id;
      insert into public.coach_prerequisites (skill_id, prereq_id, kind, sort)
        select v_id, x->>'id', coalesce(x->>'kind', 'required'), (o - 1)::int
        from jsonb_array_elements(p_payload->'prerequisites') with ordinality as a(x, o);
    end if;
    if p_payload ? 'related' then
      delete from public.coach_related_skills where skill_id = v_id;
      insert into public.coach_related_skills (skill_id, related_id)
        select distinct v_id, x #>> '{}' from jsonb_array_elements(p_payload->'related') x;
    end if;

  elsif p_type = 'lesson' then
    if p_payload ? 'drills' then
      delete from public.coach_lesson_drills where lesson_id = v_id;
      insert into public.coach_lesson_drills (lesson_id, drill_id, sort)
        select v_id, x #>> '{}', (o - 1)::int from jsonb_array_elements(p_payload->'drills') with ordinality as a(x, o);
    end if;
    if p_payload ? 'mistakes' then
      delete from public.coach_lesson_mistakes where lesson_id = v_id;
      insert into public.coach_lesson_mistakes (lesson_id, mistake_id, sort)
        select v_id, x #>> '{}', (o - 1)::int from jsonb_array_elements(p_payload->'mistakes') with ordinality as a(x, o);
    end if;
    if p_payload ? 'media' then
      delete from public.coach_lesson_media where lesson_id = v_id;
      insert into public.coach_lesson_media (lesson_id, media_id, sort)
        select v_id, x #>> '{}', (o - 1)::int from jsonb_array_elements(p_payload->'media') with ordinality as a(x, o);
    end if;
    if p_payload ? 'contributors' then
      delete from public.coach_lesson_contributors where lesson_id = v_id;
      insert into public.coach_lesson_contributors (lesson_id, person_id, role, sort)
        select v_id, x->>'id', coalesce(x->>'role', 'author'), (o - 1)::int
        from jsonb_array_elements(p_payload->'contributors') with ordinality as a(x, o);
    end if;

  end if;
  if p_type = 'lesson' and p_payload ? 'sources' then
    delete from public.coach_lesson_sources where lesson_id = v_id;
    insert into public.coach_lesson_sources (lesson_id, source_id, role, note, sort)
      select v_id, x->>'id', coalesce(x->>'role', 'primary'), coalesce(x->>'note', ''), (o - 1)::int
      from jsonb_array_elements(p_payload->'sources') with ordinality as a(x, o);
  end if;
  if p_type = 'pathway' and p_payload ? 'stages' then
    delete from public.coach_pathway_stages where pathway_id = v_id;
    i := 0;
    for st in select * from jsonb_array_elements(p_payload->'stages') loop
      i := i + 1;
      insert into public.coach_pathway_stages (pathway_id, stage_order, title, description, kind, mode, practical, supervision, readiness)
      values (v_id, i, coalesce(st->>'title', ''), coalesce(st->>'description', ''), coalesce(st->>'kind', 'required'),
              coalesce(st->>'mode', 'all'), coalesce((st->>'practical')::boolean, false),
              coalesce((st->>'supervision')::boolean, false),
              coalesce((select array_agg(x #>> '{}') from jsonb_array_elements(st->'readiness') x), '{}'));
      k := 0;
      for e in select * from jsonb_array_elements(coalesce(st->'lessons', '[]')) loop
        insert into public.coach_stage_lessons (pathway_id, stage_order, lesson_id, sort) values (v_id, i, e #>> '{}', k);
        k := k + 1;
      end loop;
    end loop;
  end if;

  after := public.coach__snapshot(p_type, v_id);

  if public.coach__reviewed(p_type) then
    if before is null or before is distinct from after then
      execute format(
        'update public.%I set version = version + 1, status = ''draft'', updated_by = $2, updated_at = now(),
           created_by = coalesce(created_by, $2), submitted_by = null, approved_by = null, approved_at = null
         where id = $1', tbl) using v_id, p_actor;
    end if;
  elsif before is distinct from after then
    execute format('update public.%I set updated_at = now() where id = $1', tbl) using v_id;
  end if;

  return after;
end;
$$;

-- Load content/coaching/seed.json (supabase/coaching-seed.sql calls this).
-- Only adds items whose id isn't in the database yet, so re-running it
-- never overwrites what you've edited in the CMS.
create or replace function public.coach__seed(p jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  order_ text[] := array['person', 'source', 'discipline', 'competency', 'media', 'drill', 'mistake', 'skill', 'lesson', 'pathway'];
  keys_ text[]  := array['people', 'sources', 'disciplines', 'competencies', 'media', 'drills', 'mistakes', 'skills', 'lessons', 'pathways'];
  t text;
  x jsonb;
  added int := 0;
  skipped int := 0;
  fresh text[] := '{}';
  exists_ boolean;
begin
  -- Pass 1: create empty rows for new ids, so items can point at each other in any order.
  for i in 1 .. array_length(order_, 1) loop
    t := order_[i];
    for x in select * from jsonb_array_elements(coalesce(p->keys_[i], '[]')) loop
      execute format('select exists (select 1 from public.%I where id = $1)', public.coach__tbl(t)) into exists_ using x->>'id';
      if exists_ then
        skipped := skipped + 1;
      else
        execute format('insert into public.%I (id) values ($1)', public.coach__tbl(t)) using x->>'id';
        fresh := fresh || (t || ':' || (x->>'id'));
      end if;
    end loop;
  end loop;
  -- Pass 2: fill them in.
  for i in 1 .. array_length(order_, 1) loop
    t := order_[i];
    for x in select * from jsonb_array_elements(coalesce(p->keys_[i], '[]')) loop
      if (t || ':' || (x->>'id')) = any (fresh) then
        perform public.coach__write(t, x, null);
        added := added + 1;
      end if;
    end loop;
  end loop;
  insert into public.coach_log (type, item_id, action, note) values ('seed', '-', 'seed', added || ' added, ' || skipped || ' already there');
  return jsonb_build_object('added', added, 'skipped', skipped);
end;
$$;

-- 7. Functions the website calls -----------------------------------
create or replace function public.coach_role()
returns text language sql stable security definer set search_path = '' as $$
  select e.role from public.coach_editors e where e.user_id = auth.uid() and e.active;
$$;

create or replace function public.coach_my_role()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('role', e.role, 'specialist', e.specialist, 'email', e.email)
  from public.coach_editors e where e.user_id = auth.uid() and e.active;
$$;

create or replace function public.coach__require(p_roles text[])
returns text language plpgsql stable security definer set search_path = '' as $$
declare r text := public.coach_role();
begin
  if r is null or r <> all (p_roles) then
    raise exception 'You don''t have permission to do that' using errcode = '42501';
  end if;
  return r;
end;
$$;

-- The whole published library, for the website. Editors can pass
-- preview => true to see working copies (drafts) instead.
create or replace function public.coach_catalog(p_preview boolean default false)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  preview boolean := p_preview and public.coach_role() is not null;
  out_ jsonb := jsonb_build_object('generated_at', now(), 'preview', preview);
  types text[] := array['skill', 'lesson', 'drill', 'mistake', 'media', 'pathway'];
  keys_ text[] := array['skills', 'lessons', 'drills', 'mistakes', 'media', 'pathways'];
  items jsonb;
begin
  for i in 1 .. 6 loop
    if preview then
      execute format(
        'select coalesce(jsonb_agg(public.coach__snapshot(%L, t.id) || jsonb_build_object(''_status'', t.status, ''_version'', t.version) order by t.id), ''[]'')
         from public.%I t where t.status <> ''archived''', types[i], public.coach__tbl(types[i])) into items;
    else
      select coalesce(jsonb_agg(l.snapshot || jsonb_build_object('_published_at', l.published_at, '_version', l.version) order by l.id), '[]')
        into items from public.coach_live l where l.type = types[i];
    end if;
    out_ := out_ || jsonb_build_object(keys_[i], items);
  end loop;
  return out_ || jsonb_build_object(
    'disciplines', (select coalesce(jsonb_agg(public.coach__snapshot('discipline', d.id) order by d.display_order, d.id), '[]')
                    from public.coach_disciplines d where d.published),
    'competencies', (select coalesce(jsonb_agg(public.coach__snapshot('competency', c.id) order by c.display_order, c.id), '[]')
                     from public.coach_competencies c),
    'people', (select coalesce(jsonb_agg(public.coach__snapshot('person', p.id) order by p.name), '[]')
               from public.coach_people p where p.published),
    'sources', (select coalesce(jsonb_agg(public.coach__snapshot('source', x.id) order by x.id), '[]')
                from public.coach_sources x where x.published));
end;
$$;

create or replace function public.coach_save(p_type text, p_payload jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  r text := public.coach__require(array['contributor', 'reviewer', 'admin']);
  tbl text := public.coach__check_type(p_type);
  v_id text := p_payload->>'id';
  cur record;
  n_rows int;
  before_v int;
  after_ jsonb;
  after_v int;
begin
  if (select count(*) from public.coach_log where actor = auth.uid() and at > now() - interval '10 minutes') >= 300 then
    raise exception 'Too many changes in a short time. Wait a few minutes and try again.' using errcode = '54000';
  end if;
  if not public.coach__reviewed(p_type) then
    perform public.coach__require(array['admin']);
  elsif r = 'contributor' then
    execute format('select status::text as status, created_by from public.%I where id = $1', tbl) into cur using v_id;
    get diagnostics n_rows = row_count;
    if n_rows > 0 and (cur.created_by is distinct from auth.uid() or cur.status <> 'draft') then
      raise exception 'Contributors can only edit their own drafts' using errcode = '42501';
    end if;
  end if;

  if public.coach__reviewed(p_type) then
    execute format('select version from public.%I where id = $1', tbl) into before_v using v_id;
  end if;
  after_ := public.coach__write(p_type, p_payload, auth.uid());
  if public.coach__reviewed(p_type) then
    execute format('select version from public.%I where id = $1', tbl) into after_v using v_id;
  end if;
  if before_v is distinct from after_v or not public.coach__reviewed(p_type) then
    insert into public.coach_log (actor, type, item_id, action, to_status, version)
    values (auth.uid(), p_type, v_id, case when before_v is null then 'create' else 'edit' end,
            case when public.coach__reviewed(p_type) then 'draft' end, after_v);
  end if;
  return after_;
end;
$$;

create or replace function public.coach_validate(p_type text, p_id text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.coach__require(array['contributor', 'reviewer', 'admin']);
  if not public.coach__reviewed(p_type) then
    return jsonb_build_object('content', '[]'::jsonb, 'links', '[]'::jsonb, 'publish', '[]'::jsonb);
  end if;
  return public.coach__validate(p_type, p_id);
end;
$$;

-- Move an item through the review workflow.
create or replace function public.coach_transition(p_type text, p_id text, p_to text, p_note text default '')
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  r text := public.coach__require(array['contributor', 'reviewer', 'admin']);
  me uuid := auth.uid();
  tbl text := public.coach__check_type(p_type);
  cur record;
  n_rows int;
  v jsonb;
  deps text[];
  approver uuid;
  specialist boolean := coalesce((select e.specialist from public.coach_editors e where e.user_id = me), false);
  problems text;
begin
  if not public.coach__reviewed(p_type) then
    raise exception '% items don''t go through review', initcap(p_type) using errcode = '22023';
  end if;
  execute format('select status::text as status, version, created_by, updated_by, submitted_by from public.%I where id = $1 for update', tbl)
    into cur using p_id;
  get diagnostics n_rows = row_count;
  if n_rows = 0 then raise exception 'No % "%"', p_type, p_id using errcode = 'P0002'; end if;
  v := public.coach__validate(p_type, p_id);

  if cur.status = 'draft' and p_to = 'submitted' then
    if r = 'contributor' and cur.created_by is distinct from me then
      raise exception 'Contributors can only submit their own drafts' using errcode = '42501';
    end if;
    if jsonb_array_length(v->'content') > 0 then
      select string_agg(x, '; ') into problems from jsonb_array_elements_text(v->'content') x;
      raise exception 'Not ready for review: %', problems using errcode = '23514';
    end if;
    execute format('update public.%I set status = ''submitted'', submitted_by = $2 where id = $1', tbl) using p_id, me;

  elsif cur.status = 'submitted' and p_to = 'approved' then
    if r not in ('reviewer', 'admin') then
      raise exception 'Only reviewers can approve content' using errcode = '42501';
    end if;
    if public.coach__needs_specialist(p_type, p_id) then
      if not specialist then
        raise exception 'This is advanced or high-consequence content: it needs a specialist reviewer' using errcode = '42501';
      end if;
      if cur.updated_by = me then
        raise exception 'Advanced and high-consequence content must be approved by someone other than its last editor'
          using errcode = '42501';
      end if;
    end if;
    execute format('update public.%I set status = ''approved'', approved_by = $2, approved_at = now() where id = $1', tbl)
      using p_id, me;

  elsif cur.status in ('submitted', 'approved') and p_to = 'draft' then
    if r = 'contributor' and not (cur.status = 'submitted' and cur.submitted_by = me) then
      raise exception 'Only reviewers can send content back' using errcode = '42501';
    end if;
    execute format('update public.%I set status = ''draft'', submitted_by = null, approved_by = null, approved_at = null where id = $1', tbl)
      using p_id;

  elsif cur.status = 'approved' and p_to = 'published' then
    perform public.coach__require(array['admin']);
    if jsonb_array_length(v->'content') + jsonb_array_length(v->'links') + jsonb_array_length(v->'publish') > 0 then
      select string_agg(x, '; ') into problems from jsonb_array_elements_text((v->'content') || (v->'links') || (v->'publish')) x;
      raise exception 'Can''t publish yet: %', problems using errcode = '23514';
    end if;
    execute format('select approved_by from public.%I where id = $1', tbl) into approver using p_id;
    insert into public.coach_versions (type, id, version, snapshot, published_by, approved_by, note)
    values (p_type, p_id, cur.version, public.coach__snapshot(p_type, p_id), me, approver, coalesce(p_note, ''))
    on conflict (type, id, version) do nothing;
    execute format('update public.%I set status = ''published'', published_version = version where id = $1', tbl) using p_id;

  elsif cur.status <> 'archived' and p_to = 'archived' then
    perform public.coach__require(array['admin']);
    deps := public.coach__dependents(p_type, p_id);
    if cardinality(deps) > 0 then
      raise exception 'Can''t archive: published content links to it (%). Remove those links first.', array_to_string(deps, ', ')
        using errcode = '23503';
    end if;
    execute format('update public.%I set status = ''archived'', published_version = null where id = $1', tbl) using p_id;

  elsif cur.status = 'archived' and p_to = 'draft' then
    perform public.coach__require(array['admin']);
    execute format('update public.%I set status = ''draft'' where id = $1', tbl) using p_id;

  else
    raise exception 'Can''t move from % to %', cur.status, coalesce(p_to, '?') using errcode = '22023';
  end if;

  insert into public.coach_log (actor, type, item_id, action, from_status, to_status, version, note)
  values (me, p_type, p_id, 'status', cur.status, p_to, cur.version, coalesce(p_note, ''));
  return jsonb_build_object('status', p_to, 'version', cur.version);
end;
$$;

-- Put an older published version back on the live site. The working copy
-- is restored to it too, and the rollback is recorded as a new version.
create or replace function public.coach_rollback(p_type text, p_id text, p_version int, p_note text default '')
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  tbl text := public.coach__check_type(p_type);
  snap jsonb;
  v jsonb;
  problems text;
  new_v int;
begin
  perform public.coach__require(array['admin']);
  select snapshot into snap from public.coach_versions where type = p_type and id = p_id and version = p_version;
  if snap is null then raise exception 'No published version % of % "%"', p_version, p_type, p_id using errcode = 'P0002'; end if;
  perform public.coach__write(p_type, snap, me);
  v := public.coach__validate(p_type, p_id);
  if jsonb_array_length(v->'links') + jsonb_array_length(v->'publish') > 0 then
    select string_agg(x, '; ') into problems from jsonb_array_elements_text((v->'links') || (v->'publish')) x;
    raise exception 'Can''t roll back: %', problems using errcode = '23514';
  end if;
  execute format('select version from public.%I where id = $1', tbl) into new_v using p_id;
  insert into public.coach_versions (type, id, version, snapshot, published_by, note)
  values (p_type, p_id, new_v, public.coach__snapshot(p_type, p_id), me, 'Rollback to v' || p_version || coalesce(': ' || nullif(p_note, ''), ''))
  on conflict (type, id, version) do nothing;
  execute format('update public.%I set status = ''published'', published_version = version, approved_by = $2, approved_at = now() where id = $1', tbl)
    using p_id, me;
  insert into public.coach_log (actor, type, item_id, action, to_status, version, note)
  values (me, p_type, p_id, 'rollback', 'published', new_v, 'to v' || p_version);
  return jsonb_build_object('status', 'published', 'version', new_v);
end;
$$;

-- Delete an item that has never been published (admin only).
create or replace function public.coach_delete(p_type text, p_id text)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.coach__require(array['admin']);
  if exists (select 1 from public.coach_versions where type = p_type and id = p_id) then
    raise exception 'This has been published before, so it can only be archived (its history is kept)' using errcode = '23503';
  end if;
  begin
    execute format('delete from public.%I where id = $1', public.coach__check_type(p_type)) using p_id;
  exception when foreign_key_violation then
    raise exception 'Other content still links to "%". Remove those links first.', p_id using errcode = '23503';
  end;
  insert into public.coach_log (actor, type, item_id, action) values (auth.uid(), p_type, p_id, 'delete');
end;
$$;

-- Everything the CMS dashboard and lists need.
create or replace function public.coach_admin_list()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  items jsonb := '[]';
  types text[] := array['skill', 'lesson', 'drill', 'mistake', 'media', 'pathway', 'discipline', 'competency', 'person', 'source'];
  t text;
  part jsonb;
begin
  perform public.coach__require(array['contributor', 'reviewer', 'admin']);
  foreach t in array types loop
    if public.coach__reviewed(t) then
      execute format($q$
        select coalesce(jsonb_agg(jsonb_build_object(
          'type', %L, 'id', x.id, 'title', coalesce(nullif(to_jsonb(x)->>'name', ''), nullif(to_jsonb(x)->>'title', ''), x.id),
          'status', x.status, 'version', x.version, 'published_version', x.published_version,
          'updated_at', x.updated_at, 'created_by', x.created_by = auth.uid(),
          'updated_by_email', (select u.email from auth.users u where u.id = x.updated_by),
          'needs_specialist', public.coach__needs_specialist(%L, x.id)) order by x.updated_at desc), '[]')
        from public.%I x$q$, t, t, public.coach__tbl(t)) into part;
    else
      execute format($q$
        select coalesce(jsonb_agg(jsonb_build_object(
          'type', %L, 'id', x.id, 'title', coalesce(nullif(to_jsonb(x)->>'name', ''), nullif(to_jsonb(x)->>'title', ''), x.id), 'status', 'reference',
          'updated_at', x.updated_at) order by x.updated_at desc), '[]')
        from public.%I x$q$, t, public.coach__tbl(t)) into part;
    end if;
    items := items || part;
  end loop;
  return jsonb_build_object(
    'me', public.coach_my_role(),
    'items', items,
    'log', (select coalesce(jsonb_agg(jsonb_build_object('at', l.at, 'type', l.type, 'id', l.item_id, 'action', l.action,
              'from', l.from_status, 'to', l.to_status, 'version', l.version, 'note', l.note,
              'by', (select u.email from auth.users u where u.id = l.actor)) order by l.at desc), '[]')
            from (select * from public.coach_log order by at desc limit 40) l));
end;
$$;

create or replace function public.coach_admin_get(p_type text, p_id text)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  meta jsonb;
begin
  perform public.coach__require(array['contributor', 'reviewer', 'admin']);
  if public.coach__reviewed(p_type) then
    execute format($q$select jsonb_build_object('status', x.status, 'version', x.version, 'published_version', x.published_version,
      'updated_at', x.updated_at, 'mine', x.created_by = auth.uid(),
      'updated_by_email', (select u.email from auth.users u where u.id = x.updated_by),
      'submitted_by_email', (select u.email from auth.users u where u.id = x.submitted_by),
      'approved_by_email', (select u.email from auth.users u where u.id = x.approved_by),
      'approved_at', x.approved_at, 'last_editor_is_me', x.updated_by = auth.uid())
      from public.%I x where x.id = $1$q$, public.coach__check_type(p_type)) into meta using p_id;
  else
    execute format('select jsonb_build_object(''status'', ''reference'', ''updated_at'', x.updated_at) from public.%I x where x.id = $1',
                   public.coach__check_type(p_type)) into meta using p_id;
  end if;
  if meta is null then raise exception 'No % "%"', p_type, p_id using errcode = 'P0002'; end if;
  return jsonb_build_object(
    'item', public.coach__snapshot(p_type, p_id),
    'meta', meta,
    'needs_specialist', public.coach__needs_specialist(p_type, p_id),
    'validation', case when public.coach__reviewed(p_type) then public.coach__validate(p_type, p_id) end,
    'dependents', public.coach__dependents(p_type, p_id),
    'versions', (select coalesce(jsonb_agg(jsonb_build_object('version', v.version, 'published_at', v.published_at, 'note', v.note,
                   'by', (select u.email from auth.users u where u.id = v.published_by)) order by v.version desc), '[]')
                 from public.coach_versions v where v.type = p_type and v.id = p_id));
end;
$$;

-- 8. Who may call what -----------------------------------------------
do $$
declare f text;
begin
  foreach f in array array[
    'coach__no_prereq_cycle()', 'coach__tbl(text)', 'coach__reviewed(text)', 'coach__meta_cols()',
    'coach__check_type(text)', 'coach__snapshot(text, text)', 'coach__refs(text, jsonb)', 'coach__live(text, text)',
    'coach__dependents(text, text)', 'coach__needs_specialist(text, text)', 'coach__arr_len(jsonb)', 'coach__blank(text)',
    'coach__validate(text, text)', 'coach__write(text, jsonb, uuid)', 'coach__seed(jsonb)', 'coach__require(text[])',
    'coach_role()', 'coach_my_role()', 'coach_catalog(boolean)', 'coach_save(text, jsonb)', 'coach_validate(text, text)',
    'coach_transition(text, text, text, text)', 'coach_rollback(text, text, int, text)', 'coach_delete(text, text)',
    'coach_admin_list()', 'coach_admin_get(text, text)']
  loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

grant execute on function public.coach_catalog(boolean) to anon, authenticated;
grant execute on function public.coach_role() to authenticated;
grant execute on function public.coach_my_role() to authenticated;
grant execute on function public.coach_save(text, jsonb) to authenticated;
grant execute on function public.coach_validate(text, text) to authenticated;
grant execute on function public.coach_transition(text, text, text, text) to authenticated;
grant execute on function public.coach_rollback(text, text, int, text) to authenticated;
grant execute on function public.coach_delete(text, text) to authenticated;
grant execute on function public.coach_admin_list() to authenticated;
grant execute on function public.coach_admin_get(text, text) to authenticated;

-- 9. Images and captions uploaded from the CMS -------------------------
-- Videos themselves go on a managed video host (Mux, Cloudflare Stream,
-- YouTube, Vimeo): see docs/COACHING.md. This bucket only holds small files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('coaching-media', 'coaching-media', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'text/vtt'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Coaching editors can upload media" on storage.objects;
create policy "Coaching editors can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'coaching-media' and public.coach_role() is not null);

drop policy if exists "Coaching reviewers can replace media" on storage.objects;
create policy "Coaching reviewers can replace media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'coaching-media' and public.coach_role() in ('reviewer', 'admin'));

drop policy if exists "Coaching admins can delete media" on storage.objects;
create policy "Coaching admins can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'coaching-media' and public.coach_role() = 'admin');
