// Enduro Route Intelligence Lab drawings (SVG). They only draw numbers that
// came from logic/models.js: the stage map with a rider and stopwatch, the
// two-section map, the survey triangle, the wheel, and the opening art.

import { svg } from '../../lesson-kit/dom.js';

const t = (x, y, text, cls, extra) => svg('text', { x, y, class: cls || 'ms-svg-small', ...(extra || {}) }, text);
const bike = (x, y, s = 1) => svg('g', { class: 'er-bike', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})` },
  svg('circle', { cx: -10, cy: -7, r: 7 }), svg('circle', { cx: 10, cy: -7, r: 7 }),
  svg('path', { d: 'M-10 -7 L-1 -15 L10 -7 M-1 -15 L6 -15 M-1 -15 L-5 -21' }), svg('circle', { cx: -3, cy: -26, r: 3.5, class: 'er-head' }));
// A winding stage route as a polyline; point(f) gives the position a fraction f along it.
const ROUTE = [[40, 150], [120, 60], [210, 120], [300, 50], [390, 130], [470, 70], [560, 140], [610, 90]];
function along(pts, f) {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), total = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, f)) * total;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? d / seg[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } d -= seg[i]; }
  return pts[pts.length - 1];
}
const path = pts => 'M' + pts.map(p => p.join(' ')).join(' L ');

// Stage map: the timed route, the rider at fraction f, the transition box and a stopwatch.
export function stageMap(f, clockText, label) {
  const s = svg('svg', { viewBox: '0 0 640 200', class: 'er-map', role: 'img', 'aria-label': label });
  const [rx, ry] = along(ROUTE, f);
  s.append(svg('rect', { x: 0, y: 0, width: 640, height: 200, class: 'er-map-bg' }),
    svg('path', { d: path(ROUTE), class: 'er-route' }), svg('path', { d: path(ROUTE), class: 'er-route-done', 'stroke-dasharray': `${f * 1000} 2000`, pathLength: 1000 }),
    svg('circle', { cx: ROUTE[0][0], cy: ROUTE[0][1], r: 6, class: 'er-flag' }), t(ROUTE[0][0] - 12, ROUTE[0][1] + 24, 'START', 'ms-svg-kicker'),
    svg('rect', { x: ROUTE[7][0] - 6, y: ROUTE[7][1] - 26, width: 12, height: 20, class: 'er-flag' }), t(ROUTE[7][0] - 18, ROUTE[7][1] + 22, 'FINISH', 'ms-svg-kicker'),
    bike(rx, ry - 2, 0.9),
    svg('rect', { x: 456, y: 160, width: 176, height: 34, rx: 4, class: 'er-watch' }), t(544, 184, clockText, 'er-watch-num ms-mid'));
  return s;
}

// Two sections: flow (fraction fa of its length done) then technical.
export function splitMap(fa, fb, label) {
  const A = ROUTE.slice(0, 5), B = ROUTE.slice(4);
  const s = svg('svg', { viewBox: '0 0 640 180', class: 'er-map', role: 'img', 'aria-label': label });
  s.append(svg('rect', { x: 0, y: 0, width: 640, height: 180, class: 'er-map-bg' }),
    svg('path', { d: path(A), class: 'er-route er-route--flow' }), svg('path', { d: path(B), class: 'er-route er-route--tech' }),
    t(170, 30, 'FLOW SECTION', 'ms-svg-kicker er-flow-text'), t(470, 30, 'TECHNICAL SECTION', 'ms-svg-kicker er-tech-text'),
    svg('circle', { cx: A[4][0], cy: A[4][1], r: 6, class: 'er-flag' }));
  const p = fb > 0 ? along(B, fb) : along(A, fa);
  s.append(bike(p[0], p[1] - 2, 0.9));
  return s;
}

// Survey triangle: run (fixed), signed rise h, and the diagonal.
export function surveyTriangle(run, h, d) {
  const W = 640, H = 330, x0 = 150, x1 = 450, ymid = 165, sy = (x1 - x0) / run, y1 = ymid - h * sy;   // true proportions
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'er-survey', role: 'img', 'aria-label': `Run ${run} m, elevation change ${h} m, direct distance ${d.toFixed(2)} m, drawn to scale.` });
  s.append(svg('path', { d: `M${x0} ${ymid} L${x1} ${ymid}`, class: 'er-run' }),
    svg('path', { d: `M${x1} ${ymid} L${x1} ${y1}`, class: 'er-rise' }),
    svg('path', { d: `M${x0} ${ymid} L${x1} ${y1}`, class: 'er-diag' }),
    svg('path', { d: `M${x1 - 14} ${ymid} v ${h >= 0 ? -14 : 14} h 14`, class: 'er-right' }),
    t((x0 + x1) / 2, ymid + (h >= 0 ? 24 : -12), `run ${run} m`, 'ms-svg-label ms-mid'),
    t(x1 + 10, (ymid + y1) / 2 + 4, `h = ${h} m`, 'ms-svg-label er-rise-text'),
    t((x0 + x1) / 2 - 30, (ymid + y1) / 2 + (h >= 0 ? -16 : 28), `D = ${d.toFixed(2)} m`, 'ms-svg-label ms-end er-diag-text'));
  // survey instruments at both points
  [[x0, ymid], [x1, y1]].forEach(([x, y]) => s.append(svg('g', { class: 'er-tripod' }, svg('path', { d: `M${x} ${y} l -10 22 M${x} ${y} l 10 22 M${x} ${y} l 0 22` }), svg('rect', { x: x - 8, y: y - 12, width: 16, height: 10, rx: 2 }))));
  return s;
}

// Side view of a wheel with the hub at the origin and the point (x, W(x)).
// marks: extra points [[x, y]] (e.g. both solutions of a height equation).
export function wheelView(R, x, y, marks = [], level = null) {
  const S = 300, c = 160, sc = 125 / R, X = v => c + v * sc, Y = v => c - v * sc;
  const s = svg('svg', { viewBox: `0 0 ${S + 20} ${S + 20}`, class: 'er-wheel', role: 'img', 'aria-label': `Wheel of radius ${R} m; point at x = ${x}, height ${y === null ? 'none' : y.toFixed(3)} m above the hub.` });
  s.append(svg('circle', { cx: c, cy: c, r: R * sc + 9, class: 'er-tire' }), svg('circle', { cx: c, cy: c, r: R * sc, class: 'er-rim' }));
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; s.append(svg('line', { x1: c, y1: c, x2: c + Math.cos(a) * R * sc, y2: c + Math.sin(a) * R * sc, class: 'er-spoke' })); }
  s.append(svg('line', { x1: X(-R) - 14, y1: c, x2: X(R) + 14, y2: c, class: 'er-axis' }), svg('line', { x1: c, y1: Y(R) - 14, x2: c, y2: Y(-R) + 14, class: 'er-axis' }),
    svg('path', { d: `M${X(-R)} ${c} A ${R * sc} ${R * sc} 0 0 1 ${X(R)} ${c}`, class: 'er-upper' }),
    svg('circle', { cx: c, cy: c, r: 7, class: 'er-hub' }), t(c + 10, c + 18, 'hub (0, 0)', 'ms-svg-kicker'));
  if (level !== null) s.append(svg('line', { x1: X(-R) - 10, y1: Y(level), x2: X(R) + 10, y2: Y(level), class: 'er-level' }));
  if (y !== null) s.append(svg('line', { x1: X(x), y1: c, x2: X(x), y2: Y(y), class: 'er-drop' }), svg('circle', { cx: X(x), cy: Y(y), r: 7, class: 'er-point' }));
  marks.forEach(([mx, my]) => s.append(svg('circle', { cx: X(mx), cy: Y(my), r: 7, class: 'er-point er-point--sol' })));
  return s;
}

// Opening art: a GPS race computer with an elevation profile, a stage map,
// a stopwatch, a survey triangle and a wheel diagram.
export function openingArt() {
  const s = svg('svg', { viewBox: '0 0 640 420', class: 'er-art', 'aria-hidden': 'true', focusable: 'false' });
  s.append(svg('rect', { x: 0, y: 0, width: 640, height: 420, class: 'er-art-bg' }),
    svg('path', { d: 'M0 330 L 90 270 L 160 300 L 250 220 L 330 260 L 420 190 L 520 250 L 640 210 L 640 420 L 0 420 Z', class: 'er-hill' }),
    svg('path', { d: 'M40 312 C 120 260, 160 330, 240 250 S 360 280, 420 220 S 560 270, 610 228', class: 'er-route' }),
    bike(250, 248, 1.1));
  s.append(svg('rect', { x: 24, y: 24, width: 262, height: 150, rx: 6, class: 'er-art-screen' }), t(38, 46, 'STAGE 3 · 6.0 km · T(v) = 8 + 360/v', 'ms-svg-kicker'));
  const P = []; for (let i = 1; i <= 40; i++) { const v = i; P.push(`${(44 + v * 5.6).toFixed(1)} ${(160 - Math.min(110, (8 + 360 / v) * 1.6)).toFixed(1)}`); }
  s.append(svg('path', { d: 'M44 160 h 228 M44 160 v -110', class: 'er-art-axis' }), svg('path', { d: 'M44 147 h 228', class: 'er-art-asym' }), svg('path', { d: 'M' + P.join(' L '), class: 'er-art-trace' }));
  s.append(svg('rect', { x: 330, y: 30, width: 150, height: 56, rx: 6, class: 'er-watch' }), t(405, 68, '28:00', 'er-watch-num ms-mid'), t(405, 104, '18 km/h', 'ms-svg-kicker ms-mid'));
  s.append(svg('path', { d: 'M500 160 L 610 160 L 610 110 Z', class: 'er-art-tri' }), t(520, 178, '√(120² + h²)', 'ms-svg-kicker'));
  s.append(svg('circle', { cx: 560, cy: 60, r: 40, class: 'er-rim' }), svg('circle', { cx: 560, cy: 60, r: 4, class: 'er-hub' }), svg('path', { d: 'M520 60 A 40 40 0 0 1 600 60', class: 'er-upper' }));
  return s;
}
