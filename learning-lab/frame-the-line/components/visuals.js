// Frame the Line: illustrations (decoration only; no maths depends on them).
// The opening scene is a film frame over a budget line and a production
// timeline; each concept has its own small landscape.

import { svg } from '../../lesson-kit/dom.js';

const SCENES = {
  desert: g => {
    g.appendChild(svg('rect', { class: 'ftl-sky-desert', x: 0, y: 0, width: 320, height: 180 }));
    g.appendChild(svg('circle', { class: 'ftl-sun', cx: 250, cy: 54, r: 22 }));
    g.appendChild(svg('path', { class: 'ftl-rock', d: 'M0 180 L0 120 L40 96 L70 110 L110 70 L150 92 L190 60 L230 104 L270 88 L320 118 L320 180 Z' }));
    g.appendChild(svg('path', { class: 'ftl-rock-2', d: 'M0 180 L0 150 L60 138 L120 150 L180 128 L250 146 L320 140 L320 180 Z' }));
    g.appendChild(svg('path', { class: 'ftl-trail', d: 'M110 70 C130 100 150 110 170 140 S220 160 250 170' }));
  },
  forest: g => {
    g.appendChild(svg('rect', { class: 'ftl-sky-forest', x: 0, y: 0, width: 320, height: 180 }));
    for (let i = 0; i < 11; i++) { const x = 10 + i * 30, h = 70 + (i * 37) % 50; g.appendChild(svg('path', { class: 'ftl-tree' + (i % 2 ? ' is-b' : ''), d: `M${x} ${180 - h} L${x + 18} 170 L${x - 18} 170 Z` })); }
    g.appendChild(svg('path', { class: 'ftl-ground', d: 'M0 180 L0 166 C80 156 200 176 320 160 L320 180 Z' }));
    g.appendChild(svg('path', { class: 'ftl-boardwalk', d: 'M60 150 L150 138 L230 146' }));
  },
  slopestyle: g => {
    g.appendChild(svg('rect', { class: 'ftl-sky-slope', x: 0, y: 0, width: 320, height: 180 }));
    g.appendChild(svg('path', { class: 'ftl-dirt', d: 'M0 180 L0 160 L50 160 Q80 120 100 128 L100 160 L170 160 Q200 110 225 118 L225 160 L320 160 L320 180 Z' }));
    g.appendChild(svg('path', { class: 'ftl-ramp', d: 'M250 160 L300 120 L300 160 Z' }));
    g.appendChild(svg('path', { class: 'ftl-arc', d: 'M100 128 Q135 60 170 130' }));
    g.appendChild(svg('circle', { class: 'ftl-drone', cx: 60, cy: 40, r: 5 }));
    g.appendChild(svg('path', { class: 'ftl-drone-arms', d: 'M50 40 H70 M60 32 V48' }));
  }
};
export function conceptArt(id, big) {
  const s = svg('svg', { class: 'ftl-scene' + (big ? ' is-big' : ''), viewBox: '0 0 320 180', 'aria-hidden': 'true' });
  const g = svg('g'); (SCENES[id] || SCENES.desert)(g); s.appendChild(g);
  // the camera frame
  s.appendChild(svg('path', { class: 'ftl-frame', d: 'M12 30 V12 H40 M280 12 H308 V30 M308 150 V168 H280 M40 168 H12 V150' }));
  s.appendChild(svg('circle', { class: 'ftl-rec', cx: 26, cy: 24, r: 4 }));
  return s;
}

export function openingArt() {
  const s = svg('svg', { class: 'ftl-art', viewBox: '0 0 640 420', role: 'img', 'aria-label': 'A camera frame on a desert freeride line, above a production budget graph rising from $1,800 and a six-phase production timeline' });
  s.appendChild(svg('rect', { class: 'ftl-art-bg', x: 0, y: 0, width: 640, height: 420 }));
  const scene = conceptArt('desert'); scene.setAttribute('x', 20); scene.setAttribute('y', 20); scene.setAttribute('width', 400); scene.setAttribute('height', 225); s.appendChild(scene);
  s.appendChild(svg('text', { class: 'ftl-art-rec', x: 60, y: 54 }, 'REC  00:03:06'));
  // budget graph
  s.appendChild(svg('rect', { class: 'ftl-art-panel', x: 20, y: 262, width: 400, height: 140, rx: 8 }));
  s.appendChild(svg('path', { class: 'ftl-art-axis', d: 'M50 382 H400 M50 382 V276' }));
  s.appendChild(svg('path', { class: 'ftl-art-line', d: 'M50 340 L400 288' }));
  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(d => s.appendChild(svg('circle', { class: 'ftl-art-pt', cx: 50 + d * 43.75, cy: 340 - d * 6.5, r: 3.5 })));
  s.appendChild(svg('text', { class: 'ftl-art-txt', x: 58, y: 334 }, 'b = 1800'));
  s.appendChild(svg('text', { class: 'ftl-art-txt', x: 250, y: 330 }, 'C = 420d + 1800'));
  // timeline
  s.appendChild(svg('rect', { class: 'ftl-art-screen', x: 440, y: 20, width: 180, height: 382, rx: 16 }));
  s.appendChild(svg('text', { class: 'ftl-art-k', x: 460, y: 54 }, 'PRODUCTION'));
  ['Pre-production', 'Location prep', 'Filming', 'Dailies', 'Editing', 'Delivery'].forEach((n, i) => {
    s.appendChild(svg('circle', { class: 'ftl-art-dot' + (i < 2 ? ' is-done' : ''), cx: 470, cy: 92 + i * 52, r: 8 }));
    if (i < 5) s.appendChild(svg('path', { class: 'ftl-art-axis', d: `M470 ${100 + i * 52} V${136 + i * 52}` }));
    s.appendChild(svg('text', { class: 'ftl-art-v', x: 488, y: 97 + i * 52 }, n));
  });
  return s;
}
