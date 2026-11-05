# Coaching & Progression Lab

Phase 1 of the *Coaching & Progression Lab* PRD, positioned for
performance riders by the *Advanced Performance Lesson Pack (v2)*: the
coaching library and its CMS. Riders browse and search skills, read full lessons (physics,
technique, prerequisites, mistakes, drills, progression, safety) and follow
pathways. Editors write, review and publish everything in the CMS at
`/coaching/admin/` without touching code.

It's built the same way as the rest of the site: static pages on GitHub
Pages, plain JavaScript, and the existing Supabase project for data and
sign-in. There's still no build step for the website.

## Setting it up (once)

1. **Create the tables.** Supabase → SQL Editor → paste and run
   `supabase/coaching.sql`. Safe to re-run.
2. **Load the starter content.** Run `supabase/coaching-seed.sql` the same
   way. This adds 46 skills with draft lessons (15 performance foundations
   and the pack's 31 advanced lessons), 39 drills, 55 common mistakes,
   7 pathways, 9 disciplines, the 6 foundational competencies and a
   registry of 50 sources. Re-running it only adds what's missing, so it
   never overwrites edits.

   **Upgrading?** If you ran an earlier version, run `coaching.sql` again
   first (it adds the new tables and columns safely). Re-running the seed
   then adds the new lessons, but won't change items already in your
   database, such as the first versions of the 15 foundation lessons. If
   you haven't edited those, delete them in the CMS before re-running the
   seed to get the tightened versions.
3. **Give yourself CMS access** (from your computer, with `.env` set up as in
   `docs/ACCESS.md`):

   ```bash
   node scripts/admin.mjs coach-editor you@example.com admin specialist
   ```

   This also gives the account member access, because editors sign in on
   the normal login page.
4. Open **www.mathletemtb.com/coaching/admin/**.

Nothing seeded is published. Until you publish something, riders see the
disciplines and an empty library.

## The starter content is a draft

Every seeded lesson is credited to **"Mathlete draft"** and must be rewritten
or reviewed by a qualified coach before it's published. It's original
writing informed by the public sources in the lesson pack, but it is not
expert-reviewed instruction.

**[COACHING-CONTENT-AUDIT.md](COACHING-CONTENT-AUDIT.md)** lists, for each
lesson, its sources, how well they could be verified, the reviewer it needs
and exactly what a specialist still has to write. In short: 15 advanced
lessons are ready for editorial review, and 16 (all the tricks, plus
scrubbing and the steeps progression) need specialist authoring first.

## Lesson sections

Beyond the PRD's lesson structure, each lesson has the pack's performance
sections: **performance outcome**, **who it's for**, **practice design**
(setting, focus, feedback, stop criteria), a **video-analysis rubric**,
**readiness gates** (shown as prompts, never as a safety certificate), a
**review standard**, and **sources** shown as "Further learning".

**Sources** (CMS → Sources) record each public resource with the pack's
access labels (free, paid course outline, coach education, reference index,
athlete demonstration, Mathlete original) and what could actually be
checked (page text reviewed, video only, couldn't open). Lessons link to
them; the site lists them as other creators' work, with no implied
endorsement.

**Specialist authoring.** A lesson's "Specialist authoring still needed"
list records what a qualified specialist must supply (technique,
progression, corrections, readiness). Any text containing
`SPECIALIST AUTHORING REQUIRED` marks a gap too. Such lessons can go to
review, so the specialist can work on them, but **can't be published**
until every gap is filled and the list is empty. Riders never see them;
in preview, the page shows a banner listing the gaps.

## Roles

| Role | Can |
|---|---|
| contributor | create drafts; edit and submit their own drafts |
| reviewer | edit anything; approve or send back submitted content |
| admin | everything, including publishing, archiving, rollback, disciplines, competencies and people |

Add **specialist** to a reviewer or admin who is qualified to approve
**advanced, expert or Class 3** content. Those items can only be approved
by a specialist who didn't make the last edit.

```bash
node scripts/admin.mjs coach-editor coach@example.com reviewer specialist
node scripts/admin.mjs coach-editors          # who has access
node scripts/admin.mjs coach-remove coach@example.com
```

## How publishing works

**Draft → Submitted for review → Approved → Published → Archived**

- Each item has a **working copy** (what you edit) and **published
  versions**. Riders only ever see the published version, so editing a live
  lesson doesn't change the site until the new version is approved and
  published. The CMS shows both numbers ("working copy v4 · live v3").
- Saving changes to something that's submitted, approved or published sends
  it back to **draft**, so an approval always covers the exact content.
- **Submit** is only possible once the item has everything it needs (the
  "Ready to publish?" checklist in the CMS). For example, a lesson needs an
  introduction, objectives, a physics explanation, technique stages with
  cues, at least one mistake and drill, protective equipment, stop
  conditions and a credited author. Class 2 and 3 lessons also need training
  environments; Class 3 lessons must require coach supervision.
- **Publish** is only possible once everything the item links to is
  published (a lesson's skill, drills, mistakes, videos, people), so the
  live site never has a broken link. Publish the drills and mistakes first,
  then the skill, then the lesson, then pathways.
- **Archive** takes an item off the site. It's refused while other live
  content links to it. History is kept, and an archived item can be restored
  as a draft.
- **Roll back** (admins) puts an older published version back on the site.
- Drafts that were never published can be deleted; published items can only
  be archived.
- Every change is in the activity log on the dashboard, with who made it.

All of this is enforced by the database functions in
`supabase/coaching.sql`. The CMS only shows the buttons; changing it in a
browser can't skip a step.

**Preview.** Editors can add `?preview=1` to any coaching page (or use the
"Preview this draft" link in the CMS) to see drafts. Riders who try it still
see only published content.

## Safety classes

| Class | Examples | On the site |
|---|---|---|
| 1 Foundational | balance, braking, basic cornering | self-guided practice with safety guidance |
| 2 Progressive | manuals, bunny hops, drops, jumping | prerequisites, protective equipment and suitable environments shown first |
| 3 High consequence | 180s and up, flips, technical steeps | theory only; drills shown as coach-led; practical pathway stages must be coach supervised; a **verified specialist coach must be credited as reviewer** before publishing |

Badges always show the class number and name, never colour alone. Nothing on
the site marks a rider as ready for anything: reading a lesson is never
treated as being able to ride it.

## Videos

Videos are hosted on a video service, never in this repository or the
database. In the CMS, add a **Video** with:

- **YouTube** or **Vimeo**: the video ID. Tick "captions are provided" once
  they are.
- **HLS stream** (Mux, Cloudflare Stream and similar): the `.m3u8` address.
  These get the site's own speed control, frame-by-frame stepping and
  chapters.
- **MP4**: an `https://` address.

Thumbnails and `.vtt` caption files can be uploaded from the CMS (they go to
the `coaching-media` storage bucket, 5 MB max). A video can't be published
until its licensing status is confirmed and it has captions. Then add it to
a lesson's **Videos** list, a technique stage, a drill or a mistake.

## Addresses

- `/coaching/` home, `/coaching/skills/?q=…` search, `/coaching/disciplines/`,
  `/coaching/progressions/`, `/coaching/drill/?d=…`
- `/coaching/manual` (any skill id) works too: `404.html` forwards it to
  `/coaching/skill/?s=manual`.

## Analytics

Events go through `js/track.js` (names only, never personal details):
`coaching_home_viewed`, `skill_searched`, `skill_viewed`,
`discipline_viewed`, `discipline_selected`, `progression_viewed`,
`drill_viewed`, `drill_opened`, `recommendation_selected`,
`safety_warning_viewed`, `video_played`, `coaching_example_search`.
They reach an analytics service once one is added to the site.

## Working on the code

| Where | What |
|---|---|
| `supabase/coaching.sql` | tables, review workflow, validation, permissions |
| `content/coaching/seed.json` | starter content, including the source registry |
| `docs/COACHING-CONTENT-AUDIT.md` | source audit, coverage matrix and review list (`node scripts/coaching-audit.mjs` regenerates it from the seed) |
| `js/coaching/core.js` | search, prerequisites, pathways, safety rules (no DOM) |
| `js/coaching/render.js`, `app.js` | the learner pages |
| `js/coaching/demos.js` | the five physics demos (simplified models): balance, braking, cornering grip, jump flight, rotation |
| `js/coaching/player.js` | video player |
| `js/coaching/cms.js`, `cms-schema.js` | the CMS and its forms |
| `css/coaching.css`, `css/coaching-cms.css` | styles |
| `scripts/build-coaching.mjs` | writes the page shells, `404.html` and `supabase/coaching-seed.sql` |

The pages are shells; content is drawn from the database, so new skills
appear without a rebuild. Run `node scripts/build-coaching.mjs` only after
changing that script or `seed.json`. `node scripts/check-site.mjs` fails if
you forget.

Locally (`python3 -m http.server 8000`, no Supabase), the pages show the
seed content with a "Local preview" banner.

**Tests** (Node 22 or newer; run `npm install` first, which only installs the database driver):

```bash
npm test                                   # unit tests: search, prerequisites, safety, physics
TEST_DATABASE_URL=postgres://user:pass@localhost:5432/postgres npm test
                                           # + 18 database tests against a real Postgres
```

The database tests create and drop a throwaway database and use a small
stand-in for Supabase's auth schema (`tests/sql/supabase-stub.sql`).

## Before launch

- **Coach review of every lesson**, or replace them with your own content.
- **Legal review of privacy and child safety** (PRD §14.3) before inviting
  young riders to accounts. Phase 1 collects no rider data: the public pages
  need no account and only editors sign in.
- **Real demonstration videos.** Skill pages say videos are being filmed
  until you add some.

## What's next (PRD phases 2 and 3)

The schema leaves room for these without restructuring:

- **Phase 2, rider progression:** rider profiles, saving skills, lesson
  completion, skill status (learning → practicing → coach verified, kept
  separate from lesson completion), and the rules-based recommendations.
  `foundationChain()` and `search()` in `core.js` are the starting points.
- **Phase 3, Practice Studio:** session builder and on-the-bike checklists,
  built from the drills already in the library.

Both need rider accounts, which is where the youth-protection review comes in.
