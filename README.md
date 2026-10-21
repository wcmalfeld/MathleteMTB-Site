# Mathlete MTB

The website for Mathlete MTB math and physics tutoring.

## What's in this folder

```
MathleteMTB-Site/
├── index.html            # Homepage (learning tools, services, tutoring, photos, contact)
├── about.html            # About page
├── login.html            # Member login (invite-only)
├── account.html          # Set / reset a member's password
├── tool.html             # Opens members-only tools (tool.html?id=...)
├── css/site.css          # All styling
├── js/
│   ├── tools-config.js   # WHICH TOOLS ARE PUBLIC OR MEMBERS-ONLY (edit here)
│   ├── auth.js           # Member sign-in (Supabase)
│   ├── site.js           # Photo viewer, tool pop-ups, nav
│   └── ...               # login.js, account.js, tool-player.js
├── assets/               # Logo, photos, screenshots
├── supabase/setup.sql    # Database + storage rules for member access
├── scripts/              # admin.mjs (manage members), check-site.mjs, test-access.mjs
└── docs/ACCESS.md        # How member access works and how to manage it
```

There's no build step and nothing to install for the website itself.

**Member access** (three public learning tools, the rest invite-only) is
documented in [docs/ACCESS.md](docs/ACCESS.md): setup, inviting and revoking
members, adding private tools, and testing.

## Editing the content

Open `index.html` in any text editor (VS Code, Notepad, TextEdit, etc.).
All the text — About Me, Experience, testimonials, contact info — is in
plain English inside that file, with comments marking each section.
Photo and text placeholders are marked clearly so you know what to swap out.

## Viewing it locally

Just double-click `index.html` and it'll open in your browser. That's it —
no server needed to look at it.

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
