// @ts-nocheck
// Supabase Edge Function: invite
// Creates an organization invitation AS THE PERSON ASKING (their sign-in is
// passed through, so supabase/organizations.sql checks they may invite, and
// that a student seat is free), then emails the link with Resend.
// If email isn't set up (no RESEND_API_KEY), it returns the link for the
// admin to copy and send themselves.
//
// Deploy: Supabase dashboard -> Edge Functions -> Deploy a new function ->
// name "invite" -> paste this whole file. Secrets (Edge Functions ->
// Secrets): SITE_URL (https://www.mathletemtb.com), RESEND_API_KEY,
// INVITE_FROM (e.g. Mathlete <invites@mathletemtb.com>). SUPABASE_URL and
// SUPABASE_ANON_KEY are provided by Supabase automatically.
// The raw invitation token is never stored or logged: only its hash is
// kept in the database.

const ROLE_WORDS = { owner: 'an owner', admin: 'an administrator', instructor: 'an instructor', student: 'a student' };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

export function emailFor({ organization, role, firstName, link, expires }) {
  const hi = firstName ? `Hi ${esc(firstName)},` : 'Hi,';
  const when = new Date(expires).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const subject = `You're invited to ${organization} on Mathlete`;
  const text = `${hi.replace(/&[^;]+;/g, '')}\n\n${organization} has invited you to join Mathlete as ${ROLE_WORDS[role] || role}.\n\nAccept your invitation: ${link}\n\nThe link works once and expires on ${when}. If you weren't expecting this, you can ignore it.\n\nMathlete MTB`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1F2B24;max-width:520px">
<p>${hi}</p>
<p><b>${esc(organization)}</b> has invited you to join Mathlete as ${esc(ROLE_WORDS[role] || role)}.</p>
<p><a href="${esc(link)}" style="display:inline-block;background:#1F2B24;color:#F3F0E7;padding:12px 20px;text-decoration:none;font-weight:bold">Accept your invitation</a></p>
<p style="font-size:14px;color:#48584B">The link works once and expires on ${esc(when)}. If you weren't expecting this, you can ignore it.</p>
<p style="font-size:14px;color:#48584B">Mathlete MTB</p></div>`;
  return { subject, text, html };
}

export async function handle(req, env, f = fetch) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req, env) });
  if (req.method !== 'POST') return json(req, env, 405, { error: 'Use POST.' });
  const auth = req.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S+/.test(auth)) return json(req, env, 401, { error: 'Sign in first.' });
  let body;
  try { body = await req.json(); } catch { return json(req, env, 400, { error: 'Send JSON.' }); }
  const { organization_id, email, role, first_name = null, last_name = null, send_email = true } = body || {};
  if (!organization_id || !email || !role) return json(req, env, 400, { error: 'organization_id, email and role are required.' });

  const rest = `${env.SUPABASE_URL}/rest/v1/rpc`;
  // 1. Create the invitation as the caller: the database decides if they may.
  const r = await f(`${rest}/create_invitation`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_org: organization_id, p_email: email, p_role: role, p_first: first_name, p_last: last_name })
  });
  const created = await r.json().catch(() => ({}));
  if (!r.ok) return json(req, env, r.status, { error: created.message || 'Couldn’t create the invitation.', code: created.code });

  const site = (env.SITE_URL || 'https://www.mathletemtb.com').replace(/\/+$/, '');
  const link = `${site}/join.html#t=${created.token}`;

  // 2. The organization's name for the email (the preview needs only the token).
  const p = await f(`${rest}/invitation_preview`, {
    method: 'POST', headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_token: created.token })
  });
  const preview = await p.json().catch(() => ({}));

  // 3. Send it, if email is set up.
  let emailed = false, emailError = null;
  if (env.RESEND_API_KEY && send_email !== false) {
    const m = emailFor({ organization: preview.organization || 'Your school', role, firstName: first_name, link, expires: created.expires_at });
    const s = await f('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.INVITE_FROM || 'Mathlete <invites@mathletemtb.com>', to: [String(email).trim()], subject: m.subject, html: m.html, text: m.text })
    });
    emailed = s.ok;
    if (!s.ok) emailError = `Email service answered ${s.status}`;
  }
  // The link goes back only when it wasn't emailed, so the admin can send it.
  return json(req, env, 200, { id: created.id, resent: created.resent, expires_at: created.expires_at, emailed, link: emailed ? null : link, email_error: emailError });
}

if (typeof Deno !== 'undefined') Deno.serve(req => handle(req, Deno.env.toObject()));
