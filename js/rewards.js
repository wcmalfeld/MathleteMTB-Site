// My Rewards (rewards.html): Trail XP, the daily streak and goal, rider
// level, badges and the Trail Garage. Everything comes from one call,
// rewards_summary() (supabase/rewards.sql), which only returns the
// signed-in student's own rewards. Nothing here can change XP: the page can
// only choose a daily goal and what to wear. Text is set as text, never HTML.
//
// Also exposes MathleteRewards.strip() for the dashboard's summary strip.
(function () {
  'use strict';
  var S = window.MathleteStudent, el = S.el;
  var NS = 'http://www.w3.org/2000/svg';
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TZ = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return null; } })();

  // ---------- small SVG helpers ----------
  function svg(attrs, kids) {
    var e = document.createElementNS(NS, 'svg');
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (k) { if (k) e.appendChild(k); });
    return e;
  }
  function sv(tag, attrs) { var e = document.createElementNS(NS, tag); Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); }); return e; }

  function flame(size, lit) {
    return svg({ viewBox: '0 0 40 48', width: size, height: size * 1.2, class: 'rw-flame' + (lit ? ' rw-flame--lit' : ''), 'aria-hidden': 'true' }, [
      sv('path', { class: 'rw-flame-outer', d: 'M20 2 C28 12 34 18 34 28 A14 14 0 0 1 6 28 C6 21 10 16 13 11 C14 18 17 20 20 20 C18 13 18 8 20 2 Z' }),
      sv('path', { class: 'rw-flame-inner', d: 'M20 24 C24 29 26 32 26 35 A6 6 0 0 1 14 35 C14 32 17 28 20 24 Z' })
    ]);
  }
  function shield(on) {
    return svg({ viewBox: '0 0 24 28', width: 22, height: 26, class: 'rw-shield' + (on ? ' rw-shield--on' : ''), 'aria-hidden': 'true' },
      [sv('path', { d: 'M12 2 L21 6 C21 15 17 21 12 25 C7 21 3 15 3 6 Z' })]);
  }
  var BADGE = {
    flame: 'M16 4 C21 10 24 14 24 19 A8 8 0 0 1 8 19 C8 15 10 12 12 9 C13 13 14 14 16 14 C15 10 15 7 16 4 Z',
    peak: 'M4 25 L12 11 L16 17 L20 10 L28 25 Z',
    book: 'M6 8 L15 10 L15 25 L6 23 Z M17 10 L26 8 L26 23 L17 25 Z',
    map: 'M5 9 L12 6 L20 9 L27 6 L27 23 L20 26 L12 23 L5 26 Z',
    flask: 'M13 5 L19 5 L19 12 L26 24 C27 26 26 27 24 27 L8 27 C6 27 5 26 6 24 L13 12 Z',
    arrow: 'M6 20 C8 10 18 6 25 11 L27 7 L28 17 L19 16 L23 13 C17 10 11 13 10 20 Z',
    star: 'M16 4 L19.5 12 L28 12.5 L21.5 18 L23.5 26.5 L16 22 L8.5 26.5 L10.5 18 L4 12.5 L12.5 12 Z',
    calendar: 'M6 9 L26 9 L26 26 L6 26 Z M6 13 L26 13 M11 6 L11 11 M21 6 L21 11'
  };
  function badgeArt(a, unlocked) {
    return svg({ viewBox: '0 0 32 32', class: 'rw-badge-art rw-badge-art--' + a.category + (unlocked ? '' : ' rw-badge-art--locked'), 'aria-hidden': 'true' },
      [sv('circle', { cx: 16, cy: 16, r: 15, class: 'rw-badge-ring' }), sv('path', { d: BADGE[a.icon] || BADGE.star, class: 'rw-badge-glyph' })]);
  }

  // The rider avatar, drawn from what's equipped.
  function avatar(items, equipped, size) {
    var byId = {}; items.forEach(function (i) { byId[i.id] = i; });
    var jersey = (byId[equipped.jersey] && byId[equipped.jersey].asset.color) || '#8DBA74';
    var helmet = equipped.avatar === 'avatar-helmet';
    var bg = byId[equipped.background] ? byId[equipped.background].asset.style : null;
    var kids = [sv('rect', { x: 0, y: 0, width: 96, height: 96, rx: 14, class: 'rw-av-bg' })];
    if (bg === 'contours') [18, 30, 42, 54].forEach(function (r) { kids.push(sv('ellipse', { cx: 70, cy: 26, rx: r, ry: r * 0.62, class: 'rw-av-contour' })); });
    if (bg === 'ridge') { kids.push(sv('path', { d: 'M0 70 L18 48 L30 60 L48 34 L62 54 L76 40 L96 64 L96 96 L0 96 Z', class: 'rw-av-ridge' })); }
    kids.push(sv('path', { d: 'M18 96 C20 72 32 64 48 64 C64 64 76 72 78 96 Z', fill: jersey }));
    kids.push(sv('path', { d: 'M40 66 L48 76 L56 66', class: 'rw-av-collar' }));
    kids.push(sv('circle', { cx: 48, cy: 42, r: 17, class: 'rw-av-face' }));
    if (helmet) {
      kids.push(sv('path', { d: 'M28 44 C28 26 38 20 48 20 C60 20 69 27 69 41 L69 52 C69 56 66 58 62 58 L58 58 L58 46 L36 46 L34 58 C30 58 28 54 28 50 Z', fill: jersey, class: 'rw-av-helmet' }));
      kids.push(sv('path', { d: 'M37 37 L64 37 L64 46 L37 46 Z', class: 'rw-av-visor' }));
    } else {
      kids.push(sv('path', { d: 'M30 38 C31 25 40 21 48 21 C58 21 66 26 66 37 L30 37 Z', fill: jersey, class: 'rw-av-helmet' }));
      kids.push(sv('path', { d: 'M26 37 L44 37', class: 'rw-av-peak' }));
      kids.push(sv('circle', { cx: 42, cy: 45, r: 1.8, class: 'rw-av-eye' }));
      kids.push(sv('circle', { cx: 55, cy: 45, r: 1.8, class: 'rw-av-eye' }));
    }
    return svg({ viewBox: '0 0 96 96', width: size, height: size, class: 'rw-avatar', role: 'img', 'aria-label': 'Your rider' }, kids);
  }

  function bar(value, max, label, tone) {
    var p = max ? Math.min(100, Math.round(100 * value / max)) : 0;
    return el('div', { class: 'rw-bar' + (tone ? ' rw-bar--' + tone : ''), role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(max), 'aria-valuenow': String(Math.min(value, max)), 'aria-label': label },
      el('span', { style: 'width:' + p + '%' }));
  }

  // ---------- dates ----------
  function dateOf(s) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function addDays(s, n) { var d = dateOf(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
  function dayName(s, fmt) { return dateOf(s).toLocaleDateString('en-US', Object.assign({ timeZone: 'UTC' }, fmt)); }

  // status of one calendar day: done | shield | today | missed | future | none
  function dayStatus(s, d) {
    var row = d.byDate[s];
    if (row && row.done) return 'done';
    if (row && row.shield) return 'shield';
    if (s === d.today) return 'today';
    if (s > d.today) return 'future';
    if (row) return 'missed';
    return s < d.firstDay ? 'none' : 'missed';
  }
  var DAY_WORD = { done: 'goal reached', shield: 'protected by a Trail Shield', today: 'today', missed: 'goal not reached', future: 'still to come', none: 'before you started' };
  var DAY_MARK = { done: '✓', shield: '', today: '', missed: '·', future: '', none: '' };

  function weekCalendar(d) {
    var ul = el('ol', { class: 'rw-week', 'aria-label': 'This week' });
    for (var i = 0; i < 7; i++) {
      var s = addDays(d.week_start, i), st = dayStatus(s, d), row = d.byDate[s];
      var cell = el('li', { class: 'rw-day rw-day--' + st, 'aria-label': dayName(s, { weekday: 'long' }) + ': ' + DAY_WORD[st] + (st === 'today' ? ', ' + d.day.qualifying + ' of ' + d.goal.xp + ' XP' : '') },
        el('span', { class: 'rw-day-name', 'aria-hidden': 'true' }, dayName(s, { weekday: 'short' }).slice(0, 2)),
        el('span', { class: 'rw-day-mark', 'aria-hidden': 'true' }, st === 'shield' ? shield(true) : st === 'today' && !d.day.done
          ? ringFor(d.day.qualifying, d.goal.xp) : DAY_MARK[st]));
      ul.appendChild(cell);
    }
    return ul;
  }
  function ringFor(v, max) {
    var p = Math.min(1, v / Math.max(1, max)), r = 11, c = 2 * Math.PI * r;
    return svg({ viewBox: '0 0 28 28', width: 26, height: 26, class: 'rw-ring' }, [
      sv('circle', { cx: 14, cy: 14, r: r, class: 'rw-ring-bg' }),
      sv('circle', { cx: 14, cy: 14, r: r, class: 'rw-ring-fg', 'stroke-dasharray': (c * p).toFixed(1) + ' ' + c.toFixed(1), transform: 'rotate(-90 14 14)' })]);
  }

  function monthCalendar(d) {
    var first = d.today.slice(0, 8) + '01', month = d.today.slice(0, 7);
    var last = addDays(iso(new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 1))), -1);
    var start = addDays(first, -((dateOf(first).getUTCDay() + 6) % 7)), end = addDays(last, (7 - dateOf(last).getUTCDay()) % 7);
    var grid = el('ol', { class: 'rw-month', 'aria-label': dayName(first, { month: 'long', year: 'numeric' }) });
    ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(function (n) { grid.appendChild(el('li', { class: 'rw-month-head', 'aria-hidden': 'true' }, n)); });
    for (var s = start; s <= end; s = addDays(s, 1)) {
      var inMonth = s.slice(0, 7) === month, st = inMonth ? dayStatus(s, d) : 'none';
      grid.appendChild(el('li', { class: 'rw-mday rw-mday--' + st + (inMonth ? '' : ' rw-mday--out'), 'aria-label': inMonth ? dayName(s, { month: 'long', day: 'numeric' }) + ': ' + DAY_WORD[st] : null, 'aria-hidden': inMonth ? null : 'true' },
        el('span', null, String(+s.slice(8))), st === 'shield' ? shield(true) : null));
    }
    return grid;
  }

  // ---------- sections ----------
  function section(id, title, note) {
    var body = el('div');
    var sec = el('section', { class: 'student-section rw-section', 'aria-labelledby': id },
      el('div', { class: 'wrap' },
        el('div', { class: 'student-section-head' }, el('h2', { class: 'label', id: id }, title), note ? el('p', { class: 'meta' }, note) : null),
        body));
    sec.body = body;
    return sec;
  }

  function streakMessage(d) {
    var st = d.streak, left = Math.max(0, d.goal.xp - d.day.qualifying);
    if (d.day.done) return 'Today’s goal is done. Come back tomorrow to keep it going!';
    if (st.state === 'protectable') return 'You missed yesterday, but a Trail Shield will cover it when you reach today’s goal. ' + left + ' XP to go.';
    if (st.state === 'alive') return 'Only ' + left + ' XP to go to keep your streak!';
    if (st.state === 'reset') return 'Start a new streak today: ' + left + ' XP to go. Your best is ' + S.plural(st.longest, 'day') + '.';
    return 'Reach today’s goal to start your first streak: ' + left + ' XP to go.';
  }

  function riderCard(d) {
    var lv = d.level, next = lv.next, title = (d.equipped.title && d.itemById[d.equipped.title]) ? d.itemById[d.equipped.title].asset.text : lv.title;
    var frame = d.itemById[d.equipped.frame], theme = d.itemById[d.equipped.theme], badge = d.itemById[d.equipped.badge];
    var card = el('article', { class: 'rw-rider' + (frame ? ' rw-rider--' + frame.asset.style : '') + (theme ? ' rw-rider--legend' : '') },
      el('div', { class: 'rw-rider-art' }, avatar(d.items, d.equipped, 112), badge ? el('span', { class: 'rw-rider-plate', title: badge.name }, badge.name) : null),
      el('div', { class: 'rw-rider-body' },
        el('p', { class: 'rw-kicker' }, 'Level ' + lv.level),
        el('h2', { class: 'rw-rider-title' }, title),
        el('p', { class: 'rw-xp' }, el('strong', null, d.xp.toLocaleString()), ' Trail XP'),
        next ? [bar(d.xp - lv.from, next.at - lv.from, 'Progress to level ' + next.level, 'level'),
                el('p', { class: 'rw-meta' }, (next.at - d.xp) + ' XP to Level ' + next.level + ': ' + next.title)]
             : el('p', { class: 'rw-meta' }, 'Top level reached. Legend.')));
    return card;
  }

  function levelTrail(d) {
    var ol = el('ol', { class: 'rw-trail', 'aria-label': 'Rider levels' });
    d.levels.forEach(function (l) {
      var state = l.level < d.level.level ? 'past' : l.level === d.level.level ? 'now' : 'ahead';
      ol.appendChild(el('li', { class: 'rw-trail-stop rw-trail-stop--' + state, 'aria-current': state === 'now' ? 'step' : null },
        el('span', { class: 'rw-trail-dot', 'aria-hidden': 'true' }, String(l.level)),
        el('span', { class: 'rw-trail-name' }, l.title),
        el('span', { class: 'rw-trail-xp' }, l.at.toLocaleString() + ' XP')));
    });
    return ol;
  }

  function streakPanel(d, sb, rerender) {
    var st = d.streak, lit = d.day.done || st.current > 0;
    var shields = el('p', { class: 'rw-shields', 'aria-label': st.shields + ' of ' + st.shields_max + ' Trail Shields' });
    for (var i = 0; i < st.shields_max; i++) shields.appendChild(shield(i < st.shields));
    shields.appendChild(document.createTextNode(' ' + st.shields + ' of ' + st.shields_max + ' Trail Shields'));
    var goalName = (d.goal.options[d.goal.id] || {}).name || 'Daily goal';
    var panel = el('div', { class: 'rw-streak' + (d.justDone && !still ? ' rw-streak--celebrate' : '') },
      el('div', { class: 'rw-streak-main' },
        flame(64, lit),
        el('p', { class: 'rw-streak-count' }, el('strong', null, String(st.current)), el('span', null, st.current === 1 ? 'day streak' : 'day streak')),
        el('p', { class: 'rw-streak-msg' }, streakMessage(d))),
      el('div', { class: 'rw-goal' },
        el('p', { class: 'rw-kicker' }, 'Today’s goal: ' + goalName),
        el('p', { class: 'rw-goal-num' }, el('strong', null, String(Math.min(d.day.qualifying, d.goal.xp))), ' / ' + d.goal.xp + ' XP',
          el('span', { class: 'rw-meta' }, ' · ' + Math.min(100, Math.round(100 * d.day.qualifying / d.goal.xp)) + '%' + (d.day.bonus ? ' · +' + d.day.bonus + ' bonus' : ''))),
        bar(d.day.qualifying, d.goal.xp, 'Today’s goal progress', d.day.done ? 'done' : 'goal'),
        weekCalendar(d),
        shields,
        el('p', { class: 'rw-meta' }, 'A shield covers one missed day automatically. You earn one every ' + S.plural(st.shield_every, 'day') + ' of streak.' +
          (st.next_milestone ? ' Next milestone: ' + S.plural(st.next_milestone, 'day') + '.' : '') + ' Best streak: ' + S.plural(st.longest, 'day') + '.')));
    return panel;
  }

  function goalPicker(d, sb, rerender) {
    var g = d.goal, wrap = el('div', { class: 'rw-goals' });
    var msg = el('p', { class: 'rw-meta', role: 'status' });
    var note = g.locked ? 'Your school sets the daily goal.'
      : g.pending ? 'Changes to ' + g.options[g.pending].name + ' on ' + S.fmtDate(g.pending_from + 'T12:00:00Z', { weekday: 'long', month: 'short', day: 'numeric' }) + '.'
      : !g.can_change && g.next_change ? 'You can change it again on ' + S.fmtDate(g.next_change + 'T12:00:00Z', { month: 'short', day: 'numeric' }) + '.'
      : 'Changes start the next day. You can change once a week.';
    var list = el('div', { class: 'rw-goal-options', role: 'radiogroup', 'aria-label': 'Daily goal' });
    Object.keys(g.options).sort(function (x, y) { return g.options[x].xp - g.options[y].xp; }).forEach(function (k) {
      var o = g.options[k], on = (g.pending || g.id) === k;
      var b = el('button', { type: 'button', class: 'rw-goal-option', role: 'radio', 'aria-checked': on ? 'true' : 'false', disabled: (!g.can_change || g.locked) && !on ? true : null },
        el('span', { class: 'rw-goal-name' }, o.name), el('span', { class: 'rw-goal-xp' }, o.xp + ' XP a day'), el('span', { class: 'rw-goal-desc' }, o.desc));
      b.addEventListener('click', function () {
        if (on || !g.can_change || g.locked) return;
        b.disabled = true;
        sb.rpc('set_daily_goal', { p_goal: k }).then(function (r) {
          if (r.error) { msg.textContent = r.error.message; b.disabled = false; return; }
          rerender();
        });
      });
      list.appendChild(b);
    });
    wrap.appendChild(list);
    wrap.appendChild(el('p', { class: 'rw-meta' }, note));
    wrap.appendChild(msg);
    return wrap;
  }

  var TYPE_WORD = { problem: 'Problem solved', lesson: 'Lesson completed', lab: 'Lab complete', assessment: 'Assessment complete', daily_bonus: 'Daily goal bonus' };
  function xpPanel(d) {
    var list = el('ul', { class: 'rw-ledger' });
    d.recent.forEach(function (r) {
      list.appendChild(el('li', null,
        el('span', { class: 'rw-ledger-xp' + (r.xp ? '' : ' rw-ledger-xp--zero') }, '+' + r.xp),
        el('span', { class: 'rw-ledger-what' }, TYPE_WORD[r.type] || r.type, r.name && r.type !== 'daily_bonus' ? el('small', null, r.name) : null),
        el('span', { class: 'rw-meta' }, S.ago(r.at))));
    });
    return el('div', { class: 'rw-xp-panel' },
      el('ul', { class: 'stat-row' },
        el('li', { class: 'stat' }, el('p', { class: 'stat-label' }, 'Lifetime Trail XP'), el('p', { class: 'stat-value' }, d.xp.toLocaleString())),
        el('li', { class: 'stat' }, el('p', { class: 'stat-label' }, 'Earned today'), el('p', { class: 'stat-value' }, String(d.xp_today)), el('p', { class: 'stat-sub' }, d.day.qualifying + ' toward the goal'))),
      d.recent.length ? list : el('div', { class: 'student-empty' }, el('p', null, 'Your XP will show up here. Solve a problem in any lab to earn your first.')),
      el('p', { class: 'student-note' }, 'How XP works: first correct answer to a problem 5, 7 or 10 XP (easy, standard, challenge); a lab 10; a lesson 20; an assessment 5; reaching the daily goal +5. Wrong answers and hints never cost you anything.'));
  }

  var CATS = { streak: 'Streaks', problems: 'Problem solving', lessons: 'Lessons', exploration: 'Exploration', persistence: 'Persistence' };
  function badges(d) {
    var wrap = el('div');
    Object.keys(CATS).forEach(function (c) {
      var list = d.achievements.filter(function (a) { return a.category === c; });
      if (!list.length) return;
      var ul = el('ul', { class: 'rw-badges' });
      list.forEach(function (a) {
        var got = !!a.unlocked_at, have = a.metric === 'event' ? 0 : Math.min(+d.metrics[a.metric] || 0, a.threshold);
        ul.appendChild(el('li', { class: 'rw-badge' + (got ? ' rw-badge--got' : '') },
          badgeArt(a, got),
          el('p', { class: 'rw-badge-name' }, a.name, el('span', { class: 'visually-hidden' }, got ? ' (unlocked)' : ' (locked)')),
          el('p', { class: 'rw-badge-desc' }, a.description),
          got ? el('p', { class: 'rw-badge-when' }, '✓ ' + S.fmtDate(a.unlocked_at, { month: 'short', day: 'numeric', year: 'numeric' }))
              : a.metric === 'event' ? el('p', { class: 'rw-badge-when' }, 'Locked')
              : [bar(have, a.threshold, a.name + ' progress', 'badge'), el('p', { class: 'rw-badge-when' }, have + ' / ' + a.threshold)]));
      });
      wrap.appendChild(el('h3', { class: 'rw-sub' }, CATS[c] + ' · ' + list.filter(function (a) { return a.unlocked_at; }).length + ' of ' + list.length));
      wrap.appendChild(ul);
    });
    return wrap;
  }

  var SLOT = { avatar: 'Avatar', jersey: 'Jersey', frame: 'Profile frame', background: 'Background', title: 'Rider title', badge: 'Badge', theme: 'Theme' };
  function garage(d, sb, rerender) {
    var wrap = el('div', { class: 'rw-garage' });
    Object.keys(SLOT).forEach(function (type) {
      var items = d.items.filter(function (i) { return i.type === type; });
      if (!items.length) return;
      var ul = el('ul', { class: 'rw-items' });
      items.forEach(function (i) {
        var got = !!i.unlocked_at, on = d.equipped[type] === i.id;
        var how = i.unlock_level ? 'Unlocks at level ' + i.unlock_level : i.unlock_achievement ? 'Unlocks with a badge' : '';
        var btn = got ? el('button', { type: 'button', class: 'rw-equip', 'aria-pressed': on ? 'true' : 'false' }, on ? 'Wearing' : 'Wear') : null;
        if (btn) btn.addEventListener('click', function () {
          btn.disabled = true;
          // Avatars and jerseys always need one; others can be taken off.
          var off = on && type !== 'avatar' && type !== 'jersey';
          if (on && !off) { btn.disabled = false; return; }
          sb.rpc('equip_reward', { p_item: i.id, p_on: !off }).then(function (r) { if (r.error) { btn.disabled = false; return; } rerender(); });
        });
        ul.appendChild(el('li', { class: 'rw-item' + (got ? '' : ' rw-item--locked') + (on ? ' rw-item--on' : '') },
          el('span', { class: 'rw-swatch rw-swatch--' + type, style: i.asset.color ? 'background:' + i.asset.color : null, 'aria-hidden': 'true' }, got ? '' : '🔒'),
          el('p', { class: 'rw-item-name' }, i.name),
          el('p', { class: 'rw-item-desc' }, got ? i.description : how),
          btn));
      });
      wrap.appendChild(el('h3', { class: 'rw-sub' }, SLOT[type]));
      wrap.appendChild(ul);
    });
    wrap.appendChild(el('p', { class: 'student-note' }, 'Everything in the Garage is earned by learning: nothing is for sale, and nothing you unlock is ever taken away.'));
    return wrap;
  }

  function learning(d) {
    var m = d.metrics, s = d.stats;
    return el('ul', { class: 'stat-row' },
      el('li', { class: 'stat' }, el('p', { class: 'stat-label' }, 'Problems solved'), el('p', { class: 'stat-value' }, String(s.problems))),
      el('li', { class: 'stat' }, el('p', { class: 'stat-label' }, 'Lessons completed'), el('p', { class: 'stat-value' }, String(s.lessons))),
      el('li', { class: 'stat' }, el('p', { class: 'stat-label' }, 'MTB labs completed'), el('p', { class: 'stat-value' }, String(s.labs))),
      el('li', { class: 'stat' }, el('p', { class: 'stat-label' }, 'Units explored'), el('p', { class: 'stat-value' }, String(m.units_practiced))),
      el('li', { class: 'stat' }, el('p', { class: 'stat-label' }, 'Courses in progress'), el('p', { class: 'stat-value' }, String(m.courses))),
      el('li', { class: 'stat' }, el('p', { class: 'stat-label' }, 'Goal days'), el('p', { class: 'stat-value' }, String(s.goal_days))));
  }

  function prep(d) {
    d.byDate = {}; d.days.forEach(function (x) { d.byDate[x.date] = x; });
    d.firstDay = d.days.length ? d.days[0].date : d.today;
    d.itemById = {}; d.items.forEach(function (i) { d.itemById[i.id] = i; });
    return d;
  }

  function load(sb) {
    return sb.rpc('rewards_summary', { p_timezone: TZ }).then(function (r) { if (r.error) throw r.error; return prep(r.data); });
  }

  // ---------- the page ----------
  function page(ctx) {
    var main = document.getElementById('student-main'), wasDone = null;
    function draw() {
      return load(ctx.sb).then(function (d) {
        d.justDone = wasDone === false && d.day.done;
        wasDone = d.day.done;
        document.getElementById('student-title').textContent = d.xp ? 'Your ride so far.' : 'Your ride starts here.';
        document.getElementById('student-lede').textContent = 'Level ' + d.level.level + ' · ' + d.level.title + ' · ' + d.xp.toLocaleString() + ' Trail XP · ' +
          (d.streak.current ? '🔥 ' + d.streak.current + '-day streak' : 'no streak yet');
        S.clear(main);
        var top = section('rider-title', 'Rider');
        top.body.appendChild(el('div', { class: 'rw-top' }, riderCard(d), streakPanel(d, ctx.sb, draw)));
        main.appendChild(top);
        var goal = section('goal-title', 'Daily goal', 'Only real learning counts: solving problems, finishing labs, lessons and assessments.');
        goal.body.appendChild(goalPicker(d, ctx.sb, draw));
        main.appendChild(goal);
        var lv = section('levels-title', 'Rider levels');
        lv.body.appendChild(levelTrail(d));
        main.appendChild(lv);
        var xp = section('xp-title', 'Trail XP');
        xp.body.appendChild(xpPanel(d));
        main.appendChild(xp);
        var cal = section('month-title', dayName(d.today, { month: 'long', year: 'numeric' }), 'Days you reached your goal');
        cal.body.appendChild(monthCalendar(d));
        main.appendChild(cal);
        var b = section('badges-title', 'Achievements', d.achievements.filter(function (a) { return a.unlocked_at; }).length + ' of ' + d.achievements.length + ' unlocked');
        b.body.appendChild(badges(d));
        main.appendChild(b);
        var g = section('garage-title', 'The Trail Garage', 'Unlocked items: pick what your rider wears');
        g.body.appendChild(garage(d, ctx.sb, draw));
        main.appendChild(g);
        var lp = section('learning-title', 'Learning progress');
        lp.body.appendChild(learning(d));
        main.appendChild(lp);
        main.hidden = false;
      });
    }
    return draw();
  }

  // Dashboard strip: streak, today's goal and level, linking here.
  function strip(sb, host) {
    return load(sb).then(function (d) {
      var left = Math.max(0, d.goal.xp - d.day.qualifying);
      host.appendChild(el('section', { class: 'student-section rw-strip-wrap', 'aria-label': 'Your rewards' },
        el('div', { class: 'wrap' }, el('a', { class: 'rw-strip', href: 'rewards.html' },
          el('span', { class: 'rw-strip-streak' }, flame(30, d.day.done || d.streak.current > 0), el('strong', null, String(d.streak.current)), el('span', null, ' day streak')),
          el('span', { class: 'rw-strip-goal' },
            el('span', { class: 'rw-meta' }, d.day.done ? 'Today’s goal: done ✓' : 'Today: ' + d.day.qualifying + ' / ' + d.goal.xp + ' XP · ' + left + ' to go'),
            bar(d.day.qualifying, d.goal.xp, 'Today’s goal progress', d.day.done ? 'done' : 'goal')),
          el('span', { class: 'rw-strip-level' }, 'Level ' + d.level.level + ' · ' + d.level.title, el('small', null, d.xp.toLocaleString() + ' Trail XP')),
          el('span', { class: 'rw-strip-go', 'aria-hidden': 'true' }, '→')))));
    }).catch(function () { /* rewards not switched on yet: the dashboard carries on */ });
  }

  window.MathleteRewards = { strip: strip };
  if (document.querySelector('[data-rewards-page]')) {
    S.ready('rewards').then(page).catch(S.fail);
  }
})();
