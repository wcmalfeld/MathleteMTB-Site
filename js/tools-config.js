/* ============================================================
   LEARNING TOOLS: WHO CAN USE WHAT
   This is the one place that decides whether each tool is public
   or private. See docs/ACCESS.md for the full picture.

   access: 'public'  - anyone can use it, no login. Give it a `url`
                       where it is hosted publicly.
           'private' - members only. Its single-file HTML lives in the
                       private Supabase Storage bucket at `file`, and is
                       only ever served to a signed-in, active member.
                       Never host a private tool anywhere public.

   status: 'live' or 'coming-soon' (a placeholder card, nothing to open).

   `id` must match the card's data-tool="..." attribute in index.html.

   To change which tools are public, change `access` here. The number of
   public tools must match MATHLETE_PUBLIC_TOOL_COUNT at the bottom (now 6);
   the site warns in the browser console otherwise. Making a tool public also means
   hosting it publicly (`url`); making one private means taking its
   public copy down and uploading it with `node scripts/admin.mjs upload`.
   ============================================================ */
window.MATHLETE_TOOLS = [
  {
    id: 'trail-builder',
    name: 'Trail Builder',
    access: 'public',
    status: 'live',
    url: 'https://wcmalfeld.github.io/TrailBuilder-Math/'
  },
  {
    id: 'physics-playground',
    name: 'MTB Physics Playground',
    access: 'public',
    status: 'live',
    url: 'https://wcmalfeld.github.io/MTB_PhysicsPlayground/'
  },
  {
    id: 'gear-ratio-lab',
    name: 'Gear Ratio Lab',
    access: 'public',
    status: 'live',
    url: 'https://wcmalfeld.github.io/GearRatioLab_LearningTool/'
  },
  {
    id: 'strava-showdown',
    name: 'Strava Showdown',
    access: 'public',
    status: 'live',
    url: 'https://wcmalfeld.github.io/StravaShowdown_LearningTool/'
  },
  {
    id: 'tool-04',
    name: 'Tool 04',
    access: 'public',
    status: 'coming-soon'
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
    file: 'summit-expedition/index.html'
  }
];

window.MATHLETE_PUBLIC_TOOL_COUNT = 6;
