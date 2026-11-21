// Small diagrams: the berm cross-section inset (bank angle and lean, no
// vectors), and the pictures in the explanations. Drawn from the engine.

import { svg } from './dom.js';
import { berm, fmt, DEFAULTS, LINES } from '../logic/physics.js';

// A rider + bike seen head-on, leaning by `lean` degrees (toward the left,
// the centre of the turn), standing on a contact point. Returns an SVG group.
export function riderHeadOn(len, lean, cls) {
  const g = svg('g', { class: 'bl-rider-head ' + (cls || ''), transform: `rotate(${-lean})` });
  g.append(
    svg('rect', { x: -3.2, y: -len * 0.36, width: 6.4, height: len * 0.36, rx: 3, class: 'bl-tire' }),          // wheel, end-on
    svg('line', { x1: 0, y1: -len * 0.36, x2: 0, y2: -len * 0.5, class: 'bl-frame' }),                           // fork/frame
    svg('line', { x1: -len * 0.2, y1: -len * 0.52, x2: len * 0.2, y2: -len * 0.52, class: 'bl-bars' }),           // handlebar
    svg('line', { x1: -len * 0.13, y1: -len * 0.5, x2: -len * 0.07, y2: -len * 0.82, class: 'bl-arm' }),
    svg('line', { x1: len * 0.13, y1: -len * 0.5, x2: len * 0.07, y2: -len * 0.82, class: 'bl-arm' }),
    svg('ellipse', { cx: 0, cy: -len * 0.78, rx: len * 0.12, ry: len * 0.17, class: 'bl-jersey' }),
    svg('circle', { cx: 0, cy: -len * 0.98, r: len * 0.085, class: 'bl-helmet' }));
  return g;
}

// The cross-section inset on the top-down view.
export function sectionInset() {
  const W = 220, H = 110, px = 120, py = 82;
  const node = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'bl-inset-svg', role: 'img' });
  const title = svg('title');
  const ground = svg('path', { class: 'bl-x-dirt' });
  const level = svg('line', { x1: 0, y1: py, x2: W, y2: py, class: 'bl-x-level' });
  const arc = svg('path', { class: 'bl-x-arc' });
  const riderWrap = svg('g', { transform: `translate(${px} ${py})` });
  const t1 = svg('text', { x: 8, y: H - 8, class: 'bl-inset-t' });
  const t2 = svg('text', { x: 8, y: 16, class: 'bl-inset-s' }, '← centre');
  node.append(title, ground, level, arc, riderWrap, t1, t2);
  function update(r) {
    const b = r.config.bermAngle * Math.PI / 180, tb = Math.tan(b);
    ground.setAttribute('d', `M 0 ${py + px * tb} L ${W} ${py - (W - px) * tb} L ${W} ${H} L 0 ${H} Z`);
    const R = 30;
    arc.setAttribute('d', b > 0.005 ? `M ${px + R} ${py} A ${R} ${R} 0 0 0 ${(px + R * Math.cos(b)).toFixed(1)} ${(py - R * Math.sin(b)).toFixed(1)}` : '');
    riderWrap.replaceChildren(riderHeadOn(62, r.leanAngle, 'bl-rider-inset'));
    t1.textContent = `berm ${fmt(r.config.bermAngle, 1)}° · lean ${fmt(r.leanAngle, 1)}°`;
    title.textContent = `Berm cross-section: banked ${fmt(r.config.bermAngle, 1)} degrees; rider and bike lean ${fmt(r.leanAngle, 1)} degrees toward the centre.`;
  }
  return { node, update };
}

// Pictures for the explanations (HELP[...].visual).
export function helpVisual(kind) {
  const W = 260, H = 140;
  const n = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'bl-help-svg', 'aria-hidden': 'true' });
  const arrow = (x1, y1, x2, y2, cls, w) => {
    const ang = Math.atan2(y2 - y1, x2 - x1), h = 8;
    return svg('g', { class: cls }, svg('line', { x1, y1, x2: x2 - Math.cos(ang) * h * 0.6, y2: y2 - Math.sin(ang) * h * 0.6, 'stroke-width': w || 2.5 }),
      svg('path', { d: `M ${x2} ${y2} L ${x2 - h * Math.cos(ang - 0.45)} ${y2 - h * Math.sin(ang - 0.45)} L ${x2 - h * Math.cos(ang + 0.45)} ${y2 - h * Math.sin(ang + 0.45)} Z` }));
  };
  const text = (x, y, s, cls) => svg('text', { x, y, class: cls || 'bl-hv-t' }, s);
  if (kind === 'lines' || kind === 'centripetal' || kind === 'force') {
    const cx = 130, cy = 120, k = 11;
    LINES.forEach(L => n.append(svg('path', { d: `M ${cx + L.radius * k} ${cy} A ${L.radius * k} ${L.radius * k} 0 0 0 ${cx - L.radius * k} ${cy}`, class: 'bl-hv-line' + (L.id === 'middle' ? ' is-sel' : '') })));
    n.append(svg('circle', { cx, cy, r: 3, class: 'bl-hv-centre' }));
    if (kind === 'lines') { n.append(text(cx + 4 * k - 10, cy + 14, '4', 'bl-hv-s'), text(cx + 6 * k - 10, cy + 14, '6', 'bl-hv-s'), text(cx + 8 * k - 12, cy + 14, '8 m', 'bl-hv-s')); return n; }
    const a = -Math.PI / 2 - 0.6, r = 6 * k, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    n.append(arrow(x, y, x - Math.sin(a) * -34, y + Math.cos(a) * -34, 'bl-hv-v'));
    n.append(arrow(x, y, x + (cx - x) * 0.55, y + (cy - y) * 0.55, kind === 'force' ? 'bl-hv-f' : 'bl-hv-a', kind === 'force' ? 4 : 2.5));
    n.append(text(8, 16, kind === 'force' ? 'F = m v² / r, toward the centre' : 'a = v² / r, toward the centre', 'bl-hv-s'));
    return n;
  }
  if (kind === 'speed') {
    n.append(text(10, 34, 'v'), arrow(30, 30, 100, 30, 'bl-hv-v'), text(110, 34, '15 km/h'),
      text(10, 74, '2v'), arrow(30, 70, 170, 70, 'bl-hv-v'), text(180, 74, '30 km/h'),
      text(10, 116, 'a ∝ v²: twice the speed → 4× the acceleration', 'bl-hv-s'));
    return n;
  }
  if (kind === 'mass') {
    n.append(svg('circle', { cx: 46, cy: 44, r: 12, class: 'bl-hv-body' }), text(30, 76, '70 kg', 'bl-hv-s'), arrow(60, 44, 110, 44, 'bl-hv-f', 4),
      svg('circle', { cx: 46, cy: 102, r: 16, class: 'bl-hv-body' }), text(26, 134, '100 kg', 'bl-hv-s'), arrow(64, 102, 135, 102, 'bl-hv-f', 4),
      text(150, 48, 'same a', 'bl-hv-s'), text(150, 64, 'same μ', 'bl-hv-s'), text(150, 106, 'more F', 'bl-hv-s'));
    return n;
  }
  if (kind === 'grip') {
    const r = berm(DEFAULTS), w = 200, x0 = 30, y0 = 60;
    n.append(svg('rect', { x: x0, y: y0, width: w, height: 14, rx: 7, class: 'bl-hv-track' }),
      svg('rect', { x: x0, y: y0, width: w * Math.min(1, r.requiredGrip / 0.8), height: 14, rx: 7, class: 'bl-hv-need' }),
      svg('line', { x1: x0 + w * r.availableGrip / 0.8, y1: y0 - 8, x2: x0 + w * r.availableGrip / 0.8, y2: y0 + 22, class: 'bl-hv-limit' }),
      text(x0, y0 - 14, `needed ${fmt(r.requiredGrip, 2)}`, 'bl-hv-s'), text(x0 + w * r.availableGrip / 0.8 - 30, y0 + 40, `available ${fmt(r.availableGrip, 2)}`, 'bl-hv-s'),
      text(8, 128, 'μ_required ≤ μ_available: within the model', 'bl-hv-s'));
    return n;
  }
  // 'bank' and 'lean': a cross-section.
  const r = berm({ ...DEFAULTS, bermAngle: 30 }), px = 140, py = 100, b = Math.PI / 6;
  n.append(svg('path', { d: `M 0 ${py + px * Math.tan(b)} L ${W} ${py - (W - px) * Math.tan(b)} L ${W} ${H} L 0 ${H} Z`, class: 'bl-x-dirt' }),
    svg('line', { x1: 0, y1: py, x2: W, y2: py, class: 'bl-x-level' }));
  const rider = riderHeadOn(70, r.leanAngle);
  n.append(svg('g', { transform: `translate(${px} ${py})` }, rider));
  if (kind === 'bank') n.append(arrow(px, py, px - Math.sin(b) * 70, py - Math.cos(b) * 70, 'bl-hv-n', 3), text(px - Math.sin(b) * 70 - 26, py - Math.cos(b) * 70, 'N'), text(8, 16, 'N ⟂ berm: tilted, it points inward', 'bl-hv-s'));
  else n.append(text(8, 16, `lean θ = arctan(v²/rg) = ${fmt(r.leanAngle, 1)}°`, 'bl-hv-s'));
  return n;
}
