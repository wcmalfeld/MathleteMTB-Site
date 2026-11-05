// Coaching Lab CMS (coaching/admin/). Everything here only shapes the
// screen: who may save, approve or publish is decided by the database
// functions in supabase/coaching.sql, so changing this file in a browser
// can't get around the review rules.
import { TYPES, FIELDS, blank, blankItem, toPayload } from './cms-schema.js';
import { indexCatalog, wouldCreateCycle, learningOrder, STATUS, SAFETY } from './core.js';
import { clearCatalogCache } from './data.js';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const root = document.getElementById('cms-root');
const A = window.MathleteAuth;

// ---------------------------------------------------------------- data
const api = {
  sb: null,
  async rpc(fn, args) {
    const { data, error } = await api.sb.rpc(fn, args || {});
    if (error) throw new Error(error.message || 'Something went wrong');
    return data;
  },
  list: () => api.rpc('coach_admin_list'),
  get: (t, id) => api.rpc('coach_admin_get', { p_type: t, p_id: id }),
  save: (t, p) => api.rpc('coach_save', { p_type: t, p_payload: p }),
  move: (t, id, to, note) => api.rpc('coach_transition', { p_type: t, p_id: id, p_to: to, p_note: note || '' }),
  rollback: (t, id, v, note) => api.rpc('coach_rollback', { p_type: t, p_id: id, p_version: v, p_note: note || '' }),
  remove: (t, id) => api.rpc('coach_delete', { p_type: t, p_id: id }),
  catalog: () => api.rpc('coach_catalog', { p_preview: true }),
  async upload(file) {
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(-60);
    const path = `${new Date().toISOString().slice(0, 10)}/${Date.now().toString(36)}-${safe}`;
    const bucket = api.sb.storage.from('coaching-media');
    const { error } = await bucket.upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    return bucket.getPublicUrl(path).data.publicUrl;
  }
};

const S = { me: null, items: [], log: [], catalog: null, idx: null, editor: null };

async function refresh() {
  const [list, catalog] = await Promise.all([api.list(), api.catalog()]);
  S.me = list.me; S.items = list.items; S.log = list.log;
  S.catalog = catalog; S.idx = indexCatalog(catalog);
  clearCatalogCache();
}

const role = () => (S.me && S.me.role) || null;
const isAdmin = () => role() === 'admin';
const canReview = () => role() === 'reviewer' || role() === 'admin';
const itemsOf = t => S.items.filter(i => i.type === t);
const findItem = (t, id) => S.items.find(i => i.type === t && i.id === id);

// ---------------------------------------------------------------- shell
function toast(msg, kind = 'ok') {
  let el = document.getElementById('cms-toast');
  if (!el) { el = document.createElement('div'); el.id = 'cms-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.className = 'cms-toast cms-toast--' + kind;
  el.textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'cms-toast'; }, kind === 'error' ? 9000 : 3500);
}

function statusPill(s) {
  return `<span class="st st--${esc(s)}">${esc(STATUS[s] || (s === 'reference' ? 'Reference' : s))}</span>`;
}

function frame(active, body) {
  const nav = [['dashboard', 'Dashboard', '#/'], ...['skill', 'lesson', 'drill', 'mistake', 'media', 'pathway'].map(t => [t, TYPES[t].plural, '#/list/' + t]),
    ['map', 'Progression map', '#/map'], ...['discipline', 'competency', 'person'].map(t => [t, TYPES[t].plural, '#/list/' + t])];
  return `<div class="cms">
    <header class="cms-bar"><div class="wrap cms-bar-inner">
      <p class="cms-brand">Coaching CMS</p>
      <p class="cms-me">${esc(S.me.email)} · <strong>${esc(S.me.role)}</strong>${S.me.specialist ? ' · specialist reviewer' : ''}</p>
      <a class="read-link" href="coaching/?preview=1" target="_blank" rel="noopener">Preview the Lab</a>
    </div></header>
    <div class="wrap cms-layout">
      <nav class="cms-nav" aria-label="CMS"><ul>${nav.map(([k, l, h]) => `<li><a href="${h}"${k === active ? ' aria-current="page"' : ''}>${esc(l)}</a></li>`).join('')}</ul></nav>
      <div class="cms-main">${body}</div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- dashboard
function dashboard() {
  const reviewed = S.items.filter(i => TYPES[i.type].reviewed);
  const count = (t, st) => itemsOf(t).filter(i => !st || i.status === st).length;
  const live = t => itemsOf(t).filter(i => i.published_version != null && i.status !== 'archived').length;
  const row = i => `<li><a href="#/edit/${i.type}/${encodeURIComponent(i.id)}">${esc(i.title)}</a> <span class="meta">${esc(TYPES[i.type].label)}</span> ${statusPill(i.status)}${i.needs_specialist ? ' <span class="st st--spec">Specialist</span>' : ''}</li>`;
  const submitted = reviewed.filter(i => i.status === 'submitted');
  const approved = reviewed.filter(i => i.status === 'approved');
  const mine = reviewed.filter(i => i.created_by && i.status === 'draft');
  const recent = [...S.items].sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at))).slice(0, 10);
  const ACTION = { create: 'created', edit: 'edited', status: 'moved', rollback: 'rolled back', delete: 'deleted', seed: 'loaded seed content' };
  return frame('dashboard', `
    <h1 class="cms-title">Dashboard</h1>
    <ul class="cms-stats">
      ${['skill', 'lesson', 'drill', 'pathway'].map(t => `<li><a href="#/list/${t}"><span class="cms-stat-n">${count(t)}</span><span>${esc(TYPES[t].plural)}</span><span class="meta">${live(t)} live</span></a></li>`).join('')}
      <li><a href="#/list/skill?status=draft"><span class="cms-stat-n">${reviewed.filter(i => i.status === 'draft').length}</span><span>Drafts</span><span class="meta">all types</span></a></li>
      <li><span class="cms-stat-n">${submitted.length}</span><span>Awaiting review</span></li>
    </ul>
    <div class="cms-cols">
      <section class="cms-card"><h2>Awaiting review</h2>${submitted.length ? `<ul class="cms-list">${submitted.map(row).join('')}</ul>` : '<p class="meta">Nothing waiting.</p>'}</section>
      ${isAdmin() ? `<section class="cms-card"><h2>Approved, ready to publish</h2>${approved.length ? `<ul class="cms-list">${approved.map(row).join('')}</ul>` : '<p class="meta">Nothing waiting.</p>'}</section>` : ''}
      ${mine.length ? `<section class="cms-card"><h2>Your drafts</h2><ul class="cms-list">${mine.slice(0, 12).map(row).join('')}</ul></section>` : ''}
      <section class="cms-card"><h2>Recently updated</h2><ul class="cms-list">${recent.map(row).join('')}</ul></section>
      <section class="cms-card cms-card--wide"><h2>Contributor activity</h2>${S.log.length ? `<ol class="cms-log">${S.log.slice(0, 20).map(l => `<li><span class="meta">${esc(new Date(l.at).toLocaleString())}</span> ${esc(l.by || 'System')} ${esc(ACTION[l.action] || l.action)} ${l.type !== 'seed' ? `<a href="#/edit/${esc(l.type)}/${encodeURIComponent(l.id)}">${esc(l.type)} ${esc(l.id)}</a>` : ''}${l.action === 'status' ? ` ${esc(STATUS[l.from] || l.from)} &rarr; ${esc(STATUS[l.to] || l.to)}` : ''}${l.version ? ` <span class="meta">v${l.version}</span>` : ''}${l.note ? ` &ldquo;${esc(l.note)}&rdquo;` : ''}</li>`).join('')}</ol>` : '<p class="meta">No activity yet.</p>'}</section>
    </div>`);
}

// ---------------------------------------------------------------- lists
function listView(type, params) {
  const T = TYPES[type];
  const st = params.get('status') || '';
  const text = (params.get('q') || '').toLowerCase();
  const rows = itemsOf(type).filter(i => (!st || i.status === st) && (!text || (i.title + ' ' + i.id).toLowerCase().includes(text)));
  const canCreate = T.admin ? isAdmin() : true;
  return frame(type, `
    <div class="cms-head"><h1 class="cms-title">${esc(T.plural)}</h1>${canCreate ? `<a class="button" href="#/new/${type}">New ${esc(T.label.toLowerCase())}</a>` : ''}</div>
    <form class="cms-filter" data-filter="${type}">
      <label>Search <input name="q" type="search" value="${esc(params.get('q') || '')}"></label>
      ${T.reviewed ? `<label>Status <select name="status"><option value="">All</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === st ? ' selected' : ''}>${v}</option>`).join('')}</select></label>` : ''}
      <button class="button button--small" type="submit">Filter</button>
    </form>
    <div class="cms-table-wrap"><table class="cms-table">
      <thead><tr><th scope="col">Title</th><th scope="col">ID</th>${T.reviewed ? '<th scope="col">Status</th><th scope="col">Version</th>' : ''}<th scope="col">Updated</th></tr></thead>
      <tbody>${rows.map(i => `<tr>
        <td><a href="#/edit/${type}/${encodeURIComponent(i.id)}">${esc(i.title)}</a>${i.needs_specialist ? ' <span class="st st--spec">Specialist</span>' : ''}</td>
        <td><code>${esc(i.id)}</code></td>
        ${T.reviewed ? `<td>${statusPill(i.status)}</td><td>v${i.version}${i.published_version != null ? ` <span class="meta">(live v${i.published_version})</span>` : ''}</td>` : ''}
        <td class="meta">${i.updated_at ? esc(new Date(i.updated_at).toLocaleDateString()) : ''}${i.updated_by_email ? ' · ' + esc(i.updated_by_email) : ''}</td>
      </tr>`).join('') || `<tr><td colspan="5" class="meta">Nothing here yet.</td></tr>`}</tbody>
    </table></div>`);
}

// ---------------------------------------------------------------- editor
const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setPath(obj, path, value) {
  const keys = path.split('.');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (o[keys[i]] == null) o[keys[i]] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    o = o[keys[i]];
  }
  o[keys[keys.length - 1]] = value;
}
const fid = path => 'f-' + path.replace(/[^a-z0-9]+/gi, '-');

function refOptions(type, current) {
  const list = itemsOf(type).filter(i => i.status !== 'archived' || i.id === current);
  return list.map(i => `<option value="${esc(i.id)}"${i.id === current ? ' selected' : ''}>${esc(i.title)}${TYPES[type].reviewed && i.status !== 'published' ? ' (' + esc(STATUS[i.status]) + ')' : ''}</option>`).join('');
}
const refTitle = (type, id) => { const i = findItem(type, id); return i ? i.title : id + ' (missing)'; };

function field(f, value, path, ctx) {
  const id = fid(path);
  const req = f.required && TYPES[ctx.type].reviewed ? ' <span class="cms-req">needed to submit</span>' : f.required ? ' <span class="cms-req">required</span>' : '';
  const label = `<label class="cms-label" for="${id}">${esc(f.label)}${req}</label>`;
  const help = f.help ? `<p class="cms-help">${esc(f.help)}</p>` : '';
  const ro = ctx.readOnly ? ' disabled' : '';
  switch (f.kind) {
    case 'text': {
      const disabled = f.idField && !ctx.isNew ? ' disabled' : ro;
      return `<div class="cms-field">${label}<div class="cms-inline"><input id="${id}" type="text" data-path="${path}" value="${esc(value)}"${disabled}${f.idField ? ' pattern="[a-z0-9]+(-[a-z0-9]+)*" maxlength="64" spellcheck="false"' : ''}>
        ${f.upload && !ctx.readOnly ? `<label class="button button--ghost cms-upload">Upload<input type="file" data-upload="${path}" accept="${f.upload === 'vtt' ? '.vtt,text/vtt' : 'image/jpeg,image/png,image/webp'}" hidden></label>` : ''}</div>${help}</div>`;
    }
    case 'textarea':
      return `<div class="cms-field">${label}<textarea id="${id}" rows="${f.rows || 3}" data-path="${path}"${ro}>${esc(value)}</textarea>${help}</div>`;
    case 'number':
      return `<div class="cms-field cms-field--short">${label}<input id="${id}" type="number" inputmode="numeric" data-path="${path}" data-kind="number" value="${value == null ? '' : esc(value)}"${f.min != null ? ` min="${f.min}"` : ''}${f.max != null ? ` max="${f.max}"` : ''}${ro}>${help}</div>`;
    case 'checkbox':
      return `<div class="cms-field cms-field--check"><label class="cms-check"><input id="${id}" type="checkbox" data-path="${path}" data-kind="checkbox"${value ? ' checked' : ''}${ro}> ${esc(f.label)}</label>${help}</div>`;
    case 'select':
      return `<div class="cms-field">${label}<select id="${id}" data-path="${path}"${f.number ? ' data-kind="number"' : ''}${ro}>${f.options.map(o => `<option value="${esc(o.value)}"${String(o.value) === String(value) ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>${help}</div>`;
    case 'list':
      return `<div class="cms-field">${label}<textarea id="${id}" rows="${f.rows || 3}" data-path="${path}" data-kind="list" placeholder="One per line"${ro}>${esc((value || []).join('\n'))}</textarea>${help}</div>`;
    case 'ref':
      return `<div class="cms-field">${label}<select id="${id}" data-path="${path}" data-kind="ref"${ro}><option value="">None</option>${refOptions(f.ref, value)}</select>${help}</div>`;
    case 'refs': {
      const vals = value || [];
      return `<fieldset class="cms-field cms-refs"><legend class="cms-label">${esc(f.label)}${req}</legend>
        ${vals.length ? `<ol class="cms-reflist">${vals.map((v, i) => `<li><span>${esc(refTitle(f.ref, v))}</span>${ctx.readOnly ? '' : `
          <button type="button" class="cms-mini" data-act="move" data-path="${path}" data-i="${i}" data-d="-1" aria-label="Move up"${i === 0 ? ' disabled' : ''}>&uarr;</button>
          <button type="button" class="cms-mini" data-act="move" data-path="${path}" data-i="${i}" data-d="1" aria-label="Move down"${i === vals.length - 1 ? ' disabled' : ''}>&darr;</button>
          <button type="button" class="cms-mini" data-act="remove" data-path="${path}" data-i="${i}" aria-label="Remove">&times;</button>`}</li>`).join('')}</ol>` : '<p class="meta">None yet.</p>'}
        ${ctx.readOnly ? '' : `<div class="cms-inline"><select aria-label="Add to ${esc(f.label)}" data-refs-add="${path}"><option value="">Add&hellip;</option>${itemsOf(f.ref).filter(i => !vals.includes(i.id) && i.status !== 'archived').map(i => `<option value="${esc(i.id)}">${esc(i.title)}</option>`).join('')}</select>
          <button type="button" class="button button--small" data-act="refs-add" data-path="${path}">Add</button></div>`}
        ${help}</fieldset>`;
    }
    case 'group':
      return `<fieldset class="cms-group"><legend>${esc(f.label)}</legend>${f.fields.map(g => field(g, (value || {})[g.key], path + '.' + g.key, ctx)).join('')}</fieldset>`;
    case 'items': {
      const vals = value || [];
      const warn = f.cycleCheck ? cycleWarnings(ctx, vals) : '';
      return `<fieldset class="cms-group cms-items"><legend>${esc(f.label)}</legend>
        ${vals.map((v, i) => `<div class="cms-item"><div class="cms-item-head"><span class="meta">${i + 1}</span>${ctx.readOnly ? '' : `
          <button type="button" class="cms-mini" data-act="move" data-path="${path}" data-i="${i}" data-d="-1" aria-label="Move up"${i === 0 ? ' disabled' : ''}>&uarr;</button>
          <button type="button" class="cms-mini" data-act="move" data-path="${path}" data-i="${i}" data-d="1" aria-label="Move down"${i === vals.length - 1 ? ' disabled' : ''}>&darr;</button>
          <button type="button" class="cms-mini" data-act="remove" data-path="${path}" data-i="${i}" aria-label="Remove">&times;</button>`}</div>
          <div class="cms-item-fields">${f.fields.map(g => field(g, v[g.key], `${path}.${i}.${g.key}`, ctx)).join('')}</div></div>`).join('')}
        ${warn}
        ${ctx.readOnly ? '' : `<button type="button" class="button button--ghost" data-act="add" data-path="${path}">${esc(f.add || 'Add')}</button>`}
      </fieldset>`;
    }
  }
  return '';
}

function cycleWarnings(ctx, prereqs) {
  if (!S.idx || ctx.type !== 'skill') return '';
  const me = ctx.state.id;
  const bad = prereqs.filter(p => p.id && wouldCreateCycle(S.idx, me, p.id));
  return bad.length ? `<p class="cms-warn" role="alert">Circular link: ${bad.map(p => esc(refTitle('skill', p.id))).join(', ')} already depends on this skill. The database will refuse to save this.</p>` : '';
}

function previewHref(type, item) {
  if (!item || !item.id) return '';
  const p = '&preview=1';
  if (type === 'skill') return `coaching/skill/?s=${encodeURIComponent(item.id)}${p}`;
  if (type === 'lesson' && item.skill_id) return `coaching/skill/?s=${encodeURIComponent(item.skill_id)}${p}`;
  if (type === 'drill') return `coaching/drill/?d=${encodeURIComponent(item.id)}${p}`;
  if (type === 'pathway') return `coaching/progressions/?p=${encodeURIComponent(item.id)}${p}`;
  if (type === 'discipline') return `coaching/disciplines/?d=${encodeURIComponent(item.id)}${p}`;
  return '';
}

function sidePanel(ed) {
  const { type, meta, data } = ed;
  const T = TYPES[type];
  if (ed.isNew) return `<aside class="cms-side"><p class="meta">Save to create this ${esc(T.label.toLowerCase())}. It starts as a draft.</p></aside>`;
  const prev = previewHref(type, ed.state);
  if (!T.reviewed) {
    return `<aside class="cms-side"><div class="cms-card"><h2>Reference content</h2><p class="meta">Changes go live as soon as you save. Only admins can edit this.</p>
      ${prev ? `<a class="read-link" href="${prev}" target="_blank" rel="noopener">Preview</a>` : ''}
      ${isAdmin() && !(data.dependents || []).length ? `<p><button type="button" class="cms-danger" data-act="delete">Delete</button></p>` : ''}</div></aside>`;
  }
  const v = data.validation || { content: [], links: [] };
  const s = meta.status;
  const btn = (to, label, cls = 'button', enabled = true) => `<button type="button" class="${cls}" data-act="move-status" data-to="${to}"${enabled ? '' : ' disabled'}>${label}</button>`;
  const actions = [];
  if (s === 'draft' && (meta.mine || canReview())) actions.push(btn('submitted', 'Submit for review', 'button', !v.content.length && !ed.dirty));
  if (s === 'submitted' && canReview()) {
    const blocked = data.needs_specialist && (!S.me.specialist || meta.last_editor_is_me);
    actions.push(btn('approved', 'Approve', 'button', !blocked && !ed.dirty));
    actions.push(btn('draft', 'Request changes', 'button button--ghost'));
  } else if (s === 'submitted' && meta.mine) actions.push(btn('draft', 'Withdraw', 'button button--ghost'));
  if (s === 'approved' && isAdmin()) actions.push(btn('published', meta.published_version != null ? 'Publish new version' : 'Publish', 'button', !v.links.length && !v.content.length && !ed.dirty));
  if (s === 'approved' && canReview()) actions.push(btn('draft', 'Send back to draft', 'button button--ghost'));
  if (s !== 'archived' && isAdmin() && (meta.published_version != null || s === 'published')) actions.push(btn('archived', 'Archive (take off the site)', 'cms-danger', !(data.dependents || []).length));
  if (s === 'archived' && isAdmin()) actions.push(btn('draft', 'Restore as draft', 'button button--ghost'));
  if (isAdmin() && !data.versions.length && s !== 'archived') actions.push(`<button type="button" class="cms-danger" data-act="delete">Delete draft</button>`);

  return `<aside class="cms-side">
    <div class="cms-card">
      <h2>Status</h2>
      <p>${statusPill(s)} <span class="meta">working copy v${meta.version}${meta.published_version != null ? ` · live v${meta.published_version}` : ' · not live'}</span></p>
      ${meta.published_version != null && s !== 'published' ? '<p class="cms-help">Riders still see the live version until this one is approved and published.</p>' : ''}
      ${data.needs_specialist ? `<p class="cms-note">Advanced or high-consequence content: approval needs a specialist reviewer who didn't make the last edit.${meta.last_editor_is_me ? ' You made the last edit.' : ''}</p>` : ''}
      ${meta.updated_by_email ? `<p class="meta">Last edited by ${esc(meta.updated_by_email)}</p>` : ''}
      ${meta.approved_by_email ? `<p class="meta">Approved by ${esc(meta.approved_by_email)} ${meta.approved_at ? esc(new Date(meta.approved_at).toLocaleDateString()) : ''}</p>` : ''}
      ${ed.dirty ? '<p class="cms-warn">Unsaved changes. Save before changing status.</p>' : ''}
      ${actions.length ? `<label class="cms-label" for="cms-note">Note (optional)</label><input id="cms-note" type="text" placeholder="e.g. What changed, or what to fix">
        <div class="cms-actions">${actions.join('')}</div>` : ''}
      ${prev ? `<p><a class="read-link" href="${prev}" target="_blank" rel="noopener">Preview this draft</a></p>` : ''}
    </div>
    <div class="cms-card">
      <h2>Ready to publish?</h2>
      ${v.content.length || v.links.length ? `<ul class="cms-checks">${v.content.map(x => `<li class="bad">${esc(x)}</li>`).join('')}${v.links.map(x => `<li class="wait">${esc(x)}</li>`).join('')}</ul>`
        : '<p class="ok-line">Everything needed is here.</p>'}
      ${v.links.length ? '<p class="cms-help">Linked items must be published first, so the live site never has a broken link.</p>' : ''}
    </div>
    ${(data.dependents || []).length ? `<div class="cms-card"><h2>Live pages link here</h2><ul class="cms-list">${data.dependents.map(d => { const [t, id] = d.split(':'); return `<li><a href="#/edit/${t}/${encodeURIComponent(id)}">${esc(refTitle(t, id))}</a> <span class="meta">${esc(TYPES[t].label)}</span></li>`; }).join('')}</ul></div>` : ''}
    <div class="cms-card">
      <h2>Published versions</h2>
      ${data.versions.length ? `<ol class="cms-versions">${data.versions.map(x => `<li><strong>v${x.version}</strong>${x.version === meta.published_version ? ' <span class="st st--published">Live</span>' : ''}
        <span class="meta">${esc(new Date(x.published_at).toLocaleString())}${x.by ? ' · ' + esc(x.by) : ''}</span>${x.note ? `<span class="cms-help">${esc(x.note)}</span>` : ''}
        ${isAdmin() && x.version !== meta.published_version ? `<button type="button" class="cms-mini cms-mini--text" data-act="rollback" data-v="${x.version}">Roll back to this</button>` : ''}</li>`).join('')}</ol>` : '<p class="meta">Never published.</p>'}
    </div>
  </aside>`;
}

function renderEditor() {
  const ed = S.editor;
  const T = TYPES[ed.type];
  const ctx = { type: ed.type, isNew: ed.isNew, state: ed.state, readOnly: ed.readOnly };
  const title = ed.isNew ? 'New ' + T.label.toLowerCase() : (ed.state[T.titleKey] || ed.state.id);
  root.innerHTML = frame(ed.type, `
    <p class="cms-crumb"><a href="#/list/${ed.type}">${esc(T.plural)}</a></p>
    <div class="cms-head"><h1 class="cms-title">${esc(title)}</h1></div>
    ${ed.readOnly ? `<p class="cms-note">${T.admin ? 'Only admins can change this.' : 'Contributors can only edit their own drafts. You can read this item.'}</p>` : ''}
    <div class="cms-edit">
      <form class="cms-form" id="cms-form" novalidate>
        ${FIELDS[ed.type].map(f => field(f, ed.state[f.key], f.key, ctx)).join('')}
        ${ed.readOnly ? '' : `<div class="cms-savebar"><button class="button" type="submit"${ed.saving ? ' disabled' : ''}>${ed.saving ? 'Saving…' : ed.isNew ? 'Create draft' : 'Save'}</button>
          ${ed.dirty ? '<span class="meta">Unsaved changes</span>' : '<span class="meta">All changes saved</span>'}
          ${T.reviewed && !ed.isNew && ed.meta && ed.meta.status !== 'draft' ? '<span class="cms-help">Saving sends this back to draft for review.</span>' : ''}</div>`}
      </form>
      ${sidePanel(ed)}
    </div>`);
  wireEditor();
}

async function openEditor(type, id) {
  if (!TYPES[type]) return notFound();
  root.setAttribute('aria-busy', 'true');
  if (!id) {
    S.editor = { type, isNew: true, state: blank(type), dirty: false, readOnly: TYPES[type].admin && !isAdmin() };
  } else {
    const data = await api.get(type, id);
    const meta = data.meta;
    const readOnly = TYPES[type].admin ? !isAdmin() : role() === 'contributor' && !(meta.mine && meta.status === 'draft');
    S.editor = { type, isNew: false, state: { ...blank(type), ...data.item }, data, meta, dirty: false, readOnly };
  }
  root.removeAttribute('aria-busy');
  renderEditor();
}

function readInput(el) {
  const k = el.dataset.kind;
  if (k === 'checkbox') return el.checked;
  if (k === 'number') return el.value === '' ? null : Number(el.value);
  if (k === 'list') return el.value.split('\n');
  if (k === 'ref') return el.value || null;
  return el.value;
}

function markDirty() {
  if (S.editor.dirty) return;
  S.editor.dirty = true;
  const m = root.querySelector('.cms-savebar .meta');
  if (m) m.textContent = 'Unsaved changes';
  root.querySelectorAll('[data-act="move-status"]').forEach(b => { if (b.dataset.to !== 'draft' && b.dataset.to !== 'archived') b.disabled = true; });
}

function rerenderKeepScroll() {
  const y = window.scrollY;
  renderEditor();
  window.scrollTo(0, y);
}

function wireEditor() {
  const form = document.getElementById('cms-form');
  if (!form) return;
  form.addEventListener('input', e => {
    const el = e.target;
    if (!el.dataset.path) return;
    setPath(S.editor.state, el.dataset.path, readInput(el));
    markDirty();
  });
  form.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.upload) return upload(el);
    if (!el.dataset.path) return;
    setPath(S.editor.state, el.dataset.path, readInput(el));
    markDirty();
    // Prerequisite changes re-check for loops.
    if (S.editor.type === 'skill' && /^prerequisites\./.test(el.dataset.path)) rerenderKeepScroll();
  });
  form.addEventListener('submit', e => { e.preventDefault(); save(); });
  root.querySelector('.cms-edit').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    const ed = S.editor;
    if (act === 'add') {
      const f = findField(b.dataset.path);
      const arr = getPath(ed.state, b.dataset.path) || [];
      arr.push(blankItem(f));
      setPath(ed.state, b.dataset.path, arr);
      ed.dirty = true; rerenderKeepScroll();
    } else if (act === 'remove' || act === 'move') {
      const arr = getPath(ed.state, b.dataset.path) || [];
      const i = Number(b.dataset.i);
      if (act === 'remove') arr.splice(i, 1);
      else { const j = i + Number(b.dataset.d); if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; }
      ed.dirty = true; rerenderKeepScroll();
    } else if (act === 'refs-add') {
      const sel = b.parentElement.querySelector('select[data-refs-add]');
      if (!sel || !sel.value) return;
      const arr = getPath(ed.state, b.dataset.path) || [];
      arr.push(sel.value);
      setPath(ed.state, b.dataset.path, arr);
      ed.dirty = true; rerenderKeepScroll();
    } else if (act === 'move-status') changeStatus(b.dataset.to);
    else if (act === 'rollback') rollback(Number(b.dataset.v));
    else if (act === 'delete') removeItem();
  });
}

function findField(path) {
  // "physics.blocks" or "technique" or "stages.2.lessons"
  const keys = path.split('.').filter(k => !/^\d+$/.test(k));
  let fields = FIELDS[S.editor.type];
  let f = null;
  for (const k of keys) { f = fields.find(x => x.key === k); fields = f && f.fields; }
  return f;
}

async function upload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('That file is over 5 MB. Use a smaller image.', 'error'); return; }
  try {
    toast('Uploading…');
    const url = await api.upload(file);
    setPath(S.editor.state, input.dataset.upload, url);
    S.editor.dirty = true;
    rerenderKeepScroll();
    toast('Uploaded. Save to keep it.');
  } catch (e) { toast('Upload failed: ' + e.message, 'error'); }
}

async function save() {
  const ed = S.editor;
  if (ed.saving) return;
  const payload = toPayload(ed.type, ed.state);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(payload.id || '')) { toast('Give it an ID: lowercase letters, numbers and hyphens.', 'error'); return; }
  if (ed.isNew && findItem(ed.type, payload.id)) { toast(`There's already a ${TYPES[ed.type].label.toLowerCase()} with the ID "${payload.id}".`, 'error'); return; }
  ed.saving = true; rerenderKeepScroll();
  try {
    await api.save(ed.type, payload);
    await refresh();
    toast('Saved.');
    ed.dirty = false;
    if (ed.isNew) { location.hash = `#/edit/${ed.type}/${encodeURIComponent(payload.id)}`; return; }
    await openEditor(ed.type, payload.id);
  } catch (e) {
    ed.saving = false; rerenderKeepScroll();
    toast(e.message, 'error');
  }
}

async function changeStatus(to) {
  const ed = S.editor;
  const note = (document.getElementById('cms-note') || {}).value || '';
  if (to === 'archived' && !confirm('Take this off the live site? Its history is kept and you can restore it as a draft later.')) return;
  if (to === 'published' && !confirm('Publish this version to the live site?')) return;
  try {
    await api.move(ed.type, ed.state.id, to, note);
    await refresh();
    toast(to === 'published' ? 'Published.' : `Now: ${STATUS[to]}.`);
    await openEditor(ed.type, ed.state.id);
  } catch (e) { toast(e.message, 'error'); }
}

async function rollback(v) {
  const ed = S.editor;
  if (!confirm(`Put version ${v} back on the live site? The working copy is reset to it too.`)) return;
  try {
    await api.rollback(ed.type, ed.state.id, v, (document.getElementById('cms-note') || {}).value || '');
    await refresh();
    toast(`Rolled back to v${v}.`);
    await openEditor(ed.type, ed.state.id);
  } catch (e) { toast(e.message, 'error'); }
}

async function removeItem() {
  const ed = S.editor;
  if (!confirm(`Delete "${ed.state.id}" permanently? This can't be undone.`)) return;
  try {
    await api.remove(ed.type, ed.state.id);
    await refresh();
    toast('Deleted.');
    location.hash = '#/list/' + ed.type;
  } catch (e) { toast(e.message, 'error'); }
}

// ---------------------------------------------------------------- progression map
// Skills laid out left to right by how many prerequisites sit beneath them.
// Click a skill to see and change its prerequisites right here.
function mapView(params) {
  const idx = S.idx;
  const skills = [...idx.skills.values()];
  let order;
  try { order = learningOrder(idx, skills.map(s => s.id), ['required', 'recommended', 'optional']); }
  catch (e) { return frame('map', `<h1 class="cms-title">Progression map</h1><p class="cms-warn">${esc(e.message)}</p>`); }
  const layer = new Map();
  for (const id of order) {
    const s = idx.skills.get(id);
    const ps = (s.prerequisites || []).filter(p => idx.skills.has(p.id));
    layer.set(id, ps.length ? 1 + Math.max(...ps.map(p => layer.get(p.id) || 0)) : 0);
  }
  const cols = [];
  for (const id of order) { const l = layer.get(id); (cols[l] = cols[l] || []).push(id); }
  const W = 184, H = 46, GX = 70, GY = 18, PAD = 20;
  const pos = new Map();
  cols.forEach((ids, c) => ids.forEach((id, r) => pos.set(id, { x: PAD + c * (W + GX), y: PAD + r * (H + GY) })));
  const width = PAD * 2 + cols.length * (W + GX) - GX;
  const height = PAD * 2 + Math.max(...cols.map(c => c.length)) * (H + GY) - GY;
  const sel = params.get('s');
  const edges = [];
  for (const s of skills) for (const p of s.prerequisites || []) {
    if (!pos.has(p.id)) continue;
    const a = pos.get(p.id), b = pos.get(s.id);
    const x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2, mx = (x1 + x2) / 2;
    const on = sel && (sel === s.id || sel === p.id);
    edges.push(`<path class="map-edge map-edge--${p.kind}${on ? ' map-edge--on' : ''}" d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}"><title>${esc(idx.skills.get(p.id).name)} → ${esc(s.name)} (${p.kind})</title></path>`);
  }
  const nodes = skills.map(s => {
    const { x, y } = pos.get(s.id);
    return `<a href="#/map?s=${encodeURIComponent(s.id)}" class="map-node${sel === s.id ? ' map-node--sel' : ''}" aria-label="${esc(s.name)}, safety class ${s.safety_class}">
      <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="2"/>
      <rect class="map-cls map-cls--${s.safety_class}" x="${x}" y="${y}" width="22" height="${H}"/>
      <text class="map-cls-t" x="${x + 11}" y="${y + H / 2 + 4}" text-anchor="middle">${s.safety_class}</text>
      <text x="${x + 32}" y="${y + H / 2 + 5}">${esc(s.name.length > 20 ? s.name.slice(0, 19) + '…' : s.name)}</text></a>`;
  }).join('');

  let panel = '<p class="meta">Select a skill to see and change its prerequisites.</p>';
  const s = sel && idx.skills.get(sel);
  if (s) {
    const item = findItem('skill', s.id);
    const canEdit = role() !== 'contributor' || (item && item.created_by && item.status === 'draft');
    const prs = s.prerequisites || [];
    panel = `<h2>${esc(s.name)}</h2><p>${statusPill(item ? item.status : 'draft')} ${esc(SAFETY[s.safety_class].label)}</p>
      <form id="map-form" data-skill="${esc(s.id)}">
      <ul class="cms-maplist">${prs.map((p, i) => `<li><span>${esc((idx.skills.get(p.id) || { name: p.id }).name)}</span>
        <select data-i="${i}" aria-label="Type"${canEdit ? '' : ' disabled'}>${['required', 'recommended', 'optional'].map(k => `<option value="${k}"${k === p.kind ? ' selected' : ''}>${k}</option>`).join('')}</select>
        ${canEdit ? `<button type="button" class="cms-mini" data-rm="${i}" aria-label="Remove">&times;</button>` : ''}</li>`).join('') || '<li class="meta">No prerequisites.</li>'}</ul>
      ${canEdit ? `<div class="cms-inline"><select id="map-add" aria-label="Add prerequisite"><option value="">Add prerequisite&hellip;</option>${skills.filter(x => x.id !== s.id && !prs.some(p => p.id === x.id)).map(x =>
        `<option value="${esc(x.id)}"${wouldCreateCycle(idx, s.id, x.id) ? ' disabled' : ''}>${esc(x.name)}${wouldCreateCycle(idx, s.id, x.id) ? ' (would loop)' : ''}</option>`).join('')}</select>
        <select id="map-kind" aria-label="Type"><option value="required">required</option><option value="recommended">recommended</option><option value="optional">optional</option></select></div>
        <div class="cms-actions"><button class="button" type="submit">Save prerequisites</button><a class="read-link" href="#/edit/skill/${encodeURIComponent(s.id)}">Open skill</a></div>
        ${item && item.status !== 'draft' ? '<p class="cms-help">Saving sends this skill back to draft for review.</p>' : ''}` : '<p class="cms-help">You can view these links but not change them.</p>'}
      </form>`;
  }
  return frame('map', `
    <h1 class="cms-title">Progression map</h1>
    <p class="cms-help">Every skill, left to right from foundations. Lines show prerequisites: <span class="map-key map-key--required">required</span> <span class="map-key map-key--recommended">recommended</span> <span class="map-key map-key--optional">optional</span>. The number is the safety class. Shows drafts as well as published skills.</p>
    <div class="cms-map-wrap">
      <div class="cms-map" tabindex="0" aria-label="Progression map, scrolls sideways"><svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${edges.join('')}${nodes}</svg></div>
      <aside class="cms-card cms-map-panel">${panel}</aside>
    </div>`);
}

function wireMap() {
  const form = document.getElementById('map-form');
  if (!form) return;
  const id = form.dataset.skill;
  const s = S.idx.skills.get(id);
  const prs = (s.prerequisites || []).map(p => ({ ...p }));
  form.addEventListener('change', e => { if (e.target.dataset.i != null) prs[Number(e.target.dataset.i)].kind = e.target.value; });
  form.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]');
    if (rm) { prs.splice(Number(rm.dataset.rm), 1); rm.closest('li').remove(); }
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const add = document.getElementById('map-add');
    if (add && add.value) prs.push({ id: add.value, kind: document.getElementById('map-kind').value });
    try {
      await api.save('skill', { id, prerequisites: prs });
      await refresh();
      toast('Prerequisites saved.');
      route();
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ---------------------------------------------------------------- routing
function notFound() {
  root.innerHTML = frame('', '<h1 class="cms-title">Not found</h1><p><a href="#/">Back to the dashboard</a></p>');
}

async function route() {
  const [path, qs] = (location.hash.replace(/^#/, '') || '/').split('?');
  const params = new URLSearchParams(qs || '');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (S.editor && S.editor.dirty && !(parts[0] === 'edit' && parts[1] === S.editor.type && parts[2] === S.editor.state.id)) {
    if (!confirm('You have unsaved changes. Leave without saving?')) return;
  }
  S.editor = null;
  try {
    if (!parts.length) root.innerHTML = dashboard();
    else if (parts[0] === 'list' && TYPES[parts[1]]) root.innerHTML = listView(parts[1], params);
    else if (parts[0] === 'new' && TYPES[parts[1]]) await openEditor(parts[1], null);
    else if (parts[0] === 'edit' && TYPES[parts[1]] && parts[2]) await openEditor(parts[1], parts[2]);
    else if (parts[0] === 'map') { root.innerHTML = mapView(params); wireMap(); }
    else notFound();
  } catch (e) {
    root.innerHTML = frame('', `<h1 class="cms-title">Couldn't open that</h1><p class="cms-warn">${esc(e.message)}</p><p><a href="#/">Back to the dashboard</a></p>`);
  }
  root.removeAttribute('aria-busy');
  document.querySelector('.cms-main') && window.scrollTo(0, 0);
}

root.addEventListener('submit', e => {
  const f = e.target.closest('[data-filter]');
  if (!f) return;
  e.preventDefault();
  const p = new URLSearchParams(new FormData(f));
  for (const [k, v] of [...p]) if (!v) p.delete(k);
  location.hash = `#/list/${f.dataset.filter}${p.toString() ? '?' + p : ''}`;
});
window.addEventListener('hashchange', route);
window.addEventListener('beforeunload', e => { if (S.editor && S.editor.dirty) { e.preventDefault(); e.returnValue = ''; } });

function gate(title, body) {
  root.innerHTML = `<section class="section"><div class="wrap"><p class="eyebrow">Coaching CMS</p><h1 class="page-title">${esc(title)}</h1><div class="coach-prose">${body}</div></div></section>`;
  root.removeAttribute('aria-busy');
}

async function start() {
  if (!A || !A.configured) {
    return gate('Not connected', '<p>The CMS needs the site\'s Supabase connection, which isn\'t set up on this copy of the site. You can still browse the starter drafts at <a href="coaching/">coaching/</a> on localhost.</p>');
  }
  const st = await A.status({ force: true });
  if (!st.user) return gate('Sign in', '<p>Sign in with your Mathlete account to manage the Coaching Lab.</p><p><a class="button" href="login.html?next=coaching/admin/">Log in</a></p>');
  api.sb = await A.client();
  let me;
  try { me = await api.rpc('coach_my_role'); } catch (e) { return gate('Couldn\'t connect', `<p>${esc(e.message)}</p><p>If the Coaching Lab tables haven't been set up yet, run <code>supabase/coaching.sql</code> in the Supabase SQL editor.</p>`); }
  if (!me) return gate('No CMS access', `<p>You're signed in as ${esc(st.user.email)}, but this account isn't a Coaching Lab editor. Ask an admin to add you (see <code>docs/COACHING.md</code>).</p>`);
  await refresh();
  route();
}

start().catch(e => gate('Something went wrong', `<p>${esc(e.message)}</p>`));
