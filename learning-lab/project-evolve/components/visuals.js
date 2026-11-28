// Project Evolve: illustrations (decoration only; no maths depends on them).
// An original full-suspension gravity bike, drawn four ways: a CAD wireframe
// (prototype), clamped in a test rig, the launch render, and the used-market
// listing with a price tag. It isn't any real manufacturer's design.

import { svg } from '../../lesson-kit/dom.js';

// The frame: rear wheel at (90, 150), front at (250, 150), radius 42.
const FRAME = 'M90 150 L150 152 L128 92 Z M150 152 L196 84 L128 92 M196 84 L206 66 M206 66 L250 150';
const LINK = 'M128 92 L150 104 L170 96';
function bike(g, stage) {
  const cad = stage === 'prototype';
  [[90, 150], [250, 150]].forEach(([x, y]) => {
    g.append(svg('circle', { class: 'pev-tire' + (cad ? ' is-cad' : ''), cx: x, cy: y, r: 42 }));
    g.append(svg('circle', { class: 'pev-rim' + (cad ? ' is-cad' : ''), cx: x, cy: y, r: 33 }));
    if (!cad) for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; g.append(svg('path', { class: 'pev-spoke', d: `M${x} ${y} L${x + 33 * Math.cos(a)} ${y + 33 * Math.sin(a)}` })); }
    g.append(svg('circle', { class: 'pev-hub', cx: x, cy: y, r: 4 }));
  });
  g.append(svg('path', { class: 'pev-frame' + (cad ? ' is-cad' : ''), d: FRAME }));
  g.append(svg('path', { class: 'pev-link' + (cad ? ' is-cad' : ''), d: LINK }));
  g.append(svg('rect', { class: 'pev-shock' + (cad ? ' is-cad' : ''), x: 140, y: 96, width: 36, height: 8, rx: 4, transform: 'rotate(-18 158 100)' }));
  g.append(svg('path', { class: 'pev-fork' + (cad ? ' is-cad' : ''), d: 'M206 66 L250 150' }));
  g.append(svg('path', { class: 'pev-hbar', d: 'M196 60 L222 56 M206 66 L208 58' }));
  g.append(svg('path', { class: 'pev-seat', d: 'M120 78 L144 76 M128 92 L132 78' }));
  if (cad) {
    g.append(svg('path', { class: 'pev-dim', d: 'M90 205 L250 205 M90 199 V211 M250 199 V211' }));
    g.append(svg('text', { class: 'pev-dim-t', x: 170, y: 200, 'text-anchor': 'middle' }, 'wheelbase = x³ · x²'));
    g.append(svg('path', { class: 'pev-dim', d: 'M276 66 L276 150 M270 66 H282 M270 150 H282' }));
    g.append(svg('text', { class: 'pev-dim-t', x: 284, y: 112 }, '(2x)³'));
  }
}
export function bikeArt(stage = 'launch', big) {
  const s = svg('svg', { class: 'pev-bike' + (big ? ' is-big' : ''), viewBox: '0 0 340 230', 'aria-hidden': 'true' });
  s.append(svg('rect', { class: 'pev-bike-bg is-' + stage, x: 0, y: 0, width: 340, height: 230, rx: 10 }));
  if (stage === 'prototype') for (let i = 0; i <= 17; i++) s.append(svg('path', { class: 'pev-cad-grid', d: `M${i * 20} 0 V230 M0 ${i * 14} H340` }));
  if (stage === 'test') {
    s.append(svg('rect', { class: 'pev-rig-base', x: 30, y: 196, width: 280, height: 14 }));
    s.append(svg('rect', { class: 'pev-rig-post', x: 236, y: 150, width: 28, height: 46 }), svg('rect', { class: 'pev-rig-post', x: 76, y: 150, width: 28, height: 46 }));
    s.append(svg('path', { class: 'pev-rig-arm', d: 'M300 196 V40 H210' }));
  }
  if (stage === 'launch') s.append(svg('ellipse', { class: 'pev-spot', cx: 170, cy: 196, rx: 140, ry: 14 }));
  const g = svg('g'); bike(g, stage); s.append(g);
  if (stage === 'test') s.append(svg('circle', { class: 'pev-rig-led', cx: 300, cy: 40, r: 5 }));
  if (stage === 'market') {
    s.append(svg('path', { class: 'pev-tag', d: 'M240 20 H320 V56 H240 L228 38 Z' }));
    s.append(svg('text', { class: 'pev-tag-t', x: 280, y: 44, 'text-anchor': 'middle' }, 'V(t)'));
  }
  if (stage === 'launch') s.append(svg('text', { class: 'pev-launch-t', x: 20, y: 30 }, 'SWITCHBACK'));
  return s;
}
export function openingArt() {
  const s = svg('svg', { class: 'pev-art', viewBox: '0 0 640 420', role: 'img', 'aria-label': 'An original full-suspension gravity mountain bike, drawn as a CAD wireframe beside its finished launch render, with a growth curve and a decay curve below' });
  s.append(svg('rect', { class: 'pev-art-bg', x: 0, y: 0, width: 640, height: 420 }));
  const a = bikeArt('prototype'); a.setAttribute('x', 10); a.setAttribute('y', 14); a.setAttribute('width', 310); a.setAttribute('height', 210); s.append(a);
  const b = bikeArt('launch'); b.setAttribute('x', 320); b.setAttribute('y', 14); b.setAttribute('width', 310); b.setAttribute('height', 210); s.append(b);
  s.append(svg('rect', { class: 'pev-art-panel', x: 20, y: 244, width: 600, height: 160, rx: 10 }));
  s.append(svg('path', { class: 'pev-art-axis', d: 'M50 386 H300 M50 386 V262 M340 386 H600 M340 386 V262' }));
  const g = [], d = [];
  for (let i = 0; i <= 20; i++) { const t = i / 4; g.push(`${50 + t * 50} ${380 - 95 * Math.pow(1.2, t * 2) / Math.pow(1.2, 10)}`); d.push(`${340 + t * 52} ${386 - 95 * Math.pow(0.8, t)}`); }   // both kept inside the panel
  s.append(svg('path', { class: 'pev-art-grow', d: 'M' + g.join(' L') }), svg('path', { class: 'pev-art-decay', d: 'M' + d.join(' L') }));
  s.append(svg('text', { class: 'pev-art-t', x: 60, y: 276 }, 'Launch: N(t) = 500(1.20)ᵗ'), svg('text', { class: 'pev-art-t', x: 350, y: 276 }, 'Resale: V(t) = 6000(0.80)ᵗ'));
  return s;
}
