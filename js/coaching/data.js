// Loads the coaching library for the pages.
//
//   Live site:  coach_catalog() in Supabase, which only returns PUBLISHED
//               content (supabase/coaching.sql). Cached for 5 minutes per tab.
//   Preview:    CMS editors can add ?preview=1 to any coaching page to see
//               drafts; the database decides whether they're allowed to.
//   Local:      on localhost (python3 -m http.server) without Supabase, the
//               pages show content/coaching/seed.json, clearly marked as drafts.
//
// The returned { catalog, source } tells the page what it's showing:
// 'live' | 'preview' | 'seed' | 'unavailable' | 'not-configured'.

const TTL = 5 * 60 * 1000;
const CACHE = 'mathlete-coaching-catalog';

export function isLocal() {
  return location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
}

export function wantsPreview() {
  try {
    const q = new URLSearchParams(location.search).get('preview');
    if (q === '1') sessionStorage.setItem('coach-preview', '1');
    if (q === '0') sessionStorage.removeItem('coach-preview');
    return sessionStorage.getItem('coach-preview') === '1';
  } catch (e) {
    return false;
  }
}

function cached() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE) || 'null');
    if (c && Date.now() - c.at < TTL) return c.catalog;
  } catch (e) {}
  return null;
}

function remember(catalog) {
  try { sessionStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), catalog })); } catch (e) {}
}

async function fromSeed() {
  const res = await fetch('content/coaching/seed.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('seed ' + res.status);
  const seed = await res.json();
  for (const k of ['skills', 'lessons', 'drills', 'mistakes', 'media', 'pathways']) {
    for (const item of seed[k] || []) item._status = 'draft';
  }
  seed.preview = true;
  return seed;
}

export async function loadCatalog() {
  const auth = window.MathleteAuth;
  const preview = wantsPreview();

  if (auth && auth.configured) {
    if (!preview) {
      const c = cached();
      if (c) return { catalog: c, source: 'live' };
    }
    try {
      const sb = await auth.client();
      const { data, error } = await sb.rpc('coach_catalog', { p_preview: preview && auth.hasStoredSession() });
      if (!error && data) {
        if (!data.preview) remember(data);
        return { catalog: data, source: data.preview ? 'preview' : 'live' };
      }
    } catch (e) {}
    if (!isLocal()) return { catalog: null, source: 'unavailable' };
  }

  if (isLocal()) {
    try { return { catalog: await fromSeed(), source: 'seed' }; } catch (e) {}
  }
  return { catalog: null, source: auth && auth.configured ? 'unavailable' : 'not-configured' };
}

export function clearCatalogCache() {
  try { sessionStorage.removeItem(CACHE); } catch (e) {}
}
