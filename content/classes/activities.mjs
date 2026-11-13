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
  }
];
