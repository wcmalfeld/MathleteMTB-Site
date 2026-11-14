# Organizations and licences

How schools and academies use Mathlete: one shared platform, a private
workspace per organization, access controlled by a licence. Plan and audit:
[MULTI-ORG-PLAN.md](MULTI-ORG-PLAN.md). This page covers **Step 1** (the
foundation: organizations, memberships, licences, seats, isolation) and
**Step 2** (invitations, the organization page, CSV import).

## Setting up the database

Run these in the Supabase **SQL Editor**, in this order (each is safe to
re-run, and re-running any of them later is fine):

1. `supabase/setup.sql`
2. `supabase/progress.sql`
3. `supabase/organizations.sql`
4. `supabase/curriculum.sql`

Then, in the terminal: `nvm use 20`, `node scripts/test-organizations.mjs`
(throwaway organizations and people, deleted afterwards) and
`node scripts/test-progress.mjs`.

## Who is who

| | How they get in | What they see |
|---|---|---|
| **Direct account** (private tutoring clients) | a `members` row, as before (`admin.mjs invite`) | their own work; private tools |
| **Organization member** | a membership: owner, admin, instructor or student | their own work; owners/admins see their organization's work and members |
| **Platform admin** (Mathlete) | `platform_admins` (`admin.mjs superadmin`) | every organization |

One person can be a direct account and belong to several organizations, with
a different role in each. A person in more than one place chooses where
they're working with the **Working in** switcher on their dashboard; their
answers are saved to that organization. The server re-checks the choice
every time.

## When can someone use an organization?

They can **learn or teach** in it when all are true: their membership is
active, the organization is **active**, and its licence is current
(active, or trialing, within its dates; past due keeps working for the grace
period in `platform_settings.past_due_grace_days`, 14 days by default).

| Organization status | Students and instructors | Owners and admins |
|---|---|---|
| pending | not yet | can manage (set it up) |
| active | yes, if the licence is current | yes |
| suspended | no, from the next request | can still see it (to sort it out) |
| archived | no; hidden from the switcher | no; records are kept |

Nothing is ever deleted when access ends: records stay, and organizations
with history can't be deleted.

## Seats

Student seats are licensed; instructors, admins and owners don't use seats.
Used = active students; reserved = pending student invitations (Step 2).
Adding a student, or reactivating one, needs a free seat, checked under a
lock so two additions can't take the last seat. Removing or suspending a
student frees their seat. A new licence can't have fewer seats than students
already active.

## Licences

Plans are configurable (`plans`): seat limit, interval, products
(`academics`; MTB Coaching would be a separate product), and an optional
price set by Mathlete (none are invented). A licence is a `subscriptions`
row. Activating a new licence ends the current one (it stays in the history,
pointing to its replacement). Statuses: pending, trialing, active, past_due,
suspended, canceled, expired. Canceled and expired are final; renew by
activating a new licence. Payment providers come later (Step 6); manual
licences are real subscription records, not a bypass.

## Commands (terminal)

```
node scripts/admin.mjs plan pilot 50 term Organization Pilot
node scripts/admin.mjs org create world-class-academy sports_academy World Class Academy
node scripts/admin.mjs license world-class-academy pilot 30 2026-12-01 2027-06-30
node scripts/admin.mjs org add world-class-academy owner@example.com owner
node scripts/admin.mjs org status world-class-academy active
node scripts/admin.mjs org add world-class-academy student@example.com student
node scripts/admin.mjs orgs
node scripts/admin.mjs org show world-class-academy
node scripts/admin.mjs org member world-class-academy student@example.com removed
node scripts/admin.mjs license-status world-class-academy suspended Unpaid invoice
node scripts/admin.mjs org status world-class-academy suspended
```

`org add` sends a new person an email to set up their account (they don't
get a direct Mathlete membership; their access comes through the
organization). Schools invite their own people from the organization page
(below).

## Invitations (Step 2)

An owner or admin invites someone by email from **organization.html →
Members** (one person) or **Import** (a CSV list, checked in a preview
before anything is sent).

1. The database (`create_invitation`) checks the inviter's role (only an
   owner invites owners or admins), the address, and — for students — that
   a seat is free. A pending student invitation holds a seat for 7 days.
2. It makes a random link token and stores **only its hash**. Inviting the
   same address again ("Re-send") cancels the old link.
3. The `invite` server function emails the link (`join.html#t=…`) through
   Resend. Until email is set up, the page shows the link to copy and send
   yourself. The function acts as the signed-in admin, so the database
   makes every decision.
4. The invitee opens the link. **join.html** shows the organization, role
   and address, then:
   - **new to Mathlete:** they choose a password; the `join` server
     function creates the account for the invited address and accepts in
     one step (and removes the account again if accepting fails);
   - **already has an account:** log in (with that address), come straight
     back, one click to accept;
   - **logged in as someone else:** told so, and offered a log-out.
   Expired, used and withdrawn links each get a plain explanation.

Accepting adds the membership, marks the invitation used (a link works
once) and records `member.joined` in the audit log. Tokens and addresses
are never written to the log.

### The organization page (`organization.html`)

For owners and admins (and platform admins, who get a picker of every
organization). Tabs:

- **Overview:** seats, instructors, licence; a getting-started checklist
  that ticks itself off from real data (owner, licence, welcome message,
  instructors, students) and "Mark setup complete"; owners and admins;
  recent activity.
- **Members:** invite one person; filter by role and status, search; change
  role, suspend, reactivate, remove (records are kept; removing frees a
  student's seat). Admins can't touch owners or admins. Invitations: re-send,
  withdraw.
- **Import:** CSV with `email, first_name, last_name, role` (role blank =
  student; header optional; up to 500 rows). The preview flags bad
  addresses, duplicates, existing members, people already invited, roles
  the inviter can't give and students beyond the free seats. Results can be
  downloaded, including any links to send by hand.
- **Settings:** name and welcome message.
- **Subscription:** owners and platform admins only; licence and history.

Someone who manages an organization but has no learning access of their own
is sent here after logging in; members see a "Manage …" link under the
"Working in" switcher on their dashboard.

### Setting up email and the server functions (Supabase dashboard)

The page works without these (invitations become links to copy), but new
people can't create their account until `join` is deployed.

1. **Resend** (resend.com): add and verify the domain `mathletemtb.com`
   (it gives you DNS records to add where the domain is registered), then
   create an API key.
2. Supabase → **Edge Functions → Secrets**: `RESEND_API_KEY` (the key),
   `INVITE_FROM` = `Mathlete <invites@mathletemtb.com>`, `SITE_URL` =
   `https://www.mathletemtb.com`.
3. **Edge Functions → Deploy a new function → Via editor**: name `invite`,
   paste all of `supabase/functions/invite/index.ts`, deploy. Then name
   `join`, paste `supabase/functions/join/index.ts`, deploy, and in its
   settings turn **off** "Verify JWT" (people joining aren't signed in yet).
4. Optional: Supabase → Authentication → Emails → SMTP settings → use the
   same Resend account, so password-reset emails come from your domain too.

Then run `node scripts/test-organizations.mjs` again: it also tests `join`
once it's deployed.

## What's recorded

`audit_events` keeps who did what: organizations created and status
changes, members added and changed, plans saved, licences activated and
their status changes, invitations sent, re-sent, withdrawn and accepted,
settings changes and setup completion. No passwords, tokens or payment details. Owners and
admins can read their own organization's log; platform admins all of them.

## Tables and functions (`supabase/organizations.sql`)

Tables: `organizations`, `organization_memberships`, `platform_admins`,
`plans`, `subscriptions`, `platform_settings`, `invitations`,
`audit_events`, `schema_versions`. Learning records
(`question_attempts`, `game_sessions`, `review_items`) have
`organization_id` (null = direct account).

Checks used everywhere: `org_role(org)`, `org_can_learn(org)`,
`org_license_state(org)`, `seat_usage(org)`, `has_tool_access()` (direct OR
organization access), `has_individual_access()` (direct only).

Called by pages: `my_organizations()`, `organization_overview(org)`,
`org_members(org)`, `create_invitation`, `revoke_invitation`,
`invitation_preview(token)` (anyone holding the link), `accept_invitation(token)`,
`check_invitees(org, emails)`, `update_organization_settings`,
`complete_setup(org)`, `org_subscription(org)` (owner).
Server only: `accept_invitation_new_user(token, user)` (the `join` function).
Server functions: `supabase/functions/invite` and `supabase/functions/join`.
Called by admins (and `admin.mjs` via the service role):
`create_organization`, `set_organization_status`, `add_member`,
`update_member`, `save_plan`, `activate_license`, `set_subscription_status`.
