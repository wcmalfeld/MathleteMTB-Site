// Newton's Laws lesson: progress. Works with no account: kept in this
// browser (localStorage) by default, so a student can leave and come back.
// A host page passes callbacks (onAttempt, onProgress, onComplete); the
// lesson's own page (main.js) sends attempts to the student's account.
//
// Tracked (PRD 13): sections visited and completed, every question's
// attempts, hints, first-try result and answer, free-body diagram results,
// Force Lab setups and saved experiments, written working and explanations,
// the knowledge check (each retake is a new round), the final challenge,
// time spent, and mastery against the PRD's criteria.

import { SECTIONS, CHECK_IDS, QUESTIONS } from './lesson.js';
import { DEFAULTS, normalizeConfig } from './physics.js';

const VERSION = 1;
export const MAX_SAVED = 8;
export const MASTERY_CHECK = 0.8;   // PRD 13: at least 80% on the knowledge check

function blank(now) {
  return { version: VERSION, startedAt: now, updatedAt: now, completedAt: null, activeMs: 0, level: 'apply',
    visited: {}, questions: {}, written: {}, round: 1, lab: { config: { ...DEFAULTS }, saved: [] } };
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
const qk = (id, key) => id + (key ? '|' + key : '');

export function createProgress(opts = {}) {
  const now = opts.now || (() => new Date().toISOString());
  const clock = opts.clock || (() => Date.now());
  const storeKey = 'mathlete-newtons-laws:v' + VERSION + ':' + (opts.studentId || 'guest');
  const store = makeStorage(opts.storage);
  const call = (fn, arg) => { try { if (typeof fn === 'function') fn(arg); } catch (e) { if (typeof console !== 'undefined') console.warn('[newtons-laws] callback failed', e); } };
  let state = store.load(storeKey);
  if (!state || state.version !== VERSION) state = blank(now());
  const fresh = blank(now());
  for (const k of Object.keys(fresh)) if (state[k] === undefined) state[k] = fresh[k];
  state.lab = { ...fresh.lab, ...state.lab, config: normalizeConfig((state.lab || {}).config) };
  const listeners = [];
  let lastActive = null;

  // Time spent: gaps between interactions, ignoring gaps over 2 minutes.
  function touch() {
    const t = clock();
    if (lastActive !== null) { const gap = t - lastActive; if (gap > 0 && gap < 120000) state.activeMs += gap; }
    lastActive = t;
  }
  function save() {
    state.updatedAt = now();
    const s = summary();
    if (!state.completedAt && s.complete) { state.completedAt = now(); s.completedAt = state.completedAt; store.save(storeKey, state); call(opts.onComplete, s); }
    store.save(storeKey, state);
    call(opts.onProgress, s);
    listeners.forEach(l => l(s));
  }

  const question = (id, key) => state.questions[qk(id, key)] || null;
  const rec = (id, key) => (state.questions[qk(id, key)] = state.questions[qk(id, key)] || { attempts: 0, hints: 0, correct: false, revealed: false, firstTry: null });
  const done = (id, key) => { const r = question(id, key); return !!(r && (r.correct || r.revealed)); };
  const earned = (id, key) => { const r = question(id, key); return !!(r && r.correct && !r.revealed); };
  const checkKey = round => 'r' + (round || state.round);

  function attempt(id, key, answer, correct, meta = {}) {
    touch();
    const r = rec(id, key);
    if (r.correct || r.revealed) return r;
    r.attempts += 1;
    if (r.firstTry === null) r.firstTry = !!correct;
    r.correct = !!correct; r.answer = answer; r.code = meta.code || null; r.at = now();
    call(opts.onAttempt, { questionId: id, key: key ? qk(id, key) : null, prompt: meta.prompt || (QUESTIONS[id] || {}).prompt || id,
      answer, correctAnswer: meta.correctAnswer || '', correct: !!correct, hintsUsed: r.hints, attempt: r.attempts, code: r.code });
    save();
    return r;
  }
  function hint(id, key) { touch(); rec(id, key).hints += 1; save(); }
  function reveal(id, key) { touch(); rec(id, key).revealed = true; save(); }

  // Sections: a section is complete once every graded item in it is answered
  // (right, or the solution read). The check uses the current round.
  function sectionState(id) {
    const s = SECTIONS.find(x => x.id === id);
    const keyFor = q => (CHECK_IDS.includes(q) ? checkKey() : null);
    // In the knowledge check, answering counts (the score is first tries);
    // elsewhere an item is done once it's right or its solution was read.
    const n = s.graded.filter(q => CHECK_IDS.includes(q) ? (r => r && (r.attempts > 0 || r.revealed))(question(q, keyFor(q))) : done(q, keyFor(q))).length;
    return { answered: n, total: s.graded.length, complete: n === s.graded.length, visited: !!state.visited[id] };
  }

  function checkScore(round) {
    const key = checkKey(round);
    const right = CHECK_IDS.filter(id => { const r = question(id, key); return r && r.correct && r.attempts === 1 && !r.revealed; }).length;
    const answered = CHECK_IDS.filter(id => { const r = question(id, key); return r && (r.attempts > 0 || r.revealed); }).length;
    return { right, answered, total: CHECK_IDS.length, round: round || state.round };
  }
  function bestCheck() {
    let best = null;
    for (let r = 1; r <= state.round; r++) { const s = checkScore(r); if (s.answered === s.total && (!best || s.right > best.right)) best = s; }
    return best;
  }

  // PRD 13's mastery criteria, each with where to go back to if it isn't met.
  function mastery() {
    const best = bestCheck();
    const fbdIds = ['fbd-flat', 'fbd-climb', 'fbd-brake', 'fbd-downhill'];
    const scen = { 'fbd-flat': 'flat-steady', 'fbd-climb': 'climb', 'fbd-brake': 'brake', 'fbd-downhill': 'downhill' };
    const pairs = ['pair-tire', 'pair-landing', 'lab-pair'].some(id => earned(id)) || Array.from({ length: state.round }, (_, i) => i + 1).some(r => earned('kc-5', checkKey(r)));
    const criteria = [
      { id: 'check', label: 'At least 80% on the knowledge check (right first try)', met: !!best && best.right / best.total >= MASTERY_CHECK,
        detail: best ? `Best: ${best.right} of ${best.total}` : 'Not finished yet', review: ['first-law', 'second-law', 'third-law'] },
      { id: 'final', label: 'The final climbing challenge, worked out correctly', met: earned('final-calc') && earned('final-fbd'), review: ['fbd', 'second-law'] },
      { id: 'pair', label: 'An action-reaction pair identified correctly', met: pairs, review: ['third-law'] },
      { id: 'fbd', label: 'Net force shown with a correct free-body diagram', met: fbdIds.some(id => earned(id) && earned('fbd-net', scen[id])), review: ['fbd', 'forces'] }
    ];
    return { mastered: criteria.every(c => c.met), criteria, best };
  }

  function summary() {
    const sections = SECTIONS.map(s => ({ id: s.id, ...sectionState(s.id) }));
    const answered = Object.values(state.questions).filter(r => r.attempts > 0);
    const m = mastery();
    return {
      sections, sectionsDone: sections.filter(s => s.complete).length, sectionsTotal: sections.length,
      complete: sections.every(s => s.complete), mastered: m.mastered, mastery: m,
      questionsAnswered: answered.length, firstTryRight: answered.filter(r => r.firstTry).length,
      hintsUsed: Object.values(state.questions).reduce((n, r) => n + r.hints, 0),
      activeMinutes: Math.round(state.activeMs / 60000), level: state.level, completedAt: state.completedAt
    };
  }

  return {
    get state() { return state; },
    get level() { return state.level; },
    get round() { return state.round; },
    get labConfig() { return { ...state.lab.config }; },
    get saved() { return state.lab.saved.slice(); },
    question, attempt, hint, reveal, done, earned, checkKey, checkScore, bestCheck, mastery, summary, sectionState,
    visit(id) { touch(); if (!state.visited[id]) { state.visited[id] = now(); save(); } },
    setLevel(l) { if (['explore', 'apply', 'engineer'].includes(l)) { state.level = l; save(); } },
    write(id, text) { touch(); state.written[id] = String(text || '').slice(0, 4000); save(); },
    written: id => state.written[id] || '',
    setLabConfig(c) { state.lab.config = normalizeConfig(c); touch(); store.save(storeKey, { ...state, updatedAt: now() }); },
    saveExperiment(c, label) {
      touch();
      state.lab.saved.unshift({ id: 'e' + clock().toString(36), label: String(label || '').slice(0, 60), config: normalizeConfig(c), at: now() });
      state.lab.saved = state.lab.saved.slice(0, MAX_SAVED); save();
    },
    removeExperiment(id) { state.lab.saved = state.lab.saved.filter(e => e.id !== id); save(); },
    retakeCheck() { state.round += 1; save(); },
    onChange(fn) { listeners.push(fn); },
    reset() { state = blank(now()); store.remove ? store.remove(storeKey) : null; save(); }
  };
}
