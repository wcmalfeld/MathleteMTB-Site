// Bike Park Blueprint Lab: the opening screen's blueprint art. Decorative
// (the words say the same thing): a site plan with berms, jumps and rock
// gardens, an excavator, crew tools and a planning dashboard with the
// resource matrix.

import { svg } from '../../lesson-kit/dom.js';

const t = (x, y, text, cls, extra) => svg('text', { x, y, class: cls || 'ms-svg-small', ...(extra || {}) }, text);

export function blueprintArt() {
  const s = svg('svg', { viewBox: '0 0 640 420', class: 'bp-art', 'aria-hidden': 'true', focusable: 'false' });
  s.append(svg('rect', { x: 0, y: 0, width: 640, height: 420, class: 'bp-art-bg' }));
  for (let x = 0; x <= 640; x += 32) s.append(svg('line', { x1: x, y1: 0, x2: x, y2: 420, class: 'bp-art-grid' }));
  for (let y = 0; y <= 420; y += 32) s.append(svg('line', { x1: 0, y1: y, x2: 640, y2: y, class: 'bp-art-grid' }));
  // contours of the development zone
  [0, 1, 2, 3].forEach(i => s.append(svg('ellipse', { cx: 250, cy: 210, rx: 90 + i * 52, ry: 60 + i * 34, class: 'bp-art-contour' })));
  // the trail line through the zone
  s.append(svg('path', { d: 'M40 360 C 110 330, 120 270, 180 250 S 280 230, 300 180 S 360 90, 430 110', class: 'bp-art-trail' }),
    t(36, 384, 'DEVELOPMENT ZONE · SHEET 1', 'ms-svg-kicker'));
  // berms (curved banks), jumps (lip + landing), rock garden (stones)
  const berm = (x, y) => svg('path', { d: `M${x} ${y} a 26 26 0 0 1 36 -26`, class: 'bp-art-berm' });
  const jump = (x, y) => svg('g', null, svg('path', { d: `M${x} ${y} l 18 -16 l 6 16 Z`, class: 'bp-art-jump' }), svg('path', { d: `M${x + 40} ${y} l 8 -10 l 22 10 Z`, class: 'bp-art-jump' }));
  const rocks = (x, y) => svg('g', null, ...[[0, 0, 7], [12, -4, 5], [22, 2, 6], [8, 9, 5], [18, 12, 4]].map(([dx, dy, r]) => svg('circle', { cx: x + dx, cy: y + dy, r, class: 'bp-art-rock' })));
  s.append(berm(150, 282), berm(264, 214), jump(176, 238), jump(318, 160), jump(220, 228), rocks(380, 112), rocks(104, 318));
  // legend tags
  s.append(t(128, 304, 'BERM', 'ms-svg-kicker'), t(196, 254, 'JUMPS', 'ms-svg-kicker'), t(338, 100, 'ROCK GARDEN', 'ms-svg-kicker'));
  // excavator
  s.append(svg('g', { transform: 'translate(470 300)' },
    svg('rect', { x: 0, y: 26, width: 70, height: 14, rx: 7, class: 'bp-art-track' }), svg('rect', { x: 10, y: 6, width: 44, height: 22, rx: 3, class: 'bp-art-cab' }),
    svg('path', { d: 'M50 12 L 86 -12 L 104 10', class: 'bp-art-arm' }), svg('path', { d: 'M100 6 l 12 8 l -6 10 Z', class: 'bp-art-bucket' })));
  // shovel and rake
  s.append(svg('path', { d: 'M592 250 L 592 330 M584 330 h16 l -8 14 Z', class: 'bp-art-tool' }), svg('path', { d: 'M612 250 L 612 336 M600 336 h24 M602 336 v8 M608 336 v8 M614 336 v8 M620 336 v8', class: 'bp-art-tool' }));
  // planning dashboard
  s.append(svg('rect', { x: 452, y: 24, width: 168, height: 140, rx: 4, class: 'bp-art-screen' }), t(464, 44, 'RESOURCE MATRIX M', 'ms-svg-kicker'));
  [[4, 2, 1], [3, 1, 2], [5, 3, 2]].forEach((r, i) => r.forEach((v, j) => s.append(t(488 + j * 34, 74 + i * 24, String(v), 'bp-art-num'))));
  s.append(svg('path', { d: 'M476 58 v 66 M584 58 v 66', class: 'bp-art-bracket' }), t(464, 154, 'Q·M·C = $1,966', 'ms-svg-kicker bp-art-ok'));
  return s;
}
