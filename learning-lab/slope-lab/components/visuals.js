// Map the Line: illustrations. The topographic map behind the coordinate
// grid (contours, a river, trees: decoration only, placed in grid space so it
// never moves the maths), and the opening scene (a map above an elevation
// profile above a ride-data screen).

import { svg } from '../../lesson-kit/dom.js';

export function mapArt(x, y, w, h) {
  const g = svg('g', { class: 'mt-map-art', 'aria-hidden': 'true' });
  g.appendChild(svg('rect', { class: 'mt-map-bg', x, y, width: w, height: h }));
  for (let k = 1; k <= 5; k++) {
    const r = k / 6;
    g.appendChild(svg('ellipse', { class: 'mt-contour', cx: x + w * 0.72, cy: y + h * 0.26, rx: w * 0.34 * r, ry: h * 0.26 * r }));
  }
  for (let k = 1; k <= 3; k++) g.appendChild(svg('ellipse', { class: 'mt-contour', cx: x + w * 0.2, cy: y + h * 0.78, rx: w * 0.12 * k / 3, ry: h * 0.09 * k / 3 }));
  g.appendChild(svg('path', { class: 'mt-river', d: `M${x} ${y + h * 0.62} C${x + w * 0.3} ${y + h * 0.5} ${x + w * 0.45} ${y + h * 0.9} ${x + w} ${y + h * 0.82}` }));
  [[0.1, 0.12], [0.16, 0.2], [0.07, 0.32], [0.9, 0.7], [0.85, 0.86], [0.55, 0.12], [0.4, 0.3], [0.62, 0.62]].forEach(([a, b]) => g.appendChild(svg('circle', { class: 'mt-tree', cx: x + w * a, cy: y + h * b, r: Math.max(5, w / 60) })));
  return g;
}

export function openingArt() {
  const s = svg('svg', { class: 'mt-art', viewBox: '0 0 640 420', role: 'img', 'aria-label': 'A trail map with a plotted route, its elevation profile below, and a ride-data screen showing distance, elevation and speed' });
  s.appendChild(svg('rect', { class: 'mt-art-bg', x: 0, y: 0, width: 640, height: 420 }));
  s.appendChild(mapArt(20, 20, 380, 220));
  for (let i = 0; i <= 10; i++) s.appendChild(svg('path', { class: 'mt-art-grid', d: `M${20 + i * 38} 20 V240` }));
  for (let j = 0; j <= 5; j++) s.appendChild(svg('path', { class: 'mt-art-grid', d: `M20 ${20 + j * 44} H400` }));
  s.appendChild(svg('path', { class: 'mt-art-axis', d: 'M20 130 H400 M210 20 V240' }));
  const route = [[60, 200], [120, 170], [160, 130], [210, 90], [270, 80], [320, 120], [370, 150]];
  s.appendChild(svg('path', { class: 'mt-art-route', d: 'M' + route.map(p => p.join(' ')).join(' L') }));
  route.forEach(([a, b]) => s.appendChild(svg('circle', { class: 'mt-art-pt', cx: a, cy: b, r: 5 })));
  // profile
  s.appendChild(svg('rect', { class: 'mt-art-panel', x: 20, y: 260, width: 380, height: 140 }));
  const prof = [[40, 370], [100, 350], [160, 330], [220, 310], [280, 310], [340, 330], [390, 350]];
  s.appendChild(svg('path', { class: 'mt-art-fill', d: 'M40 390 L' + prof.map(p => p.join(' ')).join(' L') + ' L390 390 Z' }));
  s.appendChild(svg('path', { class: 'mt-art-route', d: 'M' + prof.map(p => p.join(' ')).join(' L') }));
  s.appendChild(svg('path', { class: 'mt-art-tri', d: 'M40 370 H220 V310' }));
  s.appendChild(svg('text', { class: 'mt-art-txt', x: 120, y: 386 }, 'run'));
  s.appendChild(svg('text', { class: 'mt-art-txt', x: 226, y: 346 }, 'rise'));
  // dashboard
  s.appendChild(svg('rect', { class: 'mt-art-screen', x: 420, y: 20, width: 200, height: 380, rx: 18 }));
  [['DIST', '2.40 km'], ['ELEV', '1,215 m'], ['SPEED', '240 m/min'], ['GRADE', '+5%']].forEach(([k, v], i) => {
    s.appendChild(svg('text', { class: 'mt-art-k', x: 440, y: 64 + i * 78 }, k)); s.appendChild(svg('text', { class: 'mt-art-v', x: 440, y: 94 + i * 78 }, v));
  });
  return s;
}
