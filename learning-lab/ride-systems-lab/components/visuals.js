// Ride Systems Lab drawings (SVG): the drivetrain, a top-down trail map
// with the rider, and the opening screen's telemetry art. They only draw
// numbers that came from logic/models.js.

import { svg } from '../../lesson-kit/dom.js';
import { TRAIL } from '../logic/models.js';

const t = (x, y, text, cls, extra) => svg('text', { x, y, class: cls || 'ms-svg-small', ...(extra || {}) }, text);
const rad = a => a * Math.PI / 180;

// A sprocket outline with n teeth.
function sprocket(cx, cy, r, n, cls) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = rad(i * 360 / n), a1 = rad((i + 0.5) * 360 / n);
    const p = (a, rr) => `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    d += (i ? 'L' : 'M') + p(a0, r + 4) + ' L' + p(a1, r - 2) + ' ';
  }
  return svg('path', { d: d + 'Z', class: cls });
}

// The drivetrain. dt = drivetrain() from the model; angles in degrees
// (crank and wheel), so a component can animate them.
export function drivetrainDrawing(dt, crankAngle = 0, wheelAngle = 0, chainShift = 0) {
  const s = svg('svg', { viewBox: '0 0 640 300', class: 'rs-drive', role: 'img',
    'aria-label': `Drivetrain: ${dt.front}-tooth chainring, ${dt.rear}-tooth sprocket, gear ratio ${Number(dt.G.toFixed(3))}, wheel circumference ${dt.circumference} m.` });
  const fx = 190, fy = 170, fr = dt.front * 2.1, rx = 470, ry = 150, rr = dt.rear * 2.1, wr = 132;
  // wheel (behind)
  s.append(svg('circle', { cx: rx, cy: ry, r: wr, class: 'rs-tire' }), svg('circle', { cx: rx, cy: ry, r: wr - 12, class: 'rs-rim' }));
  const spokes = svg('g', { transform: `rotate(${wheelAngle} ${rx} ${ry})` });
  for (let i = 0; i < 12; i++) { const a = rad(i * 30); spokes.append(svg('line', { x1: rx, y1: ry, x2: rx + (wr - 12) * Math.cos(a), y2: ry + (wr - 12) * Math.sin(a), class: 'rs-spoke' })); }
  spokes.append(svg('circle', { cx: rx + (wr - 6), cy: ry, r: 4, class: 'rs-valve' }));
  s.append(spokes);
  // chain: top and bottom runs (tangent lines), dashed links that move
  const top = `M${fx} ${fy - fr - 2} L${rx} ${ry - rr - 2}`, bot = `M${fx} ${fy + fr + 2} L${rx} ${ry + rr + 2}`;
  s.append(svg('path', { d: top + ' ' + bot, class: 'rs-chain', style: { strokeDashoffset: String(-chainShift) } }));
  // sprockets
  s.append(svg('g', { transform: `rotate(${wheelAngle} ${rx} ${ry})` }, sprocket(rx, ry, rr, dt.rear, 'rs-cog')),
    svg('g', { transform: `rotate(${crankAngle} ${fx} ${fy})` }, sprocket(fx, fy, fr, dt.front, 'rs-ring'),
      svg('line', { x1: fx, y1: fy, x2: fx + 78, y2: fy, class: 'rs-crank' }), svg('rect', { x: fx + 70, y: fy - 7, width: 26, height: 14, rx: 3, class: 'rs-pedal' }),
      svg('line', { x1: fx, y1: fy, x2: fx - 78, y2: fy, class: 'rs-crank rs-crank--far' })),
    svg('circle', { cx: fx, cy: fy, r: 8, class: 'rs-hub' }), svg('circle', { cx: rx, cy: ry, r: 7, class: 'rs-hub' }));
  // labels
  s.append(t(fx, fy + fr + 34, `chainring · ${dt.front}T`, 'ms-svg-kicker ms-mid'), t(rx, ry + rr + 26, `sprocket · ${dt.rear}T`, 'ms-svg-kicker ms-mid'),
    t(rx, ry - wr - 6, `wheel · ${dt.circumference.toFixed(2)} m around`, 'ms-svg-kicker ms-mid'), t(fx, fy - fr - 16, 'crank', 'ms-svg-kicker ms-mid'));
  s.append(svg('line', { x1: 20, y1: ry + wr, x2: 620, y2: ry + wr, class: 'rs-ground' }));
  return s;
}

// Top-down trail map: a winding singletrack with the rider at distance d.
const MAP = [[30, 110], [90, 60], [160, 92], [220, 40], [300, 70], [360, 30], [430, 80], [500, 50], [560, 96], [610, 64]];
const segLen = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
function along(pts, f) {
  const total = pts.slice(1).reduce((n, p, i) => n + segLen(pts[i], p), 0); let d = f * total;
  for (let i = 1; i < pts.length; i++) { const l = segLen(pts[i - 1], pts[i]); if (d <= l) return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * d / l, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * d / l]; d -= l; }
  return pts[pts.length - 1];
}
export function trailMap(d, profile = TRAIL) {
  const f = (d - profile.domain[0]) / (profile.domain[1] - profile.domain[0]);
  const s = svg('svg', { viewBox: '0 0 640 140', class: 'rs-map', role: 'img', 'aria-label': `Trail map: the rider is ${Number(d.toFixed(2))} km along the ${profile.name}.` });
  [0, 1, 2].forEach(i => s.append(svg('ellipse', { cx: 330, cy: 70, rx: 120 + i * 90, ry: 34 + i * 22, class: 'rs-contour' })));
  s.append(svg('path', { d: 'M' + MAP.map(p => p.join(' ')).join(' L '), class: 'rs-singletrack' }));
  const p = along(MAP, Math.max(0, Math.min(1, f)));
  s.append(svg('circle', { cx: MAP[0][0], cy: MAP[0][1], r: 6, class: 'rs-pin' }), t(MAP[0][0], MAP[0][1] + 22, 'START', 'ms-svg-kicker ms-mid'),
    svg('circle', { cx: MAP[MAP.length - 1][0], cy: MAP[MAP.length - 1][1], r: 6, class: 'rs-pin rs-pin--end' }), t(MAP[MAP.length - 1][0], MAP[MAP.length - 1][1] - 14, 'FINISH', 'ms-svg-kicker ms-mid'),
    svg('circle', { cx: p[0], cy: p[1], r: 9, class: 'rs-rider' }), svg('circle', { cx: p[0], cy: p[1], r: 3.5, class: 'rs-rider-dot' }));
  return s;
}

// Opening screen: a "performance software" panel with the drivetrain and
// the Pine Ridge profile. Decorative; the words say the same thing.
export function openingArt(dt) {
  const s = svg('svg', { viewBox: '0 0 640 420', class: 'rs-open-art', 'aria-hidden': 'true', focusable: 'false' });
  s.append(svg('rect', { x: 0, y: 0, width: 640, height: 420, class: 'rs-art-bg' }));
  const g = drivetrainDrawing(dt, 20, 40, 0);
  g.setAttribute('x', '0'); g.setAttribute('y', '0'); g.setAttribute('width', '640'); g.setAttribute('height', '300');
  s.append(g);
  // telemetry strip: the elevation profile
  const P = TRAIL.points, X = d => 40 + d / 3 * 560, Y = y => 400 - (y - 2380) / 190 * 80;
  s.append(svg('rect', { x: 20, y: 300, width: 600, height: 108, rx: 4, class: 'rs-art-screen' }),
    svg('path', { d: 'M' + P.map(([d, y]) => `${X(d)} ${Y(y)}`).join(' L '), class: 'rs-art-trace' }),
    t(36, 322, 'PINE RIDGE · E(d) · ELEVATION vs DISTANCE', 'ms-svg-kicker'), t(604, 322, 'S(c) = 0.276c', 'ms-svg-kicker ms-end rs-art-ok'));
  return s;
}
