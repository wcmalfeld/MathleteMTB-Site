// A trail's side profile, drawn TO SCALE (one foot across = one foot up),
// so the angle you see is the real angle. A 20% grade looks gentle, because
// it is: about 11°. (Graphs, by contrast, may use different axis scales.)
//
// createProfile() -> { node, update({ start, end, run, unit, show, schematic, title }) }
//   start/end: elevations; run: horizontal distance
//   show: which parts to emphasise: 'start' 'end' 'rise' 'run' 'direction' (default: all labels)
//   schematic: true to fit the picture to the box instead (labelled "not to scale")

import { el, svg, clear } from './dom.js';
import { fmt, rise as riseOf, slopeKind } from '../logic/slope.js';

const W = 640, H = 300, PAD = { l: 150, r: 130, t: 46, b: 56 };

export function createProfile() {
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sl-profile', role: 'img' });
  const cap = el('figcaption', { class: 'sl-profile-cap' });
  const node = el('figure', { class: 'sl-profile-wrap' }, root, cap);

  function update(o) {
    clear(root);
    const unit = o.unit || 'ft', r = riseOf(o.start, o.end), run = o.run, kind = slopeKind(r, run);
    const show = o.show ? new Set(o.show) : new Set(['start', 'end', 'rise', 'run', 'direction']);
    const aw = W - PAD.l - PAD.r, ah = H - PAD.t - PAD.b;
    let kx, ky;
    if (o.schematic) { kx = run ? aw / Math.abs(run) : 0; ky = r ? ah / Math.abs(r) * 0.8 : 0; }
    else {
      const k = Math.min(run ? aw / Math.abs(run) : Infinity, r ? ah / Math.abs(r) : Infinity);
      kx = ky = isFinite(k) ? k : 1;
    }
    // place the lower end near the bottom; climbing goes left -> right
    const x0 = PAD.l + (run ? 0 : aw / 2);
    const lowY = H - PAD.b;
    const y0 = r >= 0 ? lowY : lowY - Math.abs(r) * ky;
    const x1 = x0 + run * kx, y1 = y0 - r * ky;

    // ground under the trail
    root.appendChild(svg('path', { d: `M${x0},${y0} L${x1},${y1} L${x1},${H - 12} L${x0},${H - 12} Z`, class: 'sl-ground' }));
    root.appendChild(svg('line', { x1: x0, y1: y0, x2: x1, y2: y1, class: 'sl-trail' }));

    // run leg (horizontal, at the start's height) and rise leg (vertical, at the end)
    if (show.has('run')) {
      root.appendChild(svg('line', { x1: x0, y1: y0, x2: x1, y2: y0, class: 'sl-run' }));
      root.appendChild(svg('text', { x: (x0 + x1) / 2, y: y0 + (r >= 0 ? 22 : -10), class: 'sl-leg-label', 'text-anchor': 'middle' }, `run ${fmt(run)} ${unit}`));
    }
    if (show.has('rise') && r !== 0) {
      root.appendChild(svg('line', { x1, y1: y0, x2: x1, y2: y1, class: 'sl-rise' }));
      root.appendChild(svg('text', { x: x1 + 10, y: (y0 + y1) / 2 + 5, class: 'sl-leg-label' }, `rise ${fmt(r)} ${unit}`));
    }
    // start and end markers: circle = start, square = end (shape, not only color)
    if (show.has('start')) {
      root.appendChild(svg('circle', { cx: x0, cy: y0, r: 7, class: 'sl-pt' }));
      root.appendChild(svg('text', { x: x0 - 12, y: y0 - 12, class: 'sl-pt-label', 'text-anchor': 'end' }, `Start ${fmt(o.start)} ${unit}`));
    }
    if (show.has('end')) {
      root.appendChild(svg('rect', { x: x1 - 6.5, y: y1 - 6.5, width: 13, height: 13, class: 'sl-pt sl-pt--end' }));
      root.appendChild(svg('text', { x: x1 + 12, y: y1 - 12, class: 'sl-pt-label' }, `End ${fmt(o.end)} ${unit}`));
    }
    // riding direction: an arrow along the trail
    if (show.has('direction') && run !== 0) {
      const t = 0.42, ax = x0 + (x1 - x0) * t, ay = y0 + (y1 - y0) * t, len = Math.hypot(x1 - x0, y1 - y0) || 1;
      const ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux, off = 20;
      const bx = ax + nx * -off, by = ay + ny * -off;
      root.appendChild(svg('path', { d: `M${bx - ux * 26},${by - uy * 26} L${bx + ux * 26},${by + uy * 26} M${bx + ux * 26 - ux * 9 + nx * 6},${by + uy * 26 - uy * 9 + ny * 6} L${bx + ux * 26},${by + uy * 26} L${bx + ux * 26 - ux * 9 - nx * 6},${by + uy * 26 - uy * 9 - ny * 6}`, class: 'sl-arrow' }));
    }
    if (kind === 'undefined') {
      root.appendChild(svg('text', { x: x0 + 14, y: (y0 + y1) / 2, class: 'sl-leg-label' }, 'Vertical: run is 0'));
    }

    const words = { positive: 'climbs', negative: 'descends', zero: 'is flat', undefined: 'goes straight up (run 0)', none: 'doesn’t go anywhere' }[kind] || '';
    root.setAttribute('aria-label', o.title || `Trail profile: starts at ${fmt(o.start)} ${unit}, ends at ${fmt(o.end)} ${unit}, over ${fmt(run)} ${unit} of horizontal distance. It ${words}.`);
    cap.textContent = o.schematic ? 'Not to scale.' : 'Drawn to scale: the angle you see is the real angle.';
  }
  return { node, update };
}
