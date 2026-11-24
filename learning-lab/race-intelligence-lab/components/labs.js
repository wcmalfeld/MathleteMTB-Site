// Enduro Race Intelligence Lab interactives. Each returns an element; every
// number shown comes from logic/models.js and logic/stats.js. Every control
// is keyboard-operable; settings are kept in the lab's progress (getData /
// setData). Simulations are seeded, so a given setting always reproduces.
// A page asks its questions before the tool that would show their answers.

import { el, put, button } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot } from '../../lesson-kit/plot.js';
import { raceTable, CARDS, ALPHA, BRAVO, NORMAL, SURVEY, riders, JUMP_LINE, EXPERIMENT, PODIUM } from '../logic/models.js';
import { mean, median, range, popSD, quartiles, histogram, Phi, normalPdf, zScore, se, moe, rng, sampleIndices, samplingDistribution, nCr, nPr, factorial, fmt, pct, show } from '../logic/stats.js';
import { testFor } from '../logic/questions.js';
import { dotGrid, tree, dotPlot } from './visuals.js';

const readBox = () => el('div', { class: 'ri-read', 'aria-live': 'polite' });
const pressed = (label, on, onclick) => el('button', { type: 'button', class: 'ls-btn ls-btn--quiet ri-toggle', 'aria-pressed': String(!!on), onclick }, label);
const tbl = (head, rows, cap) => el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table ri-table' }, el('caption', { class: 'ls-sr' }, cap || ''),
  el('thead', null, el('tr', null, head.map(h => el('th', { scope: 'col' }, h)))), el('tbody', null, rows.map(r => el('tr', null, el('th', { scope: 'row' }, r[0]), r.slice(1).map(c => el('td', { class: 'ms-mono' }, c)))))));
const bars = (hist, maxY, cls) => hist.map(b => ({ points: [[b.from, 0], [b.from, b.count], [b.to, b.count], [b.to, 0]], cls }));
const SIM = 'Simulated data';

// ------------------------------------------------------------ Race outcome explorer (Mission 1)
// Each of the 200 attempts is one dot, ordered by cell: Dry/Hit, Dry/Miss, Wet/Hit, Wet/Miss.
export function outcomeExplorer(ctx) {
  const Pr = ctx.progress, T = raceTable();
  let st = Pr.getData('explorer', { sel: 'c00', mode: 'counts' });
  const tableBox = el('div'), grid = el('div', { class: 'ms-figure ri-grid-box' }), read = readBox();
  const modes = segs('Show', [{ label: 'Counts', value: 'counts' }, { label: 'Joint', value: 'joint' }, { label: 'Marginal', value: 'marginal' }, { label: 'Conditional (given row)', value: 'conditional' }], st.mode, v => { st.mode = v; draw(false); });
  const cellOf = k => { let c = 0; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { if (k < c + T.cells[i][j]) return [i, j]; c += T.cells[i][j]; } };
  const EVENTS = {
    c00: { name: 'Dry and hit target', has: ([i, j]) => i === 0 && j === 0, p: T.joint(0, 0), why: 'Both happen: a dry attempt that hit its target.' },
    c01: { name: 'Dry and missed', has: ([i, j]) => i === 0 && j === 1, p: T.joint(0, 1), why: 'A dry attempt that missed.' },
    c10: { name: 'Wet and hit target', has: ([i, j]) => i === 1 && j === 0, p: T.joint(1, 0), why: 'A wet attempt that hit its target.' },
    c11: { name: 'Wet and missed', has: ([i, j]) => i === 1 && j === 1, p: T.joint(1, 1), why: 'A wet attempt that missed.' },
    A: { name: 'A: hit target', has: ([, j]) => j === 0, p: T.col(0), why: 'Every attempt that hit, dry or wet.' },
    B: { name: 'B: dry course', has: ([i]) => i === 0, p: T.row(0), why: 'Every dry attempt.' },
    or: { name: 'A or B', has: ([i, j]) => i === 0 || j === 0, p: T.union(0, 0), why: 'Hit, dry, or both: the overlap counts once.' },
    notA: { name: 'not A', has: ([, j]) => j === 1, p: T.col(1), why: 'The complement: every attempt that missed.' }
  };
  function cellText(i, j) {
    const n = T.cells[i][j];
    return { counts: String(n), joint: show(T.joint(i, j)), marginal: String(n), conditional: show(T.colGivenRow(j, i)) }[st.mode];
  }
  function draw(quiet) {
    const E = EVENTS[st.sel], sel = k => () => { st.sel = k; draw(false); };
    const cellBtn = (i, j) => el('td', null, el('button', { type: 'button', class: 'ri-cell' + (st.sel === `c${i}${j}` ? ' is-on' : ''), 'aria-pressed': String(st.sel === `c${i}${j}`), onclick: sel(`c${i}${j}`) }, cellText(i, j)));
    const marg = (k, txt) => el('td', null, el('button', { type: 'button', class: 'ri-cell ri-cell--m' + (st.sel === k ? ' is-on' : ''), 'aria-pressed': String(st.sel === k), onclick: sel(k) }, txt));
    const mt = (n, f) => (st.mode === 'counts' ? String(n) : st.mode === 'marginal' ? show(f) : st.mode === 'joint' ? show(f) : '—');
    put(tableBox, el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table ri-two-way' }, el('caption', null, `${SIM}: 200 stage attempts`),
      el('thead', null, el('tr', null, el('th', { scope: 'col' }, 'Course'), T.cols.map(c => el('th', { scope: 'col' }, c)), el('th', { scope: 'col' }, 'Total'))),
      el('tbody', null, T.rows.map((r, i) => el('tr', null, el('th', { scope: 'row' }, r), cellBtn(i, 0), cellBtn(i, 1), i === 0 ? marg('B', mt(T.rowTot[0], T.row(0))) : el('td', { class: 'ms-mono' }, mt(T.rowTot[1], T.row(1))))),
        el('tr', null, el('th', { scope: 'row' }, 'Total'), marg('A', mt(T.colTot[0], T.col(0))), el('td', { class: 'ms-mono' }, mt(T.colTot[1], T.col(1))), el('td', { class: 'ms-mono' }, st.mode === 'counts' ? '200' : '1'))))),
      el('div', { class: 'ls-actions' }, ['or', 'notA'].map(k => pressed(EVENTS[k].name, st.sel === k, sel(k)))));
    const cls = Array.from({ length: T.total }, (_, k) => { const c = cellOf(k); return (E.has(c) ? 'on ' : '') + (c[0] === 0 ? 'dry' : 'wet'); });
    put(grid, dotGrid(cls, 25, `${E.name}: ${Math.round(Number(E.p) * T.total)} of 200 attempts highlighted.`));
    const n = Math.round(Number(E.p) * T.total);
    put(read, el('p', { class: 'ms-live-eq ri-eqn' }, `P(${E.name}) = ${n}/200 = `, el('b', { class: 'ri-out' }, show(E.p))), el('p', null, E.why),
      st.mode === 'conditional' ? el('p', { class: 'ls-small' }, 'Conditional view: each cell ÷ its row total, e.g. 84 ÷ 120 for dry attempts.') : null);
    Pr.setData('explorer', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, grid, el('ul', { class: 'ri-legend' }, el('li', { class: 'is-dry' }, 'dry attempt'), el('li', { class: 'is-wet' }, 'wet attempt'), el('li', { class: 'is-on' }, 'in the selected event'))),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Show'), modes), el('p', { class: 'ls-small' }, 'Select a cell, a total, or an event.'), tableBox, read));
}

// ------------------------------------------------------------ Conditional probability filter + tree (Mission 1)
export function conditionalFilter(ctx) {
  const Pr = ctx.progress, T = raceTable();
  let f = Pr.getData('filter', 'dry');
  const fig = el('div', { class: 'ms-figure' }), treeBox = el('div', { class: 'ms-figure' }), read = readBox();
  const F = { all: ['All attempts', null], dry: ['Dry only', [0, null]], wet: ['Wet only', [1, null]], hit: ['Hit target only', [null, 0]], miss: ['Missed only', [null, 1]] };
  const tabs = segs('Filter', Object.entries(F).map(([v, [label]]) => ({ label, value: v })), f, v => { f = v; draw(false); });
  function draw(quiet) {
    const c = F[f][1];
    let num, den, q;
    if (!c) { num = T.colTot[0]; den = T.total; q = 'P(hit target)'; }
    else if (c[0] !== null) { num = T.cells[c[0]][0]; den = T.rowTot[c[0]]; q = `P(hit target | ${T.rows[c[0]].toLowerCase()})`; }
    else { num = T.cells[0][c[1]]; den = T.colTot[c[1]]; q = `P(dry | ${c[1] === 0 ? 'hit target' : 'missed'})`; }
    const share = num / den, kept = (i, j) => !c || (c[0] !== null ? c[0] === i : c[1] === j);
    put(fig, el('ul', { class: 'ri-hbars', 'aria-label': `${SIM}: attempts kept by the filter` }, [[0, 0], [0, 1], [1, 0], [1, 1]].map(([i, j]) => {
      const n = T.cells[i][j], on = kept(i, j);
      return el('li', { class: on ? '' : 'is-out' }, el('span', { class: 'ri-hbar-l' }, `${T.rows[i]} · ${T.cols[j].toLowerCase()}`),
        el('span', { class: 'ri-hbar-track' }, el('span', { class: 'ri-hbar ' + (j === 0 ? 'is-hit' : 'is-miss'), style: { width: (n / 120 * 100) + '%' } })), el('b', null, on ? String(n) : `(${n})`));
    })));
    put(treeBox, tree(T, c && c[0] !== null ? [c[0], 0] : null, 'Probability tree: condition, then outcome.'));
    put(read, el('p', { class: 'ms-live-eq ri-eqn' }, `${q} = ${num}/${den} = `, el('b', { class: 'ri-out' }, fmt(share, 3))),
      el('p', { class: 'ls-small' }, c ? `The filter keeps ${den} of 200 attempts: that restricted group is the new denominator.` : 'No filter: the denominator is all 200 attempts.'),
      el('p', { class: 'ls-small' }, `Compare: P(hit target) = ${show(T.col(0))} overall.`));
    Pr.setData('filter', f, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, treeBox), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Filter the data'), tabs), read,
    el('p', { class: 'ls-small' }, 'Observational simulated data: an association here isn’t proof that conditions cause results, and it isn’t riding advice.')));
}

// ------------------------------------------------------------ Independent card draws (Mission 1)
export function cardSim(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('cards', { n: 100, seed: 1 });
  const box = el('div'), read = readBox();
  const sizes = segs('Draws', [10, 100, 1000, 10000].map(n => ({ label: `${n.toLocaleString('en-US')} draws`, value: n })), st.n, v => { st.n = v; draw(false); });
  function draw(quiet) {
    const r = rng(st.seed * 7919 + st.n), counts = Array.from({ length: 3 }, () => [0, 0]);
    for (let k = 0; k < st.n; k++) counts[Math.floor(r() * 3)][Math.floor(r() * 2)]++;
    const jw = counts[1][1] / st.n;
    put(box, tbl(['Feature', 'Dry', 'Wet'], CARDS.features.map((f, i) => [f, String(counts[i][0]), String(counts[i][1])]), `${st.n} independent draws`));
    put(read, el('p', { class: 'ms-live-eq' }, `Experimental P(Jump and Wet) = ${counts[1][1]}/${st.n} = `, el('b', { class: 'ri-out' }, fmt(jw, 3))),
      el('p', { class: 'ms-live-eq' }, 'Theoretical: 1/3 × 1/2 = 1/6 ≈ 0.167'), el('p', { class: 'ls-small' }, `Off by ${fmt(Math.abs(jw - 1 / 6), 3)}. More draws usually bring the experimental value closer.`));
    Pr.setData('cards', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab ms-lab--stack' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Number of draws'), sizes),
    button('Draw again (new seed)', () => { st.seed++; draw(false); }, 'ls-btn--quiet'), box, read);
}

// ------------------------------------------------------------ Rider consistency analyzer (Mission 2)
export function consistencyAnalyzer(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('consistency', { view: 'dots', spread: 1, last: 188 });
  const box = el('div', { class: 'ri-plots' }), read = readBox(), practice = el('div');
  const tabs = segs('View', [{ label: 'Dot plots', value: 'dots' }, { label: 'Histograms', value: 'hist' }], st.view, v => { st.view = v; draw(false); });
  const sS = slider({ label: 'Practice crew: spread', min: 0.25, max: 2, step: 0.25, value: st.spread, onInput: v => { st.spread = v; draw(true); }, format: v => `× ${v}` });
  const sL = slider({ label: 'Practice crew: slowest run', min: 180, max: 260, step: 2, value: st.last, unit: 's', onInput: v => { st.last = v; draw(true); } });
  const summary = a => { const q = quartiles(a); return [fmt(mean(a), 2), fmt(median(a), 1), fmt(range(a), 1), fmt(q.iqr, 1), fmt(popSD(a), 2)]; };
  function draw(quiet) {
    const pr = ALPHA.map((v, i) => (i === ALPHA.length - 1 ? st.last : Math.round((180 + (v - 180) * st.spread) * 10) / 10));
    const show1 = (name, a, cls) => st.view === 'dots' ? dotPlot(a, 150, 210, 10, `${name}: dot plot of 10 simulated times.`, cls, mean(a))
      : plot({ x: [150, 210], y: [0, 6], xLabel: `${name} time (s)`, yLabel: 'runs', xStep: 10, yStep: 1, xDigits: 0, label: `${name}: histogram, 5 s bins.`, polygons: bars(histogram(a, 150, 210, 5), 6, cls).map(b => ({ points: b.points, cls: b.cls })) }).node;
    put(box, el('div', null, el('p', { class: 'ri-plot-h' }, 'Crew Alpha'), show1('Crew Alpha', ALPHA, 'ri-pt--a')), el('div', null, el('p', { class: 'ri-plot-h' }, 'Crew Bravo'), show1('Crew Bravo', BRAVO, 'ri-pt--b')));
    put(read, tbl(['', 'Mean', 'Median', 'Range', 'IQR', 'σ'], [['Alpha', ...summary(ALPHA)], ['Bravo', ...summary(BRAVO)], ['Practice', ...summary(pr)]], 'Summary statistics (seconds)'),
      el('p', { class: 'ls-small' }, `${SIM}. σ is the population standard deviation (the 10 runs are the whole data set).`));
    put(practice, el('div', { class: 'ri-practice' }, el('p', { class: 'ri-plot-h' }, 'Practice crew'), dotPlot(pr.map(v => Math.round(v)), 150, 270, 10, 'Practice crew dot plot.', 'ri-pt--p', mean(pr)),
      el('p', { class: 'ls-small' }, `Mean ${fmt(mean(pr), 1)} s, median ${fmt(median(pr), 1)} s, σ ${fmt(popSD(pr), 2)} s. ${st.last > 210 ? 'One slow run pulls the mean and σ up; the median barely moves.' : 'Spread the times out and watch σ grow while the center stays put.'}`)));
    Pr.setData('consistency', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, box), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'View'), tabs), read, sS.node, sL.node, practice));
}

// ------------------------------------------------------------ Race performance bell curve (Mission 2)
export function bellCurve(ctx) {
  const Pr = ctx.progress, { mu, sigma } = NORMAL;
  let st = Pr.getData('bell', { k: 1, custom: false, a: 168, b: 192 });
  const fig = el('div', { class: 'ms-figure' }), read = readBox(), ctl = el('div');
  const tabs = segs('Band', [{ label: '±1 SD', value: 1 }, { label: '±2 SD', value: 2 }, { label: '±3 SD', value: 3 }, { label: 'Custom', value: 0 }], st.custom ? 0 : st.k, v => { if (v) { st.k = v; st.custom = false; } else st.custom = true; draw(false); });
  const sA = slider({ label: 'From', min: 132, max: 228, step: 1, value: st.a, unit: 's', onInput: v => { st.a = Math.min(v, st.b - 1); draw(true); } });
  const sB = slider({ label: 'To', min: 132, max: 228, step: 1, value: st.b, unit: 's', onInput: v => { st.b = Math.max(v, st.a + 1); draw(true); } });
  function draw(quiet) {
    const a = st.custom ? st.a : mu - st.k * sigma, b = st.custom ? st.b : mu + st.k * sigma, area = Phi((b - mu) / sigma) - Phi((a - mu) / sigma);
    const pts = []; for (let i = 0; i <= 200; i++) { const x = a + (b - a) * i / 200; pts.push([x, normalPdf(x, mu, sigma)]); }
    put(ctl, st.custom ? [sA.node, sB.node] : null);
    put(fig, plot({ x: [132, 228], y: [0, 0.036], xLabel: 'modelled time (s)', yLabel: 'density', xStep: 12, yStep: 0.01, xDigits: 0, yDigits: 2, label: `N(180, 12): ${pct(area)} of modelled times between ${a} and ${b} s.`,
      polygons: [{ points: [[a, 0], ...pts, [b, 0]], cls: 'ri-area' }], series: [{ points: Array.from({ length: 241 }, (_, i) => { const x = 132 + i * 0.4; return [x, normalPdf(x, mu, sigma)]; }), cls: 'ri-line--curve' }],
      vlines: [-3, -2, -1, 0, 1, 2, 3].map(k => ({ x: mu + k * sigma, cls: k === 0 ? 'ri-mean-line' : 'ri-sd-line', label: k === 0 ? 'μ' : `${k > 0 ? '+' : '−'}${Math.abs(k)}σ` })) }).node);
    put(read, el('p', { class: 'ms-live-eq ri-eqn' }, `P(${a} ≤ T ≤ ${b}) ≈ `, el('b', { class: 'ri-out' }, pct(area))),
      !st.custom ? el('p', null, `Empirical rule: about ${{ 1: '68%', 2: '95%', 3: '99.7%' }[st.k]} within ${st.k} SD (${mu - st.k * sigma}–${mu + st.k * sigma} s).`) : el('p', { class: 'ls-small' }, 'Computed with the normal CDF.'),
      el('p', { class: 'ls-small' }, 'T ~ N(180, 12) means mean 180 s, standard deviation 12 s. A hypothetical model for one controlled stage.'));
    Pr.setData('bell', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Shade'), tabs), ctl, read));
}

// ------------------------------------------------------------ Rider performance percentile calculator (Mission 2)
export function percentileCalc(ctx) {
  const Pr = ctx.progress, { mu, sigma } = NORMAL;
  let x = Pr.getData('pct', 168);
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sX = slider({ label: 'Race time', min: 132, max: 228, step: 1, value: x, unit: 's', onInput: v => { x = v; draw(true); }, describe: v => `${v} s: z = ${fmt(zScore(v, mu, sigma), 2)}` });
  const presets = el('div', { class: 'ls-actions' }, [[168, 'z = −1'], [180, 'z = 0'], [204, 'z = +2']].map(([v, l]) => button(`${v} s (${l})`, () => { x = v; sX.set(v); draw(false); }, 'ls-btn--quiet ri-math')));
  function draw(quiet) {
    const z = zScore(x, mu, sigma), p = Phi(z), pts = []; for (let i = 0; i <= 160; i++) { const v = 132 + (x - 132) * i / 160; pts.push([v, normalPdf(v, mu, sigma)]); }
    put(fig, plot({ x: [132, 228], y: [0, 0.036], xLabel: 'modelled time (s)', yLabel: 'density', xStep: 12, yStep: 0.01, xDigits: 0, yDigits: 2, label: `${x} s is at about the ${fmt(p * 100, 1)}th percentile.`,
      polygons: [{ points: [[132, 0], ...pts, [x, 0]], cls: 'ri-area' }], series: [{ points: Array.from({ length: 241 }, (_, i) => { const v = 132 + i * 0.4; return [v, normalPdf(v, mu, sigma)]; }), cls: 'ri-line--curve' }],
      vlines: [{ x: mu, cls: 'ri-mean-line', label: 'μ = 180' }, { x, cls: 'ri-x-line', label: `${x} s` }] }).node);
    put(read, tbl(['', ''], [['Time', `${x} s`], ['z-score', `(${x} − 180) ÷ 12 = ${fmt(z, 2)}`], ['Position', z < 0 ? `${fmt(-z, 2)} SD below the mean: faster` : z > 0 ? `${fmt(z, 2)} SD above the mean: slower` : 'exactly the mean'],
      ['Time percentile', `${fmt(p * 100, 1)}%`], ['Modelled riders slower', `${fmt((1 - p) * 100, 1)}%`]], 'Percentile readout'),
      el('p', { class: 'ls-small' }, 'For times, a low percentile is good: it means few modelled riders were faster.'));
    Pr.setData('pct', x, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sX.node, presets, read));
}

// ------------------------------------------------------------ Rider survey simulator (Mission 3)
export function surveySim(ctx) {
  const Pr = ctx.progress, POP = riders();
  let st = Pr.getData('survey', { n: 100, seed: 1, reveal: false, history: [] });
  const grid = el('div', { class: 'ms-figure ri-grid-box' }), read = readBox(), tg = el('div', { class: 'ls-actions' });
  const sizes = segs('Sample size', SURVEY.sizes.map(n => ({ label: `${n} riders`, value: n })), st.n, v => { st.n = v; draw(false); });
  function draw(quiet) {
    const idx = new Set(sampleIndices(POP.length, st.n, rng(st.seed * 104729 + st.n))), x = [...idx].reduce((s, i) => s + POP[i], 0), p = x / st.n;
    put(tg, button('Draw a new random sample', () => { st.seed++; st.history = [{ n: st.n, p: null }, ...st.history].slice(0, 6); draw(false); }, 'ls-btn--primary'), pressed('Reveal the whole population', st.reveal, () => { st.reveal = !st.reveal; draw(false); }));
    if (st.history.length && st.history[0].p === null) st.history[0] = { n: st.n, p };
    const cls = POP.map((v, i) => (idx.has(i) ? (v ? 'flow' : 'tech') : st.reveal ? (v ? 'flow-faint' : 'tech-faint') : ''));
    put(grid, dotGrid(cls, 40, `1,000 simulated riders; ${st.n} sampled, ${x} prefer flow.`, 3.6, 9.5));
    put(read, el('p', { class: 'ms-live-eq ri-eqn' }, `p̂ = ${x}/${st.n} = `, el('b', { class: 'ri-out' }, fmt(p, 3))),
      st.history.length ? el('p', { class: 'ls-small' }, 'Recent samples: ' + st.history.filter(h => h.p !== null).map(h => `${fmt(h.p, 2)} (n = ${h.n})`).join(' · ')) : el('p', { class: 'ls-small' }, 'Draw more samples: each random sample gives a different p̂.'),
      st.reveal ? el('p', null, 'The hidden population: 600 of 1,000 prefer flow, p = 0.60.') : el('p', { class: 'ls-small' }, 'In a real survey you never see the whole population.'));
    Pr.setData('survey', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, grid, el('ul', { class: 'ri-legend' }, el('li', { class: 'is-flow' }, 'sampled: flow'), el('li', { class: 'is-tech' }, 'sampled: technical'), el('li', { class: 'is-plain' }, 'not sampled'))),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Sample size'), sizes), tg, read, el('p', { class: 'ls-small' }, 'A simulated population created to show sampling variability.')));
}

// ------------------------------------------------------------ Sampling distribution (Mission 3)
export function samplingDist(ctx) {
  const Pr = ctx.progress, POP = riders();
  let n = Pr.getData('sampdist', 25);
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sizes = segs('Sample size', SURVEY.sizes.map(v => ({ label: `n = ${v}`, value: v })), n, v => { n = v; draw(false); });
  const cache = new Map();
  function draw(quiet) {
    if (!cache.has(n)) cache.set(n, samplingDistribution(POP, n, 1000, 11 + n));
    const d = cache.get(n), h = histogram(d, 0.2, 1, 0.02), m = mean(d), s = popSD(d), th = se(0.6, n);
    put(fig, plot({ x: [0.3, 0.9], y: [0, Math.max(...h.map(b => b.count)) * 1.15], xLabel: 'sample proportion p̂', yLabel: 'samples (of 1,000)', xStep: 0.1, yStep: n >= 100 ? 50 : 25, xDigits: 1, label: `1,000 samples of ${n}: mean ${fmt(m, 3)}, SD ${fmt(s, 3)}.`,
      polygons: h.map(b => ({ points: [[b.from, 0], [b.from, b.count], [b.to, b.count], [b.to, 0]], cls: 'ri-bar--hit' })), vlines: [{ x: 0.6, cls: 'ri-mean-line', label: 'p = 0.60' }] }).node);
    put(read, tbl(['', ''], [['Samples', '1,000 (seeded)'], ['Mean of p̂', fmt(m, 3)], ['SD of p̂ (simulated)', fmt(s, 3)], ['SE formula √(0.6 × 0.4 / n)', fmt(th, 3)]], 'Sampling distribution'),
      el('p', { class: 'ls-small' }, 'The p̂ values cluster around 0.60. Bigger samples cluster more tightly, but never perfectly.'));
    Pr.setData('sampdist', n, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Sample size'), sizes), read));
}

// ------------------------------------------------------------ Margin of error explorer (Mission 3)
export function moeExplorer(ctx) {
  const Pr = ctx.progress, ph = SURVEY.x / SURVEY.n;
  let n = Pr.getData('moe', 100);
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sN = slider({ label: 'Sample size n', min: 25, max: 400, step: 25, value: n, onInput: v => { n = v; draw(true); }, describe: v => `n = ${v}: margin ±${fmt(moe(ph, v) * 100, 1)} points` });
  function draw(quiet) {
    const rows = [25, 50, 100, 200, n].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
    put(fig, plot({ x: [30, 95], y: [0, rows.length + 1], xLabel: 'estimated % preferring flow', yLabel: '', xStep: 10, yStep: 1, xDigits: 0, yDigits: 0, label: `Approximate 95% intervals for p̂ = 0.62 at several sample sizes.`,
      series: rows.map((v, i) => ({ points: [[(ph - moe(ph, v)) * 100, i + 1], [(ph + moe(ph, v)) * 100, i + 1]], cls: v === n ? 'ri-int is-on' : 'ri-int' })),
      marks: rows.map((v, i) => ({ x: ph * 100, y: i + 1, cls: v === n ? 'ri-mark--now' : 'ri-mark--p', r: 5, label: `n = ${v}` })) }).node);
    put(read, el('p', { class: 'ms-live-eq' }, `SE = √(0.62 × 0.38 / ${n}) = ${fmt(se(ph, n), 4)}`), el('p', { class: 'ms-live-eq' }, `ME ≈ 1.96 × SE = `, el('b', { class: 'ri-out' }, `±${fmt(moe(ph, n) * 100, 1)} points`)),
      el('p', null, `Interval: ${fmt((ph - moe(ph, n)) * 100, 1)}% to ${fmt((ph + moe(ph, n)) * 100, 1)}%`), el('p', { class: 'ls-small' }, 'Approximate, assuming a random sample and the normal approximation. Quadruple n to halve the margin.'));
    Pr.setData('moe', n, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sN.node, read));
}

// ------------------------------------------------------------ Biased vs random survey (Mission 3)
export function biasDemo(ctx) {
  const Pr = ctx.progress, POP = riders();
  let st = Pr.getData('bias', { seed: 1 });
  const read = readBox();
  function draw(quiet) {
    const r = rng(st.seed * 31 + 5), n = JUMP_LINE.size, A = sampleIndices(POP.length, n, r).reduce((s, i) => s + POP[i], 0) / n;
    let flowB = 0; for (let k = 0; k < n; k++) if (r() >= JUMP_LINE.technicalShare) flowB++;
    const B = flowB / n;
    put(read, tbl(['Survey', `Estimate (n = ${n})`, 'True value'], [['A: random from all registrants', pct(A, 0), '60%'], ['B: riders at the jump line', pct(B, 0), '60%']], 'Two surveys'),
      status(Math.abs(A - 0.6) < Math.abs(B - 0.6), 'Survey A is close; Survey B is far off: same size, but biased selection', 'This time the random sample was unlucky; run it again'),
      el('p', { class: 'ls-small' }, 'In this simulation, riders waiting at the jump line lean technical (75%), so Survey B underrepresents everyone else. A bigger convenience sample would still be biased.'));
    Pr.setData('bias', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab ms-lab--stack' }, button('Run both surveys again', () => { st.seed++; draw(false); }, 'ls-btn--quiet'), read);
}

// ------------------------------------------------------------ Treatment comparison (Mission 4)
export function experimentView() {
  const { A, B } = EXPERIMENT;
  return el('div', { class: 'ri-plots' },
    el('div', null, el('p', { class: 'ri-plot-h' }, `Method A: printed map (mean ${fmt(mean(A), 1)})`), dotPlot(A, 0, 12, 1, `Method A scores, mean ${mean(A)}.`, 'ri-pt--a', mean(A))),
    el('div', null, el('p', { class: 'ri-plot-h' }, `Method B: annotated video (mean ${fmt(mean(B), 1)})`), dotPlot(B, 0, 12, 1, `Method B scores, mean ${mean(B)}.`, 'ri-pt--b', mean(B))),
    el('p', { class: 'ls-small' }, `${SIM}: features correctly identified out of 12, 20 riders per group. Difference in means: ${fmt(mean(B) - mean(A), 1)}.`));
}

// ------------------------------------------------------------ Treatment shuffle simulator (Mission 4)
// The full 50,000-shuffle seeded test is computed once; running "more shuffles"
// reveals more of that same sequence, so the final p-value is the reference one.
export function shuffleSim(ctx) {
  const Pr = ctx.progress, T = testFor(EXPERIMENT), all = EXPERIMENT.A.concat(EXPERIMENT.B);
  let k = Pr.getData('shuffles', 0), example = null, once = 0;
  const fig = el('div', { class: 'ms-figure' }), read = readBox(), acts = el('div', { class: 'ls-actions' }), ex = el('div');
  function draw(quiet) {
    const shown = Array.from(T.diffs.subarray(0, k)), extreme = shown.filter(d => Math.abs(d) >= 2 - 1e-9).length;
    const h = histogram(shown, -3, 3, 0.1), top = Math.max(10, ...h.map(b => b.count));
    put(acts, button('Shuffle once', () => { const r = rng(9000 + ++once), a = all.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } example = a; draw(false); }, 'ls-btn--quiet'),
      [1000, 10000, 50000].map(n => button(k >= n ? `${n.toLocaleString('en-US')} ✓` : `Run to ${n.toLocaleString('en-US')}`, () => { k = Math.max(k, n); draw(false); }, 'ls-btn--primary', { disabled: k >= n ? true : null })));
    put(ex, example ? el('p', { class: 'ls-small ms-mono' }, `One shuffle: A = ${example.slice(0, 20).join(' ')} → mean ${fmt(mean(example.slice(0, 20)), 2)}; B = ${example.slice(20).join(' ')} → mean ${fmt(mean(example.slice(20)), 2)}; difference ${fmt(mean(example.slice(20)) - mean(example.slice(0, 20)), 2)}.`) : null);
    put(fig, k ? plot({ x: [-3, 3], y: [0, top * 1.1], xLabel: 'difference in means under shuffling (B − A)', yLabel: 'shuffles', xStep: 0.5, yStep: niceY(top), xDigits: 1, label: `${k} shuffles; ${extreme} at least as extreme as ±2.`,
      polygons: h.map(b => ({ points: [[b.from, 0], [b.from, b.count], [b.to, b.count], [b.to, 0]], cls: Math.abs((b.from + b.to) / 2) >= 2 ? 'ri-bar--miss' : 'ri-bar--hit' })),
      vlines: [{ x: 2, cls: 'ri-x-line', label: 'observed +2.0' }, { x: -2, cls: 'ri-x-line', label: '−2.0' }] }).node : el('p', { class: 'ls-small ri-wait' }, 'Run the shuffles to build the null distribution.'));
    put(read, k ? [el('p', { class: 'ms-live-eq' }, `${extreme.toLocaleString('en-US')} of ${k.toLocaleString('en-US')} shuffles had |difference| ≥ 2.0`), el('p', { class: 'ms-live-eq ri-eqn' }, 'p ≈ ', el('b', { class: 'ri-out' }, fmt(extreme / k, 4))),
      el('p', { class: 'ls-small' }, `Seeded (seed ${EXPERIMENT.seed}): the same ${EXPERIMENT.reps.toLocaleString('en-US')} shuffles every time, so the result is reproducible.`)] : null);
    Pr.setData('shuffles', k, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' },
    el('p', { class: 'ls-small' }, 'If the preview method made no difference, each rider would have scored the same in either group. So shuffle the 40 scores, split them 20/20, and see how big a gap chance alone produces.'), acts, ex, read));
}
const niceY = m => (m <= 20 ? 5 : m <= 100 ? 20 : m <= 500 ? 100 : m <= 2000 ? 500 : 1000);

// ------------------------------------------------------------ Podium counter (extension)
export function podiumCounter(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('podium', { n: PODIUM.n, r: PODIUM.r });
  const read = readBox();
  const sN = slider({ label: 'Riders available n', min: 3, max: 12, step: 1, value: st.n, onInput: v => { st.n = v; if (st.r > v) { st.r = v; sR.set(v); } draw(true); } });
  const sR = slider({ label: 'Chosen r', min: 1, max: 6, step: 1, value: st.r, onInput: v => { st.r = Math.min(v, st.n); draw(true); } });
  function draw(quiet) {
    const { n, r } = st, C = nCr(n, r), P = nPr(n, r);
    put(read, tbl(['', 'Count', 'One particular outcome'], [['Teams (order doesn’t matter): C(n, r)', C.toLocaleString('en-US'), `1/${C.toLocaleString('en-US')} ≈ ${fmt(1 / C, 4)}`], ['Podiums (order matters): P(n, r)', P.toLocaleString('en-US'), `1/${P.toLocaleString('en-US')} ≈ ${fmt(1 / P, 5)}`]], 'Counts'),
      el('p', { class: 'ms-live-eq' }, `P(n, r) = C(n, r) × r! = ${C} × ${factorial(r)} = ${P}`), el('p', { class: 'ls-small' }, 'A uniform selection model (every outcome equally likely), not a prediction of real results.'));
    Pr.setData('podium', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab ms-lab--stack' }, sN.node, sR.node, read);
}
