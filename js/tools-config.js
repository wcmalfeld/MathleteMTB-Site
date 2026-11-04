/* ============================================================
   LEARNING TOOLS: WHO CAN USE WHAT, AND HOW THEY'RE LISTED
   This is the one place that decides whether each tool is public
   or private. See docs/ACCESS.md for the full picture.

   access: 'public'  - anyone can use it, no login. Give it a `url`
                       where it is hosted publicly.
           'private' - members only. Its single-file HTML lives in the
                       private Supabase Storage bucket at `file`, and is
                       only ever served to a signed-in, active member.
                       Never host a private tool anywhere public.

   status: 'live' or 'coming-soon' (a placeholder card, nothing to open).

   The cards on the home page (index.html) and the category pages are
   generated from this list by scripts/build-lab.mjs. A tool's full
   description lives in content/tool-details/<id>.html.

   To change which tools are public, change `access` here. The number of
   public tools must match MATHLETE_PUBLIC_TOOL_COUNT at the bottom (now 6);
   the site warns in the browser console otherwise. Making a tool public also means
   hosting it publicly (`url`); making one private means taking its
   public copy down and uploading it with `node scripts/admin.mjs upload`.

   LEARNING LAB LISTING (live tools only; placeholders are skipped):
   category:   an id from js/lab-categories.js, or null for "all tools" only
   summary:    one sentence for the card
   image:      preview image, relative to the site root
   difficulty: any of 'beginner', 'intermediate', 'advanced'
   subjects:   any of 'algebra', 'geometry', 'trigonometry',
               'statistics', 'calculus', 'physics'
   duration:   'quick' (under 10 min), 'challenge' (10-30 min) or
               'extended' (30 min or more)
   minutes:    the time shown on the card, e.g. '20-40 min'
   featured:   true to show it first

   After changing anything here, run `node scripts/build-lab.mjs` to
   rebuild the Learning Lab pages, then `node scripts/check-site.mjs`.
   ============================================================ */
window.MATHLETE_TOOLS = [
  {
    id: 'trail-builder',
    name: 'Trail Builder',
    access: 'public',
    status: 'live',
    url: 'https://wcmalfeld.github.io/TrailBuilder_Math/',
    category: 'trail-crew',
    summary: 'Design a mountain bike trail for a client, solving a math problem for every segment you build.',
    image: 'assets/trailbuilder.jpg',
    difficulty: ['intermediate', 'advanced'],
    subjects: ['algebra', 'geometry', 'trigonometry', 'statistics', 'calculus'],
    duration: 'extended',
    minutes: '30-45 min',
    featured: true
  },
  {
    id: 'physics-playground',
    name: 'MTB Physics Playground',
    access: 'public',
    status: 'live',
    url: 'https://wcmalfeld.github.io/mtb-physics/',
    category: 'engineering',
    summary: 'Launch a rider off a jump, predict the landing, then see the projectile-motion math that explains it.',
    image: 'assets/physics-playground.jpg',
    difficulty: ['beginner', 'intermediate', 'advanced'],
    subjects: ['algebra', 'trigonometry', 'physics'],
    duration: 'challenge',
    minutes: '10-20 min',
    featured: true
  },
  {
    id: 'gear-ratio-lab',
    name: 'Gear Ratio Lab',
    access: 'public',
    status: 'live',
    url: 'https://wcmalfeld.github.io/GearRatioLab_LearningTool/',
    category: 'bike-workshop',
    summary: 'Gear a race bike for a course, then work out ratios, speeds and times to beat a rival.',
    image: 'assets/gear-ratio-lab.jpg',
    difficulty: ['intermediate', 'advanced'],
    subjects: ['algebra', 'geometry', 'statistics', 'calculus'],
    duration: 'extended',
    minutes: '30-45 min',
    featured: true
  },
  {
    id: 'strava-showdown',
    name: 'Strava Showdown',
    access: 'public',
    status: 'live',
    url: 'https://wcmalfeld.github.io/StravaShowdown_LearningTool/',
    category: 'race-team',
    summary: 'Be the team’s race analyst: crunch ride data, graph the field and decide who gets picked to race.',
    image: 'assets/strava-showdown.jpg',
    difficulty: ['intermediate', 'advanced'],
    subjects: ['algebra', 'statistics', 'calculus'],
    duration: 'challenge',
    minutes: '20-30 min',
    featured: true
  },
  {
    id: 'jump-lab',
    name: 'Jump Lab',
    access: 'public',
    status: 'live',
    url: 'https://wcmalfeld.github.io/JumpLab_MTB/JumpLab_MTB/dist/jump-lab.html',
    category: 'engineering',
    summary: 'Set the speed, angle and heights of a jump, predict where the rider lands, then send it and check the projectile-motion math.',
    image: 'assets/jump-lab.jpg',
    difficulty: ['beginner', 'intermediate', 'advanced'],
    subjects: ['algebra', 'trigonometry', 'physics'],
    duration: 'challenge',
    minutes: '15-30 min',
    featured: true
  },
  {
    id: 'tool-05',
    name: 'Tool 05',
    access: 'public',
    status: 'coming-soon'
  },
  {
    id: 'summit-expedition',
    name: 'Summit Expedition',
    access: 'private',
    status: 'live',
    file: 'summit-expedition/index.html',
    category: null,
    summary: 'A math race up Mt. Axiom: pick how hard a problem to take on, and harder problems climb faster.',
    image: 'assets/summit-expedition.jpg',
    difficulty: ['intermediate', 'advanced'],
    subjects: ['algebra', 'geometry', 'trigonometry', 'calculus'],
    duration: 'extended',
    minutes: '30-60 min',
    featured: false
  }
];

window.MATHLETE_PUBLIC_TOOL_COUNT = 6;
