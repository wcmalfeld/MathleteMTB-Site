// The Split Report: illustrations. The race-control room (a timing screen,
// a leaderboard and a course-sector map) is an original drawing: no real
// event's graphics or logos. Times on it come from the fictional dataset.

import { svg } from '../../lesson-kit/dom.js';
import { LAPS, TEAM } from '../logic/data.js';

const T = (x, y, text, cls, extra) => svg('text', { x, y, class: cls, ...(extra || {}) }, text);

// The opening scene: a timing tower, an analyst graph and a course sector map.
export function openingArt() {
  const s = svg('svg', { class: 'spr-art', viewBox: '0 0 640 420', role: 'img', 'aria-label': `The ${TEAM} race room: a timing tower listing fictional riders and sector times, a scatter plot of practice laps against sector time with a falling trend line, and a course map split into three timed sectors` });
  s.append(svg('rect', { class: 'spr-art-bg', x: 0, y: 0, width: 640, height: 420 }));
  // timing tower
  s.append(svg('rect', { class: 'spr-art-panel', x: 20, y: 24, width: 236, height: 372, rx: 10 }), T(36, 52, 'TIMING TOWER · SECTOR 2', 'spr-art-k'));
  const rows = LAPS.slice().sort((a, b) => a.sectorTimeSeconds - b.sectorTimeSeconds).slice(0, 8);
  rows.forEach((r, i) => {
    const y = 80 + i * 38;
    s.append(svg('rect', { class: 'spr-art-row' + (i === 0 ? ' is-lead' : ''), x: 32, y: y - 20, width: 212, height: 30, rx: 5 }),
      T(44, y, String(i + 1).padStart(2, '0'), 'spr-art-pos'), T(78, y, '#' + r.bib, 'spr-art-bib'), T(124, y, r.rider.toUpperCase(), 'spr-art-name'), T(234, y, r.sectorTimeSeconds.toFixed(2), 'spr-art-time', { 'text-anchor': 'end' }));
  });
  // analyst screen: the scatter with its trend
  const ox = 290, oy = 40, w = 330, h = 200, X = v => ox + 30 + (v / 11) * (w - 50), Y = v => oy + h - 30 - ((v - 60) / 20) * (h - 50);
  s.append(svg('rect', { class: 'spr-art-panel', x: ox, y: oy, width: w, height: h, rx: 10 }), T(ox + 16, oy + 24, 'PRACTICE LAPS vs SECTOR TIME', 'spr-art-k'));
  for (let v = 60; v <= 80; v += 5) s.append(svg('path', { class: 'spr-art-grid', d: `M${X(0)} ${Y(v)} H${X(11)}` }));
  s.append(svg('path', { class: 'spr-art-fit', d: `M${X(0.5)} ${Y(78.4 - 0.7)} L${X(10.5)} ${Y(78.4 - 14.7)}` }));
  LAPS.forEach((r, i) => s.append(svg('circle', { class: 'spr-art-dot' + (i === 7 ? ' is-out' : ''), cx: X(r.practiceLaps), cy: Y(r.sectorTimeSeconds), r: 5 })));
  // the course and its sectors
  s.append(svg('rect', { class: 'spr-art-panel', x: ox, y: 256, width: w, height: 140, rx: 10 }), T(ox + 16, 280, 'COURSE · 3 TIMED SECTORS', 'spr-art-k'));
  const path = 'M310 372 C350 300 380 360 420 318 S490 300 520 340 S580 330 604 300';
  s.append(svg('path', { class: 'spr-art-course', d: path }));
  [[310, 372, 'START'], [420, 318, 'S1'], [520, 340, 'S2'], [604, 300, 'FINISH']].forEach(([x, y, t]) => s.append(svg('circle', { class: 'spr-art-gate', cx: x, cy: y, r: 6 }), T(x, y - 12, t, 'spr-art-gate-t', { 'text-anchor': 'middle' })));
  return s;
}
