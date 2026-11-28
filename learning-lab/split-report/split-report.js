// The Split Report: the MTB Race Intelligence Lab (Mathlete MTB, Algebra 1,
// Data and Statistics). The student is a junior Race Intelligence Analyst at
// the fictional Northstar Gravity Racing: auditing consistency, scanning for
// patterns, separating signal from noise, and building the race-day forecast.
//
//   import { mount } from './split-report.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb, onAttempt, onProgress, onComplete })
// Events also fire on the element: splitreport:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell and shares the Algebra 1
// workbench, prediction-first steps, tutor panel and report with the other
// Algebra 1 labs. Every statistic comes from the kit's engine
// (lesson-kit/stats.js). The data is fictional and simulated for teaching:
// an association here is not proof of causation. Works with no options and
// no account, and without any AI service or live timing feed.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, FINAL_SETS, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, OBJECTIVES, MISCONCEPTIONS,
  AUDIT_IDS, auditPractice, SCAN_IDS, scanPractice, SIGNAL_IDS, signalPractice, FORECAST_IDS, forecastPractice, N, R_ALL, R_NINE } from './logic/questions.js';
import { WORKBENCH } from './logic/workbench.js';
import { RIDER_PAIRS, PAIRED, DATA_NOTE, MODEL_NOTE, REFS, AFFILIATION_NOTE } from './logic/data.js';
import { tableEl } from '../slope-lab/components/figures.js';
import { riderBoard, dotPlot, histogramLab, boxPlotLab, statStepper, scatterBuilder, outlierLab } from './components/labs.js';
import { corrExplorer, rExperiment, careerCard, refLinks, lineFitter, predictionTool, residualViz, briefing } from './components/forecast.js';
import { raceRoom, analystReport } from './components/room.js';
import { scatterPlot } from './components/charts.js';
import { openingArt } from './components/visuals.js';
import { earnedBadges } from '../dream-line-project/components/park.js';
import { workbench, predict, writtenResponse, tutorOf, afterRender } from '../dream-line-project/components/labs.js';
import { tutorPanel as sharedTutorPanel, reportBlocks } from '../dream-line-project/components/shared.js';

export const VERSION = '1.0.0';
export const ID = 'split-report';

let MISSION_LIST = [];
const act = (ctx, id, kicker, title, ...kids) => { const c = ctx.card(kicker, title, ...kids); c.id = id; return c; };
function Q(ctx, id, o = {}) {
  const def = o.def || QUESTIONS[id];
  if (def.type === 'scatter') return scatterBuilder(ctx, id, def, o);
  return ctx.q(id, o);
}
const Qs = (ctx, ids, o) => ids.map(id => Q(ctx, id, o));
function badgeNote(ctx, mid) {
  return ctx.live(() => {
    const m = MISSION_LIST.find(x => x.id === mid), got = earnedBadges(ctx.progress, MISSION_LIST).has(mid);
    return el('div', { class: 'dl-badge-card' + (got ? ' is-earned' : '') }, el('span', { class: 'dl-badge-mark', 'aria-hidden': 'true' }, got ? '★' : '☆'),
      el('p', null, got ? el('b', null, `${m.badge.toUpperCase()} badge earned.`) : el('span', null, 'Finish every question in this mission (including the independent challenge) to earn the ', el('b', null, m.badge.toUpperCase()), ' badge.')));
  });
}
const WB = k => WORKBENCH[k];
// A question's figure, described as data in logic/questions.js.
function figureOf(fig) {
  if (!fig) return null;
  if (fig.kind === 'scatter') { const D = fig.set; return el('div', { class: 'ms-figure' }, scatterPlot({ set: D, line: fig.line || null, label: `${D.title} (fictional): ` + D.x.map((x, i) => `(${x}, ${D.y[i]})`).join(', ') }).node, tableEl(D.x.map((x, i) => [String(x), String(D.y[i])]), [D.xLabel, 'Sector time (s)'])); }
  return null;
}

// ================================================================ Mission 01: The Consistency Audit
function auditPage(ctx) {
  const { note, sim, para: Pa, practiceBox } = ctx;
  const out = [
    act(ctx, 'sr-a-1', 'Activity 1', 'The practice-time board', workbench(ctx, WB('displays')),
      Pa('The performance director has collected eight practice times from two riders on the same technical downhill sector. Who is more consistent? Who is generally faster? And what’s the best way to compare them?'),
      sim('Timing board', riderBoard(ctx)),
      predict(ctx, 'consistent', { prompt: 'Before any graphs: which rider do you think is more consistent?', options: [{ id: 'a', text: 'Rider A (Apex)', right: true }, { id: 'b', text: 'Rider B (Breakaway)', right: false }, { id: 'same', text: 'About the same', right: false }],
        reveal: () => Q(ctx, 'au-display') })),
    act(ctx, 'sr-a-2', 'Activity 2', 'The interactive dot plot', sim('Dot plot', dotPlot(ctx)), Qs(ctx, ['au-tight', 'au-stack'])),
    act(ctx, 'sr-a-3', 'Activity 3', 'Build the histogram', Pa('Use the same bins for both riders: 58–62, 63–67, 68–72 and 73–77 seconds. Try the other setups too: some are fine, and some can’t be used.'), sim('Histogram builder', histogramLab(ctx)), Qs(ctx, ['au-freq', 'au-hist'])),
    act(ctx, 'sr-a-4', 'Activity 4', 'Center: mean and median', workbench(ctx, WB('center')), sim('Median and quartile stepper', statStepper(ctx)), Qs(ctx, ['au-mean', 'au-median'])),
    act(ctx, 'sr-a-5', 'Activity 5', 'Spread: box plots, quartiles and IQR', workbench(ctx, WB('spread')), note('key', 'quartile convention', 'Split the sorted times into a lower half and an upper half; Q1 and Q3 are the medians of those halves. Every quartile in this lab uses this median-of-halves method.'),
      sim('Side-by-side box plots', boxPlotLab(ctx)), Qs(ctx, ['au-quart', 'au-spread'])),
    act(ctx, 'sr-a-6', 'Activity 6', 'The performance decision', Qs(ctx, ['au-d1', 'au-d2', 'au-d3', 'au-d4', 'au-d5']),
      note('key', 'the learning moment', 'A rider can have a faster typical run but still have a slower average, because their performance is inconsistent. A single statistic doesn’t tell the whole story.'),
      Qs(ctx, ['au-same', 'au-lower']),
      writtenResponse(ctx, 'audit-rec', { prompt: 'Performance recommendation: “Rider ___ has the more consistent practice times because ___. Rider ___ has the lower median time, while ___. Based on the data, I would describe the difference between these riders as ___.”', sample: 'Rider A has the more consistent practice times because their range (4 s) and IQR (2 s) are much smaller. Rider B has the lower median time (63.5 s), while Rider A has the lower mean (64 s), because Rider B has a few much slower runs. Based on the data, I would describe the difference as speed against consistency: Rider B is sometimes faster, but Rider A is far more reliable.' })),
    act(ctx, 'sr-a-7', 'Independent challenge', 'More timing sheets', practiceBox()),
    badgeNote(ctx, 'audit')
  ];
  afterRender(); return out;
}

// ================================================================ Mission 02: The Pattern Scan
function scanPage(ctx) {
  const { note, sim, para: Pa, practiceBox } = ctx;
  const out = [
    act(ctx, 'sr-s-1', 'Activity 1', 'Build the scatter plot', workbench(ctx, WB('scatter')),
      Pa('Are riders who complete more practice laps generally recording faster sector times? Each rider has a number of practice laps before their final timed run, and a final sector time.'),
      predict(ctx, 'trend', { prompt: 'Will the scatter plot trend upward or downward?', options: [{ id: 'up', text: 'Upward', right: false }, { id: 'down', text: 'Downward', right: true }, { id: 'none', text: 'No trend', right: false }],
        reveal: () => [Q(ctx, 'sc-plot'), Q(ctx, 'sc-axes')] })),
    act(ctx, 'sr-s-2', 'Activity 2', 'Read the pattern', Qs(ctx, ['sc-q1', 'sc-q2', 'sc-q3', 'sc-q4', 'sc-q5', 'sc-connect'])),
    act(ctx, 'sr-s-3', 'Activity 3', 'Investigate the outlier', Pa('“This rider completed eight practice laps, but their sector time was 75 seconds. That’s quite different from what the other results might lead us to expect. What should we do?”'),
      sim('Outlier investigation', outlierLab(ctx)), note('myth', 'unusual isn’t invalid', 'Identifying an outlier is different from proving it’s wrong. We might inspect the timing record or learn the context, but we never remove an observation just because it doesn’t fit the pattern we expected.'),
      Qs(ctx, ['sc-flag', 'sc-causes', 'sc-prove']), careerCard('timing'),
      writtenResponse(ctx, 'scan-desc', { prompt: 'Describe the graph: “The scatter plot shows a ___ association between practice laps and sector times. The pattern is approximately ___. One unusual point is ___, which should be investigated because ___.”', sample: 'The scatter plot shows a negative association between practice laps and sector times. The pattern is approximately linear. One unusual point is Rider 8 at (8, 75), which should be investigated because it sits far above the trend of the other nine riders; it may have a legitimate explanation, such as conditions, a mechanical or a timing error.' })),
    act(ctx, 'sr-s-4', 'Independent challenge', 'More data sheets', practiceBox()),
    badgeNote(ctx, 'scan')
  ];
  afterRender(); return out;
}

// ================================================================ Mission 03: Signal or Noise?
function signalPage(ctx) {
  const { note, sim, para: Pa, practiceBox } = ctx;
  const out = [
    act(ctx, 'sr-g-1', 'Activity 1', 'Understand correlation', workbench(ctx, WB('correlation')), Pa('How strong is the relationship, and can we say that more practice laps make someone faster? First, get a feel for r with six generated relationships.'),
      sim('Correlation explorer', corrExplorer(ctx)), Qs(ctx, ['sg-range', 'sg-strongest', 'sg-curve'])),
    act(ctx, 'sr-g-2', 'Activity 2', 'Northstar’s correlation', predict(ctx, 'strength', { prompt: 'Does the Northstar data show a strong or a weak relationship?', options: [{ id: 'strong', text: 'Fairly strong', right: true }, { id: 'weak', text: 'Weak', right: false }, { id: 'none', text: 'None', right: false }],
      reveal: () => [el('p', { class: 'ms-live-eq' }, `All ten riders: r ≈ ${N(R_ALL, 2)}`), Qs(ctx, ['sg-r1', 'sg-r2', 'sg-r3'])] }),
      note('key', 'lower is faster', 'In this data, lower sector times mean faster runs, so a negative correlation means more laps go with faster times.')),
    act(ctx, 'sr-g-3', 'Activity 3', 'The outlier experiment', sim('Sensitivity experiment', rExperiment(ctx)), Qs(ctx, ['sg-why', 'sg-keep'])),
    act(ctx, 'sr-g-4', 'Activity 4', 'Correlation doesn’t prove causation', workbench(ctx, WB('causation')), Qs(ctx, ['sg-cause', 'sg-factors']),
      note('key', 'observational data', 'The data shows that two variables are associated. It doesn’t isolate the effect of practice laps, and it doesn’t tell us how much any other factor influenced a result.')),
    act(ctx, 'sr-g-5', 'Activity 5', 'The headline challenge', Q(ctx, 'sg-headline'),
      writtenResponse(ctx, 'headline', { prompt: 'Rewrite “More Practice Laps Make You Faster!” in statistically responsible language.', sample: 'In this sample, riders with more practice laps tended to record faster sector times, but the data does not prove that additional practice laps caused the improvement.' }),
      careerCard('scientist', el('div', null, el('p', { class: 'ls-small' }, 'Sports scientists and performance analysts work with GPS tracking, rider movement and acceleration, performance times, stage comparisons, and training and recovery measurements. Published research:'), refLinks([3, 4])))),
    act(ctx, 'sr-g-6', 'Independent challenge', 'More correlations', practiceBox()),
    badgeNote(ctx, 'signal')
  ];
  afterRender(); return out;
}

// ================================================================ Mission 04: Race-Day Forecast
function forecastPage(ctx) {
  const { note, sim, para: Pa, practiceBox } = ctx;
  const out = [
    act(ctx, 'sr-f-1', 'Activity 1', 'Draw the best-fit line', workbench(ctx, WB('regression')), Pa('Can we fit a line to the data and estimate a rider’s sector time? More importantly, how accurate is that model?'),
      predict(ctx, 'perfect', { prompt: 'Will a line of best fit predict every rider’s time perfectly?', options: [{ id: 'no', text: 'No: the points scatter around it', right: true }, { id: 'yes', text: 'Yes, if it’s the best line', right: false }],
        reveal: () => [sim('Line-fitting tool', lineFitter(ctx)), Q(ctx, 'fo-good')] })),
    act(ctx, 'sr-f-2', 'Activity 2', 'The regression equation', el('p', { class: 'ms-live-eq' }, 'ŷ = 78.4 − 1.4x'), Pa('x is the number of practice laps; ŷ is the predicted sector time in seconds. This least-squares line is the reference model for the rest of the mission.'),
      Qs(ctx, ['fo-slope-n', 'fo-slope', 'fo-int'])),
    act(ctx, 'sr-f-3', 'Activity 3', 'Make a prediction', sim('Prediction tool', predictionTool(ctx)), Q(ctx, 'fo-pred6')),
    act(ctx, 'sr-f-4', 'Activity 4', 'Understand residuals', workbench(ctx, WB('residuals')), el('p', { class: 'ms-live-eq' }, 'Residual = actual − predicted'),
      Qs(ctx, ['fo-res6', 'fo-res-sign']), sim('Residual visualizer', residualViz(ctx)), Qs(ctx, ['fo-res8', 'fo-res8-mean', 'fo-res3'])),
    act(ctx, 'sr-f-5', 'Activity 5', 'The forecast challenge', workbench(ctx, WB('extrapolation')), Qs(ctx, ['fo-c', 'fo-trust']), careerCard('developer', el('p', { class: 'ls-small' }, 'Gravity Lab is an independent project that turns public downhill timing into live sector updates, gap charts and predictions: a real example of someone combining racing and software. ', el('a', { href: REFS[0][1], target: '_blank', rel: 'noopener' }, 'About Gravity Lab')))),
    act(ctx, 'sr-f-6', 'Activity 6', 'Prepare the race briefing', Pa('Your report to the performance director. Write one or two sentences for each part.'), briefing(ctx)),
    act(ctx, 'sr-f-7', 'Independent challenge', 'More forecasts', practiceBox()),
    badgeNote(ctx, 'forecast')
  ];
  afterRender(); return out;
}

// ================================================================ config
const SECTIONS = {
  audit: [['sr-a-1', 'Practice-time board'], ['sr-a-2', 'Dot plot'], ['sr-a-3', 'Histogram'], ['sr-a-4', 'Mean and median'], ['sr-a-5', 'Box plots and IQR'], ['sr-a-6', 'Performance decision'], ['sr-a-7', 'More timing sheets']],
  scan: [['sr-s-1', 'Build the scatter plot'], ['sr-s-2', 'Read the pattern'], ['sr-s-3', 'Investigate the outlier'], ['sr-s-4', 'More data sheets']],
  signal: [['sr-g-1', 'Understand correlation'], ['sr-g-2', 'Northstar’s r'], ['sr-g-3', 'Outlier experiment'], ['sr-g-4', 'Causation'], ['sr-g-5', 'Headline challenge'], ['sr-g-6', 'More correlations']],
  forecast: [['sr-f-1', 'Best-fit line'], ['sr-f-2', 'Regression equation'], ['sr-f-3', 'Prediction'], ['sr-f-4', 'Residuals'], ['sr-f-5', 'Forecast challenge'], ['sr-f-6', 'Race briefing'], ['sr-f-7', 'More forecasts']]
};
const WRITTEN = { 'audit-rec': 'Performance recommendation', 'scan-desc': 'Scatter plot description', headline: 'Responsible headline', 'brief-1': 'Briefing: consistency', 'brief-2': 'Briefing: relationship', 'brief-3': 'Briefing: correlation', 'brief-4': 'Briefing: line and slope', 'brief-5': 'Briefing: prediction and residual', 'brief-6': 'Briefing: limitation', 'cert-explain': 'Certification: why a residual is worth investigating' };
const KINDS = questionKinds();
const HOOKS = {
  audit: 'Two riders, eight practice runs each. Who’s more consistent, who’s generally faster, and how should we compare them?',
  scan: 'Are riders who do more practice laps recording faster sector times? Plot the data and see what patterns emerge.',
  signal: 'How strong is the relationship, and can we actually say that more practice laps make someone faster?',
  forecast: 'Fit a line, predict sector times, and find out how accurate the model really is.'
};
const PAGES = { audit: auditPage, scan: scanPage, signal: signalPage, forecast: forecastPage };
const practiceFor = {
  audit: { ids: AUDIT_IDS, count: RIDER_PAIRS.length, questions: auditPractice, button: 'New timing sheet', note: 'Two more riders: center, spread and consistency.', kicker: 'Independent challenge' },
  scan: { ids: SCAN_IDS, count: PAIRED.length, questions: scanPractice, button: 'New data sheet', note: 'Direction, and the unusual point.', kicker: 'Independent challenge' },
  signal: { ids: SIGNAL_IDS, count: PAIRED.length, questions: signalPractice, button: 'New data sheet', note: 'Read r, the outlier’s influence, and the causation trap.', kicker: 'Independent challenge' },
  forecast: { ids: FORECAST_IDS, count: PAIRED.length, questions: forecastPractice, button: 'New forecast', note: 'A prediction and a residual from a new model.', kicker: 'Independent challenge' }
};
const certificate = P => P.getData('certified', null);
// Common slips the report counts.
const SLIPS = { center: ['median-one-middle', 'median-unsorted', 'mean-for-median', 'sum-not-divided'], spread: ['range-for-iqr', 'quartile-method', 'larger-iqr-consistent'], causation: ['causal-claim', 'slope-causal', 'outlier-proof', 'delete-outlier'], residuals: ['residual-order', 'residual-sign-meaning', 'extrapolate-trust', 'slope-sign'] };
function slipCounts(P) {
  const out = { center: 0, spread: 0, causation: 0, residuals: 0 };
  for (const r of Object.values(P.state.questions)) for (const c of r.codes || (r.code ? [r.code] : [])) for (const [g, cs] of Object.entries(SLIPS)) if (cs.includes(c)) out[g]++;
  return out;
}

export const LAB = {
  id: ID, title: 'The Split Report', eventPrefix: 'splitreport', rootClass: 'spr mtl dlp', noun: 'lab',
  questions: QUESTIONS, kinds: KINDS, ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 1 · Data and Statistics',
    lines: ['The Split'], accent: 'Report',
    lede: 'Find the story hidden in the data.',
    body: 'Welcome to Northstar Gravity Racing. We’ve got an important race weekend coming up, and we need someone who can make sense of the numbers. The riders have been putting in practice laps, the timing system has recorded their sector splits, and now we need to know who’s consistent, what patterns are emerging, and what we can reasonably predict for race day. You’re our new Race Intelligence Analyst.',
    enter: 'Enter the race room →', back: 'Back to the race room →',
    meta: 'The MTB Race Intelligence Lab · 45–55 minutes · four missions and the Race Intelligence Analyst certification · progress saves on this device',
    art: () => openingArt()
  },
  board: { title: 'The race room', hook: 'Four missions, one race-day report. Each earns a badge; all four unlock the Race Intelligence Analyst certification.',
    extra: ctx => el('div', null, raceRoom(ctx, MISSION_LIST), sharedTutorPanel(ctx, { missions: MISSION_LIST, sections: SECTIONS, written: WRITTEN, questions: QUESTIONS })), refsNote: DATA_NOTE + ' Data simulated for teaching: an association here is not proof of causation. ' + AFFILIATION_NOTE, refs: REFS },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] })),
  extension: { kicker: 'Your report', title: 'Race Intelligence Report', blurb: 'Your consistency comparison, scatter plot, correlation, model, prediction, residuals and written conclusions, ready to print.', hook: 'The briefing for the performance director, built from your work.', page: ctx => [ctx.card(null, null, analystReport(ctx, MISSION_LIST, certificate(ctx.progress)))] },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'Race Intelligence Analyst Certification', blurb: 'Twelve new questions across all four missions, on your own.',
    hook: 'New riders, a new sector and a new model: compare, describe, correlate and forecast.',
    lockedHook: 'Earn all four mission badges to unlock the Race Intelligence Analyst certification.',
    doneShort: 'Certified analyst', doneTitle: 'Certified Race Intelligence Analyst',
    doneLede: 'You compared distributions, described scatter plots, interpreted correlation without claiming causation, and built and checked a race-day forecast with residuals.',
    notYet: x => `${x.right} of ${x.total} right this round (the pass mark is ${PASS_MARK}). Look back at the solutions, then try a fresh round with new data.`,
    page: (ctx, F, key) => { const { card } = ctx, A = id => Q(ctx, id, { def: F[id], key, kicker: 'Certification' }); return [
      card('Part A', 'Data representation', A('fa-median'), A('fa-iqr'), A('fa-consistent')),
      card('Part B', 'Scatter plots', A('fb-direction'), A('fb-outlier'), A('fb-action')),
      card('Part C', 'Correlation', A('fc-strength'), A('fc-cause')),
      card('Part D', 'Lines of best fit', A('fd-slope'), A('fd-predict'), A('fd-residual'), A('fd-extrap'),
        writtenResponse(ctx, 'cert-explain', { prompt: 'In a sentence or two: why is a large residual a reason to investigate rather than proof that something went wrong?', sample: 'A residual only says how far a result was from the model’s prediction. The model can’t explain why, so a large residual tells us where to look (conditions, equipment, timing, a mistake), not what happened.' })),
      el('p', { class: 'ls-small' }, el('a', { href: '#extension' }, 'See your Race Intelligence Report →'))
    ]; }
  },
  report: { kicker: 'Session report', extra: (ctx, s) => reportBlocks(ctx, s, { objectives: OBJECTIVES, objectivesTitle: 'The four topics', kinds: KINDS, questions: QUESTIONS, ideas: IDEAS, missions: MISSIONS,
    nextUnit: 'That’s the last unit of Algebra 1. Next: Algebra 2.', park: null, retryLabel: 'Retry certification', buttons: { view: ['View my race report', '#extension'] } }) },
  tutor: P => { const T = tutorOf(P); return { reveal: T.reveal, adapt: def => { let d = def; if (def.fig && !def.figure) d = { ...d, figure: () => figureOf(def.fig) }; if (!T.hints) d = { ...d, hints: [] }; return d; } }; },
  summaryExtra: P => ({ badges: [...earnedBadges(P, MISSION_LIST)], analyst: P.getData('analyst', '') || null, briefing: ['brief-1', 'brief-2', 'brief-3', 'brief-4', 'brief-5', 'brief-6'].filter(id => (P.written(id) || '').trim()).length, scatterPlotted: !!P.done('sc-plot'), slips: slipCounts(P) }),
  stats: s => [['Badges', `${(s.badges || []).length} of 4`], ['Scatter plot built', s.scatterPlotted ? 'yes' : 'not yet'], ['Briefing parts written', `${s.briefing || 0} of 6`], ['Center slips', String((s.slips || {}).center || 0)], ['Spread slips', String((s.slips || {}).spread || 0)], ['Causation and outlier slips', String((s.slips || {}).causation || 0)], ['Residual and model slips', String((s.slips || {}).residuals || 0)]]
};
MISSION_LIST = LAB.missions;

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }
if (typeof window !== 'undefined') window.SplitReport = { mount, VERSION, R: [R_ALL, R_NINE], MODEL_NOTE };
