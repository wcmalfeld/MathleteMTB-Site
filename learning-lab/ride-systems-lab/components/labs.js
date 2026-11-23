// Ride Systems Lab interactives. Each returns an element; every number shown
// comes from logic/models.js. Every graph has a paired slider (keyboard and
// screen readers) as well as pointer dragging. Settings are kept in the
// lab's progress (getData / setData) so they survive a reload.

import { el, put, button, reducedMotion } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { TRAIL, RELATIVE, BASE, BASE_GEAR, BASE_DRIVE, FRONT_TEETH, REAR_TEETH, CADENCE, CIRCUMFERENCE, drivetrain,
  transform, sameTransform, transformEquation, describeTransform, crossing, CROSSING, round, nf } from '../logic/models.js';
import { plot, dragX, dragY } from '../../lesson-kit/plot.js';
import { drivetrainDrawing, trailMap } from './visuals.js';

const r2 = x => nf(round(x, 2)), r3 = x => nf(round(x, 3));
const ELEV = { x: [0, 3], y: [2380, 2570], xLabel: 'Distance along trail d (km)', yLabel: 'Elevation E(d) (m)', xStep: 0.5, yStep: 20, xDigits: 1 };
const profileSeries = (P, cls) => ({ points: P.points, cls });
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const snap = (v, step) => Math.round(v / step) * step;

// ------------------------------------------------------------ GPS Trail Explorer
export function trailExplorer(ctx) {
  const P = ctx.progress;
  let d = P.getData('explore', 1.25);
  const fig = el('div', { class: 'ms-figure ms-figure--drag' }), map = el('div', { class: 'ms-figure rs-mapbox' });
  const rows = el('tbody'), eq = el('p', { class: 'ms-live-eq', 'aria-live': 'polite' });
  let last;
  const sl = slider({ label: 'Distance along the trail d', min: 0, max: 3, step: 0.05, value: d, unit: 'km', onInput: v => { d = v; draw(true); },
    describe: v => `${nf(v)} km: elevation ${Math.round(TRAIL.at(v))} m` });
  function draw(quiet) {
    const y = TRAIL.at(d);
    last = plot({ ...ELEV, label: `Elevation profile of ${TRAIL.name}. Marker at ${nf(d)} km, ${Math.round(y)} m.`,
      series: [profileSeries(TRAIL, 'rs-line--e')], marks: TRAIL.points.map(([x, yy]) => ({ x, y: yy, r: 3.5, cls: 'rs-mark--sample' })).concat([{ x: d, y, cls: 'rs-mark--now', r: 8 }]),
      guides: [{ x: d, y }] });
    put(fig, last.node); put(map, trailMap(d));
    put(eq, 'E(', el('span', { class: 'ms-in' }, nf(d)), ') = ', el('b', { class: 'rs-out' }, nf(round(y, 1)) + ' m'));
    put(rows, [['Distance (input)', `${nf(d)} km`], ['Elevation (output)', `${nf(round(y, 1))} m`], ['Function value', `E(${nf(d)}) = ${nf(round(y, 1))}`],
      ['Change from start', `${y - BASE >= 0 ? '+' : '−'}${nf(round(Math.abs(y - BASE), 1))} m`]].map(([k, v]) => el('tr', null, el('th', { scope: 'row' }, k), el('td', { class: 'ms-mono' }, v))));
    P.setData('explore', d, quiet);
  }
  dragX(fig, () => last, x => { d = clamp(snap(x, 0.05), 0, 3); sl.set(d); draw(true); });
  draw(true);
  const table = el('table', { class: 'ls-table rs-data' }, el('caption', { class: 'ls-sr' }, 'GPS samples'),
    el('thead', null, el('tr', null, el('th', { scope: 'col' }, 'd (km)'), el('th', { scope: 'col' }, 'E(d) (m)'))),
    el('tbody', null, TRAIL.points.map(([x, y]) => el('tr', null, el('td', { class: 'ms-mono' }, nf(x)), el('td', { class: 'ms-mono' }, y.toLocaleString('en-US'))))));
  return el('div', { class: 'ms-lab' },
    el('div', { class: 'ms-lab-visual' }, fig, map),
    el('div', { class: 'ms-lab-panel' }, sl.node, eq,
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table ms-readout' }, el('caption', { class: 'ls-sr' }, 'Trail telemetry'), rows)),
      el('details', { class: 'rs-samples' }, el('summary', null, 'The GPS samples (table)'), el('div', { class: 'ls-table-wrap' }, table)),
      el('p', { class: 'ls-small' }, 'Simulated data, joined by straight lines between samples. Drag on the graph or use the slider.')));
}

// ------------------------------------------------------------ Domain, range and behaviour
export function domainRangeExplorer(ctx) {
  const P = ctx.progress;
  let st = P.getData('dr', { mode: 'domain', d: 3.4, y: 2460 });
  const fig = el('div', { class: 'ms-figure ms-figure--drag' }), read = el('div', { class: 'rs-read', 'aria-live': 'polite' }), controls = el('div');
  let last;
  const dSl = slider({ label: 'Pick an input d', min: -0.5, max: 3.5, step: 0.1, value: st.d, unit: 'km', onInput: v => { st.d = v; draw(true); } });
  const ySl = slider({ label: 'Pick an output (elevation)', min: 2360, max: 2600, step: 5, value: st.y, unit: 'm', onInput: v => { st.y = v; draw(true); } });
  const modes = segs('What to show', [{ label: 'Domain', value: 'domain' }, { label: 'Range', value: 'range' }, { label: 'Climbs & descents', value: 'shape' }], st.mode, v => { st.mode = v; draw(false); });
  const test2460 = button('Test 2,460 m', () => { st.mode = 'range'; st.y = 2460; ySl.set(2460); redrawModes(); draw(false); }, 'ls-btn--quiet');
  function redrawModes() { put(modeBox, segs('What to show', [{ label: 'Domain', value: 'domain' }, { label: 'Range', value: 'range' }, { label: 'Climbs & descents', value: 'shape' }], st.mode, v => { st.mode = v; draw(false); })); }
  const modeBox = el('div', null, modes);
  function draw(quiet) {
    const base = { ...ELEV, x: [-0.5, 3.5], y: [2360, 2600] };
    const [d0, d1] = TRAIL.domain, [y0, y1] = TRAIL.range;
    if (st.mode === 'domain') {
      const inD = st.d >= d0 && st.d <= d1, y = inD ? TRAIL.at(st.d) : null;
      last = plot({ ...base, label: `Domain: ${d0} to ${d1} km highlighted.`, bands: [{ axis: 'x', from: d0, to: d1, cls: 'rs-band--domain' }],
        series: [profileSeries(TRAIL, 'rs-line--e')], vlines: [{ x: st.d, cls: inD ? 'rs-vline--ok' : 'rs-vline--warn' }], marks: inD ? [{ x: st.d, y, cls: 'rs-mark--now' }] : [] });
      put(read, el('p', { class: 'ms-live-eq' }, `Domain: ${d0} ≤ d ≤ ${d1} km`),
        el('p', null, inD ? status(true, `d = ${nf(st.d)} km is in the domain: E(${nf(st.d)}) = ${nf(round(y, 1))} m`, '') : status(false, '', `d = ${nf(st.d)} km is outside the domain: E(${nf(st.d)}) isn’t defined (that’s ${st.d < d0 ? 'before the start' : 'past the finish'})`)));
      put(controls, dSl.node);
    } else if (st.mode === 'range') {
      const xs = TRAIL.crossings(st.y), inR = xs.length > 0;
      last = plot({ ...base, label: `Range: ${y0} to ${y1} m highlighted. Horizontal line at ${st.y} m.`, bands: [{ axis: 'y', from: y0, to: y1, cls: 'rs-band--range' }],
        series: [profileSeries(TRAIL, 'rs-line--e')], hlines: [{ y: st.y, cls: inR ? 'rs-hline--test' : 'rs-hline--warn', label: `${st.y} m` }], marks: xs.map(x => ({ x, y: st.y, cls: 'rs-mark--hit', label: nf(round(x, 3)) + ' km' })) });
      put(read, el('p', { class: 'ms-live-eq' }, `Range: ${y0.toLocaleString('en-US')} ≤ E(d) ≤ ${y1.toLocaleString('en-US')} m`),
        el('p', null, inR ? status(true, `${st.y} m is in the range, reached at ${xs.length} distance${xs.length > 1 ? 's' : ''}: ${xs.map(x => nf(round(x, 3)) + ' km').join(', ')}`, '') : status(false, '', `${st.y} m is outside the range: no point on the trail is at that elevation`)),
        xs.length > 1 ? el('p', { class: 'ls-small' }, 'More than one crossing: knowing the elevation doesn’t tell you where the rider is. This is the horizontal line test.') : null);
      put(controls, ySl.node);
    } else {
      const series = TRAIL.segments.map(s => ({ points: [[s.from, s.y0], [s.to, s.y1]], cls: s.dir === 'up' ? 'rs-line--up' : 'rs-line--down' }));
      last = plot({ ...base, label: 'Climbs and descents, with the maximum and minimum marked.', series,
        marks: [{ x: TRAIL.argmax[0], y: y1, cls: 'rs-mark--max', label: `max ${y1} m` }, { x: TRAIL.argmin[0], y: y0, cls: 'rs-mark--min', label: `min ${y0} m` }] });
      put(read, el('ul', { class: 'rs-runs' }, TRAIL.runs.map(r => el('li', { class: r.dir === 'up' ? 'is-up' : 'is-down' },
        el('span', { 'aria-hidden': 'true' }, r.dir === 'up' ? '▲ ' : '▼ '), `${r.dir === 'up' ? 'Increasing' : 'Decreasing'} from ${nf(r.from)} to ${nf(r.to)} km`))),
        el('p', { class: 'ls-small' }, `Maximum: E(${nf(TRAIL.argmax[0])}) = ${y1} m. Minimum: E(${nf(TRAIL.argmin[0])}) = ${y0} m.`));
      put(controls, null);
    }
    P.setData('dr', st, quiet);
  }
  dragX(fig, () => last, x => { if (st.mode === 'domain') { st.d = clamp(round(x, 1), -0.5, 3.5); dSl.set(st.d); draw(true); } });
  dragY(fig, () => last, y => { if (st.mode === 'range') { st.y = clamp(snap(y, 5), 2360, 2600); ySl.set(st.y); draw(true); } });
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Mode'), modeBox), el('div', { class: 'ls-actions' }, test2460), controls, read));
}

// ------------------------------------------------------------ Drivetrain simulator
export function drivetrainSim(ctx) {
  const P = ctx.progress;
  let st = P.getData('drive', { ...BASE_GEAR });
  const pic = el('div', { class: 'ms-figure rs-drivebox' }), pipe = el('div', { class: 'rs-pipe', 'aria-live': 'polite' }), big = el('p', { class: 'rs-speed' });
  let crank = 0, wheel = 0, chain = 0, raf = null, lastT = null, playing = !reducedMotion();
  const cad = slider({ label: 'Pedal cadence c', min: CADENCE.min, max: CADENCE.max, step: 1, value: st.cadence, unit: 'RPM', onInput: v => { st.cadence = v; draw(true); } });
  const circ = slider({ label: 'Wheel circumference C', min: CIRCUMFERENCE.min, max: CIRCUMFERENCE.max, step: 0.01, value: st.circumference, unit: 'm', format: v => v.toFixed(2), onInput: v => { st.circumference = v; draw(true); } });
  const front = segs('Chainring teeth', FRONT_TEETH.map(n => ({ label: n + 'T', value: n })), st.front, v => { st.front = v; draw(false); });
  const rear = segs('Rear sprocket teeth', REAR_TEETH.map(n => ({ label: n + 'T', value: n })), st.rear, v => { st.rear = v; draw(false); });
  const playBtn = button(playing ? '❚❚ Pause' : '▶ Animate', () => { playing = !playing; playBtn.textContent = playing ? '❚❚ Pause' : '▶ Animate'; if (playing) loop(); else stop(); }, 'ls-btn--quiet');
  const dt = () => drivetrain(st);
  function picture() { put(pic, drivetrainDrawing(dt(), crank, wheel, chain)); }
  function draw(quiet) {
    const D = dt(), w = D.f(st.cadence), v = D.S(st.cadence);
    picture();
    const box = (k, val, cls) => el('div', { class: 'rs-pipe-box ' + (cls || '') }, el('span', { class: 'ls-mini-label' }, k), el('b', null, val));
    const arrow = (fn) => el('div', { class: 'rs-pipe-arrow' }, el('span', { 'aria-hidden': 'true' }, '→'), el('span', { class: 'rs-pipe-fn' }, fn));
    put(pipe,
      el('div', { class: 'rs-pipe-row' }, box('Cadence c', `${st.cadence} RPM`, 'is-in'), arrow(`f(c) = ${r3(D.G)}c`), box('Wheel', `${r2(w)} RPM`, 'is-mid'), arrow(`g(w) = ${r3(D.kg)}w`), box('Speed', `${r2(v)} km/h`, 'is-out')),
      el('p', { class: 'ms-live-eq' }, `G = ${st.front} ÷ ${st.rear} = ${r3(D.G)}   ·   g's factor = 60 × ${st.circumference.toFixed(2)} ÷ 1000 = ${r3(D.kg)}`),
      el('p', { class: 'ms-live-eq' }, `S(c) = g(f(c)) = ${r3(D.kg)} × ${r3(D.G)}c = `, el('b', { class: 'rs-out' }, `${nf(round(D.k, 4))}c`), `   ·   S(${st.cadence}) = ${r2(v)} km/h`),
      el('p', { class: 'ls-small' }, `Model range: ${CADENCE.min}–${CADENCE.max} RPM gives ${r2(D.range[0])}–${r2(D.range[1])} km/h in this gear.`));
    big.textContent = `${r2(v)} km/h`;
    P.setData('drive', st, quiet);
  }
  // Animation: real proportions, slowed to a quarter so the turns are visible.
  function loop() {
    stop();
    const step = now => {
      if (lastT !== null) {
        const dts = Math.min(0.1, (now - lastT) / 1000), D = dt(), slow = 0.25;
        crank = (crank + st.cadence / 60 * 360 * dts * slow) % 360;
        wheel = (wheel + D.f(st.cadence) / 60 * 360 * dts * slow) % 360;
        chain = (chain + st.cadence / 60 * st.front * 7 * dts * slow) % 1000;
        picture();
      }
      lastT = now; raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; lastT = null; }
  ctx.cleanup(stop);
  draw(true);
  if (playing) loop();
  return el('div', { class: 'ms-lab' },
    el('div', { class: 'ms-lab-visual' }, pic, el('div', { class: 'rs-speedrow' }, el('span', { class: 'ls-mini-label' }, 'Bike speed'), big, playBtn), pipe),
    el('div', { class: 'ms-lab-panel' }, cad.node,
      el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Front chainring'), front),
      el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Rear sprocket'), rear),
      circ.node,
      button('Back to 32T / 16T / 2.30 m / 80 RPM', () => { st = { ...BASE_GEAR }; P.setData('drive', st); ctx.rerender(); }, 'ls-btn--ghost'),
      el('p', { class: 'ls-small' }, 'A simplified, idealized model: one fixed gear and no tire slip. 2.30 m is an illustrative measured circumference, not a standard for every wheel.')));
}

// ------------------------------------------------------------ Trail Transformation Studio
const TARGET = Object.freeze({ a: 2, b: 1, c: 0, k: 40 });
export function transformStudio(ctx, opts = {}) {
  const P = ctx.progress, key = opts.key || 'studio';
  let st = P.getData(key, { a: 1, flip: false, b: 1, c: 0, k: 0, target: !!opts.target });
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'rs-read', 'aria-live': 'polite' });
  const params = () => ({ a: (st.flip ? -1 : 1) * st.a, b: st.b, c: st.c, k: st.k });
  const sls = {
    k: slider({ label: 'Vertical shift k', min: -100, max: 100, step: 5, value: st.k, unit: 'm', onInput: v => { st.k = v; draw(true); } }),
    a: slider({ label: 'Vertical scale |a|', min: 0.25, max: 2.5, step: 0.25, value: st.a, onInput: v => { st.a = v; draw(true); } }),
    c: slider({ label: 'Horizontal shift (d − c)', min: -1, max: 1, step: 0.25, value: st.c, unit: 'km', onInput: v => { st.c = v; draw(true); } }),
    b: slider({ label: 'Horizontal scale b in h(bd)', min: 0.5, max: 2, step: 0.25, value: st.b, onInput: v => { st.b = v; draw(true); } })
  };
  const flip = segs('Reflection', [{ label: 'No reflection', value: false }, { label: 'Reflect (−h)', value: true }], st.flip, v => { st.flip = v; draw(false); });
  function draw(quiet) {
    const p = params(), g = transform(RELATIVE, p), T = transform(RELATIVE, TARGET);
    const all = [...RELATIVE.points, ...g.points, ...(st.target ? T.points : [])];
    const xs = all.map(q => q[0]), ys = all.map(q => q[1]);
    const xr = [Math.min(-0.5, Math.floor(Math.min(...xs) * 2) / 2), Math.max(3.5, Math.ceil(Math.max(...xs) * 2) / 2)];
    const yr = [Math.min(-20, Math.floor(Math.min(...ys) / 50) * 50 - 20), Math.max(170, Math.ceil(Math.max(...ys) / 50) * 50 + 20)];
    const match = st.target && sameTransform(p, TARGET);
    put(fig, plot({ x: xr, y: yr, xLabel: 'Distance d (km)', yLabel: 'Relative elevation (m)', xStep: 0.5, yStep: yr[1] - yr[0] > 400 ? 100 : 50, xDigits: 1,
      label: `Original h(d) and transformed ${transformEquation(p)}${st.target ? ', with the target' : ''}.`,
      series: [{ points: RELATIVE.points, cls: 'rs-line--orig' }, ...(st.target ? [{ points: T.points, cls: 'rs-line--target' }] : []), { points: g.points, cls: 'rs-line--new' }],
      hlines: [{ y: 0, cls: 'rs-hline--zero' }] }).node);
    put(read,
      el('ul', { class: 'rs-legend' }, el('li', { class: 'is-orig' }, 'h(d): original'), el('li', { class: 'is-new' }, 'g(d): transformed'), st.target ? el('li', { class: 'is-target' }, 'target') : null),
      el('p', { class: 'ms-live-eq rs-eqn' }, transformEquation(p)),
      el('p', { class: 'ls-small' }, describeTransform(p).join(' · ')),
      el('p', { class: 'ls-small' }, `Domain of g: ${nf(round(g.domain[0], 3))} ≤ d ≤ ${nf(round(g.domain[1], 3))} km`),
      st.target ? el('p', null, match ? status(true, 'Match! Your graph is the target.', '') : status(false, '', 'Not matched yet: compare the start and the peak.')) : null);
    P.setData(key, st, quiet);
  }
  draw(true);
  const reset = button('Reset', () => { st = { a: 1, flip: false, b: 1, c: 0, k: 0, target: st.target }; P.setData(key, st); ctx.rerender(); }, 'ls-btn--ghost');
  const tgl = button(st.target ? 'Hide the target' : 'Show the target', () => { st.target = !st.target; P.setData(key, st); ctx.rerender(); }, 'ls-btn--quiet');
  return el('div', { class: 'ms-lab' },
    el('div', { class: 'ms-lab-visual' }, fig, read),
    el('div', { class: 'ms-lab-panel' }, sls.k.node, sls.a.node, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Reflection'), flip), sls.c.node, sls.b.node,
      el('div', { class: 'ls-actions' }, reset, opts.target ? tgl : null),
      el('p', { class: 'ls-small' }, 'Outside the brackets changes outputs (vertical); inside changes inputs (horizontal). The trail itself never moves: only its graph.')));
}

// ------------------------------------------------------------ Work Backward Calculator
export function workBackward(ctx) {
  const P = ctx.progress, D = BASE_DRIVE;
  let st = P.getData('backward', { mode: 'forward', c: 80, v: 22.08 });
  const fig = el('div', { class: 'ms-figure' }), out = el('div', { class: 'rs-read', 'aria-live': 'polite' }), inputBox = el('div');
  const mode = segs('Direction', [{ label: 'Forward: cadence → speed', value: 'forward' }, { label: 'Reverse: speed → cadence', value: 'reverse' }], st.mode, v => { st.mode = v; draw(false); });
  function field(label, value, unit, onChange) {
    const id = 'rs-wb-' + label.replace(/\W+/g, '');
    const inp = el('input', { id, type: 'text', inputmode: 'decimal', class: 'ls-input', value: String(value), autocomplete: 'off' });
    inp.addEventListener('input', () => onChange(inp.value));
    return el('div', { class: 'ls-field' }, el('label', { for: id }, label), el('span', { class: 'ls-input-unit' }, inp, el('span', { class: 'ls-unit' }, unit)));
  }
  function draw(quiet) {
    const fwd = st.mode === 'forward';
    put(inputBox, fwd ? field('Cadence c', st.c, 'RPM', v => { st.c = v; calc(); }) : field('Target speed v', st.v, 'km/h', v => { st.v = v; calc(); }));
    calc(quiet);
  }
  function calc(quiet) {
    const fwd = st.mode === 'forward', raw = parseFloat(String(fwd ? st.c : st.v).replace(',', '.'));
    const ok = isFinite(raw) && (fwd ? D.inDomain(raw) : D.inRange(raw));
    const c = fwd ? raw : D.Sinv(raw), v = fwd ? D.S(raw) : raw;
    put(fig, plot({ x: [30, 120], y: [5, 35], xLabel: 'Cadence c (RPM)', yLabel: 'Speed S(c) (km/h)', xStep: 10, yStep: 5, xDigits: 0,
      label: fwd ? `Forward: cadence ${raw} RPM gives ${r2(v)} km/h.` : `Reverse: ${raw} km/h needs ${r2(c)} RPM.`,
      bands: [{ axis: 'x', from: D.domain[0], to: D.domain[1], cls: 'rs-band--domain' }],
      series: [{ points: [[D.domain[0], D.S(D.domain[0])], [D.domain[1], D.S(D.domain[1])]], cls: 'rs-line--e' }],
      guides: ok ? [{ x: c, y: v, cls: fwd ? 'rs-guide--fwd' : 'rs-guide--rev' }] : [], marks: ok ? [{ x: c, y: v, cls: 'rs-mark--now' }] : [] }).node);
    put(out,
      el('div', { class: 'rs-two-eq' },
        el('p', { class: 'ms-live-eq' + (fwd ? ' is-active' : '') }, el('span', { class: 'ls-mini-label' }, 'Forward'), el('br'), `S(c) = ${nf(D.k)}c`, el('br'), el('span', { class: 'ls-small' }, 'input: cadence (RPM) → output: speed (km/h)')),
        el('p', { class: 'ms-live-eq' + (fwd ? '' : ' is-active') }, el('span', { class: 'ls-mini-label' }, 'Inverse'), el('br'), `S⁻¹(v) = v ÷ ${nf(D.k)}`, el('br'), el('span', { class: 'ls-small' }, 'input: speed (km/h) → output: cadence (RPM)'))),
      !isFinite(raw) ? el('p', null, status(false, '', 'Type a number.')) :
        !ok ? el('p', null, status(false, '', fwd ? `Outside the model: cadence must be ${D.domain[0]}–${D.domain[1]} RPM.` : `Outside S⁻¹’s domain: speeds from ${r2(D.range[0])} to ${r2(D.range[1])} km/h.`)) :
          el('p', { class: 'rs-result' }, fwd ? `S(${nf(raw)}) = ${nf(D.k)} × ${nf(raw)} = ` : `S⁻¹(${nf(raw)}) = ${nf(raw)} ÷ ${nf(D.k)} = `, el('b', null, fwd ? `${r2(v)} km/h` : `${r2(c)} RPM`)));
    P.setData('backward', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Mode'), mode), inputBox, out));
}

// ------------------------------------------------------------ Inverse Trail Explorer
const PIECES = [[0, 3], [0, 0.5], [0.5, 1], [1, 1.5], [1.5, 2], [2, 2.5], [2.5, 3], [0, 1], [0.5, 1.5]];
export function inverseExplorer(ctx) {
  const P = ctx.progress;
  let st = P.getData('inverse', { piece: 0, y: 2460 });
  const fig = el('div', { class: 'ms-figure ms-figure--drag' }), inv = el('div', { class: 'ms-figure' }), read = el('div', { class: 'rs-read', 'aria-live': 'polite' });
  let last;
  const ySl = slider({ label: 'Horizontal line at elevation y', min: 2390, max: 2560, step: 5, value: st.y, unit: 'm', onInput: v => { st.y = v; draw(true); } });
  const pick = el('div', { class: 'ls-control' }, el('label', { for: 'rs-piece' }, 'Restrict the domain to'),
    (() => { const s = el('select', { id: 'rs-piece', class: 'ls-input rs-select' }, PIECES.map(([a, b], i) => el('option', { value: String(i), selected: i === st.piece ? true : null }, i === 0 ? 'The whole trail (0 to 3 km)' : `${nf(a)} to ${nf(b)} km`)));
      s.addEventListener('change', () => { st.piece = +s.value; draw(false); }); return s; })());
  function draw(quiet) {
    const [a, b] = PIECES[st.piece], I = TRAIL.inverseOn(a, b);
    const piece = { points: TRAIL.points.filter(([x]) => x >= a - 1e-9 && x <= b + 1e-9) };
    const hits = TRAIL.crossings(st.y).filter(x => x >= a - 1e-9 && x <= b + 1e-9);
    last = plot({ ...ELEV, label: `Profile restricted to ${a}–${b} km, horizontal line at ${st.y} m, ${hits.length} crossing(s).`,
      bands: [{ axis: 'x', from: a, to: b, cls: 'rs-band--domain' }],
      series: [{ points: TRAIL.points, cls: 'rs-line--faded' }, { points: piece.points, cls: 'rs-line--e' }],
      hlines: [{ y: st.y, cls: hits.length > 1 ? 'rs-hline--warn' : 'rs-hline--test', label: `y = ${st.y} m` }],
      marks: hits.map(x => ({ x, y: st.y, cls: hits.length > 1 ? 'rs-mark--bad' : 'rs-mark--hit', label: nf(round(x, 3)) + ' km' })) });
    put(fig, last.node);
    if (I) {
      // The inverse: elevation in, distance out (axes swapped; different units).
      put(inv, plot({ x: [Math.floor(I.range[0] / 10) * 10 - 10, Math.ceil(I.range[1] / 10) * 10 + 10], y: [a - 0.1, b + 0.1], xLabel: 'Elevation y (m)', yLabel: 'Distance E⁻¹(y) (km)',
        xStep: niceElev(I.range[1] - I.range[0]), yStep: 0.1, xDigits: 0, yDigits: 1, label: `Inverse of E on ${a} to ${b} km: elevation in, distance out.`,
        series: [{ points: piece.points.map(([x, y]) => [y, x]).sort((p, q) => p[0] - q[0]), cls: 'rs-line--inv' }],
        marks: I.f(st.y) !== null ? [{ x: st.y, y: I.f(st.y), cls: 'rs-mark--now', label: `${r3(I.f(st.y))} km` }] : [] }).node);
    } else put(inv, el('p', { class: 'rs-noinv' }, 'No inverse function on this domain: some elevations happen more than once.'));
    const F = I && I.formula;
    put(read,
      el('p', null, I ? status(true, `One-to-one on ${nf(a)}–${nf(b)} km (${I.dir === 'up' ? 'only climbing' : 'only descending'})`, '') : status(false, '', `Not one-to-one on ${nf(a)}–${nf(b)} km: it climbs and descends`)),
      el('p', { class: 'ls-small' }, `The line y = ${st.y} m crosses this part ${hits.length} time${hits.length === 1 ? '' : 's'}.`),
      I && F ? el('p', { class: 'ms-live-eq' }, `E(d) = ${F.y0} ${F.slope >= 0 ? '+' : '−'} ${nf(Math.abs(F.slope))}(d − ${nf(F.d0)})  ⇒  E⁻¹(y) = ${nf(F.d0)} + (y − ${F.y0}) ÷ ${nf(F.slope)}`) : null,
      I ? el('p', { class: 'ms-live-eq' }, I.f(st.y) !== null ? ['E⁻¹(', el('span', { class: 'ms-in' }, String(st.y)), ') = ', el('b', { class: 'rs-out' }, r3(I.f(st.y)) + ' km')] : `${st.y} m is outside E⁻¹’s domain (${nf(I.range[0])}–${nf(I.range[1])} m)`) : null,
      I ? el('p', { class: 'ls-small' }, `Domain and range swap: E⁻¹ takes elevations ${nf(I.range[0])}–${nf(I.range[1])} m and gives distances ${nf(a)}–${nf(b)} km. Its graph is E’s piece reflected across the line y = x, with the axes relabelled (metres and kilometres trade places).`) : null);
    P.setData('inverse', st, quiet);
  }
  dragY(fig, () => last, y => { st.y = clamp(snap(y, 5), 2390, 2560); ySl.set(st.y); draw(true); });
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, el('p', { class: 'ls-mini-label rs-inv-h' }, 'The inverse, E⁻¹'), inv),
    el('div', { class: 'ms-lab-panel' }, pick, ySl.node, read));
}
const niceElev = span => (span <= 40 ? 10 : span <= 100 ? 20 : 50);

// ------------------------------------------------------------ Function Mixer (extension)
export function functionMixer(ctx) {
  const P = ctx.progress;
  let st = P.getData('mixer', { H: 1.5, op: 'add' });
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'rs-read', 'aria-live': 'polite' });
  const hSl = slider({ label: 'Deck height b (on the span)', min: 0.5, max: 3, step: 0.1, value: st.H, unit: 'm', onInput: v => { st.H = v; draw(true); } });
  const ops = segs('Operation', [{ label: 'f + b', value: 'add' }, { label: 'T − f', value: 'sub' }, { label: '3.281 · T', value: 'mul' }, { label: 'b ÷ f', value: 'div' }], st.op, v => { st.op = v; draw(false); });
  function draw(quiet) {
    const X = crossing(st.H), xs = []; for (let x = 0; x <= CROSSING.length + 1e-9; x += 0.5) xs.push(Number(x.toFixed(2)));
    const res = { add: X.T, sub: X.clearance, mul: X.feet, div: X.ratio }[st.op];
    const pts = fn => xs.map(x => (Math.abs(x - CROSSING.creek) < 0.6 && st.op === 'div' && fn === res ? null : [x, fn(x)]));
    const ymax = st.op === 'mul' ? 20 : st.op === 'div' ? 10 : 6;
    put(fig, plot({ x: [0, 60], y: [0, ymax], xLabel: 'Distance across the crossing x (m)', yLabel: st.op === 'mul' ? 'Height (ft)' : st.op === 'div' ? 'b(x) ÷ f(x)' : 'Height (m)', xStep: 10, yStep: ymax / 5, xDigits: 0, yDigits: st.op === 'div' ? 0 : 1,
      label: 'Ground f, deck b and the combined function.',
      series: [{ points: xs.map(x => [x, X.f(x)]), cls: 'rs-line--ground' }, { points: xs.map(x => [x, X.b(x)]), cls: 'rs-line--deck' }, { points: pts(res), cls: 'rs-line--new' }],
      vlines: st.op === 'div' ? [{ x: CROSSING.creek, cls: 'rs-vline--warn', label: 'undefined at x = 30' }] : [] }).node);
    const words = {
      add: ['T(x) = f(x) + b(x)', 'The riding surface: ground plus boardwalk. Domain: where both are defined, 0–60 m.'],
      sub: ['T(x) − f(x) = b(x)', 'Subtracting the ground gives back the deck height: the clearance under a rider.'],
      mul: ['3.281 · T(x)', 'Multiplying by a constant changes units: the same surface in feet.'],
      div: ['b(x) ÷ f(x)', 'Defined only where f(x) ≠ 0. At the creek bed, x = 30, f(30) = 0, so x = 30 leaves the domain.']
    }[st.op];
    put(read, el('ul', { class: 'rs-legend' }, el('li', { class: 'is-ground' }, 'f(x): ground'), el('li', { class: 'is-deck' }, 'b(x): deck'), el('li', { class: 'is-new' }, 'result')),
      el('p', { class: 'ms-live-eq' }, words[0]), el('p', { class: 'ls-small' }, words[1]),
      el('p', { class: 'ms-live-eq' }, `At x = 25: f = ${r2(X.f(25))}, b = ${r2(X.b(25))}, result = ${r2(res(25))}`));
    P.setData('mixer', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig),
    el('div', { class: 'ms-lab-panel' }, hSl.node, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Combine'), ops), read,
      el('p', { class: 'ls-small' }, 'A simplified creek crossing: f(x) = 0.004(x − 30)² m above the creek bed, with a boardwalk from 20 to 40 m.')));
}
