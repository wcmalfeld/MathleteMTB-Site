// @ts-nocheck
// Supabase Edge Function: join
// For someone invited to an organization who doesn't have a Mathlete account
// yet: creates the account for the invited email address with the password
// they choose, and accepts the invitation in the same step. Holding the
// emailed link is the proof they own that address, so the account is
// created already confirmed. If accepting fails, the new account is removed
// again, so nothing half-made is left behind.
//
// Deploy: Supabase dashboard -> Edge Functions -> Deploy a new function ->
// name "join" -> paste this whole file. Turn OFF "Verify JWT" for this
// function (invitees aren't signed in yet). Secret: SITE_URL. SUPABASE_URL
// and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.

function cors(req, env) {
  const origin = req.headers.get('Origin') || '';
  const site = (env.SITE_URL || 'https://www.mathletemtb.com').replace(/\/+$/, '');
  const allowed = [site, site.replace('://www.', '://'), 'http://localhost:8000', 'http://127.0.0.1:8000'];
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : site,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}
const json = (req, env, status, body) => new Response(JSON.stringify(body), { status, headers: { ...cors(req, env), 'Content-Type': 'application/json' } });

export async function handle(req, env, f = fetch) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req, env) });
  if (req.method !== 'POST') return json(req, env, 405, { error: 'Use POST.' });
  let body;
  try { body = await req.json(); } catch { return json(req, env, 400, { error: 'Send JSON.' }); }
  const token = String(body?.token || ''), password = String(body?.password || ''), firstName = String(body?.first_name || '').trim().slice(0, 60);
  if (!/^[0-9a-f]{64}$/.test(token)) return json(req, env, 400, { error: 'That invitation link isn’t valid.' });
  if (password.length < 8 || password.length > 72) return json(req, env, 400, { error: 'Choose a password of 8 to 72 characters.' });

  const svc = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' };
  const rpc = (fn, args) => f(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers: svc, body: JSON.stringify(args) });

  // 1. Is the invitation usable, and is this really a new person?
  const pr = await rpc('invitation_preview', { p_token: token });
  const inv = await pr.json().catch(() => ({}));
  if (!pr.ok || inv.status === 'not_found') return json(req, env, 404, { error: 'That invitation link isn’t valid.' });
  if (inv.status !== 'pending') return json(req, env, 410, { error: inv.status === 'expired' ? 'This invitation has expired. Ask for a new one.' : 'This invitation has already been used or was withdrawn.' });
  if (inv.account_exists) return json(req, env, 409, { error: 'You already have a Mathlete account. Sign in to accept.', code: 'account_exists' });

  // 2. Create the account for the invited address.
  const cu = await f(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST', headers: svc,
    body: JSON.stringify({ email: inv.email, password, email_confirm: true, user_metadata: { first_name: firstName || inv.first_name || null } })
  });
  const user = await cu.json().catch(() => ({}));
  if (!cu.ok || !user.id) {
    if (cu.status === 422 || /registered|exists/i.test(JSON.stringify(user))) return json(req, env, 409, { error: 'You already have a Mathlete account. Sign in to accept.', code: 'account_exists' });
    return json(req, env, 502, { error: /password/i.test(JSON.stringify(user)) ? 'That password isn’t allowed. Try a longer one.' : 'Couldn’t create your account just now. Try again in a moment.' });
  }

  // 3. Accept for the new account; undo the account if that fails.
  const ac = await rpc('accept_invitation_new_user', { p_token: token, p_user: user.id });
  const accepted = await ac.json().catch(() => ({}));
  if (!ac.ok) {
    await f(`${env.SUPABASE_URL}/auth/v1/admin/users/${user.id}`, { method: 'DELETE', headers: svc }).catch(() => {});
    return json(req, env, ac.status === 403 ? 403 : 422, { error: accepted.message || 'Couldn’t accept the invitation.' });
  }
  // The name they typed wins over the one the school entered.
  if (firstName) {
    await f(`${env.SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user.id}`, { method: 'PATCH', headers: { ...svc, Prefer: 'return=minimal' }, body: JSON.stringify({ display_name: firstName }) }).catch(() => {});
  }
  return json(req, env, 200, { ok: true, email: inv.email, organization: accepted.organization, role: accepted.role });
}

if (typeof Deno !== 'undefined') Deno.serve(req => handle(req, Deno.env.toObject()));
