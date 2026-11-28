// The Split Report: Mission 3 and 4 interactives (the correlation explorer,
// the outlier experiment, career spotlights, the line-fitting tool, the
// prediction tool, the residual visualizer and the race briefing). Every r,
// line, prediction and residual is computed by the kit's statistics engine
// from the points on screen; nothing is typed in.

import { el, put, button, id as uid } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { dragY } from '../../lesson-kit/plot.js';
import { pearson, generated, regression, predict, residual, sse, isExtrapolation } from '../../lesson-kit/stats.js';
import { tableEl } from '../../slope-lab/components/figures.js';
import { LAPS, LAP_X, LAP_Y, OUTLIER, GRID, EXPLORER, EXPLORER_SEED, EXPLORER_N, SIM_NOTE, CAREERS, REFS, MODEL_NOTE } from '../logic/data.js';
import { N, signed, eqText, MODEL, R_ALL, R_NINE } from '../logic/questions.js';
import { scatterPlot } from './charts.js';

// ------------------------------------------------------------ generated relationships (Activity 03)
// Points in display units (x 0–10, y 0–10); r is computed from them, so a linear rescale can't change it.
export function explorerPoints(preset) {
  if (preset.curve) return Array.from({ length: EXPLORER_N }, (_, i) => { const x = -1 + 2 * i / (EXPLORER_N - 1); return { x: 5 + 4.5 * x, y: 1 + 8 * x * x }; });
  return generated(preset.rho, EXPLORER_N, EXPLORER_SEED).map(p => ({ x: 5 + 1.6 * p.x, y: 5 + 1.6 * p.y }));
}
const rOf = pts => pearson(pts.map(p => p.x), pts.map(p => p.y));
// Words for what a plot looks like. These describe the picture; they're not universal cut-offs.
export function describeR(r) {
  const a = Math.abs(r), dir = a < 0.15 ? 'no clear direction' : r > 0 ? 'positive (rising)' : 'negative (falling)';
  const look = a >= 0.8 ? 'the points cluster closely around a line' : a >= 0.5 ? 'a clear but looser linear trend' : a >= 0.2 ? 'a weak trend with lots of scatter' : 'little or no straight-line pattern';
  return `${dir}: ${look}`;
}
function corrPlot(pts, label) {
  return scatterPlot({ set: { x: pts.map(p => p.x), y: pts.map(p => p.y), xLabel: 'Variable x (simulated)' }, yLabel: 'Variable y (simulated)', x: [0, 10], y: [0, 10], xStep: 2, yStep: 2, label }).node;
}
export function corrExplorer(ctx) {
  const P = ctx.progress;
  let st = { k: 0, preds: {}, rho: -0.6, showR: false, ...(P.getData('corr', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' }), own = el('div', { 'aria-live': 'polite' });
  const save = () => P.setData('corr', st, true);
  function draw() {
    const pr = EXPLORER[st.k], pts = explorerPoints(pr), r = rOf(pts), got = st.preds[pr.id] || {};
    const pick = (field, items) => segs(field === 'dir' ? 'Predict the direction' : 'Predict the strength', items, got[field] || null, v => { st.preds[pr.id] = { ...got, [field]: v }; save(); draw(); });
    const ready = got.dir && got.str;
    const truthDir = Math.abs(r) < 0.15 ? 'none' : r > 0 ? 'pos' : 'neg', truthStr = Math.abs(r) >= 0.7 ? 'strong' : 'weak';
    put(box, el('div', { class: 'ms-figure' }, corrPlot(pts, `${pr.name}: ${EXPLORER_N} simulated points`)),
      el('p', { class: 'spr-tlab' }, 'Predict first'), pick('dir', [{ label: 'Positive', value: 'pos' }, { label: 'Negative', value: 'neg' }, { label: 'No direction', value: 'none' }]),
      pick('str', [{ label: 'Strong', value: 'strong' }, { label: 'Weak or none', value: 'weak' }]),
      ready ? el('div', null, el('p', { class: 'ms-live-eq' }, `r = ${N(r, 2)}`), el('p', null, `${pr.name}: ${describeR(r)}.`),
        status(got.dir === truthDir && got.str === truthStr, 'Your reading matches the coefficient.', `Compare: r = ${N(r, 2)} says ${truthDir === 'none' ? 'no clear direction' : truthDir === 'pos' ? 'positive' : 'negative'} and ${truthStr === 'strong' ? 'strong' : 'weak or none'}.`),
        pr.curve ? el('p', { class: 'ls-small' }, 'A clear curve, yet r is near 0: r only measures straight-line patterns.') : null)
        : el('p', { class: 'ls-small' }, 'Make both predictions to reveal the calculated r.'),
      el('p', { class: 'ls-small' }, SIM_NOTE));
    save();
  }
  function drawOwn() {
    const pts = explorerPoints({ rho: st.rho }), r = rOf(pts);
    put(own, el('div', { class: 'ms-figure' }, corrPlot(pts, 'Your generated relationship')),
      st.showR ? el('p', { class: 'ms-live-eq' }, `r = ${N(r, 2)}`) : el('p', { class: 'ls-small' }, 'r is hidden: decide what you think it is, then show it.'),
      el('p', null, describeR(r) + '.'), el('p', { class: 'ls-small' }, 'Strength words depend on context; there’s no universal cut-off. ' + SIM_NOTE));
    save();
  }
  draw(); drawOwn();
  return el('div', null, segs('Relationship', EXPLORER.map((p, i) => ({ label: p.name, value: i })), st.k, v => { st.k = v; draw(); }), box,
    el('p', { class: 'spr-tlab' }, 'Explore: generate your own'),
    slider({ label: 'Direction and strength', min: -1, max: 1, step: 0.05, value: st.rho, format: v => N(v, 2), describe: v => `setting ${N(v, 2)}`, onInput: v => { st.rho = v; drawOwn(); } }).node,
    segs('Correlation coefficient', [{ label: 'Hide r', value: false }, { label: 'Show r', value: true }], st.showR, v => { st.showR = v; drawOwn(); }), own);
}

// ------------------------------------------------------------ the outlier experiment (Activity 03)
export function rExperiment(ctx) {
  const P = ctx.progress; let hide = !!P.getData('rexp', false);
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const xs = LAP_X.filter((_, i) => !hide || i !== OUTLIER), ys = LAP_Y.filter((_, i) => !hide || i !== OUTLIER), r = pearson(xs, ys);
    put(box, el('div', { class: 'ms-figure' }, scatterPlot({ set: { x: LAP_X, y: LAP_Y, xLabel: 'Number of practice laps' }, x: GRID.x, y: GRID.y, xStep: 1, yStep: 2, hide: hide ? [OUTLIER] : [], flag: OUTLIER }).node),
      el('p', { class: 'ms-live-eq' }, `r = ${N(r, 2)}  (${xs.length} riders)`),
      tableEl([['All ten riders', N(R_ALL, 2)], ['Without Rider 8', N(R_NINE, 2)]], ['Dataset', 'Correlation coefficient']),
      el('p', { class: 'ls-small' }, 'A sensitivity experiment, not a deletion: the full dataset stays official unless there’s evidence a record is invalid.'));
    P.setData('rexp', hide, true);
  }
  draw();
  return el('div', null, segs('Rider 8', [{ label: 'Included', value: false }, { label: 'Hidden', value: true }], hide, v => { hide = v; draw(); }), box);
}

// ------------------------------------------------------------ career spotlights
export function careerCard(id, extra) {
  const C = CAREERS.find(c => c.id === id);
  return el('aside', { class: 'spr-career' }, el('p', { class: 'spr-career-k' }, 'Career spotlight'), el('p', { class: 'spr-career-n' }, C.name), el('p', null, C.does), el('p', { class: 'ls-small' }, el('b', null, 'Math: '), C.math), extra || null);
}
export const refLinks = idx => el('ul', { class: 'spr-refs' }, idx.map(i => el('li', null, el('a', { href: REFS[i][1], target: '_blank', rel: 'noopener' }, REFS[i][0]))));

// ------------------------------------------------------------ the line-fitting tool (Activity 04)
export function lineFitter(ctx) {
  const P = ctx.progress;
  let st = { b: -0.6, a: 74, res: false, ls: false, ...(P.getData('fit', {}) || {}) };
  const fig = el('div', { class: 'ms-figure spr-drag' }), out = el('div', { 'aria-live': 'polite' }); let last = null;
  const mine = () => ({ slope: st.b, intercept: st.a });
  function draw() {
    const lines = [{ line: mine(), cls: 'spr-mine' }, ...(st.ls ? [{ line: MODEL, cls: 'spr-fit' }] : [])];
    last = scatterPlot({ set: { x: LAP_X, y: LAP_Y, xLabel: 'Number of practice laps' }, x: GRID.x, y: GRID.y, xStep: 1, yStep: 2, lines, residuals: st.res ? mine() : null,
      label: `Your line ${eqText(mine())} over the ten riders` + (st.ls ? `, with the least-squares line ${eqText(MODEL)}` : '') });
    put(fig, last.node);
    const yours = sse(mine(), LAP_X, LAP_Y), best = sse(MODEL, LAP_X, LAP_Y), above = LAP_X.filter((x, i) => residual(mine(), x, LAP_Y[i]) > 0).length;
    put(out, el('p', { class: 'ms-live-eq' }, `Your line: ${eqText(mine())}`),
      el('p', { class: 'ls-small' }, `${above} points above your line, ${10 - above} below. Total squared miss: ${N(yours, 1)}${st.ls ? ` (least squares: ${N(best, 1)}, the smallest possible)` : ''}.`),
      st.ls ? el('p', { class: 'ms-live-eq spr-fit-t' }, `Least-squares line: ${eqText(MODEL)}`) : null);
    P.setData('fit', st, true);
  }
  const sb = slider({ label: 'Slope', min: -3, max: 0.5, step: 0.1, value: st.b, format: v => N(v, 1), onInput: v => { st.b = Number(v.toFixed(1)); draw(); } });
  const sa = slider({ label: 'Vertical position (intercept)', min: 60, max: 95, step: 0.1, value: st.a, unit: 's', onInput: v => { st.a = Number(v.toFixed(1)); draw(); } });
  // drag: the line follows the pointer up and down (through the centre of the data, x = 5.5); the slope slider tilts it
  dragY(fig, () => last, y => { st.a = Math.max(60, Math.min(95, Number((y - st.b * 5.5).toFixed(1)))); sa.set(st.a); draw(); });
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, out), el('div', { class: 'ms-lab-panel' }, sb.node, sa.node,
    segs('Residuals', [{ label: 'Hidden', value: false }, { label: 'Show my residuals', value: true }], st.res, v => { st.res = v; draw(); }),
    segs('Least-squares line', [{ label: 'Hidden', value: false }, { label: 'Reveal', value: true }], st.ls, v => { st.ls = v; draw(); }),
    el('p', { class: 'ls-small' }, 'Drag up or down on the graph to move your line, and tilt it with the slope slider. Aim to follow the overall trend, not every point.')));
}

// ------------------------------------------------------------ the prediction tool (Activity 04)
export function predictionTool(ctx) {
  const P = ctx.progress; let x = P.getData('predx', 6);
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const y = predict(MODEL, x), ext = isExtrapolation(MODEL, x);
    const p = scatterPlot({ set: { x: LAP_X, y: LAP_Y, xLabel: 'Number of practice laps' }, x: [0, 14], y: [55, 80], xStep: 1, yStep: 5, line: MODEL, band: MODEL.xRange,
      label: `Prediction at ${x} laps: ${N(y)} seconds${ext ? ', an extrapolation outside the observed 1 to 10 laps' : ''}`,
      extra: pl => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', pl.X(x)); c.setAttribute('cy', pl.Y(y)); c.setAttribute('r', 8); c.setAttribute('class', 'spr-pred' + (ext ? ' is-ext' : '')); pl.node.append(c); } });
    const act = LAPS.find(r => r.practiceLaps === x);
    put(box, el('div', { class: 'ms-figure' }, p.node), el('p', { class: 'ms-mono' }, `ŷ = 78.4 − 1.4(${x}) = 78.4 − ${N(1.4 * x)} = ${N(y)} s`),
      ext ? status(false, '', `Extrapolation: ${x} laps is outside the observed range (1 to 10 laps). The pattern may not continue, so treat this cautiously.`) : status(true, 'Inside the observed range (shaded): an interpolation.', ''),
      act ? el('p', { class: 'ls-small' }, `${act.rider} actually did ${x} laps in ${act.sectorTimeSeconds} s: residual ${signed(act.sectorTimeSeconds - y)} s.`) : null);
    P.setData('predx', x, true);
  }
  draw();
  return el('div', null, slider({ label: 'Practice laps', min: 0, max: 14, step: 1, value: x, onInput: v => { x = v; draw(); } }).node, box);
}

// ------------------------------------------------------------ the residual visualizer (Activity 04)
export function residualViz(ctx) {
  const P = ctx.progress; let sel = P.getData('ressel', OUTLIER), table = false;
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const R = LAPS[sel], yh = predict(MODEL, R.practiceLaps), r = residual(MODEL, R.practiceLaps, R.sectorTimeSeconds);
    put(box, el('div', { class: 'ms-figure' }, scatterPlot({ set: { x: LAP_X, y: LAP_Y, xLabel: 'Number of practice laps' }, x: GRID.x, y: GRID.y, xStep: 1, yStep: 2, line: MODEL, residuals: MODEL, highlight: sel,
      label: `Residuals from ${eqText(MODEL)}; ${R.rider} selected` }).node),
      el('p', { class: 'ls-small' }, 'Solid lines with + are positive residuals (slower than predicted); dashed lines with − are negative (faster).'),
      el('div', { class: 'spr-pick' }, LAPS.map((x, i) => button(x.rider.replace('Rider ', 'R'), () => { sel = i; draw(); }, 'ls-btn--quiet' + (sel === i ? ' is-on' : ''), { 'aria-pressed': String(sel === i), 'aria-label': x.rider }))),
      el('div', { class: 'spr-tiles' }, [['Rider', R.rider], ['Actual', `${R.sectorTimeSeconds} s`], ['Predicted', `${N(yh)} s`], ['Residual', `${signed(r)} s`]].map(([k, v]) => el('div', { class: 'spr-tile' }, el('p', { class: 'spr-tile-k' }, k), el('p', { class: 'spr-tile-v' }, v)))),
      el('p', null, Math.abs(r) < 0.05 ? 'Right on the prediction.' : `${R.rider} was ${N(Math.abs(r))} seconds ${r < 0 ? 'faster' : 'slower'} than the model predicted${Math.abs(r) > 5 ? ': a relatively large residual that deserves a closer look. The model can’t explain what happened.' : '.'}`),
      button(table ? 'Hide the residual table' : 'Show the residual table', () => { table = !table; draw(); }, 'ls-btn--quiet'),
      table ? tableEl(LAPS.map(x => { const p = predict(MODEL, x.practiceLaps); return [String(x.practiceLaps), String(x.sectorTimeSeconds), N(p), signed(x.sectorTimeSeconds - p)]; }), ['Practice laps', 'Actual time', 'Predicted time', 'Residual']) : null);
    P.setData('ressel', sel, true);
  }
  draw();
  return box;
}

// ------------------------------------------------------------ the race briefing (Activity 04 final task)
export const BRIEFING = [
  ['brief-1', 'Consistency: compare Riders A and B.', 'Rider A was more consistent than Rider B because their interquartile range was smaller (2 s against 9.5 s).'],
  ['brief-2', 'The relationship between practice laps and sector time.', 'Practice laps and sector time showed a negative association: riders with more laps tended to have lower times.'],
  ['brief-3', 'What the correlation coefficient tells us.', `r ≈ ${N(R_ALL, 2)}: a fairly strong negative linear relationship, though it doesn’t prove that practice causes faster times.`],
  ['brief-4', 'The line of best fit and what its slope means.', 'ŷ = 78.4 − 1.4x: about 1.4 seconds lower predicted time for each additional practice lap, on average, in this sample.'],
  ['brief-5', 'One prediction and its residual.', 'For six laps the model predicts 70 s; the actual time was 67 s, a residual of −3 s (3 s faster than predicted).'],
  ['brief-6', 'One limitation or caution.', 'Rider 8’s large residual should be investigated, and predictions outside 1 to 10 laps are extrapolations.']
];
export function briefing(ctx) {
  const P = ctx.progress;
  const fields = BRIEFING.map(([id, prompt]) => { const tid = uid('b'), ta = el('textarea', { id: tid, class: 'ls-textarea', rows: 2 }); ta.value = P.written(id); ta.addEventListener('change', () => { P.write(id, ta.value); count(); }); return el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: tid }, prompt), ta); });
  const note = el('p', { class: 'ls-small', 'aria-live': 'polite' });
  const count = () => { const n = BRIEFING.filter(([id]) => P.written(id).trim()).length; note.textContent = `${n} of 6 parts written. They’ll appear in your Race Intelligence Report.`; };
  count();
  return el('div', { class: 'ls-card ms-ask dl-written' }, el('p', { class: 'ls-kicker' }, 'Race briefing · not auto-marked'), ...fields, note,
    el('details', { class: 'ms-explain' }, el('summary', null, 'Compare with a strong briefing'), el('ol', null, BRIEFING.map(b => el('li', null, b[2])))),
    el('p', { class: 'ls-small' }, MODEL_NOTE));
}
export { regression };
