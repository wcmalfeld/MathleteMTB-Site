// The Challenge Arena (PRD 8): the list of challenges with progress, and one
// challenge at a time, step by step: predict → experiment in the simulator →
// maths → explain → the post-challenge explanation. The prediction must be
// locked in before the simulator unlocks.

import { el, button, put } from './dom.js';
import { CHALLENGES, CONCEPTS, challengeById, evaluateRun, designQuestion } from '../logic/challenges.js';
import { challengePoints, maxPoints } from '../logic/progress.js';
import { carve, fmt } from '../logic/physics.js';
import { buildPath } from '../logic/simulation.js';

const buildPathFor = cfg => buildPath(carve(cfg).turnRadius);
import { createSimulator } from './sim.js';
import { ask } from './ask.js';

const LEVEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const pad = n => String(n).padStart(2, '0');

export function renderArena(ctx) {
  const P = ctx.progress, s = P.summary();
  const page = el('div', { class: 'cl-arena' });
  page.appendChild(el('header', { class: 'cl-section-head' },
    el('p', { class: 'cl-kicker' }, 'Challenge Arena'),
    el('h1', { class: 'cl-h2' }, 'Five missions on the hill'),
    el('p', { class: 'cl-lede' }, 'Each challenge starts with a prediction. Lock it in, test it in the simulator, then explain what happened. Points reward your reasoning (predicting, experimenting and explaining) as well as right answers.')));
  const pct = (a, b) => (b ? Math.round(a / b * 100) + '%' : '—');
  page.appendChild(el('dl', { class: 'cl-stats' },
    [['Completed', `${s.challengesDone} of ${s.challengesTotal}`], ['Reasoning points', `${s.points} of ${s.maxPoints}`],
      ['Predictions right', s.predictions.made ? `${s.predictions.correct} of ${s.predictions.made}` : '—'],
      ['First-try accuracy', s.questions.attempted ? pct(s.questions.firstTry, s.questions.attempted) : '—'],
      ['Hints used', String(s.hints)], ['Simulator tries', String(s.simAttempts)]]
      .map(([k, v]) => el('div', null, el('dt', null, k), el('dd', null, v)))));
  page.appendChild(el('p', { class: 'cl-concepts' }, el('b', null, 'Concepts mastered: '),
    s.concepts.length ? s.concepts.map(c => CONCEPTS[c]).join(' · ') : 'none yet. A concept counts once you finish every challenge that uses it without looking at a solution.'));
  page.appendChild(el('ol', { class: 'cl-cards' }, CHALLENGES.map(c => {
    const rec = P.challenge(c.id), pts = challengePoints(c, rec, P.question);
    const status = rec && rec.done ? 'Done' : rec && (rec.predicted || rec.step) ? 'In progress' : 'Not started';
    return el('li', { class: 'cl-card' + (rec && rec.done ? ' is-done' : '') },
      el('p', { class: 'cl-card-num' }, 'Challenge ' + pad(c.number)),
      el('h2', { class: 'cl-card-title' }, c.title),
      el('p', { class: 'cl-card-meta' }, el('span', { class: 'cl-pill cl-pill--' + c.difficulty }, LEVEL[c.difficulty]), ' ', c.concepts.map(k => CONCEPTS[k].split(':')[0]).join(', ')),
      el('p', { class: 'cl-card-desc' }, c.description),
      el('p', { class: 'cl-card-status' }, `${status} · ${pts} of ${maxPoints(c)} points`),
      el('a', { class: 'cl-btn ' + (rec && rec.done ? 'cl-btn--quiet' : 'cl-btn--primary'), href: '#challenges/' + c.id }, rec && rec.done ? 'Review' : status === 'In progress' ? 'Continue →' : 'Start →'));
  })));
  return page;
}

export function renderChallenge(ctx, cid) {
  const P = ctx.progress, c = challengeById(cid);
  if (!c) return renderArena(ctx);
  const page = el('div', { class: 'cl-challenge' });
  const sims = [];
  ctx.cleanup(() => sims.forEach(s => s.destroy()));
  page.appendChild(el('p', null, el('a', { class: 'cl-back-link', href: '#challenges' }, '← All challenges')));
  page.appendChild(el('header', { class: 'cl-section-head' },
    el('p', { class: 'cl-kicker' }, `Challenge ${pad(c.number)} · ${LEVEL[c.difficulty]}`),
    el('h1', { class: 'cl-h2' }, c.title),
    el('p', { class: 'cl-card-meta' }, c.concepts.map(k => CONCEPTS[k]).join(' · '))));
  page.appendChild(el('section', { class: 'cl-scenario', 'aria-label': 'Scenario' }, el('p', { class: 'cl-mini' }, 'The scenario'), el('p', null, c.scenario), el('p', { class: 'cl-objective' }, el('b', null, 'Objective: '), c.objective)));
  const stepsEl = el('ol', { class: 'cl-steps' });
  page.appendChild(stepsEl);
  const doneEl = el('div');
  page.appendChild(doneEl);

  const rec = () => P.challenge(c.id) || { step: 0, ran: {} };
  const verdict = () => {
    const r = rec(), pstep = c.steps[0];
    if (!r.predicted) return null;
    const right = (pstep.question.options.find(o => o.correct) || {}).text;
    const mine = (pstep.question.options.find(o => o.id === r.predicted.choice) || {}).text;
    return el('p', { class: 'cl-verdict ' + (r.predicted.correct ? 'is-right' : 'is-wrong') },
      r.predicted.correct ? `✓ Your prediction (“${mine}”) matches the experiment.` : `✗ You predicted “${mine}”. The experiment says: ${right}. That’s fine: a surprise is how experiments teach. The next steps show why.`);
  };

  function advance(i) {
    P.setStep(c.id, i + 1);
    if (i + 1 < c.steps.length) { const li = renderStep(i + 1); const h = li.querySelector('.cl-step-h'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); } }
    else complete();
  }

  function stepShell(i, title) {
    const s = c.steps[i];
    const li = el('li', { class: 'cl-step cl-step--' + s.type });
    li.appendChild(el('h2', { class: 'cl-step-h' }, el('span', { class: 'cl-step-n' }, String(i + 1)), title));
    stepsEl.appendChild(li);
    const nxt = c.steps[i + 1];
    if (nxt && i + 1 > rec().step) li.dataset.next = nxt.type === 'run' ? 'Lock in your prediction to unlock the simulator.' : '';
    return li;
  }

  function renderStep(i) {
    const s = c.steps[i], r = rec();
    if (s.type === 'predict') {
      const li = stepShell(i, 'Predict');
      const q = s.question;
      if (r.predicted) {
        const mine = (q.options.find(o => o.id === r.predicted.choice) || {}).text;
        li.append(el('p', { class: 'cl-prompt' }, q.prompt), el('p', { class: 'cl-locked-pred' }, '🔒 Your prediction: ', el('b', null, mine)));
        return li;
      }
      const name = 'p-' + c.id;
      const fs = el('fieldset', { class: 'cl-choices' }, el('legend', { class: 'cl-prompt' }, q.prompt),
        q.options.map(op => el('label', { class: 'cl-choice' }, el('input', { type: 'radio', name, value: op.id }), el('span', null, op.text))));
      const msg = el('p', { class: 'cl-fb', role: 'status', 'aria-live': 'polite' });
      const lockBtn = button('Lock in my prediction', () => {
        const pick = fs.querySelector('input:checked');
        if (!pick) { msg.textContent = 'Pick one first. There’s no penalty for guessing wrong; predicting is the point.'; return; }
        const op = q.options.find(o => o.id === pick.value);
        P.predict(c, s, op.id, !!op.correct);
        put(li.querySelector('.cl-pred-area'), el('p', { class: 'cl-locked-pred' }, '🔒 Your prediction: ', el('b', null, op.text), '. Now test it.'));
        advance(i);
      }, 'cl-btn--primary');
      li.append(el('div', { class: 'cl-pred-area' }, fs, el('p', { class: 'cl-note' }, 'Think it through before you touch the simulator. You can’t change a prediction once it’s locked in.'), el('div', { class: 'cl-actions' }, lockBtn), msg));
      return li;
    }
    if (s.type === 'run') {
      const li = stepShell(i, s.mode === 'compare' ? 'Run the experiment' : s.mode === 'target' ? 'Prove it on the slope' : 'Design and test');
      li.appendChild(el('p', null, s.objective));
      const first = s.mode === 'compare' ? s.setups[0].config : (s.mode === 'design' && r.design ? r.design : c.initialConfiguration);
      const locked = s.mode === 'compare' ? ['sidecutRadius', 'edgeAngle', 'speed', 'skierMass'] : ['sidecutRadius', 'edgeAngle', 'speed', 'skierMass'].filter(k => !(s.unlocked || []).includes(k));
      const status = el('div', { class: 'cl-run-status', role: 'status', 'aria-live': 'polite' });
      const extra = el('div', { class: 'cl-run-extra' });
      let current = null, paintCompare = () => {};
      const sim = createSimulator({ config: first, locked, compact: true, settings: { ...P.settings, mode: 'single', scale: 'fixed' }, panelTitle: s.mode === 'compare' ? 'The setups' : 'Your controls', panelExtra: extra,
        onSetting: (k, v) => { if (k === 'speedUnit' || k === 'vectors' || k === 'animSpeed') P.setSetting(k, v); },
        onEnd: () => { if (s.mode === 'compare' && current) { P.ranSetup(c.id, current.id); paintCompare(); } } });
      sims.push(sim);
      li.appendChild(sim.node);
      li.appendChild(status);
      const cont = button('Continue →', () => { cont.hidden = true; advance(i); }, 'cl-btn--primary');
      cont.hidden = true;
      const finishRun = () => { status.appendChild(verdict() || el('span')); if (rec().step <= i) cont.hidden = false; };

      if (s.mode === 'compare') {
        const table = el('div', { class: 'cl-run-table' });
        const btns = s.setups.map(su => button('▶ Run ' + su.label, () => { current = su; sim.setConfig(su.config); paintCompare(); sim.restart(); }, 'cl-btn--quiet cl-run-btn'));
        extra.append(el('div', { class: 'cl-run-btns' }, btns), table);
        paintCompare = () => {
          const ran = rec().ran || {};
          sim.setGhosts(s.setups.filter(su => ran[su.id] && su !== current).map((su, k) => ({ path: buildPathFor(su.config), label: su.label.split(' · ')[0], cls: k ? 'b' : 'a' })));
          btns.forEach((b, k) => { const su = s.setups[k]; b.textContent = (ran[su.id] ? '✓ ' : '▶ ') + (ran[su.id] ? 'Run again: ' : 'Run ') + su.label; });
          put(table, el('table', { class: 'cl-table' }, el('caption', { class: 'cl-sr' }, 'Results of each run'),
            el('thead', null, el('tr', null, el('th', { scope: 'col' }, 'Setup'), el('th', { scope: 'col' }, 'R (m)'), el('th', { scope: 'col' }, 'a (m/s²)'), el('th', { scope: 'col' }, 'F (N)'))),
            el('tbody', null, s.setups.map(su => { const x = carve(su.config), done = ran[su.id];
              return el('tr', null, el('th', { scope: 'row' }, su.label), el('td', null, done ? fmt(x.turnRadius, 2) : '?'), el('td', null, done ? fmt(x.centripetalAcceleration, 2) : '?'), el('td', null, done ? fmt(x.inwardForce, 0) : '?')); }))));
          const ev = evaluateRun(s, sim.config, ran);
          if (ev.met && !status.dataset.done) { status.dataset.done = '1'; P.compareDone(c.id); put(status, el('p', { class: 'cl-fb cl-fb--right' }, '✓ All runs done. Compare the lines on the slope and the numbers in the table.')); finishRun(); }
          else if (!ev.met) put(status, el('p', { class: 'cl-note' }, 'Numbers appear in the table once a run finishes.'));
        };
        paintCompare();
      } else {
        const check = el('ul', { class: 'cl-checklist' });
        const testBtn = button(s.mode === 'design' ? 'Submit design' : 'Test this turn', () => {
          const cfg = sim.config, ev = evaluateRun(s, cfg), res = carve(cfg);
          const detail = s.mode === 'design' ? `Rsc ${fmt(cfg.sidecutRadius, 1)}, θ ${fmt(cfg.edgeAngle, 1)}°, v ${fmt(cfg.speed, 1)}, m ${fmt(cfg.skierMass, 0)} → R ${fmt(res.turnRadius, 2)} m, F ${fmt(res.inwardForce, 0)} N` : `θ ${fmt(cfg.edgeAngle, 1)}° → R ${fmt(res.turnRadius, 2)} m`;
          P.simAttempt(c, s, cfg, ev.met, detail);
          sim.restart();
          put(check, ev.checks.map(x => el('li', { class: x.ok ? 'is-ok' : 'is-no' }, (x.ok ? '✓ ' : '✗ ') + x.label + (x.value !== undefined ? `: ${fmt(x.value, x.key === 'inwardForce' ? 0 : 2)} ${x.unit || (s.target ? 'm' : '')}` : ''))));
          if (ev.met) { testBtn.disabled = true; put(status, el('p', { class: 'cl-fb cl-fb--right' }, s.mode === 'design' ? `✓ Design accepted after ${rec().simAttempts} ${rec().simAttempts === 1 ? 'try' : 'tries'}. Many designs work: yours is one.` : `✓ ${fmt(res.turnRadius, 2)} m. Target hit in ${rec().simAttempts} ${rec().simAttempts === 1 ? 'try' : 'tries'}.`)); finishRun(); }
          else put(status, el('p', { class: 'cl-fb cl-fb--wrong' }, s.mode === 'target' ? targetNudge(s, res) : 'Not yet: fix the ✗ lines. Radius depends only on sidecut and edge angle; force on mass, speed and radius.'));
        }, 'cl-btn--primary');
        extra.append(el('div', { class: 'cl-actions' }, testBtn), check);
        if (rec().ranOk) { testBtn.disabled = true; put(status, el('p', { class: 'cl-fb cl-fb--right' }, '✓ Done.')); finishRun(); }
      }
      li.appendChild(el('div', { class: 'cl-actions' }, cont));
      return li;
    }
    if (s.type === 'ask') {
      const li = stepShell(i, 'Do the maths');
      let q, key = null;
      if (s.dynamic === 'design') {
        const d = rec().design;
        if (!d) { li.appendChild(el('p', { class: 'cl-note' }, 'Submit a design first.')); return li; }
        q = designQuestion(s, d); key = rec().designKey;
        li.appendChild(el('p', { class: 'cl-note' }, `Your design: sidecut ${fmt(d.sidecutRadius, 1)} m, edge angle ${fmt(d.edgeAngle, 1)}°, speed ${fmt(d.speed, 1)} m/s, mass ${fmt(d.skierMass, 0)} kg.`));
      } else q = { ...s.question, id: s.kind };
      const done = P.question(s.kind, key);
      li.appendChild(ask(q, { progress: P, key, onDone: () => { if (rec().step <= i) advance(i); } }));
      if (done && (done.correct || done.revealed) && rec().step <= i) advance(i);
      return li;
    }
    if (s.type === 'explain') {
      const li = stepShell(i, 'Explain it');
      const tid = 'w-' + c.id;
      const ta = el('textarea', { id: tid, class: 'cl-input cl-textarea', rows: '4', maxlength: '1500' });
      ta.value = P.writtenText(s.kind);
      const msg = el('div', { class: 'cl-fb', role: 'status', 'aria-live': 'polite' });
      const model = el('div', { class: 'cl-solution', hidden: true }, el('p', { class: 'cl-solution-h' }, 'Compare with a model answer'), el('p', null, s.model));
      const save = button('Save my explanation', () => {
        const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
        if (words < 8) { put(msg, el('p', null, 'Write a sentence or two (8+ words). Use the numbers from your experiment if you can.')); return; }
        P.written(s.kind, null, ta.value); P.explained(c.id);
        msg.className = 'cl-fb cl-fb--right'; put(msg, el('p', null, 'Saved. Compare it with the model answer below: did you mention the equation?'));
        model.hidden = false;
        if (rec().step <= i) advance(i);
      }, 'cl-btn--primary');
      li.append(el('label', { for: tid, class: 'cl-prompt' }, s.prompt), ta, el('div', { class: 'cl-actions' }, save), msg, model);
      if (rec().explained) { model.hidden = false; }
      return li;
    }
    return stepShell(i, '?');
  }

  function complete() {
    P.finish(c.id);
    const r = rec(), pts = challengePoints(c, r, P.question);
    const next = CHALLENGES.find(x => x.number === c.number + 1);
    put(doneEl, el('section', { class: 'cl-complete', 'aria-labelledby': 'done-' + c.id },
      el('p', { class: 'cl-kicker' }, 'Challenge complete'),
      el('h2', { class: 'cl-h3', id: 'done-' + c.id }, 'What just happened'),
      el('p', null, c.explanation),
      el('p', { class: 'cl-note' }, `Reasoning points: ${pts} of ${maxPoints(c)} (prediction, experiment, explanation, and each question).`),
      el('div', { class: 'cl-actions' },
        next ? el('a', { class: 'cl-btn cl-btn--primary', href: '#challenges/' + next.id }, `Next: ${next.title} →`) : el('a', { class: 'cl-btn cl-btn--primary', href: '#challenges' }, 'See your results →'),
        el('a', { class: 'cl-btn cl-btn--quiet', href: '#simulator' }, 'Back to the simulator'))));
    ctx.refreshNav();
  }

  // Draw every step reached so far.
  const upto = Math.min(rec().step, c.steps.length - 1);
  for (let i = 0; i <= upto; i++) renderStep(i);
  if (rec().done || rec().step >= c.steps.length) complete();
  else if (upto < c.steps.length - 1) stepsEl.appendChild(el('li', { class: 'cl-step cl-step--locked', 'aria-hidden': 'true' }, `${c.steps.length - upto - 1} more step${c.steps.length - upto - 1 === 1 ? '' : 's'} after this one`));
  // Keep the "more steps" placeholder last.
  const obs = new MutationObserver(() => { const ph = stepsEl.querySelector('.cl-step--locked'); if (!ph) return; const left = c.steps.length - stepsEl.querySelectorAll('.cl-step:not(.cl-step--locked)').length; if (left <= 0) ph.remove(); else { ph.textContent = `${left} more step${left === 1 ? '' : 's'} to go`; if (ph !== stepsEl.lastChild) stepsEl.appendChild(ph); } });
  obs.observe(stepsEl, { childList: true });
  ctx.cleanup(() => obs.disconnect());
  return page;
}

function targetNudge(s, res) {
  const diff = res.turnRadius - s.target.value;
  return `R = ${fmt(res.turnRadius, 2)} m: ${fmt(Math.abs(diff), 2)} m too ${diff > 0 ? 'wide. Tip the ski further (a bigger edge angle makes cos θ smaller)' : 'tight. Tip the ski less'}. Better still: use the angle you calculated.`;
}
