# Multi-organization platform: audit and plan (PRD 0)

Response to [PRDs/Multi_Organizational.md](../PRDs/Multi_Organizational.md),
PRD 0. Inspection and planning only: nothing in the application was changed
to produce this. Audited 2026-11-13.

**Headline:** the existing stack (static site + Supabase Auth + Postgres with
row-level security) can carry the multi-organization platform without a new
backend. The live database currently holds **one account (the platform
owner) and no student learning records**, so the foundation can be
restructured now with essentially no migration risk. The one architectural
decision that needs your call before PRD 3/4 is **how paid learning content is
protected**, because today the labs are public files (section 8).

---

## 1. Current application architecture

| Layer | What exists |
|---|---|
| Hosting | Static site on GitHub Pages, deployed by `.github/workflows/static.yml`. No server, no build step at deploy (the workflow only writes `js/supabase-config.js` from repository variables). |
| Front end | Hand-written HTML + vanilla JavaScript (no framework). Labs are self-contained ES-module apps in `learning-lab/<id>/`. |
| Generated pages | Node scripts write committed HTML: `build-lab.mjs` (Lab tiles/categories), `build-riding.mjs` (riding drafts), `build-classes.mjs` (Classes: 4 courses, 36 units, 168 topics, 508 skills, plus `supabase/curriculum.sql`). `check-site.mjs` fails when generated output drifts. |
| Backend | Supabase: Auth, Postgres (RLS + `SECURITY DEFINER` functions called over PostgREST RPC), Storage (one private bucket). |
| Admin | `scripts/admin.mjs`, run locally with the service-role key from `.env` (invite, roles, assignments, goals, coaches…). No admin web UI. |
| Database changes | Hand-run, idempotent SQL files pasted into the Supabase SQL Editor: `setup.sql`, `progress.sql`, `curriculum.sql` (generated), `coaching.sql` (written, hidden, not run). No migration history table. |
| Tests | PGlite (in-memory Postgres) tests of every SQL file incl. RLS; Node unit tests for each lab; real-Chrome end-to-end tests; live acceptance scripts (`test-progress.mjs`, `test-coaching.mjs`) using throwaway accounts. |
| Billing / payments | None. Booking is Calendly links (`js/booking-config.js`). |
| Analytics | None (`js/track.js` is an inert hook). |

## 2. Existing data model

**Accounts and access** (`setup.sql`, `progress.sql`)
- `auth.users`: Supabase identities (email + password). Invite-only.
- `members (user_id, email, active, plan, expires_at, note)`: the global
  access gate. `has_tool_access()` = signed in, live session, active and
  unexpired `members` row. Every protected table/function checks it.
- `profiles (user_id, role, display_name, grade_level, baseline)`: **one global
  role** per person: student / tutor / parent / admin (+ coach in coaching.sql).
- `student_tutors (student_id, tutor_id, active)`: global tutor assignments.

**Learning records** (`progress.sql`), all keyed by `student_id` only:
`game_sessions`, `question_attempts` (append-only; snapshot of the question),
`review_items` + `review_events` (Review My Mistakes), `student_goals`,
`progress_settings`. Shared reference data: `skills` (14 broad), `questions`
(registered question kinds per game), `question_skills`.

**Curriculum** (`curriculum.sql`, generated, not yet run): `curriculum_skills`,
`curriculum_question_skills`, `curriculum_progress()`.

**Coaching** (`coaching.sql`, hidden, not run): coaches, athlete links, goals,
plans, ride logs.

**Other:** `inquiries` (College & Beyond form, hidden; table not present in the
live database), Storage bucket `private-tools` (members-only HTML tools).

**Live data today:** 1 member (active), 1 profile (admin), 0 students, 0 tutor
links, 0 attempts, 0 sessions, 0 review items, 0 goals.

## 3. Current authentication and permission model

- Supabase Auth, email + password, invitations sent by `admin.mjs`
  (service role) with the "set a password" flow on `account.html`.
- Authorization is enforced in the database: RLS select policies; all writes
  go through `SECURITY DEFINER` functions that read `auth.uid()` and check
  `has_tool_access()`, the caller's role and assignments (`my_role()`,
  `my_student_ids()`, `my_tutor_ids()`). The browser never chooses whose
  record it writes.
- Visibility: a student sees their own records; a tutor sees assigned
  students; `admin` sees everything.
- Public content: `learning-lab/*` labs and pages are public files on GitHub
  Pages. Only the private tools (Storage bucket + `has_tool_access()` policy,
  loaded through `tool.html`) are truly protected.

**Assumptions of "one global Mathlete environment" that must change:**
`members` is the only access gate (no organization, no license); roles are
global; `student_tutors` is global; learning records have no organization;
`admin` is both "platform owner" and "can see every student"; the dashboard,
review and goals functions assume one context per student.

## 4. Reusable functionality

- **Identity:** one Supabase account per person (PRD principle B) — keep.
- **Authorization pattern:** RLS + `SECURITY DEFINER` RPCs + helper
  functions. Extends naturally to "role within organization X".
- **Progress engine:** `record_attempt()` (deduped, append-only), first-try
  view, review queue, goals, curriculum skill linkage. Gains an organization
  context; logic stays.
- **Content model:** Classes data (`content/classes/`) already separates
  global content (courses, topics, skills, activities with stable ids) from
  student records, and activities already link to skills many-to-many. This
  becomes the global **resource catalog** (PRD 3) with no duplication.
- **Labs:** standalone modules with a `mount()` API and a page adapter
  (`main.js`) — the adapter is where organization context and entitlement
  checks attach (`docs/LAB_DEVELOPMENT_FRAMEWORK.md`).
- **Private Storage bucket + policy:** a working pattern for truly protected
  files.
- **Student pages** (dashboard, progress, review, goals) and their shared
  shell; `admin.mjs` command structure; the PGlite test harness (tenant
  isolation tests fit it directly).

## 5. Missing functionality

Organizations, organization memberships and org-scoped roles; platform super
admin as a separate concept; organization context + switcher; plans,
subscriptions, entitlements, seats; invitations with hashed tokens and
self-service acceptance; bulk CSV import; organization dashboard and admin
UI; platform administration UI; resource catalog in the database; per-org
resource enable/disable; branding (logo storage); classes, cohorts,
assignments; instructor dashboard (the earlier "Phase 3 tutor dashboard" was
never built); audit log; email sending at volume; billing provider.

## 6. Proposed multi-tenant architecture

**One Supabase project, shared tables, an `organization_id` on every
organization-owned row, enforced by RLS and by every write function.** No
per-school deployments, schemas or databases.

- **Organization context, server-verified.** The browser keeps the selected
  organization (for the switcher) and passes its id to each RPC; every
  function re-checks it: `org_role(org_id)` returns the caller's active role in
  that organization *only if* membership, organization and license are all
  valid, else null. RLS policies use the same helpers. A client-supplied id is
  never trusted on its own (PRD 1.3).
- **Roles per membership** (`owner`, `admin`, `instructor`, `student`); the
  platform super admin is a separate table (`platform_admins`), never
  assignable by an organization.
- **Global content stays global.** Catalog, curriculum, questions and lab code
  are shared; organizations hold *configuration* (enabled resources, course
  visibility, branding) and *records* (memberships, classes, assignments,
  attempts made in that organization).
- **Activity records carry the context they were made in.**
  `question_attempts`, `game_sessions`, `review_items`, goals and new
  assignments get `organization_id` (null = personal/direct account).
  A WCA instructor sees attempts made in WCA by their assigned students; a
  student always sees all of their own.
- **Direct (individual) accounts keep working.** The current `members` gate
  becomes "individual access": people who aren't in an organization (private
  tutoring clients) continue exactly as today.

## 7. Proposed database changes

New (in a new `supabase/organizations.sql`, idempotent like the others):

| Table | Purpose |
|---|---|
| `organizations` | id, name, slug (unique), type, status, logo_path, accent_color, welcome_message, primary_contact, timestamps |
| `organization_memberships` | id, organization_id, user_id, role, status, joined_at, updated_at; unique (organization_id, user_id) |
| `platform_admins` | user_id: who is a Mathlete super admin |
| `invitations` | id, organization_id, email, role, invited_by, token_hash, expires_at, status, accepted_at, accepted_by |
| `plans`, `plan_resources` | configurable plans (no prices hard-coded; price/currency fields set by admins), included resources, seat and staff limits, version/effective date |
| `subscriptions` | organization, plan, dates, interval, status, seat allowance, provider reference, metadata, cancellation; history kept (new row per change) |
| `resources` | the global catalog (generated from `content/classes/activities.mjs` + tools registry, like `curriculum.sql`): id, slug, type, subject, course, objectives, skills, sport context, status, version |
| `organization_resources` | per-org enabled/disabled + defaults (only for entitled resources) |
| `organization_course_settings` | course visibility, recommended topics, curated collections |
| `classes`, `class_instructors`, `class_students` | PRD 5 |
| `assignments`, `assignment_targets` | PRD 5; reference resources, never copies |
| `audit_events` | actor, organization, action, target, at, metadata (no secrets) |

Changed:
- `question_attempts`, `game_sessions`, `review_items`, `student_goals`: add
  nullable `organization_id`; `record_attempt()` takes the active organization,
  validates membership + entitlement, and stores it.
- `has_tool_access()` → split into "individual access" (today's `members`) and
  `org_access(org_id)`; protected functions accept either, as appropriate.
- `student_tutors` → superseded inside organizations by class/instructor
  assignments; kept for direct tutoring.
- `profiles.role` → keeps only the person's default/legacy meaning; the
  `admin` value maps to `platform_admins`.

Indexes on every `organization_id`, foreign keys everywhere, and status
checks as constraints.

## 8. Proposed authorization approach

Every protected read/write = **membership active ∧ organization active ∧
license current ∧ resource entitled ∧ resource enabled ∧ role permits**
(PRD 3.3), computed in one SQL function used by both RLS and RPCs. Seat
counting is done transactionally (row lock on the subscription) inside the
invitation and acceptance functions.

**The decision needed: how lab content is protected.** Server-side
enforcement works for everything stored in the database (progress, classes,
assignments, reports, private Storage files). But the labs themselves are
public static files on GitHub Pages; GitHub Pages cannot check a license
before serving a file. Options:

1. **License the platform, not the files (recommended for V1).** Labs stay
   publicly playable (good for marketing and for the Lab's Featured Tools).
   What a school licenses, and what is enforced server-side, is everything
   institutional: saving attempts to student accounts, classes, assignments,
   instructor visibility, reports, review. `record_attempt()` refuses work in
   an organization that isn't entitled to that resource. Honest, simple, no new
   infrastructure.
2. **Protect selected premium labs as files.** Bundle a lab into a single file
   in the private bucket (the Summit Expedition pattern) and gate the bucket
   policy on entitlements. Real protection, but needs a bundling step per
   protected lab and loses public discoverability for those labs.
3. **Move hosting to an edge platform with auth** (e.g. Cloudflare Pages +
   Workers) to gate whole paths. Strongest, but new infrastructure, which the
   PRD asks us to avoid unless needed.

Recommendation: **1 now, 2 for specific labs if a customer requires it.**

**Server code we will need (within Supabase, not a new backend):** Supabase
Edge Functions for (a) accepting an invitation (verify token hash, create or
link the account, activate membership, consume the seat), (b) sending
invitation emails, and later (c) Stripe webhooks. These deploy with the
Supabase CLI. Everything else stays in SQL functions.

## 9. Data migration and backward compatibility

- Current live data: one admin account, no student records. **No learning
  history to map.** Nothing is assigned to WCA automatically.
- The existing account becomes a platform super admin (and stays a direct
  account). New columns are nullable; existing rows keep `organization_id =
  null`, meaning "personal/direct", which the PRD lists as a valid owner.
- Every SQL change stays idempotent and additive (no drops of existing
  tables or columns); existing pages and labs keep working for direct
  accounts throughout.
- Introduce a schema-version table and numbered change files
  (`supabase/migrations/NNN_*.sql`) from here on, so each environment's state
  is known — still pasted into the SQL Editor, or applied with the Supabase CLI
  if you adopt it.
- Before WCA's students arrive, run `curriculum.sql` (not yet applied) and
  decide on the hidden `inquiries` table.

## 10. Recommended implementation order

The PRD's order is 1 → 2 → 3 → 4 → 5. One adjustment: invitations (PRD 2)
must check seats, which belong to licensing (PRD 4). So the **data model** for
plans, subscriptions and seats lands with the foundation, and the screens
follow in PRD order.

| Step | Scope | Proves |
|---|---|---|
| 1 | PRD 1 + licensing tables: organizations, memberships, platform admins, org context helpers, status rules, `organization_id` on activity, audit log; admin.mjs commands to create orgs, activate a manual license, set seats | Two organizations, isolated, with tests (PRD 1.7) |
| 2 | PRD 2: invitations (hashed tokens, expiry, seat reservation), acceptance Edge Function, members page, CSV import with preview, organization dashboard, switcher | An org manages its own students and instructors |
| 3 | PRD 3: resource catalog (generated), entitlements vs configuration, Learning Resources page, course visibility, branding, student preview | An org enables/disables only licensed resources, enforced server-side |
| 4 | PRD 4 screens: platform admin (orgs, plans, subscriptions, seats, history), expiry/grace enforcement, status messaging | Access follows the license |
| 5 | PRD 5: classes, assignments, student assignment list, instructor dashboard, reports | WCA day-to-day use |
| 6 | Billing automation (Stripe via Edge Function webhooks) | Only once manual licensing is proven |

The **WCA acceptance test** (PRD final section) becomes an automated live test
like `test-progress.mjs`: throwaway organizations, owner, instructor,
student; steps 1–21; cleaned up afterwards.

## 11. Technical risks and recommendations

1. **Public lab files** (section 8). Decide the model before PRD 3.
2. **Email volume.** Supabase's built-in email is rate-limited (a few emails
   per hour); a class of 30 invitations will exceed it. Configure custom SMTP
   (e.g. Resend or Postmark) before bulk invites.
3. **Supabase plan.** Free projects pause after a week of inactivity and have
   no backups. Move to Pro before any school's student data lives there.
4. **Students without email addresses.** Supabase accounts need an email or
   phone. Options: school-issued addresses (simplest), or organization-scoped
   usernames mapped to non-deliverable addresses with admin-set passwords.
   Decide with WCA; never shared credentials.
5. **Privacy obligations.** Minors' education records: you'll need a data
   processing agreement with WCA, a privacy notice, export/deletion
   procedures, and a FERPA/COPPA (and state law) review. Data minimization is
   already the default (first names only).
6. **Manual SQL deployment.** Pasting files works for one environment but
   gets fragile as the schema grows; adopt numbered migrations now and
   consider a second Supabase project as staging.
7. **No admin UI today.** PRD 2–5 add real web screens; they'll follow the
   student pages' pattern (static pages + RPCs), with every rule in the
   database so a page can't grant anything by itself.
8. **Coaching stays separate.** Licensing is product-aware (`academics`,
   later `mtb-coaching`); an Academics license never grants coaching.
9. **Scope creep.** The PRD's non-goals (SSO, gradebook, custom domains,
   white-label) stay out.

## Decisions needed before Step 1

1. **Content protection model:** license the platform (recommended), protect
   selected labs as files, or move hosting.
2. **Your private tutoring clients:** stay as direct accounts (recommended
   for now), or become an organization ("Mathlete Tutoring") so everything is
   organization-based.
3. **Edge Functions + custom SMTP:** OK to add these to the Supabase project
   (needed for self-service invitations at school scale)?
4. **Supabase Pro** and a **staging project** before WCA onboarding?
5. **WCA student identifiers:** do WCA students have school email addresses?

---

## Progress log

**2026-11-13: decisions.** License the platform, not the lab files; private
tutoring clients stay direct accounts; Edge Functions and a custom email
service are fine; Supabase Pro (and a staging project) before WCA; WCA
students use their own personal email addresses (normal email invitations).

**2026-11-13: Step 1 built** (see [ORGANIZATIONS.md](ORGANIZATIONS.md)).
`supabase/organizations.sql` (organizations, memberships, platform admins,
plans, subscriptions with history, seats, invitations table, audit log,
status and licence rules, org-scoped RLS), `organization_id` on learning
records, `record_attempt()` takes and verifies the organization, access
split into direct vs organization (`setup.sql`), "Working in" switcher
(`js/org.js`), admin.mjs organization/licence commands, live acceptance test
`scripts/test-organizations.mjs`. Local tests: 44/44 isolation and licensing
checks; all earlier database suites pass; switcher 8/8 in Chrome.
Needs: the four SQL files run in order, the live test, deploy.
Next: Step 2 (invitations, members page, CSV import, organization
dashboard), which needs custom SMTP configured in Supabase first.

**2026-11-13: Step 2 built** (see [ORGANIZATIONS.md](ORGANIZATIONS.md#invitations-step-2)).
Invitations in `organizations.sql` (hashed single-use tokens, 7-day expiry,
re-send cancels the old link, seats held by pending student invitations,
email must match on accept), members/CSV/settings/setup/subscription
functions. Server functions `supabase/functions/invite` (emails via
Resend; falls back to a copyable link) and `supabase/functions/join`
(creates the account and accepts, rolling back on failure).
`organization.html` (Overview with getting-started checklist, Members,
Import with preview, Settings, Subscription) and `join.html`. Login lets
invitations through and sends managers without learning access to their
organization. Local tests: 70/70 database checks, 20/20 server-function
checks, 47/47 page checks in Chrome, all earlier suites, check-site 141/141.
Needs: the SQL files run again in order, Resend + the two functions
deployed, the live test, deploy.
Next: Step 3 (resource catalog and entitlements).
