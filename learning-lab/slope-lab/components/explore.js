// Explore: the Trail Designer (the centerpiece), six challenges, and
// prediction cards. Every number shown comes from logic/slope.js.
import { el, clear, button, frac, v, eq, id } from './dom.js';
import { createProfile } from './profile.js';
import { createGraph } from './graph.js';
import { CHALLENGES, PREDICTIONS, PREDICTION_CHOICES, DESIGNER } from '../content/lessons.js';
import { fmt, rise as riseOf, slopeOf, slopeKind, gradeFromSlope, angleFromSlope, reducedFraction, convertLength, niceRange, clean, close } from '../logic/slope.js';

export function renderExplore(ctx) {
  const P = ctx.progress;
  const page = el('div', { class: 'sl-explore' });
  page.appendChild(el('header', { class: 'sl-section-head' },
    el('p', { class: 'sl-kicker' }, 'Explore'),
    el('h2', { class: 'sl-h2' }, 'Trail Designer'),
    el('p', { class: 'sl-lede' }, 'Set where a trail starts and ends and how far across it goes. Everything else is worked out for you, instantly. Then take on the challenges.')));

  // ---------- state ----------
  let units = P.setting('units') === 'm' ? 'm' : 'ft';
  const lim = () => DESIGNER[units];
  let s = { start: lim().start, end: lim().end, run: lim().run0 };
  let locks = {};                       // { rise: 120 } or { run: 500 } for challenges 4 and 5
  let watch = null;                     // called after every change (challenge tracking)

  // ---------- controls ----------
  function control(key, label, range) {
    const rid = id('r'), nid = id('n');
    const r = el('input', { type: 'range', id: rid, class: 'sl-range', 'aria-label': label });
    const n = el('input', { type: 'number', id: nid, class: 'sl-input sl-input--num', inputmode: 'decimal' });
    const unit = el('span', { class: 'sl-unit' });
    const msg = el('p', { class: 'sl-control-msg', 'aria-live': 'polite' });
    const box = el('div', { class: 'sl-control' }, el('label', { for: nid }, label), el('div', { class: 'sl-control-row' }, r, el('span', { class: 'sl-input-unit' }, n, unit)), msg);
    const apply = (val, from) => {
      const [lo, hi] = range();
      if (!isFinite(val)) { msg.textContent = 'Enter a number.'; return; }
      const clamped = Math.min(hi, Math.max(lo, val));
      msg.textContent = clamped !== val ? `Kept between ${fmt(lo)} and ${fmt(hi)} ${units}.` : '';
      s[key] = clean(clamped);
      if (locks.rise !== undefined && key === 'start') s.end = clean(s.start + locks.rise);
      if (locks.rise !== undefined && key === 'end') s.start = clean(s.end - locks.rise);
      render(from);
    };
    r.addEventListener('input', () => apply(Number(r.value), 'range'));
    n.addEventListener('change', () => apply(Number(n.value), 'number'));
    n.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(Number(n.value), 'number'); } });
    return { box, sync(lockedText) {
      const [lo, hi, step] = range();
      Object.assign(r, { min: lo, max: hi, step }); r.value = s[key];
      Object.assign(n, { min: lo, max: hi, step }); if (document.activeElement !== n) n.value = s[key];
      unit.textContent = units;
      const locked = !!lockedText;
      r.disabled = n.disabled = locked;
      if (locked) msg.textContent = lockedText;
    } };
  }
  const elevRange = () => lim().elev, runRange = () => lim().run;
  const cStart = control('start', 'Starting elevation', elevRange);
  const cEnd = control('end', 'Ending elevation', elevRange);
  const cRun = control('run', 'Horizontal distance (run)', runRange);

  const unitPick = el('div', { class: 'sl-seg', role: 'radiogroup', 'aria-label': 'Units' });
  [['ft', 'Feet'], ['m', 'Metres']].forEach(([u, label]) => {
    const b = button(label, () => setUnits(u), 'sl-btn--quiet');
    b.setAttribute('role', 'radio'); b.dataset.u = u;
    unitPick.appendChild(b);
  });
  function setUnits(u) {
    if (u === units) return;
    // convert the trail itself, so it stays the same trail in new units
    const conv = x => clean(Math.round(convertLength(x, units, u) * 100) / 100);   // 2 decimals: the same trail, not a rounded one
    s = { start: conv(s.start), end: conv(s.end), run: conv(s.run) };
    if (locks.rise !== undefined) locks.rise = clean(s.end - s.start);
    if (locks.run !== undefined) locks.run = s.run;
    units = u; P.setting('units', u);
    render();
  }

  // ---------- outputs ----------
  const profile = createProfile();
  const graph = createGraph({ x: { min: 0, max: 1, step: 1 }, y: { min: 0, max: 1, step: 1 }, scaleNote: true, title: 'Graph of elevation against horizontal distance' });
  const results = el('div', { class: 'sl-results', 'aria-live': 'polite' });
  const viewPick = el('div', { class: 'sl-seg', role: 'group', 'aria-label': 'View' });
  const views = el('div', { class: 'sl-views' }, profile.node, graph.node);
  let view = 'both';
  [['both', 'Both'], ['profile', 'Trail'], ['graph', 'Graph']].forEach(([k, label]) => {
    const b = button(label, () => { view = k; render(); }, 'sl-btn--quiet'); b.dataset.view = k; viewPick.appendChild(b);
  });

  function render() {
    if (locks.run !== undefined) s.run = locks.run;
    const r = riseOf(s.start, s.end), m = slopeOf(r, s.run), k = slopeKind(r, s.run);
    cStart.sync(); cEnd.sync(); cRun.sync(locks.run !== undefined ? `Locked at ${fmt(locks.run)} ${units} for this challenge.` : null);
    if (locks.rise !== undefined) { cEnd.sync(`Moves with the start: the rise is locked at ${fmt(locks.rise)} ${units}.`); }
    [...unitPick.children].forEach(b => b.setAttribute('aria-checked', b.dataset.u === units ? 'true' : 'false'));
    [...viewPick.children].forEach(b => b.setAttribute('aria-pressed', b.dataset.view === view ? 'true' : 'false'));
    profile.node.hidden = view === 'graph'; graph.node.hidden = view === 'profile';

    profile.update({ start: s.start, end: s.end, run: s.run, unit: units });
    const xr = niceRange([0, Math.max(s.run, 1)], { count: 6 }), yr = niceRange([s.start, s.end], { count: 6, pad: 0.08 });
    graph.update({
      x: { ...xr, label: `Horizontal distance x (${units})` }, y: { ...yr, label: `Elevation y (${units})` },
      lines: k === 'undefined' ? [{ vertical: true, x: 0 }] : k === 'none' ? [] : [{ m, b: s.start }],
      points: [{ x: 0, y: s.start, label: 'Start' }, { x: s.run, y: s.end, label: 'End', shape: 'square' }],
      riseRun: k === 'none' ? null : { from: { x: 0, y: s.start }, to: { x: s.run, y: s.end } }
    });

    clear(results);
    const row = (name, ...val) => el('div', { class: 'sl-result' }, el('dt', null, name), el('dd', null, ...val));
    const f = reducedFraction(r, s.run);
    const dl = el('dl', { class: 'sl-result-list' },
      row('Rise', `${fmt(s.end)} − ${fmt(s.start)} = `, el('b', null, `${fmt(r)} ${units}`)),
      row('Run', el('b', null, `${fmt(s.run)} ${units}`)),
      row('Slope', k === 'undefined' ? el('b', null, 'undefined (run is 0)') : k === 'none' ? el('b', null, '— (no change)') :
        el('span', null, v('m'), ' = ', frac(fmt(r), fmt(s.run)), f && f.d !== 1 && (f.n !== r) ? [' = ', frac(fmt(f.n), fmt(f.d))] : null, ' = ', el('b', null, fmt(m, 4)))),
      row('Grade', el('b', null, m === null ? '—' : fmt(gradeFromSlope(m), 2) + '%')),
      row('Angle', m === null ? (k === 'undefined' ? '90° (vertical)' : '—') : `≈ ${fmt(angleFromSlope(m), 1)}° (not the same as the grade)`),
      row('Equation', k === 'undefined' ? el('span', null, 'x = 0 (a vertical line, not a function of x)') : k === 'none' ? '—' :
        el('span', { class: 'sl-mono' }, `y = ${fmt(m, 4)}x ${s.start < 0 ? '−' : '+'} ${fmt(Math.abs(s.start))}`)));
    results.appendChild(dl);
    results.appendChild(el('p', { class: 'sl-note' }, k === 'undefined' ? 'A run of 0 is a cliff, not a trail: you can’t divide by 0, so the slope is undefined.'
      : k === 'none' ? 'Start and end are the same point: there’s no slope to measure.'
      : `${k === 'positive' ? 'Climbing' : k === 'negative' ? 'Descending' : 'Flat'}: every 100 ${units} across, the trail ${k === 'zero' ? 'stays level' : (k === 'positive' ? 'gains ' : 'loses ') + fmt(Math.abs(gradeFromSlope(m)), 2) + ' ' + units}. The equation assumes a constant grade: real trails change grade as they go (here, b = the starting elevation, with x measured from the start).`));
    if (watch) watch();
  }

  const designer = el('section', { class: 'sl-designer', 'aria-label': 'Trail Designer' },
    el('div', { class: 'sl-designer-controls' }, el('div', { class: 'sl-row sl-row--between' }, el('span', { class: 'sl-mini' }, 'Units'), unitPick), cStart.box, cEnd.box, cRun.box, results),
    el('div', { class: 'sl-designer-view' }, el('div', { class: 'sl-row sl-row--between' }, el('span', { class: 'sl-mini' }, 'Show'), viewPick), views,
      el('p', { class: 'sl-note' }, 'The trail picture is drawn to scale. The graph uses whatever scale fits each axis, so read the slope from its numbers, not its look.')));
  page.appendChild(designer);

  // ---------- challenges ----------
  const chSec = el('section', { class: 'sl-challenges', 'aria-labelledby': 'ch-title' }, el('h2', { class: 'sl-h2', id: 'ch-title' }, 'Challenges'));
  const tabs = el('ol', { class: 'sl-ch-tabs' });
  const card = el('div', { class: 'sl-card sl-ch-card' });
  chSec.appendChild(tabs); chSec.appendChild(card);
  page.appendChild(chSec);
  let current = CHALLENGES.find(c => !(P.state.challenges[c.id] && P.state.challenges[c.id].done)) || CHALLENGES[0];

  function drawTabs() {
    clear(tabs);
    CHALLENGES.forEach((c, i) => {
      const done = P.state.challenges[c.id] && P.state.challenges[c.id].done;
      tabs.appendChild(el('li', null, el('button', { type: 'button', class: 'sl-ch-tab' + (done ? ' is-done' : ''), 'aria-current': c === current ? 'step' : null,
        onclick: () => { current = c; openChallenge(); } }, el('span', { class: 'sl-toc-n', 'aria-hidden': 'true' }, done ? '✓' : String(i + 1)), el('span', null, c.title), done ? el('span', { class: 'sl-sr' }, ' (done)') : null)));
    });
  }
  function done(c, detail, text) {
    P.challenge(c.id, detail);
    drawTabs();
    const next = CHALLENGES.find(x => !(P.state.challenges[x.id] && P.state.challenges[x.id].done));
    return el('div', { class: 'sl-feedback sl-feedback--right' }, el('p', null, text),
      next ? button('Next challenge: ' + next.title, () => { current = next; openChallenge(); }, 'sl-btn--primary')
           : el('p', null, 'All six done. ', el('a', { href: '#practice' }, 'Head to Practice →')));
  }
  function choiceBlock(options, answer, onRight, why) {
    const fb = el('div', { 'aria-live': 'polite' });
    const name = id('c');
    const fs = el('fieldset', { class: 'sl-choices' }, el('legend', { class: 'sl-sr' }, 'Choose one'));
    options.forEach(([val, label]) => { const oid = id('o'); fs.appendChild(el('label', { class: 'sl-choice', for: oid }, el('input', { type: 'radio', name, id: oid, value: val }), el('span', null, label))); });
    const go = button('Check', () => {
      const pick = fs.querySelector('input:checked'); clear(fb);
      if (!pick) { fb.appendChild(el('p', { class: 'sl-feedback sl-feedback--info' }, 'Pick an answer first.')); return; }
      if (pick.value === answer) { fs.querySelectorAll('input').forEach(i => { i.disabled = true; }); go.hidden = true; fb.appendChild(onRight()); }
      else fb.appendChild(el('div', { class: 'sl-feedback sl-feedback--wrong' }, el('p', null, 'Not quite. Use the Trail Designer above to test it, then try again.'), why ? el('p', { class: 'sl-concept' }, 'Think about: slope = rise ÷ run.') : null));
    }, 'sl-btn--primary');
    return el('div', null, fs, go, fb);
  }

  function openChallenge() {
    const c = current; locks = {}; watch = null;
    clear(card);
    drawTabs();
    card.appendChild(el('p', { class: 'sl-kicker' }, `Challenge ${CHALLENGES.indexOf(c) + 1} of ${CHALLENGES.length}`));
    card.appendChild(el('h3', { class: 'sl-h3' }, c.title));
    card.appendChild(el('p', null, c.goal));
    const out = el('div', { 'aria-live': 'polite' });
    const was = P.state.challenges[c.id] && P.state.challenges[c.id].done;
    if (was) card.appendChild(el('p', { class: 'sl-done-note' }, '✓ You’ve done this one. Try it again if you like.'));

    const grade = () => gradeFromSlope(slopeOf(riseOf(s.start, s.end), s.run));
    const buildCheck = (target, extra) => button('Check my trail', () => {
      clear(out);
      const g = grade();
      if (extra && extra()) return;
      if (g !== null && Math.abs(g - target) <= 0.25) { out.appendChild(done(c, { grade: g, start: s.start, end: s.end, run: s.run, units }, `Yes: ${fmt(riseOf(s.start, s.end))} ÷ ${fmt(s.run)} = ${fmt(slopeOf(riseOf(s.start, s.end), s.run), 4)}, a ${fmt(g, 2)}% grade.`)); return; }
      const msg = g === null ? 'The run is 0, so there’s no grade at all. Give the trail some horizontal distance.'
        : `Your grade is ${fmt(g, 2)}%. ` + (g > target ? 'Too steep: lower the rise (bring the end down) or make the run longer.' : 'Not steep enough: raise the rise or make the run shorter.') + ` You need rise ÷ run = ${fmt(target / 100)}.`;
      out.appendChild(el('div', { class: 'sl-feedback sl-feedback--wrong' }, el('p', null, msg)));
    }, 'sl-btn--primary');

    if (c.check === 'grade') {
      card.appendChild(el('p', { class: 'sl-note' }, c.tip));
      card.appendChild(buildCheck(c.target));
    } else if (c.check === 'grade-predict') {
      // start from a 10% trail, so the 20% has to be built
      s = { start: lim().start, run: lim().run0, end: clean(lim().start + 0.1 * lim().run0) };
      const after = el('div');
      card.appendChild(choiceBlock(c.predict.options, c.predict.answer, () => {
        P.prediction('c2-predict', 'double', true);
        after.appendChild(el('p', { class: 'sl-feedback sl-feedback--right' }, 'Right. ' + c.predict.why));
        after.appendChild(el('p', null, 'Now build it: make a 20% grade.'));
        after.appendChild(buildCheck(c.target));
        return after;
      }, true));
    } else if (c.check === 'compare') {
      const pair = el('div', { class: 'sl-compare' });
      c.trails.forEach(t => {
        const p = createProfile();
        p.update({ start: 0, end: t.rise, run: t.run, unit: 'ft', show: ['rise', 'run'], title: `${t.name}: rises ${t.rise} ft over ${t.run} ft, drawn to scale.` });
        pair.appendChild(el('figure', { class: 'sl-compare-item' }, el('h4', null, t.name), el('p', null, `Gains ${fmt(t.rise)} ft over ${fmt(t.run)} ft`), p.node));
      });
      card.appendChild(pair);
      card.appendChild(choiceBlock(c.options, c.answer, () => done(c, null, c.why)));
    } else if (c.check === 'vary-run' || c.check === 'vary-rise') {
      const seen = new Set();
      const tried = el('p', { class: 'sl-note', 'aria-live': 'polite' });
      const q = el('div', { hidden: true });
      if (c.check === 'vary-run') { locks.rise = units === 'm' ? clean(Math.round(convertLength(c.lockRise, 'ft', 'm'))) : c.lockRise; s.end = clean(s.start + locks.rise); }
      else { locks.run = units === 'm' ? clean(Math.round(convertLength(c.lockRun, 'ft', 'm'))) : c.lockRun; }
      const key = c.check === 'vary-run' ? 'run' : 'end';
      const log = el('ul', { class: 'sl-tries' });
      watch = () => {
        const g = grade();
        if (!seen.has(s[key]) && g !== null) {
          seen.add(s[key]);
          log.appendChild(el('li', null, `${c.check === 'vary-run' ? 'Run ' + fmt(s.run) : 'Rise ' + fmt(riseOf(s.start, s.end))} ${units} → slope ${fmt(slopeOf(riseOf(s.start, s.end), s.run), 4)} (${fmt(g, 2)}%)`));
          while (log.children.length > 6) log.removeChild(log.firstChild);
        }
        tried.textContent = seen.size >= c.tries ? 'Good. What pattern do you see?' : `Tried ${seen.size} of ${c.tries}. Move the ${c.check === 'vary-run' ? 'horizontal distance' : 'ending elevation'} slider.`;
        q.hidden = seen.size < c.tries;
      };
      card.appendChild(tried); card.appendChild(log);
      q.appendChild(choiceBlock(c.options, c.answer, () => done(c, { tried: [...seen] }, c.why)));
      card.appendChild(q);
    } else if (c.check === 'build') {
      card.appendChild(el('p', { class: 'sl-note' }, c.tip));
      const minRun = units === 'm' ? clean(Math.round(convertLength(c.minRun, 'ft', 'm'))) : c.minRun;
      card.appendChild(buildCheck(c.target, () => {
        if (s.run < minRun) { out.appendChild(el('div', { class: 'sl-feedback sl-feedback--wrong' }, el('p', null, `The trail needs to be at least ${fmt(minRun)} ${units} long horizontally. Yours is ${fmt(s.run)} ${units}.`))); return true; }
        if (riseOf(s.start, s.end) <= 0) { out.appendChild(el('div', { class: 'sl-feedback sl-feedback--wrong' }, el('p', null, 'This should be a climb: make the end higher than the start.'))); return true; }
        return false;
      }));
    }
    card.appendChild(out);
    render();
  }
  drawTabs();

  // ---------- predictions ----------
  const pSec = el('section', { class: 'sl-predictions', 'aria-labelledby': 'pred-title' },
    el('h2', { class: 'sl-h2', id: 'pred-title' }, 'Predict first'),
    el('p', { class: 'sl-lede' }, 'Decide what happens before you see the numbers. Reasoning first makes the calculation mean something.'));
  const pList = el('div', { class: 'sl-pred-list' });
  PREDICTIONS.forEach(p => {
    const box = el('div', { class: 'sl-card sl-pred' }, el('p', null, p.setup), el('p', null, el('b', null, 'What if: '), p.change));
    const fb = el('div', { 'aria-live': 'polite' });
    const prior = P.state.predictions[p.id];
    const row = el('div', { class: 'sl-row' }, PREDICTION_CHOICES.map(([val, label]) => button(label, () => show(val), 'sl-btn--quiet')));
    function show(val) {
      P.prediction(p.id, val, val === p.answer);
      const a = slopeOf(p.before.rise, p.before.run), b = slopeOf(p.after.rise, p.after.run);
      clear(fb);
      fb.appendChild(el('div', { class: 'sl-feedback ' + (val === p.answer ? 'sl-feedback--right' : 'sl-feedback--wrong') },
        el('p', null, val === p.answer ? 'Your prediction was right.' : 'Not this time. Here’s why:'),
        eq('Before: ', frac(fmt(p.before.rise), fmt(p.before.run)), ` = ${fmt(a)} (${fmt(gradeFromSlope(a))}%)`),
        eq('After: ', frac(fmt(p.after.rise), fmt(p.after.run)), ` = ${fmt(b)} (${fmt(gradeFromSlope(b))}%)`),
        el('p', null, close(a, b) ? 'Same slope: rise and run changed by the same factor.' : b > a ? 'The slope went up, so it’s steeper.' : 'The slope went down, so it’s less steep.')));
      [...row.children].forEach(x => { x.disabled = true; });
    }
    box.appendChild(row); box.appendChild(fb);
    if (prior) show(prior.choice);
    pList.appendChild(box);
  });
  pSec.appendChild(pList);
  page.appendChild(pSec);

  openChallenge();
  return page;
}
