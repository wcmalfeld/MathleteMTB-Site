# Interactive Learning Lab: site audit and migration plan

Phase 0 deliverable for the *Mathlete MTB Interactive Learning Lab* PRD.
Audit date: 2026-10-31. Audited against `main` at `ef4f5e4`.

Short version: the current site already has most of the plumbing the PRD
asks for (a tool registry, server-enforced access control, four working
tools). The work is mostly reorganizing and building on it, not a
rewrite. Three things are broken or exposed on the live site today and
should be fixed before any redesign (section 1).

---

## Progress

- **2026-10-31, Phase 1 (part 1) done:** registry fields added to
  `js/tools-config.js`, `js/lab-categories.js`, `scripts/build-lab.mjs`
  generating `/learning-lab/` + four category pages (dark Lab theme,
  `css/lab.css`), filters (`js/lab.js`, linkable via `?subjects=physics`),
  new nav on all pages, homepage hero/CTAs per PRD §5.2 and a Lab call-out,
  new checks in `check-site.mjs` (incl. `--online`).
- **Still to do in Phase 1:** separate `/tutoring/` and `/contact/` pages
  (nav currently points at `index.html#services` / `#contact`), homepage
  parent-focused section (PRD §5.6), analytics service choice.
- Tool `minutes`/`duration`/`difficulty` values in the registry are
  first estimates; confirm them.

## 1. Fix first (live-site problems found during the audit)

| # | Problem | Impact | Fix |
|---|---|---|---|
| 1 | ~~**MTB Physics Playground link is dead.**~~ **Fixed 2026-10-31:** the app is now built and served from its own repo at `wcmalfeld.github.io/mtb-physics/`, and the site links there. | — | — |
| 2 | **Summit Expedition's old public copy is still up.** `wcmalfeld.github.io/Summit-Expedition---Mathlete/` returns 200. | The members-only tool is free to anyone with that address. `docs/ACCESS.md` already flags this. | Delete that repo, make it private, or turn off its Pages site. |
| 3 | Trail Builder URL (`TrailBuilder-Math` → `TrailBuilder_Math`). | Fixed in `4675c1a`, cache-busted in `ef4f5e4`. | Done. |

`node scripts/check-site.mjs` passes all 30 checks; it doesn't test that
external tool URLs respond. Adding that check (section 9) would have caught #1.

---

## 2. What exists today

| Area | Current state |
|---|---|
| Stack | Hand-written static HTML, one stylesheet (`css/site.css`, ~1,400 lines), vanilla JS. No framework, **no build step**. The README is written so the site can be edited in any text editor; keep that property. |
| Hosting | GitHub Pages via Actions (`.github/workflows/static.yml`), custom domain `www.mathletemtb.com`. The workflow only writes `js/supabase-config.js` from repo variables, then uploads the repo as is. |
| Pages / routes | `/` (index.html: tools, focus, about, services, tutoring, stories, photos, contact), `/about.html`, `/college-beyond.html` (+ inquiry form), `/login.html`, `/account.html`, `/tool.html?id=…` (tool player). Homepage sections are anchors: `#tools`, `#services`, `#tutoring`, `#photos`, `#contact`, `#tool-trailbuilder`, etc. |
| Design system | CSS custom properties in `:root` (warm-paper light theme, pine ink, "trail-blaze" rust, chalk blue; Big Shoulders Display / Public Sans / JetBrains Mono / Newsreader). Shared with willmalfeld.com. Has focus styles, reduced-motion, skip link. **No dark theme.** |
| Tool registry | `js/tools-config.js` (`window.MATHLETE_TOOLS`): `id`, `name`, `access` (`public`/`private`), `status`, `url` or `file`. Cards themselves are **hand-written in `index.html`** and must be kept in sync by hand; `check-site.mjs` verifies they match. |
| Access control | Supabase Auth, invite-only (no public sign-up). Private tools are single HTML files in a private Storage bucket, served only when `has_tool_access()` passes (active member row, not banned, live session). Enforced server-side; documented in `docs/ACCESS.md`. Admin CLI: `scripts/admin.mjs`. Live test: `scripts/test-access.mjs`. `members` already has `plan` and `expires_at`. |
| Forms | College & Beyond inquiry → Supabase `inquiries` table (insert-only for visitors), mailto fallback. Homepage contact is mailto/tel only. |
| Analytics | **None.** |
| SEO | Per-page titles, descriptions, canonical, Open Graph on index; `tool.html` is `noindex`. |

### The learning tools

| Tool | Where it lives | Tech | PRD equivalent |
|---|---|---|---|
| Trail Builder | own repo `TrailBuilder_Math`, public Pages | one self-contained HTML file (~80 KB, inline CSS/JS, localStorage) | Trail Builder (Trail Crew) |
| MTB Physics Playground | own repo, live at `wcmalfeld.github.io/mtb-physics/` | React + TS + Vite. Has its own module registry (`src/modules/registry.tsx`), shared lab UI (`labShared.tsx`, `components/ui.tsx`), `TutorDrawer`, and four modules: **jump**, vector, braking, cornering | **Jump Lab** (Engineering Lab). Already has predict-first, guided challenges, hints and Tutor Mode. |
| Gear Ratio Lab | own repo, public Pages | one HTML file (~60 KB) | Gear Ratio Garage (Bike Workshop) |
| Strava Showdown | own repo, public Pages | one HTML file (~52 KB) | Race Analyst (Race Team) |
| Summit Expedition | private bucket (source git-ignored in `private-tools/`) | one HTML file | no category in the PRD (general math) |
| Tool 05/06, Focus 01–03 | placeholders | — | — |

Three of the PRD's "future" applications already exist under other names,
and the Physics Playground's jump module overlaps heavily with Jump Lab.

---

## 3. Gaps between the PRD and the current site

| PRD requirement | Status | Notes |
|---|---|---|
| Nav: Home / Learning Lab / Tutoring / About / Contact | Partial | Current nav is anchor links on one long page. |
| `/learning-lab` dashboard + 4 category pages | Missing | |
| Registry-driven cards with difficulty, subjects, duration, category, featured | Partial | Registry exists but only holds access fields; cards are hand-written. |
| Filters (activity, subject, difficulty, duration) | Missing | |
| Shared tool header / modes / learning components | Missing on the site. The Physics Playground has React versions of several (sliders, tutor drawer, challenge flow). | |
| Preview tools + restricted tools | Present, stronger than asked | PRD asks for shared access codes; site has per-student accounts. See decision D2. |
| Session activity summary | Partial | Physics Playground and Summit Expedition have their own reports; nothing shared. |
| Analytics | Missing | |
| Dark, charcoal visual language | Conflicts | Current identity is light "field notes" shared with willmalfeld.com. See decision D1. |
| Redirects for moved URLs | n/a yet | GitHub Pages has no server redirects; use small redirect pages. |

---

## 4. Decisions before Phase 1

**Decided 2026-10-31:** D1 (a) dark Lab, light site · D2 keep
invite-only accounts, add a `preview` level · D3 move public tools into
this repo under `/learning-lab/<id>/` · D4 (a) promote the Physics
Playground as Jump Lab (still check against the Jump Lab PRD when
available) · D5 vanilla Web Components for the shared kit.

**D1. Visual direction.** The PRD asks for dark charcoal backgrounds; the
current site is a light warm-paper theme deliberately shared with
willmalfeld.com. Options: (a) keep the light identity site-wide and use
the darker palette only inside the Learning Lab and tools ("lab
interior"); (b) move the whole site dark; (c) keep everything light.
*Recommendation: (a).* It gives the Lab a distinct "enter the lab" feel,
keeps the parent-facing pages consistent with the founder's other site,
and tools like Trail Builder already use their own palettes.

**D2. Access model.** The PRD proposes shared access codes. The site
already has invite-only accounts enforced by Supabase row-level security,
which is more secure (revocable per student, no code to leak) and has no
sign-up flow for students to get through. Shared codes on a static
site can't be enforced without a server; on Supabase they would need an
Edge Function that trades a valid code for a session. *Recommendation:*
keep accounts as the "restricted" level; map the PRD's levels onto the
config as `public` (no login), `preview` (public, marked as a preview
in the UI, max 3, enforced by `check-site.mjs`), `private` (member). Add
access codes later only if handing out accounts proves to be friction.

**D3. Where tools are hosted.** Today each public tool is its own
github.io site, so it can't share CSS/JS with the main site without
cross-origin loading, and every URL lives outside the domain.
*Recommendation:* move public tools into this repo at
`/learning-lab/<tool-id>/index.html` (same origin, shared styles, clean
URLs on mathletemtb.com), unchanged at first, then adopt the shared
header incrementally. The old github.io repos each get a one-file
redirect page. Private tools stay in the bucket.

**D4. Jump Lab.** The PRD references a separate Jump Lab PRD, which
wasn't provided. The Physics Playground's jump module already covers
much of it in React. Options: (a) Jump Lab = the Physics Playground's jump
module, promoted to its own entry and built into this site; (b) a new
build following the Jump Lab PRD, using the shared component kit.
*Need the Jump Lab PRD either way.*

**D5. Shared component technology.** The main site is no-build vanilla
JS; the Physics Playground is React. The PRD's 16 shared components can
live in one of two places:
- *Vanilla Web Components* in `js/lab/` (no build, usable by the
  single-file tools and by React). *Recommended* as the cross-tool layer:
  header, mode selector, hint, mission panel, prediction, feedback,
  results summary.
- React components inside the Physics Playground for anything
  simulation-heavy (sliders bound to state, canvases).

---

## 5. Target architecture (fits the current no-build site)

```
/                         index.html            Home (redesigned per PRD §5)
/learning-lab/            learning-lab/index.html   Dashboard, rendered from the registry
/learning-lab/engineering/ … /trail-crew/ /race-team/ /bike-workshop/   Category pages
/learning-lab/trail-builder/   the tool, moved in (D3)
/learning-lab/jump-lab/        built output of the React app (D4)
/learning-lab/race-analyst/    = Strava Showdown (keep the name, alias the route?)
/learning-lab/gear-ratio-garage/ = Gear Ratio Lab
/tutoring/                tutoring/index.html   Pulled out of the homepage #tutoring/#services
/about.html → /about/     keep about.html working (redirect page or keep both)
/contact/                 contact + inquiry
/tool.html?id=…           unchanged: player for private tools
```

- **Registry.** Extend `js/tools-config.js` (keep the file and global so
  `auth.js`, `tool-player.js` and `check-site.mjs` keep working) with the
  PRD fields: `category`, `summary`, `route`, `image`, `difficulty[]`,
  `subjects[]`, `duration`, `featured`, `status`. Add
  `js/lab-categories.js`.
- **Cards stay real HTML, generated.** For SEO (PRD §17) and no-JS
  readability, cards shouldn't be built only in the browser. A small
  generator, `node scripts/build-lab.mjs`, writes card markup from the
  registry into marked regions (`<!-- lab:cards:start -->…`) of the
  dashboard, category and home pages. Generated files are committed, so
  the site still works by double-clicking and needs no deploy build.
  `check-site.mjs` fails if generated regions are stale. Adding a tool =
  registry entry + image + `node scripts/build-lab.mjs` (PRD §16).
- **Filters** run client-side over the generated cards using `data-`
  attributes (`data-subjects`, `data-difficulty`, …); without JS all cards
  show.
- **Shared lab kit.** `css/lab.css` (lab tokens + components) and
  `js/lab/*.js` Web Components (`<mm-tool-header>`, `<mm-mode-select>`,
  `<mm-hint>`, `<mm-mission>`, `<mm-predict>`, `<mm-feedback>`,
  `<mm-results>`). Each tool page loads only what it uses (PRD §17 performance).
- **Session summary.** `js/lab/session.js`: an in-memory/sessionStorage
  log of tool-launched, challenge started/completed, attempts, hints;
  `<mm-results>` shows it for the tutor. Nothing leaves the browser in
  the MVP. A later `progress` table can key on `auth.uid()` behind
  `has_tool_access()` (already sketched in `docs/ACCESS.md`).
- **Redirects.** For each moved URL, a tiny HTML page with
  `<meta http-equiv="refresh">` + `<link rel="canonical">` + JS
  `location.replace` (keeps hash). The homepage keeps `id="tools"` and the
  `#tool-…` ids as stubs linking to the Lab, so existing links still land.

---

## 6. Phased plan

**Phase 0.5: fix (½ day).** Section 1 items. Add an external-link
check to `check-site.mjs`.

**Phase 1: foundation (≈1–1.5 weeks).**
1. Lab design tokens + `css/lab.css` (per D1).
2. Extend registry and categories; write `scripts/build-lab.mjs`; extend `check-site.mjs`.
3. `/learning-lab/` dashboard with filters; four category pages.
4. New nav (Home · Learning Lab · Tutoring · About · Contact) on every page; `/tutoring/`, `/contact/` pages carved out of the homepage.
5. Homepage per PRD §5: hero with "Explore the Learning Lab" / "Explore Tutoring", featured-tools strip from the registry, tutoring intro, about preview, parent CTA. Keep Focus Training, Services, Stories, Photos.
6. Redirect stubs for anything that moved.

**Phase 2: Trail Builder (≈3–5 days).** Copy `TrailBuilder_Math/index.html`
into `/learning-lab/trail-builder/`, unchanged; verify it runs. Wrap with
`<mm-tool-header>` (back to Lab, category, difficulty, help, reset). Map its
existing class picker to the difficulty selector. Explore = free build,
Challenge = work orders (its current flow), Tutor = change orders + reveal
solutions. Mobile pass. Replace the github.io copy with a redirect page.
Its mathematical logic is not rewritten.

**Phase 3: Jump Lab (scope depends on D4 and the Jump Lab PRD).** Fix
the Physics Playground build, set Vite `base: '/learning-lab/jump-lab/'`,
build output into this repo (or a CI step that pulls it in). Adopt
the shared header/modes/hint components.

**Phase 4: access + insights (≈3–5 days).** `preview` access level,
Mathlete-branded access screen on restricted tool routes (reuses
`tool-player.js` logic), session summaries via `js/lab/session.js`.

**Phase 5: expansion.** Gear Ratio Lab, Strava Showdown into the
same pattern; new tools per PRD.

---

## 7. Analytics (PRD §18)

Use a cookieless, privacy-first service (e.g. Plausible, GoatCounter or
Cloudflare Web Analytics): no cookie banner, no personal data, suits an
audience of minors. Page views cover most website events; custom events
for `tool_card_select`, `tool_launch`, `mode_select`,
`challenge_complete`, `hint_request`, `contact_cta`,
`inquiry_submit`. No user IDs, no free-text answers sent. Decide which
service before Phase 1 so events are wired in as pages are built.

## 8. Risks

- **Single-file tools in a different origin:** moving them changes their
  localStorage origin, so students lose saved progress (trail networks,
  ranks) once. Mitigate with an export/import or accept and announce.
- **Private tools load in a `srcdoc` iframe**, so relative URLs don't
  resolve; the shared kit must be referenced by absolute URL from them.
- **Hand-edited HTML + generator:** generated regions must be clearly
  marked so manual edits aren't overwritten; `check-site.mjs` guards it.
- **Scope:** the PRD's Phase 1–4 is several weeks of work; shipping
  per phase keeps the live site working throughout.

## 9. Testing additions

- `check-site.mjs`: every live public tool URL / route responds 200;
  generated regions are fresh; ≤3 `preview` tools; every registry entry
  has the PRD's required fields; every redirect stub points at a real page.
- Keep `test-access.mjs` for the access layer.
