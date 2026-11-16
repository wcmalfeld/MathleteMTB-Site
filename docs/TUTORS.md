# The tutoring team: managing tutors and inquiries

From the PRD in `PRDs/tutorsPRD.md`. Everything about each tutor lives in
**one file**, `content/tutors/tutors.mjs`. A build script turns it into:

| Page | What it is |
|---|---|
| `tutoring.html` | The Private Tutoring landing page. Only the "Meet the Mathlete Team" cards are generated (between the `<!-- BUILD:tutor-cards -->` markers); everything else on it is hand-edited. Shows featured tutors (up to 3). |
| `tutors/` | The directory: every published tutor, filterable by subject and level (and format, once tutors differ). Filters can be linked to, e.g. `tutors/?subject=physics&level=high-school`. |
| `tutors/<slug>/` | One profile per published tutor. |
| `tutors/inquire/` | The inquiry form. `?tutor=<slug>` picks that tutor (every profile and card links this way). |

The site stays static: no admin app, no database for profiles. That keeps
it fast, readable by search engines, and impossible to break by a bad edit
on the live site, because the build refuses content with mistakes in it.

## Day-to-day tasks

All of these are edits to `content/tutors/tutors.mjs`, then, in Terminal
from the site folder:

```
node scripts/build-tutors.mjs
node scripts/check-site.mjs
```

and commit and push as usual.

| To… | Do this |
|---|---|
| **Add a tutor** | Copy an existing `{ … }` block, fill in every field (the top of the file explains each one), and put their photo in `assets/tutors/<slug>.jpg`. |
| **Edit a tutor** | Change their fields. Card, profile, filters and inquiry form all update from the same entry. |
| **Change a photo** | Replace the file in `assets/tutors/` (portrait, ideally 4:5 and at least 600px wide, with location data removed) and update `imageAlt` to describe it. |
| **Add or remove subjects / levels** | Edit the tutor's `subjects` or `academicLevels` using ids from `content/tutors/taxonomy.mjs`. |
| **Unpublish** | `published: false`. On the next build their profile page is deleted and they disappear from every list. |
| **Feature** | `featured: true` shows them on the Private Tutoring page (up to 3) and first in the directory. |
| **Reorder** | Change `displayOrder` (smaller first). Featured tutors always come before the rest. |
| **Change availability or location** | `availability` and `location` are optional; leave them out rather than guess. Use general information only, never an address. |

The build stops with a plain message if something's wrong: a missing
field, an unknown subject id, a photo that isn't there, two tutors with the
same slug, or something that looks like an email address or phone number.

**Write only what's true.** No invented credentials, experience,
testimonials or availability. Optional fields can stay out until there's
something real to say.

### Adding a subject, level or format

Add it to `content/tutors/taxonomy.mjs`. Subjects need nothing else: the
database only checks that a subject id is a sensible shape. **Levels and
formats** are checked exactly, so add a new one to the matching `check (…)`
in `supabase/tutoring.sql` as well and re-run that file in the SQL Editor.
`check-site.mjs` fails until the two match.

## Inquiries

The form saves to the Supabase table `public.tutoring_inquiries`
(`supabase/tutoring.sql`). Visitors can add a row but can never read,
change or delete one. If saving isn't possible (not configured, offline,
busy), the visitor is offered an email to wcmalfeld@gmail.com with their
answers already filled in, so nothing they typed is lost.

One-time setup: Supabase dashboard → SQL Editor → paste
`supabase/tutoring.sql` → Run. It's safe to run again.

Reading them (Terminal, from the site folder):

```
node scripts/admin.mjs inquiries          # open inquiries (tutoring and College & Beyond)
node scripts/admin.mjs inquiries all      # including handled ones
node scripts/admin.mjs handled <id>       # mark one done
```

There's no email notification when an inquiry arrives yet; check with the
command above, or in the dashboard's Table Editor. The form never says a
session is booked. Its confirmation offers the booking page as an optional
next step.

## Limits to know about

- Tutors don't log in or edit their own profiles (that was a non-goal).
  Changes go through this file.
- Filtering is simple matching on subject, level and format, not a
  recommendation algorithm, as the PRD asked.
- Booking (`book.html`, Calendly) is still one schedule for the whole
  site. Per-tutor booking would need a Calendly event per tutor.
