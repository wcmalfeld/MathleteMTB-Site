// The Split Report: Mission 1 and 2 interactives (rider timing board, dot
// plot, histogram builder, box plots, median/quartile stepper, the graded
// scatter builder and the outlier investigation). Numbers come from the
// kit's statistics engine; controls are buttons, sliders and typed entry
// (dragging is never required). Settings are kept quietly.

import { el, put, button, id as uid, reducedMotion } from '../../lesson-kit/dom.js';
import { segs, status } from '../../lesson-kit/controls.js';
import { summary, wholeBins, checkBins, sorted, halves, median, mean } from '../../lesson-kit/stats.js';
import { tutorOf } from '../../dream-line-project/components/labs.js';
import { tableEl } from '../../slope-lab/components/figures.js';
import { RIDERS, RIDER_A, RIDER_B, LAPS, LAP_X, LAP_Y, OUTLIER, GRID, SIM_NOTE, DATA_NOTE } from '../logic/data.js';
import { N } from '../logic/questions.js';
import { dotPlotSvg, histogramSvg, boxPlotSvg, scatterPlot, PARTS } from './charts.js';

// Timing numerals that count to their value (instantly with reduced motion).
export function countTo(node, to, d = 2) {
  const from = Number(node.dataset.v || to), t0 = performance.now(), dur = 420;
  node.dataset.v = to;
  if (reducedMotion() || from === to || typeof requestAnimationFrame === 'undefined') { node.textContent = to.toFixed(d); return; }
  const step = t => { const k = Math.min(1, (t - t0) / dur); node.textContent = (from + (to - from) * (1 - Math.pow(1 - k, 3))).toFixed(d); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const tiles = rows => el('div', { class: 'spr-tiles' }, rows.filter(Boolean).map(([k, v, cls]) => el('div', { class: 'spr-tile' + (cls ? ' ' + cls : '') }, el('p', { class: 'spr-tile-k' }, k), el('p', { class: 'spr-tile-v' }, v))));
const VIEW = [{ label: 'Rider A', value: 'a' }, { label: 'Rider B', value: 'b' }, { label: 'Both', value: 'both' }];
const rowsFor = v => (v === 'both' ? RIDERS : RIDERS.filter(r => r.id === v)).map(r => ({ label: r.label, times: r.times, cls: 'is-' + r.id }));

// ------------------------------------------------------------ the practice-time board (Activity 01)
export function riderBoard(ctx) {
  const P = ctx.progress; let view = P.getData('board-view', 'both');
  const box = el('div', { class: 'spr-riders', 'aria-live': 'polite' });
  const cells = {};
  function draw() {
    put(box, (view === 'both' ? RIDERS : RIDERS.filter(r => r.id === view)).map(r => el('section', { class: 'spr-rcard is-' + r.id, 'aria-label': `${r.label}, ${r.name}` },
      el('header', { class: 'spr-rcard-h' }, el('span', { class: 'spr-bib' }, '#' + r.bib), el('span', { class: 'spr-rname' }, `${r.label.toUpperCase()} · ${r.name.toUpperCase()}`)),
      el('ol', { class: 'spr-runs' }, r.times.map((t, i) => { const n = cells[r.id + i] || (cells[r.id + i] = el('span', { class: 'spr-time' })); return el('li', null, el('span', { class: 'spr-run' }, `RUN ${i + 1}`), n, el('span', { class: 'spr-unit' }, 's')); })))));
    for (const r of RIDERS) r.times.forEach((t, i) => cells[r.id + i] && countTo(cells[r.id + i], t));
    P.setData('board-view', view, true);
  }
  for (const r of RIDERS) r.times.forEach((t, i) => { cells[r.id + i] = el('span', { class: 'spr-time', 'data-v': String(t - 3) }); });
  draw();
  return el('div', null, segs('Show', VIEW, view, v => { view = v; draw(); }), box, el('p', { class: 'ls-small' }, DATA_NOTE));
}

// ------------------------------------------------------------ the dot plot (Activity 01), with an explore copy
export function dotPlot(ctx) {
  const P = ctx.progress;
  let st = { view: 'both', sel: null, explore: false, copy: RIDER_B.times.slice(), ...(P.getData('dots', {}) || {}) };
  const fig = el('div', { class: 'ms-figure' }), out = el('div', { 'aria-live': 'polite' }), tin = el('input', { class: 'ls-input spr-num', inputmode: 'decimal', id: uid('dt'), 'aria-label': 'A time to add, in seconds' });
  function draw() {
    const rows = st.explore ? [{ label: 'Rider B copy', times: st.copy, cls: 'is-b is-sim' }] : rowsFor(st.view);
    put(fig, dotPlotSvg(rows, { sel: st.sel, onDot: (ri, i) => { st.sel = [ri, i]; draw(); }, label: st.explore ? 'Simulation: an editable copy of Rider B’s times' : undefined }));
    const r = st.sel && rows[st.sel[0]], t = r && r.times[st.sel[1]];
    put(out, r && t !== undefined ? el('p', { class: 'ms-live-eq' }, st.explore ? `Selected: ${t} s` : `${r.label}, run ${st.sel[1] + 1}: ${t} s`) : el('p', { class: 'ls-small' }, 'Select a dot (tap, or Tab then Enter) to see its run and time.'),
      st.explore ? el('div', null, tiles([['Runs', String(st.copy.length)], ['Mean', st.copy.length ? N(mean(st.copy), 2) + ' s' : '—'], ['Median', st.copy.length ? N(median(st.copy), 2) + ' s' : '—']]),
        el('p', { class: 'ls-small' }, SIM_NOTE + ' Add a very slow run and watch the mean move more than the median.')) : null);
    P.setData('dots', st, true);
  }
  const add = () => { const v = Number(String(tin.value).replace(/[−–]/g, '-')); if (isFinite(v) && v >= 56 && v <= 78 && st.copy.length < 14) { st.copy.push(Math.round(v)); st.sel = null; draw(); } tin.value = ''; };
  const ctl = el('div', null, segs('Mode', [{ label: 'Team data', value: false }, { label: 'Explore copy', value: true }], st.explore, v => { st.explore = v; st.sel = null; draw(); exp.hidden = !v; view.hidden = v; }));
  const view = segs('Show', VIEW, st.view, v => { st.view = v; st.sel = null; draw(); });
  const exp = el('div', { class: 'spr-explore' }, el('label', { for: tin.id }, 'Add a run (56–78 s): '), tin, button('Add', add, 'ls-btn--quiet'),
    button('Remove selected', () => { if (st.sel) { st.copy.splice(st.sel[1], 1); st.sel = null; draw(); } }, 'ls-btn--quiet'), button('Reset copy', () => { st.copy = RIDER_B.times.slice(); st.sel = null; draw(); }, 'ls-btn--quiet'));
  exp.hidden = !st.explore; view.hidden = st.explore;
  draw();
  return el('div', null, ctl, view, exp, fig, out);
}

// ------------------------------------------------------------ the histogram builder (Activity 01)
export const BIN_SETUPS = [
  { id: 'w5', name: 'Width 5 from 58 (the team’s bins)', bins: [[58, 62], [63, 67], [68, 72], [73, 77]] },
  { id: 'w3', name: 'Width 3 from 58', bins: [[58, 60], [61, 63], [64, 66], [67, 69], [70, 72], [73, 75], [76, 78]] },
  { id: 'w10', name: 'Width 10 from 55', bins: [[55, 64], [65, 74], [75, 84]] },
  { id: 'overlap', name: '58–63, 63–68, 68–73, 73–78', bins: [[58, 63], [63, 68], [68, 73], [73, 78]] },
  { id: 'gaps', name: '58–61, 63–66, 68–71, 73–76', bins: [[58, 61], [63, 66], [68, 71], [73, 76]] }
];
export function histogramLab(ctx) {
  const P = ctx.progress;
  let st = { view: 'both', setup: 'w5', ...(P.getData('hist', {}) || {}) };
  const fig = el('div', { class: 'ms-figure' }), out = el('div', { 'aria-live': 'polite' });
  function draw() {
    const S = BIN_SETUPS.find(b => b.id === st.setup), bins = S.bins.map(([from, to]) => ({ from, to })), all = [...RIDER_A.times, ...RIDER_B.times], chk = checkBins(bins, all);
    if (!chk.ok) { put(fig, el('div', { class: 'spr-hist-bad' }, el('p', { class: 'ms-live-eq' }, S.name))); put(out, status(false, '', chk.message + ' Choose another bin setup.')); P.setData('hist', st, true); return; }
    const series = (st.view === 'both' ? RIDERS : RIDERS.filter(r => r.id === st.view)).map(r => ({ label: r.label, cls: 'is-' + r.id, bins: bins.map(b => ({ ...b, count: r.times.filter(t => t >= b.from && t <= b.to).length })) }));
    put(fig, histogramSvg(series));
    put(out, status(true, 'Equal widths, no gaps, no overlaps: every time is counted exactly once.', ''), series.length > 1 ? el('p', { class: 'ls-small' }, 'Rider A’s bars are solid; Rider B’s are striped.') : null,
      tableEl(bins.map((b, i) => [`${b.from}–${b.to}`, ...series.map(se => String(se.bins[i].count))]), ['Bin (s)', ...series.map(se => se.label)]));
    P.setData('hist', st, true);
  }
  draw();
  return el('div', null, segs('Show', VIEW, st.view, v => { st.view = v; draw(); }), segs('Bin setup', BIN_SETUPS.map(b => ({ label: b.name, value: b.id })), st.setup, v => { st.setup = v; draw(); }), fig, out);
}

// ------------------------------------------------------------ box plots and the median/quartile stepper (Activity 01)
export function boxPlotLab(ctx) {
  const P = ctx.progress;
  let st = { sel: null, ...(P.getData('box', {}) || {}) };
  const fig = el('div', { class: 'ms-figure' }), out = el('div', { 'aria-live': 'polite' });
  function draw() {
    const rows = rowsFor('both');
    put(fig, boxPlotSvg(rows, { sel: st.sel, onPart: (ri, k) => { st.sel = [ri, k]; draw(); } }));
    const r = st.sel && RIDERS[st.sel[0]], S = r && summary(r.times), name = st.sel && PARTS.find(p => p[0] === st.sel[1])[1];
    put(out, r ? el('p', { class: 'ms-live-eq' }, `${r.label} · ${name}: ${N(S[st.sel[1]])} s`) : el('p', { class: 'ls-small' }, 'Select a marker under a box to name that part.'),
      tableEl(RIDERS.map(x => { const s = summary(x.times); return [x.label, N(s.min), N(s.q1), N(s.median), N(s.q3), N(s.max)]; }), ['Rider', 'Min', 'Q1', 'Median', 'Q3', 'Max']),
      el('p', { class: 'ls-small' }, 'The box is the middle 50% of runs (Q1 to Q3): its width is the IQR. A narrow box means consistent riding.'));
    P.setData('box', st, true);
  }
  draw();
  return el('div', null, fig, out);
}
export function statStepper(ctx) {
  const P = ctx.progress;
  let st = { rider: 'b', step: 0, ...(P.getData('stepper', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' });
  const STEPS = ['Sort the times', 'Find the middle pair', 'Split into halves', 'Find Q1 and Q3', 'Range and IQR'];
  function draw() {
    const r = RIDERS.find(x => x.id === st.rider), s = sorted(r.times), S = summary(r.times), { lower, upper } = halves(r.times), n = s.length;
    const chips = (arr, mark) => el('div', { class: 'spr-chips' }, arr.map((v, i) => el('span', { class: 'spr-chip' + (mark && mark(i) ? ' is-mid' : '') }, String(v))));
    const lines = [];
    lines.push(chips(st.step >= 0 ? s : r.times, st.step >= 1 ? i => i === n / 2 - 1 || i === n / 2 : null));
    if (st.step >= 1) lines.push(el('p', { class: 'ms-mono' }, `Median = (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${N(S.median)}`));
    if (st.step >= 2) lines.push(el('div', { class: 'spr-halves' }, el('div', null, el('p', { class: 'spr-tlab' }, 'Lower half'), chips(lower, i => i === 1 || i === 2)), el('div', null, el('p', { class: 'spr-tlab' }, 'Upper half'), chips(upper, i => i === 1 || i === 2))));
    if (st.step >= 3) lines.push(el('p', { class: 'ms-mono' }, `Q1 = (${lower[1]} + ${lower[2]}) ÷ 2 = ${N(S.q1)}   Q3 = (${upper[1]} + ${upper[2]}) ÷ 2 = ${N(S.q3)}`));
    if (st.step >= 4) lines.push(el('p', { class: 'ms-mono' }, `Range = ${S.max} − ${S.min} = ${N(S.range)}   IQR = ${N(S.q3)} − ${N(S.q1)} = ${N(S.iqr)}`));
    put(box, ...lines, el('ol', { class: 'spr-stepper' }, STEPS.map((t, i) => el('li', { class: i < st.step ? 'is-done' : i === st.step ? 'is-now' : '' }, t))),
      el('div', { class: 'ls-actions' }, st.step < STEPS.length - 1 ? button('Next step', () => { st.step += 1; draw(); }, 'ls-btn--primary') : null, st.step ? button('Start again', () => { st.step = 0; draw(); }, 'ls-btn--quiet') : null));
    P.setData('stepper', st, true);
  }
  draw();
  return el('div', null, segs('Rider', [{ label: 'Rider A', value: 'a' }, { label: 'Rider B', value: 'b' }], st.rider, v => { st = { rider: v, step: 0 }; draw(); }), box, el('p', { class: 'ls-small' }, 'Quartiles here always use the median of halves.'));
}

// ------------------------------------------------------------ the scatter plot builder (Activity 02, graded: type 'scatter')
export function scatterBuilder(ctx, id, Q, o = {}) {
  const P = ctx.progress, key = o.key || null, dk = 'sc:' + id;
  let pts = P.getData(dk, []), sel = null, misses = 0, full = false;
  const rec = () => P.question(id, key) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const done = () => P.done(id, key), save = () => P.setData(dk, pts, true);
  const fig = el('div', { class: 'ms-figure spr-sb-fig' }), tbl = el('div'), fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' }), hintsEl = el('ol', { class: 'ls-hints' }), actions = el('div', { class: 'ls-actions' });
  const say = (tone, ...ps) => { fb.className = 'ls-fb ls-fb--' + tone; put(fb, ps.filter(Boolean).map(p => el('p', null, p))); };
  const match = p => Q.targets.findIndex(t => t.x === p.x && t.y === p.y);
  const xi = el('input', { class: 'ls-input mt-xy', id: uid('sx'), inputmode: 'decimal', 'aria-label': 'Practice laps (x)' }), yi = el('input', { class: 'ls-input mt-xy', id: uid('sy'), inputmode: 'decimal', 'aria-label': 'Sector time (y)' });
  function place(x, y) {
    if (done()) return;
    if (!isFinite(x) || !isFinite(y)) { say('info', 'Type two numbers: laps and time.'); return; }
    const p = { x: Math.round(x), y: Math.round(y) };
    if (p.x < GRID.x[0] || p.x > GRID.x[1] || p.y < GRID.y[0] || p.y > GRID.y[1]) { say('info', `That’s off this graph: laps run ${GRID.x[0]} to ${GRID.x[1]}, times ${GRID.y[0]} to ${GRID.y[1]} s.`); return; }
    if (sel !== null) { pts[sel] = p; } else { if (pts.some(q => q.x === p.x && q.y === p.y)) return; if (pts.length >= Q.targets.length + 2) { say('info', 'That’s plenty of points: select one to move it, or remove one.'); return; } pts.push(p); }
    const m = match(p);
    say(m >= 0 ? 'right' : 'info', m >= 0 ? `✓ ${Q.targets[m].name}: (${p.x}, ${p.y}) is plotted correctly.` : `(${p.x}, ${p.y}) doesn’t match any rider in the table. Select it and move it.`);
    sel = null; save(); draw();
  }
  function check() {
    const T = Q.targets, ok = T.every(t => pts.some(p => p.x === t.x && p.y === t.y)) && pts.length === T.length;
    const ans = pts.map(p => `(${p.x}, ${p.y})`).join(' ');
    if (ok) { P.attempt(id, key, ans, true, { code: 'correct', prompt: Q.prompt, correctAnswer: Q.solution }); ctx.refresh(); say('right', 'Right: all ten riders are plotted.', Q.solution); draw(); return; }
    const wrong = pts.filter(p => match(p) < 0);
    let code = 'plot-error', msg = `${T.length - (pts.length - wrong.length)} rider${T.length - (pts.length - wrong.length) === 1 ? '' : 's'} still to place correctly.`;
    if (wrong.some(p => T.some(t => t.x === p.y && t.y === p.x))) { code = 'swap-xy'; msg = 'A point has laps and time swapped: laps go across, time goes up.'; }
    else if (pts.length > T.length) msg = 'There are extra points: remove any that don’t match a rider.';
    misses += 1; P.attempt(id, key, ans, false, { code, prompt: Q.prompt, correctAnswer: Q.solution }); ctx.refresh(); say('wrong', msg); draw();
  }
  function draw() {
    const D = done(), showAll = D && full;
    const p = scatterPlot({ set: { x: [], y: [], xLabel: 'Number of practice laps' }, x: GRID.x, y: GRID.y, xStep: 1, yStep: 2, label: Q.prompt, extra: pl => {
      const list = showAll || (D && rec().correct) ? Q.targets.map(t => ({ x: t.x, y: t.y })) : pts;
      list.forEach((q, i) => {
        const m = match(q), on = sel === i;
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', pl.X(q.x)); c.setAttribute('cy', pl.Y(q.y)); c.setAttribute('r', 7.5);
        c.setAttribute('class', 'spr-pt ' + (m >= 0 ? 'is-ok' : 'is-bad') + (on ? ' is-on' : ''));
        if (!D) { c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); c.setAttribute('aria-label', `Point (${q.x}, ${q.y})${m >= 0 ? ', ' + Q.targets[m].name : ', not a rider'}; select to move`); c.setAttribute('aria-pressed', String(on));
          const pickIt = e => { e.stopPropagation(); sel = sel === i ? null : i; draw(); };
          c.addEventListener('click', pickIt);
          c.addEventListener('keydown', e => { const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (e.key === 'Enter' || e.key === ' ') pickIt(e); else if (mv) { e.preventDefault(); sel = i; place(q.x + mv[0], q.y + mv[1]); setTimeout(() => { const n = fig.querySelectorAll('.spr-pt')[i]; if (n) n.focus(); }, 0); } }); }
        pl.node.append(c);
      });
    } });
    if (!D) p.node.addEventListener('click', e => { const r = p.node.getBoundingClientRect(); place(p.invX((e.clientX - r.left) * p.W / r.width), p.invY((e.clientY - r.top) * p.H / r.height)); });
    p.node.classList.add('is-pick');
    put(fig, p.node);
    const hl = sel !== null && pts[sel] ? match(pts[sel]) : -1;
    put(tbl, el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table spr-sbt' }, el('thead', null, el('tr', null, ['Rider', 'Practice laps (x)', 'Sector time (y)', 'Plotted'].map(h => el('th', { scope: 'col' }, h)))),
      el('tbody', null, Q.targets.map((t, i) => { const got = D && rec().correct || pts.some(q => q.x === t.x && q.y === t.y); return el('tr', { class: (i === hl ? 'is-hl' : '') + (got ? ' is-got' : '') }, el('td', null, t.name), el('td', { class: 'ms-mono' }, String(t.x)), el('td', { class: 'ms-mono' }, String(t.y)), el('td', null, got ? '✓' : '—')); })))));
    const T = tutorOf(P), hs = T.hints ? Q.hints : [], r = rec();
    put(hintsEl, hs.slice(0, r.hints).map((h, i) => el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    put(actions, D ? button(full ? 'Hide the complete graph' : 'Reveal the complete graph', () => { full = !full; draw(); }, 'ls-btn--quiet') : [button('Check my scatter plot', check, 'ls-btn--primary'),
      sel !== null ? button('Remove selected point', () => { pts.splice(sel, 1); sel = null; save(); draw(); }, 'ls-btn--quiet') : null,
      pts.length ? button('Clear', () => { pts = []; sel = null; save(); draw(); }, 'ls-btn--quiet') : null,
      hs.length && r.hints < hs.length ? button(r.hints ? `Next hint (${hs.length - r.hints} left)` : 'Get a hint', () => { P.hint(id, key); draw(); }, 'ls-btn--quiet') : null,
      T.reveal || misses >= 2 || (hs.length && r.hints >= hs.length) ? button('Show the solution', () => { P.reveal(id, key); pts = Q.targets.map(t => ({ x: t.x, y: t.y })); save(); ctx.refresh(); say('info', 'Here’s where every rider goes.', Q.solution); draw(); }, 'ls-btn--quiet') : null]);
  }
  if (done()) say(rec().correct ? 'right' : 'info', rec().correct ? 'You’ve plotted all ten riders.' : 'You looked at the solution for this one.', Q.solution);
  draw();
  const typeRow = el('div', { class: 'mt-type' }, el('span', { class: 'ls-small' }, 'Or type a point:'), '(', xi, ',', yi, ')',
    button('Place point', () => { place(Number(xi.value), Number(yi.value)); xi.value = yi.value = ''; xi.focus(); }, 'ls-btn--quiet'));
  return el('div', { class: 'ls-card ms-ask spr-sb', 'data-q': id }, el('p', { class: 'ls-kicker' }, o.kicker || 'Plot it · ' + Q.level), el('p', { class: 'ls-prompt' }, Q.prompt),
    el('div', { class: 'spr-sb-grid' }, fig, tbl), typeRow, el('p', { class: 'ls-small' }, 'Select a point to move it: tap the graph again, type new coordinates, or use the arrow keys.'), actions, hintsEl, fb);
}

// ------------------------------------------------------------ investigate the outlier (Activity 02)
export function outlierLab(ctx) {
  const P = ctx.progress;
  let st = { hide: false, sel: OUTLIER, ...(P.getData('outlier', {}) || {}) };
  const fig = el('div', { class: 'ms-figure' }), out = el('div', { 'aria-live': 'polite' });
  function draw() {
    put(fig, scatterPlot({ set: { x: LAP_X, y: LAP_Y, xLabel: 'Number of practice laps' }, x: GRID.x, y: GRID.y, xStep: 1, yStep: 2, hide: st.hide ? [OUTLIER] : [], highlight: st.sel, flag: OUTLIER }).node);
    const R = LAPS[st.sel];
    put(out, el('div', { class: 'spr-pick' }, LAPS.map((r, i) => button(`${r.rider.replace('Rider ', 'R')}`, () => { st.sel = i; draw(); }, 'ls-btn--quiet' + (st.sel === i ? ' is-on' : ''), { 'aria-pressed': String(st.sel === i), 'aria-label': r.rider }))),
      st.hide && st.sel === OUTLIER ? el('p', { class: 'ls-small' }, 'Rider 8 is hidden right now.') : el('p', { class: 'ms-live-eq' }, `${R.rider}: ${R.practiceLaps} laps, ${R.sectorTimeSeconds} s${st.sel === OUTLIER ? ' (flagged: investigate)' : ''}`),
      el('p', { class: 'ls-small' }, st.hide ? 'Without Rider 8, the nine points form a tight downward band. Hiding it is an experiment: the record stays in the official data.' : 'With Rider 8, one point sits well above the downward band. Unusual isn’t the same as invalid.'));
    P.setData('outlier', st, true);
  }
  draw();
  return el('div', null, segs('Rider 8', [{ label: 'Show', value: false }, { label: 'Hide (experiment)', value: true }], st.hide, v => { st.hide = v; draw(); }), fig, out);
}
