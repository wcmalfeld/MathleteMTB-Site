// Suspension & Systems Lab drawings (SVG). They only draw numbers that came
// from logic/models.js and expo.js: a stylised rear shock, a decibel meter,
// a registration capacity bar, and the opening art.

import { el, svg } from '../../lesson-kit/dom.js';

const t = (x, y, text, cls, extra) => svg('text', { x, y, class: cls || 'ms-svg-small', ...(extra || {}) }, text);

// A stylised coil-over rear shock, vertical. disp: current displacement (mm,
// positive = compressed), max: the largest displacement drawn.
export function shockView(disp, max, label) {
  const W = 200, H = 300, top = 30, bottom = 270, rest = bottom - top, squash = Math.max(-0.35, Math.min(0.35, (disp / Math.max(1, max)) * 0.35));
  const len = rest * (1 - squash), yTop = bottom - len, coils = 9, cx = 100;
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ss-shock', role: 'img', 'aria-label': label });
  s.append(svg('rect', { x: 0, y: 0, width: W, height: H, class: 'ss-panel-bg' }),
    svg('circle', { cx, cy: yTop, r: 12, class: 'ss-eyelet' }), svg('circle', { cx, cy: bottom, r: 12, class: 'ss-eyelet' }),
    svg('rect', { x: cx - 14, y: yTop + 10, width: 28, height: len * 0.55, rx: 4, class: 'ss-body' }),
    svg('rect', { x: cx - 6, y: yTop + 10 + len * 0.5, width: 12, height: bottom - (yTop + 10 + len * 0.5) - 10, class: 'ss-shaft' }));
  let d = `M${cx - 30} ${yTop + 22}`;
  for (let i = 0; i < coils; i++) { const y1 = yTop + 22 + (len - 44) * (i + 0.5) / coils, y2 = yTop + 22 + (len - 44) * (i + 1) / coils; d += ` Q ${cx + 50} ${y1}, ${cx - 30} ${y2}`; }
  s.append(svg('path', { d, class: 'ss-spring' }), t(cx, H - 6, `${disp >= 0 ? 'compressed' : 'extended'} ${Math.abs(disp).toFixed(1)} mm`, 'ms-svg-kicker ms-mid'),
    t(14, 22, 'SPRING + DAMPER', 'ms-svg-kicker'));
  return s;
}

// A decibel meter from 0 to 120 dB.
export function dbMeter(L, label) {
  const s = svg('svg', { viewBox: '0 0 240 172', class: 'ss-meter', role: 'img', 'aria-label': label || `${L.toFixed(1)} dB` });
  const ang = v => Math.PI * (1 - Math.max(0, Math.min(120, v)) / 120), P = (v, r) => [120 + r * Math.cos(ang(v)), 130 - r * Math.sin(ang(v))];
  const arc = (a, b) => { const [x0, y0] = P(a, 96), [x1, y1] = P(b, 96); return `M${x0} ${y0} A96 96 0 0 1 ${x1} ${y1}`; };
  s.append(svg('path', { d: arc(0, 120), class: 'ss-meter-track' }), svg('path', { d: arc(0, Math.max(0.5, L)), class: 'ss-meter-fill' }));
  for (let v = 0; v <= 120; v += 20) { const [x0, y0] = P(v, 84), [x1, y1] = P(v, 100), [xt, yt] = P(v, 70); s.append(svg('line', { x1: x0, y1: y0, x2: x1, y2: y1, class: 'ss-meter-tick' }), t(xt, yt + 4, String(v), 'ms-svg-small ms-mid')); }
  const [nx, ny] = P(L, 90);
  s.append(svg('line', { x1: 120, y1: 130, x2: nx, y2: ny, class: 'ss-needle' }), svg('circle', { cx: 120, cy: 130, r: 6, class: 'ss-hub' }), t(120, 164, `${L.toFixed(1)} dB`, 'ss-meter-num ms-mid'));
  return s;
}

// Registration progress toward capacity (HTML, so it reflows on phones).
export function capacityBar(n, cap) {
  const pct = Math.min(100, n / cap * 100);
  return el('div', { class: 'ss-cap', role: 'img', 'aria-label': `${Math.round(n)} of ${cap} riders (${Math.round(pct)}% of capacity)` },
    el('div', { class: 'ss-cap-top' }, el('span', null, 'Registrations'), el('b', null, `${Math.round(n)} / ${cap}`)),
    el('div', { class: 'ss-cap-track' }, el('div', { class: 'ss-cap-fill' + (n > cap ? ' is-over' : ''), style: { width: pct + '%' } })),
    n > cap ? el('p', { class: 'ls-small ss-over' }, 'Over capacity: the model no longer describes the real event.') : null);
}

// Opening art: a rear shock, an oscillation display, a registration dashboard and a sound meter.
export function openingArt() {
  const s = svg('svg', { viewBox: '0 0 640 420', class: 'ss-art', 'aria-hidden': 'true', focusable: 'false' });
  s.append(svg('rect', { x: 0, y: 0, width: 640, height: 420, class: 'ss-art-bg' }));
  // oscillation telemetry
  s.append(svg('rect', { x: 24, y: 24, width: 330, height: 180, rx: 6, class: 'ss-art-screen' }), t(38, 46, 'REBOUND TELEMETRY · Aₙ = 18(0.65)ⁿ', 'ms-svg-kicker'));
  const osc = [], up = [], dn = [];
  for (let i = 0; i <= 200; i++) { const x = i / 200 * 3.2, e = 60 * Math.pow(0.65, x / 0.5); osc.push(`${40 + x * 95} ${120 - e * Math.cos(2 * Math.PI * x / 0.5)}`); up.push(`${40 + x * 95} ${120 - e}`); dn.push(`${40 + x * 95} ${120 + e}`); }
  s.append(svg('path', { d: 'M40 120 h 300', class: 'ss-art-axis' }), svg('path', { d: 'M' + osc.join(' L '), class: 'ss-art-osc' }), svg('path', { d: 'M' + up.join(' L '), class: 'ss-art-env' }), svg('path', { d: 'M' + dn.join(' L '), class: 'ss-art-env' }));
  // shock
  s.append(svg('g', { class: 'ss-art-shock' }, svg('circle', { cx: 470, cy: 50, r: 10, class: 'ss-eyelet' }), svg('rect', { x: 460, y: 58, width: 20, height: 70, rx: 4, class: 'ss-body' }), svg('rect', { x: 465, y: 120, width: 10, height: 60, class: 'ss-shaft' }), svg('circle', { cx: 470, cy: 190, r: 10, class: 'ss-eyelet' }),
    svg('path', { d: 'M450 70 Q 500 80, 450 90 Q 500 100, 450 110 Q 500 120, 450 130 Q 500 140, 450 150 Q 500 160, 450 170', class: 'ss-spring' })));
  // registrations
  s.append(svg('rect', { x: 24, y: 236, width: 290, height: 160, rx: 6, class: 'ss-art-screen' }), t(38, 258, 'TRAIL FESTIVAL · R(w) = 100(1.2)ʷ', 'ms-svg-kicker'));
  [100, 120, 144, 173, 207, 249, 299].forEach((v, i) => s.append(svg('rect', { x: 44 + i * 38, y: 380 - v * 0.38, width: 26, height: v * 0.38, class: 'ss-art-bar' })));
  // meter
  const m = dbMeter(70, '');
  s.append(svg('rect', { x: 340, y: 236, width: 276, height: 160, rx: 6, class: 'ss-art-screen' }), t(354, 258, 'SOUND · L = 10 log₁₀(I/I₀)', 'ms-svg-kicker'), svg('g', { transform: 'translate(385 262) scale(0.78)' }, ...[...m.childNodes].map(n => n.cloneNode(true))));
  return s;
}
