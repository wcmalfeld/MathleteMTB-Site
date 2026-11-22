// Pick the forces (PRD 4.6 and 8.5): the student ticks each force that acts
// on the rider-bike system from outside and gives it a direction, and the
// free-body diagram draws itself as they go. Graded against the scenario
// (logic/lesson.js SCENARIOS); feedback names the force that's wrong and
// why. After a correct diagram, where the scenario has one, a follow-up
// asks which way the net force points.
//
// pickForces(qid, { progress, key, onDone }) -> element

import { el, clear, button, id as uid } from './dom.js';
import { fbd } from './visuals.js';
import { ask } from './ask.js';
import { QUESTIONS, SCENARIOS, FORCES, DIR_TEXT, NET_TEXT } from '../logic/lesson.js';

const HINTS = [
  'Start with two forces that act on almost anything sitting on the ground: Earth’s pull and the surface’s push.',
  'Then ask what the bike touches: the ground (push and grip) and the air.',
  'Forces between the rider and parts of the bike are inside the system. They don’t go on its diagram.'
];

export function gradeForces(scenarioId, picks) {
  const sc = SCENARIOS[scenarioId];
  const chosen = Object.keys(picks).filter(k => picks[k]);
  const extra = chosen.find(k => !sc.correct[k]);
  if (extra) return { correct: false, code: 'extra-' + extra, force: extra, message: `${FORCES[extra].name}: ${sc.not[extra] || 'that force doesn’t act on the system here.'}` };
  const missing = Object.keys(sc.correct).filter(k => !picks[k]);
  const wrongDir = chosen.find(k => picks[k] !== sc.correct[k]);
  if (wrongDir) return { correct: false, code: 'direction-' + wrongDir, force: wrongDir, message: `${FORCES[wrongDir].name} is right to include, but check its direction.${wrongDir === 'gravity' ? ' Gravity always points straight down.' : wrongDir === 'normal' && sc.tilt ? ' The normal force is perpendicular to the surface, not straight up.' : ''}` };
  if (missing.length) return { correct: false, code: 'missing', message: `Every force you picked belongs, but ${missing.length === 1 ? 'one is' : missing.length + ' are'} missing.` };
  return { correct: true, code: 'correct' };
}
const describe = picks => Object.keys(picks).filter(k => picks[k]).map(k => `${FORCES[k].name} ${DIR_TEXT[picks[k]]}`).join('; ') || 'nothing';

export function pickForces(qid, o) {
  const q = QUESTIONS[qid], sc = SCENARIOS[q.scenario], P = o.progress, key = o.key || null;
  const rec = () => P.question(qid, key) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const picks = {};
  const wrap = el('div', { class: 'nl-ask nl-forces', 'data-q': qid });
  const pid = uid('fp');
  wrap.appendChild(el('p', { class: 'nl-prompt', id: pid }, q.prompt));
  const diagram = el('div', { class: 'nl-forces-diagram', 'aria-live': 'polite' });
  const rows = el('fieldset', { class: 'nl-force-rows', 'aria-labelledby': pid }, el('legend', { class: 'nl-sr' }, 'Forces and directions'));
  const inputs = {};
  sc.choices.forEach(k => {
    const cid = uid('fc'), sid = uid('fd');
    const box = el('input', { type: 'checkbox', id: cid });
    const sel = el('select', { id: sid, class: 'nl-select', disabled: true, 'aria-label': FORCES[k].name + ' direction' },
      el('option', { value: '' }, 'Direction…'), sc.dirs.map(d => el('option', { value: d }, DIR_TEXT[d])));
    const sync = () => { sel.disabled = !box.checked || locked; picks[k] = box.checked ? (sel.value || null) : null; draw(); };
    box.addEventListener('change', () => { if (box.checked && !sel.value) sel.focus(); sync(); });
    sel.addEventListener('change', sync);
    inputs[k] = { box, sel };
    rows.appendChild(el('div', { class: 'nl-force-row' },
      el('label', { for: cid, class: 'nl-check' }, box, el('span', { class: `nl-swatch nl-swatch--${FORCES[k].cls}`, 'aria-hidden': 'true' }), el('span', null, FORCES[k].name, ' ', el('span', { class: 'nl-sym' }, `(${FORCES[k].sym})`))), sel));
  });
  const grid = el('div', { class: 'nl-forces-grid' }, rows, diagram);
  wrap.appendChild(grid);
  const fb = el('div', { class: 'nl-fb', role: 'status', 'aria-live': 'polite' });
  const hintsEl = el('ol', { class: 'nl-hints', 'aria-label': 'Hints' });
  const checkBtn = button('Check my diagram', check, 'nl-btn--primary');
  const hintBtn = button('Get a hint', () => { P.hint(qid, key); drawHints(); }, 'nl-btn--quiet');
  const showBtn = button('Show the answer', reveal, 'nl-btn--quiet');
  const after = el('div', { class: 'nl-after' });
  wrap.append(el('div', { class: 'nl-actions' }, checkBtn, hintBtn, showBtn), hintsEl, fb, after);
  let locked = false;

  function draw() {
    const forces = Object.keys(picks).filter(k => picks[k]).map(k => ({ type: k, dir: picks[k] }));
    clear(diagram).appendChild(fbd({ tilt: sc.tilt, forces, title: `Your free-body diagram: ${describe(picks)}.` }));
    diagram.appendChild(el('p', { class: 'nl-small nl-forces-cap' }, sc.title + ' · ' + (forces.length ? forces.length + ' force' + (forces.length > 1 ? 's' : '') : 'no forces yet')));
  }
  function drawHints() {
    clear(hintsEl);
    const r = rec();
    HINTS.slice(0, r.hints).forEach((h, i) => hintsEl.appendChild(el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    hintBtn.disabled = r.hints >= HINTS.length;
    hintBtn.textContent = r.hints >= HINTS.length ? 'No more hints' : r.hints ? 'Next hint' : 'Get a hint';
    showBtn.hidden = r.correct || r.revealed || r.attempts < 2;
  }
  const say = (tone, ...ps) => { clear(fb); fb.className = 'nl-fb nl-fb--' + tone; ps.filter(Boolean).forEach(p => fb.appendChild(el('p', null, p))); };
  function setPicks(map) {
    Object.entries(inputs).forEach(([k, { box, sel }]) => { box.checked = !!map[k]; sel.value = map[k] || ''; picks[k] = map[k] || null; });
    draw();
  }
  function finish(right, silent) {
    locked = true;
    Object.values(inputs).forEach(({ box, sel }) => { box.disabled = true; sel.disabled = true; });
    checkBtn.hidden = hintBtn.hidden = showBtn.hidden = true;
    clear(after);
    after.appendChild(el('div', { class: 'nl-solution' }, el('p', { class: 'nl-solution-h' }, right ? 'Why each force is there' : 'The free-body diagram'),
      el('ul', null, Object.keys(sc.correct).map(k => el('li', null, el('b', null, `${FORCES[k].name} (${DIR_TEXT[sc.correct[k]]}): `), sc.why[k])))));
    if (sc.net) {
      const opts = sc.tilt ? ['zero', 'uphill', 'downhill'] : ['zero', 'forward', 'backward'];
      const nq = { ...QUESTIONS['fbd-net'], id: 'fbd-net', type: 'choice',
        prompt: `${sc.title}: which way does the net force on the system point?`,
        options: opts.map(x => ({ id: x, text: NET_TEXT[x], correct: x === sc.net,
          feedback: x === sc.net ? (x === 'zero' ? 'Steady speed: every force is balanced.' : 'The system is speeding up or slowing down in that direction, so that’s where the net force points.') : (x === 'zero' ? 'The speed is changing, so the forces can’t balance.' : 'Think about whether the rider is speeding up, slowing down or steady, and which way.') })),
        solution: sc.net === 'zero' ? 'Constant velocity means zero acceleration, so the net force is zero: the arrows cancel in pairs.' : `The net force points ${NET_TEXT[sc.net].toLowerCase()}: the same way as the acceleration (second law).` };
      after.appendChild(ask(nq, { progress: P, key: q.scenario, onDone: o.onDone }));
    }
    if (!silent && o.onDone) o.onDone({ correct: right });
  }
  function check() {
    if (Object.keys(picks).some(k => inputs[k].box.checked && !picks[k])) return say('info', 'Give every force you ticked a direction first.');
    if (!Object.values(picks).some(Boolean)) return say('info', 'Tick at least one force first.');
    const res = gradeForces(q.scenario, picks);
    P.attempt(qid, key, describe(picks), res.correct, { code: res.code, prompt: q.prompt + ' (' + sc.title + ')', correctAnswer: describe(sc.correct) });
    if (res.correct) { say('right', rec().attempts === 1 ? 'Right, first try. That’s the complete diagram.' : 'Right. That’s the complete diagram.'); finish(true); return; }
    say('wrong', res.message, rec().hints < HINTS.length ? 'Fix it and check again, or take a hint.' : 'Fix it and check again.');
    drawHints();
  }
  function reveal() { P.reveal(qid, key); setPicks(sc.correct); say('info', 'Here’s the complete diagram. Read why each force is there, then carry on.'); finish(false); }

  draw(); drawHints();
  const r0 = rec();
  if (r0.correct || r0.revealed) { setPicks(sc.correct); say(r0.correct ? 'right' : 'info', r0.correct ? 'You’ve already built this one correctly.' : 'You looked at the answer for this one.'); finish(r0.correct, true); }
  return wrap;
}
