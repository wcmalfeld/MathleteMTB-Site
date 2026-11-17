// Resources library: the manage page (resources/manage/).
//
// For platform admins (everything), tutors (their own Mathlete-wide drafts),
// and school owners, admins and instructors (their school's resources).
// The page only hides what would be refused: every save, publish, upload
// and delete is checked by the database (supabase/library.sql).
(function () {
  'use strict';
  var L = window.MathleteLibrary, A = window.MathleteAuth;
  var el = L.el, track = window.mathleteTrack || function () {};
  var gate = document.getElementById('mg-gate');
  var app = document.getElementById('mg-app');
  var tabsHost = document.getElementById('mg-tabs');
  var panel = document.getElementById('mg-panel');
  var notice = document.getElementById('mg-notice');
  var confirmBox = document.getElementById('mg-confirm');

  var access = null, categories = [], tags = [], items = [];
  var tab = 'resources';

  function say(kind, msg) {
    notice.className = 'notice notice--' + kind;
    notice.textContent = msg;
    notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    notice.hidden = !msg;
    if (msg) notice.focus();
  }
  function errText(e) { return (e && e.message) || 'Something went wrong. Try again.'; }
  function confirmAsk(title, text) {
    document.getElementById('mg-confirm-title').textContent = title;
    document.getElementById('mg-confirm-text').textContent = text;
    return new Promise(function (resolve) {
      confirmBox.returnValue = '';
      confirmBox.addEventListener('close', function done() { confirmBox.removeEventListener('close', done); resolve(confirmBox.returnValue === 'yes'); });
      confirmBox.showModal();
    });
  }
  function vis(r) {
    if (r.visibility === 'public') return 'Mathlete-wide';
    if (r.visibility === 'organization') return r.organization_name || 'School';
    return 'Staff only' + (r.organization_name ? ' · ' + r.organization_name : '');
  }
  var STATUS = { draft: 'Draft', published: 'Published', archived: 'Archived' };

  // ---------- start ----------
  if (!A || !A.configured) { gate.textContent = 'The library isn’t connected on this copy of the site.'; return; }
  L.rpc('library_access').then(function (a) {
    access = a;
    if (!a.signed_in) {
      L.put(gate, el('p', null, 'Log in to add and manage resources.'),
        el('a', { class: 'button', href: 'login.html?next=' + encodeURIComponent('resources/manage/') }, 'Log in'));
      return;
    }
    if (!a.platform && !a.direct_author && !(a.orgs || []).length) {
      L.put(gate, el('p', null, 'Your account can browse the library but can’t add resources. Tutors, school staff and Mathlete admins can.'),
        el('a', { class: 'read-link', href: 'resources/' }, 'Back to the library'));
      return;
    }
    document.getElementById('mg-lede').textContent = a.platform
      ? 'You’re a Mathlete admin: you can add, publish and organize everything.'
      : 'Add resources and save them as drafts' + ((a.orgs || []).some(function (o) { return o.can_publish; }) ? ', and publish your school’s resources.' : '. An admin publishes them for students.');
    gate.hidden = true; app.hidden = false;
    return refresh().then(function () { drawTabs(); show(); });
  }).catch(function (e) {
    gate.textContent = 'Couldn’t check your account: ' + errText(e) + ' (Has supabase/library.sql been run?)';
  });

  function refresh() {
    return Promise.all([
      L.client().then(function (c) { return c.from('library_categories').select('id, slug, name, description, display_order').order('display_order'); })
        .then(function (r) { categories = r.data || []; }),
      L.rpc('library_tags').then(function (t) { tags = t || []; }).catch(function () { tags = []; }),
      L.rpc('library_manage_list').then(function (l) { items = l || []; })
    ]);
  }

  function drawTabs() {
    var list = [['resources', 'Resources']];
    if (access.platform) list.push(['categories', 'Categories'], ['tags', 'Tags']);
    L.put.apply(null, [tabsHost].concat(list.map(function (t) {
      return el('button', { type: 'button', role: 'tab', class: 'lib-tab', 'aria-selected': String(tab === t[0]),
        onclick: function () { tab = t[0]; notice.hidden = true; drawTabs(); show(); } }, t[1]);
    })));
    tabsHost.hidden = list.length < 2;
  }
  function show() {
    if (tab === 'categories') return drawCategories();
    if (tab === 'tags') return drawTags();
    drawList();
  }

  // ==================== resource list ====================
  var listState = { q: '', status: '', type: '' };
  function drawList() {
    var q = el('input', { class: 'input', type: 'search', id: 'mg-q', placeholder: 'Search titles', value: listState.q });
    var st = el('select', { class: 'input', id: 'mg-status' }, el('option', { value: '' }, 'Any status'),
      Object.keys(STATUS).map(function (k) { return el('option', { value: k }, STATUS[k]); }));
    var ty = el('select', { class: 'input', id: 'mg-type' }, el('option', { value: '' }, 'Any type'),
      Object.keys(L.TYPES).map(function (k) { return el('option', { value: k }, L.TYPES[k].label); }));
    st.value = listState.status; ty.value = listState.type;
    var body = el('tbody');
    var table = el('table', { class: 'lib-table' },
      el('caption', { class: 'visually-hidden' }, 'Resources you can manage'),
      el('thead', null, el('tr', null, ['Title', 'Type', 'Category', 'Visibility', 'Status', 'Added', 'Created by', 'Actions'].map(function (h) { return el('th', { scope: 'col' }, h); }))),
      body);
    var countEl = el('p', { class: 'lib-count', role: 'status' });
    function fill() {
      listState = { q: q.value.trim().toLowerCase(), status: st.value, type: ty.value };
      var rows = items.filter(function (r) {
        return (!listState.q || r.title.toLowerCase().indexOf(listState.q) !== -1)
          && (!listState.status || r.status === listState.status) && (!listState.type || r.resource_type === listState.type);
      });
      countEl.textContent = rows.length + ' of ' + items.length + (items.length === 1 ? ' resource' : ' resources');
      L.put.apply(null, [body].concat(rows.length ? rows.map(row) : [el('tr', null, el('td', { colspan: '8', class: 'lib-table-empty' },
        items.length ? 'Nothing matches.' : 'No resources yet. Add the first one.'))]));
    }
    q.addEventListener('input', fill); st.addEventListener('change', fill); ty.addEventListener('change', fill);
    L.put(panel, 
      el('div', { class: 'lib-toolbar' },
        el('div', { class: 'field' }, el('label', { for: 'mg-q' }, 'Search'), q),
        el('div', { class: 'field' }, el('label', { for: 'mg-status' }, 'Status'), st),
        el('div', { class: 'field' }, el('label', { for: 'mg-type' }, 'Type'), ty),
        el('button', { class: 'button', type: 'button', onclick: function () { editor(null); } }, 'Add resource')),
      countEl,
      el('div', { class: 'lib-table-wrap' }, table));
    fill();
  }

  function row(r) {
    var actions = el('div', { class: 'lib-row-actions' });
    if (r.can_manage) actions.appendChild(el('button', { type: 'button', class: 'read-link', onclick: function () { editor(r.id); } }, 'Edit'));
    actions.appendChild(el('a', { class: 'read-link', href: L.viewHref(r) }, 'Preview'));
    if (r.can_manage && r.can_publish) {
      if (r.status === 'published') actions.appendChild(el('button', { type: 'button', class: 'read-link', onclick: function () { setStatus(r, 'draft'); } }, 'Unpublish'));
      else actions.appendChild(el('button', { type: 'button', class: 'read-link', onclick: function () { setStatus(r, 'published'); } }, 'Publish'));
    }
    if (r.can_manage) actions.appendChild(el('button', { type: 'button', class: 'read-link lib-danger-link', onclick: function () { remove(r); } }, 'Delete'));
    if (!r.can_manage) actions.appendChild(el('span', { class: 'lib-muted' }, 'Published by an admin'));
    return el('tr', null,
      el('th', { scope: 'row' }, el('span', { class: 'lib-row-title' }, r.title), r.is_featured ? el('span', { class: 'lib-flag' }, 'Featured') : null),
      el('td', null, (L.TYPES[r.resource_type] || {}).label),
      el('td', null, r.category_name),
      el('td', null, vis(r)),
      el('td', null, el('span', { class: 'lib-status lib-status--' + r.status }, STATUS[r.status])),
      el('td', null, L.date(r.created_at)),
      el('td', null, r.created_by_name),
      el('td', null, actions));
  }

  function setStatus(r, s) {
    L.rpc('library_set_status', { p_id: r.id, p_status: s }).then(function () {
      say('success', '“' + r.title + '” is ' + (s === 'published' ? 'published.' : 'back in drafts.'));
      track('library_admin_' + (s === 'published' ? 'publish' : 'unpublish'));
      return refresh().then(drawList);
    }).catch(function (e) { say('error', errText(e)); });
  }

  function remove(r) {
    confirmAsk('Delete this resource?', '“' + r.title + '” and any uploaded files will be permanently deleted. This can’t be undone.').then(function (yes) {
      if (!yes) return;
      return L.client().then(function (c) {
        return c.storage.from('library').list('items/' + r.id).then(function (res) {
          var paths = (res.data || []).map(function (f) { return 'items/' + r.id + '/' + f.name; });
          return paths.length ? c.storage.from('library').remove(paths) : null;
        });
      }).then(function () { return L.rpc('library_delete_item', { p_id: r.id }); }).then(function () {
        say('success', '“' + r.title + '” was deleted.');
        track('library_admin_delete');
        return refresh().then(drawList);
      }).catch(function (e) { say('error', errText(e)); });
    });
  }

  // ==================== add / edit ====================
  function editor(id) {
    notice.hidden = true;
    var load = id ? L.rpc('library_get_for_edit', { p_id: id }) : Promise.resolve(null);
    load.then(function (r) { drawEditor(r || {}); }).catch(function (e) { say('error', errText(e)); });
  }

  function drawEditor(r) {
    var isNew = !r.id;
    var state = { type: r.resource_type || '', file: null, thumb: null, tags: (r.tags || []).slice(), removeThumb: false };
    var form = el('form', { class: 'form lib-editor', novalidate: true });
    var stepType = el('fieldset', { class: 'lib-step' }, el('legend', null, el('span', { class: 'lib-step-num' }, '1'), 'What kind of resource?'));
    var typeGrid = el('div', { class: 'lib-type-grid' });
    var TYPE_HELP = { document: 'PDF, Word, slides, spreadsheet or image', article: 'A web page or article', video: 'YouTube or Vimeo', tool: 'An interactive website or app', written: 'Write it here' };
    Object.keys(L.TYPES).forEach(function (k) {
      var input = el('input', { type: 'radio', name: 'resource_type', value: k, required: true });
      if (state.type === k) input.checked = true;
      input.addEventListener('change', function () { state.type = k; drawFields(); });
      typeGrid.appendChild(el('label', { class: 'lib-type-option' }, input, L.icon(k),
        el('span', { class: 'lib-type-name' }, k === 'article' ? 'Article / Website' : L.TYPES[k].label), el('span', { class: 'lib-type-help' }, TYPE_HELP[k])));
    });
    stepType.appendChild(typeGrid);

    function input(name, label, attrs, hint) {
      var idv = 'mg-' + name;
      var tag = attrs && attrs.rows ? 'textarea' : 'input';
      var a = Object.assign({ class: 'input', id: idv, name: name }, attrs || {});
      if (hint) a['aria-describedby'] = idv + '-hint';
      var f = el(tag, a);
      if (r[name] != null) f.value = r[name];
      return el('div', { class: 'field' }, el('label', { for: idv }, label, attrs && attrs.required ? el('span', { class: 'req', 'aria-hidden': 'true' }, ' *') : el('span', { class: 'optional' }, ' (optional)')),
        hint ? el('p', { class: 'field-hint', id: idv + '-hint' }, hint) : null, f);
    }
    function select(name, label, opts, required) {
      var s = el('select', { class: 'input', id: 'mg-' + name, name: name, required: !!required },
        el('option', { value: '' }, required ? 'Choose…' : 'None'), opts.map(function (o) { return el('option', { value: o[0] }, o[1]); }));
      s.value = r[name] || '';
      return el('div', { class: 'field' }, el('label', { for: 'mg-' + name }, label, required ? el('span', { class: 'req', 'aria-hidden': 'true' }, ' *') : el('span', { class: 'optional' }, ' (optional)')), s);
    }

    // Step 2: details (depends on the type)
    var stepDetails = el('fieldset', { class: 'lib-step' }, el('legend', null, el('span', { class: 'lib-step-num' }, '2'), 'Details'));
    var fieldsHost = el('div', { class: 'lib-fields' });
    stepDetails.appendChild(fieldsHost);
    var common = [
      input('title', 'Title', { required: true, maxlength: '160' }),
      input('description', 'Short description', { required: true, maxlength: '400', rows: '3' }, 'One or two sentences for the card. 400 characters at most.')
    ];
    var fileField = (function () {
      var current = r.file_name ? el('p', { class: 'field-hint' }, 'Current file: ', el('strong', null, r.file_name), r.file_size ? ' (' + L.bytes(r.file_size) + ')' : '', '. Choose a new one to replace it.') : null;
      var f = el('input', { class: 'input', type: 'file', id: 'mg-file', accept: Object.keys(L.FILE_TYPES).map(function (e) { return '.' + e; }).join(',') });
      f.addEventListener('change', function () { state.file = f.files[0] || null; });
      return el('div', { class: 'field' }, el('label', { for: 'mg-file' }, 'File', el('span', { class: 'req', 'aria-hidden': 'true' }, ' *')),
        el('p', { class: 'field-hint' }, 'PDF, Word, PowerPoint, Excel, text, Markdown, JPG, PNG or WebP. Up to 50 MB. PDFs and images get a preview.'), current, f);
    })();
    var urlField = input('external_url', 'Web address', { required: true, type: 'url', maxlength: '2000', placeholder: 'https://' });
    var sourceField = input('source_name', 'Source or publication', { maxlength: '120' });
    var authorField = input('author', 'Author', { maxlength: '120' });
    var contentField = (function () {
      var ta = el('textarea', { class: 'input lib-md-input', id: 'mg-content', name: 'content', rows: '16', maxlength: '60000', 'aria-describedby': 'mg-content-hint' });
      ta.value = r.content || '';
      var preview = el('div', { class: 'lib-md-preview lib-prose prose', 'aria-label': 'Preview', role: 'region' });
      function draw() { L.put(preview, L.renderText(ta.value)); }
      ta.addEventListener('input', draw); draw();
      function wrap(before, after, placeholder) {
        return function () {
          var s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || placeholder;
          ta.setRangeText(before + sel + after, s, e, 'end'); ta.focus(); draw();
        };
      }
      function line(prefix) {
        return function () {
          var s = ta.selectionStart, start = ta.value.lastIndexOf('\n', s - 1) + 1;
          ta.setRangeText(prefix, start, start, 'end'); ta.focus(); draw();
        };
      }
      var tools = [['Heading', line('## ')], ['Subheading', line('### ')], ['Bold', wrap('**', '**', 'bold text')], ['Italic', wrap('*', '*', 'italic text')],
        ['Bulleted list', line('- ')], ['Numbered list', line('1. ')], ['Quote', line('> ')], ['Link', wrap('[', '](https://)', 'link text')], ['Image', wrap('![', '](https://)', 'describe the image')]];
      return el('div', { class: 'field lib-md' }, el('label', { for: 'mg-content' }, 'Content', el('span', { class: 'req', 'aria-hidden': 'true' }, ' *')),
        el('p', { class: 'field-hint', id: 'mg-content-hint' }, 'Use the buttons, or type: ## heading, **bold**, *italic*, - list, 1. numbered, > quote, [link](https://…), ![image](https://…). A blank line starts a new paragraph.'),
        el('div', { class: 'lib-md-tools', role: 'toolbar', 'aria-label': 'Formatting' }, tools.map(function (t) { return el('button', { type: 'button', class: 'lib-md-btn', onclick: t[1] }, t[0]); })),
        el('div', { class: 'lib-md-split' }, ta, preview));
    })();
    var thumbField = (function () {
      var f = el('input', { class: 'input', type: 'file', id: 'mg-thumb', accept: '.jpg,.jpeg,.png,.webp' });
      f.addEventListener('change', function () { state.thumb = f.files[0] || null; });
      var clearBox = r.thumbnail_path ? el('label', { class: 'choice' }, el('input', { type: 'checkbox', onchange: function (e) { state.removeThumb = e.target.checked; } }), 'Remove the current uploaded image') : null;
      return el('div', { class: 'lib-thumb-fields' },
        el('div', { class: 'field' }, el('label', { for: 'mg-thumb' }, 'Thumbnail image', el('span', { class: 'optional' }, ' (optional)')),
          el('p', { class: 'field-hint' }, 'JPG, PNG or WebP, up to 5 MB. Videos use their YouTube image automatically.'), f, clearBox),
        input('thumbnail_url', 'Or a thumbnail web address', { type: 'url', maxlength: '2000', placeholder: 'https://' }));
    })();
    var extras = [
      input('recommendation_note', 'Why we recommend it', { maxlength: '1000', rows: '3' }, 'A sentence or two on why this is worth a student’s time.'),
      input('estimated_duration', 'Time to read, watch or use', { maxlength: '40', placeholder: 'e.g. 10 min' })
    ];
    function drawFields() {
      var t = state.type, parts = common.slice();
      if (!t) { L.put(fieldsHost, el('p', { class: 'field-hint' }, 'Choose a type above first.')); return; }
      if (t === 'document') parts.push(fileField, authorField, sourceField);
      if (t === 'article') parts.push(urlField, sourceField, authorField);
      if (t === 'video') parts.push(urlField, sourceField);
      if (t === 'tool') parts.push(urlField, sourceField);
      if (t === 'written') parts.push(contentField, authorField);
      var lbl = urlField.querySelector('label'); lbl.firstChild.textContent = t === 'video' ? 'YouTube or Vimeo link' : t === 'tool' ? 'Tool’s web address' : 'Web address';
      parts.push(thumbField);
      parts = parts.concat(extras);
      L.put.apply(null, [fieldsHost].concat(parts));
      updatePublish();
    }

    // Step 3: organize
    var tagInput = el('input', { class: 'input', id: 'mg-tag-input', list: 'mg-tag-list', maxlength: '40', placeholder: 'Type a skill or tag, then Enter' });
    var tagChips = el('ul', { class: 'lib-chips', 'aria-label': 'Tags on this resource' });
    function drawChips() {
      L.put.apply(null, [tagChips].concat(state.tags.map(function (t, i) {
        return el('li', null, el('span', null, t), el('button', { type: 'button', class: 'lib-chip-x', 'aria-label': 'Remove tag ' + t,
          onclick: function () { state.tags.splice(i, 1); drawChips(); } }, '×'));
      })));
    }
    function addTag() {
      tagInput.value.split(',').forEach(function (v) {
        v = v.trim().replace(/\s+/g, ' ').slice(0, 40);
        if (v && state.tags.length < 20 && !state.tags.some(function (t) { return t.toLowerCase() === v.toLowerCase(); })) state.tags.push(v);
      });
      tagInput.value = ''; drawChips();
    }
    tagInput.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } });
    tagInput.addEventListener('change', function () { if (tags.some(function (t) { return t.tag === tagInput.value; })) addTag(); });
    drawChips();
    var grades = el('div', { class: 'choices choices--row' }, Object.keys(L.GRADES).map(function (g) {
      var c = el('input', { type: 'checkbox', name: 'grade_levels', value: g }); c.checked = (r.grade_levels || []).indexOf(g) !== -1;
      return el('label', { class: 'choice' }, c, ' ' + L.GRADES[g]);
    }));
    var stepOrg = el('fieldset', { class: 'lib-step' }, el('legend', null, el('span', { class: 'lib-step-num' }, '3'), 'Organize'),
      el('div', { class: 'lib-two' },
        select('category_id', 'Category', categories.map(function (c) { return [c.id, c.name]; }), true),
        select('subject', 'Subject', Object.keys(L.SUBJECTS).map(function (k) { return [k, L.SUBJECTS[k]]; })),
        select('difficulty', 'Difficulty', Object.keys(L.DIFFICULTY).map(function (k) { return [k, L.DIFFICULTY[k]]; }))),
      el('div', { class: 'field' }, el('label', { for: 'mg-tag-input' }, 'Skills and tags', el('span', { class: 'optional' }, ' (optional)')),
        el('p', { class: 'field-hint' }, 'For example Critical Thinking, Memory, Algebra. Press Enter after each one. Up to 20.'),
        tagInput, el('datalist', { id: 'mg-tag-list' }, tags.map(function (t) { return el('option', { value: t.tag }); })), tagChips),
      el('fieldset', { class: 'field choice-group' }, el('legend', null, 'Recommended grade levels ', el('span', { class: 'optional' }, '(optional)')), grades));

    // Step 4: visibility
    var visOpts = [];
    if (access.direct_author) visOpts.push(['public|', 'Mathlete-wide', 'Everyone, including visitors who aren’t logged in.']);
    (access.orgs || []).forEach(function (o) { visOpts.push(['organization|' + o.id, o.name + ' only', 'Students and staff at ' + o.name + '.']); });
    if (access.direct_author) visOpts.push(['private|', 'Mathlete staff only', 'Admins and tutors. Never shown to students.']);
    (access.orgs || []).forEach(function (o) { visOpts.push(['private|' + o.id, o.name + ' staff only', 'Admins and instructors at ' + o.name + '. Never shown to students.']); });
    var curVis = (r.visibility || (access.direct_author ? 'public' : 'organization')) + '|' + (r.organization_id || (r.visibility || access.direct_author ? '' : ((access.orgs || [])[0] || {}).id || ''));
    if (!visOpts.some(function (o) { return o[0] === curVis; })) curVis = visOpts.length ? visOpts[0][0] : '';
    var stepVis = el('fieldset', { class: 'lib-step' }, el('legend', null, el('span', { class: 'lib-step-num' }, '4'), 'Who can see it?'),
      el('div', { class: 'choices' }, visOpts.map(function (o) {
        var c = el('input', { type: 'radio', name: 'vis', value: o[0] }); c.checked = o[0] === curVis;
        c.addEventListener('change', updatePublish);
        return el('label', { class: 'choice lib-vis-choice' }, c, el('span', null, el('strong', null, o[1]), el('span', { class: 'lib-vis-help' }, o[2])));
      })));

    // Step 5: save
    var featured = el('input', { type: 'checkbox', id: 'mg-featured' }); featured.checked = !!r.is_featured;
    var order = el('input', { class: 'input lib-order', type: 'number', id: 'mg-order', min: '0', max: '999', step: '1', value: String(r.display_order || 0) });
    var featureBox = el('div', { class: 'lib-feature' },
      el('label', { class: 'choice' }, featured, ' Feature this on the Resources page'),
      el('div', { class: 'field lib-order-field' }, el('label', { for: 'mg-order' }, 'Featured order'), el('p', { class: 'field-hint' }, 'Smaller numbers show first.'), order));
    var publishNote = el('p', { class: 'field-hint lib-publish-note' });
    var draftBtn = el('button', { class: 'button button--ghost', type: 'submit', value: 'draft' }, 'Save draft');
    var publishBtn = el('button', { class: 'button', type: 'submit', value: 'published' }, 'Publish');
    var stepSave = el('fieldset', { class: 'lib-step' }, el('legend', null, el('span', { class: 'lib-step-num' }, '5'), 'Save'),
      featureBox, publishNote,
      el('div', { class: 'lib-save-row' }, draftBtn, publishBtn,
        el('button', { class: 'read-link', type: 'button', onclick: function () { drawList(); } }, 'Cancel')));

    function chosenVis() {
      var c = form.querySelector('input[name="vis"]:checked');
      var p = (c ? c.value : '|').split('|');
      return { visibility: p[0], organization_id: p[1] || null };
    }
    function canPublish(v) {
      if (access.platform) return true;
      if (v.visibility === 'private') return true;
      return !!(v.organization_id && (access.orgs || []).some(function (o) { return o.id === v.organization_id && o.can_publish; }));
    }
    function updatePublish() {
      var v = chosenVis(), ok = canPublish(v);
      publishBtn.hidden = !ok;
      publishBtn.textContent = v.visibility === 'private' ? 'Save for staff' : (r.status === 'published' ? 'Save and keep published' : 'Publish');
      featureBox.hidden = !(ok && v.visibility !== 'private');
      publishNote.textContent = ok ? (r.status === 'published' ? 'This resource is published. “Save draft” takes it off the library until you publish it again.' : '')
        : 'You can save this as a draft. An admin' + (v.organization_id ? ' at your school' : '') + ' will review and publish it.';
      publishNote.hidden = !publishNote.textContent;
    }

    form.append(stepType, stepDetails, stepOrg, stepVis, stepSave);
    L.put(panel, 
      el('div', { class: 'lib-editor-head' },
        el('button', { class: 'read-link', type: 'button', onclick: function () { drawList(); } }, '← All resources'),
        el('h2', { class: 'label' }, isNew ? 'Add a resource' : 'Edit “' + r.title + '”'),
        !isNew ? el('a', { class: 'read-link', href: L.viewHref(r) }, 'Preview') : null),
      form);
    drawFields();
    updatePublish();

    var submitter = null;
    form.addEventListener('click', function (e) { if (e.target.type === 'submit') submitter = e.target.value; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      addTag();
      save(submitter || 'draft');
    });

    function val(name) { var f = form.elements.namedItem(name); return f ? (f.value || '').trim() : ''; }

    function problems(status) {
      var p = [], t = state.type;
      if (!t) p.push('Choose what kind of resource this is.');
      if (!val('title')) p.push('Add a title.');
      if (!val('description')) p.push('Add a short description.');
      if (!val('category_id')) p.push('Choose a category.');
      if (/^(article|video|tool)$/.test(t)) {
        var u = L.safeUrl(val('external_url'));
        if (!u) p.push('Add a web address that starts with https://.');
        else if (t === 'video' && !L.video(u)) p.push('Use a YouTube or Vimeo link for videos.');
      }
      if (t === 'written' && status === 'published' && !val('content')) p.push('Write the content before publishing.');
      if (t === 'document') {
        if (state.file) {
          var x = L.ext(state.file.name);
          if (!L.FILE_TYPES[x]) p.push('That file type can’t be uploaded. Use PDF, Word, PowerPoint, Excel, text, Markdown or an image.');
          if (state.file.size > L.MAX_BYTES) p.push('That file is over 50 MB.');
        } else if (!r.file_path && status === 'published') p.push('Choose the file to upload.');
      }
      if (state.thumb && (!L.IMAGE_TYPES[L.ext(state.thumb.name)] || state.thumb.size > 5 * 1024 * 1024)) p.push('The thumbnail must be a JPG, PNG or WebP image up to 5 MB.');
      if (val('thumbnail_url') && !/^https:\/\//.test(val('thumbnail_url'))) p.push('The thumbnail address must start with https://.');
      if (!form.querySelector('input[name="vis"]:checked')) p.push('Choose who can see it.');
      return p;
    }

    function payload(status) {
      var v = chosenVis();
      var data = {
        title: val('title'), description: val('description'), resource_type: state.type, category_id: val('category_id'),
        content: state.type === 'written' ? (form.elements.namedItem('content') || {}).value || '' : null,
        external_url: /^(article|video|tool)$/.test(state.type) ? val('external_url') : null,
        thumbnail_url: val('thumbnail_url') || null, author: val('author') || null, source_name: val('source_name') || null,
        subject: val('subject') || null, tags: state.tags, difficulty: val('difficulty') || null,
        grade_levels: Array.prototype.map.call(form.querySelectorAll('input[name="grade_levels"]:checked'), function (c) { return c.value; }),
        estimated_duration: val('estimated_duration') || null, recommendation_note: val('recommendation_note') || null,
        visibility: v.visibility, organization_id: v.organization_id, status: status,
        is_featured: featured.checked, display_order: parseInt(order.value, 10) || 0
      };
      if (r.id) data.id = r.id;
      return data;
    }

    function safeName(name) {
      var x = L.ext(name);
      var base = name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'file';
      return Date.now().toString(36) + '-' + base + '.' + x;
    }

    function save(status) {
      var p = problems(status);
      if (p.length) { say('error', p.join(' ')); return; }
      var buttons = form.querySelectorAll('button'); Array.prototype.forEach.call(buttons, function (b) { b.disabled = true; });
      var data = payload(status);
      var needsUpload = !!(state.file || state.thumb);
      // A new resource is saved first (as a draft if a file still has to go up),
      // because files live in the resource's own folder.
      var first = Object.assign({}, data);
      if (needsUpload && (!r.id || (state.type === 'document' && !r.file_path))) first.status = 'draft';
      if (state.type !== 'document') { first.file_path = null; }
      var oldFiles = [];
      L.rpc('library_save_item', { p: first }).then(function (res) {
        var id = res.id;
        if (!needsUpload && !state.removeThumb) return res;
        return L.client().then(function (c) {
          var bucket = c.storage.from('library'), up = [];
          var extra = {};
          if (state.file) {
            var path = 'items/' + id + '/' + safeName(state.file.name);
            up.push(bucket.upload(path, state.file, { contentType: L.FILE_TYPES[L.ext(state.file.name)], upsert: false }).then(function (u) {
              if (u.error) throw new Error('The file didn’t upload: ' + u.error.message);
              extra.file_path = path; extra.file_name = state.file.name.slice(0, 200); extra.file_type = L.FILE_TYPES[L.ext(state.file.name)]; extra.file_size = state.file.size;
              if (r.file_path) oldFiles.push(r.file_path);
            }));
          }
          if (state.thumb) {
            var tpath = 'items/' + id + '/thumb-' + safeName(state.thumb.name);
            up.push(bucket.upload(tpath, state.thumb, { contentType: L.FILE_TYPES[L.ext(state.thumb.name)], upsert: false }).then(function (u) {
              if (u.error) throw new Error('The thumbnail didn’t upload: ' + u.error.message);
              extra.thumbnail_path = tpath;
              if (r.thumbnail_path) oldFiles.push(r.thumbnail_path);
            }));
          } else if (state.removeThumb && r.thumbnail_path) { extra.thumbnail_path = null; oldFiles.push(r.thumbnail_path); }
          return Promise.all(up).then(function () {
            return L.rpc('library_save_item', { p: Object.assign({}, data, extra, { id: id }) });
          }).then(function (res2) {
            if (oldFiles.length) bucket.remove(oldFiles).catch(function () {});
            return res2;
          });
        });
      }).then(function (res) {
        track('library_admin_save_' + res.status);
        return refresh().then(function () {
          drawList();
          say('success', '“' + data.title + '” was saved' + (res.status === 'published' ? ' and published.' : ' as a draft.'));
        });
      }).catch(function (e) {
        say('error', errText(e));
        Array.prototype.forEach.call(buttons, function (b) { b.disabled = false; });
      });
    }
  }

  // ==================== categories (platform admins) ====================
  function drawCategories() {
    var counts = {}; items.forEach(function (r) { counts[r.category_id] = (counts[r.category_id] || 0) + 1; });
    var body = el('tbody');
    categories.forEach(function (c) {
      var name = el('input', { class: 'input', value: c.name, maxlength: '60', 'aria-label': 'Name of ' + c.name });
      var desc = el('input', { class: 'input', value: c.description || '', maxlength: '240', 'aria-label': 'Description of ' + c.name });
      var ord = el('input', { class: 'input lib-order', type: 'number', value: String(c.display_order), 'aria-label': 'Order of ' + c.name });
      body.appendChild(el('tr', null,
        el('td', null, name), el('td', null, desc), el('td', null, ord), el('td', null, String(counts[c.id] || 0)),
        el('td', null, el('div', { class: 'lib-row-actions' },
          el('button', { type: 'button', class: 'read-link', onclick: function () {
            L.rpc('library_save_category', { p_id: c.id, p_name: name.value, p_description: desc.value, p_order: parseInt(ord.value, 10) || 0 })
              .then(function () { say('success', 'Saved “' + name.value + '”.'); return refresh().then(drawCategories); })
              .catch(function (e) { say('error', errText(e)); });
          } }, 'Save'),
          el('button', { type: 'button', class: 'read-link lib-danger-link', onclick: function () {
            confirmAsk('Delete this category?', '“' + c.name + '” will be removed. Categories that still have resources can’t be deleted.').then(function (yes) {
              if (!yes) return;
              L.rpc('library_delete_category', { p_id: c.id }).then(function () { say('success', 'Deleted “' + c.name + '”.'); return refresh().then(drawCategories); })
                .catch(function (e) { say('error', errText(e)); });
            });
          } }, 'Delete')))));
    });
    var newName = el('input', { class: 'input', id: 'mg-cat-name', maxlength: '60' });
    var newDesc = el('input', { class: 'input', id: 'mg-cat-desc', maxlength: '240' });
    L.put(panel, 
      el('p', { class: 'field-hint' }, 'Rename, describe and reorder categories (smaller numbers first). The Resources page shows them in this order.'),
      el('div', { class: 'lib-table-wrap' }, el('table', { class: 'lib-table lib-table--edit' },
        el('caption', { class: 'visually-hidden' }, 'Categories'),
        el('thead', null, el('tr', null, ['Name', 'Description', 'Order', 'Resources', 'Actions'].map(function (h) { return el('th', { scope: 'col' }, h); }))), body)),
      el('form', { class: 'lib-add-row', onsubmit: function (e) {
        e.preventDefault();
        L.rpc('library_save_category', { p_id: null, p_name: newName.value, p_description: newDesc.value, p_order: null })
          .then(function () { say('success', 'Added “' + newName.value + '”.'); return refresh().then(drawCategories); })
          .catch(function (err) { say('error', errText(err)); });
      } },
        el('div', { class: 'field' }, el('label', { for: 'mg-cat-name' }, 'New category'), newName),
        el('div', { class: 'field' }, el('label', { for: 'mg-cat-desc' }, 'Description'), newDesc),
        el('button', { class: 'button', type: 'submit' }, 'Add category')));
  }

  // ==================== tags (platform admins) ====================
  function drawTags() {
    var body = el('tbody');
    tags.forEach(function (t) {
      var name = el('input', { class: 'input', value: t.tag, maxlength: '40', 'aria-label': 'Rename ' + t.tag });
      body.appendChild(el('tr', null, el('td', null, name), el('td', null, String(t.uses)),
        el('td', null, el('div', { class: 'lib-row-actions' },
          el('button', { type: 'button', class: 'read-link', onclick: function () {
            if (!name.value.trim() || name.value.trim() === t.tag) return;
            L.rpc('library_rename_tag', { p_old: t.tag, p_new: name.value }).then(function (n) {
              say('success', 'Renamed on ' + n + (n === 1 ? ' resource.' : ' resources.')); return refresh().then(drawTags);
            }).catch(function (e) { say('error', errText(e)); });
          } }, 'Rename'),
          el('button', { type: 'button', class: 'read-link lib-danger-link', onclick: function () {
            confirmAsk('Remove this tag?', '“' + t.tag + '” will be taken off ' + t.uses + (t.uses === 1 ? ' resource.' : ' resources.')).then(function (yes) {
              if (!yes) return;
              L.rpc('library_rename_tag', { p_old: t.tag, p_new: '' }).then(function () { say('success', 'Removed “' + t.tag + '”.'); return refresh().then(drawTags); })
                .catch(function (e) { say('error', errText(e)); });
            });
          } }, 'Remove')))));
    });
    L.put(panel, 
      el('p', { class: 'field-hint' }, 'Tags are added on each resource. Rename one to fix a typo or merge it with another tag everywhere at once.'),
      tags.length ? el('div', { class: 'lib-table-wrap' }, el('table', { class: 'lib-table lib-table--edit' },
        el('caption', { class: 'visually-hidden' }, 'Tags'),
        el('thead', null, el('tr', null, ['Tag', 'Resources', 'Actions'].map(function (h) { return el('th', { scope: 'col' }, h); }))), body))
        : el('p', null, 'No tags yet.'));
  }
})();
