// Jump Trajectory Lab: questions and missions.
// Every problem is built from jumpModel(), so its answer is calculated, never
// typed in. Generated missions draw from NICE (jumps whose coefficient is a
// tidy −1/n); scripts/test-jump-lab.mjs builds every one and checks it.
//
// Each problem has: id (the question kind, for progress), key (which
// numbers), skills, prompt, parts (what the student answers), hints (3),
// solution (the full working, with what it means for the jump).

import { jumpModel, NICE, fstr, nice, dec, vertexForm, standardForm, factoredForm, asText } from './quadratic.js';

// A small seeded random generator, so "replay with new numbers" is repeatable in tests.
export function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const pick = (r, list) => list[Math.floor(r() * list.length)];
const shuffle = (r, list) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const keyOf = m => `L${m.L}H${m.H}`;
const m_ = (L, H) => jumpModel(L, H);
const u = n => `${dec(n, 4)} m`;

// ---------- Stage 1: the hook ----------
export const HOOK = {
  id: 'hook-shape', type: 'choice', skills: ['recognize'],
  prompt: 'What shape do you think the rider’s trajectory makes?',
  options: [
    { id: 'line', text: 'A straight line', feedback: 'A straight line would keep climbing (or falling) at the same rate. The rider rises, slows, peaks, then drops.' },
    { id: 'circle', text: 'A circle', feedback: 'Close: it’s curved. But a circle is equally curved everywhere and would curl back on itself. The flight is a different curve.' },
    { id: 'parabola', text: 'A parabola', correct: true },
    { id: 'triangle', text: 'A triangle', feedback: 'There are no sharp corners in the air: the rider’s path bends smoothly over the top.' }
  ],
  explain: 'The simplified flight path is a parabola: the graph of a quadratic function. The rider rises, reaches one highest point, then comes down the same way they went up.'
};

// ---------- Stage 3: learning modules (fixed jumps, so the numbers match the text) ----------
export const MODULE_JUMPS = { a: { L: 12, H: 3 }, b: { L: 12, H: 3 }, c: { L: 16, H: 4 }, d: { L: 12, H: 3 }, e: { L: 12, H: 3 } };

export const MOD_A_Q = {
  id: 'mod-a-shape', type: 'choice', skills: ['recognize', 'coefficient'],
  hints: ['Try it: raise the height slider and leave the distance alone.', 'Watch the takeoff and landing points. Do they move?', 'Same span, higher peak: does the curve bend more or less?'],
  prompt: 'What happens to the shape when the maximum height increases but the jump distance stays the same?',
  options: [
    { id: 'narrow', text: 'The parabola gets taller and narrower; takeoff and landing stay put', correct: true },
    { id: 'wide', text: 'The parabola gets wider', code: 'width-for-height', feedback: 'Watch the takeoff and landing points: with the same jump distance they don’t move, so the curve can’t get wider. It gets taller over the same span, which makes it narrower.' },
    { id: 'move', text: 'The landing point moves farther away', code: 'distance-for-height', feedback: 'The landing point is set by the jump distance (L), which didn’t change. Height and distance are separate controls.' },
    { id: 'same', text: 'Nothing changes except the numbers', feedback: 'Try it in the simulator: raise the height slider and watch the curve.' }
  ],
  explain: 'Same takeoff and landing, higher peak: the curve has to bend more sharply, so it is taller and narrower. The coefficient a = −4H/L² gets more negative.'
};

export function modB() {
  // A different jump from the worked example, so the answer isn't on screen.
  const m = m_(10, 2.5);
  return {
    id: 'mod-b-vertex', key: keyOf(m), model: m, skills: ['vertex'], type: 'point', step: 0.5,
    prompt: 'Here’s a new jump with its labels hidden. Click or tap its highest point.',
    target: m.vertex, show: {}, reveal: { vertex: true, axis: true },
    traps: [{ ...m.takeoff, code: 'max-at-zero', message: 'That’s the takeoff, a zero. The highest point is in the middle of the flight.' },
            { ...m.landing, code: 'max-at-zero', message: 'That’s the landing, a zero. The highest point is in the middle of the flight.' }],
    hints: ['Look for where the curve stops rising and starts falling.', 'For a symmetrical jump, that’s halfway between takeoff and landing.', `Halfway between 0 and ${dec(m.L)} is ${dec(m.vertex.x)}.`],
    solution: `The highest point is (${dec(m.vertex.x)}, ${dec(m.H)}): halfway between the zeros 0 and ${dec(m.L)}, ${dec(m.H)} m up.`,
    follow: { id: 'mod-b-max', type: 'number', skills: ['max'], prompt: 'What is the maximum height of this jump?', answer: m.max, unit: 'm',
      traps: [{ value: m.vertex.x, code: 'swapped-coordinates', message: `${dec(m.vertex.x)} is the x-coordinate: WHERE the maximum happens (${dec(m.vertex.x)} m from takeoff). The height is the y-coordinate.` },
              { value: m.L, code: 'distance-for-height', message: `${dec(m.L)} m is the jump distance, a horizontal measurement. Height is vertical.` }],
      hints: ['The maximum height is one of the vertex’s coordinates.', 'Which coordinate measures up and down?', 'It’s the y-coordinate of the vertex.'],
      solution: `The vertex is (${dec(m.vertex.x)}, ${dec(m.H)}). x = ${dec(m.vertex.x)} says WHERE the maximum is; y = ${dec(m.H)} says WHAT it is: ${dec(m.H)} m.` }
  };
}

export function modC() {
  const m = m_(16, 4);
  return {
    id: 'mod-c-zeros', key: keyOf(m), model: m, skills: ['zeros'], type: 'points', step: 0.5,
    prompt: 'This jump’s labels are hidden. Click or tap BOTH places where the trajectory meets the ground line (the x-axis).',
    targets: [m.takeoff, m.landing], show: {}, reveal: { zeros: true },
    hints: ['Look for the points where the height is 0.', 'The curve starts on the x-axis and comes back down to it.', `One is at x = 0. Follow the curve to where it lands.`],
    solution: `The trajectory meets the x-axis at (0, 0) and (${dec(m.L)}, 0): the zeros x = 0 and x = ${dec(m.L)}.`,
    follow: { id: 'mod-c-meaning', type: 'choice', prompt: 'What do these two points represent in the jump?', skills: ['zeros', 'interpret'],
      hints: ['What is the height at these points?', 'Height 0 is the reference line the rider leaves from and returns to.'],
      solution: 'They’re where the trajectory is at height 0: the rider takes off at the first and lands at the second.',
      options: [
        { id: 'tl', text: 'Where the rider takes off and lands (height 0 on the reference line)', correct: true },
        { id: 'peak', text: 'The two highest points of the flight', code: 'zero-for-vertex', feedback: 'There’s only one highest point, the vertex. These points have height 0.' },
        { id: 'half', text: 'Where the rider is halfway up', feedback: 'At these points y = 0: the rider is at the reference height, not in the air.' }
      ] },
    explain: 'Set y = 0: 0 = −1/16·x(x − 16), so x = 0 or x = 16. The rider takes off at x = 0 and lands at x = 16.'
  };
}

export function modD() {
  // Not the worked example's numbers, so the answer isn't on screen.
  const m = m_(16, 4), x = 4;
  return {
    id: 'mod-d-mirror', key: keyOf(m) + 'x4', model: m, skills: ['axis'], type: 'number', point: { x, y: m.y(x) },
    prompt: `On this 16 m jump, the point (4, ${dec(m.y(x))}) is on the trajectory. At what x on the other side of the axis of symmetry is the rider at the same height?`,
    answer: m.mirror(x), unit: 'm',
    traps: [{ value: m.axis, code: 'axis-confusion', message: `x = ${dec(m.axis)} is the axis itself. The matching point is the same distance from the axis on the other side.` },
            { value: -x, code: 'axis-confusion', message: `Mirror across the axis x = ${dec(m.axis)}, not across x = 0.` }],
    hints: [`The axis of symmetry is x = ${dec(m.axis)}, halfway between 0 and 16.`, `x = 4 is ${dec(m.axis - x)} m to the left of the axis.`, `Go ${dec(m.axis - x)} m to the right of the axis instead.`],
    solution: `x = 4 is ${dec(m.axis - x)} m left of the axis x = ${dec(m.axis)}, so its mirror is ${dec(m.axis - x)} m right: x = ${dec(m.mirror(x))}. Both are ${dec(m.y(x))} m high.`
  };
}

export const MOD_E_Q = {
  id: 'mod-e-coef', type: 'choice', skills: ['coefficient'],
  hints: ['Compare the sizes of the coefficients, ignoring the sign: |−1/12| and |−1/4|.', '|−1/4| = 0.25 and |−1/12| ≈ 0.083.', 'A bigger |a| makes a narrower parabola.'],
  prompt: 'Jump A has a = −1/12. Jump B has a = −1/4. Both open downward. Which statement is true?',
  options: [
    { id: 'b', text: 'Jump B’s parabola is narrower (|a| is bigger)', correct: true },
    { id: 'a', text: 'Jump A’s parabola is narrower', code: 'coefficient-sign', feedback: '−1/4 is farther from 0 than −1/12 (|−1/4| = 0.25 > 0.083). The bigger |a|, the narrower the curve.' },
    { id: 'up', text: 'Jump B opens upward because −1/4 is greater', code: 'coefficient-sign', feedback: 'Both coefficients are negative, so both open downward. The size of |a| sets the width, the sign sets the direction.' },
    { id: 'same', text: 'They have the same shape', feedback: 'Different a means a different shape. Compare |a|.' }
  ],
  explain: 'A negative a opens downward (a maximum). A bigger |a| makes a narrower parabola. In our model a = −4H/L², so a taller or shorter jump has a bigger |a|.'
};

// ---------- Stage 4: equation decoder ----------
export const DECODER_MATCH = [
  { id: 'dec-match-max', skills: ['forms'], prompt: 'Which form makes it easiest to read the maximum height?', answer: 'vertex',
    why: 'Vertex form y = a(x − h)² + k shows the vertex (h, k) directly: k is the maximum height.' },
  { id: 'dec-match-landing', skills: ['forms', 'zeros'], prompt: 'Which form makes it easiest to read the landing position?', answer: 'factored',
    why: 'Factored form y = a(x − r₁)(x − r₂) shows the zeros directly: the landing is the second root.' },
  { id: 'dec-match-abc', skills: ['forms'], prompt: 'Which form shows all three coefficients a, b and c of y = ax² + bx + c?', answer: 'standard',
    why: 'Standard form writes out a, b and c. (The leading coefficient a appears in all three forms; only standard form shows b and c.)' }
];
export const FORM_NAMES = { vertex: 'Vertex form', standard: 'Standard form', factored: 'Factored form' };

export function decoderTranslate(seed = 1) {
  const r = rng(seed), m1 = m_(...Object.values(pick(r, NICE.filter(s => s.L !== 12)))), m2 = m_(...Object.values(pick(r, NICE.filter(s => s.L !== m1.L))));
  const out = [
    { id: 'dec-translate-max', key: keyOf(m1), model: m1, skills: ['forms', 'max'], shown: 'factored', equation: asText(factoredForm(m1)),
      prompt: `This jump is written in factored form: ${asText(factoredForm(m1))}. What is its maximum height?`, answer: m1.max, unit: 'm',
      traps: [{ value: m1.L, code: 'distance-for-height', message: `${dec(m1.L)} is the landing position, a horizontal distance.` }, { value: m1.vertex.x, code: 'swapped-coordinates', message: `${dec(m1.vertex.x)} is where the maximum happens, not how high it is.` }],
      hints: ['The zeros are x = 0 and x = ' + dec(m1.L) + '. The peak is halfway between them.', `Halfway is x = ${dec(m1.vertex.x)}.`, `Put x = ${dec(m1.vertex.x)} into the equation.`],
      explain: `Zeros 0 and ${dec(m1.L)} put the peak halfway, at x = ${dec(m1.vertex.x)}. y = ${fstr(m1.a)} · ${dec(m1.vertex.x)} · (${dec(m1.vertex.x)} − ${dec(m1.L)}) = ${dec(m1.max)}. Maximum height: ${u(m1.max)}.` },
    { id: 'dec-translate-landing', key: keyOf(m2), model: m2, skills: ['forms', 'zeros'], shown: 'vertex', equation: asText(vertexForm(m2)),
      prompt: `This jump is written in vertex form: ${asText(vertexForm(m2))}. It takes off at x = 0. Where does it land?`, answer: m2.L, unit: 'm',
      traps: [{ value: m2.vertex.x, code: 'zero-for-vertex', message: `${dec(m2.vertex.x)} is the vertex’s x, the middle of the jump. The landing is twice as far.` }, { value: m2.H, code: 'distance-for-height', message: `${dec(m2.H)} is the height (k).` }],
      hints: ['Vertex form tells you the vertex (h, k).', `The peak is at x = ${dec(m2.vertex.x)}, halfway between takeoff and landing.`, 'Takeoff is at 0, so the landing is twice h.'],
      explain: `The vertex is at x = h = ${dec(m2.vertex.x)}. A symmetrical jump from x = 0 lands the same distance past the peak: x = ${dec(m2.L)}.` }
  ];
  out.forEach(q => { q.traps = q.traps.filter(t => Math.abs(t.value - q.answer) > 1e-9); });
  return out;
}

// ---------- Stage 5: missions ----------
export const MISSIONS = [
  { n: 1, id: 'm1', title: 'Find the apex', level: 'Beginner' },
  { n: 2, id: 'm2', title: 'Locate the landing', level: 'Beginner' },
  { n: 3, id: 'm3', title: 'Match the jump', level: 'Intermediate' },
  { n: 4, id: 'm4', title: 'Change the shape', level: 'Intermediate' },
  { n: 5, id: 'm5', title: 'Reverse-engineer the jump', level: 'Advanced' },
  { n: 6, id: 'm6', title: 'The final jump blueprint', level: 'Advanced' }
];

// Mission 1: the vertex, then what its y-coordinate means.
function m1(r) {
  const m = m_(...Object.values(pick(r, NICE)));
  return { mission: 1, key: keyOf(m), model: m, steps: [
    { id: 'm1-vertex', skills: ['vertex'], type: 'fields', graph: { hideLabels: true },
      prompt: 'The rider reaches maximum height at the vertex. What is the vertex?', pairTraps: true,
      fields: [
        { id: 'x', label: 'x (horizontal position, m)', answer: m.vertex.x, traps: [{ value: m.L, code: 'max-at-zero', message: `x = ${dec(m.L)} is where the rider lands, a zero. The peak is between takeoff and landing.` }, { value: 0, code: 'max-at-zero', message: 'x = 0 is the takeoff, a zero.' }] },
        { id: 'y', label: 'y (height, m)', answer: m.vertex.y, traps: [{ value: m.L, code: 'distance-for-height', message: `${dec(m.L)} is the jump distance, which is horizontal.` }, { value: 0, code: 'zero-for-vertex', message: 'Height 0 is the ground line, where the zeros are.' }] }
      ],
      hints: ['The vertex is the highest point of the downward-opening parabola.', 'In a symmetrical jump the highest point is halfway between takeoff and landing.', `Halfway between 0 and ${dec(m.L)} is ${dec(m.vertex.x)}. How high is the curve there?`],
      solution: `The peak is halfway between the zeros 0 and ${dec(m.L)}: x = ${dec(m.vertex.x)}. Its height is ${dec(m.H)}, so the vertex is (${dec(m.vertex.x)}, ${dec(m.vertex.y)}). The rider is highest ${u(m.vertex.x)} from takeoff, ${u(m.H)} up.` },
    { id: 'm1-meaning', skills: ['max', 'interpret'], type: 'choice', prompt: `In the vertex (${dec(m.vertex.x)}, ${dec(m.vertex.y)}), what does ${dec(m.vertex.y)} tell you?`,
      options: [
        { id: 'max', text: `The rider’s maximum height: ${u(m.H)}`, correct: true },
        { id: 'where', text: `How far from takeoff the peak happens`, code: 'swapped-coordinates', feedback: 'That’s the x-coordinate. The second coordinate is the height.' },
        { id: 'land', text: 'Where the rider lands', code: 'zero-for-vertex', feedback: 'The landing is a zero (height 0). The vertex is the top of the flight.' },
        { id: 'wide', text: 'How wide the jump is', code: 'width-for-height', feedback: 'Width is horizontal (the jump distance). This number is vertical.' }
      ], hints: ['A point is (x, y): across, then up.', 'Which coordinate is the height?'], solution: `${dec(m.vertex.y)} is the y-coordinate: the maximum height, ${u(m.H)}.` }
  ] };
}

// Mission 2: the positive zero, then what kind of point it is.
function m2(r) {
  const m = m_(...Object.values(pick(r, NICE)));
  return { mission: 2, key: keyOf(m), model: m, steps: [
    { id: 'm2-landing', skills: ['zeros'], type: 'number', graph: { hideLabels: true }, unit: 'm',
      prompt: `Where does this modeled jump meet the ground line on the landing side? Equation: ${asText(factoredForm(m))}`, answer: m.L,
      traps: [{ value: m.vertex.x, code: 'zero-for-vertex', message: `${dec(m.vertex.x)} is the x of the vertex: the middle of the flight, not the landing.` },
              { value: m.H, code: 'distance-for-height', message: `${dec(m.H)} is the maximum height, a vertical measurement.` },
              { value: 0, code: 'wrong-zero', message: 'x = 0 is a zero too, but it’s the takeoff. Which zero is on the landing side?' }],
      hints: ['The landing is where the height y is 0 again.', 'Set y = 0. A product is 0 when one of its factors is 0.', `x = 0 or x − ${dec(m.L)} = 0.`],
      solution: `0 = ${asText(factoredForm(m)).slice(4)} when x = 0 or x = ${dec(m.L)}. The rider takes off at 0 and lands at x = ${dec(m.L)}.` },
    { id: 'm2-type', skills: ['zeros', 'interpret'], type: 'choice', prompt: `The landing point (${dec(m.L)}, 0) is…`,
      options: [
        { id: 'x', text: 'An x-intercept (a zero of the function)', correct: true },
        { id: 'v', text: 'The vertex', code: 'zero-for-vertex', feedback: 'The vertex is the top of the flight. At the landing the height is 0.' },
        { id: 'y', text: 'A y-intercept', feedback: 'A y-intercept is where x = 0. Here x is the landing distance and y = 0, so it’s on the x-axis.' },
        { id: 'axis', text: 'On the axis of symmetry', code: 'axis-confusion', feedback: `The axis is the vertical line x = ${dec(m.axis)}, through the peak.` }
      ], hints: ['At the landing, y = 0.', 'Points with y = 0 lie on which axis?'], solution: 'Its height is 0, so it lies on the x-axis: an x-intercept, which is a zero of the function.' }
  ] };
}

// Mission 3: pick the equation of a target jump.
function m3(r) {
  const s = pick(r, NICE), m = m_(s.L, s.H);
  const taller = m_(s.L, s.H === 6 ? s.H / 2 : Math.min(6, s.H * 2));
  const wider = m_(s.L <= 12 ? s.L * 2 : s.L / 2, s.H);
  const opts = [
    { id: 'right', text: asText(vertexForm(m)), correct: true },
    { id: 'height', text: asText(vertexForm(taller)), code: 'width-for-height', feedback: `This one has the right takeoff and landing but peaks at ${u(taller.H)}. Check the height of the target.` },
    { id: 'width', text: asText(vertexForm(wider)), code: 'distance-for-height', feedback: `This one peaks at the right height but lands at ${u(wider.L)}. Check where the target lands.` },
    { id: 'sign', text: asText(vertexForm(m)).replace('y = −', 'y = '), code: 'coefficient-sign', feedback: 'A positive leading coefficient opens upward, like a valley. A jump opens downward, so a is negative.' }
  ];
  return { mission: 3, key: keyOf(m), model: m, steps: [
    { id: 'm3-match', skills: ['coefficient', 'forms', 'vertex'], type: 'choice', graph: { hideLabels: false },
      prompt: 'Which equation matches the target jump on the graph?', options: shuffle(r, opts),
      hints: ['Read the target’s vertex (its highest point) and where it lands.', 'In vertex form y = a(x − h)² + k, (h, k) is the vertex. Find the options with the right (h, k).', 'A jump opens downward, so a must be negative.'],
      solution: `The target peaks at (${dec(m.vertex.x)}, ${dec(m.H)}) and opens downward: ${asText(vertexForm(m))}, with a = ${fstr(m.a)} = −4·${dec(m.H)}/${dec(m.L)}².` }
  ] };
}

// Mission 4: keep L, raise H (done with the sliders), then explain what changed.
function m4(r) {
  const s = pick(r, NICE.filter(x => x.H <= 4)), m = m_(s.L, s.H);
  return { mission: 4, key: keyOf(m), model: m, steps: [
    { id: 'm4-build', skills: ['coefficient'], type: 'build', base: { L: m.L, H: m.H },
      prompt: `The baseline jump goes ${u(m.L)} and peaks at ${u(m.H)}. Keep the horizontal jump distance the same, but increase the maximum height.`,
      hints: ['Only one slider should move.', 'Leave the jump distance at ' + u(m.L) + '.', 'Raise the maximum height above ' + u(m.H) + '.'],
      solution: `Keep L = ${dec(m.L)} and set H above ${dec(m.H)}. The zeros stay at 0 and ${dec(m.L)}; only the peak rises.` },
    { id: 'm4-explain', skills: ['coefficient'], type: 'choice', prompt: 'What happened to the coefficient a and the width of the parabola?',
      options: [
        { id: 'right', text: 'a became more negative (|a| grew) and the parabola got narrower; the zeros stayed put', correct: true },
        { id: 'wider', text: 'a became more negative and the parabola got wider', code: 'width-for-height', feedback: 'Taller over the same span means a sharper bend: narrower, not wider. The zeros didn’t move apart.' },
        { id: 'pos', text: 'a moved toward zero (or became positive)', code: 'coefficient-sign', feedback: 'a = −4H/L². A bigger H makes −4H bigger in size, so a moves further from 0, staying negative.' },
        { id: 'same', text: 'a stayed the same; only the height changed', feedback: 'a depends on H: a = −4H/L². Watch the coefficient readout as you move the height slider.' }
      ], hints: ['Look at a in the readout before and after.', 'a = −4H/L². What happens to it when H grows and L stays?'], solution: `a = −4H/L²: with L fixed, a larger H makes |a| larger. a is more negative and the curve narrower, while the zeros stay at 0 and ${dec(m.L)}.` }
  ] };
}

// Mission 5: rebuild the equation from clues, in all three forms. Partial credit per form.
function m5(r) {
  const m = m_(...Object.values(pick(r, NICE)));
  const aSpec = { answer: m.aValue, decimalsOk: true, traps: [{ value: -m.aValue, code: 'coefficient-sign', message: 'A jump opens downward, so a is negative.' }, { value: -4 * m.H / m.L, code: 'wrong', message: 'Square the distance: a = −4H/L², not −4H/L.' }] };
  return { mission: 5, key: keyOf(m), model: m, clues: [`Maximum height: ${u(m.H)}`, `The apex is ${u(m.vertex.x)} from takeoff`, `The rider lands ${u(m.L)} from takeoff`], steps: [
    { id: 'm5-vertex-form', skills: ['forms', 'vertex', 'coefficient'], type: 'fields', template: 'y = a(x − h)² + k', graph: { hideEquation: true },
      prompt: 'Rebuild the equation in vertex form: y = a(x − h)² + k.',
      fields: [{ id: 'a', label: 'a', ...aSpec }, { id: 'h', label: 'h', answer: m.vertex.x, traps: [{ value: m.H, code: 'swapped-coordinates', message: 'h is the horizontal position of the apex.' }] }, { id: 'k', label: 'k', answer: m.H, traps: [{ value: m.vertex.x, code: 'swapped-coordinates', message: 'k is the height of the apex.' }] }],
      hints: ['The vertex (h, k) is the apex: where, and how high.', `h = ${dec(m.vertex.x)}, k = ${dec(m.H)}. Now find a.`, `a = −4H/L² = −4·${dec(m.H)} / ${dec(m.L)}².`],
      solution: `Vertex (${dec(m.vertex.x)}, ${dec(m.H)}) gives h and k. a = −4·${dec(m.H)}/${dec(m.L)}² = ${fstr(m.a)}. ${asText(vertexForm(m))}` },
    { id: 'm5-standard-form', skills: ['forms', 'coefficient'], type: 'fields', template: 'y = ax² + bx + c',
      prompt: 'Now the same jump in standard form: y = ax² + bx + c.',
      fields: [{ id: 'a', label: 'a', ...aSpec }, { id: 'b', label: 'b', answer: m.bValue, decimalsOk: true }, { id: 'c', label: 'c', answer: 0, traps: [{ value: m.H, code: 'form-confusion', message: 'c is the height at x = 0, the takeoff. That’s 0, not the maximum.' }] }],
      hints: ['a is the same in every form.', 'c is y when x = 0: the takeoff height.', `b = 4H/L = 4·${dec(m.H)}/${dec(m.L)}.`],
      solution: `Expanding: ${asText(standardForm(m))}. a = ${fstr(m.a)}, b = 4H/L = ${fstr(m.b)}, c = 0 (it takes off from the origin).` },
    { id: 'm5-factored-form', skills: ['forms', 'zeros'], type: 'fields', template: 'y = a(x − r₁)(x − r₂)', unordered: ['r1', 'r2'],
      prompt: 'And in factored form: y = a(x − r₁)(x − r₂).',
      fields: [{ id: 'a', label: 'a', ...aSpec }, { id: 'r1', label: 'r₁', answer: 0 }, { id: 'r2', label: 'r₂', answer: m.L, traps: [{ value: m.vertex.x, code: 'zero-for-vertex', message: 'The roots are the takeoff and landing, not the apex.' }] }],
      hints: ['The roots are where the jump meets the ground line.', `Takeoff and landing: 0 and ${dec(m.L)}.`, 'a is the same as before.'],
      solution: `Roots 0 and ${dec(m.L)}: ${asText(factoredForm(m))}.` }
  ] };
}

// Mission 6: everything at once. The first time it is the PRD's brief (16 m, 4 m).
function m6(r, first) {
  const s = first ? { L: 16, H: 4 } : pick(r, NICE), m = m_(s.L, s.H);
  return { mission: 6, key: keyOf(m), model: m, brief: `The design team has created a virtual jump with a horizontal range of ${u(m.L)} and a maximum modeled height of ${u(m.H)}.`, steps: [
    { id: 'm6-blueprint', skills: ['vertex', 'zeros', 'axis', 'coefficient', 'forms'], type: 'fields', unordered: ['z1', 'z2'],
      prompt: 'Complete the blueprint.',
      fields: [
        { id: 'vx', label: '1. Vertex x', answer: m.vertex.x, traps: [{ value: m.H, code: 'swapped-coordinates', message: 'Vertex x is a horizontal position.' }] },
        { id: 'vy', label: '1. Vertex y', answer: m.vertex.y, traps: [{ value: m.vertex.x, code: 'swapped-coordinates', message: 'Vertex y is the height.' }] },
        { id: 'z1', label: '2. First zero', answer: 0 },
        { id: 'z2', label: '2. Second zero', answer: m.L, traps: [{ value: m.vertex.x, code: 'zero-for-vertex', message: 'That’s the vertex’s x, not a zero.' }] },
        { id: 'ax', label: '3. Axis of symmetry: x =', answer: m.axis, traps: [{ value: m.H, code: 'axis-confusion', message: 'The axis is a vertical line, x = (horizontal position of the vertex).' }] },
        { id: 'a', label: '4. Leading coefficient a', answer: m.aValue, decimalsOk: true, traps: [{ value: -m.aValue, code: 'coefficient-sign', message: 'A jump opens downward: a is negative.' }] },
        { id: 'h', label: '5. Vertex form: h', answer: m.vertex.x },
        { id: 'k', label: '5. Vertex form: k', answer: m.H }
      ],
      hints: ['Start with the zeros: takeoff and landing.', 'The vertex and the axis are halfway between the zeros; the vertex is as high as the jump.', 'a = −4H/L².'],
      solution: `Vertex (${dec(m.vertex.x)}, ${dec(m.H)}); zeros 0 and ${dec(m.L)}; axis x = ${dec(m.axis)}; a = −4·${dec(m.H)}/${dec(m.L)}² = ${fstr(m.a)}; ${asText(vertexForm(m))}.` },
    { id: 'm6-meaning', skills: ['interpret', 'forms'], type: 'choice', prompt: `In ${asText(vertexForm(m))}, what does ${nice(m.k)} represent for the rider?`,
      options: [
        { id: 'k', text: `The maximum height, ${u(m.H)}`, correct: true },
        { id: 'h', text: 'Where the rider reaches the peak', code: 'swapped-coordinates', feedback: `That’s h = ${nice(m.h)}.` },
        { id: 'L', text: 'The jump distance', code: 'distance-for-height', feedback: `The distance is ${u(m.L)}, twice h.` },
        { id: 'a', text: 'How sharply the path curves', code: 'form-confusion', feedback: 'That’s a, the leading coefficient.' }
      ], hints: ['In vertex form, (h, k) is the vertex.'], solution: `k = ${nice(m.k)} is the vertex’s y-coordinate: the maximum modeled height, ${u(m.H)}.` },
    { id: 'm6-explain', skills: ['interpret'], type: 'written', prompt: 'In a sentence or two, explain what the vertex, the zeros and a mean for this jump.',
      model: `The vertex (${dec(m.vertex.x)}, ${dec(m.H)}) is the top of the flight: ${u(m.H)} up, ${u(m.vertex.x)} from takeoff. The zeros 0 and ${dec(m.L)} are the takeoff and landing. a = ${fstr(m.a)} is negative, so the path opens downward, and its size sets how sharply it curves.` }
  ] };
}

const BUILDERS = [m1, m2, m3, m4, m5, m6];
// Build mission n (1–6). replay 0 = the first version; higher = new numbers.
export function buildMission(n, replay = 0) {
  const r = rng(n * 7919 + replay * 104729 + 17);
  const mission = BUILDERS[n - 1](r, replay === 0);
  // A misconception check can't be the right answer (e.g. a 12 m × 6 m jump
  // has its vertex at (6, 6), so "swapped coordinates" means nothing there).
  const clean = spec => { if (spec.traps) spec.traps = spec.traps.filter(t => Math.abs(t.value - spec.answer) > 1e-9); };
  mission.steps.forEach(st => { if (st.fields) st.fields.forEach(clean); if (st.type === 'number') clean(st); });
  // Each run is its own set of questions, even if the numbers repeat.
  mission.key = `${mission.key}r${replay}`;
  mission.replay = replay;
  return mission;
}

// Every question kind the lab can report, with its skills (written answers
// aren't graded, so they aren't reported). Classes reads this to link each
// kind to curriculum skills (content/classes/activities.mjs).
export function questionKinds() {
  const out = {};
  const add = q => { if (q && q.id && q.type !== 'written') out[q.id] = q.skills; };
  [HOOK, MOD_A_Q, MOD_E_Q, modB(), modB().follow, modC(), modC().follow, modD(), ...DECODER_MATCH, ...decoderTranslate(1)].forEach(add);
  for (let n = 1; n <= 6; n++) buildMission(n, 0).steps.forEach(add);
  return out;
}
