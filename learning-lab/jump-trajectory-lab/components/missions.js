// Challenges: six missions for the virtual jump-design team. They unlock in
// order, can be revisited, and replayed with new numbers. Scoring rewards
// solving it yourself: 3 points with no hints on any first try, 2 with help,
// 0 when the solution was shown (the next mission still unlocks).
import { el, clear, button } from './dom.js';
import { createGraph } from './graph.js';
import { createSimulator } from './explore.js';
import { ask } from './ask.js';
import { MISSIONS, buildMission } from '../logic/problems.js';
import { missionPoints } from '../logic/progress.js';
import { dec, fstr } from '../logic/quadratic.js';

const stars = pts => '★'.repeat(pts) + '☆'.repeat(3 - pts);

export function renderChallenges(ctx, which) {
  const P = ctx.progress, s = P.summary();
  const page = el('div', { class: 'jl-missions' });
  page.appendChild(el('header', { class: 'jl-section-head' }, el('p', { class: 'jl-kicker' }, 'Challenges'), el('h2', { class: 'jl-h2' }, 'Jump design missions'),
    el('p', { class: 'jl-lede' }, 'You’re on the virtual jump-design team. Each mission unlocks the next. Solving one on your own earns the most points.'),
    el('p', { class: 'jl-score' }, `Score: ${s.score} / ${s.maxScore}`, el('span', { class: 'jl-note' }, ' · 3 points: solved yourself, first try, no hints · 2 points: solved with help · 0 points: solution shown'))));

  const list = el('ol', { class: 'jl-mission-list' }, MISSIONS.map(mi => {
    const rec = P.missionState(mi.id), open = P.unlocked(mi.n), pts = missionPoints(rec);
    const status = rec && rec.done ? (rec.revealed && !pts ? 'Solution viewed' : 'Done') : open ? 'Open' : 'Locked';
    const inner = [el('span', { class: 'jl-mission-n' }, 'Mission ' + mi.n), el('span', { class: 'jl-mission-title' }, mi.title), el('span', { class: 'jl-mission-meta' }, mi.level + ' · ' + status),
      rec && rec.done ? el('span', { class: 'jl-stars', 'aria-label': `${pts} of 3 points` }, stars(pts)) : null];
    return el('li', null, open ? el('a', { href: '#challenges/' + mi.n, class: 'jl-mission' + (String(mi.n) === String(which) ? ' is-current' : '') + (rec && rec.done ? ' is-done' : ''), 'aria-current': String(mi.n) === String(which) ? 'step' : null }, inner)
      : el('div', { class: 'jl-mission is-locked', 'aria-disabled': 'true' }, inner, el('span', { class: 'jl-sr' }, ' (finish the previous mission to unlock)')));
  }));
  page.appendChild(list);

  const n = Number(which);
  if (n >= 1 && n <= 6) {
    if (!P.unlocked(n)) page.appendChild(el('div', { class: 'jl-callout' }, el('p', null, `Mission ${n} unlocks when you finish mission ${n - 1}.`)));
    else page.appendChild(runMission(ctx, n));
  } else {
    const next = MISSIONS.find(mi => P.unlocked(mi.n) && !(P.missionState(mi.id) || {}).done);
    page.appendChild(next ? el('p', null, el('a', { class: 'jl-btn jl-btn--primary', href: '#challenges/' + next.n }, `Start mission ${next.n}: ${next.title} →`))
      : summaryCard(ctx));
  }
  return page;
}

function runMission(ctx, n) {
  const P = ctx.progress, meta = MISSIONS[n - 1];
  const rec = P.missionState(meta.id);
  const replay = rec ? (rec.replays || 0) : 0;
  const mis = buildMission(n, replay);
  const box = el('section', { class: 'jl-mission-run', 'aria-labelledby': 'mis-title' },
    el('p', { class: 'jl-kicker' }, `Mission ${n} · ${meta.level}${replay ? ` · replay ${replay}` : ''}`),
    el('h2', { class: 'jl-h2', id: 'mis-title' }, meta.title));
  if (mis.brief) box.appendChild(el('div', { class: 'jl-brief' }, el('p', { class: 'jl-mini' }, 'Design brief'), el('p', null, mis.brief),
    el('p', { class: 'jl-note' }, 'A mathematical modeling exercise on a virtual jump, not advice for building or riding a real one.')));
  if (mis.clues) box.appendChild(el('div', { class: 'jl-brief' }, el('p', { class: 'jl-mini' }, 'Clues'), el('ul', { class: 'jl-points' }, mis.clues.map(c => el('li', null, c)))));

  // The picture for this mission (missions 1–3 and 5 show the target jump).
  if (n !== 4 && n !== 6) {
    const step0 = mis.steps[0];
    const g = createGraph({ model: mis.model, range: 'fit', show: step0.graph && step0.graph.hideLabels ? { labels: false } : { zeros: n === 3, vertex: false } });
    box.appendChild(el('div', { class: 'jl-mission-graph' }, g.node, n === 3 ? el('p', { class: 'jl-note' }, 'The target jump. Each grid square is 1 m by 1 m.') : null));
  }

  const results = [];
  const steps = el('div', { class: 'jl-steps' });
  box.appendChild(steps);
  const after = el('div');
  box.appendChild(after);

  function finish() {
    const revealed = results.some(r => r.revealed);
    const independent = results.every(r => r.independent);
    const partial = n === 5 ? results.filter(r => r.correct).length + '/3 forms solved' : null;
    P.finishMission(meta.id, { revealed, independent, key: mis.key, partial });
    ctx.refreshNav();
    const pts = missionPoints({ done: true, revealed, independent });
    clear(after);
    const next = MISSIONS[n];
    after.appendChild(el('div', { class: 'jl-fb jl-fb--' + (pts === 3 ? 'right' : 'info') },
      el('p', null, el('b', null, `Mission ${n} complete. `), pts === 3 ? 'Solved on your own: 3 points.' : pts === 2 ? 'Solved with some help: 2 points. Replay it with new numbers to try for 3.' : 'You saw the solution: 0 points this time. Replay it with new numbers when you’re ready.'),
      partial ? el('p', null, `Reverse-engineering credit: ${partial}.`) : null,
      el('div', { class: 'jl-row' },
        next ? el('a', { class: 'jl-btn jl-btn--primary', href: '#challenges/' + next.n }, `Mission ${next.n}: ${next.title} →`) : el('a', { class: 'jl-btn jl-btn--primary', href: '#challenges' }, 'See your results →'),
        button('Replay with new numbers', () => { P.replay(meta.id); ctx.rerender(); }, 'jl-btn--quiet'))));
  }

  function showStep(i) {
    const st = mis.steps[i];
    if (!st) { finish(); return; }
    const wrap = el('div', { class: 'jl-step' });
    if (st.type === 'build') wrap.appendChild(buildStep(ctx, st, mis, r => { results.push(r); showStep(i + 1); }));
    else wrap.appendChild(ask(st, { progress: P, key: mis.key, model: mis.model, kicker: `Step ${i + 1} of ${mis.steps.length}`, onDone: r => { results.push(r); showStep(i + 1); } }));
    steps.appendChild(wrap);
  }
  // Coming back to a mission whose steps are already answered: replay them silently.
  let i = 0;
  while (i < mis.steps.length) {
    const st = mis.steps[i], q = P.question(st.id, mis.key);
    const doneBefore = st.type === 'written' ? !!(P.state.written || {})[st.id + '@' + mis.key] : q && (q.correct || q.revealed);
    if (!doneBefore) break;
    results.push({ correct: !!(q && q.correct) || st.type === 'written', revealed: !!(q && q.revealed), independent: st.type === 'written' || !!(q && q.correct && q.attempts === 1 && !q.hints) });
    const wrap = el('div', { class: 'jl-step' });
    if (st.type === 'build') wrap.appendChild(el('p', { class: 'jl-fb jl-fb--right' }, '✓ ' + st.prompt));
    else wrap.appendChild(ask(st, { progress: P, key: mis.key, model: mis.model, kicker: `Step ${i + 1} of ${mis.steps.length}` }));
    steps.appendChild(wrap);
    i++;
  }
  if (i < mis.steps.length) showStep(i);
  else if (rec && rec.done && rec.last && rec.last.key === mis.key) {
    after.appendChild(el('div', { class: 'jl-fb jl-fb--info' }, el('p', null, 'You’ve finished this mission. '),
      el('div', { class: 'jl-row' }, button('Replay with new numbers', () => { P.replay(meta.id); ctx.rerender(); }, 'jl-btn--primary'))));
  } else finish();
  return box;
}

// Mission 4: change the jump with the real controls, then check the requirement.
function buildStep(ctx, st, mis, onDone) {
  const P = ctx.progress, base = st.base;
  const box = el('div', { class: 'jl-ask', 'data-q': st.id });
  box.appendChild(el('p', { class: 'jl-kicker' }, 'Step 1 of 2'));
  box.appendChild(el('p', { class: 'jl-prompt' }, st.prompt));
  const sim = createSimulator(ctx, { compact: true, L: base.L, H: base.H });
  box.appendChild(sim.node);
  const fb = el('div', { class: 'jl-fb', 'aria-live': 'polite' });
  const hints = el('ol', { class: 'jl-hints' });
  let tries = 0, hintN = 0;
  const hintBtn = button('Get a hint', () => { P.hint(st.id, mis.key); hintN++; clear(hints); st.hints.slice(0, hintN).forEach((h, k) => hints.appendChild(el('li', null, el('b', null, `Hint ${k + 1}: `), h))); hintBtn.disabled = hintN >= st.hints.length; showBtn.hidden = !(tries >= 2 || hintN >= st.hints.length); }, 'jl-btn--quiet');
  const showBtn = button('Show the solution', () => { P.reveal(st.id, mis.key); clear(fb); fb.className = 'jl-fb jl-fb--info'; fb.appendChild(el('p', null, st.solution)); done(false, true); }, 'jl-btn--quiet');
  showBtn.hidden = true;
  const checkBtn = button('Check my jump', () => {
    const m = sim.model, keptL = m.L === base.L, higher = m.H > base.H, ok = keptL && higher;
    tries++;
    const code = ok ? 'correct' : !keptL ? 'width-for-height' : 'wrong';
    P.attempt(st.id, mis.key, `L = ${m.L}, H = ${m.H}`, ok, { code, skills: st.skills, prompt: st.prompt, correctAnswer: `L = ${base.L}, H > ${base.H}` });
    clear(fb);
    if (ok) { fb.className = 'jl-fb jl-fb--right'; fb.appendChild(el('p', null, `Yes: still ${dec(m.L)} m long, now ${dec(m.H)} m high. a went from ${fstr(mis.model.a)} to ${fstr(m.a)}.`)); done(true, false); return; }
    fb.className = 'jl-fb jl-fb--wrong';
    fb.appendChild(el('p', null, !keptL ? `The jump distance changed (${dec(m.L)} m, was ${dec(base.L)} m). The requirement is to keep it the same: move only the height.` : `The height is ${dec(m.H)} m. It needs to be more than ${dec(base.H)} m.`));
    showBtn.hidden = !(tries >= 2 || hintN >= st.hints.length);
  }, 'jl-btn--primary');
  function done(right, revealed) {
    checkBtn.hidden = hintBtn.hidden = showBtn.hidden = true; sim.stop();
    const r = P.question(st.id, mis.key) || {};
    onDone({ correct: right, revealed, independent: right && r.attempts === 1 && !r.hints });
  }
  box.appendChild(el('div', { class: 'jl-actions' }, checkBtn, hintBtn, showBtn));
  box.appendChild(hints); box.appendChild(fb);
  return box;
}

function summaryCard(ctx) {
  const s = ctx.progress.summary();
  const codes = Object.entries(s.misconceptions).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return el('section', { class: 'jl-callout jl-summary', 'aria-labelledby': 'sum-title' },
    el('h2', { class: 'jl-h3', id: 'sum-title' }, s.complete ? 'All six missions finished' : 'Your results so far'),
    el('p', null, `Score ${s.score} of ${s.maxScore}. ${s.correct} questions right (${s.firstTry} on the first try), ${s.hints} hints used, about ${s.minutes} minutes of work.`),
    codes.length ? el('p', null, 'Worth another look: ', codes.map(([c]) => ctx.MISCONCEPTIONS[c] || c).join('; '), '.') : null,
    el('p', { class: 'jl-note' }, 'This is practice in one session, not a grade. Replay missions with new numbers to see if it sticks.'),
    el('p', null, el('a', { class: 'jl-btn jl-btn--quiet', href: '#explore' }, 'Free exploration mode →')));
}
