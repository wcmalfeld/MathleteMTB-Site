// Resources library: browsing (resources/) and one resource (resources/view/).
// Everything shown comes from database functions that only return what the
// visitor is allowed to see (supabase/library.sql).
(function () {
  'use strict';
  var L = window.MathleteLibrary, A = window.MathleteAuth;
  var el = L.el, track = window.mathleteTrack || function () {};
  var PAGE = 24;

  function setStatus(box, msg, kind) {
    box.className = 'notice lib-notice' + (kind ? ' notice--' + kind : '');
    box.textContent = msg;
    box.hidden = !msg;
  }
  function options(select, list) {
    list.forEach(function (o) { select.appendChild(el('option', { value: o[0] }, o[1])); });
  }

  if (!A || !A.configured) {
    var box = document.getElementById('lib-status') || document.getElementById('lib-item-main');
    if (box) { box.hidden = false; box.className = 'notice lib-notice'; box.textContent = 'The library isn’t connected on this copy of the site.'; }
    return;
  }

  // Show the "Manage resources" link to people who can add resources.
  var manageLink = document.getElementById('lib-manage-link');
  if (manageLink && A.hasStoredSession()) {
    L.rpc('library_access').then(function (a) {
      if (a && (a.platform || a.direct_author || (a.orgs || []).length)) manageLink.hidden = false;
    }).catch(function () {});
  }

  // ==================== resources/ ====================
  var results = document.getElementById('lib-results');
  if (results) browse();

  function browse() {
    var params = new URLSearchParams(location.search);
    var form = document.getElementById('lib-filters');
    var search = document.getElementById('lib-search');
    var q = document.getElementById('lib-q');
    var count = document.getElementById('lib-count');
    var empty = document.getElementById('lib-empty');
    var more = document.getElementById('lib-load-more');
    var clear = document.getElementById('lib-clear');
    var status = document.getElementById('lib-status');
    var F = { category: 'f-category', type: 'f-type', subject: 'f-subject', tag: 'f-tag', grade: 'f-grade', difficulty: 'f-difficulty', sort: 'f-sort' };
    var field = function (k) { return document.getElementById(F[k]); };
    var categories = [];
    var offset = 0, total = 0, seq = 0;

    options(field('type'), Object.keys(L.TYPES).map(function (k) { return [k, L.TYPES[k].label]; }));
    options(field('subject'), Object.keys(L.SUBJECTS).map(function (k) { return [k, L.SUBJECTS[k]]; }));
    options(field('grade'), Object.keys(L.GRADES).map(function (k) { return [k, L.GRADES[k]]; }));
    options(field('difficulty'), Object.keys(L.DIFFICULTY).map(function (k) { return [k, L.DIFFICULTY[k]]; }));

    function current() {
      var s = { q: q.value.trim() };
      Object.keys(F).forEach(function (k) { s[k] = field(k).value; });
      return s;
    }
    function filtering(s) { return !!(s.q || s.category || s.type || s.subject || s.tag || s.grade || s.difficulty); }
    function syncUrl(s) {
      var u = new URLSearchParams();
      Object.keys(s).forEach(function (k) { if (s[k] && !(k === 'sort' && s[k] === 'recent')) u.set(k, s[k]); });
      var qs = u.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }
    function args(s, extra) {
      return Object.assign({
        p_q: s.q || null, p_category: s.category || null, p_subject: s.subject || null, p_tag: s.tag || null,
        p_type: s.type || null, p_grade: s.grade || null, p_difficulty: s.difficulty || null,
        p_sort: s.q && s.sort === 'recent' ? 'relevance' : s.sort, p_limit: PAGE, p_offset: 0, p_featured: false
      }, extra || {});
    }
    function cards(host, items, opts) {
      var paths = items.map(function (r) { return r.thumbnail_path; });
      return L.signed(paths).then(function (map) {
        items.forEach(function (r) { host.appendChild(L.card(r, map, opts)); });
      });
    }

    function run(append) {
      var s = current(), my = ++seq;
      syncUrl(s);
      clear.hidden = !filtering(s);
      if (!append) { offset = 0; results.setAttribute('aria-busy', 'true'); }
      return L.rpc('library_search', args(s, { p_offset: offset })).then(function (res) {
        if (my !== seq) return;
        total = res.total;
        if (!append) L.put(results, );
        offset += res.items.length;
        count.textContent = total === 0 ? '' : (filtering(s) ? total + (total === 1 ? ' resource matches.' : ' resources match.') : total + (total === 1 ? ' resource.' : ' resources.'));
        more.hidden = offset >= total;
        empty.hidden = total > 0;
        if (!total) {
          L.put(empty, 
            el('p', null, el('strong', null, filtering(s) ? 'No resources match that search yet.' : 'The library is just getting started.')),
            el('p', null, filtering(s) ? 'Try a shorter search, fewer filters, or browse a category.' : 'New resources are on the way. Check back soon.'),
            filtering(s) ? el('button', { class: 'read-link', type: 'button', onclick: reset }, 'Clear search and filters') : null);
        }
        return cards(results, res.items, { heading: 'h3' });
      }).catch(function () {
        if (my === seq) setStatus(status, 'Resources couldn’t load. Check your connection and try again.', 'error');
      }).then(function () { results.setAttribute('aria-busy', 'false'); });
    }
    function reset() {
      q.value = '';
      Object.keys(F).forEach(function (k) { field(k).value = k === 'sort' ? 'recent' : ''; });
      run(false);
    }

    // Start-up: categories, then restore any search from the address.
    L.rpc('library_category_counts').catch(function () { return []; }).then(function (counts) {
      var n = {}; (counts || []).forEach(function (c) { n[c.category_id] = c.n; });
      return L.client().then(function (c) { return c.from('library_categories').select('id, slug, name, description, display_order').order('display_order'); })
        .then(function (res) {
          categories = res.data || [];
          options(field('category'), categories.map(function (c) { return [c.slug, c.name]; }));
          var list = document.getElementById('lib-cats');
          categories.forEach(function (c) {
            var k = n[c.id] || 0;
            list.appendChild(el('li', null, el('a', { class: 'lib-cat' + (k ? '' : ' lib-cat--empty'), href: 'resources/?category=' + encodeURIComponent(c.slug) + '#browse',
              onclick: function (e) { e.preventDefault(); field('category').value = c.slug; run(false); document.getElementById('browse').scrollIntoView({ behavior: 'smooth' }); track('library_category_click'); } },
              el('span', { class: 'lib-cat-name' }, c.name),
              c.description ? el('span', { class: 'lib-cat-desc' }, c.description) : null,
              el('span', { class: 'lib-cat-count' }, k ? k + (k === 1 ? ' resource' : ' resources') : 'Coming soon'))));
          });
          document.getElementById('categories').hidden = !categories.length;
        });
    }).then(function () {
      return L.rpc('library_tags').then(function (tags) {
        options(field('tag'), (tags || []).map(function (t) { return [t.tag, t.tag]; }));
      }).catch(function () {});
    }).then(function () {
      q.value = params.get('q') || '';
      Object.keys(F).forEach(function (k) {
        var v = params.get(k); var f = field(k);
        if (v && Array.prototype.some.call(f.options, function (o) { return o.value === v; })) f.value = v;
      });
      if (params.get('tag') || params.get('grade') || params.get('difficulty')) document.getElementById('lib-more-filters').open = true;
      form.hidden = false;
      run(false);
      // Featured and recently added (only when there's something to show).
      L.rpc('library_search', { p_featured: true, p_sort: 'featured', p_limit: 6 }).then(function (res) {
        if (res.items.length) { document.getElementById('featured').hidden = false; return cards(document.getElementById('lib-featured'), res.items); }
      }).catch(function () {});
      L.rpc('library_search', { p_sort: 'recent', p_limit: 4 }).then(function (res) {
        if (res.total > 4) { document.getElementById('recent').hidden = false; return cards(document.getElementById('lib-recent'), res.items, { compact: true }); }
      }).catch(function () {});
    }).catch(function () {
      setStatus(status, 'Resources couldn’t load. Check your connection and try again.', 'error');
    });

    form.addEventListener('change', function () { run(false); track('library_filter'); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    clear.addEventListener('click', reset);
    more.addEventListener('click', function () { run(true); });
    search.addEventListener('submit', function (e) {
      e.preventDefault();
      run(false);
      track('library_search');
      document.getElementById('browse').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ==================== resources/view/ ====================
  var main = document.getElementById('lib-item-main');
  if (main) view();

  function view() {
    var slug = new URLSearchParams(location.search).get('r') || '';
    var side = document.getElementById('lib-item-side');
    var titleEl = document.getElementById('lib-item-title');
    var descEl = document.getElementById('lib-item-desc');
    var typeEl = document.getElementById('lib-item-type');
    var banner = document.getElementById('lib-item-banner');

    function missing() {
      titleEl.textContent = 'Resource not found';
      descEl.textContent = '';
      L.put(main, 
        el('p', null, 'This resource isn’t available. It may have been removed, or it may be for a school or staff account.'),
        el('p', null, A.hasStoredSession() ? null : el('a', { class: 'button', href: 'login.html?next=' + encodeURIComponent(location.pathname.replace(/^\//, '') + location.search) }, 'Log in'),
          ' ', el('a', { class: 'read-link', href: 'resources/' }, 'Browse the library')));
      document.title = 'Resource not found | Mathlete';
    }
    if (!/^[a-z0-9-]{1,90}$/.test(slug)) return missing();

    L.rpc('library_get', { p_slug: slug }).then(function (r) {
      if (!r) return missing();
      var type = L.TYPES[r.resource_type] || L.TYPES.article;
      document.title = r.title + ' | Resources | Mathlete';
      var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', r.description);
      titleEl.textContent = r.title;
      descEl.textContent = r.description;
      L.put(typeEl, L.icon(r.resource_type), type.label);
      var crumb = document.getElementById('lib-crumb-cat');
      L.put(crumb, el('a', { href: 'resources/?category=' + encodeURIComponent(r.category_slug) + '#browse' }, r.category_name));
      crumb.hidden = false;
      if (r.status !== 'published' || r.visibility !== 'public') {
        banner.textContent = r.status === 'draft' ? 'Draft: only you and the library’s admins can see this.'
          : r.status === 'archived' ? 'Archived: students can’t see this.'
          : r.visibility === 'private' ? 'Staff only: students can’t see this.'
          : 'For ' + (r.organization_name || 'one school') + ' only.';
        banner.hidden = false;
      }
      track('library_view_' + r.resource_type);
      return Promise.all([content(r), details(r)]).then(function () { return related(r); });
    }).catch(function () {
      titleEl.textContent = 'Couldn’t load this resource';
      L.put(main, el('p', null, 'Check your connection and try again.'));
    });

    function content(r) {
      var parts = [];
      var url = L.safeUrl(r.external_url);
      if (r.recommendation_note) parts.push(el('aside', { class: 'lib-why' }, el('p', { class: 'lib-why-label' }, 'Why we recommend it'), el('p', null, r.recommendation_note)));
      if (r.resource_type === 'written') {
        var art = el('article', { class: 'lib-prose prose' }); art.appendChild(L.renderText(r.content || ''));
        parts.unshift(art);
        L.put.apply(null, [main].concat(parts));
        return Promise.resolve();
      }
      if (r.resource_type === 'video') {
        var v = L.video(r.external_url);
        if (v) parts.unshift(el('div', { class: 'lib-video' }, el('iframe', {
          src: v.embed, title: r.title + ' (' + v.provider + ' video)', loading: 'lazy', referrerpolicy: 'strict-origin-when-cross-origin',
          allow: 'encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true })));
        if (url) parts.splice(1, 0, el('p', { class: 'lib-actions' }, el('a', { class: 'read-link', href: url, target: '_blank', rel: 'noopener noreferrer' }, 'Watch on ' + (v ? v.provider : L.host(url)), el('span', { 'aria-hidden': 'true' }, ' ↗'))));
        L.put.apply(null, [main].concat(parts));
        return Promise.resolve();
      }
      if (r.resource_type === 'article' || r.resource_type === 'tool') {
        if (url) parts.unshift(el('div', { class: 'lib-launch' },
          el('a', { class: 'button', href: url, target: '_blank', rel: 'noopener noreferrer', 'data-track': 'library_open_' + r.resource_type },
            r.resource_type === 'tool' ? 'Launch the tool' : 'Read the article', el('span', { class: 'visually-hidden' }, ' (opens in a new tab)')),
          el('p', { class: 'lib-launch-host' }, 'Opens ' + L.host(url) + ' in a new tab.')));
        L.put.apply(null, [main].concat(parts));
        return Promise.resolve();
      }
      // Documents: a preview where the browser can show one, and a download.
      if (!r.file_path) { L.put(main, el('p', null, 'The file for this resource hasn’t been uploaded yet.')); return Promise.resolve(); }
      return L.signed([r.file_path], 3600).then(function (map) {
        var link = map[r.file_path];
        if (!link) { L.put(main, el('p', null, 'This file couldn’t be loaded.')); return; }
        var e = L.ext(r.file_name);
        var dl = el('div', { class: 'lib-download' },
          el('a', { class: 'button', href: link + '&download=' + encodeURIComponent(r.file_name || 'download'), 'data-track': 'library_download' }, 'Download'),
          el('span', { class: 'lib-file-meta' }, (e ? e.toUpperCase() : 'File') + (r.file_size ? ' · ' + L.bytes(r.file_size) : '')),
          el('a', { class: 'read-link', href: link, target: '_blank', rel: 'noopener noreferrer' }, 'Open in a new tab'));
        parts.unshift(dl);
        if (e === 'pdf') parts.unshift(el('div', { class: 'lib-preview' }, el('iframe', { src: link + '#view=FitH', title: 'Preview of ' + r.title, loading: 'lazy' })));
        else if (L.IMAGE_TYPES[e]) parts.unshift(el('figure', { class: 'lib-preview lib-preview--image' }, el('img', { src: link, alt: r.title, decoding: 'async' })));
        L.put.apply(null, [main].concat(parts));
        if (e === 'txt' || e === 'md') {
          return fetch(link).then(function (res) { return res.ok ? res.text() : ''; }).then(function (t) {
            if (!t) return;
            var box = el('div', { class: 'lib-preview lib-preview--text' });
            if (e === 'md') box.appendChild(el('div', { class: 'lib-prose prose' }, L.renderText(t.slice(0, 60000))));
            else box.appendChild(el('pre', null, t.slice(0, 60000)));
            main.insertBefore(box, main.firstChild);
          }).catch(function () {});
        }
      });
    }

    function details(r) {
      var rows = [];
      function row(k, v) { if (v) rows.push(el('div', null, el('dt', null, k), el('dd', null, v))); }
      row('Category', el('a', { href: 'resources/?category=' + encodeURIComponent(r.category_slug) + '#browse' }, r.category_name));
      row('Type', (L.TYPES[r.resource_type] || {}).label);
      row('Source', r.source_name || (r.external_url ? L.host(r.external_url) : null));
      row('Author', r.author);
      row('Subject', L.SUBJECTS[r.subject]);
      row('Level', (r.grade_levels || []).map(function (g) { return L.GRADES[g]; }).filter(Boolean).join(', '));
      row('Difficulty', L.DIFFICULTY[r.difficulty]);
      row('Time', r.estimated_duration);
      row('Added', L.date(r.published_at || r.created_at));
      var thumb = r.thumbnail_path ? L.signed([r.thumbnail_path]) : Promise.resolve({});
      return thumb.then(function (map) {
        var src = L.thumbFor(r, map);
        L.put(side, 
          src && r.resource_type !== 'video' ? el('img', { class: 'lib-side-thumb', src: src, alt: '', decoding: 'async', referrerpolicy: 'no-referrer' }) : null,
          el('dl', { class: 'lib-facts' }, rows),
          (r.tags || []).length ? el('div', { class: 'lib-side-tags' }, el('p', { class: 'lib-side-label' }, 'Skills & tags'),
            el('ul', { class: 'lib-tag-list' }, r.tags.map(function (t) { return el('li', null, el('a', { class: 'lib-tag', href: 'resources/?tag=' + encodeURIComponent(t) + '#browse' }, t)); }))) : null);
      });
    }

    function related(r) {
      return L.rpc('library_search', { p_category: r.category_slug, p_sort: 'featured', p_limit: 4 }).then(function (res) {
        var items = res.items.filter(function (x) { return x.id !== r.id; }).slice(0, 3);
        if (!items.length) return;
        document.getElementById('related').hidden = false;
        var host = document.getElementById('lib-related');
        return L.signed(items.map(function (x) { return x.thumbnail_path; })).then(function (map) {
          items.forEach(function (x) { host.appendChild(L.card(x, map, { heading: 'h3' })); });
        });
      }).catch(function () {});
    }
  }
})();
