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
//              to the curriculum skill ids each one practices. These are
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
// Questions that practice something more specific than their objective.
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

// Map the Line (the Slope Lab, extended to all of Unit 3): its own question
// kinds and ideas (learning-lab/slope-lab/logic/questions.js). The original
// 32 questions keep the finer mapping above; ids are lower case, as recorded.
import { questionKinds as mapKinds } from '../../learning-lab/slope-lab/logic/questions.js';
const CP = 'alg1.coordinate-plane.', GOP = 'alg1.graphing-ordered-pairs.', PNS = 'alg1.positive-and-negative-slope.', LR = 'alg1.linear-relationships.', PR = 'alg1.proportional-relationships.';
const MAP_IDEAS = {
  axes:              [CP + 'read-axes'],
  quadrants:         [CP + 'read-axes'],
  'read-points':     [CP + 'name-points'],
  scales:            [CP + 'scales'],
  plot:              [GOP + 'plot-points', GOP + 'table-to-graph'],
  'read-graph':      [GOP + 'table-to-graph', CP + 'name-points'],
  patterns:          [GOP + 'describe-patterns'],
  slope:             [S + 'slope-as-rate', S + 'calculate-two-points'],
  grade:             [S + 'real-world-slope'],
  'slope-sign':      [S + 'interpret-sign', PNS + 'classify-slope', PNS + 'direction'],
  'constant-rate':   [LR + 'constant-rate'],
  linear:            [LR + 'linear-from-table'],
  representations:   [LR + 'compare-representations'],
  proportional:      [PR + 'proportional-or-not', PR + 'write-y-equals-kx'],
  'k-value':         [PR + 'constant-of-proportionality']
};
const legacySlope = Object.fromEntries(Object.entries(slopeQuestionSkills).map(([q, ss]) => [q.toLowerCase(), ss]));
const mapQuestionSkills = Object.fromEntries(Object.entries(mapKinds()).map(([q, ideas]) => [q, legacySlope[q] || [...new Set([...ideas.flatMap(i => MAP_IDEAS[i] || []), ...(/^(tr-und|fc-und)$/.test(q) ? [PNS + 'undefined-slope'] : [])])]]));

// Jump Trajectory Lab: the lab lists its own question kinds and the ideas
// each practices; here those ideas become curriculum skills.
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
// -> physics skills. Kinds that don't practice physics are left out.
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
// practices (learning-lab/newtons-laws/logic/lesson.js); here those ideas
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
// ids and the ideas each practices (learning-lab/race-day-workshop/logic/questions.js);
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

// The Dream Line Project: tracked ideas -> curriculum skills
// (learning-lab/dream-line-project/logic/questions.js).
import { questionKinds as dreamKinds } from '../../learning-lab/dream-line-project/logic/questions.js';
const VAE = 'alg1.variables-and-expressions.', EVE = 'alg1.evaluating-expressions.', OOO = 'alg1.order-of-operations.', PRN = 'alg1.properties-of-real-numbers.';
const DREAM_IDEAS = {
  'write-expr':         [VAE + 'write-expressions'],
  parts:                [VAE + 'identify-parts'],
  interpret:            [VAE + 'interpret-expressions'],
  substitute:           [EVE + 'substitute-values'],
  negatives:            [EVE + 'evaluate-with-negatives'],
  'fractions-decimals': [EVE + 'evaluate-with-negatives'],
  formulas:             [EVE + 'evaluate-formulas'],
  order:                [OOO + 'apply-order'],
  grouping:             [OOO + 'grouping-symbols'],
  errors:               [OOO + 'spot-errors'],
  'number-sets':        [PRN + 'classify-numbers'],
  properties:           [PRN + 'name-properties'],
  distributive:         [PRN + 'distributive-property'],
  'like-terms':         [PRN + 'distributive-property']
};
const dreamQuestionSkills = Object.fromEntries(Object.entries(dreamKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => DREAM_IDEAS[i] || []))]]));

// The Dream Line Goes Pro: tracked ideas -> curriculum skills
// (learning-lab/dream-line-goes-pro/logic/questions.js).
import { questionKinds as proKinds } from '../../learning-lab/dream-line-goes-pro/logic/questions.js';
const OSE = 'alg1.one-step-equations.', MSE = 'alg1.multi-step-equations.', VBS = 'alg1.variables-on-both-sides.', LIT = 'alg1.literal-equations.', INQ = 'alg1.inequalities.';
const PRO_IDEAS = {
  inverse:            [OSE + 'inverse-operations'],
  check:              [OSE + 'check-solutions'],
  'write-one':        [OSE + 'write-one-step'],
  'multi-step':       [MSE + 'solve-multi-step'],
  distribute:         [MSE + 'distribute-and-combine'],
  'write-multi':      [MSE + 'model-and-solve'],
  'both-sides':       [VBS + 'collect-variables'],
  special:            [VBS + 'special-cases'],
  'when-equal':       [VBS + 'catch-up-problems'],
  rearrange:          [LIT + 'solve-for-variable', LIT + 'rearrange-formulas'],
  'use-formula':      [LIT + 'use-rearranged'],
  inequality:         [INQ + 'solve-inequalities'],
  flip:               [INQ + 'solve-inequalities'],
  'graph-inequality': [INQ + 'graph-inequalities'],
  compound:           [INQ + 'compound-inequalities'],
  constraints:        [INQ + 'model-constraints']
};
const proQuestionSkills = Object.fromEntries(Object.entries(proKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => PRO_IDEAS[i] || []))]]));

// Frame the Line: tracked ideas -> curriculum skills
// (learning-lab/frame-the-line/logic/questions.js), plus a few questions that
// practice a more specific skill than their idea.
import { questionKinds as filmKinds } from '../../learning-lab/frame-the-line/logic/questions.js';
const WLE = 'alg1.writing-linear-equations.', SIF = 'alg1.slope-intercept-form.', PSF = 'alg1.point-slope-form.', GLE = 'alg1.graphing-linear-equations.', DRA = 'alg1.domain-and-range.', FNO = 'alg1.function-notation.';
const FILM_IDEAS = {
  'write-eq':    [WLE + 'from-context'],
  'slope-int':   [SIF + 'identify-m-and-b'],
  'context-mb':  [SIF + 'interpret-m-and-b'],
  rearrange:     [SIF + 'rewrite-to-slope-intercept'],
  'point-slope': [PSF + 'write-point-slope'],
  convert:       [PSF + 'convert-forms'],
  graph:         [GLE + 'graph-slope-intercept'],
  intercepts:    [GLE + 'graph-intercepts'],
  'hv-lines':    [GLE + 'horizontal-vertical'],
  domain:        [DRA + 'reasonable-domain'],
  range:         [DRA + 'find-domain-range'],
  interval:      [DRA + 'interval-notation'],
  'is-function': [FNO + 'is-it-a-function'],
  evaluate:      [FNO + 'evaluate-f-of-x'],
  'fn-context':  [FNO + 'interpret-notation']
};
const FILM_EXTRA = {
  'w-sp-b': [WLE + 'from-slope-and-point'], 'w-sp-eq': [WLE + 'from-slope-and-point'],
  'w-2p-m': [WLE + 'from-two-points'], 'w-2p-b': [WLE + 'from-two-points'], 'w-2p-eq': [WLE + 'from-two-points'], 'wx-m': [WLE + 'from-two-points'], 'wx-eq': [WLE + 'from-two-points'], 'fa-2pt': [WLE + 'from-two-points'],
  'ps-choose-a': [PSF + 'choose-a-form'], 'ps-choose-b': [PSF + 'choose-a-form'],
  'dr-g-dom': [DRA + 'find-domain-range'], 'dr-dots': [DRA + 'find-domain-range'], 'dr-table': [DRA + 'find-domain-range']
};
const filmQuestionSkills = Object.fromEntries(Object.entries(filmKinds()).map(([q, ideas]) => [q, [...new Set([...ideas.flatMap(i => FILM_IDEAS[i] || []), ...(FILM_EXTRA[q] || [])])]]));

// Uplift: tracked ideas -> curriculum skills (learning-lab/uplift/logic/questions.js).
import { questionKinds as upliftKinds } from '../../learning-lab/uplift/logic/questions.js';
const GSY = 'alg1.graphing-systems.', SUB = 'alg1.substitution.', ELI = 'alg1.elimination.', APS = 'alg1.applications-of-systems.';
const UPLIFT_IDEAS = {
  'graph-solve':   [GSY + 'solve-by-graphing'],
  'num-solutions': [GSY + 'number-of-solutions'],
  interpret:       [GSY + 'interpret-intersection'],
  substitute:      [SUB + 'solve-by-substitution'],
  'choose-var':    [SUB + 'choose-variable'],
  verify:          [SUB + 'check-system-solution'],
  eliminate:       [ELI + 'solve-by-elimination'],
  scale:           [ELI + 'scale-equations'],
  method:          [ELI + 'choose-method'],
  model:           [APS + 'model-with-systems'],
  'break-even':    [APS + 'break-even'],
  mixture:         [APS + 'mixture-and-rate'],
  rate:            [APS + 'mixture-and-rate']
};
const upliftQuestionSkills = Object.fromEntries(Object.entries(upliftKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => UPLIFT_IDEAS[i] || []))]]));

// Project Evolve: tracked ideas -> curriculum skills (learning-lab/project-evolve/logic/questions.js).
import { questionKinds as evolveKinds } from '../../learning-lab/project-evolve/logic/questions.js';
const EXR = 'alg1.exponent-rules.', SCN = 'alg1.scientific-notation.', EXG = 'alg1.exponential-growth.', EXD = 'alg1.exponential-decay.';
const EVOLVE_IDEAS = {
  repeated: [EXR + 'product-quotient-rules'], product: [EXR + 'product-quotient-rules'], quotient: [EXR + 'product-quotient-rules'],
  'power-power': [EXR + 'power-rules'], 'power-product': [EXR + 'power-rules'],
  zero: [EXR + 'zero-negative-exponents'], negative: [EXR + 'zero-negative-exponents'],
  'to-sci': [SCN + 'convert-notation'], 'to-standard': [SCN + 'convert-notation'],
  'sci-multiply': [SCN + 'compute-scientific'], 'sci-divide': [SCN + 'compute-scientific'],
  compare: [SCN + 'compare-magnitudes'], units: [SCN + 'compare-magnitudes'],
  'growth-identify': [EXG + 'identify-growth'], 'growth-factor': [EXG + 'identify-growth'],
  'growth-model': [EXG + 'write-growth-model'], 'growth-evaluate': [EXG + 'write-growth-model'],
  'lin-vs-exp': [EXG + 'linear-vs-exponential'],
  'decay-identify': [EXD + 'identify-decay'], 'decay-factor': [EXD + 'identify-decay'], 'decay-compare': [EXD + 'identify-decay'], limits: [EXD + 'identify-decay'],
  'decay-model': [EXD + 'write-decay-model'], 'decay-evaluate': [EXD + 'write-decay-model'],
  target: [EXD + 'half-life-style']
};
const evolveQuestionSkills = Object.fromEntries(Object.entries(evolveKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => EVOLVE_IDEAS[i] || []))]]));

// Wrap Lab: tracked ideas -> curriculum skills (learning-lab/wrap-lab/logic/questions.js).
import { questionKinds as wrapKinds } from '../../learning-lab/wrap-lab/logic/questions.js';
const ASP = 'alg1.adding-and-subtracting-polynomials.', MUP = 'alg1.multiplying-polynomials.', FEX = 'alg1.factoring-expressions.', FQD = 'alg1.factoring-quadratics.';
const WRAP_IDEAS = {
  classify: [ASP + 'classify-polynomials'], 'like-terms': [ASP + 'add-polynomials'], add: [ASP + 'add-polynomials'], subtract: [ASP + 'subtract-polynomials'],
  'mono-mult': [MUP + 'multiply-polynomials'], binomial: [MUP + 'multiply-binomials'], 'square-sum': [MUP + 'special-products'], 'diff-squares-x': [MUP + 'special-products'], 'poly-mult': [MUP + 'multiply-polynomials'],
  gcf: [FEX + 'gcf'], grouping: [FEX + 'grouping'], verify: [FEX + 'check-factoring'],
  monic: [FQD + 'factor-x2-bx-c'], 'non-monic': [FQD + 'factor-ax2-bx-c'], 'perfect-square': [FQD + 'special-patterns'], 'diff-squares': [FQD + 'special-patterns'], prime: [FQD + 'factor-x2-bx-c']
};
const wrapQuestionSkills = Object.fromEntries(Object.entries(wrapKinds()).map(([q, ideas]) => [q, [...new Set(ideas.flatMap(i => WRAP_IDEAS[i] || []))]]));

export const ACTIVITIES = [
  {
    id: 'slope-lab',
    title: 'Map the Line',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/slope-lab/',
    image: null,
    home: 'alg1.slope-and-rate-of-change',
    summary: 'The MTB Ride Data Lab (the Slope & Linear Relationships Lab, extended): map a trail network on the coordinate plane, plot GPS and elevation data, measure slope and grade with the rise-over-run visualizer, read climbs, descents and flats, tell linear from nonlinear data, and discover y = kx at a steady pace. Includes the original slope practice bank and transfer challenge.',
    objectives: [
      'Read and plot coordinates in all four quadrants, including maps with different axis scales',
      'Plot tables of values, read elevation profiles, and describe patterns',
      'Calculate slope and percentage grade from points, tables, graphs and words',
      'Interpret positive, negative, zero and undefined slope',
      'Recognize constant rates of change and connect words, tables, graphs and equations',
      'Identify proportional relationships, find k, and tell proportional from linear'
    ],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    minutes: '40-55 min',
    parts: ['6 stages', 'Mountain map and GPS plotting', 'Linked map and elevation profile', 'Rise-over-run visualizer', 'Trail profile designer', 'Ride data dashboard', 'Ultimate Ride Analysis Challenge (14)', 'Original practice bank (32)'],
    skills: [...new Set(Object.values(mapQuestionSkills).flat())],
    stages: {
      'alg1.coordinate-plane': { route: 'scout', label: 'Stage 1: Scout the Mountain' },
      'alg1.graphing-ordered-pairs': { route: 'plot', label: 'Stage 2: Plot Your Line' },
      'alg1.slope-and-rate-of-change': { route: 'grade', label: 'Stage 3: Measure the Grade' },
      'alg1.positive-and-negative-slope': { route: 'terrain', label: 'Stage 4: Read the Terrain' },
      'alg1.linear-relationships': { route: 'data', label: 'Stage 5: Analyze Rider Data' },
      'alg1.proportional-relationships': { route: 'flow', label: 'Stage 6: Find Your Flow' }
    },
    tracking: { gameId: 'slope-lab', questions: mapQuestionSkills }
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

  {
    id: 'dream-line-project',
    title: 'The Dream Line Project',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/dream-line-project/',
    image: null,
    home: 'alg1.variables-and-expressions',
    summary: 'Design your own mountain bike park, then use algebra to plan it: write and take apart the build-plan expression, substitute crew-hours, elevations, fractions and decimals, simplify the inventory with the order of operations, and use number sets and the properties of real numbers to simplify the builder’s calculations.',
    objectives: [
      'Translate written descriptions into expressions, and identify variables, coefficients, constants and terms',
      'Substitute values and evaluate expressions with integers, negatives, fractions and decimals',
      'Apply the order of operations with parentheses, brackets, exponents and fraction bars, and find calculation mistakes',
      'Classify numbers as natural, whole, integer, rational or irrational',
      'Use the commutative, associative, identity, inverse and distributive properties, and combine like terms'
    ],
    difficulty: ['beginner', 'intermediate'],
    minutes: '35-50 min',
    parts: ['4 stages', 'Park design canvas and build plan', 'Expression builder and anatomy', 'Prediction-first evaluation challenges', 'Shaper’s Calculation Board', 'Number-set diagram and properties workshop', 'Final Algebra Certification (10)', 'Finished park blueprint'],
    skills: [...new Set(Object.values(dreamQuestionSkills).flat())],
    tracking: { gameId: 'dream-line-project', questions: dreamQuestionSkills }
  },

  {
    id: 'dream-line-goes-pro',
    title: 'The Dream Line Goes Pro',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/dream-line-goes-pro/',
    image: null,
    home: 'alg1.one-step-equations',
    summary: 'The Dream Line Project, engineered: solve for missing setup measurements on an equation balance, plan construction with multi-step equations, compare park designs with variables on both sides, rearrange speed, trail-grade and suspension-sag formulas, and keep the park within its budget and design limits with inequalities.',
    objectives: [
      'Solve one-step equations with inverse operations, and check solutions by substitution',
      'Solve multi-step equations with distribution and like terms, and write them from situations',
      'Solve equations with variables on both sides, including no-solution and identity cases',
      'Rearrange real formulas (d = rt, G = 100R/L, P = 100S/T) and use them with units',
      'Solve, graph and interpret inequalities, including sign reversal and compound inequalities'
    ],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    minutes: '40-55 min',
    parts: ['5 stages', 'Equation balance and multi-step solver', 'Design Showdown graph', 'Formula Garage', 'Number Line Studio', 'Final Park Engineer Certification (10)', 'Continues your Unit 1 park'],
    skills: [...new Set(Object.values(proQuestionSkills).flat())],
    stages: {
      'alg1.one-step-equations': { route: 'garage', label: 'Stage 1: The Setup Garage' },
      'alg1.multi-step-equations': { route: 'crew', label: 'Stage 2: The Build Crew' },
      'alg1.variables-on-both-sides': { route: 'showdown', label: 'Stage 3: The Design Showdown' },
      'alg1.literal-equations': { route: 'formula', label: 'Stage 4: The Formula Garage' },
      'alg1.inequalities': { route: 'operations', label: 'Stage 5: Park Operations' }
    },
    tracking: { gameId: 'dream-line-goes-pro', questions: proQuestionSkills }
  },

  {
    id: 'frame-the-line',
    title: 'Frame the Line',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/frame-the-line/',
    image: null,
    home: 'alg1.writing-linear-equations',
    summary: 'The MTB Film Studio: produce a fictional mountain bike film and model it with linear equations. Write the budget from descriptions, points, tables and graphs, read slope-intercept and point-slope forms, graph the budget and storage models, set the production limits with domain and range, and direct the film with function notation.',
    objectives: [
      'Write linear equations from a description, a slope and a point, two points, a table and a graph',
      'Identify and interpret the slope and y-intercept, and rewrite equations in slope-intercept form',
      'Write equations in point-slope form, convert between forms, and choose a useful form',
      'Graph lines from slope and intercept or from intercepts, including horizontal and vertical lines',
      'Find reasonable domains and ranges, discrete or continuous, in interval and inequality notation',
      'Evaluate and interpret function notation, and decide whether a relation is a function'
    ],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    minutes: '45-55 min',
    parts: ['6 stages', 'Film production studio', 'Budget explorer', 'Point-slope builder', 'Vertical line test', 'Director’s dashboard', 'Film Producer Certification (12)', 'Your MTB Film production board'],
    skills: [...new Set(Object.values(filmQuestionSkills).flat())],
    stages: {
      'alg1.writing-linear-equations': { route: 'plan', label: 'Stage 1: Plan the Production' },
      'alg1.slope-intercept-form': { route: 'budget', label: 'Stage 2: Understand the Budget' },
      'alg1.point-slope-form': { route: 'checkpoint', label: 'Stage 3: Calculate Mid-Project Costs' },
      'alg1.graphing-linear-equations': { route: 'graph', label: 'Stage 4: Build the Production Graph' },
      'alg1.domain-and-range': { route: 'limits', label: 'Stage 5: Manage the Production Limits' },
      'alg1.function-notation': { route: 'direct', label: 'Stage 6: Direct the Film' }
    },
    tracking: { gameId: 'frame-the-line', questions: filmQuestionSkills }
  },

  {
    id: 'uplift',
    title: 'Uplift',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/uplift/',
    image: null,
    home: 'alg1.graphing-systems',
    summary: 'The Ultimate Bike Park Operations Challenge: run a fictional mountain bike destination. Compare shuttle plans on a live pricing graph, stock the rental fleet by substitution, price workshop parts by elimination, then mix trail dirt, race two trail crews and solve break-even problems with whichever method fits.',
    objectives: [
      'Solve systems by graphing, and recognize one, no or infinitely many solutions',
      'Interpret an intersection in context',
      'Solve by substitution, choosing which variable to isolate, and check a solution in both equations',
      'Solve by elimination, multiplying equations to line up coefficients',
      'Choose between graphing, substitution and elimination',
      'Write and solve systems for break-even, mixture and rate problems'
    ],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    minutes: '40-55 min',
    parts: ['4 stages', 'Operations HQ', 'Live pricing graph', 'Substitution and elimination workbenches', 'Dirt mixing station', 'Crew progress simulator', 'Mountain Operations Certification (10)', 'Opening Day Command Center'],
    skills: [...new Set(Object.values(upliftQuestionSkills).flat())],
    stages: {
      'alg1.graphing-systems': { route: 'shuttle', label: 'Stage 1: The Uplift Showdown' },
      'alg1.substitution': { route: 'fleet', label: 'Stage 2: Build the Rental Fleet' },
      'alg1.elimination': { route: 'workshop', label: 'Stage 3: Stock the Workshop' },
      'alg1.applications-of-systems': { route: 'mountain', label: 'Stage 4: Run the Mountain' }
    },
    tracking: { gameId: 'uplift', questions: upliftQuestionSkills }
  },

  {
    id: 'project-evolve',
    title: 'Project Evolve',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/project-evolve/',
    image: null,
    home: 'alg1.exponent-rules',
    summary: 'The MTB Innovation Lab: help a fictional bike company take a new gravity bike from prototype to used market. Simplify scaling expressions with the exponent rules, handle huge test datasets and tiny measurements in scientific notation, model a launch waitlist growing 20% a month, and track the bike’s modeled resale value as it decays, estimating targets from tables (no logarithms).',
    objectives: [
      'Use exponents as repeated multiplication, and apply the product, quotient and power rules',
      'Simplify zero and negative integer exponents (a negative exponent is a reciprocal)',
      'Convert between standard and scientific notation, and multiply, divide and compare in it',
      'Write and evaluate growth models y = a(1 + r)ᵗ and tell linear from exponential growth',
      'Write and evaluate decay models y = a(1 − r)ᵗ, telling the rate from the retention factor',
      'Estimate when a model reaches a target from a table or graph'
    ],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    minutes: '35-50 min',
    parts: ['4 stages', 'CAD scaling lab', 'Factor board', 'Test rig and converter', 'Launch growth tracker', 'Resale value simulator', 'MTB Product Innovation Certification (12)', 'Product Lifecycle Report'],
    skills: [...new Set(Object.values(evolveQuestionSkills).flat())],
    stages: {
      'alg1.exponent-rules': { route: 'prototype', label: 'Stage 1: Prototype Design Lab' },
      'alg1.scientific-notation': { route: 'testlab', label: 'Stage 2: Engineering Test Lab' },
      'alg1.exponential-growth': { route: 'launch', label: 'Stage 3: Product Launch' },
      'alg1.exponential-decay': { route: 'market', label: 'Stage 4: The Used Market' }
    },
    tracking: { gameId: 'project-evolve', questions: evolveQuestionSkills }
  },

  {
    id: 'wrap-lab',
    title: 'Wrap Lab',
    type: 'lab',
    status: 'live',
    access: 'public',
    route: 'learning-lab/wrap-lab/',
    image: null,
    home: 'alg1.adding-and-subtracting-polynomials',
    summary: 'The Custom MTB Frame Protection Studio: design a frame protection kit for a mountain bike. Classify, add and subtract panel-area polynomials with algebra tiles, expand graphics with the area model and special products, optimize cut sheets with the GCF and grouping, and recover panel dimensions by factoring quadratics, checking every factorization by multiplying back.',
    objectives: [
      'Classify polynomials by degree and number of terms, and add and subtract them (distributing the negative)',
      'Multiply monomials, binomials and polynomials, with the area model and special products',
      'Factor out the greatest common factor and factor by grouping',
      'Factor x² + bx + c and ax² + bx + c, perfect squares and differences of squares',
      'Check factorizations by multiplying back, and recognize quadratics that don’t factor over the integers'
    ],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    minutes: '40-55 min',
    parts: ['4 stages', 'Design studio and frame canvas', 'Algebra tile organizer', 'Binomial area model', 'GCF and grouping boards', 'Factor pair finder and tile builder', 'Custom Frame Designer Certification (12)', 'Custom MTB Armor Blueprint'],
    skills: [...new Set(Object.values(wrapQuestionSkills).flat())],
    stages: {
      'alg1.adding-and-subtracting-polynomials': { route: 'design', label: 'Stage 1: Design the Protection Kit' },
      'alg1.multiplying-polynomials': { route: 'expand', label: 'Stage 2: Expand the Graphics' },
      'alg1.factoring-expressions': { route: 'cutsheet', label: 'Stage 3: Optimize the Cut Sheets' },
      'alg1.factoring-quadratics': { route: 'reverse', label: 'Stage 4: Reverse Engineer the Panel' }
    },
    tracking: { gameId: 'wrap-lab', questions: wrapQuestionSkills }
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
