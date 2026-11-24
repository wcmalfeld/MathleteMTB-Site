// Enduro Race Intelligence Lab drawings (SVG). They only draw numbers that
// came from logic/models.js and stats.js: dot grids (attempts, riders), a
// probability tree, stacked dot plots, and the opening art.

import { svg } from '../../lesson-kit/dom.js';

const t = (x, y, text, cls, extra) => svg('text', { x, y, class: cls || 'ms-svg-small', ...(extra || {}) }, text);

// A grid of dots: classes[i] is a CSS modifier for dot i ('' for plain).
export function dotGrid(classes, cols, label, r = 5, gap = 13) {
  const rows = Math.ceil(classes.length / cols), W = cols * gap + gap, H = rows * gap + gap;
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ri-grid', role: 'img', 'aria-label': label });
  classes.forEach((c, i) => s.append(svg('circle', { cx: gap + (i % cols) * gap, cy: gap + Math.floor(i / cols) * gap, r, class: ['ri-dot', ...(c ? c.split(' ').filter(Boolean).map(x => 'ri-dot--' + x) : [])].join(' ') })));
  return s;
}

// Probability tree: first split by row (condition), then by column (outcome).
// T = twoWay table; hi = highlighted branch [i, j] or null.
export function tree(T, hi, label) {
  const W = 560, H = 230, s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ri-tree', role: 'img', 'aria-label': label });
  const root = [30, 115], mids = [[200, 60], [200, 170]], ends = [[[380, 30], [380, 90]], [[380, 140], [380, 200]]];
  T.rows.forEach((row, i) => {
    const on = hi && hi[0] === i;
    s.append(svg('line', { x1: root[0], y1: root[1], x2: mids[i][0], y2: mids[i][1], class: 'ri-branch' + (on ? ' is-on' : '') }),
      t((root[0] + mids[i][0]) / 2 - 10, (root[1] + mids[i][1]) / 2 - 6, `${row} ${fmtP(T.row(i))}`, 'ms-svg-small'),
      svg('circle', { cx: mids[i][0], cy: mids[i][1], r: 5, class: 'ri-node' }));
    T.cols.forEach((col, j) => {
      const e = ends[i][j], on2 = on && hi[1] === j;
      s.append(svg('line', { x1: mids[i][0], y1: mids[i][1], x2: e[0], y2: e[1], class: 'ri-branch' + (on2 ? ' is-on' : '') }),
        t((mids[i][0] + e[0]) / 2 - 4, (mids[i][1] + e[1]) / 2 - 5, fmtP(T.colGivenRow(j, i)), 'ms-svg-small'),
        t(e[0] + 8, e[1] + 4, `${col}: ${fmtP(T.joint(i, j))}`, 'ms-svg-label' + (on2 ? ' ri-tree-on' : '')));
    });
  });
  s.append(svg('circle', { cx: root[0], cy: root[1], r: 6, class: 'ri-node' }), t(W - 4, H - 6, 'branch × branch = joint probability', 'ms-svg-kicker ms-end'));
  return s;
}
const fmtP = f => String(Number(Number(f).toFixed(3)));

// Stacked dot plot of integer-ish values on [lo, hi]; marks the mean.
export function dotPlot(values, lo, hi, step, label, cls, meanV) {
  const W = 600, H = 150, pad = 30, X = v => pad + (v - lo) / (hi - lo) * (W - 2 * pad), base = 112, counts = new Map();
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ri-dotplot', role: 'img', 'aria-label': label });
  s.append(svg('line', { x1: pad, y1: base + 10, x2: W - pad, y2: base + 10, class: 'ri-axis' }));
  for (let v = lo; v <= hi + 1e-9; v += step) s.append(svg('line', { x1: X(v), y1: base + 10, x2: X(v), y2: base + 15, class: 'ri-axis' }), t(X(v), base + 30, String(Math.round(v * 100) / 100), 'ms-svg-small ms-mid'));
  values.slice().sort((a, b) => a - b).forEach(v => { const k = counts.get(v) || 0; counts.set(v, k + 1); s.append(svg('circle', { cx: X(v), cy: base - k * 13, r: 5.5, class: 'ri-pt ' + (cls || '') })); });
  if (meanV !== undefined) s.append(svg('line', { x1: X(meanV), y1: 6, x2: X(meanV), y2: base + 10, class: 'ri-mean' }), t(X(meanV) + 5, 16, `mean ${Math.round(meanV * 100) / 100}`, 'ms-svg-small ri-mean-text'));
  return s;
}

// Opening art: a finish line, a timing scoreboard, a two-way table and a bell curve.
export function openingArt() {
  const s = svg('svg', { viewBox: '0 0 640 420', class: 'ri-art', 'aria-hidden': 'true', focusable: 'false' });
  s.append(svg('rect', { x: 0, y: 0, width: 640, height: 420, class: 'ri-art-bg' }),
    svg('path', { d: 'M0 330 C 160 300, 320 350, 640 300 L 640 420 L 0 420 Z', class: 'ri-hill' }),
    svg('rect', { x: 430, y: 200, width: 12, height: 130, class: 'ri-post' }), svg('rect', { x: 598, y: 190, width: 12, height: 130, class: 'ri-post' }),
    svg('rect', { x: 430, y: 186, width: 180, height: 26, class: 'ri-banner' }), t(520, 204, 'FINISH', 'ms-svg-kicker ms-mid ri-banner-text'));
  s.append(svg('g', { class: 'ri-bike', transform: 'translate(380 306)' }, svg('circle', { cx: -14, cy: 0, r: 10 }), svg('circle', { cx: 14, cy: 0, r: 10 }), svg('path', { d: 'M-14 0 L-2 -13 L14 0 M-2 -13 L8 -13 M-2 -13 L-8 -22' }), svg('circle', { cx: -6, cy: -30, r: 4.5, class: 'ri-head' })));
  // scoreboard
  s.append(svg('rect', { x: 24, y: 24, width: 250, height: 132, rx: 6, class: 'ri-screen' }), t(38, 46, 'STAGE 2 · SIMULATED TIMES', 'ms-svg-kicker'));
  [['1', 'Alpha', '2:52'], ['2', 'Bravo', '2:58'], ['3', 'Alpha', '3:00'], ['4', 'Bravo', '3:12']].forEach(([p, c, tm], i) => s.append(t(40, 72 + i * 22, p, 'ri-board'), t(70, 72 + i * 22, c, 'ri-board'), t(250, 72 + i * 22, tm, 'ri-board ms-end')));
  // two-way table
  s.append(svg('rect', { x: 296, y: 24, width: 320, height: 132, rx: 6, class: 'ri-screen' }), t(310, 46, 'P(HIT | DRY) = 84/120', 'ms-svg-kicker'));
  [['', 'Hit', 'Miss'], ['Dry', '84', '36'], ['Wet', '40', '40']].forEach((r, i) => r.forEach((c, j) => s.append(t(330 + j * 90, 76 + i * 26, c, i === 1 && j === 1 ? 'ri-board ri-art-hi' : 'ri-board'))));
  // bell curve
  s.append(svg('rect', { x: 24, y: 176, width: 300, height: 120, rx: 6, class: 'ri-screen' }), t(38, 198, 'T ~ N(180, 12)', 'ms-svg-kicker'));
  const pts = []; for (let i = 0; i <= 60; i++) { const z = -3 + i / 10; pts.push(`${(40 + i * 4.5).toFixed(1)} ${(282 - 70 * Math.exp(-z * z / 2)).toFixed(1)}`); }
  s.append(svg('path', { d: 'M' + pts.join(' L '), class: 'ri-art-curve' }), svg('line', { x1: 175, y1: 210, x2: 175, y2: 284, class: 'ri-mean' }));
  return s;
}
