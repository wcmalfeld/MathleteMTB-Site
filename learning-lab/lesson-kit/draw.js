// Lesson kit: shared drawings. A force or motion arrow with a text label,
// and a side-view rider and bike. SVG, built from data.

import { svg } from './dom.js';

// An arrow from (x, y) along unit vector d, `len` px long, with a label.
export function arrow(x, y, d, len, cls, label, opts = {}) {
  const g = svg('g', { class: 'ls-arrow ls-arrow--' + cls });
  if (!(len > 0.5)) return g;
  const x2 = x + d[0] * len, y2 = y + d[1] * len, h = Math.min(11, len * 0.6), a = Math.atan2(d[1], d[0]);
  g.append(svg('line', { x1: x, y1: y, x2: x2 - Math.cos(a) * h * 0.7, y2: y2 - Math.sin(a) * h * 0.7, 'stroke-width': opts.width || 3.5 }),
    svg('path', { d: `M ${x2} ${y2} L ${x2 - h * Math.cos(a - 0.42)} ${y2 - h * Math.sin(a - 0.42)} L ${x2 - h * Math.cos(a + 0.42)} ${y2 - h * Math.sin(a + 0.42)} Z` }));
  if (label) {
    const lx = x2 + d[0] * 10 + (Math.abs(d[0]) < 0.3 ? 8 : 0), ly = y2 + d[1] * 12 + 4;
    g.append(svg('text', { x: lx, y: ly, 'text-anchor': d[0] < -0.3 ? 'end' : Math.abs(d[0]) < 0.3 ? 'start' : 'start', class: 'ls-arrow-label' }, label));
  }
  return g;
}

// A rider and bike seen from the side, facing right, wheels touching y = 0.
// `spin` turns the wheels (radians).
export function riderSide(s = 60, spin = 0) {
  const r = s * 0.3, wx = s * 0.52, cy = -r;
  const wheel = cx => svg('g', { transform: `translate(${cx} ${cy})` },
    svg('circle', { r, class: 'ls-tire' }),
    svg('path', { class: 'ls-spokes', d: [0, 1, 2].map(i => { const a = spin + i * Math.PI / 3; return `M ${-Math.cos(a) * r * 0.85} ${-Math.sin(a) * r * 0.85} L ${Math.cos(a) * r * 0.85} ${Math.sin(a) * r * 0.85}`; }).join(' ') }));
  const bb = [-s * 0.02, cy + r * 0.05], seat = [-s * 0.18, cy - s * 0.5];
  return svg('g', { class: 'ls-rider' },
    wheel(-wx), wheel(wx),
    svg('path', { class: 'ls-frame', d: `M ${-wx} ${cy} L ${bb[0]} ${bb[1]} L ${s * 0.32} ${cy - s * 0.42} L ${wx} ${cy} M ${bb[0]} ${bb[1]} L ${seat[0]} ${seat[1]} L ${s * 0.32} ${cy - s * 0.42} L ${-wx} ${cy} M ${s * 0.32} ${cy - s * 0.42} L ${s * 0.36} ${cy - s * 0.56}` }),
    svg('path', { class: 'ls-body', d: `M ${seat[0]} ${seat[1] - 4} L ${s * 0.12} ${cy - s * 0.92} L ${s * 0.36} ${cy - s * 0.58} M ${seat[0] + 2} ${seat[1]} L ${bb[0] + s * 0.06} ${bb[1] - s * 0.18} L ${bb[0]} ${bb[1]}` }),
    svg('circle', { class: 'ls-helmet', cx: s * 0.14, cy: cy - s * 1.04, r: s * 0.11 }));
}
