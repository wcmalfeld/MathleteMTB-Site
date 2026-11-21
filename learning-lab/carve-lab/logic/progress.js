// Carve Lab: progress, settings and saved setups. Works with no account:
// kept in this browser (localStorage) by default. A host page passes
// callbacks (onAttempt, onProgress, onComplete) to save it elsewhere; the
// lab's own page (main.js) sends attempts to the student's Mathlete account.
//
// Tracked (PRD 8 "Challenge Progression" and 10): completed challenges,
// accuracy, attempts, hints, prediction accuracy, concepts mastered, time
// spent, simulator configurations (last used, saved, compared).

import { CHALLENGES, CONCEPTS } from './challenges.js';
import { normalizeConfig, DEFAULTS } from './physics.js';

const VERSION = 1;
export const SECTIONS = ['simulator', 'challenges', 'model'];
export const MAX_SAVED = 12;

function blank(now) {
  return { version: VERSION, startedAt: now, updatedAt: now, completedAt: null, activeMs: 0,
    visited: {}, explored: {}, config: { ...DEFAULTS },
    settings: { speedUnit: 'kmh', vectors: { velocity: true, acceleration: true, force: true }, mode: 'single', animSpeed: 1, scale: 'fixed', analysisOpen: true },
    saved: [], compare: { A: null, B: null },
    challenges: {}, questions: {}, written: {} };
}
function makeStorage(kind) {
  if (kind && typeof kind === 'object' && typeof kind.load === 'function') return kind;
  if (kind === 'memory') { const mem = {}; return { load: k => (mem[k] ? JSON.parse(mem[k]) : null), save: (k, v) => { mem[k] = JSON.stringify(v); }, remove: k => { delete mem[k]; } }; }
  return {
    load(k) { try { const s = window.localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    save(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* keep going in memory */ } },
    remove(k) { try { window.localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
}

// Points reward reasoning, not just right answers (PRD 8): making a
// prediction, running the experiment, each question (2 first try with no
// hints, 1 otherwise, 0 if the solution was shown), and writing an explanation.
export function challengePoints(ch, rec, question) {
  if (!rec) return 0;
  let pts = 0;
  if (rec.predicted) pts += 1;
  if (rec.ranOk) pts += 1;
  if (rec.explained) pts += 1;
  for (const s of ch.steps) if (s.type === 'ask') {
    const q = question(s.kind, s.dynamic ? rec.designKey : null);
    if (q && q.correct) pts += (q.firstTry && !q.hints) ? 2 : 1;
  }
  return pts;
}
export const maxPoints = ch => 3 + ch.steps.filter(s => s.type === 'ask').length * 2;

export function createProgress(opts = {}) {
  const now = opts.now || (() => new Date().toISOString());
  const clock = opts.clock || (() => Date.now());
  const key = 'mathlete-carve-lab:v' + VERSION + ':' + (opts.studentId || 'guest');
  const store = makeStorage(opts.storage);
  const call = (fn, arg) => { try { if (typeof fn === 'function') fn(arg); } catch (e) { if (typeof console !== 'undefined') console.warn('[carve-lab] callback failed', e); } };
  let state = store.load(key);
  if (!state || state.version !== VERSION) state = blank(now());
  // Older saves may lack newer fields.
  const fresh = blank(now());
  for (const k of Object.keys(fresh)) if (state[k] === undefined) state[k] = fresh[k];
  state.settings = { ...fresh.settings, ...state.settings, vectors: { ...fresh.settings.vectors, ...(state.settings || {}).vectors } };
  state.config = normalizeConfig(state.config);
  const listeners = [];
  let lastActive = null, saveTimer = null;

  // Time spent: the gaps between interactions, ignoring gaps over 2 minutes.
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
  // Slider drags change the config many times a second: save those lazily.
  function saveSoon() { if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveTimer = null; store.save(key, state); }, 400); }

  const qkey = (id, k) => id + (k ? '@' + k : '');
  function q(id, k) {
    const kk = qkey(id, k);
    return state.questions[kk] || (state.questions[kk] = { id, key: k || null, attempts: 0, correct: false, firstTry: null, hints: 0, revealed: false, answers: [], codes: [] });
  }
  const ch = id => state.challenges[id] || (state.challenges[id] = { step: 0, predicted: null, ran: {}, ranOk: false, simAttempts: 0, design: null, designKey: null, explained: false, done: false, startedAt: now() });

  function emit(id, k, answer, correct, meta, attemptNo, hints) {
    call(opts.onAttempt, { studentId: opts.studentId || null, module: 'carve-lab', questionId: id, key: k || null, skills: meta.skills || [],
      prompt: meta.prompt || '', answer: String(answer), correctAnswer: meta.correctAnswer || '', correct: !!correct, attempt: attemptNo,
      hintsUsed: hints || 0, misconception: meta.code && !['correct', 'wrong'].includes(meta.code) ? meta.code : null, at: now() });
  }

  // One attempt at a question. meta: { skills, prompt, correctAnswer, code }
  function attempt(id, k, answer, correct, meta = {}) {
    touch();
    const r = q(id, k);
    if (r.correct || r.revealed) return r;
    r.attempts += 1;
    if (r.attempts === 1) r.firstTry = !!correct;
    if (correct) r.correct = true;
    if (meta.code && meta.code !== 'correct' && meta.code !== 'wrong') r.codes.push(meta.code);
    r.answers.push({ answer: String(answer).slice(0, 200), correct: !!correct, code: meta.code || null, at: now() });
    emit(id, k, answer, correct, meta, r.attempts, r.hints);
    save();
    return r;
  }

  function summary() {
    const qs = Object.values(state.questions);
    const preds = CHALLENGES.map(c => (state.challenges[c.id] || {}).predicted).filter(Boolean);
    const asked = qs.filter(x => !/-predict$/.test(x.id) && (x.attempts || x.revealed));
    const done = CHALLENGES.filter(c => (state.challenges[c.id] || {}).done);
    const question = (id, k) => state.questions[qkey(id, k)] || null;
    const concepts = Object.keys(CONCEPTS).filter(con => {
      const cs = CHALLENGES.filter(c => c.concepts.includes(con));
      return cs.length && cs.every(c => {
        const rec = state.challenges[c.id];
        if (!rec || !rec.done) return false;
        return c.steps.filter(s => s.type === 'ask').every(s => { const x = question(s.kind, s.dynamic ? rec.designKey : null); return x && x.correct && !x.revealed; });
      });
    });
    const points = CHALLENGES.reduce((n, c) => n + challengePoints(c, state.challenges[c.id], question), 0);
    return {
      module: 'carve-lab', studentId: opts.studentId || null, startedAt: state.startedAt, updatedAt: state.updatedAt, completedAt: state.completedAt,
      minutes: Math.round(state.activeMs / 60000),
      challengesDone: done.length, challengesTotal: CHALLENGES.length, done: done.map(c => c.id),
      predictions: { made: preds.length, correct: preds.filter(p => p.correct).length },
      questions: { attempted: asked.length, correct: asked.filter(x => x.correct).length, firstTry: asked.filter(x => x.firstTry === true).length,
        revealed: asked.filter(x => x.revealed).length, attempts: asked.reduce((n, x) => n + x.attempts, 0) },
      hints: qs.reduce((n, x) => n + x.hints, 0),
      simAttempts: CHALLENGES.reduce((n, c) => n + ((state.challenges[c.id] || {}).simAttempts || 0), 0),
      concepts, points, maxPoints: CHALLENGES.reduce((n, c) => n + maxPoints(c), 0),
      saved: state.saved.length,
      complete: done.length === CHALLENGES.length
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
    written(id, k, text) { touch(); state.written[qkey(id, k)] = { text: String(text).slice(0, 2000), at: now() }; save(); },
    writtenText: (id, k) => (state.written[qkey(id, k)] || {}).text || '',
    visit(s) { touch(); if (!state.visited[s]) { state.visited[s] = now(); save(); } },
    explored(what) { touch(); if (!state.explored[what]) { state.explored[what] = now(); save(); } },

    // The simulator's current configuration and settings (kept between visits).
    get config() { return { ...state.config }; },
    setConfig(c) { touch(); state.config = normalizeConfig(c); saveSoon(); },
    get settings() { return state.settings; },
    setSetting(k, v) { touch(); state.settings[k] = v; saveSoon(); },

    // Saved simulations (PRD 10: save an interesting setup and revisit it).
    saveSetup(name, config) {
      touch();
      const item = { id: 's' + clock().toString(36) + Math.floor(Math.random() * 1e4).toString(36), name: String(name || 'My setup').trim().slice(0, 40) || 'My setup', config: normalizeConfig(config), at: now() };
      state.saved = [item].concat(state.saved).slice(0, MAX_SAVED);
      save();
      return item;
    },
    removeSetup(id) { state.saved = state.saved.filter(s => s.id !== id); save(); },
    setCompare(slot, config) { touch(); if (slot === 'A' || slot === 'B') { state.compare[slot] = config ? normalizeConfig(config) : null; save(); } },

    // Challenges.
    challenge: id => state.challenges[id] || null,
    setStep(id, n) { const r = ch(id); if (n > r.step) { r.step = n; save(); } },
    predict(c, step, choice, correct) {
      touch();
      const r = ch(c.id);
      if (r.predicted) return r;
      r.predicted = { choice, correct: !!correct, at: now() };
      const op = step.question.options.find(o => o.id === choice) || {};
      const answer = (step.question.options.find(o => o.correct) || {}).text || '';
      const qr = q(step.kind, null);
      qr.attempts = 1; qr.firstTry = !!correct; qr.correct = !!correct;
      if (op.code) qr.codes.push(op.code);
      qr.answers.push({ answer: op.text || choice, correct: !!correct, code: op.code || null, at: now() });
      emit(step.kind, null, op.text || choice, correct, { prompt: step.question.prompt, correctAnswer: answer, code: op.code || (correct ? 'correct' : 'wrong') }, 1, 0);
      save();
      return r;
    },
    ranSetup(cid, setupId) { touch(); const r = ch(cid); if (!r.ran[setupId]) { r.ran[setupId] = now(); save(); } },
    // A graded simulator run (target or design): counts attempts, sends the result.
    simAttempt(c, step, config, met, detail) {
      touch();
      const r = ch(c.id);
      if (r.ranOk) return r;
      r.simAttempts += 1;
      const sq = q(step.kind, null);
      sq.attempts += 1; if (sq.attempts === 1) sq.firstTry = !!met; if (met) sq.correct = true;
      sq.answers.push({ answer: detail, correct: !!met, code: null, at: now() });
      emit(step.kind, null, detail, met, { prompt: step.objective, correctAnswer: step.target ? step.target.label : (step.constraints || []).map(x => x.label).join('; ') }, sq.attempts, 0);
      if (met) { r.ranOk = true; if (step.mode === 'design') { r.design = normalizeConfig(config); r.designKey = designKey(r.design); } }
      save();
      return r;
    },
    compareDone(cid) { const r = ch(cid); if (!r.ranOk) { r.ranOk = true; save(); } },
    explained(cid) { const r = ch(cid); if (!r.explained) { r.explained = true; save(); } },
    finish(cid) { touch(); const r = ch(cid); if (!r.done) { r.done = true; r.doneAt = now(); save(); } },
    retry(cid) {
      // Start a challenge again. Earlier answers stay counted (they're history);
      // the run and the design can be redone.
      const r = ch(cid); r.step = 0; r.ran = {}; r.replays = (r.replays || 0) + 1; save();
    },
    reset() { state = blank(now()); if (store.remove) store.remove(key); save(); },
    onChange(fn) { listeners.push(fn); }
  };
}

export const designKey = c => [c.sidecutRadius, c.edgeAngle, c.speed, c.skierMass].map(x => Number(x).toFixed(1)).join('-');
