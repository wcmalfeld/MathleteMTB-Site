// Map the Line: the MTB Ride Data Lab (Mathlete MTB, Algebra 1, Unit 3:
// Linear Relationships). This is the Slope & Linear Relationships Lab,
// extended to all six Unit 3 topics: same address, same tracking id
// ("slope-lab"), same question ids for the original bank, so links,
// students' progress and rewards carry on.
//
//   import { mount } from './map-the-line.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb, onAttempt, onProgress, onComplete })
// Events also fire on the element: mapline:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell, and shares the Algebra 1
// workbench, prediction-first steps, tutor panel and report with The Dream
// Line labs. Works with no options and no account, and without any AI service.

import { el, put } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { createProgress } from '../lesson-kit/progress.js';
import { plot } from '../lesson-kit/plot.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, FINAL_SETS, finalQuestions, finalSet, questionKinds, IDEAS, REPORT_IDEAS, OBJECTIVES, MISCONCEPTIONS,
  SCOUT_PRACTICE, SCOUT_PRACTICE_IDS, scoutPractice, SLOPE_PRACTICE, SLOPE_PRACTICE_IDS, slopePractice, LIN_PRACTICE, LIN_PRACTICE_IDS, linPractice, PROP_PRACTICE, PROP_PRACTICE_IDS, propPractice, pointText, rowsText } from './logic/questions.js';
import { WORKBENCH } from './logic/workbench.js';
import { DATA_NOTE, GRADE_NOTE, MAP, RIDERS, SPEED_TABLE, PATTERN_A, PUMP_TABLE } from './logic/data.js';
import { slope, grade, lineOf, proportional, S } from './logic/linear.js';
import { figure, gridSvg, tableEl } from './components/figures.js';
import { plotPoints, mapExplorer, routeLink, riseRunViz, profileDesigner, rideDashboard, propCompare, diffTable, readProfile } from './components/labs.js';
import { legacyBank, LEGACY, LEGACY_IDEAS } from './components/legacy.js';
import { openingArt } from './components/visuals.js';
import { earnedBadges } from '../dream-line-project/components/park.js';
import { workbench, predict, writtenResponse, tutorOf, afterRender } from '../dream-line-project/components/labs.js';
import { tutorPanel as sharedTutorPanel, reportBlocks } from '../dream-line-project/components/shared.js';

export const VERSION = '2.0.0';
export const ID = 'slope-lab';
const REFS = [
  ['Common Core: Grade 5 Geometry, graph points on the coordinate plane (5.G.A)', 'https://www.thecorestandards.org/Math/Content/5/G/'],
  ['Common Core: Grade 7 Ratios and Proportional Relationships (7.RP.A.2)', 'https://www.thecorestandards.org/Math/Content/7/RP/'],
  ['Common Core: Grade 8 Expressions and Equations, slope and proportional relationships (8.EE.B)', 'https://www.thecorestandards.org/Math/Content/8/EE/'],
  ['Common Core: Interpreting Functions, rate of change (HSF-IF.B.6)', 'https://www.thecorestandards.org/Math/Content/HSF/IF/'],
  ['OpenStax Elementary Algebra 2e: Understand slope of a line', 'https://openstax.org/books/elementary-algebra-2e/pages/4-4-understand-slope-of-a-line']
];

let MISSION_LIST = [];
const act = (ctx, id, kicker, title, ...kids) => { const c = ctx.card(kicker, title, ...kids); c.id = id; return c; };
// Any question: the kit's ask() with its figure, or a lab plot question.
function Q(ctx, id, o = {}) {
  const def = o.def || QUESTIONS[id];
  if (def.type === 'plot') return plotPoints(ctx, id, def, o);
  return ctx.q(id, o);
}
const Qs = (ctx, ids, o) => ids.map(id => Q(ctx, id, o));
function badgeNote(ctx, mid) {
  return ctx.live(() => {
    const m = MISSION_LIST.find(x => x.id === mid), got = earnedBadges(ctx.progress, MISSION_LIST).has(mid);
    return el('div', { class: 'dl-badge-card' + (got ? ' is-earned' : '') }, el('span', { class: 'dl-badge-mark', 'aria-hidden': 'true' }, got ? '★' : '☆'),
      el('p', null, got ? el('b', null, `${m.badge.toUpperCase()} badge earned.`) : el('span', null, 'Finish every question in this stage (including the independent challenge) to earn the ', el('b', null, m.badge.toUpperCase()), ' badge.')));
  });
}
const WB = k => WORKBENCH[k];
const done = (P, ids) => ids.every(id => P.done(id));

// ================================================================ Stage 01: Scout the Mountain
function scoutPage(ctx) {
  const { note, sim, para: Pa, h3, practiceBox } = ctx;
  const out = [
    act(ctx, 'mt-s-1', 'Activity 1', 'Explore the coordinate system', workbench(ctx, WB('plane')),
      Pa('You’ve received a topographic map of a new mountain bike destination. A grid turns it into a coordinate plane: the x-axis runs across, the y-axis up, and they cross at the origin, the main trailhead.'),
      note('key', 'illustrative coordinates', 'These are map grid coordinates, not real GPS coordinates.'),
      sim('The mountain map', mapExplorer(ctx)), Qs(ctx, ['sc-origin', 'sc-jump', 'sc-overlook', 'sc-pump', 'sc-workshop'])),
    act(ctx, 'mt-s-2', 'Activity 2', 'The four quadrant challenge',
      tableEl([['I', 'positive', 'positive'], ['II', 'negative', 'positive'], ['III', 'negative', 'negative'], ['IV', 'positive', 'negative']], ['Quadrant', 'x', 'y']),
      Qs(ctx, ['sc-lr', 'sc-ud', 'sc-q']), ctx.live(() => (done(ctx.progress, ['sc-q']) ? el('div', { class: 'ms-figure mt-fig' }, gridSvg({ ...MAP, map: true, quadrants: true, points: [{ x: -3, y: 4, label: '(−3, 4)', cls: 'is-on mt-drop' }], label: 'The point (−3, 4) on the map, in Quadrant II' })) : null)),
      note('key', 'points on an axis', 'A point with x = 0 or y = 0 lies on an axis and isn’t in any quadrant.'), Q(ctx, 'sc-wash'), Q(ctx, 'sc-read')),
    act(ctx, 'mt-s-3', 'Activity 3', 'GPS coordinate finder', Pa('Read each location as (x, y): across first, then up or down.'), Qs(ctx, ['sc-gps-berm', 'sc-gps-view', 'sc-gps-finish'])),
    act(ctx, 'mt-s-4', 'Activity 4', 'Different map scales', workbench(ctx, WB('scales')),
      Pa('On this map one horizontal grid interval is 20 m but one vertical interval is only 5 m. Read each axis by its own scale.'), Qs(ctx, ['sc-scale', 'sc-scale-2'])),
    act(ctx, 'mt-s-5', 'Activity 5', 'Scout the mountain challenge', Qs(ctx, ['sc-place', 'sc-place-q'])),
    act(ctx, 'mt-s-6', 'Independent challenge', 'More waypoints', practiceBox()),
    badgeNote(ctx, 'scout')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 02: Plot Your Line
function plotPage(ctx) {
  const { note, sim, para: Pa, h3, live } = ctx, P = ctx.progress;
  const out = [
    act(ctx, 'mt-p-1', 'Activity 1', 'From GPS readings to a map', workbench(ctx, WB('plot')), Pa('You’ve collected GPS readings from a fictional ride. Plot each landmark; once they’re right, the features appear.'), Q(ctx, 'pl-route')),
    act(ctx, 'mt-p-2', 'Activity 2', 'Build the elevation profile', note('key', 'a fictional trail profile', 'This is a fictional educational trail profile, not a measured trail.'),
      tableEl([[0, 1200], [100, 1205], [200, 1210], [300, 1215], [400, 1215], [500, 1210], [600, 1205]], ['Horizontal distance (m)', 'Elevation (m)']), Q(ctx, 'pl-profile'),
      live(() => (P.done('pl-profile') ? el('ul', { class: 'mt-sections' }, el('li', { class: 'is-up' }, 'Climb: 0 to 300 m'), el('li', { class: 'is-flat' }, 'Flat: 300 to 400 m'), el('li', { class: 'is-down' }, 'Descent: 400 to 600 m')) : null)),
      sim('The same route, two views: map and profile', routeLink(ctx))),
    act(ctx, 'mt-p-3', 'Activity 3', 'Read the graph', sim('The completed profile', readProfile(ctx)), Qs(ctx, ['pl-r200', 'pl-peak', 'pl-flat', 'pl-desc', 'pl-finish'])),
    act(ctx, 'mt-p-4', 'Activity 4', 'Describe the pattern', Pa('What do you notice about how the elevation changes? (You’ll measure it properly in the next stages.)'), Qs(ctx, ['pl-pat-a', 'pl-pat-b'])),
    act(ctx, 'mt-p-5', 'Activity 5', 'Reconstruct the missing waypoint', Q(ctx, 'pl-miss')),
    badgeNote(ctx, 'plot')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 03: Measure the Grade
function gradePage(ctx) {
  const { note, sim, para: Pa, h3, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'mt-g-1', 'Activity 1', 'What is slope?', workbench(ctx, WB('slope')),
      note('key', 'slope', 'Slope tells us how much one quantity changes for each unit of change in another quantity.'),
      eq('m = (y₂ − y₁) / (x₂ − x₁)', [['y₂ − y₁', 'change in y: the rise (elevation)'], ['x₂ − x₁', 'change in x: the run (horizontal distance)']])),
    act(ctx, 'mt-g-2', 'Activity 2', 'Calculate an uphill grade', workbench(ctx, WB('grade')), Qs(ctx, ['gr-rr', 'gr-m', 'gr-pct', 'gr-mean'])),
    act(ctx, 'mt-g-3', 'Activity 3', 'Calculate a downhill grade', Qs(ctx, ['gr-down', 'gr-down-steep'])),
    act(ctx, 'mt-g-4', 'Activity 4', 'The rise over run visualizer',
      predict(ctx, 'double-run', { prompt: 'A section rises 10 m over 200 m. If the rise stays 10 m but the horizontal distance doubles to 400 m, what happens to the slope?', options: [{ id: 'half', text: 'It halves', right: true }, { id: 'double', text: 'It doubles', right: false }, { id: 'same', text: 'It stays the same', right: false }],
        reveal: () => [el('p', { class: 'ms-live-eq' }, '10 ÷ 200 = 0.05 (5%)  →  10 ÷ 400 = 0.025 (2.5%)'), el('p', null, 'The same rise spread over twice the run is half as steep.'), sim('Rise over run visualizer', riseRunViz(ctx))] })),
    act(ctx, 'mt-g-5', 'Activity 5', 'Slope from different representations', Qs(ctx, ['gr-two', 'gr-table', 'gr-graph', 'gr-words'])),
    act(ctx, 'mt-g-6', 'Activity 6', 'Real-world grade challenge', note('myth', 'classroom calculations', GRADE_NOTE), Qs(ctx, ['gr-conn', 'gr-short', 'gr-run-length'])),
    act(ctx, 'mt-g-7', 'Independent challenge', 'More sections', practiceBox()),
    act(ctx, 'mt-g-8', 'More practice (optional)', 'The original Slope Lab practice bank', Pa('The Slope Lab’s 24 practice questions, at three levels. Optional: they don’t affect the badge, and they’re saved with your earlier answers.'), legacyBank(ctx, 'practice')),
    badgeNote(ctx, 'grade')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 04: Read the Terrain
function terrainPage(ctx) {
  const { note, sim, para: Pa, h3 } = ctx;
  const out = [
    act(ctx, 'mt-t-1', 'Activity 1', 'Positive slope', workbench(ctx, WB('signs')), Pa('When elevation increases as horizontal distance increases, the slope is positive: a climbing fire road.'), Qs(ctx, ['tr-pos', 'tr-pos-m'])),
    act(ctx, 'mt-t-2', 'Activity 2', 'Negative slope', Pa('When elevation decreases as distance increases, the slope is negative: a descent.'), Qs(ctx, ['tr-neg', 'tr-neg-m'])),
    act(ctx, 'mt-t-3', 'Activity 3', 'Zero slope', Pa('A level trail segment: no change in elevation.'), Qs(ctx, ['tr-zero', 'tr-zero-m'])),
    act(ctx, 'mt-t-4', 'Activity 4', 'Undefined slope', note('myth', 'maths, not a trail', 'An undefined slope describes a vertical line on a graph. It isn’t a rideable vertical trail.'), Qs(ctx, ['tr-und', 'tr-und-real'])),
    act(ctx, 'mt-t-5', 'Activity 5', 'Classify the trail', Pa('Direction decides the sign; steepness is the size. Classify each profile.'), Qs(ctx, ['tr-c1', 'tr-c2', 'tr-c3', 'tr-c4', 'tr-neg-elev', 'tr-same-down'])),
    act(ctx, 'mt-t-6', 'Activity 6', 'Can you explain it?', writtenResponse(ctx, 'explain-negative', { prompt: 'Why does the elevation profile of a descending trail have a negative slope when distance increases from left to right?', sample: 'As the horizontal distance increases, the elevation decreases, so the rise (the change in elevation) is negative while the run is positive. A negative divided by a positive is negative, so the slope is negative. The elevations themselves can still be positive.' })),
    badgeNote(ctx, 'terrain')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 05: Analyze Rider Data
function dataPage(ctx) {
  const { note, sim, para: Pa, h3, eq, live, practiceBox } = ctx, P = ctx.progress;
  const out = [
    act(ctx, 'mt-d-1', 'Activity 1', 'What makes a relationship linear?', workbench(ctx, WB('linear')), Pa('A simplified fire-road climb: the rider starts at 1,200 m and gains 5 m for every 100 m of horizontal distance.'), Q(ctx, 'ld-plus')),
    act(ctx, 'mt-d-2', 'Activity 2', 'Find the constant rate of change', live(() => (P.done('ld-plus') ? diffTable(PATTERN_A, ['Distance (m)', 'Elevation (m)']) : null)), Qs(ctx, ['ld-m', 'ld-eq'])),
    act(ctx, 'mt-d-3', 'Activity 3', 'Linear or not linear?', note('key', 'equal spacing', 'Check first differences only when the x-values are equally spaced. For unequal x-intervals, compare the rate of change between points.'), Qs(ctx, ['ld-a', 'ld-b', 'ld-c', 'ld-d', 'ld-uneven'])),
    act(ctx, 'mt-d-4', 'Activity 4', 'Connect words, tables, graphs and equations', workbench(ctx, WB('reps')),
      Pa('Words: a rider travels 240 m every minute at a constant speed, starting at zero distance.'), tableEl(SPEED_TABLE.slice(0, 4), ['Time (min)', 'Distance (m)']),
      Qs(ctx, ['ld-match-eq', 'ld-match-graph']), h3('Now the other way round'), Qs(ctx, ['ld-g2t', 'ld-t2e', 'ld-e2w'])),
    act(ctx, 'mt-d-5', 'Activity 5', 'The trail profile designer', Pa('Build a fictional trail profile. Does it have a constant rate of change? Change one section and watch.'), sim('Trail profile designer', profileDesigner(ctx))),
    act(ctx, 'mt-d-6', 'Independent challenge', 'More ride data', practiceBox()),
    act(ctx, 'mt-d-7', 'Transfer challenge (optional)', 'Slope without bikes', Pa('The original Slope Lab’s transfer challenge: the same ideas with phone plans, tables and graphs.'), legacyBank(ctx, 'transfer')),
    badgeNote(ctx, 'data')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 06: Find Your Flow
function flowPage(ctx) {
  const { note, sim, para: Pa, h3, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'mt-f-1', 'Activity 1', 'The constant pace challenge', workbench(ctx, WB('prop')), sim('Ride data dashboard', rideDashboard(ctx)), Q(ctx, 'pf-eq')),
    act(ctx, 'mt-f-2', 'Activity 2', 'Find the constant of proportionality', eq('y = kx,   k = y / x'), Qs(ctx, ['pf-k', 'pf-units', 'pf-verify'])),
    act(ctx, 'mt-f-3', 'Activity 3', 'Does it pass through the origin?', Q(ctx, 'pf-origin')),
    act(ctx, 'mt-f-4', 'Activity 4', 'Linear vs proportional', sim('Two relationships', propCompare()), Qs(ctx, ['pf-vs', 'pf-all']),
      note('key', 'the big idea', 'All proportional relationships are linear, but not all linear relationships are proportional.')),
    act(ctx, 'mt-f-5', 'Activity 5', 'Write your own proportional equation', Qs(ctx, ['pf-180', 'pf-180-vals', 'pf-table-k', 'pf-table-eq'])),
    act(ctx, 'mt-f-6', 'Activity 6', 'The flow challenge', tableEl(['A', 'B', 'C'].flatMap(r => RIDERS[r].map(([t, d]) => ['Rider ' + r, t, d])).map(([r, t, d]) => [r, `${t} min → ${d} m`]), ['Rider', 'Time → distance']),
      el('p', { class: 'ls-small' }, 'Fictional, controlled data, not real rider performance records.'), Qs(ctx, ['pf-prop', 'pf-speeds', 'pf-fast'])),
    act(ctx, 'mt-f-7', 'Independent challenge', 'More ride data', practiceBox()),
    badgeNote(ctx, 'flow')
  ];
  afterRender(); return out;
}

// ================================================================ the Ride Data Report
function rideReport(ctx) {
  const P = ctx.progress, r = (P.getData('certified', null) || {}).round || P.getData('finalRound', 1), X = finalSet(r), key = 'r' + r;
  const did = ids => ids.every(id => P.done(id, key));
  const sl = (a, b) => slope(a, b), tri = [['Climb', X.pos], ['Descent', X.neg], ['Flat', X.zero]];
  const kSpeed = proportional(X.sets.speed).k;
  const desc = el('textarea', { class: 'ls-textarea', id: 'mt-interp', rows: 4, placeholder: 'What does the data say about this trail network and its riders?' });
  desc.value = P.written('ride-report'); desc.addEventListener('change', () => P.write('ride-report', desc.value));
  const ys = X.profile.map(p => p[1]);
  return el('div', { class: 'mt-report' },
    el('p', { class: 'ls-small' }, did(FINAL_IDS) ? `From your Ultimate Ride Analysis Challenge (round ${r}).` : `The ${X.name} network. Complete the Ultimate Ride Analysis Challenge and this report fills in from your work.`),
    el('div', { class: 'mt-two' },
      el('figure', { class: 'ms-figure' }, el('figcaption', { class: 'ls-kicker' }, 'Park map with plotted waypoints'), gridSvg({ ...MAP, map: true, points: X.map.map(p => ({ ...p, label: p.name, cls: did(['fa-map']) ? 'is-ok' : 'is-feature' })), label: X.name + ' waypoints' })),
      el('div', null, el('p', { class: 'ls-kicker' }, 'Ordered-pair table'), tableEl(X.map.map(p => [p.name, pointText(p)]), ['Waypoint', '(x, y)']))),
    el('figure', { class: 'ms-figure' }, el('figcaption', { class: 'ls-kicker' }, 'Elevation profile'), plot({ x: [0, X.profile[X.profile.length - 1][0]], y: [Math.min(...ys) - 10, Math.max(...ys) + 10], xDigits: 0, xLabel: 'Horizontal distance (m)', yLabel: 'Elevation (m)', label: 'Elevation profile ' + rowsText(X.profile),
      series: [{ points: X.profile, cls: 'mt-prof-line' }], marks: X.profile.map(p => ({ x: p[0], y: p[1], cls: 'mt-prof-pt', r: 5 })) }).node),
    el('p', { class: 'ls-kicker' }, 'Calculated trail slopes'),
    el('ul', { class: 'gp-checks mt-checks' }, tri.map(([n, [a, b]]) => { const s = sl(a, b); return el('li', { class: did(['fc-pos', 'fc-neg', 'fc-zero']) ? 'is-ok' : '' }, `${n}: ${pointText(a)} → ${pointText(b)}, m = ${S(s.value)} (${S(grade(s.value))}%)`); }),
      el('li', { class: did(['fc-und']) ? 'is-ok' : '' }, `Vertical example ${pointText(X.vertical[0])} → ${pointText(X.vertical[1])}: undefined (run 0).`)),
    el('p', { class: 'ls-kicker' }, 'Linear relationships'),
    el('ul', { class: 'mt-checks' }, el('li', { class: did(['fd-eq']) ? 'is-ok' : '' }, `The climb: y = ${S(X.line.b)} + ${S(X.line.m)}x. Start ${S(X.line.b)} m; rate ${S(X.line.m)} m per meter (slope); intercept ${S(X.line.b)} m.`),
      el('li', null, `Constant-speed rider: proportional, k = ${S(kSpeed)} m/min. Constant-grade elevation: linear, not proportional. Pump-track data: not linear.`)),
    el('div', { class: 'ls-field ls-field--wide dl-desc' }, el('label', { for: 'mt-interp' }, 'Final interpretation (saved for your tutor)'), desc),
    el('p', { class: 'ls-small' }, DATA_NOTE));
}

// ================================================================ config
const SECTIONS = {
  scout: [['mt-s-1', 'Explore the coordinate system'], ['mt-s-2', 'Four quadrant challenge'], ['mt-s-3', 'GPS coordinate finder'], ['mt-s-4', 'Different map scales'], ['mt-s-5', 'Scout challenge'], ['mt-s-6', 'More waypoints']],
  plot: [['mt-p-1', 'GPS readings to a map'], ['mt-p-2', 'Build the elevation profile'], ['mt-p-3', 'Read the graph'], ['mt-p-4', 'Describe the pattern'], ['mt-p-5', 'Missing waypoint']],
  grade: [['mt-g-1', 'What is slope?'], ['mt-g-2', 'Uphill grade'], ['mt-g-3', 'Downhill grade'], ['mt-g-4', 'Rise over run visualizer'], ['mt-g-5', 'Different representations'], ['mt-g-6', 'Real-world grade'], ['mt-g-7', 'More sections'], ['mt-g-8', 'Original practice bank']],
  terrain: [['mt-t-1', 'Positive'], ['mt-t-2', 'Negative'], ['mt-t-3', 'Zero'], ['mt-t-4', 'Undefined'], ['mt-t-5', 'Classify the trail'], ['mt-t-6', 'Explain it']],
  data: [['mt-d-1', 'What makes it linear?'], ['mt-d-2', 'Constant rate of change'], ['mt-d-3', 'Linear or not?'], ['mt-d-4', 'Words, tables, graphs, equations'], ['mt-d-5', 'Trail profile designer'], ['mt-d-6', 'More ride data'], ['mt-d-7', 'Transfer challenge']],
  flow: [['mt-f-1', 'Constant pace'], ['mt-f-2', 'Constant of proportionality'], ['mt-f-3', 'Through the origin?'], ['mt-f-4', 'Linear vs proportional'], ['mt-f-5', 'Write your own'], ['mt-f-6', 'Flow challenge'], ['mt-f-7', 'More ride data']]
};
const WRITTEN = { 'explain-negative': 'Why a descent has negative slope', 'ride-report': 'Ride report interpretation' };
const ALL_QUESTIONS = { ...QUESTIONS, ...Object.fromEntries(LEGACY.map(q => [q.key, { prompt: q.prompt, ideas: LEGACY_IDEAS[q.objective] }])) };
const KINDS = questionKinds();
export const questionKindsAll = () => KINDS;
const HOOKS = {
  scout: 'You’re a professional trail mapper with a topographic map of a new destination. Find every feature and learn how the coordinate grid organizes the mountain.',
  plot: 'You’ve collected GPS and elevation readings from a fictional ride. Plot the data and rebuild the route’s elevation profile.',
  grade: 'You’re the technical trail analyst: measure how steep each section is, and how much the elevation changes for every unit across.',
  terrain: 'Inspect trail profiles and classify each line: climbing, descending, flat, or a vertical line that no trail could be.',
  data: 'You’ve got telemetry from several riding sessions. Is the rate of change constant, and what relationship does the data show?',
  flow: 'Steady pace, constant ratio: discover how distance grows with time, and how proportional differs from linear.'
};
const PAGES = { scout: scoutPage, plot: plotPage, grade: gradePage, terrain: terrainPage, data: dataPage, flow: flowPage };
const practiceFor = {
  scout: { ids: SCOUT_PRACTICE_IDS, count: SCOUT_PRACTICE.length, questions: n => withFigs(scoutPractice(n)), button: 'New waypoint', note: 'Some sit on an axis.', kicker: 'Independent challenge' },
  grade: { ids: SLOPE_PRACTICE_IDS, count: SLOPE_PRACTICE.length, questions: n => withFigs(slopePractice(n)), button: 'New section', note: 'Climbs, descents and flats.', kicker: 'Independent challenge' },
  data: { ids: LIN_PRACTICE_IDS, count: LIN_PRACTICE.length, questions: n => withFigs(linPractice(n)), button: 'New dataset', note: 'Some aren’t linear.', kicker: 'Independent challenge' },
  flow: { ids: PROP_PRACTICE_IDS, count: PROP_PRACTICE.length, questions: n => withFigs(propPractice(n)), button: 'New dataset', note: 'Proportional, linear or neither.', kicker: 'Independent challenge' }
};
// Practice questions with figures: the figure goes into the prompt slot via a wrapper element.
function withFigs(set) { for (const v of Object.values(set)) if (v && v.fig && !v.figure) v.figure = () => figure(v.fig); return set; }
withFigs(QUESTIONS);

export const LAB = {
  id: ID, title: 'Map the Line', eventPrefix: 'mapline', rootClass: 'mtl dlp', noun: 'lab',
  questions: ALL_QUESTIONS, kinds: KINDS, ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 1 · Unit 3: Linear Relationships',
    lines: ['Map the'], accent: 'Line',
    lede: 'Read the terrain. Plot the ride. Understand the data.',
    body: 'Every great mountain bike ride tells a story. A trail map shows where you’re going. An elevation profile reveals the climbs and descents. Speed and distance data tell you how you’re riding. You’ve been hired as a mountain bike ride analyst: map a new riding network, investigate its terrain and understand what the data reveals. Grab your map, fire up the GPS and let’s find the line.',
    enter: 'Start exploring →', back: 'Back to the map →',
    meta: 'The MTB Ride Data Lab · 40–55 minutes · six stages and the Ultimate Ride Analysis Challenge · progress saves on this device',
    art: () => openingArt()
  },
  board: { title: 'The ride data lab', hook: 'Six stages, from scouting the map to finding your flow. Each earns a badge; all six unlock the Ultimate Ride Analysis Challenge.',
    extra: ctx => sharedTutorPanel(ctx, { missions: MISSION_LIST, sections: SECTIONS, written: WRITTEN, questions: ALL_QUESTIONS }), refsNote: DATA_NOTE + ' ' + GRADE_NOTE, refs: REFS },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], ...(practiceFor[m.id] ? { practice: practiceFor[m.id] } : {}) })),
  extension: { kicker: 'Your report', title: 'The Ride Data Report', blurb: 'Your mapped network, profile, slopes, linear and proportional relationships, and your interpretation.', hook: 'Everything you mapped, plotted and calculated, in one report.', page: ctx => [ctx.card(null, null, rideReport(ctx))] },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: r => withFigs(finalQuestions(r)),
    title: 'The Ultimate Ride Analysis Challenge', blurb: 'Map a new network, plot its profile, calculate its slopes, and classify its data.',
    hook: 'You’ve been commissioned to map and analyze a new MTB trail network. Five tasks; then your Ride Data Report fills in.',
    lockedHook: 'Earn all six stage badges to unlock the Ultimate Ride Analysis Challenge.',
    doneShort: 'Certified ride analyst', doneTitle: 'Certified ride analyst',
    doneLede: 'You mapped a network on the coordinate plane, plotted its elevation profile, measured its slopes, and told linear, proportional and nonlinear data apart.',
    notYet: x => `${x.right} of ${x.total} right this round (the pass mark is ${PASS_MARK}). Look back at the solutions, then try a fresh network.`,
    page: (ctx, F, key) => { const { card } = ctx, A = id => Q(ctx, id, { def: F[id], key, kicker: 'Ride analysis' }); return [
      card('Task 1', 'Map the trail network', A('fa-map'), A('fa-quad')),
      card('Task 2', 'Create an elevation profile', A('fb-profile'), A('fb-high')),
      card('Task 3', 'Calculate trail gradients', A('fc-pos'), A('fc-neg'), A('fc-zero'), A('fc-und')),
      card('Task 4', 'Identify linear relationships', A('fd-lin'), A('fd-rate'), A('fd-eq')),
      card('Task 5', 'Identify proportional relationships', A('fe-speed'), A('fe-grade'), A('fe-pump')),
      el('p', { class: 'ls-small' }, el('a', { href: '#extension' }, 'See your Ride Data Report →'))
    ]; }
  },
  report: { kicker: 'Session report', extra: (ctx, s) => reportBlocks(ctx, s, { objectives: OBJECTIVES, objectivesTitle: 'The six topics', kinds: KINDS, questions: ALL_QUESTIONS, ideas: IDEAS, missions: MISSIONS,
    nextUnit: 'Next in Algebra 1: Linear equations and functions, building on slope and y = mx + b.', park: null, buttons: { view: ['View my Ride Data Report', '#extension'] } }) },
  tutor: P => { const T = tutorOf(P); return { reveal: T.reveal, adapt: T.hints ? null : def => ({ ...def, hints: [] }) }; },
  summaryExtra: P => ({ badges: [...earnedBadges(P, MISSION_LIST)], bank: LEGACY.filter(q => P.done(q.key)).length, designer: (P.getData('rrDone', []) || []).length }),
  stats: s => [['Badges', `${(s.badges || []).length} of 6`], ['Original Slope Lab questions done', `${s.bank || 0} of ${LEGACY.length}`], ['Designer challenges', `${s.designer || 0} of 4`]]
};
MISSION_LIST = LAB.missions;

// Earlier versions saved answers under upper-case ids (F1 … T8) in the same
// storage slot; rename them once so they count here.
export function migrate(opts = {}) {
  try {
    const M = createProgress({ lesson: { id: ID, sections: [], questions: {} }, studentId: opts.studentId, storage: opts.storage });
    const qs = M.state.questions; let moved = 0;
    for (const k of Object.keys(qs)) if (/^[A-Z]\d+$/.test(k)) { const lk = k.toLowerCase(); if (!qs[lk]) qs[lk] = qs[k]; delete qs[k]; moved++; }
    if (moved || M.getData('migratedFrom', null) === null) M.setData('migratedFrom', moved ? 'slope-lab 1.0 (' + moved + ' answers)' : 'none', true);
    return moved;
  } catch (e) { return 0; }
}
export function mount(target, opts = {}) { migrate(opts); return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.MapTheLine = { mount, VERSION };
