/* Supabase connection for the browser.
   The real file, js/supabase-config.js, is NOT committed. On deploy it is
   written by .github/workflows/static.yml from the repository variables
   SUPABASE_URL and SUPABASE_ANON_KEY. For local testing, copy this file
   to js/supabase-config.js and fill in your project's values.

   Only the project URL and the anon (public) key belong here. The anon key
   is designed to be public: every protected resource is guarded by
   row-level security in the database. NEVER put the service_role key in
   this file or anywhere in the website. */
window.MATHLETE_SUPABASE = {
  url: '',      // e.g. https://abcdefghijklmnop.supabase.co
  anonKey: ''   // Project Settings -> API -> anon public
};
