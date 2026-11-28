# Resources library

From `PRDs/resourcesPage.md` (Phase 1, plus featured and recently added).

| Page | What it is |
|---|---|
| `resources/` | The library: search, featured, categories, recently added, and every resource with filters (category, type, subject; more filters: skill/tag, grade level, difficulty) and sorting. Searches and filters stay in the address, so they can be shared. |
| `resources/view/?r=<address>` | One resource: the document preview and download, the embedded video, the "open the article/tool" link, or the written guide, plus details, tags and related resources. |
| `resources/manage/` | Add, edit, publish, unpublish and delete resources; categories and tags (Mathlete admins). Not indexed by search engines. |

"Resources" is in the main menu on every page, between Private Tutoring and About.

## One-time setup

Supabase dashboard → **SQL Editor** → paste `supabase/library.sql` → **Run**.
Run it after `setup.sql`, `progress.sql` and `organizations.sql` (all already
live). It's safe to run again. It creates:

- `library_categories` (with the nine PRD categories) and `library_items`
- the private Storage bucket `library` (50 MB per file; PDF, Word, PowerPoint,
  Excel, text, Markdown, JPG, PNG and WebP only)
- the functions the pages call, and every permission rule

No new environment variables and no new services. Nothing else needs
configuring: uploads use your existing Supabase project.

(Why `library_*`? The database already has a `resources` table: the
licensing catalog of labs and courses. This is a different thing.)

## Who can do what

All of this is enforced by the database, not the pages.

| Who | Sees | Can add / change |
|---|---|---|
| Anyone, not logged in | Published Mathlete-wide resources | Nothing |
| Student at a school | + that school's published resources (while its license is current) | Nothing |
| Tutor (`profiles.role = tutor`) | + Mathlete staff-only resources | Mathlete-wide resources as **drafts** (an admin publishes them), and staff-only ones. Can edit their own until an admin publishes them. |
| School instructor | + their school's staff-only resources | The same, for their school |
| School owner / admin | Everything for their school | Publish, edit and delete their school's resources. Never Mathlete-wide ones. |
| Mathlete admin (platform admin) | Everything | Everything, plus featuring, categories and tags |

- **Visibility**: *Mathlete-wide* (everyone), *School only* (that school's
  members), *Staff only* (Mathlete staff, or one school's staff). Students
  never see drafts, archived or staff-only resources.
- **Files** are private. They're delivered through links that expire after
  an hour, made only for people who can see that resource.
- **Safety**: written guides use simple formatting (headings, bold, lists,
  links, images) that is turned into page elements directly, so no one can
  add HTML or scripts. Links and images must be http(s). Videos must be
  YouTube or Vimeo, and the player is built from the video's id (never from
  pasted embed code). HTML, SVG and program files can't be uploaded.

## Adding a resource

`resources/manage/` → **Add resource**:

1. **Type**: Document, Article / Website, Video, Interactive tool, Written guide.
2. **Details**: title and short description, then what that type needs (a
   file, a link, or the written content with a live preview). Optional
   thumbnail, "why we recommend it", time to read or watch.
3. **Organize**: category, subject, difficulty, skills and tags, grade levels.
4. **Who can see it.**
5. **Save draft** or **Publish** (only shown if you're allowed to publish
   with that visibility). Admins can also feature it and set its order.

Deleting asks for confirmation and removes the resource's files too.

## Testing with each kind of account

Automated (no real database needed):

```
npm install --no-save @electric-sql/pglite
node scripts/test-library.mjs        # 70 permission checks, Node 20+
node scripts/check-site.mjs
```

By hand, after running `library.sql`:

- **Admin (you)**: log in → `resources/manage/` → add one resource of each
  type, publish, feature one. Check `resources/` in a private window (not
  logged in): you see published Mathlete-wide resources only.
- **Tutor**: `node scripts/admin.mjs role <tutor-email> tutor`, log in as them,
  add a resource: there's no Publish button for Mathlete-wide, only Save
  draft. Publish it from your admin account.
- **School**: as a WCA owner/admin, add a resource for "World Class Academy
  only" and publish it. A WCA student sees it; a visitor or another school
  doesn't (the page says it isn't available).
- **Student**: log in as a student → `resources/manage/` says the account
  can't add resources; drafts and staff-only resources never appear.

## Left for later (PRD Phase 2 and 3)

Curated collections; direct video uploads (videos are YouTube/Vimeo links
for now); bulk management; richer article previews; bookmarks, assigning
resources to students, completion and usage analytics. The data model has
room for these without a redesign.
