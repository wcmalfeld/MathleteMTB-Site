// The simulation canvas (PRD 3.1 A): a top-down view of a groomed slope with
// the turn's path, its centre, the radius, direction arrows, the skier, and
// the velocity / acceleration / force vectors; plus the two insets (the ski
// from above, and its cross-section tipped on edge).
//
// The scene only draws. It's handed a finished path (logic/simulation.js) and
// how far along it the skier is; it never calculates physics itself.

import { el, svg, clear } from './dom.js';
import { stateAt, pathData } from '../logic/simulation.js';
import { fmt } from '../logic/physics.js';
import { sidecutDiagram, edgeDiagram } from './visuals.js';

// Drawing size: wide on desktop, narrower and taller on phones so labels stay readable.
const WIDE = [800, 500], NARROW = [420, 540];
// Fixed (true) scale: 10 px per metre, so every turn is drawn to the same
// scale and a tighter turn really looks tighter. Turns taller than the canvas
// scroll: the camera follows the skier.
const FIXED_K = 10;
// Arrow lengths on screen (pixels per unit), capped so huge values stay on the canvas.
export const ARROW = { velocity: 4.5, acceleration: 6, force: 0.12, max: { velocity: 110, acceleration: 140, force: 150 } };

function arrowShape(cls) {
  const g = svg('g', { class: 'cl-vec ' + cls });
  const line = svg('line'), head = svg('path'), label = svg('text', { class: 'cl-vec-label' });
  g.append(line, head, label);
  // side: which way (along the path) to nudge the label, so two arrows that
  // point the same way keep their labels apart.
  return { g, set(x1, y1, dx, dy, len, text, clipped, sx = 0, sy = 0) {
    if (!(len > 0.5)) { g.setAttribute('visibility', 'hidden'); return; }
    g.setAttribute('visibility', 'visible');
    const x2 = x1 + dx * len, y2 = y1 + dy * len, h = 10, a = Math.atan2(dy, dx);
    line.setAttribute('x1', x1.toFixed(1)); line.setAttribute('y1', y1.toFixed(1));
    line.setAttribute('x2', (x2 - dx * h * 0.7).toFixed(1)); line.setAttribute('y2', (y2 - dy * h * 0.7).toFixed(1));
    head.setAttribute('d', `M ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 - h * Math.cos(a - 0.42)).toFixed(1)} ${(y2 - h * Math.sin(a - 0.42)).toFixed(1)} L ${(x2 - h * Math.cos(a + 0.42)).toFixed(1)} ${(y2 - h * Math.sin(a + 0.42)).toFixed(1)} Z`);
    const lx = x2 + dx * 8 + sx * 14, ly = y2 + dy * 8 + sy * 14 + 4, hx = dx + sx * 1.5;
    label.setAttribute('x', lx.toFixed(1)); label.setAttribute('y', ly.toFixed(1));
    label.setAttribute('text-anchor', hx < -0.3 ? 'end' : hx > 0.3 ? 'start' : 'middle');
    label.textContent = text + (clipped ? ' (off scale)' : '');
  } };
}

export function createScene() {
  let [W, H] = WIDE;
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cl-scene-svg', role: 'img', preserveAspectRatio: 'xMidYMid meet' });
  const desc = svg('title');
  const defs = svg('defs', null,
    svg('pattern', { id: 'cl-cord', width: 7, height: 40, patternUnits: 'userSpaceOnUse' },
      svg('rect', { width: 7, height: 40, class: 'cl-cord-bg' }), svg('line', { x1: 0.5, y1: 0, x2: 0.5, y2: 40, class: 'cl-cord-line' })),
    svg('radialGradient', { id: 'cl-vignette', cx: '50%', cy: '45%', r: '75%' }, svg('stop', { offset: '70%', 'stop-color': '#000', 'stop-opacity': 0 }), svg('stop', { offset: '100%', 'stop-color': '#0b1a26', 'stop-opacity': 0.22 })));
  const world = svg('g', { class: 'cl-world' });
  const snow = svg('rect', { x: -10, width: W + 20, fill: 'url(#cl-cord)' });
  const trees = svg('g', { class: 'cl-trees', 'aria-hidden': 'true' });
  const ghosts = svg('g', { class: 'cl-ghosts' });
  const planned = svg('path', { class: 'cl-path-planned' });
  const trailOuter = svg('path', { class: 'cl-trail-outer', pathLength: 1000 });
  const trailInner = svg('path', { class: 'cl-trail-inner', pathLength: 1000 });
  const chevrons = svg('g', { class: 'cl-chevrons' });
  const radiusLine = svg('line', { class: 'cl-radius' });
  const radiusLabel = svg('text', { class: 'cl-radius-label' });
  const centre = svg('g', { class: 'cl-centre' }, svg('circle', { r: 5 }), svg('line', { x1: -10, y1: 0, x2: 10, y2: 0 }), svg('line', { x1: 0, y1: -10, x2: 0, y2: 10 }));
  const centreLabel = svg('text', { class: 'cl-centre-label' });
  const spray = svg('g', { class: 'cl-spray' }, [0, 1, 2, 3, 4, 5].map(() => svg('circle', { r: 2 })));
  const skis = svg('g', { class: 'cl-skier-skis' },
    svg('rect', { x: -15, y: -6, width: 32, height: 3.2, rx: 1.6 }), svg('rect', { x: -15, y: 2.8, width: 32, height: 3.2, rx: 1.6 }));
  const body = svg('g', { class: 'cl-skier-body' },
    svg('line', { x1: -4, y1: -9, x2: -14, y2: -13, class: 'cl-pole' }), svg('line', { x1: -4, y1: 9, x2: -14, y2: 13, class: 'cl-pole' }),
    svg('ellipse', { cx: 0, cy: 0, rx: 6, ry: 10, class: 'cl-jacket' }), svg('circle', { cx: 1.5, cy: 0, r: 4.2, class: 'cl-helmet' }));
  const shadow = svg('ellipse', { rx: 16, ry: 9, class: 'cl-shadow' });
  const vel = arrowShape('cl-vec--v'), acc = arrowShape('cl-vec--a'), frc = arrowShape('cl-vec--f');
  world.append(snow, trees, ghosts, planned, trailOuter, trailInner, chevrons, radiusLine, centre, centreLabel, radiusLabel, shadow, spray, skis, body, frc.g, acc.g, vel.g);
  const vignette = svg('rect', { width: W, height: H, fill: 'url(#cl-vignette)', 'pointer-events': 'none' });
  const fall = svg('g', { class: 'cl-fall', transform: `translate(${W - 36} 22)` }, svg('line', { x1: 0, y1: 0, x2: 0, y2: 34 }), svg('path', { d: 'M -6 26 L 0 36 L 6 26' }), svg('text', { x: -8, y: 52, 'text-anchor': 'middle' }, 'fall line'));
  const scaleBar = svg('g', { class: 'cl-scalebar' });
  const sbLine = svg('path'), sbText = svg('text', { 'text-anchor': 'middle' });
  scaleBar.append(sbLine, sbText);
  root.append(desc, defs, world, vignette, fall, scaleBar);

  const sideInset = sidecutDiagram(), edgeInset = edgeDiagram();
  const readout = el('p', { class: 'cl-readout', 'aria-hidden': 'true' });
  const node = el('div', { class: 'cl-scene' },
    el('div', { class: 'cl-scene-canvas' }, root, readout),
    el('div', { class: 'cl-insets' },
      el('figure', { class: 'cl-inset' }, el('figcaption', null, 'Your ski, from above'), sideInset.node),
      el('figure', { class: 'cl-inset' }, el('figcaption', null, 'Edge angle, end view'), edgeInset.node)));

  let last = { pathRef: null, ghostRef: null, k: 0, ox: 0, oy: 0, cfgKey: '' };
  const treeCache = { h: 0 };
  function drawTrees(height) {
    if (treeCache.h >= height) return;
    clear(trees);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const band = W < 600 ? 34 : 70;
    for (let y = -40; y < height + 80; y += 34) for (const side of [0, 1]) {
      if (rnd() < 0.25) continue;
      const x = side ? W - 14 - rnd() * band : 14 + rnd() * band, s = 0.7 + rnd() * 0.6, yy = y + rnd() * 20;
      trees.appendChild(svg('g', { transform: `translate(${x.toFixed(1)} ${yy.toFixed(1)}) scale(${s.toFixed(2)})` },
        svg('ellipse', { cx: 5, cy: 5, rx: 14, ry: 9, class: 'cl-tree-shadow' }),
        svg('circle', { r: 13, class: 'cl-tree-a' }), svg('circle', { r: 8, cx: -2, cy: -2, class: 'cl-tree-b' }), svg('circle', { r: 3, cx: -3, cy: -3, class: 'cl-tree-c' })));
    }
    treeCache.h = height;
  }

  // Where the path sits on screen, and the camera, for a given path.
  function layout(path, scale) {
    const R = Math.max(path.R, 0.5), linked = path.mode === 'linked';
    let k = FIXED_K;
    if (scale === 'fit') k = linked ? Math.min((W * 0.62) / (2 * R), 60) : Math.min((H - 90) / (2 * R), (W * 0.42) / R, 60);
    else if (!linked) k = Math.min(FIXED_K, (W - 60) / R);   // a very wide turn still fits across a phone
    const ox = linked ? W / 2 + (W < 600 ? 0 : 40) : W / 2 + R * k / 2 + (W < 600 ? 0 : 30);   // screen x of the start line
    const oy = linked ? 46 : Math.max(36, (H - 2 * R * k) / 2);   // a single turn sits in the middle when it fits
    return { k, ox, oy, worldH: oy + (path.end.y - path.start.y) * k + 60 };
  }
  const toScreen = (L, x, y) => [L.ox + x * L.k, L.oy + y * L.k];

  // view: { path, config, results, s, vectors, ghosts, scale, time, total, playing, frame }
  // Switch drawing size with the canvas width (and redraw everything).
  function sizeFor(width) {
    const [w, h] = width && width < 600 ? NARROW : WIDE;
    if (w === W) return false;
    W = w; H = h;
    root.setAttribute('viewBox', `0 0 ${W} ${H}`);
    vignette.setAttribute('width', W); vignette.setAttribute('height', H);
    fall.setAttribute('transform', `translate(${W - 36} 22)`);
    snow.setAttribute('width', W + 20);
    treeCache.h = 0; last = { pathRef: null, ghostRef: null, k: 0, ox: 0, oy: 0, cfgKey: '' };
    return true;
  }
  let lastView = null;
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(es => { const w = es[0].contentRect.width; if (sizeFor(w) && lastView) render({ ...lastView, cfgChanged: true }); }).observe(node);

  function render(view) {
    lastView = view;
    if (!W || (node.isConnected && sizeFor(node.getBoundingClientRect().width))) { /* size changed */ }
    const { path, config, results } = view;
    const L = layout(path, view.scale);
    const cfgKey = [path.R, path.mode, path.turns, view.scale].join('|');
    if (last.pathRef !== path || last.cfgKey !== cfgKey) {
      const d = pathData(path, L.k, -L.ox / L.k, -L.oy / L.k);
      planned.setAttribute('d', d); trailOuter.setAttribute('d', d); trailInner.setAttribute('d', d);
      snow.setAttribute('y', -60); snow.setAttribute('height', L.worldH + H + 120);
      drawTrees(L.worldH + H);
      clear(chevrons);
      // Direction arrows along the line (every quarter turn).
      for (let q = 1; q < path.turns * 4; q += 2) {
        const p = stateAt(path, path.length * q / (path.turns * 4)), [x, y] = toScreen(L, p.x, p.y), a = Math.atan2(p.ty, p.tx) * 180 / Math.PI;
        chevrons.appendChild(svg('path', { d: 'M -5 -6 L 4 0 L -5 6', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})` }));
      }
      // The scale bar: 10 m (or 5 m when zoomed in).
      const m = L.k * 10 > 160 ? 5 : 10, len = m * L.k;
      sbLine.setAttribute('d', `M ${W - 24 - len} ${H - 30} v 6 h ${len} v -6`); sbText.setAttribute('x', W - 24 - len / 2); sbText.setAttribute('y', H - 34); sbText.textContent = `${m} m`;
      last = { ...last, pathRef: path, cfgKey };
    }
    if (last.ghostRef !== view.ghosts || last.ghostK !== L.k) {
      clear(ghosts);
      (view.ghosts || []).forEach((gh, i) => {
        const Lg = { ...L };
        ghosts.appendChild(svg('path', { d: pathData(gh.path, Lg.k, -L.ox / L.k, -L.oy / L.k), class: 'cl-ghost cl-ghost--' + (gh.cls || i) }));
        const end = stateAt(gh.path, gh.path.length * 0.5 / gh.path.turns), [gx, gy] = toScreen(L, end.x, end.y);
        ghosts.appendChild(svg('text', { x: gx - 8, y: gy + 4, 'text-anchor': 'end', class: 'cl-ghost-label cl-ghost--' + (gh.cls || i) }, gh.label));
      });
      last.ghostRef = view.ghosts; last.ghostK = L.k;
    }
    const p = stateAt(path, view.s);
    const [x, y] = toScreen(L, p.x, p.y), [cx, cy] = toScreen(L, p.cx, p.cy);
    // Camera: follow the skier down a long (linked) line.
    const camY = Math.max(0, Math.min(L.worldH - H, y - H * 0.42));
    world.setAttribute('transform', `translate(0 ${(-camY).toFixed(1)})`);
    const dash = (p.progress * 1000).toFixed(2);
    // (a gap longer than the path, so the dash pattern never repeats at its end)
    trailOuter.setAttribute('stroke-dasharray', `${dash} 2000`); trailInner.setAttribute('stroke-dasharray', `${dash} 2000`);
    radiusLine.setAttribute('x1', cx.toFixed(1)); radiusLine.setAttribute('y1', cy.toFixed(1)); radiusLine.setAttribute('x2', x.toFixed(1)); radiusLine.setAttribute('y2', y.toFixed(1));
    // The radius is labelled with the centre, beyond it and behind the skier's direction:
    // the acceleration and force arrows point at the centre, so this keeps clear of them.
    radiusLabel.textContent = '';
    centre.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);
    // Label the centre on the side away from the skier, so it never sits under the arrows.
    const lx = p.nx * 14 - p.tx * 12, ly = p.ny * 14 - p.ty * 12;
    centreLabel.setAttribute('x', (cx + lx).toFixed(1)); centreLabel.setAttribute('y', (cy + ly + 4).toFixed(1));
    centreLabel.setAttribute('text-anchor', lx > 4 ? 'start' : lx < -4 ? 'end' : 'middle');
    centreLabel.textContent = `centre · R = ${fmt(results.turnRadius, 1)} m`;
    const heading = Math.atan2(p.ty, p.tx) * 180 / Math.PI;
    const lean = 2 + 9 * Math.sin(config.edgeAngle * Math.PI / 180);
    skis.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${heading.toFixed(1)})`);
    body.setAttribute('transform', `translate(${(x + p.nx * lean).toFixed(1)} ${(y + p.ny * lean).toFixed(1)}) rotate(${heading.toFixed(1)})`);
    shadow.setAttribute('cx', (x + 5).toFixed(1)); shadow.setAttribute('cy', (y + 6).toFixed(1));
    // Snow spray off the outside of the turn, only while moving.
    const f = view.frame || 0;
    [...spray.children].forEach((c, i) => {
      const back = 10 + i * 5, out = 6 + ((i * 37 + f * 13) % 11);
      c.setAttribute('cx', (x - p.tx * back - p.nx * out).toFixed(1)); c.setAttribute('cy', (y - p.ty * back - p.ny * out).toFixed(1));
      c.setAttribute('opacity', view.playing ? (0.75 - i * 0.11).toFixed(2) : 0);
    });
    // Vectors: velocity along the path, acceleration and force toward the centre
    // (drawn side by side so both stay visible).
    const vecs = view.vectors || {};
    const vl = config.speed * ARROW.velocity, al = results.centripetalAcceleration * ARROW.acceleration, fl = results.inwardForce * ARROW.force;
    if (vecs.velocity) vel.set(x, y, p.tx, p.ty, Math.min(vl, ARROW.max.velocity), `v = ${fmt(config.speed, 1)} m/s`, vl > ARROW.max.velocity); else vel.set(0, 0, 0, 0, 0);
    if (vecs.acceleration) acc.set(x - p.tx * 8, y - p.ty * 8, p.nx, p.ny, Math.min(al, ARROW.max.acceleration), `a = ${fmt(results.centripetalAcceleration, 1)} m/s²`, al > ARROW.max.acceleration, -p.tx, -p.ty); else acc.set(0, 0, 0, 0, 0);
    if (vecs.force) frc.set(x + p.tx * 8, y + p.ty * 8, p.nx, p.ny, Math.min(fl, ARROW.max.force), `F = ${fmt(results.inwardForce, 0)} N`, fl > ARROW.max.force, p.tx, p.ty); else frc.set(0, 0, 0, 0, 0);
    readout.textContent = `t = ${fmt(view.time || 0, 2)} s of ${fmt(view.total, 2)} s · ${fmt(p.s, 1)} m of ${fmt(path.length, 1)} m` + (path.mode === 'linked' ? ` · ${p.side} turn ${p.arc + 1} of ${path.turns}` : '');
    if (view.cfgChanged || !desc.textContent) {
      desc.textContent = `Top-down view of the slope, fall line pointing down. The skier carves ${path.mode === 'linked' ? path.turns + ' linked turns' : 'a 180-degree turn'} of radius ${fmt(results.turnRadius, 1)} metres around the turn centre at ${fmt(config.speed, 1)} metres per second. Acceleration toward the centre ${fmt(results.centripetalAcceleration, 1)} metres per second squared; required inward force ${fmt(results.inwardForce, 0)} newtons.`;
      sideInset.update(config.sidecutRadius); edgeInset.update(config.edgeAngle);
    }
  }
  return { node, render, svg: root, get size() { return [W, H]; } };
}
