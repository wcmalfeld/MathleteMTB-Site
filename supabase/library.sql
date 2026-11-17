-- ============================================================
-- Resources library (PRDs/resourcesPage.md, Phase 1)
--
-- Run in the Supabase SQL Editor AFTER setup.sql, progress.sql and
-- organizations.sql (it uses their roles and organizations). Safe to run
-- again. Pages: resources/, resources/view/, resources/manage/
-- (js/library.js, js/library-manage.js). Reference: docs/RESOURCES.md.
--
-- Named library_* because public.resources already exists: that table is
-- the licensing catalog of labs and courses (resources.sql), a different
-- thing.
--
-- Who can do what (all enforced here, never in the browser):
--   Visitors (signed in or not)  published Mathlete-wide resources
--   Students in a school         + that school's published resources
--   Tutors (profiles.role tutor) add and edit their own Mathlete-wide
--                                resources as drafts, or publish them as
--                                staff-only ("private"); an admin publishes
--   School instructors           the same, for their school
--   School owners/admins         manage and publish all of their school's
--                                resources (never Mathlete-wide ones)
--   Platform admins              everything, plus categories and tags
--
-- Tables are read-only to the browser; every change goes through the
-- library_* functions below, which check the caller. Files live in the
-- private Storage bucket `library` and are served through short-lived
-- signed links, only to people who can see the resource.
-- ============================================================

-- 1. Categories -----------------------------------------------------------
create table if not exists public.library_categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  name          text not null check (char_length(btrim(name)) between 1 and 60),
  description   text check (description is null or char_length(description) <= 240),
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

insert into public.library_categories (slug, name, description, display_order) values
  ('math',                 'Math & Mathematics',          'Resources for understanding and improving mathematical skills.', 1),
  ('problem-solving',      'Problem Solving',             'Critical thinking, logical reasoning, and approaching difficult problems.', 2),
  ('study-skills',         'Study Skills',                'Learning techniques, studying strategies, and academic habits.', 3),
  ('how-to-learn',         'How to Learn',                'Memory, understanding, focus, and effective learning methods.', 4),
  ('physics-science',      'Physics & Science',           'Resources for understanding scientific concepts.', 5),
  ('productivity',         'Productivity & Organization', 'Time management, goal setting, and staying organized.', 6),
  ('mindset',              'Mindset & Motivation',        'Confidence, persistence, overcoming challenges, and developing a growth mindset.', 7),
  ('tools-technology',     'Tools & Technology',          'Useful websites, apps, calculators, and interactive learning tools.', 8),
  ('books',                'Books & Recommendations',     'Books and other recommended learning materials.', 9)
on conflict (slug) do nothing;

-- 2. Resources ------------------------------------------------------------
create table if not exists public.library_items (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title               text not null check (char_length(btrim(title)) between 1 and 160),
  description         text not null check (char_length(btrim(description)) between 1 and 400),
  resource_type       text not null check (resource_type in ('document', 'article', 'video', 'tool', 'written')),
  category_id         uuid not null references public.library_categories (id) on delete restrict,
  content             text check (content is null or char_length(content) <= 60000),       -- written resources (simple formatting, see js/library.js)
  external_url        text check (external_url is null or (external_url ~ '^https?://[^[:space:]<>"]+$' and char_length(external_url) <= 2000)),
  file_path           text check (file_path is null or char_length(file_path) <= 300),
  file_name           text check (file_name is null or char_length(file_name) <= 200),
  file_type           text check (file_type is null or char_length(file_type) <= 120),
  file_size           bigint check (file_size is null or file_size >= 0),
  thumbnail_path      text check (thumbnail_path is null or char_length(thumbnail_path) <= 300),
  thumbnail_url       text check (thumbnail_url is null or (thumbnail_url ~ '^https://[^[:space:]<>"]+$' and char_length(thumbnail_url) <= 2000)),
  author              text check (author is null or char_length(author) <= 120),
  source_name         text check (source_name is null or char_length(source_name) <= 120),
  subject             text check (subject is null or subject in ('mathematics', 'physics', 'science', 'general')),
  tags                text[] not null default '{}' check (cardinality(tags) <= 20),
  grade_levels        text[] not null default '{}' check (grade_levels <@ array['elementary', 'middle-school', 'high-school', 'college']),
  difficulty          text check (difficulty is null or difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_duration  text check (estimated_duration is null or char_length(estimated_duration) <= 40),
  recommendation_note text check (recommendation_note is null or char_length(recommendation_note) <= 1000),
  visibility          text not null default 'public' check (visibility in ('public', 'organization', 'private')),
  organization_id     uuid references public.organizations (id) on delete cascade,
  is_featured         boolean not null default false,
  display_order       integer not null default 0,
  status              text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by          uuid references auth.users (id) on delete set null,
  updated_by          uuid references auth.users (id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  published_at        timestamptz,
  search              tsvector,
  check ((visibility = 'public' and organization_id is null)
      or (visibility = 'organization' and organization_id is not null)
      or visibility = 'private')
);

create index if not exists library_items_status_vis on public.library_items (status, visibility);
create index if not exists library_items_org       on public.library_items (organization_id);
create index if not exists library_items_category  on public.library_items (category_id);
create index if not exists library_items_type      on public.library_items (resource_type);
create index if not exists library_items_published on public.library_items (published_at desc);
create index if not exists library_items_search    on public.library_items using gin (search);
create index if not exists library_items_tags      on public.library_items using gin (tags);

-- Search text and timestamps are kept up to date here.
create or replace function public.library_items_touch()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.search :=
       setweight(to_tsvector('simple', coalesce(new.title, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(new.description, '') || ' ' || array_to_string(new.tags, ' ')), 'B')
    || setweight(to_tsvector('simple', coalesce(new.source_name, '') || ' ' || coalesce(new.author, '') || ' ' || coalesce(new.subject, '')), 'C')
    || setweight(to_tsvector('simple', left(coalesce(new.content, ''), 4000)), 'D');
  if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
  return new;
end;
$$;
drop trigger if exists library_items_touch on public.library_items;
create trigger library_items_touch before insert or update on public.library_items
  for each row execute function public.library_items_touch();

-- 3. Permission helpers ---------------------------------------------------
-- Platform admin signed in, or the service role.
create or replace function public.library_is_platform()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_platform_operator();
$$;

-- Tutors (and admins) on direct accounts can write Mathlete-wide drafts.
create or replace function public.library_is_direct_author()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.library_is_platform() or coalesce(public.my_role(), '') in ('tutor', 'admin');
$$;

-- May the caller write a resource with this visibility and organization?
create or replace function public.library_can_author(p_visibility text, p_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select case
    when p_org is null then p_visibility in ('public', 'private') and public.library_is_direct_author()
    else p_visibility in ('organization', 'private')
         and (public.library_is_platform() or coalesce(public.org_role(p_org), '') in ('owner', 'admin', 'instructor'))
  end;
$$;

-- May the caller publish it to students? (Staff-only "private" resources
-- can be published by anyone who may write them.)
create or replace function public.library_can_publish(p_visibility text, p_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.library_is_platform()
      or (p_org is not null and p_visibility <> 'public' and coalesce(public.org_role(p_org), '') in ('owner', 'admin'))
      or (p_visibility = 'private' and public.library_can_author(p_visibility, p_org));
$$;

-- May the caller edit or delete this existing resource? Authors can change
-- their own until an admin publishes it to students.
create or replace function public.library_can_manage(p_visibility text, p_org uuid, p_created_by uuid, p_status text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.library_is_platform()
      or (p_org is not null and coalesce(public.org_role(p_org), '') in ('owner', 'admin'))
      or (p_created_by = auth.uid() and auth.uid() is not null
          and public.library_can_author(p_visibility, p_org)
          and (p_status <> 'published' or p_visibility = 'private'));
$$;

-- May the caller see it?
create or replace function public.library_can_view(p_status text, p_visibility text, p_org uuid, p_created_by uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (p_status = 'published' and (
            p_visibility = 'public'
         or (p_visibility = 'organization' and public.org_can_learn(p_org))
         or (p_visibility = 'private' and public.library_can_author('private', p_org))))
      or public.library_can_manage(p_visibility, p_org, p_created_by, p_status);
$$;

-- Storage paths are items/<resource id>/<file>.
create or replace function public.library_object_item(p_name text)
returns uuid language sql immutable set search_path = '' as $$
  select (substring(p_name from '^items/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/[^/]+$'))::uuid;
$$;
create or replace function public.library_object_visible(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.library_items i
                 where i.id = public.library_object_item(p_name)
                   and public.library_can_view(i.status, i.visibility, i.organization_id, i.created_by));
$$;
create or replace function public.library_object_manageable(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.library_items i
                 where i.id = public.library_object_item(p_name)
                   and public.library_can_manage(i.visibility, i.organization_id, i.created_by, i.status));
$$;

-- 4. Row-level security: read-only from the browser ------------------------
alter table public.library_categories enable row level security;
alter table public.library_items enable row level security;
revoke all on public.library_categories from anon, authenticated;
revoke all on public.library_items from anon, authenticated;
grant select on public.library_categories to anon, authenticated;
grant select on public.library_items to anon, authenticated;

drop policy if exists "Anyone can read categories" on public.library_categories;
create policy "Anyone can read categories" on public.library_categories for select to anon, authenticated using (true);

drop policy if exists "Resources the caller may see" on public.library_items;
create policy "Resources the caller may see" on public.library_items for select to anon, authenticated
  using (public.library_can_view(status, visibility, organization_id, created_by));

-- 5. Storage bucket -------------------------------------------------------
-- Private; 50 MB per file; documents and images only (no HTML, SVG,
-- scripts or executables). The page also checks the extension and sends
-- the matching content type.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('library', 'library', false, 52428800, array[
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/markdown',
  'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Library files for people who can see the resource" on storage.objects;
create policy "Library files for people who can see the resource" on storage.objects for select to anon, authenticated
  using (bucket_id = 'library' and public.library_object_visible(name));
drop policy if exists "Library uploads by people who manage the resource" on storage.objects;
create policy "Library uploads by people who manage the resource" on storage.objects for insert to authenticated
  with check (bucket_id = 'library' and public.library_object_manageable(name));
drop policy if exists "Library file changes by people who manage the resource" on storage.objects;
create policy "Library file changes by people who manage the resource" on storage.objects for update to authenticated
  using (bucket_id = 'library' and public.library_object_manageable(name))
  with check (bucket_id = 'library' and public.library_object_manageable(name));
drop policy if exists "Library file removal by people who manage the resource" on storage.objects;
create policy "Library file removal by people who manage the resource" on storage.objects for delete to authenticated
  using (bucket_id = 'library' and public.library_object_manageable(name));

-- 6. What the signed-in user may do (the manage page uses this) -----------
create or replace function public.library_access()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'signed_in', auth.uid() is not null,
    'platform', public.library_is_platform(),
    'direct_author', public.library_is_direct_author(),
    'orgs', coalesce((
      select jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name, 'role', m.role,
                                          'can_publish', m.role in ('owner', 'admin')) order by o.name)
      from public.organization_memberships m
      join public.organizations o on o.id = m.organization_id
      where m.user_id = auth.uid() and m.status = 'active' and o.status <> 'archived'
        and m.role in ('owner', 'admin', 'instructor') and public.has_live_session()), '[]'::jsonb));
$$;

-- 7. Saving a resource ------------------------------------------------------
create or replace function public.library_slugify(p text)
returns text language sql immutable set search_path = '' as $$
  select coalesce(nullif(left(trim(both '-' from regexp_replace(lower(coalesce(p, '')), '[^a-z0-9]+', '-', 'g')), 70), ''), 'resource');
$$;

-- Saves (creates or updates) one resource from a JSON object with the
-- table's column names. Returns {id, slug, status}. Refuses anything the
-- caller isn't allowed to do.
create or replace function public.library_save_item(p jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_id      uuid := nullif(p ->> 'id', '')::uuid;
  old       public.library_items;
  v_vis     text := coalesce(nullif(p ->> 'visibility', ''), 'public');
  v_org     uuid := nullif(p ->> 'organization_id', '')::uuid;
  v_status  text := coalesce(nullif(p ->> 'status', ''), 'draft');
  v_type    text := p ->> 'resource_type';
  v_url     text := nullif(btrim(p ->> 'external_url'), '');
  v_slug    text;
  v_base    text;
  v_n       integer := 1;
  v_pub     boolean;
  v_feat    boolean;
  v_order   integer;
  v_tags    text[];
  v_grades  text[];
  r         public.library_items;
begin
  if auth.uid() is null and not public.library_is_platform() then raise sqlstate 'PT401' using message = 'Log in to manage resources.'; end if;
  if v_vis = 'public' then v_org := null; end if;

  if v_id is not null then
    select * into old from public.library_items where id = v_id for update;
    if not found then raise sqlstate 'PT404' using message = 'That resource no longer exists.'; end if;
    if not public.library_can_manage(old.visibility, old.organization_id, old.created_by, old.status) then
      raise sqlstate 'PT403' using message = 'You can’t edit this resource.';
    end if;
  end if;

  if not public.library_can_author(v_vis, v_org) then
    raise sqlstate 'PT403' using message = case
      when v_vis = 'organization' then 'Choose a school you can add resources to.'
      when v_org is not null then 'You can’t add resources for that school.'
      else 'You can’t add Mathlete-wide resources. Choose your school instead.' end;
  end if;

  v_pub := public.library_can_publish(v_vis, v_org);
  if v_status = 'published' and not v_pub then
    raise sqlstate 'PT403' using message = 'An admin needs to publish this. Save it as a draft (or staff-only) for now.';
  end if;

  -- What each type needs.
  if v_type in ('article', 'tool', 'video') and (v_url is null or v_url !~ '^https?://') then
    raise sqlstate 'PT400' using message = 'Add the web address (starting with https://).';
  end if;
  if v_type = 'video' and v_url !~* '^https://((www\.|m\.)?youtube\.com/|youtu\.be/|(www\.|player\.)?vimeo\.com/)' then
    raise sqlstate 'PT400' using message = 'Videos need a YouTube or Vimeo link for now.';
  end if;
  if v_type = 'written' and coalesce(btrim(p ->> 'content'), '') = '' and v_status = 'published' then
    raise sqlstate 'PT400' using message = 'Write the resource before publishing it.';
  end if;
  if v_type = 'document' and v_status = 'published' and coalesce(nullif(p ->> 'file_path', ''), old.file_path) is null then
    raise sqlstate 'PT400' using message = 'Upload the document before publishing it.';
  end if;

  -- Files must sit in this resource's own folder.
  if v_id is not null then
    if nullif(p ->> 'file_path', '') is not null and public.library_object_item(p ->> 'file_path') is distinct from v_id then
      raise sqlstate 'PT400' using message = 'File path doesn’t belong to this resource.';
    end if;
    if nullif(p ->> 'thumbnail_path', '') is not null and public.library_object_item(p ->> 'thumbnail_path') is distinct from v_id then
      raise sqlstate 'PT400' using message = 'Thumbnail path doesn’t belong to this resource.';
    end if;
  elsif nullif(p ->> 'file_path', '') is not null or nullif(p ->> 'thumbnail_path', '') is not null then
    raise sqlstate 'PT400' using message = 'Save the resource before uploading files.';
  end if;

  -- Only publishers feature and order.
  v_feat  := case when v_pub then coalesce((p ->> 'is_featured')::boolean, false) else coalesce(old.is_featured, false) end;
  v_order := case when v_pub then coalesce((p ->> 'display_order')::integer, 0) else coalesce(old.display_order, 0) end;

  select coalesce(array_agg(distinct t), '{}') into v_tags
  from (select left(btrim(regexp_replace(x, '\s+', ' ', 'g')), 40) t
        from jsonb_array_elements_text(coalesce(p -> 'tags', '[]'::jsonb)) x) s where t <> '';
  select coalesce(array_agg(distinct g), '{}') into v_grades from jsonb_array_elements_text(coalesce(p -> 'grade_levels', '[]'::jsonb)) g;

  -- A readable, unique address.
  v_base := public.library_slugify(coalesce(nullif(p ->> 'slug', ''), old.slug, p ->> 'title'));
  v_slug := v_base;
  while exists (select 1 from public.library_items i where i.slug = v_slug and i.id is distinct from v_id) loop
    v_n := v_n + 1; v_slug := left(v_base, 70) || '-' || v_n;
  end loop;

  if v_id is null then
    insert into public.library_items (slug, title, description, resource_type, category_id, content, external_url,
      thumbnail_url, author, source_name, subject, tags, grade_levels, difficulty, estimated_duration,
      recommendation_note, visibility, organization_id, is_featured, display_order, status, created_by, updated_by)
    values (v_slug, btrim(p ->> 'title'), btrim(p ->> 'description'), v_type, (p ->> 'category_id')::uuid,
      nullif(p ->> 'content', ''), v_url, nullif(btrim(p ->> 'thumbnail_url'), ''), nullif(btrim(p ->> 'author'), ''),
      nullif(btrim(p ->> 'source_name'), ''), nullif(p ->> 'subject', ''), v_tags, v_grades, nullif(p ->> 'difficulty', ''),
      nullif(btrim(p ->> 'estimated_duration'), ''), nullif(btrim(p ->> 'recommendation_note'), ''),
      v_vis, v_org, v_feat, v_order, v_status, auth.uid(), auth.uid())
    returning * into r;
  else
    update public.library_items set
      slug = v_slug, title = btrim(p ->> 'title'), description = btrim(p ->> 'description'), resource_type = v_type,
      category_id = (p ->> 'category_id')::uuid, content = nullif(p ->> 'content', ''), external_url = v_url,
      file_path = case when p ? 'file_path' then nullif(p ->> 'file_path', '') else file_path end,
      file_name = case when p ? 'file_path' then nullif(p ->> 'file_name', '') else file_name end,
      file_type = case when p ? 'file_path' then nullif(p ->> 'file_type', '') else file_type end,
      file_size = case when p ? 'file_path' then nullif(p ->> 'file_size', '')::bigint else file_size end,
      thumbnail_path = case when p ? 'thumbnail_path' then nullif(p ->> 'thumbnail_path', '') else thumbnail_path end,
      thumbnail_url = nullif(btrim(p ->> 'thumbnail_url'), ''), author = nullif(btrim(p ->> 'author'), ''),
      source_name = nullif(btrim(p ->> 'source_name'), ''), subject = nullif(p ->> 'subject', ''), tags = v_tags,
      grade_levels = v_grades, difficulty = nullif(p ->> 'difficulty', ''),
      estimated_duration = nullif(btrim(p ->> 'estimated_duration'), ''), recommendation_note = nullif(btrim(p ->> 'recommendation_note'), ''),
      visibility = v_vis, organization_id = v_org, is_featured = v_feat, display_order = v_order, status = v_status,
      updated_by = auth.uid()
    where id = v_id returning * into r;
  end if;
  return jsonb_build_object('id', r.id, 'slug', r.slug, 'status', r.status);
end;
$$;

-- Publish / unpublish / archive from the list.
create or replace function public.library_set_status(p_id uuid, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare r public.library_items;
begin
  select * into r from public.library_items where id = p_id for update;
  if not found then raise sqlstate 'PT404' using message = 'That resource no longer exists.'; end if;
  if p_status not in ('draft', 'published', 'archived') then raise sqlstate 'PT400' using message = 'Unknown status.'; end if;
  if not public.library_can_manage(r.visibility, r.organization_id, r.created_by, r.status) then
    raise sqlstate 'PT403' using message = 'You can’t change this resource.';
  end if;
  if p_status = 'published' and not public.library_can_publish(r.visibility, r.organization_id) then
    raise sqlstate 'PT403' using message = 'An admin needs to publish this resource.';
  end if;
  if p_status = 'published' and r.resource_type = 'document' and r.file_path is null then
    raise sqlstate 'PT400' using message = 'Upload the document before publishing it.';
  end if;
  update public.library_items set status = p_status, updated_by = auth.uid() where id = p_id;
end;
$$;

-- Delete. The page removes the resource's files from Storage first.
create or replace function public.library_delete_item(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare r public.library_items;
begin
  select * into r from public.library_items where id = p_id for update;
  if not found then return; end if;
  if not public.library_can_manage(r.visibility, r.organization_id, r.created_by, r.status) then
    raise sqlstate 'PT403' using message = 'You can’t delete this resource.';
  end if;
  delete from public.library_items where id = p_id;
end;
$$;

-- 8. Categories and tags (platform admins) -------------------------------
create or replace function public.library_save_category(p_id uuid, p_name text, p_description text default null, p_order integer default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_slug text; v_n int := 1;
begin
  if not public.library_is_platform() then raise sqlstate 'PT403' using message = 'Only Mathlete admins manage categories.'; end if;
  if coalesce(btrim(p_name), '') = '' then raise sqlstate 'PT400' using message = 'Give the category a name.'; end if;
  if p_id is null then
    v_slug := public.library_slugify(p_name);
    while exists (select 1 from public.library_categories where slug = v_slug) loop v_n := v_n + 1; v_slug := public.library_slugify(p_name) || '-' || v_n; end loop;
    insert into public.library_categories (slug, name, description, display_order)
    values (v_slug, btrim(p_name), nullif(btrim(p_description), ''),
            coalesce(p_order, (select coalesce(max(display_order), 0) + 1 from public.library_categories)))
    returning id into v_id;
  else
    update public.library_categories set name = btrim(p_name), description = nullif(btrim(p_description), ''),
      display_order = coalesce(p_order, display_order) where id = p_id returning id into v_id;
    if v_id is null then raise sqlstate 'PT404' using message = 'That category no longer exists.'; end if;
  end if;
  return v_id;
end;
$$;

create or replace function public.library_delete_category(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if not public.library_is_platform() then raise sqlstate 'PT403' using message = 'Only Mathlete admins manage categories.'; end if;
  select count(*) into n from public.library_items where category_id = p_id;
  if n > 0 then raise sqlstate 'PT409' using message = 'Move its ' || n || ' resource' || case when n = 1 then '' else 's' end || ' to another category first.'; end if;
  delete from public.library_categories where id = p_id;
end;
$$;

-- Tags live on each resource; these rename or remove one everywhere.
create or replace function public.library_rename_tag(p_old text, p_new text)
returns integer language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if not public.library_is_platform() then raise sqlstate 'PT403' using message = 'Only Mathlete admins manage tags.'; end if;
  update public.library_items i
     set tags = (select coalesce(array_agg(distinct t), '{}') from unnest(
                   array_remove(i.tags, p_old) || case when coalesce(btrim(p_new), '') = '' then '{}'::text[] else array[left(btrim(p_new), 40)] end) t)
   where p_old = any (i.tags);
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Tags in use on resources the caller can see, with counts.
create or replace function public.library_tags()
returns table (tag text, uses bigint) language sql stable set search_path = '' as $$
  select t, count(*) from public.library_items i, unnest(i.tags) t group by t order by lower(t);
$$;

-- 9. Browsing and search (runs as the caller, so only visible rows count) --
-- A school's name for a resource the caller can already see. (Visitors
-- can't read the organizations table itself.)
create or replace function public.library_org_name(p_org uuid)
returns text language sql stable security definer set search_path = '' as $$
  select o.name from public.organizations o
  where o.id = p_org
    and exists (select 1 from public.library_items i
                where i.organization_id = p_org
                  and public.library_can_view(i.status, i.visibility, i.organization_id, i.created_by));
$$;

-- One resource by its address, with its category and school names.
create or replace function public.library_get(p_slug text)
returns jsonb language sql stable set search_path = '' as $$
  select to_jsonb(i) - 'search' || jsonb_build_object('category_name', c.name, 'category_slug', c.slug,
         'organization_name', public.library_org_name(i.organization_id))
  from public.library_items i join public.library_categories c on c.id = i.category_id
  where i.slug = p_slug;
$$;

create or replace function public.library_search(
  p_q text default null, p_category text default null, p_subject text default null, p_tag text default null,
  p_type text default null, p_grade text default null, p_difficulty text default null,
  p_featured boolean default false, p_sort text default 'recent', p_limit integer default 24, p_offset integer default 0)
returns jsonb language plpgsql stable set search_path = '' as $$
declare
  v_tsq tsquery;
  v_words text[];
  res jsonb;
begin
  v_words := array(select w from unnest(regexp_split_to_array(lower(regexp_replace(coalesce(p_q, ''), '[^[:alnum:][:space:]]+', ' ', 'g')), '\s+')) w
                   where w <> '' limit 8);
  if cardinality(v_words) > 0 then
    v_tsq := to_tsquery('simple', array_to_string(array(select quote_literal(w) || ':*' from unnest(v_words) w), ' & '));
  end if;

  with hits as (
    select i.*, c.name as category_name, c.slug as category_slug, public.library_org_name(i.organization_id) as organization_name
    from public.library_items i
    join public.library_categories c on c.id = i.category_id
    where i.status = 'published'
      and (v_tsq is null or i.search @@ v_tsq or c.name ilike '%' || btrim(p_q) || '%'
           or exists (select 1 from unnest(i.tags) t where t ilike btrim(p_q) || '%'))
      and (p_category is null or c.slug = p_category)
      and (p_subject is null or i.subject = p_subject)
      and (p_tag is null or p_tag = any (i.tags))
      and (p_type is null or i.resource_type = p_type)
      and (p_grade is null or p_grade = any (i.grade_levels))
      and (p_difficulty is null or i.difficulty = p_difficulty)
      and (not p_featured or i.is_featured)
  ), page as (
    select * from hits
    order by
      case when p_sort = 'featured' then (not is_featured)::int end,
      case when p_sort = 'featured' then display_order end,
      case when p_sort = 'title' then lower(title) end,
      case when v_tsq is not null and p_sort = 'relevance' then ts_rank(search, v_tsq) end desc nulls last,
      published_at desc nulls last, created_at desc
    limit least(greatest(coalesce(p_limit, 24), 1), 60) offset greatest(coalesce(p_offset, 0), 0)
  )
  select jsonb_build_object(
    'total', (select count(*) from hits),
    'items', coalesce((select jsonb_agg(jsonb_build_object(
        'id', id, 'slug', slug, 'title', title, 'description', description, 'resource_type', resource_type,
        'category_name', category_name, 'category_slug', category_slug, 'subject', subject, 'tags', tags,
        'grade_levels', grade_levels, 'difficulty', difficulty, 'estimated_duration', estimated_duration,
        'external_url', external_url, 'thumbnail_path', thumbnail_path, 'thumbnail_url', thumbnail_url,
        'file_type', file_type, 'source_name', source_name, 'visibility', visibility,
        'organization_name', organization_name, 'is_featured', is_featured, 'published_at', published_at)) from page), '[]'::jsonb))
  into res;
  return res;
end;
$$;

-- Published resources per category (what the caller can see).
create or replace function public.library_category_counts()
returns table (category_id uuid, n bigint) language sql stable set search_path = '' as $$
  select i.category_id, count(*) from public.library_items i where i.status = 'published' group by i.category_id;
$$;

-- The manage page's list: everything the caller can change, plus their own
-- resources an admin has since published (read-only to them).
create or replace function public.library_manage_list()
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id, 'slug', i.slug, 'title', i.title, 'resource_type', i.resource_type, 'category_id', i.category_id,
      'category_name', c.name, 'visibility', i.visibility, 'organization_id', i.organization_id, 'organization_name', o.name,
      'status', i.status, 'is_featured', i.is_featured, 'display_order', i.display_order, 'created_at', i.created_at,
      'updated_at', i.updated_at, 'published_at', i.published_at,
      'created_by_name', case when i.created_by = auth.uid() then 'You' else coalesce(p.display_name, '—') end,
      'can_manage', public.library_can_manage(i.visibility, i.organization_id, i.created_by, i.status),
      'can_publish', public.library_can_publish(i.visibility, i.organization_id))
    order by i.updated_at desc), '[]'::jsonb)
  from public.library_items i
  join public.library_categories c on c.id = i.category_id
  left join public.organizations o on o.id = i.organization_id
  left join public.profiles p on p.user_id = i.created_by
  where auth.uid() is not null
    and (public.library_can_manage(i.visibility, i.organization_id, i.created_by, i.status) or i.created_by = auth.uid());
$$;

-- One resource with every field, for the edit form.
create or replace function public.library_get_for_edit(p_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare r public.library_items;
begin
  select * into r from public.library_items where id = p_id;
  if not found or not public.library_can_manage(r.visibility, r.organization_id, r.created_by, r.status) then
    raise sqlstate 'PT403' using message = 'You can’t edit this resource.';
  end if;
  return to_jsonb(r) - 'search';
end;
$$;

-- 10. Grants --------------------------------------------------------------
revoke all on function
  public.library_is_platform(), public.library_is_direct_author(), public.library_can_author(text, uuid),
  public.library_can_publish(text, uuid), public.library_can_manage(text, uuid, uuid, text),
  public.library_can_view(text, text, uuid, uuid), public.library_object_item(text),
  public.library_object_visible(text), public.library_object_manageable(text), public.library_access(),
  public.library_slugify(text), public.library_save_item(jsonb), public.library_set_status(uuid, text),
  public.library_delete_item(uuid), public.library_save_category(uuid, text, text, integer),
  public.library_delete_category(uuid), public.library_rename_tag(text, text), public.library_tags(),
  public.library_search(text, text, text, text, text, text, text, boolean, text, integer, integer),
  public.library_category_counts(), public.library_items_touch(), public.library_org_name(uuid), public.library_get(text), public.library_manage_list(), public.library_get_for_edit(uuid)
from public;

-- Used inside row-level security and Storage policies, so every role needs them.
grant execute on function
  public.library_is_platform(), public.library_is_direct_author(), public.library_can_author(text, uuid),
  public.library_can_publish(text, uuid), public.library_can_manage(text, uuid, uuid, text),
  public.library_can_view(text, text, uuid, uuid), public.library_object_item(text),
  public.library_object_visible(text), public.library_object_manageable(text),
  public.library_search(text, text, text, text, text, text, text, boolean, text, integer, integer),
  public.library_category_counts(), public.library_tags(), public.library_access(),
  public.library_org_name(uuid), public.library_get(text)
to anon, authenticated;

grant execute on function
  public.library_save_item(jsonb), public.library_set_status(uuid, text), public.library_delete_item(uuid),
  public.library_save_category(uuid, text, text, integer), public.library_delete_category(uuid),
  public.library_rename_tag(text, text), public.library_slugify(text), public.library_manage_list(),
  public.library_get_for_edit(uuid)
to authenticated;

insert into public.schema_versions (name) values ('library') on conflict (name) do nothing;
