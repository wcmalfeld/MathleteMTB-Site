// Map the Line: figures. A coordinate grid with axes through the origin and
// its own scale on each axis (gridSvg), elevation profiles and two-point
// lines (the kit's plotter), tables, and small multiples. All positions come
// from coordinate values; the grid's pixel size never changes a result.

import { el, svg } from '../../lesson-kit/dom.js';
import { plot } from '../../lesson-kit/plot.js';
import { S, slope, firstDifferences, signed } from '../logic/linear.js';
import { mapArt } from './visuals.js';

const fmt = v => (v < 0 ? '−' + String(-v) : String(v));

// spec: { x: [lo, hi], y: [lo, hi], sx?, sy? (value per grid interval), profile? (axes at the edges, data units),
//         xLabel?, yLabel?, map? (mountain art), quadrants?, points: [{ x, y, label, cls }], line?: [[x, y], [x, y]], path?: [[x, y]…], onPick?(x, y), label? }
export function gridSvg(spec) {
  const prof = !!spec.profile, sx = spec.sx || 1, sy = spec.sy || 1;
  const [x0, x1] = spec.x, [y0, y1] = spec.y;
  const nx = prof ? (x1 - x0) / sx : x1 - x0, ny = prof ? (y1 - y0) / sy : y1 - y0;
  // rect: separate cell width and height (for graphs whose axes have very different counts, like days against dollars)
  const cell = Math.max(20, Math.min(44, Math.floor(520 / Math.max(nx, ny))));
  const cw = spec.rect ? Math.max(24, Math.min(80, Math.floor(520 / nx))) : cell, ch = spec.rect ? Math.max(12, Math.min(44, Math.floor(340 / ny))) : cell;
  const L = prof ? 64 : 22, T = 16, R = 18, B = prof ? 46 : 22;
  const W = L + nx * cw + R, H = T + ny * ch + B;
  const X = v => L + (prof ? (v - x0) / sx : v - x0) * cw, Y = v => T + (prof ? (y1 - v) / sy : y1 - v) * ch;
  const s = svg('svg', { class: 'mt-grid' + (spec.onPick ? ' is-pick' : ''), viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': spec.label || 'Coordinate grid' });
  if (spec.map && !prof) s.appendChild(mapArt(X(x0), Y(y1), X(x1) - X(x0), Y(y0) - Y(y1)));
  if (spec.quadrants && !prof) {
    [['I', 1, 1], ['II', -1, 1], ['III', -1, -1], ['IV', 1, -1]].forEach(([q, a, b]) => s.appendChild(svg('text', { class: 'mt-quad-label', x: X(a * (x1 - 0.8) / 2 + (a > 0 ? 0.4 : -0.4)), y: Y(b * (y1 - 0.8) / 2), 'text-anchor': 'middle' }, q)));
  }
  for (let i = 0; i <= nx; i++) { const v = prof ? x0 + i * sx : x0 + i; s.appendChild(svg('path', { class: 'mt-gl', d: `M${X(v)} ${T} V${T + ny * ch}` })); }
  for (let j = 0; j <= ny; j++) { const v = prof ? y0 + j * sy : y0 + j; s.appendChild(svg('path', { class: 'mt-gl', d: `M${L} ${Y(v)} H${L + nx * cw}` })); }
  // axes
  const ax = prof ? T + ny * ch : Y(0), ay = prof ? L : X(0);
  s.appendChild(svg('path', { class: 'mt-axis', d: `M${L - (prof ? 0 : 6)} ${ax} H${L + nx * cw + (prof ? 0 : 6)} M${ay} ${T + ny * ch + (prof ? 0 : 6)} V${T - (prof ? 0 : 6)}` }));
  const every = Math.max(1, Math.ceil(Math.max(nx, ny) / 12));
  for (let i = 0; i <= nx; i += (prof ? 1 : every)) { const v = prof ? x0 + i * sx : x0 + i; if (!prof && v === 0) continue; s.appendChild(svg('text', { class: 'mt-tick', x: X(v), y: ax + 15, 'text-anchor': 'middle' }, fmt(prof ? v : v * sx))); }
  const yEvery = prof ? Math.max(1, Math.ceil(16 / ch)) : every;
  for (let j = 0; j <= ny; j += yEvery) { const v = prof ? y0 + j * sy : y0 + j; if (!prof && v === 0) continue; s.appendChild(svg('text', { class: 'mt-tick', x: ay - 6, y: Y(v) + 4, 'text-anchor': 'end' }, fmt(prof ? v : v * sy))); }
  if (!prof) s.appendChild(svg('text', { class: 'mt-tick mt-origin', x: X(0) - 6, y: Y(0) + 15, 'text-anchor': 'end' }, '0'));
  if (spec.xLabel) s.appendChild(svg('text', { class: 'mt-axlabel', x: L + nx * cw / 2, y: H - 6, 'text-anchor': 'middle' }, spec.xLabel));
  if (spec.yLabel) s.appendChild(svg('text', { class: 'mt-axlabel', x: 14, y: T + ny * ch / 2, 'text-anchor': 'middle', transform: `rotate(-90 14 ${T + ny * ch / 2})` }, spec.yLabel));
  if (!prof) { s.appendChild(svg('text', { class: 'mt-axname', x: L + nx * cw + 4, y: Y(0) - 6, 'text-anchor': 'end' }, 'x')); s.appendChild(svg('text', { class: 'mt-axname', x: X(0) + 8, y: T + 10 }, 'y')); }
  if (sx !== 1 || sy !== 1) s.appendChild(svg('text', { class: 'mt-scale', x: L + 4, y: T + 12 }, `Scale: each ↔ ${fmt(sx)}${spec.unit ? ' ' + spec.unit : ''}, each ↕ ${fmt(sy)}${spec.unit ? ' ' + spec.unit : ''}`));
  if (spec.path) s.appendChild(svg('path', { class: 'mt-path' + (spec.pathCls ? ' ' + spec.pathCls : ''), d: 'M' + spec.path.map(([a, b]) => X(a) + ' ' + Y(b)).join(' L') }));
  if (spec.line) s.appendChild(svg('path', { class: 'mt-line', d: `M${X(spec.line[0][0])} ${Y(spec.line[0][1])} L${X(spec.line[1][0])} ${Y(spec.line[1][1])}` }));
  for (const p of spec.points || []) {
    const g = svg('g', { class: 'mt-pt ' + (p.cls || ''), transform: `translate(${X(p.x)} ${Y(p.y)})` }, svg('circle', { r: p.r || 7 }));
    if (p.label) g.appendChild(svg('text', { class: 'mt-pt-label', x: 10, y: -10 }, p.label));
    if (p.onClick) { g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', p.aria || p.label); g.addEventListener('click', p.onClick); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.onClick(); } }); }
    s.appendChild(g);
  }
  if (spec.onPick) s.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('[role="button"]')) return;
    const r = s.getBoundingClientRect(), px = (e.clientX - r.left) * W / r.width, py = (e.clientY - r.top) * H / r.height;
    let gx = (px - L) / cw, gy = (py - T) / ch; gx = Math.round(gx); gy = Math.round(gy);
    if (gx < 0 || gy < 0 || gx > nx || gy > ny) return;
    spec.onPick(prof ? x0 + gx * sx : x0 + gx, prof ? y1 - gy * sy : y1 - gy);
  });
  return s;
}

const tableEl = (rows, headers, o = {}) => el('div', { class: 'ls-table-wrap mt-table-wrap' }, el('table', { class: 'ls-table mt-table' },
  el('thead', null, el('tr', null, (headers || ['x', 'y']).concat(o.diffs ? ['Change in y'] : []).map(h => el('th', { scope: 'col' }, h)))),
  el('tbody', null, rows.map((r, i) => el('tr', null, r.map(v => el('td', { class: 'ms-mono' + (v === null ? ' mt-missing' : '') }, cell(v))),
    o.diffs ? el('td', { class: 'ms-mono mt-diff' }, i ? signed(firstDifferences([rows[i - 1], r])[0]) : '—') : null)))));
const cell = v => (v === null ? '?' : typeof v === 'string' ? v : S(v));
export { tableEl };

// The figure a question carries (q.fig).
export function figure(fig) {
  if (!fig) return null;
  if (fig.kind === 'grid') return el('div', { class: 'ms-figure mt-fig' }, gridSvg({ ...fig.grid, points: fig.points, line: fig.line, map: fig.grid.map !== false && !fig.grid.profile, label: fig.label }));
  if (fig.kind === 'table') return tableEl(fig.rows, fig.headers);
  if (fig.kind === 'profile') {
    const rows = fig.rows, ys = rows.map(r => r[1]);
    return el('div', { class: 'ms-figure mt-fig' }, plot({ x: [rows[0][0], rows[rows.length - 1][0]], y: [Math.min(...ys) - 5, Math.max(...ys) + 5], xStep: 100, yStep: 5, xDigits: 0, xLabel: 'Horizontal distance (m)', yLabel: 'Elevation (m)', label: 'Fictional elevation profile: ' + rows.map(r => `(${r[0]}, ${r[1]})`).join(', '),
      series: [{ points: rows, cls: 'mt-prof-line' }], marks: rows.map(r => ({ x: r[0], y: r[1], cls: 'mt-prof-pt', r: 5 })) }).node, el('p', { class: 'ls-small' }, 'A fictional educational trail profile.'));
  }
  if (fig.kind === 'missing') {
    const known = fig.rows.filter(r => r[1] !== null), ys = known.map(r => r[1]);
    return el('div', { class: 'mt-two' }, tableEl(fig.rows, ['Distance (m)', 'Elevation (m)']), el('div', { class: 'ms-figure mt-fig' }, plot({ x: [0, 400], y: [Math.min(...ys) - 6, Math.max(...ys) + 6], xStep: 100, yStep: 6, xDigits: 0, xLabel: 'Distance (m)', yLabel: 'Elevation (m)', label: 'Plotted waypoints with one missing at 200 m',
      series: [{ points: known, cls: 'mt-prof-line mt-dashed' }], marks: known.map(r => ({ x: r[0], y: r[1], cls: 'mt-prof-pt', r: 5 })), vlines: [{ x: 200, cls: 'mt-vmiss', label: '200 m: ?' }] }).node));
  }
  if (fig.kind === 'lines') return el('div', { class: 'ms-figure mt-fig' }, segmentPlot(fig.p1, fig.p2, fig));
  if (fig.kind === 'four') return el('div', { class: 'mt-four' }, fig.lines.map(l => el('figure', { class: 'mt-four-cell' }, el('figcaption', null, 'Graph ' + l.id),
    gridSvg({ x: [0, 6], y: [0, 12], profile: true, sx: 1, sy: 2, line: [[0, l.b], [6, l.m * 6 + l.b]], label: `Graph ${l.id}: a straight line through (0, ${l.b}) with slope ${l.m}` }))));
  return null;
}
// Two points, with the rise/run triangle (or a vertical line).
export function segmentPlot(p1, p2, o = {}) {
  const xs = [Number(p1.x), Number(p2.x)], ys = [Number(p1.y), Number(p2.y)];
  const padX = Math.max(1, (Math.max(...xs) - Math.min(...xs)) * 0.25 || 50), padY = Math.max(2, (Math.max(...ys) - Math.min(...ys)) * 0.35 || 5);
  const s = slope(p1, p2), corner = [Number(p2.x), Number(p1.y)];
  const series = [{ points: [[xs[0], ys[0]], [xs[1], ys[1]]], cls: 'mt-seg' }];
  if (o.tri && s.kind !== 'undefined' && s.kind !== 'zero') series.push({ points: [[xs[0], ys[0]], corner], cls: 'mt-run' }, { points: [corner, [xs[1], ys[1]]], cls: 'mt-rise' });
  const marks = o.bare ? [] : [{ x: xs[0], y: ys[0], cls: 'mt-pt-a', label: `(${S(p1.x)}, ${S(p1.y)})` }, { x: xs[1], y: ys[1], cls: 'mt-pt-b', label: `(${S(p2.x)}, ${S(p2.y)})` }];
  return plot({ x: [Math.min(...xs) - padX, Math.max(...xs) + padX], y: [Math.min(...ys) - padY, Math.max(...ys) + padY], xDigits: 0, yDigits: 0, xLabel: o.bare ? '' : 'x', yLabel: o.bare ? '' : 'y',
    label: o.bare ? 'A trail profile line' : `Line from (${S(p1.x)}, ${S(p1.y)}) to (${S(p2.x)}, ${S(p2.y)})`, series, marks }).node;
}
