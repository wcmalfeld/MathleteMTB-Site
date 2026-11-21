// The simulation canvas (PRD 3.1 A, 6): two views of the same configuration.
//   Top-down     the whole 180° corner: the trail and berm, all three riding
//                lines with the selected one highlighted, entry / apex / exit,
//                the turn centre and radius, direction arrows, the rider, and
//                the velocity / acceleration / net-force vectors.
//   Cross-section the berm seen end-on: the horizontal, the bank angle, the
//                rider and bike leaning, and the normal force, friction,
//                gravity and net inward force.
// The scene only draws what the engine (berm()) and the path
// (logic/simulation.js) give it; it never calculates physics itself.

import { el, svg, clear, put } from './dom.js';
import { stateAt, linePath, entry, apex, exit } from '../logic/simulation.js';
import { fmt, LINES, STATUS_TEXT } from '../logic/physics.js';
import { sectionInset, riderHeadOn } from './visuals.js';

const WIDE = [800, 500], NARROW = [420, 330];
const TRAIL_IN = 2.4, TRAIL_OUT = 12.8, LIP = 13.6;
// Arrow lengths on the top-down view (pixels per unit), capped.
export const ARROW = { velocity: 8, acceleration: 7, force: 0.1, max: 150 };

function arrowShape(cls, tip) {
  const g = svg('g', { class: 'bl-vec ' + cls });
  const title = svg('title', null, tip || '');
  const line = svg('line'), head = svg('path'), label = svg('text', { class: 'bl-vec-label' });
  g.append(title, line, head, label);
  // sx, sy nudge the label sideways; or `at` = [x, y, anchor] places it exactly.
  return { g, title, set(x1, y1, dx, dy, len, text, clipped, sx = 0, sy = 0, at = null) {
    if (!(len > 0.5) || !isFinite(len)) { g.setAttribute('visibility', 'hidden'); return; }
    g.setAttribute('visibility', 'visible');
    const x2 = x1 + dx * len, y2 = y1 + dy * len, h = 10, a = Math.atan2(dy, dx);
    line.setAttribute('x1', x1.toFixed(1)); line.setAttribute('y1', y1.toFixed(1));
    line.setAttribute('x2', (x2 - dx * h * 0.7).toFixed(1)); line.setAttribute('y2', (y2 - dy * h * 0.7).toFixed(1));
    head.setAttribute('d', `M ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 - h * Math.cos(a - 0.42)).toFixed(1)} ${(y2 - h * Math.sin(a - 0.42)).toFixed(1)} L ${(x2 - h * Math.cos(a + 0.42)).toFixed(1)} ${(y2 - h * Math.sin(a + 0.42)).toFixed(1)} Z`);
    const lx = x2 + dx * 8 + sx * 14, ly = y2 + dy * 8 + sy * 14 + 4, hx = dx + sx * 1.5;
    const pos = at ? at(x2, y2) : [lx, ly, hx < -0.3 ? 'end' : hx > 0.3 ? 'start' : 'middle'];
    label.setAttribute('x', pos[0].toFixed(1)); label.setAttribute('y', pos[1].toFixed(1));
    label.setAttribute('text-anchor', pos[2]);
    label.textContent = text + (clipped ? ' (off scale)' : '');
  } };
}

// A rider and bike seen from above, pointing along +x.
function topRider(cls) {
  return svg('g', { class: 'bl-top-rider ' + (cls || '') },
    svg('ellipse', { cx: 2, cy: 3, rx: 17, ry: 8, class: 'bl-shadow' }),
    svg('rect', { x: 6, y: -2, width: 12, height: 4, rx: 2, class: 'bl-tire' }),
    svg('rect', { x: -18, y: -2, width: 12, height: 4, rx: 2, class: 'bl-tire' }),
    svg('line', { x1: -12, y1: 0, x2: 12, y2: 0, class: 'bl-frame' }),
    svg('line', { x1: 9, y1: -8, x2: 9, y2: 8, class: 'bl-bars' }),
    svg('g', { class: 'bl-body' }, svg('ellipse', { cx: 0, cy: 0, rx: 6, ry: 9, class: 'bl-jersey' }), svg('circle', { cx: 2, cy: 0, r: 4.3, class: 'bl-helmet' })));
}

export function createScene() {
  let [W, H] = WIDE;
  // ---------- top-down ----------
  const top = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'bl-scene-svg', role: 'img' });
  const topTitle = svg('title');
  const defs = svg('defs', null,
    svg('pattern', { id: 'bl-grass', width: 18, height: 18, patternUnits: 'userSpaceOnUse' }, svg('rect', { width: 18, height: 18, class: 'bl-grass-bg' }), svg('circle', { cx: 4, cy: 5, r: 1.2, class: 'bl-grass-dot' }), svg('circle', { cx: 13, cy: 12, r: 1, class: 'bl-grass-dot' })),
    svg('radialGradient', { id: 'bl-berm-shade', gradientUnits: 'userSpaceOnUse' }, svg('stop', { offset: '0%', class: 'bl-shade-0' }), svg('stop', { offset: '100%', class: 'bl-shade-1' })));
  const bg = svg('rect', { width: W, height: H, fill: 'url(#bl-grass)' });
  const trees = svg('g', { class: 'bl-trees', 'aria-hidden': 'true' });
  const trail = svg('g', { class: 'bl-trail' });
  const linesG = svg('g', { class: 'bl-lines' });
  const selPlanned = svg('path', { class: 'bl-sel-planned' });
  const selTrail = svg('path', { class: 'bl-sel-trail', pathLength: 1000 });
  const marks = svg('g', { class: 'bl-marks' });
  const chev = svg('g', { class: 'bl-chev' });
  const radiusLine = svg('line', { class: 'bl-radius' });
  const centre = svg('g', { class: 'bl-centre' }, svg('circle', { r: 5 }), svg('line', { x1: -10, y1: 0, x2: 10, y2: 0 }), svg('line', { x1: 0, y1: -10, x2: 0, y2: 10 }));
  const centreLabel = svg('text', { class: 'bl-centre-label' });
  const ghosts = svg('g', { class: 'bl-ghost-riders' });
  const rider = topRider('bl-main-rider');
  const vel = arrowShape('bl-vec--v', 'Velocity: points along the line, the way the rider is moving.');
  const acc = arrowShape('bl-vec--a', 'Centripetal acceleration: points to the centre of the turn (a = v²/r).');
  const frc = arrowShape('bl-vec--f', 'Net inward force: what the berm and tires must supply together (F = m v²/r).');
  top.append(topTitle, defs, bg, trees, trail, linesG, selPlanned, selTrail, chev, marks, radiusLine, centre, centreLabel, ghosts, rider, frc.g, acc.g, vel.g);
  const inset = sectionInset();

  // ---------- cross-section ----------
  const sec = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'bl-scene-svg bl-section-svg', role: 'img' });
  const secTitle = svg('title');
  const sky = svg('rect', { width: W, height: H, class: 'bl-sky' });
  const dirt = svg('path', { class: 'bl-x-dirt' });
  const level = svg('line', { class: 'bl-x-level' });
  const levelLabel = svg('text', { class: 'bl-x-note' }, 'horizontal');
  const bankArc = svg('path', { class: 'bl-x-arc' });
  const bankLabel = svg('text', { class: 'bl-x-anglelabel' });
  const vertical = svg('line', { class: 'bl-x-vertical' });
  const leanArc = svg('path', { class: 'bl-x-arc bl-x-arc--lean' });
  const leanLabel = svg('text', { class: 'bl-x-anglelabel bl-x-anglelabel--lean' });
  const riderSec = svg('g');
  const sN = arrowShape('bl-vec--n', 'Normal force N: the berm pushes perpendicular to its surface. Tilted by the bank, part of it points into the turn.');
  const sF = arrowShape('bl-vec--fr', 'Friction f: grip along the berm surface. Up the berm when slower than the matched speed, down it (toward the centre) when faster.');
  const sG = arrowShape('bl-vec--g', 'Gravity mg: always straight down. It has no sideways part.');
  const sNet = arrowShape('bl-vec--f', 'Net inward force: N and f added together, minus nothing else, point horizontally into the turn (m v²/r).');
  const towards = svg('text', { class: 'bl-x-note' }, '← centre of the turn');
  const outside = svg('text', { class: 'bl-x-note', 'text-anchor': 'end' }, 'outside of the corner →');
  const secRead = svg('text', { class: 'bl-x-read' });
  sec.append(secTitle, sky, dirt, level, levelLabel, vertical, bankArc, bankLabel, leanArc, leanLabel, riderSec, sG.g, sN.g, sF.g, sNet.g, towards, outside, secRead);

  const badge = el('div', { class: 'bl-badge', role: 'status', 'aria-live': 'polite' });
  const readout = el('p', { class: 'bl-readout', 'aria-hidden': 'true' });
  const canvas = el('div', { class: 'bl-scene-canvas' }, top, sec, badge, readout);
  const node = el('div', { class: 'bl-scene' }, canvas,
    el('div', { class: 'bl-insets' }, el('figure', { class: 'bl-inset' }, el('figcaption', null, 'Berm cross-section'), inset.node)));

  let L = null, lastKey = '', lastView = null, treeKey = '';
  function layout() {
    const k = Math.min(25, (W - 40) / (2 * LIP));
    return { k, cx: W / 2, cy: H - (W < 600 ? 52 : 66) };
  }
  const P = (x, y) => [L.cx + x * L.k, L.cy + y * L.k];
  function drawTrees() {
    const key = W + 'x' + H;
    if (treeKey === key) return;
    clear(trees);
    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W, y = rnd() * H, dx = Math.abs(x - L.cx) / L.k, d = Math.hypot((x - L.cx) / L.k, (y - L.cy) / L.k);
      // Keep trees off the berm (the half ring) and off the entry and exit lanes.
      if (y < L.cy + 4 && d < LIP + 1.2) continue;
      if (y >= L.cy - 4 && dx > TRAIL_IN - 1.2 && dx < LIP + 1.2) continue;
      const s = 0.6 + rnd() * 0.7;
      trees.appendChild(svg('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})` },
        svg('ellipse', { cx: 5, cy: 6, rx: 15, ry: 10, class: 'bl-tree-shadow' }), svg('circle', { r: 14, class: 'bl-tree-a' }), svg('circle', { r: 8, cx: -3, cy: -3, class: 'bl-tree-b' })));
    }
    treeKey = key;
  }
  function drawCorner(view) {
    const { config, results } = view;
    // The trail: an annulus (the berm, shaded higher toward the outside) plus entry and exit lanes.
    clear(trail);
    const ring = (r1, r2, cls) => {
      const a = P(r2, 0), b = P(-r2, 0), c = P(-r1, 0), d = P(r1, 0), R2 = r2 * L.k, R1 = r1 * L.k;
      return svg('path', { class: cls, d: `M ${a[0]} ${a[1]} A ${R2} ${R2} 0 0 0 ${b[0]} ${b[1]} L ${c[0]} ${c[1]} A ${R1} ${R1} 0 0 1 ${d[0]} ${d[1]} Z` });
    };
    const lane = (x1, x2) => { const [ax] = P(x1, 0), [bx] = P(x2, 0); return svg('rect', { x: Math.min(ax, bx), y: L.cy - 1, width: Math.abs(bx - ax), height: H - L.cy + 2, class: 'bl-dirt' }); };
    trail.append(lane(TRAIL_IN, TRAIL_OUT), lane(-TRAIL_OUT, -TRAIL_IN), ring(TRAIL_OUT, LIP, 'bl-lip'), ring(TRAIL_IN, TRAIL_OUT, 'bl-dirt'));
    // Banking shading: stronger with a steeper berm (outer edge darker = higher).
    const shade = Math.min(0.55, config.bermAngle / 45 * 0.55);
    const g = top.querySelector('#bl-berm-shade');
    g.setAttribute('cx', L.cx); g.setAttribute('cy', L.cy); g.setAttribute('r', TRAIL_OUT * L.k); g.setAttribute('fx', L.cx); g.setAttribute('fy', L.cy);
    const sh = ring(TRAIL_IN, TRAIL_OUT, 'bl-berm-shade'); sh.setAttribute('fill', 'url(#bl-berm-shade)'); sh.setAttribute('opacity', shade.toFixed(2));
    trail.appendChild(sh);
    for (let r = TRAIL_IN + 2; r < TRAIL_OUT; r += 2) trail.appendChild(svg('path', { d: linePath(r, L.k, L.cx, L.cy), class: 'bl-contour', opacity: (shade * 0.9).toFixed(2) }));
    // Lane arrows: in on the right, out on the left.
    const [ex] = P((TRAIL_IN + TRAIL_OUT) / 2, 0), [xx] = P(-(TRAIL_IN + TRAIL_OUT) / 2, 0);
    trail.appendChild(svg('path', { d: `M ${ex - 7} ${H - 18} L ${ex} ${H - 30} L ${ex + 7} ${H - 18}`, class: 'bl-lane-arrow' }));
    trail.appendChild(svg('path', { d: `M ${xx - 7} ${H - 30} L ${xx} ${H - 18} L ${xx + 7} ${H - 30}`, class: 'bl-lane-arrow' }));
    trail.appendChild(svg('text', { x: ex + 14, y: H - 20, class: 'bl-lane-label' }, 'in'));
    trail.appendChild(svg('text', { x: xx + 14, y: H - 20, class: 'bl-lane-label' }, 'out'));
    // The three riding lines, labelled at their entry.
    clear(linesG);
    LINES.forEach(line => {
      linesG.appendChild(svg('path', { d: linePath(line.radius, L.k, L.cx, L.cy), class: 'bl-line bl-line--' + line.id }));
      const [lx, ly] = P(line.radius, 0);
      linesG.appendChild(svg('text', { x: lx, y: ly + 18, 'text-anchor': 'middle', class: 'bl-line-label' }, `${line.radius} m`));
    });
    // The selected line.
    const r = config.cornerRadius, d = linePath(r, L.k, L.cx, L.cy);
    selPlanned.setAttribute('d', d); selTrail.setAttribute('d', d);
    const over = results.gripStatus === 'exceeds';
    selPlanned.setAttribute('class', 'bl-sel-planned' + (over ? ' is-over' : ''));
    selTrail.setAttribute('class', 'bl-sel-trail' + (over ? ' is-over' : ''));
    // Entry, apex, exit.
    clear(marks);
    [[entry(r), 'Entry', 'start', 10, 4], [apex(r), 'Apex', 'middle', 0, -12], [exit(r), 'Exit', 'end', -10, 4]].forEach(([p, t, anchor, dx, dy]) => {
      const [x, y] = P(p.x, p.y);
      marks.append(svg('circle', { cx: x, cy: y, r: 4.5, class: 'bl-mark' }), svg('text', { x: x + dx, y: y + dy, 'text-anchor': anchor, class: 'bl-mark-label' }, t));
    });
    clear(chev);
    [0.25, 0.75].forEach(f => { const p = stateAt(r, Math.PI * r * f), [x, y] = P(p.x, p.y), a = Math.atan2(p.ty, p.tx) * 180 / Math.PI;
      chev.appendChild(svg('path', { d: 'M -5 -6 L 4 0 L -5 6', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})` })); });
    const [ccx, ccy] = P(0, 0);
    centre.setAttribute('transform', `translate(${ccx} ${ccy})`);
  }

  function sizeFor(width) {
    const [w, h] = width && width < 600 ? NARROW : WIDE;
    if (w === W) return false;
    W = w; H = h;
    [top, sec].forEach(s => s.setAttribute('viewBox', `0 0 ${W} ${H}`));
    bg.setAttribute('width', W); bg.setAttribute('height', H); sky.setAttribute('width', W); sky.setAttribute('height', H);
    lastKey = ''; treeKey = '';
    return true;
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(es => { if (sizeFor(es[0].contentRect.width) && lastView) render(lastView); }).observe(canvas);

  function renderTop(view) {
    const { config, results } = view;
    const key = [W, config.cornerRadius, config.bermAngle, results.gripStatus].join('|');
    if (key !== lastKey) { L = layout(); drawTrees(); drawCorner(view); lastKey = key; }
    const r = config.cornerRadius;
    const p = stateAt(r, view.s);
    const [x, y] = P(p.x, p.y), [cx, cy] = P(0, 0);
    selTrail.setAttribute('stroke-dasharray', `${(p.progress * 1000).toFixed(2)} 2000`);
    radiusLine.setAttribute('x1', cx); radiusLine.setAttribute('y1', cy); radiusLine.setAttribute('x2', x.toFixed(1)); radiusLine.setAttribute('y2', y.toFixed(1));
    // The centre sits on the trail's inner island: label it just above.
    centreLabel.setAttribute('x', cx); centreLabel.setAttribute('y', cy - 16); centreLabel.setAttribute('text-anchor', 'middle');
    centreLabel.textContent = `centre · r = ${fmt(r, 1)} m`;
    const heading = Math.atan2(p.ty, p.tx) * 180 / Math.PI, lean = 9 * Math.sin(results.leanAngle * Math.PI / 180);
    rider.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${heading.toFixed(1)})`);
    // lean the body toward the centre (the normal, expressed in the rider's own frame)
    rider.querySelector('.bl-body').setAttribute('transform', `translate(0 ${(lean * (p.tx * p.ny - p.ty * p.nx)).toFixed(1)})`);
    // Riders on the other lines, at the same moment (same speed, same start time).
    clear(ghosts);
    if (view.allLines) LINES.forEach(line => {
      if (Math.abs(line.radius - r) < 1e-9) return;
      const q = stateAt(line.radius, results.speed * (view.time || 0)), [gx, gy] = P(q.x, q.y);
      const g = topRider('bl-ghost-rider'); g.setAttribute('transform', `translate(${gx.toFixed(1)} ${gy.toFixed(1)}) rotate(${(Math.atan2(q.ty, q.tx) * 180 / Math.PI).toFixed(1)})`);
      ghosts.appendChild(g);
    });
    const v = view.vectors || {};
    // Arrows scale with the drawing (shorter on a phone's smaller corner).
    const zs = L.k / 25, cap = ARROW.max * zs;
    const vl = results.speed * ARROW.velocity * zs, al = results.centripetalAcceleration * ARROW.acceleration * zs, fl = results.netInwardForce * ARROW.force * zs;
    if (v.velocity) vel.set(x, y, p.tx, p.ty, Math.min(vl, cap), `v = ${fmt(results.speed, 2)} m/s`, vl > cap); else vel.set(0, 0, 0, 0, 0);
    if (v.acceleration) acc.set(x - p.tx * 8, y - p.ty * 8, p.nx, p.ny, Math.min(al, cap), `a = ${fmt(results.centripetalAcceleration, 2)} m/s²`, al > cap, -p.tx, -p.ty); else acc.set(0, 0, 0, 0, 0);
    if (v.force) frc.set(x + p.tx * 8, y + p.ty * 8, p.nx, p.ny, Math.min(fl, cap), `F = ${fmt(results.netInwardForce, 0)} N`, fl > cap, p.tx, p.ty); else frc.set(0, 0, 0, 0, 0);
    topTitle.textContent = `Top-down view of a 180-degree bermed corner with tight, middle and wide lines. The selected line has radius ${fmt(r, 1)} metres, ridden at ${fmt(config.speedKmh, 1)} kilometres per hour. ${STATUS_TEXT[results.gripStatus]}.`;
  }

  function renderSection(view) {
    const { config, results } = view;
    const b = config.bermAngle * Math.PI / 180, th = results.leanAngle * Math.PI / 180;
    const px = W * 0.56, py = H * 0.7, tb = Math.tan(b);
    dirt.setAttribute('d', `M 0 ${py + px * tb} L ${W} ${py - (W - px) * tb} L ${W} ${H} L 0 ${H} Z`);
    level.setAttribute('x1', 0); level.setAttribute('y1', py); level.setAttribute('x2', W); level.setAttribute('y2', py);
    levelLabel.setAttribute('x', 12); levelLabel.setAttribute('y', py - 6);
    const R = 70;
    bankArc.setAttribute('d', b > 0.005 ? `M ${px + R} ${py} A ${R} ${R} 0 0 0 ${(px + R * Math.cos(b)).toFixed(1)} ${(py - R * Math.sin(b)).toFixed(1)}` : '');
    bankLabel.setAttribute('x', px + R + 8); bankLabel.setAttribute('y', py - R * Math.sin(b / 2) + 4);
    bankLabel.textContent = b > 0.005 ? `berm β = ${fmt(config.bermAngle, 1)}°` : 'flat corner (β = 0°)';
    const len = Math.min(170, H * (W < 600 ? 0.42 : 0.36));
    vertical.setAttribute('x1', px); vertical.setAttribute('y1', py); vertical.setAttribute('x2', px); vertical.setAttribute('y2', py - len * 1.2);
    // The lean angle is marked above the rider's head, clear of the force arrows.
    const Rl = len * 1.14;
    leanArc.setAttribute('d', th > 0.01 ? `M ${px} ${py - Rl} A ${Rl} ${Rl} 0 0 0 ${(px - Rl * Math.sin(th)).toFixed(1)} ${(py - Rl * Math.cos(th)).toFixed(1)}` : '');
    leanLabel.setAttribute('x', (px - (Rl + 12) * Math.sin(th / 2)).toFixed(1)); leanLabel.setAttribute('y', (py - (Rl + 12) * Math.cos(th / 2)).toFixed(1));
    leanLabel.setAttribute('text-anchor', 'middle');
    leanLabel.textContent = `lean θ = ${fmt(results.leanAngle, 1)}°`;
    riderSec.replaceChildren(svg('g', { transform: `translate(${px} ${py})`, class: 'bl-rider-sec' }, riderHeadOn(len, results.leanAngle)));
    // Forces, scaled so the default rider's weight is about 100 px (heavier rider, longer arrows).
    const s = (W < 600 ? 80 : 100) / (80 * 9.81), cap = W < 600 ? 170 : 230;
    const comX = px - Math.sin(th) * len * 0.62, comY = py - Math.cos(th) * len * 0.62;
    const v = view.vectors || {};
    const fN = results.normalForce * s, fG = results.weight * s, fF = Math.abs(results.frictionForce) * s, fNet = results.netInwardForce * s;
    if (v.gravity) sG.set(comX, comY, 0, 1, Math.min(fG, cap), `mg = ${fmt(results.weight, 0)} N`, fG > cap, 0, 0, (x, y) => [x - 10, y - 6, 'end']); else sG.set(0, 0, 0, 0, 0);
    if (v.normal) sN.set(px, py, -Math.sin(b), -Math.cos(b), Math.min(fN, cap), `N = ${fmt(results.normalForce, 0)} N`, fN > cap, 0, 0, (x, y) => [x + 16 * Math.cos(b) + 6, y - 16 * Math.sin(b) + 4, 'start']); else sN.set(0, 0, 0, 0, 0);
    // Friction acts along the surface: + up the berm (toward the outside), − down it (toward the centre).
    const up = results.frictionForce >= 0, fdx = (up ? 1 : -1) * Math.cos(b), fdy = (up ? -1 : 1) * Math.sin(b);
    if (v.friction) sF.set(px + fdx * 6, py + fdy * 6, fdx, fdy, Math.min(fF, cap), fF < 2 ? 'f ≈ 0' : `f = ${fmt(Math.abs(results.frictionForce), 0)} N ${up ? 'up' : 'down'} the berm`, fF > cap, 0, 0, (x, y) => [Math.max(x, px - 40), Math.max(y, py) + 30, 'middle']); else sF.set(0, 0, 0, 0, 0);
    if (v.force) sNet.set(comX, comY, -1, 0, Math.min(fNet, cap), `net inward F = ${fmt(results.netInwardForce, 0)} N`, fNet > cap, 0, 0, (x, y) => [x - 6, y - 10, 'end']); else sNet.set(0, 0, 0, 0, 0);
    towards.setAttribute('x', 12); towards.setAttribute('y', 28);
    outside.setAttribute('x', W - 12); outside.setAttribute('y', H - 16);
    secRead.setAttribute('x', 12); secRead.setAttribute('y', 50);
    const l1 = results.requiredGrip < 0.005 ? 'Matched! The tilted N supplies the whole turn.' : `Grip needed ${fmt(results.requiredGrip, 2)} of ${fmt(config.availableGrip, 2)} available.`;
    const l2 = `Matched berm for this speed and line: ${fmt(results.matchedBermAngle, 1)}°`;
    put(secRead, svg('tspan', { x: 12, dy: 0 }, l1), svg('tspan', { x: 12, dy: 18 }, l2));
    secTitle.textContent = `Berm cross-section: banked ${fmt(config.bermAngle, 1)} degrees, rider leaning ${fmt(results.leanAngle, 1)} degrees. Normal force ${fmt(results.normalForce, 0)} newtons, friction ${fmt(Math.abs(results.frictionForce), 0)} newtons ${up ? 'up' : 'down'} the berm, weight ${fmt(results.weight, 0)} newtons.`;
  }

  function render(view) {
    lastView = view;
    if (canvas.isConnected) sizeFor(canvas.getBoundingClientRect().width);
    const { results, config } = view;
    const sectionView = view.view === 'section';
    top.style.display = sectionView ? 'none' : '';
    sec.style.display = sectionView ? '' : 'none';
    node.classList.toggle('is-section', sectionView);
    if (sectionView) renderSection(view); else renderTop(view);
    inset.update(results);
    const st = results.gripStatus;
    badge.className = 'bl-badge is-' + st;
    put(badge, el('span', { class: 'bl-badge-dot', 'aria-hidden': 'true' }),
      el('span', null, el('b', null, STATUS_TEXT[st]), ` · grip needed ${fmt(results.requiredGrip, 2)} of ${fmt(config.availableGrip, 2)}`),
      st === 'exceeds' ? el('span', { class: 'bl-badge-note' }, 'The simplified model can’t hold this line with the chosen grip setting, so the line is dashed. (A model result, not a prediction about real riding.)') : null);
    const p = stateAt(config.cornerRadius, view.s);
    readout.textContent = `t = ${fmt(view.time || 0, 2)} s of ${fmt(results.turnDuration, 2)} s · ${fmt(p.s, 1)} m of ${fmt(results.turnDistance, 1)} m`;
  }
  return { node, render };
}
