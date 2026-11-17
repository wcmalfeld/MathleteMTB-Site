// Shared pieces for the Resources library pages (resources/, resources/view/,
// resources/manage/). Data comes from supabase/library.sql; the database
// decides who sees what, so nothing here is a security check.
//
// Everything from the database is placed as text or through DOM APIs.
// Written resources use a small formatting language (see renderText) that
// is turned into elements directly: there is no way to inject HTML or
// scripts, and links and images must be http(s).
(function () {
  'use strict';

  var TYPES = {
    document: { label: 'Document', action: 'Download' },
    article:  { label: 'Article',  action: 'Read the article' },
    video:    { label: 'Video',    action: 'Watch' },
    tool:     { label: 'Interactive tool', action: 'Launch the tool' },
    written:  { label: 'Written guide', action: 'Read' }
  };
  var SUBJECTS = { mathematics: 'Mathematics', physics: 'Physics', science: 'Science', general: 'General' };
  var GRADES = { elementary: 'Elementary', 'middle-school': 'Middle School', 'high-school': 'High School', college: 'College' };
  var DIFFICULTY = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

  // Files people may upload, by extension -> content type (must match the
  // bucket's allowed types in supabase/library.sql).
  var FILE_TYPES = {
    pdf: 'application/pdf',
    doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain', md: 'text/markdown',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'
  };
  var IMAGE_TYPES = { jpg: 1, jpeg: 1, png: 1, webp: 1 };
  var MAX_BYTES = 50 * 1024 * 1024;

  // ---------- elements ----------
  function el(tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(n, arguments[i]);
    return n;
  }
  function add(n, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) return c.forEach(function (x) { add(n, x); });
    n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }

  // A small inline SVG icon per resource type (drawn with DOM calls).
  var ICONS = {
    document: ['M7 3h7l5 5v13H7z', 'M14 3v5h5', 'M10 13h6M10 17h6'],
    article:  ['M4 5h16v14H4z', 'M7 9h10M7 13h10M7 17h6'],
    video:    ['M3 6h18v12H3z', 'M10 9.5l5 2.5-5 2.5z'],
    tool:     ['M4 20l6-6', 'M14 4a5 5 0 0 0-4 8l-1 1 1 1 1-1a5 5 0 0 0 8-4l-3 1-2-2 1-3z'],
    written:  ['M5 19l3-1 11-11-2-2L6 16z', 'M4 21h16']
  };
  function icon(type) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'lib-icon');
    (ICONS[type] || ICONS.article).forEach(function (d) {
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    });
    return svg;
  }

  // ---------- formatting ----------
  function bytes(n) {
    if (!n && n !== 0) return '';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
    return (n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0) + ' MB';
  }
  function ext(name) { var m = /\.([a-z0-9]+)$/i.exec(name || ''); return m ? m[1].toLowerCase() : ''; }
  function date(s) {
    if (!s) return '';
    try { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return ''; }
  }
  function host(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function safeUrl(url) {
    try { var u = new URL(url); return /^https?:$/.test(u.protocol) ? u.href : null; } catch (e) { return null; }
  }

  // YouTube and Vimeo only; the embed address is built from the video id,
  // never from anything a person typed.
  function video(url) {
    var u; try { u = new URL(url); } catch (e) { return null; }
    var h = u.hostname.replace(/^(www\.|m\.)/, ''), id;
    if (h === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (h === 'youtube.com') id = u.searchParams.get('v') || (/^\/(embed|shorts|live)\/([^/?#]+)/.exec(u.pathname) || [])[2];
    if (id && /^[A-Za-z0-9_-]{6,20}$/.test(id)) {
      return { provider: 'YouTube', id: id, embed: 'https://www.youtube-nocookie.com/embed/' + id, thumb: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' };
    }
    if (h === 'vimeo.com' || h === 'player.vimeo.com') {
      id = (/(?:^|\/)(\d{6,12})(?:$|[/?#])/.exec(u.pathname) || [])[1];
      if (id) return { provider: 'Vimeo', id: id, embed: 'https://player.vimeo.com/video/' + id, thumb: null };
    }
    return null;
  }

  // ---------- written resources: simple formatting -> elements ----------
  //   # or ## Heading, ### Subheading   paragraphs (blank line between)
  //   - item / * item        1. item         > quote        ---
  //   **bold**  *italic*  `code`  [link text](https://...)  ![alt text](https://...)
  function inline(text) {
    var out = [], re = /(!?)\[([^\]]*)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push(text.slice(last, m.index));
      if (m[3] !== undefined) {
        var url = safeUrl(m[3]);
        if (m[1] === '!' && url && /^https:/.test(url)) out.push(el('img', { src: url, alt: m[2], loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' }));
        else if (m[1] !== '!' && url) out.push(el('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, m[2] || host(url)));
        else out.push(m[0]);
      } else if (m[4] !== undefined) out.push(el('strong', null, m[4]));
      else if (m[5] !== undefined) out.push(el('em', null, m[5]));
      else out.push(el('code', null, m[6]));
      last = re.lastIndex;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }
  function renderText(src) {
    var frag = document.createDocumentFragment();
    var lines = String(src || '').replace(/\r\n?/g, '\n').split('\n');
    var i = 0, para = [];
    function flush() { if (para.length) { frag.appendChild(el('p', null, inline(para.join(' ')))); para = []; } }
    while (i < lines.length) {
      var line = lines[i], t = line.trim(), m;
      if (!t) { flush(); i++; continue; }
      if ((m = /^(#{1,3})\s+(.*)$/.exec(t))) { flush(); frag.appendChild(el(m[1].length === 3 ? 'h3' : 'h2', null, inline(m[2]))); i++; continue; }
      if (/^(-{3,}|\*{3,})$/.test(t)) { flush(); frag.appendChild(el('hr')); i++; continue; }
      if (/^>\s?/.test(t)) {
        flush(); var q = [];
        while (i < lines.length && /^>\s?/.test(lines[i].trim())) { q.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
        frag.appendChild(el('blockquote', null, el('p', null, inline(q.join(' ')))));
        continue;
      }
      var bullet = /^[-*]\s+/.test(t), num = /^\d+[.)]\s+/.test(t);
      if (bullet || num) {
        flush(); var list = el(bullet ? 'ul' : 'ol');
        while (i < lines.length && (bullet ? /^[-*]\s+/ : /^\d+[.)]\s+/).test(lines[i].trim())) {
          list.appendChild(el('li', null, inline(lines[i].trim().replace(bullet ? /^[-*]\s+/ : /^\d+[.)]\s+/, ''))));
          i++;
        }
        frag.appendChild(list);
        continue;
      }
      para.push(t); i++;
    }
    flush();
    return frag;
  }

  // ---------- data ----------
  var A = window.MathleteAuth;
  function sb() { return A.client(); }
  function rpc(name, args) {
    return sb().then(function (c) { return c.rpc(name, args || {}); }).then(function (res) {
      if (res.error) { var e = new Error(res.error.message || 'Something went wrong.'); e.code = res.error.code; throw e; }
      return res.data;
    });
  }
  // Signed links for files in the private bucket (one call for many).
  function signed(paths, seconds) {
    paths = (paths || []).filter(Boolean);
    if (!paths.length) return Promise.resolve({});
    return sb().then(function (c) { return c.storage.from('library').createSignedUrls(paths, seconds || 3600); })
      .then(function (res) {
        var map = {};
        (res.data || []).forEach(function (r) { if (r.signedUrl && !r.error) map[r.path] = r.signedUrl; });
        return map;
      }).catch(function () { return {}; });
  }

  // ---------- cards ----------
  function thumbFor(r, signedMap) {
    if (r.thumbnail_path && signedMap[r.thumbnail_path]) return signedMap[r.thumbnail_path];
    if (r.thumbnail_url && safeUrl(r.thumbnail_url)) return r.thumbnail_url;
    if (r.resource_type === 'video') { var v = video(r.external_url); if (v && v.thumb) return v.thumb; }
    return null;
  }
  function viewHref(r) { return 'resources/view/?r=' + encodeURIComponent(r.slug); }
  function card(r, signedMap, opts) {
    opts = opts || {};
    var type = TYPES[r.resource_type] || TYPES.article;
    var src = thumbFor(r, signedMap || {});
    var thumb = el('span', { class: 'lib-thumb lib-thumb--' + r.resource_type },
      src ? el('img', { src: src, alt: '', loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' }) : icon(r.resource_type),
      el('span', { class: 'lib-type' }, icon(r.resource_type), type.label));
    var flags = [];
    if (r.visibility === 'organization' && r.organization_name) flags.push(el('span', { class: 'lib-flag' }, r.organization_name + ' only'));
    if (r.visibility === 'private') flags.push(el('span', { class: 'lib-flag lib-flag--staff' }, 'Staff only'));
    var tags = (r.tags || []).slice(0, 3);
    return el('article', { class: 'lib-card' + (opts.compact ? ' lib-card--compact' : '') },
      el('a', { class: 'lib-card-link', href: viewHref(r) },
        thumb,
        el('span', { class: 'lib-card-body' },
          el('span', { class: 'lib-card-kicker' }, r.category_name || ''),
          el(opts.heading || 'h3', { class: 'lib-card-title' }, r.title),
          el('span', { class: 'lib-card-desc' }, r.description),
          (tags.length || flags.length) ? el('span', { class: 'lib-card-tags' }, flags, tags.map(function (t) { return el('span', { class: 'lib-tag' }, t); })) : null)));
  }

  // replaceChildren() would turn a missing (null) piece into the text "null".
  function put(node) {
    var kids = Array.prototype.slice.call(arguments, 1).filter(function (k) { return k !== null && k !== undefined && k !== false; });
    node.replaceChildren.apply(node, kids);
    return node;
  }

  window.MathleteLibrary = {
    TYPES: TYPES, SUBJECTS: SUBJECTS, GRADES: GRADES, DIFFICULTY: DIFFICULTY,
    FILE_TYPES: FILE_TYPES, IMAGE_TYPES: IMAGE_TYPES, MAX_BYTES: MAX_BYTES,
    el: el, icon: icon, bytes: bytes, ext: ext, date: date, host: host, safeUrl: safeUrl, video: video,
    renderText: renderText, rpc: rpc, signed: signed, card: card, thumbFor: thumbFor, viewHref: viewHref,
    client: sb, put: put
  };
})();
