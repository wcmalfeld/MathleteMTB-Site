// Ride Systems Lab: every graded question. Answers are computed from the
// models (logic/models.js), never typed in by hand. Each question has three
// progressive hints (concept, method, next step), a solution that says what
// the answer means on the bike or the trail, and traps: anticipated wrong
// answers, each with a misconception code and a message.
//
// Question shape: the lesson kit's ask() (learning-lab/lesson-kit/ask.js).

import { TRAIL, RELATIVE, BASE, BASE_DRIVE, BASE_GEAR, drivetrain, transform, makeProfile, FINAL_SETS, DISTANCES, pick, round, nf } from './models.js';
export { nf };

const opt = (id, text, correct, code, feedback) => ({ id, text, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const km = x => nf(x) + ' km', m = x => nf(x) + ' m', iv = (a, b, u) => `${nf(a)} to ${nf(b)}${u ? ' ' + u : ''}`;

// Generated numbers can make two anticipated mistakes give the same value;
// keep the first trap for each value, and never one the answer's tolerance
// would accept.
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object' || !q.type) continue;
    for (const f of q.type === 'number' ? [q] : q.type === 'fields' ? q.fields : []) {
      const seen = new Set();
      f.traps = (f.traps || []).filter(t => { const key = Math.round(t.value * 1e6); const clash = Math.abs(t.value - f.answer) <= Math.max(f.tolerance || 0, 1e-9); if (seen.has(key) || clash) return false; seen.add(key); return true; });
    }
  }
  return qs;
}
// Options are written correct-first; show them in a fixed order that differs
// from question to question.
function arrange(qs) {
  for (const [id, q] of Object.entries(qs)) {
    if (!q || q.type !== 'choice') continue;
    const k = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % q.options.length;
    q.options = q.options.slice(k).concat(q.options.slice(0, k));
  }
  return qs;
}

export const IDEAS = {
  notation: 'Function notation',
  evaluate: 'Evaluating functions',
  'domain-range': 'Domain and range',
  graph: 'Reading graphs (increasing, decreasing, maximum)',
  compose: 'Function composition',
  order: 'Composition order',
  transform: 'Function transformations',
  'transform-h': 'Horizontal transformations',
  'transform-v': 'Vertical transformations',
  inverse: 'Inverse functions',
  'one-to-one': 'One-to-one functions',
  restrict: 'Restricting a domain',
  'input-output': 'Inputs, outputs and what makes a function',
  operations: 'Combining functions (+, −, ×, ÷)'
};
// The PRD's twelve tracked skills, in its order.
export const REPORT_IDEAS = ['notation', 'evaluate', 'domain-range', 'graph', 'compose', 'order', 'transform', 'transform-h', 'transform-v', 'inverse', 'one-to-one', 'restrict'];

export const MISCONCEPTIONS = {
  'input-output': 'Mixing up the input and the output',
  'notation-multiply': 'Reading f(x) as f times x',
  'not-function': 'Thinking one input can have two outputs',
  'domain-range-swap': 'Swapping domain and range',
  'endpoint-not-max': 'Taking the finish as the highest (or lowest) point',
  relative: 'Mixing up relative and absolute elevation',
  'table-row': 'Reading the wrong row of the table',
  direction: 'Mixing up climbs and descents',
  'ratio-flip': 'Turning the gear ratio upside down',
  'ratio-other': 'Adding or subtracting teeth instead of dividing',
  'composition-add': 'Treating composition as addition',
  'skip-stage': 'Feeding an input into the wrong stage',
  units: 'Using an output in the wrong units',
  order: 'Thinking the order of composition never matters',
  'same-gear': 'Forgetting that the gear changed',
  'v-h-confuse': 'Confusing vertical and horizontal changes',
  'shift-vs-stretch': 'Confusing a shift with a stretch',
  'shift-sign': 'Reading h(d − k) as a shift left',
  'h-scale-backward': 'Getting horizontal stretch and compression backwards',
  'ignore-domain': 'Forgetting that the domain changes',
  'display-vs-real': 'Thinking a display change changes the real trail',
  reciprocal: 'Confusing an inverse with a reciprocal',
  'inverse-forward': 'Using the forward function instead of its inverse',
  'every-inverse': 'Assuming every function has an inverse',
  'no-restrict': 'Forgetting to restrict the domain',
  'domain-swap': 'Forgetting that domain and range swap',
  'outside-domain': 'Using a value outside the domain',
  'undefined-ok': 'Dividing where the denominator is zero'
};

// ================================================================ Mission 1: Read the Trail
const E = TRAIL, [D0, D1] = E.domain, [Y0, Y1] = E.range;
const peakD = E.argmax[0];
const H2460 = E.crossings(2460);
const segText = s => `${nf(s.from)} to ${nf(s.to)} km`;
const M1 = {
  't-eval': {
    type: 'number', ideas: ['evaluate', 'notation'], answer: E.at(2.5), tolerance: 0.5, unit: 'm', label: 'E(2.5)',
    prompt: 'What is E(2.5)? (Use the table or drag the marker on the graph.)',
    traps: [
      { value: 2.5, code: 'input-output', message: '2.5 is the input (the distance). E(2.5) is the output: the elevation there.' },
      { value: E.at(3), code: 'table-row', message: 'That’s E(3), the finish. Find the row for 2.5 km.' },
      { value: E.at(2.5) - BASE, code: 'relative', message: 'That’s how far above the start it is. E gives the elevation above sea level.' },
      { value: 2.5 * E.at(2.5), code: 'notation-multiply', message: 'E(2.5) isn’t E × 2.5. It means “the elevation at 2.5 km”.' }
    ],
    hints: ['E(d) means “the elevation at distance d”.', 'Find d = 2.5 in the distance column.', 'Read the elevation in the same row.'],
    solution: `E(2.5) = ${nf(E.at(2.5))}: at 2.5 km along the trail the rider is ${nf(E.at(2.5))} m above sea level, the highest point of the stage.`
  },
  't-notation': {
    type: 'choice', ideas: ['notation'],
    prompt: 'What does E(1.5) = 2500 mean?',
    options: [
      opt('a', 'At 1.5 km along the trail, the elevation is 2,500 m', true),
      opt('b', 'At 2,500 km along the trail, the elevation is 1.5 m', false, 'input-output', 'The number inside the brackets is the input (distance). The result is the output (elevation).'),
      opt('c', 'E multiplied by 1.5 equals 2,500', false, 'notation-multiply', 'Function notation isn’t multiplication. E(1.5) is the output of E when the input is 1.5.'),
      opt('d', 'The trail is 1.5 km long and climbs 2,500 m', false, 'input-output', 'The trail is 3 km long. E(1.5) is one point on it: the elevation at 1.5 km.')
    ],
    hints: ['In E(d), d goes in and E(d) comes out.', 'Here d = 1.5 and E(d) = 2500.', 'Say it as a sentence: at distance ___, the elevation is ___.'],
    solution: 'At 1.5 km along the trail, the rider is at 2,500 m. Input (inside the brackets): distance. Output (the value): elevation.'
  },
  't-input': {
    type: 'choice', ideas: ['input-output'],
    prompt: 'In E(d), which is the input and which is the output?',
    options: [
      opt('a', 'Input: distance along the trail. Output: elevation', true),
      opt('b', 'Input: elevation. Output: distance along the trail', false, 'input-output', 'You choose a distance and read off the elevation there, so distance goes in.'),
      opt('c', 'Input: time. Output: speed', false, 'input-output', 'This function doesn’t use time at all: it’s distance in, elevation out.'),
      opt('d', 'Both are inputs; the trail is the output', false, 'input-output', 'A function takes one input and gives one output. Here, distance in and elevation out.')
    ],
    hints: ['The input is what you choose; the output is what you get.', 'What goes inside the brackets of E(d)?', 'd is distance, so E(d) is…'],
    solution: 'Distance is the input (independent variable); elevation is the output (dependent variable). Pick a distance, and the profile tells you the elevation there.'
  },
  't-function': {
    type: 'choice', ideas: ['input-output'],
    prompt: 'A glitchy GPS file lists two different elevations at 1.0 km. What would that mean?',
    options: [
      opt('a', 'It isn’t a function any more: one input has two outputs', true),
      opt('b', 'It’s still a function: functions can have two outputs', false, 'not-function', 'A function gives exactly one output for each input. Two elevations at 1.0 km breaks that.'),
      opt('c', 'Only the range changes; it’s still a function', false, 'not-function', 'The problem is bigger: an input with two outputs means the relation isn’t a function.'),
      opt('d', 'The domain doubles, so it becomes two functions', false, 'domain-range-swap', 'The domain is still 0 to 3 km. The issue is one input getting two outputs.')
    ],
    hints: ['What’s the definition of a function?', 'Each input has exactly one output.', 'At 1.0 km, how many outputs would there be?'],
    solution: 'A function has exactly one output for every input. A rider at 1.0 km is at one elevation, so a file with two values there is an error: as a relation it isn’t a function.'
  },
  't-domain': {
    type: 'fields', ideas: ['domain-range'],
    prompt: 'What is the domain of E? (The smallest and largest distances.)',
    fields: [
      { id: 'lo', label: 'Smallest d', answer: D0, tolerance: 0.001, unit: 'km', traps: [{ value: Y0, code: 'domain-range-swap', message: 'That’s an elevation. The domain is the set of inputs: distances.' }] },
      { id: 'hi', label: 'Largest d', answer: D1, tolerance: 0.001, unit: 'km', traps: [{ value: Y1, code: 'domain-range-swap', message: 'That’s an elevation. The domain is the distances.' }, { value: peakD, code: 'endpoint-not-max', message: 'That’s where the high point is. The domain runs to the finish.' }] }
    ],
    hints: ['The domain is every input the function accepts.', 'The inputs are distances along this trail.', 'Where does the trail start and finish?'],
    solution: `Domain: ${nf(D0)} ≤ d ≤ ${nf(D1)} km. The distance can’t be less than the start or more than the finish.`
  },
  't-range': {
    type: 'fields', ideas: ['domain-range', 'graph'],
    prompt: 'What is the range of E? (The lowest and highest elevations.)',
    fields: [
      { id: 'lo', label: 'Lowest E(d)', answer: Y0, tolerance: 0.5, unit: 'm', traps: [{ value: E.at(1), code: 'endpoint-not-max', message: 'That’s a low point in the middle, but the start is lower still.' }, { value: D0, code: 'domain-range-swap', message: 'That’s a distance. The range is the elevations.' }, { value: 0, code: 'relative', message: 'That’s relative to the start. Use elevation above sea level.' }] },
      { id: 'hi', label: 'Highest E(d)', answer: Y1, tolerance: 0.5, unit: 'm', traps: [{ value: E.at(3), code: 'endpoint-not-max', message: 'That’s the finish elevation, but the trail is higher at 2.5 km.' }, { value: D1, code: 'domain-range-swap', message: 'That’s a distance. The range is the elevations.' }, { value: Y1 - BASE, code: 'relative', message: 'That’s relative to the start. Use elevation above sea level.' }] }
    ],
    hints: ['The range is every output the function gives.', 'Look for the lowest and highest points on the graph, not just the ends.', 'Scan the elevation column for its smallest and largest values.'],
    solution: `Range: ${nf(Y0)} ≤ E(d) ≤ ${nf(Y1)} m: from the start (the lowest point) to the top of the last climb at ${nf(peakD)} km (the highest).`
  },
  't-increasing': {
    type: 'multi', ideas: ['graph'],
    prompt: 'On which intervals is E increasing (the trail climbs)?',
    options: E.segments.map(s => opt('s' + nf(s.from).replace('.', '_'), segText(s), s.dir === 'up', 'direction', `From ${segText(s)} the elevation goes ${s.y1 > s.y0 ? 'up' : 'down'}: ${nf(s.y0)} m → ${nf(s.y1)} m.`)),
    hints: ['Increasing means the output goes up as the input goes up.', 'Read the graph left to right: which pieces slope upward?', 'Compare each pair of neighbouring rows in the table.'],
    solution: `E increases on ${E.runs.filter(r => r.dir === 'up').map(r => segText(r)).join(', ')} (the climbs) and decreases on ${E.runs.filter(r => r.dir === 'down').map(r => segText(r)).join(', ')} (the descents).`
  },
  't-max': {
    type: 'number', ideas: ['graph', 'input-output'], answer: peakD, tolerance: 0.001, unit: 'km', label: 'Distance of the high point',
    prompt: 'At what distance does the trail reach its highest point?',
    traps: [
      { value: Y1, code: 'input-output', message: 'That’s the highest elevation (the output). The question asks where: the distance (the input).' },
      { value: D1, code: 'endpoint-not-max', message: 'The finish isn’t the highest point: the trail drops after 2.5 km.' },
      { value: 1.5, code: 'endpoint-not-max', message: 'That’s a high point, but not the highest. Look further along.' }
    ],
    hints: ['A maximum is the highest output.', 'Find the largest elevation first.', 'Then read the distance in that row.'],
    solution: `The maximum is E(${nf(peakD)}) = ${nf(Y1)} m: the top of the last climb, ${nf(peakD)} km along the trail.`
  },
  't-hlt': {
    type: 'choice', ideas: ['one-to-one'],
    prompt: 'If you only knew a rider’s elevation (say 2,460 m), could you always tell exactly how far along the trail they were?',
    options: [
      opt('a', 'No: 2,460 m happens at two different distances', true),
      opt('b', 'Yes: every elevation happens exactly once', false, 'every-inverse', `Draw a horizontal line at 2,460 m: it crosses the profile at ${H2460.map(nf).join(' and ')} km.`),
      opt('c', 'Yes, because E is a function', false, 'every-inverse', 'Being a function means one output for each input. Going backward needs one input for each output, and that fails here.'),
      opt('d', 'Only if the rider is at the very start of the trail', false, 'every-inverse', 'Even away from the start, many elevations happen more than once on this trail.')
    ],
    hints: ['Draw a horizontal line at 2,460 m.', 'Count where it crosses the profile.', 'More than one crossing means more than one distance.'],
    solution: `The horizontal line at 2,460 m crosses the profile ${H2460.length} times (${H2460.map(x => nf(round(x, 3))).join(' km and ')} km). Elevation alone doesn’t pin down a location: the profile isn’t one-to-one.`
  }
};

// ================================================================ Mission 2: The Gearbox Lab
const B = BASE_DRIVE, C80 = BASE_GEAR.cadence, W80 = B.f(C80), V80 = B.S(C80);
const G24 = drivetrain({ front: 32, rear: 24, circumference: 2.30 });
const M2 = {
  'g-ratio': {
    type: 'number', ideas: ['compose'], answer: B.G, tolerance: 0.001, label: 'Gear ratio',
    prompt: `The chainring has ${B.front} teeth and the rear sprocket has ${B.rear}. What is the gear ratio (rear-wheel turns per crank turn)?`,
    traps: [
      { value: B.rear / B.front, code: 'ratio-flip', message: 'That’s rear ÷ front. Each crank turn pulls 32 links of chain through a 16-tooth sprocket: front ÷ rear.' },
      { value: B.front + B.rear, code: 'ratio-other', message: 'Adding the teeth doesn’t give a ratio. Divide them.' },
      { value: B.front - B.rear, code: 'ratio-other', message: 'Subtracting doesn’t give a ratio. Divide front by rear.' }
    ],
    hints: ['A ratio compares two numbers by dividing.', 'One crank turn moves 32 teeth of chain. How many turns of a 16-tooth sprocket is that?', 'G = front teeth ÷ rear teeth.'],
    solution: `G = ${B.front} ÷ ${B.rear} = ${nf(B.G)}. Each crank turn turns the rear wheel ${nf(B.G)} times in this simplified fixed-gear model.`
  },
  'g-wheel': {
    type: 'number', ideas: ['evaluate', 'compose'], answer: W80, tolerance: 0.01, unit: 'RPM', label: 'f(80)',
    prompt: `f(c) = ${nf(B.G)}c gives rear-wheel RPM from cadence. If the pedals turn at ${C80} RPM, how fast does the rear wheel turn?`,
    traps: [
      { value: C80 / B.G, code: 'ratio-flip', message: 'f(c) = 2c multiplies by 2. Dividing would make the wheel slower than the pedals.' },
      { value: C80 + B.G, code: 'notation-multiply', message: 'f(80) = 2 × 80, not 80 + 2.' },
      { value: C80, code: 'skip-stage', message: 'That’s the cadence. The wheel turns faster: 2 turns per crank turn.' }
    ],
    hints: ['Substitute c = 80 into f(c) = 2c.', 'f(80) = 2 × 80.', 'The units are RPM: wheel turns per minute.'],
    solution: `f(${C80}) = ${nf(B.G)} × ${C80} = ${nf(W80)} RPM. The rear wheel turns ${nf(W80)} times a minute.`
  },
  'g-speed': {
    type: 'number', ideas: ['evaluate', 'compose'], answer: V80, tolerance: 0.01, unit: 'km/h', label: 'g(160)',
    prompt: `g(w) = ${nf(B.kg)}w turns wheel RPM into km/h (a ${nf(B.circumference)} m wheel: 60 × ${nf(B.circumference)} ÷ 1000 = ${nf(B.kg)}). If the wheel turns at ${nf(W80)} RPM, how fast is the bike going?`,
    traps: [
      { value: W80 * B.circumference, code: 'units', message: 'That’s metres per minute. Multiply by 60 for an hour and divide by 1000 for km: g(w) = 0.138w.' },
      { value: W80 * B.circumference / 1000, code: 'units', message: 'That’s km per minute. Multiply by 60 for km/h.' },
      { value: B.kg * C80, code: 'skip-stage', message: 'That puts the cadence into g. g needs the wheel RPM: f’s output.' }
    ],
    hints: ['Substitute w = 160 into g(w) = 0.138w.', 'Each wheel turn rolls 2.30 m; 160 turns a minute is 368 m a minute.', '0.138 × 160 converts that straight to km/h.'],
    solution: `g(${nf(W80)}) = ${nf(B.kg)} × ${nf(W80)} = ${nf(round(V80, 2))} km/h. The output of f became the input of g.`
  },
  'g-compose': {
    type: 'choice', ideas: ['compose'],
    prompt: 'Combine the two stages into one speed function S(c) = g(f(c)). Which is right?',
    options: [
      opt('a', `S(c) = ${nf(B.kg)}(${nf(B.G)}c) = ${nf(B.k)}c`, true),
      opt('b', `S(c) = ${nf(B.G)}c + ${nf(B.kg)}c = ${nf(B.G + B.kg)}c`, false, 'composition-add', 'Composition isn’t addition. f’s output goes into g: g(f(c)) = 0.138 × (2c).'),
      opt('c', `S(c) = ${nf(B.kg)}c`, false, 'skip-stage', 'That skips the gears: it treats cadence as if it were wheel RPM.'),
      opt('d', `S(c) = ${nf(B.G)} + ${nf(B.kg)}c`, false, 'composition-add', 'Substitute f(c) for w in g(w) = 0.138w: g(2c) = 0.138 × 2c.')
    ],
    hints: ['Composition means the output of one function is the input of the next.', 'Replace w in g(w) = 0.138w with f(c) = 2c.', '0.138 × 2c = ?'],
    solution: `g(f(c)) = ${nf(B.kg)} × (${nf(B.G)}c) = ${nf(B.k)}c. One function now goes straight from cadence to speed: S(${C80}) = ${nf(round(V80, 2))} km/h, the same as doing the two stages one at a time.`
  },
  'g-order': {
    type: 'choice', ideas: ['order'],
    prompt: 'Why is it g(f(c)) and not f(g(c))?',
    options: [
      opt('a', 'g gives a speed in km/h, but f needs a cadence in RPM, so f(g(c)) means nothing', true),
      opt('b', 'f(g(c)) gives a different, wrong number', false, 'order', `Try it: f(g(80)) = 2 × (0.138 × 80) = 22.08, the same number! Both stages just multiply, so the number matches. It’s the units that make f(g(c)) meaningless.`),
      opt('c', 'Order never matters in composition, so either is fine', false, 'order', 'Order usually does change the result, and here f(g(c)) puts a speed into a function that expects pedal turns.'),
      opt('d', 'Because g comes before f in the alphabet', false, 'order', 'The order follows the bike: pedals → wheel → speed. f acts first, then g.')
    ],
    hints: ['What does each function take in, and what does it give out?', 'f: cadence (RPM) → wheel RPM. g: wheel RPM → km/h.', 'In f(g(c)), what would f be given?'],
    solution: 'The order follows the drivetrain: pedals turn the wheel (f), then the wheel moves the bike (g). f(g(c)) would feed a speed in km/h into a function expecting cadence. Here the numbers happen to match because both stages are multiplications, which is exactly why units, not numbers, decide the order.'
  },
  'g-range': {
    type: 'fields', ideas: ['domain-range', 'compose'],
    prompt: `The model only covers cadences from ${B.domain[0]} to ${B.domain[1]} RPM. What speeds does S cover?`,
    fields: [
      { id: 'lo', label: 'Slowest speed', answer: B.range[0], tolerance: 0.01, unit: 'km/h', traps: [{ value: B.domain[0], code: 'domain-range-swap', message: 'That’s the lowest cadence (the domain). The range is S of it.' }, { value: B.kg * B.domain[0], code: 'skip-stage', message: 'That leaves out the gear ratio. Use S(c) = 0.276c.' }] },
      { id: 'hi', label: 'Fastest speed', answer: B.range[1], tolerance: 0.01, unit: 'km/h', traps: [{ value: B.domain[1], code: 'domain-range-swap', message: 'That’s the highest cadence. Put it into S.' }, { value: B.kg * B.domain[1], code: 'skip-stage', message: 'That leaves out the gear ratio. Use S(c) = 0.276c.' }] }
    ],
    hints: ['The range is the outputs for every input in the domain.', 'S is increasing, so the ends of the domain give the ends of the range.', 'Work out S(40) and S(110).'],
    solution: `S(${B.domain[0]}) = ${nf(round(B.range[0], 2))} and S(${B.domain[1]}) = ${nf(round(B.range[1], 2))}, so ${nf(round(B.range[0], 2))} ≤ S(c) ≤ ${nf(round(B.range[1], 2))} km/h. Outside 40–110 RPM the model isn’t meant to be used.`
  },
  'g-gear-change': {
    type: 'number', ideas: ['compose', 'evaluate'], answer: G24.S(C80), tolerance: 0.01, unit: 'km/h', label: 'Speed',
    prompt: `Shift to the 24-tooth sprocket and keep pedalling at ${C80} RPM. What speed does the bike go now?`,
    traps: [
      { value: V80, code: 'same-gear', message: 'That’s the speed in the 16T sprocket. The ratio is now 32 ÷ 24.' },
      { value: B.kg * (24 / 32) * C80, code: 'ratio-flip', message: 'That uses 24 ÷ 32. The ratio is front ÷ rear: 32 ÷ 24.' }
    ],
    hints: ['Only the gear ratio changes.', 'G = 32 ÷ 24 = 4/3, so f(c) = (4/3)c.', 'S(c) = 0.138 × (4/3)c. Put in c = 80.'],
    solution: `G = 32 ÷ 24 = 4/3, so S(c) = 0.138 × (4/3)c = ${nf(round(G24.k, 4))}c, and S(${C80}) = ${nf(round(G24.S(C80), 2))} km/h. A bigger sprocket means fewer wheel turns per crank turn: easier to pedal, slower.`
  },
  'g-circ': {
    type: 'choice', ideas: ['compose'],
    prompt: 'You fit a tire with a smaller circumference (2.20 m instead of 2.30 m) and keep the same cadence and gear. What changes?',
    options: [
      opt('a', 'The speed drops, but the wheel RPM stays the same', true),
      opt('b', 'Both the wheel RPM and the speed drop', false, 'skip-stage', 'Wheel RPM comes from f(c) = 2c, which doesn’t use the tire at all.'),
      opt('c', 'The wheel RPM drops, but the speed stays the same', false, 'skip-stage', 'It’s the other way round: circumference only appears in g, the RPM-to-speed stage.'),
      opt('d', 'Nothing changes, since cadence and gear are the same', false, 'skip-stage', 'Each wheel turn now rolls less distance, so g changes and so does the speed.')
    ],
    hints: ['Which stage uses the wheel circumference?', 'f uses the gears; g uses the circumference.', 'Changing g changes only the last step.'],
    solution: `Circumference only appears in g(w) = (60C/1000)w. The wheel still turns ${nf(W80)} times a minute, but each turn rolls 2.20 m instead of 2.30 m, so the speed drops to ${nf(round(60 * 2.2 / 1000, 4))} × ${nf(W80)} = ${nf(round(drivetrain({ front: 32, rear: 16, circumference: 2.2 }).S(C80), 2))} km/h.`
  }
};

// ================================================================ Mission 3: Transform the Trail
const h = RELATIVE, hPeak = h.argmax[0];
const M3 = {
  'x-relative': {
    type: 'number', ideas: ['evaluate', 'transform-v'], answer: h.at(2.5), tolerance: 0.5, unit: 'm', label: 'h(2.5)',
    prompt: `h(d) = E(d) − ${BASE} gives the elevation relative to the start. What is h(2.5)?`,
    traps: [{ value: E.at(2.5), code: 'relative', message: 'That’s E(2.5), above sea level. Subtract the 2,400 m start.' }, { value: 2.5, code: 'input-output', message: '2.5 is the input. h(2.5) is the output.' }],
    hints: ['h(d) = E(d) − 2400.', 'E(2.5) = 2550.', '2550 − 2400 = ?'],
    solution: `h(2.5) = ${nf(E.at(2.5))} − ${BASE} = ${nf(h.at(2.5))} m: the high point is ${nf(h.at(2.5))} m above the start. Adding ${BASE} back, E(d) = h(d) + ${BASE}, is a vertical shift.`
  },
  'x-shift-up': {
    type: 'choice', ideas: ['transform-v', 'transform'],
    prompt: 'What does g(d) = h(d) + 50 do to the graph?',
    options: [
      opt('a', 'Every point moves up 50 m; the shape stays the same', true),
      opt('b', 'Every point moves right 50 km', false, 'v-h-confuse', 'Adding to the output (outside the brackets) moves the graph up or down, not sideways.'),
      opt('c', 'The climbs become 50 times steeper', false, 'shift-vs-stretch', 'That would be multiplying. Adding 50 shifts every point by the same amount.'),
      opt('d', 'Only the peaks move up 50 m', false, 'shift-vs-stretch', 'Adding 50 changes every output by 50, valleys and peaks alike.')
    ],
    hints: ['The + 50 is outside the brackets: it changes outputs.', 'Every output becomes 50 bigger.', 'What happens to a graph when every y-value goes up by the same amount?'],
    solution: 'Every output goes up by 50, so the whole profile moves up 50 m without changing shape. Outside the brackets means vertical.'
  },
  'x-stretch': {
    type: 'number', ideas: ['transform-v', 'evaluate'], answer: 1.5 * h.at(2.5), tolerance: 0.5, unit: 'm', label: 'g(2.5)',
    prompt: 'Vertical exaggeration: g(d) = 1.5h(d). What is g(2.5)?',
    traps: [
      { value: h.at(2.5) + 1.5, code: 'shift-vs-stretch', message: 'That adds 1.5. g(d) = 1.5h(d) multiplies every output by 1.5.' },
      { value: h.at(2.5) / 1.5, code: 'shift-vs-stretch', message: 'That divides. A factor of 1.5 makes outputs bigger.' }
    ],
    hints: ['The 1.5 is outside the brackets.', 'Find h(2.5) first.', 'Multiply it by 1.5.'],
    solution: `g(2.5) = 1.5 × ${nf(h.at(2.5))} = ${nf(1.5 * h.at(2.5))} m. Every climb looks 1.5 times as tall: a vertical stretch.`
  },
  'x-display': {
    type: 'choice', ideas: ['transform-v'],
    prompt: 'You set your mapping software to 1.5× vertical exaggeration. Is the real climb now steeper?',
    options: [
      opt('a', 'No: only the display is stretched; the mountain is the same', true),
      opt('b', 'Yes: every climb is now 1.5 times as high', false, 'display-vs-real', 'Changing how a graph is drawn doesn’t move any dirt. The real climb is still the same.'),
      opt('c', 'Yes, but only the climbs, not the descents', false, 'display-vs-real', 'The display stretches everything vertically, and the real trail doesn’t change at all.'),
      opt('d', 'Only if the trail is shorter than 3 km', false, 'display-vs-real', 'Length has nothing to do with it: a display setting can’t change the trail.')
    ],
    hints: ['What is being transformed: the trail, or the graph of it?', 'g(d) = 1.5h(d) is a new function for drawing.', 'Does redrawing a graph change the ground?'],
    solution: 'The transformation changes the function used for the display, not the trail. Vertical exaggeration makes features easier to see; the real climb is unchanged.'
  },
  'x-hscale': {
    type: 'number', ideas: ['transform-h'], answer: hPeak / 2, tolerance: 0.001, unit: 'km', label: 'Where the peak appears',
    prompt: `In g(d) = h(2d), where does the high point (at ${nf(hPeak)} km on h) appear?`,
    traps: [
      { value: hPeak * 2, code: 'h-scale-backward', message: 'h(2d) reaches h’s values twice as fast, so features appear at half the distance, not double.' },
      { value: hPeak, code: 'ignore-domain', message: 'The 2 is inside the brackets, so the graph changes horizontally.' }
    ],
    hints: ['g(d) = h(2d) reaches the peak when 2d = 2.5.', 'Solve 2d = 2.5.', 'Inside the brackets, ×2 compresses the graph toward d = 0.'],
    solution: `2d = ${nf(hPeak)} gives d = ${nf(hPeak / 2)} km. Multiplying the input by 2 squeezes the graph horizontally by a factor of 2: every feature appears at half the distance.`
  },
  'x-hdomain': {
    type: 'fields', ideas: ['transform-h', 'domain-range'],
    prompt: 'And what is the domain of g(d) = h(2d)?',
    fields: [
      { id: 'lo', label: 'From', answer: 0, tolerance: 0.001, unit: 'km' },
      { id: 'hi', label: 'To', answer: transform(h, { b: 2 }).domain[1], tolerance: 0.001, unit: 'km', traps: [{ value: 6, code: 'h-scale-backward', message: 'h(2d) needs 2d between 0 and 3, so d is between 0 and 1.5.' }, { value: 3, code: 'ignore-domain', message: 'The domain changes too: 2d must stay inside h’s domain of 0 to 3.' }] }
    ],
    hints: ['h only accepts inputs from 0 to 3.', 'So 0 ≤ 2d ≤ 3.', 'Divide by 2.'],
    solution: '0 ≤ 2d ≤ 3 gives 0 ≤ d ≤ 1.5. A horizontal compression shrinks the domain too.'
  },
  'x-hshift': {
    type: 'choice', ideas: ['transform-h'],
    prompt: 'Which way does g(d) = h(d − 0.5) move the profile?',
    options: [
      opt('a', '0.5 km to the right', true),
      opt('b', '0.5 km to the left', false, 'shift-sign', 'It feels backwards, but g reaches h’s value at 0 only when d − 0.5 = 0, at d = 0.5: further right.'),
      opt('c', '0.5 m up', false, 'v-h-confuse', 'The change is inside the brackets, so it moves the graph sideways, not up.'),
      opt('d', '0.5 m down', false, 'v-h-confuse', 'Inside the brackets changes the input: a horizontal move.')
    ],
    hints: ['Where does g start? Solve d − 0.5 = 0.', 'The start moves from d = 0 to d = 0.5.', 'Bigger d is further right.'],
    solution: 'h(d − 0.5) gives at d the value h had at d − 0.5, so every feature appears 0.5 km later: the graph moves right. h(d + 0.5) would move it left.'
  },
  'x-hshift-peak': {
    type: 'number', ideas: ['transform-h'], answer: hPeak - 0.5, tolerance: 0.001, unit: 'km', label: 'Where the peak appears',
    prompt: 'In g(d) = h(d + 0.5), where does the high point appear?',
    traps: [{ value: hPeak + 0.5, code: 'shift-sign', message: 'h(d + 0.5) moves the graph left: the peak arrives 0.5 km sooner.' }, { value: hPeak, code: 'ignore-domain', message: 'The + 0.5 is inside the brackets, so the graph moves sideways.' }],
    hints: ['The peak is where the input to h is 2.5.', 'Solve d + 0.5 = 2.5.', 'd = 2.5 − 0.5.'],
    solution: `d + 0.5 = ${nf(hPeak)} gives d = ${nf(hPeak - 0.5)} km. A + inside the brackets moves the graph left. (This is a coordinate change, not the trail moving.)`
  },
  'x-reflect': {
    type: 'choice', ideas: ['transform-v', 'transform'],
    prompt: 'What does g(d) = −h(d) show?',
    options: [
      opt('a', 'The profile flipped across the horizontal axis: climbs drawn as drops', true),
      opt('b', 'The trail ridden backwards, finish to start', false, 'v-h-confuse', 'Riding it backwards is h(−d) or h(3 − d), a left–right flip. The minus outside flips up–down.'),
      opt('c', 'The same profile 1 m lower', false, 'shift-vs-stretch', '−h(d) multiplies by −1; it doesn’t subtract 1.'),
      opt('d', 'A graph with no outputs, since elevations can’t be negative', false, 'display-vs-real', 'Relative elevations can be negative (below the start). −h(d) is a valid function.')
    ],
    hints: ['The minus sign is outside the brackets.', 'Every output is multiplied by −1.', 'What happens to a point (d, 100)?'],
    solution: 'Every output changes sign: (2.5, 150) becomes (2.5, −150). The graph reflects across the horizontal axis, so climbs appear as descents.'
  },
  'x-match': {
    type: 'fields', ideas: ['transform', 'transform-v'],
    prompt: 'Match the target in the studio, then write it as g(d) = a·h(d) + k. What are a and k?',
    fields: [
      { id: 'a', label: 'Vertical factor a', answer: 2, tolerance: 0.001, traps: [{ value: 40, code: 'shift-vs-stretch', message: '40 is the shift. a is what every output is multiplied by.' }, { value: 1, code: 'shift-vs-stretch', message: 'The target is taller, not just higher: the climbs are stretched as well as lifted.' }] },
      { id: 'k', label: 'Vertical shift k', answer: 40, tolerance: 0.001, unit: 'm', traps: [{ value: 2, code: 'shift-vs-stretch', message: '2 is the stretch factor. k is how far the whole graph moves up.' }] }
    ],
    hints: ['Compare the start (d = 0, where h = 0): how high is the target there?', 'At d = 0, g(0) = a·0 + k = k.', 'Then compare the peak: g(2.5) = a × 150 + k.'],
    solution: 'At d = 0 the target is at 40, so k = 40. At the peak it’s at 340 = a × 150 + 40, so a = 2. g(d) = 2h(d) + 40: stretched vertically by 2, then shifted up 40 m.'
  }
};

// ================================================================ Mission 4: Reverse the Ride
const INV = E.inverseOn(1, 1.5), V25 = 25;
const M4 = {
  'r-inverse-formula': {
    type: 'choice', ideas: ['inverse'],
    prompt: `S(c) = ${nf(B.k)}c gives speed from cadence. Which function gives the cadence needed for a speed v?`,
    options: [
      opt('a', `S⁻¹(v) = v ÷ ${nf(B.k)}`, true),
      opt('b', `S⁻¹(v) = ${nf(B.k)}v`, false, 'inverse-forward', 'That’s S again with v in place of c. The inverse has to undo × 0.276.'),
      opt('c', `S⁻¹(v) = 1 ÷ (${nf(B.k)}v)`, false, 'reciprocal', 'S⁻¹ isn’t 1 over S. It undoes S: S⁻¹(22.08) should give back 80.'),
      opt('d', `S⁻¹(v) = ${nf(B.k)} ÷ v`, false, 'reciprocal', 'Try v = 22.08: 0.276 ÷ 22.08 is about 0.0125, not 80 RPM.')
    ],
    hints: ['An inverse undoes the function.', 'S multiplies cadence by 0.276. What undoes multiplying?', 'Solve v = 0.276c for c.'],
    solution: `v = ${nf(B.k)}c, so c = v ÷ ${nf(B.k)}. S⁻¹(v) = v ÷ ${nf(B.k)}: speed in, cadence out.`
  },
  'r-eval': {
    type: 'number', ideas: ['inverse', 'evaluate'], answer: B.Sinv(V80), tolerance: 0.01, unit: 'RPM', label: 'S⁻¹(22.08)',
    prompt: `The rider wants to go ${nf(round(V80, 2))} km/h. What is S⁻¹(${nf(round(V80, 2))})?`,
    traps: [
      { value: B.S(V80), code: 'inverse-forward', message: 'That’s S(22.08): you put the speed into the forward function. Use S⁻¹(v) = v ÷ 0.276.' },
      { value: 1 / V80, code: 'reciprocal', message: 'That’s 1 ÷ 22.08. The inverse isn’t a reciprocal: it undoes S.' },
      { value: 1 / B.S(V80), code: 'reciprocal', message: 'That’s 1 ÷ S(22.08). S⁻¹ means the inverse function, not 1 over S.' }
    ],
    hints: ['S⁻¹(v) = v ÷ 0.276.', 'Put v = 22.08.', '22.08 ÷ 0.276 = ?'],
    solution: `S⁻¹(${nf(round(V80, 2))}) = ${nf(round(V80, 2))} ÷ ${nf(B.k)} = ${nf(round(B.Sinv(V80), 6))} RPM. That’s the cadence we started with: the inverse undid S.`
  },
  'r-verify': {
    type: 'number', ideas: ['inverse'], answer: 90, tolerance: 0.01, unit: 'RPM', label: 'S⁻¹(S(90))',
    prompt: 'Without a calculator if you can: what is S⁻¹(S(90))?',
    traps: [{ value: B.S(90), code: 'inverse-forward', message: 'That’s S(90). Then S⁻¹ undoes it.' }, { value: 1, code: 'reciprocal', message: 'S⁻¹(S(x)) isn’t S ÷ S. The inverse undoes S, giving back the input.' }],
    hints: ['S⁻¹ undoes S.', 'S turns 90 RPM into a speed; S⁻¹ turns that speed back into…', 'Composing a function with its inverse gives the input back.'],
    solution: 'S⁻¹(S(90)) = 90. A function and its inverse undo each other: S⁻¹(S(c)) = c for every c in the domain. That’s how you verify an inverse.'
  },
  'r-swap': {
    type: 'choice', ideas: ['inverse', 'domain-range'],
    prompt: `S has domain ${nf(B.domain[0])}–${nf(B.domain[1])} RPM and range ${nf(round(B.range[0], 2))}–${nf(round(B.range[1], 2))} km/h. What is the domain of S⁻¹?`,
    options: [
      opt('a', `${nf(round(B.range[0], 2))} ≤ v ≤ ${nf(round(B.range[1], 2))} km/h`, true),
      opt('b', `${nf(B.domain[0])} ≤ v ≤ ${nf(B.domain[1])} RPM`, false, 'domain-swap', 'S⁻¹ takes speeds in. Its domain is S’s range: domain and range swap.'),
      opt('c', 'Every positive number', false, 'outside-domain', 'The model only covers 40–110 RPM, so it only reverses speeds from 11.04 to 30.36 km/h.'),
      opt('d', `0 ≤ v ≤ ${nf(B.domain[1])} km/h`, false, 'domain-swap', 'The inputs to S⁻¹ are the speeds S can produce: S’s range.')
    ],
    hints: ['What does S⁻¹ take in?', 'S⁻¹ takes speeds and gives cadences.', 'Which speeds can S produce?'],
    solution: `Domain and range swap: S⁻¹ accepts the speeds S can produce, ${nf(round(B.range[0], 2))}–${nf(round(B.range[1], 2))} km/h, and returns cadences from ${nf(B.domain[0])} to ${nf(B.domain[1])} RPM.`
  },
  'r-target': {
    type: 'number', ideas: ['inverse'], answer: B.Sinv(V25), tolerance: 0.1, unit: 'RPM', label: 'Cadence',
    prompt: `What cadence does the rider need for ${V25} km/h? (One decimal place.)`,
    traps: [{ value: B.S(V25), code: 'inverse-forward', message: 'That’s S(25). Divide by 0.276 instead.' }, { value: 1 / B.S(V25), code: 'reciprocal', message: 'The inverse isn’t a reciprocal. Use v ÷ 0.276.' }],
    hints: ['Use S⁻¹(v) = v ÷ 0.276.', `v = ${V25}.`, `${V25} ÷ 0.276 = ?`],
    solution: `S⁻¹(${V25}) = ${V25} ÷ ${nf(B.k)} ≈ ${nf(round(B.Sinv(V25), 1))} RPM, inside the model’s 40–110 RPM.`
  },
  'r-hlt-speed': {
    type: 'choice', ideas: ['one-to-one'],
    prompt: 'Does the speed-versus-cadence graph pass the horizontal line test on 40–110 RPM?',
    options: [
      opt('a', 'Yes: it’s a rising straight line, so each speed comes from one cadence', true),
      opt('b', 'No: a straight line always crosses a horizontal line twice', false, 'every-inverse', 'A rising straight line crosses each horizontal line once.'),
      opt('c', 'Yes, because every function passes the horizontal line test', false, 'every-inverse', 'Not every function does. The trail profile fails it at 2,460 m.'),
      opt('d', 'No: the vertical line test is the one that matters here', false, 'every-inverse', 'The vertical line test checks it’s a function. The horizontal line test checks it can be reversed.')
    ],
    hints: ['The horizontal line test: does any horizontal line cross the graph more than once?', 'S(c) = 0.276c is a straight line going up.', 'Can a rising straight line hit the same height twice?'],
    solution: 'S increases steadily, so every horizontal line crosses it at most once: each speed comes from exactly one cadence. S is one-to-one on its domain, so it has an inverse function.'
  },
  'r-profile': {
    type: 'choice', ideas: ['one-to-one', 'restrict'],
    prompt: 'Does the whole Pine Ridge profile E have an inverse function?',
    options: [
      opt('a', 'No: it fails the horizontal line test (2,460 m happens twice)', true),
      opt('b', 'Yes: every function has an inverse', false, 'every-inverse', 'Only one-to-one functions do. The trail goes up and down, so some elevations repeat.'),
      opt('c', 'Yes: just swap the columns of the table', false, 'every-inverse', 'Swapping gives a relation, but 2,460 m would have two distances: not a function.'),
      opt('d', 'Yes, but only if you use relative elevation instead', false, 'every-inverse', 'h(d) = E(d) − 2400 has the same shape, so it fails the test in the same places.')
    ],
    hints: ['Which test decides whether an inverse is a function?', 'Draw a horizontal line at 2,460 m.', 'How many distances share that elevation?'],
    solution: 'Some elevations happen at more than one distance, so reversing E would give two outputs for one input. The full profile isn’t one-to-one, so its inverse isn’t a function, unless we restrict the domain.'
  },
  'r-restrict': {
    type: 'choice', ideas: ['restrict'],
    prompt: 'Which restricted domain makes E one-to-one?',
    options: [
      opt('a', '1.0 ≤ d ≤ 1.5 km', true),
      opt('b', '0 ≤ d ≤ 1.0 km', false, 'no-restrict', 'That piece climbs then drops, so elevations between 2,430 and 2,460 m repeat.'),
      opt('c', '0.5 ≤ d ≤ 1.5 km', false, 'no-restrict', 'That piece drops then climbs: 2,450 m happens twice.'),
      opt('d', '0 ≤ d ≤ 3 km', false, 'no-restrict', 'That’s the whole trail, which fails the horizontal line test.')
    ],
    hints: ['You need a piece that only climbs (or only descends).', 'Look for a single uphill segment.', 'Check the table: from 1.0 to 1.5 km the elevation goes 2,430 → 2,500.'],
    solution: 'From 1.0 to 1.5 km the trail climbs steadily, so each elevation from 2,430 to 2,500 m happens once. On that restricted domain E is one-to-one and has an inverse.'
  },
  'r-einv': {
    type: 'number', ideas: ['inverse', 'restrict'], answer: INV.f(2460), tolerance: 0.001, unit: 'km', label: 'E⁻¹(2460)',
    prompt: `On 1 ≤ d ≤ 1.5, E(d) = ${INV.formula.y0} + ${nf(INV.formula.slope)}(d − 1) and E⁻¹(y) = 1 + (y − ${INV.formula.y0}) ÷ ${nf(INV.formula.slope)}. Find E⁻¹(2460), to 3 decimal places.`,
    traps: [
      { value: H2460[0], code: 'no-restrict', message: 'That’s the other place the trail is at 2,460 m, outside the restricted domain 1 ≤ d ≤ 1.5.' },
      { value: 2460 / 140, code: 'inverse-forward', message: 'Subtract 2,430 first: (2460 − 2430) ÷ 140, then add 1.' },
      { value: (2460 - 2430) / 140, code: 'no-restrict', message: 'You’re nearly there: that’s the distance past 1 km. Add the 1.' },
      { value: 1 / 2460, code: 'reciprocal', message: 'E⁻¹(2460) isn’t 1 ÷ 2460. Use the inverse formula.' }
    ],
    hints: ['Use E⁻¹(y) = 1 + (y − 2430) ÷ 140.', '2460 − 2430 = 30.', '1 + 30 ÷ 140 = ?'],
    solution: `E⁻¹(2460) = 1 + 30 ÷ 140 ≈ ${nf(round(INV.f(2460), 4))} km. On this climb the rider reaches 2,460 m about ${nf(round(INV.f(2460), 3))} km along the trail.`
  },
  'r-einv-domain': {
    type: 'fields', ideas: ['restrict', 'domain-range'],
    prompt: 'What is the domain of that inverse, E⁻¹?',
    fields: [
      { id: 'lo', label: 'From', answer: INV.range[0], tolerance: 0.5, unit: 'm', traps: [{ value: 1, code: 'domain-swap', message: 'That’s from E’s domain. E⁻¹ takes elevations: E’s range on this piece.' }] },
      { id: 'hi', label: 'To', answer: INV.range[1], tolerance: 0.5, unit: 'm', traps: [{ value: 1.5, code: 'domain-swap', message: 'That’s from E’s domain. E⁻¹ takes elevations.' }, { value: Y1, code: 'outside-domain', message: 'That’s the highest point of the whole trail, but this inverse only covers the 1.0–1.5 km climb.' }] }
    ],
    hints: ['Domain and range swap for an inverse.', 'E on [1, 1.5] has outputs from E(1) to E(1.5).', 'E(1) = 2430 and E(1.5) = 2500.'],
    solution: `E⁻¹ accepts elevations ${nf(INV.range[0])} to ${nf(INV.range[1])} m (E’s range on the climb) and returns distances from 1 to 1.5 km.`
  },
  'r-reciprocal': {
    type: 'choice', ideas: ['inverse'],
    prompt: 'A teammate says S⁻¹(v) means 1 ÷ S(v). What’s wrong?',
    options: [
      opt('a', 'The −1 means “inverse”, undoing S, not 1 over S', true),
      opt('b', 'Nothing: the −1 always means a reciprocal', false, 'reciprocal', 'For numbers, 5⁻¹ = 1/5. For functions, f⁻¹ is the inverse function: it reverses f.'),
      opt('c', 'It should be S(v) − 1', false, 'reciprocal', 'S⁻¹ isn’t subtraction either. It’s the function that undoes S.'),
      opt('d', 'It should be −S(v)', false, 'reciprocal', '−S(v) is a reflection. S⁻¹ undoes S: S⁻¹(S(c)) = c.')
    ],
    hints: ['What should S⁻¹(22.08) give?', 'S⁻¹(22.08) should be 80 RPM.', 'What is 1 ÷ S(22.08)?'],
    solution: 'f⁻¹(x) ≠ 1/f(x). S⁻¹(22.08) = 80 RPM, but 1 ÷ S(22.08) ≈ 0.16. The −1 on a function means “reverse it”.'
  }
};

// ================================================================ Extension: Combine the Ride Data
const EXT = {
  'ext-add': {
    type: 'number', ideas: ['operations'], answer: 0.004 * 25 + 1.5, tolerance: 0.01, unit: 'm', label: 'T(25)',
    prompt: 'The ground is f(x) = 0.004(x − 30)² m above the creek bed, and a 1.5 m boardwalk deck b(x) covers 20 ≤ x ≤ 40 m. What is T(25) = f(25) + b(25)?',
    traps: [{ value: 0.004 * 25, code: 'composition-add', message: 'That’s f(25) only. Add the deck height b(25) = 1.5.' }, { value: 1.5, code: 'composition-add', message: 'That’s b(25). Add the ground height f(25) = 0.1.' }],
    hints: ['Adding functions: add their outputs at the same input.', 'f(25) = 0.004 × (25 − 30)² = 0.1.', 'b(25) = 1.5, because 25 is on the span.'],
    solution: 'T(25) = f(25) + b(25) = 0.1 + 1.5 = 1.6 m: the riding surface is the ground plus the boardwalk.'
  },
  'ext-divide': {
    type: 'choice', ideas: ['operations', 'domain-range'],
    prompt: 'Where is the quotient q(x) = b(x) ÷ f(x) not defined?',
    options: [
      opt('a', 'At x = 30 m, where f(x) = 0 (the creek bed)', true),
      opt('b', 'Where b(x) = 0, off the boardwalk', false, 'undefined-ok', 'A numerator of 0 is fine: 0 ÷ 2 = 0. Only a zero denominator is a problem.'),
      opt('c', 'Nowhere: you can always divide functions', false, 'undefined-ok', 'Division by zero is undefined, so x = 30 has to leave the domain.'),
      opt('d', 'Everywhere outside 20 ≤ x ≤ 40', false, 'undefined-ok', 'There b(x) = 0 and f(x) > 0, so q(x) = 0: defined.')
    ],
    hints: ['When is a fraction undefined?', 'When its denominator is 0.', 'Where is f(x) = 0.004(x − 30)² equal to 0?'],
    solution: 'q(x) is undefined where f(x) = 0, at x = 30. The domain of a quotient is where both functions are defined, minus the zeros of the denominator.'
  }
};

// ================================================================ Final: Engineer the Ride
export const FINAL_IDS = ['fa-input', 'fa-eval', 'fa-domain', 'fa-range', 'fa-inc', 'fa-dec', 'fb-ratio', 'fb-wheel', 'fb-k', 'fb-speed', 'fc-parts', 'fc-effect', 'fd-cadence', 'fd-why'];
export const PASS_MARK = 11;   // of 14, right without the solution shown
export function finalSet(roundNo) {
  const i = roundNo - 1, T = pick(FINAL_SETS.trails, i);
  return { trail: { ...T, profile: makeProfile(DISTANCES.map((d, j) => [d, T.ys[j]]), T.name) }, drive: pick(FINAL_SETS.drives, i), tf: pick(FINAL_SETS.transforms, i) };
}
// Interval options for "where is it increasing / decreasing": the first
// maximal run of the asked direction is correct; the others are a run of
// the opposite direction, the whole trail, and an interval across a turn.
function intervalOptions(P, dir) {
  const want = P.runs.find(r => r.dir === dir), other = P.runs.find(r => r.dir !== dir);
  const i = P.runs.indexOf(want), next = P.runs[i + 1] || P.runs[i - 1];
  const across = next ? (next.from >= want.to ? [want.from, Math.min(want.to + 0.5, next.to)] : [Math.max(next.from, want.from - 0.5), want.to]) : [P.domain[0], P.domain[1]];
  const word = dir === 'up' ? 'climbs' : 'descends';
  const list = [
    opt('a', iv(want.from, want.to, 'km'), true),
    opt('b', iv(other.from, other.to, 'km'), false, 'direction', `From ${iv(other.from, other.to, 'km')} the trail ${other.dir === 'up' ? 'climbs' : 'descends'}.`),
    opt('c', iv(P.domain[0], P.domain[1], 'km'), false, 'direction', `The whole trail goes up and down, so it doesn’t only ${word === 'climbs' ? 'climb' : 'descend'}.`),
    opt('d', iv(across[0], across[1], 'km'), false, 'direction', 'That interval crosses a turn: part of it goes the other way.')
  ];
  const seen = new Set();
  return list.filter(o => !seen.has(o.text) && seen.add(o.text));
}
export function finalQuestions(roundNo) {
  const F = finalSet(roundNo), T = F.trail, P = T.profile, Dv = drivetrain(F.drive), tf = F.tf;
  const [lo, hi] = P.range, vt = Dv.S(F.drive.target);
  const qs = {
    set: F,
    'fa-input': {
      type: 'choice', ideas: ['input-output', 'notation'],
      prompt: `For the ${T.name} profile, E(d) gives elevation at distance d. Which is the output?`,
      options: [
        opt('a', 'Elevation (m)', true),
        opt('b', 'Distance along the trail (km)', false, 'input-output', 'Distance is what goes in: the input.'),
        opt('c', 'The trail’s name', false, 'input-output', 'The name labels the function; it isn’t an output.'),
        opt('d', 'Time on the trail (minutes)', false, 'input-output', 'This function doesn’t use time.')
      ],
      hints: ['What do you get out of E(d)?', 'E(d) is the value of the function.', 'E stands for elevation.'],
      solution: 'Distance (km) is the input and elevation (m) is the output.'
    },
    'fa-eval': {
      type: 'number', ideas: ['evaluate', 'notation'], answer: P.at(T.at), tolerance: 0.5, unit: 'm', label: `E(${nf(T.at)})`,
      prompt: `What is E(${nf(T.at)})?`,
      traps: [{ value: T.at, code: 'input-output', message: `${nf(T.at)} is the input. E(${nf(T.at)}) is the elevation there.` }, { value: P.at(Math.min(3, T.at + 0.5)), code: 'table-row', message: 'That’s the next row. Find the row for ' + nf(T.at) + ' km.' }, { value: T.at * P.at(T.at), code: 'notation-multiply', message: 'E(d) isn’t E × d.' }],
      hints: ['E(d) is the elevation at distance d.', `Find d = ${nf(T.at)} in the table.`, 'Read the elevation in that row.'],
      solution: `E(${nf(T.at)}) = ${nf(P.at(T.at))} m.`
    },
    'fa-domain': {
      type: 'fields', ideas: ['domain-range'],
      prompt: 'What is the domain?',
      fields: [
        { id: 'lo', label: 'From', answer: P.domain[0], tolerance: 0.001, unit: 'km', traps: [{ value: lo, code: 'domain-range-swap', message: 'That’s an elevation; the domain is distances.' }] },
        { id: 'hi', label: 'To', answer: P.domain[1], tolerance: 0.001, unit: 'km', traps: [{ value: hi, code: 'domain-range-swap', message: 'That’s an elevation; the domain is distances.' }] }
      ],
      hints: ['The domain is the inputs.', 'The inputs are distances.', 'Where does the trail start and finish?'],
      solution: `${nf(P.domain[0])} ≤ d ≤ ${nf(P.domain[1])} km.`
    },
    'fa-range': {
      type: 'fields', ideas: ['domain-range', 'graph'],
      prompt: 'What is the range?',
      fields: [
        { id: 'lo', label: 'Lowest', answer: lo, tolerance: 0.5, unit: 'm', traps: [{ value: P.points[0][1], code: 'endpoint-not-max', message: 'That’s the start. Look for the lowest point anywhere on the trail.' }, { value: P.domain[0], code: 'domain-range-swap', message: 'That’s a distance; the range is elevations.' }] },
        { id: 'hi', label: 'Highest', answer: hi, tolerance: 0.5, unit: 'm', traps: [{ value: P.points[P.points.length - 1][1], code: 'endpoint-not-max', message: 'That’s the finish. Look for the highest point anywhere on the trail.' }, { value: P.domain[1], code: 'domain-range-swap', message: 'That’s a distance; the range is elevations.' }] }
      ],
      hints: ['The range is the outputs.', 'Find the lowest and highest elevations, not just the ends.', 'Scan the whole elevation column.'],
      solution: `${nf(lo)} ≤ E(d) ≤ ${nf(hi)} m.`
    },
    'fa-inc': {
      type: 'choice', ideas: ['graph'], prompt: 'On which interval is the trail increasing (only climbing)?', options: intervalOptions(P, 'up'),
      hints: ['Increasing: elevation goes up as distance goes up.', 'Read the table row by row.', 'Find a stretch where every step goes up.'],
      solution: `E increases on ${P.runs.filter(r => r.dir === 'up').map(r => iv(r.from, r.to, 'km')).join(' and ')}.`
    },
    'fa-dec': {
      type: 'choice', ideas: ['graph'], prompt: 'On which interval is it decreasing (only descending)?', options: intervalOptions(P, 'down'),
      hints: ['Decreasing: elevation goes down as distance goes up.', 'Read the table row by row.', 'Find a stretch where every step goes down.'],
      solution: `E decreases on ${P.runs.filter(r => r.dir === 'down').map(r => iv(r.from, r.to, 'km')).join(' and ')}.`
    },
    'fb-ratio': {
      type: 'number', ideas: ['compose'], answer: Dv.G, tolerance: 0.001, label: 'Gear ratio',
      prompt: `A drivetrain has a ${Dv.front}T chainring, a ${Dv.rear}T sprocket and a ${nf(Dv.circumference)} m wheel; cadence ${F.drive.cadence} RPM. What is the gear ratio?`,
      traps: [{ value: Dv.rear / Dv.front, code: 'ratio-flip', message: 'Front ÷ rear, not rear ÷ front.' }, { value: Dv.front - Dv.rear, code: 'ratio-other', message: 'Divide the teeth; don’t subtract.' }],
      hints: ['G = front ÷ rear.', `${Dv.front} ÷ ${Dv.rear}.`, 'Simplify.'],
      solution: `G = ${Dv.front} ÷ ${Dv.rear} = ${nf(Dv.G)}.`
    },
    'fb-wheel': {
      type: 'number', ideas: ['evaluate', 'compose'], answer: Dv.f(F.drive.cadence), tolerance: 0.01, unit: 'RPM', label: 'Wheel RPM',
      prompt: 'What is the rear-wheel RPM?',
      traps: [{ value: F.drive.cadence / Dv.G, code: 'ratio-flip', message: 'Multiply cadence by the ratio; don’t divide.' }, { value: F.drive.cadence, code: 'skip-stage', message: 'That’s the cadence. The wheel turns G times faster.' }],
      hints: ['f(c) = G·c.', `c = ${F.drive.cadence}.`, `${nf(Dv.G)} × ${F.drive.cadence}.`],
      solution: `f(${F.drive.cadence}) = ${nf(Dv.G)} × ${F.drive.cadence} = ${nf(Dv.f(F.drive.cadence))} RPM.`
    },
    'fb-k': {
      type: 'number', ideas: ['compose'], answer: Dv.k, tolerance: 0.0005, label: 'k in S(c) = k·c',
      prompt: 'Build the speed function S(c) = g(f(c)) = k·c, in km/h. What is k?',
      traps: [{ value: Dv.kg, code: 'skip-stage', message: 'That’s g’s factor alone. Multiply it by the gear ratio: S(c) = g(f(c)).' }, { value: Dv.kg + Dv.G, code: 'composition-add', message: 'Composition isn’t addition: multiply the factors.' }, { value: Dv.circumference * Dv.G, code: 'units', message: 'That’s metres per crank turn. Convert: × 60 ÷ 1000 for km/h.' }],
      hints: ['g(w) = (60 × C ÷ 1000)w.', `60 × ${nf(Dv.circumference)} ÷ 1000 = ${nf(Dv.kg)}.`, `k = ${nf(Dv.kg)} × ${nf(Dv.G)}.`],
      solution: `g(w) = ${nf(Dv.kg)}w and f(c) = ${nf(Dv.G)}c, so S(c) = ${nf(Dv.kg)} × ${nf(Dv.G)}c = ${nf(round(Dv.k, 6))}c.`
    },
    'fb-speed': {
      type: 'number', ideas: ['evaluate', 'compose'], answer: Dv.S(F.drive.cadence), tolerance: 0.01, unit: 'km/h', label: 'Speed',
      prompt: 'What is the bike speed?',
      traps: [{ value: Dv.kg * F.drive.cadence, code: 'skip-stage', message: 'That leaves out the gears. Use S(c) = k·c.' }, { value: Dv.f(F.drive.cadence) * Dv.circumference, code: 'units', message: 'That’s metres per minute. Convert to km/h.' }],
      hints: ['S(c) = k·c.', `c = ${F.drive.cadence}.`, `${nf(round(Dv.k, 6))} × ${F.drive.cadence}.`],
      solution: `S(${F.drive.cadence}) = ${nf(round(Dv.k, 6))} × ${F.drive.cadence} = ${nf(round(Dv.S(F.drive.cadence), 2))} km/h.`
    },
    'fc-parts': {
      type: 'fields', ideas: ['transform', 'transform-v'],
      prompt: `A profile h(d) is transformed to g(d) = ${nf(tf.a)}h(d) ${tf.k < 0 ? '−' : '+'} ${nf(Math.abs(tf.k))}. What are the vertical stretch factor and the vertical shift?`,
      fields: [
        { id: 'a', label: 'Stretch factor', answer: tf.a, tolerance: 0.001, traps: [{ value: tf.k, code: 'shift-vs-stretch', message: 'That’s the shift. The factor multiplies h(d).' }] },
        { id: 'k', label: 'Vertical shift', answer: tf.k, tolerance: 0.001, unit: 'm', traps: [{ value: tf.a, code: 'shift-vs-stretch', message: 'That’s the factor. The shift is the number added.' }, { value: -tf.k, code: 'shift-sign', message: `${tf.k < 0 ? '− means down: the shift is negative.' : '+ means up: the shift is positive.'}` }] }
      ],
      hints: ['g(d) = a·h(d) + k.', 'a multiplies; k is added.', 'Read them off the equation (a minus sign means a negative k).'],
      solution: `a = ${nf(tf.a)}, k = ${nf(tf.k)}.`
    },
    'fc-effect': {
      type: 'choice', ideas: ['transform-v'],
      prompt: `What does g(d) = ${nf(tf.a)}h(d) ${tf.k < 0 ? '−' : '+'} ${nf(Math.abs(tf.k))} do to the graph?`,
      options: [
        opt('a', `${tf.a > 1 ? 'Stretches it vertically' : 'Compresses it vertically'} by ${nf(tf.a)}, then moves it ${tf.k > 0 ? 'up' : 'down'} ${nf(Math.abs(tf.k))} m`, true),
        opt('b', `${tf.a > 1 ? 'Stretches it horizontally' : 'Compresses it horizontally'} by ${nf(tf.a)}, then moves it ${tf.k > 0 ? 'right' : 'left'} ${nf(Math.abs(tf.k))} km`, false, 'v-h-confuse', 'Both numbers are outside h( ), so both changes are vertical.'),
        opt('c', `Moves it ${tf.k > 0 ? 'up' : 'down'} ${nf(tf.a)} m, then ${tf.a > 1 ? 'stretches' : 'compresses'} it by ${nf(Math.abs(tf.k))}`, false, 'shift-vs-stretch', 'The multiplier is the stretch, and the added number is the shift.'),
        opt('d', `Moves it ${tf.k > 0 ? 'down' : 'up'} ${nf(Math.abs(tf.k))} m with no change of shape`, false, 'shift-sign', 'Check the sign of the shift, and the factor changes the shape too.')
      ],
      hints: ['Outside the brackets: vertical.', 'The multiplier stretches (more than 1) or compresses (less than 1).', 'The added number shifts up (+) or down (−).'],
      solution: `Every output is multiplied by ${nf(tf.a)} (${tf.a > 1 ? 'taller climbs' : 'flatter climbs'}), then ${tf.k > 0 ? 'raised' : 'lowered'} ${nf(Math.abs(tf.k))} m.`
    },
    'fd-cadence': {
      type: 'number', ideas: ['inverse'], answer: Dv.Sinv(vt), tolerance: 0.05, unit: 'RPM', label: 'Cadence',
      prompt: `With S(c) = ${nf(round(Dv.k, 6))}c, what cadence gives ${nf(round(vt, 2))} km/h?`,
      traps: [{ value: Dv.S(vt), code: 'inverse-forward', message: 'That’s S of the speed. Use S⁻¹(v) = v ÷ k.' }, { value: 1 / vt, code: 'reciprocal', message: 'The inverse isn’t a reciprocal.' }],
      hints: ['Use the inverse: S⁻¹(v) = v ÷ k.', `v = ${nf(round(vt, 2))}.`, `${nf(round(vt, 2))} ÷ ${nf(round(Dv.k, 6))}.`],
      solution: `S⁻¹(${nf(round(vt, 2))}) = ${nf(round(vt, 2))} ÷ ${nf(round(Dv.k, 6))} = ${nf(round(Dv.Sinv(vt), 4))} RPM.`
    },
    'fd-why': {
      type: 'choice', ideas: ['one-to-one', 'inverse'],
      prompt: 'Why can S be inverted on its domain?',
      options: [
        opt('a', 'It’s strictly increasing, so each speed comes from exactly one cadence', true),
        opt('b', 'Every function can be inverted', false, 'every-inverse', 'Only one-to-one functions can. The trail profile can’t, without restricting its domain.'),
        opt('c', 'Because its graph passes the vertical line test', false, 'every-inverse', 'That shows it’s a function. Inverting needs the horizontal line test.'),
        opt('d', 'Because 1 ÷ S(c) is always defined', false, 'reciprocal', 'The inverse isn’t 1 ÷ S. It’s the function that undoes S.')
      ],
      hints: ['Which test decides if an inverse is a function?', 'The horizontal line test.', 'A rising straight line crosses each horizontal line…'],
      solution: 'S is a rising straight line on 40–110 RPM: one-to-one. Each output comes from exactly one input, so S⁻¹ is a function.'
    }
  };
  return arrange(tidy(qs));
}

// ================================================================ missions
export const QUESTIONS = arrange(tidy({ ...M1, ...M2, ...M3, ...M4, ...EXT }));
export const MISSIONS = [
  { id: 'trail', n: 1, title: 'Read the trail', short: 'Read the Trail', minutes: '5–6', focus: 'Function notation · evaluating · domain and range · graphs',
    blurb: 'Turn a trail’s GPS data into a function: distance in, elevation out.', graded: Object.keys(M1) },
  { id: 'gearbox', n: 2, title: 'The gearbox lab', short: 'The Gearbox Lab', minutes: '6–7', focus: 'Composition · building functions from a system',
    blurb: 'Follow the pedals to the tire: two functions chained into one speed function.', graded: Object.keys(M2) },
  { id: 'transform', n: 3, title: 'Transform the trail', short: 'Transform the Trail', minutes: '5–6', focus: 'Shifts · stretches · compressions · reflections',
    blurb: 'Shift, stretch and flip the elevation profile, then match a target.', graded: Object.keys(M3) },
  { id: 'reverse', n: 4, title: 'Reverse the ride', short: 'Reverse the Ride', minutes: '5–6', focus: 'Inverse functions · one-to-one · restricting a domain',
    blurb: 'Work backward from a target speed, and find out when a function can’t be reversed.', graded: Object.keys(M4) }
];

export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  const F = finalQuestions(1); for (const id of FINAL_IDS) out[id] = F[id].ideas;
  return out;
}
