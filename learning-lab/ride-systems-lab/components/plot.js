// A small SVG plotter for the lab's graphs: any x and y window (elevations
// start at 2,400 m, not 0), several series, bands, guide lines, markers and
// labelled axes with units. It only draws numbers it's given; all maths is
// in logic/models.js. Each call returns a fresh <svg> plus the scales, so a
// component can turn a pointer position back into data (dragging).

import { svg } from '../../lesson-kit/dom.js';

const W = 640, H = 330, M = { l: 66, r: 18, t: 18, b: 52 };
const t = (x, y, text, cls, extra) => svg('text', { x, y, class: cls || 'ms-svg-small', ...(extra || {}) }, text);
const fmt = (v, d) => String(Number(Number(v).toFixed(d)));

// Tick values from a to b, at multiples of step.
function ticks(a, b, step) {
  const out = [], start = Math.ceil(a / step - 1e-9) * step;
  for (let v = start; v <= b + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
}
export function niceStep(span, n = 6) {
  const raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw)));
  return [1, 2, 2.5, 5, 10].map(k => k * p).find(s => s >= raw) || raw;
}

// spec: { x: [x0, x1], y: [y0, y1], xLabel, yLabel, xStep, yStep, xDigits, yDigits, label,
//         bands: [{ axis: 'x'|'y', from, to, cls, label }],
//         series: [{ points: [[x, y]…] | null-separated, cls, label? }],
//         hlines: [{ y, cls, label }], vlines: [{ x, cls, label }],
//         guides: [{ x, y, cls }]   (dashed lines from a point to both axes)
//         marks: [{ x, y, cls, label, r }] }
export function plot(spec) {
  const [x0, x1] = spec.x, [y0, y1] = spec.y;
  const pw = W - M.l - M.r, ph = H - M.t - M.b;
  const X = x => M.l + (x - x0) / (x1 - x0) * pw, Y = y => M.t + ph - (y - y0) / (y1 - y0) * ph;
  const invX = px => x0 + (px - M.l) / pw * (x1 - x0), invY = py => y0 + (M.t + ph - py) / ph * (y1 - y0);
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'rs-plot', role: 'img', 'aria-label': spec.label || '' });
  const clipId = 'rsc' + Math.random().toString(36).slice(2, 8);
  s.append(svg('defs', null, svg('clipPath', { id: clipId }, svg('rect', { x: M.l, y: M.t, width: pw, height: ph }))));
  const xs = ticks(x0, x1, spec.xStep || niceStep(x1 - x0)), ys = ticks(y0, y1, spec.yStep || niceStep(y1 - y0));
  ys.forEach(v => s.append(svg('line', { x1: M.l, y1: Y(v), x2: M.l + pw, y2: Y(v), class: 'rs-grid' }), t(M.l - 8, Y(v) + 4, fmt(v, spec.yDigits ?? 0), 'ms-svg-small ms-end')));
  xs.forEach(v => s.append(svg('line', { x1: X(v), y1: M.t, x2: X(v), y2: M.t + ph, class: 'rs-grid' }), t(X(v), M.t + ph + 18, fmt(v, spec.xDigits ?? 1), 'ms-svg-small ms-mid')));
  const g = svg('g', { 'clip-path': `url(#${clipId})` });
  (spec.bands || []).forEach(b => {
    if (b.axis === 'x') g.append(svg('rect', { x: X(Math.max(b.from, x0)), y: M.t, width: Math.max(0, X(Math.min(b.to, x1)) - X(Math.max(b.from, x0))), height: ph, class: b.cls || 'rs-band' }));
    else g.append(svg('rect', { x: M.l, y: Y(Math.min(b.to, y1)), width: pw, height: Math.max(0, Y(Math.max(b.from, y0)) - Y(Math.min(b.to, y1))), class: b.cls || 'rs-band' }));
  });
  (spec.series || []).forEach(se => {
    // null in the points list breaks the line (e.g. a quotient's undefined point)
    let d = '', pen = false;
    for (const p of se.points) { if (!p || p[1] === null || !isFinite(p[1])) { pen = false; continue; } d += (pen ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1) + ' '; pen = true; }
    if (d) g.append(svg('path', { d, class: 'rs-line ' + (se.cls || '') }));
  });
  (spec.hlines || []).forEach(l => g.append(svg('line', { x1: M.l, y1: Y(l.y), x2: M.l + pw, y2: Y(l.y), class: 'rs-hline ' + (l.cls || '') })));
  (spec.vlines || []).forEach(l => g.append(svg('line', { x1: X(l.x), y1: M.t, x2: X(l.x), y2: M.t + ph, class: 'rs-vline ' + (l.cls || '') })));
  (spec.guides || []).forEach(p => g.append(svg('path', { d: `M${X(p.x)} ${M.t + ph} V${Y(p.y)} H${M.l}`, class: 'rs-guide ' + (p.cls || '') })));
  s.append(g);
  // labels for bands / lines sit outside the clip so they stay readable
  (spec.hlines || []).filter(l => l.label).forEach(l => s.append(t(M.l + pw - 4, Y(l.y) - 6, l.label, 'ms-svg-small ms-end rs-hl-label')));
  (spec.vlines || []).filter(l => l.label).forEach(l => s.append(t(X(l.x) + 4, M.t + 12, l.label, 'ms-svg-small rs-hl-label')));
  (spec.marks || []).forEach(p => {
    if (p.x < x0 - 1e-9 || p.x > x1 + 1e-9 || p.y < y0 - 1e-9 || p.y > y1 + 1e-9) return;
    s.append(svg('circle', { cx: X(p.x), cy: Y(p.y), r: p.r || 6, class: 'rs-mark ' + (p.cls || '') }));
    if (p.label) s.append(t(Math.min(X(p.x) + 10, M.l + pw - 4), Y(p.y) - 10, p.label, 'ms-svg-label' + (X(p.x) + 10 > M.l + pw - 120 ? ' ms-end' : '')));
  });
  s.append(svg('line', { x1: M.l, y1: M.t + ph, x2: M.l + pw, y2: M.t + ph, class: 'rs-axis' }), svg('line', { x1: M.l, y1: M.t, x2: M.l, y2: M.t + ph, class: 'rs-axis' }),
    t(M.l + pw / 2, H - 10, spec.xLabel || '', 'ms-svg-label ms-mid'),
    t(16, M.t + ph / 2, spec.yLabel || '', 'ms-svg-label ms-mid', { transform: `rotate(-90 16 ${M.t + ph / 2})` }));
  return { node: s, X, Y, invX, invY, W, H };
}

// Turn pointer drags on a container into data x values (keyboard users use
// the paired slider). getPlot returns the latest plot() result.
export function dragX(container, getPlot, onX) {
  let on = false;
  const at = e => { const p = getPlot(), r = container.querySelector('svg').getBoundingClientRect(); onX(p.invX((e.clientX - r.left) * p.W / r.width)); };
  container.addEventListener('pointerdown', e => { on = true; if (container.setPointerCapture) container.setPointerCapture(e.pointerId); at(e); });
  container.addEventListener('pointermove', e => { if (on) at(e); });
  const stop = () => { on = false; };
  container.addEventListener('pointerup', stop); container.addEventListener('pointercancel', stop);
}
export function dragY(container, getPlot, onY) {
  let on = false;
  const at = e => { const p = getPlot(), r = container.querySelector('svg').getBoundingClientRect(); onY(p.invY((e.clientY - r.top) * p.H / r.height)); };
  container.addEventListener('pointerdown', e => { on = true; if (container.setPointerCapture) container.setPointerCapture(e.pointerId); at(e); });
  container.addEventListener('pointermove', e => { if (on) at(e); });
  const stop = () => { on = false; };
  container.addEventListener('pointerup', stop); container.addEventListener('pointercancel', stop);
}
