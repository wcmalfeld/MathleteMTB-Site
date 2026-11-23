// Race-Day Workshop drawings (SVG). Each takes numbers that already came
// from logic/models.js and only draws them: nothing here does the maths.

import { svg } from '../../lesson-kit/dom.js';

const t = (x, y, text, cls, extra) => svg('text', { x, y, class: cls || 'ms-svg-label', ...(extra || {}) }, text);

// ------------------------------------------------------------ the shock
// Two views of one rear shock: fully extended, and with the rider on it.
// r = sagReading() from the model.
export function shockDiagram(r) {
  const W = 620, k = 3.4;                    // px per mm of stroke
  const x0 = 40, body = 190, eye = 16;
  const s = svg('svg', { viewBox: `0 0 ${W} 250`, class: 'rd-shock', role: 'img',
    'aria-label': `Rear shock: ${r.stroke} mm stroke, ${fmt(r.sag)} mm of sag, ${fmt(r.pct, 1)}% of the stroke.` });
  const draw = (y, exposed, label, cls) => {
    const end = x0 + eye + body + exposed;
    return svg('g', { class: cls },
      t(x0 - 4, y - 32, label, 'ms-svg-kicker'),
      svg('circle', { cx: x0, cy: y, r: eye - 4, class: 'rd-sh-eye' }),
      svg('rect', { x: x0 + eye - 4, y: y - 22, width: body, height: 44, rx: 6, class: 'rd-sh-body' }),
      svg('rect', { x: x0 + eye + body - 4, y: y - 9, width: exposed + 4, height: 18, class: 'rd-sh-shaft' }),
      svg('circle', { cx: end + eye - 4, cy: y, r: eye - 4, class: 'rd-sh-eye' }));
  };
  const full = r.stroke * k, sat = (r.stroke - r.sag) * k;
  const seal = x0 + eye + body;
  s.append(draw(62, full, 'Fully extended', 'rd-sh rd-sh--ghost'), draw(176, sat, 'Rider on the bike (sag)', 'rd-sh'));
  // total stroke bracket (top)
  s.append(dim(seal, seal + full, 100, `total stroke T = ${r.stroke} mm`, 'rd-dim'));
  // o-ring: pushed to the seal + sag position on the shaft
  s.append(svg('rect', { x: seal + sat - 3, y: 176 - 12, width: 6, height: 24, rx: 2, class: 'rd-sh-oring' }));
  // sag bracket (bottom): the length the shock lost
  s.append(dim(seal + sat, seal + full, 214, `sag s = ${fmt(r.sag)} mm`, r.within ? 'rd-dim rd-dim--ok' : 'rd-dim rd-dim--warn', true));
  s.append(svg('line', { x1: seal + full, y1: 84, x2: seal + full, y2: 224, class: 'rd-guide' }));
  return s;
}
function dim(x1, x2, y, label, cls, below) {
  return svg('g', { class: cls },
    svg('line', { x1, y1: y, x2, y2: y }), svg('line', { x1, y1: y - 6, x2: x1, y2: y + 6 }), svg('line', { x1: x2, y1: y - 6, x2, y2: y + 6 }),
    t((x1 + x2) / 2, below ? y + 22 : y - 8, label, 'ms-svg-label ms-mid'));
}

// A 0–50% bar with the window shaded and the reading marked.
export function sagBar(r) {
  const W = 620, L = 30, R = 590, max = 50, X = p => L + (R - L) * Math.min(max, Math.max(0, p)) / max;
  const s = svg('svg', { viewBox: `0 0 ${W} 74`, class: 'rd-bar', role: 'img',
    'aria-label': `Sag ${fmt(r.pct, 1)}%: ${r.within ? 'inside' : 'outside'} the ${r.lo}–${r.hi}% window.` });
  s.append(svg('rect', { x: L, y: 24, width: R - L, height: 14, class: 'rd-bar-track' }),
    svg('rect', { x: X(r.lo), y: 20, width: X(r.hi) - X(r.lo), height: 22, class: 'rd-bar-zone' }),
    t(X(r.lo), 14, r.lo + '%', 'ms-svg-label ms-mid'), t(X(r.hi), 14, r.hi + '%', 'ms-svg-label ms-mid'));
  [0, 10, 20, 30, 40, 50].forEach(p => s.append(t(X(p), 62, p + '%', 'ms-svg-small ms-mid')));
  const x = X(r.pct);
  s.append(svg('path', { d: `M${x} 46 l -8 12 h 16 Z`, class: r.within ? 'rd-marker rd-marker--ok' : 'rd-marker rd-marker--warn' }),
    svg('line', { x1: x, y1: 18, x2: x, y2: 44, class: r.within ? 'rd-needle rd-needle--ok' : 'rd-needle rd-needle--warn' }));
  return s;
}

// ------------------------------------------------------------ tolerance gauge
// Number line 20–35%: window, target, reading, and the distance between
// reading and target (the absolute value).
export const GAUGE = { min: 20, max: 35, L: 34, R: 586 };
export const gaugeX = p => GAUGE.L + (GAUGE.R - GAUGE.L) * (p - GAUGE.min) / (GAUGE.max - GAUGE.min);
export const gaugeP = x => GAUGE.min + (GAUGE.max - GAUGE.min) * (x - GAUGE.L) / (GAUGE.R - GAUGE.L);
export function toleranceLine(p, mid, tol, within) {
  const s = svg('svg', { viewBox: '0 0 620 128', class: 'rd-gauge', role: 'img',
    'aria-label': `Number line: target ${mid}%, window ${mid - tol}% to ${mid + tol}%, reading ${fmt(p, 1)}%, ${fmt(Math.abs(p - mid), 1)} points from the target.` });
  const y = 70, X = gaugeX;
  s.append(svg('rect', { x: X(mid - tol), y: y - 14, width: X(mid + tol) - X(mid - tol), height: 28, class: 'rd-bar-zone' }),
    svg('line', { x1: GAUGE.L, y1: y, x2: GAUGE.R, y2: y, class: 'rd-axis' }));
  for (let v = GAUGE.min; v <= GAUGE.max; v += 1) {
    const big = v % 5 === 0;
    s.append(svg('line', { x1: X(v), y1: y - (big ? 8 : 4), x2: X(v), y2: y + (big ? 8 : 4), class: 'rd-tick' }));
    if (big) s.append(t(X(v), y + 26, v + '%', 'ms-svg-small ms-mid'));
  }
  s.append(svg('line', { x1: X(mid), y1: y - 22, x2: X(mid), y2: y + 14, class: 'rd-target' }), t(X(mid), y - 28, `target ${mid}%`, 'ms-svg-label ms-mid'));
  // distance bracket
  const a = X(Math.min(p, mid)), b = X(Math.max(p, mid));
  s.append(svg('line', { x1: a, y1: y + 40, x2: b, y2: y + 40, class: within ? 'rd-dev rd-dev--ok' : 'rd-dev rd-dev--warn' }));
  const x = X(Math.min(GAUGE.max, Math.max(GAUGE.min, p)));
  s.append(svg('circle', { cx: x, cy: y, r: 11, class: within ? 'rd-knob rd-knob--ok' : 'rd-knob rd-knob--warn' }),
    t(x, y - 18 + (Math.abs(x - X(mid)) < 60 ? -18 : 0), fmt(p, 1) + '%', 'ms-svg-label ms-mid ms-strong'));
  return s;
}

// ------------------------------------------------------------ race stage map
// run = raceRun() from the model; at = 0…1, the rider's position by time.
export function stageMap(run, at) {
  const s = svg('svg', { viewBox: '0 0 620 222', class: 'rd-stage', role: 'img',
    'aria-label': `Stage map: section 1, ${fmt(run.d1)} km at ${fmt(run.v1)} km/h; section 2, ${fmt(run.d2)} km at ${fmt(run.v)} km/h.` });
  // contour background
  [0, 1, 2, 3, 4].forEach(i => s.append(svg('ellipse', { cx: 430, cy: 120, rx: 60 + i * 44, ry: 34 + i * 22, class: 'rd-contour' })));
  // The course: section 1 then section 2, lengths in proportion to distance.
  const pts = [[30, 170], [120, 150], [190, 168], [260, 120], [330, 132], [400, 86], [470, 100], [540, 52], [592, 60]];
  const path = svg('path', { d: 'M' + pts.map(p => p.join(' ')).join(' L '), class: 'rd-course' });
  s.append(path);
  const total = pathLength(pts), split = run.d1 / run.total;
  const p1 = pointAt(pts, split * total);
  s.append(svg('path', { d: 'M' + slice(pts, 0, split * total).map(p => p.join(' ')).join(' L '), class: 'rd-course rd-course--s1' }),
    svg('circle', { cx: pts[0][0], cy: pts[0][1], r: 6, class: 'rd-cp' }), t(pts[0][0], pts[0][1] + 26, 'START', 'ms-svg-kicker ms-mid'),
    svg('rect', { x: p1[0] - 5, y: p1[1] - 5, width: 10, height: 10, class: 'rd-cp rd-cp--split' }), t(p1[0], p1[1] - 16, `SPLIT · ${fmt(run.d1)} km`, 'ms-svg-kicker ms-mid'),
    svg('circle', { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 6, class: 'rd-cp rd-cp--end' }), t(pts[pts.length - 1][0] - 6, pts[pts.length - 1][1] - 16, 'FINISH', 'ms-svg-kicker ms-end'),
    t(30, 210, `Section 1 · ${fmt(run.d1)} km @ ${fmt(run.v1)} km/h`, 'ms-svg-small'),
    t(330, 210, `Section 2 · ${fmt(run.d2)} km @ ${fmt(run.v)} km/h`, 'ms-svg-small'));
  // Rider: position by time (section 1 at v1, then section 2 at v).
  const tNow = at * run.time;
  const dist = tNow <= run.t1 ? run.v1 * tNow : run.d1 + run.v * (tNow - run.t1);
  const r = pointAt(pts, Math.min(1, dist / run.total) * total);
  s.append(svg('circle', { cx: r[0], cy: r[1], r: 9, class: 'rd-rider' }), svg('circle', { cx: r[0], cy: r[1], r: 3.5, class: 'rd-rider-dot' }));
  return s;
}
const seg = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const pathLength = pts => pts.slice(1).reduce((n, p, i) => n + seg(pts[i], p), 0);
function pointAt(pts, d) {
  for (let i = 1; i < pts.length; i++) { const l = seg(pts[i - 1], pts[i]); if (d <= l) { const f = l ? d / l : 0; return [pts[i - 1][0] + f * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + f * (pts[i][1] - pts[i - 1][1])]; } d -= l; }
  return pts[pts.length - 1];
}
function slice(pts, from, to) {
  const out = [pts[0]]; let d = 0;
  for (let i = 1; i < pts.length; i++) { const l = seg(pts[i - 1], pts[i]); if (d + l >= to) { out.push(pointAt(pts, to)); return out; } out.push(pts[i]); d += l; }
  return out;
}

// Time budget: section 1 + section 2 against the time the target allows.
export function timeBudget(run) {
  const maxMin = Math.max(run.time, run.tTarget) * 60 * 1.12, L = 20, R = 600, X = m => L + (R - L) * m / maxMin;
  const s = svg('svg', { viewBox: '0 0 620 70', class: 'rd-budget', role: 'img',
    'aria-label': `Time: section 1 ${fmt(run.t1 * 60, 1)} min plus section 2 ${fmt(run.t2 * 60, 1)} min is ${fmt(run.time * 60, 1)} min, against ${fmt(run.tTarget * 60, 1)} min allowed.` });
  const m1 = run.t1 * 60, m2 = run.t2 * 60, mt = run.tTarget * 60;
  s.append(svg('rect', { x: X(0), y: 14, width: X(m1) - X(0), height: 24, class: 'rd-bud-1' }),
    svg('rect', { x: X(m1), y: 14, width: X(m1 + m2) - X(m1), height: 24, class: run.meets ? 'rd-bud-2 rd-bud-2--ok' : 'rd-bud-2 rd-bud-2--warn' }),
    svg('line', { x1: X(mt), y1: 6, x2: X(mt), y2: 46, class: 'rd-target' }),
    t(X(mt), 62, `allowed ${fmt(mt, 1)} min`, 'ms-svg-small ms-mid'),
    t(X(m1 / 2), 31, 'S1', 'ms-svg-kicker ms-mid ms-dark'), X(m1 + m2) - X(m1) > 30 ? t(X(m1 + m2 / 2), 31, 'S2', 'ms-svg-kicker ms-mid ms-dark') : null);
  return s;
}

// ------------------------------------------------------------ trail survey
// v = survey(a, c) from the model; up: show the climb (true) or the drop.
export function surveyTriangle(v, up) {
  const s = svg('svg', { viewBox: '0 0 620 280', class: 'rd-survey', role: 'img',
    'aria-label': v.real ? `Side profile: ${v.a} m horizontal, ${v.c} m straight line, ${up ? 'climbing' : 'dropping'} ${fmt(v.rise, 1)} m.` : `Side profile: a ${v.c} m straight line can’t span ${v.a} m horizontally, so there is no real elevation change.` });
  [0, 1, 2, 3].forEach(i => s.append(svg('line', { x1: 0, y1: 40 + i * 60, x2: 620, y2: 40 + i * 60, class: 'rd-grid' })));
  if (!v.real) {
    s.append(svg('line', { x1: 60, y1: 200, x2: 560, y2: 200, class: 'rd-leg' }), t(310, 226, `horizontal a = ${v.a} m`, 'ms-svg-label ms-mid'),
      svg('line', { x1: 60, y1: 200, x2: 60 + 500 * v.c / v.a, y2: 200, class: 'rd-hyp rd-hyp--bad' }), t(310, 110, `c = ${v.c} m is shorter than a: h² = c² − a² < 0`, 'ms-svg-label ms-mid rd-warn-text'));
    return s;
  }
  // Scale so the triangle fits: horizontal up to 480 px, vertical up to 170 px.
  const k = Math.min(420 / v.a, 170 / Math.max(v.rise, 1e-6));
  const w = v.a * k, h = v.rise * k;
  const x1 = 70, x2 = x1 + w, base = up ? 230 : 60 + h;
  // up: start low left, finish high right. down: start high left, finish low right.
  const S = up ? [x1, base] : [x1, base - h], F = up ? [x2, base - h] : [x2, base];
  const corner = up ? [x2, base] : [x2, base - h];
  s.append(svg('path', { d: `M${S[0]} ${S[1]} L${corner[0]} ${corner[1]} L${F[0]} ${F[1]} Z`, class: 'rd-tri' }));
  // terrain profile riding along the hypotenuse
  const prof = []; for (let i = 0; i <= 24; i++) { const f = i / 24; prof.push([S[0] + f * (F[0] - S[0]), S[1] + f * (F[1] - S[1]) + Math.sin(f * Math.PI * 3) * 6 * Math.sin(f * Math.PI)]); }
  s.append(svg('path', { d: 'M' + prof.map(p => p.map(n => n.toFixed(1)).join(' ')).join(' L '), class: 'rd-terrain' }),
    svg('line', { x1: S[0], y1: S[1], x2: corner[0], y2: corner[1], class: 'rd-leg' }),
    svg('line', { x1: corner[0], y1: corner[1], x2: F[0], y2: F[1], class: 'rd-leg rd-leg--h' }),
    svg('line', { x1: S[0], y1: S[1], x2: F[0], y2: F[1], class: 'rd-hyp' }),
    svg('path', { d: up ? `M${corner[0] - 14} ${corner[1]} v -14 h 14` : `M${corner[0] - 14} ${corner[1]} v 14 h 14`, class: 'rd-right-angle' }),
    svg('circle', { cx: S[0], cy: S[1], r: 6, class: 'rd-cp' }), svg('circle', { cx: F[0], cy: F[1], r: 6, class: 'rd-cp rd-cp--end' }),
    t(S[0] - 10, S[1] + (up ? 24 : -14), 'A (start)', 'ms-svg-kicker'), t(F[0] + 10, F[1] + 4, 'B', 'ms-svg-kicker'),
    t((S[0] + corner[0]) / 2, corner[1] + (up ? 22 : -10), `a = ${v.a} m`, 'ms-svg-label ms-mid'),
    t(corner[0] + 10, (corner[1] + F[1]) / 2 + 4, `h = ${up ? '+' : '−'}${fmt(v.rise, 1)} m`, 'ms-svg-label ms-strong'),
    t((S[0] + F[0]) / 2 - 20, (S[1] + F[1]) / 2 - 12, `c = ${v.c} m`, 'ms-svg-label ms-end'));
  return s;
}

const fmt = (x, d = 2) => String(Number(Number(x).toFixed(d)));
