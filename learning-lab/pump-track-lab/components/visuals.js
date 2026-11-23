// Pump Track Profile Lab drawings (SVG). They only draw numbers that came
// from logic/models.js: the side-view profile with a rider, and the opening
// art. Heights are exaggerated vertically so the shape is readable.

import { svg } from '../../lesson-kit/dom.js';
import { value } from '../logic/poly.js';

const t = (x, y, text, cls, extra) => svg('text', { x, y, class: cls || 'ms-svg-small', ...(extra || {}) }, text);
const bike = (x, y, angle) => svg('g', { class: 'pt-bike', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})` },
  svg('circle', { cx: -11, cy: -7, r: 7 }), svg('circle', { cx: 11, cy: -7, r: 7 }),
  svg('path', { d: 'M-11 -7 L-1 -16 L11 -7 M-1 -16 L7 -16 M-1 -16 L-5 -23' }), svg('circle', { cx: -3, cy: -28, r: 3.5, class: 'pt-head' }));

// Side profile of p over domain, the reference line and the rider at x.
// lo/hi: the height window (m) the drawing covers.
export function profileScene(p, domain, x, lo = -0.3, hi = 0.4) {
  const W = 640, H = 190, pad = 34, [a, b] = domain, sx = (W - 2 * pad) / (b - a), sy = 140 / (hi - lo);
  const X = v => pad + (v - a) * sx, Y = h => 160 - (h - lo) * sy;
  const pts = []; for (let i = 0; i <= 120; i++) { const v = a + (b - a) * i / 120; pts.push(`${X(v).toFixed(1)} ${Y(value(p, v)).toFixed(1)}`); }
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'pt-scene', 'aria-hidden': 'true', focusable: 'false' });
  s.append(svg('path', { d: `M0 ${H} L0 ${Y(value(p, a))} L${X(a)} ${Y(value(p, a))} L ${pts.join(' L ')} L${W} ${Y(value(p, b))} L${W} ${H} Z`, class: 'pt-dirt' }),
    svg('path', { d: `M${pts.join(' L ')}`, class: 'pt-surface' }),
    svg('line', { x1: 0, y1: Y(0), x2: W, y2: Y(0), class: 'pt-ref' }), t(W - 6, Y(0) - 6, 'reference elevation', 'ms-svg-kicker ms-end'),
    t(X(a), H - 6, `${a} m`, 'ms-svg-kicker ms-mid'), t(X(b), H - 6, `${b} m`, 'ms-svg-kicker ms-mid'));
  const e = 0.01, slope = (value(p, x + e) - value(p, x - e)) / (2 * e) * sy / sx;
  s.append(bike(X(x), Y(value(p, x)), -Math.atan(slope) * 180 / Math.PI));
  return s;
}

// Opening art: a row of pump-track rollers, a rider, and a "profile scan"
// screen with a quartic trace.
export function openingArt() {
  const s = svg('svg', { viewBox: '0 0 640 420', class: 'pt-art', 'aria-hidden': 'true', focusable: 'false' });
  const ground = []; for (let i = 0; i <= 160; i++) { const x = i * 4; ground.push(`${x} ${(300 - 34 * Math.sin((x - 40) / 64) * (x > 40 ? 1 : 0)).toFixed(1)}`); }
  s.append(svg('rect', { x: 0, y: 0, width: 640, height: 420, class: 'pt-art-bg' }),
    svg('path', { d: `M0 420 L ${ground.join(' L ')} L 640 420 Z`, class: 'pt-dirt' }), svg('path', { d: 'M' + ground.join(' L '), class: 'pt-surface' }),
    svg('line', { x1: 0, y1: 300, x2: 640, y2: 300, class: 'pt-ref' }));
  const rx = 40 + 64 * Math.PI / 2 * 3.0, ry = 300 - 34 * Math.sin((rx - 40) / 64);
  s.append(bike(rx, ry, 0));
  s.append(svg('rect', { x: 24, y: 24, width: 270, height: 160, rx: 4, class: 'pt-art-screen' }), t(38, 46, 'PROFILE SCAN · P(x), 0 ≤ x ≤ 8', 'ms-svg-kicker'));
  const P = []; for (let i = 0; i <= 64; i++) { const x = i / 8, y = 0.005 * x * (x - 2) * (x - 6) * (x - 8); P.push(`${(44 + x * 30).toFixed(1)} ${(118 - y * 150).toFixed(1)}`); }
  s.append(svg('path', { d: 'M44 118 h 240', class: 'pt-art-axis' }), svg('path', { d: 'M' + P.join(' L '), class: 'pt-art-trace' }),
    ...[0, 2, 6, 8].map(z => svg('circle', { cx: 44 + z * 30, cy: 118, r: 4, class: 'pt-art-zero' })),
    t(38, 172, '0.005x(x − 2)(x − 6)(x − 8)', 'ms-svg-kicker pt-art-ok'), t(360, 52, 'degree 4 · 3 turning points', 'ms-svg-kicker'));
  return s;
}
