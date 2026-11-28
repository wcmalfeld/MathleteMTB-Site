// The Split Report: the race room (the mission board's hub: team identity,
// the director's briefing, the timing tower and a career spotlight) and the
// Race Intelligence Report (the printable analyst report and certificate).
// The report reuses the student's saved answers and written work; it never
// asks them to redo a calculation.

import { el, put, button, id as uid } from '../../lesson-kit/dom.js';
import { earnedBadges } from '../../dream-line-project/components/park.js';
import { summary } from '../../lesson-kit/stats.js';
import { tableEl } from '../../slope-lab/components/figures.js';
import { TEAM, DIRECTOR, LAPS, LAP_X, LAP_Y, GRID, RIDERS, CAREERS, DATA_NOTE, AFFILIATION_NOTE, MODEL_NOTE } from '../logic/data.js';
import { N, signed, eqText, MODEL, R_ALL, R_NINE, PRED, RES, OBJECTIVES } from '../logic/questions.js';
import { boxPlotSvg, scatterPlot } from './charts.js';
import { countTo } from './labs.js';
import { BRIEFING } from './forecast.js';

export const BRIEF_TEXT = 'Welcome to Northstar Gravity Racing. We’ve got an important race weekend coming up, and we need someone who can make sense of the numbers. The riders have been putting in practice laps. We’ve collected their sector times, and now we need to know who’s consistent, what patterns are emerging, and what we can reasonably predict for race day. You’re our new Race Intelligence Analyst. Your job is to find the story hidden in the data.';

export function timingTower(ctx) {
  const P = ctx.progress; let sort = P.getData('tower', 'time');
  const box = el('div', { class: 'spr-tower', 'aria-live': 'polite' }), cells = new Map();
  function draw() {
    const rows = LAPS.slice().sort((a, b) => sort === 'time' ? a.sectorTimeSeconds - b.sectorTimeSeconds : a.practiceLaps - b.practiceLaps);
    put(box, el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table spr-tower-t' }, el('caption', { class: 'ls-sr' }, 'Timing tower: final sector time and practice laps for ten fictional riders'),
      el('thead', null, el('tr', null, ['Pos', 'Bib', 'Rider', 'Practice laps', 'Sector time (s)', 'Gap'].map(h => el('th', { scope: 'col' }, h)))),
      el('tbody', null, rows.map((r, i) => { const t = cells.get(r.rider) || el('span', { class: 'spr-time', 'data-v': String(r.sectorTimeSeconds + 4) }); cells.set(r.rider, t);
        const lead = Math.min(...LAPS.map(x => x.sectorTimeSeconds));
        return el('tr', { class: i === 0 && sort === 'time' ? 'is-lead' : '' }, el('td', { class: 'ms-mono' }, String(i + 1).padStart(2, '0')), el('td', { class: 'ms-mono' }, '#' + r.bib), el('td', null, r.rider), el('td', { class: 'ms-mono' }, String(r.practiceLaps)), el('td', { class: 'ms-mono' }, t), el('td', { class: 'ms-mono' }, r.sectorTimeSeconds === lead ? '—' : '+' + (r.sectorTimeSeconds - lead).toFixed(2))); })))));
    rows.forEach(r => countTo(cells.get(r.rider), r.sectorTimeSeconds));
    P.setData('tower', sort, true);
  }
  draw();
  return el('div', null, el('div', { class: 'ls-actions' }, button('Sort by time', () => { sort = 'time'; draw(); }, 'ls-btn--quiet'), button('Sort by practice laps', () => { sort = 'laps'; draw(); }, 'ls-btn--quiet')), box);
}

export function raceRoom(ctx, missions) {
  const P = ctx.progress, got = earnedBadges(P, missions); let k = P.getData('career', 0) || 0;
  const career = el('div', { 'aria-live': 'polite' });
  const drawCareer = () => { const C = CAREERS[k % CAREERS.length]; put(career, el('p', { class: 'spr-career-k' }, `Career spotlight ${k % CAREERS.length + 1} of ${CAREERS.length}`), el('p', { class: 'spr-career-n' }, C.name), el('p', null, C.does), el('p', { class: 'ls-small' }, el('b', null, 'Math: '), C.math)); P.setData('career', k, true); };
  drawCareer();
  return el('section', { class: 'spr-room', 'aria-label': 'The race room' },
    el('div', { class: 'spr-room-top' },
      el('div', null, el('p', { class: 'spr-team' }, TEAM.toUpperCase()), el('p', { class: 'ls-kicker' }, 'Performance department · race room'),
        el('ul', { class: 'spr-badges' }, missions.map(m => el('li', { class: got.has(m.id) ? 'is-earned' : '' }, el('span', { class: 'spr-badge-n' }, String(m.n).padStart(2, '0')), el('span', null, m.short), el('span', { class: 'spr-badge-b' }, got.has(m.id) ? '★ ' + m.badge : '☆ ' + m.badge))))),
      el('aside', { class: 'spr-brief' }, el('p', { class: 'spr-brief-h' }, DIRECTOR.toUpperCase() + ' · BRIEFING'), el('p', null, BRIEF_TEXT))),
    el('p', { class: 'ls-kicker' }, 'Timing tower · Sector 2 final times'), timingTower(ctx),
    el('div', { class: 'spr-career' }, career, button('Next career', () => { k += 1; drawCareer(); }, 'ls-btn--quiet')),
    el('p', { class: 'ls-small' }, DATA_NOTE), el('p', { class: 'ls-small' }, AFFILIATION_NOTE));
}

// ------------------------------------------------------------ the Race Intelligence Report (extension)
const WRITTEN_IN_REPORT = [['audit-rec', 'Consistency recommendation'], ['scan-desc', 'Scatter plot description'], ['headline', 'Responsible headline']];
export function analystReport(ctx, missions, cert) {
  const P = ctx.progress, got = earnedBadges(P, missions), nid = uid('an');
  const name = el('input', { class: 'ls-input', id: nid, maxlength: 60, value: P.getData('analyst', '') || '', placeholder: 'Your name' });
  const who = el('span', null, (P.getData('analyst', '') || 'Race Intelligence Analyst'));
  name.addEventListener('input', () => { who.textContent = name.value.trim() || 'Race Intelligence Analyst'; });
  name.addEventListener('change', () => P.setData('analyst', name.value.trim(), true));
  const SA = summary(RIDERS[0].times), SB = summary(RIDERS[1].times);
  const sec = (id, t, body) => el('section', { class: 'spr-rep-sec' + (got.has(id) ? '' : ' is-locked') }, el('p', { class: 'spr-rep-t' }, t), got.has(id) ? body : el('p', { class: 'ls-small' }, 'Complete this mission to add it to the report.'));
  const wr = id => (P.written(id) || '').trim();
  const brief = BRIEFING.map(([id, prompt]) => [prompt, wr(id)]).filter(([, t]) => t);
  const done = cert && cert.at ? new Date(cert.at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  return el('div', { class: 'spr-report' },
    el('div', { class: 'spr-rep-head' }, el('p', { class: 'spr-team' }, TEAM.toUpperCase()), el('p', { class: 'spr-rep-h' }, 'RACE INTELLIGENCE REPORT'), el('p', { class: 'ls-small' }, 'Prepared by ', who, ` for ${DIRECTOR}.`)),
    el('div', { class: 'ls-field spr-noprint' }, el('label', { for: nid }, 'Analyst name (saved on this device only)'), name),
    el('div', { class: 'spr-rep-grid' },
      sec('audit', 'Consistency comparison', el('div', null, tableEl([['Mean', N(SA.mean), N(SB.mean)], ['Median', N(SA.median), N(SB.median)], ['Range', N(SA.range), N(SB.range)], ['IQR', N(SA.iqr), N(SB.iqr)]], ['Seconds', 'Rider A', 'Rider B']),
        el('div', { class: 'ms-figure' }, boxPlotSvg(RIDERS.map(r => ({ label: r.label, times: r.times, cls: 'is-' + r.id })))),
        el('p', null, `Rider A is more consistent (IQR ${N(SA.iqr)} s vs ${N(SB.iqr)} s). Rider B has the lower median (${N(SB.median)} s) but the higher mean (${N(SB.mean)} s), because of a few much slower runs.`))),
      sec('scan', 'Scatter plot', el('div', null, el('div', { class: 'ms-figure' }, scatterPlot({ set: { x: LAP_X, y: LAP_Y, xLabel: 'Number of practice laps' }, x: GRID.x, y: GRID.y, xStep: 1, yStep: 2, flag: 7 }).node),
        el('p', null, 'A negative, roughly linear association, with one unusual point, Rider 8 at (8, 75), flagged for investigation.'))),
      sec('signal', 'Correlation', el('div', null, tableEl([['All ten riders', N(R_ALL, 2)], ['Without Rider 8 (experiment)', N(R_NINE, 2)]], ['Dataset', 'r']),
        el('p', null, 'A fairly strong negative linear relationship. It’s an association in observational data, not proof that practice laps cause faster times.'))),
      sec('forecast', 'Regression, prediction and residual', el('div', null, el('div', { class: 'ms-figure' }, scatterPlot({ set: { x: LAP_X, y: LAP_Y, xLabel: 'Number of practice laps' }, x: GRID.x, y: GRID.y, xStep: 1, yStep: 2, line: MODEL, residuals: MODEL, highlight: 5 }).node),
        el('p', { class: 'ms-live-eq' }, eqText(MODEL)), el('p', null, `Slope −1.4: about 1.4 s lower predicted time per extra lap, on average, in this sample. Six laps: predicted ${N(PRED(6))} s, actual 67 s, residual ${signed(RES(5))} s. Rider 8’s residual, ${signed(RES(7))} s, deserves a closer look; predictions beyond 1 to 10 laps are extrapolations.`)))),
    el('p', { class: 'spr-rep-t' }, 'Analyst’s conclusions'),
    brief.length || WRITTEN_IN_REPORT.some(([id]) => wr(id)) ? el('div', null, WRITTEN_IN_REPORT.filter(([id]) => wr(id)).map(([id, t]) => el('p', null, el('b', null, t + ': '), wr(id))),
      brief.length ? el('ol', { class: 'spr-rep-brief' }, brief.map(([p, t]) => el('li', null, el('b', null, p + ' '), t))) : null)
      : el('p', { class: 'ls-small' }, 'Your written answers and race briefing will appear here as you complete them.'),
    el('div', { class: 'spr-cert' + (cert ? ' is-on' : '') }, el('p', { class: 'spr-cert-h' }, cert ? 'CERTIFIED RACE INTELLIGENCE ANALYST' : 'Certification not yet passed'),
      el('p', null, el('b', null, 'Analyst: '), who), el('p', null, el('b', null, 'Module: '), 'The Split Report: MTB Race Intelligence Lab (Algebra 1, Data and Statistics)'),
      done ? el('p', null, el('b', null, 'Completed: '), done) : null, cert ? el('p', null, el('b', null, 'Certification score: '), `${cert.right} of ${cert.total}`) : null,
      el('ul', { class: 'spr-badges' }, missions.map(m => el('li', { class: got.has(m.id) ? 'is-earned' : '' }, (got.has(m.id) ? '★ ' : '☆ ') + m.badge)))),
    el('div', { class: 'ls-actions spr-noprint' }, button('Print or save as PDF', () => window.print(), 'ls-btn--primary')),
    el('p', { class: 'ls-small' }, DATA_NOTE), el('p', { class: 'ls-small' }, MODEL_NOTE));
}
export { OBJECTIVES };
