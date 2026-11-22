// Introduction to Physics: the interactives (lesson block { t: 'activity', id }).
// Each takes the lesson kit's ctx = { progress, refresh(), ask(id), cleanup(fn) }.

import { el, svg, clear, button, put, id as uid, reducedMotion } from '../../lesson-kit/dom.js';
import { trailScene, rideProfile, stagePoint, realJump, modelJump, branchMap, branchPos } from './scene.js';
import { HOTSPOTS, STAGES, CLASSIFY, CATEGORIES, SYSTEMS, MODEL_FACTORS, STATEMENTS, STATEMENT_KINDS, DESIGN, BRANCHES, LIVE, DETECTIVE_STAGES, DETECTIVE_PARTS, QUESTIONS } from '../logic/lesson.js';
import { gradeClassify, gradeSystem, gradeModel, gradeSort, gradeDesign, gradeDetective, writeupFeedback } from '../logic/grade.js';

const card = (title, ...kids) => el('section', { class: 'ls-card ls-activity' }, el('p', { class: 'ls-kicker' }, 'Try it'), el('h3', { class: 'ls-h3' }, title), ...kids);

// One graded item with custom inputs: check, feedback, and (after two
// tries) "Show the answer". o = { id, ctx, read(), grade(ans), text(ans),
// correctText, lock(), showAnswer(), after(right) -> element, label }
function checker(o) {
  const P = o.ctx.progress, rec = () => P.question(o.id) || { attempts: 0, correct: false, revealed: false };
  const fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' });
  const after = el('div', { class: 'ip-after' });
  const checkBtn = button(o.label || 'Check', check, 'ls-btn--primary');
  const showBtn = button('Show the answer', reveal, 'ls-btn--quiet');
  showBtn.hidden = true;
  const say = (tone, ...ps) => { clear(fb); fb.className = 'ls-fb ls-fb--' + tone; ps.filter(Boolean).forEach(p => fb.appendChild(el('p', null, p))); };
  function finish(right, silent) {
    o.lock(); checkBtn.hidden = showBtn.hidden = true;
    clear(after); const a = o.after && o.after(right); if (a) after.appendChild(a);
    if (!silent) o.ctx.refresh();
  }
  function check() {
    const ans = o.read(), res = o.grade(ans);
    if (res.code === 'empty') return say('info', res.message);
    P.attempt(o.id, null, o.text(ans), res.correct, { code: res.code, prompt: QUESTIONS[o.id].prompt, correctAnswer: o.correctText });
    if (o.onResult) o.onResult(res);
    if (res.correct) { say('right', rec().attempts === 1 ? 'Right, first try.' : 'Right.'); finish(true); return; }
    say('wrong', res.message, 'Have another go.');
    showBtn.hidden = rec().attempts < 2;
  }
  function reveal() { P.reveal(o.id); o.showAnswer(); say('info', 'Here’s the answer. Read why, then carry on.'); finish(false); }
  const node = el('div', { class: 'ip-check' }, el('div', { class: 'ls-actions' }, checkBtn, showBtn), fb, after);
  const r0 = rec();
  if (r0.correct || r0.revealed) setTimeout(() => { o.showAnswer(); say(r0.correct ? 'right' : 'info', r0.correct ? 'You’ve already got this one.' : 'You looked at the answer for this one.'); finish(r0.correct, true); }, 0);
  return node;
}
const toggleChip = (label, on, onToggle, extra = {}) => {
  const b = el('button', { type: 'button', class: 'ip-chip', 'aria-pressed': String(!!on), ...extra }, label);
  b.addEventListener('click', () => { if (b.disabled) return; const v = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(v)); onToggle(v); });
  return b;
};
// A task that completes once every item has been explored.
function exploreTask(ctx, taskId, dataKey, total, label) {
  const P = ctx.progress;
  return {
    seen: () => P.getData(dataKey, []),
    mark(id) {
      const s = new Set(P.getData(dataKey, [])); if (s.has(id)) return s.size; s.add(id); P.setData(dataKey, [...s]);
      if (s.size >= total && !P.done(taskId)) { P.attempt(taskId, null, `${label}: all ${total} explored`, true, { correctAnswer: `All ${total}` }); }
      ctx.refresh(); return s.size;
    }
  };
}

// ---- Section 1: Find the Physics (PRD 4.3)
function findPhysics(ctx) {
  const T = exploreTask(ctx, 'find-physics', 'hotspots', HOTSPOTS.length, 'Find the Physics');
  const panel = el('div', { class: 'ip-info', 'aria-live': 'polite' }, el('p', { class: 'ls-small' }, 'Tap a numbered spot on the picture to see the physics hiding there.'));
  const count = el('p', { class: 'ip-count' });
  const done = el('p', { class: 'ip-congrats', hidden: true }, 'Congratulations. You’ve just found eight different ways to study physics through mountain biking.');
  const buttons = HOTSPOTS.map((h, i) => {
    const b = el('button', { type: 'button', class: 'ip-hot', style: { left: h.x + '%', top: h.y + '%' }, 'aria-label': `${i + 1}: ${h.label}` }, String(i + 1));
    b.addEventListener('click', () => open(h, b)); return b;
  });
  const sceneBox = el('div', { class: 'ip-scene' }, trailScene(), buttons);
  function sync() {
    const seen = T.seen();
    buttons.forEach((b, i) => b.classList.toggle('is-seen', seen.includes(HOTSPOTS[i].id)));
    count.textContent = `${seen.length} of ${HOTSPOTS.length} found`;
    done.hidden = seen.length < HOTSPOTS.length;
  }
  function open(h, b) {
    buttons.forEach(x => x.classList.toggle('is-open', x === b));
    put(panel, el('p', { class: 'ls-kicker' }, h.concept), el('h4', { class: 'ip-info-h' }, h.label), el('p', { class: 'ip-info-q' }, h.q), el('p', null, h.text),
      el('p', { class: 'ls-small' }, 'You’ll dig into this in ', el('b', null, h.module), '.'));
    T.mark(h.id); sync();
  }
  sync();
  return card('Find the Physics', el('div', { class: 'ip-explorer' }, sceneBox, el('div', null, count, panel, done)));
}

// ---- Section 2: One Ride, Seven Physics Lessons (PRD 5.3)
function rideJourney(ctx) {
  const T = exploreTask(ctx, 'ride-stages', 'stages', STAGES.length, 'One Ride');
  const { node: profile, marker } = rideProfile();
  let pos = stagePoint(STAGES[0]), raf = 0;
  ctx.cleanup(() => cancelAnimationFrame(raf));
  const place = p => marker.setAttribute('transform', `translate(${p.x} ${p.y})`);
  place(pos);
  const panel = el('div', { class: 'ip-info ip-stage-info', 'aria-live': 'polite' }, el('p', { class: 'ls-small' }, 'Start at the top: tap stage 1.'));
  const buttons = STAGES.map(st => {
    // A timeline row along the bottom, on each stage's tick line, so the rider stays visible.
    const b = el('button', { type: 'button', class: 'ip-hot ip-hot--stage', style: { left: st.x + '%', top: '90%' }, 'aria-label': `Stage ${st.n}: ${st.title}` }, String(st.n));
    b.addEventListener('click', () => open(st, b)); return b;
  });
  const all = el('div', { class: 'ip-all' });
  const count = el('p', { class: 'ip-count' });
  function moveTo(p) {
    cancelAnimationFrame(raf);
    if (reducedMotion()) { pos = p; place(p); return; }
    const from = { ...pos }, t0 = performance.now(), dur = 700;
    const frame = now => { const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      pos = { x: from.x + (p.x - from.x) * e, y: from.y + (p.y - from.y) * e }; place(pos); if (k < 1) raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
  }
  function open(st, b) {
    buttons.forEach(x => x.classList.toggle('is-open', x === b));
    moveTo(stagePoint(st));
    put(panel, el('p', { class: 'ls-kicker' }, `Stage ${st.n} of 7`), el('h4', { class: 'ip-info-h' }, st.title), el('p', null, el('b', null, 'What’s happening: '), st.happening),
      el('ul', { class: 'ip-concepts', 'aria-label': 'Physics concepts' }, st.concepts.map(c => el('li', null, c))),
      el('p', null, el('b', null, 'On the bike: '), st.mtb), el('p', { class: 'ip-info-q' }, el('b', null, 'Investigate: '), st.investigate));
    T.mark(st.id); sync();
  }
  function sync() {
    const seen = T.seen();
    buttons.forEach((b, i) => b.classList.toggle('is-seen', seen.includes(STAGES[i].id)));
    count.textContent = `${seen.length} of 7 stages explored`;
    if (seen.length >= STAGES.length) put(all, el('h4', { class: 'ip-info-h' }, 'All seven, together'),
      el('p', { class: 'ls-small' }, 'One ride, and the same few ideas keep coming back. Future lessons return to this trail to show where you met each one.'),
      el('ol', { class: 'ip-all-list' }, STAGES.map(st => el('li', null, el('b', null, st.title), el('span', null, st.concepts.join(' · '))))));
  }
  sync();
  return card('One ride, seven physics lessons', el('div', { class: 'ip-scene ip-scene--profile' }, profile, buttons), count, panel, all);
}

// ---- Section 3: Classify the Physics (PRD 6.5)
function classify(ctx) {
  return card('Classify the physics', el('p', null, 'For each scenario, pick every idea that’s at work. Most involve more than one.'),
    el('div', { class: 'ip-list' }, Object.keys(CLASSIFY).map(id => {
      const c = CLASSIFY[id], picks = new Set();
      const chips = Object.entries(CATEGORIES).map(([k, name]) => toggleChip(name, false, v => (v ? picks.add(k) : picks.delete(k)), { 'data-k': k }));
      const setAll = ks => chips.forEach(b => { const on = ks.includes(b.getAttribute('data-k')); b.setAttribute('aria-pressed', String(on)); on ? picks.add(b.getAttribute('data-k')) : picks.delete(b.getAttribute('data-k')); });
      return el('div', { class: 'ip-item', 'data-q': id }, el('p', { class: 'ls-prompt' }, c.scenario), el('div', { class: 'ip-chips', role: 'group', 'aria-label': 'Categories' }, chips),
        checker({ id, ctx, read: () => [...picks], grade: p => gradeClassify(id, p), text: p => p.map(k => CATEGORIES[k]).join(', '), correctText: c.fits.map(k => CATEGORIES[k]).join(', '),
          lock: () => chips.forEach(b => { b.disabled = true; }), showAnswer: () => setAll(c.fits),
          after: () => el('ul', { class: 'ip-why' }, [...new Set([...c.fits, ...[...picks].filter(p => c.also.includes(p))])].map(k => el('li', null, el('b', null, CATEGORIES[k] + ': '), c.why[k]))) }));
    })));
}

// ---- Section 4: Choose Your System (PRD 7.3)
function chooseSystem(ctx) {
  return card('Choose your system', el('p', null, 'Tap the objects that belong in the system for each question. Everything else is the surroundings.'),
    el('div', { class: 'ip-list' }, Object.keys(SYSTEMS).map(id => {
      const s = SYSTEMS[id], picks = new Set();
      const inside = el('ul', { class: 'ip-zone-list' }), outside = el('ul', { class: 'ip-zone-list' });
      const draw = () => { put(inside, [...picks].map(k => el('li', null, s.objects[k]))); put(outside, Object.keys(s.objects).filter(k => !picks.has(k)).map(k => el('li', null, s.objects[k]))); };
      const chips = Object.entries(s.objects).map(([k, name]) => toggleChip(name, false, v => { v ? picks.add(k) : picks.delete(k); draw(); }, { 'data-k': k }));
      draw();
      return el('div', { class: 'ip-item', 'data-q': id }, el('p', { class: 'ls-prompt' }, s.question), el('div', { class: 'ip-chips', role: 'group', 'aria-label': 'Objects' }, chips),
        el('div', { class: 'ip-zones' }, el('div', { class: 'ip-zone ip-zone--in' }, el('p', { class: 'ip-zone-h' }, 'System'), inside), el('div', { class: 'ip-zone' }, el('p', { class: 'ip-zone-h' }, 'Surroundings'), outside)),
        checker({ id, ctx, read: () => [...picks], grade: p => gradeSystem(id, p), text: p => p.map(k => s.objects[k]).join(', ') || 'nothing', correctText: s.required.map(k => s.objects[k]).join(', '),
          lock: () => chips.forEach(b => { b.disabled = true; }),
          showAnswer: () => { picks.clear(); s.required.forEach(k => picks.add(k)); chips.forEach(b => b.setAttribute('aria-pressed', String(picks.has(b.getAttribute('data-k'))))); draw(); },
          after: () => el('div', { class: 'ls-solution' }, el('p', { class: 'ls-solution-h' }, 'Across the boundary'), el('p', null, s.outside),
            s.optional.length ? el('p', { class: 'ls-small' }, s.optional.map(k => s.notes[k]).join(' ')) : null) }));
    })));
}

// ---- Section 4: Real world vs. physics model (PRD 7.6)
function modelCompare(ctx) {
  const picks = new Set(), id = 'model-simplify';
  const chips = MODEL_FACTORS.map(([k, name]) => toggleChip(name, false, v => (v ? picks.add(k) : picks.delete(k)), { 'data-k': k }));
  return card('Real world vs. physics model',
    el('div', { class: 'ip-compare' },
      el('figure', { class: 'ip-compare-fig' }, realJump(), el('figcaption', null, el('b', null, 'The real jump. '), 'Body movement, drag, suspension, spinning wheels, a bike that changes angle.')),
      el('figure', { class: 'ip-compare-fig' }, modelJump(), el('figcaption', null, el('b', null, 'The physics model. '), 'One point, a launch velocity, gravity, horizontal and vertical motion.'))),
    el('div', { class: 'ip-item', 'data-q': id }, el('p', { class: 'ls-prompt' }, QUESTIONS[id].prompt), el('div', { class: 'ip-chips', role: 'group', 'aria-label': 'Factors' }, chips),
      checker({ id, ctx, read: () => [...picks], grade: p => (p.length ? gradeModel(p) : { code: 'empty', message: 'Pick at least one factor.' }), text: p => p.map(k => MODEL_FACTORS.find(f => f[0] === k)[1]).join(', '),
        correctText: MODEL_FACTORS.filter(f => f[2]).map(f => f[1]).join(', '), lock: () => chips.forEach(b => { b.disabled = true; }),
        showAnswer: () => chips.forEach(b => { const on = MODEL_FACTORS.find(f => f[0] === b.getAttribute('data-k'))[2]; b.setAttribute('aria-pressed', String(on)); }),
        after: () => el('div', { class: 'ls-solution' }, el('p', { class: 'ls-solution-h' }, 'Simplified, not wrong'), el('p', null, 'Drag, body movement, suspension and wheel spin are left out. Gravity, the launch velocity and the horizontal motion stay in: they’re what decides where you land. Leaving things out is a decision that makes the problem manageable, not a mistake.')) })));
}

// ---- Section 5: observation, explanation or prediction (PRD 8.4)
function obsSort(ctx) {
  const id = 'obs-sort', answers = {}, groups = {};
  const rows = STATEMENTS.map(([sid, text]) => {
    const name = uid('os');
    const seg = el('div', { class: 'ip-sort-opts', role: 'radiogroup', 'aria-label': text }, Object.entries(STATEMENT_KINDS).map(([k, label]) => {
      const rid = uid('r'); const r = el('input', { type: 'radio', id: rid, name, value: k });
      r.addEventListener('change', () => { answers[sid] = k; });
      return el('label', { for: rid, class: 'ip-sort-opt' }, r, label);
    }));
    groups[sid] = seg;
    return el('li', { class: 'ip-sort-row', 'data-s': sid }, el('p', null, text), seg);
  });
  const set = (sid, k) => { const r = groups[sid].querySelector(`input[value="${k}"]`); if (r) r.checked = true; answers[sid] = k; };
  return card('Observation, explanation or prediction?', el('ol', { class: 'ip-sort' }, rows),
    checker({ id, ctx, read: () => ({ ...answers }), grade: gradeSort, text: a => STATEMENTS.map(([s]) => `${s}:${a[s] || '-'}`).join(' '), correctText: STATEMENTS.map(([s, , k]) => `${s}:${k}`).join(' '),
      onResult: res => rows.forEach(r => r.classList.toggle('is-wrong', !!(res.wrong && res.wrong.includes(r.getAttribute('data-s'))))),
      lock: () => Object.values(groups).forEach(g => g.querySelectorAll('input').forEach(i => { i.disabled = true; })),
      showAnswer: () => STATEMENTS.forEach(([s, , k]) => set(s, k)),
      after: () => el('p', { class: 'ls-small' }, 'Observations are evidence. Explanations use physics to interpret it. Predictions say what you’ll see next, so you can test them.') }));
}

// ---- Section 5: Design Your Own MTB Experiment (PRD 8.5)
function designExperiment(ctx) {
  const P = ctx.progress, id = 'design-experiment';
  const saved = P.getData('investigation', {});
  const sel = (label, opts, value) => { const sid = uid('d'); const s = el('select', { id: sid, class: 'ls-select ip-select' }, el('option', { value: '' }, 'Choose…'), opts.map(([k, t]) => el('option', { value: k, selected: value === k ? true : null }, t)));
    return { s, node: el('div', { class: 'ls-field' }, el('label', { for: sid }, label), s) }; };
  const iv = sel('1. Independent variable: what you change', DESIGN.iv, saved.iv), dv = sel('2. Dependent variable: what you measure', DESIGN.dv, saved.dv);
  const ctrl = new Set(saved.controls || []);
  const ctrlChips = DESIGN.controls.map(([k, t]) => toggleChip(t, ctrl.has(k), v => (v ? ctrl.add(k) : ctrl.delete(k)), { 'data-k': k }));
  const hid = uid('h'), hyp = el('textarea', { id: hid, class: 'ls-textarea', rows: 3, placeholder: 'I think… because…' }); hyp.value = saved.hypothesis || '';
  const prName = uid('p');
  const preds = DESIGN.predictions.map(([k, t]) => { const rid = uid('pr'); const r = el('input', { type: 'radio', id: rid, name: prName, value: k, checked: saved.prediction === k ? true : null }); return el('label', { for: rid, class: 'ls-choice' }, r, el('span', null, t)); });
  const nid = uid('n'), note = el('textarea', { id: nid, class: 'ls-textarea', rows: 2, placeholder: 'Optional: how you’d measure it' }); note.value = saved.note || '';
  const read = () => ({ iv: iv.s.value, dv: dv.s.value, controls: [...ctrl], hypothesis: hyp.value, prediction: (preds.map(l => l.querySelector('input')).find(i => i.checked) || {}).value || '', note: note.value });
  const store = () => P.setData('investigation', { ...read(), savedAt: new Date().toISOString() });
  [iv.s, dv.s, hyp, note].forEach(x => x.addEventListener('change', store));
  const marks = el('ul', { class: 'ip-design-marks' });
  const summary = d => el('div', { class: 'ls-solution' }, el('p', { class: 'ls-solution-h' }, 'Your investigation (saved)'),
    el('ul', null, el('li', null, el('b', null, 'Question: '), DESIGN.question), el('li', null, el('b', null, 'Change: '), (DESIGN.iv.find(x => x[0] === d.iv) || [])[1] || '—'),
      el('li', null, el('b', null, 'Measure: '), (DESIGN.dv.find(x => x[0] === d.dv) || [])[1] || '—'), el('li', null, el('b', null, 'Keep the same: '), d.controls.map(k => DESIGN.controls.find(x => x[0] === k)[1]).join(', ')),
      el('li', null, el('b', null, 'Hypothesis: '), d.hypothesis), el('li', null, el('b', null, 'Prediction: '), (DESIGN.predictions.find(x => x[0] === d.prediction) || [])[1] || '—'), d.note ? el('li', null, el('b', null, 'Method: '), d.note) : null),
    el('p', { class: 'ls-small' }, 'A good experiment changes one thing, measures one thing and keeps everything else the same, then repeats the runs so one odd result doesn’t decide the answer. Module 3 shows how to measure it.'));
  return card('Design your own MTB experiment', el('p', { class: 'ls-prompt' }, DESIGN.question),
    el('div', { class: 'ip-design', 'data-q': id }, iv.node, dv.node,
      el('div', { class: 'ls-field' }, el('span', { class: 'ip-label' }, '3. Controlled variables: pick at least three to keep the same'), el('div', { class: 'ip-chips', role: 'group', 'aria-label': 'Controlled variables' }, ctrlChips)),
      el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: hid }, '4. Your hypothesis (a testable idea, ideally with a reason)'), hyp),
      el('fieldset', { class: 'ls-choices' }, el('legend', { class: 'ip-label' }, '5. Your prediction'), preds),
      el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: nid }, 'How would you measure it? (optional)'), note), marks),
    checker({ id, ctx, label: 'Check my experiment', read, grade: d => { const r = gradeDesign(d); store();
        put(marks, ['iv', 'dv', 'controls', 'hypothesis', 'prediction'].map(k => el('li', { class: r.parts[k] ? 'is-right' : 'is-wrong' }, (r.parts[k] ? '✓ ' : '✗ ') + { iv: 'Independent variable', dv: 'Dependent variable', controls: 'Controlled variables', hypothesis: 'Hypothesis', prediction: 'Prediction' }[k])));
        if (r.correct && !r.because) r.message = 'Tip: a hypothesis is strongest with a reason (“because…”).'; return r; },
      text: d => `IV ${d.iv}; DV ${d.dv}; controls ${d.controls.join(',')}; prediction ${d.prediction}; hypothesis: ${d.hypothesis}`.slice(0, 900), correctText: 'IV trail angle; DV acceleration; 3+ controls; acceleration increases',
      lock: () => { [iv.s, dv.s, hyp, note].forEach(x => { x.disabled = true; }); ctrlChips.forEach(b => { b.disabled = true; }); preds.forEach(l => { l.querySelector('input').disabled = true; }); },
      showAnswer: () => { iv.s.value = 'angle'; dv.s.value = 'accel'; ['mass', 'speed', 'surface'].forEach(k => ctrl.add(k)); ctrlChips.forEach(b => b.setAttribute('aria-pressed', String(ctrl.has(b.getAttribute('data-k'))))); preds[0].querySelector('input').checked = true; if (!hyp.value.trim()) hyp.value = 'A steeper trail makes the bike speed up faster because more of gravity pulls along the slope.'; },
      after: () => summary(read()) }));
}

// ---- Section 6: the physics universe of MTB (PRD 9.8)
function branchMapActivity(ctx) {
  const T = exploreTask(ctx, 'branches', 'branches-seen', BRANCHES.length, 'Branches');
  const panel = el('div', { class: 'ip-info', 'aria-live': 'polite' }, el('p', { class: 'ls-small' }, 'Tap a branch to see what it studies, where it shows up on the bike, and the labs that explore it.'));
  const count = el('p', { class: 'ip-count' });
  const buttons = BRANCHES.map((b, i) => { const p = branchPos(i, BRANCHES.length);
    const x = el('button', { type: 'button', class: 'ip-branch', style: { left: p.x + '%', top: p.y + '%' } }, b.name); x.addEventListener('click', () => open(b, x)); return x; });
  function open(b, x) {
    buttons.forEach(y => y.classList.toggle('is-open', y === x));
    put(panel, el('p', { class: 'ls-kicker' }, 'Branch of physics'), el('h4', { class: 'ip-info-h' }, b.name), el('p', null, el('b', null, 'Studies: '), b.studies),
      el('p', null, el('b', null, 'On the bike: '), b.mtb.join(' · ')), el('p', { class: 'ip-info-q' }, el('b', null, 'Investigate: '), b.q),
      el('p', { class: 'ls-small' }, el('b', null, 'Labs: ')), el('ul', { class: 'ip-labs' }, b.labs.map(([lid, name]) => el('li', null, LIVE[lid] ? el('a', { href: LIVE[lid] }, name, ' →') : el('span', null, name, el('span', { class: 'ip-soon' }, ' coming'))))));
    T.mark(b.id); sync();
  }
  function sync() { const seen = T.seen(); buttons.forEach((x, i) => x.classList.toggle('is-seen', seen.includes(BRANCHES[i].id))); count.textContent = `${seen.length} of ${BRANCHES.length} branches explored`; }
  sync();
  return card('The physics universe of MTB', el('div', { class: 'ip-explorer ip-explorer--map' }, el('div', { class: 'ip-scene ip-scene--map' }, branchMap(BRANCHES.length), buttons), el('div', null, count, panel)));
}

// ---- Final challenge: Become a Physics Detective (PRD 11)
function physicsDetective(ctx) {
  const P = ctx.progress, saved = P.getData('detective', { picks: {}, parts: {} });
  const picks = Object.fromEntries(DETECTIVE_STAGES.map(st => [st.id, new Set(saved.picks[st.id] || [])]));
  const store = () => P.setData('detective', { picks: Object.fromEntries(Object.entries(picks).map(([k, v]) => [k, [...v]])), parts: readParts() }, true);
  const allChips = [];
  const stages = el('div', { class: 'ip-detective-stages', 'data-q': 'detective-stages' }, DETECTIVE_STAGES.map((st, i) => {
    const chips = st.options.map(([k, t]) => { const b = toggleChip(t, picks[st.id].has(k), v => { v ? picks[st.id].add(k) : picks[st.id].delete(k); store(); }, { 'data-st': st.id, 'data-k': k }); allChips.push(b); return b; });
    return el('div', { class: 'ip-det-stage' }, el('p', { class: 'ip-det-h' }, el('span', { class: 'ip-det-n' }, String(i + 1)), st.title), el('div', { class: 'ip-chips' }, chips));
  }));
  const stageCheck = checker({ id: 'detective-stages', ctx, label: 'Check my ride', read: () => Object.fromEntries(Object.entries(picks).map(([k, v]) => [k, [...v]])), grade: gradeDetective,
    text: p => DETECTIVE_STAGES.map(st => `${st.title}: ${(p[st.id] || []).join(',')}`).join('; '), correctText: 'At least one real concept for each stage',
    lock: () => allChips.forEach(b => { b.disabled = true; }),
    showAnswer: () => allChips.forEach(b => { const st = DETECTIVE_STAGES.find(s => s.id === b.getAttribute('data-st')); const on = st.options.find(o => o[0] === b.getAttribute('data-k'))[2]; b.setAttribute('aria-pressed', String(on)); }),
    after: () => el('p', { class: 'ls-small' }, 'Every stage has more than one physics idea at work. Now take one and investigate it.') });
  const boxes = {};
  const partEls = DETECTIVE_PARTS.map(([k, h, prompt]) => { const tid = uid('dp'); boxes[k] = el('textarea', { id: tid, class: 'ls-textarea', rows: 2 }); boxes[k].value = (saved.parts || {})[k] || '';
    boxes[k].addEventListener('change', store); return el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: tid }, el('b', null, h + ': '), prompt), boxes[k]); });
  function readParts() { return Object.fromEntries(Object.entries(boxes).map(([k, b]) => [k, b.value])); }
  const fb = el('div', { class: 'ls-fb', 'aria-live': 'polite' });
  const writeBtn = button('Save my investigation', () => {
    const parts = readParts(), r = writeupFeedback(parts); store();
    put(fb, r.tips.map(t => el('p', null, t)), r.complete ? el('p', { class: 'ip-saved' }, '✓ Saved to your lesson progress. Your tutor can read it.') : el('p', null, `Still to write: ${r.empty.join(', ')} (a sentence each is plenty).`));
    fb.className = 'ls-fb ls-fb--' + (r.complete ? 'right' : 'info');
    if (r.complete && !P.done('detective-writeup')) P.attempt('detective-writeup', null, DETECTIVE_PARTS.map(([k, h]) => `${h}: ${parts[k].trim()}`).join(' | ').slice(0, 2000), true, { correctAnswer: 'All five parts written' });
    ctx.refresh();
  }, 'ls-btn--primary');
  if (P.done('detective-writeup')) put(fb, el('p', { class: 'ip-saved' }, '✓ Saved. You can edit and save again any time.'));
  return el('section', { class: 'ls-final', 'aria-labelledby': 'pd-h' },
    el('p', { class: 'ls-kicker' }, 'Final challenge'),
    el('h2', { class: 'ls-h2', id: 'pd-h' }, 'Become a physics detective'),
    el('div', { class: 'ls-given' }, el('p', null, 'You’re riding down a trail. You speed up down a slope, carve a berm, launch off a jump, land, and brake before the next corner. Your mission: find the physics happening throughout your ride.')),
    el('h3', { class: 'ls-h3' }, 'Your ride, stage by stage'), stages, stageCheck,
    el('h3', { class: 'ls-h3' }, 'Your investigation'), el('p', { class: 'ls-small' }, 'Short answers are fine. Logical thinking counts more than physics vocabulary.'),
    el('div', { class: 'ip-parts' }, partEls), el('div', { class: 'ls-actions' }, writeBtn), fb);
}

export const ACTIVITIES = {
  'find-physics': findPhysics, 'ride-journey': rideJourney, classify, 'choose-system': chooseSystem, 'model-compare': modelCompare,
  'obs-sort': obsSort, 'design-experiment': designExperiment, 'branch-map': branchMapActivity, 'physics-detective': physicsDetective
};
