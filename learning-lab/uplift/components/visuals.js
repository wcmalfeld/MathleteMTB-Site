// Uplift: illustrations (decoration only; no maths depends on them). Each
// destination has its own small scene; the opening art is a shuttle hub over
// two crossing price lines.

import { svg } from '../../lesson-kit/dom.js';

const SCENES = {
  rainforest: g => {
    g.append(svg('rect', { class: 'upl-sky-rain', x: 0, y: 0, width: 320, height: 180 }));
    for (let i = 0; i < 9; i++) { const x = 15 + i * 36, r = 22 + (i * 13) % 14; g.append(svg('circle', { class: 'upl-canopy' + (i % 2 ? ' is-b' : ''), cx: x, cy: 70 + (i * 17) % 30, r })); g.append(svg('rect', { class: 'upl-trunk', x: x - 3, y: 90, width: 6, height: 70 })); }
    g.append(svg('path', { class: 'upl-fern', d: 'M0 180 L0 150 Q60 130 120 150 T240 145 T320 150 L320 180 Z' }));
    g.append(svg('path', { class: 'upl-trail', d: 'M40 178 C90 160 150 170 200 150 S280 140 320 132' }));
  },
  alpine: g => {
    g.append(svg('rect', { class: 'upl-sky-alp', x: 0, y: 0, width: 320, height: 180 }));
    g.append(svg('path', { class: 'upl-peak', d: 'M0 150 L70 50 L120 110 L180 30 L250 120 L290 80 L320 110 L320 180 L0 180 Z' }));
    g.append(svg('path', { class: 'upl-snow', d: 'M70 50 L82 68 L62 66 Z M180 30 L196 54 L166 52 Z' }));
    g.append(svg('path', { class: 'upl-cable', d: 'M20 150 L230 50' }));
    [[80, 121], [150, 88], [210, 60]].forEach(([x, y]) => g.append(svg('rect', { class: 'upl-cabin', x: x - 8, y: y + 2, width: 16, height: 12, rx: 3 })));
    g.append(svg('path', { class: 'upl-meadow', d: 'M0 160 Q120 140 320 160 L320 180 L0 180 Z' }));
  },
  bc: g => {
    g.append(svg('rect', { class: 'upl-sky-bc', x: 0, y: 0, width: 320, height: 180 }));
    g.append(svg('path', { class: 'upl-ridge', d: 'M0 110 L60 70 L130 95 L200 55 L320 90 L320 180 L0 180 Z' }));
    for (let i = 0; i < 12; i++) { const x = 8 + i * 28, h = 50 + (i * 23) % 40; g.append(svg('path', { class: 'upl-pine' + (i % 2 ? ' is-b' : ''), d: `M${x} ${172 - h} L${x + 14} 172 L${x - 14} 172 Z` })); }
    g.append(svg('rect', { class: 'upl-van', x: 220, y: 150, width: 56, height: 22, rx: 4 }));
    g.append(svg('circle', { class: 'upl-wheel', cx: 232, cy: 172, r: 5 })); g.append(svg('circle', { class: 'upl-wheel', cx: 264, cy: 172, r: 5 }));
  }
};
export function destinationArt(id, big) {
  const s = svg('svg', { class: 'upl-scene' + (big ? ' is-big' : ''), viewBox: '0 0 320 180', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' });
  const g = svg('g'); (SCENES[id] || SCENES.bc)(g); s.append(g);
  return s;
}
export function workshopArt(big) {
  const s = svg('svg', { class: 'upl-shop' + (big ? ' is-big' : ''), viewBox: '0 0 320 180', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' });
  s.append(svg('rect', { class: 'upl-shop-bg', x: 0, y: 0, width: 320, height: 180 }));
  [40, 80].forEach(y => s.append(svg('rect', { class: 'upl-shelf-b', x: 20, y, width: 280, height: 6 })));
  for (let i = 0; i < 7; i++) s.append(svg('circle', { class: 'upl-tire', cx: 45 + i * 38, cy: 26, r: 13 }));
  for (let i = 0; i < 9; i++) s.append(svg('rect', { class: 'upl-box' + (i % 3 ? '' : ' is-b'), x: 30 + i * 30, y: 58, width: 22, height: 22, rx: 2 }));
  s.append(svg('rect', { class: 'upl-bench', x: 30, y: 130, width: 260, height: 10 }));
  s.append(svg('circle', { class: 'upl-tire', cx: 120, cy: 112, r: 18 }));
  s.append(svg('path', { class: 'upl-tool', d: 'M200 128 L230 100 M236 94 a8 8 0 1 1 -6 6' }));
  return s;
}
export function bikeIcon(kind) {
  const s = svg('svg', { class: 'upl-bike is-' + kind, viewBox: '0 0 40 24', 'aria-hidden': 'true' });
  s.append(svg('circle', { cx: 9, cy: 16, r: 6 }), svg('circle', { cx: 31, cy: 16, r: 6 }), svg('path', { d: kind === 'dh' ? 'M9 16 L17 7 L26 7 L31 16 M17 7 L20 16 L26 7 M24 4 L28 4' : 'M9 16 L17 8 L27 8 L31 16 M17 8 L20 16 L27 8 M25 5 L28 5' }));
  return s;
}
export function openingArt() {
  const s = svg('svg', { class: 'upl-art', viewBox: '0 0 640 420', role: 'img', 'aria-label': 'A mountain shuttle hub with a gondola above the forest, and below it a pricing board where two plans’ cost lines cross at the break-even point' });
  s.append(svg('rect', { class: 'upl-art-bg', x: 0, y: 0, width: 640, height: 420 }));
  const sc = destinationArt('alpine'); sc.setAttribute('x', 20); sc.setAttribute('y', 20); sc.setAttribute('width', 600); sc.setAttribute('height', 210); s.append(sc);
  s.append(svg('rect', { class: 'upl-art-panel', x: 20, y: 246, width: 600, height: 156, rx: 10 }));
  s.append(svg('text', { class: 'upl-art-k', x: 40, y: 272 }, 'UPLIFT PRICING BOARD'));
  s.append(svg('path', { class: 'upl-art-axis', d: 'M60 386 H600 M60 386 V284' }));
  // C = 8r + 12 and C = 4r + 36 on r = 0…12, C = 0…120 → crossing at (6, 60)
  const X = r => 60 + r * 45, Y = c => 386 - c * 0.85;
  s.append(svg('path', { class: 'upl-art-a', d: `M${X(0)} ${Y(12)} L${X(12)} ${Y(108)}` }), svg('path', { class: 'upl-art-b', d: `M${X(0)} ${Y(36)} L${X(12)} ${Y(84)}` }));
  s.append(svg('circle', { class: 'upl-art-meet', cx: X(6), cy: Y(60), r: 8 }));
  s.append(svg('text', { class: 'upl-art-txt', x: X(6) + 14, y: Y(60) + 22 }, '6 rides · $60'));
  s.append(svg('text', { class: 'upl-art-txt is-a', x: X(12) - 4, y: Y(108) - 8, 'text-anchor': 'end' }, 'Plan A'), svg('text', { class: 'upl-art-txt is-b', x: X(12) - 4, y: Y(84) + 18, 'text-anchor': 'end' }, 'Plan B'));
  return s;
}
