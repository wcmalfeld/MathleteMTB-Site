// Race-Day Workshop interactives. Each returns an element; every number
// shown comes from logic/models.js. Sliders are native range inputs (so
// keyboard and screen readers work), paired with live readouts; settings
// are kept in the workshop's progress (getData / setData) so they survive
// a reload.

import { el, put, button, id as uid, reducedMotion } from '../../lesson-kit/dom.js';
import { sagReading, PRD, raceRun, minutes, clock, survey, surveyCheck, radicalCandidates, radicalTest, SAG_RANGE } from '../logic/models.js';
import { nf } from '../logic/questions.js';
import { shockDiagram, sagBar, toleranceLine, gaugeP, stageMap, timeBudget, surveyTriangle } from './visuals.js';

const r1 = x => nf(Math.round(x * 10) / 10);
const r2 = x => nf(Math.round(x * 100) / 100);

function slider({ label, min, max, step, value, unit, onInput, describe }) {
  const sid = uid('s');
  const out = el('output', { class: 'ls-out', for: sid });
  const input = el('input', { type: 'range', id: sid, class: 'ls-range', min, max, step, value });
  const sync = () => { out.textContent = nf(+input.value) + (unit ? ' ' + unit : ''); input.setAttribute('aria-valuetext', describe ? describe(+input.value) : out.textContent); };
  input.addEventListener('input', () => { sync(); onInput(+input.value); });
  sync();
  return { node: el('div', { class: 'ls-control' }, el('div', { class: 'ls-control-top' }, el('label', { for: sid }, label), out), input,
    el('div', { class: 'ls-range-ends', 'aria-hidden': 'true' }, el('span', null, nf(min) + (unit ? ' ' + unit : '')), el('span', null, nf(max) + (unit ? ' ' + unit : '')))), input, set(v) { input.value = v; sync(); } };
}
function segs(label, items, value, onPick) {
  const box = el('div', { class: 'ls-segs', role: 'radiogroup', 'aria-label': label });
  const draw = cur => put(box, items.map(it => el('button', { type: 'button', role: 'radio', class: 'ls-seg', 'aria-checked': String(it.value === cur), onclick: () => { draw(it.value); onPick(it.value); } }, it.label)));
  draw(value);
  return box;
}
const status = (ok, yes, no) => el('span', { class: 'rd-status ' + (ok ? 'rd-status--ok' : 'rd-status--warn') }, el('span', { 'aria-hidden': 'true' }, ok ? '✓ ' : '! '), ok ? yes : no);

// ------------------------------------------------------------ sag calculator
export function sagCalculator(ctx) {
  const P = ctx.progress;
  let st = P.getData('sag', { stroke: PRD.stroke, sag: 12 });
  const pic = el('div', { class: 'rd-figure' }), bar = el('div', { class: 'rd-figure' });
  const table = el('tbody'), eq = el('p', { class: 'rd-live-eq', 'aria-live': 'polite' });
  const sl = slider({ label: 'Measured sag s', min: 8, max: 25, step: 0.5, value: st.sag, unit: 'mm', onInput: v => { st.sag = v; draw(true); },
    describe: v => `${nf(v)} mm, ${r1(sagReading(v, st.stroke).pct)}% of the stroke` });
  const strokePick = segs('Total shock stroke', [{ label: '60 mm', value: 60 }, { label: '80 mm', value: 80 }], st.stroke, v => { st.stroke = v; draw(false); });
  function draw(quiet) {
    const r = sagReading(st.sag, st.stroke);
    put(pic, shockDiagram(r)); put(bar, sagBar(r));
    put(table, [['Total shock stroke T', `${r.stroke} mm`], ['Measured sag s', `${nf(r.sag)} mm`], ['Sag percentage p', `${r2(r.pct)}%`],
      ['Required range', `${r.lo}–${r.hi}% (${r2(r.minMm)}–${r2(r.maxMm)} mm)`]].map(([k, v]) => el('tr', null, el('th', { scope: 'row' }, k), el('td', { class: 'rd-mono' }, v))),
      el('tr', null, el('th', { scope: 'row' }, 'Status'), el('td', null, status(r.within, 'Within range', r.side === 'low' ? 'Outside: too little sag' : 'Outside: too much sag'))));
    put(eq, el('span', null, 'p = s ÷ T × 100 = '), el('span', { class: 'rd-in' }, nf(r.sag)), ' ÷ ', el('span', { class: 'rd-in' }, String(r.stroke)), ' × 100 = ', el('b', { class: r.within ? 'rd-ok' : 'rd-warn' }, r2(r.pct) + '%'));
    P.setData('sag', st, quiet);
  }
  draw(true);
  return el('div', { class: 'rd-lab' },
    el('div', { class: 'rd-lab-visual' }, pic, bar),
    el('div', { class: 'rd-lab-panel' },
      el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Total shock stroke T'), strokePick),
      sl.node, eq,
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table rd-readout' }, el('caption', { class: 'ls-sr' }, 'Live sag readings'), table)),
      el('p', { class: 'ls-small' }, 'Green is the 25–30% window. This is a practice shock: real setups vary by bike and shock, so always follow the manufacturer’s guide.')));
}

// ------------------------------------------------------------ tolerance gauge
export function toleranceGauge(ctx) {
  const P = ctx.progress, mid = (SAG_RANGE.lo + SAG_RANGE.hi) / 2, tol = (SAG_RANGE.hi - SAG_RANGE.lo) / 2;
  let p = P.getData('gauge', 31);
  const pic = el('div', { class: 'rd-figure rd-figure--drag' }), read = el('div', { class: 'rd-gauge-read', 'aria-live': 'polite' });
  const sl = slider({ label: 'Measured sag percentage p', min: 20, max: 35, step: 0.1, value: p, unit: '%', onInput: v => { p = v; draw(true); },
    describe: v => `${r1(v)}%, ${r1(Math.abs(v - mid))} points from the target` });
  function draw(quiet) {
    const dev = Math.abs(p - mid), ok = dev <= tol + 1e-9;
    put(pic, toleranceLine(p, mid, tol, ok));
    put(read,
      el('p', { class: 'rd-live-eq' }, '|p − 27.5| = |', el('span', { class: 'rd-in' }, r1(p)), ' − 27.5| = ', el('b', null, r1(dev))),
      el('p', { class: 'rd-live-eq' }, el('b', null, r1(dev)), ok ? ' ≤ 2.5 ' : ' > 2.5 ', status(ok, 'acceptable', 'outside the tolerance')),
      el('p', { class: 'ls-small' }, p < mid ? `${r1(dev)} below the target.` : p > mid ? `${r1(dev)} above the target.` : 'Right on the target.', ' Absolute value keeps the distance and drops the direction.'));
    P.setData('gauge', p, quiet);
  }
  // Drag the marker along the line (pointer); the slider does the same by keyboard.
  let dragging = false;
  const fromEvent = e => { const svgEl = pic.querySelector('svg'); if (!svgEl) return; const b = svgEl.getBoundingClientRect(); const x = (e.clientX - b.left) * 620 / b.width;
    p = Math.round(Math.min(35, Math.max(20, gaugeP(x))) * 10) / 10; sl.set(p); draw(true); };
  pic.addEventListener('pointerdown', e => { dragging = true; pic.setPointerCapture && pic.setPointerCapture(e.pointerId); fromEvent(e); });
  pic.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
  pic.addEventListener('pointerup', () => { dragging = false; P.setData('gauge', p); });
  draw(true);
  return el('div', { class: 'rd-lab rd-lab--stack' }, pic, el('div', { class: 'rd-lab-panel rd-lab-panel--row' }, sl.node, read));
}

// ------------------------------------------------------------ race clock
export function raceClock(ctx) {
  const P = ctx.progress, stage = PRD.stage;
  let v = P.getData('race', 14), at = 1, anim = null;
  const map = el('div', { class: 'rd-figure' }), budget = el('div', { class: 'rd-figure' });
  const timer = el('p', { class: 'rd-timer', 'aria-hidden': 'true' }), table = el('tbody'), eq = el('p', { class: 'rd-live-eq', 'aria-live': 'polite' });
  const sl = slider({ label: 'Section 2 average speed v', min: 8, max: 30, step: 0.5, value: v, unit: 'km/h', onInput: x => { v = x; stop(); at = 1; draw(true); },
    describe: x => { const r = raceRun(stage, x); return `${nf(x)} km/h: total ${clock(r.time)}, ${r.meets ? 'target met' : 'target missed'}`; } });
  const ride = button('▶ Ride the stage', () => play(), 'ls-btn--primary');
  function draw(quiet) {
    const r = raceRun(stage, v);
    put(map, stageMap(r, at)); put(budget, timeBudget(r));
    timer.textContent = clock(at * r.time);
    put(table, [['Section 1', `${nf(r.d1)} km at ${nf(r.v1)} km/h`, clock(r.t1)], ['Section 2', `${nf(r.d2)} km at ${nf(v)} km/h`, clock(r.t2)],
      ['Total', `${nf(r.total)} km`, clock(r.time)]].map(([a, b, c]) => el('tr', null, el('th', { scope: 'row' }, a), el('td', null, b), el('td', { class: 'rd-mono' }, c))),
      el('tr', null, el('th', { scope: 'row' }, 'Overall average'), el('td', { class: 'rd-mono' }, `${r2(r.avg)} km/h`), el('td', null, status(r.meets, `Target ${nf(r.target)} km/h met`, `Below ${nf(r.target)} km/h`))));
    put(eq, '1/12 + 3/', el('span', { class: 'rd-in' }, nf(v)), ' = ', r2(minutes(r.t1)), ' + ', r2(minutes(r.t2)), ' = ', el('b', { class: r.meets ? 'rd-ok' : 'rd-warn' }, r2(minutes(r.time)) + ' min'), ` (allowed: ${nf(minutes(r.tTarget))} min)`);
    P.setData('race', v, quiet);
  }
  function stop() { if (anim) cancelAnimationFrame(anim); anim = null; ride.disabled = false; }
  function play() {
    if (reducedMotion()) { at = 1; draw(true); return; }       // no animation: jump to the finish
    stop(); ride.disabled = true;
    const t0 = performance.now(), dur = 3600;
    const step = now => { at = Math.min(1, (now - t0) / dur); draw(true); if (at < 1) anim = requestAnimationFrame(step); else stop(); };
    anim = requestAnimationFrame(step);
  }
  ctx.cleanup(stop);
  draw(true);
  return el('div', { class: 'rd-lab' },
    el('div', { class: 'rd-lab-visual' }, el('div', { class: 'rd-timer-row' }, el('span', { class: 'ls-mini-label' }, 'Race clock'), timer), map, budget),
    el('div', { class: 'rd-lab-panel' }, sl.node, el('div', { class: 'ls-actions' }, ride), eq,
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table rd-readout' }, el('caption', { class: 'ls-sr' }, 'Stage times'), table)),
      el('p', { class: 'ls-small' }, 'The rider moves by the clock: slower sections take longer, which is why the two speeds can’t just be averaged.')));
}

// ------------------------------------------------------------ trail survey
export function surveyLab(ctx) {
  const P = ctx.progress;
  let st = P.getData('survey', { a: PRD.survey.a, c: PRD.survey.c, up: true });
  const pic = el('div', { class: 'rd-figure' }), steps = el('ol', { class: 'rd-steps', 'aria-live': 'polite' });
  const slA = slider({ label: 'Horizontal distance a', min: 20, max: 200, step: 1, value: st.a, unit: 'm', onInput: x => { st.a = x; draw(true); } });
  const slC = slider({ label: 'Straight-line distance c', min: 20, max: 250, step: 1, value: st.c, unit: 'm', onInput: x => { st.c = x; draw(true); } });
  const dir = segs('Which way does the trail go?', [{ label: 'Uphill (+h)', value: true }, { label: 'Downhill (−h)', value: false }], st.up, x => { st.up = x; draw(false); });
  function draw(quiet) {
    const v = survey(st.a, st.c);
    put(pic, surveyTriangle(v, st.up));
    const li = (...k) => el('li', null, ...k);
    put(steps,
      li('√(', el('span', { class: 'rd-in' }, String(st.a)), '² + h²) = ', el('span', { class: 'rd-in' }, String(st.c))),
      li('Square both sides: h² = ', String(st.c), '² − ', String(st.a), '² = ', el('b', null, nf(v.h2))),
      v.real ? li('h = ±√', nf(v.h2), ' = ', el('b', { class: 'rd-ok' }, '±' + r2(v.rise) + ' m')) : li(el('b', { class: 'rd-warn' }, 'No real solution: '), 'h² can’t be negative. The straight line must be at least as long as the horizontal distance.'),
      v.real ? li(st.up ? `Uphill: B is ${r2(v.rise)} m higher than A (h = +${r2(v.rise)}).` : `Downhill: B is ${r2(v.rise)} m lower than A (h = −${r2(v.rise)}).`, ` Average grade ${r1(v.grade * 100)}%.`) : null,
      v.real ? li('Check: √(', String(st.a), '² + ', r2(v.rise), '²) = ', r2(Math.sqrt(st.a ** 2 + v.rise ** 2)), surveyCheck(st.a, st.c, st.up ? v.rise : -v.rise) ? ' ✓' : ' ✗') : null);
    P.setData('survey', st, quiet);
  }
  draw(true);
  return el('div', { class: 'rd-lab' },
    el('div', { class: 'rd-lab-visual' }, pic),
    el('div', { class: 'rd-lab-panel' }, slA.node, slC.node, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Direction'), dir), steps,
      el('p', { class: 'ls-small' }, 'A simplified profile: one straight line from A to B. Real trails wind, so the riding distance is longer.')));
}

// ------------------------------------------------------------ algebra debugger
export function algebraDebugger(ctx) {
  const P = ctx.progress, { m, n } = PRD.radical, cands = radicalCandidates(m, n);
  const tested = P.getData('debug', {});
  const rows = el('tbody');
  function draw() {
    put(rows, cands.map(q => {
      const r = radicalTest(m, n, q), done = tested[q];
      return el('tr', null, el('th', { scope: 'row' }, 'q = ' + nf(q)),
        el('td', { class: 'rd-mono' }, done ? `√(${nf(q)} + ${m}) = √${nf(r.inside)} = ${nf(r.left)}` : '—'),
        el('td', { class: 'rd-mono' }, done ? `${nf(q)} − ${n} = ${nf(r.right)}` : '—'),
        el('td', null, done ? status(r.valid, 'True: a real solution', 'False: extraneous') : button('Test it', () => { tested[q] = true; P.setData('debug', tested); draw(); }, 'ls-btn--quiet')));
    }));
  }
  draw();
  return el('div', { class: 'rd-console' },
    el('p', { class: 'rd-console-h' }, el('span', { class: 'rd-blink', 'aria-hidden': 'true' }, '▮'), ' TRAIL-MAP CONSOLE · candidate check'),
    el('p', { class: 'rd-live-eq' }, `√(q + ${m}) = q − ${n}`),
    el('p', { class: 'ls-small' }, 'q is a practice variable with no units: this is algebra only, not a trail measurement. Test each candidate in the ORIGINAL equation.'),
    el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('caption', { class: 'ls-sr' }, 'Candidate tests'),
      el('thead', null, el('tr', null, ['Candidate', 'Left side', 'Right side', 'Result'].map(h => el('th', { scope: 'col' }, h)))), rows)));
}
