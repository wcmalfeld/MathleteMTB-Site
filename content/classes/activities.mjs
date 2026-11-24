// ============================================================
// CLASSES: learning activities (data only).
//
// An activity lives at its own route and is linked to curriculum SKILLS,
// not to a course page. A topic page lists every activity that teaches one
// of its skills, so one activity can appear in several topics or courses.
// `home` is the topic it belongs to first (shown first, used for the
// "back to topic" link).
//
// type: 'lab' | 'guided' | 'game' | 'practice'
// status: 'live' (shown) | 'draft' (hidden everywhere)
//
// tracking: how the activity reports student attempts (optional).
//   gameId:    the game id used with js/progress.js
//   questions: question kind ids (without the "<gameId>:" prefix) mapped
//              to the curriculum skill ids each one practises. These are
//              written into supabase/curriculum.sql by build-classes.mjs,
//              so every attempt counts toward those skills' progress.
//
// After editing, run  node scripts/build-classes.mjs
// ============================================================

// Slope Lab question objectives -> curriculum skills.
const S = 'alg1.slope-and-rate-of-change.';
const SLOPE_OBJECTIVES = {
  'rise-run':      [S + 'slope-as-rate'],
  'rise-over-run': [S + 'slope-as-rate', S + 'calculate-two-points'],
  'slope-types':   [S + 'interpret-sign', 'alg1.positive-and-negative-slope.classify-slope'],
  'grade':         [S + 'real-world-slope'],
  'two-points':    [S + 'calculate-two-points', 'geo.slope-review.calculate-slope'],
  'table':         ['alg1.linear-relationships.constant-rate', 'alg1.linear-relationships.linear-from-table'],
  'graph':         ['alg1.linear-relationships.compare-representations', 'alg1.graphing-linear-equations.graph-slope-intercept'],
  'equation':      ['alg1.slope-intercept-form.identify-m-and-b', 'alg1.slope-intercept-form.interpret-m-and-b'],
  'rate':          [S + 'real-world-slope', 'alg1.slope-intercept-form.interpret-m-and-b']
};
// Questions that practise something more specific than their objective.
const SLOPE_EXTRA = {
  F2: ['alg1.positive-and-negative-slope.direction'],
  F6: ['alg1.positive-and-negative-slope.classify-slope'],
  T6: ['alg1.positive-and-negative-slope.undefined-slope'],
  C1: ['alg1.writing-linear-equations.from-context'],
  C5: ['alg1.writing-linear-equations.from-two-points'],
  C7: ['alg1.writing-linear-equations.from-slope-and-point'],
  T8: ['alg1.writing-linear-equations.from-two-points'],
  T5: ['alg1.graphing-linear-equations.graph-slope-intercept'],
  A6: [S + 'real-world-slope'],
  C3: [S + 'real-world-slope'],
  C8: ['alg1.writing-linear-equations.from-context']
};
// Each Slope Lab question's objective (kept in step with
// learning-lab/slope-lab/content/questions.js; check-site.mjs verifies it).
const SLOPE_QUESTIONS = {
  F1: 'rise-run', F2: 'slope-types', F3: 'rise-over-run', F4: 'grade', F5: 'grade', F6: 'slope-types', F7: 'rise-run', F8: 'grade',
  A1: 'two-points', A2: 'two-points', A3: 'table', A4: 'table', A5: 'graph', A6: 'rise-over-run', A7: 'equation', A8: 'equation',
  C1: 'equation', C2: 'rate', C3: 'grade', C4: 'rate', C5: 'graph', C6: 'table', C7: 'equation', C8: 'rate',
  T1: 'two-points', T2: 'equation', T3: 'table', T4: 'table', T5: 'graph', T6: 'slope-types', T7: 'rate', T8: 'equation'
};
const slopeQuestionSkills = Object.fromEntries(Object.entries(SLOPE_QUESTIONS).map(([q, obj]) =>
  [q, [...new Set([...(SLOPE_OBJECTIVES[obj] || []), ...(SLOPE_EXTRA[q] || [])])]]));

// Jump Trajectory Lab: the lab lists its own question kinds and the ideas
// each practises; here those ideas become curriculum skills.
import { questionKinds as jumpKinds } from '../../learning-lab/jump-trajectory-lab/logic/problems.js';
const G = 'alg1.graphing-quadratics.', VX = 'alg1.vertex-and-axis-of-symmetry.';
const JUMP_IDEAS = {
  recognize:   [G + 'recognize-parabola', G + 'graph-parabola'],
  vertex:      [G + 'read-features', VX + 'find-vertex'],
  max:         [G + 'read-features', VX + 'interpret-vertex'],
  zeros:       [G + 'read-features', 'alg1.solving-quadratics-by-factoring.interpret-roots'],
  axis:        [VX + 'axis-of-symmetry'],
  coefficient: [G + 'effect-of-a'],
  forms:       [G + 'equation-forms'],
  interpret:   [VX + 'interpret-vertex', 'alg1.applications-of-quadratic-functions.reasonable-answers']
};
const jumpQuestionSkills = Object.fromEntries(Object.entries(jumpKinds()).map(([q, ideas]) =>
  [q, [...new Set(ideas.flatMap(i => JUMP_IDEAS[i] || []))]]));

// Physics: Lab tools' question kinds (from supabase/progress.sql)
// -> physics skills. Kinds that don't practise physics are left out.
const PM = 'phys1.projectile-motion.', CM = 'phys1.uniform-circular-motion.', RD = 'phys1.rotational-dynamics.';
const FR = 'phys1.applications-of-newtons-laws.friction', UNITS = 'phys1.scientific-measurement.unit-conversions', TRIG = 'phys1.mathematics-review.trig-ratios';
const JUMP_LAB = {
  'clear-the-gap':         [PM + 'launch-variables', PM + 'predict-landing'],
  'minimum-speed':         [PM + 'launch-variables', PM + 'predict-landing'],
  'perfect-trajectory':    [PM + 'launch-variables', PM + 'flight'],
  'same-distance':         [PM + 'launch-variables'],
  'solve-before-jump':     [PM + 'components', PM + 'flight', PM + 'predict-landing'],
  'mission-prediction':    [PM + 'predict-landing'],
  'predict-speed-plus-20': [PM + 'launch-variables'],
  'predict-double-speed':  [PM + 'launch-variables', PM + 'flight'],
  'predict-angle-up-5':    [PM + 'launch-variables'],
  'predict-drop-landing':  [PM + 'flight', PM + 'independence']
};
const BERM_LAB = {
  'c1-predict': [CM + 'speed-and-radius'],
  'c1-accel':   [CM + 'centripetal-acceleration'],
  'c1-ratio':   [CM + 'speed-and-radius'],
  'c2-predict': [CM + 'speed-and-radius'],
  'c2-convert': [UNITS],
  'c2-accel':   [CM + 'centripetal-acceleration', CM + 'speed-and-radius'],
  'c3-predict': [CM + 'banking'],
  'c3-angle':   [CM + 'banking', TRIG],
  'c3-sim':     [CM + 'banking'],
  'c4-predict': [CM + 'banking', FR],
  'c4-flat':    [CM + 'centripetal-acceleration', FR],
  'c4-source':  [CM + 'centripetal-force'],
  'c5-predict': [CM + 'centripetal-force'],
  'c5-force':   [CM + 'centripetal-force'],
  'c5-grip':    [CM + 'centripetal-force', FR],
  'c6-predict': [CM + 'banking'],
  'c6-design':  [CM + 'banking'],
  'c6-math':    [CM + 'banking', FR],
  'c6-min':     [CM + 'banking', TRIG]
};
const GEAR_LAB = {
  'sheet-ratio':           [RD + 'gear-ratio'],
  'geo-gear-inches':       [RD + 'gear-ratio'],
  'sheet-development':     [RD + 'drivetrain'],
  'sheet-speed':           [RD + 'drivetrain'],
  'geo-circumference':     [RD + 'drivetrain'],
  'tune-prediction':       [RD + 'drivetrain'],
  'precalc-angular-speed': [RD + 'angular-velocity']
};

// Newton's Laws lesson: the lesson lists its own questions and the ideas each
// practises (learning-lab/newtons-laws/logic/lesson.js); here those ideas
// become curriculum skills.
import { questionKinds as newtonKinds } from '../../learning-lab/newtons-laws/logic/lesson.js';
const N7 = 'phys1.newtons-laws.';
const NEWTON_IDEAS = {
  'force-types': [N7 + 'free-body'], vector: ['phys1.vectors.scalars-vectors'], weight: [N7 + 'force-and-weight'], net: [N7 + 'net-force'],
  balanced: [N7 + 'balanced-forces'], inertia: [N7 + 'inertia'], 'first-law': [N7 + 'inertia', N7 + 'balanced-forces'], 'second-law': [N7 + 'second-law'],
  'third-law': [N7 + 'third-law'], pairs: [N7 + 'third-law'], fbd: [N7 + 'free-body'], incline: ['phys1.applications-of-newtons-laws.inclines'], reasoning: [N7 + 'second-law']
};
const newtonQuestionSkills = Object.fromEntries(Object.entries(newtonKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => NEWTON_IDEAS[i] || []))]]));

// Introduction to Physics lesson: same pattern (learning-lab/intro-to-physics/logic/lesson.js).
import { questionKinds as introKinds } from '../../learning-lab/intro-to-physics/logic/lesson.js';
const M1 = 'phys1.introduction-to-physics.';
const INTRO_IDEAS = {
  'what-physics': [M1 + 'what-physics-studies'], phenomena: [M1 + 'phenomena'], 'physics-of-the-bike': [M1 + 'physics-of-the-bike'], 'matter-energy': [M1 + 'matter-energy'],
  systems: [M1 + 'systems'], models: [M1 + 'models-and-laws'], 'observation-explanation': [M1 + 'observation-explanation'], investigation: [M1 + 'investigation'], branches: [M1 + 'branches']
};
const introQuestionSkills = Object.fromEntries(Object.entries(introKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => INTRO_IDEAS[i] || []))]]));

// Race-Day Workshop (Algebra 2, Unit 1): the workshop lists its own question
// ids and the ideas each practises (learning-lab/race-day-workshop/logic/questions.js);
// here those ideas become curriculum skills.
import { questionKinds as raceDayKinds } from '../../learning-lab/race-day-workshop/logic/questions.js';
const EI = 'alg2.solving-equations-and-modeling-constraints.';
const RACE_DAY_IDEAS = {
  formula:         ['alg2.linear-equations-review.rearrange-formulas', 'alg2.linear-equations-review.solve-linear'],
  model:           [EI + 'model-with-equations'],
  'abs-eq':        ['alg2.absolute-value-equations.solve-abs-equations', 'alg2.absolute-value-equations.tolerance-problems'],
  'abs-ineq':      ['alg2.absolute-value-equations.solve-abs-inequalities', 'alg2.absolute-value-equations.tolerance-problems'],
  compound:        [EI + 'compound-inequalities'],
  'rational-eq':   ['alg2.rational-equations.clear-denominators', 'alg2.rational-equations-applications.average-speed'],
  'rational-ineq': [EI + 'rational-inequalities'],
  'radical-eq':    ['alg2.radical-equations.isolate-and-square'],
  verify:          [EI + 'check-solutions', 'alg2.radical-equations.extraneous'],
  domain:          [EI + 'domain-restrictions', 'alg2.rational-equations.excluded-values'],
  interpret:       [EI + 'interpret-solutions'],
  complex:         [EI + 'no-real-solution', 'alg2.complex-numbers.define-i', 'alg2.complex-solutions.graph-meaning']
};
const raceDayQuestionSkills = Object.fromEntries(Object.entries(raceDayKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => RACE_DAY_IDEAS[i] || []))]]));

// Ride Systems Lab (Algebra 2, Unit 2: Functions): same pattern
// (learning-lab/ride-systems-lab/logic/questions.js).
import { questionKinds as rideKinds } from '../../learning-lab/ride-systems-lab/logic/questions.js';
const FN = 'alg2.function-notation.', DR = 'alg2.domain-and-range.', CF = 'alg2.composite-functions.', TF = 'alg2.transformations-of-functions.', IF = 'alg2.inverse-functions.';
const RIDE_IDEAS = {
  notation:       [FN + 'interpret-notation'],
  evaluate:       [FN + 'evaluate-functions', FN + 'read-graphs-tables'],
  'input-output': [FN + 'input-output'],
  'domain-range': [DR + 'range-from-graph', DR + 'domain-in-context'],
  graph:          [FN + 'increasing-decreasing', FN + 'read-graphs-tables'],
  compose:        [CF + 'compose', CF + 'decompose'],
  order:          [CF + 'composition-order'],
  transform:      [TF + 'describe-transformations'],
  'transform-v':  [TF + 'shifts', TF + 'stretches-reflections'],
  'transform-h':  [TF + 'shifts', TF + 'stretches-reflections'],
  inverse:        [IF + 'find-inverse', IF + 'verify-inverse'],
  'one-to-one':   [IF + 'one-to-one', IF + 'horizontal-line-test'],
  restrict:       [IF + 'restrict-domain', DR + 'domain-restrictions'],
  operations:     [CF + 'operations-on-functions']
};
const rideQuestionSkills = Object.fromEntries(Object.entries(rideKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => RIDE_IDEAS[i] || []))]]));

// Bike Park Blueprint Lab (Algebra 2, Unit 3: Linear Systems and Matrices):
// same pattern (learning-lab/bike-park-blueprint-lab/logic/questions.js).
import { questionKinds as parkKinds } from '../../learning-lab/bike-park-blueprint-lab/logic/questions.js';
const SE = 'alg2.systems-of-equations.', TV = 'alg2.three-variable-systems.', MO = 'alg2.matrix-operations.', AM = 'alg2.applications-of-matrices.';
const PARK_IDEAS = {
  graphing:          [SE + 'graph-systems', SE + 'solve-two-variable'],
  substitution:      [SE + 'substitution', SE + 'solve-two-variable'],
  elimination:       [SE + 'elimination', SE + 'solve-two-variable'],
  classify:          [SE + 'classify-systems'],
  'three-var':       [TV + 'solve-three', TV + 'eliminate-to-two'],
  gaussian:          [TV + 'row-operations'],
  augmented:         [TV + 'augmented-matrix'],
  'add-sub':         [MO + 'add-scale'],
  scalar:            [MO + 'add-scale'],
  multiply:          [MO + 'multiply-matrices'],
  dimensions:        [MO + 'dimensions'],
  'matrix-equation': [AM + 'matrix-equations'],
  inverse:           [MO + 'determinant-inverse', AM + 'matrix-equations'],
  applications:      [AM + 'organize-data'],
  model:             [SE + 'model-systems', TV + 'model-three'],
  interpret:         [SE + 'interpret-solution'],
  verify:            [SE + 'interpret-solution'],
  optimize:          [SE + 'systems-of-inequalities']
};
const parkQuestionSkills = Object.fromEntries(Object.entries(parkKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => PARK_IDEAS[i] || []))]]));

// Trail Dynamics Lab (Algebra 2, Unit 4: Quadratic Functions): same pattern
// (learning-lab/trail-dynamics-lab/logic/questions.js).
import { questionKinds as trailKinds } from '../../learning-lab/trail-dynamics-lab/logic/questions.js';
const QG = 'alg2.quadratic-graphs.', VF = 'alg2.vertex-form.', CTS = 'alg2.completing-the-square.', QF = 'alg2.quadratic-formula.', CS = 'alg2.complex-solutions.';
const TRAIL_IDEAS = {
  recognize:         [QG + 'recognize-quadratic'],
  features:          [QG + 'key-features'],
  standard:          [QG + 'graph-forms', QG + 'convert-forms'],
  vertex:            [VF + 'read-vertex-form', VF + 'write-vertex-form'],
  factored:          [QG + 'graph-forms', QG + 'convert-forms'],
  transform:         [QG + 'transformations'],
  factoring:         [QG + 'factor-zeros'],
  'complete-square': [CTS + 'complete-square', CTS + 'convert-to-vertex'],
  'square-root':     [CTS + 'square-root-property'],
  formula:           [QF + 'use-formula', QF + 'derive-formula'],
  discriminant:      [QF + 'discriminant'],
  complex:           [CS + 'complex-roots', CS + 'conjugate-pairs', CS + 'graph-meaning'],
  model:             [QG + 'quadratic-models'],
  interpret:         [QF + 'interpret-solutions'],
  'domain-range':    [QG + 'domain-range'],
  system:            ['alg2.systems-of-equations.linear-quadratic'],
  'complex-arith':   ['alg2.complex-numbers.complex-arithmetic', 'alg2.complex-numbers.define-i']
};
const trailQuestionSkills = Object.fromEntries(Object.entries(trailKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => TRAIL_IDEAS[i] || []))]]));

// Pump Track Profile Lab question skills, from the lab's own idea tags
// (learning-lab/pump-track-lab/logic/questions.js).
import { questionKinds as pumpKinds } from '../../learning-lab/pump-track-lab/logic/questions.js';
const PG = 'alg2.polynomial-graphs.', PO = 'alg2.polynomial-operations.', RZ = 'alg2.roots-and-zeros.', RF = 'alg2.remainder-and-factor-theorems.', FH = 'alg2.factoring-higher-degree-polynomials.';
const PUMP_IDEAS = {
  recognize:       [PG + 'identify-polynomial'],
  degree:          [PG + 'degree-leading'],
  leading:         [PG + 'degree-leading'],
  'end-behavior':  [PG + 'end-behavior'],
  turning:         [PG + 'turning-points'],
  add:             [PO + 'operate'],
  subtract:        [PO + 'operate'],
  multiply:        [PO + 'operate'],
  expand:          [PO + 'expand-factored'],
  zeros:           [RZ + 'zeros-factors', RF + 'build-polynomials'],
  factoring:       [FH + 'factor-with-known-root'],
  multiplicity:    [PG + 'zeros-multiplicity'],
  graphing:        [PG + 'zeros-multiplicity', PG + 'sign-intervals'],
  'rational-zero': [RZ + 'rational-root-theorem', RZ + 'find-all-zeros'],
  synthetic:       [PO + 'synthetic-division'],
  'long-division': [PO + 'long-division'],
  remainder:       [RF + 'remainder-theorem'],
  'factor-theorem':[RF + 'factor-theorem'],
  interpret:       [PG + 'polynomial-models'],
  complex:         [RZ + 'fundamental-theorem', 'alg2.complex-solutions.conjugate-pairs']
};
const pumpQuestionSkills = Object.fromEntries(Object.entries(pumpKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => PUMP_IDEAS[i] || []))]]));

// Enduro Route Intelligence Lab question skills, from the lab's own idea tags
// (learning-lab/enduro-route-lab/logic/questions.js).
import { questionKinds as enduroKinds } from '../../learning-lab/enduro-route-lab/logic/questions.js';
const GRF = 'alg2.graphing-rational-functions.', REX = 'alg2.rational-expressions.', RQA = 'alg2.rational-equations-applications.', RAF = 'alg2.radical-functions.', ASY = 'alg2.asymptotes.', RDE = 'alg2.radical-equations.', RE1 = 'alg2.rational-equations.';
const ENDURO_IDEAS = {
  evaluate:            [GRF + 'evaluate-rational'],
  domain:              [GRF + 'rational-domain', RE1 + 'excluded-values'],
  simplify:            [REX + 'simplify-rational'],
  add:                 [REX + 'add-subtract'],
  subtract:            [REX + 'add-subtract'],
  multiply:            [REX + 'multiply-divide'],
  divide:              [REX + 'multiply-divide'],
  vertical:            [ASY + 'vertical-asymptotes'],
  horizontal:          [ASY + 'horizontal-asymptotes'],
  hole:                [GRF + 'intercepts-holes'],
  transform:           [GRF + 'reciprocal-transformations'],
  'rational-eq':       [RQA + 'solve-rational-eq', RE1 + 'clear-denominators'],
  context:             [RQA + 'rational-models', RQA + 'average-speed'],
  inverse:             [RQA + 'inverse-variation'],
  'radical-eval':      [RAF + 'evaluate-radicals'],
  'radical-domain':    [RAF + 'radical-domain'],
  'sqrt-graph':        [RAF + 'graph-radicals'],
  'cube-root':         [RAF + 'graph-radicals'],
  'radical-transform': [RAF + 'radical-transformations'],
  exponents:           [RAF + 'rational-exponent-form', RDE + 'rational-exponents'],
  'radical-simplify':  [RAF + 'simplify-radicals'],
  'radical-eq':        [RDE + 'isolate-and-square'],
  extraneous:          [RDE + 'extraneous'],
  'radical-model':     [RAF + 'radical-models'],
  slant:               [ASY + 'slant-asymptotes']
};
const enduroQuestionSkills = Object.fromEntries(Object.entries(enduroKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => ENDURO_IDEAS[i] || []))]]));

// Suspension & Systems Lab question skills, from the lab's own idea tags
// (learning-lab/suspension-systems-lab/logic/questions.js).
import { questionKinds as suspensionKinds } from '../../learning-lab/suspension-systems-lab/logic/questions.js';
const EXF = 'alg2.exponential-functions.', EGD = 'alg2.exponential-growth-and-decay.', LOG = 'alg2.logarithms.', LPR = 'alg2.logarithmic-properties.', APP = 'alg2.applications.', GSQ = 'alg2.geometric-sequences.';
const SUSPENSION_IDEAS = {
  recognize:      [EGD + 'compare-models', GSQ + 'arith-or-geom'],
  factors:        [EGD + 'growth-factor'],
  growth:         [EGD + 'growth-decay-models'],
  decay:          [EGD + 'growth-decay-models'],
  geometric:      [GSQ + 'common-ratio'],
  recursive:      [GSQ + 'recursive-geometric'],
  explicit:       [GSQ + 'geometric-rule'],
  'exp-graph':    [EXF + 'graph-exponentials', EXF + 'exp-domain-asymptote'],
  'exp-transform':[EXF + 'exponential-transformations'],
  compare:        [EGD + 'compare-models'],
  'base-e':       [EXF + 'base-e'],
  continuous:     [EXF + 'continuous-models'],
  'solve-exp':    [LPR + 'solve-exp-log'],
  'log-notation': [LOG + 'evaluate-logs'],
  conversion:     [LOG + 'log-exponential-forms'],
  'common-log':   [LOG + 'natural-common-logs'],
  'natural-log':  [LOG + 'natural-common-logs'],
  'log-graph':    [LOG + 'graph-logs', LOG + 'log-domain'],
  product:        [LPR + 'expand-condense'],
  quotient:       [LPR + 'expand-condense'],
  power:          [LPR + 'expand-condense'],
  'change-base':  [LPR + 'change-of-base'],
  'solve-log':    [LPR + 'solve-exp-log'],
  inverse:        [LOG + 'log-inverse'],
  suspension:     [EGD + 'growth-decay-models', APP + 'model-data'],
  event:          [EGD + 'growth-decay-models'],
  sound:          [APP + 'sound-level', APP + 'log-scales'],
  time:           [EGD + 'solve-for-time', APP + 'doubling-half-life'],
  series:         ['alg2.series.geometric-series']
};
const suspensionQuestionSkills = Object.fromEntries(Object.entries(suspensionKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => SUSPENSION_IDEAS[i] || []))]]));

// Enduro Race Intelligence Lab question skills, from the lab's own idea tags
// (learning-lab/race-intelligence-lab/logic/questions.js).
import { questionKinds as raceKinds } from '../../learning-lab/race-intelligence-lab/logic/questions.js';
const PRB = 'alg2.probability.', CPR = 'alg2.conditional-probability.', CMB = 'alg2.combinations-and-permutations.', STA = 'alg2.statistical-analysis.';
const RACE_IDEAS = {
  'sample-space':       [PRB + 'sample-spaces'],
  'mutually-exclusive': [PRB + 'mutually-exclusive'],
  'not-exclusive':      [PRB + 'addition-rule', PRB + 'compound-events'],
  addition:             [PRB + 'addition-rule'],
  multiplication:       [PRB + 'multiplication-rule', PRB + 'compound-events'],
  conditional:          [CPR + 'conditional-formula'],
  independent:          [PRB + 'independent-events'],
  dependent:            [PRB + 'independent-events'],
  'two-way':            [CPR + 'two-way-tables'],
  joint:                [CPR + 'joint-marginal'],
  marginal:             [CPR + 'joint-marginal'],
  'conditional-rf':     [CPR + 'interpret-conditional'],
  mean:                 [STA + 'center-spread'],
  median:               [STA + 'center-spread'],
  range:                [STA + 'center-spread'],
  sd:                   [STA + 'center-spread'],
  histogram:            [STA + 'center-spread'],
  normal:               [STA + 'normal-distribution'],
  empirical:            [STA + 'empirical-rule'],
  'z-score':            [STA + 'normal-distribution'],
  percentile:           [STA + 'percentiles'],
  'pop-sample':         [STA + 'populations-samples'],
  'random-sampling':    [STA + 'sampling-methods'],
  proportion:           [STA + 'populations-samples'],
  'sampling-dist':      [STA + 'sampling-distributions'],
  'standard-error':     [STA + 'sampling-distributions'],
  moe:                  [STA + 'margin-of-error'],
  'study-design':       [STA + 'study-design'],
  randomized:           [STA + 'study-design'],
  significance:         [STA + 'randomization-tests'],
  claims:               [STA + 'evaluate-claims'],
  counting:             [CMB + 'permutations', CMB + 'combinations']
};
const raceQuestionSkills = Object.fromEntries(Object.entries(raceKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => RACE_IDEAS[i] || []))]]));

export const ACTIVITIES = [
  {
    id: 'slope-lab',
    title: 'Slope & Linear Relationships Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/slope-lab/',
    image: null,
    home: 'alg1.slope-and-rate-of-change',
    summary: 'Design trails in the Trail Designer, then learn slope from rise and run, graphs, tables and y = mx + b, with practice at three levels and a no-bikes transfer challenge.',
    objectives: [
      'Understand slope as rise over run, a rate of change',
      'Calculate slope from two points, a graph and a table',
      'Tell decimal slope, percentage grade and angle apart',
      'Read and write y = mx + b for a trail',
      'Use slope outside mountain biking'
    ],
    difficulty: ['beginner', 'intermediate'],
    minutes: '45-60 min',
    parts: ['Interactive lab', 'Guided lessons', 'Practice (24 questions)', 'Transfer challenge (8 questions)'],
    // Every skill the lab practises: everything its questions map to.
    skills: [...new Set(Object.values(slopeQuestionSkills).flat())],
    tracking: { gameId: 'slope-lab', questions: slopeQuestionSkills }
  },
  {
    id: 'jump-trajectory-lab',
    title: 'Jump Trajectory Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/jump-trajectory-lab/',
    image: null,
    home: 'alg1.graphing-quadratics',
    summary: 'Change a jump’s distance and height and watch its parabola, equation and features change together. Then decode vertex, standard and factored form and take on six jump-design missions.',
    objectives: [
      'Recognize a jump trajectory as a parabola',
      'Find the vertex and read it as the maximum height',
      'Find the zeros as takeoff and landing',
      'Use the axis of symmetry',
      'Explain how the leading coefficient changes the shape',
      'Read vertex, standard and factored form'
    ],
    difficulty: ['beginner', 'intermediate'],
    minutes: '15-20 min',
    parts: ['Jump simulator', 'Learning modules (5)', 'Equation decoder', 'Missions (6)'],
    skills: [...new Set(Object.values(jumpQuestionSkills).flat())],
    tracking: { gameId: 'jump-trajectory-lab', questions: jumpQuestionSkills }
  },
  {
    id: 'race-day-workshop',
    title: 'Race-Day Workshop',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/race-day-workshop/',
    image: null,
    home: 'alg2.solving-equations-and-modeling-constraints',
    summary: 'Join an enduro team’s technical crew: check suspension sag with formulas and absolute value, work out the speed a stage needs with rational equations, and survey a climb with a radical equation, then pass the Race-Day Certification.',
    objectives: [
      'Translate race-prep problems into equations and inequalities',
      'Rearrange a formula to isolate an unknown',
      'Use absolute value as distance from a target, and rewrite it as a compound inequality',
      'Solve rational equations and inequalities with a domain restriction',
      'Solve radical equations and check for extraneous solutions',
      'Decide whether a solution makes sense in context'
    ],
    difficulty: ['intermediate', 'advanced'],
    minutes: '20-25 min',
    parts: ['3 missions', 'Sag calculator and tolerance gauge', 'Race clock simulator', 'Trail survey simulator', 'Algebra debugger', 'Race-Day Certification (6)', 'Optional complex-number extension'],
    skills: [...new Set(Object.values(raceDayQuestionSkills).flat())],
    tracking: { gameId: 'race-day-workshop', questions: raceDayQuestionSkills }
  },
  {
    id: 'ride-systems-lab',
    title: 'Ride Systems Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/ride-systems-lab/',
    image: null,
    home: 'alg2.function-notation',
    summary: 'Become a performance engineer: read a trail’s elevation profile as a function, chain drivetrain functions from cadence to speed, transform the profile, and work backward with inverse functions, then Engineer the Ride.',
    objectives: [
      'Explain what makes a relationship a function, and name its input and output',
      'Evaluate functions from equations, tables and graphs, and find domain and range',
      'Compose two functions, and explain why the order matters',
      'Describe how shifts, stretches and reflections change a graph',
      'Find and use an inverse, and restrict a domain so one exists'
    ],
    difficulty: ['intermediate', 'advanced'],
    minutes: '20-25 min',
    parts: ['4 missions', 'GPS trail explorer', 'Drivetrain simulator', 'Trail transformation studio', 'Inverse trail explorer', 'Engineer the Ride (14)', 'Optional function mixer'],
    skills: [...new Set(Object.values(rideQuestionSkills).flat())],
    tracking: { gameId: 'ride-systems-lab', questions: rideQuestionSkills }
  },
  {
    id: 'bike-park-blueprint-lab',
    title: 'Bike Park Blueprint Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/bike-park-blueprint-lab/',
    image: null,
    home: 'alg2.systems-of-equations',
    summary: 'Design a bike park with a trail crew: solve two- and three-variable systems for the build plan, run Gaussian elimination in a row-operation console, cost the whole park with matrix multiplication, and solve AX = B with an inverse.',
    objectives: [
      'Write and solve two-variable systems by graphing, substitution and elimination',
      'Tell one solution, no solution and infinitely many apart',
      'Solve three-variable systems with augmented matrices and row operations',
      'Add, subtract, scale and multiply matrices, checking dimensions',
      'Write a system as AX = B and solve it with an inverse when det ≠ 0'
    ],
    difficulty: ['intermediate', 'advanced'],
    minutes: '20-25 min',
    parts: ['4 missions', 'Blueprint graph', 'Matrix elimination console', 'Matrix cost calculator', 'Matrix equation solver', 'Final Build Plan (10)', 'Optional park optimizer'],
    skills: [...new Set(Object.values(parkQuestionSkills).flat())],
    tracking: { gameId: 'bike-park-blueprint-lab', questions: parkQuestionSkills }
  },
  {
    id: 'trail-dynamics-lab',
    title: 'Trail Dynamics Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/trail-dynamics-lab/',
    image: null,
    home: 'alg2.quadratic-graphs',
    summary: 'Model stopping distance as a quadratic and solve it backwards, rebuild a jump in standard, vertex and factored form, then find landing heights with square roots, completing the square, the quadratic formula and the discriminant, all the way to complex roots.',
    objectives: [
      'Model and interpret quadratic relationships, and reject solutions outside the domain',
      'Convert between standard, vertex and factored form and read each one’s features',
      'Solve by square roots, factoring, completing the square and the quadratic formula',
      'Use the discriminant to predict the number and type of solutions',
      'Interpret complex solutions, and solve a linear–quadratic system'
    ],
    difficulty: ['intermediate', 'advanced'],
    minutes: '20-25 min',
    parts: ['3 missions', 'Stopping distance simulator', 'Jump equation decoder and tuner', 'Trajectory height analyzer', 'Final Course Analysis (12)', 'Optional complex-number practice'],
    skills: [...new Set(Object.values(trailQuestionSkills).flat())],
    tracking: { gameId: 'trail-dynamics-lab', questions: trailQuestionSkills }
  },
  {
    id: 'pump-track-lab',
    title: 'Pump Track Profile Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/pump-track-lab/',
    image: null,
    home: 'alg2.polynomial-graphs',
    summary: 'Decode a pump track profile’s degree, end behavior and turning points, combine and expand polynomial profiles, find zeros and multiplicity with the Rational Zero Theorem, then divide it apart with synthetic and long division and the Remainder and Factor Theorems.',
    objectives: [
      'Recognize polynomials and read degree, leading coefficient, end behavior and turning points',
      'Add, subtract and multiply polynomials, and expand factored form to standard form',
      'Find zeros, use multiplicity to tell crossing from touching, and build a polynomial from its zeros',
      'Use the Rational Zero Theorem, synthetic division and long division',
      'Apply the Remainder and Factor Theorems, and count complex zeros'
    ],
    difficulty: ['intermediate', 'advanced'],
    minutes: '25-30 min',
    parts: ['4 missions', 'Flow line decoder', 'Expansion workbench and factor builder', 'Synthetic division console', 'Final Track Analysis (12)', 'Optional complex-zeros extension'],
    skills: [...new Set(Object.values(pumpQuestionSkills).flat())],
    tracking: { gameId: 'pump-track-lab', questions: pumpQuestionSkills }
  },
  {
    id: 'enduro-route-lab',
    title: 'Enduro Route Intelligence Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/enduro-route-lab/',
    image: null,
    home: 'alg2.graphing-rational-functions',
    summary: 'Model enduro stage times with rational functions: domain, asymptotes and holes, adding, subtracting, multiplying and dividing rational expressions, and solving for a target time. Then survey trail distances and wheel geometry with radical functions, transformations, rational exponents and extraneous solutions.',
    objectives: [
      'Model inverse variation and stage times with rational functions, and read their domain, range and asymptotes',
      'Add, subtract, multiply, divide and simplify rational expressions, and find removable discontinuities',
      'Solve rational equations and reject candidates outside the context',
      'Model distances and a wheel with radical functions; find domain, range and transformations',
      'Convert rational exponents, solve radical equations, and identify extraneous solutions'
    ],
    difficulty: ['intermediate', 'advanced'],
    minutes: '25-30 min',
    parts: ['4 missions', 'Race clock and asymptote explorer', 'Split-time simulator and rational workbench', 'Trail survey and radical equation solver', 'Wheel explorer and radical profile studio', 'Final Route Analysis (12)', 'Optional route data diagnostic'],
    skills: [...new Set(Object.values(enduroQuestionSkills).flat())],
    tracking: { gameId: 'enduro-route-lab', questions: enduroQuestionSkills }
  },
  {
    id: 'suspension-systems-lab',
    title: 'Suspension & Systems Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/suspension-systems-lab/',
    image: null,
    home: 'alg2.exponential-growth-and-decay',
    summary: 'Model a shock’s shrinking rebound peaks as a geometric sequence and a continuous e-based envelope, forecast a trail festival’s registrations, and use logarithms, log properties and change of base to decode decibels and solve for time.',
    objectives: [
      'Tell exponential from linear change, and identify initial values and growth or decay factors',
      'Write geometric sequences explicitly and recursively, and connect them to continuous models with base e',
      'Transform exponential graphs and find their asymptotes, domain and range',
      'Convert between exponential and logarithmic form, and use log properties and change of base',
      'Solve exponential and logarithmic equations, and interpret logarithmic scales like decibels'
    ],
    difficulty: ['intermediate', 'advanced'],
    minutes: '20-25 min',
    parts: ['3 missions', 'Suspension decay simulator', 'Event growth simulator and target calculator', 'Decibel analyzer and logarithm workbench', 'Final Engineering Report (12)', 'Optional advanced engineering bench'],
    skills: [...new Set(Object.values(suspensionQuestionSkills).flat())],
    tracking: { gameId: 'suspension-systems-lab', questions: suspensionQuestionSkills }
  },
  {
    id: 'race-intelligence-lab',
    title: 'Enduro Race Intelligence Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/race-intelligence-lab/',
    image: null,
    home: 'alg2.statistical-analysis',
    summary: 'Analyse simulated enduro race data: two-way tables, the addition rule, conditional probability and independence; mean, median, standard deviation, the normal model and z-scores; random samples, standard error and margin of error; and a seeded randomization test for an experiment.',
    objectives: [
      'Use two-way tables for joint, marginal and conditional probabilities, the addition rule and independence',
      'Compare distributions by center and spread, and use the normal model, empirical rule, z-scores and percentiles',
      'Distinguish populations and samples, and estimate a proportion with standard error and margin of error',
      'Distinguish surveys, observational studies and randomized experiments, and judge significance by simulation',
      'Evaluate statistical claims, including why association isn’t causation'
    ],
    difficulty: ['intermediate', 'advanced'],
    minutes: '30-35 min',
    parts: ['4 missions', 'Race outcome explorer and conditional filter', 'Consistency analyzer and bell curve', 'Survey simulator and margin of error explorer', 'Treatment shuffle simulator', 'Final Race Intelligence Report (14)', 'Optional podium probability challenge'],
    skills: [...new Set(Object.values(raceQuestionSkills).flat())],
    tracking: { gameId: 'race-intelligence-lab', questions: raceQuestionSkills }
  },

  // ---------- Physics (content/classes/physics.mjs) ----------
  {
    id: 'intro-to-physics',
    title: 'Introduction to Physics',
    type: 'lesson',
    status: 'live',
    access: 'public',
    route: 'learning-lab/intro-to-physics/',
    image: null,
    home: 'phys1.introduction-to-physics',
    summary: 'Find the physics hiding on the trail, ride one run through seven physics lessons, then learn how physicists choose systems, build models and design experiments, and become a physics detective.',
    objectives: [
      'Explain what physics studies, with riding examples',
      'Choose a physical system and say what a model leaves out',
      'Plan an investigation with independent, dependent and controlled variables',
      'Connect the branches of physics to the bike'
    ],
    difficulty: ['beginner', 'intermediate'],
    minutes: '35-45 min',
    parts: ['7 sections', 'Find the Physics', 'One ride, seven lessons', 'Experiment designer', 'Knowledge check (8)', 'Physics Detective'],
    skills: [...new Set(Object.values(introQuestionSkills).flat())],
    broadSkill: 'physics',
    tracking: { gameId: 'intro-to-physics', questions: introQuestionSkills }
  },
  {
    id: 'newtons-laws',
    title: 'Newton’s Laws of Motion',
    type: 'lesson',
    status: 'live',
    access: 'public',
    route: 'learning-lab/newtons-laws/',
    image: null,
    home: 'phys1.newtons-laws',
    summary: 'Seven short sections on forces, inertia, F = ma and action-reaction, with free-body diagrams you build yourself, the MTB Force Lab, a knowledge check and a climbing challenge.',
    objectives: [
      'Explain Newton’s three laws with mountain biking examples',
      'Use F_net = ma and W = mg',
      'Build free-body diagrams, on the flat and on a slope',
      'Calculate net force and acceleration on a climb'
    ],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    minutes: '45-60 min',
    parts: ['7 sections', 'Free-body diagram builder', 'MTB Force Lab', 'Knowledge check (8)', 'Final challenge'],
    skills: [...new Set(Object.values(newtonQuestionSkills).flat())],
    // Not a Lab tool: its question kinds are registered by curriculum.sql,
    // filed under the broad 'forces-motion' skill.
    broadSkill: 'forces-motion',
    tracking: { gameId: 'newtons-laws', questions: newtonQuestionSkills }
  },
  // These are Lab tools (js/tools-config.js, `tool`), so their question
  // kinds are already registered in supabase/progress.sql; curriculum.sql
  // only links them to physics skills. check-site.mjs checks every kind.
  {
    id: 'jump-lab',
    tool: 'jump-lab',
    title: 'Jump Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/jump-lab/',
    image: 'assets/jump-lab.jpg',
    home: 'phys1.projectile-motion',
    summary: 'Set the speed, angle and heights of a jump, predict where the rider lands, then send it and check the projectile-motion maths.',
    objectives: [
      'Split a takeoff velocity into horizontal and vertical components',
      'Predict flight time, peak height and landing point',
      'Explain how speed and angle change a trajectory'
    ],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    minutes: '15-30 min',
    parts: ['Jump simulator', 'Predictions', 'Missions (5)'],
    skills: [...new Set(Object.values(JUMP_LAB).flat())],
    tracking: { gameId: 'jump-lab', questions: JUMP_LAB }
  },
  {
    id: 'berm-lab',
    tool: 'berm-lab',
    title: 'Berm Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/berm-lab/',
    image: 'assets/berm-lab.jpg',
    home: 'phys1.uniform-circular-motion',
    summary: 'Pick a tight, middle or wide line, set your speed and bank the berm, then watch the forces, lean and grip demand of a corner change.',
    objectives: [
      'Calculate centripetal acceleration and force',
      'Explain why speed matters more than radius',
      'Find the bank angle where a turn needs no friction'
    ],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    minutes: '15-30 min',
    parts: ['Corner simulator', 'Graphs', 'Challenges (6)'],
    skills: [...new Set(Object.values(BERM_LAB).flat())],
    tracking: { gameId: 'berm-lab', questions: BERM_LAB }
  },
  {
    id: 'gear-ratio-lab',
    tool: 'gear-ratio-lab',
    title: 'Gear Ratio Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/gear-ratio-lab/',
    image: 'assets/gear-ratio-lab.jpg',
    home: 'phys1.rotational-dynamics',
    summary: 'Gear a race bike for a course, then work out ratios, speeds and times to beat a rival.',
    objectives: [
      'Calculate gear ratios and distance per crank turn',
      'Find speed from cadence and gearing',
      'Convert wheel speed to angular speed'
    ],
    difficulty: ['intermediate', 'advanced'],
    minutes: '30-45 min',
    parts: ['Race bike setup', 'Lab sheet', 'Tune-up prediction'],
    skills: [...new Set(Object.values(GEAR_LAB).flat())],
    tracking: { gameId: 'gear-ratio-lab', questions: GEAR_LAB }
  }
];
