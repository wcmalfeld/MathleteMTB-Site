// The lesson's interactives (lesson block { t: 'activity', id }).
// Each takes ctx = { progress, rerender(), go(section), cleanup(fn), refresh() }
// and returns an element.

import { el, svg, clear, button, id as uid, reducedMotion } from './dom.js';
import { ask } from './ask.js';
import { pickForces } from './forces.js';
import { riderSide, arrow } from './visuals.js';
import { createGraph } from './graph.js';
import { createForceLab } from './forcelab.js';
import { QUESTIONS, CHECK_IDS, SECTIONS, SCENARIOS } from '../logic/lesson.js';
import { acceleration, forceLab, fmt, signed } from '../logic/physics.js';

const card = (title, ...kids) => el('section', { class: 'nl-card nl-activity' }, el('p', { class: 'nl-kicker' }, 'Try it'), el('h3', { class: 'nl-h3' }, title), ...kids);
const q = (ctx, id, extra = {}) => ask({ ...QUESTIONS[id], id }, { progress: ctx.progress, onDone: () => ctx.refresh(), ...extra });

// ---- Section 1: identify the forces (PRD 4.6)
function identifyForces(ctx) {
  return card('Identify the forces', el('p', null, 'Tick a force to add it to the diagram, then choose which way it points.'),
    pickForces('forces-flat', { progress: ctx.progress, onDone: () => ctx.refresh() }));
}

// ---- Section 2: the inertia experiment (PRD 5.4)
function inertia(ctx) {
  const F = 120, riders = [{ name: 'Rider A', m: 60 }, { name: 'Rider B', m: 100 }];
  const W = 560, H = 190, X0 = 80, K = 22;
  const pic = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'nl-pic', role: 'img' });
  const runBtn = button('▶ Push both for 3 seconds', run, 'nl-btn--primary');
  const result = el('p', { class: 'nl-result', 'aria-live': 'polite' });
  let raf = 0;
  ctx.cleanup(() => cancelAnimationFrame(raf));
  function draw(t) {
    clear(pic);
    riders.forEach((r, i) => {
      const y = 78 + i * 88, a = acceleration(F, r.m), d = 0.5 * a * t * t;
      pic.append(svg('line', { class: 'nl-ground-line', x1: 0, y1: y, x2: W, y2: y }),
        svg('text', { x: 8, y: y - 50, class: 'nl-small' }, `${r.name}: ${r.m} kg`),
        svg('g', { transform: `translate(${X0 + d * K} ${y})` }, riderSide(r.m === 60 ? 52 : 64, d / 0.7)),
        arrow(X0 + d * K + 40, y - 30, [1, 0], 36, 'net', '120 N'));
      if (t > 0) pic.append(svg('text', { x: W - 8, y: y - 50, 'text-anchor': 'end', class: 'nl-small' }, `a = ${fmt(a, 1)} m/s² · ${fmt(d, 1)} m`));
    });
    pic.setAttribute('aria-label', `Two riders pushed by the same 120 N net force from rest. After ${fmt(t, 1)} s, A (60 kg) has gone ${fmt(0.5 * 2 * t * t, 1)} m and B (100 kg) ${fmt(0.5 * 1.2 * t * t, 1)} m.`);
  }
  function run() {
    cancelAnimationFrame(raf);
    if (reducedMotion()) { draw(3); return show(); }
    const start = performance.now();
    const frame = now => { const t = Math.min(3, (now - start) / 1000); draw(t); if (t < 3) raf = requestAnimationFrame(frame); else show(); };
    raf = requestAnimationFrame(frame);
  }
  function show() { result.textContent = 'Same 120 N push: A (60 kg) accelerates at 2.0 m/s² and covers 9.0 m in 3 s; B (100 kg) at 1.2 m/s², only 5.4 m. More mass, more inertia, less acceleration. Section 3 puts a number on it: a = F ÷ m.'; }
  draw(0);
  const answered = () => ctx.progress.done('inertia-predict');
  runBtn.disabled = !answered();
  const note = el('p', { class: 'nl-small' }, answered() ? '' : 'Make your prediction first, then run the experiment.');
  return card('The inertia experiment',
    q(ctx, 'inertia-predict', { onDone: () => { runBtn.disabled = false; note.textContent = ''; ctx.refresh(); } }),
    pic, el('div', { class: 'nl-actions' }, runBtn), note, result);
}

// ---- Section 3: what makes you accelerate? (PRD 6.6)
function accelSliders(ctx) {
  let m = 80, F = 160;
  const mid = uid('m'), fid = uid('f');
  const mIn = el('input', { type: 'range', id: mid, min: 45, max: 120, step: 1, value: m, class: 'nl-range' });
  const fIn = el('input', { type: 'range', id: fid, min: 0, max: 400, step: 5, value: F, class: 'nl-range' });
  const mOut = el('output', { for: mid, class: 'nl-out' }), fOut = el('output', { for: fid, class: 'nl-out' });
  const big = el('p', { class: 'nl-big-result', 'aria-live': 'polite' });
  const graph = createGraph({ title: 'Acceleration = net force ÷ mass (this mass)', xLabel: 'Net force', yLabel: 'Acceleration', xUnit: 'N', yUnit: 'm/s²', xDomain: [0, 400], xStep: 5, xDigits: 0, yDigits: 2,
    onPick: x => { F = x; fIn.value = F; draw(); } });
  let ref = null;
  const refNote = el('p', { class: 'nl-small' });
  function draw() {
    mOut.textContent = m + ' kg'; fOut.textContent = F + ' N';
    const a = acceleration(F, m);
    big.textContent = `a = ${F} N ÷ ${m} kg = ${fmt(a, 2)} m/s²`;
    graph.update({ f: x => acceleration(x, m), x: F, markers: ref ? [{ x: Math.min(400, ref.F), y: acceleration(ref.F, ref.m), label: 'start', cls: 'nl-g-mark--a' }] : [] });
    refNote.textContent = ref ? `Started at ${ref.F} N on ${ref.m} kg (${fmt(acceleration(ref.F, ref.m), 2)} m/s²). Now ${fmt(acceleration(F, m) / acceleration(ref.F, ref.m), 2)}× that.` : '';
  }
  mIn.addEventListener('input', () => { m = Number(mIn.value); draw(); });
  fIn.addEventListener('input', () => { F = Number(fIn.value); draw(); });
  const preset = (label, mm, ff, text) => button(label, () => { m = mm; F = ff; mIn.value = m; fIn.value = F; ref = { m, F }; draw(); exp.textContent = text; }, 'nl-btn--quiet');
  const exp = el('p', { class: 'nl-exp', 'aria-live': 'polite' }, 'Pick an experiment, then move the sliders.');
  draw();
  return card('What makes you accelerate?',
    el('div', { class: 'nl-actions' },
      preset('A: change the force', 80, 100, 'Experiment A: keep the mass at 80 kg and drag the force up. Double it to 200 N: the acceleration doubles too.'),
      preset('B: change the mass', 60, 180, 'Experiment B: keep the force at 180 N and drag the mass up. From 60 kg to 120 kg the acceleration halves.'),
      preset('C: change both', 60, 150, 'Experiment C: start at 150 N on 60 kg. Predict first (below), then set 300 N on 120 kg.')),
    exp,
    el('div', { class: 'nl-two' },
      el('div', null,
        el('div', { class: 'nl-control' }, el('div', { class: 'nl-control-top' }, el('label', { for: mid }, 'Rider + bike mass'), mOut), mIn),
        el('div', { class: 'nl-control' }, el('div', { class: 'nl-control-top' }, el('label', { for: fid }, 'Net forward force'), fOut), fIn),
        big, refNote),
      el('div', { class: 'nl-graph-card' }, graph.node)));
}

// ---- Section 4: who pushes who? (PRD 7.4)
function whoPushes(ctx) {
  let mode = 'drive', spin = 0, raf = 0, last = null;
  const pic = svg('svg', { viewBox: '0 0 360 200', class: 'nl-pic nl-pic--tire', role: 'img' });
  const seg = el('div', { class: 'nl-segs', role: 'radiogroup', 'aria-label': 'Situation' }, [['drive', 'Pedalling'], ['land', 'Landing a jump']].map(([v, t]) => {
    const b = el('button', { type: 'button', role: 'radio', class: 'nl-seg', 'data-v': v }, t); b.addEventListener('click', () => { mode = v; draw(); }); return b;
  }));
  ctx.cleanup(() => cancelAnimationFrame(raf));
  function draw() {
    clear(pic);
    const gx = 180, gY = 140, R = 62;
    pic.append(svg('rect', { class: 'nl-ground', x: 0, y: gY, width: 360, height: 60 }), svg('line', { class: 'nl-ground-line', x1: 0, y1: gY, x2: 360, y2: gY }),
      svg('circle', { class: 'nl-tire nl-tire--big', cx: gx, cy: gY - R, r: R }),
      svg('path', { class: 'nl-spokes', d: [0, 1, 2].map(i => { const a = spin + i * Math.PI / 3; return `M ${gx - Math.cos(a) * R * 0.85} ${gY - R - Math.sin(a) * R * 0.85} L ${gx + Math.cos(a) * R * 0.85} ${gY - R + Math.sin(a) * R * 0.85}`; }).join(' ') }));
    if (mode === 'drive') {
      pic.append(arrow(gx, gY - 8, [1, 0], 90, 't', 'ground on tire →'), arrow(gx, gY + 16, [-1, 0], 90, 'pair', '← tire on ground'));
      pic.setAttribute('aria-label', 'Pedalling: the tire pushes backward on the ground; the ground pushes forward on the tire with an equal force.');
    } else {
      pic.append(arrow(gx + 10, gY - 4, [0, -1], 80, 'n', 'ground on tire ↑'), arrow(gx - 10, gY + 4, [0, 1], 80, 'pair', 'tire on ground ↓'));
      pic.setAttribute('aria-label', 'Landing: the tire pushes down on the ground; the ground pushes up on the tire with an equal force.');
    }
    pic.append(svg('text', { x: 10, y: 20, class: 'nl-small' }, 'Same length, opposite direction, different objects'));
    seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.getAttribute('data-v') === mode)));
  }
  const tick = now => { if (last !== null) spin += (now - last) / 1000 * (mode === 'drive' ? 2.4 : 0.6); last = now; draw(); raf = requestAnimationFrame(tick); };
  draw();
  if (!reducedMotion()) raf = requestAnimationFrame(tick);
  return card('Who pushes who?', seg, pic,
    el('p', { class: 'nl-small' }, 'The orange arrow acts on the tire. The other acts on the ground. They’re a pair: always equal, never on the same object.'));
}

// ---- Section 5: build the free-body diagram (PRD 8.5)
function fbdBuilder(ctx) {
  const ids = ['fbd-flat', 'fbd-climb', 'fbd-brake', 'fbd-downhill'];
  let cur = ids.find(id => !ctx.progress.done(id)) || ids[0];
  const tabs = el('div', { class: 'nl-segs nl-tabs', role: 'tablist', 'aria-label': 'Scenario' });
  const panel = el('div', { role: 'tabpanel' });
  // Ticking a tab doesn't redraw the open diagram, so its feedback stays.
  function drawTabs() {
    clear(tabs);
    ids.forEach((id, i) => {
      const b = el('button', { type: 'button', role: 'tab', class: 'nl-seg', 'aria-selected': String(id === cur), id: 'tab-' + id },
        `${i + 1}. ${SCENARIOS[QUESTIONS[id].scenario].title}`, ctx.progress.earned(id) ? ' ✓' : '');
      b.addEventListener('click', () => { cur = id; drawTabs(); drawPanel(); });
      tabs.appendChild(b);
    });
  }
  function drawPanel() {
    panel.setAttribute('aria-labelledby', 'tab-' + cur);
    clear(panel).appendChild(pickForces(cur, { progress: ctx.progress, onDone: () => { ctx.refresh(); drawTabs(); } }));
  }
  drawTabs(); drawPanel();
  return card('Build the free-body diagram', el('p', null, 'Four situations. For each one, tick the forces acting on the rider-bike system from outside, point them the right way, then decide where the net force points.'), tabs, panel);
}

// ---- Section 6: the MTB Force Lab with its three experiments (PRD 9.5)
function forceLabActivity(ctx) {
  const P = ctx.progress;
  const lab = createForceLab({ progress: P, onChange: (c, r) => checkTask(c, r) });
  ctx.cleanup(() => lab.destroy());
  const taskNote = el('p', { class: 'nl-fb', 'aria-live': 'polite' });
  function checkTask(c, r) {
    if (P.done('lab-zero-climb')) return;
    if (c.angle === 6 && Math.abs(r.netForce) <= 3) {
      P.attempt('lab-zero-climb', null, `${c.mass} kg, traction ${c.traction} N, brakes ${c.braking} N, resistance ${c.resistance} N on 6°: F_net = ${fmt(r.netForce, 1)} N`, true,
        { correctAnswer: 'Any setup on a 6° climb with |F_net| ≤ 3 N' });
      taskNote.className = 'nl-fb nl-fb--right';
      taskNote.textContent = `Done: F_net = ${signed(r.netForce, 1)} N. Traction (${c.traction} N) balances resistance and brakes (${c.resistance + c.braking} N) plus gravity along the slope (${fmt(r.gravityParallel, 1)} N). Ride it: the speed barely changes, even uphill.`;
      ctx.refresh();
    }
  }
  if (P.done('lab-zero-climb')) { taskNote.className = 'nl-fb nl-fb--right'; taskNote.textContent = 'Done: you balanced the forces on a 6° climb.'; }
  const setup = (label, c) => button(label, () => { lab.setConfig(c); lab.resetRide(); lab.node.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' }); }, 'nl-btn--quiet');
  const exp = (n, title, ...kids) => el('section', { class: 'nl-card nl-exp-card' }, el('p', { class: 'nl-kicker' }, 'Experiment ' + n), el('h3', { class: 'nl-h3' }, title), ...kids);
  return el('div', { class: 'nl-lab-wrap' },
    lab.node,
    el('p', { class: 'nl-model-note' }, el('b', null, 'The model: '), 'one combined rider-bike mass on a straight trail; the tires don’t slip; braking and resistance are steady forces that oppose the motion. It’s a simplified teaching scenario, not measured bike performance.'),
    el('div', { class: 'nl-exps' },
      exp(1, 'Newton’s first law',
        el('p', null, 'Set traction equal to resistance on the flat and ride.'), setup('Set it up: 40 N vs 40 N, flat', { mass: 80, traction: 40, braking: 0, resistance: 40, angle: 0 }),
        q(ctx, 'lab-steady'), setup('Then: traction 0 N', { mass: 80, traction: 0, braking: 0, resistance: 40, angle: 0 }), q(ctx, 'lab-coast'),
        el('p', { class: 'nl-prompt' }, QUESTIONS['lab-zero-climb'].prompt), taskNote),
      exp(2, 'Newton’s second law',
        el('p', null, 'Same resistance, more traction, then more mass.'), setup('Set it up: 200 N traction, 80 kg', { mass: 80, traction: 200, braking: 0, resistance: 40, angle: 0 }),
        q(ctx, 'lab-accel'), setup('Then: 100 kg', { mass: 100, traction: 200, braking: 0, resistance: 40, angle: 0 }), q(ctx, 'lab-mass')),
      exp(3, 'Newton’s third law',
        el('p', null, 'Use the tire-and-ground panel above. Switch between the force on the tire and the force on the ground.'), setup('Set it up: 180 N traction', { traction: 180 }),
        q(ctx, 'lab-pair'))));
}

// ---- Section 7: knowledge check (PRD 10.1), retakes as new rounds
function knowledgeCheck(ctx) {
  const P = ctx.progress, key = P.checkKey();
  const score = el('p', { class: 'nl-score', 'aria-live': 'polite' });
  const retake = button('Retake the knowledge check', () => { if (window.confirm('Start a new round of the knowledge check? Your best round still counts.')) { P.retakeCheck(); ctx.rerender(); } }, 'nl-btn--quiet');
  function drawScore() {
    const s = P.checkScore(), best = P.bestCheck();
    score.textContent = `Round ${s.round}: ${s.answered} of ${s.total} answered, ${s.right} right first try.` + (best && best.round !== s.round ? ` Best round so far: ${best.right} of ${best.total}.` : '');
    retake.hidden = s.answered < s.total;
  }
  const list = el('ol', { class: 'nl-check-list' }, CHECK_IDS.map(id => el('li', null, ask({ ...QUESTIONS[id], id, hints: QUESTIONS[id].hints }, { progress: P, key, onDone: () => { drawScore(); ctx.refresh(); } }))));
  drawScore();
  return el('section', { class: 'nl-kcheck', 'aria-labelledby': 'kc-h' },
    el('h2', { class: 'nl-h2', id: 'kc-h' }, 'Knowledge check'),
    el('p', null, 'Eight questions on everything in the lesson. A question counts toward your score when it’s right on the first try. Mastery needs at least 7 of 8 (80%).'),
    score, list, retake);
}

// ---- Final challenge (PRD 10.2)
function finalChallenge(ctx) {
  const P = ctx.progress;
  const verify = el('div', { class: 'nl-verify', 'aria-live': 'polite' });
  const r = forceLab({ mass: 85, traction: 300, braking: 0, resistance: 55, angle: 8 });
  const verifyBtn = button('Check it in the Force Lab model', () => {
    clear(verify).append(el('p', null, `The Force Lab with 85 kg, 300 N traction, 55 N resistance and an 8° climb gives: mg sin θ = ${fmt(r.gravityParallel, 1)} N, F_net = ${fmt(r.netForce, 1)} N, a = ${fmt(r.acceleration, 2)} m/s².`),
      el('p', null, P.earned('final-calc') ? 'That matches your answer.' : 'Compare it with your working.'));
  }, 'nl-btn--quiet');
  const sync = () => { verifyBtn.disabled = !P.done('final-calc'); };
  const cer = [['claim', 'Claim: what will happen to the rider?'], ['evidence', 'Evidence: which numbers show it?'], ['reasoning', 'Reasoning: which law explains it, and what does the acceleration mean on the trail?']].map(([k, label]) => {
    const tid = uid('cer'), box = el('textarea', { id: tid, class: 'nl-textarea', rows: 3 });
    box.value = P.written('final-cer-' + k);
    box.addEventListener('change', () => { P.write('final-cer-' + k, box.value); ctx.refresh(); });
    return el('div', { class: 'nl-field nl-field--wide' }, el('label', { for: tid }, label), box);
  });
  sync();
  return el('section', { class: 'nl-final', 'aria-labelledby': 'fc-h' },
    el('p', { class: 'nl-kicker' }, 'Final challenge'),
    el('h2', { class: 'nl-h2', id: 'fc-h' }, 'Can you accelerate uphill?'),
    el('div', { class: 'nl-given' },
      el('p', null, 'You’re riding up a steep trail. Your objective: calculate your acceleration.'),
      el('ul', null, el('li', null, 'Rider + bike mass: 85 kg'), el('li', null, 'Trail angle: 8° uphill'), el('li', null, 'Tire-ground traction: 300 N'), el('li', null, 'Opposing resistance: 55 N'))),
    pickForces('final-fbd', { progress: P, onDone: () => ctx.refresh() }),
    ask({ ...QUESTIONS['final-calc'], id: 'final-calc' }, { progress: P, onDone: () => { sync(); ctx.refresh(); } }),
    el('div', { class: 'nl-actions' }, verifyBtn), verify,
    el('div', { class: 'nl-cer' }, el('h3', { class: 'nl-h3' }, 'Step 6: explain what it means'), el('p', { class: 'nl-small' }, 'Claim, evidence, reasoning. Saved as you go; your tutor can read it.'), cer));
}

// ---- Mastery (PRD 13)
function mastery(ctx) {
  const P = ctx.progress, m = P.mastery(), s = P.summary();
  const title = sec => (SECTIONS.find(x => x.id === sec) || {}).title || sec;
  return el('section', { class: 'nl-mastery' + (m.mastered ? ' is-mastered' : ''), 'aria-labelledby': 'ms-h' },
    el('h2', { class: 'nl-h2', id: 'ms-h' }, m.mastered ? '★ Newton’s laws: mastered' : 'Your mastery'),
    el('ul', { class: 'nl-criteria' }, m.criteria.map(c => el('li', { class: c.met ? 'is-met' : '' },
      el('span', { class: 'nl-crit-mark', 'aria-hidden': 'true' }, c.met ? '✓' : '○'), el('span', null, c.label, c.detail ? el('span', { class: 'nl-small' }, ' · ' + c.detail) : null,
        c.met ? el('span', { class: 'nl-sr' }, ' (met)') : el('span', { class: 'nl-review' }, ' Review: ', c.review.map((sec, i) => [i ? ', ' : '', el('a', { href: '#' + sec }, title(sec))])))))),
    el('p', { class: 'nl-small' }, `${s.sectionsDone} of ${s.sectionsTotal} sections complete · ${s.questionsAnswered} questions answered, ${s.firstTryRight} right first try · ${s.hintsUsed} hints · about ${s.activeMinutes} min.`),
    m.mastered ? el('p', null, 'You can explain why the bike keeps moving, why it speeds up, why mass matters and why the ground pushes back, and back it up with the maths. Next up: Berm Lab uses all of it to explain cornering.') :
      el('p', null, 'Mastery is about showing what you understand, not finishing pages. Go back to the sections above, then come back and try again.'));
}

export const ACTIVITIES = {
  'identify-forces': identifyForces, inertia, 'accel-sliders': accelSliders, 'who-pushes': whoPushes, 'fbd-builder': fbdBuilder,
  'force-lab': forceLabActivity, 'knowledge-check': knowledgeCheck, 'final-challenge': finalChallenge, mastery
};
