# Mathlete MTB

The website for Mathlete MTB math and physics tutoring.

## What's in this folder

```
MathleteMTB-Site/
├── index.html            # Home page = The Mathlete Lab (labs, tools, focus), Private Tutoring at the bottom
├── tutoring.html         # Private Tutoring page
├── book.html             # Book a Session (Calendly; see docs/BOOKING.md)
├── about.html            # About: Will, tutoring & mentoring, student stories, photos
├── college-beyond.html   # College & Beyond Mentorship service page + inquiry form
├── login.html            # Member login (invite-only)
├── account.html          # Set / reset a member's password
├── tool.html             # Opens members-only tools (tool.html?id=...)
├── learning-lab/         # Lab category pages (GENERATED, don't edit); learning-lab/ itself redirects home
├── content/tool-details/ # Each tool's full description, shown in its "Details" pop-up
├── css/site.css          # All styling
├── css/lab.css           # Learning Lab's dark theme and components
├── js/
│   ├── tools-config.js   # THE TOOL REGISTRY: access + Learning Lab listing (edit here)
│   ├── lab-categories.js # Learning Lab categories (edit here)
│   ├── lab.js            # Learning Lab filters
│   ├── auth.js           # Member sign-in (Supabase)
│   ├── site.js           # Photo viewer, tool pop-ups, nav
│   ├── inquiry.js        # College & Beyond inquiry form (sends to Supabase)
│   ├── booking-config.js # TUTORING BOOKINGS: Calendly link, subjects, prices (edit here)
│   ├── booking.js        # Booking page: subject choice + Calendly scheduler
│   ├── track.js          # Analytics events (data-track); no analytics service yet
│   └── ...               # login.js, account.js, tool-player.js
├── assets/               # Logo, photos, screenshots
├── supabase/setup.sql    # Database + storage rules (member access, inquiries)
├── scripts/              # build-lab.mjs, admin.mjs (members, inquiries), check-site.mjs, test-access.mjs
├── docs/ACCESS.md        # How member access works and how to manage it
├── docs/BOOKING.md       # Setting up Calendly, Stripe and Zoom for bookings
└── docs/LEARNING-LAB-PLAN.md  # Audit + plan for the Learning Lab rebuild
```

**The Mathlete Lab** is the home page. Its lab tiles and tool grid (between
the `<!-- BUILD:... -->` markers in `index.html`) and the category pages in
`learning-lab/` are built from `js/tools-config.js`, `js/lab-categories.js`
and `content/tool-details/`. Everything else in `index.html` is hand-edited.
After changing any of those, run:

```bash
node scripts/build-lab.mjs     # rewrites the tool grid in index.html and the pages in learning-lab/
node scripts/check-site.mjs    # add --online to also check the tool links work
```

To add a tool: add its entry (with the Learning Lab fields described at the
top of `js/tools-config.js`), a preview image in `assets/` and its description
in `content/tool-details/<tool-id>.html` (copy an existing one), then run both
commands. It appears on the home page and its category page automatically.

There's no build step and nothing to install for the website itself.

**Member access** (three public learning tools, the rest invite-only) is
documented in [docs/ACCESS.md](docs/ACCESS.md): setup, inviting and revoking
members, adding private tools, and testing.

**College & Beyond inquiries** go into the Supabase table `inquiries`
(section 4 of `supabase/setup.sql`; visitors can add a row but never read
one). Read them in the Supabase dashboard (Table Editor → inquiries) or with:

```bash
node scripts/admin.mjs inquiries        # open inquiries
node scripts/admin.mjs inquiries all    # including handled ones
node scripts/admin.mjs handled <id>     # mark one done
```

If the form can't send (for example, Supabase isn't configured), visitors
are offered an email to wcmalfeld@gmail.com with their answers filled in.
Supabase doesn't email you about new rows by default; to get alerts, add a
Database Webhook on `inquiries` (Database → Webhooks) pointing at an email
or automation service you use.

## Editing the content

Open `index.html` in any text editor (VS Code, Notepad, TextEdit, etc.).
All the text — About Me, Experience, testimonials, contact info — is in
plain English inside that file, with comments marking each section.
Photo and text placeholders are marked clearly so you know what to swap out.

## Viewing it locally

Double-click `index.html` to look at the homepage. The Learning Lab pages
use clean folder addresses (`learning-lab/`), so to click through the whole
site run a small local server from this folder and open http://localhost:8000:

```bash
python3 -m http.server 8000
```

## Hosting it for free on GitHub Pages

1. **Create a GitHub account** at [github.com](https://github.com) if you don't have one.
2. **Create a new repository** — click the "+" in the top right → "New repository."
   Name it something like `mathlete-mtb` and make it Public.
3. **Upload these files** — on the new repo's page, click "Add file" →
   "Upload files," then drag in `index.html`, the `assets` folder, and this
   README.
4. **Turn on GitHub Pages**:
   - Go to the repo's **Settings** tab
   - Click **Pages** in the left sidebar
   - Under "Build and deployment," set **Source** to "Deploy from a branch"
   - Set **Branch** to `main` and folder to `/ (root)`, then **Save**
5. Wait a minute or two, then refresh that Pages settings page — it'll show
   a live URL like:
   ```
   https://yourusername.github.io/mathlete-mtb/
   ```
   That's your live site.

## Running it locally with Git (optional)

If you'd rather work from your computer and push updates with Git:

```bash
git clone https://github.com/yourusername/mathlete-mtb.git
cd mathlete-mtb
# edit index.html, then:
git add .
git commit -m "Update site content"
git push
```

GitHub Pages will automatically redeploy your site a minute or two after
each push to `main`.

## Making future edits

Every time you want to change something on the live site:
1. Edit `index.html` (and/or swap files in `assets/`)
2. Upload the changed files to GitHub (via the web UI, or `git push` if
   using the command line)
3. GitHub Pages updates automatically within a minute or two
