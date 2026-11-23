// Trail Dynamics Lab drawings (SVG). They only draw numbers that came from
// logic/models.js: the downhill braking scene, a speedometer, the side-view
// jump, and the opening art.

import { svg } from '../../lesson-kit/dom.js';

const t = (x, y, text, cls, extra) => svg('text', { x, y, class: cls || 'ms-svg-small', ...(extra || {}) }, text);

// Downhill braking scene: reaction (blue) then braking (orange) to scale.
// s = stopping(model, v). maxD = the longest total shown (scale).
export function brakeScene(s, maxD) {
  const W = 640, H = 200, x0 = 70, len = 520, y = (x) => 70 + (x - x0) * 0.12, scale = len / Math.max(1, maxD);
  const xR = x0 + s.reaction * scale, xB = xR + s.braking * scale;
  const sc = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'td-brake', role: 'img',
    'aria-label': `At ${s.v} km/h: ${s.reaction.toFixed(1)} m of reaction distance, then ${s.braking.toFixed(1)} m of braking, ${s.total.toFixed(1)} m in total.` });
  sc.append(svg('path', { d: `M0 ${y(0) + 30} L${W} ${y(W) + 30} L${W} ${H} L0 ${H} Z`, class: 'td-hill' }),
    svg('path', { d: `M0 ${y(0) + 30} L${W} ${y(W) + 30}`, class: 'td-trailline' }));
  // zones along the trail
  const seg = (a, b, cls) => svg('line', { x1: a, y1: y(a) + 30, x2: b, y2: y(b) + 30, class: cls });
  sc.append(seg(x0, xR, 'td-zone td-zone--react'), seg(xR, Math.max(xR, xB), 'td-zone td-zone--brake'));
  [x0, xR, xB].forEach((x, i) => sc.append(svg('line', { x1: x, y1: y(x) + 12, x2: x, y2: y(x) + 48, class: i === 2 ? 'td-tick td-tick--stop' : 'td-tick' })));
  sc.append(t(x0, y(x0) + 66, 'sees the corner', 'ms-svg-kicker ms-mid'), t(xR, y(xR) + 66, xR - x0 > 70 ? 'brakes on' : '', 'ms-svg-kicker ms-mid'), t((x0 + xR) / 2, y((x0 + xR) / 2) + 8, `reaction ${s.reaction.toFixed(1)} m`, 'ms-svg-small ms-mid td-react-text'),
    t((xR + xB) / 2, y((xR + xB) / 2) + 64, `braking ${s.braking.toFixed(1)} m`, 'ms-svg-small ms-mid td-brake-text'), t(Math.min(W - 10, xB + 6), y(xB) + 10, 'STOP', 'ms-svg-kicker'),
    t(W - 10, 20, `total ${s.total.toFixed(1)} m`, 'ms-svg-label ms-end ms-strong'));
  // corner sign at the far end
  sc.append(svg('path', { d: `M${W - 30} ${y(W - 30) - 4} v -30 h 22 l -11 -16 l -11 16`, class: 'td-sign' }));
  // the rider (bike) at the start of the zone
  const bx = x0 - 30, by = y(bx) + 22;
  sc.append(svg('g', { class: 'td-bike', transform: `translate(${bx} ${by}) rotate(7)` },
    svg('circle', { cx: -14, cy: 0, r: 9 }), svg('circle', { cx: 14, cy: 0, r: 9 }), svg('path', { d: 'M-14 0 L-2 -12 L14 0 M-2 -12 L8 -12 M-2 -12 L-8 -20' }), svg('circle', { cx: -6, cy: -26, r: 4, class: 'td-head' })));
  return sc;
}

// A speedometer, 0–40 km/h.
export function speedometer(v, max = 40) {
  const s = svg('svg', { viewBox: '0 0 140 90', class: 'td-speedo', role: 'img', 'aria-label': `Speed ${v} km/h` });
  const arc = (a0, a1) => { const p = a => [70 + 56 * Math.cos(Math.PI * (1 - a)), 76 - 56 * Math.sin(Math.PI * (1 - a))]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0} ${y0} A56 56 0 0 1 ${x1} ${y1}`; };
  s.append(svg('path', { d: arc(0, 1), class: 'td-speedo-track' }), svg('path', { d: arc(0, Math.max(0.001, v / max)), class: 'td-speedo-fill' }),
    t(70, 70, String(v), 'td-speedo-num ms-mid'), t(70, 86, 'km/h', 'ms-svg-kicker ms-mid'));
  return s;
}

// Side-view jump: takeoff lip, landing, the trajectory and the rider at x.
export function jumpScene(Q, domain, x) {
  const W = 640, H = 190, pad = 40, sx = (W - 2 * pad) / (domain[1] - domain[0]), maxY = Math.max(1, Number(Q.k) * 1.2), sy = 120 / maxY;
  const X = v => pad + (v - domain[0]) * sx, Y = h => 160 - h * sy;
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'td-jump', 'aria-hidden': 'true', focusable: 'false' });
  s.append(svg('path', { d: `M0 160 L${X(domain[0])} 160 L${X(domain[0]) - 30} 160 L${X(domain[0])} ${Y(0) - 0}`, class: 'td-ground' }),
    svg('path', { d: `M${X(domain[0]) - 46} 160 Q ${X(domain[0]) - 6} 158, ${X(domain[0])} 150 L ${X(domain[0])} 160 Z`, class: 'td-lip' }),
    svg('path', { d: `M${X(domain[1])} 150 Q ${X(domain[1]) + 10} 158, ${X(domain[1]) + 70} 160 L ${X(domain[1])} 160 Z`, class: 'td-lip' }),
    svg('line', { x1: 0, y1: 160, x2: W, y2: 160, class: 'td-groundline' }));
  const pts = []; for (let i = 0; i <= 40; i++) { const v = domain[0] + (domain[1] - domain[0]) * i / 40; pts.push(`${X(v).toFixed(1)} ${Y(Q.value(v)).toFixed(1)}`); }
  s.append(svg('path', { d: 'M' + pts.join(' L '), class: 'td-path' }));
  const rx = X(x), ry = Y(Q.value(x));
  s.append(svg('g', { class: 'td-bike', transform: `translate(${rx} ${ry - 10})` },
    svg('circle', { cx: -10, cy: 0, r: 7 }), svg('circle', { cx: 10, cy: 0, r: 7 }), svg('path', { d: 'M-10 0 L-1 -9 L10 0 M-1 -9 L6 -9 M-1 -9 L-5 -15' }), svg('circle', { cx: -3, cy: -20, r: 3.5, class: 'td-head' })));
  return s;
}

// Opening art: braking zone into a corner, a jump with a rider in the air,
// and a telemetry panel with a parabola.
export function openingArt() {
  const s = svg('svg', { viewBox: '0 0 640 420', class: 'td-art', 'aria-hidden': 'true', focusable: 'false' });
  s.append(svg('rect', { x: 0, y: 0, width: 640, height: 420, class: 'td-art-bg' }),
    svg('path', { d: 'M0 300 L 230 250 C 300 236, 330 250, 360 270 L 640 330 L 640 420 L 0 420 Z', class: 'td-hill' }),
    svg('path', { d: 'M40 292 L 200 258', class: 'td-zone td-zone--brake' }), t(40, 318, 'BRAKE ZONE', 'ms-svg-kicker'),
    svg('path', { d: 'M380 278 q 30 -10 46 -26 l 4 30 Z', class: 'td-lip' }), svg('path', { d: 'M560 312 q -40 -24 -70 -26 l 0 34 Z', class: 'td-lip' }),
    svg('path', { d: 'M430 254 Q 470 160 500 282', class: 'td-path' }));
  s.append(svg('g', { class: 'td-bike', transform: 'translate(462 196) rotate(-8)' }, svg('circle', { cx: -12, cy: 0, r: 8 }), svg('circle', { cx: 12, cy: 0, r: 8 }), svg('path', { d: 'M-12 0 L-2 -11 L12 0 M-2 -11 L7 -11 M-2 -11 L-6 -18' }), svg('circle', { cx: -4, cy: -24, r: 4, class: 'td-head' })));
  s.append(svg('rect', { x: 24, y: 24, width: 250, height: 150, rx: 4, class: 'td-art-screen' }), t(38, 46, 'TELEMETRY · D(v) = kv² + 0.25v', 'ms-svg-kicker'));
  const P = []; for (let i = 0; i <= 20; i++) { const v = i * 2; P.push(`${40 + v * 5.6} ${160 - (0.015 * v * v + 0.25 * v) * 3.2}`); }
  s.append(svg('path', { d: 'M' + P.join(' L '), class: 'td-art-trace' }), svg('path', { d: 'M40 160 h 224 M40 160 v -100', class: 'td-art-axis' }),
    t(160, 46 + 120, 'speed →', 'ms-svg-kicker'), t(340, 40, 'J(x) = −0.04(x − 10)² + 4', 'ms-svg-kicker td-art-ok'));
  return s;
}
