-- ============================================================
-- MATHLETE: RESOURCE CATALOG, ENTITLEMENTS AND ORGANIZATION SETTINGS (PRD 3)
-- Paste this whole file into Supabase -> SQL Editor and Run, AFTER
-- setup.sql, progress.sql and organizations.sql, then run curriculum.sql
-- and catalog.sql. Safe to re-run.
--
-- What it adds:
--   * resources            one global catalog of what Mathlete offers (labs,
--                          courses, sport contexts, platform features). The
--                          rows are written by catalog.sql, which
--                          scripts/build-catalog.mjs generates from the site's
--                          own config, so nothing is typed in twice.
--   * resource_relations   "requires" (a lab needs its sport context switched
--                          on) and "part_of" (a lab belongs to a course;
--                          shown together, not enforced)
--   * plan_resources       what each plan includes (or plans.all_resources)
--   * organization_entitlements   per-organization adjustments to its plan:
--                          'grant' adds a resource, 'exclude' removes one
--   * organization_resource_settings   which included resources the
--                          organization has switched on or off
--   * organization_recommended_topics, organization_collections (+ items):
--                          curated course topics and resource lists
--   * org-branding bucket  logos (PNG, JPEG or WebP, up to 512 KB)
--
-- The access rule (PRD 3.3), checked on the server:
--   active membership, active organization, active licence (org_can_learn)
--   + resource included in the licence + switched on by the organization
--   + its required context (sport) included and switched on
--   + resource available (not coming soon / paused by Mathlete)
--   + the person's role may use it (audience).
-- record_attempt() (progress.sql) refuses to save work done in an
-- organization unless the activity passes this rule.
--
-- Organizations can't edit the catalog, plans, questions or anything of
-- another organization: every write here goes through a function that
-- checks the caller's role in that organization.
-- ============================================================

-- 1. The catalog -------------------------------------------------------------
create table if not exists public.resources (
  id          text primary key check (id ~ '^[a-z0-9]+([.-][a-z0-9]+)*$'),
  slug        text not null,
  name        text not null check (char_length(name) between 1 and 120),
  description text,
  type        text not null check (type in ('lab', 'course', 'module', 'sport', 'feature')),
  subject     text,
  course_id   text,                       -- curriculum course id for courses (alg1 …)
  sport       text,                       -- context, e.g. 'mtb', for labs
  objectives  text[] not null default '{}',
  skills      text[] not null default '{}',
  game_ids    text[] not null default '{}',   -- progress game ids this resource covers
  thumbnail   text,
  url         text,
  audience    text not null default 'all' check (audience in ('all', 'staff')),
  status      text not null default 'available' check (status in ('available', 'coming_soon', 'unavailable', 'retired')),
  version     integer not null default 1,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);
create index if not exists resources_game_ids_idx on public.resources using gin (game_ids);

create table if not exists public.resource_relations (
  resource_id text not null references public.resources (id) on delete cascade,
  related_id  text not null references public.resources (id) on delete cascade,
  relation    text not null check (relation in ('requires', 'part_of')),
  primary key (resource_id, related_id, relation),
  check (resource_id <> related_id)
);

-- 2. What a licence includes ------------------------------------------------
alter table public.plans add column if not exists all_resources boolean not null default false;

create table if not exists public.plan_resources (
  plan_id     text not null references public.plans (id) on delete cascade,
  resource_id text not null references public.resources (id) on delete cascade,
  primary key (plan_id, resource_id)
);

create table if not exists public.organization_entitlements (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  resource_id     text not null references public.resources (id) on delete cascade,
  kind            text not null check (kind in ('grant', 'exclude')),
  note            text,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  primary key (organization_id, resource_id)
);

-- 3. What the organization has switched on ---------------------------------
alter table public.organizations add column if not exists new_resources_enabled boolean not null default true;

create table if not exists public.organization_resource_settings (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  resource_id     text not null references public.resources (id) on delete cascade,
  enabled         boolean not null,
  updated_by      uuid,
  updated_at      timestamptz not null default now(),
  primary key (organization_id, resource_id)
);

create table if not exists public.organization_recommended_topics (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  topic_id        text not null check (topic_id ~ '^[a-z0-9]+\.[a-z0-9-]+$'),
  position        integer not null default 0,
  primary key (organization_id, topic_id)
);

create table if not exists public.organization_collections (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title           text not null check (char_length(btrim(title)) between 1 and 80),
  description     text check (char_length(description) <= 300),
  position        integer not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists organization_collections_org_idx on public.organization_collections (organization_id);
create table if not exists public.organization_collection_items (
  collection_id uuid not null references public.organization_collections (id) on delete cascade,
  resource_id   text not null references public.resources (id) on delete cascade,
  position      integer not null default 0,
  primary key (collection_id, resource_id)
);

-- Everything above is read through the functions below, never directly.
alter table public.resources enable row level security;
alter table public.resource_relations enable row level security;
alter table public.plan_resources enable row level security;
alter table public.organization_entitlements enable row level security;
alter table public.organization_resource_settings enable row level security;
alter table public.organization_recommended_topics enable row level security;
alter table public.organization_collections enable row level security;
alter table public.organization_collection_items enable row level security;
revoke all on public.resources, public.resource_relations, public.plan_resources, public.organization_entitlements,
  public.organization_resource_settings, public.organization_recommended_topics, public.organization_collections,
  public.organization_collection_items from anon, authenticated;
-- The catalog itself isn't secret (it describes public pages): signed-in people may read it.
grant select on public.resources, public.resource_relations to authenticated;
drop policy if exists "Signed-in people read the catalog" on public.resources;
create policy "Signed-in people read the catalog" on public.resources for select to authenticated using (status <> 'retired');
drop policy if exists "Signed-in people read catalog relations" on public.resource_relations;
create policy "Signed-in people read catalog relations" on public.resource_relations for select to authenticated using (true);

-- 4. The access rule ---------------------------------------------------------
-- Included in the organization's current licence?
create or replace function public.org_entitled(p_org uuid, p_resource text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((
    select case
      when e.kind = 'exclude' then false
      when e.kind = 'grant' then true
      else exists (
        select 1 from public.subscriptions s join public.plans p on p.id = s.plan_id
        where s.organization_id = p_org and s.replaced_by is null and s.status <> 'canceled'
          and (p.all_resources or exists (select 1 from public.plan_resources pr where pr.plan_id = p.id and pr.resource_id = p_resource)))
    end
    from (select 1) one
    left join public.organization_entitlements e on e.organization_id = p_org and e.resource_id = p_resource), false);
$$;

-- Switched on by the organization? (no choice made yet = the organization's default)
create or replace function public.org_resource_enabled(p_org uuid, p_resource text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select s.enabled from public.organization_resource_settings s where s.organization_id = p_org and s.resource_id = p_resource),
    (select o.new_resources_enabled from public.organizations o where o.id = p_org),
    false);
$$;

-- The state an administrator sees: enabled | disabled | not_included | unavailable
create or replace function public.org_resource_state(p_org uuid, p_resource text)
returns text language plpgsql stable security definer set search_path = '' as $$
declare r public.resources%rowtype;
begin
  select * into r from public.resources x where x.id = p_resource;
  if not found or r.status = 'retired' then return 'unavailable'; end if;
  if not public.org_entitled(p_org, p_resource) then return 'not_included'; end if;
  if r.status <> 'available' then return 'unavailable'; end if;
  -- A required context (e.g. the sport) that isn't included, available and on.
  if exists (select 1 from public.resource_relations rr join public.resources q on q.id = rr.related_id
             where rr.resource_id = p_resource and rr.relation = 'requires'
               and not (q.status = 'available' and public.org_entitled(p_org, q.id) and public.org_resource_enabled(p_org, q.id))) then
    return case when public.org_resource_enabled(p_org, p_resource) then 'needs_context' else 'disabled' end;
  end if;
  return case when public.org_resource_enabled(p_org, p_resource) then 'enabled' else 'disabled' end;
end;
$$;

-- May the signed-in person use this resource in this organization right now?
create or replace function public.can_use_resource(p_org uuid, p_resource text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.org_can_learn(p_org)
     and public.org_resource_state(p_org, p_resource) = 'enabled'
     and coalesce((select r.audience = 'all' or coalesce(public.org_role(p_org), '') in ('owner', 'admin', 'instructor')
                    from public.resources r where r.id = p_resource), false);
$$;

-- For record_attempt(): may work in this game be saved in this organization?
-- Saving needs the practice engine, and a resource covering the game, to be
-- usable. A game the catalog doesn't know at all is allowed (check-site.mjs
-- makes sure every game that saves progress is in the catalog).
create or replace function public.org_game_allowed(p_org uuid, p_game text)
returns boolean language sql stable security definer set search_path = '' as $$
  select case
    when not exists (select 1 from public.resources r where p_game = any (r.game_ids)) then true
    else public.can_use_resource(p_org, 'feature.practice-engine')
         and exists (select 1 from public.resources r where p_game = any (r.game_ids) and public.can_use_resource(p_org, r.id))
  end;
$$;

-- 5. What students (and the preview) see -------------------------------------
-- p_preview: owners/admins (and Mathlete) see the student view of an
-- organization even before its licence is active.
create or replace function public.org_student_view(p_org uuid, p_preview boolean default false)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  o public.organizations%rowtype;
  v_role text := coalesce(public.org_role(p_org), '');
  v_staff boolean;
  v_live boolean;
begin
  if p_preview then
    if not (public.is_platform_operator() or v_role in ('owner', 'admin')) then
      raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
    end if;
    v_staff := false;   -- the preview shows exactly what a student sees
  else
    if not public.has_live_session() or v_role = '' then
      raise sqlstate 'PT403' using message = 'You''re not a member of that organization.';
    end if;
    v_staff := v_role in ('owner', 'admin', 'instructor');
  end if;
  select * into o from public.organizations x where x.id = p_org;
  v_live := (p_preview and o.status <> 'archived') or public.org_can_learn(p_org);
  return jsonb_build_object(
    'organization', jsonb_build_object('id', o.id, 'name', o.name, 'welcome_message', o.welcome_message,
                                       'accent_color', o.accent_color, 'logo_path', o.logo_path, 'updated_at', o.updated_at),
    'open', public.org_can_learn(p_org),
    'resources', case when not v_live then '[]'::jsonb else coalesce((
      select jsonb_agg(jsonb_build_object('id', r.id, 'name', r.name, 'type', r.type, 'description', r.description, 'url', r.url,
                                          'thumbnail', r.thumbnail, 'subject', r.subject, 'sport', r.sport, 'course_id', r.course_id)
                       order by r.type, r.sort_order, r.name)
      from public.resources r
      where public.org_resource_state(p_org, r.id) = 'enabled' and (r.audience = 'all' or v_staff)), '[]'::jsonb) end,
    'recommended_topics', case when not v_live then '[]'::jsonb else coalesce((
      select jsonb_agg(t.topic_id order by t.position, t.topic_id)
      from public.organization_recommended_topics t
      where t.organization_id = p_org
        and public.org_resource_state(p_org, 'course.' || split_part(t.topic_id, '.', 1)) = 'enabled'), '[]'::jsonb) end,
    'collections', case when not v_live then '[]'::jsonb else coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'title', c.title, 'description', c.description, 'items', c.items) order by c.position, c.created_at)
      from (select c.*, (select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'name', r.name, 'type', r.type, 'url', r.url) order by i.position, r.name), '[]'::jsonb)
                         from public.organization_collection_items i join public.resources r on r.id = i.resource_id
                         where i.collection_id = c.id and public.org_resource_state(p_org, r.id) = 'enabled' and (r.audience = 'all' or v_staff)) items
            from public.organization_collections c where c.organization_id = p_org) c
      where jsonb_array_length(c.items) > 0), '[]'::jsonb) end);
end;
$$;

-- 6. What administrators see and change ---------------------------------------
create or replace function public.org_resources(p_org uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  return jsonb_build_object(
    'new_resources_enabled', (select o.new_resources_enabled from public.organizations o where o.id = p_org),
    'resources', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'name', r.name, 'type', r.type, 'description', r.description, 'subject', r.subject, 'sport', r.sport,
        'course_id', r.course_id, 'url', r.url, 'status', r.status, 'audience', r.audience,
        'state', public.org_resource_state(p_org, r.id),
        'entitled', public.org_entitled(p_org, r.id),
        'enabled', public.org_resource_enabled(p_org, r.id),
        'requires', (select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'name', q.name)), '[]'::jsonb)
                     from public.resource_relations rr join public.resources q on q.id = rr.related_id
                     where rr.resource_id = r.id and rr.relation = 'requires'),
        'part_of', (select coalesce(jsonb_agg(rr.related_id), '[]'::jsonb) from public.resource_relations rr
                    where rr.resource_id = r.id and rr.relation = 'part_of'))
        order by r.sort_order, r.name)
      from public.resources r where r.status <> 'retired'), '[]'::jsonb),
    'recommended_topics', coalesce((select jsonb_agg(t.topic_id order by t.position, t.topic_id)
                                    from public.organization_recommended_topics t where t.organization_id = p_org), '[]'::jsonb),
    'collections', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'title', c.title, 'description', c.description,
               'items', (select coalesce(jsonb_agg(i.resource_id order by i.position), '[]'::jsonb) from public.organization_collection_items i where i.collection_id = c.id))
               order by c.position, c.created_at)
      from public.organization_collections c where c.organization_id = p_org), '[]'::jsonb));
end;
$$;

-- Switch an included resource on or off. Never possible for something the
-- licence doesn't include.
create or replace function public.set_resource_enabled(p_org uuid, p_resource text, p_enabled boolean)
returns text language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  if p_enabled is null then raise sqlstate 'PT422' using message = 'Say whether to switch it on or off.'; end if;
  if not exists (select 1 from public.resources r where r.id = p_resource and r.status <> 'retired') then
    raise sqlstate 'PT404' using message = 'No such resource.';
  end if;
  if not public.org_entitled(p_org, p_resource) then
    raise sqlstate 'PT403' using message = 'That isn''t included in your organization''s licence. Contact Mathlete to add it.';
  end if;
  insert into public.organization_resource_settings (organization_id, resource_id, enabled, updated_by)
  values (p_org, p_resource, p_enabled, auth.uid())
  on conflict (organization_id, resource_id) do update set enabled = excluded.enabled, updated_by = excluded.updated_by, updated_at = now();
  perform public.audit(p_org, case when p_enabled then 'resource.enabled' else 'resource.disabled' end, 'resource', p_resource, '{}'::jsonb);
  return public.org_resource_state(p_org, p_resource);
end;
$$;

-- Whether resources added to the licence later start switched on.
create or replace function public.set_new_resources_enabled(p_org uuid, p_enabled boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  -- Keep everything already included exactly as it is now: the default only
  -- applies to resources included from here on.
  insert into public.organization_resource_settings (organization_id, resource_id, enabled, updated_by)
  select p_org, r.id, public.org_resource_enabled(p_org, r.id), auth.uid()
  from public.resources r
  where public.org_entitled(p_org, r.id)
    and not exists (select 1 from public.organization_resource_settings s where s.organization_id = p_org and s.resource_id = r.id)
  on conflict do nothing;
  update public.organizations o set new_resources_enabled = coalesce(p_enabled, true), updated_at = now() where o.id = p_org;
  perform public.audit(p_org, 'resource.default_changed', 'organization', p_org::text, jsonb_build_object('enabled', coalesce(p_enabled, true)));
  return coalesce(p_enabled, true);
end;
$$;

-- Recommended topics: the whole list at once, in order (topic ids like 'alg1.graphing-quadratics').
create or replace function public.set_recommended_topics(p_org uuid, p_topics text[])
returns integer language plpgsql security definer set search_path = '' as $$
declare v_bad text;
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  if cardinality(coalesce(p_topics, '{}')) > 60 then raise sqlstate 'PT422' using message = 'Up to 60 recommended topics.'; end if;
  select t into v_bad from unnest(coalesce(p_topics, '{}')) t
   where to_regclass('public.curriculum_skills') is null
      or not exists (select 1 from public.curriculum_skills s where s.topic_id = t and s.active)
   limit 1;
  if v_bad is not null then raise sqlstate 'PT422' using message = 'Unknown topic: ' || v_bad; end if;
  select t into v_bad from unnest(coalesce(p_topics, '{}')) t
   where not public.org_entitled(p_org, 'course.' || split_part(t, '.', 1)) limit 1;
  if v_bad is not null then raise sqlstate 'PT403' using message = 'That course isn''t included in your licence: ' || v_bad; end if;
  delete from public.organization_recommended_topics x where x.organization_id = p_org;
  insert into public.organization_recommended_topics (organization_id, topic_id, position)
  select p_org, t, min(n)::integer from unnest(coalesce(p_topics, '{}')) with ordinality u(t, n) group by t;
  perform public.audit(p_org, 'resource.topics_updated', 'organization', p_org::text, jsonb_build_object('count', cardinality(coalesce(p_topics, '{}'))));
  return cardinality(coalesce(p_topics, '{}'));
end;
$$;

-- A collection: create (p_id null) or replace its title, description and items.
create or replace function public.save_collection(p_org uuid, p_id uuid, p_title text, p_description text, p_items text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid := p_id; v_bad text;
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  if char_length(btrim(coalesce(p_title, ''))) not between 1 and 80 then raise sqlstate 'PT422' using message = 'Give the collection a title (up to 80 characters).'; end if;
  if char_length(coalesce(p_description, '')) > 300 then raise sqlstate 'PT422' using message = 'Keep the description under 300 characters.'; end if;
  if cardinality(coalesce(p_items, '{}')) > 40 then raise sqlstate 'PT422' using message = 'Up to 40 resources in a collection.'; end if;
  select i into v_bad from unnest(coalesce(p_items, '{}')) i where not public.org_entitled(p_org, i) limit 1;
  if v_bad is not null then raise sqlstate 'PT403' using message = 'Not included in your licence: ' || v_bad; end if;
  if v_id is null then
    if (select count(*) from public.organization_collections c where c.organization_id = p_org) >= 20 then
      raise sqlstate 'PT422' using message = 'Up to 20 collections.';
    end if;
    insert into public.organization_collections (organization_id, title, description, position)
    values (p_org, btrim(p_title), nullif(btrim(p_description), ''), (select coalesce(max(c.position), 0) + 1 from public.organization_collections c where c.organization_id = p_org))
    returning id into v_id;
  else
    update public.organization_collections c set title = btrim(p_title), description = nullif(btrim(p_description), '')
     where c.id = v_id and c.organization_id = p_org;
    if not found then raise sqlstate 'PT404' using message = 'No such collection.'; end if;
    delete from public.organization_collection_items i where i.collection_id = v_id;
  end if;
  insert into public.organization_collection_items (collection_id, resource_id, position)
  select v_id, i, min(n)::integer from unnest(coalesce(p_items, '{}')) with ordinality u(i, n) group by i;
  perform public.audit(p_org, 'resource.collection_saved', 'collection', v_id::text, jsonb_build_object('items', cardinality(coalesce(p_items, '{}'))));
  return v_id;
end;
$$;

create or replace function public.delete_collection(p_org uuid, p_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  delete from public.organization_collections c where c.id = p_id and c.organization_id = p_org;
  if not found then raise sqlstate 'PT404' using message = 'No such collection.'; end if;
  perform public.audit(p_org, 'resource.collection_deleted', 'collection', p_id::text, '{}'::jsonb);
  return true;
end;
$$;

-- 7. Branding -------------------------------------------------------------------
-- Logos live in the public 'org-branding' bucket at <organization id>/logo-….
-- The bucket only takes PNG, JPEG or WebP up to 512 KB (no SVG: it can carry
-- script). Only that organization's owners and admins (or Mathlete) can
-- write in its folder.
insert into storage.buckets (id, name, public) values ('org-branding', 'org-branding', true) on conflict (id) do update set public = true;
do $$ begin
  update storage.buckets set file_size_limit = 524288, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'] where id = 'org-branding';
exception when undefined_column then null;   -- older storage schema (tests): the checks below still apply
end $$;

create or replace function public.org_manages_branding_path(p_name text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare v_org uuid;
begin
  if p_name !~ '^[0-9a-f-]{36}/logo-[a-z0-9-]{1,40}\.(png|jpg|jpeg|webp)$' then return false; end if;
  v_org := split_part(p_name, '/', 1)::uuid;
  return public.is_platform_operator() or coalesce(public.org_role(v_org), '') in ('owner', 'admin');
exception when invalid_text_representation then return false;
end;
$$;

do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'storage' and table_name = 'objects' and column_name = 'name') then
    execute 'drop policy if exists "Organization admins upload logos" on storage.objects';
    execute 'create policy "Organization admins upload logos" on storage.objects for insert to authenticated with check (bucket_id = ''org-branding'' and public.org_manages_branding_path(name))';
    execute 'drop policy if exists "Organization admins replace logos" on storage.objects';
    execute 'create policy "Organization admins replace logos" on storage.objects for update to authenticated using (bucket_id = ''org-branding'' and public.org_manages_branding_path(name)) with check (bucket_id = ''org-branding'' and public.org_manages_branding_path(name))';
    execute 'drop policy if exists "Organization admins remove logos" on storage.objects';
    execute 'create policy "Organization admins remove logos" on storage.objects for delete to authenticated using (bucket_id = ''org-branding'' and public.org_manages_branding_path(name))';
  end if;
end $$;

-- WCAG relative luminance of a #rrggbb colour, and contrast against the
-- dark student pages (#131815). Accent colours must reach 3:1 there.
create or replace function public.color_contrast_on_dark(p_hex text)
returns numeric language plpgsql immutable set search_path = '' as $$
declare
  c numeric[]; l numeric; bg numeric; i integer; v numeric;
begin
  c := array[('x' || substr(p_hex, 2, 2))::bit(8)::integer, ('x' || substr(p_hex, 4, 2))::bit(8)::integer, ('x' || substr(p_hex, 6, 2))::bit(8)::integer];
  l := 0;
  for i in 1..3 loop
    v := c[i] / 255.0;
    v := case when v <= 0.03928 then v / 12.92 else power((v + 0.055) / 1.055, 2.4) end;
    l := l + v * (array[0.2126, 0.7152, 0.0722])[i];
  end loop;
  bg := 0.2126 * power((19/255.0 + 0.055) / 1.055, 2.4) + 0.7152 * power((24/255.0 + 0.055) / 1.055, 2.4) + 0.0722 * power((21/255.0 + 0.055) / 1.055, 2.4);
  return round((l + 0.05) / (bg + 0.05), 2);
end;
$$;

-- Set the logo (a path in the bucket, or '' to remove it) and/or the accent colour ('' to remove).
create or replace function public.set_organization_branding(p_org uuid, p_logo_path text default null, p_accent text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_accent text := lower(btrim(p_accent));
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  if p_logo_path is not null and p_logo_path <> '' and (split_part(p_logo_path, '/', 1) <> p_org::text or not public.org_manages_branding_path(p_logo_path)) then
    raise sqlstate 'PT422' using message = 'That logo file isn''t in your organization''s folder.';
  end if;
  if v_accent is not null and v_accent <> '' then
    if v_accent !~ '^#[0-9a-f]{6}$' then raise sqlstate 'PT422' using message = 'Use a colour like #2E7DB8.'; end if;
    if public.color_contrast_on_dark(v_accent) < 3 then
      raise sqlstate 'PT422' using message = 'That colour is too dark to read on Mathlete''s dark pages. Choose a lighter shade.';
    end if;
  end if;
  update public.organizations o
     set logo_path = case when p_logo_path is null then o.logo_path else nullif(p_logo_path, '') end,
         accent_color = case when v_accent is null then o.accent_color else nullif(v_accent, '') end,
         updated_at = now()
   where o.id = p_org;
  perform public.audit(p_org, 'organization.branding_updated', 'organization', p_org::text,
                       jsonb_build_object('logo_changed', p_logo_path is not null, 'accent_changed', v_accent is not null));
  return (select jsonb_build_object('logo_path', o.logo_path, 'accent_color', o.accent_color) from public.organizations o where o.id = p_org);
end;
$$;

-- 8. Mathlete (platform operators): what plans and organizations include -----
create or replace function public.set_plan_resources(p_plan text, p_all boolean default null, p_add text[] default '{}', p_remove text[] default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_bad text;
begin
  if not public.is_platform_operator() then raise sqlstate 'PT403' using message = 'Only Mathlete platform admins manage plans.'; end if;
  if not exists (select 1 from public.plans p where p.id = p_plan) then raise sqlstate 'PT404' using message = 'No such plan.'; end if;
  select a into v_bad from unnest(coalesce(p_add, '{}') || coalesce(p_remove, '{}')) a where not exists (select 1 from public.resources r where r.id = a) limit 1;
  if v_bad is not null then raise sqlstate 'PT404' using message = 'No such resource: ' || v_bad; end if;
  if p_all is not null then update public.plans p set all_resources = p_all where p.id = p_plan; end if;
  insert into public.plan_resources (plan_id, resource_id) select p_plan, a from unnest(coalesce(p_add, '{}')) a on conflict do nothing;
  delete from public.plan_resources pr where pr.plan_id = p_plan and pr.resource_id = any (coalesce(p_remove, '{}'));
  perform public.audit(null, 'plan.resources_changed', 'plan', p_plan, jsonb_build_object('all', p_all, 'add', p_add, 'remove', p_remove));
  return jsonb_build_object('all_resources', (select p.all_resources from public.plans p where p.id = p_plan),
                            'resources', (select coalesce(jsonb_agg(pr.resource_id order by pr.resource_id), '[]'::jsonb) from public.plan_resources pr where pr.plan_id = p_plan));
end;
$$;

-- An organization-specific adjustment: 'grant', 'exclude', or null to clear it.
create or replace function public.set_org_entitlement(p_org uuid, p_resource text, p_kind text, p_note text default null)
returns text language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_operator() then raise sqlstate 'PT403' using message = 'Only Mathlete platform admins change what a licence includes.'; end if;
  if not exists (select 1 from public.organizations o where o.id = p_org) then raise sqlstate 'PT404' using message = 'No such organization.'; end if;
  if not exists (select 1 from public.resources r where r.id = p_resource) then raise sqlstate 'PT404' using message = 'No such resource: ' || p_resource; end if;
  if p_kind is null then
    delete from public.organization_entitlements e where e.organization_id = p_org and e.resource_id = p_resource;
  elsif p_kind in ('grant', 'exclude') then
    insert into public.organization_entitlements (organization_id, resource_id, kind, note, created_by)
    values (p_org, p_resource, p_kind, p_note, auth.uid())
    on conflict (organization_id, resource_id) do update set kind = excluded.kind, note = excluded.note, created_by = excluded.created_by, created_at = now();
  else
    raise sqlstate 'PT422' using message = 'Use grant, exclude, or clear.';
  end if;
  perform public.audit(p_org, 'entitlement.changed', 'resource', p_resource, jsonb_build_object('kind', p_kind, 'note', p_note));
  return public.org_resource_state(p_org, p_resource);
end;
$$;

-- 9. Who may call what ---------------------------------------------------------
revoke all on function public.org_entitled(uuid, text), public.org_resource_enabled(uuid, text), public.org_resource_state(uuid, text),
  public.can_use_resource(uuid, text), public.org_game_allowed(uuid, text), public.org_student_view(uuid, boolean),
  public.org_resources(uuid), public.set_resource_enabled(uuid, text, boolean), public.set_new_resources_enabled(uuid, boolean),
  public.set_recommended_topics(uuid, text[]), public.save_collection(uuid, uuid, text, text, text[]), public.delete_collection(uuid, uuid),
  public.org_manages_branding_path(text), public.color_contrast_on_dark(text), public.set_organization_branding(uuid, text, text),
  public.set_plan_resources(text, boolean, text[], text[]), public.set_org_entitlement(uuid, text, text, text) from public, anon;
grant execute on function public.org_entitled(uuid, text), public.org_resource_enabled(uuid, text), public.org_resource_state(uuid, text),
  public.can_use_resource(uuid, text), public.org_game_allowed(uuid, text), public.org_student_view(uuid, boolean),
  public.org_resources(uuid), public.set_resource_enabled(uuid, text, boolean), public.set_new_resources_enabled(uuid, boolean),
  public.set_recommended_topics(uuid, text[]), public.save_collection(uuid, uuid, text, text, text[]), public.delete_collection(uuid, uuid),
  public.org_manages_branding_path(text), public.color_contrast_on_dark(text), public.set_organization_branding(uuid, text, text),
  public.set_plan_resources(text, boolean, text[], text[]), public.set_org_entitlement(uuid, text, text, text) to authenticated, service_role;

-- 10. Plans that existed before the catalog include everything, so nothing
-- changes for organizations already using Mathlete. (Once only: after this,
-- what each plan includes is set with admin.mjs plan-resources.)
do $$ begin
  if not exists (select 1 from public.schema_versions v where v.name = 'resources-v1') then
    update public.plans set all_resources = true;
  end if;
end $$;
insert into public.schema_versions (name) values ('resources-v1') on conflict (name) do nothing;
