// Slope & Linear Relationships Lab: session progress.
// Works with no account and no server. By default progress is kept in this
// browser (localStorage). A host application can instead pass its own
// storage and callbacks (see slope-lab.js, mount options), so the lab can
// later report to a student account without changes here.

import { QUESTIONS, OBJECTIVES, LEVELS } from '../content/questions.js';
import { TOPICS, CHALLENGES } from '../content/lessons.js';

const VERSION = 1;
export const SECTIONS = ['intro', 'learn', 'explore', 'practice', 'challenge', 'progress'];

function blank(now) {
  return { version: VERSION, startedAt: now, updatedAt: now, completedAt: null, visited: {}, topics: {}, challenges: {},
           predictions: {}, questions: {}, settings: { units: 'ft' } };
}

// storage: 'local' (default) | 'memory' | { load(key) -> object|null, save(key, object) }
function makeStorage(kind) {
  if (kind && typeof kind === 'object' && typeof kind.load === 'function') return kind;
  if (kind === 'memory') { const mem = {}; return { load: k => mem[k] || null, save: (k, v) => { mem[k] = JSON.parse(JSON.stringify(v)); } }; }
  return {
    load(k) { try { const s = window.localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    save(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode or full: keep going in memory */ } },
    remove(k) { try { window.localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
}

export function createProgress(opts = {}) {
  const now = opts.now || (() => new Date().toISOString());
  const key = 'mathlete-slope-lab:v' + VERSION + ':' + (opts.studentId || 'guest');
  const store = makeStorage(opts.storage);
  const call = (fn, arg) => { try { if (typeof fn === 'function') fn(arg); } catch (e) { if (typeof console !== 'undefined') console.warn('[slope-lab] callback failed', e); } };

  let state = store.load(key);
  if (!state || state.version !== VERSION) state = blank(now());
  if (opts.initial && typeof opts.initial === 'object' && !store.load(key)) state = Object.assign(blank(now()), opts.initial);

  const listeners = [];
  function save() {
    state.updatedAt = now();
    store.save(key, state);
    const s = summary();
    if (!state.completedAt && s.complete) {
      state.completedAt = now(); store.save(key, state);
      s.completedAt = state.completedAt;
      call(opts.onComplete, s);
    }
    call(opts.onProgress, s);
    listeners.forEach(l => l(s));
  }

  function q(id) {
    return state.questions[id] || (state.questions[id] = { attempts: 0, correct: false, firstTry: null, hints: 0, revealed: false, answers: [], lastAt: null });
  }

  // The full record of one attempt, with the question as it was asked.
  function recordAttempt(question, answer, correct, extra = {}) {
    const r = q(question.id);
    if (r.correct || r.revealed) return r.attempts;   // finished questions don't change their record
    r.attempts += 1;
    if (r.attempts === 1) r.firstTry = !!correct;
    if (correct) r.correct = true;
    r.answers.push({ answer, correct: !!correct, at: now(), code: extra.code || null });
    r.lastAt = now();
    call(opts.onAttempt, {
      studentId: opts.studentId || null, module: 'slope-linear-lab', questionId: question.id, set: question.set, level: question.level,
      objective: question.objective, prompt: question.prompt, answer, correct: !!correct, attempt: r.attempts,
      hintsUsed: r.hints, at: r.lastAt
    });
    save();
    return r.attempts;
  }

  function summary() {
    const all = QUESTIONS;
    const rec = id => state.questions[id];
    const tally = list => {
      const t = { total: list.length, attempted: 0, correct: 0, firstTry: 0, moreAttempts: 0, revealed: 0, hints: 0 };
      list.forEach(x => {
        const r = rec(x.id); if (!r || !r.attempts && !r.revealed) return;
        t.attempted++; t.hints += r.hints;
        if (r.correct) t.correct++;
        if (r.firstTry) t.firstTry++;
        if (r.revealed) t.revealed++;
        if (r.correct && !r.firstTry) t.moreAttempts++;
      });
      return t;
    };
    const practice = {}; [1, 2, 3].forEach(l => { practice[l] = Object.assign({ name: LEVELS[l].name }, tally(all.filter(x => x.set === 'practice' && x.level === l))); });
    const transfer = tally(all.filter(x => x.set === 'transfer'));
    const objectives = Object.keys(OBJECTIVES).map(id => {
      const t = tally(all.filter(x => x.objective === id));
      return { id, name: OBJECTIVES[id], attempted: t.attempted, firstTry: t.firstTry, missed: t.attempted - t.firstTry, revealed: t.revealed };
    });
    // One miss is too little to judge: a skill needs 2+ questions tried before it's flagged.
    const needsWork = objectives.filter(o => o.attempted >= 2 && (o.missed / o.attempted) >= 0.5).map(o => o.name);
    const topicsDone = TOPICS.filter(t => state.topics[t.id]).length;
    const challengesDone = CHALLENGES.filter(c => state.challenges[c.id] && state.challenges[c.id].done).length;
    const practiceAttempted = [1, 2, 3].reduce((n, l) => n + practice[l].attempted, 0);
    // Complete = every transfer question tried and at least one practice level fully tried.
    const complete = transfer.attempted === transfer.total && [1, 2, 3].some(l => practice[l].attempted === practice[l].total);
    return {
      module: 'slope-linear-lab', studentId: opts.studentId || null, startedAt: state.startedAt, updatedAt: state.updatedAt, completedAt: state.completedAt,
      visited: Object.assign({}, state.visited),
      topics: { done: topicsDone, total: TOPICS.length }, challenges: { done: challengesDone, total: CHALLENGES.length },
      predictions: { done: Object.keys(state.predictions).length, correct: Object.values(state.predictions).filter(p => p.correct).length },
      practice, practiceAttempted, transfer, objectives, needsWork, complete
    };
  }

  const api = {
    key,
    get state() { return state; },
    summary,
    question: id => state.questions[id] || null,
    visit(section) { if (!state.visited[section]) { state.visited[section] = now(); save(); } },
    topic(id) { if (!state.topics[id]) { state.topics[id] = now(); save(); } },
    challenge(id, detail) { const was = state.challenges[id]; if (!was || !was.done) { state.challenges[id] = Object.assign({ done: true, at: now() }, detail || {}); save(); } },
    prediction(id, choice, correct) { if (!state.predictions[id]) { state.predictions[id] = { choice, correct: !!correct, at: now() }; save(); } },
    hint(question) { const r = q(question.id); if (r.correct || r.revealed) return r.hints; r.hints += 1; save(); return r.hints; },
    reveal(question) { const r = q(question.id); if (!r.correct) { r.revealed = true; if (r.firstTry === null) r.firstTry = false; save(); } },
    recordAttempt,
    setting(k, v) { if (v === undefined) return state.settings[k]; state.settings[k] = v; save(); },
    reset() { state = blank(now()); if (store.remove) store.remove(key); save(); },
    // Clear some questions' records (e.g. one practice level) to try them fresh.
    resetQuestions(ids) { ids.forEach(id => { delete state.questions[id]; }); save(); },
    onChange(fn) { listeners.push(fn); }
  };
  return api;
}
