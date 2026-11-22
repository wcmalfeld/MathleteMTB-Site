// Trail XP celebrations inside the learning tools.
//
// js/progress.js loads this the first time an answer or a finished session
// is saved for a signed-in student, and calls check() after each save. It
// asks the database what just happened (rewards_feed(), supabase/rewards.sql)
// and shows a small, non-blocking card: "+7 XP", the day's goal progress,
// "Daily goal reached", a level-up or a new badge. The browser never works
// out XP itself; it only shows what the server awarded.
//
// Self-contained (its own styles, prefixed mtx-) so it fits inside any lab.
// Never throws, respects reduced motion, and wrong answers never show here.
(function () {
  'use strict';
  if (window.MathleteRewardsLive) return;
  var A = window.MathleteAuth;
  var KEY = 'mathlete-rewards-last';
  var loadedAt = Date.now();
  var last = null, busy = false, again = false, host = null, timer = null, pending = [];
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROOT = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/js\/rewards-live\.js(\?.*)?$/, '') : '';
  })();

  function read() { try { var v = +sessionStorage.getItem(KEY); return v > 0 ? v : null; } catch (e) { return null; } }
  function write(v) { try { sessionStorage.setItem(KEY, String(v)); } catch (e) { /* private mode */ } }

  function css() {
    if (document.getElementById('mtx-style')) return;
    var st = document.createElement('style');
    st.id = 'mtx-style';
    st.textContent = [
      '.mtx-host{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none;font-family:"Public Sans",-apple-system,BlinkMacSystemFont,sans-serif}',
      '.mtx-card{pointer-events:auto;min-width:220px;max-width:320px;padding:12px 14px 12px 12px;display:grid;grid-template-columns:36px 1fr auto;gap:2px 10px;align-items:center;background:#1E2622;color:#ECEFE7;border:1px solid rgba(236,239,231,.18);border-left:3px solid #8DBA74;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:opacity .25s ease,transform .25s ease}',
      '.mtx-card.mtx-in{opacity:0;transform:translateY(10px)}',
      '.mtx-card--goal{border-left-color:#E36A40}.mtx-card--level{border-left-color:#C9A764}.mtx-card--badge{border-left-color:#86B6D4}',
      '.mtx-icon{grid-row:span 2;width:36px;height:36px}',
      '.mtx-title{margin:0;font:800 18px/1.1 "Big Shoulders Display","Arial Narrow",sans-serif;letter-spacing:.02em;text-transform:uppercase}',
      '.mtx-text{margin:0;font-size:13px;line-height:1.35;color:#D3DACF}',
      '.mtx-bar{grid-column:2/4;height:6px;margin-top:6px;background:rgba(236,239,231,.12);border-radius:3px;overflow:hidden}',
      '.mtx-bar span{display:block;height:100%;background:#8DBA74;border-radius:3px}',
      '.mtx-x{grid-row:1;grid-column:3;align-self:start;background:none;border:0;color:#A8B4AA;font-size:18px;line-height:1;cursor:pointer;padding:0 0 0 6px}',
      '.mtx-x:focus-visible{outline:2px solid #E36A40;outline-offset:2px}',
      '.mtx-card a{color:#ECEFE7}',
      '@media (prefers-reduced-motion:reduce){.mtx-card{transition:none}}',
      '@media (max-width:480px){.mtx-host{left:12px;right:12px;bottom:12px;align-items:stretch}.mtx-card{max-width:none}}'
    ].join('');
    document.head.appendChild(st);
  }

  var NS = 'http://www.w3.org/2000/svg';
  var ICONS = {
    xp: [['path', 'M18 4 L22 14 L33 14 L24 21 L27 32 L18 25 L9 32 L12 21 L3 14 L14 14 Z', '#8DBA74']],
    goal: [['path', 'M18 3 C24 11 28 14 28 21 A10 10 0 0 1 8 21 C8 16 11 13 13 9 C14 14 16 15 18 15 C17 10 17 6 18 3 Z', '#E36A40'], ['path', 'M18 18 C21 22 22 24 22 26 A4 4 0 0 1 14 26 C14 24 16 21 18 18 Z', '#F3C26B']],
    level: [['path', 'M3 30 L13 14 L19 22 L24 15 L33 30 Z', '#C9A764'], ['path', 'M24 15 L24 5 L31 8 L24 10', '#ECEFE7']],
    badge: [['circle', '18,14,10', '#86B6D4'], ['path', 'M12 22 L9 33 L18 28 L27 33 L24 22', '#86B6D4']],
    shield: [['path', 'M18 3 L31 8 C31 20 26 28 18 33 C10 28 5 20 5 8 Z', '#86B6D4']]
  };
  function icon(kind) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 36 36'); svg.setAttribute('class', 'mtx-icon'); svg.setAttribute('aria-hidden', 'true');
    (ICONS[kind] || ICONS.xp).forEach(function (p) {
      var e = document.createElementNS(NS, p[0]);
      if (p[0] === 'circle') { var c = p[1].split(','); e.setAttribute('cx', c[0]); e.setAttribute('cy', c[1]); e.setAttribute('r', c[2]); }
      else e.setAttribute('d', p[1]);
      e.setAttribute('fill', p[2]);
      svg.appendChild(e);
    });
    return svg;
  }
  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function show(kind, title, text, bar) {
    css();
    if (!host) {
      host = mk('div', 'mtx-host');
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    var card = mk('div', 'mtx-card mtx-card--' + kind + (still ? '' : ' mtx-in'));
    var x = mk('button', 'mtx-x', '×');
    x.type = 'button'; x.setAttribute('aria-label', 'Dismiss');
    x.addEventListener('click', function () { card.remove(); });
    card.appendChild(icon(kind));
    card.appendChild(mk('p', 'mtx-title', title));
    card.appendChild(x);
    if (text) card.appendChild(mk('p', 'mtx-text', text));
    if (bar) {
      var b = mk('div', 'mtx-bar'), f = mk('span');
      f.style.width = Math.min(100, Math.round(100 * bar[0] / Math.max(1, bar[1]))) + '%';
      b.setAttribute('role', 'img'); b.setAttribute('aria-label', bar[0] + ' of ' + bar[1] + ' XP toward today’s goal');
      b.appendChild(f); card.appendChild(b);
    }
    while (host.children.length >= 3) host.firstChild.remove();
    host.appendChild(card);
    if (!still) requestAnimationFrame(function () { requestAnimationFrame(function () { card.classList.remove('mtx-in'); }); });
    setTimeout(function () { if (card.isConnected) { card.classList.add('mtx-in'); setTimeout(function () { card.remove(); }, still ? 0 : 260); } }, kind === 'xp' ? 3800 : 6500);
  }

  var CHEERS = ['Nice work!', 'Solved it!', 'Sharp riding.', 'That’s the line.', 'Clean.'];
  // Several answers saved together become one "+XP" card.
  function present(notices) {
    var xp = 0, latest = null, other = [];
    notices.forEach(function (n) {
      if (n.kind === 'xp') { xp += n.payload.xp || 0; latest = n.payload; }
      else other.push(n);
    });
    if (xp > 0) {
      var t = latest.type, text;
      if (t === 'lesson') text = 'Lesson completed! ';
      else if (t === 'lab') text = 'Lab complete! You took the math out on the trail. ';
      else if (t === 'assessment') text = 'Assessment complete. ';
      else text = CHEERS[Math.floor(Math.random() * CHEERS.length)] + ' ';
      var left = latest.target - latest.today;
      text += left > 0 ? latest.today + ' / ' + latest.target + ' XP today · ' + left + ' to go' : 'Today’s goal: done.';
      show('xp', '+' + xp + ' Trail XP', text, [latest.today, latest.target]);
    }
    other.forEach(function (n) {
      var p = n.payload || {};
      if (n.kind === 'goal') show('goal', 'Daily goal reached!', '🔥 ' + p.streak + '-day streak' + (p.bonus ? ' · +' + p.bonus + ' bonus XP' : '') + '. See you tomorrow.');
      else if (n.kind === 'level') show('level', 'Level ' + p.level + ': ' + p.title, p.items && p.items.length ? 'Unlocked: ' + p.items.map(function (i) { return i.name; }).join(', ') + ' in your Trail Garage.' : 'New rider level!');
      else if (n.kind === 'achievement') show('badge', 'Badge: ' + p.name, p.description);
      else if (n.kind === 'shield_used') show('shield', 'Trail Shield used', 'It covered the day you missed. Your ' + p.streak + '-day streak lives on.');
      else if (n.kind === 'shield_earned') show('shield', 'Trail Shield earned', 'For your ' + p.streak + '-day streak. It protects one missed day.');
    });
  }

  function check() {
    if (!A || !A.configured || !A.hasStoredSession()) return Promise.resolve();
    if (busy) { again = true; return Promise.resolve(); }
    busy = true;
    var first = last === null;
    if (first) last = read();
    return A.client().then(function (sb) {
      return sb.rpc('rewards_feed', { p_after: last || 0 });
    }).then(function (res) {
      if (!res || res.error || !res.data) return;
      var list = res.data.notices || [];
      // A first look in a fresh tab only shows what happened on this page.
      if (first && !read()) list = list.filter(function (n) { return new Date(n.at).getTime() > loadedAt - 15000; });
      if (res.data.last) { last = res.data.last; write(last); }
      if (list.length) present(list);
    }).catch(function () { /* rewards are a bonus: never get in the way */ })
      .then(function () { busy = false; if (again) { again = false; return check(); } });
  }

  window.MathleteRewardsLive = { check: check, root: ROOT };
})();
