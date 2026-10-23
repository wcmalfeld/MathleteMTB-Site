# Member access: public tools and invite-only tools

The site stays a static GitHub Pages site. Member login uses
[Supabase](https://supabase.com) Auth, and the actual protection happens in
Supabase's database and file storage, not in the browser.

## How it works

| What | Who can use it | Where it's enforced |
|---|---|---|
| Homepage, About, Login, Account pages | Everyone | Not protected (public pages) |
| **Public tools** (3) | Everyone, no login | Hosted publicly, e.g. `wcmalfeld.github.io/...` |
| **Private tools** | Signed-in members with active access | Supabase Storage row-level security |
| Member list (`public.members`) | Each member sees only their own row; only you can change it | Postgres row-level security + revoked write privileges |

A private tool is a single HTML file kept in the **private** Storage bucket
`private-tools`. When a member opens `tool.html?id=<tool-id>`, the page
downloads that file *with the member's own session token*. Supabase serves it
only if the database function `has_tool_access()` returns true:

- the user is signed in, **and**
- has a row in `public.members` with `active = true` (and no past `expires_at`), **and**
- is not banned, **and**
- the session in their token still exists (so logging out or revoking works
  immediately, not when the token expires).

Hiding cards, redirecting to login, and the "Log out" link only affect what
the page shows. Editing browser storage, the URL, or the page's JavaScript
cannot unlock a private tool, because the file never leaves Supabase without
that server-side check.

## Which tools are public right now

`js/tools-config.js` is the only place that decides this:

| id | Tool | Access |
|---|---|---|
| `trail-builder` | Trail Builder | public |
| `strava-showdown` | Strava Showdown | public |
| `gear-ratio-lab` | Gear Ratio Lab | public |
| `summit-expedition` | Summit Expedition | **private** (bucket: `summit-expedition/index.html`) |
| `tool-04` | Tool 04 (placeholder) | private |
| `tool-05` | Tool 05 (placeholder) | private |

The three public tools are hosted on their own public GitHub Pages sites.
Summit Expedition is members-only: its file lives in the private bucket, and
its source is kept (git-ignored) in `private-tools/summit-expedition/`.
**Its old public copy at `wcmalfeld.github.io/Summit-Expedition---Mathlete/`
must be taken down** (delete or make private that GitHub repository, or turn
off its Pages site) — until then, anyone with that link can still play it.

### Changing which tools are public

1. Edit `access:` for the tools in `js/tools-config.js`. Keep exactly three
   public; `node scripts/check-site.mjs` and the browser console both warn
   otherwise.
2. Move the tool itself to match:
   - **Making a tool public:** host it publicly (its own GitHub Pages repo is
     fine), set its `url`, and remove `file`. In `index.html`, remove `hidden`
     from its card.
   - **Making a tool private:** upload it to the bucket
     (`node scripts/admin.mjs upload ...`), set `file` and remove `url`, add
     `hidden` to its card, and **take down its public copy** (for example,
     delete or make private its GitHub Pages repository). As long as a public
     copy exists, anyone with that address can still use it.
3. Run `node scripts/check-site.mjs`.

## One-time setup (you need to do this)

1. **Create a Supabase project** at supabase.com (free tier is fine).
2. **Run the SQL:** Dashboard → SQL Editor → paste `supabase/setup.sql` → Run.
   It is safe to run again.
3. **Turn off public sign-up:** Authentication → Sign In / Providers → Email:
   turn **off** "Allow new users to sign up". Keep Email provider enabled.
   (Set minimum password length to 8 while you're there.)
4. **Redirect URLs:** Authentication → URL Configuration:
   - Site URL: `https://www.mathletemtb.com`
   - Redirect URLs: add `https://www.mathletemtb.com/account.html`
5. **Email (recommended):** Supabase's built-in email sender is limited to a
   few emails per hour. For real use, add your own SMTP (Authentication →
   Emails → SMTP Settings). Until then, use `create` or `reset-link` (below),
   which don't send email.
6. **Give the website the public settings:** GitHub repo → Settings → Secrets
   and variables → Actions → **Variables** tab → add:
   - `SUPABASE_URL` = Project Settings → API → Project URL
   - `SUPABASE_ANON_KEY` = Project Settings → API → `anon` `public` key

   The deploy workflow writes these into `js/supabase-config.js`. It fails the
   deploy if you paste the `service_role` key by mistake.
7. **Set up your computer for admin commands:** copy `.env.example` to `.env`
   and fill in all values, including `SUPABASE_SERVICE_ROLE_KEY` (Project
   Settings → API → `service_role`). `.env` is git-ignored. Never put the
   service_role key in the website, the repository, or GitHub variables.
   The scripts need Node 18+ (`nvm use 20`).
8. **Push to `main`** to deploy, then run `node scripts/test-access.mjs`
   (see Testing).

### Environment variables

| Name | Where it lives | Secret? |
|---|---|---|
| `SUPABASE_URL` | GitHub Actions variable + your `.env` | No |
| `SUPABASE_ANON_KEY` | GitHub Actions variable + your `.env` | No (designed to be public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your `.env` only | **Yes** |
| `SITE_URL` | Your `.env` (defaults to `https://www.mathletemtb.com`) | No |

## Managing members

From the project folder (Node 18+, `.env` filled in):

| Task | Command |
|---|---|
| Invite someone (they get an email and choose a password) | `node scripts/admin.mjs invite student@example.com` |
| Create an account now with a temporary password (no email needed) | `node scripts/admin.mjs create student@example.com` |
| See everyone and their status | `node scripts/admin.mjs list` |
| Revoke access (immediate; also blocks logging in) | `node scripts/admin.mjs revoke student@example.com` |
| Give access back | `node scripts/admin.mjs restore student@example.com` |
| Email a "set a new password" link | `node scripts/admin.mjs reset student@example.com` |
| Get that link to send yourself (no email) | `node scripts/admin.mjs reset-link student@example.com` |

Members can also use **Forgot your password?** on the login page, and can
change their password at `/account.html` while signed in.

**Without the script (dashboard only):**

- *Invite:* Authentication → Users → Add user → Send invitation. Then
  SQL Editor:
  `insert into public.members (user_id, email) select id, email from auth.users where email = 'student@example.com';`
- *Revoke:* `update public.members set active = false where email = 'student@example.com';`
  and, to also block login, Authentication → Users → the user → Ban user.
- *Restore:* `update public.members set active = true where email = '...';` and unban.
- *Reset password:* Authentication → Users → the user → Send password recovery.
- *Delete someone entirely:* Authentication → Users → Delete user (their
  members row is removed automatically).

An account only gets private tools if it has an **active members row**.
An account that exists without one can log in, but sees the "doesn't have
access" message and gets nothing private.

## Adding a private tool

1. Build it as **one self-contained HTML file** (CSS and JS inline; images
   inline or from absolute `https://` URLs). Relative links like
   `img/foo.png` won't resolve.
2. Keep the source in `private-tools/<tool-id>/index.html`. That folder is
   git-ignored, so it is never published with the site. Don't put private
   tools in a public GitHub repo.
3. Upload: `node scripts/admin.mjs upload private-tools/tool-04/index.html tool-04/index.html`
4. In `js/tools-config.js`, set that tool's `status: 'live'` and
   `file: 'tool-04/index.html'` (`access: 'private'`).
5. In `index.html`, replace its "Coming Soon" card with a full card (copy an
   existing `<details class="tool-card" ...>` block). Keep
   `data-tool="tool-04"` and `hidden` on it, and give its play button
   `data-tool-launch` (the script points it at `tool.html?id=tool-04`).
6. Run `node scripts/check-site.mjs`, then push.

Re-uploading the same path replaces the tool. Members get the new version
the next time they open it.

## Testing

- `node scripts/check-site.mjs` (offline, any time): exactly three public
  tools, cards match the config, members-only cards start hidden, script order,
  and no secret keys or private tool files in the repository.
- `node scripts/test-access.mjs` (needs `.env` and the setup above): creates
  two throwaway users and a probe file, then checks guest, non-member, member,
  logged-out and revoked access against the real server, then deletes
  everything it made.

## Limits to know about

- **Public tools are public.** Anyone can use them; that's the point. The
  two current tools live in public GitHub repositories, so their code is
  visible too.
- **A private tool runs in the member's browser.** Once a member opens it,
  they could save a copy of that HTML file. Access control stops non-members
  from getting it, not members from keeping it. Anything that must never
  leave your control (answer keys, student data) belongs in the database
  behind row-level security, not in a tool's HTML.
- **Revocation** blocks new downloads and logins immediately. A tool that is
  already open is closed at the next access check (every 5 minutes, and
  whenever the tab regains focus).
- **Saved progress** in the current tools is stored in the student's own
  browser (localStorage); there is no server-side progress to protect yet.
  If you add it later, store it in a table with row-level security keyed to
  `auth.uid()` and `has_tool_access()`.
- **Paid access later:** `public.members` already has `plan` and
  `expires_at`, and `has_tool_access()` already respects `expires_at`, so a
  payment provider's webhook can create and extend rows without changing the
  website.
