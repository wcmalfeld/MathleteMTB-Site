// Trail Dynamics Lab: every graded question. Answers come from the models
// (exact algebra in quadratic.js), never typed in by hand. Each has three
// progressive hints (concept, method, next step), a solution with its
// meaning on the trail, and traps: anticipated wrong answers with a
// misconception code and a message.

import { BRAKE, stopping, stopEquation, speedFor, J, JUMP, atHeight, RAMP, rampMeet, BRAKE_PRACTICE, FACTOR_PRACTICE, FINAL_SETS, pick, nf } from './models.js';
import { quad, solve, standardText, vertexText, factoredText, factorsOverIntegers, completeSquare, show, cx, cadd, csub, cmul, ctext, ipow } from './quadratic.js';
export { nf };

const opt = (id, text, correct, code, feedback) => ({ id, text, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const r2 = x => Math.round(x * 100) / 100;
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object' || !q.type) continue;
    for (const f of q.type === 'number' ? [q] : q.type === 'fields' ? q.fields : []) {
      const seen = new Set();
      f.traps = (f.traps || []).filter(t => { const k = Math.round(t.value * 1e6); const clash = Math.abs(t.value - f.answer) <= Math.max(f.tolerance || 0, 1e-9); if (seen.has(k) || clash || !isFinite(t.value)) return false; seen.add(k); return true; });
    }
  }
  return qs;
}
function arrange(qs) {
  for (const [id, q] of Object.entries(qs)) {
    if (!q || q.type !== 'choice' || q.keepOrder) continue;
    const k = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % q.options.length;
    q.options = q.options.slice(k).concat(q.options.slice(0, k));
  }
  return qs;
}
const rot = (list, n) => list.map((o, i, a) => a[(i + (n % (a.length - 1)) + 1) % a.length]);

export const IDEAS = {
  recognize: 'Recognizing quadratic relationships',
  features: 'Graph features (vertex, axis, zeros, max/min)',
  standard: 'Standard form',
  vertex: 'Vertex form',
  factored: 'Factored form',
  transform: 'Graph transformations',
  factoring: 'Factoring and the zero-product property',
  'complete-square': 'Completing the square',
  'square-root': 'The square root property',
  formula: 'The quadratic formula',
  discriminant: 'The discriminant',
  complex: 'Complex solutions',
  model: 'Quadratic modeling',
  interpret: 'Interpreting solutions in context',
  'domain-range': 'Domain and range',
  system: 'Linear–quadratic systems',
  'complex-arith': 'Complex number arithmetic'
};
// The PRD's fourteen tracked skills, in its order.
export const REPORT_IDEAS = ['recognize', 'features', 'standard', 'vertex', 'factored', 'transform', 'factoring', 'complete-square', 'square-root', 'formula', 'discriminant', 'complex', 'model', 'interpret'];

export const MISCONCEPTIONS = {
  linear: 'Assuming a quadratic relationship is linear (double the speed, double the distance)',
  'only-braking': 'Leaving out the reaction distance',
  'only-reaction': 'Leaving out the braking distance',
  units: 'Mixing up km/h and m/s',
  'form-confuse': 'Confusing standard and vertex forms',
  'vertex-sign': 'Misreading the sign in vertex form',
  'swap-vertex': 'Swapping the vertex coordinates',
  'roots-vs-vertex': 'Confusing the zeros with the vertex',
  'transform-wrong': 'Misreading a transformation',
  domain: 'Forgetting the real-world domain',
  'factor-sign': 'A sign error when factoring',
  'factor-pair': 'Using the wrong factor pair',
  'no-zpp': 'Forgetting the zero-product property',
  'no-divide-a': 'Forgetting to divide by the leading coefficient',
  'half-wrong': 'Taking half of the x-coefficient incorrectly',
  'no-square': 'Forgetting to square the half-coefficient',
  'constant-wrong': 'Mishandling the constant when completing the square',
  'one-root': 'Forgetting the ± (only one square root)',
  'abc-wrong': 'Misidentifying a, b or c',
  'neg-parens': 'Forgetting the brackets around a negative coefficient',
  'disc-wrong': 'Calculating the discriminant incorrectly',
  'radical-wrong': 'Simplifying a radical incorrectly',
  'forgot-2a': 'Not dividing everything by 2a',
  'no-complex': 'Thinking a negative discriminant means no solutions at all',
  'i-wrong': 'Misunderstanding i',
  'complex-simplify': 'Simplifying imaginary numbers incorrectly'
};

// ================================================================ Mission 1: The Brake Zone Lab
const A30 = stopping('A', 30), B30 = stopping('B', 30);
const SA = speedFor('A', 16.5), SB = speedFor('B', 21);
const EB = quad(3, 50, -4200), DB = Number(EB.disc);
const M1 = {
  'b-predict': {
    type: 'choice', ideas: ['recognize', 'model'],
    prompt: 'Before you see any equations: what do you think happens to the stopping distance when the riding speed doubles?',
    options: [
      opt('a', 'It more than doubles', true),
      opt('b', 'It doubles', false, 'linear', 'Check the table: at 20 km/h Model A needs 9 m; at 40 km/h it needs 26 m, nearly three times as far.'),
      opt('c', 'It stays about the same', false, 'linear', 'Faster riding always needs more room to stop in this model: 9 m at 20 km/h, 26 m at 40 km/h.'),
      opt('d', 'It halves', false, 'linear', 'More speed means more distance: the table goes up, not down.')
    ],
    hints: ['Look at the table for 20 and 40 km/h.', 'Model A: 9 m at 20 km/h, 26 m at 40 km/h.', 'Is 26 more or less than 2 × 9?'],
    solution: 'It more than doubles. The braking part grows with the square of speed, so doubling speed makes it four times as big. The reaction part only doubles, which is why the total lands between ×2 and ×4.'
  },
  'b-ratio': {
    type: 'number', ideas: ['recognize'], answer: stopping('A', 40).braking / stopping('A', 20).braking, tolerance: 0.001, label: 'B(40) ÷ B(20)',
    prompt: 'Model A’s braking part is B(v) = 0.01v². How many times bigger is B(40) than B(20)?',
    traps: [{ value: 2, code: 'linear', message: 'The speed doubles, but B uses v²: (2v)² = 4v².' }, { value: 16 - 4, code: 'linear', message: 'That’s the difference (16 − 4). The question asks how many times bigger.' }],
    hints: ['Work out each one: B(20) and B(40).', 'B(20) = 0.01 × 400 = 4; B(40) = 0.01 × 1600 = 16.', '16 ÷ 4 = ?'],
    solution: 'B(40) = 16 m and B(20) = 4 m: four times as much. In general B(2v) = k(2v)² = 4kv².'
  },
  'b-double': {
    type: 'choice', ideas: ['recognize', 'model'],
    prompt: 'Which is B(2v) for B(v) = kv²?',
    options: [opt('a', '4kv²', true), opt('b', '2kv²', false, 'linear', 'The 2 is inside the square too: (2v)² = 4v².'), opt('c', 'kv² + 2', false, 'linear', 'B(2v) means put 2v in place of v.'), opt('d', '2k²v²', false, 'linear', 'Only v is replaced; k stays k.')],
    hints: ['Replace v with 2v.', 'B(2v) = k(2v)².', '(2v)² = 4v².'],
    solution: 'B(2v) = k(2v)² = 4kv²: double the speed, four times the braking distance in this model.'
  },
  'b-reaction': {
    type: 'number', ideas: ['model'], answer: A30.reaction, tolerance: 0.01, unit: 'm', label: 'R(30)',
    prompt: `Reaction distance: R(v) = (${BRAKE.reaction} ÷ 3.6)v = 0.25v. How far does the bike travel during the reaction time at 30 km/h?`,
    traps: [{ value: BRAKE.reaction * 30, code: 'units', message: 'km/h has to become m/s first: divide by 3.6. That’s what 0.9 ÷ 3.6 = 0.25 does.' }, { value: A30.total, code: 'only-reaction', message: 'That’s the total. The reaction part alone is 0.25v.' }],
    hints: ['R(v) = 0.25v.', 'Substitute v = 30.', '0.25 × 30 = ?'],
    solution: `R(30) = 0.25 × 30 = ${nf(A30.reaction)} m: the distance covered before the brakes even start working.`
  },
  'b-total': {
    type: 'number', ideas: ['model'], answer: B30.total, tolerance: 0.01, unit: 'm', label: 'D_B(30)',
    prompt: 'Total stopping distance under Model B at 30 km/h: D_B(v) = 0.015v² + 0.25v.',
    traps: [{ value: B30.braking, code: 'only-braking', message: 'That’s the braking part. Add the reaction distance (7.5 m).' }, { value: B30.reaction, code: 'only-reaction', message: 'That’s the reaction part. Add the braking part, 0.015 × 30².' }, { value: A30.total, code: 'form-confuse', message: 'That’s Model A. Use k = 0.015.' }],
    hints: ['Total = braking + reaction.', '0.015 × 900 = 13.5.', '13.5 + 7.5 = ?'],
    solution: `D_B(30) = 13.5 + 7.5 = ${nf(B30.total)} m.`
  },
  'b-compare': {
    type: 'choice', ideas: ['model', 'transform'],
    prompt: 'Which model has the greater braking distance at 30 km/h?',
    options: [opt('a', 'Model B (k = 0.015)', true), opt('b', 'Model A (k = 0.01)', false, 'transform-wrong', 'A smaller k gives less distance at the same speed: 9 m against 13.5 m.'), opt('c', 'They’re equal at 30 km/h', false, 'transform-wrong', 'The curves only meet at v = 0.'), opt('d', 'It depends on the reaction time', false, 'only-reaction', 'The braking part doesn’t use the reaction time; only k differs.')],
    hints: ['Compare k values.', 'B = kv² with v = 30.', '0.01 × 900 vs 0.015 × 900.'],
    solution: 'Model B: 0.015 × 900 = 13.5 m against Model A’s 9 m. These are simulated parameters, not a claim about real surfaces.'
  },
  'b-k': {
    type: 'choice', ideas: ['transform'],
    prompt: 'What happens to the graph of B(v) = kv² when k increases?',
    options: [opt('a', 'It gets steeper for positive speeds (a vertical stretch)', true), opt('b', 'It moves up', false, 'transform-wrong', 'It still starts at (0, 0). Multiplying stretches; adding would shift.'), opt('c', 'It gets wider', false, 'transform-wrong', 'A larger k makes it narrower (steeper), not wider.'), opt('d', 'It moves to the right', false, 'transform-wrong', 'Nothing inside the square changes, so there’s no horizontal shift.')],
    hints: ['k multiplies every output.', 'Bigger k: bigger B at every speed.', 'What does that do to the curve’s steepness?'],
    solution: 'A bigger k multiplies every output by more: a vertical stretch. The parabola is steeper for v > 0 and still passes through (0, 0).'
  },
  'b-eq': {
    type: 'choice', ideas: ['standard', 'model'],
    prompt: 'Model A gives a stopping distance of 16.5 m. Multiply 0.01v² + 0.25v = 16.5 through by 100. Which standard-form equation results?',
    options: [opt('a', 'v² + 25v − 1650 = 0', true), opt('b', 'v² + 25v + 1650 = 0', false, 'factor-sign', '16.5 moves across by subtracting: −1650.'), opt('c', 'v² + 25v − 16.5 = 0', false, 'no-divide-a', 'Multiply every term by 100, including 16.5.'), opt('d', 'v² + 0.25v − 1650 = 0', false, 'no-divide-a', '0.25 × 100 = 25.')],
    hints: ['Multiply every term by 100.', '0.01 × 100 = 1, 0.25 × 100 = 25, 16.5 × 100 = 1650.', 'Then subtract 1650 from both sides.'],
    solution: 'v² + 25v = 1650, so v² + 25v − 1650 = 0.'
  },
  'b-factor': {
    type: 'fields', ideas: ['factoring'],
    prompt: 'Factor v² + 25v − 1650 = (v + p)(v − q). What are p and q?',
    fields: [{ id: 'p', label: 'p', answer: 55, tolerance: 0.001, traps: [{ value: 30, code: 'factor-pair', message: 'That’s q. p and q multiply to 1650 and differ by 25.' }, { value: -55, code: 'factor-sign', message: 'Check the signs: (v + 55)(v − 30).' }] },
      { id: 'q', label: 'q', answer: 30, tolerance: 0.001, traps: [{ value: 55, code: 'factor-pair', message: 'That’s p.' }, { value: -30, code: 'factor-sign', message: 'q is positive in (v − q).' }] }],
    hints: ['Find two numbers that multiply to −1650 and add to 25.', 'Try factor pairs of 1650 that differ by 25.', '55 × 30 = 1650 and 55 − 30 = 25.'],
    solution: '(v + 55)(v − 30) = 0, so v = −55 or v = 30 by the zero-product property.'
  },
  'b-reject': {
    type: 'choice', ideas: ['interpret'],
    prompt: 'The solutions are v = −55 and v = 30. What speed gives 16.5 m?',
    options: [opt('a', '30 km/h: a negative speed is outside the model’s domain', true), opt('b', 'Both: an equation’s solutions are always valid', false, 'domain', 'Algebra gives both, but speed here is 0 ≤ v ≤ 40. −55 km/h isn’t meaningful.'), opt('c', '−55 km/h, because it’s the bigger number', false, 'domain', '−55 is less than 30, and a negative speed doesn’t fit the model.'), opt('d', 'Neither: the equation has no solution', false, 'domain', 'It does: 30 km/h works. Check: 9 + 7.5 = 16.5.')],
    hints: ['What values can v take here?', 'The model covers 0 ≤ v ≤ 40.', 'Which solution is in that range?'],
    solution: 'v = 30 km/h. Solving the equation and interpreting the solutions are different jobs: −55 is a correct algebraic solution, but not a speed.'
  },
  'b-x-abc': {
    type: 'fields', ideas: ['formula', 'standard'],
    prompt: 'Independent challenge: Model B, 21 m available. 0.015v² + 0.25v = 21 times 200 gives 3v² + 50v − 4200 = 0. Identify a, b and c.',
    fields: [{ id: 'a', label: 'a', answer: 3, tolerance: 0.001, traps: [{ value: 0.015, code: 'abc-wrong', message: 'Use the scaled equation: 3v² + 50v − 4200 = 0.' }] },
      { id: 'b', label: 'b', answer: 50, tolerance: 0.001, traps: [{ value: 0.25, code: 'abc-wrong', message: 'Use the scaled equation.' }] },
      { id: 'c', label: 'c', answer: -4200, tolerance: 0.001, traps: [{ value: 4200, code: 'neg-parens', message: 'c includes its sign: −4200.' }, { value: 21, code: 'abc-wrong', message: 'Move 21 across and scale: −4200.' }] }],
    hints: ['Standard form: av² + bv + c = 0.', 'Read the coefficients in order.', 'Keep the sign with c.'],
    solution: 'a = 3, b = 50, c = −4200.'
  },
  'b-x-disc': {
    type: 'number', ideas: ['formula', 'discriminant'], answer: DB, tolerance: 0.01, label: 'b² − 4ac',
    prompt: 'Find the discriminant b² − 4ac.',
    traps: [{ value: 50 * 50 - 4 * 3 * 4200, code: 'neg-parens', message: 'c is −4200, so −4ac = −4(3)(−4200) = +50400.' }, { value: 50 * 50, code: 'disc-wrong', message: 'Subtract 4ac too.' }],
    hints: ['b² − 4ac with a = 3, b = 50, c = −4200.', '50² = 2500.', '−4(3)(−4200) = +50400.'],
    solution: `2500 + 50400 = ${DB}, and √${DB} = ${Math.sqrt(DB)}.`
  },
  'b-x-v': {
    type: 'number', ideas: ['formula', 'interpret'], answer: SB.valid[0], tolerance: 0.01, unit: 'km/h', label: 'v',
    prompt: 'Use the quadratic formula. What speed gives 21 m under Model B?',
    traps: [{ value: SB.rejected[0], code: 'domain', message: 'That’s the negative solution: not a speed.' }, { value: (-50 + Math.sqrt(DB)) / 3, code: 'forgot-2a', message: 'Divide by 2a = 6, not 3.' }, { value: -50 + Math.sqrt(DB), code: 'forgot-2a', message: 'Divide the whole top by 2a.' }],
    hints: ['v = (−b ± √Δ) ÷ 2a.', `(−50 ± 230) ÷ 6.`, 'One solution is negative; keep the other.'],
    solution: `v = (−50 + 230) ÷ 6 = 30 km/h. The other, (−50 − 230) ÷ 6 ≈ ${r2(SB.rejected[0])}, is negative and rejected.`
  }
};
export function brakePractice(n) {
  const P = pick(BRAKE_PRACTICE, n), S = speedFor(P.model, P.d), E = stopEquation(P.model, P.d), k = BRAKE.models[P.model];
  return tidy({
    brief: `Scenario ${n + 1}: Model ${P.model} (k = ${k}), ${nf(P.d)} m available.`, set: P,
    'b-p-v': { type: 'number', ideas: ['formula', 'model'], answer: S.valid[0], tolerance: 0.01, unit: 'km/h', label: 'v',
      prompt: `Solve ${k}v² + 0.25v = ${nf(P.d)} for the speed.`,
      traps: [{ value: S.rejected[0], code: 'domain', message: 'That’s the negative root.' }],
      hints: ['Move everything to one side.', `${standardText(E, 'D', 'v').replace('D(v) = ', '')} = 0.`, 'Quadratic formula (or factor), then keep the non-negative root.'],
      solution: `v = ${nf(S.valid[0])} km/h (the other root, ${r2(S.rejected[0])}, is negative).` },
    'b-p-reject': { type: 'choice', ideas: ['interpret'], prompt: `Why reject v ≈ ${r2(S.rejected[0])}?`,
      options: rot([opt('a', 'A negative speed is outside the model’s domain (0 ≤ v ≤ 40)', true), opt('b', 'Because it’s not a whole number', false, 'domain', 'Whole numbers aren’t required; the sign is the problem.'), opt('c', 'Because it doesn’t satisfy the equation', false, 'domain', 'It does satisfy it. It just isn’t a speed.'), opt('d', 'You shouldn’t reject it', false, 'domain', 'Speeds in this model run from 0 to 40 km/h.')], n),
      hints: ['What does v represent?', 'Can the initial speed be negative?', 'Check the domain.'], solution: 'Both roots solve the equation, but only the non-negative one is a speed.' }
  });
}
export const BRAKE_PRACTICE_IDS = ['b-p-v', 'b-p-reject'];

// ================================================================ Mission 2: Rebuild the Jump
const JQ = J(), JS = solve(JQ), JV = [Number(JQ.h), Number(JQ.k)];
const M2 = {
  'j-vertex': {
    type: 'fields', ideas: ['features', 'vertex'], prompt: 'Read the vertex of the jump from the graph or the vertex form.',
    fields: [{ id: 'h', label: 'x (m)', answer: JV[0], tolerance: 0.001, traps: [{ value: JV[1], code: 'swap-vertex', message: 'That’s the height. x comes first.' }, { value: -JV[0], code: 'vertex-sign', message: '(x − 10) means h = +10.' }] },
      { id: 'k', label: 'height (m)', answer: JV[1], tolerance: 0.001, traps: [{ value: JV[0], code: 'swap-vertex', message: 'That’s the x-coordinate.' }] }],
    hints: ['The vertex is the highest point.', 'In a(x − h)² + k, the vertex is (h, k).', 'J(x) = −0.04(x − 10)² + 4.'],
    solution: '(10, 4): the jump peaks 10 m from takeoff at 4 m.'
  },
  'j-zeros': {
    type: 'fields', ideas: ['features', 'factored'], prompt: 'Where are the zeros (takeoff and landing at the reference height)?',
    fields: [{ id: 'a', label: 'Smaller', answer: 0, tolerance: 0.001, traps: [{ value: 10, code: 'roots-vs-vertex', message: '10 is the vertex x. The zeros are where J(x) = 0.' }] },
      { id: 'b', label: 'Larger', answer: 20, tolerance: 0.001, traps: [{ value: 10, code: 'roots-vs-vertex', message: '10 is the vertex x.' }, { value: 4, code: 'roots-vs-vertex', message: '4 is the maximum height.' }] }],
    hints: ['Zeros: where the height is 0.', 'Factored form: −0.04x(x − 20).', 'x = 0 or x − 20 = 0.'],
    solution: 'x = 0 and x = 20: the trajectory starts and ends at the reference height.'
  },
  'j-range': {
    type: 'fields', ideas: ['domain-range', 'features'], prompt: 'On the domain 0 ≤ x ≤ 20, what is the range of J?',
    fields: [{ id: 'lo', label: 'Lowest', answer: 0, tolerance: 0.001, unit: 'm' }, { id: 'hi', label: 'Highest', answer: JV[1], tolerance: 0.001, unit: 'm', traps: [{ value: 20, code: 'domain', message: '20 is the end of the domain (a distance), not a height.' }, { value: 10, code: 'roots-vs-vertex', message: '10 is where the peak is; the peak height is 4.' }] }],
    hints: ['Range: the heights.', 'The lowest is at takeoff and landing.', 'The highest is the vertex height.'],
    solution: '0 ≤ J(x) ≤ 4: from the ground up to the 4 m peak.'
  },
  'j-form-max': {
    type: 'choice', ideas: ['vertex', 'standard', 'factored'], prompt: 'Which form shows the maximum height immediately?',
    options: [opt('a', 'Vertex form: −0.04(x − 10)² + 4', true), opt('b', 'Standard form: −0.04x² + 0.8x', false, 'form-confuse', 'You’d have to calculate −b ÷ 2a first.'), opt('c', 'Factored form: −0.04x(x − 20)', false, 'form-confuse', 'Factored form shows the zeros, not the peak.'), opt('d', 'They all show it equally', false, 'form-confuse', 'Each form shows different features directly.')],
    hints: ['Which form contains k?', 'a(x − h)² + k.', 'k is the max (when a < 0).'], solution: 'Vertex form: k = 4 is the maximum height and h = 10 where it happens.'
  },
  'j-form-zeros': {
    type: 'choice', ideas: ['factored', 'vertex', 'standard'], prompt: 'Which form shows where the jump starts and ends?',
    options: [opt('a', 'Factored form', true), opt('b', 'Vertex form', false, 'form-confuse', 'Vertex form shows the peak.'), opt('c', 'Standard form', false, 'form-confuse', 'Standard form shows the y-intercept (c).'), opt('d', 'None of them', false, 'form-confuse', 'Factored form shows the zeros directly.')],
    hints: ['Starts and ends: height 0.', 'Which form makes J(x) = 0 easy?', 'a(x − r₁)(x − r₂).'], solution: 'Factored form: −0.04x(x − 20) is zero at x = 0 and x = 20.'
  },
  'j-form-standard': {
    type: 'choice', ideas: ['standard'], prompt: 'Which form is the general expanded equation, ax² + bx + c?',
    options: [opt('a', 'Standard form', true), opt('b', 'Vertex form', false, 'form-confuse', 'Vertex form is a(x − h)² + k.'), opt('c', 'Factored form', false, 'form-confuse', 'Factored form is a(x − r₁)(x − r₂).'), opt('d', 'The formula form', false, 'form-confuse', 'There are three forms: standard, vertex and factored.')],
    hints: ['Expanded means no brackets.', 'ax² + bx + c.', 'Its name?'], solution: 'Standard form: −0.04x² + 0.8x (here c = 0, the y-intercept).'
  },
  'j-shift': {
    type: 'choice', ideas: ['transform'], prompt: 'In the tuner, h goes from 10 to 12. What happens?',
    options: [opt('a', 'The whole curve moves 2 m to the right', true), opt('b', 'It moves 2 m to the left', false, 'vertex-sign', '(x − 12) puts the vertex at x = 12: right.'), opt('c', 'It moves 2 m up', false, 'transform-wrong', 'h is horizontal; k is vertical.'), opt('d', 'It gets narrower', false, 'transform-wrong', 'Only a changes the width.')],
    hints: ['h is the vertex’s x.', 'From 10 to 12.', 'Bigger x is further right.'], solution: 'The vertex moves to (12, 4) and every point moves 2 m right: a horizontal shift.'
  },
  'j-stretch': {
    type: 'choice', ideas: ['transform'], prompt: 'Now a goes from −0.04 to −0.08 (h and k unchanged). What happens?',
    options: [opt('a', 'Narrower and steeper; the zeros move closer to the vertex', true), opt('b', 'Wider; the zeros move apart', false, 'transform-wrong', 'A bigger |a| makes it narrower.'), opt('c', 'It flips to open upward', false, 'transform-wrong', 'a is still negative, so it still opens down.'), opt('d', 'The peak gets higher', false, 'transform-wrong', 'k sets the peak, and k didn’t change.')],
    hints: ['|a| controls width.', '|−0.08| > |−0.04|.', 'Same vertex, steeper sides.'], solution: 'A bigger |a| is a vertical stretch: narrower and steeper. The zeros move in to x = 10 ± √50 ≈ 2.93 and 17.07.'
  },
  'j-factor': {
    type: 'number', ideas: ['factoring', 'factored'], answer: 20, tolerance: 0.001, label: 'r',
    prompt: 'Factor out −0.04x: −0.04x² + 0.8x = −0.04x(x − r). What is r?',
    traps: [{ value: -20, code: 'factor-sign', message: '0.8x ÷ (−0.04x) = −20, so the bracket is (x − 20): r = 20.' }, { value: 0.8, code: 'factor-pair', message: 'Divide 0.8 by 0.04.' }],
    hints: ['Take −0.04x out of both terms.', '−0.04x² ÷ (−0.04x) = x.', '0.8x ÷ (−0.04x) = −20.'], solution: '−0.04x(x − 20), so r = 20.'
  },
  'j-zpp': {
    type: 'choice', ideas: ['factoring'], prompt: 'Why does −0.04x(x − 20) = 0 give x = 0 or x = 20?',
    options: [opt('a', 'A product is zero only when one of its factors is zero', true), opt('b', 'Because −0.04 = 0', false, 'no-zpp', '−0.04 is never zero; the variable factors are.'), opt('c', 'Because you divide both sides by x', false, 'no-zpp', 'Dividing by x loses the x = 0 solution.'), opt('d', 'Because the vertex is at 10', false, 'roots-vs-vertex', 'The vertex is halfway between the zeros, but it doesn’t give them.')],
    hints: ['When is a product zero?', 'One factor has to be zero.', 'x = 0, or x − 20 = 0.'], solution: 'The zero-product property: if pq = 0 then p = 0 or q = 0. So x = 0 or x = 20.'
  }
};
export function factorPractice(n) {
  const f = pick(FACTOR_PRACTICE, n), Q = quad(f.a, f.b, f.c), S = solve(Q), nice = factorsOverIntegers(Q);
  // (x − p)(x − q) expands to x² − (p + q)x + pq: it's right only if p + q = −b and pq = c.
  const pairText = (p, q) => { const t = r => (r < 0 ? `(x + ${-r})` : `(x − ${r})`); return p === q ? t(p) + '²' : t(p) + t(q); };
  const isRight = (p, q) => p + q === -f.b && p * q === f.c;
  const roots = nice ? (S.type === 'one' ? [Number(S.p), Number(S.p)] : S.exact.map(Number)) : null;
  const right = nice ? pairText(roots[0], roots[1]) : 'It doesn’t factor over the integers';
  const lo = Math.floor(S.approx[0]), hi = Math.ceil(S.approx[1]);
  const cand = nice ? [[-roots[0], -roots[1]], [1, f.c], [2, f.c / 2]] : [[lo, hi], [-lo, -hi], [1, f.c]];
  const wrong = cand.filter(([p, q]) => Number.isInteger(p) && Number.isInteger(q) && !isRight(p, q)).map(([p, q], i) =>
    opt('w' + i, pairText(p, q), false, p < 0 && q < 0 ? 'factor-sign' : 'factor-pair', `Expand it: ${pairText(p, q)} = x² ${-(p + q) < 0 ? '−' : '+'} ${Math.abs(p + q)}x ${p * q < 0 ? '−' : '+'} ${Math.abs(p * q)}. You need numbers that multiply to ${f.c} and add to ${f.b}.`));
  const opts = [opt('a', right, true), ...wrong];
  if (nice) opts.push(opt('n', 'It doesn’t factor over the integers', false, 'factor-pair', `It does: ${right}.`));
  const uniq = [], seen = new Set(); for (const o of opts) if (!seen.has(o.text)) { seen.add(o.text); uniq.push(o); }
  return tidy({
    brief: `Factor ${standardText(Q, 'f').replace('f(x) = ', '')}. Its zeros will show on the trajectory graph once you answer.`, set: f, Q, S, nice,
    'jf-factor': { type: 'choice', ideas: ['factoring'], prompt: `Factor x² ${f.b < 0 ? '−' : '+'} ${Math.abs(f.b)}x + ${f.c}.`, options: rot(uniq.slice(0, 4), n),
      hints: ['Look for two numbers that multiply to c and add to b.', `They multiply to ${f.c} and add to ${f.b}.`, nice ? 'Try the factor pairs of ' + f.c + '.' : `Check the discriminant: ${String(Q.disc)}. Is it a perfect square?`],
      solution: nice ? `${right}: the zeros are ${S.text}.` : `No integer pair works (the discriminant ${String(Q.disc)} isn’t a perfect square). The zeros are ${S.text} ≈ ${S.approx.map(r2).join(' and ')}.` },
    'jf-zeros': { type: 'fields', ideas: ['factoring', 'formula'], prompt: S.type === 'one' ? 'And the zero (it’s repeated)? Enter it in both boxes.' : 'And the zeros (to 2 decimal places if needed)?',
      fields: (S.type === 'one' ? [Number(S.p), Number(S.p)] : S.approx).map((v, i) => ({ id: 'z' + i, label: i ? 'Larger' : 'Smaller', answer: v, tolerance: 0.01 })),
      hints: ['Set each factor to zero, or use the formula.', nice ? 'From the factors.' : 'x = (−b ± √Δ) ÷ 2.', 'List the smaller first.'], solution: `${S.text}${nice ? '' : ' ≈ ' + S.approx.map(r2).join(' and ')}.` }
  });
}
export const FACTOR_PRACTICE_IDS = ['jf-factor', 'jf-zeros'];

// ================================================================ Mission 3: The Landing Analyzer
const E3 = solve(atHeight(JQ, 3)), E2Q = atHeight(JQ, 2), E2 = solve(E2Q), E4 = solve(atHeight(JQ, 4)), E5Q = atHeight(JQ, 5), E5 = solve(E5Q);
const CS = completeSquare(JQ), RM = rampMeet();
const M3 = {
  'l-sqrt-step': {
    type: 'choice', ideas: ['square-root'], prompt: 'Solve −0.04(x − 10)² + 4 = 3. After subtracting 4 and dividing by −0.04, what do you get?',
    options: [opt('a', '(x − 10)² = 25', true), opt('b', '(x − 10)² = −25', false, 'factor-sign', '−1 ÷ −0.04 = +25.'), opt('c', '(x − 10)² = 175', false, 'constant-wrong', 'Subtract 4 first: −0.04(x − 10)² = −1.'), opt('d', 'x − 10 = 25', false, 'one-root', 'Dividing gives the square: (x − 10)² = 25.')],
    hints: ['Undo + 4 first.', '−0.04(x − 10)² = −1.', '−1 ÷ −0.04 = 25.'], solution: '(x − 10)² = 25. Now take square roots of both sides.'
  },
  'l-sqrt': {
    type: 'fields', ideas: ['square-root', 'interpret'], prompt: 'Take square roots. At what horizontal positions is the rider at 3 m?',
    fields: E3.approx.map((v, i) => ({ id: 'x' + i, label: i ? 'Second position' : 'First position', answer: v, tolerance: 0.01, unit: 'm',
      traps: [{ value: 35, code: 'no-square', message: 'Take the square root: √25 = 5, not 25.' }, { value: i ? 10 : 10, code: 'roots-vs-vertex', message: 'That’s the vertex. There are two positions, 5 either side.' }] })),
    hints: ['√((x − 10)²) = ±√25.', 'x − 10 = 5 or x − 10 = −5.', 'Add 10.'], solution: 'x − 10 = ±5, so x = 5 and x = 15: two positions, one on the way up and one on the way down.'
  },
  'l-cts-factor': {
    type: 'choice', ideas: ['complete-square'], prompt: 'Complete the square on J(x) = −0.04x² + 0.8x. Step 1: factor −0.04 out of the x-terms.',
    options: [opt('a', '−0.04(x² − 20x)', true), opt('b', '−0.04(x² + 20x)', false, 'factor-sign', '0.8 ÷ −0.04 = −20.'), opt('c', '−0.04(x² − 0.8x)', false, 'no-divide-a', 'Divide 0.8 by −0.04 too.'), opt('d', 'x² − 20x', false, 'no-divide-a', 'Keep the −0.04 outside the bracket.')],
    hints: ['Divide each x-term by −0.04.', '−0.04x² ÷ −0.04 = x².', '0.8x ÷ −0.04 = −20x.'], solution: '−0.04(x² − 20x).'
  },
  'l-cts-square': {
    type: 'number', ideas: ['complete-square'], answer: Number(CS.square), tolerance: 0.001, label: '(half of −20)²',
    prompt: 'Step 2: take half of the x-coefficient (−20) and square it. What do you add (and subtract) inside the bracket?',
    traps: [{ value: Number(CS.half), code: 'no-square', message: 'Square the half: (−10)² = 100.' }, { value: 400, code: 'half-wrong', message: 'Halve first: half of −20 is −10, then square.' }, { value: -100, code: 'no-square', message: 'A square is never negative: (−10)² = +100.' }],
    hints: ['The x-coefficient inside is −20.', 'Half of −20 is −10.', '(−10)² = ?'], solution: 'Half of −20 is −10 and (−10)² = 100, so x² − 20x = (x − 10)² − 100.'
  },
  'l-cts-k': {
    type: 'number', ideas: ['complete-square', 'vertex'], answer: Number(CS.k), tolerance: 0.001, label: 'k',
    prompt: 'Step 3: J(x) = −0.04[(x − 10)² − 100]. Distribute the −0.04. What constant k is left: J(x) = −0.04(x − 10)² + k?',
    traps: [{ value: -4, code: 'constant-wrong', message: '−0.04 × −100 = +4.' }, { value: -100, code: 'constant-wrong', message: 'Multiply the −100 by −0.04 as well.' }, { value: 100, code: 'constant-wrong', message: 'Multiply by −0.04: −0.04 × −100.' }],
    hints: ['The −0.04 multiplies both parts.', '−0.04 × (−100).', 'Two negatives make a positive.'], solution: '−0.04 × −100 = 4: J(x) = −0.04(x − 10)² + 4. Same graph, but now the vertex (10, 4) is visible.'
  },
  'l-qf-abc': {
    type: 'fields', ideas: ['formula'], prompt: 'When is the jump at 2 m? −0.04x² + 0.8x = 2 becomes x² − 20x + 50 = 0 (times −25). Identify a, b and c.',
    fields: [{ id: 'a', label: 'a', answer: 1, tolerance: 0.001 }, { id: 'b', label: 'b', answer: -20, tolerance: 0.001, traps: [{ value: 20, code: 'neg-parens', message: 'b keeps its sign: −20.' }] }, { id: 'c', label: 'c', answer: 50, tolerance: 0.001, traps: [{ value: 2, code: 'abc-wrong', message: 'Use the rearranged equation: c = 50.' }] }],
    hints: ['ax² + bx + c = 0.', 'x² − 20x + 50: a = 1.', 'Keep signs with b and c.'], solution: 'a = 1, b = −20, c = 50.'
  },
  'l-qf-disc': {
    type: 'number', ideas: ['discriminant', 'formula'], answer: Number(E2Q.disc), tolerance: 0.001, label: 'b² − 4ac',
    prompt: 'Find the discriminant.',
    traps: [{ value: 400 + 200, code: 'disc-wrong', message: 'Subtract 4ac: 400 − 200.' }, { value: -400 - 200, code: 'neg-parens', message: '(−20)² = +400: square the whole −20.' }, { value: 400, code: 'disc-wrong', message: 'Subtract 4(1)(50) = 200.' }],
    hints: ['b² − 4ac.', '(−20)² = 400; 4 × 1 × 50 = 200.', '400 − 200.'], solution: '400 − 200 = 200 > 0: two real solutions.'
  },
  'l-qf-roots': {
    type: 'fields', ideas: ['formula', 'interpret'], prompt: 'Finish the formula. Where is the jump at 2 m (2 decimal places)?',
    fields: E2.approx.map((v, i) => ({ id: 'x' + i, label: i ? 'Larger' : 'Smaller', answer: v, tolerance: 0.01, unit: 'm',
      traps: [{ value: i ? 20 + Math.sqrt(200) : 20 - Math.sqrt(200), code: 'forgot-2a', message: 'Divide everything by 2a = 2.' }] })),
    hints: ['x = (20 ± √200) ÷ 2.', '√200 ≈ 14.14.', '(20 − 14.14) ÷ 2 and (20 + 14.14) ÷ 2.'], solution: `x = 10 ± 5√2 ≈ ${E2.approx.map(r2).join(' and ')} m.`
  },
  'l-qf-exact': {
    type: 'choice', ideas: ['formula'], prompt: 'Which is the exact (simplified) answer?',
    options: [opt('a', 'x = 10 ± 5√2', true), opt('b', 'x = 10 ± 10√2', false, 'radical-wrong', '√200 = 10√2, then divide by 2: 5√2.'), opt('c', 'x = 20 ± 5√2', false, 'forgot-2a', 'Divide the 20 by 2 as well.'), opt('d', 'x = 10 ± 2√5', false, 'radical-wrong', '√200 = √(100 × 2) = 10√2.')],
    hints: ['√200 = √(100 · 2).', '= 10√2.', '(20 ± 10√2) ÷ 2.'], solution: '(20 ± 10√2) ÷ 2 = 10 ± 5√2.'
  },
  'l-derive': {
    type: 'choice', ideas: ['formula', 'complete-square'], prompt: 'Where does the quadratic formula come from?',
    options: [opt('a', 'Completing the square on ax² + bx + c = 0', true), opt('b', 'Factoring ax² + bx + c', false, 'form-confuse', 'Many quadratics don’t factor; the formula always works because it comes from completing the square.'), opt('c', 'It’s an experimental rule', false, 'form-confuse', 'It’s derived algebraically, step by step.'), opt('d', 'Reading the vertex form', false, 'form-confuse', 'Close: you complete the square (the route to vertex form) on the general equation.')],
    hints: ['Open the derivation.', 'Divide by a, then add (b/2a)².', 'Then take square roots.'], solution: 'Complete the square on ax² + bx + c = 0: (x + b/2a)² = (b² − 4ac)/4a². Square-root and solve: x = (−b ± √(b² − 4ac)) ÷ 2a.'
  },
  'l-disc-4': {
    type: 'number', ideas: ['discriminant'], answer: Number(atHeight(JQ, 4).disc), tolerance: 0.001, label: 'Δ for 4 m',
    prompt: 'Target 4 m: x² − 20x + 100 = 0. What is the discriminant?',
    traps: [{ value: 800, code: 'disc-wrong', message: '400 − 400, not 400 + 400.' }], hints: ['b² − 4ac.', '400 − 4(1)(100).', '400 − 400.'],
    solution: '0: one repeated solution, x = 10. The line just touches the parabola at its vertex.'
  },
  'l-disc-5': {
    type: 'number', ideas: ['discriminant', 'complex'], answer: Number(E5Q.disc), tolerance: 0.001, label: 'Δ for 5 m',
    prompt: 'Target 5 m: x² − 20x + 125 = 0. What is the discriminant?',
    traps: [{ value: 100, code: 'disc-wrong', message: '400 − 500 is negative.' }, { value: 900, code: 'disc-wrong', message: 'Subtract 4ac: 400 − 500.' }], hints: ['b² − 4ac.', '400 − 4(1)(125).', '400 − 500.'],
    solution: '−100 < 0: no real solutions. The jump never reaches 5 m.'
  },
  'l-disc-meaning': {
    type: 'choice', ideas: ['discriminant', 'complex'], prompt: 'A negative discriminant means:',
    options: [opt('a', 'No real solutions, but two complex solutions', true), opt('b', 'No solutions of any kind', false, 'no-complex', 'There are two complex solutions; there just aren’t any real ones.'), opt('c', 'One repeated solution', false, 'disc-wrong', 'That’s a discriminant of 0.'), opt('d', 'Two real solutions', false, 'disc-wrong', 'That’s a positive discriminant.')],
    hints: ['Δ > 0: two real. Δ = 0: one repeated.', 'Δ < 0: √(negative).', 'What does √(−100) equal?'], solution: '√(negative) isn’t real, so there are no real solutions, but there are two complex ones (conjugates).'
  },
  'l-complex': {
    type: 'choice', ideas: ['complex'], prompt: 'Solve x² − 20x + 125 = 0.',
    options: [opt('a', `x = ${E5.text}`, true), opt('b', 'x = 10 ± 5', false, 'i-wrong', '√(−100) = 10i, not 10.'), opt('c', 'x = 10 ± 10i', false, 'forgot-2a', 'Divide 10i by 2 as well.'), opt('d', 'No solution', false, 'no-complex', 'There are complex solutions.')],
    hints: ['x = (20 ± √(−100)) ÷ 2.', '√(−100) = 10i.', '(20 ± 10i) ÷ 2.'], solution: `x = ${E5.text}: complex conjugates. They are valid algebraic solutions, but not horizontal positions on the trail.`
  },
  'l-system': {
    type: 'fields', ideas: ['system'], prompt: `A landing ramp follows the line y = ${RAMP.m}x + ${RAMP.q}. Where does the trajectory meet it? (Solve −0.04x² + 0.8x = ${RAMP.m}x + ${RAMP.q}.)`,
    fields: RM.approx.map((v, i) => ({ id: 'x' + i, label: i ? 'Second x' : 'First x', answer: v, tolerance: 0.01, unit: 'm' })),
    hints: ['Set the two expressions equal.', '−0.04x² + 1.3x − 10 = 0, times −25: x² − 32.5x + 250 = 0.', 'Δ = 1056.25 − 1000 = 56.25, √Δ = 7.5.'], solution: `x = ${RM.text}: the trajectory meets the ramp at x = 12.5 (height 3.75 m) and again at x = 20, where both reach the ground. A line and a parabola can meet twice, once or not at all, just like a target-height line.`
  }
};

// ================================================================ Extension: complex numbers
const EXT = {
  'cx-i2': { type: 'choice', ideas: ['complex-arith'], prompt: 'What is i²?', options: [opt('a', '−1', true), opt('b', '1', false, 'i-wrong', 'i = √−1, so i² = −1.'), opt('c', '√−1', false, 'i-wrong', 'That’s i itself.'), opt('d', '2i', false, 'i-wrong', 'i² means i × i, not i + i.')],
    hints: ['i = √−1.', 'Square both sides.', '(√−1)² = −1.'], solution: 'i² = −1. That’s the definition that makes √(−100) = 10i.' },
  'cx-power': { type: 'choice', ideas: ['complex-arith'], prompt: 'Simplify i⁷.', options: [opt('a', ipow(7), true), opt('b', 'i', false, 'complex-simplify', 'Powers of i repeat every 4: i⁷ = i⁴ · i³ = i³ = −i.'), opt('c', '−1', false, 'complex-simplify', 'That’s i², or i⁶.'), opt('d', '1', false, 'complex-simplify', 'That’s i⁴ or i⁸.')],
    hints: ['i, −1, −i, 1 then it repeats.', '7 = 4 + 3.', 'i³ = −i.'], solution: 'i⁷ = i⁴ · i³ = 1 · (−i) = −i.' },
  'cx-add': { type: 'fields', ideas: ['complex-arith'], prompt: '(3 + 2i) + (1 − 5i) = a + bi. What are a and b?',
    fields: (z => [{ id: 're', label: 'a (real)', answer: Number(z.re), tolerance: 0.001 }, { id: 'im', label: 'b (imaginary)', answer: Number(z.im), tolerance: 0.001, traps: [{ value: 7, code: 'complex-simplify', message: '2i + (−5i) = −3i.' }] }])(cadd(cx(3, 2), cx(1, -5))),
    hints: ['Add the real parts, then the imaginary parts.', '3 + 1.', '2 + (−5).'], solution: `${ctext(cadd(cx(3, 2), cx(1, -5)))}.` },
  'cx-sub': { type: 'fields', ideas: ['complex-arith'], prompt: '(10 + 5i) − (10 − 5i) = a + bi.',
    fields: (z => [{ id: 're', label: 'a', answer: Number(z.re), tolerance: 0.001 }, { id: 'im', label: 'b', answer: Number(z.im), tolerance: 0.001, traps: [{ value: 0, code: 'complex-simplify', message: '5i − (−5i) = 10i.' }] }])(csub(cx(10, 5), cx(10, -5))),
    hints: ['Subtract parts separately.', '10 − 10 = 0.', '5i − (−5i).'], solution: `${ctext(csub(cx(10, 5), cx(10, -5)))}: the difference of the jump’s two complex roots.` },
  'cx-mul': { type: 'fields', ideas: ['complex-arith'], prompt: '(2 + 3i)(1 − i) = a + bi.',
    fields: (z => [{ id: 're', label: 'a', answer: Number(z.re), tolerance: 0.001, traps: [{ value: -1, code: 'i-wrong', message: '−3i² = −3(−1) = +3: add it to 2.' }] }, { id: 'im', label: 'b', answer: Number(z.im), tolerance: 0.001 }])(cmul(cx(2, 3), cx(1, -1))),
    hints: ['Expand: 2 − 2i + 3i − 3i².', 'i² = −1, so −3i² = +3.', 'Collect: (2 + 3) + (−2 + 3)i.'], solution: `${ctext(cmul(cx(2, 3), cx(1, -1)))}.` },
  'cx-conj': { type: 'number', ideas: ['complex-arith', 'complex'], answer: Number(cmul(cx(10, 5), cx(10, -5)).re), tolerance: 0.001, label: '(10 + 5i)(10 − 5i)',
    prompt: 'Multiply the conjugate roots: (10 + 5i)(10 − 5i).', traps: [{ value: 75, code: 'i-wrong', message: '−25i² = +25: 100 + 25.' }],
    hints: ['(a + bi)(a − bi) = a² − (bi)².', '100 − 25i².', 'i² = −1.'], solution: '100 + 25 = 125: exactly the constant in x² − 20x + 125. Conjugate roots multiply to a real number.' }
};

// ================================================================ Final: The Final Course Analysis
export const FINAL_IDS = ['fa-eq', 'fa-v', 'fa-reject', 'fb-abc', 'fb-axis', 'fb-vertex', 'fb-zeros', 'fb-vform', 'fb-fform', 'fc-eq', 'fc-roots', 'fc-exact'];
export const PASS_MARK = 10;   // of 12, right without the solution shown
export function finalSet(roundNo) {
  const S = pick(FINAL_SETS, roundNo - 1), k = BRAKE.models[S.brake.model], E = stopEquation(S.brake.model, S.brake.d);
  const scale = S.brake.model === 'A' ? 100 : 200, mono = { a: Number(E.a) * scale, b: Number(E.b) * scale, c: Number(E.c) * scale };
  const Jq = quad(S.jump.a, S.jump.b, 0), H = atHeight(Jq, S.height);
  return { ...S, k, E, scale, mono, sp: speedFor(S.brake.model, S.brake.d), Jq, Js: solve(Jq), H, Hs: solve(H) };
}
export function finalQuestions(roundNo) {
  const F = finalSet(roundNo), { mono, sp, Jq, Js, H, Hs } = F;
  const eqStd = `${mono.a === 1 ? '' : mono.a}v² + ${mono.b}v − ${-mono.c} = 0`;
  const hx = Number(Jq.h), hk = Number(Jq.k), z = Js.approx;
  const vt = vertexText(Jq, 'J'), ft = factoredText(Jq, 'J');
  const qs = {
    set: F,
    'fa-eq': { type: 'choice', ideas: ['standard', 'model'], prompt: `Model ${F.brake.model}: D(v) = ${F.k}v² + 0.25v, and the modelled stopping distance is ${nf(F.brake.d)} m. Times ${F.scale}, which standard-form equation is it?`,
      options: [opt('a', eqStd, true), opt('b', eqStd.replace(' − ', ' + '), false, 'factor-sign', 'The distance moves across by subtracting.'), opt('c', `${mono.a === 1 ? '' : mono.a}v² + ${mono.b}v − ${nf(F.brake.d)} = 0`, false, 'no-divide-a', `Multiply the distance by ${F.scale} too.`), opt('d', `${F.k}v² + 0.25v + ${nf(F.brake.d)} = 0`, false, 'factor-sign', 'Subtract the distance from both sides.')],
      hints: ['Set D(v) equal to the distance.', `Multiply every term by ${F.scale}.`, 'Move the constant to the left.'], solution: eqStd },
    'fa-v': { type: 'number', ideas: ['formula', 'factoring', 'interpret'], answer: sp.valid[0], tolerance: 0.01, unit: 'km/h', label: 'v', prompt: 'Solve it. What is the valid modelled speed?',
      traps: [{ value: sp.rejected[0], code: 'domain', message: 'That’s the negative root.' }], hints: ['Factor or use the formula.', 'You’ll get one negative and one positive root.', 'Keep the non-negative one.'], solution: `v = ${nf(sp.valid[0])} km/h (simulated data, not a riding recommendation).` },
    'fa-reject': { type: 'choice', ideas: ['interpret'], prompt: `Why isn’t v ≈ ${r2(sp.rejected[0])} meaningful here?`,
      options: [opt('a', 'Speeds in the model are 0 ≤ v ≤ 40; a negative speed isn’t a speed', true), opt('b', 'It doesn’t solve the equation', false, 'domain', 'It does solve it.'), opt('c', 'Because it isn’t a whole number', false, 'domain', 'The issue is the sign.'), opt('d', 'It is meaningful', false, 'domain', 'A negative initial speed has no meaning here.')],
      hints: ['What does v represent?', 'Check the domain.', 'Can a speed be negative?'], solution: 'It’s a correct algebraic solution outside the model’s domain.' },
    'fb-abc': { type: 'fields', ideas: ['standard'], prompt: `New trajectory: ${standardText(Jq, 'J')}. Identify a, b and c.`,
      fields: [{ id: 'a', label: 'a', answer: Number(Jq.a), tolerance: 0.0001, traps: [{ value: -Number(Jq.a), code: 'abc-wrong', message: 'Keep the negative sign.' }] }, { id: 'b', label: 'b', answer: Number(Jq.b), tolerance: 0.0001 }, { id: 'c', label: 'c', answer: 0, tolerance: 0.0001 }],
      hints: ['ax² + bx + c.', 'There’s no constant term.', 'So c = 0.'], solution: `a = ${show(Jq.a)}, b = ${show(Jq.b)}, c = 0.` },
    'fb-axis': { type: 'number', ideas: ['features'], answer: hx, tolerance: 0.001, unit: 'm', label: 'Axis x =', prompt: 'Find the axis of symmetry, x = −b ÷ 2a.',
      traps: [{ value: -hx, code: 'factor-sign', message: '−b ÷ 2a: two negatives make a positive.' }, { value: hx * 2, code: 'forgot-2a', message: 'Divide by 2a, not a.' }], hints: ['x = −b ÷ (2a).', `−${show(Jq.b)} ÷ (2 × ${show(Jq.a)}).`, 'Simplify.'], solution: `x = ${show(Jq.h)}.` },
    'fb-vertex': { type: 'fields', ideas: ['features', 'vertex'], prompt: 'Find the vertex.',
      fields: [{ id: 'h', label: 'x', answer: hx, tolerance: 0.001, traps: [{ value: hk, code: 'swap-vertex', message: 'x first.' }] }, { id: 'k', label: 'height', answer: hk, tolerance: 0.001, traps: [{ value: hx, code: 'swap-vertex', message: 'That’s x.' }] }],
      hints: ['x is the axis.', 'Height = J(axis).', `J(${show(Jq.h)}).`], solution: `(${show(Jq.h)}, ${show(Jq.k)}).` },
    'fb-zeros': { type: 'fields', ideas: ['features', 'factoring'], prompt: 'Find the zeros.',
      fields: z.map((v, i) => ({ id: 'z' + i, label: i ? 'Larger' : 'Smaller', answer: v, tolerance: 0.001, traps: [{ value: hx, code: 'roots-vs-vertex', message: 'That’s the vertex x.' }] })),
      hints: ['Factor out x.', `x(${show(Jq.a)}x + ${show(Jq.b)}) = 0.`, 'Zero-product property.'], solution: `x = ${Js.text}.` },
    'fb-vform': { type: 'choice', ideas: ['vertex', 'complete-square'], prompt: 'Which is the vertex form?',
      options: [opt('a', vt, true), opt('b', vt.replace('(x −', '(x +'), false, 'vertex-sign', 'The vertex is at positive x: (x − h).'), opt('c', vt.replace(/ \+ ([\d.]+)$/, ' − $1'), false, 'vertex-sign', 'The peak is above the ground: + k.'), opt('d', `J(x) = ${show(Jq.a)}(x − ${show(Jq.k)})² + ${show(Jq.h)}`, false, 'swap-vertex', 'h goes inside the bracket, k outside.')],
      hints: ['a(x − h)² + k.', 'h and k are the vertex.', 'a stays the same.'], solution: vt },
    'fb-fform': { type: 'choice', ideas: ['factored'], prompt: 'Which is the factored form?',
      options: [opt('a', ft, true), opt('b', ft.replace('(x −', '(x +'), false, 'factor-sign', 'The second zero is positive: (x − r).'), opt('c', ft.replace(show(Jq.a), show(Jq.a.neg())), false, 'factor-sign', 'Keep a’s sign: a negative a makes the jump open downward.'), opt('d', `J(x) = ${show(Jq.a)}(x − ${show(Jq.h)})²`, false, 'roots-vs-vertex', 'That would have one zero at the vertex.')],
      hints: ['a(x − r₁)(x − r₂).', 'The zeros are the r’s.', 'a stays the same.'], solution: ft },
    'fc-eq': { type: 'choice', ideas: ['formula', 'standard'], prompt: `When is this jump at ${nf(F.height)} m? Divide ${standardText(Jq, 'J').replace('J(x) = ', '')} = ${nf(F.height)} through by a (so x² has coefficient 1). Which equation results?`,
      options: [opt('a', standardText(H, 'E').replace('E(x) = ', '') + ' = 0', true), opt('b', standardText(quad(1, H.b.neg(), H.c), 'E').replace('E(x) = ', '') + ' = 0', false, 'factor-sign', 'Divide by a negative: the signs of b flip.'), opt('c', standardText(quad(1, H.b, H.c.neg()), 'E').replace('E(x) = ', '') + ' = 0', false, 'constant-wrong', 'Move the height across first, then divide.'), opt('d', standardText(quad(Jq.a, Jq.b, -F.height), 'E').replace('E(x) = ', '') + ' = 0', false, 'no-divide-a', 'That’s before dividing by a.')],
      hints: ['Subtract the height.', 'Divide every term by a.', 'Check the signs.'], solution: standardText(H, 'E').replace('E(x) = ', '') + ' = 0' },
    'fc-roots': { type: 'fields', ideas: ['formula', 'interpret'], prompt: 'Solve it with the quadratic formula (2 decimal places).',
      fields: Hs.approx.map((v, i) => ({ id: 'x' + i, label: i ? 'Larger' : 'Smaller', answer: v, tolerance: 0.01, unit: 'm', traps: [{ value: i ? -Number(H.b) + Math.sqrt(Number(H.disc)) : -Number(H.b) - Math.sqrt(Number(H.disc)), code: 'forgot-2a', message: 'Divide by 2a = 2.' }] })),
      hints: ['x = (−b ± √Δ) ÷ 2.', `Δ = ${show(H.disc)}.`, 'Compute both.'], solution: `x = ${Hs.text} ≈ ${Hs.approx.map(r2).join(' and ')} m. Check on the graph: the height line crosses the trajectory there.` },
    'fc-exact': { type: 'choice', ideas: ['formula'], prompt: 'Which is the exact answer?',
      options: [opt('a', 'x = ' + Hs.text, true), opt('b', 'x = ' + Hs.text.replace(show(Hs.p), show(Hs.p.mul(2))), false, 'forgot-2a', 'Divide the whole numerator by 2.'), opt('c', 'x = ' + show(Hs.p) + ' ± √' + show(H.disc), false, 'radical-wrong', 'Simplify, and divide the root by 2 too.'), opt('d', 'x = ' + show(Hs.p) + (Hs.q.eq(1) ? ' ± 2√' : ' ± √') + Hs.n, false, 'radical-wrong', 'Pull the square factor out carefully, then halve.')],
      hints: ['(−b ± √Δ) ÷ 2.', `√${show(H.disc)}: pull out square factors.`, 'Divide both parts by 2.'], solution: 'x = ' + Hs.text }
  };
  return arrange(tidy(qs));
}

// ================================================================ missions
export const QUESTIONS = arrange(tidy({ ...M1, ...M2, ...M3, ...EXT }));
export const MISSIONS = [
  { id: 'brake', n: 1, title: 'The brake zone lab', short: 'Brake Zone Lab', minutes: '6–7', focus: 'Quadratic models · coefficients · solving in context',
    blurb: 'Why does a little more speed need a lot more room to stop? Model it, then solve it backwards.', graded: Object.keys(M1) },
  { id: 'jump', n: 2, title: 'Rebuild the jump', short: 'Rebuild the Jump', minutes: '6–7', focus: 'Standard, vertex and factored form · transformations · factoring',
    blurb: 'Reconstruct a jump’s equation three ways and tune its shape.', graded: Object.keys(M2) },
  { id: 'landing', n: 3, title: 'The landing analyzer', short: 'Landing Analyzer', minutes: '7–8', focus: 'Square roots · completing the square · quadratic formula · discriminant · complex roots',
    blurb: 'Where does the jump reach 2, 3, 4 or 5 m? The discriminant knows before you solve.', graded: Object.keys(M3) }
];
export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (let n = 0; n < BRAKE_PRACTICE.length; n++) { const P = brakePractice(n); for (const id of BRAKE_PRACTICE_IDS) out[id] = [...new Set([...(out[id] || []), ...P[id].ideas])]; }
  for (let n = 0; n < FACTOR_PRACTICE.length; n++) { const P = factorPractice(n); for (const id of FACTOR_PRACTICE_IDS) out[id] = [...new Set([...(out[id] || []), ...P[id].ideas])]; }
  const F = finalQuestions(1); for (const id of FINAL_IDS) out[id] = F[id].ideas;
  return out;
}
