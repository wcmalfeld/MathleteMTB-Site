// Jump Trajectory Lab: progress. Works with no account: kept in this browser
// (localStorage) by default. A host page passes callbacks (onAttempt,
// onProgress, onComplete) to save it elsewhere; main.js sends attempts to the
// student's Mathlete account that way.

import { MISSIONS } from './problems.js';

const VERSION = 1;
export const MODULES = ['a', 'b', 'c', 'd', 'e'];
export const SECTIONS = ['overview', 'explore', 'learn', 'decoder', 'challenges'];

function blank(now) {
  return { version: VERSION, startedAt: now, updatedAt: now, completedAt: null, activeMs: 0,
    visited: {}, hook: null, modules: {}, decoder: {}, questions: {}, missions: {}, explored: {}, written: {} };
}
function makeStorage(kind) {
  if (kind && typeof kind === 'object' && typeof kind.load === 'function') return kind;
  if (kind === 'memory') { const mem = {}; return { load: k => mem[k] || null, save: (k, v) => { mem[k] = JSON.parse(JSON.stringify(v)); } }; }
  return {
    load(k) { try { const s = window.localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    save(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* keep going in memory */ } },
    remove(k) { try { window.localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
}

// Points for one mission: solved with no hints on every step's first try = 3;
// solved with hints or retries = 2; finished by viewing a solution = 0.
export function missionPoints(rec) {
  if (!rec || !rec.done) return 0;
  if (rec.revealed) return 0;
  return rec.independent ? 3 : 2;
}

export function createProgress(opts = {}) {
  const now = opts.now || (() => new Date().toISOString());
  const clock = opts.clock || (() => Date.now());
  const key = 'mathlete-jump-trajectory-lab:v' + VERSION + ':' + (opts.studentId || 'guest');
  const store = makeStorage(opts.storage);
  const call = (fn, arg) => { try { if (typeof fn === 'function') fn(arg); } catch (e) { if (typeof console !== 'undefined') console.warn('[jump-lab] callback failed', e); } };
  let state = store.load(key);
  if (!state || state.version !== VERSION) state = blank(now());
  const listeners = [];
  let lastActive = null;

  // Time spent: count the gaps between interactions, ignoring gaps over 2
  // minutes (a tab left open adds nothing).
  function touch() {
    const t = clock();
    if (lastActive !== null) { const gap = t - lastActive; if (gap > 0 && gap < 120000) state.activeMs += gap; }
    lastActive = t;
  }
  function save() {
    state.updatedAt = now();
    store.save(key, state);
    const s = summary();
    if (!state.completedAt && s.complete) { state.completedAt = now(); store.save(key, state); s.completedAt = state.completedAt; call(opts.onComplete, s); }
    call(opts.onProgress, s);
    listeners.forEach(l => l(s));
  }
  const qkey = (id, k) => id + (k ? '@' + k : '');
  function q(id, k) {
    const kk = qkey(id, k);
    return state.questions[kk] || (state.questions[kk] = { id, key: k || null, attempts: 0, correct: false, firstTry: null, hints: 0, revealed: false, answers: [], codes: [] });
  }

  // One attempt at a question (or a mission step). meta: { skills, prompt, correctAnswer, code }
  function attempt(id, k, answer, correct, meta = {}) {
    touch();
    const r = q(id, k);
    if (r.correct || r.revealed) return r;
    r.attempts += 1;
    if (r.attempts === 1) r.firstTry = !!correct;
    if (correct) r.correct = true;
    if (meta.code && meta.code !== 'correct' && meta.code !== 'wrong') r.codes.push(meta.code);
    r.answers.push({ answer: String(answer), correct: !!correct, code: meta.code || null, at: now() });
    call(opts.onAttempt, { studentId: opts.studentId || null, module: 'jump-trajectory-lab', questionId: id, key: k || null, skills: meta.skills || [],
      prompt: meta.prompt || '', answer: String(answer), correctAnswer: meta.correctAnswer || '', correct: !!correct, attempt: r.attempts,
      hintsUsed: r.hints, misconception: meta.code && !['correct', 'wrong'].includes(meta.code) ? meta.code : null, at: now() });
    save();
    return r;
  }

  function summary() {
    const ms = MISSIONS.map(m => ({ ...m, rec: state.missions[m.id] || null, points: missionPoints(state.missions[m.id]) }));
    const qs = Object.values(state.questions);
    const tally = { attempted: qs.filter(x => x.attempts || x.revealed).length, correct: qs.filter(x => x.correct).length,
      firstTry: qs.filter(x => x.firstTry === true).length, revealed: qs.filter(x => x.revealed).length,
      hints: qs.reduce((n, x) => n + x.hints, 0), wrongAnswers: qs.reduce((n, x) => n + x.answers.filter(a => !a.correct).length, 0) };
    const codes = {};
    qs.forEach(x => x.codes.forEach(c => { codes[c] = (codes[c] || 0) + 1; }));
    const done = ms.filter(m => m.rec && m.rec.done).length;
    return {
      module: 'jump-trajectory-lab', studentId: opts.studentId || null, startedAt: state.startedAt, updatedAt: state.updatedAt, completedAt: state.completedAt,
      minutes: Math.round(state.activeMs / 60000), visited: { ...state.visited },
      hook: state.hook, modules: { done: MODULES.filter(m => state.modules[m]).length, total: MODULES.length },
      missions: ms, missionsDone: done, score: ms.reduce((n, m) => n + m.points, 0), maxScore: MISSIONS.length * 3,
      ...tally, misconceptions: codes,
      // Finished = all six missions finished (solved, or solution viewed).
      complete: done === MISSIONS.length
    };
  }

  return {
    key,
    get state() { return state; },
    summary,
    question: (id, k) => state.questions[qkey(id, k)] || null,
    attempt,
    hint(id, k) { touch(); const r = q(id, k); if (!r.correct && !r.revealed) { r.hints += 1; save(); } return r.hints; },
    reveal(id, k) { touch(); const r = q(id, k); if (!r.correct) { r.revealed = true; if (r.firstTry === null) r.firstTry = false; save(); } },
    visit(s) { touch(); if (!state.visited[s]) { state.visited[s] = now(); save(); } },
    hook(choice, correct) { touch(); if (!state.hook) { state.hook = { choice, correct, at: now() }; save(); } },
    moduleDone(m) { touch(); if (!state.modules[m]) { state.modules[m] = now(); save(); } },
    decoderDone(id) { touch(); if (!state.decoder[id]) { state.decoder[id] = now(); save(); } },
    // Written explanations are kept, not graded.
    written(id, k, text) { touch(); (state.written = state.written || {})[id + (k ? '@' + k : '')] = { text: String(text).slice(0, 2000), at: now() }; save(); },
    explored(what) { touch(); if (!state.explored[what]) { state.explored[what] = now(); save(); } },
    // A mission is unlocked when it's the first, or the one before it is finished.
    unlocked(n) { return n === 1 || !!(state.missions['m' + (n - 1)] && state.missions['m' + (n - 1)].done); },
    missionState: id => state.missions[id] || null,
    // Record a finished mission run. Keeps the best points across replays.
    finishMission(id, run) {
      touch();
      const prev = state.missions[id];
      const rec = { done: true, revealed: !!run.revealed, independent: !!run.independent && !run.revealed, partial: run.partial || null, key: run.key, at: now(), replays: (prev ? prev.replays : 0) };
      const best = prev && missionPoints(prev) >= missionPoints(rec) ? prev : rec;
      state.missions[id] = { ...best, replays: rec.replays, last: { revealed: rec.revealed, independent: rec.independent, partial: rec.partial, key: rec.key, at: rec.at } };
      save();
    },
    replay(id) { const r = state.missions[id]; if (r) { r.replays = (r.replays || 0) + 1; save(); } return r ? r.replays : 0; },
    reset() { state = blank(now()); if (store.remove) store.remove(key); save(); },
    onChange(fn) { listeners.push(fn); }
  };
}
